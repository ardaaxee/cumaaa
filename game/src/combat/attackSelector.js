import { ATTACKS, ATTACK_IDS, COMBAT_RULES, PHASES } from './attackData.js';

/**
 * Chooses the Warden's next attack.
 *
 * Called only when a new decision is actually needed — on entering a wind-up —
 * never per frame, and never from `Math.random`. Selection is driven by a
 * seeded generator supplied by the caller, so a given seed and a given fight
 * produce the same sequence every time; that is what makes the encounter
 * testable and a hero-moment capture repeatable.
 */

/**
 * How strongly a recently-used attack is suppressed. Index 0 is the most
 * recent attack, which is excluded outright unless nothing else is legal.
 */
const REPEAT_PENALTY = [0, 0.25, 0.6];

/**
 * @param {object} context
 *   distance   metres between boss and player
 *   phase      1..3
 *   history    bounded array of recent attack ids, newest first
 *   cooldowns  map of attack id to seconds remaining
 * @param {() => number} random  seeded generator in [0,1)
 * @returns {string|null} the chosen attack id, or null if none is appropriate
 */
export function selectAttack({ distance, phase, history = [], cooldowns = {} }, random) {
  const candidates = [];
  let totalWeight = 0;

  for (const id of ATTACK_IDS) {
    const attack = ATTACKS[id];
    if (distance < attack.minRange || distance > attack.maxRange) continue;
    if ((cooldowns[id] ?? 0) > 0) continue;

    const recentIndex = history.indexOf(id);
    let weight = attack.weight;
    if (recentIndex !== -1 && recentIndex < REPEAT_PENALTY.length) {
      weight *= REPEAT_PENALTY[recentIndex];
    }
    if (weight <= 0) continue;

    candidates.push({ id, weight });
    totalWeight += weight;
  }

  if (candidates.length === 0) return null;

  let roll = random() * totalWeight;
  for (const candidate of candidates) {
    roll -= candidate.weight;
    if (roll <= 0) return candidate.id;
  }
  return candidates[candidates.length - 1].id;
}

/**
 * Decides whether the Warden chains straight into another attack instead of
 * returning to neutral. Phase one never chains; later phases press.
 */
export function shouldFollowUp(phase, chainLength, random) {
  const modifiers = PHASES[phase] ?? PHASES[1];
  if (chainLength >= modifiers.maxChain) return false;
  if (modifiers.followUpChance <= 0) return false;
  return random() < modifiers.followUpChance;
}

/** Pushes an attack onto a bounded history list, newest first. */
export function recordAttack(history, id) {
  history.unshift(id);
  while (history.length > COMBAT_RULES.ATTACK_HISTORY_LENGTH) history.pop();
  return history;
}
