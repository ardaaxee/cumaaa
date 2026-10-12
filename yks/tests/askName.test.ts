import { expect, it } from 'vitest';
import { dative } from '../src/components/AskName';

it('builds Turkish dative for names', () => {
  expect(dative('Cuma')).toBe('Cuma’ya');
  expect(dative('Deniz')).toBe('Deniz’e');
  expect(dative('Arda')).toBe('Arda’ya');
  expect(dative('Emre')).toBe('Emre’ye');
});
