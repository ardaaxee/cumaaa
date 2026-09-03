/**
 * The Glass Warden's move set, as data.
 *
 * Every timing, range and damage value the boss uses lives here. The state
 * machine reads this table and contains no tuning numbers of its own, so the
 * encounter can be re-balanced without touching behaviour code.
 *
 * All durations are in seconds of *combat clock* time, all ranges in metres.
 */

export const ATTACK = {
  WIDE_SWEEP: 'wideSweep',
  HEAVY_IMPACT: 'heavyImpact',
  FORWARD_PRESSURE: 'forwardPressure',
};

/**
 * anticipation  readable wind-up; the attack cannot hit during this
 * active       the only window in which a hit can resolve
 * recovery     the boss is committed and open to a counter
 * minRange/maxRange   distances at which the boss will choose this attack
 * hitRange     how far the active window actually reaches
 * hitArc       half-angle the attack covers, in radians (PI = all round)
 * parryable    whether a parry can answer it at all
 * cooldown     seconds before this attack may be chosen again
 * weight       relative selection likelihood
 */
export const ATTACKS = {
  [ATTACK.WIDE_SWEEP]: {
    id: ATTACK.WIDE_SWEEP,
    label: 'WIDE SWEEP',
    anticipation: 0.78,
    active: 0.24,
    recovery: 0.72,
    minRange: 0,
    maxRange: 6.6,
    hitRange: 5.4,
    hitArc: Math.PI * 0.62,
    damage: 12,
    parryable: true,
    // Perfect parries cost the Warden real posture; ordinary ones only nudge it.
    postureOnParry: 8,
    postureOnPerfectParry: 26,
    cooldown: 2.2,
    weight: 1.0,
    // The Warden does not travel while sweeping; it plants and turns.
    lungeDistance: 0,
  },

  [ATTACK.HEAVY_IMPACT]: {
    id: ATTACK.HEAVY_IMPACT,
    label: 'HEAVY IMPACT',
    // The longest wind-up in the set: this one is meant to be walked out of.
    anticipation: 1.12,
    active: 0.2,
    recovery: 1.0,
    minRange: 0,
    maxRange: 5.2,
    hitRange: 4.6,
    hitArc: Math.PI,
    damage: 20,
    // Answered by distance or a dodge, never by standing and parrying.
    parryable: false,
    postureOnParry: 0,
    postureOnPerfectParry: 0,
    cooldown: 5.0,
    weight: 0.7,
    lungeDistance: 0,
  },

  [ATTACK.FORWARD_PRESSURE]: {
    id: ATTACK.FORWARD_PRESSURE,
    label: 'FORWARD PRESSURE',
    anticipation: 0.52,
    active: 0.34,
    recovery: 0.58,
    // Chosen from further out — this is how the Warden closes distance.
    minRange: 4.0,
    maxRange: 11.5,
    hitRange: 3.4,
    hitArc: Math.PI * 0.34,
    damage: 10,
    parryable: true,
    postureOnParry: 6,
    postureOnPerfectParry: 22,
    cooldown: 2.8,
    weight: 1.1,
    lungeDistance: 5.6,
  },
};

export const ATTACK_IDS = Object.keys(ATTACKS);

/**
 * Phase modifiers.
 *
 * Later phases deliberately do not just multiply speed. They shorten the
 * Warden's own recovery, add follow-up chains and push harder on distance —
 * the wind-ups stay long enough to read.
 */
export const PHASES = {
  1: {
    anticipationScale: 1.0,
    recoveryScale: 1.0,
    approachSpeed: 1.45,
    // No chaining in phase one: each attack is shown on its own.
    followUpChance: 0,
    maxChain: 1,
    idleBeat: 0.85,
  },
  2: {
    anticipationScale: 0.94,
    recoveryScale: 0.78,
    approachSpeed: 2.0,
    followUpChance: 0.5,
    maxChain: 2,
    idleBeat: 0.55,
  },
  3: {
    // Still readable: the wind-up never drops below ~85% of its phase-one length.
    anticipationScale: 0.86,
    recoveryScale: 0.66,
    approachSpeed: 2.45,
    followUpChance: 0.72,
    maxChain: 3,
    idleBeat: 0.36,
  },
};

/** Combat-wide tuning that is not specific to one attack. */
export const COMBAT_RULES = {
  // Player parry.
  PARRY_WINDOW: 0.32,
  PERFECT_PARRY_WINDOW: 0.13,
  PARRY_COOLDOWN: 0.42,

  // Posture.
  POSTURE_MAX: 100,
  POSTURE_REGEN_PER_SECOND: 5.5,
  POSTURE_REGEN_DELAY: 1.6,
  POSTURE_ON_COUNTER_HIT: 12,
  POSTURE_ON_NORMAL_HIT: 3,
  STAGGER_DURATION: 1.65,

  // Phase gates, kept from the vertical slice.
  PHASE_TWO_HP: 65,
  PHASE_THREE_HP: 30,
  PHASE_TRANSITION_DURATION: 1.35,

  // Player.
  PLAYER_MAX_HEALTH: 100,
  PLAYER_HIT_STUN: 0.34,
  PLAYER_KNOCKBACK: 2.4,

  // The Warden keeps its distance rather than standing inside the player. It is
  // a big silhouette; crowding the camera turns it into a shapeless mass.
  PREFERRED_RANGE_MIN: 3.6,
  PREFERRED_RANGE_MAX: 9.0,
  BACK_OFF_SPEED: 1.6,

  // A counter landed during recovery is worth more than a poke.
  COUNTER_DAMAGE_MULTIPLIER: 1.75,
  ATTACK_DAMAGE: 8,
  /** Cuma's own reach — unrelated to the distance the Warden likes to keep. */
  PLAYER_ATTACK_RANGE: 6.5,

  // Bounded history used for anti-repeat.
  ATTACK_HISTORY_LENGTH: 4,
};

/** Resolved timings for one attack in one phase. Pure. */
export function resolveTimings(attackId, phase) {
  const attack = ATTACKS[attackId];
  const modifiers = PHASES[phase] ?? PHASES[1];
  const anticipation = attack.anticipation * modifiers.anticipationScale;
  const active = attack.active;
  const recovery = attack.recovery * modifiers.recoveryScale;
  return {
    anticipation,
    active,
    recovery,
    total: anticipation + active + recovery,
  };
}
