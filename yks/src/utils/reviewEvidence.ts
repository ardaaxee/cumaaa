import type {QuestionAttempt,ReviewItem} from '../store/schema';
import {completeReview,isDue,scheduleFirstReview} from './srs';
export function reviewFromPractice(topicId:string,today:string,attempts:QuestionAttempt[],existing?:ReviewItem):ReviewItem|undefined{
 const fresh=attempts.filter(a=>a.topicId===topicId&&a.day===today);
 const latest=new Map<string,QuestionAttempt>();for(const a of fresh)latest.set(a.questionId,a);
 const recent=[...latest.values()].sort((a,b)=>b.at.localeCompare(a.at)).slice(0,3);
 if(recent.length<3||recent.some(a=>!a.correct))return existing;
 if(!existing)return scheduleFirstReview(topicId,today);
 if(isDue(existing,today)&&existing.lastReviewedDay!==today)return completeReview(existing,today);
 return existing;
}
