import { DISTRICT, DISTRICTS } from './districts.js';

/**
 * The connected ground-plane navigation envelope for Aster City.
 *
 * This is deliberately pure geometry. Character locomotion does not need to
 * know what a district is; it only asks this module to keep a proposed point on
 * a legal walkable surface. Rectangles overlap at their seams so crossing from
 * one region to the next never snaps or needs a teleport.
 */

const rect = (id, minX, maxX, minZ, maxZ, district = null) => ({
  id,
  minX,
  maxX,
  minZ,
  maxZ,
  district,
});

const market = DISTRICTS[DISTRICT.MERIDIAN_MARKET].bounds;
const crown = DISTRICTS[DISTRICT.CROWN_DISTRICT].bounds;

export const WALKABLE_REGIONS = [
  rect(
    'meridianMarket',
    market.minX,
    market.maxX,
    market.minZ,
    market.maxZ,
    DISTRICT.MERIDIAN_MARKET,
  ),

  // A broad civic approach running north out of Meridian Market. It overlaps
  // both districts by two metres so normal frame-sized movement crosses the
  // seam continuously.
  rect('crownApproach', -20, 12, -98, -76),

  rect(
    'crownDistrict',
    crown.minX,
    crown.maxX,
    crown.minZ,
    crown.maxZ,
    DISTRICT.CROWN_DISTRICT,
  ),
];

export function isInsideWalkableRegion(region, x, z) {
  return x >= region.minX && x <= region.maxX && z >= region.minZ && z <= region.maxZ;
}

export function isWalkable(x, z) {
  for (const region of WALKABLE_REGIONS) {
    if (isInsideWalkableRegion(region, x, z)) return true;
  }
  return false;
}

/**
 * Returns the nearest legal point in the connected walkable envelope.
 *
 * `out` is optional and can be reused by the caller to keep this allocation-free
 * on the locomotion hot path.
 */
export function constrainToWalkable(x, z, out = { x: 0, z: 0 }) {
  if (isWalkable(x, z)) {
    out.x = x;
    out.z = z;
    return out;
  }

  let bestX = x;
  let bestZ = z;
  let bestDistanceSq = Infinity;

  for (const region of WALKABLE_REGIONS) {
    const candidateX = Math.max(region.minX, Math.min(region.maxX, x));
    const candidateZ = Math.max(region.minZ, Math.min(region.maxZ, z));
    const dx = candidateX - x;
    const dz = candidateZ - z;
    const distanceSq = dx * dx + dz * dz;

    if (distanceSq < bestDistanceSq) {
      bestDistanceSq = distanceSq;
      bestX = candidateX;
      bestZ = candidateZ;
    }
  }

  out.x = bestX;
  out.z = bestZ;
  return out;
}

export function walkableRegionAt(x, z) {
  for (const region of WALKABLE_REGIONS) {
    if (isInsideWalkableRegion(region, x, z)) return region.id;
  }
  return null;
}
