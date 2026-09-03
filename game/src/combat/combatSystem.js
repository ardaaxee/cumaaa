import { BOSS_STATE, createBossBrain } from './bossBrain.js';
import { ATTACKS, COMBAT_RULES } from './attackData.js';
import { OUTCOME, resolveAttack } from './hitResolution.js';
import { createCombatClock } from './combatClock.js';
import {
  applyDamage,
  consumeParry,
  createPlayerCombat,
  playerSnapshot,
  pressParry,
  stepPlayerCombat,
} from './playerCombat.js';

/**
 * The combat core.
 *
 * Owns the Warden's brain, the player's combat state and the single fixed-step
 * clock they both advance on, and is the one place an attack is resolved. It
 * touches neither THREE nor the DOM: it is handed a locomotion state and emits
 * events, so the whole encounter can be simulated in a test.
 */
export function createCombatSystem({ x, z, seed } = {}) {
  const brain = createBossBrain({ x, z, seed });
  const player = createPlayerCombat();
  const clock = createCombatClock();

  const listeners = [];
  const emit = (event) => {
    for (let i = 0; i < listeners.length; i += 1) listeners[i](event);
  };

  // Reused across steps so the hot path allocates nothing.
  const target = { x: 0, z: 0 };
  let pendingParry = false;
  let pendingAttack = false;

  function resolveIfActive(locomotion) {
    if (!brain.canHit) return;

    const snapshot = playerSnapshot(player, locomotion);
    const outcome = resolveAttack(
      {
        attackId: brain.state.attackId,
        x: brain.state.x,
        z: brain.state.z,
        facing: brain.state.facing,
      },
      snapshot,
    );

    // A miss is not an answer: the attack stays live for the rest of its active
    // window so a player who walks back into it is still caught.
    if (outcome === OUTCOME.MISS) return;

    // Captured before resolving: a resolution that breaks the Warden's posture
    // clears the current attack, and the event should still name it.
    const attackId = brain.state.attackId;
    const instance = brain.state.attackInstance;

    brain.markResolved(outcome);

    if (outcome === OUTCOME.PARRIED || outcome === OUTCOME.PERFECT_PARRIED) {
      consumeParry(player);
    } else if (outcome === OUTCOME.HIT) {
      const attackDamage = ATTACKS[attackId]?.damage ?? 0;
      applyDamage(player, attackDamage);
      emit({ type: 'playerHit', damage: attackDamage, health: player.health });
    }

    emit({
      type: 'outcome',
      outcome,
      attackId,
      instance,
      bossX: brain.state.x,
      bossZ: brain.state.z,
    });
  }

  function stepOnce(dt, locomotion) {
    if (pendingParry) {
      pendingParry = false;
      if (pressParry(player)) emit({ type: 'parryOpened' });
    }

    stepPlayerCombat(player, dt);

    target.x = locomotion.position.x;
    target.z = locomotion.position.z;
    brain.step(dt, target);

    resolveIfActive(locomotion);

    if (pendingAttack) {
      pendingAttack = false;
      applyPlayerAttack(locomotion);
    }

    brain.drainEvents(emit);
  }

  function applyPlayerAttack(locomotion) {
    if (!brain.state.engaged || brain.state.defeated) {
      emit({ type: 'attackWhiffed', reason: 'inactive' });
      return;
    }
    const dx = locomotion.position.x - brain.state.x;
    const dz = locomotion.position.z - brain.state.z;
    if (Math.hypot(dx, dz) > COMBAT_RULES.PLAYER_ATTACK_RANGE) {
      emit({ type: 'attackWhiffed', reason: 'range' });
      return;
    }
    const counter = brain.isRecovering;
    brain.damage(COMBAT_RULES.ATTACK_DAMAGE, counter);
    emit({
      type: 'playerAttackLanded',
      counter,
      hp: brain.state.hp,
      bossX: brain.state.x,
      bossZ: brain.state.z,
    });
  }

  return {
    brain,
    player,
    clock,

    on(listener) {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index !== -1) listeners.splice(index, 1);
      };
    },

    engage() {
      brain.engage();
    },

    /** Queued so input is consumed on a combat step, not on a render frame. */
    requestParry() {
      pendingParry = true;
    },
    requestAttack() {
      pendingAttack = true;
    },

    /**
     * Advances combat by real elapsed time. Everything inside runs at the fixed
     * step, so the outcome does not depend on the frame rate.
     */
    update(dt, locomotion) {
      return clock.advance(dt, (step) => stepOnce(step, locomotion));
    },

    get bossState() {
      return brain.state;
    },
    get isStaggered() {
      return brain.state.state === BOSS_STATE.STAGGER;
    },
  };
}
