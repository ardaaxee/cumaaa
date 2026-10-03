import { getTopicRef, subjectTopics } from '../data/curriculum';
import { loadSubjectLessons } from '../data/content';
import type { LessonSeed } from '../domain/types';
import type { CardState } from '../store/schema';
import type { DayKey } from '../utils/date';

/**
 * Bilgi kartları konu anlatımlarındaki gerçek içerikten üretilir:
 * her kavram (terim → tanım) ve her formül (bağıntı → anlamı) bir karttır.
 */
export interface StudyCard {
  id: string;
  topicId: string;
  topicName: string;
  kind: 'kavram' | 'formul';
  front: string;
  back: string;
}

export function cardsFromLesson(topicId: string, lesson: LessonSeed): StudyCard[] {
  const topicName = getTopicRef(topicId)?.topic.name ?? topicId;
  return [
    ...lesson.concepts.map((c, i) => ({ id: `${topicId}:k${i}`, topicId, topicName, kind: 'kavram' as const, front: c.term, back: c.definition })),
    ...lesson.formulas.map((f, i) => ({ id: `${topicId}:f${i}`, topicId, topicName, kind: 'formul' as const, front: f.expr, back: f.meaning })),
  ];
}

/** Dersin tüm kartları, müfredat sırasıyla. */
export async function loadSubjectCards(subjectId: string): Promise<StudyCard[]> {
  const lessons = await loadSubjectLessons(subjectId);
  return subjectTopics(subjectId).flatMap((t) => {
    const l = lessons.get(t.id);
    return l ? cardsFromLesson(t.id, l) : [];
  });
}

export interface CardDeckStats {
  total: number;
  due: number;
  fresh: number;
  learned: number;
}

export function deckStats(cards: StudyCard[], states: Record<string, CardState>, today: DayKey): CardDeckStats {
  let due = 0;
  let fresh = 0;
  let learned = 0;
  for (const c of cards) {
    const s = states[c.id];
    if (!s) fresh++;
    else {
      if (s.dueDay <= today) due++;
      if (s.box >= 4) learned++;
    }
  }
  return { total: cards.length, due, fresh, learned };
}

/** Oturum sırası: önce vadesi gelenler (en düşük kutu önce), sonra yeni kartlar. */
export function buildSession(cards: StudyCard[], states: Record<string, CardState>, today: DayKey, size = 20): StudyCard[] {
  const due = cards
    .filter((c) => states[c.id] && states[c.id].dueDay <= today)
    .sort((a, b) => states[a.id].box - states[b.id].box || states[a.id].dueDay.localeCompare(states[b.id].dueDay));
  const fresh = cards.filter((c) => !states[c.id]);
  return [...due, ...fresh].slice(0, size);
}
