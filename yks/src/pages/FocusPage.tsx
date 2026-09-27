import { useState } from 'react';
import { SUBJECTS, subjectLabel } from '../data/curriculum';
import type { SubjectId } from '../domain/types';
import { PageHeader } from '../components/Layout';
import { PomodoroCard } from '../components/PomodoroCard';
import { Stat, toast } from '../components/ui';
import { addStudyMinutes, deleteStudySession } from '../store/actions';
import { update, useAppState } from '../store/store';
import { dayKey, formatMinutes } from '../utils/date';
import { minutesOn } from '../utils/stats';

export default function FocusPage() {
  const state = useAppState();
  const today = dayKey();
  const [manual, setManual] = useState('');
  const todayLog = state.studyLog.filter((s) => s.day === today);
  const { settings } = state;

  const addManual = () => {
    const m = Number(manual);
    if (!Number.isFinite(m) || m <= 0 || m > 600) return toast('1–600 dakika arası bir süre gir.');
    update((s) => addStudyMinutes(s, m, 'manuel', new Date(), s.pomodoro.subjectId));
    setManual('');
    toast(`${Math.round(m)} dk çalışma eklendi.`);
  };

  return (
    <>
      <PageHeader title="Odak" sub={`Pomodoro ${settings.focusMinutes}/${settings.breakMinutes} · süreler Ayarlar’dan değişir`} />
      <div className="grid grid-cards">
        <PomodoroCard />
        <div className="card">
          <h2 className="mb-8">Bu seans hangi ders için?</h2>
          <label className="field">
            <span className="sr-only">Ders</span>
            <select
              className="select"
              value={state.pomodoro.subjectId ?? ''}
              onChange={(e) => update((s) => ({ ...s, pomodoro: { ...s.pomodoro, subjectId: (e.target.value || undefined) as SubjectId | undefined } }))}
            >
              <option value="">Genel çalışma</option>
              {SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {subjectLabel(s)}
                </option>
              ))}
            </select>
          </label>
          <p className="small muted mt-8">Tamamlanan her odak seansı gerçek çalışma süresine eklenir. Yarıda bırakılan seans sayılmaz.</p>
          <div className="grid grid-2 mt-12">
            <Stat label="Bugün" value={formatMinutes(minutesOn(state.studyLog, today))} sub={`hedef ${formatMinutes(state.profile.dailyStudyMinutes)}`} />
            <Stat label="Tamamlanan seans" value={state.pomodoro.completedFocusCount} sub="toplam" />
          </div>
        </div>
      </div>

      <section className="card section" aria-labelledby="man-h">
        <h2 id="man-h" className="mb-8">
          Manuel çalışma ekle
        </h2>
        <p className="small muted">Pomodoro kullanmadan çalıştıysan süreyi buradan ekleyebilirsin (ör. dershane, kütüphane).</p>
        <div className="row">
          <label className="field grow" style={{ maxWidth: 220 }}>
            <span className="sr-only">Dakika</span>
            <input className="input" type="number" min={1} max={600} inputMode="numeric" placeholder="Dakika" value={manual} onChange={(e) => setManual(e.target.value)} />
          </label>
          <button type="button" className="btn primary" onClick={addManual}>
            Ekle
          </button>
        </div>
      </section>

      <section className="card section" aria-labelledby="log-h">
        <h2 id="log-h" className="mb-8">
          Bugünün kayıtları
        </h2>
        {todayLog.length === 0 ? (
          <div className="small muted">Bugün henüz çalışma kaydı yok.</div>
        ) : (
          <ul className="list">
            {todayLog.map((s) => (
              <li key={s.id} className="list-item">
                <span className="grow">
                  {formatMinutes(s.minutes)} · {s.source === 'pomodoro' ? 'Pomodoro' : 'Manuel'}
                  {s.subjectId && <span className="tiny muted"> · {subjectLabel(SUBJECTS.find((x) => x.id === s.subjectId)!)}</span>}
                </span>
                <span className="tiny muted">{new Date(s.at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                <button type="button" className="btn small ghost danger" onClick={() => update((st) => deleteStudySession(st, s.id))} aria-label="Kaydı sil">
                  Sil
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
