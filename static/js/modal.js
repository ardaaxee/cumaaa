/* Modal / expanding panel.
 *
 * Wired into history so the phone's back gesture closes it instead of leaving
 * the site — the single most important mobile behaviour on a one-page site.
 */

import { $, clear } from "./core.js";

let scrim, modal, body, titleEl, kindEl, closeBtn;
let open = false;
let lastFocus = null;
let booted = false;

export function initModal() {
  if (booted) return;
  booted = true;

  scrim = $("#scrim");
  modal = $("#modal");
  body = $("#modalBody");
  titleEl = $("#modalTitle");
  kindEl = $("#modalKind");
  closeBtn = $("#modalClose");

  closeBtn.addEventListener("click", close);
  scrim.addEventListener("click", close);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && open) { e.preventDefault(); close(); }
  });

  window.addEventListener("popstate", () => {
    if (open) hide();
  });

  // Drag the header down to dismiss.
  let startY = null;
  const head = modal.querySelector(".modal__head");
  head.addEventListener("touchstart", (e) => { startY = e.touches[0].clientY; }, { passive: true });
  head.addEventListener("touchmove", (e) => {
    if (startY === null) return;
    const dy = e.touches[0].clientY - startY;
    if (dy > 0) modal.style.transform = `translateY(${dy}px)`;
  }, { passive: true });
  head.addEventListener("touchend", (e) => {
    if (startY === null) return;
    const dy = e.changedTouches[0].clientY - startY;
    modal.style.transform = "";
    startY = null;
    if (dy > 110) close();
  });
}

function hide() {
  open = false;
  scrim.classList.remove("on");
  modal.classList.remove("on");
  document.body.classList.remove("lock");
  setTimeout(() => {
    if (open) return;
    modal.hidden = true;
    scrim.hidden = true;
    clear(body);
  }, 320);
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
}

/** @param {{kind?:string,title:string,content:Node}} spec */
export function openModal(spec) {
  lastFocus = document.activeElement;
  kindEl.textContent = spec.kind || "";
  titleEl.textContent = spec.title || "";

  clear(body);
  if (spec.content) body.appendChild(spec.content);
  body.scrollTop = 0;

  if (!open) {
    open = true;
    scrim.hidden = false;
    modal.hidden = false;
    requestAnimationFrame(() => {
      scrim.classList.add("on");
      modal.classList.add("on");
    });
    document.body.classList.add("lock");
    history.pushState({ modal: true }, "");
  }
  setTimeout(() => closeBtn.focus(), 60);
}

export function close() {
  if (!open) return;
  hide();
  history.back();
}

export function isOpen() {
  return open;
}
