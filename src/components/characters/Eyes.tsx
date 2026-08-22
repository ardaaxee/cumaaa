import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { AvatarProfile } from '../../config/appearance'
import { irisSurface, scleraSurface } from '../../systems/materials/eye'
import { buildTube } from './geometry/features'
import { buildLid } from './geometry/eyelid'
import { projectHeadUv } from '../../systems/materials/skin'

// One eye: a ball in a socket, with lids that WRAP the ball.
//
// The lids used to be spherical caps, and a cap can only cut a CIRCLE — so the
// opening was round, the sides of the eyeball were never covered, and every eye
// read as a ball resting on the face. Worse, the arithmetic was wrong: a 0.95
// rad cap tilted 0.53 rad forward covers straight ahead completely, so the
// "open" eye was a shut one with a lid-margin ring floating in front of it like
// a grille.
//
// Now the lids come from geometry/eyelid.ts, which builds the almond aperture a
// real fissure has, already in its neutral open pose. All the animator does is
// rotate them about the eye's centre from zero.

export { LID_TRAVEL as LID } from './geometry/eyelid'

/** Iris half-angle on the ball. */
export const IRIS_ANGLE = 0.63

export interface EyeRig {
  eye: THREE.Group | null
  lidTop: THREE.Group | null
  lidBot: THREE.Group | null
}

export const Eye = forwardRef<
  EyeRig,
  {
    profile: AvatarProfile
    side: -1 | 1
    seg: number
    detail: boolean
    /** Material for the lids. They sample the FACE texture, so they must be
        given the head-frame position of this eye to project their UVs from. */
    skin: Record<string, unknown>
    at: THREE.Vector3
  }
>(function Eye({ profile, side, seg, detail, skin, at }, ref) {
  const eye = useRef<THREE.Group>(null)
  const lidTop = useRef<THREE.Group>(null)
  const lidBot = useRef<THREE.Group>(null)

  useImperativeHandle(ref, () => ({
    get eye() { return eye.current },
    get lidTop() { return lidTop.current },
    get lidBot() { return lidBot.current },
  }))

  const e = profile.eyes
  const R = e.size
  const s = Math.max(12, seg + 6)
  const iris = irisSurface(e.iris)
  const sclera = scleraSurface()

  const lids = useMemo(() => {
    const cols = detail ? 22 : 12
    const rows = detail ? 7 : 4
    const top = buildLid(R, e.lidCover, true, cols, rows, side)
    const bot = buildLid(R, e.lidCover, false, cols, rows, side)
    // Lids are skin, and they have to be the SAME skin as the socket around
    // them. Projecting their UVs from the head's centre makes them sample the
    // eyelid region of the face texture — without it they were a flat, lighter
    // tone and every eye read as a pair of goggles.
    projectHeadUv(top.geo, at)
    projectHeadUv(bot.geo, at)
    return { top, bot }
  }, [R, e.lidCover, detail, side, at])

  // Lashes: a curved taper, not a straight bristle, seated on the actual margin
  // the lid geometry reports rather than at a guessed radius.
  const lash = useMemo(() => {
    if (!detail || !e.lashes) return null
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, R * 0.2, R * 0.1),
      new THREE.Vector3(0, R * 0.38, R * 0.26),
      new THREE.Vector3(0, R * 0.48, R * 0.46),
    ])
    return buildTube(curve, 5, 4, (t) => {
      const r = R * 0.03 * (1 - t * 0.88)
      return { h: r, d: r }
    }, new THREE.Vector3(1, 0, 0))
  }, [detail, e.lashes, R])

  useEffect(
    () => () => {
      lids.top.geo.dispose()
      lids.bot.geo.dispose()
      lash?.dispose()
    },
    [lids, lash],
  )

  // Nine lashes spread along the middle of the margin — the corners are bare.
  const lashSeats = useMemo(() => {
    if (!lash) return []
    const rim = lids.top.rim
    const out: { pos: [number, number, number]; rot: [number, number, number]; scale: number }[] = []
    for (let i = 0; i < 9; i++) {
      const t = 0.14 + (i / 8) * 0.72
      const seat = rim[Math.round(t * (rim.length - 1))]
      const k = Math.sin(t * Math.PI)
      out.push({
        pos: [seat.pos.x, seat.pos.y, seat.pos.z],
        // Lie along the outward normal of the margin, leaning up and away.
        rot: [Math.atan2(seat.out.z, seat.out.y) - 1.15, Math.atan2(seat.out.x, seat.out.z) * 0.6, 0],
        scale: 0.65 + k * 0.5,
      })
    }
    return out
  }, [lash, lids])

  return (
    <group>
      {/* ---- Eyeball ------------------------------------------------------ */}
      <group ref={eye}>
        <mesh>
          <sphereGeometry args={[R, s, s]} />
          <meshStandardMaterial
            map={sclera.map}
            roughnessMap={sclera.roughnessMap}
            roughness={1}
            metalness={0}
          />
        </mesh>

        {/* Iris, as a dome on the ball, carrying the whole structure — pupil,
            fibres, collarette, crypts and limbal ring — in one texture painted
            in the dome's own polar space. */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[R * 1.004, s, Math.max(10, Math.round(s * 0.7)), 0, Math.PI * 2, 0, IRIS_ANGLE]} />
          <meshStandardMaterial
            map={iris.map}
            normalMap={detail ? iris.normalMap : undefined}
            normalScale={new THREE.Vector2(0.55, 0.55)}
            roughnessMap={iris.roughnessMap}
            roughness={1}
            metalness={0.05}
          />
        </mesh>

        {/* Cornea: the clear bulge over the iris, and the only reason an eye
            catches light. Its specular IS the catchlight — there is no painted
            highlight sitting on top pretending to be one. */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[R * 1.045, s, Math.max(10, Math.round(s * 0.7)), 0, Math.PI * 2, 0, IRIS_ANGLE * 1.12]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={0.16}
            roughness={0.02}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.02}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* ---- Upper lid ----------------------------------------------------- */}
      <group ref={lidTop}>
        <mesh geometry={lids.top.geo} castShadow>
          <meshStandardMaterial {...skin} side={THREE.DoubleSide} />
        </mesh>
        {lash &&
          lashSeats.map((seat, i) => (
            <mesh key={i} geometry={lash} position={seat.pos} rotation={seat.rot} scale={[1, seat.scale, seat.scale]}>
              <meshStandardMaterial color="#120e0d" roughness={0.72} />
            </mesh>
          ))}
      </group>

      {/* ---- Lower lid ----------------------------------------------------- */}
      <group ref={lidBot}>
        <mesh geometry={lids.bot.geo}>
          <meshStandardMaterial {...skin} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Caruncle: the pink corner by the nose. Small, but its absence is why
          eyes can look like they were dropped into holes. */}
      {detail && (
        <mesh position={[side * -R * 0.92, -R * 0.12, R * 0.5]} scale={[0.55, 0.9, 0.5]}>
          <sphereGeometry args={[R * 0.2, 8, 8]} />
          <meshStandardMaterial color="#c2897d" roughness={0.32} />
        </mesh>
      )}
    </group>
  )
})
