import type { Question } from '../domain/types';
import type { ActiveTest, QuestionAttempt, TestConfig } from '../store/schema';
import { calcNet, percent } from './net';
import { shuffle, uid } from './ids';

export const QUESTION_COUNTS = [5, 10, 20, 40] as const;
/** Sınav modunda soru başına süre (ms). YKS ortalamasına yakın: 1,5 dk. */
export const EXAM_MS_PER_QUESTION = 90_000;

export function filterPool(questions: Question[], config: TestConfig): Question[] {
  return questions.filter(
    (q) =>
      (config.exam === 'all' || q.exam === config.exam) &&
      (config.subjectId === 'all' || q.subject === config.subjectId) &&
      (config.topicId === 'all' || q.topic === config.topicId) &&
      (config.subtopicId === 'all' || q.subtopic === config.subtopicId) &&
      (config.difficulty === 'all' || q.difficulty === config.difficulty) &&
      (config.type === 'all' || q.type === config.type),
  );
}

/**
 * Havuzdan soru seçer. Önce hiç çözülmemiş sorular, sonra en uzun süredir
 * görülmeyenler tercih edilir; aynı grup içinde karıştırılır.
 */
export function pickQuestions(
  pool: Question[],
  count: number,
  attempts: Pick<QuestionAttempt, 'questionId' | 'at'>[],
  random: () => number = Math.random,
): string[] {
  const lastSeen = new Map<string, string>();
  for (const a of attempts) {
    const prev = lastSeen.get(a.questionId);
    if (!prev || prev < a.at) lastSeen.set(a.questionId, a.at);
  }
  const unseen = shuffle(pool.filter((q) => !lastSeen.has(q.id)), random);
  const seen = shuffle(pool.filter((q) => lastSeen.has(q.id)), random).sort((a, b) =>
    (lastSeen.get(a.id) ?? '').localeCompare(lastSeen.get(b.id) ?? ''),
  );
  return [...unseen, ...seen].slice(0, Math.max(0, count)).map((q) => q.id);
}

export function createActiveTest(config: TestConfig, questionIds: string[], now: Date = new Date()): ActiveTest {
  const timeLimitMs = config.mode === 'sinav' ? (config.durationMin ? config.durationMin * 60_000 : questionIds.length * EXAM_MS_PER_QUESTION) : null;
  return {
    id: uid('test'),
    config,
    questionIds,
    answers: {},
    marked: {},
    revealed: {},
    timeSpent: {},
    current: 0,
    startedAt: now.toISOString(),
    timeLimitMs,
    deadlineAt: timeLimitMs != null ? now.getTime() + timeLimitMs : null,
    elapsedMs: 0,
  };
}

export type AnswerState = 'dogru' | 'yanlis' | 'bos';

export interface ScoredItem {
  questionId: string;
  answer: number | null;
  state: AnswerState;
  timeMs: number;
  marked: boolean;
}

export interface TestScore {
  items: ScoredItem[];
  correct: number;
  wrong: number;
  blank: number;
  net: number;
  accuracy: number | null;
  durationMs: number;
  avgMsPerQuestion: number;
}

export function scoreTest(
  test: Pick<ActiveTest, 'questionIds' | 'answers' | 'marked' | 'timeSpent' | 'elapsedMs'>,
  byId: Map<string, Question>,
): TestScore {
  const items: ScoredItem[] = test.questionIds.map((id) => {
    const q = byId.get(id);
    const answer = test.answers[id] ?? null;
    const state: AnswerState = answer == null ? 'bos' : q && answer === q.correctAnswer ? 'dogru' : 'yanlis';
    return { questionId: id, answer, state, timeMs: test.timeSpent[id] ?? 0, marked: !!test.marked[id] };
  });
  const correct = items.filter((i) => i.state === 'dogru').length;
  const wrong = items.filter((i) => i.state === 'yanlis').length;
  const blank = items.filter((i) => i.state === 'bos').length;
  const durationMs = Math.max(test.elapsedMs, items.reduce((s, i) => s + i.timeMs, 0));
  return {
    items,
    correct,
    wrong,
    blank,
    net: calcNet(correct, wrong),
    accuracy: percent(correct, correct + wrong),
    durationMs,
    avgMsPerQuestion: items.length ? Math.round(durationMs / items.length) : 0,
  };
}

export interface BreakdownRow {
  key: string;
  total: number;
  correct: number;
  wrong: number;
  blank: number;
  success: number | null; // doğru / toplam
}

export function breakdown(
  items: ScoredItem[],
  byId: Map<string, Question>,
  keyOf: (q: Question) => string,
): BreakdownRow[] {
  const map = new Map<string, BreakdownRow>();
  for (const item of items) {
    const q = byId.get(item.questionId);
    if (!q) continue;
    const key = keyOf(q);
    const row = map.get(key) ?? { key, total: 0, correct: 0, wrong: 0, blank: 0, success: null };
    map.set(key, {
      ...row,
      total: row.total + 1,
      correct: row.correct + (item.state === 'dogru' ? 1 : 0),
      wrong: row.wrong + (item.state === 'yanlis' ? 1 : 0),
      blank: row.blank + (item.state === 'bos' ? 1 : 0),
    });
  }
  return [...map.values()].map((r) => ({ ...r, success: percent(r.correct, r.total) }));
}

export function answeredCount(test: Pick<ActiveTest, 'questionIds' | 'answers'>): number {
  return test.questionIds.filter((id) => test.answers[id] != null).length;
}

export function remainingMs(test: Pick<ActiveTest, 'timeLimitMs' | 'elapsedMs'>): number | null {
  return test.timeLimitMs == null ? null : Math.max(0, test.timeLimitMs - test.elapsedMs);
}

/** Aynı konudan (yoksa aynı dersten), testte olmayan benzer bir soru seçer. */
export function findSimilar(q: Question, all: Question[], exclude: Set<string>, random: () => number = Math.random): Question | null {
  const sameTopic = all.filter((x) => x.topic === q.topic && !exclude.has(x.id));
  const pool = sameTopic.length ? sameTopic : all.filter((x) => x.subject === q.subject && !exclude.has(x.id));
  if (!pool.length) return null;
  const sameLevel = pool.filter((x) => x.difficulty === q.difficulty);
  const list = sameLevel.length ? sameLevel : pool;
  return list[Math.floor(random() * list.length)] ?? null;
}
