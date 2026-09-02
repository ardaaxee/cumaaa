import * as THREE from 'three';
import { CAMERA, LOCOMOTION } from '../core/settings.js';
import { clamp, damp, valueNoise } from '../core/mathx.js';
import { scratch, sharedRaycaster } from '../core/scratch.js';
import { CAMERA_MODES, MODE, blendParams, cloneParams } from './cameraModes.js';

/**
 * The third-person camera rig.
 *
 * Responsibilities: shoulder framing, lagged follow, speed-based framing, sprint
 * FOV, collision avoidance and hand-held sway. It is the only writer of the
 * camera transform; cinematics steer it through offsets rather than by taking
 * the camera over.
 */
export function createCameraRig(camera, character) {
  const params = cloneParams(CAMERA_MODES[MODE.SHOULDER_RIGHT]);
  const blendFrom = cloneParams(params);
  const blendTo = cloneParams(params);
  let blendTime = 1;
  let blendDuration = 1;

  let yaw = 0;
  let pitch = -0.04;
  let yawTarget = 0;
  let pitchTarget = -0.04;

  const pivot = new THREE.Vector3(character.state.position.x, CAMERA.PIVOT_HEIGHT, character.state.position.z);
  let distance = params.distance;
  let collisionDistance = params.distance;
  let fov = params.fov;
  let swayTime = 0;

  /** Meshes tested for camera collision. Kept small and explicit — the rig never
   * raycasts the whole scene. */
  const colliders = [];

  /** Additive steering supplied by the director; all of it decays to zero. */
  const offset = {
    yaw: 0,
    pitch: 0,
    pivotX: 0,
    pivotY: 0,
    pivotZ: 0,
    /** 0 = look at the character, 1 = look at `lookTarget`. */
    lookWeight: 0,
    lookTarget: new THREE.Vector3(),
    fov: 0,
  };

  function setMode(mode, duration = CAMERA.MODE_BLEND_DEFAULT) {
    const target = CAMERA_MODES[mode];
    if (!target) return;
    // Blend from wherever the rig currently is, so an interrupted blend never
    // snaps back to the mode it was leaving.
    for (const key in params) blendFrom[key] = params[key];
    for (const key in target) blendTo[key] = target[key];
    blendDuration = Math.max(0.0001, duration);
    blendTime = 0;
  }

  function applyLook(intent, dt) {
    yawTarget += intent.lookYaw;
    pitchTarget = clamp(pitchTarget + intent.lookPitch, CAMERA.PITCH_MIN, CAMERA.PITCH_MAX);
    yaw = damp(yaw, yawTarget, params.rotationLag, dt);
    pitch = damp(pitch, pitchTarget, params.rotationLag, dt);
  }

  function resolveCollision(origin, direction, desiredDistance, dt) {
    if (colliders.length === 0) {
      collisionDistance = desiredDistance;
      return desiredDistance;
    }
    sharedRaycaster.set(origin, direction);
    sharedRaycaster.far = desiredDistance + CAMERA.COLLISION_RADIUS;
    const hits = sharedRaycaster.intersectObjects(colliders, false);
    let allowed = desiredDistance;
    if (hits.length > 0) {
      allowed = Math.max(CAMERA.COLLISION_MIN_DISTANCE, hits[0].distance - CAMERA.COLLISION_RADIUS);
    }
    // Pull in fast so the camera never clips; ease back out so it does not pop.
    const lag = allowed < collisionDistance ? CAMERA.COLLISION_PULL_IN_LAG : CAMERA.COLLISION_PUSH_OUT_LAG;
    collisionDistance = damp(collisionDistance, allowed, lag, dt);
    return Math.min(collisionDistance, desiredDistance);
  }

  function update(intent, dt) {
    if (blendTime < 1) {
      blendTime = Math.min(1, blendTime + dt / blendDuration);
      blendParams(params, blendFrom, blendTo, blendTime);
    }

    applyLook(intent, dt);

    const state = character.state;
    // The pivot lags the character, so the character drifts within frame instead
    // of being nailed to the centre.
    const targetX = state.position.x + offset.pivotX;
    const targetY = state.position.y + CAMERA.PIVOT_HEIGHT + params.height + offset.pivotY;
    const targetZ = state.position.z + offset.pivotZ;
    pivot.x = damp(pivot.x, targetX, params.pivotLag, dt);
    pivot.y = damp(pivot.y, targetY, params.pivotLag * 1.35, dt);
    pivot.z = damp(pivot.z, targetZ, params.pivotLag, dt);

    const speedRatio = clamp(state.speed / LOCOMOTION.SPRINT_SPEED, 0, 1);
    const speedDistance = Math.min(
      CAMERA.SPEED_DISTANCE_MAX,
      speedRatio * CAMERA.SPEED_DISTANCE_MAX * CAMERA.SPEED_DISTANCE_GAIN * 4,
    );
    distance = damp(distance, params.distance + speedDistance, CAMERA.DISTANCE_LAG, dt);

    const effectiveYaw = yaw + offset.yaw;
    const effectivePitch = clamp(pitch + params.pitchBias + offset.pitch, CAMERA.PITCH_MIN - 0.4, CAMERA.PITCH_MAX + 0.4);

    // Spherical offset behind the pivot.
    const horizontal = Math.cos(effectivePitch);
    scratch.camOffset.set(
      Math.sin(effectiveYaw) * horizontal,
      Math.sin(-effectivePitch),
      Math.cos(effectiveYaw) * horizontal,
    );

    scratch.camRayDir.copy(scratch.camOffset).normalize();
    const allowedDistance = resolveCollision(pivot, scratch.camRayDir, distance, dt);

    scratch.camDesired
      .copy(pivot)
      .addScaledVector(scratch.camRayDir, allowedDistance);

    // Shoulder offset is applied perpendicular to the view direction so it
    // survives every mode and every blend.
    const rightX = Math.cos(effectiveYaw);
    const rightZ = -Math.sin(effectiveYaw);
    scratch.camDesired.x += rightX * params.shoulder;
    scratch.camDesired.z += rightZ * params.shoulder;

    // Hand-held sway: low-frequency noise scaled by movement.
    swayTime += dt * CAMERA.SWAY_RATE;
    const swayScale = params.sway * (0.012 + speedRatio * CAMERA.SWAY_MOVE_GAIN * 0.03);
    scratch.camDesired.x += valueNoise(swayTime) * swayScale;
    scratch.camDesired.y += valueNoise(swayTime + 37.2) * swayScale * 0.8;

    camera.position.copy(scratch.camDesired);

    // Look target: the character's upper body, optionally pulled toward a world
    // point by the director.
    scratch.camLook.set(
      state.position.x + rightX * params.shoulder * 0.55,
      state.position.y + params.lookHeight,
      state.position.z + rightZ * params.shoulder * 0.55,
    );
    if (offset.lookWeight > 0.0001) {
      scratch.camLook.lerp(offset.lookTarget, offset.lookWeight);
    }
    camera.lookAt(scratch.camLook);

    const targetFov = params.fov + speedRatio * CAMERA.SPRINT_FOV_GAIN + offset.fov;
    const nextFov = damp(fov, targetFov, CAMERA.FOV_LAG, dt);
    if (Math.abs(nextFov - fov) > 0.001) {
      fov = nextFov;
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  }

  return {
    update,
    setMode,
    offset,
    params,
    get yaw() {
      return yaw;
    },
    get pitch() {
      return pitch;
    },
    /** Lets a cinematic hand the player a new resting yaw without a cut. */
    adoptYaw(value) {
      yawTarget = value;
      yaw = value;
    },
    nudgeYawTarget(value) {
      yawTarget = value;
    },
    registerColliders(meshes) {
      for (const mesh of meshes) colliders.push(mesh);
    },
    clearColliders() {
      colliders.length = 0;
    },
  };
}
