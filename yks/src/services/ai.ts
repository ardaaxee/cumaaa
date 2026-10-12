import { getState } from '../store/store';

/**
 * Öğretmen yapay zekâsı istemcisi. Hiçbir API anahtarı istemcide tutulmaz;
 * istekler sunucudaki /api/teacher uç noktasına gider. Sunucu yoksa ya da
 * anahtar tanımlı değilse durum "yapılandırılmadı" olarak döner.
 */

export type TeacherAction =
  | 'anlat'
  | 'basit'
  | 'detayli'
  | 'ornek'
  | 'ipucu'
  | 'coz'
  | 'hatam'
  | 'benzer'
  | 'quiz'
  | 'yanlislar'
  | 'bugun'
  | 'serbest'
  | 'foto';

export interface TeacherContext {
  subject?: string;
  topic?: string;
  lessonSummary?: string;
  question?: string;
  studentAnswer?: string;
  correctAnswer?: string;
  solution?: string;
  wrongsSummary?: string;
  statsSummary?: string;
  studentName?: string;
}

export interface AiStatus {
  configured: boolean;
  model: string | null;
  reason: string;
}

export const DEFAULT_AI_SERVER = 'https://iyi-ki-yks.onrender.com';

/** Kullanıcı özel adres verdiyse onu; yoksa build ayarını; o da yoksa kalıcı Render sunucusunu kullanır. */
export function apiBase(): string {
  const configured =
    getState().settings.aiServerUrl ||
    (import.meta.env.VITE_AI_URL as string | undefined) ||
    DEFAULT_AI_SERVER;
  return `${configured.replace(/\/+$/, '')}/api`;
}

async function fetchHealth(timeoutMs: number): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(`${apiBase()}/health`, { signal: ctrl.signal, cache: 'no-store' });
  } finally {
    clearTimeout(timer);
  }
}

export async function checkAiStatus(timeoutMs = 15_000): Promise<AiStatus> {
  if (!navigator.onLine) return { configured: false, model: null, reason: 'İnternet bağlantısı yok.' };

  let lastError: unknown = null;
  for (const wait of [timeoutMs, 45_000]) {
    try {
      const res = await fetchHealth(wait);
      if (!res.ok) return { configured: false, model: null, reason: `AI sunucusu hata verdi (HTTP ${res.status}).` };
      const data = (await res.json()) as { ai?: boolean; model?: string | null };
      return data.ai
        ? { configured: true, model: data.model ?? null, reason: '' }
        : { configured: false, model: null, reason: 'Sunucuda AI anahtarı tanımlı değil.' };
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }
  }
  void lastError;
  return { configured: false, model: null, reason: 'AI sunucusu uyanamadı veya ulaşılamıyor. Tekrar dene.' };
}

export interface AskInput {
  action: TeacherAction;
  message: string;
  context: TeacherContext;
  history: { role: 'user' | 'teacher'; text: string }[];
  teacherName: string;
  /** Fotoğraflı soru (base64, veri önekisiz). */
  image?: { mediaType: string; data: string };
}

async function teacherRequest(input: AskInput, signal?: AbortSignal): Promise<Response> {
  return fetch(`${apiBase()}/teacher`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal,
  });
}

export async function askTeacher(input: AskInput, signal?: AbortSignal): Promise<string> {
  let res: Response | null = null;
  let networkError = false;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      res = await teacherRequest(input, signal);
      networkError = false;
    } catch {
      networkError = true;
      if (signal?.aborted || attempt === 1) break;
    }

    if (res && ![502, 503, 504].includes(res.status)) break;
    if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 1800));
  }

  if (!res) throw new Error(networkError ? 'AI sunucusuna ulaşılamadı.' : 'AI yanıtı alınamadı.');
  const data = (await res.json().catch(() => ({}))) as { text?: string; error?: string };
  if (!res.ok || !data.text) throw new Error(data.error || `AI yanıtı alınamadı (HTTP ${res.status}).`);
  return data.text;
}
