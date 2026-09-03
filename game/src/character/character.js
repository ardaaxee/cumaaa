import * as THREE from 'three';
import { createCharacterRig } from './characterRig.js';
import { createAnimationDriver } from './animationDriver.js';
import { createLocomotionState, updateLocomotion } from './locomotionState.js';
import { clamp } from '../core/mathx.js';
import { loadCumaMesh2MotionPackage, clipMapToObject } from './mesh2motionPipeline.js';
import { prepareMesh2MotionVisual, disposeImportedObject } from './mesh2motionRuntime.js';
import { mesh2MotionOptionsFromEnv } from './characterAssetConfig.js';

/**
 * Cuma owns the authoritative movement state. Visual representation is a child
 * of a stable anchor, so switching from the procedural placeholder to a
 * Mesh2Motion GLB never changes gameplay position, facing or camera tracking.
 */
export function createCharacter(scene, { startX = 0, startZ = 26, startFacing = 0, bounds } = {}) {
  const anchor = new THREE.Group();
  anchor.name = 'cuma-character-anchor';

  const placeholderRig = createCharacterRig();
  anchor.add(placeholderRig.root);
  scene.add(anchor);

  let activeRig = placeholderRig;
  let animator = createAnimationDriver(activeRig);
  let importedVisual = null;
  let assetStatus = 'procedural';

  const state = createLocomotionState(startX, startZ, startFacing);
  const frameInput = {
    moveX: 0,
    moveY: 0,
    magnitude: 0,
    sprintHeld: false,
    cameraYaw: 0,
    dodge: false,
    jump: false,
    strafeMode: false,
  };

  function applyBounds() {
    if (!bounds) return;
    state.position.x = clamp(state.position.x, bounds.minX, bounds.maxX);
    state.position.z = clamp(state.position.z, bounds.minZ, bounds.maxZ);
  }

  function stableAssetStatus() {
    return importedVisual ? 'mesh2motion' : 'procedural';
  }

  async function loadMesh2Motion(options) {
    assetStatus = 'loading';
    let pkg = null;
    try {
      pkg = await loadCumaMesh2MotionPackage(options);

      if (!pkg.validation.ok) {
        disposeImportedObject(pkg.root);
        assetStatus = importedVisual ? 'mesh2motion' : 'fallback-missing-clips';
        return {
          activated: false,
          validation: pkg.validation,
          source: pkg.source,
        };
      }

      const clipCount = pkg.clips.size;
      const prepared = prepareMesh2MotionVisual(pkg.root, options);
      const importedRig = {
        root: prepared.animationRoot,
        bones: Object.create(null),
        hipRestHeight: 0,
        dispose() { disposeImportedObject(prepared.animationRoot); },
      };
      const nextAnimator = createAnimationDriver(importedRig, {
        clips: clipMapToObject(pkg.clips),
        animationRoot: prepared.animationRoot,
      });

      // Commit the swap only after every fallible step succeeded.
      animator.dispose();
      if (importedVisual) {
        anchor.remove(importedVisual.wrapper);
        importedVisual.rig.dispose();
      }
      placeholderRig.root.visible = false;
      anchor.add(prepared.wrapper);
      importedVisual = { ...prepared, rig: importedRig };
      activeRig = importedRig;
      animator = nextAnimator;
      assetStatus = 'mesh2motion';
      pkg = null; // ownership transferred to importedVisual

      return {
        activated: true,
        validation: { ok: true, missing: [] },
        source: 'mesh2motion',
        clipCount,
        sourceHeight: prepared.sourceHeight,
        scale: prepared.scale,
      };
    } catch (error) {
      if (pkg?.root) disposeImportedObject(pkg.root);
      assetStatus = stableAssetStatus();
      if (!importedVisual) placeholderRig.root.visible = true;
      throw error;
    }
  }

  const api = {
    state,
    object: anchor,
    get rig() { return activeRig; },
    get animationSource() { return animator.source ?? assetStatus; },
    get assetStatus() { return assetStatus; },
    loadMesh2Motion,

    update(intent, cameraYaw, dt, controlEnabled = true, strafeMode = false) {
      frameInput.moveX = intent.moveX;
      frameInput.moveY = intent.moveY;
      frameInput.magnitude = intent.moveMagnitude;
      frameInput.sprintHeld = intent.sprintHeld;
      frameInput.cameraYaw = cameraYaw;
      frameInput.strafeMode = strafeMode;
      frameInput.dodge = controlEnabled && intent.consume('dodge');
      frameInput.jump = controlEnabled && intent.consume('jump');

      updateLocomotion(state, frameInput, dt);
      applyBounds();

      anchor.position.set(state.position.x, state.position.y, state.position.z);
      anchor.rotation.y = state.facing;
      animator.update(activeRig, state, dt);
    },

    dispose() {
      animator.dispose();
      scene.remove(anchor);
      placeholderRig.dispose();
      if (importedVisual) importedVisual.rig.dispose();
    },
  };

  // No configured URL = no network request and no 404 noise.
  const configuredAsset = mesh2MotionOptionsFromEnv(import.meta.env);
  if (configuredAsset) {
    queueMicrotask(() => {
      api.loadMesh2Motion(configuredAsset).catch(() => {});
    });
  }

  return api;
}
