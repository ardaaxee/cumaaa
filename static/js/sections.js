/* Section renderers: what I do, projects, now, toolbox.
 * Content comes from data.js and the server payload; this file holds no copy. */

import { $, h, clear, icon, formatDate } from "./core.js";
import { openDetail } from "./detail.js";
import { WHAT_I_DO, NOW, TOOLBOX } from "./data.js";

let content = null;

/* --- WHAT I DO ------------------------------------------------------------ */

function renderWhatIDo() {
  const host = $("#whatidoList");
  if (!host) return;
  clear(host);

  for (const item of WHAT_I_DO) {
    const panel = h("div", { class: "acc__panel" },
      h("div", { class: "acc__inner" },
        h("div", { class: "acc__wrap" },
          h("p", { class: "acc__body" }, item.body),
          h("div", { class: "acc__pts" },
            item.points.map((p) => h("div", { class: "acc__pt" }, p))),
          h("div", { class: "tags" }, item.tags.map((t) => h("span", { class: "tag" }, t))))));

    host.appendChild(h("div", { class: "acc__it rv", dataset: { acc: item.id } },
      h("button", {
        class: "acc__b",
        type: "button",
        "aria-expanded": "false",
        onclick: (e) => {
          const el = e.currentTarget.parentElement;
          const wasOpen = el.classList.contains("open");
          for (const sib of host.children) {
            sib.classList.remove("open");
            sib.querySelector(".acc__b").setAttribute("aria-expanded", "false");
          }
          if (!wasOpen) {
            el.classList.add("open");
            e.currentTarget.setAttribute("aria-expanded", "true");
          }
        },
      },
        h("span", { class: "acc__i" }, item.index),
        h("span", null,
          h("span", { class: "acc__t" }, item.label),
          h("span", { class: "acc__l" }, item.line)),
        h("span", { class: "acc__p" }, icon("i-plus", 14))),
      panel));
  }
}

/* --- PROJECTS ------------------------------------------------------------- */

function showProject(p) {
  openDetail({
    kind: "PROJE",
    title: p.title,
    summary: p.summary,
    specs: [
      ["STATUS", p.status],
      ["TYPE", p.kind],
      ["YEAR", p.year],
      ["TECH", String((p.tech || []).length)],
    ],
    blocks: [
      { key: "NE", text: p.what },
      { key: "NEDEN", text: p.why },
      p.highlights && p.highlights.length
        ? { key: "ÖNE ÇIKANLAR", list: p.highlights } : null,
      { key: "TECH", tags: p.tech || [] },
    ],
    actions: [
      p.demo ? { label: "OPEN", href: p.demo, primary: true } : null,
      p.repo ? { label: "KAYNAK", href: p.repo, external: true } : null,
    ].filter(Boolean),
  });
}

function showArchive(a) {
  openDetail({
    kind: "ARŞİV",
    title: a.title,
    summary: a.note,
    specs: [["STATUS", "arşiv"], ["TYPE", "repo"], ["YEAR", a.year]],
    blocks: [{
      key: "DURUM",
      text: "Arşivlenmiş depo. Olduğu gibi duruyor, geliştirilmiyor.",
    }],
    actions: [{ label: "DEPOYU AÇ", href: a.repo, primary: true, external: true }],
  });
}

/** Open a project by id — also used by the palette and the console. */
export function openProject(id) {
  const p = content.projects.find((x) => x.id === id);
  if (p) { showProject(p); return true; }
  const key = String(id).replace(/^archive:/, "");
  const a = content.archive.find((x) => x.title === key);
  if (a) { showArchive(a); return true; }
  return false;
}

function projectCard({ status, live, year, title, summary, tech, onOpen }) {
  const el = h("button", { class: "pj rv", type: "button", onclick: onOpen },
    h("span", { class: "pj__top" },
      h("span", { class: "pj__st" + (live ? " pj__st--live" : "") }, status),
      h("span", { class: "pj__yr" }, year)),
    h("span", { class: "pj__t" }, title),
    h("span", { class: "pj__s" }, summary),
    tech && tech.length
      ? h("span", { class: "pj__tech" }, tech.slice(0, 4).map((t) => h("span", { class: "tag" }, t)))
      : null,
    h("span", { class: "pj__foot" },
      h("span", { class: "pj__go" }, "OPEN", icon("i-arrow", 15))));

  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty("--cx", `${e.clientX - r.left}px`);
    el.style.setProperty("--cy", `${e.clientY - r.top}px`);
  });
  return el;
}

function renderProjects() {
  const host = $("#projectList");
  if (!host) return;
  clear(host);

  for (const p of content.projects) {
    host.appendChild(projectCard({
      status: p.status, live: true, year: p.year, title: p.title,
      summary: p.summary, tech: p.tech, onOpen: () => showProject(p),
    }));
  }
  for (const a of content.archive) {
    host.appendChild(projectCard({
      status: "arşiv", live: false, year: a.year, title: a.title,
      summary: a.note, tech: null, onOpen: () => showArchive(a),
    }));
  }
}

/* --- NOW ------------------------------------------------------------------ */

function renderNow() {
  const host = $("#nowGrid");
  if (!host) return;
  clear(host);

  const date = $("#nowDate");
  if (date && NOW.updated) date.textContent = formatDate(NOW.updated);

  for (const block of NOW.blocks) {
    host.appendChild(h("div", { class: "now__c rv" },
      h("div", { class: "now__k" }, h("i"), block.key),
      h("div", { class: "now__l" },
        block.items.map((it) => h("div", null,
          h("div", { class: "now__t" }, it.title),
          h("div", { class: "now__ln" }, it.line))))));
  }
}

/* --- TOOLBOX -------------------------------------------------------------- */

function renderToolbox() {
  const host = $("#toolGrid");
  const out = $("#toolOut");
  if (!host || !out) return;
  clear(host);

  let openId = null;

  const show = (tool) => {
    clear(out);
    out.hidden = false;
    out.appendChild(h("div", { class: "toolout__k" }, `${tool.name} · ${tool.kind}`));
    out.appendChild(h("p", { class: "toolout__b" }, tool.body));
  };

  TOOLBOX.forEach((tool) => {
    host.appendChild(h("button", {
      class: "tool rv",
      type: "button",
      dataset: { tool: tool.name },
      onclick: (e) => {
        const el = e.currentTarget;
        const same = openId === tool.name;
        for (const sib of host.children) sib.classList.remove("on");
        if (same) { openId = null; out.hidden = true; clear(out); return; }
        openId = tool.name;
        el.classList.add("on");
        show(tool);
      },
    },
      h("span", { class: "tool__bar" }, h("i"), h("i"), h("i"),
        h("span", { class: "tool__k" }, tool.kind)),
      h("span", { class: "tool__n" }, tool.name),
      h("span", { class: "tool__u" }, tool.use)));
  });
}

/* --- boot ----------------------------------------------------------------- */

export function initSections(bootContent) {
  content = bootContent;
  renderWhatIDo();
  renderProjects();
  renderNow();
  renderToolbox();
}
