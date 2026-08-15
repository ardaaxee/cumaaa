/* Reusable sandbox terminal.
 *
 * One component drives both the small terminal embedded in a LAB lesson and
 * the full-height standalone TERMINAL panel, so behaviour can never drift
 * between the two.
 */

import { h, clear, store } from "./core.js";

const HISTORY_KEY = "term:history";
const HISTORY_MAX = 60;

/* Everything the interpreter can complete, for Tab completion. */
const COMPLETIONS = [
  "pwd", "ls", "ls -la", "cd", "cd ~", "cd ..", "mkdir", "mkdir -p", "touch",
  "cat", "cat -n", "cp", "cp -r", "mv", "rm", "rm -r", "grep", "grep -i",
  "grep -n", "find", "find . -name", "head", "tail", "wc", "wc -l", "chmod",
  "chmod +x", "tree", "echo", "man", "help", "clear", "whoami", "date",
  "pkg", "pkg install", "pkg search", "pkg update", "pkg list-installed",
  "git", "git init", "git status", "git add", "git commit -m", "git log --oneline",
];

/**
 * @param {object} options
 * @param {object} options.vfs        virtual filesystem instance
 * @param {string} options.height     CSS height for the output area
 * @param {string[]} options.intro    lines printed on mount
 * @param {string[]} options.keys     quick-key strip contents
 * @param {Function} options.onRun    called after every executed line
 * @param {Function} options.onCommand optional hook; return true to swallow a line
 */
export function createTerminal({
  vfs,
  height = "230px",
  intro = [],
  keys = null,
  onRun = null,
  onCommand = null,
  autofocus = false,
} = {}) {
  const out = h("div", { class: "term__out", style: `height:${height}` });
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

  for (const line of intro) {
    if (typeof line === "string") write(line);
    else write(line.text, line.cls);
  }

  let history = store.get(HISTORY_KEY, []);
  if (!Array.isArray(history)) history = [];
  let historyIndex = -1;
  let completionCycle = null;

  const submit = () => {
    const line = input.value;
    if (!line.trim()) return;

    history.unshift(line);
    history = history.slice(0, HISTORY_MAX);
    store.set(HISTORY_KEY, history);
    historyIndex = -1;
    completionCycle = null;
    input.value = "";

    write(`${vfs.prompt()} $ ${line}`, "u");

    // Panel-level commands get first refusal (open, exit, …).
    if (onCommand && onCommand(line.trim(), write)) {
      path.textContent = vfs.prompt();
      if (onRun) onRun(line);
      return;
    }

    const result = vfs.run(line);
    if (result.clear) clear(out);
    else for (const row of result.lines) write(row.text, row.cls);

    path.textContent = vfs.prompt();
    if (onRun) onRun(line);
  };

  const complete = () => {
    const value = input.value;
    const prefix = value.trimStart();
    if (!prefix) return;

    if (!completionCycle || completionCycle.prefix !== prefix) {
      const matches = COMPLETIONS.filter((c) => c.startsWith(prefix) && c !== prefix);
      if (!matches.length) return;
      completionCycle = { prefix, matches, index: 0 };
    } else {
      completionCycle.index = (completionCycle.index + 1) % completionCycle.matches.length;
    }
    input.value = completionCycle.matches[completionCycle.index];
  };

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") { event.preventDefault(); submit(); return; }
    if (event.key === "Tab") { event.preventDefault(); complete(); return; }
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
      return;
    }
    completionCycle = null;
  });

  const quickKeys = keys || ["pwd", "ls", "ls -la", "cd ~", "cd ..", "cat",
                             "mkdir", "touch", "echo", "grep", "|", ">",
                             "clear", "help"];

  const keyStrip = h("div", { class: "termkeys" },
    quickKeys.map((key) => h("button", {
      class: "termkey",
      type: "button",
      onclick: () => {
        input.value = input.value ? `${input.value.replace(/\s+$/, "")} ${key} ` : `${key} `;
        input.focus();
      },
    }, key)));

  const node = h("div", { class: "term" },
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
          if (onRun) onRun("reset");
        },
      }, "sıfırla")),
    out,
    h("div", { class: "term__line" },
      h("span", { class: "term__ps" }, "$"),
      input),
    keyStrip);

  // Tapping anywhere in the output focuses the prompt, like a real terminal.
  out.addEventListener("click", () => {
    if (!window.getSelection().toString()) input.focus();
  });

  if (autofocus && window.matchMedia("(hover: hover)").matches) {
    setTimeout(() => input.focus(), 80);
  }

  return { node, write, focus: () => input.focus(), clearOutput: () => clear(out) };
}
