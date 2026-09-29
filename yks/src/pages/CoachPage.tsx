import { useMemo, useState } from 'react';
import { SUBJECTS, getTopicRef, subjectLabel } from '../data/curriculum';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/Layout';
import { ConfirmDialog, ProgressBar, Stat, toast } from '../components/ui';
import { buildAdaptivePlan, nextBestTopics, subjectMastery } from '../services/adaptiveStudy';
import { launchAdaptivePractice, launchDiagnostic, hasActiveTest } from '../services/testLauncher';
import { addTask, deleteTask } from '../store/actions';
import { update, useAppState } from '../store/store';
import { dayKey, formatMinutes } from '../utils/date';
import { dashboard } from '../utils/stats';
import { dueReviews } from '../utils/srs';

const BAND_LABEL = {
  yeni: 'Yeni',
  kritik: 'Kritik',
  gelisiyor: 'Gelişiyor',
  iyi: 'İyi',
  guclu: 'Güçlü',
} as const;

export default function CoachPage() {
  const state = useAppState();
  const today = dayKey();
  const [confirmDiagnostic, setConfirmDiagnostic] = useState(false);
  const [confirmPlan, setConfirmPlan] = useState(false);
  const d = useMemo(() => dashboard(state, today), [state, today]);
  const plan = useMemo(() => buildAdaptivePlan(state, today, 7), [state, today]);
  const next = useMemo(() => nextBestTopics(state, 6, today), [state, today]);
  const subjects = useMemo(
    () =>
      SUBJECTS.map((s) => ({ subject: s, mastery: subjectMastery(state, s.id, today) }))
        .sort((a, b) => {
          const aStarted = a.mastery.confidence > 0 ? 1 : 0;
          const bStarted = b.mastery.confidence > 0 ? 1 : 0;
          return bStarted - aStarted || a.mastery.score - b.mastery.score;
        }),
    [state, today],
  );

  const evidenceSubjects = subjects.filter((x) => x.mastery.confidence > 0);
  const overall =
    evidenceSubjects.length > 0
      ? Math.round(evidenceSubjects.reduce((sum, x) => sum + x.mastery.score, 0) / evidenceSubjects.length)
      : null;
  const confidence =
    subjects.length > 0
      ? Math.round(subjects.reduce((sum, x) => sum + x.mastery.confidence, 0) / subjects.length)
      : 0;
  const pendingToday = state.tasks.filter((t) => t.date === today && !t.done);
  const smartFuture = state.tasks.filter((t) => t.date >= today && !t.done && t.title.startsWith('Akıllı ·'));
  const dueToday = dueReviews(state.reviews, today);
  const openWrongs = Object.values(state.wrongs).filter((w) => !w.learned).length;
  const lead = next[0];
  const leadRef = lead ? getTopicRef(lead.topicId) : undefined;
  const target =
    d.lastMockExam === 'TYT'
      ? state.profile.tytTarget
      : d.lastMockExam === 'AYT'
        ? state.profile.aytTarget
        : null;
  const targetGap = target != null && d.lastMockNet != null ? Math.round((target - d.lastMockNet) * 100) / 100 : null;

  const runDiagnostic = async () => {
    setConfirmDiagnostic(false);
    const err = await launchDiagnostic();
    if (err) toast(err, 5000);
  };

  const applyPlan = () => {
    update((s) => {
      let nextState = s;
      for (const task of s.tasks.filter((t) => t.date >= today && !t.done && t.title.startsWith('Akıllı ·'))) {
        nextState = deleteTask(nextState, task.id);
      }
      for (const task of buildAdaptivePlan(nextState, today, 7).tasks) {
        nextState = addTask(nextState, task);
      }
      return nextState;
    });
    setConfirmPlan(false);
    toast('Akıllı 7 günlük planın güncellendi. Kendi eklediğin görevler korunuyor.', 4500);
  };

  return (
    <>
      <PageHeader
        title="Akıllı Koç"
        sub="Seviye tespiti · adaptif soru · kişisel çalışma planı"
        actions={
          <a className="btn small" href="#/gelisim">
            <Icon name="chart" /> Analiz
          </a>
        }
      />

      <section className="coach-hero">
        <div className="coach-hero-copy">
          <div className="eyebrow">Kişisel çalışma motoru</div>
          <h2>{state.profile.name ? state.profile.name + ', bugün' : 'Bugün'} ne çalışman gerektiğini verin belirlesin.</h2>
          <p>
            Sistem; çözdüğün soruları, açık yanlışlarını, tekrar tarihlerini, konu ilerlemeni ve günlük hedeflerini birlikte değerlendirir.
            Yeni veri geldikçe öneriler değişir.
          </p>
          <div className="coach-actions">
            <button
              type="button"
              className="btn primary"
              onClick={() => (hasActiveTest() ? setConfirmDiagnostic(true) : void runDiagnostic())}
            >
              <Icon name="target" /> {confidence < 18 ? 'Seviye tespitini başlat' : 'Seviye tespitini yenile'}
            </button>
            <button type="button" className="btn" onClick={() => void launchAdaptivePractice(12).then((e) => e && toast(e))}>
              <Icon name="sparkle" /> Adaptif 12 soru
            </button>
          </div>
        </div>
        <div className="coach-readiness" aria-label="Hazırbulunuşluk">
          <span>Genel hakimiyet</span>
          <b>{overall == null ? '—' : '%' + overall}</b>
          <small>{confidence < 18 ? 'Önce seviye tespiti önerilir' : 'Veri güveni %' + confidence}</small>
        </div>
      </section>

      <section className="grid grid-4 section coach-kpis" aria-label="Bugünün özeti">
        <Stat label="Bugün soru" value={d.todayQuestions + '/' + state.profile.dailyQuestionGoal} />
        <Stat label="Bugün çalışma" value={formatMinutes(d.todayMinutes) + '/' + formatMinutes(state.profile.dailyStudyMinutes)} />
        <Stat label="Bekleyen görev" value={pendingToday.length} />
        <Stat label="Çalışma serisi" value={d.streak + ' gün'} />
      </section>

      <section className="card section coach-today-route" aria-labelledby="today-route-h">
        <div className="card-head">
          <div>
            <div className="eyebrow">Bugünün akışı</div>
            <h2 id="today-route-h">Ne yapacağım diye düşünme</h2>
          </div>
          <span className="badge brand">{pendingToday.length ? pendingToday.length + ' plan görevi' : 'Koç rotası'}</span>
        </div>
        <div className="coach-route-grid">
          <a className="coach-route-step" href={dueToday.length ? '#/tekrar' : leadRef ? '#/konu/' + leadRef.topic.id : '#/dersler'}>
            <span className="coach-route-no">1</span>
            <span>
              <b>{dueToday.length ? 'Kısa tekrar' : 'Konuya hazırlan'}</b>
              <small>
                {dueToday.length
                  ? dueToday.length + ' tekrar bekliyor · 10–15 dk'
                  : leadRef
                    ? leadRef.topic.name + ' · temel anlatım ve özet'
                    : 'Bir konu seç ve 10 dakika başla'}
              </small>
            </span>
          </a>
          <button type="button" className="coach-route-step" onClick={() => void launchAdaptivePractice(12).then((e) => e && toast(e))}>
            <span className="coach-route-no">2</span>
            <span>
              <b>Adaptif pratik</b>
              <small>{leadRef ? leadRef.topic.name + ' öncelikli · seviyene göre 12 soru' : 'Seviyene göre 12 soru'}</small>
            </span>
          </button>
          <a className="coach-route-step" href={openWrongs ? '#/yanlislar' : '#/plan'}>
            <span className="coach-route-no">3</span>
            <span>
              <b>{openWrongs ? 'Yanlışı kapat' : 'Planı tamamla'}</b>
              <small>{openWrongs ? openWrongs + ' açık yanlış · 2 doğruyla öğrenilmiş sayılır' : 'Bugünün görevlerini bitir ve serini koru'}</small>
            </span>
          </a>
        </div>
        {d.lastMockNet != null && (
          <div className="coach-target-strip">
            <span>
              Son {d.lastMockExam} denemen: <b>{d.lastMockNet} net</b>
            </span>
            <span>
              {targetGap == null
                ? 'Hedef netini Ayarlar’dan girersen koç aradaki farkı takip eder.'
                : targetGap > 0
                  ? 'Hedefe ' + targetGap + ' net kaldı.'
                  : 'Hedef net seviyene ulaştın; süre ve doğruluk istikrarını koru.'}
            </span>
          </div>
        )}
      </section>

      <section className="card section coach-plan-card" aria-labelledby="smart-plan-h">
        <div className="card-head">
          <div>
            <div className="eyebrow">7 günlük rota</div>
            <h2 id="smart-plan-h">Akıllı çalışma planı</h2>
          </div>
          <button type="button" className="btn primary" onClick={() => setConfirmPlan(true)}>
            <Icon name="calendar" /> {smartFuture.length ? 'Planı yeniden hesapla' : 'Planı oluştur'}
          </button>
        </div>
        <p className="small muted">{plan.explanation}</p>
        <div className="coach-plan-preview">
          {plan.tasks.slice(0, 8).map((task, i) => (
            <div className="coach-plan-row" key={task.date + '-' + task.title + '-' + i}>
              <span className="coach-plan-day">{task.date === today ? 'Bugün' : task.date.slice(5)}</span>
              <span className="grow">
                <b>{task.title.replace(/^Akıllı · /, '')}</b>
                <small>
                  {[task.estMinutes ? task.estMinutes + ' dk' : '', task.targetQuestions ? task.targetQuestions + ' soru' : ''].filter(Boolean).join(' · ')}
                </small>
              </span>
              <span className="badge">{task.type}</span>
            </div>
          ))}
        </div>
        <div className="row mt-12">
          <a className="btn small" href="#/plan">Tüm planı aç</a>
          <a className="btn small ghost" href="#/denemeler">Süreli denemeye git</a>
        </div>
      </section>

      <section className="card section" aria-labelledby="focus-h">
        <div className="card-head">
          <div>
            <div className="eyebrow">Öncelik sırası</div>
            <h2 id="focus-h">En çok fayda sağlayacak çalışma alanları</h2>
          </div>
          <span className="badge brand">Canlı analiz</span>
        </div>
        <div className="coach-focus-list">
          {next.map((row, i) => {
            const ref = getTopicRef(row.topicId);
            return (
              <a className="coach-focus-row" href={'#/konu/' + row.topicId} key={row.topicId}>
                <span className="coach-rank">{i + 1}</span>
                <span className="grow">
                  <b>{ref?.topic.name ?? row.topicId}</b>
                  <small>{ref ? subjectLabel(ref.subject) : row.subjectId} · {row.reason}</small>
                </span>
                <span className={'mastery-chip ' + row.band}>%{row.score} · {BAND_LABEL[row.band]}</span>
              </a>
            );
          })}
        </div>
      </section>

      <section className="card section" aria-labelledby="mastery-h">
        <div className="card-head">
          <div>
            <div className="eyebrow">Hakimiyet haritası</div>
            <h2 id="mastery-h">Ders ders durumun</h2>
          </div>
          <span className="tiny muted">Puanlar soru geçmişinden türetilir.</span>
        </div>
        <div className="coach-subject-grid">
          {subjects.map(({ subject, mastery }) => (
            <a className="coach-subject" href={'#/ders/' + subject.id} key={subject.id}>
              <div className="row between nowrap">
                <b>{subjectLabel(subject)}</b>
                <span>{mastery.confidence ? '%' + mastery.score : 'Yeni'}</span>
              </div>
              <ProgressBar value={mastery.confidence ? mastery.score : 0} label={subjectLabel(subject) + ' hakimiyet'} />
              <small>
                {mastery.confidence
                  ? mastery.attemptedTopics + '/' + mastery.totalTopics + ' konuda veri · güven %' + mastery.confidence
                  : 'Henüz ölçüm verisi yok'}
              </small>
            </a>
          ))}
        </div>
      </section>

      <section className="coach-system-grid section">
        <a className="card coach-system-card" href="#/ogretmen">
          <span className="coach-system-icon">✦</span>
          <div>
            <b>AI / yerel öğretmen</b>
            <p>“Neden yanlış yaptım?”, “bana benzer soru sor”, “5 dakikada tekrar ettir” gibi isteklerle çalış.</p>
          </div>
          <Icon name="right" />
        </a>
        <a className="card coach-system-card" href="#/tekrar">
          <span className="coach-system-icon">↻</span>
          <div>
            <b>Aralıklı tekrar</b>
            <p>Tamamladığın ve hata yaptığın konular doğru zamanda yeniden karşısına çıkar.</p>
          </div>
          <Icon name="right" />
        </a>
        <a className="card coach-system-card" href="#/ayarlar">
          <span className="coach-system-icon">☁</span>
          <div>
            <b>Bulut ve bildirimler</b>
            <p>Yedekleme, cihazlar arası eşitleme ve çalışma hatırlatıcısını ayarlardan yönet.</p>
          </div>
          <Icon name="right" />
        </a>
        <a className="card coach-system-card" href="#/pandam">
          <span className="coach-system-icon">🐼</span>
          <div>
            <b>Panda motivasyonu</b>
            <p>Soru çözdükçe ve çalıştıkça XP kazan; oda, eşya ve aksesuarlar aç.</p>
          </div>
          <Icon name="right" />
        </a>
      </section>

      {confirmDiagnostic && (
        <ConfirmDialog
          title="Seviye tespit testi başlasın mı?"
          message="Yaklaşık 20 soruluk kısa bir ölçüm. Devam eden testin kapanacak; sonuçlar yalnız kişisel planını ve adaptif soru seçimini iyileştirmek için kullanılır."
          confirmLabel="Başlat"
          onCancel={() => setConfirmDiagnostic(false)}
          onConfirm={() => void runDiagnostic()}
        />
      )}

      {confirmPlan && (
        <ConfirmDialog
          title="7 günlük akıllı plan uygulansın mı?"
          message={'Sistem ' + plan.focusTopics.length + ' öncelikli konuyu kullanarak ' + plan.tasks.length + ' görev hazırladı. Daha önce otomatik oluşturulan tamamlanmamış “Akıllı” görevler yenilenecek; kendi eklediğin görevler korunacak.'}
          confirmLabel="Planı uygula"
          onCancel={() => setConfirmPlan(false)}
          onConfirm={applyPlan}
        />
      )}
    </>
  );
}
