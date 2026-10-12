import { describe, expect, it } from 'vitest';
import { loadQuestions } from '../src/data/content';
import { FULL_MOCKS, buildFullMock, mockSectionsFromAnswers, totalQuestions } from '../src/utils/fullMock';

describe('tam deneme', () => {
  it('matches YKS question counts', () => {
    expect(totalQuestions(FULL_MOCKS.TYT)).toBe(120);
    expect(totalQuestions(FULL_MOCKS.AYT)).toBe(80);
  });

  it('builds a full TYT and AYT from the question bank without duplicates', async () => {
    const all = await loadQuestions();
    for (const exam of ['TYT', 'AYT'] as const) {
      const ids = buildFullMock(FULL_MOCKS[exam], all, []);
      expect(ids).toHaveLength(totalQuestions(FULL_MOCKS[exam]));
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('scores sections with blanks', async () => {
    const all = await loadQuestions();
    const ids = buildFullMock(FULL_MOCKS.TYT, all, []);
    const qs = ids.map((id) => all.find((q) => q.id === id)!);
    const answers = { [qs[0].id]: qs[0].correctAnswer, [qs[1].id]: (qs[1].correctAnswer + 1) % 5 };
    const [turkce] = mockSectionsFromAnswers('TYT', qs, answers);
    expect(turkce).toEqual({ key: 'turkce', correct: 1, wrong: 1, blank: 38 });
  });
});
