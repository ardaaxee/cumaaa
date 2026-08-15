/* EXPLORE — a swipeable discovery deck over everything on the site.
 *
 * The deck is built from the same registry that feeds search, so it can only
 * ever surface things that really exist. Order is shuffled per session and
 * biased so the visitor sees a mix of kinds rather than 22 lessons in a row.
 */

import { h, clear, icon, store, toast, prefersReducedMotion } from "./core.js";
import { registerPanel, open } from "./ui.js";

const SEEN_KEY = "explore:seen";

let content = null;

const KIND = {
  lesson:     { label: "TERMUX DERSİ", verb: "dersi aç",   panel: "lesson" },
  tool:       { label: "ARAÇ",         verb: "aracı aç",   panel: "tool" },
  note:       { label: "NOT",          verb: "yazıyı oku", panel: "note" },
  project:    { label: "PROJE",        verb: "projeyi aç", panel: "project" },
  playground: { label: "DENEY",        verb: "deneyi aç",  panel: "experiment" },
  archive:    { label: "ARŞİV",        verb: "arşive git", panel: "archive" },
};

/* Deterministic shuffle so a session's deck is stable if the panel reopens. */
function seededShuffle(items, seed) {
  const out = items.slice();
  let state = seed >>> 0;
  const rand = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Interleave by kind so consecutive cards rarely repeat a type. */
function buildDeck(seed) {
  const buckets = new Map();
  for (const entry of content.search) {
    if (!KIND[entry.type]) continue;
    if (!buckets.has(entry.type)) buckets.set(entry.type, []);
    buckets.get(entry.type).push(entry);
  }
  for (const [type, list] of buckets) {
    buckets.set(type, seededShuffle(list, seed + type.length * 7717));
  }

  const order = seededShuffle(Array.from(buckets.keys()), seed);
  const deck = [];
  let remaining = true;
  while (remaining) {
    remaining = false;
    for (const type of order) {
      const list = buckets.get(type);
      if (list.length) { deck.push(list.shift()); remaining = true; }
    }
  }
  return deck;
}

function renderExplore() {
  const seed = store.get("explore:seed") || Math.floor(Math.random() * 1e9);
  store.set("explore:seed", seed);

  const deck = buildDeck(seed);
  const seen = new Set(store.get(SEEN_KEY, []));
  let index = 0;

  const stage = h("div", { class: "deck" });
  const counter = h("span", { class: "deck__count" });
  const progress = h("div", { class: "deck__progressFill" });

  const markSeen = (entry) => {
    seen.add(entry.id);
    store.set(SEEN_KEY, Array.from(seen).slice(-400));
  };

  const buildCard = (entry, depth) => {
    const meta = KIND[entry.type];
    const card = h("article", {
      class: "card3d" + (depth ? " card3d--peek" : ""),
      style: depth ? `transform:translateY(${depth * 9}px) scale(${1 - depth * 0.035})` : "",
    },
      h("div", { class: "card3d__top" },
        h("span", { class: "card3d__kind" }, meta.label),
        seen.has(entry.id) ? h("span", { class: "card3d__seen" }, "görüldü") : null),
      h("h3", { class: "card3d__title" }, entry.title),
      h("p", { class: "card3d__sub" }, entry.sub || ""),
      h("span", { class: "card3d__spacer" }),
      entry.keywords && entry.keywords.length
        ? h("div", { class: "card3d__tags" },
            entry.keywords.slice(0, 4).map((k) => h("span", { class: "card3d__tag" }, k)))
        : null,
      h("div", { class: "card3d__foot" },
        h("button", {
          class: "btn btn--primary",
          type: "button",
          onclick: (event) => { event.stopPropagation(); openEntry(entry); },
        }, meta.verb, icon("i-arrow", 16))));
    return card;
  };

  const openEntry = (entry) => {
    markSeen(entry);
    if (entry.type === "archive") { open("archive"); return; }
    const panel = KIND[entry.type].panel;
    if (entry.arg) open(panel, entry.arg);
    else open(entry.target);
  };

  const paint = () => {
    clear(stage);
    if (index >= deck.length) {
      stage.appendChild(h("div", { class: "deck__end" },
        h("h3", { class: "card3d__title" }, "Deste bitti"),
        h("p", { class: "lede" }, `${deck.length} içeriğin hepsini gördün.`),
        h("div", { class: "btnrow", style: "margin-top:16px;justify-content:center" },
          h("button", {
            class: "btn btn--primary", type: "button",
            onclick: () => { index = 0; paint(); },
          }, "baştan karıştır"),
          h("button", {
            class: "btn", type: "button",
            onclick: () => open("lab"),
          }, "LAB'e git"))));
      counter.textContent = `${deck.length}/${deck.length}`;
      progress.style.width = "100%";
      return;
    }

    // Render back-to-front so the active card sits on top.
    for (let depth = 2; depth >= 0; depth--) {
      const entry = deck[index + depth];
      if (!entry) continue;
      stage.appendChild(buildCard(entry, depth));
    }
    counter.textContent = `${index + 1}/${deck.length}`;
    progress.style.width = `${((index + 1) / deck.length) * 100}%`;
    attachSwipe(stage.lastElementChild);
  };

  const advance = (direction) => {
    const top = stage.querySelector(".card3d:not(.card3d--peek)");
    const entry = deck[index];
    if (entry) markSeen(entry);

    if (top && !prefersReducedMotion()) {
      top.style.transition = "transform 260ms var(--ease), opacity 260ms var(--ease)";
      top.style.transform = `translateX(${direction * 130}%) rotate(${direction * 9}deg)`;
      top.style.opacity = "0";
      setTimeout(() => { index++; paint(); }, 210);
    } else {
      index++;
      paint();
    }
  };

  /* Touch/pointer swipe on the top card. */
  function attachSwipe(card) {
    if (!card) return;
    let startX = null;
    let startY = null;
    let dragging = false;

    card.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button")) return;
      startX = event.clientX;
      startY = event.clientY;
      dragging = true;
      card.setPointerCapture(event.pointerId);
      card.style.transition = "none";
    });

    card.addEventListener("pointermove", (event) => {
      if (!dragging || startX === null) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (Math.abs(dy) > Math.abs(dx) * 1.4) return; // vertical scroll wins
      card.style.transform = `translateX(${dx}px) rotate(${dx * 0.035}deg)`;
      card.style.opacity = String(Math.max(0.35, 1 - Math.abs(dx) / 420));
    });

    const release = (event) => {
      if (!dragging || startX === null) return;
      dragging = false;
      const dx = (event.clientX ?? startX) - startX;
      card.style.transition = "transform 220ms var(--ease), opacity 220ms var(--ease)";
      if (Math.abs(dx) > 90) {
        advance(dx > 0 ? 1 : -1);
      } else {
        card.style.transform = "";
        card.style.opacity = "";
      }
      startX = null;
    };

    card.addEventListener("pointerup", release);
    card.addEventListener("pointercancel", release);
  }

  paint();

  return h("div", { class: "explore" },
    h("p", { class: "lede" },
      "Sitedeki her şey tek destede. Kaydır ya da geç — ilgini çekeni aç."),
    h("div", { class: "deck__progress" }, progress),
    h("div", { class: "deck__meta" },
      h("span", { class: "deck__hint" }, "← kaydır →"),
      counter),
    stage,
    h("div", { class: "deck__controls" },
      h("button", {
        class: "btn", type: "button",
        onclick: () => advance(-1),
        "aria-label": "Sonraki içerik",
      }, "geç"),
      h("button", {
        class: "btn", type: "button",
        onclick: () => {
          store.remove(SEEN_KEY);
          store.set("explore:seed", Math.floor(Math.random() * 1e9));
          toast("deste yeniden karıştırıldı", "ok");
          open("explore");
        },
      }, icon("i-refresh", 16), "karıştır")));
}

export function initExplore(bootContent) {
  content = bootContent;
  registerPanel("explore", {
    eyebrow: "Keşfet",
    title: "EXPLORE",
    render: renderExplore,
  });
}
