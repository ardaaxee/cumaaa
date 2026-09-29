import { allTopics } from '../data/curriculum';
import { migrate, type MigrationContext, type MigrationReport } from './migrations';
import { SCHEMA_VERSION, defaultState, type AppState } from './schema';

export const STORAGE_KEY = 'iyikiYks.state.v3';
export const LEGACY_KEY = 'iyikiYksV2';
export const BACKUP_APP_ID = 'iyi-ki-yks';

export function migrationContext(): MigrationContext {
  return { topics: allTopics().map((r) => ({ id: r.topic.id, subjectId: r.subject.id, name: r.topic.name })) };
}

function safeGet(storage: Storage | undefined, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export interface LoadResult {
  state: AppState;
  report: MigrationReport | null;
  error: string | null;
}

/** Kayıtlı durumu yükler; yoksa eski sürüm verisini taşır; o da yoksa yeni profil açar. */
export function loadState(storage: Storage | undefined = globalThis.localStorage, ctx: MigrationContext = migrationContext()): LoadResult {
  const current = safeGet(storage, STORAGE_KEY);
  const legacy = current ? null : safeGet(storage, LEGACY_KEY);
  const text = current ?? legacy;
  if (!text) return { state: defaultState(), report: null, error: null };
  try {
    const { state, report } = migrate(JSON.parse(text), ctx);
    return { state, report: report.from !== SCHEMA_VERSION ? report : null, error: null };
  } catch (e) {
    return { state: defaultState(), report: null, error: e instanceof Error ? e.message : 'Kayıtlı veri okunamadı.' };
  }
}

/** Durumu kaydeder. Depolama doluysa false döner (veri bellekte kalır). */
export function saveState(state: AppState, storage: Storage | undefined = globalThis.localStorage): boolean {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export interface BackupFile {
  app: typeof BACKUP_APP_ID;
  schemaVersion: number;
  exportedAt: string;
  state: AppState;
  teacherPhoto: string | null;
  /** Dijital defter çizimleri: sayfa id -> PNG data URL. Eski yedeklerde bulunmayabilir. */
  notebookImages?: Record<string, string>;
}

export function createBackup(
  state: AppState,
  teacherPhoto: string | null,
  notebookImages: Record<string, string> = {},
  now: Date = new Date(),
): BackupFile {
  return {
    app: BACKUP_APP_ID,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: now.toISOString(),
    state,
    teacherPhoto,
    notebookImages,
  };
}

/**
 * Yedek dosyasını okur. Hem bu sürümün yedeğini hem de eski sürümün
 * düz JSON dışa aktarımını kabul eder.
 */
export function parseBackup(
  text: string,
  ctx: MigrationContext = migrationContext(),
): { state: AppState; teacherPhoto: string | null; notebookImages: Record<string, string>; report: MigrationReport } {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('Dosya geçerli bir JSON değil.');
  }
  if (typeof raw !== 'object' || raw === null) throw new Error('Yedek dosyası tanınmadı.');
  const wrapper = raw as Partial<BackupFile>;
  const payload = wrapper.app === BACKUP_APP_ID ? wrapper.state : raw;
  const { state, report } = migrate(payload, ctx);
  if (report.from === 0) throw new Error('Bu dosyada İyi ki • YKS verisi bulunamadı.');
  const photo = typeof wrapper.teacherPhoto === 'string' && wrapper.teacherPhoto.startsWith('data:image/') ? wrapper.teacherPhoto : null;
  const notebookImages =
    wrapper.app === BACKUP_APP_ID && wrapper.notebookImages && typeof wrapper.notebookImages === 'object'
      ? Object.fromEntries(
          Object.entries(wrapper.notebookImages).filter(
            ([id, value]) => typeof id === 'string' && typeof value === 'string' && value.startsWith('data:image/'),
          ),
        )
      : {};
  return { state, teacherPhoto: photo, notebookImages, report };
}


/**
 * Yalnız İyi ki • YKS verilerini temizler.
 * Aynı GitHub Pages alan adındaki diğer projelerin localStorage verilerine dokunmaz.
 */
export async function clearAppData(storage: Storage | undefined = globalThis.localStorage): Promise<void> {
  try {
    if (storage) {
      const keys: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && (key === LEGACY_KEY || key === STORAGE_KEY || key.startsWith('iyikiYks.'))) keys.push(key);
      }
      for (const key of keys) storage.removeItem(key);
    }
  } catch {
    // Depolama erişimi engelliyse IndexedDB temizleme yine denenir.
  }

  if (typeof indexedDB !== 'undefined') {
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase('iyiki-yks');
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => resolve();
    });
  }
}
