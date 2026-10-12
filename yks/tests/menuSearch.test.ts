import {describe,it,expect} from 'vitest';
import {filterMenu,menuGroup} from '../src/utils/menuSearch';
import {NAV_ALL} from '../src/components/Layout';
import {MENU_MAIN,MENU_MORE} from '../src/components/MascotNav';
describe('searchable menu',()=>{
 it('finds Turkish labels with phone keyboard spellings',()=>{
   expect(filterMenu(NAV_ALL,'AKILLI').map(m=>m.path)).toEqual(['/koc']);
   expect(filterMenu(NAV_ALL,'yanlis').map(m=>m.path)).toEqual(['/yanlislar']);
   expect(filterMenu(NAV_ALL,'konu anlatimi').map(m=>m.path)).toEqual(['/dersler']);
   expect(filterMenu(NAV_ALL,'xyz-unknown')).toEqual([]);
 });
 it('keeps every feature reachable and groups each once',()=>{
   const paths=[...MENU_MAIN,...MENU_MORE].map(m=>m.path);
   for(const item of NAV_ALL.filter(m=>m.path!=='/daha')) expect(paths).toContain(item.path);
   expect(new Set(paths).size).toBe(paths.length);
   for(const item of NAV_ALL) expect(['Çalışma','Takip','Araçlar']).toContain(menuGroup(item.path));
 });
});
