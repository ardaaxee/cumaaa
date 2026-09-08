import * as THREE from 'three';
import { clamp, damp, lerp } from '../core/mathx.js';
import { createRandom, range } from '../core/random.js';
import { createGlow } from './textures.js';

/**
 * How wet Aster City looks.
 *
 * There is no reflection pass here and there is not going to be one — this has
 * to run on a phone. The illusion is built from four cheap parts that all move
 * together with the weather's `wetness`:
 *
 *   the road's roughness and metalness       (a wet street is a mirror)
 *   the stretched smears under lit windows   (what that mirror is reflecting)
 *   discrete puddle patches                  (so the sheen is not uniform)
 *   the environment map's contribution       (what the mirror sees of the sky)
 *
 * Dry, the street is matte asphalt. Wet, it holds the whole city.
 */

const PUDDLE_COUNT = 22;

export function createWetSurfaceSystem(scene, { roadMaterials = [], reflectionMesh = null } = {}) {
  const random = createRandom(0x39a7ee);
  const disposables = [];
  const track = (object) => {
    disposables.push(object);
    return object;
  };

  const group = new THREE.Group();
  group.name = 'wetSurfaces';
  scene.add(group);

  // Puddles: flat additive patches that only appear as the street soaks.
  const puddleMaterial = track(
    new THREE.MeshBasicMaterial({
      map: track(createGlow(128)),
      color: 0x6f8dba,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    }),
  );
  const puddleGeometry = track(new THREE.PlaneGeometry(1, 1));
  const puddles = new THREE.InstancedMesh(puddleGeometry, puddleMaterial, PUDDLE_COUNT);
  puddles.instanceMatrix.setUsage(THREE.StaticDrawUsage);
  puddles.renderOrder = 1;

  const dummy = new THREE.Object3D();
  for (let i = 0; i < PUDDLE_COUNT; i += 1) {
    // Clustered along the street and the crossing, where water would collect.
    const alongStreet = random() > 0.35;
    dummy.position.set(
      alongStreet ? range(random, -8.4, 8.4) : range(random, -30, 30),
      0.025,
      alongStreet ? range(random, -70, 70) : range(random, -12, 4),
    );
    dummy.rotation.set(-Math.PI / 2, 0, range(random, 0, Math.PI));
    const width = range(random, 3.0, 9.5);
    dummy.scale.set(width, width * range(random, 0.5, 0.9), 1);
    dummy.updateMatrix();
    puddles.setMatrixAt(i, dummy.matrix);
  }
  puddles.instanceMatrix.needsUpdate = true;
  group.add(puddles);

  // Baseline values, so the system can interpolate rather than assume. A
  // transparent material can be water or glass; treating it as asphalt would
  // make Crown's reflecting pools turn matte when the weather dries.
  const baselines = roadMaterials
    .filter((material) => !material.transparent)
    .map((material) => ({
      material,
      roughness: material.roughness,
      metalness: material.metalness,
      envMapIntensity: material.envMapIntensity ?? 1,
    }));

  const reflectionBase = reflectionMesh?.material?.opacity ?? 0.3;

  let wetness = 1;
  let shown = 1;

  return {
    group,

    /** 0..1 from the weather system. */
    setWetness(value) {
      wetness = clamp(value, 0, 1);
    },

    update(dt) {
      if (!(dt > 0)) return;
      // Streets dry and soak gradually; a step change would look like a bug.
      shown = damp(shown, wetness, 1.4, dt);

      for (const entry of baselines) {
        // Dry asphalt scatters; wet asphalt turns to a dark mirror.
        entry.material.roughness = lerp(0.82, entry.roughness, shown);
        entry.material.metalness = lerp(0.06, entry.metalness, shown);
        entry.material.envMapIntensity = lerp(0.35, entry.envMapIntensity * 1.35, shown);
      }

      // The smeared window reflections only exist on a wet road.
      if (reflectionMesh) {
        reflectionMesh.material.opacity = reflectionBase * shown;
        reflectionMesh.visible = shown > 0.05;
      }

      puddleMaterial.opacity = 0.16 * Math.max(0, shown - 0.25) * (1 / 0.75);
      puddles.visible = shown > 0.28;
    },

    get wetness() {
      return shown;
    },

    dispose() {
      scene.remove(group);
      for (const item of disposables) item.dispose?.();
    },
  };
}
