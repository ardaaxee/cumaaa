import { useMemo, useState } from 'react';
import { SUBJECTS, getTopicRef, subjectLabel } from '../data/curriculum';
import { BarChart } from '../components/Charts';
import { PageHeader } from '../components/Layout';
import { Empty, Segmented, Stat } from '../components/ui';
import { useAppState } from '../store/store';
import { weakTopics } from '../utils/analysis';
import { dayKey, formatDay, formatMinutes } from '../utils/date';
import { formatNet, percent } from '../utils/net';
import { dailySeries, dashboard, summarize, topicPerformance } from '../utils/stats';

export default function ProgressPage() {
  const state = useAppState();
  const today = dayKey();
  const [range, setRange] = useState<'7' | '30'>('7');
  const [metric, setMetric] = useState<'questions' | 'minutes'>('questions');
  const d = useMemo(() => dashboard(state, today), [state, today]);
  const series = useMemo(() => dailySeries(state, Number(range), today), [state, range, today]);
  const hasSeries = series.some((p) => p.questions > 0 || p.minutes > 0);
  const perf = useMemo(() => topicPerformance(state.attempts), [state.attempts]);
  const weak = useMemo(() => weakTopics(state), [state]);
  const rangeSummary = summarize(state.attempts.filter((a) => a.day >= series[0].day));

  const subjectRows = SUBJECTS.map((s) => {
    const topics = s.units.flatMap((u) => u.topics);
    const done = topics.filter((t) => state.topicProgress[t.id]?.status === 'tamamlandi').length;
    const attempts = state.attempts.filter((a) => a.subjectId === s.id);
    const sum = summarize(attempts);
    return { s, done, total: topics.length, pct: percent(done, topics.length) ?? 0, accuracy: sum.accuracy, solved: sum.answered };
  });

  const best = [...perf.values()].filter((p) => p.attempts >= 5).sort((a, b) => (b.accuracy ?? 0) - (a.accuracy ?? 0)).slice(0, 5);

  return (
    <>
      <PageHeader title="Gelişimim" sub="Tüm değerler senin gerçek kayıtlarından hesaplanır" />

      <section className="grid grid-4" aria-label="Gelişim özeti">
        <Stat label="Bugün çözülen soru" value={d.todayQuestions} />
        <Stat label="Bu hafta çözülen" value={d.weekQuestions} />
        <Stat label="Toplam soru" value={d.totalQuestions} />
        <Stat label="Doğruluk" value={d.accuracy != null ? `%${d.accuracy}` : '—'} sub={d.accuracy == null ? 'Henüz veri yok' : 'doğru / cevaplanan'} />
        <Stat label="Bugünkü çalışma" value={formatMinutes(d.todayMinutes)} />
        <Stat label="Haftalık çalışma" value={formatMinutes(d.weekMinutes)} />
        <Stat label="Tamamlanan konu" value={d.completedTopics} />
        <Stat label="Seri" value={`${d.streak} gün`} />
        <Stat label="Toplam deneme" value={d.mockCount} />
        <Stat label="Son deneme neti" value={d.lastMockNet != null ? formatNet(d.lastMockNet) : '—'} sub={d.lastMockExam ?? 'Henüz deneme yok'} />
        <Stat label="Toplam çalışma" value={formatMinutes(d.totalMinutes)} />
        <Stat label="Çözülen test" value={state.testResults.length} />
      </section>
      {state.legacy && <p className="tiny muted mt-8">Toplamlara eski sürümden aktarılan {state.legacy.answered} soru ve {state.legacy.minutes} dk dahildir (güne atanamadıkları için günlük grafiklerde yoktur).</p>}

      <section className="card section" aria-labelledby="ts-h">
        <div className="card-head">
          <h2 id="ts-h">Son {range} gün</h2>
          <div className="row">
            <Segmented label="Veri" value={metric} onChange={setMetric} options={[{ value: 'questions', label: 'Soru' }, { value: 'minutes', label: 'Süre' }]} />
            <Segmented label="Aralık" value={range} onChange={setRange} options={[{ value: '7', label: '7 gün' }, { value: '30', label: '30 gün' }]} />
          </div>
        </div>
        {!hasSeries ? (
          <Empty title="Henüz yeterli veri yok.">Test çözdükçe ve odak seansı tamamladıkça günlük grafik oluşur.</Empty>
        ) : (
          <>
            <BarChart
              title={metric === 'questions' ? `Son ${range} gün çözülen soru` : `Son ${range} gün çalışma süresi`}
              unit={metric === 'questions' ? 'soru' : 'dk'}
              points={series.map((p) => ({
                label: formatDay(p.day, range === '7' ? { weekday: 'short' } : { day: 'numeric' }),
                fullLabel: formatDay(p.day, { weekday: 'long', day: 'numeric', month: 'long' }),
                value: metric === 'questions' ? p.questions : p.minutes,
              }))}
            />
            <div className="small muted mt-8">
              Bu dönemde {rangeSummary.answered} soru çözüldü
              {rangeSummary.accuracy != null ? `, doğruluk %${rangeSummary.accuracy}` : ''} · toplam {formatMinutes(series.reduce((s, p) => s + p.minutes, 0))} çalışma.
            </div>
          </>
        )}
      </section>

      <section className="card section" aria-labelledby="sp-h">
        <h2 id="sp-h" className="mb-8">
          Ders bazlı ilerleme
        </h2>
        {subjectRows.map((r) => (
          <div key={r.s.id} className="bar-row">
            <a className="name" href={`#/ders/${r.s.id}`}>
              {subjectLabel(r.s)}
            </a>
            <div className="progress" role="progressbar" aria-valuenow={r.pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${subjectLabel(r.s)} konu ilerlemesi`}>
              <span style={{ width: `${r.pct}%` }} />
            </div>
            <span className="pct">%{r.pct}</span>
            <span className="tiny muted" style={{ gridColumn: '1 / -1', marginTop: -4 }}>
              {r.done}/{r.total} konu{r.solved ? ` · ${r.solved} soru · doğruluk %${r.accuracy}` : ''}
            </span>
          </div>
        ))}
      </section>

      <div className="grid grid-cards section">
        <section className="card" aria-labelledby="wk-h">
          <h2 id="wk-h" className="mb-8">
            Zayıf konular
          </h2>
          {weak.length === 0 ? (
            <div className="small muted">Henüz zayıf konu tespit edilmedi. (Aynı konuda en az 2 soruda yanlış ya da 5+ soruda %50 altı doğruluk gerekir.)</div>
          ) : (
            <ul className="list">
              {weak.slice(0, 8).map((w) => (
                <li key={w.topicId}>
                  <a className="link-row" href={`#/konu/${w.topicId}`}>
                    <span className="grow">{getTopicRef(w.topicId)?.topic.name ?? w.topicId}</span>
                    <span className="tiny muted">{w.reasons.join(', ')}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card" aria-labelledby="st-h">
          <h2 id="st-h" className="mb-8">
            Güçlü konular
          </h2>
          {best.length === 0 ? (
            <div className="small muted">Bir konuda en az 5 soru çözünce burada görünür.</div>
          ) : (
            <ul className="list">
              {best.map((p) => (
                <li key={p.topicId}>
                  <a className="link-row" href={`#/konu/${p.topicId}`}>
                    <span className="grow">{getTopicRef(p.topicId)?.topic.name ?? p.topicId}</span>
                    <span className="badge ok">%{p.accuracy}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
