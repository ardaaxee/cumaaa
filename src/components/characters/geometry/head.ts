import * as THREE from 'three'
import type { AvatarProfile } from '../../../config/appearance'

// ONE continuous head, not a pile of spheres.
//
// The previous head was a skull sphere with a forehead sphere, two brow spheres,
// two cheek spheres, a jaw sphere and a chin sphere overlapping it. However
// carefully those are placed they never become a surface: each one keeps its own
// silhouette and its own normals, so the shading breaks at every intersection
// and the face reads as balls stuck together. No amount of tuning fixes that —
// it is the wrong construction.
//
// Instead: take a subdivided ellipsoid and push its vertices in and out with
// smooth falloff fields centred on the anatomical landmarks. A brow ridge is a
// bulge in the surface, an eye socket is a hollow in the same surface, and the
// two blend into each other because they are the same surface. Normals are
// recomputed at the end, so the shading is continuous everywhere.

/**
 * Height of the base cranium, as a multiple of the head radius.
 *
 * At 1.02 the head measured 24 cm menton to vertex and every face read as an
 * egg however good its features were; 0.96 puts it at 22.5 cm, which is an
 * adult head. Everything that samples the surface reads this, so the value can
 * only be changed in one place.
 */
const BASE_Y = 0.96

/** A smooth bump: 1 at the centre, 0 beyond `radius`, no hard edge. */
function falloff(d: number, radius: number): number {
  if (d >= radius) return 0
  const t = 1 - d / radius
  return t * t * (3 - 2 * t) // smoothstep, so the edges are C1-continuous
}

interface Field {
  /** Centre, in the normalised head frame (x right, y up, z forward). */
  at: [number, number, number]
  radius: number
  /** Positive pushes the surface out, negative hollows it. */
  amount: number
  /** Optional squash of the field, to make ridges rather than blobs. */
  scale?: [number, number, number]
  /** Mirror the field to both sides. */
  mirror?: boolean
}

// The landmarks that make a face a face. Values are in head-radius units, so
// they scale with the character rather than being pixel-tuned.
function fieldsFor(p: AvatarProfile): Field[] {
  const f = p.face
  return [
    // --- upper skull ------------------------------------------------------
    // Frontal eminences: the two soft bulges on a forehead.
    { at: [0.34, 0.62, 0.62], radius: 0.62, amount: 0.034 * f.foreheadRound, mirror: true },
    // Temple hollow, above and behind the outer brow. Its absence is why heads
    // built from spheres look inflated.
    { at: [0.86, 0.42, 0.34], radius: 0.6, amount: -0.044, scale: [1, 1.3, 1], mirror: true },
    // Brow ridge — a RIDGE, so the field is stretched along x and thin in y.
    { at: [0.4, 0.3, 0.86], radius: 0.52, amount: 0.062 * f.browRidge, scale: [0.7, 2.1, 0.9], mirror: true },
    // Glabella, between the brows.
    { at: [0, 0.28, 0.96], radius: 0.3, amount: 0.02, mirror: false },

    // --- eyes -------------------------------------------------------------
    // The socket the eyeball sits in. It has to be a real cavity: too shallow
    // and the eyeball plus its lids stand proud of the face and read as
    // goggles, however well the lids themselves are shaped.
    { at: [0.4, 0.06, 0.88], radius: 0.44, amount: -0.082, scale: [0.8, 1.15, 1], mirror: true },
    // The orbital rim: bone standing round that cavity, below and outside it.
    { at: [0.62, -0.12, 0.78], radius: 0.3, amount: 0.024, mirror: true },

    // --- mid face ---------------------------------------------------------
    // Cheekbone: high, wide, and swept back toward the ear.
    { at: [0.72, -0.02, 0.6], radius: 0.62, amount: 0.05, scale: [0.9, 1.5, 0.9], mirror: true },
    // The hollow under it. This is most of what reads as bone structure.
    { at: [0.6, -0.36, 0.66], radius: 0.5, amount: -0.038 * (2 - f.cheekFullness), mirror: true },
    // Soft cheek mass, lower and more forward on a fuller face.
    { at: [0.5, -0.3, 0.78], radius: 0.55, amount: 0.03 * f.cheekFullness, mirror: true },
    // The maxilla around the mouth, which stops the lips floating on a flat plate.
    { at: [0.2, -0.5, 0.88], radius: 0.44, amount: 0.036, mirror: true },

    // --- jaw and chin -----------------------------------------------------
    // Gonial angle: the corner of the jaw, below and in front of the ear.
    { at: [0.78, -0.62, 0.18], radius: 0.55, amount: 0.055 * f.jawWidth, mirror: true },
    // The jawline running forward from it, narrowing toward the chin.
    { at: [0.52, -0.78, 0.6], radius: 0.5, amount: 0.042 * (1 - f.jawTaper * 0.5), mirror: true },
    // Chin.
    { at: [0, -0.92, 0.68], radius: 0.42, amount: 0.05 * f.chinProject, scale: [1 / Math.max(f.chinWidth, 0.4), 1, 1] },
    // The crease above the chin.
    { at: [0, -0.74, 0.86], radius: 0.26, amount: -0.02 },

    // --- mouth ------------------------------------------------------------
    // The lips are part of THIS surface. They used to be two tubes floating in
    // front of the face, and no amount of repositioning fixes that: a lip is a
    // roll of the same skin as the chin above and below it, and the vermilion
    // is a colour boundary, not a separate object. So: two ridges with a crease
    // between them, a philtrum above, and a dimple at each corner.
    { at: [0, -0.435, 1.0], radius: 0.34, amount: 0.044, scale: [0.72, 2.6, 1], mirror: false },
    { at: [0, -0.505, 1.0], radius: 0.22, amount: -0.04, scale: [0.7, 3.4, 1], mirror: false },
    { at: [0, -0.585, 0.99], radius: 0.34, amount: 0.05, scale: [0.72, 2.3, 1], mirror: false },
    // Philtrum: the shallow groove from the nose to the lip.
    { at: [0, -0.365, 1.0], radius: 0.13, amount: -0.012, scale: [2.8, 1, 1] },
    // The corner of the mouth tucks in, at the profile's own mouth width.
    { at: [p.lips.width / (0.113 * 0.7), -0.5, 0.86], radius: 0.16, amount: -0.02, mirror: true },
    // Mentolabial sulcus, the crease under the lower lip.
    { at: [0, -0.685, 0.93], radius: 0.22, amount: -0.02, scale: [1, 2.2, 1] },

    // Nasolabial fold: the crease from the nose wing to the mouth corner.
    { at: [0.28, -0.42, 0.86], radius: 0.3, amount: -0.026, scale: [1.6, 0.8, 1], mirror: true },
    // The hollow at the outer eye corner, under the brow tail.
    { at: [0.62, 0.16, 0.72], radius: 0.34, amount: -0.02, mirror: true },

    // --- back and base ----------------------------------------------------
    // Occiput: the back of a skull is not a hemisphere, it bulges low.
    { at: [0, -0.15, -0.95], radius: 0.75, amount: 0.042 },
    // Behind the ear, where the skull tucks in toward the neck.
    { at: [0.7, -0.7, -0.5], radius: 0.55, amount: -0.045, mirror: true },
  ]
}

// ---- Expressions, as morph targets -----------------------------------------
//
// With the lips part of the surface, an expression can no longer be "move the
// little sphere that stands for a mouth corner". It has to move the SURFACE,
// which is what blend shapes are for: each one is a full copy of the head's
// vertices in a deformed pose, and the renderer mixes between them.
//
// Each shape here is expressed as a handful of pulls — a centre, a radius and a
// direction — applied to the finished head, so they are written in the same
// anatomical language as the head itself.

export const MORPHS = [
  'jawOpen',
  'smile',
  'frown',
  'pucker',
  'sneer',
  'browRaise',
  'squint',
  'cheekPuff',
] as const
export type MorphName = (typeof MORPHS)[number]

interface Pull {
  at: [number, number, number]
  radius: number
  move: [number, number, number]
  mirror?: boolean
  /** Mirrored copies move the opposite way along x (a smile pulls outward). */
  mirrorX?: boolean
}

/** Pulls are in METRES, in the head's own frame. */
function pullsFor(name: MorphName, mouthY: number, lipHalfWidth: number): Pull[] {
  const cx = lipHalfWidth
  switch (name) {
    case 'smile':
      return [
        { at: [cx, mouthY, 0.078], radius: 0.03, move: [0.005, 0.008, -0.003], mirror: true, mirrorX: true },
        { at: [0.046, mouthY + 0.036, 0.072], radius: 0.038, move: [0.002, 0.006, 0.002], mirror: true, mirrorX: true },
        { at: [0, mouthY - 0.006, 0.09], radius: 0.026, move: [0, 0.001, -0.0025] },
      ]
    case 'frown':
      return [
        { at: [cx, mouthY, 0.078], radius: 0.03, move: [0.001, -0.007, -0.002], mirror: true, mirrorX: true },
        { at: [0, mouthY - 0.022, 0.086], radius: 0.03, move: [0, -0.003, 0.001] },
      ]
    case 'pucker':
      return [
        { at: [cx, mouthY, 0.078], radius: 0.032, move: [-0.006, 0, 0.003], mirror: true, mirrorX: true },
        { at: [0, mouthY - 0.008, 0.09], radius: 0.03, move: [0, 0, 0.006] },
      ]
    case 'sneer':
      return [
        { at: [0.014, mouthY + 0.016, 0.088], radius: 0.024, move: [0, 0.005, 0.001], mirror: true },
        { at: [0.021, mouthY + 0.03, 0.084], radius: 0.022, move: [0, 0.004, 0], mirror: true },
      ]
    case 'browRaise':
      return [
        { at: [0.032, 0.03, 0.086], radius: 0.05, move: [0, 0.008, 0.001], mirror: true },
        { at: [0, 0.055, 0.09], radius: 0.05, move: [0, 0.004, 0] },
      ]
    case 'squint':
      return [
        { at: [0.032, -0.008, 0.082], radius: 0.03, move: [0, 0.005, 0.001], mirror: true },
        { at: [0.05, 0.006, 0.072], radius: 0.028, move: [-0.002, 0.002, 0], mirror: true },
      ]
    case 'cheekPuff':
      return [{ at: [0.05, mouthY + 0.012, 0.062], radius: 0.045, move: [0.007, 0, 0.005], mirror: true, mirrorX: true }]
    default:
      return []
  }
}

/**
 * Build the head, with its expression shapes.
 *
 * `seed` drives a small low-frequency asymmetry: real faces are not mirrored,
 * and a perfectly symmetric one is quietly wrong in a way people notice without
 * being able to say why.
 */
export function buildHeadGeometry(
  profile: AvatarProfile,
  radius: number,
  segments: number,
  seed = 1,
  withMorphs = true,
): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(1, segments, Math.round(segments * 0.85))
  const pos = geo.attributes.position as THREE.BufferAttribute
  const f = profile.face

  // The base cranium: narrower than it is tall, and deeper than it is wide.
  // Menton to vertex lands at ~22.5 cm, which is an adult head. At 1.02 it was
  // 24 cm and every face read as an egg however good its features were.
  const base: [number, number, number] = [0.7, BASE_Y * f.length, 0.88]

  const fields = fieldsFor(profile)
  const expanded: Field[] = []
  for (const fl of fields) {
    expanded.push(fl)
    if (fl.mirror) expanded.push({ ...fl, at: [-fl.at[0], fl.at[1], fl.at[2]] })
  }

  const v = new THREE.Vector3()
  const d = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    // Where this vertex sits on the base ellipsoid.
    const px = v.x * base[0]
    const py = v.y * base[1]
    const pz = v.z * base[2]

    let disp = 0
    for (const fl of expanded) {
      const s = fl.scale ?? [1, 1, 1]
      d.set((px - fl.at[0] * base[0]) * s[0], (py - fl.at[1] * base[1]) * s[1], (pz - fl.at[2] * base[2]) * s[2])
      disp += fl.amount * falloff(d.length(), fl.radius)
    }

    // Asymmetry: two slow waves, one per axis, at a fraction of a millimetre —
    // enough to break the mirror without reading as a deformity.
    const asym =
      Math.sin(px * 7.3 + seed * 2.1) * 0.0022 + Math.sin(py * 5.1 + seed * 3.7) * 0.0018

    const scale = 1 + disp + asym
    pos.setXYZ(i, px * radius * scale, py * radius * scale, pz * radius * scale)
  }

  pos.needsUpdate = true

  if (withMorphs) buildMorphs(geo, pos, profile, radius)

  // Recomputed from the displaced surface, so the shading follows the anatomy
  // instead of the sphere it started as.
  geo.computeVertexNormals()
  // The sphere's own UVs survive the displacement, and systems/materials/skin.ts
  // paints in exactly that space — so regional tone, pores and roughness now
  // come from a texture at the tier's resolution instead of from vertex
  // colours, which could never vary faster than the mesh itself.
  return geo
}

function buildMorphs(
  geo: THREE.BufferGeometry,
  pos: THREE.BufferAttribute,
  profile: AvatarProfile,
  radius: number,
): void {
  const mouthY = -0.505 * BASE_Y * profile.face.length * radius
  const lipHalf = profile.lips.width * 0.94
  const targets: THREE.BufferAttribute[] = []

  for (const name of MORPHS) {
    const out = new Float32Array(pos.count * 3)
    if (name === 'jawOpen') {
      // The jaw is a hinge, not a pull: everything below the mouth swings about
      // the condyle, just in front of and below the ear.
      const pivotY = mouthY + 0.075
      const pivotZ = -0.03
      const angle = 0.3
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i)
        const y = pos.getY(i)
        const z = pos.getZ(i)
        // Weight: nothing above the mouth line, everything by the chin, and
        // only on the front and underside of the head.
        const below = smooth01((mouthY + 0.004 - y) / 0.05)
        const front = smooth01((z + 0.05) / 0.09)
        const w = below * front
        if (w <= 0) {
          out[i * 3] = x; out[i * 3 + 1] = y; out[i * 3 + 2] = z
          continue
        }
        const a = angle * w
        const dy = y - pivotY
        const dz = z - pivotZ
        out[i * 3] = x
        out[i * 3 + 1] = pivotY + dy * Math.cos(a) - dz * Math.sin(a)
        out[i * 3 + 2] = pivotZ + dy * Math.sin(a) + dz * Math.cos(a)
      }
    } else {
      const pulls: Pull[] = []
      for (const p of pullsFor(name, mouthY, lipHalf)) {
        pulls.push(p)
        if (p.mirror)
          pulls.push({
            ...p,
            at: [-p.at[0], p.at[1], p.at[2]],
            move: [p.mirrorX ? -p.move[0] : p.move[0], p.move[1], p.move[2]],
          })
      }
      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i)
        let y = pos.getY(i)
        let z = pos.getZ(i)
        for (const p of pulls) {
          const d = Math.hypot(x - p.at[0], y - p.at[1], z - p.at[2])
          const w = falloff(d, p.radius)
          if (w <= 0) continue
          x += p.move[0] * w
          y += p.move[1] * w
          z += p.move[2] * w
        }
        out[i * 3] = x; out[i * 3 + 1] = y; out[i * 3 + 2] = z
      }
    }
    targets.push(new THREE.BufferAttribute(out, 3))
  }
  geo.morphAttributes.position = targets
}

function smooth01(t: number): number {
  const c = Math.max(0, Math.min(1, t))
  return c * c * (3 - 2 * c)
}

/**
 * A shell for facial hair: the same head surface, a hair's breadth larger, with
 * per-vertex ALPHA so it only exists where a beard grows.
 *
 * The previous stubble was a sphere overlapping the head, which intersected the
 * displaced surface and left blotches wherever the two crossed. A shell of the
 * same shape cannot intersect it.
 */
export function buildBeardGeometry(
  profile: AvatarProfile,
  radius: number,
  segments: number,
  full: boolean,
): THREE.BufferGeometry {
  // Morphs on the shell too, so a beard follows the jaw and the smile instead
  // of hanging in the air where the face used to be.
  const geo = buildHeadGeometry(profile, radius * 1.008, segments, 5, true)
  const pos = geo.attributes.position as THREE.BufferAttribute
  const base: [number, number, number] = [0.7, BASE_Y * profile.face.length, 0.88]
  const col = new Float32Array(pos.count * 4)
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) / radius
    const y = pos.getY(i) / radius
    const z = pos.getZ(i) / radius
    // Jaw, chin and upper lip; nothing above the mouth line at the sides.
    const jawline = falloff(Math.hypot(x * 0.75, (y + 0.72 * base[1]) * 1.15), 0.62)
    // A moustache grows ABOVE the lip, not on it.
    const moustache = falloff(Math.hypot(x * 1.5, (y + 0.4 * base[1]) * 2.6), 0.26) * Math.max(0, z)
    // Hair does not grow on the vermilion. Without this cut-out the shell laid
    // a near-black veil straight over the mouth, which is why the lips read as
    // a dark scribble however well they were modelled and painted.
    const lipCut = 1 - falloff(Math.hypot(x * 0.85, (y + 0.53 * base[1]) * 2.4), 0.36) * Math.max(0, z * 1.1)
    const a = Math.min(1, (jawline + moustache) * Math.max(0, lipCut) * (full ? 1.25 : 0.55))
    col[i * 4] = 1
    col[i * 4 + 1] = 1
    col[i * 4 + 2] = 1
    col[i * 4 + 3] = a * a
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 4))
  return geo
}

/**
 * Where the surface of that head is, along a direction. Used to seat the
 * features (eyes, nose, ears) ON the skull rather than at guessed coordinates
 * that drift whenever the head shape changes.
 */
/**
 * Where the face's surface is, at a given HEIGHT on the centre line.
 *
 * Features get placed relative to this rather than at typed-in z values. That
 * was the bug behind lips standing a centimetre off the face and eyebrows
 * buried inside the skull: every one of those numbers was guessed once against
 * an older head shape and never moved again.
 */
export function surfaceZAtHeight(profile: AvatarProfile, radius: number, y: number, x = 0): number {
  // Solve for the RAY whose surface point lands at (x, y) — both coordinates,
  // not just the height. Solving for y alone returned the surface much nearer
  // the centre line than the eye actually sits, which is why the eyeballs
  // ended up a centimetre proud of the face.
  const dir = new THREE.Vector3(x, y, radius)
  for (let i = 0; i < 14; i++) {
    const p = headSurface(profile, radius, dir)
    const ey = p.y - y
    const ex = p.x - x
    if (Math.abs(ey) < 0.0002 && Math.abs(ex) < 0.0002) break
    dir.y -= ey * 1.5
    dir.x -= ex * 1.5
  }
  return headSurface(profile, radius, dir).z
}

export function headSurface(
  profile: AvatarProfile,
  radius: number,
  dir: THREE.Vector3,
): THREE.Vector3 {
  const f = profile.face
  const base: [number, number, number] = [0.7, BASE_Y * f.length, 0.88]
  const n = dir.clone().normalize()
  const px = n.x * base[0]
  const py = n.y * base[1]
  const pz = n.z * base[2]
  const fields = fieldsFor(profile)
  const d = new THREE.Vector3()
  let disp = 0
  for (const fl of fields) {
    for (const sx of fl.mirror ? [1, -1] : [1]) {
      const s = fl.scale ?? [1, 1, 1]
      d.set(
        (px - sx * fl.at[0] * base[0]) * s[0],
        (py - fl.at[1] * base[1]) * s[1],
        (pz - fl.at[2] * base[2]) * s[2],
      )
      disp += fl.amount * falloff(d.length(), fl.radius)
    }
  }
  const scale = (1 + disp) * radius
  return new THREE.Vector3(px * scale, py * scale, pz * scale)
}
