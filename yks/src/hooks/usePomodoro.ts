import { useEffect, useState } from 'react';
import { toast } from '../components/ui';
import { addStudyMinutes } from '../store/actions';
import { getState, update, useSelector } from '../store/store';
import { pauseTimer, phaseLabel, remaining, resetTimer, skipPhase, startTimer, tick } from '../utils/pomodoro';

/** Her saniye güncellenen "şimdi" (yalnız etkinken). */
export function useNow(active: boolean, intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);
  return now;
}

function checkCompletion() {
  const s = getState();
  const r = tick(s.pomodoro, Date.now(), s.settings);
  if (!r.finishedPhase) return;
  update((st) => {
    const next = { ...st, pomodoro: r.pomodoro };
    return r.completedFocusMinutes > 0
      ? addStudyMinutes(next, r.completedFocusMinutes, 'pomodoro', new Date(r.completedAt ?? Date.now()), st.pomodoro.subjectId)
      : next;
  });
  if (r.finishedPhase === 'odak') {
    toast(`Odak seansı tamamlandı: ${r.completedFocusMinutes} dk çalışma süresine eklendi. Mola zamanı.`, 4000);
  } else {
    toast(`${phaseLabel(r.finishedPhase)} bitti. Yeni odak seansı hazır.`, 4000);
  }
  try {
    navigator.vibrate?.([180, 80, 180]);
  } catch {
    /* titreşim desteklenmiyor */
  }
}

/** Uygulama genelinde tek kez çalışır: süre dolduğunda seansı kaydeder. */
export function usePomodoroEngine(): void {
  const running = useSelector((s) => s.pomodoro.running);
  useEffect(() => {
    checkCompletion();
    if (!running) return;
    const id = setInterval(checkCompletion, 1000);
    const onVisible = () => document.visibilityState === 'visible' && checkCompletion();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [running]);
}

export function usePomodoro() {
  const p = useSelector((s) => s.pomodoro);
  const now = useNow(p.running);
  return {
    state: p,
    remainingMs: remaining(p, now),
    start: () => update((s) => ({ ...s, pomodoro: startTimer(s.pomodoro, Date.now()) })),
    pause: () => update((s) => ({ ...s, pomodoro: pauseTimer(s.pomodoro, Date.now()) })),
    reset: () => update((s) => ({ ...s, pomodoro: resetTimer(s.pomodoro, s.settings) })),
    skip: () => update((s) => ({ ...s, pomodoro: skipPhase(s.pomodoro, s.settings) })),
  };
}
