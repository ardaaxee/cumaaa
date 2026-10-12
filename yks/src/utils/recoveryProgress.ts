export interface RecoveryProgress {step:number;exampleStep:number;questionIds:string[];answers:Record<string,number>;verification:Record<string,number>;updatedAt:string}
export function sanitizeRecoveryProgress(raw:unknown):Record<string,RecoveryProgress>{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return {};
 const result:Record<string,RecoveryProgress>={};
 const answers=(v:unknown)=>Object.fromEntries(Object.entries(v&&typeof v==='object'&&!Array.isArray(v)?v:{}).slice(0,10).filter(([,a])=>typeof a==='number'&&Number.isInteger(a)&&a>=0&&a<=4)) as Record<string,number>;
 for(const [id,value] of Object.entries(raw).slice(0,4000)){
  if(!value||typeof value!=='object'||Array.isArray(value))continue;
  const v=value as Record<string,unknown>;
  result[id]={step:typeof v.step==='number'&&[1,2,3].includes(v.step)?v.step:1,exampleStep:typeof v.exampleStep==='number'&&Number.isInteger(v.exampleStep)&&v.exampleStep>=0&&v.exampleStep<=100?v.exampleStep:0,questionIds:Array.isArray(v.questionIds)?v.questionIds.filter((x):x is string=>typeof x==='string').slice(0,3):[],answers:answers(v.answers),verification:answers(v.verification),updatedAt:typeof v.updatedAt==='string'&&Number.isFinite(Date.parse(v.updatedAt))?v.updatedAt:''};
 }
 return result;
}
