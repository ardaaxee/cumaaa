import * as THREE from 'three'

// Inverse kinematics.
//
// Everything the characters do so far is FORWARD kinematics: the animator sets
// a joint angle and whatever hangs off it goes where it goes. That is fine for a
// walk cycle on flat ground and wrong for everything else — a foot on a step, a
// hand on a door handle, a character sitting on a chair. All three are the same
// question asked backwards: given where the END should be, what should the
// joints do?
//
// A limb is two bones and a hinge, which has a closed-form answer. No solver
// iterations, no convergence, no cost — just the law of cosines.

/** Result of a two-bone solve, in the ROOT joint's local frame. */
export interface TwoBone {
  /** Pitch and yaw to aim the chain at the target. */
  rootPitch: number
  rootYaw: number
  /** Hinge angle at the middle joint; negative folds the limb. */
  hinge: number
  /** How far the target was beyond the chain's reach, in metres (0 if reachable). */
  overreach: number
}

const _v = new THREE.Vector3()

/**
 * Aim a two-bone chain from `root` at `target`.
 *
 * The chain hangs along the root's local -Y (the whole rig is built that way),
 * and the hinge folds about local X — a knee and an elbow both do, in opposite
 * directions, which `bendSign` selects.
 *
 * ---- Rotation order ----
 * three applies an 'XYZ' Euler as Rx·Ry·Rz, i.e. Z first and X LAST — so a yaw
 * set alongside a pitch does nothing to a chain that hangs down the Y axis,
 * because the yaw is applied to a vector still pointing along it. The joints
 * this drives are therefore switched to 'YXZ' (yaw applied last), and the
 * angles below are derived for that order. Getting this backwards is silent: the
 * limb still moves, it just never reaches sideways.
 */
export function solveTwoBone(
  root: THREE.Vector3,
  target: THREE.Vector3,
  upper: number,
  lower: number,
  bendSign: 1 | -1 = 1,
): TwoBone {
  _v.copy(target).sub(root)
  const dist = _v.length()
  const reach = upper + lower
  // Never let the chain lock dead straight: a knee at exactly 180 degrees pops,
  // and the arithmetic below loses its sign.
  const clamped = Math.min(dist, reach * 0.999)
  const overreach = Math.max(0, dist - reach * 0.999)

  // Pitch tilts the chain out of straight-down toward -Z; yaw then swings it.
  const horizontal = Math.hypot(_v.x, _v.z)
  const rootYaw = Math.atan2(-_v.x, -_v.z)
  const rootPitchRaw = Math.atan2(horizontal, -_v.y)

  // Law of cosines for the interior angles.
  const cosA = (upper * upper + clamped * clamped - lower * lower) / (2 * upper * clamped)
  const cosB = (upper * upper + lower * lower - clamped * clamped) / (2 * upper * lower)
  const a = Math.acos(THREE.MathUtils.clamp(cosA, -1, 1))
  const b = Math.acos(THREE.MathUtils.clamp(cosB, -1, 1))

  return {
    rootPitch: rootPitchRaw + a * bendSign,
    rootYaw,
    hinge: (b - Math.PI) * bendSign,
    overreach,
  }
}

/**
 * Apply a solve to a root/hinge pair of groups.
 *
 * `blend` fades the IK in against whatever the animator already put there, so a
 * foot can be planted while the rest of the walk cycle keeps running.
 */
export function applyTwoBone(
  rootGroup: THREE.Object3D | null,
  hingeGroup: THREE.Object3D | null,
  s: TwoBone,
  blend: number,
): void {
  if (!rootGroup || !hingeGroup) return
  const k = THREE.MathUtils.clamp(blend, 0, 1)
  rootGroup.rotation.order = 'YXZ'
  rootGroup.rotation.x = THREE.MathUtils.lerp(rootGroup.rotation.x, s.rootPitch, k)
  rootGroup.rotation.y = THREE.MathUtils.lerp(rootGroup.rotation.y, s.rootYaw, k)
  hingeGroup.rotation.x = THREE.MathUtils.lerp(hingeGroup.rotation.x, s.hinge, k)
}

// ---- Ground ----------------------------------------------------------------

/**
 * What the ground is doing under a point.
 *
 * The house is built from axis-aligned slabs — floors, a balcony, a step or two
 * — so a full raycast against the scene graph is far more than this needs. A
 * registry of horizontal surfaces answers the only two questions foot placement
 * asks: how high, and how steeply.
 */
export interface GroundPatch {
  id: string
  /** Axis-aligned footprint. */
  minX: number
  maxX: number
  minZ: number
  maxZ: number
  /** Height at the patch's centre. */
  y: number
  /** Slope, in metres of rise per metre — a ramp or a kerb chamfer. */
  slopeX?: number
  slopeZ?: number
}

const patches = new Map<string, GroundPatch>()

export function registerGround(p: GroundPatch): void {
  patches.set(p.id, p)
}

export function unregisterGround(id: string): void {
  patches.delete(id)
}

export function clearGround(): void {
  patches.clear()
}

const _n = new THREE.Vector3()

/** Height and normal of the highest surface under (x, z) at or below `above`. */
export function groundAt(x: number, z: number, above = 4): { y: number; normal: THREE.Vector3 } {
  let bestY = 0
  let sx = 0
  let sz = 0
  for (const p of patches.values()) {
    if (x < p.minX || x > p.maxX || z < p.minZ || z > p.maxZ) continue
    const cx = (p.minX + p.maxX) / 2
    const cz = (p.minZ + p.maxZ) / 2
    const y = p.y + (p.slopeX ?? 0) * (x - cx) + (p.slopeZ ?? 0) * (z - cz)
    if (y > bestY && y <= above) {
      bestY = y
      sx = p.slopeX ?? 0
      sz = p.slopeZ ?? 0
    }
  }
  _n.set(-sx, 1, -sz).normalize()
  return { y: bestY, normal: _n.clone() }
}
