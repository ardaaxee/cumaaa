import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, '..');
const base = 'http://127.0.0.1:4173';

const chromeCandidates = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
  process.env.CHROME_BIN,
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

const executablePath = chromeCandidates.find((path) => existsSync(path));
if (!executablePath) {
  console.error('E2E için Chrome/Chromium bulunamadı. PLAYWRIGHT_CHROMIUM_EXECUTABLE ayarla.');
  process.exit(1);
}

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4173'], {
  cwd: appRoot,
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: process.platform === 'win32',
});

let serverLog = '';
server.stdout.on('data', (chunk) => {
  serverLog += String(chunk);
});
server.stderr.on('data', (chunk) => {
  serverLog += String(chunk);
});

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(base);
      if (response.ok) return;
    } catch {
      // preview henüz başlamadı
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 250));
  }
  throw new Error(`Preview başlamadı.\n${serverLog}`);
}

const seed = {
  schemaVersion: 3,
  profile: {
    onboarded: true,
    name: 'E2E',
    grade: '12. sınıf',
    field: 'Sayısal',
    dailyQuestionGoal: 60,
    dailyStudyMinutes: 180,
    tytTarget: null,
    aytTarget: null,
    hardestSubject: '',
    examDate: '',
  },
};

async function makePage(browser) {
  const context = await browser.newContext({ viewport: { width: 393, height: 873 } });
  await context.addInitScript((state) => {
    localStorage.setItem('iyikiYks.state.v3', JSON.stringify(state));
    sessionStorage.clear();
  }, seed);
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  return { context, page, pageErrors };
}

async function assertQuestionOpened(page) {
  try {
    await page.getByText(/Soru 1 \/ \d+/).waitFor({ timeout: 20_000 });
    await page.locator('.question-text').waitFor({ timeout: 20_000 });
    const options = page.locator('.option');
    if ((await options.count()) < 5) throw new Error('Soru seçenekleri açılmadı.');
  } catch (error) {
    const body = (await page.locator('body').innerText()).slice(0, 5000);
    const stored = await page.evaluate(() => localStorage.getItem('iyikiYks.state.v3'));
    throw new Error(`Soru ekranı açılmadı. URL=${page.url()}\nBODY:\n${body}\nSTORAGE:\n${stored?.slice(0, 5000)}\nORIGINAL: ${error}`);
  }
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  // TYT Matematik: setup -> test -> soru -> çözüm -> reload sonrası devam.
  {
    const { context, page, pageErrors } = await makePage(browser);
    await page.goto(`${base}/#/testler?sinav=TYT`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Test oluştur' }).waitFor();
    await page.locator('.form-grid.two label.field select').nth(1).selectOption('tyt-matematik');
    const start = page.getByRole('button', { name: 'Testi başlat' });
    await start.click();
    await assertQuestionOpened(page);
    await page.locator('.option').first().click();
    await page.locator('.feedback').waitFor({ timeout: 10_000 });
    await page.reload({ waitUntil: 'networkidle' });
    await assertQuestionOpened(page);
    if (pageErrors.length) throw new Error(`TYT sayfa hatası: ${pageErrors.join(' | ')}`);
    await context.close();
  }

  // AYT Fizik: yalnız gerekli paketler yüklenerek soru açılmalı.
  {
    const { context, page, pageErrors } = await makePage(browser);
    await page.goto(`${base}/#/testler?sinav=AYT`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Test oluştur' }).waitFor();
    await page.locator('.form-grid.two label.field select').nth(1).selectOption('ayt-fizik');
    await page.getByRole('button', { name: 'Testi başlat' }).click();
    await assertQuestionOpened(page);
    if (pageErrors.length) throw new Error(`AYT sayfa hatası: ${pageErrors.join(' | ')}`);
    await context.close();
  }

  // Konu sayfası: konu sonu soruları tüm ders bankasını beklemeden açılmalı.
  {
    const { context, page, pageErrors } = await makePage(browser);
    await page.goto(`${base}/#/konu/tytmat-temel-kavramlar`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Konu sonu soruları' }).waitFor({ timeout: 20_000 });
    await page.locator('#konu-sonu .option').first().waitFor({ timeout: 20_000 });
    if (pageErrors.length) throw new Error(`Konu sayfası hatası: ${pageErrors.join(' | ')}`);
    await context.close();
  }

  console.log('E2E OK: TYT test, AYT test, aktif test yenileme ve konu sonu soruları açılıyor.');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
