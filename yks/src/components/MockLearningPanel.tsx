import { useState } from 'react';
import type { MockExam, MockIssueReason } from '../store/schema';
import { getSubject, getTopicRef, subjectLabel } from '../data/curriculum';
import { mockSubjectLinks } from '../utils/mockInsights';
import { MOCK_SECTIONS, sectionDef } from '../utils/mock';
import { MOCK_REASONS, mockPace, planMockLearning, sanitizeMockLearning } from '../utils/mockLearning';
import { Modal, toast } from './ui';
import { update, useSelector } from '../store/store';
import { dayKey } from '../utils/date';
import { uid } from '../utils/ids';

export function MockLearningPanel({ mock }: { mock: MockExam }) {
  const learning = sanitizeMockLearning(mock.learning, mock);
  const [adding, setAdding] = useState(false);
  const [timing, setTiming] = useState(false);
  const [section, setSection] = useState(mock.sections[0]?.key ?? '');
  const [question, setQuestion] = useState('');
  const [kind, setKind] = useState<'yanlis' | 'bos'>('yanlis');
  const [reason, setReason] = useState<MockIssueReason>('konu');
  const [topic, setTopic] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [times, setTimes] = useState<Record<string, string>>({});
  const allTasks = useSelector(s => s.tasks);
  const tasks = allTasks.filter(t => t.sourceMockId === mock.id);
  const subjects = mockSubjectLinks(mock.exam, section).flatMap(id => { const s = getSubject(id); return s ? [s] : []; });
  const patch = (change: Partial<typeof learning>) => update(s => ({ ...s, mocks: s.mocks.map(m => m.id === mock.id ? { ...m, learning: { ...sanitizeMockLearning(m.learning, m), ...change } } : m) }));
  const saveIssue = () => {
    const number = Number(question);
    const def = MOCK_SECTIONS[mock.exam].find(d => d.key === section);
    const result = mock.sections.find(s => s.key === section);
    if (!def || !result || !Number.isInteger(number) || number < 1 || number > def.questions) { setError(`1 ile ${def?.questions ?? 0} arasında bu dersteki soru numarasını gir.`); return; }
    if (learning.issues.some(i => i.sectionKey === section && i.question === number)) { setError('Bu soru zaten kayıtlı.'); return; }
    const maximum = kind === 'yanlis' ? result.wrong : result.blank;
    if (learning.issues.filter(i => i.sectionKey === section && i.kind === kind).length >= maximum) { setError('Bu derste kaydedilmiş yanlış / boş sayısını aşamazsın. Deneme sonucunu kontrol et.'); return; }
    patch({ issues: [...learning.issues, { id: uid('issue'), sectionKey: section, question: number, kind, reason, topicId: topic, note: note.trim().slice(0, 400), reviewed: false }] });
    setAdding(false); setQuestion(''); setTopic(''); setNote(''); toast('Soru ve nedeni kaydedildi.');
  };
  const saveTimes = () => {
    const values: Record<string, number> = {};
    for (const [key, text] of Object.entries(times)) {
      if (!text.trim()) continue;
      const value = Number(text);
      if (!Number.isFinite(value) || value <= 0 || value > 180) { setError('Her ders için 0’dan büyük, en fazla 180 dakika gir.'); return; }
      values[key] = value;
    }
    if (Object.values(values).reduce((a, b) => a + b, 0) > (mock.exam === 'TYT' ? 165 : 180)) { setError('Ders sürelerinin toplamı sınav süresini aşamaz.'); return; }
    patch({ sectionMinutes: values }); setTiming(false); toast('Ders süreleri kaydedildi.');
  };
  const pace = mockPace(mock);
  const pending = learning.issues.filter(i => !i.reviewed);
  const identified = [...new Set(pending.filter(i => i.topicId).map(i => i.topicId))];
  return <div className="mock-learning-panel">
    <section className="mock-priority" aria-labelledby="mock-issues-heading">
      <div className="row between"><h3 id="mock-issues-heading">Yanlış ve boşların nedenleri</h3><button className="btn small" onClick={() => { setError(''); setAdding(true); }}>Soru ekle</button></div>
      <p className="small muted">Kitapçığındaki her dersin kendi soru numarasını kullan. Konuyu bilmiyorsan boş bırak; sonuçtan konu tahmin edilmez.</p>
      {!learning.issues.length && <p>Bir yanlış veya boşunu ekleyerek kişisel çalışma rotanı başlat.</p>}
      <div className="mock-issue-list">{learning.issues.map(i => <article className="mock-performance-row" key={i.id}>
        <div className="row between"><b>{sectionDef(mock.exam, i.sectionKey).label} · Soru {i.question}</b><span className="badge">{i.kind === 'yanlis' ? 'Yanlış' : 'Boş'}</span></div>
        <p><b>{MOCK_REASONS[i.reason].label}</b> · {getTopicRef(i.topicId)?.topic.name ?? 'Konu henüz belirlenmedi'}</p>
        <p>{MOCK_REASONS[i.reason].action}</p>{i.note && <p className="small muted">{i.note}</p>}
        <div className="row">
          {i.topicId && <a className="btn small" href={`#/konu/${i.topicId}`}>Anlatım ve örnekler</a>}
          {i.topicId && <a className="btn small" href={`#/testler?konu=${i.topicId}`}>Pekiştirme soruları</a>}
          <a className="btn small" href={`#/ogretmen${i.topicId ? `?konu=${i.topicId}` : ''}`}>Fotoğrafla öğretmene sor</a>
          <button className="btn small" aria-pressed={i.reviewed} onClick={() => patch({ issues: learning.issues.map(x => x.id === i.id ? { ...x, reviewed: !x.reviewed } : x) })}>{i.reviewed ? 'İncelendi · geri aç' : 'İnceledim'}</button>
        </div>
      </article>)}</div>
    </section>
    <section className="mock-priority" aria-labelledby="mock-plan-heading"><h3 id="mock-plan-heading">Denemeden çalışma planına</h3>
      <p>{identified.length ? `${identified.length} konu belirlendi. İlk 3 konu için anlatım, örnek, pekiştirme ve 3 gün sonra tekrar ölçümü planlanır.` : 'Önce bir sorunun eksik konusunu seç. Her konu kendi öğrenme alanına bağlanır.'} Yanlış konuların akıllı tekrar takvimine de alınır; tekrar sorularında zorlanırsan tarih öne çekilir.</p>
      <div className="row"><button className="btn primary" disabled={!identified.length} onClick={() => { update(s => planMockLearning(s, mock.id, dayKey())); toast('Çalışma planı ve tekrar takvimi hazır. Mevcut görevler tekrar eklenmedi.'); }}>Çalışma rotasını planıma ekle</button><a className="btn" href="#/plan">Planımı aç</a><a className="btn" href="#/tekrar">Akıllı tekrarlarım</a></div>
      {tasks.length > 0 && <p className="small">Bu denemeden {tasks.length} görev · {tasks.filter(t => t.done).length} tamamlandı.</p>}
      <p className="tiny muted">“İnceledim”, soruyu gözden geçirdiğini kaydeder. Konunun öğrenildiği, tekrar sorularındaki performansınla ölçülür.</p>
    </section>
    <section className="mock-priority" aria-labelledby="mock-time-heading"><div className="row between"><h3 id="mock-time-heading">Ders bazında süre analizi</h3><button className="btn small" onClick={() => { setTimes(Object.fromEntries(mock.sections.map(s => [s.key, learning.sectionMinutes[s.key] ? String(learning.sectionMinutes[s.key]) : '']))); setError(''); setTiming(true); }}>Ders sürelerini gir</button></div>
      <p className="small muted">Kronometreyle ölçtüğün gerçek süreleri gir. Ölçmediğin dersi boş bırak.</p>
      {pace.map(p => <div className="mock-performance-row" key={p.key}><b>{sectionDef(mock.exam, p.key).label} · {p.minutes} dk</b><p>{p.secondsPerAttempt === null ? 'İşaretlenmiş soru yok; soru başına süre hesaplanmadı.' : `İşaretlenen soru başına yaklaşık ${p.secondsPerAttempt} saniye.`} {p.blanks} boşun {p.timeBlanks} tanesini süre nedeniyle işaretledin.</p></div>)}
      <p className="tiny muted">Ortalama süre, yanlış ve boşları inceleme süresini de içerir; tek başına hız veya bilgi düzeyini kanıtlamaz.</p>
    </section>
    <div className="row mt-12"><a className="btn" href="#/karne">Haftalık gelişim ve 3 önceliğim</a></div>
    {adding && <Modal title="Yanlış / boş soru ekle" onClose={() => setAdding(false)} actions={<><button className="btn" onClick={() => setAdding(false)}>Vazgeç</button><button className="btn primary" onClick={saveIssue}>Soruyu kaydet</button></>}>
      <div className="form-grid two"><label className="field"><span>Ders</span><select className="input" value={section} onChange={e => { setSection(e.target.value); setTopic(''); }}>{mock.sections.filter(s => MOCK_SECTIONS[mock.exam].some(d => d.key === s.key)).map(s => <option key={s.key} value={s.key}>{sectionDef(mock.exam, s.key).label}</option>)}</select></label>
      <label className="field"><span>Ders içindeki soru numarası</span><input className="input" type="number" inputMode="numeric" min={1} max={sectionDef(mock.exam, section).questions} value={question} onChange={e => setQuestion(e.target.value)} /></label>
      <label className="field"><span>Sonuç</span><select className="input" value={kind} onChange={e => setKind(e.target.value as typeof kind)}><option value="yanlis">Yanlış</option><option value="bos">Boş</option></select></label>
      <label className="field"><span>Nedeni</span><select className="input" value={reason} onChange={e => setReason(e.target.value as MockIssueReason)}>{Object.entries(MOCK_REASONS).map(([key, r]) => <option key={key} value={key}>{r.label}</option>)}</select></label></div>
      <label className="field mt-12"><span>Eksik konu (isteğe bağlı)</span><select className="input" value={topic} onChange={e => setTopic(e.target.value)}><option value="">Henüz bilmiyorum</option>{subjects.map(s => <optgroup key={s.id} label={subjectLabel(s)}>{s.units.flatMap(u => u.topics).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</optgroup>)}</select></label>
      <label className="field mt-12"><span>Kendime not</span><textarea className="input" maxLength={400} value={note} onChange={e => setNote(e.target.value)} placeholder="Hangi adımda takıldım?" /></label>{error && <p className="field-error" role="alert">{error}</p>}
    </Modal>}
    {timing && <Modal title="Ders sürelerini kaydet" onClose={() => setTiming(false)} actions={<><button className="btn" onClick={() => setTiming(false)}>Vazgeç</button><button className="btn primary" onClick={saveTimes}>Süreleri kaydet</button></>}>
      <div className="form-grid two">{mock.sections.map(s => <label className="field" key={s.key}><span>{sectionDef(mock.exam, s.key).label} süresi (dk)</span><input className="input" type="number" inputMode="decimal" min={0.1} max={180} step="0.1" value={times[s.key] ?? ''} onChange={e => setTimes(x => ({ ...x, [s.key]: e.target.value }))} /></label>)}</div>{error && <p className="field-error" role="alert">{error}</p>}
    </Modal>}
  </div>;
}
