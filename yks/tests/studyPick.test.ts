import { describe, expect, it } from 'vitest';
import { SUBJECTS, subjectTopics } from '../src/data/curriculum';
import { defaultState } from '../src/store/schema';
import { suggestTopics } from '../src/utils/studyPick';

describe('ders çalış önerileri', () => {
  it('veri yoksa derslerin sıradaki (ilk) konularını önerir', () => {
    const recs = suggestTopics(defaultState(), '2026-09-29', 4);
    expect(recs).toHaveLength(4);
    const firsts = new Set(SUBJECTS.map((s) => subjectTopics(s.id)[0]?.id));
    expect(recs.every((r) => firsts.has(r.topicId) && r.reason === 'Sıradaki konu')).toBe(true);
  });

  it('yarım kalan konu, sıradaki konulardan önce gelir; tamamlanan önerilmez', () => {
    const s = defaultState();
    const [a, b] = subjectTopics(SUBJECTS[0].id);
    const state = {
      ...s,
      topicProgress: { [a.id]: { status: 'tamamlandi' as const, completedAt: '2026-09-28T10:00:00Z' }, [b.id]: { status: 'calisiliyor' as const, startedAt: '2026-09-28T10:00:00Z' } },
    };
    const recs = suggestTopics(state, '2026-09-29', 6);
    expect(recs[0]).toEqual({ topicId: b.id, reason: 'Yarım kaldı' });
    expect(recs.some((r) => r.topicId === a.id)).toBe(false);
  });
});
