import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ANCHORS } from '../../config/roomLayout'
import { useCollider } from './useCollider'
import { useRoomStore } from '../../store/useRoomStore'

const FRAME = '#241a12'
const BOOK_COLORS = ['#7a2f2f', '#2f5a7a', '#3a6b3a', '#7a6a2f', '#4a2f6b', '#2f6b6b']

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
    // Secret book gently pulses to reward a close look.
    if (secretBook.current) {
      secretBook.current.emissiveIntensity = 0.25 + Math.sin(state.clock.elapsedTime * 1.5) * 0.2
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
            const h = 0.34 + ((bi * 7 + si * 3) % 5) * 0.02
            const bx = -1.05 + bi * 0.24
            return (
              <mesh key={bi} position={[bx, sy + h / 2, 0.08]} castShadow>
                <boxGeometry args={[0.14, h, 0.28]} />
                {isSecret ? (
                  <meshStandardMaterial
                    ref={secretBook}
                    color="#0a2a30"
                    emissive="#39d4e6"
                    emissiveIntensity={0.3}
                    roughness={0.4}
                  />
                ) : (
                  <meshStandardMaterial
                    color={BOOK_COLORS[(bi + si) % BOOK_COLORS.length]}
                    roughness={0.75}
                  />
                )}
              </mesh>
            )
          })}
        </group>
      ))}

      {/* Hidden passage glow (revealed when door slides) */}
      <mesh position={[0.6, 1.2, -0.19]}>
        <planeGeometry args={[1.0, 2.0]} />
        <meshStandardMaterial color="#062026" emissive="#39d4e6" emissiveIntensity={0.6} />
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
