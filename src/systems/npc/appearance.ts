import type { AvatarProfile, HairStyle, Presentation } from '../../config/appearance'

// NPC appearance.
//
// The failure this exists to avoid is a street full of the same person in
// different colours. Recolouring one model is instantly readable as recolouring
// — people notice height, build, face length, jaw, nose and hair silhouette long
// before they notice a shirt's hue.
//
// So every field of an AvatarProfile is drawn from its own distribution, keyed
// to a SEED. The same seed always makes the same person, on every client and on
// every run, which is what lets an NPC be identified by a string rather than by
// shipping their appearance over the wire.

/** A small, fast, deterministic hash. */
function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function rng(seed: string): () => number {
  let a = hash(seed)
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pick = <T,>(r: () => number, xs: readonly T[]): T => xs[Math.floor(r() * xs.length) % xs.length]
const range = (r: () => number, a: number, b: number) => a + r() * (b - a)
/** Bell-ish: two draws averaged, so extremes are rare and most people are ordinary. */
const bell = (r: () => number, a: number, b: number) => a + ((r() + r()) / 2) * (b - a)

// Each tone carries its OWN shade and blush rather than one base darkened by a
// constant, which is what makes procedural skin look tinted.
const SKINS = [
  { base: '#f0d3bd', shade: '#dcb69c', blush: '#d9968c', translucency: 0.62 },
  { base: '#e8c0a2', shade: '#d3a687', blush: '#d98f81', translucency: 0.52 },
  { base: '#d9ab84', shade: '#c2926a', blush: '#c98070', translucency: 0.46 },
  { base: '#cf9f79', shade: '#b98a64', blush: '#bd7a63', translucency: 0.4 },
  { base: '#b07c53', shade: '#96663f', blush: '#a05f47', translucency: 0.34 },
  { base: '#8a5c3b', shade: '#6f472c', blush: '#7d4635', translucency: 0.28 },
  { base: '#5f3d28', shade: '#4a2d1c', blush: '#573124', translucency: 0.22 },
] as const

const HAIR_COLOURS = [
  { base: '#120e0b', tips: '#231a13' },
  { base: '#241812', tips: '#3a2519' },
  { base: '#3d2a1c', tips: '#5a3f28' },
  { base: '#6b4a2c', tips: '#8a6438' },
  { base: '#8d6a35', tips: '#b08c4c' },
  { base: '#b9974f', tips: '#d6b872' },
  { base: '#7a3520', tips: '#9c4a2c' },
  { base: '#6d6a68', tips: '#8f8c89' },
  { base: '#b8b5b1', tips: '#d2cfcb' },
] as const

const EYE_COLOURS = ['#2e2118', '#3b2317', '#4a3520', '#5a4a2c', '#3f5548', '#40566a', '#5c6b6d'] as const

const TOP_COLOURS = [
  '#a52a33', '#55606f', '#2f4858', '#6b7a52', '#8a6f4e', '#3b3b44', '#c9c3b6',
  '#7a4a63', '#26504a', '#b4753a', '#4a5b8c', '#8c2f45',
] as const
const BOTTOM_COLOURS = ['#39404c', '#3f3a45', '#2b2f36', '#4d4438', '#5a5a62', '#233042'] as const
const SHOE_COLOURS = [
  { color: '#3d3d44', sole: '#22222a' },
  { color: '#5a4234', sole: '#2e231c' },
  { color: '#d8d5cf', sole: '#b3b0aa' },
  { color: '#232326', sole: '#141416' },
] as const

const TOPS = ['tshirt', 'shirt', 'sweater', 'hoodie', 'jacket', 'coat', 'tank'] as const
const BOTTOMS = ['jeans', 'pants', 'shorts', 'skirt'] as const
const FABRICS = ['knit', 'jersey', 'denim', 'cotton', 'linen'] as const

/**
 * A whole person from a seed.
 *
 * `hint` biases a few fields without pinning them — an office worker is more
 * likely to be in a shirt, someone out in the cold in a coat — so a crowd can
 * have a character without every member of it being identical.
 */
export function generateAppearance(
  seed: string,
  hint: { presentation?: Presentation; formal?: number; warm?: number } = {},
): AvatarProfile {
  const r = rng(seed)
  const presentation: Presentation =
    hint.presentation ?? (r() < 0.48 ? 'feminine' : r() < 0.96 ? 'masculine' : 'neutral')
  const fem = presentation === 'feminine'
  const formal = hint.formal ?? r()
  const warm = hint.warm ?? 0.5

  const skin = pick(r, SKINS)
  const hairColour = pick(r, HAIR_COLOURS)
  // Height as a real spread, not a coin flip between two sizes.
  const scale = bell(r, fem ? 0.92 : 0.96, fem ? 1.02 : 1.08)
  const heft = bell(r, 0.86, 1.16)

  const style: HairStyle =
    r() < 0.05 ? 'bald'
      : fem ? (r() < 0.68 ? 'long-wavy' : r() < 0.85 ? 'tied-back' : 'short-crop')
        : r() < 0.62 ? 'short-crop' : r() < 0.8 ? 'tied-back' : 'long-wavy'

  const topKind = formal > 0.72 ? (r() < 0.6 ? 'shirt' : 'jacket')
    : warm < 0.35 ? pick(r, ['coat', 'jacket', 'hoodie', 'sweater'] as const)
      : warm > 0.7 ? pick(r, ['tshirt', 'tank', 'shirt'] as const)
        : pick(r, TOPS)
  const bottomKind = warm > 0.7 && r() < 0.4 ? (fem && r() < 0.5 ? 'skirt' : 'shorts')
    : fem && r() < 0.22 ? 'skirt'
      : pick(r, BOTTOMS)

  const topColor = pick(r, TOP_COLOURS)
  const bottomColor = pick(r, BOTTOM_COLOURS)
  const shoes = pick(r, SHOE_COLOURS)

  return {
    id: `npc:${seed}`,
    presentation,
    build: {
      shoulder: (fem ? 0.172 : 0.202) * heft ** 0.6,
      hip: (fem ? 0.114 : 0.104) * heft ** 0.7,
      waist: (fem ? 0.126 : 0.14) * heft,
      scale,
    },
    face: {
      length: bell(r, 0.93, 1.09),
      jawWidth: bell(r, fem ? 0.82 : 0.96, fem ? 1.02 : 1.2),
      jawTaper: bell(r, 0.2, 0.85),
      chinWidth: bell(r, 0.66, 1.02),
      chinProject: bell(r, 0.8, 1.14),
      cheekFullness: bell(r, 0.8, 1.25),
      browRidge: bell(r, fem ? 0.55 : 0.8, fem ? 0.95 : 1.2),
      foreheadRound: bell(r, 0.9, 1.12),
    },
    skin: { ...skin },
    eyes: {
      iris: pick(r, EYE_COLOURS),
      size: range(r, 0.0116, 0.0125),
      spacing: range(r, 0.0305, 0.034),
      tilt: range(r, -0.02, 0.07),
      lidCover: range(r, 0.16, 0.36),
      lashes: fem ? r() < 0.9 : r() < 0.25,
    },
    brows: {
      color: hairColour.base,
      thickness: range(r, fem ? 0.0034 : 0.0044, fem ? 0.0052 : 0.0064),
      arch: range(r, 0.1, 0.55),
      length: range(r, 0.032, 0.04),
      lift: range(r, 0.02, 0.028),
    },
    nose: {
      bridgeWidth: range(r, 0.012, 0.019),
      bridgeDepth: range(r, 0.021, 0.03),
      length: range(r, 0.046, 0.06),
      tipRound: range(r, 0.82, 1.12),
      nostrilWidth: range(r, 0.0115, 0.0158),
    },
    lips: {
      color: pick(r, ['#c07a76', '#a86f62', '#b5736a', '#9d6257', '#c2827c'] as const),
      upper: range(r, 0.0058, 0.0082),
      lower: range(r, 0.0076, 0.0108),
      width: range(r, 0.0225, 0.0285),
    },
    hair: {
      style,
      base: hairColour.base,
      tips: hairColour.tips,
      length:
        style === 'long-wavy' ? range(r, 0.3, 0.55)
          : style === 'tied-back' ? range(r, 0.1, 0.2)
            : range(r, 0.018, 0.045),
      wave: range(r, 0.05, 0.9),
      volume: range(r, 0.82, 1.25),
      fringe: r() < 0.45,
      strands: style === 'bald' ? 0 : Math.round(range(r, 8, 26)),
    },
    facialHair: presentation === 'masculine' ? pick(r, ['none', 'stubble', 'stubble', 'beard'] as const) : 'none',
    glasses:
      r() < 0.26
        ? {
            shape: r() < 0.5 ? 'round' : 'rect',
            frame: pick(r, ['#1c1c20', '#3a2a1e', '#6b6f74', '#2b3a4a'] as const),
            thickness: range(r, 0.0012, 0.0026),
            lensRadius: range(r, 0.021, 0.026),
            lens: '#dfe8ee',
            lensOpacity: 0.1,
          }
        : null,
    top: {
      color: topColor,
      trim: shade(topColor, -14),
      roughness: range(r, 0.78, 0.95),
      fabric: topKind === 'jacket' || topKind === 'coat' ? 'cotton' : pick(r, FABRICS),
      garment: topKind,
    },
    bottom: {
      color: bottomColor,
      trim: shade(bottomColor, -12),
      roughness: range(r, 0.82, 0.95),
      fabric: bottomKind === 'jeans' ? 'denim' : 'cotton',
      garment: bottomKind,
    },
    shoes: { ...shoes },
    accessories: [],
  }
}

function shade(hex: string, delta: number): string {
  const n = parseInt(hex.slice(1), 16)
  const c = (sh: number) => Math.max(0, Math.min(255, ((n >> sh) & 255) + delta))
  const h = (v: number) => v.toString(16).padStart(2, '0')
  return `#${h(c(16))}${h(c(8))}${h(c(0))}`
}

/**
 * How many DISTINCT people the seed space produces, roughly.
 *
 * Not a marketing number — a check. If these fields ever stop being independent
 * (say every tall person also gets the same jaw), a crowd starts to look like
 * one family, and the place to catch that is here.
 */
export function appearanceVariety(): Record<string, number> {
  return {
    skinTones: SKINS.length,
    hairColours: HAIR_COLOURS.length,
    hairStyles: 4,
    eyeColours: EYE_COLOURS.length,
    tops: TOPS.length,
    bottoms: BOTTOMS.length,
    topColours: TOP_COLOURS.length,
    shoes: SHOE_COLOURS.length,
  }
}
