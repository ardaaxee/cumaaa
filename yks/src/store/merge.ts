import type { AppState, CardState, ReviewItem, TopicProgress, WrongEntry } from './schema';

/**
 * İki cihazın durumunu birleştirir (bulut eşitlemesi).
 * - Listeler (soru denemeleri, testler, denemeler, görevler…) kimliğe göre birleşir; silinenler geri gelmez.
 * - Anahtar-değer kayıtlarında (yanlışlar, tekrarlar, kartlar, konu durumu) daha güncel olan kazanır.
 * - Profil ve ayarlar, en son değiştirilmiş taraftan alınır; bulut bağlantı ayarları ve
 *   devam eden test her zaman yerelde kalır.
 */
export interface MergeInput {
  local: AppState;
  localChangedAt: string;
  remote: AppState;
  remoteChangedAt: string;
}

type WithId = { id: string };

function mergeList<T extends WithId>(local: T[], remote: T[], deleted: Record<string, string>, preferRemote: boolean, sortKey?: (x: T) => string): T[] {
  const map = new Map<string, T>();
  const [first, second] = preferRemote ? [local, remote] : [remote, local];
  for (const x of first) map.set(x.id, x);
  for (const x of second) map.set(x.id, x);
  const out = [...map.values()].filter((x) => !deleted[x.id]);
  return sortKey ? out.sort((a, b) => sortKey(a).localeCompare(sortKey(b))) : out;
}

function mergeRecord<T>(local: Record<string, T>, remote: Record<string, T>, newer: (a: T, b: T) => T, deleted: Record<string, string>, prefix = ''): Record<string, T> {
  const out: Record<string, T> = { ...remote };
  for (const [k, v] of Object.entries(local)) out[k] = k in out ? newer(v, out[k]) : v;
  for (const k of Object.keys(out)) if (deleted[`${prefix}${k}`]) delete out[k];
  return out;
}

const newerWrong = (a: WrongEntry, b: WrongEntry): WrongEntry => {
  const ta = a.learnedAt && a.learnedAt > a.lastAt ? a.learnedAt : a.lastAt;
  const tb = b.learnedAt && b.learnedAt > b.lastAt ? b.learnedAt : b.lastAt;
  if (ta !== tb) return ta > tb ? a : b;
  return a.wrongCount >= b.wrongCount ? a : b;
};

const newerReview = (a: ReviewItem, b: ReviewItem): ReviewItem => {
  if (a.history.length !== b.history.length) return a.history.length > b.history.length ? a : b;
  return (a.lastReviewedDay ?? '') >= (b.lastReviewedDay ?? '') ? a : b;
};

const newerCard = (a: CardState, b: CardState): CardState => {
  if (a.lastDay !== b.lastDay) return a.lastDay > b.lastDay ? a : b;
  return a.seen >= b.seen ? a : b;
};

const STATUS_RANK: Record<string, number> = { baslanmadi: 0, calisiliyor: 1, tamamlandi: 2 };
const newerTopic = (a: TopicProgress, b: TopicProgress): TopicProgress => {
  const ta = a.completedAt ?? a.startedAt ?? '';
  const tb = b.completedAt ?? b.startedAt ?? '';
  if (ta !== tb) return ta > tb ? a : b;
  return (STATUS_RANK[a.status] ?? 0) >= (STATUS_RANK[b.status] ?? 0) ? a : b;
};

export function mergeStates({ local, localChangedAt, remote, remoteChangedAt }: MergeInput): AppState {
  const remoteNewer = remoteChangedAt > localChangedAt;
  const deleted = { ...remote.deleted, ...local.deleted };
  const base = remoteNewer ? remote : local;
  return {
    ...base,
    schemaVersion: local.schemaVersion,
    profile: base.profile,
    // Bulut bağlantı bilgisi ve cihaz tercihleri yerelde kalır.
    settings: { ...base.settings, cloud: local.settings.cloud, aiServerUrl: local.settings.aiServerUrl || remote.settings.aiServerUrl },
    activeTest: local.activeTest,
    pomodoro: local.pomodoro,
    learningProgress: mergeRecord(local.learningProgress ?? {}, remote.learningProgress ?? {}, (a,b)=>a.updatedAt>=b.updatedAt?a:b, deleted),
    topicProgress: mergeRecord(local.topicProgress, remote.topicProgress, newerTopic, deleted),
    attempts: mergeList(local.attempts, remote.attempts, deleted, remoteNewer, (a) => a.at),
    testResults: mergeList(local.testResults, remote.testResults, deleted, remoteNewer, (r) => r.finishedAt),
    wrongs: mergeRecord(local.wrongs, remote.wrongs, newerWrong, deleted, 'wrong:'),
    reviews: mergeRecord(local.reviews, remote.reviews, newerReview, deleted),
    tasks: mergeList(local.tasks, remote.tasks, deleted, remoteNewer),
    mocks: mergeList(local.mocks, remote.mocks, deleted, remoteNewer, (m) => m.createdAt),
    studyLog: mergeList(local.studyLog, remote.studyLog, deleted, remoteNewer, (x) => x.at),
    videos: mergeList(local.videos, remote.videos, deleted, remoteNewer),
    chat: mergeList(local.chat, remote.chat, deleted, remoteNewer, (m) => m.at).slice(-200),
    notebookPages: mergeList(local.notebookPages, remote.notebookPages, deleted, remoteNewer),
    cards: mergeRecord(local.cards, remote.cards, newerCard, deleted),
    favorites: mergeRecord(local.favorites, remote.favorites, (a, b) => (a >= b ? a : b), deleted, 'fav:'),
    deleted,
    legacy: local.legacy ?? remote.legacy,
  };
}
