/** Net hesaplama: Doğru − Yanlış / 4 (YKS). */

export const WRONG_PENALTY = 4;

export function calcNet(correct: number, wrong: number): number {
  const c = Math.max(0, correct || 0);
  const w = Math.max(0, wrong || 0);
  return round2(c - w / WRONG_PENALTY);
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatNet(n: number): string {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

/** Yüzde (0–100, tam sayı). Payda 0 ise null döner — "veri yok" demektir. */
export function percent(part: number, whole: number): number | null {
  if (!whole) return null;
  return Math.round((part / whole) * 100);
}
