import { usePomodoro } from '../hooks/usePomodoro';
import { formatClock } from '../utils/date';
import { phaseLabel } from '../utils/pomodoro';
import { Icon } from './Icon';

export function PomodoroCard({ compact }: { compact?: boolean }) {
  const { state, remainingMs, start, pause, reset, skip } = usePomodoro();
  return (
    <div className="card">
      <div className="card-head">
        <h2>Odak zamanı</h2>
        <span className={`badge ${state.phase === 'odak' ? 'brand' : 'ok'}`}>{phaseLabel(state.phase)}</span>
      </div>
      <div className="timer-big" role="timer" aria-live="off" aria-label={`Kalan süre ${formatClock(remainingMs)}`}>
        {formatClock(remainingMs)}
      </div>
      <div className="small muted">
        {state.running ? 'Çalışıyor — sayfayı kapatsan bile süre korunur.' : 'Duraklatıldı'} · Bugün tamamlanan seans: {state.completedFocusCount}
      </div>
      <div className="row mt-12">
        {state.running ? (
          <button type="button" className="btn primary" onClick={pause}>
            <Icon name="pause" /> Duraklat
          </button>
        ) : (
          <button type="button" className="btn primary" onClick={start}>
            <Icon name="play" /> {state.phase === 'odak' ? 'Odaklan' : 'Molayı başlat'}
          </button>
        )}
        <button type="button" className="btn" onClick={reset}>
          Sıfırla
        </button>
        {!compact && (
          <button type="button" className="btn ghost" onClick={skip}>
            {state.phase === 'odak' ? 'Molaya geç' : 'Molayı atla'}
          </button>
        )}
      </div>
    </div>
  );
}
