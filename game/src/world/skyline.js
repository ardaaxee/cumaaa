import * as THREE from 'three';
import { createRandom, range } from '../core/random.js';
import { createGlow } from './textures.js';
import { LANDMARKS, LANDMARK_KIND, primaryLandmark } from './landmarks.js';
import { DISTRICTS, DISTRICT_IDS } from './districts.js';
import { isWalkable } from './walkableWorld.js';

/**
 * The distant skyline and the Crown Spire landmark.
 *
 * M04 moves the generic skyline behind Crown District. What was distant from
 * Meridian at z=-120 would become a building beside the player once Crown was
 * opened, so the background layers now begin beyond the authored city ground.
 */

/**
 * Three depth layers. Each is lighter than the one in front of it: with the
 * fog colour above them, that inversion is what produces aerial perspective and
 * makes the city read as deep rather than as a wall.
 */
const LAYERS = [
  { distance: 320, count: 24, minHeight: 30, maxHeight: 58, color: 0x232d3c, spread: 440 },
  { distance: 430, count: 28, minHeight: 42, maxHeight: 82, color: 0x2b3648, spread: 600 },
  { distance: 560, count: 32, minHeight: 58, maxHeight: 118, color: 0x333f53, spread: 760 },
];

/**
 * The Crown Spire's position comes from the landmark catalog, so the city and
 * the camera sequences that frame it can never drift apart.
 */
const SPIRE = primaryLandmark();
export const CROWN_SPIRE_POSITION = [SPIRE.position.x, SPIRE.position.y, SPIRE.position.z];
export const CROWN_SPIRE_FOCUS = [SPIRE.focus.x, SPIRE.focus.y, SPIRE.focus.position?.z ?? SPIRE.focus.z];

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
        -layer.distance + range(random, -30, 30),
      );
      dummy.scale.set(width, height, range(random, 14, 30));
      dummy.rotation.y = range(random, -0.2, 0.2);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.frustumCulled = true;
    group.add(mesh);
  }

  // Only districts without authored ground receive skyline filler. Once a
  // district becomes walkable its real geometry owns that space instead.
  group.add(buildDistrictMasses(track, random));

  // Landmarks come from the catalog rather than being placed here, so the map,
  // the camera sequences and the city all agree on where they are.
  const landmarkFocus = {};
  for (const landmark of LANDMARKS) {
    group.add(buildLandmark(landmark, track));
    landmarkFocus[landmark.id] = [landmark.focus.x, landmark.focus.y, landmark.focus.z];
  }

  group.add(buildHaze(track));

  return {
    group,
    spireFocus: CROWN_SPIRE_FOCUS,
    /** Focus points by landmark id, for the camera director. */
    landmarkFocus,
    dispose() {
      scene.remove(group);
      for (const item of disposables) item.dispose?.();
    },
  };
}

/**
 * Blocked-in city mass for each non-walkable district, sitting between the
 * authored regions and the far skyline so the city still reads as continuous.
 */
function buildDistrictMasses(track, random) {
  const masses = new THREE.Group();
  masses.name = 'districtMasses';

  const geometry = track(new THREE.BoxGeometry(1, 1, 1));
  const material = track(
    new THREE.MeshStandardMaterial({ color: 0x202a37, roughness: 0.86, metalness: 0.1 }),
  );

  const blocks = [];
  const dummy = new THREE.Object3D();

  for (const id of DISTRICT_IDS) {
    if (DISTRICTS[id].walkable) continue;
    const bounds = DISTRICTS[id].bounds;

    for (let i = 0; i < 16; i += 1) {
      const height = range(random, 16, 62);
      const width = range(random, 12, 30);
      const depth = range(random, 12, 28);

      let x = 0;
      let z = 0;
      let found = false;
      for (let attempt = 0; attempt < 10; attempt += 1) {
        x = range(random, bounds.minX, bounds.maxX);
        z = range(random, bounds.minZ, bounds.maxZ);
        if (!isWalkable(x, z)) {
          found = true;
          break;
        }
      }
      // Northline overlaps Crown's western edge in the catalog. Never let a
      // background filler block land on authored walkable ground.
      if (!found) continue;

      dummy.position.set(x, height / 2, z);
      dummy.scale.set(width, height, depth);
      dummy.rotation.y = range(random, -0.25, 0.25);
      dummy.updateMatrix();
      blocks.push(dummy.matrix.clone());
    }
  }

  const mesh = new THREE.InstancedMesh(geometry, material, blocks.length);
  mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
  for (let i = 0; i < blocks.length; i += 1) mesh.setMatrixAt(i, blocks[i]);
  mesh.instanceMatrix.needsUpdate = true;
  masses.add(mesh);

  return masses;
}

/** Dispatches to the silhouette a landmark's `kind` asks for. */
function buildLandmark(landmark, track) {
  switch (landmark.kind) {
    case LANDMARK_KIND.SPIRE:
      return buildCrownSpire(track);
    case LANDMARK_KIND.CLOCK_TOWER:
      return buildClockTower(landmark, track);
    case LANDMARK_KIND.TRANSIT_HALL:
      return buildTransitHall(landmark, track);
    case LANDMARK_KIND.SLAB_TOWER:
      return buildSlabTower(landmark, track);
    case LANDMARK_KIND.ARCH:
      return buildArch(landmark, track);
    default:
      return new THREE.Group();
  }
}

/** A lit sprite used to make a landmark readable at distance. */
function landmarkBeacon(landmark, track, y, scale, opacity = 0.4) {
  const sprite = new THREE.Sprite(
    track(
      new THREE.SpriteMaterial({
        map: track(createGlow(128)),
        color: landmark.lightColor,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        fog: false,
      }),
    ),
  );
  sprite.position.y = y;
  sprite.scale.set(scale, scale, 1);
  return sprite;
}

/**
 * MERIDIAN CLOCK TOWER — a square brick shaft with a lit face on each side.
 * It stands inside the playable district, so it is the near bearing.
 */
function buildClockTower(landmark, track) {
  const tower = new THREE.Group();
  tower.name = landmark.id;
  tower.position.set(landmark.position.x, 0, landmark.position.z);

  const stone = track(
    new THREE.MeshStandardMaterial({ color: 0x39424f, roughness: 0.8, metalness: 0.12 }),
  );
  const trim = track(
    new THREE.MeshStandardMaterial({
      color: 0x5c6979,
      roughness: 0.5,
      metalness: 0.4,
      emissive: 0x2a1c08,
      emissiveIntensity: 0.6,
    }),
  );

  const shaft = new THREE.Mesh(track(new THREE.BoxGeometry(6.4, landmark.height, 6.4)), stone);
  shaft.position.y = landmark.height / 2;
  tower.add(shaft);

  const crown = new THREE.Mesh(track(new THREE.BoxGeometry(7.8, 2.2, 7.8)), trim);
  crown.position.y = landmark.height - 4;
  tower.add(crown);

  const cap = new THREE.Mesh(track(new THREE.ConeGeometry(5.4, 6.0, 4)), stone);
  cap.position.y = landmark.height + 2.2;
  cap.rotation.y = Math.PI / 4;
  tower.add(cap);

  const faceGeometry = track(new THREE.CircleGeometry(2.0, 20));
  const faceMaterial = track(
    new THREE.MeshBasicMaterial({ color: landmark.lightColor, toneMapped: false }),
  );
  for (let i = 0; i < 4; i += 1) {
    const angle = (i / 4) * Math.PI * 2;
    const face = new THREE.Mesh(faceGeometry, faceMaterial);
    face.position.set(Math.sin(angle) * 3.25, landmark.height - 8.5, Math.cos(angle) * 3.25);
    face.rotation.y = angle;
    tower.add(face);
  }

  tower.add(landmarkBeacon(landmark, track, landmark.height - 8.5, 13, 0.3));
  return tower;
}

/** GLASS TRANSIT HALL — a long low vault, lit from within. */
function buildTransitHall(landmark, track) {
  const hall = new THREE.Group();
  hall.name = landmark.id;
  hall.position.set(landmark.position.x, 0, landmark.position.z);

  const frame = track(
    new THREE.MeshStandardMaterial({ color: 0x2b3542, roughness: 0.6, metalness: 0.35 }),
  );
  const glass = track(
    new THREE.MeshStandardMaterial({
      color: 0x6f8bb0,
      roughness: 0.2,
      metalness: 0.5,
      emissive: 0x25405e,
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.86,
    }),
  );

  const base = new THREE.Mesh(track(new THREE.BoxGeometry(46, 9, 22)), frame);
  base.position.y = 4.5;
  hall.add(base);

  const vault = new THREE.Mesh(
    track(new THREE.CylinderGeometry(11.5, 11.5, 46, 14, 1, true, 0, Math.PI)),
    glass,
  );
  vault.position.y = 9;
  vault.rotation.z = Math.PI / 2;
  hall.add(vault);

  for (let i = 0; i < 5; i += 1) {
    const rib = new THREE.Mesh(track(new THREE.TorusGeometry(11.5, 0.35, 5, 14, Math.PI)), frame);
    rib.position.set(-18 + i * 9, 9, 0);
    rib.rotation.y = Math.PI / 2;
    hall.add(rib);
  }

  hall.add(landmarkBeacon(landmark, track, 14, 26, 0.26));
  return hall;
}

/** NORTHLINE TOWER — a tall offset slab with a lit service spine. */
function buildSlabTower(landmark, track) {
  const tower = new THREE.Group();
  tower.name = landmark.id;
  tower.position.set(landmark.position.x, 0, landmark.position.z);

  const shell = track(
    new THREE.MeshStandardMaterial({ color: 0x2c3644, roughness: 0.7, metalness: 0.28 }),
  );
  const spine = track(
    new THREE.MeshStandardMaterial({
      color: 0x46586e,
      roughness: 0.35,
      metalness: 0.55,
      emissive: 0x1b3450,
      emissiveIntensity: 1.1,
    }),
  );

  const lower = new THREE.Mesh(track(new THREE.BoxGeometry(17, landmark.height, 13)), shell);
  lower.position.y = landmark.height / 2;
  tower.add(lower);

  const upper = new THREE.Mesh(track(new THREE.BoxGeometry(11, 26, 9)), shell);
  upper.position.set(4.4, landmark.height + 10, 0);
  tower.add(upper);

  const column = new THREE.Mesh(track(new THREE.BoxGeometry(1.6, landmark.height + 20, 1.6)), spine);
  column.position.set(-7.2, (landmark.height + 20) / 2, 0);
  tower.add(column);

  tower.add(landmarkBeacon(landmark, track, landmark.height + 24, 16, 0.3));
  return tower;
}

/** OLD ASTER ARCH — the city's oldest gate, a heavy stone span. */
function buildArch(landmark, track) {
  const arch = new THREE.Group();
  arch.name = landmark.id;
  arch.position.set(landmark.position.x, 0, landmark.position.z);

  const stone = track(
    new THREE.MeshStandardMaterial({ color: 0x4a4438, roughness: 0.9, metalness: 0.06 }),
  );

  for (const side of [-1, 1]) {
    const pier = new THREE.Mesh(track(new THREE.BoxGeometry(7, landmark.height * 0.72, 8)), stone);
    pier.position.set(side * 11, landmark.height * 0.36, 0);
    arch.add(pier);
  }

  const span = new THREE.Mesh(
    track(new THREE.TorusGeometry(11, 3.4, 8, 18, Math.PI)),
    stone,
  );
  span.position.y = landmark.height * 0.72;
  span.rotation.y = Math.PI / 2;
  arch.add(span);

  const lintel = new THREE.Mesh(track(new THREE.BoxGeometry(30, 4.4, 9)), stone);
  lintel.position.y = landmark.height - 2;
  arch.add(lintel);

  arch.add(landmarkBeacon(landmark, track, landmark.height * 0.5, 20, 0.2));
  return arch;
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

/** Atmospheric depth cards beyond the authored walkable districts. */
function buildHaze(track) {
  const haze = new THREE.Group();
  const texture = track(createGlow(256));

  const bands = [
    { z: -300, y: 36, width: 480, height: 88, opacity: 0.18, color: 0x5a719a },
    { z: -430, y: 52, width: 620, height: 120, opacity: 0.15, color: 0x4d6486 },
    { z: -570, y: 70, width: 780, height: 154, opacity: 0.12, color: 0x415571 },
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