/* SESSION — live activity read from this browser only.
 *
 * There is no visitor counter and no server call here. Every value is read
 * from the device at render time and is thrown away when the tab closes;
 * the panel says so plainly.
 */

import { $, h, clear } from "./core.js";

const started = new Date();

function card(key, value, opts = {}) {
  return h("div", { class: "sess__c rv" + (opts.wide ? " sess__c--wide" : "") },
    h("span", { class: "sess__k" }, key),
    opts.bars ? h("span", { class: "sess__bars" }, h("i"), h("i"), h("i"), h("i"), h("i")) : null,
    h("span", {
      class: "sess__v" + (opts.small ? " sess__v--sm" : ""),
      id: opts.id || null,
    }, value));
}

function deviceKind() {
  const touch = matchMedia("(hover: none) and (pointer: coarse)").matches;
  if (touch) return window.innerWidth < 600 ? "MOBILE" : "TABLET";
  return "DESKTOP";
}

function zoneName() {
  try {
    const z = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return (z || "LOCAL").split("/").pop().replace(/_/g, " ").toUpperCase();
  } catch {
    return "LOCAL";
  }
}

function elapsed() {
  const s = Math.floor((Date.now() - started.getTime()) / 1000);
  if (s < 60) return `${s} SN`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} DK ${s % 60} SN`;
  return `${Math.floor(m / 60)} SA ${m % 60} DK`;
}

export function initSession() {
  const host = $("#sessGrid");
  if (!host) return;

  clear(host);
  host.append(
    card("SESSION STARTED", started.toLocaleTimeString("tr-TR", { hour12: false }),
      { bars: true, wide: true }),
    card("DEVICE", deviceKind()),
    card("VIEWPORT", `${window.innerWidth}×${window.innerHeight}`, { id: "sesView" }),
    card("ONLINE", navigator.onLine ? "YES" : "NO", { id: "sesOnline" }),
    card("LOCAL TIME", "--:--:--", { id: "sesClock" }),
    card("TIME ZONE", zoneName(), { small: true }),
    card("SESSION TIME", "0 SN", { id: "sesElapsed", small: true }),
  );

  host.appendChild(h("p", { class: "fine", style: "grid-column:1/-1" },
    "Bu değerler yalnızca senin tarayıcında okundu. Sunucuya gönderilmedi, " +
    "kaydedilmedi ve sekmeyi kapattığında kayboluyor."));

  const tick = () => {
    const clock = $("#sesClock");
    if (clock) clock.textContent = new Date().toLocaleTimeString("tr-TR", { hour12: false });
    const el = $("#sesElapsed");
    if (el) el.textContent = elapsed();
  };
  tick();
  setInterval(tick, 1000);

  const syncOnline = () => {
    const el = $("#sesOnline");
    if (el) el.textContent = navigator.onLine ? "YES" : "NO";
  };
  window.addEventListener("online", syncOnline);
  window.addEventListener("offline", syncOnline);

  window.addEventListener("resize", () => {
    const el = $("#sesView");
    if (el) el.textContent = `${window.innerWidth}×${window.innerHeight}`;
  });
}
