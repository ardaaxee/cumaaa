/* Sheet-based panel system with real history integration.
 *
 * Every panel push adds a history entry, so the hardware/browser back button
 * walks back through nested views and finally closes the sheet — which is what
 * a native app does and what a page-reload-based site cannot do.
 */

import { $, clear, icon } from "./core.js";

const panels = new Map();
let stack = [];
let scrim, sheet, sheetBody, sheetTitle, sheetEyebrow, sheetBack, sheetClose;
let lastFocused = null;
let booted = false;

export function registerPanel(id, spec) {
  panels.set(id, spec);
}

export function hasPanel(id) {
  return panels.has(id);
}

function lockScroll(locked) {
  document.body.classList.toggle("is-locked", locked);
}

function renderTop() {
  const entry = stack[stack.length - 1];
  if (!entry) return;
  const spec = panels.get(entry.id);
  if (!spec) return;

  sheetEyebrow.textContent = typeof spec.eyebrow === "function"
    ? spec.eyebrow(entry.arg) : (spec.eyebrow || "");
  sheetTitle.textContent = typeof spec.title === "function"
    ? spec.title(entry.arg) : (spec.title || "");

  clear(sheetBody);
  sheetBody.scrollTop = 0;

  const view = spec.render({ arg: entry.arg, open, back, close, replace });
  if (view) sheetBody.appendChild(view);

  sheetBack.hidden = stack.length < 2;
}

function showSheet() {
  if (!sheet.hidden) return;
  lastFocused = document.activeElement;
  scrim.hidden = false;
  sheet.hidden = false;
  // force a frame so the transition actually runs
  requestAnimationFrame(() => {
    scrim.classList.add("is-open");
    sheet.classList.add("is-open");
  });
  lockScroll(true);
}

function hideSheet() {
  if (sheet.hidden) return;
  scrim.classList.remove("is-open");
  sheet.classList.remove("is-open");
  const done = () => {
    sheet.hidden = true;
    scrim.hidden = true;
    clear(sheetBody);
  };
  setTimeout(done, 300);
  lockScroll(false);
  if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
}

/** Push a panel onto the stack. */
export function open(id, arg = null, { push = true } = {}) {
  if (!panels.has(id)) return false;
  const spec = panels.get(id);

  if (spec.onOpen) spec.onOpen(arg);
  if (spec.overlay) { spec.overlay(arg); return true; }

  stack.push({ id, arg });
  if (push) {
    const url = stack.length === 1 && spec.path !== false ? "/" + id : null;
    history.pushState({ waDepth: stack.length }, "", url);
  }
  showSheet();
  renderTop();
  return true;
}

/** Replace the top entry without adding history. */
export function replace(id, arg = null) {
  if (!panels.has(id) || !stack.length) return open(id, arg);
  stack[stack.length - 1] = { id, arg };
  renderTop();
  return true;
}

export function back() {
  if (stack.length > 1) history.back();
  else close();
}

export function close() {
  if (!stack.length) return;
  const depth = stack.length;
  stack = [];
  hideSheet();
  history.go(-depth);
}

/** Close without touching history — used when history itself drove the change. */
function closeSilently() {
  stack = [];
  hideSheet();
}

export function currentPanel() {
  return stack.length ? stack[stack.length - 1] : null;
}

export function initUI() {
  if (booted) return;
  booted = true;

  scrim = $("#scrim");
  sheet = $("#sheet");
  sheetBody = $("#sheetBody");
  sheetTitle = $("#sheetTitle");
  sheetEyebrow = $("#sheetEyebrow");
  sheetBack = $("#sheetBack");
  sheetClose = $("#sheetClose");

  sheetClose.addEventListener("click", close);
  sheetBack.addEventListener("click", back);
  scrim.addEventListener("click", close);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && stack.length) {
      event.preventDefault();
      close();
    }
  });

  window.addEventListener("popstate", (event) => {
    const depth = (event.state && event.state.waDepth) || 0;
    if (depth >= stack.length) return;
    stack = stack.slice(0, depth);
    if (!stack.length) closeSilently();
    else { showSheet(); renderTop(); }
  });

  // Swipe down on the sheet header to dismiss.
  let startY = null;
  const head = sheet.querySelector(".sheet__head");
  head.addEventListener("touchstart", (e) => { startY = e.touches[0].clientY; }, { passive: true });
  head.addEventListener("touchmove", (e) => {
    if (startY === null) return;
    const delta = e.touches[0].clientY - startY;
    if (delta > 0) sheet.style.transform = `translateY(${delta}px)`;
  }, { passive: true });
  head.addEventListener("touchend", (e) => {
    if (startY === null) return;
    const delta = e.changedTouches[0].clientY - startY;
    sheet.style.transform = "";
    startY = null;
    if (delta > 110) close();
  });
}

/* --- shared building blocks ---------------------------------------------- */

export function sectionHead(label, count) {
  const node = document.createElement("div");
  node.className = "sec";
  node.innerHTML = `<span class="sec__bar"></span><span class="sec__label"></span><span class="sec__rule"></span>`;
  node.querySelector(".sec__label").textContent = label;
  if (count !== undefined && count !== null) {
    const meta = document.createElement("span");
    meta.className = "sec__count";
    meta.textContent = count;
    node.appendChild(meta);
  }
  return node;
}

export function listItem({ title, sub, badge, onClick, href }) {
  const tag = href ? "a" : "button";
  const node = document.createElement(tag);
  node.className = "item";
  if (href) { node.href = href; node.target = "_blank"; node.rel = "noopener"; }
  if (onClick) node.addEventListener("click", onClick);

  const body = document.createElement("span");
  const titleNode = document.createElement("span");
  titleNode.className = "item__title";
  titleNode.textContent = title;
  body.appendChild(titleNode);
  if (sub) {
    const subNode = document.createElement("span");
    subNode.className = "item__sub";
    subNode.textContent = sub;
    body.appendChild(subNode);
  }
  node.appendChild(body);

  const meta = document.createElement("span");
  meta.className = "item__meta";
  if (badge) {
    const badgeNode = document.createElement("span");
    badgeNode.className = "row__badge";
    badgeNode.textContent = badge;
    meta.appendChild(badgeNode);
  }
  meta.appendChild(icon("i-arrow", 16, "row__arrow"));
  node.appendChild(meta);
  return node;
}
