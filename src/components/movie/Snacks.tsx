import { useSnackTaken } from '../../systems/world'

// Shared movie-night snacks on the living-room coffee table. Each is a physical
// object that disappears for BOTH players once taken (SNACK_TAKEN world event).
// Positions match the snack interactables in config/interactables.ts.
export function Snacks() {
  return (
    <group>
      <Popcorn />
      <Chips />
      <Drink />
    </group>
  )
}

function Popcorn() {
  if (useSnackTaken('popcorn')) return null
  return (
    <group position={[-6.1, 0.47, 10.5]}>
      {/* striped bucket */}
      <mesh castShadow>
        <cylinderGeometry args={[0.08, 0.065, 0.14, 16]} />
        <meshStandardMaterial color="#c23b2f" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.001, 0]}>
        <cylinderGeometry args={[0.081, 0.066, 0.14, 16, 1, true, 0, Math.PI / 3]} />
        <meshStandardMaterial color="#eae6dd" roughness={0.7} side={2} />
      </mesh>
      {/* popped kernels heaped on top */}
      {[[0, 0.09, 0], [0.03, 0.1, 0.02], [-0.03, 0.1, -0.02], [0.02, 0.11, -0.03], [-0.02, 0.1, 0.03]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <dodecahedronGeometry args={[0.028, 0]} />
          <meshStandardMaterial color="#f3e6b8" roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

function Chips() {
  if (useSnackTaken('chips')) return null
  return (
    <group position={[-5.75, 0.5, 10.7]} rotation={[0, 0.3, 0.08]}>
      <mesh castShadow>
        <boxGeometry args={[0.14, 0.22, 0.05]} />
        <meshStandardMaterial color="#3f6f4a" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.02, 0.026]}>
        <planeGeometry args={[0.1, 0.09]} />
        <meshStandardMaterial color="#e7c65a" roughness={0.6} />
      </mesh>
    </group>
  )
}

function Drink() {
  if (useSnackTaken('drink')) return null
  return (
    <group position={[-5.4, 0.47, 10.5]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.045, 0.038, 0.15, 16]} />
        <meshStandardMaterial color="#d9d4ca" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.046, 0.046, 0.02, 16]} />
        <meshStandardMaterial color="#b23b3b" roughness={0.5} />
      </mesh>
      {/* straw */}
      <mesh position={[0.02, 0.12, 0]} rotation={[0, 0, 0.25]}>
        <cylinderGeometry args={[0.006, 0.006, 0.14, 8]} />
        <meshStandardMaterial color="#e8e8ea" roughness={0.4} />
      </mesh>
    </group>
  )
}
