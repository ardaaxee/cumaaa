import * as THREE from 'three'
import type { AvatarRig } from './Avatar'
import type { AvatarAction } from './actions'

// What the animator needs to know each frame. Deliberately not a React prop
// bag — this is called from useFrame with plain numbers.
export interface AvatarPose {
  /** Ground speed in m/s, used to blend idle → walk → run. */
  speed: number
  running: boolean
  /** 0 = standing, 1 = fully seated. */
  sit: number
  /** Walk-cycle phase, advanced by the caller from distance travelled. */
  phase: number
  /** Seconds since the character appeared, for breathing and weight shift. */
  time: number
  /** What the character is doing; poses layer on top of the movement blend. */
  action: AvatarAction
}

const lerp = THREE.MathUtils.lerp

// A deliberate pose, expressed as joint targets. `weight` says how completely
// it replaces the underlying stand/walk motion.
interface Posture {
  weight: number
  chestPitch?: number
  chestYaw?: number
  headPitch?: number
  headYaw?: number
  /** Shoulder pitch: negative lifts the arm forward. */
  armL?: number
  armR?: number
  /** Elbow bend (negative = folded). */
  elbowL?: number
  elbowR?: number
  /** Arm out to the side. */
  spreadL?: number
  spreadR?: number
  hip?: number
  knee?: number
  drop?: number
}

// One place describing what every action looks like. Values are radians.
function postureFor(action: AvatarAction, t: number): Posture {
  switch (action) {
    // --- one-handed gestures ---------------------------------------------
    case 'wave': {
      const swing = Math.sin(t * 9) * 0.42
      return { weight: 1, armR: -2.5, elbowR: -0.9 + swing, spreadR: -0.55, headYaw: -0.12, chestYaw: -0.1 }
    }
    case 'point':
      return { weight: 1, armR: -1.55, elbowR: -0.12, spreadR: -0.12, headPitch: 0.05 }
    case 'talk': {
      // Small, alternating hand movement — talking with your hands.
      const a = Math.sin(t * 3.4) * 0.18
      return { weight: 0.75, armR: -0.7 + a, elbowR: -1.25, armL: -0.55 - a, elbowL: -1.1, spreadR: -0.2, spreadL: 0.2, headYaw: a * 0.4 }
    }

    // --- reaching / handling ---------------------------------------------
    case 'use':
    case 'open':
    case 'close':
      return { weight: 1, armR: -1.35, elbowR: -0.55, spreadR: -0.1, chestPitch: 0.1, headPitch: 0.14 }
    case 'pickUp':
    case 'drop':
      return { weight: 1, armR: -0.9, elbowR: -0.3, chestPitch: 0.42, headPitch: 0.35, hip: 0.25, knee: -0.35 }
    case 'hold':
    case 'carry':
      return { weight: 0.9, armR: -1.0, elbowR: -1.35, spreadR: -0.16 }
    case 'drink':
      return { weight: 1, armR: -1.15, elbowR: -2.1, spreadR: -0.05, headPitch: -0.18, chestPitch: -0.04 }
    case 'eat':
      return { weight: 0.95, armR: -0.95, elbowR: -1.95, headPitch: -0.1 }

    // --- held, furniture-bound poses -------------------------------------
    case 'read':
      return { weight: 1, armL: -1.25, elbowL: -1.15, armR: -1.25, elbowR: -1.15, spreadL: 0.22, spreadR: -0.22, headPitch: 0.34, chestPitch: 0.1 }
    case 'phone':
      return { weight: 1, armR: -1.2, elbowR: -1.5, spreadR: -0.1, headPitch: 0.28, chestPitch: 0.06 }
    case 'cook':
      return { weight: 1, armR: -1.1, elbowR: -1.0, armL: -0.9, elbowL: -1.2, spreadR: -0.18, spreadL: 0.18, chestPitch: 0.16, headPitch: 0.3 }
    case 'shower': {
      const sway = Math.sin(t * 1.1) * 0.08
      return { weight: 1, armR: -1.9, elbowR: -1.5, armL: -1.5, elbowL: -1.3, spreadR: -0.3, spreadL: 0.3, headPitch: -0.12, chestYaw: sway }
    }
    case 'watchTv':
      return { weight: 0.5, armL: -0.15, armR: -0.15, elbowL: -0.35, elbowR: -0.35, headPitch: 0.02 }
    case 'sleep':
      // Lying down: the caller lays the whole rig over; here the limbs relax.
      return { weight: 1, armL: -0.25, armR: -0.25, elbowL: -0.45, elbowR: -0.45, spreadL: 0.3, spreadR: -0.3, hip: -0.12, knee: -0.18 }

    default:
      return { weight: 0 }
  }
}

// Drives every joint from one pose. Standing still is NOT a frozen T-pose: the
// chest breathes, the arms hang with a slight bend and the weight drifts from
// one foot to the other, which is most of what makes a figure look alive.
export function animateAvatar(rig: AvatarRig, p: AvatarPose): void {
  const sit = p.sit
  const upright = 1 - sit

  // How much of the walk cycle applies: nothing when still, full by ~1.4 m/s.
  const gait = THREE.MathUtils.clamp(p.speed / 1.4, 0, 1) * upright
  const amp = (p.running ? 0.85 : 0.5) * gait
  const swing = Math.sin(p.phase)
  const swing2 = Math.sin(p.phase * 2)

  // --- Idle ---------------------------------------------------------------
  const breath = Math.sin(p.time * 1.6) * 0.5 + 0.5
  const idle = (1 - gait) * upright
  const sway = Math.sin(p.time * 0.62) * idle

  // --- Deliberate posture on top ------------------------------------------
  // Gestures read as gestures only when they are not fighting a run cycle, so
  // a posture's influence fades as the legs speed up.
  const post = postureFor(p.action, p.time)
  const w = post.weight * (1 - gait * 0.65)

  if (rig.chest) {
    rig.chest.scale.setScalar(1 + breath * 0.012 * idle)
    rig.chest.rotation.y = lerp(-swing * 0.12 * gait + sway * 0.035, post.chestYaw ?? 0, w)
    rig.chest.rotation.x = lerp(0.04 * gait * (p.running ? 2.2 : 1) + sit * 0.12, post.chestPitch ?? 0, w)
  }
  if (rig.head) {
    rig.head.rotation.y = lerp(sway * 0.06, post.headYaw ?? 0, w)
    rig.head.rotation.x = lerp(-0.02 * gait, post.headPitch ?? 0, w)
  }

  // --- Legs ---------------------------------------------------------------
  // Thigh swings; the knee only bends on the back-swing, which is what stops a
  // walk from looking like scissors.
  const hipSwing = swing * amp
  const kneeLift = Math.max(0, -Math.sin(p.phase)) * amp * 1.5
  const kneeLift2 = Math.max(0, Math.sin(p.phase)) * amp * 1.5

  const hipBase = post.hip ?? 0
  const kneeBase = post.knee ?? 0
  if (rig.hipL) rig.hipL.rotation.x = lerp(lerp(hipSwing + sway * 0.02, hipBase, w), -1.45, sit)
  if (rig.hipR) rig.hipR.rotation.x = lerp(lerp(-hipSwing - sway * 0.02, hipBase, w), -1.45, sit)
  if (rig.kneeL) rig.kneeL.rotation.x = lerp(lerp(-kneeLift, kneeBase, w), -1.5, sit)
  if (rig.kneeR) rig.kneeR.rotation.x = lerp(lerp(-kneeLift2, kneeBase, w), -1.5, sit)

  // --- Arms ---------------------------------------------------------------
  // Arms swing opposite the legs. At rest they hang with a natural bend rather
  // than hanging perfectly straight.
  const armSwing = -swing * amp * 0.75
  const restBend = -0.22
  const restElbow = restBend - Math.abs(swing) * amp * 0.5

  if (rig.shoulderL) {
    rig.shoulderL.rotation.x = lerp(lerp(armSwing + sway * 0.03, post.armL ?? 0, w), -0.5, sit)
    rig.shoulderL.rotation.z = lerp(lerp(0.06 + 0.03 * gait, 0.06 + (post.spreadL ?? 0), w), 0.1, sit)
  }
  if (rig.shoulderR) {
    rig.shoulderR.rotation.x = lerp(lerp(-armSwing - sway * 0.03, post.armR ?? 0, w), -0.5, sit)
    rig.shoulderR.rotation.z = lerp(lerp(-0.06 - 0.03 * gait, -0.06 + (post.spreadR ?? 0), w), -0.1, sit)
  }
  if (rig.elbowL) rig.elbowL.rotation.x = lerp(lerp(restElbow, post.elbowL ?? restBend, w), -1.1, sit)
  if (rig.elbowR) rig.elbowR.rotation.x = lerp(lerp(restElbow, post.elbowR ?? restBend, w), -1.1, sit)

  // --- Body height --------------------------------------------------------
  // A small two-per-stride bob while walking, and a real drop when sitting.
  if (rig.body) {
    const bob = -Math.abs(swing2) * 0.022 * gait
    rig.body.position.y = lerp(lerp(bob, post.drop ?? 0, w), -0.42, sit)
    rig.body.rotation.z = sway * 0.012
  }
}
