import type { SubjectId } from '../domain/types';
import type { AppState, QuestionAttempt } from '../store/schema';
import { percent } from './net';

/** Aynı konuda en az bu kadar farklı soruda çözülmemiş yanlış → zayıf konu. */
export const WEAK_WRONG_THRESHOLD = 2;
/** En az bu kadar deneme ve doğruluk bu yüzdenin altındaysa → zayıf konu. */
export const WEAK_MIN_ATTEMPTS = 5;
export const WEAK_ACCURACY = 50;

export interface WeakTopic {
  topicId: string;
  subjectId: SubjectId;
  openWrongs: number;
  attempts: number;
  accuracy: number | null;
  reasons: string[];
}

export function weakTopics(state: Pick<AppState, 'wrongs' | 'attempts'>): WeakTopic[] {
  const map = new Map<string, WeakTopic>();
  const get = (topicId: string, subjectId: SubjectId) => {
    const cur = map.get(topicId) ?? { topicId, subjectId, openWrongs: 0, attempts: 0, accuracy: null, reasons: [] };
    map.set(topicId, cur);
    return cur;
  };
  const correctBy = new Map<string, number>();
  for (const a of state.attempts) {
    const t = get(a.topicId, a.subjectId);
    t.attempts++;
    if (a.correct) correctBy.set(a.topicId, (correctBy.get(a.topicId) ?? 0) + 1);
  }
  for (const w of Object.values(state.wrongs)) {
    if (!w.learned) get(w.topicId, w.subjectId).openWrongs++;
  }
  const out: WeakTopic[] = [];
  for (const t of map.values()) {
    const accuracy = percent(correctBy.get(t.topicId) ?? 0, t.attempts);
    const reasons: string[] = [];
    if (t.openWrongs >= WEAK_WRONG_THRESHOLD) reasons.push(`${t.openWrongs} soruda tekrarlayan yanlış`);
    if (t.attempts >= WEAK_MIN_ATTEMPTS && accuracy != null && accuracy < WEAK_ACCURACY) reasons.push(`doğruluk %${accuracy}`);
    if (reasons.length) out.push({ ...t, accuracy, reasons });
  }
  return out.sort((a, b) => b.openWrongs - a.openWrongs || (a.accuracy ?? 100) - (b.accuracy ?? 100));
}

export function isWeakTopic(state: Pick<AppState, 'wrongs' | 'attempts'>, topicId: string): boolean {
  return weakTopics(state).some((w) => w.topicId === topicId);
}

/** Bir konunun son n test oturumundaki performansı (yalnız o konudaki sorular). */
export function recentTopicPerformance(
  attempts: QuestionAttempt[],
  topicId: string,
  sessions = 3,
): { sessions: number; total: number; correct: number; accuracy: number | null } {
  const topicAttempts = attempts.filter((a) => a.topicId === topicId);
  const order: string[] = [];
  for (let i = topicAttempts.length - 1; i >= 0 && order.length < sessions; i--) {
    const s = topicAttempts[i].sessionId;
    if (!order.includes(s)) order.push(s);
  }
  const list = topicAttempts.filter((a) => order.includes(a.sessionId));
  const correct = list.filter((a) => a.correct).length;
  return { sessions: order.length, total: list.length, correct, accuracy: percent(correct, list.length) };
}
