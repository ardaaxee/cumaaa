import * as THREE from 'three'
import type { AvatarRig } from './Avatar'
import { applyTwoBone, groundAt, solveTwoBone } from '../../systems/ik'
import { RIG } from './looks'

// The things a body does when it is doing nothing.
//
// A figure standing still is the hardest thing to make look alive, because
// "still" is not still: the chest fills and empties, the weight drifts from one
// foot to the other over several seconds and the hips and shoulders answer it,
// the fingers move a fraction, and the shoulders settle. Without them a
// character reads as paused rather than waiting, however good the walk cycle is.
//
// All of it layers ON TOP of whatever the animator has set, and all of it fades
// out as the character starts moving — a weight shift during a run is nonsense.

const lerp = THREE.MathUtils.lerp

export interface MicroState {
  /** Which foot the weight is on, -1 left to +1 right, eased. */
  weight: number
  weightTarget: number
  nextShift: number
  /** Breath phase, so it does not reset when the action changes. */
  breath: number
  /** Per-finger drift, one per digit. */
  finger: Float32Array
}

export function newMicroState(): MicroState {
  return {
    weight: 0,
    weightTarget: 0,
    nextShift: 2 + Math.random() * 4,
    breath: Math.random() * Math.PI * 2,
    finger: new Float32Array(10),
  }
}

export interface MicroInput {
  /** Ground speed, m/s. Micro motion fades out as this rises. */
  speed: number
  sit: number
  delta: number
  /** 0..1 — how tense the character is; a tense body breathes shallower and faster. */
  tension?: number
}

export function applyMicroAnimation(rig: AvatarRig, m: MicroState, p: MicroInput): void {
  const delta = Math.min(p.delta, 0.05)
  const idle = THREE.MathUtils.clamp(1 - p.speed / 0.9, 0, 1) * (1 - p.sit * 0.55)
  if (idle <= 0.001) return
  const tension = p.tension ?? 0

  // ---- Breathing ----------------------------------------------------------
  // Roughly 14 breaths a minute at rest, faster and shallower when tense. The
  // chest lifts and widens; the shoulders follow a beat behind.
  const rate = 1.45 + tension * 0.9
  m.breath += delta * rate
  const inhale = Math.sin(m.breath)
  const depth = (0.009 - tension * 0.003) * idle
  if (rig.chest) {
    rig.chest.scale.x = 1 + inhale * depth * 0.9
    rig.chest.scale.y = 1 + inhale * depth * 0.5
    rig.chest.scale.z = 1 + inhale * depth * 1.3
    rig.chest.rotation.x += inhale * 0.012 * idle
  }
  const shoulderLift = Math.sin(m.breath - 0.5) * 0.008 * idle
  if (rig.shoulderL) rig.shoulderL.position.y += shoulderLift
  if (rig.shoulderR) rig.shoulderR.position.y += shoulderLift

  // ---- Weight shift -------------------------------------------------------
  // People do not stand evenly on both feet for long. Every few seconds the
  // weight goes to one side: that hip rises, the shoulders counter, and the
  // unloaded knee softens.
  m.nextShift -= delta
  if (m.nextShift <= 0) {
    m.nextShift = 3.5 + Math.random() * 5
    m.weightTarget = m.weightTarget > 0.1 ? -0.7 - Math.random() * 0.3 : 0.7 + Math.random() * 0.3
    if (Math.random() < 0.22) m.weightTarget = 0 // sometimes just square up
  }
  m.weight = lerp(m.weight, m.weightTarget, Math.min(1, delta * 0.9))
  const w = m.weight * idle
  if (rig.pelvis) {
    rig.pelvis.position.x += w * 0.017
    // The loaded hip rides UP — that is the whole shape of contrapposto.
    rig.pelvis.rotation.z += -w * 0.045
  }
  if (rig.chest) rig.chest.rotation.z = lerp(rig.chest.rotation.z, w * 0.03, 0.6)
  // The unloaded leg softens at the knee and the foot turns out a little.
  if (rig.kneeL) rig.kneeL.rotation.x -= Math.max(0, w) * 0.14
  if (rig.kneeR) rig.kneeR.rotation.x -= Math.max(0, -w) * 0.14
  if (rig.hipL) rig.hipL.rotation.z = lerp(rig.hipL.rotation.z, Math.max(0, w) * 0.07, 0.5)
  if (rig.hipR) rig.hipR.rotation.z = lerp(rig.hipR.rotation.z, -Math.max(0, -w) * 0.07, 0.5)

  // ---- Fingers ------------------------------------------------------------
  // Hands are never quite still. A few hundredths of a radian, at different
  // rates per finger, is the whole effect — and its absence is why a resting
  // hand looks moulded.
  for (const [h, hand] of [rig.fingersL, rig.fingersR].entries()) {
    if (!hand) continue
    for (let i = 0; i < hand.digits.length; i++) {
      const idx = h * 5 + i
      const drift = Math.sin(m.breath * (0.7 + i * 0.19) + idx * 1.7) * 0.03 * idle
      m.finger[idx] = lerp(m.finger[idx], drift, Math.min(1, delta * 6))
      const d = hand.digits[i]
      if (d.mcp) d.mcp.rotation.x += m.finger[idx]
      if (d.pip) d.pip.rotation.x += m.finger[idx] * 1.4
    }
  }
}

// ---- Foot placement --------------------------------------------------------

const _hip = new THREE.Vector3()
const _ankle = new THREE.Vector3()
const _target = new THREE.Vector3()

/**
 * Put the feet ON the ground.
 *
 * Forward kinematics puts a foot wherever the leg angles happen to leave it,
 * which is correct on a flat floor at exactly the height the rig was authored
 * for and wrong on a step, a kerb or a ramp. This measures where each ankle
 * ACTUALLY ended up, asks the ground registry what is under it, and solves the
 * leg back so the foot lands there.
 *
 * The registry (systems/ik.ts) is deliberately a list of axis-aligned patches
 * rather than a scene raycast: the house is slabs, and this runs every frame.
 */
export function applyFootIk(rig: AvatarRig, blend: number, legScale: number): void {
  const root = rig.root
  if (!root || blend <= 0.001) return
  root.updateMatrixWorld(true)

  const legs: [THREE.Group | null, THREE.Group | null, THREE.Group | null][] = [
    [rig.hipL, rig.kneeL, rig.ankleL],
    [rig.hipR, rig.kneeR, rig.ankleR],
  ]
  // Sole clearance under the ankle joint, in metres.
  const soleGap = 0.075 * legScale

  for (const [hip, knee, ankle] of legs) {
    if (!hip || !knee || !ankle) continue
    hip.getWorldPosition(_hip)
    ankle.getWorldPosition(_ankle)
    const g = groundAt(_ankle.x, _ankle.z, _hip.y)
    const wantY = g.y + soleGap
    // Only ever push a foot UP onto a surface. Pulling it down would stretch
    // the leg toward a floor that is not under it — the swing foot in a stride
    // is meant to be in the air.
    if (_ankle.y >= wantY - 0.002) continue

    _target.set(_ankle.x, wantY, _ankle.z)
    // Solve in the hip's PARENT frame, which is the frame its rotation lives in.
    const parent = hip.parent
    if (parent) {
      parent.worldToLocal(_target)
      parent.worldToLocal(_hip)
    }
    // A knee folds BACKWARD, which in this rig is a negative hinge.
    const s = solveTwoBone(_hip, _target, RIG.thigh, RIG.shin, -1)
    applyTwoBone(hip, knee, s, blend)
    // Match the surface: the ankle rolls to the slope rather than the foot
    // meeting a ramp on one corner.
    ankle.rotation.x += Math.atan2(-g.normal.z, g.normal.y) * blend
    ankle.rotation.z += Math.atan2(g.normal.x, g.normal.y) * blend
  }
}
