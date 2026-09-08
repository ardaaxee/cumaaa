import { describe, expect, test } from 'vitest';
import { DISTRICT, DISTRICTS, WALKABLE_DISTRICTS } from '../src/world/districts.js';
import {
  BLOCKED_ZONES,
  WALKABLE_BOUNDS,
  WALKABLE_REGIONS,
  blockedZoneAt,
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
    expect(isWalkable(-44, -158)).toBe(true);
    expect(isWalkable(-26, -220)).toBe(true);
  });

  test('the civic plaza is walkable around the Spire', () => {
    expect(isWalkable(-44, -158)).toBe(true);
    expect(walkableRegionAt(-44, -158)).toBe('crownPlaza');
  });

  test('the Crown Spire plinth itself is blocked', () => {
    const crown = DISTRICTS[DISTRICT.CROWN_DISTRICT];
    expect(isWalkable(crown.centre.x, crown.centre.z)).toBe(false);
    expect(blockedZoneAt(crown.centre.x, crown.centre.z)?.id).toBe('crownSpirePlinth');
  });

  test('major Crown architecture has authored obstacle masks', () => {
    expect(BLOCKED_ZONES.length).toBeGreaterThanOrEqual(9);
    expect(isWalkable(-70, -140)).toBe(false);
    expect(blockedZoneAt(-70, -140)?.id).toBe('crownPodiumNW');
    expect(isWalkable(7, -150)).toBe(false);
    expect(blockedZoneAt(7, -150)?.id).toBe('crownEastWater');
  });

  test('unbuilt city void is not accidentally opened', () => {
    expect(isWalkable(-105, -235)).toBe(false);
    expect(isWalkable(55, -230)).toBe(false);
    expect(isWalkable(150, -158)).toBe(false);
  });

  test('constraint keeps legal points unchanged', () => {
    const out = { x: 0, z: 0 };
    const result = constrainToWalkable(-44, -158, out);
    expect(result).toBe(out);
    expect(out).toEqual({ x: -44, z: -158 });
  });

  test('constraint pushes Cuma out of the Spire instead of through it', () => {
    const out = { x: 0, z: 0 };
    constrainToWalkable(-26, -158, out);
    expect(isWalkable(out.x, out.z)).toBe(true);
    expect(Math.hypot(out.x + 26, out.z + 158)).toBeGreaterThan(16.2);
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

  test('every region overlaps the connected network', () => {
    for (let i = 0; i < WALKABLE_REGIONS.length; i += 1) {
      const a = WALKABLE_REGIONS[i];
      const touchesAnother = WALKABLE_REGIONS.some((b, j) => {
        if (i === j) return false;
        const overlapX = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX);
        const overlapZ = Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ);
        return overlapX >= 0 && overlapZ >= 0;
      });
      expect(touchesAnother, a.id).toBe(true);
    }
  });
});
