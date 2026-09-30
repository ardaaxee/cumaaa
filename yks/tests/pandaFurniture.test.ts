// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { PandaFurniture } from '../src/components/PandaFurniture';
it('lamba, kitap, erzak dolabı ve su bardağı gerçek etkileşim verir',async()=>{
 Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
 const host=document.createElement('div');document.body.append(host);const root=createRoot(host);
 const onWater=vi.fn();const onStudy=vi.fn();const props={onWater,onStudy,bamboo:2,drops:1};
 await act(()=>root.render(createElement(PandaFurniture,{...props,room:'study'})));
 const lamp=host.querySelector<HTMLButtonElement>('.furniture-light')!;
 await act(()=>lamp.click());expect(lamp.getAttribute('aria-pressed')).toBe('true');
 await act(()=>host.querySelector<HTMLButtonElement>('.furniture-book')!.click());expect(host.querySelector('.furniture-reading')).not.toBeNull();
 await act(()=>[...host.querySelectorAll<HTMLButtonElement>('.furniture-reading button')].find(x=>x.textContent==='Panda masaya geçsin')!.click());expect(onStudy).toHaveBeenCalledTimes(1);
 await act(()=>root.render(createElement(PandaFurniture,{...props,room:'kitchen'})));
 await act(()=>host.querySelector<HTMLButtonElement>('.furniture-cabinet')!.click());expect(host.textContent).toContain('2 bambu · 1 su');
 await act(()=>host.querySelector<HTMLButtonElement>('.furniture-glass')!.click());expect(onWater).toHaveBeenCalledTimes(1);
 await act(()=>root.unmount());host.remove();
});
it('çiçek sulama üç aşamada tamamlanır ve tekrar sulama kapanır',async()=>{
 Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});const host=document.createElement('div');const root=createRoot(host);
 await act(()=>root.render(createElement(PandaFurniture,{room:'garden',onWater:vi.fn(),onStudy:vi.fn(),bamboo:0,drops:0})));
 for(let i=0;i<3;i++) await act(()=>host.querySelector<HTMLButtonElement>('.furniture-watering')!.click());
 expect(host.textContent).toContain('Çiçek açtı');expect(host.querySelector<HTMLButtonElement>('.furniture-watering')!.disabled).toBe(true);
 await act(()=>root.unmount());
});
