import { ContentLoadError, isChunkError } from './loadErrors';

/**
 * Yeni sürüm yayınlandığında açık kalan eski sayfa, artık sunucuda olmayan bir parçayı
 * yüklemeye çalışabilir. Bu durumda "Yeni sürüm bulundu" denir ve sayfa bir kez yenilenir.
 * Sonsuz döngü olmasın diye 60 sn içinde ikinci kez otomatik yenileme yapılmaz.
 */
const KEY = 'iyikiYks.chunkReload';
const GUARD_MS = 60_000;

export { isChunkError };

function lastReload(): number {
  try {
    return Number(sessionStorage.getItem(KEY) || 0);
  } catch {
    return 0;
  }
}

/** Otomatik yenileme şu an yapılabilir mi (döngü koruması)? */
export function canAutoReload(now = Date.now()): boolean {
  return now - lastReload() >= GUARD_MS;
}

function showUpdating(): void {
  if (typeof document === 'undefined') return;
  const el = document.createElement('div');
  el.className = 'update-banner';
  el.setAttribute('role', 'status');
  el.textContent = 'Yeni sürüm bulundu, uygulama yenileniyor…';
  document.body.appendChild(el);
}

/** Güvenli yenileme: kullanıcı verisine dokunmaz, yalnız sayfayı baştan yükler. */
export function safeReload(): void {
  try {
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    /* yok say */
  }
  showUpdating();
  const next = new URL(window.location.href);
  next.searchParams.set('r', Date.now().toString(36));
  window.setTimeout(() => window.location.replace(next.toString()), 600);
}

/**
 * Eski sürüm/eksik parça hatasında sayfayı bir kez yeniler. Yenileme yapıldıysa true döner.
 * Ağ kopması, çevrimdışı ve zaman aşımı için yenilemez (kullanıcıya "Tekrar dene" gösterilir).
 */
export function recoverFromChunkError(err: unknown): boolean {
  if (err instanceof ContentLoadError && err.kind !== 'stale' && err.kind !== 'missing') return false;
  if (!(err instanceof ContentLoadError) && !isChunkError(err)) return false;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return false;
  if (!canAutoReload()) return false;
  safeReload();
  return true;
}

export function installChunkRecovery(): void {
  // Vite, sayfa parçasının ön yüklemesi başarısız olunca bu olayı yayar.
  window.addEventListener('vite:preloadError', (e) => {
    const ev = e as Event & { payload?: unknown };
    if (recoverFromChunkError(ev.payload ?? new Error('Failed to fetch dynamically imported module'))) e.preventDefault();
  });
  window.addEventListener('unhandledrejection', (e) => {
    recoverFromChunkError(e.reason);
  });
}
