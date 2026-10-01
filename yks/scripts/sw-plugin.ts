import type { Plugin, Rollup } from 'vite';
type OutputBundle = Rollup.OutputBundle;
type OutputChunk = Rollup.OutputChunk;
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

/** Soru ve konu anlatımı dosyalarından üretilen paketler (kurulumda indirilmez). */
export function isContentModule(id: string | null | undefined): boolean {
  return !!id && /\/src\/data\/(questions|lessons)\//.test(id.replace(/\\/g, '/'));
}

/** Giriş betiği ve onun statik olarak içe aktardığı (ilk açılışta zaten gereken) parçalar. */
function shellChunks(bundle: OutputBundle): { js: string[]; css: string[] } {
  const chunks = Object.values(bundle).filter((b): b is OutputChunk => b.type === 'chunk');
  const entry = chunks.find((c) => c.isEntry);
  const js = new Set<string>();
  const css = new Set<string>();
  const visit = (c: OutputChunk | undefined) => {
    if (!c || js.has(c.fileName)) return;
    js.add(c.fileName);
    for (const f of c.viteMetadata?.importedCss ?? []) css.add(f);
    for (const imp of c.imports) visit(chunks.find((x) => x.fileName === imp));
  };
  visit(entry);
  return { js: [...js], css: [...css] };
}

/**
 * Service worker üretir. Kurulumda yalnız uygulama kabuğu önbelleğe alınır;
 * sayfa parçaları ve soru/konu paketleri ilk kullanıldıklarında önbelleğe girer.
 */
export function serviceWorkerPlugin(): Plugin {
  return {
    name: 'iyiki-service-worker',
    apply: 'build',
    generateBundle(_options, bundle) {
      const staticFiles = ['theme-init.js', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
      const shell = shellChunks(bundle);
      const required = ['./index.html', ...shell.js.map((f) => `./${f}`), ...shell.css.map((f) => `./${f}`)];
      // Sayfa parçalarına ait CSS dosyaları isteğe bağlı (inmese de kurulum tamamlanır).
      const pageCss = Object.values(bundle)
        .filter((a) => a.type === 'asset' && a.fileName.endsWith('.css') && !shell.css.includes(a.fileName))
        .map((a) => `./${a.fileName}`);
      const optional = ['./', ...staticFiles.map((f) => `./${f}`), ...pageCss];
      const content = Object.values(bundle)
        .filter((b): b is OutputChunk => b.type === 'chunk' && isContentModule(b.facadeModuleId))
        .map((c) => c.fileName.split('/').pop()!)
        .sort();
      const contentSignature = Object.entries(bundle)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, item]) => {
          if (item.type === 'asset') {
            const body = typeof item.source === 'string' ? item.source : Buffer.from(item.source).toString('base64');
            return name + ':' + createHash('sha256').update(body).digest('hex');
          }
          return name + ':' + createHash('sha256').update(item.code).digest('hex');
        })
        .join('|');
      const version = createHash('sha256').update(contentSignature).digest('hex').slice(0, 12);
      const template = readFileSync(fileURLToPath(new URL('./sw-template.js', import.meta.url)), 'utf8');
      const source = template
        .replace('__VERSION__', version)
        .replace('__REQUIRED__', JSON.stringify(required))
        .replace('__OPTIONAL__', JSON.stringify(optional))
        .replace('__CONTENT__', JSON.stringify(content));
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
      this.emitFile({ type: 'asset', fileName: 'app-version.json', source: JSON.stringify({ version }) });
      this.emitFile({
        type: 'asset',
        fileName: 'build-manifest.json',
        source: JSON.stringify({ version, required, optional, content }, null, 1),
      });
    },
  };
}
