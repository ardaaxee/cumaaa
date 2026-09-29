/**
 * Yeni sürüm yayınlandığında açık kalan eski sayfa, artık sunucuda olmayan bir parçayı
 * (konu/soru dosyası) yüklemeye çalışabilir. Bu durumda sayfa bir kez kendini yeniler ve
 * güncel sürüme geçer; sonsuz döngüye girmemek için 30 sn içinde ikinci kez yenilemez.
 */
const KEY = 'iyikiYks.chunkReload';

export function isChunkError(err: unknown): boolean {
  const msg = err instanceof Error ? `${err.name} ${err.message}` : String(err ?? '');
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError|Unable to preload CSS|Loading chunk/i.test(msg);
}

/** Yenileme yapıldıysa true döner. */
export function recoverFromChunkError(err: unknown): boolean {
  if (!isChunkError(err)) return false;
  let last = 0;
  try {
    last = Number(sessionStorage.getItem(KEY) || 0);
  } catch {
    /* yok say */
  }
  if (Date.now() - last < 30_000) return false;
  try {
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    /* yok say */
  }
  window.location.reload();
  return true;
}

export function installChunkRecovery(): void {
  // Vite, önceden yükleme başarısız olunca bu olayı yayar.
  window.addEventListener('vite:preloadError', (e) => {
    const ev = e as Event & { payload?: unknown };
    if (recoverFromChunkError(ev.payload ?? new Error('Failed to fetch dynamically imported module'))) e.preventDefault();
  });
  window.addEventListener('unhandledrejection', (e) => {
    recoverFromChunkError(e.reason);
  });
}
