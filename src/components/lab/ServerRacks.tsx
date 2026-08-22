import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { LAB_ANCHORS } from '../../config/labLayout'
import { useCollider } from '../furniture/useCollider'

// Server/rack decor along the back-right of the lab. Blinking status LEDs give
// the room quiet, constant motion (small "running machines").
export function ServerRacks() {
  return (
    <group>
      <Rack anchor={LAB_ANCHORS.rackA} id="rack-a" />
      <Rack anchor={LAB_ANCHORS.rackB} id="rack-b" />
    </group>
  )
}

function Rack({ anchor, id }: { anchor: readonly [number, number, number]; id: string }) {
  const [x, , z] = anchor
  const leds = useRef<THREE.Group>(null)
  useCollider(id, [x, 0, z], [0.7, 2.2, 1.0])

  useFrame((s) => {
    if (!leds.current) return
    leds.current.children.forEach((c, i) => {
      const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial
      if (m) m.emissiveIntensity = 0.3 + (Math.sin(s.clock.elapsedTime * (2 + (i % 3)) + i) > 0.3 ? 0.9 : 0.1)
    })
  })

  return (
    <group position={[x, 0, z]}>
      {/* Cabinet */}
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 2.2, 0.9]} />
        <meshStandardMaterial color="#0c1219" metalness={0.7} roughness={0.35} envMapIntensity={1} />
      </mesh>
      {/* Unit slots (face -X into the room) */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[-0.31, 0.35 + i * 0.22, 0]}>
          <boxGeometry args={[0.02, 0.16, 0.8]} />
          <meshStandardMaterial color="#05080c" roughness={0.6} />
        </mesh>
      ))}
      {/* Blinking LEDs */}
      <group ref={leds}>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[-0.32, 0.35 + i * 0.22, 0.32]}>
            <boxGeometry args={[0.02, 0.03, 0.03]} />
            <meshStandardMaterial
              color="#0a2230"
              emissive={i % 4 === 0 ? '#ff9d5c' : '#39d4e6'}
              emissiveIntensity={0.6}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
      {/* Top vent glow */}
      <mesh position={[0, 2.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5, 0.8]} />
        <meshStandardMaterial color="#0a2230" emissive="#39d4e6" emissiveIntensity={0.3} toneMapped={false} />
      </mesh>
    </group>
  )
}
