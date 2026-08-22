import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { AvatarProfile } from '../../config/appearance'
import { RIG } from './looks'
import { buildHeadGeometry, headSurface, surfaceZAtHeight } from './geometry/head'
import { buildAntihelix, buildBrow, buildHelix, buildNose } from './geometry/features'
import { MORPHS, type MorphName } from './geometry/head'
import { bodySkinMaterial, projectHeadUv, skinMaterial } from '../../systems/materials/skin'
import { Eye, type EyeRig } from './Eyes'

const R = RIG.headRadius

// The face.
//
// The SKULL — cranium, forehead, brow ridge, temples, eye sockets, cheekbones,
// cheeks, jaw and chin — is ONE displaced mesh (geometry/head.ts). Only the
// parts that genuinely stand apart from it are their own geometry: the nose,
// the ears, the lips, the eyes and the brows. Each of those is a SWEPT surface
// with a section that changes along its length (geometry/features.ts) rather
// than a pile of spheres and capsules, and each is UV-projected back into the
// head's texture space so the skin runs across the join unbroken.

export interface FaceRig {
  eyeL: THREE.Group | null
  eyeR: THREE.Group | null
  lidTopL: THREE.Group | null
  lidTopR: THREE.Group | null
  lidBotL: THREE.Group | null
  lidBotR: THREE.Group | null
  browL: THREE.Group | null
  browR: THREE.Group | null
  /** Carries the teeth, the tongue and the dark of the mouth. Follows the
      jawOpen morph so the cavity opens with the face rather than lagging it. */
  jaw: THREE.Group | null
  /**
   * Expression, as blend shapes on the head's own surface.
   *
   * The mouth corners and cheeks used to be little groups holding little
   * spheres, and a "smile" moved those spheres. Now the lips are part of the
   * head mesh, so an expression has to move the SURFACE — which is what these
   * are for. Setting one out of range or by an unknown name is a no-op.
   */
  morph: (name: MorphName, value: number) => void
  /** From the profile — how hooded this character's eyes are at rest. */
  lidCover: number
}

export interface FaceProps {
  profile: AvatarProfile
  seg: number
  detail: boolean
}

export const Face = forwardRef<FaceRig, FaceProps>(function Face({ profile, seg, detail }, ref) {
  const eyeL = useRef<EyeRig>(null)
  const eyeR = useRef<EyeRig>(null)
  const browL = useRef<THREE.Group>(null)
  const browR = useRef<THREE.Group>(null)
  const jaw = useRef<THREE.Group>(null)
  const head = useRef<THREE.Mesh>(null)

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
    morph: (name: MorphName, value: number) => {
      const i = MORPHS.indexOf(name)
      if (i < 0) return
      const infl = head.current?.morphTargetInfluences
      if (infl && i < infl.length) infl[i] = value
    },
    lidCover: profile.eyes.lidCover,
  }))

  // Skin comes from a real PBR set now: albedo, pores in the normal map, and a
  // roughness that changes across the face. There is no emissive term — the
  // house carries a bounce fill instead, which is what the emissive was
  // standing in for.
  const skin = skinMaterial(profile, detail)
  const plainSkin = bodySkinMaterial(profile, detail)
  const darkSkin = bodySkinMaterial(profile, detail, true)
  const lp = profile.lips

  // Face resolution follows the tier: this is the one mesh worth spending on.
  const headSeg = detail ? Math.round(seg * 2) : Math.max(14, Math.round(seg * 1.4))
  const radial = Math.max(8, Math.round(seg * 0.8))
  const seed = profile.id === 'zeynep' ? 3 : 7
  // ---- Where the features sit ------------------------------------------
  // Every one of these is measured against the head's ACTUAL surface at that
  // height rather than typed in. The old hand-picked depths had been tuned once
  // against an older skull and never moved: the lips ended up standing a
  // centimetre off the face and the eyebrows were buried inside it.
  const place = useMemo(() => {
    const faceZ = (y: number, x = 0) => surfaceZAtHeight(profile, R, y, x)
    const eyeY = 0.005
    // Corneal apex level with the orbital rim — where a real eye sits.
    const eyeZ = faceZ(eyeY, profile.eyes.spacing) - profile.eyes.size * 1.045 + 0.0015
    const mouthY = -0.0565
    // Lips protrude about 4 mm from the maxilla, and the lower one sits exactly
    // where the upper one ends, so the two can never drift into a gap.
    const lipTopZ = faceZ(mouthY) + 0.004 - 0.0092 - lp.upper * 0.82
    const lipBotY = mouthY - lp.upper - (lp.lower - 0.0022)
    const lipBotZ = faceZ(lipBotY) + 0.0032 - 0.0098 - lp.lower * 0.95
    const browY = eyeY + profile.brows.lift
    return {
      eyeY,
      eyeZ,
      mouthY,
      lipTop: new THREE.Vector3(0, mouthY, lipTopZ),
      lipBot: new THREE.Vector3(0, lipBotY, lipBotZ),
      eyeL: new THREE.Vector3(-profile.eyes.spacing, eyeY, eyeZ),
      eyeR: new THREE.Vector3(profile.eyes.spacing, eyeY, eyeZ),
      browY,
      // Sitting ON the brow ridge, not floating in front of it or buried in it.
      browZ: faceZ(browY, profile.eyes.spacing * 0.7) - profile.brows.thickness * 0.35,
      // The ear attaches where the skull's own surface is, at ear height.
      earX: headSurface(profile, R, new THREE.Vector3(1, -0.04, -0.12)).x - 0.002,
      // Same normalisation buildNose() uses; when these two disagree the
      // nostrils end up somewhere that is not the base of the nose.
      noseBaseY: -0.0455 * (profile.nose.length / 0.0775),
    }
  }, [profile, lp.upper, lp.lower])
  const JAW_AT = useMemo(() => new THREE.Vector3(0, 0.01, -0.028), [])

  const geom = useMemo(() => {
    const head = buildHeadGeometry(profile, R, headSeg, seed)
    const nose = projectHeadUv(buildNose(profile, Math.max(10, radial)), new THREE.Vector3())
    const earScale = profile.face.length
    const earRad = Math.max(5, Math.round(radial * 0.5))
    // Ears are built per side rather than mirrored by a negative scale, so each
    // one can be UV-projected into the face texture from where it actually sits.
    const ear = ([-1, 1] as const).map((side) => {
      const at = new THREE.Vector3(side * place.earX, -0.004, -0.014)
      return {
        side,
        helix: projectHeadUv(buildHelix(earScale, earRad, side), at),
        anti: detail
          ? projectHeadUv(buildAntihelix(earScale, Math.max(4, Math.round(radial * 0.4)), side), at)
          : null,
      }
    })
    const b = profile.brows
    const brow = buildBrow(b.length, b.thickness, b.arch, Math.max(5, Math.round(radial * 0.45)))
    return { head, nose, ear, brow }
  }, [profile, headSeg, radial, seed, detail, place.earX])

  // three builds a mesh's morph-influence array in the Mesh constructor, and
  // R3F attaches the geometry afterwards — so without this the renderer finds
  // morph attributes with no influences behind them and throws on every frame.
  useEffect(() => {
    head.current?.updateMorphTargets()
  }, [geom])

  useEffect(
    () => () => {
      geom.head.dispose()
      geom.nose.dispose()
      geom.brow.dispose()
      geom.ear.forEach((e) => { e.helix.dispose(); e.anti?.dispose() })
    },
    [geom],
  )

  return (
    <group>
      {/* ---- The skull, as one surface ------------------------------------ */}
      <mesh ref={head} geometry={geom.head} castShadow receiveShadow>
        <meshStandardMaterial {...skin} />
      </mesh>
      {/* Facial hair lives in the SKIN TEXTURE now — a darker albedo, a
          rougher surface and a stipple in the normal map. The shell of extra
          geometry it used to be was a per-vertex alpha mask at the head mesh's
          own resolution, so its edges came out as a ragged blotch across the
          chin and it laid a near-black veil over the mouth. A texture has the
          resolution the mask actually needs. (A LONG beard has no volume this
          way; that is a real limitation, not a finished feature.) */}

      {/* ---- Eyes ---------------------------------------------------------- */}
      <group position={place.eyeL.toArray()} rotation={[0, 0, profile.eyes.tilt]}>
        <Eye ref={eyeL} profile={profile} side={-1} seg={seg} detail={detail} skin={skin} at={place.eyeL} />
      </group>
      <group position={place.eyeR.toArray()} rotation={[0, 0, -profile.eyes.tilt]}>
        <Eye ref={eyeR} profile={profile} side={1} seg={seg} detail={detail} skin={skin} at={place.eyeR} />
      </group>

      {/* ---- Eyebrows ------------------------------------------------------
          ONE tapering arch each: thick at the head by the nose, peaking two
          thirds out, thinning to a point at the tail. The three capsules this
          replaces had a uniform thickness apiece and three silhouettes, which
          is why they read as black slabs stuck above the eyes. */}
      {(['L', 'R'] as const).map((side) => {
        const s = side === 'L' ? -1 : 1
        const b = profile.brows
        return (
          <group
            key={side}
            ref={side === 'L' ? browL : browR}
            position={[s * profile.eyes.spacing * 0.7, place.browY, place.browZ]}
            scale={[s, 1, 1]}
          >
            <mesh geometry={geom.brow}>
              <meshStandardMaterial color={b.color} roughness={0.92} metalness={0} />
            </mesh>
          </group>
        )
      })}

      {/* ---- Nose ----------------------------------------------------------
          One swept surface: keeled at the bridge, rounding at the tip, tucking
          back into the cheek at the alar base. The nostrils are recesses under
          the tip, not dots on the front. */}
      <group>
        <mesh geometry={geom.nose} castShadow>
          <meshStandardMaterial {...skin} />
        </mesh>
        {/* Two openings on the UNDERSIDE, angled down and back, with the
            columella standing between them — one wide recess across the base
            reads as a slot cut in a wedge, which is what it looked like. */}
        {([-1, 1] as const).map((s) => (
          <mesh
            key={s}
            position={[s * profile.nose.nostrilWidth * 0.78, place.noseBaseY + 0.0034, 0.0858]}
            rotation={[1.38, s * 0.34, s * 0.16]}
            scale={[0.8, 1, 0.34]}
          >
            <sphereGeometry args={[0.0026, 10, 8]} />
            <meshStandardMaterial color="#432721" roughness={0.96} />
          </mesh>
        ))}
        <mesh position={[0, place.noseBaseY + 0.003, 0.0888]} scale={[0.38, 0.8, 0.6]}>
          <sphereGeometry args={[0.0052, 10, 8]} />
          <meshStandardMaterial {...skin} />
        </mesh>
      </group>

      {/* The mouth itself is in the head mesh: two lip rolls with a crease
          between them, put there by displacement fields, with the vermilion
          painted into the skin texture where a boundary that sharp belongs.
          There is nothing here to draw. */}

      {/* ---- Jaw (hinged) -------------------------------------------------- */}
      <group ref={jaw} position={JAW_AT.toArray()}>
        {/* the dark of the mouth, so an open jaw is not a hole to the skull */}
        <mesh position={[0, -0.068, 0.076]} scale={[1, 0.42, 0.42]}>
          <sphereGeometry args={[0.02, seg, seg]} />
          <meshStandardMaterial color="#3a1c1a" roughness={0.95} />
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
      </group>

      {/* ---- Ears ----------------------------------------------------------
          Helix, antihelix, concha, tragus and lobe. An ear is the part people
          never look at directly and always notice when it is a blob. */}
      {geom.ear.map((e) => (
        <group
          key={e.side}
          position={[e.side * place.earX, -0.004, -0.014]}
          rotation={[0.05, e.side * 0.3, e.side * 0.07]}
        >
          <mesh geometry={e.helix} castShadow>
            <meshStandardMaterial {...skin} />
          </mesh>
          {e.anti && (
            <mesh geometry={e.anti}>
              <meshStandardMaterial {...skin} />
            </mesh>
          )}
          {/* concha — the hollow that leads to the canal */}
          <mesh position={[e.side * 0.004, -0.002, 0.001]} scale={[0.26, 0.7, 0.48]}>
            <sphereGeometry args={[0.0165, seg, seg]} />
            <meshStandardMaterial {...darkSkin} roughness={0.8} />
          </mesh>
          {/* tragus — the small flap in front of the canal */}
          {detail && (
            <mesh position={[e.side * 0.002, -0.005, 0.0092]} scale={[0.4, 0.9, 0.5]}>
              <sphereGeometry args={[0.005, seg, seg]} />
              <meshStandardMaterial {...plainSkin} />
            </mesh>
          )}
          {/* lobe */}
          <mesh position={[e.side * 0.0012, -0.0235, 0.0015]} scale={[0.36, 0.8, 0.6]}>
            <sphereGeometry args={[0.0102, seg, seg]} />
            <meshStandardMaterial {...plainSkin} />
          </mesh>
        </group>
      ))}
    </group>
  )
})
