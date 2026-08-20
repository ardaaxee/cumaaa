import { useMultiplayerStore } from '../store/useMultiplayerStore'
import type { RoomState, WorldEventKind } from '../network/protocol'

// Shared, synced world flags (doors/lights/tv/curtains). These work single-
// player too: toggling applies locally and, when connected to a home, is also
// sent to the server which echoes it to the partner. ARDA OS data is NOT here.

export interface WorldFlag {
  kind: WorldEventKind
  id: string
  def: boolean // default value when nothing has toggled it yet
}

// The world objects wired for co-op this pass.
export const WORLD_FLAGS = {
  mainDoor: { kind: 'DOOR_TOGGLED', id: 'main-door', def: true } as WorldFlag, // study↔hall door (open)
  livingLight: { kind: 'LIGHT_TOGGLED', id: 'living-light', def: true } as WorldFlag,
  livingTv: { kind: 'TV_TOGGLED', id: 'living-tv', def: false } as WorldFlag,
}

function bucket(world: RoomState, kind: WorldEventKind): Record<string, boolean> {
  return kind === 'DOOR_TOGGLED' ? world.doors : kind === 'LIGHT_TOGGLED' ? world.lights : kind === 'TV_TOGGLED' ? world.tv : world.curtains
}

export function worldValue(world: RoomState, flag: WorldFlag): boolean {
  const v = bucket(world, flag.kind)[flag.id]
  return v === undefined ? flag.def : v
}

// React hook: re-renders only when this flag changes.
export function useWorldFlag(flag: WorldFlag): boolean {
  return useMultiplayerStore((s) => {
    const v = bucket(s.world, flag.kind)[flag.id]
    return v === undefined ? flag.def : v
  })
}

// Toggle a flag (optimistic local apply + network send when connected).
export function toggleWorldFlag(flag: WorldFlag): void {
  const s = useMultiplayerStore.getState()
  const current = worldValue(s.world, flag)
  s.toggleWorld({ kind: flag.kind, id: flag.id, value: !current })
}
