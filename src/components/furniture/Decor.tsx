import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ANCHORS, HALF_W, HALF_D } from '../../config/roomLayout'
import { useCollider } from './useCollider'

// Assorted non-interactive set dressing: plant, desk lamp, speaker, a storage
// cabinet and a couple of boxes. Small ambient life via the lamp flicker.
export function Decor() {
  const [px, , pz] = ANCHORS.plant.pos
  const [lx, ly, lz] = ANCHORS.lamp.pos
  const [sx, sy, sz] = ANCHORS.speaker.pos
  const lamp = useRef<THREE.PointLight>(null)

  useCollider('plant', [px, 0, pz], [0.6, 1.4, 0.6])
  useCollider('cabinet', [-HALF_W + 0.6, 0, HALF_D - 3.4], [1.1, 1.2, 0.6])

  useFrame((state) => {
    if (lamp.current) {
      lamp.current.intensity = 0.9 + Math.sin(state.clock.elapsedTime * 3.1) * 0.05
    }
  })

  return (
    <group>
      {/* Potted plant */}
      <group position={[px, 0, pz]}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.16, 0.4, 12]} />
          <meshStandardMaterial color="#3a2a1c" roughness={0.8} />
        </mesh>
        {Array.from({ length: 7 }).map((_, i) => {
          const a = (i / 7) * Math.PI * 2
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.12, 0.7 + (i % 3) * 0.1, Math.sin(a) * 0.12]}
              rotation={[0.3, a, 0.2]}
              castShadow
            >
              <boxGeometry args={[0.04, 0.7, 0.12]} />
              <meshStandardMaterial color="#2f6b3a" roughness={0.7} side={THREE.DoubleSide} />
            </mesh>
          )
        })}
      </group>

      {/* Desk lamp with warm light */}
      <group position={[lx, ly, lz]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.03, 12]} />
          <meshStandardMaterial color="#20242c" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.18, 0]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.015, 0.015, 0.36, 8]} />
          <meshStandardMaterial color="#20242c" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0.12, 0.34, 0]} rotation={[0, 0, -0.6]}>
          <coneGeometry args={[0.08, 0.12, 12, 1, true]} />
          <meshStandardMaterial color="#2a2f38" side={THREE.DoubleSide} metalness={0.5} />
        </mesh>
        <pointLight ref={lamp} position={[0.14, 0.32, 0]} color="#ffce8a" distance={2.4} intensity={0.9} />
      </group>

      {/* Speaker (music object) */}
      <group position={[sx, sy, sz]}>
        <mesh castShadow>
          <boxGeometry args={[0.22, 0.34, 0.2]} />
          <meshStandardMaterial color="#12161c" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.06, 0.11]}>
          <circleGeometry args={[0.07, 16]} />
          <meshStandardMaterial color="#05070a" roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.08, 0.11]}>
          <circleGeometry args={[0.05, 16]} />
          <meshStandardMaterial
            color="#0a2230"
            emissive="#39d4e6"
            emissiveIntensity={0.4}
          />
        </mesh>
      </group>

      {/* Storage cabinet (back-left) */}
      <group position={[-HALF_W + 0.6, 0, HALF_D - 3.4]}>
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.0, 1.2, 0.55]} />
          <meshStandardMaterial color="#1c222b" roughness={0.6} metalness={0.2} />
        </mesh>
        {[0.3, 0.9].map((dy, i) => (
          <mesh key={i} position={[0, dy, 0.3]}>
            <boxGeometry args={[0.9, 0.5, 0.02]} />
            <meshStandardMaterial color="#232b36" roughness={0.5} />
          </mesh>
        ))}
        {/* Boxes on top */}
        <mesh position={[-0.2, 1.34, 0]} castShadow>
          <boxGeometry args={[0.4, 0.28, 0.4]} />
          <meshStandardMaterial color="#3a2c1c" roughness={0.8} />
        </mesh>
        <mesh position={[0.25, 1.3, 0.05]} castShadow rotation={[0, 0.3, 0]}>
          <boxGeometry args={[0.3, 0.22, 0.3]} />
          <meshStandardMaterial color="#2c3440" roughness={0.8} />
        </mesh>
      </group>
    </group>
  )
}
