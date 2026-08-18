import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  width: number
  height: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  hue?: string
  animated?: boolean
}

// A glowing monitor face with a softly scrolling highlight bar to fake an
// active desktop. Cheap: one plane + one animated child plane.
export function MonitorScreen({
  width,
  height,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  hue = '#0e2a3a',
  animated = true,
}: Props) {
  const bar = useRef<THREE.Mesh>(null)
  const glow = useRef<THREE.MeshStandardMaterial>(null)

  useFrame((state) => {
    if (!animated) return
    const t = state.clock.elapsedTime
    if (bar.current) {
      bar.current.position.y = (Math.sin(t * 0.6) * 0.5) * height * 0.7
    }
    if (glow.current) {
      glow.current.emissiveIntensity = 0.85 + Math.sin(t * 1.3) * 0.12
    }
  })

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          ref={glow}
          color={hue}
          emissive={hue}
          emissiveIntensity={0.9}
          roughness={0.35}
          metalness={0.1}
        />
      </mesh>
      {/* Scrolling highlight bar */}
      <mesh ref={bar} position={[0, 0, 0.002]}>
        <planeGeometry args={[width * 0.96, height * 0.08]} />
        <meshBasicMaterial color="#39d4e6" transparent opacity={0.18} />
      </mesh>
      {/* A couple of static "content" rows */}
      <mesh position={[-width * 0.18, height * 0.22, 0.002]}>
        <planeGeometry args={[width * 0.5, height * 0.05]} />
        <meshBasicMaterial color="#5fe0ef" transparent opacity={0.25} />
      </mesh>
      <mesh position={[-width * 0.05, height * 0.05, 0.002]}>
        <planeGeometry args={[width * 0.7, height * 0.04]} />
        <meshBasicMaterial color="#9bb6cf" transparent opacity={0.18} />
      </mesh>
    </group>
  )
}
