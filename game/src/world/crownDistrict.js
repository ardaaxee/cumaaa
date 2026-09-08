import * as THREE from 'three';
import { createRandom, range } from '../core/random.js';
import { createWetRoadRoughness } from './textures.js';
import { DISTRICT, DISTRICTS } from './districts.js';
import { primaryLandmark } from './landmarks.js';

/**
 * CROWN DISTRICT — Aster City's civic / corporate centre.
 *
 * Meridian Market is dense and improvised. Crown is the opposite: broad sight
 * lines, controlled planting, deep stone podiums, security furniture and the
 * Crown Spire dominating the end of every approach.
 *
 * Repeated detail is instanced. The district is intentionally low on small
 * props so its scale comes from negative space instead of clutter.
 */

const DISTRICT_DATA = DISTRICTS[DISTRICT.CROWN_DISTRICT];
const SPIRE = primaryLandmark();
const AXIS_X = SPIRE.position.x;
const SOUTH_EDGE = DISTRICT_DATA.bounds.maxZ;
const NORTH_EDGE = DISTRICT_DATA.bounds.minZ;

export function createCrownDistrict(scene) {
  const random = createRandom(0x43524f57);
  const disposables = [];
  const colliders = [];
  const group = new THREE.Group();
  group.name = 'crownDistrict';
  scene.add(group);

  const track = (object) => {
    disposables.push(object);
    return object;
  };

  const granite = track(
    new THREE.MeshStandardMaterial({ color: 0x252d36, roughness: 0.72, metalness: 0.16 }),
  );
  const paleStone = track(
    new THREE.MeshStandardMaterial({ color: 0x49515b, roughness: 0.66, metalness: 0.12 }),
  );
  const darkMetal = track(
    new THREE.MeshStandardMaterial({ color: 0x313b47, roughness: 0.38, metalness: 0.62 }),
  );
  const glass = track(
    new THREE.MeshStandardMaterial({
      color: 0x55708c,
      roughness: 0.16,
      metalness: 0.44,
      transparent: true,
      opacity: 0.78,
    }),
  );
  const warmInterior = track(
    new THREE.MeshBasicMaterial({
      color: 0xffd29a,
      transparent: true,
      opacity: 0.28,
      toneMapped: false,
      side: THREE.DoubleSide,
    }),
  );
  const waterMaterial = track(
    new THREE.MeshStandardMaterial({
      color: 0x314a60,
      roughness: 0.16,
      metalness: 0.52,
      transparent: true,
      opacity: 0.82,
    }),
  );

  const roadRoughness = track(createWetRoadRoughness());
  const civicRoad = track(
    new THREE.MeshStandardMaterial({
      color: 0x0a0d12,
      roughness: 0.3,
      roughnessMap: roadRoughness,
      metalness: 0.56,
    }),
  );

  const dummy = new THREE.Object3D();
  const matrix = (x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
    dummy.position.set(x, y, z);
    dummy.rotation.set(rx, ry, rz);
    dummy.scale.set(sx, sy, sz);
    dummy.updateMatrix();
    return dummy.matrix.clone();
  };

  const instanced = (geometry, material, transforms, { collider = false } = {}) => {
    if (transforms.length === 0) return null;
    const mesh = new THREE.InstancedMesh(track(geometry), material, transforms.length);
    mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    for (let i = 0; i < transforms.length; i += 1) mesh.setMatrixAt(i, transforms[i]);
    mesh.instanceMatrix.needsUpdate = true;
    group.add(mesh);
    if (collider) colliders.push(mesh);
    return mesh;
  };

  const single = (geometry, material, x, y, z, rotationY = 0, collider = false) => {
    const mesh = new THREE.Mesh(track(geometry), material);
    mesh.position.set(x, y, z);
    mesh.rotation.y = rotationY;
    mesh.receiveShadow = true;
    group.add(mesh);
    if (collider) colliders.push(mesh);
    return mesh;
  };

  // --- Arrival axis ------------------------------------------------------
  // This overlaps Meridian's north edge and physically carries the player into
  // the new district instead of teleporting or loading a separate scene.
  const approachLength = Math.abs(SOUTH_EDGE + 76) + 26;
  const approachZ = (SOUTH_EDGE - 76) / 2;
  const approach = single(
    new THREE.PlaneGeometry(32, approachLength),
    civicRoad,
    -4,
    0.018,
    approachZ,
  );
  approach.rotation.x = -Math.PI / 2;

  // Once inside Crown the boulevard bends west toward the Spire axis. Two wide
  // slabs create a subtle dog-leg and stop the city from reading as one tunnel.
  const southBoulevard = single(new THREE.PlaneGeometry(34, 54), civicRoad, -8, 0.019, -121);
  southBoulevard.rotation.x = -Math.PI / 2;
  southBoulevard.rotation.z = 0.05;

  const northBoulevard = single(new THREE.PlaneGeometry(38, 96), civicRoad, AXIS_X, 0.019, -189);
  northBoulevard.rotation.x = -Math.PI / 2;

  // --- Crown Plaza -------------------------------------------------------
  // A broad stone field around the city's primary landmark. No decorative maze:
  // the negative space is what makes the tower feel enormous.
  const plaza = single(new THREE.PlaneGeometry(84, 70), granite, AXIS_X, 0.022, -157);
  plaza.rotation.x = -Math.PI / 2;

  // Thin pale bands embedded in the plaza lead the eye to the Spire.
  const inlayTransforms = [];
  for (const offset of [-28, -18, -8, 8, 18, 28]) {
    inlayTransforms.push(matrix(AXIS_X + offset, 0.027, -157, -Math.PI / 2, 0, 0));
  }
  instanced(new THREE.PlaneGeometry(0.45, 64), paleStone, inlayTransforms);

  // Long shallow reflecting channels. These are deliberately offset from the
  // central walking line so the player keeps a clean approach to the Spire.
  const water = [];
  const waterEdges = [];
  for (const side of [-1, 1]) {
    const x = AXIS_X + side * 33;
    water.push(matrix(x, 0.035, -159, -Math.PI / 2, 0, 0));
    waterEdges.push(matrix(x - 2.7, 0.18, -159));
    waterEdges.push(matrix(x + 2.7, 0.18, -159));
  }
  instanced(new THREE.PlaneGeometry(5.0, 52), waterMaterial, water);
  instanced(new THREE.BoxGeometry(0.18, 0.28, 52), paleStone, waterEdges);

  // The Spire's ground plinth. Skyline owns the 99m tower; Crown owns the way it
  // meets the street, so the landmark feels rooted in a real place.
  const spirePlinth = single(new THREE.CylinderGeometry(13, 15.5, 1.2, 32), paleStone, AXIS_X, 0.6, -158, 0, true);
  spirePlinth.castShadow = true;
  single(new THREE.CylinderGeometry(10.8, 12.4, 0.36, 32), darkMetal, AXIS_X, 1.25, -158);

  // --- Podiums / towers --------------------------------------------------
  // Four heavy podiums frame the square. Their tall glass volumes sit far enough
  // from the central route to preserve the long sight line to the Spire.
  const podiumSpecs = [
    { x: -78, z: -138, w: 34, d: 28, h: 8, towerH: 44 },
    { x: 25, z: -142, w: 31, d: 30, h: 9, towerH: 52 },
    { x: -82, z: -198, w: 36, d: 26, h: 7, towerH: 38 },
    { x: 31, z: -202, w: 32, d: 28, h: 8, towerH: 47 },
  ];

  for (let i = 0; i < podiumSpecs.length; i += 1) {
    const spec = podiumSpecs[i];
    const podium = single(
      new THREE.BoxGeometry(spec.w, spec.h, spec.d),
      i % 2 ? granite : paleStone,
      spec.x,
      spec.h / 2,
      spec.z,
      0,
      true,
    );
    podium.castShadow = true;

    const towerW = spec.w * 0.62;
    const towerD = spec.d * 0.56;
    const tower = single(
      new THREE.BoxGeometry(towerW, spec.towerH, towerD),
      glass,
      spec.x + (i % 2 ? -2.2 : 2.2),
      spec.h + spec.towerH / 2,
      spec.z + (i < 2 ? -1.8 : 1.8),
      i % 2 ? -0.035 : 0.035,
      true,
    );
    tower.castShadow = true;

    // A warm inner slab gives the glass depth at night without turning the
    // building into a glowing cube.
    single(
      new THREE.PlaneGeometry(towerW * 0.72, spec.towerH * 0.72),
      warmInterior,
      spec.x + (i % 2 ? -2.2 : 2.2),
      spec.h + spec.towerH * 0.52,
      spec.z + (i < 2 ? towerD * 0.29 : -towerD * 0.29),
      i < 2 ? 0 : Math.PI,
    );
  }

  // --- Arcades and civic furniture -------------------------------------
  const columns = [];
  const canopyTransforms = [];
  for (const side of [-1, 1]) {
    const x = AXIS_X + side * 48;
    for (let z = -126; z >= -214; z -= 8) {
      columns.push(matrix(x, 3.4, z));
    }
    canopyTransforms.push(matrix(x, 6.65, -170));
  }
  instanced(new THREE.CylinderGeometry(0.42, 0.5, 6.8, 10), paleStone, columns, { collider: true });
  instanced(new THREE.BoxGeometry(4.6, 0.32, 94), darkMetal, canopyTransforms);

  // Security bollards define the plaza edge. They are low enough not to affect
  // camera collision and sparse enough not to turn movement into slalom.
  const bollards = [];
  for (let i = 0; i < 11; i += 1) {
    const z = -127 - i * 6.4;
    bollards.push(matrix(AXIS_X - 39, 0.55, z));
    bollards.push(matrix(AXIS_X + 39, 0.55, z));
  }
  instanced(new THREE.CylinderGeometry(0.24, 0.3, 1.1, 8), darkMetal, bollards);

  // Restrained planting: clipped trees in identical civic planters.
  const planterTransforms = [];
  const trunkTransforms = [];
  const crownTransforms = [];
  for (const side of [-1, 1]) {
    const x = AXIS_X + side * 42;
    for (let z = -132; z >= -208; z -= 19) {
      const jitter = range(random, -1.4, 1.4);
      planterTransforms.push(matrix(x, 0.35, z + jitter));
      trunkTransforms.push(matrix(x, 1.55, z + jitter));
      crownTransforms.push(matrix(x, 3.7, z + jitter, 0, random() * Math.PI, 0, 1.3, 1.6, 1.3));
    }
  }
  instanced(new THREE.BoxGeometry(2.4, 0.7, 2.4), granite, planterTransforms);
  instanced(new THREE.CylinderGeometry(0.16, 0.2, 2.4, 7), darkMetal, trunkTransforms);
  instanced(
    new THREE.IcosahedronGeometry(1.25, 1),
    track(new THREE.MeshStandardMaterial({ color: 0x24352f, roughness: 0.94, metalness: 0.0 })),
    crownTransforms,
  );

  // North gate: a monumental frame that signals the city continues beyond this
  // milestone without pretending the next district is already playable.
  const gateZ = NORTH_EDGE + 10;
  const gatePiers = [
    matrix(AXIS_X - 17, 8, gateZ),
    matrix(AXIS_X + 17, 8, gateZ),
  ];
  instanced(new THREE.BoxGeometry(4.2, 16, 5.0), paleStone, gatePiers, { collider: true });
  single(new THREE.BoxGeometry(38, 3.4, 5.2), darkMetal, AXIS_X, 15.1, gateZ, 0, true);

  // A few large-area lights. Crown should read as controlled civic lighting, not
  // as a neon entertainment district.
  const plazaKey = new THREE.PointLight(0xffd2a0, 18, 76, 2);
  plazaKey.position.set(AXIS_X + 16, 9, -150);
  scene.add(plazaKey);

  const northFill = new THREE.PointLight(0xb9c9dc, 11, 82, 2);
  northFill.position.set(AXIS_X - 18, 8, -204);
  scene.add(northFill);

  return {
    group,
    colliders,
    roadMaterials: [civicRoad, waterMaterial],
    centre: { x: DISTRICT_DATA.centre.x, z: DISTRICT_DATA.centre.z },
    spirePlinth,
    dispose() {
      scene.remove(group);
      scene.remove(plazaKey);
      scene.remove(northFill);
      for (const item of disposables) item.dispose?.();
    },
  };
}
