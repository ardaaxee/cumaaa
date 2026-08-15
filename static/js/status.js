/* SYSTEM STATUS — a real diagnostics panel.
 *
 * Every number here is measured at the moment you open it: endpoint latency
 * comes from actual round trips, capabilities from actual feature detection,
 * storage from actual localStorage contents. Nothing is simulated, and when a
 * value cannot be read the panel says so instead of inventing one.
 */

import { h, clear, icon, store, toast } from "./core.js";
import { registerPanel } from "./ui.js";

const ENDPOINTS = [
  { path: "/api/health", label: "health" },
  { path: "/api/status", label: "status" },
  { path: "/api/commands", label: "commands" },
  { path: "/api/content", label: "content" },
  { path: "/api/qr?format=json&data=ping", label: "qr" },
];

function row(term, value, state = "") {
  return [
    h("dt", null, term),
    h("dd", { class: state ? "kv--" + state : null }, value),
  ];
}

function formatUptime(seconds) {
  if (seconds < 60) return `${seconds} sn`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} dk ${seconds % 60} sn`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours < 24) return `${hours} sa ${mins} dk`;
  return `${Math.floor(hours / 24)} gün ${hours % 24} sa`;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/* --- probes --------------------------------------------------------------- */

async function probeEndpoints(host) {
  clear(host);
  for (const endpoint of ENDPOINTS) {
    const line = h("div", { class: "probe" },
      h("span", { class: "probe__dot probe__dot--wait" }),
      h("span", { class: "probe__path" }, endpoint.label),
      h("span", { class: "probe__val" }, "…"));
    host.appendChild(line);

    const started = performance.now();
    try {
      const response = await fetch(endpoint.path, { cache: "no-store" });
      const elapsed = Math.round(performance.now() - started);
      const dot = line.querySelector(".probe__dot");
      const val = line.querySelector(".probe__val");
      dot.className = "probe__dot " + (response.ok ? "probe__dot--ok" : "probe__dot--err");
      val.textContent = `${response.status} · ${elapsed} ms`;
      val.className = "probe__val " + (response.ok ? "" : "probe__val--err");
    } catch {
      line.querySelector(".probe__dot").className = "probe__dot probe__dot--err";
      const val = line.querySelector(".probe__val");
      val.textContent = "ulaşılamıyor";
      val.className = "probe__val probe__val--err";
    }
  }
}

function capabilities() {
  const secure = window.isSecureContext;
  return [
    ["Service Worker", "serviceWorker" in navigator],
    ["Web Share API", typeof navigator.share === "function"],
    ["Pano (Clipboard)", !!(navigator.clipboard && secure)],
    ["Web Crypto", !!(window.crypto && window.crypto.subtle)],
    ["Web Audio", !!(window.AudioContext || window.webkitAudioContext)],
    ["localStorage", (() => { try { localStorage.setItem("__t", "1"); localStorage.removeItem("__t"); return true; } catch { return false; } })()],
    ["Güvenli bağlam", secure],
  ];
}

function storageUsage() {
  let bytes = 0;
  let keys = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key.startsWith("wa:")) continue;
      bytes += key.length + (localStorage.getItem(key) || "").length;
      keys++;
    }
  } catch {
    return null;
  }
  return { bytes, keys };
}

/* --- panel ---------------------------------------------------------------- */

function renderStatus() {
  const serverBox = h("dl", { class: "kv" }, h("dt", null, "durum"), h("dd", null, "sorgulanıyor…"));
  const probeBox = h("div", { class: "probes" });
  const clientBox = h("dl", { class: "kv" });
  const capsBox = h("div", { class: "caps" });
  const storeBox = h("dl", { class: "kv" });
  const stamp = h("span", { class: "sec__count" }, "");

  const loadServer = async () => {
    clear(serverBox);
    try {
      const started = performance.now();
      const response = await fetch("/api/status", { cache: "no-store" });
      const latency = Math.round(performance.now() - started);
      const data = await response.json();
      serverBox.append(
        ...row("servis", `${data.service} v${data.version}`),
        ...row("sunucu zamanı", data.server_time),
        ...row("çalışma süresi", formatUptime(data.uptime_seconds)),
        ...row("yanıt süresi", `${latency} ms`, latency < 200 ? "ok" : ""),
        ...row("içerik", `${data.content.lab_lessons} ders · ${data.content.tools} araç · ` +
          `${data.content.notes} not · ${data.content.projects} proje`),
      );
    } catch {
      serverBox.append(...row("sunucu", "ulaşılamıyor", "err"));
    }
  };

  const loadClient = () => {
    clear(clientBox);
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    clientBox.append(
      ...row("görünüm", `${window.innerWidth}×${window.innerHeight} css px`),
      ...row("ekran", `${screen.width}×${screen.height} · DPR ${window.devicePixelRatio}`),
      ...row("giriş", window.matchMedia("(hover: hover)").matches ? "işaretçi" : "dokunmatik"),
      ...row("dil", navigator.language),
      ...row("çekirdek", navigator.hardwareConcurrency
        ? `${navigator.hardwareConcurrency} mantıksal` : "bilinmiyor"),
      ...row("bağlantı", conn && conn.effectiveType
        ? `${conn.effectiveType}${conn.downlink ? ` · ~${conn.downlink} Mbps` : ""}`
        : "tarayıcı bildirmiyor"),
      ...row("hareket tercihi", reduced ? "azaltılmış" : "normal"),
    );
  };

  const loadCaps = () => {
    clear(capsBox);
    for (const [label, supported] of capabilities()) {
      capsBox.appendChild(h("div", { class: "cap" },
        h("span", { class: "cap__mark " + (supported ? "cap__mark--on" : "cap__mark--off") },
          supported ? icon("i-check", 10) : null),
        h("span", { class: "cap__label" }, label)));
    }
  };

  const loadStorage = () => {
    clear(storeBox);
    const usage = storageUsage();
    if (!usage) {
      storeBox.append(...row("yerel depolama", "erişilemiyor", "err"));
      return;
    }
    const doneList = store.get("lab:done", []);
    storeBox.append(
      ...row("kayıt", `${usage.keys} anahtar · ${formatBytes(usage.bytes)}`),
      ...row("LAB ilerlemesi", `${doneList.length} ders tamamlandı`),
      ...row("veri konumu", "yalnızca bu cihazda"),
    );
  };

  const refresh = async () => {
    stamp.textContent = new Date().toLocaleTimeString("tr-TR");
    loadClient();
    loadCaps();
    loadStorage();
    await loadServer();
    await probeEndpoints(probeBox);
  };

  refresh();

  const section = (label, body) => h("div", null,
    h("div", { class: "sec", style: "padding:18px 0 8px" },
      h("span", { class: "sec__bar" }),
      h("span", { class: "sec__label" }, label),
      h("span", { class: "sec__rule" })),
    body);

  return h("div", null,
    h("p", { class: "lede" },
      "Bu sayfadaki her değer şu an ölçülüyor. Uydurma sayaç yok — " +
      "okunamayan bir şey varsa okunamadığı yazar."),

    h("div", { class: "btnrow" },
      h("button", {
        class: "btn btn--primary", type: "button",
        onclick: (event) => {
          event.currentTarget.disabled = true;
          event.currentTarget.textContent = "ölçülüyor…";
          refresh().finally(() => {
            event.currentTarget.disabled = false;
            event.currentTarget.textContent = "yeniden ölç";
          });
        },
      }, icon("i-refresh", 16), "yeniden ölç"),
      h("span", { class: "field__hint", style: "align-self:center" }, "son ölçüm: ", stamp)),

    section("Sunucu", h("div", { class: "card" }, serverBox)),
    section("Uç nokta sağlığı", h("div", { class: "card" }, probeBox)),
    section("İstemci", h("div", { class: "card" }, clientBox)),
    section("Tarayıcı yetenekleri", h("div", { class: "card" }, capsBox)),
    section("Yerel depolama", h("div", { class: "card" },
      storeBox,
      h("div", { class: "btnrow", style: "margin-top:14px" },
        h("button", {
          class: "btn", type: "button",
          onclick: () => {
            if (!window.confirm("LAB ilerlemen ve tercihlerin bu cihazdan silinecek. Emin misin?")) return;
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key.startsWith("wa:")) keys.push(key);
            }
            keys.forEach((key) => localStorage.removeItem(key));
            toast("yerel veriler silindi", "ok");
            loadStorage();
          },
        }, "yerel verileri sil")))));
}

export function initStatus() {
  registerPanel("status", {
    eyebrow: "Tanılama",
    title: "SYSTEM STATUS",
    render: renderStatus,
  });
}
