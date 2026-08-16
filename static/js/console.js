/* CONSOLE — site navigation only.
 *
 * Deliberately not a shell: no filesystem, no interpreter, no device access.
 * Every command is a hand-written function that scrolls, opens a panel or
 * follows a link.
 */

import { $, h, clear, store } from "./core.js";
import { IDENTITY, WHAT_I_DO, LAB, NOW, TOOLBOX } from "./data.js";
import { openModule, lessonDone, lessonTotal } from "./lab.js";
import { openProject } from "./sections.js";
import { openPalette } from "./palette.js";
import { eggCommand } from "./egg.js";

const HIST = "console:history";
let content = null;
let out, input;

function write(text, cls = "") {
  out.appendChild(h("div", { class: cls }, text));
  out.scrollTop = out.scrollHeight;
}

function goto(id, label) {
  const el = document.getElementById(id);
  if (!el) { write(`bölüm bulunamadı: ${id}`, "e"); return; }
  write(`→ ${label}`, "g");
  setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 160);
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
      write("Arama için ⌘K / Ctrl+K ya da üstteki arama düğmesi.", "d");
      write("Bu konsol yalnızca site içinde gezinir; cihazına erişmez.", "d");
    },
  },

  about: {
    desc: "kim olduğum",
    run() {
      write(IDENTITY.name, "g");
      write(IDENTITY.role, "d");
      write("");
      write(IDENTITY.statement.join(" "), "u");
      write("");
      IDENTITY.manifesto.forEach((l) => write(l));
    },
  },

  projects: {
    desc: "projeleri listele ve aç",
    run(arg) {
      if (arg) {
        const hit = content.projects.find((p) => p.id.toLowerCase() === arg)
          || content.projects.find((p) => p.title.toLowerCase().includes(arg));
        if (hit) { write(`→ ${hit.title}`, "g"); setTimeout(() => openProject(hit.id), 160); return; }
        write(`proje bulunamadı: ${arg}`, "e");
        return;
      }
      write(`${content.projects.length} yayında · ${content.archive.length} arşiv`, "g");
      content.projects.forEach((p) => write(`  ${p.title.padEnd(14, " ")}${p.summary}`));
      write("");
      write("bir projeyi açmak için: projects <ad>", "d");
      goto("projects", "PROJECTS");
    },
  },

  termux: {
    desc: "termux lab modülleri",
    run(arg) {
      if (arg) {
        const m = LAB.modules.find((x) => x.id.startsWith(arg) || x.label.toLowerCase().includes(arg));
        if (m) { write(`→ ${m.label}`, "g"); setTimeout(() => openModule(m.id), 200); return; }
        write(`modül bulunamadı: ${arg}`, "e");
        return;
      }
      write(`${LAB.subtitle}  [${lessonDone()}/${lessonTotal()} COMPLETE]`, "g");
      LAB.modules.forEach((m) =>
        write(`  ${m.index}  ${m.label.padEnd(20, " ")}${m.level}  ${m.lessons.length} ders`));
      write("");
      write("bir modülü açmak için: termux <ad>", "d");
      goto("lab", "TERMUX LAB");
    },
  },

  tools: {
    desc: "kullandığım teknolojiler",
    run() {
      TOOLBOX.forEach((t) => write(`  ${t.name.padEnd(12, " ")}${t.use}`));
      goto("toolbox", "DIGITAL TOOLBOX");
    },
  },

  now: {
    desc: "şu an ne yapıyorum",
    run() {
      NOW.blocks.forEach((b) => {
        write(b.key, "g");
        b.items.forEach((i) => write(`  ${i.title} — ${i.line}`));
        write("");
      });
      goto("now", "NOW");
    },
  },

  archive: {
    desc: "arşivlenmiş depolar",
    run() {
      write(`${content.archive.length} arşiv kaydı`, "g");
      content.archive.forEach((a) => write(`  ${a.year}  ${a.title.padEnd(20, " ")}${a.note}`));
      write("");
      write("açmak için: projects <ad>", "d");
      goto("projects", "PROJECTS");
    },
  },

  skills: {
    desc: "ne yapıyorum",
    run() {
      WHAT_I_DO.forEach((w) => write(`  ${w.label.padEnd(14, " ")}${w.line}`));
      goto("whatido", "WHAT I DO");
    },
  },

  search: {
    desc: "komut paletini aç",
    run() { write("palet açılıyor…", "g"); setTimeout(openPalette, 160); },
  },

  instagram: {
    desc: "instagram profilini aç",
    run() {
      write(`${IDENTITY.handle} açılıyor…`, "g");
      window.open(IDENTITY.instagram, "_blank", "noopener");
    },
  },

  contact: {
    desc: "mesaj formunu aç",
    run() {
      write("iletişim formu açılıyor…", "g");
      const b = $("#contactBtn");
      if (b) setTimeout(() => b.click(), 180);
    },
  },

  session: {
    desc: "bu oturumun bilgileri",
    run() {
      write(`viewport   ${window.innerWidth}×${window.innerHeight}`);
      write(`device     ${matchMedia("(hover: none)").matches ? "MOBILE" : "DESKTOP"}`);
      write(`online     ${navigator.onLine ? "YES" : "NO"}`);
      write(`local time ${new Date().toLocaleTimeString("tr-TR", { hour12: false })}`);
      write("");
      write("Tarayıcından okundu, hiçbir yere gönderilmedi.", "d");
      goto("session", "SESSION");
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

  if (eggCommand(line, write)) return;

  const [name, ...rest] = line.toLowerCase().split(/\s+/);
  const cmd = COMMANDS[name];
  if (!cmd) {
    write(`komut bulunamadı: ${name}`, "e");
    write("help yazarak listeyi görebilirsin.", "d");
    return;
  }
  cmd.run(rest.join(" ").trim());
}

export function initConsole(bootContent) {
  content = bootContent;
  const host = $("#term");
  if (!host) return;

  out = h("div", { class: "term__out" });
  input = h("input", {
    class: "term__in", type: "text", autocomplete: "off", autocapitalize: "off",
    autocorrect: "off", spellcheck: "false", placeholder: "komut yaz…",
    "aria-label": "Konsol komut girişi",
  });

  let history = store.get(HIST, []);
  if (!Array.isArray(history)) history = [];
  let hi = -1;

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const v = input.value;
      if (!v.trim()) return;
      history.unshift(v);
      history = history.slice(0, 40);
      store.set(HIST, history);
      hi = -1;
      input.value = "";
      exec(v);
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

  const keys = ["help", "about", "projects", "termux", "tools", "now",
                "archive", "instagram", "contact", "clear"];

  clear(host);
  host.append(
    h("div", { class: "term__bar" },
      h("span", { class: "term__dots" }, h("i"), h("i"), h("i")),
      h("span", { class: "term__ttl" }, "arda.os / console"),
      h("span", { class: "term__safe" }, "SITE ONLY")),
    out,
    h("div", { class: "term__line" }, h("span", { class: "term__ps" }, ">"), input),
    h("div", { class: "term__keys" },
      keys.map((k) => h("button", {
        class: "term__key", type: "button",
        onclick: () => { exec(k); },
      }, k))),
  );

  out.addEventListener("click", () => {
    if (!window.getSelection().toString()) input.focus();
  });

  intro();
}
