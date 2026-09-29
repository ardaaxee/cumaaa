import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/Layout';
import { PandaBody } from '../components/MascotNav';
import { SUBJECTS, subjectLabel } from '../data/curriculum';
import { addStudyMinutes, updateSettings } from '../store/actions';
import { update, useAppState } from '../store/store';
import type { PomodoroState } from '../store/schema';
import { dayKey, formatMinutes } from '../utils/date';
import { dashboard } from '../utils/stats';
import { ProgressBar, toast } from '../components/ui';

function phaseDurationMs(state: ReturnType<typeof useAppState>, phase: PomodoroState['phase']): number {
  if (phase === 'odak') return Math.max(5, state.settings.focusMinutes) * 60_000;
  if (phase === 'uzun-mola') return Math.max(5, state.settings.longBreakMinutes) * 60_000;
  return Math.max(1, state.settings.breakMinutes) * 60_000;
}

function formatTimer(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function notifyFinished(title: string, body: string) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  const options: NotificationOptions = { body, icon: 'icon-192.png', badge: 'icon-192.png', tag: 'yks-focus' };
  navigator.serviceWorker?.getRegistration?.()
    .then((reg) => {
      if (reg) return reg.showNotification(title, options);
      new Notification(title, options);
    })
    .catch(() => {
      try { new Notification(title, options); } catch { /* bildirim desteklenmiyor */ }
    });
}

export default function FocusPage() {
  const state = useAppState();
  const p = state.pomodoro;
  const today = dayKey();
  const [now, setNow] = useState(Date.now());
  const [immersive, setImmersive] = useState(false);
  const completing = useRef(false);
  const d = useMemo(() => dashboard(state, today), [state, today]);

  const todayFocus = useMemo(
    () => state.studyLog.filter((s) => s.day === today && s.source === 'pomodoro').reduce((sum, s) => sum + s.minutes, 0),
    [state.studyLog, today],
  );
  const remaining = p.running && p.endsAt ? Math.max(0, p.endsAt - now) : p.remainingMs;
  const total = phaseDurationMs(state, p.phase);
  const progress = total > 0 ? ((total - remaining) / total) * 100 : 0;
  const phaseLabel = p.phase === 'odak' ? 'Odak' : p.phase === 'uzun-mola' ? 'Uzun mola' : 'Mola';
  const petName = state.settings.pet.name;

  useEffect(() => {
    if (!p.running) return;
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [p.running]);

  const finishPhase = () => {
    if (completing.current) return;
    completing.current = true;
    const finished = p.phase;

    update((s) => {
      if (finished === 'odak') {
        const completed = s.pomodoro.completedFocusCount + 1;
        const long = completed % Math.max(1, s.settings.cyclesBeforeLongBreak) === 0;
        const nextPhase: PomodoroState['phase'] = long ? 'uzun-mola' : 'mola';
        const logged = addStudyMinutes(s, s.settings.focusMinutes, 'pomodoro', new Date(), s.pomodoro.subjectId);
        return {
          ...logged,
          pomodoro: {
            ...logged.pomodoro,
            phase: nextPhase,
            running: false,
            endsAt: null,
            remainingMs: phaseDurationMs(logged, nextPhase),
            completedFocusCount: completed,
          },
        };
      }

      return {
        ...s,
        pomodoro: {
          ...s.pomodoro,
          phase: 'odak',
          running: false,
          endsAt: null,
          remainingMs: phaseDurationMs(s, 'odak'),
        },
      };
    });

    if (finished === 'odak') {
      notifyFinished('Odak tamamlandı ✓', petName + ' seninle gurur duyuyor. Şimdi kısa bir mola.');
      toast('Odak oturumu tamamlandı. Çalışma süren kaydedildi ✓', 4500);
    } else {
      notifyFinished('Mola bitti', 'Hazırsan yeni odak oturumuna başlayabilirsin.');
      toast('Mola bitti. Yeni odak için hazırsın.', 3500);
    }
    window.setTimeout(() => { completing.current = false; }, 300);
  };

  useEffect(() => {
    if (p.running && remaining <= 0) finishPhase();
    // remaining her yarım saniye değişir; finishPhase tamamlanma kilidi ile tek kez çalışır.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.running, remaining]);

  const start = () => {
    const left = remaining > 0 ? remaining : phaseDurationMs(state, p.phase);
    update((s) => ({
      ...s,
      pomodoro: { ...s.pomodoro, running: true, endsAt: Date.now() + left, remainingMs: left },
    }));
    setNow(Date.now());
  };

  const pause = () => {
    const left = p.endsAt ? Math.max(0, p.endsAt - Date.now()) : p.remainingMs;
    update((s) => ({ ...s, pomodoro: { ...s.pomodoro, running: false, endsAt: null, remainingMs: left } }));
  };

  const reset = () => {
    update((s) => ({
      ...s,
      pomodoro: { ...s.pomodoro, running: false, endsAt: null, remainingMs: phaseDurationMs(s, s.pomodoro.phase) },
    }));
  };

  const skipBreak = () => {
    if (p.phase === 'odak') return;
    update((s) => ({
      ...s,
      pomodoro: { ...s.pomodoro, phase: 'odak', running: false, endsAt: null, remainingMs: phaseDurationMs(s, 'odak') },
    }));
  };

  const setPreset = (minutes: number) => {
    update((s) => {
      const changed = updateSettings(s, { focusMinutes: minutes });
      return {
        ...changed,
        pomodoro: {
          ...changed.pomodoro,
          phase: 'odak',
          running: false,
          endsAt: null,
          remainingMs: minutes * 60_000,
        },
      };
    });
    toast(minutes + ' dakikalık odak modu hazır.');
  };

  const dailyPct = state.profile.dailyStudyMinutes ? (d.todayMinutes / state.profile.dailyStudyMinutes) * 100 : 0;

  return (
    <div className={immersive ? 'focus-page immersive' : 'focus-page'}>
      <PageHeader
        title="Odak Modu"
        sub="Gerçek çalışma süresi otomatik kaydedilir"
        actions={
          <button type="button" className="btn small" onClick={() => setImmersive((v) => !v)}>
            <Icon name={immersive ? 'close' : 'expand'} /> {immersive ? 'Normal görünüm' : 'Dikkat dağıtma'}
          </button>
        }
      />

      <section className={'focus-stage phase-' + p.phase}>
        <div className="focus-stage-copy">
          <div className="eyebrow">{phaseLabel}</div>
          <h2>{p.phase === 'odak' ? 'Tek iş. Tek süre. Tam odak.' : 'Mola da çalışmanın bir parçası.'}</h2>
          <p>
            {p.phase === 'odak'
              ? 'Telefonu bırak, seçtiğin derse odaklan. Süre bittiğinde çalışma günlüğün otomatik güncellenir.'
              : 'Ayağa kalk, su iç ve ekrandan uzaklaş. Mola bitince yeni tur hazır olacak.'}
          </p>
        </div>

        <div className="focus-clock" aria-live="polite">
          <div className="focus-ring" style={{ ['--focus-progress' as string]: Math.max(0, Math.min(100, progress)) + '%' }}>
            <div className="focus-ring-inner">
              <span>{phaseLabel}</span>
              <b>{formatTimer(remaining)}</b>
              <small>{p.running ? 'devam ediyor' : remaining < total ? 'duraklatıldı' : 'hazır'}</small>
            </div>
          </div>
        </div>

        <div className="focus-panda" aria-hidden="true">
          <PandaBody size={132} items={state.settings.pet.items} sleepy={p.phase !== 'odak'} waving={p.phase === 'odak' && !p.running} />
          <span>{p.phase === 'odak' ? (p.running ? 'Ben de sessizce çalışıyorum…' : 'Hazırsan başlayalım ♡') : 'Biraz dinlenelim ☕'}</span>
        </div>
      </section>

      <section className="card section focus-controls-card" aria-label="Odak kontrolleri">
        <div className="focus-main-controls">
          {!p.running ? (
            <button type="button" className="btn primary focus-start" onClick={start}>
              <Icon name="play" /> {remaining < total ? 'Devam et' : p.phase === 'odak' ? 'Odağı başlat' : 'Molayı başlat'}
            </button>
          ) : (
            <button type="button" className="btn primary focus-start" onClick={pause}>
              <Icon name="pause" /> Duraklat
            </button>
          )}
          <button type="button" className="btn" onClick={reset}>Sıfırla</button>
          {p.phase !== 'odak' && <button type="button" className="btn ghost" onClick={skipBreak}>Molayı geç</button>}
        </div>

        <div className="focus-presets" role="group" aria-label="Odak süresi">
          {[25, 50, 90].map((minutes) => (
            <button
              key={minutes}
              type="button"
              className={'chip' + (state.settings.focusMinutes === minutes ? ' on' : '')}
              aria-pressed={state.settings.focusMinutes === minutes}
              disabled={p.running}
              onClick={() => setPreset(minutes)}
            >
              {minutes} dk
            </button>
          ))}
        </div>

        <label className="field focus-subject">
          <span>Bu oturumda hangi derse çalışıyorsun?</span>
          <select
            className="select"
            value={p.subjectId ?? ''}
            disabled={p.running}
            onChange={(e) =>
              update((s) => ({
                ...s,
                pomodoro: { ...s.pomodoro, subjectId: e.target.value ? (e.target.value as typeof s.pomodoro.subjectId) : undefined },
              }))
            }
          >
            <option value="">Genel çalışma</option>
            {SUBJECTS.map((subject) => (
              <option key={subject.id} value={subject.id}>{subjectLabel(subject)}</option>
            ))}
          </select>
        </label>
      </section>

      <section className="focus-stats section" aria-label="Odak özeti">
        <div className="card">
          <span>Bugün odak</span>
          <b>{formatMinutes(todayFocus)}</b>
          <small>Pomodoro oturumları</small>
        </div>
        <div className="card">
          <span>Tamamlanan tur</span>
          <b>{p.completedFocusCount}</b>
          <small>{state.settings.cyclesBeforeLongBreak} turda uzun mola</small>
        </div>
        <div className="card">
          <span>Bugün toplam</span>
          <b>{formatMinutes(d.todayMinutes)}</b>
          <small>tüm çalışma kayıtları</small>
        </div>
      </section>

      <section className="card section focus-goal-card">
        <div className="row between nowrap">
          <div>
            <div className="eyebrow">Günlük hedef</div>
            <h2>{formatMinutes(d.todayMinutes)} / {formatMinutes(state.profile.dailyStudyMinutes)}</h2>
          </div>
          <span className="badge brand">%{Math.min(100, Math.round(dailyPct))}</span>
        </div>
        <ProgressBar value={dailyPct} label="Günlük çalışma süresi hedefi" />
        <div className="row mt-12">
          <a className="btn small" href="#/koc">Akıllı Koç'a dön</a>
          <a className="btn small ghost" href="#/plan">Bugünün planı</a>
        </div>
      </section>
    </div>
  );
}
