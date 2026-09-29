import { useEffect, useMemo, useRef, useState } from 'react';
import { getTopicRef, subjectLabel } from '../data/curriculum';
import { loadLesson, loadQuestionsByIds } from '../data/content';
import type { LessonSeed, Question } from '../domain/types';
import { AssistantCharacter, type AssistantMood } from '../components/AssistantCharacter';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/Layout';
import { toast } from '../components/ui';
import { useRoute } from '../hooks/useRoute';
import { askTeacher, checkAiStatus, type AiStatus, type TeacherAction, type TeacherContext } from '../services/ai';
import { assistantReply } from '../services/localAssistant';
import { useListener, useSpeaker } from '../hooks/useVoice';
import { resizeImage } from '../services/photoStore';
import { weakTopics } from '../utils/analysis';
import { addChatMessage, clearChat } from '../store/actions';
import { update, useAppState } from '../store/store';
import { formatMinutes } from '../utils/date';
import { optionLetter } from '../utils/ids';
import { dashboard } from '../utils/stats';
import { studyBrief } from '../services/adaptiveStudy';

const VOICE_KEY = 'iyikiYks.asistanSes';

function readVoicePref(): boolean {
  try {
    return localStorage.getItem(VOICE_KEY) !== '0';
  } catch {
    return true;
  }
}

/** **kalın** yazımı gerçek kalın metne çevirir (başka HTML üretmez). */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) => (p.startsWith('**') && p.endsWith('**') ? <b key={i}>{p.slice(2, -2)}</b> : <span key={i}>{p}</span>))}
    </>
  );
}

const QUICK: { action: TeacherAction; label: string }[] = [
  { action: 'anlat', label: 'Sıfırdan anlat' },
  { action: 'basit', label: 'Daha basit anlat' },
  { action: 'detayli', label: 'Daha detaylı anlat' },
  { action: 'ornek', label: 'Örnek çöz' },
  { action: 'ipucu', label: 'İpucu ver' },
  { action: 'benzer', label: 'Benzer soru oluştur' },
  { action: 'quiz', label: '5 soruluk mini quiz' },
  { action: 'yanlislar', label: 'Yanlışlarımdan ders çıkar' },
  { action: 'bugun', label: 'Bugün ne çalışmalıyım?' },
];

export default function TeacherPage() {
  const route = useRoute();
  const state = useAppState();
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [question, setQuestion] = useState<Question | null>(null);
  const [lesson, setLesson] = useState<LessonSeed | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [voiceOn, setVoiceOn] = useState(readVoicePref);
  const [lastSaid, setLastSaid] = useState<string | null>(null);
  const speaker = useSpeaker();
  const listener = useListener((t) => void send('serbest', t));

  const topicId = route.query.get('konu') ?? undefined;
  const questionId = route.query.get('soru') ?? undefined;
  const answerIdx = route.query.get('cevap');
  const initialAction = (route.query.get('eylem') as TeacherAction | null) ?? undefined;

  useEffect(() => {
    checkAiStatus().then(setStatus);
  }, []);
  useEffect(() => {
    if (questionId) loadQuestionsByIds([questionId]).then((m) => setQuestion(m.get(questionId) ?? null)).catch(() => setQuestion(null));
    else setQuestion(null);
  }, [questionId]);
  useEffect(() => {
    if (topicId) loadLesson(topicId).then((l) => setLesson(l ?? null)).catch(() => setLesson(null));
    else setLesson(null);
  }, [topicId]);
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [state.chat.length]);

  const ref = topicId ? getTopicRef(topicId) : undefined;
  const teacherName = state.settings.teacherName;

  const context = useMemo(async (): Promise<TeacherContext> => {
    const ctx: TeacherContext = { studentName: state.profile.name || undefined };
    if (ref) {
      ctx.subject = subjectLabel(ref.subject);
      ctx.topic = ref.topic.name;
      if (lesson) ctx.lessonSummary = lesson.summary.join(' ');
    }
    if (question) {
      ctx.question = question.question;
      ctx.correctAnswer = `${optionLetter(question.correctAnswer)}) ${question.options[question.correctAnswer]}`;
      ctx.solution = question.solution;
      if (answerIdx != null) ctx.studentAnswer = `${optionLetter(Number(answerIdx))}) ${question.options[Number(answerIdx)] ?? ''}`;
    }
    const weak = weakTopics(state);
    if (weak.length) ctx.wrongsSummary = weak.slice(0, 5).map((w) => `${getTopicRef(w.topicId)?.topic.name ?? w.topicId}: ${w.reasons.join(', ')}`).join(' | ');
    const d = dashboard(state);
    ctx.statsSummary = `Bugün ${d.todayQuestions} soru, ${formatMinutes(d.todayMinutes)} çalışma. Bu hafta ${d.weekQuestions} soru. Doğruluk: ${d.accuracy != null ? `%${d.accuracy}` : 'veri yok'}. Seri: ${d.streak} gün. Adaptif çalışma özeti: ${studyBrief(state)}`;
    return ctx;
  }, [ref, topicId, question, answerIdx, state, lesson]);

  const send = async (action: TeacherAction, message: string, image?: { mediaType: string; data: string }) => {
    const text = message.trim();
    if (action === 'serbest' && !text) return;
    setBusy(true);
    const userText = action === 'foto' ? `📷 Fotoğraflı soru${text ? `: ${text}` : ''}` : text || QUICK.find((q) => q.action === action)?.label || action;
    update((s) => addChatMessage(s, { role: 'user', text: userText }));
    setInput('');

    const say = (reply: string, source: 'icerik' | 'ai') => {
      update((s) => addChatMessage(s, { role: 'teacher', text: reply, source }));
      setLastSaid(reply);
      speaker.speak(reply, voiceOn);
    };

    if (!status?.configured && action === 'foto') {
      say(
        'Fotoğraftaki soruyu okuyabilmem için yapay zekâ bağlantısı gerekiyor. Ayarlar → “Yapay zekâ bağlantısı” bölümünden sunucu adresini girince fotoğraflı soruları adım adım çözerim. O zamana kadar soruyu yazarak sorabilirsin ♡',
        'icerik',
      );
      setBusy(false);
      return;
    }

    if (!status?.configured) {
      // Gerçek AI bağlantısı yok: yanıt, uygulamadaki gerçek içerik ve öğrencinin
      // kendi verisinden derlenir (yerel asistan). Kısa bir "düşünme" anı gösterilir.
      const reply = await assistantReply({
        action,
        message: text,
        state,
        topic: ref,
        lesson,
        question,
        studentAnswer: answerIdx != null ? Number(answerIdx) : null,
      });
      await new Promise((r) => setTimeout(r, 450));
      say(reply, 'icerik');
      setBusy(false);
      return;
    }

    try {
      const ctx = await context;
      const history = state.chat.slice(-10).map((m) => ({ role: m.role, text: m.text }));
      const reply = await askTeacher({ action, message: text, context: ctx, history, teacherName, image });
      say(reply, 'ai');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Yanıt alınamadı.');
    } finally {
      setBusy(false);
    }
  };

  const autoFiredRef = useRef<string | null>(null);
  useEffect(() => {
    const key = `${initialAction ?? ''}|${topicId ?? ''}|${questionId ?? ''}`;
    if (!initialAction || initialAction === 'serbest' || !status || autoFiredRef.current === key) return;
    autoFiredRef.current = key;
    // Konu anlatımının yüklenmesi için kısa bir gecikme (yerel rehber yanıtı tam olsun).
    const t = setTimeout(() => void send(initialAction, ''), topicId ? 250 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAction, topicId, questionId, status]);

  const mood: AssistantMood = listener.listening ? 'listening' : busy ? 'thinking' : speaker.speaking ? 'talking' : state.chat.length === 0 ? 'happy' : 'idle';
  const lastTeacher = lastSaid ?? [...state.chat].reverse().find((m) => m.role === 'teacher')?.text;
  const greeting = `Selam ${state.profile.name || 'canım'} ♡ Ben ${teacherName}. Bugün de seninle çalışmaya geldim; bir konu yaz ya da bana sesle sor.`;
  const toggleVoice = () => {
    const next = !voiceOn;
    setVoiceOn(next);
    if (!next) speaker.stop();
    try {
      localStorage.setItem(VOICE_KEY, next ? '1' : '0');
    } catch {
      /* tercih kaydedilemese de çalışır */
    }
  };

  return (
    <>
      <PageHeader title={`${teacherName} ♡`} sub={ref ? `${subjectLabel(ref.subject)} · ${ref.topic.name}` : question ? 'Soru bağlamı seçili' : 'Sevgilin ve çalışma arkadaşın'} />

      <section className="card asst-stage teacher-hero" aria-label="Asistan">
        <button
          type="button"
          className="asst-tap"
          onClick={() => speaker.speak(lastTeacher ?? greeting, voiceOn)}
          aria-label="Asistanın son söylediğini tekrar dinle"
        >
          <AssistantCharacter mood={mood} size={170} />
        </button>
        <div className="asst-say" aria-live="polite">
          <div className="asst-name">{teacherName}</div>
          {busy ? 'Hmm, bir düşüneyim…' : <RichText text={(lastTeacher ?? greeting).slice(0, 420) + ((lastTeacher ?? '').length > 420 ? '…' : '')} />}
          <div className="asst-controls">
            <button type="button" className={`chip${voiceOn ? ' on' : ''}`} aria-pressed={voiceOn} onClick={toggleVoice}>
              {voiceOn ? '🔊 Sesli' : '🔈 Sessiz'}
            </button>
            {speaker.speaking && (
              <button type="button" className="chip" onClick={speaker.stop}>
                ⏹ Sustur
              </button>
            )}
            {status && !status.configured && (
              <span className="badge warn" title={status.reason}>
                Yerel konu rehberi
              </span>
            )}
          </div>
        </div>
      </section>

      {(ref || question) && (
        <div className="notice section teacher-context">
          {ref ? (
            <>
              Bağlam: <b>{ref.topic.name}</b> ({subjectLabel(ref.subject)}) <a href={`#/konu/${ref.topic.id}`}>konuya git</a>
            </>
          ) : (
            question && (
              <>
                Bağlam: seçili soru. <a href={`#/konu/${question.topic}`}>konuya git</a>
              </>
            )
          )}
        </div>
      )}

      <div className="card section teacher-chat-card">
        <div className="teacher-chat-head">
          <div>
            <div className="eyebrow">Birlikte çalışalım</div>
            <h2>Ne öğrenmek istiyorsun?</h2>
          </div>
          <span className="badge brand">Kişisel çalışma asistanı</span>
        </div>
        <div className="chips teacher-quick" role="group" aria-label="Hızlı istekler">
          {QUICK.map((q) => (
            <button key={q.action} type="button" className="chip" disabled={busy || !status} onClick={() => void send(q.action, '')}>
              {q.label}
            </button>
          ))}
        </div>

        <div className="chat mt-12 teacher-chat" ref={listRef} aria-live="polite">
          {state.chat.length === 0 ? (
            <div className="bubble teacher">{greeting}{'\n\n'}Örnek: “türev nedir”, “mol kavramı örnek çöz”, “bugün ne çalışayım”, “yanlışlarım”, “38 doğru 6 yanlış”.</div>
          ) : (
            state.chat.map((m) => (
              <div key={m.id} className={`bubble ${m.role}`}>
                <RichText text={m.text} />
              </div>
            ))
          )}
          {busy && <div className="bubble teacher">Düşünüyor…</div>}
        </div>

        <form
          className="chat-form teacher-composer"
          onSubmit={(e) => {
            e.preventDefault();
            void send('serbest', input);
          }}
        >
          <label className="sr-only" htmlFor="chat-input">
            Mesajın
          </label>
          {listener.supported && (
            <button
              type="button"
              className={`icon-btn mic-btn${listener.listening ? ' on' : ''}`}
              aria-label={listener.listening ? 'Dinlemeyi durdur' : 'Sesle sor'}
              aria-pressed={listener.listening}
              onClick={() => (listener.listening ? listener.stop() : listener.start())}
              disabled={busy}
            >
              <Icon name="mic" />
            </button>
          )}
          <label className={`icon-btn photo-btn${busy ? ' disabled' : ''}`} aria-label="Soru fotoğrafı gönder" title="Soru fotoğrafı gönder">
            <Icon name="camera" />
            <input
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (!f) return;
                resizeImage(f, 1568)
                  .then((url) => {
                    const [head, data] = url.split(',');
                    void send('foto', input, { mediaType: head.slice(5, head.indexOf(';')), data });
                  })
                  .catch((err: unknown) => toast(err instanceof Error ? err.message : 'Fotoğraf okunamadı.'));
              }}
            />
          </label>
          <input id="chat-input" className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Örn. Logaritmayı basitçe anlat" disabled={busy} />
          <button type="submit" className="btn primary" disabled={busy || !input.trim()} aria-label="Gönder">
            <Icon name="send" />
          </button>
        </form>
        {listener.error && <div className="tiny muted mt-8">{listener.error}</div>}
        {state.chat.length > 0 && (
          <button
            type="button"
            className="btn small ghost mt-8"
            onClick={() => {
              update(clearChat);
              setLastSaid(null);
              speaker.stop();
            }}
          >
            Sohbeti temizle
          </button>
        )}
      </div>
    </>
  );
}
