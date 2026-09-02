import { applyDeadZone, clamp } from '../core/mathx.js';
import { CAMERA } from '../core/settings.js';

const DEAD_ZONE = 0.16;

/**
 * PlayStation / Xbox standard-mapping button indices.
 *
 * Cross/A 0 · Circle/B 1 · Square/X 2 · Triangle/Y 3
 * L1 4 · R1 5 · L2 6 · R2 7 · L3 10 · R3 11
 */
export const PAD_BUTTONS = {
  jump: 0,
  dodge: 1,
  interact: 2,
  focus: 3,
  parry: 4,
  action: 5,
  sprint: 10,
};

/**
 * Maps a raw gamepad snapshot onto the shared intent.
 *
 * Split out from the polling loop so the mapping is testable without a browser:
 * `previous` carries the last frame's button states for edge detection.
 */
export function applyGamepadState(pad, intent, previous, dt) {
  const move = applyDeadZone(pad.axes[0] ?? 0, -(pad.axes[1] ?? 0), DEAD_ZONE);
  if (move.magnitude > intent.moveMagnitude) {
    intent.moveX = move.x;
    intent.moveY = move.y;
    intent.moveMagnitude = move.magnitude;
  }

  const look = applyDeadZone(pad.axes[2] ?? 0, pad.axes[3] ?? 0, DEAD_ZONE);
  intent.lookYaw -= look.x * CAMERA.PAD_YAW_SENSITIVITY * dt;
  intent.lookPitch -= look.y * CAMERA.PAD_PITCH_SENSITIVITY * dt;

  const isDown = (index) => pad.buttons[index]?.pressed === true;

  if (isDown(PAD_BUTTONS.sprint)) intent.sprintHeld = true;

  for (const [action, index] of Object.entries(PAD_BUTTONS)) {
    if (action === 'sprint') continue;
    const down = isDown(index);
    if (down && !previous[index]) intent.press(action === 'interact' ? 'action' : action);
    previous[index] = down;
  }

  return intent;
}

export function createGamepadSource(intent) {
  const previous = Object.create(null);

  return {
    update(dt) {
      const pads = navigator.getGamepads?.();
      if (!pads) return;
      for (let i = 0; i < pads.length; i += 1) {
        const pad = pads[i];
        // Only the first connected standard pad drives gameplay.
        if (pad && pad.connected !== false) {
          applyGamepadState(pad, intent, previous, clamp(dt, 0, 0.05));
          return;
        }
      }
    },
    dispose() {},
  };
}
