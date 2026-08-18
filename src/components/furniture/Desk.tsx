import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ANCHORS } from '../../config/roomLayout'
import { useCollider } from './useCollider'
import { MonitorScreen } from './MonitorScreen'

const WOOD = '#5a4432'
const METAL = '#2a2d33'

// The main workstation: desk, three monitors, keyboard, mouse, headphones,
// PC tower with a breathing fan light, mug, papers and a cable.
export function Desk() {
  const [dx, , dz] = ANCHORS.desk.pos
  const fan = useRef<THREE.PointLight>(null)
  const keyGlow = useRef<THREE.MeshStandardMaterial>(null)

  useCollider('desk', [dx, 0, dz], [3.3, 1.5, 0.95])
  useCollider('pc-tower', [dx + 1.85, 0, dz], [0.5, 1, 0.9])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (fan.current) fan.current.intensity = 0.28 + Math.sin(t * 2.4) * 0.08
    if (keyGlow.current) keyGlow.current.emissiveIntensity = 0.22 + Math.sin(t * 1.6 + 1) * 0.08
  })

  return (
    <group position={[dx, 0, dz]}>
      {/* Desk top */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.06, 0.85]} />
        <meshStandardMaterial color={WOOD} roughness={0.55} metalness={0.1} />
      </mesh>
      {/* Legs */}
      {[
        [-1.5, -0.35],
        [1.5, -0.35],
        [-1.5, 0.35],
        [1.5, 0.35],
      ].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.375, lz]} castShadow>
          <boxGeometry args={[0.08, 0.75, 0.08]} />
          <meshStandardMaterial color={METAL} roughness={0.4} metalness={0.7} />
        </mesh>
      ))}
      {/* Desk cross-brace (structural, no neon) */}
      <mesh position={[0, 0.2, 0.35]}>
        <boxGeometry args={[3.0, 0.04, 0.03]} />
        <meshStandardMaterial color={METAL} roughness={0.5} metalness={0.6} />
      </mesh>

      {/* Center monitor (wide) */}
      <group position={[0, 1.36, -0.28]}>
        <mesh castShadow>
          <boxGeometry args={[1.5, 0.62, 0.05]} />
          <meshStandardMaterial color="#0a0c10" roughness={0.4} metalness={0.5} />
        </mesh>
        <MonitorScreen width={1.42} height={0.54} position={[0, 0, 0.03]} variant="code" />
        <mesh position={[0, -0.42, 0.1]}>
          <cylinderGeometry args={[0.04, 0.06, 0.24, 8]} />
          <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.54, 0.14]}>
          <boxGeometry args={[0.3, 0.03, 0.2]} />
          <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* Left monitor (angled) */}
      <group position={[-1.02, 1.32, -0.12]} rotation={[0, 0.5, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.86, 0.54, 0.04]} />
          <meshStandardMaterial color="#0a0c10" roughness={0.4} metalness={0.5} />
        </mesh>
        <MonitorScreen width={0.8} height={0.48} position={[0, 0, 0.03]} variant="graph" />
      </group>

      {/* Right monitor (angled) */}
      <group position={[1.02, 1.32, -0.12]} rotation={[0, -0.5, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.86, 0.54, 0.04]} />
          <meshStandardMaterial color="#0a0c10" roughness={0.4} metalness={0.5} />
        </mesh>
        <MonitorScreen width={0.8} height={0.48} position={[0, 0, 0.03]} variant="grid" />
      </group>

      {/* Keyboard — dark keys with a restrained backlight */}
      <mesh position={[0, 0.785, 0.2]} castShadow>
        <boxGeometry args={[0.62, 0.02, 0.18]} />
        <meshStandardMaterial color="#15161a" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.798, 0.2]}>
        <boxGeometry args={[0.58, 0.006, 0.15]} />
        <meshStandardMaterial
          ref={keyGlow}
          color="#0e1014"
          emissive="#9fb3d8"
          emissiveIntensity={0.22}
          roughness={0.5}
        />
      </mesh>
      {/* Mousepad */}
      <mesh position={[0.42, 0.771, 0.22]}>
        <boxGeometry args={[0.28, 0.004, 0.22]} />
        <meshStandardMaterial color="#1a1a1e" roughness={0.9} />
      </mesh>
      {/* Mouse */}
      <mesh position={[0.45, 0.79, 0.22]} castShadow>
        <boxGeometry args={[0.08, 0.03, 0.12]} />
        <meshStandardMaterial color="#12161c" roughness={0.4} />
      </mesh>

      {/* Headphones on a stand */}
      <group position={[-1.35, 0.78, 0.15]}>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.24, 8]} />
          <meshStandardMaterial color={METAL} metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.26, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.09, 0.02, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#181c22" roughness={0.5} />
        </mesh>
        <mesh position={[-0.08, 0.22, 0]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#12161c" roughness={0.5} />
        </mesh>
        <mesh position={[0.08, 0.22, 0]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#12161c" roughness={0.5} />
        </mesh>
      </group>

      {/* Coffee mug */}
      <group position={[0.9, 0.82, 0.2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.05, 0.045, 0.1, 14]} />
          <meshStandardMaterial color="#c9d3dd" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 14]} />
          <meshStandardMaterial color="#4a2c1a" roughness={0.6} />
        </mesh>
      </group>

      {/* Sticky note papers */}
      <mesh position={[-0.7, 0.785, 0.28]} rotation={[-Math.PI / 2, 0, 0.2]}>
        <planeGeometry args={[0.12, 0.12]} />
        <meshStandardMaterial color="#e8d97a" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* PC tower + breathing fan light */}
      <group position={[1.85, 0.5, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.45, 1, 0.85]} />
          <meshStandardMaterial color="#0d1117" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* Tempered-glass side panel with a restrained interior glow */}
        <mesh position={[-0.226, 0, 0]}>
          <planeGeometry args={[0.72, 0.82]} />
          <meshPhysicalMaterial
            color="#0a0d12"
            roughness={0.08}
            metalness={0}
            transmission={0.55}
            transparent
            opacity={0.5}
            thickness={0.02}
          />
        </mesh>
        {/* Internal component glow (single warm-cool accent, dim) */}
        <mesh position={[-0.2, -0.1, 0]}>
          <boxGeometry args={[0.02, 0.5, 0.5]} />
          <meshStandardMaterial color="#12304a" emissive="#3a6fa0" emissiveIntensity={0.3} />
        </mesh>
        <pointLight ref={fan} position={[-0.4, 0, 0]} color="#6a9bcf" distance={1.8} intensity={0.28} />
      </group>

      {/* Cables draped behind the desk (power + display + peripherals) */}
      {[
        { x: 1.35, rot: 0.32, len: 0.72, c: '#0a0a0c' },
        { x: 1.5, rot: 0.2, len: 0.62, c: '#161616' },
        { x: -1.2, rot: -0.25, len: 0.5, c: '#0a0a0c' },
      ].map((cb, i) => (
        <mesh key={i} position={[cb.x, 0.4, 0.34]} rotation={[0, 0, cb.rot]}>
          <cylinderGeometry args={[0.012, 0.012, cb.len, 6]} />
          <meshStandardMaterial color={cb.c} roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}
