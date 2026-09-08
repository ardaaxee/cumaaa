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
  // both sides of the seam so ordinary locomotion crosses continuously.
  rect('crownApproach', -20, 12, -102, -76, DISTRICT.CROWN_DISTRICT),

  // South boulevard: the dog-leg between the market and the civic plaza.
  rect('crownSouthBoulevard', -28, 12, -150, -96, DISTRICT.CROWN_DISTRICT),

  // Crown Plaza itself. The authored square is broad, but deliberately not the
  // entire district AABB: the player cannot wander into unbuilt city void.
  rect('crownPlaza', -68, 16, -194, -122, DISTRICT.CROWN_DISTRICT),

  // North boulevard continues beyond the plaza toward the monumental gate.
  rect('crownNorthBoulevard', -46, -6, -238, -142, DISTRICT.CROWN_DISTRICT),

  // Covered civic promenades at either side of the square.
  rect('crownWestPromenade', -74, -48, -216, -126, DISTRICT.CROWN_DISTRICT),
  rect('crownEastPromenade', -4, 18, -216, -126, DISTRICT.CROWN_DISTRICT),
];

export const WALKABLE_BOUNDS = Object.freeze({
  minX: Math.min(...WALKABLE_REGIONS.map((region) => region.minX)),
  maxX: Math.max(...WALKABLE_REGIONS.map((region) => region.maxX)),
  minZ: Math.min(...WALKABLE_REGIONS.map((region) => region.minZ)),
  maxZ: Math.max(...WALKABLE_REGIONS.map((region) => region.maxZ)),
});

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
