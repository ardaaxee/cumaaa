import { getSubject, getTopicRef, subjectLabel, subjectTopics } from '../data/curriculum';
import type { SubjectId } from '../domain/types';
import type { CurriculumLookup } from './recommendations';
import type { PlanLookup } from './planGenerator';

export const lookup: CurriculumLookup & PlanLookup = {
  topicName: (id) => getTopicRef(id)?.topic.name ?? id,
  subjectName: (id: SubjectId) => {
    const s = getSubject(id);
    return s ? subjectLabel(s) : id;
  },
  subjectTopicIds: (id) => subjectTopics(id).map((t) => t.id),
};

export function topicLabel(topicId: string): string {
  const ref = getTopicRef(topicId);
  return ref ? `${ref.subject.exam} ${ref.subject.name} · ${ref.topic.name}` : topicId;
}
