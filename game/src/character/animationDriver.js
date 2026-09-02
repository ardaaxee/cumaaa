import * as THREE from 'three';
import { LOCOMOTION } from '../core/settings.js';
import { clamp } from '../core/mathx.js';
import { createProceduralAnimator } from './proceduralAnimator.js';

/**
 * The seam between locomotion and animation.
 *
 * Every driver implements `update(rig, locomotionState, dt)`. Today the
 * procedural driver poses the placeholder rig from code; when authored clips
 * arrive, `createClipAnimator` drives the same rig from an AnimationMixer and
 * nothing else in the game changes.
 */

/**
 * Clip names a future GLB is expected to provide. Locomotion state maps onto
 * these weights identically in both drivers, which is what makes the swap safe.
 */
export const CLIPS = {
  IDLE: 'idle',
  WALK: 'walk_fwd',
  JOG: 'jog_fwd',
  SPRINT: 'sprint_fwd',
  WALK_BACK: 'walk_bwd',
  STRAFE_LEFT: 'strafe_l',
  STRAFE_RIGHT: 'strafe_r',
  DODGE: 'dodge',
  JUMP: 'jump',
  LAND: 'land',
};

/**
 * Derives normalised blend weights from a locomotion state.
 *
 * Shared by both drivers: the procedural animator uses them as pose weights, the
 * clip animator as `AnimationAction.weight`. Pure, so it is unit tested.
 */
export function computeClipWeights(state) {
  const weights = {
    [CLIPS.IDLE]: 0,
    [CLIPS.WALK]: 0,
    [CLIPS.JOG]: 0,
    [CLIPS.SPRINT]: 0,
    [CLIPS.WALK_BACK]: 0,
    [CLIPS.STRAFE_LEFT]: 0,
    [CLIPS.STRAFE_RIGHT]: 0,
    [CLIPS.DODGE]: 0,
    [CLIPS.JUMP]: 0,
  };

  if (state.isDodging) {
    weights[CLIPS.DODGE] = 1;
    return weights;
  }
  if (state.airborne) {
    weights[CLIPS.JUMP] = 1;
    return weights;
  }

  const speed = state.speed;
  const moving = clamp(speed / LOCOMOTION.WALK_SPEED, 0, 1);
  weights[CLIPS.IDLE] = 1 - moving;
  if (moving <= 0) return weights;

  const backward = Math.max(0, -state.localForward);
  const lateral = Math.abs(state.localRight);
  const forward = Math.max(0, 1 - backward - lateral);

  let forwardWeight;
  if (speed <= LOCOMOTION.WALK_SPEED) {
    forwardWeight = { walk: 1, jog: 0, sprint: 0 };
  } else if (speed <= LOCOMOTION.JOG_SPEED) {
    const t = (speed - LOCOMOTION.WALK_SPEED) / (LOCOMOTION.JOG_SPEED - LOCOMOTION.WALK_SPEED);
    forwardWeight = { walk: 1 - t, jog: t, sprint: 0 };
  } else {
    const t = clamp(
      (speed - LOCOMOTION.JOG_SPEED) / (LOCOMOTION.SPRINT_SPEED - LOCOMOTION.JOG_SPEED),
      0,
      1,
    );
    forwardWeight = { walk: 0, jog: 1 - t, sprint: t };
  }

  weights[CLIPS.WALK] = moving * forward * forwardWeight.walk;
  weights[CLIPS.JOG] = moving * forward * forwardWeight.jog;
  weights[CLIPS.SPRINT] = moving * forward * forwardWeight.sprint;
  weights[CLIPS.WALK_BACK] = moving * backward;
  weights[CLIPS.STRAFE_LEFT] = moving * (state.localRight < 0 ? lateral : 0);
  weights[CLIPS.STRAFE_RIGHT] = moving * (state.localRight > 0 ? lateral : 0);

  return weights;
}

/**
 * Drives the rig from authored clips.
 *
 * Unused until a GLB ships; kept here so the architecture is real rather than
 * promised. `clips` maps a CLIPS key to a THREE.AnimationClip.
 */
export function createClipAnimator(rig, clips) {
  const mixer = new THREE.AnimationMixer(rig.root);
  const actions = new Map();
  for (const [name, clip] of Object.entries(clips)) {
    const action = mixer.clipAction(clip);
    action.play();
    action.setEffectiveWeight(0);
    actions.set(name, action);
  }

  return {
    update(_rig, state, dt) {
      const weights = computeClipWeights(state);
      for (const [name, action] of actions) {
        action.setEffectiveWeight(weights[name] ?? 0);
      }
      mixer.update(dt);
    },
    dispose() {
      mixer.stopAllAction();
      mixer.uncacheRoot(rig.root);
    },
  };
}

/**
 * @param {object} options `{ clips }` selects the clip driver; omitting it keeps
 *   the procedural driver.
 */
export function createAnimationDriver(rig, options = {}) {
  if (options.clips) return createClipAnimator(rig, options.clips);
  return createProceduralAnimator();
}
