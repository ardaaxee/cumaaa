import type { Subject, SubjectId, Topic, Unit, Subtopic } from '../../domain/types';

import { subject as tytTurkce } from './tyt-turkce';
import { subject as tytMatematik } from './tyt-matematik';
import { subject as tytGeometri } from './tyt-geometri';
import { subject as tytFizik } from './tyt-fizik';
import { subject as tytKimya } from './tyt-kimya';
import { subject as tytBiyoloji } from './tyt-biyoloji';
import { subject as tytTarih } from './tyt-tarih';
import { subject as tytCografya } from './tyt-cografya';
import { subject as tytFelsefe } from './tyt-felsefe';
import { subject as tytDin } from './tyt-din';
import { subject as aytMatematik } from './ayt-matematik';
import { subject as aytGeometri } from './ayt-geometri';
import { subject as aytFizik } from './ayt-fizik';
import { subject as aytKimya } from './ayt-kimya';
import { subject as aytBiyoloji } from './ayt-biyoloji';

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

// Explicit imports keep startup independent of Vite's glob transform and avoid importing this index into itself.
export const SUBJECTS: Subject[] = [tytTurkce, tytMatematik, tytGeometri, tytFizik, tytKimya, tytBiyoloji, tytTarih, tytCografya, tytFelsefe, tytDin, aytMatematik, aytGeometri, aytFizik, aytKimya, aytBiyoloji]
  // Bazı ders adları "TYT ..." önekiyle yazılmış; etiket tekrarını ("TYT TYT") önlemek için normalize edilir.
  .map((s) => ({ ...s, name: s.name.replace(new RegExp(`^${s.exam}\\s+`), '') }))
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
