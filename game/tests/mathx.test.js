import { describe, expect, test } from 'vitest';
import {
  angleDelta,
  applyDeadZone,
  clamp,
  damp,
  dodgeEase,
  rotateTowards,
  smootherstep,
  valueNoise,
} from '../src/core/mathx.js';

describe('clamp', () => {
  test('holds values inside the range untouched', () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5);
  });

  test('clips values outside the range', () => {
    expect(clamp(-3, 0, 1)).toBe(0);
    expect(clamp(9, 0, 1)).toBe(1);
  });
});

describe('damp', () => {
  test('moves toward the target without overshooting', () => {
    const result = damp(0, 10, 8, 1 / 60);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(10);
  });

  test('converges to the same value regardless of step size', () => {
    // Arrange: one big step versus many small ones over the same duration.
    let coarse = 0;
    coarse = damp(coarse, 10, 6, 0.5);

    let fine = 0;
    for (let i = 0; i < 50; i += 1) fine = damp(fine, 10, 6, 0.01);

    // Assert: frame-rate independence, to within floating point noise.
    expect(fine).toBeCloseTo(coarse, 6);
  });

  test('a zero delta leaves the value unchanged', () => {
    expect(damp(3, 10, 8, 0)).toBe(3);
  });
});

describe('angleDelta', () => {
  test('returns the short way around the circle', () => {
    expect(angleDelta(0.1, Math.PI * 2 - 0.1)).toBeCloseTo(-0.2, 6);
  });

  test('never exceeds half a turn', () => {
    for (let i = 0; i < 40; i += 1) {
      const a = (i / 40) * Math.PI * 4 - Math.PI * 2;
      const b = Math.sin(i) * 9;
      expect(Math.abs(angleDelta(a, b))).toBeLessThanOrEqual(Math.PI + 1e-9);
    }
  });
});

describe('rotateTowards', () => {
  test('snaps to the target when the step covers the gap', () => {
    expect(rotateTowards(0, 0.2, 0.5)).toBe(0.2);
  });

  test('takes the short route across the wrap point', () => {
    const result = rotateTowards(0.05, Math.PI * 2 - 0.05, 0.02);
    expect(result).toBeLessThan(0.05);
  });
});

describe('smootherstep', () => {
  test('pins both ends', () => {
    expect(smootherstep(0)).toBe(0);
    expect(smootherstep(1)).toBe(1);
    expect(smootherstep(-4)).toBe(0);
    expect(smootherstep(4)).toBe(1);
  });

  test('is flat at the ends so blends do not pop', () => {
    expect(smootherstep(0.01)).toBeLessThan(0.001);
    expect(smootherstep(0.99)).toBeGreaterThan(0.999);
  });
});

describe('dodgeEase', () => {
  test('spends most of its distance early', () => {
    expect(dodgeEase(0.3)).toBeGreaterThan(0.6);
    expect(dodgeEase(1)).toBeCloseTo(1, 6);
  });

  test('is monotonic', () => {
    let previous = -1;
    for (let t = 0; t <= 1.0001; t += 0.05) {
      const value = dodgeEase(t);
      expect(value).toBeGreaterThanOrEqual(previous);
      previous = value;
    }
  });
});

describe('applyDeadZone', () => {
  test('zeroes input inside the dead zone', () => {
    expect(applyDeadZone(0.1, 0.05, 0.2).magnitude).toBe(0);
  });

  test('preserves stick direction outside the dead zone', () => {
    const result = applyDeadZone(0.8, 0.6, 0.15);
    expect(result.y / result.x).toBeCloseTo(0.6 / 0.8, 6);
  });

  test('never reports a magnitude above one', () => {
    expect(applyDeadZone(1, 1, 0.1).magnitude).toBeLessThanOrEqual(1);
  });
});

describe('valueNoise', () => {
  test('stays inside [-1, 1]', () => {
    for (let i = 0; i < 200; i += 1) {
      const value = valueNoise(i * 0.37);
      expect(value).toBeGreaterThanOrEqual(-1);
      expect(value).toBeLessThanOrEqual(1);
    }
  });

  test('is deterministic', () => {
    expect(valueNoise(12.5)).toBe(valueNoise(12.5));
  });
});
