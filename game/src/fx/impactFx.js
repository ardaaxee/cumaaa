import * as THREE from 'three';
import { createGlow } from '../world/textures.js';

/**
 * Impact effects, from a fixed pool.
 *
 * Nothing here is allocated after construction: a fixed number of rings and
 * sparks are built once and recycled, so a long fight cannot grow the scene or
 * the heap. Effects convey force through expansion, brightness and timing —
 * never through blood.
 */

const RING_COUNT = 10;
const SPARK_COUNT = 48;
const DUST_COUNT = 6;

export const FX = {
  HIT: 'hit',
  PARRY: 'parry',
  PERFECT_PARRY: 'perfectParry',
  POSTURE_BREAK: 'postureBreak',
  GROUND_SLAM: 'groundSlam',
  PHASE: 'phase',
};

/** Look of each effect: colour, size, lifetime and how it expands. */
const PRESETS = {
  [FX.HIT]: { color: 0xffd9a8, startScale: 0.35, endScale: 1.5, life: 0.3, opacity: 0.55, flat: false },
  [FX.PARRY]: { color: 0xbfd9ff, startScale: 0.4, endScale: 2.1, life: 0.34, opacity: 0.75, flat: false },
  [FX.PERFECT_PARRY]: {
    color: 0xe8f2ff,
    startScale: 0.5,
    endScale: 4.6,
    life: 0.62,
    opacity: 1.0,
    flat: false,
  },
  [FX.POSTURE_BREAK]: {
    color: 0xa8c6ef,
    startScale: 0.8,
    endScale: 6.4,
    life: 0.85,
    opacity: 0.85,
    flat: false,
  },
  [FX.GROUND_SLAM]: {
    color: 0xc9d7e8,
    startScale: 0.6,
    endScale: 7.5,
    life: 0.7,
    opacity: 0.6,
    flat: true,
  },
  [FX.PHASE]: { color: 0x9fc0e8, startScale: 1.0, endScale: 5.0, life: 0.9, opacity: 0.5, flat: false },
};

export function createImpactFx(scene) {
  const group = new THREE.Group();
  group.name = 'impactFx';
  scene.add(group);

  const disposables = [];
  const track = (object) => {
    disposables.push(object);
    return object;
  };

  // --- Expanding rings ----------------------------------------------------
  const ringGeometry = track(new THREE.RingGeometry(0.72, 1.0, 26));
  const rings = [];
  for (let i = 0; i < RING_COUNT; i += 1) {
    const material = track(
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    );
    const mesh = new THREE.Mesh(ringGeometry, material);
    mesh.visible = false;
    mesh.frustumCulled = false;
    group.add(mesh);
    rings.push({ mesh, material, life: 0, maxLife: 0, preset: null });
  }

  // --- Sparks: one Points cloud, recycled in slices -----------------------
  const sparkPositions = new Float32Array(SPARK_COUNT * 3);
  const sparkVelocities = new Float32Array(SPARK_COUNT * 3);
  const sparkLife = new Float32Array(SPARK_COUNT);
  const sparkGeometry = track(new THREE.BufferGeometry());
  sparkGeometry.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
  sparkGeometry.attributes.position.setUsage(THREE.DynamicDrawUsage);

  const sparkMaterial = track(
    new THREE.PointsMaterial({
      size: 0.16,
      color: 0xdfeaff,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      map: track(createGlow(64)),
    }),
  );
  const sparks = new THREE.Points(sparkGeometry, sparkMaterial);
  sparks.frustumCulled = false;
  group.add(sparks);
  let sparkCursor = 0;
  // Parked far below the world until used.
  for (let i = 0; i < SPARK_COUNT; i += 1) sparkPositions[i * 3 + 1] = -999;

  // --- Ground dust for heavy impacts -------------------------------------
  const dustGeometry = track(new THREE.PlaneGeometry(1, 1));
  const dust = [];
  for (let i = 0; i < DUST_COUNT; i += 1) {
    const material = track(
      new THREE.MeshBasicMaterial({
        map: track(createGlow(128)),
        color: 0x8fa4bd,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    );
    const mesh = new THREE.Mesh(dustGeometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.visible = false;
    mesh.frustumCulled = false;
    group.add(mesh);
    dust.push({ mesh, material, life: 0, maxLife: 0 });
  }

  let ringCursor = 0;
  let dustCursor = 0;

  function spawnRing(preset, x, y, z, facing) {
    const slot = rings[ringCursor];
    ringCursor = (ringCursor + 1) % RING_COUNT;

    slot.preset = preset;
    slot.life = 0;
    slot.maxLife = preset.life;
    slot.mesh.visible = true;
    slot.mesh.position.set(x, y, z);
    if (preset.flat) {
      slot.mesh.rotation.set(-Math.PI / 2, 0, 0);
    } else {
      // Face along the impact direction so the ring reads as a shockwave.
      slot.mesh.rotation.set(0, facing, 0);
    }
    slot.material.color.setHex(preset.color);
    slot.material.opacity = preset.opacity;
    slot.mesh.scale.setScalar(preset.startScale);
  }

  function spawnSparks(count, x, y, z, speed) {
    for (let i = 0; i < count; i += 1) {
      const index = sparkCursor;
      sparkCursor = (sparkCursor + 1) % SPARK_COUNT;

      sparkPositions[index * 3] = x;
      sparkPositions[index * 3 + 1] = y;
      sparkPositions[index * 3 + 2] = z;

      // Deterministic-enough scatter; visual only, never gameplay.
      const theta = Math.random() * Math.PI * 2;
      const pitch = Math.random() * 0.9 + 0.1;
      sparkVelocities[index * 3] = Math.cos(theta) * speed * Math.cos(pitch);
      sparkVelocities[index * 3 + 1] = Math.sin(pitch) * speed;
      sparkVelocities[index * 3 + 2] = Math.sin(theta) * speed * Math.cos(pitch);
      sparkLife[index] = 0.45 + Math.random() * 0.3;
    }
  }

  function spawnDust(x, z, scale) {
    const slot = dust[dustCursor];
    dustCursor = (dustCursor + 1) % DUST_COUNT;
    slot.life = 0;
    slot.maxLife = 0.8;
    slot.mesh.visible = true;
    slot.mesh.position.set(x, 0.06, z);
    slot.mesh.scale.setScalar(scale);
    slot.material.opacity = 0.34;
  }

  return {
    /**
     * @param {string} type one of FX
     * @param {object} at `{x, y, z}` in world space
     * @param {number} facing yaw the effect should orient along
     */
    play(type, at, facing = 0) {
      const preset = PRESETS[type];
      if (!preset) return;
      spawnRing(preset, at.x, at.y ?? 1.4, at.z, facing);

      if (type === FX.HIT) spawnSparks(6, at.x, at.y ?? 1.4, at.z, 2.6);
      if (type === FX.PARRY) spawnSparks(10, at.x, at.y ?? 1.4, at.z, 4.2);
      if (type === FX.PERFECT_PARRY) spawnSparks(18, at.x, at.y ?? 1.4, at.z, 6.4);
      if (type === FX.POSTURE_BREAK) spawnSparks(22, at.x, at.y ?? 1.8, at.z, 5.2);
      if (type === FX.GROUND_SLAM) {
        spawnSparks(14, at.x, 0.3, at.z, 4.0);
        spawnDust(at.x, at.z, 6.5);
      }
    },

    update(dt) {
      for (const slot of rings) {
        if (!slot.mesh.visible) continue;
        slot.life += dt;
        const t = slot.life / slot.maxLife;
        if (t >= 1) {
          slot.mesh.visible = false;
          continue;
        }
        const eased = 1 - (1 - t) ** 3;
        const preset = slot.preset;
        slot.mesh.scale.setScalar(preset.startScale + (preset.endScale - preset.startScale) * eased);
        slot.material.opacity = preset.opacity * (1 - t) ** 1.6;
      }

      let anyLive = false;
      for (let i = 0; i < SPARK_COUNT; i += 1) {
        if (sparkLife[i] <= 0) continue;
        anyLive = true;
        sparkLife[i] -= dt;
        if (sparkLife[i] <= 0) {
          sparkPositions[i * 3 + 1] = -999;
          continue;
        }
        sparkVelocities[i * 3 + 1] -= 9.5 * dt;
        sparkPositions[i * 3] += sparkVelocities[i * 3] * dt;
        sparkPositions[i * 3 + 1] += sparkVelocities[i * 3 + 1] * dt;
        sparkPositions[i * 3 + 2] += sparkVelocities[i * 3 + 2] * dt;
      }
      if (anyLive) sparkGeometry.attributes.position.needsUpdate = true;

      for (const slot of dust) {
        if (!slot.mesh.visible) continue;
        slot.life += dt;
        const t = slot.life / slot.maxLife;
        if (t >= 1) {
          slot.mesh.visible = false;
          continue;
        }
        slot.mesh.scale.setScalar(6.5 + t * 5);
        slot.material.opacity = 0.34 * (1 - t) ** 2;
      }
    },

    dispose() {
      scene.remove(group);
      for (const item of disposables) item.dispose?.();
    },
  };
}
