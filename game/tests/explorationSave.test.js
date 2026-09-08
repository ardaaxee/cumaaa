import { describe, it, expect, vi } from 'vitest';
import { createExplorationSave, EXPLORATION_KEY } from '../src/world/explorationSave.js';
import { createRegionDiscovery } from '../src/world/regionDiscovery.js';

describe('exploration persistence', () => {
  it('restores discoveries without replaying reveals after reopening', () => {
    const values = new Map();
    const save = createExplorationSave(() => ({
      getItem: (key) => values.get(key),
      setItem: (key, value) => values.set(key, value),
    }));
    const discovery = createRegionDiscovery({ onDiscover: () => save.save(discovery.list()) });
    discovery.discover('crownDistrict');
    const reveal = vi.fn();
    const restored = createRegionDiscovery({ restored: save.load(), onDiscover: reveal });
    expect(restored.list()).toEqual(['meridianMarket', 'crownDistrict']);
    expect(restored.discover('crownDistrict')).toBe(false);
    expect(reveal).not.toHaveBeenCalled();
    expect(values.has(EXPLORATION_KEY)).toBe(true);
  });

  it.each(['bad json', 'null', '{"version":2,"regions":["crownDistrict"]}',
    '{"version":1,"regions":{}}'])('ignores invalid saves: %s', (raw) => {
    expect(createExplorationSave(() => ({ getItem: () => raw })).load()).toEqual([]);
  });

  it('filters unknown and duplicate regions and retains the starting region', () => {
    const save = createExplorationSave(() => ({ getItem: () => JSON.stringify({
      version: 1, regions: ['crownDistrict', 'crownDistrict', 'unknown', '__proto__'],
    }) }));
    const discovery = createRegionDiscovery({ restored: save.load() });
    expect(discovery.list()).toEqual(['meridianMarket', 'crownDistrict']);
    expect(discovery.discover('unknown')).toBe(false);
    expect(discovery.discover('__proto__')).toBe(false);
  });

  it('keeps exploration usable when storage access throws', () => {
    const save = createExplorationSave(() => { throw new Error('blocked'); });
    expect(save.load()).toEqual([]);
    expect(save.save(['crownDistrict'])).toBe(false);
    const discovery = createRegionDiscovery({ restored: save.load() });
    expect(discovery.discover('crownDistrict')).toBe(true);
  });
});
