import { describe, it, expect } from 'vitest';
import { createWaypointTracker, WAYPOINTS, ARRIVAL_RADIUS } from '../src/world/waypoint.js';
import { isWalkable } from '../src/world/walkableWorld.js';

describe('district waypoints', () => {
  it('only selects discovered, authored destinations', () => {
    const tracker = createWaypointTracker();
    expect(tracker.select('crownDistrict', ['meridianMarket'])).toBe(false);
    expect(tracker.select('oldAster', ['oldAster'])).toBe(false);
    expect(tracker.select('__proto__', ['__proto__'])).toBe(false);
    expect(tracker.target).toBe(null);
    expect(tracker.select('crownDistrict', ['crownDistrict'])).toBe(true);
  });
  it('places each destination on reachable ground', () => {
    for (const point of Object.values(WAYPOINTS)) expect(isWalkable(point.x, point.z)).toBe(true);
  });
  it.each([
    [{ x: 0, z: 24 }, 0, 0],
    [{ x: -20, z: 4 }, 0, Math.PI / 2],
    [{ x: 20, z: 4 }, 0, -Math.PI / 2],
    [{ x: -20, z: 4 }, -Math.PI / 2, 0],
    [{ x: 0, z: 24 }, 2 * Math.PI, 0],
  ])('matches camera-relative heading at %j yaw %s', (position, yaw, expected) => {
    const tracker = createWaypointTracker();
    tracker.select('meridianMarket', ['meridianMarket']);
    const guidance = tracker.update(position, yaw);
    expect(guidance.angle).toBeCloseTo(expected);
    expect(guidance.distance).toBeCloseTo(20);
    expect(guidance.arrived).toBe(false);
  });
  it('announces arrival once and clears the target at the radius boundary', () => {
    const tracker = createWaypointTracker();
    tracker.select('crownDistrict', ['crownDistrict']);
    const point = WAYPOINTS.crownDistrict;
    expect(tracker.update({ x: point.x, z: point.z + ARRIVAL_RADIUS }, 0).arrived).toBe(true);
    expect(tracker.target).toBe(null);
    expect(tracker.update(point, 0)).toBe(null);
  });
  it('can replace and cancel a target', () => {
    const tracker = createWaypointTracker();
    const known = ['meridianMarket', 'crownDistrict'];
    tracker.select('meridianMarket', known);
    tracker.select('crownDistrict', known);
    expect(tracker.target).toBe('crownDistrict');
    tracker.clear();
    expect(tracker.update({ x: 0, z: 0 }, 0)).toBe(null);
  });
});
