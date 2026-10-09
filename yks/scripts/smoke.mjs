#!/usr/bin/env node
/**
 * Yayın sonrası duman testi. Canlı adrese ya da yayınlanan klasörün birebir kopyasına karşı çalışır:
 *   node scripts/smoke.mjs https://ardaaxee.github.io/cumaaa/yks/
 *   node scripts/smoke.mjs ./gh-pages-kopyasi/yks        (yerel sunucuyla /cumaaa/yks/ altında sunar)
 * Her derste 5 soruluk test başlatır ve 1. sorunun şıklarının göründüğünü doğrular; bir konu sonu sorusunu açar.
 */
import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { chromium } from 'playwright-core';

const target = process.argv[2] ?? 'https://ardaaxee.github.io/cumaaa/yks/';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png' };
let APP = target;
let server;
if (!/^https?:/.test(target)) {
  const root = resolve(target);
  server = createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname.replace('/cumaaa/yks/', '')) || 'index.html';
    const f = join(root, rel);
    if (!existsSync(f) || !f.startsWith(root)) return res.writeHead(404).end();
    res.writeHead(200, { 'Content-Type': TYPES[extname(f)] ?? 'application/octet-stream' });
    res.end(readFileSync(f));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  APP = `http://127.0.0.1:${server.address().port}/cumaaa/yks/`;
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined), args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 393, height: 851 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const missing = [];
page.on('response', (r) => r.status() === 404 && r.url().includes('/assets/') && missing.push(r.url()));
const out = [];
let failed = 0;

await page.goto(APP, { waitUntil: 'networkidle' });
const name = page.locator('#main input').first();
if (await name.count()) {
  await name.fill('Duman');
  for (let i = 0; i < 8; i++) {
    const b = page.getByRole('button', { name: /Devam et|Profilimi oluştur/ });
    if (!(await b.count())) break;
    await b.first().click();
    await page.waitForTimeout(200);
  }
}

for (const [exam, subject] of [['TYT', 'tyt-matematik'], ['AYT', 'ayt-matematik'], ['AYT', 'ayt-fizik'], ['TYT', 'tyt-turkce'], ['TYT', 'tyt-fizik']]) {
  try {
    await page.goto(`${APP}#/testler?sinav=${exam}`, { waitUntil: 'networkidle' });
    await page.locator('label.field', { hasText: 'Ders' }).locator('select').first().selectOption(subject);
    await page.locator('[aria-labelledby="count-l"] button', { hasText: /^5$/ }).click();
    const start = page.getByTestId('start-test').or(page.getByRole('button', { name: 'Testi başlat' }));
    await start.first().click();
    await page.locator('.options .option').first().waitFor({ timeout: 20_000 });
    const bar = await page.locator('.runner-bar').innerText();
    if (!/Soru 1 \/ 5/.test(bar)) throw new Error(`beklenmeyen: ${bar.slice(0, 60)}`);
    out.push(`✓ ${exam} ${subject}: 5 soruluk test açıldı, 1. soru görünür`);
    await page.locator('.runner-bar').getByRole('button', { name: /Testten çık/ }).click();
    await page.locator('.modal').getByRole('button', { name: /Kaydetmeden kapat/ }).click();
  } catch (e) {
    failed += 1;
    out.push(`✗ ${exam} ${subject}: ${String(e.message).split('\n')[0]}`);
  }
}

try {
  await page.goto(`${APP}#/ders/tyt-matematik`, { waitUntil: 'networkidle' });
  await page.locator('a[href^="#/konu/"]').first().click();
  await page.locator('.inline-q .option').first().waitFor({ timeout: 20_000 });
  out.push('✓ Dersler → konu → konu sonu sorusu açıldı');
} catch (e) {
  failed += 1;
  out.push(`✗ Konu sonu sorusu: ${String(e.message).split('\n')[0]}`);
}
if (missing.length) {
  failed += 1;
  out.push(`✗ 404 paket: ${missing.slice(0, 3).join(', ')}`);
} else out.push('✓ Hiçbir paket 404 vermedi');

await browser.close();
server?.close();
console.log(`Duman testi: ${APP}\n${out.join('\n')}`);
process.exit(failed ? 1 : 0);
