import { getTopicRef } from '../data/curriculum';
import type { AppState, MockExam, MockIssue, MockIssueReason, MockLearning } from '../store/schema';
import { addTask } from '../store/actions';
import { addDays, type DayKey } from './date';
import { onWrongInTopic } from './srs';
import { mockSubjectLinks } from './mockInsights';
import { MOCK_SECTIONS } from './mock';
export const MOCK_REASONS: Record<MockIssueReason, { label: string; action: string }> = {
  konu: { label: 'Konu eksiği', action: 'Kısa anlatımı ve çözümlü örnekleri çalış; ardından pekiştirme sorularını çöz.' },
  islem: { label: 'İşlem hatası', action: 'Çözümü defterde adım adım yeniden yaz. İşaret, birim ve ara işlemleri kontrol et.' },
  dikkat: { label: 'Dikkat / okuma', action: 'Soru kökündeki koşulları işaretle. Seçeneği işaretlemeden önce isteneni tekrar oku.' },
  sure: { label: 'Süre yetersizliği', action: 'Önce süre tutmadan çöz; ardından aynı konudan kısa bir süreli test uygula.' },
};

export function sanitizeMockLearning(raw: unknown, mock: Pick<MockExam, 'exam' | 'sections'>): MockLearning {
  const obj = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const sections = Array.isArray(mock.sections) ? mock.sections.filter(s => s && typeof s.key === 'string') : [];
  const sectionMinutes: Record<string, number> = {};
  let totalMinutes = 0;
  if (obj.sectionMinutes && typeof obj.sectionMinutes === 'object') {
    for (const [key, value] of Object.entries(obj.sectionMinutes)) {
      if (sections.some(s => s.key === key) && typeof value === 'number' && Number.isFinite(value) && value > 0 && totalMinutes + value <= (mock.exam === 'TYT' ? 165 : 180)) { sectionMinutes[key] = value; totalMinutes += value; }
    }
  }
  const seen = new Set<string>();
  const issues: MockIssue[] = [];
  for (const entry of Array.isArray(obj.issues) ? obj.issues.slice(0, 120) : []) {
    if (!entry || typeof entry !== 'object') continue;
    const e = entry as MockIssue;
    const section = MOCK_SECTIONS[mock.exam]?.find(s => s.key === e.sectionKey);
    if (!section || !sections.some(s => s.key === e.sectionKey) || !Number.isInteger(e.question) || e.question < 1 || e.question > section.questions || !['yanlis', 'bos'].includes(e.kind) || !Object.hasOwn(MOCK_REASONS, e.reason)) continue;
    const recorded = sections.find(s => s.key === e.sectionKey)!;
    if (issues.filter(i => i.sectionKey === e.sectionKey && i.kind === e.kind).length >= (e.kind === 'yanlis' ? recorded.wrong : recorded.blank)) continue;
    const signature = `${e.sectionKey}:${e.question}`;
    if (seen.has(signature)) continue;
    const topic = typeof e.topicId === 'string' ? getTopicRef(e.topicId) : undefined;
    const topicId = topic && mockSubjectLinks(mock.exam, e.sectionKey).includes(topic.subject.id) ? e.topicId : '';
    seen.add(signature);
    issues.push({ id: typeof e.id === 'string' ? e.id.slice(0, 80) : signature, sectionKey: e.sectionKey, question: e.question, kind: e.kind, reason: e.reason, topicId, note: typeof e.note === 'string' ? e.note.slice(0, 400) : '', reviewed: e.reviewed === true });
  }
  return { issues, sectionMinutes };
}

/** Turn explicitly identified weak topics into tasks; repeated clicks never duplicate them. */
export function planMockLearning(state: AppState, mockId: string, today: DayKey): AppState {
  const mock = state.mocks.find(m => m.id === mockId);
  if (!mock) return state;
  const learning = sanitizeMockLearning(mock.learning, mock);
  const topics = [...new Set(learning.issues.filter(i => !i.reviewed && i.topicId).map(i => i.topicId))].slice(0, 3);
  let next = state;
  for (const [index, id] of topics.entries()) {
    const ref = getTopicRef(id)!;
    const date = addDays(today, index);
    const reasons = learning.issues.filter(i => !i.reviewed && i.topicId === id).map(i => i.reason);
    const practice = reasons.includes('sure') ? 'süreli pekiştirme' : reasons.includes('islem') ? 'işlem kontrolü ve pekiştirme' : reasons.includes('dikkat') ? 'okuma kontrolü ve pekiştirme' : 'pekiştirme';
    const specs = [
      { type: 'konu' as const, date, title: `${ref.topic.name} · anlatım ve çözümlü örnek`, estMinutes: 25 },
      { type: 'test' as const, date, title: `${ref.topic.name} · ${practice}`, targetQuestions: 10, estMinutes: 20 },
      { type: 'tekrar' as const, date: addDays(date, 3), title: `${ref.topic.name} · tekrar ölç`, targetQuestions: 5, estMinutes: 10 },
    ];
    const before = next.tasks.length;
    for (const spec of specs) {
      if (!next.tasks.some(t => t.sourceMockId === mock.id && t.topicId === id && t.type === spec.type)) next = addTask(next, { ...spec, sourceMockId: mock.id, subjectId: ref.subject.id, topicId: id });
    }
    if (next.tasks.length > before) next = { ...next, reviews: { ...next.reviews, [id]: onWrongInTopic(id, today, next.reviews[id]) } };
  }
  return next;
}

export function mockPace(mock: MockExam) {
  const learning = sanitizeMockLearning(mock.learning, mock);
  return mock.sections.flatMap(s => {
    const minutes = learning.sectionMinutes[s.key];
    if (!minutes) return [];
    const attempted = s.correct + s.wrong;
    return [{ key: s.key, minutes, attempted, blanks: s.blank, secondsPerAttempt: attempted ? Math.round(minutes * 60 / attempted) : null,
      timeBlanks: learning.issues.filter(i => i.sectionKey === s.key && i.kind === 'bos' && i.reason === 'sure').length }];
  });
}
