/**
 * Tuning constants for CUMA WORLD.
 *
 * Every gameplay-visible magic number lives here so the feel can be tuned
 * without hunting through systems. Values are in metres / seconds / radians.
 */

export const LOCOMOTION = {
  // Target planar speeds per gait (m/s).
  WALK_SPEED: 1.75,
  JOG_SPEED: 4.3,
  SPRINT_SPEED: 7.7,

  // Analog stick magnitude thresholds that select a gait.
  WALK_STICK_THRESHOLD: 0.42,
  JOG_STICK_THRESHOLD: 0.9,

  // Acceleration is deliberately slower than braking: the character leans into
  // a run but plants firmly when the stick is released.
  ACCELERATION: 15.0,
  SPRINT_ACCELERATION: 11.0,
  DECELERATION: 22.0,

  // Reverse and lateral movement are penalised so backpedalling reads as
  // deliberate rather than as a strafe-run.
  BACKWARD_SPEED_SCALE: 0.62,
  STRAFE_SPEED_SCALE: 0.84,

  // Turning: fast movement produces wider arcs, standing turns are snappy.
  TURN_RATE_STATIONARY: 13.0,
  TURN_RATE_SPRINT: 5.4,

  // Body lean driven by planar acceleration and by turning.
  LEAN_PITCH_PER_ACCEL: 0.028,
  LEAN_ROLL_PER_TURN: 0.22,
  LEAN_MAX_PITCH: 0.2,
  LEAN_MAX_ROLL: 0.26,
  LEAN_SMOOTHING: 8.0,

  // Dodge is a rooted directional burst, never a teleport.
  DODGE_DURATION: 0.42,
  DODGE_DISTANCE: 4.1,
  DODGE_COOLDOWN: 0.34,
  DODGE_IFRAME_START: 0.06,
  DODGE_IFRAME_END: 0.3,

  // Gravity / landing.
  GRAVITY: -22.0,
  JUMP_VELOCITY: 6.4,
  LAND_DIP_PER_SPEED: 0.05,
  LAND_DIP_MAX: 0.34,
  LAND_RECOVERY: 7.0,

  // Idle breathing.
  BREATH_RATE: 1.15,
  BREATH_AMPLITUDE: 0.022,

  // Stride frequency (steps per second) at each gait, used by the animator.
  STRIDE_HZ_WALK: 1.5,
  STRIDE_HZ_JOG: 2.35,
  STRIDE_HZ_SPRINT: 3.05,

  // Below this planar speed the character is considered idle.
  IDLE_SPEED_EPSILON: 0.08,
};

export const CAMERA = {
  PITCH_MIN: -0.62,
  PITCH_MAX: 0.48,

  // Look sensitivity.
  TOUCH_YAW_SENSITIVITY: 0.0042,
  TOUCH_PITCH_SENSITIVITY: 0.0032,
  PAD_YAW_SENSITIVITY: 2.6,
  PAD_PITCH_SENSITIVITY: 1.9,

  // Follow smoothing (higher = tighter). Position lags rotation slightly so the
  // rig feels hand-held rather than welded to the character.
  PIVOT_LAG: 9.0,
  ROTATION_LAG: 12.0,
  DISTANCE_LAG: 3.4,
  FOV_LAG: 4.0,
  MODE_BLEND_DEFAULT: 0.85,

  // Speed-based framing: the rig eases back and widens as the character runs.
  SPEED_DISTANCE_GAIN: 0.26,
  SPEED_DISTANCE_MAX: 2.1,
  SPRINT_FOV_GAIN: 9.0,

  // Collision avoidance.
  COLLISION_RADIUS: 0.32,
  COLLISION_MIN_DISTANCE: 1.05,
  COLLISION_PULL_IN_LAG: 26.0,
  COLLISION_PUSH_OUT_LAG: 3.2,

  // Hand-held sway.
  SWAY_RATE: 0.55,
  SWAY_MOVE_GAIN: 0.6,

  PIVOT_HEIGHT: 1.46,
};

export const HERO_MOMENT = {
  // World-space centre of the Meridian Market crossroads.
  TRIGGER_POSITION: { x: 0, z: -4 },
  TRIGGER_RADIUS: 7.5,
  DURATION: 10.5,
};

export const PERFORMANCE = {
  MAX_PIXEL_RATIO_DESKTOP: 1.75,
  MAX_PIXEL_RATIO_MOBILE: 1.35,
  MAX_DELTA: 1 / 24,
  // Crowd agents refreshed per frame; the rest coast on their last velocity.
  CROWD_UPDATES_PER_FRAME: 8,
  CROWD_COUNT: 34,
  RAIN_STREAKS: 1600,
};

export const COMBAT = {
  ATTACK_RANGE: 6.5,
  ATTACK_DAMAGE: 8,
  HIT_STOP: 0.05,
  HIT_SHAKE: 0.13,
  DODGE_SHAKE: 0.05,
  PARRY_WINDOW: 0.28,
  BOSS_TRIGGER_Z: -38,
  BOSS_PHASE_TWO_HP: 65,
  BOSS_PHASE_THREE_HP: 30,
};
