import { expect, it } from 'vitest';
import type { QuestionSeed } from '../src/domain/types';
const modules = import.meta.glob<{questions: QuestionSeed[]}>('../src/data/questions/*.ts', {eager:true});
const questions = Object.values(modules).flatMap(m=>m.questions);
// Sonuçlar soru kökündeki verilerden bağımsız hesaplanır; cevap indisi kopyalanmaz.
const cases: [string, number][] = [
 ['aytfiz-hareket-q201', .5*3*4**2],
 ['aytfiz-hareket-q202', .5*8*4+8*3],
 ['aytfiz-newton-yasalari-q202',20],
 ['aytfiz-is-enerji-q201',Math.sqrt(4**2+2*12/2)],
 ['aytfiz-itme-momentum-q201',.5*10*2+10*2],
 ['aytfiz-cembersel-hareket-q201',2*4**2/.5],
 ['aytfiz-dalga-mekanigi-q201',24/6],
 ['aytkim-gazlar-q201',4*450/300],
 ['aytkim-sivi-cozeltiler-q201',.5/2],
 ['aytkim-tepkimelerde-enerji-q201',-394+2*(-286)-(-75)],
 ['aytmat-fonksiyonlar-q201',(7+5)/3],
 ['aytmat-polinomlar-q201',7**2-2*10],
 ['aytmat-turev-q202',3*(1**2+2)**2*2],
 ['aytmat-integral-uygulamalari-q201',4**2/2],
 ['tytfiz-is-guc-enerji-q201',(18-6)*5],
 ['tytfiz-is-guc-enerji-q202',4],
 ['tytfiz-is-guc-enerji-q203',20/12],
 ['tytfiz-elektrik-akimi-q201',20/(12/3)],
 ['tytfiz-elektrik-akimi-q202',4],
 ['tytfiz-basinc-kaldirma-q201',1/2],
 ['tytfiz-basinc-kaldirma-q202',2e-3*1000*10],
 ['tytkim-mol-kavrami-q201',22/44],
 ['tytmat-problemler-q201',8+7],
 ['tytmat-problemler-q202',600/(300/60+300/100)],
 ['tytmat-fonksiyonlar-q201',(2*2-1)**2+3],
 ['tytmat-polinomlar-q201',2**3-2*2**2+4*2-5],
 ['tytmat-olasilik-q201',6/10],
];
function numeric(text: string): number {
 const s=text.trim().replace(/−/g,'-').replace(/,/g,'.');
 if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
 if (/^\d+\/\d+$/.test(s)) { const [a,b]=s.split('/').map(Number); return a/b; }
 if (/^√\d+$/.test(s)) return Math.sqrt(Number(s.slice(1)));
 return NaN;
}
it.each(cases)('%s: seçili cevap bağımsız hesapla tutarlı', (id, expected) => {
 const q=questions.find(q=>q.id===id);
 expect(q, id).toBeDefined();
 expect(numeric(q!.options[q!.correctAnswer]),q!.question).toBeCloseTo(expected,8);
 expect(q!.options.filter(option=>Math.abs(numeric(option)-expected)<1e-8)).toHaveLength(1);
});
it('eylemsizlik sorusunda başlangıçta durma olasılığı kökle çelişmez',()=>{
 const q=questions.find(q=>q.id==='tytfiz-hareket-ve-kuvvet-q203')!;
 expect(q.question).toContain('Başlangıçtaki hareket durumu belirtilmeyen');
 expect(q.options[q.correctAnswer]).toBe('I ve II');
});
