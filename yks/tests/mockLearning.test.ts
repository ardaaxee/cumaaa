import { describe, expect, it } from 'vitest';
import { defaultState, type MockExam } from '../src/store/schema';
import { allTopics } from '../src/data/curriculum';
import { buildSections } from '../src/utils/mock';
import { mockPace, planMockLearning, sanitizeMockLearning } from '../src/utils/mockLearning';
import { weeklyMockLearning } from '../src/utils/mockWeekly';
import { createBackup, parseBackup } from '../src/store/storage';
const topic = allTopics().find(t => t.subject.id === 'ayt-fizik')!.topic.id;
function mock(): MockExam {
  return { id: 'mock-test', name: 'AYT', exam: 'AYT', date: '2026-10-04', createdAt: '2026-10-04T12:00:00Z', sections: buildSections('AYT', [{ key:'fizik', correct:7, wrong:5 }]).sections,
    learning: { issues: [{ id:'issue', sectionKey:'fizik', question:1, kind:'yanlis', reason:'konu', topicId:topic, note:'Eksi işaretini unuttum', reviewed:false }], sectionMinutes:{fizik:25} } };
}
describe('deneme learning workflow', () => {
  it('plans only explicitly selected topics and never duplicates tasks or regresses reviews on repeated clicks', () => {
    const state = { ...defaultState(), mocks:[mock()] };
    const planned = planMockLearning(state, 'mock-test', '2026-10-04');
    expect(planned.tasks).toHaveLength(3);
    expect(planned.tasks.map(t => t.type)).toEqual(['konu','test','tekrar']);
    expect(planned.tasks.at(-1)?.date).toBe('2026-10-07');
    expect(planned.reviews[topic].dueDay).toBe('2026-10-05');
    expect(planned.topicProgress[topic]).toBeUndefined();
    expect(planMockLearning(planned, 'mock-test', '2026-10-05')).toEqual(planned);
    state.mocks[0].learning!.issues[0].topicId = '';
    expect(planMockLearning(state, 'mock-test', '2026-10-04').tasks).toHaveLength(0);
  });
  it('validates issue bounds, duplicate questions, unrelated topics, counts and imported timing', () => {
    const m = mock(); const i = m.learning!.issues[0];
    const wrongTopic = allTopics().find(t => t.subject.id === 'tyt-turkce')!.topic.id;
    const result = sanitizeMockLearning({ issues:[i,i,{...i,id:'other',question:2,topicId:wrongTopic},{...i,question:15},{...i,question:3,reason:'fake'}], sectionMinutes:{fizik:Infinity,kimya:170,biyoloji:20} },m);
    expect(result.issues).toHaveLength(2);
    expect(result.issues[1].topicId).toBe('');
    expect(result.sectionMinutes).toEqual({kimya:170});
    expect(sanitizeMockLearning({issues:[{...i,kind:'bos',question:1},{...i,kind:'bos',question:2},{...i,kind:'bos',question:3}]},m).issues).toHaveLength(2);
  });
  it('retains learning details and tasks through a backup round trip', () => {
    const state = planMockLearning({...defaultState(),mocks:[mock()]},'mock-test','2026-10-04');
    const parsed = parseBackup(JSON.stringify(createBackup(state, null)));
    expect(parsed.state.mocks[0].learning).toEqual(state.mocks[0].learning);
    expect(parsed.state.tasks[0].sourceMockId).toBe('mock-test');
  });
  it('does not divide by zero when there are no attempted questions', () => {
    const m=mock(); m.sections.find(s=>s.key==='fizik')!.correct=0; m.sections.find(s=>s.key==='fizik')!.wrong=0;
    expect(mockPace(m)[0].secondsPerAttempt).toBeNull();
  });
  it('keeps TYT and AYT weekly net averages separate and lists unresolved topic evidence', () => {
    const m=mock(); const prior={...mock(),id:'prior',date:'2026-09-27'};
    const tyt: MockExam={...m,id:'tyt',exam:'TYT',learning:undefined,sections:buildSections('TYT',[{key:'turkce',correct:30,wrong:0}]).sections};
    const report=weeklyMockLearning({...defaultState(),mocks:[m,prior,tyt]},'2026-09-28');
    expect(report.exams.find(e=>e.exam==='TYT')?.average).toBe(30);
    expect(report.exams.find(e=>e.exam==='AYT')?.delta).toBe(0);
    expect(report.priorities[0].id).toBe(topic);
  });
});
