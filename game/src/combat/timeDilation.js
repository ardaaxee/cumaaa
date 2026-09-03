/**
 * Hit-stop, as gameplay time dilation.
 *
 * The naive version scales a whole frame while a freeze is pending, which makes
 * the total time a hit-stop consumes depend on how many frames it happens to
 * span — 0.05s of freeze eats 0.05s at 60 fps but 0.067s at 30 fps, and the
 * combat timeline drifts apart between frame rates.
 *
 * This splits each frame into the part still under the freeze and the part
 * after it, so a hit-stop always costs exactly its own duration.
 */

/** How far gameplay time is slowed while a hit-stop is active. */
export const HIT_STOP_SCALE = 0.08;

/**
 * @param {{hitStop:number}} state mutated: the remaining freeze is decremented
 * @param {number} dt real seconds elapsed this frame
 * @param {number} scale gameplay time multiplier during the freeze
 * @returns {number} gameplay seconds to advance the character and combat by
 */
export function applyHitStop(state, dt, scale = HIT_STOP_SCALE) {
  if (!(dt > 0)) return 0;
  if (!(state.hitStop > 0)) return dt;

  const frozen = Math.min(dt, state.hitStop);
  state.hitStop -= frozen;
  return frozen * scale + (dt - frozen);
}
