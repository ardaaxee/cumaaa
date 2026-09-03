import * as THREE from 'three';
import { createRandom, range } from '../core/random.js';
import { createGlow } from './textures.js';

/**
 * The distant skyline and the Crown Spire landmark.
 *
 * Everything here is far beyond the playable street and never moves, so it is
 * built as two instanced meshes plus one hero mesh. Depth comes from three
 * layers at increasing distance, each dimmer and more fog-bound than the last.
 */

/**
 * Three depth layers. Each is lighter than the one in front of it: with the
 * fog colour above them, that inversion is what produces aerial perspective and
 * makes the city read as deep rather than as a wall.
 */
const LAYERS = [
  { distance: 120, count: 26, minHeight: 22, maxHeight: 48, color: 0x232d3c, spread: 200 },
  { distance: 175, count: 30, minHeight: 34, maxHeight: 72, color: 0x2b3648, spread: 280 },
  { distance: 240, count: 34, minHeight: 48, maxHeight: 104, color: 0x333f53, spread: 360 },
];

/**
 * Where the Crown Spire stands. Close enough to fill frame during the hero
 * moment, far enough that the fog still separates it from the street.
 */
export const CROWN_SPIRE_POSITION = [-26, 0, -158];
export const CROWN_SPIRE_FOCUS = [-26, 78, -158];

export function createSkyline(scene) {
  const random = createRandom(0x5a5714e);
  const disposables = [];
  const group = new THREE.Group();
  group.name = 'skyline';
  scene.add(group);

  const track = (object) => {
    disposables.push(object);
    return object;
  };

  const boxGeometry = track(new THREE.BoxGeometry(1, 1, 1));
  const dummy = new THREE.Object3D();

  for (const layer of LAYERS) {
    const material = track(
      new THREE.MeshStandardMaterial({ color: layer.color, roughness: 0.9, metalness: 0.05 }),
    );
    const mesh = new THREE.InstancedMesh(boxGeometry, material, layer.count);
    mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);

    for (let i = 0; i < layer.count; i += 1) {
      const height = range(random, layer.minHeight, layer.maxHeight);
      const width = range(random, 14, 34);
      dummy.position.set(
        range(random, -layer.spread / 2, layer.spread / 2),
        height / 2,
        -layer.distance + range(random, -22, 22),
      );
      dummy.scale.set(width, height, range(random, 14, 30));
      dummy.rotation.y = range(random, -0.2, 0.2);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    // Distant geometry is never a camera collider and never needs culling maths.
    mesh.frustumCulled = true;
    group.add(mesh);
  }

  group.add(buildCrownSpire(track));
  group.add(buildHaze(track));

  return {
    group,
    spireFocus: CROWN_SPIRE_FOCUS,
    dispose() {
      scene.remove(group);
      for (const item of disposables) item.dispose?.();
    },
  };
}

/**
 * CUMA WORLD's own landmark: a tapered shaft opening into a ring of thin
 * pillars — the "crown" — with a single restrained beacon at its peak.
 */
function buildCrownSpire(track) {
  const spire = new THREE.Group();
  spire.name = 'crownSpire';
  spire.position.set(CROWN_SPIRE_POSITION[0], 0, CROWN_SPIRE_POSITION[2]);

  const stoneMaterial = track(
    new THREE.MeshStandardMaterial({ color: 0x3c4759, roughness: 0.72, metalness: 0.22 }),
  );
  const trimMaterial = track(
    new THREE.MeshStandardMaterial({
      color: 0x6a7789,
      roughness: 0.4,
      metalness: 0.55,
      // A restrained warm glow on the crown: enough to name the landmark at a
      // distance, nowhere near enough to look like neon or orange plastic.
      emissive: 0x3a2409,
      emissiveIntensity: 0.7,
    }),
  );

  const shaft = new THREE.Mesh(
    track(new THREE.CylinderGeometry(7.5, 15, 74, 8)),
    stoneMaterial,
  );
  shaft.position.y = 37;
  spire.add(shaft);

  const base = new THREE.Mesh(track(new THREE.CylinderGeometry(19, 24, 12, 8)), stoneMaterial);
  base.position.y = 6;
  spire.add(base);

  // The crown: eight pillars leaning outward from the top of the shaft.
  const pillarGeometry = track(new THREE.BoxGeometry(2.1, 26, 2.1));
  for (let i = 0; i < 8; i += 1) {
    const angle = (i / 8) * Math.PI * 2;
    const pillar = new THREE.Mesh(pillarGeometry, trimMaterial);
    pillar.position.set(Math.cos(angle) * 8.4, 84, Math.sin(angle) * 8.4);
    pillar.rotation.z = -Math.cos(angle) * 0.14;
    pillar.rotation.x = Math.sin(angle) * 0.14;
    spire.add(pillar);
  }

  const crownRing = new THREE.Mesh(
    track(new THREE.TorusGeometry(9.2, 0.8, 6, 24)),
    trimMaterial,
  );
  crownRing.position.y = 96;
  crownRing.rotation.x = Math.PI / 2;
  spire.add(crownRing);

  const beacon = new THREE.Mesh(
    track(new THREE.SphereGeometry(1.6, 10, 8)),
    track(new THREE.MeshBasicMaterial({ color: 0xffd6a0, toneMapped: false })),
  );
  beacon.position.y = 99;
  spire.add(beacon);

  const glowTexture = track(createGlow());
  const beaconGlow = new THREE.Sprite(
    track(
      new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0xffc98a,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        fog: false,
      }),
    ),
  );
  beaconGlow.position.y = 99;
  beaconGlow.scale.set(34, 34, 1);
  spire.add(beaconGlow);

  // A soft column of light behind the shaft. It lifts the spire out of the fog
  // so the landmark still reads as the hero of the frame at 150m.
  const backlight = new THREE.Mesh(
    track(new THREE.PlaneGeometry(78, 132)),
    track(
      new THREE.MeshBasicMaterial({
        map: glowTexture,
        color: 0x4a6a92,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        fog: false,
      }),
    ),
  );
  backlight.position.set(0, 58, -14);
  spire.add(backlight);

  return spire;
}

/**
 * Atmospheric depth cards between the skyline layers. Sitting behind the fog
 * they separate near buildings from far ones, which is most of what makes the
 * city read as large.
 */
function buildHaze(track) {
  const haze = new THREE.Group();
  const texture = track(createGlow(256));

  const bands = [
    { z: -140, y: 26, width: 340, height: 70, opacity: 0.2, color: 0x5a719a },
    { z: -205, y: 40, width: 460, height: 96, opacity: 0.17, color: 0x4d6486 },
    { z: -275, y: 54, width: 560, height: 130, opacity: 0.14, color: 0x415571 },
  ];

  for (const band of bands) {
    const material = track(
      new THREE.MeshBasicMaterial({
        map: texture,
        color: band.color,
        transparent: true,
        opacity: band.opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        fog: false,
      }),
    );
    const plane = new THREE.Mesh(track(new THREE.PlaneGeometry(band.width, band.height)), material);
    plane.position.set(0, band.y, band.z);
    haze.add(plane);
  }

  return haze;
}
