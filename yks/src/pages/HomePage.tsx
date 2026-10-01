import { useMemo } from 'react';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/Layout';
import { PandaBody } from '../components/MascotNav';
import { ProgressBar, toast } from '../components/ui';
import { navigate } from '../hooks/useRoute';
import { lookup } from '../services/lookup';
import { hasAnyData, whatToStudyToday, type Recommendation } from '../services/recommendations';
import { launchAdaptivePractice, launchTest, makeConfig } from '../services/testLauncher';
import { usePetNeeds } from '../hooks/usePetNeeds';
import { needsMessage } from '../utils/petCare';
import type { PlanTask } from '../store/schema';
import { useAppState } from '../store/store';
import { dayKey, diffDays, formatDay, formatMinutes } from '../utils/date';
import { dueReviews } from '../utils/srs';
import { dashboard } from '../utils/stats';
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

async function runPlanTask(t: PlanTask): Promise<void> {
  if (t.type === 'konu' || t.type === 'tekrar') return navigate(t.topicId ? `/konu/${t.topicId}` : '/tekrar');
  if (t.type === 'test') {
    const target = t.targetQuestions ?? 10;
    const count = [5, 10, 20, 40].find((n) => n >= target) ?? 40;
    const err = await launchTest(
      makeConfig({
        subjectId: t.subjectId ?? 'all',
        topicId: t.topicId ?? 'all',
        count,
        origin: 'plan',
        title: t.title,
      }),
    );
    if (err) toast(err);
    return;
  }
  if (t.type === 'yanlis') return navigate('/yanlislar');
  if (t.type === 'deneme') return navigate('/denemeler');
  if (t.type === 'video') return navigate('/kaynaklar');
  return navigate('/plan');
}

export default function HomePage() {
  const state = useAppState();
  const today = dayKey();
  const d = useMemo(() => dashboard(state, today), [state, today]);
  const recs = useMemo(() => whatToStudyToday(state, lookup, today), [state, today]);
  const due = dueReviews(state.reviews, today);
  const todayTasks = state.tasks.filter((t) => t.date === today);
  const overdue = state.tasks.filter((t) => t.date < today && !t.done);
  const { profile } = state;
  const pet = useMemo(() => petStatus(state, today), [state, today]);
  const needs = usePetNeeds();
  const petNeed = needsMessage(state.settings.pet.name, needs);
  const daysLeft = profile.examDate ? diffDays(today, profile.examDate) : null;
  const qPct = profile.dailyQuestionGoal ? (d.todayQuestions / profile.dailyQuestionGoal) * 100 : 0;
  const mPct = profile.dailyStudyMinutes ? (d.todayMinutes / profile.dailyStudyMinutes) * 100 : 0;
  const activeTest = state.activeTest;
  const nextTask = todayTasks.find((t) => !t.done) ?? overdue[0] ?? null;
  const focusRunning = state.pomodoro.running && state.pomodoro.phase === 'odak';
  const todayWrongOpen = Object.values(state.wrongs).filter((w) => !w.learned).length;

  const smartStart = async () => {
    if (activeTest) return navigate('/test');
    if (focusRunning) return navigate('/odak');
    if (nextTask) return runPlanTask(nextTask);
    if (todayWrongOpen > 0) return navigate('/yanlislar');
    if (due.length > 0) return navigate('/tekrar');
    if (recs[0]) return runRecommendation(recs[0]);
    const err = await launchAdaptivePractice(12);
    if (err) toast(err);
  };

  // B) Bugünün rotası: en fazla 3 net görev (gerçek veriden; uydurma yok).
  const route: { key: string; title: string; detail: string; run: () => void }[] = [];
  if (activeTest) route.push({ key: 'test', title: 'Devam eden testi bitir', detail: `Soru ${activeTest.current + 1}/${activeTest.questionIds.length}`, run: () => navigate('/test') });
  for (const t of [...overdue, ...todayTasks.filter((x) => !x.done)].slice(0, 3)) {
    route.push({
      key: t.id,
      title: t.title,
      detail: [t.time, t.estMinutes ? `${t.estMinutes} dk` : '', t.targetQuestions ? `${t.targetQuestions} soru` : '', t.date < today ? 'gecikmiş' : 'bugünkü planda'].filter(Boolean).join(' · '),
      run: () => void runPlanTask(t),
    });
  }
  if (due.length) route.push({ key: 'tekrar', title: `${due.length} konunun tekrar günü`, detail: 'Aralıklı tekrar · 5 dakikalık tekrar', run: () => navigate('/tekrar') });
  if (todayWrongOpen) route.push({ key: 'yanlis', title: `${Math.min(todayWrongOpen, 10)} yanlışı yeniden çöz`, detail: `${todayWrongOpen} açık yanlış`, run: () => navigate('/yanlislar') });
  for (const r of recs) route.push({ key: r.id, title: r.title, detail: r.basis, run: () => void runRecommendation(r) });
  const todayRoute = route.filter((r, i, all) => all.findIndex((x) => x.key === r.key) === i).slice(0, 3);

  // C) Devam et: son çalışılan konu, son test, son defter sayfası.
  const lastTopic = Object.entries(state.topicProgress)
    .filter(([, p]) => p.startedAt)
    .sort(([, a], [, b]) => (b.completedAt ?? b.startedAt ?? '').localeCompare(a.completedAt ?? a.startedAt ?? ''))[0];
  const lastTopicName = lastTopic ? lookup.topicName(lastTopic[0]) : null;
  const lastResult = state.testResults[state.testResults.length - 1];
  const lastPage = [...state.notebookPages].sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))[0];
  const goalPct = Math.round(Math.min(100, Math.max(qPct, mPct)));
  const tip = recs[0];

  return (
    <>
      <PageHeader title="Odam" sub={formatDay(today, { weekday: 'long', day: 'numeric', month: 'long' })} />

      <section className="card home-hello" aria-labelledby="hello">
        <div className="grow">
          <h2 id="hello">
            İyi ki buradasın{profile.name ? `, ${profile.name}` : ''} <span className="heart">♡</span>
          </h2>
          <p className="muted" style={{ margin: 0 }}>
            {daysLeft != null && daysLeft >= 0 ? `Sınava ${daysLeft} gün kaldı.` : cheerOfDay(today)}
          </p>
        </div>
        <a className="home-hello-panda" href="#/pandam" aria-label={`${state.settings.pet.name}: seviye ${pet.level}${petNeed ? `. ${petNeed}` : ''}`}>
          <PandaBody size={64} waving={!petNeed && pet.mood !== 'uykulu'} sleepy={!petNeed && pet.mood === 'uykulu'} sad={!!petNeed} items={state.settings.pet.items} />
          {petNeed && <span className="home-hello-need">{needs.hungry ? '🎋' : '💧'}</span>}
        </a>
      </section>

      <section className="card section home-route" aria-labelledby="route-h">
        <div className="eyebrow" id="route-h">
          Bugünün rotası
        </div>
        {todayRoute.length === 0 ? (
          <div className="home-route-empty">
            <p className="small muted" style={{ marginTop: 0 }}>
              Bugün için bekleyen görev yok. Kısa bir çalışma ile başla:
            </p>
            <button type="button" className="btn primary" onClick={() => void smartStart()}>
              <Icon name="play" /> Ders çalışmaya başla
            </button>
          </div>
        ) : (
          <ol className="home-route-list">
            {todayRoute.map((r, i) => (
              <li key={r.key}>
                <span className="home-route-num" aria-hidden="true">
                  {i + 1}
                </span>
                <div className="grow">
                  <b>{r.title}</b>
                  <span className="tiny muted">{r.detail}</span>
                </div>
                <button type="button" className={`btn small${i === 0 ? ' primary' : ''}`} onClick={r.run}>
                  {i === 0 ? 'Başla' : 'Aç'}
                </button>
              </li>
            ))}
          </ol>
        )}
      </section>

      {(lastTopic || lastResult || lastPage) && (
        <section className="card section home-continue" aria-labelledby="cont-h">
          <div className="eyebrow" id="cont-h">
            Devam et
          </div>
          <div className="home-continue-row">
            {lastTopic && lastTopicName && (
              <a href={`#/konu/${lastTopic[0]}`}>
                <span aria-hidden="true">📚</span>
                <span className="grow">
                  <b>{lastTopicName}</b>
                  <span className="tiny muted">son konu</span>
                </span>
              </a>
            )}
            {lastResult && (
              <a href={`#/sonuc/${lastResult.id}`}>
                <span aria-hidden="true">✅</span>
                <span className="grow">
                  <b>{lastResult.config.title ?? 'Son test'}</b>
                  <span className="tiny muted">{formatDay(lastResult.day)}</span>
                </span>
              </a>
            )}
            {lastPage && (
              <a href={`#/defterim/${lastPage.id}`}>
                <span aria-hidden="true">📓</span>
                <span className="grow">
                  <b>{lastPage.title}</b>
                  <span className="tiny muted">defter</span>
                </span>
              </a>
            )}
          </div>
        </section>
      )}

      <section className="home-stats section" aria-label="Bugünün özeti">
        <div>
          <b>{d.todayQuestions}</b>
          <span>bugünkü soru</span>
        </div>
        <div>
          <b>{formatMinutes(d.todayMinutes)}</b>
          <span>çalışma süresi</span>
        </div>
        <div>
          <b>%{goalPct}</b>
          <span>günlük hedef</span>
          <ProgressBar value={goalPct} label="Günlük hedef" />
        </div>
      </section>

      {hasAnyData(state) && tip && (
        <section className="card section home-tip" aria-labelledby="tip-h">
          <div className="eyebrow" id="tip-h">
            Akıllı öneri
          </div>
          <b>{tip.title}</b>
          <p className="small muted" style={{ margin: '4px 0 8px' }}>
            Neden: {tip.basis}
          </p>
          <button type="button" className="btn small" onClick={() => void runRecommendation(tip)}>
            {tip.actionLabel}
          </button>
        </section>
      )}
      {!hasAnyData(state) && (
        <section className="card section home-tip">
          <div className="eyebrow">Akıllı öneri</div>
          <b>Seni tanımaya başlayalım</b>
          <p className="small muted" style={{ margin: '4px 0 8px' }}>
            Henüz yeterli veri yok. Kısa seviye tespitinden sonra öneriler kişiselleşir.
          </p>
          <button type="button" className="btn small" onClick={() => navigate('/koc')}>
            Seviye tespiti
          </button>
        </section>
      )}
    </>
  );
}
