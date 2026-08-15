/* Tools. Everything runs on the visitor's device except QR rendering, which
 * uses this site's own /api/qr endpoint. No third-party services are called. */

import { h, clear, icon, copy, toast, debounce } from "./core.js";
import { registerPanel, open } from "./ui.js";

let content = null;

/* --- small builders ------------------------------------------------------- */

function field(label, control, hint) {
  return h("label", { class: "field" },
    h("span", { class: "field__label" }, label),
    control,
    hint ? h("span", { class: "field__hint" }, hint) : null);
}

function textarea(props = {}) {
  return h("textarea", { class: "textarea textarea--mono", spellcheck: "false", ...props });
}

function input(props = {}) {
  return h("input", { class: "input", autocomplete: "off", spellcheck: "false", ...props });
}

function outBox(text = "") {
  return h("pre", { class: "out" }, text);
}

function copyButton(getText, label = "kopyala") {
  return h("button", {
    class: "btn",
    type: "button",
    onclick: async () => {
      const value = getText();
      if (!value) { toast("kopyalanacak bir şey yok"); return; }
      const ok = await copy(value);
      toast(ok ? "kopyalandı" : "kopyalanamadı", ok ? "ok" : "err");
    },
  }, icon("i-copy", 16), label);
}

/* --- tools ---------------------------------------------------------------- */

const TOOLS = {

  qr() {
    const frag = document.createDocumentFragment();
    const value = input({ value: location.origin, placeholder: "metin veya bağlantı" });
    const canvas = h("canvas", { width: 320, height: 320, "aria-label": "QR kod" });
    const frame = h("div", { class: "qr__frame" }, canvas);
    const info = h("p", { class: "field__hint" }, "");
    let lastMatrix = null;

    const draw = async () => {
      const text = value.value.trim();
      if (!text) { info.textContent = "Bir metin gir."; return; }
      try {
        const res = await fetch("/api/qr?format=json&data=" + encodeURIComponent(text));
        const data = await res.json();
        if (!data.ok) { info.textContent = data.error || "üretilemedi"; return; }

        lastMatrix = data.matrix;
        const quiet = 4;
        const size = data.size + quiet * 2;
        const scale = Math.max(2, Math.floor(640 / size));
        canvas.width = size * scale;
        canvas.height = size * scale;

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#000000";
        for (let r = 0; r < data.size; r++) {
          for (let c = 0; c < data.size; c++) {
            if (data.matrix[r][c]) {
              ctx.fillRect((c + quiet) * scale, (r + quiet) * scale, scale, scale);
            }
          }
        }
        info.textContent = `${data.size}×${data.size} modül · hata düzeltme ${data.ec}`;
      } catch {
        info.textContent = "QR üretilemedi — bağlantı hatası";
      }
    };

    value.addEventListener("input", debounce(draw, 260));

    frag.appendChild(field("İçerik", value, "Bağlantı, metin veya iletişim bilgisi olabilir."));
    frag.appendChild(frame);
    frag.appendChild(info);
    frag.appendChild(h("div", { class: "btnrow" },
      h("button", {
        class: "btn btn--primary",
        type: "button",
        onclick: () => {
          if (!lastMatrix) { toast("önce bir QR üret"); return; }
          canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = h("a", { href: url, download: "qr.png" });
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            toast("PNG indirildi", "ok");
          }, "image/png");
        },
      }, "PNG indir"),
      copyButton(() => value.value.trim(), "içeriği kopyala")));

    draw();
    return frag;
  },

  json() {
    const source = textarea({ placeholder: '{"merhaba": "dunya"}', rows: 7 });
    const out = outBox("");
    const status = h("p", { class: "field__hint" }, "");

    const apply = (mode) => {
      const raw = source.value.trim();
      if (!raw) { out.textContent = ""; status.textContent = "Bir JSON yapıştır."; return; }
      try {
        const parsed = JSON.parse(raw);
        out.textContent = mode === "min"
          ? JSON.stringify(parsed)
          : JSON.stringify(parsed, null, 2);
        out.className = "out out--ok";
        const count = (obj) => {
          if (Array.isArray(obj)) return obj.reduce((n, v) => n + count(v), 1);
          if (obj && typeof obj === "object") {
            return Object.values(obj).reduce((n, v) => n + count(v), 1);
          }
          return 1;
        };
        status.textContent = `geçerli JSON · ${count(parsed)} düğüm · ${out.textContent.length} karakter`;
      } catch (err) {
        out.textContent = String(err.message);
        out.className = "out out--err";
        status.textContent = "geçersiz JSON";
      }
    };

    return h("div", null,
      field("JSON", source),
      h("div", { class: "btnrow" },
        h("button", { class: "btn btn--primary", type: "button", onclick: () => apply("pretty") }, "biçimlendir"),
        h("button", { class: "btn", type: "button", onclick: () => apply("min") }, "küçült"),
        copyButton(() => out.textContent)),
      status,
      out);
  },

  base64() {
    const source = textarea({ placeholder: "metin ya da base64", rows: 5 });
    const out = outBox("");

    const encode = () => {
      try {
        const bytes = new TextEncoder().encode(source.value);
        let binary = "";
        for (const byte of bytes) binary += String.fromCharCode(byte);
        out.textContent = btoa(binary);
        out.className = "out out--ok";
      } catch (err) {
        out.textContent = "kodlanamadı: " + err.message;
        out.className = "out out--err";
      }
    };

    const decode = () => {
      try {
        const binary = atob(source.value.trim());
        const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
        out.textContent = new TextDecoder().decode(bytes);
        out.className = "out out--ok";
      } catch {
        out.textContent = "geçerli bir base64 değil";
        out.className = "out out--err";
      }
    };

    return h("div", null,
      field("Girdi", source, "Türkçe karakterler UTF-8 olarak işlenir."),
      h("div", { class: "btnrow" },
        h("button", { class: "btn btn--primary", type: "button", onclick: encode }, "kodla"),
        h("button", { class: "btn", type: "button", onclick: decode }, "çöz"),
        copyButton(() => out.textContent)),
      out);
  },

  url() {
    const source = textarea({ placeholder: "https://ornek.com/ara?q=merhaba dünya", rows: 4 });
    const out = outBox("");
    return h("div", null,
      field("Girdi", source),
      h("div", { class: "btnrow" },
        h("button", {
          class: "btn btn--primary", type: "button",
          onclick: () => { out.textContent = encodeURIComponent(source.value); out.className = "out out--ok"; },
        }, "kodla"),
        h("button", {
          class: "btn", type: "button",
          onclick: () => {
            try {
              out.textContent = decodeURIComponent(source.value);
              out.className = "out out--ok";
            } catch {
              out.textContent = "çözülemedi — geçersiz kodlama";
              out.className = "out out--err";
            }
          },
        }, "çöz"),
        copyButton(() => out.textContent)),
      out);
  },

  hash() {
    const source = textarea({ placeholder: "özeti alınacak metin", rows: 4 });
    const out = h("dl", { class: "kv" });
    const note = h("p", { class: "field__hint" }, "");

    const run = async () => {
      clear(out);
      if (!window.crypto || !window.crypto.subtle) {
        note.textContent = "Bu tarayıcıda kriptografi API'si yok (güvenli bağlam gerekir).";
        return;
      }
      const bytes = new TextEncoder().encode(source.value);
      for (const algo of ["SHA-1", "SHA-256", "SHA-512"]) {
        try {
          const digest = await crypto.subtle.digest(algo, bytes);
          const hex = Array.from(new Uint8Array(digest))
            .map((b) => b.toString(16).padStart(2, "0")).join("");
          out.appendChild(h("dt", null, algo));
          out.appendChild(h("dd", null, hex));
        } catch {
          note.textContent = "Özet hesaplanamadı.";
        }
      }
      note.textContent = `${bytes.length} bayt işlendi · hesaplama cihazında yapıldı`;
    };

    source.addEventListener("input", debounce(run, 220));
    setTimeout(run, 0);

    return h("div", null,
      field("Metin", source),
      note,
      h("div", { class: "card" }, out));
  },

  timestamp() {
    const stampInput = input({ type: "text", placeholder: "1755216000", inputmode: "numeric" });
    const dateInput = input({ type: "datetime-local" });
    const out = h("dl", { class: "kv" });

    const show = (date) => {
      clear(out);
      if (Number.isNaN(date.getTime())) {
        out.appendChild(h("dt", null, "hata"));
        out.appendChild(h("dd", null, "geçersiz tarih"));
        return;
      }
      const rows = [
        ["unix (s)", Math.floor(date.getTime() / 1000)],
        ["unix (ms)", date.getTime()],
        ["ISO 8601", date.toISOString()],
        ["yerel", date.toLocaleString("tr-TR")],
        ["UTC", date.toUTCString()],
        ["hafta günü", date.toLocaleDateString("tr-TR", { weekday: "long" })],
      ];
      for (const [key, value] of rows) {
        out.appendChild(h("dt", null, key));
        out.appendChild(h("dd", null, String(value)));
      }
    };

    stampInput.addEventListener("input", () => {
      const raw = stampInput.value.trim();
      if (!raw) return;
      const num = Number(raw);
      if (Number.isNaN(num)) { show(new Date(NaN)); return; }
      show(new Date(raw.length > 10 ? num : num * 1000));
    });

    dateInput.addEventListener("input", () => {
      if (dateInput.value) show(new Date(dateInput.value));
    });

    show(new Date());

    return h("div", null,
      h("div", { class: "btnrow" },
        h("button", {
          class: "btn btn--primary", type: "button",
          onclick: () => { const now = new Date(); stampInput.value = Math.floor(now.getTime() / 1000); show(now); },
        }, "şu an"),
        copyButton(() => {
          const dd = out.querySelectorAll("dd");
          return dd.length ? dd[0].textContent : "";
        }, "unix kopyala")),
      field("Unix zaman damgası", stampInput, "Saniye veya milisaniye kabul edilir."),
      field("Tarih seç", dateInput),
      h("div", { class: "card" }, out));
  },

  color() {
    const picker = h("input", { type: "color", value: "#8a8f98", class: "input", style: "height:52px;padding:6px" });
    const hexInput = input({ value: "#8a8f98", placeholder: "#8a8f98" });
    const swatch = h("div", { class: "swatch", style: "background:#8a8f98" });
    const shades = h("div", { class: "swatches" });
    const out = h("dl", { class: "kv" });

    const toRgb = (hex) => {
      let clean = hex.replace("#", "").trim();
      if (clean.length === 3) clean = clean.split("").map((c) => c + c).join("");
      if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
      return {
        r: parseInt(clean.slice(0, 2), 16),
        g: parseInt(clean.slice(2, 4), 16),
        b: parseInt(clean.slice(4, 6), 16),
      };
    };

    const toHsl = ({ r, g, b }) => {
      const rn = r / 255, gn = g / 255, bn = b / 255;
      const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
      const l = (max + min) / 2;
      let hue = 0, sat = 0;
      if (max !== min) {
        const d = max - min;
        sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === rn) hue = ((gn - bn) / d + (gn < bn ? 6 : 0));
        else if (max === gn) hue = (bn - rn) / d + 2;
        else hue = (rn - gn) / d + 4;
        hue *= 60;
      }
      return { h: Math.round(hue), s: Math.round(sat * 100), l: Math.round(l * 100) };
    };

    const luminance = ({ r, g, b }) => {
      const channel = (value) => {
        const v = value / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };

    const update = (hex) => {
      const rgb = toRgb(hex);
      if (!rgb) return;
      const normalized = "#" + [rgb.r, rgb.g, rgb.b]
        .map((v) => v.toString(16).padStart(2, "0")).join("");
      swatch.style.background = normalized;
      picker.value = normalized;

      const hsl = toHsl(rgb);
      const lum = luminance(rgb);
      const onWhite = (1.05) / (lum + 0.05);
      const onBlack = (lum + 0.05) / 0.05;

      clear(out);
      const rows = [
        ["HEX", normalized.toUpperCase()],
        ["RGB", `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`],
        ["HSL", `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`],
        ["beyaza karşı", onWhite.toFixed(2) + ":1 " + (onWhite >= 4.5 ? "✓ AA" : "✗")],
        ["siyaha karşı", onBlack.toFixed(2) + ":1 " + (onBlack >= 4.5 ? "✓ AA" : "✗")],
      ];
      for (const [key, value] of rows) {
        out.appendChild(h("dt", null, key));
        out.appendChild(h("dd", null, value));
      }

      clear(shades);
      for (const level of [88, 70, 50, 34, 20]) {
        const tone = `hsl(${hsl.h}, ${hsl.s}%, ${level}%)`;
        shades.appendChild(h("div", {
          style: `background:${tone};cursor:pointer`,
          title: tone,
          onclick: async () => {
            const ok = await copy(tone);
            toast(ok ? tone + " kopyalandı" : "kopyalanamadı", ok ? "ok" : "err");
          },
        }));
      }
    };

    picker.addEventListener("input", () => { hexInput.value = picker.value; update(picker.value); });
    hexInput.addEventListener("input", () => update(hexInput.value));
    update("#8a8f98");

    return h("div", null,
      swatch,
      field("Renk seç", picker),
      field("HEX", hexInput, "3 veya 6 haneli hex kabul edilir."),
      h("div", null, h("span", { class: "field__label" }, "Tonlar — dokunup kopyala"), shades),
      h("div", { class: "card" }, out));
  },

  text() {
    const source = textarea({ placeholder: "metnini buraya yaz", rows: 6 });
    const out = outBox("");
    const stats = h("p", { class: "field__hint" }, "");

    const slug = (value) => {
      const map = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
                    Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u" };
      return value.replace(/[çğıöşüÇĞİÖŞÜ]/g, (c) => map[c])
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    };

    const actions = {
      "BÜYÜK": (v) => v.toLocaleUpperCase("tr-TR"),
      "küçük": (v) => v.toLocaleLowerCase("tr-TR"),
      "Başlık": (v) => v.toLocaleLowerCase("tr-TR").replace(/(^|\s)\S/g,
        (c) => c.toLocaleUpperCase("tr-TR")),
      "slug": slug,
      "ters": (v) => v.split("").reverse().join(""),
      "satır sırala": (v) => v.split("\n").sort((a, b) => a.localeCompare(b, "tr")).join("\n"),
      "tekrarı sil": (v) => Array.from(new Set(v.split("\n"))).join("\n"),
      "boşluk temizle": (v) => v.split("\n").map((l) => l.trim()).filter(Boolean).join("\n"),
    };

    const refresh = () => {
      const value = source.value;
      const words = value.trim() ? value.trim().split(/\s+/).length : 0;
      const lines = value ? value.split("\n").length : 0;
      stats.textContent = `${value.length} karakter · ${words} kelime · ${lines} satır`;
    };
    source.addEventListener("input", refresh);
    refresh();

    return h("div", null,
      field("Metin", source),
      stats,
      h("div", { class: "btnrow" },
        Object.entries(actions).map(([label, fn]) =>
          h("button", {
            class: "btn", type: "button",
            onclick: () => { out.textContent = fn(source.value); out.className = "out out--ok"; },
          }, label)),
        copyButton(() => out.textContent)),
      out);
  },

  uuid() {
    const out = outBox("");
    const generate = (count) => {
      const values = [];
      for (let i = 0; i < count; i++) {
        values.push(crypto.randomUUID
          ? crypto.randomUUID()
          : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
              (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)));
      }
      out.textContent = values.join("\n");
      out.className = "out out--ok";
    };
    generate(1);

    return h("div", null,
      h("p", { class: "lede" },
        "UUID v4 — cihazındaki kriptografik rastgele sayı üreteci ile oluşturulur."),
      h("div", { class: "btnrow" },
        h("button", { class: "btn btn--primary", type: "button", onclick: () => generate(1) }, "1 üret"),
        h("button", { class: "btn", type: "button", onclick: () => generate(5) }, "5 üret"),
        h("button", { class: "btn", type: "button", onclick: () => generate(20) }, "20 üret"),
        copyButton(() => out.textContent)),
      out);
  },

  jwt() {
    const source = textarea({ placeholder: "eyJhbGciOi...", rows: 4 });
    const out = outBox("");
    const note = h("div", { class: "warnbox" }, icon("i-warn", 17),
      h("span", null, "İmza doğrulanmaz — bu araç yalnızca çözer. " +
        "Gerçek bir gizli anahtar içeren token'ı hiçbir web aracına yapıştırma."));

    const decodePart = (part) => {
      const padded = part.replace(/-/g, "+").replace(/_/g, "/")
        .padEnd(part.length + (4 - part.length % 4) % 4, "=");
      const binary = atob(padded);
      const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes));
    };

    const decode = () => {
      const parts = source.value.trim().split(".");
      if (parts.length < 2) {
        out.textContent = "JWT üç bölümden oluşur: header.payload.signature";
        out.className = "out out--err";
        return;
      }
      try {
        const header = decodePart(parts[0]);
        const payload = decodePart(parts[1]);
        let extra = "";
        if (payload.exp) {
          const when = new Date(payload.exp * 1000);
          extra = `\n\n// exp: ${when.toLocaleString("tr-TR")} — ` +
            (when < new Date() ? "SÜRESİ DOLMUŞ" : "geçerli");
        }
        out.textContent = "// header\n" + JSON.stringify(header, null, 2) +
          "\n\n// payload\n" + JSON.stringify(payload, null, 2) + extra;
        out.className = "out out--ok";
      } catch {
        out.textContent = "çözülemedi — geçerli bir JWT değil";
        out.className = "out out--err";
      }
    };

    source.addEventListener("input", debounce(decode, 240));

    return h("div", null,
      note,
      field("Token", source),
      h("div", { class: "btnrow" },
        h("button", { class: "btn btn--primary", type: "button", onclick: decode }, "çöz"),
        copyButton(() => out.textContent)),
      out);
  },
};

/* --- panels --------------------------------------------------------------- */

function renderTools() {
  return h("div", null,
    h("p", { class: "lede" },
      "Hepsi tarayıcında çalışır. Girdiğin veri sunucuya gönderilmez — " +
      "tek istisna QR üretimi, o da bu sitenin kendi API'sini kullanır."),
    h("div", { class: "grid2" },
      content.tools.map((tool) =>
        h("button", {
          class: "tile",
          onclick: () => open("tool", tool.id),
        },
          h("span", { class: "tile__title" }, tool.title),
          h("span", { class: "tile__desc" }, tool.desc)))));
}

function renderTool(ctx) {
  const meta = content.tools.find((tool) => tool.id === ctx.arg);
  const builder = TOOLS[ctx.arg];
  if (!meta || !builder) return h("div", { class: "empty" }, "Araç bulunamadı.");
  return h("div", null,
    h("p", { class: "lede" }, meta.desc),
    builder());
}

export function initTools(bootContent) {
  content = bootContent;
  registerPanel("tools", { eyebrow: "Araçlar", title: "TOOLS", render: renderTools });
  registerPanel("tool", {
    eyebrow: "Araç",
    title: (arg) => {
      const meta = content.tools.find((tool) => tool.id === arg);
      return meta ? meta.title : "Araç";
    },
    path: false,
    render: renderTool,
  });
}
