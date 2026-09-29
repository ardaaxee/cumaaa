import { useMemo, useState } from 'react';
import { AskLabel } from '../components/AskName';
import { getTopicRef, subjectLabel } from '../data/curriculum';
import { loadLesson, loadTopicQuestions } from '../data/content';
import type { LessonSeed } from '../domain/types';
import { InlineQuiz } from '../components/InlineQuiz';
import { pickQuestions } from '../utils/testEngine';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/Layout';
import { ConfirmDialog, Empty, LoadFailed, SourceBadge, Spinner, Stat, toast } from '../components/ui';
import { href, navigate } from '../hooks/useRoute';
import { useSpeaker } from '../hooks/useVoice';
import { useLoad } from '../hooks/useLoad';
import { launchTest, makeConfig, hasActiveTest } from '../services/testLauncher';
import { addNotebookPage, markReviewDone, setTopicStatus } from '../store/actions';
import type { TopicStatus } from '../store/schema';
import { getState, update, useAppState } from '../store/store';
import { recentTopicPerformance, weakTopics } from '../utils/analysis';
import { dayKey, formatDay } from '../utils/date';
import { isDue, stageLabel } from '../utils/srs';
import { topicMastery } from '../services/adaptiveStudy';

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
        <a
          href="#konu-sonu"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('konu-sonu')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        >
          Konu sonu soruları ✎
        </a>
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
  const lessonLoad = useLoad(() => loadLesson(topicId).then((l) => l ?? null), [topicId]);
  const lesson = lessonLoad.data;
  const speaker = useSpeaker();
  const listen = () => {
    if (speaker.speaking) return speaker.stop();
    if (!lesson) return;
    // Konu anlatımının ana bölümleri sırayla sesli okunur (tarayıcının yerleşik sesiyle).
    speaker.speak([lesson.intro, lesson.logic, `Özet. ${lesson.summary.join('. ')}`].join('\n\n'), true, 6000);
  };
  const qLoad = useLoad(() => loadTopicQuestions(topicId), [topicId]);
  const topicQs = useMemo(() => qLoad.data ?? [], [qLoad.data]);
  const qCount = qLoad.data ? qLoad.data.length : null;
  const [quizRound, setQuizRound] = useState(0);
  const [pending, setPending] = useState<null | (() => void)>(null);

  const perf = useMemo(() => recentTopicPerformance(state.attempts, topicId, 5), [state.attempts, topicId]);
  const mastery = useMemo(() => topicMastery(state, topicId), [state, topicId]);
  const weak = useMemo(() => weakTopics(state).find((w) => w.topicId === topicId), [state, topicId]);
  const subtopicStats = useMemo(() => {
    if (!ref) return [];
    return ref.topic.subtopics.map((subtopic) => {
      const questions = topicQs.filter((q) => q.subtopic === subtopic.id);
      const ids = new Set(questions.map((q) => q.id));
      const attempts = state.attempts.filter((a) => ids.has(a.questionId) && a.answer != null);
      const correct = attempts.filter((a) => a.correct).length;
      return {
        subtopic,
        questionCount: questions.length,
        attempts: attempts.length,
        accuracy: attempts.length ? Math.round((correct / attempts.length) * 100) : null,
      };
    });
  }, [ref, topicQs, state.attempts]);
  const difficultyCounts = useMemo(
    () =>
      ['kolay', 'orta', 'zor', 'yeni-nesil'].map((difficulty) => ({
        difficulty,
        count: topicQs.filter((q) => q.difficulty === difficulty).length,
      })),
    [topicQs],
  );
  // Tur başına sabit 5 soru; önce hiç çözülmemiş sorular. (Cevap verdikçe yeniden karışmaz.)
  const quizSet = useMemo(() => {
    const ids = pickQuestions(topicQs, 5, getState().attempts);
    return ids.map((id) => topicQs.find((q) => q.id === id)!).filter(Boolean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicQs, quizRound]);

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
    if (s === 'tamamlandi') {
      const required = qCount === 0 ? 0 : Math.min(5, qCount ?? 5);
      const enoughEvidence = required === 0 || (mastery.attempts >= required && mastery.score >= 60);
      if (!enoughEvidence) {
        update((st) => setTopicStatus(st, topicId, 'calisiliyor'));
        toast(
          required > 0
            ? 'Konuyu tamamlamak için önce en az ' + required + ' soru çöz ve hakimiyetini %60 üzerine çıkar.'
            : 'Bu konuda doğrulama sorusu olmadığı için ilerlemeyi manuel takip edebilirsin.',
          5000,
        );
        return;
      }
    }
    update((st) => setTopicStatus(st, topicId, s));
    if (s === 'tamamlandi') toast('Öğrenme doğrulandı. İlk tekrar yarın için planlandı.');
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

      <div className="card topic-overview-card">
        <div className="row topic-badges">
          <SourceBadge type="meb-program" />
          <span className="badge">{ref.topic.grade}. sınıf</span>
          {weak && <span className="badge bad">Zayıf konu: {weak.reasons.join(', ')}</span>}
        </div>
        <div className="field mt-12">
          <span className="field-label" id="status-label">Konu durumu</span>
          <div className="segmented full" role="radiogroup" aria-labelledby="status-label">
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

      <div className="grid grid-4 section topic-stats">
        <Stat label="Hakimiyet" value={mastery.confidence ? `%${mastery.score}` : 'Yeni'} sub={mastery.reason} />
        <Stat label="Soru bankası" value={qCount ?? '…'} sub="özgün pratik soru" />
        <Stat label="Son testlerde" value={perf.accuracy != null ? `%${perf.accuracy}` : '—'} sub={perf.total ? `${perf.total} sorudan ${perf.correct} doğru` : 'Henüz çözülmedi'} />
        <Stat label="Açık yanlış" value={openWrongs} sub={openWrongs ? <a href="#/yanlislar">Yanlışlarıma git</a> : 'yok'} />
      </div>

      <div className="card section topic-actions-card">
        <div className="card-head">
          <div>
            <div className="eyebrow">Aktif öğrenme</div>
            <h2>Pratik yap</h2>
          </div>
          <SourceBadge type="ozgun-pratik" />
        </div>
        <div className="row">
          <a className="btn primary" href={`#/calis/${topicId}`}>
            <Icon name="play" /> Adım adım çalış
          </a>
          <button type="button" className="btn" onClick={() => start(5, 'konu-mini')} disabled={!qCount}>
            Mini test (5 soru)
          </button>
          <button type="button" className="btn" onClick={() => start(Math.min(20, Math.max(10, qCount ?? 10)), 'konu-normal')} disabled={!qCount}>
            Normal test ({Math.min(20, Math.max(10, qCount ?? 10))} soru)
          </button>
          <a className="btn ghost" href={href('/ogretmen', { konu: topicId, eylem: 'anlat' })}>
            <Icon name="teacher" /> <AskLabel />
          </a>
          <button type="button" className="btn ghost" onClick={writeToNotebook}>
            <Icon name="sparkle" /> Deftere yaz
          </button>
          {speaker.supported && lesson && (
            <button type="button" className="btn ghost" onClick={listen} aria-pressed={speaker.speaking}>
              <Icon name="headphones" /> {speaker.speaking ? 'Dinlemeyi durdur' : 'Konuyu dinle'}
            </button>
          )}
          <a className="btn ghost" href={href('/kartlar', { ders: ref.subject.id, konu: topicId })}>
            <Icon name="cards" /> Kartlarla çalış
          </a>
        </div>
        {qCount != null && qCount < 10 && qCount > 0 && <div className="tiny muted mt-8">Bu konuda {qCount} soru var; normal test mevcut soruların tamamını kullanır.</div>}
      </div>

      <section className="card section topic-roadmap-card" aria-labelledby="roadmap-h">
        <div className="card-head">
          <div>
            <div className="eyebrow">Konu haritası</div>
            <h2 id="roadmap-h">Alt konuları tek tek öğren</h2>
          </div>
          <span className="badge brand">{ref.topic.subtopics.length} alt konu</span>
        </div>
        <p className="small muted">Her alt konunun kazanımını gör, o bölüme ait soruları ayrı çöz ve eksik kaldığın yeri kolayca bul.</p>
        <div className="topic-roadmap-grid">
          {subtopicStats.map(({ subtopic, questionCount, attempts, accuracy }, index) => (
            <article className="topic-roadmap-item" key={subtopic.id}>
              <div className="topic-roadmap-index">{index + 1}</div>
              <div className="grow">
                <h3>{subtopic.name}</h3>
                <ul>
                  {subtopic.outcomes.map((o) => <li key={o.id}>{o.text}</li>)}
                </ul>
                <div className="topic-roadmap-meta">
                  <span>{questionCount} soru</span>
                  <span>{attempts ? attempts + ' çözüm' : 'Henüz çözülmedi'}</span>
                  {accuracy != null && <span className={accuracy >= 70 ? 'good' : 'needs-work'}>%{accuracy} doğruluk</span>}
                </div>
              </div>
              <a
                className="btn small"
                href={href('/testler', { konu: topicId, altkonu: subtopic.id })}
                aria-label={subtopic.name + ' sorularını çöz'}
              >
                Soru çöz
              </a>
            </article>
          ))}
        </div>
      </section>

      <div className="card section lesson-card">
        <div className="lesson-card-head">
          <div>
            <div className="eyebrow">Konu anlatımı</div>
            <h2>{ref.topic.name} · ders anlatımı</h2>
          </div>
          <span className="lesson-reading-hint">Oku · dinle · uygula</span>
        </div>
        {lesson && (
          <div className="lesson-glance" aria-label="Konu anlatımı içeriği">
            <span><b>{lesson.concepts.length}</b> kavram</span>
            <span><b>{lesson.formulas.length}</b> formül/bağıntı</span>
            <span><b>{lesson.examples.length}</b> çözümlü örnek</span>
            <span><b>{lesson.commonMistakes.length}</b> sık hata</span>
          </div>
        )}
        {lessonLoad.failed ? <LoadFailed what="Konu anlatımı" onRetry={lessonLoad.retry} /> : lesson === undefined ? <Spinner label="Konu anlatımı yükleniyor" /> : lesson === null ? <Empty title="Bu konunun anlatımı henüz eklenmedi." /> : <LessonView lesson={lesson} />}
      </div>

      <div className="card section topic-quiz-card" id="konu-sonu">
        <div className="card-head">
          <h2>Konu sonu soruları</h2>
          <SourceBadge type="ozgun-pratik" />
        </div>
        <p className="small muted">Anlatımı bitirdin mi? Şimdi bu konu için hazırlanmış {Math.min(5, topicQs.length)} özgün soruyla kendini dene. Cevabını seçer seçmez doğru/yanlış, çözüm yolu, ana fikir ve sık hata açıklaması açılır.</p>
        {topicQs.length > 0 && (
          <div className="question-bank-distribution" aria-label="Soru bankası zorluk dağılımı">
            {difficultyCounts.map(({ difficulty, count }) => (
              <a
                key={difficulty}
                className="question-bank-chip"
                href={href('/testler', { konu: topicId, zorluk: difficulty })}
              >
                <span>{LEVEL[difficulty] ?? (difficulty === 'yeni-nesil' ? 'Yeni nesil' : difficulty)}</span>
                <b>{count}</b>
              </a>
            ))}
          </div>
        )}
        {qLoad.failed ? (
          <LoadFailed what="Sorular" onRetry={qLoad.retry} />
        ) : qCount == null ? (
          <Spinner label="Sorular yükleniyor" />
        ) : topicQs.length === 0 ? (
          <Empty title="Bu konu için henüz soru yok." />
        ) : (
          <InlineQuiz
            key={quizRound}
            questions={quizSet}
            topicName={ref.topic.name}
            onMore={topicQs.length > 5 ? () => setQuizRound((r) => r + 1) : undefined}
          />
        )}
      </div>

      <div className="card section topic-resources-card">
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
          <div className="eyebrow">Öğrenmeyi doğrula</div>
          <p className="muted">
            Konuyu tamamlamak için kısa soru kanıtı kullanıyoruz. Şu anki hakimiyetin {mastery.confidence ? `%${mastery.score}` : 'henüz ölçülmedi'}.
          </p>
          <button type="button" className="btn primary" onClick={() => setStatus('tamamlandi')}>
            Öğrendim · doğrula
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
