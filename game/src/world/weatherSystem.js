import { clamp, smootherstep } from '../core/mathx.js';
import { createRandom } from '../core/random.js';

/**
 * Aster City's weather.
 *
 * A state machine, not a per-frame dice roll: the city holds a state for a
 * while, then blends into the next one over several seconds. Everything it
 * exposes is a plain number, so the presentation layer reads `current` and
 * applies it to fog, rain, wetness and lighting without deciding anything.
 *
 * Pure: no THREE, no DOM, no wall clock.
 */

export const WEATHER = {
  CLEAR_DAY: 'CLEAR_DAY',
  CLOUDY: 'CLOUDY',
  LIGHT_RAIN: 'LIGHT_RAIN',
  HEAVY_RAIN: 'HEAVY_RAIN',
  FOG: 'FOG',
  NIGHT_RAIN: 'NIGHT_RAIN',
};

/**
 * Each state's look, as numbers the world applies directly.
 *
 * skyColor / fogColor   packed 0xRRGGBB, blended channel-wise
 * fogDensity            THREE.FogExp2 density
 * rainDensity           0..1 multiplier on the rain system
 * wetness               0..1; drives road roughness and reflection strength
 * ambient               hemisphere light intensity
 * keyLight              directional key intensity
 * windowLight           0..1 on lit windows and the reflections beneath them
 * skylineFade           0..1; how far the distant city reads through the air
 */
export const WEATHER_STATES = {
  [WEATHER.CLEAR_DAY]: {
    skyColor: 0x5f7ea6,
    fogColor: 0x7d97b8,
    fogDensity: 0.0016,
    rainDensity: 0,
    wetness: 0.08,
    ambient: 3.1,
    keyLight: 2.3,
    windowLight: 0.15,
    skylineFade: 1.0,
    minDuration: 26,
    maxDuration: 48,
  },
  [WEATHER.CLOUDY]: {
    skyColor: 0x33445c,
    fogColor: 0x46586f,
    fogDensity: 0.0028,
    rainDensity: 0,
    wetness: 0.22,
    ambient: 2.6,
    keyLight: 1.5,
    windowLight: 0.45,
    skylineFade: 0.85,
    minDuration: 22,
    maxDuration: 40,
  },
  [WEATHER.LIGHT_RAIN]: {
    skyColor: 0x1d2a3a,
    fogColor: 0x27374a,
    fogDensity: 0.0038,
    rainDensity: 0.45,
    wetness: 0.72,
    ambient: 2.5,
    keyLight: 1.4,
    windowLight: 0.8,
    skylineFade: 0.72,
    minDuration: 20,
    maxDuration: 34,
  },
  [WEATHER.HEAVY_RAIN]: {
    skyColor: 0x141d29,
    fogColor: 0x18222f,
    fogDensity: 0.0062,
    rainDensity: 1.0,
    wetness: 1.0,
    ambient: 2.2,
    keyLight: 1.1,
    windowLight: 1.0,
    skylineFade: 0.5,
    minDuration: 18,
    maxDuration: 30,
  },
  [WEATHER.FOG]: {
    skyColor: 0x2b3644,
    fogColor: 0x3a4756,
    fogDensity: 0.0125,
    rainDensity: 0.08,
    wetness: 0.5,
    ambient: 2.7,
    keyLight: 0.8,
    windowLight: 0.7,
    skylineFade: 0.2,
    minDuration: 18,
    maxDuration: 28,
  },
  [WEATHER.NIGHT_RAIN]: {
    // The slice's signature look: the one M01 and M02 were composed against.
    skyColor: 0x141d29,
    fogColor: 0x18222f,
    fogDensity: 0.0042,
    rainDensity: 0.85,
    wetness: 0.95,
    ambient: 2.6,
    keyLight: 1.5,
    windowLight: 1.0,
    skylineFade: 0.65,
    minDuration: 30,
    maxDuration: 52,
  },
};

/** Which states can follow which. The city never jumps from fog to clear sun. */
const TRANSITIONS = {
  [WEATHER.CLEAR_DAY]: [WEATHER.CLOUDY],
  [WEATHER.CLOUDY]: [WEATHER.CLEAR_DAY, WEATHER.LIGHT_RAIN, WEATHER.FOG],
  [WEATHER.LIGHT_RAIN]: [WEATHER.HEAVY_RAIN, WEATHER.CLOUDY, WEATHER.NIGHT_RAIN],
  [WEATHER.HEAVY_RAIN]: [WEATHER.LIGHT_RAIN, WEATHER.NIGHT_RAIN],
  [WEATHER.FOG]: [WEATHER.CLOUDY, WEATHER.LIGHT_RAIN],
  [WEATHER.NIGHT_RAIN]: [WEATHER.LIGHT_RAIN, WEATHER.HEAVY_RAIN, WEATHER.FOG],
};

const BLEND_KEYS = [
  'fogDensity',
  'rainDensity',
  'wetness',
  'ambient',
  'keyLight',
  'windowLight',
  'skylineFade',
];
const COLOR_KEYS = ['skyColor', 'fogColor'];

const TRANSITION_DURATION = 7.5;

/** Channel-wise blend of two packed 0xRRGGBB colours. */
export function blendColor(from, to, t) {
  const k = clamp(t, 0, 1);
  const fr = (from >> 16) & 0xff;
  const fg = (from >> 8) & 0xff;
  const fb = from & 0xff;
  const tr = (to >> 16) & 0xff;
  const tg = (to >> 8) & 0xff;
  const tb = to & 0xff;
  const r = Math.round(fr + (tr - fr) * k);
  const g = Math.round(fg + (tg - fg) * k);
  const b = Math.round(fb + (tb - fb) * k);
  return (r << 16) | (g << 8) | b;
}

/** Blends two weather states into `out`. Pure and allocation-free. */
export function blendWeather(out, from, to, t) {
  const k = smootherstep(t);
  for (const key of BLEND_KEYS) out[key] = from[key] + (to[key] - from[key]) * k;
  for (const key of COLOR_KEYS) out[key] = blendColor(from[key], to[key], k);
  return out;
}

export function createWeatherSystem({ start = WEATHER.NIGHT_RAIN, seed = 0x5e0a17 } = {}) {
  const random = createRandom(seed);

  let state = start;
  let next = null;
  let hold = 0;
  let holdFor = pickDuration(start);
  let transition = 0;

  const current = {};
  blendWeather(current, WEATHER_STATES[start], WEATHER_STATES[start], 0);

  function pickDuration(id) {
    const definition = WEATHER_STATES[id];
    return definition.minDuration + random() * (definition.maxDuration - definition.minDuration);
  }

  function beginTransition(target) {
    if (!WEATHER_STATES[target] || target === state) return false;
    next = target;
    transition = 0;
    return true;
  }

  return {
    /** The blended values the world should be showing right now. */
    current,

    get state() {
      return state;
    },
    get next() {
      return next;
    },
    get isTransitioning() {
      return next !== null;
    },
    /** 0..1 through the current transition, or 0 when settled. */
    get transitionProgress() {
      return next === null ? 0 : clamp(transition / TRANSITION_DURATION, 0, 1);
    },

    /**
     * Forces a specific state. Used by world events — a sudden downpour is a
     * scripted beat, not a coincidence.
     */
    requestState(target) {
      return beginTransition(target);
    },

    /** Immediately settles on a state, for tests and for world setup. */
    setImmediate(target) {
      if (!WEATHER_STATES[target]) return false;
      state = target;
      next = null;
      transition = 0;
      hold = 0;
      holdFor = pickDuration(target);
      blendWeather(current, WEATHER_STATES[target], WEATHER_STATES[target], 0);
      return true;
    },

    update(dt) {
      if (!(dt > 0)) return current;

      if (next !== null) {
        transition += dt;
        const t = clamp(transition / TRANSITION_DURATION, 0, 1);
        blendWeather(current, WEATHER_STATES[state], WEATHER_STATES[next], t);
        if (t >= 1) {
          state = next;
          next = null;
          transition = 0;
          hold = 0;
          holdFor = pickDuration(state);
        }
        return current;
      }

      // Settled: hold the state for its own duration before choosing a next one,
      // so the sky is never re-rolled frame to frame.
      hold += dt;
      if (hold >= holdFor) {
        const options = TRANSITIONS[state] ?? [];
        if (options.length > 0) {
          beginTransition(options[Math.floor(random() * options.length) % options.length]);
        } else {
          hold = 0;
        }
      }
      return current;
    },
  };
}

/** Legal successors of a state, for tests and tooling. */
export const successorsOf = (id) => TRANSITIONS[id] ?? [];
export const WEATHER_TRANSITION_DURATION = TRANSITION_DURATION;
