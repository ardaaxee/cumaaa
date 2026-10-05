// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { SolutionBlock } from '../src/components/QuestionView';
import type { Question } from '../src/domain/types';

let root: Root;
let host: HTMLDivElement;
const question: Question = {
  id: 'guided-example', topic: 'tytmat-temel', subject: 'tyt-matematik', exam: 'TYT', unit: '',
  sourceType: 'ozgun-pratik', createdAt: '', outcome: 'Birinci dereceden denklem çözer.',
  difficulty: 'kolay', type: 'islem', question: '2x + 4 = 10 ise x kaçtır?',
  options: ['1', '2', '3', '4', '5'], correctAnswer: 2,
  solution: '1. Her iki taraftan 4 çıkar: 2x = 6.\n2. Her iki tarafı 2’ye böl: x = 3.',
  hint: 'İşlemi iki tarafa da uygula.', commonMistake: 'Yalnız bir taraftan 4 çıkarmak.',
};

beforeEach(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
  await act(async () => root.render(createElement(SolutionBlock, { q: question })));
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });

async function click(text: string) {
  const button = [...host.querySelectorAll('button')].find(b => b.textContent?.includes(text));
  expect(button).toBeTruthy();
  await act(async () => button!.click());
}

it('keeps the full solution available and can reveal one step at a time', async () => {
  expect(host.querySelectorAll('.solution-steps li')).toHaveLength(2);
  expect(host.querySelector('.solution-answer')?.textContent).toContain('C · 3');
  await click('Adım adım incele');
  expect(host.querySelectorAll('.solution-steps li')).toHaveLength(1);
  await click('Sonraki çözüm adımı');
  expect(host.querySelectorAll('.solution-steps li')).toHaveLength(2);
  expect(host.textContent).not.toContain('Sonraki çözüm adımı');
  await click('Tüm çözümü göster');
  expect(host.querySelectorAll('.solution-steps li')).toHaveLength(2);
});

it('resets step navigation when a different question is shown', async () => {
  await click('Adım adım incele');
  await act(async () => root.render(createElement(SolutionBlock, { q: { ...question, id: 'next-question' } })));
  expect(host.querySelectorAll('.solution-steps li')).toHaveLength(2);
  expect(host.textContent).toContain('Adım adım incele');
});
