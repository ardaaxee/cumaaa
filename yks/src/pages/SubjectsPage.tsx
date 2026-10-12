import { useMemo, useState } from 'react';
import { SUBJECTS, allTopics, subjectLabel } from '../data/curriculum';
import { subjectColorFor } from '../data/subjectColors';
import { PageHeader } from '../components/Layout';
import { Empty, ProgressBar, SourceBadge } from '../components/ui';
import { useIsDark } from '../hooks/useIsDark';
import { RabbitFace } from '../components/MascotNav';
import { normalizeName } from '../store/migrations';
import type { TopicStatus } from '../store/schema';
import { useSelector } from '../store/store';

const STATUS_LABEL: Record<TopicStatus, string> = {
  baslanmadi: 'Başlanmadı',
  calisiliyor: 'Çalışılıyor',
  tamamlandi: 'Tamamlandı',
};

export { STATUS_LABEL };

export default function SubjectsPage() {
  const progress = useSelector((s) => s.topicProgress);
  const isDark = useIsDark();
  const [q, setQ] = useState('');
  const [exam, setExam] = useState<'all' | 'TYT' | 'AYT'>('all');
  const [subject, setSubject] = useState('all');
  const [status, setStatus] = useState<'all' | TopicStatus>('all');

  const statusOf = (id: string): TopicStatus => progress[id]?.status ?? 'baslanmadi';
  const filtering = q.trim() !== '' || status !== 'all' || subject !== 'all';

  const results = useMemo(() => {
    const nq = normalizeName(q);
    return allTopics().filter(
      (r) =>
        (exam === 'all' || r.subject.exam === exam) &&
        (subject === 'all' || r.subject.id === subject) &&
        (status === 'all' || (progress[r.topic.id]?.status ?? 'baslanmadi') === status) &&
        (!nq ||
          normalizeName(r.topic.name).includes(nq) ||
          normalizeName(r.unit.name).includes(nq) ||
          r.topic.subtopics.some((s) => normalizeName(s.name).includes(nq))),
    );
  }, [q, exam, subject, status, progress]);

  const subjects = SUBJECTS.filter((s) => exam === 'all' || s.exam === exam);

  return (
    <>
      <PageHeader title="Dersler" sub="TYT + AYT Sayısal · konu haritası" />
      <div className="card subject-filter-card">
        <span className="peek peek-rabbit" aria-hidden="true">
          <RabbitFace />
        </span>
        <div className="subject-search-row">
          <label className="field subject-search">
            <span>Konu ara</span>
            <input className="input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Türev, mol, paragraf…" />
          </label>
          <div className="subject-exam-tabs" role="group" aria-label="Sınav türü">
            {(['all', 'TYT', 'AYT'] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={`chip${exam === value ? ' on' : ''}`}
                aria-pressed={exam === value}
                onClick={() => {
                  setExam(value);
                  setSubject('all');
                }}
              >
                {value === 'all' ? 'Tümü' : value}
              </button>
            ))}
          </div>
        </div>

        <details className="subject-advanced-filter" open={subject !== 'all' || status !== 'all'}>
          <summary>Filtreleri daralt</summary>
          <div className="form-grid two mt-12">
            <label className="field">
              <span>Ders</span>
              <select className="select" value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option value="all">Tüm dersler</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {subjectLabel(s)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Durum</span>
              <select className="select" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
                <option value="all">Tümü</option>
                <option value="baslanmadi">Başlanmadı</option>
                <option value="calisiliyor">Çalışılıyor</option>
                <option value="tamamlandi">Tamamlandı</option>
              </select>
            </label>
          </div>
          {(q || subject !== 'all' || status !== 'all') && (
            <button
              type="button"
              className="btn small ghost mt-8"
              onClick={() => {
                setQ('');
                setSubject('all');
                setStatus('all');
              }}
            >
              Filtreleri temizle
            </button>
          )}
        </details>

        <div className="subject-source-note">
          <SourceBadge type="meb-program" />
          <span>Konular okul programındaki sırayı takip edecek şekilde düzenlenmiştir.</span>
        </div>
      </div>

      {filtering ? (
        <section className="card section subject-results-card" aria-live="polite">
          <div className="card-head">
            <h2>{results.length} konu bulundu</h2>
          </div>
          {results.length === 0 ? (
            <Empty title="Eşleşen konu yok.">Aramayı ya da filtreleri değiştir.</Empty>
          ) : (
            <ul className="list">
              {results.map((r) => (
                <li key={r.topic.id}>
                  <a className="link-row" href={`#/konu/${r.topic.id}`}>
                    <span className={`status-dot ${statusOf(r.topic.id)}`} aria-hidden="true" />
                    <span className="grow">
                      <b>{r.topic.name}</b>
                      <span className="tiny muted" style={{ display: 'block' }}>
                        {subjectLabel(r.subject)} · {r.unit.name}
                      </span>
                    </span>
                    <span className="badge">{STATUS_LABEL[statusOf(r.topic.id)]}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <div className="grid grid-cards three section subject-grid">
          {subjects.map((s) => {
            const topics = s.units.flatMap((u) => u.topics);
            const done = topics.filter((t) => statusOf(t.id) === 'tamamlandi').length;
            const working = topics.filter((t) => statusOf(t.id) === 'calisiliyor').length;
            const accent = subjectColorFor(s.id, isDark);
            return (
              <a
                key={s.id}
                className="card link-row subject-card"
                href={`#/ders/${s.id}`}
                style={{ ['--subject-fg' as string]: accent.fg, ['--subject-soft' as string]: accent.soft }}
              >
                <div className="row nowrap">
                  <span className="subject-icon subject-card-icon" aria-hidden="true">
                    {s.icon}
                  </span>
                  <div className="grow">
                    <div className="tiny muted">{s.exam}</div>
                    <h3>{s.name}</h3>
                  </div>
                </div>
                <div className="small muted mt-8">
                  {done}/{topics.length} konu tamamlandı{working ? ` · ${working} çalışılıyor` : ''}
                </div>
                <div className="mt-8">
                  <ProgressBar value={topics.length ? (done / topics.length) * 100 : 0} label={`${subjectLabel(s)} ilerlemesi`} />
                </div>
              </a>
            );
          })}
        </div>
      )}
    </>
  );
}
