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
    // The socket the eyeball sits in. Without this the eyes sit ON the face.
    { at: [0.4, 0.06, 0.88], radius: 0.4, amount: -0.056, scale: [0.85, 1.25, 1], mirror: true },

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

/**
 * Build the head.
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
): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(1, segments, Math.round(segments * 0.85))
  const pos = geo.attributes.position as THREE.BufferAttribute
  const f = profile.face

  // The base cranium: narrower than it is tall, and deeper than it is wide.
  const base: [number, number, number] = [0.7, 1.02 * f.length, 0.88]

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
  // Recomputed from the displaced surface, so the shading follows the anatomy
  // instead of the sphere it started as.
  geo.computeVertexNormals()
  geo.setAttribute('color', new THREE.BufferAttribute(skinTint(pos, base, radius), 3))
  return geo
}

/**
 * Regional skin variation, as vertex colours multiplied into the base tone.
 *
 * Skin is not one flat value: cheeks and nose run warmer and redder, the
 * forehead and the bridge catch more light, the jaw and under the chin are
 * cooler and darker, and the skin around the eyes is thinner and duller. This
 * is that, without a texture — it costs three floats a vertex and it is the
 * difference between skin and painted plastic.
 */
function skinTint(pos: THREE.BufferAttribute, base: [number, number, number], radius: number): Float32Array {
  const out = new Float32Array(pos.count * 3)
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) / radius
    const y = pos.getY(i) / radius
    const z = pos.getZ(i) / radius
    let r = 1
    let g = 1
    let b = 1
    const front = Math.max(0, z / base[2])

    // Cheeks and nose: warmer, redder, only on the front of the face.
    const cheek = falloff(Math.hypot(Math.abs(x) - 0.42 * base[0], y + 0.26 * base[1]), 0.42) * front
    r += cheek * 0.1
    g -= cheek * 0.035
    b -= cheek * 0.055

    // Forehead and the bridge of the nose: lighter, where skin sits on bone.
    const shine = falloff(Math.hypot(x, y - 0.6 * base[1]), 0.55) * front
    r += shine * 0.045
    g += shine * 0.04
    b += shine * 0.035

    // Around the eyes: thinner skin, duller and a touch cooler.
    const orbit = falloff(Math.hypot(Math.abs(x) - 0.3 * base[0], y - 0.04 * base[1]), 0.3) * front
    r -= orbit * 0.06
    g -= orbit * 0.05
    b -= orbit * 0.02

    // Under the jaw and at the nape: in shadow almost all the time.
    const under = falloff(Math.hypot(x * 0.6, y + 0.85 * base[1]), 0.55)
    r -= under * 0.09
    g -= under * 0.08
    b -= under * 0.07

    out[i * 3] = r
    out[i * 3 + 1] = g
    out[i * 3 + 2] = b
  }
  return out
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
  const geo = buildHeadGeometry(profile, radius * 1.008, segments, 5)
  const pos = geo.attributes.position as THREE.BufferAttribute
  const base: [number, number, number] = [0.7, 1.02 * profile.face.length, 0.88]
  const col = new Float32Array(pos.count * 4)
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) / radius
    const y = pos.getY(i) / radius
    const z = pos.getZ(i) / radius
    // Jaw, chin and upper lip; nothing above the mouth line at the sides.
    const jawline = falloff(Math.hypot(x * 0.75, (y + 0.72 * base[1]) * 1.15), 0.62)
    const moustache = falloff(Math.hypot(x * 1.5, (y + 0.46 * base[1]) * 2.4), 0.3) * Math.max(0, z)
    const a = Math.min(1, (jawline + moustache) * (full ? 1.25 : 0.55))
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
export function headSurface(
  profile: AvatarProfile,
  radius: number,
  dir: THREE.Vector3,
): THREE.Vector3 {
  const f = profile.face
  const base: [number, number, number] = [0.7, 1.02 * f.length, 0.88]
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
