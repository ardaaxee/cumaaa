import { getSubject, subjectLabel } from '../data/curriculum';
import { subjectColorFor, topicColorStep } from '../data/subjectColors';
import { PageHeader } from '../components/Layout';
import { Empty, ProgressBar, SourceBadge } from '../components/ui';
import { useIsDark } from '../hooks/useIsDark';
import { useSelector } from '../store/store';
import { STATUS_LABEL } from './SubjectsPage';

export default function SubjectPage({ params }: { params: string[] }) {
  const subject = getSubject(params[0] ?? '');
  const progress = useSelector((s) => s.topicProgress);
  const isDark = useIsDark();
  if (!subject) {
    return (
      <>
        <PageHeader title="Ders bulunamadı" back="#/dersler" />
        <Empty title="Bu ders bulunamadı." action={<a className="btn" href="#/dersler">Derslere dön</a>} />
      </>
    );
  }
  const topics = subject.units.flatMap((u) => u.topics);
  const done = topics.filter((t) => progress[t.id]?.status === 'tamamlandi').length;
  const accent = subjectColorFor(subject.id, isDark);
  return (
    <>
      <PageHeader title={subjectLabel(subject)} sub={`${topics.length} konu · ${done} tamamlandı`} back="#/dersler" />
      <div className="card" style={{ borderColor: accent.fg, borderWidth: 2 }}>
        <div className="row nowrap">
          <span className="subject-icon" aria-hidden="true" style={{ background: accent.soft, color: accent.fg }}>
            {subject.icon}
          </span>
          <div className="grow">
            <ProgressBar value={topics.length ? (done / topics.length) * 100 : 0} label="Ders ilerlemesi" />
          </div>
        </div>
        <div className="row mt-12">
          <SourceBadge type="meb-program" />
          {subject.examQuestionCount != null && <span className="badge">Sınavda yaklaşık {subject.examQuestionCount} soru</span>}
        </div>
        {subject.note && <p className="small muted mt-8" style={{ marginBottom: 0 }}>{subject.note}</p>}
      </div>

      {subject.units.map((unit) => (
        <section key={unit.id} className="card section" aria-labelledby={`${unit.id}-h`}>
          <h2 id={`${unit.id}-h`} className="mb-8">
            {unit.name}
          </h2>
          <ul className="list">
            {unit.topics.map((t, i) => {
              const st = progress[t.id]?.status ?? 'baslanmadi';
              const step = topicColorStep(subject.id, i);
              return (
                <li key={t.id}>
                  <a className="link-row" href={`#/konu/${t.id}`} style={{ borderLeft: `4px solid ${isDark ? step.dark : step.light}`, paddingLeft: 10, marginLeft: -4 }}>
                    <span className={`status-dot ${st}`} aria-hidden="true" />
                    <span className="grow">
                      <b>{t.name}</b>
                      <span className="tiny muted" style={{ display: 'block' }}>
                        {t.grade}. sınıf · {t.subtopics.map((s) => s.name).join(', ')}
                      </span>
                    </span>
                    {t.priority && <span className="badge brand">Kapsamlı anlatım</span>}
                    <span className="badge">{STATUS_LABEL[st]}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </>
  );
}
