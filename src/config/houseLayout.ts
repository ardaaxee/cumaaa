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
      { side: 'north', center: 0.4, half: GAP, height: DOOR_H }, // to the sleeping-wing corridor (clear of the bed)
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

  // ---- North (sleeping) wing — what makes this a real 4+1 ------------------
  // A cross corridor runs east–west behind the first bedroom and feeds three
  // more bedrooms, the second bathroom and the laundry.
  {
    id: 'corridor',
    minX: -6, maxX: 10, minZ: 22, maxZ: 25, height: 2.7,
    openings: [
      { side: 'south', center: 0.4, half: GAP, height: DOOR_H }, // to bedroom 1
      { side: 'west', center: 23.5, half: GAP, height: DOOR_H }, // to bedroom 2
      { side: 'north', center: -3, half: GAP, height: DOOR_H }, // to bedroom 3
      { side: 'north', center: 3, half: GAP, height: DOOR_H }, // to bedroom 4
      { side: 'east', center: 23.5, half: GAP, height: DOOR_H }, // to bathroom 2
    ],
  },
  // Bedroom 2 — west end of the corridor, window facing west.
  {
    id: 'bedroom2',
    minX: -12, maxX: -6, minZ: 21, maxZ: 28, height: 2.85,
    openings: [{ side: 'east', center: 23.5, half: GAP, height: DOOR_H }],
    windows: [{ side: 'west', center: 24.5, width: 1.7, sillY: 0.9, height: 1.45, curtain: 'thick' }],
  },
  // Bedroom 3 — north-west, window facing north.
  {
    id: 'bedroom3',
    minX: -6, maxX: 0, minZ: 25, maxZ: 31, height: 2.85,
    openings: [{ side: 'south', center: -3, half: GAP, height: DOOR_H }],
    windows: [{ side: 'north', center: -3, width: 1.7, sillY: 0.9, height: 1.45, curtain: 'sheer' }],
  },
  // Bedroom 4 — north-east, window facing north.
  {
    id: 'bedroom4',
    minX: 0, maxX: 6, minZ: 25, maxZ: 31, height: 2.85,
    openings: [{ side: 'south', center: 3, half: GAP, height: DOOR_H }],
    windows: [{ side: 'north', center: 3, width: 1.7, sillY: 0.9, height: 1.45, curtain: 'sheer' }],
  },
  // Second (family) bathroom — off the east end of the corridor.
  {
    id: 'bathroom2',
    minX: 10, maxX: 14, minZ: 21, maxZ: 25.5, height: 2.6,
    openings: [
      { side: 'west', center: 23.5, half: GAP, height: DOOR_H },
      { side: 'north', center: 12, half: 0.5, height: DOOR_H }, // to laundry
    ],
    windows: [{ side: 'east', center: 23.2, width: 0.8, sillY: 1.35, height: 0.85, curtain: 'frosted', frosted: true }],
  },
  // Laundry / utility — behind the second bathroom.
  {
    id: 'laundry',
    minX: 10, maxX: 14, minZ: 25.5, maxZ: 29, height: 2.55,
    openings: [{ side: 'south', center: 12, half: 0.5, height: DOOR_H }],
  },
]

// Where a player can be placed when joining, per room id. Used for spawns and
// as the anchor each room's furniture is laid out around.
export const SPAWN_POINTS: Record<string, [number, number]> = {
  study: [0, 3],
  hallway: [0, 10],
  living: [-3.5, 10], // clear of the coffee table at the room's centre
  kitchen: [5.5, 9.5],
  bedroom: [-2.25, 18],
  bathroom: [3.4, 16.5],
  storage: [7.75, 15.5],
  corridor: [2, 23.5],
  bedroom2: [-9, 24.5],
  bedroom3: [-3, 28],
  bedroom4: [3, 28],
  bathroom2: [12, 23],
  laundry: [12, 27],
}

// Balcony hangs off the living room's west wall — open railing, no full walls.
// A full-width terrace rather than a ledge: 3.4 m deep and 7 m long, so two
// people can pass each other and a table and chairs still leave a walkway.
export const BALCONY = { minX: -13.4, maxX: -10, minZ: 6.5, maxZ: 13.5, height: 2.9 }

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
