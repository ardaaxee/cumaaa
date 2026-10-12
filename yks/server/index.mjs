/**
 * İyi ki • YKS — üretim sunucusu.
 * - dist/ klasörünü statik olarak sunar (tek sayfa uygulaması).
 * - /api/health ve /api/teacher uç noktaları (Claude API; anahtar yalnız ortam değişkeninde).
 *
 * Ortam değişkenleri:
 *   PORT                (varsayılan 8787)
 *   GEMINI_API_KEY      (ÜCRETSİZ seçenek: Google AI Studio anahtarı; ANTHROPIC_API_KEY yoksa kullanılır)
 *   GEMINI_MODEL        (varsayılan gemini-3.5-flash)
 *   GEMINI_FALLBACK_MODEL (varsayılan gemini-3.5-flash-lite)
 *   ANTHROPIC_API_KEY   (ücretli Claude seçeneği; tanımlıysa önceliklidir)
 *   AI_MODEL            (Claude modeli, varsayılan claude-opus-5)
 *   İkisi de yoksa AI bölümü "yapılandırılmadı" olarak görünür.
 *   AI_RATE_LIMIT       (IP başına dakikalık istek, varsayılan 20)
 *   ALLOWED_ORIGINS     (başka alan adındaki arayüzün /api'ye erişimi için virgülle ayrılmış liste,
 *                        ör. https://ardaaxee.github.io — varsayılan bu adres)
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt, buildUserContent, createRateLimiter, validateTeacherRequest } from './teacher.mjs';
import { GeminiError, askGemini } from './gemini.mjs';

const ROOT = resolve(fileURLToPath(new URL('../dist', import.meta.url)));
const PORT = Number(process.env.PORT) || 8787;
const MODEL = process.env.AI_MODEL || 'claude-opus-5';
const API_KEY = process.env.ANTHROPIC_API_KEY || '';
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
const GEMINI_FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.5-flash-lite';
const MAX_BODY = 8 * 1024 * 1024; // fotoğraflı sorular için
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://ardaaxee.github.io')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const client = API_KEY ? new Anthropic({ apiKey: API_KEY, maxRetries: 2, timeout: 120_000 }) : null;
const ACTIVE_MODEL = client ? MODEL : GEMINI_KEY ? GEMINI_MODEL : null;
const allow = createRateLimiter({ limit: Number(process.env.AI_RATE_LIMIT) || 20 });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy':
    "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, { ...SECURITY_HEADERS, ...headers });
  res.end(body);
}

function corsHeaders(req) {
  const origin = req.headers.origin;
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function sendJsonBase(res, status, data, req) {
  send(res, status, JSON.stringify(data), {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...(req ? corsHeaders(req) : {}),
  });
}

function readBody(req) {
  return new Promise((resolveBody, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error('too_large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolveBody(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function clientIp(req) {
  return req.socket.remoteAddress || 'unknown';
}

async function handleTeacher(req, res) {
  const sendJson = (r, status, data) => sendJsonBase(r, status, data, req);
  if (!ACTIVE_MODEL) return sendJson(res, 503, { error: 'AI bağlantısı yapılandırılmadı.' });
  if (!allow(clientIp(req))) return sendJson(res, 429, { error: 'Çok fazla istek. Lütfen bir dakika sonra tekrar dene.' });
  if (!String(req.headers['content-type'] || '').includes('application/json')) {
    return sendJson(res, 415, { error: 'İçerik türü application/json olmalı.' });
  }

  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch (e) {
    return sendJson(res, e instanceof Error && e.message === 'too_large' ? 413 : 400, { error: 'İstek okunamadı.' });
  }
  const { value, error } = validateTeacherRequest(body);
  if (error) return sendJson(res, 400, { error });

  if (!client) return handleGemini(res, value, sendJson);

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: 'medium' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: buildSystemPrompt(value.teacherName, value.context.studentName),
      messages: [...value.history, { role: 'user', content: buildUserContent(value) }],
    });
    if (response.stop_reason === 'refusal') {
      return sendJson(res, 200, { text: 'Bu isteğe yanıt veremiyorum. Soruyu farklı bir şekilde sorabilir misin?', model: response.model });
    }
    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();
    return sendJson(res, 200, { text: text || 'Yanıt üretilemedi.', model: response.model, truncated: response.stop_reason === 'max_tokens' });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
      console.error('[teacher] kimlik doğrulama hatası:', err.status);
      return sendJson(res, 502, { error: 'AI bağlantısı yapılandırma hatası (sunucu anahtarı geçersiz).' });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return sendJson(res, 429, { error: 'AI servisi şu an yoğun. Biraz sonra tekrar dene.' });
    }
    if (err instanceof Anthropic.BadRequestError) {
      console.error('[teacher] geçersiz istek:', err.message);
      return sendJson(res, 502, { error: 'AI isteği işlenemedi.' });
    }
    if (err instanceof Anthropic.APIError) {
      console.error('[teacher] API hatası:', err.status, err.message);
      return sendJson(res, 502, { error: 'AI servisine ulaşılamadı. Biraz sonra tekrar dene.' });
    }
    console.error('[teacher] beklenmeyen hata:', err);
    return sendJson(res, 500, { error: 'Beklenmeyen bir hata oluştu.' });
  }
}

async function runGeminiModel(value, model) {
  return askGemini({
    apiKey: GEMINI_KEY,
    model,
    system: buildSystemPrompt(value.teacherName, value.context.studentName),
    history: value.history,
    userContent: buildUserContent(value),
    signal: AbortSignal.timeout(120_000),
  });
}

async function handleGemini(res, value, sendJson) {
  let model = GEMINI_MODEL;
  try {
    let result;
    try {
      result = await runGeminiModel(value, model);
    } catch (err) {
      // Model yeni projede kullanılamıyorsa daha hafif kararlı modele otomatik düş.
      if (err instanceof GeminiError && err.status === 404 && GEMINI_FALLBACK_MODEL !== model) {
        console.warn('[teacher/gemini] model bulunamadı, fallback:', model, '->', GEMINI_FALLBACK_MODEL);
        model = GEMINI_FALLBACK_MODEL;
        result = await runGeminiModel(value, model);
      } else {
        throw err;
      }
    }
    return sendJson(res, 200, { text: result.text, model, truncated: result.truncated });
  } catch (err) {
    if (err instanceof GeminiError) {
      console.error('[teacher/gemini]', err.status, err.message);
      if (err.status === 429) return sendJson(res, 429, { error: 'Ücretsiz Gemini kotası şu an doldu. Biraz sonra tekrar dene.' });
      if (err.status === 401 || err.status === 403) return sendJson(res, 502, { error: 'Gemini API anahtarı geçersiz veya bu modele erişimi yok.' });
      if (err.status === 400) return sendJson(res, 502, { error: 'Gemini isteği işlenemedi. Model ayarını kontrol et.' });
      if (err.status === 404) return sendJson(res, 502, { error: 'Gemini modeli bu API anahtarında kullanılamıyor.' });
      return sendJson(res, 502, { error: 'Gemini servisine ulaşılamadı. Biraz sonra tekrar dene.' });
    }
    console.error('[teacher/gemini] beklenmeyen hata:', err);
    return sendJson(res, 502, { error: 'Gemini servisine ulaşılamadı. Biraz sonra tekrar dene.' });
  }
}

async function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const filePath = normalize(join(ROOT, rel));
  if (filePath !== ROOT && !filePath.startsWith(ROOT + sep)) return send(res, 403, 'Forbidden');
  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error('not file');
    const data = await readFile(filePath);
    const ext = extname(filePath);
    const immutable = rel.startsWith('/assets/');
    const cache = immutable ? 'public, max-age=31536000, immutable' : 'no-cache';
    return send(res, 200, req.method === 'HEAD' ? '' : data, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': cache });
  } catch {
    if (extname(rel)) return send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
    const index = await readFile(join(ROOT, 'index.html')).catch(() => null);
    if (!index) return send(res, 500, 'dist/ bulunamadı. Önce "npm run build" çalıştırın.');
    return send(res, 200, index, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-cache' });
  }
}

const sendJson = (res, status, data) => sendJsonBase(res, status, data);

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://localhost');
  if (url.pathname.startsWith('/api/') && req.method === 'OPTIONS') {
    res.writeHead(204, { ...SECURITY_HEADERS, ...corsHeaders(req) });
    return res.end();
  }
  if (url.pathname === '/api/health') {
    return sendJsonBase(res, 200, { ok: true, ai: !!ACTIVE_MODEL, model: ACTIVE_MODEL }, req);
  }
  if (url.pathname === '/api/teacher') {
    if (req.method !== 'POST') return sendJsonBase(res, 405, { error: 'Yalnız POST desteklenir.' }, req);
    return handleTeacher(req, res);
  }
  if (url.pathname.startsWith('/api/')) return sendJson(res, 404, { error: 'Bulunamadı.' });
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
  return serveStatic(req, res, url.pathname);
});

server.listen(PORT, () => {
  console.log(`İyi ki • YKS sunucusu http://localhost:${PORT} (AI: ${ACTIVE_MODEL ?? 'yapılandırılmadı'})`);
});
