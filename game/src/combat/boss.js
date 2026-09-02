import * as THREE from 'three';
import { COMBAT } from '../core/settings.js';
import { damp } from '../core/mathx.js';

/**
 * THE GLASS WARDEN — carried over from the vertical slice unchanged in
 * behaviour: three phases, HP gate, and a chase that quickens each phase.
 * The mesh is rebuilt as faceted glass so it reads against the wet city.
 */
export function createBoss(scene, position = { x: 0, z: -54 }) {
  const group = new THREE.Group();
  group.name = 'glassWarden';
  group.position.set(position.x, 0, position.z);
  group.visible = false;
  scene.add(group);

  // Reflective, but not so metallic that it goes black wherever the generated
  // environment is dim. The faint emissive keeps the Warden readable at night.
  const glass = new THREE.MeshStandardMaterial({
    color: 0x6e8299,
    roughness: 0.14,
    metalness: 0.55,
    emissive: 0x14202e,
    emissiveIntensity: 1.0,
    envMapIntensity: 1.6,
    flatShading: true,
  });
  const coreGeometry = new THREE.IcosahedronGeometry(1.5, 1);
  const core = new THREE.Mesh(coreGeometry, glass);
  core.position.y = 2.6;
  core.scale.set(0.86, 1.5, 0.86);
  group.add(core);

  const shardGeometry = new THREE.TetrahedronGeometry(0.62, 0);
  const shards = [];
  for (let i = 0; i < 7; i += 1) {
    const shard = new THREE.Mesh(shardGeometry, glass);
    const angle = (i / 7) * Math.PI * 2;
    shard.position.set(Math.cos(angle) * 1.6, 2.4 + Math.sin(i * 1.7) * 1.1, Math.sin(angle) * 1.6);
    group.add(shard);
    shards.push({ mesh: shard, angle, radius: 1.6 + (i % 3) * 0.3 });
  }

  const state = {
    started: false,
    hp: 100,
    phase: 1,
    orbit: 0,
  };

  function chaseSpeed() {
    if (state.phase === 1) return 1.0;
    if (state.phase === 2) return 1.5;
    return 1.9;
  }

  return {
    group,
    state,

    start() {
      state.started = true;
      group.visible = true;
    },

    /** @returns {null|{phase:number}} a phase change, for the HUD to announce. */
    damage(amount) {
      if (!state.started || state.hp <= 0) return null;
      state.hp = Math.max(0, state.hp - amount);
      if (state.hp <= COMBAT.BOSS_PHASE_TWO_HP && state.phase === 1) {
        state.phase = 2;
        return { phase: 2 };
      }
      if (state.hp <= COMBAT.BOSS_PHASE_THREE_HP && state.phase === 2) {
        state.phase = 3;
        return { phase: 3 };
      }
      return null;
    },

    update(dt, playerPosition, engaged) {
      if (!state.started) return;

      state.orbit += dt * (0.7 + state.phase * 0.25);
      for (const shard of shards) {
        const angle = shard.angle + state.orbit;
        shard.mesh.position.x = Math.cos(angle) * shard.radius;
        shard.mesh.position.z = Math.sin(angle) * shard.radius;
        shard.mesh.rotation.y += dt * 1.4;
        shard.mesh.rotation.x += dt * 0.8;
      }
      core.rotation.y += dt * 0.35;

      if (!engaged || state.hp <= 0) return;

      const dx = playerPosition.x - group.position.x;
      const dz = playerPosition.z - group.position.z;
      const distance = Math.hypot(dx, dz);
      if (distance > 4) {
        const step = (chaseSpeed() * dt) / distance;
        group.position.x += dx * step;
        group.position.z += dz * step;
      }
      const targetYaw = Math.atan2(dx, dz);
      group.rotation.y = damp(group.rotation.y, targetYaw, 6, dt);
    },

    dispose() {
      scene.remove(group);
      coreGeometry.dispose();
      shardGeometry.dispose();
      glass.dispose();
    },
  };
}
