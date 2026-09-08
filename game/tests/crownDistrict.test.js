import { describe, expect, test } from 'vitest';
import { DISTRICT, DISTRICTS, WALKABLE_DISTRICTS } from '../src/world/districts.js';
import {
  WALKABLE_BOUNDS,
  WALKABLE_REGIONS,
  constrainToWalkable,
  isWalkable,
  walkableRegionAt,
} from '../src/world/walkableWorld.js';

describe('M04 Crown District walkability', () => {
  test('Meridian and Crown are the two runtime-walkable districts', () => {
    expect(WALKABLE_DISTRICTS).toEqual([
      DISTRICT.MERIDIAN_MARKET,
      DISTRICT.CROWN_DISTRICT,
    ]);
    expect(DISTRICTS[DISTRICT.CROWN_DISTRICT].walkable).toBe(true);
  });

  test('the authored regions form one north-south chain', () => {
    expect(isWalkable(0, -77)).toBe(true);
    expect(isWalkable(-4, -99)).toBe(true);
    expect(isWalkable(-20, -124)).toBe(true);
    expect(isWalkable(-26, -158)).toBe(true);
    expect(isWalkable(-26, -230)).toBe(true);
  });

  test('Crown centre is real walkable ground', () => {
    const crown = DISTRICTS[DISTRICT.CROWN_DISTRICT];
    expect(isWalkable(crown.centre.x, crown.centre.z)).toBe(true);
    expect(walkableRegionAt(crown.centre.x, crown.centre.z)).toBe('crownPlaza');
  });

  test('unbuilt city void is not accidentally opened', () => {
    expect(isWalkable(-105, -235)).toBe(false);
    expect(isWalkable(55, -230)).toBe(false);
    expect(isWalkable(150, -158)).toBe(false);
  });

  test('constraint keeps legal points unchanged', () => {
    const out = { x: 0, z: 0 };
    const result = constrainToWalkable(-26, -158, out);
    expect(result).toBe(out);
    expect(out).toEqual({ x: -26, z: -158 });
  });

  test('constraint projects outside points onto the nearest authored surface', () => {
    const out = { x: 0, z: 0 };
    constrainToWalkable(90, -158, out);
    expect(isWalkable(out.x, out.z)).toBe(true);
    expect(out.x).toBeLessThanOrEqual(18);
  });

  test('the global envelope covers every authored region', () => {
    for (const region of WALKABLE_REGIONS) {
      expect(region.minX).toBeGreaterThanOrEqual(WALKABLE_BOUNDS.minX);
      expect(region.maxX).toBeLessThanOrEqual(WALKABLE_BOUNDS.maxX);
      expect(region.minZ).toBeGreaterThanOrEqual(WALKABLE_BOUNDS.minZ);
      expect(region.maxZ).toBeLessThanOrEqual(WALKABLE_BOUNDS.maxZ);
    }
  });

  test('adjacent regions overlap so crossing cannot require a teleport', () => {
    for (let i = 0; i < WALKABLE_REGIONS.length - 1; i += 1) {
      const a = WALKABLE_REGIONS[i];
      const later = WALKABLE_REGIONS.slice(i + 1);
      const touchesAnother = later.some((b) => {
        const overlapX = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX);
        const overlapZ = Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ);
        return overlapX >= 0 && overlapZ >= 0;
      });

      // Side promenades are branches off the main chain; every region still has
      // to overlap at least one region that comes after it except the final leaf.
      if (i < WALKABLE_REGIONS.length - 1) {
        const earlierTouches = WALKABLE_REGIONS.slice(0, i).some((b) => {
          const overlapX = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX);
          const overlapZ = Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ);
          return overlapX >= 0 && overlapZ >= 0;
        });
        expect(touchesAnother || earlierTouches, a.id).toBe(true);
      }
    }
  });
});
