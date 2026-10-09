import type { AppState } from '../store/schema';
import { weeklyMockLearning } from '../utils/mockWeekly';
import { formatNet } from '../utils/net';
import type { DayKey } from '../utils/date';
export function MockWeeklySummary({ state, from }: { state: AppState; from: DayKey }) {
  const report = weeklyMockLearning(state, from);
  return <section className="card section" aria-labelledby="weekly-mock-title"><h2 id="weekly-mock-title">Deneme gelişimi ve çalışma öncelikleri</h2>
    <div className="grid grid-2 mt-12">{report.exams.map(e => <article className="stat" key={e.exam}><b>{e.exam}</b><div className="stat-value">{e.average === null ? '—' : `${formatNet(e.average)} net`}</div><p className="small muted">{e.count} deneme · {e.delta === null ? 'Haftalık karşılaştırma için iki haftada da sonuç gerekir.' : `Geçen haftaya göre ${e.delta > 0 ? '+' : ''}${formatNet(e.delta)} net.`}</p></article>)}</div>
    <h3 className="mt-12">Gelecek haftanın en fazla 3 önceliği</h3>
    {report.priorities.length ? <ol>{report.priorities.map(p => <li key={p.id}><a href={`#/konu/${p.id}`}>{p.name}</a> · {p.count} incelenmemiş soru</li>)}</ol> : <p className="small muted">Henüz konuya bağlanmış açık deneme sorusu yok. Deneme raporunda eksik konularını işaretlediğinde önceliklerin burada oluşur.</p>}
    <div className="row"><a className="btn" href="#/denemeler">Deneme sonuçları</a><a className="btn" href="#/tekrar">Tekrar isteyen konularım</a><a className="btn" href="#/plan">Haftalık görevlerim</a></div>
  </section>;
}
