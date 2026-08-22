import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { RIG } from './looks'
import { Face, type FaceRig } from './Face'
import { Hair, type HairRig } from './Hair'
import { Glasses } from './Glasses'
import { Hand, type HandRig } from './Hand'
import type { GripName } from './handPose'
import { buildFoot, buildJoint, buildLimb, buildTorso } from './geometry/body'
import { buildNeck } from './geometry/features'
import { buildClothing } from './geometry/clothing'
import { bodySkinMaterial } from '../../systems/materials/skin'
import { fabric } from '../../utils/textures'
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
  /** Rotates against the shoulders through the stride. */
  pelvis: THREE.Group | null
  /** Heel strike and toe off. */
  ankleL: THREE.Group | null
  ankleR: THREE.Group | null
  /** Per-finger joints, for grips and for hand IK. */
  fingersL: HandRig | null
  fingersR: HandRig | null
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
    /** How the right hand closes; comes from what it is holding. */
    rightPose?: GripName
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
  const pelvis = useRef<THREE.Group>(null)
  const ankleL = useRef<THREE.Group>(null)
  const ankleR = useRef<THREE.Group>(null)
  const handRigL = useRef<HandRig>(null)
  const handRigR = useRef<HandRig>(null)

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
    get pelvis() { return pelvis.current },
    get ankleL() { return ankleL.current },
    get ankleR() { return ankleR.current },
    get fingersL() { return handRigL.current },
    get fingersR() { return handRigR.current },
  }))

  const { top, bottom, shoes, build } = profile
  // Limb girth follows the build, so a narrower frame has narrower arms rather
  // than the same arms in a different colour.
  const arms = build.shoulder / 0.2
  const legs = build.hip / 0.108
  const handPose: GripName = 'relaxed'

  // Continuous swept surfaces, built once per look. Capsules gave every limb
  // one radius from end to end and a hemisphere on each cap, which is the
  // "kapsül kol" silhouette; these change girth AND cross section along their
  // length the way an arm or a leg actually does.
  const radial = Math.max(8, seg)
  const geom = useMemo(() => ({
    torso: buildTorso(profile, radial, 'top'),
    hips: buildTorso(profile, radial, 'bottom'),
    upperArm: buildLimb('upperArm', arms, radial),
    foreArm: buildLimb('foreArm', arms, radial),
    thigh: buildLimb('thigh', legs, radial),
    calf: buildLimb('calf', legs, radial),
    shoulder: buildJoint(0.048 * arms, radial, 0.88),
    elbow: buildJoint(0.036 * arms, radial, 0.86),
    knee: buildJoint(0.056 * legs, radial, 0.92),
    // Cloth over the knee. Without it the thigh and calf pieces separate the
    // moment the leg bends and the trouser opens at the joint.
    kneeCloth: buildJoint(0.056 * legs + 0.009, radial, 0.92),
    elbowCloth: buildJoint(0.036 * arms + 0.008, radial, 0.86),
    foot: buildFoot(legs, radial),
    neck: buildNeck(profile, radial),
  }), [profile, radial, arms, legs])
  useEffect(() => () => Object.values(geom).forEach((g) => g.dispose()), [geom])

  // Clothes are their own surfaces, cut from the BODY'S sections and pushed
  // outward by the fabric's thickness — which is why they cannot clip through
  // it. Until now they WERE the body, coloured differently, so a sleeve could
  // only ever end at a joint and bare arms were impossible.
  const wear = useMemo(() => buildClothing(profile, radial), [profile, radial])
  useEffect(() => () => wear.all().forEach((g) => g.dispose()), [wear])

  const topTex = fabric(top.color, `top:${profile.id}`, top.fabric)
  const botTex = fabric(bottom.color, `bot:${profile.id}`, bottom.fabric)
  // The fabric map is a DETAIL layer — the pipeline normalises its brightness so
  // the material colour is the albedo. Passing white here made every garment a
  // pale grey sheet.
  const cloth = {
    color: top.color,
    map: topTex.map,
    normalMap: detail ? topTex.normalMap : undefined,
    roughnessMap: topTex.roughnessMap,
    roughness: top.roughness,
    metalness: 0.02,
  }
  const legCloth = {
    color: bottom.color,
    map: botTex.map,
    normalMap: detail ? botTex.normalMap : undefined,
    roughnessMap: botTex.roughnessMap,
    roughness: bottom.roughness,
    metalness: 0.02,
  }
  // Skin no longer glows to rescue itself from overhead-only lighting: it is a
  // real material with a pore normal map and a roughness break-up, and the
  // bounce light that the emissive was standing in for is now an actual light.
  const skinMat = bodySkinMaterial(profile, detail)

  // One leg, built downward from the hip so rotations bend at real joints.
  const leg = (
    side: -1 | 1,
    hipRef: React.RefObject<THREE.Group>,
    kneeRef: React.RefObject<THREE.Group>,
    ankleRef: React.RefObject<THREE.Group>,
  ) => (
    <group ref={hipRef} position={[side * build.hip, RIG.hipY, 0]}>
      {/* The leg itself is SKIN. What shows below a pair of shorts is a leg. */}
      <mesh geometry={geom.thigh} castShadow>
        <meshStandardMaterial {...skinMat} />
      </mesh>
      {wear.legThigh && (
        <mesh geometry={wear.legThigh} castShadow receiveShadow>
          <meshStandardMaterial {...legCloth} />
        </mesh>
      )}
      <group ref={kneeRef} position={[0, -RIG.thigh, 0]}>
        {/* The knee volume fills the gap between thigh and calf, so the leg is
            one form rather than two tubes meeting. */}
        <mesh geometry={geom.knee} position={[0, 0.004, 0.004]}>
          <meshStandardMaterial {...skinMat} />
        </mesh>
        {wear.legCalf && (
          <mesh geometry={geom.kneeCloth} position={[0, 0.004, 0.004]} castShadow receiveShadow>
            <meshStandardMaterial {...legCloth} />
          </mesh>
        )}
        <mesh geometry={geom.calf} castShadow>
          <meshStandardMaterial {...skinMat} />
        </mesh>
        {wear.legCalf && (
          <mesh geometry={wear.legCalf} castShadow receiveShadow>
            <meshStandardMaterial {...legCloth} />
          </mesh>
        )}
        {/* Shoe: a swept last with a heel, an arch and a toe box, plus a sole
            under it — not a box with a ball stuck on the front. */}
        {/* Ankle: the foot pivots here for heel strike and toe off. */}
        <group ref={ankleRef} position={[0, -RIG.shin + 0.034, 0.012]}>
          <mesh geometry={geom.foot} castShadow>
            <meshStandardMaterial color={shoes.color} roughness={0.62} metalness={0.04} />
          </mesh>
          <mesh position={[0, -0.026 * legs, 0.028 * legs]} scale={[1.02, 1, 1.01]}>
            <boxGeometry args={[0.076 * legs, 0.016, 0.2 * legs]} />
            <meshStandardMaterial color={shoes.sole} roughness={0.88} />
          </mesh>
          {detail && (
            <mesh position={[0, 0.012 * legs, -0.008 * legs]} rotation={[0.3, 0, 0]}>
              <boxGeometry args={[0.042 * legs, 0.026, 0.05 * legs]} />
              <meshStandardMaterial color={shoes.sole} roughness={0.72} />
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
      {/* Deltoid, filling the shoulder so the arm grows out of the torso
          instead of being socketed into it. */}
      <mesh geometry={geom.shoulder} position={[side * 0.006, -0.012, 0]} castShadow>
        <meshStandardMaterial {...skinMat} />
      </mesh>
      <mesh geometry={geom.upperArm} castShadow>
        <meshStandardMaterial {...skinMat} />
      </mesh>
      {wear.sleeveUpper && (
        <mesh geometry={wear.sleeveUpper} castShadow receiveShadow>
          <meshStandardMaterial {...cloth} />
        </mesh>
      )}
      <group ref={elbowRef} position={[0, -RIG.upperArm, 0]}>
        <mesh geometry={geom.elbow} position={[0, 0.002, -0.002]}>
          <meshStandardMaterial {...skinMat} />
        </mesh>
        {wear.sleeveFore && (
          <mesh geometry={geom.elbowCloth} position={[0, 0.002, -0.002]} castShadow receiveShadow>
            <meshStandardMaterial {...cloth} />
          </mesh>
        )}
        <mesh geometry={geom.foreArm} castShadow>
          <meshStandardMaterial {...skinMat} />
        </mesh>
        {wear.sleeveFore && (
          <mesh geometry={wear.sleeveFore} castShadow receiveShadow>
            <meshStandardMaterial {...cloth} />
          </mesh>
        )}
        {/* Wrist. The hand and anything it is holding hang off this, so the
            grip transform is expressed once, in the wrist's own frame. */}
        <group ref={handRef} position={[0, -RIG.forearm, 0]}>
          <Hand
            profile={profile}
            side={side}
            seg={seg}
            detail={detail}
            ref={side === 1 ? handRigR : handRigL}
            grip={side === 1 ? rightPose ?? handPose : handPose}
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
        {/* Pelvis. Everything above and below hangs off it, so the stride's
            pelvic rotation carries the legs with it and the chest counters. */}
        <group ref={pelvis}>
        <group ref={body}>
          {/* Pelvis through ribcage to the base of the neck, as ONE surface:
              iliac crest, waist, the flare of the lower ribs, chest, and the
              trapezius sloping to the neck. The chest group still pivots for
              breathing and counter-rotation; the mesh hangs off the body so a
              seated pose drops it as a piece. */}
          {/* Hips and seat, in the trousers. Cut from the SAME torso profile
              as the shirt above it, so the two meet without a step. */}
          {/* The torso is a BODY now; the clothes go over it. */}
          <mesh geometry={geom.hips} castShadow receiveShadow>
            <meshStandardMaterial {...skinMat} />
          </mesh>
          <mesh geometry={geom.torso} castShadow receiveShadow>
            <meshStandardMaterial {...skinMat} />
          </mesh>
          {wear.hips && (
            <mesh geometry={wear.hips} castShadow receiveShadow>
              <meshStandardMaterial {...legCloth} />
            </mesh>
          )}
          {wear.top && (
            <mesh geometry={wear.top} castShadow receiveShadow>
              <meshStandardMaterial {...cloth} />
            </mesh>
          )}

          <group ref={chest} position={[0, RIG.chestBottom, 0]}>
            {/* Collar and hood are real garment pieces now, cut from the same
                profile as the rest of the top. */}
            {wear.collar && (
              <mesh geometry={wear.collar} position={[0, -RIG.chestBottom, 0]} castShadow>
                <meshStandardMaterial {...cloth} color={top.trim} side={THREE.DoubleSide} />
              </mesh>
            )}
            {wear.hood && (
              <mesh geometry={wear.hood} position={[0, -RIG.chestBottom, 0]} castShadow receiveShadow>
                <meshStandardMaterial {...cloth} />
              </mesh>
            )}
            {/* Neck. A swept surface that starts inside the trapezius and ends
                inside the skull, so neither end can show a cap — the old
                cylinder stopped below the jaw and left a flat disc hanging in
                the gap under the chin. */}
            <mesh geometry={geom.neck} castShadow receiveShadow>
              <meshStandardMaterial {...skinMat} />
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
        {leg(-1, hipL, kneeL, ankleL)}
        {leg(1, hipR, kneeR, ankleR)}
        </group>
      </group>
    </group>
  )
})
