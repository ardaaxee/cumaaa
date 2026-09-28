import { useMemo } from 'react';
import { SUBJECTS, subjectLabel } from '../data/curriculum';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/Layout';
import { PandaBody } from '../components/MascotNav';
import { AssistantCharacter } from '../components/AssistantCharacter';
import { DailyQuestion } from '../components/DailyQuestion';
import { PartnerMessages } from '../components/PartnerMessages';
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
import { computeBadges } from '../utils/badges';
import { petStatus } from '../utils/pet';

/** Uygulamaya özgü kısa moral cümleleri; tarihe göre her gün biri seçilir. */
const CHEERS = [
  'Bugün 1 konu bile yeter ♡',
  'Yavaş ama emin adımlar!',
  'Hata yapmak öğrenmenin yarısı.',
  'Kahveni al, başlayalım ☕',
  'Dünden daha iyisin!',
  'Küçük tekrar, büyük fark.',
  'Sen yaparsın, biliyorum.',
  'Bir test, bir mola, bir gülümseme.',
  'Bugün kendine iyi davran.',
  'Soru soru, net net ✦',
];

function cheerOfDay(day: string): string {
  let h = 0;
  for (const ch of day) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return CHEERS[h % CHEERS.length];
}

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
  const cardsDue = Object.values(state.cards).filter((c) => c.dueDay <= today).length;
  const pet = useMemo(() => petStatus(state, today), [state, today]);
  const earnedBadges = useMemo(() => computeBadges(state, today).filter((b) => b.earned).length, [state, today]);
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
        <div className="hero-mascot-wrap">
          <div className="speech">{cheerOfDay(today)}</div>
          <a className="hero-mascot" href="#/pandam" aria-label={`${state.settings.pet.name}: seviye ${pet.level}`}>
            <PandaBody size={96} waving={pet.mood !== 'uykulu'} sleepy={pet.mood === 'uykulu'} items={state.settings.pet.items} />
            <span className="pet-level">Sv. {pet.level}</span>
          </a>
        </div>
      </section>

      <PartnerMessages />

      <nav className="quick-grid section" aria-label="Hızlı başla">
        <button
          type="button"
          className="quick-tile t-lilac"
          onClick={() => void launchTest(makeConfig({ count: 10, title: 'Hızlı 10 soru' })).then((e) => e && toast(e))}
        >
          <span className="quick-emoji" aria-hidden="true">⚡</span>
          <b>Hızlı 10 soru</b>
          <span className="tiny muted">Karışık, ÖSYM tarzı</span>
        </button>
        <a className="quick-tile t-rose" href="#/kartlar">
          <span className="quick-emoji" aria-hidden="true">🃏</span>
          <b>Bilgi kartları</b>
          <span className="tiny muted">{cardsDue ? `${cardsDue} kart tekrar zamanı` : 'Kavram & formül ezberi'}</span>
        </a>
        <a className="quick-tile t-sky" href="#/formuller">
          <span className="quick-emoji" aria-hidden="true">📐</span>
          <b>Formül defteri</b>
          <span className="tiny muted">Tüm formüller tek yerde</span>
        </a>
        <a className="quick-tile t-mint" href="#/pandam">
          <span className="quick-emoji" aria-hidden="true">🐼</span>
          <b>{state.settings.pet.name}</b>
          <span className="tiny muted">Seviye {pet.level} · {pet.todayXp} XP bugün</span>
        </a>
        <a className="quick-tile t-sky" href="#/karne">
          <span className="quick-emoji" aria-hidden="true">📊</span>
          <b>Haftalık karne</b>
          <span className="tiny muted">Bu haftanın özeti</span>
        </a>
        <a className="quick-tile t-peach" href="#/rozetler">
          <span className="quick-emoji" aria-hidden="true">🏅</span>
          <b>Rozetlerim</b>
          <span className="tiny muted">{earnedBadges} rozet kazandın</span>
        </a>
      </nav>

      <section className="grid grid-4 section" aria-label="Bugünün özeti">
        <div className="stat tint-lilac">
          <div className="stat-label">✎ Bugün çözülen soru</div>
          <div className="stat-value">
            {d.todayQuestions}
            <span className="small muted"> / {profile.dailyQuestionGoal}</span>
          </div>
          <ProgressBar value={qPct} label="Günlük soru hedefi" />
        </div>
        <div className="stat tint-mint">
          <div className="stat-label">⏱ Bugünkü çalışma</div>
          <div className="stat-value">{formatMinutes(d.todayMinutes)}</div>
          <ProgressBar value={mPct} label="Günlük süre hedefi" />
        </div>
        <Stat tint="peach" label="♨ Seri" value={`${d.streak} gün`} sub={d.streak ? 'kesintisiz aktif gün' : 'Bugün başla'} />
        <Stat
          tint="sky"
          label="✦ Son deneme"
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

        <section className="card asst-home" aria-labelledby="asst-h">
          <a href="#/ogretmen" className="asst-home-link">
            <AssistantCharacter mood="happy" size={92} />
            <div className="grow">
              <h2 id="asst-h" style={{ margin: 0 }}>
                {state.settings.teacherName}
              </h2>
              <p className="small muted" style={{ margin: '4px 0 10px' }}>
                Konu anlat, soru çöz, yanlışlarına bak… Yaz ya da sesle sor, cevabı sesli söylesin.
              </p>
              <span className="btn small primary">Konuşalım ♡</span>
            </div>
          </a>
        </section>


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

      <DailyQuestion />

      <section className="card section" aria-labelledby="quick-h">
        <h2 id="quick-h" className="mb-8">
          Hızlı ders seç
        </h2>
        <div className="chips">
          {SUBJECTS.map((s) => (
            <a key={s.id} className="chip" href={`#/ders/${s.id}`}>
              {s.icon} {subjectLabel(s)}
            </a>
          ))}
        </div>
      </section>

      <section className="grid grid-4 section" aria-label="Genel durum">
        <Stat tint="lilac" label="Bu hafta çözülen" value={d.weekQuestions} />
        <Stat tint="mint" label="Bu hafta çalışma" value={formatMinutes(d.weekMinutes)} />
        <Stat tint="peach" label="Tamamlanan konu" value={d.completedTopics} />
        <Stat tint="rose" label="Doğruluk" value={d.accuracy != null ? `%${d.accuracy}` : '—'} sub={d.accuracy == null ? 'Henüz soru çözülmedi' : 'tüm zamanlar'} />
      </section>
    </>
  );
}
