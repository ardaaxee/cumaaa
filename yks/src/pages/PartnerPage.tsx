import { useEffect, useState } from 'react';
import { Empty, Spinner, Stat, toast } from '../components/ui';
import { PandaBody } from '../components/MascotNav';
import { useRoute } from '../hooks/useRoute';
import { readShare, sendShareMessage, type CloudConfig, type ShareMessage, type ShareSummary } from '../services/cloud';
import { formatMinutes } from '../utils/date';
import { formatNet } from '../utils/net';

const NAME_KEY = 'iyikiYks.ortakAd';

function timeAgo(iso: string): string {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (min < 1) return 'az önce';
  if (min < 60) return `${min} dk önce`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} saat önce`;
  return `${Math.round(h / 24)} gün önce`;
}

/**
 * Ortak ekran: öğrencinin paylaştığı özet (yalnız sayılar) + moral mesajları.
 * Bağlantıdaki k (paylaşım kodu), p (Firebase proje kimliği), a (Firebase web API anahtarı) ile çalışır.
 */
export default function PartnerPage() {
  const route = useRoute();
  const code = route.query.get('k') ?? '';
  const cfg: CloudConfig | null = route.query.get('p') && route.query.get('a') ? { projectId: route.query.get('p')!, apiKey: route.query.get('a')! } : null;
  const [data, setData] = useState<{ summary: ShareSummary | null; messages: ShareMessage[] } | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem(NAME_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const load = () => {
    if (!cfg || code.length < 20) return setData(null);
    readShare(cfg, code)
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Yüklenemedi.'));
  };

  useEffect(() => {
    load();
    const iv = window.setInterval(load, 60_000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const send = async (msg: string) => {
    if (!cfg) return;
    setSending(true);
    try {
      try {
        localStorage.setItem(NAME_KEY, name);
      } catch {
        /* yok say */
      }
      const messages = await sendShareMessage(cfg, code, name || '♡', msg);
      setData((d) => (d ? { ...d, messages } : d));
      setText('');
      toast('Mesajın gönderildi ♡');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Gönderilemedi.');
    } finally {
      setSending(false);
    }
  };

  if (!cfg || code.length < 20) {
    return <Empty title="Bu bağlantı eksik.">Paylaşım bağlantısının tamamını açtığından emin ol.</Empty>;
  }
  if (error) return <Empty title="Şu an açılamadı." action={<button type="button" className="btn" onClick={load}>Tekrar dene</button>}>{error}</Empty>;
  if (data === undefined) return <Spinner />;
  if (data === null || !data.summary) {
    return <Empty title="Henüz paylaşılan bir özet yok.">Uygulamada bulut eşitlemesi açıldıktan sonra burada görünür.</Empty>;
  }

  const s = data.summary;
  const quick = ['Seninle gurur duyuyorum ♡', 'Hadi bir test daha! 💪', 'Mola vermeyi unutma ☕', 'Bugün çok iyiydin 🌟'];

  return (
    <>
      <header className="topbar">
        <div className="topbar-title">
          <h1>{s.name}’nin çalışma odası</h1>
          <div className="topbar-sub">Son güncelleme: {timeAgo(s.updatedAt)}</div>
        </div>
      </header>

      <section className="card hero hero-panda">
        <div className="hero-text">
          <div className="eyebrow">Ortak ekran ♡</div>
          <h2>{s.streak > 0 ? `${s.streak} gündür aralıksız çalışıyor!` : 'Bugün başlaması için bir mesaj bırak ♡'}</h2>
          <p className="muted" style={{ margin: 0 }}>
            {s.daysLeft != null && s.daysLeft >= 0 ? `Sınava ${s.daysLeft} gün kaldı.` : 'Burada yalnızca çalışma sayıları görünür; notları ve cevapları görünmez.'}
          </p>
        </div>
        <div className="hero-mascot-wrap" aria-hidden="true">
          <div className="hero-mascot">
            <PandaBody size={96} waving />
          </div>
        </div>
      </section>

      <section className="grid grid-4 section" aria-label="Çalışma özeti">
        <Stat tint="lilac" label="Bugün çözülen" value={s.todayQuestions} />
        <Stat tint="mint" label="Bu hafta" value={`${s.weekQuestions} soru`} sub={formatMinutes(s.weekMinutes)} />
        <Stat tint="peach" label="Doğruluk" value={s.accuracy != null ? `%${s.accuracy}` : '—'} />
        <Stat tint="sky" label="Son deneme" value={s.lastMockNet != null ? `${formatNet(s.lastMockNet)} net` : '—'} sub={s.lastMockExam ?? ''} />
        <Stat tint="rose" label="Tamamlanan konu" value={s.completedTopics} />
        <Stat tint="lilac" label="Öğrenilen kart" value={s.cardsLearned} />
        <Stat tint="mint" label="Toplam soru" value={s.totalQuestions} />
        <Stat tint="peach" label="Rozet" value={s.badges} sub={s.badgeIcons.join(' ')} />
      </section>

      <section className="card section" aria-labelledby="msg-h">
        <h2 id="msg-h" className="mb-8">
          Moral mesajları
        </h2>
        <div className="chat" aria-live="polite">
          {data.messages.length === 0 ? (
            <div className="small muted">İlk mesajı sen bırak ♡</div>
          ) : (
            data.messages.map((m, i) => (
              <div key={`${m.at}-${i}`} className={`bubble ${m.from === name ? 'user' : 'teacher'}`}>
                <b className="tiny">{m.from}</b>
                {'\n'}
                {m.text}
                <div className="bubble-meta">{timeAgo(m.at)}</div>
              </div>
            ))
          )}
        </div>
        <div className="chips mt-12">
          {quick.map((q) => (
            <button key={q} type="button" className="chip" disabled={sending} onClick={() => void send(q)}>
              {q}
            </button>
          ))}
        </div>
        <form
          className="form-grid mt-12"
          onSubmit={(e) => {
            e.preventDefault();
            void send(text);
          }}
        >
          <label className="field">
            <span>Adın</span>
            <input className="input" value={name} maxLength={30} onChange={(e) => setName(e.target.value)} placeholder="Örn. Cuma" />
          </label>
          <label className="field">
            <span>Mesajın</span>
            <textarea className="input" rows={2} maxLength={300} value={text} onChange={(e) => setText(e.target.value)} placeholder="Ona bir şey yaz ♡" />
          </label>
          <button type="submit" className="btn primary" disabled={sending || !text.trim()}>
            Gönder
          </button>
        </form>
      </section>
    </>
  );
}
