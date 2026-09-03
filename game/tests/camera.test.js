import { describe, expect, test } from 'vitest';
import { CAMERA_MODES, MODE, blendParams, cloneParams } from '../src/camera/cameraModes.js';
import { sampleSequence } from '../src/camera/director.js';
import {
  heroMomentSequence,
  introSequence,
  bossRevealSequence,
  perfectParrySequence,
  phaseTransitionSequence,
} from '../src/camera/sequences.js';
import { HERO_MOMENT } from '../src/core/settings.js';

describe('camera modes', () => {
  test('every mode defines the full parameter set', () => {
    const keys = Object.keys(CAMERA_MODES[MODE.SHOULDER_RIGHT]);
    for (const [name, params] of Object.entries(CAMERA_MODES)) {
      for (const key of keys) {
        expect(typeof params[key], `${name}.${key}`).toBe('number');
      }
    }
  });

  test('the shoulder modes mirror each other', () => {
    const right = CAMERA_MODES[MODE.SHOULDER_RIGHT];
    const left = CAMERA_MODES[MODE.SHOULDER_LEFT];
    expect(left.shoulder).toBeCloseTo(-right.shoulder, 6);
    expect(left.distance).toBe(right.distance);
  });

  test('shoulder framing is actually off-centre', () => {
    expect(Math.abs(CAMERA_MODES[MODE.SHOULDER_RIGHT].shoulder)).toBeGreaterThan(0.3);
  });

  test('the scenic mode sits further back and higher than the shoulder', () => {
    expect(CAMERA_MODES[MODE.SCENIC].distance).toBeGreaterThan(
      CAMERA_MODES[MODE.SHOULDER_RIGHT].distance,
    );
    expect(CAMERA_MODES[MODE.SCENIC].height).toBeGreaterThan(
      CAMERA_MODES[MODE.SHOULDER_RIGHT].height,
    );
  });

  test('the low tracking mode sits below the pivot', () => {
    expect(CAMERA_MODES[MODE.LOW_TRACK].height).toBeLessThan(0);
  });
});

describe('blendParams', () => {
  test('returns the source at t=0 and the destination at t=1', () => {
    const out = cloneParams(CAMERA_MODES[MODE.SHOULDER_RIGHT]);
    const from = CAMERA_MODES[MODE.SHOULDER_RIGHT];
    const to = CAMERA_MODES[MODE.SCENIC];

    blendParams(out, from, to, 0);
    expect(out.distance).toBeCloseTo(from.distance, 6);

    blendParams(out, from, to, 1);
    expect(out.distance).toBeCloseTo(to.distance, 6);
  });

  test('never leaves the interval between the two modes', () => {
    const out = cloneParams(CAMERA_MODES[MODE.SHOULDER_RIGHT]);
    const from = CAMERA_MODES[MODE.SHOULDER_RIGHT];
    const to = CAMERA_MODES[MODE.SCENIC];

    for (let t = 0; t <= 1.0001; t += 0.05) {
      blendParams(out, from, to, t);
      const low = Math.min(from.distance, to.distance);
      const high = Math.max(from.distance, to.distance);
      expect(out.distance).toBeGreaterThanOrEqual(low - 1e-9);
      expect(out.distance).toBeLessThanOrEqual(high + 1e-9);
    }
  });

  test('starts and ends slowly, which is what prevents a visible pop', () => {
    const out = cloneParams(CAMERA_MODES[MODE.SHOULDER_RIGHT]);
    const from = CAMERA_MODES[MODE.SHOULDER_RIGHT];
    const to = CAMERA_MODES[MODE.SCENIC];

    blendParams(out, from, to, 0.02);
    const early = Math.abs(out.distance - from.distance);
    blendParams(out, from, to, 0.5);
    const middle = Math.abs(out.distance - from.distance);

    expect(early).toBeLessThan(middle * 0.05);
  });
});

describe('sampleSequence', () => {
  const keyframes = [
    { t: 0, yaw: 0 },
    { t: 2, yaw: 1, pivotY: 4 },
    { t: 4, yaw: 0 },
  ];

  test('clamps before the first keyframe', () => {
    const out = sampleSequence(keyframes, -1, {});
    expect(out.yaw).toBe(0);
  });

  test('clamps after the last keyframe', () => {
    const out = sampleSequence(keyframes, 99, {});
    expect(out.yaw).toBe(0);
  });

  test('interpolates between keyframes', () => {
    const out = sampleSequence(keyframes, 1, {});
    expect(out.yaw).toBeGreaterThan(0);
    expect(out.yaw).toBeLessThan(1);
  });

  test('treats an omitted field as zero', () => {
    const out = sampleSequence(keyframes, 0.5, {});
    expect(out.fov).toBe(0);
  });

  test('produces a continuous curve with no jumps between samples', () => {
    let previous = sampleSequence(keyframes, 0, {}).yaw;
    for (let t = 0.02; t <= 4; t += 0.02) {
      const value = sampleSequence(keyframes, t, {}).yaw;
      // A jump here would be a visible camera cut.
      expect(Math.abs(value - previous)).toBeLessThan(0.05);
      previous = value;
    }
  });
});

describe('sequences', () => {
  const allSequences = [
    introSequence([0, 1.6, -4]),
    heroMomentSequence([-34, 74, -212]),
    bossRevealSequence([0, 2.4, -54]),
    perfectParrySequence([0, 2.3, -50]),
    phaseTransitionSequence([0, 2.4, -50]),
  ];

  test('every sequence has strictly increasing keyframe times', () => {
    for (const sequence of allSequences) {
      for (let i = 1; i < sequence.keyframes.length; i += 1) {
        expect(sequence.keyframes[i].t).toBeGreaterThan(sequence.keyframes[i - 1].t);
      }
    }
  });

  test('every sequence resolves back to zero offset so gameplay resumes cleanly', () => {
    for (const sequence of allSequences) {
      const last = sequence.keyframes[sequence.keyframes.length - 1];
      const end = sampleSequence(sequence.keyframes, last.t, {});
      for (const field of ['yaw', 'pitch', 'pivotX', 'pivotY', 'pivotZ', 'fov', 'lookWeight']) {
        expect(end[field], `${sequence.name}.${field}`).toBe(0);
      }
    }
  });

  test('the hero moment lasts between eight and twelve seconds', () => {
    const sequence = heroMomentSequence([-34, 74, -212]);
    const duration = sequence.keyframes[sequence.keyframes.length - 1].t;
    expect(duration).toBeGreaterThanOrEqual(8);
    expect(duration).toBeLessThanOrEqual(12);
    expect(duration).toBeCloseTo(HERO_MOMENT.DURATION, 1);
  });

  test('the hero moment starts and ends on the shoulder', () => {
    const sequence = heroMomentSequence([-34, 74, -212]);
    expect(sequence.keyframes[0].mode).toBe(MODE.SHOULDER_RIGHT);

    const modes = sequence.keyframes.filter((k) => k.mode).map((k) => k.mode);
    expect(modes[modes.length - 1]).toBe(MODE.SHOULDER_RIGHT);
  });

  test('the hero moment passes through a wide and a scenic beat', () => {
    const modes = heroMomentSequence([-34, 74, -212])
      .keyframes.filter((k) => k.mode)
      .map((k) => k.mode);
    expect(modes).toContain(MODE.WIDE);
    expect(modes).toContain(MODE.SCENIC);
    expect(modes).toContain(MODE.LOW_TRACK);
  });

  test('the hero moment aligns the camera back behind the player before it ends', () => {
    const sequence = heroMomentSequence([-34, 74, -212]);
    const last = sequence.keyframes[sequence.keyframes.length - 1];
    expect(last.alignYaw).toBe(1);
  });

  test('the perfect-parry hero moment is short enough to stay in gameplay', () => {
    const sequence = perfectParrySequence([0, 2.3, -50]);
    const duration = sequence.keyframes[sequence.keyframes.length - 1].t;
    expect(duration).toBeGreaterThan(2.5);
    expect(duration).toBeLessThanOrEqual(4.5);
  });

  test('a phase transition is contextual motion, not a cutscene', () => {
    const sequence = phaseTransitionSequence([0, 2.4, -50]);
    const duration = sequence.keyframes[sequence.keyframes.length - 1].t;
    expect(duration).toBeLessThanOrEqual(2.5);
  });

  test('both combat sequences start and end in a gameplay boss mode', () => {
    for (const sequence of [perfectParrySequence([0, 2, 0]), phaseTransitionSequence([0, 2, 0])]) {
      const modes = sequence.keyframes.filter((k) => k.mode).map((k) => k.mode);
      expect(modes[0]).toBe(MODE.BOSS_FRAME);
      expect(modes[modes.length - 1]).toBe(MODE.BOSS_FRAME);
    }
  });

  test('every mode referenced by a sequence exists', () => {
    for (const sequence of allSequences) {
      for (const keyframe of sequence.keyframes) {
        if (keyframe.mode) expect(CAMERA_MODES[keyframe.mode]).toBeDefined();
      }
    }
  });

  test('mode blends are long enough to be invisible', () => {
    for (const sequence of allSequences) {
      for (const keyframe of sequence.keyframes) {
        if (!keyframe.mode) continue;
        // The intro's first frame is instant by design: it establishes the shot.
        if (keyframe.t === 0 && sequence.name === 'intro') continue;
        expect(keyframe.blend ?? 1.1).toBeGreaterThanOrEqual(0.8);
      }
    }
  });
});
