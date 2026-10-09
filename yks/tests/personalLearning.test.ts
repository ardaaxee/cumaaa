import {describe,it,expect} from 'vitest';
import {diagnosticQuestions,diagnosticResult} from '../src/utils/diagnostic';
import {contextPage} from '../src/utils/notebookContext';
import {reviewFromPractice} from '../src/utils/reviewEvidence';
import {sanitizeRecoveryProgress} from '../src/utils/recoveryProgress';
import {dailyLearningTasks} from '../src/utils/dailyLearning';
import {defaultState,type QuestionAttempt} from '../src/store/schema';
import {loadTopicQuestions} from '../src/data/content';
import {mergeStates} from '../src/store/merge';
const today='2026-10-03';
const attempt=(questionId:string,correct=true):QuestionAttempt=>({id:questionId,questionId,topicId:'topic',subjectId:'tyt-kimya',difficulty:'kolay',answer:0,correct,timeMs:1000,at:`${today}T12:00:00Z`,day:today,sessionId:'practice'});
describe('kişisel öğrenme ve cihaz aktarımı',()=>{
 it('diagnostic samples different subtopics and finds the unanswered/wrong skill',async()=>{
  const pool=await loadTopicQuestions('aytkim-elektrokimya');const selected=diagnosticQuestions(pool);
  expect(selected.length).toBeGreaterThan(0);expect(new Set(selected.map(q=>q.subtopic)).size).toBe(selected.length);
  expect(diagnosticResult(selected,{}).complete).toBe(false);
  const answers=Object.fromEntries(selected.map((q,i)=>[q.id,i===0?(q.correctAnswer+1)%5:q.correctAnswer]));
  expect(diagnosticResult(selected,answers)).toMatchObject({complete:true,correct:selected.length-1,weakSubtopics:[selected[0].subtopic]});
 });
 it('question notes reopen their own page instead of another question in the same topic',()=>{
  const pages=[{id:'a',title:'a',topicId:'t',questionId:'q1',createdAt:'',updatedAt:'2026-10-02'},{id:'b',title:'b',topicId:'t',questionId:'q2',createdAt:'',updatedAt:'2026-10-03'},{id:'c',title:'c',topicId:'t',createdAt:'',updatedAt:'2026-10-03'}];
  expect(contextPage(pages,{questionId:'q1',topicId:'t',title:'note'})?.id).toBe('a');
  expect(contextPage(pages,{topicId:'t',title:'note'})?.id).toBe('c');
 });
 it('repeated answers to one question cannot complete a review',()=>{
  expect(reviewFromPractice('topic',today,[attempt('a'),attempt('a'),attempt('a')])).toBeUndefined();
  const scheduled=reviewFromPractice('topic',today,[attempt('a'),attempt('b'),attempt('c')]);
  expect(scheduled?.dueDay).toBe('2026-10-04');
  expect(reviewFromPractice('topic',today,[attempt('a'),attempt('b'),attempt('c',false)])).toBeUndefined();
 });
 it('a due review advances once per day after three distinct correct questions',()=>{
  const due={topicId:'topic',stage:0,dueDay:today,history:[]};const evidence=[attempt('a'),attempt('b'),attempt('c')];
  const next=reviewFromPractice('topic',today,evidence,due)!;
  expect(next.stage).toBe(1);expect(next.lastReviewedDay).toBe(today);
  expect(reviewFromPractice('topic',today,evidence,next)?.stage).toBe(1);
 });
 it('malformed recovery progress is bounded and survives a safe round trip',()=>{
  const value=sanitizeRecoveryProgress({q:{step:99,exampleStep:-3,answers:{a:9,b:2},verification:{},questionIds:['a',23],updatedAt:'broken'}});
  expect(value.q).toMatchObject({step:1,exampleStep:0,answers:{b:2},questionIds:['a'],updatedAt:''});
 });
 it('daily work includes the unfinished recovery and due review without inventing topics',()=>{
  const state=defaultState();state.recoveryProgress={q:{step:2,exampleStep:1,answers:{},verification:{},questionIds:[],updatedAt:'2026-10-03T12:00:00Z'}};state.reviews={topic:{topicId:'topic',dueDay:today,stage:0,history:[]}};
  const tasks=dailyLearningTasks(state,today,id=>id==='topic'?'Kimya':null);
  expect(tasks.map(t=>t.path)).toEqual(['/pekistir/q','/konu/topic?sekme=test']);expect(tasks.length).toBeLessThanOrEqual(3);
 });
 it('the notebook page timestamp wins even when another device changed its global settings later',()=>{
  const local=defaultState();const remote=defaultState();
  local.notebookPages=[{id:'page',title:'latest drawing',createdAt:'2026-10-01',updatedAt:'2026-10-03'}];remote.notebookPages=[{id:'page',title:'older drawing',createdAt:'2026-10-01',updatedAt:'2026-10-02'}];
  const result=mergeStates({local,remote,localChangedAt:'2026-10-03',remoteChangedAt:'2026-10-04'});
  expect(result.notebookPages[0].title).toBe('latest drawing');
 });
});
