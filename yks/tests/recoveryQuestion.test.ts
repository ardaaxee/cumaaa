import {it,expect} from 'vitest';
import {recoveryQuestion} from '../src/utils/recoveryQuestion';
import type {Question} from '../src/domain/types';
it('chooses a fresh same-subtopic follow-up, preferring the same outcome',()=>{
 const original={id:'a',topic:'t',subtopic:'s',outcome:'o',difficulty:'orta'} as Question;
 const b={...original,id:'b',outcome:'other'};const c={...original,id:'c'};
 expect(recoveryQuestion(original,[original,b,c,{...c,id:'wrong-subtopic',subtopic:'other'}],{})).toBe(c);
 expect(recoveryQuestion(original,[b,c],{c:0})).toBe(b);
 expect(recoveryQuestion(original,[original,b,c],{b:0,c:1})).toBeUndefined();
});
