import { getSubject, getTopicRef, subjectLabel } from '../data/curriculum';
import type { AppState } from '../store/schema';
import { addDays, dayKey, startOfWeek, type DayKey } from './date';
import { calcNet, round2 } from './net';
import { activeDays, attemptsBetween, minutesBetween, summarize } from './stats';

/** Haftalık karne: yalnız o haftanın gerçek kayıtlarından hesaplanır. */
export interface WeekReport {
  from: DayKey;
  to: DayKey;
  questions: number;
  accuracy: number | null;
  minutes: number;
  activeDays: DayKey[];
  tests: number;
  completedTopics: number;
  mockAvgNet: number | null;
  bestSubject: string | null;
  weakTopic: string | null;
}

export function weekReport(state: AppState, weekStart: DayKey): WeekReport {
  const from = weekStart;
  const to = addDays(weekStart, 6);
  const atts = attemptsBetween(state.attempts, from, to);
  const sum = summarize(atts);
  const days = [...activeDays(state)].filter((d) => d >= from && d <= to).sort();
  const inWeek = (iso?: string) => !!iso && iso.slice(0, 10) >= from && iso.slice(0, 10) <= to;

  const bySubject = new Map<string, { n: number; c: number }>();
  const byTopic = new Map<string, { n: number; w: number }>();
  for (const a of atts) {
    if (a.answer == null) continue;
    const s = bySubject.get(a.subjectId) ?? { n: 0, c: 0 };
    bySubject.set(a.subjectId, { n: s.n + 1, c: s.c + (a.correct ? 1 : 0) });
    const t = byTopic.get(a.topicId) ?? { n: 0, w: 0 };
    byTopic.set(a.topicId, { n: t.n + 1, w: t.w + (a.correct ? 0 : 1) });
  }
  const best = [...bySubject.entries()].filter(([, v]) => v.n >= 5).sort((a, b) => b[1].c / b[1].n - a[1].c / a[1].n)[0];
  const weak = [...byTopic.entries()].filter(([, v]) => v.w >= 2).sort((a, b) => b[1].w / b[1].n - a[1].w / a[1].n)[0];
  const mocks = state.mocks.filter((m) => m.date >= from && m.date <= to);
  const mockAvg = mocks.length && new Set(mocks.map(m => m.exam)).size === 1 ? round2(mocks.reduce((n, m) => n + m.sections.reduce((k, s) => k + calcNet(s.correct, s.wrong), 0), 0) / mocks.length) : null;
  const bestSubject = best ? getSubject(best[0]) : undefined;

  return {
    from,
    to,
    questions: sum.answered,
    accuracy: sum.accuracy,
    minutes: minutesBetween(state.studyLog, from, to),
    activeDays: days,
    tests: state.testResults.filter((r) => r.day >= from && r.day <= to).length,
    completedTopics: Object.values(state.topicProgress).filter((p) => p.status === 'tamamlandi' && inWeek(p.completedAt)).length,
    mockAvgNet: mockAvg,
    bestSubject: bestSubject ? subjectLabel(bestSubject) : null,
    weakTopic: weak ? getTopicRef(weak[0])?.topic.name ?? null : null,
  };
}

export function thisWeekStart(today: DayKey = dayKey()): DayKey {
  return startOfWeek(today);
}

export function weekVerdict(r: WeekReport): { emoji: string; text: string } {
  const d = r.activeDays.length;
  if (d >= 6) return { emoji: '🏆', text: 'Efsane bir hafta! Neredeyse her gün çalıştın.' };
  if (d >= 4) return { emoji: '🌟', text: 'Çok iyi bir hafta, düzenin oturuyor.' };
  if (d >= 2) return { emoji: '🌱', text: 'Güzel başlangıç; bir iki gün daha eklersen harika olur.' };
  if (d === 1) return { emoji: '🐣', text: 'Bir adım attın, devamı gelecek ♡' };
  return { emoji: '😴', text: 'Bu hafta henüz kayıt yok. Bugün 10 soruyla başlayabilirsin.' };
}
