import { describe, expect, it } from 'vitest';
import { computeBadges } from '../src/utils/badges';
import { defaultState } from '../src/store/schema';
import { gradeCard } from '../src/store/actions';

describe('rozetler', () => {
  it('starts with no earned badges on empty state', () => {
    expect(computeBadges(defaultState(), '2026-09-28').filter((b) => b.earned)).toHaveLength(0);
  });

  it('awards the notebook badge from real notebook pages', () => {
    const s = defaultState();
    const pages = Array.from({ length: 5 }, (_, i) => ({ id: `p${i}`, title: 'x', createdAt: '', updatedAt: '' }));
    const b = computeBadges({ ...s, notebookPages: pages }, '2026-09-28').find((x) => x.id === 'defter');
    expect(b?.earned).toBe(true);
  });
});

describe('bilgi kartları', () => {
  it('moves a known card up and a forgotten card back to box 1', () => {
    let s = gradeCard(defaultState(), 'c1', 'biliyorum', '2026-09-28');
    expect(s.cards.c1.box).toBe(3);
    s = gradeCard(s, 'c1', 'biliyorum', '2026-09-28');
    expect(s.cards.c1.box).toBe(4);
    expect(s.cards.c1.dueDay).toBe('2026-10-06');
    s = gradeCard(s, 'c1', 'bilmiyorum', '2026-09-28');
    expect(s.cards.c1.box).toBe(1);
    expect(s.cards.c1.dueDay).toBe('2026-09-29');
  });
});
