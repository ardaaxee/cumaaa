import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { AvatarProfile } from '../../config/appearance'
import { RIG } from './looks'

const R = RIG.headRadius

// Hair as locks that GROW OUT OF THE SCALP.
//
// Each lock starts somewhere on the skull, wraps down over it while it is still
// against the head, and only then falls away — which is the difference between
// hair and tubes pointing outward from a ball. The first attempt swept every
// lock along a curve that ignored the skull entirely, and the result was a mass
// of fat horns sticking out sideways with the fringe hanging over the eyes.
//
// Positions are spherical on the skull: `az` is the angle round the head
// (0 = front, PI = back) and `phi` the angle down from the crown.

export interface HairRig {
  /** The whole mass, so it can lag behind the head instead of being welded. */
  root: THREE.Group | null
}

interface LockSpec {
  az: number
  /** Where on the crown it starts, radians from straight up. */
  phi0: number
  /** How far down the skull it stays attached before falling free. */
  phiEnd: number
  /** How far it falls once it leaves the head. */
  fall: number
  /** How far it drifts away from the head on the way down. */
  out: number
  radius: number
  seed: number
}

/**
 * How far down the skull hair grows at a given azimuth. High at the forehead,
 * lower at the temples, lowest at the nape — the shape of an actual hairline.
 */
function hairline(az: number): number {
  return 1.3 - 0.38 * Math.cos(az)
}

// The skull is not a ball: narrow across, taller than deep. Hair has to follow
// that or it stands off the sides of the head.
const SKULL = { x: 0.7, y: 1.0, z: 0.87 }

function onSkull(az: number, phi: number, swell: number): THREE.Vector3 {
  const s = Math.sin(phi) * R * swell
  return new THREE.Vector3(
    s * Math.sin(az) * SKULL.x,
    R * swell * Math.cos(phi) * SKULL.y,
    s * Math.cos(az) * SKULL.z,
  )
}

function lockCurve(l: LockSpec, wave: number): THREE.CatmullRomCurve3 {
  const pts: THREE.Vector3[] = []
  // Phase 1 — against the skull.
  const wrapSteps = 3
  for (let i = 0; i <= wrapSteps; i++) {
    const phi = l.phi0 + ((l.phiEnd - l.phi0) * i) / wrapSteps
    pts.push(onSkull(l.az, phi, 1.045))
  }
  // Phase 2 — falling free, waving as it goes.
  if (l.fall > 0.001) {
    const start = pts[pts.length - 1].clone()
    const radial = Math.hypot(start.x, start.z)
    const fallSteps = 4
    for (let i = 1; i <= fallSteps; i++) {
      const t = i / fallSteps
      // Waves both around the head and in and out from it, at different rates,
      // so a lock does not read as one bent tube.
      const swing = Math.sin(t * 2.6 + l.seed) * wave * 0.16
      const rad = radial + l.out * t * t + Math.sin(t * 4.1 + l.seed * 1.7) * wave * 0.013
      const a = l.az + swing
      pts.push(
        new THREE.Vector3(
          Math.sin(a) * rad,
          start.y - t * l.fall + Math.sin(t * 2.0 + l.seed) * wave * 0.008,
          Math.cos(a) * rad,
        ),
      )
    }
  }
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.35)
}

export const Hair = forwardRef<HairRig, { profile: AvatarProfile; seg: number; detail: boolean }>(
  function Hair({ profile, seg, detail }, ref) {
    const root = useRef<THREE.Group>(null)
    useImperativeHandle(ref, () => ({ get root() { return root.current } }))

    const h = profile.hair

    const built = useMemo(() => {
      if (h.style === 'bald') return { locks: [] as { geom: THREE.TubeGeometry; tip: boolean }[] }
      const specs: LockSpec[] = []
      const V = h.volume

      if (h.style === 'short-crop') {
        // A crop covers the whole skull, but the HAIRLINE is not a circle: it
        // sits high on the forehead and runs well down at the nape. Wrapping
        // every lock to the same depth put a bowl of hair over the eyes.
        for (let i = 0; i < 16; i++) {
          const az = (i / 16) * Math.PI * 2
          specs.push({
            az,
            phi0: 0.18,
            phiEnd: hairline(az),
            fall: h.length,
            out: 0.004,
            radius: 0.019 * V,
            seed: i * 1.7,
          })
        }
      } else {
        // Back mass: the length. Wraps well down the skull before falling, so
        // the back of the head is covered rather than fringed with tubes.
        const back = detail ? 11 : 7
        for (let i = 0; i < back; i++) {
          const az = Math.PI - 1.25 + (i / (back - 1)) * 2.5
          const fall = h.length * (0.78 + 0.3 * Math.sin(i * 1.27 + 0.4))
          specs.push({ az, phi0: 0.3, phiEnd: 1.62, fall, out: 0.02 * V, radius: 0.031 * V, seed: i * 2.1 })
        }
        // Locks that frame the face: down past the ear, in front of the
        // shoulder. Kept clear of the cheeks so they never cross the face.
        for (const s of [-1, 1]) {
          const n = detail ? 3 : 2
          for (let i = 0; i < n; i++) {
            specs.push({
              az: s * (1.12 + i * 0.2),
              phi0: 0.42,
              phiEnd: 1.5,
              fall: h.length * (0.5 + i * 0.13),
              out: 0.008 * V,
              radius: 0.023 * V,
              seed: s * (3 + i) * 1.9,
            })
          }
        }
        if (h.fringe) {
          // Across the forehead and swept to one side. It stops at the brow —
          // hair over the eyes is a bug, not a hairstyle.
          const n = detail ? 6 : 4
          for (let i = 0; i < n; i++) {
            const t = i / (n - 1)
            specs.push({
              az: -0.72 + t * 1.5,
              phi0: 0.26,
              phiEnd: 0.94 + t * 0.2 + Math.sin(i * 2.3) * 0.06,
              fall: 0.008 + Math.abs(Math.sin(i * 1.9)) * 0.022,
              out: 0.004,
              radius: 0.016 * V,
              seed: 10 + i * 1.4,
            })
          }
        }
      }

      const radial = detail ? 6 : 4
      const tubular = detail ? 12 : 7
      const locks = specs.map((l, i) => ({
        geom: new THREE.TubeGeometry(lockCurve(l, h.wave), tubular, l.radius, radial, false),
        tip: i % 3 === 0,
      }))
      return { locks }
    }, [h.style, h.length, h.wave, h.volume, h.fringe, detail])

    // The fine pass: thin strands lying ON the mass, following the same wraps so
    // they sit on the hair rather than flying off it. Pure surface detail, and
    // the first thing dropped when the tier cannot afford it.
    const strands = useMemo(() => {
      if (!detail || h.strands <= 0 || h.style === 'bald') return []
      const out: THREE.TubeGeometry[] = []
      const n = Math.min(h.strands, 18)
      for (let i = 0; i < n; i++) {
        const az = Math.PI - 1.5 + (i / (n - 1)) * 3.0
        const fall = h.length * (0.45 + 0.55 * (((i * 37) % 11) / 11))
        out.push(
          new THREE.TubeGeometry(
            lockCurve({ az, phi0: 0.34, phiEnd: 1.6, fall, out: 0.024, radius: 0.0028, seed: i * 0.9 }, h.wave * 1.35),
            10,
            0.0028,
            4,
            false,
          ),
        )
      }
      return out
    }, [h.strands, h.length, h.wave, h.style, detail])

    // Tube geometry is built by hand, so it has to be freed by hand.
    useEffect(() => {
      return () => {
        built.locks.forEach((l) => l.geom.dispose())
        strands.forEach((g) => g.dispose())
      }
    }, [built, strands])

    if (h.style === 'bald') return <group ref={root} />

    return (
      <group ref={root}>
        {/* Scalp. Tilted back so the hairline sits above the brow at the front
            and further down at the nape, the way hair actually grows. */}
        <mesh position={[0, 0.005, -0.012]} rotation={[-0.26, 0, 0]} scale={[0.72, 1.02, 0.9]}>
          <sphereGeometry args={[R * 1.05, seg * 2, seg * 2, 0, Math.PI * 2, 0, 1.22]} />
          <meshStandardMaterial color={h.base} roughness={0.8} metalness={0.04} />
        </mesh>
        {built.locks.map((l, i) => (
          <mesh key={i} geometry={l.geom} castShadow>
            <meshStandardMaterial color={l.tip ? h.tips : h.base} roughness={0.76} metalness={0.05} />
          </mesh>
        ))}
        {strands.map((g, i) => (
          <mesh key={`s${i}`} geometry={g}>
            <meshStandardMaterial color={i % 2 ? h.tips : h.base} roughness={0.68} metalness={0.06} />
          </mesh>
        ))}
      </group>
    )
  },
)
