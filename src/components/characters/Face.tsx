import { forwardRef, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'
import type { AvatarProfile } from '../../config/appearance'
import { RIG } from './looks'

// A face built as a face: a skull, a brow ridge, cheeks that sit on the bone, a
// nose with a bridge and a tip and nostrils, lips with an upper and a lower, a
// jaw that hinges, and ears with an inside. Every one of those is its own mesh
// positioned from the profile, so a different nose is a DIFFERENT SHAPE and not
// a different colour.
//
// Everything is in head-local space: the origin is the centre of the skull and
// +Z is the direction the face looks. R is the skull radius.
const R = RIG.headRadius

/** The parts the animator moves. */
export interface FaceRig {
  eyeL: THREE.Group | null
  eyeR: THREE.Group | null
  lidTopL: THREE.Group | null
  lidTopR: THREE.Group | null
  lidBotL: THREE.Group | null
  lidBotR: THREE.Group | null
  browL: THREE.Group | null
  browR: THREE.Group | null
  /** Hinges at the ear line; carries the chin, the lower lip and the jaw mass. */
  jaw: THREE.Group | null
  mouth: THREE.Group | null
  cornerL: THREE.Group | null
  cornerR: THREE.Group | null
  cheekL: THREE.Group | null
  cheekR: THREE.Group | null
}

export interface FaceProps {
  profile: AvatarProfile
  seg: number
  /** HIGH and above: lashes, eye highlights, finer skin response. */
  detail: boolean
}

// Skin. On the tiers that can afford it this is a physical material with a
// little sheen, which is what stops skin reading as painted plastic; the small
// emissive term stands in for light bleeding through, since interior lamps sit
// overhead and a face lit only from above goes to a black hole at any distance.
function skinProps(profile: AvatarProfile, detail: boolean, shade = false) {
  const color = shade ? profile.skin.shade : profile.skin.base
  return {
    color,
    roughness: detail ? 0.58 : 0.66,
    metalness: 0.0,
    emissive: color,
    emissiveIntensity: 0.11 * profile.skin.translucency + 0.05,
  }
}

export const Face = forwardRef<FaceRig, FaceProps>(function Face({ profile, seg, detail }, ref) {
  const eyeL = useRef<THREE.Group>(null)
  const eyeR = useRef<THREE.Group>(null)
  const lidTopL = useRef<THREE.Group>(null)
  const lidTopR = useRef<THREE.Group>(null)
  const lidBotL = useRef<THREE.Group>(null)
  const lidBotR = useRef<THREE.Group>(null)
  const browL = useRef<THREE.Group>(null)
  const browR = useRef<THREE.Group>(null)
  const jaw = useRef<THREE.Group>(null)
  const mouth = useRef<THREE.Group>(null)
  const cornerL = useRef<THREE.Group>(null)
  const cornerR = useRef<THREE.Group>(null)
  const cheekL = useRef<THREE.Group>(null)
  const cheekR = useRef<THREE.Group>(null)

  useImperativeHandle(ref, () => ({
    get eyeL() { return eyeL.current },
    get eyeR() { return eyeR.current },
    get lidTopL() { return lidTopL.current },
    get lidTopR() { return lidTopR.current },
    get lidBotL() { return lidBotL.current },
    get lidBotR() { return lidBotR.current },
    get browL() { return browL.current },
    get browR() { return browR.current },
    get jaw() { return jaw.current },
    get mouth() { return mouth.current },
    get cornerL() { return cornerL.current },
    get cornerR() { return cornerR.current },
    get cheekL() { return cheekL.current },
    get cheekR() { return cheekR.current },
  }))

  const f = profile.face
  const skin = skinProps(profile, detail)
  const skinDark = skinProps(profile, detail, true)
  const eyeY = 0.008
  // Far enough forward that the eyeball is flush with the skull rather than
  // sunk behind it, with the socket and the lids doing the framing.
  const eyeZ = 0.09

  const eyeRefs = { L: { eye: eyeL, top: lidTopL, bot: lidBotL }, R: { eye: eyeR, top: lidTopR, bot: lidBotR } }
  const browRefs = { L: browL, R: browR }
  const cheekRefs = { L: cheekL, R: cheekR }
  const cornerRefs = { L: cornerL, R: cornerR }

  return (
    <group>
      {/* ---- Skull ---------------------------------------------------------
          The cranium, plus a forehead mass that gives the brow something to sit
          on instead of the face running straight into a sphere. */}
      <mesh scale={[0.69, 1.0 * f.length, 0.86]} castShadow>
        <sphereGeometry args={[R, seg * 2, seg * 2]} />
        <meshStandardMaterial {...skin} />
      </mesh>
      {/* Forehead: a shallow bulge ABOVE the brow. It used to be a large ball
          centred at eye height, which is what put a wall in front of the eyes. */}
      <mesh position={[0, 0.056, 0.004]} scale={[0.63, 0.4 * f.foreheadRound, 0.66]}>
        <sphereGeometry args={[R, seg, seg]} />
        <meshStandardMaterial {...skin} />
      </mesh>

      {/* Brow ridge: the bone above the eye. Subtle on a soft face, heavier on
          a strong one — it is most of what reads as bone structure. */}
      {([-1, 1] as const).map((s) => (
        <mesh
          key={s}
          position={[s * 0.031, 0.034, 0.073]}
          rotation={[0, 0, s * -0.14]}
          scale={[0.72, 0.34 * f.browRidge, 0.4]}
        >
          <sphereGeometry args={[0.032, seg, seg]} />
          <meshStandardMaterial {...skin} />
        </mesh>
      ))}

      {/* Cheeks, sitting on the bone under the eye. */}
      {(['L', 'R'] as const).map((side) => {
        const s = side === 'L' ? -1 : 1
        return (
          <group key={side} ref={cheekRefs[side]} position={[s * 0.042, -0.03, 0.046]}>
            <mesh scale={[0.85, 0.9, 0.52]}>
              <sphereGeometry args={[0.032 * f.cheekFullness, seg, seg]} />
              <meshStandardMaterial {...skin} emissive={profile.skin.blush} emissiveIntensity={0.075} />
            </mesh>
          </group>
        )
      })}

      {/* ---- Eyes ----------------------------------------------------------
          Real spheres: sclera, an iris dome, a pupil and a clear cornea over
          the top. Flat dark discs are what make eyes read as buttons. */}
      {(['L', 'R'] as const).map((side) => {
        const s = side === 'L' ? -1 : 1
        const e = profile.eyes
        const refs = eyeRefs[side]
        return (
          <group key={side} position={[s * e.spacing, eyeY, eyeZ]} rotation={[0, 0, s * -e.tilt]}>
            {/* the socket: a darker recess so the eye sits IN the head */}
            <mesh position={[0, 0, -0.004]} scale={[1.24, 1.06, 0.7]}>
              <sphereGeometry args={[e.size, seg, seg]} />
              <meshStandardMaterial {...skinDark} roughness={0.7} emissiveIntensity={0.04} />
            </mesh>

            <group ref={refs.eye}>
              <mesh>
                <sphereGeometry args={[e.size, seg + 4, seg + 4]} />
                <meshStandardMaterial color="#f0ece6" roughness={0.24} metalness={0} />
              </mesh>
              {/* iris — a dome on the eyeball, not a sticker */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <sphereGeometry args={[e.size * 1.002, seg + 4, seg, 0, Math.PI * 2, 0, 0.63]} />
                <meshStandardMaterial color={e.iris} roughness={0.2} metalness={0.05} />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <sphereGeometry args={[e.size * 1.006, seg + 4, seg, 0, Math.PI * 2, 0, 0.27]} />
                <meshStandardMaterial color="#100c0a" roughness={0.15} />
              </mesh>
              {/* cornea: the wet bulge that catches the light */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <sphereGeometry args={[e.size * 1.05, seg + 4, seg, 0, Math.PI * 2, 0, 0.62]} />
                <meshPhysicalMaterial
                  color="#ffffff"
                  transparent
                  opacity={0.16}
                  roughness={0.02}
                  metalness={0}
                  clearcoat={1}
                  clearcoatRoughness={0.02}
                />
              </mesh>
              {detail && (
                <mesh position={[s * -0.0035, 0.005, e.size * 1.02]}>
                  <sphereGeometry args={[0.0013, 6, 6]} />
                  <meshBasicMaterial color="#ffffff" toneMapped={false} transparent opacity={0.6} />
                </mesh>
              )}
            </group>

            {/* Lids. Caps a shade larger than the eyeball; blinking rotates the
                upper one down over the front. */}
            {/* The cap covers everything within `thetaLength` of the group's
                +Y. The front of the eye is PI/2 away, so an open lid has to
                stop short of that or it sits over the iris — which is what
                made the eyes look shut. */}
            <group ref={refs.top} rotation={[0.42 + profile.eyes.lidCover * 0.35, 0, 0]}>
              <mesh rotation={[0, 0, 0]}>
                <sphereGeometry args={[e.size * 1.1, seg + 2, seg, 0, Math.PI * 2, 0, 0.95]} />
                <meshStandardMaterial {...skin} side={THREE.DoubleSide} />
              </mesh>
              {detail && profile.eyes.lashes && (
                <mesh position={[0, e.size * 0.42, e.size * 0.86]} rotation={[0.5, 0, 0]}>
                  <torusGeometry args={[e.size * 0.94, 0.0011, 4, 14, Math.PI * 0.95]} />
                  <meshStandardMaterial color="#181110" roughness={0.85} />
                </mesh>
              )}
            </group>
            <group ref={refs.bot} rotation={[-0.36, 0, 0]}>
              <mesh rotation={[Math.PI, 0, 0]}>
                <sphereGeometry args={[e.size * 1.08, seg + 2, seg, 0, Math.PI * 2, 0, 0.85]} />
                <meshStandardMaterial {...skin} side={THREE.DoubleSide} />
              </mesh>
            </group>
          </group>
        )
      })}

      {/* ---- Eyebrows ------------------------------------------------------ */}
      {(['L', 'R'] as const).map((side) => {
        const s = side === 'L' ? -1 : 1
        const b = profile.brows
        return (
          <group key={side} ref={browRefs[side]} position={[s * profile.eyes.spacing, eyeY + b.lift, 0.086]}>
            {/* Three tapered segments following an arch, so a brow has a head,
                a peak and a tail rather than being one straight bar. */}
            {[-1, 0, 1].map((i) => {
              const t = i / 2
              return (
                <mesh
                  key={i}
                  position={[s * t * b.length * 0.62, -Math.abs(t) * b.arch * 0.016 + (i === 0 ? 0.002 : 0), -Math.abs(t) * 0.008]}
                  rotation={[0, s * t * 0.3, Math.PI / 2 + s * (-t * b.arch * 0.55)]}
                  scale={[1, 1, 0.62]}
                >
                  <capsuleGeometry args={[b.thickness * (1 - Math.abs(t) * 0.32), b.length * 0.4, 2, seg]} />
                  <meshStandardMaterial color={b.color} roughness={0.86} />
                </mesh>
              )
            })}
          </group>
        )
      })}

      {/* ---- Nose ----------------------------------------------------------
          Bridge, tip, wings and nostrils as separate forms. */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.006, 0.09]} rotation={[0.16, 0, 0]} scale={[profile.nose.bridgeWidth / 0.02, 1, profile.nose.bridgeDepth / 0.026]}>
          <capsuleGeometry args={[0.0105, profile.nose.length * 0.72, 2, seg]} />
          <meshStandardMaterial {...skin} />
        </mesh>
        <mesh position={[0, -0.03, 0.1]} scale={[1.16, 0.9, 1.05]}>
          <sphereGeometry args={[0.0126 * profile.nose.tipRound, seg + 2, seg + 2]} />
          <meshStandardMaterial {...skin} color={detail ? profile.skin.blush : profile.skin.base} emissiveIntensity={0.09} />
        </mesh>
        {/* wings */}
        {([-1, 1] as const).map((s) => (
          <mesh key={s} position={[s * profile.nose.nostrilWidth, -0.032, 0.094]} scale={[0.78, 0.74, 0.86]}>
            <sphereGeometry args={[0.0092, seg, seg]} />
            <meshStandardMaterial {...skin} />
          </mesh>
        ))}
        {/* nostrils, from underneath */}
        {([-1, 1] as const).map((s) => (
          <mesh key={s} position={[s * profile.nose.nostrilWidth * 0.62, -0.0385, 0.0995]} rotation={[0.5, 0, 0]} scale={[1, 0.5, 1]}>
            <sphereGeometry args={[0.0052, 8, 8]} />
            <meshStandardMaterial color="#4a2f26" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* ---- Upper lip + mouth ---------------------------------------------
          The upper lip and the mouth line stay with the skull; the lower lip
          and the chin ride the jaw, which is what makes an open mouth look
          hinged instead of stretched. */}
      <group ref={mouth} position={[0, -0.062, 0.086]}>
        <mesh position={[0, 0, 0.006]} rotation={[0, 0, Math.PI / 2]} scale={[1, profile.lips.width / 0.018, 0.62]}>
          <capsuleGeometry args={[profile.lips.upper, 0.03, 2, seg]} />
          <meshStandardMaterial color={profile.lips.color} roughness={0.42} />
        </mesh>
        {/* the line between the lips */}
        <mesh position={[0, -0.005, 0.0105]} rotation={[0, 0, Math.PI / 2]} scale={[1, profile.lips.width / 0.018, 0.4]}>
          <capsuleGeometry args={[0.0016, 0.03, 2, 6]} />
          <meshStandardMaterial color="#7d4a45" roughness={0.7} />
        </mesh>
        {/* philtrum */}
        <mesh position={[0, 0.013, 0.008]} scale={[0.5, 1, 0.4]}>
          <capsuleGeometry args={[0.0035, 0.008, 2, 6]} />
          <meshStandardMaterial {...skin} />
        </mesh>
        {/* corners, which is where a smile actually happens */}
        {(['L', 'R'] as const).map((side) => {
          const s = side === 'L' ? -1 : 1
          return (
            <group key={side} ref={cornerRefs[side]} position={[s * profile.lips.width * 0.52, -0.003, 0.002]}>
              <mesh scale={[0.6, 0.7, 0.6]}>
                <sphereGeometry args={[0.006, seg, seg]} />
                <meshStandardMaterial color={profile.lips.color} roughness={0.5} />
              </mesh>
            </group>
          )
        })}
      </group>

      {/* ---- Jaw (hinged) --------------------------------------------------- */}
      <group ref={jaw} position={[0, 0.012, -0.03]}>
        <mesh
          position={[0, -0.058, 0.024]}
          scale={[f.jawWidth * 0.66, 0.68, 0.74]}
        >
          <sphereGeometry args={[R * 0.94, seg * 2, seg] } />
          <meshStandardMaterial {...skin} />
        </mesh>
        {/* chin */}
        <mesh position={[0, -0.094, 0.076]} scale={[f.chinWidth * 0.72, 0.52, 0.58 * f.chinProject]}>
          <sphereGeometry args={[0.032, seg, seg]} />
          <meshStandardMaterial {...skin} />
        </mesh>
        {/* lower lip */}
        <mesh position={[0, -0.079, 0.092]} rotation={[0, 0, Math.PI / 2]} scale={[1, profile.lips.width / 0.02, 0.7]}>
          <capsuleGeometry args={[profile.lips.lower, 0.026, 2, seg]} />
          <meshStandardMaterial color={profile.lips.color} roughness={0.4} />
        </mesh>
        {/* the dark of the mouth, so an open jaw is not a hole to the skull */}
        <mesh position={[0, -0.07, 0.078]} scale={[1, 0.5, 0.5]}>
          <sphereGeometry args={[0.022, seg, seg]} />
          <meshStandardMaterial color="#3a1f1d" roughness={0.9} />
        </mesh>
        {profile.facialHair !== 'none' && (
          <mesh position={[0, -0.082, 0.028]} scale={[f.jawWidth * 0.64, 0.46, 0.76]}>
            <sphereGeometry args={[R * 0.9, seg, seg]} />
            <meshStandardMaterial
              color={profile.hair.base}
              roughness={0.96}
              transparent
              opacity={profile.facialHair === 'stubble' ? 0.22 : 0.8}
            />
          </mesh>
        )}
      </group>

      {/* ---- Ears ----------------------------------------------------------- */}
      {([-1, 1] as const).map((s) => (
        <group key={s} position={[s * 0.077, -0.008, -0.008]} rotation={[0, s * 0.3, s * 0.06]}>
          <mesh scale={[0.3, 1, 0.62]}>
            <sphereGeometry args={[0.03, seg, seg]} />
            <meshStandardMaterial {...skin} emissiveIntensity={0.16 * profile.skin.translucency + 0.05} />
          </mesh>
          {/* concha — the hollow, without which an ear is a blob */}
          <mesh position={[s * 0.005, -0.002, 0.004]} scale={[0.26, 0.62, 0.42]}>
            <sphereGeometry args={[0.026, seg, seg]} />
            <meshStandardMaterial {...skinDark} roughness={0.75} />
          </mesh>
          <mesh position={[s * 0.002, -0.019, 0.006]} scale={[0.36, 0.5, 0.6]}>
            <sphereGeometry args={[0.014, seg, seg]} />
            <meshStandardMaterial {...skin} />
          </mesh>
        </group>
      ))}
    </group>
  )
})
