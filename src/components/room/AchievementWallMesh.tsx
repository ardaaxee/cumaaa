import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { ANCHORS } from '../../config/roomLayout'
import { useRoomStore } from '../../store/useRoomStore'

// Left-wall achievement display. Each achievement is a small plate; unlocked
// ones light up. New unlocks "appear" as a fresh badge with a brief warm glint.
export function AchievementWallMesh() {
  const [x, y, z] = ANCHORS.achievements.pos
  const achievements = useRoomStore((s) => s.achievements)
  const quality = useRoomStore((s) => s.settings.quality)
  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const prev = useRef(unlockedCount)
  const [burst, setBurst] = useState(false)

  useEffect(() => {
    if (unlockedCount > prev.current) {
      setBurst(true)
      const id = window.setTimeout(() => setBurst(false), 1800)
      prev.current = unlockedCount
      return () => window.clearTimeout(id)
    }
    prev.current = unlockedCount
  }, [unlockedCount])

  return (
    <group position={[x, y, z]} rotation={[0, Math.PI / 2, 0]}>
      {/* Backing panel */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.4, 1.3, 0.05]} />
        <meshStandardMaterial color="#141922" roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.55, 0.03]}>
        <planeGeometry args={[2.2, 0.12]} />
        <meshStandardMaterial color="#efe9dc" roughness={0.9} />
      </mesh>

      {/* Warm glint when a new achievement is earned (no neon) */}
      {burst && quality !== 'low' && (
        <Sparkles count={quality === 'high' ? 34 : 18} scale={[2.2, 1.1, 0.4]} position={[0, 0, 0.4]} size={2} speed={0.5} color="#ffcf80" />
      )}

      {achievements.map((a, i) => {
        const col = i % 4
        const row = Math.floor(i / 4)
        const bx = -0.82 + col * 0.55
        const by = 0.16 - row * 0.5
        return <Badge key={a.id} position={[bx, by, 0.04]} unlocked={a.unlocked} />
      })}
    </group>
  )
}

function Badge({ position, unlocked }: { position: [number, number, number]; unlocked: boolean }) {
  const mat = useRef<THREE.MeshStandardMaterial>(null)
  useFrame((state) => {
    if (unlocked && mat.current) {
      mat.current.emissiveIntensity = 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.15
    }
  })
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.16, 0.16, 0.03, 6]} />
        <meshStandardMaterial
          ref={mat}
          color={unlocked ? '#4a3a1a' : '#26241f'}
          emissive={unlocked ? '#e0a850' : '#000000'}
          emissiveIntensity={unlocked ? 0.4 : 0}
          metalness={0.5}
          roughness={0.4}
        />
      </mesh>
      {/* Star notch */}
      <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.04, 5]} />
        <meshStandardMaterial
          color={unlocked ? '#ffe6b0' : '#2f2c26'}
          emissive={unlocked ? '#ffcf80' : '#000000'}
          emissiveIntensity={unlocked ? 0.5 : 0}
        />
      </mesh>
    </group>
  )
}
