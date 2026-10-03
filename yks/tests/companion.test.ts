import { expect, it } from 'vitest';
import { companionLines } from '../src/services/companion';
import { defaultState } from '../src/store/schema';

it('puts the page-specific line first and uses her name', () => {
  const s = { ...defaultState(), profile: { ...defaultState().profile, name: 'Zeynep' } };
  const noon = new Date(2026, 8, 28, 13, 0);
  expect(companionLines('/konu/aytmat-turev', s, noon)[0]).toContain('Konu açıklaması için öğretmen');
  expect(companionLines('/', s, noon)[0]).toContain('Zeynep');
});
