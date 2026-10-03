import { SUBJECTS, subjectTopics } from '../data/curriculum';
import type { AppState } from '../store/schema';
import { weakTopics } from './analysis';
import { dayKey, type DayKey } from './date';
import { dueReviews } from './srs';

export interface StudySuggestion {
  topicId: string;
  reason: string;
}

/**
 * "Ders çalış" için önerilen konular, gerçek veriye göre sıralı:
 * tekrar günü gelenler → zayıf konular → yarım kalanlar → her dersin sıradaki başlanmamış konusu.
 */
export function suggestTopics(state: AppState, today: DayKey = dayKey(), limit = 4): StudySuggestion[] {
  const out: StudySuggestion[] = [];
  const seen = new Set<string>();
  const add = (topicId: string, reason: string) => {
    if (seen.has(topicId) || out.length >= limit) return;
    seen.add(topicId);
    out.push({ topicId, reason });
  };

  for (const r of dueReviews(state.reviews, today)) add(r.topicId, 'Bugün tekrar günü');
  for (const w of weakTopics(state)) add(w.topicId, 'Zayıf konu');
  const inProgress = Object.entries(state.topicProgress)
    .filter(([, p]) => p.status === 'calisiliyor')
    .sort(([, a], [, b]) => (b.startedAt ?? '').localeCompare(a.startedAt ?? ''));
  for (const [topicId] of inProgress) add(topicId, 'Yarım kaldı');

  // En az çalışılan derslerden başlayarak her dersin sıradaki konusu.
  const touched = (subjectId: string) => subjectTopics(subjectId).filter((t) => state.topicProgress[t.id]).length;
  const bySubject = [...SUBJECTS].sort((a, b) => touched(a.id) - touched(b.id) || a.id.localeCompare(b.id));
  for (const s of bySubject) {
    const next = subjectTopics(s.id).find((t) => (state.topicProgress[t.id]?.status ?? 'baslanmadi') === 'baslanmadi');
    if (next) add(next.id, 'Sıradaki konu');
  }
  return out;
}
