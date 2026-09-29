import { useMemo, useState } from 'react';
import { AskLabel } from '../components/AskName';
import { SUBJECTS, getTopicRef, subjectLabel } from '../data/curriculum';
import { loadQuestionsByIds } from '../data/content';
import { useLoad } from '../hooks/useLoad';
import type { Question } from '../domain/types';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/Layout';
import { Options, QuestionBody, QuestionMeta, SolutionBlock } from '../components/QuestionView';
import { ConfirmDialog, Empty, Segmented, LoadFailed, Spinner, toast } from '../components/ui';
import { href } from '../hooks/useRoute';
import { launchTest, launchWithIds, makeConfig } from '../services/testLauncher';
import { removeWrong, setWrongLearned } from '../store/actions';
import { update, useAppState } from '../store/store';
import { weakTopics } from '../utils/analysis';
import { formatDay, dayKey } from '../utils/date';
import { optionLetter } from '../utils/ids';

export default function WrongsPage() {
  const state = useAppState();
  const [show, setShow] = useState<'acik' | 'ogrenildi'>('acik');
  const [subject, setSubject] = useState('all');
  const [open, setOpen] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<string | null>(null);

  // Yalnız gereken soruların dersleri yüklenir; hata olursa "Tekrar dene" görünür.
  const idKey = [...new Set(Object.values(state.wrongs).map((w) => w.questionId))].sort().join('|');
  const loaded = useLoad<Map<string, Question>>(() => loadQuestionsByIds(idKey ? idKey.split('|') : []), [idKey]);
  const byId = loaded.data ?? null;

  const weak = useMemo(() => weakTopics(state), [state]);
  const entries = Object.values(state.wrongs)
    .filter((w) => (show === 'acik' ? !w.learned : w.learned))
    .filter((w) => subject === 'all' || w.subjectId === subject)
    .sort((a, b) => b.lastAt.localeCompare(a.lastAt));
  const openCount = Object.values(state.wrongs).filter((w) => !w.learned).length;

  const run = async (p: Promise<string | null>) => {
    const err = await p;
    if (err) toast(err);
  };

  return (
    <>
      <PageHeader title="Yanlışlarım" sub={`${openCount} açık soru · yanlış ve boş bıraktıkların otomatik eklenir`} />

      {weak.length > 0 && (
        <section className="card" aria-labelledby="weak-h">
          <div className="card-head">
            <h2 id="weak-h">Zayıf konular</h2>
            <span className="badge bad">{weak.length}</span>
          </div>
          <ul className="list">
            {weak.slice(0, 6).map((w) => (
              <li key={w.topicId} className="list-item">
                <div className="grow">
                  <a href={`#/konu/${w.topicId}`}>
                    <b>{getTopicRef(w.topicId)?.topic.name ?? w.topicId}</b>
                  </a>
                  <div className="tiny muted">{w.reasons.join(' · ')}</div>
                </div>
                <button type="button" className="btn small" onClick={() => void run(launchTest(makeConfig({ topicId: w.topicId, count: 10, origin: 'filtre', title: `${getTopicRef(w.topicId)?.topic.name} testi` })))}>
                  Bu konudan test
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="card section">
        <div className="row between">
          <Segmented
            label="Görünüm"
            value={show}
            onChange={setShow}
            options={[
              { value: 'acik', label: 'Açık' },
              { value: 'ogrenildi', label: 'Öğrendiklerim' },
            ]}
          />
          <label className="field" style={{ minWidth: 180 }}>
            <span className="sr-only">Ders filtresi</span>
            <select className="select" value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option value="all">Tüm dersler</option>
              {SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {subjectLabel(s)}
                </option>
              ))}
            </select>
          </label>
        </div>
        {show === 'acik' && entries.length > 0 && (
          <button
            type="button"
            className="btn primary mt-12"
            onClick={() => void run(launchWithIds(entries.slice(0, 40).map((e) => e.questionId), makeConfig({ origin: 'yanlislar', mode: 'ogrenme', title: 'Yanlışlarım tekrarı' })))}
          >
            Listelenenleri tekrar çöz ({Math.min(40, entries.length)})
          </button>
        )}
      </div>

      <section className="section">
        {!byId ? (
          loaded.failed ? <LoadFailed what="Yanlışların" onRetry={loaded.retry} /> : <Spinner />
        ) : entries.length === 0 ? (
          <div className="card">
            <Empty title={show === 'acik' ? 'Açık yanlışın yok.' : 'Henüz “öğrendim” işaretlediğin soru yok.'}>
              {show === 'acik' ? 'Test çözdükçe yanlış ve boş bıraktığın sorular burada birikir.' : ''}
            </Empty>
          </div>
        ) : (
          <ul className="list card" style={{ padding: '4px 16px' }}>
            {entries.map((w) => {
              const q = byId.get(w.questionId);
              const ref = getTopicRef(w.topicId);
              const isOpen = open === w.questionId;
              if (!q) {
                return (
                  <li key={w.questionId} className="list-item">
                    <span className="grow small muted">Bu soru artık soru bankasında yok.</span>
                    <button type="button" className="btn small danger" onClick={() => update((s) => removeWrong(s, w.questionId))}>
                      Kaldır
                    </button>
                  </li>
                );
              }
              return (
                <li key={w.questionId} style={{ padding: '12px 0' }}>
                  <button
                    type="button"
                    className="link-row"
                    style={{ width: '100%', border: 0, background: 'transparent', textAlign: 'left' }}
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : w.questionId)}
                  >
                    <span className="grow">
                      <span className="small" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {q.question}
                      </span>
                      <span className="tiny muted">
                        {ref ? `${subjectLabel(ref.subject)} · ${ref.topic.name}` : ''} · {formatDay(dayKey(new Date(w.lastAt)))}
                      </span>
                    </span>
                    <span className="badge bad">{w.wrongCount}×</span>
                  </button>
                  {isOpen && (
                    <div className="mt-8">
                      <QuestionMeta q={q} topicName={ref?.topic.name} />
                      <div className="mt-12">
                        <QuestionBody q={q} />
                      </div>
                      <Options q={q} selected={w.lastAnswer} reveal disabled />
                      <p className="small mt-12">
                        Verdiğin cevap: <b>{w.lastAnswer == null ? 'Boş' : optionLetter(w.lastAnswer)}</b> · Doğru cevap: <b>{optionLetter(q.correctAnswer)}</b> · {w.wrongCount} kez yanlış/boş
                        {w.correctStreak > 0 && <> · Sonra {w.correctStreak} kez doğru çözdün</>}
                      </p>
                      <SolutionBlock q={q} />
                      <div className="tiny muted mt-8">İlk: {formatDay(dayKey(new Date(w.firstAt)))} · Son: {formatDay(dayKey(new Date(w.lastAt)))}</div>
                    </div>
                  )}
                  <div className="row mt-8">
                    <button type="button" className="btn small" onClick={() => void run(launchWithIds([q.id], makeConfig({ origin: 'tek-soru', mode: 'ogrenme', title: 'Tekrar çöz' })))}>
                      Tekrar çöz
                    </button>
                    <button
                      type="button"
                      className="btn small"
                      onClick={() => {
                        update((s) => setWrongLearned(s, q.id, !w.learned));
                        toast(w.learned ? 'Tekrar açık yanlışlara alındı.' : 'Öğrenildi olarak işaretlendi.');
                      }}
                    >
                      {w.learned ? 'Geri al' : 'Öğrendim'}
                    </button>
                    <a className="btn small" href={href('/ogretmen', { soru: q.id, cevap: w.lastAnswer != null ? String(w.lastAnswer) : undefined, eylem: 'hatam' })}>
                      <Icon name="teacher" /> <AskLabel />
                    </a>
                    <button type="button" className="btn small" onClick={() => void run(launchTest(makeConfig({ topicId: q.topic, count: 10, origin: 'filtre', title: `${ref?.topic.name ?? ''} testi` })))}>
                      Bu konudan test
                    </button>
                    <button type="button" className="btn small ghost danger" onClick={() => setToDelete(q.id)} aria-label="Yanlışlardan sil">
                      <Icon name="trash" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {toDelete && (
        <ConfirmDialog
          title="Yanlış kaydı silinsin mi?"
          message="Bu soru yanlışlar defterinden kaldırılır. Test geçmişin etkilenmez."
          confirmLabel="Sil"
          danger
          onCancel={() => setToDelete(null)}
          onConfirm={() => {
            update((s) => removeWrong(s, toDelete));
            setToDelete(null);
          }}
        />
      )}
    </>
  );
}
