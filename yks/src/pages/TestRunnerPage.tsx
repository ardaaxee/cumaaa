import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AskLabel } from '../components/AskName';
import { getTopicRef } from '../data/curriculum';
import { loadQuestions } from '../data/content';
import type { Question } from '../domain/types';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/Layout';
import { Options, QuestionBody, QuestionMeta, SolutionBlock } from '../components/QuestionView';
import { ConfirmDialog, Empty, Spinner, toast } from '../components/ui';
import { href, navigate } from '../hooks/useRoute';
import {
  abandonTest,
  addTimeToQuestion,
  answerQuestion,
  appendQuestionToTest,
  finishTest,
  goToQuestion,
  revealQuestion,
  toggleMark,
} from '../store/actions';
import { getState, update, useSelector } from '../store/store';
import { formatClock } from '../utils/date';
import { optionLetter } from '../utils/ids';
import { answeredCount, findSimilar } from '../utils/testEngine';

const COMMIT_EVERY_MS = 5000;

function firstSentence(text: string): string {
  const m = text.match(/^(.+?[.!?])(\s|$)/s);
  return (m ? m[1] : text).slice(0, 220);
}

export default function TestRunnerPage() {
  const test = useSelector((s) => s.activeTest);
  const [byId, setById] = useState<Map<string, Question> | null>(null);
  const [all, setAll] = useState<Question[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [, force] = useState(0);
  const pendingRef = useRef(0);
  const lastRef = useRef(Date.now());
  const finishingRef = useRef(false);

  useEffect(() => {
    loadQuestions().then((qs) => {
      setAll(qs);
      setById(new Map(qs.map((q) => [q.id, q])));
    });
  }, []);

  const currentId = test ? test.questionIds[test.current] : undefined;

  const commitTime = useCallback(() => {
    const t = getState().activeTest;
    const id = t?.questionIds[t.current];
    const ms = pendingRef.current;
    pendingRef.current = 0;
    if (id && ms > 0) update((s) => addTimeToQuestion(s, id, ms));
  }, []);

  const doFinish = useCallback(() => {
    if (finishingRef.current || !byId) return;
    finishingRef.current = true;
    commitTime();
    let resultId: string | null = null;
    update((s) => {
      const r = finishTest(s, byId);
      resultId = r.result?.id ?? null;
      return r.state;
    });
    if (resultId) navigate(`/sonuc/${resultId}`, { replace: true });
  }, [byId, commitTime]);

  // Zamanlayıcı: yalnız sayfa görünürken süre sayılır.
  useEffect(() => {
    if (!test) return;
    lastRef.current = Date.now();
    let sinceCommit = 0;
    const id = setInterval(() => {
      const now = Date.now();
      const delta = document.visibilityState === 'visible' ? Math.min(now - lastRef.current, 5000) : 0;
      lastRef.current = now;
      pendingRef.current += delta;
      sinceCommit += delta;
      if (sinceCommit >= COMMIT_EVERY_MS) {
        sinceCommit = 0;
        commitTime();
      }
      force((n) => n + 1);
    }, 1000);
    const onHide = () => {
      if (document.visibilityState === 'hidden') commitTime();
      lastRef.current = Date.now();
    };
    document.addEventListener('visibilitychange', onHide);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onHide);
      commitTime();
    };
  }, [test?.id, commitTime]); // eslint-disable-line react-hooks/exhaustive-deps

  const elapsed = (test?.elapsedMs ?? 0) + pendingRef.current;
  const remaining = test?.timeLimitMs != null ? Math.max(0, test.timeLimitMs - elapsed) : null;

  useEffect(() => {
    if (remaining === 0 && test && byId) {
      toast('Süre doldu. Test otomatik olarak bitirildi.', 4000);
      doFinish();
    }
  }, [remaining, test, byId, doFinish]);

  const go = useCallback(
    (index: number) => {
      commitTime();
      setShowHint(false);
      update((s) => goToQuestion(s, index));
      window.scrollTo({ top: 0 });
    },
    [commitTime],
  );

  const q = currentId && byId ? byId.get(currentId) : undefined;
  const isLearn = test?.config.mode === 'ogrenme';
  const chosen = currentId ? test?.answers[currentId] : undefined;
  const revealed = !!(currentId && test?.revealed[currentId]);

  const select = useCallback(
    (i: number) => {
      if (!currentId || !test) return;
      if (isLearn && test.revealed[currentId]) return;
      update((s) => answerQuestion(s, currentId, i));
      if (isLearn) {
        commitTime();
        update((s) => revealQuestion(s, currentId));
      }
    },
    [currentId, test, isLearn, commitTime],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!test || confirmFinish || confirmExit) return;
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      const letters = ['a', 'b', 'c', 'd', 'e'];
      const k = e.key.toLowerCase();
      if (letters.includes(k)) select(letters.indexOf(k));
      else if (['1', '2', '3', '4', '5'].includes(k)) select(Number(k) - 1);
      else if (e.key === 'ArrowRight' && test.current < test.questionIds.length - 1) go(test.current + 1);
      else if (e.key === 'ArrowLeft' && test.current > 0) go(test.current - 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [test, select, go, confirmFinish, confirmExit]);

  const counts = useMemo(() => {
    if (!test) return { answered: 0, blank: 0, marked: 0 };
    const answered = answeredCount(test);
    return { answered, blank: test.questionIds.length - answered, marked: test.questionIds.filter((id) => test.marked[id]).length };
  }, [test]);

  if (!test) {
    return (
      <>
        <PageHeader title="Test" back="#/testler" />
        <Empty title="Devam eden test yok." action={<a className="btn primary" href="#/testler">Test oluştur</a>} />
      </>
    );
  }
  if (!byId) return <Spinner label="Sorular yükleniyor" />;
  if (!q) {
    return (
      <>
        <PageHeader title="Test" back="#/testler" />
        <Empty title="Bu testteki sorular bulunamadı." action={<button type="button" className="btn" onClick={() => { update(abandonTest); navigate('/testler'); }}>Testi kapat</button>} />
      </>
    );
  }

  const last = test.current === test.questionIds.length - 1;
  const topicName = getTopicRef(q.topic)?.topic.name;
  const isCorrect = chosen === q.correctAnswer;

  const addSimilar = () => {
    const sim = findSimilar(q, all, new Set(test.questionIds));
    if (!sim) return toast('Bu konuda başka soru kalmadı.');
    update((s) => appendQuestionToTest(s, sim.id));
    go(test.questionIds.length);
    toast('Benzer soru teste eklendi.');
  };

  return (
    <>
      <div className="runner-bar">
        <div className="row between nowrap">
          <div>
            <div className="tiny muted">{test.config.title ?? (isLearn ? 'Öğrenme modu' : 'Sınav modu')}</div>
            <div style={{ fontWeight: 800 }}>
              Soru {test.current + 1} / {test.questionIds.length}
            </div>
          </div>
          <div className="center" aria-live="off">
            <div className="tiny muted">{remaining != null ? 'Kalan süre' : 'Geçen süre'}</div>
            <div style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: remaining != null && remaining < 60_000 ? 'var(--bad)' : undefined }}>
              {formatClock(remaining ?? elapsed)}
            </div>
          </div>
          <div className="row nowrap">
            <button type="button" className="icon-btn" aria-label="Soru listesini aç" aria-expanded={paletteOpen} onClick={() => setPaletteOpen((o) => !o)}>
              <Icon name="more" />
            </button>
            <button type="button" className="icon-btn" aria-label="Testten çık" onClick={() => setConfirmExit(true)}>
              <Icon name="close" />
            </button>
          </div>
        </div>
        <div className="row tiny muted mt-8">
          <span>Çözülen: {counts.answered}</span>
          <span>· Boş: {counts.blank}</span>
          <span>· İşaretli: {counts.marked}</span>
        </div>
      </div>

      {paletteOpen && (
        <div className="card mb-8">
          <div className="palette" role="group" aria-label="Soru numaraları">
            {test.questionIds.map((id, i) => {
              const a = test.answers[id];
              const qq = byId.get(id);
              let cls = a != null ? 'answered' : '';
              if (isLearn && test.revealed[id] && qq) cls = a === qq.correctAnswer ? 'dogru' : 'yanlis';
              if (test.marked[id]) cls += ' marked';
              if (i === test.current) cls += ' current';
              return (
                <button
                  key={id}
                  type="button"
                  className={cls}
                  onClick={() => {
                    go(i);
                    setPaletteOpen(false);
                  }}
                  aria-label={`Soru ${i + 1}${a != null ? ', cevaplandı' : ', boş'}${test.marked[id] ? ', işaretli' : ''}`}
                  aria-current={i === test.current ? 'step' : undefined}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="tiny muted mt-8">Mor: cevaplandı · Turuncu nokta: işaretli · Beyaz: boş</div>
        </div>
      )}

      <article className="card" aria-labelledby="q-title">
        <h2 id="q-title" className="sr-only">
          Soru {test.current + 1}
        </h2>
        <QuestionMeta q={q} topicName={topicName} />
        <div className="mt-12">
          <QuestionBody q={q} />
        </div>
        <Options q={q} selected={chosen} onSelect={select} reveal={isLearn && revealed} disabled={isLearn && revealed} />

        <div className="row mt-12">
          <button type="button" className="btn small" aria-pressed={!!test.marked[q.id]} onClick={() => update((s) => toggleMark(s, q.id))}>
            <Icon name="flag" /> {test.marked[q.id] ? 'İşareti kaldır' : 'Soruyu işaretle'}
          </button>
          {!isLearn && chosen != null && (
            <button type="button" className="btn small" onClick={() => update((s) => answerQuestion(s, q.id, null))}>
              Cevabı temizle
            </button>
          )}
          {!revealed && (
            <button
              type="button"
              className="btn small ghost"
              onClick={() => {
                update((s) => answerQuestion(s, q.id, null));
                if (!last) go(test.current + 1);
              }}
            >
              Boş bırak
            </button>
          )}
          {isLearn && !revealed && (
            <button type="button" className="btn small ghost" onClick={() => setShowHint((h) => !h)} aria-expanded={showHint}>
              İpucu
            </button>
          )}
        </div>
        {showHint && !revealed && <div className="callout mt-12">{q.hint}</div>}

        {isLearn && revealed && (
          <div className={`feedback ${isCorrect ? 'ok' : 'bad'}`} role="status">
            <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{isCorrect ? 'Doğru ✓' : `Yanlış — doğru cevap ${optionLetter(q.correctAnswer)}`}</div>
            <p className="mt-8">{firstSentence(q.solution)}</p>
            <details>
              <summary className="btn small">Detaylı çözüm</summary>
              <div className="mt-12">
                <SolutionBlock q={q} />
              </div>
            </details>
            <div className="row mt-12">
              <a className="btn small" href={href('/ogretmen', { soru: q.id, cevap: chosen != null ? String(chosen) : undefined, eylem: isCorrect ? 'coz' : 'hatam' })}>
                <Icon name="teacher" /> <AskLabel />
              </a>
              <button type="button" className="btn small" onClick={addSimilar}>
                Benzer soru
              </button>
            </div>
          </div>
        )}
      </article>

      <div className="runner-nav">
        <button type="button" className="btn" disabled={test.current === 0} onClick={() => go(test.current - 1)}>
          <Icon name="left" /> Geri
        </button>
        <button type="button" className="btn" onClick={() => setConfirmFinish(true)}>
          Bitir
        </button>
        {last ? (
          <button type="button" className="btn primary" onClick={() => setConfirmFinish(true)}>
            Testi bitir
          </button>
        ) : (
          <button type="button" className="btn primary" onClick={() => go(test.current + 1)}>
            İleri <Icon name="right" />
          </button>
        )}
      </div>

      {confirmFinish && (
        <ConfirmDialog
          title="Testi bitirmek istiyor musun?"
          message={
            <>
              <p>
                Çözülen: <b>{counts.answered}</b> · Boş: <b>{counts.blank}</b> · İşaretli: <b>{counts.marked}</b>
              </p>
              {counts.blank > 0 && <p>Boş sorular yanlışlar defterine “boş” olarak eklenecek.</p>}
            </>
          }
          confirmLabel="Testi bitir"
          onCancel={() => setConfirmFinish(false)}
          onConfirm={() => {
            setConfirmFinish(false);
            doFinish();
          }}
        />
      )}
      {confirmExit && (
        <ConfirmDialog
          title="Testten çıkılsın mı?"
          message="Testi kaydetmeden kapatırsan cevapların silinir. Kaydetmek için “Testi bitir”i kullan. Sadece sayfadan ayrılmak istiyorsan menüden başka sayfaya geçebilirsin; test kaldığı yerden devam eder."
          confirmLabel="Kaydetmeden kapat"
          danger
          onCancel={() => setConfirmExit(false)}
          onConfirm={() => {
            setConfirmExit(false);
            update(abandonTest);
            navigate('/testler', { replace: true });
          }}
        />
      )}
    </>
  );
}
