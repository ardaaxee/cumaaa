import { useMemo } from 'react';
import { SUBJECTS } from '../data/curriculum';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/Layout';
import { PomodoroCard } from '../components/PomodoroCard';
import { Empty, ProgressBar, Stat, toast } from '../components/ui';
import { navigate } from '../hooks/useRoute';
import { lookup, topicLabel } from '../services/lookup';
import { buildRecommendations, hasAnyData, type Recommendation } from '../services/recommendations';
import { launchTest, makeConfig } from '../services/testLauncher';
import { toggleTask } from '../store/actions';
import { update, useAppState } from '../store/store';
import { dayKey, diffDays, formatDay, formatMinutes } from '../utils/date';
import { formatNet } from '../utils/net';
import { dueReviews } from '../utils/srs';
import { dashboard } from '../utils/stats';

export async function runRecommendation(r: Recommendation): Promise<void> {
  const a = r.action;
  if (a.kind === 'topic') return navigate(`/konu/${a.topicId}`);
  if (a.kind === 'topic-test') {
    const err = await launchTest(makeConfig({ topicId: a.topicId, difficulty: a.difficulty ?? 'all', count: 10, origin: 'filtre' }));
    if (err) {
      const retry = await launchTest(makeConfig({ topicId: a.topicId, count: 10 }));
      if (retry) toast(retry);
    }
    return;
  }
  if (a.kind === 'wrongs') return navigate('/yanlislar');
  if (a.kind === 'reviews') return navigate('/tekrar');
  if (a.kind === 'mocks') return navigate('/denemeler');
  if (a.kind === 'focus') return navigate('/odak');
  return navigate('/testler');
}

export default function HomePage() {
  const state = useAppState();
  const today = dayKey();
  const d = useMemo(() => dashboard(state, today), [state, today]);
  const recs = useMemo(() => buildRecommendations(state, lookup, today), [state, today]);
  const due = dueReviews(state.reviews, today);
  const todayTasks = state.tasks.filter((t) => t.date === today);
  const overdue = state.tasks.filter((t) => t.date < today && !t.done);
  const { profile } = state;
  const daysLeft = profile.examDate ? diffDays(today, profile.examDate) : null;
  const qPct = profile.dailyQuestionGoal ? (d.todayQuestions / profile.dailyQuestionGoal) * 100 : 0;
  const mPct = profile.dailyStudyMinutes ? (d.todayMinutes / profile.dailyStudyMinutes) * 100 : 0;

  return (
    <>
      <PageHeader title="Odam" sub={formatDay(today, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />

      <section className="card hero hero-panda" aria-labelledby="hello">
        <div className="hero-text">
          <div className="eyebrow">Senin çalışma alanın</div>
          <h2 id="hello">
            İyi ki buradasın{profile.name ? `, ${profile.name}` : ''} <span className="heart">♡</span>
          </h2>
          <p className="muted" style={{ marginBottom: 0 }}>
            {daysLeft != null && daysLeft >= 0
              ? `Sınavına ${daysLeft} gün var. Bugün küçük ama net bir adım at.`
              : 'Küçük adımlar, büyük hayaller. Bugün kendin için bir adım at.'}
          </p>
        </div>
        <svg className="hero-mascot" viewBox="0 0 120 120" aria-hidden="true">
          <ellipse cx="30" cy="26" rx="15" ry="15" fill="#3a3238" />
          <ellipse cx="90" cy="26" rx="15" ry="15" fill="#3a3238" />
          <circle cx="60" cy="62" r="46" fill="#fbfbfa" />
          <ellipse cx="38" cy="62" rx="14" ry="16" fill="#2f2830" />
          <ellipse cx="82" cy="62" rx="14" ry="16" fill="#2f2830" />
          <circle cx="41" cy="64" r="4.6" fill="#fff" />
          <circle cx="85" cy="64" r="4.6" fill="#fff" />
          <ellipse cx="60" cy="76" rx="8" ry="6" fill="#2f2830" />
          <path d="M48 90 Q60 98 72 90" stroke="#2f2830" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </svg>
      </section>

      <section className="grid grid-4 section" aria-label="Bugünün özeti">
        <div className="stat">
          <div className="stat-label">Bugün çözülen soru</div>
          <div className="stat-value">
            {d.todayQuestions}
            <span className="small muted"> / {profile.dailyQuestionGoal}</span>
          </div>
          <ProgressBar value={qPct} label="Günlük soru hedefi" />
        </div>
        <div className="stat">
          <div className="stat-label">Bugünkü çalışma</div>
          <div className="stat-value">{formatMinutes(d.todayMinutes)}</div>
          <ProgressBar value={mPct} label="Günlük süre hedefi" />
        </div>
        <Stat label="Seri" value={`${d.streak} gün`} sub={d.streak ? 'kesintisiz aktif gün' : 'Bugün başla'} />
        <Stat
          label="Son deneme"
          value={d.lastMockNet != null ? `${formatNet(d.lastMockNet)} net` : '—'}
          sub={d.lastMockNet != null ? d.lastMockExam : 'Henüz deneme yok'}
        />
      </section>

      <div className="grid grid-cards section">
        <section className="card" aria-labelledby="rec-title">
          <div className="card-head">
            <h2 id="rec-title">Akıllı çalışma önerisi</h2>
            <span className="badge brand">Verine göre</span>
          </div>
          {!hasAnyData(state) ? (
            <Empty
              title="Henüz yeterli veri yok."
              action={
                <button type="button" className="btn primary" onClick={() => navigate('/testler')}>
                  İlk testini çöz
                </button>
              }
            >
              Test çözdükçe, konu tamamladıkça ve deneme girdikçe öneriler burada oluşur.
              {profile.hardestSubject && <> En zorlandığın ders: {lookup.subjectName(profile.hardestSubject)}.</>}
            </Empty>
          ) : recs.length === 0 ? (
            <Empty title="Bugün için ek öneri yok.">Hedeflerini tutturmuşsun. Planındaki görevlere devam et.</Empty>
          ) : (
            <ul className="list">
              {recs.slice(0, 4).map((r) => (
                <li key={r.id} className="list-item" style={{ alignItems: 'flex-start' }}>
                  <div className="grow">
                    <div style={{ fontWeight: 700 }}>{r.title}</div>
                    <div className="small muted">{r.detail}</div>
                    <div className="tiny muted mt-8">Dayanak: {r.basis}</div>
                  </div>
                  <button type="button" className="btn small" onClick={() => void runRecommendation(r)}>
                    {r.actionLabel}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card" aria-labelledby="rev-title">
          <div className="card-head">
            <h2 id="rev-title">Bugün tekrar etmen gerekenler</h2>
            <a className="btn small" href="#/tekrar">
              Tümü
            </a>
          </div>
          {due.length === 0 ? (
            <Empty title="Bugün tekrar yok.">Bir konuyu tamamladığında 1, 3, 7, 14 ve 30 gün sonra tekrar hatırlatılır.</Empty>
          ) : (
            <ul className="list">
              {due.slice(0, 5).map((r) => (
                <li key={r.topicId}>
                  <a className="link-row" href={`#/konu/${r.topicId}`}>
                    <Icon name="repeat" />
                    <span className="grow">{topicLabel(r.topicId)}</span>
                    <span className="badge warn">{r.dueDay < today ? 'Gecikti' : 'Bugün'}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card" aria-labelledby="plan-title">
          <div className="card-head">
            <h2 id="plan-title">Bugünün planı</h2>
            <a className="btn small" href="#/plan">
              Düzenle
            </a>
          </div>
          {overdue.length > 0 && (
            <div className="notice warn mb-8">
              {overdue.length} tamamlanmamış eski görev var. <a href="#/plan">Planda yarına taşıyabilirsin.</a>
            </div>
          )}
          {todayTasks.length === 0 ? (
            <Empty title="Bugün için görev yok." action={<a className="btn" href="#/plan">Görev ekle</a>} />
          ) : (
            <ul className="list">
              {todayTasks.map((t) => (
                <li key={t.id} className={`task${t.done ? ' done' : ''}`}>
                  <input
                    type="checkbox"
                    className="task-check"
                    checked={t.done}
                    onChange={() => update((s) => toggleTask(s, t.id))}
                    aria-label={`${t.title} tamamlandı`}
                  />
                  <div className="grow">
                    <div className="task-title">{t.title}</div>
                    <div className="task-meta">
                      {[t.time, t.estMinutes ? `${t.estMinutes} dk` : '', t.targetQuestions ? `${t.targetQuestions} soru` : ''].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <PomodoroCard compact />

        <section className="card" aria-labelledby="note-title">
          <div className="card-head">
            <h2 id="note-title">Defterim</h2>
            <Icon name="sparkle" />
          </div>
          <p className="small muted">Kareli sayfada kalemle formül, grafik ve renkli not tut.</p>
          <a className="btn primary block" href="#/defterim">
            Deftere geç
          </a>
        </section>
      </div>

      <section className="card section" aria-labelledby="quick-h">
        <h2 id="quick-h" className="mb-8">
          Hızlı ders seç
        </h2>
        <div className="chips">
          {SUBJECTS.slice(0, 8).map((s) => (
            <a key={s.id} className="chip" href={`#/ders/${s.id}`}>
              {s.icon} {s.name}
            </a>
          ))}
        </div>
      </section>

      <section className="grid grid-4 section" aria-label="Genel durum">
        <Stat label="Bu hafta çözülen" value={d.weekQuestions} />
        <Stat label="Bu hafta çalışma" value={formatMinutes(d.weekMinutes)} />
        <Stat label="Tamamlanan konu" value={d.completedTopics} />
        <Stat label="Doğruluk" value={d.accuracy != null ? `%${d.accuracy}` : '—'} sub={d.accuracy == null ? 'Henüz soru çözülmedi' : 'tüm zamanlar'} />
      </section>
    </>
  );
}
