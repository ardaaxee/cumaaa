import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import {
  normalizeMesh2MotionClipName,
  validateClipLibrary,
  CUMA_REQUIRED_LOCOMOTION_CLIPS,
} from '../src/character/mesh2motionManifest.js';
import { mesh2MotionOptionsFromEnv } from '../src/character/characterAssetConfig.js';
import { prepareMesh2MotionVisual } from '../src/character/mesh2motionRuntime.js';
import { makeClipInPlace } from '../src/character/glbAnimationLoader.js';

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

describe('Mesh2Motion runtime configuration', () => {
  it('does not trigger network loading without an explicit model URL', () => {
    expect(mesh2MotionOptionsFromEnv({})).toBeNull();
  });

  it('parses model, animation bundle and presentation settings', () => {
    expect(mesh2MotionOptionsFromEnv({
      VITE_CUMA_CHARACTER_URL: '/assets/cuma.glb',
      VITE_CUMA_ANIMATION_URLS: '/assets/locomotion.glb, /assets/combat.glb',
      VITE_CUMA_CHARACTER_HEIGHT: '1.86',
      VITE_CUMA_CHARACTER_HEADING: '3.14159',
    })).toEqual({
      modelUrl: '/assets/cuma.glb',
      animationUrls: ['/assets/locomotion.glb', '/assets/combat.glb'],
      targetHeight: 1.86,
      headingOffset: 3.14159,
    });
  });
});

describe('Mesh2Motion visual normalization', () => {
  it('normalizes arbitrary model height and places the feet on the anchor floor', () => {
    const root = new THREE.Group();
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshBasicMaterial());
    root.add(mesh);

    const prepared = prepareMesh2MotionVisual(root, { targetHeight: 1.8 });
    prepared.wrapper.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(prepared.wrapper);
    const size = new THREE.Vector3();
    box.getSize(size);

    expect(size.y).toBeCloseTo(1.8, 5);
    expect(box.min.y).toBeCloseTo(0, 5);
    expect(prepared.animationRoot).toBe(root);
  });

  it('rejects an empty imported scene instead of replacing the fallback', () => {
    expect(() => prepareMesh2MotionVisual(new THREE.Group())).toThrow(/measurable height/);
  });
});

describe('Mesh2Motion in-place animation preparation', () => {
  it('removes horizontal root motion while preserving vertical motion', () => {
    const track = new THREE.VectorKeyframeTrack(
      'Hips.position',
      [0, 0.5, 1],
      [0, 1, 0, 2, 1.2, -3, 5, 0.9, -8],
    );
    const clip = new THREE.AnimationClip('Walk Forward', 1, [track]);
    const prepared = makeClipInPlace(clip);
    const values = Array.from(prepared.tracks[0].values);

    expect(values).toEqual([0, 1, 0, 0, 1.2, 0, 0, 0.9, 0]);
    expect(Array.from(clip.tracks[0].values)).toEqual([0, 1, 0, 2, 1.2, -3, 5, 0.9, -8]);
  });

  it('does not alter non-root bone position tracks', () => {
    const track = new THREE.VectorKeyframeTrack('HandR.position', [0, 1], [0, 0, 0, 1, 2, 3]);
    const clip = new THREE.AnimationClip('Gesture', 1, [track]);
    const prepared = makeClipInPlace(clip);
    expect(Array.from(prepared.tracks[0].values)).toEqual([0, 0, 0, 1, 2, 3]);
  });
});
