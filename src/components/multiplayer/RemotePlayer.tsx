import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { peerStates } from '../../store/useMultiplayerStore'
import { useRoomStore } from '../../store/useRoomStore'
import type { GraphicsQuality } from '../../types'
import { isHighTier, isUltra } from '../../utils/device'
import { Avatar, type AvatarRig } from '../characters/Avatar'
import { animateAvatar } from '../characters/animate'
import { lookFor } from '../characters/looks'

const EYE = 1.62

// The other player, in third person. Their transform arrives at ~15 Hz, so the
// avatar interpolates toward it rather than snapping, and the walk cycle is
// driven by distance actually covered — that way the gait always matches the
// movement, however irregular the packets are.
//
// This component owns NO input. It moves only from network state.
export function RemotePlayer({ id, name, quality }: { id: string; name: string; quality: GraphicsQuality }) {
  const root = useRef<THREE.Group>(null)
  const rig = useRef<AvatarRig>(null)
  const label = useRef<THREE.Sprite>(null)
  const labelMat = useRef<THREE.SpriteMaterial>(null)

  const cur = useRef({ x: 0, z: 0, ry: 0, lift: 0, sit: 0, speed: 0 })
  const phase = useRef(0)
  const born = useRef(performance.now())
  const { camera } = useThree()

  const showNames = useRoomStore((s) => s.settings.showPlayerNames)
  const seg = quality === 'low' ? 8 : quality === 'medium' ? 12 : isUltra(quality) ? 20 : 16
  const look = useMemo(() => lookFor(name), [name])
  const nameTex = useMemo(() => makeNameTexture(name), [name])

  useFrame((_, rawDelta) => {
    const g = root.current
    if (!g) return
    const target = peerStates.get(id)
    if (!target) return
    const delta = Math.min(rawDelta, 0.05)

    const k = 1 - Math.exp(-12 * delta)
    const px = cur.current.x
    const pz = cur.current.z
    cur.current.x += (target.x - cur.current.x) * k
    cur.current.z += (target.z - cur.current.z) * k
    cur.current.ry += shortestAngle(cur.current.ry, target.ry) * k
    const targetLift = Math.max(0, Math.min(1, target.y - EYE)) // jump arc only
    cur.current.lift += (targetLift - cur.current.lift) * k
    cur.current.sit += ((target.sit ? 1 : 0) - cur.current.sit) * Math.min(1, delta * 8)

    g.position.set(cur.current.x, cur.current.lift, cur.current.z)
    g.rotation.y = cur.current.ry

    // Ground speed from interpolated movement, smoothed so a dropped packet
    // doesn't read as a sudden stop.
    const moved = Math.hypot(cur.current.x - px, cur.current.z - pz)
    const instant = delta > 0 ? moved / delta : 0
    cur.current.speed += (instant - cur.current.speed) * Math.min(1, delta * 9)
    // Stride length: longer when running, so the feet don't scrabble.
    phase.current += moved * (target.run ? 5.4 : 7.6)

    if (rig.current) {
      animateAvatar(rig.current, {
        speed: cur.current.speed,
        running: !!target.run,
        sit: cur.current.sit,
        phase: phase.current,
        time: (performance.now() - born.current) / 1000,
      })
    }

    if (label.current && labelMat.current) {
      const dist = camera.position.distanceTo(g.position)
      labelMat.current.opacity = THREE.MathUtils.clamp(1.4 - dist / 12, 0.12, 0.95)
    }
  })

  return (
    <group ref={root}>
      <Avatar ref={rig} look={look} seg={seg} faces={isHighTier(quality)} />
      {showNames && (
        <sprite ref={label} position={[0, 1.95, 0]} scale={[0.9, 0.225, 1]}>
          <spriteMaterial ref={labelMat} map={nameTex} transparent depthTest={false} />
        </sprite>
      )}
    </group>
  )
}

function shortestAngle(current: number, target: number): number {
  let d = (target - current) % (Math.PI * 2)
  if (d > Math.PI) d -= Math.PI * 2
  if (d < -Math.PI) d += Math.PI * 2
  return d
}

function makeNameTexture(name: string): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, 256, 64)
  ctx.fillStyle = 'rgba(10,10,12,0.55)'
  roundRect(ctx, 8, 14, 240, 36, 10)
  ctx.fill()
  ctx.font = 'bold 26px Inter, system-ui, sans-serif'
  ctx.fillStyle = '#f0ece4'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(name.slice(0, 16).toUpperCase(), 128, 34)
  const tex = new THREE.CanvasTexture(canvas)
  tex.anisotropy = 4
  return tex
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
