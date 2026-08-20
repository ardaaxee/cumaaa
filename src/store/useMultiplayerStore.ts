import { create } from 'zustand'
import { NetworkClient, type ConnPhase } from '../network/NetworkClient'
import {
  emptyRoomState,
  applyEvent,
  normalizeRoomCode,
  type PeerInfo,
  type PlayerNetState,
  type PlayerRole,
  type RoomState,
  type ServerMessage,
  type ServerErrorCode,
  type WorldEvent,
} from '../network/protocol'
import { useRoomStore } from './useRoomStore'

// Per-frame remote transforms live OUTSIDE React so 15 Hz updates never trigger
// a re-render. RemotePlayer reads its target from here each frame.
export const peerStates = new Map<string, PlayerNetState>()

function multiplayerUrl(): string {
  const env = (import.meta.env.VITE_MULTIPLAYER_URL as string | undefined)?.trim()
  if (env) return env
  // Default: same host as the page, port 8787 — works for LAN testing where the
  // client is served from the same machine that runs the server.
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${location.hostname}:8787`
}

interface MultiplayerState {
  phase: ConnPhase
  roomId: string | null
  playerId: string | null
  role: PlayerRole | null
  selfName: string
  peers: PeerInfo[]
  world: RoomState
  lastError: ServerErrorCode | null

  // UI: is the Movie Night panel open on THIS client (local UI only).
  moviePanelOpen: boolean

  createHome: (name: string) => void
  joinHome: (roomId: string, name: string) => void
  leaveHome: () => void
  sendState: (p: PlayerNetState) => void
  toggleWorld: (event: WorldEvent) => void
  setMoviePanel: (open: boolean) => void
  clearError: () => void
}

let client: NetworkClient | null = null
// What to (re)send on (re)connect so a dropped link restores the room.
let intent: { type: 'create' | 'join'; roomId?: string; name: string } | null = null

export const useMultiplayerStore = create<MultiplayerState>((set, get) => {
  const handleMessage = (msg: ServerMessage) => {
    const toast = useRoomStore.getState().pushToast
    switch (msg.t) {
      case 'welcome': {
        set({
          phase: 'open',
          roomId: msg.roomId,
          playerId: msg.playerId,
          role: msg.role,
          peers: msg.peers,
          world: msg.room,
          lastError: null,
        })
        // After a successful create/join, always reconnect by JOINING this room.
        intent = { type: 'join', roomId: msg.roomId, name: get().selfName }
        break
      }
      case 'error': {
        set({ lastError: msg.code })
        break
      }
      case 'peer_join': {
        set((s) => ({ peers: [...s.peers.filter((p) => p.id !== msg.peer.id), msg.peer] }))
        toast(`${msg.peer.name} joined home`, 'success')
        break
      }
      case 'peer_leave': {
        const leaving = get().peers.find((p) => p.id === msg.playerId)
        peerStates.delete(msg.playerId)
        set((s) => ({ peers: s.peers.filter((p) => p.id !== msg.playerId) }))
        toast(`${leaving?.name ?? 'Partner'} left home`)
        break
      }
      case 'states': {
        for (const p of msg.players) {
          const { id, ...rest } = p
          peerStates.set(id, rest)
        }
        break
      }
      case 'event': {
        set((s) => {
          const world = { ...s.world, doors: { ...s.world.doors }, lights: { ...s.world.lights }, tv: { ...s.world.tv }, curtains: { ...s.world.curtains }, snacks: { ...s.world.snacks } }
          applyEvent(world, msg.event)
          return { world }
        })
        break
      }
      case 'room': {
        set({ world: msg.room })
        break
      }
      case 'pong':
        break
    }
  }

  const ensureClient = () => {
    if (client) return client
    client = new NetworkClient(multiplayerUrl(), {
      onPhase: (phase) => set({ phase }),
      onMessage: handleMessage,
      onOpen: () => {
        // (Re)assert our intent so a reconnect restores the room + roster.
        if (!intent || !client) return
        if (intent.type === 'create') client.send({ t: 'create', name: intent.name })
        else if (intent.roomId) client.send({ t: 'join', roomId: intent.roomId, name: intent.name })
      },
    })
    return client
  }

  return {
    phase: 'idle',
    roomId: null,
    playerId: null,
    role: null,
    selfName: 'CUMA',
    peers: [],
    world: emptyRoomState(''),
    lastError: null,
    moviePanelOpen: false,

    createHome: (name) => {
      const self = name.trim() || 'CUMA'
      set({ selfName: self, lastError: null })
      intent = { type: 'create', name: self }
      ensureClient().connect()
    },
    joinHome: (roomId, name) => {
      const code = normalizeRoomCode(roomId)
      const self = name.trim() || 'ZEYNEP'
      if (!code) {
        set({ lastError: 'HOME_NOT_FOUND', selfName: self })
        return
      }
      set({ selfName: self, lastError: null })
      intent = { type: 'join', roomId: code, name: self }
      ensureClient().connect()
    },
    leaveHome: () => {
      intent = null
      client?.close()
      peerStates.clear()
      set({ phase: 'idle', roomId: null, playerId: null, role: null, peers: [], world: emptyRoomState(''), lastError: null })
    },
    sendState: (p) => {
      client?.send({ t: 'state', p })
    },
    toggleWorld: (event) => {
      // Optimistic local apply, then tell the server (which echoes to everyone).
      set((s) => {
        const world = { ...s.world, doors: { ...s.world.doors }, lights: { ...s.world.lights }, tv: { ...s.world.tv }, curtains: { ...s.world.curtains }, snacks: { ...s.world.snacks } }
        applyEvent(world, event)
        return { world }
      })
      client?.send({ t: 'event', event })
    },
    setMoviePanel: (open) => set({ moviePanelOpen: open }),
    clearError: () => set({ lastError: null }),
  }
})
