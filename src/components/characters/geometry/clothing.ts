import * as THREE from 'three'
import type { AvatarProfile } from '../../../config/appearance'
import { RIG } from '../looks'
import { buildSweep, limbSlices, torsoSlices, type Slice } from './body'

// Clothing, as real meshes.
//
// Until now a character's clothes were the BODY, coloured differently: the torso
// mesh was the shirt, the thigh mesh was the trouser leg. That cannot show a
// hem, a cuff, a collar, a lapel or a sleeve ending anywhere but at a joint, and
// it means bare arms are impossible.
//
// So garments are their own surfaces — but cut from the BODY'S OWN cross
// sections, pushed outward by the fabric's thickness. That is the property that
// matters: a garment which is the body's silhouette plus a thickness cannot
// clip through it, at any pose, without any collision work. Sleeves and trouser
// legs are split at the same joints the rig is, so they bend where the arm
// bends.

export type TopKind = 'tshirt' | 'tank' | 'shirt' | 'sweater' | 'hoodie' | 'jacket' | 'coat'
export type BottomKind = 'jeans' | 'pants' | 'shorts' | 'skirt'

interface TopSpec {
  /** Fabric thickness in metres — a coat stands further off the body than a tee. */
  thick: number
  /** Where the hem falls, in world Y (the rig's own frame). */
  hemY: number
  /** How far down the upper arm the sleeve reaches, 0..1; >1 continues below the elbow. */
  sleeve: number
  collar: 'crew' | 'shirt' | 'hood' | 'lapel' | 'none'
  /** Open down the front — a jacket or a coat. */
  open: boolean
  /** Extra flare at the hem, as a multiplier on the thickness. */
  flare: number
}

const TOPS: Record<TopKind, TopSpec> = {
  tank: { thick: 0.005, hemY: 0.97, sleeve: 0, collar: 'none', open: false, flare: 1 },
  tshirt: { thick: 0.007, hemY: 0.96, sleeve: 0.45, collar: 'crew', open: false, flare: 1.2 },
  shirt: { thick: 0.007, hemY: 0.94, sleeve: 1.9, collar: 'shirt', open: false, flare: 1.4 },
  sweater: { thick: 0.013, hemY: 0.95, sleeve: 1.95, collar: 'crew', open: false, flare: 1.1 },
  hoodie: { thick: 0.017, hemY: 0.93, sleeve: 1.95, collar: 'hood', open: false, flare: 1.3 },
  jacket: { thick: 0.019, hemY: 0.92, sleeve: 1.95, collar: 'lapel', open: true, flare: 1.5 },
  coat: { thick: 0.023, hemY: 0.66, sleeve: 1.95, collar: 'lapel', open: true, flare: 2.2 },
}

interface BottomSpec {
  thick: number
  /** How far down the thigh the leg reaches, 0..1; >1 continues below the knee. */
  leg: number
  /** Flare at the hem — a trouser leg does not taper to the ankle. */
  flare: number
  skirt: boolean
}

const BOTTOMS: Record<BottomKind, BottomSpec> = {
  jeans: { thick: 0.009, leg: 1.95, flare: 1.5, skirt: false },
  pants: { thick: 0.008, leg: 1.95, flare: 1.7, skirt: false },
  shorts: { thick: 0.009, leg: 0.62, flare: 2.2, skirt: false },
  skirt: { thick: 0.01, leg: 0.55, flare: 6, skirt: true },
}

export interface ClothingBuild {
  /** Mounted on the body group, in rig-world Y. */
  top: THREE.BufferGeometry | null
  collar: THREE.BufferGeometry | null
  hood: THREE.BufferGeometry | null
  /** Mounted on the shoulder groups. */
  sleeveUpper: THREE.BufferGeometry | null
  /** Mounted on the elbow groups; null for a short sleeve. */
  sleeveFore: THREE.BufferGeometry | null
  /** Mounted on the body group. */
  hips: THREE.BufferGeometry | null
  /** Mounted on the hip groups. */
  legThigh: THREE.BufferGeometry | null
  /** Mounted on the knee groups; null for shorts. */
  legCalf: THREE.BufferGeometry | null
  all(): THREE.BufferGeometry[]
}

/** Push a section outward by a constant thickness. */
function grow(s: Slice, t: number, extraW = 0): Slice {
  return { ...s, w: s.w + t + extraW, d: s.d + t + extraW }
}

/**
 * Close the open end of a garment by ROLLING it: two short sections that turn
 * back inward and land on the body's own radius. A hem left as an open tube
 * shows its inside face, which is worse than no hem at all.
 */
function roll(slices: Slice[], thick: number, atEnd: boolean, dir: -1 | 1): Slice[] {
  const edge = atEnd ? slices[slices.length - 1] : slices[0]
  const step = thick * 0.9
  const back: Slice[] = [
    { ...edge, y: edge.y + dir * step * 0.6, w: edge.w - thick * 0.35, d: edge.d - thick * 0.35 },
    { ...edge, y: edge.y + dir * step * 1.5, w: edge.w - thick * 1.05, d: edge.d - thick * 1.05 },
  ]
  return atEnd ? [...slices, ...back] : [...back.reverse(), ...slices]
}

/** Sections between two heights, with the ends interpolated onto them. */
function between(slices: Slice[], from: number, to: number): Slice[] {
  const out: Slice[] = []
  for (let i = 0; i < slices.length; i++) {
    const s = slices[i]
    if (s.y < from || s.y > to) continue
    if (out.length === 0 && i > 0) out.push(lerpSlice(slices[i - 1], s, from))
    out.push(s)
  }
  const last = slices.find((s) => s.y > to)
  if (last && out.length) out.push(lerpSlice(out[out.length - 1], last, to))
  return out
}

function lerpSlice(a: Slice, b: Slice, y: number): Slice {
  const t = b.y === a.y ? 0 : (y - a.y) / (b.y - a.y)
  return {
    y,
    w: a.w + (b.w - a.w) * t,
    d: a.d + (b.d - a.d) * t,
    cx: (a.cx ?? 0) + ((b.cx ?? 0) - (a.cx ?? 0)) * t,
    cz: (a.cz ?? 0) + ((b.cz ?? 0) - (a.cz ?? 0)) * t,
    flat: (a.flat ?? 0) + ((b.flat ?? 0) - (a.flat ?? 0)) * t,
  }
}

/** A limb garment: the limb's own sections, grown, cut at `reach`. */
function limbGarment(
  kind: 'upperArm' | 'foreArm' | 'thigh' | 'calf',
  scale: number,
  thick: number,
  reach: number,
  flare: number,
  radial: number,
  /** Extra radius at the joint end — a sleeve has to cover the deltoid. */
  cap = 0,
): THREE.BufferGeometry | null {
  if (reach <= 0.02) return null
  // limbSlices runs from the far end UP to the joint.
  const src = limbSlices(kind, scale)
  const bottom = src[0].y
  const top = src[src.length - 1].y
  const cut = top + (bottom - top) * Math.min(1, reach)
  const kept = src.filter((s) => s.y >= cut).map((s) => grow(s, thick))
  if (kept.length < 2) return null
  // The cuff flares: cloth does not shrink-wrap an arm where it ends.
  const end = kept[0]
  kept[0] = { ...end, w: end.w + thick * (flare - 1), d: end.d + thick * (flare - 1) }
  if (cap > 0) {
    // Over the shoulder: the sleeve continues up and out across the deltoid and
    // closes there. A separate cap mesh reads as a shoulder pad.
    const shoulder = kept[kept.length - 1]
    kept.push(
      { ...shoulder, y: shoulder.y + 0.016, w: shoulder.w + cap * 0.7, d: shoulder.d + cap * 0.7 },
      { ...shoulder, y: shoulder.y + 0.034, w: shoulder.w + cap, d: shoulder.d + cap },
      { ...shoulder, y: shoulder.y + 0.05, w: shoulder.w + cap * 0.72, d: shoulder.d + cap * 0.72 },
      { ...shoulder, y: shoulder.y + 0.058, w: shoulder.w + cap * 0.3, d: shoulder.d + cap * 0.3 },
    )
  }
  // Rolled at the cuff, closed over the shoulder when it has a cap.
  return buildSweep(roll(kept, thick, false, -1), radial, cap > 0, false)
}

export function buildClothing(profile: AvatarProfile, radial: number): ClothingBuild {
  const topKind = (profile.top.garment ?? 'tshirt') as TopKind
  const bottomKind = (profile.bottom.garment ?? 'jeans') as BottomKind
  const T = TOPS[topKind] ?? TOPS.tshirt
  const B = BOTTOMS[bottomKind] ?? BOTTOMS.jeans
  const arms = profile.build.shoulder / 0.2
  const legs = profile.build.hip / 0.108
  const torso = torsoSlices(profile)

  // ---- Top body ----------------------------------------------------------
  // Up over the trapezius, not stopping at the shoulder line: cut at neckBase
  // the top came out as an off-shoulder garment with bare collarbones.
  const bodyRange = between(torso, T.hemY, RIG.neckBase + 0.022).map((s) => grow(s, T.thick))
  if (bodyRange.length >= 2) {
    const hem = bodyRange[0]
    bodyRange[0] = { ...hem, w: hem.w + T.thick * (T.flare - 1), d: hem.d + T.thick * (T.flare - 1) }
  }
  const top = bodyRange.length >= 2 ? buildSweep(roll(bodyRange, T.thick, false, -1), radial, false, false) : null

  // ---- Sleeves -----------------------------------------------------------
  const sleeveUpper = limbGarment('upperArm', arms, T.thick, T.sleeve, 1.5, radial, 0.02)
  const sleeveFore = T.sleeve > 1 ? limbGarment('foreArm', arms, T.thick, T.sleeve - 1, 1.7, radial) : null

  // ---- Bottom ------------------------------------------------------------
  const hipRange = between(torso, 0.78, Math.min(T.hemY + 0.03, 1.03)).map((s) => grow(s, B.thick))
  const hips = hipRange.length >= 2 ? buildSweep(hipRange, radial, true, false) : null
  let legThigh: THREE.BufferGeometry | null
  let legCalf: THREE.BufferGeometry | null
  if (B.skirt) {
    // A skirt is not a trouser leg: one flared cone from the hips, mounted on
    // the body rather than on either leg.
    const src = between(torso, 0.78, 0.96).map((s) => grow(s, B.thick))
    const flared = src.map((s, i) => {
      const t = 1 - i / Math.max(1, src.length - 1)
      return { ...s, y: s.y - t * 0.22, w: s.w * (1 + t * 0.55), d: s.d * (1 + t * 0.55) }
    })
    legThigh = flared.length >= 2 ? buildSweep(flared, radial, false, false) : null
    legCalf = null
  } else {
    legThigh = limbGarment('thigh', legs, B.thick, B.leg, B.flare, radial)
    legCalf = B.leg > 1 ? limbGarment('calf', legs, B.thick, B.leg - 1, B.flare, radial) : null
  }

  // ---- Collar ------------------------------------------------------------
  let collar: THREE.BufferGeometry | null = null
  if (T.collar !== 'none') {
    const neckTop = T.collar === 'shirt' || T.collar === 'lapel' ? RIG.neckBase + 0.055 : RIG.neckBase + 0.012
    // Sized to the NECK, not to the shoulders: a crew neck sits on the neck.
    const band: Slice[] = [
      { y: RIG.neckBase + 0.01, w: 0.072, d: 0.074, flat: 0.35 },
      { y: RIG.neckBase + 0.032, w: 0.062, d: 0.066, flat: 0.3 },
      { y: neckTop, w: 0.059 + (T.collar === 'lapel' ? 0.014 : 0), d: 0.063, flat: 0.28 },
    ]
    collar = buildSweep(roll(band, 0.006, true, 1), radial, false, false)
  }

  // ---- Hood --------------------------------------------------------------
  let hood: THREE.BufferGeometry | null = null
  if (T.collar === 'hood') {
    // A hood down on the shoulders: a bag of cloth behind the neck, not a
    // cowl standing up round it.
    const band: Slice[] = [
      { y: RIG.neckBase - 0.055, w: 0.1, d: 0.075, cz: -0.05, flat: 0.15 },
      { y: RIG.neckBase + 0.02, w: 0.105, d: 0.085, cz: -0.06, flat: 0.1 },
      { y: RIG.neckBase + 0.075, w: 0.09, d: 0.075, cz: -0.055, flat: 0.1 },
      { y: RIG.neckBase + 0.105, w: 0.06, d: 0.05, cz: -0.045, flat: 0.1 },
    ]
    hood = buildSweep(band, radial, true, true)
  }

  const build: ClothingBuild = {
    top,
    collar,
    hood,
    sleeveUpper,
    sleeveFore,
    hips,
    legThigh,
    legCalf,
    all() {
      return [top, collar, hood, sleeveUpper, sleeveFore, hips, legThigh, legCalf].filter(
        (g): g is THREE.BufferGeometry => !!g,
      )
    },
  }
  return build
}

/** Where a garment's sleeve ends, so bare skin can start exactly there. */
export function sleeveReach(profile: AvatarProfile): number {
  return (TOPS[(profile.top.garment ?? 'tshirt') as TopKind] ?? TOPS.tshirt).sleeve
}

export function legReach(profile: AvatarProfile): number {
  return (BOTTOMS[(profile.bottom.garment ?? 'jeans') as BottomKind] ?? BOTTOMS.jeans).leg
}
