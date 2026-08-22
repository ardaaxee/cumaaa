import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { AvatarProfile } from '../../config/appearance'
import { RIG } from './looks'
import { buildClump, hairline, type Clump, type ClumpSpec, type Skull } from './geometry/hair'
import { hairCardSurface } from '../../systems/materials/hair'

const R = RIG.headRadius

// Hair as CARDS that grow out of the scalp.
//
// Each clump starts somewhere on the skull, lies against it while it is still
// on the head, and only then falls away — and each is a strip carrying a
// texture of individual strands with an alpha channel, so its edge is strands
// fading out rather than the hard rounded outline a tube has. That outline is
// the whole reason the previous hair read as a moulded plastic wig: it was
// correct in layout and wrong in kind.
//
// Every clump is its own group, rooted where it grows, so it can SWING. Hair
// that is welded to the skull is the other half of the wig problem.

export interface HairRig {
  /** The whole mass, so it can lag behind the head. */
  root: THREE.Group | null
  /** One group per clump, each rooted where it grows. */
  clumps: THREE.Group[]
  /** How far each clump's tip hangs — how much it should swing. */
  reach: number[]
}

// The skull is not a ball: narrow across, taller than deep. Hair has to follow
// that or it stands off the sides of the head.
const SKULL: Skull = { x: 0.7, y: 1.0, z: 0.87, r: R }

function specsFor(p: AvatarProfile, detail: boolean): ClumpSpec[] {
  const h = p.hair
  const V = h.volume
  const out: ClumpSpec[] = []

  if (h.style === 'short-crop') {
    // A crop covers the whole skull, but the HAIRLINE is not a circle: it sits
    // high on the forehead and runs well down at the nape.
    const n = detail ? 26 : 16
    for (let i = 0; i < n; i++) {
      const az = (i / n) * Math.PI * 2
      out.push({
        az,
        phi0: 0.02 + (i % 3) * 0.07,
        phiEnd: hairline(az),
        fall: h.length,
        out: 0.003,
        width: 0.03 * V,
        taper: 0.35,
        wave: h.wave,
        seed: i * 1.7,
      })
    }
    // A second, shorter layer inside the first, so the crop has depth rather
    // than being one shell.
    for (let i = 0; i < Math.round(n * 0.6); i++) {
      const az = ((i + 0.5) / (n * 0.6)) * Math.PI * 2
      out.push({
        az,
        phi0: 0.06,
        phiEnd: hairline(az) * 0.78,
        fall: h.length * 0.6,
        out: 0.001,
        width: 0.026 * V,
        taper: 0.4,
        wave: h.wave,
        seed: 40 + i * 2.3,
      })
    }
    return out
  }

  // ---- Long hair ----------------------------------------------------------
  // The crown first. Without a ring of cards rooted at the very top, the scalp
  // shows through as a smooth dome exactly where a parting would be.
  const crown = detail ? 14 : 8
  for (let i = 0; i < crown; i++) {
    const az = (i / crown) * Math.PI * 2
    out.push({
      az,
      phi0: 0.02,
      phiEnd: 0.72 + Math.sin(i * 1.7) * 0.14,
      // No free fall at the crown: the kink where a card leaves the skull
      // becomes a spike when it has barely any length to fall.
      fall: 0,
      out: 0.001,
      width: 0.034 * V,
      taper: 0.3,
      wave: h.wave * 0.5,
      seed: 120 + i * 1.3,
    })
  }
  // Back mass: the length. Wraps well down the skull before falling.
  const back = detail ? 22 : 12
  for (let i = 0; i < back; i++) {
    const az = Math.PI - 1.35 + (i / (back - 1)) * 2.7
    const fall = h.length * (0.76 + 0.32 * Math.sin(i * 1.27 + 0.4))
    out.push({
      az,
      phi0: 0.24 + (i % 2) * 0.1,
      phiEnd: 1.62,
      fall,
      out: 0.02 * V,
      width: 0.042 * V,
      taper: 0.45,
      wave: h.wave,
      seed: i * 2.1,
    })
  }
  // An inner layer, shorter and tighter to the head, so the mass is not a
  // single curtain seen edge-on.
  const inner = detail ? 12 : 7
  for (let i = 0; i < inner; i++) {
    const az = Math.PI - 1.1 + (i / (inner - 1)) * 2.2
    out.push({
      az,
      phi0: 0.16,
      phiEnd: 1.5,
      fall: h.length * 0.55,
      out: 0.006 * V,
      width: 0.036 * V,
      taper: 0.4,
      wave: h.wave * 0.8,
      seed: 70 + i * 1.6,
    })
  }
  // Locks that frame the face: down past the ear, in front of the shoulder.
  // Kept clear of the cheeks so they never cross the face.
  for (const s of [-1, 1] as const) {
    const n = detail ? 5 : 3
    for (let i = 0; i < n; i++) {
      out.push({
        az: s * (1.0 + i * 0.16),
        phi0: 0.38,
        phiEnd: 1.46 + i * 0.04,
        fall: h.length * (0.46 + i * 0.1),
        out: 0.007 * V,
        width: 0.03 * V,
        taper: 0.5,
        wave: h.wave,
        seed: s * (3 + i) * 1.9,
      })
    }
  }
  if (h.fringe) {
    // Across the forehead and swept to one side. It stops at the brow — hair
    // over the eyes is a bug, not a hairstyle.
    const n = detail ? 9 : 5
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1)
      out.push({
        az: -0.78 + t * 1.6,
        phi0: 0.22,
        phiEnd: 0.82 + t * 0.18 + Math.sin(i * 2.3) * 0.04,
        // Stops above the brow. A fringe that reaches the eyes is a bug.
        fall: 0.004 + Math.abs(Math.sin(i * 1.9)) * 0.011,
        out: 0.003,
        width: 0.026 * V,
        taper: 0.45,
        wave: h.wave,
        seed: 10 + i * 1.4,
      })
    }
  }
  return out
}

export const Hair = forwardRef<HairRig, { profile: AvatarProfile; seg: number; detail: boolean }>(
  function Hair({ profile, seg, detail }, ref) {
    const root = useRef<THREE.Group>(null)
    const groups = useRef<THREE.Group[]>([])
    const h = profile.hair

    // Two or three cards per clump, fanned and twisted against each other, all
    // merged into ONE geometry per clump: a clump is the unit that moves, so it
    // is also the unit that should be drawn.
    const built = useMemo(() => {
      if (h.style === 'bald') return [] as Clump[]
      const layers = detail ? 3 : 2
      return specsFor(profile, detail).map((spec) => buildClump(SKULL, spec, layers))
    }, [profile, detail, h.style])

    // One material for all of them. Declaring it in JSX gave every card its own
    // material and its own shader program.
    const card = hairCardSurface(h.base, h.tips, h.wave)
    const material = useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          map: card.map,
          normalMap: detail ? card.normalMap : undefined,
          normalScale: new THREE.Vector2(0.7, 0.7),
          roughnessMap: card.roughnessMap,
          roughness: 1,
          metalness: 0.04,
          side: THREE.DoubleSide,
          transparent: true,
          // Alpha TEST, not blend: blended hair needs back-to-front sorting
          // that never survives a head turn.
          alphaTest: 0.24,
          depthWrite: true,
        }),
      [card, detail],
    )

    useEffect(() => () => { built.forEach((c) => c.geo.dispose()); material.dispose() }, [built, material])

    useImperativeHandle(ref, () => ({
      get root() { return root.current },
      get clumps() { return groups.current },
      get reach() { return built.map((c) => c.reach) },
    }))

    if (h.style === 'bald') return <group ref={root} />

    return (
      <group ref={root}>
        {/* Scalp. Tilted back so the hairline sits above the brow at the front
            and further down at the nape, the way hair actually grows. It is
            opaque, so no card ever shows skin through it. */}
        {/* It must sit INSIDE the cards. At R*1.03 scaled [0.72,1.02,0.9] it was
            outside them, so the whole back of the head rendered as a smooth
            dome with the hair only visible below it. */}
        {/* No tilt: the hairline's shape comes from the cards now, and tilting
            this back pushed its rear out THROUGH them, which is why the back of
            the head kept rendering as a bare dome. */}
        <mesh position={[0, 0.002, -0.004]} scale={[0.7, 0.98, 0.87]}>
          <sphereGeometry args={[R * 1.0, seg * 2, seg * 2, 0, Math.PI * 2, 0, 1.5]} />
          <meshStandardMaterial color={h.base} roughness={0.78} metalness={0.05} />
        </mesh>
        {built.map((c, i) => (
          <group
            key={i}
            ref={(g) => { if (g) groups.current[i] = g }}
            position={[c.root.x, c.root.y, c.root.z]}
          >
            <mesh geometry={c.geo} material={material} castShadow />
          </group>
        ))}
      </group>
    )
  },
)
