import * as THREE from 'three';
import { createRandom, range } from '../core/random.js';
import { createReflectionStreak, createWetRoadRoughness } from './textures.js';
import { createMeridianMarket } from './meridianMarket.js';

/**
 * Aster City — Meridian Market, night, rain.
 *
 * The legacy block layout is preserved; what is added is wetness, warm interior
 * light, reflection smears on the road and foreground silhouettes for the hero
 * moment to sweep past. Deliberately restrained: no neon walls, no bloom bath.
 */

const STREET_HALF_WIDTH = 9;
const BLOCK_SPACING = 11;
const BLOCK_MIN_Z = -74;
const BLOCK_MAX_Z = 74;
const MAX_WINDOWS = 1100;

// Warm interior lights only — the palette stays sodium/amber, never magenta.
const WINDOW_COLORS = [0xffd9a0, 0xffc98a, 0xf6e3c0, 0xffbe78];

export function createAsterCity(scene) {
  const random = createRandom(0x63756d61);
  const disposables = [];
  const colliders = [];
  const group = new THREE.Group();
  group.name = 'asterCity';
  scene.add(group);

  const track = (object) => {
    disposables.push(object);
    return object;
  };

  // --- Ground and street -------------------------------------------------
  const groundMaterial = track(
    new THREE.MeshStandardMaterial({ color: 0x0d1116, roughness: 0.82, metalness: 0.1 }),
  );
  // Wide enough that its edge never appears past the fog, even from the scenic
  // camera during the hero moment.
  const ground = new THREE.Mesh(track(new THREE.PlaneGeometry(900, 900)), groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  group.add(ground);

  const roadRoughness = track(createWetRoadRoughness());
  const streetMaterial = track(
    new THREE.MeshStandardMaterial({
      color: 0x080b10,
      roughness: 0.24,
      roughnessMap: roadRoughness,
      metalness: 0.62,
    }),
  );
  const street = new THREE.Mesh(
    track(new THREE.PlaneGeometry(STREET_HALF_WIDTH * 2, 190)),
    streetMaterial,
  );
  street.rotation.x = -Math.PI / 2;
  street.position.y = 0.012;
  street.receiveShadow = true;
  group.add(street);

  // The crossroads the hero moment opens onto.
  const crossStreet = new THREE.Mesh(
    track(new THREE.PlaneGeometry(120, STREET_HALF_WIDTH * 2)),
    streetMaterial,
  );
  crossStreet.rotation.x = -Math.PI / 2;
  crossStreet.position.set(0, 0.013, -4);
  group.add(crossStreet);

  // --- Blocks ------------------------------------------------------------
  const facadeMaterial = track(
    new THREE.MeshStandardMaterial({ color: 0x2b3440, roughness: 0.68, metalness: 0.18 }),
  );
  const facadeDark = track(
    new THREE.MeshStandardMaterial({ color: 0x212932, roughness: 0.74, metalness: 0.14 }),
  );

  const windowTransforms = [];
  const windowColors = [];

  for (let z = BLOCK_MIN_Z; z < BLOCK_MAX_Z; z += BLOCK_SPACING) {
    for (const side of [-1, 1]) {
      // The crossroads stays open so the skyline is visible from it.
      if (z > -14 && z < 6) continue;

      const height = range(random, 8, 30);
      const width = range(random, 9, 16);
      const depth = range(random, 7, 15);
      const x = side * (STREET_HALF_WIDTH + 4 + range(random, 0, 7));

      const block = new THREE.Mesh(
        track(new THREE.BoxGeometry(width, height, depth)),
        random() > 0.5 ? facadeMaterial : facadeDark,
      );
      block.position.set(x, height / 2, z + range(random, -2, 2));
      block.castShadow = true;
      block.receiveShadow = true;
      group.add(block);
      colliders.push(block);

      // A setback tier on the taller blocks breaks the boxy silhouette.
      if (height > 20) {
        const tierHeight = range(random, 3, 8);
        const tier = new THREE.Mesh(
          track(new THREE.BoxGeometry(width * 0.62, tierHeight, depth * 0.62)),
          facadeDark,
        );
        tier.position.set(block.position.x, height + tierHeight / 2, block.position.z);
        group.add(tier);
      }

      collectWindows(
        random,
        windowTransforms,
        windowColors,
        block.position,
        width,
        height,
        depth,
        -side,
      );
    }
  }

  const windows = buildWindows(windowTransforms, windowColors, track);
  if (windows) group.add(windows);

  const streaks = buildReflectionStreaks(windowTransforms, track);
  if (streaks) group.add(streaks);

  // The market's own layered detail: alleys, plaza, stalls, stairs, balconies,
  // the footbridge and every doorway that hints at an interior.
  const market = createMeridianMarket(scene);
  for (const collider of market.colliders) colliders.push(collider);

  // --- Foreground silhouettes -------------------------------------------
  // Unlit pillars and awnings close to the street. During the hero orbit they
  // pass between the camera and the city and read as natural wipes.
  const silhouetteMaterial = track(
    new THREE.MeshStandardMaterial({ color: 0x0d131b, roughness: 0.9, metalness: 0.0 }),
  );
  const pillarGeometry = track(new THREE.BoxGeometry(0.5, 6.4, 0.5));
  const awningGeometry = track(new THREE.BoxGeometry(3.6, 0.16, 1.9));

  for (let i = 0; i < 22; i += 1) {
    const side = i % 2 === 0 ? -1 : 1;
    const z = BLOCK_MIN_Z + 6 + i * 6.4;
    const x = side * (STREET_HALF_WIDTH - range(random, 0.4, 1.6));

    const pillar = new THREE.Mesh(pillarGeometry, silhouetteMaterial);
    pillar.position.set(x, 3.2, z);
    group.add(pillar);
    colliders.push(pillar);

    if (random() > 0.45) {
      const awning = new THREE.Mesh(awningGeometry, silhouetteMaterial);
      awning.position.set(x + side * -1.4, range(random, 2.6, 3.4), z);
      awning.rotation.z = side * 0.09;
      group.add(awning);
    }
  }

  // --- Lighting ----------------------------------------------------------
  // Cool overcast sky bounce, one soft key. A rain-night city is mostly
  // ambient light: the sky is the brightest thing in it.
  const hemisphere = new THREE.HemisphereLight(0x9db8dc, 0x141a22, 2.6);
  scene.add(hemisphere);

  const key = new THREE.DirectionalLight(0xc8daf5, 1.5);
  key.position.set(-24, 40, 14);
  scene.add(key);

  // A cool back-fill separates silhouettes from the buildings behind them.
  const rim = new THREE.DirectionalLight(0x7f9dc4, 0.85);
  rim.position.set(18, 14, -30);
  scene.add(rim);

  // Warm street-level fills at the market and the crossroads. Sodium, not neon.
  const streetFill = new THREE.PointLight(0xffb877, 26, 54, 2);
  streetFill.position.set(3.5, 5.2, -4);
  scene.add(streetFill);

  const marketFill = new THREE.PointLight(0xffc089, 18, 46, 2);
  marketFill.position.set(-4, 4.6, 22);
  scene.add(marketFill);

  // Fog density is the single most important number for the hero moment: at
  // the old 0.0165 the Crown Spire, 200m out, was fully erased. This is set so
  // distance reads as aerial perspective instead of as blackness.
  scene.fog = new THREE.FogExp2(0x18222f, 0.0042);
  scene.background = new THREE.Color(0x141d29);

  // Baselines, so weather scales the look rather than replacing it.
  const baseAmbient = hemisphere.intensity;
  const baseKey = key.intensity;
  const baseRim = rim.intensity;
  const baseWindowOpacity = windows?.material.opacity ?? 0.82;
  const baseStreetFill = streetFill.intensity;
  const baseMarketFill = marketFill.intensity;

  return {
    group,
    colliders,
    marketCentre: [0, 1.6, -4],
    bounds: { minX: -46, maxX: 46, minZ: -78, maxZ: 78 },

    /** Surfaces the wet-surface system reads and writes. */
    roadMaterials: [streetMaterial, groundMaterial],
    reflectionMesh: streaks,

    /**
     * Driven by the weather. `windowLight` also dims the reflections beneath
     * the windows, because those two are the same light.
     */
    setLighting(ambient, keyLight, windowLight) {
      hemisphere.intensity = ambient;
      key.intensity = keyLight;
      rim.intensity = baseRim * (0.5 + keyLight / Math.max(0.001, baseKey) * 0.5);

      if (windows) windows.material.opacity = baseWindowOpacity * windowLight;
      streetFill.intensity = baseStreetFill * (0.35 + windowLight * 0.65);
      marketFill.intensity = baseMarketFill * (0.35 + windowLight * 0.65);
    },

    /** Baselines, for tests and tooling. */
    lightingBaseline: { ambient: baseAmbient, key: baseKey, windowLight: 1 },

    dispose() {
      market.dispose();
      scene.remove(group);
      scene.remove(hemisphere);
      scene.remove(key);
      scene.remove(rim);
      scene.remove(streetFill);
      scene.remove(marketFill);
      for (const item of disposables) item.dispose?.();
    },
  };
}

/** Picks lit window positions on the street-facing facade of one block. */
function collectWindows(random, transforms, colors, position, width, height, depth, facing) {
  const columns = Math.max(2, Math.floor(width / 2.6));
  const rows = Math.max(2, Math.floor(height / 3.1));
  const faceZ = depth / 2 + 0.06;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      // Most windows stay dark; a fully lit city reads as cheap. Enough are lit
      // to give the facades rhythm and to feed the road reflections.
      if (random() > 0.46) continue;
      if (transforms.length >= MAX_WINDOWS) return;

      const x = position.x + (column - (columns - 1) / 2) * (width / columns);
      const y = 2.2 + row * (height / rows);
      const z = position.z + facing * faceZ * -1;

      transforms.push({ x, y, z, facing });
      colors.push(WINDOW_COLORS[Math.floor(random() * WINDOW_COLORS.length)]);
    }
  }
}

/** One InstancedMesh for every window in the district. */
function buildWindows(transforms, colors, track) {
  if (transforms.length === 0) return null;

  const geometry = track(new THREE.PlaneGeometry(1.05, 1.5));
  const material = track(
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.82, toneMapped: false }),
  );
  const mesh = new THREE.InstancedMesh(geometry, material, transforms.length);
  mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  for (let i = 0; i < transforms.length; i += 1) {
    const t = transforms[i];
    dummy.position.set(t.x, t.y, t.z);
    dummy.rotation.y = t.facing > 0 ? Math.PI : 0;
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    mesh.setColorAt(i, color.setHex(colors[i]));
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return mesh;
}

/**
 * Cheap "reflections": additive smears lying on the road beneath the lowest
 * windows. Far cheaper than a reflection pass and, at this camera height, reads
 * the same. Intensity is kept low so the road never glows.
 */
function buildReflectionStreaks(transforms, track) {
  const lowWindows = transforms.filter((t) => t.y < 9 && Math.abs(t.x) < 26);
  if (lowWindows.length === 0) return null;

  const count = Math.min(lowWindows.length, 220);
  const geometry = track(new THREE.PlaneGeometry(1.5, 9));
  const material = track(
    new THREE.MeshBasicMaterial({
      map: track(createReflectionStreak()),
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    }),
  );

  const mesh = new THREE.InstancedMesh(geometry, material, count);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i += 1) {
    const t = lowWindows[i];
    // Clamp onto the road surface, pointing back toward the street centre.
    const x = THREE.MathUtils.clamp(t.x, -STREET_HALF_WIDTH + 0.6, STREET_HALF_WIDTH - 0.6);
    dummy.position.set(x, 0.02, t.z + (t.x > 0 ? -3.4 : 3.4));
    dummy.rotation.set(-Math.PI / 2, 0, 0);
    dummy.scale.set(1, 1 - Math.min(0.6, t.y / 18), 1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.renderOrder = 1;
  return mesh;
}
