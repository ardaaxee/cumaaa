import { useMemo, useRef, useState } from 'react';
import { InlineQuiz } from '../components/InlineQuiz';
import { PageHeader } from '../components/Layout';
import { PandaBody } from '../components/MascotNav';
import { Empty, LoadFailed, SourceBadge, Spinner, toast } from '../components/ui';
import { SUBJECTS, getSubject, getTopicRef, subjectLabel, subjectTopics } from '../data/curriculum';
import { loadLesson, loadTopicQuestions } from '../data/content';
import type { LessonSeed } from '../domain/types';
import { useLoad } from '../hooks/useLoad';
import { href, navigate } from '../hooks/useRoute';
import { addStudyMinutes, setTopicStatus } from '../store/actions';
import { getState, update, useAppState } from '../store/store';
import { pickQuestions } from '../utils/testEngine';
import { suggestTopics } from '../utils/studyPick';

/**
 * Adım adım ders çalışma: konu özeti → formül ve örnekler → konu soruları → bitiş.
 * Geçen süre çalışma günlüğüne, sorular istatistiğe ve yanlışlar defterine işlenir.
 */
const STEPS = ['Özet', 'Örnekler', 'Sorular', 'Bitti'] as const;
const QUIZ_SIZE = 5;
const MAX_LOGGED_MIN = 90;

function Chooser() {
  const state = useAppState();
  const suggestions = useMemo(() => suggestTopics(state), [state]);
  const [subjectId, setSubjectId] = useState('');
  const topics = subjectId ? subjectTopics(subjectId) : [];

  return (
    <>
      <PageHeader title="Ders çalış" sub="Bir konu seç, adım adım birlikte çalışalım ♡" />
      <section className="card study-suggest-card" aria-labelledby="sug-h">
        <h2 id="sug-h" className="mb-8">
          Bugün için önerim
        </h2>
        <ul className="list">
          {suggestions.map((s) => {
            const ref = getTopicRef(s.topicId);
            if (!ref) return null;
            return (
              <li key={s.topicId}>
                <a className="link-row" href={`#/calis/${s.topicId}`}>
                  <span className="grow">
                    <b>{ref.topic.name}</b>
                    <span className="tiny muted" style={{ display: 'block' }}>
                      {subjectLabel(ref.subject)} · {s.reason}
                    </span>
                  </span>
                  <span className="btn small primary">Başla</span>
                </a>
              </li>
            );
          })}
        </ul>
      </section>
      <section className="card section study-picker-card" aria-labelledby="pick-h">
        <h2 id="pick-h" className="mb-8">
          Kendin seç
        </h2>
        <div className="form-grid two">
          <label className="field">
            <span>Ders</span>
            <select className="select" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              <option value="">Ders seç</option>
              {SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {subjectLabel(s)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Konu</span>
            <select className="select" value="" disabled={!subjectId} onChange={(e) => e.target.value && navigate(`/calis/${e.target.value}`)}>
              <option value="">{subjectId ? 'Konu seç' : 'Önce ders seç'}</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                  {state.topicProgress[t.id]?.status === 'tamamlandi' ? ' ✓' : ''}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>
    </>
  );
}

function SummaryStep({ lesson }: { lesson: LessonSeed }) {
  return (
    <article className="lesson">
      <h2>Konuya giriş</h2>
      {lesson.intro.split(/\n\n+/).map((p, i) => (
        <p key={i} className="pre-line">
          {p}
        </p>
      ))}
      <h2>Temel kavramlar</h2>
      <dl className="concept">
        {lesson.concepts.map((c, i) => (
          <div key={i}>
            <dt>{c.term}</dt>
            <dd>{c.definition}</dd>
          </div>
        ))}
      </dl>
      <h2>1 dakikalık özet</h2>
      <ul>
        {lesson.summary.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </article>
  );
}

function ExamplesStep({ lesson }: { lesson: LessonSeed }) {
  return (
    <article className="lesson">
      {lesson.formulas.length > 0 && (
        <>
          <h2>Formüller</h2>
          {lesson.formulas.map((f, i) => (
            <div key={i} className="formula">
              <code>{f.expr}</code>
              <div className="meaning">{f.meaning}</div>
            </div>
          ))}
        </>
      )}
      <h2>Çözümlü örnekler</h2>
      {lesson.examples.map((ex, i) => (
        <div key={i} className="example">
          <b>Örnek {i + 1}</b>
          <p className="pre-line mt-8">{ex.problem}</p>
          <details>
            <summary className="btn small">Önce kendin dene, sonra çözümü aç</summary>
            <ol>
              {ex.steps.map((s, j) => (
                <li key={j} className="pre-line">
                  {s}
                </li>
              ))}
            </ol>
            <div className="answer">Cevap: {ex.answer}</div>
          </details>
        </div>
      ))}
      <div className="callout ok">
        <b>Püf noktası</b>
        <ul>
          {lesson.tips.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>
      <div className="callout bad">
        <b>Sık yapılan hatalar</b>
        <ul>
          {lesson.commonMistakes.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function Session({ topicId }: { topicId: string }) {
  const ref = getTopicRef(topicId);
  const lessonLoad = useLoad(() => loadLesson(topicId).then((l) => l ?? null), [topicId]);
  const qLoad = useLoad(() => loadTopicQuestions(topicId), [topicId]);
  const quiz = useMemo(() => {
    const qs = qLoad.data ?? [];
    const ids = pickQuestions(qs, QUIZ_SIZE, getState().attempts);
    return ids.map((id) => qs.find((q) => q.id === id)!).filter(Boolean);
  }, [qLoad.data]);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState({ answered: 0, correct: 0 });
  const startedAt = useRef(Date.now());
  const logged = useRef(false);
  const state = useAppState();
  const petName = state.settings.pet.name;

  if (!ref) return <Empty title="Bu konu bulunamadı." action={<a className="btn" href="#/calis">Konu seç</a>} />;
  const lesson = lessonLoad.data;
  const hasLesson = !!lesson;
  const steps = hasLesson ? STEPS : (['Sorular', 'Bitti'] as const);
  const current = steps[Math.min(step, steps.length - 1)];

  const go = (i: number) => {
    setStep(i);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const finish = () => {
    if (!logged.current) {
      logged.current = true;
      const minutes = Math.min(MAX_LOGGED_MIN, Math.round((Date.now() - startedAt.current) / 60_000));
      update((s) => {
        const started = s.topicProgress[topicId]?.status === 'tamamlandi' ? s : setTopicStatus(s, topicId, 'calisiliyor');
        return addStudyMinutes(started, minutes, 'calisma', new Date(), ref.subject.id);
      });
    }
    go(steps.length - 1);
  };

  const complete = () => {
    update((s) => setTopicStatus(s, topicId, 'tamamlandi'));
    toast(`Konu tamamlandı 🎉 ${petName} 2 bambu kazandı!`);
  };

  const status = state.topicProgress[topicId]?.status;
  const next = suggestTopics(state, undefined, 3).find((s) => s.topicId !== topicId);
  const loading = lessonLoad.data === undefined && !lessonLoad.failed;

  return (
    <>
      <PageHeader title={ref.topic.name} sub={`${subjectLabel(ref.subject)} · adım adım çalışma`} back="#/calis" />
      <ol className="study-steps" aria-label="Çalışma adımları">
        {steps.map((s, i) => (
          <li key={s} className={i === step ? 'current' : i < step ? 'done' : ''} aria-current={i === step ? 'step' : undefined}>
            <span>{i < step ? '✓' : i + 1}</span>
            {s}
          </li>
        ))}
      </ol>

      <div className="card section">
        {lessonLoad.failed ? (
          <LoadFailed what="Konu anlatımı" onRetry={lessonLoad.retry} />
        ) : loading ? (
          <Spinner label="Konu yükleniyor" />
        ) : current === 'Özet' && lesson ? (
          <SummaryStep lesson={lesson} />
        ) : current === 'Örnekler' && lesson ? (
          <ExamplesStep lesson={lesson} />
        ) : current === 'Sorular' ? (
          <>
            <div className="card-head">
              <h2>Konu soruları</h2>
              <SourceBadge type="ozgun-pratik" />
            </div>
            {qLoad.failed ? (
              <LoadFailed what="Sorular" onRetry={qLoad.retry} />
            ) : !qLoad.data ? (
              <Spinner label="Sorular yükleniyor" />
            ) : quiz.length === 0 ? (
              <Empty title="Bu konu için henüz soru yok." />
            ) : (
              <InlineQuiz questions={quiz} topicName={ref.topic.name} onProgress={(answered, correct) => setScore({ answered, correct })} />
            )}
          </>
        ) : (
          <div className="center study-done">
            <PandaBody size={120} waving />
            <h2>Harika çalıştın ♡</h2>
            <p className="muted">
              {score.answered ? `${score.answered} sorudan ${score.correct} doğru. ` : ''}
              Çalışma süren günlüğüne eklendi; {petName} için yemek ve su kazandın 🎋💧
            </p>
            <div className="row" style={{ justifyContent: 'center' }}>
              {status !== 'tamamlandi' && (
                <button type="button" className="btn primary" onClick={complete}>
                  Konuyu tamamla
                </button>
              )}
              <a className="btn" href={href('/kartlar', { ders: ref.subject.id, konu: topicId })}>
                Kartlarla pekiştir
              </a>
              <a className="btn ghost" href={`#/konu/${topicId}`}>
                Konunun tamamı
              </a>
            </div>
            {next && (
              <a className="notice mt-12" href={`#/calis/${next.topicId}`}>
                <span className="grow">
                  Sıradaki: <b>{getTopicRef(next.topicId)?.topic.name}</b> <span className="tiny muted">({next.reason})</span>
                </span>
                <span className="btn small primary">Devam</span>
              </a>
            )}
          </div>
        )}
      </div>

      {!loading && current !== 'Bitti' && (
        <div className="runner-nav">
          <button type="button" className="btn" disabled={step === 0} onClick={() => go(step - 1)}>
            Geri
          </button>
          {current === 'Sorular' ? (
            <button type="button" className="btn primary" onClick={finish} disabled={quiz.length > 0 && score.answered < quiz.length}>
              {quiz.length > 0 && score.answered < quiz.length ? `${score.answered}/${quiz.length} cevaplandı` : 'Bitir ♡'}
            </button>
          ) : (
            <button type="button" className="btn primary" onClick={() => go(step + 1)}>
              {steps[step + 1] === 'Sorular' ? 'Sorulara geç' : 'Devam'}
            </button>
          )}
        </div>
      )}
    </>
  );
}

export default function StudyPage({ params }: { params: string[] }) {
  const topicId = params[0];
  if (!topicId) return <Chooser />;
  if (!getTopicRef(topicId) && getSubject(topicId)) {
    const first = subjectTopics(topicId)[0];
    if (first) return <Session key={first.id} topicId={first.id} />;
  }
  return <Session key={topicId} topicId={topicId} />;
}
