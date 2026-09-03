/**
 * The combat clock.
 *
 * M01 mixed clocks: the character advanced on hit-stop-scaled time while the
 * parry window counted down on wall time, so at a low frame rate the two
 * disagreed and the same player input could resolve differently.
 *
 * Everything combat now advances through this one accumulator at a fixed step,
 * so an identical logical timeline produces an identical outcome at 60 fps, at
 * 30 fps and on an irregular frame sequence. Rendering still interpolates at
 * whatever rate the device manages.
 */

/** Combat simulates at 120 Hz regardless of the display's frame rate. */
export const COMBAT_STEP = 1 / 120;

/**
 * Guards against the spiral of death: after a long stall we drop the backlog
 * rather than trying to simulate all of it in one frame.
 */
const MAX_STEPS_PER_FRAME = 12;

export function createCombatClock(step = COMBAT_STEP) {
  let accumulator = 0;
  let elapsed = 0;

  return {
    /**
     * Feeds real time in and calls `stepFn(step)` however many whole fixed
     * steps have accrued.
     *
     * @returns {number} how many steps ran, for diagnostics.
     */
    advance(dt, stepFn) {
      if (!(dt > 0)) return 0;
      accumulator += dt;

      let steps = 0;
      while (accumulator >= step) {
        if (steps >= MAX_STEPS_PER_FRAME) {
          // Too far behind to catch up; discard the backlog so combat stays
          // responsive instead of replaying seconds of simulation.
          accumulator = 0;
          break;
        }
        accumulator -= step;
        steps += 1;
        elapsed += step;
        stepFn(step);
      }
      return steps;
    },

    /** Combat time simulated so far, in seconds. */
    get elapsed() {
      return elapsed;
    },

    /** Fraction of a step left over, for presentation interpolation. */
    get alpha() {
      return accumulator / step;
    },

    reset() {
      accumulator = 0;
      elapsed = 0;
    },
  };
}
