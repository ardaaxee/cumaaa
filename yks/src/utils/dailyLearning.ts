import type {AppState} from '../store/schema';
import {dueReviews} from './srs';
import {sanitizeLearningProgress} from './learningProgress';
import {sanitizeRecoveryProgress} from './recoveryProgress';
export interface DailyLearningTask {key:string;title:string;detail:string;path:string}
export function dailyLearningTasks(state:AppState,today:string,topicName:(id:string)=>string|null):DailyLearningTask[]{
 const tasks:DailyLearningTask[]=[];
 const recovering=Object.entries(sanitizeRecoveryProgress(state.recoveryProgress)).filter(([id,p])=>!state.wrongs[id]?.learned&&p.step<3).sort(([,a],[,b])=>b.updatedAt.localeCompare(a.updatedAt))[0];
 if(recovering)tasks.push({key:'recover-'+recovering[0],title:'Yarım kalan pekiştirmeyi bitir',detail:`${recovering[1].step}. adımdan devam · yaklaşık 10 dk`,path:`/pekistir/${recovering[0]}`});
 const due=dueReviews(state.reviews,today)[0];
 if(due&&topicName(due.topicId))tasks.push({key:'review-'+due.topicId,title:`${topicName(due.topicId)} konusunu hatırla`,detail:'Tekrar günü geldi · anlatımdan sonra yeni sorular çöz',path:`/konu/${due.topicId}?sekme=test`});
 const weak=Object.entries(sanitizeLearningProgress(state.learningProgress)).filter(([id,p])=>topicName(id)&&Object.keys(p.diagnosticAnswers??{}).length>0&&state.topicProgress[id]?.status!=='tamamlandi').sort(([,a],[,b])=>b.updatedAt.localeCompare(a.updatedAt))[0];
 const recent=weak??Object.entries(sanitizeLearningProgress(state.learningProgress)).filter(([id,p])=>topicName(id)&&p.phase<3).sort(([,a],[,b])=>b.updatedAt.localeCompare(a.updatedAt))[0];
 if(recent&&!tasks.some(t=>t.key.endsWith('-'+recent[0])))tasks.push({key:'learn-'+recent[0],title:`${topicName(recent[0])} öğrenme alanına devam et`,detail:`${recent[1].phase+1}. öğrenme adımı · kaldığın yer kaydedildi`,path:`/konu/${recent[0]}`});
 return tasks.slice(0,3);
}
