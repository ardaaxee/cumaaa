import type { ReviewItem } from '../store/schema';
import { addDays, type DayKey } from './date';

/** Konu tamamlandıktan sonra tekrar aralıkları (gün). */
export const REVIEW_INTERVALS = [1, 3, 7, 14, 30] as const;
export const REVIEW_DONE_STAGE = REVIEW_INTERVALS.length;

/** Konu tamamlandığında ilk tekrarı (1 gün sonra) planlar. */
export function scheduleFirstReview(topicId: string, today: DayKey, existing?: ReviewItem): ReviewItem {
  return {
    topicId,
    stage: 0,
    dueDay: addDays(today, REVIEW_INTERVALS[0]),
    lastReviewedDay: existing?.lastReviewedDay,
    history: existing?.history ?? [],
  };
}

/** Tekrar yapıldığında bir sonraki aşamaya geçer. Son aşamadan sonra konu "kalıcı" sayılır. */
export function completeReview(item: ReviewItem, today: DayKey): ReviewItem {
  const stage = Math.min(item.stage + 1, REVIEW_DONE_STAGE);
  const dueDay = stage < REVIEW_DONE_STAGE ? addDays(today, REVIEW_INTERVALS[stage]) : item.dueDay;
  return { ...item, stage, dueDay, lastReviewedDay: today, history: [...item.history, today] };
}

/**
 * Konudan yanlış yapıldığında tekrar sıklığını artırır:
 * aşama bir geri alınır ve tekrar en geç yarına çekilir.
 */
export function onWrongInTopic(topicId: string, today: DayKey, existing?: ReviewItem): ReviewItem {
  const tomorrow = addDays(today, 1);
  if (!existing) {
    return { topicId, stage: 0, dueDay: tomorrow, history: [] };
  }
  const stage = Math.max(0, Math.min(existing.stage, REVIEW_DONE_STAGE) - 1);
  const dueDay = existing.stage >= REVIEW_DONE_STAGE || existing.dueDay > tomorrow ? tomorrow : existing.dueDay;
  return { ...existing, stage, dueDay };
}

export function isDue(item: ReviewItem, today: DayKey): boolean {
  return item.stage < REVIEW_DONE_STAGE && item.dueDay <= today;
}

export function dueReviews(reviews: Record<string, ReviewItem>, today: DayKey): ReviewItem[] {
  return Object.values(reviews)
    .filter((r) => isDue(r, today))
    .sort((a, b) => a.dueDay.localeCompare(b.dueDay));
}

export function upcomingReviews(reviews: Record<string, ReviewItem>, today: DayKey, days = 7): ReviewItem[] {
  const limit = addDays(today, days);
  return Object.values(reviews)
    .filter((r) => r.stage < REVIEW_DONE_STAGE && r.dueDay > today && r.dueDay <= limit)
    .sort((a, b) => a.dueDay.localeCompare(b.dueDay));
}

export function stageLabel(stage: number): string {
  if (stage >= REVIEW_DONE_STAGE) return 'Kalıcı';
  return `${stage + 1}. tekrar (${REVIEW_INTERVALS[stage]} gün)`;
}
