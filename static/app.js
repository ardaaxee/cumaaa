/* ARDA.OS — boot and interaction layer. Vanilla, no libraries. */

import { $, $$, h, store, prefersReducedMotion } from "./js/core.js";
import { initModal } from "./js/modal.js";
import { initSections } from "./js/sections.js";
import { initConsole } from "./js/console.js";
import { initConnect } from "./js/connect.js";
import { DISCOVER } from "./js/data.js";

const content = window.__BOOT__;

/* --- 11. boot ------------------------------------------------------------- */

function initBoot() {
  const boot = $("#boot");
  if (!boot) return;

  // Never hold the visitor: the overlay is capped at ~1.1s and any interaction
  // dismisses it immediately.
  const finish = () => {
    if (boot.classList.contains("done")) return;
    boot.classList.add("done");
    document.body.classList.remove("lock");
    startHero();
    setTimeout(() => boot.remove(), 420);
  };

  if (prefersReducedMotion()) { finish(); return; }

  document.body.classList.add("lock");
  const timer = setTimeout(finish, 1100);
  const early = () => { clearTimeout(timer); finish(); };
  boot.addEventListener("click", early);
  window.addEventListener("touchstart", early, { once: true, passive: true });
  window.addEventListener("wheel", early, { once: true, passive: true });
  window.addEventListener("keydown", early, { once: true });
}

/* --- 1. hero -------------------------------------------------------------- */

function splitChars(node) {
  const text = node.dataset.text || node.textContent;
  node.textContent = "";
  text.split("").forEach((ch, i) => {
    const span = document.createElement("span");
    span.className = "ch";
    span.textContent = ch;
    span.style.animationDelay = `${i * 52}ms`;
    node.appendChild(span);
  });
}

function startHero() {
  if (!prefersReducedMotion()) {
    $$(".hero__title [data-text]").forEach(splitChars);
  }
  $$(".hero__line").forEach((line, i) =>
    setTimeout(() => line.classList.add("in"), 260 + i * 40));
}

/* --- reveal on scroll ----------------------------------------------------- */

let revealObserver = null;

function initReveal() {
  const items = $$(".rv:not(.in)");
  if (!items.length) return;
  if (prefersReducedMotion()) { items.forEach((n) => n.classList.add("in")); return; }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("in");
        revealObserver.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });
  }
  items.forEach((n) => revealObserver.observe(n));
}

/* --- scroll: progress, bar, grid drift ------------------------------------ */

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
    if (grid && !prefersReducedMotion()) {
      grid.style.setProperty("--gy", `${-(y * 0.06) % 56}px`);
    }
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });
  update();
}

/* --- pointer beam + magnetic buttons -------------------------------------- */

function initPointer() {
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!fine || prefersReducedMotion()) return;

  const beam = $(".beam");
  let ticking = false;
  window.addEventListener("pointermove", (e) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      if (beam) {
        beam.style.setProperty("--mx", `${e.clientX}px`);
        beam.style.setProperty("--my", `${e.clientY}px`);
      }
      ticking = false;
    });
  }, { passive: true });

  // Magnetic-ish pull, kept small so it reads as polish rather than a gimmick.
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

/* --- 10. discover navigation ---------------------------------------------- */

function initDiscover() {
  const nav = $("#disc");
  const list = $("#discList");
  const toggle = $("#discToggle");
  const nowLabel = $("#discNow");
  if (!nav || !list || !toggle) return;

  const close = () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };

  DISCOVER.forEach((item, i) => {
    const btn = h("button", {
      class: "disc__a",
      type: "button",
      dataset: { target: item.id },
      onclick: () => {
        close();
        const target = document.getElementById(item.id);
        if (target) {
          target.scrollIntoView({
            behavior: prefersReducedMotion() ? "auto" : "smooth",
            block: "start",
          });
        }
      },
    },
      h("span", { class: "n" }, String(i + 1).padStart(2, "0")),
      h("span", null, item.label),
      h("span", { class: "bar2" }));
    list.appendChild(h("li", null, btn));
  });

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (e) => {
    if (!nav.classList.contains("open")) return;
    if (!nav.contains(e.target)) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  // Scroll spy — marks whichever section owns the upper third of the screen.
  const spy = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const id = entry.target.id;
      const found = DISCOVER.find((d) => d.id === id);
      if (nowLabel && found) nowLabel.textContent = found.label;
      for (const a of list.querySelectorAll(".disc__a")) {
        a.classList.toggle("on", a.dataset.target === id);
      }
    }
  }, { rootMargin: "-25% 0px -65% 0px" });

  DISCOVER.forEach((d) => {
    const el = document.getElementById(d.id);
    if (el) spy.observe(el);
  });
}

/* --- clock in the bar ----------------------------------------------------- */

function initClock() {
  const el = $("#barClock");
  if (!el) return;
  const tick = () => {
    el.textContent = new Date().toLocaleTimeString("tr-TR", {
      hour: "2-digit", minute: "2-digit", hour12: false,
    });
  };
  tick();
  setInterval(tick, 20000);
}

/* --- smooth anchors ------------------------------------------------------- */

function initAnchors() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute("href").slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
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
  initSections(content);
  initConsole(content);
  initConnect();

  initBoot();
  initDiscover();
  initScroll();
  initPointer();
  initClock();
  initAnchors();
  initReveal();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
