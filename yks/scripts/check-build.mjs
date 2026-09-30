import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, sep } from 'node:path';

const root = resolve('dist');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const worker = readFileSync(resolve(root, 'sw.js'), 'utf8');
const version = JSON.parse(readFileSync(resolve(root, 'app-version.json'), 'utf8')).version;
assert.match(version, /^[a-f0-9]{12}$/);
assert.ok(worker.includes(version), 'Service worker and build version differ');
const precache = JSON.parse(worker.match(/const PRECACHE = (\[[^;]+\]);/)[1]);
for (const entry of precache) {
  const file = resolve(root, entry === './' ? 'index.html' : entry);
  assert.ok(file.startsWith(root + sep), `Unsafe precache path: ${entry}`);
  assert.ok(existsSync(file), `Missing offline file: ${entry}`);
}
for (const [, asset] of html.matchAll(/(?:src|href)="(\.\/assets\/[^\"]+)"/g)) {
  assert.ok(existsSync(resolve(root, asset)), `Missing entry asset: ${asset}`);
}
assert.ok(precache.some((path) => path.includes('questions') || path.includes('tyt-matematik')), 'Question bank missing from offline cache');
console.log(`Build verified: ${version}, ${precache.length} offline files.`);
