import * as THREE from 'three';
import { NPC_STATE, createNpcSchedule, isMovingState } from './npcSchedule.js';
import {
  REACTION,
  reactionFor,
  reactionHeading,
  speedScaleFor,
} from './crowdReactions.js';
import { PERFORMANCE } from '../core/settings.js';
import { createRandom, range } from '../core/random.js';

/**
 * TIER B — the market's local residents.
 *
 * A small number of people who actually live in the district: they walk the
 * waypoint graph, stop to shop, sit, watch, and get out of the way when the
 * Glass Warden starts moving. Cheaper than a character rig, far more
 * deliberate than the background crowd.
 *
 * Level of detail is by distance:
 *   near    stepped every frame, posed
 *   medium  stepped on a slower beat
 *   far     position integrated, no pose work
 *   distant not drawn at all
 */

const NEAR = 22;
const MEDIUM = 46;
const FAR = 78;

/** Seconds between updates at each tier. */
const MEDIUM_INTERVAL = 1 / 12;
const FAR_INTERVAL = 0.5;

const REACTION_SPEED = 2.6;

export function createNpcSystem(scene, { count = PERFORMANCE.NPC_COUNT } = {}) {
  const schedule = createNpcSchedule(0x9e7b12);
  const random = createRandom(0x51fa27);

  const bodyGeometry = new THREE.CapsuleGeometry(0.23, 1.0, 4, 10);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a4553,
    roughness: 0.82,
    metalness: 0.06,
  });
  const bodies = new THREE.InstancedMesh(bodyGeometry, bodyMaterial, count);
  bodies.frustumCulled = false;
  bodies.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(bodies);

  const headGeometry = new THREE.SphereGeometry(0.15, 8, 6);
  const headMaterial = new THREE.MeshStandardMaterial({
    color: 0xa87f66,
    roughness: 0.8,
    metalness: 0,
  });
  const heads = new THREE.InstancedMesh(headGeometry, headMaterial, count);
  heads.frustumCulled = false;
  heads.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(heads);

  const umbrellaGeometry = new THREE.ConeGeometry(0.54, 0.28, 8, 1, true);
  const umbrellaMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1f27,
    roughness: 0.72,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });
  const umbrellas = new THREE.InstancedMesh(umbrellaGeometry, umbrellaMaterial, count);
  umbrellas.frustumCulled = false;
  umbrellas.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(umbrellas);

  const agents = [];
  for (let i = 0; i < count; i += 1) {
    const agent = schedule.spawn();
    agent.hasUmbrella = random() > 0.4;
    agent.tint = range(random, 0.78, 1.18);
    agent.accrued = 0;
    agent.reaction = REACTION.CALM;
    agents.push(agent);
  }

  const dummy = new THREE.Object3D();
  const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
  const heading = { x: 0, z: 0, faceThreat: false };

  /** 0..1 — how visible umbrellas are, driven by weather. */
  let umbrellaWeight = 1;

  function writeAgent(index, agent, posed) {
    // A gentle bob while walking; standing agents breathe instead.
    const bob = posed
      ? isMovingState(agent.state)
        ? Math.abs(Math.sin(agent.phase)) * 0.055
        : Math.sin(agent.phase * 0.6) * 0.012
      : 0;

    dummy.position.set(agent.x, 0.82 + bob, agent.z);
    dummy.rotation.set(0, agent.facing, posed ? Math.sin(agent.phase) * 0.045 : 0);
    dummy.scale.setScalar(agent.tint);
    dummy.updateMatrix();
    bodies.setMatrixAt(index, dummy.matrix);

    dummy.position.y = 1.62 + bob;
    dummy.rotation.z = 0;
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    heads.setMatrixAt(index, dummy.matrix);

    if (agent.hasUmbrella && umbrellaWeight > 0.25) {
      dummy.position.y = 2.02 + bob;
      dummy.rotation.z = Math.sin(agent.phase) * 0.07;
      dummy.updateMatrix();
      umbrellas.setMatrixAt(index, dummy.matrix);
    } else {
      umbrellas.setMatrixAt(index, hidden);
    }
  }

  function park(index) {
    bodies.setMatrixAt(index, hidden);
    heads.setMatrixAt(index, hidden);
    umbrellas.setMatrixAt(index, hidden);
  }

  /** Moves an agent under a reaction instead of its schedule. */
  function stepReaction(agent, dt, threat) {
    reactionHeading(heading, agent.reaction, agent.x, agent.z, threat.x, threat.z);

    if (agent.reaction === REACTION.CURIOUS) {
      agent.facing = Math.atan2(threat.x - agent.x, threat.z - agent.z);
      return;
    }

    const speed = agent.speed * speedScaleFor(agent.reaction) * REACTION_SPEED * 0.5;
    agent.x += heading.x * speed * dt;
    agent.z += heading.z * speed * dt;
    agent.facing = Math.atan2(heading.x, heading.z);
    agent.phase += speed * dt * 3.2;

    // Fleeing agents drop their schedule position; they rejoin the graph at
    // whichever waypoint they are nearest once things calm down.
    agent.state = NPC_STATE.WALK;
  }

  return {
    agents,

    /** Umbrellas go away when it stops raining. */
    setRainWeight(value) {
      umbrellaWeight = value;
    },

    /**
     * @param {number} dt
     * @param {object} player `{ x, z }`
     * @param {object} threat crowd-reaction threat state
     */
    update(dt, player, threat) {
      if (!(dt > 0)) return;

      const alarmed = threat.intensity > 0.02;

      for (let i = 0; i < agents.length; i += 1) {
        const agent = agents[i];

        const dx = agent.x - player.x;
        const dz = agent.z - player.z;
        const distanceSq = dx * dx + dz * dz;

        if (distanceSq > FAR * FAR) {
          // Out of the world the player can see: keep a coarse schedule so the
          // district is not empty when they turn round, but draw nothing.
          agent.accrued += dt;
          if (agent.accrued >= FAR_INTERVAL) {
            schedule.step(agent, agent.accrued);
            agent.accrued = 0;
          }
          park(i);
          continue;
        }

        agent.reaction = alarmed
          ? reactionFor(Math.hypot(agent.x - threat.x, agent.z - threat.z), threat.intensity)
          : REACTION.CALM;

        if (distanceSq <= NEAR * NEAR) {
          if (agent.reaction !== REACTION.CALM) stepReaction(agent, dt, threat);
          else schedule.step(agent, dt);
          writeAgent(i, agent, true);
          continue;
        }

        if (distanceSq <= MEDIUM * MEDIUM) {
          agent.accrued += dt;
          if (agent.accrued >= MEDIUM_INTERVAL) {
            if (agent.reaction !== REACTION.CALM) stepReaction(agent, agent.accrued, threat);
            else schedule.step(agent, agent.accrued);
            agent.accrued = 0;
            writeAgent(i, agent, true);
          }
          continue;
        }

        agent.accrued += dt;
        if (agent.accrued >= FAR_INTERVAL) {
          schedule.step(agent, agent.accrued);
          agent.accrued = 0;
          // Far enough that a pose would never be seen.
          writeAgent(i, agent, false);
        }
      }

      bodies.instanceMatrix.needsUpdate = true;
      heads.instanceMatrix.needsUpdate = true;
      umbrellas.instanceMatrix.needsUpdate = true;
    },

    dispose() {
      scene.remove(bodies);
      scene.remove(heads);
      scene.remove(umbrellas);
      bodyGeometry.dispose();
      bodyMaterial.dispose();
      headGeometry.dispose();
      headMaterial.dispose();
      umbrellaGeometry.dispose();
      umbrellaMaterial.dispose();
    },
  };
}

export const NPC_LOD = { NEAR, MEDIUM, FAR, MEDIUM_INTERVAL, FAR_INTERVAL };
