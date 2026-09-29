import type { Exam, Question, SubjectId } from '../domain/types';
import type { MockSection, QuestionAttempt } from '../store/schema';
import { pickQuestions } from './testEngine';

/**
 * Uygulama içi tam deneme: YKS'deki soru sayısı ve süreyle (TYT 120 soru / 165 dk,
 * AYT Sayısal 80 soru / 180 dk). Sorular bu uygulamanın özgün ÖSYM tarzı sorularıdır.
 */
export interface FullMockPart {
  section: string;
  label: string;
  subjects: { subjectId: SubjectId; count: number }[];
}

export interface FullMockPlan {
  exam: Exam;
  title: string;
  durationMin: number;
  parts: FullMockPart[];
}

export const FULL_MOCKS: Record<Exam, FullMockPlan> = {
  TYT: {
    exam: 'TYT',
    title: 'TYT Denemesi',
    durationMin: 165,
    parts: [
      { section: 'turkce', label: 'Türkçe', subjects: [{ subjectId: 'tyt-turkce', count: 40 }] },
      {
        section: 'sosyal',
        label: 'Sosyal Bilimler',
        subjects: [
          { subjectId: 'tyt-tarih', count: 5 },
          { subjectId: 'tyt-cografya', count: 5 },
          { subjectId: 'tyt-felsefe', count: 5 },
          { subjectId: 'tyt-din', count: 5 },
        ],
      },
      {
        section: 'matematik',
        label: 'Temel Matematik',
        subjects: [
          { subjectId: 'tyt-matematik', count: 30 },
          { subjectId: 'tyt-geometri', count: 10 },
        ],
      },
      {
        section: 'fen',
        label: 'Fen Bilimleri',
        subjects: [
          { subjectId: 'tyt-fizik', count: 7 },
          { subjectId: 'tyt-kimya', count: 7 },
          { subjectId: 'tyt-biyoloji', count: 6 },
        ],
      },
    ],
  },
  AYT: {
    exam: 'AYT',
    title: 'AYT Sayısal Denemesi',
    durationMin: 180,
    parts: [
      {
        section: 'matematik',
        label: 'Matematik',
        subjects: [
          { subjectId: 'ayt-matematik', count: 30 },
          { subjectId: 'ayt-geometri', count: 10 },
        ],
      },
      { section: 'fizik', label: 'Fizik', subjects: [{ subjectId: 'ayt-fizik', count: 14 }] },
      { section: 'kimya', label: 'Kimya', subjects: [{ subjectId: 'ayt-kimya', count: 13 }] },
      { section: 'biyoloji', label: 'Biyoloji', subjects: [{ subjectId: 'ayt-biyoloji', count: 13 }] },
    ],
  },
};

export function totalQuestions(plan: FullMockPlan): number {
  return plan.parts.reduce((n, p) => n + p.subjects.reduce((m, s) => m + s.count, 0), 0);
}

/** Her ders için görülmemiş soruları öne alarak deneme sırasını oluşturur (bölüm sırası korunur). */
export function buildFullMock(plan: FullMockPlan, all: Question[], attempts: QuestionAttempt[]): string[] {
  const ids: string[] = [];
  for (const part of plan.parts) {
    for (const s of part.subjects) {
      const pool = all.filter((q) => q.subject === s.subjectId);
      if (s.subjectId === 'tyt-fizik' || s.subjectId === 'ayt-fizik') {
        const preferredTypes = new Set(['islem', 'yorum', 'grafik', 'cok-adimli', 'yeni-nesil']);
        const preferred = pool.filter((q) => preferredTypes.has(q.type));
        const preferredCount = Math.min(s.count, Math.ceil(s.count * 0.8));
        const first = pickQuestions(preferred, preferredCount, attempts);
        const used = new Set(first);
        const rest = pickQuestions(pool.filter((q) => !used.has(q.id)), s.count - first.length, attempts);
        ids.push(...first, ...rest);
      } else {
        ids.push(...pickQuestions(pool, s.count, attempts));
      }
    }
  }
  return ids;
}

export function sectionOfSubject(exam: Exam, subjectId: SubjectId): string | null {
  return FULL_MOCKS[exam].parts.find((p) => p.subjects.some((s) => s.subjectId === subjectId))?.section ?? null;
}

/** Deneme sonucunu, deneme kayıtlarındaki bölüm yapısına çevirir. */
export function mockSectionsFromAnswers(exam: Exam, questions: Question[], answers: Record<string, number | null>): MockSection[] {
  return FULL_MOCKS[exam].parts.map((p) => {
    const qs = questions.filter((q) => sectionOfSubject(exam, q.subject) === p.section);
    let correct = 0;
    let wrong = 0;
    for (const q of qs) {
      const a = answers[q.id];
      if (a == null) continue;
      if (a === q.correctAnswer) correct++;
      else wrong++;
    }
    return { key: p.section, correct, wrong, blank: qs.length - correct - wrong };
  });
}
