// The social data model.
//
// This is a DATA MODEL, not a feature: no UI, no panels, no buttons — the brief
// is explicit that a screen for something that does not work yet is worse than
// nothing. What it exists to do is make sure that when friendship, romance and
// marriage are built, they are built on something with a shape, and that the
// shape does not have to be retrofitted around whatever the first screen
// happened to need.
//
// Every field here is one the reducers below actually read.

export type RelationshipKind =
  | 'stranger'
  | 'acquaintance'
  | 'friend'
  | 'close_friend'
  | 'romantic_interest'
  | 'partner'
  | 'spouse'

/** The order relationships deepen in. Romance branches off friendship. */
export const RELATIONSHIP_ORDER: RelationshipKind[] = [
  'stranger',
  'acquaintance',
  'friend',
  'close_friend',
  'romantic_interest',
  'partner',
  'spouse',
]

export interface Identity {
  id: string
  name: string
  /** Purely descriptive; nothing branches on it. */
  presentation: 'feminine' | 'masculine' | 'neutral'
  /** The seed their appearance is generated from. */
  look: string
}

/**
 * Personality, as five independent axes, each 0..1.
 *
 * Five because each one changes something a character DOES, not because five is
 * a nice number: warmth changes how fast affinity grows, energy how long they
 * stay out, order whether they tidy up, curiosity whether they start
 * conversations, patience how they take being interrupted.
 */
export interface Personality {
  warmth: number
  energy: number
  order: number
  curiosity: number
  patience: number
}

/** Valence AND arousal — one axis cannot tell sad from angry. */
export interface Mood {
  valence: number // -1 miserable .. +1 delighted
  arousal: number // 0 flat .. 1 wound up
}

/** Needs decay with time and are met by doing things. 0 = desperate, 1 = fine. */
export interface Needs {
  hunger: number
  energy: number
  hygiene: number
  social: number
  fun: number
}

export interface MemoryEvent {
  /** Game time, seconds. */
  at: number
  kind: 'met' | 'talked' | 'helped' | 'gift' | 'meal' | 'argued' | 'ignored' | 'kindness'
  who: string
  /** How much it moved affinity at the time; kept so a memory can fade. */
  weight: number
}

export interface Relationship {
  who: string
  kind: RelationshipKind
  /** How much they like each other, -1..1. */
  affinity: number
  /** How much they rely on each other, 0..1. Slower to build, slower to lose. */
  trust: number
  /** Seconds of game time spent together. */
  together: number
  lastSeen: number
}

export interface CharacterState {
  identity: Identity
  personality: Personality
  mood: Mood
  needs: Needs
  /** Keyed by the other character's id. */
  relationships: Record<string, Relationship>
  /** Most recent first, capped. */
  memory: MemoryEvent[]
  /** What they intend to do, by hour. Filled in by the NPC layer. */
  schedule: { hour: number; activity: string; where: string }[]
}

/** Per hour of game time. */
export const NEED_DECAY: Needs = {
  hunger: 0.14,
  energy: 0.09,
  hygiene: 0.07,
  social: 0.11,
  fun: 0.1,
}

export function newRelationship(who: string, at: number): Relationship {
  return { who, kind: 'stranger', affinity: 0, trust: 0, together: 0, lastSeen: at }
}

export function newCharacter(identity: Identity, personality: Personality): CharacterState {
  return {
    identity,
    personality,
    mood: { valence: 0.1, arousal: 0.35 },
    needs: { hunger: 0.8, energy: 0.85, hygiene: 0.9, social: 0.7, fun: 0.7 },
    relationships: {},
    memory: [],
    schedule: [],
  }
}

/** What each kind of event is worth, before personality scales it. */
const EVENT_WEIGHT: Record<MemoryEvent['kind'], { affinity: number; trust: number }> = {
  met: { affinity: 0.02, trust: 0.01 },
  talked: { affinity: 0.03, trust: 0.01 },
  helped: { affinity: 0.08, trust: 0.09 },
  gift: { affinity: 0.12, trust: 0.05 },
  meal: { affinity: 0.07, trust: 0.04 },
  kindness: { affinity: 0.06, trust: 0.05 },
  argued: { affinity: -0.14, trust: -0.06 },
  ignored: { affinity: -0.05, trust: -0.03 },
}

const MEMORY_CAP = 60

/**
 * Record something that happened between two characters.
 *
 * Returns a NEW state — nothing here mutates, so the same reducer can run
 * optimistically on a client and as the authority on a server and the two can
 * be compared. That is the same discipline the item system already uses.
 */
export function remember(state: CharacterState, event: MemoryEvent): CharacterState {
  const base = EVENT_WEIGHT[event.kind] ?? { affinity: 0, trust: 0 }
  // A warm character warms to people faster; a patient one forgives an argument.
  const warmth = 0.6 + state.personality.warmth * 0.8
  const patience = 0.6 + state.personality.patience * 0.8
  const scale = base.affinity >= 0 ? warmth : 1 / patience
  const existing = state.relationships[event.who] ?? newRelationship(event.who, event.at)
  const rel: Relationship = {
    ...existing,
    affinity: clamp(existing.affinity + base.affinity * scale * event.weight, -1, 1),
    trust: clamp(existing.trust + base.trust * event.weight, 0, 1),
    lastSeen: event.at,
  }
  return {
    ...state,
    relationships: { ...state.relationships, [event.who]: advance(rel) },
    memory: [{ ...event }, ...state.memory].slice(0, MEMORY_CAP),
  }
}

/**
 * Move a relationship to the kind its numbers now justify.
 *
 * One step at a time, and never past `romantic_interest` on its own: partnership
 * and marriage are DECISIONS, not thresholds, and the systems that make them
 * will set the kind explicitly.
 */
function advance(rel: Relationship): Relationship {
  const idx = RELATIONSHIP_ORDER.indexOf(rel.kind)
  if (idx >= RELATIONSHIP_ORDER.indexOf('romantic_interest')) return rel
  let want = idx
  if (rel.affinity > 0.12 && rel.trust > 0.05) want = Math.max(want, 1)
  if (rel.affinity > 0.4 && rel.trust > 0.25 && rel.together > 900) want = Math.max(want, 2)
  if (rel.affinity > 0.7 && rel.trust > 0.55 && rel.together > 3600) want = Math.max(want, 3)
  // Falling out drops a step rather than resetting to stranger.
  if (rel.affinity < -0.2) want = Math.max(0, idx - 1)
  const next = Math.max(0, Math.min(RELATIONSHIP_ORDER.length - 1, want))
  return next === idx ? rel : { ...rel, kind: RELATIONSHIP_ORDER[next] }
}

/** Time in each other's company, which is most of how friendship forms. */
export function spendTime(state: CharacterState, who: string, seconds: number, at: number): CharacterState {
  const existing = state.relationships[who] ?? newRelationship(who, at)
  const rel: Relationship = {
    ...existing,
    together: existing.together + seconds,
    affinity: clamp(existing.affinity + seconds * 0.000012 * (0.5 + state.personality.warmth), -1, 1),
    lastSeen: at,
  }
  return { ...state, relationships: { ...state.relationships, [who]: advance(rel) } }
}

/** Needs fall with time; mood follows the worst of them. */
export function tickNeeds(state: CharacterState, hours: number): CharacterState {
  const n = state.needs
  const needs: Needs = {
    hunger: clamp(n.hunger - NEED_DECAY.hunger * hours, 0, 1),
    // An energetic character burns energy slower and gets bored faster.
    energy: clamp(n.energy - NEED_DECAY.energy * hours * (1.3 - state.personality.energy * 0.5), 0, 1),
    hygiene: clamp(n.hygiene - NEED_DECAY.hygiene * hours, 0, 1),
    social: clamp(n.social - NEED_DECAY.social * hours * (0.6 + state.personality.warmth * 0.8), 0, 1),
    fun: clamp(n.fun - NEED_DECAY.fun * hours * (0.7 + state.personality.curiosity * 0.6), 0, 1),
  }
  const worst = Math.min(needs.hunger, needs.energy, needs.hygiene, needs.social, needs.fun)
  const valence = clamp(state.mood.valence * 0.9 + (worst - 0.5) * 0.5, -1, 1)
  return { ...state, needs, mood: { valence, arousal: clamp(1 - needs.energy, 0, 1) } }
}

/** Which need is most pressing, or null if nothing wants attention. */
export function urgentNeed(state: CharacterState, threshold = 0.35): keyof Needs | null {
  let worst: keyof Needs | null = null
  let value = threshold
  for (const key of Object.keys(state.needs) as (keyof Needs)[]) {
    if (state.needs[key] < value) {
      value = state.needs[key]
      worst = key
    }
  }
  return worst
}

function clamp(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, v))
}
