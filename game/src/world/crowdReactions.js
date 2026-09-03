/**
 * How the district reacts to danger.
 *
 * When the Glass Warden starts throwing its weight around, the market should
 * not keep strolling past. This is the whole reaction model: a threat has a
 * position and an intensity, and each bystander picks a posture from its
 * distance to it. Pure numbers — no THREE, no DOM.
 *
 * People only ever move away. Nothing here injures anyone.
 */

export const REACTION = {
  CALM: 'CALM',
  CURIOUS: 'CURIOUS',
  AVOID: 'AVOID',
  FLEE_AREA: 'FLEE_AREA',
};

/**
 * Radii, in metres, at full threat intensity. They scale down as the threat
 * fades, which is what lets the district settle back to normal on its own.
 */
export const REACTION_RANGE = {
  FLEE: 13,
  AVOID: 24,
  CURIOUS: 42,
};

/** Seconds the district stays uneasy after the threat is gone. */
export const SETTLE_DURATION = 9;

/**
 * @param {number} distance metres from the bystander to the threat
 * @param {number} intensity 0..1; 0 means no threat at all
 */
export function reactionFor(distance, intensity) {
  if (!(intensity > 0)) return REACTION.CALM;
  if (distance <= REACTION_RANGE.FLEE * intensity) return REACTION.FLEE_AREA;
  if (distance <= REACTION_RANGE.AVOID * intensity) return REACTION.AVOID;
  if (distance <= REACTION_RANGE.CURIOUS * intensity) return REACTION.CURIOUS;
  return REACTION.CALM;
}

/** Speed multiplier for a reaction: fleeing is faster, gawking is slower. */
export function speedScaleFor(reaction) {
  switch (reaction) {
    case REACTION.FLEE_AREA:
      return 2.15;
    case REACTION.AVOID:
      return 1.35;
    case REACTION.CURIOUS:
      return 0.45;
    default:
      return 1;
  }
}

/**
 * Tracks how alarmed the district is.
 *
 * Intensity rises the moment a threat appears and decays once it is gone, so
 * the crowd drifts back to calm rather than snapping.
 */
export function createThreatState() {
  return {
    active: false,
    x: 0,
    z: 0,
    /** 0..1 */
    intensity: 0,
    settle: 0,
  };
}

/** Reports a live threat. `strength` lets a boss slam alarm more than a step. */
export function setThreat(state, x, z, strength = 1) {
  state.active = true;
  state.x = x;
  state.z = z;
  state.intensity = Math.max(state.intensity, Math.min(1, strength));
  state.settle = SETTLE_DURATION;
  return state;
}

/** The threat is over; the district begins to settle. */
export function clearThreat(state) {
  state.active = false;
  return state;
}

export function stepThreat(state, dt) {
  if (!(dt > 0)) return state;

  if (state.active) {
    // Hold at full alarm while the threat is present.
    state.settle = SETTLE_DURATION;
    return state;
  }

  if (state.settle > 0) {
    state.settle = Math.max(0, state.settle - dt);
    state.intensity = state.settle / SETTLE_DURATION;
  } else {
    state.intensity = 0;
  }
  return state;
}

/**
 * Where a bystander should head, given a reaction. Returns a unit direction
 * plus whether it wants to face the threat.
 */
export function reactionHeading(out, reaction, agentX, agentZ, threatX, threatZ) {
  const dx = agentX - threatX;
  const dz = agentZ - threatZ;
  const distance = Math.hypot(dx, dz) || 1;

  switch (reaction) {
    case REACTION.FLEE_AREA:
    case REACTION.AVOID:
      // Directly away.
      out.x = dx / distance;
      out.z = dz / distance;
      out.faceThreat = false;
      break;
    case REACTION.CURIOUS:
      // Rooted, watching.
      out.x = 0;
      out.z = 0;
      out.faceThreat = true;
      break;
    default:
      out.x = 0;
      out.z = 0;
      out.faceThreat = false;
  }
  return out;
}
