import { describe, expect, it } from 'vitest';
import { loadQuestionsByIds, loadQuestionsFor, loadSubjectQuestions, subjectOfQuestionId } from '../src/data/content';

describe('kapsamlı soru yükleyiciler', () => {
  it('soru kimliğinden dersi bulur', async () => {
    const [q] = await loadSubjectQuestions('tyt-fizik');
    expect(subjectOfQuestionId(q.id)).toBe('tyt-fizik');
    expect(subjectOfQuestionId('olmayan-konu-q01')).toBeUndefined();
  });

  it('yalnız istenen soruları kimlikle getirir', async () => {
    const fizik = await loadSubjectQuestions('tyt-fizik');
    const kimya = await loadSubjectQuestions('ayt-kimya');
    const ids = [fizik[0].id, kimya[1].id, 'olmayan-konu-q01'];
    const map = await loadQuestionsByIds(ids);
    expect([...map.keys()].sort()).toEqual([fizik[0].id, kimya[1].id].sort());
  });

  it('konu seçiliyse yalnız o dersin sorularını yükler', async () => {
    const fizik = await loadSubjectQuestions('tyt-fizik');
    const qs = await loadQuestionsFor({ exam: 'all', subjectId: 'all', topicId: fizik[0].topic });
    expect(qs.every((q) => q.subject === 'tyt-fizik')).toBe(true);
  });

  it('sınav seçiliyse yalnız o sınavın derslerinden yükler', async () => {
    const qs = await loadQuestionsFor({ exam: 'AYT', subjectId: 'all', topicId: 'all' });
    expect(qs.length).toBeGreaterThan(0);
    expect(qs.every((q) => q.exam === 'AYT')).toBe(true);
  });
});

import { LESSON_FILES, QUESTION_INDEX } from '../src/data/contentIndex.generated';
import { allTopics } from '../src/data/curriculum';
import { filesForScope, lessonFileNames, loadLesson, loadTopicQuestions, questionFileNames, MIXED_SUBJECTS } from '../src/data/content';
import { summarizePool } from '../src/data/questionCounts';
import { SUBJECTS } from '../src/data/curriculum';

describe('üretilmiş içerik dizini', () => {
  const files = new Set(questionFileNames());

  it('her soru dosyası adı gerçek bir yükleyiciye karşılık gelir', () => {
    for (const [topic, entry] of Object.entries(QUESTION_INDEX)) for (const f of entry.f) expect(files.has(f), `${topic} → ${f}`).toBe(true);
    const lessons = new Set(lessonFileNames());
    for (const [topic, f] of Object.entries(LESSON_FILES)) expect(lessons.has(f), `${topic} → ${f}`).toBe(true);
  });

  it('her konu en az bir soru dosyasına ve bir konu anlatımına bağlı', () => {
    for (const ref of allTopics()) {
      expect(QUESTION_INDEX[ref.topic.id]?.f.length ?? 0, ref.topic.id).toBeGreaterThan(0);
      expect(LESSON_FILES[ref.topic.id], ref.topic.id).toBeTruthy();
    }
  });

  it('dizindeki sayılar gerçek soru sayısıyla birebir aynı', async () => {
    const all = (await Promise.all(SUBJECTS.map((s) => loadSubjectQuestions(s.id)))).flat();
    const real = new Map<string, number>();
    for (const q of all) real.set(q.topic, (real.get(q.topic) ?? 0) + 1);
    for (const [topic, entry] of Object.entries(QUESTION_INDEX)) {
      expect(entry.n, topic).toBe(real.get(topic) ?? 0);
      expect(Object.values(entry.k).reduce((a, b) => a + b, 0), topic).toBe(entry.n);
    }
    expect(Object.keys(QUESTION_INDEX).sort()).toEqual([...real.keys()].sort());
  });

  it('konu soruları yalnız o konunun dosyalarından gelir ve eksiksizdir', async () => {
    const topic = allTopics()[5].topic.id;
    const qs = await loadTopicQuestions(topic);
    expect(qs.length).toBe(QUESTION_INDEX[topic].n);
    expect(qs.every((q) => q.topic === topic)).toBe(true);
    expect(filesForScope({ exam: 'all', subjectId: 'all', topicId: topic })).toEqual(QUESTION_INDEX[topic].f);
    expect((await loadLesson(topic))?.topicId).toBe(topic);
  });

  it('karışık seçimde tüm banka değil, en fazla birkaç dersin dosyaları seçilir', () => {
    const picked = filesForScope({ exam: 'TYT', subjectId: 'all', topicId: 'all' });
    const subjects = new Set(picked.map((f) => SUBJECTS.find((s) => f === s.id || f.startsWith(s.id + '-'))?.id));
    expect(subjects.size).toBeLessThanOrEqual(MIXED_SUBJECTS);
    expect([...subjects].every((s) => s?.startsWith('tyt-'))).toBe(true);
    expect(picked.length).toBeLessThan(questionFileNames().length / 2);
  });

  it('Testler ekranı sayımı gerçek filtreyle aynı sonucu verir', async () => {
    const topic = allTopics().find((t) => t.subject.id === 'tyt-matematik')!.topic;
    const qs = await loadTopicQuestions(topic.id);
    const base = { exam: 'all', subjectId: 'all', topicId: topic.id, subtopicId: 'all', difficulty: 'all', type: 'all' };
    expect(summarizePool(base).total).toBe(qs.length);
    const sub = topic.subtopics[0].id;
    expect(summarizePool({ ...base, subtopicId: sub }).total).toBe(qs.filter((q) => q.subtopic === sub).length);
    expect(summarizePool({ ...base, difficulty: 'orta' }).total).toBe(qs.filter((q) => q.difficulty === 'orta').length);
    expect(summarizePool({ ...base, type: 'islem' }).total).toBe(qs.filter((q) => q.type === 'islem').length);
    const tytTotal = summarizePool({ ...base, topicId: 'all', exam: 'TYT' }).total;
    expect(tytTotal).toBe(Object.entries(QUESTION_INDEX).filter(([t]) => t.startsWith('tyt')).reduce((n, [, e]) => n + e.n, 0));
  });
});
