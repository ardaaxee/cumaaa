import type { Question } from '../domain/types';
import type { QuestionAttempt } from '../store/schema';
import { pickQuestions } from './testEngine';

/** Aynı alt konu öncelikli; asıl soru ve tekrar eden kimlikler dışarıda kalır. */
export function recoveryQuestions(source: Question, pool: Question[], attempts: Pick<QuestionAttempt, 'questionId' | 'at'>[], random = Math.random): Question[] {
  const unique = new Map(pool.filter(q => q.topic === source.topic && q.id !== source.id).map(q => [q.id, q]));
  const candidates = [...unique.values()];
  const same = candidates.filter(q => source.subtopic && q.subtopic === source.subtopic);
  const other = candidates.filter(q => !same.includes(q));
  const ids = [...pickQuestions(same, 3, attempts, random)];
  ids.push(...pickQuestions(other, 3 - ids.length, attempts, random));
  return ids.map(id => unique.get(id)!);
}
