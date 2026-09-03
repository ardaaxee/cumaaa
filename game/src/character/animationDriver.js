import * as THREE from 'three';
import { LOCOMOTION } from '../core/settings.js';
import { clamp } from '../core/mathx.js';
import { createProceduralAnimator } from './proceduralAnimator.js';

/**
 * The seam between locomotion and animation.
 * Every driver implements update(rig, locomotionState, dt).
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
    [CLIPS.LAND]: 0,
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
 * Authored-clip driver. animationRoot can be an imported GLB scene nested under
 * the character anchor; that keeps gameplay/world transform separate from the
 * skeleton and prevents root-motion clips from moving the authoritative player.
 */
export function createClipAnimator(rig, clips, {
  animationRoot = rig.root,
  weightSharpness = 14,
} = {}) {
  const mixer = new THREE.AnimationMixer(animationRoot);
  const actions = new Map();
  const weightsNow = new Map();

  for (const [name, clip] of Object.entries(clips)) {
    if (!clip) continue;
    const action = mixer.clipAction(clip, animationRoot);
    action.enabled = true;
    action.play();
    action.setEffectiveWeight(0);
    actions.set(name, action);
    weightsNow.set(name, 0);
  }

  return {
    source: 'clips',
    update(_rig, state, dt) {
      const targets = computeClipWeights(state);
      const blend = 1 - Math.exp(-weightSharpness * dt);
      for (const [name, action] of actions) {
        const current = weightsNow.get(name) ?? 0;
        const next = current + ((targets[name] ?? 0) - current) * blend;
        weightsNow.set(name, next);
        action.setEffectiveWeight(next);
      }
      mixer.update(dt);
    },
    dispose() {
      mixer.stopAllAction();
      mixer.uncacheRoot(animationRoot);
      actions.clear();
      weightsNow.clear();
    },
  };
}

export function createAnimationDriver(rig, options = {}) {
  if (options.clips) {
    return createClipAnimator(rig, options.clips, {
      animationRoot: options.animationRoot ?? rig.root,
      weightSharpness: options.weightSharpness,
    });
  }
  const procedural = createProceduralAnimator();
  return { source: 'procedural', ...procedural };
}
