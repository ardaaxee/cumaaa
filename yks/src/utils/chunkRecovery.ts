/**
 * Dinamik içerik parçası (chunk) hatalarını sınıflandırır ve yeni sürüm yayınlandıktan
 * sonra açık kalmış sekmeyi yalnız bir kez güvenli şekilde yeniler.
 */
const KEY = 'iyikiYks.chunkReload';
const NOTICE_KEY = 'iyikiYks.chunkNotice';
const RELOAD_GUARD_MS = 30_000;

export type ContentLoadIssue =
  | 'offline'
  | 'stale-chunk'
  | 'not-found'
  | 'timeout'
  | 'network'
  | 'module'
  | 'unknown';

function errorText(err: unknown): string {
  return err instanceof Error ? `${err.name} ${err.message}` : String(err ?? '');
}

export function classifyContentLoadError(err: unknown): ContentLoadIssue {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'offline';
  const msg = errorText(err);

  if (/ContentTimeoutError|zaman aşım|timeout/i.test(msg)) return 'timeout';
  if (/404|not found/i.test(msg)) return 'not-found';
  if (
    /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError|Unable to preload CSS|Loading chunk/i.test(
      msg,
    )
  ) {
    return 'stale-chunk';
  }
  if (/Failed to fetch|NetworkError|ERR_NETWORK|Load failed|fetch/i.test(msg)) return 'network';
  if (/SyntaxError|module script|Unexpected token/i.test(msg)) return 'module';
  return 'unknown';
}

export function isChunkError(err: unknown): boolean {
  const issue = classifyContentLoadError(err);
  return issue === 'stale-chunk' || issue === 'not-found';
}

export function describeContentLoadError(err: unknown): string {
  switch (classifyContentLoadError(err)) {
    case 'offline':
      return 'İnternet bağlantısı yok. Daha önce açtığın içerikler çevrimdışı kullanılabilir; yeni soru paketi için bağlantı gerekiyor.';
    case 'stale-chunk':
      return 'Uygulamanın yeni sürümü bulundu. Sayfa yenilenerek güncel soru paketi açılacak.';
    case 'not-found':
      return 'Bu soru paketi yayında bulunamadı. Uygulamayı yenileyip tekrar dene.';
    case 'timeout':
      return 'Soru paketi uzun sürede yüklenemedi. Bağlantını kontrol edip tekrar dene.';
    case 'network':
      return 'Soru paketi indirilemedi. İnternet bağlantını kontrol edip tekrar dene.';
    case 'module':
      return 'Soru paketi tarayıcı tarafından açılamadı. Uygulamayı yenileyip tekrar dene.';
    default:
      return 'Sorular yüklenemedi. Tekrar dene; sorun sürerse uygulamayı yenile.';
  }
}

/** Yenileme başlatıldıysa true döner. Sonsuz yenileme döngüsünü engeller. */
export function recoverFromChunkError(err: unknown): boolean {
  if (!isChunkError(err) || typeof window === 'undefined') return false;

  let last = 0;
  try {
    last = Number(window.sessionStorage.getItem(KEY) || 0);
  } catch {
    // sessionStorage kapalı olabilir.
  }
  if (Date.now() - last < RELOAD_GUARD_MS) return false;

  try {
    window.sessionStorage.setItem(KEY, String(Date.now()));
    window.sessionStorage.setItem(NOTICE_KEY, 'Yeni sürüm bulundu; uygulama güncellendi.');
  } catch {
    // sessionStorage kapalı olabilir.
  }
  window.location.reload();
  return true;
}

export function consumeChunkRecoveryNotice(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.sessionStorage.getItem(NOTICE_KEY);
    if (value) window.sessionStorage.removeItem(NOTICE_KEY);
    return value;
  } catch {
    return null;
  }
}

export function installChunkRecovery(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('vite:preloadError', (event) => {
    const preloadEvent = event as Event & { payload?: unknown };
    if (recoverFromChunkError(preloadEvent.payload ?? new Error('Failed to fetch dynamically imported module'))) {
      event.preventDefault();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    recoverFromChunkError(event.reason);
  });
}
