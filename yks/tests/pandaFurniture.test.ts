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
it('günlük sulama kapanır; çiçek olgunlaşsa da ertesi gün bakım açılır',async()=>{
 Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});const host=document.createElement('div');const root=createRoot(host);
 const onPlant=vi.fn();const props={room:'garden' as const,onWater:vi.fn(),onStudy:vi.fn(),onPlant,bamboo:0,drops:0,plant:3};
 await act(()=>root.render(createElement(PandaFurniture,props)));
 await act(()=>host.querySelector<HTMLButtonElement>('.furniture-watering')!.click());expect(onPlant).toHaveBeenCalledTimes(1);
 await act(()=>root.render(createElement(PandaFurniture,{...props,plantWatered:true})));
 expect(host.textContent).toContain('Bugün sulandı');expect(host.querySelector<HTMLButtonElement>('.furniture-watering')!.disabled).toBe(true);
 await act(()=>root.render(createElement(PandaFurniture,{...props,plantWatered:false})));
 expect(host.querySelector<HTMLButtonElement>('.furniture-watering')!.disabled).toBe(false);
 await act(()=>root.unmount());
});
