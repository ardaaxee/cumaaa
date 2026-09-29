import { useMemo, useState } from 'react';
import { SUBJECTS, getTopicRef, subjectLabel } from '../data/curriculum';
import { loadQuestionsByIds } from '../data/content';
import { useLoad } from '../hooks/useLoad';
import type { Question } from '../domain/types';
import { PageHeader } from '../components/Layout';
import { Options, QuestionBody, QuestionMeta, SolutionBlock } from '../components/QuestionView';
import { Empty, LoadFailed, Spinner, toast } from '../components/ui';
import { launchWithIds, makeConfig } from '../services/testLauncher';
import { useSelector } from '../store/store';

export default function SavedPage() {
  const favorites = useSelector((s) => s.favorites);
  const [subject, setSubject] = useState<string>('all');
  const [open, setOpen] = useState<string | null>(null);

  // Yalnız gereken soruların dersleri yüklenir; hata olursa "Tekrar dene" görünür.
  const idKey = [...new Set(Object.keys(favorites))].sort().join('|');
  const loaded = useLoad<Map<string, Question>>(() => loadQuestionsByIds(idKey ? idKey.split('|') : []), [idKey]);
  const byId = loaded.data ?? null;

  const list = useMemo(() => {
    if (!byId) return [];
    return Object.entries(favorites)
      .sort((a, b) => b[1].localeCompare(a[1]))
      .map(([id]) => byId.get(id))
      .filter((q): q is Question => !!q && (subject === 'all' || q.subject === subject));
  }, [favorites, byId, subject]);

  const subjectsWithSaved = useMemo(() => {
    if (!byId) return [];
    const ids = new Set(Object.keys(favorites).map((id) => byId.get(id)?.subject));
    return SUBJECTS.filter((s) => ids.has(s.id));
  }, [favorites, byId]);

  const solveAll = async () => {
    const err = await launchWithIds(
      list.map((q) => q.id),
      makeConfig({ origin: 'filtre', mode: 'ogrenme', count: list.length, title: 'Kaydettiğim sorular' }),
    );
    if (err) toast(err);
  };

  return (
    <>
      <PageHeader title="Kaydettiğim sorular" sub="Sorulardaki ☆ Kaydet ile eklenir" />
      {!byId ? (
        loaded.failed ? <LoadFailed what="Kaydedilen sorular" onRetry={loaded.retry} /> : <Spinner />
      ) : Object.keys(favorites).length === 0 ? (
        <div className="card">
          <Empty title="Henüz kaydettiğin soru yok." action={<a className="btn primary" href="#/testler">Test çöz</a>}>
            Beğendiğin ya da tekrar bakmak istediğin sorularda “☆ Kaydet”e dokun; hepsi burada toplanır.
          </Empty>
        </div>
      ) : (
        <>
          <section className="card">
            <div className="row between">
              <label className="field" style={{ minWidth: 180 }}>
                <span>Ders</span>
                <select className="select" value={subject} onChange={(e) => setSubject(e.target.value)}>
                  <option value="all">Tümü ({Object.keys(favorites).length})</option>
                  {subjectsWithSaved.map((s) => (
                    <option key={s.id} value={s.id}>
                      {subjectLabel(s)}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" className="btn primary" onClick={() => void solveAll()} disabled={!list.length} style={{ alignSelf: 'flex-end' }}>
                {list.length} soruyu çöz
              </button>
            </div>
          </section>
          <ul className="list section">
            {list.map((q) => {
              const ref = getTopicRef(q.topic);
              const isOpen = open === q.id;
              return (
                <li key={q.id} className="card saved-item">
                  <QuestionMeta q={q} topicName={ref?.topic.name} />
                  <button type="button" className="saved-toggle" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : q.id)}>
                    <span className="grow">{q.question.length > 140 && !isOpen ? `${q.question.slice(0, 140)}…` : isOpen ? 'Soruyu gizle' : q.question}</span>
                    <span aria-hidden="true">{isOpen ? '▲' : '▼'}</span>
                  </button>
                  {isOpen && (
                    <div className="stack mt-8">
                      <QuestionBody q={q} />
                      <Options q={q} selected={q.correctAnswer} reveal disabled />
                      <SolutionBlock q={q} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </>
  );
}
