import * as THREE from 'three';
import { BOSS_STATE, stateProgress } from './bossBrain.js';
import { ATTACK } from './attackData.js';
import { clamp, damp, lerp, smootherstep } from '../core/mathx.js';

/**
 * Draws the Glass Warden from its brain state.
 *
 * Reads only; it never decides anything. Each attack has its own silhouette
 * during the wind-up, because the player has to be able to tell the three apart
 * before the active window opens — that readability is the whole encounter.
 */

const SHARD_COUNT = 9;

export function createBossPresenter(scene, position = { x: 0, z: -54 }) {
  const group = new THREE.Group();
  group.name = 'glassWarden';
  group.position.set(position.x, 0, position.z);
  group.visible = false;
  scene.add(group);

  const glass = new THREE.MeshStandardMaterial({
    color: 0x6e8299,
    roughness: 0.14,
    metalness: 0.55,
    emissive: 0x14202e,
    emissiveIntensity: 1.0,
    envMapIntensity: 1.6,
    flatShading: true,
  });

  // Large enough to loom over Cuma, small enough to still read as a shape
  // rather than a wall of glass when it closes in.
  const coreGeometry = new THREE.IcosahedronGeometry(1.5, 1);
  const core = new THREE.Mesh(coreGeometry, glass);
  core.position.y = 2.35;
  core.scale.set(0.7, 1.22, 0.7);
  group.add(core);

  const shardGeometry = new THREE.TetrahedronGeometry(0.62, 0);
  const shards = [];
  for (let i = 0; i < SHARD_COUNT; i += 1) {
    const mesh = new THREE.Mesh(shardGeometry, glass);
    group.add(mesh);
    shards.push({
      mesh,
      angle: (i / SHARD_COUNT) * Math.PI * 2,
      radius: 1.6 + (i % 3) * 0.3,
      height: 2.4 + Math.sin(i * 1.7) * 1.1,
      // Smoothed toward the pose the current state asks for.
      current: { radius: 1.6, height: 2.4, spread: 1 },
    });
  }

  let orbit = 0;
  let flash = 0;
  const shake = { amount: 0 };

  /**
   * The pose each state asks the shards to take.
   * radius  distance from the core
   * height  height above the ground
   * spin    how fast the ring turns
   * gather  0 spreads the shards evenly, 1 collects them to the front
   * lift    vertical offset applied to the core
   */
  function poseFor(state, attackId, progress) {
    switch (state) {
      case BOSS_STATE.ANTICIPATION:
        return anticipationPose(attackId, progress);
      case BOSS_STATE.ATTACK_ACTIVE:
        return activePose(attackId, progress);
      case BOSS_STATE.RECOVERY:
        // Loose and low: the Warden is open here and it should look like it.
        return { radius: 2.4, height: 1.5, spin: 0.5, gather: 0.15, lift: -0.35, tilt: 0.22 };
      case BOSS_STATE.STAGGER:
        // Composure gone: the ring sags and drifts.
        return { radius: 2.9, height: 1.0, spin: 0.2, gather: 0, lift: -0.7, tilt: 0.4 };
      case BOSS_STATE.PHASE_TRANSITION:
        return { radius: 1.1, height: 3.4, spin: 5.5, gather: 0, lift: 0.5, tilt: 0 };
      case BOSS_STATE.APPROACH:
        return { radius: 1.75, height: 2.5, spin: 1.5, gather: 0.2, lift: 0, tilt: 0.08 };
      default:
        return { radius: 1.6, height: 2.4, spin: 1.0, gather: 0, lift: 0, tilt: 0 };
    }
  }

  /** Each wind-up has a distinct silhouette so the three attacks read apart. */
  function anticipationPose(attackId, progress) {
    const t = smootherstep(progress);
    if (attackId === ATTACK.WIDE_SWEEP) {
      // Shards sweep out wide and level: a horizontal threat.
      return {
        radius: lerp(1.7, 3.3, t),
        height: lerp(2.4, 2.0, t),
        spin: lerp(1.0, -1.4, t),
        gather: 0,
        lift: 0,
        tilt: lerp(0, -0.18, t),
      };
    }
    if (attackId === ATTACK.HEAVY_IMPACT) {
      // Everything gathers upward and inward: the Warden rears to come down.
      return {
        radius: lerp(1.7, 0.9, t),
        height: lerp(2.4, 5.0, t),
        spin: lerp(1.0, 3.2, t),
        gather: 0,
        lift: lerp(0, 1.7, t),
        tilt: 0,
      };
    }
    // Forward pressure: shards align into a spear behind the core.
    return {
      radius: lerp(1.7, 1.15, t),
      height: lerp(2.4, 2.2, t),
      spin: lerp(1.0, 0.3, t),
      gather: t,
      lift: lerp(0, -0.2, t),
      tilt: lerp(0, 0.2, t),
    };
  }

  function activePose(attackId, progress) {
    if (attackId === ATTACK.WIDE_SWEEP) {
      // The ring whips around at speed, level with the player.
      return { radius: 3.6, height: 1.9, spin: -13, gather: 0, lift: -0.1, tilt: -0.1 };
    }
    if (attackId === ATTACK.HEAVY_IMPACT) {
      // Slam: the core drops and the shards blow outward along the ground.
      const t = smootherstep(progress);
      return {
        radius: lerp(0.9, 4.4, t),
        height: lerp(5.0, 0.5, t),
        spin: 2,
        gather: 0,
        lift: lerp(1.7, -0.6, t),
        tilt: 0,
      };
    }
    return { radius: 1.1, height: 2.2, spin: 1.0, gather: 1, lift: -0.15, tilt: 0.28 };
  }

  return {
    group,

    setVisible(visible) {
      group.visible = visible;
    },

    /** A one-off visual jolt, used on posture break and phase change. */
    punch(amount) {
      flash = Math.max(flash, amount);
      shake.amount = Math.max(shake.amount, amount * 0.4);
    },

    /**
     * @param {number} dt   render time, not combat time — this is cosmetic
     * @param {object} state the boss brain's state object
     */
    update(dt, state) {
      if (!group.visible) return;

      group.position.x = state.x;
      group.position.z = state.z;
      group.rotation.y = state.facing;

      const progress = stateProgress(state);
      const pose = poseFor(state.state, state.attackId, progress);

      orbit += dt * pose.spin;

      for (let i = 0; i < shards.length; i += 1) {
        const shard = shards[i];
        // Smoothing here is what keeps a state change from popping.
        shard.current.radius = damp(shard.current.radius, pose.radius, 9, dt);
        shard.current.height = damp(shard.current.height, pose.height + (shard.height - 2.4) * 0.5, 9, dt);
        shard.current.spread = damp(shard.current.spread, 1 - pose.gather * 0.86, 9, dt);

        // Gathering pulls every shard toward the facing direction.
        const angle = shard.angle * shard.current.spread + orbit;
        shard.mesh.position.set(
          Math.sin(angle) * shard.current.radius,
          shard.current.height,
          Math.cos(angle) * shard.current.radius,
        );
        shard.mesh.rotation.y += dt * 1.4;
        shard.mesh.rotation.x += dt * 0.8;
      }

      core.position.y = damp(core.position.y, 2.35 + pose.lift, 8, dt);
      core.rotation.x = damp(core.rotation.x, pose.tilt, 8, dt);
      core.rotation.y += dt * 0.35;

      if (shake.amount > 0) {
        shake.amount = Math.max(0, shake.amount - dt * 2.4);
        core.position.x = (Math.random() - 0.5) * shake.amount;
        core.position.z = (Math.random() - 0.5) * shake.amount;
      } else {
        core.position.x = 0;
        core.position.z = 0;
      }

      // The Warden brightens as it winds up and flares when something lands.
      const charge = state.state === BOSS_STATE.ANTICIPATION ? progress * 0.9 : 0;
      const stagger = state.state === BOSS_STATE.STAGGER ? -0.55 : 0;
      if (flash > 0) flash = Math.max(0, flash - dt * 3.2);
      glass.emissiveIntensity = clamp(1.0 + charge + flash * 2.4 + stagger, 0.2, 5);
    },

    dispose() {
      scene.remove(group);
      coreGeometry.dispose();
      shardGeometry.dispose();
      glass.dispose();
    },
  };
}
