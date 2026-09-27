import { useEffect, useMemo, useState } from 'react';
import { getTopicRef, subjectLabel } from '../data/curriculum';
import { loadLesson, loadQuestions } from '../data/content';
import type { LessonSeed } from '../domain/types';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/Layout';
import { ConfirmDialog, Empty, SourceBadge, Spinner, Stat, toast } from '../components/ui';
import { href, navigate } from '../hooks/useRoute';
import { launchTest, makeConfig, hasActiveTest } from '../services/testLauncher';
import { addNotebookPage, markReviewDone, setTopicStatus } from '../store/actions';
import type { TopicStatus } from '../store/schema';
import { update, useAppState } from '../store/store';
import { recentTopicPerformance, weakTopics } from '../utils/analysis';
import { dayKey, formatDay } from '../utils/date';
import { isDue, stageLabel } from '../utils/srs';

const LEVEL: Record<string, string> = { kolay: 'Kolay', orta: 'Orta', zor: 'Zor' };

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n\n+/).map((p, i) => (
        <p key={i} className="pre-line">
          {p}
        </p>
      ))}
    </>
  );
}

function LessonView({ lesson }: { lesson: LessonSeed }) {
  const sections: [string, string][] = [
    ['giris', 'Giriş'],
    ['onbilgi', 'Ön bilgiler'],
    ['kavramlar', 'Kavramlar'],
    ['formuller', 'Formüller'],
    ['mantik', 'Mantığı'],
    ['ornekler', 'Örnekler'],
    ['osym', 'Sınav mantığı'],
    ['hatalar', 'Sık hatalar'],
    ['puf', 'Püf noktası'],
    ['ozet', '1 dk özet'],
  ];
  return (
    <article className="lesson">
      <nav className="toc" aria-label="Konu bölümleri">
        {sections.map(([id, label]) => (
          <a
            key={id}
            href={`#sec-${id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            {label}
          </a>
        ))}
      </nav>

      <section id="sec-giris">
        <h2>Konuya giriş</h2>
        <Paragraphs text={lesson.intro} />
      </section>

      <section id="sec-onbilgi">
        <h2>Bilmen gereken ön bilgiler</h2>
        <ul>
          {lesson.prerequisites.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </section>

      <section id="sec-kavramlar">
        <h2>Temel kavramlar</h2>
        <dl className="concept">
          {lesson.concepts.map((c, i) => (
            <div key={i}>
              <dt>{c.term}</dt>
              <dd>{c.definition}</dd>
            </div>
          ))}
        </dl>
      </section>

      {lesson.formulas.length > 0 && (
        <section id="sec-formuller">
          <h2>Formüller / bağıntılar</h2>
          {lesson.formulas.map((f, i) => (
            <div key={i} className="formula">
              <code>{f.expr}</code>
              <div className="meaning">{f.meaning}</div>
            </div>
          ))}
        </section>
      )}

      <section id="sec-mantik">
        <h2>Mantığı: neden böyle?</h2>
        <Paragraphs text={lesson.logic} />
      </section>

      <section id="sec-ornekler">
        <h2>Adım adım çözümlü örnekler</h2>
        {lesson.examples.map((ex, i) => (
          <div key={i} className="example">
            <div className="row between">
              <b>Örnek {i + 1}</b>
              <span className="badge outline">{LEVEL[ex.level] ?? ex.level}</span>
            </div>
            <p className="pre-line mt-8">{ex.problem}</p>
            <details>
              <summary className="btn small">Çözümü göster</summary>
              <ol>
                {ex.steps.map((s, j) => (
                  <li key={j} className="pre-line">
                    {s}
                  </li>
                ))}
              </ol>
              <div className="answer">Cevap: {ex.answer}</div>
            </details>
          </div>
        ))}
      </section>

      <section id="sec-osym">
        <h2>ÖSYM tarzında düşünme</h2>
        <div className="callout">
          <Paragraphs text={lesson.osymThinking} />
        </div>
      </section>

      <section id="sec-hatalar">
        <h2>Sık yapılan hatalar</h2>
        <div className="callout bad">
          <ul>
            {lesson.commonMistakes.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="sec-puf">
        <h2>Püf noktası</h2>
        <div className="callout ok">
          <ul>
            {lesson.tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="sec-ozet">
        <h2>1 dakikalık özet</h2>
        <ul>
          {lesson.summary.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}

export default function TopicPage({ params }: { params: string[] }) {
  const topicId = params[0] ?? '';
  const ref = getTopicRef(topicId);
  const state = useAppState();
  const [lesson, setLesson] = useState<LessonSeed | null | undefined>(undefined);
  const [qCount, setQCount] = useState<number | null>(null);
  const [pending, setPending] = useState<null | (() => void)>(null);

  useEffect(() => {
    let alive = true;
    loadLesson(topicId).then((l) => alive && setLesson(l ?? null));
    loadQuestions().then((qs) => alive && setQCount(qs.filter((q) => q.topic === topicId).length));
    return () => {
      alive = false;
    };
  }, [topicId]);

  const perf = useMemo(() => recentTopicPerformance(state.attempts, topicId, 5), [state.attempts, topicId]);
  const weak = useMemo(() => weakTopics(state).find((w) => w.topicId === topicId), [state, topicId]);

  if (!ref) {
    return (
      <>
        <PageHeader title="Konu bulunamadı" back="#/dersler" />
        <Empty title="Bu konu bulunamadı." action={<a className="btn" href="#/dersler">Derslere dön</a>} />
      </>
    );
  }

  const status: TopicStatus = state.topicProgress[topicId]?.status ?? 'baslanmadi';
  const review = state.reviews[topicId];
  const today = dayKey();
  const videos = state.videos.filter((v) => v.topicId === topicId);
  const openWrongs = Object.values(state.wrongs).filter((w) => w.topicId === topicId && !w.learned).length;

  const setStatus = (s: TopicStatus) => {
    update((st) => setTopicStatus(st, topicId, s));
    if (s === 'tamamlandi') toast('Konu tamamlandı. İlk tekrar yarın için planlandı.');
  };

  const start = (count: number, origin: 'konu-mini' | 'konu-normal') => {
    const run = async () => {
      const err = await launchTest(makeConfig({ topicId, count, mode: 'ogrenme', origin, title: `${ref.topic.name} ${origin === 'konu-mini' ? 'mini test' : 'test'}` }));
      if (err) toast(err);
    };
    if (hasActiveTest()) setPending(() => run);
    else void run();
  };

  const writeToNotebook = () => {
    let noteId = '';
    update((s) => {
      const r = addNotebookPage(s, `${ref.topic.name} notları`, ref.subject.id);
      noteId = r.id;
      return r.state;
    });
    navigate(`/defterim/${noteId}`);
  };

  return (
    <>
      <PageHeader title={ref.topic.name} sub={`${subjectLabel(ref.subject)} · ${ref.unit.name}`} back={`#/ders/${ref.subject.id}`} />

      <div className="card">
        <div className="row">
          <SourceBadge type="meb-program" />
          <span className="badge">{ref.topic.grade}. sınıf</span>
          {weak && <span className="badge bad">Zayıf konu: {weak.reasons.join(', ')}</span>}
        </div>
        <div className="field mt-12">
          <span className="field-label" id="status-label">Konu durumu</span>
          <div className="segmented" role="radiogroup" aria-labelledby="status-label">
            {(['baslanmadi', 'calisiliyor', 'tamamlandi'] as TopicStatus[]).map((s) => (
              <button key={s} type="button" role="radio" aria-checked={status === s} aria-pressed={status === s} onClick={() => setStatus(s)}>
                {s === 'baslanmadi' ? 'Başlanmadı' : s === 'calisiliyor' ? 'Çalışıyorum' : 'Tamamlandı'}
              </button>
            ))}
          </div>
        </div>
        {review && (
          <div className={`notice mt-12 ${isDue(review, today) ? 'warn' : ''}`}>
            <Icon name="repeat" />
            <div className="grow">
              Tekrar: {stageLabel(review.stage)}
              {review.stage < 5 && <> · {isDue(review, today) ? 'bugün tekrar zamanı' : `sıradaki: ${formatDay(review.dueDay)}`}</>}
            </div>
            {isDue(review, today) && (
              <button type="button" className="btn small" onClick={() => { update((s) => markReviewDone(s, topicId)); toast('Tekrar kaydedildi.'); }}>
                Tekrar ettim
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-3 section">
        <Stat label="Soru bankası" value={qCount ?? '…'} sub="özgün pratik soru" />
        <Stat label="Son testlerde" value={perf.accuracy != null ? `%${perf.accuracy}` : '—'} sub={perf.total ? `${perf.total} sorudan ${perf.correct} doğru` : 'Henüz çözülmedi'} />
        <Stat label="Açık yanlış" value={openWrongs} sub={openWrongs ? <a href="#/yanlislar">Yanlışlarıma git</a> : 'yok'} />
      </div>

      <div className="card section">
        <div className="card-head">
          <h2>Pratik yap</h2>
          <SourceBadge type="ozgun-pratik" />
        </div>
        <div className="row">
          <button type="button" className="btn primary" onClick={() => start(5, 'konu-mini')} disabled={!qCount}>
            Mini test (5 soru)
          </button>
          <button type="button" className="btn" onClick={() => start(Math.min(20, Math.max(10, qCount ?? 10)), 'konu-normal')} disabled={!qCount}>
            Normal test ({Math.min(20, Math.max(10, qCount ?? 10))} soru)
          </button>
          <a className="btn ghost" href={href('/ogretmen', { konu: topicId, eylem: 'anlat' })}>
            <Icon name="teacher" /> Öğretmene sor
          </a>
          <button type="button" className="btn ghost" onClick={writeToNotebook}>
            <Icon name="sparkle" /> Deftere yaz
          </button>
        </div>
        {qCount != null && qCount < 10 && qCount > 0 && <div className="tiny muted mt-8">Bu konuda {qCount} soru var; normal test mevcut soruların tamamını kullanır.</div>}
      </div>

      <div className="card section">
        {lesson === undefined ? <Spinner label="Konu anlatımı yükleniyor" /> : lesson === null ? <Empty title="Bu konunun anlatımı henüz eklenmedi." /> : <LessonView lesson={lesson} />}
      </div>

      <div className="card section">
        <details>
          <summary className="card-head" style={{ cursor: 'pointer', marginBottom: 0 }}>
            <h2>Alt konular ve kazanımlar</h2>
          </summary>
          {ref.topic.subtopics.map((st) => (
            <div key={st.id} className="mt-12">
              <b>{st.name}</b>
              <ul className="small muted" style={{ margin: '4px 0 0', paddingLeft: '1.2em' }}>
                {st.outcomes.map((o) => (
                  <li key={o.id}>{o.text}</li>
                ))}
              </ul>
            </div>
          ))}
        </details>
      </div>

      <div className="card section">
        <div className="card-head">
          <h2>Video kaynaklarım</h2>
          <a className="btn small" href={href('/kaynaklar', { konu: topicId })}>
            <Icon name="plus" /> Ekle
          </a>
        </div>
        {videos.length === 0 ? (
          <div className="small muted">Bu konuya eklediğin video yok.</div>
        ) : (
          <ul className="list">
            {videos.map((v) => (
              <li key={v.id} className="list-item">
                <Icon name="video" />
                <span className="grow">
                  {v.title} <span className="tiny muted">{v.channel}</span>
                </span>
                {v.watched && <span className="badge ok">İzlendi</span>}
                <a className="btn small" href={v.url} target="_blank" rel="noopener noreferrer">
                  Aç
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {status !== 'tamamlandi' && (
        <div className="card section center">
          <p className="muted">Konuyu anladığından eminsen tamamlandı olarak işaretle; tekrar takvimi başlasın.</p>
          <button type="button" className="btn primary" onClick={() => setStatus('tamamlandi')}>
            Konuyu tamamla
          </button>
        </div>
      )}

      {pending && (
        <ConfirmDialog
          title="Devam eden test var"
          message="Yeni test başlatırsan devam eden test kaydedilmeden kapanır."
          confirmLabel="Yeni testi başlat"
          danger
          onCancel={() => setPending(null)}
          onConfirm={() => {
            const fn = pending;
            setPending(null);
            fn();
          }}
        />
      )}
    </>
  );
}
