import type {SubjectId} from '../domain/types';
import type {NotebookPageMeta} from '../store/schema';
export interface NotebookContext {topicId?:string;questionId?:string;subjectId?:SubjectId;title:string}
export function contextPage(pages:NotebookPageMeta[],context:NotebookContext){
 return pages.filter(p=>context.questionId?p.questionId===context.questionId:!!context.topicId&&p.topicId===context.topicId&&!p.questionId).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))[0];
}
export function openContextNotebook(context:NotebookContext){window.dispatchEvent(new CustomEvent('iyiki:open-notebook',{detail:context}));}
