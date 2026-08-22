import * as THREE from 'three'

// Eyelids.
//
// A spherical cap can only ever cut a CIRCLE out of the eyeball, so an eye
// masked by two caps is a round window with a ball behind it — which is exactly
// why the eyes read as spheres stuck on a face rather than as eyes set into a
// skull. The opening between real lids is an almond: it peaks nasally on top,
// dips temporally below, and pinches to a point at each canthus.
//
// So the lid is built as a surface whose RIM follows that almond and whose far
// edge disappears over the back of the ball. Both lids are generated already in
// their neutral open pose, which means the animator's job collapses to rotating
// them about the eye's centre from zero — no trigonometry shared between two
// files that can drift apart.

export interface LidBuild {
  geo: THREE.BufferGeometry
  /** Points along the lid margin, for seating lashes on it. */
  rim: { pos: THREE.Vector3; along: THREE.Vector3; out: THREE.Vector3 }[]
}

/** Direction on the eyeball: `h` radians temporal from forward, `v` up. */
function dir(h: number, v: number): THREE.Vector3 {
  return new THREE.Vector3(Math.sin(h) * Math.cos(v), Math.sin(v), Math.cos(h) * Math.cos(v))
}

function slerp(a: THREE.Vector3, b: THREE.Vector3, t: number): THREE.Vector3 {
  const dot = THREE.MathUtils.clamp(a.dot(b), -1, 1)
  const omega = Math.acos(dot)
  if (omega < 1e-4) return a.clone()
  const s = Math.sin(omega)
  return a.clone().multiplyScalar(Math.sin((1 - t) * omega) / s).add(b.clone().multiplyScalar(Math.sin(t * omega) / s))
}

/** The corners of the fissure, in the eye's own frame. */
const CANTHUS_H = 0.98
/**
 * How far round the ball the lids reach BEYOND the corners.
 *
 * They have to reach nearly to the equator. The globe is 24 mm across and the
 * socket only hides its back half, so a lid that stops at the canthus leaves
 * the outer third of the eyeball bare against the cheek — which is exactly why
 * the eyes read as balls resting on the face however well the aperture itself
 * was shaped. Past the corners both lids follow the SAME seam, so the opening
 * still closes there.
 */
const WRAP_H = 1.42
/** Both canthi sit a little below the forward axis. */
const CANTHUS_V = -0.06

/**
 * @param R      eyeball radius
 * @param cover  profile `eyes.lidCover` — how hooded the eye is at rest
 * @param upper  which lid
 */
export function buildLid(
  R: number,
  cover: number,
  upper: boolean,
  cols: number,
  rows: number,
  /** +1 when the eye's temporal side is +X (the right eye), -1 for the left. */
  temporal: -1 | 1 = 1,
): LidBuild {
  // How far the margin stands off the ball, and how far the rolled edge tucks
  // back under it.
  // The upper lid rides just outside the lower one, so where the two share a
  // seam past the corners they cannot z-fight.
  const OUT = R * (upper ? 1.052 : 1.042)
  const IN = R * (upper ? 0.986 : 0.982)

  // Peak of the margin, measured from the forward axis.
  // A real palpebral aperture is about 10 mm top to bottom on a 24 mm globe.
  // At 0.40/-0.60 it was 4.4 mm and both characters looked like they were
  // squinting into the sun.
  const peak = upper ? 0.52 - cover * 0.4 : -0.42
  // Where along the fissure that peak sits: nasally for the upper lid,
  // temporally for the lower one.
  const peakAt = upper ? -0.14 : 0.16

  // `t` runs -1..1 across the whole width of the lid, which is wider than the
  // opening: |h| beyond the canthus is the part that wraps the globe.
  const hAt = (t: number) => t * WRAP_H * temporal
  const rimDir = (t: number, dv = 0): THREE.Vector3 => {
    const h = hAt(t)
    // Normalised position within the OPENING; ±1 is the canthus, beyond that
    // the two lids share a seam and the eye is shut.
    const tc = (t * WRAP_H) / CANTHUS_H
    if (Math.abs(tc) >= 1) return dir(h, CANTHUS_V + dv * 0.3)
    const span = tc >= peakAt ? 1 - peakAt : 1 + peakAt
    const k = Math.min(1, Math.abs(tc - peakAt) / span)
    const v = CANTHUS_V + (peak - CANTHUS_V) * (1 - Math.pow(k, 1.7))
    return dir(h, v + dv * (1 - Math.abs(tc)))
  }
  // The root: where the lid vanishes over the ball into the socket.
  const rootDir = (t: number): THREE.Vector3 =>
    dir(hAt(t) * 0.62, upper ? 1.52 : -1.34)

  // Rows: a rolled margin first (three tight rows), then the sweep to the root.
  // The margin is ROLLED: the first rows curl back under the rim, past it into
  // the opening and in toward the ball. Without that a lid is a paper edge.
  const roll = upper ? -1 : 1
  const profile: { root: number; dv: number; r: number }[] = [
    { root: 0, dv: roll * 0.085, r: IN },
    { root: 0, dv: roll * 0.04, r: R * 1.015 },
    { root: 0, dv: 0, r: OUT },
  ]
  for (let i = 1; i <= rows; i++) profile.push({ root: i / rows, dv: 0, r: OUT })

  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const stride = cols + 1
  const rim: LidBuild['rim'] = []

  for (let ri = 0; ri < profile.length; ri++) {
    const p = profile[ri]
    for (let j = 0; j <= cols; j++) {
      const t = (j / cols) * 2 - 1
      const rd = rimDir(t, p.dv)
      const d = p.root > 0 ? slerp(rd, rootDir(t), p.root) : rd
      positions.push(d.x * p.r, d.y * p.r, d.z * p.r)
      uvs.push(j / cols, ri / (profile.length - 1))
      if (ri === 2) {
        rim.push({ pos: d.clone().multiplyScalar(p.r), along: new THREE.Vector3(), out: d.clone() })
      }
    }
  }
  // Tangents along the margin, for orienting lashes.
  for (let i = 0; i < rim.length; i++) {
    const a = rim[Math.max(0, i - 1)].pos
    const b = rim[Math.min(rim.length - 1, i + 1)].pos
    rim[i].along.copy(b).sub(a).normalize()
  }

  for (let ri = 0; ri < profile.length - 1; ri++)
    for (let j = 0; j < cols; j++) {
      const a = ri * stride + j
      const flip = (upper ? 1 : -1) * temporal > 0
      if (flip) indices.push(a, a + stride, a + 1, a + 1, a + stride, a + stride + 1)
      else indices.push(a, a + 1, a + stride, a + 1, a + stride + 1, a + stride)
    }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return { geo, rim }
}

/**
 * How far each lid rotates to shut. Both are measured about the eye's centre,
 * from the neutral pose the geometry is already in — the upper lid does most of
 * the travel, which is what a real blink looks like.
 */
export const LID_TRAVEL = {
  /** Rotating a lid by +x about X lowers its margin by x radians. */
  shutTop: 0.48,
  shutBot: -0.42,
  narrowTop: 0.16,
  narrowBot: -0.12,
  wideTop: -0.12,
  wideBot: 0.07,
} as const
