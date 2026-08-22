import { useEffect, useState } from 'react'
import { ROOMS, BALCONY } from '../../config/houseLayout'
import { HALF_W, HALF_D } from '../../config/roomLayout'
import { playerMotion } from '../../systems/playerMotion'
import { peerStates, useMultiplayerStore } from '../../store/useMultiplayerStore'

// Human-readable names for the map. The study is the original room and lives
// outside ROOMS, so it is listed here alongside the balcony.
const ROOM_LABELS: Record<string, string> = {
  study: 'STUDY',
  hallway: 'HALL',
  living: 'LIVING',
  kitchen: 'KITCHEN',
  bedroom: 'BEDROOM 1',
  bathroom: 'BATH 1',
  storage: 'STORAGE',
  corridor: 'CORRIDOR',
  bedroom2: 'BEDROOM 2',
  bedroom3: 'BEDROOM 3',
  bedroom4: 'BEDROOM 4',
  bathroom2: 'BATH 2',
  laundry: 'LAUNDRY',
  balcony: 'BALCONY',
}

interface Cell {
  id: string
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

// Every walkable area in one list, in world metres.
const CELLS: Cell[] = [
  { id: 'study', minX: -HALF_W, maxX: HALF_W, minZ: -HALF_D, maxZ: HALF_D },
  ...ROOMS.map((r) => ({ id: r.id, minX: r.minX, maxX: r.maxX, minZ: r.minZ, maxZ: r.maxZ })),
  { id: 'balcony', minX: BALCONY.minX, maxX: BALCONY.maxX, minZ: BALCONY.minZ, maxZ: BALCONY.maxZ },
]

const PAD = 1
const BOUNDS = {
  minX: Math.min(...CELLS.map((c) => c.minX)) - PAD,
  maxX: Math.max(...CELLS.map((c) => c.maxX)) + PAD,
  minZ: Math.min(...CELLS.map((c) => c.minZ)) - PAD,
  maxZ: Math.max(...CELLS.map((c) => c.maxZ)) + PAD,
}
const W = BOUNDS.maxX - BOUNDS.minX
const H = BOUNDS.maxZ - BOUNDS.minZ

// World +Z runs "up" the plan, so the SVG y axis is flipped to match how the
// house reads when you walk it.
const sx = (x: number) => x - BOUNDS.minX
const sy = (z: number) => BOUNDS.maxZ - z

export function roomAt(x: number, z: number): string | null {
  const cell = CELLS.find((c) => x >= c.minX && x <= c.maxX && z >= c.minZ && z <= c.maxZ)
  return cell ? ROOM_LABELS[cell.id] ?? cell.id : null
}

// A plan of the whole flat with both players on it. Positions are polled a few
// times a second from the mutable motion channel and the peer map — never from
// React state, so the map costs nothing per frame.
export function HomeMap({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  const peers = useMultiplayerStore((s) => s.peers)
  const selfName = useMultiplayerStore((s) => s.selfName)
  const [, tick] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => tick((n) => n + 1), 220)
    return () => window.clearInterval(id)
  }, [])

  const me = { x: playerMotion.x, z: playerMotion.z }
  const others = peers.map((p) => ({ name: p.name, s: peerStates.get(p.id) })).filter((o) => o.s)
  const here = roomAt(me.x, me.z)

  // Sized against the SHORT axis too. Width alone made the map ~38vw of a
  // landscape phone — several hundred pixels tall on a 430px-high viewport, so
  // it ran off the bottom and sat on top of the RUN/JUMP buttons.
  const size = expanded ? 'w-[min(70vw,52vh,300px)]' : 'w-[min(38vw,30vh,150px)]'

  return (
    <div className={`pointer-events-auto ${size}`}>
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-t-xl border border-white/12 border-b-0 bg-ink-950/80 px-2.5 py-1.5 backdrop-blur-sm"
        aria-label={expanded ? 'Shrink map' : 'Expand map'}
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">MAP</span>
        <span className="truncate font-mono text-[9px] uppercase tracking-widest text-white/70">{here ?? '—'}</span>
      </button>
      <div className="rounded-b-xl border border-white/12 bg-ink-950/80 p-1.5 backdrop-blur-sm">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Home map">
          {CELLS.map((c) => (
            <g key={c.id}>
              <rect
                x={sx(c.minX)}
                y={sy(c.maxZ)}
                width={c.maxX - c.minX}
                height={c.maxZ - c.minZ}
                fill="rgba(255,255,255,0.045)"
                stroke="rgba(255,255,255,0.16)"
                strokeWidth={0.12}
                rx={0.25}
              />
              {expanded && (
                <text
                  x={sx((c.minX + c.maxX) / 2)}
                  y={sy((c.minZ + c.maxZ) / 2) + 0.35}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.45)"
                  fontSize={0.85}
                  fontFamily="ui-monospace, monospace"
                >
                  {ROOM_LABELS[c.id] ?? c.id}
                </text>
              )}
            </g>
          ))}

          {/* Partner(s) */}
          {others.map((o, i) => (
            <g key={i}>
              <circle cx={sx(o.s!.x)} cy={sy(o.s!.z)} r={0.55} fill="#e0b070" />
              {expanded && (
                <text
                  x={sx(o.s!.x)}
                  y={sy(o.s!.z) - 0.9}
                  textAnchor="middle"
                  fill="#e0b070"
                  fontSize={0.8}
                  fontFamily="ui-monospace, monospace"
                >
                  {o.name}
                </text>
              )}
            </g>
          ))}

          {/* You */}
          <circle cx={sx(me.x)} cy={sy(me.z)} r={0.6} fill="#6fd3d8" />
          {expanded && (
            <text
              x={sx(me.x)}
              y={sy(me.z) - 0.95}
              textAnchor="middle"
              fill="#6fd3d8"
              fontSize={0.8}
              fontFamily="ui-monospace, monospace"
            >
              {selfName}
            </text>
          )}
        </svg>
      </div>
    </div>
  )
}
