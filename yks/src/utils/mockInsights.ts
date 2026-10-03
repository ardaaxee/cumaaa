import type { MockExam } from '../store/schema';
import { MOCK_SECTIONS, mockNet, sectionNet, sortMocks } from './mock';
import { round2 } from './net';

/** Only compare results with the same recorded test sections. */
export function mockInsights(selected: MockExam, mocks: MockExam[]) {
  const signature = (m: MockExam) => m.sections.map(s => s.key).sort().join('|');
  const comparable = sortMocks(mocks.filter(m => m.exam === selected.exam && signature(m) === signature(selected)));
  const index = comparable.findIndex(m => m.id === selected.id);
  const previous = index > 0 ? comparable[index - 1] : null;
  const history = index >= 0 ? comparable.slice(Math.max(0, index - 4), index + 1) : [selected];
  const average = round2(history.reduce((n, m) => n + mockNet(m), 0) / history.length);
  const sections = selected.sections.flatMap(s => {
    const def = MOCK_SECTIONS[selected.exam].find(d => d.key === s.key);
    if (!def) return [];
    const net = sectionNet(s);
    const prior = previous?.sections.find(p => p.key === s.key);
    return [{ ...s, label: def.label, questions: def.questions, net,
      ratio: net / def.questions, delta: prior ? round2(net - sectionNet(prior)) : null }];
  });
  const priority = [...sections].sort((a, b) => a.ratio - b.ratio)[0] ?? null;
  return { previous, history, average, delta: previous ? round2(mockNet(selected) - mockNet(previous)) : null, sections, priority };
}

export function mockSubjectLinks(exam: MockExam['exam'], key: string) {
  const groups: Record<string, string[]> = exam === 'TYT'
    ? { turkce: ['turkce'], matematik: ['matematik', 'geometri'], sosyal: ['tarih', 'cografya', 'felsefe', 'din'], fen: ['fizik', 'kimya', 'biyoloji'] }
    : { matematik: ['matematik', 'geometri'], fizik: ['fizik'], kimya: ['kimya'], biyoloji: ['biyoloji'] };
  return (groups[key] ?? []).map(id => `${exam.toLowerCase()}-${id}`);
}

export function mockTargetStatus(net: number, target: number | null, exam: MockExam['exam']) {
  const maximum = exam === 'TYT' ? 120 : 80;
  if (target === null || !Number.isFinite(target) || target < 0 || target > maximum) return null;
  return { target, gap: round2(Math.max(0, target - net)), reached: net >= target,
    progress: target === 0 ? (net >= 0 ? 100 : 0) : Math.round(Math.max(0, Math.min(100, net / target * 100))) };
}
