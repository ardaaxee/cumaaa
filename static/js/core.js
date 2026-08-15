/* Shared primitives: DOM building, storage, clipboard, toasts. */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const SVG_NS = "http://www.w3.org/2000/svg";
const SVG_TAGS = new Set(["svg", "use", "circle", "path", "rect", "g", "line", "text"]);

/** Terse element builder. Children may be nodes, strings, arrays or null. */
export function h(tag, props = null, ...children) {
  const isSvg = SVG_TAGS.has(tag);
  const node = isSvg
    ? document.createElementNS(SVG_NS, tag)
    : document.createElement(tag);

  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (value === null || value === undefined || value === false) continue;
      if (key === "class") {
        node.setAttribute("class", value);
      } else if (key === "dataset") {
        Object.assign(node.dataset, value);
      } else if (key === "html") {
        node.innerHTML = value;
      } else if (key.startsWith("on") && typeof value === "function") {
        node.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key === "href" && isSvg) {
        node.setAttribute("href", value);
      } else if (value === true) {
        node.setAttribute(key, "");
      } else {
        node.setAttribute(key, value);
      }
    }
  }

  append(node, children);
  return node;
}

export function append(node, children) {
  for (const child of children.flat(4)) {
    if (child === null || child === undefined || child === false) continue;
    node.appendChild(
      child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function icon(id, size = 17, cls = null) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  if (cls) svg.setAttribute("class", cls);
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS(SVG_NS, "use");
  use.setAttribute("href", "#" + id);
  svg.appendChild(use);
  return svg;
}

/* --- storage ------------------------------------------------------------- */

const PREFIX = "wa:";

export const store = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    try { localStorage.removeItem(PREFIX + key); } catch { /* ignore */ }
  },
};

/* --- toasts -------------------------------------------------------------- */

let toastHost = null;

export function toast(message, kind = "") {
  if (!toastHost) toastHost = $("#toasts");
  if (!toastHost) return;
  const node = h("div", { class: "toast" + (kind ? " toast--" + kind : "") },
    kind === "ok" ? icon("i-check", 16) : null,
    kind === "err" ? icon("i-warn", 16) : null,
    h("span", null, message));
  toastHost.appendChild(node);
  setTimeout(() => {
    node.style.transition = "opacity 200ms, transform 200ms";
    node.style.opacity = "0";
    node.style.transform = "translateY(6px)";
    setTimeout(() => node.remove(), 220);
  }, 2600);
}

/* --- clipboard & sharing ------------------------------------------------- */

export async function copy(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* fall through to the legacy path */ }

  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.cssText = "position:fixed;top:-1000px;opacity:0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

export function canShare() {
  return typeof navigator.share === "function";
}

export async function share(data) {
  if (!canShare()) return false;
  try {
    await navigator.share(data);
    return true;
  } catch (err) {
    // AbortError just means the user dismissed the share sheet.
    if (err && err.name === "AbortError") return true;
    return false;
  }
}

/* --- misc ---------------------------------------------------------------- */

export function debounce(fn, wait = 120) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

export function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

export function formatDate(iso) {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("tr-TR", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    || document.documentElement.dataset.motion === "off";
}
