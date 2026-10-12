// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { InlineQuiz } from '../src/components/InlineQuiz';
import type { Question } from '../src/domain/types';
const update = vi.fn();
vi.mock('../src/store/store', () => ({ update: (fn: unknown) => update(fn), useSelector: () => false }));
const q: Question = {id:'test-q01',topic:'unknown',exam:'TYT',subject:'tyt-matematik',unit:'u',sourceType:'ozgun-pratik',createdAt:'2026-09-30',outcome:'Denklem çözer',difficulty:'kolay',type:'islem',question:'2x = 6 ise x kaçtır?',options:['1','2','3','4','5'],correctAnswer:2,solution:'Her iki tarafı 2’ye böl: x=3.',hint:'İki tarafı aynı sayıya böl.',commonMistake:'6 ile 2’yi çarpmak.'};
describe('konu sorularında kayıt ve geri dönüş', () => {
 it('aynı render içinde iki tıklama tek cevap kaydeder; geri dönünce çözüm ve cevap korunur', async () => {
  Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true}); update.mockClear();
  const host=document.createElement('div');document.body.append(host);let root=createRoot(host);
  let saved:Record<string,number>={};const onAnswersChange=(a:Record<string,number>)=>{saved=a;};
  await act(()=>root.render(createElement(InlineQuiz,{questions:[q],onAnswersChange})));
  const options=host.querySelectorAll<HTMLButtonElement>('.option');
  await act(()=>{options[2].click();options[1].click();});
  expect(update).toHaveBeenCalledTimes(1);expect(saved[q.id]).toBe(2);
  await act(()=>root.unmount()); root=createRoot(host);
  await act(()=>root.render(createElement(InlineQuiz,{questions:[q],savedAnswers:saved,onAnswersChange})));
  expect(host.querySelector('.option.correct')?.getAttribute('aria-pressed')).toBe('true');
  expect(host.textContent).toContain('Bitti! 1 sorudan 1 doğru.');
  expect(host.querySelector<HTMLButtonElement>('.option')!.disabled).toBe(true);
  expect(update).toHaveBeenCalledTimes(1);await act(()=>root.unmount());host.remove();
 });
});
