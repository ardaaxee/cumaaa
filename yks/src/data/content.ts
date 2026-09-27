import type { LessonSeed, Question, QuestionSeed } from '../domain/types';
import { getTopicRef } from './curriculum';

type LessonModule = { lessons: LessonSeed[] };
type QuestionModule = { questions: QuestionSeed[] };

const lessonModules = import.meta.glob<LessonModule>('./lessons/*.ts');
const questionModules = import.meta.glob<QuestionModule>('./questions/*.ts');

/** İçerik dosyalarının oluşturulma tarihi (soru bankası sürümü). */
export const CONTENT_CREATED_AT = '2026-09-27';

let lessonCache: Promise<Map<string, LessonSeed>> | null = null;
let questionCache: Promise<Question[]> | null = null;

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

export function loadLessons(): Promise<Map<string, LessonSeed>> {
  if (!lessonCache) {
    lessonCache = Promise.all(Object.values(lessonModules).map((load) => load())).then((mods) => {
      const map = new Map<string, LessonSeed>();
      for (const mod of mods) for (const lesson of mod.lessons) map.set(lesson.topicId, lesson);
      return map;
    });
  }
  return lessonCache;
}

export async function loadLesson(topicId: string): Promise<LessonSeed | undefined> {
  return (await loadLessons()).get(topicId);
}

export function loadQuestions(): Promise<Question[]> {
  if (!questionCache) {
    questionCache = Promise.all(Object.values(questionModules).map((load) => load())).then((mods) =>
      mods
        .flatMap((m) => m.questions)
        .map(normalizeQuestion)
        .filter((q): q is Question => q !== null),
    );
  }
  return questionCache;
}
