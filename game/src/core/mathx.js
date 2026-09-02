/**
 * Pure, allocation-free math helpers shared by the locomotion and camera
 * systems. Everything here is framerate-independent and unit tested.
 */

export const clamp = (value, min, max) => (value < min ? min : value > max ? max : value);

/**
 * Frame-rate independent exponential smoothing.
 * `lambda` is the rate: higher converges faster. dt in seconds.
 */
export const damp = (current, target, lambda, dt) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));

/** Shortest signed angular difference from `a` to `b`, in (-PI, PI]. */
export const angleDelta = (a, b) => {
  let delta = (b - a) % (Math.PI * 2);
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
};

/** Rotate `current` toward `target` by at most `maxStep` radians. */
export const rotateTowards = (current, target, maxStep) => {
  const delta = angleDelta(current, target);
  if (Math.abs(delta) <= maxStep) return target;
  return current + Math.sign(delta) * maxStep;
};

export const lerp = (a, b, t) => a + (b - a) * t;

/** Smootherstep — zero first and second derivatives at both ends. */
export const smootherstep = (t) => {
  const x = clamp(t, 0, 1);
  return x * x * x * (x * (x * 6 - 15) + 10);
};

/** Ease used for dodge displacement: fast out, settled landing. */
export const dodgeEase = (t) => {
  const x = clamp(t, 0, 1);
  return 1 - Math.pow(1 - x, 3);
};

/** Radial dead zone for a 2D analog stick; preserves direction. */
export const applyDeadZone = (x, y, deadZone) => {
  const magnitude = Math.hypot(x, y);
  if (magnitude <= deadZone) return { x: 0, y: 0, magnitude: 0 };
  const scaled = (magnitude - deadZone) / (1 - deadZone);
  const normalised = Math.min(1, scaled) / magnitude;
  return { x: x * normalised, y: y * normalised, magnitude: Math.min(1, scaled) };
};

/** Deterministic, allocation-free 1D value noise for camera sway. */
export const valueNoise = (t) => {
  const i = Math.floor(t);
  const f = t - i;
  const h = (n) => {
    const s = Math.sin(n * 127.1) * 43758.5453;
    return s - Math.floor(s);
  };
  const smooth = f * f * (3 - 2 * f);
  return lerp(h(i), h(i + 1), smooth) * 2 - 1;
};
