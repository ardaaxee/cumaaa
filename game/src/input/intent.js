/**
 * The single authoritative gameplay intent.
 *
 * Keyboard, touch and gamepad all write into this one struct; gameplay systems
 * only ever read it. There is deliberately no separate mobile gameplay path —
 * adding one would let the two diverge.
 *
 * Axes are camera-relative *stick space*: +y is "away from the player", +x is
 * "to the player's right". Actions are edge-triggered and consumed once.
 */

export const ACTIONS = ['jump', 'dodge', 'parry', 'action', 'focus'];

export function createIntent() {
  const pressed = Object.create(null);
  for (const name of ACTIONS) pressed[name] = false;

  return {
    moveX: 0,
    moveY: 0,
    /** Radial stick magnitude in [0,1]; selects walk / jog. */
    moveMagnitude: 0,
    lookYaw: 0,
    lookPitch: 0,
    sprintHeld: false,
    pressed,

    /** Called once per frame before the input sources write into it. */
    beginFrame() {
      this.moveX = 0;
      this.moveY = 0;
      this.moveMagnitude = 0;
      this.lookYaw = 0;
      this.lookPitch = 0;
      this.sprintHeld = false;
    },

    press(name) {
      if (name in this.pressed) this.pressed[name] = true;
    },

    /** Reads and clears an edge-triggered action. */
    consume(name) {
      if (!this.pressed[name]) return false;
      this.pressed[name] = false;
      return true;
    },

    clearActions() {
      for (const name of ACTIONS) this.pressed[name] = false;
    },
  };
}
