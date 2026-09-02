import { describe, expect, test } from 'vitest';
import {
  GAIT,
  createLocomotionState,
  directionalSpeedScale,
  selectGait,
  strideLengthFor,
  updateLocomotion,
} from '../src/character/locomotionState.js';
import { LOCOMOTION } from '../src/core/settings.js';

const STEP = 1 / 60;

/** Runs the model for `seconds` with a fixed input. */
function simulate(state, input, seconds) {
  const frames = Math.round(seconds / STEP);
  for (let i = 0; i < frames; i += 1) {
    updateLocomotion(state, input, STEP);
    // Edge-triggered inputs only fire on their first frame.
    input = { ...input, dodge: false, jump: false };
  }
  return state;
}

const forwardInput = (overrides = {}) => ({
  moveX: 0,
  moveY: 1,
  magnitude: 1,
  sprintHeld: false,
  cameraYaw: 0,
  dodge: false,
  jump: false,
  ...overrides,
});

describe('selectGait', () => {
  test('returns idle for a centred stick', () => {
    expect(selectGait(0, false)).toBe(GAIT.IDLE);
  });

  test('returns walk for a lightly pushed stick', () => {
    expect(selectGait(0.25, false)).toBe(GAIT.WALK);
  });

  test('returns jog for a fully pushed stick', () => {
    expect(selectGait(1, false)).toBe(GAIT.JOG);
  });

  test('returns sprint only when sprint is held past the walk threshold', () => {
    expect(selectGait(1, true)).toBe(GAIT.SPRINT);
    expect(selectGait(0.1, true)).toBe(GAIT.WALK);
  });
});

describe('strideLengthFor', () => {
  test('grows with speed so faster gaits take longer strides', () => {
    expect(strideLengthFor(LOCOMOTION.SPRINT_SPEED)).toBeGreaterThan(
      strideLengthFor(LOCOMOTION.WALK_SPEED),
    );
  });

  test('is continuous across the gait boundaries', () => {
    const below = strideLengthFor(LOCOMOTION.JOG_SPEED - 0.001);
    const above = strideLengthFor(LOCOMOTION.JOG_SPEED + 0.001);
    expect(Math.abs(above - below)).toBeLessThan(0.01);
  });
});

describe('directionalSpeedScale', () => {
  test('leaves forward movement at full speed', () => {
    expect(directionalSpeedScale(1, 0)).toBeCloseTo(1, 6);
  });

  test('penalises backpedalling', () => {
    expect(directionalSpeedScale(-1, 0)).toBeCloseTo(LOCOMOTION.BACKWARD_SPEED_SCALE, 6);
  });

  test('penalises strafing less than backpedalling', () => {
    expect(directionalSpeedScale(0, 1)).toBeGreaterThan(directionalSpeedScale(-1, 0));
  });
});

describe('acceleration and deceleration', () => {
  test('does not reach top speed instantly', () => {
    const state = createLocomotionState();
    updateLocomotion(state, forwardInput(), STEP);
    expect(state.speed).toBeGreaterThan(0);
    expect(state.speed).toBeLessThan(LOCOMOTION.JOG_SPEED * 0.5);
  });

  test('settles at the jog speed on a full stick', () => {
    const state = simulate(createLocomotionState(), forwardInput(), 2.5);
    expect(state.speed).toBeCloseTo(LOCOMOTION.JOG_SPEED, 1);
    expect(state.gait).toBe(GAIT.JOG);
  });

  test('reaches sprint speed only while sprint is held', () => {
    const state = simulate(createLocomotionState(), forwardInput({ sprintHeld: true }), 3);
    expect(state.speed).toBeGreaterThan(LOCOMOTION.JOG_SPEED + 1);
    expect(state.gait).toBe(GAIT.SPRINT);
  });

  test('brakes faster than it accelerates', () => {
    // Measured over a short window: both curves are ~99% converged after a
    // quarter second, so a long window compares nothing but rounding.
    const WINDOW = 0.05;

    const running = simulate(createLocomotionState(), forwardInput(), 3);
    const topSpeed = running.speed;
    simulate(running, forwardInput({ moveX: 0, moveY: 0, magnitude: 0 }), WINDOW);
    const fractionLost = 1 - running.speed / topSpeed;

    const starting = simulate(createLocomotionState(), forwardInput(), WINDOW);
    const fractionGained = starting.speed / topSpeed;

    expect(fractionLost).toBeGreaterThan(fractionGained);
  });

  test('comes to rest when the stick is released', () => {
    const state = simulate(createLocomotionState(), forwardInput(), 2);
    simulate(state, forwardInput({ moveX: 0, moveY: 0, magnitude: 0 }), 2);
    expect(state.speed).toBeLessThan(0.05);
  });

  test('a light stick produces a walk, not a jog', () => {
    const state = simulate(createLocomotionState(), forwardInput({ magnitude: 0.3 }), 2);
    expect(state.gait).toBe(GAIT.WALK);
    expect(state.speed).toBeLessThan(LOCOMOTION.WALK_SPEED + 0.2);
  });
});

describe('rotation', () => {
  test('never rotates faster than the configured turn rate, even on a reversal', () => {
    // Facing follows actual velocity, so a stick reversal swings the body round
    // through zero speed. The guarantee that matters is that no single frame
    // snaps the character to a new direction.
    const state = simulate(createLocomotionState(), forwardInput({ sprintHeld: true }), 2);
    const maxStep = LOCOMOTION.TURN_RATE_STATIONARY * STEP + 1e-9;

    let previousFacing = state.facing;
    for (let i = 0; i < 120; i += 1) {
      updateLocomotion(state, forwardInput({ moveY: -1, sprintHeld: true }), STEP);
      const step = Math.abs(
        Math.atan2(Math.sin(state.facing - previousFacing), Math.cos(state.facing - previousFacing)),
      );
      expect(step).toBeLessThanOrEqual(maxStep);
      previousFacing = state.facing;
    }
  });

  test('does swing round to the reversed direction over time', () => {
    const state = simulate(createLocomotionState(), forwardInput(), 2);
    const facingBefore = state.facing;
    simulate(state, forwardInput({ moveY: -1 }), 2);
    expect(Math.abs(Math.sin(state.facing - facingBefore))).toBeLessThan(0.2);
    expect(Math.cos(state.facing - facingBefore)).toBeLessThan(-0.8);
  });

  test('eventually faces the new direction', () => {
    const state = simulate(createLocomotionState(), forwardInput(), 1);
    simulate(state, forwardInput({ moveY: 0, moveX: 1 }), 3);
    // +X with a zero camera yaw means facing +X.
    expect(Math.abs(Math.sin(state.facing) - 1)).toBeLessThan(0.1);
  });
});

describe('camera-relative movement', () => {
  test('a forward stick with a rotated camera moves along the camera axis', () => {
    const state = createLocomotionState();
    simulate(state, forwardInput({ cameraYaw: Math.PI / 2 }), 1.5);
    // Camera yaw of PI/2 makes "forward" the -X axis.
    expect(state.position.x).toBeLessThan(-0.5);
    expect(Math.abs(state.position.z)).toBeLessThan(0.5);
  });
});

describe('strafe and backward', () => {
  test('reports body-space direction while strafing', () => {
    const state = simulate(createLocomotionState(), forwardInput({ moveY: 0, moveX: 1 }), 0.1);
    expect(Math.abs(state.localRight)).toBeGreaterThan(0.2);
  });

  test('in free movement the body always turns to face where it is going', () => {
    // This is why backpedal and strafe need strafe mode to be sustained states.
    const state = simulate(createLocomotionState(), forwardInput({ moveY: -1 }), 2);
    expect(state.localForward).toBeGreaterThan(0.9);
  });
});

describe('strafe mode', () => {
  test('keeps the body facing the camera instead of the movement direction', () => {
    const state = simulate(
      createLocomotionState(),
      forwardInput({ moveX: 1, moveY: 0, strafeMode: true }),
      1.5,
    );
    // Camera yaw 0 means the body should settle facing PI, whatever it does.
    expect(Math.cos(state.facing)).toBeLessThan(-0.95);
  });

  test('sustains a strafe rather than turning into it', () => {
    const state = simulate(
      createLocomotionState(),
      forwardInput({ moveX: 1, moveY: 0, strafeMode: true }),
      2,
    );
    expect(Math.abs(state.localRight)).toBeGreaterThan(0.9);
    expect(Math.abs(state.localForward)).toBeLessThan(0.2);
  });

  test('sustains a backpedal and caps it below forward speed', () => {
    const forward = simulate(
      createLocomotionState(),
      forwardInput({ strafeMode: true }),
      3,
    );
    const backward = simulate(
      createLocomotionState(),
      forwardInput({ moveY: -1, strafeMode: true }),
      3,
    );

    expect(backward.localForward).toBeLessThan(-0.9);
    expect(backward.speed).toBeLessThan(forward.speed);
    expect(backward.speed / forward.speed).toBeCloseTo(LOCOMOTION.BACKWARD_SPEED_SCALE, 1);
  });

  test('caps a strafe below forward speed but above a backpedal', () => {
    const forward = simulate(createLocomotionState(), forwardInput({ strafeMode: true }), 3);
    const strafe = simulate(
      createLocomotionState(),
      forwardInput({ moveX: 1, moveY: 0, strafeMode: true }),
      3,
    );
    const backward = simulate(
      createLocomotionState(),
      forwardInput({ moveY: -1, strafeMode: true }),
      3,
    );

    expect(strafe.speed).toBeLessThan(forward.speed);
    expect(strafe.speed).toBeGreaterThan(backward.speed);
  });

  test('turns smoothly when the camera swings round', () => {
    const state = createLocomotionState();
    const maxStep = LOCOMOTION.TURN_RATE_STATIONARY * STEP + 1e-9;
    let previous = state.facing;

    for (let i = 0; i < 120; i += 1) {
      updateLocomotion(state, forwardInput({ strafeMode: true, cameraYaw: Math.PI }), STEP);
      const step = Math.abs(
        Math.atan2(Math.sin(state.facing - previous), Math.cos(state.facing - previous)),
      );
      expect(step).toBeLessThanOrEqual(maxStep);
      previous = state.facing;
    }
  });
});

describe('dodge', () => {
  test('travels over time instead of teleporting', () => {
    const state = createLocomotionState();
    updateLocomotion(state, forwardInput({ dodge: true }), STEP);
    const afterOneFrame = Math.hypot(state.position.x, state.position.z);

    // A single frame must not cover the whole dodge distance.
    expect(afterOneFrame).toBeLessThan(LOCOMOTION.DODGE_DISTANCE * 0.5);
    expect(state.isDodging).toBe(true);
  });

  test('covers close to the configured distance in total', () => {
    const state = createLocomotionState();
    updateLocomotion(state, forwardInput({ dodge: true }), STEP);
    simulate(state, forwardInput({ moveX: 0, moveY: 0, magnitude: 0 }), LOCOMOTION.DODGE_DURATION);

    const travelled = Math.hypot(state.position.x, state.position.z);
    expect(travelled).toBeGreaterThan(LOCOMOTION.DODGE_DISTANCE * 0.8);
    expect(state.isDodging).toBe(false);
  });

  test('opens an invulnerability window part-way through', () => {
    const state = createLocomotionState();
    updateLocomotion(state, forwardInput({ dodge: true }), STEP);
    expect(state.isInvulnerable).toBe(false);

    simulate(state, forwardInput({ moveX: 0, moveY: 0, magnitude: 0 }), 0.15);
    expect(state.isInvulnerable).toBe(true);
  });

  test('cannot be re-triggered until the cooldown expires', () => {
    const state = createLocomotionState();
    updateLocomotion(state, forwardInput({ dodge: true }), STEP);
    simulate(state, forwardInput({ moveX: 0, moveY: 0, magnitude: 0 }), LOCOMOTION.DODGE_DURATION);

    const positionAfterFirst = { ...state.position };
    updateLocomotion(state, forwardInput({ dodge: true, moveX: 0, moveY: 0, magnitude: 0 }), STEP);
    expect(state.isDodging).toBe(false);
    expect(state.position.x).toBeCloseTo(positionAfterFirst.x, 3);
  });

  test('dodges backwards when the stick is centred', () => {
    const state = createLocomotionState();
    state.facing = 0; // facing -Z
    updateLocomotion(state, forwardInput({ moveX: 0, moveY: 0, magnitude: 0, dodge: true }), STEP);
    expect(state.dodgeDirZ).toBeCloseTo(-1, 3);
  });
});

describe('jump and landing', () => {
  test('leaves the ground and returns to it', () => {
    const state = createLocomotionState();
    updateLocomotion(state, forwardInput({ jump: true }), STEP);
    expect(state.airborne).toBe(true);
    expect(state.position.y).toBeGreaterThan(0);

    simulate(state, forwardInput(), 1.5);
    expect(state.airborne).toBe(false);
    expect(state.position.y).toBe(0);
  });

  test('produces a landing dip proportional to the impact', () => {
    const state = createLocomotionState();
    updateLocomotion(state, forwardInput({ jump: true }), STEP);
    // Land: run until the character is back on the ground.
    for (let i = 0; i < 200 && state.airborne; i += 1) {
      updateLocomotion(state, forwardInput(), STEP);
    }
    expect(state.landDip).toBeGreaterThan(0.05);
  });

  test('recovers from the landing dip', () => {
    const state = createLocomotionState();
    updateLocomotion(state, forwardInput({ jump: true }), STEP);
    simulate(state, forwardInput(), 2.5);
    expect(state.landDip).toBeLessThan(0.02);
  });
});

describe('lean and stride', () => {
  test('leans forward while accelerating', () => {
    const state = createLocomotionState();
    simulate(state, forwardInput({ sprintHeld: true }), 0.3);
    expect(state.leanPitch).not.toBe(0);
    expect(Math.abs(state.leanPitch)).toBeLessThanOrEqual(LOCOMOTION.LEAN_MAX_PITCH + 1e-6);
  });

  test('keeps lean inside its clamps under a hard direction reversal', () => {
    const state = simulate(createLocomotionState(), forwardInput({ sprintHeld: true }), 2);
    simulate(state, forwardInput({ moveY: -1, sprintHeld: true }), 1);
    expect(Math.abs(state.leanRoll)).toBeLessThanOrEqual(LOCOMOTION.LEAN_MAX_ROLL + 1e-6);
  });

  test('advances stride with distance, not with time', () => {
    const moving = simulate(createLocomotionState(), forwardInput(), 1);
    const still = simulate(createLocomotionState(), forwardInput({ moveX: 0, moveY: 0, magnitude: 0 }), 1);
    expect(moving.strideDistance).toBeGreaterThan(0.5);
    expect(still.strideDistance).toBe(0);
  });

  test('breathes even while standing still', () => {
    const state = simulate(createLocomotionState(), forwardInput({ moveX: 0, moveY: 0, magnitude: 0 }), 1);
    expect(state.breathPhase).toBeGreaterThan(0);
  });
});

describe('robustness', () => {
  test('ignores a non-positive delta', () => {
    const state = createLocomotionState();
    updateLocomotion(state, forwardInput(), 0);
    expect(state.speed).toBe(0);
    expect(state.position.x).toBe(0);
  });

  test('produces finite state after a long chaotic run', () => {
    const state = createLocomotionState();
    for (let i = 0; i < 1200; i += 1) {
      updateLocomotion(
        state,
        forwardInput({
          moveX: Math.sin(i * 0.31),
          moveY: Math.cos(i * 0.17),
          magnitude: 1,
          sprintHeld: i % 7 === 0,
          cameraYaw: i * 0.02,
          dodge: i % 97 === 0,
          jump: i % 151 === 0,
        }),
        STEP,
      );
    }
    for (const value of [state.position.x, state.position.z, state.speed, state.facing, state.leanPitch]) {
      expect(Number.isFinite(value)).toBe(true);
    }
  });
});
