// Builds the game as ONE self-contained HTML fragment for an Artifact page.
//
// Artifacts serve a page under a strict CSP with no external hosts, and wrap
// the file in their own <!doctype>/<head>/<body>, so the output here is body
// content only, with every byte of JS and CSS inlined. The co-op server is
// unreachable from that origin, so the published page is the single-player
// route (the menu's PLAY) — CREATE/JOIN HOME still need a real server.
import { build } from 'vite'
import react from '@vitejs/plugin-react'
import { readFile, writeFile, rm, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const OUT_DIR = join(ROOT, 'dist-artifact')
const OUT_FILE = join(ROOT, 'dist-artifact', 'cuma-home.html')

await rm(OUT_DIR, { recursive: true, force: true })
await mkdir(OUT_DIR, { recursive: true })

await build({
  root: ROOT,
  configFile: false,
  plugins: [react()],
  logLevel: 'warn',
  build: {
    target: 'es2020',
    outDir: OUT_DIR,
    emptyOutDir: false,
    chunkSizeWarningLimit: 4000,
    // One chunk: a dynamic import cannot be inlined into a single <script>.
    rollupOptions: { output: { inlineDynamicImports: true } },
    // Fold every image/font the bundle references into data: URIs.
    assetsInlineLimit: 100 * 1024 * 1024,
    cssCodeSplit: false,
  },
})

const html = await readFile(join(OUT_DIR, 'index.html'), 'utf8')

// Pull the built asset names out of the generated index.html rather than
// guessing at hashes.
const jsName = html.match(/src="\/assets\/([^"]+\.js)"/)?.[1]
const cssName = html.match(/href="\/assets\/([^"]+\.css)"/)?.[1]
if (!jsName) throw new Error('no built script found in index.html')

const js = await readFile(join(OUT_DIR, 'assets', jsName), 'utf8')
const css = cssName ? await readFile(join(OUT_DIR, 'assets', cssName), 'utf8') : ''

// A literal </script> anywhere in a string in the bundle would close the tag.
const safeJs = js.replace(/<\/script/gi, '<\\/script')

const page = `<title>CUMA HOME</title>
<style>
  /* The game owns the whole viewport and commits to its own dark interior —
     ink-950 ground, accent cyan, JetBrains Mono — so this page is deliberately
     single-theme and paints that ground itself rather than borrowing the
     host's. */
  html, body { margin: 0; height: 100%; background: #07090d; color: #e8ecf3; }
  body { overflow: hidden; overscroll-behavior: none; }
  #root { position: fixed; inset: 0; }
  /* Shown only while the bundle parses; React clears it on first render. */
  #preboot {
    position: absolute; inset: 0; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 0.9rem;
    font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
  }
  #preboot .mark {
    font-size: 0.95rem; letter-spacing: 0.42em; text-indent: 0.42em;
    color: #39d4e6; animation: preboot-pulse 2.1s ease-in-out infinite;
  }
  #preboot .sub { font-size: 0.66rem; letter-spacing: 0.24em; color: rgba(232, 236, 243, 0.32); }
  @keyframes preboot-pulse { 0%, 100% { opacity: 0.5 } 50% { opacity: 1 } }
  @media (prefers-reduced-motion: reduce) { #preboot .mark { animation: none } }
</style>
<style>${css}</style>
<div id="root"><div id="preboot"><div class="mark">CUMA HOME</div><div class="sub">LOADING</div></div></div>
<script type="module">${safeJs}</script>
`

await writeFile(OUT_FILE, page, 'utf8')
const mb = (Buffer.byteLength(page) / 1024 / 1024).toFixed(2)
console.log(`wrote ${OUT_FILE} (${mb} MB)`)
