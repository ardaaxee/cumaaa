import { loadMesh2MotionGlb, loadMesh2MotionAnimationBundles } from './glbAnimationLoader.js';
import { validateClipLibrary } from './mesh2motionManifest.js';

/**
 * Loads a Mesh2Motion-exported Cuma character plus optional animation-only GLBs.
 * Nothing is attached to gameplay automatically; callers decide when to swap
 * from the procedural placeholder so loading failures can never break boot.
 */
export async function loadCumaMesh2MotionPackage({ modelUrl, animationUrls = [] }) {
  if (!modelUrl) throw new Error('modelUrl is required');

  const model = await loadMesh2MotionGlb(modelUrl);
  const extraClips = animationUrls.length
    ? await loadMesh2MotionAnimationBundles(animationUrls)
    : new Map();

  const clips = new Map(model.clips);
  for (const [name, clip] of extraClips) {
    if (!clips.has(name)) clips.set(name, clip);
  }

  const validation = validateClipLibrary(clips);
  return {
    root: model.scene,
    clips,
    validation,
    source: 'mesh2motion',
  };
}

export function clipMapToObject(clips) {
  const out = Object.create(null);
  for (const [name, clip] of clips) out[name] = clip;
  return out;
}
