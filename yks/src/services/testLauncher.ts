import { SUBJECTS } from '../data/curriculum';
import { loadQuestionsByIds, loadQuestionsFor, loadSubjectQuestions } from '../data/content';
import { recoverFromChunkError } from '../utils/chunkRecovery';
import { classifyLoadError, loadErrorText } from '../utils/loadErrors';
import { navigate } from '../hooks/useRoute';
import { startTest } from '../store/actions';
import type { TestConfig } from '../store/schema';
import { getState, update } from '../store/store';
import { filterPool, pickQuestions } from '../utils/testEngine';
import type { Question } from '../domain/types';
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
/** Yükleme hatasını türüne göre açıklar; eski sürümse sayfayı bir kez yeniler. */
async function loadFailure(e: unknown): Promise<string> {
  const err = await classifyLoadError(e);
  recoverFromChunkError(err);
  return loadErrorText(err.kind);
}

/** Aynı anda iki test başlatılmasın (çift dokunma). */
let launching = false;
export function isLaunching(): boolean {
  return launching;
}
async function once(run: () => Promise<string | null>): Promise<string | null> {
  if (launching) return null;
  launching = true;
  try {
    return await run();
  } finally {
    launching = false;
  }
}
export const ACTIVE_TEST_ERROR = 'Devam eden testin var. Önce teste dönüp bitir veya yeni test başlatırken mevcut testi kapatmayı onayla.';

function activeTestBlocked(replaceActive = false): string | null {
  return getState().activeTest && !replaceActive ? ACTIVE_TEST_ERROR : null;
}

export function launchTest(config: TestConfig, replaceActive = false, preloaded?: Question[]): Promise<string | null> {
  return once(() => launchTestNow(config, replaceActive, preloaded));
}

/** Hazır havuz verildiyse yeniden indirmeden onu kullanır. */
export function launchTestFromPool(config: TestConfig, pool: Question[], replaceActive = false): Promise<string | null> {
  return launchTest(config, replaceActive, pool);
}

async function launchTestNow(config: TestConfig, replaceActive: boolean, preloaded?: Question[]): Promise<string | null> {
  const blocked = activeTestBlocked(replaceActive);
  if (blocked) return blocked;
  let all = preloaded;
  if (!all) {
    try {
      all = await loadQuestionsFor(config);
    } catch (e) {
      return loadFailure(e);
    }
  }
  const pool = filterPool(all, config);
  if (!pool.length) return 'Bu filtrelere uyan soru bulunamadı. Filtreleri genişletmeyi dene.';
  const ids = pickQuestions(pool, config.count, getState().attempts);
  update((s) => startTest(s, config, ids));
  navigate('/test');
  return null;
}

/** Belirli soru kimlikleriyle test başlatır (yanlışlar, tek soru). */
export function launchWithIds(ids: string[], config: TestConfig, replaceActive = false): Promise<string | null> {
  return once(async () => {
  const blocked = activeTestBlocked(replaceActive);
  if (blocked) return blocked;
  let known;
  try {
    known = await loadQuestionsByIds(ids);
  } catch (e) {
    return loadFailure(e);
  }
  const valid = ids.filter((id) => known.has(id));
  if (!valid.length) return 'Soru bulunamadı.';
  update((s) => startTest(s, { ...config, count: valid.length }, valid));
  navigate('/test');
  return null;
  });
}

const QUICK_SUBJECTS = 3;

/**
 * Hızlı karışık test: tüm bankayı indirmek yerine rastgele birkaç dersten soru seçer
 * (telefonda saniyeler içinde açılır). Her seferinde farklı dersler gelir.
 */
export async function launchQuickMix(count: number, title: string): Promise<string | null> {
  const blocked = activeTestBlocked();
  if (blocked) return blocked;
  const subjects = [...SUBJECTS].sort(() => Math.random() - 0.5).slice(0, QUICK_SUBJECTS);
  let pool;
  try {
    pool = (await Promise.all(subjects.map((s) => loadSubjectQuestions(s.id)))).flat();
  } catch (e) {
    return loadFailure(e);
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
  const blocked = activeTestBlocked();
  if (blocked) return blocked;
  const state = getState();
  let groups;
  try {
    groups = await Promise.all(DIAGNOSTIC_SUBJECTS.map(async (id) => ({ id, qs: await loadSubjectQuestions(id) })));
  } catch (e) {
    return loadFailure(e);
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
  const blocked = activeTestBlocked();
  if (blocked) return blocked;
  const state = getState();
  const candidates = nextBestTopics(state, 8);
  if (!candidates.length) return launchQuickMix(count, 'Adaptif başlangıç testi');

  for (const row of candidates) {
    let config = makeConfig({
      subjectId: row.subjectId,
      topicId: row.topicId,
      difficulty: row.recommendedDifficulty,
      count,
      mode: 'ogrenme',
      origin: 'adaptif',
      title: 'Adaptif çalışma testi',
    });

    let all;
    try {
      all = await loadQuestionsFor(config);
    } catch (e) {
      recoverFromChunkError(e);
      continue;
    }
    let pool = filterPool(all, config);

    // Önerilen seviyede yeterli soru yoksa konuyu koruyup zorluk filtresini aç.
    if (pool.length < Math.min(5, count)) {
      config = { ...config, difficulty: 'all' };
      try {
        all = await loadQuestionsFor(config);
      } catch (e) {
        recoverFromChunkError(e);
        continue;
      }
      pool = filterPool(all, config);
    }
    if (!pool.length) continue;

    // Aynı hataların unutulmaması için açık yanlışlardan en fazla 3'ünü teste geri getir.
    const openWrongIds = new Set(
      Object.values(state.wrongs)
        .filter((w) => !w.learned && w.topicId === row.topicId)
        .map((w) => w.questionId),
    );
    const wrongPool = pool.filter((q) => openWrongIds.has(q.id));
    const wrongIds = pickQuestions(wrongPool, Math.min(3, count), state.attempts);
    const used = new Set(wrongIds);
    const rest = pickQuestions(pool.filter((q) => !used.has(q.id)), Math.max(0, count - wrongIds.length), state.attempts);
    const ids = [...wrongIds, ...rest].slice(0, count);
    if (!ids.length) continue;

    update((s) => startTest(s, { ...config, count: ids.length }, ids));
    navigate('/test');
    return null;
  }
  return launchQuickMix(count, 'Adaptif karışık test');
}
