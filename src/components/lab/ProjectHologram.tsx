import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRoomStore } from '../../store/useRoomStore'
import { LAB_ANCHORS } from '../../config/labLayout'
import { useCollider } from '../furniture/useCollider'
import type { Project } from '../../types'

// A rotating holographic display of the user's real projects. Cards are drawn
// with CanvasTextures (no network fonts) and refresh whenever the Projects
// store changes, so adding a project in ARDA OS updates the hologram here.
export function ProjectHologram({ quality }: { quality: 'low' | 'medium' | 'high' }) {
  const projects = useRoomStore((s) => s.projects)
  const ring = useRef<THREE.Group>(null)
  const beam = useRef<THREE.Mesh>(null)
  const [hx, hy, hz] = LAB_ANCHORS.hologram
  useCollider('lab-holo-base', [hx, 0, hz], [1.4, 1, 1.4])

  const shown = projects.slice(0, quality === 'low' ? 4 : 6)

  useFrame((s, delta) => {
    if (ring.current) ring.current.rotation.y += delta * 0.25
    if (beam.current) {
      const m = beam.current.material as THREE.MeshBasicMaterial
      m.opacity = 0.12 + Math.sin(s.clock.elapsedTime * 3) * 0.04
    }
  })

  return (
    <group position={[hx, 0, hz]}>
      {/* Emitter base */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.85, 0.16, 24]} />
        <meshStandardMaterial color="#12181f" metalness={0.7} roughness={0.35} envMapIntensity={1} />
      </mesh>
      <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.68, 32]} />
        <meshStandardMaterial color="#0a2230" emissive="#39d4e6" emissiveIntensity={0.7} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Central light beam */}
      <mesh ref={beam} position={[0, hy, 0]}>
        <cylinderGeometry args={[0.32, 0.5, hy * 1.6, 20, 1, true]} />
        <meshBasicMaterial color="#39d4e6" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>

      {/* Rotating project cards */}
      <group ref={ring} position={[0, hy, 0]}>
        {shown.map((p, i) => {
          const a = (i / Math.max(1, shown.length)) * Math.PI * 2
          const r = 0.95
          return (
            <group key={p.id} position={[Math.sin(a) * r, Math.sin(i * 1.7) * 0.12, Math.cos(a) * r]} rotation={[0, a, 0]}>
              <HoloCard project={p} />
            </group>
          )
        })}
        {shown.length === 0 && <EmptyCard />}
      </group>
    </group>
  )
}

function HoloCard({ project }: { project: Project }) {
  const tex = useMemo(() => drawCard(project), [project.id, project.name, project.progress, project.status])
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  useFrame((s) => {
    if (mat.current) mat.current.opacity = 0.72 + Math.sin(s.clock.elapsedTime * 8 + project.progress) * 0.06
  })
  return (
    <mesh>
      <planeGeometry args={[0.72, 0.44]} />
      <meshBasicMaterial ref={mat} map={tex} transparent opacity={0.75} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  )
}

function EmptyCard() {
  const tex = useMemo(() => drawText('NO PROJECTS', 'Add one in ARDA OS'), [])
  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[0.9, 0.4]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  )
}

const STATUS_COLOR: Record<string, string> = {
  planning: '#e0c05a',
  active: '#5fe0ef',
  paused: '#9aa7b5',
  done: '#5ae08a',
}

function drawCard(p: Project): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 360
  c.height = 220
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, c.width, c.height)
  // panel
  ctx.fillStyle = 'rgba(8,22,30,0.82)'
  roundRect(ctx, 6, 6, c.width - 12, c.height - 12, 14)
  ctx.fill()
  ctx.strokeStyle = 'rgba(57,212,230,0.8)'
  ctx.lineWidth = 2
  ctx.stroke()
  // title
  ctx.fillStyle = '#dff6ff'
  ctx.font = 'bold 30px Inter, sans-serif'
  ctx.fillText(clip(p.name, 16), 24, 56)
  // status
  ctx.fillStyle = STATUS_COLOR[p.status] ?? '#5fe0ef'
  ctx.font = '18px "JetBrains Mono", monospace'
  ctx.fillText(p.status.toUpperCase(), 24, 88)
  // tech
  ctx.fillStyle = 'rgba(200,220,235,0.6)'
  ctx.font = '16px Inter, sans-serif'
  ctx.fillText(clip(p.technologies.join(' · ') || '—', 30), 24, 118)
  // progress bar
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  roundRect(ctx, 24, 150, c.width - 48, 16, 8)
  ctx.fill()
  ctx.fillStyle = '#39d4e6'
  roundRect(ctx, 24, 150, ((c.width - 48) * p.progress) / 100, 16, 8)
  ctx.fill()
  ctx.fillStyle = '#8fe6ff'
  ctx.font = 'bold 20px "JetBrains Mono", monospace'
  ctx.fillText(`${p.progress}%`, c.width - 78, 195)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function drawText(title: string, sub: string): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 360
  c.height = 160
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, c.width, c.height)
  ctx.fillStyle = 'rgba(8,22,30,0.7)'
  roundRect(ctx, 6, 6, c.width - 12, c.height - 12, 14)
  ctx.fill()
  ctx.strokeStyle = 'rgba(57,212,230,0.6)'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = '#dff6ff'
  ctx.font = 'bold 30px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(title, c.width / 2, 70)
  ctx.fillStyle = 'rgba(200,220,235,0.7)'
  ctx.font = '18px Inter, sans-serif'
  ctx.fillText(sub, c.width / 2, 105)
  ctx.textAlign = 'left'
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function clip(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}
