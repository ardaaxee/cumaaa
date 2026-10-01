import { describe, expect, it } from 'vitest';
import { lookup } from '../src/services/lookup';
import { whatToStudyToday } from '../src/services/recommendations';
import { defaultState, type AppState, type QuestionAttempt } from '../src/store/schema';
import { allTopics } from '../src/data/curriculum';

const topic = allTopics()[3].topic.id;
const subject = allTopics()[3].subject.id;

function attempts(n: number, correct: number, day: string): QuestionAttempt[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `a${day}${i}`, questionId: `${topic}-q${i}`, topicId: topic, subjectId: subject, difficulty: 'orta',
    answer: 0, correct: i < correct, timeMs: 30000, at: `${day}T10:00:00Z`, day, sessionId: `s${day}`,
  })) as QuestionAttempt[];
}

describe('Bugün ne çalışayım?', () => {
  it('en fazla 3 öneri verir ve her birinin gerekçesi vardır', () => {
    const s: AppState = { ...defaultState(), attempts: attempts(10, 4, '2026-09-29'), profile: { ...defaultState().profile, hardestSubject: subject } };
    const recs = whatToStudyToday(s, lookup, '2026-10-01');
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.length).toBeLessThanOrEqual(3);
    for (const r of recs) expect(r.basis.length).toBeGreaterThan(3);
    expect(recs[0].basis).toMatch(/Son 10 soruda %40/);
  });

  it('7 gündür dokunulmayan konu "X gündür tekrar edilmedi" gerekçesiyle önerilir', () => {
    const base = defaultState();
    const s: AppState = {
      ...base,
      attempts: attempts(5, 5, '2026-09-20'),
      topicProgress: { [topic]: { status: 'calisiliyor', startedAt: '2026-09-20T10:00:00Z' } },
    };
    const recs = whatToStudyToday(s, lookup, '2026-10-01');
    expect(recs.some((r) => r.basis.startsWith('11 gündür tekrar edilmedi'))).toBe(true);
  });

  it('sınava az kaldıysa gerekçeye eklenir', () => {
    const base = defaultState();
    const s: AppState = { ...base, attempts: attempts(10, 3, '2026-09-30'), profile: { ...base.profile, examDate: '2026-11-10' } };
    expect(whatToStudyToday(s, lookup, '2026-10-01')[0].basis).toContain('sınava 40 gün');
  });
});
