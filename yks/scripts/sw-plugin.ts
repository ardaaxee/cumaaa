import type { Plugin } from 'vite';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

/**
 * Derlenen tüm dosyaları önbelleğe alan service worker üretir.
 * Uygulama kabuğu, konular, sorular ve kayıtlı veriler çevrimdışı çalışır.
 */
export function serviceWorkerPlugin(): Plugin {
  return {
    name: 'iyiki-service-worker',
    apply: 'build',
    generateBundle(_options, bundle) {
      const files = Object.keys(bundle).filter((f) => !f.endsWith('.map'));
      const staticFiles = ['manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
      const precache = ['./', './index.html', ...[...files, ...staticFiles].map((f) => `./${f}`)];
      const unique = [...new Set(precache)];
      const version = createHash('sha256').update(unique.join('|')).digest('hex').slice(0, 12);
      const template = readFileSync(fileURLToPath(new URL('./sw-template.js', import.meta.url)), 'utf8');
      const source = template
        .replace('__VERSION__', version)
        .replace('__PRECACHE__', JSON.stringify(unique));
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}
