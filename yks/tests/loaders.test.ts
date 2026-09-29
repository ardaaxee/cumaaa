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

  it('sınav seçiliyse yalnız o sınavın derslerini yükler', async () => {
    const qs = await loadQuestionsFor({ exam: 'AYT', subjectId: 'all', topicId: 'all' });
    expect(qs.length).toBeGreaterThan(0);
    expect(qs.every((q) => q.exam === 'AYT')).toBe(true);
  });
});
