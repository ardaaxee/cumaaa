import type { LessonSeed, Question, QuestionSeed, SubjectId } from '../domain/types';
import { isChunkError } from '../utils/chunkRecovery';
import { SUBJECTS, getTopicRef } from './curriculum';
import {
  QUESTION_FILES_BY_SUBJECT,
  QUESTION_FILES_BY_TOPIC,
} from './questionMetadata.generated';

type LessonModule = { lessons: LessonSeed[] };
type QuestionModule = { questions: QuestionSeed[] };
type Loader<T> = () => Promise<T>;

const lessonModules = import.meta.glob<LessonModule>('./lessons/*.ts');
const questionModules = import.meta.glob<QuestionModule>('./questions/*.ts');

/** İçerik dosyalarının oluşturulma tarihi (soru bankası sürümü). */
export const CONTENT_CREATED_AT = '2026-09-27';
const LOAD_TIMEOUT_MS = 15_000;

function timeoutError(): Error {
  const error = new Error('İçerik paketi zaman aşımına uğradı.');
  error.name = 'ContentTimeoutError';
  return error;
}

async function withTimeout<T>(promise: Promise<T>): Promise<T> {
  let timer = 0;
  const timeout = new Promise<never>((_, reject) => {
    timer = window.setTimeout(() => reject(timeoutError()), LOAD_TIMEOUT_MS);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    window.clearTimeout(timer);
  }
}

/**
 * Mobil bağlantı anlık koptuğunda bir kez yeniden dener.
 * Eski/değişmiş chunk hataları yeniden denenmez; üst katman tek seferlik sürüm
 * yenileme akışını yönetir.
 */
async function withRetry<T>(load: Loader<T>): Promise<T> {
  try {
    return await withTimeout(load());
  } catch (error) {
    if (isChunkError(error)) throw error;
    await new Promise((resolve) => setTimeout(resolve, 500));
    return withTimeout(load());
  }
}

/** Dosya adı dersin kimliğiyle başlar: "./lessons/ayt-fizik-1.ts" → ayt-fizik. */
function loadersFor<T>(modules: Record<string, Loader<T>>, subjectId: string): Loader<T>[] {
  const re = new RegExp(`/${subjectId}(-[^/]*)?\\.ts$`);
  return Object.entries(modules)
    .filter(([path]) => re.test(path))
    .map(([, load]) => load);
}

function questionLoadersFromPaths(paths: readonly string[] | undefined): Loader<QuestionModule>[] {
  if (!paths?.length) return [];
  return paths
    .map((path) => questionModules[path])
    .filter((load): load is Loader<QuestionModule> => typeof load === 'function');
}

function normalizeModules(mods: QuestionModule[]): Question[] {
  return mods
    .flatMap((module) => module.questions)
    .map(normalizeQuestion)
    .filter((question): question is Question => question !== null);
}

export function normalizeQuestion(seed: QuestionSeed): Question | null {
  const ref = getTopicRef(seed.topic);
  if (!ref) return null;
  return {
    ...seed,
    exam: ref.subject.exam,
    subject: ref.subject.id,
    unit: ref.unit.id,
    sourceType: 'ozgun-pratik',
    createdAt: CONTENT_CREATED_AT,
  };
}

const subjectLessonCache = new Map<string, Promise<Map<string, LessonSeed>>>();
const subjectQuestionCache = new Map<string, Promise<Question[]>>();
const topicQuestionCache = new Map<string, Promise<Question[]>>();
let allQuestionCache: Promise<Question[]> | null = null;

/** Yalnız bir dersin konu anlatımlarını yükler (telefonda hızlı açılış için). */
export function loadSubjectLessons(subjectId: SubjectId | string): Promise<Map<string, LessonSeed>> {
  let promise = subjectLessonCache.get(subjectId);
  if (!promise) {
    promise = Promise.all(loadersFor(lessonModules, subjectId).map((load) => withRetry(load))).then((mods) => {
      const map = new Map<string, LessonSeed>();
      for (const mod of mods) for (const lesson of mod.lessons) map.set(lesson.topicId, lesson);
      return map;
    });
    promise.catch(() => subjectLessonCache.delete(subjectId));
    subjectLessonCache.set(subjectId, promise);
  }
  return promise;
}

export async function loadLesson(topicId: string): Promise<LessonSeed | undefined> {
  const ref = getTopicRef(topicId);
  if (!ref) return undefined;
  return (await loadSubjectLessons(ref.subject.id)).get(topicId);
}

/** Yalnız bir dersin soru bankasını yükler. */
export function loadSubjectQuestions(subjectId: SubjectId | string): Promise<Question[]> {
  let promise = subjectQuestionCache.get(subjectId);
  if (!promise) {
    const indexed = questionLoadersFromPaths(QUESTION_FILES_BY_SUBJECT[subjectId]);
    const loaders = indexed.length ? indexed : loadersFor(questionModules, subjectId);
    promise = Promise.all(loaders.map((load) => withRetry(load))).then(normalizeModules);
    promise.catch(() => subjectQuestionCache.delete(subjectId));
    subjectQuestionCache.set(subjectId, promise);
  }
  return promise;
}

/**
 * Konu sayfası için yalnız o konuyu içeren soru dosyalarını yükler.
 * Böylece tek bir konu açmak bütün dersin soru bankasını indirmez.
 */
export function loadTopicQuestions(topicId: string): Promise<Question[]> {
  const ref = getTopicRef(topicId);
  if (!ref) return Promise.resolve([]);

  let promise = topicQuestionCache.get(topicId);
  if (!promise) {
    const loaders = questionLoadersFromPaths(QUESTION_FILES_BY_TOPIC[topicId]);
    if (!loaders.length) {
      promise = loadSubjectQuestions(ref.subject.id).then((list) => list.filter((question) => question.topic === topicId));
    } else {
      promise = Promise.all(loaders.map((load) => withRetry(load)))
        .then(normalizeModules)
        .then((list) => list.filter((question) => question.topic === topicId));
    }
    promise.catch(() => topicQuestionCache.delete(topicId));
    topicQuestionCache.set(topicId, promise);
  }
  return promise;
}

/** Soru kimliği "<konuId>-qNN" biçimindedir. */
export function topicOfQuestionId(id: string): string | undefined {
  const topicId = id.replace(/-q\d+$/, '');
  return getTopicRef(topicId) ? topicId : undefined;
}

/** Soru kimliğinden ders kimliğini bulur. */
export function subjectOfQuestionId(id: string): string | undefined {
  const topicId = topicOfQuestionId(id);
  return topicId ? getTopicRef(topicId)?.subject.id : undefined;
}

/**
 * Yalnız verilen soru kimliklerinin konularını yükler.
 * Aktif testi yeniden açarken bütün ders bankası indirilmez.
 */
export async function loadQuestionsByIds(ids: string[]): Promise<Map<string, Question>> {
  const topics = [...new Set(ids.map(topicOfQuestionId).filter((topic): topic is string => !!topic))];
  const lists = await Promise.all(topics.map((topic) => loadTopicQuestions(topic)));
  const wanted = new Set(ids);
  const map = new Map<string, Question>();
  for (const list of lists) for (const question of list) if (wanted.has(question.id)) map.set(question.id, question);
  return map;
}

/**
 * Filtreye göre gereken en küçük temel soru kümesini yükler.
 * Test kurulum ekranı bunu otomatik çağırmaz; yalnız test gerçekten başlatılırken kullanılır.
 */
export async function loadQuestionsFor(filter: { exam: string; subjectId: string; topicId: string }): Promise<Question[]> {
  if (filter.topicId !== 'all') return loadTopicQuestions(filter.topicId);
  if (filter.subjectId !== 'all') return loadSubjectQuestions(filter.subjectId);
  if (filter.exam === 'TYT' || filter.exam === 'AYT') {
    const subjectIds = SUBJECTS.filter((subject) => subject.exam === filter.exam).map((subject) => subject.id);
    return (await Promise.all(subjectIds.map((subjectId) => loadSubjectQuestions(subjectId)))).flat();
  }
  return loadQuestions();
}

/** Tüm soru bankası (yalnız açıkça tüm-bankayı isteyen akışlarda). */
export function loadQuestions(): Promise<Question[]> {
  if (!allQuestionCache) {
    const promise = Promise.all(SUBJECTS.map((subject) => loadSubjectQuestions(subject.id))).then((lists) => lists.flat());
    promise.catch(() => {
      allQuestionCache = null;
    });
    allQuestionCache = promise;
  }
  return allQuestionCache;
}
