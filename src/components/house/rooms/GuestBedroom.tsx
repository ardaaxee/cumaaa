import { useMemo } from 'react'
import { useCollider } from '../../furniture/useCollider'
import { fabric } from '../../../utils/textures'
import { CeilingLamp, Rug, FramedArt } from '../props'
import { WindowDaylight } from '../Window'
import { Panel } from '../../furniture/Panel'
import { seeded, jitter, shadeVary } from '../../../systems/imperfections'
import { center as roomCenter, type RoomBox } from '../../../config/houseLayout'

export interface BedroomStyle {
  duvet: string
  accent: string
  wood: string
}

// Where a piece of furniture stands: world (x, z) plus the yaw it faces.
export interface Placement {
  pos: [number, number]
  rotY: number
}

// Bed and wardrobe are built facing local -Z / +X respectively, so a yaw of 0
// puts the headboard against a SOUTH wall and the wardrobe doors toward +X.
// Rotating by ±PI/2 swaps the footprint's axes for the AABB collider.
const footprint = (rotY: number, w: number, d: number): [number, number] =>
  Math.abs(Math.sin(rotY)) > 0.5 ? [d, w] : [w, d]

// A furnished bedroom, parameterised so the three additional bedrooms of the
// 4+1 share one well-built implementation instead of three near-copies. Same
// construction language as the main bedroom: real bed layers (frame, mattress,
// sheet, duvet folds, pillows), a nightstand with a lamp, a wardrobe, a rug and
// a little lived-in clutter. All offsets are seeded, so it never re-shuffles.
//
// Placements are passed in per room rather than derived from the room centre:
// each bedroom has its door and window on a different wall, so "the far side of
// the room" is a different wall each time.
export function GuestBedroom({
  id,
  room,
  style,
  daylight,
  bed,
  wardrobe,
  art,
  double = false,
}: {
  id: string
  room: RoomBox
  style: BedroomStyle
  daylight: [number, number, number] // where window light enters
  bed: Placement // headboard side, against a wall
  wardrobe: Placement // doors face +X at yaw 0
  art: { pos: [number, number, number]; rotY: number }
  double?: boolean
}) {
  const duvet = useMemo(() => fabric(style.duvet, `${id}_duvet`), [style.duvet, id])
  const sheet = useMemo(() => fabric('#cfc8bb', `${id}_sheet`), [id])
  const cloth = useMemo(() => fabric(style.accent, `${id}_cloth`), [style.accent, id])
  const [cx, , cz] = roomCenter(room)
  const bw = double ? 1.6 : 1.05 // bed width
  const bd = 2.05 // bed depth

  const bedFoot = footprint(bed.rotY, bw + 0.1, bd)
  const wardFoot = footprint(wardrobe.rotY, 0.6, 1.5)
  useCollider(`${id}-bed`, [bed.pos[0], 0, bed.pos[1]], [bedFoot[0], 0.6, bedFoot[1]])
  useCollider(`${id}-wardrobe`, [wardrobe.pos[0], 0, wardrobe.pos[1]], [wardFoot[0], 2, wardFoot[1]])

  return (
    <group>
      <CeilingLamp position={[cx, room.height - 0.2, cz]} intensity={1.15} />
      <WindowDaylight position={daylight} />
      <Rug position={[cx, 0.02, cz]} size={[2.2, 1.7]} color={shadeVary('#5a4f42', seeded(id), 0.1)} />

      {/* Bed — headboard at local -Z, so yaw decides which wall it backs onto */}
      <group position={[bed.pos[0], 0, bed.pos[1]]} rotation={[0, bed.rotY, 0]}>
        <Panel args={[bw, 0.26, bd - 0.04]} radius={0.02} position={[0, 0.21, 0]} receiveShadow>
          <meshStandardMaterial color={style.wood} roughness={0.7} />
        </Panel>
        <Panel args={[bw + 0.06, 0.22, bd]} radius={0.05} position={[0, 0.45, 0]}>
          <meshStandardMaterial color="#cfc8bb" map={sheet.map} normalMap={sheet.normalMap} roughness={0.92} />
        </Panel>
        {/* duvet in two soft folds, drawn back from the pillow end */}
        {[0.34, -0.3].map((dz, i) => {
          const r = seeded(`${id}dv${i}`)
          return (
            <Panel
              key={i}
              args={[bw + 0.02, 0.15, 0.72]}
              radius={0.055}
              position={[jitter(r, 0.02), 0.63 + jitter(r, 0.01), dz + jitter(r, 0.02)]}
              rotation={[jitter(r, 0.04), jitter(r, 0.02), 0]}
            >
              <meshStandardMaterial color={shadeVary(style.duvet, r, 0.06)} map={duvet.map} normalMap={duvet.normalMap} roughness={0.93} />
            </Panel>
          )
        })}
        {/* pillow(s) at the headboard end */}
        {(double ? [-0.36, 0.36] : [0]).map((px, i) => {
          const r = seeded(`${id}pil${i}`)
          return (
            <Panel
              key={i}
              args={[double ? 0.6 : 0.66, 0.15, 0.4]}
              radius={0.065}
              position={[px + jitter(r, 0.02), 0.66, -bd / 2 + 0.32 + jitter(r, 0.03)]}
              rotation={[jitter(r, 0.05), jitter(r, 0.12), jitter(r, 0.04)]}
            >
              <meshStandardMaterial color={shadeVary('#d8d0c2', r, 0.04)} map={sheet.map} normalMap={sheet.normalMap} roughness={0.95} />
            </Panel>
          )
        })}
        {/* headboard */}
        <Panel args={[bw + 0.12, 0.8, 0.1]} radius={0.04} position={[0, 0.72, -bd / 2 - 0.03]}>
          <meshStandardMaterial color={shadeVary(style.wood, seeded(`${id}hb`), 0.08)} roughness={0.75} />
        </Panel>

        {/* Nightstand + lamp, inside the bed group so it follows the headboard */}
        <group position={[bw / 2 + 0.36, 0, -bd / 2 + 0.42]}>
          <Panel args={[0.4, 0.48, 0.38]} radius={0.014} position={[0, 0.28, 0]} receiveShadow>
            <meshStandardMaterial color={style.wood} roughness={0.7} />
          </Panel>
          <Panel args={[0.34, 0.16, 0.02]} radius={0.007} position={[0, 0.32, 0.195]}>
            <meshStandardMaterial color={shadeVary(style.wood, seeded(`${id}dr`), 0.1)} roughness={0.6} />
          </Panel>
          <mesh position={[0, 0.62, 0]}>
            <cylinderGeometry args={[0.085, 0.1, 0.15, 12]} />
            <meshStandardMaterial color="#d8cdba" emissive="#ffdcae" emissiveIntensity={0.45} roughness={0.7} />
          </mesh>
          <pointLight position={[0, 0.66, 0]} color="#ffcf9a" intensity={0.26} distance={3} decay={2} />
        </group>
      </group>

      {/* Wardrobe — 0.6 deep, doors on local +X */}
      <group position={[wardrobe.pos[0], 0, wardrobe.pos[1]]} rotation={[0, wardrobe.rotY, 0]}>
        <Panel args={[0.6, 2, 1.5]} radius={0.016} position={[0, 1, 0]} receiveShadow>
          <meshStandardMaterial color={style.wood} roughness={0.62} />
        </Panel>
        {[-0.37, 0.37].map((dz, i) => (
          <group key={i}>
            <Panel args={[0.03, 1.9, 0.7]} radius={0.008} position={[0.305, 1, dz]}>
              <meshStandardMaterial color={shadeVary(style.wood, seeded(`${id}wd${i}`), 0.08)} roughness={0.6} />
            </Panel>
            <mesh position={[0.325, 1, dz + (i ? -0.28 : 0.28)]}>
              <cylinderGeometry args={[0.009, 0.009, 0.16, 8]} />
              <meshStandardMaterial color="#b8ae96" metalness={0.75} roughness={0.32} />
            </mesh>
          </group>
        ))}
        {/* A little life: folded clothes and a book dropped by the wardrobe */}
        <Panel args={[0.26, 0.05, 0.2]} radius={0.016} position={[0.55, 0.03, 0.5]} rotation={[0, 0.3, 0]}>
          <meshStandardMaterial color={style.accent} map={cloth.map} normalMap={cloth.normalMap} roughness={0.95} />
        </Panel>
        <Panel args={[0.16, 0.03, 0.22]} radius={0.005} position={[0.62, 0.02, -0.55]} rotation={[0, -0.5, 0]}>
          <meshStandardMaterial color="#6e5a44" roughness={0.85} />
        </Panel>
      </group>

      <FramedArt position={art.pos} rotation={[0, art.rotY, 0]} w={0.45} h={0.55} tone={[style.accent, '#2e2a24', '#c9a06a']} />
    </group>
  )
}
