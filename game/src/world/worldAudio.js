import { clamp, damp } from '../core/mathx.js';
import { WEATHER } from './weatherSystem.js';

/**
 * Aster City's ambience.
 *
 * Works out how loud each continuous bed should be from where the player is and
 * what the weather is doing, then hands those weights to the AudioManager,
 * which cross-fades them. Nothing is ever cut off and restarted: walking from
 * the market to the transit mouth slides one bed up while another slides down.
 *
 * The mixing decision is a pure function of a small state, so it is testable
 * without any audio hardware.
 */

/** Zones inside the market, each pulling its own bed up as you approach. */
export const AUDIO_ZONES = [
  { id: 'market', x: -3.6, z: -1, radius: 22, layer: 'marketCrowd', peak: 1.0 },
  { id: 'transit', x: 6.4, z: -24, radius: 16, layer: 'transit', peak: 0.85 },
  { id: 'lobby', x: -10.4, z: 16, radius: 9, layer: 'indoorMuffle', peak: 0.9 },
];

/** How high up the wind starts to be audible over the street. */
const WIND_HEIGHT = 4.0;

/**
 * Computes every layer's weight. Pure.
 *
 * @param {object} out    reused target, so the hot path allocates nothing
 * @param {object} player `{ x, y, z }`
 * @param {object} weather the blended weather values plus its state id
 * @param {object} flags  `{ transitRunning, eventCrowd }`
 */
export function mixAmbience(out, player, weather, flags = {}) {
  // Rain is simply how hard it is raining.
  out.rain = clamp(weather.rainDensity, 0, 1);

  // The city hum is always there, a little louder when the air is thick.
  out.cityHum = 0.55 + clamp(1 - weather.skylineFade, 0, 1) * 0.35;

  // Distant traffic recedes as the weather closes in.
  out.distantTraffic = 0.35 + clamp(weather.skylineFade, 0, 1) * 0.5;

  out.marketCrowd = 0;
  out.transit = 0;
  out.indoorMuffle = 0;

  for (const zone of AUDIO_ZONES) {
    const distance = Math.hypot(player.x - zone.x, player.z - zone.z);
    // Linear falloff to the zone edge; overlapping zones take the loudest.
    const weight = clamp(1 - distance / zone.radius, 0, 1) * zone.peak;
    if (weight > out[zone.layer]) out[zone.layer] = weight;
  }

  // A crowd event makes the market noticeably busier.
  if (flags.eventCrowd) out.marketCrowd = clamp(out.marketCrowd + 0.35, 0, 1);
  // A train on the line is audible well beyond the transit mouth.
  if (flags.transitRunning) out.transit = clamp(out.transit + 0.55, 0, 1);

  // Wind takes over from street noise as you get above the roofline.
  const height = clamp(((player.y ?? 0) - WIND_HEIGHT) / 12, 0, 1);
  out.wind = 0.25 + height * 0.6 + (weather.rainDensity > 0.6 ? 0.2 : 0);

  // Rain drowns the crowd out.
  const drowning = clamp(weather.rainDensity, 0, 1) * 0.45;
  out.marketCrowd = clamp(out.marketCrowd - drowning, 0, 1);

  return out;
}

/** Layers a fog-bound city should hear less of. */
const FOG_DAMPED = ['distantTraffic', 'marketCrowd'];

export function createWorldAudio(audio) {
  // Smoothed so a zone edge is a slide, not a step.
  const target = {
    rain: 0,
    cityHum: 0,
    distantTraffic: 0,
    marketCrowd: 0,
    transit: 0,
    wind: 0,
    indoorMuffle: 0,
  };
  const current = { ...target };
  const sent = { ...target };

  return {
    current,

    /**
     * @param {object} weather blended weather values, plus `state`
     */
    update(dt, player, weather, flags) {
      if (!(dt > 0)) return current;

      mixAmbience(target, player, weather, flags);

      if (weather.state === WEATHER.FOG) {
        for (const key of FOG_DAMPED) target[key] *= 0.6;
      }

      for (const key in target) {
        current[key] = damp(current[key], target[key], 1.6, dt);
        // Only talk to the audio graph when a level has actually moved; each
        // call schedules a ramp, and scheduling one per frame is waste.
        if (Math.abs(current[key] - sent[key]) > 0.02) {
          sent[key] = current[key];
          audio.setLayer(key, current[key], 0.6);
        }
      }
      return current;
    },

    /** Silences every bed, for teardown. */
    silence() {
      for (const key in current) {
        current[key] = 0;
        sent[key] = 0;
        audio.setLayer(key, 0, 0.3);
      }
    },
  };
}
