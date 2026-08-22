import { useCollider } from '../../furniture/useCollider'

// Small storage off the kitchen — deliberately more cluttered than the rest of
// the house: metal shelving, cardboard/plastic boxes, a suitcase, cleaning
// supplies. One dim bare bulb.
export function Storage() {
  useCollider('store-shelf', [9.2, 0, 15.5], [0.5, 2, 2.6])

  return (
    <group>
      {/* bare bulb */}
      <mesh position={[7.75, 2.3, 15.5]}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshStandardMaterial color="#fff4e0" emissive="#ffdcae" emissiveIntensity={0.7} toneMapped={false} />
      </mesh>
      <pointLight position={[7.75, 2.25, 15.5]} color="#ffdcae" intensity={0.4} distance={5} decay={1.8} />

      {/* metal shelving on the east wall, boxes on it */}
      <group position={[9.2, 0, 15.5]}>
        {[0.4, 1.0, 1.6].map((y, r) => (
          <mesh key={r} position={[0, y, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.44, 0.03, 2.4]} />
            <meshStandardMaterial color="#6a6d72" metalness={0.5} roughness={0.5} />
          </mesh>
        ))}
        {[[0.45, -0.7], [0.5, 0.1], [1.05, -0.3], [1.1, 0.6], [1.65, -0.5]].map(([y, z], i) => (
          <mesh key={i} position={[-0.02, y as number, z as number]} rotation={[0, i * 0.2, 0]} castShadow>
            <boxGeometry args={[0.34, 0.28, 0.36]} />
            <meshStandardMaterial color={i % 2 ? '#8a7a5c' : '#7a8288'} roughness={0.85} />
          </mesh>
        ))}
      </group>

      {/* stacked boxes + suitcase on the floor */}
      <mesh position={[6.7, 0.22, 14.9]} rotation={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.44, 0.5]} />
        <meshStandardMaterial color="#8a7a5c" roughness={0.85} />
      </mesh>
      <mesh position={[6.75, 0.58, 14.95]} rotation={[0, -0.1, 0]} castShadow>
        <boxGeometry args={[0.44, 0.28, 0.44]} />
        <meshStandardMaterial color="#7a6a4c" roughness={0.85} />
      </mesh>
      <mesh position={[7.6, 0.2, 16.5]} rotation={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.6, 0.4, 0.24]} />
        <meshStandardMaterial color="#2a3038" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* broom leaning in the corner */}
      <mesh position={[6.3, 0.8, 16.7]} rotation={[0, 0, 0.18]}>
        <cylinderGeometry args={[0.015, 0.015, 1.5, 6]} />
        <meshStandardMaterial color="#8a6a4a" roughness={0.7} />
      </mesh>
    </group>
  )
}
