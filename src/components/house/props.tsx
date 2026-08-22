import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { rug as rugTex, fabric } from '../../utils/textures'

// Small reusable furnishings shared across the house rooms. All procedural and
// lightweight; none add colliders (large furniture registers its own).

export function CeilingLamp({
  position,
  color = '#ffdcae',
  intensity = 0.9,
  castShadow = false,
  shade = '#d8d2c6',
}: {
  position: [number, number, number]
  color?: string
  intensity?: number
  castShadow?: boolean
  shade?: string
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.12, 8]} />
        <meshStandardMaterial color="#2a2620" roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.12, 0]}>
        <coneGeometry args={[0.2, 0.16, 20, 1, true]} />
        <meshStandardMaterial color={shade} side={THREE.DoubleSide} roughness={0.6} emissive={color} emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, -0.16, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#fff4e0" emissive={color} emissiveIntensity={0.7} toneMapped={false} />
      </mesh>
      <pointLight position={[0, -0.2, 0]} color={color} intensity={intensity} distance={20} decay={1.05} castShadow={castShadow} />
    </group>
  )
}

// A decorative open door leaf + frame at a doorway. Place manually per opening.
export function Door({
  position,
  rotation = [0, 0, 0],
  width = 1.2,
  height = 2.2,
  open = 0.55,
  color = '#5a4632',
}: {
  position: [number, number, number]
  rotation?: [number, number, number]
  width?: number
  height?: number
  open?: number
  color?: string
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* frame */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * width) / 2, height / 2, 0]} castShadow>
          <boxGeometry args={[0.06, height + 0.06, 0.14]} />
          <meshStandardMaterial color="#cbc4b6" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, height + 0.02, 0]}>
        <boxGeometry args={[width + 0.12, 0.06, 0.14]} />
        <meshStandardMaterial color="#cbc4b6" roughness={0.7} />
      </mesh>
      {/* leaf, hinged open */}
      <group position={[-width / 2 + 0.02, 0, 0]} rotation={[0, open, 0]}>
        <mesh position={[width / 2 - 0.02, height / 2, 0]} castShadow>
          <boxGeometry args={[width - 0.06, height - 0.04, 0.04]} />
          <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} />
        </mesh>
        <mesh position={[width - 0.12, height / 2, 0.04]}>
          <sphereGeometry args={[0.03, 10, 10]} />
          <meshStandardMaterial color="#c9b47a" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </group>
  )
}

export function Rug({
  position,
  size,
  color = '#6b5d4a',
}: {
  position: [number, number, number]
  size: [number, number]
  color?: string
}) {
  const t = useMemo(() => rugTex(), [])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position} receiveShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial color={color} map={t.map} normalMap={t.normalMap} roughness={0.97} />
    </mesh>
  )
}

export function Plant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.12, 0.4, 14]} />
        <meshStandardMaterial color="#8a6a4a" roughness={0.7} />
      </mesh>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 0.1, 0.75, Math.sin(a) * 0.1]} rotation={[0.3, a, 0.2]} castShadow>
            <boxGeometry args={[0.04, 0.75, 0.14]} />
            <meshStandardMaterial color="#3f6b3a" roughness={0.7} side={THREE.DoubleSide} />
          </mesh>
        )
      })}
    </group>
  )
}

export function FramedArt({
  position,
  rotation = [0, 0, 0],
  w = 0.7,
  h = 0.9,
  tone = ['#6b7c74', '#3a3630', '#c9a06a'],
}: {
  position: [number, number, number]
  rotation?: [number, number, number]
  w?: number
  h?: number
  tone?: string[]
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[w + 0.06, h + 0.06, 0.03]} />
        <meshStandardMaterial color="#1f1a14" metalness={0.2} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color={tone[0]} roughness={0.85} />
      </mesh>
      <mesh position={[0, h * 0.18, 0.021]}>
        <planeGeometry args={[w, h * 0.22]} />
        <meshStandardMaterial color={tone[2]} roughness={0.8} />
      </mesh>
      <mesh position={[w * 0.15, -h * 0.15, 0.021]}>
        <circleGeometry args={[w * 0.2, 20]} />
        <meshStandardMaterial color={tone[1]} roughness={0.8} />
      </mesh>
    </group>
  )
}

// A light switch + power socket on a wall (tiny realism detail).
export function SwitchSocket({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.08, 0.12, 0.01]} />
        <meshStandardMaterial color="#eeeae2" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.1, 0.006]}>
        <boxGeometry args={[0.03, 0.05, 0.008]} />
        <meshStandardMaterial color="#d8d2c6" roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[0.09, 0.09, 0.01]} />
        <meshStandardMaterial color="#eeeae2" roughness={0.5} />
      </mesh>
    </group>
  )
}

// A floor lamp (lambader) for the living room.
export function FloorLamp({ position, on = 0.7 }: { position: [number, number, number]; on?: number }) {
  const mat = useRef<THREE.MeshStandardMaterial>(null)
  useFrame((s) => {
    if (mat.current) mat.current.emissiveIntensity = on * (0.9 + Math.sin(s.clock.elapsedTime * 0.7) * 0.03)
  })
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.04, 16]} />
        <meshStandardMaterial color="#2a2d33" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 1.5, 8]} />
        <meshStandardMaterial color="#2a2d33" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.16, 0.2, 0.28, 20, 1, true]} />
        <meshStandardMaterial ref={mat} color="#e8dcc2" emissive="#ffdcae" emissiveIntensity={on} side={THREE.DoubleSide} roughness={0.7} />
      </mesh>
      <pointLight position={[0, 1.5, 0]} color="#ffdcae" intensity={on} distance={5} decay={1.8} />
    </group>
  )
}

// Simple soft curtain panels for a window opening.
export function Curtains({ position, width = 2, height = 1.9 }: { position: [number, number, number]; width?: number; height?: number }) {
  const cloth = useMemo(() => fabric('#8f8576', 'housecurtain'), [])
  return (
    <group position={position}>
      {[-1, 1].map((s) =>
        [-0.16, -0.05, 0.06, 0.16].map((ox, j) => (
          <mesh key={`${s}-${j}`} position={[s * (width / 2) + s * ox, height / 2, 0]} castShadow>
            <boxGeometry args={[0.12, height, 0.04]} />
            <meshStandardMaterial color="#8f8576" map={cloth.map} normalMap={cloth.normalMap} roughness={0.95} />
          </mesh>
        )),
      )}
    </group>
  )
}
