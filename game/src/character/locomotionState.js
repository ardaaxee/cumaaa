import { LOCOMOTION } from '../core/settings.js';
import { angleDelta, clamp, damp, dodgeEase, rotateTowards } from '../core/mathx.js';

/**
 * The character's movement model.
 *
 * Deliberately free of THREE and of the DOM: it works on plain numbers so the
 * whole feel of the character can be unit tested without a renderer. The rig and
 * the animator only ever *read* the state this produces.
 */

export const GAIT = { IDLE: 'idle', WALK: 'walk', JOG: 'jog', SPRINT: 'sprint' };

const GAIT_SPEED = {
  [GAIT.IDLE]: 0,
  [GAIT.WALK]: LOCOMOTION.WALK_SPEED,
  [GAIT.JOG]: LOCOMOTION.JOG_SPEED,
  [GAIT.SPRINT]: LOCOMOTION.SPRINT_SPEED,
};

const STRIDE_HZ = {
  [GAIT.WALK]: LOCOMOTION.STRIDE_HZ_WALK,
  [GAIT.JOG]: LOCOMOTION.STRIDE_HZ_JOG,
  [GAIT.SPRINT]: LOCOMOTION.STRIDE_HZ_SPRINT,
};

export function selectGait(magnitude, sprintHeld) {
  if (magnitude <= 0.02) return GAIT.IDLE;
  if (sprintHeld && magnitude > LOCOMOTION.WALK_STICK_THRESHOLD) return GAIT.SPRINT;
  if (magnitude < LOCOMOTION.WALK_STICK_THRESHOLD) return GAIT.WALK;
  if (magnitude < LOCOMOTION.JOG_STICK_THRESHOLD) return GAIT.JOG;
  return GAIT.JOG;
}

/**
 * Stride length for the current speed, so foot phase advances with distance
 * travelled rather than with time. This is what stops feet from sliding when
 * the character accelerates.
 */
export function strideLengthFor(speed) {
  if (speed <= LOCOMOTION.WALK_SPEED) return GAIT_SPEED[GAIT.WALK] / STRIDE_HZ[GAIT.WALK];
  if (speed <= LOCOMOTION.JOG_SPEED) {
    const t = (speed - LOCOMOTION.WALK_SPEED) / (LOCOMOTION.JOG_SPEED - LOCOMOTION.WALK_SPEED);
    const walk = GAIT_SPEED[GAIT.WALK] / STRIDE_HZ[GAIT.WALK];
    const jog = GAIT_SPEED[GAIT.JOG] / STRIDE_HZ[GAIT.JOG];
    return walk + (jog - walk) * t;
  }
  const t = clamp(
    (speed - LOCOMOTION.JOG_SPEED) / (LOCOMOTION.SPRINT_SPEED - LOCOMOTION.JOG_SPEED),
    0,
    1,
  );
  const jog = GAIT_SPEED[GAIT.JOG] / STRIDE_HZ[GAIT.JOG];
  const sprint = GAIT_SPEED[GAIT.SPRINT] / STRIDE_HZ[GAIT.SPRINT];
  return jog + (sprint - jog) * t;
}

/**
 * Backward and lateral movement are slower than forward movement, so the speed
 * cap depends on where the stick points relative to where the body faces.
 */
export function directionalSpeedScale(localForward, localRight) {
  const backward = Math.max(0, -localForward);
  const lateral = Math.abs(localRight);
  const backwardPenalty = 1 - backward * (1 - LOCOMOTION.BACKWARD_SPEED_SCALE);
  const lateralPenalty = 1 - lateral * (1 - LOCOMOTION.STRAFE_SPEED_SCALE);
  return backwardPenalty * lateralPenalty;
}

/**
 * Body-space basis.
 *
 * `facing` is a Y rotation applied to a rig modelled facing +Z, so the body's
 * forward axis is (sin f, cos f) and its right axis is (cos f, -sin f). Getting
 * these signs wrong silently taxes forward running with the backpedal penalty.
 */
const bodyForwardX = (facing) => Math.sin(facing);
const bodyForwardZ = (facing) => Math.cos(facing);
const bodyRightX = (facing) => Math.cos(facing);
const bodyRightZ = (facing) => -Math.sin(facing);

export function createLocomotionState(startX = 0, startZ = 0, startFacing = 0) {
  return {
    position: { x: startX, y: 0, z: startZ },
    velocity: { x: 0, z: 0 },
    verticalVelocity: 0,

    facing: startFacing,
    speed: 0,
    gait: GAIT.IDLE,

    /** Movement direction in body space; drives strafe / backpedal blending. */
    localForward: 0,
    localRight: 0,

    leanPitch: 0,
    leanRoll: 0,
    turnRate: 0,

    strideDistance: 0,
    breathPhase: 0,

    airborne: false,
    landDip: 0,

    dodgeTimer: 0,
    dodgeCooldown: 0,
    dodgeDirX: 0,
    dodgeDirZ: 0,
    isDodging: false,
    isInvulnerable: false,

    elapsed: 0,
  };
}

/**
 * Advances one frame of movement.
 *
 * @param {object} state   mutated in place (per-frame allocation is budgeted out)
 * @param {object} input   { moveX, moveY, magnitude, sprintHeld, cameraYaw, dodge, jump }
 * @param {number} dt      seconds
 */
export function updateLocomotion(state, input, dt) {
  if (dt <= 0) return state;
  state.elapsed += dt;

  const cameraYaw = input.cameraYaw ?? 0;
  // Camera-relative basis. +moveY pushes away from the camera.
  const forwardX = -Math.sin(cameraYaw);
  const forwardZ = -Math.cos(cameraYaw);
  const rightX = Math.cos(cameraYaw);
  const rightZ = -Math.sin(cameraYaw);

  let desiredX = forwardX * input.moveY + rightX * input.moveX;
  let desiredZ = forwardZ * input.moveY + rightZ * input.moveX;
  const desiredLength = Math.hypot(desiredX, desiredZ);
  if (desiredLength > 1e-4) {
    desiredX /= desiredLength;
    desiredZ /= desiredLength;
  }

  updateDodge(state, input, dt, desiredX, desiredZ, desiredLength);

  if (!state.isDodging) {
    applySteering(state, input, dt, desiredX, desiredZ, desiredLength);
  }

  applyVertical(state, input, dt);

  state.position.x += state.velocity.x * dt;
  state.position.z += state.velocity.z * dt;

  state.speed = Math.hypot(state.velocity.x, state.velocity.z);
  state.strideDistance += (state.speed * dt) / strideLengthFor(state.speed);
  state.breathPhase += dt * LOCOMOTION.BREATH_RATE;

  updateBodySpaceMovement(state);
  updateLean(state, dt);

  return state;
}

function updateDodge(state, input, dt, desiredX, desiredZ, desiredLength) {
  state.dodgeCooldown = Math.max(0, state.dodgeCooldown - dt);

  if (input.dodge && !state.isDodging && state.dodgeCooldown === 0 && !state.airborne) {
    state.isDodging = true;
    state.dodgeTimer = 0;
    if (desiredLength > 1e-3) {
      state.dodgeDirX = desiredX;
      state.dodgeDirZ = desiredZ;
    } else {
      // No stick input: dodge backwards, away from whatever is being faced.
      state.dodgeDirX = -bodyForwardX(state.facing);
      state.dodgeDirZ = -bodyForwardZ(state.facing);
    }
  }

  if (!state.isDodging) {
    state.isInvulnerable = false;
    return;
  }

  const previous = state.dodgeTimer;
  state.dodgeTimer = Math.min(LOCOMOTION.DODGE_DURATION, state.dodgeTimer + dt);

  // Displacement comes from the derivative of the ease, so the burst is a real
  // movement over time rather than the legacy single-frame position jump.
  const before = dodgeEase(previous / LOCOMOTION.DODGE_DURATION);
  const after = dodgeEase(state.dodgeTimer / LOCOMOTION.DODGE_DURATION);
  const step = (after - before) * LOCOMOTION.DODGE_DISTANCE;
  const stepSpeed = dt > 0 ? step / dt : 0;

  state.velocity.x = state.dodgeDirX * stepSpeed;
  state.velocity.z = state.dodgeDirZ * stepSpeed;
  state.facing = rotateTowards(
    state.facing,
    Math.atan2(state.dodgeDirX, state.dodgeDirZ),
    LOCOMOTION.TURN_RATE_STATIONARY * dt,
  );

  state.isInvulnerable =
    state.dodgeTimer >= LOCOMOTION.DODGE_IFRAME_START &&
    state.dodgeTimer <= LOCOMOTION.DODGE_IFRAME_END;

  if (state.dodgeTimer >= LOCOMOTION.DODGE_DURATION) {
    state.isDodging = false;
    state.isInvulnerable = false;
    state.dodgeCooldown = LOCOMOTION.DODGE_COOLDOWN;
  }
}

function applySteering(state, input, dt, desiredX, desiredZ, desiredLength) {
  const magnitude = clamp(input.magnitude ?? desiredLength, 0, 1);
  const gait = selectGait(magnitude, input.sprintHeld === true);
  state.gait = gait;

  // Within walk and jog the stick is analog, so the cap tracks the stick rather
  // than snapping between discrete speeds.
  let targetSpeed = 0;
  if (gait === GAIT.WALK) {
    targetSpeed = LOCOMOTION.WALK_SPEED * (magnitude / LOCOMOTION.WALK_STICK_THRESHOLD);
  } else if (gait === GAIT.JOG) {
    const t = clamp(
      (magnitude - LOCOMOTION.WALK_STICK_THRESHOLD) /
        (1 - LOCOMOTION.WALK_STICK_THRESHOLD),
      0,
      1,
    );
    targetSpeed = LOCOMOTION.WALK_SPEED + (LOCOMOTION.JOG_SPEED - LOCOMOTION.WALK_SPEED) * t;
  } else if (gait === GAIT.SPRINT) {
    targetSpeed = LOCOMOTION.SPRINT_SPEED;
  }

  if (desiredLength > 1e-4) {
    const localForward = desiredX * bodyForwardX(state.facing) + desiredZ * bodyForwardZ(state.facing);
    const localRight = desiredX * bodyRightX(state.facing) + desiredZ * bodyRightZ(state.facing);
    targetSpeed *= directionalSpeedScale(localForward, localRight);
  }

  const targetX = desiredX * targetSpeed;
  const targetZ = desiredZ * targetSpeed;

  const accelerating = targetSpeed > state.speed;
  let rate = LOCOMOTION.DECELERATION;
  if (accelerating) {
    rate = gait === GAIT.SPRINT ? LOCOMOTION.SPRINT_ACCELERATION : LOCOMOTION.ACCELERATION;
  }
  // Airborne control is heavily reduced so a jump commits to its arc.
  if (state.airborne) rate *= 0.22;

  const previousVx = state.velocity.x;
  const previousVz = state.velocity.z;
  state.velocity.x = damp(state.velocity.x, targetX, rate, dt);
  state.velocity.z = damp(state.velocity.z, targetZ, rate, dt);
  state.accelX = dt > 0 ? (state.velocity.x - previousVx) / dt : 0;
  state.accelZ = dt > 0 ? (state.velocity.z - previousVz) / dt : 0;

  updateFacing(state, input, dt);
}

/**
 * In free movement the body turns to face where it is going. In strafe mode —
 * used when locked onto something — it keeps facing where the camera looks, so
 * backpedalling and strafing become sustained states rather than the momentary
 * artefacts they would otherwise be while the body swings round.
 */
function updateFacing(state, input, dt) {
  if (input.strafeMode) {
    // Camera forward is (-sin yaw, -cos yaw); the body matches it at yaw + PI.
    const targetFacing = (input.cameraYaw ?? 0) + Math.PI;
    const delta = angleDelta(state.facing, targetFacing);
    state.facing = rotateTowards(
      state.facing,
      targetFacing,
      Math.abs(LOCOMOTION.TURN_RATE_STATIONARY * dt),
    );
    state.turnRate = dt > 0 ? delta / dt : 0;
    return;
  }

  const speed = Math.hypot(state.velocity.x, state.velocity.z);
  if (speed <= LOCOMOTION.IDLE_SPEED_EPSILON) {
    state.turnRate = damp(state.turnRate, 0, 6, dt);
    return;
  }

  const speedRatio = clamp(speed / LOCOMOTION.SPRINT_SPEED, 0, 1);
  // Fast movement turns in wider arcs; standing still, the character pivots.
  const turnRate =
    LOCOMOTION.TURN_RATE_STATIONARY +
    (LOCOMOTION.TURN_RATE_SPRINT - LOCOMOTION.TURN_RATE_STATIONARY) * speedRatio;
  const targetFacing = Math.atan2(state.velocity.x, state.velocity.z);
  const delta = angleDelta(state.facing, targetFacing);
  state.facing = rotateTowards(state.facing, targetFacing, Math.abs(turnRate * dt));
  state.turnRate = dt > 0 ? delta / dt : 0;
}

function applyVertical(state, input, dt) {
  if (input.jump && !state.airborne && !state.isDodging) {
    state.verticalVelocity = LOCOMOTION.JUMP_VELOCITY;
    state.airborne = true;
  }

  if (state.airborne) {
    state.verticalVelocity += LOCOMOTION.GRAVITY * dt;
    state.position.y += state.verticalVelocity * dt;
    if (state.position.y <= 0) {
      // Landing impact scales with how hard the character came down.
      const impact = Math.abs(state.verticalVelocity);
      state.position.y = 0;
      state.verticalVelocity = 0;
      state.airborne = false;
      state.landDip = Math.min(
        LOCOMOTION.LAND_DIP_MAX,
        impact * LOCOMOTION.LAND_DIP_PER_SPEED,
      );
    }
  } else {
    state.landDip = damp(state.landDip, 0, LOCOMOTION.LAND_RECOVERY, dt);
  }
}

function updateBodySpaceMovement(state) {
  if (state.speed <= LOCOMOTION.IDLE_SPEED_EPSILON) {
    state.localForward = 0;
    state.localRight = 0;
    return;
  }
  const dirX = state.velocity.x / state.speed;
  const dirZ = state.velocity.z / state.speed;
  state.localForward = dirX * bodyForwardX(state.facing) + dirZ * bodyForwardZ(state.facing);
  state.localRight = dirX * bodyRightX(state.facing) + dirZ * bodyRightZ(state.facing);
}

function updateLean(state, dt) {
  const accelX = state.accelX ?? 0;
  const accelZ = state.accelZ ?? 0;
  // Project acceleration into body space so speeding up leans forward and
  // braking leans back, independent of which way the character faces.
  const forwardAccel =
    accelX * bodyForwardX(state.facing) + accelZ * bodyForwardZ(state.facing);

  const targetPitch = clamp(
    forwardAccel * LOCOMOTION.LEAN_PITCH_PER_ACCEL,
    -LOCOMOTION.LEAN_MAX_PITCH,
    LOCOMOTION.LEAN_MAX_PITCH,
  );
  const speedRatio = clamp(state.speed / LOCOMOTION.SPRINT_SPEED, 0, 1);
  const targetRoll = clamp(
    -state.turnRate * LOCOMOTION.LEAN_ROLL_PER_TURN * speedRatio,
    -LOCOMOTION.LEAN_MAX_ROLL,
    LOCOMOTION.LEAN_MAX_ROLL,
  );

  state.leanPitch = damp(state.leanPitch, targetPitch, LOCOMOTION.LEAN_SMOOTHING, dt);
  state.leanRoll = damp(state.leanRoll, targetRoll, LOCOMOTION.LEAN_SMOOTHING, dt);
}
