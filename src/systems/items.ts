import { useMultiplayerStore } from '../store/useMultiplayerStore'
import { ITEM_RULES } from '../config/items'
import { playerMotion } from './playerMotion'
import {
  applyItemAction,
  bagItems,
  freeSlot,
  heldItem,
  itemsAt,
  seedHomeItems,
  cookTick,
  type ItemAction,
  type RoomState,
  type WorldItem,
} from '../network/protocol'

// The client's half of the item system. Every change goes through the SAME
// reducer the server runs (protocol.applyItemAction), so what your hand does
// the instant you press E is exactly what the server will conclude — and when
// the server echoes the action back, applying it again is a no-op because the
// reducer refuses an action whose preconditions no longer hold.
//
// Offline (no home joined) the same code path runs with nothing to send, which
// is why single-player and co-op behave identically instead of being two
// implementations of the same kitchen.

/**
 * Where the acting player is standing, for the reach check.
 *
 * The client MUST apply the same range rule the server does. Skipping it here
 * looked harmless — the server would just refuse — but it silently split the
 * two views: your hand appeared to fill while the server still had the glass on
 * the shelf, and every later action on it failed for reasons you could not see.
 * Checking locally means an out-of-reach take simply does nothing, on both
 * sides, for the same reason.
 */
function here(): [number, number, number] {
  return [playerMotion.x, 0, playerMotion.z]
}

/** Who "I" am for item ownership. Offline there is still exactly one of us. */
export function localPlayerId(): string {
  return useMultiplayerStore.getState().playerId ?? 'local'
}

// ---- Reads ----------------------------------------------------------------

export function useHeldItem(): WorldItem | null {
  return useMultiplayerStore((s) => {
    const me = s.playerId ?? 'local'
    for (const it of Object.values(s.world.items)) {
      if (it.loc.at === 'hand' && it.loc.by === me) return it
    }
    return null
  })
}

export function useBag(): WorldItem[] {
  return useMultiplayerStore((s) => bagItems(s.world, s.playerId ?? 'local'))
}

/** Items sitting in a container or on a surface. */
export function useItemsAt(spotId: string): WorldItem[] {
  return useMultiplayerStore((s) => itemsAt(s.world, spotId))
}

/** Items dropped on the floor. */
export function useLooseItems(): WorldItem[] {
  return useMultiplayerStore((s) => Object.values(s.world.items).filter((i) => i.loc.at === 'world'))
}

/** What a given player is holding — used to draw a remote player's hands. */
export function usePeerHeld(playerId: string): WorldItem | null {
  return useMultiplayerStore((s) => heldItem(s.world, playerId))
}

export function currentHeld(): WorldItem | null {
  const s = useMultiplayerStore.getState()
  return heldItem(s.world, s.playerId ?? 'local')
}

export function firstFreeSlot(spotId: string): number {
  return freeSlot(useMultiplayerStore.getState().world, spotId)
}

// ---- Writes ---------------------------------------------------------------

/**
 * Run an item action locally and, when connected, send it for the server to
 * validate and echo. Returns whether it was locally valid — callers use that to
 * decide whether to play a sound and an animation, so a refused action stays
 * silent instead of miming success.
 */
export function doItem(action: Omit<ItemAction, 'by'>): boolean {
  const store = useMultiplayerStore.getState()
  const full: ItemAction = { ...action, by: store.playerId ?? 'local' }
  const ok = store.applyItem(full, here())
  if (ok && store.playerId) store.sendItem(action)
  return ok
}

export function takeItem(uid: string): boolean {
  return doItem({ kind: 'TAKE', uid })
}

export function placeItem(uid: string, spot: string): boolean {
  const slot = firstFreeSlot(spot)
  if (slot < 0) return false
  return doItem({ kind: 'PLACE', uid, spot, slot })
}

export function dropItem(uid: string, x: number, z: number, ry = 0): boolean {
  return doItem({ kind: 'DROP', uid, x, z, ry })
}

export function stowItem(uid: string): boolean {
  return doItem({ kind: 'STOW', uid })
}

export function equipItem(uid: string): boolean {
  return doItem({ kind: 'EQUIP', uid })
}

export function fillItem(uid: string, fluid = 'water'): boolean {
  return doItem({ kind: 'FILL', uid, fluid })
}

export function consumeItem(uid: string): boolean {
  return doItem({ kind: 'CONSUME', uid })
}

// ---- Offline seeding ------------------------------------------------------

/**
 * Single player has no server to stock the kitchen, so the client does it —
 * once, and only when nothing is there. In co-op the server's seed arrives in
 * the welcome message and this does nothing.
 */
export function ensureItemsSeeded(): void {
  const store = useMultiplayerStore.getState()
  if (store.playerId) return // the server owns the item map in a home
  if (Object.keys(store.world.items).length > 0) return
  store.seedItems(seedHomeItems())
}

export function applyLocally(world: RoomState, action: ItemAction): boolean {
  return applyItemAction(world, action, ITEM_RULES, null)
}

// ---- Cooking (offline only) -----------------------------------------------

/**
 * In a home the SERVER runs the cooking clock and echoes the result, so this
 * does nothing. Single player has no server, so the client runs the identical
 * function — the pan browns at the same rate either way rather than only
 * cooking when someone else is watching.
 */
export function tickCookingOffline(dtSeconds: number): void {
  const store = useMultiplayerStore.getState()
  if (store.playerId) return
  const actions = cookTick(store.world, dtSeconds, ITEM_RULES)
  for (const a of actions) store.applyItem(a, null)
}
