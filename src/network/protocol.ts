// Shared, typed network protocol for ARDA HOME co-op. Imported by BOTH the
// browser client (src/) and the Node server (server/), so it must stay free of
// any DOM or Node dependency — plain types + pure helpers only.

export const NET_TICK_HZ = 15 // player-state broadcasts per second
export const NET_SEND_MS = 1000 / NET_TICK_HZ
export const MAX_PLAYERS = 2 // two-player foundation
export const ROOM_GRACE_MS = 60_000 // keep an empty room this long for reconnect
export const ROOM_CODE_LEN = 6

export type PlayerRole = 'host' | 'guest'

// The minimal per-frame state we sync for a remote avatar.
export interface PlayerNetState {
  x: number
  y: number
  z: number
  ry: number // yaw (radians)
  run: boolean
  jump: boolean
  sit: boolean
}

export interface PeerInfo {
  id: string
  name: string
  role: PlayerRole
}

// World state changes are event-based so future systems (market, film night,
// decoration…) can extend the union without reworking the transport.
export type WorldEventKind = 'DOOR_TOGGLED' | 'LIGHT_TOGGLED' | 'TV_TOGGLED' | 'CURTAIN_TOGGLED'

export interface WorldEvent {
  kind: WorldEventKind
  id: string // which door/light/tv/curtain
  value: boolean // on/open = true
  by?: string // player id that caused it (optional)
}

// Authoritative-ish shared world state kept per room (NOT ARDA OS data).
export interface RoomState {
  roomId: string
  doors: Record<string, boolean>
  lights: Record<string, boolean>
  tv: Record<string, boolean>
  curtains: Record<string, boolean>
  timestamp: number
}

export function emptyRoomState(roomId: string): RoomState {
  return { roomId, doors: {}, lights: {}, tv: {}, curtains: {}, timestamp: Date.now() }
}

// Apply an event to a room state in-place (used on both server and client).
export function applyEvent(room: RoomState, e: WorldEvent): void {
  const bucket =
    e.kind === 'DOOR_TOGGLED'
      ? room.doors
      : e.kind === 'LIGHT_TOGGLED'
        ? room.lights
        : e.kind === 'TV_TOGGLED'
          ? room.tv
          : room.curtains
  bucket[e.id] = e.value
  room.timestamp = Date.now()
}

// ---- Wire messages --------------------------------------------------------

export type ClientMessage =
  | { t: 'create'; name: string }
  | { t: 'join'; roomId: string; name: string }
  | { t: 'state'; p: PlayerNetState }
  | { t: 'event'; event: WorldEvent }
  | { t: 'ping' }

export type ServerErrorCode = 'HOME_NOT_FOUND' | 'ROOM_FULL' | 'BAD_REQUEST'

export type ServerMessage =
  | { t: 'welcome'; roomId: string; playerId: string; role: PlayerRole; peers: PeerInfo[]; room: RoomState }
  | { t: 'error'; code: ServerErrorCode }
  | { t: 'peer_join'; peer: PeerInfo }
  | { t: 'peer_leave'; playerId: string }
  | { t: 'states'; players: (PlayerNetState & { id: string })[] }
  | { t: 'event'; event: WorldEvent }
  | { t: 'room'; room: RoomState }
  | { t: 'pong' }

// ---- Validation / sanitisation (never trust the wire) ---------------------

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // no ambiguous 0/O/1/I/L

export function generateRoomCode(): string {
  let s = ''
  for (let i = 0; i < ROOM_CODE_LEN; i++) {
    s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  }
  return s
}

export function normalizeRoomCode(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const up = raw.trim().toUpperCase()
  if (up.length !== ROOM_CODE_LEN) return null
  for (const ch of up) if (!CODE_ALPHABET.includes(ch)) return null
  return up
}

export function sanitizeName(raw: unknown): string {
  if (typeof raw !== 'string') return 'GUEST'
  const cleaned = raw.replace(/[^\p{L}\p{N} _\-.]/gu, '').trim().slice(0, 16)
  return cleaned.length ? cleaned : 'GUEST'
}

const NUM_MIN = -60
const NUM_MAX = 60

function clampNum(v: unknown, lo: number, hi: number): number | null {
  if (typeof v !== 'number' || !Number.isFinite(v)) return null
  return Math.max(lo, Math.min(hi, v))
}

// Returns a clean PlayerNetState or null if the payload is malformed/abusive.
export function sanitizeState(raw: unknown): PlayerNetState | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const x = clampNum(r.x, NUM_MIN, NUM_MAX)
  const y = clampNum(r.y, -5, 10)
  const z = clampNum(r.z, NUM_MIN, NUM_MAX)
  const ry = clampNum(r.ry, -Math.PI * 4, Math.PI * 4)
  if (x === null || y === null || z === null || ry === null) return null
  return { x, y, z, ry, run: !!r.run, jump: !!r.jump, sit: !!r.sit }
}

const EVENT_KINDS: WorldEventKind[] = ['DOOR_TOGGLED', 'LIGHT_TOGGLED', 'TV_TOGGLED', 'CURTAIN_TOGGLED']

export function sanitizeEvent(raw: unknown): WorldEvent | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  if (!EVENT_KINDS.includes(r.kind as WorldEventKind)) return null
  if (typeof r.id !== 'string' || r.id.length === 0 || r.id.length > 40) return null
  return { kind: r.kind as WorldEventKind, id: r.id, value: !!r.value }
}
