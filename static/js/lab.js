/* Termux LAB — tracks, lessons, command anatomy, cheatsheet and progress. */

import { $, h, clear, icon, store, toast, canShare, share, debounce } from "./core.js";
import { registerPanel, open } from "./ui.js";
import { createVFS, verify } from "./vfs.js";
import { createTerminal } from "./term.js";

const DONE_KEY = "lab:done";
const LAST_KEY = "lab:last";

let content = null;
let vfs = null;

function done() {
  return new Set(store.get(DONE_KEY, []));
}

function markDone(lessonId) {
  const set = done();
  if (set.has(lessonId)) return false;
  set.add(lessonId);
  store.set(DONE_KEY, Array.from(set));
  refreshHomeProgress();
  return true;
}

export function lessonCount() {
  return content.lab.tracks.reduce((sum, track) => sum + track.lessons.length, 0);
}

export function doneCount() {
  const set = done();
  let total = 0;
  for (const track of content.lab.tracks) {
    for (const lesson of track.lessons) if (set.has(lesson.id)) total++;
  }
  return total;
}

/** Keep the home-screen row's ring and badge in sync with real progress. */
export function refreshHomeProgress() {
  const total = lessonCount();
  const finished = doneCount();
  const badge = $("#labBadge");
  if (badge) badge.textContent = `${finished}/${total}`;

  const ring = $("#labRing .ring__fg");
  if (ring) {
    const circumference = 2 * Math.PI * 10.5;
    const ratio = total ? finished / total : 0;
    ring.setAttribute("stroke-dasharray", circumference.toFixed(2));
    ring.setAttribute("stroke-dashoffset", (circumference * (1 - ratio)).toFixed(2));
  }
}

function findLesson(path) {
  if (!path) return null;
  const [trackId, lessonId] = String(path).split("/");
  for (const track of content.lab.tracks) {
    if (trackId && track.id !== trackId) continue;
    for (const lesson of track.lessons) {
      if (lesson.id === lessonId) return { track, lesson };
    }
  }
  for (const track of content.lab.tracks) {
    for (const lesson of track.lessons) {
      if (lesson.id === trackId) return { track, lesson };
    }
  }
  return null;
}

function flatLessons() {
  const out = [];
  for (const track of content.lab.tracks) {
    for (const lesson of track.lessons) out.push({ track, lesson });
  }
  return out;
}

function nextLesson() {
  const finished = done();
  const next = flatLessons().find((entry) => !finished.has(entry.lesson.id));
  if (next) return next;
  const last = findLesson(store.get(LAST_KEY));
  return last || flatLessons()[0];
}

function fold(text) {
  return String(text).toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u")
    .replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c");
}

/* --- shareable progress card ---------------------------------------------- */

function drawProgressCard() {
  const size = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const total = lessonCount();
  const finished = doneCount();
  const ratio = total ? finished / total : 0;

  ctx.fillStyle = "#050506";
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 2;
  for (let x = 0; x <= size; x += 90) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, x); ctx.lineTo(size, x); ctx.stroke();
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, 10);

  const ui = '-apple-system, "Segoe UI", Roboto, sans-serif';
  const mono = 'ui-monospace, Menlo, monospace';

  ctx.fillStyle = "#6e727a";
  ctx.font = `500 30px ${mono}`;
  ctx.fillText("TERMUX LAB", 90, 160);

  ctx.fillStyle = "#f2f3f5";
  ctx.font = `800 132px ${ui}`;
  ctx.fillText("ARDA", 86, 300);

  // progress ring
  const cx = size / 2;
  const cy = 610;
  const radius = 170;
  ctx.lineWidth = 26;
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke();

  if (ratio > 0) {
    ctx.strokeStyle = "#ffffff";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
    ctx.stroke();
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#f2f3f5";
  ctx.font = `800 130px ${ui}`;
  ctx.fillText(`${finished}`, cx, cy + 20);
  ctx.fillStyle = "#6e727a";
  ctx.font = `500 38px ${mono}`;
  ctx.fillText(`/ ${total} ders`, cx, cy + 78);

  ctx.fillStyle = "#f2f3f5";
  ctx.font = `700 46px ${ui}`;
  ctx.fillText(
    ratio >= 1 ? "Müfredatı bitirdim" : "Termux öğreniyorum",
    cx, 880);

  ctx.fillStyle = "#a4a8b0";
  ctx.font = `500 34px ${mono}`;
  ctx.fillText("@lov4ardaa", cx, 950);

  ctx.fillStyle = "#6e727a";
  ctx.font = `500 26px ${mono}`;
  ctx.fillText(location.host || "whoisarda", cx, 1005);

  ctx.textAlign = "left";
  return canvas;
}

async function shareProgress() {
  const canvas = drawProgressCard();
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) { toast("kart üretilemedi", "err"); return; }

  const file = new File([blob], "termux-lab.png", { type: "image/png" });
  const payload = {
    title: "Termux LAB",
    text: `${doneCount()}/${lessonCount()} ders — @lov4ardaa`,
    url: location.origin,
  };

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ ...payload, files: [file] });
      return;
    } catch (err) {
      if (err && err.name === "AbortError") return;
    }
  }
  if (canShare()) {
    if (await share(payload)) return;
  }

  const url = URL.createObjectURL(blob);
  const link = h("a", { href: url, download: "termux-lab.png" });
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("kart indirildi", "ok");
}

/* --- LAB index ------------------------------------------------------------ */

function renderLab() {
  const frag = document.createDocumentFragment();
  const total = lessonCount();
  const finished = doneCount();

  frag.appendChild(h("p", { class: "lede" },
    "Sanal bir terminal üzerinde ilerliyorsun. Görevler gerçekten kontrol ediliyor: " +
    "dosya oluşturmadıysan görev tamamlanmış sayılmaz. Hiçbir komut kendi cihazında çalışmaz."));

  const target = nextLesson();
  frag.appendChild(h("div", { class: "card" },
    h("div", { class: "sec", style: "padding:0 0 10px" },
      h("span", { class: "sec__bar" }),
      h("span", { class: "sec__label" }, "İlerlemen"),
      h("span", { class: "sec__rule" }),
      h("span", { class: "sec__count" }, `${finished}/${total}`)),
    h("div", { class: "track__bar", style: "border-radius:999px;overflow:hidden" },
      h("div", { class: "track__fill", style: `width:${total ? (finished / total) * 100 : 0}%` })),
    h("div", { class: "btnrow", style: "margin-top:13px" },
      h("button", {
        class: "btn btn--primary",
        onclick: () => open("lesson", `${target.track.id}/${target.lesson.id}`),
      }, finished > 0 ? "kaldığın yerden devam et" : "ilk dersten başla"),
      h("button", { class: "btn", onclick: () => open("cheatsheet") },
        "komut kartı"),
      finished > 0
        ? h("button", { class: "btn", onclick: shareProgress },
            icon("i-share", 16), "ilerlemeni paylaş")
        : null)));

  /* Search across every lesson. */
  const search = h("input", {
    class: "input", type: "search", placeholder: "ders veya komut ara…",
    "aria-label": "Ders ara", autocomplete: "off",
  });
  const trackHost = h("div", { class: "tracks" });

  const paint = (query = "") => {
    clear(trackHost);
    const finishedSet = done();
    const q = fold(query.trim());
    let hits = 0;

    for (const track of content.lab.tracks) {
      const lessons = track.lessons.filter((lesson) => !q
        || fold(lesson.title).includes(q)
        || fold(lesson.subtitle).includes(q)
        || fold(lesson.command).includes(q)
        || fold(lesson.what).includes(q));
      if (!lessons.length) continue;
      hits += lessons.length;

      const trackDone = track.lessons.filter((l) => finishedSet.has(l.id)).length;
      const ratio = track.lessons.length ? trackDone / track.lessons.length : 0;

      trackHost.appendChild(h("div", { class: "track" },
        h("div", { class: "track__head" },
          h("span", null,
            h("span", { class: "track__label" }, track.label),
            h("span", { class: "track__summary" }, track.summary)),
          h("span", { class: "track__count" }, `${trackDone}/${track.lessons.length}`)),
        h("div", { class: "track__bar" },
          h("div", { class: "track__fill", style: `width:${ratio * 100}%` })),
        h("div", { class: "track__lessons" },
          lessons.map((lesson) => h("button", {
            class: "lesson" + (finishedSet.has(lesson.id) ? " is-done" : ""),
            onclick: () => open("lesson", `${track.id}/${lesson.id}`),
          },
            h("span", { class: "lesson__check" }, icon("i-check", 11)),
            h("span", null,
              h("span", { class: "lesson__cmd" }, lesson.title), h("br"),
              h("span", { class: "lesson__sub" }, lesson.subtitle)),
            icon("i-arrow", 15, "row__arrow"))))));
    }

    if (!hits) {
      trackHost.appendChild(h("div", { class: "empty" }, `"${query}" için ders bulunamadı.`));
    }
  };

  search.addEventListener("input", debounce(() => paint(search.value), 140));
  paint();

  frag.appendChild(search);
  frag.appendChild(trackHost);

  frag.appendChild(h("div", { class: "warnbox" },
    icon("i-warn", 17),
    h("span", null, "Bu alan öğrenme amaçlıdır. Buradaki komutları gerçek cihazında " +
      "denerken, özellikle silme işlemlerinde ne yaptığını bildiğinden emin ol.")));

  return frag;
}

/* --- cheatsheet ----------------------------------------------------------- */

function renderCheatsheet() {
  const search = h("input", {
    class: "input", type: "search", placeholder: "komut ara…",
    "aria-label": "Komut ara", autocomplete: "off",
  });
  const host = h("div", null);

  const paint = (query = "") => {
    clear(host);
    const q = fold(query.trim());
    let hits = 0;

    for (const track of content.lab.tracks) {
      const rows = [];
      for (const lesson of track.lessons) {
        const match = !q || fold(lesson.command).includes(q)
          || fold(lesson.title).includes(q) || fold(lesson.what).includes(q)
          || (lesson.flags || []).some((f) => fold(f.flag).includes(q) || fold(f.desc).includes(q));
        if (!match) continue;
        hits++;

        rows.push(h("button", {
          class: "cheat",
          onclick: () => open("lesson", `${track.id}/${lesson.id}`),
        },
          h("code", { class: "cheat__cmd" }, lesson.command),
          h("span", { class: "cheat__desc" }, lesson.what),
          (lesson.flags && lesson.flags.length)
            ? h("span", { class: "cheat__flags" },
                lesson.flags.map((f) => h("span", { class: "cheat__flag" },
                  h("b", null, f.flag), " ", f.desc)))
            : null));
      }
      if (!rows.length) continue;
      host.appendChild(h("div", { class: "sec", style: "padding:16px 0 8px" },
        h("span", { class: "sec__bar" }),
        h("span", { class: "sec__label" }, track.label),
        h("span", { class: "sec__rule" }),
        h("span", { class: "sec__count" }, rows.length)));
      host.appendChild(h("div", { class: "cheats" }, rows));
    }

    if (!hits) host.appendChild(h("div", { class: "empty" }, `"${query}" bulunamadı.`));
  };

  search.addEventListener("input", debounce(() => paint(search.value), 140));
  paint();

  return h("div", null,
    h("p", { class: "lede" },
      "Müfredattaki bütün komutlar tek sayfada. Bir komuta dokun, dersine git."),
    search,
    host,
    h("div", { class: "btnrow", style: "margin-top:18px" },
      h("button", { class: "btn btn--primary", onclick: () => open("terminal") },
        "terminalde dene")));
}

/* --- lesson detail -------------------------------------------------------- */

function renderLesson(ctx) {
  const found = findLesson(ctx.arg);
  if (!found) return h("div", { class: "empty" }, "Ders bulunamadı.");
  const { track, lesson } = found;
  store.set(LAST_KEY, `${track.id}/${lesson.id}`);

  const frag = document.createDocumentFragment();

  frag.appendChild(h("div", null,
    h("div", { class: "lsn__cmd" }, lesson.command),
    h("p", { class: "lsn__p", style: "margin-top:6px" }, lesson.what)));

  frag.appendChild(h("div", { class: "lsn__block" },
    h("div", { class: "lsn__h" }, "Neden önemli"),
    h("p", { class: "lsn__p" }, lesson.why)));

  frag.appendChild(h("div", { class: "lsn__block" },
    h("div", { class: "lsn__h" }, "Örnek"),
    h("pre", { class: "code" }, lesson.example)));

  if (lesson.anatomy && lesson.anatomy.length) {
    const desc = h("div", { class: "tok__desc" }, "Bir parçaya dokun, ne yaptığını yazayım.");
    const tokens = lesson.anatomy.map((item) =>
      h("button", {
        class: "tok",
        type: "button",
        onclick: (event) => {
          for (const node of event.currentTarget.parentElement.children) {
            node.classList.remove("is-on");
          }
          event.currentTarget.classList.add("is-on");
          desc.textContent = item.desc;
        },
      }, item.token));

    frag.appendChild(h("div", { class: "lsn__block" },
      h("div", { class: "lsn__h" }, "Anatomi — dokunarak incele"),
      h("div", { class: "anat" }, tokens),
      desc));
  }

  frag.appendChild(h("div", { class: "lsn__block" },
    h("div", { class: "lsn__h" }, "Açıklama"),
    lesson.explain.split("\n\n").map((para) => h("p", { class: "lsn__p" }, para))));

  if (lesson.flags && lesson.flags.length) {
    frag.appendChild(h("div", { class: "lsn__block" },
      h("div", { class: "lsn__h" }, "Sık kullanılan bayraklar"),
      h("div", { class: "flags" },
        lesson.flags.map((item) =>
          h("div", { class: "flag" }, h("b", null, item.flag), h("span", null, item.desc))))));
  }

  if (lesson.warning) {
    frag.appendChild(h("div", { class: "warnbox" }, icon("i-warn", 17), h("span", null, lesson.warning)));
  }

  const isDone = done().has(lesson.id);
  const state = h("div", { class: "mission__state" + (isDone ? " is-done" : "") },
    isDone ? "tamamlandı" : "henüz tamamlanmadı");

  const completeBtn = h("button", {
    class: "btn btn--primary",
    type: "button",
    onclick: () => {
      if (markDone(lesson.id)) toast("Ders tamamlandı", "ok");
      state.textContent = "tamamlandı";
      state.classList.add("is-done");
      completeBtn.disabled = true;
      completeBtn.textContent = "tamamlandı";
    },
  }, isDone ? "tamamlandı" : "okudum, tamamla");
  if (isDone) completeBtn.disabled = true;

  const checkNow = () => {
    if (!lesson.task || !lesson.task.check) return;
    if (lesson.task.check.type === "read_only") return;
    if (verify(lesson.task.check, vfs)) {
      state.textContent = "görev doğrulandı";
      state.classList.add("is-done");
      if (markDone(lesson.id)) toast("Görev tamamlandı", "ok");
      completeBtn.disabled = true;
      completeBtn.textContent = "tamamlandı";
    }
  };

  const mission = h("div", { class: "mission" },
    h("div", { class: "mission__head" },
      h("span", { class: "pill pill--on" }, "görev"),
      lesson.no_sandbox ? h("span", { class: "pill" }, "okuma dersi") : null),
    h("p", { class: "mission__prompt" }, lesson.task.prompt),
    h("details", { style: "margin-top:10px" },
      h("summary", { style: "font-size:13px;color:var(--muted);cursor:pointer" }, "ipucu göster"),
      h("p", { class: "lsn__p", style: "margin-top:8px" }, lesson.task.hint)),
    state,
    h("div", { class: "btnrow", style: "margin-top:12px" }, completeBtn));

  frag.appendChild(h("div", { class: "lsn__block" },
    h("div", { class: "lsn__h" }, "Mini görev"),
    mission));

  if (!lesson.no_sandbox) {
    const term = createTerminal({
      vfs,
      height: "230px",
      intro: [
        { text: "Sanal terminal — gerçek cihazına dokunmaz.", cls: "g" },
        { text: "help yazarak komut listesini görebilirsin.", cls: "" },
        { text: "", cls: "" },
      ],
      onRun: checkNow,
    });
    frag.appendChild(h("div", { class: "lsn__block" },
      h("div", { class: "lsn__h" }, "Sanal terminal"),
      term.node));
    setTimeout(checkNow, 0);
  }

  const all = flatLessons();
  const index = all.findIndex((entry) => entry.lesson.id === lesson.id);
  const prev = index > 0 ? all[index - 1] : null;
  const next = index < all.length - 1 ? all[index + 1] : null;

  frag.appendChild(h("div", { class: "lsn__nav" },
    prev ? h("button", {
      class: "btn btn--ghost",
      onclick: () => ctx.replace("lesson", `${prev.track.id}/${prev.lesson.id}`),
    }, "← " + prev.lesson.title) : null,
    next ? h("button", {
      class: "btn",
      style: "margin-left:auto",
      onclick: () => ctx.replace("lesson", `${next.track.id}/${next.lesson.id}`),
    }, next.lesson.title + " →") : null));

  return frag;
}

export function initLab(bootContent) {
  content = bootContent;
  vfs = createVFS(content.lab.home, content.lab.user);

  registerPanel("lab", { eyebrow: "Termux", title: "LAB", render: renderLab });

  registerPanel("cheatsheet", {
    eyebrow: "Referans",
    title: "KOMUT KARTI",
    path: false,
    render: renderCheatsheet,
  });

  registerPanel("lesson", {
    eyebrow: (arg) => {
      const found = findLesson(arg);
      return found ? found.track.label : "Ders";
    },
    title: (arg) => {
      const found = findLesson(arg);
      return found ? found.lesson.title : "Ders";
    },
    path: false,
    render: renderLesson,
  });

  refreshHomeProgress();
}

export function getVFS() {
  return vfs;
}
