import type { SubjectId } from '../domain/types';
import type { AppState, QuestionAttempt, StudySession } from '../store/schema';
import { addDays, dayKey, lastNDays, startOfWeek, type DayKey } from './date';
import { mockNet, sortMocks } from './mock';
import { percent } from './net';

/**
 * İstatistikler yalnız gerçek kayıtlardan hesaplanır. Günlük değerler
 * yalnız o günün (yerel saat) kayıtlarını sayar; toplamlar ayrıdır.
 */

export function attemptsOn(attempts: QuestionAttempt[], day: DayKey): QuestionAttempt[] {
  return attempts.filter((a) => a.day === day);
}

/** Çözülen soru: boş bırakılmayan (cevap işaretlenmiş) deneme. */
export function solved(attempts: QuestionAttempt[]): QuestionAttempt[] {
  return attempts.filter((a) => a.answer != null);
}

export function attemptsBetween(attempts: QuestionAttempt[], from: DayKey, to: DayKey): QuestionAttempt[] {
  return attempts.filter((a) => a.day >= from && a.day <= to);
}

export function minutesOn(log: StudySession[], day: DayKey): number {
  return log.filter((s) => s.day === day).reduce((sum, s) => sum + s.minutes, 0);
}

export function minutesBetween(log: StudySession[], from: DayKey, to: DayKey): number {
  return log.filter((s) => s.day >= from && s.day <= to).reduce((sum, s) => sum + s.minutes, 0);
}

export interface AccuracySummary {
  answered: number; // boş hariç
  correct: number;
  wrong: number;
  blank: number;
  total: number;
  accuracy: number | null; // doğru / cevaplanan
}

export function summarize(attempts: QuestionAttempt[]): AccuracySummary {
  let correct = 0;
  let wrong = 0;
  let blank = 0;
  for (const a of attempts) {
    if (a.answer == null) blank++;
    else if (a.correct) correct++;
    else wrong++;
  }
  const answered = correct + wrong;
  return { answered, correct, wrong, blank, total: attempts.length, accuracy: percent(correct, answered) };
}

/** Aktif gün: soru çözülmüş ya da çalışma süresi kaydedilmiş gün. */
export function activeDays(state: Pick<AppState, 'attempts' | 'studyLog'>): Set<DayKey> {
  const days = new Set<DayKey>();
  state.attempts.forEach((a) => days.add(a.day));
  state.studyLog.forEach((s) => s.minutes > 0 && days.add(s.day));
  return days;
}

/** Seri: bugünden (bugün boşsa dünden) geriye doğru kesintisiz aktif gün sayısı. */
export function streak(state: Pick<AppState, 'attempts' | 'studyLog'>, today: DayKey = dayKey()): number {
  const days = activeDays(state);
  let cursor = days.has(today) ? today : addDays(today, -1);
  let count = 0;
  while (days.has(cursor)) {
    count++;
    cursor = addDays(cursor, -1);
  }
  return count;
}

export interface DayPoint {
  day: DayKey;
  questions: number;
  correct: number;
  minutes: number;
}

export function dailySeries(state: Pick<AppState, 'attempts' | 'studyLog'>, n: number, today: DayKey = dayKey()): DayPoint[] {
  return lastNDays(n, today).map((day) => {
    const list = solved(attemptsOn(state.attempts, day));
    return {
      day,
      questions: list.length,
      correct: list.filter((a) => a.correct).length,
      minutes: minutesOn(state.studyLog, day),
    };
  });
}

export interface Dashboard {
  todayQuestions: number;
  weekQuestions: number;
  totalQuestions: number;
  todayMinutes: number;
  weekMinutes: number;
  totalMinutes: number;
  completedTopics: number;
  accuracy: number | null;
  streak: number;
  mockCount: number;
  lastMockNet: number | null;
  lastMockExam: string | null;
}

export function dashboard(state: AppState, today: DayKey = dayKey()): Dashboard {
  const weekStart = startOfWeek(today);
  const legacy = state.legacy ?? { answered: 0, correct: 0, minutes: 0 };
  const all = summarize(state.attempts);
  const answered = all.answered + legacy.answered;
  const correct = all.correct + legacy.correct;
  const sorted = sortMocks(state.mocks);
  const last = sorted[sorted.length - 1];
  return {
    todayQuestions: solved(attemptsOn(state.attempts, today)).length,
    weekQuestions: solved(attemptsBetween(state.attempts, weekStart, today)).length,
    totalQuestions: solved(state.attempts).length + legacy.answered,
    todayMinutes: minutesOn(state.studyLog, today),
    weekMinutes: minutesBetween(state.studyLog, weekStart, today),
    totalMinutes: state.studyLog.reduce((s, x) => s + x.minutes, 0) + legacy.minutes,
    completedTopics: Object.values(state.topicProgress).filter((p) => p.status === 'tamamlandi').length,
    accuracy: percent(correct, answered),
    streak: streak(state, today),
    mockCount: state.mocks.length,
    lastMockNet: last ? mockNet(last) : null,
    lastMockExam: last ? last.exam : null,
  };
}

export interface TopicPerformance {
  topicId: string;
  subjectId: SubjectId;
  attempts: number;
  correct: number;
  accuracy: number | null;
}

export function topicPerformance(attempts: QuestionAttempt[]): Map<string, TopicPerformance> {
  const map = new Map<string, TopicPerformance>();
  for (const a of attempts) {
    const cur = map.get(a.topicId) ?? { topicId: a.topicId, subjectId: a.subjectId, attempts: 0, correct: 0, accuracy: null };
    const next = { ...cur, attempts: cur.attempts + 1, correct: cur.correct + (a.correct ? 1 : 0) };
    map.set(a.topicId, { ...next, accuracy: percent(next.correct, next.attempts) });
  }
  return map;
}
