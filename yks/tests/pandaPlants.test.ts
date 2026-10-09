import {expect,it} from 'vitest';
import {sanitizePandaPlants,waterPandaPlant} from '../src/utils/pandaPlants';
it('keeps plants independent and prevents repeated watering on the same day',()=>{
 const p=waterPandaPlant(null,'garden','2026-10-03');
 expect(p.garden.growth).toBe(1);expect(p.balcony.growth).toBe(0);
 expect(waterPandaPlant(p,'garden','2026-10-03')).toEqual(p);
 expect(waterPandaPlant(p,'garden','2026-10-04').garden.growth).toBe(2);
 expect(waterPandaPlant(p,'garden','2026-10-02')).toEqual(p);
});
it('sanitizes imported plants and keeps mature flowers available the next day',()=>{
 const p=sanitizePandaPlants({garden:{growth:99,wateredDay:'bad'},balcony:{growth:NaN}});
 expect(p.garden).toEqual({growth:3,wateredDay:''});expect(p.balcony.growth).toBe(0);
 expect(waterPandaPlant(p,'garden','2026-10-04').garden).toEqual({growth:3,wateredDay:'2026-10-04'});
});
