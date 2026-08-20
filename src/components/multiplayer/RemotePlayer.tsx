import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { peerStates } from '../../store/useMultiplayerStore'
import type { GraphicsQuality } from '../../types'

const EYE = 1.62

// A lightweight procedural co-op avatar (head / torso / arms / legs) that
// smoothly interpolates toward the latest networked transform — no teleport
// jitter. Walk/run swings the limbs, jump lifts the body, sit folds it onto a
// seat. A name label floats above and fades with distance. Detail scales with
// the quality tier. No heavy character asset.
export function RemotePlayer({ id, name, quality }: { id: string; name: string; quality: GraphicsQuality }) {
  const root = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)
  const legL = useRef<THREE.Group>(null)
  const legR = useRef<THREE.Group>(null)
  const armL = useRef<THREE.Group>(null)
  const armR = useRef<THREE.Group>(null)
  const label = useRef<THREE.Sprite>(null)
  const labelMat = useRef<THREE.SpriteMaterial>(null)

  const cur = useRef({ x: 0, z: 0, ry: 0, lift: 0, sit: 0 })
  const phase = useRef(0)
  const { camera } = useThree()

  const seg = quality === 'low' ? 8 : quality === 'medium' ? 12 : 18
  // Distinguish players by name (CUMA vs ZEYNEP) while keeping equal quality.
  const look = useMemo(() => paletteFor(name), [name])
  const { skin, shirt, pants, hair } = look

  const nameTex = useMemo(() => makeNameTexture(name), [name])

  useFrame((_, rawDelta) => {
    const g = root.current
    if (!g) return
    const target = peerStates.get(id)
    if (!target) return
    const delta = Math.min(rawDelta, 0.05)

    // Position interpolation (smooths 15 Hz + jitter).
    const k = 1 - Math.exp(-12 * delta)
    const px = cur.current.x
    const pz = cur.current.z
    cur.current.x += (target.x - cur.current.x) * k
    cur.current.z += (target.z - cur.current.z) * k
    cur.current.ry += shortestAngle(cur.current.ry, target.ry) * k
    const targetLift = Math.max(0, Math.min(1, target.y - EYE)) // jump height only
    cur.current.lift += (targetLift - cur.current.lift) * k
    cur.current.sit += ((target.sit ? 1 : 0) - cur.current.sit) * Math.min(1, delta * 8)

    g.position.set(cur.current.x, cur.current.lift, cur.current.z)
    g.rotation.y = cur.current.ry

    // Limb swing driven by ground speed; faster when running.
    const moved = Math.hypot(cur.current.x - px, cur.current.z - pz)
    phase.current += moved * (target.run ? 11 : 7.5)
    const amp = (target.run ? 0.9 : 0.55) * (1 - cur.current.sit)
    const s = Math.sin(phase.current) * amp
    if (legL.current) legL.current.rotation.x = s
    if (legR.current) legR.current.rotation.x = -s
    if (armL.current) armL.current.rotation.x = -s * 0.7
    if (armR.current) armR.current.rotation.x = s * 0.7

    // Seated pose: fold hips/knees and drop the body onto the seat.
    const sit = cur.current.sit
    if (body.current) body.current.position.y = -sit * 0.42
    if (legL.current) legL.current.rotation.x = THREE.MathUtils.lerp(legL.current.rotation.x, -1.4, sit)
    if (legR.current) legR.current.rotation.x = THREE.MathUtils.lerp(legR.current.rotation.x, -1.4, sit)

    // Name label: face the camera, fade with distance.
    if (label.current && labelMat.current) {
      const dist = camera.position.distanceTo(g.position)
      labelMat.current.opacity = THREE.MathUtils.clamp(1.4 - dist / 12, 0.12, 0.95)
    }
  })

  return (
    <group ref={root}>
      <group ref={body}>
        {/* Torso */}
        <mesh position={[0, 1.05, 0]} castShadow>
          <capsuleGeometry args={[0.17, 0.4, 2, seg]} />
          <meshStandardMaterial color={shirt} roughness={0.85} />
        </mesh>
        {/* Shoulders — widen the top of the torso so it reads human */}
        <mesh position={[0, 1.26, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <capsuleGeometry args={[0.088, 0.3, 2, seg]} />
          <meshStandardMaterial color={shirt} roughness={0.86} />
        </mesh>
        {/* Neck */}
        <mesh position={[0, 1.34, 0]}>
          <cylinderGeometry args={[0.06, 0.07, 0.1, seg]} />
          <meshStandardMaterial color={skin} roughness={0.7} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 1.52, 0]} scale={[1, 1.08, 1]} castShadow>
          <sphereGeometry args={[0.135, seg, seg]} />
          <meshStandardMaterial color={skin} roughness={0.7} />
        </mesh>
        {/* Hair cap */}
        <mesh position={[0, 1.57, -0.01]}>
          <sphereGeometry args={[0.145, seg, seg, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color={hair} roughness={0.9} />
        </mesh>
        {/* Longer hair at the back (distinguishes ZEYNEP) */}
        {look.longHair && (
          <mesh position={[0, 1.42, -0.09]}>
            <capsuleGeometry args={[0.11, 0.22, 2, seg]} />
            <meshStandardMaterial color={hair} roughness={0.9} />
          </mesh>
        )}
        {/* Arms (shoulder-pivoted) */}
        <group ref={armL} position={[-0.24, 1.28, 0]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <capsuleGeometry args={[0.055, 0.34, 2, seg]} />
            <meshStandardMaterial color={shirt} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.44, 0]}>
            <sphereGeometry args={[0.06, seg, seg]} />
            <meshStandardMaterial color={skin} roughness={0.7} />
          </mesh>
        </group>
        <group ref={armR} position={[0.24, 1.28, 0]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <capsuleGeometry args={[0.055, 0.34, 2, seg]} />
            <meshStandardMaterial color={shirt} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.44, 0]}>
            <sphereGeometry args={[0.06, seg, seg]} />
            <meshStandardMaterial color={skin} roughness={0.7} />
          </mesh>
        </group>
      </group>
      {/* Legs (hip-pivoted) with shoes so the figure meets the floor properly */}
      <group ref={legL} position={[-0.1, 0.82, 0]}>
        <mesh position={[0, -0.4, 0]} castShadow>
          <capsuleGeometry args={[0.072, 0.5, 2, seg]} />
          <meshStandardMaterial color={pants} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.76, 0.04]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <capsuleGeometry args={[0.058, 0.13, 2, seg]} />
          <meshStandardMaterial color={look.shoe} roughness={0.65} />
        </mesh>
      </group>
      <group ref={legR} position={[0.1, 0.82, 0]}>
        <mesh position={[0, -0.4, 0]} castShadow>
          <capsuleGeometry args={[0.072, 0.5, 2, seg]} />
          <meshStandardMaterial color={pants} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.76, 0.04]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <capsuleGeometry args={[0.058, 0.13, 2, seg]} />
          <meshStandardMaterial color={look.shoe} roughness={0.65} />
        </mesh>
      </group>
      {/* Name label */}
      <sprite ref={label} position={[0, 1.95, 0]} scale={[0.9, 0.225, 1]}>
        <spriteMaterial ref={labelMat} map={nameTex} transparent depthTest={false} />
      </sprite>
    </group>
  )
}

// Per-player look derived from the display name — equal quality, distinct
// silhouette/colours so CUMA and ZEYNEP are easy to tell apart.
function paletteFor(name: string): { skin: string; shirt: string; pants: string; hair: string; shoe: string; longHair: boolean } {
  const n = name.trim().toUpperCase()
  if (n.startsWith('ZEYNEP') || n.startsWith('Z')) {
    return { skin: '#e0b48f', shirt: '#a86f86', pants: '#4a4450', hair: '#2a1c18', shoe: '#6b5f68', longHair: true }
  }
  // CUMA (and default)
  return { skin: '#d3a67c', shirt: '#586274', pants: '#3a4250', hair: '#241d18', shoe: '#4a4a52', longHair: false }
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
