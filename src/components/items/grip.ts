import type { HoldPose } from '../../config/items'
import type { AvatarAction } from '../characters/actions'

// Where a carried item sits relative to the WRIST, and how it is turned there.
//
// The wrist group hangs off the end of the forearm, so its local -Y runs on down
// the hand. An item is authored standing upright with its base at the origin, so
// every grip has to turn it out of the hand's frame and back to a sensible
// attitude — a mug stays level, a pan hangs off a fist, a book lies flat on the
// palm. This is the "grip offset / rotation offset" step: one transform per way
// of holding something, not one per object.
export interface Grip {
  pos: [number, number, number]
  rot: [number, number, number]
  /** Carried in both hands, in front of the chest. */
  twoHanded?: boolean
}

// The arm poses that carry things (hold/carry/cook) bend the elbow forward, so
// the wrist's -Y points roughly along the character's forward axis. Rotating the
// item by -PI/2 about X therefore stands it back up.
const UPRIGHT_X = -Math.PI / 2

export const GRIPS: Record<HoldPose, Grip> = {
  // A fist round a handle: the object hangs below and slightly ahead.
  grip: { pos: [0, -0.075, 0.03], rot: [UPRIGHT_X + 0.25, 0, 0] },
  // Finger and thumb: small things sit at the fingertips, tilted.
  pinch: { pos: [0.006, -0.08, 0.026], rot: [UPRIGHT_X + 0.5, 0, 0.25] },
  // Curled round a vessel — must stay level or it pours down your front.
  cup: { pos: [0, -0.072, 0.045], rot: [UPRIGHT_X, 0, 0] },
  // Flat on the palm.
  flat: { pos: [0, -0.062, 0.05], rot: [UPRIGHT_X, 0, 0] },
  // Both hands: drawn from the RIGHT wrist but pushed to the body's centre
  // line, with the left arm posed to meet it.
  twoHand: { pos: [-0.16, -0.09, 0.1], rot: [UPRIGHT_X, 0, 0], twoHanded: true },
}

/**
 * How the fingers close around a held item.
 *
 * Keyed on the item's OWN id, not only on how it is carried: a glass is a
 * cylinder the fingers wrap, a mug is two fingers hooked through a handle, a
 * fork is a tripod, a phone sits on the fingertips with the thumb free. Giving
 * all of them one "grab" is exactly what makes hands read as mittens.
 */
export { gripForItem } from '../characters/handPose'

/**
 * The action a character should be playing while holding this. Carrying a pot
 * two-handed is a different posture from carrying a fork, and the animation
 * state machine already knows how to hold a pose.
 */
export function carryAction(pose: HoldPose, moving: boolean): AvatarAction {
  if (pose === 'twoHand') return moving ? 'carry' : 'hold'
  return moving ? 'carry' : 'hold'
}

// Where the item sits for the LOCAL player, who has no drawn arms. This is the
// same place their right hand would be — down and to the right, in front of the
// hip — so looking down shows what you are carrying and looking ahead does not
// fill the screen with it.
// Offsets are from the EYE, in a body-aligned frame (yaw only). -Z is forward.
export const FIRST_PERSON_GRIP: Record<HoldPose, Grip> = {
  grip: { pos: [0.28, -0.62, -0.36], rot: [0, -0.35, 0] },
  pinch: { pos: [0.26, -0.58, -0.34], rot: [0.35, -0.35, 0.2] },
  cup: { pos: [0.28, -0.58, -0.36], rot: [0, -0.3, 0] },
  flat: { pos: [0.27, -0.6, -0.4], rot: [0, -0.3, 0] },
  twoHand: { pos: [0.06, -0.66, -0.44], rot: [0, 0, 0], twoHanded: true },
}
