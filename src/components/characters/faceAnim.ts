import * as THREE from 'three'
import type { AvatarRig } from './Avatar'
import type { FaceRig } from './Face'
import type { HairRig } from './Hair'
import { LID } from './Eyes'

// What the face is doing. Deliberately small: a mood, how much the character is
// speaking, and something to look at. Everything else is derived.
export type Expression =
  | 'neutral'
  | 'happy'
  | 'surprised'
  | 'confused'
  | 'sad'
  | 'angry'
  | 'tired'
  | 'listening'
  | 'laughing'

export interface FaceState {
  expression: Expression
  /** 0..1 — how much they are speaking right now. */
  talking: number
  /** A world-space point to look at, or null to look where the head points. */
  lookAt: THREE.Vector3 | null
  /** Seconds since the character appeared, for the blink clock. */
  time: number
}

// A pose is a set of targets, not a keyframe: the animator eases toward them, so
// expressions blend into each other and into talking instead of snapping.
interface FacePose {
  browLift: number // both brows up
  browTilt: number // inner ends up = sad/worried, down = annoyed
  browAsym: number // one brow up — confusion
  lidNarrow: number // squint
  lidWide: number // surprise
  cornerLift: number // smile
  cornerDrop: number
  jawOpen: number
  cheekRaise: number
  /** Lips pushed forward and drawn in — an "oo" shape, and part of talking. */
  pucker: number
}

const NEUTRAL: FacePose = {
  browLift: 0, browTilt: 0, browAsym: 0, lidNarrow: 0, lidWide: 0,
  cornerLift: 0, cornerDrop: 0, jawOpen: 0, cheekRaise: 0, pucker: 0,
}

const POSES: Record<Expression, Partial<FacePose>> = {
  neutral: {},
  // A real smile narrows the eyes and lifts the cheeks. Only the mouth moving
  // is what makes a smile look put on.
  happy: { cornerLift: 1, cheekRaise: 0.8, lidNarrow: 0.35, browLift: 0.12 },
  laughing: { cornerLift: 1, cheekRaise: 1, lidNarrow: 0.72, jawOpen: 0.42, browLift: 0.2 },
  surprised: { browLift: 1, lidWide: 1, jawOpen: 0.34 },
  confused: { browAsym: 1, browLift: 0.3, lidNarrow: 0.18 },
  sad: { browTilt: 1, cornerDrop: 0.8, lidNarrow: 0.2 },
  angry: { browTilt: -1, lidNarrow: 0.55, cornerDrop: 0.4 },
  // Tiredness is heavy lids and a slack mouth, not a frown.
  tired: { lidNarrow: 0.62, browLift: -0.15, cornerDrop: 0.25 },
  // Listening is attention: brows a little up, mouth still, eyes wide open.
  listening: { browLift: 0.28, lidWide: 0.15, cornerLift: 0.12 },
}

function poseFor(e: Expression): FacePose {
  return { ...NEUTRAL, ...POSES[e] }
}

// Per-character animation state that has to persist between frames.
export interface FaceMemory {
  pose: FacePose
  blink: number // 0 open, 1 shut
  /** Smoothed lip rounding, so speech does not snap between shapes. */
  pucker: number
  nextBlink: number
  blinkPhase: number
  eyeYaw: number
  eyePitch: number
  /** Where the eyes are drifting to when there is nothing to look at. */
  saccadeYaw: number
  saccadePitch: number
  nextSaccade: number
  jaw: number
  hairLag: number
  hairLagV: number
  lastHeadYaw: number
  /** The look-at turn already taken up by the head and the chest. */
  headYaw: number
  headPitch: number
  chestYaw: number
  // Rest positions, read once from the built geometry so the PROFILE stays the
  // source of where a feature sits and the animator only ever adds to it.
  browBaseL?: number
  browBaseR?: number
  cornerBaseL?: number
  cornerBaseR?: number
  cheekBaseL?: number
  cheekBaseR?: number
}

export function newFaceMemory(): FaceMemory {
  return {
    pose: { ...NEUTRAL },
    blink: 0,
    pucker: 0,
    nextBlink: 1.5 + Math.random() * 3,
    blinkPhase: 0,
    eyeYaw: 0,
    eyePitch: 0,
    saccadeYaw: 0,
    saccadePitch: 0,
    nextSaccade: 0.8 + Math.random() * 2,
    jaw: 0,
    hairLag: 0,
    hairLagV: 0,
    lastHeadYaw: 0,
    headYaw: 0,
    headPitch: 0,
    chestYaw: 0,
  }
}

const lerp = THREE.MathUtils.lerp
const clamp = THREE.MathUtils.clamp
const _v = new THREE.Vector3()

function approach(cur: number, target: number, k: number): number {
  return cur + (target - cur) * k
}

/**
 * Drives the face for one frame.
 *
 * `head` is the head group, used to work out where a look-at target is relative
 * to the face. Eyes turn toward it and stop at the limit of their travel rather
 * than rolling back into the skull.
 */
export function animateFace(
  rig: FaceRig,
  mem: FaceMemory,
  state: FaceState,
  /** The whole body, so a look-at can travel up the chain rather than stopping
      at the eyes. Passing only the head is what made characters track people
      with their pupils while their skull stayed bolted forward. */
  body: Pick<AvatarRig, 'root' | 'head' | 'chest'> | null,
  delta: number,
): void {
  const head = body?.head ?? null
  const k = Math.min(1, delta * 9)

  // ---- Expression blend ----------------------------------------------------
  const want = poseFor(state.expression)
  const p = mem.pose
  p.browLift = approach(p.browLift, want.browLift, k)
  p.browTilt = approach(p.browTilt, want.browTilt, k)
  p.browAsym = approach(p.browAsym, want.browAsym, k)
  p.lidNarrow = approach(p.lidNarrow, want.lidNarrow, k)
  p.lidWide = approach(p.lidWide, want.lidWide, k)
  p.cornerLift = approach(p.cornerLift, want.cornerLift, k)
  p.cornerDrop = approach(p.cornerDrop, want.cornerDrop, k)
  p.cheekRaise = approach(p.cheekRaise, want.cheekRaise, k)
  p.jawOpen = approach(p.jawOpen, want.jawOpen, k)

  // ---- Blinking ------------------------------------------------------------
  // Blinks are fast to close and slower to open, and the interval varies, which
  // is the whole difference between blinking and flashing.
  mem.nextBlink -= delta
  if (mem.nextBlink <= 0 && mem.blinkPhase === 0) {
    mem.blinkPhase = 1
    mem.nextBlink = 1.8 + Math.random() * 4.2
  }
  if (mem.blinkPhase === 1) {
    mem.blink += delta / 0.055
    if (mem.blink >= 1) { mem.blink = 1; mem.blinkPhase = 2 }
  } else if (mem.blinkPhase === 2) {
    mem.blink -= delta / 0.11
    if (mem.blink <= 0) { mem.blink = 0; mem.blinkPhase = 0 }
  }

  // ---- Talking -------------------------------------------------------------
  // Two frequencies beating against each other so the jaw does not tick like a
  // metronome, plus a floor so a closed mouth still shapes consonants.
  const t = state.time
  const speech = state.talking > 0.01
    ? Math.max(0, Math.sin(t * 11.5) * 0.55 + Math.sin(t * 7.3 + 1.1) * 0.35 + 0.18) * state.talking
    : 0
  mem.jaw = approach(mem.jaw, clamp(p.jawOpen + speech * 0.5, 0, 1), Math.min(1, delta * 18))
  // Speech is not only the jaw. Rounded vowels pull the lips forward on their
  // own rhythm, which is why a talking mouth that only opens and shuts reads as
  // a puppet's.
  const round = state.talking > 0.01 ? Math.max(0, Math.sin(t * 6.1 + 2.2)) * 0.5 * state.talking : 0
  mem.pucker = approach(mem.pucker, clamp(p.pucker + round, 0, 1), Math.min(1, delta * 13))

  // ---- Look-at -------------------------------------------------------------
  // Eyes are never still. With nothing to look at they flick to a new spot
  // every second or two and hold it — a fixed forward stare is the single most
  // dead-looking thing a face can do.
  mem.nextSaccade -= delta
  if (mem.nextSaccade <= 0) {
    mem.nextSaccade = 0.7 + Math.random() * 2.4
    mem.saccadeYaw = (Math.random() - 0.5) * 0.34
    mem.saccadePitch = (Math.random() - 0.5) * 0.16
  }
  let wantYaw = mem.saccadeYaw
  let wantPitch = mem.saccadePitch
  if (state.lookAt && head) {
    _v.copy(state.lookAt)
    head.worldToLocal(_v)
    const flat = Math.hypot(_v.x, _v.z)
    if (flat > 0.001) {
      // The face looks along +Z in head space.
      // Locked on, but still with a trace of drift so it is not a stare.
      wantYaw = clamp(Math.atan2(_v.x, _v.z) + mem.saccadeYaw * 0.18, -0.55, 0.55)
      wantPitch = clamp(-Math.atan2(_v.y, flat) + mem.saccadePitch * 0.18, -0.32, 0.32)
    }
  }
  const eyeSpeed = state.lookAt ? 7 : 18 // a saccade is fast; tracking is not
  mem.eyeYaw = approach(mem.eyeYaw, wantYaw, Math.min(1, delta * eyeSpeed))
  mem.eyePitch = approach(mem.eyePitch, wantPitch, Math.min(1, delta * eyeSpeed))

  for (const eye of [rig.eyeL, rig.eyeR]) {
    if (!eye) continue
    eye.rotation.y = mem.eyeYaw
    eye.rotation.x = mem.eyePitch
  }

  // ---- Lids ----------------------------------------------------------------
  // The open and shut angles come from Eyes.tsx, which derives them from the
  // lid caps' own aperture. Hard-coding them here is what made the "open" eye a
  // shut one: the numbers stopped agreeing with the geometry.
  // The lid meshes are BUILT in their neutral open pose, so a squint, a stare
  // and a blink are all just deltas from zero. The profile's lidCover shapes the
  // aperture in the geometry itself, where it belongs.
  const openTop = p.lidNarrow * LID.narrowTop + p.lidWide * LID.wideTop
  const openBot = p.lidNarrow * LID.narrowBot + p.lidWide * LID.wideBot
  const topRot = lerp(openTop, LID.shutTop, mem.blink)
  const botRot = lerp(openBot, LID.shutBot, mem.blink)
  if (rig.lidTopL) rig.lidTopL.rotation.x = topRot
  if (rig.lidTopR) rig.lidTopR.rotation.x = topRot
  if (rig.lidBotL) rig.lidBotL.rotation.x = botRot
  if (rig.lidBotR) rig.lidBotR.rotation.x = botRot

  // ---- Brows ---------------------------------------------------------------
  const browY = p.browLift * 0.013 - Math.abs(p.browTilt) * 0.002
  applyBrow(rig.browL, mem, 'L', browY, p)
  applyBrow(rig.browR, mem, 'R', browY, p)

  // ---- Mouth, cheeks and jaw ------------------------------------------------
  // All three are the same surface now, so all three are blend shapes on it.
  // The jaw GROUP still turns, but only to carry the teeth and the tongue with
  // the jawOpen shape — the face itself opens because the shape opens it.
  rig.morph('jawOpen', mem.jaw)
  if (rig.jaw) rig.jaw.rotation.x = mem.jaw * 0.3
  rig.morph('smile', p.cornerLift)
  rig.morph('frown', p.cornerDrop)
  rig.morph('cheekPuff', p.cheekRaise * 0.35)
  rig.morph('squint', p.lidNarrow * 0.8)
  rig.morph('browRaise', Math.max(0, p.browLift))
  rig.morph('sneer', Math.max(0, -p.browTilt) * 0.3)
  rig.morph('pucker', mem.pucker)
}

// Brow bases are read once from the built geometry, so the profile stays the
// source of where a brow sits and the animator only ever adds to it.
function applyBrow(
  g: THREE.Group | null,
  mem: FaceMemory,
  side: 'L' | 'R',
  lift: number,
  p: FacePose,
): void {
  if (!g) return
  const key = side === 'L' ? ('browBaseL' as const) : ('browBaseR' as const)
  if (mem[key] === undefined) mem[key] = g.position.y
  const asym = side === 'L' ? p.browAsym : -p.browAsym * 0.35
  g.position.y = (mem[key] as number) + lift + asym * 0.011
  // Inner end up for sadness, down for annoyance.
  g.rotation.z = (side === 'L' ? 1 : -1) * (p.browTilt * 0.2 + asym * 0.12)
}

/**
 * Hair lags a fraction behind the head. A small spring, not a simulation: the
 * point is that a turn of the head does not carry the whole mass with it as one
 * rigid piece.
 */
export function animateHair(hair: HairRig, mem: FaceMemory, headYaw: number, delta: number): void {
  const g = hair.root
  if (!g) return
  const dYaw = shortest(mem.lastHeadYaw, headYaw)
  mem.lastHeadYaw = headYaw
  // Spring toward zero, kicked by how fast the head turned.
  const kick = -dYaw * 2.2
  mem.hairLagV += (kick - mem.hairLag * 9 - mem.hairLagV * 2.4) * Math.min(delta * 60, 1.6)
  mem.hairLag += mem.hairLagV * delta
  mem.hairLag = clamp(mem.hairLag, -0.16, 0.16)
  g.rotation.y = mem.hairLag
  g.rotation.x = mem.hairLag * 0.12
}

function shortest(current: number, target: number): number {
  let d = (target - current) % (Math.PI * 2)
  if (d > Math.PI) d -= Math.PI * 2
  if (d < -Math.PI) d += Math.PI * 2
  return d
}
