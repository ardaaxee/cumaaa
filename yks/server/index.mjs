/**
 * İyi ki • YKS — üretim sunucusu.
 * - dist/ klasörünü statik olarak sunar (tek sayfa uygulaması).
 * - /api/health ve /api/teacher uç noktaları (Claude API; anahtar yalnız ortam değişkeninde).
 *
 * Ortam değişkenleri:
 *   PORT                (varsayılan 8787)
 *   ANTHROPIC_API_KEY   (yoksa AI bölümü "yapılandırılmadı" olarak görünür)
 *   AI_MODEL            (varsayılan claude-opus-5)
 *   AI_RATE_LIMIT       (IP başına dakikalık istek, varsayılan 20)
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt, buildUserContent, createRateLimiter, validateTeacherRequest } from './teacher.mjs';

const ROOT = resolve(fileURLToPath(new URL('../dist', import.meta.url)));
const PORT = Number(process.env.PORT) || 8787;
const MODEL = process.env.AI_MODEL || 'claude-opus-5';
const API_KEY = process.env.ANTHROPIC_API_KEY || '';
const MAX_BODY = 64 * 1024;

const client = API_KEY ? new Anthropic({ apiKey: API_KEY, maxRetries: 2, timeout: 120_000 }) : null;
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

function sendJson(res, status, data) {
  send(res, status, JSON.stringify(data), { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
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
  if (!client) return sendJson(res, 503, { error: 'AI bağlantısı yapılandırılmadı.' });
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

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: 'medium' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: buildSystemPrompt(value.teacherName),
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

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://localhost');
  if (url.pathname === '/api/health') {
    return sendJson(res, 200, { ok: true, ai: !!client, model: client ? MODEL : null });
  }
  if (url.pathname === '/api/teacher') {
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Yalnız POST desteklenir.' });
    return handleTeacher(req, res);
  }
  if (url.pathname.startsWith('/api/')) return sendJson(res, 404, { error: 'Bulunamadı.' });
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
  return serveStatic(req, res, url.pathname);
});

server.listen(PORT, () => {
  console.log(`İyi ki • YKS sunucusu http://localhost:${PORT} (AI: ${client ? MODEL : 'yapılandırılmadı'})`);
});
