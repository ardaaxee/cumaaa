import { forwardRef, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'
import { RIG } from './looks'
import { Face, type FaceRig } from './Face'
import { Hair, type HairRig } from './Hair'
import { Glasses } from './Glasses'
import { Hand, type HandPose } from './Hand'
import type { AvatarProfile } from '../../config/appearance'

// The joints the animator drives. Exposed through a ref so the animation lives
// with whoever owns the character's state (network, or a local controller)
// rather than inside the geometry.
export interface AvatarRig {
  root: THREE.Group | null
  body: THREE.Group | null // hips upward — dropped when seated
  chest: THREE.Group | null // breathing + counter-rotation
  head: THREE.Group | null
  hipL: THREE.Group | null
  hipR: THREE.Group | null
  kneeL: THREE.Group | null
  kneeR: THREE.Group | null
  shoulderL: THREE.Group | null
  shoulderR: THREE.Group | null
  elbowL: THREE.Group | null
  elbowR: THREE.Group | null
  /** Wrist anchors. Anything carried is parented here, so it follows the arm
      instead of being flown alongside the character. */
  handL: THREE.Group | null
  handR: THREE.Group | null
  /** Face and hair, for expressions, blinking, looking at things and lag. */
  face: FaceRig | null
  hair: HairRig | null
}

// A procedural person, built from an AvatarProfile: hips → knees → feet and
// shoulders → elbows → hands, so walking bends where a leg actually bends, with
// a real face, real hair and — if the profile says so — real glasses on top.
// No character asset is loaded; every part is geometry, and the counts follow
// the quality tier.
export const Avatar = forwardRef<
  AvatarRig,
  {
    profile: AvatarProfile
    seg: number
    /** HIGH and above: face detail, lashes, hair strands, eye highlights. */
    detail: boolean
    /** Rendered inside the right/left wrist group — a carried item. */
    rightHand?: React.ReactNode
    leftHand?: React.ReactNode
    /** How the right hand closes; follows what it is holding. */
    rightPose?: HandPose
  }
>(function Avatar({ profile, seg, detail, rightHand, leftHand, rightPose }, ref) {
  const root = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)
  const chest = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const hipL = useRef<THREE.Group>(null)
  const hipR = useRef<THREE.Group>(null)
  const kneeL = useRef<THREE.Group>(null)
  const kneeR = useRef<THREE.Group>(null)
  const shoulderL = useRef<THREE.Group>(null)
  const shoulderR = useRef<THREE.Group>(null)
  const elbowL = useRef<THREE.Group>(null)
  const elbowR = useRef<THREE.Group>(null)
  const handL = useRef<THREE.Group>(null)
  const handR = useRef<THREE.Group>(null)
  const face = useRef<FaceRig>(null)
  const hair = useRef<HairRig>(null)

  useImperativeHandle(ref, () => ({
    get root() { return root.current },
    get body() { return body.current },
    get chest() { return chest.current },
    get head() { return head.current },
    get hipL() { return hipL.current },
    get hipR() { return hipR.current },
    get kneeL() { return kneeL.current },
    get kneeR() { return kneeR.current },
    get shoulderL() { return shoulderL.current },
    get shoulderR() { return shoulderR.current },
    get elbowL() { return elbowL.current },
    get elbowR() { return elbowR.current },
    get handL() { return handL.current },
    get handR() { return handR.current },
    get face() { return face.current },
    get hair() { return hair.current },
  }))

  const { top, bottom, shoes, skin, build } = profile
  // Limb girth follows the build, so a narrower frame has narrower arms rather
  // than the same arms in a different colour.
  const arms = build.shoulder / 0.2
  const legs = build.hip / 0.108
  const handPose: HandPose = 'relaxed'
  const cloth = { roughness: top.roughness, metalness: 0.02 }
  const legCloth = { roughness: bottom.roughness, metalness: 0.02 }
  const skinMat = {
    roughness: detail ? 0.58 : 0.66,
    metalness: 0.02,
    emissive: skin.base,
    emissiveIntensity: 0.11 * skin.translucency + 0.05,
  }

  // One leg, built downward from the hip so rotations bend at real joints.
  const leg = (side: -1 | 1, hipRef: React.RefObject<THREE.Group>, kneeRef: React.RefObject<THREE.Group>) => (
    <group ref={hipRef} position={[side * build.hip, RIG.hipY, 0]}>
      <mesh position={[0, -RIG.thigh / 2 + 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.082 * legs, 0.056 * legs, RIG.thigh - 0.02, seg]} />
        <meshStandardMaterial color={bottom.color} {...legCloth} />
      </mesh>
      <group ref={kneeRef} position={[0, -RIG.thigh, 0]}>
        <mesh position={[0, 0.006, 0.004]}>
          <sphereGeometry args={[0.054 * legs, seg, seg]} />
          <meshStandardMaterial color={bottom.color} {...legCloth} />
        </mesh>
        <mesh position={[0, -RIG.shin / 2 + 0.01, 0]} castShadow>
          <cylinderGeometry args={[0.053 * legs, 0.034 * legs, RIG.shin - 0.02, seg]} />
          <meshStandardMaterial color={bottom.color} {...legCloth} />
        </mesh>
        {/* calf, which sits high and at the back */}
        <mesh position={[0, -RIG.shin * 0.34, -0.012]} scale={[0.9, 1.5, 0.9]}>
          <sphereGeometry args={[0.042 * legs, seg, seg]} />
          <meshStandardMaterial color={bottom.color} {...legCloth} />
        </mesh>
        {/* turn-up at the ankle, so the trousers end rather than just stopping */}
        <mesh position={[0, -RIG.shin + 0.05, 0]}>
          <cylinderGeometry args={[0.04 * legs, 0.037 * legs, 0.03, seg]} />
          <meshStandardMaterial color={bottom.trim} {...legCloth} />
        </mesh>
        {/* shoe: a sole, an upper with a rounded toe, and a tongue */}
        <group position={[0, -RIG.shin + 0.04, 0.02]}>
          <mesh position={[0, -0.025, 0.028]} castShadow>
            <boxGeometry args={[0.079, 0.058, 0.185]} />
            <meshStandardMaterial color={shoes.color} roughness={0.6} metalness={0.05} />
          </mesh>
          <mesh position={[0, -0.05, 0.028]}>
            <boxGeometry args={[0.083, 0.017, 0.19]} />
            <meshStandardMaterial color={shoes.sole} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.021, 0.116]} scale={[0.94, 0.86, 1]}>
            <sphereGeometry args={[0.04, seg, seg]} />
            <meshStandardMaterial color={shoes.color} roughness={0.6} />
          </mesh>
          {detail && (
            <mesh position={[0, 0.006, 0.055]} rotation={[0.25, 0, 0]}>
              <boxGeometry args={[0.05, 0.03, 0.07]} />
              <meshStandardMaterial color={shoes.sole} roughness={0.7} />
            </mesh>
          )}
        </group>
      </group>
    </group>
  )

  // One arm, built downward from the shoulder.
  const arm = (
    side: -1 | 1,
    shoulderRef: React.RefObject<THREE.Group>,
    elbowRef: React.RefObject<THREE.Group>,
    handRef: React.RefObject<THREE.Group>,
  ) => (
    <group ref={shoulderRef} position={[side * build.shoulder, RIG.shoulderY, 0]}>
      {/* Deltoid: the muscle that caps the shoulder. Flattened against the
          body rather than a ball, or the figure gets balloon sleeves. */}
      <mesh position={[side * 0.004, -0.024, 0]} scale={[0.86, 1.05, 0.82]} castShadow>
        <sphereGeometry args={[0.048 * arms, seg, seg]} />
        <meshStandardMaterial color={top.color} {...cloth} />
      </mesh>
      {detail && (
        <mesh position={[0, -0.016, 0]} rotation={[0, 0, side * 0.2]}>
          <torusGeometry args={[0.046 * arms, 0.002, 4, 12]} />
          <meshStandardMaterial color={top.trim} roughness={0.95} />
        </mesh>
      )}
      {/* Upper arm, tapering from the deltoid to the elbow. A uniform tube is
          the single clearest tell of a puppet limb. */}
      <mesh position={[0, -RIG.upperArm / 2 + 0.01, 0]} castShadow>
        <cylinderGeometry args={[0.044 * arms, 0.036 * arms, RIG.upperArm - 0.02, seg]} />
        <meshStandardMaterial color={top.color} {...cloth} />
      </mesh>
      <group ref={elbowRef} position={[0, -RIG.upperArm, 0]}>
        <mesh position={[0, 0.004, 0]}>
          <sphereGeometry args={[0.036 * arms, seg, seg]} />
          <meshStandardMaterial color={top.color} {...cloth} />
        </mesh>
        {/* Forearm: thickest just below the elbow, narrowest at the wrist. */}
        <mesh position={[0, -RIG.forearm / 2 + 0.012, 0]} castShadow>
          <cylinderGeometry args={[0.037 * arms, 0.026 * arms, RIG.forearm - 0.024, seg]} />
          <meshStandardMaterial color={top.color} {...cloth} />
        </mesh>
        {/* cuff at the wrist */}
        <mesh position={[0, -RIG.forearm + 0.024, 0]}>
          <cylinderGeometry args={[0.029 * arms, 0.027 * arms, 0.036, seg]} />
          <meshStandardMaterial color={top.trim} {...cloth} />
        </mesh>
        {/* Wrist. The hand and anything it is holding hang off this, so the
            grip transform is expressed once, in the wrist's own frame. */}
        <group ref={handRef} position={[0, -RIG.forearm, 0]}>
          <Hand
            profile={profile}
            side={side}
            seg={seg}
            detail={detail}
            pose={side === 1 ? rightPose ?? handPose : handPose}
          />
          {side === 1 ? rightHand : leftHand}
        </group>
      </group>
    </group>
  )

  return (
    <group ref={root} scale={build.scale}>
      {/* The figure is BUILT facing +Z (toes, nose and eyes all point that
          way, and the animator's "lift the arm forward" means +Z). The camera
          convention is the opposite: yaw 0 looks toward -Z. Without this the
          avatar stood with its back to whatever its player was looking at —
          you walked toward someone and they saw you reversing at them. Turning
          the model here, once, keeps both conventions intact. */}
      <group rotation={[0, Math.PI, 0]}>
        <group ref={body}>
          {/* Pelvis */}
          <mesh position={[0, (RIG.hipY + RIG.waistY) / 2, 0]} scale={[1, 1, 0.72]} castShadow>
            <capsuleGeometry args={[build.hip + 0.018, 0.1, 2, seg]} />
            <meshStandardMaterial color={bottom.color} {...legCloth} />
          </mesh>

          {/* Chest group — breathing and torso counter-rotation pivot here */}
          <group ref={chest} position={[0, RIG.chestBottom, 0]}>
            {/* torso: tapered, wider at the chest than the waist */}
            <mesh position={[0, (RIG.chestTop - RIG.chestBottom) / 2, 0]} scale={[1, 1, 0.68]} castShadow>
              <capsuleGeometry args={[build.waist + 0.016, RIG.chestTop - RIG.chestBottom - 0.16, 2, seg]} />
              <meshStandardMaterial color={top.color} {...cloth} />
            </mesh>
            {/* hem, where the garment ends */}
            <mesh position={[0, -0.015, 0]}>
              <cylinderGeometry args={[build.waist + 0.02, build.waist + 0.024, 0.032, seg]} />
              <meshStandardMaterial color={top.trim} {...cloth} />
            </mesh>
            {/* Folds across the body of the garment. Cloth does not hang flat,
                and a couple of soft creases are most of what says "fabric". */}
            {detail &&
              [0.1, 0.21].map((y, i) => (
                <mesh
                  key={i}
                  position={[0, y, build.waist * 0.66]}
                  rotation={[0, 0, i ? 0.14 : -0.18]}
                  scale={[1, 0.35, 0.3]}
                >
                  <capsuleGeometry args={[0.013, build.waist * 1.05, 2, 6]} />
                  <meshStandardMaterial color={top.trim} roughness={top.roughness} transparent opacity={0.45} />
                </mesh>
              ))}
            {/* shoulder yoke spanning between the arms */}
            <mesh position={[0, RIG.shoulderY - RIG.chestBottom - 0.01, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.62]} castShadow>
              <capsuleGeometry args={[0.072, build.shoulder * 1.6, 2, seg]} />
              <meshStandardMaterial color={top.color} {...cloth} />
            </mesh>
            {/* collar, standing round the neck */}
            <mesh position={[0, RIG.neckBase - RIG.chestBottom, 0]}>
              <cylinderGeometry args={[0.072, 0.09, 0.05, seg, 1, true]} />
              <meshStandardMaterial color={top.trim} {...cloth} side={THREE.DoubleSide} />
            </mesh>
            {/* neck */}
            <mesh position={[0, (RIG.neckBase + RIG.neckTop) / 2 - RIG.chestBottom, 0]}>
              <cylinderGeometry args={[0.052, 0.062, RIG.neckTop - RIG.neckBase, seg]} />
              <meshStandardMaterial color={skin.shade} {...skinMat} />
            </mesh>

            {/* Head group: face, hair and glasses all hang off this, so they
                move together because they are attached, not because something
                keeps them in sync. */}
            <group ref={head} position={[0, RIG.headCenter - RIG.chestBottom, 0]}>
              <Face ref={face} profile={profile} seg={seg} detail={detail} />
              <Hair ref={hair} profile={profile} seg={seg} detail={detail} />
              {profile.glasses && <Glasses spec={profile.glasses} detail={detail} />}
            </group>
          </group>

          {arm(-1, shoulderL, elbowL, handL)}
          {arm(1, shoulderR, elbowR, handR)}
        </group>

        {/* Legs sit outside `body` so a seated pose can drop the torso onto a
            chair without the feet sinking through the floor with it. */}
        {leg(-1, hipL, kneeL)}
        {leg(1, hipR, kneeR)}
      </group>
    </group>
  )
})
