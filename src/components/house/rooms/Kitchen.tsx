import { useCollider } from '../../furniture/useCollider'
import { CeilingLamp, Plant } from '../props'
import { WindowDaylight } from '../Window'

const CAB = '#c9c4ba' // matte cabinet
const STONE = '#3a3d42' // dark stone counter
const METAL = '#c9ccd0'

// Kitchen — matte cabinets, a stone counter run with sink + cooktop + hood, a
// tall fridge, a small dining set. Neutral working light. Stone/metal/wood.
export function Kitchen() {
  useCollider('kit-counter', [4.4, 0, 13.4], [5.4, 0.9, 0.65])
  useCollider('kit-fridge', [9.0, 0, 12.6], [0.8, 2, 0.8])
  useCollider('kit-table', [4.6, 0, 8.6], [1.3, 0.75, 0.9])

  return (
    <group>
      <CeilingLamp position={[5.5, 2.58, 10]} color="#fff2df" intensity={1.3} shade="#e8e6e0" />
      <CeilingLamp position={[4.6, 2.58, 8.6]} color="#fff2df" intensity={0.85} shade="#e8e6e0" />
      {/* Daylight through the east window */}
      <WindowDaylight position={[8.85, 1.6, 8.4]} />

      {/* Counter run along the north wall (facing -Z) */}
      <group position={[4.4, 0, 13.55]}>
        {/* base cabinets */}
        <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
          <boxGeometry args={[5.4, 0.84, 0.6]} />
          <meshStandardMaterial color={CAB} roughness={0.6} metalness={0.05} />
        </mesh>
        {/* cabinet door seams */}
        {[-2.1, -1.4, -0.7, 0.7, 1.4, 2.1].map((x, i) => (
          <mesh key={i} position={[x, 0.42, 0.305]}>
            <boxGeometry args={[0.02, 0.7, 0.01]} />
            <meshStandardMaterial color="#b3aea4" roughness={0.6} />
          </mesh>
        ))}
        {/* stone counter top */}
        <mesh position={[0, 0.87, 0]} castShadow receiveShadow>
          <boxGeometry args={[5.5, 0.06, 0.66]} />
          <meshStandardMaterial color={STONE} roughness={0.35} metalness={0.1} />
        </mesh>
        {/* sink */}
        <mesh position={[-1.4, 0.86, 0]}>
          <boxGeometry args={[0.5, 0.04, 0.42]} />
          <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[-1.4, 0.86, -0.14]}>
          <cylinderGeometry args={[0.02, 0.02, 0.24, 8]} />
          <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.25} />
        </mesh>
        {/* cooktop + oven */}
        <mesh position={[1.3, 0.905, 0]}>
          <boxGeometry args={[0.62, 0.02, 0.5]} />
          <meshStandardMaterial color="#15161a" roughness={0.4} metalness={0.3} />
        </mesh>
        {[-0.14, 0.14].map((zx) =>
          [-0.14, 0.14].map((xx) => (
            <mesh key={`${zx}-${xx}`} position={[1.3 + xx, 0.915, zx]}>
              <torusGeometry args={[0.07, 0.008, 6, 16]} />
              <meshStandardMaterial color="#2a2a2e" roughness={0.5} />
            </mesh>
          )),
        )}
        {/* small appliances */}
        <mesh position={[2.2, 0.98, 0]} castShadow>
          <boxGeometry args={[0.32, 0.2, 0.28]} />
          <meshStandardMaterial color="#1a1a1e" roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh position={[-2.3, 0.98, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.08, 0.2, 12]} />
          <meshStandardMaterial color="#2a2d33" metalness={0.4} roughness={0.4} />
        </mesh>
        <mesh position={[-0.4, 0.95, 0.1]} rotation={[0, 0.3, 0]}>
          <boxGeometry args={[0.28, 0.02, 0.18]} />
          <meshStandardMaterial color="#8a6a4a" roughness={0.7} />
        </mesh>
      </group>

      {/* range hood */}
      <mesh position={[5.7, 1.7, 13.55]} castShadow>
        <boxGeometry args={[0.7, 0.3, 0.5]} />
        <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.35} />
      </mesh>

      {/* upper cabinets */}
      <mesh position={[3.0, 1.75, 13.72]} castShadow>
        <boxGeometry args={[2.4, 0.6, 0.34]} />
        <meshStandardMaterial color={CAB} roughness={0.6} />
      </mesh>

      {/* tall fridge (east wall) */}
      <group position={[9.0, 0, 12.6]}>
        <mesh position={[0, 1, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.78, 2, 0.76]} />
          <meshStandardMaterial color="#d0d3d6" metalness={0.5} roughness={0.35} />
        </mesh>
        <mesh position={[-0.4, 1.4, 0.02]}>
          <boxGeometry args={[0.03, 0.5, 0.02]} />
          <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[-0.4, 0.6, 0.02]}>
          <boxGeometry args={[0.03, 0.5, 0.02]} />
          <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* dining set */}
      <group position={[4.6, 0, 8.6]}>
        <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.3, 0.06, 0.85]} />
          <meshStandardMaterial color="#5a4632" roughness={0.5} />
        </mesh>
        {[[-0.55, -0.32], [0.55, -0.32], [-0.55, 0.32], [0.55, 0.32]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.36, z]}>
            <boxGeometry args={[0.06, 0.72, 0.06]} />
            <meshStandardMaterial color="#4a3826" roughness={0.5} />
          </mesh>
        ))}
        {/* two chairs */}
        {[[-0.1, 0.7, 0], [0.2, -0.7, Math.PI]].map(([x, z, ry], i) => (
          <group key={i} position={[x, 0, z]} rotation={[0, ry as number, 0]}>
            <mesh position={[0, 0.45, 0]} castShadow>
              <boxGeometry args={[0.42, 0.05, 0.42]} />
              <meshStandardMaterial color="#4a3826" roughness={0.55} />
            </mesh>
            <mesh position={[0, 0.7, -0.19]} castShadow>
              <boxGeometry args={[0.42, 0.5, 0.05]} />
              <meshStandardMaterial color="#4a3826" roughness={0.55} />
            </mesh>
            {[[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].map(([lx, lz], j) => (
              <mesh key={j} position={[lx, 0.22, lz]}>
                <boxGeometry args={[0.04, 0.45, 0.04]} />
                <meshStandardMaterial color="#3a2c1c" roughness={0.6} />
              </mesh>
            ))}
          </group>
        ))}
        {/* plates + fruit bowl on the table */}
        <mesh position={[0, 0.76, 0]}>
          <cylinderGeometry args={[0.16, 0.14, 0.04, 20]} />
          <meshStandardMaterial color="#b9b3a5" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial color="#b5642f" roughness={0.6} />
        </mesh>
      </group>

      <Plant position={[8.8, 0, 7.0]} scale={0.9} />
    </group>
  )
}
