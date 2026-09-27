import type { Subject, SubjectId, Topic, Unit, Subtopic } from '../../domain/types';

const modules = import.meta.glob<{ subject: Subject }>('./*.ts', { eager: true });

const SUBJECT_ORDER: SubjectId[] = [
  'tyt-turkce',
  'tyt-matematik',
  'tyt-geometri',
  'tyt-fizik',
  'tyt-kimya',
  'tyt-biyoloji',
  'tyt-tarih',
  'tyt-cografya',
  'tyt-felsefe',
  'tyt-din',
  'ayt-matematik',
  'ayt-geometri',
  'ayt-fizik',
  'ayt-kimya',
  'ayt-biyoloji',
];

export const SUBJECTS: Subject[] = Object.entries(modules)
  .filter(([path]) => !path.endsWith('/index.ts'))
  .map(([, mod]) => mod.subject)
  .filter(Boolean)
  .sort((a, b) => SUBJECT_ORDER.indexOf(a.id) - SUBJECT_ORDER.indexOf(b.id));

export interface TopicRef {
  subject: Subject;
  unit: Unit;
  topic: Topic;
}

const topicIndex = new Map<string, TopicRef>();
const subtopicIndex = new Map<string, Subtopic>();
for (const subject of SUBJECTS) {
  for (const unit of subject.units) {
    for (const topic of unit.topics) {
      topicIndex.set(topic.id, { subject, unit, topic });
      for (const st of topic.subtopics) subtopicIndex.set(st.id, st);
    }
  }
}

export function getSubject(id: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id);
}

export function getTopicRef(topicId: string): TopicRef | undefined {
  return topicIndex.get(topicId);
}

export function getSubtopic(id: string): Subtopic | undefined {
  return subtopicIndex.get(id);
}

export function allTopics(): TopicRef[] {
  return [...topicIndex.values()];
}

export function subjectTopics(subjectId: string): Topic[] {
  const s = getSubject(subjectId);
  return s ? s.units.flatMap((u) => u.topics) : [];
}

export function subjectLabel(subject: Subject): string {
  return `${subject.exam} ${subject.name}`;
}
