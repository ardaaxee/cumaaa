import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ROOM, HALF_W, HALF_D } from '../../config/roomLayout'

// Purely decorative props that lift the room to "art-directed" without adding
// colliders: a ceiling light fixture, a wall clock with a moving second hand,
// framed wall art, a string of LED lights and a floating shelf.
export function Details() {
  return (
    <group>
      <CeilingFixture />
      <WallClock />
      <WallArt />
      <StringLights />
      <FloatingShelf />
    </group>
  )
}

function CeilingFixture() {
  const mat = useRef<THREE.MeshStandardMaterial>(null)
  useFrame((s) => {
    if (mat.current) mat.current.emissiveIntensity = 0.5 + Math.sin(s.clock.elapsedTime * 0.6) * 0.05
  })
  return (
    <group position={[0, ROOM.height - 0.06, 0.5]}>
      {/* Recessed frame */}
      <mesh>
        <boxGeometry args={[2.6, 0.08, 1.3]} />
        <meshStandardMaterial color="#0e1219" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Emissive panel (tone-mapped so it reads as a soft light, not a hotspot) */}
      <mesh position={[0, -0.045, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.4, 1.15]} />
        <meshStandardMaterial ref={mat} color="#aebfd4" emissive="#cfe0f5" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

function WallClock() {
  const hand = useRef<THREE.Group>(null)
  useFrame(() => {
    if (hand.current) {
      const secs = (Date.now() / 1000) % 60
      hand.current.rotation.z = -(secs / 60) * Math.PI * 2
    }
  })
  return (
    <group position={[-2.4, 2.35, HALF_D - 0.12]} rotation={[0, Math.PI, 0]}>
      <mesh>
        <cylinderGeometry args={[0.28, 0.28, 0.05, 32]} />
        <meshStandardMaterial color="#12161c" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.24, 32]} />
        <meshStandardMaterial color="#0a0e14" />
      </mesh>
      {/* ticks */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.sin(a) * 0.2, Math.cos(a) * 0.2, 0.04]}>
            <boxGeometry args={[0.015, 0.03, 0.005]} />
            <meshStandardMaterial color="#39d4e6" emissive="#39d4e6" emissiveIntensity={0.4} />
          </mesh>
        )
      })}
      {/* second hand */}
      <group ref={hand} position={[0, 0, 0.045]}>
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[0.01, 0.18, 0.005]} />
          <meshStandardMaterial color="#5fe0ef" emissive="#5fe0ef" emissiveIntensity={0.6} />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.05]}>
        <cylinderGeometry args={[0.02, 0.02, 0.01, 12]} />
        <meshStandardMaterial color="#5fe0ef" emissive="#5fe0ef" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

function WallArt() {
  const arts = [
    { pos: [0.6, 2.3, HALF_D - 0.11] as const, colors: ['#1f8a99', '#0a2230', '#39d4e6'], w: 0.8, h: 1.0 },
    { pos: [1.9, 2.3, HALF_D - 0.11] as const, colors: ['#7a2f5a', '#0a2230', '#e0794a'], w: 0.7, h: 1.0 },
  ]
  return (
    <group>
      {arts.map((a, i) => (
        <group key={i} position={a.pos} rotation={[0, Math.PI, 0]}>
          <mesh>
            <boxGeometry args={[a.w + 0.06, a.h + 0.06, 0.04]} />
            <meshStandardMaterial color="#1a1a1f" metalness={0.3} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.03]}>
            <planeGeometry args={[a.w, a.h]} />
            <meshStandardMaterial color={a.colors[0]} roughness={0.6} />
          </mesh>
          {/* abstract bands */}
          <mesh position={[0, a.h * 0.2, 0.031]}>
            <planeGeometry args={[a.w, a.h * 0.18]} />
            <meshStandardMaterial color={a.colors[2]} emissive={a.colors[2]} emissiveIntensity={0.15} roughness={0.5} />
          </mesh>
          <mesh position={[a.w * 0.15, -a.h * 0.15, 0.031]}>
            <circleGeometry args={[a.w * 0.22, 24]} />
            <meshStandardMaterial color={a.colors[1]} roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function StringLights() {
  const bulbs = useMemo(() => {
    const out: [number, number, number][] = []
    const n = 14
    for (let i = 0; i < n; i++) {
      const x = -HALF_W + 0.15
      const z = -HALF_D + 0.6 + (i / (n - 1)) * (ROOM.depth - 1.2)
      const y = ROOM.height - 0.35 - Math.sin((i / (n - 1)) * Math.PI) * 0.25
      out.push([x, y, z])
    }
    return out
  }, [])
  const grp = useRef<THREE.Group>(null)
  useFrame((s) => {
    if (!grp.current) return
    grp.current.children.forEach((child, i) => {
      const m = (child as THREE.Mesh).material as THREE.MeshStandardMaterial
      if (m) m.emissiveIntensity = 0.5 + Math.sin(s.clock.elapsedTime * 2 + i) * 0.3
    })
  })
  return (
    <group ref={grp}>
      {bulbs.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#ffce8a" emissive="#ffce8a" emissiveIntensity={0.6} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function FloatingShelf() {
  return (
    <group position={[2.6, 1.9, HALF_D - 0.12]} rotation={[0, Math.PI, 0]}>
      <mesh castShadow>
        <boxGeometry args={[1.1, 0.05, 0.28]} />
        <meshStandardMaterial color="#241a12" roughness={0.7} />
      </mesh>
      {/* little books */}
      {[-0.35, -0.2, -0.05].map((x, i) => (
        <mesh key={i} position={[x, 0.14, 0]} rotation={[0, 0, (i - 1) * 0.05]} castShadow>
          <boxGeometry args={[0.05, 0.22, 0.18]} />
          <meshStandardMaterial color={['#7a2f2f', '#2f5a7a', '#3a6b3a'][i]} roughness={0.75} />
        </mesh>
      ))}
      {/* tiny plant */}
      <mesh position={[0.3, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.12, 10]} />
        <meshStandardMaterial color="#3a2a1c" roughness={0.8} />
      </mesh>
      <mesh position={[0.3, 0.24, 0]}>
        <sphereGeometry args={[0.09, 10, 10]} />
        <meshStandardMaterial color="#2f6b3a" roughness={0.7} />
      </mesh>
      {/* small figurine glow */}
      <mesh position={[0.42, 0.14, 0]}>
        <boxGeometry args={[0.08, 0.14, 0.08]} />
        <meshStandardMaterial color="#0a2230" emissive="#39d4e6" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}
