import { useEffect, useMemo, useRef, useState } from 'react';
import { PageHeader } from '../components/Layout';
import { toast } from '../components/ui';
import { useSelector } from '../store/store';

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

type SharedTask = {
  id: string;
  text: string;
  done: boolean;
};

type SharedStudyState = {
  running: boolean;
  endsAt: number | null;
  remainingMs: number;
  durationMin: number;
  tasks: SharedTask[];
  updatedAt: number;
  updatedBy: string;
};

type LiveReaction = {
  emoji: string;
  sender: string;
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

async function roomTopic(room: string) {
  const digest = await crypto.subtle.digest('SHA-256', cryptoEncoder.encode(room));
  return base64Url(digest).slice(0, 32);
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

function formatTimer(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function initialStudyState(clientId: string): SharedStudyState {
  return {
    running: false,
    endsAt: null,
    remainingMs: 25 * 60_000,
    durationMin: 25,
    tasks: [],
    updatedAt: Date.now(),
    updatedBy: clientId,
  };
}

function makeId(len = 12) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

function roomFromHash(): string {
  try {
    const direct = new URLSearchParams(window.location.search).get('room');
    if (direct) return direct.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 24);
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
  const localName = useSelector((state) => state.profile.name.trim() || 'Ben');
  const [remoteName, setRemoteName] = useState('Karşı taraf');
  const [roomCode, setRoomCode] = useState(() => roomFromHash() || makeId(24));
  const [joined, setJoined] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [connection, setConnection] = useState<'offline' | 'connecting' | 'connected' | 'reconnecting'>('offline');
  const [sharing, setSharing] = useState(false);
  const [remoteSharing, setRemoteSharing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [roomFull, setRoomFull] = useState(false);
  const [taskDraft, setTaskDraft] = useState('');
  const [studyTick, setStudyTick] = useState(() => Date.now());
  const [reaction, setReaction] = useState<LiveReaction | null>(null);
  const [sharedStudy, setSharedStudy] = useState<SharedStudyState>(() => initialStudyState(clientId));

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
  const sharedStudyRef = useRef<SharedStudyState>(sharedStudy);
  const reactionTimerRef = useRef<number | null>(null);

  const normalizedRoom = roomCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 24);
  const shareSupported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getDisplayMedia;
  const sharedRemaining = sharedStudy.running && sharedStudy.endsAt != null
    ? Math.max(0, sharedStudy.endsAt - studyTick)
    : sharedStudy.remainingMs;

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

  const applySharedStudy = (next: SharedStudyState) => {
    sharedStudyRef.current = next;
    setSharedStudy(next);
  };

  const syncStudy = async (next: SharedStudyState) => {
    applySharedStudy(next);
    await sendBroadcast('study-sync', next);
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
    setRemoteName('Karşı taraf');
    setReaction(null);
    cryptoKeyRef.current = null;
    setConnection('offline');
  };

  const joinRoom = async () => {
    if (joined || normalizedRoom.length < 12) {
      if (normalizedRoom.length < 12) toast('Oda kodu en az 12 karakter olmalı.');
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

      const topic = await roomTopic(normalizedRoom);
      const channel = supabase.channel('yks-live:' + topic, {
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
          void decryptPacket<{ from: string; at: number; name?: string }>(cryptoKeyRef.current, 'hello', payload as SecurePacket)
            .then((clear) => {
              if (!clear || clear.from === clientId) return;
              if (clear.name?.trim()) setRemoteName(clear.name.trim().slice(0, 40));
              setOnlineCount((n) => Math.max(2, n));
              setConnection('connecting');
              ensurePeer();
              void sendBroadcast('hello', { from: clientId, at: Date.now(), name: localName });
              void sendBroadcast('study-sync', sharedStudyRef.current);
            });
        })
        .on('broadcast', { event: 'chat' }, ({ payload }: any) => {
          if (!payload || payload.from === clientId) return;
          void decryptPacket<{ id: string; from: string; text: string; at: number; name?: string }>(cryptoKeyRef.current, 'chat', payload as SecurePacket)
            .then((clear) => {
              if (!clear || clear.from === clientId || typeof clear.text !== 'string') return;
              if (clear.name?.trim()) setRemoteName(clear.name.trim().slice(0, 40));
              setMessages((m) => [...m.slice(-99), {
                id: clear.id ?? makeId(10),
                sender: clear.name?.trim().slice(0, 40) || remoteName,
                text: clear.text.slice(0, 1000),
                at: clear.at ?? Date.now(),
                mine: false,
              }]);
            });
        })
        .on('broadcast', { event: 'study-sync' }, ({ payload }: any) => {
          if (!payload || payload.from === clientId) return;
          void decryptPacket<SharedStudyState>(cryptoKeyRef.current, 'study-sync', payload as SecurePacket)
            .then((clear) => {
              if (!clear || !Array.isArray(clear.tasks)) return;
              const safe: SharedStudyState = {
                running: !!clear.running,
                endsAt: typeof clear.endsAt === 'number' ? clear.endsAt : null,
                remainingMs: Math.max(0, Number(clear.remainingMs) || 0),
                durationMin: Math.min(120, Math.max(5, Number(clear.durationMin) || 25)),
                tasks: clear.tasks
                  .filter((task) => task && typeof task.id === 'string' && typeof task.text === 'string')
                  .slice(0, 20)
                  .map((task) => ({ id: task.id.slice(0, 32), text: task.text.slice(0, 120), done: !!task.done })),
                updatedAt: Number(clear.updatedAt) || Date.now(),
                updatedBy: typeof clear.updatedBy === 'string' ? clear.updatedBy : payload.from,
              };
              if (safe.updatedAt >= sharedStudyRef.current.updatedAt) applySharedStudy(safe);
            });
        })
        .on('broadcast', { event: 'study-request' }, ({ payload }: any) => {
          if (!payload || payload.from === clientId) return;
          void decryptPacket<{ from: string }>(cryptoKeyRef.current, 'study-request', payload as SecurePacket)
            .then((clear) => {
              if (clear?.from && clear.from !== clientId) void sendBroadcast('study-sync', sharedStudyRef.current);
            });
        })
        .on('broadcast', { event: 'reaction' }, ({ payload }: any) => {
          if (!payload || payload.from === clientId) return;
          void decryptPacket<{ from: string; emoji: string; at: number; name?: string }>(cryptoKeyRef.current, 'reaction', payload as SecurePacket)
            .then((clear) => {
              if (!clear || clear.from === clientId || typeof clear.emoji !== 'string') return;
              const sender = clear.name?.trim().slice(0, 40) || remoteName;
              if (clear.name?.trim()) setRemoteName(sender);
              setReaction({ emoji: clear.emoji.slice(0, 8), sender, at: clear.at || Date.now() });
              if (reactionTimerRef.current) window.clearTimeout(reactionTimerRef.current);
              reactionTimerRef.current = window.setTimeout(() => setReaction(null), 2600);
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
            await channel.track({ id: clientId, name: localName, onlineAt: new Date().toISOString() });
            await sendBroadcast('hello', { from: clientId, at: Date.now(), name: localName });
            await sendBroadcast('study-request', { from: clientId });
            if (helloTimer.current) window.clearInterval(helloTimer.current);
            helloTimer.current = window.setInterval(() => {
              void sendBroadcast('hello', { from: clientId, at: Date.now(), name: localName });
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
    const msg = { id: makeId(10), from: clientId, name: localName, text: text.slice(0, 1000), at: Date.now() };
    setMessages((m) => [...m.slice(-99), { ...msg, sender: localName, mine: true }]);
    setDraft('');
    await sendBroadcast('chat', msg);
  };

  const updateStudy = (patch: Partial<SharedStudyState>) => {
    const next: SharedStudyState = {
      ...sharedStudyRef.current,
      ...patch,
      updatedAt: Date.now(),
      updatedBy: clientId,
    };
    void syncStudy(next);
  };

  const setStudyDuration = (minutes: number) => {
    if (sharedStudy.running) return;
    updateStudy({ durationMin: minutes, remainingMs: minutes * 60_000, endsAt: null });
  };

  const startSharedStudy = () => {
    if (!joined) return toast('Önce odaya bağlan.');
    const current = sharedStudyRef.current;
    const remaining = current.remainingMs > 0 ? current.remainingMs : current.durationMin * 60_000;
    updateStudy({ running: true, endsAt: Date.now() + remaining, remainingMs: remaining });
  };

  const pauseSharedStudy = () => {
    const current = sharedStudyRef.current;
    const remaining = current.running && current.endsAt ? Math.max(0, current.endsAt - Date.now()) : current.remainingMs;
    updateStudy({ running: false, endsAt: null, remainingMs: remaining });
  };

  const resetSharedStudy = () => {
    const current = sharedStudyRef.current;
    updateStudy({ running: false, endsAt: null, remainingMs: current.durationMin * 60_000 });
  };

  const addSharedTask = () => {
    const text = taskDraft.trim();
    if (!joined || !text) return;
    const current = sharedStudyRef.current;
    if (current.tasks.length >= 20) return toast('Ortak listede en fazla 20 görev olabilir.');
    setTaskDraft('');
    updateStudy({ tasks: [...current.tasks, { id: makeId(10), text: text.slice(0, 120), done: false }] });
  };

  const toggleSharedTask = (id: string) => {
    const current = sharedStudyRef.current;
    updateStudy({ tasks: current.tasks.map((task) => task.id === id ? { ...task, done: !task.done } : task) });
  };

  const removeSharedTask = (id: string) => {
    const current = sharedStudyRef.current;
    updateStudy({ tasks: current.tasks.filter((task) => task.id !== id) });
  };

  const sendReaction = (emoji: string) => {
    if (!joined) return;
    const next = { emoji, sender: localName, at: Date.now() };
    setReaction(next);
    if (reactionTimerRef.current) window.clearTimeout(reactionTimerRef.current);
    reactionTimerRef.current = window.setTimeout(() => setReaction(null), 2600);
    void sendBroadcast('reaction', { from: clientId, name: localName, emoji, at: next.at });
  };

  useEffect(() => {
    if (!sharedStudy.running) return;
    const tick = () => {
      const now = Date.now();
      setStudyTick(now);
      const current = sharedStudyRef.current;
      if (current.running && current.endsAt != null && now >= current.endsAt) {
        const done: SharedStudyState = {
          ...current,
          running: false,
          endsAt: null,
          remainingMs: 0,
          updatedAt: now,
          updatedBy: clientId,
        };
        applySharedStudy(done);
        void sendBroadcast('study-sync', done);
        toast('Ortak odak süresi tamamlandı ♡');
        try { navigator.vibrate?.([90, 70, 90]); } catch { /* noop */ }
      }
    };
    tick();
    const timer = window.setInterval(tick, 500);
    return () => window.clearInterval(timer);
  }, [sharedStudy.running, clientId]);

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
    if (reactionTimerRef.current) window.clearTimeout(reactionTimerRef.current);
    void leaveRoom();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inviteUrl = (() => {
    try {
      const u = new URL(window.location.href);
      u.searchParams.set('room', normalizedRoom);
      u.hash = '#/canli';
      return u.toString();
    } catch {
      return '';
    }
  })();

  return (
    <>
      <PageHeader title="Birlikte Canlı ♡" sub="Ekran paylaşımı, ortak odak, görevler ve uçtan uca şifreli mesajlar" />

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
              <b>{remoteName}'ın ekranı</b>
              <span className="tiny muted">{remoteSharing ? 'Canlı yayın alınıyor' : onlineCount >= 2 ? 'Paylaşım bekleniyor' : remoteName + ' çevrimdışı'}</span>
            </div>
            {remoteSharing && <span className="live-pill">CANLI</span>}
          </div>
          <div className="live-video-frame remote">
            <video ref={remoteVideoRef} playsInline autoPlay muted />
            {!remoteSharing && <div className="live-empty"><span>📱</span><b>Ekran bekleniyor</b><small>{remoteName} paylaşımı başlattığında burada görünecek.</small></div>}
          </div>
        </div>

        <div className="card live-video-card">
          <div className="live-video-head">
            <div>
              <b>{localName}'in ekranı</b>
              <span className="tiny muted">{sharing ? remoteName + ' seni canlı görüyor' : 'Paylaşım kapalı'}</span>
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

      <section className="card section live-study-card" aria-labelledby="shared-study-title">
        <div className="live-study-head">
          <div>
            <div className="eyebrow">Beraber ders çalış</div>
            <h2 id="shared-study-title">Ortak odak odası</h2>
            <p className="small muted">Pomodoro, görevler ve tepkiler ikinizde aynı anda güncellenir. Bu veriler de oda anahtarıyla şifrelidir.</p>
          </div>
          <span className={`live-study-state${sharedStudy.running ? ' running' : ''}`}>
            {sharedStudy.running ? 'ODAK AÇIK' : 'HAZIR'}
          </span>
        </div>

        {reaction && (
          <div className="live-reaction-pop" aria-live="polite">
            <span>{reaction.emoji}</span>
            <b>{reaction.sender}</b>
          </div>
        )}

        <div className="live-study-grid">
          <div className="live-focus-panel">
            <div className="live-focus-timer">{formatTimer(sharedRemaining)}</div>
            <div className="live-focus-sub">
              {sharedStudy.running ? `${localName} + ${remoteName} birlikte odakta` : 'Bir süre seçip beraber başlatın'}
            </div>
            <div className="live-duration-picks" role="group" aria-label="Ortak odak süresi">
              {[25, 50, 75].map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  className={`chip${sharedStudy.durationMin === minutes ? ' on' : ''}`}
                  disabled={sharedStudy.running}
                  onClick={() => setStudyDuration(minutes)}
                >
                  {minutes} dk
                </button>
              ))}
            </div>
            <div className="row live-focus-actions">
              {!sharedStudy.running ? (
                <button className="btn primary" type="button" disabled={!joined} onClick={startSharedStudy}>
                  ▶ Birlikte başlat
                </button>
              ) : (
                <button className="btn" type="button" onClick={pauseSharedStudy}>⏸ Duraklat</button>
              )}
              <button className="btn ghost" type="button" disabled={!joined} onClick={resetSharedStudy}>↺ Sıfırla</button>
            </div>
            <div className="live-reactions" aria-label="Hızlı tepkiler">
              {['♡', '🔥', '👏', '💪', '☕'].map((emoji) => (
                <button key={emoji} type="button" disabled={!joined} onClick={() => sendReaction(emoji)}>{emoji}</button>
              ))}
            </div>
          </div>

          <div className="live-shared-tasks">
            <div className="row between nowrap">
              <div>
                <b>Ortak görev listesi</b>
                <div className="tiny muted">{sharedStudy.tasks.filter((task) => task.done).length}/{sharedStudy.tasks.length} tamamlandı</div>
              </div>
              {sharedStudy.tasks.some((task) => task.done) && <span className="badge ok">İlerliyor ✓</span>}
            </div>
            <form
              className="live-task-form"
              onSubmit={(event) => {
                event.preventDefault();
                addSharedTask();
              }}
            >
              <input
                className="input"
                value={taskDraft}
                onChange={(event) => setTaskDraft(event.target.value)}
                maxLength={120}
                placeholder={joined ? 'Örn. 20 fizik sorusu' : 'Önce odaya bağlan'}
                disabled={!joined}
              />
              <button className="btn" type="submit" disabled={!joined || !taskDraft.trim()}>Ekle</button>
            </form>
            <div className="live-task-list">
              {sharedStudy.tasks.length === 0 ? (
                <div className="live-empty-chat">Bugünkü ortak hedefinizi ekleyin.</div>
              ) : sharedStudy.tasks.map((task) => (
                <div className={`live-task-item${task.done ? ' done' : ''}`} key={task.id}>
                  <button
                    type="button"
                    className="live-task-check"
                    onClick={() => toggleSharedTask(task.id)}
                    aria-label={task.done ? task.text + ' görevini geri aç' : task.text + ' görevini tamamla'}
                  >
                    {task.done ? '✓' : ''}
                  </button>
                  <span>{task.text}</span>
                  <button type="button" className="live-task-remove" onClick={() => removeSharedTask(task.id)} aria-label="Görevi sil">×</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="card section live-chat-card">
        <div className="live-chat-head">
          <div>
            <div className="eyebrow">Mesajlar</div>
            <h2 style={{ margin: '3px 0 0' }}>{localName} ♡ {remoteName}</h2>
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
