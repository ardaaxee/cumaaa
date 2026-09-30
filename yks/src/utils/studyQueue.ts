import type { AppState } from '../store/schema';
import { getTopicRef } from '../data/curriculum';
import { dueReviews } from './srs';
import type { DayKey } from './date';
export function studyQueue(state: AppState, today: DayKey) {
  const continuing = Object.entries(state.topicProgress)
    .filter(([id, progress]) => progress.status === 'calisiliyor' && getTopicRef(id))
    .sort((a, b) => (b[1].startedAt ?? '').localeCompare(a[1].startedAt ?? ''))
    .map(([topicId]) => topicId);
  const groups = new Map<string, { topicId: string; count: number; repeats: number }>();
  for (const wrong of Object.values(state.wrongs)) {
    if (wrong.learned || !getTopicRef(wrong.topicId)) continue;
    const group = groups.get(wrong.topicId) ?? { topicId: wrong.topicId, count: 0, repeats: 0 };
    group.count++;
    group.repeats += wrong.wrongCount;
    groups.set(wrong.topicId, group);
  }
  const mistakes = [...groups.values()].sort((a, b) => b.repeats - a.repeats || b.count - a.count || a.topicId.localeCompare(b.topicId));
  const reviews = dueReviews(state.reviews, today).filter((review) => getTopicRef(review.topicId));
  return { continuing, mistakes, reviews };
}
