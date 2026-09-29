import { SUBJECTS } from '../data/curriculum';
import { loadQuestionsByIds, loadQuestionsFor, loadSubjectQuestions } from '../data/content';
import { recoverFromChunkError } from '../utils/chunkRecovery';
import { navigate } from '../hooks/useRoute';
import { startTest } from '../store/actions';
import type { TestConfig } from '../store/schema';
import { getState, update } from '../store/store';
import { filterPool, pickQuestions } from '../utils/testEngine';
import { nextBestTopics } from './adaptiveStudy';

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

/**
 * Filtreye göre test oluşturup başlatır. Havuz boşsa hata mesajı döner.
 * Devam eden test varsa üzerine yazılır (çağıran taraf onay almalıdır).
 */
const LOAD_ERROR = 'Sorular yüklenemedi. İnternet bağlantını kontrol edip tekrar dene.';

export async function launchTest(config: TestConfig): Promise<string | null> {
  let all;
  try {
    all = await loadQuestionsFor(config);
  } catch (e) {
    recoverFromChunkError(e);
    return LOAD_ERROR;
  }
  const pool = filterPool(all, config);
  if (!pool.length) return 'Bu filtrelere uyan soru bulunamadı. Filtreleri genişletmeyi dene.';
  const ids = pickQuestions(pool, config.count, getState().attempts);
  update((s) => startTest(s, config, ids));
  navigate('/test');
  return null;
}

/** Belirli soru kimlikleriyle test başlatır (yanlışlar, tek soru). */
export async function launchWithIds(ids: string[], config: TestConfig): Promise<string | null> {
  let known;
  try {
    known = await loadQuestionsByIds(ids);
  } catch (e) {
    recoverFromChunkError(e);
    return LOAD_ERROR;
  }
  const valid = ids.filter((id) => known.has(id));
  if (!valid.length) return 'Soru bulunamadı.';
  update((s) => startTest(s, { ...config, count: valid.length }, valid));
  navigate('/test');
  return null;
}

const QUICK_SUBJECTS = 3;

/**
 * Hızlı karışık test: tüm bankayı indirmek yerine rastgele birkaç dersten soru seçer
 * (telefonda saniyeler içinde açılır). Her seferinde farklı dersler gelir.
 */
export async function launchQuickMix(count: number, title: string): Promise<string | null> {
  const subjects = [...SUBJECTS].sort(() => Math.random() - 0.5).slice(0, QUICK_SUBJECTS);
  let pool;
  try {
    pool = (await Promise.all(subjects.map((s) => loadSubjectQuestions(s.id)))).flat();
  } catch (e) {
    recoverFromChunkError(e);
    return LOAD_ERROR;
  }
  if (!pool.length) return 'Soru bulunamadı.';
  const config = makeConfig({ count, title });
  const ids = pickQuestions(pool, count, getState().attempts);
  update((s) => startTest(s, config, ids));
  navigate('/test');
  return null;
}

export function hasActiveTest(): boolean {
  return !!getState().activeTest;
}


const DIAGNOSTIC_SUBJECTS = [
  'tyt-turkce',
  'tyt-matematik',
  'tyt-fizik',
  'tyt-kimya',
  'tyt-biyoloji',
  'ayt-matematik',
  'ayt-fizik',
  'ayt-kimya',
  'ayt-biyoloji',
] as const;

/**
 * Kısa seviye tespit testi. Her ana sayısal dersten temsilî sorular seçer;
 * sonuçlar normal deneme kayıtları gibi attempts'a işlenir ve adaptif motoru besler.
 */
export async function launchDiagnostic(): Promise<string | null> {
  const state = getState();
  let groups;
  try {
    groups = await Promise.all(DIAGNOSTIC_SUBJECTS.map(async (id) => ({ id, qs: await loadSubjectQuestions(id) })));
  } catch (e) {
    recoverFromChunkError(e);
    return LOAD_ERROR;
  }

  const ids: string[] = [];
  for (const g of groups) {
    const baseCount = g.id === 'tyt-matematik' || g.id === 'ayt-matematik' || g.id === 'tyt-turkce' ? 3 : 2;
    ids.push(...pickQuestions(g.qs, baseCount, state.attempts));
  }
  if (!ids.length) return 'Seviye tespit testi için soru bulunamadı.';

  const config = makeConfig({
    exam: 'all',
    count: ids.length,
    mode: 'sinav',
    origin: 'seviye',
    durationMin: Math.max(20, Math.ceil(ids.length * 1.25)),
    title: 'Akıllı Seviye Tespit Testi',
  });
  update((st) => startTest(st, config, ids));
  navigate('/test');
  return null;
}

/**
 * Son performansa göre en çok fayda sağlayacak konudan adaptif test başlatır.
 * Önerilen zorlukta soru yoksa aynı konunun tüm zorluklarına geri düşer.
 */
export async function launchAdaptivePractice(count = 12): Promise<string | null> {
  const state = getState();
  const candidates = nextBestTopics(state, 8);
  if (!candidates.length) return launchQuickMix(count, 'Adaptif başlangıç testi');

  for (const row of candidates) {
    const config = makeConfig({
      subjectId: row.subjectId,
      topicId: row.topicId,
      difficulty: row.recommendedDifficulty,
      count,
      mode: 'ogrenme',
      origin: 'adaptif',
      title: 'Adaptif çalışma testi',
    });
    const err = await launchTest(config);
    if (!err) return null;

    const fallback = await launchTest({ ...config, difficulty: 'all' });
    if (!fallback) return null;
  }
  return launchQuickMix(count, 'Adaptif karışık test');
}
