import { expect, it } from 'vitest';
import { recoveryQuestions } from '../src/utils/recoveryPractice';
import type { Question } from '../src/domain/types';
const q = (id: string, subtopic = 'a', topic = 't') => ({ id, topic, subtopic } as Question);
it('asıl soru ve tekrarlar dışarıda; aynı alt konu önce gelir', () => {
 const source = q('source');
 expect(recoveryQuestions(source, [source, q('other','b'), q('one'), q('one'), q('two'), q('foreign','a','else')], [], () => .5).map(x=>x.id)).toEqual(['one','two','other']);
});
it('aynı alt konuda görülmemiş sorular önce gelir', () => {
 expect(recoveryQuestions(q('source'), [q('seen'),q('new1'),q('new2'),q('new3')], [{questionId:'seen',at:'2026-09-30'}],()=>.5).map(x=>x.id)).not.toContain('seen');
});
it('yetersiz havuzu başka konularla veya kopyalarla doldurmaz', () => {
 expect(recoveryQuestions(q('source'), [q('source'),q('one'),q('one'),q('foreign','a','else')],[])).toEqual([q('one')]);
 expect(recoveryQuestions(q('source'),[q('source')],[])).toEqual([]);
});
