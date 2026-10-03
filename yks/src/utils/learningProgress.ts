export interface LearningProgress { phase:number;example:number;step:number;subtopic:string;answers:Record<string,number>;updatedAt:string }
export function sanitizeLearningProgress(raw:unknown): Record<string,LearningProgress> {
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return {};
 const result:Record<string,LearningProgress>={};
 for(const [id,value] of Object.entries(raw).slice(0,250)) {
  if(!value||typeof value!=='object'||Array.isArray(value))continue;
  const v=value as Record<string,unknown>;
  const integer=(x:unknown,max:number)=>typeof x==='number'&&Number.isInteger(x)&&x>=0&&x<=max?x:0;
  const answers=Object.fromEntries(Object.entries(v.answers&&typeof v.answers==='object'?v.answers:{}).slice(0,100).filter(([,a])=>typeof a==='number'&&Number.isInteger(a)&&a>=0&&a<=4));
  result[id]={phase:integer(v.phase,3),example:integer(v.example,100),step:integer(v.step,100),subtopic:typeof v.subtopic==='string'?v.subtopic.slice(0,100):'',answers:answers as Record<string,number>,updatedAt:typeof v.updatedAt==='string'&&Number.isFinite(Date.parse(v.updatedAt))?v.updatedAt:''};
 }
 return result;
}
