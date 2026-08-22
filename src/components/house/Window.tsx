import { useMemo } from 'react'
import * as THREE from 'three'
import { useTimeOfDay } from '../../hooks/useClock'
import { skyPalette } from '../../systems/timeSystem'
import { fabric } from '../../utils/textures'
import { Exterior } from './Exterior'
import type { CurtainStyle, RoomBox, WindowSpec } from '../../config/houseLayout'
import { windowTransform } from '../../config/houseLayout'

const FRAME = '#d8d2c6'
const RAIL = '#4a3a28'

// A real, reusable window mounted flush in a carved wall opening: painted frame
// + mullions, a sill jutting into the room, a metal handle, low-cost glass with
// reflection + roughness, per-room curtains, and a believable exterior beyond.
// The wall keeps its collider, so the glass is impassable.
//
// Local +Z points outward (exterior); local -Z is the room side.
export function Window({ room, spec, detail = 1 }: { room: RoomBox; spec: WindowSpec; detail?: number }) {
  const { pos, rotY } = windowTransform(room, spec)
  const { width: w, height: h, frosted } = spec

  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {/* Exterior world (or a frosted privacy panel) — behind the glass */}
      {frosted ? <FrostedBackdrop w={w} h={h} /> : <Exterior w={w} h={h} seed={hashSide(room.id, spec.side)} detail={detail} />}

      {/* Glass */}
      <Glass w={w} h={h} frosted={frosted} />

      {/* Frame + mullions */}
      <Frame w={w} h={h} />

      {/* Sill into the room (local -Z) */}
      <mesh position={[0, -h / 2 - 0.03, -0.12]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.3, 0.07, 0.26]} />
        <meshStandardMaterial color={FRAME} roughness={0.7} />
      </mesh>

      {/* Handle on the frame */}
      <mesh position={[w / 2 - 0.06, 0, -0.05]}>
        <boxGeometry args={[0.03, 0.14, 0.03]} />
        <meshStandardMaterial color="#9a9488" metalness={0.7} roughness={0.35} />
      </mesh>

      {/* Curtains / blind on the room side */}
      <Curtain style={spec.curtain} w={w} h={h} />
    </group>
  )
}

function Glass({ w, h, frosted }: { w: number; h: number; frosted?: boolean }) {
  return (
    <group>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshPhysicalMaterial
          color={frosted ? '#dfe6e6' : '#aec4cf'}
          transparent
          opacity={frosted ? 0.5 : 0.12}
          roughness={frosted ? 0.55 : 0.05}
          metalness={0}
          transmission={frosted ? 0.35 : 0.55}
          thickness={0.02}
          reflectivity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Faint diagonal reflection streak on the glass (room side) */}
      {!frosted && (
        <mesh position={[-w * 0.12, h * 0.05, -0.012]} rotation={[0, 0, 0.5]}>
          <planeGeometry args={[w * 0.28, h * 1.1]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.05} depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}

function Frame({ w, h }: { w: number; h: number }) {
  const bars: { p: [number, number, number]; s: [number, number, number] }[] = [
    { p: [0, h / 2 + 0.06, 0.02], s: [w + 0.24, 0.12, 0.12] },
    { p: [0, -h / 2 - 0.06, 0.02], s: [w + 0.24, 0.12, 0.12] },
    { p: [-w / 2 - 0.06, 0, 0.02], s: [0.12, h + 0.24, 0.12] },
    { p: [w / 2 + 0.06, 0, 0.02], s: [0.12, h + 0.24, 0.12] },
    { p: [0, 0, 0.015], s: [0.06, h, 0.08] }, // vertical mullion
    { p: [0, 0, 0.015], s: [w, 0.06, 0.08] }, // horizontal mullion
  ]
  return (
    <group>
      {bars.map((b, i) => (
        <mesh key={i} position={b.p} castShadow>
          <boxGeometry args={b.s} />
          <meshStandardMaterial color={FRAME} roughness={0.7} metalness={0} />
        </mesh>
      ))}
    </group>
  )
}

// Frosted privacy glass: no clear view, but a soft bright panel tinted by the
// sky so it never reads as a black void. Faint blurred silhouettes for depth.
function FrostedBackdrop({ w, h }: { w: number; h: number }) {
  const tod = useTimeOfDay()
  const p = skyPalette(tod)
  const day = tod === 'day'
  return (
    <group position={[0, 0, 0.2]}>
      <mesh>
        <planeGeometry args={[w + 0.5, h + 0.5]} />
        <meshBasicMaterial color={day ? '#e8ecec' : p.bottom} fog={false} />
      </mesh>
      {[-0.2, 0.15].map((x, i) => (
        <mesh key={i} position={[x * w, -0.1, 0.05]}>
          <planeGeometry args={[w * 0.3, h * 0.7]} />
          <meshBasicMaterial color={day ? '#d2d8d6' : '#2a2e36'} transparent opacity={0.5} fog={false} />
        </mesh>
      ))}
    </group>
  )
}

// Per-room curtains on the room side (local -Z).
function Curtain({ style, w, h }: { style: CurtainStyle; w: number; h: number }) {
  const cloth = useMemo(() => fabric(clothColor(style), 'win_' + style), [style])
  if (style === 'none') return null

  if (style === 'blind') {
    // Kitchen roller blind, half-lowered, with slat lines.
    const bh = h * 0.55
    return (
      <group position={[0, h / 2 - bh / 2, -0.16]}>
        <mesh castShadow>
          <boxGeometry args={[w + 0.1, bh, 0.03]} />
          <meshStandardMaterial color="#c7c1b3" roughness={0.9} />
        </mesh>
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={i} position={[0, bh / 2 - 0.1 - i * (bh / 6), 0.02]}>
            <boxGeometry args={[w + 0.1, 0.01, 0.005]} />
            <meshStandardMaterial color="#a8a294" roughness={0.9} />
          </mesh>
        ))}
        <mesh position={[0, -bh / 2 - 0.02, 0.02]}>
          <boxGeometry args={[w + 0.12, 0.04, 0.04]} />
          <meshStandardMaterial color="#9a9488" roughness={0.7} />
        </mesh>
      </group>
    )
  }

  // Fabric side panels (sheer = light/wide, thick = dense/darker).
  const thick = style === 'thick'
  const panelW = thick ? 0.16 : 0.13
  const folds = thick ? [-0.2, -0.07, 0.07, 0.2] : [-0.18, -0.06, 0.06, 0.18]
  const rod = h / 2 + 0.16
  const col = clothColor(style)
  return (
    <group position={[0, 0, -0.22]}>
      {/* rod */}
      <mesh position={[0, rod, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, w + 0.5, 8]} />
        <meshStandardMaterial color={RAIL} metalness={0.4} roughness={0.5} />
      </mesh>
      {/* valance */}
      {thick && (
        <mesh position={[0, rod - 0.09, 0.02]} castShadow>
          <boxGeometry args={[w + 0.4, 0.18, 0.05]} />
          <meshStandardMaterial color={col} map={cloth.map} normalMap={cloth.normalMap} roughness={0.95} />
        </mesh>
      )}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (w / 2 + 0.02), 0, 0]}>
          {folds.map((ox, j) => (
            <mesh key={j} position={[s * ox, 0, Math.sin(j) * 0.03]} rotation={[0, s * 0.05 * j, 0]} castShadow>
              <boxGeometry args={[panelW, h + 0.24, 0.04]} />
              <meshStandardMaterial color={col} map={cloth.map} normalMap={cloth.normalMap} roughness={0.95} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function clothColor(style: CurtainStyle): string {
  switch (style) {
    case 'thick':
      return '#5c5348'
    case 'sheer':
      return '#b8b1a2'
    default:
      return '#8f8576'
  }
}

// Soft daylight entering through a window — a non-shadow point light just inside
// the opening, tinted and scaled by the real time-of-day. Lives in the culled
// room group so it only costs anything when you're actually in the room. At
// night it fades to a faint cool spill; the room's warm lamps take over.
export function WindowDaylight({ position }: { position: [number, number, number] }) {
  const tod = useTimeOfDay()
  const p = skyPalette(tod)
  const day = tod === 'day'
  const intensity = day ? 1.35 : tod === 'sunset' ? 0.7 : 0.12
  const color = day ? '#eaf0f5' : p.sun
  return <pointLight position={position} color={color} intensity={intensity} distance={7} decay={1.6} />
}

function hashSide(id: string, side: string): number {
  let h = 0
  const s = id + side
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000
  return h + 1
}
