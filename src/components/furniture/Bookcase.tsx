import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ANCHORS } from '../../config/roomLayout'
import { useCollider } from './useCollider'
import { useRoomStore } from '../../store/useRoomStore'

const FRAME = '#3a2c1e'
const BOOK_COLORS = ['#6e3a30', '#3a4a5c', '#4a5a3c', '#7a6a46', '#5a4560', '#8a6a4a', '#4a4a52', '#7c4436']

// Bookcase on the right wall. Doubles as the digital archive and conceals the
// secret room: one odd, glowing book is the secret panel, and once unlocked a
// hidden section of the case slides open to reveal a glowing passage.
export function Bookcase() {
  const [x, , z] = ANCHORS.bookcase.pos
  const secretUnlocked = useRoomStore((s) => s.secretUnlocked)
  const door = useRef<THREE.Group>(null)
  const secretBook = useRef<THREE.MeshStandardMaterial>(null)

  // Solid until the secret is found; once the hidden door slides aside, the
  // collider is removed so the player can physically walk through into ARDA LAB.
  useCollider('bookcase', [x, 0, z], [0.5, 2.4, 2.6], !secretUnlocked)

  useFrame((state, delta) => {
    // Secret book: a faint warm glow between the spines — subtle, not neon.
    if (secretBook.current) {
      secretBook.current.emissiveIntensity = 0.18 + Math.sin(state.clock.elapsedTime * 1.2) * 0.12
    }
    // Slide the hidden door open when unlocked.
    if (door.current) {
      const target = secretUnlocked ? 1.05 : 0
      door.current.position.z = THREE.MathUtils.damp(door.current.position.z, target, 3, delta)
    }
  })

  const shelfYs = [0.35, 0.95, 1.55, 2.15]

  return (
    <group position={[x, 0, z]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Case body (rotated so depth faces the room) */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 2.4, 0.4]} />
        <meshStandardMaterial color={FRAME} roughness={0.7} />
      </mesh>
      {/* Back panel */}
      <mesh position={[0, 1.2, -0.18]}>
        <boxGeometry args={[2.3, 2.3, 0.04]} />
        <meshStandardMaterial color="#150f0a" roughness={0.9} />
      </mesh>

      {/* Shelves + books */}
      {shelfYs.map((sy, si) => (
        <group key={si}>
          <mesh position={[0, sy - 0.02, 0.02]}>
            <boxGeometry args={[2.3, 0.04, 0.36]} />
            <meshStandardMaterial color="#1c130c" roughness={0.8} />
          </mesh>
          {Array.from({ length: 9 }).map((_, bi) => {
            const isSecret = si === 1 && bi === 6
            const h = 0.32 + ((bi * 7 + si * 3) % 5) * 0.03
            const bx = -1.05 + bi * 0.24
            // Natural irregularity: some books lean, some sit deeper.
            const lean = ((bi * 5 + si * 2) % 7 === 0 ? 0.1 : 0) * (bi % 2 ? 1 : -1)
            const depth = ((bi + si) % 4 === 0 ? 0.05 : 0)
            return (
              <mesh key={bi} position={[bx, sy + h / 2, 0.08 - depth]} rotation={[0, 0, lean]} castShadow>
                <boxGeometry args={[0.13 + (bi % 3) * 0.01, h, 0.28]} />
                {isSecret ? (
                  <meshStandardMaterial
                    ref={secretBook}
                    color="#3a2a14"
                    emissive="#c98a3a"
                    emissiveIntensity={0.2}
                    roughness={0.5}
                  />
                ) : (
                  <meshStandardMaterial
                    color={BOOK_COLORS[(bi + si) % BOOK_COLORS.length]}
                    roughness={0.8}
                  />
                )}
              </mesh>
            )
          })}
        </group>
      ))}

      {/* Hidden passage — a dim warm light spilling from beyond (revealed on slide) */}
      <mesh position={[0.6, 1.2, -0.19]}>
        <planeGeometry args={[1.0, 2.0]} />
        <meshStandardMaterial color="#0e0c09" emissive="#c98a3a" emissiveIntensity={0.25} />
      </mesh>

      {/* Sliding hidden door section (covers the passage until unlocked) */}
      <group ref={door} position={[0.6, 1.2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.0, 2.2, 0.42]} />
          <meshStandardMaterial color={FRAME} roughness={0.7} />
        </mesh>
      </group>
    </group>
  )
}
