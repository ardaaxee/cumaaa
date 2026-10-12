#!/usr/bin/env node
/**
 * Canlı ekran paylaşımı uçtan uca testi: iki ayrı tarayıcı aynı odaya girer, biri ekranını paylaşır,
 * diğerinde görüntünün gerçekten aktığı doğrulanır.
 *   1) Doğrudan WebRTC: izleyenin <video> öğesine kareler gelir; paylaşım durunca bekleme ekranı döner.
 *   2) Ters yön / yeniden katılım: karşı taraf başka cihazdan girip paylaşınca görüntü gelir.
 *   3) Yedek yol: doğrudan bağlantı engellenir; ekran şifreli kareler hâlinde kanaldan gelir.
 * LIVE_BACKEND=real (varsayılan): gerçek Supabase Realtime. LIVE_BACKEND=fake: yerel sahte kanal.
 * Kullanım: npm run build && npm run e2e:live
 */
import {
  BACKEND,
  assert,
  joinRoom,
  launchBrowser,
  openPerson,
  relayFrames,
  roomCode,
  startServer,
  waitDirectVideo,
} from './live-harness.mjs';

const { app, close } = await startServer(process.argv[2] ?? 'dist');
const browser = await launchBrowser();
const errors = [];
const results = [];
let failures = 0;

async function step(name, fn) {
  const t0 = Date.now();
  try {
    await fn();
    results.push(`✓ ${name} (${Date.now() - t0} ms)`);
  } catch (e) {
    failures += 1;
    results.push(`✗ ${name}\n    ${String(e?.message ?? e).split('\n').slice(0, 20).join('\n    ')}`);
  }
}

const remoteCardText = (page) => page.locator('.live-video-card').first().innerText();

await step('Doğrudan bağlantı: Zeynep paylaşır, Cuma (Android tarayıcı) ekranı canlı görür, durunca bekleme ekranı döner', async () => {
  const room = roomCode();
  const zeynep = await openPerson(browser, app, 'Zeynep', { sharer: true, errors });
  const cuma = await openPerson(browser, app, 'Cuma', { mobile: true, errors });
  try {
    await Promise.all([joinRoom(zeynep.page, app, room), joinRoom(cuma.page, app, room)]);
    await zeynep.page.getByRole('button', { name: 'Ekranımı paylaş' }).click();
    await waitDirectVideo(cuma.page, 30_000);
    assert(/Canlı yayın alınıyor/.test(await remoteCardText(cuma.page)), 'İzleyende "Canlı yayın alınıyor" yok');
    await zeynep.page.waitForFunction(() => /seni canlı görüyor/.test(document.body.innerText), null, { timeout: 15_000 });
    assert((await cuma.page.locator('[data-testid="live-relay-frame"]').count()) === 0, 'Doğrudan bağlıyken yedek kare gösterildi');
    await zeynep.page.getByRole('button', { name: 'Paylaşımı durdur' }).click();
    await cuma.page.getByText('Ekran bekleniyor').waitFor({ timeout: 15_000 });
  } finally {
    await zeynep.context.close();
    await cuma.context.close();
  }
});

await step('Ters yön ve yeniden katılım: Cuma çıkıp bilgisayardan girer, paylaşır; Zeynep görür', async () => {
  const room = roomCode();
  const zeynep = await openPerson(browser, app, 'Zeynep', { mobile: true, errors });
  const cumaPhone = await openPerson(browser, app, 'Cuma', { mobile: true, errors });
  try {
    await Promise.all([joinRoom(zeynep.page, app, room), joinRoom(cumaPhone.page, app, room)]);
    await zeynep.page.waitForFunction(() => /İkiniz de çevrimiçi/.test(document.body.innerText), null, { timeout: 20_000 });
    await cumaPhone.context.close();
    const cumaPc = await openPerson(browser, app, 'Cuma', { sharer: true, errors });
    try {
      await joinRoom(cumaPc.page, app, room);
      await cumaPc.page.getByRole('button', { name: 'Ekranımı paylaş' }).click();
      await waitDirectVideo(zeynep.page, 30_000);
    } finally {
      await cumaPc.context.close();
    }
  } finally {
    await zeynep.context.close();
  }
});

await step('Yedek yol: doğrudan bağlantı kurulamazsa ekran şifreli karelerle akar', async () => {
  const room = roomCode();
  const zeynep = await openPerson(browser, app, 'Zeynep', { sharer: true, blockDirect: true, errors });
  const cuma = await openPerson(browser, app, 'Cuma', { mobile: true, blockDirect: true, errors });
  try {
    await Promise.all([joinRoom(zeynep.page, app, room), joinRoom(cuma.page, app, room)]);
    await zeynep.page.getByRole('button', { name: 'Ekranımı paylaş' }).click();
    const frames = await relayFrames(cuma.page, 3, 45_000);
    assert(frames >= 3, `İzleyende yalnız ${frames} yedek kare göründü (en az 3 bekleniyordu)`);
    assert(/yedek yoldan/.test(await remoteCardText(cuma.page)), 'İzleyende yedek yol etiketi yok');
    await zeynep.page.waitForFunction(() => /yedek yoldan gidiyor/.test(document.body.innerText), null, { timeout: 10_000 });
    await zeynep.page.getByRole('button', { name: 'Paylaşımı durdur' }).click();
    await cuma.page.getByText('Ekran bekleniyor').waitFor({ timeout: 15_000 });
  } finally {
    await zeynep.context.close();
    await cuma.context.close();
  }
});

await step('Sayfa hatası (pageerror) yok', async () => {
  assert(errors.length === 0, errors.join('\n'));
});

await browser.close();
close();
console.log(`\nCanlı paylaşım testi (${BACKEND}):`);
console.log(results.join('\n'));
if (failures) {
  console.error(`\n${failures} senaryo başarısız.`);
  process.exit(1);
}
console.log(`\nCanlı paylaşım: ${results.length} senaryonun hepsi geçti`);
