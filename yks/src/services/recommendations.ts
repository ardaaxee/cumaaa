import type { Exam, SubjectId } from '../domain/types';
import type { AppState } from '../store/schema';
import { recentTopicPerformance, weakTopics } from '../utils/analysis';
import { dayKey, type DayKey } from '../utils/date';
import { analyzeMocks } from '../utils/mock';
import { formatNet } from '../utils/net';
import { dueReviews } from '../utils/srs';
import { attemptsOn, minutesOn, solved } from '../utils/stats';

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
  | { kind: 'first-test' }
  | { kind: 'focus' };

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
      basis: weak.reasons.join(', '),
      action: { kind: 'topic-test', topicId: weak.topicId, difficulty: 'orta' },
      actionLabel: '10 soru çöz',
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

  const todayMinutes = minutesOn(state.studyLog, today);
  const goal = state.profile.dailyStudyMinutes;
  if (hasAnyData(state) && goal > 0 && todayMinutes < goal) {
    recs.push({
      id: 'time',
      title: `Bugün ${todayMinutes} / ${goal} dk çalıştın`,
      detail: `Günlük hedefine ${goal - todayMinutes} dk kaldı. Bir odak seansı başlat.`,
      basis: 'Pomodoro / çalışma kayıtları',
      action: { kind: 'focus' },
      actionLabel: 'Odak başlat',
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

  return recs;
}
