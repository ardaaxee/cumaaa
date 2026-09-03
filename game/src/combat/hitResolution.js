import { ATTACKS, COMBAT_RULES } from './attackData.js';
import { angleDelta } from '../core/mathx.js';

/**
 * The one authoritative place an attack is resolved against the player.
 *
 * It is a pure function of two snapshots, so the same situation always produces
 * the same outcome and every case is directly testable. It decides *what
 * happened* and nothing about how it looks — the presentation layer reads the
 * outcome and never re-decides it.
 */

export const OUTCOME = {
  HIT: 'HIT',
  DODGED: 'DODGED',
  PARRIED: 'PARRIED',
  PERFECT_PARRIED: 'PERFECT_PARRIED',
  MISS: 'MISS',
};

/**
 * @param {object} attackState
 *   attackId   which attack is resolving
 *   phase      the boss state; a hit may only resolve from ATTACK_ACTIVE
 *   x, z       the boss's position
 *   facing     the boss's yaw
 * @param {object} player
 *   x, z          position
 *   evading       inside the dodge's evade window
 *   parryActive   a parry window is open
 *   parryAge      seconds since the parry was pressed
 * @returns {string} one of OUTCOME
 */
export function resolveAttack(attackState, player) {
  const attack = ATTACKS[attackState.attackId];
  if (!attack) return OUTCOME.MISS;

  const dx = player.x - attackState.x;
  const dz = player.z - attackState.z;
  const distance = Math.hypot(dx, dz);

  // Out of reach, or outside the arc the attack actually covers.
  if (distance > attack.hitRange) return OUTCOME.MISS;
  if (attack.hitArc < Math.PI) {
    const angleToPlayer = Math.atan2(dx, dz);
    if (Math.abs(angleDelta(attackState.facing, angleToPlayer)) > attack.hitArc) {
      return OUTCOME.MISS;
    }
  }

  // Invulnerability frames beat everything: a dodge is the universal answer.
  if (player.evading) return OUTCOME.DODGED;

  if (attack.parryable && player.parryActive) {
    // A parry pressed at the last moment is perfect; an early one still holds,
    // it just earns less. Pressing too early means the window has already shut,
    // which is handled by `parryActive` being false by then.
    return player.parryAge <= COMBAT_RULES.PERFECT_PARRY_WINDOW
      ? OUTCOME.PERFECT_PARRIED
      : OUTCOME.PARRIED;
  }

  return OUTCOME.HIT;
}

/** Whether an outcome means the player avoided damage. */
export const isAvoided = (outcome) => outcome !== OUTCOME.HIT;

/** Whether an outcome should interrupt the attack that caused it. */
export const cancelsAttack = (outcome) => outcome === OUTCOME.PERFECT_PARRIED;

/** Posture the Warden loses for a given outcome on a given attack. */
export function postureLossFor(attackId, outcome) {
  const attack = ATTACKS[attackId];
  if (!attack) return 0;
  if (outcome === OUTCOME.PERFECT_PARRIED) return attack.postureOnPerfectParry;
  if (outcome === OUTCOME.PARRIED) return attack.postureOnParry;
  return 0;
}
