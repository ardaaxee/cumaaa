import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { useRoomStore } from '../../store/useRoomStore'
import { LAB_ANCHORS } from '../../config/labLayout'
import type { Achievement } from '../../types'
import { isHighTier } from '../../utils/device'
import type { GraphicsQuality } from '../../types'

// Front-wall achievement hologram. Unlocked achievements glow as 3D badges; a
// short particle burst plays when the unlocked count increases.
export function AchievementCore({ quality }: { quality: GraphicsQuality }) {
  const achievements = useRoomStore((s) => s.achievements)
  const [x, y, z] = LAB_ANCHORS.achWall
  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const prev = useRef(unlockedCount)
  const [burst, setBurst] = useState(false)

  useEffect(() => {
    if (unlockedCount > prev.current) {
      setBurst(true)
      const id = window.setTimeout(() => setBurst(false), 2200)
      prev.current = unlockedCount
      return () => window.clearTimeout(id)
    }
    prev.current = unlockedCount
  }, [unlockedCount])

  return (
    // Front wall (-Z): face +Z into the room.
    <group position={[x, y, z]}>
      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[3.4, 1.5]} />
        <meshStandardMaterial color="#0a1016" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.64, 0]}>
        <planeGeometry args={[3.2, 0.14]} />
        <meshStandardMaterial color="#0a2230" emissive="#39d4e6" emissiveIntensity={0.5} toneMapped={false} />
      </mesh>
      <HeaderLabel />

      {achievements.map((a, i) => {
        const col = i % 4
        const row = Math.floor(i / 4)
        return <Badge key={a.id} achievement={a} position={[-1.15 + col * 0.77, 0.2 - row * 0.62, 0.05]} seed={i} />
      })}

      {burst && quality !== 'low' && (
        <Sparkles count={isHighTier(quality) ? 50 : 26} scale={[3, 1.4, 0.6]} position={[0, 0, 0.4]} size={3} speed={0.6} color="#8fe6ff" />
      )}
    </group>
  )
}

function Badge({ achievement, position, seed }: { achievement: Achievement; position: [number, number, number]; seed: number }) {
  const mat = useRef<THREE.MeshStandardMaterial>(null)
  const icon = useMemo(() => badgeText(achievement), [achievement.id, achievement.unlocked])
  useFrame((s) => {
    if (achievement.unlocked && mat.current) {
      mat.current.emissiveIntensity = 0.5 + Math.sin(s.clock.elapsedTime * 2 + seed) * 0.2
    }
  })
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.24, 0.24, 0.05, 6]} />
        <meshStandardMaterial
          ref={mat}
          color={achievement.unlocked ? '#0a2a30' : '#141922'}
          emissive={achievement.unlocked ? '#39d4e6' : '#000000'}
          emissiveIntensity={achievement.unlocked ? 0.5 : 0}
          metalness={0.6}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[0.34, 0.34]} />
        <meshBasicMaterial map={icon} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

function HeaderLabel() {
  const tex = useMemo(() => textTex('ACHIEVEMENT CORE', 44), [])
  return (
    <mesh position={[0, 0.64, 0.01]}>
      <planeGeometry args={[2.0, 0.14]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

function badgeText(a: Achievement): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 128
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, 128, 128)
  ctx.fillStyle = a.unlocked ? '#bfefff' : '#3a4453'
  ctx.font = '72px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(a.unlocked ? '★' : '☆', 64, 68)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function textTex(text: string, fontPx: number): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 700
  c.height = 64
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, c.width, c.height)
  ctx.fillStyle = '#dff6ff'
  ctx.font = `bold ${fontPx}px "JetBrains Mono", monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, c.width / 2, c.height / 2)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
