import { useAppState } from '../store/store';
import { studyQueue } from '../utils/studyQueue';
import { dayKey } from '../utils/date';
import { getTopicRef } from '../data/curriculum';
import { href } from '../hooks/useRoute';
export function StudyQueue() {
  const queue = studyQueue(useAppState(), dayKey());
  const label = (id: string) => getTopicRef(id)!.topic.name;
  return <section className="card section" aria-label="Çalışma kuyruğum"><div className="card-head"><h2>Çalışma kuyruğum</h2><a className="btn small ghost" href="#/plan">Planı düzenle</a></div><div className="study-queue-grid">
    <div><h3>Kaldığım konular</h3>{queue.continuing.slice(0,3).map((id) => <a className="study-queue-item" key={id} href={`#/calis/${id}`}><b>{label(id)}</b><small>Anlatım ve sorularla devam et →</small></a>)}{!queue.continuing.length && <p className="small muted">Çalışmaya başladığın konular burada görünür.</p>}<a className="btn small" href="#/dersler">Konu seç</a></div>
    <div><h3>Önce düzelt</h3>{queue.mistakes.slice(0,3).map((item) => <a className="study-queue-item" key={item.topicId} href={href('/yanlislar',{konu:item.topicId})}><b>{label(item.topicId)}</b><small>{item.count} açık soru · {item.repeats} yanlış/boş</small></a>)}{!queue.mistakes.length && <p className="small muted">Açık yanlışın yok. Yeni sorularla devam edebilirsin.</p>}<a className="btn small" href="#/yanlislar">Yanlışlarımı aç</a></div>
    <div><h3>Tekrar zamanı</h3>{queue.reviews.slice(0,3).map((item) => <a className="study-queue-item" key={item.topicId} href={`#/konu/${item.topicId}`}><b>{label(item.topicId)}</b><small>{item.dueDay < dayKey() ? 'Gecikmiş tekrar' : 'Bugünkü tekrar'} · özet ve mini test</small></a>)}{!queue.reviews.length && <p className="small muted">Bugün zamanı gelen tekrar yok.</p>}<a className="btn small" href="#/tekrar">Tekrar takvimi</a></div>
  </div></section>;
}
