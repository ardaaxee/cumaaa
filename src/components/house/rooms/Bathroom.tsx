import { useCollider } from '../../furniture/useCollider'
import { CeilingLamp } from '../props'

const CERAMIC = '#e6e3dc'
const METAL = '#c9ccd0'

// Bathroom — vanity + sink + mirror, toilet, a glass shower enclosure. Ceramic,
// glass and metal with a cool-neutral light. Small and tidy but used (a towel).
export function Bathroom() {
  useCollider('bath-vanity', [2.6, 0, 18.6], [1.4, 0.9, 0.5])
  useCollider('bath-toilet', [5.1, 0, 15.0], [0.6, 0.8, 0.7])
  useCollider('bath-shower', [4.5, 0, 17.6], [1.6, 2, 2.2])

  return (
    <group>
      <CeilingLamp position={[3.5, 2.48, 16.5]} color="#eef1f4" intensity={0.75} shade="#f0f2f5" />

      {/* Vanity + sink + mirror on the north wall */}
      <group position={[2.6, 0, 18.62]}>
        <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.3, 0.84, 0.46]} />
          <meshStandardMaterial color="#8a7a66" roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.87, 0]} castShadow>
          <boxGeometry args={[1.34, 0.06, 0.5]} />
          <meshStandardMaterial color="#3a3d42" roughness={0.35} metalness={0.1} />
        </mesh>
        {/* basin */}
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.19, 0.14, 0.12, 20]} />
          <meshStandardMaterial color={CERAMIC} roughness={0.2} metalness={0.05} />
        </mesh>
        <mesh position={[0, 0.98, -0.16]}>
          <cylinderGeometry args={[0.02, 0.02, 0.16, 8]} />
          <meshStandardMaterial color={METAL} metalness={0.9} roughness={0.2} />
        </mesh>
        {/* mirror */}
        <mesh position={[0, 1.6, 0.22]}>
          <boxGeometry args={[0.9, 0.7, 0.03]} />
          <meshStandardMaterial color="#20242a" roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.6, 0.238]}>
          <planeGeometry args={[0.82, 0.62]} />
          <meshStandardMaterial color="#9aa8b0" metalness={0.9} roughness={0.06} envMapIntensity={1.2} />
        </mesh>
        {/* toothbrush cup + soap */}
        <mesh position={[0.4, 0.95, 0.05]}>
          <cylinderGeometry args={[0.03, 0.03, 0.09, 10]} />
          <meshStandardMaterial color="#cfe0e6" roughness={0.3} />
        </mesh>
        <mesh position={[-0.42, 0.9, 0.05]}>
          <boxGeometry args={[0.08, 0.03, 0.05]} />
          <meshStandardMaterial color="#d8c7a0" roughness={0.5} />
        </mesh>
      </group>

      {/* Toilet on the east wall */}
      <group position={[5.15, 0, 15.0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.36, 0.4, 0.5]} />
          <meshStandardMaterial color={CERAMIC} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.42, 0.05]}>
          <cylinderGeometry args={[0.2, 0.18, 0.08, 20]} />
          <meshStandardMaterial color={CERAMIC} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.55, -0.24]}>
          <boxGeometry args={[0.34, 0.5, 0.14]} />
          <meshStandardMaterial color={CERAMIC} roughness={0.25} />
        </mesh>
      </group>

      {/* Glass shower enclosure (back-right corner) */}
      <group position={[4.5, 0, 17.6]}>
        {/* tray */}
        <mesh position={[0, 0.05, 0]} receiveShadow>
          <boxGeometry args={[1.5, 0.1, 2.0]} />
          <meshStandardMaterial color="#d8d5cd" roughness={0.4} />
        </mesh>
        {/* glass panels */}
        <mesh position={[-0.75, 1.1, 0]}>
          <boxGeometry args={[0.03, 2.0, 2.0]} />
          <meshPhysicalMaterial color="#cfe0e6" transparent opacity={0.16} roughness={0.03} transmission={0.7} thickness={0.02} />
        </mesh>
        <mesh position={[0, 1.1, -1.0]}>
          <boxGeometry args={[1.5, 2.0, 0.03]} />
          <meshPhysicalMaterial color="#cfe0e6" transparent opacity={0.16} roughness={0.03} transmission={0.7} thickness={0.02} />
        </mesh>
        {/* shower head + rail */}
        <mesh position={[0.5, 1.9, 0.7]}>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
          <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0.5, 1.78, 0.55]} rotation={[Math.PI / 4, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.03, 16]} />
          <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.25} />
        </mesh>
      </group>

      {/* Towel rail + towel + bath mat */}
      <mesh position={[1.6, 1.3, 16.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.7, 8]} />
        <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[1.63, 1.1, 16.5]}>
        <boxGeometry args={[0.04, 0.5, 0.36]} />
        <meshStandardMaterial color="#b7c2c6" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.6, 0.02, 17.6]} receiveShadow>
        <planeGeometry args={[0.9, 0.6]} />
        <meshStandardMaterial color="#8a9296" roughness={0.98} />
      </mesh>
    </group>
  )
}
