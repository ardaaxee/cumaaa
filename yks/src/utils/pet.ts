import type { AppState } from '../store/schema';
import { dayKey, type DayKey } from './date';
import { dashboard } from './stats';

/**
 * Panda arkadaş: XP yalnız gerçek çalışmadan hesaplanır (ayrı bir sayaç tutulmaz, hile yapılamaz).
 * Seviye atladıkça aksesuarlar açılır.
 */
export type PetItem = 'kalem' | 'gozluk' | 'papyon' | 'atki' | 'cicek' | 'kulaklik' | 'kep' | 'tac';

export const PET_ITEMS: { id: PetItem; label: string; level: number; icon: string }[] = [
  { id: 'kalem', label: 'Kalem', level: 2, icon: '✏️' },
  { id: 'gozluk', label: 'Gözlük', level: 3, icon: '👓' },
  { id: 'papyon', label: 'Papyon', level: 4, icon: '🎀' },
  { id: 'atki', label: 'Atkı', level: 5, icon: '🧣' },
  { id: 'cicek', label: 'Çiçek taç', level: 6, icon: '🌸' },
  { id: 'kulaklik', label: 'Kulaklık', level: 8, icon: '🎧' },
  { id: 'kep', label: 'Mezuniyet kepi', level: 10, icon: '🎓' },
  { id: 'tac', label: 'Altın taç', level: 12, icon: '👑' },
];

export interface PetStatus {
  xp: number;
  level: number;
  levelStartXp: number;
  nextLevelXp: number;
  mood: 'uykulu' | 'mutlu' | 'coskulu';
  moodText: string;
  todayXp: number;
}

/** Seviye n'e ulaşmak için gereken toplam XP: 60·(n−1)·n/2 (her seviye bir öncekinden biraz uzun). */
export function xpForLevel(level: number): number {
  return (60 * (level - 1) * level) / 2;
}

export function levelForXp(xp: number): number {
  let lvl = 1;
  while (xpForLevel(lvl + 1) <= xp) lvl++;
  return lvl;
}

function xpOf(state: AppState, day?: DayKey): number {
  const attempts = day ? state.attempts.filter((a) => a.day === day) : state.attempts;
  const answered = attempts.filter((a) => a.answer != null);
  const correct = answered.filter((a) => a.correct).length;
  const minutes = (day ? state.studyLog.filter((s) => s.day === day) : state.studyLog).reduce((n, s) => n + s.minutes, 0);
  const cardViews = Object.values(state.cards).reduce((n, c) => n + (day ? (c.lastDay === day ? 1 : 0) : c.seen), 0);
  const tests = (day ? state.testResults.filter((r) => r.day === day) : state.testResults).length;
  const mocks = (day ? state.mocks.filter((m) => m.createdAt.slice(0, 10) === day) : state.mocks).length;
  const topics = Object.values(state.topicProgress).filter((p) => p.status === 'tamamlandi' && (!day || p.completedAt?.slice(0, 10) === day)).length;
  const legacy = day ? 0 : (state.legacy?.answered ?? 0) * 2;
  return answered.length * 2 + correct + minutes + cardViews + tests * 5 + mocks * 30 + topics * 20 + legacy;
}

export function petStatus(state: AppState, today: DayKey = dayKey()): PetStatus {
  const xp = xpOf(state);
  const level = levelForXp(xp);
  const todayXp = xpOf(state, today);
  const d = dashboard(state, today);
  const goalMet = d.todayQuestions >= state.profile.dailyQuestionGoal || d.todayMinutes >= state.profile.dailyStudyMinutes;
  const mood: PetStatus['mood'] = todayXp === 0 ? 'uykulu' : goalMet ? 'coskulu' : 'mutlu';
  const moodText =
    mood === 'uykulu'
      ? 'Panda uyuyor… Birkaç soru çözersen uyanır ♡'
      : mood === 'coskulu'
        ? 'Günlük hedefini tutturdun, panda dans ediyor! 🎉'
        : `Bugün ${todayXp} XP kazandın, panda çok mutlu!`;
  return { xp, level, levelStartXp: xpForLevel(level), nextLevelXp: xpForLevel(level + 1), mood, moodText, todayXp };
}

export function unlockedItems(level: number): PetItem[] {
  return PET_ITEMS.filter((i) => i.level <= level).map((i) => i.id);
}
