/* Walks every LAB lesson, runs a real solution in the sandbox, and asserts the
 * mission verifier accepts it. Run: node tools/test_lab.mjs  */

import { readFileSync } from "node:fs";
import { createVFS, verify } from "../static/js/vfs.js";

const lab = JSON.parse(readFileSync(new URL("../content/lab.json", import.meta.url)));
const vfs = createVFS(lab.home, lab.user);

/* A worked solution for each lesson, run in curriculum order. */
const SOLUTIONS = {
  pwd: ["pwd"],
  ls: ["ls -la"],
  cd: ["cd ~", "cd projects"],
  mkdir: ["cd ~", "mkdir lab"],
  touch: ["cd ~/lab", "touch notes.txt"],
  cat: ["echo termux > notes.txt", "cat notes.txt"],
  cp: ["cp notes.txt notes.bak"],
  mv: ["mv notes.bak yedek.txt"],
  rm: ["rm yedek.txt"],
  "echo-redirect": ["echo baslangic > log.txt", "echo devam >> log.txt"],
  grep: ["grep devam log.txt"],
  find: ["cd ~", 'find . -name "*.txt"'],
  pipe: ["cd ~/lab", "ls | grep txt"],
  pkg: ["pkg update", "pkg install python"],
  chmod: ["cd ~/lab", "touch script.sh", "chmod +x script.sh"],
  git: ["cd ~/lab", "git init", "git add .", 'git commit -m "ilk commit"'],
  python: [],
  node: [],
  storage: [],
  "proj-structure": ["cd ~", "mkdir -p site/static site/templates", "touch site/app.py"],
  flask: ["cd ~/site", 'echo "from flask import Flask" > app.py'],
  "proj-git-flow": [
    "cd ~/site", "git init", "git add .", 'git commit -m "proje iskeleti"',
    'echo "# site" > README.md', "git add README.md", 'git commit -m "readme eklendi"',
  ],
};

let pass = 0;
let fail = 0;

for (const track of lab.tracks) {
  console.log(`\n── ${track.label} ─────────────────────────────`);
  for (const lesson of track.lessons) {
    const script = SOLUTIONS[lesson.id];
    if (script === undefined) {
      console.log(`  ?? ${lesson.id.padEnd(16)} çözüm tanımlanmamış`);
      fail++;
      continue;
    }

    const errors = [];
    for (const line of script) {
      const result = vfs.run(line);
      for (const row of result.lines) {
        if (row.cls === "e") errors.push(`${line} -> ${row.text}`);
      }
    }

    const okCheck = verify(lesson.task.check, vfs);
    if (okCheck && !errors.length) {
      console.log(`  ok ${lesson.id.padEnd(16)} ${lesson.task.check.type}`);
      pass++;
    } else {
      console.log(`  XX ${lesson.id.padEnd(16)} ${lesson.task.check.type}`);
      if (!okCheck) console.log(`     doğrulama başarısız (cwd=${vfs.cwd})`);
      errors.forEach((e) => console.log(`     hata: ${e}`));
      fail++;
    }
  }
}

/* Interpreter behaviours the lessons teach but no single mission covers. */
console.log("\n── yorumlayıcı davranışları ───────────────");
const cases = [
  ["pipe zinciri", "cd ~/lab && true", null],
  ["wc -l boru", "cat log.txt | wc -l", "2"],
  ["grep -i", "grep -i DEVAM log.txt", "devam"],
  ["grep -n", "grep -n devam log.txt", "2:devam"],
  ["head -n 1", "head -n 1 log.txt", "baslangic"],
  ["tail -n 1", "tail -n 1 log.txt", "devam"],
  ["tree çalışır", "tree ~/site", "static"],
  ["üzerine yazma", "echo yeni > log.txt", null],
  ["üzerine yazıldı", "cat log.txt", "yeni"],
  ["rm dizin koruması", "rm ~/site", "-r"],
  ["bilinmeyen komut", "kediler", "bulunamadı"],
  ["emüle edilmeyen", "python app.py", "çalıştırılmaz"],
  ["kapanmamış tırnak", 'echo "acik', "tırnak"],
  ["cd yok", "cd /yokboyle", "yok"],
  ["git log --oneline", "cd ~/site && true", null],
];

for (const [label, line, expect] of cases) {
  if (line.includes("&&")) { vfs.run(line.split("&&")[0].trim()); continue; }
  const result = vfs.run(line);
  const text = result.lines.map((r) => r.text).join("\n");
  if (expect === null) { console.log(`  ok ${label}`); pass++; continue; }
  if (text.includes(expect)) { console.log(`  ok ${label.padEnd(22)} "${text.split("\n")[0].slice(0, 40)}"`); pass++; }
  else { console.log(`  XX ${label.padEnd(22)} beklenen "${expect}", gelen "${text.slice(0, 60)}"`); fail++; }
}

const logResult = vfs.run("git log --oneline");
const logText = logResult.lines.map((r) => r.text).join("\n");
if (logText.includes("readme eklendi") && logText.includes("proje iskeleti")) {
  console.log("  ok git geçmişi sıralı"); pass++;
} else {
  console.log(`  XX git geçmişi: ${logText}`); fail++;
}

console.log(`\n${pass} geçti, ${fail} başarısız`);
process.exit(fail ? 1 : 0);
