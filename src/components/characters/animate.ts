import * as THREE from 'three'
import type { AvatarRig } from './Avatar'

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
}

const lerp = THREE.MathUtils.lerp

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

  if (rig.chest) {
    rig.chest.scale.setScalar(1 + breath * 0.012 * idle)
    // Torso counter-rotates against the legs when walking; drifts when idle.
    rig.chest.rotation.y = -swing * 0.12 * gait + sway * 0.035
    rig.chest.rotation.x = 0.04 * gait * (p.running ? 2.2 : 1) + sit * 0.12
  }
  if (rig.head) {
    rig.head.rotation.y = sway * 0.06
    rig.head.rotation.x = -0.02 * gait
  }

  // --- Legs ---------------------------------------------------------------
  // Thigh swings; the knee only bends on the back-swing, which is what stops a
  // walk from looking like scissors.
  const hipSwing = swing * amp
  const kneeL = Math.max(0, -Math.sin(p.phase)) * amp * 1.5
  const kneeR = Math.max(0, Math.sin(p.phase)) * amp * 1.5

  if (rig.hipL) rig.hipL.rotation.x = lerp(hipSwing + sway * 0.02, -1.45, sit)
  if (rig.hipR) rig.hipR.rotation.x = lerp(-hipSwing - sway * 0.02, -1.45, sit)
  if (rig.kneeL) rig.kneeL.rotation.x = lerp(-kneeL, -1.5, sit)
  if (rig.kneeR) rig.kneeR.rotation.x = lerp(-kneeR, -1.5, sit)

  // --- Arms ---------------------------------------------------------------
  // Arms swing opposite the legs. At rest they hang with a natural bend rather
  // than hanging perfectly straight.
  const armSwing = -swing * amp * 0.75
  const restBend = -0.22
  if (rig.shoulderL) {
    rig.shoulderL.rotation.x = lerp(armSwing + sway * 0.03, -0.5, sit)
    rig.shoulderL.rotation.z = lerp(0.06 + 0.03 * gait, 0.1, sit)
  }
  if (rig.shoulderR) {
    rig.shoulderR.rotation.x = lerp(-armSwing - sway * 0.03, -0.5, sit)
    rig.shoulderR.rotation.z = lerp(-0.06 - 0.03 * gait, -0.1, sit)
  }
  const elbow = restBend - Math.abs(swing) * amp * 0.5
  if (rig.elbowL) rig.elbowL.rotation.x = lerp(elbow, -1.1, sit)
  if (rig.elbowR) rig.elbowR.rotation.x = lerp(elbow, -1.1, sit)

  // --- Body height --------------------------------------------------------
  // A small two-per-stride bob while walking, and a real drop when sitting.
  if (rig.body) {
    const bob = -Math.abs(swing2) * 0.022 * gait
    rig.body.position.y = lerp(bob, -0.42, sit)
    rig.body.rotation.z = sway * 0.012
  }
}
