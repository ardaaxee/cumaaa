import { ANCHORS } from '../../config/roomLayout'
import { useCollider } from './useCollider'

const SEAT = '#15181e'
const FRAME = '#25292f'

// Ergonomic workstation chair (non-interactive prop).
export function Chair() {
  const [x, , z] = ANCHORS.chair.pos
  useCollider('chair', [x, 0, z], [0.7, 1, 0.7])

  return (
    <group position={[x, 0, z]} rotation={[0, Math.PI, 0]}>
      {/* Base star */}
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 0.28, 0.05, Math.sin(a) * 0.28]} rotation={[0, -a, 0]}>
            <boxGeometry args={[0.3, 0.04, 0.06]} />
            <meshStandardMaterial color={FRAME} metalness={0.6} roughness={0.4} />
          </mesh>
        )
      })}
      {/* Gas cylinder */}
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 10]} />
        <meshStandardMaterial color={FRAME} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Seat */}
      <mesh position={[0, 0.56, 0]} castShadow>
        <boxGeometry args={[0.52, 0.1, 0.5]} />
        <meshStandardMaterial color={SEAT} roughness={0.7} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.95, -0.24]} rotation={[-0.12, 0, 0]} castShadow>
        <boxGeometry args={[0.5, 0.7, 0.09]} />
        <meshStandardMaterial color={SEAT} roughness={0.7} />
      </mesh>
      {/* Accent edge on backrest */}
      <mesh position={[0, 0.95, -0.19]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[0.46, 0.66, 0.02]} />
        <meshStandardMaterial color="#0b2b33" emissive="#39d4e6" emissiveIntensity={0.3} />
      </mesh>
      {/* Armrests */}
      {[-0.31, 0.31].map((ax, i) => (
        <mesh key={i} position={[ax, 0.68, 0]} castShadow>
          <boxGeometry args={[0.06, 0.05, 0.32]} />
          <meshStandardMaterial color={FRAME} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}
