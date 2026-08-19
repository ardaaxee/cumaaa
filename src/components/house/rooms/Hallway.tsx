import { useCollider } from '../../furniture/useCollider'
import { CeilingLamp, Rug, Plant, FramedArt, SwitchSocket } from '../props'

// Entrance hall — shoe rack, coat hooks with a jacket, a console with a key
// dish and mirror, a runner rug and a doormat. Kept narrow-clear for walking.
export function Hallway() {
  useCollider('hall-console', [1.28, 0, 12.2], [0.5, 0.9, 1.0])
  useCollider('hall-shoerack', [-1.28, 0, 7.4], [0.4, 0.5, 1.0])

  return (
    <group>
      <CeilingLamp position={[0, 2.58, 8]} color="#ffdcae" intensity={0.5} />
      <CeilingLamp position={[0, 2.58, 12]} color="#ffdcae" intensity={0.4} />
      <Rug position={[0, 0.02, 10]} size={[1.2, 5.0]} color="#5a4a3a" />

      {/* Doormat by the study door */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 6.6]} receiveShadow>
        <planeGeometry args={[1.0, 0.6]} />
        <meshStandardMaterial color="#3a352c" roughness={0.98} />
      </mesh>

      {/* Console table + key dish + mirror (east side) */}
      <group position={[1.32, 0, 12.2]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.0, 0.06, 0.34]} />
          <meshStandardMaterial color="#4a3826" roughness={0.55} />
        </mesh>
        {[[-0.42, -0.12], [0.42, -0.12], [-0.42, 0.12], [0.42, 0.12]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.2, z]}>
            <boxGeometry args={[0.04, 0.42, 0.04]} />
            <meshStandardMaterial color="#2a2d33" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
        {/* key dish */}
        <mesh position={[0.2, 0.47, 0]}>
          <cylinderGeometry args={[0.07, 0.06, 0.02, 16]} />
          <meshStandardMaterial color="#b7a98e" roughness={0.4} />
        </mesh>
        {/* mirror above (on the wall) */}
        <mesh position={[0, 1.4, -0.18]}>
          <boxGeometry args={[0.5, 0.8, 0.03]} />
          <meshStandardMaterial color="#2a241c" roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.4, -0.16]}>
          <planeGeometry args={[0.42, 0.72]} />
          <meshStandardMaterial color="#8fa0a8" metalness={0.9} roughness={0.08} envMapIntensity={1} />
        </mesh>
      </group>

      {/* Shoe rack + shoes (west side) */}
      <group position={[-1.32, 0, 7.4]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.0, 0.48, 0.34]} />
          <meshStandardMaterial color="#4a3826" roughness={0.6} />
        </mesh>
        {[-0.28, 0.02, 0.3].map((x, i) => (
          <mesh key={i} position={[x, 0.53, 0]} rotation={[0, i * 0.2, 0]} castShadow>
            <boxGeometry args={[0.12, 0.06, 0.26]} />
            <meshStandardMaterial color={['#2a2018', '#4a4038', '#1a1a1e'][i]} roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* Coat hooks + a hanging jacket near the study door */}
      <group position={[-1.28, 1.6, 6.9]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[0.7, 0.12, 0.03]} />
          <meshStandardMaterial color="#3a2c1c" roughness={0.6} />
        </mesh>
        {[-0.22, 0, 0.22].map((x, i) => (
          <mesh key={i} position={[x, -0.04, 0.04]}>
            <cylinderGeometry args={[0.012, 0.012, 0.08, 6]} />
            <meshStandardMaterial color="#8a8e93" metalness={0.7} roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[-0.22, -0.4, 0.06]} castShadow>
          <boxGeometry args={[0.34, 0.7, 0.12]} />
          <meshStandardMaterial color="#3a4656" roughness={0.9} />
        </mesh>
      </group>

      <Plant position={[1.15, 0, 6.9]} scale={0.7} />
      <FramedArt position={[-1.46, 1.6, 11]} rotation={[0, Math.PI / 2, 0]} w={0.4} h={0.55} tone={['#7a5a4a', '#2e2a24', '#a88a5c']} />
      <SwitchSocket position={[-1.46, 1.1, 6.7]} rotation={[0, Math.PI / 2, 0]} />
    </group>
  )
}
