import type { AppState } from '../store/schema';
import { dayKey, type DayKey } from './date';
import { dashboard } from './stats';

/** Rozetler yalnızca öğrencinin gerçek verisinden hesaplanır; hiçbiri elle verilmez. */
export interface Badge {
  id: string;
  icon: string;
  title: string;
  desc: string;
  current: number;
  target: number;
}

export interface BadgeStatus extends Badge {
  earned: boolean;
  pct: number;
}

function perfectTests(state: AppState): number {
  return state.testResults.filter((r) => r.questionIds.length >= 10 && r.correct === r.questionIds.length).length;
}

function hourCount(state: AppState, from: number, to: number): number {
  return state.attempts.filter((a) => {
    const h = new Date(a.at).getHours();
    return from <= to ? h >= from && h < to : h >= from || h < to;
  }).length;
}

export function computeBadges(state: AppState, today: DayKey = dayKey()): BadgeStatus[] {
  const d = dashboard(state, today);
  const cards = Object.values(state.cards);
  const learnedCards = cards.filter((c) => c.box >= 4).length;
  const learnedWrongs = Object.values(state.wrongs).filter((w) => w.learned).length;
  const subjectsTouched = new Set(state.attempts.map((a) => a.subjectId)).size;
  const list: Badge[] = [
    { id: 'ilk-soru', icon: '🐣', title: 'İlk adım', desc: 'İlk sorunu çöz', current: d.totalQuestions, target: 1 },
    { id: 'soru-100', icon: '🐰', title: 'Tavşan hızı', desc: '100 soru çöz', current: d.totalQuestions, target: 100 },
    { id: 'soru-500', icon: '🦊', title: 'Kurnaz tilki', desc: '500 soru çöz', current: d.totalQuestions, target: 500 },
    { id: 'soru-1000', icon: '🐼', title: 'Bin soru pandası', desc: '1000 soru çöz', current: d.totalQuestions, target: 1000 },
    { id: 'seri-3', icon: '🔥', title: 'Isınıyoruz', desc: '3 gün üst üste çalış', current: d.streak, target: 3 },
    { id: 'seri-7', icon: '🌟', title: 'Bir hafta!', desc: '7 gün üst üste çalış', current: d.streak, target: 7 },
    { id: 'seri-30', icon: '🏆', title: 'Demir irade', desc: '30 gün üst üste çalış', current: d.streak, target: 30 },
    { id: 'test-1', icon: '📝', title: 'İlk test', desc: 'Bir testi bitir', current: state.testResults.length, target: 1 },
    { id: 'test-20', icon: '📚', title: 'Test kurdu', desc: '20 test bitir', current: state.testResults.length, target: 20 },
    { id: 'tam-isabet', icon: '🎯', title: 'Tam isabet', desc: 'En az 10 soruluk bir testte hepsini doğru yap', current: perfectTests(state), target: 1 },
    { id: 'konu-1', icon: '🌱', title: 'İlk konu', desc: 'Bir konuyu tamamla', current: d.completedTopics, target: 1 },
    { id: 'konu-25', icon: '🌳', title: 'Konu ağacı', desc: '25 konu tamamla', current: d.completedTopics, target: 25 },
    { id: 'deneme-1', icon: '🐱', title: 'Deneme kedisi', desc: 'İlk denemeni kaydet', current: d.mockCount, target: 1 },
    { id: 'deneme-10', icon: '🦁', title: 'Deneme aslanı', desc: '10 deneme kaydet', current: d.mockCount, target: 10 },
    { id: 'kart-50', icon: '🃏', title: 'Kart meraklısı', desc: '50 bilgi kartı çalış', current: cards.length, target: 50 },
    { id: 'kart-ogren', icon: '🧠', title: 'Hafıza ustası', desc: '30 kartı öğrenildi seviyesine getir', current: learnedCards, target: 30 },
    { id: 'yanlis-10', icon: '🩹', title: 'Yanlış avcısı', desc: '10 yanlışını öğrenilmiş hâle getir', current: learnedWrongs, target: 10 },
    { id: 'odak-10', icon: '⏱️', title: 'Odak ninjası', desc: 'Toplam 10 saat çalış', current: d.totalMinutes, target: 600 },
    { id: 'odak-50', icon: '🐻', title: 'Sabırlı ayı', desc: 'Toplam 50 saat çalış', current: d.totalMinutes, target: 3000 },
    { id: 'her-ders', icon: '🌈', title: 'Gökkuşağı', desc: '8 farklı dersten soru çöz', current: subjectsTouched, target: 8 },
    { id: 'erkenci', icon: '🌅', title: 'Erkenci kuş', desc: 'Sabah 5–8 arası 20 soru çöz', current: hourCount(state, 5, 8), target: 20 },
    { id: 'gece', icon: '🦉', title: 'Gece kuşu', desc: 'Gece 23–02 arası 20 soru çöz', current: hourCount(state, 23, 2), target: 20 },
    { id: 'defter', icon: '✏️', title: 'Defter sever', desc: '5 defter sayfası oluştur', current: state.notebookPages.length, target: 5 },
  ];
  return list.map((b) => ({ ...b, earned: b.current >= b.target, pct: Math.min(100, Math.round((b.current / b.target) * 100)) }));
}
