import { forwardRef, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'
import { RIG, type CharacterLook } from './looks'

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
}

// A procedural person: hips → knees → feet and shoulders → elbows → hands, so
// walking bends where a leg actually bends. No character asset is loaded; every
// part is a primitive, and segment counts follow the quality tier.
export const Avatar = forwardRef<
  AvatarRig,
  {
    look: CharacterLook
    seg: number
    faces: boolean
    /** Rendered inside the right/left wrist group — a carried item. */
    rightHand?: React.ReactNode
    leftHand?: React.ReactNode
  }
>(function Avatar({ look, seg, faces, rightHand, leftHand }, ref) {
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
    }))

    const cloth = { roughness: 0.88, metalness: 0.02 }
    // A trace of self-illumination on skin. Interior lamps sit overhead, so a
    // face lit only from above reads as a black hole at any distance; this lifts
    // it just enough to keep features legible without looking lit from within.
    const skinMat = {
      roughness: 0.72,
      metalness: 0.02,
      emissive: look.skin,
      emissiveIntensity: 0.14,
    }

    // One leg, built downward from the hip so rotations bend at real joints.
    const leg = (side: -1 | 1, hipRef: React.RefObject<THREE.Group>, kneeRef: React.RefObject<THREE.Group>) => (
      <group ref={hipRef} position={[side * look.hip, RIG.hipY, 0]}>
        {/* thigh */}
        <mesh position={[0, -RIG.thigh / 2, 0]} castShadow>
          <capsuleGeometry args={[0.077, RIG.thigh - 0.1, 2, seg]} />
          <meshStandardMaterial color={look.legs} {...cloth} />
        </mesh>
        <group ref={kneeRef} position={[0, -RIG.thigh, 0]}>
          {/* shin */}
          <mesh position={[0, -RIG.shin / 2, 0]} castShadow>
            <capsuleGeometry args={[0.062, RIG.shin - 0.09, 2, seg]} />
            <meshStandardMaterial color={look.legs} {...cloth} />
          </mesh>
          {/* shoe: a low box with a rounded toe, so the figure meets the floor */}
          <group position={[0, -RIG.shin + 0.04, 0.02]}>
            <mesh position={[0, -0.025, 0.03]} castShadow>
              <boxGeometry args={[0.088, 0.062, 0.2]} />
              <meshStandardMaterial color={look.shoe} roughness={0.6} metalness={0.05} />
            </mesh>
            <mesh position={[0, -0.052, 0.03]}>
              <boxGeometry args={[0.092, 0.018, 0.205]} />
              <meshStandardMaterial color={look.soleColor} roughness={0.85} />
            </mesh>
            <mesh position={[0, -0.02, 0.125]}>
              <sphereGeometry args={[0.042, seg, seg]} />
              <meshStandardMaterial color={look.shoe} roughness={0.6} />
            </mesh>
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
      <group ref={shoulderRef} position={[side * look.shoulder, RIG.shoulderY, 0]}>
        {/* sleeve cap, so the shoulder doesn't read as a stuck-on stick */}
        <mesh position={[0, -0.02, 0]} castShadow>
          <sphereGeometry args={[0.062, seg, seg]} />
          <meshStandardMaterial color={look.top} {...cloth} />
        </mesh>
        <mesh position={[0, -RIG.upperArm / 2, 0]} castShadow>
          <capsuleGeometry args={[0.051, RIG.upperArm - 0.07, 2, seg]} />
          <meshStandardMaterial color={look.top} {...cloth} />
        </mesh>
        <group ref={elbowRef} position={[0, -RIG.upperArm, 0]}>
          {/* Sleeved forearm down to the wrist. An elbow-length cuff left most
              of the arm bare, which read as a pale stick rather than a person in
              everyday clothes. */}
          <mesh position={[0, -RIG.forearm / 2 + 0.02, 0]} castShadow>
            <capsuleGeometry args={[0.046, RIG.forearm - 0.12, 2, seg]} />
            <meshStandardMaterial color={look.top} {...cloth} />
          </mesh>
          {/* cuff at the wrist */}
          <mesh position={[0, -RIG.forearm + 0.03, 0]}>
            <cylinderGeometry args={[0.043, 0.041, 0.04, seg]} />
            <meshStandardMaterial color={look.topTrim} {...cloth} />
          </mesh>
          {/* Wrist. The hand and anything it is holding hang off this, so the
              grip transform is expressed once, in the wrist's own frame. */}
          <group ref={handRef} position={[0, -RIG.forearm, 0]}>
            {/* hand: flattened, not a ball */}
            <mesh position={[0, -0.03, 0]} scale={[1, 1.25, 0.62]} castShadow>
              <sphereGeometry args={[0.047, seg, seg]} />
              <meshStandardMaterial color={look.skinShade} {...skinMat} />
            </mesh>
            {/* the basic silhouette of fingers, so a hand holding something
                does not read as a mitten */}
            {seg >= 12 &&
              [-0.021, -0.007, 0.007, 0.021].map((x, i) => (
                <mesh key={i} position={[x, -0.058 - Math.abs(x) * 0.25, 0.004]} rotation={[0.2, 0, 0]}>
                  <capsuleGeometry args={[0.0085, 0.026 - Math.abs(x) * 0.3, 2, 6]} />
                  <meshStandardMaterial color={look.skinShade} {...skinMat} />
                </mesh>
              ))}
            {seg >= 12 && (
              <mesh position={[side * -0.03, -0.036, 0.012]} rotation={[0.1, 0, side * 0.6]}>
                <capsuleGeometry args={[0.0095, 0.02, 2, 6]} />
                <meshStandardMaterial color={look.skinShade} {...skinMat} />
              </mesh>
            )}
            {side === 1 ? rightHand : leftHand}
          </group>
        </group>
      </group>
    )

    return (
      <group ref={root}>
        {/* The figure is BUILT facing +Z (toes, nose and eyes all point that
            way, and the animator's "lift the arm forward" means +Z). The camera
            convention is the opposite: yaw 0 looks toward -Z. Without this the
            avatar stood with its back to whatever its player was looking at —
            you walked toward someone and they saw you reversing at them. Turning
            the model here, once, keeps both conventions intact. */}
        <group rotation={[0, Math.PI, 0]}>
        <group ref={body}>
          {/* Pelvis */}
          <mesh position={[0, (RIG.hipY + RIG.waistY) / 2, 0]} castShadow>
            <capsuleGeometry args={[0.135, 0.1, 2, seg]} />
            <meshStandardMaterial color={look.legs} {...cloth} />
          </mesh>

          {/* Chest group — breathing and torso counter-rotation pivot here */}
          <group ref={chest} position={[0, RIG.chestBottom, 0]}>
            {/* torso: tapered, wider at the chest than the waist */}
            <mesh position={[0, (RIG.chestTop - RIG.chestBottom) / 2, 0]} castShadow>
              <capsuleGeometry args={[0.152, RIG.chestTop - RIG.chestBottom - 0.16, 2, seg]} />
              <meshStandardMaterial color={look.top} {...cloth} />
            </mesh>
            {/* shoulder yoke spanning between the arms */}
            <mesh position={[0, RIG.shoulderY - RIG.chestBottom, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <capsuleGeometry args={[0.078, look.shoulder * 1.7, 2, seg]} />
              <meshStandardMaterial color={look.top} {...cloth} />
            </mesh>
            {/* collar */}
            <mesh position={[0, RIG.neckBase - RIG.chestBottom, 0]}>
              <cylinderGeometry args={[0.072, 0.086, 0.045, seg]} />
              <meshStandardMaterial color={look.topTrim} {...cloth} />
            </mesh>
            {/* neck */}
            <mesh position={[0, (RIG.neckBase + RIG.neckTop) / 2 - RIG.chestBottom, 0]}>
              <cylinderGeometry args={[0.052, 0.062, RIG.neckTop - RIG.neckBase, seg]} />
              <meshStandardMaterial color={look.skinShade} {...skinMat} />
            </mesh>

            {/* Head group */}
            <group ref={head} position={[0, RIG.headCenter - RIG.chestBottom, 0]}>
              <mesh scale={[0.94, 1.16, 1]} castShadow>
                <sphereGeometry args={[RIG.headRadius, seg, seg]} />
                <meshStandardMaterial color={look.skin} {...skinMat} />
              </mesh>
              {/* jaw, so the head isn't a plain ball */}
              <mesh position={[0, -0.055, 0.012]} scale={[0.82, 0.7, 0.9]}>
                <sphereGeometry args={[RIG.headRadius, seg, seg]} />
                <meshStandardMaterial color={look.skin} {...skinMat} />
              </mesh>
              {/* ears */}
              {[-1, 1].map((s) => (
                <mesh key={s} position={[s * 0.104, -0.005, 0]} scale={[0.4, 1, 0.7]}>
                  <sphereGeometry args={[0.032, seg, seg]} />
                  <meshStandardMaterial color={look.skinShade} {...skinMat} />
                </mesh>
              ))}

              {/* Hair: a cap that follows the skull, plus a tie-back length */}
              <mesh position={[0, 0.016, -0.008]} scale={[1, 1.04, 1.02]}>
                <sphereGeometry args={[RIG.headRadius + 0.014, seg, seg, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
                <meshStandardMaterial color={look.hair} roughness={0.94} />
              </mesh>
              <mesh position={[0, -0.028, -0.056]} scale={[1, 0.86, 0.62]}>
                <sphereGeometry args={[RIG.headRadius + 0.006, seg, seg]} />
                <meshStandardMaterial color={look.hair} roughness={0.94} />
              </mesh>
              {look.hairStyle === 'tied-back' && (
                <mesh position={[0, -0.11, -0.1]} rotation={[0.3, 0, 0]} castShadow>
                  <capsuleGeometry args={[0.048, 0.16, 2, seg]} />
                  <meshStandardMaterial color={look.hair} roughness={0.94} />
                </mesh>
              )}

              {/* Face: only on tiers where it will actually resolve. Kept very
                  understated — overdone eyes are what make a figure look like a
                  toy. */}
              {faces &&
                [-1, 1].map((s) => (
                  <group key={s}>
                    <mesh position={[s * 0.044, 0.006, 0.098]} scale={[1, 0.72, 0.5]}>
                      <sphereGeometry args={[0.017, 10, 10]} />
                      <meshStandardMaterial color="#2b2622" roughness={0.35} />
                    </mesh>
                    <mesh position={[s * 0.046, 0.038, 0.094]} scale={[1.5, 0.32, 0.4]}>
                      <sphereGeometry args={[0.019, 8, 8]} />
                      <meshStandardMaterial color={look.hair} roughness={0.9} />
                    </mesh>
                  </group>
                ))}
              {faces && (
                <mesh position={[0, -0.026, 0.104]} scale={[0.7, 0.6, 0.7]}>
                  <sphereGeometry args={[0.022, 10, 10]} />
                  <meshStandardMaterial color={look.skinShade} {...skinMat} />
                </mesh>
              )}
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
  },
)
