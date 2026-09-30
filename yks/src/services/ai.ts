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

export async function checkAiStatus(timeoutMs = 8000): Promise<AiStatus> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${apiBase()}/health`, { signal: ctrl.signal, cache: 'no-store' });
    if (!res.ok) return { configured: false, model: null, reason: 'AI sunucusu bulunamadı.' };
    const data = (await res.json()) as { ai?: boolean; model?: string | null };
    return data.ai
      ? { configured: true, model: data.model ?? null, reason: '' }
      : { configured: false, model: null, reason: 'Sunucuda AI anahtarı tanımlı değil.' };
  } catch {
    return { configured: false, model: null, reason: navigator.onLine ? 'AI sunucusuna ulaşılamadı.' : 'İnternet bağlantısı yok.' };
  } finally {
    clearTimeout(timer);
  }
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

export async function askTeacher(input: AskInput, signal?: AbortSignal): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${apiBase()}/teacher`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal,
    });
  } catch {
    throw new Error('AI sunucusuna ulaşılamadı.');
  }
  const data = (await res.json().catch(() => ({}))) as { text?: string; error?: string };
  if (!res.ok || !data.text) throw new Error(data.error || 'AI yanıtı alınamadı.');
  return data.text;
}
