// Shared, typed network protocol for ARDA HOME co-op. Imported by BOTH the
// browser client (src/) and the Node server (server/), so it must stay free of
// any DOM or Node dependency — plain types + pure helpers only.

export const NET_TICK_HZ = 15 // player-state broadcasts per second
export const NET_SEND_MS = 1000 / NET_TICK_HZ
export const MAX_PLAYERS = 2 // two-player foundation
export const ROOM_GRACE_MS = 60_000 // keep an empty room this long for reconnect
export const ROOM_CODE_LEN = 6

export type PlayerRole = 'host' | 'guest'

// What a character is doing, mirrored from src/components/characters/actions.
// Kept as a plain string union here so the protocol has no import into the
// component tree — the server must be able to validate it without React.
export type PlayerAction =
  | 'idle' | 'walk' | 'run' | 'jump' | 'land' | 'sit' | 'stand' | 'wave' | 'point'
  | 'talk' | 'read' | 'use' | 'hold' | 'drink' | 'eat' | 'phone' | 'sleep'
  | 'cook' | 'shower' | 'watchTv' | 'open' | 'close' | 'pickUp' | 'drop' | 'carry'

export const PLAYER_ACTIONS: PlayerAction[] = [
  'idle', 'walk', 'run', 'jump', 'land', 'sit', 'stand', 'wave', 'point', 'talk',
  'read', 'use', 'hold', 'drink', 'eat', 'phone', 'sleep', 'cook', 'shower',
  'watchTv', 'open', 'close', 'pickUp', 'drop', 'carry',
]

// The minimal per-frame state we sync for a remote avatar.
export interface PlayerNetState {
  x: number
  y: number
  z: number
  ry: number // yaw (radians)
  run: boolean
  jump: boolean
  sit: boolean
  /** What they are doing, so the other player sees it and not just movement. */
  act: PlayerAction
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
// Sky conditions, shared so both players stand in the same weather.
export type Weather = 'sunny' | 'cloudy' | 'rain'
export const WEATHERS: Weather[] = ['sunny', 'cloudy', 'rain']

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
  | 'WEATHER_CHANGED'
  | 'APPLIANCE_TOGGLED'
  | 'OPENABLE_TOGGLED'

export interface WorldEvent {
  kind: WorldEventKind
  id: string // which door/light/tv/curtain/snack (or 'living' for the movie TV)
  value: boolean // on/open/taken = true
  media?: string // TV_MEDIA_CHANGED: media id/name
  time?: number // TV_PLAY/PAUSE/SEEK: playback position (seconds)
  weather?: Weather // WEATHER_CHANGED
  by?: string // player id that caused it (optional)
}

// ---- Items ----------------------------------------------------------------
// An item INSTANCE. The definition (name, weight, how it is held) is static and
// lives in src/config/items.ts; this is the one that exists in the world, with
// its own identity, place and contents.
//
// Every item is somewhere, and "somewhere" is one of four things: lying in the
// world, sitting in a slot of a container or surface, in someone's hand, or in
// their bag. Keeping all four in one field means the fridge, the counter, the
// oven and a player's hand are the same mechanism, and all of it rides the
// existing room-state channel — so it syncs, and it is still there after a
// rejoin, without a second system.

export type ItemLocation =
  | { at: 'world'; x: number; y: number; z: number; ry: number }
  | { at: 'spot'; id: string; slot: number }
  | { at: 'hand'; by: string }
  | { at: 'bag'; by: string }

export interface WorldItem {
  uid: string
  def: string // item definition id
  loc: ItemLocation
  /** Vessels: how much is in it, in the definition's units. */
  fill?: number
  fluid?: string // what it is filled with
  /** Cookware and food: 0 raw → 1 cooked. Past 1.35 it is burnt. */
  cooked?: number
}

export const BAG_SLOTS = 6 // pockets; the hand holds one thing on top of this
export const ITEM_REACH = 2.4 // metres — how far you can take or place from

// Where items can sit. Shared by client and server: the client draws slot i
// here, and the server range-checks against the same numbers, so neither side
// can disagree about where the fridge is.
//
// Slot i sits at base + col*colStep + row*rowStep, where col = i % cols.
export interface ItemSpot {
  id: string
  kind: 'container' | 'surface'
  base: [number, number, number]
  colStep: [number, number, number]
  rowStep: [number, number, number]
  cols: number
  slots: number
  /** Container must be open before anything can be taken from or put in it. */
  needsOpen?: string
}

export const ITEM_SPOTS: ItemSpot[] = [
  // Kitchen. Y values are the SURFACE the item stands on: item models are
  // authored with their origin at the base, so a slot's y is where it sits.
  {
    id: 'kitchen-fridge', kind: 'container', needsOpen: 'kitchen-fridge',
    base: [8.82, 0.46, 12.62], colStep: [0.18, 0, 0], rowStep: [0, 0.45, 0], cols: 3, slots: 9,
  },
  {
    id: 'kitchen-cupboard', kind: 'container', needsOpen: 'kitchen-cupboard',
    base: [2.3, 0.09, 13.5], colStep: [0.35, 0, 0], rowStep: [0, 0.39, 0], cols: 3, slots: 6,
  },
  {
    id: 'kitchen-drawer', kind: 'container', needsOpen: 'kitchen-drawer',
    base: [4.08, 0.63, 13.44], colStep: [0.11, 0, 0], rowStep: [0, 0, 0], cols: 5, slots: 5,
  },
  {
    id: 'kitchen-oven', kind: 'container', needsOpen: 'kitchen-oven',
    base: [5.55, 0.24, 13.5], colStep: [0.3, 0, 0], rowStep: [0, 0.26, 0], cols: 2, slots: 4,
  },
  {
    id: 'kitchen-counter', kind: 'surface',
    base: [3.5, 0.93, 13.45], colStep: [0.35, 0, 0], rowStep: [0, 0, 0], cols: 5, slots: 5,
  },
  {
    id: 'kitchen-hob', kind: 'surface',
    base: [5.56, 0.955, 13.35], colStep: [0.28, 0, 0], rowStep: [0, 0, 0.26], cols: 2, slots: 4,
  },
  {
    id: 'kitchen-shelf', kind: 'surface',
    base: [6.12, 1.535, 13.66], colStep: [0.18, 0, 0], rowStep: [0, 0, 0], cols: 3, slots: 3,
  },
  {
    id: 'kitchen-table', kind: 'surface',
    base: [4.15, 0.75, 8.6], colStep: [0.3, 0, 0], rowStep: [0, 0, 0], cols: 3, slots: 3,
  },
]

const SPOT_BY_ID = new Map(ITEM_SPOTS.map((s) => [s.id, s]))

export function itemSpot(id: string): ItemSpot | undefined {
  return SPOT_BY_ID.get(id)
}

/** World position of one slot. The single source of truth for both sides. */
export function slotPosition(spot: ItemSpot, slot: number): [number, number, number] {
  const col = slot % spot.cols
  const row = Math.floor(slot / spot.cols)
  return [
    spot.base[0] + spot.colStep[0] * col + spot.rowStep[0] * row,
    spot.base[1] + spot.colStep[1] * col + spot.rowStep[1] * row,
    spot.base[2] + spot.colStep[2] * col + spot.rowStep[2] * row,
  ]
}

/** Where an item physically is, for range checks. Hand/bag = on the player. */
export function itemWorldPosition(item: WorldItem): [number, number, number] | null {
  const l = item.loc
  if (l.at === 'world') return [l.x, l.y, l.z]
  if (l.at === 'spot') {
    const s = SPOT_BY_ID.get(l.id)
    return s ? slotPosition(s, l.slot) : null
  }
  return null // carried — the holder is by definition in range of it
}

export type ItemActionKind =
  | 'TAKE' // spot/world -> hand
  | 'DROP' // hand -> world at the player's feet
  | 'PLACE' // hand -> a free slot of a spot
  | 'STOW' // hand -> bag
  | 'EQUIP' // bag -> hand
  | 'FILL' // vessel in hand <- tap
  | 'POUR' // empty the vessel in hand
  | 'CONSUME' // eat/drink what is in hand
  | 'COOK' // advance a cooking state (server-driven)

export interface ItemAction {
  kind: ItemActionKind
  uid: string
  by: string // player id
  spot?: string // PLACE
  slot?: number // PLACE
  x?: number // DROP
  z?: number // DROP
  ry?: number // DROP
  fluid?: string // FILL
  amount?: number // FILL / COOK
}

/** First free slot of a spot, or -1. */
export function freeSlot(room: RoomState, spotId: string): number {
  const spot = SPOT_BY_ID.get(spotId)
  if (!spot) return -1
  const used = new Set<number>()
  for (const it of Object.values(room.items)) {
    if (it.loc.at === 'spot' && it.loc.id === spotId) used.add(it.loc.slot)
  }
  for (let i = 0; i < spot.slots; i++) if (!used.has(i)) return i
  return -1
}

export function heldItem(room: RoomState, playerId: string): WorldItem | null {
  for (const it of Object.values(room.items)) {
    if (it.loc.at === 'hand' && it.loc.by === playerId) return it
  }
  return null
}

export function bagItems(room: RoomState, playerId: string): WorldItem[] {
  return Object.values(room.items).filter((it) => it.loc.at === 'bag' && it.loc.by === playerId)
}

export function itemsAt(room: RoomState, spotId: string): WorldItem[] {
  return Object.values(room.items).filter((it) => it.loc.at === 'spot' && it.loc.id === spotId)
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
  // Doors on furniture (fridge, cabinets, drawers, wardrobes, washing machine)
  // and appliances that are simply on or off (kettle, stove, shower).
  openables: Record<string, boolean>
  appliances: Record<string, boolean>
  /** Every item instance in the home, by uid. */
  items: Record<string, WorldItem>
  weather: Weather
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
    openables: {},
    appliances: {},
    items: {},
    weather: 'sunny',
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
    case 'WEATHER_CHANGED':
      if (e.weather) room.weather = e.weather
      break
    case 'APPLIANCE_TOGGLED':
      room.appliances[e.id] = e.value
      break
    case 'OPENABLE_TOGGLED':
      room.openables[e.id] = e.value
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

// ---- Item actions ---------------------------------------------------------
// One reducer, run on BOTH sides: the client applies it optimistically so the
// hand fills the instant you press E, and the server applies the same function
// as the authority and echoes the result. Because it returns false for anything
// invalid, the server can simply refuse — it never has to trust the client's
// view of who is holding what.
//
// `near` is the acting player's position, or null to skip the range check (the
// client already knows it is standing there; the server does not, and passes
// the position it last validated).

export interface ItemRules {
  /** Vessel capacity by definition id, and which defs are cookware/edible. */
  capacity(defId: string): number | undefined
  isEdible(defId: string): boolean
  /** Pots and pans: things that hold a cooking state on a lit hob. */
  isCookware(defId: string): boolean
}

// Cooking. A pan on a lit hob browns what is in it; an oven only cooks with the
// door SHUT. Both take about forty seconds to come up to done, and keep going
// to burnt if you walk away — which is the point of a cooking state rather than
// a "cooked!" flag.
export const HOB_SPOT = 'kitchen-hob'
export const OVEN_SPOT = 'kitchen-oven'
export const OVEN_HEAT = 'kitchen-oven-heat' // appliance id for the oven's knobs
export const COOK_SECONDS = 40
export const COOKED = 1 // done
export const BURNT = 1.35

/**
 * What is cooking right now, as a list of actions to apply and broadcast.
 *
 * Pure and shared: the server runs it on a timer as the authority, and a
 * single-player client runs the identical function so an offline kitchen
 * behaves the same. Returning actions rather than mutating keeps it on the same
 * path as every other item change — the server still validates and echoes.
 */
export function cookTick(room: RoomState, dtSeconds: number, rules: ItemRules): ItemAction[] {
  const hobOn = room.appliances[HOB_SPOT] === true
  const ovenOn = room.appliances[OVEN_HEAT] === true && room.openables[OVEN_SPOT] !== true
  if (!hobOn && !ovenOn) return []
  const amount = dtSeconds / COOK_SECONDS
  const out: ItemAction[] = []
  for (const it of Object.values(room.items)) {
    if (it.loc.at !== 'spot') continue
    const onHob = hobOn && it.loc.id === HOB_SPOT && rules.isCookware(it.def)
    const inOven = ovenOn && it.loc.id === OVEN_SPOT
    if (!onHob && !inOven) continue
    if ((it.cooked ?? 0) >= BURNT) continue // already ruined; stop there
    out.push({ kind: 'COOK', uid: it.uid, by: 'server', amount })
  }
  return out
}

function inReach(item: WorldItem, near: [number, number, number] | null): boolean {
  if (!near) return true
  const p = itemWorldPosition(item)
  if (!p) return true // carried
  return Math.hypot(p[0] - near[0], p[2] - near[2]) <= ITEM_REACH
}

function spotUsable(room: RoomState, spotId: string): boolean {
  const spot = SPOT_BY_ID.get(spotId)
  if (!spot) return false
  if (spot.needsOpen && room.openables[spot.needsOpen] !== true) return false
  return true
}

export function applyItemAction(
  room: RoomState,
  a: ItemAction,
  rules: ItemRules,
  near: [number, number, number] | null = null,
): boolean {
  const item = room.items[a.uid]
  if (!item) return false
  const held = heldItem(room, a.by)

  switch (a.kind) {
    case 'TAKE': {
      if (held) return false // one hand, one thing
      if (item.loc.at === 'hand' || item.loc.at === 'bag') return false
      if (item.loc.at === 'spot' && !spotUsable(room, item.loc.id)) return false
      if (!inReach(item, near)) return false
      item.loc = { at: 'hand', by: a.by }
      break
    }
    case 'DROP': {
      if (item.loc.at !== 'hand' || item.loc.by !== a.by) return false
      if (typeof a.x !== 'number' || typeof a.z !== 'number') return false
      item.loc = { at: 'world', x: a.x, y: 0, z: a.z, ry: a.ry ?? 0 }
      break
    }
    case 'PLACE': {
      if (item.loc.at !== 'hand' || item.loc.by !== a.by) return false
      if (!a.spot || typeof a.slot !== 'number') return false
      if (!spotUsable(room, a.spot)) return false
      const spot = SPOT_BY_ID.get(a.spot)!
      if (a.slot < 0 || a.slot >= spot.slots) return false
      // The slot must still be free — two players can reach for it at once.
      for (const other of Object.values(room.items)) {
        if (other.uid === item.uid) continue
        if (other.loc.at === 'spot' && other.loc.id === a.spot && other.loc.slot === a.slot) return false
      }
      if (near) {
        const p = slotPosition(spot, a.slot)
        if (Math.hypot(p[0] - near[0], p[2] - near[2]) > ITEM_REACH) return false
      }
      item.loc = { at: 'spot', id: a.spot, slot: a.slot }
      break
    }
    case 'STOW': {
      if (item.loc.at !== 'hand' || item.loc.by !== a.by) return false
      if (bagItems(room, a.by).length >= BAG_SLOTS) return false
      item.loc = { at: 'bag', by: a.by }
      break
    }
    case 'EQUIP': {
      if (item.loc.at !== 'bag' || item.loc.by !== a.by) return false
      if (held) return false
      item.loc = { at: 'hand', by: a.by }
      break
    }
    case 'FILL': {
      if (item.loc.at !== 'hand' || item.loc.by !== a.by) return false
      const cap = rules.capacity(item.def)
      if (!cap) return false // not a vessel
      item.fill = cap
      item.fluid = a.fluid ?? 'water'
      break
    }
    case 'POUR': {
      if (item.loc.at !== 'hand' || item.loc.by !== a.by) return false
      if (!rules.capacity(item.def)) return false
      item.fill = 0
      delete item.fluid
      break
    }
    case 'CONSUME': {
      if (item.loc.at !== 'hand' || item.loc.by !== a.by) return false
      const cap = rules.capacity(item.def)
      if (cap) {
        if (!item.fill) return false // nothing in it to drink
        item.fill = 0
        delete item.fluid
      } else if (rules.isEdible(item.def)) {
        delete room.items[a.uid] // eaten
      } else {
        return false
      }
      break
    }
    case 'COOK': {
      // Server-driven: advances whatever is on a lit hob or in a hot oven.
      // sanitizeItemAction refuses COOK from the wire, so a client cannot
      // fast-forward its dinner.
      if (typeof a.amount !== 'number') return false
      item.cooked = Math.max(0, Math.min(1.6, (item.cooked ?? 0) + a.amount))
      break
    }
    default:
      return false
  }
  room.timestamp = Date.now()
  return true
}

// What is already in the home when you first walk into it. Run by the server
// when a room is created, and by the client when it is playing offline — the
// same function either way, so a single-player kitchen has the same contents as
// a co-op one.
export function seedHomeItems(): Record<string, WorldItem> {
  const items: Record<string, WorldItem> = {}
  let n = 0
  const put = (def: string, spot: string, slot: number, extra: Partial<WorldItem> = {}) => {
    const uid = `i${(n++).toString(36)}`
    items[uid] = { uid, def, loc: { at: 'spot', id: spot, slot }, ...extra }
  }
  // Fridge — the shelves have food on them before you ever open it.
  put('milk', 'kitchen-fridge', 0, { fill: 1, fluid: 'milk' })
  put('bottle', 'kitchen-fridge', 1, { fill: 0.5, fluid: 'water' })
  put('egg', 'kitchen-fridge', 2)
  put('tomato', 'kitchen-fridge', 3)
  put('apple', 'kitchen-fridge', 4)
  put('cheese', 'kitchen-fridge', 5)
  // Base cupboard — pans live under the counter.
  put('pot', 'kitchen-cupboard', 3)
  put('pan', 'kitchen-cupboard', 4)
  // Cutlery drawer.
  put('fork', 'kitchen-drawer', 0)
  put('spoon', 'kitchen-drawer', 1)
  put('knife', 'kitchen-drawer', 2)
  // Open shelf above the counter.
  put('mug', 'kitchen-shelf', 0)
  put('mug', 'kitchen-shelf', 1)
  put('glass', 'kitchen-shelf', 2)
  // Dining table.
  put('plate', 'kitchen-table', 0)
  put('plate', 'kitchen-table', 2)
  return items
}

// The item rules the SERVER validates with. Deliberately a second, independent
// copy of the two facts the reducer needs (what is a vessel, what is food)
// rather than an import of the client catalogue: the protocol has to stay
// loadable by Node with no client dependencies, and the authority should not be
// reading its rules out of the same file the UI does.
const SERVER_CAPACITY: Record<string, number> = {
  glass: 0.3, mug: 0.25, pot: 2, kettle: 1.2, bottle: 0.5, milk: 1,
}
const SERVER_EDIBLE = new Set(['tomato', 'apple', 'bread', 'cheese', 'egg'])
const SERVER_COOKWARE = new Set(['pot', 'pan'])

export const ITEM_RULES_SERVER: ItemRules = {
  capacity: (defId) => SERVER_CAPACITY[defId],
  isEdible: (defId) => SERVER_EDIBLE.has(defId),
  isCookware: (defId) => SERVER_COOKWARE.has(defId),
}

export function sanitizeItemAction(raw: unknown): Omit<ItemAction, 'by'> | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const kinds: ItemActionKind[] = ['TAKE', 'DROP', 'PLACE', 'STOW', 'EQUIP', 'FILL', 'POUR', 'CONSUME', 'COOK']
  if (typeof o.kind !== 'string' || !kinds.includes(o.kind as ItemActionKind)) return null
  if (typeof o.uid !== 'string' || o.uid.length > 40) return null
  const out: Omit<ItemAction, 'by'> = { kind: o.kind as ItemActionKind, uid: o.uid }
  if (typeof o.spot === 'string' && o.spot.length <= 40) out.spot = o.spot
  if (typeof o.slot === 'number' && Number.isFinite(o.slot)) out.slot = Math.floor(o.slot)
  const x = clampNum(o.x, NUM_MIN, NUM_MAX)
  const z = clampNum(o.z, NUM_MIN, NUM_MAX)
  if (x !== null) out.x = x
  if (z !== null) out.z = z
  if (typeof o.ry === 'number' && Number.isFinite(o.ry)) out.ry = o.ry
  if (typeof o.fluid === 'string' && o.fluid.length <= 16) out.fluid = o.fluid
  if (typeof o.amount === 'number' && Number.isFinite(o.amount)) out.amount = o.amount
  // COOK is the server's own business: a client asking to cook is refused.
  if (out.kind === 'COOK') return null
  return out
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
  'Balkondayım',
  'Yemek hazır',
  'Kapıyı açıyorum',
  'Film başladı',
  'Markete gidelim',
] as const

// ---- Wire messages --------------------------------------------------------

export type ClientMessage =
  | { t: 'create'; name: string; homeName?: string }
  | { t: 'join'; roomId: string; name: string }
  | { t: 'state'; p: PlayerNetState }
  | { t: 'event'; event: WorldEvent }
  | { t: 'chat'; text: string }
  | { t: 'item'; action: Omit<ItemAction, 'by'> }
  | { t: 'leave' }
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
  // `reason` distinguishes a deliberate exit from a dropped socket, so the UI
  // can say which actually happened instead of guessing.
  | { t: 'peer_leave'; playerId: string; reason: 'left' | 'lost' }
  | { t: 'states'; players: (PlayerNetState & { id: string })[] }
  | { t: 'event'; event: WorldEvent }
  // The server echoes the action rather than the whole item map: both sides run
  // the same reducer, so one small message keeps them identical.
  | { t: 'item'; action: ItemAction }
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
  // An unknown action is coerced rather than rejected: a client on a newer
  // build sending an action this server has never heard of should still be
  // able to walk around.
  const act = PLAYER_ACTIONS.includes(r.act as PlayerAction) ? (r.act as PlayerAction) : 'idle'
  return { x, y, z, ry, run: !!r.run, jump: !!r.jump, sit: !!r.sit, act }
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
  'WEATHER_CHANGED',
  'APPLIANCE_TOGGLED',
  'OPENABLE_TOGGLED',
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
  if (WEATHERS.includes(r.weather as Weather)) out.weather = r.weather as Weather
  return out
}
