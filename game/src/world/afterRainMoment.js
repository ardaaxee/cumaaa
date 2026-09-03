import { meridianAfterRainSequence } from '../camera/sequences.js';
import { WEATHER } from './weatherSystem.js';

/**
 * MERIDIAN AFTER RAIN.
 *
 * Waits for the district to be worth looking at rather than for the player to
 * step on a switch: Cuma has to be walking the market, in the open, with the
 * rain easing and the Crown Spire not buried in fog. When all of that lines up
 * the camera takes its twelve seconds and hands itself straight back.
 *
 * It fires once, it never takes control, and it asks the weather to ease rather
 * than forcing the sky — so the shot is composed, not staged.
 */

/** Where in the market the shot reads best: the open crossroads. */
const STAGE = { x: 0, z: -12 };
const STAGE_RADIUS = 26;

/** The player has to actually be walking; a standing shot has no motion. */
const MIN_SPEED = 0.9;

/** Weather the shot is composed for. Heavy rain hides the city it reveals. */
const GOOD_WEATHER = new Set([WEATHER.LIGHT_RAIN, WEATHER.NIGHT_RAIN, WEATHER.CLOUDY]);

/** Seconds of the conditions holding before it commits. */
const SETTLE_REQUIRED = 1.4;

/** Nothing fires until the opening cinematic is well out of the way. */
const ARM_DELAY = 4;

export function createAfterRainMoment(director, world, spireFocus, { onStart, onEnd } = {}) {
  let fired = false;
  let armTimer = 0;
  let settled = 0;
  /** Set once the shot has asked the weather to ease, so it only asks once. */
  let requestedEase = false;

  return {
    get hasFired() {
      return fired;
    },

    reset() {
      fired = false;
      armTimer = 0;
      settled = 0;
      requestedEase = false;
    },

    play() {
      if (fired) return false;
      fired = true;
      onStart?.();
      director.play(meridianAfterRainSequence(spireFocus), {
        retainControl: true,
        onComplete: () => onEnd?.(),
      });
      return true;
    },

    /**
     * @param {number} dt
     * @param {object} player the locomotion state
     */
    update(dt, player) {
      if (fired || !(dt > 0)) return;
      if (director.isPlaying) {
        settled = 0;
        return;
      }

      armTimer += dt;
      if (armTimer < ARM_DELAY) return;

      const dx = player.position.x - STAGE.x;
      const dz = player.position.z - STAGE.z;
      const inPlace = dx * dx + dz * dz <= STAGE_RADIUS * STAGE_RADIUS;
      const moving = player.speed >= MIN_SPEED;

      if (!inPlace || !moving) {
        settled = 0;
        return;
      }

      // In position and walking: ask the sky to ease off, once.
      if (!requestedEase && world.weatherState === WEATHER.HEAVY_RAIN) {
        world.requestWeather(WEATHER.LIGHT_RAIN);
        requestedEase = true;
        settled = 0;
        return;
      }

      // The shot needs the air clear enough to show the spire it reveals.
      if (!GOOD_WEATHER.has(world.weatherState) || world.weather.isTransitioning) {
        settled = 0;
        return;
      }

      settled += dt;
      if (settled >= SETTLE_REQUIRED) this.play();
    },
  };
}

export const AFTER_RAIN_TUNING = { STAGE, STAGE_RADIUS, MIN_SPEED, SETTLE_REQUIRED, ARM_DELAY };
