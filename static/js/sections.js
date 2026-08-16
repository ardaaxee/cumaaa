/* Section renderers: system status, what I do, Termux lab, projects, now,
 * toolbox. Content comes from data.js (editable) and the server payload. */

import { $, h, clear, icon, formatDate } from "./core.js";
import { openModal } from "./modal.js";
import { WHAT_I_DO, LAB, NOW, TOOLBOX } from "./data.js";

let content = null;

/* --- 2. SYSTEM STATUS -----------------------------------------------------
 * No API call, but no invented values either: everything below is read from
 * the device or from the build itself.
 * ------------------------------------------------------------------------ */

function renderStatus() {
  const host = $("#statusGrid");
  if (!host) return;

  const card = (kind, key, valueNode, extra) =>
    h("div", { class: "stat__c rv" },
      h("span", { class: "stat__k" }, key),
      extra || null,
      valueNode,
      kind ? h("span", { class: `stat__led${kind === "warn" ? " stat__led--warn" : ""}` }) : null);

  const online = navigator.onLine;
  const onlineVal = h("span", { class: "stat__v", id: "stOnline" },
    online ? "ONLINE" : "OFFLINE");

  const bars = h("span", { class: "stat__bars" },
    h("i"), h("i"), h("i"), h("i"), h("i"));

  const clockVal = h("span", { class: "stat__v", id: "stClock" }, "--:--:--");

  // Node label from the real timezone, not a made-up location.
  let zone = "LOCAL";
  try {
    zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "LOCAL";
  } catch { /* keep fallback */ }
  const nodeName = zone.split("/").pop().replace(/_/g, " ").toUpperCase();

  clear(host);
  host.appendChild(card(online ? "ok" : "warn", "CONNECTION", onlineVal, bars));
  host.appendChild(card("ok", "SYSTEM",
    h("span", { class: "stat__v", id: "stSystem" }, "STABLE")));
  host.appendChild(card(null, "LOCAL NODE",
    h("span", { class: "stat__v stat__v--sm" }, nodeName)));
  host.appendChild(card(null, "BUILD",
    h("span", { class: "stat__v" }, "2026")));
  host.appendChild(card(null, "CURRENT TIME", clockVal));
  host.appendChild(card(null, "VIEWPORT",
    h("span", { class: "stat__v stat__v--sm", id: "stView" },
      `${window.innerWidth}×${window.innerHeight}`)));

  const tick = () => {
    const el = $("#stClock");
    if (!el) return;
    el.textContent = new Date().toLocaleTimeString("tr-TR", { hour12: false });
  };
  tick();
  setInterval(tick, 1000);

  const syncOnline = () => {
    const el = $("#stOnline");
    if (!el) return;
    el.textContent = navigator.onLine ? "ONLINE" : "OFFLINE";
    const led = el.parentElement.querySelector(".stat__led");
    if (led) led.classList.toggle("stat__led--warn", !navigator.onLine);
  };
  window.addEventListener("online", syncOnline);
  window.addEventListener("offline", syncOnline);

  window.addEventListener("resize", () => {
    const el = $("#stView");
    if (el) el.textContent = `${window.innerWidth}×${window.innerHeight}`;
  });

  // "SYSTEM STABLE" is only claimed while nothing has actually thrown.
  window.addEventListener("error", () => {
    const el = $("#stSystem");
    if (el) el.textContent = "DEGRADED";
  });
}

/* --- 3. WHAT I DO --------------------------------------------------------- */

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
          h("div", { class: "tags" },
            item.tags.map((t) => h("span", { class: "tag" }, t))))));

    const wrap = h("div", { class: "acc__it rv" },
      h("button", {
        class: "acc__b",
        type: "button",
        "aria-expanded": "false",
        onclick: (e) => {
          const el = e.currentTarget.parentElement;
          const isOpen = el.classList.contains("open");
          for (const sib of host.children) {
            sib.classList.remove("open");
            sib.querySelector(".acc__b").setAttribute("aria-expanded", "false");
          }
          if (!isOpen) {
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
      panel);

    host.appendChild(wrap);
  }
}

/* --- 4. TERMUX LAB -------------------------------------------------------- */

function labReference() {
  /* Real, safe command reference drawn from the curriculum file. */
  const lab = content.lab;
  if (!lab || !lab.tracks) return null;
  const rows = [];
  for (const track of lab.tracks) {
    for (const lesson of track.lessons) {
      if (!lesson.command || lesson.command.length > 24) continue;
      rows.push({ cmd: lesson.command, what: lesson.what });
    }
  }
  if (!rows.length) return null;

  return h("div", { class: "mblock" },
    h("div", { class: "mk" }, "KOMUT REFERANSI"),
    h("div", { class: "mlist" },
      rows.slice(0, 24).map((r) =>
        h("div", { class: "mitem" },
          h("span", null,
            h("code", { style: "font-family:var(--m);color:#fff;font-weight:600" }, r.cmd),
            " — ", r.what)))));
}

function renderLab() {
  const host = $("#labGrid");
  if (!host) return;
  clear(host);

  const note = $("#labNote");
  if (note) note.textContent = LAB.note;

  LAB.categories.forEach((cat, index) => {
    host.appendChild(h("button", {
      class: "lab rv",
      type: "button",
      onclick: () => openModal({
        kind: "TERMUX LAB",
        title: cat.cmd,
        content: h("div", null,
          h("p", { class: "mp" }, cat.body),
          h("div", { class: "mblock" },
            h("div", { class: "mk" }, "İÇERİK"),
            h("div", { class: "mlist" },
              cat.items.map((item) => h("div", { class: "mitem" }, item)))),
          cat.reference ? labReference() : null,
          h("div", { class: "mblock" },
            h("p", { class: "field__h" }, LAB.note))),
      }),
    },
      h("span", { class: "lab__cmd" }, cat.cmd),
      h("span", { class: "lab__n" }, String(index + 1).padStart(2, "0")),
      h("span", { class: "lab__l" }, cat.line)));
  });
}

/* --- 5. PROJECTS ---------------------------------------------------------- */

function projectModal(p) {
  return h("div", null,
    h("p", { class: "mp" }, p.summary),

    h("div", { class: "spec" },
      h("div", null, h("b", null, "DURUM"), h("span", null, p.status)),
      h("div", null, h("b", null, "YIL"), h("span", null, p.year)),
      h("div", null, h("b", null, "TÜR"), h("span", null, p.kind)),
      h("div", null, h("b", null, "TEKNOLOJİ"), h("span", null, String((p.tech || []).length)))),

    h("div", { class: "mblock" },
      h("div", { class: "mk" }, "NE"),
      h("p", { class: "mp" }, p.what)),

    h("div", { class: "mblock" },
      h("div", { class: "mk" }, "NEDEN"),
      h("p", { class: "mp" }, p.why)),

    p.highlights && p.highlights.length
      ? h("div", { class: "mblock" },
          h("div", { class: "mk" }, "ÖNE ÇIKANLAR"),
          h("div", { class: "mlist" },
            p.highlights.map((x) => h("div", { class: "mitem" }, x))))
      : null,

    h("div", { class: "mblock" },
      h("div", { class: "mk" }, "TEKNOLOJİ"),
      h("div", { class: "mrow" }, (p.tech || []).map((t) => h("span", { class: "tag" }, t)))),

    h("div", { class: "mblock" },
      h("div", { class: "mrow" },
        p.demo ? h("a", { class: "btn btn--solid", href: p.demo }, "DEMO") : null,
        p.repo ? h("a", { class: "btn", href: p.repo, target: "_blank", rel: "noopener" }, "KAYNAK") : null)));
}

function archiveModal(item) {
  return h("div", null,
    h("p", { class: "mp" }, item.note),
    h("div", { class: "spec" },
      h("div", null, h("b", null, "DURUM"), h("span", null, "arşiv")),
      h("div", null, h("b", null, "YIL"), h("span", null, item.year))),
    h("div", { class: "mblock" },
      h("p", { class: "field__h" },
        "Arşivlenmiş depo. Olduğu gibi duruyor, geliştirilmiyor.")),
    h("div", { class: "mblock" },
      h("a", { class: "btn btn--solid", href: item.repo, target: "_blank", rel: "noopener" },
        "DEPOYU AÇ")));
}

function renderProjects() {
  const host = $("#projectList");
  if (!host) return;
  clear(host);

  const card = ({ status, live, year, title, summary, onClick }) => {
    const el = h("button", {
      class: "pj rv",
      type: "button",
      onclick: onClick,
    },
      h("span", { class: "pj__top" },
        h("span", { class: "pj__st" + (live ? " pj__st--live" : "") }, status),
        h("span", { class: "pj__yr" }, year)),
      h("span", { class: "pj__t" }, title),
      h("span", { class: "pj__s" }, summary),
      h("span", { class: "pj__foot" },
        h("span", { class: "pj__go" }, "EXPLORE", icon("i-arrow", 15))));

    // pointer-tracked highlight
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--cx", `${e.clientX - r.left}px`);
      el.style.setProperty("--cy", `${e.clientY - r.top}px`);
    });
    return el;
  };

  for (const p of content.projects) {
    host.appendChild(card({
      status: p.status, live: true, year: p.year,
      title: p.title, summary: p.summary,
      onClick: () => openModal({ kind: "PROJE", title: p.title, content: projectModal(p) }),
    }));
  }

  for (const a of content.archive) {
    host.appendChild(card({
      status: "arşiv", live: false, year: a.year,
      title: a.title, summary: a.note,
      onClick: () => openModal({ kind: "ARŞİV", title: a.title, content: archiveModal(a) }),
    }));
  }
}

/* --- 6. NOW --------------------------------------------------------------- */

function renderNow() {
  const host = $("#nowGrid");
  if (!host) return;
  clear(host);

  const dateEl = $("#nowDate");
  if (dateEl && NOW.updated) dateEl.textContent = formatDate(NOW.updated);

  const block = (key, list) =>
    h("div", { class: "now__c rv" },
      h("div", { class: "now__k" }, h("i"), key),
      h("div", { class: "now__l" },
        list.map((x) => h("div", { class: "now__i" }, x))));

  host.appendChild(block("CURRENTLY BUILDING", NOW.building));
  host.appendChild(block("CURRENTLY LEARNING", NOW.learning));
  host.appendChild(block("CURRENTLY EXPLORING", NOW.exploring));
}

/* --- 7. TOOLBOX ----------------------------------------------------------- */

function renderToolbox() {
  const host = $("#toolGrid");
  if (!host) return;
  clear(host);

  for (const t of TOOLBOX) {
    host.appendChild(h("div", { class: "tool rv" },
      h("div", { class: "tool__bar" },
        h("i"), h("i"), h("i"),
        h("span", { class: "tool__k" }, t.kind.toUpperCase())),
      h("div", { class: "tool__n" }, t.name),
      h("div", { class: "tool__u" }, t.use)));
  }
}

/* --- boot ----------------------------------------------------------------- */

export function initSections(bootContent) {
  content = bootContent;
  renderStatus();
  renderWhatIDo();
  renderLab();
  renderProjects();
  renderNow();
  renderToolbox();
}
