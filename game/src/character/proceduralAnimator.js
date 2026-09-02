import { LOCOMOTION } from '../core/settings.js';
import { clamp, damp, lerp } from '../core/mathx.js';

/**
 * Code-driven pose generator used until real GLB clips exist.
 *
 * It reads a locomotion state and writes joint rotations on the rig. It never
 * allocates and never touches the scene graph outside `rig.bones`, so swapping it
 * for the GLB driver is a one-line change in `animationDriver.js`.
 */

const TAU = Math.PI * 2;

// Swing amplitudes (radians) at the reference gaits, blended by actual speed.
const SWING = {
  WALK_LEG: 0.5,
  SPRINT_LEG: 0.92,
  WALK_ARM: 0.42,
  SPRINT_ARM: 0.98,
  KNEE_BEND: 1.05,
  ELBOW_BEND: 0.55,
};

const BOB_WALK = 0.035;
const BOB_SPRINT = 0.085;

export function createProceduralAnimator() {
  // Smoothed blend weights — they lag the raw state so gait changes read as
  // transitions rather than as pops.
  const blend = {
    move: 0,
    sprint: 0,
    strafe: 0,
    backward: 0,
    dodge: 0,
    air: 0,
  };

  function update(rig, state, dt) {
    const bones = rig.bones;
    const speed = state.speed;

    const moveTarget = clamp(speed / LOCOMOTION.WALK_SPEED, 0, 1);
    const sprintTarget = clamp(
      (speed - LOCOMOTION.JOG_SPEED) / (LOCOMOTION.SPRINT_SPEED - LOCOMOTION.JOG_SPEED),
      0,
      1,
    );
    blend.move = damp(blend.move, moveTarget, 10, dt);
    blend.sprint = damp(blend.sprint, sprintTarget, 6, dt);
    blend.strafe = damp(blend.strafe, Math.abs(state.localRight), 9, dt);
    blend.backward = damp(blend.backward, Math.max(0, -state.localForward), 9, dt);
    blend.dodge = damp(blend.dodge, state.isDodging ? 1 : 0, 16, dt);
    blend.air = damp(blend.air, state.airborne ? 1 : 0, 11, dt);

    const phase = state.strideDistance * TAU;
    // Backpedalling reverses the swing so the legs read as walking backwards.
    const direction = lerp(1, -1, blend.backward);
    const swingPhase = phase * direction;

    const legAmp = lerp(SWING.WALK_LEG, SWING.SPRINT_LEG, blend.sprint) * blend.move;
    const armAmp = lerp(SWING.WALK_ARM, SWING.SPRINT_ARM, blend.sprint) * blend.move;
    // Strafing shortens the stride: the legs cross rather than stride out.
    const lateralDamp = lerp(1, 0.55, blend.strafe);

    poseLegs(bones, swingPhase, legAmp * lateralDamp, blend);
    poseArms(bones, swingPhase, armAmp * lateralDamp, blend);
    poseTorso(rig, state, swingPhase, blend, dt);
    poseIdle(bones, state, blend);
    poseDodge(bones, state, blend);
    poseAirborne(bones, blend);
  }

  return { update, dispose() {} };
}

function poseLegs(bones, phase, amplitude, blend) {
  for (const side of ['L', 'R']) {
    const offset = side === 'L' ? 0 : Math.PI;
    const swing = Math.sin(phase + offset);
    const upper = bones[`upperLeg${side}`];
    const lower = bones[`lowerLeg${side}`];
    const foot = bones[`foot${side}`];

    upper.rotation.x = swing * amplitude;
    // The knee only bends on the recovery half of the cycle.
    const recovery = Math.max(0, -Math.cos(phase + offset));
    lower.rotation.x = -recovery * SWING.KNEE_BEND * (0.35 + blend.sprint * 0.65) * blend.move;
    foot.rotation.x = -upper.rotation.x * 0.45 - lower.rotation.x * 0.5;

    // Strafing angles the feet outward so the stance opens into the movement.
    upper.rotation.z = blend.strafe * (side === 'L' ? -0.16 : 0.16);
  }
}

function poseArms(bones, phase, amplitude, blend) {
  for (const side of ['L', 'R']) {
    // Arms counter-swing against the legs on the same side.
    const offset = side === 'L' ? Math.PI : 0;
    const swing = Math.sin(phase + offset);
    const upper = bones[`upperArm${side}`];
    const lower = bones[`lowerArm${side}`];

    upper.rotation.x = swing * amplitude;
    // Sprinting pulls the elbows in and up; walking lets them hang.
    lower.rotation.x = -(0.12 + blend.sprint * SWING.ELBOW_BEND + Math.max(0, swing) * 0.35);
    upper.rotation.z = (side === 'L' ? -1 : 1) * (0.09 + blend.sprint * 0.12 + blend.strafe * 0.1);
  }
}

function poseTorso(rig, state, phase, blend, dt) {
  const hips = rig.bones.hips;
  const chest = rig.bones.chest;
  const spine = rig.bones.spine;
  const head = rig.bones.head;

  const bob = lerp(BOB_WALK, BOB_SPRINT, blend.sprint) * blend.move;
  // Two bounces per stride cycle — one per footfall.
  const bobOffset = Math.abs(Math.sin(phase)) * bob;
  const breath = Math.sin(state.breathPhase * TAU) * LOCOMOTION.BREATH_AMPLITUDE;

  // The rig's world height comes from the character transform; this is the
  // hip's offset within the body only.
  hips.position.y = rig.hipRestHeight + bobOffset - state.landDip + breath * (1 - blend.move);

  // Lean comes straight from the locomotion model.
  hips.rotation.x = state.leanPitch + blend.sprint * 0.16;
  hips.rotation.z = state.leanRoll;

  // Counter-rotation: shoulders twist against the hips as the legs swing.
  const twist = Math.sin(phase) * 0.13 * blend.move;
  spine.rotation.y = -twist;
  chest.rotation.y = twist * 1.6;
  chest.rotation.x = -state.leanPitch * 0.45 + blend.sprint * 0.1;
  chest.rotation.z = -state.leanRoll * 0.5;

  // The head stabilises: it resists the body's twist and roll, which is most of
  // what separates a person from a sliding capsule.
  head.rotation.y = damp(head.rotation.y, -chest.rotation.y * 0.8, 12, dt);
  head.rotation.z = damp(head.rotation.z, -state.leanRoll * 0.6, 10, dt);
  head.rotation.x = damp(head.rotation.x, -state.leanPitch * 0.5 - blend.sprint * 0.08, 10, dt);

  // The coat tail trails the movement.
  const tail = rig.bones.coatTail;
  tail.rotation.x = damp(tail.rotation.x, -blend.move * 0.22 - blend.sprint * 0.18, 7, dt);
}

function poseIdle(bones, state, blend) {
  const idleWeight = 1 - blend.move;
  if (idleWeight <= 0.001) return;

  const breath = Math.sin(state.breathPhase * TAU);
  const sway = Math.sin(state.breathPhase * TAU * 0.37);

  // Chest rises on the breath, shoulders follow a beat later.
  bones.chest.rotation.x += breath * 0.03 * idleWeight;
  bones.shoulderL.rotation.z += breath * 0.035 * idleWeight;
  bones.shoulderR.rotation.z -= breath * 0.035 * idleWeight;
  // A slow weight shift stops the idle from looking frozen.
  bones.hips.rotation.z += sway * 0.035 * idleWeight;
  bones.head.rotation.y += sway * 0.09 * idleWeight;
  bones.upperArmL.rotation.x += breath * 0.045 * idleWeight;
  bones.upperArmR.rotation.x -= breath * 0.045 * idleWeight;
}

function poseDodge(bones, state, blend) {
  const weight = blend.dodge;
  if (weight <= 0.001) return;

  const progress = clamp(state.dodgeTimer / LOCOMOTION.DODGE_DURATION, 0, 1);
  // Compress hard at the start of the roll, extend on the recovery.
  const compression = Math.sin(progress * Math.PI);
  const w = weight * compression;

  bones.hips.position.y -= 0.34 * w;
  bones.hips.rotation.x += 0.85 * w;
  bones.chest.rotation.x += 0.55 * w;
  bones.head.rotation.x += 0.3 * w;

  for (const side of ['L', 'R']) {
    bones[`upperLeg${side}`].rotation.x += 1.15 * w;
    bones[`lowerLeg${side}`].rotation.x -= 1.5 * w;
    bones[`upperArm${side}`].rotation.x += 0.9 * w;
    bones[`lowerArm${side}`].rotation.x -= 1.2 * w;
  }
}

function poseAirborne(bones, blend) {
  const w = blend.air;
  if (w <= 0.001) return;

  // Trailing leg tucks, leading leg reaches for the ground.
  bones.upperLegL.rotation.x = lerp(bones.upperLegL.rotation.x, 0.62, w);
  bones.lowerLegL.rotation.x = lerp(bones.lowerLegL.rotation.x, -0.95, w);
  bones.upperLegR.rotation.x = lerp(bones.upperLegR.rotation.x, -0.28, w);
  bones.lowerLegR.rotation.x = lerp(bones.lowerLegR.rotation.x, -0.35, w);
  bones.upperArmL.rotation.x = lerp(bones.upperArmL.rotation.x, -0.5, w);
  bones.upperArmR.rotation.x = lerp(bones.upperArmR.rotation.x, -0.5, w);
  bones.chest.rotation.x = lerp(bones.chest.rotation.x, 0.12, w);
}
