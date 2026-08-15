/* TERMINAL — the sandbox as a first-class panel.
 *
 * Same interpreter as the LAB lessons, but full height and with a small layer
 * of site-level commands on top so the terminal can actually drive the site.
 */

import { h } from "./core.js";
import { registerPanel, open, hasPanel, close } from "./ui.js";
import { createTerminal } from "./term.js";
import { getVFS } from "./lab.js";
import { eggCommand } from "./egg.js";

let content = null;

const SITE_HELP = [
  "Bu terminal sanal bir dosya sistemi üzerinde çalışır.",
  "",
  "Site komutları:",
  "  open <bölüm>   paneli aç (lab, tools, projects, notes, explore, status…)",
  "  explore        keşif destesini aç",
  "  about          site hakkında",
  "  instagram      Instagram profilini aç",
  "  exit           terminali kapat",
  "",
  "Dosya sistemi komutları için: help",
];

function siteCommand(line, write) {
  if (eggCommand(line, write)) return true;

  const [name, ...rest] = line.split(/\s+/);
  const arg = rest.join(" ").trim();

  switch (name) {
    case "open": {
      if (!arg) { write("kullanım: open <bölüm>", "e"); return true; }
      if (!hasPanel(arg)) {
        write(`open: '${arg}' diye bir bölüm yok`, "e");
        write("bölümler: explore, lab, tools, projects, playground, notes, archive, status, contact, share", "");
        return true;
      }
      write(`${arg} açılıyor…`, "g");
      setTimeout(() => open(arg), 160);
      return true;
    }

    case "explore":
      write("keşif destesi açılıyor…", "g");
      setTimeout(() => open("explore"), 160);
      return true;

    case "instagram":
      write(`${content.profile.handle} açılıyor…`, "g");
      window.open(content.profile.instagram, "_blank", "noopener");
      return true;

    case "about":
      write(`${content.profile.name} — ${content.profile.handle}`, "u");
      write(content.profile.tagline, "");
      write("", "");
      write(`whoisarda v${content.version} · Flask + vanilla JS`, "");
      write(`${content.counts.lab_lessons} ders · ${content.counts.tools} araç · ` +
            `${content.counts.notes} not · ${content.counts.playground} deney`, "");
      return true;

    case "sitehelp":
      SITE_HELP.forEach((l) => write(l, ""));
      return true;

    case "exit":
      write("kapatılıyor…", "g");
      setTimeout(close, 200);
      return true;

    default:
      return false;
  }
}

function renderTerminal() {
  const vfs = getVFS();

  const term = createTerminal({
    vfs,
    height: "min(56dvh, 460px)",
    autofocus: true,
    intro: [
      { text: `whoisarda terminal — v${content.version}`, cls: "u" },
      { text: "Sanal ortam. Kendi cihazında hiçbir şey çalışmaz, hiçbir şey değişmez.", cls: "g" },
      { text: "", cls: "" },
      { text: "help       dosya sistemi komutları", cls: "" },
      { text: "sitehelp   site komutları", cls: "" },
      { text: "", cls: "" },
    ],
    keys: ["ls", "ls -la", "cd ~", "pwd", "tree", "cat", "mkdir", "touch",
           "echo", "grep", "find", "|", ">", "pkg install", "git status",
           "open lab", "sitehelp", "clear"],
    onCommand: siteCommand,
  });

  return h("div", null,
    h("p", { class: "lede" },
      "Gerçek bir yorumlayıcı: borular, yönlendirme, git ve pkg çalışır. " +
      "Tab ile tamamla, yukarı ok ile geçmişte gez."),
    term.node,
    h("div", { class: "card", style: "margin-top:14px" },
      h("h3", { class: "card__title" }, "Ne deneyebilirsin"),
      h("div", { class: "bullets", style: "margin-top:10px" },
        h("div", { class: "bullet" }, "ls -la  —  gizli dosyalar dahil uzun liste"),
        h("div", { class: "bullet" }, "echo merhaba > not.txt  —  dosyaya yaz"),
        h("div", { class: "bullet" }, "ls | grep txt  —  boru ile süz"),
        h("div", { class: "bullet" }, "git init && git status  —  depo başlat"),
        h("div", { class: "bullet" }, "open lab  —  siteyi terminalden gez"))),
    h("div", { class: "btnrow", style: "margin-top:14px" },
      h("button", {
        class: "btn btn--primary", type: "button",
        onclick: () => open("lab"),
      }, "sıfırdan öğrenmek istiyorum"),
      h("button", {
        class: "btn", type: "button",
        onclick: () => { open("cheatsheet"); },
      }, "komut kartı")));
}

export function initTerminal(bootContent) {
  content = bootContent;
  registerPanel("terminal", {
    eyebrow: "Sanal ortam",
    title: "TERMINAL",
    render: renderTerminal,
  });
}
