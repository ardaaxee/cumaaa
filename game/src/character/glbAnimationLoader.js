import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { normalizeMesh2MotionClipName } from './mesh2motionManifest.js';

const loader = new GLTFLoader();
const ROOT_POSITION_TRACK = /(?:root|hips|pelvis|armature)[^./]*\.position$/i;

function loadGltf(url) {
  return new Promise((resolve, reject) => loader.load(url, resolve, undefined, reject));
}

/**
 * CUMA WORLD owns world-space locomotion. Mesh2Motion clips are therefore used
 * as in-place presentation: horizontal translation on common root/hips tracks
 * is pinned to the authored first key while vertical motion remains intact.
 */
export function makeClipInPlace(clip) {
  const cloned = clip.clone();
  for (const track of cloned.tracks) {
    if (!ROOT_POSITION_TRACK.test(track.name) || track.values.length < 3) continue;
    const x = track.values[0];
    const z = track.values[2];
    for (let i = 0; i + 2 < track.values.length; i += 3) {
      track.values[i] = x;
      track.values[i + 2] = z;
    }
  }
  return cloned;
}

export async function loadMesh2MotionGlb(url, { inPlace = true } = {}) {
  const gltf = await loadGltf(url);
  const clips = new Map();

  for (const clip of gltf.animations ?? []) {
    const normalizedName = normalizeMesh2MotionClipName(clip.name);
    if (!normalizedName || clips.has(normalizedName)) continue;
    const prepared = inPlace ? makeClipInPlace(clip) : clip.clone();
    prepared.name = normalizedName;
    clips.set(normalizedName, prepared);
  }

  return {
    scene: gltf.scene,
    scenes: gltf.scenes ?? [gltf.scene],
    clips,
    raw: gltf,
  };
}

export async function loadMesh2MotionAnimationBundles(urls, options = {}) {
  const library = new Map();
  for (const url of urls) {
    const asset = await loadMesh2MotionGlb(url, options);
    for (const [name, clip] of asset.clips) {
      if (!library.has(name)) library.set(name, clip);
    }
  }
  return library;
}
