import { useEffect, useMemo, useRef, useState } from 'react';
import { getTopicRef, subjectLabel } from '../data/curriculum';
import { loadLesson, loadQuestions } from '../data/content';
import type { Question } from '../domain/types';
import { TeacherAvatar } from '../components/TeacherAvatar';
import { PageHeader } from '../components/Layout';
import { toast } from '../components/ui';
import { useRoute } from '../hooks/useRoute';
import { askTeacher, checkAiStatus, type AiStatus, type TeacherAction, type TeacherContext } from '../services/ai';
import { weakTopics } from '../utils/analysis';
import { addChatMessage, clearChat } from '../store/actions';
import { update, useAppState } from '../store/store';
import { formatMinutes } from '../utils/date';
import { optionLetter } from '../utils/ids';
import { dashboard } from '../utils/stats';

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
  const listRef = useRef<HTMLDivElement>(null);

  const topicId = route.query.get('konu') ?? undefined;
  const questionId = route.query.get('soru') ?? undefined;
  const answerIdx = route.query.get('cevap');
  const initialAction = (route.query.get('eylem') as TeacherAction | null) ?? undefined;

  useEffect(() => {
    checkAiStatus().then(setStatus);
  }, []);
  useEffect(() => {
    if (questionId) loadQuestions().then((qs) => setQuestion(qs.find((q) => q.id === questionId) ?? null));
    else setQuestion(null);
  }, [questionId]);
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
      const lesson = await loadLesson(topicId!);
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
    ctx.statsSummary = `Bugün ${d.todayQuestions} soru, ${formatMinutes(d.todayMinutes)} çalışma. Bu hafta ${d.weekQuestions} soru. Doğruluk: ${d.accuracy != null ? `%${d.accuracy}` : 'veri yok'}. Seri: ${d.streak} gün.`;
    return ctx;
  }, [ref, topicId, question, answerIdx, state]);

  const send = async (action: TeacherAction, message: string) => {
    if (!status?.configured) return toast(status?.reason || 'AI bağlantısı yapılandırılmadı.');
    const text = message.trim();
    if (action === 'serbest' && !text) return;
    setBusy(true);
    update((s) => addChatMessage(s, { role: 'user', text: text || QUICK.find((q) => q.action === action)?.label || action }));
    setInput('');
    try {
      const ctx = await context;
      const history = state.chat.slice(-10).map((m) => ({ role: m.role, text: m.text }));
      const reply = await askTeacher({ action, message: text, context: ctx, history, teacherName });
      update((s) => addChatMessage(s, { role: 'teacher', text: reply, source: 'ai' }));
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Yanıt alınamadı.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (initialAction && initialAction !== 'serbest' && status?.configured) void send(initialAction, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAction, topicId, questionId, status?.configured]);

  return (
    <>
      <PageHeader title="Öğretmenim" sub={ref ? `${subjectLabel(ref.subject)} · ${ref.topic.name}` : question ? 'Soru bağlamı seçili' : 'Kaynak tabanlı çalışma yardımcısı'} />

      <div className="card">
        <div className="teacher">
          <TeacherAvatar size={64} />
          <div>
            <h2 style={{ margin: 0 }}>{teacherName}</h2>
            <div className="muted small">Adım adım anlatım · ipucu · mini quiz</div>
            {status && !status.configured && (
              <div className="badge warn mt-8" style={{ display: 'inline-flex' }}>
                {status.reason || 'AI bağlantısı yapılandırılmadı.'}
              </div>
            )}
          </div>
        </div>
        {ref && (
          <div className="notice mt-12">
            Bağlam: <b>{ref.topic.name}</b> ({subjectLabel(ref.subject)}) <a href={`#/konu/${ref.topic.id}`}>konuya git</a>
          </div>
        )}
        {question && (
          <div className="notice mt-12">
            Bağlam: seçili soru. <a href={`#/konu/${question.topic}`}>konuya git</a>
          </div>
        )}
      </div>

      <div className="card section">
        <div className="chips" role="group" aria-label="Hızlı istekler">
          {QUICK.map((q) => (
            <button key={q.action} type="button" className="chip" disabled={busy || !status?.configured} onClick={() => void send(q.action, '')}>
              {q.label}
            </button>
          ))}
        </div>

        <div className="chat mt-12" ref={listRef} aria-live="polite">
          {state.chat.length === 0 ? (
            <div className="bubble teacher">Merhaba ♡ Bir ders veya konu yaz, ya da yukarıdaki butonlardan seç. Sana ezberletmeden, mantığıyla çalıştırayım.</div>
          ) : (
            state.chat.map((m) => (
              <div key={m.id} className={`bubble ${m.role}`}>
                {m.text}
              </div>
            ))
          )}
          {busy && <div className="bubble teacher">Yazıyor…</div>}
        </div>

        <form
          style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginTop: 8 }}
          onSubmit={(e) => {
            e.preventDefault();
            void send('serbest', input);
          }}
        >
          <label className="sr-only" htmlFor="chat-input">
            Mesajın
          </label>
          <input id="chat-input" className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Örn. Logaritmayı adım adım anlat" disabled={busy} />
          <button type="submit" className="btn primary" disabled={busy || !input.trim()}>
            Gönder
          </button>
        </form>
        {state.chat.length > 0 && (
          <button type="button" className="btn small ghost mt-8" onClick={() => update(clearChat)}>
            Sohbeti temizle
          </button>
        )}
      </div>
    </>
  );
}
