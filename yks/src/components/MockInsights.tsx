import { useState } from 'react';
import type { MockExam } from '../store/schema';
import { mockNet, mockTotals } from '../utils/mock';
import { mockInsights, mockSubjectLinks, mockTargetStatus } from '../utils/mockInsights';
import { formatNet } from '../utils/net';
import { formatDay } from '../utils/date';
import { getSubject, subjectLabel } from '../data/curriculum';
import { Modal, toast } from './ui';
import { update } from '../store/store';
import { updateProfile } from '../store/actions';
import './mock-insights.css';

export function MockInsights({ mock, mocks, target }: { mock: MockExam; mocks: MockExam[]; target: number | null }) {
  const [editingTarget, setEditingTarget] = useState(false);
  const [draftTarget, setDraftTarget] = useState('');
  const [targetError, setTargetError] = useState('');
  const goal = mockTargetStatus(mockNet(mock), target, mock.exam);
  const editTarget = () => { setDraftTarget(target === null ? '' : String(target)); setTargetError(''); setEditingTarget(true); };
  const saveTarget = () => {
    const value = draftTarget.trim() === '' ? null : Number(draftTarget);
    if (value !== null && !mockTargetStatus(0, value, mock.exam)) { setTargetError(`0 ile ${mock.exam === 'TYT' ? 120 : 80} arasında geçerli bir net gir.`); return; }
    update(s => updateProfile(s, mock.exam === 'TYT' ? { tytTarget: value } : { aytTarget: value }));
    setEditingTarget(false); toast(value === null ? 'Net hedefi temizlendi.' : 'Net hedefi kaydedildi.');
  };
  const [view, setView] = useState<'results' | 'coach'>('results');
  const report = mockInsights(mock, mocks);
  const totals = mockTotals(mock);
  const priority = report.priority;
  return <section className="mock-insights section" aria-labelledby="mock-report-title">
    <header className="mock-report-header">
      <div><div className="eyebrow">{mock.exam === 'AYT' ? 'AYT · Sayısal' : 'TYT'} · Deneme raporu</div>
        <h2 id="mock-report-title">{mock.name}</h2><p className="small muted">{formatDay(mock.date)} · Sonuçlarını çalışma adımlarına dönüştür.</p></div>
      <span className="mock-net-pill">{formatNet(mockNet(mock))}<small>net</small></span>
    </header>
    <div className="mock-report-tabs" role="group" aria-label="Rapor görünümü">
      <button className="btn" aria-pressed={view === 'results'} onClick={() => setView('results')}>Detaylı analiz</button>
      <button className="btn" aria-pressed={view === 'coach'} onClick={() => setView('coach')}>Çalışma önerileri</button>
    </div>
    <section className="mock-target-card" aria-label="Net hedefim">
      <div className="row between"><div><div className="eyebrow">{mock.exam} net hedefim</div><b>{goal ? `${formatNet(goal.target)} net` : 'Henüz hedef belirlenmedi'}</b></div><button className="btn small" onClick={editTarget}>{goal ? 'Hedefi düzenle' : 'Hedef belirle'}</button></div>
      {goal ? <><div className="mock-performance-track" role="progressbar" aria-label="Net hedefi ilerlemesi" aria-valuemin={0} aria-valuemax={100} aria-valuenow={goal.progress}><span style={{ width: `${goal.progress}%` }} /></div><p className="small">{goal.reached ? 'Bu denemede net hedefine ulaştın.' : `Bu denemeye göre hedefe ${formatNet(goal.gap)} net kaldı.`}</p></> : <p className="small muted">Hedefini belirleyerek her denemenin hedefe kalan farkını izle.</p>}
    </section>
    {view === 'results' ? <>
      <div className="mock-result-totals" aria-label="Genel özet">
        <div><b>{totals.correct}</b><span>Doğru</span></div><div><b>{totals.wrong}</b><span>Yanlış</span></div><div><b>{totals.blank}</b><span>Boş</span></div><div><b>{formatNet(mockNet(mock))}</b><span>Toplam net</span></div>
      </div>
      <div className="mock-report-trend"><b>{report.delta === null ? 'İlk karşılaştırma noktası' : `${report.delta > 0 ? '+' : ''}${formatNet(report.delta)} net değişim`}</b>
        <p>{report.previous ? `${report.previous.name} (${formatDay(report.previous.date)}) ile karşılaştırıldı.` : 'Aynı sınav türündeki bir sonraki sonuçla gelişimini karşılaştırabileceksin.'} Son {report.history.length} karşılaştırılabilir denemenin ortalaması: <strong>{formatNet(report.average)} net.</strong></p></div>
      <h3>Ders performansı</h3>
      <div className="mock-performance-list">{report.sections.map(s => <article key={s.key} className="mock-performance-row">
        <div className="row between"><b>{s.label}</b><strong>{formatNet(s.net)} <small>/ {s.questions} net</small></strong></div>
        <div className="mock-performance-track" aria-hidden="true"><span style={{ width: `${Math.max(0, Math.min(100, s.ratio * 100))}%` }} /></div>
        <div className="row between tiny muted"><span>{s.correct} doğru · {s.wrong} yanlış · {s.blank} boş</span><span>{s.delta === null ? 'İlk kayıt' : `${s.delta > 0 ? '+' : ''}${formatNet(s.delta)} net`}</span></div>
      </article>)}</div>
      {priority && <div className="mock-priority"><div className="eyebrow">Çalışma önceliği</div><h3>{priority.label}</h3><p>Soru sayısına göre net oranı en düşük dersin. Yanlış ve boşlarını inceleyerek hangi konudan başlayacağını belirle.</p><button className="btn primary" onClick={() => setView('coach')}>Çalışma adımlarını gör</button></div>}
    </> : <div className="mock-coach-content">
      <div className="eyebrow">Sonucuna dayalı çalışma rehberi</div><h3>Bir sonraki denemeye hazırlan</h3>
      <p>{report.delta === null ? 'Tek deneme, kalıcı bir eğilim göstermek için yeterli değil.' : report.delta < 0 ? `Önceki denemeye göre ${formatNet(Math.abs(report.delta))} net düşüş var. Önce yanlışlarının nedenini incele.` : `Önceki denemeye göre ${formatNet(report.delta)} net değişim var. İyi giden çalışma alışkanlıklarını sürdür.`} Sonuç girişi, tek başına hangi konunun eksik olduğunu göstermez.</p>
      <ol className="mock-coach-steps">
        <li><b>Yanlışlarını sınıflandır</b><p>{totals.wrong} yanlışın için konu eksiği, işlem hatası veya soruyu yanlış okuma nedenini defterine yaz. Boş bıraktığın {totals.blank} soruda süre ve bilgi eksiğini ayır.</p><a className="btn small" href="#/defterim">Defterime yaz</a></li>
        {priority && <li><b>{priority.label} için eksik konuyu bul</b><p>{formatNet(priority.net)} / {priority.questions} net. İlgili dersin öğrenme alanında kısa ölçmeyle başlayıp konu anlatımını ve örnekleri tamamla.</p><div className="row">{mockSubjectLinks(mock.exam, priority.key).map(id => <a key={id} className="btn small" href={`#/ders/${id}`}>{getSubject(id) ? subjectLabel(getSubject(id)!) : id}</a>)}</div></li>}
        <li><b>Öğren, uygula, tekrar ölç</b><p>Bir oturumda bir eksik konuya odaklan. Anlatımdan sonra çözümlü örnekleri çalış, ardından soruları kendin çöz. Yeni deneme sonucunu ekleyerek değişimi takip et.</p><a className="btn small primary" href="#/koc">Kişisel çalışma planım</a></li>
      </ol><p className="tiny muted">Bu rehber kayıtlı sonuçlarından hesaplanır. Başarı veya sıralama tahmini değildir.</p>
    </div>}
    {editingTarget && <Modal title={`${mock.exam} net hedefim`} onClose={() => setEditingTarget(false)} actions={<><button className="btn" onClick={() => setEditingTarget(false)}>Vazgeç</button><button className="btn primary" onClick={saveTarget}>Hedefi kaydet</button></>}>
      <label className="field"><span>Hedef net</span><input className="input" type="number" inputMode="decimal" min={0} max={mock.exam === 'TYT' ? 120 : 80} step="0.25" value={draftTarget} onChange={e => setDraftTarget(e.target.value)} aria-describedby="mock-target-help" /></label>
      <p id="mock-target-help" className="small muted">{mock.exam === 'TYT' ? '120' : '80'} nete kadar hedef belirleyebilirsin. Hedefi temizlemek için alanı boş bırak. Profilindeki hedef de güncellenir.</p>
      {targetError && <p className="field-error" role="alert">{targetError}</p>}
    </Modal>}
  </section>;
}
