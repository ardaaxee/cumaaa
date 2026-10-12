/**
 * Tarih yardımcıları. Tüm gün hesapları cihazın YEREL saatine göredir.
 * (Eski sürümde toISOString() UTC gününü verdiği için gece yarısından sonra
 * günlük istatistikler yanlış güne yazılıyordu.)
 */

export type DayKey = string; // "YYYY-MM-DD" (yerel)

const pad = (n: number) => String(n).padStart(2, '0');

export function dayKey(date: Date = new Date()): DayKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDay(key: DayKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(key: DayKey, days: number): DayKey {
  const d = parseDay(key);
  d.setDate(d.getDate() + days);
  return dayKey(d);
}

/** b − a (gün). Yaz saati geçişlerinden etkilenmemek için öğlen saatine göre hesaplanır. */
export function diffDays(a: DayKey, b: DayKey): number {
  const da = parseDay(a);
  const db = parseDay(b);
  da.setHours(12);
  db.setHours(12);
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

export function isValidDayKey(key: unknown): key is DayKey {
  if (typeof key !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  return dayKey(parseDay(key)) === key;
}

/** Pazartesi ile başlayan haftanın ilk günü. */
export function startOfWeek(key: DayKey): DayKey {
  const d = parseDay(key);
  const dow = (d.getDay() + 6) % 7; // Pazartesi = 0
  return addDays(key, -dow);
}

export function weekDays(key: DayKey): DayKey[] {
  const start = startOfWeek(key);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** Son n gün (bugün dahil), eskiden yeniye. */
export function lastNDays(n: number, today: DayKey = dayKey()): DayKey[] {
  return Array.from({ length: n }, (_, i) => addDays(today, i - (n - 1)));
}

export function formatDay(key: DayKey, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }): string {
  return parseDay(key).toLocaleDateString('tr-TR', opts);
}

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h) return `${h} sa ${m} dk`;
  if (m) return `${m} dk ${s} sn`;
  return `${s} sn`;
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function formatMinutes(min: number): string {
  const m = Math.round(min);
  if (m < 60) return `${m} dk`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} sa ${r} dk` : `${h} sa`;
}
