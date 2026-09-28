import type { SubjectId } from '../domain/types';
import { dayKey, isValidDayKey } from '../utils/date';
import { uid } from '../utils/ids';
import {
  SCHEMA_VERSION,
  defaultState,
  type AppState,
  type MockExam,
  type PlanTask,
  type TaskType,
  type ThemePref,
  type TopicProgress,
  type VideoResource,
} from './schema';

/**
 * Veri sürümleme. Her sürüm yükseltmesi saf bir fonksiyondur; eski
 * kullanıcı verisi hiçbir güncellemede kaybolmaz.
 *
 * v2: Tek HTML dosyalı eski sürüm (localStorage "iyikiYksV2", sürüm alanı yok)
 * v3: Modüler sürüm (bu şema)
 */

export interface TopicLookup {
  id: string;
  subjectId: SubjectId;
  name: string;
}

export interface MigrationContext {
  topics: TopicLookup[];
  now?: Date;
}

export interface MigrationReport {
  from: number;
  to: number;
  notes: string[];
}

type Json = Record<string, unknown>;

const isObj = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v);
const num = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
const str = (v: unknown, fallback = '') => (typeof v === 'string' ? v : fallback);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

export function detectVersion(raw: unknown): number {
  if (!isObj(raw)) return 0;
  if (typeof raw.schemaVersion === 'number') return raw.schemaVersion;
  if ('doneTopics' in raw || 'wrongIds' in raw || 'goalQ' in raw || 'tasks' in raw) return 2;
  return 0;
}

// ---------- v2 → v3 ----------

const OLD_SUBJECT_MAP: Record<string, SubjectId> = {
  'tyt-tr': 'tyt-turkce',
  'tyt-mat': 'tyt-matematik',
  'tyt-geo': 'tyt-geometri',
  'tyt-fiz': 'tyt-fizik',
  'tyt-kim': 'tyt-kimya',
  'tyt-bio': 'tyt-biyoloji',
  'ayt-mat': 'ayt-matematik',
  'ayt-geo': 'ayt-geometri',
  'ayt-fiz': 'ayt-fizik',
  'ayt-kim': 'ayt-kimya',
  'ayt-bio': 'ayt-biyoloji',
};

export function normalizeName(s: string): string {
  return s
    .toLocaleLowerCase('tr-TR')
    .replace(/[–—-]/g, ' ')
    .replace(/[^a-z0-9çğıöşü\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(s: string): Set<string> {
  return new Set(normalizeName(s).split(' ').filter((t) => t.length > 2 && t !== 've'));
}

function similarity(a: string, b: string): number {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.9;
  const ta = tokens(a);
  const tb = tokens(b);
  if (!ta.size || !tb.size) return 0;
  let common = 0;
  ta.forEach((t) => {
    if ([...tb].some((u) => u.startsWith(t.slice(0, 5)) || t.startsWith(u.slice(0, 5)))) common++;
  });
  return common / Math.max(ta.size, tb.size);
}

function resolveOldSubject(oldSubject: string, oldTopic: string): { subjectId: SubjectId | null; topicName: string } {
  if (oldSubject === 'tyt-sos') {
    const [prefix, ...rest] = oldTopic.split(':');
    const name = rest.join(':').trim() || oldTopic;
    if (/^tarih/i.test(prefix)) return { subjectId: 'tyt-tarih', topicName: name };
    if (/^coğrafya/i.test(prefix)) return { subjectId: 'tyt-cografya', topicName: name };
    if (/^felsefe/i.test(prefix)) return { subjectId: 'tyt-felsefe', topicName: name };
    if (/^din/i.test(prefix)) return { subjectId: 'tyt-din', topicName: name };
    return { subjectId: null, topicName: oldTopic };
  }
  return { subjectId: OLD_SUBJECT_MAP[oldSubject] ?? null, topicName: oldTopic };
}

export function matchLegacyTopic(oldKey: string, topics: TopicLookup[]): string | null {
  const sep = oldKey.indexOf('|');
  if (sep < 0) return null;
  const { subjectId, topicName } = resolveOldSubject(oldKey.slice(0, sep), oldKey.slice(sep + 1));
  if (!subjectId) return null;
  let best: { id: string; score: number } | null = null;
  for (const t of topics) {
    if (t.subjectId !== subjectId) continue;
    const score = similarity(topicName, t.name);
    if (!best || score > best.score) best = { id: t.id, score };
  }
  return best && best.score >= 0.5 ? best.id : null;
}

function legacyDay(v: unknown, fallback: string): string {
  const s = str(v);
  if (isValidDayKey(s)) return s;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? fallback : dayKey(d);
}

export function migrateV2toV3(old: Json, ctx: MigrationContext): { state: AppState; notes: string[] } {
  const now = ctx.now ?? new Date();
  const iso = now.toISOString();
  const today = dayKey(now);
  const base = defaultState();
  const notes: string[] = [];

  const topicProgress: Record<string, TopicProgress> = {};
  let unmatched = 0;
  const done = isObj(old.doneTopics) ? old.doneTopics : {};
  for (const [key, value] of Object.entries(done)) {
    if (!value) continue;
    const id = matchLegacyTopic(key, ctx.topics);
    if (id) topicProgress[id] = { status: 'tamamlandi', startedAt: iso, completedAt: iso };
    else unmatched++;
  }
  if (unmatched) notes.push(`${unmatched} eski konu kaydı yeni müfredatla eşleşmedi.`);

  const tasks: PlanTask[] = arr(old.tasks)
    .filter(isObj)
    .map((t) => ({
      id: t.id != null ? `task_${String(t.id)}` : uid('task'),
      date: legacyDay(t.date, today),
      type: 'ozel' as TaskType,
      title: str(t.text, 'Görev'),
      done: !!t.done,
      createdAt: iso,
    }));

  const mocks: MockExam[] = arr(old.mocks)
    .filter(isObj)
    .map((m) => ({
      id: `mock_${String(m.id ?? uid('m'))}`,
      exam: /ayt/i.test(str(m.name)) ? 'AYT' : 'TYT',
      name: str(m.name, 'Deneme'),
      date: legacyDay(m.date, today),
      sections: [{ key: 'genel', correct: Math.max(0, num(m.correct, 0)), wrong: Math.max(0, num(m.wrong, 0)), blank: 0 }],
      note: 'Eski sürümden aktarıldı (ders dağılımı yok).',
      createdAt: iso,
    }));

  const videos: VideoResource[] = arr(old.videos)
    .filter(isObj)
    .filter((v) => /^https?:\/\//.test(str(v.url)))
    .map((v) => ({
      id: `video_${String(v.id ?? uid('v'))}`,
      title: str(v.title, 'Video'),
      channel: str(v.tag),
      url: str(v.url),
      watched: !!v.watched,
      createdAt: iso,
    }));

  const answered = Math.max(0, num(old.answers, 0));
  const minutes = Math.max(0, num(old.minutes, 0));
  const legacy = answered || minutes ? { answered, correct: Math.min(answered, Math.max(0, num(old.correct, 0))), minutes } : null;
  if (legacy) notes.push('Eski toplam soru/süre değerleri güne atanamadığı için yalnız toplam istatistiğe eklendi.');
  if (arr(old.wrongIds).length) notes.push('Eski soru bankası değiştiği için eski yanlış soru kimlikleri aktarılamadı.');

  const theme: ThemePref = old.theme === 'dark' ? 'dark' : old.theme === 'light' ? 'light' : 'system';
  const state: AppState = {
    ...base,
    profile: {
      ...base.profile,
      name: str(old.studentName),
      dailyQuestionGoal: Math.max(1, num(old.goalQ, base.profile.dailyQuestionGoal)),
    },
    settings: {
      ...base.settings,
      theme,
      focusMinutes: Math.max(5, num(old.focusMin, base.settings.focusMinutes)),
      breakMinutes: Math.max(1, num(old.breakMin, base.settings.breakMinutes)),
    },
    topicProgress,
    tasks,
    mocks,
    videos,
    legacy,
  };
  return { state, notes };
}

// ---------- Temizleme (her yüklemede) ----------

/** Bilinmeyen/bozuk alanları varsayılanlarla doldurur; tip dışı değerleri atar. */
export function sanitize(raw: Json): AppState {
  const base = defaultState();
  const profile = isObj(raw.profile) ? raw.profile : {};
  const settings = isObj(raw.settings) ? raw.settings : {};
  const pomodoro = isObj(raw.pomodoro) ? raw.pomodoro : {};
  const cloudRaw = isObj(settings.cloud) ? settings.cloud : {};
  const themeRaw = settings.theme;
  return {
    ...base,
    schemaVersion: SCHEMA_VERSION,
    profile: {
      ...base.profile,
      ...profile,
      name: str(profile.name),
      dailyQuestionGoal: Math.max(1, num(profile.dailyQuestionGoal, base.profile.dailyQuestionGoal)),
      dailyStudyMinutes: Math.max(10, num(profile.dailyStudyMinutes, base.profile.dailyStudyMinutes)),
      tytTarget: typeof profile.tytTarget === 'number' ? profile.tytTarget : null,
      aytTarget: typeof profile.aytTarget === 'number' ? profile.aytTarget : null,
      examDate: isValidDayKey(profile.examDate) ? profile.examDate : '',
      onboarded: !!profile.onboarded,
    } as AppState['profile'],
    settings: {
      ...base.settings,
      ...settings,
      theme: themeRaw === 'light' || themeRaw === 'dark' || themeRaw === 'system' ? themeRaw : 'system',
      focusMinutes: Math.min(120, Math.max(5, num(settings.focusMinutes, 25))),
      breakMinutes: Math.min(60, Math.max(1, num(settings.breakMinutes, 5))),
      longBreakMinutes: Math.min(90, Math.max(1, num(settings.longBreakMinutes, 15))),
      cyclesBeforeLongBreak: Math.min(10, Math.max(1, num(settings.cyclesBeforeLongBreak, 4))),
      // Eski varsayılan öğretmen adı yeni asistan adına taşınır.
      teacherName:
        (str(settings.teacherName, base.settings.teacherName).slice(0, 40) || base.settings.teacherName).replace(/^Cuma Öğretmen$/, base.settings.teacherName),
      teacherPhotoFocusY: Math.min(100, Math.max(0, num(settings.teacherPhotoFocusY, 35))),
      cloud: {
        projectId: /^[a-z0-9-]{4,40}$/.test(str(cloudRaw.projectId)) ? str(cloudRaw.projectId) : '',
        apiKey: /^[A-Za-z0-9_-]{20,60}$/.test(str(cloudRaw.apiKey)) ? str(cloudRaw.apiKey) : '',
        syncCode: /^[A-Za-z0-9]{20,64}$/.test(str(cloudRaw.syncCode)) ? str(cloudRaw.syncCode) : '',
        shareCode: /^[A-Za-z0-9]{20,64}$/.test(str(cloudRaw.shareCode)) ? str(cloudRaw.shareCode) : '',
      },
      aiServerUrl: /^https:\/\/[^\s]+$/.test(str(settings.aiServerUrl)) ? str(settings.aiServerUrl).slice(0, 200) : '',
    } as AppState['settings'],
    topicProgress: isObj(raw.topicProgress) ? (raw.topicProgress as AppState['topicProgress']) : {},
    attempts: arr(raw.attempts).filter(isObj).filter((a) => typeof a.questionId === 'string' && isValidDayKey(a.day)) as unknown as AppState['attempts'],
    testResults: arr(raw.testResults).filter(isObj) as unknown as AppState['testResults'],
    activeTest: isObj(raw.activeTest) && Array.isArray(raw.activeTest.questionIds) ? (raw.activeTest as unknown as AppState['activeTest']) : null,
    wrongs: isObj(raw.wrongs) ? (raw.wrongs as AppState['wrongs']) : {},
    reviews: isObj(raw.reviews) ? (raw.reviews as AppState['reviews']) : {},
    tasks: arr(raw.tasks).filter(isObj).filter((t) => isValidDayKey(t.date)) as unknown as AppState['tasks'],
    mocks: arr(raw.mocks).filter(isObj).filter((m) => Array.isArray(m.sections)) as unknown as AppState['mocks'],
    studyLog: arr(raw.studyLog).filter(isObj).filter((s) => isValidDayKey(s.day) && typeof s.minutes === 'number') as unknown as AppState['studyLog'],
    videos: arr(raw.videos).filter(isObj).filter((v) => /^https?:\/\//.test(str(v.url))) as unknown as AppState['videos'],
    pomodoro: {
      ...base.pomodoro,
      ...pomodoro,
      phase: pomodoro.phase === 'mola' || pomodoro.phase === 'uzun-mola' ? pomodoro.phase : 'odak',
      running: !!pomodoro.running && typeof pomodoro.endsAt === 'number',
      endsAt: typeof pomodoro.endsAt === 'number' ? pomodoro.endsAt : null,
      remainingMs: Math.max(0, num(pomodoro.remainingMs, base.pomodoro.remainingMs)),
      completedFocusCount: Math.max(0, num(pomodoro.completedFocusCount, 0)),
    } as AppState['pomodoro'],
    chat: arr(raw.chat).filter(isObj) as unknown as AppState['chat'],
    notebookPages: arr(raw.notebookPages).filter(isObj).filter((p) => typeof p.id === 'string') as unknown as AppState['notebookPages'],
    cards: isObj(raw.cards)
      ? (Object.fromEntries(
          Object.entries(raw.cards).filter(
            ([, c]) => isObj(c) && typeof c.box === 'number' && isValidDayKey(c.dueDay) && isValidDayKey(c.lastDay),
          ),
        ) as AppState['cards'])
      : {},
    deleted: isObj(raw.deleted)
      ? (Object.fromEntries(Object.entries(raw.deleted).filter(([, v]) => typeof v === 'string')) as AppState['deleted'])
      : {},
    legacy: isObj(raw.legacy) ? (raw.legacy as unknown as AppState['legacy']) : null,
  };
}

/** Herhangi bir sürümdeki ham veriyi güncel şemaya taşır. */
export function migrate(raw: unknown, ctx: MigrationContext): { state: AppState; report: MigrationReport } {
  const from = detectVersion(raw);
  const notes: string[] = [];
  if (!isObj(raw) || from === 0) {
    return { state: defaultState(), report: { from, to: SCHEMA_VERSION, notes: ['Tanınan veri bulunamadı; yeni profil oluşturuldu.'] } };
  }
  if (from > SCHEMA_VERSION) {
    throw new Error(`Bu yedek daha yeni bir uygulama sürümüne ait (v${from}). Lütfen uygulamayı güncelle.`);
  }
  let current: Json = raw;
  if (from <= 2) {
    const r = migrateV2toV3(raw, ctx);
    current = r.state as unknown as Json;
    notes.push(...r.notes);
  }
  // Gelecekteki sürümler: if (version < 4) current = migrateV3toV4(current) ...
  return { state: sanitize(current), report: { from, to: SCHEMA_VERSION, notes } };
}
