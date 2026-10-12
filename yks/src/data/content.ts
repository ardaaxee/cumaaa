import type { LessonSeed, Question, QuestionSeed, SubjectId } from '../domain/types';
import { loadWithPolicy } from '../utils/loadErrors';
import { LESSON_FILES, QUESTION_INDEX } from './contentIndex.generated';
import { SUBJECTS, getTopicRef } from './curriculum';

type LessonModule = { lessons: LessonSeed[] };
type QuestionModule = { questions: QuestionSeed[] };
type Loader<T> = () => Promise<T>;

const lessonModules = import.meta.glob<LessonModule>('./lessons/*.ts');
const questionModules = import.meta.glob<QuestionModule>('./questions/*.ts');

/** İçerik dosyalarının oluşturulma tarihi (soru bankası sürümü). */
export const CONTENT_CREATED_AT = '2026-09-27';

const fileName = (path: string) => path.replace(/^.*\//, '').replace(/\.ts$/, '');
const questionLoaderByFile = new Map(Object.entries(questionModules).map(([p, l]) => [fileName(p), l]));
const lessonLoaderByFile = new Map(Object.entries(lessonModules).map(([p, l]) => [fileName(p), l]));

/** Dosya adı dersin kimliğiyle başlar: "ayt-fizik-1" → ayt-fizik. */
function filesForSubject(files: Iterable<string>, subjectId: string): string[] {
  const re = new RegExp(`^${subjectId}(-.*)?$`);
  return [...files].filter((f) => re.test(f)).sort();
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

// ---------- Dosya bazlı önbellek: her soru/konu paketi en fazla bir kez indirilir ----------

const questionFileCache = new Map<string, Promise<Question[]>>();
const lessonFileCache = new Map<string, Promise<LessonSeed[]>>();

function cached<T>(cache: Map<string, Promise<T>>, key: string, load: Loader<T>): Promise<T> {
  let p = cache.get(key);
  if (!p) {
    p = loadWithPolicy(load);
    // Başarısız yükleme önbellekte kalmasın; bir sonraki denemede yeniden istensin.
    p.catch(() => cache.delete(key));
    cache.set(key, p);
  }
  return p;
}

function loadQuestionFile(file: string): Promise<Question[]> {
  const loader = questionLoaderByFile.get(file);
  if (!loader) return Promise.resolve([]);
  return cached(questionFileCache, file, () =>
    loader().then((m) => m.questions.map(normalizeQuestion).filter((q): q is Question => q !== null)),
  );
}

function loadLessonFile(file: string): Promise<LessonSeed[]> {
  const loader = lessonLoaderByFile.get(file);
  if (!loader) return Promise.resolve([]);
  return cached(lessonFileCache, file, () => loader().then((m) => m.lessons));
}

async function loadQuestionFiles(files: string[]): Promise<Question[]> {
  return (await Promise.all([...new Set(files)].map(loadQuestionFile))).flat();
}

// ---------- Konu anlatımları ----------

/** Yalnız bir dersin konu anlatımlarını yükler (formül defteri, kartlar). */
export async function loadSubjectLessons(subjectId: SubjectId | string): Promise<Map<string, LessonSeed>> {
  const lists = await Promise.all(filesForSubject(lessonLoaderByFile.keys(), subjectId).map(loadLessonFile));
  const map = new Map<string, LessonSeed>();
  for (const list of lists) for (const lesson of list) map.set(lesson.topicId, lesson);
  return map;
}

/** Yalnız konunun anlatımının bulunduğu dosyayı yükler. */
export async function loadLesson(topicId: string): Promise<LessonSeed | undefined> {
  const file = LESSON_FILES[topicId];
  if (!file) return undefined;
  return (await loadLessonFile(file)).find((l) => l.topicId === topicId);
}

// ---------- Sorular ----------

/** Konunun sorularının bulunduğu dosyalar (derleme sırasında üretilen dizinden). */
export function topicQuestionFiles(topicId: string): string[] {
  return QUESTION_INDEX[topicId]?.f ?? [];
}

/** Yalnız bir dersin soru bankasını yükler. */
export function loadSubjectQuestions(subjectId: SubjectId | string): Promise<Question[]> {
  return loadQuestionFiles(filesForSubject(questionLoaderByFile.keys(), subjectId));
}

/** Yalnız konunun sorularının bulunduğu dosyaları yükler (dersin tamamını değil). */
export async function loadTopicQuestions(topicId: string): Promise<Question[]> {
  return (await loadQuestionFiles(topicQuestionFiles(topicId))).filter((q) => q.topic === topicId);
}

/** Verilen konuların bulunduğu dosyalardaki tüm sorular (test ekranı ve "benzer soru" için). */
export function loadQuestionsForTopics(topicIds: string[]): Promise<Question[]> {
  return loadQuestionFiles([...new Set(topicIds)].flatMap(topicQuestionFiles));
}

/** Soru kimliği "<konuId>-qNN" biçimindedir. */
export function topicOfQuestionId(id: string): string {
  return id.replace(/-q\d+$/, '');
}

export function subjectOfQuestionId(id: string): string | undefined {
  return getTopicRef(topicOfQuestionId(id))?.subject.id;
}

/** Yalnız verilen soruların bulunduğu dosyaları yükler. */
export async function loadQuestionsByIds(ids: string[]): Promise<Map<string, Question>> {
  const topics = [...new Set(ids.map(topicOfQuestionId))];
  const list = await loadQuestionFiles(topics.flatMap(topicQuestionFiles));
  const want = new Set(ids);
  return new Map(list.filter((q) => want.has(q.id)).map((q) => [q.id, q]));
}

export interface QuestionScope {
  exam: string;
  subjectId: string;
  topicId: string;
}

/** Karışık testlerde rastgele seçilen ders sayısı (tüm bankayı indirmemek için). */
export const MIXED_SUBJECTS = 3;

/**
 * Filtre için gereken en küçük dosya kümesi:
 * konu seçiliyse o konunun dosyaları, ders seçiliyse o dersin dosyaları,
 * yalnız sınav ya da "karışık" seçiliyse rastgele birkaç dersin dosyaları.
 */
export function filesForScope(scope: QuestionScope, random: () => number = Math.random): string[] {
  if (scope.topicId !== 'all') return topicQuestionFiles(scope.topicId);
  if (scope.subjectId !== 'all') return filesForSubject(questionLoaderByFile.keys(), scope.subjectId);
  const pool = SUBJECTS.filter((s) => scope.exam === 'all' || s.exam === scope.exam).map((s) => s.id);
  const picked = [...pool].sort(() => random() - 0.5).slice(0, MIXED_SUBJECTS);
  return picked.flatMap((s) => filesForSubject(questionLoaderByFile.keys(), s));
}

export function loadQuestionsFor(scope: QuestionScope, random?: () => number): Promise<Question[]> {
  return loadQuestionFiles(filesForScope(scope, random));
}

/** Tüm soru bankası. Yalnız gerçekten gereken yerde (ör. tam deneme) kullanılır. */
export function loadQuestions(): Promise<Question[]> {
  return loadQuestionFiles([...questionLoaderByFile.keys()]);
}

/** Bir sınavın tüm soruları (tam deneme oluşturmak için). */
export function loadExamQuestions(exam: 'TYT' | 'AYT'): Promise<Question[]> {
  return loadQuestionFiles(SUBJECTS.filter((s) => s.exam === exam).flatMap((s) => filesForSubject(questionLoaderByFile.keys(), s.id)));
}

/** Test için hangi dosyaların indirileceğini gösterir (testler/teşhis). */
export function questionFileNames(): string[] {
  return [...questionLoaderByFile.keys()].sort();
}

export function lessonFileNames(): string[] {
  return [...lessonLoaderByFile.keys()].sort();
}
