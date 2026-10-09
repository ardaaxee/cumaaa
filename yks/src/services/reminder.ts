/**
 * Günlük çalışma hatırlatıcısı (cihaza özel, sunucu gerektirmez):
 * 1) Takvim dosyası (.ics): telefonun kendi takvimi her gün seçilen saatte bildirim verir — en güvenilir yol.
 * 2) Uygulama açıkken tarayıcı bildirimi.
 */
const KEY = 'iyikiYks.hatirlatma';

export function getReminderTime(): string {
  try {
    const v = localStorage.getItem(KEY) ?? '';
    return /^\d{2}:\d{2}$/.test(v) ? v : '';
  } catch {
    return '';
  }
}

export function setReminderTime(v: string): void {
  try {
    if (v) localStorage.setItem(KEY, v);
    else localStorage.removeItem(KEY);
  } catch {
    /* yok say */
  }
  window.dispatchEvent(new CustomEvent('iyiki:reminder'));
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Her gün tekrar eden, 0 dk önce uyaran bir takvim etkinliği üretir. */
export function buildIcs(time: string, appUrl: string, now: Date = new Date()): string {
  const [h, m] = time.split(':').map(Number);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
  const dt = `${start.getFullYear()}${pad(start.getMonth() + 1)}${pad(start.getDate())}T${pad(h)}${pad(m)}00`;
  const end = `${start.getFullYear()}${pad(start.getMonth() + 1)}${pad(start.getDate())}T${pad((h + (m + 30 >= 60 ? 1 : 0)) % 24)}${pad((m + 30) % 60)}00`;
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//iyiki-yks//TR',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:iyiki-yks-hatirlatma-${time.replace(':', '')}@iyiki`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${dt}`,
    `DTEND:${end}`,
    'RRULE:FREQ=DAILY',
    'SUMMARY:📚 YKS çalışma zamanı ♡',
    `DESCRIPTION:Bugünkü kartların\\, tekrarların ve planın seni bekliyor. ${appUrl}`,
    `URL:${appUrl}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:YKS çalışma zamanı ♡',
    'TRIGGER:-PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadIcs(time: string): void {
  const url = `${location.origin}${location.pathname}`;
  const blob = new Blob([buildIcs(time, url)], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'yks-hatirlatici.ics';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export function msUntil(time: string, now: Date = new Date()): number {
  const [h, m] = time.split(':').map(Number);
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

// ---------- "Ana ekrana ekle" ----------

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: InstallPromptEvent | null = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallPromptEvent;
    window.dispatchEvent(new CustomEvent('iyiki:installable'));
  });
}

export function canInstall(): boolean {
  return !!deferred;
}

export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  await deferred.prompt();
  const { outcome } = await deferred.userChoice;
  deferred = null;
  return outcome === 'accepted';
}

export function isStandalone(): boolean {
  return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}
