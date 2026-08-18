import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRoomStore } from '../../store/useRoomStore'
import { LAB_ANCHORS } from '../../config/labLayout'
import type { Note } from '../../types'

// A holographic wall of the user's ideas/private notes. Adding an idea in the
// archive (or the lab's Idea panel) makes a new holo-card appear here.
export function IdeaWall() {
  const notes = useRoomStore((s) => s.notes)
  const [x, y, z] = LAB_ANCHORS.ideaWall
  const ideas = notes.filter((n) => n.category === 'idea' || n.category === 'private').slice(0, 6)

  return (
    // Right wall (+X): face -X into the room.
    <group position={[x, y, z]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Backing frame */}
      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[3.2, 2.0]} />
        <meshStandardMaterial color="#0a1016" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <planeGeometry args={[3.0, 0.14]} />
        <meshStandardMaterial color="#0a2230" emissive="#39d4e6" emissiveIntensity={0.5} toneMapped={false} />
      </mesh>
      <HeaderLabel />

      {ideas.length === 0 ? (
        <PlaceholderCard />
      ) : (
        ideas.map((n, i) => {
          const col = i % 3
          const row = Math.floor(i / 3)
          return (
            <group key={n.id} position={[-1.0 + col * 1.0, 0.35 - row * 0.7, 0.02]}>
              <IdeaCard note={n} seed={i} />
            </group>
          )
        })
      )}
    </group>
  )
}

function HeaderLabel() {
  const tex = useMemo(() => label('IDEA WALL'), [])
  return (
    <mesh position={[0, 0.9, 0.01]}>
      <planeGeometry args={[1.4, 0.12]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

function IdeaCard({ note, seed }: { note: Note; seed: number }) {
  const tex = useMemo(() => drawIdea(note), [note.id, note.title, note.body, note.category])
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  useFrame((s) => {
    if (mat.current) mat.current.opacity = 0.7 + Math.sin(s.clock.elapsedTime * 6 + seed) * 0.08
  })
  return (
    <mesh>
      <planeGeometry args={[0.9, 0.6]} />
      <meshBasicMaterial ref={mat} map={tex} transparent opacity={0.75} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  )
}

function PlaceholderCard() {
  const tex = useMemo(() => drawIdea({ title: 'No ideas yet', body: 'Add one via the Idea panel', category: 'idea' } as Note), [])
  return (
    <mesh position={[0, -0.1, 0.02]}>
      <planeGeometry args={[1.6, 0.6]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

function drawIdea(n: Note): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 300
  c.height = 200
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, c.width, c.height)
  const priv = n.category === 'private'
  ctx.fillStyle = priv ? 'rgba(30,14,30,0.82)' : 'rgba(8,22,30,0.82)'
  roundRect(ctx, 5, 5, c.width - 10, c.height - 10, 12)
  ctx.fill()
  ctx.strokeStyle = priv ? 'rgba(224,120,200,0.8)' : 'rgba(57,212,230,0.8)'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = priv ? '#f0c0e0' : '#8fe6ff'
  ctx.font = '14px "JetBrains Mono", monospace'
  ctx.fillText(priv ? 'PRIVATE' : 'IDEA', 18, 34)
  ctx.fillStyle = '#dff6ff'
  ctx.font = 'bold 24px Inter, sans-serif'
  ctx.fillText(clip(n.title, 18), 18, 74)
  ctx.fillStyle = 'rgba(210,225,240,0.72)'
  ctx.font = '16px Inter, sans-serif'
  wrap(ctx, n.body || '—', 18, 104, c.width - 36, 22, 4)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function label(text: string): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 64
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, c.width, c.height)
  ctx.fillStyle = '#dff6ff'
  ctx.font = 'bold 40px "JetBrains Mono", monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, c.width / 2, c.height / 2)
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

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number, maxLines: number) {
  const words = text.split(/\s+/)
  let line = ''
  let lines = 0
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y)
      y += lh
      line = w
      if (++lines >= maxLines - 1) break
    } else line = test
  }
  ctx.fillText(clip(line, 40), x, y)
}

function clip(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}
