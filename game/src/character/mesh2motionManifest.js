export const MESH2MOTION_CLIP_ALIASES = Object.freeze({
  idle: 'idle',
  idle_loop: 'idle',
  walk: 'walk_fwd',
  walk_forward: 'walk_fwd',
  walk_fwd: 'walk_fwd',
  jog: 'jog_fwd',
  jog_forward: 'jog_fwd',
  jog_fwd: 'jog_fwd',
  run: 'jog_fwd',
  sprint: 'sprint_fwd',
  sprint_forward: 'sprint_fwd',
  sprint_fwd: 'sprint_fwd',
  walk_backward: 'walk_bwd',
  walk_back: 'walk_bwd',
  walk_bwd: 'walk_bwd',
  strafe_left: 'strafe_l',
  strafe_l: 'strafe_l',
  strafe_right: 'strafe_r',
  strafe_r: 'strafe_r',
  dodge: 'dodge',
  jump: 'jump',
  land: 'land',
  landing: 'land',
  parry: 'parry',
  perfect_parry: 'perfect_parry',
  attack_light: 'attack_light',
  attack_heavy: 'attack_heavy',
  hit_front: 'hit_front',
  hit_left: 'hit_left',
  hit_right: 'hit_right',
  vault: 'vault',
  mantle_low: 'mantle_low',
  mantle_high: 'mantle_high',
});

export function normalizeMesh2MotionClipName(name = '') {
  const key = String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return MESH2MOTION_CLIP_ALIASES[key] ?? key;
}

export const CUMA_REQUIRED_LOCOMOTION_CLIPS = Object.freeze([
  'idle',
  'walk_fwd',
  'jog_fwd',
  'sprint_fwd',
  'walk_bwd',
  'strafe_l',
  'strafe_r',
  'dodge',
  'jump',
  'land',
]);

export function validateClipLibrary(clips, required = CUMA_REQUIRED_LOCOMOTION_CLIPS) {
  const names = clips instanceof Map ? new Set(clips.keys()) : new Set(Object.keys(clips ?? {}));
  const missing = required.filter((name) => !names.has(name));
  return { ok: missing.length === 0, missing };
}
