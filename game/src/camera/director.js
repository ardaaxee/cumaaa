import { angleDelta, clamp, damp, lerp, smootherstep } from '../core/mathx.js';

/**
 * The cinematic director.
 *
 * It never assigns a camera transform. It only drives the rig's additive offsets
 * and asks the rig to blend between modes — so a "cutscene" is the same camera,
 * moved, and there is no cut, no letterbox and no fade to hide a hand-off.
 *
 * A sequence is a list of keyframes on an absolute timeline. Numeric fields are
 * interpolated with smootherstep between neighbouring keyframes; any field a
 * keyframe omits is treated as zero, so offsets always resolve back to gameplay.
 */

const FIELDS = ['yaw', 'pitch', 'pivotX', 'pivotY', 'pivotZ', 'fov', 'lookWeight', 'alignYaw'];

const readField = (keyframe, field) => keyframe[field] ?? 0;

/** Resolves every offset field at time `t`. Pure — unit tested. */
export function sampleSequence(keyframes, t, out) {
  const last = keyframes[keyframes.length - 1];
  if (t <= keyframes[0].t) {
    for (const field of FIELDS) out[field] = readField(keyframes[0], field);
    out.look = keyframes[0].look ?? null;
    out.lookNext = out.look;
    out.lookMix = 0;
    return out;
  }
  if (t >= last.t) {
    for (const field of FIELDS) out[field] = readField(last, field);
    out.look = last.look ?? null;
    out.lookNext = out.look;
    out.lookMix = 0;
    return out;
  }

  let index = 0;
  while (index < keyframes.length - 2 && keyframes[index + 1].t <= t) index += 1;

  const a = keyframes[index];
  const b = keyframes[index + 1];
  const span = Math.max(1e-6, b.t - a.t);
  const k = smootherstep((t - a.t) / span);

  for (const field of FIELDS) {
    out[field] = lerp(readField(a, field), readField(b, field), k);
  }
  out.look = a.look ?? null;
  out.lookNext = b.look ?? a.look ?? null;
  out.lookMix = k;
  return out;
}

export function createDirector(rig, character) {
  let sequence = null;
  let time = 0;
  let onComplete = null;
  let retainControl = true;
  let nextModeIndex = 0;

  const sample = { look: null, lookNext: null, lookMix: 0 };
  for (const field of FIELDS) sample[field] = 0;

  function play(definition, options = {}) {
    sequence = definition;
    time = 0;
    nextModeIndex = 0;
    retainControl = options.retainControl !== false;
    onComplete = options.onComplete ?? null;
  }

  function stop() {
    sequence = null;
    // Offsets are left to decay rather than zeroed, so an aborted sequence still
    // eases out instead of snapping.
  }

  function decayOffsets(dt) {
    const offset = rig.offset;
    offset.yaw = damp(offset.yaw, 0, 3.2, dt);
    offset.pitch = damp(offset.pitch, 0, 3.2, dt);
    offset.pivotX = damp(offset.pivotX, 0, 2.6, dt);
    offset.pivotY = damp(offset.pivotY, 0, 2.6, dt);
    offset.pivotZ = damp(offset.pivotZ, 0, 2.6, dt);
    offset.fov = damp(offset.fov, 0, 3.0, dt);
    offset.lookWeight = damp(offset.lookWeight, 0, 3.4, dt);
  }

  function update(dt) {
    if (!sequence) {
      decayOffsets(dt);
      return;
    }

    time += dt;
    const keyframes = sequence.keyframes;

    // Mode changes fire as the timeline passes their keyframe.
    while (
      nextModeIndex < keyframes.length &&
      keyframes[nextModeIndex].t <= time
    ) {
      const keyframe = keyframes[nextModeIndex];
      if (keyframe.mode) rig.setMode(keyframe.mode, keyframe.blend ?? 1.1);
      nextModeIndex += 1;
    }

    sampleSequence(keyframes, time, sample);

    const offset = rig.offset;
    // The rig's own smoothing does the final easing; the director just supplies
    // the target, so even a coarse keyframe list produces continuous motion.
    offset.yaw = damp(offset.yaw, sample.yaw, 6, dt);
    offset.pitch = damp(offset.pitch, sample.pitch, 6, dt);
    offset.pivotX = damp(offset.pivotX, sample.pivotX, 5, dt);
    offset.pivotY = damp(offset.pivotY, sample.pivotY, 5, dt);
    offset.pivotZ = damp(offset.pivotZ, sample.pivotZ, 5, dt);
    offset.fov = damp(offset.fov, sample.fov, 5, dt);
    offset.lookWeight = damp(offset.lookWeight, clamp(sample.lookWeight, 0, 1), 5, dt);

    if (sample.look) {
      const target = offset.lookTarget;
      const from = sample.look;
      const to = sample.lookNext ?? sample.look;
      target.set(
        lerp(from[0], to[0], sample.lookMix),
        lerp(from[1], to[1], sample.lookMix),
        lerp(from[2], to[2], sample.lookMix),
      );
    }

    // Movement matching: as `alignYaw` rises, the camera's resting yaw is pulled
    // behind wherever the character is actually heading, so gameplay resumes
    // with the camera already where the player expects it.
    if (sample.alignYaw > 0.001) {
      const desiredYaw = character.state.facing + Math.PI;
      const delta = angleDelta(rig.yaw, desiredYaw);
      rig.nudgeYawTarget(rig.yaw + delta * sample.alignYaw * Math.min(1, dt * 2.4));
    }

    const duration = keyframes[keyframes.length - 1].t;
    if (time >= duration) {
      sequence = null;
      const callback = onComplete;
      onComplete = null;
      if (callback) callback();
    }
  }

  return {
    play,
    stop,
    update,
    get isPlaying() {
      return sequence !== null;
    },
    /** Cinematics that retain control still let the player walk and look. */
    get allowsControl() {
      return sequence === null || retainControl;
    },
    get elapsed() {
      return time;
    },
  };
}
