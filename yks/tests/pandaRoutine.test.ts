// @vitest-environment jsdom
import {act,createElement} from 'react';
import {createRoot} from 'react-dom/client';
import {expect,it} from 'vitest';
import {pandaPose} from '../src/utils/pandaPose';
import {PandaFurniture} from '../src/components/PandaFurniture';
it('room and activity decide a physical pose without snapping walking onto furniture',()=>{
 expect(pandaPose('living','relaxing')).toBe('sofa');expect(pandaPose('study','studying')).toBe('desk');expect(pandaPose('bathroom','bathing')).toBe('bath');expect(pandaPose('balcony','relaxing')).toBe('terrace');expect(pandaPose('garden','relaxing')).toBe('watering');
 expect(pandaPose('bedroom','sleeping')).toBe('lying');expect(pandaPose('living','sleeping')).toBe('standing');
 expect(pandaPose('kitchen','eating')).toBe('seated');expect(pandaPose('kitchen','drinking')).toBe('seated');expect(pandaPose('kitchen','walking')).toBe('standing');
});
it('an illuminated lamp switches off during sleep and remains off after waking',async()=>{
 Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});const host=document.createElement('div');const root=createRoot(host);
 const props={room:'bedroom' as const,onWater:()=>{},onStudy:()=>{},bamboo:2,drops:2};
 await act(()=>root.render(createElement(PandaFurniture,props)));
 await act(()=>host.querySelector<HTMLButtonElement>('.furniture-light')!.click());expect(host.querySelector('.furniture-light')!.getAttribute('aria-pressed')).toBe('true');
 await act(()=>root.render(createElement(PandaFurniture,{...props,sleeping:true})));
 const lamp=host.querySelector<HTMLButtonElement>('.furniture-light')!;expect(lamp.disabled).toBe(true);expect(lamp.getAttribute('aria-pressed')).toBe('false');
 await act(()=>root.render(createElement(PandaFurniture,{...props,sleeping:false})));
 expect(lamp.disabled).toBe(false);expect(lamp.getAttribute('aria-pressed')).toBe('false');await act(()=>root.unmount());
});
