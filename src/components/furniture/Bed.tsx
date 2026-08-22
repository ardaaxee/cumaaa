import { useMemo } from 'react'
import { ANCHORS } from '../../config/roomLayout'
import { useCollider } from './useCollider'
import { fabric } from '../../utils/textures'

// Bed in the back-right corner. Real cloth materials with slight irregularity so
// it reads as made-but-slept-in, not a geometric block.
export function Bed() {
  const [x, , z] = ANCHORS.bed.pos
  useCollider('bed', [x, 0, z], [1.5, 0.6, 2.2])

  const duvet = useMemo(() => fabric('#8c8072', 'duvet'), [])
  const sheet = useMemo(() => fabric('#b8b0a2', 'sheet'), [])
  const pillow = useMemo(() => fabric('#cfc7ba', 'pillow'), [])

  return (
    <group position={[x, 0, z]}>
      {/* Wooden frame */}
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.28, 2.2]} />
        <meshStandardMaterial color="#4a3826" roughness={0.7} metalness={0.05} />
      </mesh>
      {/* Mattress with fitted sheet */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[1.42, 0.18, 2.1]} />
        <meshStandardMaterial color="#b8b0a2" map={sheet.map} normalMap={sheet.normalMap} roughness={0.9} />
      </mesh>
      {/* Duvet, slightly rotated + offset for a natural look */}
      <mesh position={[0.03, 0.5, 0.28]} rotation={[0, 0.03, 0]} castShadow>
        <boxGeometry args={[1.44, 0.14, 1.46]} />
        <meshStandardMaterial color="#8c8072" map={duvet.map} normalMap={duvet.normalMap} roughness={0.92} />
      </mesh>
      {/* Folded duvet edge */}
      <mesh position={[0.03, 0.55, -0.42]} rotation={[0.12, 0.02, 0]} castShadow>
        <boxGeometry args={[1.44, 0.1, 0.34]} />
        <meshStandardMaterial color="#7a6f62" map={duvet.map} normalMap={duvet.normalMap} roughness={0.92} />
      </mesh>
      {/* Two pillows, tilted */}
      <mesh position={[-0.32, 0.56, -0.82]} rotation={[0, 0.12, 0.04]} castShadow>
        <boxGeometry args={[0.62, 0.14, 0.4]} />
        <meshStandardMaterial color="#cfc7ba" map={pillow.map} normalMap={pillow.normalMap} roughness={0.95} />
      </mesh>
      <mesh position={[0.34, 0.55, -0.8]} rotation={[0, -0.1, -0.03]} castShadow>
        <boxGeometry args={[0.62, 0.14, 0.4]} />
        <meshStandardMaterial color="#c6bdae" map={pillow.map} normalMap={pillow.normalMap} roughness={0.95} />
      </mesh>
      {/* Headboard */}
      <mesh position={[0, 0.7, -1.06]} castShadow>
        <boxGeometry args={[1.5, 0.9, 0.1]} />
        <meshStandardMaterial color="#3c2c1c" roughness={0.75} />
      </mesh>
      {/* Nightstand */}
      <group position={[0.95, 0, -0.9]}>
        <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.56, 0.4]} />
          <meshStandardMaterial color="#4a3826" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.5, 0.05]}>
          <boxGeometry args={[0.14, 0.02, 0.14]} />
          <meshStandardMaterial color="#2a2018" roughness={0.6} />
        </mesh>
        {/* small lamp */}
        <mesh position={[0, 0.62, 0]}>
          <cylinderGeometry args={[0.09, 0.11, 0.12, 12]} />
          <meshStandardMaterial color="#d8cdba" emissive="#ffdcae" emissiveIntensity={0.35} roughness={0.7} />
        </mesh>
      </group>
    </group>
  )
}
