import { forwardRef, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'
import type { AvatarProfile } from '../../config/appearance'

// One eye, built the way an eye is built: a ball in a socket, with lids that
// WRAP the ball rather than sitting in front of it, a lid margin thick enough
// to catch light, a wet line at the rim and a caruncle in the inner corner.
//
// The lids are spherical caps concentric with the eyeball, so they slide over
// its surface when they move instead of clipping through it. That is the whole
// reason a blink reads as a blink.

export interface EyeRig {
  eye: THREE.Group | null
  lidTop: THREE.Group | null
  lidBot: THREE.Group | null
}

export const Eye = forwardRef<
  EyeRig,
  { profile: AvatarProfile; side: -1 | 1; seg: number; detail: boolean; skin: Record<string, unknown> }
>(function Eye({ profile, side, seg, detail, skin }, ref) {
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
  const s = seg + 4

  return (
    <group>
      {/* ---- Eyeball ------------------------------------------------------ */}
      <group ref={eye}>
        <mesh>
          <sphereGeometry args={[R, s, s]} />
          {/* Sclera is never white: it is faintly warm and slightly shaded
              toward the corners. */}
          <meshStandardMaterial color="#efe9e2" roughness={0.3} metalness={0} />
        </mesh>

        {/* Iris, as a dome on the ball. A flat disc reads as a printed sticker. */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[R * 1.002, s, s, 0, Math.PI * 2, 0, 0.63]} />
          <meshStandardMaterial color={e.iris} roughness={0.22} metalness={0.04} />
        </mesh>
        {/* A darker limbal ring at the iris edge — every real iris has one, and
            it is most of what makes an eye look like an eye at a distance. */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[R * 1.004, s, s, 0, Math.PI * 2, 0.5, 0.14]} />
          <meshStandardMaterial color="#231610" roughness={0.3} />
        </mesh>
        {/* Fibres: a slightly lighter inner ring, so the iris is not one flat
            colour. */}
        {detail && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <sphereGeometry args={[R * 1.0035, s, s, 0, Math.PI * 2, 0.16, 0.24]} />
            <meshStandardMaterial color={lighten(e.iris, 0.22)} roughness={0.26} />
          </mesh>
        )}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[R * 1.006, s, s, 0, Math.PI * 2, 0, 0.26]} />
          <meshStandardMaterial color="#0d0a09" roughness={0.12} />
        </mesh>

        {/* Cornea: the clear bulge over the iris. It is what catches the light. */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[R * 1.055, s, s, 0, Math.PI * 2, 0, 0.66]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={0.14}
            roughness={0.015}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.015}
            depthWrite={false}
          />
        </mesh>
        {detail && (
          <mesh position={[side * -0.0035, 0.0048, R * 1.02]}>
            <sphereGeometry args={[0.0012, 6, 6]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} transparent opacity={0.55} />
          </mesh>
        )}
      </group>

      {/* ---- Lids ---------------------------------------------------------
          Concentric caps: they slide over the ball rather than through it. */}
      <group ref={lidTop} rotation={[0.42 + e.lidCover * 0.35, 0, 0]}>
        <mesh>
          <sphereGeometry args={[R * 1.09, s, seg, 0, Math.PI * 2, 0, 0.95]} />
          <meshStandardMaterial {...skin} side={THREE.DoubleSide} />
        </mesh>
        {/* Lid margin: the thickened rim of the eyelid. Without it a lid is a
            paper edge. */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, R * 0.66, R * 0.66]}>
          <torusGeometry args={[R * 0.79, R * 0.075, 5, detail ? 18 : 10]} />
          <meshStandardMaterial {...skin} />
        </mesh>
        {/* Wet line just inside the margin. */}
        {detail && (
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, R * 0.6, R * 0.72]}>
            <torusGeometry args={[R * 0.76, R * 0.028, 4, 16, Math.PI * 1.1]} />
            <meshStandardMaterial color="#c9a094" roughness={0.15} metalness={0.05} />
          </mesh>
        )}
        {detail && e.lashes && (
          <group>
            {Array.from({ length: 7 }).map((_, i) => {
              const t = (i / 6 - 0.5) * 1.5
              return (
                <mesh
                  key={i}
                  position={[Math.sin(t) * R * 0.78, R * 0.72, Math.cos(t) * R * 0.72]}
                  rotation={[-0.55, t, 0]}
                >
                  <capsuleGeometry args={[0.00055, R * 0.5, 1, 4]} />
                  <meshStandardMaterial color="#141010" roughness={0.85} />
                </mesh>
              )
            })}
          </group>
        )}
      </group>

      <group ref={lidBot} rotation={[-0.36, 0, 0]}>
        <mesh rotation={[Math.PI, 0, 0]}>
          <sphereGeometry args={[R * 1.075, s, seg, 0, Math.PI * 2, 0, 0.82]} />
          <meshStandardMaterial {...skin} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -R * 0.6, R * 0.68]}>
          <torusGeometry args={[R * 0.78, R * 0.055, 5, detail ? 16 : 10]} />
          <meshStandardMaterial {...skin} />
        </mesh>
      </group>

      {/* Caruncle: the pink corner by the nose. Small, but its absence is why
          eyes can look like they were dropped into holes. */}
      {detail && (
        <mesh position={[side * -R * 0.95, -R * 0.06, R * 0.42]} scale={[0.7, 1, 0.6]}>
          <sphereGeometry args={[R * 0.19, 8, 8]} />
          <meshStandardMaterial color="#c88f83" roughness={0.35} />
        </mesh>
      )}
    </group>
  )
})

function lighten(hex: string, amount: number): string {
  const c = new THREE.Color(hex)
  c.lerp(new THREE.Color('#c8a882'), amount)
  return `#${c.getHexString()}`
}
