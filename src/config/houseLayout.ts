// The apartment ARDA lives in. The existing studio stays put as the STUDY
// (x[-5,5], z[-6,6]) — home of the desk, PC/ARDA OS, memory objects and the
// hidden lab. New rooms are attached to the north (+Z) through one door carved
// in the study's otherwise-empty back wall, then off a central hallway.
//
// Coordinates are world metres, y = 0 is the floor. Adjacent rooms share a wall
// plane; each room builds its own walls INSET toward its interior, so a shared
// wall reads as one solid ~0.4 m partition with no z-fighting.

import { HALF_D, ROOM } from './roomLayout'

export const WALL_T = ROOM.wall // 0.2

// Door carved in the study's back wall (+Z, z = HALF_D) into the hallway.
export const STUDY_DOOR = { center: 0, half: 0.6, height: 2.25 }

export type Side = 'north' | 'south' | 'east' | 'west' // +Z, -Z, +X, -X

export interface Opening {
  side: Side
  center: number // along the wall (x for north/south, z for east/west)
  half: number
  height: number
}

// A real window punched into an exterior wall. The wall keeps its full-height
// collider (glass is impassable) — only the visual wall mesh is carved, leaving
// a sill below, a header above and jambs on either side.
export type CurtainStyle = 'sheer' | 'thick' | 'blind' | 'frosted' | 'none'

export interface WindowSpec {
  side: Side
  center: number // along the wall (x for north/south, z for east/west)
  width: number
  sillY: number
  height: number
  curtain: CurtainStyle
  frosted?: boolean // privacy glass — no clear exterior view
}

export interface RoomBox {
  id: string
  minX: number
  maxX: number
  minZ: number
  maxZ: number
  height: number
  openings: Opening[]
  windows?: WindowSpec[]
}

const DOOR_H = 2.2
const GAP = 0.6

export const ROOMS: RoomBox[] = [
  // Central hallway / entrance, running north from the study door.
  {
    id: 'hallway',
    minX: -1.5, maxX: 1.5, minZ: 6, maxZ: 14, height: 2.7,
    openings: [
      // South opening aligns with the study back-wall door (STUDY_DOOR, x=0).
      { side: 'south', center: STUDY_DOOR.center, half: STUDY_DOOR.half, height: STUDY_DOOR.height },
      { side: 'west', center: 8.6, half: GAP, height: DOOR_H },
      { side: 'east', center: 8.6, half: GAP, height: DOOR_H },
      { side: 'north', center: -0.6, half: GAP, height: DOOR_H },
    ],
  },
  // Living room (west of the hallway). Large south window over the street.
  {
    id: 'living',
    minX: -10, maxX: -1.5, minZ: 6, maxZ: 14, height: 2.9,
    openings: [
      { side: 'east', center: 8.6, half: GAP, height: DOOR_H },
      { side: 'west', center: 10, half: 0.7, height: DOOR_H }, // to balcony
    ],
    windows: [{ side: 'south', center: -7.5, width: 2.6, sillY: 0.85, height: 1.55, curtain: 'sheer' }],
  },
  // Kitchen (east of the hallway). Medium window over the dining nook.
  {
    id: 'kitchen',
    minX: 1.5, maxX: 9.5, minZ: 6, maxZ: 14, height: 2.7,
    openings: [
      { side: 'west', center: 8.6, half: GAP, height: DOOR_H },
      { side: 'north', center: 7.5, half: 0.5, height: DOOR_H }, // to storage
    ],
    windows: [{ side: 'east', center: 8.4, width: 1.5, sillY: 1.0, height: 1.25, curtain: 'blind' }],
  },
  // Bedroom (north of the hallway). Larger west window for morning light.
  {
    id: 'bedroom',
    minX: -6, maxX: 1.5, minZ: 14, maxZ: 22, height: 2.9,
    openings: [
      { side: 'south', center: -0.6, half: GAP, height: DOOR_H },
      { side: 'east', center: 15.8, half: GAP, height: DOOR_H }, // to bathroom
    ],
    windows: [{ side: 'west', center: 19.5, width: 1.9, sillY: 0.9, height: 1.5, curtain: 'thick' }],
  },
  // Bathroom (ensuite, east of the bedroom). Small frosted privacy window.
  {
    id: 'bathroom',
    minX: 1.5, maxX: 5.5, minZ: 14, maxZ: 19, height: 2.6,
    openings: [{ side: 'west', center: 15.8, half: GAP, height: DOOR_H }],
    windows: [{ side: 'north', center: 3.7, width: 0.8, sillY: 1.35, height: 0.85, curtain: 'frosted', frosted: true }],
  },
  // Small storage off the kitchen.
  {
    id: 'storage',
    minX: 6, maxX: 9.5, minZ: 14, maxZ: 17, height: 2.5,
    openings: [{ side: 'south', center: 7.5, half: 0.5, height: DOOR_H }],
  },
]

// Balcony hangs off the living room's west wall — open railing, no full walls.
export const BALCONY = { minX: -12.6, maxX: -10, minZ: 8, maxZ: 12, height: 2.9 }

export function roomById(id: string): RoomBox {
  const r = ROOMS.find((x) => x.id === id)
  if (!r) throw new Error('room not found: ' + id)
  return r
}

// Centre of a room box (for lighting + furnishing anchors).
export function center(r: RoomBox): [number, number, number] {
  return [(r.minX + r.maxX) / 2, 0, (r.minZ + r.maxZ) / 2]
}

// World transform for a window mounted flush in a room's wall. Local +Z of the
// returned frame points OUTWARD (exterior); local -Z points into the room.
export function windowTransform(
  room: RoomBox,
  w: WindowSpec,
): { pos: [number, number, number]; rotY: number } {
  const t = WALL_T
  const y = w.sillY + w.height / 2
  switch (w.side) {
    case 'north':
      return { pos: [w.center, y, room.maxZ - t / 2], rotY: 0 }
    case 'south':
      return { pos: [w.center, y, room.minZ + t / 2], rotY: Math.PI }
    case 'east':
      return { pos: [room.maxX - t / 2, y, w.center], rotY: Math.PI / 2 }
    case 'west':
      return { pos: [room.minX + t / 2, y, w.center], rotY: -Math.PI / 2 }
  }
}

// The study back-wall door lives at z = +HALF_D.
export const STUDY_BACK_Z = HALF_D
