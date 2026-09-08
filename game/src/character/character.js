import { createCharacterRig } from './characterRig.js';
import { createAnimationDriver } from './animationDriver.js';
import { createLocomotionState, updateLocomotion } from './locomotionState.js';
import { clamp } from '../core/mathx.js';

/**
 * Cuma. Owns the movement state, the rig and the animation driver, and is the
 * only thing that writes the character's world transform.
 */
export function createCharacter(
  scene,
  {
    startX = 0,
    startZ = 26,
    startFacing = 0,
    bounds,
    constrainPosition = null,
  } = {},
) {
  const rig = createCharacterRig();
  const animator = createAnimationDriver(rig);
  const state = createLocomotionState(startX, startZ, startFacing);

  scene.add(rig.root);

  // Reusable input struct: the character never allocates per frame.
  const frameInput = {
    moveX: 0,
    moveY: 0,
    magnitude: 0,
    sprintHeld: false,
    cameraYaw: 0,
    dodge: false,
    jump: false,
    strafeMode: false,
  };

  // Reused by connected-world constraints so locomotion stays allocation-free.
  const constrained = { x: startX, z: startZ };

  function applyBounds() {
    if (constrainPosition) {
      constrainPosition(state.position.x, state.position.z, constrained);
      state.position.x = constrained.x;
      state.position.z = constrained.z;
      return;
    }
    if (!bounds) return;
    state.position.x = clamp(state.position.x, bounds.minX, bounds.maxX);
    state.position.z = clamp(state.position.z, bounds.minZ, bounds.maxZ);
  }

  return {
    state,
    rig,
    object: rig.root,

    /**
     * @param {object} intent  the shared input intent
     * @param {number} cameraYaw  the yaw movement should be relative to
     * @param {boolean} controlEnabled  cinematics can suppress action input while
     *   still allowing movement, which is what keeps hero moments seamless.
     * @param {boolean} strafeMode  keeps the body facing the camera instead of
     *   the direction of travel — used while locked onto an enemy.
     */
    update(intent, cameraYaw, dt, controlEnabled = true, strafeMode = false) {
      frameInput.moveX = intent.moveX;
      frameInput.moveY = intent.moveY;
      frameInput.magnitude = intent.moveMagnitude;
      frameInput.sprintHeld = intent.sprintHeld;
      frameInput.cameraYaw = cameraYaw;
      frameInput.strafeMode = strafeMode;
      frameInput.dodge = controlEnabled && intent.consume('dodge');
      frameInput.jump = controlEnabled && intent.consume('jump');

      updateLocomotion(state, frameInput, dt);
      applyBounds();

      rig.root.position.set(state.position.x, state.position.y, state.position.z);
      rig.root.rotation.y = state.facing;
      animator.update(rig, state, dt);
    },

    dispose() {
      animator.dispose();
      scene.remove(rig.root);
      rig.dispose();
    },
  };
}
