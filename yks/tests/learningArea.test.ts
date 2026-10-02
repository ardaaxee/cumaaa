// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it } from 'vitest';
import { LearningArea } from '../src/components/LearningArea';
import { loadLesson } from '../src/data/content';
import { SUBJECTS } from '../src/data/curriculum';
it('örneğin adımlarını ve cevabını sıralı açar; konu değişince öğretim alanı yeniden başlar', async()=>{
 Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
 const topic=SUBJECTS[0].units[0].topics[0];const lesson=(await loadLesson(topic.id))!;
 expect(lesson.examples.length).toBeGreaterThan(0);
 const host=document.createElement('div');document.body.append(host);const root=createRoot(host);
 await act(()=>root.render(createElement(LearningArea,{lesson,topic,questions:[]})));
 await act(()=>[...host.querySelectorAll('button')].find(b=>b.textContent==='2. Birlikte çöz')!.click());
 expect(host.textContent).not.toContain('Sonuç:');
 for(let i=0;i<lesson.examples[0].steps.length;i++) await act(()=>[...host.querySelectorAll('button')].find(b=>b.textContent?.includes(i===0?'İlk çözüm adımını':'Sonraki adımı'))!.click());
 expect(host.textContent).toContain('Sonuç: '+lesson.examples[0].answer);
 await act(()=>[...host.querySelectorAll('button')].find(b=>b.textContent==='Çözümü yeniden dene')!.click());
 expect(host.textContent).not.toContain('Sonuç:');
 await act(()=>root.unmount());host.remove();
});
