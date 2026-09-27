import type { Question, SubjectId } from '../domain/types';
import { dayKey, addDays, type DayKey } from '../utils/date';
import { uid } from '../utils/ids';
import { completeReview, onWrongInTopic, scheduleFirstReview } from '../utils/srs';
import { createActiveTest, scoreTest } from '../utils/testEngine';
import type {
  AppState,
  ChatMessage,
  MockExam,
  PlanTask,
  Profile,
  QuestionAttempt,
  Settings,
  TestConfig,
  TestResult,
  TopicStatus,
  VideoResource,
  WrongEntry,
} from './schema';

/**
 * Saf durum geçişleri: her fonksiyon yeni bir durum nesnesi döndürür,
 * mevcut durumu değiştirmez.
 */

// ---------- Konu ilerlemesi ----------

export function setTopicStatus(state: AppState, topicId: string, status: TopicStatus, now: Date = new Date()): AppState {
  const prev = state.topicProgress[topicId];
  const iso = now.toISOString();
  const next = {
    status,
    startedAt: prev?.startedAt ?? (status !== 'baslanmadi' ? iso : undefined),
    completedAt: status === 'tamamlandi' ? iso : undefined,
  };
  const reviews = { ...state.reviews };
  if (status === 'tamamlandi' && prev?.status !== 'tamamlandi') {
    reviews[topicId] = scheduleFirstReview(topicId, dayKey(now), reviews[topicId]);
  }
  if (status !== 'tamamlandi' && prev?.status === 'tamamlandi') {
    delete reviews[topicId];
  }
  return { ...state, topicProgress: { ...state.topicProgress, [topicId]: next }, reviews };
}

export function markReviewDone(state: AppState, topicId: string, now: Date = new Date()): AppState {
  const item = state.reviews[topicId];
  if (!item) return state;
  return { ...state, reviews: { ...state.reviews, [topicId]: completeReview(item, dayKey(now)) } };
}

// ---------- Test ----------

export function startTest(state: AppState, config: TestConfig, questionIds: string[], now: Date = new Date()): AppState {
  return { ...state, activeTest: createActiveTest(config, questionIds, now) };
}

type ActiveUpdater = (t: NonNullable<AppState['activeTest']>) => NonNullable<AppState['activeTest']>;

function updateActive(state: AppState, fn: ActiveUpdater): AppState {
  return state.activeTest ? { ...state, activeTest: fn(state.activeTest) } : state;
}

export function answerQuestion(state: AppState, questionId: string, answer: number | null): AppState {
  return updateActive(state, (t) => {
    if (t.config.mode === 'ogrenme' && t.revealed[questionId]) return t;
    return { ...t, answers: { ...t.answers, [questionId]: answer } };
  });
}

export function revealQuestion(state: AppState, questionId: string): AppState {
  return updateActive(state, (t) => ({ ...t, revealed: { ...t.revealed, [questionId]: true } }));
}

export function toggleMark(state: AppState, questionId: string): AppState {
  return updateActive(state, (t) => ({ ...t, marked: { ...t.marked, [questionId]: !t.marked[questionId] } }));
}

export function goToQuestion(state: AppState, index: number): AppState {
  return updateActive(state, (t) => ({ ...t, current: Math.max(0, Math.min(t.questionIds.length - 1, index)) }));
}

export function addTimeToQuestion(state: AppState, questionId: string, ms: number): AppState {
  if (ms <= 0) return state;
  return updateActive(state, (t) => ({
    ...t,
    elapsedMs: t.elapsedMs + ms,
    timeSpent: { ...t.timeSpent, [questionId]: (t.timeSpent[questionId] ?? 0) + ms },
  }));
}

export function appendQuestionToTest(state: AppState, questionId: string): AppState {
  return updateActive(state, (t) =>
    t.questionIds.includes(questionId) ? t : { ...t, questionIds: [...t.questionIds, questionId] },
  );
}

export function abandonTest(state: AppState): AppState {
  return { ...state, activeTest: null };
}

function upsertWrong(prev: WrongEntry | undefined, q: Question, answer: number | null, iso: string): WrongEntry {
  return {
    questionId: q.id,
    topicId: q.topic,
    subjectId: q.subject,
    lastAnswer: answer,
    wrongCount: (prev?.wrongCount ?? 0) + 1,
    firstAt: prev?.firstAt ?? iso,
    lastAt: iso,
    correctStreak: 0,
    learned: false,
  };
}

/** Testi bitirir: denemeleri, sonucu, yanlışlar defterini ve tekrar planını günceller. */
export function finishTest(state: AppState, byId: Map<string, Question>, now: Date = new Date()): { state: AppState; result: TestResult | null } {
  const test = state.activeTest;
  if (!test) return { state, result: null };
  const iso = now.toISOString();
  const today = dayKey(now);
  const score = scoreTest(test, byId);

  const attempts: QuestionAttempt[] = [];
  const wrongs = { ...state.wrongs };
  const reviews = { ...state.reviews };
  const topicProgress = { ...state.topicProgress };

  for (const item of score.items) {
    const q = byId.get(item.questionId);
    if (!q) continue;
    attempts.push({
      id: uid('att'),
      questionId: q.id,
      topicId: q.topic,
      subjectId: q.subject,
      difficulty: q.difficulty,
      answer: item.answer,
      correct: item.state === 'dogru',
      timeMs: item.timeMs,
      at: iso,
      day: today,
      sessionId: test.id,
    });
    if (item.state === 'dogru') {
      const prev = wrongs[q.id];
      if (prev) wrongs[q.id] = { ...prev, correctStreak: prev.correctStreak + 1 };
    } else {
      wrongs[q.id] = upsertWrong(wrongs[q.id], q, item.answer, iso);
      if (item.state === 'yanlis') reviews[q.topic] = onWrongInTopic(q.topic, today, reviews[q.topic]);
    }
    if (!topicProgress[q.topic] || topicProgress[q.topic].status === 'baslanmadi') {
      topicProgress[q.topic] = { status: 'calisiliyor', startedAt: iso };
    }
  }

  const result: TestResult = {
    id: test.id,
    config: test.config,
    questionIds: test.questionIds,
    answers: test.answers,
    marked: test.marked,
    timeSpent: test.timeSpent,
    startedAt: test.startedAt,
    finishedAt: iso,
    day: today,
    durationMs: score.durationMs,
    correct: score.correct,
    wrong: score.wrong,
    blank: score.blank,
    net: score.net,
  };

  return {
    state: {
      ...state,
      activeTest: null,
      attempts: [...state.attempts, ...attempts],
      testResults: [...state.testResults, result],
      wrongs,
      reviews,
      topicProgress,
    },
    result,
  };
}

// ---------- Yanlışlar ----------

export function setWrongLearned(state: AppState, questionId: string, learned: boolean, now: Date = new Date()): AppState {
  const prev = state.wrongs[questionId];
  if (!prev) return state;
  return {
    ...state,
    wrongs: { ...state.wrongs, [questionId]: { ...prev, learned, learnedAt: learned ? now.toISOString() : undefined } },
  };
}

export function removeWrong(state: AppState, questionId: string): AppState {
  const wrongs = { ...state.wrongs };
  delete wrongs[questionId];
  return { ...state, wrongs };
}

// ---------- Plan ----------

export type NewTask = Omit<PlanTask, 'id' | 'done' | 'createdAt' | 'doneAt' | 'carriedFrom'>;

export function addTask(state: AppState, input: NewTask, now: Date = new Date()): AppState {
  const task: PlanTask = { ...input, id: uid('task'), done: false, createdAt: now.toISOString() };
  return { ...state, tasks: [...state.tasks, task] };
}

export function updateTask(state: AppState, id: string, patch: Partial<NewTask>): AppState {
  return { ...state, tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) };
}

export function toggleTask(state: AppState, id: string, now: Date = new Date()): AppState {
  return {
    ...state,
    tasks: state.tasks.map((t) =>
      t.id === id ? { ...t, done: !t.done, doneAt: !t.done ? now.toISOString() : undefined } : t,
    ),
  };
}

export function deleteTask(state: AppState, id: string): AppState {
  return { ...state, tasks: state.tasks.filter((t) => t.id !== id) };
}

/** Tamamlanmayan görevi ertesi güne taşır. */
export function carryTask(state: AppState, id: string): AppState {
  return {
    ...state,
    tasks: state.tasks.map((t) =>
      t.id === id && !t.done ? { ...t, carriedFrom: t.carriedFrom ?? t.date, date: addDays(t.date, 1) } : t,
    ),
  };
}

/** Belirtilen günün tamamlanmamış tüm görevlerini ertesi güne taşır. */
export function carryAllUnfinished(state: AppState, day: DayKey): AppState {
  return {
    ...state,
    tasks: state.tasks.map((t) =>
      t.date === day && !t.done ? { ...t, carriedFrom: t.carriedFrom ?? t.date, date: addDays(day, 1) } : t,
    ),
  };
}

// ---------- Denemeler ----------

export function addMock(state: AppState, mock: Omit<MockExam, 'id' | 'createdAt'>, now: Date = new Date()): AppState {
  return { ...state, mocks: [...state.mocks, { ...mock, id: uid('mock'), createdAt: now.toISOString() }] };
}

export function deleteMock(state: AppState, id: string): AppState {
  return { ...state, mocks: state.mocks.filter((m) => m.id !== id) };
}

// ---------- Çalışma süresi ----------

export function addStudyMinutes(
  state: AppState,
  minutes: number,
  source: 'pomodoro' | 'manuel',
  now: Date = new Date(),
  subjectId?: SubjectId,
): AppState {
  const m = Math.round(minutes);
  if (!(m > 0)) return state;
  return {
    ...state,
    studyLog: [...state.studyLog, { id: uid('study'), day: dayKey(now), minutes: m, source, subjectId, at: now.toISOString() }],
  };
}

export function deleteStudySession(state: AppState, id: string): AppState {
  return { ...state, studyLog: state.studyLog.filter((s) => s.id !== id) };
}

// ---------- Videolar ----------

export function addVideo(state: AppState, input: Omit<VideoResource, 'id' | 'createdAt' | 'watched'>, now: Date = new Date()): AppState {
  return { ...state, videos: [...state.videos, { ...input, id: uid('video'), watched: false, createdAt: now.toISOString() }] };
}

export function toggleVideoWatched(state: AppState, id: string): AppState {
  return { ...state, videos: state.videos.map((v) => (v.id === id ? { ...v, watched: !v.watched } : v)) };
}

export function deleteVideo(state: AppState, id: string): AppState {
  return { ...state, videos: state.videos.filter((v) => v.id !== id) };
}

// ---------- Profil / ayarlar ----------

export function updateProfile(state: AppState, patch: Partial<Profile>): AppState {
  return { ...state, profile: { ...state.profile, ...patch } };
}

export function updateSettings(state: AppState, patch: Partial<Settings>): AppState {
  return { ...state, settings: { ...state.settings, ...patch } };
}

// ---------- Öğretmen sohbeti ----------

export const CHAT_LIMIT = 80;

export function addChatMessage(state: AppState, msg: Omit<ChatMessage, 'id' | 'at'>, now: Date = new Date()): AppState {
  const next = [...state.chat, { ...msg, id: uid('msg'), at: now.toISOString() }];
  return { ...state, chat: next.slice(-CHAT_LIMIT) };
}

export function clearChat(state: AppState): AppState {
  return { ...state, chat: [] };
}
