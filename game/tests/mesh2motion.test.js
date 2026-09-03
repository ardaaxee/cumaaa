import { describe, expect, it } from 'vitest';
import {
  normalizeMesh2MotionClipName,
  validateClipLibrary,
  CUMA_REQUIRED_LOCOMOTION_CLIPS,
} from '../src/character/mesh2motionManifest.js';

describe('Mesh2Motion compatibility manifest', () => {
  it('normalizes exported names into CUMA WORLD clip ids', () => {
    expect(normalizeMesh2MotionClipName('Walk Forward')).toBe('walk_fwd');
    expect(normalizeMesh2MotionClipName('STRAFE RIGHT')).toBe('strafe_r');
    expect(normalizeMesh2MotionClipName('Perfect Parry')).toBe('perfect_parry');
    expect(normalizeMesh2MotionClipName('Mantle High')).toBe('mantle_high');
  });

  it('keeps unknown animation names deterministic', () => {
    expect(normalizeMesh2MotionClipName('Cuma Hero Pose 01')).toBe('cuma_hero_pose_01');
  });

  it('reports missing required locomotion clips without throwing', () => {
    const library = new Map(CUMA_REQUIRED_LOCOMOTION_CLIPS.slice(0, -1).map((name) => [name, {}]));
    const result = validateClipLibrary(library);
    expect(result.ok).toBe(false);
    expect(result.missing).toEqual(['land']);
  });

  it('accepts a complete locomotion library', () => {
    const library = new Map(CUMA_REQUIRED_LOCOMOTION_CLIPS.map((name) => [name, {}]));
    expect(validateClipLibrary(library)).toEqual({ ok: true, missing: [] });
  });
});
