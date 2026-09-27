import type { PomodoroState, Settings } from '../store/schema';

/**
 * Pomodoro zamanlayıcısı: bitiş zamanı (endsAt) saklandığı için sayfa
 * yenilense bile kalan süre doğru hesaplanır.
 */

export function phaseDurationMs(phase: PomodoroState['phase'], s: Pick<Settings, 'focusMinutes' | 'breakMinutes' | 'longBreakMinutes'>): number {
  const min = phase === 'odak' ? s.focusMinutes : phase === 'mola' ? s.breakMinutes : s.longBreakMinutes;
  return Math.max(1, min) * 60_000;
}

export function remaining(p: PomodoroState, now: number): number {
  if (p.running && p.endsAt != null) return Math.max(0, p.endsAt - now);
  return p.remainingMs;
}

export function startTimer(p: PomodoroState, now: number): PomodoroState {
  if (p.running) return p;
  return { ...p, running: true, endsAt: now + p.remainingMs };
}

export function pauseTimer(p: PomodoroState, now: number): PomodoroState {
  if (!p.running) return p;
  return { ...p, running: false, endsAt: null, remainingMs: remaining(p, now) };
}

export function resetTimer(p: PomodoroState, s: Settings): PomodoroState {
  return { ...p, phase: 'odak', running: false, endsAt: null, remainingMs: phaseDurationMs('odak', s) };
}

export function skipPhase(p: PomodoroState, s: Settings): PomodoroState {
  const phase = p.phase === 'odak' ? 'mola' : 'odak';
  return { ...p, phase, running: false, endsAt: null, remainingMs: phaseDurationMs(phase, s) };
}

export interface TickResult {
  pomodoro: PomodoroState;
  /** Tamamlanan odak seansının dakikası (yoksa 0). */
  completedFocusMinutes: number;
  /** Seansın bittiği an (epoch ms). */
  completedAt: number | null;
  finishedPhase: PomodoroState['phase'] | null;
}

export function tick(p: PomodoroState, now: number, s: Settings): TickResult {
  if (!p.running || p.endsAt == null || now < p.endsAt) {
    return { pomodoro: p, completedFocusMinutes: 0, completedAt: null, finishedPhase: null };
  }
  if (p.phase === 'odak') {
    const count = p.completedFocusCount + 1;
    const nextPhase = count % Math.max(1, s.cyclesBeforeLongBreak) === 0 ? 'uzun-mola' : 'mola';
    return {
      pomodoro: { ...p, phase: nextPhase, running: false, endsAt: null, remainingMs: phaseDurationMs(nextPhase, s), completedFocusCount: count },
      completedFocusMinutes: s.focusMinutes,
      completedAt: p.endsAt,
      finishedPhase: 'odak',
    };
  }
  return {
    pomodoro: { ...p, phase: 'odak', running: false, endsAt: null, remainingMs: phaseDurationMs('odak', s) },
    completedFocusMinutes: 0,
    completedAt: p.endsAt,
    finishedPhase: p.phase,
  };
}

export function phaseLabel(phase: PomodoroState['phase']): string {
  return phase === 'odak' ? 'Odak' : phase === 'mola' ? 'Kısa mola' : 'Uzun mola';
}
