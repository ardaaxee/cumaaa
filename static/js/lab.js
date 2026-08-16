/* TERMUX LAB — reading-and-reference learning surface.
 *
 * Nothing runs on the visitor's device. Every lesson is command + description
 * + example + copy, and progress is the visitor's own localStorage.
 */

import { $, h, clear, icon, store, copy, toast } from "./core.js";
import { LAB } from "./data.js";

const KEY = "lab:done";

function doneSet() {
  const raw = store.get(KEY, []);
  return new Set(Array.isArray(raw) ? raw : []);
}

export function lessonTotal() {
  return LAB.modules.reduce((n, m) => n + m.lessons.length, 0);
}

export function lessonDone() {
  const set = doneSet();
  let n = 0;
  for (const m of LAB.modules) for (const l of m.lessons) if (set.has(l.id)) n++;
  return n;
}

function syncProgress() {
  const total = lessonTotal();
  const done = lessonDone();
  const count = $("#labCount");
  const fill = $("#labFill");
  if (count) count.textContent = `${done} / ${total} COMPLETE`;
  if (fill) fill.style.width = total ? `${(done / total) * 100}%` : "0%";

  for (const m of LAB.modules) {
    const el = document.querySelector(`[data-mod="${m.id}"] .labmod__n`);
    if (!el) continue;
    const set = doneSet();
    const d = m.lessons.filter((l) => set.has(l.id)).length;
    el.textContent = `${d}/${m.lessons.length}`;
  }
}

function toggleLesson(id, node) {
  const set = doneSet();
  if (set.has(id)) set.delete(id);
  else set.add(id);
  store.set(KEY, Array.from(set));
  node.classList.toggle("done", set.has(id));
  node.querySelector(".lsn__done").setAttribute("aria-pressed", String(set.has(id)));
  syncProgress();
}

function buildLesson(lesson) {
  const set = doneSet();
  const node = h("div", { class: "lsn" + (set.has(lesson.id) ? " done" : "") });

  const mark = h("button", {
    class: "lsn__done",
    type: "button",
    "aria-pressed": String(set.has(lesson.id)),
    "aria-label": `${lesson.command} dersini tamamlandı olarak işaretle`,
    onclick: () => toggleLesson(lesson.id, node),
  }, h("span", null, icon("i-check", 11)));

  const example = h("pre", { class: "lsn__ex" }, lesson.example);
  example.appendChild(h("button", {
    class: "lsn__copy",
    type: "button",
    "aria-label": "Örneği kopyala",
    onclick: async (e) => {
      e.stopPropagation();
      const ok = await copy(lesson.example);
      toast(ok ? "kopyalandı" : "kopyalanamadı", ok ? "ok" : "err");
    },
  }, icon("i-copy", 15)));

  node.append(
    h("div", { class: "lsn__top" },
      h("code", { class: "lsn__cmd" }, lesson.command),
      mark),
    h("p", { class: "lsn__d" }, lesson.desc),
    example,
    lesson.note
      ? h("p", { class: "lsn__n" },
          lesson.warn ? h("b", null, "DİKKAT — ") : null,
          lesson.note)
      : null,
  );
  return node;
}

function buildModule(mod) {
  const set = doneSet();
  const done = mod.lessons.filter((l) => set.has(l.id)).length;

  const panel = h("div", { class: "labmod__panel" },
    h("div", { class: "labmod__inner" },
      h("div", { class: "labmod__list" }, mod.lessons.map(buildLesson))));

  const wrap = h("div", { class: "labmod rv", dataset: { mod: mod.id } },
    h("button", {
      class: "labmod__b",
      type: "button",
      "aria-expanded": "false",
      onclick: (e) => {
        const el = e.currentTarget.parentElement;
        const open = el.classList.toggle("open");
        e.currentTarget.setAttribute("aria-expanded", String(open));
      },
    },
      h("span", { class: "labmod__i" }, mod.index),
      h("span", { class: "labmod__body" },
        h("span", { class: "labmod__t" }, mod.label),
        h("span", { class: "labmod__l" }, mod.line),
        h("span", { class: "labmod__meta" },
          h("span", { class: "labmod__lv" }, mod.level),
          h("span", { class: "labmod__n" }, `${done}/${mod.lessons.length}`))),
      h("span", { class: "labmod__p" }, icon("i-plus", 13))),
    panel);

  return wrap;
}

/** Open a module and scroll to it — used by the palette and the console. */
export function openModule(id) {
  const el = document.querySelector(`[data-mod="${id}"]`);
  if (!el) return false;
  el.classList.add("open");
  const btn = el.querySelector(".labmod__b");
  if (btn) btn.setAttribute("aria-expanded", "true");
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  return true;
}

export function initLab() {
  const host = $("#labMods");
  if (!host) return;
  clear(host);
  LAB.modules.forEach((mod) => host.appendChild(buildModule(mod)));

  const note = $("#labNote");
  if (note) note.textContent = LAB.note;

  syncProgress();
}
