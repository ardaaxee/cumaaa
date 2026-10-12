#!/usr/bin/env node
/**
 * İçerik dizini üretir (derleme ve test öncesi çalışır):
 * - her konunun soruları hangi soru dosyalarında → konu sayfası yalnız o dosyaları yükler
 * - her konunun konu anlatımı hangi dosyada
 * - konu başına soru sayıları (alt konu | zorluk | tip kırılımıyla) → Testler ekranı soru bankasını indirmeden sayar
 * Çıktı: src/data/contentIndex.generated.ts
 * Çalıştırma: node --experimental-strip-types scripts/gen-content-index.mjs
 */
import { readdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { basename, dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'src/data');
const out = join(dataDir, 'contentIndex.generated.ts');

async function load(dir) {
  const files = readdirSync(join(dataDir, dir)).filter((f) => f.endsWith('.ts')).sort();
  const mods = [];
  for (const f of files) mods.push([basename(f, '.ts'), await import(pathToFileURL(join(dataDir, dir, f)).href)]);
  return mods;
}

const questionIndex = {};
for (const [file, mod] of await load('questions')) {
  for (const q of mod.questions ?? []) {
    const t = (questionIndex[q.topic] ??= { f: [], n: 0, k: {} });
    if (!t.f.includes(file)) t.f.push(file);
    t.n += 1;
    // Alt konu kimliği konu kimliğiyle başlar; yer kazanmak için önek atılır ("-s2").
    const sub = (q.subtopic ?? '').startsWith(q.topic) ? q.subtopic.slice(q.topic.length) : q.subtopic ?? '';
    const key = `${sub}|${q.difficulty}|${q.type}`;
    t.k[key] = (t.k[key] ?? 0) + 1;
  }
}
const lessonFiles = {};
for (const [file, mod] of await load('lessons')) for (const l of mod.lessons ?? []) lessonFiles[l.topicId] = file;

const sortObj = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
const body = `// OTOMATİK ÜRETİLDİ — elle düzenleme. Kaynak: scripts/gen-content-index.mjs
/* eslint-disable */
/** Konu → { f: soru dosyaları, n: soru sayısı, k: "altKonuSoneki|zorluk|tip" → sayı (sonek: alt konu kimliğinden konu kimliği atılmış hali) } */
export const QUESTION_INDEX: Record<string, { f: string[]; n: number; k: Record<string, number> }> = ${JSON.stringify(
  sortObj(Object.fromEntries(Object.entries(questionIndex).map(([k, v]) => [k, { f: v.f, n: v.n, k: sortObj(v.k) }]))),
)};

/** Konu → konu anlatımı dosyası */
export const LESSON_FILES: Record<string, string> = ${JSON.stringify(sortObj(lessonFiles))};
`;
const prev = existsSync(out) ? readFileSync(out, 'utf8') : '';
if (prev !== body) writeFileSync(out, body);
const total = Object.values(questionIndex).reduce((n, t) => n + t.n, 0);
console.log(`İçerik dizini: ${Object.keys(questionIndex).length} konu, ${total} soru, ${Object.keys(lessonFiles).length} konu anlatımı${prev === body ? ' (değişmedi)' : ''}.`);
