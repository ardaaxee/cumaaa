/* A small in-memory POSIX-ish filesystem with a real command interpreter.
 *
 * Nothing here is faked for show: commands actually parse their arguments and
 * actually mutate the tree, which is what lets lesson missions be verified by
 * inspecting state rather than by pattern-matching what the user typed.
 *
 * Anything that genuinely cannot be emulated (python, node, network calls)
 * says so plainly instead of printing invented output.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const AVAILABLE_PACKAGES = [
  "python", "nodejs", "git", "vim", "nano", "curl", "wget", "openssh",
  "clang", "ffmpeg", "tmux", "zsh", "htop", "jq", "rsync", "termux-api",
];

function makeDir(name) {
  return { type: "dir", name, children: new Map(), mtime: new Date(), mode: 0o700 };
}

function makeFile(name, content = "", exec = false) {
  return { type: "file", name, content, mtime: new Date(), exec, mode: 0o600 };
}

export function createVFS(homePath = "/data/data/com.termux/files/home",
                          user = "arda") {
  const vfs = {
    home: homePath,
    user,
    cwd: homePath,
    root: makeDir(""),
    history: [],
    packages: new Set(["coreutils", "bash", "termux-tools"]),
    repos: new Map(),   // repo root path -> { staged, commits, tracked }
  };

  /* --- path handling ---------------------------------------------------- */

  function normalize(path) {
    const absolute = path.startsWith("/");
    const parts = [];
    for (const part of path.split("/")) {
      if (!part || part === ".") continue;
      if (part === "..") parts.pop();
      else parts.push(part);
    }
    return (absolute ? "/" : "") + parts.join("/");
  }

  function resolve(path) {
    if (!path || path === "~") return vfs.home;
    let target = path;
    if (target === "-") return vfs.lastDir || vfs.home;
    if (target.startsWith("~/")) target = vfs.home + "/" + target.slice(2);
    else if (!target.startsWith("/")) target = vfs.cwd + "/" + target;
    return normalize(target) || "/";
  }

  function get(path) {
    const abs = resolve(path);
    if (abs === "/") return vfs.root;
    let node = vfs.root;
    for (const part of abs.split("/").filter(Boolean)) {
      if (node.type !== "dir") return null;
      node = node.children.get(part);
      if (!node) return null;
    }
    return node;
  }

  function parentOf(path) {
    const abs = resolve(path);
    const idx = abs.lastIndexOf("/");
    const dir = idx <= 0 ? "/" : abs.slice(0, idx);
    return { dir: get(dir), dirPath: dir, base: abs.slice(idx + 1), abs };
  }

  function mkdirp(path) {
    const abs = resolve(path);
    let node = vfs.root;
    for (const part of abs.split("/").filter(Boolean)) {
      if (!node.children.has(part)) node.children.set(part, makeDir(part));
      node = node.children.get(part);
      if (node.type !== "dir") return null;
    }
    return node;
  }

  function writeFile(path, content, { append = false } = {}) {
    const { dir, base } = parentOf(path);
    if (!dir || dir.type !== "dir") return false;
    const existing = dir.children.get(base);
    if (existing && existing.type === "dir") return false;
    if (existing && append) {
      existing.content += content;
      existing.mtime = new Date();
    } else {
      dir.children.set(base, makeFile(base, content, existing ? existing.exec : false));
    }
    return true;
  }

  function display(path) {
    if (path === vfs.home) return "~";
    if (path.startsWith(vfs.home + "/")) return "~" + path.slice(vfs.home.length);
    return path;
  }

  function repoFor(path) {
    let current = resolve(path);
    while (true) {
      if (vfs.repos.has(current)) return { path: current, repo: vfs.repos.get(current) };
      if (current === "/" || !current) return null;
      const idx = current.lastIndexOf("/");
      current = idx <= 0 ? "/" : current.slice(0, idx);
    }
  }

  /* --- seed tree -------------------------------------------------------- */

  function seed() {
    vfs.root = makeDir("");
    vfs.cwd = vfs.home;
    vfs.lastDir = vfs.home;
    vfs.packages = new Set(["coreutils", "bash", "termux-tools"]);
    vfs.repos = new Map();
    vfs.history = [];

    mkdirp(vfs.home);
    mkdirp(vfs.home + "/projects");
    writeFile(vfs.home + "/notes.txt", "termux ogreniyorum\nkomut satiri notlari\n");
    writeFile(vfs.home + "/.bashrc", "# termux kabuk ayarlari\nalias ll='ls -la'\n");
    writeFile(vfs.home + "/projects/README.md", "# projeler\n");
  }

  seed();

  /* --- tokenizer -------------------------------------------------------- */

  function tokenize(input) {
    const tokens = [];
    let current = "";
    let quote = null;
    let hasWord = false;

    const push = () => {
      if (hasWord) { tokens.push({ type: "word", value: current }); current = ""; hasWord = false; }
    };

    for (let i = 0; i < input.length; i++) {
      const ch = input[i];
      if (quote) {
        if (ch === quote) quote = null;
        else { current += ch; hasWord = true; }
        continue;
      }
      if (ch === '"' || ch === "'") { quote = ch; hasWord = true; continue; }
      if (ch === " " || ch === "\t") { push(); continue; }
      if (ch === "|") { push(); tokens.push({ type: "op", value: "|" }); continue; }
      if (ch === ">") {
        push();
        if (input[i + 1] === ">") { tokens.push({ type: "op", value: ">>" }); i++; }
        else tokens.push({ type: "op", value: ">" });
        continue;
      }
      current += ch;
      hasWord = true;
    }
    if (quote) return { error: "kapanmamış tırnak" };
    push();
    return { tokens };
  }

  function parse(input) {
    const { tokens, error } = tokenize(input);
    if (error) return { error };

    const stages = [];
    let argv = [];
    let redirect = null;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.type === "op" && token.value === "|") {
        if (!argv.length) return { error: "sözdizimi hatası: | yanında komut yok" };
        stages.push({ argv, redirect: null });
        argv = [];
        continue;
      }
      if (token.type === "op") {
        const target = tokens[i + 1];
        if (!target || target.type !== "word") {
          return { error: "sözdizimi hatası: yönlendirme hedefi eksik" };
        }
        redirect = { op: token.value, target: target.value };
        i++;
        continue;
      }
      argv.push(token.value);
    }
    if (argv.length) stages.push({ argv, redirect: null });
    if (!stages.length) return { error: null, stages: [] };
    stages[stages.length - 1].redirect = redirect;
    return { stages };
  }

  /* --- argument helpers ------------------------------------------------- */

  function splitFlags(argv) {
    const flags = new Set();
    const long = [];
    const args = [];
    for (const item of argv) {
      if (item.length > 1 && item[0] === "-" && item[1] === "-") long.push(item);
      else if (item.length > 1 && item[0] === "-") for (const ch of item.slice(1)) flags.add(ch);
      else args.push(item);
    }
    return { flags, long, args };
  }

  function globToRegExp(pattern) {
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&")
      .replace(/\*/g, ".*")
      .replace(/\?/g, ".");
    return new RegExp("^" + escaped + "$");
  }

  function listNames(node) {
    return Array.from(node.children.keys()).sort((a, b) => a.localeCompare(b));
  }

  function modeString(node) {
    const base = node.type === "dir" ? "d" : "-";
    const x = node.type === "dir" || node.exec ? "x" : "-";
    return base + "rw" + x + "------";
  }

  function longLine(node) {
    const size = node.type === "dir" ? 4096 : node.content.length;
    const d = node.mtime;
    const stamp = `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, " ")} ` +
      `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    return `${modeString(node)}  1 ${vfs.user} ${vfs.user} ${String(size).padStart(5, " ")} ${stamp} ${node.name}`;
  }

  /* --- commands --------------------------------------------------------- */

  const ok = (out = "") => ({ out, err: "", code: 0 });
  const fail = (err) => ({ out: "", err, code: 1 });

  const commands = {
    pwd: () => ok(vfs.cwd + "\n"),

    whoami: () => ok(vfs.user + "\n"),

    date: () => ok(new Date().toString() + "\n"),

    clear: () => ({ out: "", err: "", code: 0, clear: true }),

    echo: ({ argv }) => ok(argv.slice(1).join(" ") + "\n"),

    cd: ({ argv }) => {
      const target = argv[1] || "~";
      const abs = resolve(target);
      const node = get(abs);
      if (!node) return fail(`cd: ${target}: böyle bir dosya ya da dizin yok`);
      if (node.type !== "dir") return fail(`cd: ${target}: dizin değil`);
      vfs.lastDir = vfs.cwd;
      vfs.cwd = abs;
      return ok();
    },

    ls: ({ argv }) => {
      const { flags, args } = splitFlags(argv.slice(1));
      const target = args[0] || ".";
      const node = get(target);
      if (!node) return fail(`ls: ${target}: böyle bir dosya ya da dizin yok`);

      if (node.type === "file") {
        return ok(flags.has("l") ? longLine(node) + "\n" : node.name + "\n");
      }

      let names = listNames(node);
      if (!flags.has("a")) names = names.filter((n) => !n.startsWith("."));

      if (flags.has("l")) {
        const rows = [];
        if (flags.has("a")) {
          rows.push(modeString(node) + `  2 ${vfs.user} ${vfs.user}  4096 . `);
          rows.push(modeString(node) + `  3 ${vfs.user} ${vfs.user}  4096 .. `);
        }
        for (const name of names) rows.push(longLine(node.children.get(name)));
        return ok(`total ${names.length * 4}\n` + rows.join("\n") + (rows.length ? "\n" : ""));
      }
      return ok(names.length ? names.join("  ") + "\n" : "");
    },

    mkdir: ({ argv }) => {
      const { flags, args } = splitFlags(argv.slice(1));
      if (!args.length) return fail("mkdir: işlenecek dizin adı yok");
      for (const arg of args) {
        if (flags.has("p")) { mkdirp(arg); continue; }
        const { dir, base } = parentOf(arg);
        if (!dir || dir.type !== "dir") return fail(`mkdir: ${arg}: üst dizin yok (-p dene)`);
        if (dir.children.has(base)) return fail(`mkdir: ${arg}: dosya var`);
        dir.children.set(base, makeDir(base));
      }
      return ok();
    },

    touch: ({ argv }) => {
      const { args } = splitFlags(argv.slice(1));
      if (!args.length) return fail("touch: işlenecek dosya adı yok");
      for (const arg of args) {
        const node = get(arg);
        if (node) { node.mtime = new Date(); continue; }
        if (!writeFile(arg, "")) return fail(`touch: ${arg}: dizin oluşturulamıyor`);
      }
      return ok();
    },

    cat: ({ argv, stdin }) => {
      const { flags, args } = splitFlags(argv.slice(1));
      let text = "";
      if (!args.length) text = stdin;
      else {
        for (const arg of args) {
          const node = get(arg);
          if (!node) return fail(`cat: ${arg}: böyle bir dosya ya da dizin yok`);
          if (node.type === "dir") return fail(`cat: ${arg}: bir dizin`);
          text += node.content;
        }
      }
      if (flags.has("n")) {
        text = text.replace(/\n$/, "").split("\n")
          .map((line, i) => `${String(i + 1).padStart(6, " ")}\t${line}`).join("\n") + "\n";
      }
      return ok(text);
    },

    rm: ({ argv }) => {
      const { flags, args } = splitFlags(argv.slice(1));
      if (!args.length) return flags.has("f") ? ok() : fail("rm: işlenecek dosya adı yok");
      for (const arg of args) {
        const { dir, base } = parentOf(arg);
        const node = dir && dir.type === "dir" ? dir.children.get(base) : null;
        if (!node) {
          if (flags.has("f")) continue;
          return fail(`rm: ${arg}: böyle bir dosya ya da dizin yok`);
        }
        if (node.type === "dir" && !flags.has("r")) {
          return fail(`rm: ${arg}: bir dizin — silmek için -r gerekir`);
        }
        dir.children.delete(base);
      }
      return ok();
    },

    cp: ({ argv }) => {
      const { flags, args } = splitFlags(argv.slice(1));
      if (args.length < 2) return fail("cp: hedef eksik");
      const source = get(args[0]);
      if (!source) return fail(`cp: ${args[0]}: böyle bir dosya ya da dizin yok`);
      if (source.type === "dir" && !flags.has("r")) {
        return fail(`cp: ${args[0]}: bir dizin (-r kullan)`);
      }

      const clone = (node, name) => {
        if (node.type === "file") return makeFile(name, node.content, node.exec);
        const copy = makeDir(name);
        for (const [key, child] of node.children) copy.children.set(key, clone(child, key));
        return copy;
      };

      const destNode = get(args[1]);
      if (destNode && destNode.type === "dir") {
        destNode.children.set(source.name, clone(source, source.name));
        return ok();
      }
      const { dir, base } = parentOf(args[1]);
      if (!dir || dir.type !== "dir") return fail(`cp: ${args[1]}: hedef dizin yok`);
      dir.children.set(base, clone(source, base));
      return ok();
    },

    mv: ({ argv }) => {
      const { args } = splitFlags(argv.slice(1));
      if (args.length < 2) return fail("mv: hedef eksik");
      const from = parentOf(args[0]);
      const node = from.dir && from.dir.type === "dir" ? from.dir.children.get(from.base) : null;
      if (!node) return fail(`mv: ${args[0]}: böyle bir dosya ya da dizin yok`);

      const destNode = get(args[1]);
      if (destNode && destNode.type === "dir") {
        from.dir.children.delete(from.base);
        destNode.children.set(node.name, node);
        return ok();
      }
      const to = parentOf(args[1]);
      if (!to.dir || to.dir.type !== "dir") return fail(`mv: ${args[1]}: hedef dizin yok`);
      from.dir.children.delete(from.base);
      node.name = to.base;
      to.dir.children.set(to.base, node);
      return ok();
    },

    grep: ({ argv, stdin }) => {
      const { flags, args } = splitFlags(argv.slice(1));
      if (!args.length) return fail("grep: kullanım: grep [-inv] DESEN [DOSYA...]");
      const pattern = args[0];
      const files = args.slice(1);

      let regex;
      try {
        regex = new RegExp(pattern, flags.has("i") ? "i" : "");
      } catch {
        const literal = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        regex = new RegExp(literal, flags.has("i") ? "i" : "");
      }

      const sources = [];
      if (!files.length) sources.push({ name: "", text: stdin });
      else {
        for (const file of files) {
          const node = get(file);
          if (!node) return fail(`grep: ${file}: böyle bir dosya ya da dizin yok`);
          if (node.type === "dir") {
            if (!flags.has("r")) return fail(`grep: ${file}: bir dizin`);
            const walk = (dir, prefix) => {
              for (const name of listNames(dir)) {
                const child = dir.children.get(name);
                if (child.type === "dir") walk(child, prefix + name + "/");
                else sources.push({ name: prefix + name, text: child.content });
              }
            };
            walk(node, file.replace(/\/$/, "") + "/");
          } else {
            sources.push({ name: file, text: node.content });
          }
        }
      }

      const many = sources.length > 1;
      const out = [];
      for (const source of sources) {
        const lines = source.text.split("\n");
        lines.forEach((line, index) => {
          if (index === lines.length - 1 && line === "") return;
          const hit = regex.test(line);
          if (hit === flags.has("v")) return;
          let row = line;
          if (flags.has("n")) row = `${index + 1}:${row}`;
          if (many) row = `${source.name}:${row}`;
          out.push(row);
        });
      }
      if (!out.length) return { out: "", err: "", code: 1 };
      return ok(out.join("\n") + "\n");
    },

    find: ({ argv }) => {
      const rest = argv.slice(1);
      let start = ".";
      let namePattern = null;
      let typeFilter = null;

      for (let i = 0; i < rest.length; i++) {
        if (rest[i] === "-name") { namePattern = rest[++i]; continue; }
        if (rest[i] === "-type") { typeFilter = rest[++i]; continue; }
        if (!rest[i].startsWith("-")) start = rest[i];
      }

      const startNode = get(start);
      if (!startNode) return fail(`find: '${start}': böyle bir dosya ya da dizin yok`);

      const matcher = namePattern ? globToRegExp(namePattern) : null;
      const results = [];

      const walk = (node, path) => {
        const isDir = node.type === "dir";
        const typeOk = !typeFilter
          || (typeFilter === "d" && isDir)
          || (typeFilter === "f" && !isDir);
        const nameOk = !matcher || matcher.test(node.name || "");
        if (typeOk && nameOk) results.push(path);
        if (isDir) {
          for (const name of listNames(node)) {
            walk(node.children.get(name), path === "/" ? "/" + name : path + "/" + name);
          }
        }
      };

      walk(startNode, start === "/" ? "/" : start.replace(/\/$/, ""));
      return ok(results.length ? results.join("\n") + "\n" : "");
    },

    head: ({ argv, stdin }) => sliceLines(argv, stdin, true),
    tail: ({ argv, stdin }) => sliceLines(argv, stdin, false),

    wc: ({ argv, stdin }) => {
      const { flags, args } = splitFlags(argv.slice(1));
      let text = stdin;
      if (args.length) {
        const node = get(args[0]);
        if (!node) return fail(`wc: ${args[0]}: böyle bir dosya ya da dizin yok`);
        if (node.type === "dir") return fail(`wc: ${args[0]}: bir dizin`);
        text = node.content;
      }
      const trimmed = text.replace(/\n$/, "");
      const lines = text === "" ? 0 : trimmed.split("\n").length;
      const words = trimmed.split(/\s+/).filter(Boolean).length;
      const chars = text.length;
      if (flags.has("l")) return ok(lines + "\n");
      if (flags.has("w")) return ok(words + "\n");
      if (flags.has("c")) return ok(chars + "\n");
      return ok(`${lines} ${words} ${chars}\n`);
    },

    chmod: ({ argv }) => {
      const { args } = splitFlags(argv.slice(1));
      const mode = argv[1];
      const targets = args.filter((a) => a !== mode);
      if (!mode || !targets.length) return fail("chmod: kullanım: chmod +x DOSYA");
      for (const target of targets) {
        const node = get(target);
        if (!node) return fail(`chmod: ${target}: böyle bir dosya ya da dizin yok`);
        if (mode === "+x") node.exec = true;
        else if (mode === "-x") node.exec = false;
        else if (/^[0-7]{3}$/.test(mode)) node.exec = (parseInt(mode[0], 8) & 1) === 1;
        else return fail(`chmod: ${mode}: geçersiz mod`);
      }
      return ok();
    },

    tree: ({ argv }) => {
      const { args } = splitFlags(argv.slice(1));
      const start = args[0] || ".";
      const node = get(start);
      if (!node) return fail(`tree: ${start}: böyle bir dizin yok`);
      const rows = [display(resolve(start))];
      const walk = (dir, prefix) => {
        const names = listNames(dir).filter((n) => !n.startsWith("."));
        names.forEach((name, index) => {
          const child = dir.children.get(name);
          const last = index === names.length - 1;
          rows.push(prefix + (last ? "└── " : "├── ") + name);
          if (child.type === "dir") walk(child, prefix + (last ? "    " : "│   "));
        });
      };
      if (node.type === "dir") walk(node, "");
      return ok(rows.join("\n") + "\n");
    },

    pkg: ({ argv }) => {
      const sub = argv[1];
      const name = argv[2];
      if (!sub) return fail("pkg: kullanım: pkg install|search|update|upgrade|uninstall|list-installed");

      if (sub === "update" || sub === "upgrade") {
        return ok("Paket listesi tazelendi.\nTüm paketler güncel.\n");
      }
      if (sub === "list-installed") {
        return ok(Array.from(vfs.packages).sort().join("\n") + "\n");
      }
      if (sub === "search") {
        if (!name) return fail("pkg search: arama terimi gerekli");
        const hits = AVAILABLE_PACKAGES.filter((p) => p.includes(name));
        return ok(hits.length ? hits.join("\n") + "\n" : "Eşleşen paket yok.\n");
      }
      if (sub === "install") {
        if (!name) return fail("pkg install: paket adı gerekli");
        if (!AVAILABLE_PACKAGES.includes(name)) {
          return fail(`pkg: '${name}' bu sanal depoda yok. pkg search ile bak.`);
        }
        if (vfs.packages.has(name)) return ok(`${name} zaten kurulu.\n`);
        vfs.packages.add(name);
        return ok(`${name} kuruluyor...\n${name} kuruldu.\n`);
      }
      if (sub === "uninstall" || sub === "remove") {
        if (!vfs.packages.has(name)) return fail(`pkg: ${name} kurulu değil`);
        vfs.packages.delete(name);
        return ok(`${name} kaldırıldı.\n`);
      }
      return fail(`pkg: bilinmeyen alt komut: ${sub}`);
    },

    git: ({ argv }) => {
      const sub = argv[1];
      if (!sub) return fail("git: kullanım: git init|status|add|commit|log");

      if (sub === "init") {
        if (vfs.repos.has(vfs.cwd)) return ok("Var olan Git deposu yeniden başlatıldı.\n");
        vfs.repos.set(vfs.cwd, { staged: [], commits: [], tracked: new Set() });
        return ok(`Initialized empty Git repository in ${vfs.cwd}/.git/\n`);
      }

      const found = repoFor(vfs.cwd);
      if (!found) return fail("fatal: not a git repository (or any of the parent directories): .git");
      const { repo } = found;

      if (sub === "status") {
        const node = get(vfs.cwd);
        const present = node && node.type === "dir"
          ? listNames(node).filter((n) => !n.startsWith("."))
          : [];
        const untracked = present.filter((n) => !repo.tracked.has(n) && !repo.staged.includes(n));
        const rows = ["On branch main", ""];
        if (repo.staged.length) {
          rows.push("Changes to be committed:");
          repo.staged.forEach((f) => rows.push(`\tnew file:   ${f}`));
          rows.push("");
        }
        if (untracked.length) {
          rows.push("Untracked files:");
          untracked.forEach((f) => rows.push(`\t${f}`));
          rows.push("");
        }
        if (!repo.staged.length && !untracked.length) {
          rows.push("nothing to commit, working tree clean");
        }
        return ok(rows.join("\n") + "\n");
      }

      if (sub === "add") {
        const target = argv[2];
        if (!target) return fail("Nothing specified, nothing added.");
        const node = get(vfs.cwd);
        const present = node && node.type === "dir"
          ? listNames(node).filter((n) => !n.startsWith("."))
          : [];
        if (target === "." || target === "-A") {
          present.forEach((f) => { if (!repo.staged.includes(f)) repo.staged.push(f); });
          return ok();
        }
        if (!get(target)) return fail(`fatal: pathspec '${target}' did not match any files`);
        if (!repo.staged.includes(target)) repo.staged.push(target);
        return ok();
      }

      if (sub === "commit") {
        const index = argv.indexOf("-m");
        const message = index !== -1 ? argv[index + 1] : null;
        if (!message) return fail('git commit: mesaj gerekli — git commit -m "mesaj"');
        if (!repo.staged.length) return fail("nothing to commit, working tree clean");
        const files = repo.staged.slice();
        files.forEach((f) => repo.tracked.add(f));
        const hash = Math.random().toString(16).slice(2, 9);
        repo.commits.unshift({ hash, message, files, at: new Date() });
        repo.staged = [];
        return ok(`[main ${hash}] ${message}\n ${files.length} file(s) changed\n`);
      }

      if (sub === "log") {
        if (!repo.commits.length) {
          return fail("fatal: your current branch 'main' does not have any commits yet");
        }
        if (argv.includes("--oneline")) {
          return ok(repo.commits.map((c) => `${c.hash} ${c.message}`).join("\n") + "\n");
        }
        return ok(repo.commits.map((c) =>
          `commit ${c.hash}\nAuthor: ${vfs.user}\nDate:   ${c.at.toString()}\n\n    ${c.message}\n`
        ).join("\n") + "\n");
      }

      return fail(`git: '${sub}' bu sanal ortamda desteklenmiyor.`);
    },

    man: ({ argv }) => {
      const name = argv[1];
      if (!name) return fail("man: hangi komut?");
      const entry = MANUAL[name];
      if (!entry) return fail(`man: ${name} için kayıt yok`);
      return ok(`${name.toUpperCase()}\n\n${entry}\n`);
    },

    help: () => ok(
      "Bu sanal terminal gerçek bir dosya sistemi üzerinde çalışır.\n\n" +
      "Dizin    : pwd, ls, cd, tree\n" +
      "Dosya    : touch, cat, mkdir, cp, mv, rm, chmod\n" +
      "Metin    : echo, grep, find, head, tail, wc\n" +
      "Termux   : pkg\n" +
      "Sürüm    : git (init, status, add, commit, log)\n" +
      "Diğer    : man, whoami, date, clear, help\n\n" +
      "Yönlendirme > ve >> ile, borulama | ile çalışır.\n" +
      "Örnek: ls | grep txt   ·   echo merhaba > not.txt\n"
    ),
  };

  function sliceLines(argv, stdin, fromTop) {
    const { args } = splitFlags(argv.slice(1));
    let count = 10;
    const nIndex = argv.indexOf("-n");
    if (nIndex !== -1 && argv[nIndex + 1]) count = parseInt(argv[nIndex + 1], 10) || 10;

    const file = args.find((a) => a !== String(count));
    let text = stdin;
    if (file) {
      const node = get(file);
      if (!node) return fail(`${argv[0]}: ${file}: böyle bir dosya ya da dizin yok`);
      if (node.type === "dir") return fail(`${argv[0]}: ${file}: bir dizin`);
      text = node.content;
    }
    const lines = text.replace(/\n$/, "").split("\n");
    const picked = fromTop ? lines.slice(0, count) : lines.slice(-count);
    return ok(picked.join("\n") + (picked.length ? "\n" : ""));
  }

  const MANUAL = {
    pwd: "Bulunduğun dizinin tam yolunu yazdırır.",
    ls: "Dizin içeriğini listeler. -l uzun format, -a gizli dosyalar dahil.",
    cd: "Çalışma dizinini değiştirir. cd .. üst dizin, cd ~ ev dizini.",
    mkdir: "Dizin oluşturur. -p ile iç içe dizinleri tek seferde açar.",
    touch: "Boş dosya oluşturur ya da zaman damgasını günceller.",
    cat: "Dosya içeriğini yazdırır. -n satırları numaralandırır.",
    cp: "Kopyalar. Dizinler için -r gerekir.",
    mv: "Taşır ya da yeniden adlandırır.",
    rm: "Siler. -r dizinler için, -f sormadan. Geri alınamaz.",
    grep: "Metin arar. -i harf duyarsız, -n satır numarası, -r özyinelemeli.",
    find: "Dosya arar. -name isim deseni, -type f/d tür filtresi.",
    wc: "Satır, kelime ve karakter sayar. -l sadece satır.",
    chmod: "İzinleri değiştirir. +x çalıştırılabilir yapar.",
    pkg: "Termux paket yöneticisi: install, search, update, list-installed.",
    git: "Sürüm kontrolü: init, status, add, commit -m, log --oneline.",
    echo: "Verilen metni yazdırır. > ile dosyaya yönlendirilebilir.",
  };

  /* Commands that exist on a real device but cannot be honestly emulated. */
  const NOT_EMULATED = {
    python: "Python bu emülatörde çalıştırılmaz.",
    python3: "Python bu emülatörde çalıştırılmaz.",
    pip: "pip bu emülatörde çalıştırılmaz.",
    node: "Node.js bu emülatörde çalıştırılmaz.",
    npm: "npm bu emülatörde çalıştırılmaz.",
    flask: "Flask bu emülatörde çalıştırılmaz.",
    curl: "Ağ istekleri bu emülatörde yapılmaz.",
    wget: "Ağ istekleri bu emülatörde yapılmaz.",
    ssh: "SSH bağlantısı bu emülatörde kurulmaz.",
    nano: "Metin editörü bu emülatörde açılmaz — echo ile yazmayı dene.",
    vim: "Metin editörü bu emülatörde açılmaz — echo ile yazmayı dene.",
    sudo: "Termux'ta sudo yoktur; root gerekmez.",
    "termux-setup-storage": "Depolama izni yalnızca gerçek cihazda istenebilir.",
  };

  /* --- run -------------------------------------------------------------- */

  function runStage(stage, stdin) {
    const name = stage.argv[0];
    const handler = commands[name];

    if (!handler) {
      if (NOT_EMULATED[name]) {
        return {
          out: "",
          err: `${NOT_EMULATED[name]}\nGerçek cihazındaki Termux'ta çalışır. Burada dosya sistemi komutlarını deneyebilirsin.`,
          code: 127,
        };
      }
      return { out: "", err: `${name}: komut bulunamadı — help yaz`, code: 127 };
    }
    return handler({ argv: stage.argv, stdin, flags: splitFlags(stage.argv.slice(1)) });
  }

  /**
   * Execute one input line.
   * Returns { lines: [{text, cls}], clear: bool }
   */
  function run(input) {
    const raw = input.trim();
    if (!raw) return { lines: [] };

    const { stages, error } = parse(raw);
    if (error) {
      vfs.history.push({ raw, cmd: raw.split(/\s+/)[0], argv: [], out: "", code: 2, pipeline: [] });
      return { lines: [{ text: error, cls: "e" }] };
    }
    if (!stages.length) return { lines: [] };

    let stdin = "";
    let result = { out: "", err: "", code: 0 };
    const lines = [];
    let shouldClear = false;

    for (const stage of stages) {
      result = runStage(stage, stdin);
      if (result.clear) shouldClear = true;
      if (result.err) {
        lines.push({ text: result.err, cls: "e" });
        stdin = "";
        break;
      }
      stdin = result.out;
    }

    const last = stages[stages.length - 1];
    if (!result.err && last && last.redirect) {
      const appendMode = last.redirect.op === ">>";
      if (!writeFile(last.redirect.target, stdin, { append: appendMode })) {
        lines.push({ text: `${last.redirect.target}: yazılamıyor`, cls: "e" });
      }
      stdin = "";
    }

    if (stdin) {
      for (const line of stdin.replace(/\n$/, "").split("\n")) {
        lines.push({ text: line, cls: "" });
      }
    }

    vfs.history.push({
      raw,
      cmd: stages[0].argv[0],
      argv: stages[0].argv,
      argstr: stages[0].argv.slice(1).join(" "),
      out: result.err ? "" : (last && last.redirect ? "" : stdin),
      lastOut: lines.map((l) => l.text).join("\n"),
      code: result.code,
      pipeline: stages.map((s) => s.argv[0]),
      redirect: last ? last.redirect : null,
    });

    return { lines, clear: shouldClear };
  }

  Object.assign(vfs, {
    resolve, get, mkdirp, writeFile, display, reset: seed, run,
    prompt: () => display(vfs.cwd),
    isInstalled: (name) => vfs.packages.has(name),
    allRepos: () => Array.from(vfs.repos.values()),
  });

  return vfs;
}

/* --- mission verification -------------------------------------------------
 * Checks read real filesystem/session state, so a mission can only pass if the
 * user actually produced the described result.
 * ------------------------------------------------------------------------ */

export function verify(check, vfs) {
  if (!check) return false;

  switch (check.type) {
    case "read_only":
      return true;

    case "ran":
      return vfs.history.some((entry) => entry.cmd === check.cmd && entry.code !== 127);

    case "ran_with":
      return vfs.history.some((entry) =>
        entry.cmd === check.cmd
        && check.args_any.some((candidate) => {
          const wanted = candidate.split(/\s+/).sort().join(" ");
          const actual = (entry.argstr || "").split(/\s+/).filter(Boolean).sort().join(" ");
          return wanted === actual;
        }));

    case "ran_output_contains":
      return vfs.history.some((entry) =>
        entry.cmd === check.cmd
        && entry.code === 0
        && (entry.lastOut || "").includes(check.text));

    case "ran_piped":
      return vfs.history.some((entry) =>
        check.cmds.every((name) => entry.pipeline.includes(name))
        && entry.pipeline.length > 1);

    case "cwd_endswith":
      return vfs.cwd.endsWith(check.path);

    case "exists":
      return !!vfs.get(check.path);

    case "not_exists":
      return !vfs.get(check.path);

    case "isdir": {
      const node = vfs.get(check.path);
      return !!node && node.type === "dir";
    }

    case "isfile": {
      const node = vfs.get(check.path);
      return !!node && node.type === "file";
    }

    case "is_executable": {
      const node = vfs.get(check.path);
      return !!node && node.type === "file" && node.exec === true;
    }

    case "file_contains": {
      const node = vfs.get(check.path);
      return !!node && node.type === "file"
        && node.content.toLowerCase().includes(check.text.toLowerCase());
    }

    case "file_contains_all": {
      const node = vfs.get(check.path);
      if (!node || node.type !== "file") return false;
      const content = node.content.toLowerCase();
      return check.texts.every((text) => content.includes(text.toLowerCase()));
    }

    case "pkg_installed":
      return vfs.isInstalled(check.name);

    case "git_committed":
      return vfs.allRepos().some((repo) => repo.commits.length > 0);

    case "git_commits_min":
      return vfs.allRepos().some((repo) => repo.commits.length >= check.count);

    case "all":
      return check.checks.every((sub) => verify(sub, vfs));

    case "any":
      return check.checks.some((sub) => verify(sub, vfs));

    default:
      return false;
  }
}
