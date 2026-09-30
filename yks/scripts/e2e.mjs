import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright-core');
const executablePath = process.env.CHROMIUM_PATH || ['/usr/bin/chromium', '/usr/bin/google-chrome', '/opt/google/chrome/chrome'].find(existsSync);
if (!executablePath) throw new Error('Set CHROMIUM_PATH to a Chrome/Chromium executable.');
const base = 'http://127.0.0.1:4173/cumaaa/yks/';
const output = resolve('artifacts');
await mkdir(output, { recursive: true });
const server = spawn(process.execPath, ['scripts/serve-dist.mjs'], { stdio: 'inherit' });
let browser;
let page;
const errors = [];
const stateOf = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('iyikiYks.state.v3')));
const visit = async (page, route) => {
  await page.goto(base + '#' + route);
  await page.locator('#main').waitFor();
  await page.waitForFunction(() => !document.querySelector('#main .spinner'));
  assert.equal(await page.getByText('Bu sayfa şu an açılamadı.', { exact: true }).count(), 0, route);
};

try {
  for (let attempt = 0; ; attempt++) {
    try { if ((await fetch(base)).ok) break; } catch { /* server startup */ }
    if (attempt > 50) throw new Error('Preview server failed to start.');
    await new Promise((r) => setTimeout(r, 100));
  }
  browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1365, height: 950 } });
  // AI health checks use a deterministic fixture; core study functions must work independently of a remote AI server.
  await context.route('https://iyi-ki-yks.onrender.com/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ai: false, model: null }) }));
  page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(base);
  await page.getByLabel('Adın', { exact: true }).fill('Sürüm testi');
  const setupSteps = await page.locator('.onboarding-step').count();
  for (let i = 0; i < setupSteps - 1; i++) await page.getByRole('button', { name: 'Devam et', exact: true }).click();
  await page.getByRole('button', { name: 'Profilimi oluştur', exact: true }).click();
  await page.waitForURL(/#\/koc/);
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('iyikiYks.state.v3') || '{}').profile?.onboarded);
  assert.ok((await stateOf(page)).tasks.length > 0, 'Starter plan was not created');

  const routes = ['/', '/dersler', '/plan', '/denemeler', '/gelisim', '/yanlislar', '/tekrar', '/kartlar', '/formuller', '/defterim', '/ogretmen', '/pandam', '/canli', '/ayarlar', '/kaydedilenler', '/karne', '/koc', '/odak', '/kaynaklar', '/cikmis', '/rozetler', '/daha'];
  for (const route of routes) await visit(page, route);
  await visit(page, '/testler?ders=tyt-matematik');
  await page.getByRole('group', { name: 'Soru sayısı', exact: true }).getByRole('button', { name: '5', exact: true }).click();
  await page.getByRole('button', { name: 'Testi başlat', exact: true }).click();
  await page.waitForURL(/#\/test$/);
  await page.locator('.options button').first().click();
  await page.waitForFunction(() => Object.keys(JSON.parse(localStorage.getItem('iyikiYks.state.v3')).activeTest.answers).length > 0);
  const active = (await stateOf(page)).activeTest;
  await page.reload();
  await page.locator('.options button[aria-pressed="true"]').waitFor();
  assert.equal((await stateOf(page)).activeTest.id, active.id, 'Reload replaced active test');
  await page.getByRole('button', { name: 'Bitir', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Testi bitir', exact: true }).click();
  await page.waitForURL(/#\/sonuc\//);
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('iyikiYks.state.v3')).activeTest === null);
  const result = (await stateOf(page)).testResults.at(-1);
  assert.equal(result.correct + result.wrong + result.blank, 5);
  assert.equal(result.blank, 4);

  await visit(page, '/defterim');
  await page.getByRole('button', { name: 'Yeni sayfa', exact: true }).click();
  await page.getByRole('dialog').getByLabel('Başlık', { exact: true }).fill('Yedeklenen çizim');
  await page.getByRole('dialog').getByRole('button', { name: 'Oluştur', exact: true }).click();
  await page.waitForURL(/#\/defterim\//);
  const canvas = page.locator('canvas').first();
  await canvas.waitFor();
  const box = await canvas.boundingBox();
  await page.mouse.move(box.x + 30, box.y + 40);
  await page.mouse.down();
  await page.mouse.move(box.x + 100, box.y + 80, { steps: 10 });
  await page.mouse.up();
  await page.getByRole('button', { name: 'Kaydet', exact: true }).click();
  await page.getByText('Sayfa kaydedildi.', { exact: true }).waitFor();
  await visit(page, '/ayarlar');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Veriyi dışa aktar', exact: true }).click();
  const download = await downloadPromise;
  const backupPath = resolve(output, 'test-backup.json');
  await download.saveAs(backupPath);
  const backup = JSON.parse(await readFile(backupPath, 'utf8'));
  assert.equal(Object.keys(backup.notebookImages).length, 1, 'Notebook drawing missing from export');
  await page.locator('input[type="file"][accept="application/json,.json"]').setInputFiles(backupPath);
  await page.getByRole('dialog').getByRole('button', { name: 'Vazgeç', exact: true }).click();
  assert.equal((await stateOf(page)).notebookPages[0].id, backup.state.notebookPages[0].id, 'Cancel changed the notebook');
  await page.locator('input[type="file"][accept="application/json,.json"]').setInputFiles(backupPath);
  await page.getByRole('dialog').getByRole('button', { name: 'Yedeği geri yükle', exact: true }).click();
  await page.getByText(/Yedek içe aktarıldı/).waitFor();
  const restored = await stateOf(page);
  assert.notEqual(restored.notebookPages[0].id, backup.state.notebookPages[0].id);
  await visit(page, '/defterim/' + restored.notebookPages[0].id);
  await page.locator('canvas').first().waitFor();

  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  });
  await context.setOffline(true);
  await page.reload();
  await page.locator('canvas').first().waitFor();
  await visit(page, '/dersler');
  await page.getByText(/Çevrimdışı · dersler ve kayıtların hazır/).waitFor();
  await context.setOffline(false);
  await visit(page, '/');
  await page.screenshot({ path: resolve(output, 'desktop-home.png'), fullPage: true });

  const mobile = await browser.newContext({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true });
  const mobilePage = await mobile.newPage();
  mobilePage.on('pageerror', (error) => errors.push(error.message));
  await mobilePage.addInitScript((state) => localStorage.setItem('iyikiYks.state.v3', JSON.stringify(state)), restored);
  await visit(mobilePage, '/');
  assert.ok(await mobilePage.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Mobile home overflows horizontally');
  await mobilePage.screenshot({ path: resolve(output, 'mobile-home.png'), fullPage: true });
  await visit(mobilePage, '/ayarlar');
  await mobilePage.screenshot({ path: resolve(output, 'mobile-settings.png'), fullPage: true });
  assert.deepEqual(errors, [], 'Unhandled browser errors');
  console.log(`E2E passed: onboarding, ${routes.length} routes, test resume/results, notebook backup/cancel/restore, offline use, mobile layout.`);
} catch (error) {
  if (page && !page.isClosed()) {
    await page.screenshot({ path: resolve(output, 'failure.png'), fullPage: true }).catch(() => undefined);
    await writeFile(resolve(output, 'failure.json'), JSON.stringify({ error: String(error), url: page.url(), body: await page.locator('body').innerText().catch(() => '') }, null, 2));
  }
  throw error;
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
