import { useEffect, useMemo, useRef, useState } from 'react';
import { PageHeader } from '../components/Layout';
import { toast } from '../components/ui';

const SUPABASE_URL = 'https://wvtkcjutgcigxyenwkfs.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_mDx9F5vv4aUuRjrGbP1vkQ_LzdiYAJi';
const SUPABASE_ESM = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

type ChatMessage = {
  id: string;
  sender: string;
  text: string;
  at: number;
  mine: boolean;
};

type SignalPayload =
  | { from: string; description: RTCSessionDescriptionInit }
  | { from: string; candidate: RTCIceCandidateInit };

type SecurePacket = {
  v: 2;
  from: string;
  iv: string;
  data: string;
  at: number;
};

const cryptoEncoder = new TextEncoder();

function base64Url(bytes: ArrayBuffer | Uint8Array) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = '';
  for (const b of view) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlBytes(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function deriveRoomKey(room: string) {
  const material = await crypto.subtle.importKey(
    'raw',
    cryptoEncoder.encode(room),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: cryptoEncoder.encode('yks-live-e2ee-v2'),
      iterations: 120_000,
      hash: 'SHA-256',
    },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function encryptPacket(key: CryptoKey, event: string, from: string, payload: unknown): Promise<SecurePacket> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: cryptoEncoder.encode(event) },
    key,
    cryptoEncoder.encode(JSON.stringify(payload)),
  );
  return { v: 2, from, iv: base64Url(iv), data: base64Url(encrypted), at: Date.now() };
}

async function decryptPacket<T>(key: CryptoKey | null, event: string, packet: SecurePacket): Promise<T | null> {
  if (!key || !packet || packet.v !== 2 || typeof packet.data !== 'string' || typeof packet.iv !== 'string') return null;
  if (Math.abs(Date.now() - Number(packet.at || 0)) > 10 * 60 * 1000) return null;
  try {
    const clear = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: base64UrlBytes(packet.iv),
        additionalData: cryptoEncoder.encode(event),
      },
      key,
      base64UrlBytes(packet.data),
    );
    return JSON.parse(new TextDecoder().decode(clear)) as T;
  } catch {
    return null;
  }
}

function makeId(len = 12) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

function roomFromHash(): string {
  try {
    const hash = window.location.hash;
    const q = hash.indexOf('?');
    if (q < 0) return '';
    return (new URLSearchParams(hash.slice(q + 1)).get('room') ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 24);
  } catch {
    return '';
  }
}

export default function LiveTogetherPage() {
  const clientId = useMemo(() => makeId(16), []);
  const [roomCode, setRoomCode] = useState(() => roomFromHash() || makeId(24));
  const [joined, setJoined] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [connection, setConnection] = useState<'offline' | 'connecting' | 'connected' | 'reconnecting'>('offline');
  const [sharing, setSharing] = useState(false);
  const [remoteSharing, setRemoteSharing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [roomFull, setRoomFull] = useState(false);

  const channelRef = useRef<any>(null);
  const supabaseRef = useRef<any>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream>(new MediaStream());
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const makingOffer = useRef(false);
  const ignoreOffer = useRef(false);
  const polite = useRef(false);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  const reconnectTimer = useRef<number | null>(null);
  const helloTimer = useRef<number | null>(null);
  const cryptoKeyRef = useRef<CryptoKey | null>(null);

  const normalizedRoom = roomCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 24);
  const shareSupported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getDisplayMedia;

  const sendBroadcast = async (event: string, payload: unknown) => {
    const ch = channelRef.current;
    const key = cryptoKeyRef.current;
    if (!ch || !key) return;
    try {
      const encrypted = await encryptPacket(key, event, clientId, payload);
      await ch.send({ type: 'broadcast', event, payload: encrypted });
    } catch {
      setConnection('reconnecting');
    }
  };

  const cleanupPeer = () => {
    if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current);
    reconnectTimer.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    remoteStreamRef.current = new MediaStream();
    setRemoteSharing(false);
  };

  const ensurePeer = () => {
    if (pcRef.current && pcRef.current.signalingState !== 'closed') return pcRef.current;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
      ],
    });
    pcRef.current = pc;

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) void sendBroadcast('signal', { from: clientId, candidate: candidate.toJSON() });
    };

    pc.ontrack = ({ track, streams }) => {
      const stream = streams[0] ?? remoteStreamRef.current;
      if (!streams[0]) remoteStreamRef.current.addTrack(track);
      else remoteStreamRef.current = stream;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        void remoteVideoRef.current.play().catch(() => undefined);
      }
      setRemoteSharing(true);
      track.onended = () => setRemoteSharing(remoteStreamRef.current.getVideoTracks().some((t) => t.readyState === 'live'));
    };

    pc.onnegotiationneeded = async () => {
      try {
        makingOffer.current = true;
        await pc.setLocalDescription();
        if (pc.localDescription) {
          await sendBroadcast('signal', { from: clientId, description: pc.localDescription.toJSON() });
        }
      } catch {
        setConnection('reconnecting');
      } finally {
        makingOffer.current = false;
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setConnection('connected');
        return;
      }
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setConnection('reconnecting');
        if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current);
        reconnectTimer.current = window.setTimeout(() => {
          try {
            pc.restartIce();
            if (pc.signalingState === 'stable') void pc.setLocalDescription().then(() => {
              if (pc.localDescription) return sendBroadcast('signal', { from: clientId, description: pc.localDescription.toJSON() });
            });
          } catch {
            /* next presence sync retries naturally */
          }
        }, 1200);
      }
    };

    localStreamRef.current?.getTracks().forEach((track) => {
      pc.addTrack(track, localStreamRef.current!);
    });

    return pc;
  };

  const handleSignal = async (payload: SignalPayload) => {
    if (!payload || payload.from === clientId) return;
    polite.current = payload.from.startsWith('android-') || clientId.localeCompare(payload.from) > 0;
    const pc = ensurePeer();

    try {
      if ('description' in payload) {
        const description = payload.description;
        const offerCollision = description.type === 'offer' && (makingOffer.current || pc.signalingState !== 'stable');
        ignoreOffer.current = !polite.current && offerCollision;
        if (ignoreOffer.current) return;

        await pc.setRemoteDescription(description);

        while (pendingCandidates.current.length) {
          const candidate = pendingCandidates.current.shift();
          if (candidate) await pc.addIceCandidate(candidate);
        }

        if (description.type === 'offer') {
          await pc.setLocalDescription();
          if (pc.localDescription) {
            await sendBroadcast('signal', { from: clientId, description: pc.localDescription.toJSON() });
          }
        }
        return;
      }

      if ('candidate' in payload) {
        if (ignoreOffer.current) return;
        if (!pc.remoteDescription) pendingCandidates.current.push(payload.candidate);
        else await pc.addIceCandidate(payload.candidate);
      }
    } catch {
      setConnection('reconnecting');
    }
  };

  const leaveRoom = async () => {
    if (helloTimer.current) window.clearInterval(helloTimer.current);
    helloTimer.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setSharing(false);
    cleanupPeer();

    const channel = channelRef.current;
    channelRef.current = null;
    if (channel) {
      try { await channel.untrack(); } catch { /* noop */ }
      try { await supabaseRef.current?.removeChannel(channel); } catch { /* noop */ }
    }
    setJoined(false);
    setOnlineCount(0);
    setRoomFull(false);
    cryptoKeyRef.current = null;
    setConnection('offline');
  };

  const joinRoom = async () => {
    if (joined || normalizedRoom.length < 8) {
      if (normalizedRoom.length < 8) toast('Oda kodu en az 8 karakter olmalı.');
      return;
    }

    setConnection('connecting');
    try {
      cryptoKeyRef.current = await deriveRoomKey(normalizedRoom);
      const moduleUrl = SUPABASE_ESM;
      const supabaseModule: any = await import(/* @vite-ignore */ moduleUrl);
      const supabase = supabaseModule.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        realtime: { params: { eventsPerSecond: 20 } },
      });
      supabaseRef.current = supabase;

      const channel = supabase.channel('yks-live:' + normalizedRoom, {
        config: {
          broadcast: { ack: true, self: false },
          presence: { key: clientId },
        },
      });
      channelRef.current = channel;

      channel
        .on('broadcast', { event: 'signal' }, ({ payload }: any) => {
          if (!payload || payload.from === clientId) return;
          void decryptPacket<SignalPayload>(cryptoKeyRef.current, 'signal', payload as SecurePacket)
            .then((clear) => {
              if (clear) void handleSignal(clear);
            });
        })
        .on('broadcast', { event: 'hello' }, ({ payload }: any) => {
          if (!payload || payload.from === clientId) return;
          void decryptPacket<{ from: string; at: number }>(cryptoKeyRef.current, 'hello', payload as SecurePacket)
            .then((clear) => {
              if (!clear || clear.from === clientId) return;
              setOnlineCount((n) => Math.max(2, n));
              setConnection('connecting');
              ensurePeer();
              void sendBroadcast('hello', { from: clientId, at: Date.now() });
            });
        })
        .on('broadcast', { event: 'chat' }, ({ payload }: any) => {
          if (!payload || payload.from === clientId) return;
          void decryptPacket<{ id: string; from: string; text: string; at: number }>(cryptoKeyRef.current, 'chat', payload as SecurePacket)
            .then((clear) => {
              if (!clear || clear.from === clientId || typeof clear.text !== 'string') return;
              setMessages((m) => [...m.slice(-99), {
                id: clear.id ?? makeId(10),
                sender: 'Zeynep',
                text: clear.text.slice(0, 1000),
                at: clear.at ?? Date.now(),
                mine: false,
              }]);
            });
        })
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState() as Record<string, unknown[]>;
          const peers = Object.values(state).reduce((n, arr) => n + arr.length, 0);
          setOnlineCount(peers);
          setRoomFull(peers > 2);
          if (peers >= 2) {
            setConnection('connecting');
            ensurePeer();
          } else {
            setConnection('connecting');
            setRemoteSharing(false);
          }
        })
        .on('presence', { event: 'leave' }, () => {
          setRemoteSharing(false);
          cleanupPeer();
          setConnection('reconnecting');
        })
        .subscribe(async (status: string) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ id: clientId, onlineAt: new Date().toISOString() });
            await sendBroadcast('hello', { from: clientId, at: Date.now() });
            if (helloTimer.current) window.clearInterval(helloTimer.current);
            helloTimer.current = window.setInterval(() => {
              void sendBroadcast('hello', { from: clientId, at: Date.now() });
            }, 10_000);
            setJoined(true);
            setConnection('connecting');
            const url = new URL(window.location.href);
            url.hash = '#/canli?room=' + normalizedRoom;
            window.history.replaceState(null, '', url);
          }
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') setConnection('reconnecting');
          if (status === 'CLOSED') setConnection('offline');
        });
    } catch {
      setConnection('offline');
      toast('Canlı oda bağlantısı kurulamadı. İnternet bağlantısını kontrol et.');
    }
  };

  const startScreenShare = async () => {
    if (!joined) return toast('Önce canlı odaya bağlan.');
    if (!shareSupported) {
      return toast('Bu cihaz/tarayıcı sistem ekranı paylaşımını desteklemiyor. Android’de tam ekran paylaşımı için native uygulama gerekir.', 7000);
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 15, max: 24 } },
        audio: false,
      });
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        void localVideoRef.current.play().catch(() => undefined);
      }

      const pc = ensurePeer();
      const track = stream.getVideoTracks()[0];
      const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
      if (sender) await sender.replaceTrack(track);
      else pc.addTrack(track, stream);

      track.onended = () => {
        setSharing(false);
        localStreamRef.current = null;
        void sendBroadcast('screen-stopped', { from: clientId });
      };
      setSharing(true);
      await sendBroadcast('screen-started', { from: clientId });
    } catch {
      toast('Ekran paylaşımı başlatılmadı.');
    }
  };

  const stopScreenShare = async () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setSharing(false);
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    const pc = pcRef.current;
    const sender = pc?.getSenders().find((s) => s.track?.kind === 'video');
    if (sender) await sender.replaceTrack(null);
    await sendBroadcast('screen-stopped', { from: clientId });
  };

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || !joined) return;
    const msg = { id: makeId(10), from: clientId, text: text.slice(0, 1000), at: Date.now() };
    setMessages((m) => [...m.slice(-99), { ...msg, sender: 'Ben', mine: true }]);
    setDraft('');
    await sendBroadcast('chat', msg);
  };

  useEffect(() => {
    const ch = channelRef.current;
    if (!ch) return;
    ch.on('broadcast', { event: 'screen-started' }, ({ payload }: any) => {
      if (!payload || payload.from === clientId) return;
      void decryptPacket<{ from: string }>(cryptoKeyRef.current, 'screen-started', payload as SecurePacket)
        .then((clear) => {
          if (clear?.from !== clientId) setRemoteSharing(true);
        });
    });
    ch.on('broadcast', { event: 'screen-stopped' }, ({ payload }: any) => {
      if (!payload || payload.from === clientId) return;
      void decryptPacket<{ from: string }>(cryptoKeyRef.current, 'screen-stopped', payload as SecurePacket)
        .then((clear) => {
          if (clear?.from !== clientId) setRemoteSharing(false);
        });
    });
  }, [joined, clientId]);

  useEffect(() => () => {
    void leaveRoom();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inviteUrl = (() => {
    try {
      const u = new URL(window.location.href);
      u.hash = '#/canli?room=' + normalizedRoom;
      return u.toString();
    } catch {
      return '';
    }
  })();

  return (
    <>
      <PageHeader title="Cuma ♡ Zeynep Canlı" sub="İzinli ekran paylaşımı, çevrimiçi durum ve özel mesaj alanı" />

      <section className="card live-room-card">
        <div className="live-room-head">
          <div>
            <div className="eyebrow">İki kişilik özel oda</div>
            <h2 style={{ margin: '4px 0 2px' }}>Birbirinizi canlı görün</h2>
            <p className="small muted" style={{ margin: 0 }}>
              Ekran görüntüsü WebRTC ile cihazdan cihaza akar; sinyal ve mesajlar oda kodundan türetilen AES‑GCM anahtarıyla uçtan uca şifrelenir.
            </p>
          </div>
          <span className={'live-status ' + connection}>
            <i /> {connection === 'connected' ? 'Bağlı' : connection === 'reconnecting' ? 'Yeniden bağlanıyor' : connection === 'connecting' ? 'Bağlanıyor' : 'Kapalı'}
          </span>
        </div>

        <div className="live-join-row">
          <label className="grow">
            <span className="tiny muted">Oda kodu</span>
            <input
              className="input"
              value={roomCode}
              disabled={joined}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 24))}
              inputMode="text"
              autoCapitalize="characters"
            />
          </label>
          {!joined ? (
            <button className="btn primary" type="button" onClick={() => void joinRoom()}>Odaya bağlan</button>
          ) : (
            <button className="btn" type="button" onClick={() => void leaveRoom()}>Odadan çık</button>
          )}
        </div>

        {joined && (
          <div className="live-room-meta">
            <span>🔒 Uçtan uca şifreli · 👥 {Math.min(onlineCount, 2)}/2 çevrimiçi</span>
            <button
              className="btn tiny-btn"
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(inviteUrl);
                  toast('Davet bağlantısı kopyalandı.');
                } catch {
                  toast('Davet bağlantısı: ' + inviteUrl, 6000);
                }
              }}
            >
              Davet bağlantısını kopyala
            </button>
          </div>
        )}

        {roomFull && <div className="notice bad mt-12">Bu oda iki kişi için tasarlandı. Oda kodunu yalnız birbirinizle paylaşın.</div>}
      </section>

      <section className="live-grid section">
        <div className="card live-video-card">
          <div className="live-video-head">
            <div>
              <b>Zeynep'in ekranı</b>
              <span className="tiny muted">{remoteSharing ? 'Canlı yayın alınıyor' : onlineCount >= 2 ? 'Paylaşım bekleniyor' : 'Zeynep çevrimdışı'}</span>
            </div>
            {remoteSharing && <span className="live-pill">CANLI</span>}
          </div>
          <div className="live-video-frame remote">
            <video ref={remoteVideoRef} playsInline autoPlay muted />
            {!remoteSharing && <div className="live-empty"><span>📱</span><b>Ekran bekleniyor</b><small>Zeynep paylaşımı başlattığında burada görünecek.</small></div>}
          </div>
        </div>

        <div className="card live-video-card">
          <div className="live-video-head">
            <div>
              <b>Benim ekranım</b>
              <span className="tiny muted">{sharing ? 'Zeynep seni canlı görüyor' : 'Paylaşım kapalı'}</span>
            </div>
            {sharing && <span className="live-pill mine">PAYLAŞILIYOR</span>}
          </div>
          <div className="live-video-frame local">
            <video ref={localVideoRef} playsInline autoPlay muted />
            {!sharing && <div className="live-empty"><span>🖥️</span><b>Ekran paylaşımı kapalı</b><small>Başlatmadan önce cihazın izin ekranı gösterilir.</small></div>}
          </div>
          <div className="live-share-actions">
            {!sharing ? (
              <button className="btn primary" type="button" onClick={() => void startScreenShare()}>
                Ekranımı paylaş
              </button>
            ) : (
              <button className="btn danger" type="button" onClick={() => void stopScreenShare()}>
                Paylaşımı durdur
              </button>
            )}
            <span className="tiny muted">
              {!shareSupported ? 'Bu tarayıcı sistem ekranı paylaşımını desteklemiyor.' : 'Ekran kilitlenirse veya tarayıcı kapanırsa paylaşım durabilir.'}
            </span>
          </div>
        </div>
      </section>

      <section className="card section live-chat-card">
        <div className="live-chat-head">
          <div>
            <div className="eyebrow">Mesajlar</div>
            <h2 style={{ margin: '3px 0 0' }}>Cuma ♡ Zeynep</h2>
          </div>
          <span className="tiny muted">{onlineCount >= 2 ? 'İkiniz de çevrimiçi' : 'Diğer kişi bekleniyor'}</span>
        </div>

        <div className="live-messages" aria-live="polite">
          {messages.length === 0 ? (
            <div className="live-empty-chat">İlk mesajı gönder ♡</div>
          ) : messages.map((m) => (
            <div className={'live-message ' + (m.mine ? 'mine' : 'theirs')} key={m.id}>
              <span>{m.text}</span>
              <small>{new Date(m.at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</small>
            </div>
          ))}
        </div>

        <form
          className="live-chat-form"
          onSubmit={(e) => {
            e.preventDefault();
            void sendMessage();
          }}
        >
          <input
            className="input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={1000}
            placeholder={joined ? 'Mesaj yaz…' : 'Önce odaya bağlan'}
            disabled={!joined}
          />
          <button className="btn primary" type="submit" disabled={!joined || !draft.trim()}>Gönder</button>
        </form>
      </section>

      <section className="notice section">
        <b>Kesintisiz bağlantı hakkında:</b> Ağ değişimlerinde bağlantı otomatik yeniden kurulmaya çalışır. Ancak web tarayıcıları ekran kilitliyken, uygulama kapalıyken veya işletim sistemi paylaşımı durdurduğunda 7/24 ekran yayınına izin vermez. Tam Android sistem ekranı paylaşımı için native uygulama gerekir.
      </section>
    </>
  );
}
