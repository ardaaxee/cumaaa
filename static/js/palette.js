/* Command centre — one surface that is both fuzzy search and command runner.
 *
 * It is a real index over real content: anything reachable here exists, and
 * every command actually does what it says. Nothing is decorative. */

import { $, h, clear, store, toast } from "./core.js";
import { open, close, currentPanel } from "./ui.js";

let content = null;
let commands = [];
let node, input, results, logHost;
let isOpen = false;
let active = 0;
let current = [];

const KIND_LABEL = {
  command: "komut",
  lesson: "ders",
  tool: "araç",
  project: "proje",
  note: "not",
  playground: "deney",
  archive: "arşiv",
};

/* Fold Turkish characters so "ogren" matches "öğren". */
function fold(text) {
  return String(text).toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u")
    .replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c");
}

function score(query, candidate) {
  const q = fold(query);
  const c = fold(candidate);
  if (!q) return 0;
  if (c === q) return 1000;
  if (c.startsWith(q)) return 700 - c.length;
  const index = c.indexOf(q);
  if (index !== -1) return 500 - index - c.length * 0.1;

  // subsequence fallback: every query char in order
  let position = 0;
  for (const char of q) {
    position = c.indexOf(char, position);
    if (position === -1) return -1;
    position++;
  }
  return 200 - c.length * 0.1;
}

function search(query) {
  const items = [];

  for (const command of commands) {
    const best = Math.max(score(query, command.name), score(query, command.desc) * 0.55);
    if (best > 0) {
      items.push({
        kind: "command",
        title: command.name,
        sub: command.desc,
        score: best + 60, // commands outrank content on equal footing
        run: () => runCommand(command),
      });
    }
  }

  for (const entry of content.search) {
    const keywords = (entry.keywords || []).join(" ");
    const best = Math.max(
      score(query, entry.title),
      score(query, entry.sub) * 0.5,
      score(query, keywords) * 0.62);
    if (best > 0) {
      items.push({
        kind: entry.type,
        title: entry.title,
        sub: entry.sub,
        score: best,
        run: () => openEntry(entry),
      });
    }
  }

  return items.sort((a, b) => b.score - a.score).slice(0, 24);
}

function openEntry(entry) {
  closePalette();
  const detail = {
    lesson: "lesson", tool: "tool", project: "project",
    note: "note", playground: "experiment",
  }[entry.type];

  if (entry.type === "archive") { open("archive"); return; }
  if (detail && entry.arg) open(detail, entry.arg);
  else open(entry.target);
}

function log(lines) {
  clear(logHost);
  logHost.hidden = false;
  logHost.className = "palette__log";
  for (const line of lines) {
    const row = h("div", null);
    row.innerHTML = line;
    logHost.appendChild(row);
  }
}

function runCommand(command) {
  switch (command.action) {
    case "help":
      log([
        "<b>Komutlar</b>",
        ...commands.map((c) => `${c.name.padEnd(12, " ").replace(/ /g, "&nbsp;")} ${c.desc}`),
        "",
        "İstediğin şeyin adını yazarak da arayabilirsin.",
      ]);
      input.value = "";
      render("");
      return;

    case "nav":
      closePalette();
      if (command.target === "home") { close(); window.scrollTo({ top: 0 }); return; }
      open(command.target);
      return;

    case "external":
      window.open(command.target, "_blank", "noopener");
      closePalette();
      return;

    case "theme": {
      const root = document.documentElement;
      const next = root.dataset.contrast === "high" ? "normal" : "high";
      root.dataset.contrast = next;
      store.set("contrast", next);
      toast(next === "high" ? "yüksek kontrast açık" : "normal kontrast", "ok");
      closePalette();
      return;
    }

    case "motion": {
      const root = document.documentElement;
      const next = root.dataset.motion === "off" ? "on" : "off";
      root.dataset.motion = next;
      store.set("motion", next);
      toast(next === "off" ? "hareket kapalı" : "hareket açık", "ok");
      closePalette();
      return;
    }

    case "status":
      log(["<b>durum sorgulanıyor…</b>"]);
      fetch("/api/status")
        .then((response) => response.json())
        .then((data) => {
          const uptime = data.uptime_seconds;
          const pretty = uptime < 60 ? `${uptime} sn`
            : uptime < 3600 ? `${Math.floor(uptime / 60)} dk`
            : `${Math.floor(uptime / 3600)} sa ${Math.floor((uptime % 3600) / 60)} dk`;
          log([
            `<b>${data.service}</b> v${data.version}`,
            `sunucu zamanı  ${data.server_time}`,
            `çalışma süresi ${pretty}`,
            `ders ${data.content.lab_lessons} · araç ${data.content.tools} · ` +
            `not ${data.content.notes} · proje ${data.content.projects}`,
          ]);
        })
        .catch(() => log(["<b>durum alınamadı</b> — sunucuya ulaşılamıyor"]));
      input.value = "";
      render("");
      return;

    case "clear":
      logHost.hidden = true;
      clear(logHost);
      input.value = "";
      render("");
      return;

    default:
      toast("bilinmeyen komut", "err");
  }
}

function render(query) {
  clear(results);
  active = 0;

  if (!query.trim()) {
    current = commands.slice(0, 8).map((command) => ({
      kind: "command",
      title: command.name,
      sub: command.desc,
      run: () => runCommand(command),
    }));
    results.appendChild(h("div", { class: "palette__group" }, "komutlar"));
  } else {
    current = search(query);
    if (!current.length) {
      results.appendChild(h("div", { class: "empty" },
        `"${query}" için sonuç yok. help yazarak komutları görebilirsin.`));
      return;
    }
    results.appendChild(h("div", { class: "palette__group" },
      `${current.length} sonuç`));
  }

  current.forEach((item, index) => {
    results.appendChild(h("button", {
      class: "res" + (index === 0 ? " is-active" : ""),
      type: "button",
      onclick: () => item.run(),
    },
      h("span", { class: "res__kind" }, KIND_LABEL[item.kind] || item.kind),
      h("span", { class: "res__body" },
        h("span", { class: "res__title" }, item.title),
        item.sub ? h("span", { class: "res__sub" }, item.sub) : null)));
  });
}

function moveActive(delta) {
  const nodes = results.querySelectorAll(".res");
  if (!nodes.length) return;
  nodes[active] && nodes[active].classList.remove("is-active");
  active = (active + delta + nodes.length) % nodes.length;
  nodes[active].classList.add("is-active");
  nodes[active].scrollIntoView({ block: "nearest" });
}

export function openPalette() {
  if (isOpen) return;
  isOpen = true;
  node.hidden = false;
  requestAnimationFrame(() => node.classList.add("is-open"));
  input.value = "";
  render("");
  // Only autofocus where a hardware keyboard is likely; avoids a keyboard
  // popping up and covering the results on touch devices.
  if (window.matchMedia("(hover: hover)").matches) {
    setTimeout(() => input.focus(), 60);
  }
}

export function closePalette() {
  if (!isOpen) return;
  isOpen = false;
  node.classList.remove("is-open");
  input.blur();
  setTimeout(() => { node.hidden = true; }, 220);
}

export function togglePalette() {
  isOpen ? closePalette() : openPalette();
}

export function initPalette(bootContent) {
  content = bootContent;
  node = $("#palette");
  input = $("#paletteInput");
  results = $("#paletteResults");
  logHost = $("#paletteLog");

  commands = [
    { name: "help", desc: "Tüm komutları listele", action: "help" },
    { name: "home", desc: "Ana ekrana dön", action: "nav", target: "home" },
    { name: "explore", desc: "Keşif destesini aç", action: "nav", target: "explore" },
    { name: "terminal", desc: "İnteraktif terminali aç", action: "nav", target: "terminal" },
    { name: "cheatsheet", desc: "Komut kartını aç", action: "nav", target: "cheatsheet" },
    { name: "status", desc: "Sistem durumunu aç", action: "nav", target: "status" },
    { name: "lab", desc: "Termux LAB'i aç", action: "nav", target: "lab" },
    { name: "termux", desc: "Termux LAB'i aç", action: "nav", target: "lab" },
    { name: "tools", desc: "Araçları aç", action: "nav", target: "tools" },
    { name: "projects", desc: "Projeleri aç", action: "nav", target: "projects" },
    { name: "playground", desc: "Deneyleri aç", action: "nav", target: "playground" },
    { name: "notes", desc: "Notları aç", action: "nav", target: "notes" },
    { name: "archive", desc: "Arşivi aç", action: "nav", target: "archive" },
    { name: "drops", desc: "Son güncellemeleri göster", action: "nav", target: "drops" },
    { name: "contact", desc: "İletişim formunu aç", action: "nav", target: "contact" },
    { name: "share", desc: "Paylaşım ve QR panelini aç", action: "nav", target: "share" },
    { name: "instagram", desc: "Instagram profilini aç", action: "external", target: content.profile.instagram },
    { name: "github", desc: "GitHub profilini aç", action: "external", target: "https://github.com/ardaaxee" },
    { name: "theme", desc: "Yüksek kontrast modunu aç/kapat", action: "theme" },
    { name: "motion", desc: "Hareket efektlerini aç/kapat", action: "motion" },
    { name: "ping", desc: "Sunucu durumunu satır içi göster", action: "status" },
    { name: "clear", desc: "Çıktıyı temizle", action: "clear" },
  ];

  $("#paletteClose").addEventListener("click", closePalette);

  input.addEventListener("input", () => render(input.value));

  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") { event.preventDefault(); moveActive(1); return; }
    if (event.key === "ArrowUp") { event.preventDefault(); moveActive(-1); return; }
    if (event.key === "Escape") { event.preventDefault(); closePalette(); return; }
    if (event.key === "Enter") {
      event.preventDefault();
      const typed = input.value.trim();
      // An exact command name always wins over the highlighted result.
      const exact = commands.find((command) => fold(command.name) === fold(typed));
      if (exact) { runCommand(exact); return; }
      if (current[active]) current[active].run();
    }
  });

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      togglePalette();
      return;
    }
    // "/" opens search when the user is not already typing somewhere
    if (event.key === "/" && !isOpen && !currentPanel()) {
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      event.preventDefault();
      openPalette();
    }
  });

  document.addEventListener("click", (event) => {
    if (!isOpen) return;
    if (!node.contains(event.target) && !event.target.closest("[data-open='cmd']")) {
      closePalette();
    }
  });
}
