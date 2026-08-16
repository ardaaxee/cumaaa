/* ARDA.OS — boot and interaction layer. Vanilla JS, no libraries. */

import { $, $$, h, store, prefersReducedMotion } from "./js/core.js";
import { initModal } from "./js/modal.js";
import { initDetail } from "./js/detail.js";
import { initSections } from "./js/sections.js";
import { initLab } from "./js/lab.js";
import { initSession } from "./js/session.js";
import { initConsole } from "./js/console.js";
import { initConnect } from "./js/connect.js";
import { initPalette } from "./js/palette.js";
import { initEggs } from "./js/egg.js";
import { IDENTITY, DISCOVER } from "./js/data.js";

const content = window.__BOOT__;
const reduce = () => prefersReducedMotion();

/* --- boot overlay --------------------------------------------------------- */

function initBoot() {
  const boot = $("#boot");
  if (!boot) return;

  const finish = () => {
    if (boot.classList.contains("done")) return;
    boot.classList.add("done");
    document.body.classList.remove("lock");
    startHero();
    setTimeout(() => boot.remove(), 420);
  };

  if (reduce()) { finish(); return; }

  document.body.classList.add("lock");
  const timer = setTimeout(finish, 1050);
  const early = () => { clearTimeout(timer); finish(); };
  boot.addEventListener("click", early);
  window.addEventListener("touchstart", early, { once: true, passive: true });
  window.addEventListener("wheel", early, { once: true, passive: true });
  window.addEventListener("keydown", early, { once: true });
}

/* --- 2. hero -------------------------------------------------------------- */

function buildHero() {
  const st = $("#statement");
  if (st) {
    for (const word of IDENTITY.statement) {
      st.appendChild(h("span", { class: "hero__stw" }, h("span", null, word)));
    }
  }

  const man = $("#manifesto");
  if (man) {
    for (const line of IDENTITY.manifesto) {
      man.appendChild(h("span", { class: "hero__manl" }, h("span", null, line)));
    }
  }

  const live = $("#heroLive");
  if (!live) return;

  const clock = h("b", { id: "hLocal" }, "--:--");
  const net = h("i", { id: "hNetDot" });
  const netTx = h("b", { id: "hNet" }, navigator.onLine ? "ONLINE" : "OFFLINE");
  const view = h("b", { id: "hView" }, `${window.innerWidth}×${window.innerHeight}`);

  live.append(
    h("span", { class: "chip" }, "LOCAL TIME", clock),
    h("span", { class: "chip" }, net, netTx),
    h("span", { class: "chip" }, "VIEWPORT", view),
  );

  const tick = () => {
    clock.textContent = new Date().toLocaleTimeString("tr-TR", {
      hour: "2-digit", minute: "2-digit", hour12: false,
    });
  };
  tick();
  setInterval(tick, 15000);

  const sync = () => {
    const on = navigator.onLine;
    netTx.textContent = on ? "ONLINE" : "OFFLINE";
    net.classList.toggle("off", !on);
  };
  sync();
  window.addEventListener("online", sync);
  window.addEventListener("offline", sync);

  window.addEventListener("resize", () => {
    view.textContent = `${window.innerWidth}×${window.innerHeight}`;
  });
}

function splitChars(node) {
  const text = node.dataset.text || node.textContent;
  node.textContent = "";
  text.split("").forEach((ch, i) => {
    const span = document.createElement("span");
    span.className = "ch";
    span.textContent = ch;
    span.style.animationDelay = `${i * 50}ms`;
    node.appendChild(span);
  });
}

function startHero() {
  if (!reduce()) $$(".hero__title [data-text]").forEach(splitChars);
  $$(".hero__stw").forEach((n, i) => setTimeout(() => n.classList.add("in"), 240 + i * 40));
  $$(".hero__manl").forEach((n, i) => setTimeout(() => n.classList.add("in"), 420 + i * 40));
}

/* --- 3. discover scan ----------------------------------------------------- */

function initDiscoverScan() {
  const btn = $("#discoverBtn");
  const scan = $("#scan");
  const label = $("#scanLine");
  if (!btn || !scan) return;

  const target = () => document.getElementById("whatido");

  btn.addEventListener("click", () => {
    if (reduce()) {
      const el = target();
      if (el) el.scrollIntoView({ behavior: "auto", block: "start" });
      return;
    }

    let closed = false;
    scan.hidden = false;
    label.textContent = "SCANNING DIGITAL SPACE";
    requestAnimationFrame(() => scan.classList.add("on"));
    document.body.classList.add("lock");

    const finish = () => {
      if (closed) return;
      closed = true;
      clearTimeout(t1);
      clearTimeout(t2);
      scan.classList.remove("on");
      document.body.classList.remove("lock");
      scan.removeEventListener("click", finish);
      setTimeout(() => { scan.hidden = true; }, 220);
      const el = target();
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // Total is capped at ~1s and a tap ends it immediately.
    const t1 = setTimeout(() => { label.textContent = "SPACE READY"; }, 620);
    const t2 = setTimeout(finish, 960);
    scan.addEventListener("click", finish);
  });
}

/* --- 13. reveal ----------------------------------------------------------- */

function initReveal() {
  const targets = [...$$(".rv:not(.in)"), ...$$(".rvt:not(.in)"), ...$$(".head__rule:not(.in)")];
  if (!targets.length) return;

  if (reduce()) { targets.forEach((n) => n.classList.add("in")); return; }

  // Wrap section titles once so the mask reveal has something to slide.
  for (const t of $$(".rvt")) {
    if (t.dataset.wrapped) continue;
    t.dataset.wrapped = "1";
    const text = t.textContent;
    t.textContent = "";
    t.appendChild(h("span", null, text));
  }

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add("in");
      io.unobserve(e.target);
    }
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

  targets.forEach((n) => io.observe(n));
}

/* --- scroll --------------------------------------------------------------- */

function initScroll() {
  const fill = $("#progressFill");
  const bar = $("#bar");
  const grid = $(".grid");
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (y / max) * 100 : 0;
    if (fill) fill.style.width = `${pct.toFixed(2)}%`;
    if (bar) bar.classList.toggle("solid", y > 24);
    if (grid && !reduce()) grid.style.setProperty("--gy", `${-(y * 0.05) % 58}px`);
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });
  update();
}

/* --- pointer: beam, magnetic, hero markers -------------------------------- */

function initPointer() {
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const beam = $(".beam");
  const markers = $$(".hero__mk, .hero__tick");
  let ticking = false;

  // Markers drift for both pointer and touch — it is the one effect that
  // rewards moving a finger across the hero.
  const drift = (x, y) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = ((x - cx) / cx) * 6;
    const dy = ((y - cy) / cy) * 6;
    for (let i = 0; i < markers.length; i++) {
      const k = i % 2 === 0 ? 1 : -1;
      markers[i].style.setProperty("--dx", `${dx * k}px`);
      markers[i].style.setProperty("--dy", `${dy * k}px`);
    }
  };

  if (reduce()) return;

  const onMove = (e) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      if (fine && beam) {
        beam.style.setProperty("--mx", `${e.clientX}px`);
        beam.style.setProperty("--my", `${e.clientY}px`);
      }
      drift(e.clientX, e.clientY);
      ticking = false;
    });
  };

  window.addEventListener("pointermove", onMove, { passive: true });

  if (!fine) return;
  for (const el of $$(".mag")) {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      el.style.transform = `translate(${dx * 7}px, ${dy * 7}px)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  }
}

/* --- discover navigation -------------------------------------------------- */

function initDiscoverNav() {
  const nav = $("#disc");
  const list = $("#discList");
  const toggle = $("#discToggle");
  const label = $("#discNow");
  if (!nav || !list || !toggle) return;

  const close = () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };

  DISCOVER.forEach((item, i) => {
    list.appendChild(h("li", null, h("button", {
      class: "disc__a", type: "button", dataset: { target: item.id },
      onclick: () => {
        close();
        const el = document.getElementById(item.id);
        if (el) el.scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "start" });
      },
    },
      h("span", { class: "n" }, String(i + 1).padStart(2, "0")),
      h("span", null, item.label),
      h("span", { class: "bar2" }))));
  });

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("click", (e) => {
    if (nav.classList.contains("open") && !nav.contains(e.target)) close();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  const spy = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const found = DISCOVER.find((d) => d.id === e.target.id);
      if (label && found) label.textContent = found.label;
      for (const a of list.querySelectorAll(".disc__a")) {
        a.classList.toggle("on", a.dataset.target === e.target.id);
      }
    }
  }, { rootMargin: "-25% 0px -65% 0px" });

  DISCOVER.forEach((d) => {
    const el = document.getElementById(d.id);
    if (el) spy.observe(el);
  });
}

/* --- anchors -------------------------------------------------------------- */

function initAnchors() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const el = document.getElementById(link.getAttribute("href").slice(1));
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "start" });
  });
}

/* --- preferences ---------------------------------------------------------- */

function restore() {
  const motion = store.get("motion");
  if (motion) document.documentElement.dataset.motion = motion;
}

/* --- boot ----------------------------------------------------------------- */

function boot() {
  if (!content) {
    console.error("ARDA.OS: content payload missing");
    return;
  }

  restore();
  initModal();
  initDetail();
  buildHero();
  initSections(content);
  initLab();
  initSession();
  initConsole(content);
  initConnect();
  initPalette(content);

  initBoot();
  initDiscoverScan();
  initDiscoverNav();
  initScroll();
  initPointer();
  initAnchors();
  initReveal();
  initEggs();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
