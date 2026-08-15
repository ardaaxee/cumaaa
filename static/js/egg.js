/* Hidden panel and the three ways in.
 *
 * Unlocking is persisted, so once found it stays found and a marker appears on
 * the home screen. The reward is a real tool, not a joke screen.
 */

import { $, h, icon, store, copy, toast } from "./core.js";
import { registerPanel, open } from "./ui.js";

const UNLOCK_KEY = "egg:unlocked";
const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
                "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

/* 5x7 block font — the same glyph shapes used for the OG image, in the browser. */
const GLYPHS = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  0: ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  1: ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  2: ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  3: ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  4: ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  5: ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  6: ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  7: ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  8: ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  9: ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  "@": ["01110", "10001", "10111", "10101", "10111", "10000", "01110"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  "?": ["01110", "10001", "00001", "00010", "00100", "00000", "00100"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
};

function banner(text, filled = "█", empty = " ") {
  const chars = text.toLocaleUpperCase("tr-TR")
    .replace(/İ/g, "I").replace(/Ğ/g, "G").replace(/Ü/g, "U")
    .replace(/Ş/g, "S").replace(/Ö/g, "O").replace(/Ç/g, "C")
    .split("")
    .filter((c) => GLYPHS[c] !== undefined);
  if (!chars.length) return "";

  const rows = [];
  for (let line = 0; line < 7; line++) {
    let row = "";
    for (const char of chars) {
      row += GLYPHS[char][line].split("").map((b) => (b === "1" ? filled : empty)).join("") + empty;
    }
    rows.push(row.replace(/\s+$/, ""));
  }
  return rows.join("\n");
}

export function isUnlocked() {
  return !!store.get(UNLOCK_KEY);
}

function unlock(how) {
  if (isUnlocked()) { open("void"); return; }
  store.set(UNLOCK_KEY, { at: new Date().toISOString(), how });
  const marker = $("#voidRow");
  if (marker) marker.hidden = false;
  toast("gizli bölüm açıldı", "ok");
  setTimeout(() => open("void"), 420);
}

/* --- the hidden panel ----------------------------------------------------- */

function renderVoid() {
  const record = store.get(UNLOCK_KEY) || {};
  const input = h("input", {
    class: "input input--mono", value: "ARDA", maxlength: "14",
    "aria-label": "Banner metni",
  });
  const output = h("pre", { class: "out", style: "font-size:9px;line-height:1.05;overflow-x:auto" });

  const styles = [["█", " "], ["#", "."], ["●", "·"], ["▓", "░"]];
  let styleIndex = 0;

  const draw = () => {
    const [filled, empty] = styles[styleIndex];
    output.textContent = banner(input.value || "ARDA", filled, empty) || "(çizilebilir karakter yok)";
  };
  input.addEventListener("input", draw);
  draw();

  const howLabel = {
    konami: "Konami kodu",
    taps: "isme yedi kez dokunma",
    command: "terminalde gizli komut",
  }[record.how] || "bilinmiyor";

  return h("div", null,
    h("div", { class: "voidhead" },
      h("span", { class: "pill pill--on" }, "gizli bölüm"),
      h("h3", { class: "note__title", style: "margin-top:12px" }, "Buraya nasıl geldin"),
      h("p", { class: "lede" },
        `Bu bölüm ${howLabel} ile açıldı. Üç yolu var ve hepsi çalışıyor — ` +
        "kalanları da bulmak sana kalmış.")),

    h("div", { class: "lsn__block" },
      h("div", { class: "lsn__h" }, "ASCII banner üreteci"),
      h("p", { class: "lsn__p", style: "margin-bottom:12px" },
        "Sitenin OG görselini ve ikonlarını üreten aynı bitmap font, tarayıcıda. " +
        "Yaz, kopyala, README'ne yapıştır."),
      h("label", { class: "field" }, h("span", { class: "field__label" }, "Metin"), input),
      h("div", { class: "btnrow", style: "margin-bottom:12px" },
        h("button", {
          class: "btn", type: "button",
          onclick: () => { styleIndex = (styleIndex + 1) % styles.length; draw(); },
        }, "stil değiştir"),
        h("button", {
          class: "btn btn--primary", type: "button",
          onclick: async () => {
            const ok = await copy(output.textContent);
            toast(ok ? "kopyalandı" : "kopyalanamadı", ok ? "ok" : "err");
          },
        }, icon("i-copy", 16), "kopyala")),
      output),

    h("div", { class: "lsn__block" },
      h("div", { class: "lsn__h" }, "Kayıt"),
      h("dl", { class: "kv" },
        h("dt", null, "açılış"),
        h("dd", null, record.at ? new Date(record.at).toLocaleString("tr-TR") : "—"),
        h("dt", null, "yöntem"),
        h("dd", null, howLabel),
        h("dt", null, "diğer yollar"),
        h("dd", null, "3 taneden 1'ini buldun"))),

    h("div", { class: "btnrow" },
      h("button", { class: "btn", type: "button", onclick: () => open("terminal") },
        "terminale dön"),
      h("a", {
        class: "btn btn--primary",
        href: "https://instagram.com/lov4ardaa",
        target: "_blank", rel: "noopener",
      }, icon("i-ig", 16), "bunu bulduğunu söyle")));
}

/* --- the three ways in ---------------------------------------------------- */

export function initEgg() {
  registerPanel("void", { eyebrow: "// void", title: "VOID", path: false, render: renderVoid });

  if (isUnlocked()) {
    const marker = $("#voidRow");
    if (marker) marker.hidden = false;
  }

  // 1. Konami code, for anyone on a keyboard.
  let progress = 0;
  document.addEventListener("keydown", (event) => {
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") { progress = 0; return; }
    const expected = KONAMI[progress];
    if (event.key.toLowerCase() === expected.toLowerCase()) {
      progress++;
      if (progress === KONAMI.length) { progress = 0; unlock("konami"); }
    } else {
      progress = event.key === KONAMI[0] ? 1 : 0;
    }
  });

  // 2. Seven taps on the wordmark, for phones. The window is deliberately
  // generous — a person tapping a phone is slower than a person mashing keys.
  const wordmark = $("#wordmark");
  if (wordmark) {
    let taps = 0;
    let timer = null;
    wordmark.addEventListener("click", () => {
      taps++;
      clearTimeout(timer);
      timer = setTimeout(() => { taps = 0; }, 2400);
      if (!isUnlocked()) {
        if (taps === 4) toast("bir şey oluyor…");
        else if (taps === 6) toast("neredeyse");
      }
      if (taps >= 7) { taps = 0; unlock("taps"); }
    });
  }
}

/* 3. A secret command, wired in by the terminal panel. */
export function eggCommand(line, write) {
  const word = line.trim().toLowerCase();
  if (word !== "sudo void" && word !== "xyzzy" && word !== "whoisarda") return false;
  write("", "");
  write(banner("VOID", "█", " "), "u");
  write("", "");
  unlock("command");
  return true;
}

export { banner };
