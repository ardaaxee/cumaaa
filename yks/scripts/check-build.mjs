import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, '..');
const dist = resolve(appRoot, 'dist');
const problems = [];

function fail(message) {
  problems.push(message);
}

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else out.push(path);
  }
  return out;
}

function localPath(ref, fromFile = resolve(dist, 'index.html')) {
  const clean = ref.split(/[?#]/)[0];
  if (!clean || clean === '.' || clean === './') return null;
  if (/^(?:https?:|data:|blob:|mailto:|tel:|#)/i.test(clean)) return null;
  if (clean.startsWith('/')) return resolve(dist, clean.replace(/^\/+/, ''));
  return resolve(dirname(fromFile), clean);
}

if (!existsSync(dist)) {
  console.error('dist/ bulunamadı. Önce production build çalıştırılmalı.');
  process.exit(1);
}

const indexFile = resolve(dist, 'index.html');
if (!existsSync(indexFile)) fail('index.html yok');

if (existsSync(indexFile)) {
  const html = readFileSync(indexFile, 'utf8');
  for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
    const path = localPath(match[1], indexFile);
    if (path && !existsSync(path)) fail(`index.html eksik dosyaya işaret ediyor: ${match[1]}`);
  }
}

const files = walk(dist);
const jsFiles = files.filter((file) => file.endsWith('.js'));

for (const file of jsFiles) {
  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(/import\(\s*["']([^"']+\.js)["']\s*\)/g)) {
    const target = localPath(match[1], file);
    if (target && !existsSync(target)) {
      fail(`${relative(dist, file)} eksik dynamic import hedefliyor: ${match[1]}`);
    }
  }
}

const swFile = resolve(dist, 'sw.js');
if (!existsSync(swFile)) {
  fail('sw.js yok');
} else {
  const source = readFileSync(swFile, 'utf8');
  const precacheMatch = source.match(/const PRECACHE = (\[[^;]+\]);/);
  if (!precacheMatch) {
    fail('sw.js içinde PRECACHE listesi okunamadı');
  } else {
    try {
      const list = JSON.parse(precacheMatch[1]);
      for (const ref of list) {
        const path = localPath(ref, resolve(dist, 'index.html'));
        if (path && !existsSync(path)) fail(`Service worker eksik dosyayı precache ediyor: ${ref}`);
      }
      const precachedJs = list.filter((ref) => /\/assets\/.*\.js(?:$|\?)/.test(ref));
      if (precachedJs.length > 3) {
        fail(`Service worker çok fazla JS dosyasını install sırasında precache ediyor: ${precachedJs.length}`);
      }
    } catch {
      fail('sw.js PRECACHE JSON çözümlenemedi');
    }
  }
}

if (problems.length) {
  console.error('\nBUILD BÜTÜNLÜK HATALARI');
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(`build integrity OK: ${files.length} dosya, ${jsFiles.length} JS chunk`);
