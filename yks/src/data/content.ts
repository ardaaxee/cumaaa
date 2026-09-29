import type { LessonSeed, Question, QuestionSeed, SubjectId } from '../domain/types';
import { getTopicRef } from './curriculum';

type LessonModule = { lessons: LessonSeed[] };
type QuestionModule = { questions: QuestionSeed[] };
type Loader<T> = () => Promise<T>;

const lessonModules = import.meta.glob<LessonModule>('./lessons/*.ts');
const questionModules = import.meta.glob<QuestionModule>('./questions/*.ts');

/** İçerik dosyalarının oluşturulma tarihi (soru bankası sürümü). */
export const CONTENT_CREATED_AT = '2026-09-27';

/** Ağ hatasında bir kez yeniden dener (mobil bağlantı kopmaları için). */
async function withRetry<T>(load: Loader<T>): Promise<T> {
  try {
    return await load();
  } catch {
    await new Promise((r) => setTimeout(r, 600));
    return load();
  }
}

/** Dosya adı dersin kimliğiyle başlar: "./lessons/ayt-fizik-1.ts" → ayt-fizik. */
function loadersFor<T>(modules: Record<string, Loader<T>>, subjectId: string): Loader<T>[] {
  const re = new RegExp(`/${subjectId}(-[^/]*)?\\.ts$`);
  return Object.entries(modules)
    .filter(([path]) => re.test(path))
    .map(([, load]) => load);
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
let allQuestionCache: Promise<Question[]> | null = null;

/** Yalnız bir dersin konu anlatımlarını yükler (telefonda hızlı açılış için). */
export function loadSubjectLessons(subjectId: SubjectId | string): Promise<Map<string, LessonSeed>> {
  let p = subjectLessonCache.get(subjectId);
  if (!p) {
    p = Promise.all(loadersFor(lessonModules, subjectId).map((load) => withRetry(load))).then((mods) => {
      const map = new Map<string, LessonSeed>();
      for (const mod of mods) for (const lesson of mod.lessons) map.set(lesson.topicId, lesson);
      return map;
    });
    // Başarısız yükleme önbellekte kalmasın; bir sonraki denemede yeniden istensin.
    p.catch(() => subjectLessonCache.delete(subjectId));
    subjectLessonCache.set(subjectId, p);
  }
  return p;
}

export async function loadLesson(topicId: string): Promise<LessonSeed | undefined> {
  const ref = getTopicRef(topicId);
  if (!ref) return undefined;
  return (await loadSubjectLessons(ref.subject.id)).get(topicId);
}

/** Yalnız bir dersin soru bankasını yükler. */
export function loadSubjectQuestions(subjectId: SubjectId | string): Promise<Question[]> {
  let p = subjectQuestionCache.get(subjectId);
  if (!p) {
    p = Promise.all(loadersFor(questionModules, subjectId).map((load) => withRetry(load))).then((mods) =>
      mods
        .flatMap((m) => m.questions)
        .map(normalizeQuestion)
        .filter((q): q is Question => q !== null),
    );
    p.catch(() => subjectQuestionCache.delete(subjectId));
    subjectQuestionCache.set(subjectId, p);
  }
  return p;
}

export async function loadTopicQuestions(topicId: string): Promise<Question[]> {
  const ref = getTopicRef(topicId);
  if (!ref) return [];
  return (await loadSubjectQuestions(ref.subject.id)).filter((q) => q.topic === topicId);
}

/** Tüm soru bankası (karışık testler için). */
export function loadQuestions(): Promise<Question[]> {
  if (!allQuestionCache) {
    const p = Promise.all(Object.values(questionModules).map((load) => withRetry(load))).then((mods) =>
      mods
        .flatMap((m) => m.questions)
        .map(normalizeQuestion)
        .filter((q): q is Question => q !== null),
    );
    p.catch(() => {
      allQuestionCache = null;
    });
    allQuestionCache = p;
  }
  return allQuestionCache;
}
