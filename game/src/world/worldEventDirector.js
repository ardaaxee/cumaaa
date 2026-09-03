import { WORLD_EVENTS, WORLD_EVENT_IDS } from './worldEvents.js';
import { createRandom } from '../core/random.js';

/**
 * Decides which world event runs, and when.
 *
 * Events are evaluated on a slow beat rather than every frame, and only one
 * runs at a time. Every candidate has to pass region, weather, player distance
 * and its own cooldown before it is even considered, and the choice among
 * survivors comes from a seeded generator — so a session is reproducible and
 * the city never spams the same beat twice.
 *
 * Pure: no THREE, no DOM, no wall clock.
 */

/** Seconds between evaluations. Nothing is decided in between. */
export const EVALUATION_INTERVAL = 4;

/** Quiet time after any event before another may start. */
const GLOBAL_COOLDOWN = 14;

/**
 * @param {object} context
 *   district  the district the player is in
 *   weather   the current weather state id
 *   x, z      the player's position
 *   flags     named world conditions, e.g. `{ wardenDefeated: true }`
 * @param {object} cooldowns  per-event seconds remaining
 * @param {Set<string>} spent  events that have already fired their one time
 */
export function eligibleEvents(context, cooldowns, spent) {
  const result = [];

  for (const id of WORLD_EVENT_IDS) {
    const event = WORLD_EVENTS[id];

    if (event.once && spent.has(id)) continue;
    if ((cooldowns[id] ?? 0) > 0) continue;
    if (event.district !== context.district) continue;
    if (event.weather.length > 0 && !event.weather.includes(context.weather)) continue;
    if (event.requires && !context.flags?.[event.requires]) continue;

    const distance = Math.hypot(event.anchor.x - context.x, event.anchor.z - context.z);
    if (distance > event.radius) continue;

    result.push(event);
  }

  return result;
}

/** Weighted pick among eligible events, using the supplied generator. */
export function pickEvent(candidates, random) {
  if (candidates.length === 0) return null;

  let total = 0;
  for (const event of candidates) total += event.weight;

  let roll = random() * total;
  for (const event of candidates) {
    roll -= event.weight;
    if (roll <= 0) return event;
  }
  return candidates[candidates.length - 1];
}

export function createWorldEventDirector({ seed = 0x77c17e } = {}) {
  const random = createRandom(seed);

  const cooldowns = Object.create(null);
  const spent = new Set();
  const listeners = [];

  let sinceEvaluation = 0;
  let globalCooldown = 0;
  let active = null;
  let activeRemaining = 0;

  const emit = (type, event) => {
    for (let i = 0; i < listeners.length; i += 1) listeners[i](type, event);
  };

  function start(event) {
    active = event;
    activeRemaining = event.duration;
    cooldowns[event.id] = event.cooldown;
    globalCooldown = GLOBAL_COOLDOWN;
    if (event.once) spent.add(event.id);
    emit('start', event);
  }

  return {
    on(listener) {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index !== -1) listeners.splice(index, 1);
      };
    },

    get active() {
      return active;
    },
    get activeRemaining() {
      return activeRemaining;
    },
    cooldownOf(id) {
      return cooldowns[id] ?? 0;
    },
    hasFired(id) {
      return spent.has(id);
    },

    /** Starts a specific event immediately, if its rules allow it. */
    trigger(id, context) {
      const event = WORLD_EVENTS[id];
      if (!event || active) return false;
      if (event.once && spent.has(id)) return false;
      if ((cooldowns[id] ?? 0) > 0) return false;
      if (event.requires && !context?.flags?.[event.requires]) return false;
      start(event);
      return true;
    },

    update(dt, context) {
      if (!(dt > 0)) return active;

      for (const id in cooldowns) {
        if (cooldowns[id] > 0) cooldowns[id] = Math.max(0, cooldowns[id] - dt);
      }
      if (globalCooldown > 0) globalCooldown = Math.max(0, globalCooldown - dt);

      if (active) {
        activeRemaining -= dt;
        if (activeRemaining <= 0) {
          const finished = active;
          active = null;
          activeRemaining = 0;
          emit('end', finished);
        }
        return active;
      }

      // Only evaluate on the beat, never per frame.
      sinceEvaluation += dt;
      if (sinceEvaluation < EVALUATION_INTERVAL) return null;
      sinceEvaluation = 0;

      if (globalCooldown > 0) return null;

      const candidates = eligibleEvents(context, cooldowns, spent);
      const chosen = pickEvent(candidates, random);
      if (chosen) start(chosen);
      return active;
    },
  };
}
