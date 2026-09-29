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
  const working = topics.filter((t) => progress[t.id]?.status === 'calisiliyor').length;
  const nextTopic =
    topics.find((t) => progress[t.id]?.status === 'calisiliyor') ??
    topics.find((t) => progress[t.id]?.status !== 'tamamlandi') ??
    topics[0];
  const pct = topics.length ? Math.round((done / topics.length) * 100) : 0;
  const accent = subjectColorFor(subject.id, isDark);

  return (
    <>
      <PageHeader title={subjectLabel(subject)} sub={`${topics.length} konu · ${done} tamamlandı`} back="#/dersler" />

      <section
        className="card subject-hero-card"
        style={{ ['--subject-fg' as string]: accent.fg, ['--subject-soft' as string]: accent.soft }}
        aria-label={`${subjectLabel(subject)} özeti`}
      >
        <div className="subject-hero-main">
          <span className="subject-hero-icon" aria-hidden="true">{subject.icon}</span>
          <div className="grow">
            <div className="eyebrow">{subject.exam} çalışma yolu</div>
            <h2>{subjectLabel(subject)}</h2>
            <p className="small muted">
              {done === topics.length && topics.length > 0
                ? 'Tüm konuları tamamladın. Tekrar ve denemelerle bilgiyi koru.'
                : working
                  ? `${working} konu üzerinde çalışıyorsun. Kaldığın yerden devam et.`
                  : 'Konuları sırayla ilerlet; her konunun sonunda kısa testle pekiştir.'}
            </p>
          </div>
        </div>

        <div className="subject-hero-progress">
          <div className="row between nowrap">
            <b>%{pct} tamamlandı</b>
            <span className="tiny muted">{done}/{topics.length} konu</span>
          </div>
          <ProgressBar value={pct} label="Ders ilerlemesi" />
        </div>

        <div className="subject-hero-actions">
          {nextTopic && (
            <a className="btn primary" href={`#/konu/${nextTopic.id}`}>
              {progress[nextTopic.id]?.status === 'calisiliyor' ? 'Kaldığın yerden devam et' : done === topics.length ? 'Konuları tekrar et' : 'Sıradaki konuya başla'}
            </a>
          )}
          <a className="btn" href={`#/testler?ders=${subject.id}`}>Bu dersten test çöz</a>
        </div>

        <div className="subject-hero-meta">
          <SourceBadge type="meb-program" />
          {subject.examQuestionCount != null && <span className="badge">Sınavda yaklaşık {subject.examQuestionCount} soru</span>}
          {subject.note && <span className="tiny muted">{subject.note}</span>}
        </div>
      </section>

      <div className="subject-units">
        {subject.units.map((unit) => {
          const unitDone = unit.topics.filter((t) => progress[t.id]?.status === 'tamamlandi').length;
          const unitPct = unit.topics.length ? Math.round((unitDone / unit.topics.length) * 100) : 0;
          return (
            <section key={unit.id} className="card section subject-unit-card" aria-labelledby={`${unit.id}-h`}>
              <div className="subject-unit-head">
                <div>
                  <div className="eyebrow">Ünite</div>
                  <h2 id={`${unit.id}-h`}>{unit.name}</h2>
                </div>
                <div className="subject-unit-progress">
                  <b>%{unitPct}</b>
                  <span>{unitDone}/{unit.topics.length}</span>
                </div>
              </div>

              <ProgressBar value={unitPct} label={`${unit.name} ilerlemesi`} />

              <ul className="list subject-topic-list">
                {unit.topics.map((t, i) => {
                  const st = progress[t.id]?.status ?? 'baslanmadi';
                  const step = topicColorStep(subject.id, i);
                  return (
                    <li key={t.id}>
                      <a
                        className="link-row subject-topic-row"
                        href={`#/konu/${t.id}`}
                        style={{ ['--topic-accent' as string]: isDark ? step.dark : step.light }}
                      >
                        <span className={`status-dot ${st}`} aria-hidden="true" />
                        <span className="grow">
                          <b>{t.name}</b>
                          <span className="tiny muted subject-topic-meta">
                            {t.grade}. sınıf · {t.subtopics.length} alt başlık
                          </span>
                        </span>
                        {t.priority && <span className="badge brand">Öncelikli</span>}
                        <span className={`badge ${st === 'tamamlandi' ? 'ok' : st === 'calisiliyor' ? 'warn' : ''}`}>{STATUS_LABEL[st]}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
