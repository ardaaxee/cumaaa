import { useMemo, useState } from 'react';
import { SUBJECTS, getSubject, getTopicRef, subjectLabel } from '../data/curriculum';
import {
  QUESTION_COUNT_TOTAL,
  QUESTION_COUNTS_BY_EXAM,
  QUESTION_COUNTS_BY_SUBJECT,
  QUESTION_COUNTS_BY_TOPIC,
} from '../data/questionMetadata.generated';
import type { Difficulty, QuestionType } from '../domain/types';
import { DIFFICULTY_LABEL, TYPE_LABEL } from '../components/QuestionView';
import { PageHeader } from '../components/Layout';
import { ConfirmDialog, Empty, SourceBadge, toast } from '../components/ui';
import { navigate } from '../hooks/useRoute';
import { launchTest, launchWithIds, makeConfig } from '../services/testLauncher';
import type { TestConfig } from '../store/schema';
import { useAppState } from '../store/store';
import { useRoute } from '../hooks/useRoute';
import { formatDay, formatDuration } from '../utils/date';
import { formatNet } from '../utils/net';
import { QUESTION_COUNTS } from '../utils/testEngine';

function availableBeforeAdvancedFilters(cfg: TestConfig): number {
  if (cfg.topicId !== 'all') return QUESTION_COUNTS_BY_TOPIC[cfg.topicId] ?? 0;
  if (cfg.subjectId !== 'all') return QUESTION_COUNTS_BY_SUBJECT[cfg.subjectId] ?? 0;
  if (cfg.exam === 'TYT') return QUESTION_COUNTS_BY_EXAM.TYT ?? 0;
  if (cfg.exam === 'AYT') return QUESTION_COUNTS_BY_EXAM.AYT ?? 0;
  return QUESTION_COUNT_TOTAL;
}

export default function TestSetupPage() {
  const state = useAppState();
  const route = useRoute();
  const [cfg, setCfg] = useState<TestConfig>(() => {
    const preset = route.query.get('sinav');
    return makeConfig(preset === 'TYT' || preset === 'AYT' ? { exam: preset } : {});
  });
  const [confirm, setConfirm] = useState<null | (() => Promise<string | null>)>(null);
  const [launching, setLaunching] = useState(false);

  const set = (patch: Partial<TestConfig>) => setCfg((current) => ({ ...current, ...patch }));
  const subjects = SUBJECTS.filter((subject) => cfg.exam === 'all' || subject.exam === cfg.exam);
  const subject = cfg.subjectId !== 'all' ? getSubject(cfg.subjectId) : undefined;
  const topics = subject ? subject.units.flatMap((unit) => unit.topics) : [];
  const topic = cfg.topicId !== 'all' ? getTopicRef(cfg.topicId)?.topic : undefined;
  const openWrongIds = Object.values(state.wrongs)
    .filter((wrong) => !wrong.learned)
    .map((wrong) => wrong.questionId);

  // Bu sayı derleme sırasında üretilen küçücük metadata'dan gelir.
  // Test kurulum ekranını açmak artık soru JS chunk'larını indirmez.
  const availableBase = useMemo(
    () => availableBeforeAdvancedFilters(cfg),
    [cfg.exam, cfg.subjectId, cfg.topicId],
  );

  const advancedFilterActive =
    cfg.subtopicId !== 'all' || cfg.difficulty !== 'all' || cfg.type !== 'all';

  const execute = async (fn: () => Promise<string | null>) => {
    if (launching) return;
    setLaunching(true);
    try {
      const error = await fn();
      if (error) toast(error);
    } finally {
      setLaunching(false);
    }
  };

  const run = (fn: () => Promise<string | null>) => {
    if (launching) return;
    if (state.activeTest) setConfirm(() => fn);
    else void execute(fn);
  };

  const recent = state.testResults.slice(-8).reverse();
  const estimatedQuestions = Math.max(1, Math.min(cfg.count, availableBase || cfg.count));

  return (
    <>
      <PageHeader title="Testler" sub="Özgün YKS pratiği · gerçek sınav deneyimi" />

      {state.activeTest && (
        <div className="notice warn">
          <div className="grow">
            Devam eden bir testin var ({Object.values(state.activeTest.answers).filter((answer) => answer != null).length}/
            {state.activeTest.questionIds.length} cevaplandı).
          </div>
          <button type="button" className="btn small primary" onClick={() => navigate('/test')}>
            Devam et
          </button>
        </div>
      )}

      <section className="card section" aria-labelledby="setup-h">
        <div className="card-head">
          <h2 id="setup-h">Test oluştur</h2>
          <SourceBadge type="ozgun-pratik" />
        </div>

        <div className="notice">
          Test ekranı açılırken soru bankası indirilmez. Filtrelerini seç; gerekli soru paketleri yalnız <b>Testi başlat</b> dediğinde hazırlanır.
        </div>

        <div className="form-grid two mt-12">
          <label className="field">
            <span>Sınav</span>
            <select
              className="select"
              value={cfg.exam}
              onChange={(event) =>
                set({
                  exam: event.target.value as TestConfig['exam'],
                  subjectId: 'all',
                  topicId: 'all',
                  subtopicId: 'all',
                })
              }
            >
              <option value="all">TYT + AYT</option>
              <option value="TYT">TYT</option>
              <option value="AYT">AYT</option>
            </select>
          </label>

          <label className="field">
            <span>Ders</span>
            <select
              className="select"
              value={cfg.subjectId}
              onChange={(event) =>
                set({
                  subjectId: event.target.value as TestConfig['subjectId'],
                  topicId: 'all',
                  subtopicId: 'all',
                })
              }
            >
              <option value="all">Karışık</option>
              {subjects.map((item) => (
                <option key={item.id} value={item.id}>
                  {subjectLabel(item)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Konu</span>
            <select
              className="select"
              value={cfg.topicId}
              disabled={!subject}
              onChange={(event) => set({ topicId: event.target.value, subtopicId: 'all' })}
            >
              <option value="all">{subject ? 'Tüm konular' : 'Önce ders seç'}</option>
              {topics.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Alt konu</span>
            <select
              className="select"
              value={cfg.subtopicId}
              disabled={!topic}
              onChange={(event) => set({ subtopicId: event.target.value })}
            >
              <option value="all">{topic ? 'Tüm alt konular' : 'Önce konu seç'}</option>
              {topic?.subtopics.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Zorluk</span>
            <select
              className="select"
              value={cfg.difficulty}
              onChange={(event) => set({ difficulty: event.target.value as Difficulty | 'all' })}
            >
              <option value="all">Tümü</option>
              {Object.entries(DIFFICULTY_LABEL).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Soru tipi</span>
            <select
              className="select"
              value={cfg.type}
              onChange={(event) => set({ type: event.target.value as QuestionType | 'all' })}
            >
              <option value="all">Tümü</option>
              {Object.entries(TYPE_LABEL).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <div className="field">
            <span className="field-label" id="count-l">Soru sayısı</span>
            <div className="segmented" role="group" aria-labelledby="count-l">
              {QUESTION_COUNTS.map((count) => (
                <button
                  key={count}
                  type="button"
                  aria-pressed={cfg.count === count}
                  onClick={() => set({ count })}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="field-label" id="mode-l">Mod</span>
            <div className="segmented" role="group" aria-labelledby="mode-l">
              <button type="button" aria-pressed={cfg.mode === 'ogrenme'} onClick={() => set({ mode: 'ogrenme' })}>
                Öğrenme
              </button>
              <button type="button" aria-pressed={cfg.mode === 'sinav'} onClick={() => set({ mode: 'sinav' })}>
                Sınav
              </button>
            </div>
          </div>
        </div>

        <p className="small muted mt-12" style={{ marginBottom: 0 }}>
          {cfg.mode === 'ogrenme'
            ? 'Öğrenme modu: her cevaptan sonra doğru/yanlış ve ayrıntılı çözüm görünür.'
            : `Sınav modu: yaklaşık ${Math.round((estimatedQuestions * 90) / 60)} dk. Test bitene kadar cevaplar açıklanmaz.`}
        </p>

        <div className="row mt-12">
          <button
            type="button"
            className="btn primary"
            disabled={launching || availableBase === 0}
            aria-busy={launching}
            onClick={() => run(() => launchTest(cfg))}
          >
            {launching ? 'Sorular hazırlanıyor…' : 'Testi başlat'}
          </button>
          <span className="small muted" aria-live="polite">
            {availableBase === 0
              ? 'Bu seçim için soru bulunmuyor.'
              : advancedFilterActive
                ? `Temel havuzda ${availableBase} soru var. Zorluk/tip filtresi test başlatılırken doğrulanır.`
                : `Bu seçimde ${availableBase} soru var${availableBase < cfg.count ? `; test en fazla ${availableBase} soruyla başlar` : ''}.`}
          </span>
        </div>
      </section>

      <section className="card section" aria-labelledby="wr-h">
        <div className="card-head">
          <h2 id="wr-h">Yanlışlarımdan test</h2>
          <span className="badge">{openWrongIds.length} soru</span>
        </div>
        {openWrongIds.length === 0 ? (
          <div className="small muted">
            Yanlışlar defterin boş. Test çözdükçe yanlış ve boş bıraktığın sorular buraya gelir.
          </div>
        ) : (
          <button
            type="button"
            className="btn"
            disabled={launching}
            onClick={() =>
              run(() =>
                launchWithIds(
                  openWrongIds.slice(0, 40),
                  makeConfig({ origin: 'yanlislar', mode: 'ogrenme', title: 'Yanlışlarım tekrarı' }),
                ),
              )
            }
          >
            {launching ? 'Sorular hazırlanıyor…' : `Yanlışlarımı tekrar çöz (${Math.min(40, openWrongIds.length)} soru)`}
          </button>
        )}
      </section>

      <section className="card section" aria-labelledby="hist-h">
        <div className="card-head">
          <h2 id="hist-h">Son testlerim</h2>
        </div>
        {recent.length === 0 ? (
          <Empty title="Henüz test çözmedin.">İlk testini çöz; sonuçların burada listelenir.</Empty>
        ) : (
          <ul className="list">
            {recent.map((result) => (
              <li key={result.id}>
                <a className="link-row" href={`#/sonuc/${result.id}`}>
                  <span className="grow">
                    <b>
                      {result.config.title ??
                        (result.config.subjectId !== 'all'
                          ? subjectLabel(getSubject(result.config.subjectId)!)
                          : 'Karışık test')}
                    </b>
                    <span className="tiny muted" style={{ display: 'block' }}>
                      {formatDay(result.day)} · {result.questionIds.length} soru · {formatDuration(result.durationMs)} ·{' '}
                      {result.config.mode === 'sinav' ? 'Sınav' : 'Öğrenme'}
                    </span>
                  </span>
                  <span className="badge brand">{formatNet(result.net)} net</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="tiny muted section">
        Bu bölümdeki tüm sorular uygulama için yazılmış <b>özgün pratik sorulardır</b>; ÖSYM tarafından hazırlanmamıştır. Gerçek çıkmış sorular için{' '}
        <a href="#/cikmis">ÖSYM Çıkmış Sorular</a> bölümünden resmî ÖSYM sayfasına gidebilirsin.
      </p>

      {confirm && (
        <ConfirmDialog
          title="Devam eden test var"
          message="Yeni test başlatırsan devam eden test kaydedilmeden kapanır."
          confirmLabel="Yeni testi başlat"
          danger
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            const fn = confirm;
            setConfirm(null);
            void execute(fn);
          }}
        />
      )}
    </>
  );
}
