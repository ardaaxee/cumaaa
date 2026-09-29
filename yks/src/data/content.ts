import type { LessonSeed, Question, QuestionSeed, SubjectId } from '../domain/types';
import { SUBJECTS, getTopicRef } from './curriculum';

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

/** Soru kimliği "<konuId>-qNN" biçimindedir; konu → ders. */
export function subjectOfQuestionId(id: string): string | undefined {
  return getTopicRef(id.replace(/-q\d+$/, ''))?.subject.id;
}

/** Yalnız verilen soruların derslerini yükler (tüm bankayı indirmeden). */
export async function loadQuestionsByIds(ids: string[]): Promise<Map<string, Question>> {
  const subjects = [...new Set(ids.map(subjectOfQuestionId).filter((s): s is string => !!s))];
  const lists = await Promise.all(subjects.map((s) => loadSubjectQuestions(s)));
  const want = new Set(ids);
  const map = new Map<string, Question>();
  for (const list of lists) for (const q of list) if (want.has(q.id)) map.set(q.id, q);
  return map;
}

/** Filtreye göre gereken en küçük soru kümesini yükler: konu/ders seçiliyse yalnız o ders, sınav seçiliyse o sınavın dersleri. */
export async function loadQuestionsFor(filter: { exam: string; subjectId: string; topicId: string }): Promise<Question[]> {
  const subjectId = filter.topicId !== 'all' ? getTopicRef(filter.topicId)?.subject.id : filter.subjectId !== 'all' ? filter.subjectId : undefined;
  if (subjectId) return loadSubjectQuestions(subjectId);
  if (filter.exam === 'TYT' || filter.exam === 'AYT') {
    const subjects = SUBJECTS.filter((s) => s.exam === filter.exam).map((s) => s.id);
    return (await Promise.all(subjects.map((s) => loadSubjectQuestions(s)))).flat();
  }
  return loadQuestions();
}

/** Tüm soru bankası (karışık testler için). */
export function loadQuestions(): Promise<Question[]> {
  if (!allQuestionCache) {
    // Ders önbellekleri paylaşılır; bir ders zaten yüklendiyse yeniden indirilmez.
    const p = Promise.all(SUBJECTS.map((s) => loadSubjectQuestions(s.id))).then((lists) => lists.flat());
    p.catch(() => {
      allQuestionCache = null;
    });
    allQuestionCache = p;
  }
  return allQuestionCache;
}
