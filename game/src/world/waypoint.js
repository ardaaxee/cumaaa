import { DISTRICTS } from './districts.js';
import { angleDelta } from '../core/mathx.js';

// Authored arrival points on open ground, clear of the Spire's blocked plinth.
export const WAYPOINTS = Object.freeze({
  meridianMarket: Object.freeze({ x: 0, z: 4 }),
  crownDistrict: Object.freeze({ x: -20, z: -128 }),
});
export const ARRIVAL_RADIUS = 8;

export function createWaypointTracker() {
  let target = null;
  return {
    get target() { return target; },
    select(id, discovered) {
      if (!Object.hasOwn(WAYPOINTS, id) || !discovered.includes(id)) return false;
      target = id;
      return true;
    },
    clear() { target = null; },
    update(position, cameraYaw) {
      if (!target) return null;
      const point = WAYPOINTS[target];
      const dx = point.x - position.x;
      const dz = point.z - position.z;
      const distance = Math.hypot(dx, dz);
      const result = {
        id: target, name: DISTRICTS[target].name, distance,
        // CSS positive rotation points right. Camera yaw uses the opposite sign.
        angle: -angleDelta(cameraYaw + Math.PI, Math.atan2(dx, dz)),
        arrived: distance <= ARRIVAL_RADIUS,
      };
      if (result.arrived) target = null;
      return result;
    },
  };
}
