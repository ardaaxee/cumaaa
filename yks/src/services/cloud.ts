import {getPageImage,setPageImages} from './notebookStore';
import { mergeStates } from '../store/merge';
import type { AppState } from '../store/schema';
import { sanitize } from '../store/migrations';
import { getState, replaceState, subscribe } from '../store/store';
import { computeBadges } from '../utils/badges';
import { dayKey, diffDays } from '../utils/date';
import { dashboard } from '../utils/stats';

/**
 * Bulut eşitlemesi ve ortak ekran — Firebase Firestore REST API (ek kütüphane yok).
 * Veriler "yksSync/<gizli kod>" belgesinde JSON olarak saklanır; kodu bilen cihazlar eşitlenir.
 * Firebase web yapılandırması (projectId + apiKey) gizli değildir; erişim, Firestore
 * kurallarıyla yalnız uzun ve tahmin edilemez belge kimliklerine izin verilerek sınırlanır.
 */

export interface CloudConfig {
  projectId: string;
  apiKey: string;
}

export interface CloudStatus {
  enabled: boolean;
  syncing: boolean;
  lastSyncAt: string | null;
  error: string | null;
}

export interface ShareSummary {
  name: string;
  updatedAt: string;
  streak: number;
  todayQuestions: number;
  weekQuestions: number;
  totalQuestions: number;
  accuracy: number | null;
  weekMinutes: number;
  completedTopics: number;
  badges: number;
  badgeIcons: string[];
  lastMockNet: number | null;
  lastMockExam: string | null;
  daysLeft: number | null;
  cardsLearned: number;
}

export interface ShareMessage {
  from: string;
  text: string;
  at: string;
}

const CHANGED_KEY = 'iyikiYks.changedAt';
const SYNCED_KEY = 'iyikiYks.syncedAt';
const MESSAGES_KEY = 'iyikiYks.partnerMessages';
const CHUNK = 180_000;
const SYNC_COL = 'yksSync';
const SHARE_COL = 'yksShare';

// ---------- küçük yardımcılar ----------

function ls(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function lsSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* depolama kapalıysa eşitleme yine çalışır, yalnız zaman damgası tutulamaz */
  }
}

export function randomCode(len = 28): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

export function cloudConfig(state: AppState = getState()): CloudConfig | null {
  const projectId = state.settings.cloud.projectId || (import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined) || '';
  const apiKey = state.settings.cloud.apiKey || (import.meta.env.VITE_FIREBASE_API_KEY as string | undefined) || '';
  return projectId && apiKey ? { projectId, apiKey } : null;
}

function docUrl(cfg: CloudConfig, col: string, id: string, mask?: string[]): string {
  const params = new URLSearchParams({ key: cfg.apiKey });
  for (const f of mask ?? []) params.append('updateMask.fieldPaths', f);
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(cfg.projectId)}/databases/(default)/documents/${col}/${encodeURIComponent(id)}?${params}`;
}

type Fields = Record<string, string>;

async function readDoc(cfg: CloudConfig, col: string, id: string): Promise<Fields | null> {
  const res = await fetch(docUrl(cfg, col, id), { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(await errorText(res));
  const data = (await res.json()) as { fields?: Record<string, { stringValue?: string }> };
  return Object.fromEntries(Object.entries(data.fields ?? {}).map(([k, v]) => [k, v.stringValue ?? '']));
}

async function writeDoc(cfg: CloudConfig, col: string, id: string, fields: Fields, mask?: string[], keepalive = false): Promise<void> {
  const body = JSON.stringify({ fields: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, { stringValue: v }])) });
  const res = await fetch(docUrl(cfg, col, id, mask), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: keepalive && body.length < 60_000,
  });
  if (!res.ok) throw new Error(await errorText(res));
}

async function errorText(res: Response): Promise<string> {
  if (res.status === 403 || res.status === 401) return 'Bulut erişimi reddedildi (Firestore kurallarını ve API anahtarını kontrol et).';
  if (res.status === 400) return 'Bulut ayarları hatalı (proje kimliği?).';
  return `Bulut hatası (${res.status}).`;
}

// ---------- durum (arayüz için) ----------

let status: CloudStatus = { enabled: false, syncing: false, lastSyncAt: ls(SYNCED_KEY), error: null };
const statusListeners = new Set<() => void>();
function setStatus(patch: Partial<CloudStatus>) {
  status = { ...status, ...patch };
  statusListeners.forEach((l) => l());
}
export function getCloudStatus(): CloudStatus {
  return status;
}
export function subscribeCloud(l: () => void): () => void {
  statusListeners.add(l);
  return () => statusListeners.delete(l);
}

// ---------- eşitleme ----------

let applyingRemote = false;
let dirty = false;
let changeRevision=0;

/** Yerel değişiklik zamanını tutar (eşitlemeden gelen değişiklikler hariç). */
export function startChangeTracking(): () => void {
  return subscribe(() => {
    if (applyingRemote) return;
    dirty = true;
    changeRevision++;
    lsSet(CHANGED_KEY, new Date().toISOString());
  });
}

async function serialize(state:AppState):Promise<string>{
 const notebookImages:Record<string,string>={};
 for(const page of state.notebookPages){const image=await getPageImage(page.id);if(image)notebookImages[page.id]=image;}
 return JSON.stringify({state:{...state,activeTest:null},notebookImages});
}

async function pullRemote(cfg:CloudConfig,code:string):Promise<{state:AppState;updatedAt:string;notebookImages:Record<string,string>}|null>{
 const main=await readDoc(cfg,SYNC_COL,code);if(!main)return null;
 const parts=Number(main.parts)||1;
 if(!Number.isInteger(parts)||parts<1||parts>1000)throw new Error('Bulut verisinin parça sayısı geçersiz.');
 let json=main.part0??'';
 for(let i=1;i<parts;i++){
  const part=await readDoc(cfg,SYNC_COL,`${code}${main.generation?'-'+main.generation:''}-p${i}`);
  if(!part)throw new Error('Bulut verisi eksik. Yerel verilerin korunuyor; tekrar dene.');
  json+=part.data??'';
 }
 const raw=JSON.parse(json);const wrapped=raw&&typeof raw==='object'&&raw.state;
 const state=sanitize(wrapped?raw.state:raw);
 const images=wrapped&&raw.notebookImages&&typeof raw.notebookImages==='object'?raw.notebookImages:{};
 const notebookImages:Record<string,string>={};
 for(const page of state.notebookPages){const image=images[page.id];if(typeof image==='string'&&/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(image))notebookImages[page.id]=image;}
 return {state,notebookImages,updatedAt:main.updatedAt||'1970-01-01T00:00:00Z'};
}

async function pushRemote(cfg:CloudConfig,code:string,state:AppState,updatedAt:string):Promise<void>{
 const json=await serialize(state);const chunks:string[]=[];
 for(let i=0;i<json.length;i+=CHUNK)chunks.push(json.slice(i,i+CHUNK));
 const generation=randomCode(12);
 // Versioned chunks keep the old snapshot readable until the manifest commits.
 for(let i=1;i<chunks.length;i++)await writeDoc(cfg,SYNC_COL,`${code}-${generation}-p${i}`,{data:chunks[i]});
 await writeDoc(cfg,SYNC_COL,code,{part0:chunks[0]??'{}',parts:String(chunks.length||1),generation,updatedAt});
}

let inFlight: Promise<void> | null = null;

/** Buluttaki veriyle birleştirir ve sonucu geri yazar. */
export function syncNow(): Promise<void> {
  if (inFlight) return inFlight;
  const run = async () => {
    const state = getState();
    const cfg = cloudConfig(state);
    const code = state.settings.cloud.syncCode;
    if (!cfg || !code) {
      setStatus({ enabled: false });
      return;
    }
    setStatus({ enabled: true, syncing: true, error: null });
    try {
      const revision=changeRevision;
      const remote = await pullRemote(cfg, code);
      const localChangedAt = ls(CHANGED_KEY) ?? '1970-01-01T00:00:00Z';
      let merged = getState();
      if (remote) {
        merged = mergeStates({ local: getState(), localChangedAt, remote: remote.state, remoteChangedAt: remote.updatedAt });
        const restoreImages:Record<string,string>={};
        for(const page of remote.state.notebookPages){
          const current=getState().notebookPages.find(p=>p.id===page.id);
          const image=remote.notebookImages[page.id];
          if(image&&!getState().deleted[page.id]&&(!current||page.updatedAt>current.updatedAt))restoreImages[page.id]=image;
          else if(image&&current&&page.updatedAt===current.updatedAt&&!(await getPageImage(page.id)))restoreImages[page.id]=image;
        }
        if(Object.keys(restoreImages).length)await setPageImages(restoreImages);
        merged=mergeStates({local:getState(),localChangedAt:ls(CHANGED_KEY)??localChangedAt,remote:remote.state,remoteChangedAt:remote.updatedAt});
        applyingRemote = true;
        replaceState(merged);
        applyingRemote = false;
      }
      const now = new Date().toISOString();
      await pushRemote(cfg, code, merged, now);
      await publishShare(merged).catch(() => undefined);
      await refreshPartnerMessages(merged).catch(() => undefined);
      dirty = changeRevision!==revision;
      if(!dirty)lsSet(CHANGED_KEY, now);
      lsSet(SYNCED_KEY, now);
      setStatus({ syncing: false, lastSyncAt: now });
    } catch (e) {
      applyingRemote = false;
      setStatus({ syncing: false, error: e instanceof Error ? e.message : 'Eşitleme başarısız.' });
    }
  };
  inFlight = run().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

/** Uygulama açıkken periyodik eşitleme. Kapatma fonksiyonu döner. */
export function startAutoSync(): () => void {
  const stopTracking = startChangeTracking();
  const first = window.setTimeout(() => void syncNow(), 1500);
  const iv = window.setInterval(() => {
    if (dirty) void syncNow();
  }, 30_000);
  const onHide=()=>{if(document.visibilityState==='hidden'&&dirty)void syncNow();};
  const onVisible = () => document.visibilityState === 'visible' && void syncNow();
  document.addEventListener('visibilitychange', onHide);
  document.addEventListener('visibilitychange', onVisible);
  return () => {
    stopTracking();
    clearTimeout(first);
    clearInterval(iv);
    document.removeEventListener('visibilitychange', onHide);
    document.removeEventListener('visibilitychange', onVisible);
  };
}

// ---------- ortak ekran (sevgili paylaşımı) ----------

export function buildShareSummary(state: AppState): ShareSummary {
  const today = dayKey();
  const d = dashboard(state, today);
  const badges = computeBadges(state, today).filter((b) => b.earned);
  return {
    name: state.profile.name || 'Öğrenci',
    updatedAt: new Date().toISOString(),
    streak: d.streak,
    todayQuestions: d.todayQuestions,
    weekQuestions: d.weekQuestions,
    totalQuestions: d.totalQuestions,
    accuracy: d.accuracy,
    weekMinutes: d.weekMinutes,
    completedTopics: d.completedTopics,
    badges: badges.length,
    badgeIcons: badges.slice(-6).map((b) => b.icon),
    lastMockNet: d.lastMockNet,
    lastMockExam: d.lastMockExam,
    daysLeft: state.profile.examDate ? diffDays(today, state.profile.examDate) : null,
    cardsLearned: Object.values(state.cards).filter((c) => c.box >= 4).length,
  };
}

async function publishShare(state: AppState): Promise<void> {
  const cfg = cloudConfig(state);
  const code = state.settings.cloud.shareCode;
  if (!cfg || !code) return;
  // Yalnız özet alanı güncellenir; mesajlara dokunulmaz.
  await writeDoc(cfg, SHARE_COL, code, { summary: JSON.stringify(buildShareSummary(state)) }, ['summary']);
}

export async function readShare(cfg: CloudConfig, code: string): Promise<{ summary: ShareSummary | null; messages: ShareMessage[] } | null> {
  const doc = await readDoc(cfg, SHARE_COL, code);
  if (!doc) return null;
  const safe = <T,>(s: string | undefined, fallback: T): T => {
    try {
      return s ? (JSON.parse(s) as T) : fallback;
    } catch {
      return fallback;
    }
  };
  const messages = safe<ShareMessage[]>(doc.messages, []).filter((m) => m && typeof m.text === 'string');
  return { summary: safe<ShareSummary | null>(doc.summary, null), messages };
}

export async function sendShareMessage(cfg: CloudConfig, code: string, from: string, text: string): Promise<ShareMessage[]> {
  const clean = text.trim().slice(0, 300);
  if (!clean) throw new Error('Mesaj boş olamaz.');
  const cur = await readShare(cfg, code);
  const messages = [...(cur?.messages ?? []), { from: from.trim().slice(0, 30) || '♡', text: clean, at: new Date().toISOString() }].slice(-40);
  await writeDoc(cfg, SHARE_COL, code, { messages: JSON.stringify(messages) }, ['messages']);
  return messages;
}

async function refreshPartnerMessages(state: AppState): Promise<void> {
  const cfg = cloudConfig(state);
  const code = state.settings.cloud.shareCode;
  if (!cfg || !code) return;
  const share = await readShare(cfg, code);
  if (!share) return;
  lsSet(MESSAGES_KEY, JSON.stringify(share.messages));
  window.dispatchEvent(new CustomEvent('iyiki:partner-messages'));
}

export function cachedPartnerMessages(): ShareMessage[] {
  try {
    const raw = ls(MESSAGES_KEY);
    return raw ? (JSON.parse(raw) as ShareMessage[]) : [];
  } catch {
    return [];
  }
}

/** Sevgiline gönderilecek bağlantı: Firebase yapılandırması bağlantının içindedir. */
export function shareLink(state: AppState = getState()): string | null {
  const cfg = cloudConfig(state);
  const code = state.settings.cloud.shareCode;
  if (!cfg || !code) return null;
  const base = `${location.origin}${location.pathname}`;
  return `${base}#/ortak?${new URLSearchParams({ k: code, p: cfg.projectId, a: cfg.apiKey })}`;
}

/** Firestore güvenlik kuralları (kullanıcının Firebase paneline yapıştırması için). */
export const FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /yksSync/{id} {
      allow read, write: if id.size() >= 20;
    }
    match /yksShare/{id} {
      allow read, write: if id.size() >= 20;
    }
  }
}`;
