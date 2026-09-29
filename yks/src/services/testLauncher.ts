import { loadQuestionsByIds, loadQuestionsFor } from '../data/content';
import { recoverFromChunkError } from '../utils/chunkRecovery';
import { navigate } from '../hooks/useRoute';
import { startTest } from '../store/actions';
import type { TestConfig } from '../store/schema';
import { getState, update } from '../store/store';
import { filterPool, pickQuestions } from '../utils/testEngine';

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

export function hasActiveTest(): boolean {
  return !!getState().activeTest;
}
