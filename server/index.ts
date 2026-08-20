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

interface Player {
  id: string
  name: string
  role: PlayerRole
  ws: WebSocket
  state: PlayerNetState
  alive: boolean
}

interface Room {
  id: string
  players: Map<string, Player>
  state: RoomState
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

function createRoom(): Room {
  let code = generateRoomCode()
  while (rooms.has(code)) code = generateRoomCode()
  const room: Room = { id: code, players: new Map(), state: emptyRoomState(code), emptySince: null }
  rooms.set(code, room)
  return room
}

function joinRoom(room: Room, ws: WebSocket, name: string): Player | null {
  if (room.players.size >= MAX_PLAYERS) return null
  const role: PlayerRole = room.players.size === 0 ? 'host' : 'guest'
  const player: Player = {
    id: newPlayerId(),
    name,
    role,
    ws,
    state: { x: 0, y: 1.62, z: 4, ry: 0, run: false, jump: false, sit: false },
    alive: true,
  }
  room.players.set(player.id, player)
  room.emptySince = null
  return player
}

const wss = new WebSocketServer({ port: PORT })

wss.on('connection', (ws) => {
  let roomId: string | null = null
  let playerId: string | null = null

  const leave = () => {
    if (!roomId || !playerId) return
    const room = rooms.get(roomId)
    if (!room) return
    room.players.delete(playerId)
    broadcast(room, { t: 'peer_leave', playerId })
    if (room.players.size === 0) room.emptySince = Date.now()
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
        if (roomId) leave()
        const room = createRoom()
        const player = joinRoom(room, ws, sanitizeName(msg.name))!
        roomId = room.id
        playerId = player.id
        send(ws, { t: 'welcome', roomId: room.id, playerId: player.id, role: player.role, peers: peerList(room, player.id), room: room.state })
        break
      }
      case 'join': {
        const code = normalizeRoomCode(msg.roomId)
        if (!code) return send(ws, { t: 'error', code: 'BAD_REQUEST' })
        const room = rooms.get(code)
        if (!room) return send(ws, { t: 'error', code: 'HOME_NOT_FOUND' })
        if (roomId) leave()
        const player = joinRoom(room, ws, sanitizeName(msg.name))
        if (!player) return send(ws, { t: 'error', code: 'ROOM_FULL' })
        roomId = room.id
        playerId = player.id
        send(ws, { t: 'welcome', roomId: room.id, playerId: player.id, role: player.role, peers: peerList(room, player.id), room: room.state })
        broadcast(room, { t: 'peer_join', peer: { id: player.id, name: player.name, role: player.role } }, player.id)
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
      case 'ping': {
        send(ws, { t: 'pong' })
        break
      }
    }
  })

  ws.on('close', leave)
  ws.on('error', leave)
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
