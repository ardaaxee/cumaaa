import { allTopics, getSubject, getTopicRef, subjectTopics } from '../data/curriculum';
import type { Difficulty, SubjectId } from '../domain/types';
import type { AppState, PlanTask, QuestionAttempt } from '../store/schema';
import type { NewTask } from '../store/actions';
import { addDays, dayKey, diffDays, type DayKey } from '../utils/date';
import { dueReviews } from '../utils/srs';

export type MasteryBand = 'yeni' | 'kritik' | 'gelisiyor' | 'iyi' | 'guclu';

export interface TopicMastery {
  topicId: string;
  subjectId: SubjectId;
  score: number;
  confidence: number;
  band: MasteryBand;
  attempts: number;
  recentAttempts: number;
  accuracy: number | null;
  recentAccuracy: number | null;
  openWrongs: number;
  reviewDue: boolean;
  daysSincePractice: number | null;
  recommendedDifficulty: Difficulty;
  reason: string;
}

export interface SubjectMastery {
  subjectId: SubjectId;
  score: number;
  confidence: number;
  attemptedTopics: number;
  totalTopics: number;
  weakestTopicId?: string;
}

const DIFF_WEIGHT: Record<Difficulty, number> = {
  kolay: 0.92,
  orta: 1,
  zor: 1.08,
  'yeni-nesil': 1.12,
};

const clamp = (n: number, a = 0, b = 100) => Math.max(a, Math.min(b, n));

function accuracy(list: QuestionAttempt[]): number | null {
  const answered = list.filter((a) => a.answer != null);
  if (!answered.length) return null;
  return Math.round((answered.filter((a) => a.correct).length / answered.length) * 100);
}

function lastPracticeDay(attempts: QuestionAttempt[], topicId: string): DayKey | null {
  const days = attempts.filter((a) => a.topicId === topicId).map((a) => a.day).sort();
  return days[days.length - 1] ?? null;
}

function bandOf(score: number, confidence: number): MasteryBand {
  if (confidence < 18) return 'yeni';
  if (score < 42) return 'kritik';
  if (score < 62) return 'gelisiyor';
  if (score < 82) return 'iyi';
  return 'guclu';
}

export function difficultyForMastery(score: number, confidence = 100): Difficulty {
  if (confidence < 20 || score < 42) return 'kolay';
  if (score < 70) return 'orta';
  if (score < 88) return 'zor';
  return 'yeni-nesil';
}

/**
 * Konu hakimiyeti yalnız öğrencinin kendi verisinden türetilir.
 * Son denemeler daha ağır basar; açık yanlış ve gecikmiş tekrar puanı aşağı çeker.
 */
export function topicMastery(state: AppState, topicId: string, today: DayKey = dayKey()): TopicMastery {
  const ref = getTopicRef(topicId);
  const topicAttempts = state.attempts.filter((a) => a.topicId === topicId && a.answer != null);
  const recent = topicAttempts.slice(-12);
  const acc = accuracy(topicAttempts);
  const recentAcc = accuracy(recent);
  const openWrongs = Object.values(state.wrongs).filter((w) => w.topicId === topicId && !w.learned).length;
  const reviewDue = !!state.reviews[topicId] && state.reviews[topicId].dueDay <= today;
  const lastDay = lastPracticeDay(state.attempts, topicId);
  const daysSincePractice = lastDay ? Math.max(0, diffDays(lastDay, today)) : null;

  let weightedCorrect = 0;
  let weightedTotal = 0;
  for (let i = 0; i < recent.length; i++) {
    const a = recent[i];
    const recency = 0.55 + ((i + 1) / recent.length) * 0.45;
    const w = recency * DIFF_WEIGHT[a.difficulty];
    weightedTotal += w;
    if (a.correct) weightedCorrect += w;
  }

  const observed = weightedTotal ? (weightedCorrect / weightedTotal) * 100 : 0;
  const status = state.topicProgress[topicId]?.status;
  const statusBase = status === 'tamamlandi' ? 72 : status === 'calisiliyor' ? 45 : 22;
  const evidence = clamp(topicAttempts.length * 10, 0, 85);
  let score = topicAttempts.length ? statusBase * (1 - evidence / 100) + observed * (evidence / 100) : statusBase;
  score -= Math.min(24, openWrongs * 6);
  if (reviewDue) score -= 7;
  if (daysSincePractice != null && daysSincePractice >= 14) score -= Math.min(12, Math.floor(daysSincePractice / 7) * 2);
  score = Math.round(clamp(score));

  const confidence = Math.round(clamp(topicAttempts.length * 9 + (status === 'tamamlandi' ? 12 : 0), 0, 100));
  const band = bandOf(score, confidence);
  const recommendedDifficulty = difficultyForMastery(score, confidence);
  const reason =
    confidence < 18
      ? 'Bu konuda henüz yeterli çözüm verisi yok.'
      : openWrongs
        ? `${openWrongs} açık yanlış ve son performansına göre.`
        : reviewDue
          ? 'Tekrar tarihi geldi; hakimiyeti tazelemek gerekiyor.'
          : recentAcc != null
            ? `Son sorularda doğruluk %${recentAcc}.`
            : 'Konu ilerlemesi ve çözüm geçmişine göre.';

  return {
    topicId,
    subjectId: ref?.subject.id ?? (state.profile.hardestSubject || 'tyt-matematik'),
    score,
    confidence,
    band,
    attempts: topicAttempts.length,
    recentAttempts: recent.length,
    accuracy: acc,
    recentAccuracy: recentAcc,
    openWrongs,
    reviewDue,
    daysSincePractice,
    recommendedDifficulty,
    reason,
  };
}

export function allMastery(state: AppState, today: DayKey = dayKey()): TopicMastery[] {
  return allTopics().map((r) => topicMastery(state, r.topic.id, today));
}

export function subjectMastery(state: AppState, subjectId: SubjectId, today: DayKey = dayKey()): SubjectMastery {
  const topics = subjectTopics(subjectId);
  const rows = topics.map((t) => topicMastery(state, t.id, today));
  const withEvidence = rows.filter((r) => r.confidence > 0);
  const score = withEvidence.length
    ? Math.round(withEvidence.reduce((s, r) => s + r.score * Math.max(0.25, r.confidence / 100), 0) / withEvidence.reduce((s, r) => s + Math.max(0.25, r.confidence / 100), 0))
    : 0;
  const confidence = topics.length ? Math.round(clamp((withEvidence.length / topics.length) * 70 + (withEvidence.reduce((s, r) => s + r.confidence, 0) / Math.max(1, topics.length)) * 0.3)) : 0;
  const weakest = withEvidence.slice().sort((a, b) => a.score - b.score || b.confidence - a.confidence)[0];
  return { subjectId, score, confidence, attemptedTopics: withEvidence.length, totalTopics: topics.length, weakestTopicId: weakest?.topicId };
}

function priorityScore(state: AppState, row: TopicMastery): number {
  const ref = getTopicRef(row.topicId);
  const profileHard = state.profile.hardestSubject === row.subjectId ? 12 : 0;
  const priority = ref?.topic.priority ? 7 : 0;
  const incomplete = state.topicProgress[row.topicId]?.status !== 'tamamlandi' ? 9 : 0;
  const evidenceNeed = row.confidence < 18 ? 8 : 0;
  return (100 - row.score) + row.openWrongs * 10 + (row.reviewDue ? 18 : 0) + profileHard + priority + incomplete + evidenceNeed;
}

export function nextBestTopics(state: AppState, limit = 6, today: DayKey = dayKey()): TopicMastery[] {
  return allMastery(state, today)
    .filter((r) => !!getTopicRef(r.topicId))
    .sort((a, b) => priorityScore(state, b) - priorityScore(state, a))
    .slice(0, limit);
}

export interface AdaptivePlanSummary {
  tasks: NewTask[];
  focusTopics: TopicMastery[];
  explanation: string;
}

/** Öğrencinin güncel hakimiyet verisine göre 7 günlük çalışma planı üretir. */
export function buildAdaptivePlan(state: AppState, startDay: DayKey = dayKey(), days = 7): AdaptivePlanSummary {
  const focus = nextBestTopics(state, Math.max(5, days), startDay);
  const tasks: NewTask[] = [];
  const dailyMin = Math.max(45, state.profile.dailyStudyMinutes);
  const dailyQ = Math.max(10, state.profile.dailyQuestionGoal);
  const due = new Set(dueReviews(state.reviews, startDay).map((r) => r.topicId));

  for (let i = 0; i < days; i++) {
    const date = addDays(startDay, i);
    const row = focus[i % Math.max(1, focus.length)];
    if (!row) break;
    const ref = getTopicRef(row.topicId);
    if (!ref) continue;

    const lessonMin = Math.max(15, Math.round(dailyMin * (row.score < 55 ? 0.4 : 0.28)));
    const testMin = Math.max(20, Math.round(dailyMin * 0.38));
    const q = Math.max(8, Math.min(35, Math.round(dailyQ * (row.score < 55 ? 0.45 : 0.58))));

    tasks.push({
      date,
      type: 'konu',
      title: `Akıllı · ${ref.subject.name}: ${ref.topic.name} konu çalışması`,
      subjectId: row.subjectId,
      topicId: row.topicId,
      estMinutes: lessonMin,
    });
    tasks.push({
      date,
      type: 'test',
      title: `Akıllı · ${ref.topic.name} · ${row.recommendedDifficulty} seviye test`,
      subjectId: row.subjectId,
      topicId: row.topicId,
      targetQuestions: q,
      estMinutes: testMin,
    });

    if (row.openWrongs > 0) {
      tasks.push({ date, type: 'yanlis', title: `Akıllı · ${ref.topic.name} yanlışlarını yeniden çöz`, subjectId: row.subjectId, topicId: row.topicId, estMinutes: 12 });
    } else if (due.has(row.topicId) || i > 0) {
      tasks.push({ date, type: 'tekrar', title: `Akıllı · ${ref.topic.name} kısa tekrar`, subjectId: row.subjectId, topicId: row.topicId, estMinutes: 10 });
    }
  }

  // Haftada bir gerçek süreli deneme: mevcut özel görevleri silmeden plana eklenir.
  const mockDay = addDays(startDay, Math.min(days - 1, 6));
  if (days >= 4) {
    tasks.push({ date: mockDay, time: '10:00', type: 'deneme', title: 'Akıllı · Süreli TYT denemesi', estMinutes: 165 });
    tasks.push({ date: mockDay, type: 'yanlis', title: 'Akıllı · Deneme yanlışlarını analiz et', estMinutes: 25 });
  }

  const lead = focus[0];
  const explanation = lead
    ? `Plan; ${getTopicRef(lead.topicId)?.topic.name ?? lead.topicId} başta olmak üzere düşük hakimiyet, açık yanlış, tekrar zamanı ve kişisel hedeflerini birlikte dikkate alıyor.`
    : 'Plan günlük hedeflerine göre dengelendi. Daha fazla soru çözdükçe kişiselleştirme güçlenir.';

  return { tasks, focusTopics: focus, explanation };
}

export function replaceFutureSmartTasks(existing: PlanTask[], fresh: NewTask[], from: DayKey = dayKey()): PlanTask[] {
  // Bu yardımcı sadece önizleme/karar için kullanılır; gerçek ekleme store action ile yapılır.
  return existing.filter((t) => !(t.date >= from && !t.done && t.title.startsWith('Akıllı ·'))).concat(
    fresh.map((t, i) => ({ ...t, id: `smart-preview-${i}`, done: false, createdAt: new Date().toISOString() })),
  );
}

export function studyBrief(state: AppState, today: DayKey = dayKey()): string {
  const top = nextBestTopics(state, 3, today);
  if (!top.length) return 'Henüz yeterli veri yok; kısa bir seviye tespit testiyle başlayabilirsin.';
  return top
    .map((r) => {
      const ref = getTopicRef(r.topicId);
      return `${ref?.subject.name ?? r.subjectId} / ${ref?.topic.name ?? r.topicId}: hakimiyet %${r.score}, ${r.reason}`;
    })
    .join(' | ');
}

export function subjectLabelSafe(subjectId: SubjectId): string {
  const s = getSubject(subjectId);
  return s ? `${s.exam} ${s.name}` : subjectId;
}


export interface SubjectMomentum {
  subjectId: SubjectId;
  recentAccuracy: number | null;
  previousAccuracy: number | null;
  delta: number | null;
  label: 'yukseliyor' | 'dusuyor' | 'stabil' | 'veri-yok';
  explanation: string;
}

/** Son 20 cevaplanan soru ile önceki 20'yi karşılaştırır; neden değiştiğini veriyle açıklar. */
export function subjectMomentum(state: AppState, subjectId: SubjectId): SubjectMomentum {
  const all = state.attempts.filter((a) => a.subjectId === subjectId && a.answer != null);
  const recent = all.slice(-20);
  const previous = all.slice(Math.max(0, all.length - 40), Math.max(0, all.length - 20));
  const r = accuracy(recent);
  const p = accuracy(previous);
  if (r == null) {
    return { subjectId, recentAccuracy: null, previousAccuracy: null, delta: null, label: 'veri-yok', explanation: 'Henüz karşılaştırma için soru verisi yok.' };
  }
  if (p == null || previous.length < 5) {
    return { subjectId, recentAccuracy: r, previousAccuracy: p, delta: null, label: 'veri-yok', explanation: 'Trend için biraz daha soru çözmen gerekiyor.' };
  }
  const delta = r - p;
  const label = delta >= 5 ? 'yukseliyor' : delta <= -5 ? 'dusuyor' : 'stabil';
  const recentWrongs = recent.filter((a) => !a.correct).length;
  const slow = recent.filter((a) => a.timeMs > 120_000).length;
  const explanation =
    label === 'yukseliyor'
      ? `Son 20 soruda doğruluk %${r}; önceki gruba göre +${delta} puan.`
      : label === 'dusuyor'
        ? `Son 20 soruda doğruluk %${r}; önceki gruba göre ${delta} puan. ${recentWrongs} yanlış${slow ? `, ${slow} soruda 2 dakikadan uzun süre` : ''} görüldü.`
        : `Son 20 soruda doğruluk %${r}; önceki gruba göre belirgin değişim yok.`;
  return { subjectId, recentAccuracy: r, previousAccuracy: p, delta, label, explanation };
}
