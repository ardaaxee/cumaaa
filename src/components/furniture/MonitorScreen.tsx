import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  width: number
  height: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  variant?: 'code' | 'graph' | 'grid'
  animated?: boolean
}

// A monitor face driven by a live CanvasTexture, so screens read like real
// desktops (a code editor, a dashboard graph, a tiled grid) instead of a flat
// colour. The canvas is redrawn a few times per second, not every frame.
export function MonitorScreen({
  width,
  height,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  variant = 'code',
  animated = true,
}: Props) {
  const tex = useMemo(() => makeScreenTexture(), [])
  const glow = useRef<THREE.MeshStandardMaterial>(null)
  const last = useRef(0)
  const t = useRef(Math.random() * 100)

  useFrame((state, delta) => {
    t.current += delta
    if (glow.current) glow.current.emissiveIntensity = 0.75 + Math.sin(state.clock.elapsedTime * 1.1) * 0.08
    if (!animated) return
    // ~5fps redraw
    if (state.clock.elapsedTime - last.current < 0.2) return
    last.current = state.clock.elapsedTime
    drawScreen(tex, variant, t.current)
  })

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          ref={glow}
          map={tex}
          emissive="#7fd4e6"
          emissiveMap={tex}
          emissiveIntensity={0.8}
          roughness={0.28}
          metalness={0.1}
          toneMapped={false}
        />
      </mesh>
      {/* Subtle screen glass reflection sheen */}
      <mesh position={[0, 0, 0.003]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#0a0e14" transparent opacity={0.06} roughness={0.05} metalness={0.6} />
      </mesh>
    </group>
  )
}

const TEX_SIZE = 256

function makeScreenTexture(): THREE.CanvasTexture {
  // R3F only renders client-side, so document is always available here.
  const c = document.createElement('canvas')
  c.width = TEX_SIZE
  c.height = Math.round(TEX_SIZE * 0.62)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function drawScreen(tex: THREE.CanvasTexture, variant: string, time: number) {
  const c = tex.image as HTMLCanvasElement
  const ctx = c.getContext('2d')
  if (!ctx) return
  const w = c.width
  const h = c.height

  ctx.fillStyle = '#0a1622'
  ctx.fillRect(0, 0, w, h)

  // top bar
  ctx.fillStyle = '#0f2434'
  ctx.fillRect(0, 0, w, 14)
  ctx.fillStyle = '#39d4e6'
  ;[6, 16, 26].forEach((x, i) => {
    ctx.fillStyle = ['#e06a5a', '#e0c05a', '#5ae08a'][i]
    ctx.beginPath()
    ctx.arc(x, 7, 3, 0, Math.PI * 2)
    ctx.fill()
  })

  if (variant === 'code') {
    const rows = 14
    for (let i = 0; i < rows; i++) {
      const y = 22 + i * 10
      const indent = (i % 4) * 8 + 8
      const segs = 2 + ((i * 7) % 3)
      let x = indent
      for (let s = 0; s < segs; s++) {
        const len = 20 + ((i * 13 + s * 29) % 60)
        const colors = ['#5fe0ef', '#9ad0ff', '#c9a7ff', '#7ee0a0', '#e0d07a']
        ctx.fillStyle = colors[(i + s) % colors.length]
        ctx.globalAlpha = 0.85
        ctx.fillRect(x, y, len, 3)
        x += len + 6
      }
    }
    ctx.globalAlpha = 1
    // blinking caret
    if (Math.floor(time * 2) % 2 === 0) {
      ctx.fillStyle = '#39d4e6'
      ctx.fillRect(16, 22 + (Math.floor(time) % rows) * 10, 5, 4)
    }
  } else if (variant === 'graph') {
    // gridlines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    for (let gy = 24; gy < h; gy += 14) {
      ctx.beginPath()
      ctx.moveTo(8, gy)
      ctx.lineTo(w - 8, gy)
      ctx.stroke()
    }
    // animated line chart
    ctx.strokeStyle = '#39d4e6'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let x = 8; x < w - 8; x += 6) {
      const yy = h / 2 + Math.sin((x + time * 40) * 0.05) * 24 + Math.sin((x + time * 20) * 0.13) * 8
      x === 8 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy)
    }
    ctx.stroke()
    // bars
    for (let i = 0; i < 8; i++) {
      const bh = 10 + ((i * 17 + Math.floor(time * 2)) % 30)
      ctx.fillStyle = 'rgba(95,224,239,0.5)'
      ctx.fillRect(16 + i * 28, h - 8 - bh, 16, bh)
    }
  } else {
    // grid of tiles
    for (let gy = 0; gy < 4; gy++) {
      for (let gx = 0; gx < 5; gx++) {
        const on = (gx + gy + Math.floor(time)) % 3 === 0
        ctx.fillStyle = on ? 'rgba(57,212,230,0.55)' : 'rgba(255,255,255,0.06)'
        ctx.fillRect(12 + gx * 46, 24 + gy * 24, 40, 18)
      }
    }
  }

  tex.needsUpdate = true
}
