import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCollider } from '../../furniture/useCollider'
import { useOpenable } from '../../../systems/world'
import { CeilingLamp, FramedArt, Plant } from '../props'
import { WindowDaylight } from '../Window'
import { Panel } from '../../furniture/Panel'
import { seeded, jitter } from '../../../systems/imperfections'

const CERAMIC = '#e6e3dc'
const METAL = '#c9ccd0'

// The family bathroom off the corridor: vanity + basin + mirror, toilet, a
// shower tray with glass, towels and bottles. Compact but genuinely furnished.
export function Bathroom2() {
  const cx = 12
  const cz = 23.2
  useCollider('b2-vanity', [10.7, 0, cz], [0.5, 0.9, 1.2])
  useCollider('b2-shower', [13.1, 0, 24.5], [1.6, 2, 1.8])

  return (
    <group>
      <CeilingLamp position={[cx, 2.48, cz]} color="#eef1f4" intensity={1.1} shade="#f0f2f5" />
      <WindowDaylight position={[13.6, 1.75, 23.2]} />

      {/* Vanity against the west wall, facing east */}
      <group position={[10.68, 0, cz]} rotation={[0, Math.PI / 2, 0]}>
        <Panel args={[1.2, 0.8, 0.44]} radius={0.014} position={[0, 0.44, 0]} receiveShadow>
          <meshStandardMaterial color="#8a7a66" roughness={0.55} />
        </Panel>
        {[0.3, 0.6].map((y, i) => (
          <group key={i}>
            <Panel args={[1.1, 0.24, 0.02]} radius={0.008} position={[0, y, 0.225]}>
              <meshStandardMaterial color="#96856f" roughness={0.55} />
            </Panel>
            <mesh position={[0, y, 0.243]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.008, 0.008, 0.2, 8]} />
              <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.3} />
            </mesh>
          </group>
        ))}
        <Panel args={[1.24, 0.06, 0.48]} radius={0.012} position={[0, 0.87, 0]}>
          <meshStandardMaterial color="#3a3d42" roughness={0.35} metalness={0.1} />
        </Panel>
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.17, 0.13, 0.11, 20]} />
          <meshStandardMaterial color={CERAMIC} roughness={0.2} metalness={0.05} />
        </mesh>
        <mesh position={[0, 0.98, -0.15]}>
          <cylinderGeometry args={[0.02, 0.02, 0.16, 8]} />
          <meshStandardMaterial color={METAL} metalness={0.9} roughness={0.2} />
        </mesh>
        {/* mirror + bottles */}
        <Panel args={[0.82, 0.64, 0.03]} radius={0.008} position={[0, 1.58, 0.2]}>
          <meshStandardMaterial color="#20242a" roughness={0.5} />
        </Panel>
        <mesh position={[0, 1.58, 0.218]}>
          <planeGeometry args={[0.74, 0.56]} />
          <meshStandardMaterial color="#9aa8b0" metalness={0.9} roughness={0.08} envMapIntensity={1.2} />
        </mesh>
        {[0, 1].map((i) => (
          <mesh key={i} position={[0.34 - i * 0.1, 0.96, 0.04]}>
            <cylinderGeometry args={[0.028, 0.028, 0.14 - i * 0.03, 12]} />
            <meshStandardMaterial color={i ? '#7fa3ab' : '#c4b09a'} roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* Shower tray + glass in the north corner */}
      <group position={[13.05, 0, 24.5]}>
        <mesh position={[0, 0.05, 0]} receiveShadow>
          <boxGeometry args={[1.5, 0.1, 1.6]} />
          <meshStandardMaterial color="#d8d5cd" roughness={0.4} />
        </mesh>
        <mesh position={[-0.75, 1.1, 0]}>
          <boxGeometry args={[0.03, 2.0, 1.6]} />
          <meshPhysicalMaterial color="#cfe0e6" transparent opacity={0.16} roughness={0.03} transmission={0.7} thickness={0.02} />
        </mesh>
        <mesh position={[0.5, 1.9, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
          <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0.5, 1.78, -0.14]} rotation={[Math.PI / 4, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.03, 16]} />
          <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.25} />
        </mesh>
      </group>

      {/* Toilet + towel rail */}
      <group position={[11.2, 0, 21.7]}>
        <Panel args={[0.36, 0.4, 0.5]} radius={0.05} position={[0, 0.2, 0]} receiveShadow>
          <meshStandardMaterial color={CERAMIC} roughness={0.25} />
        </Panel>
        <mesh position={[0, 0.42, 0.05]}>
          <cylinderGeometry args={[0.2, 0.18, 0.08, 20]} />
          <meshStandardMaterial color={CERAMIC} roughness={0.25} />
        </mesh>
        <Panel args={[0.34, 0.5, 0.14]} radius={0.03} position={[0, 0.55, -0.24]}>
          <meshStandardMaterial color={CERAMIC} roughness={0.25} />
        </Panel>
      </group>
      <Panel args={[0.045, 0.46, 0.32]} radius={0.014} position={[13.85, 1.15, 22.2]} rotation={[0, 0, 0.03]}>
        <meshStandardMaterial color="#b7c2c6" roughness={0.95} />
      </Panel>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[11.6, 0.02, 23.2]} receiveShadow>
        <planeGeometry args={[0.8, 0.55]} />
        <meshStandardMaterial color="#8a9296" roughness={0.98} />
      </mesh>
    </group>
  )
}

// The washer's porthole, hinged on its far edge so it swings clear of the
// machine. Opening reveals the drum rather than a flat disc.
function WasherDoor() {
  const open = useOpenable('laundry-washer')
  const door = useRef<THREE.Group>(null)
  const swing = useRef(0)

  useFrame((_, delta) => {
    swing.current += ((open ? 1 : 0) - swing.current) * Math.min(1, delta * 7)
    if (door.current) door.current.rotation.y = -swing.current * 2.0
  })

  return (
    <group>
      {open && (
        <mesh position={[0.26, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.17, 0.17, 0.34, 20, 1, true]} />
          <meshStandardMaterial color="#9aa3a8" metalness={0.5} roughness={0.45} side={THREE.DoubleSide} />
        </mesh>
      )}
      <group ref={door} position={[0.31, 0.5, -0.19]}>
        <mesh position={[0, 0, 0.19]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.19, 0.19, 0.03, 20]} />
          <meshStandardMaterial color="#2a2e33" metalness={0.4} roughness={0.35} />
        </mesh>
        <mesh position={[0.017, 0, 0.19]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.02, 20]} />
          <meshPhysicalMaterial color="#8fa2ab" transparent opacity={0.35} roughness={0.15} transmission={0.6} thickness={0.02} />
        </mesh>
      </group>
    </group>
  )
}

// Laundry / utility room: washer, dryer stack, a folding counter, a basket and
// a drying rack — the room that makes a house feel actually lived in.
export function Laundry() {
  const cx = 12
  const cz = 27.2
  useCollider('lau-machines', [10.9, 0, 26.4], [0.7, 1.6, 1.4])
  useCollider('lau-counter', [12.8, 0, 28.6], [2.2, 0.9, 0.6])

  return (
    <group>
      <CeilingLamp position={[cx, 2.3, cz]} color="#f2f4f6" intensity={1.05} shade="#eef0f2" />

      {/* Washer + dryer side by side against the west wall */}
      {[25.9, 26.9].map((z, i) => (
        <group key={i} position={[10.85, 0, z]}>
          <Panel args={[0.62, 0.85, 0.62]} radius={0.02} position={[0, 0.43, 0]} receiveShadow>
            <meshStandardMaterial color="#dcdfe2" metalness={0.35} roughness={0.4} />
          </Panel>
          {/* The washer's porthole opens for real; the dryer's is fixed. */}
          {i === 0 ? (
            <WasherDoor />
          ) : (
            <group>
              <mesh position={[0.315, 0.5, 0]} rotation={[0, Math.PI / 2, 0]}>
                <cylinderGeometry args={[0.19, 0.19, 0.03, 20]} />
                <meshStandardMaterial color="#2a2e33" metalness={0.4} roughness={0.35} />
              </mesh>
              <mesh position={[0.332, 0.5, 0]} rotation={[0, Math.PI / 2, 0]}>
                <cylinderGeometry args={[0.14, 0.14, 0.02, 20]} />
                <meshPhysicalMaterial color="#8fa2ab" transparent opacity={0.35} roughness={0.15} transmission={0.6} thickness={0.02} />
              </mesh>
            </group>
          )}
          {/* control panel */}
          <Panel args={[0.56, 0.1, 0.02]} radius={0.006} position={[0, 0.8, 0.3]}>
            <meshStandardMaterial color="#b9bec2" roughness={0.5} />
          </Panel>
        </group>
      ))}

      {/* Folding counter with detergent + a stack of towels */}
      <group position={[12.8, 0, 28.6]}>
        <Panel args={[2.2, 0.06, 0.55]} radius={0.012} position={[0, 0.9, 0]} receiveShadow>
          <meshStandardMaterial color="#8e8578" roughness={0.55} />
        </Panel>
        {[-0.8, 0.8].map((x, i) => (
          <mesh key={i} position={[x, 0.45, 0]}>
            <boxGeometry args={[0.06, 0.9, 0.5]} />
            <meshStandardMaterial color="#7d7568" roughness={0.6} />
          </mesh>
        ))}
        {[0, 1, 2].map((i) => {
          const r = seeded(`lautow${i}`)
          return (
            <Panel key={i} args={[0.3, 0.07, 0.24]} radius={0.02} position={[-0.55 + jitter(r, 0.03), 0.97 + i * 0.075, jitter(r, 0.03)]} rotation={[0, jitter(r, 0.1), 0]}>
              <meshStandardMaterial color={['#b7c2c6', '#c9c0ae', '#a8b0b4'][i]} roughness={0.95} />
            </Panel>
          )
        })}
        {[0, 1].map((i) => (
          <mesh key={i} position={[0.6 + i * 0.16, 1.02, 0.05]} castShadow>
            <boxGeometry args={[0.12, 0.2, 0.09]} />
            <meshStandardMaterial color={i ? '#5f86a8' : '#c98f5a'} roughness={0.45} />
          </mesh>
        ))}
      </group>

      {/* Laundry basket + drying rack */}
      <group position={[13.4, 0, 26.2]}>
        <mesh position={[0, 0.24, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.19, 0.48, 16]} />
          <meshStandardMaterial color="#9a8a6a" roughness={0.9} />
        </mesh>
        <Panel args={[0.24, 0.1, 0.22]} radius={0.03} position={[0.03, 0.5, 0]} rotation={[0, 0.3, 0.1]}>
          <meshStandardMaterial color="#7a8590" roughness={0.95} />
        </Panel>
      </group>
      <FramedArt position={[12, 1.7, 28.95]} rotation={[0, Math.PI, 0]} w={0.4} h={0.3} tone={['#7d8a80', '#2e2a24', '#b0a68c']} />
      <Plant position={[10.6, 0, 28.5]} scale={0.7} />
    </group>
  )
}

// The sleeping-wing corridor: a runner, a console with a lamp, and pictures —
// enough that it reads as a hallway in a home, not a connector tunnel.
export function Corridor() {
  return (
    <group>
      {/* Three fittings down a 16 m corridor — two left the west end in the dark */}
      <CeilingLamp position={[-4, 2.5, 23.5]} color="#ffdcae" intensity={1.0} />
      <CeilingLamp position={[1, 2.5, 23.5]} color="#ffdcae" intensity={1.0} />
      <CeilingLamp position={[6.5, 2.5, 23.5]} color="#ffdcae" intensity={0.9} />

      {/* runner rug down the corridor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2, 0.02, 23.5]} receiveShadow>
        <planeGeometry args={[13, 1.1]} />
        <meshStandardMaterial color="#4f4438" roughness={0.97} />
      </mesh>

      {/* console table with a lamp and a bowl */}
      <group position={[7.6, 0, 24.6]}>
        <Panel args={[1.1, 0.05, 0.34]} radius={0.012} position={[0, 0.78, 0]} receiveShadow>
          <meshStandardMaterial color="#5a4632" roughness={0.5} />
        </Panel>
        {[-0.48, 0.48].map((x, i) => (
          <mesh key={i} position={[x, 0.39, 0]}>
            <cylinderGeometry args={[0.02, 0.024, 0.78, 8]} />
            <meshStandardMaterial color="#3a2d22" roughness={0.6} />
          </mesh>
        ))}
        <mesh position={[-0.3, 0.92, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.16, 12]} />
          <meshStandardMaterial color="#d8cdba" emissive="#ffdcae" emissiveIntensity={0.4} roughness={0.7} />
        </mesh>
        <pointLight position={[-0.3, 0.96, 0]} color="#ffcf9a" intensity={0.22} distance={3} decay={2} />
        <mesh position={[0.3, 0.82, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 0.05, 18]} />
          <meshStandardMaterial color="#9aa39a" roughness={0.5} />
        </mesh>
      </group>

      <FramedArt position={[-1.5, 1.75, 24.85]} rotation={[0, Math.PI, 0]} w={0.5} h={0.62} tone={['#6b7c74', '#2e2a24', '#c9a06a']} />
      <FramedArt position={[0.6, 1.72, 24.85]} rotation={[0, Math.PI, 0]} w={0.4} h={0.5} tone={['#7a5a4a', '#2e2a24', '#a88a5c']} />
      <Plant position={[9.2, 0, 23.6]} scale={0.85} />
    </group>
  )
}
