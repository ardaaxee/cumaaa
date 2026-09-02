/**
 * Small deterministic PRNG (mulberry32).
 *
 * The city is generated from a fixed seed so every capture of the same shot
 * frames the same buildings — a random skyline would make the hero moment
 * impossible to re-record for Instagram.
 */
export function createRandom(seed = 0x5c0ffee) {
  let state = seed >>> 0;
  return function random() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const range = (random, min, max) => min + random() * (max - min);
