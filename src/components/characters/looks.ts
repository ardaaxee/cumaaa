// ---- Skeleton proportions (metres, sole of the shoe at y = 0) -------------
// Roughly 7.5 heads tall, with the eyes landing at the same 1.62 m the
// first-person camera uses — so a remote player's eyeline matches yours.
//
// What a character LOOKS like moved to src/config/appearance.ts, where it is
// data a player could edit. This file is the skeleton those looks hang on, and
// it is deliberately the same for everyone: an AvatarProfile scales it rather
// than replacing it, so one animation drives every body.
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
