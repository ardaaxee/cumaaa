import * as THREE from 'three'

// Hair, as cards.
//
// A card is a thin strip of geometry carrying a texture of many fine strands
// with an alpha channel (systems/materials/hair.ts). Its silhouette is the
// texture's, not the mesh's, which is the whole point: the tubes this replaces
// each had a hard rounded outline, and a head of them reads as a moulded wig
// however carefully the locks are routed.
//
// Positions on the head are spherical: `az` is the angle round the skull
// (0 = front, PI = back) and `phi` the angle down from the crown.

export interface Skull {
  x: number
  y: number
  z: number
  r: number
}

export function onSkull(s: Skull, az: number, phi: number, swell: number): THREE.Vector3 {
  const k = Math.sin(phi) * s.r * swell
  return new THREE.Vector3(k * Math.sin(az) * s.x, s.r * swell * Math.cos(phi) * s.y, k * Math.cos(az) * s.z)
}

export interface ClumpSpec {
  az: number
  /** Where on the crown it starts, radians from straight up. */
  phi0: number
  /** How far down the skull it stays against the head before falling free. */
  phiEnd: number
  /** How far it falls once it leaves the head. */
  fall: number
  /** How far it drifts away from the head on the way down. */
  out: number
  /** Card width at the root, in metres. */
  width: number
  /** How much the card narrows toward the tip. */
  taper: number
  wave: number
  seed: number
}

export interface Clump {
  /** Where on the scalp this clump is rooted, in head-local metres. */
  root: THREE.Vector3
  /** Card geometry, expressed in the clump's OWN frame (root at the origin). */
  geo: THREE.BufferGeometry
  /** How far the tip hangs from the root — how much it should swing. */
  reach: number
}

const SAMPLES = 12

/** The path a clump follows: against the skull first, then falling away. */
function clumpPath(s: Skull, c: ClumpSpec): { p: THREE.Vector3; n: THREE.Vector3 }[] {
  const out: { p: THREE.Vector3; n: THREE.Vector3 }[] = []
  // Phase 1 — against the skull. The card's normal is the skull's normal, so it
  // lies ON the head rather than standing off it.
  const wrap = 4
  for (let i = 0; i <= wrap; i++) {
    const phi = c.phi0 + ((c.phiEnd - c.phi0) * i) / wrap
    const p = onSkull(s, c.az, phi, 1.035)
    const n = new THREE.Vector3(p.x / (s.x * s.x), p.y / (s.y * s.y), p.z / (s.z * s.z)).normalize()
    out.push({ p, n })
  }
  // Phase 2 — falling free, waving as it goes.
  if (c.fall > 0.02) {
    const start = out[out.length - 1].p.clone()
    const radial = Math.hypot(start.x, start.z)
    const steps = SAMPLES - wrap
    for (let i = 1; i <= steps; i++) {
      const t = i / steps
      const swing = Math.sin(t * 2.6 + c.seed) * c.wave * 0.15
      const rad = radial + c.out * t * t + Math.sin(t * 4.1 + c.seed * 1.7) * c.wave * 0.012
      const a = c.az + swing
      const p = new THREE.Vector3(
        Math.sin(a) * rad,
        start.y - t * c.fall + Math.sin(t * 2.0 + c.seed) * c.wave * 0.007,
        Math.cos(a) * rad,
      )
      // Once it is off the head the card faces outward from the head's axis.
      out.push({ p, n: new THREE.Vector3(p.x, 0, p.z).normalize() })
    }
  }
  return out
}

/**
 * One clump: `layers` cards fanned and twisted against each other, MERGED into
 * a single geometry.
 *
 * Merging matters. A card per mesh meant a hundred and sixty meshes and — since
 * every one declared its own material in JSX — a hundred and sixty materials
 * and shader programs per head. That is not a rendering cost anyone can afford
 * for hair; the head sheet could not even finish a frame.
 */
export function buildClump(s: Skull, c: ClumpSpec, layers: number): Clump {
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const path = clumpPath(s, c)
  const root = path[0].p.clone()
  for (let k = 0; k < layers; k++) {
    const f = layers === 1 ? 0 : k / (layers - 1) - 0.5
    addCard(path, root, c, f * c.width * 0.75, f * 0.55, positions, uvs, indices)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  const tip = path[path.length - 1].p
  return { root, geo, reach: tip.distanceTo(root) }
}

/** `offset` fans a card sideways within its clump; `roll` twists it. */
function addCard(
  path: { p: THREE.Vector3; n: THREE.Vector3 }[],
  root: THREE.Vector3,
  c: ClumpSpec,
  offset: number,
  roll: number,
  positions: number[],
  uvs: number[],
  indices: number[],
): void {
  const base = positions.length / 3
  const tangent = new THREE.Vector3()
  const side = new THREE.Vector3()

  for (let i = 0; i < path.length; i++) {
    const t = i / (path.length - 1)
    const a = path[Math.max(0, i - 1)].p
    const b = path[Math.min(path.length - 1, i + 1)].p
    tangent.copy(b).sub(a).normalize()
    const n = path[i].n.clone().applyAxisAngle(tangent, roll)
    side.crossVectors(tangent, n).normalize()
    const w = c.width * (1 - t * c.taper) * 0.5
    const centre = path[i].p.clone().sub(root).addScaledVector(side, offset)
    // The card bows outward along its length, so it is not a flat plane.
    centre.addScaledVector(n, Math.sin(t * Math.PI) * c.width * 0.16)
    for (const k of [-1, 1]) {
      positions.push(centre.x + side.x * w * k, centre.y + side.y * w * k, centre.z + side.z * w * k)
      // Roots at v = 1: the texture paints them at the top of the canvas, and
      // three flips V.
      uvs.push(k < 0 ? 0 : 1, 1 - t)
    }
  }
  for (let i = 0; i < path.length - 1; i++) {
    const a = base + i * 2
    indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3)
  }
}

/**
 * How far down the skull hair grows at a given azimuth. High at the forehead,
 * lower at the temples, lowest at the nape — the shape of an actual hairline.
 */
export function hairline(az: number): number {
  return 1.3 - 0.38 * Math.cos(az)
}
