import { ATTACKS, COMBAT_RULES, PHASES, resolveTimings } from './attackData.js';
import { recordAttack, selectAttack, shouldFollowUp } from './attackSelector.js';
import { OUTCOME, cancelsAttack, postureLossFor } from './hitResolution.js';
import { createRandom } from '../core/random.js';
import { clamp, rotateTowards } from '../core/mathx.js';

/**
 * The Glass Warden's mind.
 *
 * A pure state machine over plain numbers: no THREE, no DOM, no wall clock. It
 * owns the Warden's position, facing, health, posture and phase, and it never
 * enters an attack's active window without having played a readable wind-up
 * first. The presenter reads this state and draws it; it never writes back.
 */

export const BOSS_STATE = {
  IDLE: 'IDLE',
  APPROACH: 'APPROACH',
  ANTICIPATION: 'ANTICIPATION',
  ATTACK_ACTIVE: 'ATTACK_ACTIVE',
  RECOVERY: 'RECOVERY',
  STAGGER: 'STAGGER',
  PHASE_TRANSITION: 'PHASE_TRANSITION',
};

const TURN_RATE = 3.4;
const ACTIVE_TURN_RATE = 0.5;
/**
 * A lunge stops short of the player rather than passing through them, and far
 * enough short that the Warden's mass never swallows the frame.
 */
const LUNGE_MIN_GAP = 2.9;

export function createBossBrain({ x = 0, z = -54, seed = 0x9a17de2 } = {}) {
  const random = createRandom(seed);

  const brain = {
    state: BOSS_STATE.IDLE,
    /** Seconds spent in the current state. */
    timer: 0,
    /** How long the current state lasts; 0 means "until something else says". */
    duration: 0,

    x,
    z,
    facing: 0,

    hp: 100,
    phase: 1,
    posture: COMBAT_RULES.POSTURE_MAX,
    postureIdle: 0,

    /** The attack being performed, or null. */
    attackId: null,
    /** Increments per attack so an instance can only resolve once. */
    attackInstance: 0,
    attackResolved: false,
    timings: null,
    chainLength: 0,

    cooldowns: {},
    history: [],

    /** Events drained by the presentation layer each frame. */
    events: [],

    engaged: false,
    defeated: false,
  };

  // --- helpers -----------------------------------------------------------

  const emit = (type, data) => {
    brain.events.push(data ? { type, ...data } : { type });
  };

  const enter = (state, duration = 0) => {
    brain.state = state;
    brain.timer = 0;
    brain.duration = duration;
    emit('state', { state, attackId: brain.attackId });
  };

  const modifiers = () => PHASES[brain.phase] ?? PHASES[1];

  const distanceTo = (target) => Math.hypot(target.x - brain.x, target.z - brain.z);

  function faceTarget(target, dt, rate) {
    const desired = Math.atan2(target.x - brain.x, target.z - brain.z);
    brain.facing = rotateTowards(brain.facing, desired, Math.abs(rate * dt));
  }

  function moveToward(target, dt, speed) {
    const dx = target.x - brain.x;
    const dz = target.z - brain.z;
    const distance = Math.hypot(dx, dz);
    if (distance < 1e-4) return;
    const step = Math.min(distance, speed * dt) / distance;
    brain.x += dx * step;
    brain.z += dz * step;
  }

  function tickCooldowns(dt) {
    for (const id in brain.cooldowns) {
      if (brain.cooldowns[id] > 0) {
        brain.cooldowns[id] = Math.max(0, brain.cooldowns[id] - dt);
      }
    }
  }

  function beginAttack(attackId) {
    brain.attackId = attackId;
    brain.attackInstance += 1;
    brain.attackResolved = false;
    brain.timings = resolveTimings(attackId, brain.phase);
    brain.cooldowns[attackId] = ATTACKS[attackId].cooldown;
    recordAttack(brain.history, attackId);
    emit('anticipation', { attackId, instance: brain.attackInstance });
    enter(BOSS_STATE.ANTICIPATION, brain.timings.anticipation);
  }

  /** Tries to start an attack; returns false if none is appropriate here. */
  function tryAttack(target) {
    const attackId = selectAttack(
      {
        distance: distanceTo(target),
        phase: brain.phase,
        history: brain.history,
        cooldowns: brain.cooldowns,
      },
      random,
    );
    if (!attackId) return false;
    beginAttack(attackId);
    return true;
  }

  /** True when the Warden may be interrupted for a phase change. */
  const isInterruptible = () =>
    brain.state === BOSS_STATE.IDLE || brain.state === BOSS_STATE.APPROACH;

  /**
   * Crosses a phase gate if health has fallen past one. Called at the end of a
   * recovery or a stagger, and immediately on damage when the Warden is not
   * mid-attack — so a gate crossed while it is idle does not sit waiting for it
   * to finish a swing it has not started.
   */
  function checkPhaseGate() {
    if (brain.phase === 1 && brain.hp <= COMBAT_RULES.PHASE_TWO_HP) {
      brain.phase = 2;
    } else if (brain.phase === 2 && brain.hp <= COMBAT_RULES.PHASE_THREE_HP) {
      brain.phase = 3;
    } else {
      return false;
    }
    brain.chainLength = 0;
    emit('phase', { phase: brain.phase });
    enter(BOSS_STATE.PHASE_TRANSITION, COMBAT_RULES.PHASE_TRANSITION_DURATION);
    return true;
  }

  function breakPosture() {
    brain.posture = 0;
    brain.attackId = null;
    brain.chainLength = 0;
    emit('postureBreak');
    enter(BOSS_STATE.STAGGER, COMBAT_RULES.STAGGER_DURATION);
  }

  // --- per-state behaviour ------------------------------------------------

  function updateIdle(target, dt) {
    faceTarget(target, dt, TURN_RATE);
    const distance = distanceTo(target);

    // Hold position at a readable distance rather than crowding the player.
    if (distance < COMBAT_RULES.PREFERRED_RANGE_MIN) {
      moveToward({ x: brain.x * 2 - target.x, z: brain.z * 2 - target.z }, dt, COMBAT_RULES.BACK_OFF_SPEED);
    }

    if (brain.timer < brain.duration) return;
    if (tryAttack(target)) return;
    enter(BOSS_STATE.APPROACH);
  }

  function updateApproach(target, dt) {
    faceTarget(target, dt, TURN_RATE);
    const distance = distanceTo(target);
    if (distance > COMBAT_RULES.PREFERRED_RANGE_MIN) {
      moveToward(target, dt, modifiers().approachSpeed);
    }
    // Re-evaluate only on arrival or every beat, never every frame at random.
    if (brain.timer < 0.25) return;
    brain.timer = 0;
    tryAttack(target);
  }

  function updateAnticipation(target, dt) {
    // The Warden can still track during the wind-up, so a wind-up cannot be
    // beaten by simply walking sideways — but it turns slowly enough to read.
    faceTarget(target, dt, TURN_RATE * 0.55);
    if (brain.timer >= brain.duration) {
      emit('attackActive', { attackId: brain.attackId, instance: brain.attackInstance });
      enter(BOSS_STATE.ATTACK_ACTIVE, brain.timings.active);
    }
  }

  function updateActive(target, dt) {
    const attack = ATTACKS[brain.attackId];
    faceTarget(target, dt, ACTIVE_TURN_RATE);

    if (attack.lungeDistance > 0) {
      const speed = attack.lungeDistance / brain.timings.active;
      // Commit along the facing set at the end of the wind-up, but pull up
      // short of the player instead of sliding through them.
      const nextX = brain.x + Math.sin(brain.facing) * speed * dt;
      const nextZ = brain.z + Math.cos(brain.facing) * speed * dt;
      if (Math.hypot(target.x - nextX, target.z - nextZ) > LUNGE_MIN_GAP) {
        brain.x = nextX;
        brain.z = nextZ;
      }
    }

    if (brain.timer >= brain.duration) {
      emit('recovery', { attackId: brain.attackId });
      enter(BOSS_STATE.RECOVERY, brain.timings.recovery);
    }
  }

  function updateRecovery(target, dt) {
    faceTarget(target, dt, TURN_RATE * 0.4);
    if (brain.timer < brain.duration) return;

    brain.attackId = null;
    if (checkPhaseGate()) return;

    if (shouldFollowUp(brain.phase, brain.chainLength, random)) {
      brain.chainLength += 1;
      if (tryAttack(target)) return;
    }
    brain.chainLength = 0;
    enter(BOSS_STATE.IDLE, modifiers().idleBeat);
  }

  function updateStagger(dt) {
    if (brain.timer < brain.duration) return;
    // Posture comes back on its feet, not from zero: the Warden recovers its
    // composure rather than being stun-locked.
    brain.posture = COMBAT_RULES.POSTURE_MAX * 0.55;
    emit('staggerEnd');
    if (checkPhaseGate()) return;
    enter(BOSS_STATE.IDLE, modifiers().idleBeat);
  }

  function updatePhaseTransition() {
    if (brain.timer < brain.duration) return;
    enter(BOSS_STATE.IDLE, modifiers().idleBeat);
  }

  function regeneratePosture(dt) {
    if (brain.state === BOSS_STATE.STAGGER) return;
    if (brain.postureIdle < COMBAT_RULES.POSTURE_REGEN_DELAY) {
      brain.postureIdle += dt;
      return;
    }
    brain.posture = Math.min(
      COMBAT_RULES.POSTURE_MAX,
      brain.posture + COMBAT_RULES.POSTURE_REGEN_PER_SECOND * dt,
    );
  }

  // --- public surface -----------------------------------------------------

  return {
    state: brain,

    get events() {
      return brain.events;
    },

    /** Drains queued events; the presenter calls this once a frame. */
    drainEvents(consumer) {
      for (let i = 0; i < brain.events.length; i += 1) consumer(brain.events[i]);
      brain.events.length = 0;
    },

    engage() {
      brain.engaged = true;
      enter(BOSS_STATE.IDLE, PHASES[1].idleBeat);
    },

    /** True only during the window in which a hit may resolve. */
    get canHit() {
      return brain.state === BOSS_STATE.ATTACK_ACTIVE && !brain.attackResolved;
    },

    /** True while a counter-attack should count for extra posture damage. */
    get isRecovering() {
      return brain.state === BOSS_STATE.RECOVERY || brain.state === BOSS_STATE.STAGGER;
    },

    /** Records that the current attack instance has been answered. */
    markResolved(outcome) {
      if (brain.attackResolved) return;
      brain.attackResolved = true;

      const loss = postureLossFor(brain.attackId, outcome);
      if (loss > 0) {
        brain.posture = clamp(brain.posture - loss, 0, COMBAT_RULES.POSTURE_MAX);
        brain.postureIdle = 0;
      }
      emit('resolved', { outcome, attackId: brain.attackId });

      if (brain.posture <= 0) {
        breakPosture();
        return;
      }
      if (cancelsAttack(outcome)) {
        // A perfect parry throws the Warden straight into recovery, which is
        // the counter-attack window the player earned.
        emit('attackCancelled', { attackId: brain.attackId });
        enter(BOSS_STATE.RECOVERY, brain.timings.recovery * 1.25);
      }
    },

    /** Player damage. `counter` marks a hit landed during recovery or stagger. */
    damage(amount, counter = false) {
      if (!brain.engaged || brain.defeated) return null;
      const applied = counter ? amount * COMBAT_RULES.COUNTER_DAMAGE_MULTIPLIER : amount;
      brain.hp = Math.max(0, brain.hp - applied);

      const postureLoss = counter
        ? COMBAT_RULES.POSTURE_ON_COUNTER_HIT
        : COMBAT_RULES.POSTURE_ON_NORMAL_HIT;
      brain.posture = clamp(brain.posture - postureLoss, 0, COMBAT_RULES.POSTURE_MAX);
      brain.postureIdle = 0;
      emit('damaged', { hp: brain.hp, counter });

      if (brain.hp <= 0) {
        brain.defeated = true;
        brain.attackId = null;
        emit('defeated');
        enter(BOSS_STATE.IDLE, 999);
        return { defeated: true };
      }

      if (brain.posture <= 0 && brain.state !== BOSS_STATE.STAGGER) {
        breakPosture();
        return { staggered: true };
      }
      if (isInterruptible() && checkPhaseGate()) {
        return { phase: brain.phase };
      }
      return null;
    },

    /** One fixed combat step. `target` is `{x, z}`. */
    step(dt, target) {
      if (!brain.engaged || brain.defeated) return;

      brain.timer += dt;
      tickCooldowns(dt);
      regeneratePosture(dt);

      switch (brain.state) {
        case BOSS_STATE.IDLE:
          updateIdle(target, dt);
          break;
        case BOSS_STATE.APPROACH:
          updateApproach(target, dt);
          break;
        case BOSS_STATE.ANTICIPATION:
          updateAnticipation(target, dt);
          break;
        case BOSS_STATE.ATTACK_ACTIVE:
          updateActive(target, dt);
          break;
        case BOSS_STATE.RECOVERY:
          updateRecovery(target, dt);
          break;
        case BOSS_STATE.STAGGER:
          updateStagger(dt);
          break;
        case BOSS_STATE.PHASE_TRANSITION:
          updatePhaseTransition();
          break;
        default:
          enter(BOSS_STATE.IDLE, modifiers().idleBeat);
      }
    },
  };
}

/** Normalised progress through the current state, in [0,1]. */
export function stateProgress(state) {
  if (!(state.duration > 0)) return 0;
  return clamp(state.timer / state.duration, 0, 1);
}
