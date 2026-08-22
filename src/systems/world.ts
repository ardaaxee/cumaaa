import { useMultiplayerStore } from '../store/useMultiplayerStore'
import type { MovieState, RoomState, WorldEventKind } from '../network/protocol'

// Shared, synced world flags (doors/lights/tv/curtains). These work single-
// player too: toggling applies locally and, when connected to a home, is also
// sent to the server which echoes it to the partner. ARDA OS data is NOT here.

export interface WorldFlag {
  kind: WorldEventKind
  id: string
  def: boolean // default value when nothing has toggled it yet
}

// The world objects wired for co-op.
export const WORLD_FLAGS = {
  mainDoor: { kind: 'DOOR_TOGGLED', id: 'main-door', def: true } as WorldFlag, // study↔hall door (open)
  livingLight: { kind: 'LIGHT_TOGGLED', id: 'living-light', def: true } as WorldFlag,
  livingTv: { kind: 'TV_TOGGLED', id: 'living-tv', def: false } as WorldFlag,
  livingCurtain: { kind: 'CURTAIN_TOGGLED', id: 'living-curtain', def: false } as WorldFlag, // true = closed
}

// Shared snacks on the living-room table (true = already taken by someone).
export const SNACK_IDS = ['popcorn', 'chips', 'drink'] as const
export type SnackId = (typeof SNACK_IDS)[number]

function bucket(world: RoomState, kind: WorldEventKind): Record<string, boolean> {
  switch (kind) {
    case 'DOOR_TOGGLED':
      return world.doors
    case 'LIGHT_TOGGLED':
      return world.lights
    case 'TV_TOGGLED':
      return world.tv
    case 'APPLIANCE_TOGGLED':
      return world.appliances
    case 'OPENABLE_TOGGLED':
      return world.openables
    case 'SNACK_TAKEN':
      return world.snacks
    default:
      return world.curtains
  }
}

// ---- Daily-life objects ----------------------------------------------------
// Anything with a door (fridge, cabinets, drawers, wardrobes, the washing
// machine) and anything that is simply on or off (kettle, stove, shower, a
// lamp). Both ride the SAME shared-world channel as doors and lights, so they
// sync to the partner and survive a rejoin without a second system.

export function useOpenable(id: string, def = false): boolean {
  return useMultiplayerStore((s) => {
    const v = s.world.openables[id]
    return v === undefined ? def : v
  })
}

export function toggleOpenable(id: string, def = false): void {
  const s = useMultiplayerStore.getState()
  const cur = s.world.openables[id]
  s.toggleWorld({ kind: 'OPENABLE_TOGGLED', id, value: !(cur === undefined ? def : cur) })
}

export function useAppliance(id: string, def = false): boolean {
  return useMultiplayerStore((s) => {
    const v = s.world.appliances[id]
    return v === undefined ? def : v
  })
}

export function toggleAppliance(id: string, def = false): void {
  const s = useMultiplayerStore.getState()
  const cur = s.world.appliances[id]
  s.toggleWorld({ kind: 'APPLIANCE_TOGGLED', id, value: !(cur === undefined ? def : cur) })
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

// ---- Movie night (shared TV playback) --------------------------------------

export function useMovie(): MovieState {
  return useMultiplayerStore((s) => s.world.movie)
}
export function useMovieMode(): boolean {
  return useMultiplayerStore((s) => s.world.movieMode)
}
export function useSnackTaken(id: string): boolean {
  return useMultiplayerStore((s) => s.world.snacks[id] === true)
}

const TV_ID = 'living'

export function setMovieMedia(media: string): void {
  useMultiplayerStore.getState().toggleWorld({ kind: 'TV_MEDIA_CHANGED', id: TV_ID, value: true, media })
}
export function playMovie(time: number): void {
  useMultiplayerStore.getState().toggleWorld({ kind: 'TV_PLAY', id: TV_ID, value: true, time })
}
export function pauseMovie(time: number): void {
  useMultiplayerStore.getState().toggleWorld({ kind: 'TV_PAUSE', id: TV_ID, value: false, time })
}
export function seekMovie(time: number): void {
  useMultiplayerStore.getState().toggleWorld({ kind: 'TV_SEEK', id: TV_ID, value: false, time })
}
export function setMovieMode(on: boolean): void {
  useMultiplayerStore.getState().toggleWorld({ kind: 'MOVIE_MODE_CHANGED', id: TV_ID, value: on })
}
export function takeSnack(id: string): void {
  useMultiplayerStore.getState().toggleWorld({ kind: 'SNACK_TAKEN', id, value: true })
}
