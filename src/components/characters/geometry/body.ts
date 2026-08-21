import * as THREE from 'three'
import type { AvatarProfile } from '../../../config/appearance'
import { RIG } from '../looks'

// Bodies as continuous swept surfaces, not stacked capsules.
//
// A capsule has one radius all the way along and a hemisphere on each end. Two
// of them meeting at a joint is a pinch and a bulge with a seam between, which
// is exactly what "kapsül kol" looks like. A real limb changes girth AND cross
// section along its length: an upper arm is round at the deltoid and flattens
// toward the elbow, a forearm is broad below the elbow and narrow and oval at
// the wrist, a calf carries its mass high and behind.
//
// So: describe a limb (or a torso) as a stack of cross sections and sweep a
// surface through them. One mesh, continuous normals, real silhouette.

/** One cross section along the sweep. */
export interface Slice {
  /** Distance along the limb axis. For the torso this is world Y. */
  y: number
  /** Half-width (x) and half-depth (z) of the section. */
  w: number
  d: number
  /** Shift of the section's centre, for things that are not straight. */
  cx?: number
  cz?: number
  /**
   * Back flattening, 0..1. A torso and a shin are flatter behind than in
   * front; a pure ellipse everywhere is what makes a body look inflated.
   */
  flat?: number
}

/**
 * Sweep a surface through the given sections.
 *
 * `closeTop`/`closeBottom` cap the ends. Limb ends that live inside a joint are
 * left open — there is nothing to see and the cap would z-fight with the joint.
 */
export function buildSweep(slices: Slice[], radial: number, closeTop = false, closeBottom = false): THREE.BufferGeometry {
  const rows = slices.length
  const cols = radial
  const positions: number[] = []
  const indices: number[] = []

  for (let i = 0; i < rows; i++) {
    const s = slices[i]
    const flat = s.flat ?? 0
    for (let j = 0; j < cols; j++) {
      const a = (j / cols) * Math.PI * 2
      const ca = Math.cos(a)
      const sa = Math.sin(a)
      // Flattening pulls the BACK of the section (negative z) inward, leaving
      // the front round.
      const back = Math.max(0, -sa)
      const depth = s.d * (1 - flat * back * 0.45)
      positions.push((s.cx ?? 0) + ca * s.w, s.y, (s.cz ?? 0) + sa * depth)
    }
  }

  for (let i = 0; i < rows - 1; i++) {
    for (let j = 0; j < cols; j++) {
      const a = i * cols + j
      const b = i * cols + ((j + 1) % cols)
      const c = (i + 1) * cols + j
      const d = (i + 1) * cols + ((j + 1) % cols)
      indices.push(a, c, b, b, c, d)
    }
  }

  const cap = (rowIndex: number, upward: boolean) => {
    const s = slices[rowIndex]
    const centre = positions.length / 3
    positions.push(s.cx ?? 0, s.y, s.cz ?? 0)
    for (let j = 0; j < cols; j++) {
      const a = rowIndex * cols + j
      const b = rowIndex * cols + ((j + 1) % cols)
      if (upward) indices.push(centre, a, b)
      else indices.push(centre, b, a)
    }
  }
  if (closeBottom) cap(0, false)
  if (closeTop) cap(rows - 1, true)

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

/** Smooth interpolation through a handful of control sections. */
function resample(control: Slice[], count: number): Slice[] {
  const out: Slice[] = []
  for (let i = 0; i < count; i++) {
    const t = (i / (count - 1)) * (control.length - 1)
    const lo = Math.min(control.length - 1, Math.floor(t))
    const hi = Math.min(control.length - 1, lo + 1)
    const f = t - lo
    // Smoothstep between control sections, so the surface has no corners where
    // one section hands over to the next.
    const k = f * f * (3 - 2 * f)
    const a = control[lo]
    const b = control[hi]
    out.push({
      y: a.y + (b.y - a.y) * k,
      w: a.w + (b.w - a.w) * k,
      d: a.d + (b.d - a.d) * k,
      cx: (a.cx ?? 0) + ((b.cx ?? 0) - (a.cx ?? 0)) * k,
      cz: (a.cz ?? 0) + ((b.cz ?? 0) - (a.cz ?? 0)) * k,
      flat: (a.flat ?? 0) + ((b.flat ?? 0) - (a.flat ?? 0)) * k,
    })
  }
  return out
}

// ---- Torso -----------------------------------------------------------------

/**
 * Pelvis through ribcage to the base of the neck, as one surface.
 *
 * The landmarks are real: the iliac crest, the waist above it, the flare of the
 * lower ribs, the chest, and the trapezius sloping up to the neck. The male and
 * female presets differ in where those land — a wider chest and narrower hips
 * against a narrower waist and wider hips — rather than in colour.
 */
export function buildTorso(
  profile: AvatarProfile,
  radial: number,
  /**
   * Which garment the section belongs to. Both halves are cut from the SAME
   * profile with a two-slice overlap, so the shirt sits on the trousers with no
   * step between them — the previous hem was sized from the old capsule and
   * stood 5 cm proud of the waist, which read as a funnel.
   */
  part: 'top' | 'bottom' = 'top',
): THREE.BufferGeometry {
  const b = profile.build
  const fem = profile.presentation === 'feminine'
  // Shoulder and hip half-widths come from the profile; the rest is shaped
  // around them.
  const sh = b.shoulder
  const hip = b.hip + (fem ? 0.042 : 0.03)
  const waist = b.waist * (fem ? 0.88 : 1.0)

  const control: Slice[] = [
    // seat / glutes
    { y: 0.8, w: hip * 0.96, d: hip * 0.82, cz: -0.012, flat: 0.2 },
    // iliac crest — the widest point of the pelvis
    { y: 0.9, w: hip, d: hip * 0.74, cz: -0.004, flat: 0.35 },
    // waist
    { y: 1.02, w: waist, d: waist * 0.86, flat: 0.45 },
    // lower ribs flaring out again
    { y: 1.12, w: waist * 1.08, d: waist * 0.92, flat: 0.5 },
    // chest
    { y: 1.24, w: sh * 0.8, d: waist * 1.0, cz: fem ? 0.008 : 0.004, flat: 0.55 },
    // upper chest, just below the collarbones
    { y: 1.34, w: sh * 0.86, d: waist * 0.94, flat: 0.55 },
    // across the shoulders
    { y: 1.41, w: sh * 0.92, d: waist * 0.84, cz: -0.006, flat: 0.5 },
    // trapezius, sloping in to the neck over a real distance rather than a step
    { y: 1.44, w: sh * 0.74, d: waist * 0.74, cz: -0.008, flat: 0.45 },
    { y: 1.47, w: sh * 0.46, d: waist * 0.6, cz: -0.01, flat: 0.4 },
  ]
  const full = resample(control, 26)
  // The waist is where the garments meet.
  const waistIdx = full.findIndex((s) => s.y >= 1.0)
  const range = part === 'bottom' ? full.slice(0, waistIdx + 3) : full.slice(Math.max(0, waistIdx - 1))
  return buildSweep(range, radial, part === 'top', part === 'bottom')
}

/** Half-width and half-depth of the torso at a given height, for trims. */
export function torsoAt(profile: AvatarProfile, y: number): { w: number; d: number } {
  const geo = buildTorsoSlices(profile)
  let best = geo[0]
  for (const s of geo) if (Math.abs(s.y - y) < Math.abs(best.y - y)) best = s
  return { w: best.w, d: best.d }
}

function buildTorsoSlices(profile: AvatarProfile): Slice[] {
  const b = profile.build
  const fem = profile.presentation === 'feminine'
  const sh = b.shoulder
  const hip = b.hip + (fem ? 0.042 : 0.03)
  const waist = b.waist * (fem ? 0.88 : 1.0)
  return resample([
    { y: 0.8, w: hip * 0.96, d: hip * 0.82, cz: -0.012, flat: 0.2 },
    { y: 0.9, w: hip, d: hip * 0.74, cz: -0.004, flat: 0.35 },
    { y: 1.02, w: waist, d: waist * 0.86, flat: 0.45 },
    { y: 1.12, w: waist * 1.08, d: waist * 0.92, flat: 0.5 },
    { y: 1.24, w: sh * 0.8, d: waist * 1.0, cz: fem ? 0.008 : 0.004, flat: 0.55 },
    { y: 1.34, w: sh * 0.86, d: waist * 0.94, flat: 0.55 },
    { y: 1.41, w: sh * 0.92, d: waist * 0.84, cz: -0.006, flat: 0.5 },
    { y: 1.44, w: sh * 0.74, d: waist * 0.74, cz: -0.008, flat: 0.45 },
    { y: 1.47, w: sh * 0.46, d: waist * 0.6, cz: -0.01, flat: 0.4 },
  ], 26)
}

// ---- Limbs -----------------------------------------------------------------

export type LimbKind = 'upperArm' | 'foreArm' | 'thigh' | 'calf'

/**
 * One limb segment, built downward from its joint (local -Y), matching the way
 * the rig hangs. Girth and cross section both change along the length.
 */
export function buildLimb(kind: LimbKind, scale: number, radial: number): THREE.BufferGeometry {
  let control: Slice[]
  switch (kind) {
    case 'upperArm':
      // Round and full at the deltoid, flattening and narrowing to the elbow.
      control = [
        { y: 0.01, w: 0.049, d: 0.049 },
        { y: -0.08, w: 0.046, d: 0.044 },
        { y: -0.17, w: 0.04, d: 0.037 },
        { y: -RIG.upperArm + 0.01, w: 0.035, d: 0.031 },
      ]
      break
    case 'foreArm':
      // Broad just below the elbow where the muscle bellies sit, then a narrow
      // oval wrist.
      control = [
        { y: 0.005, w: 0.036, d: 0.033 },
        { y: -0.06, w: 0.038, d: 0.033 },
        { y: -0.15, w: 0.031, d: 0.026 },
        { y: -RIG.forearm + 0.005, w: 0.025, d: 0.019 },
      ]
      break
    case 'thigh':
      control = [
        { y: 0.02, w: 0.085, d: 0.082, flat: 0.15 },
        { y: -0.12, w: 0.079, d: 0.075, flat: 0.2 },
        { y: -0.28, w: 0.066, d: 0.063, flat: 0.25 },
        { y: -RIG.thigh + 0.01, w: 0.054, d: 0.052 },
      ]
      break
    case 'calf':
      // The calf carries its mass HIGH and BEHIND, then runs to a narrow ankle.
      control = [
        { y: 0.01, w: 0.053, d: 0.052 },
        { y: -0.07, w: 0.055, d: 0.06, cz: -0.012 },
        { y: -0.17, w: 0.045, d: 0.047, cz: -0.008 },
        { y: -0.28, w: 0.036, d: 0.036, cz: -0.002 },
        { y: -RIG.shin + 0.02, w: 0.031, d: 0.03 },
      ]
      break
  }
  const scaled = control.map((s) => ({
    ...s,
    w: s.w * scale,
    d: s.d * scale,
    cz: (s.cz ?? 0) * scale,
  }))
  return buildSweep(resample(scaled, 16), radial, false, false)
}

/**
 * A joint: the volume that fills the gap between two segments so the elbow or
 * the knee reads as one continuous arm rather than two tubes meeting.
 */
export function buildJoint(r: number, radial: number, squashZ = 1): THREE.BufferGeometry {
  const control: Slice[] = [
    { y: r * 0.95, w: r * 0.35, d: r * 0.35 * squashZ },
    { y: r * 0.5, w: r * 0.86, d: r * 0.86 * squashZ },
    { y: 0, w: r, d: r * squashZ },
    { y: -r * 0.5, w: r * 0.86, d: r * 0.86 * squashZ },
    { y: -r * 0.95, w: r * 0.35, d: r * 0.35 * squashZ },
  ]
  return buildSweep(resample(control, 11), radial, true, true)
}

// ---- Foot ------------------------------------------------------------------

/**
 * A foot, from the ankle to the toes: a heel, an arch that lifts off the floor,
 * a ball and a toe box. Built as a sweep along Z so the sole is a real shape
 * rather than a box with a sphere on the front.
 */
export function buildFoot(scale: number, radial: number): THREE.BufferGeometry {
  // Here the sweep axis is Z (heel to toe), so the sections are built in the
  // local frame and then rotated into place.
  const control: Slice[] = [
    { y: -0.055, w: 0.028, d: 0.03, cz: 0.03 },
    { y: -0.03, w: 0.036, d: 0.038, cz: 0.026 },
    { y: 0.02, w: 0.039, d: 0.031, cz: 0.018 },
    { y: 0.08, w: 0.041, d: 0.027, cz: 0.016 },
    { y: 0.13, w: 0.038, d: 0.024, cz: 0.016 },
    { y: 0.155, w: 0.028, d: 0.019, cz: 0.016 },
  ]
  const scaled = control.map((s) => ({
    y: s.y * scale,
    w: s.w * scale,
    d: s.d * scale,
    cz: (s.cz ?? 0) * scale,
    flat: 0.25,
  }))
  const geo = buildSweep(resample(scaled, 14), radial, true, true)
  // Sweep built along Y; stand it up so it runs heel-to-toe along Z.
  geo.rotateX(Math.PI / 2)
  return geo
}
