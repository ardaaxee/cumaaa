import { useEffect, useMemo, useState } from 'react';
import { AskLabel } from '../components/AskName';
import { getTopicRef } from '../data/curriculum';
import { loadQuestions } from '../data/content';
import type { Question } from '../domain/types';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/Layout';
import { DIFFICULTY_LABEL, Options, QuestionBody, QuestionMeta, SolutionBlock } from '../components/QuestionView';
import { Empty, Segmented, Spinner, Stat, toast } from '../components/ui';
import { href } from '../hooks/useRoute';
import { launchWithIds, makeConfig } from '../services/testLauncher';
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
  const [byId, setById] = useState<Map<string, Question> | null>(null);
  const [filter, setFilter] = useState<'all' | AnswerState | 'isaretli'>('all');
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    loadQuestions().then((qs) => setById(new Map(qs.map((q) => [q.id, q]))));
  }, []);

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

      <section className="grid grid-4" aria-label="Özet">
        <Stat label="Doğru" value={score.correct} />
        <Stat label="Yanlış" value={score.wrong} />
        <Stat label="Boş" value={score.blank} />
        <Stat label="Net" value={formatNet(score.net)} sub="Doğru − Yanlış / 4" />
        <Stat label="Doğruluk" value={score.accuracy != null ? `%${score.accuracy}` : '—'} sub="doğru / cevaplanan" />
        <Stat label="Başarı" value={`%${percent(score.correct, score.items.length) ?? 0}`} sub="doğru / toplam" />
        <Stat label="Süre" value={formatDuration(score.durationMs)} />
        <Stat label="Soru başına" value={formatDuration(score.avgMsPerQuestion)} sub="ortalama" />
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

      <div className="row section">
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

      <section className="card section" aria-labelledby="rv-h">
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
