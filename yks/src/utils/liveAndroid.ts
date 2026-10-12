/**
 * Android'de canlı ekran paylaşımı: tarayıcılar (ve uygulamanın web görünümü) telefon ekranını paylaşamaz
 * (getDisplayMedia yok). Paylaşım İyi ki YKS uygulamasının içindeki "Birlikte Canlı" ekranından, aynı şifreli
 * odaya yapılır. Bu modül o ekrana geçişi (intent bağlantısı) ve geçişten sonra aynı telefonun odaya ikinci
 * kez girmesini önleyen "devredildi" kaydını yönetir.
 */
export const ANDROID_APP_PACKAGE = 'io.github.ardaaxee.iyikiyks';
/** Servis çalışanının kapsamı (/yks/) dışında tutulur ki indirme uygulama önbelleğine karışmasın. */
export const ANDROID_APK_URL = 'https://ardaaxee.github.io/cumaaa/indir/iyiki-yks.apk';
const HANDOFF_KEY = 'iyikiYks.liveHandoff.v1';
const IN_APP_KEY = 'iyikiYks.inApp';
/** Uygulamadaki paylaşım bundan uzun sürmez sayılır; sonra sayfa yeniden normal davranır. */
export const HANDOFF_TTL_MS = 6 * 60 * 60 * 1000;

export function isAndroidDevice(ua = typeof navigator === 'undefined' ? '' : navigator.userAgent): boolean {
  return /Android/i.test(ua);
}

/** Sayfa İyi ki YKS uygulamasının (Trusted Web Activity) içinde mi açıldı? İlk açılıştaki referrer oturum boyunca hatırlanır. */
export function isInsideApp(referrer = typeof document === 'undefined' ? '' : document.referrer, storage: Storage | null = safeSession()): boolean {
  try {
    if (referrer.startsWith(`android-app://${ANDROID_APP_PACKAGE}`)) {
      storage?.setItem(IN_APP_KEY, '1');
      return true;
    }
    return storage?.getItem(IN_APP_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Uygulamadaki canlı ekranı açan bağlantı. share=1 ise izin penceresi hemen sorulur.
 * Uygulama yüklü değilse Chrome APK indirme adresine gider.
 */
export function androidLiveIntentUrl(room: string, share: boolean): string {
  const query = `room=${encodeURIComponent(room)}${share ? '&share=1' : ''}`;
  const fallback = encodeURIComponent(ANDROID_APK_URL);
  return `intent://join?${query}#Intent;scheme=ykslive;package=${ANDROID_APP_PACKAGE};S.browser_fallback_url=${fallback};end`;
}

/** Uygulama bağlantısını açar. Uçtan uca testler gerçek dış uygulama açılışı yerine window.__iyikiOpenAppLink ile yakalar. */
export function openAppLink(url: string): void {
  const hook = (window as { __iyikiOpenAppLink?: (u: string) => void }).__iyikiOpenAppLink;
  if (hook) hook(url);
  else window.location.href = url;
}

export type LiveHandoff = { room: string; at: number };

export function saveHandoff(room: string, storage: Storage | null = safeLocal(), now = Date.now()): void {
  try {
    storage?.setItem(HANDOFF_KEY, JSON.stringify({ room, at: now }));
  } catch {
    /* depolama kapalıysa uyarı gösterilmez; paylaşım yine çalışır */
  }
}

/** Bu oda için yakın zamanda uygulamaya devredilmiş bir paylaşım var mı? */
export function readHandoff(room: string, storage: Storage | null = safeLocal(), now = Date.now()): LiveHandoff | null {
  try {
    const parsed = JSON.parse(storage?.getItem(HANDOFF_KEY) ?? 'null') as Partial<LiveHandoff> | null;
    if (!parsed || parsed.room !== room || typeof parsed.at !== 'number') return null;
    if (now - parsed.at > HANDOFF_TTL_MS || parsed.at > now + 60_000) return null;
    return { room: parsed.room, at: parsed.at };
  } catch {
    return null;
  }
}

export function clearHandoff(storage: Storage | null = safeLocal()): void {
  try {
    storage?.removeItem(HANDOFF_KEY);
  } catch {
    /* noop */
  }
}

function safeLocal(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

function safeSession(): Storage | null {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  } catch {
    return null;
  }
}
