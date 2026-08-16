/* CONSOLE — site navigation only.
 *
 * This is deliberately NOT a shell. There is no filesystem, no interpreter and
 * no way to reach the device: every command is a fixed, hand-written function
 * that scrolls the page, opens a modal or follows a link.
 */

import { $, h, clear, store } from "./core.js";
import { IDENTITY, WHAT_I_DO, LAB, NOW, TOOLBOX } from "./data.js";

const HIST_KEY = "console:history";
let content = null;
let out, input;

function write(text, cls = "") {
  out.appendChild(h("div", { class: cls }, text));
  out.scrollTop = out.scrollHeight;
}

function goto(id, label) {
  const target = document.getElementById(id);
  if (!target) { write(`bölüm bulunamadı: ${id}`, "e"); return; }
  write(`→ ${label}`, "g");
  setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 180);
}

const COMMANDS = {
  help: {
    desc: "komut listesi",
    run() {
      write("KOMUTLAR", "g");
      write("");
      for (const [name, cmd] of Object.entries(COMMANDS)) {
        write(`  ${name.padEnd(11, " ")}${cmd.desc}`);
      }
      write("");
      write("Bu konsol yalnızca site içinde gezinir.", "d");
      write("Sistem komutu çalıştırmaz, cihazına erişmez.", "d");
    },
  },

  about: {
    desc: "kim olduğum",
    run() {
      write(IDENTITY.name, "g");
      write(IDENTITY.role, "d");
      write("");
      IDENTITY.manifesto.forEach((line) => write(line));
      write("");
      write(IDENTITY.intro, "d");
    },
  },

  projects: {
    desc: "projelere git",
    run() {
      const total = content.projects.length + content.archive.length;
      write(`${total} kayıt — ${content.projects.length} yayında, ${content.archive.length} arşiv`);
      content.projects.forEach((p) => write(`  [yayında] ${p.title} — ${p.summary}`));
      content.archive.forEach((a) => write(`  [arşiv]   ${a.title}`, "d"));
      goto("projects", "PROJECTS");
    },
  },

  termux: {
    desc: "termux lab'e git",
    run() {
      write(LAB.subtitle, "g");
      LAB.categories.forEach((c) => write(`  ${c.cmd.padEnd(16, " ")}${c.line}`));
      goto("lab", "TERMUX LAB");
    },
  },

  stack: {
    desc: "kullandığım teknolojiler",
    run() {
      TOOLBOX.forEach((t) => write(`  ${t.name.padEnd(12, " ")}${t.use}`));
      goto("toolbox", "DIGITAL TOOLBOX");
    },
  },

  now: {
    desc: "şu an ne yapıyorum",
    run() {
      write("CURRENTLY BUILDING", "g");
      NOW.building.forEach((x) => write(`  ${x}`));
      write("");
      write("CURRENTLY LEARNING", "g");
      NOW.learning.forEach((x) => write(`  ${x}`));
      write("");
      write("CURRENTLY EXPLORING", "g");
      NOW.exploring.forEach((x) => write(`  ${x}`));
      goto("now", "NOW");
    },
  },

  skills: {
    desc: "ne yapıyorum",
    run() {
      WHAT_I_DO.forEach((w) => write(`  ${w.label.padEnd(14, " ")}${w.line}`));
      goto("whatido", "WHAT I DO");
    },
  },

  instagram: {
    desc: "instagram profilini aç",
    run() {
      write(`${IDENTITY.handle} açılıyor…`, "g");
      window.open(IDENTITY.instagram, "_blank", "noopener");
    },
  },

  share: {
    desc: "paylaşım bölümüne git",
    run() { goto("connect", "CONNECT"); },
  },

  contact: {
    desc: "mesaj formunu aç",
    run() {
      write("iletişim formu açılıyor…", "g");
      const btn = $("#contactBtn");
      if (btn) setTimeout(() => btn.click(), 200);
    },
  },

  status: {
    desc: "sistem durumuna git",
    run() { goto("status", "SYSTEM STATUS"); },
  },

  whoami: {
    desc: "ziyaretçi bilgisi",
    run() {
      write(`viewport   ${window.innerWidth}×${window.innerHeight}`);
      write(`dil        ${navigator.language}`);
      write(`bağlantı   ${navigator.onLine ? "çevrimiçi" : "çevrimdışı"}`);
      write(`giriş      ${matchMedia("(hover: hover)").matches ? "işaretçi" : "dokunmatik"}`);
      write("");
      write("Bu değerler tarayıcından okundu, hiçbir yere gönderilmedi.", "d");
    },
  },

  motion: {
    desc: "animasyonları aç/kapat",
    run() {
      const root = document.documentElement;
      const next = root.dataset.motion === "off" ? "on" : "off";
      root.dataset.motion = next;
      store.set("motion", next);
      write(next === "off" ? "animasyonlar kapatıldı" : "animasyonlar açıldı", "g");
    },
  },

  clear: {
    desc: "ekranı temizle",
    run() { clear(out); intro(); },
  },
};

function intro() {
  write("ARDA.OS CONSOLE", "g");
  write("Site içi gezinme. Sistem erişimi yok.", "d");
  write("");
  write("help yazarak başla.", "d");
  write("");
}

function exec(raw) {
  const line = raw.trim();
  if (!line) return;
  write(`> ${line}`, "u");

  const name = line.split(/\s+/)[0].toLowerCase();
  const cmd = COMMANDS[name];
  if (!cmd) {
    write(`komut bulunamadı: ${name}`, "e");
    write("help yazarak listeyi görebilirsin.", "d");
    return;
  }
  cmd.run();
}

export function initConsole(bootContent) {
  content = bootContent;
  const host = $("#term");
  if (!host) return;

  out = h("div", { class: "term__out" });
  input = h("input", {
    class: "term__in",
    type: "text",
    autocomplete: "off",
    autocapitalize: "off",
    autocorrect: "off",
    spellcheck: "false",
    placeholder: "komut yaz…",
    "aria-label": "Konsol komut girişi",
  });

  let history = store.get(HIST_KEY, []);
  if (!Array.isArray(history)) history = [];
  let hi = -1;

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = input.value;
      if (!value.trim()) return;
      history.unshift(value);
      history = history.slice(0, 40);
      store.set(HIST_KEY, history);
      hi = -1;
      input.value = "";
      exec(value);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (hi < history.length - 1) hi++;
      input.value = history[hi] || "";
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      hi = Math.max(-1, hi - 1);
      input.value = hi === -1 ? "" : history[hi];
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const q = input.value.trim().toLowerCase();
      if (!q) return;
      const hit = Object.keys(COMMANDS).find((k) => k.startsWith(q) && k !== q);
      if (hit) input.value = hit;
    }
  });

  const keys = ["help", "about", "projects", "termux", "now", "stack",
                "whoami", "instagram", "clear"];

  clear(host);
  host.appendChild(h("div", { class: "term__bar" },
    h("span", { class: "term__dots" }, h("i"), h("i"), h("i")),
    h("span", { class: "term__ttl" }, "arda.os / console"),
    h("span", { class: "term__safe" }, "SITE ONLY")));
  host.appendChild(out);
  host.appendChild(h("div", { class: "term__line" },
    h("span", { class: "term__ps" }, ">"),
    input));
  host.appendChild(h("div", { class: "term__keys" },
    keys.map((k) => h("button", {
      class: "term__key",
      type: "button",
      onclick: () => { input.value = k; exec(k); input.value = ""; },
    }, k))));

  out.addEventListener("click", () => {
    if (!window.getSelection().toString()) input.focus();
  });

  intro();
}
