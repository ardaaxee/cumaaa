import { applyDeadZone } from '../core/mathx.js';

const KEY_ACTIONS = {
  Space: 'jump',
  ShiftRight: 'dodge',
  KeyQ: 'parry',
  KeyE: 'action',
  KeyF: 'focus',
};

/**
 * Desktop keyboard source. Present for development parity — it writes into the
 * same intent as touch and gamepad and adds no gameplay path of its own.
 */
export function createKeyboardSource(intent) {
  const held = new Set();
  const listeners = [];

  const on = (target, type, handler) => {
    target.addEventListener(type, handler);
    listeners.push(() => target.removeEventListener(type, handler));
  };

  on(window, 'keydown', (event) => {
    if (event.repeat) return;
    held.add(event.code);
    const action = KEY_ACTIONS[event.code];
    if (action) intent.press(action);
  });
  on(window, 'keyup', (event) => held.delete(event.code));
  // A tab switch drops keyup events; clearing avoids a stuck sprint.
  on(window, 'blur', () => held.clear());

  return {
    isHeld: (code) => held.has(code),
    update() {
      const x = (held.has('KeyD') ? 1 : 0) - (held.has('KeyA') ? 1 : 0);
      const y = (held.has('KeyW') ? 1 : 0) - (held.has('KeyS') ? 1 : 0);
      const move = applyDeadZone(x, y, 0);
      if (move.magnitude > intent.moveMagnitude) {
        intent.moveX = move.x;
        intent.moveY = move.y;
        intent.moveMagnitude = move.magnitude;
      }
      if (held.has('ShiftLeft')) intent.sprintHeld = true;
    },
    dispose() {
      for (const off of listeners) off();
      listeners.length = 0;
    },
  };
}
