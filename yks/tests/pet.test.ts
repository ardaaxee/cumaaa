import { describe, expect, it } from 'vitest';
import { defaultState } from '../src/store/schema';
import { levelForXp, petStatus, unlockedItems, xpForLevel } from '../src/utils/pet';

describe('panda arkadaş', () => {
  it('level thresholds are increasing and invertible', () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(60);
    expect(levelForXp(59)).toBe(1);
    expect(levelForXp(60)).toBe(2);
    expect(levelForXp(xpForLevel(7))).toBe(7);
  });

  it('a fresh state sleeps at level 1 with nothing unlocked', () => {
    const p = petStatus(defaultState(), '2026-09-28');
    expect(p).toMatchObject({ xp: 0, level: 1, mood: 'uykulu' });
    expect(unlockedItems(p.level)).toEqual([]);
  });
});
