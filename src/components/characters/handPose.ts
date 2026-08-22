// How a hand closes.
//
// A hand does not have five poses, it has one per THING. A glass is a cylinder
// the fingers wrap all the way round with the thumb opposing; a mug is two
// fingers hooked through a handle; a fork is a tripod of thumb, index and
// middle with the other two folded away; a phone is held on the fingertips
// behind with the thumb free to move across the face; a book rests on a flat
// palm with the thumb over the edge. Giving all of those the same "grab" is
// exactly what makes hands read as mittens.
//
// Angles are radians of flexion at each joint: MCP is the knuckle, PIP the
// middle joint, DIP the last one. Splay is sideways at the knuckle.

export type GripName =
  | 'relaxed'
  | 'open'
  | 'fist'
  | 'point'
  | 'cylinder'
  | 'wideCylinder'
  | 'hook'
  | 'tripod'
  | 'pinch'
  | 'flatPalm'
  | 'phone'
  | 'book'

export interface DigitPose {
  mcp: number
  pip: number
  dip: number
  splay: number
}

/** Thumb, index, middle, ring, little. */
export type GripPose = [DigitPose, DigitPose, DigitPose, DigitPose, DigitPose]

const d = (mcp: number, pip: number, dip: number, splay = 0): DigitPose => ({ mcp, pip, dip, splay })

/** Same pose for the four fingers, with a thumb of its own. */
const uniform = (thumb: DigitPose, f: DigitPose, taper = 0.06): GripPose => [
  thumb,
  { ...f, mcp: f.mcp - taper, splay: f.splay + 0.1 },
  f,
  { ...f, mcp: f.mcp + taper * 0.5, splay: f.splay - 0.05 },
  { ...f, mcp: f.mcp + taper, splay: f.splay - 0.16 },
]

export const GRIPS: Record<GripName, GripPose> = {
  // Nobody stands with their hands flat: a hand at rest is slightly closed, and
  // the little finger curls more than the index.
  relaxed: uniform(d(0.24, 0.2, 0.12, 0.1), d(0.34, 0.42, 0.26), 0.1),
  open: uniform(d(0.06, 0.05, 0.04, 0.2), d(0.05, 0.06, 0.04), 0.02),
  fist: uniform(d(0.85, 0.75, 0.4, 0.15), d(1.5, 1.6, 0.9), 0.05),
  point: [
    d(0.5, 0.4, 0.2, 0.25),
    d(0.03, 0.04, 0.02, 0.02),
    d(1.5, 1.6, 0.9),
    d(1.55, 1.6, 0.9, -0.05),
    d(1.6, 1.6, 0.9, -0.16),
  ],
  // Round a glass or a bottle: every finger takes the same curve and the thumb
  // comes across to close the ring.
  cylinder: uniform(d(0.7, 0.55, 0.3, 0.55), d(1.02, 1.15, 0.55), 0.06),
  // A pot handle is thicker, so the fingers close less far.
  wideCylinder: uniform(d(0.62, 0.45, 0.25, 0.5), d(0.86, 0.95, 0.45), 0.05),
  // Through a mug's handle: index and middle hooked hard, the other two folded
  // under, the thumb resting on top.
  hook: [
    d(0.45, 0.3, 0.35, 0.3),
    d(1.35, 1.5, 0.75, 0.05),
    d(1.4, 1.5, 0.75),
    d(1.5, 1.55, 0.85, -0.08),
    d(1.55, 1.6, 0.9, -0.18),
  ],
  // Cutlery: thumb, index and middle hold it, ring and little are folded away.
  tripod: [
    d(0.62, 0.5, 0.32, 0.62),
    d(0.62, 0.85, 0.45, 0.08),
    d(0.72, 0.9, 0.45),
    d(1.3, 1.45, 0.8, -0.1),
    d(1.45, 1.5, 0.85, -0.2),
  ],
  // Thumb and index only.
  pinch: [
    d(0.55, 0.62, 0.45, 0.7),
    d(0.7, 0.85, 0.55, 0.02),
    d(1.15, 1.3, 0.7),
    d(1.35, 1.45, 0.8, -0.1),
    d(1.45, 1.5, 0.85, -0.2),
  ],
  // Carrying a plate: the hand is a shelf.
  flatPalm: uniform(d(0.12, 0.1, 0.08, 0.42), d(0.12, 0.1, 0.06), 0.02),
  // A phone sits on the fingers with the thumb up over its face.
  phone: [
    d(0.2, 0.15, 0.3, 0.75),
    d(0.62, 0.72, 0.35, 0.06),
    d(0.68, 0.78, 0.35),
    d(0.72, 0.8, 0.4, -0.06),
    d(0.78, 0.85, 0.45, -0.14),
  ],
  // A book lies on the palm with the thumb hooked over the spine.
  book: [
    d(0.28, 0.45, 0.3, 0.85),
    d(0.2, 0.18, 0.12, 0.08),
    d(0.2, 0.18, 0.12),
    d(0.24, 0.2, 0.14, -0.06),
    d(0.3, 0.24, 0.16, -0.14),
  ],
}

/**
 * Which grip an item asks for.
 *
 * Keyed on the item's own id first, so a mug and a glass differ even though
 * both are "cup" shaped, and falling back to the hold pose for anything that
 * has not been given one.
 */
const BY_ITEM: Record<string, GripName> = {
  glass: 'cylinder',
  bottle: 'cylinder',
  mug: 'hook',
  pot: 'wideCylinder',
  pan: 'wideCylinder',
  kettle: 'hook',
  plate: 'flatPalm',
  bowl: 'flatPalm',
  tray: 'flatPalm',
  fork: 'tripod',
  spoon: 'tripod',
  knife: 'tripod',
  phone: 'phone',
  book: 'book',
  remote: 'phone',
}

export function gripForItem(itemId: string | null | undefined, holdPose: string): GripName {
  if (itemId && BY_ITEM[itemId]) return BY_ITEM[itemId]
  switch (holdPose) {
    case 'grip': return 'fist'
    case 'pinch': return 'pinch'
    case 'cup': return 'cylinder'
    case 'flat': return 'flatPalm'
    case 'twoHand': return 'wideCylinder'
    default: return 'relaxed'
  }
}
