import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { normalizeMesh2MotionClipName } from './mesh2motionManifest.js';

const loader = new GLTFLoader();

function loadGltf(url) {
  return new Promise((resolve, reject) => loader.load(url, resolve, undefined, reject));
}

export async function loadMesh2MotionGlb(url) {
  const gltf = await loadGltf(url);
  const clips = new Map();

  for (const clip of gltf.animations ?? []) {
    const normalizedName = normalizeMesh2MotionClipName(clip.name);
    if (!normalizedName || clips.has(normalizedName)) continue;
    const cloned = clip.clone();
    cloned.name = normalizedName;
    clips.set(normalizedName, cloned);
  }

  return {
    scene: gltf.scene,
    scenes: gltf.scenes ?? [gltf.scene],
    clips,
    raw: gltf,
  };
}

export async function loadMesh2MotionAnimationBundles(urls) {
  const library = new Map();
  for (const url of urls) {
    const asset = await loadMesh2MotionGlb(url);
    for (const [name, clip] of asset.clips) {
      if (!library.has(name)) library.set(name, clip);
    }
  }
  return library;
}
