/* Playground — four real interactive experiments.
 *
 * Each animation loop stops itself once its canvas leaves the document, so
 * closing a panel actually releases the CPU instead of looping in the dark.
 */

import { h, toast } from "./core.js";
import { registerPanel, open } from "./ui.js";
import { prefersReducedMotion } from "./core.js";

let content = null;

function stage(height = 300) {
  const canvas = h("canvas");
  const node = h("div", { class: "stage", style: `height:${height}px` }, canvas);
  return { node, canvas };
}

function fitCanvas(canvas) {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { ctx, w: rect.width, h: rect.height };
}

const EXPERIMENTS = {

  /* Particles linked by proximity; the pointer pushes them around. */
  field() {
    const { node, canvas } = stage(320);
    const hint = h("div", { class: "stage__hint" }, "parmağını gezdir");
    node.appendChild(hint);

    let particles = [];
    const pointer = { x: -999, y: -999, active: false };

    const setup = () => {
      const { w, h: height } = fitCanvas(canvas);
      const count = Math.min(70, Math.round((w * height) / 7000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.42,
        vy: (Math.random() - 0.5) * 0.42,
      }));
    };

    const point = (event) => {
      const rect = canvas.getBoundingClientRect();
      const source = event.touches ? event.touches[0] : event;
      pointer.x = source.clientX - rect.left;
      pointer.y = source.clientY - rect.top;
      pointer.active = true;
    };

    canvas.addEventListener("pointermove", point);
    canvas.addEventListener("pointerdown", point);
    canvas.addEventListener("pointerleave", () => { pointer.active = false; pointer.x = -999; });

    const frame = () => {
      if (!canvas.isConnected) return;
      const ctx = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();
      const w = rect.width, height = rect.height;

      ctx.clearRect(0, 0, w, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 90 && dist > 0.1) {
            p.x += (dx / dist) * 0.9;
            p.y += (dy / dist) * 0.9;
          }
        }
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 92) {
            ctx.strokeStyle = `rgba(255,255,255,${(1 - dist / 92) * 0.4})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      ctx.fillStyle = "#e8eaed";
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(frame);
    };

    requestAnimationFrame(() => { setup(); frame(); });
    window.addEventListener("resize", () => { if (canvas.isConnected) setup(); });

    return h("div", null,
      h("p", { class: "lede" },
        "Yakın parçacıklar birbirine bağlanır. Parmağın alanı iter — " +
        "her kare gerçek zamanlı hesaplanır."),
      node);
  },

  /* Conway's Game of Life, drawn by touch. */
  life() {
    const { node, canvas } = stage(340);
    const CELL = 9;
    let cols = 0, rows = 0, grid = [], running = true, generation = 0;
    const counter = h("span", { class: "pill" }, "nesil 0");

    const build = () => {
      const { w, h: height } = fitCanvas(canvas);
      cols = Math.floor(w / CELL);
      rows = Math.floor(height / CELL);
      grid = Array.from({ length: rows }, () => Array(cols).fill(0));
    };

    const seed = () => {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) grid[r][c] = Math.random() < 0.22 ? 1 : 0;
      }
      generation = 0;
    };

    const step = () => {
      const next = grid.map((row) => row.slice());
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let live = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (!dr && !dc) continue;
              const rr = (r + dr + rows) % rows;
              const cc = (c + dc + cols) % cols;
              live += grid[rr][cc];
            }
          }
          next[r][c] = grid[r][c] ? (live === 2 || live === 3 ? 1 : 0) : (live === 3 ? 1 : 0);
        }
      }
      grid = next;
      generation++;
      counter.textContent = "nesil " + generation;
    };

    const paint = () => {
      const ctx = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.fillStyle = "#ffffff";
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (grid[r][c]) ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
        }
      }
    };

    const draw = (event) => {
      const rect = canvas.getBoundingClientRect();
      const source = event.touches ? event.touches[0] : event;
      const c = Math.floor((source.clientX - rect.left) / CELL);
      const r = Math.floor((source.clientY - rect.top) / CELL);
      if (r >= 0 && r < rows && c >= 0 && c < cols) { grid[r][c] = 1; paint(); }
    };

    let painting = false;
    canvas.addEventListener("pointerdown", (e) => { painting = true; draw(e); });
    canvas.addEventListener("pointermove", (e) => { if (painting) draw(e); });
    canvas.addEventListener("pointerup", () => { painting = false; });
    canvas.addEventListener("pointerleave", () => { painting = false; });

    let last = 0;
    const loop = (time) => {
      if (!canvas.isConnected) return;
      if (running && time - last > 110) { step(); paint(); last = time; }
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(() => { build(); seed(); paint(); requestAnimationFrame(loop); });

    const toggle = h("button", {
      class: "btn btn--primary", type: "button",
      onclick: () => { running = !running; toggle.textContent = running ? "duraklat" : "devam et"; },
    }, "duraklat");

    return h("div", null,
      h("p", { class: "lede" },
        "Conway'in Yaşam Oyunu. Üç kural: üç komşusu olan hücre doğar, " +
        "iki veya üç komşusu olan yaşar, diğerleri ölür. Ekrana dokunarak hücre çiz."),
      h("div", { class: "btnrow" },
        toggle,
        h("button", { class: "btn", type: "button", onclick: () => { seed(); paint(); } }, "rastgele"),
        h("button", {
          class: "btn", type: "button",
          onclick: () => { build(); paint(); generation = 0; counter.textContent = "nesil 0"; },
        }, "temizle"),
        counter),
      node);
  },

  /* Web Audio pads — real oscillators, no samples. */
  tone() {
    let audio = null;
    const NOTES = [
      ["C4", 261.63], ["D4", 293.66], ["E4", 329.63], ["G4", 392.00],
      ["A4", 440.00], ["C5", 523.25], ["D5", 587.33], ["E5", 659.25],
      ["G5", 783.99], ["A5", 880.00], ["C6", 1046.50], ["D6", 1174.66],
    ];
    let waveform = "sine";

    const ensure = () => {
      if (!audio) {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        if (!Ctor) { toast("Bu tarayıcı Web Audio desteklemiyor", "err"); return null; }
        audio = new Ctor();
      }
      if (audio.state === "suspended") audio.resume();
      return audio;
    };

    const play = (freq, pad) => {
      const ctx = ensure();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = waveform;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.85);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.9);

      pad.classList.add("is-hit");
      setTimeout(() => pad.classList.remove("is-hit"), 130);
    };

    const pads = h("div", { class: "pads" },
      NOTES.map(([label, freq]) => {
        const pad = h("button", { class: "pad", type: "button" }, label);
        pad.addEventListener("pointerdown", (event) => { event.preventDefault(); play(freq, pad); });
        return pad;
      }));

    const waveButtons = ["sine", "square", "triangle", "sawtooth"].map((type) =>
      h("button", {
        class: "btn" + (type === "sine" ? " btn--primary" : ""),
        type: "button",
        onclick: (event) => {
          waveform = type;
          for (const btn of event.currentTarget.parentElement.children) {
            btn.classList.remove("btn--primary");
          }
          event.currentTarget.classList.add("btn--primary");
        },
      }, type));

    return h("div", null,
      h("p", { class: "lede" },
        "Her pede dokunduğunda gerçek bir osilatör çalışır — ses dosyası yok, " +
        "dalga cihazında üretilir. Ses açık olmalı."),
      h("div", { class: "btnrow" }, waveButtons),
      pads);
  },

  /* Text scramble — the effect used on the wordmark, driven by your own text. */
  scramble() {
    const CHARS = "!<>-_\\/[]{}—=+*^?#01";
    const source = h("input", {
      class: "input", value: "MERHABA", maxlength: "28",
      "aria-label": "Karıştırılacak metin",
    });
    const display = h("div", {
      style: "font-family:var(--mono);font-size:clamp(26px,9vw,44px);" +
             "font-weight:700;letter-spacing:-0.02em;min-height:1.4em;color:var(--accent);" +
             "word-break:break-all",
    }, "MERHABA");

    let frameId = null;

    const run = () => {
      const target = source.value || " ";
      const queue = Array.from({ length: target.length }, (_, i) => ({
        to: target[i],
        start: Math.floor(Math.random() * 22),
        end: Math.floor(Math.random() * 22) + 22,
      }));
      let frame = 0;

      const tick = () => {
        if (!display.isConnected) return;
        let output = "";
        let complete = 0;
        for (const item of queue) {
          if (frame >= item.end) { output += item.to; complete++; }
          else if (frame >= item.start) {
            output += CHARS[Math.floor(Math.random() * CHARS.length)];
          } else output += " ";
        }
        display.textContent = output;
        if (complete === queue.length) return;
        frame++;
        frameId = requestAnimationFrame(tick);
      };

      cancelAnimationFrame(frameId);
      if (prefersReducedMotion()) { display.textContent = target; return; }
      tick();
    };

    source.addEventListener("input", run);
    setTimeout(run, 60);

    return h("div", null,
      h("p", { class: "lede" },
        "Ana ekrandaki isim efektinin aynısı. Yaz, anında uygulanır. " +
        "Hareket tercihini kapattıysan efekt otomatik devre dışı kalır."),
      display,
      h("div", { class: "field" },
        h("span", { class: "field__label" }, "Metin"), source),
      h("div", { class: "btnrow" },
        h("button", { class: "btn btn--primary", type: "button", onclick: run }, "tekrar oynat")));
  },
};

function renderPlayground() {
  return h("div", null,
    h("p", { class: "lede" },
      "Dört deney. Hepsi gerçekten çalışır ve dokunmaya tepki verir."),
    h("div", { class: "grid2" },
      content.playground.map((item) =>
        h("button", {
          class: "tile",
          onclick: () => open("experiment", item.id),
        },
          h("span", { class: "tile__title" }, item.title),
          h("span", { class: "tile__desc" }, item.desc)))));
}

function renderExperiment(ctx) {
  const meta = content.playground.find((item) => item.id === ctx.arg);
  const builder = EXPERIMENTS[ctx.arg];
  if (!meta || !builder) return h("div", { class: "empty" }, "Deney bulunamadı.");
  return builder();
}

export function initPlayground(bootContent) {
  content = bootContent;
  registerPanel("playground", {
    eyebrow: "Deneyler", title: "PLAYGROUND", render: renderPlayground,
  });
  registerPanel("experiment", {
    eyebrow: "Deney",
    title: (arg) => {
      const meta = content.playground.find((item) => item.id === arg);
      return meta ? meta.title : "Deney";
    },
    path: false,
    render: renderExperiment,
  });
}
