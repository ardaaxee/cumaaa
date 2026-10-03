import { useEffect, useMemo, useRef, useState } from 'react';
import { allTopics, SUBJECTS, getTopicRef, subjectLabel } from '../data/curriculum';
import { loadLesson, loadQuestionsByIds } from '../data/content';
import type { LessonSeed, Question } from '../domain/types';
import { AssistantCharacter, type AssistantMood } from '../components/AssistantCharacter';
import { TeacherPhotoImage, useTeacherPhoto } from '../components/TeacherPhoto';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/Layout';
import { ConfirmDialog, toast } from '../components/ui';
import { navigate, useRoute } from '../hooks/useRoute';
import { askTeacher, checkAiStatus, type AiStatus, type TeacherAction, type TeacherContext } from '../services/ai';
import { assistantReply } from '../services/localAssistant';
import { useListener, useSpeaker } from '../hooks/useVoice';
import { resizeImage } from '../services/photoStore';
import { weakTopics } from '../utils/analysis';
import { addChatMessage, addTask, clearChat } from '../store/actions';
import { getState, update, useAppState } from '../store/store';
import { dayKey, formatMinutes } from '../utils/date';
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
  const [status, setStatus] = useState<AiStatus>({configured:false,model:null,reason:'Bağlantı kontrol ediliyor.'});
  const [checking,setChecking]=useState(true);
  const [contextLoading,setContextLoading]=useState(true);
  const [contextError,setContextError]=useState('');
  const [reloadContext,setReloadContext]=useState(0);
  const [requestError,setRequestError]=useState('');
  const [showAll,setShowAll]=useState(false);
  const [confirmClear,setConfirmClear]=useState(false);
  const [selectedSubject,setSelectedSubject]=useState('');
  const inFlight=useRef(false);
  const alive=useRef(true);
  const abortRef=useRef<AbortController|null>(null);
  const retryRef=useRef<{action:TeacherAction;message:string;image?:{mediaType:string;data:string}}|null>(null);
  useEffect(()=>{alive.current=true;return ()=>{alive.current=false;abortRef.current?.abort();};},[]);
  const teacherPhoto = useTeacherPhoto();
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
    let active=true;
    checkAiStatus().then(value=>{if(active)setStatus(value);}).catch(()=>{if(active)setStatus({configured:false,model:null,reason:'Bağlantı kurulamadı.'});}).finally(()=>{if(active)setChecking(false);});
    return ()=>{active=false;};
  }, []);
  useEffect(()=>{
    let active=true;setContextLoading(true);setContextError('');setQuestion(null);setLesson(null);
    (async()=>{
      try {
        const loadedQuestion=questionId?(await loadQuestionsByIds([questionId])).get(questionId)??null:null;
        if(questionId&&!loadedQuestion)throw new Error('Seçili soru bulunamadı.');
        const loadedLesson=(topicId||loadedQuestion?.topic)?await loadLesson(topicId||loadedQuestion!.topic):null;
        if((topicId||loadedQuestion?.topic)&&!loadedLesson)throw new Error('Konu anlatımı yüklenemedi.');
        if(active){setQuestion(loadedQuestion);setLesson(loadedLesson??null);}
      }catch(e){if(active)setContextError(e instanceof Error?e.message:'Çalışma içeriği yüklenemedi.');}
      finally{if(active)setContextLoading(false);}
    })();
    return ()=>{active=false;};
  },[topicId,questionId,reloadContext]);

  useEffect(() => {
    if (!question || answerIdx == null || Number(answerIdx) === question.correctAnswer) return;
    const today = dayKey();
    const topicName = getTopicRef(question.topic)?.topic.name ?? question.topic;
    const current = getState();
    if (current.tasks.some((task) => task.date === today && !task.done && task.type === 'yanlis' && task.topicId === question.topic)) return;
    update((state) => addTask(state, {
      date: today,
      type: 'yanlis',
      title: `Öğretmen · ${topicName} yanlışını tekrar et`,
      subjectId: question.subject,
      topicId: question.topic,
      estMinutes: 15,
    }));
    toast(`${topicName} bugünkü toparlanma planına eklendi.`, 3500);
  }, [question, answerIdx]);
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [state.chat.length]);

  const ref = getTopicRef(topicId ?? question?.topic ?? '');
  const subjectId=selectedSubject || ref?.subject.id || SUBJECTS[0].id;
  const availableTopics=allTopics().filter(t=>t.subject.id===subjectId);
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
    const personalGoal = [state.profile.targetUniversity, state.profile.targetDepartment].filter(Boolean).join(' / ');
    ctx.statsSummary = `Bugün ${d.todayQuestions} soru, ${formatMinutes(d.todayMinutes)} çalışma. Bu hafta ${d.weekQuestions} soru. Doğruluk: ${d.accuracy != null ? `%${d.accuracy}` : 'veri yok'}. Seri: ${d.streak} gün.${personalGoal ? ` Hedef: ${personalGoal}.` : ''}${state.profile.preferredStudyTime ? ` Tercih edilen çalışma başlangıcı: ${state.profile.preferredStudyTime}.` : ''} Adaptif çalışma özeti: ${studyBrief(state)}`;
    return ctx;
  }, [ref, topicId, question, answerIdx, state, lesson]);

  const send = async (action: TeacherAction, message: string, image?: { mediaType: string; data: string }, retry=false) => {
    const text = message.trim();
    if (inFlight.current || contextLoading || contextError || (action === 'serbest' && !text)) return;
    inFlight.current=true;
    setRequestError('');
    retryRef.current={action,message,image};
    setBusy(true);
    try {
    const userText = action === 'foto' ? `📷 Fotoğraflı soru${text ? `: ${text}` : ''}` : text || QUICK.find((q) => q.action === action)?.label || action;
    if (!retry) update((s) => addChatMessage(s, { role: 'user', text: userText }));
    setInput('');

    const say = (reply: string, source: 'icerik' | 'ai') => {
      if (!alive.current) return;
      update((s) => addChatMessage(s, { role: 'teacher', text: reply, source }));
      setLastSaid(reply);
      speaker.speak(reply, voiceOn);
    };

    if (!status?.configured && action === 'foto') {
      say(
        'Fotoğraftaki soruyu okuyabilmem için yapay zekâ bağlantısı gerekiyor. Ayarlar → “Yapay zekâ bağlantısı” bölümünden sunucu adresini girince fotoğraflı soruları adım adım çözerim. O zamana kadar soruyu yazarak sorabilirsin ♡',
        'icerik',
      );
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
      return;
    }

      const ctx = await context;
      const controller=new AbortController();abortRef.current=controller;
      const timer=window.setTimeout(()=>controller.abort(),90000);
      try {
      const history = state.chat.slice(-10).map((m) => ({ role: m.role, text: m.text }));
      const reply = await askTeacher({ action, message: text, context: ctx, history, teacherName, image },controller.signal);
      say(reply, 'ai');
      } finally {window.clearTimeout(timer);abortRef.current=null;}
    } catch (e) {
      if(alive.current)setRequestError(e instanceof Error ? e.message : 'Yanıt alınamadı.');
    } finally {
      inFlight.current=false;
      if(alive.current)setBusy(false);
    }
  };

  const autoFiredRef = useRef<string | null>(null);
  useEffect(() => {
    const key = `${initialAction ?? ''}|${topicId ?? ''}|${questionId ?? ''}`;
    if (!initialAction || initialAction === 'serbest' || contextLoading || contextError || autoFiredRef.current === key) return;
    const t = setTimeout(() => {autoFiredRef.current = key;void send(initialAction, '');}, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAction, topicId, questionId, contextLoading, contextError]);

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

      <section className="card teacher-topic-picker" aria-label="Öğretmen çalışma konusu">
        <div><h2>Bugün ne öğrenelim?</h2><p className="small muted">Bir konu seç; anlatımı, örnekleri ve ipuçlarını aynı konu üzerinden çalışalım.</p></div>
        <div className="teacher-topic-fields"><label>Ders<select aria-label="Öğretmen dersi" value={subjectId} disabled={busy} onChange={e=>setSelectedSubject(e.target.value)}>{SUBJECTS.map(s=><option key={s.id} value={s.id}>{subjectLabel(s)}</option>)}</select></label>
        <label>Konu<select aria-label="Öğretmen konusu" value={ref?.subject.id===subjectId?ref.topic.id:''} disabled={busy} onChange={e=>{if(e.target.value)navigate(`/ogretmen?konu=${encodeURIComponent(e.target.value)}`);}}><option value="">Konu seç</option>{availableTopics.map(t=><option key={t.topic.id} value={t.topic.id}>{t.topic.name}</option>)}</select></label></div>
        {contextLoading && <p role="status" className="small">Çalışma içeriği hazırlanıyor…</p>}
        {contextError && <div role="alert"><p>{contextError}</p><button className="btn" type="button" onClick={()=>setReloadContext(v=>v+1)}>İçeriği yeniden yükle</button></div>}
      </section>
      <section className="card asst-stage teacher-hero" aria-label="Asistan">
        <button
          type="button"
          className="asst-tap"
          onClick={() => speaker.speak(lastTeacher ?? greeting, voiceOn)}
          aria-label="Asistanın son söylediğini tekrar dinle"
        >
          {teacherPhoto ? <TeacherPhotoImage src={teacherPhoto} size={170} alt={`${teacherName} öğretmen`} /> : <AssistantCharacter mood={mood} size={170} />}
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
            {status && (
              <span
                className={`badge ${status.configured ? 'ok' : 'warn'}`}
                title={status.configured ? `Gerçek AI modeli: ${status.model ?? 'bağlı'}` : status.reason}
              >
                {status.configured ? 'AI öğretmen bağlı' : checking ? 'Konu rehberi · bağlantı kontrol ediliyor' : 'Yerel konu rehberi'}
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
          {(showAll?QUICK:QUICK.filter(q=>['anlat','basit','ornek','ipucu'].includes(q.action))).map((q) => (
            <button key={q.action} type="button" className="chip" disabled={busy || contextLoading || !!contextError} onClick={() => void send(q.action, '')}>
              {q.label}
            </button>
          ))}
          <button type="button" className="chip" aria-expanded={showAll} onClick={()=>setShowAll(v=>!v)}>{showAll?'Daha az seçenek':'Tüm çalışma seçenekleri'}</button>
        </div>

        <div className="chat mt-12 teacher-chat" ref={listRef} aria-live="polite">
          {state.chat.length === 0 ? (
            <div className="bubble teacher">{greeting}{'\n\n'}Örnek: “türev nedir”, “mol kavramı örnek çöz”, “bugün ne çalışayım”, “yanlışlarım”, “38 doğru 6 yanlış”.</div>
          ) : (
            state.chat.map((m) => (
              <div key={m.id} className={`bubble ${m.role}`}>
                <RichText text={m.text} />
                {m.role === 'teacher' && <div className="teacher-message-tools"><button type="button" className="chip" onClick={()=>speaker.speak(m.text,true)}>Dinle</button><button type="button" className="chip" onClick={()=>{if(!navigator.clipboard){toast('Kopyalama kullanılamıyor. Metni seçip kopyalayabilirsin.');return;}navigator.clipboard.writeText(m.text).then(()=>toast('Yanıt kopyalandı.')).catch(()=>toast('Kopyalama kullanılamıyor.'));}}>Kopyala</button></div>}
                {m.role === 'teacher' && (
                  <small className="teacher-source-label">
                    {m.source === 'ai' ? '✦ Gerçek AI yanıtı' : m.source === 'sistem' ? 'Sistem' : '📚 Uygulama içeriği'}
                  </small>
                )}
              </div>
            ))
          )}
          {busy && <div className="bubble teacher" role="status">Yanıt hazırlanıyor…</div>}
        </div>

        {requestError && <div className="notice teacher-request-error" role="alert"><b>Yanıt alınamadı</b><p>{requestError}</p><button type="button" className="btn" disabled={busy} onClick={()=>{const r=retryRef.current;if(r)void send(r.action,r.message,r.image,true);}}>Tekrar dene</button><a className="btn" href="#/dersler">Konu anlatımlarını aç</a></div>}
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
          <label className={`icon-btn photo-btn${busy ? ' disabled' : ''}`} aria-label="Soru fotoğrafı gönder" title={status.configured?'Soru fotoğrafı gönder':'Fotoğraflı soru için AI bağlantısı gerekiyor'} onClick={e=>{if(!status.configured){e.preventDefault();toast('Fotoğraflı sorular için AI bağlantısı gerekiyor. Şimdilik soruyu mesaj alanına yazabilirsin.');}}}>
            <Icon name="camera" />
            <input
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              disabled={busy || !status.configured || contextLoading || !!contextError}
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
          <textarea id="chat-input" rows={3} maxLength={6000} className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Sorunu, verilenleri ve takıldığın adımı yaz…" disabled={busy || contextLoading || !!contextError} />
          <button type="submit" className="btn primary" disabled={busy || contextLoading || !!contextError || !input.trim()} aria-label="Gönder">
            <Icon name="send" />
          </button>
        </form>
        {listener.error && <div className="tiny muted mt-8">{listener.error}</div>}
        {status && (
          <div className={`teacher-ai-disclosure ${status.configured ? 'connected' : 'local'}`}>
            <b>{status.configured ? 'Gerçek AI öğretmen aktif' : 'Yerel öğretmen modu'}</b>
            <span>
              {status.configured
                ? 'Metin ve soru fotoğrafları bağlı AI modeli tarafından işlenir. Cevapların altında kaynak etiketi görünür.'
                : 'Yanıtlar uygulamadaki konu anlatımları ve kendi çalışma verinden oluşturulur. Fotoğrafı okuyabilen AI şu an bağlı değil.'}
            </span>
          </div>
        )}
        {state.chat.length > 0 && (
          <button
            type="button"
            className="btn small ghost mt-8"
            disabled={busy}
            onClick={() => setConfirmClear(true)}
          >
            Sohbeti temizle
          </button>
        )}
      </div>
      {confirmClear && <ConfirmDialog title="Sohbet temizlensin mi?" message="Bu ekrandaki mesajlar silinir. Ders ilerlemen ve defterin korunur." confirmLabel="Sohbeti temizle" danger onCancel={()=>setConfirmClear(false)} onConfirm={()=>{update(clearChat);setLastSaid(null);speaker.stop();setConfirmClear(false);}}/>}
    </>
  );
}
