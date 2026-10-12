import { defaultState } from '../src/store/schema';
import { createBackup, parseBackup } from '../src/store/storage';
import { expect, it } from 'vitest';
import { pandaLetter, rememberPandaDay, sanitizePandaMemories } from '../src/utils/pandaMoments';
it('bozuk kayıtları ayıklar, metni sınırlar ve aynı günü günceller',()=>{
 const memories=sanitizePandaMemories([null,{day:'2026-02-30',mood:'iyi'},{day:'2026-10-01',mood:'unknown'},{day:'2026-10-01',mood:'iyi',note:'x'.repeat(400)}]);
 expect(memories).toHaveLength(1);expect(memories[0].note).toHaveLength(300);
 expect(rememberPandaDay(memories,{day:'2026-10-01',mood:'yorgun',note:'Güzel bir an'})).toEqual([{day:'2026-10-01',mood:'yorgun',note:'Güzel bir an'}]);
});
it('yalnız son 60 günü saklar',()=>{
 const records=Array.from({length:90},(_,i)=>({day:new Date(Date.UTC(2026,0,i+1)).toISOString().slice(0,10),mood:'iyi' as const,note:''}));
 const result=sanitizePandaMemories(records);expect(result).toHaveLength(60);expect(result[0].day).toBe(records[89].day);
});
it('aynı gün için aynı mektup gösterir',()=>{expect(pandaLetter('2026-10-01')).toBe(pandaLetter('2026-10-01'));expect(pandaLetter('2026-10-01').length).toBeGreaterThan(40);});

it('anılar dışa aktarılan yedekten geri yüklenir',()=>{
 const s=defaultState();s.settings.pet.memories=[{day:'2026-10-01',mood:'iyi',note:'Birlikte güzel bir mola'}];
 const restored=parseBackup(JSON.stringify(createBackup(s,null,{}))).state;
 expect(restored.settings.pet.memories).toEqual(s.settings.pet.memories);
});
