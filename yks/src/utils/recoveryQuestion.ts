import type {Question} from '../domain/types';
/** Follow-up must belong to the same subtopic and must never reveal an answered question as new. */
export function recoveryQuestion(original:Question,questions:Question[],answers:Record<string,number>):Question|undefined {
 return questions.filter(q=>q.id!==original.id&&q.topic===original.topic&&q.subtopic===original.subtopic&&answers[q.id]==null).sort((a,b)=>Number(b.outcome===original.outcome)-Number(a.outcome===original.outcome)||Number(a.difficulty!=='kolay')-Number(b.difficulty!=='kolay'))[0];
}
