import type { AppState } from '../store/schema';
import { getTopicRef } from '../data/curriculum';
import { addDays, type DayKey } from './date';
import { MOCK_SECTIONS, mockNet } from './mock';
import { sanitizeMockLearning } from './mockLearning';
import { round2 } from './net';

export function weeklyMockLearning(state: AppState, from: DayKey) {
  const to = addDays(from, 6);
  const previous = addDays(from, -7);
  const exams = (['TYT', 'AYT'] as const).map(exam => {
    const valid = state.mocks.filter(m => m.exam === exam && MOCK_SECTIONS[exam].every(d => m.sections.some(s => s.key === d.key)));
    const current = valid.filter(m => m.date >= from && m.date <= to);
    const prior = valid.filter(m => m.date >= previous && m.date < from);
    const avg = (list: typeof valid) => list.length ? round2(list.reduce((n, m) => n + mockNet(m), 0) / list.length) : null;
    const average = avg(current), priorAverage = avg(prior);
    return { exam, count: current.length, average, delta: average !== null && priorAverage !== null ? round2(average - priorAverage) : null };
  });
  const counts = new Map<string, number>();
  for (const m of state.mocks.filter(m => m.date <= to)) {
    for (const issue of sanitizeMockLearning(m.learning, m).issues.filter(i => !i.reviewed && i.topicId)) counts.set(issue.topicId, (counts.get(issue.topicId) ?? 0) + 1);
  }
  const priorities = [...counts.entries()].sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 3).flatMap(([id, count]) => {
    const ref = getTopicRef(id);
    return ref ? [{ id, name: ref.topic.name, count }] : [];
  });
  return { exams, priorities };
}
