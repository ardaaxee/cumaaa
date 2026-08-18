import { ANCHORS } from '../../config/roomLayout'
import { useCollider } from './useCollider'

// Bed in the back-right corner. Interactive (rest / quick profile), collider set.
export function Bed() {
  const [x, , z] = ANCHORS.bed.pos
  useCollider('bed', [x, 0, z], [1.5, 0.6, 2.2])

  return (
    <group position={[x, 0, z]}>
      {/* Frame */}
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.28, 2.2]} />
        <meshStandardMaterial color="#241a12" roughness={0.7} />
      </mesh>
      {/* Mattress */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[1.42, 0.18, 2.1]} />
        <meshStandardMaterial color="#2c3440" roughness={0.85} />
      </mesh>
      {/* Duvet */}
      <mesh position={[0, 0.5, 0.25]} castShadow>
        <boxGeometry args={[1.44, 0.12, 1.5]} />
        <meshStandardMaterial color="#1a2530" roughness={0.9} />
      </mesh>
      {/* Pillow */}
      <mesh position={[0, 0.54, -0.8]} castShadow>
        <boxGeometry args={[1.2, 0.14, 0.4]} />
        <meshStandardMaterial color="#3a4553" roughness={0.9} />
      </mesh>
      {/* Headboard */}
      <mesh position={[0, 0.7, -1.06]} castShadow>
        <boxGeometry args={[1.5, 0.9, 0.1]} />
        <meshStandardMaterial color="#1c130c" roughness={0.75} />
      </mesh>
      {/* Under-bed accent glow */}
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[1.52, 0.02, 2.22]} />
        <meshStandardMaterial color="#0b2b33" emissive="#39d4e6" emissiveIntensity={0.25} />
      </mesh>
    </group>
  )
}
