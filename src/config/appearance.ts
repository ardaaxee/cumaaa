// What a person looks like, as data.
//
// Nothing here is specific to ZEYNEP or CUMA: they are two presets of the same
// structure, and a player-made character is a third. Every field drives real
// geometry — a narrower jaw moves vertices, a different nose is a different
// shape — rather than only tinting a shared mesh. Telling two characters apart
// by colour alone is exactly what this exists to avoid.

export type Presentation = 'feminine' | 'masculine' | 'neutral'

/** Proportions of the skull and face, in head-radius-relative units. */
export interface FaceShape {
  /** 1 = average. Above 1 lengthens the face. */
  length: number
  /** Width of the jaw at the angle. */
  jawWidth: number
  /** How square (0) or tapered (1) the jaw runs to the chin. */
  jawTaper: number
  chinWidth: number
  chinProject: number
  cheekFullness: number
  /** How far the brow ridge stands proud. */
  browRidge: number
  foreheadRound: number
}

export interface EyeSpec {
  iris: string
  /** Radius of the eyeball in metres. */
  size: number
  /** Half-distance between the eyes. */
  spacing: number
  /** Outer-corner lift, radians. */
  tilt: number
  /** How much of the iris the upper lid covers at rest, 0..1. */
  lidCover: number
  lashes: boolean
}

export interface BrowSpec {
  color: string
  thickness: number
  arch: number
  length: number
  /** Height above the eye. */
  lift: number
}

export interface NoseSpec {
  bridgeWidth: number
  bridgeDepth: number
  length: number
  tipRound: number
  nostrilWidth: number
}

export interface LipSpec {
  color: string
  upper: number
  lower: number
  width: number
}

export interface SkinTone {
  base: string
  /** Slightly darker, for forms that turn away — neck, under the jaw. */
  shade: string
  /** Warmth in the cheeks and the nose tip. */
  blush: string
  /** How much light appears to bleed through thin parts (ears, nostrils). */
  translucency: number
}

export type HairStyle =
  | 'long-wavy' // past the shoulders, parted, framing the face
  | 'short-crop'
  | 'tied-back'
  | 'bald'

export interface HairSpec {
  style: HairStyle
  base: string
  /** Tips, a touch lighter than the roots — hair is never one flat colour. */
  tips: string
  /** Length of the back mass in metres, below the crown. */
  length: number
  /** 0 straight → 1 strongly waved. */
  wave: number
  volume: number
  /** Fringe across the forehead. */
  fringe: boolean
  /** A hair-strand pass on top of the mass, on the tiers that can afford it. */
  strands: number
}

export interface GlassesSpec {
  /** Round wire frames, rectangular acetate, and so on. */
  shape: 'round' | 'rect'
  frame: string
  /** Metal wire (thin) or acetate (thick). */
  thickness: number
  lensRadius: number
  /** Tint of the lens itself; near-clear for prescription glasses. */
  lens: string
  lensOpacity: number
}

export interface ClothingSpec {
  color: string
  /** Collar, cuffs and hems, a shade off the body of the garment. */
  trim: string
  roughness: number
  /** Knit, jersey, denim… drives the normal detail and how folds read. */
  fabric: 'knit' | 'jersey' | 'denim' | 'cotton'
}

export interface AvatarProfile {
  id: string
  presentation: Presentation
  /** Shoulder half-width, hip half-width, overall height scale. */
  build: { shoulder: number; hip: number; scale: number; waist: number }
  face: FaceShape
  skin: SkinTone
  eyes: EyeSpec
  brows: BrowSpec
  nose: NoseSpec
  lips: LipSpec
  hair: HairSpec
  facialHair: 'none' | 'stubble' | 'beard'
  glasses: GlassesSpec | null
  top: ClothingSpec
  bottom: ClothingSpec
  shoes: { color: string; sole: string }
  accessories: string[]
}

// ---- Presets ---------------------------------------------------------------
// ZEYNEP's preset follows a reference the project owner supplied: long dark
// wavy hair that frames the face, thin round wire glasses, dark eyes, soft
// features, a red top. These are ordinary descriptive parameters, not a
// likeness — the reference is not shipped, sampled or drawn anywhere.

export const ZEYNEP_PROFILE: AvatarProfile = {
  id: 'zeynep',
  presentation: 'feminine',
  build: { shoulder: 0.176, hip: 0.115, scale: 0.965, waist: 0.128 },
  face: {
    length: 0.97,
    jawWidth: 0.9,
    jawTaper: 0.72,
    chinWidth: 0.72,
    chinProject: 0.9,
    cheekFullness: 1.12,
    browRidge: 0.7,
    foreheadRound: 1.05,
  },
  skin: { base: '#e8c0a2', shade: '#d3a687', blush: '#d98f81', translucency: 0.5 },
  eyes: { iris: '#3b2317', size: 0.0119, spacing: 0.0315, tilt: 0.045, lidCover: 0.24, lashes: true },
  brows: { color: '#2a1c14', thickness: 0.0058, arch: 0.42, length: 0.036, lift: 0.036 },
  nose: { bridgeWidth: 0.014, bridgeDepth: 0.024, length: 0.05, tipRound: 1.0, nostrilWidth: 0.0125 },
  lips: { color: '#c07a76', upper: 0.0072, lower: 0.0098, width: 0.024 },
  hair: {
    style: 'long-wavy',
    base: '#241812',
    tips: '#3a2519',
    length: 0.46,
    wave: 0.75,
    volume: 1.15,
    fringe: true,
    strands: 26,
  },
  facialHair: 'none',
  glasses: {
    shape: 'round',
    frame: '#1c1c20',
    thickness: 0.0014,
    lensRadius: 0.0235,
    lens: '#dfe8ee',
    lensOpacity: 0.1,
  },
  top: { color: '#a52a33', trim: '#8d2029', roughness: 0.9, fabric: 'knit' },
  bottom: { color: '#3f3a45', trim: '#332f38', roughness: 0.88, fabric: 'denim' },
  shoes: { color: '#4a434c', sole: '#26222a' },
  accessories: ['glasses'],
}

export const CUMA_PROFILE: AvatarProfile = {
  id: 'cuma',
  presentation: 'masculine',
  build: { shoulder: 0.208, hip: 0.104, scale: 1, waist: 0.142 },
  face: {
    length: 1.04,
    jawWidth: 1.1,
    jawTaper: 0.35,
    chinWidth: 0.95,
    chinProject: 1.06,
    cheekFullness: 0.9,
    browRidge: 1.0,
    foreheadRound: 0.94,
  },
  skin: { base: '#cf9f79', shade: '#b98a64', blush: '#bd7a63', translucency: 0.4 },
  eyes: { iris: '#2e2118', size: 0.0121, spacing: 0.0325, tilt: 0.015, lidCover: 0.3, lashes: false },
  brows: { color: '#1e1712', thickness: 0.0072, arch: 0.2, length: 0.039, lift: 0.034 },
  nose: { bridgeWidth: 0.017, bridgeDepth: 0.028, length: 0.056, tipRound: 0.9, nostrilWidth: 0.0145 },
  lips: { color: '#a86f62', upper: 0.0068, lower: 0.0086, width: 0.0265 },
  hair: {
    style: 'short-crop',
    base: '#1d1712',
    tips: '#2a2019',
    length: 0.03,
    wave: 0.2,
    volume: 0.9,
    fringe: false,
    strands: 0,
  },
  facialHair: 'stubble',
  glasses: null,
  top: { color: '#55606f', trim: '#46505e', roughness: 0.86, fabric: 'cotton' },
  bottom: { color: '#39404c', trim: '#2f3540', roughness: 0.87, fabric: 'denim' },
  shoes: { color: '#3d3d44', sole: '#22222a' },
  accessories: [],
}

const PRESETS: Record<string, AvatarProfile> = {
  zeynep: ZEYNEP_PROFILE,
  cuma: CUMA_PROFILE,
}

/**
 * Which preset a display name maps to. This is the seam a character creator
 * replaces later: it hands back a profile, and nothing downstream cares whether
 * that profile came from a preset or from a player's saved choices.
 */
export function profileFor(name: string): AvatarProfile {
  return name.trim().toUpperCase().startsWith('Z') ? ZEYNEP_PROFILE : CUMA_PROFILE
}

export function profileById(id: string): AvatarProfile | undefined {
  return PRESETS[id]
}

export const PRESET_IDS = Object.keys(PRESETS)
