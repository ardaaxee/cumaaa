#!/usr/bin/env node
/**
 * Gerçek tarayıcıyla uçtan uca test (Playwright + Chromium, telefon boyutu).
 * Derlenmiş dist/ klasörünü GitHub Pages'teki gibi /cumaaa/yks/ altında sunar ve kritik akışları dener:
 *  A) Ana sayfa → tavşan (TYT) → Matematik → konu → 5 soru → Testi başlat → 1. soru görünür
 *  B) AYT → Fizik → 10 soru → soru açılır
 *  C) Dersler → TYT Matematik → konu → konu sonu soruları → 1. soru görünür
 *  D) Soru cevaplanır → çözüm açılır     E) İleri → sonraki soru
 *  F) Sayfa yenilenir → devam eden test durur
 *  G) Çevrimdışı → daha önce açılmış konunun soruları açılır
 *  H) Yeni sürüm yayınlanmış → eski paket 404 → tek yenileme → yeni sürüm açılır
 *  + Testler ekranı açılırken hiçbir soru paketi indirilmez, test yalnız seçilen dersin paketlerini indirir
 *  + Telefon genişliklerinde yatay taşma yok
 * Kullanım: npm run build && npm run e2e   (CHROMIUM_PATH ile tarayıcı yolu değiştirilebilir)
 */
import { createServer } from 'node:http';
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, resolve } from 'node:path';
import { chromium } from 'playwright-core';

const DIST = resolve(process.argv[2] ?? 'dist');
const BASE_PATH = '/cumaaa/yks/';
const CHROMIUM = process.env.CHROMIUM_PATH ?? (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png' };

if (!existsSync(join(DIST, 'index.html'))) {
  console.error(`Önce derle: ${DIST}/index.html yok (npm run build).`);
  process.exit(1);
}

// ---------- Statik sunucu (yayın klasörü test sırasında değiştirilebilir) ----------
let root = DIST;
const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (!url.pathname.startsWith(BASE_PATH)) {
    res.writeHead(404).end();
    return;
  }
  let rel = decodeURIComponent(url.pathname.slice(BASE_PATH.length)) || 'index.html';
  if (rel.endsWith('/')) rel += 'index.html';
  const file = join(root, rel);
  if (!file.startsWith(root) || !existsSync(file)) {
    res.writeHead(404).end('not found');
    return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;
const APP = ORIGIN + BASE_PATH;

const manifest = JSON.parse(readFileSync(join(DIST, 'build-manifest.json'), 'utf8'));
const CONTENT = new Set(manifest.content);
const isContent = (url) => CONTENT.has(url.split('/').pop().split('?')[0]);

// ---------- Yardımcılar ----------
const results = [];
let failures = 0;
async function step(name, fn) {
  const t0 = Date.now();
  try {
    await fn();
    results.push(`✓ ${name} (${Date.now() - t0} ms)`);
  } catch (e) {
    failures += 1;
    results.push(`✗ ${name}\n    ${String(e?.message ?? e).split('\n').slice(0, 4).join('\n    ')}`);
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const browser = await chromium.launch({ executablePath: CHROMIUM, args: ['--no-sandbox'] });
const context = await browser.newContext({
  acceptDownloads: true,
  viewport: { width: 393, height: 851 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36 Instagram 300.0',
});
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));
const contentRequests = [];
context.on('request', (r) => isContent(r.url()) && contentRequests.push(r.url().split('/').pop()));

async function tap(locator) {
  await locator.first().scrollIntoViewIfNeeded();
  await locator.first().click();
}
async function selectByLabel(label, value) {
  const sel = page.locator('label.field', { hasText: label }).locator('select').first();
  const ok = await sel.evaluate((el, v) => [...el.options].some((o) => o.value === v), value);
  assert(ok, `"${label}" listesinde "${value}" yok`);
  await sel.selectOption(value);
}
async function firstOptionValue(label) {
  const sel = page.locator('label.field', { hasText: label }).locator('select').first();
  const value = await sel.evaluate((el) => [...el.options].find((o) => o.value !== 'all')?.value);
  await sel.selectOption(value);
  return value;
}
async function onboard() {
  await page.goto(APP, { waitUntil: 'networkidle' });
  const name = page.locator('#main input').first();
  if (await name.count()) {
    await name.fill('Zeynep');
    for (let i = 0; i < 8; i++) {
      const btn = page.getByRole('button', { name: /Devam et|Profilimi oluştur/ });
      if (!(await btn.count())) break;
      await btn.first().click();
      await page.waitForTimeout(200);
    }
  }
}
async function waitQuestion(timeout = 20_000) {
  await page.locator('.options .option').first().waitFor({ state: 'visible', timeout });
}
async function startFromSetup() {
  await tap(page.getByTestId('start-test'));
  await page.waitForURL(/#\/test(\?|$)/, { timeout: 20_000 });
  await waitQuestion();
}

// ---------- Senaryolar ----------
await onboard();
// Service worker etkinleşip sayfayı kontrol etsin (G ve H için).
await page.evaluate(async () => {
  await navigator.serviceWorker?.ready;
});
await page.reload({ waitUntil: 'networkidle' });

await step('Testler ekranı açılırken hiçbir soru paketi indirilmez', async () => {
  contentRequests.length = 0;
  await page.goto(APP + '#/testler?sinav=TYT', { waitUntil: 'networkidle' });
  await page.getByTestId('start-test').waitFor({ timeout: 10_000 });
  await page.waitForTimeout(800);
  assert(contentRequests.length === 0, `Testler ekranı ${contentRequests.length} soru paketi indirdi: ${contentRequests.slice(0, 5).join(', ')}`);
  const text = await page.locator('#main').innerText();
  assert(/soru/.test(text) && !/Sorular sayılıyor/.test(text), 'Soru sayısı gösterilmiyor');
});

await step('A) Ana sayfa → tavşan → TYT Matematik → konu → 5 soru → 1. soru görünür', async () => {
  await page.goto(APP + '#/', { waitUntil: 'networkidle' });
  const rabbit = page.getByTestId('dock-tyt');
  if (await rabbit.count()) {
    await tap(rabbit);
    await page.waitForURL(/#\/testler\?sinav=TYT/, { timeout: 10_000 });
  } else {
    await page.goto(APP + '#/testler?sinav=TYT');
  }
  await page.getByTestId('start-test').waitFor();
  await selectByLabel('Ders', 'tyt-matematik');
  await firstOptionValue('Konu');
  await tap(page.locator('[aria-labelledby="count-l"] button', { hasText: /^5$/ }));
  contentRequests.length = 0;
  await startFromSetup();
  assert(contentRequests.length > 0, 'Soru paketi hiç indirilmedi');
  assert(contentRequests.every((f) => f.startsWith('tyt-matematik')), `Başka derslerin paketi indirildi: ${contentRequests.join(', ')}`);
  const bar = await page.locator('.runner-bar').innerText();
  assert(/Soru 1 \/ 5/.test(bar), `Beklenen "Soru 1 / 5", gelen: ${bar.slice(0, 80)}`);
});

await step('D) Soru cevaplanır → doğru/yanlış ve çözüm açılır', async () => {
  await tap(page.locator('.options .option'));
  await page.locator('.feedback').waitFor({ timeout: 5000 });
  const fb = await page.locator('.feedback').innerText();
  assert(/Doğru|Yanlış/.test(fb), 'Doğru/yanlış geri bildirimi yok');
  await tap(page.locator('.feedback summary'));
  await page.locator('.feedback details[open]').waitFor({ timeout: 3000 });
});

await step('E) İleri → sonraki soru açılır; Geri çalışır', async () => {
  await tap(page.getByRole('button', { name: /İleri/ }));
  await page.locator('.runner-bar', { hasText: 'Soru 2 / 5' }).waitFor({ timeout: 5000 });
  await waitQuestion();
  await tap(page.getByRole('button', { name: /Geri/ }));
  await page.locator('.runner-bar', { hasText: 'Soru 1 / 5' }).waitFor({ timeout: 5000 });
  await tap(page.getByRole('button', { name: /İleri/ }));
});

await step('F) Sayfa yenilenince devam eden test durur', async () => {
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('.runner-bar', { hasText: 'Soru 2 / 5' }).waitFor({ timeout: 15_000 });
  await waitQuestion();
});

await step('Testi bitir → sonuç ekranı', async () => {
  await tap(page.getByRole('button', { name: 'Bitir', exact: true }));
  await tap(page.locator('.modal').getByRole('button', { name: /Testi bitir/ }));
  await page.waitForURL(/#\/sonuc\//, { timeout: 10_000 });
  await page.getByText(/net/i).first().waitFor({ timeout: 10_000 });
});

await step('B) AYT → Fizik → 10 soru → soru açılır', async () => {
  await page.goto(APP + '#/testler?sinav=AYT', { waitUntil: 'networkidle' });
  const fox = page.getByTestId('dock-ayt');
  if (await fox.count()) {
    await page.goto(APP + '#/', { waitUntil: 'networkidle' });
    await tap(page.getByTestId('dock-ayt'));
    await page.waitForURL(/#\/testler\?sinav=AYT/, { timeout: 10_000 });
  }
  await page.getByTestId('start-test').waitFor();
  await selectByLabel('Ders', 'ayt-fizik');
  await tap(page.locator('[aria-labelledby="count-l"] button', { hasText: /^10$/ }));
  contentRequests.length = 0;
  await startFromSetup();
  assert(contentRequests.every((f) => f.startsWith('ayt-fizik')), `Başka derslerin paketi indirildi: ${contentRequests.join(', ')}`);
  const bar = await page.locator('.runner-bar').innerText();
  assert(/Soru 1 \/ 10/.test(bar), `Beklenen "Soru 1 / 10": ${bar.slice(0, 80)}`);
  await tap(page.locator('.runner-bar').getByRole('button', { name: /Testten çık/ }));
  await tap(page.locator('.modal').getByRole('button', { name: /Kaydetmeden kapat/ }));
});

let visitedTopic = '';
await step('C) Dersler → TYT Matematik → konu → konu sonu soruları → 1. soru görünür', async () => {
  await page.goto(APP + '#/dersler', { waitUntil: 'networkidle' });
  await tap(page.locator('a[href="#/ders/tyt-matematik"]'));
  await page.waitForURL(/#\/ders\/tyt-matematik/);
  const link = page.locator('a[href^="#/konu/"]').first();
  visitedTopic = (await link.getAttribute('href')).replace('#/konu/', '');
  contentRequests.length = 0;
  await tap(link);
  await page.waitForURL(/#\/konu\//);
  const q = page.locator('.inline-q').first();
  await q.waitFor({ timeout: 20_000 });
  await q.scrollIntoViewIfNeeded();
  assert(await q.locator('.option').first().isVisible(), 'Konu sonu sorusunun şıkları görünmüyor');
  const others = contentRequests.filter((f) => !f.startsWith('tyt-matematik'));
  assert(others.length === 0, `Konu sayfası başka derslerin paketini indirdi: ${others.join(', ')}`);
  await tap(q.locator('.option'));
  await q.locator('.feedback').waitFor({ timeout: 5000 });
});

await step('G) Çevrimdışıyken daha önce açılan konunun soruları açılır', async () => {
  await context.setOffline(true);
  try {
    await page.goto(APP + '#/', { waitUntil: 'domcontentloaded' });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.evaluate((t) => (location.hash = `#/konu/${t}`), visitedTopic);
    await page.locator('.inline-q .option').first().waitFor({ timeout: 20_000 });
  } finally {
    await context.setOffline(false);
  }
});

await step('Deneme raporu: hedef kaydı, sınav ve sonuç bağlantısı yenilemede korunur', async () => {
  await page.goto(APP + '#/denemeler?sinav=AYT', { waitUntil: 'networkidle' });
  await tap(page.getByRole('button', { name: 'Deneme', exact: true }));
  await tap(page.getByRole('dialog', { name: 'AYT denemesi ekle' }).getByRole('button', { name: 'Kapat', exact: true }));
  assert(page.url().endsWith('#/denemeler?sinav=AYT'), 'Formu kapatmak rapor bağlantısını değiştirdi');
  await tap(page.getByRole('button', { name: 'Deneme', exact: true }));
  const dialog = page.getByRole('dialog', { name: 'AYT denemesi ekle' });
  await dialog.getByRole('textbox', { name: 'Deneme adı', exact: true }).fill('Mobil AYT kontrolü');
  for (const [label, value] of [['Matematik doğru', '24'], ['Matematik yanlış', '12'], ['Fizik doğru', '7'], ['Fizik yanlış', '5'], ['Kimya doğru', '10'], ['Kimya yanlış', '3'], ['Biyoloji doğru', '10'], ['Biyoloji yanlış', '3']]) {
    await dialog.getByRole('spinbutton', { name: label, exact: true }).fill(value);
  }
  await tap(dialog.getByRole('button', { name: 'Kaydet', exact: true }));
  await page.waitForURL(/sinav=AYT&deneme=/);
  const reportUrl = page.url();
  await page.locator('.mock-net-pill').waitFor();
  assert((await page.locator('.mock-net-pill').innerText()).includes('45,25'), 'Deneme neti yanlış');
  await tap(page.getByRole('button', { name: 'Hedef belirle', exact: true }));
  const targetDialog = page.getByRole('dialog', { name: 'AYT net hedefim' });
  await targetDialog.getByRole('spinbutton', { name: 'Hedef net', exact: true }).fill('81');
  await tap(targetDialog.getByRole('button', { name: 'Hedefi kaydet', exact: true }));
  await targetDialog.getByRole('alert').waitFor();
  await targetDialog.getByRole('spinbutton', { name: 'Hedef net', exact: true }).fill('60');
  await tap(targetDialog.getByRole('button', { name: 'Hedefi kaydet', exact: true }));
  await page.getByText('Bu denemeye göre hedefe 14,75 net kaldı.', { exact: true }).waitFor();
  await page.reload({ waitUntil: 'networkidle' });
  assert(page.url() === reportUrl, 'Seçili sonuç bağlantısı kayboldu');
  await page.getByText('Bu denemeye göre hedefe 14,75 net kaldı.', { exact: true }).waitFor();
  await tap(page.getByRole('button', { name: 'Çalışma önerileri', exact: true }));
  await tap(page.getByRole('link', { name: 'AYT Fizik', exact: true }));
  await page.waitForURL(/#\/ders\/ayt-fizik/);
  await page.goBack({ waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'Mobil AYT kontrolü', exact: true }).waitFor();
});

await step('Telefon genişliklerinde yatay taşma yok', async () => {
  const sizes = [[320, 700], [360, 800], [375, 812], [393, 873], [412, 915], [430, 932]];
  const routes = ['#/', '#/testler?sinav=TYT', '#/dersler', `#/konu/${visitedTopic}`, '#/denemeler', '#/denemeler?sinav=AYT', '#/defterim', '#/pandam'];
  const bad = [];
  for (const [w, h] of sizes) {
    await page.setViewportSize({ width: w, height: h });
    for (const r of routes) {
      await page.goto(APP + r, { waitUntil: 'networkidle' });
      await page.locator(r === '#/pandam' ? '.pet-stage' : '#main h1').waitFor({ state: 'attached' });
      await page.evaluate(async () => {
        await document.fonts.ready;
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      if (sw > w + 1) {
        const overflow = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(el => !el.closest('.edge-friend')).map(el => {
          const rect = el.getBoundingClientRect();
          return { tag: el.tagName, cls: el.className, text: el.textContent?.slice(0, 90), right: Math.round(rect.right), width: Math.round(rect.width) };
        }).filter(el => el.right > innerWidth + 1).slice(0,20));
        bad.push(`${w}px ${r}: ${sw} ${JSON.stringify(overflow)}`);
      }
    }
  }
  await page.setViewportSize({ width: 393, height: 851 });
  assert(!bad.length, `Yatay taşma: ${bad.join('; ')}`);
});

// H) Yeni sürüm simülasyonu: bir soru paketinin adı (ve onu içe aktaran tüm zincir) değişir, eski ad 404 olur.
function simulateNewBuild(src, victimPrefix) {
  const dst = mkdtempSync(join(tmpdir(), 'yks-next-'));
  cpSync(src, dst, { recursive: true });
  const assets = join(dst, 'assets');
  const renamed = new Map();
  let frontier = readdirSync(assets).filter((f) => f.startsWith(victimPrefix) && f.endsWith('.js'));
  while (frontier.length) {
    const next = [];
    for (const f of frontier) {
      if (renamed.has(f)) continue;
      const nf = f.replace(/-([\w-]{6,})\.js$/, (_, h) => `-${h.slice(0, -2)}zz.js`);
      renameSync(join(assets, f), join(assets, nf));
      renamed.set(f, nf);
    }
    for (const file of [...readdirSync(assets).map((f) => join(assets, f)), join(dst, 'index.html'), join(dst, 'sw.js'), join(dst, 'build-manifest.json')]) {
      if (!/\.(js|html|json)$/.test(file)) continue;
      let code = readFileSync(file, 'utf8');
      let changed = false;
      for (const [o, n] of renamed) if (code.includes(o)) { code = code.split(o).join(n); changed = true; }
      if (changed) {
        writeFileSync(file, code);
        const base = file.split('/').pop();
        if (file.includes('/assets/') && !renamed.has(base) && ![...renamed.values()].includes(base)) next.push(base);
      }
    }
    frontier = next;
  }
  writeFileSync(join(dst, 'app-version.json'), JSON.stringify({ version: 'e2e-next' }));
  return dst;
}

await step('H) Yeni sürüm → eski paket hatası → tek yenileme → yeni sürüm açılır', async () => {
  const fizikTopic = await page.evaluate(() => null);
  void fizikTopic;
  await page.goto(APP + '#/', { waitUntil: 'networkidle' });
  const loads = [];
  page.on('load', () => loads.push(Date.now()));
  const next = simulateNewBuild(DIST, 'tyt-cografya');
  root = next;
  try {
    // Eski sayfa açıkken, henüz açılmamış bir konuya gidilir (paket artık sunucuda yok).
    await page.evaluate(() => (location.hash = '#/ders/tyt-cografya'));
    await page.locator('a[href^="#/konu/"]').first().waitFor();
    const href = await page.locator('a[href^="#/konu/"]').first().getAttribute('href');
    await page.evaluate((h) => (location.hash = h), href);
    await page.locator('.inline-q .option').first().waitFor({ timeout: 25_000 });
    assert(loads.length === 1, `Beklenen tek yenileme, olan: ${loads.length}`);
    const entry = await page.evaluate(() => document.querySelector('script[type="module"][src]')?.getAttribute('src'));
    assert(/zz\.js$/.test(entry ?? ''), `Yeni sürüme geçilmedi (giriş: ${entry})`);
  } finally {
    root = DIST;
    rmSync(next, { recursive: true, force: true });
  }
});

await step('Alt gezinme: kedi → denemeler, ayı → defter, tilki → AYT; panda menüyü açar ve kapatır', async () => {
  await page.goto(APP + '#/', { waitUntil: 'networkidle' });
  const bar = await page.locator('.mascot-dock').evaluate((el) => getComputedStyle(el).backgroundColor);
  assert(!/rgba\(0, 0, 0, 0\)|transparent/.test(bar), `Alt gezinme yüzeyi görünmüyor: ${bar}`);
  await tap(page.getByTestId('dock-deneme'));
  await page.waitForURL(/#\/denemeler/);
  await tap(page.getByTestId('dock-defter'));
  await page.waitForURL(/#\/defterim/);
  await tap(page.getByTestId('dock-ayt'));
  await page.waitForURL(/#\/testler\?sinav=AYT/);
  await tap(page.getByTestId('dock-panda'));
  await page.locator('.walker').waitFor({ timeout: 2000 });
  const dialog = page.getByRole('dialog', { name: 'Ana menü' });
  await dialog.waitFor({ timeout: 4000 });
  await tap(dialog.getByRole('button', { name: 'Diğer' }));
  await dialog.getByRole('link', { name: /Ayarlar/ }).waitFor();
  await dialog.getByRole('searchbox', {name:'Menüde ara'}).fill('akilli');
  await dialog.getByRole('link', {name:/Akıllı Koç/}).waitFor();
  assert(await dialog.getByRole('link').count() === 1, 'Menü araması filtrelemedi');
  await dialog.getByRole('button', {name:'Aramayı temizle'}).click();
  await tap(dialog.getByRole('button', { name: 'Menüyü kapat', exact: true }));
  await page.locator('.walker').waitFor({ state: 'detached', timeout: 4000 });
  assert(await page.locator('.dock-panda-seat').isVisible(), 'Panda yerine oturmadı');
});

await step('Defter: sayfa aç → çiz → fizik şablonu → PDF gerçekten indirilir', async () => {
  await page.goto(APP + '#/defterim', { waitUntil: 'networkidle' });
  await tap(page.getByRole('button', { name: /Yeni sayfa|İlk sayfanı aç/ }));
  await tap(page.locator('.modal').getByRole('button', { name: 'Oluştur' }));
  await page.waitForURL(/#\/defterim\/.+/);
  const canvas = page.locator('canvas.notebook-canvas').first();
  await canvas.waitFor();
  const box = await canvas.boundingBox();
  await page.mouse.move(box.x + 40, box.y + 60);
  await page.mouse.down();
  for (let i = 1; i <= 12; i++) await page.mouse.move(box.x + 40 + i * 15, box.y + 60 + (i % 2) * 8);
  await page.mouse.up();
  const ink = await canvas.evaluate((c) => {
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let n = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
    return n;
  });
  assert(ink > 50, 'Çizim tuvale işlenmedi');
  const originalPageUrl = page.url();
  await tap(page.getByRole('button', { name: '＋ Sayfa ekle', exact: true }));
  await page.waitForURL(url => url.toString() !== originalPageUrl);
  await page.getByRole('status').filter({hasText:'Kaydedildi'}).first().waitFor();
  await tap(page.getByRole('button', { name: '← Önceki', exact: true }));
  await page.waitForURL(originalPageUrl);
  await page.getByRole('status').filter({hasText:'Kaydedildi'}).first().waitFor();
  const restoredInk = await page.locator('canvas.notebook-canvas').first().evaluate(c => {
    const pixels=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
    let count=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>0)count++;
    return count;
  });
  assert(restoredInk===ink, 'Sayfa ekleyip geri dönünce el yazısı değişti');

  await tap(page.getByRole('button', { name: /Daha/ }));
  await tap(page.getByRole('button', { name: 'Hız–zaman' }));
  await page.getByText('Şablon eklendi').first().waitFor({ timeout: 3000 });
  await tap(page.getByRole('button', { name: /Daha/ }));
  const [download] = await Promise.all([page.waitForEvent('download', { timeout: 10_000 }), tap(page.getByRole('button', { name: /PDF indir/ }))]);
  const path = await download.path();
  const head = readFileSync(path).subarray(0, 8).toString('latin1');
  assert(head.startsWith('%PDF-1.4'), `PDF değil: ${head}`);
  assert(/\.pdf$/.test(download.suggestedFilename()), 'Dosya adı .pdf değil');
  // Gömülü sayfa görüntüsü geçerli bir JPEG olmalı ve tarayıcıda çizilebilmeli (kareli zemin + çizim).
  const pdf = readFileSync(path);
  const at = pdf.indexOf(Buffer.from('/DCTDecode'));
  const start = pdf.indexOf(Buffer.from('stream\n'), at) + 7;
  const end = pdf.indexOf(Buffer.from('\nendstream'), start);
  const jpeg = pdf.subarray(start, end);
  assert(jpeg[0] === 0xff && jpeg[1] === 0xd8 && jpeg[jpeg.length - 2] === 0xff && jpeg[jpeg.length - 1] === 0xd9, 'PDF içindeki görüntü geçerli JPEG değil');
  const dims = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = 'data:image/jpeg;base64,' + b64;
    await img.decode();
    return [img.naturalWidth, img.naturalHeight];
  }, jpeg.toString('base64'));
  assert(dims[0] === 900 && dims[1] > 500, `Beklenmeyen PDF sayfa görüntüsü: ${dims}`);
});

await step('Öğretmen öğrenme alanı ve defter aynı anda kullanılabilir', async () => {
  await page.goto(APP + '#/ogretmen?konu=aytkim-elektrokimya', {waitUntil:'networkidle'});
  await tap(page.getByRole('button',{name:'Adım adım öğrenmeye başla',exact:true}));
  await tap(page.getByRole('button',{name:'El yazısı defterini aç',exact:true}));
  const panel=page.getByRole('region',{name:'El yazısı defterim',exact:true});await panel.waitFor();
  await page.getByRole('button',{name:'2. Birlikte çöz',exact:true}).evaluate(el=>el.scrollIntoView({block:'start'}));
  await tap(page.getByRole('button',{name:'2. Birlikte çöz',exact:true}));
  const geometry=await panel.evaluate(el=>({height:el.getBoundingClientRect().height,top:el.getBoundingClientRect().top,viewport:innerHeight}));
  assert(geometry.height<geometry.viewport*.6 && geometry.top>geometry.viewport*.3,'Defter telefon ekranının tamamını kaplıyor');
  await tap(page.getByRole('button',{name:'Defteri kapat',exact:true}));
  await panel.waitFor({state:'detached'});
});

await step('Konu seviye kontrolü ve aynı sorunun defterini tekrar açma',async()=>{
  await page.goto(APP+'#/ogretmen?konu=aytkim-elektrokimya',{waitUntil:'networkidle'});
  const startLearning=page.getByRole('button',{name:'Adım adım öğrenmeye başla',exact:true});
  if(await startLearning.isVisible())await tap(startLearning);
  await tap(page.getByRole('button',{name:'Seviyemi kontrol et',exact:true}));
  const diagnostic=page.getByRole('region',{name:'Konu seviye kontrolü',exact:true});
  for(const article of await diagnostic.locator('.inline-q').all())await tap(article.locator('.option').first());
  assert(await diagnostic.getByText(/3\/3 doğru|2\/3 doğru|1\/3 doğru|0\/3 doğru/).count()>0,'Seviye sonucu gösterilmedi');
  const note=diagnostic.getByRole('button',{name:'✎ Defterde çöz',exact:true}).first();
  await tap(note);
  const panel=page.getByRole('region',{name:'El yazısı defterim',exact:true});await panel.waitFor();
  const selected=await panel.getByLabel('Açılacak defter sayfası').inputValue();
  const before=await panel.locator('select option').count();
  await tap(page.getByRole('button',{name:'Defteri kapat',exact:true}));await panel.waitFor({state:'detached'});
  await tap(note);await panel.waitFor();
  assert(await panel.getByLabel('Açılacak defter sayfası').inputValue()===selected,'Aynı sorunun defteri yeniden açılmadı');
  assert(await panel.locator('select option').count()===before,'Aynı soru için gereksiz yeni sayfa oluştu');
  await tap(page.getByRole('button',{name:'Defteri kapat',exact:true}));await panel.waitFor({state:'detached'});
});

async function pandaRoom(label){
 await tap(page.getByRole('button',{name:'Ev planını aç',exact:true}));
 await tap(page.getByRole('dialog',{name:'Ev planı',exact:true}).getByRole('button').filter({hasText:label}));
}
await step('Panda eşyalarla uyur, yemek yer ve odalara yürür',async()=>{
 await page.goto(APP+'#/pandam',{waitUntil:'networkidle'});
 assert(await page.locator('.pet-room-strip,.pet-game-actions,.pet-game-quick').count()===0,'Alt kontrol çubukları hâlâ var');
 await pandaRoom('Yatak');await tap(page.getByRole('button',{name:'Panda uyusun',exact:true}));
 await page.locator('.panda-bed-pose').waitFor({state:'visible',timeout:6000});
 assert(await page.getByRole('button',{name:'Panda uyuyor · lamba kapalı',exact:true}).isDisabled(),'Uyku lambası kapanmadı');
 await tap(page.getByRole('button',{name:'Bambu yatakta uyuyor · uyandır',exact:true}));
 await page.locator('.panda-bed-pose').waitFor({state:'detached'});
 await pandaRoom('Mutfak');await tap(page.getByRole('button',{name:'Bambu kasesinden Panda’yı besle',exact:true}));
 await page.locator('.activity-eating .panda-dining-pose').waitFor({state:'visible',timeout:6000});
 await page.locator('.panda-dining-pose').waitFor({state:'detached',timeout:12000});
});
await step('Her odanın eşyası gerçek rutini başlatır',async()=>{
 for(const [room,object,pose] of [['Salon','Koltukta dinlen','sofa'],['Çalışma','Panda ders çalışsın','desk'],['Banyo','Panda banyo yapsın','bath'],['Bahçe','Çiçeği sula','watering'],['Balkon','Balkonda dinlen','terrace']]){
  await pandaRoom(room);await tap(page.getByRole('button',{name:object,exact:true}));
  const model=page.locator('.room-pose-'+pose);await model.waitFor({state:'visible',timeout:6000});
  const fits=await model.evaluate(el=>{const r=el.getBoundingClientRect(),s=el.closest('.pet-stage').getBoundingClientRect();return r.left>=s.left-1&&r.right<=s.right+1;});assert(fits,room+' pozu ekranı aşıyor');
  if(pose!=='bath'){await tap(page.getByRole('button',{name:'Ayağa kalk',exact:true}));await model.waitFor({state:'detached'});}
 }
});
await step('Gardırop ve makyaj seçimi panda üzerinde görünür ve kaydedilir',async()=>{
 await pandaRoom('Yatak');await tap(page.getByRole('button',{name:'Gardırobu aç',exact:true}));
 await tap(page.getByRole('button',{name:'Pembe tulum',exact:true}));
 assert(await page.locator('.panda-dressing-preview [data-outfit="kiyafet-pembe"]').count()===1,'Kıyafet giyilmedi');
 await tap(page.getByRole('button',{name:'Hazırım · odaya dön',exact:true}));
 await pandaRoom('Banyo');await tap(page.getByRole('button',{name:'Makyaj aynasına otur',exact:true}));
 await tap(page.getByRole('button',{name:'Pembe yanaklar',exact:true}));
 assert(await page.locator('.panda-dressing-preview [data-makeup="makyaj-pembe"]').count()===1,'Makyaj görünmüyor');
 await tap(page.getByRole('button',{name:'Hazırım · odaya dön',exact:true}));
 await page.reload({waitUntil:'networkidle'});
 assert(await page.locator('.pet-stage-panda [data-outfit="kiyafet-pembe"]').count()===1,'Kıyafet kayboldu');
 assert(await page.locator('.pet-stage-panda [data-makeup="makyaj-pembe"]').count()===1,'Makyaj kayboldu');
});

await step('Öğretmen fotoğrafı: seç → öğretmen ekranında görünür → kaldır', async () => {
  // 1×1 piksel PNG
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  await page.goto(APP + '#/ayarlar', { waitUntil: 'networkidle' });
  const section = page.locator('section', { has: page.locator('#tphoto-h') });
  await section.locator('input[type=file]').setInputFiles({ name: 'cuma.png', mimeType: 'image/png', buffer: png });
  await section.locator('img.teacher-photo').waitFor({ timeout: 5000 });
  await page.goto(APP + '#/ogretmen', { waitUntil: 'networkidle' });
  await page.locator('.teacher-hero img.teacher-photo').waitFor({ timeout: 5000 });
  await page.goto(APP + '#/ayarlar', { waitUntil: 'networkidle' });
  await tap(section.getByRole('button', { name: 'Kaldır' }));
  await section.locator('img.teacher-photo').waitFor({ state: 'detached', timeout: 5000 });
  await page.goto(APP + '#/ogretmen', { waitUntil: 'networkidle' });
  assert((await page.locator('.teacher-hero img.teacher-photo').count()) === 0, 'Fotoğraf kaldırılmadı');
});

await step('Genel tekrar: 5 dakikalık tekrar (özet → formül → 3 kart → 5 soru) bitince sonraki tarih planlanır', async () => {
  // Uygulama sayfadan çıkarken durumu kaydettiği için veri, yeni belge yüklenmeden hemen önce (bir kez) yazılır.
  await context.addInitScript((topic) => {
    if (sessionStorage.getItem('e2eReview')) return;
    sessionStorage.setItem('e2eReview', '1');
    const k = 'iyikiYks.state.v3';
    const st = JSON.parse(localStorage.getItem(k));
    st.reviews = { ...(st.reviews || {}), [topic]: { topicId: topic, stage: 1, dueDay: '2020-01-01', history: [] } };
    localStorage.setItem(k, JSON.stringify(st));
  }, visitedTopic);
  await page.reload({ waitUntil: 'networkidle' });
  await page.goto(APP + '#/tekrar', { waitUntil: 'networkidle' });
  await tap(page.getByRole('link', { name: '5 dk tekrar' }));
  await page.waitForURL(/#\/tekrar\/.+/);
  await page.locator('.review-summary li').first().waitFor({ timeout: 15_000 });
  for (let i = 0; i < 3; i++) await tap(page.getByRole('button', { name: 'Devam' }));
  const qs = page.locator('.inline-q');
  await qs.first().waitFor({ timeout: 15_000 });
  const n = await qs.count();
  for (let i = 0; i < n; i++) await tap(qs.nth(i).locator('.option'));
  await tap(page.getByRole('button', { name: /Tekrarı bitir/ }));
  await page.waitForURL(/#\/tekrar$/);
  // Durum kısa bir gecikmeyle kaydedilir.
  await page.waitForFunction((topic) => (JSON.parse(localStorage.getItem('iyikiYks.state.v3')).reviews[topic]?.history ?? []).length > 0, visitedTopic, { timeout: 5000 }).catch(() => undefined);
  const r = await page.evaluate((topic) => JSON.parse(localStorage.getItem('iyikiYks.state.v3')).reviews[topic], visitedTopic);
  const today = await page.evaluate(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; });
  assert(r.lastReviewedDay === today && r.history.includes(today), `Tekrar kaydedilmedi: ${JSON.stringify(r)}`);
  assert(r.dueDay > today, `Sonraki tekrar ileri tarihe planlanmadı: ${r.dueDay}`);
});

await step('Sayfa hatası (pageerror) yok', async () => {
  const relevant = pageErrors.filter((m) => !/ResizeObserver/.test(m));
  assert(!relevant.length, relevant.slice(0, 3).join(' | '));
});

await browser.close();
server.close();
console.log(results.join('\n'));
console.log(failures ? `\nE2E: ${failures} senaryo BAŞARISIZ` : `\nE2E: ${results.length} senaryonun hepsi geçti`);
process.exit(failures ? 1 : 0);
