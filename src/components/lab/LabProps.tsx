import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MonitorScreen } from '../furniture/MonitorScreen'
import { useRoomStore } from '../../store/useRoomStore'
import { LAB, LAB_CX, LAB_ANCHORS } from '../../config/labLayout'
import { useCollider } from '../furniture/useCollider'

// Assorted lab fixtures: two consoles (code terminal + ARDA AI terminal), a
// digital map, the ARDA LAB sign, the future-projects bay and the exit portal.

export function LabProps() {
  return (
    <group>
      <Console anchor={LAB_ANCHORS.terminal} id="lab-terminal" variant="code" tint="#39d4e6" label="TERMINAL" />
      <Console anchor={LAB_ANCHORS.aiTerminal} id="lab-ai" variant="graph" tint="#8f7fff" label="ARDA AI" />
      <DigitalMap />
      <LabSign />
      <FutureBay />
      <ExitPortal />
      <Cables />
    </group>
  )
}

function Console({
  anchor,
  id,
  variant,
  tint,
  label,
}: {
  anchor: readonly [number, number, number]
  id: string
  variant: 'code' | 'graph'
  tint: string
  label: string
}) {
  const [x, , z] = anchor
  useCollider(id, [x, 0, z], [1.3, 1.2, 0.7])
  const lbl = useMemo(() => textStrip(label), [label])

  // Faces -Z (into the room, toward the centre) since it sits on the back wall.
  return (
    <group position={[x, 0, z]} rotation={[0, Math.PI, 0]}>
      {/* Desk */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.08, 0.6]} />
        <meshStandardMaterial color="#10161d" metalness={0.7} roughness={0.3} envMapIntensity={1} />
      </mesh>
      {[-0.55, 0.55].map((lx) => (
        <mesh key={lx} position={[lx, 0.25, 0]}>
          <boxGeometry args={[0.06, 0.5, 0.5]} />
          <meshStandardMaterial color="#0c1219" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {/* Angled screen */}
      <group position={[0, 0.95, -0.02]} rotation={[-0.18, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.0, 0.5, 0.04]} />
          <meshStandardMaterial color="#05080c" metalness={0.5} roughness={0.4} />
        </mesh>
        <MonitorScreen width={0.94} height={0.44} position={[0, 0, 0.03]} variant={variant} />
      </group>
      {/* Keyboard glow */}
      <mesh position={[0, 0.55, 0.16]}>
        <boxGeometry args={[0.5, 0.02, 0.16]} />
        <meshStandardMaterial color="#0a2230" emissive={tint} emissiveIntensity={0.5} toneMapped={false} />
      </mesh>
      {/* Label strip */}
      <mesh position={[0, 1.28, 0.02]}>
        <planeGeometry args={[0.7, 0.1]} />
        <meshBasicMaterial map={lbl} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

function DigitalMap() {
  const tex = useMemo(() => mapTexture(), [])
  const scan = useRef<THREE.Mesh>(null)
  useFrame((s) => {
    if (scan.current) scan.current.position.y = (Math.sin(s.clock.elapsedTime * 0.8) * 0.5) * 0.7
  })
  // On the back wall (+Z), between the consoles, facing -Z.
  return (
    <group position={[LAB_CX, 1.9, LAB.maxZ - 0.11]} rotation={[0, Math.PI, 0]}>
      <mesh>
        <planeGeometry args={[1.8, 1.0]} />
        <meshBasicMaterial map={tex} transparent opacity={0.9} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[1.9, 1.1]} />
        <meshStandardMaterial color="#0a2230" emissive="#39d4e6" emissiveIntensity={0.25} transparent opacity={0.15} toneMapped={false} />
      </mesh>
      <mesh ref={scan} position={[0, 0, 0.02]}>
        <planeGeometry args={[1.8, 0.03]} />
        <meshBasicMaterial color="#8fe6ff" transparent opacity={0.4} toneMapped={false} />
      </mesh>
    </group>
  )
}

function LabSign() {
  const tex = useMemo(() => textStrip('ARDA LAB', '#8fe6ff'), [])
  const [x, y, z] = LAB_ANCHORS.sign
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  useFrame((s) => {
    // Subtle neon flicker.
    if (mat.current) {
      const f = Math.random() > 0.97 ? 0.5 : 1
      mat.current.opacity = (0.85 + Math.sin(s.clock.elapsedTime * 2) * 0.1) * f
    }
  })
  // On the lab side of the entrance (left wall, x = minX), facing +X into lab.
  return (
    <group position={[x, y, z]} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[1.7, 0.42]} />
        <meshStandardMaterial color="#060a10" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh>
        <planeGeometry args={[1.5, 0.3]} />
        <meshBasicMaterial ref={mat} map={tex} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

function FutureBay() {
  const projects = useRoomStore((s) => s.projects)
  const achievements = useRoomStore((s) => s.achievements)
  const unlocked = achievements.filter((a) => a.unlocked).length
  const [x, y, z] = LAB_ANCHORS.future

  // Slots unlock as real milestones are met (data-driven, no fake progress).
  const slots = [
    { name: 'PROJECT 01', unlocked: projects.length >= 4 },
    { name: 'PROJECT 02', unlocked: unlocked >= 3 },
    { name: 'PROJECT 03', unlocked: unlocked >= 5 },
  ]

  // Front-left corner (front wall -Z), facing +Z.
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[1.5, 1.7]} />
        <meshStandardMaterial color="#080d13" metalness={0.5} roughness={0.6} />
      </mesh>
      {slots.map((sl, i) => (
        <FutureSlot key={sl.name} name={sl.name} unlocked={sl.unlocked} position={[0, 0.5 - i * 0.5, 0.05]} />
      ))}
    </group>
  )
}

function FutureSlot({ name, unlocked, position }: { name: string; unlocked: boolean; position: [number, number, number] }) {
  const tex = useMemo(() => slotTexture(name, unlocked), [name, unlocked])
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  useFrame((s) => {
    if (mat.current) mat.current.opacity = unlocked ? 0.85 + Math.sin(s.clock.elapsedTime * 5) * 0.08 : 0.5
  })
  return (
    <mesh position={position}>
      <planeGeometry args={[1.25, 0.4]} />
      <meshBasicMaterial ref={mat} map={tex} transparent opacity={0.7} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

function ExitPortal() {
  const [x, y, z] = LAB_ANCHORS.exit
  const ring = useRef<THREE.Mesh>(null)
  const tex = useMemo(() => textStrip('RETURN TO ROOM', '#ff9d5c'), [])
  useFrame((s) => {
    if (ring.current) {
      const m = ring.current.material as THREE.MeshBasicMaterial
      m.opacity = 0.5 + Math.sin(s.clock.elapsedTime * 2.5) * 0.2
    }
  })
  // Faces +X (looking back toward the room through the corridor).
  return (
    <group position={[x, y, z]} rotation={[0, Math.PI / 2, 0]}>
      <mesh ref={ring}>
        <torusGeometry args={[0.7, 0.04, 10, 40]} />
        <meshBasicMaterial color="#ff9d5c" transparent opacity={0.6} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.95, 0]}>
        <planeGeometry args={[1.3, 0.16]} />
        <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Cables() {
  return (
    <group>
      {[
        { p: [LAB.minX + 0.15, 1.6, -4] as const, len: 3, rot: [0, 0, Math.PI / 2] as const },
        { p: [LAB.maxX - 0.15, 1.2, 0] as const, len: 2.4, rot: [Math.PI / 2, 0, 0] as const },
      ].map((c, i) => (
        <mesh key={i} position={c.p as [number, number, number]} rotation={c.rot as [number, number, number]}>
          <cylinderGeometry args={[0.02, 0.02, c.len, 6]} />
          <meshStandardMaterial color="#05080c" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// ---- texture helpers ------------------------------------------------------

function textStrip(text: string, color = '#dff6ff'): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 640
  c.height = 96
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, c.width, c.height)
  ctx.fillStyle = color
  ctx.font = 'bold 56px "JetBrains Mono", monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, c.width / 2, c.height / 2)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function slotTexture(name: string, unlocked: boolean): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 360
  c.height = 120
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, c.width, c.height)
  ctx.fillStyle = unlocked ? 'rgba(8,22,30,0.8)' : 'rgba(14,16,22,0.8)'
  ctx.fillRect(4, 4, c.width - 8, c.height - 8)
  ctx.strokeStyle = unlocked ? 'rgba(95,224,239,0.9)' : 'rgba(90,100,115,0.7)'
  ctx.lineWidth = 2
  ctx.strokeRect(4, 4, c.width - 8, c.height - 8)
  ctx.fillStyle = unlocked ? '#dff6ff' : '#5a6473'
  ctx.font = 'bold 34px "JetBrains Mono", monospace'
  ctx.fillText(name, 24, 54)
  ctx.font = '22px "JetBrains Mono", monospace'
  ctx.fillStyle = unlocked ? '#5ae08a' : '#8a94a3'
  ctx.fillText(unlocked ? '● UNLOCKED' : '🔒 LOCKED', 24, 92)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function mapTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 288
  const ctx = c.getContext('2d')!
  ctx.fillStyle = 'rgba(6,18,26,0.9)'
  ctx.fillRect(0, 0, c.width, c.height)
  // node graph
  const nodes: [number, number][] = Array.from({ length: 12 }, () => [
    30 + Math.random() * (c.width - 60),
    30 + Math.random() * (c.height - 60),
  ])
  ctx.strokeStyle = 'rgba(57,212,230,0.35)'
  ctx.lineWidth = 1
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (Math.hypot(nodes[i][0] - nodes[j][0], nodes[i][1] - nodes[j][1]) < 130) {
        ctx.beginPath()
        ctx.moveTo(nodes[i][0], nodes[i][1])
        ctx.lineTo(nodes[j][0], nodes[j][1])
        ctx.stroke()
      }
    }
  }
  nodes.forEach((n, i) => {
    ctx.fillStyle = i % 3 === 0 ? '#ff9d5c' : '#5fe0ef'
    ctx.beginPath()
    ctx.arc(n[0], n[1], 4, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.fillStyle = '#8fe6ff'
  ctx.font = '20px "JetBrains Mono", monospace'
  ctx.fillText('NETWORK MAP', 18, 30)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
