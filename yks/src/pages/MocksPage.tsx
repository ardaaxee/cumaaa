import { useMemo, useState } from 'react';
import type { Exam, SubjectId } from '../domain/types';
import { LineChart } from '../components/Charts';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/Layout';
import { ConfirmDialog, Empty, Modal, Segmented, Stat, toast } from '../components/ui';
import { addMock, deleteMock } from '../store/actions';
import { loadQuestionsFor, loadSubjectQuestions } from '../data/content';
import { launchWithIds, makeConfig, hasActiveTest } from '../services/testLauncher';
import { getState } from '../store/store';
import { FULL_MOCKS, buildFullMock, totalQuestions } from '../utils/fullMock';
import type { MockExam } from '../store/schema';
import { update, useSelector } from '../store/store';
import { dayKey, formatDay, isValidDayKey } from '../utils/date';
import { MOCK_SECTIONS, analyzeMocks, buildSections, mockNet, mockTotals, sectionDef, sectionNet, sortMocks, type SectionInput } from '../utils/mock';
import { calcNet, formatNet, round2 } from '../utils/net';
import { pickQuestions } from '../utils/testEngine';
import { osymBookletPdfUrl, osymBookletUrl } from '../data/officialResources';

interface BranchMockDef {
  subjects: { subjectId: SubjectId; count: number }[];
  label: string;
  count: number;
  durationMin: number;
  icon: string;
}

const BRANCH_MOCKS: Record<Exam, BranchMockDef[]> = {
  TYT: [
    { subjects: [{ subjectId: 'tyt-turkce', count: 40 }], label: 'Türkçe', count: 40, durationMin: 55, icon: 'Aa' },
    {
      subjects: [
        { subjectId: 'tyt-matematik', count: 30 },
        { subjectId: 'tyt-geometri', count: 10 },
      ],
      label: 'Matematik',
      count: 40,
      durationMin: 65,
      icon: '∑',
    },
    { subjects: [{ subjectId: 'tyt-fizik', count: 7 }], label: 'Fizik', count: 7, durationMin: 12, icon: '⚡' },
    { subjects: [{ subjectId: 'tyt-kimya', count: 7 }], label: 'Kimya', count: 7, durationMin: 12, icon: '⚗' },
    { subjects: [{ subjectId: 'tyt-biyoloji', count: 6 }], label: 'Biyoloji', count: 6, durationMin: 10, icon: '◉' },
  ],
  AYT: [
    {
      subjects: [
        { subjectId: 'ayt-matematik', count: 30 },
        { subjectId: 'ayt-geometri', count: 10 },
      ],
      label: 'Matematik',
      count: 40,
      durationMin: 90,
      icon: '∑',
    },
    { subjects: [{ subjectId: 'ayt-fizik', count: 14 }], label: 'Fizik', count: 14, durationMin: 25, icon: '⚡' },
    { subjects: [{ subjectId: 'ayt-kimya', count: 13 }], label: 'Kimya', count: 13, durationMin: 25, icon: '⚗' },
    { subjects: [{ subjectId: 'ayt-biyoloji', count: 13 }], label: 'Biyoloji', count: 13, durationMin: 25, icon: '◉' },
  ],
};

function MockForm({ exam, onClose }: { exam: Exam; onClose: () => void }) {
  const defs = MOCK_SECTIONS[exam];
  const [name, setName] = useState('');
  const [date, setDate] = useState(dayKey());
  const [inputs, setInputs] = useState<Record<string, { correct: string; wrong: string }>>(() =>
    Object.fromEntries(defs.map((d) => [d.key, { correct: '', wrong: '' }])),
  );
  const [errors, setErrors] = useState<string[]>([]);

  const parsed: SectionInput[] = defs.map((d) => ({ key: d.key, correct: Number(inputs[d.key].correct) || 0, wrong: Number(inputs[d.key].wrong) || 0 }));
  const total = round2(parsed.reduce((s, p) => s + calcNet(p.correct, p.wrong), 0));

  const save = () => {
    const { sections, errors: errs } = buildSections(exam, parsed);
    const all = [...errs];
    if (!isValidDayKey(date)) all.push('Geçerli bir tarih seç.');
    if (sections.every((s) => s.correct === 0 && s.wrong === 0)) all.push('En az bir derste doğru veya yanlış gir.');
    setErrors(all);
    if (all.length) return;
    update((s) => addMock(s, { exam, name: name.trim().slice(0, 80) || `${exam} Denemesi`, date, sections }));
    toast('Deneme kaydedildi.');
    onClose();
  };

  return (
    <Modal
      title={`${exam} denemesi ekle`}
      onClose={onClose}
      actions={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Vazgeç
          </button>
          <button type="button" className="btn primary" onClick={save}>
            Kaydet
          </button>
        </>
      }
    >
      <div className="form-grid two">
        <label className="field">
          <span>Deneme adı</span>
          <input className="input" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder={`Örn. ${exam} Genel Deneme 3`} />
        </label>
        <label className="field">
          <span>Tarih</span>
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>
      <div className="table-scroll mt-12">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Ders</th>
              <th scope="col">Doğru</th>
              <th scope="col">Yanlış</th>
              <th scope="col">Boş</th>
              <th scope="col">Net</th>
            </tr>
          </thead>
          <tbody>
            {defs.map((d, i) => {
              const p = parsed[i];
              const blank = d.questions - p.correct - p.wrong;
              return (
                <tr key={d.key}>
                  <th scope="row" style={{ textAlign: 'left' }}>
                    {d.label}
                    <div className="tiny muted">{d.questions} soru</div>
                  </th>
                  {(['correct', 'wrong'] as const).map((k) => (
                    <td key={k}>
                      <input
                        className="input"
                        style={{ width: 64, minHeight: 40, padding: '6px 8px', textAlign: 'right' }}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={d.questions}
                        aria-label={`${d.label} ${k === 'correct' ? 'doğru' : 'yanlış'}`}
                        value={inputs[d.key][k]}
                        onChange={(e) => setInputs((x) => ({ ...x, [d.key]: { ...x[d.key], [k]: e.target.value } }))}
                      />
                    </td>
                  ))}
                  <td style={{ color: blank < 0 ? 'var(--bad)' : undefined }}>{blank}</td>
                  <td>
                    <b>{formatNet(calcNet(p.correct, p.wrong))}</b>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" style={{ textAlign: 'left' }}>
                Toplam
              </th>
              <td colSpan={3} />
              <td>
                <b>{formatNet(total)}</b>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="tiny muted mt-8">Boş sayısı otomatik hesaplanır. Net = Doğru − Yanlış / 4.</div>
      {errors.length > 0 && (
        <ul className="field-error mt-8" role="alert">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

export default function MocksPage() {
  const mocks = useSelector((s) => s.mocks);
  const [exam, setExam] = useState<Exam>('TYT');
  const [range, setRange] = useState<'5' | '10'>('5');
  const [adding, setAdding] = useState(false);
  const [del, setDel] = useState<MockExam | null>(null);
  const [startExam, setStartExam] = useState<Exam | null>(null);

  const startFullMock = async (e: Exam) => {
    setStartExam(null);
    const plan = FULL_MOCKS[e];
    let pool;
    try {
      pool = await loadQuestionsFor({ exam: e, subjectId: 'all', topicId: 'all' });
    } catch {
      toast('Sorular yüklenemedi. İnternet bağlantını kontrol edip tekrar dene.');
      return;
    }
    const ids = buildFullMock(plan, pool, getState().attempts);
    const expected = totalQuestions(plan);
    if (ids.length !== expected) {
      toast('Tam sınav simülasyonu için yeterli özgün soru yok. Eksik deneme başlatılmadı.', 5000);
      return;
    }
    const err = await launchWithIds(
      ids,
      makeConfig({ exam: e, mode: 'sinav', origin: 'deneme', count: ids.length, durationMin: plan.durationMin, title: `${plan.title} (${formatDay(dayKey())})` }),
    );
    if (err) toast(err);
  };

  const startBranchMock = async (item: BranchMockDef) => {
    const state = getState();
    const preferredTypes = new Set(['islem', 'yorum', 'grafik', 'cok-adimli', 'yeni-nesil', 'deney']);
    const ids: string[] = [];

    try {
      for (const part of item.subjects) {
        const pool = await loadSubjectQuestions(part.subjectId);
        const physics = part.subjectId.endsWith('-fizik');
        const preferred = physics ? pool.filter((q) => preferredTypes.has(q.type)) : pool;
        const targetPreferred = physics ? Math.ceil(part.count * 0.85) : part.count;
        const first = pickQuestions(preferred, Math.min(part.count, targetPreferred), state.attempts);
        const used = new Set(first);
        const rest = pickQuestions(
          pool.filter((q) => !used.has(q.id)),
          Math.max(0, part.count - first.length),
          state.attempts,
        );
        const selected = [...first, ...rest].slice(0, part.count);
        ids.push(...selected);
      }
    } catch {
      toast(item.label + ' soru havuzu yüklenemedi.');
      return;
    }

    if (ids.length !== item.count) {
      toast(
        item.label + ' branş denemesi için tam ' + item.count + ' özgün soru gerekiyor. Havuz şu an ' + ids.length + ' soruyu karşılıyor; eksik deneme başlatılmadı.',
        5500,
      );
      return;
    }

    const isPhysics = item.subjects.length === 1 && item.subjects[0].subjectId.endsWith('-fizik');
    const configSubject: SubjectId | 'all' = item.subjects.length === 1 ? item.subjects[0].subjectId : 'all';
    const err = await launchWithIds(
      ids,
      makeConfig({
        exam,
        subjectId: configSubject,
        count: ids.length,
        mode: 'sinav',
        origin: 'filtre',
        durationMin: item.durationMin,
        title: exam + ' ' + item.label + ' Branş Denemesi' + (isPhysics ? ' · İşlem + Yorum' : ''),
      }),
    );
    if (err) toast(err);
  };

  const list = useMemo(() => sortMocks(mocks.filter((m) => m.exam === exam)), [mocks, exam]);
  const shown = list.slice(-Number(range));
  const analysis = useMemo(() => analyzeMocks(exam, shown).filter((a) => a.key !== 'genel'), [exam, shown]);
  const avg = list.length ? round2(list.reduce((s, m) => s + mockNet(m), 0) / list.length) : null;
  const improving = analysis.filter((a) => a.slope != null && a.series.length >= 2).sort((a, b) => (b.slope ?? 0) - (a.slope ?? 0))[0];
  const weakest = analysis.slice().sort((a, b) => a.ratio - b.ratio)[0];
  const maxTotal = MOCK_SECTIONS[exam].reduce((s, d) => s + d.questions, 0);

  return (
    <>
      <PageHeader
        title="Denemeler"
        sub="TYT ve AYT deneme takibi · ders ders net"
        actions={
          <button type="button" className="btn primary" onClick={() => setAdding(true)}>
            <Icon name="plus" /> <span>Deneme</span>
          </button>
        }
      />
      <div className="mock-exam-switch" aria-label="Deneme türü">
        <Segmented
          label="Sınav"
          value={exam}
          onChange={setExam}
          options={[
            { value: 'TYT', label: 'TYT' },
            { value: 'AYT', label: 'AYT Sayısal' },
          ]}
        />
      </div>

      <section className={`mock-exam-hero ${exam.toLowerCase()}`} aria-labelledby="fm-h">
        <div className="mock-exam-copy">
          <div className="eyebrow">{exam} sınav modu</div>
          <h2 id="fm-h">{exam === 'TYT' ? 'TYT Tam Deneme' : 'AYT Sayısal Tam Deneme'}</h2>
          <p>
            {exam === 'TYT'
              ? '120 soru · 165 dakika. Türkçe, Sosyal, Temel Matematik ve Fen dağılımıyla tek oturum.'
              : '80 soru · 180 dakika. Sayısal puan türü için Matematik ve Fen testleri.'}
            {' '}Kronometre ve kalan süre birlikte görünür; uygulama arka planda olsa da sınav saati durmaz.
          </p>
          <div className="row">
            <button type="button" className="btn primary" onClick={() => setStartExam(exam)}>
              <Icon name="play" /> Tam denemeyi başlat
            </button>
            <a className="btn" href="#branch-mocks">Branş denemeleri</a>
          </div>
        </div>
        <div className="mock-clock-preview" aria-hidden="true">
          <span>{exam}</span>
          <b>{exam === 'TYT' ? '02:45' : '03:00'}</b>
          <small>arka planda da devam eder</small>
        </div>
      </section>

      <section id="branch-mocks" className="card section branch-mocks-card" aria-labelledby="branch-h">
        <div className="card-head">
          <div>
            <div className="eyebrow">{exam} branş denemeleri</div>
            <h2 id="branch-h">Ders ders süreli deneme</h2>
          </div>
          <span className="badge brand">{BRANCH_MOCKS[exam].length} branş</span>
        </div>
        <p className="small muted">
          Her branş kendi soru sayısı ve süresiyle açılır. Matematik denemeleri 30 matematik + 10 geometri dağılımını korur; fizikte işlem, grafik, deney ve yorum soruları ağırlıklıdır.
        </p>
        <div className="branch-mock-grid">
          {BRANCH_MOCKS[exam].map((item) => (
            <button key={item.label} type="button" className="branch-mock" onClick={() => void startBranchMock(item)}>
              <span className="branch-mock-icon">{item.icon}</span>
              <span className="grow">
                <b>{item.label}</b>
                <small>{item.count} soru · {item.durationMin} dk</small>
              </span>
              <Icon name="right" />
            </button>
          ))}
        </div>
      </section>

      <section className="mock-source-grid section" aria-label="Deneme kaynakları">
        <div className="card mock-source-card">
          <span className="mock-source-icon" aria-hidden="true">✎</span>
          <div className="grow">
            <b>Uygulama içi özgün YKS denemeleri</b>
            <p>Çıkmış YKS’lerin konu dağılımı ve ölçme mantığına göre hazırlanmış özgün sorular. Fizikte işlem ve yorum soruları ağırlıklı.</p>
          </div>
        </div>
        <div className="card mock-source-card official">
          <span className="mock-source-icon" aria-hidden="true">Ö</span>
          <div className="grow">
            <b>2026 {exam} çıkmış soruları</b>
            <p>ÖSYM’nin resmî {exam} PDF kitapçığını doğrudan aç. Mobilde ara sayfa kullanılmaz.</p>
            <div className="row mt-8">
              <a className="btn small primary" href={osymBookletPdfUrl(2026, exam)}>PDF’yi aç</a>
              <a className="btn small ghost" href={osymBookletUrl(2026)}>ÖSYM sayfası</a>
            </div>
          </div>
        </div>
      </section>

      <div className="row between section">
        <div className="small muted"><b>{exam}</b> sonuçların ve net trendin</div>
        <Segmented label="Aralık" value={range} onChange={setRange} options={[{ value: '5', label: 'Son 5' }, { value: '10', label: 'Son 10' }]} />
      </div>

      <section className="grid grid-4 section" aria-label="Deneme özeti">
        <Stat label="Toplam deneme" value={list.length} />
        <Stat label="Ortalama net" value={avg != null ? formatNet(avg) : '—'} sub={`/${maxTotal} soru`} />
        <Stat label="En hızlı gelişen" value={improving && (improving.slope ?? 0) > 0 ? improving.label : '—'} sub={improving && (improving.slope ?? 0) > 0 ? `deneme başına +${formatNet(round2(improving.slope ?? 0))} net` : 'En az 2 deneme gerekir'} />
        <Stat label="En zayıf ders" value={weakest ? weakest.label : '—'} sub={weakest ? `ort. ${formatNet(weakest.average)} net` : 'Henüz veri yok'} />
      </section>

      {list.length === 0 ? (
        <div className="card section">
          <Empty title={`Henüz ${exam} denemesi girmedin.`} action={<button type="button" className="btn primary" onClick={() => setAdding(true)}>İlk denemeni ekle</button>}>
            Grafikler ve analizler gerçek deneme sonuçlarından oluşur.
          </Empty>
        </div>
      ) : (
        <>
          <section className="card section" aria-labelledby="trend-h">
            <h2 id="trend-h" className="mb-8">
              Toplam net · son {shown.length} deneme
            </h2>
            <LineChart
              title={`${exam} toplam net trendi`}
              unit="net"
              points={shown.map((m, i) => ({ label: `${i + 1}`, fullLabel: `${m.name} (${formatDay(m.date)})`, value: mockNet(m) }))}
            />
          </section>

          {analysis.length > 0 && (
            <section className="section" aria-labelledby="sec-h">
              <h2 id="sec-h" className="mb-8">
                Ders bazlı net trendi
              </h2>
              <div className="grid grid-cards">
                {analysis.map((a) => (
                  <div key={a.key} className="card">
                    <div className="row between">
                      <h3>{a.label}</h3>
                      <span className="small muted">ort. {formatNet(a.average)}</span>
                    </div>
                    <LineChart
                      title={`${a.label} net trendi`}
                      unit="net"
                      height={140}
                      maxValue={sectionDef(exam, a.key).questions || undefined}
                      points={a.series.map((v, i) => ({ label: `${i + 1}`, value: v }))}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="card section" aria-labelledby="list-h">
            <h2 id="list-h" className="mb-8">
              Tüm {exam} denemeleri
            </h2>
            <ul className="list">
              {list
                .slice()
                .reverse()
                .map((m) => {
                  const t = mockTotals(m);
                  return (
                    <li key={m.id} className="list-item" style={{ alignItems: 'flex-start' }}>
                      <div className="grow">
                        <b>{m.name}</b>
                        <div className="tiny muted">
                          {formatDay(m.date)} · D {t.correct} · Y {t.wrong} · B {t.blank}
                        </div>
                        <div className="tiny muted">{m.sections.map((s) => `${sectionDef(m.exam, s.key).label}: ${formatNet(sectionNet(s))}`).join(' · ')}</div>
                        {m.note && <div className="tiny muted">{m.note}</div>}
                      </div>
                      <span className="badge brand">{formatNet(mockNet(m))} net</span>
                      <button type="button" className="btn small ghost danger" onClick={() => setDel(m)} aria-label={`${m.name} denemesini sil`}>
                        <Icon name="trash" />
                      </button>
                    </li>
                  );
                })}
            </ul>
          </section>
        </>
      )}

      {adding && <MockForm exam={exam} onClose={() => setAdding(false)} />}
      {del && (
        <ConfirmDialog
          title="Deneme silinsin mi?"
          message={`${del.name} (${formatDay(del.date)})`}
          confirmLabel="Sil"
          danger
          onCancel={() => setDel(null)}
          onConfirm={() => {
            update((s) => deleteMock(s, del.id));
            setDel(null);
          }}
        />
      )}
      {startExam && (
        <ConfirmDialog
          title={`${FULL_MOCKS[startExam].title} başlasın mı?`}
          confirmLabel="Başlat"
          message={
            <>
              {totalQuestions(FULL_MOCKS[startExam])} soru, {FULL_MOCKS[startExam].durationMin} dakika. Sınav modunda cevaplar sonda gösterilir; süre bitince deneme otomatik tamamlanır.
              {hasActiveTest() && <b> Devam eden testin kapanacak.</b>}
            </>
          }
          onCancel={() => setStartExam(null)}
          onConfirm={() => void startFullMock(startExam)}
        />
      )}
    </>
  );
}
