#!/usr/bin/env node
/**
 * Android emülatör testinin web tarafı: tek bir tarayıcı kişisi canlı odaya girer.
 *   node scripts/live-peer.mjs watch <ODA> <sn>  → karşı tarafın (Android uygulaması) ekranı gelene kadar bekler
 *   node scripts/live-peer.mjs share <ODA> <sn>  → sahte ekranını <sn> saniye paylaşır
 * Başarıda 0, görüntü gelmezse 1 ile çıkar.
 */
import { BACKEND, joinRoom, launchBrowser, openPerson, startServer, waitAnyVideo } from './live-harness.mjs';

const [mode, room, secondsArg] = process.argv.slice(2);
const seconds = Number(secondsArg || 90);
if (!['watch', 'share'].includes(mode) || !/^[A-Z0-9]{12,24}$/.test(room ?? '')) {
  console.error('Kullanım: live-peer.mjs watch|share ODA [saniye]');
  process.exit(2);
}

const { app, close } = await startServer(process.env.LIVE_DIST ?? 'dist');
const browser = await launchBrowser();
const errors = [];
let code = 0;
try {
  const person = await openPerson(browser, app, mode === 'watch' ? 'Zeynep' : 'Cuma', { sharer: mode === 'share', errors });
  await joinRoom(person.page, app, room);
  console.log(`[web] odaya girildi (${BACKEND})`);
  if (mode === 'watch') {
    const path = await waitAnyVideo(person.page, seconds * 1000);
    console.log(`[web] Android ekranı görüldü: ${path}`);
  } else {
    await person.page.getByRole('button', { name: 'Ekranımı paylaş' }).click();
    console.log('[web] ekran paylaşılıyor');
    await person.page.waitForTimeout(seconds * 1000);
  }
  if (errors.length) throw new Error(errors.join('\n'));
} catch (e) {
  console.error(`[web] HATA: ${e?.message ?? e}`);
  code = 1;
} finally {
  await browser.close();
  close();
}
process.exit(code);
