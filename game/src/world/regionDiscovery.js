import { DISTRICTS, DISTRICT_IDS, initiallyDiscovered } from './districts.js';
import { angleDelta } from '../core/mathx.js';

/**
 * Naming the city as the player finds it.
 *
 * A district is discovered when the player stands somewhere it is visible from
 * and looks toward it for a moment. Each one is announced once, quietly, and
 * then it exists on the map — the map never lists places the player has not
 * seen.
 *
 * Pure logic; the caller supplies the camera heading and decides how to show
 * the reveal.
 */

/** How closely the camera must point at a district to count as looking at it. */
const LOOK_TOLERANCE = 0.55;

/** Seconds of sustained looking before a district is named. */
const DWELL_REQUIRED = 1.1;

/** The player must be at least this far from a district's centre to "spot" it. */
const MIN_SPOT_DISTANCE = 40;

/** Districts closer than this are simply entered rather than spotted. */
const ENTER_DISTANCE = 34;

export function createRegionDiscovery({ onDiscover } = {}) {
  const discovered = new Set(initiallyDiscovered());
  const looking = Object.create(null);

  /** Districts the player has seen, in catalog order. */
  const list = () => DISTRICT_IDS.filter((id) => discovered.has(id));

  function discover(id) {
    if (discovered.has(id)) return false;
    discovered.add(id);
    onDiscover?.(DISTRICTS[id]);
    return true;
  }

  return {
    get discovered() {
      return discovered;
    },
    list,
    has: (id) => discovered.has(id),
    /** Exposed for the world event that reveals a vista directly. */
    discover,

    /**
     * @param {number} dt
     * @param {object} player `{ x, z }`
     * @param {number} cameraYaw the direction the camera is looking along
     */
    update(dt, player, cameraYaw) {
      if (!(dt > 0)) return null;

      // The camera's forward heading, in the same convention as districts.
      const heading = cameraYaw + Math.PI;
      let revealed = null;

      for (const id of DISTRICT_IDS) {
        if (discovered.has(id)) continue;
        const district = DISTRICTS[id];

        const dx = district.centre.x - player.x;
        const dz = district.centre.z - player.z;
        const distance = Math.hypot(dx, dz);

        // Walking into a district names it outright.
        if (distance <= ENTER_DISTANCE) {
          if (discover(id)) revealed = district;
          continue;
        }
        if (distance < MIN_SPOT_DISTANCE) continue;

        // Otherwise it has to be looked at, and looked at for a moment.
        const bearing = Math.atan2(dx, dz);
        const off = Math.abs(angleDelta(heading, bearing));
        if (off > LOOK_TOLERANCE) {
          looking[id] = 0;
          continue;
        }

        looking[id] = (looking[id] ?? 0) + dt;
        if (looking[id] >= DWELL_REQUIRED) {
          if (discover(id)) revealed = district;
        }
      }

      return revealed;
    },
  };
}

export const DISCOVERY_TUNING = {
  LOOK_TOLERANCE,
  DWELL_REQUIRED,
  MIN_SPOT_DISTANCE,
  ENTER_DISTANCE,
};
