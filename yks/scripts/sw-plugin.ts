import type { Plugin } from 'vite';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

/**
 * Hafif bir app-shell service worker üretir.
 * Büyük konu/soru chunk'ları install sırasında indirilmez; ilk ihtiyaçta runtime
 * cache'e girer. Bu, mobilde yüzlerce dosyalık cache.addAll kırılmasını önler.
 */
export function serviceWorkerPlugin(): Plugin {
  return {
    name: 'iyiki-service-worker',
    apply: 'build',
    generateBundle(_options, bundle) {
      const bundleEntries = Object.entries(bundle).filter(([file]) => !file.endsWith('.map'));
      const allFiles = bundleEntries.map(([file]) => file);

      const entryScripts = bundleEntries
        .filter(([, item]) => item.type === 'chunk' && item.isEntry)
        .map(([file]) => `./${file}`);
      const styles = bundleEntries
        .filter(([file]) => file.endsWith('.css'))
        .map(([file]) => `./${file}`);

      const critical = [...new Set(['./', './index.html', ...entryScripts, ...styles])];
      const staticFiles = [
        'manifest.webmanifest',
        'icon.svg',
        'icon-192.png',
        'icon-512.png',
        'icon-maskable-512.png',
        'apple-touch-icon.png',
      ];
      const precache = [...new Set([...critical, ...staticFiles.map((file) => `./${file}`)])];

      // Runtime chunk isimleri de sürüm karmasına katılır; yeni build yeni cache adı alır.
      const version = createHash('sha256')
        .update([...allFiles, ...staticFiles].sort().join('|'))
        .digest('hex')
        .slice(0, 12);

      const template = readFileSync(fileURLToPath(new URL('./sw-template.js', import.meta.url)), 'utf8');
      const source = template
        .replace('__VERSION__', version)
        .replace('__CRITICAL__', JSON.stringify(critical))
        .replace('__PRECACHE__', JSON.stringify(precache));

      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}
