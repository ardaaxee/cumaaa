import * as THREE from 'three';
import { PERFORMANCE } from '../core/settings.js';
import { createRandom, range } from '../core/random.js';

/**
 * Meridian Market's pedestrians.
 *
 * Two instanced meshes (bodies, umbrellas) and a bounded update: only
 * CROWD_UPDATES_PER_FRAME agents are re-integrated each frame, each catching up
 * on the time that actually passed since it was last touched. Distant agents are
 * parked entirely.
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

  // Everything starts placed so the first frames are not empty.
  for (let i = 0; i < count; i += 1) writeAgent(i);

  function writeAgent(i) {
    const bob = Math.abs(Math.sin(phase[i])) * 0.055;
    dummy.position.set(x[i], 0.78 + bob, z[i]);
    dummy.rotation.set(0, direction[i] > 0 ? 0 : Math.PI, Math.sin(phase[i]) * 0.05);
    dummy.updateMatrix();
    bodies.setMatrixAt(i, dummy.matrix);

    if (hasUmbrella[i]) {
      dummy.position.y = 1.62 + bob;
      dummy.rotation.z = Math.sin(phase[i]) * 0.08;
      dummy.updateMatrix();
      umbrellas.setMatrixAt(i, dummy.matrix);
    } else {
      umbrellas.setMatrixAt(i, hidden);
    }
  }

  function update(dt, playerX, playerZ) {
    clock += dt;

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

      z[i] += direction[i] * speed[i] * elapsed;
      phase[i] += elapsed * speed[i] * 3.6;
      if (z[i] > TURN_AROUND_Z) z[i] = -TURN_AROUND_Z;
      if (z[i] < -TURN_AROUND_Z) z[i] = TURN_AROUND_Z;

      writeAgent(i);
    }

    bodies.instanceMatrix.needsUpdate = true;
    umbrellas.instanceMatrix.needsUpdate = true;
  }

  return {
    update,
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
