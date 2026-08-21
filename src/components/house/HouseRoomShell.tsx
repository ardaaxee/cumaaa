import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { registerCollider, unregisterCollider } from '../../systems/collisionSystem'
import { WALL_T, type Opening, type RoomBox, type WindowSpec } from '../../config/houseLayout'
import { Window } from './Window'

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
  ceilingColor = '#dbd6cb',
  skirting = '#c9c2b6',
  windowDetail = 1,
}: {
  room: RoomBox
  floor: SurfaceMat
  wall: SurfaceMat
  /** Ceilings are painted white in real rooms and are usually the BRIGHTEST
   *  surface. They were left dark here, which stopped mattering only while the
   *  whole flat was dark — once daylight was fixed, a near-black ceiling over
   *  bright walls became the most obviously wrong thing in every shot. */
  ceilingColor?: string
  skirting?: string
  windowDetail?: number
}) {
  const { colliders, panels, lintels } = useMemo(() => computeWalls(room), [room])

  // Colliders stay full-height (door gaps only). Window openings are NOT carved
  // from the collider — glass is impassable, so the wall keeps blocking there.
  useEffect(() => {
    colliders.forEach((w, i) => registerCollider(`${room.id}-wall-${i}`, w.pos, w.size))
    return () => colliders.forEach((_, i) => unregisterCollider(`${room.id}-wall-${i}`))
  }, [room.id, colliders])

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

      {/* Wall panels (carved around doorways AND window openings) */}
      {panels.map((b, i) => (
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

      {/* Windows mounted in the carved openings (frame + glass + exterior) */}
      {(room.windows ?? []).map((spec, i) => (
        <Window key={`win${i}`} room={room} spec={spec} detail={windowDetail} />
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

const EPS = 0.001

// Builds a room's shell geometry. `colliders` are full-height wall segments
// (door gaps only) used for physics. `panels` are the visible wall meshes, which
// additionally have rectangular holes carved for window openings (sill + header
// + jambs). Keeping the two separate means glass stays impassable while the
// wall you can see through has a real hole in it.
function computeWalls(room: RoomBox): { colliders: BoxSpec[]; panels: BoxSpec[]; lintels: BoxSpec[] } {
  const { minX, maxX, minZ, maxZ, height: H } = room
  const t = WALL_T
  const colliders: BoxSpec[] = []
  const panels: BoxSpec[] = []
  const lintels: BoxSpec[] = []
  // A wall may carry SEVERAL doorways (the sleeping-wing corridor feeds two
  // bedrooms off one wall), so openings are collected and sorted, not just
  // "find the first one".
  const openingsOf = (side: string) =>
    room.openings.filter((o) => o.side === side).sort((a, b) => a.center - b.center)
  const winsOf = (side: string) => (room.windows ?? []).filter((w) => w.side === side)

  // Split a wall run [lo, hi] into the solid segments left between its doorways.
  const solidSegments = (lo: number, hi: number, ops: Opening[]): [number, number][] => {
    const segs: [number, number][] = []
    let cursor = lo
    for (const o of ops) {
      const gL = o.center - o.half
      const gR = o.center + o.half
      if (gL > cursor) segs.push([cursor, gL])
      cursor = Math.max(cursor, gR)
    }
    if (hi > cursor) segs.push([cursor, hi])
    return segs
  }

  // Carve a wall segment (along one axis) into panels, punching any window whose
  // centre falls inside [a, b]. `makeBox(along, span, y, yh)` builds a mesh box
  // positioned along the wall axis at centre `along` (width `span`) and vertical
  // centre `y` (height `yh`).
  const carveSegment = (a: number, b: number, wins: WindowSpec[], makeBox: (along: number, span: number, y: number, yh: number) => BoxSpec) => {
    const seg = wins.filter((w) => w.center > a && w.center < b)
    if (!seg.length) {
      panels.push(makeBox((a + b) / 2, b - a, H / 2, H))
      return
    }
    const w = seg[0] // one window per segment in this layout
    const wl = w.center - w.width / 2
    const wr = w.center + w.width / 2
    const top = w.sillY + w.height
    if (w.sillY > EPS) panels.push(makeBox((a + b) / 2, b - a, w.sillY / 2, w.sillY)) // below sill
    if (H - top > EPS) panels.push(makeBox((a + b) / 2, b - a, (top + H) / 2, H - top)) // above header
    if (wl - a > EPS) panels.push(makeBox((a + wl) / 2, wl - a, (w.sillY + top) / 2, w.height)) // left jamb
    if (b - wr > EPS) panels.push(makeBox((wr + b) / 2, b - wr, (w.sillY + top) / 2, w.height)) // right jamb
  }

  const buildH = (zEdge: number, inset: number, side: 'south' | 'north') => {
    const z = zEdge + inset * (t / 2)
    const wins = winsOf(side)
    const box = (x: number, span: number, y: number, yh: number): BoxSpec => ({ pos: [x, y, z], size: [span, yh, t] })
    const ops = openingsOf(side)
    const segs = solidSegments(minX, maxX, ops)
    for (const o of ops) {
      lintels.push({ pos: [o.center, (o.height + H) / 2, z], size: [o.half * 2, H - o.height, t] })
    }
    for (const [a, b] of segs) {
      colliders.push({ pos: [(a + b) / 2, H / 2, z], size: [b - a, H, t] })
      carveSegment(a, b, wins, box)
    }
  }
  const buildV = (xEdge: number, inset: number, side: 'west' | 'east') => {
    const x = xEdge + inset * (t / 2)
    const wins = winsOf(side)
    const box = (zc: number, span: number, y: number, yh: number): BoxSpec => ({ pos: [x, y, zc], size: [t, yh, span] })
    const ops = openingsOf(side)
    const segs = solidSegments(minZ, maxZ, ops)
    for (const o of ops) {
      lintels.push({ pos: [x, (o.height + H) / 2, o.center], size: [t, H - o.height, o.half * 2] })
    }
    for (const [a, b] of segs) {
      colliders.push({ pos: [x, H / 2, (a + b) / 2], size: [t, H, b - a] })
      carveSegment(a, b, wins, box)
    }
  }

  buildH(minZ, +1, 'south')
  buildH(maxZ, -1, 'north')
  buildV(minX, +1, 'west')
  buildV(maxX, -1, 'east')
  return { colliders, panels, lintels }
}
