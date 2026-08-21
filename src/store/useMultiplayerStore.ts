import { create } from 'zustand'
import { NetworkClient, type ConnPhase } from '../network/NetworkClient'
import {
  emptyRoomState,
  applyEvent,
  normalizeRoomCode,
  CHAT_HISTORY,
  sanitizeChatText,
  type ChatMessage,
  type HomeInfo,
  type LobbyPlayer,
  type PeerInfo,
  type PlayerNetState,
  type PlayerRole,
  type RoomState,
  type ServerMessage,
  type ServerErrorCode,
  type WorldEvent,
} from '../network/protocol'
import { useRoomStore } from './useRoomStore'
import { resetActions } from '../components/characters/actions'

// Per-frame remote transforms live OUTSIDE React so 15 Hz updates never trigger
// a re-render. RemotePlayer reads its target from here each frame.
export const peerStates = new Map<string, PlayerNetState>()

// A shallow copy with every mutable bucket duplicated, so applyEvent's in-place
// writes never touch the object React is already rendering. Written generically
// on purpose: adding a bucket to RoomState used to mean remembering to extend
// two hand-written spreads, and forgetting silently shared state.
// The server's room state arrives as-is and REPLACES ours. A server running an
// older build sends an object without the newer buckets, and every reader then
// does `world.openables[id]` on undefined. Filling the gaps on arrival keeps a
// version skew from crashing the client.
function adoptWorld(w: RoomState): RoomState {
  const base = emptyRoomState(w?.roomId ?? '')
  return {
    ...base,
    ...w,
    doors: { ...base.doors, ...w?.doors },
    lights: { ...base.lights, ...w?.lights },
    tv: { ...base.tv, ...w?.tv },
    curtains: { ...base.curtains, ...w?.curtains },
    snacks: { ...base.snacks, ...w?.snacks },
    openables: { ...base.openables, ...w?.openables },
    appliances: { ...base.appliances, ...w?.appliances },
    weather: w?.weather ?? base.weather,
    movie: { ...base.movie, ...w?.movie },
  }
}

function cloneWorld(w: RoomState): RoomState {
  return {
    ...w,
    doors: { ...w.doors },
    lights: { ...w.lights },
    tv: { ...w.tv },
    curtains: { ...w.curtains },
    snacks: { ...w.snacks },
    openables: { ...w.openables },
    appliances: { ...w.appliances },
    movie: { ...w.movie },
  }
}

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

  // Home + lobby (pre-entry): who is in, who is ready, has the host started.
  home: HomeInfo | null
  lobby: LobbyPlayer[]

  // Chat: history is shared, but `chatOpen` / `unreadChat` are local UI.
  chat: ChatMessage[]
  chatOpen: boolean
  unreadChat: number

  // UI: is the Movie Night panel open on THIS client (local UI only).
  moviePanelOpen: boolean

  createHome: (name: string, homeName?: string) => void
  joinHome: (roomId: string, name: string) => void
  setReady: (ready: boolean) => void
  startHome: () => void
  leaveHome: () => void
  sendState: (p: PlayerNetState) => void
  toggleWorld: (event: WorldEvent) => void
  sendChat: (text: string) => void
  setChatOpen: (open: boolean) => void
  setMoviePanel: (open: boolean) => void
  clearError: () => void
}

let client: NetworkClient | null = null
// What to (re)send on (re)connect so a dropped link restores the room.
let intent: { type: 'create' | 'join'; roomId?: string; name: string; homeName?: string } | null = null

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
          world: adoptWorld(msg.room),
          chat: msg.chat,
          unreadChat: 0,
          home: msg.home,
          lobby: msg.lobby,
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
        const who = leaving?.name ?? 'Partner'
        toast(msg.reason === 'lost' ? `${who} connection lost` : `${who} left home`)
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
          const world = cloneWorld(s.world)
          applyEvent(world, msg.event)
          return { world }
        })
        break
      }
      case 'lobby': {
        set({ home: msg.home, lobby: msg.players })
        break
      }
      case 'chat': {
        const isOwn = msg.message.from === get().playerId
        const wasOpen = get().chatOpen
        set((s) => {
          const chat = [...s.chat, msg.message].slice(-CHAT_HISTORY)
          // Only a partner's message can be unread, and only while the panel is
          // closed — your own echo never raises the badge.
          return { chat, unreadChat: isOwn || s.chatOpen ? s.unreadChat : s.unreadChat + 1 }
        })
        if (!isOwn && !wasOpen && useRoomStore.getState().settings.chatNotifications) {
          toast(`${msg.message.name}: ${msg.message.text.slice(0, 48)}`)
        }
        break
      }
      case 'room': {
        set({ world: adoptWorld(msg.room) })
        break
      }
      case 'pong':
        break
    }
  }

  const ensureClient = () => {
    if (client) return client
    client = new NetworkClient(multiplayerUrl(), {
      onPhase: (phase) => {
        const prev = get().phase
        set({ phase })
        // Only worth saying once we are actually in a home; connecting for the
        // first time is not a "reconnect".
        if (!get().roomId) return
        const toast = useRoomStore.getState().pushToast
        if (phase === 'reconnecting' && prev === 'open') toast('Connection lost — reconnecting…')
        if (phase === 'open' && prev === 'reconnecting') toast('Reconnected', 'success')
      },
      onMessage: handleMessage,
      onOpen: () => {
        // (Re)assert our intent so a reconnect restores the room + roster.
        if (!intent || !client) return
        if (intent.type === 'create') client.send({ t: 'create', name: intent.name, homeName: intent.homeName })
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
    home: null,
    lobby: [],
    chat: [],
    chatOpen: false,
    unreadChat: 0,
    moviePanelOpen: false,

    createHome: (name, homeName) => {
      const self = name.trim() || 'CUMA'
      set({ selfName: self, lastError: null })
      intent = { type: 'create', name: self, homeName }
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
      resetActions()
      intent = null
      client?.send({ t: 'leave' }) // so the partner sees "left", not "connection lost"
      client?.close()
      peerStates.clear()
      set({ phase: 'idle', roomId: null, playerId: null, role: null, peers: [], world: emptyRoomState(''), lastError: null, home: null, lobby: [], chat: [], unreadChat: 0, chatOpen: false })
    },
    sendState: (p) => {
      client?.send({ t: 'state', p })
    },
    toggleWorld: (event) => {
      // Optimistic local apply, then tell the server (which echoes to everyone).
      set((s) => {
        const world = cloneWorld(s.world)
        applyEvent(world, event)
        return { world }
      })
      client?.send({ t: 'event', event })
    },
    setReady: (ready) => {
      client?.send({ t: 'ready', ready })
    },
    startHome: () => {
      client?.send({ t: 'start' })
    },
    sendChat: (text) => {
      // The server re-sanitises and stamps the message, then echoes it back —
      // so we deliberately do NOT append optimistically (no duplicate bubbles).
      const clean = sanitizeChatText(text)
      if (!clean) return
      client?.send({ t: 'chat', text: clean })
    },
    setChatOpen: (open) => set({ chatOpen: open, unreadChat: open ? 0 : get().unreadChat }),
    setMoviePanel: (open) => set({ moviePanelOpen: open }),
    clearError: () => set({ lastError: null }),
  }
})
