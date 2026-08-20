// Classifies the floor under a world XZ point so footsteps (and future systems)
// can respond to what the player is walking on. Zones mirror the real room
// materials in the house layout; anything unmatched is wood (the default floor).

export type Surface = 'wood' | 'carpet' | 'tile' | 'balcony'

interface Zone {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
  surface: Surface
}

// Ordered by priority — a rug (carpet) sitting on a wood floor wins over the
// room's base surface, so carpet/tile zones are listed before the room boxes.
const ZONES: Zone[] = [
  // Rugs (carpet) — soft footfalls
  { minX: -1.7, maxX: 1.7, minZ: -3.4, maxZ: 0.6, surface: 'carpet' }, // study rug
  { minX: -7.45, maxX: -4.05, minZ: 9.7, maxZ: 12.3, surface: 'carpet' }, // living rug
  { minX: -3.55, maxX: -0.95, minZ: 18.2, maxZ: 20.2, surface: 'carpet' }, // bedroom rug
  // Tile rooms
  { minX: 1.5, maxX: 9.5, minZ: 6, maxZ: 14, surface: 'tile' }, // kitchen
  { minX: 1.5, maxX: 5.5, minZ: 14, maxZ: 19, surface: 'tile' }, // bathroom
  // Balcony decking (hollow, outdoor)
  { minX: -12.6, maxX: -10, minZ: 8, maxZ: 12, surface: 'balcony' },
]

export function surfaceAt(x: number, z: number): Surface {
  for (const zn of ZONES) {
    if (x >= zn.minX && x <= zn.maxX && z >= zn.minZ && z <= zn.maxZ) return zn.surface
  }
  return 'wood'
}
