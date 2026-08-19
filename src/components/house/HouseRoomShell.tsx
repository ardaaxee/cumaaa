import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { registerCollider, unregisterCollider } from '../../systems/collisionSystem'
import { WALL_T, type RoomBox } from '../../config/houseLayout'

export interface SurfaceMat {
  color: string
  map?: THREE.Texture
  normalMap?: THREE.Texture
  roughness?: number
  metalness?: number
}

interface BoxSpec {
  pos: [number, number, number]
  size: [number, number, number]
}

// Builds one room's shell: inset walls (with doorway gaps + lintels), floor,
// ceiling, skirting, and matching colliders. Adjacent rooms each build their own
// inset walls so a shared boundary reads as one solid partition.
export function HouseRoomShell({
  room,
  floor,
  wall,
  ceilingColor = '#2b2620',
  skirting = '#c9c2b6',
}: {
  room: RoomBox
  floor: SurfaceMat
  wall: SurfaceMat
  ceilingColor?: string
  skirting?: string
}) {
  const { walls, lintels } = useMemo(() => computeWalls(room), [room])

  useEffect(() => {
    walls.forEach((w, i) => registerCollider(`${room.id}-wall-${i}`, w.pos, w.size))
    return () => walls.forEach((_, i) => unregisterCollider(`${room.id}-wall-${i}`))
  }, [room.id, walls])

  const w = room.maxX - room.minX
  const d = room.maxZ - room.minZ
  const cx = (room.minX + room.maxX) / 2
  const cz = (room.minZ + room.maxZ) / 2

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0, cz]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial
          color={floor.color}
          map={floor.map}
          normalMap={floor.normalMap}
          roughness={floor.roughness ?? 0.8}
          metalness={floor.metalness ?? 0.05}
          envMapIntensity={0.5}
        />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[cx, room.height, cz]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={ceilingColor} roughness={0.98} />
      </mesh>

      {/* Walls */}
      {walls.map((b, i) => (
        <mesh key={`w${i}`} position={b.pos} receiveShadow castShadow>
          <boxGeometry args={b.size} />
          <meshStandardMaterial
            color={wall.color}
            map={wall.map}
            normalMap={wall.normalMap}
            roughness={wall.roughness ?? 0.9}
            metalness={wall.metalness ?? 0.03}
            envMapIntensity={0.35}
          />
        </mesh>
      ))}
      {/* Lintels above doorways */}
      {lintels.map((b, i) => (
        <mesh key={`l${i}`} position={b.pos} receiveShadow>
          <boxGeometry args={b.size} />
          <meshStandardMaterial color={wall.color} map={wall.map} normalMap={wall.normalMap} roughness={0.9} />
        </mesh>
      ))}

      {/* Skirting along the four walls (thin, matte) */}
      <Skirting room={room} color={skirting} />
    </group>
  )
}

function Skirting({ room, color }: { room: RoomBox; color: string }) {
  const t = WALL_T
  const strips: BoxSpec[] = [
    { pos: [(room.minX + room.maxX) / 2, 0.07, room.minZ + t / 2 + 0.005], size: [room.maxX - room.minX, 0.13, 0.02] },
    { pos: [(room.minX + room.maxX) / 2, 0.07, room.maxZ - t / 2 - 0.005], size: [room.maxX - room.minX, 0.13, 0.02] },
    { pos: [room.minX + t / 2 + 0.005, 0.07, (room.minZ + room.maxZ) / 2], size: [0.02, 0.13, room.maxZ - room.minZ] },
    { pos: [room.maxX - t / 2 - 0.005, 0.07, (room.minZ + room.maxZ) / 2], size: [0.02, 0.13, room.maxZ - room.minZ] },
  ]
  return (
    <>
      {strips.map((s, i) => (
        <mesh key={i} position={s.pos}>
          <boxGeometry args={s.size} />
          <meshStandardMaterial color={color} roughness={0.75} />
        </mesh>
      ))}
    </>
  )
}

function computeWalls(room: RoomBox): { walls: BoxSpec[]; lintels: BoxSpec[] } {
  const { minX, maxX, minZ, maxZ, height: H } = room
  const t = WALL_T
  const walls: BoxSpec[] = []
  const lintels: BoxSpec[] = []
  const opening = (side: string) => room.openings.find((o) => o.side === side)

  const buildH = (zEdge: number, inset: number, side: 'south' | 'north') => {
    const z = zEdge + inset * (t / 2)
    const o = opening(side)
    if (!o) {
      walls.push({ pos: [(minX + maxX) / 2, H / 2, z], size: [maxX - minX, H, t] })
      return
    }
    const gL = o.center - o.half
    const gR = o.center + o.half
    if (gL > minX) walls.push({ pos: [(minX + gL) / 2, H / 2, z], size: [gL - minX, H, t] })
    if (maxX > gR) walls.push({ pos: [(gR + maxX) / 2, H / 2, z], size: [maxX - gR, H, t] })
    lintels.push({ pos: [o.center, (o.height + H) / 2, z], size: [o.half * 2, H - o.height, t] })
  }
  const buildV = (xEdge: number, inset: number, side: 'west' | 'east') => {
    const x = xEdge + inset * (t / 2)
    const o = opening(side)
    if (!o) {
      walls.push({ pos: [x, H / 2, (minZ + maxZ) / 2], size: [t, H, maxZ - minZ] })
      return
    }
    const gL = o.center - o.half
    const gR = o.center + o.half
    if (gL > minZ) walls.push({ pos: [x, H / 2, (minZ + gL) / 2], size: [t, H, gL - minZ] })
    if (maxZ > gR) walls.push({ pos: [x, H / 2, (gR + maxZ) / 2], size: [t, H, maxZ - gR] })
    lintels.push({ pos: [x, (o.height + H) / 2, o.center], size: [t, H - o.height, o.half * 2] })
  }

  buildH(minZ, +1, 'south')
  buildH(maxZ, -1, 'north')
  buildV(minX, +1, 'west')
  buildV(maxX, -1, 'east')
  return { walls, lintels }
}
