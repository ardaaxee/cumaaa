// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import RecoveryPage from '../src/pages/RecoveryPage';
import type { Question } from '../src/domain/types';
const fixture=vi.hoisted(()=>({data:undefined as unknown, update:vi.fn()}));
vi.mock('../src/hooks/useLoad',()=>({useLoad:()=>({data:fixture.data,failed:false,retry:vi.fn()})}));
vi.mock('../src/store/store',()=>({getState:()=>({attempts:[]}),update:(fn:unknown)=>fixture.update(fn),useSelector:()=>false}));
vi.mock('../src/components/Layout',()=>({PageHeader:({title}:{title:string})=>createElement('h1',null,title)}));
const q=(id:string):Question=>({id,topic:'tytmat-problemler',exam:'TYT',subject:'tyt-matematik',unit:'u',sourceType:'ozgun-pratik',createdAt:'2026-09-30',outcome:'Denklem çözer',difficulty:'kolay',type:'islem',question:'2x = 6 ise x kaçtır?',options:['1','2','3','4','5'],correctAnswer:2,solution:'x=3.',hint:'İki tarafı 2’ye böl.',commonMistake:'Çarpmak.'});
it('pekiştirmeyi tamamlamadan doğrulamaya geçmez; ilk soruyu ayrı kaydeder',async()=>{
 Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true}); fixture.update.mockClear();
 fixture.data={source:q('source'),lesson:null,practice:[q('one'),q('two'),q('three')]};
 const host=document.createElement('div');document.body.append(host);const root=createRoot(host);
 await act(()=>root.render(createElement(RecoveryPage,{params:['source']})));
 expect(host.querySelectorAll('.inline-q')).toHaveLength(0);
 await act(()=>[...host.querySelectorAll('button')].find(b=>b.textContent==='3 soruyla pekiştir')!.click());
 expect(host.querySelectorAll('.inline-q')).toHaveLength(3);
 expect([...host.querySelectorAll('button')].find(b=>b.textContent==='İlk soruyu yeniden çöz')).toBeUndefined();
 for(const article of host.querySelectorAll('.inline-q')) await act(()=>article.querySelectorAll<HTMLButtonElement>('.option')[2].click());
 await act(()=>[...host.querySelectorAll('button')].find(b=>b.textContent==='İlk soruyu yeniden çöz')!.click());
 expect(host.querySelectorAll('.inline-q')).toHaveLength(1);
 expect(host.querySelector<HTMLButtonElement>('.option')!.disabled).toBe(false);
 await act(()=>host.querySelectorAll<HTMLButtonElement>('.option')[2].click());
 expect(fixture.update).toHaveBeenCalledTimes(4);
 expect(host.textContent).toContain('Yanlışlarımdaki durumunu gör');
 await act(()=>root.unmount());host.remove();
});
