import { describe, expect, test } from 'vitest';
import { AUDIO_ZONES, createWorldAudio, mixAmbience } from '../src/world/worldAudio.js';
import { WEATHER, WEATHER_STATES } from '../src/world/weatherSystem.js';
import { AFTER_RAIN_TUNING } from '../src/world/afterRainMoment.js';
import { NPC_LOD } from '../src/world/npcSystem.js';
import { WORLD_TUNING } from '../src/world/worldDirector.js';

const heavyRain = { ...WEATHER_STATES[WEATHER.HEAVY_RAIN], state: WEATHER.HEAVY_RAIN };
const clear = { ...WEATHER_STATES[WEATHER.CLEAR_DAY], state: WEATHER.CLEAR_DAY };

const mix = (player, weather, flags) => mixAmbience({}, player, weather, flags);

describe('world audio mixing', () => {
  test('rain is as loud as the rain is heavy', () => {
    const wet = mix({ x: 0, y: 0, z: 0 }, heavyRain);
    const dry = mix({ x: 0, y: 0, z: 0 }, clear);
    expect(wet.rain).toBeGreaterThan(dry.rain);
    expect(dry.rain).toBe(0);
  });

  test('every layer stays within 0..1', () => {
    for (const weather of [heavyRain, clear]) {
      for (const zone of AUDIO_ZONES) {
        const levels = mix({ x: zone.x, y: 0, z: zone.z }, weather, {
          transitRunning: true,
          eventCrowd: true,
        });
        for (const [name, value] of Object.entries(levels)) {
          expect(value, name).toBeGreaterThanOrEqual(0);
          expect(value, name).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  test('a zone gets louder as you walk into it', () => {
    const zone = AUDIO_ZONES[0];
    const far = mix({ x: zone.x + zone.radius * 0.95, y: 0, z: zone.z }, clear);
    const near = mix({ x: zone.x, y: 0, z: zone.z }, clear);
    expect(near[zone.layer]).toBeGreaterThan(far[zone.layer]);
  });

  test('a zone is silent outside its radius', () => {
    const zone = AUDIO_ZONES[1];
    const outside = mix({ x: zone.x + zone.radius + 5, y: 0, z: zone.z }, clear);
    expect(outside[zone.layer]).toBe(0);
  });

  test('rain drowns out the market crowd', () => {
    const zone = AUDIO_ZONES[0];
    const dry = mix({ x: zone.x, y: 0, z: zone.z }, clear);
    const wet = mix({ x: zone.x, y: 0, z: zone.z }, heavyRain);
    expect(wet.marketCrowd).toBeLessThan(dry.marketCrowd);
  });

  test('a passing train is heard beyond the transit mouth', () => {
    const quiet = mix({ x: 0, y: 0, z: 40 }, clear);
    const passing = mix({ x: 0, y: 0, z: 40 }, clear, { transitRunning: true });
    expect(passing.transit).toBeGreaterThan(quiet.transit);
  });

  test('wind takes over above the roofline', () => {
    const street = mix({ x: 0, y: 0, z: 0 }, clear);
    const roof = mix({ x: 0, y: 16, z: 0 }, clear);
    expect(roof.wind).toBeGreaterThan(street.wind);
  });

  test('layers blend rather than cutting between zones', () => {
    const calls = [];
    const audio = { setLayer: (name, weight) => calls.push({ name, weight }) };
    const worldAudio = createWorldAudio(audio);

    const zone = AUDIO_ZONES[0];
    // Start well outside the market, then jump the player into the middle of it.
    for (let i = 0; i < 60; i += 1) {
      worldAudio.update(1 / 60, { x: 200, y: 0, z: 200 }, clear, {});
    }
    const before = worldAudio.current.marketCrowd;

    worldAudio.update(1 / 60, { x: zone.x, y: 0, z: zone.z }, clear, {});
    const afterOneFrame = worldAudio.current.marketCrowd;

    // A teleport into the zone must not slam the layer to full in one frame.
    expect(afterOneFrame - before).toBeLessThan(0.2);

    for (let i = 0; i < 60 * 6; i += 1) {
      worldAudio.update(1 / 60, { x: zone.x, y: 0, z: zone.z }, clear, {});
    }
    expect(worldAudio.current.marketCrowd).toBeGreaterThan(0.5);
  });

  test('only talks to the audio graph when a level actually moves', () => {
    let calls = 0;
    const audio = { setLayer: () => (calls += 1) };
    const worldAudio = createWorldAudio(audio);
    const player = { x: 0, y: 0, z: 0 };

    for (let i = 0; i < 60 * 20; i += 1) worldAudio.update(1 / 60, player, clear, {});
    const settled = calls;
    for (let i = 0; i < 60 * 10; i += 1) worldAudio.update(1 / 60, player, clear, {});

    // Once settled, a steady state should cost almost nothing.
    expect(calls - settled).toBeLessThan(10);
  });

  test('ignores a non-positive delta', () => {
    const audio = { setLayer: () => {} };
    const worldAudio = createWorldAudio(audio);
    const before = { ...worldAudio.current };
    worldAudio.update(0, { x: 0, y: 0, z: 0 }, clear, {});
    expect(worldAudio.current).toEqual(before);
  });

  test('silence drops every bed', () => {
    const audio = { setLayer: () => {} };
    const worldAudio = createWorldAudio(audio);
    for (let i = 0; i < 60 * 10; i += 1) {
      worldAudio.update(1 / 60, { x: 0, y: 0, z: 0 }, heavyRain, {});
    }
    worldAudio.silence();
    for (const value of Object.values(worldAudio.current)) expect(value).toBe(0);
  });
});

describe('level of detail budgets', () => {
  test('NPC tiers are ordered near to far', () => {
    expect(NPC_LOD.NEAR).toBeLessThan(NPC_LOD.MEDIUM);
    expect(NPC_LOD.MEDIUM).toBeLessThan(NPC_LOD.FAR);
  });

  test('further tiers update less often', () => {
    expect(NPC_LOD.MEDIUM_INTERVAL).toBeLessThan(NPC_LOD.FAR_INTERVAL);
    expect(NPC_LOD.MEDIUM_INTERVAL).toBeGreaterThan(0);
  });

  test('the world runs its decisions on a beat, not per frame', () => {
    expect(WORLD_TUNING.SLOW_INTERVAL).toBeGreaterThan(1 / 60);
  });
});

describe('after-rain hero moment tuning', () => {
  test('the shot stages in the open part of the market', () => {
    expect(AFTER_RAIN_TUNING.STAGE_RADIUS).toBeGreaterThan(10);
    expect(Math.abs(AFTER_RAIN_TUNING.STAGE.x)).toBeLessThan(20);
  });

  test('it needs the player actually walking', () => {
    expect(AFTER_RAIN_TUNING.MIN_SPEED).toBeGreaterThan(0);
  });

  test('it waits for the opening cinematic to clear', () => {
    expect(AFTER_RAIN_TUNING.ARM_DELAY).toBeGreaterThan(1);
  });
});
