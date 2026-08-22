import { useEffect } from 'react'
import { registerCollider, unregisterCollider } from '../../../systems/collisionSystem'
import { woodFloor } from '../../../utils/textures'
import { useMemo } from 'react'
import { Plant } from '../props'
import { WindowDaylight } from '../Window'
import { BALCONY as B } from '../../../config/houseLayout'
import { useTimeOfDay } from '../../../hooks/useClock'

// An open balcony off the living room: decking, railing, a bistro set and
// planters. Railings double as colliders so you can't walk off the edge.
export function Balcony() {
  const tod = useTimeOfDay()
  const dark = tod !== 'day'
  const deck = useMemo(() => woodFloor(), [])
  const cx = (B.minX + B.maxX) / 2
  const cz = (B.minZ + B.maxZ) / 2

  useEffect(() => {
    registerCollider('balc-w', [B.minX, 0, cz], [0.1, 1.2, B.maxZ - B.minZ])
    registerCollider('balc-s', [cx, 0, B.minZ], [B.maxX - B.minX, 1.2, 0.1])
    registerCollider('balc-n', [cx, 0, B.maxZ], [B.maxX - B.minX, 1.2, 0.1])
    return () => ['balc-w', 'balc-s', 'balc-n'].forEach(unregisterCollider)
  }, [cx, cz])

  const rails: { p: [number, number, number]; s: [number, number, number] }[] = [
    { p: [B.minX + 0.03, 0.55, cz], s: [0.06, 1.1, B.maxZ - B.minZ] },
    { p: [cx, 0.55, B.minZ + 0.03], s: [B.maxX - B.minX, 1.1, 0.06] },
    { p: [cx, 0.55, B.maxZ - 0.03], s: [B.maxX - B.minX, 1.1, 0.06] },
  ]

  return (
    <group>
      {/* The surroundings are real geometry now (see exterior/Neighbourhood):
          a street below with pavements, trees, lamps and parked cars, our own
          facade dropping away beneath the railing, and a block opposite. The
          flat backdrop panels that used to stand here are what made the view
          read as painted scenery. */}

      {/* Open-air daylight on the balcony */}
      <WindowDaylight position={[cx, 1.8, cz]} />

      {/* decking */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.02, cz]} receiveShadow>
        <planeGeometry args={[B.maxX - B.minX, B.maxZ - B.minZ]} />
        <meshStandardMaterial color="#4a3c2c" map={deck.map} normalMap={deck.normalMap} roughness={0.85} />
      </mesh>

      {/* glass + metal railing */}
      {rails.map((r, i) => (
        <group key={i}>
          <mesh position={[r.p[0], 1.05, r.p[2]]}>
            <boxGeometry args={[r.s[0] === 0.06 ? 0.05 : r.s[0], 0.05, r.s[2] === 0.06 ? 0.05 : r.s[2]]} />
            <meshStandardMaterial color="#3a3d42" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[r.p[0], 0.55, r.p[2]]}>
            <boxGeometry args={[r.s[0] === 0.06 ? 0.03 : r.s[0] - 0.2, 0.9, r.s[2] === 0.06 ? 0.03 : r.s[2] - 0.2]} />
            <meshPhysicalMaterial color="#bcd0d8" transparent opacity={0.14} roughness={0.05} transmission={0.7} thickness={0.02} />
          </mesh>
        </group>
      ))}

      {/* Outdoor dining table for four */}
      <group position={[cx - 0.25, 0, cz - 1.6]}>
        <mesh position={[0, 0.73, 0]} castShadow>
          <boxGeometry args={[1.42, 0.055, 0.82]} />
          <meshStandardMaterial color="#6a625a" roughness={0.6} />
        </mesh>
        {[[-0.62, -0.32], [0.62, -0.32], [-0.62, 0.32], [0.62, 0.32]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.365, z]}>
            <cylinderGeometry args={[0.028, 0.032, 0.73, 8]} />
            <meshStandardMaterial color="#4a4741" metalness={0.35} roughness={0.6} />
          </mesh>
        ))}
        {[
          [-0.52, -0.78, 0],
          [0.52, -0.78, 0],
          [-0.52, 0.78, Math.PI],
          [0.52, 0.78, Math.PI],
        ].map(([x, z, ry], i) => (
          <group key={i} position={[x as number, 0, z as number]} rotation={[0, ry as number, 0]}>
            <mesh position={[0, 0.44, 0]} castShadow>
              <boxGeometry args={[0.42, 0.05, 0.42]} />
              <meshStandardMaterial color="#5f5b54" roughness={0.65} />
            </mesh>
            <mesh position={[0, 0.7, -0.19]} rotation={[-0.12, 0, 0]}>
              <boxGeometry args={[0.42, 0.46, 0.05]} />
              <meshStandardMaterial color="#5f5b54" roughness={0.65} />
            </mesh>
            {[[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]].map(([lx, lz], j) => (
              <mesh key={j} position={[lx, 0.22, lz]}>
                <cylinderGeometry args={[0.02, 0.02, 0.44, 8]} />
                <meshStandardMaterial color="#4a4741" metalness={0.35} roughness={0.6} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* Outdoor rug under the seating, so the deck isn't one flat run */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx - 0.25, 0.03, cz - 1.6]} receiveShadow>
        <planeGeometry args={[2.1, 1.5]} />
        <meshStandardMaterial color="#6a6152" roughness={0.97} />
      </mesh>

      {/* Lounge chair at the quiet end */}
      <group position={[cx - 0.35, 0, B.maxZ - 1.5]} rotation={[0, -0.35, 0]}>
        <mesh position={[0, 0.34, 0]} castShadow>
          <boxGeometry args={[0.72, 0.12, 1.5]} />
          <meshStandardMaterial color="#6d6a63" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[0.66, 0.12, 1.42]} />
          <meshStandardMaterial color="#8b8577" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.66, -0.62]} rotation={[-0.5, 0, 0]}>
          <boxGeometry args={[0.66, 0.1, 0.62]} />
          <meshStandardMaterial color="#8b8577" roughness={0.95} />
        </mesh>
        {[-0.3, 0.3].map((x) =>
          [-0.62, 0.62].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 0.14, z]}>
              <cylinderGeometry args={[0.025, 0.025, 0.28, 8]} />
              <meshStandardMaterial color="#4d4a45" metalness={0.4} roughness={0.6} />
            </mesh>
          )),
        )}
      </group>

      {/* Side table with a mug */}
      <group position={[B.minX + 0.75, 0, B.maxZ - 2.6]}>
        <mesh position={[0, 0.42, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.22, 0.04, 16]} />
          <meshStandardMaterial color="#5f5b54" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.21, 0]}>
          <cylinderGeometry args={[0.03, 0.05, 0.42, 10]} />
          <meshStandardMaterial color="#4a4741" metalness={0.4} roughness={0.6} />
        </mesh>
        <mesh position={[0.05, 0.49, 0.02]}>
          <cylinderGeometry args={[0.042, 0.038, 0.09, 14]} />
          <meshStandardMaterial color="#e6e2d8" roughness={0.35} />
        </mesh>
      </group>

      {/* Outdoor storage box against the wall */}
      <mesh position={[B.maxX - 0.45, 0.3, B.minZ + 1.1]} castShadow>
        <boxGeometry args={[0.7, 0.6, 1.5]} />
        <meshStandardMaterial color="#6b6a64" roughness={0.85} />
      </mesh>
      <mesh position={[B.maxX - 0.45, 0.62, B.minZ + 1.1]}>
        <boxGeometry args={[0.74, 0.06, 1.54]} />
        <meshStandardMaterial color="#5c5b56" roughness={0.8} />
      </mesh>

      {/* Big planters along the rail — the thing that makes a balcony a garden */}
      <Plant position={[B.minX + 0.55, 0, B.minZ + 0.7]} scale={0.95} />
      <Plant position={[B.minX + 0.55, 0, cz + 0.9]} scale={0.8} />
      <Plant position={[B.minX + 0.55, 0, B.maxZ - 0.6]} scale={1.05} />
      {[B.minZ + 0.7, cz + 0.9, B.maxZ - 0.6].map((z, i) => (
        <mesh key={i} position={[B.minX + 0.55, 0.17, z]} castShadow>
          <cylinderGeometry args={[0.28, 0.22, 0.34, 14]} />
          <meshStandardMaterial color={['#8a7a66', '#7d7468', '#8f8272'][i]} roughness={0.9} />
        </mesh>
      ))}

      {/* A string of small bulbs along the rail. They only light up once it is
          actually dark — left always-on and un-tonemapped they blew out into
          white dots in the middle of the afternoon. */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[B.minX + 0.12, 1.02, B.minZ + 0.7 + i * 1.1]}>
          <sphereGeometry args={[0.032, 8, 8]} />
          <meshStandardMaterial
            color={dark ? '#fff0d4' : '#cfc7b8'}
            emissive={dark ? '#ffdcae' : '#000000'}
            emissiveIntensity={dark ? 0.9 : 0}
            roughness={0.4}
          />
        </mesh>
      ))}

      {/* small outdoor wall lamp */}
      <mesh position={[B.maxX - 0.1, 1.9, cz]}>
        <boxGeometry args={[0.1, 0.18, 0.12]} />
        <meshStandardMaterial color="#2a2d33" emissive={dark ? '#ffdcae' : '#000000'} emissiveIntensity={dark ? 0.5 : 0} roughness={0.5} />
      </mesh>
      {dark && <pointLight position={[B.maxX - 0.3, 1.9, cz]} color="#ffcf9a" intensity={0.35} distance={5} decay={2} />}
    </group>
  )
}
