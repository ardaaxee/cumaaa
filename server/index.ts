import { WebSocketServer, WebSocket } from 'ws'
import {
  NET_SEND_MS,
  MAX_PLAYERS,
  ROOM_GRACE_MS,
  emptyRoomState,
  applyEvent,
  generateRoomCode,
  normalizeRoomCode,
  sanitizeName,
  sanitizeState,
  sanitizeEvent,
  sanitizeChatText,
  sanitizeHomeName,
  sanitizeItemAction,
  applyItemAction,
  seedHomeItems,
  ITEM_RULES_SERVER,
  cookTick,
  type ItemAction,
  CHAT_HISTORY,
  CHAT_MIN_GAP_MS,
  type ChatMessage,
  type HomeInfo,
  type LobbyPlayer,
  type ClientMessage,
  type ServerMessage,
  type PlayerNetState,
  type PeerInfo,
  type PlayerRole,
  type RoomState,
} from '../src/network/protocol'

// ARDA HOME co-op server: rooms keyed by a short code, each holding up to two
// players. It syncs player transforms/state at a fixed tick and relays typed
// world events (doors/lights/tv/curtains). It stores NO ARDA OS data — only the
// shared, runtime world state. Empty rooms linger briefly so a dropped player
// can reconnect and get the room state back.

const PORT = Number(process.env.PORT || process.env.MULTIPLAYER_PORT || 8787)
const ITEM_MIN_GAP_MS = 120 // an item action per player per ~8th of a second

interface Player {
  id: string
  name: string
  role: PlayerRole
  ws: WebSocket
  state: PlayerNetState
  alive: boolean
  lastChatAt: number
  lastItemAt: number
  ready: boolean
}

interface Room {
  id: string
  players: Map<string, Player>
  state: RoomState
  chat: ChatMessage[]
  name: string
  hostId: string | null
  started: boolean
  emptySince: number | null
}

const rooms = new Map<string, Room>()

let idCounter = 0
function newPlayerId(): string {
  idCounter += 1
  return `player_${Math.random().toString(36).slice(2, 8)}${idCounter}`
}

function send(ws: WebSocket, msg: ServerMessage): void {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg))
}

function broadcast(room: Room, msg: ServerMessage, exceptId?: string): void {
  for (const p of room.players.values()) {
    if (p.id === exceptId) continue
    send(p.ws, msg)
  }
}

function peerList(room: Room, exceptId?: string): PeerInfo[] {
  const out: PeerInfo[] = []
  for (const p of room.players.values()) {
    if (p.id === exceptId) continue
    out.push({ id: p.id, name: p.name, role: p.role })
  }
  return out
}

function createRoom(name: string): Room {
  let code = generateRoomCode()
  while (rooms.has(code)) code = generateRoomCode()
  const room: Room = {
    id: code,
    players: new Map(),
    state: { ...emptyRoomState(code), items: seedHomeItems() },
    chat: [],
    name,
    hostId: null,
    started: false,
    emptySince: null,
  }
  rooms.set(code, room)
  return room
}

function homeInfo(room: Room): HomeInfo {
  return { code: room.id, name: room.name, hostId: room.hostId ?? '', started: room.started }
}

function lobbyList(room: Room): LobbyPlayer[] {
  return [...room.players.values()].map((p) => ({ id: p.id, name: p.name, role: p.role, ready: p.ready }))
}

function broadcastLobby(room: Room): void {
  broadcast(room, { t: 'lobby', home: homeInfo(room), players: lobbyList(room) })
}

function joinRoom(room: Room, ws: WebSocket, name: string): Player | null {
  if (room.players.size >= MAX_PLAYERS) return null
  const role: PlayerRole = room.players.size === 0 ? 'host' : 'guest'
  const player: Player = {
    id: newPlayerId(),
    name,
    role,
    ws,
    state: { x: 0, y: 1.62, z: 4, ry: 0, run: false, jump: false, sit: false, act: 'idle' },
    alive: true,
    lastChatAt: 0,
    lastItemAt: 0,
    ready: false,
  }
  room.players.set(player.id, player)
  // The first player in becomes host; if the host leaves and someone is still
  // here, hosting passes to them so the home never becomes unstartable.
  if (!room.hostId || !room.players.has(room.hostId)) room.hostId = player.id
  room.emptySince = null
  return player
}

const wss = new WebSocketServer({ port: PORT })

wss.on('connection', (ws) => {
  let roomId: string | null = null
  let playerId: string | null = null

  const leave = (reason: 'left' | 'lost' = 'lost') => {
    if (!roomId || !playerId) return
    const room = rooms.get(roomId)
    if (!room) return
    room.players.delete(playerId)
    broadcast(room, { t: 'peer_leave', playerId, reason })
    if (room.hostId === playerId) room.hostId = room.players.keys().next().value ?? null
    if (room.players.size === 0) {
      room.emptySince = Date.now()
      room.started = false // a home nobody is in is back to being un-started
    } else {
      broadcastLobby(room)
    }
    roomId = null
    playerId = null
  }

  ws.on('message', (data) => {
    let msg: ClientMessage
    try {
      msg = JSON.parse(String(data)) as ClientMessage
    } catch {
      return
    }
    if (!msg || typeof msg !== 'object') return

    switch (msg.t) {
      case 'create': {
        if (roomId) leave('left')
        const room = createRoom(sanitizeHomeName(msg.homeName))
        const player = joinRoom(room, ws, sanitizeName(msg.name))!
        roomId = room.id
        playerId = player.id
        send(ws, { t: 'welcome', roomId: room.id, playerId: player.id, role: player.role, peers: peerList(room, player.id), room: room.state, chat: room.chat, home: homeInfo(room), lobby: lobbyList(room) })
        break
      }
      case 'join': {
        const code = normalizeRoomCode(msg.roomId)
        if (!code) return send(ws, { t: 'error', code: 'BAD_REQUEST' })
        const room = rooms.get(code)
        if (!room) return send(ws, { t: 'error', code: 'HOME_NOT_FOUND' })
        if (roomId) leave('left')
        const player = joinRoom(room, ws, sanitizeName(msg.name))
        if (!player) return send(ws, { t: 'error', code: 'ROOM_FULL' })
        roomId = room.id
        playerId = player.id
        send(ws, { t: 'welcome', roomId: room.id, playerId: player.id, role: player.role, peers: peerList(room, player.id), room: room.state, chat: room.chat, home: homeInfo(room), lobby: lobbyList(room) })
        broadcast(room, { t: 'peer_join', peer: { id: player.id, name: player.name, role: player.role } }, player.id)
        broadcastLobby(room)
        break
      }
      case 'state': {
        if (!roomId || !playerId) return
        const room = rooms.get(roomId)
        const player = room?.players.get(playerId)
        if (!player) return
        const clean = sanitizeState(msg.p)
        if (clean) player.state = clean
        break
      }
      // Items are the one place a client could try to claim something it is not
      // near, or take what another player is already holding. The server runs
      // the SAME reducer the client did — but with the position IT last saw for
      // that player, so reach cannot be faked — and only broadcasts if the
      // action was actually legal. A refused action is simply not echoed.
      case 'item': {
        if (!roomId || !playerId) return
        const room = rooms.get(roomId)
        const player = room?.players.get(playerId)
        if (!room || !player) return
        const clean = sanitizeItemAction(msg.action)
        if (!clean) return
        const now = Date.now()
        if (now - player.lastItemAt < ITEM_MIN_GAP_MS) return // flood guard
        player.lastItemAt = now
        const action: ItemAction = { ...clean, by: playerId }
        const at: [number, number, number] = [player.state.x, player.state.y, player.state.z]
        if (!applyItemAction(room.state, action, ITEM_RULES_SERVER, at)) return
        broadcast(room, { t: 'item', action })
        break
      }
      case 'event': {
        if (!roomId || !playerId) return
        const room = rooms.get(roomId)
        if (!room) return
        const clean = sanitizeEvent(msg.event)
        if (!clean) return
        clean.by = playerId
        applyEvent(room.state, clean)
        broadcast(room, { t: 'event', event: clean }) // echo to all incl. sender
        break
      }
      case 'chat': {
        if (!roomId || !playerId) return
        const room = rooms.get(roomId)
        const player = room?.players.get(playerId)
        if (!room || !player) return
        const text = sanitizeChatText(msg.text)
        if (!text) return
        const now = Date.now()
        if (now - player.lastChatAt < CHAT_MIN_GAP_MS) return // flood guard
        player.lastChatAt = now
        const message: ChatMessage = {
          id: `m_${now.toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
          from: player.id,
          name: player.name,
          text,
          at: now,
        }
        room.chat.push(message)
        if (room.chat.length > CHAT_HISTORY) room.chat.splice(0, room.chat.length - CHAT_HISTORY)
        broadcast(room, { t: 'chat', message }) // echo to all incl. sender
        break
      }
      case 'leave': {
        leave('left')
        break
      }
      case 'ready': {
        if (!roomId || !playerId) return
        const room = rooms.get(roomId)
        const player = room?.players.get(playerId)
        if (!room || !player) return
        player.ready = !!msg.ready
        broadcastLobby(room)
        break
      }
      case 'start': {
        if (!roomId || !playerId) return
        const room = rooms.get(roomId)
        if (!room) return
        // Only the host starts, and only once everyone present is ready.
        if (room.hostId !== playerId) return
        if (![...room.players.values()].every((p) => p.ready)) return
        room.started = true
        broadcastLobby(room)
        break
      }
      case 'ping': {
        send(ws, { t: 'pong' })
        break
      }
    }
  })

  ws.on('close', () => leave('lost'))
  ws.on('error', () => leave('lost'))
})

// Fixed-rate broadcast of every room's player transforms (others only).
setInterval(() => {
  for (const room of rooms.values()) {
    if (room.players.size === 0) continue
    for (const p of room.players.values()) {
      const others = []
      for (const q of room.players.values()) {
        if (q.id === p.id) continue
        others.push({ id: q.id, ...q.state })
      }
      if (others.length) send(p.ws, { t: 'states', players: others })
    }
  }
}, NET_SEND_MS)

// Cooking. The server owns it: a pan browns on a lit hob and an oven only
// cooks with the door shut, whether or not anyone is looking, and both players
// see the same dinner. Clients cannot send COOK — sanitizeItemAction refuses
// it — so nobody can fast-forward their food.
const COOK_TICK_MS = 2000
setInterval(() => {
  for (const room of rooms.values()) {
    if (room.players.size === 0) continue
    const actions = cookTick(room.state, COOK_TICK_MS / 1000, ITEM_RULES_SERVER)
    for (const a of actions) {
      if (applyItemAction(room.state, a, ITEM_RULES_SERVER, null)) {
        broadcast(room, { t: 'item', action: a })
      }
    }
  }
}, COOK_TICK_MS)

// Reap rooms that have been empty past the grace window.
setInterval(() => {
  const now = Date.now()
  for (const [id, room] of rooms) {
    if (room.players.size === 0 && room.emptySince && now - room.emptySince > ROOM_GRACE_MS) {
      rooms.delete(id)
    }
  }
}, 10_000)

// eslint-disable-next-line no-console
console.log(`ARDA HOME co-op server listening on ws://0.0.0.0:${PORT}`)
