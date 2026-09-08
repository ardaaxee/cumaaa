import * as THREE from 'three';
import { PERFORMANCE } from '../core/settings.js';
import { createRandom, range } from '../core/random.js';
import { REACTION, reactionFor, speedScaleFor } from './crowdReactions.js';
import { constrainToWalkable } from './walkableWorld.js';

/**
 * TIER C — background crowd shared by Meridian Market and Crown District.
 *
 * The total population budget does not grow in M04. A portion of the existing
 * instanced agents now lives on Crown Plaza loops, so opening a second district
 * adds life without adding another draw-call set or another update system.
 */

const FAR_DISTANCE = 62;
const MARKET_TURN = 76;
const CROWN_MIN_Z = -190;
const CROWN_MAX_Z = -124;

const ROUTE = {
  MARKET: 0,
  CROWN_WEST: 1,
  CROWN_EAST: 2,
};

export function createCrowd(scene) {
  const random = createRandom(0xc0ffee1);
  const count = PERFORMANCE.CROWD_COUNT;
  const crownCount = Math.max(6, Math.floor(count * 0.28));
  const crownStart = Math.max(0, count - crownCount);

  const bodyGeometry = new THREE.CapsuleGeometry(0.22, 0.95, 4, 8);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x232a33,
    roughness: 0.85,
    metalness: 0.05,
  });
  const bodies = new THREE.InstancedMesh(bodyGeometry, bodyMaterial, count);
  bodies.frustumCulled = false;
  scene.add(bodies);

  const umbrellaGeometry = new THREE.ConeGeometry(0.52, 0.26, 8, 1, true);
  const umbrellaMaterial = new THREE.MeshStandardMaterial({
    color: 0x14181e,
    roughness: 0.7,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });
  const umbrellas = new THREE.InstancedMesh(umbrellaGeometry, umbrellaMaterial, count);
  umbrellas.frustumCulled = false;
  scene.add(umbrellas);

  const x = new Float32Array(count);
  const z = new Float32Array(count);
  const speed = new Float32Array(count);
  const direction = new Float32Array(count);
  const phase = new Float32Array(count);
  const hasUmbrella = new Uint8Array(count);
  const lastTouched = new Float32Array(count);
  const route = new Uint8Array(count);
  const shove = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    direction[i] = random() > 0.5 ? 1 : -1;
    speed[i] = range(random, 0.85, 1.55);
    phase[i] = random() * Math.PI * 2;
    hasUmbrella[i] = random() > 0.35 ? 1 : 0;

    if (i < crownStart) {
      route[i] = ROUTE.MARKET;
      x[i] = (random() > 0.5 ? 1 : -1) * range(random, 4.2, 8.4);
      z[i] = range(random, -MARKET_TURN, MARKET_TURN);
      continue;
    }

    // Two clean lanes around the Spire base. They sit just outside the plinth
    // radius and avoid both reflecting pools and the four podium footprints.
    const west = (i - crownStart) % 2 === 0;
    route[i] = west ? ROUTE.CROWN_WEST : ROUTE.CROWN_EAST;
    x[i] = west ? range(random, -45.5, -43.0) : range(random, -9.0, -6.8);
    z[i] = range(random, CROWN_MIN_Z, CROWN_MAX_Z);
  }

  const dummy = new THREE.Object3D();
  const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
  const constrained = { x: 0, z: 0 };
  let cursor = 0;
  let clock = 0;
  let umbrellaWeight = 1;

  for (let i = 0; i < count; i += 1) writeAgent(i);

  function writeAgent(i) {
    const bob = Math.abs(Math.sin(phase[i])) * 0.055;
    dummy.position.set(x[i], 0.78 + bob, z[i]);
    dummy.rotation.set(0, direction[i] > 0 ? 0 : Math.PI, Math.sin(phase[i]) * 0.05);
    dummy.updateMatrix();
    bodies.setMatrixAt(i, dummy.matrix);

    if (hasUmbrella[i] && umbrellaWeight > 0.25) {
      dummy.position.y = 1.62 + bob;
      dummy.rotation.z = Math.sin(phase[i]) * 0.08;
      dummy.updateMatrix();
      umbrellas.setMatrixAt(i, dummy.matrix);
    } else {
      umbrellas.setMatrixAt(i, hidden);
    }
  }

  function wrapRoute(i) {
    if (route[i] === ROUTE.MARKET) {
      if (z[i] > MARKET_TURN) z[i] = -MARKET_TURN;
      if (z[i] < -MARKET_TURN) z[i] = MARKET_TURN;
      x[i] = THREE.MathUtils.clamp(x[i], -13.5, 13.5);
      return;
    }

    if (z[i] > CROWN_MAX_Z) z[i] = CROWN_MIN_Z;
    if (z[i] < CROWN_MIN_Z) z[i] = CROWN_MAX_Z;

    // Reactions may shove an agent laterally. Reuse the exact same authored
    // ground constraint as Cuma so nobody runs through the Spire or a podium.
    constrainToWalkable(x[i], z[i], constrained);
    x[i] = constrained.x;
    z[i] = constrained.z;
  }

  /** @param {object} threat crowd-reaction threat state; may be inert */
  function update(dt, playerX, playerZ, threat) {
    clock += dt;
    const alarmed = threat && threat.intensity > 0.02;

    const batch = Math.min(PERFORMANCE.CROWD_UPDATES_PER_FRAME, count);
    for (let n = 0; n < batch; n += 1) {
      const i = cursor;
      cursor = (cursor + 1) % count;

      const elapsed = clock - lastTouched[i];
      lastTouched[i] = clock;
      if (elapsed <= 0) continue;

      const dx = x[i] - playerX;
      const dz = z[i] - playerZ;
      if (dx * dx + dz * dz > FAR_DISTANCE * FAR_DISTANCE) {
        bodies.setMatrixAt(i, hidden);
        umbrellas.setMatrixAt(i, hidden);
        z[i] += direction[i] * speed[i] * elapsed;
        wrapRoute(i);
        continue;
      }

      let scale = 1;
      if (alarmed) {
        const reaction = reactionFor(
          Math.hypot(x[i] - threat.x, z[i] - threat.z),
          threat.intensity,
        );
        scale = speedScaleFor(reaction);

        if (reaction === REACTION.FLEE_AREA || reaction === REACTION.AVOID) {
          const away = Math.sign(x[i] - threat.x) || 1;
          shove[i] = Math.min(3.4, shove[i] + elapsed * 2.2);
          x[i] += away * elapsed * 1.6;
          if (Math.sign(z[i] - threat.z) !== direction[i]) direction[i] *= -1;
        }
      } else if (shove[i] > 0) {
        shove[i] = Math.max(0, shove[i] - elapsed * 0.6);
      }

      z[i] += direction[i] * speed[i] * scale * elapsed;
      phase[i] += elapsed * speed[i] * scale * 3.6;
      wrapRoute(i);
      writeAgent(i);
    }

    bodies.instanceMatrix.needsUpdate = true;
    umbrellas.instanceMatrix.needsUpdate = true;
  }

  return {
    update,
    setRainWeight(value) {
      umbrellaWeight = value;
    },
    /** Development/test visibility without exposing the typed arrays for writes. */
    get distribution() {
      return { market: crownStart, crown: count - crownStart };
    },
    dispose() {
      scene.remove(bodies);
      scene.remove(umbrellas);
      bodyGeometry.dispose();
      bodyMaterial.dispose();
      umbrellaGeometry.dispose();
      umbrellaMaterial.dispose();
    },
  };
}
