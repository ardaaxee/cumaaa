/* Full-screen project detail.
 *
 * Not a modal: the panel wipes over the whole viewport with a clip-path
 * transition, which reads as a state change rather than a dialog. History is
 * wired in so the phone's back gesture closes it.
 */

import { $, h, clear, icon } from "./core.js";

let root, body, kindEl, closeBtn;
let open = false;
let lastFocus = null;
let booted = false;

export function initDetail() {
  if (booted) return;
  booted = true;

  root = $("#det");
  body = $("#detBody");
  kindEl = $("#detKind");
  closeBtn = $("#detClose");
  if (!root) return;

  closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && open) { e.preventDefault(); close(); }
  });
  window.addEventListener("popstate", () => { if (open) hide(); });
}

function hide() {
  open = false;
  root.classList.remove("on");
  document.body.classList.remove("lock");
  setTimeout(() => {
    if (open) return;
    root.hidden = true;
    clear(body);
  }, 540);
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
}

export function close() {
  if (!open) return;
  hide();
  history.back();
}

export function openDetail({ kind, title, summary, specs, blocks, actions }) {
  if (!root) return;
  lastFocus = document.activeElement;
  kindEl.textContent = kind || "";

  const inner = h("div", { class: "det__inner" },
    h("h2", { class: "det__t", id: "detTitle" }, title),
    summary ? h("p", { class: "det__sum" }, summary) : null,

    specs && specs.length
      ? h("div", { class: "spec" },
          specs.map(([k, v]) => h("div", null, h("b", null, k), h("span", null, v))))
      : null,

    ...(blocks || []).map((b) => {
      if (!b) return null;
      return h("div", { class: "mblock" },
        h("div", { class: "mk" }, b.key),
        b.text ? h("p", { class: "mp" }, b.text) : null,
        b.list ? h("div", { class: "mlist" }, b.list.map((x) => h("div", { class: "mitem" }, x))) : null,
        b.tags ? h("div", { class: "mrow" }, b.tags.map((t) => h("span", { class: "tag" }, t))) : null);
    }),

    actions && actions.length
      ? h("div", { class: "mblock" },
          h("div", { class: "mrow" },
            actions.map((a) => h("a", {
              class: "btn" + (a.primary ? " btn--solid" : ""),
              href: a.href,
              target: a.external ? "_blank" : null,
              rel: a.external ? "noopener" : null,
            }, a.label, a.external ? icon("i-arrow", 15) : null))))
      : null);

  clear(body);
  body.appendChild(inner);
  body.scrollTop = 0;

  if (!open) {
    open = true;
    root.hidden = false;
    requestAnimationFrame(() => root.classList.add("on"));
    document.body.classList.add("lock");
    history.pushState({ detail: true }, "");
  }
  setTimeout(() => closeBtn.focus(), 80);
}

export function isOpen() {
  return open;
}
