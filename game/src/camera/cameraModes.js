import { smootherstep } from '../core/mathx.js';

/**
 * Camera mode definitions.
 *
 * A mode is only a parameter set. Switching modes never assigns a camera
 * position — it retargets these numbers and the rig blends toward them, which is
 * what structurally prevents a camera teleport.
 */

export const MODE = {
  SHOULDER_RIGHT: 'shoulderRight',
  SHOULDER_LEFT: 'shoulderLeft',
  WIDE: 'wide',
  SCENIC: 'scenic',
  LOW_TRACK: 'lowTrack',
  BOSS_FRAME: 'bossFrame',
};

/**
 * distance     metres behind the pivot
 * height       metres above the pivot
 * shoulder     lateral offset; positive puts the character left of frame
 * fov          base field of view in degrees
 * pitchBias    added to the player's pitch
 * pivotLag     follow smoothing rate for position
 * rotationLag  smoothing rate for yaw/pitch
 * sway         hand-held sway multiplier
 * lookHeight   height of the look target above the character's feet
 */
export const CAMERA_MODES = {
  // Distance and look height are set so the whole character stays in frame in
  // 9:16, where the on-screen controls occupy the bottom of the picture.
  [MODE.SHOULDER_RIGHT]: {
    distance: 4.15,
    height: 0.3,
    shoulder: 0.66,
    fov: 55,
    pitchBias: 0.03,
    pivotLag: 9.0,
    rotationLag: 12.0,
    sway: 0.5,
    lookHeight: 1.62,
  },
  [MODE.SHOULDER_LEFT]: {
    distance: 4.15,
    height: 0.3,
    shoulder: -0.66,
    fov: 55,
    pitchBias: 0.03,
    pivotLag: 9.0,
    rotationLag: 12.0,
    sway: 0.5,
    lookHeight: 1.62,
  },
  [MODE.WIDE]: {
    distance: 6.9,
    height: 1.55,
    shoulder: 0.2,
    fov: 62,
    pitchBias: -0.07,
    pivotLag: 5.0,
    rotationLag: 7.5,
    sway: 0.7,
    lookHeight: 1.35,
  },
  [MODE.SCENIC]: {
    distance: 11.5,
    height: 4.6,
    shoulder: 0.5,
    fov: 45,
    pitchBias: -0.13,
    pivotLag: 2.1,
    rotationLag: 2.4,
    sway: 1.0,
    lookHeight: 1.9,
  },
  [MODE.LOW_TRACK]: {
    distance: 4.5,
    height: -0.72,
    shoulder: 0.28,
    fov: 49,
    pitchBias: 0.17,
    pivotLag: 6.2,
    rotationLag: 8.0,
    sway: 0.85,
    lookHeight: 1.7,
  },
  [MODE.BOSS_FRAME]: {
    // Further back than the shoulder: the Warden is a large silhouette and the
    // fight is read from the space between the two of them.
    distance: 7.4,
    height: 1.15,
    shoulder: 0.92,
    fov: 57,
    pitchBias: -0.04,
    pivotLag: 7.0,
    rotationLag: 9.0,
    sway: 0.6,
    lookHeight: 1.6,
  },
};

export const MODE_KEYS = Object.keys(CAMERA_MODES[MODE.SHOULDER_RIGHT]);

/** Blends two parameter sets into `out` without allocating. Pure. */
export function blendParams(out, from, to, t) {
  const k = smootherstep(t);
  for (const key of MODE_KEYS) {
    out[key] = from[key] + (to[key] - from[key]) * k;
  }
  return out;
}

export function cloneParams(source) {
  const out = {};
  for (const key of MODE_KEYS) out[key] = source[key];
  return out;
}
