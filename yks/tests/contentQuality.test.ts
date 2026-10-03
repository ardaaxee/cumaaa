import { describe, expect, it } from 'vitest';
import { SUBJECTS } from '../src/data/curriculum';
import { loadSubjectLessons, loadSubjectQuestions } from '../src/data/content';

describe('YKS content quality gate', () => {
  for (const subject of SUBJECTS) {
    it(subject.id + ' için tüm konuların anlatımı ve soru kapsaması var', async () => {
      const lessons = await loadSubjectLessons(subject.id);
      const questions = await loadSubjectQuestions(subject.id);
      const topicIds = subject.units.flatMap((unit) => unit.topics.map((topic) => topic.id));

      const missingLessons = topicIds.filter((id) => !lessons.has(id));
      const counts = new Map<string, number>();
      for (const q of questions) counts.set(q.topic, (counts.get(q.topic) ?? 0) + 1);
      const lowQuestionTopics = topicIds
        .map((id) => ({ id, count: counts.get(id) ?? 0 }))
        .filter((x) => x.count < 5);

      const emptySubtopics = subject.units.flatMap((unit) => unit.topics.flatMap((topic) => topic.subtopics.filter((sub) => !questions.some((q) => q.subtopic === sub.id)).map((sub) => sub.id)));
      expect(emptySubtopics, 'Alt konu filtresi boş: ' + emptySubtopics.join(', ')).toEqual([]);
      expect(missingLessons, 'Konu anlatımı eksik: ' + missingLessons.join(', ')).toEqual([]);
      expect(
        lowQuestionTopics,
        '5 sorudan az konu: ' + lowQuestionTopics.map((x) => x.id + '=' + x.count).join(', '),
      ).toEqual([]);
    });
  }

  it('tüm sorular yapısal kalite kurallarını karşılıyor', async () => {
    const lists = await Promise.all(SUBJECTS.map((subject) => loadSubjectQuestions(subject.id)));
    const questions = lists.flat();
    const ids = new Set<string>();

    for (const q of questions) {
      expect(ids.has(q.id), 'Tekrarlanan soru id: ' + q.id).toBe(false);
      ids.add(q.id);
      expect(q.subtopic, q.id + ' alt konu eşleştirmesi gerekli').toBeTruthy();
      expect(q.options, q.id + ' tam 5 seçenek içermeli').toHaveLength(5);
      expect(q.correctAnswer, q.id + ' doğru cevap 0–4 aralığında olmalı').toBeGreaterThanOrEqual(0);
      expect(q.correctAnswer, q.id + ' doğru cevap 0–4 aralığında olmalı').toBeLessThanOrEqual(4);
      expect(q.question.trim().length, q.id + ' soru metni çok kısa').toBeGreaterThan(12);
      expect(q.solution.trim().length, q.id + ' çözüm çok kısa').toBeGreaterThan(18);
      expect(q.hint.trim().length, q.id + ' ipucu eksik').toBeGreaterThan(5);
      expect(q.commonMistake.trim().length, q.id + ' yaygın hata açıklaması eksik').toBeGreaterThan(5);
      expect(q.outcome.trim().length, q.id + ' kazanım etiketi eksik').toBeGreaterThan(2);
    }

    expect(questions.length).toBeGreaterThan(500);
  });

  it('aynı sorunun seçenek sırası değiştirilerek tekrar eklenmesini önler', async () => {
    const lists = await Promise.all(SUBJECTS.map((subject) => loadSubjectQuestions(subject.id)));
    const seen = new Map<string, string>();
    const duplicates: string[] = [];
    for (const q of lists.flat()) {
      const key = JSON.stringify([q.topic, q.question.trim(), q.premises ?? [], q.table ?? null, [...q.options].sort()]);
      if (seen.has(key)) duplicates.push(seen.get(key)! + ' / ' + q.id);
      seen.set(key, q.id);
    }
    expect(duplicates).toEqual([]);
  });

  it('konu anlatımları profesyonel iskeleti koruyor', async () => {
    for (const subject of SUBJECTS) {
      const lessons = await loadSubjectLessons(subject.id);
      for (const [topicId, lesson] of lessons) {
        expect(lesson.intro.trim().length, topicId + ' giriş eksik').toBeGreaterThan(60);
        expect(lesson.logic.trim().length, topicId + ' mantık bölümü eksik').toBeGreaterThan(60);
        expect(lesson.examples.length, topicId + ' çözümlü örnek yetersiz').toBeGreaterThanOrEqual(2);
        expect(lesson.summary.length, topicId + ' özet yetersiz').toBeGreaterThanOrEqual(3);
        expect(lesson.commonMistakes.length, topicId + ' yaygın hata bölümü yetersiz').toBeGreaterThanOrEqual(2);
        expect(lesson.tips.length, topicId + ' ipucu bölümü yetersiz').toBeGreaterThanOrEqual(2);
        expect(lesson.osymThinking.trim().length, topicId + ' ÖSYM düşünme bölümü eksik').toBeGreaterThan(40);
      }
    }
  });
});
