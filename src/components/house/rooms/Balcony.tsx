import { useEffect } from 'react'
import { registerCollider, unregisterCollider } from '../../../systems/collisionSystem'
import { woodFloor } from '../../../utils/textures'
import { useMemo } from 'react'
import { Plant } from '../props'
import { WindowDaylight } from '../Window'
import { Exterior } from '../Exterior'
import { BALCONY as B } from '../../../config/houseLayout'

// An open balcony off the living room: decking, railing, a bistro set and
// planters. Railings double as colliders so you can't walk off the edge.
export function Balcony() {
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
      {/* Real surroundings beyond the railings: a wide view west plus the two
          open side views, all following the local time-of-day. */}
      <group position={[B.minX - 0.3, 1.6, cz]} rotation={[0, -Math.PI / 2, 0]}>
        <Exterior w={4.6} h={3.4} seed={4242} detail={1} />
      </group>
      <group position={[cx, 1.6, B.minZ - 0.3]} rotation={[0, Math.PI, 0]}>
        <Exterior w={2.8} h={3.4} seed={733} detail={0} />
      </group>
      <group position={[cx, 1.6, B.maxZ + 0.3]} rotation={[0, 0, 0]}>
        <Exterior w={2.8} h={3.4} seed={915} detail={0} />
      </group>

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

      {/* bistro set */}
      <group position={[cx - 0.3, 0, cz]}>
        <mesh position={[0, 0.7, 0]} castShadow>
          <cylinderGeometry args={[0.32, 0.3, 0.05, 20]} />
          <meshStandardMaterial color="#5a5d62" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.03, 0.05, 0.7, 10]} />
          <meshStandardMaterial color="#4a4d52" metalness={0.5} roughness={0.5} />
        </mesh>
        {[-0.55, 0.55].map((x, i) => (
          <group key={i} position={[x, 0, i ? 0.2 : -0.2]}>
            <mesh position={[0, 0.42, 0]} castShadow>
              <boxGeometry args={[0.36, 0.04, 0.36]} />
              <meshStandardMaterial color="#5a5d62" metalness={0.4} roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.66, -0.16]}>
              <boxGeometry args={[0.36, 0.4, 0.04]} />
              <meshStandardMaterial color="#5a5d62" metalness={0.4} roughness={0.5} />
            </mesh>
          </group>
        ))}
      </group>

      {/* planters */}
      <Plant position={[B.minX + 0.5, 0, B.minZ + 0.5]} scale={0.7} />
      <Plant position={[B.minX + 0.5, 0, B.maxZ - 0.5]} scale={0.55} />

      {/* small outdoor wall lamp */}
      <mesh position={[B.maxX - 0.1, 1.9, cz]}>
        <boxGeometry args={[0.1, 0.18, 0.12]} />
        <meshStandardMaterial color="#2a2d33" emissive="#ffdcae" emissiveIntensity={0.4} roughness={0.5} />
      </mesh>
      <pointLight position={[B.maxX - 0.3, 1.9, cz]} color="#ffcf9a" intensity={0.25} distance={4} decay={2} />
    </group>
  )
}
