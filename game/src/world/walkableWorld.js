import { DISTRICT, DISTRICTS } from './districts.js';

/**
 * The connected ground-plane navigation envelope for Aster City.
 *
 * Character locomotion asks this pure module to keep a proposed point on legal
 * authored ground. Walkable rectangles overlap at their seams, while blocked
 * zones cut major architecture and reflecting pools back out of that ground.
 */

const EPSILON = 0.04;

const rect = (id, minX, maxX, minZ, maxZ, district = null) => ({
  id,
  minX,
  maxX,
  minZ,
  maxZ,
  district,
});

const blockedRect = (id, minX, maxX, minZ, maxZ) => ({
  id,
  kind: 'rect',
  minX,
  maxX,
  minZ,
  maxZ,
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
  rect('crownApproach', -20, 12, -102, -76, DISTRICT.CROWN_DISTRICT),
  rect('crownSouthBoulevard', -28, 12, -150, -96, DISTRICT.CROWN_DISTRICT),
  rect('crownPlaza', -68, 16, -194, -122, DISTRICT.CROWN_DISTRICT),
  rect('crownNorthBoulevard', -46, -6, -238, -142, DISTRICT.CROWN_DISTRICT),
  rect('crownWestPromenade', -74, -48, -216, -126, DISTRICT.CROWN_DISTRICT),
  rect('crownEastPromenade', -4, 18, -216, -126, DISTRICT.CROWN_DISTRICT),
];

/**
 * Major architecture the player must not pass through. Small props stay visual
 * only so movement never becomes a phone-screen slalom course.
 */
export const BLOCKED_ZONES = [
  { id: 'crownSpirePlinth', kind: 'circle', x: -26, z: -158, radius: 16.2 },

  // Reflecting channels beside the main plaza axis.
  blockedRect('crownWestWater', -61.8, -56.2, -185.4, -132.6),
  blockedRect('crownEastWater', 4.2, 9.8, -185.4, -132.6),

  // Four corporate podium footprints, padded by roughly Cuma's shoulder width.
  blockedRect('crownPodiumNW', -95.8, -60.2, -152.8, -123.2),
  blockedRect('crownPodiumNE', 8.7, 41.3, -157.8, -126.2),
  blockedRect('crownPodiumSW', -100.8, -63.2, -211.8, -184.2),
  blockedRect('crownPodiumSE', 14.2, 47.8, -216.8, -187.2),

  // The monumental north-gate piers are on the final boulevard itself.
  blockedRect('crownGateWest', -45.5, -40.5, -233.0, -227.0),
  blockedRect('crownGateEast', -11.5, -6.5, -233.0, -227.0),
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

function isInsideAnyRegion(x, z) {
  for (const region of WALKABLE_REGIONS) {
    if (isInsideWalkableRegion(region, x, z)) return true;
  }
  return false;
}

export function blockedZoneAt(x, z) {
  for (const zone of BLOCKED_ZONES) {
    if (zone.kind === 'circle') {
      const dx = x - zone.x;
      const dz = z - zone.z;
      if (dx * dx + dz * dz < zone.radius * zone.radius) return zone;
      continue;
    }
    if (x > zone.minX && x < zone.maxX && z > zone.minZ && z < zone.maxZ) return zone;
  }
  return null;
}

export function isWalkable(x, z) {
  return isInsideAnyRegion(x, z) && blockedZoneAt(x, z) === null;
}

function nearestRegionPoint(x, z, out) {
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
}

/** Selects the closest legal candidate to the original requested point. */
function pickLegalCandidate(originX, originZ, candidates, out) {
  let bestDistanceSq = Infinity;
  let found = false;

  for (let i = 0; i < candidates.length; i += 2) {
    const x = candidates[i];
    const z = candidates[i + 1];
    if (!isWalkable(x, z)) continue;
    const dx = x - originX;
    const dz = z - originZ;
    const distanceSq = dx * dx + dz * dz;
    if (distanceSq >= bestDistanceSq) continue;
    bestDistanceSq = distanceSq;
    out.x = x;
    out.z = z;
    found = true;
  }

  return found;
}

// Reused scratch; constrainToWalkable is called on the locomotion hot path.
const obstacleCandidates = new Float64Array(8);

function pushOutOfObstacle(zone, originX, originZ, point, out) {
  if (zone.kind === 'circle') {
    let dx = point.x - zone.x;
    let dz = point.z - zone.z;
    let length = Math.hypot(dx, dz);

    if (length < 1e-6) {
      dx = originX - zone.x;
      dz = originZ - zone.z;
      length = Math.hypot(dx, dz);
    }
    if (length < 1e-6) {
      dx = 1;
      dz = 0;
      length = 1;
    }

    const scale = (zone.radius + EPSILON) / length;
    const radialX = zone.x + dx * scale;
    const radialZ = zone.z + dz * scale;
    if (isWalkable(radialX, radialZ)) {
      out.x = radialX;
      out.z = radialZ;
      return true;
    }

    obstacleCandidates[0] = zone.x - zone.radius - EPSILON;
    obstacleCandidates[1] = zone.z;
    obstacleCandidates[2] = zone.x + zone.radius + EPSILON;
    obstacleCandidates[3] = zone.z;
    obstacleCandidates[4] = zone.x;
    obstacleCandidates[5] = zone.z - zone.radius - EPSILON;
    obstacleCandidates[6] = zone.x;
    obstacleCandidates[7] = zone.z + zone.radius + EPSILON;
    return pickLegalCandidate(originX, originZ, obstacleCandidates, out);
  }

  obstacleCandidates[0] = zone.minX - EPSILON;
  obstacleCandidates[1] = point.z;
  obstacleCandidates[2] = zone.maxX + EPSILON;
  obstacleCandidates[3] = point.z;
  obstacleCandidates[4] = point.x;
  obstacleCandidates[5] = zone.minZ - EPSILON;
  obstacleCandidates[6] = point.x;
  obstacleCandidates[7] = zone.maxZ + EPSILON;
  return pickLegalCandidate(originX, originZ, obstacleCandidates, out);
}

/**
 * Returns the nearest legal point in the connected walkable envelope.
 * `out` can be reused by the caller, keeping the character update allocation-free.
 */
export function constrainToWalkable(x, z, out = { x: 0, z: 0 }) {
  if (isWalkable(x, z)) {
    out.x = x;
    out.z = z;
    return out;
  }

  nearestRegionPoint(x, z, out);

  // A point may be geometrically inside authored ground but inside a building,
  // pool or the Spire base. Resolve at most two overlapping masks; the catalog
  // is authored not to stack more than that.
  for (let pass = 0; pass < 2; pass += 1) {
    const zone = blockedZoneAt(out.x, out.z);
    if (!zone) break;
    if (!pushOutOfObstacle(zone, x, z, out, out)) break;
  }

  // The obstacle projection is normally enough. This final safety clamp handles
  // any future zone authored against a region edge without ever returning void.
  if (!isWalkable(out.x, out.z)) {
    nearestRegionPoint(out.x, out.z, out);
  }

  return out;
}

export function walkableRegionAt(x, z) {
  if (!isWalkable(x, z)) return null;
  for (const region of WALKABLE_REGIONS) {
    if (isInsideWalkableRegion(region, x, z)) return region.id;
  }
  return null;
}
