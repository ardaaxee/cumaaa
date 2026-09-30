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
import { buildAdaptivePlan } from '../services/adaptiveStudy';
import { launchAdaptivePractice, launchWithIds, makeConfig } from '../services/testLauncher';
import { addTask, inferWrongReason } from '../store/actions';
import { getState, update, useAppState } from '../store/store';
import { dayKey, formatDay, formatDuration } from '../utils/date';
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
  const bySubtopic = useMemo(
    () => (score && byId ? breakdown(score.items, byId, (q) => q.subtopic ?? '').filter((r) => r.key) : []),
    [score, byId],
  );
  const byDiff = useMemo(() => (score && byId ? breakdown(score.items, byId, (q) => q.difficulty) : []), [score, byId]);
  const errorReasons = useMemo(() => {
    if (!score || !byId) return [];
    const labels: Record<string, string> = { kavram: 'Kavram eksiği', islem: 'İşlem hatası', yorum: 'Yorum / okuma', dikkat: 'Dikkat', zaman: 'Zaman baskısı', bos: 'Boş bırakıldı' };
    const counts = new Map<string, number>();
    for (const item of score.items) {
      if (item.state === 'dogru') continue;
      const q = byId.get(item.questionId);
      if (!q) continue;
      const r = inferWrongReason(q, item.answer, item.timeMs);
      counts.set(r, (counts.get(r) ?? 0) + 1);
    }
    return [...counts.entries()].map(([key, count]) => ({ key, label: labels[key] ?? key, count })).sort((a, b) => b.count - a.count);
  }, [score, byId]);

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
  const weakestSubtopic = bySubtopic
    .filter((r) => r.total >= 2 && r.success != null)
    .slice()
    .sort((a, b) => (a.success ?? 0) - (b.success ?? 0))[0];
  const subtopicLabel = (id: string) => {
    for (const topicId of topicIds) {
      const st = getTopicRef(topicId)?.topic.subtopics.find((s) => s.id === id);
      if (st) return st.name;
    }
    return id;
  };
  const subtopicTopicId = (id: string) => topicIds.find((topicId) => getTopicRef(topicId)?.topic.subtopics.some((s) => s.id === id));

  const retryWrongs = async () => {
    const err = await launchWithIds(wrongIds, makeConfig({ origin: 'yanlislar', mode: 'ogrenme', title: 'Bu testin yanlışları' }));
    if (err) toast(err);
  };

  const createRecoveryPlan = (days: 3 | 7 | 14) => {
    const today = dayKey();
    const smart = buildAdaptivePlan(getState(), today, days);
    update((current) => {
      const kept = current.tasks.filter(
        (task) => !(task.date >= today && !task.done && task.title.startsWith('Akıllı ·')),
      );
      let next = { ...current, tasks: kept };
      for (const task of smart.tasks) next = addTask(next, task);
      return next;
    });
    toast(`Sonuçlarına göre ${days} günlük toparlanma planın güncellendi.`, 5000);
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
        {(wrongIds.length > 0 || result.config.origin === 'deneme') && (
          <div className="recovery-plan-actions" role="group" aria-label="Toparlanma planı süresi">
            <span className="tiny muted">Toparlanma planı:</span>
            <button type="button" className="btn ghost small" onClick={() => createRecoveryPlan(3)}>3 gün</button>
            <button type="button" className="btn ghost small" onClick={() => createRecoveryPlan(7)}>7 gün</button>
            <button type="button" className="btn ghost small" onClick={() => createRecoveryPlan(14)}>14 gün</button>
          </div>
        )}
        {(result.config.origin === 'adaptif' || result.config.origin === 'seviye') && (
          <button type="button" className="btn ghost" onClick={() => void launchAdaptivePractice(12).then((e) => e && toast(e))}>
            Sonraki adaptif test
          </button>
        )}
      </div>

      {errorReasons.length > 0 && (
        <section className="card section result-error-analysis" aria-labelledby="error-reason-h">
          <div className="card-head">
            <div>
              <div className="eyebrow">Yanlışın neden?</div>
              <h2 id="error-reason-h">Hata türü analizi</h2>
            </div>
            <a className="btn small" href="#/yanlislar">Yanlış defterini aç</a>
          </div>
          <div className="error-reason-grid">
            {errorReasons.map((r) => (
              <div className="error-reason-item" key={r.key}>
                <b>{r.count}</b>
                <span>{r.label}</span>
              </div>
            ))}
          </div>
          <p className="tiny muted mt-8">Bu sınıflandırma soru tipi, boş bırakma ve çözüm süresine göre otomatik tahmindir; yanlış defterinde nedeni değiştirebilirsin.</p>
        </section>
      )}

      {weakestSubtopic && (
        <section className="card section result-learning-next" aria-labelledby="next-learning-h">
          <div>
            <div className="eyebrow">Sonraki çalışma</div>
            <h2 id="next-learning-h">{subtopicLabel(weakestSubtopic.key)}</h2>
            <p className="small muted">
              Bu testte bu alt konuda {weakestSubtopic.correct}/{weakestSubtopic.total} doğru yaptın. Önce kısa konu tekrarına dön, sonra yalnız bu alt konudan soru çöz.
            </p>
          </div>
          <div className="row">
            {subtopicTopicId(weakestSubtopic.key) && (
              <a className="btn" href={'#/konu/' + subtopicTopicId(weakestSubtopic.key)}>Konuyu tekrar et</a>
            )}
            <a
              className="btn primary"
              href={href('/testler', { konu: subtopicTopicId(weakestSubtopic.key), altkonu: weakestSubtopic.key })}
            >
              Bu alt konudan soru çöz
            </a>
          </div>
        </section>
      )}

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
        {bySubtopic.length > 0 && (
          <section className="card" aria-labelledby="bs-h">
            <h2 id="bs-h" className="mb-8">Alt konu bazlı başarı</h2>
            {bySubtopic.map((r) => (
              <div key={r.key} className="bar-row">
                <a
                  className="name"
                  href={href('/testler', { konu: subtopicTopicId(r.key), altkonu: r.key })}
                >
                  {subtopicLabel(r.key)}
                </a>
                <div className="progress" aria-hidden="true">
                  <span style={{ width: `${r.success ?? 0}%` }} />
                </div>
                <span className="pct">{r.correct}/{r.total}</span>
              </div>
            ))}
          </section>
        )}
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
