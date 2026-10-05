import { useEffect, useRef, useState } from 'react';
import { quizSummary } from '../utils/studyTools';
import { AskLabel } from './AskName';
import type { Question } from '../domain/types';
import { href } from '../hooks/useRoute';
import { recordPractice } from '../store/actions';
import { update } from '../store/store';
import { optionLetter, uid } from '../utils/ids';
import { Icon } from './Icon';
import { Options, QuestionBody, QuestionMeta, SolutionBlock } from './QuestionView';

/**
 * Sayfa içinde, test ekranına geçmeden çözülen soru listesi (konu sonu soruları,
 * günün sorusu). Her cevap istatistiğe ve yanlışlar defterine işlenir.
 */
export function InlineQuiz({
  questions,
  topicName,
  onMore,
  moreLabel = 'Yeni sorular getir',
  onProgress,
  savedAnswers,
  onAnswersChange,
}: {
  questions: Question[];
  topicName?: string;
  onMore?: () => void;
  moreLabel?: string;
  /** Her cevaptan sonra: cevaplanan ve doğru sayısı. */
  onProgress?: (answered: number, correct: number) => void;
  savedAnswers?: Record<string, number>;
  onAnswersChange?: (answers: Record<string, number>) => void;
}) {
  const sessionRef = useRef(uid('inline'));
  const shownAt = useRef(Date.now());
  const [answers, setAnswers] = useState<Record<string, number>>(() => savedAnswers ?? {});
  const answersRef = useRef(answers);
  useEffect(()=>{
    if(!savedAnswers)return;
    if(Object.entries(savedAnswers).some(([id,value])=>answersRef.current[id]!==value)){
      const next={...answersRef.current,...savedAnswers};answersRef.current=next;setAnswers(next);
    }
  },[savedAnswers]);

  const answer = (q: Question, i: number) => {
    if (answersRef.current[q.id] != null) return;
    const next = { ...answersRef.current, [q.id]: i };
    answersRef.current = next;
    onAnswersChange?.(next);
    setAnswers(next);
    const progress = quizSummary(questions, next);
    onProgress?.(progress.answered, progress.correct);
    update((s) => recordPractice(s, q, i, sessionRef.current, Math.min(Date.now() - shownAt.current, 10 * 60_000)));
    shownAt.current = Date.now();
  };

  const done = questions.filter((q) => answers[q.id] != null);
  const correct = done.filter((q) => answers[q.id] === q.correctAnswer).length;

  return (
    <div className="inline-quiz">
      {questions.map((q, idx) => {
        const chosen = answers[q.id];
        const revealed = chosen != null;
        const ok = chosen === q.correctAnswer;
        return (
          <article key={q.id} className="inline-q" aria-labelledby={`iq-${q.id}`}>
            <div className="row between">
              <b id={`iq-${q.id}`}>Soru {idx + 1}</b>
              {revealed && <span className={`badge ${ok ? 'ok' : 'bad'}`}>{ok ? 'Doğru ✓' : 'Yanlış'}</span>}
            </div>
            <div className="mt-8">
              <QuestionMeta q={q} topicName={topicName} />
            </div>
            <div className="mt-12">
              <QuestionBody q={q} />
            </div>
            {!revealed && (
              <details className="question-hint">
                <summary>İpucu ister misin?</summary>
                <p>{q.hint}</p>
              </details>
            )}
            <Options q={q} selected={chosen} onSelect={(i) => answer(q, i)} reveal={revealed} disabled={revealed} />
            {revealed && (
              <div className={`feedback ${ok ? 'ok' : 'bad'}`} role="status">
                <b>{ok ? 'Harika, doğru!' : `Doğru cevap ${optionLetter(q.correctAnswer)}.`}</b>
                <details className="mt-8" open={!ok}>
                  <summary className="btn small">Çözümü gör</summary>
                  <div className="mt-12">
                    <SolutionBlock q={q} />
                  </div>
                </details>
                {!ok && <a className="btn small primary mt-8" href={href(`/pekistir/${q.id}`)}>Eksik bilgiyi tamamla · Pekiştir</a>}
                <a className="btn small ghost mt-8" href={href('/ogretmen', { soru: q.id, cevap: String(chosen), eylem: ok ? 'coz' : 'hatam' })}>
                  <Icon name="teacher" /> <AskLabel />
                </a>
              </div>
            )}
          </article>
        );
      })}
      {questions.length > 0 && (
        <div className="notice mt-12">
          <div className="grow">
            {done.length === questions.length
              ? `Bitti! ${questions.length} sorudan ${correct} doğru. ${correct === questions.length ? 'Mükemmel ♡' : 'Yanlışların “Yanlışlarım”a eklendi.'}`
              : `${done.length}/${questions.length} soru cevaplandı.`}
          </div>
          {onMore && done.length === questions.length && (
            <button type="button" className="btn small primary" onClick={onMore}>
              {moreLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
