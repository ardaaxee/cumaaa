import { describe, expect, test } from 'vitest';
import { ACTIONS, createIntent } from '../src/input/intent.js';
import { PAD_BUTTONS, applyGamepadState } from '../src/input/gamepad.js';
import { computeClipWeights, CLIPS } from '../src/character/animationDriver.js';
import { createLocomotionState, updateLocomotion } from '../src/character/locomotionState.js';
import { LOCOMOTION } from '../src/core/settings.js';

/** Builds a standard-mapping gamepad snapshot. */
function makePad({ axes = [0, 0, 0, 0], down = [] } = {}) {
  const buttons = [];
  for (let i = 0; i < 17; i += 1) buttons.push({ pressed: down.includes(i) });
  return { axes, buttons, connected: true };
}

describe('intent', () => {
  test('starts neutral', () => {
    const intent = createIntent();
    expect(intent.moveX).toBe(0);
    expect(intent.moveMagnitude).toBe(0);
    for (const action of ACTIONS) expect(intent.pressed[action]).toBe(false);
  });

  test('consume reads an action exactly once', () => {
    const intent = createIntent();
    intent.press('dodge');
    expect(intent.consume('dodge')).toBe(true);
    expect(intent.consume('dodge')).toBe(false);
  });

  test('beginFrame clears axes but keeps queued actions', () => {
    const intent = createIntent();
    intent.moveX = 0.5;
    intent.press('parry');
    intent.beginFrame();
    expect(intent.moveX).toBe(0);
    expect(intent.pressed.parry).toBe(true);
  });

  test('an unknown action name is ignored rather than added', () => {
    const intent = createIntent();
    intent.press('teleport');
    expect(intent.pressed.teleport).toBeUndefined();
  });
});

describe('gamepad mapping', () => {
  test('the left stick drives movement', () => {
    const intent = createIntent();
    applyGamepadState(makePad({ axes: [0.9, -0.9, 0, 0] }), intent, {}, 0.016);
    expect(intent.moveX).toBeGreaterThan(0.5);
    expect(intent.moveY).toBeGreaterThan(0.5);
  });

  test('the right stick drives the camera', () => {
    const intent = createIntent();
    applyGamepadState(makePad({ axes: [0, 0, 1, 1] }), intent, {}, 0.016);
    expect(intent.lookYaw).toBeLessThan(0);
    expect(intent.lookPitch).toBeLessThan(0);
  });

  test('L3 holds sprint', () => {
    const intent = createIntent();
    applyGamepadState(makePad({ down: [PAD_BUTTONS.sprint] }), intent, {}, 0.016);
    expect(intent.sprintHeld).toBe(true);
  });

  test('Circle dodges, L1 parries, R1 acts, Triangle focuses', () => {
    const intent = createIntent();
    applyGamepadState(
      makePad({
        down: [PAD_BUTTONS.dodge, PAD_BUTTONS.parry, PAD_BUTTONS.action, PAD_BUTTONS.focus],
      }),
      intent,
      {},
      0.016,
    );
    expect(intent.pressed.dodge).toBe(true);
    expect(intent.pressed.parry).toBe(true);
    expect(intent.pressed.action).toBe(true);
    expect(intent.pressed.focus).toBe(true);
  });

  test('buttons are edge-triggered, so holding does not repeat', () => {
    const intent = createIntent();
    const previous = {};
    const pad = makePad({ down: [PAD_BUTTONS.dodge] });

    applyGamepadState(pad, intent, previous, 0.016);
    expect(intent.consume('dodge')).toBe(true);

    applyGamepadState(pad, intent, previous, 0.016);
    expect(intent.consume('dodge')).toBe(false);
  });

  test('releasing and pressing again re-triggers', () => {
    const intent = createIntent();
    const previous = {};
    applyGamepadState(makePad({ down: [PAD_BUTTONS.dodge] }), intent, previous, 0.016);
    intent.consume('dodge');
    applyGamepadState(makePad({ down: [] }), intent, previous, 0.016);
    applyGamepadState(makePad({ down: [PAD_BUTTONS.dodge] }), intent, previous, 0.016);
    expect(intent.consume('dodge')).toBe(true);
  });

  test('a resting stick inside the dead zone produces no movement', () => {
    const intent = createIntent();
    applyGamepadState(makePad({ axes: [0.08, -0.08, 0, 0] }), intent, {}, 0.016);
    expect(intent.moveMagnitude).toBe(0);
  });

  test('a stronger source wins over a weaker one in the same frame', () => {
    const intent = createIntent();
    // Simulates the touch stick having already written a small value.
    intent.moveX = 0.2;
    intent.moveY = 0;
    intent.moveMagnitude = 0.2;
    applyGamepadState(makePad({ axes: [0, -1, 0, 0] }), intent, {}, 0.016);
    expect(intent.moveMagnitude).toBeCloseTo(1, 2);
  });

  test('camera speed scales with the frame delta', () => {
    const slow = createIntent();
    const fast = createIntent();
    applyGamepadState(makePad({ axes: [0, 0, 1, 0] }), slow, {}, 0.008);
    applyGamepadState(makePad({ axes: [0, 0, 1, 0] }), fast, {}, 0.016);
    expect(Math.abs(fast.lookYaw)).toBeCloseTo(Math.abs(slow.lookYaw) * 2, 5);
  });
});

describe('clip weights', () => {
  const step = (state, input, seconds) => {
    for (let i = 0; i < Math.round(seconds * 60); i += 1) {
      updateLocomotion(state, input, 1 / 60);
      input = { ...input, dodge: false, jump: false };
    }
    return state;
  };

  test('a standing character is fully idle', () => {
    const weights = computeClipWeights(createLocomotionState());
    expect(weights[CLIPS.IDLE]).toBe(1);
  });

  test('weights always sum to one', () => {
    const state = step(createLocomotionState(), {
      moveX: 0.6,
      moveY: 0.8,
      magnitude: 1,
      sprintHeld: true,
      cameraYaw: 0.4,
    }, 1.5);

    const weights = computeClipWeights(state);
    const total = Object.values(weights).reduce((sum, value) => sum + value, 0);
    expect(total).toBeCloseTo(1, 4);
  });

  test('a sprint is weighted toward the sprint clip', () => {
    const state = step(createLocomotionState(), {
      moveX: 0,
      moveY: 1,
      magnitude: 1,
      sprintHeld: true,
      cameraYaw: 0,
    }, 3);
    const weights = computeClipWeights(state);
    expect(weights[CLIPS.SPRINT]).toBeGreaterThan(weights[CLIPS.WALK]);
    expect(state.speed).toBeGreaterThan(LOCOMOTION.JOG_SPEED);
  });

  test('a dodge overrides every locomotion clip', () => {
    const state = createLocomotionState();
    updateLocomotion(
      state,
      { moveX: 0, moveY: 1, magnitude: 1, cameraYaw: 0, dodge: true },
      1 / 60,
    );
    const weights = computeClipWeights(state);
    expect(weights[CLIPS.DODGE]).toBe(1);
    expect(weights[CLIPS.IDLE]).toBe(0);
  });

  test('being airborne selects the jump clip', () => {
    const state = createLocomotionState();
    updateLocomotion(state, { moveX: 0, moveY: 0, magnitude: 0, cameraYaw: 0, jump: true }, 1 / 60);
    expect(computeClipWeights(state)[CLIPS.JUMP]).toBe(1);
  });

  test('strafing right favours the right strafe clip', () => {
    const state = createLocomotionState();
    state.facing = 0;
    state.speed = 3;
    state.localForward = 0;
    state.localRight = 1;
    const weights = computeClipWeights(state);
    expect(weights[CLIPS.STRAFE_RIGHT]).toBeGreaterThan(0);
    expect(weights[CLIPS.STRAFE_LEFT]).toBe(0);
  });

  test('backpedalling favours the backward clip', () => {
    const state = createLocomotionState();
    state.speed = 2;
    state.localForward = -1;
    state.localRight = 0;
    expect(computeClipWeights(state)[CLIPS.WALK_BACK]).toBeGreaterThan(0);
  });
});
