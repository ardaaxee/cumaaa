import { applyDeadZone } from '../core/mathx.js';
import { CAMERA } from '../core/settings.js';

const JOYSTICK_RADIUS = 40;
// Holding the stick past this fraction of its travel engages sprint on mobile,
// mirroring L3 on a gamepad without needing a dedicated button.
const SPRINT_MAGNITUDE = 0.93;

/**
 * Touch source: virtual stick, look pad and action buttons.
 *
 * All three feed the shared intent, so a mobile dodge runs exactly the same
 * gameplay code as a Circle press on a DualSense.
 */
export function createTouchSource(intent, root = document) {
  const joystick = root.querySelector('#joy');
  const knob = joystick?.querySelector('span');
  const lookPad = root.querySelector('#look');
  const listeners = [];

  const on = (target, type, handler) => {
    if (!target) return;
    target.addEventListener(type, handler, { passive: false });
    listeners.push(() => target.removeEventListener(type, handler));
  };

  const stick = { x: 0, y: 0, magnitude: 0 };
  let stickPointer = null;
  let stickCentre = { x: 0, y: 0 };

  const resetStick = () => {
    stickPointer = null;
    stick.x = 0;
    stick.y = 0;
    stick.magnitude = 0;
    if (knob) knob.style.transform = 'translate(0px,0px)';
  };

  on(joystick, 'pointerdown', (event) => {
    event.preventDefault();
    stickPointer = event.pointerId;
    joystick.setPointerCapture(stickPointer);
    const rect = joystick.getBoundingClientRect();
    stickCentre = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  });

  on(joystick, 'pointermove', (event) => {
    if (event.pointerId !== stickPointer) return;
    event.preventDefault();
    let dx = event.clientX - stickCentre.x;
    let dy = event.clientY - stickCentre.y;
    const length = Math.hypot(dx, dy);
    if (length > JOYSTICK_RADIUS) {
      const scale = JOYSTICK_RADIUS / length;
      dx *= scale;
      dy *= scale;
    }
    if (knob) knob.style.transform = `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px)`;
    const raw = applyDeadZone(dx / JOYSTICK_RADIUS, -dy / JOYSTICK_RADIUS, 0.08);
    stick.x = raw.x;
    stick.y = raw.y;
    stick.magnitude = raw.magnitude;
  });

  on(joystick, 'pointerup', resetStick);
  on(joystick, 'pointercancel', resetStick);
  // A pointer lost outside the element never fires pointerup on it.
  on(window, 'pointercancel', resetStick);

  const look = { yaw: 0, pitch: 0 };
  let lookPointer = null;
  let lookLast = null;

  const resetLook = () => {
    lookPointer = null;
    lookLast = null;
  };

  on(lookPad, 'pointerdown', (event) => {
    event.preventDefault();
    lookPointer = event.pointerId;
    lookLast = { x: event.clientX, y: event.clientY };
    lookPad.setPointerCapture(lookPointer);
  });

  on(lookPad, 'pointermove', (event) => {
    if (event.pointerId !== lookPointer || !lookLast) return;
    event.preventDefault();
    look.yaw -= (event.clientX - lookLast.x) * CAMERA.TOUCH_YAW_SENSITIVITY;
    look.pitch -= (event.clientY - lookLast.y) * CAMERA.TOUCH_PITCH_SENSITIVITY;
    lookLast = { x: event.clientX, y: event.clientY };
  });

  on(lookPad, 'pointerup', resetLook);
  on(lookPad, 'pointercancel', resetLook);

  for (const button of root.querySelectorAll('[data-action]')) {
    on(button, 'pointerdown', (event) => {
      event.preventDefault();
      intent.press(button.dataset.action);
    });
  }

  return {
    update() {
      if (stick.magnitude > intent.moveMagnitude) {
        intent.moveX = stick.x;
        intent.moveY = stick.y;
        intent.moveMagnitude = stick.magnitude;
      }
      if (stick.magnitude >= SPRINT_MAGNITUDE) intent.sprintHeld = true;

      intent.lookYaw += look.yaw;
      intent.lookPitch += look.pitch;
      look.yaw = 0;
      look.pitch = 0;
    },
    dispose() {
      for (const off of listeners) off();
      listeners.length = 0;
    },
  };
}
