/**
 * İçerik (soru/konu paketi) yükleme hatalarının sınıflandırılması.
 * Her tür farklı ele alınır: ağ hatasında yeniden denenir, eski sürümde sayfa bir kez yenilenir,
 * eksik pakette (404) boşuna yeniden denenmez.
 */
export type LoadErrorKind = 'offline' | 'network' | 'timeout' | 'stale' | 'missing' | 'module';

export class ContentLoadError extends Error {
  constructor(
    public kind: LoadErrorKind,
    message: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = 'ContentLoadError';
  }
}

export const LOAD_TIMEOUT_MS = 20_000;

const CHUNK_RE = /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError|Unable to preload CSS|Loading chunk|Failed to load module script/i;

export function isChunkError(err: unknown): boolean {
  if (err instanceof ContentLoadError) return err.kind === 'stale' || err.kind === 'missing' || err.kind === 'network';
  const msg = err instanceof Error ? `${err.name} ${err.message}` : String(err ?? '');
  return CHUNK_RE.test(msg);
}

/** Hata mesajındaki modül adresi (Chrome/Firefox mesajın sonunda verir). */
export function chunkUrlOf(err: unknown): string | null {
  const msg = err instanceof Error ? err.message : String(err ?? '');
  const m = msg.match(/https?:\/\/\S+?\.(?:js|css)/);
  return m ? m[0] : null;
}

function isOnline(): boolean {
  return typeof navigator === 'undefined' || navigator.onLine !== false;
}

/** Bu sayfayı açan ana betiğin adı (ör. assets/index-AbC123.js). Yeni sürümde değişir. */
function currentEntry(): string | null {
  if (typeof document === 'undefined') return null;
  const s = document.querySelector<HTMLScriptElement>('script[type="module"][src]');
  return s ? new URL(s.src).pathname.split('/').pop() ?? null : null;
}

/** Sunucudaki index.html bu sayfanın ana betiğini hâlâ kullanıyor mu? Değilse yeni sürüm yayınlanmış demektir. */
export async function isStaleBuild(): Promise<boolean> {
  const entry = currentEntry();
  if (!entry) return false;
  try {
    const res = await fetch(`./index.html?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return false;
    return !(await res.text()).includes(entry);
  } catch {
    return false;
  }
}

async function urlStatus(url: string): Promise<number | null> {
  try {
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    return res.status;
  } catch {
    return null;
  }
}

/** Ham hatayı türüne ayırır (gerekirse sunucuya küçük bir kontrol isteği atar). */
export async function classifyLoadError(err: unknown): Promise<ContentLoadError> {
  if (err instanceof ContentLoadError) return err;
  if (!isOnline()) return new ContentLoadError('offline', 'İnternet bağlantısı yok.', err);
  if (!isChunkError(err)) return new ContentLoadError('module', 'Soru paketi açılamadı.', err);
  if (await isStaleBuild()) return new ContentLoadError('stale', 'Uygulamanın yeni sürümü bulundu.', err);
  const url = chunkUrlOf(err);
  const status = url ? await urlStatus(url) : null;
  if (status === 404) return new ContentLoadError('missing', 'Bu soru paketi eksik yayınlanmış.', err);
  if (status === null && !isOnline()) return new ContentLoadError('offline', 'İnternet bağlantısı yok.', err);
  return new ContentLoadError('network', 'Bağlantı koptu; soru paketi indirilemedi.', err);
}

/** Kullanıcıya gösterilecek açıklama. */
export function loadErrorText(kind: LoadErrorKind): string {
  switch (kind) {
    case 'offline':
      return 'İnternet bağlantısı yok. Daha önce açtığın konular çevrimdışı da açılır.';
    case 'timeout':
      return 'Soru paketi uzun sürede yüklenemedi. Bağlantın yavaş olabilir.';
    case 'stale':
      return 'Uygulamanın yeni sürümü bulundu. Yenileniyor…';
    case 'missing':
      return 'Bu soru paketi eksik yayınlanmış. Uygulamayı yenilemek çoğu zaman düzeltir.';
    case 'network':
      return 'Bağlantı koptu; soru paketi indirilemedi.';
    default:
      return 'Soru paketi açılamadı.';
  }
}

export function withTimeout<T>(p: Promise<T>, ms = LOAD_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new ContentLoadError('timeout', 'Soru paketi uzun sürede yüklenemedi.')), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

/**
 * Yükler; yalnız geçici hatalarda (ağ, zaman aşımı) bir kez daha dener.
 * Eski sürüm / eksik paket / çevrimdışı durumunda boşuna yeniden denemez.
 */
export async function loadWithPolicy<T>(load: () => Promise<T>, retryDelayMs = 700): Promise<T> {
  try {
    return await withTimeout(load());
  } catch (first) {
    const err = await classifyLoadError(first);
    if (err.kind !== 'network' && err.kind !== 'timeout') throw err;
    await new Promise((r) => setTimeout(r, retryDelayMs));
    try {
      return await withTimeout(load());
    } catch (second) {
      throw await classifyLoadError(second);
    }
  }
}
