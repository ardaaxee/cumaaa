// ARDA LAB — the hidden second 3D space, reached by physically walking through
// the opened bookcase. It sits in +X, beyond the main room's right wall, joined
// by a short corridor. All meshes, colliders and interaction triggers derive
// from these constants so geometry stays consistent.
//
// Main room: x ∈ [-5, 5], z ∈ [-6, 6]. The doorway is carved in the right wall
// (x = 5) around z = -2 (behind the bookcase).

import { HALF_W } from './roomLayout'

// Doorway gap in the main room's right wall (world coordinates).
export const DOOR = {
  x: HALF_W, // 5
  zCenter: -2,
  halfWidth: 0.9, // gap spans z ∈ [-2.9, -1.1]
  height: 2.3,
}

// Corridor connecting the doorway to the lab.
export const CORRIDOR = {
  xStart: HALF_W, // 5
  xEnd: 7, // lab near wall
  zCenter: DOOR.zCenter,
  halfWidth: DOOR.halfWidth,
  height: 2.6,
}

// The lab room box.
export const LAB = {
  minX: 7,
  maxX: 14,
  minZ: -7,
  maxZ: 1,
  height: 3.6,
  wall: 0.2,
}

export const LAB_W = LAB.maxX - LAB.minX // 7
export const LAB_D = LAB.maxZ - LAB.minZ // 8
export const LAB_CX = (LAB.minX + LAB.maxX) / 2 // 10.5
export const LAB_CZ = (LAB.minZ + LAB.maxZ) / 2 // -3

// Station anchor points (world coords). Composed so the room reads like a real
// lab: a central core, terminals along the back, data walls on the sides.
export const LAB_ANCHORS = {
  // Central project hologram (the room's centerpiece).
  hologram: [LAB_CX, 1.35, LAB_CZ] as const,

  // Energy "Project Core" on a pedestal, front-centre, before the ach wall.
  core: [LAB_CX, 0, LAB.minZ + 1.6] as const,

  // Code terminal + ARDA AI terminal along the back wall (+Z).
  terminal: [LAB.minX + 1.7, 0, LAB.maxZ - 0.85] as const,
  aiTerminal: [LAB.maxX - 1.7, 0, LAB.maxZ - 0.85] as const,

  // Idea wall on the right wall (+X).
  ideaWall: [LAB.maxX - 0.16, 1.7, LAB_CZ] as const,

  // Achievement core on the front wall (-Z).
  achWall: [LAB_CX, 1.65, LAB.minZ + 0.18] as const,

  // Future-projects bay in the darker front-left corner.
  future: [LAB.minX + 1.0, 1.6, LAB.minZ + 0.2] as const,

  // Server racks along the right wall, back section.
  rackA: [LAB.maxX - 0.65, 0, LAB.minZ + 1.3] as const,
  rackB: [LAB.maxX - 0.65, 0, LAB.minZ + 2.7] as const,

  // Exit portal back to the room (at the corridor mouth).
  exit: [LAB.minX + 0.5, 1.4, DOOR.zCenter] as const,

  // "ARDA LAB" sign over the entrance.
  sign: [LAB.minX + 0.14, 2.9, DOOR.zCenter] as const,
}
