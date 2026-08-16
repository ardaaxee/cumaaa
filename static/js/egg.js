/* Three small discoverable details. None of them gate content — if nobody
 * finds them, nothing on the site is missing. */

import { $, toast } from "./core.js";
import { EGGS } from "./data.js";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
                "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

/** Console-typed secrets. Returns true when the line was one. */
export function eggCommand(line, write) {
  const key = line.trim().toLowerCase();
  const msg = EGGS.commands[key];
  if (!msg) return false;
  write("", "");
  write(msg, "g");
  write("", "");
  return true;
}

export function initEggs() {
  /* 1 — tapping the wordmark a few times. */
  const mark = $("#wordmark");
  if (mark) {
    let taps = 0;
    let timer = null;
    mark.addEventListener("click", () => {
      taps++;
      clearTimeout(timer);
      timer = setTimeout(() => { taps = 0; }, 2200);
      if (taps === EGGS.tapCount) {
        taps = 0;
        toast(EGGS.tapMessage, "ok");
      }
    });
  }

  /* 2 — Konami, for anyone on a keyboard. */
  let step = 0;
  document.addEventListener("keydown", (e) => {
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") { step = 0; return; }
    if (e.key.toLowerCase() === KONAMI[step].toLowerCase()) {
      step++;
      if (step === KONAMI.length) { step = 0; toast(EGGS.konamiMessage, "ok"); }
    } else {
      step = e.key === KONAMI[0] ? 1 : 0;
    }
  });

  /* 3 — holding a system marker in the hero lights the whole set. */
  const fx = document.querySelector(".hero__fx");
  if (fx) {
    let held = null;
    const markers = Array.from(fx.querySelectorAll(".hero__mk"));
    const hero = $("#hero");
    if (hero) {
      hero.addEventListener("pointerdown", (e) => {
        const near = markers.find((m) => {
          const r = m.getBoundingClientRect();
          return Math.hypot(e.clientX - (r.left + r.width / 2),
                            e.clientY - (r.top + r.height / 2)) < 26;
        });
        if (!near) return;
        held = setTimeout(() => {
          markers.forEach((m) => { m.style.borderColor = "#fff"; });
          toast("SYSTEM: dört köşe hizalandı.", "ok");
          setTimeout(() => markers.forEach((m) => { m.style.borderColor = ""; }), 2600);
        }, 700);
      });
      const cancel = () => { clearTimeout(held); held = null; };
      hero.addEventListener("pointerup", cancel);
      hero.addEventListener("pointercancel", cancel);
      hero.addEventListener("pointerleave", cancel);
    }
  }
}
