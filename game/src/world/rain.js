import * as THREE from 'three';
import { PERFORMANCE } from '../core/settings.js';

/**
 * Rain: falling streaks plus impact ripples on the wet road.
 *
 * The whole system is two draw calls. Streaks live in a local box that is
 * re-centred on the player each frame, so particles wrap in local space and no
 * per-particle world maths is needed.
 */

const BOX = { x: 34, y: 22, z: 34 };
const FALL_SPEED_MIN = 22;
const FALL_SPEED_MAX = 34;
const WIND = { x: 1.6, z: 0.7 };
const RIPPLE_COUNT = 44;
const RIPPLE_LIFETIME = 0.62;

export function createRain(scene) {
  const count = PERFORMANCE.RAIN_STREAKS;
  const positions = new Float32Array(count * 6);
  const speeds = new Float32Array(count);
  const lengths = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    speeds[i] = FALL_SPEED_MIN + Math.random() * (FALL_SPEED_MAX - FALL_SPEED_MIN);
    lengths[i] = 0.42 + Math.random() * 0.68;
    seedStreak(positions, i, lengths[i], Math.random() * BOX.y);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);

  const material = new THREE.LineBasicMaterial({
    color: 0x9fb6d4,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
    fog: true,
  });

  const streaks = new THREE.LineSegments(geometry, material);
  streaks.frustumCulled = false;
  scene.add(streaks);

  // --- Ripples -----------------------------------------------------------
  const rippleGeometry = new THREE.RingGeometry(0.06, 0.1, 10);
  const rippleMaterial = new THREE.MeshBasicMaterial({
    color: 0xa8c0dd,
    transparent: true,
    opacity: 0.26,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  const ripples = new THREE.InstancedMesh(rippleGeometry, rippleMaterial, RIPPLE_COUNT);
  ripples.frustumCulled = false;
  scene.add(ripples);

  const rippleAge = new Float32Array(RIPPLE_COUNT);
  const rippleX = new Float32Array(RIPPLE_COUNT);
  const rippleZ = new Float32Array(RIPPLE_COUNT);
  for (let i = 0; i < RIPPLE_COUNT; i += 1) rippleAge[i] = Math.random() * RIPPLE_LIFETIME;

  const dummy = new THREE.Object3D();
  const attribute = geometry.attributes.position;

  function update(dt, centreX, centreZ) {
    streaks.position.set(centreX, 0, centreZ);

    for (let i = 0; i < count; i += 1) {
      const base = i * 6;
      const fall = speeds[i] * dt;
      positions[base + 1] -= fall;
      positions[base + 4] -= fall;
      positions[base] += WIND.x * dt;
      positions[base + 3] += WIND.x * dt;
      positions[base + 2] += WIND.z * dt;
      positions[base + 5] += WIND.z * dt;

      // Recycle once the streak's tail passes the ground.
      if (positions[base + 4] < -1) {
        seedStreak(positions, i, lengths[i], BOX.y);
      }
    }
    attribute.needsUpdate = true;

    for (let i = 0; i < RIPPLE_COUNT; i += 1) {
      rippleAge[i] += dt;
      if (rippleAge[i] >= RIPPLE_LIFETIME) {
        rippleAge[i] = 0;
        rippleX[i] = centreX + (Math.random() - 0.5) * 16;
        rippleZ[i] = centreZ + (Math.random() - 0.5) * 16;
      }
      const t = rippleAge[i] / RIPPLE_LIFETIME;
      const scale = 0.4 + t * 4.2;
      dummy.position.set(rippleX[i], 0.03, rippleZ[i]);
      dummy.rotation.set(-Math.PI / 2, 0, 0);
      dummy.scale.set(scale, scale, 1);
      dummy.updateMatrix();
      ripples.setMatrixAt(i, dummy.matrix);
    }
    ripples.instanceMatrix.needsUpdate = true;
  }

  return {
    update,
    setIntensity(value) {
      material.opacity = 0.3 * value;
      rippleMaterial.opacity = 0.26 * value;
    },
    dispose() {
      scene.remove(streaks);
      scene.remove(ripples);
      geometry.dispose();
      material.dispose();
      rippleGeometry.dispose();
      rippleMaterial.dispose();
    },
  };
}

function seedStreak(positions, index, length, topY) {
  const base = index * 6;
  const x = (Math.random() - 0.5) * BOX.x;
  const z = (Math.random() - 0.5) * BOX.z;
  const y = topY + Math.random() * 3;
  positions[base] = x;
  positions[base + 1] = y;
  positions[base + 2] = z;
  // The tail trails slightly behind on the wind, which gives the streak its slant.
  positions[base + 3] = x - WIND.x * 0.06;
  positions[base + 4] = y - length;
  positions[base + 5] = z - WIND.z * 0.06;
}
