import * as THREE from 'three';
import { PERFORMANCE } from '../core/settings.js';
import { createRandom, range } from '../core/random.js';
import { REACTION, reactionFor, speedScaleFor } from './crowdReactions.js';

/**
 * TIER C — background crowd.
 *
 * The cheapest people in Aster City: they walk the street on rails, and the
 * only decision they ever make is whether to get out of the way. Two instanced
 * meshes and a bounded update — only a fixed number of agents are re-integrated
 * per frame, each catching up on the time that actually passed since it was
 * last touched, and distant agents are parked entirely.
 *
 * The local residents with real schedules are Tier B, in `npcSystem.js`.
 */

const FAR_DISTANCE = 62;
const TURN_AROUND_Z = 76;

export function createCrowd(scene) {
  const random = createRandom(0xc0ffee1);
  const count = PERFORMANCE.CROWD_COUNT;

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
  /** Lateral drift used when a bystander is getting out of the way. */
  const shove = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    direction[i] = random() > 0.5 ? 1 : -1;
    x[i] = (random() > 0.5 ? 1 : -1) * range(random, 4.2, 8.4);
    z[i] = range(random, -TURN_AROUND_Z, TURN_AROUND_Z);
    speed[i] = range(random, 0.85, 1.55);
    phase[i] = random() * Math.PI * 2;
    hasUmbrella[i] = random() > 0.35 ? 1 : 0;
  }

  const dummy = new THREE.Object3D();
  const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
  let cursor = 0;
  let clock = 0;
  let umbrellaWeight = 1;

  // Everything starts placed so the first frames are not empty.
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

  /**
   * @param {object} threat crowd-reaction threat state; may be inert
   */
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
        // Out of sight: park it rather than paying for a matrix write.
        bodies.setMatrixAt(i, hidden);
        umbrellas.setMatrixAt(i, hidden);
        z[i] += direction[i] * speed[i] * elapsed;
        if (z[i] > TURN_AROUND_Z) z[i] = -TURN_AROUND_Z;
        if (z[i] < -TURN_AROUND_Z) z[i] = TURN_AROUND_Z;
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
          // Push toward the pavement, away from whatever is in the street.
          const away = Math.sign(x[i] - threat.x) || 1;
          shove[i] = Math.min(3.4, shove[i] + elapsed * 2.2);
          x[i] += away * elapsed * 1.6;
          // And hurry off along the street rather than walking into it.
          if (Math.sign(z[i] - threat.z) !== direction[i]) direction[i] *= -1;
        }
      } else if (shove[i] > 0) {
        // Drift back toward the walking line once things calm down.
        shove[i] = Math.max(0, shove[i] - elapsed * 0.6);
      }

      z[i] += direction[i] * speed[i] * scale * elapsed;
      phase[i] += elapsed * speed[i] * scale * 3.6;
      if (z[i] > TURN_AROUND_Z) z[i] = -TURN_AROUND_Z;
      if (z[i] < -TURN_AROUND_Z) z[i] = TURN_AROUND_Z;
      x[i] = THREE.MathUtils.clamp(x[i], -13.5, 13.5);

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
