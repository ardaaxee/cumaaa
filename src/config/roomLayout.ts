// Single source of truth for room dimensions and furniture placement.
// Meshes, colliders and interactable trigger volumes all derive from here so
// nothing drifts out of sync. Units are metres; the room floor is centred at
// the origin, y = 0 is the floor.

export const ROOM = {
  width: 10, // X
  depth: 12, // Z
  height: 3.4, // Y
  wall: 0.2,
}

export const PLAYER = {
  radius: 0.32,
  eyeHeight: 1.62,
  speed: 3.1, // metres / second
  sprintSpeed: 4.8,
}

// Convenience half extents.
export const HALF_W = ROOM.width / 2
export const HALF_D = ROOM.depth / 2

// Named anchor points for the major furniture pieces. Keeping them here means
// the interaction triggers and colliders reference the same coordinates.
export const ANCHORS = {
  // Desk sits against the far wall (-Z), player-facing.
  desk: { pos: [0, 0, -HALF_D + 1.1] as const },
  monitor: { pos: [0, 1.36, -HALF_D + 0.75] as const },
  chair: { pos: [0, 0, -HALF_D + 2.2] as const },

  // Task board on the left wall (-X).
  taskboard: { pos: [-HALF_W + 0.16, 1.6, -1.5] as const },

  // Bookcase / archive on the right wall (+X).
  bookcase: { pos: [HALF_W - 0.3, 0, -2] as const },

  // Achievement wall on the left wall (-X), further forward.
  achievements: { pos: [-HALF_W + 0.16, 1.7, 2.6] as const },

  // Bed in the back-right corner.
  bed: { pos: [HALF_W - 1.5, 0, HALF_D - 1.7] as const },

  // Big window on the far wall (-Z), to the right of the desk.
  window: { pos: [HALF_W - 2.2, 1.7, -HALF_D + 0.11] as const },

  // Speaker (music) on the desk-right shelf.
  speaker: { pos: [1.9, 0.98, -HALF_D + 1.0] as const },

  // Secret panel: a book-spine in the bookcase.
  secret: { pos: [HALF_W - 0.32, 1.15, -1.2] as const },

  // Plant + lamp accents.
  plant: { pos: [-HALF_W + 0.9, 0, HALF_D - 1.0] as const },
  lamp: { pos: [-1.7, 0.98, -HALF_D + 1.0] as const },
}
