import { describe, expect, it } from 'vitest';
import { defaultState, type WrongEntry } from '../src/store/schema';
import { studyQueue } from '../src/utils/studyQueue';
const wrong = (topicId:string, wrongCount:number, learned=false): WrongEntry => ({questionId:topicId+'-q01',topicId,subjectId:'tyt-matematik',wrongCount,learned,correctStreak:0,firstAt:'2026-09-01',lastAt:'2026-09-30',lastAnswer:0});
describe('çalışma kuyruğu',()=>{
 it('yeni hesapta yapılmamış işleri tamamlandı göstermez',()=>{expect(studyQueue(defaultState(),'2026-09-30')).toEqual({continuing:[],mistakes:[],reviews:[]});});
 it('en son başlayan konuyu önce gösterir; tamamlanan ve bilinmeyenleri dışarıda tutar',()=>{const s=defaultState();s.topicProgress={'tytmat-problemler':{status:'calisiliyor',startedAt:'2026-09-20'},'tytmat-fonksiyonlar':{status:'calisiliyor',startedAt:'2026-09-29'},unknown:{status:'calisiliyor'},'tytmat-polinomlar':{status:'tamamlandi'}};expect(studyQueue(s,'2026-09-30').continuing).toEqual(['tytmat-fonksiyonlar','tytmat-problemler']);});
 it('tekrarlanan yanlışlara öncelik verir; öğrenilmiş kayıtları saymaz',()=>{const s=defaultState();s.wrongs={a:wrong('tytmat-problemler',4),b:wrong('tytmat-fonksiyonlar',1),c:wrong('tytmat-polinomlar',20,true)};expect(studyQueue(s,'2026-09-30').mistakes.map(x=>x.topicId)).toEqual(['tytmat-problemler','tytmat-fonksiyonlar']);});
 it('gelecek ve tamamlanmış tekrarları bekleyen işler arasına katmaz',()=>{const s=defaultState();s.reviews={a:{topicId:'tytmat-problemler',stage:0,dueDay:'2026-09-29',history:[]},b:{topicId:'tytmat-fonksiyonlar',stage:0,dueDay:'2026-10-01',history:[]},c:{topicId:'tytmat-polinomlar',stage:5,dueDay:'2026-09-20',history:[]}};expect(studyQueue(s,'2026-09-30').reviews.map(x=>x.topicId)).toEqual(['tytmat-problemler']);});
});
