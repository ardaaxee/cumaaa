import { useMemo } from 'react';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/Layout';
import { PandaBody } from '../components/MascotNav';
import { DailyQuestion } from '../components/DailyQuestion';
import { StudyQueue } from '../components/StudyQueue';
import { Empty, ProgressBar, toast } from '../components/ui';
import { navigate } from '../hooks/useRoute';
import { lookup } from '../services/lookup';
import { buildRecommendations, hasAnyData, type Recommendation } from '../services/recommendations';
import { launchAdaptivePractice, launchTest, makeConfig } from '../services/testLauncher';
import { usePetNeeds } from '../hooks/usePetNeeds';
import { needsMessage } from '../utils/petCare';
import { toggleTask } from '../store/actions';
import type { PlanTask } from '../store/schema';
import { update, useAppState } from '../store/store';
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
  const recs = useMemo(() => buildRecommendations(state, lookup, today), [state, today]);
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
  const targetLabel = [profile.targetUniversity, profile.targetDepartment].filter(Boolean).join(' · ');

  const smartStartLabel = activeTest
    ? 'Devam eden teste dön'
    : focusRunning
      ? 'Odak oturumuna dön'
      : nextTask
        ? nextTask.title
        : todayWrongOpen > 0
          ? `${todayWrongOpen} yanlışı düzelt`
          : due.length > 0
            ? `${due.length} tekrarı tamamla`
            : recs[0]?.title ?? 'Adaptif çalışma başlat';

  const smartStartDetail = activeTest
    ? `Soru ${activeTest.current + 1}/${activeTest.questionIds.length} · kaldığın yerden`
    : focusRunning
      ? 'Sayaç çalışıyor · kaldığın yerden devam et'
      : nextTask
        ? [nextTask.time, nextTask.estMinutes ? `${nextTask.estMinutes} dk` : '', nextTask.targetQuestions ? `${nextTask.targetQuestions} soru` : ''].filter(Boolean).join(' · ') || 'Bugünün sıradaki plan görevi'
        : todayWrongOpen > 0
          ? 'Önce açık yanlışlarını düzelt'
          : due.length > 0
            ? 'Unutmadan zamanı gelen konuları tekrar et'
            : recs[0]?.detail ?? 'Verine göre 12 soruluk adaptif pratik';

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

  return (
    <>
      <PageHeader title="Çalışma merkezim" sub={formatDay(today, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />

      <section className="card hero hero-panda" aria-labelledby="hello">
        <div className="hero-text">
          <div className="eyebrow">Bugünün çalışma alanı</div>
          <h2 id="hello">
            İyi ki buradasın{profile.name ? `, ${profile.name}` : ''} <span className="heart">♡</span>
          </h2>
          <p className="muted hero-copy">
            {daysLeft != null && daysLeft >= 0
              ? `YKS'ye ${daysLeft} gün kaldı. Bugünün hedefini bitir, kalanını yarına bırak.`
              : 'Bugün küçük ama tamamlanmış bir çalışma, yarım kalan büyük plandan daha değerlidir.'}
          </p>
          {(targetLabel || profile.preferredStudyTime) && (
            <div className="hero-personal-target">
              {targetLabel && <span>🎓 Hedef: <b>{targetLabel}</b></span>}
              {profile.preferredStudyTime && <span>🕒 Rahat çalışma saatin: <b>{profile.preferredStudyTime}</b></span>}
            </div>
          )}
          <div className="home-smart-start">
            <div className="home-smart-start-copy">
              <span className="eyebrow">Şimdi sıradaki</span>
              <b>{smartStartLabel}</b>
              <small>{smartStartDetail}</small>
            </div>
            <button type="button" className="btn primary study-cta" onClick={() => void smartStart()}>
              <Icon name="play" /> Şimdi başla
            </button>
          </div>
          <div className="hero-actions">
            <a className="btn hero-secondary" href="#/dersler">
              <Icon name="book" /> Dersleri aç
            </a>
            <a className="btn hero-secondary" href="#/testler">
              <Icon name="target" /> Soru bankası
            </a>
          </div>
          <div className="hero-kpis" aria-label="Bugünün özeti">
            <div><b>{d.todayQuestions}</b><span>soru</span></div>
            <div><b>{formatMinutes(d.todayMinutes)}</b><span>çalışma</span></div>
            <div><b>{d.streak}</b><span>gün seri</span></div>
          </div>
        </div>
        <div className="hero-mascot-wrap">
          <div className="speech">{petNeed ? (needs.hungry ? 'Acıktım 🎋' : 'Susadım 💧') : cheerOfDay(today)}</div>
          <a className="hero-mascot" href="#/pandam" aria-label={`${state.settings.pet.name}: seviye ${pet.level}${petNeed ? `. ${petNeed}` : ''}`}>
            <PandaBody
              size={104}
              waving={!petNeed && pet.mood !== 'uykulu'}
              sleepy={!petNeed && pet.mood === 'uykulu'}
              sad={!!petNeed}
              items={state.settings.pet.items}
            />
            <span className="pet-level">Sv. {pet.level}</span>
          </a>
        </div>
      </section>

      <StudyQueue />

      <section className="home-today-grid section" aria-label="Bugünün çalışma merkezi">
        <div className="card home-focus-card">
          <div className="card-head">
            <div>
              <div className="eyebrow">Bugünün hedefi</div>
              <h2>İki hedef, tek ekran</h2>
            </div>
            <a className="text-link" href="#/plan">Planı aç <Icon name="right" /></a>
          </div>

          <div className="home-goals">
            <div className="home-goal">
              <div className="row between nowrap">
                <span>Soru hedefi</span>
                <b>{d.todayQuestions} / {profile.dailyQuestionGoal}</b>
              </div>
              <ProgressBar value={qPct} label="Günlük soru hedefi" />
            </div>
            <div className="home-goal">
              <div className="row between nowrap">
                <span>Çalışma süresi</span>
                <b>{formatMinutes(d.todayMinutes)} / {formatMinutes(profile.dailyStudyMinutes)}</b>
              </div>
              <ProgressBar value={mPct} label="Günlük süre hedefi" />
            </div>
          </div>

          <div className="home-plan-preview">
            <div className="row between nowrap">
              <b>Bugünün planı</b>
              <span className="tiny muted">{todayTasks.filter((t) => t.done).length}/{todayTasks.length} tamamlandı</span>
            </div>
            {overdue.length > 0 && (
              <div className="home-overdue">
                <Icon name="alert" />
                <span>{overdue.length} eski görev bekliyor.</span>
                <a href="#/plan">Düzenle</a>
              </div>
            )}
            {todayTasks.length === 0 ? (
              <Empty title="Bugün için görev yok." action={<a className="btn small" href="#/plan">Görev ekle</a>}>
                Kısa ve gerçekçi bir plan ekleyip doğrudan başlayabilirsin.
              </Empty>
            ) : (
              <ul className="list home-task-list">
                {todayTasks.slice(0, 4).map((t) => (
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
            {todayTasks.length > 4 && <a className="home-more-link" href="#/plan">+{todayTasks.length - 4} görevi daha göster</a>}
          </div>
        </div>

        <div className="card home-coach-card">
          <div className="card-head">
            <div>
              <div className="eyebrow">Akıllı yönlendirme</div>
              <h2>Sıradaki en mantıklı adım</h2>
            </div>
            <span className="badge brand">Verine göre</span>
          </div>

          {!hasAnyData(state) ? (
            <Empty
              title="Seni tanımaya başlayalım."
              action={
                <button type="button" className="btn primary small" onClick={() => navigate('/koc')}>
                  Seviye tespitini başlat
                </button>
              }
            >
              Birkaç test ve konu çalışmasından sonra öneriler burada kişiselleşir.
              {profile.hardestSubject && <> En zorlandığın ders: {lookup.subjectName(profile.hardestSubject)}.</>}
            </Empty>
          ) : recs.length === 0 ? (
            <div className="home-clear-state">
              <span aria-hidden="true">✓</span>
              <div>
                <b>Bugün için acil öneri yok.</b>
                <p>Planındaki görevlere devam edebilirsin.</p>
              </div>
            </div>
          ) : (
            <div className="home-recommendation">
              <div className="home-rec-icon" aria-hidden="true">✦</div>
              <div className="grow">
                <b>{recs[0].title}</b>
                <p>{recs[0].detail}</p>
                <span>Dayanak: {recs[0].basis}</span>
              </div>
              <button type="button" className="btn small primary" onClick={() => void runRecommendation(recs[0])}>
                {recs[0].actionLabel}
              </button>
              <button type="button" className="btn small ghost" onClick={() => void launchAdaptivePractice(12).then((e) => e && toast(e))}>
                Adaptif 12 soru
              </button>
            </div>
          )}


        </div>
      </section>

      <details className="card section home-daily-practice"><summary>Bir soruyla ısın</summary><DailyQuestion /></details>

    </>
  );
}
