import { useEffect, useMemo, useState } from 'react';
import { SUBJECTS, getSubject, subjectLabel, subjectTopics } from '../data/curriculum';
import { loadSubjectLessons } from '../data/content';
import { subjectColorFor } from '../data/subjectColors';
import type { LessonSeed, SubjectId } from '../domain/types';
import { PageHeader } from '../components/Layout';
import { Empty, Spinner } from '../components/ui';
import { href, navigate, useRoute } from '../hooks/useRoute';
import { useIsDark } from '../hooks/useIsDark';
import { norm } from '../services/localAssistant';

/** Sayısal derslerde formül yoğunluğu yüksek olduğu için varsayılan ders matematik. */
const FORMULA_SUBJECTS = SUBJECTS.filter((s) => !['tyt-turkce', 'tyt-tarih', 'tyt-cografya', 'tyt-felsefe', 'tyt-din'].includes(s.id));

export default function FormulasPage() {
  const route = useRoute();
  const isDark = useIsDark();
  const q0 = route.query.get('ders');
  const subjectId = (q0 && getSubject(q0) ? q0 : FORMULA_SUBJECTS[0].id) as SubjectId;
  const [lessons, setLessons] = useState<Map<string, LessonSeed> | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let alive = true;
    setLessons(null);
    loadSubjectLessons(subjectId).then((m) => alive && setLessons(m));
    return () => {
      alive = false;
    };
  }, [subjectId]);

  const color = subjectColorFor(subjectId, isDark);
  const groups = useMemo(() => {
    if (!lessons) return [];
    const needle = norm(search);
    return subjectTopics(subjectId)
      .map((t) => {
        const fs = (lessons.get(t.id)?.formulas ?? []).filter((f) => !needle || norm(`${t.name} ${f.expr} ${f.meaning}`).includes(needle));
        return { topic: t, formulas: fs };
      })
      .filter((g) => g.formulas.length);
  }, [lessons, subjectId, search]);
  const total = groups.reduce((n, g) => n + g.formulas.length, 0);

  return (
    <>
      <PageHeader title="Formül Defteri" sub="Tüm formüller tek yerde, anlamlarıyla" />
      <section className="card">
        <div className="chips" role="group" aria-label="Ders">
          {FORMULA_SUBJECTS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`chip${s.id === subjectId ? ' on' : ''}`}
              aria-pressed={s.id === subjectId}
              onClick={() => navigate(href('/formuller', { ders: s.id }), { replace: true })}
            >
              {s.icon} {subjectLabel(s)}
            </button>
          ))}
        </div>
        <label className="field mt-12">
          <span className="sr-only">Formül ara</span>
          <input className="input" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Formül ya da konu ara (ör. türev, mol, hız)" />
        </label>
        <div className="row between mt-8">
          <span className="tiny muted">{lessons ? `${total} formül` : ''}</span>
          <a className="btn small" href={href('/kartlar', { ders: subjectId })}>
            Kartlarla ezberle
          </a>
        </div>
      </section>

      {!lessons ? (
        <Spinner />
      ) : groups.length === 0 ? (
        <div className="card section">
          <Empty title={search ? 'Aramana uyan formül yok.' : 'Bu derste formül yok.'} />
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.topic.id} className="card section formula-group" style={{ ['--fc' as string]: color.fg, ['--fc-soft' as string]: color.soft }}>
            <div className="card-head">
              <h2 style={{ fontSize: '1.05rem' }}>{g.topic.name}</h2>
              <a className="btn small ghost" href={`#/konu/${g.topic.id}`}>
                Konuya git
              </a>
            </div>
            <ul className="formula-list">
              {g.formulas.map((f) => (
                <li key={f.expr}>
                  <div className="formula-expr">{f.expr}</div>
                  <div className="small muted">{f.meaning}</div>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </>
  );
}
