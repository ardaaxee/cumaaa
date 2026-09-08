/**
 * Aster City's districts.
 *
 * Pure data — no THREE, no DOM — so the catalog can be asserted directly.
 * Meridian Market and Crown District are playable in M04; the remaining
 * districts still exist as skyline, roads and discoverable city mass.
 *
 * `bounds` are world-space AABBs on the ground plane. `viewDirection` is the
 * heading, in radians, you look along from Meridian Market to see the district —
 * region discovery uses it to name what you are looking at.
 */

export const DISTRICT = {
  MERIDIAN_MARKET: 'meridianMarket',
  CROWN_DISTRICT: 'crownDistrict',
  OLD_ASTER: 'oldAster',
  BLACKGLASS_DOCKS: 'blackglassDocks',
  NORTHLINE: 'northline',
};

/** North is -Z, east is +X, matching the rest of the world. */
const HEADING = {
  NORTH: Math.PI,
  NORTH_WEST: Math.PI * 0.75,
  EAST: -Math.PI / 2,
  WEST: Math.PI / 2,
  SOUTH: 0,
};

export const DISTRICTS = {
  [DISTRICT.MERIDIAN_MARKET]: {
    id: DISTRICT.MERIDIAN_MARKET,
    name: 'MERIDIAN MARKET',
    subtitle: 'Trade quarter · night market',
    playable: true,
    centre: { x: 0, z: 4 },
    bounds: { minX: -46, maxX: 46, minZ: -78, maxZ: 78 },
    viewDirection: HEADING.SOUTH,
    discoveredAtStart: true,
  },

  [DISTRICT.CROWN_DISTRICT]: {
    id: DISTRICT.CROWN_DISTRICT,
    name: 'CROWN DISTRICT',
    subtitle: 'Beneath the Crown Spire',
    playable: true,
    centre: { x: -26, z: -158 },
    bounds: { minX: -110, maxX: 60, minZ: -240, maxZ: -96 },
    viewDirection: HEADING.NORTH,
    discoveredAtStart: false,
  },

  [DISTRICT.OLD_ASTER]: {
    id: DISTRICT.OLD_ASTER,
    name: 'OLD ASTER',
    subtitle: 'The first stones of the city',
    playable: false,
    centre: { x: -132, z: 20 },
    bounds: { minX: -210, maxX: -70, minZ: -60, maxZ: 110 },
    viewDirection: HEADING.WEST,
    discoveredAtStart: false,
  },

  [DISTRICT.BLACKGLASS_DOCKS]: {
    id: DISTRICT.BLACKGLASS_DOCKS,
    name: 'BLACKGLASS DOCKS',
    subtitle: 'Freight water, east reach',
    playable: false,
    centre: { x: 146, z: 34 },
    bounds: { minX: 84, maxX: 230, minZ: -50, maxZ: 130 },
    viewDirection: HEADING.EAST,
    discoveredAtStart: false,
  },

  [DISTRICT.NORTHLINE]: {
    id: DISTRICT.NORTHLINE,
    name: 'NORTHLINE',
    subtitle: 'Transit spine',
    playable: false,
    centre: { x: -96, z: -104 },
    bounds: { minX: -190, maxX: -40, minZ: -190, maxZ: -60 },
    viewDirection: HEADING.NORTH_WEST,
    discoveredAtStart: false,
  },
};

export const DISTRICT_IDS = Object.keys(DISTRICTS);

/** All regions that currently have real walkable ground and collision. */
export const PLAYABLE_DISTRICTS = DISTRICT_IDS.filter((id) => DISTRICTS[id].playable);

/**
 * Backwards-compatible default district used by older event fallback code.
 * New code should prefer PLAYABLE_DISTRICTS when it needs the full set.
 */
export const PLAYABLE_DISTRICT = DISTRICT.MERIDIAN_MARKET;

/** Districts a fresh save already knows about. */
export const initiallyDiscovered = () =>
  DISTRICT_IDS.filter((id) => DISTRICTS[id].discoveredAtStart);

/** True if a point on the ground plane falls inside a district's bounds. */
export function isInsideDistrict(id, x, z) {
  const district = DISTRICTS[id];
  if (!district) return false;
  const { bounds } = district;
  return x >= bounds.minX && x <= bounds.maxX && z >= bounds.minZ && z <= bounds.maxZ;
}

/** Which district contains a point, or null. Playable districts win ties. */
export function districtAt(x, z) {
  let fallback = null;
  for (const id of DISTRICT_IDS) {
    if (!isInsideDistrict(id, x, z)) continue;
    if (DISTRICTS[id].playable) return id;
    if (!fallback) fallback = id;
  }
  return fallback;
}

/** Straight-line distance from a point to a district's centre. */
export function distanceToDistrict(id, x, z) {
  const district = DISTRICTS[id];
  if (!district) return Infinity;
  return Math.hypot(district.centre.x - x, district.centre.z - z);
}
