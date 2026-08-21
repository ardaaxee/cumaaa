// What a character is doing right now.
//
// Movement states (idle/walk/run/jump/land) are DERIVED every frame from the
// controller — nothing has to remember to set them. Everything else is a
// deliberate act with a duration: you press E at a kettle and the character
// reaches for it for a moment, then goes back to standing. Poses that are tied
// to a piece of furniture (sit, sleep, cook, shower, watch TV) are held until
// the player leaves it.
//
// The action travels over the wire with the transform, so the other player sees
// what you are doing, not just where you are standing.

export type AvatarAction =
  | 'idle'
  | 'walk'
  | 'run'
  | 'jump'
  | 'land'
  | 'sit'
  | 'stand'
  | 'wave'
  | 'point'
  | 'talk'
  | 'read'
  | 'use'
  | 'hold'
  | 'drink'
  | 'eat'
  | 'phone'
  | 'sleep'
  | 'cook'
  | 'shower'
  | 'watchTv'
  | 'open'
  | 'close'
  | 'pickUp'
  | 'drop'
  | 'carry'

export const AVATAR_ACTIONS: AvatarAction[] = [
  'idle', 'walk', 'run', 'jump', 'land', 'sit', 'stand', 'wave', 'point', 'talk',
  'read', 'use', 'hold', 'drink', 'eat', 'phone', 'sleep', 'cook', 'shower',
  'watchTv', 'open', 'close', 'pickUp', 'drop', 'carry',
]

export function isAvatarAction(v: unknown): v is AvatarAction {
  return typeof v === 'string' && (AVATAR_ACTIONS as string[]).includes(v)
}

// How long a one-shot action plays before the character returns to whatever it
// would otherwise be doing. Held actions (sit/sleep/cook/…) are not listed:
// they end when the player stands up or walks away.
const ONE_SHOT_MS: Partial<Record<AvatarAction, number>> = {
  // A gesture is for someone else to see. At 1.8 s a wave could be over before
  // a partner across the room, on a slow link, ever rendered it — long enough
  // to notice matters more than being brisk.
  wave: 3200,
  point: 2400,
  use: 700,
  open: 700,
  close: 700,
  pickUp: 600,
  drop: 600,
  drink: 1600,
  eat: 1900,
  land: 260,
}

// The action a player is holding until they stop (set by whatever they are
// using; cleared with clearHeld).
let held: AvatarAction | null = null
let oneShot: { action: AvatarAction; until: number } | null = null

/** Play a short action once (E on an object, a wave, taking a sip). */
export function playAction(action: AvatarAction): void {
  const ms = ONE_SHOT_MS[action] ?? 700
  oneShot = { action, until: performance.now() + ms }
}

/** Hold a pose tied to a piece of furniture until explicitly released. */
export function holdAction(action: AvatarAction | null): void {
  held = action
}

export function heldAction(): AvatarAction | null {
  return held
}

export interface ActionInputs {
  speed: number
  running: boolean
  grounded: boolean
  seated: boolean
  /** The chat panel is open — the character is talking rather than standing. */
  talking: boolean
  /** Carrying something in one hand. */
  holdingItem: boolean
}

// Resolves the single action to display. Order matters: a one-shot beats the
// pose you are holding, which beats being airborne, which beats how fast you
// happen to be moving.
export function resolveAction(i: ActionInputs): AvatarAction {
  const now = performance.now()
  if (oneShot) {
    if (now < oneShot.until) return oneShot.action
    oneShot = null
  }
  if (held) return held
  if (i.seated) return 'sit'
  if (!i.grounded) return 'jump'
  if (i.talking) return 'talk'
  if (i.speed > 1.9 && i.running) return 'run'
  if (i.speed > 0.35) return i.holdingItem ? 'carry' : 'walk'
  return i.holdingItem ? 'hold' : 'idle'
}

/** Reset everything — used when leaving a home or returning to the menu. */
export function resetActions(): void {
  held = null
  oneShot = null
}
