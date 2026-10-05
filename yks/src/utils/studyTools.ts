import type { LessonSeed, Question } from '../domain/types';
import type { AppState } from '../store/schema';

export function quizSummary(questions: Pick<Question, 'id' | 'correctAnswer'>[], answers: Record<string, number>) {
  const answered = questions.filter(q => answers[q.id] != null);
  return { answered: answered.length, correct: answered.filter(q => answers[q.id] === q.correctAnswer).length };
}

/** Görevler mevcut çalışma kayıtlarından türetilir; ayrıca ödül veya sayaç yazılmaz. */
export function dailyMissions(state: Pick<AppState, 'attempts' | 'studyLog' | 'cards'>, today: string) {
  const missions = [
    { id: 'questions', title: '5 soru çöz', detail: 'Her cevap bir adım. Yanlışlarını da incele.', target: 5, current: state.attempts.filter(a => a.day === today && a.answer != null).length, href: '#/testler', action: 'Sorulara git', unit: 'soru', icon: '✏️' },
    { id: 'focus', title: '15 dakika çalış', detail: 'Kısa bir odak oturumuyla ritmini bul.', target: 15, current: state.studyLog.filter(s => s.day === today).reduce((sum, s) => sum + Math.max(0, s.minutes), 0), href: '#/odak', action: 'Odaklan', unit: 'dk', icon: '🌿' },
    { id: 'cards', title: '3 bilgi kartını tekrarla', detail: 'Cevabı açmadan önce kendin hatırla.', target: 3, current: Object.values(state.cards).filter(c => c.lastDay === today).length, href: '#/kartlar', action: 'Kartları aç', unit: 'kart', icon: '🧠' },
  ];
  return missions.map(m => ({ ...m, done: m.current >= m.target, current: Math.min(m.current, m.target) }));
}

export function lessonOutline(lesson: LessonSeed) {
  const text = [lesson.intro, lesson.logic, lesson.osymThinking, ...lesson.prerequisites, ...lesson.summary, ...lesson.tips, ...lesson.commonMistakes, ...lesson.concepts.flatMap(c => [c.term, c.definition]), ...lesson.formulas.flatMap(f => [f.expr, f.meaning]), ...lesson.examples.flatMap(e => [e.problem, ...e.steps, e.answer])].join(' ');
  const sections = [
    { id: 'giris', label: 'Giriş' }, { id: 'mantik', label: 'Mantık' },
    { id: 'kavramlar', label: 'Kavramlar' },
    ...(lesson.formulas.length ? [{ id: 'formuller', label: 'Formüller' }] : []),
    { id: 'ornekler', label: 'Örnekler' }, { id: 'hatalar', label: 'Sık hatalar' },
    { id: 'puf', label: 'Püf noktaları' }, { id: 'ozet', label: 'Özet' },
  ];
  return { sections, minutes: Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 180)) };
}
