/* whoisarda — boot. */

import { $, $$, store, toast, prefersReducedMotion } from "./js/core.js";
import { initUI, open, hasPanel } from "./js/ui.js";
import { initPanels } from "./js/panels.js";
import { initLab, refreshHomeProgress } from "./js/lab.js";
import { initTools } from "./js/tools.js";
import { initPlayground } from "./js/playground.js";
import { initPalette, openPalette } from "./js/palette.js";

const content = window.__BOOT__;

/* --- preferences ---------------------------------------------------------- */

function restorePreferences() {
  const root = document.documentElement;
  const contrast = store.get("contrast");
  if (contrast) root.dataset.contrast = contrast;
  const motion = store.get("motion");
  if (motion) root.dataset.motion = motion;
}

/* --- wordmark ------------------------------------------------------------- */

const SCRAMBLE_CHARS = "!<>-_\\/[]{}—=+*^?#01";

function scrambleWordmark(node) {
  if (prefersReducedMotion()) return;
  const target = node.dataset.text || node.textContent;
  const queue = Array.from({ length: target.length }, (_, i) => ({
    to: target[i],
    start: Math.floor(Math.random() * 14),
    end: Math.floor(Math.random() * 16) + 16,
  }));
  let frame = 0;

  const tick = () => {
    let output = "";
    let complete = 0;
    for (const item of queue) {
      if (frame >= item.end) { output += item.to; complete++; }
      else if (frame >= item.start) {
        output += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      } else output += target[complete] === undefined ? "" : " ";
    }
    node.textContent = output;
    if (complete === queue.length) { node.textContent = target; return; }
    frame++;
    requestAnimationFrame(tick);
  };
  tick();
}

function initWordmark() {
  const node = $("#wordmark");
  if (!node) return;

  const play = () => {
    if (prefersReducedMotion()) return;
    node.classList.add("is-glitch");
    setTimeout(() => node.classList.remove("is-glitch"), 780);
    scrambleWordmark(node);
  };

  setTimeout(play, 180);
  node.addEventListener("click", play);
  node.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); play(); }
  });
}

/* --- pointer glow --------------------------------------------------------- */

function initGlow() {
  const glow = $(".bg-glow");
  if (!glow || !window.matchMedia("(hover: hover)").matches) return;
  let ticking = false;
  window.addEventListener("pointermove", (event) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      glow.style.setProperty("--px", event.clientX + "px");
      glow.style.setProperty("--py", event.clientY + "px");
      ticking = false;
    });
  });
}

/* --- scroll behaviours ---------------------------------------------------- */

function initScroll() {
  const topbar = $("#topbar");
  if (topbar) {
    const sentinel = document.createElement("div");
    sentinel.style.cssText = "position:absolute;top:0;height:1px;width:1px";
    document.body.prepend(sentinel);
    new IntersectionObserver(([entry]) => {
      topbar.classList.toggle("is-stuck", !entry.isIntersecting);
    }).observe(sentinel);
  }

  const revealables = $$(".rv");
  if (!revealables.length) return;
  if (prefersReducedMotion()) {
    revealables.forEach((node) => node.classList.add("is-in"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      }
    }
  }, { rootMargin: "0px 0px -8% 0px" });
  revealables.forEach((node) => observer.observe(node));
}

/* --- navigation wiring ---------------------------------------------------- */

function initTriggers() {
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-open]");
    if (!trigger) return;
    const id = trigger.dataset.open;
    if (id === "cmd") { event.preventDefault(); openPalette(); return; }
    if (hasPanel(id)) { event.preventDefault(); open(id); }
  });
}

/* --- deep links & Instagram arrival --------------------------------------- */

function initDeepLink() {
  history.replaceState({ waDepth: 0 }, "", location.pathname + location.search);
  const section = location.pathname.replace(/^\/+|\/+$/g, "");
  if (section && hasPanel(section)) open(section);
}

function initArrival() {
  const params = new URLSearchParams(location.search);
  const from = (params.get("from") || "").toLowerCase();
  const referrer = document.referrer || "";
  const fromInstagram = from === "ig" || from === "instagram"
    || /instagram\.com/i.test(referrer);

  if (!fromInstagram) return;
  if (store.get("greeted")) return;
  store.set("greeted", true);
  setTimeout(() => toast("Instagram'dan geldin — LAB'den başlamanı öneririm"), 1400);
}

/* --- service worker ------------------------------------------------------- */

function initServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (location.protocol !== "https:" && location.hostname !== "localhost"
      && location.hostname !== "127.0.0.1") return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => { /* offline support is optional */ });
  });
}

/* --- boot ----------------------------------------------------------------- */

function boot() {
  if (!content) {
    console.error("whoisarda: content payload missing");
    return;
  }

  restorePreferences();
  initUI();
  initPanels(content);
  initLab(content);
  initTools(content);
  initPlayground(content);
  initPalette(content);

  initTriggers();
  initWordmark();
  initGlow();
  initScroll();
  initDeepLink();
  initArrival();
  initServiceWorker();

  refreshHomeProgress();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
