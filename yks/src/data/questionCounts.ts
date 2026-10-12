import { QUESTION_INDEX } from './contentIndex.generated';
import { SUBJECTS, getSubject } from './curriculum';

/** Testler ekranı için soru bankasını indirmeden sayım (derleme sırasında üretilen dizinden). */
export interface CountFilter {
  exam: string;
  subjectId: string;
  topicId: string;
  subtopicId: string;
  difficulty: string;
  type: string;
}

export interface PoolSummary {
  total: number;
  byDifficulty: Record<string, number>;
  byType: Record<string, number>;
}

function topicsInScope(f: Pick<CountFilter, 'exam' | 'subjectId' | 'topicId'>): string[] {
  if (f.topicId !== 'all') return [f.topicId];
  const subjects = f.subjectId !== 'all' ? [getSubject(f.subjectId)].filter(Boolean) : SUBJECTS.filter((s) => f.exam === 'all' || s.exam === f.exam);
  return subjects.flatMap((s) => s!.units.flatMap((u) => u.topics.map((t) => t.id)));
}

/**
 * Filtreye uyan soru sayısı ve zorluk/tip dağılımı. Zorluk dağılımı, zorluk filtresi
 * hariç diğer filtrelere göre hesaplanır (zorluk düğmeleri için).
 */
export function summarizePool(f: CountFilter): PoolSummary {
  const byDifficulty: Record<string, number> = {};
  const byType: Record<string, number> = {};
  let total = 0;
  for (const topicId of topicsInScope(f)) {
    const entry = QUESTION_INDEX[topicId];
    if (!entry) continue;
    for (const [key, n] of Object.entries(entry.k)) {
      const [suffix, difficulty, type] = key.split('|');
      const subtopic = suffix ? (suffix.startsWith('-') ? topicId + suffix : suffix) : '';
      if (f.subtopicId !== 'all' && subtopic !== f.subtopicId) continue;
      if (f.type !== 'all' && type !== f.type) continue;
      byDifficulty[difficulty] = (byDifficulty[difficulty] ?? 0) + n;
      if (f.difficulty !== 'all' && difficulty !== f.difficulty) continue;
      byType[type] = (byType[type] ?? 0) + n;
      total += n;
    }
  }
  return { total, byDifficulty, byType };
}

export function topicQuestionCount(topicId: string): number {
  return QUESTION_INDEX[topicId]?.n ?? 0;
}
