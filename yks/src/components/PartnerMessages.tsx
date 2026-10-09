import { useEffect, useState } from 'react';
import { cachedPartnerMessages, cloudConfig, sendShareMessage, type ShareMessage } from '../services/cloud';
import { getState, useSelector } from '../store/store';
import { toast } from './ui';

/** Ortak ekrandan gelen moral mesajları (bulut eşitlemesi açıksa). */
export function PartnerMessages() {
  const shareCode = useSelector((s) => s.settings.cloud.shareCode);
  const myName = useSelector((s) => s.profile.name);
  const [messages, setMessages] = useState<ShareMessage[]>(cachedPartnerMessages);
  const [reply, setReply] = useState('');
  useEffect(() => {
    const on = () => setMessages(cachedPartnerMessages());
    window.addEventListener('iyiki:partner-messages', on);
    return () => window.removeEventListener('iyiki:partner-messages', on);
  }, []);
  if (!shareCode || messages.length === 0) return null;

  const send = async () => {
    const cfg = cloudConfig(getState());
    if (!cfg) return;
    try {
      setMessages(await sendShareMessage(cfg, shareCode, myName || 'Ben', reply));
      setReply('');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Gönderilemedi.');
    }
  };

  return (
    <section className="card section partner-card" aria-labelledby="pm-h">
      <h2 id="pm-h" className="mb-8">
        💌 Sana mesaj var
      </h2>
      <div className="chat" style={{ maxHeight: 260 }}>
        {messages.slice(-4).map((m, i) => (
          <div key={`${m.at}-${i}`} className={`bubble ${m.from === (myName || 'Ben') ? 'user' : 'teacher'}`}>
            <b className="tiny">{m.from}</b>
            {'\n'}
            {m.text}
          </div>
        ))}
      </div>
      <form
        className="chat-form"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <input className="input" value={reply} maxLength={300} onChange={(e) => setReply(e.target.value)} placeholder="Cevap yaz ♡" aria-label="Cevabın" />
        <button type="submit" className="btn primary" disabled={!reply.trim()}>
          Gönder
        </button>
      </form>
    </section>
  );
}
