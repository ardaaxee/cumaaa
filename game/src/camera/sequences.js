import { MODE } from './cameraModes.js';

/**
 * Cinematic sequences, expressed as camera-offset timelines.
 *
 * Every sequence starts and ends at zero offset in a gameplay mode, which is
 * what makes them seamless: there is no frame where the camera is somewhere the
 * gameplay rig could not have put it.
 */

/**
 * The opening. The camera is already high and wide over Meridian Market when the
 * game starts and descends into the shoulder — the player can walk throughout.
 */
export function introSequence(marketCentre) {
  return {
    name: 'intro',
    keyframes: [
      {
        t: 0,
        mode: MODE.SCENIC,
        blend: 0.001,
        yaw: -0.95,
        pitch: -0.3,
        pivotX: 8.5,
        pivotY: 12.5,
        pivotZ: 10.0,
        fov: -3,
        lookWeight: 0.55,
        look: marketCentre,
      },
      {
        t: 2.6,
        mode: MODE.WIDE,
        blend: 2.3,
        yaw: -0.46,
        pitch: -0.14,
        pivotX: 3.4,
        pivotY: 5.0,
        pivotZ: 4.2,
        fov: -1,
        lookWeight: 0.26,
        look: marketCentre,
      },
      {
        t: 5.2,
        mode: MODE.SHOULDER_RIGHT,
        blend: 2.1,
        yaw: -0.13,
        pitch: -0.02,
        pivotX: 0.8,
        pivotY: 1.2,
        pivotZ: 0.9,
        lookWeight: 0.06,
        look: marketCentre,
        alignYaw: 0.45,
      },
      { t: 7.4, alignYaw: 0.9 },
    ],
  };
}

/**
 * ASTER CITY HERO MOMENT — roughly ten seconds.
 *
 * Gameplay shoulder → the rig drifts off the shoulder as Cuma reaches the
 * crossroads → a slow orbit opens the skyline and lands the Crown Spire in
 * frame → the rig drops low and tracks him → it settles back behind him and
 * gameplay simply continues. No cut, no fade, no control lock.
 */
export function heroMomentSequence(crownSpire) {
  return {
    name: 'asterCityHero',
    keyframes: [
      { t: 0, mode: MODE.SHOULDER_RIGHT, blend: 0.8 },
      {
        t: 1.5,
        mode: MODE.WIDE,
        blend: 1.6,
        yaw: 0.52,
        pitch: -0.03,
        pivotY: 0.55,
        lookWeight: 0.3,
        look: crownSpire,
      },
      {
        t: 4.0,
        mode: MODE.SCENIC,
        blend: 2.0,
        yaw: 1.12,
        pitch: -0.06,
        pivotX: -3.2,
        pivotY: 2.9,
        fov: -5,
        lookWeight: 0.7,
        look: crownSpire,
      },
      {
        t: 6.6,
        yaw: 1.46,
        pitch: -0.05,
        pivotX: -4.7,
        pivotY: 3.7,
        fov: -6,
        lookWeight: 0.78,
        look: crownSpire,
      },
      {
        t: 8.2,
        mode: MODE.LOW_TRACK,
        blend: 1.7,
        yaw: 0.46,
        pitch: 0.06,
        pivotY: -0.25,
        fov: -2,
        lookWeight: 0.2,
        look: crownSpire,
        alignYaw: 0.55,
      },
      {
        t: 9.6,
        mode: MODE.SHOULDER_RIGHT,
        blend: 1.5,
        yaw: 0.12,
        alignYaw: 0.9,
      },
      { t: 10.5, alignYaw: 1 },
    ],
  };
}

/**
 * The Glass Warden reveal. Same rules: the rig orbits into boss framing and
 * hands control back without ever cutting.
 */
export function bossRevealSequence(bossPosition) {
  return {
    name: 'bossReveal',
    keyframes: [
      {
        t: 0,
        mode: MODE.BOSS_FRAME,
        blend: 1.5,
        yaw: 0.34,
        pivotY: 0.9,
        lookWeight: 0.55,
        look: bossPosition,
      },
      {
        t: 2.2,
        yaw: 0.78,
        pitch: -0.04,
        pivotX: -1.8,
        pivotY: 1.6,
        fov: -4,
        lookWeight: 0.76,
        look: bossPosition,
      },
      {
        t: 4.0,
        yaw: 0.22,
        pivotY: 0.6,
        lookWeight: 0.36,
        look: bossPosition,
        alignYaw: 0.4,
      },
      { t: 5.3, alignYaw: 0.8 },
    ],
  };
}
