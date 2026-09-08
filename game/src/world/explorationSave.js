import { DISTRICT_IDS } from './districts.js';

export const EXPLORATION_KEY = 'cuma-world.exploration.v1';

// Storage can be blocked by the browser. Exploration still works in memory.
export function createExplorationSave(storage = () => globalThis.localStorage) {
  return {
    load() {
      try {
        const data = JSON.parse(storage()?.getItem(EXPLORATION_KEY) ?? 'null');
        if (data?.version !== 1 || !Array.isArray(data.regions)) return [];
        return DISTRICT_IDS.filter((id) => data.regions.includes(id));
      } catch {
        return [];
      }
    },
    save(regions) {
      try {
        const target = storage();
        if (!target) return false;
        target.setItem(EXPLORATION_KEY, JSON.stringify({
          version: 1,
          regions: DISTRICT_IDS.filter((id) => regions.includes(id)),
        }));
        return true;
      } catch {
        return false;
      }
    },
  };
}
