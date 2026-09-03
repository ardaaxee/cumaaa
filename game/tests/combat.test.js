import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest';
import { BOSS_STATE, createBossBrain, stateProgress } from '../src/combat/bossBrain.js';
import { OUTCOME, postureLossFor, resolveAttack } from '../src/combat/hitResolution.js';
import { recordAttack, selectAttack, shouldFollowUp } from '../src/combat/attackSelector.js';
import { ATTACK, ATTACKS, COMBAT_RULES, resolveTimings } from '../src/combat/attackData.js';
import { createCombatSystem } from '../src/combat/combatSystem.js';
import { createCombatClock, COMBAT_STEP } from '../src/combat/combatClock.js';
import {
  applyDamage,
  consumeParry,
  createPlayerCombat,
  isParryActive,
  pressParry,
  stepPlayerCombat,
} from '../src/combat/playerCombat.js';
import { applyHitStop } from '../src/combat/timeDilation.js';
import { createRandom } from '../src/core/random.js';

const STEP = COMBAT_STEP;

/** A locomotion-shaped stub; the combat core only reads these fields. */
const makeLocomotion = (x = 0, z = 0, overrides = {}) => ({
  position: { x, y: 0, z },
  isInvulnerable: false,
  ...overrides,
});

/** Runs the brain for `seconds` of combat time against a static target. */
function runBrain(brain, seconds, target, onStep) {
  const steps = Math.round(seconds / STEP);
  for (let i = 0; i < steps; i += 1) {
    brain.step(STEP, target);
    if (onStep) onStep(i);
  }
}

describe('attack data', () => {
  test('every attack has a wind-up, an active window and a recovery', () => {
    for (const attack of Object.values(ATTACKS)) {
      expect(attack.anticipation, attack.id).toBeGreaterThan(0);
      expect(attack.active, attack.id).toBeGreaterThan(0);
      expect(attack.recovery, attack.id).toBeGreaterThan(0);
    }
  });

  test('every wind-up is long enough to read', () => {
    for (const attack of Object.values(ATTACKS)) {
      expect(attack.anticipation, attack.id).toBeGreaterThanOrEqual(0.45);
    }
  });

  test('the wind-up is always longer than the active window', () => {
    for (const attack of Object.values(ATTACKS)) {
      expect(attack.anticipation, attack.id).toBeGreaterThan(attack.active);
    }
  });

  test('later phases shorten recovery without making wind-ups unreadable', () => {
    for (const id of Object.keys(ATTACKS)) {
      const one = resolveTimings(id, 1);
      const three = resolveTimings(id, 3);
      expect(three.recovery).toBeLessThan(one.recovery);
      // The tell must survive to phase three.
      expect(three.anticipation).toBeGreaterThan(one.anticipation * 0.8);
    }
  });

  test('the heavy attack cannot be parried and telegraphs longest', () => {
    const heavy = ATTACKS[ATTACK.HEAVY_IMPACT];
    expect(heavy.parryable).toBe(false);
    for (const attack of Object.values(ATTACKS)) {
      expect(heavy.anticipation).toBeGreaterThanOrEqual(attack.anticipation);
    }
  });
});

describe('hit resolution', () => {
  const bossAt = (attackId = ATTACK.WIDE_SWEEP) => ({
    attackId,
    x: 0,
    z: 0,
    facing: 0,
  });

  test('misses a player out of range', () => {
    const outcome = resolveAttack(bossAt(), { x: 0, z: 40, evading: false, parryActive: false, parryAge: 0 });
    expect(outcome).toBe(OUTCOME.MISS);
  });

  test('misses a player outside the attack arc', () => {
    // Facing +Z, the player is directly behind at -Z.
    const outcome = resolveAttack(bossAt(), { x: 0, z: -3, evading: false, parryActive: false, parryAge: 0 });
    expect(outcome).toBe(OUTCOME.MISS);
  });

  test('hits a player standing in front doing nothing', () => {
    const outcome = resolveAttack(bossAt(), { x: 0, z: 3, evading: false, parryActive: false, parryAge: 0 });
    expect(outcome).toBe(OUTCOME.HIT);
  });

  test('a dodge in its evade window avoids the attack', () => {
    const outcome = resolveAttack(bossAt(), { x: 0, z: 3, evading: true, parryActive: false, parryAge: 0 });
    expect(outcome).toBe(OUTCOME.DODGED);
  });

  test('a late parry press is a perfect parry', () => {
    const outcome = resolveAttack(bossAt(), { x: 0, z: 3, evading: false, parryActive: true, parryAge: 0.05 });
    expect(outcome).toBe(OUTCOME.PERFECT_PARRIED);
  });

  test('an early parry press still holds, but is not perfect', () => {
    const outcome = resolveAttack(bossAt(), {
      x: 0,
      z: 3,
      evading: false,
      parryActive: true,
      parryAge: COMBAT_RULES.PERFECT_PARRY_WINDOW + 0.05,
    });
    expect(outcome).toBe(OUTCOME.PARRIED);
  });

  test('the perfect window is strictly narrower than the parry window', () => {
    expect(COMBAT_RULES.PERFECT_PARRY_WINDOW).toBeLessThan(COMBAT_RULES.PARRY_WINDOW);
  });

  test('parrying an unparryable attack does not save the player', () => {
    const outcome = resolveAttack(bossAt(ATTACK.HEAVY_IMPACT), {
      x: 0,
      z: 3,
      evading: false,
      parryActive: true,
      parryAge: 0.01,
    });
    expect(outcome).toBe(OUTCOME.HIT);
  });

  test('an unparryable attack can still be dodged', () => {
    const outcome = resolveAttack(bossAt(ATTACK.HEAVY_IMPACT), {
      x: 0,
      z: 3,
      evading: true,
      parryActive: false,
      parryAge: 0,
    });
    expect(outcome).toBe(OUTCOME.DODGED);
  });

  test('only a perfect parry costs the Warden serious posture', () => {
    const perfect = postureLossFor(ATTACK.WIDE_SWEEP, OUTCOME.PERFECT_PARRIED);
    const normal = postureLossFor(ATTACK.WIDE_SWEEP, OUTCOME.PARRIED);
    expect(perfect).toBeGreaterThan(normal * 2);
    expect(postureLossFor(ATTACK.WIDE_SWEEP, OUTCOME.HIT)).toBe(0);
  });
});

describe('player parry state', () => {
  test('a parry window opens and then closes', () => {
    const state = createPlayerCombat();
    expect(pressParry(state)).toBe(true);
    expect(isParryActive(state)).toBe(true);

    for (let t = 0; t < COMBAT_RULES.PARRY_WINDOW + 0.05; t += STEP) stepPlayerCombat(state, STEP);
    expect(isParryActive(state)).toBe(false);
  });

  test('a parry cannot be re-pressed while one is open', () => {
    const state = createPlayerCombat();
    pressParry(state);
    expect(pressParry(state)).toBe(false);
  });

  test('a parry cannot be spammed through its cooldown', () => {
    const state = createPlayerCombat();
    pressParry(state);
    for (let t = 0; t < COMBAT_RULES.PARRY_WINDOW + 0.01; t += STEP) stepPlayerCombat(state, STEP);
    expect(pressParry(state)).toBe(false);
  });

  test('one parry press cannot answer two attacks', () => {
    const state = createPlayerCombat();
    pressParry(state);
    expect(isParryActive(state)).toBe(true);
    consumeParry(state);
    expect(isParryActive(state)).toBe(false);
  });

  test('being hit closes an open parry', () => {
    const state = createPlayerCombat();
    pressParry(state);
    applyDamage(state, 10);
    expect(isParryActive(state)).toBe(false);
    expect(state.health).toBe(COMBAT_RULES.PLAYER_MAX_HEALTH - 10);
  });

  test('health never goes below zero', () => {
    const state = createPlayerCombat();
    applyDamage(state, 9999);
    expect(state.health).toBe(0);
  });
});

describe('attack selection', () => {
  test('is deterministic for a given seed', () => {
    const pick = (seed) => {
      const random = createRandom(seed);
      const history = [];
      const picks = [];
      for (let i = 0; i < 12; i += 1) {
        const id = selectAttack({ distance: 5, phase: 1, history, cooldowns: {} }, random);
        picks.push(id);
        recordAttack(history, id);
      }
      return picks.join(',');
    };
    expect(pick(1234)).toBe(pick(1234));
  });

  test('different seeds produce different sequences', () => {
    const pick = (seed) => {
      const random = createRandom(seed);
      const history = [];
      const picks = [];
      for (let i = 0; i < 12; i += 1) {
        const id = selectAttack({ distance: 5, phase: 1, history, cooldowns: {} }, random);
        picks.push(id);
        recordAttack(history, id);
      }
      return picks.join(',');
    };
    expect(pick(1)).not.toBe(pick(99999));
  });

  test('never repeats the attack it just used when another is legal', () => {
    const random = createRandom(7);
    const history = [];
    let previous = null;
    for (let i = 0; i < 40; i += 1) {
      const id = selectAttack({ distance: 5, phase: 1, history, cooldowns: {} }, random);
      expect(id).not.toBe(previous);
      recordAttack(history, id);
      previous = id;
    }
  });

  test('respects cooldowns', () => {
    const random = createRandom(3);
    const cooldowns = { [ATTACK.WIDE_SWEEP]: 2, [ATTACK.HEAVY_IMPACT]: 2 };
    // Only forward pressure is off cooldown, and only it reaches this far.
    const id = selectAttack({ distance: 6, phase: 1, history: [], cooldowns }, random);
    expect(id).toBe(ATTACK.FORWARD_PRESSURE);
  });

  test('returns null when nothing is in range', () => {
    const random = createRandom(3);
    expect(selectAttack({ distance: 80, phase: 1, history: [], cooldowns: {} }, random)).toBeNull();
  });

  test('picks only attacks that reach the current distance', () => {
    const random = createRandom(11);
    for (let i = 0; i < 30; i += 1) {
      // At 9m only forward pressure has the range.
      const id = selectAttack({ distance: 9, phase: 1, history: [], cooldowns: {} }, random);
      expect(id).toBe(ATTACK.FORWARD_PRESSURE);
    }
  });

  test('history stays bounded', () => {
    const history = [];
    for (let i = 0; i < 50; i += 1) recordAttack(history, ATTACK.WIDE_SWEEP);
    expect(history.length).toBeLessThanOrEqual(COMBAT_RULES.ATTACK_HISTORY_LENGTH);
  });

  test('phase one never chains, later phases can', () => {
    const random = createRandom(5);
    for (let i = 0; i < 20; i += 1) {
      expect(shouldFollowUp(1, 0, random)).toBe(false);
    }
    let chained = false;
    for (let i = 0; i < 40; i += 1) {
      if (shouldFollowUp(3, 0, random)) chained = true;
    }
    expect(chained).toBe(true);
  });

  test('a chain cannot exceed the phase limit', () => {
    const random = createRandom(5);
    expect(shouldFollowUp(2, 2, random)).toBe(false);
    expect(shouldFollowUp(3, 3, random)).toBe(false);
  });
});

describe('boss state machine', () => {
  let mathRandom;

  beforeEach(() => {
    mathRandom = vi.spyOn(Math, 'random');
  });
  afterEach(() => {
    mathRandom.mockRestore();
  });

  test('does nothing until engaged', () => {
    const brain = createBossBrain({ x: 0, z: 0 });
    runBrain(brain, 3, { x: 0, z: 2 });
    expect(brain.state.state).toBe(BOSS_STATE.IDLE);
    expect(brain.state.attackId).toBeNull();
  });

  test('never uses Math.random, not once across a long fight', () => {
    const brain = createBossBrain({ x: 0, z: 0 });
    brain.engage();
    runBrain(brain, 60, { x: 0, z: 4 });
    expect(mathRandom).not.toHaveBeenCalled();
  });

  test('always plays a wind-up before an attack goes active', () => {
    const brain = createBossBrain({ x: 0, z: 0 });
    brain.engage();

    const seen = [];
    runBrain(brain, 40, { x: 0, z: 4 }, () => {
      const current = brain.state.state;
      if (seen[seen.length - 1] !== current) seen.push(current);
    });

    for (let i = 0; i < seen.length; i += 1) {
      if (seen[i] === BOSS_STATE.ATTACK_ACTIVE) {
        expect(seen[i - 1], 'active must follow anticipation').toBe(BOSS_STATE.ANTICIPATION);
      }
    }
    expect(seen).toContain(BOSS_STATE.ATTACK_ACTIVE);
  });

  test('always passes through recovery after an active window', () => {
    const brain = createBossBrain({ x: 0, z: 0 });
    brain.engage();

    const seen = [];
    runBrain(brain, 40, { x: 0, z: 4 }, () => {
      const current = brain.state.state;
      if (seen[seen.length - 1] !== current) seen.push(current);
    });

    for (let i = 0; i < seen.length - 1; i += 1) {
      if (seen[i] === BOSS_STATE.ATTACK_ACTIVE) {
        expect(seen[i + 1]).toBe(BOSS_STATE.RECOVERY);
      }
    }
  });

  test('canHit is true only during the active window', () => {
    const brain = createBossBrain({ x: 0, z: 0 });
    brain.engage();
    runBrain(brain, 30, { x: 0, z: 4 }, () => {
      if (brain.canHit) expect(brain.state.state).toBe(BOSS_STATE.ATTACK_ACTIVE);
    });
  });

  test('closes distance on a far player', () => {
    const brain = createBossBrain({ x: 0, z: 0 });
    brain.engage();
    runBrain(brain, 6, { x: 0, z: 30 });
    expect(brain.state.z).toBeGreaterThan(3);
  });

  test('does not walk into the player', () => {
    const brain = createBossBrain({ x: 0, z: 0 });
    brain.engage();
    let closest = Infinity;
    runBrain(brain, 30, { x: 0, z: 4 }, () => {
      closest = Math.min(closest, Math.hypot(brain.state.x - 0, brain.state.z - 4));
    });
    // Lunges are allowed to close in, but it must not end up on top of them.
    expect(closest).toBeGreaterThan(0.4);
  });

  test('an attack instance resolves only once', () => {
    const brain = createBossBrain({ x: 0, z: 0 });
    brain.engage();
    runBrain(brain, 40, { x: 0, z: 4 }, () => {
      if (brain.state.state === BOSS_STATE.ATTACK_ACTIVE && brain.canHit) {
        brain.markResolved(OUTCOME.HIT);
        expect(brain.canHit).toBe(false);
        // A second attempt must be a no-op.
        brain.markResolved(OUTCOME.PERFECT_PARRIED);
      }
    });
  });

  test('a perfect parry cancels the attack into recovery', () => {
    const brain = createBossBrain({ x: 0, z: 0 });
    brain.engage();
    let cancelled = false;
    runBrain(brain, 40, { x: 0, z: 4 }, () => {
      if (brain.canHit && !cancelled) {
        brain.markResolved(OUTCOME.PERFECT_PARRIED);
        cancelled = true;
        expect(
          brain.state.state === BOSS_STATE.RECOVERY || brain.state.state === BOSS_STATE.STAGGER,
        ).toBe(true);
      }
    });
    expect(cancelled).toBe(true);
  });

  test('a failed parry does not cancel the attack', () => {
    const brain = createBossBrain({ x: 0, z: 0 });
    brain.engage();
    let checked = false;
    runBrain(brain, 40, { x: 0, z: 4 }, () => {
      if (brain.canHit && !checked) {
        brain.markResolved(OUTCOME.HIT);
        checked = true;
        // The attack runs its active window out; it does not blink to recovery.
        expect(brain.state.state).toBe(BOSS_STATE.ATTACK_ACTIVE);
      }
    });
    expect(checked).toBe(true);
  });
});

describe('posture', () => {
  test('stays bounded under sustained pressure', () => {
    const brain = createBossBrain({ x: 0, z: 0 });
    brain.engage();
    runBrain(brain, 40, { x: 0, z: 4 }, () => {
      if (brain.canHit) brain.markResolved(OUTCOME.PERFECT_PARRIED);
      expect(brain.state.posture).toBeGreaterThanOrEqual(0);
      expect(brain.state.posture).toBeLessThanOrEqual(COMBAT_RULES.POSTURE_MAX);
    });
  });

  test('normal hits barely dent it', () => {
    const brain = createBossBrain({ x: 0, z: 0 });
    brain.engage();
    brain.damage(COMBAT_RULES.ATTACK_DAMAGE, false);
    expect(brain.state.posture).toBeGreaterThan(COMBAT_RULES.POSTURE_MAX * 0.9);
  });

  test('counters during recovery cost far more posture than pokes', () => {
    const poke = createBossBrain({ x: 0, z: 0 });
    poke.engage();
    poke.damage(COMBAT_RULES.ATTACK_DAMAGE, false);

    const counter = createBossBrain({ x: 0, z: 0 });
    counter.engage();
    counter.damage(COMBAT_RULES.ATTACK_DAMAGE, true);

    expect(counter.state.posture).toBeLessThan(poke.state.posture);
  });

  test('one posture break produces exactly one stagger entry', () => {
    const brain = createBossBrain({ x: 0, z: 0 });
    brain.engage();

    // Break it once, then stop applying pressure and watch the whole stagger
    // play out: it must not re-enter while already staggered.
    while (brain.state.posture > 0) brain.damage(1, true);

    let staggerEntries = 0;
    let previous = null;
    runBrain(brain, COMBAT_RULES.STAGGER_DURATION + 2, { x: 0, z: 4 }, () => {
      if (brain.state.state === BOSS_STATE.STAGGER && previous !== BOSS_STATE.STAGGER) {
        staggerEntries += 1;
      }
      previous = brain.state.state;
    });
    expect(staggerEntries).toBe(1);
  });

  test('a further hit while already staggered does not restack the stagger', () => {
    const brain = createBossBrain({ x: 0, z: 0 });
    brain.engage();
    while (brain.state.posture > 0) brain.damage(1, true);
    expect(brain.state.state).toBe(BOSS_STATE.STAGGER);

    const timerBefore = brain.state.timer;
    runBrain(brain, 0.2, { x: 0, z: 4 });
    brain.damage(1, true);
    // The stagger keeps running down rather than restarting from zero.
    expect(brain.state.timer).toBeGreaterThan(timerBefore);
  });

  test('recovers composure after a stagger rather than being stun-locked', () => {
    const brain = createBossBrain({ x: 0, z: 0 });
    brain.engage();
    while (brain.state.posture > 0) brain.damage(1, true);
    expect(brain.state.state).toBe(BOSS_STATE.STAGGER);

    runBrain(brain, COMBAT_RULES.STAGGER_DURATION + 0.2, { x: 0, z: 4 });
    expect(brain.state.state).not.toBe(BOSS_STATE.STAGGER);
    expect(brain.state.posture).toBeGreaterThan(0);
  });
});

describe('phases', () => {
  test('crosses into phase two and three at the health gates', () => {
    const brain = createBossBrain({ x: 0, z: 0 });
    brain.engage();
    expect(brain.state.phase).toBe(1);

    brain.state.hp = COMBAT_RULES.PHASE_TWO_HP + 1;
    brain.damage(2, false);
    runBrain(brain, 3, { x: 0, z: 4 });
    expect(brain.state.phase).toBe(2);

    brain.state.hp = COMBAT_RULES.PHASE_THREE_HP + 1;
    brain.damage(2, false);
    runBrain(brain, 3, { x: 0, z: 4 });
    expect(brain.state.phase).toBe(3);
  });

  test('a phase transition is short, not a cutscene', () => {
    expect(COMBAT_RULES.PHASE_TRANSITION_DURATION).toBeLessThanOrEqual(2);
  });

  test('is defeated at zero health', () => {
    const brain = createBossBrain({ x: 0, z: 0 });
    brain.engage();
    brain.damage(999, false);
    expect(brain.state.defeated).toBe(true);

    runBrain(brain, 5, { x: 0, z: 4 });
    expect(brain.state.attackId).toBeNull();
  });
});

describe('combat clock', () => {
  test('runs whole fixed steps only', () => {
    const clock = createCombatClock();
    let steps = 0;
    clock.advance(STEP * 2.5, () => {
      steps += 1;
    });
    expect(steps).toBe(2);
  });

  test('carries the remainder into the next frame', () => {
    const clock = createCombatClock();
    let steps = 0;
    const count = () => {
      steps += 1;
    };
    clock.advance(STEP * 0.6, count);
    expect(steps).toBe(0);
    clock.advance(STEP * 0.6, count);
    expect(steps).toBe(1);
  });

  test('always advances by exactly the fixed step', () => {
    const clock = createCombatClock();
    clock.advance(0.05, (step) => expect(step).toBe(STEP));
  });

  test('drops the backlog after a long stall instead of spiralling', () => {
    const clock = createCombatClock();
    let steps = 0;
    clock.advance(10, () => {
      steps += 1;
    });
    expect(steps).toBeLessThanOrEqual(12);
  });

  test('ignores a non-positive delta', () => {
    const clock = createCombatClock();
    let steps = 0;
    clock.advance(0, () => {
      steps += 1;
    });
    clock.advance(-1, () => {
      steps += 1;
    });
    expect(steps).toBe(0);
  });
});

describe('hit-stop time dilation', () => {
  test('a frame with no freeze passes through untouched', () => {
    const state = { hitStop: 0 };
    expect(applyHitStop(state, 1 / 60)).toBe(1 / 60);
  });

  test('slows gameplay time while a freeze is pending', () => {
    const state = { hitStop: 0.1 };
    expect(applyHitStop(state, 1 / 60)).toBeLessThan(1 / 60);
  });

  test('a hit-stop costs exactly its own duration at any frame rate', () => {
    // Exact frame counts covering the same 0.5s of real time, so the comparison
    // is not thrown off by an extra partial frame.
    const consumed = (frameDelta, frames) => {
      const state = { hitStop: 0.05 };
      let gameplay = 0;
      for (let i = 0; i < frames; i += 1) gameplay += applyHitStop(state, frameDelta);
      return gameplay;
    };

    const fast = consumed(1 / 120, 60);
    const slow = consumed(1 / 30, 15);
    // Same real time in, same gameplay time out — the freeze does not cost more
    // just because fewer, longer frames spanned it.
    expect(slow).toBeCloseTo(fast, 9);
    // And it is the arithmetic you would expect: 0.05 frozen, 0.45 free.
    expect(fast).toBeCloseTo(0.05 * 0.08 + 0.45, 9);
  });

  test('the freeze fully drains', () => {
    const state = { hitStop: 0.05 };
    for (let i = 0; i < 20; i += 1) applyHitStop(state, 1 / 60);
    expect(state.hitStop).toBe(0);
  });

  test('ignores a non-positive delta', () => {
    const state = { hitStop: 0.05 };
    expect(applyHitStop(state, 0)).toBe(0);
    expect(state.hitStop).toBe(0.05);
  });
});

describe('frame-rate independence', () => {
  /**
   * Drives a full combat system through a frame sequence and returns a
   * fingerprint of everything the player would perceive.
   */
  function simulate(frameDeltas, { parryAtStep = null } = {}) {
    const combat = createCombatSystem({ x: 0, z: 0, seed: 424242 });
    const locomotion = makeLocomotion(0, 4);
    const outcomes = [];
    combat.on((event) => {
      if (event.type === 'outcome') outcomes.push(event.outcome);
    });
    combat.engage();

    let simulated = 0;
    for (const dt of frameDeltas) {
      // Parry is requested at a fixed point on the *combat* timeline, not on a
      // frame index, so the same intent is expressed at every frame rate.
      if (parryAtStep !== null && simulated < parryAtStep && simulated + dt >= parryAtStep) {
        combat.requestParry();
      }
      combat.update(dt, locomotion);
      simulated += dt;
    }

    return {
      outcomes: outcomes.join(','),
      hp: combat.bossState.hp,
      posture: Math.round(combat.bossState.posture * 100) / 100,
      phase: combat.bossState.phase,
      state: combat.bossState.state,
      health: combat.player.health,
    };
  }

  const seconds = 14;
  const at60 = Array.from({ length: seconds * 60 }, () => 1 / 60);
  const at30 = Array.from({ length: seconds * 30 }, () => 1 / 30);
  const irregular = [];
  {
    // A bounded, uneven sequence covering the same total time.
    const wobble = createRandom(2468);
    let total = 0;
    while (total < seconds) {
      const dt = 1 / 90 + wobble() * (1 / 24 - 1 / 90);
      irregular.push(dt);
      total += dt;
    }
  }

  test('produces the same combat timeline at 60 and 30 fps', () => {
    expect(simulate(at30)).toEqual(simulate(at60));
  });

  test('produces the same combat timeline on an irregular frame sequence', () => {
    const a = simulate(at60);
    const b = simulate(irregular);
    expect(b.outcomes).toBe(a.outcomes);
    expect(b.phase).toBe(a.phase);
    expect(b.hp).toBe(a.hp);
  });

  test('a parry at the same moment resolves the same way at any frame rate', () => {
    // Long enough to include an attack; the parry is expressed at the same
    // combat time in each run.
    for (let moment = 1.0; moment < 6.0; moment += 0.5) {
      const a = simulate(at60, { parryAtStep: moment });
      const b = simulate(at30, { parryAtStep: moment });
      expect(b.outcomes, `parry at ${moment}s`).toBe(a.outcomes);
    }
  });

  test('the same fight is reproducible from the same seed', () => {
    expect(simulate(at60)).toEqual(simulate(at60));
  });
});

describe('combat system integration', () => {
  test('an attack cannot damage the player before the wind-up completes', () => {
    const combat = createCombatSystem({ x: 0, z: 0, seed: 99 });
    const locomotion = makeLocomotion(0, 3);
    combat.engage();

    let hits = 0;
    combat.on((event) => {
      if (event.type === 'playerHit') {
        hits += 1;
        // Damage may only ever be dealt from the active window.
        expect(combat.bossState.state).toBe(BOSS_STATE.ATTACK_ACTIVE);
      }
    });

    for (let i = 0; i < 60 * 20; i += 1) combat.update(1 / 60, locomotion);
    expect(hits).toBeGreaterThan(0);
  });

  test('recovery cannot damage the player', () => {
    const combat = createCombatSystem({ x: 0, z: 0, seed: 5 });
    const locomotion = makeLocomotion(0, 3);
    combat.engage();

    combat.on((event) => {
      if (event.type === 'playerHit') {
        expect(combat.bossState.state).not.toBe(BOSS_STATE.RECOVERY);
      }
    });
    for (let i = 0; i < 60 * 20; i += 1) combat.update(1 / 60, locomotion);
  });

  test('a player standing in the evade window is never hit', () => {
    const combat = createCombatSystem({ x: 0, z: 0, seed: 5 });
    const locomotion = makeLocomotion(0, 3, { isInvulnerable: true });
    combat.engage();

    let hits = 0;
    let dodges = 0;
    combat.on((event) => {
      if (event.type === 'playerHit') hits += 1;
      if (event.type === 'outcome' && event.outcome === OUTCOME.DODGED) dodges += 1;
    });
    for (let i = 0; i < 60 * 20; i += 1) combat.update(1 / 60, locomotion);

    expect(hits).toBe(0);
    expect(dodges).toBeGreaterThan(0);
  });

  test('a player who walks away is missed rather than hit', () => {
    const combat = createCombatSystem({ x: 0, z: 0, seed: 5 });
    const locomotion = makeLocomotion(0, 60);
    combat.engage();

    let hits = 0;
    combat.on((event) => {
      if (event.type === 'playerHit') hits += 1;
    });
    for (let i = 0; i < 60 * 5; i += 1) combat.update(1 / 60, locomotion);
    expect(hits).toBe(0);
  });

  test('a counter landed during recovery does more damage than a poke', () => {
    const poke = createCombatSystem({ x: 0, z: 0, seed: 5 });
    poke.engage();
    poke.brain.damage(COMBAT_RULES.ATTACK_DAMAGE, false);

    const counter = createCombatSystem({ x: 0, z: 0, seed: 5 });
    counter.engage();
    counter.brain.damage(COMBAT_RULES.ATTACK_DAMAGE, true);

    expect(counter.bossState.hp).toBeLessThan(poke.bossState.hp);
  });

  test('a player attack out of range whiffs instead of landing', () => {
    const combat = createCombatSystem({ x: 0, z: 0, seed: 5 });
    const locomotion = makeLocomotion(0, 40);
    combat.engage();

    let whiffs = 0;
    let landed = 0;
    combat.on((event) => {
      if (event.type === 'attackWhiffed') whiffs += 1;
      if (event.type === 'playerAttackLanded') landed += 1;
    });
    combat.requestAttack();
    combat.update(1 / 60, locomotion);

    expect(whiffs).toBe(1);
    expect(landed).toBe(0);
  });

  test('state progress stays normalised', () => {
    const brain = createBossBrain({ x: 0, z: 0 });
    brain.engage();
    runBrain(brain, 20, { x: 0, z: 4 }, () => {
      const progress = stateProgress(brain.state);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
    });
  });
});
