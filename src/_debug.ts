// TEMPORARY test hooks — never committed.
import { resolveCollision } from './systems/collisionSystem'
import { usePlayerStore } from './store/usePlayerStore'
import { useRoomStore } from './store/useRoomStore'
import { useAppStore } from './store/useAppStore'
import { useMultiplayerStore, peerStates } from './store/useMultiplayerStore'
import { useAuthStore } from './auth/useAuthStore'
import { playerMotion } from './systems/playerMotion'
import { SPAWN_POINTS } from './config/houseLayout'
import * as timeSystem from './systems/timeSystem'
import * as world from './systems/world'
const w = window as unknown as Record<string, unknown>
w.__resolve = resolveCollision
w.__player = usePlayerStore
w.__room = useRoomStore
w.__app = useAppStore
w.__mp = useMultiplayerStore
w.__peers = peerStates
w.__auth = useAuthStore
w.__motion = playerMotion
w.__spawns = SPAWN_POINTS
w.__time = timeSystem
w.__world = world
w.__lockQuality = (q: 'low' | 'medium' | 'high' | 'ultra') => {
  const store = useRoomStore.getState()
  store.setSettings({ qualityMode: q, quality: q, bloom: q !== 'low' })
}
