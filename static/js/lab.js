/* Termux LAB — tracks, lessons, command anatomy and the sandbox terminal. */

import { $, h, clear, icon, store, toast } from "./core.js";
import { registerPanel, open } from "./ui.js";
import { createVFS, verify } from "./vfs.js";

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
  // tolerate a bare lesson id
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

/* --- LAB index ------------------------------------------------------------ */

function renderLab() {
  const frag = document.createDocumentFragment();
  const finishedSet = done();
  const total = lessonCount();
  const finished = doneCount();

  frag.appendChild(h("p", { class: "lede" },
    "Sanal bir terminal üzerinde ilerliyorsun. Görevler gerçekten kontrol ediliyor: " +
    "dosya oluşturmadıysan görev tamamlanmış sayılmaz. Hiçbir komut kendi cihazında çalışmaz."));

  frag.appendChild(h("div", { class: "card" },
    h("div", { class: "sec", style: "padding:0 0 10px" },
      h("span", { class: "sec__bar" }),
      h("span", { class: "sec__label" }, "İlerlemen"),
      h("span", { class: "sec__rule" }),
      h("span", { class: "sec__count" }, `${finished}/${total}`)),
    h("div", { class: "track__bar", style: "border-radius:999px;overflow:hidden" },
      h("div", { class: "track__fill", style: `width:${total ? (finished / total) * 100 : 0}%` })),
    finished > 0
      ? h("div", { class: "btnrow", style: "margin-top:13px" },
          h("button", {
            class: "btn btn--primary",
            onclick: () => {
              const next = flatLessons().find((entry) => !finishedSet.has(entry.lesson.id));
              const last = store.get(LAST_KEY);
              const target = next || findLesson(last) || flatLessons()[0];
              open("lesson", `${target.track.id}/${target.lesson.id}`);
            },
          }, "kaldığın yerden devam et"))
      : h("div", { class: "btnrow", style: "margin-top:13px" },
          h("button", {
            class: "btn btn--primary",
            onclick: () => {
              const first = flatLessons()[0];
              open("lesson", `${first.track.id}/${first.lesson.id}`);
            },
          }, "ilk dersten başla"))));

  for (const track of content.lab.tracks) {
    const trackDone = track.lessons.filter((l) => finishedSet.has(l.id)).length;
    const ratio = track.lessons.length ? trackDone / track.lessons.length : 0;

    const lessons = h("div", { class: "track__lessons" },
      track.lessons.map((lesson) => {
        const isDone = finishedSet.has(lesson.id);
        return h("button", {
          class: "lesson" + (isDone ? " is-done" : ""),
          onclick: () => open("lesson", `${track.id}/${lesson.id}`),
        },
          h("span", { class: "lesson__check" }, icon("i-check", 11)),
          h("span", null,
            h("span", { class: "lesson__cmd" }, lesson.title), h("br"),
            h("span", { class: "lesson__sub" }, lesson.subtitle)),
          icon("i-arrow", 15, "row__arrow"));
      }));

    frag.appendChild(h("div", { class: "track" },
      h("div", { class: "track__head" },
        h("span", null,
          h("span", { class: "track__label" }, track.label),
          h("span", { class: "track__summary" }, track.summary)),
        h("span", { class: "track__count" }, `${trackDone}/${track.lessons.length}`)),
      h("div", { class: "track__bar" },
        h("div", { class: "track__fill", style: `width:${ratio * 100}%` })),
      lessons));
  }

  frag.appendChild(h("div", { class: "warnbox" },
    icon("i-warn", 17),
    h("span", null, "Bu alan öğrenme amaçlıdır. Buradaki komutları gerçek cihazında " +
      "denerken, özellikle silme işlemlerinde ne yaptığını bildiğinden emin ol.")));

  return frag;
}

/* --- terminal ------------------------------------------------------------- */

function buildTerminal(lesson, onCheck) {
  const out = h("div", { class: "term__out", id: "termOut" });
  const path = h("span", { class: "term__path" }, vfs.prompt());
  const input = h("input", {
    class: "term__in",
    type: "text",
    autocomplete: "off",
    autocapitalize: "off",
    autocorrect: "off",
    spellcheck: "false",
    "aria-label": "Sanal terminal komut girişi",
    placeholder: "komut yaz…",
  });

  const write = (text, cls = "") => {
    out.appendChild(h("div", { class: cls }, text));
    out.scrollTop = out.scrollHeight;
  };

  write("Sanal terminal — gerçek cihazına dokunmaz.", "g");
  write("help yazarak komut listesini görebilirsin.", "");
  write("", "");

  const history = [];
  let historyIndex = -1;

  const submit = () => {
    const line = input.value;
    if (!line.trim()) return;
    history.unshift(line);
    historyIndex = -1;
    input.value = "";

    write(`${vfs.prompt()} $ ${line}`, "u");
    const result = vfs.run(line);
    if (result.clear) {
      clear(out);
    } else {
      for (const row of result.lines) write(row.text, row.cls);
    }
    path.textContent = vfs.prompt();
    onCheck();
  };

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") { event.preventDefault(); submit(); return; }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (historyIndex < history.length - 1) historyIndex++;
      input.value = history[historyIndex] || "";
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      historyIndex = Math.max(-1, historyIndex - 1);
      input.value = historyIndex === -1 ? "" : history[historyIndex];
    }
  });

  const quickKeys = ["pwd", "ls", "ls -la", "cd ~", "cd ..", "cat", "mkdir", "touch",
                     "echo", "grep", "|", ">", "clear", "help"];

  const keys = h("div", { class: "termkeys" },
    quickKeys.map((key) => h("button", {
      class: "termkey",
      type: "button",
      onclick: () => {
        input.value = input.value ? `${input.value.replace(/\s+$/, "")} ${key} ` : `${key} `;
        input.focus();
      },
    }, key)));

  return h("div", { class: "term" },
    h("div", { class: "term__bar" },
      h("span", { class: "term__badge" }, "sanal ortam"),
      path,
      h("button", {
        class: "term__reset",
        type: "button",
        onclick: () => {
          vfs.reset();
          clear(out);
          write("Dosya sistemi sıfırlandı.", "g");
          path.textContent = vfs.prompt();
          onCheck();
        },
      }, "sıfırla")),
    out,
    h("div", { class: "term__line" },
      h("span", { class: "term__ps" }, "$"),
      input),
    keys);
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

  // Anatomy — every token is tappable and explains itself.
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

  /* Mission */
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
    frag.appendChild(h("div", { class: "lsn__block" },
      h("div", { class: "lsn__h" }, "Sanal terminal"),
      buildTerminal(lesson, checkNow)));
    // Verify immediately in case the state already satisfies the mission.
    setTimeout(checkNow, 0);
  }

  /* Prev / next navigation */
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

  registerPanel("lab", {
    eyebrow: "Termux",
    title: "LAB",
    render: renderLab,
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
