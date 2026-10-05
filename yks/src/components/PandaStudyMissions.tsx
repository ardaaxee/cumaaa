import { useAppState } from '../store/store';
import { dayKey } from '../utils/date';
import { dailyMissions } from '../utils/studyTools';
import { ProgressBar } from './ui';
import '../styles/study-tools.css';

export function PandaStudyMissions() {
  const state = useAppState();
  const missions = dailyMissions(state, dayKey());
  const completed = missions.filter(m => m.done).length;
  return <section className="card section panda-study-missions" aria-labelledby="panda-missions-title">
    <div className="row between">
      <div><div className="eyebrow">BİRLİKTE KÜÇÜK ADIMLAR</div><h2 id="panda-missions-title">{state.settings.pet.name || 'Bambu'} ile bugünün görevleri</h2></div>
      <span className="badge">{completed} / {missions.length} tamamlandı</span>
    </div>
    <p className="muted">{completed === missions.length ? 'Bugünün küçük adımlarını tamamladın. Şimdi güzel bir mola verebilirsin ♡' : 'Kısa bir çalışma, biraz tekrar. İlerlemen çalıştıkça kendiliğinden güncellenir.'}</p>
    <div className="study-mission-grid">{missions.map(m => <article key={m.id} className={`study-mission${m.done ? ' is-done' : ''}`}>
      <span className="study-mission-icon" aria-hidden="true">{m.done ? '✓' : m.icon}</span>
      <h3>{m.title}</h3><p>{m.detail}</p>
      <ProgressBar value={m.current / m.target * 100} label={m.title} />
      <div className="row between"><span className="small">{m.current}/{m.target} {m.unit}</span>{m.done ? <span className="badge ok">Tamamlandı</span> : <a className="btn small" href={m.href}>{m.action} →</a>}</div>
    </article>)}</div>
    <p className="small muted">Bu görevler günlük çalışma kayıtlarını gösterir. Bambu, su ve XP mevcut kazanım kurallarına göre hesaplanır.</p>
  </section>;
}
