/**
 * Canlı ekran paylaşımı testlerinin ortak parçaları (e2e-live.mjs ve live-peer.mjs kullanır):
 * derlenmiş uygulamayı /cumaaa/yks/ altında sunan yerel sunucu, isteğe bağlı sahte Supabase kanalı,
 * sahte ekran (değişen tuval), doğrudan bağlantıyı engelleme ve görüntü bekleme yardımcıları.
 */
import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { chromium } from 'playwright-core';

const BASE_PATH = '/cumaaa/yks/';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const SUPABASE_ESM = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
/** Supabase yayın mesajı sınırı (256 KB) altında; sahte kanal da aynı sınırı uygular. */
const MAX_MESSAGE_BYTES = 250_000;
const CHROMIUM = process.env.CHROMIUM_PATH ?? (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);

export const BACKEND = process.env.LIVE_BACKEND ?? 'real';

export function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

export function roomCode() {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 24 }, () => a[Math.floor(Math.random() * a.length)]).join('');
}

// ---------- Sahte gerçek-zamanlı kanal (yalnız LIVE_BACKEND=fake) ----------
const topics = new Map();
function topicState(name) {
  if (!topics.has(name)) topics.set(name, { seq: 0, messages: [], members: new Map() });
  return topics.get(name);
}
async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks).toString('utf8');
}
async function handleFakeRealtime(req, res, url) {
  const t = topicState(url.searchParams.get('topic'));
  const me = url.searchParams.get('me');
  const now = Date.now();
  for (const [key, m] of t.members) if (now - m.seen > 3_000) t.members.delete(key);
  const action = url.pathname.split('/').pop();
  if (action === 'send') {
    const body = await readBody(req);
    if (body.length > MAX_MESSAGE_BYTES) return res.writeHead(413).end('too large');
    const msg = JSON.parse(body);
    t.messages.push({ seq: ++t.seq, from: me, event: msg.event, payload: msg.payload });
    if (t.messages.length > 400) t.messages.splice(0, t.messages.length - 400);
    return res.writeHead(200).end('ok');
  }
  if (action === 'track') {
    t.members.set(me, { meta: JSON.parse(await readBody(req)), seen: now });
    return res.writeHead(200).end('ok');
  }
  if (action === 'untrack') {
    t.members.delete(me);
    return res.writeHead(200).end('ok');
  }
  const since = Number(url.searchParams.get('since') || 0);
  const member = t.members.get(me);
  if (member) member.seen = now;
  const messages = t.messages.filter((m) => m.seq > since && m.from !== me);
  const presence = Object.fromEntries([...t.members].map(([k, m]) => [k, [m.meta]]));
  res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ seq: t.seq, messages, presence }));
}

/** Sayfanın kullandığı supabase-js yüzeyinin küçük bir taklidi; yerel sunucuya kısa aralıklı yoklama ile bağlanır. */
const FAKE_SUPABASE_MODULE = `
export function createClient() {
  return {
    channel(name, opts) { return makeChannel(name, opts?.config?.presence?.key ?? Math.random().toString(36).slice(2)); },
    async removeChannel(ch) { ch._close(); },
  };
}
function makeChannel(topic, me) {
  const handlers = [];
  let closed = false, since = 0, members = {}, tracked = null;
  const q = (path) => '/__rt/' + path + '?topic=' + encodeURIComponent(topic) + '&me=' + encodeURIComponent(me);
  const emitPresence = (event, arg) => handlers.filter((h) => h.type === 'presence' && h.event === event).forEach((h) => h.cb(arg ?? {}));
  async function loop() {
    while (!closed) {
      try {
        if (tracked) await fetch(q('track'), { method: 'POST', body: JSON.stringify(tracked) });
        const r = await fetch(q('poll') + '&since=' + since).then((x) => x.json());
        since = r.seq;
        for (const m of r.messages) handlers.filter((h) => h.type === 'broadcast' && h.event === m.event).forEach((h) => h.cb({ payload: m.payload }));
        const prev = Object.keys(members).sort().join(',');
        const next = Object.keys(r.presence).sort().join(',');
        if (prev !== next) {
          for (const key of Object.keys(members)) if (!r.presence[key]) emitPresence('leave', { key });
          members = r.presence;
          emitPresence('sync');
        }
      } catch {}
      await new Promise((ok) => setTimeout(ok, 120));
    }
  }
  const ch = {
    on(type, filter, cb) { handlers.push({ type, event: filter.event, cb }); return ch; },
    subscribe(cb) {
      fetch(q('poll') + '&since=0').then((x) => x.json()).then((r) => { since = r.seq; loop(); cb('SUBSCRIBED'); });
      return ch;
    },
    async track(meta) { tracked = meta; await fetch(q('track'), { method: 'POST', body: JSON.stringify(meta) }); },
    async untrack() { tracked = null; await fetch(q('untrack'), { method: 'POST' }); },
    async send(msg) {
      const r = await fetch(q('send'), { method: 'POST', body: JSON.stringify({ event: msg.event, payload: msg.payload }) });
      if (!r.ok) throw new Error('send ' + r.status);
      return 'ok';
    },
    presenceState() { return members; },
    _close() { closed = true; },
  };
  return ch;
}
`;

/** Derlenmiş uygulamayı (ve gerekirse sahte kanalı) sunar. */
export async function startServer(distArg = 'dist') {
  const dist = resolve(distArg);
  if (!existsSync(join(dist, 'index.html'))) throw new Error(`Önce derle: ${dist}/index.html yok (npm run build).`);
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    if (url.pathname.startsWith('/__rt/')) return handleFakeRealtime(req, res, url);
    if (!url.pathname.startsWith(BASE_PATH)) return res.writeHead(404).end();
    let rel = decodeURIComponent(url.pathname.slice(BASE_PATH.length)) || 'index.html';
    if (rel.endsWith('/')) rel += 'index.html';
    const file = join(dist, rel);
    if (!file.startsWith(dist) || !existsSync(file)) return res.writeHead(404).end('not found');
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(readFileSync(file));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return { app: `http://127.0.0.1:${server.address().port}${BASE_PATH}`, close: () => server.close() };
}

export function launchBrowser() {
  return chromium.launch({
    executablePath: CHROMIUM,
    // Aynı makinedeki iki tarayıcı birbirini mDNS gizlemesi olmadan bulsun (gerçek cihazlarda STUN ile bulunur).
    args: ['--no-sandbox', '--disable-features=WebRtcHideLocalIpsWithMdns'],
  });
}

/** Paylaşılan ekranın yerine her karede değişen bir tuval akışı. */
function fakeDisplayMedia() {
  navigator.mediaDevices.getDisplayMedia = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    let n = 0;
    const draw = () => {
      n += 1;
      ctx.fillStyle = `hsl(${(n * 7) % 360} 70% 45%)`;
      ctx.fillRect(0, 0, 1280, 720);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 120px sans-serif';
      ctx.fillText('YKS ' + n, 120, 400);
    };
    draw();
    setInterval(draw, 100);
    return canvas.captureStream(10);
  };
}

/** Doğrudan bağlantıyı imkânsız kılar (aday toplanmaz) → yedek yol devreye girmek zorunda kalır. */
function blockDirectConnection() {
  const Native = window.RTCPeerConnection;
  window.RTCPeerConnection = function (config = {}) {
    return new Native({ ...config, iceServers: [], iceTransportPolicy: 'relay' });
  };
  window.RTCPeerConnection.prototype = Native.prototype;
}

const MOBILE = { viewport: { width: 393, height: 851 }, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36' };

/** Yeni bir kişi (ayrı tarayıcı profili) açar ve profil kurulumunu geçer. */
export async function openPerson(browser, app, name, { sharer = false, blockDirect = false, mobile = false, errors = [] } = {}) {
  const context = await browser.newContext(mobile ? MOBILE : { viewport: { width: 1280, height: 900 } });
  if (sharer) await context.addInitScript(fakeDisplayMedia);
  if (blockDirect) await context.addInitScript(blockDirectConnection);
  if (BACKEND === 'fake') {
    await context.route(SUPABASE_ESM, (route) => route.fulfill({ status: 200, contentType: 'text/javascript', body: FAKE_SUPABASE_MODULE, headers: { 'Access-Control-Allow-Origin': '*' } }));
  }
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`));
  await page.goto(app, { waitUntil: 'networkidle' });
  const input = page.locator('#main input').first();
  if (await input.count()) {
    await input.fill(name);
    for (let i = 0; i < 8; i++) {
      const btn = page.getByRole('button', { name: /Devam et|Profilimi oluştur/ });
      if (!(await btn.count())) break;
      await btn.first().click();
      await page.waitForTimeout(200);
    }
  }
  return { context, page };
}

export async function joinRoom(page, app, room) {
  await page.goto(`${app}?room=${room}#/canli`);
  await page.getByRole('button', { name: 'Odadan çık' }).waitFor({ timeout: 30_000 });
}

/** İzleyenin video öğesinde gerçekten ilerleyen kareler var mı? */
export async function waitDirectVideo(page, timeout) {
  await page.waitForFunction(
    () => {
      const v = document.querySelector('.live-video-frame.remote video');
      if (!v || v.videoWidth === 0 || v.readyState < 2) return false;
      const t = v.currentTime;
      const ok = window.__lastT != null && t > window.__lastT;
      window.__lastT = t;
      return ok;
    },
    null,
    { timeout, polling: 500 },
  );
}

/** Yedek yoldan gelip gerçekten çözülmüş kaç farklı kare görüldü? */
export async function relayFrames(page, count, timeout) {
  const seen = new Set();
  const until = Date.now() + timeout;
  while (Date.now() < until && seen.size < count) {
    const src = await page.evaluate(() => {
      const img = document.querySelector('[data-testid="live-relay-frame"]');
      return img && img.complete && img.naturalWidth > 0 ? img.src : null;
    });
    if (src) seen.add(src);
    await page.waitForTimeout(400);
  }
  return seen.size;
}

/** İzleyen tarafta görüntü doğrudan ya da yedek yoldan gelene kadar bekler; hangi yoldan geldiğini döndürür. */
export async function waitAnyVideo(page, timeout) {
  const until = Date.now() + timeout;
  while (Date.now() < until) {
    const state = await page.evaluate(() => {
      const v = document.querySelector('.live-video-frame.remote video');
      const img = document.querySelector('[data-testid="live-relay-frame"]');
      return {
        direct: !!v && v.videoWidth > 0 && v.readyState >= 2 && !v.paused,
        relay: !!img && img.complete && img.naturalWidth > 0,
      };
    });
    if (state.relay) {
      // Ekran değişmese de en geç 5 sn'de bir kare yenilenir; iki farklı kare görmek yolun sürdüğünü kanıtlar.
      if ((await relayFrames(page, 2, 15_000)) < 2) throw new Error('Yedek yoldan tek kare geldi, akış sürmedi');
      return 'yedek yol';
    }
    if (state.direct) {
      await waitDirectVideo(page, 10_000);
      return 'doğrudan';
    }
    await page.waitForTimeout(500);
  }
  throw new Error(`${timeout / 1000} sn içinde görüntü gelmedi`);
}
