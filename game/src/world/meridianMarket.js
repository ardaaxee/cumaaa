import * as THREE from 'three';
import { createRandom, range } from '../core/random.js';
import { WAYPOINTS } from './npcSchedule.js';

/**
 * Meridian Market, layered.
 *
 * The vertical slice's one playable district. This adds the detail that makes
 * it read as a place rather than a corridor: side alleys and a small plaza at
 * street level, stairs, balconies and a pedestrian bridge above it, and the
 * doorways, lobbies and transit mouths that imply everything the player cannot
 * reach yet.
 *
 * Nothing here opens. The point is that the district clearly continues behind
 * every surface.
 *
 * Everything repeated is instanced. The district is roughly two hundred props
 * and about a dozen draw calls, because the phone target cares far more about
 * draw calls than about triangles.
 */

const STREET_HALF_WIDTH = 9;

export function createMeridianMarket(scene) {
  const random = createRandom(0x4d4152);
  const disposables = [];
  const colliders = [];

  const group = new THREE.Group();
  group.name = 'meridianMarket';
  scene.add(group);

  const track = (object) => {
    disposables.push(object);
    return object;
  };

  const concrete = track(
    new THREE.MeshStandardMaterial({ color: 0x2e3742, roughness: 0.78, metalness: 0.12 }),
  );
  const darkStone = track(
    new THREE.MeshStandardMaterial({ color: 0x1e252e, roughness: 0.82, metalness: 0.08 }),
  );
  const metal = track(
    new THREE.MeshStandardMaterial({ color: 0x4a5666, roughness: 0.42, metalness: 0.62 }),
  );
  const canvasCloth = track(
    new THREE.MeshStandardMaterial({
      color: 0x59433a,
      roughness: 0.88,
      metalness: 0.02,
      side: THREE.DoubleSide,
    }),
  );
  // Interiors are never entered; they are a warm suggestion behind a threshold.
  const interiorGlow = track(
    new THREE.MeshBasicMaterial({
      color: 0xffc98a,
      transparent: true,
      opacity: 0.5,
      toneMapped: false,
      side: THREE.DoubleSide,
    }),
  );
  const transitGlow = track(
    new THREE.MeshBasicMaterial({
      color: 0xa9c8ee,
      transparent: true,
      opacity: 0.42,
      toneMapped: false,
      side: THREE.DoubleSide,
    }),
  );

  const dummy = new THREE.Object3D();

  /**
   * Collects transforms for a repeated prop and emits one InstancedMesh.
   * `place` receives the shared dummy and pushes a matrix per instance.
   */
  const instanced = (geometry, material, transforms) => {
    if (transforms.length === 0) return null;
    const mesh = new THREE.InstancedMesh(track(geometry), material, transforms.length);
    mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    for (let i = 0; i < transforms.length; i += 1) mesh.setMatrixAt(i, transforms[i]);
    mesh.instanceMatrix.needsUpdate = true;
    group.add(mesh);
    return mesh;
  };

  /** Builds a matrix from the shared dummy, without allocating a new Object3D. */
  const matrix = (x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
    dummy.position.set(x, y, z);
    dummy.rotation.set(rx, ry, rz);
    dummy.scale.set(sx, sy, sz);
    dummy.updateMatrix();
    return dummy.matrix.clone();
  };

  /** A one-off mesh, for the things there is only one of. */
  const single = (geometry, material, x, y, z, rotationY = 0) => {
    const mesh = new THREE.Mesh(track(geometry), material);
    mesh.position.set(x, y, z);
    mesh.rotation.y = rotationY;
    group.add(mesh);
    return mesh;
  };

  // --- Street level -------------------------------------------------------

  // A small plaza where the market street meets the crossing.
  const plaza = single(new THREE.PlaneGeometry(26, 22), darkStone, 0, 0.02, -4);
  plaza.rotation.x = -Math.PI / 2;

  // Side alleys running off the main street, so it stops being a single line.
  const alleys = [
    { x: -22, z: 14 },
    { x: 22, z: -18 },
    { x: -22, z: -34 },
    { x: 22, z: 30 },
  ].map((spec) => matrix(spec.x, 0.015, spec.z, -Math.PI / 2, 0, 0));
  instanced(new THREE.PlaneGeometry(26, 4.6), darkStone, alleys);

  // A service road behind the east block.
  const service = single(new THREE.PlaneGeometry(5.5, 64), darkStone, 26, 0.014, 6);
  service.rotation.x = -Math.PI / 2;

  // Market stalls along the corridor, anchored to the NPC shopping waypoints so
  // the crowd is visibly shopping at something.
  const counters = [];
  const legs = [];
  const awnings = [];

  for (const anchor of [WAYPOINTS.stallsWest, WAYPOINTS.stallsEast]) {
    for (let i = -1; i <= 1; i += 1) {
      const x = anchor.x + (anchor.x < 0 ? -0.4 : 0.4);
      const z = anchor.z + i * 3.4;

      counters.push(matrix(x, 1.0, z));
      for (const side of [-1, 1]) legs.push(matrix(x + side * 1.2, 1.05, z));
      awnings.push(matrix(x, 2.2, z, 0, 0, (anchor.x < 0 ? 1 : -1) * 0.08));
    }
  }

  // Street furniture is not registered as a camera collider: a bench pulling
  // the camera in would be far worse than the camera clipping a bench.
  instanced(new THREE.BoxGeometry(2.6, 0.14, 1.7), concrete, counters);
  instanced(new THREE.BoxGeometry(0.12, 2.1, 0.12), metal, legs);
  instanced(new THREE.BoxGeometry(3.0, 0.08, 2.1), canvasCloth, awnings);

  // Benches at the sitting waypoint.
  const benches = [-1, 1].map((i) =>
    matrix(WAYPOINTS.benchNorth.x + i * 2.6, 0.48, WAYPOINTS.benchNorth.z),
  );
  instanced(new THREE.BoxGeometry(2.2, 0.16, 0.6), concrete, benches);

  // --- Vertical level -----------------------------------------------------

  // Stairs up to a raised walkway on the west side.
  const steps = [];
  for (let i = 0; i < 9; i += 1) steps.push(matrix(-12.5, 0.11 + i * 0.22, 8 - i * 0.9));
  instanced(new THREE.BoxGeometry(4.2, 0.22, 0.9), concrete, steps);

  // The walkway itself, and the balconies hanging off the facades.
  const walkway = single(new THREE.BoxGeometry(5.0, 0.3, 30), concrete, -12.5, 2.1, -6);
  colliders.push(walkway);
  single(new THREE.BoxGeometry(0.12, 0.95, 30), metal, -10.1, 2.7, -6);

  const balconies = [];
  const guards = [];
  for (let i = 0; i < 7; i += 1) {
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (STREET_HALF_WIDTH + 1.4);
    const z = -40 + i * 12;
    const y = range(random, 3.4, 8.2);
    balconies.push(matrix(x, y, z));
    guards.push(matrix(x + side * -0.85, y + 0.42, z, 0, Math.PI / 2, 0));
  }
  instanced(new THREE.BoxGeometry(3.4, 0.22, 1.8), concrete, balconies);
  instanced(new THREE.BoxGeometry(3.4, 0.7, 0.08), metal, guards);

  // A pedestrian bridge across the market street: the strongest read that the
  // district has an upper level.
  const bridgeDeck = single(new THREE.BoxGeometry(22, 0.34, 3.2), concrete, 0, 6.4, -34);
  colliders.push(bridgeDeck);

  const bridgeRails = [-1, 1].map((side) => matrix(0, 7.0, -34 + side * 1.55));
  instanced(new THREE.BoxGeometry(22, 1.0, 0.1), metal, bridgeRails);

  const piers = [-1, 1].map((side) => matrix(side * 10.4, 3.2, -34));
  const pierMesh = instanced(new THREE.BoxGeometry(1.2, 6.4, 1.2), darkStone, piers);
  if (pierMesh) colliders.push(pierMesh);

  // --- Interior hints -----------------------------------------------------

  // Shop thresholds: a recessed dark frame with a warm panel behind it.
  const frames = [];
  const glows = [];
  for (let i = 0; i < 10; i += 1) {
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (STREET_HALF_WIDTH + 0.4);
    const z = -46 + i * 10 + range(random, -1.5, 1.5);

    frames.push(matrix(x, 1.35, z));
    // Only some are lit; a street where every shop is open reads as fake.
    if (random() > 0.42) {
      glows.push(matrix(x + side * -0.22, 1.3, z, 0, (side * -Math.PI) / 2, 0));
    }
  }
  instanced(new THREE.BoxGeometry(1.9, 2.7, 0.35), darkStone, frames);
  instanced(new THREE.PlaneGeometry(1.5, 2.3), interiorGlow, glows);

  // A lobby: a wider glazed threshold with light spilling out.
  const lobbyFrame = single(new THREE.BoxGeometry(6.4, 4.2, 0.4), darkStone, -10.4, 2.1, 16);
  colliders.push(lobbyFrame);
  const lobbyGlow = single(new THREE.PlaneGeometry(5.4, 3.4), interiorGlow, -10.16, 1.9, 16);
  lobbyGlow.rotation.y = Math.PI / 2;

  // Service doors: closed, unlit, but clearly doors.
  const serviceDoors = [
    { x: 23.2, z: 2 },
    { x: 23.2, z: 20 },
    { x: -23.2, z: -22 },
  ].map((spec) => matrix(spec.x, 1.2, spec.z));
  instanced(new THREE.BoxGeometry(1.4, 2.4, 0.24), metal, serviceDoors);

  // The transit mouth: a stair descending under the street, cool light rising.
  const transitHead = single(new THREE.BoxGeometry(7.0, 1.1, 5.0), darkStone, 6.4, 0.55, -24);
  colliders.push(transitHead);
  single(new THREE.PlaneGeometry(4.6, 3.0), transitGlow, 6.4, 0.9, -21.6);
  single(new THREE.BoxGeometry(7.6, 0.18, 5.6), metal, 6.4, 3.3, -24);

  const posts = [-1, 1].map((side) => matrix(6.4 + side * 3.5, 1.65, -26.4));
  instanced(new THREE.BoxGeometry(0.18, 3.3, 0.18), metal, posts);

  return {
    group,
    colliders,
    /** Where the district's own life is centred. */
    plazaCentre: { x: 0, z: -4 },
    dispose() {
      scene.remove(group);
      for (const item of disposables) item.dispose?.();
    },
  };
}
