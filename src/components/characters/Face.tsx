import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { AvatarProfile } from '../../config/appearance'
import { RIG } from './looks'
import { buildBeardGeometry, buildHeadGeometry } from './geometry/head'
import { Eye, type EyeRig } from './Eyes'

const R = RIG.headRadius

// The face.
//
// The SKULL — cranium, forehead, brow ridge, temples, eye sockets, cheekbones,
// cheeks, jaw and chin — is ONE displaced mesh (geometry/head.ts), so those
// features blend into each other instead of being separate spheres with seams
// between them. Only the parts that genuinely stand apart from the skull are
// their own geometry: the nose, the ears, the lips, the eyes and the brows.

export interface FaceRig {
  eyeL: THREE.Group | null
  eyeR: THREE.Group | null
  lidTopL: THREE.Group | null
  lidTopR: THREE.Group | null
  lidBotL: THREE.Group | null
  lidBotR: THREE.Group | null
  browL: THREE.Group | null
  browR: THREE.Group | null
  /** Hinges below the ear; carries the lower lip, the teeth and the chin mass. */
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
  detail: boolean
}

/**
 * Skin.
 *
 * There is a small emissive term and it is deliberate, not decoration: the
 * interior lights in this house are all overhead, and a face lit only from
 * above loses every downward-facing surface — the eye sockets, under the nose,
 * under the chin — to black at any distance. The term stands in for the light
 * that in life bounces back up off the chest and the floor. It is kept low
 * enough that the face still reads as lit rather than as glowing.
 */
function skinProps(profile: AvatarProfile, detail: boolean, shade = false) {
  const color = shade ? profile.skin.shade : profile.skin.base
  return {
    color,
    roughness: detail ? 0.56 : 0.64,
    metalness: 0.0,
    emissive: color,
    emissiveIntensity: 0.055 * profile.skin.translucency + 0.02,
  }
}

export const Face = forwardRef<FaceRig, FaceProps>(function Face({ profile, seg, detail }, ref) {
  const eyeL = useRef<EyeRig>(null)
  const eyeR = useRef<EyeRig>(null)
  const browL = useRef<THREE.Group>(null)
  const browR = useRef<THREE.Group>(null)
  const jaw = useRef<THREE.Group>(null)
  const mouth = useRef<THREE.Group>(null)
  const cornerL = useRef<THREE.Group>(null)
  const cornerR = useRef<THREE.Group>(null)
  const cheekL = useRef<THREE.Group>(null)
  const cheekR = useRef<THREE.Group>(null)

  useImperativeHandle(ref, () => ({
    get eyeL() { return eyeL.current?.eye ?? null },
    get eyeR() { return eyeR.current?.eye ?? null },
    get lidTopL() { return eyeL.current?.lidTop ?? null },
    get lidTopR() { return eyeR.current?.lidTop ?? null },
    get lidBotL() { return eyeL.current?.lidBot ?? null },
    get lidBotR() { return eyeR.current?.lidBot ?? null },
    get browL() { return browL.current },
    get browR() { return browR.current },
    get jaw() { return jaw.current },
    get mouth() { return mouth.current },
    get cornerL() { return cornerL.current },
    get cornerR() { return cornerR.current },
    get cheekL() { return cheekL.current },
    get cheekR() { return cheekR.current },
  }))

  const skin = skinProps(profile, detail)
  const skinDark = skinProps(profile, detail, true)
  const n = profile.nose
  const lp = profile.lips

  // Face resolution follows the tier: this is the one mesh worth spending on.
  const headSeg = detail ? seg * 3 : Math.max(14, seg * 2)
  const seed = profile.id === 'zeynep' ? 3 : 7
  const head = useMemo(() => buildHeadGeometry(profile, R, headSeg, seed), [profile, headSeg, seed])
  useEffect(() => () => head.dispose(), [head])
  const beard = useMemo(
    () =>
      profile.facialHair === 'none'
        ? null
        : buildBeardGeometry(profile, R, Math.max(12, Math.round(headSeg * 0.7)), profile.facialHair === 'beard'),
    [profile, headSeg],
  )
  useEffect(() => () => beard?.dispose(), [beard])

  const eyeY = 0.006
  const eyeZ = 0.0825

  return (
    <group>
      {/* ---- The skull, as one surface ------------------------------------ */}
      <mesh geometry={head} castShadow receiveShadow>
        <meshStandardMaterial {...skin} vertexColors flatShading={false} />
      </mesh>
      {/* Facial hair as a shell of the SAME surface, so it can never intersect
          the head the way an overlapping sphere did. */}
      {beard && (
        <mesh geometry={beard}>
          <meshStandardMaterial
            color={profile.hair.base}
            roughness={0.95}
            transparent
            vertexColors
            depthWrite={false}
          />
        </mesh>
      )}

      {/* ---- Eyes ---------------------------------------------------------- */}
      <group position={[-profile.eyes.spacing, eyeY, eyeZ]} rotation={[0, 0, profile.eyes.tilt]}>
        <Eye ref={eyeL} profile={profile} side={-1} seg={seg} detail={detail} skin={skin} />
      </group>
      <group position={[profile.eyes.spacing, eyeY, eyeZ]} rotation={[0, 0, -profile.eyes.tilt]}>
        <Eye ref={eyeR} profile={profile} side={1} seg={seg} detail={detail} skin={skin} />
      </group>

      {/* A cheek handle for the animator. The MASS is in the skull mesh; this
          is only something to lift when someone smiles. */}
      {(['L', 'R'] as const).map((side) => {
        const s = side === 'L' ? -1 : 1
        return (
          <group key={side} ref={side === 'L' ? cheekL : cheekR} position={[s * 0.042, -0.03, 0.052]}>
            {detail && (
              <mesh scale={[1, 0.8, 0.42]}>
                <sphereGeometry args={[0.026 * profile.face.cheekFullness, seg, seg]} />
                <meshStandardMaterial {...skin} emissive={profile.skin.blush} emissiveIntensity={0.05} />
              </mesh>
            )}
          </group>
        )
      })}

      {/* ---- Eyebrows ------------------------------------------------------
          Three tapered strokes following an arch, so a brow has a head, a peak
          and a tail rather than being one bar. */}
      {(['L', 'R'] as const).map((side) => {
        const s = side === 'L' ? -1 : 1
        const b = profile.brows
        return (
          <group key={side} ref={side === 'L' ? browL : browR} position={[s * profile.eyes.spacing, eyeY + b.lift, 0.088]}>
            {[-1, 0, 1].map((i) => {
              const t = i / 2
              return (
                <mesh
                  key={i}
                  position={[
                    s * t * b.length * 0.62,
                    -Math.abs(t) * b.arch * 0.014 + (i === 0 ? 0.0018 : 0),
                    -Math.abs(t) * 0.009,
                  ]}
                  rotation={[0, s * t * 0.34, Math.PI / 2 + s * (-t * b.arch * 0.5)]}
                  scale={[1, 1, 0.6]}
                >
                  <capsuleGeometry args={[b.thickness * (1 - Math.abs(t) * 0.34), b.length * 0.4, 2, seg]} />
                  <meshStandardMaterial color={b.color} roughness={0.88} />
                </mesh>
              )
            })}
          </group>
        )
      })}

      {/* ---- Nose ----------------------------------------------------------
          Bridge, tip, wings and nostrils. The nostrils are shadowed recesses
          set UNDER the tip, not black dots stuck on the front. */}
      <group>
        <mesh position={[0, 0.012, 0.086]} rotation={[0.14, 0, 0]} scale={[n.bridgeWidth / 0.016, 1, n.bridgeDepth / 0.026]}>
          <capsuleGeometry args={[0.0092, n.length * 0.7, 2, seg]} />
          <meshStandardMaterial {...skin} />
        </mesh>
        {/* the ball of the tip */}
        <mesh position={[0, -0.03, 0.1]} scale={[1.12, 0.92, 1.04]}>
          <sphereGeometry args={[0.0124 * n.tipRound, seg + 2, seg + 2]} />
          <meshStandardMaterial {...skin} />
        </mesh>
        {/* wings, curving back from the tip */}
        {([-1, 1] as const).map((s) => (
          <mesh
            key={s}
            position={[s * n.nostrilWidth, -0.0325, 0.092]}
            rotation={[0, s * -0.35, 0]}
            scale={[0.7, 0.78, 0.95]}
          >
            <sphereGeometry args={[0.0098, seg, seg]} />
            <meshStandardMaterial {...skin} />
          </mesh>
        ))}
        {/* Nostrils: openings on the UNDERSIDE, angled down and back. */}
        {([-1, 1] as const).map((s) => (
          <mesh
            key={s}
            position={[s * n.nostrilWidth * 0.66, -0.0392, 0.0935]}
            rotation={[1.15, s * 0.2, 0]}
            scale={[1, 1, 0.42]}
          >
            <sphereGeometry args={[0.0044, 8, 8]} />
            <meshStandardMaterial color="#54332b" roughness={0.95} />
          </mesh>
        ))}
        {/* columella, the strip between the nostrils */}
        <mesh position={[0, -0.038, 0.095]} scale={[0.5, 0.5, 0.6]}>
          <sphereGeometry args={[0.006, seg, seg]} />
          <meshStandardMaterial {...skin} />
        </mesh>
      </group>

      {/* ---- Mouth ---------------------------------------------------------
          The upper lip and the mouth line ride the skull; the lower lip, the
          teeth and the chin mass ride the jaw, which is what makes an open
          mouth hinge instead of stretch. */}
      <group ref={mouth} position={[0, -0.058, 0.084]}>
        {/* upper lip, with a dip in the middle for the cupid's bow */}
        <mesh position={[0, 0.0008, 0.006]} rotation={[0, 0, Math.PI / 2]} scale={[1, lp.width / 0.017, 0.6]}>
          <capsuleGeometry args={[lp.upper, 0.028, 2, seg]} />
          <meshStandardMaterial color={lp.color} roughness={0.36} />
        </mesh>
        <mesh position={[0, 0.0042, 0.0082]} scale={[0.55, 0.5, 0.5]}>
          <sphereGeometry args={[lp.upper * 0.9, seg, seg]} />
          <meshStandardMaterial {...skin} />
        </mesh>
        {/* the line between the lips */}
        <mesh position={[0, -0.0045, 0.0102]} rotation={[0, 0, Math.PI / 2]} scale={[1, lp.width / 0.017, 0.36]}>
          <capsuleGeometry args={[0.0014, 0.027, 2, 6]} />
          <meshStandardMaterial color="#7a4740" roughness={0.72} />
        </mesh>
        {/* philtrum */}
        <mesh position={[0, 0.0125, 0.0078]} scale={[0.45, 1, 0.36]}>
          <capsuleGeometry args={[0.0032, 0.0075, 2, 6]} />
          <meshStandardMaterial {...skin} />
        </mesh>
        {/* corners — where a smile actually happens */}
        {(['L', 'R'] as const).map((side) => {
          const s = side === 'L' ? -1 : 1
          return (
            <group key={side} ref={side === 'L' ? cornerL : cornerR} position={[s * lp.width * 0.5, -0.0028, 0.0012]}>
              <mesh scale={[0.55, 0.62, 0.5]}>
                <sphereGeometry args={[0.0055, seg, seg]} />
                <meshStandardMaterial color={lp.color} roughness={0.45} />
              </mesh>
            </group>
          )
        })}
      </group>

      {/* ---- Jaw (hinged) --------------------------------------------------
          The hinge sits below and in front of the ear, where a jaw actually
          pivots. The chin MASS is in the skull mesh; what moves here is the
          lower lip, the mouth cavity and the teeth. */}
      <group ref={jaw} position={[0, 0.01, -0.028]}>
        {/* the dark of the mouth, so an open jaw is not a hole to the skull */}
        <mesh position={[0, -0.068, 0.076]} scale={[1, 0.42, 0.42]}>
          <sphereGeometry args={[0.02, seg, seg]} />
          <meshStandardMaterial color="#40201e" roughness={0.92} />
        </mesh>
        {detail && (
          <group>
            {/* upper and lower teeth — only visible when the mouth opens */}
            <mesh position={[0, -0.0625, 0.086]} scale={[1, 0.34, 0.3]}>
              <sphereGeometry args={[lp.width * 0.62, seg, seg]} />
              <meshStandardMaterial color="#efe9df" roughness={0.28} />
            </mesh>
            <mesh position={[0, -0.0755, 0.085]} scale={[1, 0.3, 0.3]}>
              <sphereGeometry args={[lp.width * 0.56, seg, seg]} />
              <meshStandardMaterial color="#e8e1d6" roughness={0.3} />
            </mesh>
            {/* tongue */}
            <mesh position={[0, -0.0725, 0.072]} scale={[1, 0.3, 0.75]}>
              <sphereGeometry args={[lp.width * 0.5, seg, seg]} />
              <meshStandardMaterial color="#b06f68" roughness={0.5} />
            </mesh>
          </group>
        )}
        {/* lower lip */}
        <mesh position={[0, -0.0765, 0.09]} rotation={[0, 0, Math.PI / 2]} scale={[1, lp.width / 0.019, 0.68]}>
          <capsuleGeometry args={[lp.lower, 0.024, 2, seg]} />
          <meshStandardMaterial color={lp.color} roughness={0.34} />
        </mesh>
      </group>

      {/* ---- Ears ----------------------------------------------------------
          Helix, antihelix, concha, tragus and lobe. An ear is the part people
          never look at directly and always notice when it is a blob. */}
      {([-1, 1] as const).map((s) => (
        <group key={s} position={[s * 0.0735, -0.006, -0.012]} rotation={[0.06, s * 0.34, s * 0.08]}>
          {/* helix — the outer rim, an open curl */}
          <mesh rotation={[0, Math.PI / 2, -0.2]} scale={[1, 1.24, 0.5]}>
            <torusGeometry args={[0.0205, 0.0042, detail ? 8 : 5, detail ? 20 : 10, Math.PI * 1.45]} />
            <meshStandardMaterial {...skin} />
          </mesh>
          {/* antihelix — the inner ridge, a smaller curl inside the helix */}
          {detail && (
            <mesh position={[s * 0.003, -0.001, 0.002]} rotation={[0, Math.PI / 2, -0.35]} scale={[1, 1.1, 0.45]}>
              <torusGeometry args={[0.0118, 0.0028, 6, 14, Math.PI * 1.15]} />
              <meshStandardMaterial {...skin} />
            </mesh>
          )}
          {/* concha — the hollow that leads to the canal */}
          <mesh position={[s * 0.004, -0.002, 0.001]} scale={[0.28, 0.72, 0.5]}>
            <sphereGeometry args={[0.0165, seg, seg]} />
            <meshStandardMaterial {...skinDark} roughness={0.78} />
          </mesh>
          {/* tragus — the small flap in front of the canal */}
          {detail && (
            <mesh position={[s * 0.002, -0.004, 0.009]} scale={[0.4, 0.9, 0.5]}>
              <sphereGeometry args={[0.005, seg, seg]} />
              <meshStandardMaterial {...skin} />
            </mesh>
          )}
          {/* lobe */}
          <mesh position={[s * 0.001, -0.0235, 0.0015]} scale={[0.36, 0.8, 0.6]}>
            <sphereGeometry args={[0.0105, seg, seg]} />
            <meshStandardMaterial {...skin} emissiveIntensity={0.09 * profile.skin.translucency + 0.03} />
          </mesh>
        </group>
      ))}
    </group>
  )
})
