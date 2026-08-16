/* Command palette — Ctrl/⌘+K, "/" on desktop, a visible button on mobile.
 *
 * The index is built from what the page actually contains, so a result can
 * never point at something that is not there.
 */

import { $, h, clear, debounce } from "./core.js";
import { WHAT_I_DO, LAB, TOOLBOX, DISCOVER, IDENTITY } from "./data.js";
import { openModule } from "./lab.js";
import { openProject } from "./sections.js";

let root, input, results, closeBtn;
let index = [];
let current = [];
let active = 0;
let open = false;

const KIND = {
  section: "SECTION",
  project: "PROJECT",
  termux: "TERMUX",
  tool: "TOOL",
  note: "NOTE",
  action: "ACTION",
};

/* Fold Turkish characters so "ogren" matches "öğren". */
function fold(t) {
  return String(t).toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u")
    .replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c");
}

function score(q, text) {
  const a = fold(q);
  const b = fold(text);
  if (!a) return 0;
  if (b === a) return 1000;
  if (b.startsWith(a)) return 700 - b.length;
  const i = b.indexOf(a);
  if (i !== -1) return 500 - i - b.length * 0.1;
  let p = 0;
  for (const ch of a) {
    p = b.indexOf(ch, p);
    if (p === -1) return -1;
    p++;
  }
  return 190 - b.length * 0.1;
}

function goto(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function buildIndex(content) {
  const list = [];

  for (const d of DISCOVER) {
    list.push({
      kind: "section", title: d.label, sub: "bölüme git",
      keys: [d.id, d.label], run: () => goto(d.id),
    });
  }

  for (const p of content.projects) {
    list.push({
      kind: "project", title: p.title, sub: p.summary,
      keys: [p.kind, p.status, ...(p.tech || [])],
      run: () => openProject(p.id),
    });
  }
  for (const a of content.archive) {
    list.push({
      kind: "project", title: a.title, sub: a.note + " · arşiv",
      keys: ["arsiv", "archive"],
      run: () => openProject("archive:" + a.title),
    });
  }

  for (const m of LAB.modules) {
    list.push({
      kind: "termux", title: m.label, sub: `${m.level} · ${m.line}`,
      keys: [m.id, m.level, ...m.lessons.map((l) => l.command)],
      run: () => openModule(m.id),
    });
    for (const l of m.lessons) {
      list.push({
        kind: "termux", title: l.command, sub: l.desc,
        keys: [m.label, l.id],
        run: () => openModule(m.id),
      });
    }
  }

  for (const t of TOOLBOX) {
    list.push({
      kind: "tool", title: t.name, sub: t.use,
      keys: [t.kind], run: () => goto("toolbox"),
    });
  }

  for (const w of WHAT_I_DO) {
    list.push({
      kind: "note", title: w.label, sub: w.line,
      keys: w.tags, run: () => goto("whatido"),
    });
  }

  list.push(
    { kind: "action", title: "INSTAGRAM", sub: IDENTITY.handle, keys: ["ig", "takip"],
      run: () => window.open(IDENTITY.instagram, "_blank", "noopener") },
    { kind: "action", title: "CONTACT", sub: "mesaj bırak", keys: ["iletisim", "mesaj"],
      run: () => { const b = $("#contactBtn"); if (b) b.click(); } },
    { kind: "action", title: "SHARE", sub: "kopyala, paylaş, QR", keys: ["paylas", "qr"],
      run: () => goto("connect") },
  );

  index = list;
  return list;
}

function search(q) {
  if (!q.trim()) {
    return index.filter((i) => i.kind === "section").slice(0, 9);
  }
  const out = [];
  for (const item of index) {
    const best = Math.max(
      score(q, item.title),
      score(q, item.sub) * 0.55,
      score(q, (item.keys || []).join(" ")) * 0.6);
    if (best > 0) out.push({ ...item, score: best });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, 30);
}

function render(q) {
  clear(results);
  active = 0;
  current = search(q);

  if (!current.length) {
    results.appendChild(h("div", { class: "pal__empty" }, `"${q}" için sonuç yok.`));
    return;
  }

  results.appendChild(h("div", { class: "pal__grp" },
    q.trim() ? `${current.length} SONUÇ` : "BÖLÜMLER"));

  current.forEach((item, i) => {
    results.appendChild(h("button", {
      class: "pal__r" + (i === 0 ? " on" : ""),
      type: "button",
      onclick: () => { closePalette(); setTimeout(() => item.run(), 180); },
    },
      h("span", { class: "pal__k" }, KIND[item.kind] || item.kind),
      h("span", { class: "pal__b" },
        h("span", { class: "pal__t" }, item.title),
        item.sub ? h("span", { class: "pal__s" }, item.sub) : null)));
  });
}

function move(delta) {
  const nodes = results.querySelectorAll(".pal__r");
  if (!nodes.length) return;
  nodes[active] && nodes[active].classList.remove("on");
  active = (active + delta + nodes.length) % nodes.length;
  nodes[active].classList.add("on");
  nodes[active].scrollIntoView({ block: "nearest" });
}

export function openPalette() {
  if (open) return;
  open = true;
  root.hidden = false;
  requestAnimationFrame(() => root.classList.add("on"));
  document.body.classList.add("lock");
  input.value = "";
  render("");
  // Focusing on touch pops the keyboard over the results; only do it where a
  // hardware keyboard is likely.
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    setTimeout(() => input.focus(), 60);
  }
}

export function closePalette() {
  if (!open) return;
  open = false;
  root.classList.remove("on");
  document.body.classList.remove("lock");
  input.blur();
  setTimeout(() => { if (!open) root.hidden = true; }, 280);
}

export function isPaletteOpen() {
  return open;
}

export function initPalette(content) {
  root = $("#pal");
  input = $("#palInput");
  results = $("#palRes");
  closeBtn = $("#palClose");
  if (!root) return;

  buildIndex(content);

  const btn = $("#paletteBtn");
  if (btn) btn.addEventListener("click", openPalette);
  closeBtn.addEventListener("click", closePalette);

  root.addEventListener("click", (e) => { if (e.target === root) closePalette(); });

  input.addEventListener("input", debounce(() => render(input.value), 90));
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); move(1); return; }
    if (e.key === "ArrowUp") { e.preventDefault(); move(-1); return; }
    if (e.key === "Escape") { e.preventDefault(); closePalette(); return; }
    if (e.key === "Enter") {
      e.preventDefault();
      const item = current[active];
      if (!item) return;
      closePalette();
      setTimeout(() => item.run(), 180);
    }
  });

  document.addEventListener("keydown", (e) => {
    // On touch the input is deliberately not focused, so Escape never reaches
    // it — handle the close at document level too.
    if (e.key === "Escape" && open) { e.preventDefault(); closePalette(); return; }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      open ? closePalette() : openPalette();
      return;
    }
    if (e.key === "/" && !open) {
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      openPalette();
    }
  });
}
