#!/usr/bin/env node
/**
 * Derleme bütünlük kontrolü: yayına çıkacak dist/ içinde eksik dosya varsa derleme başarısız sayılır.
 * - index.html'in yüklediği JS/CSS dosyaları
 * - tüm JS dosyalarındaki dinamik içe aktarma (soru/konu paketleri dahil) hedefleri
 * - service worker'ın zorunlu/isteğe bağlı kabuk dosyaları ve içerik listesi
 * - manifest simgeleri
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dist = resolve(process.argv[2] ?? 'dist');
const errors = [];
const must = (cond, msg) => cond || errors.push(msg);
const has = (rel) => existsSync(join(dist, rel.replace(/^\.\//, '')));
const read = (rel) => readFileSync(join(dist, rel), 'utf8');

must(has('index.html'), 'index.html yok');
const html = has('index.html') ? read('index.html') : '';
const htmlRefs = [...html.matchAll(/(?:src|href)="(\.\/[^"#?]+)"/g)].map((m) => m[1]);
must(htmlRefs.some((r) => /assets\/.+\.js$/.test(r)), 'index.html ana JS dosyasını yüklemiyor');
must(htmlRefs.some((r) => /assets\/.+\.css$/.test(r)), 'index.html ana CSS dosyasını yüklemiyor');
for (const r of htmlRefs) must(has(r), `index.html'deki dosya eksik: ${r}`);

// Index'ten ve SW listesinden ulaşılabilen her dosyanın içe aktarma hedefleri izlenir
// (eski sürümlerden kalan, artık kullanılmayan paketler kontrol dışı).
const IMPORT_RE = /["'`](?:\.\/|assets\/)([\w.-]+-[\w-]{6,}\.(?:js|css))["'`]/g;
const queue = htmlRefs.filter((r) => r.includes('assets/')).map((r) => r.split('/').pop());
if (has('build-manifest.json')) {
  const bm0 = JSON.parse(read('build-manifest.json'));
  queue.push(...bm0.content, ...bm0.required.filter((r) => r.includes('assets/')).map((r) => r.split('/').pop()));
}
const seen = new Set();
let targets = 0;
while (queue.length) {
  const f = queue.pop();
  if (seen.has(f)) continue;
  seen.add(f);
  if (!existsSync(join(dist, 'assets', f))) continue; // eksikse aşağıda/üstte raporlanır
  if (!f.endsWith('.js')) continue;
  for (const m of read(`assets/${f}`).matchAll(IMPORT_RE)) {
    targets += 1;
    if (!existsSync(join(dist, 'assets', m[1]))) must(false, `${f} içindeki içe aktarma hedefi eksik: assets/${m[1]}`);
    else queue.push(m[1]);
  }
}
const jsFiles = [...seen].filter((f) => f.endsWith('.js'));

must(has('sw.js'), 'sw.js yok');
must(has('build-manifest.json'), 'build-manifest.json yok');
if (has('build-manifest.json')) {
  const bm = JSON.parse(read('build-manifest.json'));
  for (const r of bm.required) must(has(r), `Service worker zorunlu dosyası eksik: ${r}`);
  for (const r of bm.optional) must(r === './' || has(r), `Service worker isteğe bağlı dosyası eksik: ${r}`);
  for (const c of bm.content) must(has(`assets/${c}`), `İçerik paketi eksik: ${c}`);
  must(bm.content.length > 0, 'İçerik paketi listesi boş');
  const sw = read('sw.js');
  must(!/__(VERSION|REQUIRED|OPTIONAL|CONTENT)__/.test(sw), 'sw.js şablonu doldurulmamış');
  // Kurulumda soru paketi indirilmemeli.
  for (const r of bm.required) must(!bm.content.includes(r.split('/').pop()), `Soru/konu paketi kurulumda indiriliyor: ${r}`);
}

if (has('manifest.webmanifest')) {
  const man = JSON.parse(read('manifest.webmanifest'));
  for (const icon of man.icons ?? []) must(has(icon.src), `Manifest simgesi eksik: ${icon.src}`);
} else errors.push('manifest.webmanifest yok');

if (errors.length) {
  console.error(`Derleme bütünlük kontrolü BAŞARISIZ (${errors.length}):\n- ` + errors.slice(0, 40).join('\n- '));
  process.exit(1);
}
console.log(`Derleme bütünlüğü tamam: ${htmlRefs.length} başlangıç dosyası, ${jsFiles.length} JS, ${targets} içe aktarma hedefi doğrulandı.`);
