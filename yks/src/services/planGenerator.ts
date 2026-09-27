import type { SubjectId } from '../domain/types';
import type { NewTask } from '../store/actions';
import type { Profile, TopicProgress } from '../store/schema';
import { addDays, parseDay, type DayKey } from '../utils/date';

/**
 * İlk açılış bilgilerine göre 7 günlük başlangıç planı üretir.
 * Günlük süre hedefi konu çalışması + test + tekrar arasında paylaştırılır.
 */

export interface PlanLookup {
  subjectTopicIds(subjectId: SubjectId): string[];
  topicName(topicId: string): string;
  subjectName(subjectId: SubjectId): string;
}

const SAYISAL_ROTATION: SubjectId[] = [
  'ayt-matematik',
  'ayt-fizik',
  'tyt-turkce',
  'ayt-kimya',
  'tyt-matematik',
  'ayt-biyoloji',
  'ayt-geometri',
];

export function subjectRotation(hardest: SubjectId | ''): SubjectId[] {
  if (!hardest) return SAYISAL_ROTATION;
  // En zorlanılan ders her iki günde bir tekrar gelir.
  const others = SAYISAL_ROTATION.filter((s) => s !== hardest);
  return [hardest, others[0], hardest, others[1], others[2], hardest, others[3]];
}

export function generateStarterPlan(
  profile: Profile,
  progress: Record<string, TopicProgress>,
  lookup: PlanLookup,
  startDay: DayKey,
): NewTask[] {
  const rotation = subjectRotation(profile.hardestSubject);
  const used = new Set<string>();
  const tasks: NewTask[] = [];
  const minutes = Math.max(30, profile.dailyStudyMinutes);
  const questions = Math.max(5, profile.dailyQuestionGoal);

  for (let i = 0; i < 7; i++) {
    const date = addDays(startDay, i);
    const subjectId = rotation[i % rotation.length];
    const topicId = lookup
      .subjectTopicIds(subjectId)
      .find((id) => progress[id]?.status !== 'tamamlandi' && !used.has(id));
    const isSunday = parseDay(date).getDay() === 0;

    if (isSunday) {
      tasks.push({
        date,
        time: '10:00',
        type: 'deneme',
        title: 'Haftalık deneme (TYT) ve sonuç girişi',
        estMinutes: 165,
      });
      tasks.push({ date, type: 'yanlis', title: 'Denemedeki yanlışları analiz et', estMinutes: Math.round(minutes * 0.25) });
      continue;
    }

    if (topicId) {
      used.add(topicId);
      tasks.push({
        date,
        type: 'konu',
        title: `${lookup.subjectName(subjectId)}: ${lookup.topicName(topicId)} konu çalışması`,
        subjectId,
        topicId,
        estMinutes: Math.round(minutes * 0.4),
      });
      tasks.push({
        date,
        type: 'test',
        title: `${lookup.topicName(topicId)} test`,
        subjectId,
        topicId,
        targetQuestions: Math.min(40, Math.max(10, Math.round(questions / 2))),
        estMinutes: Math.round(minutes * 0.35),
      });
    }
    if (i > 0) {
      tasks.push({ date, type: 'yanlis', title: 'Yanlışlarımı tekrar çöz', estMinutes: Math.round(minutes * 0.15) });
    }
    tasks.push({ date, type: 'tekrar', title: 'Günün tekrarları (Bugün tekrar etmen gerekenler)', estMinutes: Math.round(minutes * 0.1) });
  }
  return tasks;
}
