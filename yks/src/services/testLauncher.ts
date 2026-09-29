import { SUBJECTS } from '../data/curriculum';
import { loadQuestionsByIds, loadQuestionsFor, loadSubjectQuestions } from '../data/content';
import { describeContentLoadError, recoverFromChunkError } from '../utils/chunkRecovery';
import { navigate } from '../hooks/useRoute';
import { startTest } from '../store/actions';
import type { TestConfig } from '../store/schema';
import { getState, replaceState } from '../store/store';
import { filterPool, pickQuestions } from '../utils/testEngine';
import type { Question } from '../domain/types';

export const DEFAULT_CONFIG: TestConfig = {
  exam: 'all',
  subjectId: 'all',
  topicId: 'all',
  subtopicId: 'all',
  difficulty: 'all',
  type: 'all',
  count: 10,
  mode: 'ogrenme',
  origin: 'filtre',
};

export function makeConfig(patch: Partial<TestConfig>): TestConfig {
  return { ...DEFAULT_CONFIG, ...patch };
}

let launchInFlight = false;

function rotate<T>(items: T[], offset: number): T[] {
  if (!items.length) return items;
  const pivot = ((offset % items.length) + items.length) % items.length;
  return [...items.slice(pivot), ...items.slice(0, pivot)];
}

/**
 * Konu/ders seçiliyse yalnız o alanı, karışık testte ise küçük ders gruplarını
 * sırayla yükler. Amaç Testler ekranı açılırken bütün soru bankasını indirmemek
 * ve "Başlat" sonrasında da ihtiyaçtan fazla chunk istememektir.
 */
async function loadFilteredPool(config: TestConfig): Promise<Question[]> {
  if (config.topicId !== 'all' || config.subjectId !== 'all') {
    return filterPool(await loadQuestionsFor(config), config);
  }

  const candidates = SUBJECTS.filter((subject) => config.exam === 'all' || subject.exam === config.exam);
  const attemptsOffset = getState().attempts.length;
  const ordered = rotate(candidates, attemptsOffset % Math.max(1, candidates.length));
  const pool: Question[] = [];
  const batchSize = 3;

  for (let index = 0; index < ordered.length; index += batchSize) {
    const batch = ordered.slice(index, index + batchSize);
    const lists = await Promise.all(batch.map((subject) => loadSubjectQuestions(subject.id)));
    for (const list of lists) pool.push(...filterPool(list, config));

    // Bir miktar seçim payı bırak; pickQuestions görülmemiş soruları öne alabilir.
    if (pool.length >= Math.max(config.count * 2, config.count + 5)) break;
  }

  return pool;
}

export function launchTestFromPool(config: TestConfig, pool: Question[]): string | null {
  if (!pool.length) return 'Bu filtrelere uyan soru bulunamadı. Filtreleri genişletmeyi dene.';
  const ids = pickQuestions(pool, config.count, getState().attempts);
  if (!ids.length) return 'Test için soru seçilemedi. Filtreleri değiştirip tekrar dene.';
  replaceState(startTest(getState(), { ...config, count: ids.length }, ids));
  navigate('/test');
  return null;
}

/**
 * Filtreye göre test oluşturup başlatır. Aynı anda iki test yükleme işlemi
 * başlatılmaz; özellikle yavaş mobil bağlantıda çift dokunma engellenir.
 */
export async function launchTest(config: TestConfig): Promise<string | null> {
  if (launchInFlight) return 'Sorular zaten hazırlanıyor. Birkaç saniye bekle.';

  launchInFlight = true;
  try {
    const pool = await loadFilteredPool(config);
    return launchTestFromPool(config, pool);
  } catch (error) {
    if (recoverFromChunkError(error)) return null;
    return describeContentLoadError(error);
  } finally {
    launchInFlight = false;
  }
}

/** Belirli soru kimlikleriyle test başlatır (yanlışlar, tek soru). */
export async function launchWithIds(ids: string[], config: TestConfig): Promise<string | null> {
  if (launchInFlight) return 'Sorular zaten hazırlanıyor. Birkaç saniye bekle.';

  launchInFlight = true;
  try {
    const known = await loadQuestionsByIds(ids);
    const valid = ids.filter((id) => known.has(id));
    if (!valid.length) return 'Soru bulunamadı.';
    replaceState(startTest(getState(), { ...config, count: valid.length }, valid));
    navigate('/test');
    return null;
  } catch (error) {
    if (recoverFromChunkError(error)) return null;
    return describeContentLoadError(error);
  } finally {
    launchInFlight = false;
  }
}

const QUICK_SUBJECTS = 3;

/**
 * Hızlı karışık test: tüm bankayı indirmek yerine birkaç dersten soru seçer.
 */
export async function launchQuickMix(count: number, title: string): Promise<string | null> {
  if (launchInFlight) return 'Sorular zaten hazırlanıyor. Birkaç saniye bekle.';

  launchInFlight = true;
  try {
    const subjects = rotate([...SUBJECTS], getState().attempts.length).slice(0, QUICK_SUBJECTS);
    const pool = (await Promise.all(subjects.map((subject) => loadSubjectQuestions(subject.id)))).flat();
    if (!pool.length) return 'Soru bulunamadı.';
    const config = makeConfig({ count, title });
    return launchTestFromPool(config, pool);
  } catch (error) {
    if (recoverFromChunkError(error)) return null;
    return describeContentLoadError(error);
  } finally {
    launchInFlight = false;
  }
}

export function hasActiveTest(): boolean {
  return !!getState().activeTest;
}
