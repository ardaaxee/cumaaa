import type {Question} from '../domain/types';
/** Short checks sample distinct skills; they are not a complete mastery exam. */
export function diagnosticQuestions(pool:Question[]):Question[]{
 const selected:Question[]=[];const seen=new Set<string>();
 for(const q of [...pool].sort((a,b)=>(a.difficulty==='kolay'?0:1)-(b.difficulty==='kolay'?0:1))){
  const skill=q.subtopic||q.outcome;if(seen.has(skill))continue;
  seen.add(skill);selected.push(q);if(selected.length===3)break;
 }
 return selected;
}
export function diagnosticResult(questions:Question[],answers:Record<string,number>){
 const answered=questions.filter(q=>answers[q.id]!=null);
 return {complete:questions.length>0&&answered.length===questions.length,correct:answered.filter(q=>answers[q.id]===q.correctAnswer).length,weakSubtopics:[...new Set(answered.filter(q=>answers[q.id]!==q.correctAnswer).map(q=>q.subtopic).filter(Boolean))]};
}
