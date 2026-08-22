import * as THREE from 'three'
import type { AvatarProfile } from '../../../config/appearance'
import { RIG } from '../looks'

// The features that genuinely stand apart from the skull: the nose, the lips,
// the neck and the ear.
//
// All four used to be built from overlapping primitives — a capsule for the
// bridge with spheres for the tip and the wings, a capsule laid on its side for
// each lip, a cylinder for the neck with a visible flat cap where it met the
// jaw. Primitives placed next to each other never become one form: every
// intersection is a hard crease in the shading, and a capsule has the same
// radius from end to end, so a lip built from one is a bar and a nose built
// from one is a tube.
//
// Everything here is instead swept along a path with a section that CHANGES as
// it goes. That single property is what a nose, a lip and an ear all need.

/** A section: half-height (along the frame's up) and half-depth (along out). */
export interface Section {
  h: number
  d: number
}

/**
 * Sweep an elliptical section along a curve, with the section free to change
 * at every step. `up` fixes the roll so the surface does not twist.
 */
export function buildTube(
  curve: THREE.Curve<THREE.Vector3>,
  steps: number,
  radial: number,
  sectionAt: (t: number) => Section,
  up = new THREE.Vector3(0, 1, 0),
  closed = false,
): THREE.BufferGeometry {
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const stride = radial + 1
  const tangent = new THREE.Vector3()
  const side = new THREE.Vector3()
  const realUp = new THREE.Vector3()
  const point = new THREE.Vector3()

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    curve.getPointAt(t, point)
    curve.getTangentAt(t, tangent).normalize()
    side.crossVectors(tangent, up)
    if (side.lengthSq() < 1e-8) side.set(1, 0, 0)
    side.normalize()
    realUp.crossVectors(side, tangent).normalize()
    const s = sectionAt(t)
    for (let j = 0; j <= radial; j++) {
      const a = ((j % radial) / radial) * Math.PI * 2
      const ca = Math.cos(a)
      const sa = Math.sin(a)
      positions.push(
        point.x + realUp.x * ca * s.h + side.x * sa * s.d,
        point.y + realUp.y * ca * s.h + side.y * sa * s.d,
        point.z + realUp.z * ca * s.h + side.z * sa * s.d,
      )
      uvs.push(j / radial, t)
    }
  }

  for (let i = 0; i < steps; i++)
    for (let j = 0; j < radial; j++) {
      const a = i * stride + j
      const b = a + 1
      const c = a + stride
      const d = c + 1
      indices.push(a, c, b, b, c, d)
    }

  if (closed) {
    for (const [row, dir] of [[0, -1], [steps, 1]] as const) {
      const centre = positions.length / 3
      curve.getPointAt(row / steps, point)
      positions.push(point.x, point.y, point.z)
      uvs.push(0.5, row / steps)
      for (let j = 0; j < radial; j++) {
        const a = row * stride + j
        const b = a + 1
        if (dir > 0) indices.push(centre, a, b)
        else indices.push(centre, b, a)
      }
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  weldSeam(geo, steps + 1, stride, radial)
  return geo
}

/** Average the duplicated seam column's normals so no bright line shows. */
function weldSeam(geo: THREE.BufferGeometry, rows: number, stride: number, radial: number): void {
  const n = geo.attributes.normal as THREE.BufferAttribute
  for (let i = 0; i < rows; i++) {
    const a = i * stride
    const b = i * stride + radial
    const x = (n.getX(a) + n.getX(b)) / 2
    const y = (n.getY(a) + n.getY(b)) / 2
    const z = (n.getZ(a) + n.getZ(b)) / 2
    const len = Math.hypot(x, y, z) || 1
    n.setXYZ(a, x / len, y / len, z / len)
    n.setXYZ(b, x / len, y / len, z / len)
  }
  n.needsUpdate = true
}

// ---- Nose ------------------------------------------------------------------

interface NoseSlice {
  y: number
  /** Half-width. */
  w: number
  /** Half-depth, forward of `cz`. */
  d: number
  cz: number
  /** 0 = round section, 1 = a keel — narrow at the front, wide at the base. */
  keel: number
}

/**
 * A nose, from the root between the brows to the base above the lip.
 *
 * The section is keeled high up (a bridge is a ridge, not a tube) and rounds
 * out at the tip, and the whole thing tucks back toward the face at the base
 * so the wings sit ON the maxilla rather than hovering in front of it.
 */
export function buildNose(profile: AvatarProfile, radial: number): THREE.BufferGeometry {
  const n = profile.nose
  const bw = n.bridgeWidth / 0.0155
  const aw = n.nostrilWidth / 0.0135
  const dz = n.bridgeDepth / 0.026
  // `n.length` is the nose's REAL length in metres — nasion to subnasale — so
  // the control span below is normalised to it. It used to be divided by a
  // number that had nothing to do with the span, and every nose came out 8 cm
  // long: a beak in profile.
  const ln = n.length / 0.0775
  const tip = n.tipRound

  const control: NoseSlice[] = [
    // Root, at the nasion. Deep-set, and mostly inside the face. The keel is
    // moderate: a bridge is a soft ridge, not a blade.
    { y: 0.032, w: 0.0082 * bw, d: 0.0044 * dz, cz: 0.083, keel: 0.5 },
    { y: 0.014, w: 0.0088 * bw, d: 0.0062 * dz, cz: 0.0885, keel: 0.44 },
    // Rhinion — where the nasal bone hands over to cartilage.
    { y: -0.004, w: 0.0098 * bw, d: 0.008 * dz, cz: 0.0935, keel: 0.36 },
    { y: -0.017, w: 0.0118 * bw, d: 0.0102 * dz, cz: 0.098, keel: 0.24 },
    // Supratip break, then the lobule — round, and the widest part of the
    // cartilage.
    { y: -0.0265, w: 0.0148 * tip, d: 0.0128 * tip, cz: 0.0995, keel: 0.08 },
    { y: -0.0325, w: 0.0178 * aw, d: 0.0118, cz: 0.0955, keel: 0.02 },
    // Alar base, sweeping back into the cheek. The underside then CURVES back
    // rather than stepping back: an abrupt overhang here reads as a black slot
    // cut across the nose, because that is exactly what it casts.
    { y: -0.0378, w: 0.0192 * aw, d: 0.0092, cz: 0.0902, keel: 0 },
    { y: -0.0412, w: 0.0184 * aw, d: 0.0082, cz: 0.0888, keel: 0 },
    { y: -0.0438, w: 0.0166 * aw, d: 0.0068, cz: 0.0858, keel: 0 },
    // The last section runs back INSIDE the maxilla, so the cap that closes the
    // sweep is buried in the face instead of showing as a disc under the nose.
    { y: -0.0455, w: 0.0138 * aw, d: 0.005, cz: 0.0808, keel: 0 },
  ].map((s) => ({ ...s, y: s.y * ln }))

  const rows = 22
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const stride = radial + 1

  for (let i = 0; i < rows; i++) {
    const t = (i / (rows - 1)) * (control.length - 1)
    const lo = Math.min(control.length - 1, Math.floor(t))
    const hi = Math.min(control.length - 1, lo + 1)
    const f = t - lo
    const k = f * f * (3 - 2 * f)
    const a = control[lo]
    const b = control[hi]
    const y = a.y + (b.y - a.y) * k
    const w = a.w + (b.w - a.w) * k
    const d = a.d + (b.d - a.d) * k
    const cz = a.cz + (b.cz - a.cz) * k
    const keel = a.keel + (b.keel - a.keel) * k
    for (let j = 0; j <= radial; j++) {
      const ang = ((j % radial) / radial) * Math.PI * 2
      const front = Math.cos(ang) // 1 at the dorsum, -1 into the face
      const across = Math.sin(ang)
      // The keel narrows the section as it approaches the front.
      const narrow = 1 - keel * 0.55 * Math.max(0, front)
      positions.push(across * w * narrow, y, cz + front * d)
      uvs.push(j / radial, i / (rows - 1))
    }
  }
  for (let i = 0; i < rows - 1; i++)
    for (let j = 0; j < radial; j++) {
      const a = i * stride + j
      indices.push(a, a + stride, a + 1, a + 1, a + stride, a + stride + 1)
    }
  // Cap the base; the root end is buried in the face.
  const centre = positions.length / 3
  const last = control[control.length - 1]
  positions.push(0, last.y, last.cz)
  uvs.push(0.5, 1)
  // Wound to face DOWN. The other way round it was back-facing, so the base of
  // every nose was a hole you could see into the skull through — the black bar
  // that has been sitting under the nose in every screenshot.
  for (let j = 0; j < radial; j++) {
    const a = (rows - 1) * stride + j
    indices.push(centre, a + 1, a)
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  weldSeam(geo, rows, stride, radial)
  return geo
}

// ---- Lips ------------------------------------------------------------------

/**
 * A lip, swept along the mouth's arc.
 *
 * The upper lip carries a cupid's bow — two peaks with a dip between them —
 * and both taper to nothing at the corners. A capsule cannot do either: it has
 * one radius everywhere, which is why the old mouth read as a bar stuck to the
 * face.
 */
export function buildLip(profile: AvatarProfile, radial: number, upper: boolean): THREE.BufferGeometry {
  const lp = profile.lips
  const halfW = lp.width
  const pts: THREE.Vector3[] = []
  const steps = 12
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const x = (t * 2 - 1) * halfW
    const k = Math.abs(t * 2 - 1)
    if (upper) {
      // Two peaks either side of the philtrum, and the corners sitting lower
      // and further back.
      const bow = Math.cos((t * 2 - 1) * Math.PI * 2) * 0.0011
      pts.push(new THREE.Vector3(x, -k * k * 0.0042 + bow, 0.0092 - k * k * 0.0085))
    } else {
      pts.push(new THREE.Vector3(x, -0.0022 - k * k * 0.0026, 0.0098 - k * k * 0.0092))
    }
  }
  const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.3)
  const peak = upper ? lp.upper : lp.lower
  return buildTube(
    curve,
    steps * 2,
    radial,
    (t) => {
      const k = Math.abs(t * 2 - 1)
      // Full in the middle, vanishing at the corners.
      const taper = Math.max(0.12, 1 - k * k * 0.92)
      // The upper lip is thinner in the middle where the philtrum lands.
      const dip = upper ? 1 - Math.max(0, 1 - Math.abs(t - 0.5) * 9) * 0.22 : 1
      return { h: peak * taper * dip, d: peak * (upper ? 0.82 : 0.95) * taper }
    },
    new THREE.Vector3(0, 1, 0),
    true,
  )
}

// ---- Neck ------------------------------------------------------------------

/**
 * The neck, as a surface that runs from inside the shoulders to inside the
 * skull.
 *
 * It used to be a cylinder that stopped at `RIG.neckTop`, which is BELOW where
 * the jaw begins — so a flat disc floated in the gap under the chin. Running
 * the surface up past the jawline puts the join inside solid geometry, where a
 * join belongs, and the section changes on the way: wide and sloped at the
 * trapezius, narrowest at the middle, flaring again under the jaw.
 *
 * Returned in the CHEST's frame, matching where it is mounted.
 */
export function buildNeck(profile: AvatarProfile, radial: number): THREE.BufferGeometry {
  const fem = profile.presentation === 'feminine'
  const g = fem ? 0.92 : 1.06
  const base = RIG.chestBottom
  const control = [
    // Inside the chest, spreading into the trapezius.
    { y: RIG.neckBase - 0.06, w: 0.082 * g, d: 0.078 * g, cz: -0.006 },
    { y: RIG.neckBase - 0.015, w: 0.064 * g, d: 0.062 * g, cz: -0.004 },
    { y: RIG.neckBase + 0.03, w: 0.053 * g, d: 0.055 * g, cz: 0 },
    // Narrowest point, roughly at the thyroid cartilage.
    { y: RIG.neckTop - 0.03, w: 0.05 * g, d: 0.053 * g, cz: 0.002 },
    // Flaring again as it goes up behind the jaw.
    { y: RIG.neckTop + 0.01, w: 0.052 * g, d: 0.057 * g, cz: -0.002 },
    { y: RIG.neckTop + 0.055, w: 0.056 * g, d: 0.06 * g, cz: -0.008 },
    // Buried inside the skull, so nothing can show a cap.
    { y: RIG.neckTop + 0.1, w: 0.05 * g, d: 0.055 * g, cz: -0.012 },
  ]
  const rows = 18
  const radialN = radial
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const stride = radialN + 1
  for (let i = 0; i < rows; i++) {
    const t = (i / (rows - 1)) * (control.length - 1)
    const lo = Math.min(control.length - 1, Math.floor(t))
    const hi = Math.min(control.length - 1, lo + 1)
    const f = t - lo
    const k = f * f * (3 - 2 * f)
    const a = control[lo]
    const b = control[hi]
    const y = a.y + (b.y - a.y) * k - base
    const w = a.w + (b.w - a.w) * k
    const d = a.d + (b.d - a.d) * k
    const cz = a.cz + (b.cz - a.cz) * k
    for (let j = 0; j <= radialN; j++) {
      const ang = ((j % radialN) / radialN) * Math.PI * 2
      const ca = Math.cos(ang)
      const sa = Math.sin(ang)
      // The back of a neck is flatter than the front, and the two
      // sternocleidomastoids stand a little proud either side of the front.
      const scm = Math.max(0, Math.cos((ang - Math.PI / 2) * 2)) * 0.06 * Math.max(0, sa)
      const back = Math.max(0, -sa)
      positions.push(ca * w * (1 + scm), y, cz + sa * d * (1 - back * 0.12))
      uvs.push(j / radialN, i / (rows - 1))
    }
  }
  for (let i = 0; i < rows - 1; i++)
    for (let j = 0; j < radialN; j++) {
      const a = i * stride + j
      indices.push(a, a + stride, a + 1, a + 1, a + stride, a + stride + 1)
    }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  weldSeam(geo, rows, stride, radialN)
  return geo
}

// ---- Eyebrow ---------------------------------------------------------------

/**
 * A brow, as one tapering arch.
 *
 * Three capsules laid end to end gave a brow three separate silhouettes and a
 * uniform thickness in each, which is why they read as black slabs stuck above
 * the eyes. A brow has a thick HEAD at the nose end, a peak about two thirds
 * out, and a tail that thins to nothing.
 */
export function buildBrow(
  length: number,
  thickness: number,
  arch: number,
  radial: number,
): THREE.BufferGeometry {
  const pts: THREE.Vector3[] = []
  const steps = 9
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    pts.push(new THREE.Vector3(
      (-0.32 + t * 1.12) * length,
      Math.pow(Math.sin(Math.min(1, t * 1.05) * Math.PI), 0.7) * arch * 0.012,
      // Curving back round the orbital rim toward the temple.
      -0.014 * Math.pow(Math.max(0, t - 0.28), 2) * 3.2,
    ))
  }
  const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.3)
  return buildTube(curve, steps * 2, radial, (t) => {
    // Thickest at the head, thinning through the peak, a point at the tail.
    const taper = t < 0.3 ? 0.55 + t * 1.5 : Math.max(0.1, 1 - Math.pow((t - 0.3) / 0.7, 1.5))
    return { h: thickness * taper, d: thickness * 0.75 * taper }
  }, new THREE.Vector3(0, 1, 0), true)
}

// ---- Ear -------------------------------------------------------------------

/**
 * The helix: the outer rim of the ear, as a tapering curl. A torus has one
 * thickness the whole way round, which is exactly what an ear does not.
 */
export function buildHelix(scale: number, radial: number, side: -1 | 1 = 1): THREE.BufferGeometry {
  const pts: THREE.Vector3[] = []
  const steps = 14
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    // From the top of the ear, round the back, down to the lobe: not a circle
    // — an ear is taller than it is wide and leans back at the top.
    const a = -0.55 + t * 3.9
    const ry = 0.0245 * scale
    const rz = 0.0155 * scale
    pts.push(new THREE.Vector3(
      side * (0.001 + t * 0.0022) * scale,
      Math.cos(a) * ry * (1 - t * 0.12),
      Math.sin(a) * rz * (1 - t * 0.3) - 0.001 * scale,
    ))
  }
  const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.4)
  return buildTube(curve, 22, radial, (t) => {
    // Thin where it leaves the face, thickest over the top, tapering into the
    // lobe.
    const k = Math.sin(Math.min(1, t * 1.15) * Math.PI)
    return { h: (0.0018 + k * 0.0026) * scale, d: (0.0016 + k * 0.002) * scale }
  }, new THREE.Vector3(1, 0, 0), true)
}

/** The antihelix: the inner Y-shaped ridge. */
export function buildAntihelix(scale: number, radial: number, side: -1 | 1 = 1): THREE.BufferGeometry {
  const pts: THREE.Vector3[] = []
  const steps = 10
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const a = 0.1 + t * 2.8
    pts.push(new THREE.Vector3(
      side * 0.0032 * scale,
      Math.cos(a) * 0.0138 * scale,
      Math.sin(a) * 0.0092 * scale,
    ))
  }
  const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.4)
  return buildTube(curve, 16, radial, (t) => {
    const k = Math.sin(t * Math.PI)
    return { h: (0.0012 + k * 0.0016) * scale, d: (0.001 + k * 0.0013) * scale }
  }, new THREE.Vector3(1, 0, 0), true)
}
