import type { Exam, SubjectId } from '../domain/types';
import type { AppState } from '../store/schema';
import { recentTopicPerformance, weakTopics } from '../utils/analysis';
import { dayKey, diffDays, type DayKey } from '../utils/date';
import { analyzeMocks } from '../utils/mock';
import { formatNet } from '../utils/net';
import { dueReviews } from '../utils/srs';
import { attemptsOn, solved } from '../utils/stats';

/**
 * Akıllı çalışma önerisi. Yalnız kullanıcının gerçek verisinden üretilir;
 * veri yoksa öneri uydurulmaz, "yeterli veri yok" denir.
 */

export type RecommendationAction =
  | { kind: 'topic'; topicId: string }
  | { kind: 'topic-test'; topicId: string; difficulty?: 'orta' }
  | { kind: 'wrongs' }
  | { kind: 'reviews' }
  | { kind: 'mocks' }
  | { kind: 'first-test' };

export interface Recommendation {
  id: string;
  title: string;
  detail: string;
  basis: string;
  action: RecommendationAction;
  actionLabel: string;
}

export interface CurriculumLookup {
  topicName(topicId: string): string;
  subjectName(subjectId: SubjectId): string;
  /** Dersin müfredat sırasındaki konu kimlikleri. */
  subjectTopicIds(subjectId: SubjectId): string[];
}

export function hasAnyData(state: AppState): boolean {
  return state.attempts.length > 0 || state.mocks.length > 0 || state.studyLog.length > 0 || Object.keys(state.topicProgress).length > 0;
}

export function buildRecommendations(state: AppState, lookup: CurriculumLookup, today: DayKey = dayKey()): Recommendation[] {
  const recs: Recommendation[] = [];

  const due = dueReviews(state.reviews, today);
  if (due.length) {
    const names = due.slice(0, 3).map((r) => lookup.topicName(r.topicId)).join(', ');
    recs.push({
      id: 'reviews',
      title: `Bugün ${due.length} konu tekrarın var`,
      detail: `${names}${due.length > 3 ? ' ve diğerleri' : ''}. Her biri için 10–15 dk özet + mini test yeterli.`,
      basis: 'Aralıklı tekrar takvimi (1-3-7-14-30 gün)',
      action: { kind: 'reviews' },
      actionLabel: 'Tekrarlara git',
    });
  }

  for (const weak of weakTopics(state).slice(0, 2)) {
    const perf = recentTopicPerformance(state.attempts, weak.topicId, 3);
    const name = lookup.topicName(weak.topicId);
    const basis =
      perf.total > 0
        ? `Son ${perf.sessions} testte ${name} konusunda ${perf.total} sorudan ${perf.correct} doğru (doğruluk %${perf.accuracy}).`
        : `${name} konusunda ${weak.openWrongs} çözülmemiş yanlış.`;
    recs.push({
      id: `weak-${weak.topicId}`,
      title: `${name}: zayıf konu`,
      detail: `${basis} Bugün 20 dakika konu tekrarı + 10 orta seviye ${name} sorusu öneriliyor.`,
      basis: perf.total > 0 ? `Son ${perf.total} soruda %${perf.accuracy}` : weak.reasons.join(', '),
      action: { kind: 'topic-test', topicId: weak.topicId, difficulty: 'orta' },
      actionLabel: '10 soru çöz',
    });
  }

  // Uzun süredir dokunulmayan (başlanmış/tamamlanmış) konular: unutma eğrisi.
  const lastTouch = new Map<string, DayKey>();
  for (const a of state.attempts) if ((lastTouch.get(a.topicId) ?? '') < a.day) lastTouch.set(a.topicId, a.day);
  const stale = Object.entries(state.topicProgress)
    .filter(([id, p]) => p.status !== 'baslanmadi' && !state.reviews[id])
    .map(([id, p]) => ({ id, last: lastTouch.get(id) ?? (p.completedAt ?? p.startedAt ?? '').slice(0, 10) }))
    .filter((t) => t.last && diffDays(t.last as DayKey, today) >= STALE_DAYS)
    .sort((a, b) => a.last.localeCompare(b.last))[0];
  if (stale) {
    const days = diffDays(stale.last as DayKey, today);
    recs.push({
      id: `stale-${stale.id}`,
      title: `${lookup.topicName(stale.id)}: unutmadan tekrar et`,
      detail: `Bu konuya ${days} gündür dokunmadın. 5 soruluk kısa bir tekrar hafızanı tazeler.`,
      basis: `${days} gündür tekrar edilmedi`,
      action: { kind: 'topic-test', topicId: stale.id },
      actionLabel: '5 dk tekrar',
    });
  }

  const planToday = state.tasks.filter((t) => t.date === today && !t.done && t.topicId)[0];
  if (planToday?.topicId) {
    recs.push({
      id: `plan-${planToday.id}`,
      title: planToday.title,
      detail: 'Bugünkü planında bu konu var.',
      basis: 'Bugünkü planda',
      action: { kind: 'topic', topicId: planToday.topicId },
      actionLabel: 'Konuyu aç',
    });
  }

  const openWrongs = Object.values(state.wrongs).filter((w) => !w.learned).length;
  if (openWrongs >= 5) {
    recs.push({
      id: 'wrongs',
      title: `Yanlışlar defterinde ${openWrongs} soru bekliyor`,
      detail: 'Bugün 15 dakika ayırıp bu soruları yeniden çöz; öğrendiklerini "Öğrendim" olarak işaretle.',
      basis: 'Yanlışlar defteri',
      action: { kind: 'wrongs' },
      actionLabel: 'Yanlışlara git',
    });
  }

  for (const exam of ['TYT', 'AYT'] as Exam[]) {
    const recent = state.mocks.filter((m) => m.exam === exam).sort((a, b) => a.date.localeCompare(b.date)).slice(-3);
    const analysis = analyzeMocks(exam, recent).filter((a) => a.key !== 'genel');
    if (!analysis.length) continue;
    const weakest = analysis.slice().sort((a, b) => a.ratio - b.ratio)[0];
    recs.push({
      id: `mock-${exam}`,
      title: `${exam} denemelerinde en düşük oran: ${weakest.label}`,
      detail: `Son ${recent.length} ${exam} denemesinde ${weakest.label} ortalaman ${formatNet(weakest.average)} net. Bu hafta bu derse ek konu tekrarı planla.`,
      basis: `${exam} deneme kayıtları`,
      action: { kind: 'mocks' },
      actionLabel: 'Denemeleri incele',
    });
  }

  const todaySolved = solved(attemptsOn(state.attempts, today)).length;
  if (hasAnyData(state) && todaySolved < state.profile.dailyQuestionGoal) {
    recs.push({
      id: 'questions',
      title: `Bugün ${todaySolved} / ${state.profile.dailyQuestionGoal} soru`,
      detail: `Günlük soru hedefine ${state.profile.dailyQuestionGoal - todaySolved} soru kaldı.`,
      basis: 'Test kayıtları',
      action: { kind: 'first-test' },
      actionLabel: 'Test çöz',
    });
  }

  const hardest = state.profile.hardestSubject;
  if (hardest) {
    const next = lookup.subjectTopicIds(hardest).find((id) => state.topicProgress[id]?.status !== 'tamamlandi');
    if (next) {
      recs.push({
        id: 'hardest',
        title: `${lookup.subjectName(hardest)}: sıradaki konu`,
        detail: `En zorlandığın ders olarak ${lookup.subjectName(hardest)} seçtin. Sıradaki tamamlanmamış konu: ${lookup.topicName(next)}.`,
        basis: 'Başlangıçta verdiğin bilgi + konu ilerlemen',
        action: { kind: 'topic', topicId: next },
        actionLabel: 'Konuyu aç',
      });
    }
  }

  // Sınava az kaldıysa gerekçeye eklenir.
  const left = state.profile.examDate ? diffDays(today, state.profile.examDate) : null;
  if (left != null && left >= 0 && left <= 60) for (const r of recs) r.basis = `${r.basis} · sınava ${left} gün`;
  return recs;
}

const STALE_DAYS = 7;
const PRIORITY = ['reviews', 'weak-', 'stale-', 'plan-', 'wrongs', 'hardest', 'questions', 'mock-'];

/** "Bugün ne çalışayım?": en fazla 3 öneri, en acil olandan; her birinin gerekçesi `basis`te. */
export function whatToStudyToday(state: AppState, lookup: CurriculumLookup, today: DayKey = dayKey(), max = 3): Recommendation[] {
  const rank = (r: Recommendation) => {
    const i = PRIORITY.findIndex((p) => r.id === p || r.id.startsWith(p));
    return i < 0 ? PRIORITY.length : i;
  };
  return buildRecommendations(state, lookup, today)
    .map((r, i) => ({ r, i }))
    .sort((a, b) => rank(a.r) - rank(b.r) || a.i - b.i)
    .slice(0, max)
    .map((x) => x.r);
}
