import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCollider } from '../../furniture/useCollider'
import { useOpenable } from '../../../systems/world'
import { CeilingLamp, Plant } from '../props'
import { WindowDaylight } from '../Window'
import { Panel } from '../../furniture/Panel'

const CAB = '#c9c4ba' // matte cabinet
const STONE = '#3a3d42' // dark stone counter
const METAL = '#c9ccd0'

// The fridge opens for real: the door swings on its hinge, a cold interior
// light comes up, and what is inside is only built while it is open. The open
// state lives in the SHARED world, so if CUMA opens it ZEYNEP sees it standing
// open — and it is still open when either of them comes back.
function Fridge() {
  const open = useOpenable('kitchen-fridge')
  const door = useRef<THREE.Group>(null)
  const swing = useRef(0)

  useFrame((_, delta) => {
    const target = open ? -1.95 : 0 // radians; opens toward the room
    swing.current += (target - swing.current) * Math.min(1, delta * 7)
    if (door.current) door.current.rotation.y = swing.current
  })

  return (
    <group position={[9.0, 0, 12.6]}>
      {/* carcass */}
      <Panel args={[0.78, 2, 0.76]} radius={0.02} position={[0, 1, -0.02]} receiveShadow>
        <meshStandardMaterial color="#c8ccd0" metalness={0.45} roughness={0.4} />
      </Panel>
      {/* interior — only built while the door is open */}
      {open && (
        <group position={[0, 1, 0]}>
          <mesh position={[0, 0, -0.02]}>
            <boxGeometry args={[0.68, 1.84, 0.62]} />
            <meshStandardMaterial color="#e8edf0" roughness={0.55} />
          </mesh>
          {[-0.55, -0.1, 0.36].map((y, i) => (
            <mesh key={i} position={[0, y, 0]}>
              <boxGeometry args={[0.66, 0.02, 0.6]} />
              <meshPhysicalMaterial color="#dfe8ec" transparent opacity={0.5} roughness={0.15} transmission={0.5} thickness={0.02} />
            </mesh>
          ))}
          {/* what is actually in it */}
          <mesh position={[-0.18, -0.44, 0.04]}>
            <cylinderGeometry args={[0.045, 0.045, 0.2, 12]} />
            <meshStandardMaterial color="#8fb6d8" roughness={0.3} />
          </mesh>
          <mesh position={[-0.04, -0.44, 0.04]}>
            <cylinderGeometry args={[0.04, 0.04, 0.18, 12]} />
            <meshStandardMaterial color="#eceae2" roughness={0.5} />
          </mesh>
          <mesh position={[0.16, 0.02, 0.02]}>
            <boxGeometry args={[0.16, 0.1, 0.14]} />
            <meshStandardMaterial color="#c9a04a" roughness={0.6} />
          </mesh>
          {[[-0.2, 0.06], [-0.08, 0.44], [0.12, 0.46]].map(([x, y], i) => (
            <mesh key={i} position={[x, y, -0.06]}>
              <sphereGeometry args={[0.05, 10, 10]} />
              <meshStandardMaterial color={['#b8474a', '#7ba24c', '#d8952f'][i]} roughness={0.65} />
            </mesh>
          ))}
          <pointLight position={[0, 0.3, 0.1]} color="#dff0ff" intensity={0.5} distance={2.2} decay={2} />
        </group>
      )}
      {/* door, hinged on its left edge */}
      <group ref={door} position={[-0.39, 1, 0.34]}>
        <Panel args={[0.78, 1.98, 0.07]} radius={0.02} position={[0.39, 0, 0]} castShadow>
          <meshStandardMaterial color="#d0d3d6" metalness={0.5} roughness={0.35} />
        </Panel>
        <mesh position={[0.72, 0.4, 0.06]}>
          <boxGeometry args={[0.03, 0.5, 0.03]} />
          <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.72, -0.4, 0.06]}>
          <boxGeometry args={[0.03, 0.5, 0.03]} />
          <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </group>
  )
}

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
        <Panel args={[5.4, 0.8, 0.6]} radius={0.012} position={[0, 0.44, 0]} receiveShadow>
          <meshStandardMaterial color={CAB} roughness={0.6} metalness={0.05} />
        </Panel>
        {/* toe kick (recessed plinth) */}
        <mesh position={[0, 0.02, -0.04]}>
          <boxGeometry args={[5.36, 0.08, 0.52]} />
          <meshStandardMaterial color="#8e8a82" roughness={0.8} />
        </mesh>
        {/* cabinet door seams */}
        {[-2.1, -1.4, -0.7, 0.7, 1.4, 2.1].map((x, i) => (
          <group key={i}>
            <Panel args={[0.64, 0.7, 0.022]} radius={0.008} position={[x, 0.44, 0.306]}>
              <meshStandardMaterial color="#d2cdc3" roughness={0.58} metalness={0.04} />
            </Panel>
            <mesh position={[x + 0.26, 0.44, 0.325]}>
              <cylinderGeometry args={[0.008, 0.008, 0.16, 8]} />
              <meshStandardMaterial color="#b0aa9c" metalness={0.8} roughness={0.3} />
            </mesh>
          </group>
        ))}
        {/* stone counter top */}
        <Panel args={[5.5, 0.06, 0.66]} radius={0.012} position={[0, 0.87, 0]} receiveShadow>
          <meshStandardMaterial color={STONE} roughness={0.35} metalness={0.1} />
        </Panel>
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
      <Panel args={[2.4, 0.6, 0.34]} radius={0.012} position={[3.0, 1.75, 13.72]}>
        <meshStandardMaterial color={CAB} roughness={0.6} />
      </Panel>
      {/* upper cabinet doors */}
      {[2.4, 3.6].map((x, i) => (
        <group key={i}>
          <Panel args={[1.12, 0.54, 0.022]} radius={0.008} position={[x, 1.75, 13.556]}>
            <meshStandardMaterial color="#d2cdc3" roughness={0.58} />
          </Panel>
          <mesh position={[x + (i ? -0.48 : 0.48), 1.62, 13.538]}>
            <cylinderGeometry args={[0.008, 0.008, 0.14, 8]} />
            <meshStandardMaterial color="#b0aa9c" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      ))}

      <Fridge />

      {/* dining set */}
      <group position={[4.6, 0, 8.6]}>
        <Panel args={[1.3, 0.055, 0.85]} radius={0.016} position={[0, 0.72, 0]} receiveShadow>
          <meshStandardMaterial color="#5a4632" roughness={0.5} />
        </Panel>
        {[[-0.55, -0.32], [0.55, -0.32], [-0.55, 0.32], [0.55, 0.32]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.36, z]}>
            <boxGeometry args={[0.06, 0.72, 0.06]} />
            <meshStandardMaterial color="#4a3826" roughness={0.5} />
          </mesh>
        ))}
        {/* two chairs */}
        {[[-0.1, 0.7, 0], [0.2, -0.7, Math.PI]].map(([x, z, ry], i) => (
          <group key={i} position={[x, 0, z]} rotation={[0, ry as number, 0]}>
            <Panel args={[0.42, 0.05, 0.42]} radius={0.014} position={[0, 0.45, 0]}>
              <meshStandardMaterial color="#5a4632" roughness={0.55} />
            </Panel>
            <Panel args={[0.42, 0.5, 0.05]} radius={0.018} position={[0, 0.7, -0.19]} rotation={[0.06, 0, 0]}>
              <meshStandardMaterial color="#5a4632" roughness={0.55} />
            </Panel>
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
