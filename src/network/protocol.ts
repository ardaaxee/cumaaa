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

// ---- Home + lobby ---------------------------------------------------------

export const HOME_NAME_MAX = 24

// A home is the shared session two people meet in. It exists before anyone
// enters the house: players gather in the lobby, mark themselves ready, and the
// host starts it.
export interface HomeInfo {
  code: string
  name: string
  hostId: string
  started: boolean
}

export interface LobbyPlayer {
  id: string
  name: string
  role: PlayerRole
  ready: boolean
}

export function sanitizeHomeName(raw: unknown): string {
  if (typeof raw !== 'string') return 'HOME'
  const cleaned = raw.replace(/[^\p{L}\p{N} _\-.']/gu, '').trim().slice(0, HOME_NAME_MAX)
  return cleaned.length ? cleaned : 'HOME'
}

// World state changes are event-based so future systems (market, film night,
// decoration…) can extend the union without reworking the transport. NOTE: none
// of these touch player movement — each client owns its own controller. These
// only mutate SHARED home state (doors/lights/curtains/tv/movie/snacks).
export type WorldEventKind =
  | 'DOOR_TOGGLED'
  | 'LIGHT_TOGGLED'
  | 'TV_TOGGLED'
  | 'CURTAIN_TOGGLED'
  | 'TV_MEDIA_CHANGED'
  | 'TV_PLAY'
  | 'TV_PAUSE'
  | 'TV_SEEK'
  | 'MOVIE_MODE_CHANGED'
  | 'SNACK_TAKEN'

export interface WorldEvent {
  kind: WorldEventKind
  id: string // which door/light/tv/curtain/snack (or 'living' for the movie TV)
  value: boolean // on/open/taken = true
  media?: string // TV_MEDIA_CHANGED: media id/name
  time?: number // TV_PLAY/PAUSE/SEEK: playback position (seconds)
  by?: string // player id that caused it (optional)
}

// Shared movie/TV playback state (synced, throttled — never per-frame video).
export interface MovieState {
  media: string | null // selected media id, or null
  playing: boolean
  time: number // playback position at `updatedAt`
  updatedAt: number // server clock when time was set
}

// Authoritative-ish shared world state kept per room (NOT ARDA OS data).
export interface RoomState {
  roomId: string
  doors: Record<string, boolean>
  lights: Record<string, boolean>
  tv: Record<string, boolean>
  curtains: Record<string, boolean>
  snacks: Record<string, boolean> // id -> taken
  movie: MovieState
  movieMode: boolean // cinematic living-room mode
  timestamp: number
}

export function emptyMovieState(): MovieState {
  return { media: null, playing: false, time: 0, updatedAt: Date.now() }
}

export function emptyRoomState(roomId: string): RoomState {
  return {
    roomId,
    doors: {},
    lights: {},
    tv: {},
    curtains: {},
    snacks: {},
    movie: emptyMovieState(),
    movieMode: false,
    timestamp: Date.now(),
  }
}

// Apply an event to a room state in-place (used on both server and client).
export function applyEvent(room: RoomState, e: WorldEvent): void {
  switch (e.kind) {
    case 'DOOR_TOGGLED':
      room.doors[e.id] = e.value
      break
    case 'LIGHT_TOGGLED':
      room.lights[e.id] = e.value
      break
    case 'TV_TOGGLED':
      room.tv[e.id] = e.value
      break
    case 'CURTAIN_TOGGLED':
      room.curtains[e.id] = e.value
      break
    case 'SNACK_TAKEN':
      room.snacks[e.id] = e.value
      break
    case 'MOVIE_MODE_CHANGED':
      room.movieMode = e.value
      break
    case 'TV_MEDIA_CHANGED':
      room.movie = { media: e.media ?? null, playing: false, time: 0, updatedAt: Date.now() }
      break
    case 'TV_PLAY':
      room.movie = { ...room.movie, playing: true, time: e.time ?? room.movie.time, updatedAt: Date.now() }
      break
    case 'TV_PAUSE':
      room.movie = { ...room.movie, playing: false, time: e.time ?? room.movie.time, updatedAt: Date.now() }
      break
    case 'TV_SEEK':
      room.movie = { ...room.movie, time: e.time ?? room.movie.time, updatedAt: Date.now() }
      break
  }
  room.timestamp = Date.now()
}

// Playback position implied by the movie state at a given wall-clock time.
export function expectedMovieTime(movie: MovieState, now = Date.now()): number {
  if (!movie.playing) return movie.time
  return movie.time + (now - movie.updatedAt) / 1000
}

// ---- Chat -----------------------------------------------------------------

export const CHAT_MAX_LEN = 220
export const CHAT_HISTORY = 60 // messages kept per home (server + client)
export const CHAT_MIN_GAP_MS = 350 // per-player flood guard

export interface ChatMessage {
  id: string
  from: string // sender's player id
  name: string // display name at send time
  text: string
  at: number // server clock (ms)
}

// The one-tap phrases in the chat panel — the things you actually say while
// moving around a shared home.
export const QUICK_MESSAGES = [
  'Buraya gel',
  'Salona geçelim',
  'Film açalım',
  'Mutfaktayım',
  'Geliyorum',
] as const

// ---- Wire messages --------------------------------------------------------

export type ClientMessage =
  | { t: 'create'; name: string; homeName?: string }
  | { t: 'join'; roomId: string; name: string }
  | { t: 'state'; p: PlayerNetState }
  | { t: 'event'; event: WorldEvent }
  | { t: 'chat'; text: string }
  | { t: 'ready'; ready: boolean }
  | { t: 'start' }
  | { t: 'ping' }

export type ServerErrorCode = 'HOME_NOT_FOUND' | 'ROOM_FULL' | 'BAD_REQUEST'

export type ServerMessage =
  | {
      t: 'welcome'
      roomId: string
      playerId: string
      role: PlayerRole
      peers: PeerInfo[]
      room: RoomState
      chat: ChatMessage[]
      home: HomeInfo
      lobby: LobbyPlayer[]
    }
  | { t: 'lobby'; home: HomeInfo; players: LobbyPlayer[] }
  | { t: 'chat'; message: ChatMessage }
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

const EVENT_KINDS: WorldEventKind[] = [
  'DOOR_TOGGLED',
  'LIGHT_TOGGLED',
  'TV_TOGGLED',
  'CURTAIN_TOGGLED',
  'TV_MEDIA_CHANGED',
  'TV_PLAY',
  'TV_PAUSE',
  'TV_SEEK',
  'MOVIE_MODE_CHANGED',
  'SNACK_TAKEN',
]

// Chat is user text going straight to another person's screen, so it is
// stripped of control characters, collapsed and length-capped here — on the
// SERVER as well as the client. Rendering is plain text (React escapes it), so
// no markup can survive this path.
export function sanitizeChatText(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  // eslint-disable-next-line no-control-regex
  const cleaned = raw.replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, CHAT_MAX_LEN)
  return cleaned.length ? cleaned : null
}

export function sanitizeEvent(raw: unknown): WorldEvent | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const kind = r.kind as WorldEventKind
  if (!EVENT_KINDS.includes(kind)) return null
  if (typeof r.id !== 'string' || r.id.length === 0 || r.id.length > 40) return null
  const out: WorldEvent = { kind, id: r.id, value: !!r.value }
  if (typeof r.media === 'string' && r.media.length <= 80) out.media = r.media
  if (typeof r.time === 'number' && Number.isFinite(r.time)) out.time = Math.max(0, Math.min(60 * 60 * 6, r.time))
  return out
}
