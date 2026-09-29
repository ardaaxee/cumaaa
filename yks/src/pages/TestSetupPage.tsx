import { useMemo, useState } from 'react';
import { SUBJECTS, getSubject, getTopicRef, subjectLabel } from '../data/curriculum';
import { loadQuestionsFor } from '../data/content';
import { useLoad } from '../hooks/useLoad';
import type { Difficulty, Question, QuestionType } from '../domain/types';
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
import { QUESTION_COUNTS, filterPool } from '../utils/testEngine';

export default function TestSetupPage() {
  const state = useAppState();
  const route = useRoute();
  const [cfg, setCfg] = useState<TestConfig>(() => {
    const presetExam = route.query.get('sinav');
    const presetSubjectId = route.query.get('ders');
    const presetTopicId = route.query.get('konu');
    const presetSubtopicId = route.query.get('altkonu');
    const presetDifficulty = route.query.get('zorluk');
    const presetType = route.query.get('tip');
    const presetSubject = presetSubjectId ? getSubject(presetSubjectId) : undefined;
    const presetTopic = presetTopicId ? getTopicRef(presetTopicId) : undefined;
    const validSubtopic = presetTopic?.topic.subtopics.some((s) => s.id === presetSubtopicId) ? presetSubtopicId! : 'all';
    const validDifficulty = ['kolay', 'orta', 'zor', 'yeni-nesil'].includes(presetDifficulty ?? '') ? (presetDifficulty as Difficulty) : 'all';
    const validType = Object.prototype.hasOwnProperty.call(TYPE_LABEL, presetType ?? '') ? (presetType as QuestionType) : 'all';

    return makeConfig({
      exam: presetExam === 'TYT' || presetExam === 'AYT' ? presetExam : presetSubject?.exam ?? presetTopic?.subject.exam ?? 'all',
      subjectId: presetSubject?.id ?? presetTopic?.subject.id ?? 'all',
      topicId: presetTopic?.topic.id ?? 'all',
      subtopicId: validSubtopic,
      difficulty: validDifficulty,
      type: validType,
    });
  });
  const [confirm, setConfirm] = useState<null | (() => Promise<string | null>)>(null);

  // Yalnız seçili sınav/ders için soru sayılır; tüm banka gereksiz yere indirilmez.
  const loaded = useLoad<Question[]>(() => loadQuestionsFor(cfg), [cfg.exam, cfg.subjectId, cfg.topicId]);
  const questions = loaded.data ?? null;

  const set = (patch: Partial<TestConfig>) => setCfg((c) => ({ ...c, ...patch }));
  const pool = useMemo(() => (questions ? filterPool(questions, cfg) : []), [questions, cfg]);
  const subjects = SUBJECTS.filter((s) => cfg.exam === 'all' || s.exam === cfg.exam);
  const subject = cfg.subjectId !== 'all' ? getSubject(cfg.subjectId) : undefined;
  const topics = subject ? subject.units.flatMap((u) => u.topics) : [];
  const topic = cfg.topicId !== 'all' ? getTopicRef(cfg.topicId)?.topic : undefined;
  const openWrongIds = Object.values(state.wrongs).filter((w) => !w.learned).map((w) => w.questionId);
  const poolDifficulty = useMemo(
    () => Object.entries(DIFFICULTY_LABEL).map(([key, label]) => ({ key, label, count: pool.filter((q) => q.difficulty === key).length })),
    [pool],
  );
  const poolTypes = useMemo(
    () =>
      Object.entries(TYPE_LABEL)
        .map(([key, label]) => ({ key, label, count: pool.filter((q) => q.type === key).length }))
        .filter((x) => x.count > 0)
        .sort((a, b) => b.count - a.count),
    [pool],
  );

  const run = (fn: () => Promise<string | null>) => {
    const go = async () => {
      const err = await fn();
      if (err) toast(err);
    };
    if (state.activeTest) setConfirm(() => fn);
    else void go();
  };

  const recent = state.testResults.slice(-8).reverse();

  return (
    <>
      <PageHeader title="Testler" sub="Özgün YKS pratiği · gerçek sınav deneyimi" />

      {state.activeTest && (
        <div className="notice warn">
          <div className="grow">
            Devam eden bir testin var ({Object.values(state.activeTest.answers).filter((a) => a != null).length}/{state.activeTest.questionIds.length} cevaplandı).
          </div>
          <button type="button" className="btn small primary" onClick={() => navigate('/test')}>
            Devam et
          </button>
        </div>
      )}

      <section className="card section test-builder-card" aria-labelledby="setup-h">
        <div className="card-head">
          <h2 id="setup-h">Test oluştur</h2>
          <SourceBadge type="ozgun-pratik" />
        </div>
        <div className="form-grid two">
          <label className="field">
            <span>Sınav</span>
            <select className="select" value={cfg.exam} onChange={(e) => set({ exam: e.target.value as TestConfig['exam'], subjectId: 'all', topicId: 'all', subtopicId: 'all' })}>
              <option value="all">TYT + AYT</option>
              <option value="TYT">TYT</option>
              <option value="AYT">AYT</option>
            </select>
          </label>
          <label className="field">
            <span>Ders</span>
            <select className="select" value={cfg.subjectId} onChange={(e) => set({ subjectId: e.target.value as TestConfig['subjectId'], topicId: 'all', subtopicId: 'all' })}>
              <option value="all">Karışık</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {subjectLabel(s)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Konu</span>
            <select className="select" value={cfg.topicId} disabled={!subject} onChange={(e) => set({ topicId: e.target.value, subtopicId: 'all' })}>
              <option value="all">{subject ? 'Tüm konular' : 'Önce ders seç'}</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Alt konu</span>
            <select className="select" value={cfg.subtopicId} disabled={!topic} onChange={(e) => set({ subtopicId: e.target.value })}>
              <option value="all">{topic ? 'Tüm alt konular' : 'Önce konu seç'}</option>
              {topic?.subtopics.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Zorluk</span>
            <select className="select" value={cfg.difficulty} onChange={(e) => set({ difficulty: e.target.value as Difficulty | 'all' })}>
              <option value="all">Tümü</option>
              {Object.entries(DIFFICULTY_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Soru tipi</span>
            <select className="select" value={cfg.type} onChange={(e) => set({ type: e.target.value as QuestionType | 'all' })}>
              <option value="all">Tümü</option>
              {Object.entries(TYPE_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <div className="field">
            <span className="field-label" id="count-l">Soru sayısı</span>
            <div className="segmented" role="group" aria-labelledby="count-l">
              {QUESTION_COUNTS.map((n) => (
                <button key={n} type="button" aria-pressed={cfg.count === n} onClick={() => set({ count: n })}>
                  {n}
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
        {questions && pool.length > 0 && (
          <div className="test-pool-map" aria-label="Soru havuzu dağılımı">
            <div className="test-pool-head">
              <span>Soru havuzu</span>
              <b>{pool.length} soru</b>
            </div>
            <div className="test-pool-chips">
              {poolDifficulty.filter((x) => x.count > 0).map((x) => (
                <button
                  key={x.key}
                  type="button"
                  className={'chip' + (cfg.difficulty === x.key ? ' on' : '')}
                  onClick={() => set({ difficulty: cfg.difficulty === x.key ? 'all' : (x.key as Difficulty) })}
                >
                  {x.label} · {x.count}
                </button>
              ))}
            </div>
            <div className="test-pool-types">
              {poolTypes.slice(0, 5).map((x) => <span key={x.key}>{x.label} {x.count}</span>)}
            </div>
          </div>
        )}

        <p className="small muted mt-12" style={{ marginBottom: 0 }}>
          {cfg.mode === 'ogrenme'
            ? 'Öğrenme modu: her cevaptan sonra doğru/yanlış, çözüm, öğretmene sor ve benzer soru seçenekleri görünür.'
            : `Sınav modu: süre ${Math.round((Math.min(cfg.count, pool.length || cfg.count) * 90) / 60)} dk (soru başına 1,5 dk). Test bitene kadar cevaplar açıklanmaz.`}
        </p>
        <div className="row mt-12">
          <button
            type="button"
            className="btn primary"
            disabled={!!questions && pool.length === 0}
            onClick={() => run(() => launchTest(cfg))}
          >
            Testi başlat
          </button>
          <span className="small muted" aria-live="polite">
            {questions ? `Bu filtrede ${pool.length} soru var${pool.length && pool.length < cfg.count ? ` (test ${pool.length} soruyla başlar)` : ''}.` : loaded.failed ? (
              <>
                Soru sayısı alınamadı.{' '}
                <button type="button" className="btn small ghost" onClick={loaded.retry}>
                  Tekrar dene
                </button>
              </>
            ) : (
              'Sorular sayılıyor…'
            )}
          </span>
        </div>
      </section>

      <section className="card section test-secondary-card" aria-labelledby="wr-h">
        <div className="card-head">
          <h2 id="wr-h">Yanlışlarımdan test</h2>
          <span className="badge">{openWrongIds.length} soru</span>
        </div>
        {openWrongIds.length === 0 ? (
          <div className="small muted">Yanlışlar defterin boş. Test çözdükçe yanlış ve boş bıraktığın sorular buraya gelir.</div>
        ) : (
          <button
            type="button"
            className="btn"
            onClick={() => run(() => launchWithIds(openWrongIds.slice(0, 40), makeConfig({ origin: 'yanlislar', mode: 'ogrenme', title: 'Yanlışlarım tekrarı' })))}
          >
            Yanlışlarımı tekrar çöz ({Math.min(40, openWrongIds.length)} soru)
          </button>
        )}
      </section>

      <section className="card section test-secondary-card" aria-labelledby="hist-h">
        <div className="card-head">
          <h2 id="hist-h">Son testlerim</h2>
        </div>
        {recent.length === 0 ? (
          <Empty title="Henüz test çözmedin.">İlk testini çöz; sonuçların burada listelenir.</Empty>
        ) : (
          <ul className="list">
            {recent.map((r) => (
              <li key={r.id}>
                <a className="link-row" href={`#/sonuc/${r.id}`}>
                  <span className="grow">
                    <b>{r.config.title ?? (r.config.subjectId !== 'all' ? subjectLabel(getSubject(r.config.subjectId)!) : 'Karışık test')}</b>
                    <span className="tiny muted" style={{ display: 'block' }}>
                      {formatDay(r.day)} · {r.questionIds.length} soru · {formatDuration(r.durationMs)} · {r.config.mode === 'sinav' ? 'Sınav' : 'Öğrenme'}
                    </span>
                  </span>
                  <span className="badge brand">{formatNet(r.net)} net</span>
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
          onConfirm={async () => {
            const fn = confirm;
            setConfirm(null);
            const err = await fn();
            if (err) toast(err);
          }}
        />
      )}
    </>
  );
}
