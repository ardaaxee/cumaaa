import { useMemo, useState } from 'react';
import { AskLabel } from '../components/AskName';
import { getTopicRef } from '../data/curriculum';
import { loadQuestionsByIds } from '../data/content';
import { useLoad } from '../hooks/useLoad';
import type { Question } from '../domain/types';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/Layout';
import { DIFFICULTY_LABEL, Options, QuestionBody, QuestionMeta, SolutionBlock } from '../components/QuestionView';
import { Empty, Segmented, LoadFailed, Spinner, Stat, toast } from '../components/ui';
import { href } from '../hooks/useRoute';
import { launchAdaptivePractice, launchWithIds, makeConfig } from '../services/testLauncher';
import { useAppState } from '../store/store';
import { formatDay, formatDuration } from '../utils/date';
import { optionLetter } from '../utils/ids';
import { formatNet, percent } from '../utils/net';
import { breakdown, scoreTest, type AnswerState } from '../utils/testEngine';
import { FULL_MOCKS, mockSectionsFromAnswers } from '../utils/fullMock';
import { calcNet } from '../utils/net';

const STATE_LABEL: Record<AnswerState, string> = { dogru: 'Doğru', yanlis: 'Yanlış', bos: 'Boş' };

export default function TestResultPage({ params }: { params: string[] }) {
  const state = useAppState();
  const result = state.testResults.find((r) => r.id === params[0]);
  const [filter, setFilter] = useState<'all' | AnswerState | 'isaretli'>('all');
  const [open, setOpen] = useState<string | null>(null);

  // Yalnız gereken soruların dersleri yüklenir; hata olursa "Tekrar dene" görünür.
  const idKey = [...new Set(result?.questionIds ?? [])].sort().join('|');
  const loaded = useLoad<Map<string, Question>>(() => loadQuestionsByIds(idKey ? idKey.split('|') : []), [idKey]);
  const byId = loaded.data ?? null;

  const score = useMemo(() => (result && byId ? scoreTest({ ...result, elapsedMs: result.durationMs }, byId) : null), [result, byId]);
  const byTopic = useMemo(() => (score && byId ? breakdown(score.items, byId, (q) => q.topic) : []), [score, byId]);
  const byDiff = useMemo(() => (score && byId ? breakdown(score.items, byId, (q) => q.difficulty) : []), [score, byId]);

  if (!result) {
    return (
      <>
        <PageHeader title="Sonuç bulunamadı" back="#/testler" />
        <Empty title="Bu test sonucu bulunamadı." action={<a className="btn" href="#/testler">Testlere dön</a>} />
      </>
    );
  }
  if (loaded.failed) return <LoadFailed what="Sonuç" onRetry={loaded.retry} />;
  if (!score || !byId) return <Spinner />;

  const items = score.items.filter((i) => (filter === 'all' ? true : filter === 'isaretli' ? i.marked : i.state === filter));
  const wrongIds = score.items.filter((i) => i.state !== 'dogru').map((i) => i.questionId);
  const topicIds = [...new Set(score.items.map((i) => byId.get(i.questionId)?.topic).filter(Boolean))] as string[];

  const retryWrongs = async () => {
    const err = await launchWithIds(wrongIds, makeConfig({ origin: 'yanlislar', mode: 'ogrenme', title: 'Bu testin yanlışları' }));
    if (err) toast(err);
  };

  return (
    <>
      <PageHeader title="Test sonucu" sub={`${formatDay(result.day)} · ${result.config.mode === 'sinav' ? 'Sınav modu' : 'Öğrenme modu'}`} back="#/testler" />

      <section className="result-hero" aria-label="Test özeti">
        <div className="result-score">
          <div className="eyebrow">Test sonucu</div>
          <div className="result-net">{formatNet(score.net)} <span>net</span></div>
          <div className="result-success">%{percent(score.correct, score.items.length) ?? 0} başarı</div>
        </div>
        <div className="result-breakdown">
          <div className="result-pill ok"><b>{score.correct}</b><span>Doğru</span></div>
          <div className="result-pill bad"><b>{score.wrong}</b><span>Yanlış</span></div>
          <div className="result-pill"><b>{score.blank}</b><span>Boş</span></div>
        </div>
      </section>

      {result.config.origin === 'seviye' && (
        <section className="card section diagnostic-result-card" aria-labelledby="diagnostic-h">
          <div className="diagnostic-result-icon" aria-hidden="true">◎</div>
          <div className="grow">
            <div className="eyebrow">Seviye tespiti tamamlandı</div>
            <h2 id="diagnostic-h">Kişisel çalışma profilin güncellendi</h2>
            <p className="small muted">
              Bu sonuçtaki konu, zorluk ve hata verileri Akıllı Koç tarafından kullanılıyor. Hakimiyet haritanı görüp 7 günlük planını şimdi yeniden hesaplayabilirsin.
            </p>
          </div>
          <a className="btn primary" href="#/koc">Akıllı Koç'a git</a>
        </section>
      )}

      <section className="grid grid-4 section result-stats" aria-label="Detaylı özet">
        <Stat label="Doğruluk" value={score.accuracy != null ? `%${score.accuracy}` : '—'} sub="doğru / cevaplanan" />
        <Stat label="Süre" value={formatDuration(score.durationMs)} />
        <Stat label="Soru başına" value={formatDuration(score.avgMsPerQuestion)} sub="ortalama" />
        <Stat label="Toplam soru" value={score.items.length} />
      </section>

      {result.config.origin === 'deneme' && (result.config.exam === 'TYT' || result.config.exam === 'AYT') && (
        <section className="card section" aria-labelledby="sec-h">
          <div className="card-head">
            <h2 id="sec-h">Ders ders netler</h2>
            <a className="btn small" href="#/denemeler">
              Deneme grafiğim
            </a>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Bölüm</th>
                <th>D</th>
                <th>Y</th>
                <th>B</th>
                <th>Net</th>
              </tr>
            </thead>
            <tbody>
              {mockSectionsFromAnswers(
                result.config.exam,
                result.questionIds.map((id) => byId.get(id)).filter((q): q is Question => !!q),
                result.answers,
              ).map((sec) => (
                <tr key={sec.key}>
                  <td>{FULL_MOCKS[result.config.exam as 'TYT' | 'AYT'].parts.find((p) => p.section === sec.key)?.label}</td>
                  <td>{sec.correct}</td>
                  <td>{sec.wrong}</td>
                  <td>{sec.blank}</td>
                  <td>
                    <b>{formatNet(calcNet(sec.correct, sec.wrong))}</b>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="tiny muted mt-8">Bu deneme “Denemeler” sayfasına otomatik kaydedildi. Sorular uygulamanın özgün ÖSYM tarzı sorularıdır.</p>
        </section>
      )}

      <div className="row section result-actions">
        {wrongIds.length > 0 && (
          <button type="button" className="btn primary" onClick={() => void retryWrongs()}>
            Yanlış ve boşları tekrar çöz ({wrongIds.length})
          </button>
        )}
        <a className="btn" href="#/testler">
          Yeni test
        </a>
        <a className="btn ghost" href="#/yanlislar">
          Yanlışlarıma git
        </a>
        {(result.config.origin === 'adaptif' || result.config.origin === 'seviye') && (
          <button type="button" className="btn ghost" onClick={() => void launchAdaptivePractice(12).then((e) => e && toast(e))}>
            Sonraki adaptif test
          </button>
        )}
      </div>

      <div className="grid grid-cards section">
        <section className="card" aria-labelledby="bt-h">
          <h2 id="bt-h" className="mb-8">
            Konu bazlı başarı
          </h2>
          {byTopic.map((r) => (
            <div key={r.key} className="bar-row">
              <a className="name" href={`#/konu/${r.key}`}>
                {getTopicRef(r.key)?.topic.name ?? r.key}
              </a>
              <div className="progress" aria-hidden="true">
                <span style={{ width: `${r.success ?? 0}%` }} />
              </div>
              <span className="pct">
                {r.correct}/{r.total}
              </span>
            </div>
          ))}
        </section>
        <section className="card" aria-labelledby="bd-h">
          <h2 id="bd-h" className="mb-8">
            Zorluk bazlı başarı
          </h2>
          {byDiff.map((r) => (
            <div key={r.key} className="bar-row">
              <span className="name">{DIFFICULTY_LABEL[r.key] ?? r.key}</span>
              <div className="progress" aria-hidden="true">
                <span style={{ width: `${r.success ?? 0}%` }} />
              </div>
              <span className="pct">
                {r.correct}/{r.total}
              </span>
            </div>
          ))}
        </section>
      </div>

      <section className="card section result-review-card" aria-labelledby="rv-h">
        <div className="card-head">
          <h2 id="rv-h">Soru soru inceleme</h2>
          <Segmented
            label="Filtre"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'Tümü' },
              { value: 'yanlis', label: 'Yanlış' },
              { value: 'bos', label: 'Boş' },
              { value: 'dogru', label: 'Doğru' },
              { value: 'isaretli', label: 'İşaretli' },
            ]}
          />
        </div>
        {items.length === 0 ? (
          <div className="small muted">Bu filtrede soru yok.</div>
        ) : (
          <ul className="list">
            {items.map((item) => {
              const q = byId.get(item.questionId);
              if (!q) return null;
              const idx = score.items.indexOf(item);
              const isOpen = open === q.id;
              return (
                <li key={q.id}>
                  <button
                    type="button"
                    className="link-row"
                    style={{ width: '100%', border: 0, background: 'transparent', textAlign: 'left' }}
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : q.id)}
                  >
                    <b>{idx + 1}.</b>
                    <span className="grow small" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {q.question}
                    </span>
                    {item.marked && <Icon name="flag" title="İşaretli" />}
                    <span className={`badge ${item.state === 'dogru' ? 'ok' : item.state === 'yanlis' ? 'bad' : 'warn'}`}>{STATE_LABEL[item.state]}</span>
                  </button>
                  {isOpen && (
                    <div className="card mb-8" style={{ boxShadow: 'none' }}>
                      <QuestionMeta q={q} topicName={getTopicRef(q.topic)?.topic.name} />
                      <div className="mt-12">
                        <QuestionBody q={q} />
                      </div>
                      <Options q={q} selected={item.answer} reveal disabled />
                      <p className="small mt-12">
                        Senin cevabın: <b>{item.answer == null ? 'Boş' : optionLetter(item.answer)}</b> · Doğru cevap: <b>{optionLetter(q.correctAnswer)}</b> · Süre: {formatDuration(item.timeMs)}
                      </p>
                      <SolutionBlock q={q} />
                      <div className="row mt-12">
                        <a className="btn small" href={href('/ogretmen', { soru: q.id, cevap: item.answer != null ? String(item.answer) : undefined, eylem: item.state === 'dogru' ? 'coz' : 'hatam' })}>
                          <Icon name="teacher" /> <AskLabel />
                        </a>
                        <a className="btn small ghost" href={`#/konu/${q.topic}`}>
                          Konuya git
                        </a>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {topicIds.length > 0 && <div className="tiny muted mt-12">Bu testte {topicIds.length} farklı konu vardı.</div>}
      </section>
    </>
  );
}
