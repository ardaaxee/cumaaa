import * as THREE from 'three'
import { buildSweep, type Slice } from './body'

// The hand.
//
// Built hanging DOWN from the wrist, matching the arm chain: local -Y runs out
// along the hand, +Z is the back of the hand, and +X is toward the thumb on the
// right hand.
//
// Every part is a swept surface with a section that changes along its length,
// for the same reason the limbs are: a capsule has one radius end to end, and a
// finger built from two of them is two sausages with a bump between. A real
// phalanx is broad and flat at the base, narrows at the shaft, and swells again
// at the condyle where the next joint rides on it.

export interface Phalanx {
  prox: number
  mid: number
  dist: number
  /** Radius at the knuckle. */
  radius: number
}

/** Thumb, index, middle, ring, little — real proportions, in metres. */
export const DIGITS: { name: string; x: number; z: number; base: number; ph: Phalanx; splay: number }[] = [
  // The thumb's metacarpal is inside the palm, so its "base" is much lower.
  { name: 'thumb', x: 0.030, z: 0.010, base: -0.030, ph: { prox: 0.031, mid: 0, dist: 0.025, radius: 0.0105 }, splay: 0.95 },
  { name: 'index', x: 0.0215, z: 0.003, base: -0.072, ph: { prox: 0.039, mid: 0.023, dist: 0.017, radius: 0.0082 }, splay: 0.11 },
  { name: 'middle', x: 0.0072, z: 0.005, base: -0.075, ph: { prox: 0.043, mid: 0.026, dist: 0.018, radius: 0.0085 }, splay: 0.02 },
  { name: 'ring', x: -0.0072, z: 0.004, base: -0.073, ph: { prox: 0.040, mid: 0.024, dist: 0.017, radius: 0.0079 }, splay: -0.05 },
  { name: 'little', x: -0.0208, z: -0.001, base: -0.067, ph: { prox: 0.031, mid: 0.018, dist: 0.015, radius: 0.0069 }, splay: -0.16 },
]

/**
 * One phalanx: broad at the base, narrowing through the shaft, swelling again
 * at the head where the next joint sits on it.
 */
export function buildPhalanx(len: number, r: number, taper: number, radial: number): THREE.BufferGeometry {
  const control: Slice[] = [
    { y: 0, w: r, d: r * 0.92, flat: 0.15 },
    { y: -len * 0.22, w: r * 0.9, d: r * 0.84, flat: 0.2 },
    { y: -len * 0.62, w: r * 0.84 * taper, d: r * 0.8 * taper, flat: 0.25 },
    { y: -len * 0.88, w: r * 0.9 * taper, d: r * 0.86 * taper, flat: 0.2 },
    { y: -len, w: r * 0.72 * taper, d: r * 0.7 * taper, flat: 0.15 },
  ]
  return buildSweep(resampleLocal(control, 9), radial, true, false)
}

/** The last phalanx: it tapers to a rounded pad rather than a joint head. */
export function buildTip(len: number, r: number, radial: number): THREE.BufferGeometry {
  const control: Slice[] = [
    { y: 0, w: r, d: r * 0.9, flat: 0.15 },
    { y: -len * 0.45, w: r * 0.88, d: r * 0.78, flat: 0.25 },
    { y: -len * 0.82, w: r * 0.7, d: r * 0.6, flat: 0.2 },
    { y: -len, w: r * 0.32, d: r * 0.3 },
  ]
  return buildSweep(resampleLocal(control, 9), radial, true, true)
}

/**
 * The palm: a wedge, wide and flat, wider across the knuckles than at the
 * wrist, with the thenar mass standing proud on the thumb side.
 */
export function buildPalm(radial: number): THREE.BufferGeometry {
  const control: Slice[] = [
    { y: 0.004, w: 0.026, d: 0.017, flat: 0.35 },
    { y: -0.014, w: 0.030, d: 0.018, flat: 0.4 },
    { y: -0.036, w: 0.035, d: 0.019, cx: 0.001, flat: 0.4 },
    { y: -0.058, w: 0.038, d: 0.018, cx: 0.001, flat: 0.35 },
    { y: -0.072, w: 0.037, d: 0.016, flat: 0.3 },
    { y: -0.080, w: 0.032, d: 0.013, flat: 0.25 },
  ]
  return buildSweep(resampleLocal(control, 14), radial, true, true)
}

/** The ball of muscle at the base of the thumb. Its absence is why hands read as flat. */
export function buildThenar(radial: number): THREE.BufferGeometry {
  const control: Slice[] = [
    { y: -0.008, w: 0.010, d: 0.010 },
    { y: -0.026, w: 0.016, d: 0.013 },
    { y: -0.048, w: 0.014, d: 0.011 },
    { y: -0.062, w: 0.007, d: 0.006 },
  ]
  return buildSweep(resampleLocal(control, 8), radial, true, true)
}

/** A nail: a curved plate lying on the back of the fingertip. */
export function buildNail(r: number, radial: number): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(r, Math.max(6, radial), Math.max(5, Math.round(radial * 0.6)), 0, Math.PI * 2, 0, 0.9)
  geo.scale(0.72, 0.34, 1.05)
  return geo
}

function resampleLocal(control: Slice[], count: number): Slice[] {
  const out: Slice[] = []
  for (let i = 0; i < count; i++) {
    const t = (i / (count - 1)) * (control.length - 1)
    const lo = Math.min(control.length - 1, Math.floor(t))
    const hi = Math.min(control.length - 1, lo + 1)
    const f = t - lo
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
