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

export interface RoomBox {
  id: string
  minX: number
  maxX: number
  minZ: number
  maxZ: number
  height: number
  openings: Opening[]
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
  // Living room (west of the hallway).
  {
    id: 'living',
    minX: -10, maxX: -1.5, minZ: 6, maxZ: 14, height: 2.9,
    openings: [
      { side: 'east', center: 8.6, half: GAP, height: DOOR_H },
      { side: 'west', center: 10, half: 0.7, height: DOOR_H }, // to balcony
    ],
  },
  // Kitchen (east of the hallway).
  {
    id: 'kitchen',
    minX: 1.5, maxX: 9.5, minZ: 6, maxZ: 14, height: 2.7,
    openings: [
      { side: 'west', center: 8.6, half: GAP, height: DOOR_H },
      { side: 'north', center: 7.5, half: 0.5, height: DOOR_H }, // to storage
    ],
  },
  // Bedroom (north of the hallway).
  {
    id: 'bedroom',
    minX: -6, maxX: 1.5, minZ: 14, maxZ: 22, height: 2.9,
    openings: [
      { side: 'south', center: -0.6, half: GAP, height: DOOR_H },
      { side: 'east', center: 15.8, half: GAP, height: DOOR_H }, // to bathroom
    ],
  },
  // Bathroom (ensuite, east of the bedroom).
  {
    id: 'bathroom',
    minX: 1.5, maxX: 5.5, minZ: 14, maxZ: 19, height: 2.6,
    openings: [{ side: 'west', center: 15.8, half: GAP, height: DOOR_H }],
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

// The study back-wall door lives at z = +HALF_D.
export const STUDY_BACK_Z = HALF_D
