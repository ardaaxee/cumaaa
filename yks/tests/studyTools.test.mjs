import test from 'node:test';
import assert from 'node:assert/strict';
import { dailyMissions, quizSummary, lessonOutline } from '../src/utils/studyTools.ts';

test('quiz counts only current questions, including answer A', () => {
  assert.deepEqual(quizSummary([{id:'a',correctAnswer:0},{id:'b',correctAnswer:2}], {a:0,old:1}), {answered:1,correct:1});
});
test('missions use today, exclude blanks, and cap displayed progress', () => {
  const state={attempts:[...Array.from({length:7},()=>({day:'2026-10-05',answer:0})),{day:'2026-10-05',answer:null},{day:'2026-10-04',answer:1}],studyLog:[{day:'2026-10-05',minutes:10},{day:'2026-10-04',minutes:90}],cards:{a:{lastDay:'2026-10-05'},b:{lastDay:'2026-10-04'}}};
  assert.deepEqual(dailyMissions(state,'2026-10-05').map(m=>[m.current,m.target,m.done]),[[5,5,true],[10,15,false],[0,1,false],[1,3,false]]);
});
test('empty progress never marks a mission completed', () => {
  assert.ok(dailyMissions({attempts:[],studyLog:[],cards:{}},'2026-10-05').every(m=>!m.done&&m.current===0));
});
test('lesson outline excludes empty formulas and estimates reading time', () => {
  const lesson={intro:'Giriş',logic:'Mantık',prerequisites:[],concepts:[{term:'Kuvvet',definition:'Etkileşim'}],formulas:[],examples:[],osymThinking:'Yorumla',summary:[],commonMistakes:[],tips:[]};
  const outline=lessonOutline(lesson);
  assert.equal(outline.minutes,1);
  assert.ok(!outline.sections.some(s=>s.id==='formuller'));
  assert.ok(outline.sections.some(s=>s.id==='mantik'));
  assert.ok(lessonOutline({...lesson,logic:'kelime '.repeat(1000)}).minutes>=5);
});

test('personal goals and today’s completed plan tasks are preserved', () => {
  const state={attempts:[],studyLog:[],cards:{},profile:{dailyQuestionGoal:60,dailyStudyMinutes:180},tasks:[{date:'2026-10-05',done:true},{date:'2026-10-04',done:true}]};
  const missions=dailyMissions(state,'2026-10-05');
  assert.deepEqual(missions.map(m=>m.target),[21,45,1,3]);
  assert.equal(missions.find(m=>m.id==='plan').done,true);
  assert.equal(missions.find(m=>m.id==='questions').href,'#/testler');
  assert.equal(state.tasks.length,2);
});
