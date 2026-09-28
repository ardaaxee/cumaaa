import { useEffect, useState } from 'react';
import { SUBJECTS, getTopicRef, subjectLabel } from '../data/curriculum';
import { loadSubjectQuestions } from '../data/content';
import type { Question } from '../domain/types';
import { dayKey } from '../utils/date';
import { InlineQuiz } from './InlineQuiz';
import { SourceBadge, Spinner } from './ui';

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Her gün (yerel tarihe göre) sabit bir ÖSYM tarzı soru; ders sırası günden güne değişir. */
export function DailyQuestion() {
  const today = dayKey();
  const [q, setQ] = useState<Question | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    const h = hash(today);
    const subject = SUBJECTS[h % SUBJECTS.length];
    loadSubjectQuestions(subject.id).then((qs) => {
      if (!alive) return;
      setQ(qs.length ? qs[(h >>> 8) % qs.length] : null);
    });
    return () => {
      alive = false;
    };
  }, [today]);

  const ref = q ? getTopicRef(q.topic) : undefined;
  return (
    <section className="card section" aria-labelledby="daily-h">
      <div className="card-head">
        <h2 id="daily-h">Günün sorusu ☀</h2>
        <SourceBadge type="ozgun-pratik" />
      </div>
      {ref && <div className="tiny muted mb-8">{subjectLabel(ref.subject)} · {ref.topic.name}</div>}
      {q === undefined ? <Spinner /> : q === null ? <div className="small muted">Bugün için soru bulunamadı.</div> : <InlineQuiz questions={[q]} topicName={ref?.topic.name} />}
    </section>
  );
}
