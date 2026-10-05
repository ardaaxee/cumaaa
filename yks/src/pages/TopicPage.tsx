import { LearningArea } from '../components/LearningArea';
import { LessonNavigator } from '../components/LessonNavigator';
import { useMemo, useState, type ReactNode } from 'react';
import { AskLabel } from '../components/AskName';
import { getTopicRef, subjectLabel, subjectTopics } from '../data/curriculum';
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
import { osymBookletPdfUrl } from '../data/officialResources';

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

interface LessonActions {
  toNotebook: () => void;
  askHref: string;
  solve: (count: number) => void;
  canSolve: boolean;
}

/** Mobilde metin duvarı olmasın: her bölüm açılır-kapanır; ilk iki bölüm açık gelir. */
function LessonSection({ id, emoji, title, open = false, children }: { id: string; emoji: string; title: string; open?: boolean; children: ReactNode }) {
  return (
    <details className="lesson-acc" id={`sec-${id}`} open={open}>
      <summary>
        <span className="lesson-acc-emoji" aria-hidden="true">
          {emoji}
        </span>
        <span className="grow">{title}</span>
        <Icon name="right" size={16} />
      </summary>
      <div className="lesson-acc-body">{children}</div>
    </details>
  );
}

function LessonView({ lesson, actions }: { lesson: LessonSeed; actions: LessonActions }) {
  return (
    <article className="lesson">
      <LessonNavigator key={lesson.topicId} lesson={lesson} />
      <div className="lesson-quick" role="group" aria-label="Hızlı aksiyonlar">
        <button type="button" className="btn small" onClick={actions.toNotebook}>
          📓 Deftere aktar
        </button>
        <a className="btn small" href={actions.askHref}>
          🧠 <AskLabel />
        </a>
        <button type="button" className="btn small primary" onClick={() => actions.solve(5)} disabled={!actions.canSolve}>
          5 soru çöz
        </button>
        <button type="button" className="btn small" onClick={() => actions.solve(20)} disabled={!actions.canSolve}>
          20 soru çöz
        </button>
      </div>

      <LessonSection id="giris" emoji="🌱" title="Konuya giriş" open>
        <Paragraphs text={lesson.intro} />
        {lesson.prerequisites.length > 0 && (
          <>
            <h3>Bilmen gereken ön bilgiler</h3>
            <ul>
              {lesson.prerequisites.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </>
        )}
      </LessonSection>

      <LessonSection id="mantik" emoji="🧠" title="Mantığını anla" open>
        <Paragraphs text={lesson.logic} />
        <div className="callout">
          <b>Sınavda nasıl sorulur?</b>
          <Paragraphs text={lesson.osymThinking} />
        </div>
      </LessonSection>

      <LessonSection id="kavramlar" emoji="📌" title={`Temel kavramlar (${lesson.concepts.length})`}>
        <dl className="concept">
          {lesson.concepts.map((c, i) => (
            <div key={i}>
              <dt>{c.term}</dt>
              <dd>{c.definition}</dd>
            </div>
          ))}
        </dl>
      </LessonSection>

      {lesson.formulas.length > 0 && (
        <LessonSection id="formuller" emoji="📐" title={`Formüller (${lesson.formulas.length})`}>
          {lesson.formulas.map((f, i) => (
            <div key={i} className="formula">
              <code>{f.expr}</code>
              <div className="meaning">{f.meaning}</div>
            </div>
          ))}
        </LessonSection>
      )}

      <LessonSection id="ornekler" emoji="✏️" title={`Çözümlü örnek (${lesson.examples.length})`}>
        {lesson.examples.map((ex, i) => (
          <div key={i} className="example">
            <div className="row between">
              <b>Örnek {i + 1}</b>
              <span className="badge outline">{LEVEL[ex.level] ?? ex.level}</span>
            </div>
            <p className="pre-line mt-8">{ex.problem}</p>
            <details>
              <summary className="btn small">Önce dene, sonra çözümü aç</summary>
              <ol>
                {ex.steps.map((st, j) => (
                  <li key={j} className="pre-line">
                    {st}
                  </li>
                ))}
              </ol>
              <div className="answer">Cevap: {ex.answer}</div>
            </details>
          </div>
        ))}
      </LessonSection>

      <LessonSection id="hatalar" emoji="⚠️" title="Sık hata">
        <div className="callout bad">
          <ul>
            {lesson.commonMistakes.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      </LessonSection>

      <LessonSection id="puf" emoji="✨" title="Püf noktası">
        <div className="callout ok">
          <ul>
            {lesson.tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      </LessonSection>

      <LessonSection id="ozet" emoji="📝" title="1 dakikalık özet">
        <ul>
          {lesson.summary.map((sm, i) => (
            <li key={i}>{sm}</li>
          ))}
        </ul>
      </LessonSection>

      <a
        className="lesson-acc lesson-acc-link"
        href="#konu-sonu"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('konu-sonu')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
      >
        <span className="lesson-acc-emoji" aria-hidden="true">
          🎯
        </span>
        <span className="grow">Konu sonu testi</span>
        <Icon name="right" size={16} />
      </a>
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

  const siblings = subjectTopics(ref.subject.id);
  const topicIndex = siblings.findIndex((t) => t.id === topicId);
  const previousTopic = siblings[topicIndex - 1];
  const nextTopic = siblings[topicIndex + 1];
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

      {lesson && <LearningArea key={topicId} lesson={lesson} topic={ref.topic} questions={topicQs} />}

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
        {lessonLoad.failed ? <LoadFailed what="Konu anlatımı" kind={lessonLoad.errorKind} onRetry={lessonLoad.retry} /> : lesson === undefined ? <Spinner label="Konu anlatımı yükleniyor" /> : lesson === null ? <Empty title="Bu konunun anlatımı henüz eklenmedi." /> : <LessonView
              lesson={lesson}
              actions={{ toNotebook: writeToNotebook, askHref: href('/ogretmen', { konu: topicId, eylem: 'anlat' }), solve: (n) => start(Math.min(n, qCount ?? n), n <= 5 ? 'konu-mini' : 'konu-normal'), canSolve: !!qCount }}
            />}
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
          <LoadFailed what="Sorular" kind={qLoad.errorKind} onRetry={qLoad.retry} />
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

      <section className="card section topic-osym-archive" aria-labelledby="topic-osym-h">
        <div className="card-head">
          <div>
            <div className="eyebrow">Çıkmış soru kontrolü</div>
            <h2 id="topic-osym-h">Resmî YKS kitapçıklarında bu konuyu ara</h2>
          </div>
          <SourceBadge type="osym-resmi" />
        </div>
        <p className="small muted">
          Konu anlatımındaki sınav mantığını okuduktan sonra resmî kitapçıkta benzer kazanımı bulup çöz. Sorular uygulamaya kopyalanmaz.
        </p>
        <div className="topic-osym-years">
          {[2026, 2025, 2024].map((year) => (
            <a key={year} className="btn small" href={osymBookletPdfUrl(year, ref.subject.exam)}>
              {year} {ref.subject.exam} PDF
            </a>
          ))}
          <a className="btn small ghost" href="#/cikmis">Tüm yıllar</a>
        </div>
      </section>

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

      <nav className="card section topic-navigation" aria-label="Konular arasında gezin">
        {previousTopic && <a className="btn" href={`#/konu/${previousTopic.id}`}>← {previousTopic.name}</a>}
        <a className="btn ghost" href={`#/ders/${ref.subject.id}`}>Tüm konular</a>
        {nextTopic && <a className="btn" href={`#/konu/${nextTopic.id}`}>{nextTopic.name} →</a>}
      </nav>
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
