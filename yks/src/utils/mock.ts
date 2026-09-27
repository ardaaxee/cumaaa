import type { Exam } from '../domain/types';
import type { MockExam, MockSection } from '../store/schema';
import { calcNet, round2 } from './net';

export interface MockSectionDef {
  key: string;
  label: string;
  questions: number;
}

/** YKS test yapısı (Sayısal öğrenci için). */
export const MOCK_SECTIONS: Record<Exam, MockSectionDef[]> = {
  TYT: [
    { key: 'turkce', label: 'Türkçe', questions: 40 },
    { key: 'sosyal', label: 'Sosyal Bilimler', questions: 20 },
    { key: 'matematik', label: 'Temel Matematik', questions: 40 },
    { key: 'fen', label: 'Fen Bilimleri', questions: 20 },
  ],
  AYT: [
    { key: 'matematik', label: 'Matematik', questions: 40 },
    { key: 'fizik', label: 'Fizik', questions: 14 },
    { key: 'kimya', label: 'Kimya', questions: 13 },
    { key: 'biyoloji', label: 'Biyoloji', questions: 13 },
  ],
};

export const LEGACY_SECTION: MockSectionDef = { key: 'genel', label: 'Genel (eski kayıt)', questions: 0 };

export function sectionDef(exam: Exam, key: string): MockSectionDef {
  return MOCK_SECTIONS[exam].find((s) => s.key === key) ?? LEGACY_SECTION;
}

export function sectionNet(s: MockSection): number {
  return calcNet(s.correct, s.wrong);
}

export function mockNet(m: MockExam): number {
  return round2(m.sections.reduce((sum, s) => sum + sectionNet(s), 0));
}

export function mockTotals(m: MockExam): { correct: number; wrong: number; blank: number } {
  return m.sections.reduce(
    (acc, s) => ({ correct: acc.correct + s.correct, wrong: acc.wrong + s.wrong, blank: acc.blank + s.blank }),
    { correct: 0, wrong: 0, blank: 0 },
  );
}

export interface SectionInput {
  key: string;
  correct: number;
  wrong: number;
}

/** Deneme girişini doğrular; boş sayısını otomatik hesaplar. Hata varsa mesaj listesi döner. */
export function buildSections(exam: Exam, inputs: SectionInput[]): { sections: MockSection[]; errors: string[] } {
  const errors: string[] = [];
  const sections: MockSection[] = MOCK_SECTIONS[exam].map((def) => {
    const input = inputs.find((i) => i.key === def.key) ?? { key: def.key, correct: 0, wrong: 0 };
    const correct = Math.floor(Number(input.correct) || 0);
    const wrong = Math.floor(Number(input.wrong) || 0);
    if (correct < 0 || wrong < 0) errors.push(`${def.label}: negatif değer girilemez.`);
    if (correct + wrong > def.questions) errors.push(`${def.label}: doğru + yanlış ${def.questions} soruyu geçemez.`);
    return { key: def.key, correct: Math.max(0, correct), wrong: Math.max(0, wrong), blank: Math.max(0, def.questions - correct - wrong) };
  });
  return { sections, errors };
}

/** Basit doğrusal eğim (en küçük kareler). Değerler zaman sırasına göre verilir. */
export function trendSlope(values: number[]): number | null {
  const n = values.length;
  if (n < 2) return null;
  const xs = values.map((_, i) => i);
  const mx = (n - 1) / 2;
  const my = values.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (values[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  return den ? num / den : null;
}

export interface SectionAnalysis {
  key: string;
  label: string;
  average: number;
  /** Ortalama net / soru sayısı (0–1). */
  ratio: number;
  slope: number | null;
  series: number[];
}

/** Aynı sınav türündeki denemeler için ders bazlı analiz (tarih sırasına göre). */
export function analyzeMocks(exam: Exam, mocks: MockExam[]): SectionAnalysis[] {
  const list = sortMocks(mocks.filter((m) => m.exam === exam));
  if (!list.length) return [];
  return MOCK_SECTIONS[exam].map((def) => {
    const series = list
      .map((m) => m.sections.find((s) => s.key === def.key))
      .filter((s): s is MockSection => !!s)
      .map(sectionNet);
    const average = series.length ? round2(series.reduce((a, b) => a + b, 0) / series.length) : 0;
    return {
      key: def.key,
      label: def.label,
      average,
      ratio: def.questions ? average / def.questions : 0,
      slope: trendSlope(series),
      series,
    };
  }).filter((a) => a.series.length > 0);
}

export function sortMocks(mocks: MockExam[]): MockExam[] {
  return mocks.slice().sort((a, b) => (a.date === b.date ? a.createdAt.localeCompare(b.createdAt) : a.date.localeCompare(b.date)));
}
