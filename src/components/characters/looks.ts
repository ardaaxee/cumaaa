// How a character is dressed and built. Derived from the player's display name
// so CUMA and ZEYNEP are instantly distinguishable, without either being a
// caricature: the differences are ordinary ones — build, hair length, and what
// they happen to be wearing.

export interface CharacterLook {
  id: 'cuma' | 'zeynep'
  skin: string
  skinShade: string // slightly darker, for shadowed forms (hands, neck)
  top: string
  topTrim: string // collar / cuffs, a shade off the top
  legs: string
  shoe: string
  soleColor: string
  hair: string
  /** Shoulder half-width in metres — the main silhouette difference. */
  shoulder: number
  hip: number
  /** Overall height scale applied to the rig (1 = 1.78 m). */
  scale: number
  hairStyle: 'short' | 'tied-back'
}

const CUMA: CharacterLook = {
  id: 'cuma',
  skin: '#c99b74',
  skinShade: '#b98a64',
  top: '#5a6474',
  topTrim: '#4b5462',
  legs: '#39404c',
  shoe: '#3d3d44',
  soleColor: '#22222a',
  hair: '#221b16',
  shoulder: 0.205,
  hip: 0.105,
  scale: 1,
  hairStyle: 'short',
}

const ZEYNEP: CharacterLook = {
  id: 'zeynep',
  skin: '#dcb18e',
  skinShade: '#c99c78',
  top: '#9c6a7e',
  topTrim: '#8a5c6e',
  legs: '#474250',
  shoe: '#5d545f',
  soleColor: '#2c2830',
  hair: '#2b1d18',
  shoulder: 0.178,
  hip: 0.112,
  scale: 0.965,
  hairStyle: 'tied-back',
}

export function lookFor(name: string): CharacterLook {
  return name.trim().toUpperCase().startsWith('Z') ? ZEYNEP : CUMA
}

// ---- Skeleton proportions (metres, sole of the shoe at y = 0) -------------
// Roughly 7.5 heads tall, with the eyes landing at the same 1.62 m the
// first-person camera uses — so a remote player's eyeline matches yours.
export const RIG = {
  eye: 1.62,
  headCenter: 1.655,
  headRadius: 0.113,
  neckTop: 1.52,
  neckBase: 1.43,
  shoulderY: 1.4,
  chestTop: 1.44,
  chestBottom: 1.06,
  waistY: 1.02,
  hipY: 0.9,
  upperArm: 0.28,
  forearm: 0.26,
  thigh: 0.44,
  shin: 0.37,
  ankleY: 0.09,
} as const
