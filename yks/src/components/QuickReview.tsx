import { useMemo, useState } from 'react';
import { getTopicRef, subjectLabel } from '../data/curriculum';
import { loadLesson, loadTopicQuestions } from '../data/content';
import { useLoad } from '../hooks/useLoad';
import { markReviewDone } from '../store/actions';
import { getState, update } from '../store/store';
import { pickQuestions } from '../utils/testEngine';
import { InlineQuiz } from './InlineQuiz';
import { PageHeader } from './Layout';
import { Empty, LoadFailed, Spinner, toast } from './ui';

const STEPS = ['1 dk özet', 'Formüller', '3 kart', '5 soru'] as const;
const CARD_COUNT = 3;
const QUIZ_COUNT = 5;

/**
 * 5 dakikalık tekrar: 1 dakikalık özet → formüller → 3 kavram kartı → 5 soru.
 * Bitince tekrar kaydedilir ve bir sonraki tarih (1-3-7-14-30) planlanır.
 */
export function QuickReview({ topicId }: { topicId: string }) {
  const ref = getTopicRef(topicId);
  const lessonLoad = useLoad(() => loadLesson(topicId).then((l) => l ?? null), [topicId]);
  const qLoad = useLoad(() => loadTopicQuestions(topicId), [topicId]);
  const quiz = useMemo(() => {
    const qs = qLoad.data ?? [];
    const ids = pickQuestions(qs, QUIZ_COUNT, getState().attempts);
    return ids.map((id) => qs.find((q) => q.id === id)!).filter(Boolean);
  }, [qLoad.data]);
  const [step, setStep] = useState(0);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const [score, setScore] = useState({ answered: 0, correct: 0 });

  if (!ref) return <Empty title="Bu konu bulunamadı." action={<a className="btn" href="#/tekrar">Tekrarlara dön</a>} />;
  const lesson = lessonLoad.data;
  const finish = () => {
    update((s) => markReviewDone(s, topicId));
    toast(`Tekrar kaydedildi${score.answered ? ` · ${score.answered} sorudan ${score.correct} doğru` : ''}. Sıradaki tekrar planlandı ♡`);
    location.hash = '#/tekrar';
  };

  let body;
  if (lessonLoad.failed) body = <LoadFailed what="Konu" kind={lessonLoad.errorKind} onRetry={lessonLoad.retry} />;
  else if (lesson === undefined) body = <Spinner label="Tekrar hazırlanıyor" />;
  else if (step === 0)
    body = (
      <ul className="review-summary">
        {(lesson?.summary ?? []).map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    );
  else if (step === 1)
    body = lesson?.formulas.length ? (
      lesson.formulas.map((f, i) => (
        <div key={i} className="formula">
          <code>{f.expr}</code>
          <div className="meaning">{f.meaning}</div>
        </div>
      ))
    ) : (
      <p className="muted">Bu konuda formül yok; kavramlara geçebilirsin.</p>
    );
  else if (step === 2)
    body = (
      <div className="review-cards">
        {(lesson?.concepts ?? []).slice(0, CARD_COUNT).map((c, i) => (
          <button key={i} type="button" className={`review-card${flipped[i] ? ' flipped' : ''}`} onClick={() => setFlipped((f) => ({ ...f, [i]: !f[i] }))} aria-pressed={!!flipped[i]}>
            {flipped[i] ? <span>{c.definition}</span> : <b>{c.term}</b>}
            <small>{flipped[i] ? 'Kavrama dön' : 'Dokun, anlamını gör'}</small>
          </button>
        ))}
      </div>
    );
  else
    body = qLoad.failed ? (
      <LoadFailed what="Sorular" kind={qLoad.errorKind} onRetry={qLoad.retry} />
    ) : !qLoad.data ? (
      <Spinner label="Sorular yükleniyor" />
    ) : (
      <InlineQuiz questions={quiz} topicName={ref.topic.name} onProgress={(answered, correct) => setScore({ answered, correct })} />
    );

  return (
    <>
      <PageHeader title={`${ref.topic.name} · 5 dk tekrar`} sub={subjectLabel(ref.subject)} back="#/tekrar" />
      <ol className="study-steps" aria-label="Tekrar adımları">
        {STEPS.map((s, i) => (
          <li key={s} className={i === step ? 'current' : i < step ? 'done' : ''} aria-current={i === step ? 'step' : undefined}>
            <span>{i < step ? '✓' : i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
      <div className="card section lesson">{body}</div>
      <div className="runner-nav">
        <button type="button" className="btn" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          Geri
        </button>
        {step < STEPS.length - 1 ? (
          <button type="button" className="btn primary" onClick={() => setStep((s) => s + 1)}>
            Devam
          </button>
        ) : (
          <button type="button" className="btn primary" onClick={finish} disabled={quiz.length > 0 && score.answered < quiz.length}>
            {quiz.length > 0 && score.answered < quiz.length ? `${score.answered}/${quiz.length} cevaplandı` : 'Tekrarı bitir ♡'}
          </button>
        )}
      </div>
    </>
  );
}
