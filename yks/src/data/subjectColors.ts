import type { SubjectId } from '../domain/types';

/**
 * Ders bazlı renk sistemi. Her ders kendi tonunda; konular aynı tonun açık/orta/koyu
 * basamaklarını kullanır (bkz. topicColorStep). Light/dark için ayrı ayrı seçilmiştir.
 */
export interface SubjectColor {
  light: string;
  dark: string;
  /** Rozet/ikon üstünde kullanılacak zemin (yumuşak). */
  softLight: string;
  softDark: string;
}

const C: Record<string, SubjectColor> = {
  mavi: { light: '#2f6fed', dark: '#7fa8ff', softLight: '#e8f0ff', softDark: '#16233f' },
  lacivert: { light: '#2b3a8f', dark: '#8f9dff', softLight: '#e8eaff', softDark: '#1a2050' },
  turuncu: { light: '#e07a1f', dark: '#ffab5c', softLight: '#fff1e2', softDark: '#402508' },
  mor: { light: '#8547c9', dark: '#c9a3f5', softLight: '#f3e9ff', softDark: '#2c1a42' },
  yesil: { light: '#20915a', dark: '#7fd9a8', softLight: '#e4f8ec', softDark: '#123825' },
  zeytin: { light: '#6d7a2c', dark: '#b7c46a', softLight: '#eef2dc', softDark: '#2b3110' },
  kirmizi: { light: '#d13d54', dark: '#ff97a8', softLight: '#ffe9ec', softDark: '#3d1420' },
  kahve: { light: '#8a5a34', dark: '#d8a874', softLight: '#f6ebdf', softDark: '#33220f' },
  turkuaz: { light: '#118a8a', dark: '#6bd6d6', softLight: '#e2f7f7', softDark: '#0e2f2f' },
  koyumor: { light: '#6a3fa0', dark: '#c3a3ec', softLight: '#efe7fb', softDark: '#241636' },
};

export const SUBJECT_COLOR_KEY: Record<SubjectId, keyof typeof C> = {
  'tyt-turkce': 'kirmizi',
  'tyt-matematik': 'mavi',
  'tyt-geometri': 'lacivert',
  'tyt-fizik': 'turuncu',
  'tyt-kimya': 'mor',
  'tyt-biyoloji': 'yesil',
  'tyt-tarih': 'kahve',
  'tyt-cografya': 'turkuaz',
  'tyt-felsefe': 'koyumor',
  'tyt-din': 'zeytin',
  'ayt-matematik': 'mavi',
  'ayt-geometri': 'lacivert',
  'ayt-fizik': 'turuncu',
  'ayt-kimya': 'mor',
  'ayt-biyoloji': 'yesil',
};

export function subjectColor(id: SubjectId): SubjectColor {
  return C[SUBJECT_COLOR_KEY[id]] ?? C.mor;
}

/**
 * Konu için aynı dersin tonunda açık/orta/koyu basamak seçer (index sıraya göre
 * 3'lü döngüyle atanır — konu tanımında ekstra alan gerekmez).
 */
export function topicColorStep(id: SubjectId, index: number): { light: string; dark: string } {
  const base = subjectColor(id);
  const steps = [0.55, 0.8, 1.05];
  const f = steps[index % steps.length];
  return { light: mix(base.light, f), dark: mix(base.dark, f) };
}

function mix(hex: string, factor: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const adjust = (c: number) => (factor <= 1 ? c * factor + 255 * (1 - factor) * 0.15 : clamp(c * (2 - factor)));
  const rr = clamp(adjust(r));
  const gg = clamp(adjust(g));
  const bb = clamp(adjust(b));
  return `#${[rr, gg, bb].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export function subjectColorFor(id: SubjectId, isDark: boolean): { fg: string; soft: string } {
  const c = subjectColor(id);
  return isDark ? { fg: c.dark, soft: c.softDark } : { fg: c.light, soft: c.softLight };
}
