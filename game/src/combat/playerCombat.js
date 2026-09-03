import { COMBAT_RULES } from './attackData.js';
import { clamp } from '../core/mathx.js';

/**
 * The player's combat state: parry windows, health and hit stun.
 *
 * Pure numbers on the combat clock, with no knowledge of THREE, the DOM or the
 * input layer. The dodge itself still lives in the locomotion model from M01 —
 * this only reads whether its evade window is currently open, so there is one
 * dodge implementation and mobile and gamepad continue to share it.
 */

export function createPlayerCombat() {
  return {
    health: COMBAT_RULES.PLAYER_MAX_HEALTH,

    /** Seconds left in the open parry window; 0 means closed. */
    parryTimer: 0,
    /** Seconds since the parry was pressed, used to grade perfect parries. */
    parryAge: 0,
    parryCooldown: 0,
    /** Set once a parry has answered an attack, so one press stops one attack. */
    parryConsumed: false,

    hitStun: 0,
    /** Counters landed while the Warden is recovering, for posture pressure. */
    counterReady: false,
  };
}

/** Opens a parry window. Ignored while one is open or on cooldown. */
export function pressParry(state) {
  if (state.parryTimer > 0 || state.parryCooldown > 0) return false;
  state.parryTimer = COMBAT_RULES.PARRY_WINDOW;
  state.parryAge = 0;
  state.parryConsumed = false;
  return true;
}

/** Advances one fixed combat step. */
export function stepPlayerCombat(state, dt) {
  if (state.parryTimer > 0) {
    state.parryTimer = Math.max(0, state.parryTimer - dt);
    state.parryAge += dt;
    if (state.parryTimer === 0) {
      state.parryCooldown = COMBAT_RULES.PARRY_COOLDOWN;
    }
  } else if (state.parryCooldown > 0) {
    state.parryCooldown = Math.max(0, state.parryCooldown - dt);
  }

  if (state.hitStun > 0) state.hitStun = Math.max(0, state.hitStun - dt);
  return state;
}

/**
 * Whether a parry would answer an attack landing right now.
 *
 * A consumed parry cannot answer a second attack, which is what stops one press
 * from covering a whole combination.
 */
export const isParryActive = (state) => state.parryTimer > 0 && !state.parryConsumed;

/** Marks the open parry as spent. */
export function consumeParry(state) {
  state.parryConsumed = true;
}

export function applyDamage(state, amount) {
  state.health = clamp(state.health - amount, 0, COMBAT_RULES.PLAYER_MAX_HEALTH);
  state.hitStun = COMBAT_RULES.PLAYER_HIT_STUN;
  // Being hit closes any parry that was open.
  state.parryTimer = 0;
  state.parryConsumed = true;
  return state.health;
}

export function healToFull(state) {
  state.health = COMBAT_RULES.PLAYER_MAX_HEALTH;
}

/**
 * Builds the snapshot the hit resolver reads. Keeping this in one place means
 * the resolver never reaches into the locomotion state itself.
 */
export function playerSnapshot(state, locomotion) {
  return {
    x: locomotion.position.x,
    z: locomotion.position.z,
    evading: locomotion.isInvulnerable === true,
    parryActive: isParryActive(state),
    parryAge: state.parryAge,
  };
}
