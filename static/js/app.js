/* ===========================================================================
   ARDA.OS v2.5 — frontend
   İçerik content/site.json'dan (fetch), olmazsa window.SITE_DATA fallback'inden.
   =========================================================================== */
(function () {
  "use strict";

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ls = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };

  let DATA = null;
  const DONE_KEY = "ardaos_termux_v2";
  let doneSet = new Set(ls.get(DONE_KEY, []));

  /* --------------------------------------------------------------------- */
  async function loadData() {
    try {
      const res = await fetch("content/site.json", { cache: "no-store" });
      if (res.ok) return await res.json();
    } catch (e) {}
    return window.SITE_DATA || null;
  }

  /* ===================== RENDER ========================================= */
  function renderProfile() {
    const p = DATA.profile || {};
    const av = $("#avatar");
    if (p.avatarImage) av.style.backgroundImage = `url("${p.avatarImage}")`;
    else av.textContent = p.avatarInitials || (p.name || "A").slice(0, 2).toUpperCase();

    const name = p.name || "ARDA";
    const hn = $("#hero-name"); hn.textContent = name; hn.setAttribute("data-t", name);
    $("#eb-system").textContent = p.system || "ARDA.OS";
    $("#eb-kicker").textContent = p.kicker || "DIGITAL SPACE";
    $("#brand-name").textContent = p.system || "ARDA.OS";
    $("#bio").textContent = p.bio || "";
    $("#pm-build").textContent = p.build || "2026";
    $("#foot-handle").textContent = p.handle || "";
    const ig = $("#ig-btn"); ig.href = p.instagram || "#";

    // Hero ana ifade: tagline "BUILD / EXPERIMENT / LEARN" -> stacked "BUILD." vb.
    const words = (p.tagline || "BUILD / EXPERIMENT / LEARN").split("/").map((w) => w.trim()).filter(Boolean);
    $("#hero-statement").innerHTML = words.map((w, i) =>
      `<span class="hs-word" style="--wd:${120 + i * 110}ms">${esc(w)}${/[.]$/.test(w) ? "" : "."}</span>`).join("");
  }

  // Gerçek yerel saat (browser verisi)
  function startClock() {
    const el = $("#pm-clock");
    function tick() {
      const now = new Date();
      el.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    }
    tick(); setInterval(tick, 1000 * 20);
    // Saniye hassasiyeti gerekmiyor; dakikada birkaç güncelleme yeterli + performans
    setTimeout(() => { tick(); setInterval(tick, 30000); }, (60 - new Date().getSeconds()) * 1000);
  }

  function renderNow() {
    const arrow = `<svg class="now-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>`;
    $("#now-list").innerHTML = (DATA.now || []).map((n) => {
      const body = `<span class="now-body"><span class="now-v">${esc(n.v)}${n.href ? arrow : ""}</span>${n.sub ? `<span class="now-sub">${esc(n.sub)}</span>` : ""}</span>`;
      const k = `<span class="now-k">${esc(n.k)}</span>`;
      return n.href
        ? `<a class="now-row" href="${esc(n.href)}" target="_blank" rel="noopener">${k}${body}</a>`
        : `<div class="now-row">${k}${body}</div>`;
    }).join("");
  }

  function renderMusic() {
    const m = DATA.music || {};
    const eq = `<span class="np-eq"><i></i><i></i><i></i><i></i></span>`;
    const box = $("#now-playing");
    if (m.url) {
      // Sahte şarkı/sanatçı YOK — sadece bağlantı ve varsa not
      box.innerHTML =
        `<div class="np-head">${eq} NOW PLAYING</div>
         <div class="np-title">SPOTIFY</div>
         <div class="np-sub">${esc(m.note || "profili / çalma listesini aç")}</div>
         <a class="np-open" href="${esc(m.url)}" target="_blank" rel="noopener">SPOTIFY'DA AÇ →</a>`;
    } else {
      box.innerHTML =
        `<div class="np-head">${eq} NOW PLAYING</div>
         <div class="np-empty">${esc(m.note || "Spotify bağlantısı henüz eklenmedi.")}</div>`;
    }
  }

  function renderTools() {
    // Kompakt sistem öğeleri: sadece kod + başlık (açıklama modalda)
    $("#tools-grid").innerHTML = (DATA.tools || []).map((t, i) =>
      `<button class="tool" data-i="${i}" style="--d:${i * 45}ms">
        <div class="tool-code">${esc(t.code)}</div>
        <div class="tool-title">${esc(t.title)}</div>
      </button>`).join("");
    $$("#tools-grid .tool").forEach((el) =>
      el.addEventListener("click", () => openTool(DATA.tools[+el.dataset.i])));
  }

  function termuxTotal() {
    return (DATA.termux.categories || []).reduce((a, c) => a + (c.lessons || []).length, 0);
  }
  function catDone(cat) {
    return (cat.lessons || []).filter((_, i) => doneSet.has(cat.id + ":" + i)).length;
  }
  function updateTermuxProgress() {
    const total = termuxTotal();
    const done = doneSet.size;
    const pct = total ? Math.round((done / total) * 100) : 0;
    $("#tp-fill").style.width = pct + "%";
    $("#tp-label").textContent = `${done} / ${total} COMPLETE`;
    $$("#termux-grid .termux-cat").forEach((el) => {
      const cat = DATA.termux.categories[+el.dataset.i];
      const cd = catDone(cat), cl = (cat.lessons || []).length;
      const c = el.querySelector(".tc-count");
      c.textContent = `${cd}/${cl}`;
      c.classList.toggle("done", cd === cl && cl > 0);
    });
  }
  function renderTermux() {
    const t = DATA.termux || {};
    $("#termux-intro").textContent = t.intro || "";
    $("#termux-grid").innerHTML = (t.categories || []).map((c, i) =>
      `<button class="termux-cat" data-i="${i}" style="--d:${i * 40}ms">
        <span class="tc-code">${esc(c.code)}</span>
        <span class="tc-main"><span class="tc-title">${esc(c.title)}</span><span class="tc-desc">${esc(c.desc)}</span></span>
        <span class="tc-count">0/0</span>
      </button>`).join("");
    $$("#termux-grid .termux-cat").forEach((el) =>
      el.addEventListener("click", () => openTermux(DATA.termux.categories[+el.dataset.i])));
    updateTermuxProgress();
  }

  function renderProjects() {
    const arrow = `<svg class="p-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>`;
    $("#projects-list").innerHTML = (DATA.projects || []).map((pr, i) =>
      `<button class="project" data-i="${i}" style="--d:${i * 60}ms">
        <span class="p-num">${esc(pr.num || String(i + 1).padStart(2, "0"))}</span>
        <span class="p-main">
          <span class="p-title">${esc(pr.title)}</span>
          <span class="p-meta"><span>${esc((pr.type || "").toUpperCase())}</span><span>·</span><span class="st" data-s="${esc((pr.status || "").toLowerCase())}">${esc((pr.status || "").toUpperCase())}</span><span>·</span><span>${esc(pr.year)}</span></span>
        </span>
        ${arrow}
        <span class="p-preview" aria-hidden="true">${esc(pr.title)}</span>
      </button>`).join("");
    $$("#projects-list .project").forEach((el) =>
      el.addEventListener("click", () => openProject(DATA.projects[+el.dataset.i])));
  }

  function renderConnect() {
    const c = DATA.connect || {};
    $("#contact-intro").textContent = c.intro || "";
    const arrow = `<svg class="find-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>`;
    // Editorial FIND ARDA satırları: profil linkleri + copy/share/qr aksiyonları
    const rows = [];
    (c.links || []).forEach((l) => {
      if (!l.href) return; // boş bağlantıyı gösterme
      rows.push(`<a class="find-row" href="${esc(l.href)}" ${l.external ? 'target="_blank" rel="noopener"' : ""}>
        <span class="find-label">${esc(l.label)}</span>
        <span class="find-right"><span class="find-meta">${esc(l.meta || "")}</span>${arrow}</span></a>`);
    });
    [["COPY LINK", "copy", "bağlantı"], ["SHARE", "share", "paylaş"], ["QR", "qr", "kod"]].forEach(([label, act, meta]) => {
      rows.push(`<button class="find-row" data-act="${act}">
        <span class="find-label">${label}</span>
        <span class="find-right"><span class="find-meta">${meta}</span>${arrow}</span></button>`);
    });
    $("#find-list").innerHTML = rows.join("");
    $$("#find-list [data-act]").forEach((b) =>
      b.addEventListener("click", () => { openShare(); handleShareAction(b.dataset.act); }));
  }

  /* ===================== OVERLAY ======================================== */
  const overlay = $("#overlay"), overlayInner = $("#overlay-inner");
  function showOverlay(html) {
    overlayInner.innerHTML = html;
    overlay.classList.add("open"); overlay.setAttribute("aria-hidden", "false");
    overlay.scrollTop = 0; document.body.style.overflow = "hidden";
  }
  function closeOverlay() {
    overlay.classList.remove("open"); overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  $("#overlay-close").addEventListener("click", closeOverlay);

  function openProject(pr) {
    if (!pr) return;
    const rows = [["STATUS", (pr.status || "").toUpperCase()], ["YEAR", pr.year], ["TYPE", pr.type]]
      .map(([k, v]) => `<div class="detail-row"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`).join("");
    const tags = (pr.tech || []).map((t) => `<span class="tech-tag">${esc(t)}</span>`).join("");
    const link = pr.link ? `<a class="detail-link" href="${esc(pr.link)}" target="_blank" rel="noopener">PROJEYİ AÇ →</a>` : "";
    showOverlay(
      `<div class="detail-kicker">PROJECT / ${esc(pr.year)}</div>
       <h2 class="detail-title">${esc(pr.title)}</h2>
       <div class="detail-rows">${rows}</div>
       <div class="detail-desc">${esc(pr.description)}</div>
       ${tags ? `<div class="tech-tags">${tags}</div>` : ""}${link}`);
  }

  function openTool(t) {
    if (!t) return;
    if (t.action === "termux-lab") { closeOverlay(); scrollToSection("#sec-termux"); return; }
    const sections = (t.sections || []).map((s) =>
      `<div class="tool-section"><h4>${esc(s.h)}</h4><p>${esc(s.t)}</p></div>`).join("");
    const links = (t.links || []).map((l) =>
      l.action === "termux-lab"
        ? `<button class="detail-link" data-tolab="1">${esc(l.label)} →</button>`
        : `<a class="detail-link" href="${esc(l.href || "#")}" target="_blank" rel="noopener">${esc(l.label)} →</a>`).join(" ");
    showOverlay(
      `<div class="detail-kicker">TOOL / ${esc(t.code)}</div>
       <h2 class="detail-title">${esc(t.title)}</h2>
       ${sections}${links}`);
    $$("#overlay-inner [data-tolab]").forEach((b) =>
      b.addEventListener("click", () => { closeOverlay(); scrollToSection("#sec-termux"); }));
  }

  function openTermux(cat) {
    if (!cat) return;
    const copyIcon = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"/></svg>`;
    const lessons = (cat.lessons || []).map((ls_, i) => {
      const id = cat.id + ":" + i, done = doneSet.has(id);
      return `<div class="lesson ${done ? "done" : ""}" data-id="${id}">
        <div class="lesson-top"><div class="lesson-title">${esc(ls_.title)}</div><div class="lesson-badge">${done ? "DONE" : "TODO"}</div></div>
        <div class="lab-block"><div class="lab-block-h">COMMAND</div><div class="cmd-box"><code class="cmd-text">$ ${esc(ls_.cmd)}</code><button class="copy-btn" data-cmd="${esc(ls_.cmd)}" data-id="${id}" aria-label="Kopyala">${copyIcon}</button></div></div>
        <div class="lab-block"><div class="lab-block-h">WHAT IT DOES</div><div class="lab-block-p">${esc(ls_.desc)}</div></div>
        ${ls_.example ? `<div class="lab-block"><div class="lab-block-h">EXAMPLE</div><div class="lab-example">${esc(ls_.example)}</div></div>` : ""}
      </div>`;
    }).join("");
    showOverlay(
      `<div class="lab-head"><div class="lab-code">${esc(cat.code)} / TERMUX LAB</div><h2 class="lab-title">${esc(cat.title)}</h2><div class="lab-sub">${esc(cat.desc)}</div></div>${lessons}`);

    $$("#overlay-inner .copy-btn").forEach((b) => {
      b.addEventListener("click", async () => {
        const ok = await copyText(b.getAttribute("data-cmd"));
        if (ok) { b.classList.add("copied"); setTimeout(() => b.classList.remove("copied"), 1200); }
        // Ders tamamlandı işaretle (ilerleme localStorage'da)
        const id = b.getAttribute("data-id");
        if (!doneSet.has(id)) {
          doneSet.add(id); ls.set(DONE_KEY, [...doneSet]);
          const lesson = b.closest(".lesson");
          lesson.classList.add("done"); lesson.querySelector(".lesson-badge").textContent = "DONE";
          updateTermuxProgress();
        }
      });
    });
  }

  /* ===================== COPY ========================================== */
  async function copyText(text) {
    try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; } } catch (e) {}
    try {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand("copy"); document.body.removeChild(ta); return ok;
    } catch (e) { return false; }
  }

  /* ===================== SHARE / QR ==================================== */
  const shareSheet = $("#share-sheet");
  const shareURL = () => window.location.href.split("#")[0];
  function openShare() { shareSheet.classList.add("open"); shareSheet.setAttribute("aria-hidden", "false"); }
  function closeShare() { shareSheet.classList.remove("open"); shareSheet.setAttribute("aria-hidden", "true"); $("#qr-wrap").hidden = true; }
  $("#share-toggle").addEventListener("click", openShare);
  shareSheet.addEventListener("click", (e) => { if (e.target === shareSheet) closeShare(); });

  async function handleShareAction(kind) {
    if (kind === "copy") {
      const ok = await copyText(shareURL());
      $("#copy-state").textContent = ok ? "kopyalandı" : "hata";
      toast(ok ? "Bağlantı kopyalandı" : "Kopyalanamadı");
      setTimeout(() => ($("#copy-state").textContent = ""), 1600);
    } else if (kind === "share") {
      if (navigator.share) { try { await navigator.share({ title: "ARDA.OS", url: shareURL() }); } catch (e) {} }
      else { const ok = await copyText(shareURL()); toast(ok ? "Paylaşım yok — bağlantı kopyalandı" : "Paylaşım desteklenmiyor"); }
    } else if (kind === "qr") { buildQR(); }
  }
  $("#btn-copy").addEventListener("click", () => handleShareAction("copy"));
  $("#btn-share").addEventListener("click", () => handleShareAction("share"));
  $("#btn-qr").addEventListener("click", () => handleShareAction("qr"));

  let qrBuilt = false;
  function buildQR() {
    $("#qr-wrap").hidden = false; $("#qr-url").textContent = shareURL();
    if (qrBuilt) return;
    try {
      new QRCode($("#qr-box"), { text: shareURL(), width: 176, height: 176, colorDark: "#000000", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M });
      qrBuilt = true;
    } catch (e) { $("#qr-box").textContent = "QR oluşturulamadı"; }
  }

  /* ===================== CONTACT ======================================= */
  function setupContact() {
    const form = $("#contact-form"), statusEl = $("#form-status"), btn = $("#c-submit");
    form.addEventListener("submit", async (e) => {
      e.preventDefault(); statusEl.className = "form-status"; statusEl.textContent = "";
      const payload = { name: $("#c-name").value.trim(), email: $("#c-email").value.trim(), message: $("#c-message").value.trim(), website: $("#hp-website").value.trim() };
      let bad = false;
      [["c-name", payload.name.length > 0], ["c-email", /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)], ["c-message", payload.message.length >= 2]]
        .forEach(([id, ok]) => { $("#" + id).closest(".field").classList.toggle("invalid", !ok); if (!ok) bad = true; });
      if (bad) { statusEl.className = "form-status err"; statusEl.textContent = "Lütfen alanları kontrol et."; return; }
      btn.disabled = true; btn.textContent = "GÖNDERİLİYOR...";
      try {
        const res = await fetch("api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.ok) { statusEl.className = "form-status ok"; statusEl.textContent = "Mesaj alındı. Teşekkürler."; form.reset(); }
        else throw new Error("server");
      } catch (err) {
        const c = DATA.connect || {};
        if (c.email) {
          const subject = encodeURIComponent("ARDA.OS — mesaj");
          const body = encodeURIComponent(`${payload.message}\n\n— ${payload.name} (${payload.email})`);
          window.location.href = `mailto:${c.email}?subject=${subject}&body=${body}`;
          statusEl.className = "form-status ok"; statusEl.textContent = "E-posta uygulaması açılıyor...";
        } else { statusEl.className = "form-status err"; statusEl.textContent = "Gönderilemedi. Daha sonra tekrar dene."; }
      } finally { btn.disabled = false; btn.textContent = "GÖNDER"; }
    });
  }

  /* ===================== COMMAND PALETTE =============================== */
  let paletteIndex = [], palSel = 0, palFiltered = [];
  function buildPaletteIndex() {
    const idx = [];
    idx.push({ title: "PROFILE — " + (DATA.profile.name || "ARDA"), sub: "kimlik", cat: "PROFILE", run: () => scrollToSection("#sec-profile") });
    idx.push({ title: "NOW", sub: "şu an", cat: "NOW", run: () => scrollToSection("#sec-now") });
    idx.push({ title: "MUSIC", sub: DATA.music.url ? "spotify" : "yakında", cat: "MUSIC", run: () => (DATA.music.url ? window.open(DATA.music.url, "_blank") : scrollToSection("#sec-music")) });
    (DATA.tools || []).forEach((t, i) => idx.push({ title: t.title, sub: t.blurb || "araç", cat: "TOOLS", run: () => openTool(DATA.tools[i]) }));
    (DATA.termux.categories || []).forEach((c, i) => idx.push({ title: "TERMUX / " + c.title, sub: c.desc, cat: "TERMUX", run: () => { scrollToSection("#sec-termux"); setTimeout(() => openTermux(DATA.termux.categories[i]), 300); } }));
    (DATA.projects || []).forEach((p, i) => idx.push({ title: p.title, sub: p.type, cat: "PROJECTS", run: () => openProject(DATA.projects[i]) }));
    idx.push({ title: "CONTACT", sub: "mesaj gönder", cat: "CONNECT", run: () => scrollToSection("#sec-connect") });
    idx.push({ title: "COPY LINK", sub: "bağlantıyı kopyala", cat: "SHARE", run: () => handleShareAction("copy") });
    idx.push({ title: "QR", sub: "qr kod", cat: "SHARE", run: () => { openShare(); handleShareAction("qr"); } });
    paletteIndex = idx;
  }
  const palette = $("#palette"), palInput = $("#palette-input"), palResults = $("#palette-results");
  function openPalette() {
    palette.classList.add("open"); palette.setAttribute("aria-hidden", "false");
    palInput.value = ""; renderPalette("");
    setTimeout(() => palInput.focus(), 60);
  }
  function closePalette() { palette.classList.remove("open"); palette.setAttribute("aria-hidden", "true"); palInput.blur(); }
  function renderPalette(q) {
    q = q.trim().toLowerCase();
    palFiltered = !q ? paletteIndex : paletteIndex.filter((it) =>
      (it.title + " " + it.cat + " " + (it.sub || "")).toLowerCase().includes(q));
    palSel = 0;
    palResults.innerHTML = palFiltered.length
      ? palFiltered.map((it, i) =>
        `<div class="pr-item ${i === 0 ? "sel" : ""}" data-i="${i}"><div class="pr-left"><div class="pr-title">${esc(it.title)}</div><div class="pr-sub">${esc(it.sub || "")}</div></div><span class="pr-cat">${esc(it.cat)}</span></div>`).join("")
      : `<div class="pr-empty">sonuç yok</div>`;
    $$("#palette-results .pr-item").forEach((el) => {
      el.addEventListener("click", () => runPalette(+el.dataset.i));
      el.addEventListener("mousemove", () => setPalSel(+el.dataset.i));
    });
  }
  function setPalSel(i) {
    palSel = i;
    $$("#palette-results .pr-item").forEach((el, di) => el.classList.toggle("sel", di === i));
  }
  function runPalette(i) {
    const it = palFiltered[i]; if (!it) return;
    closePalette(); setTimeout(() => it.run(), 120);
  }
  palInput.addEventListener("input", (e) => renderPalette(e.target.value));
  palette.addEventListener("click", (e) => { if (e.target === palette) closePalette(); });
  palInput.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setPalSel(Math.min(palSel + 1, palFiltered.length - 1)); scrollSel(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setPalSel(Math.max(palSel - 1, 0)); scrollSel(); }
    else if (e.key === "Enter") { e.preventDefault(); runPalette(palSel); }
    else if (e.key === "Escape") { closePalette(); }
  });
  function scrollSel() { const el = $$("#palette-results .pr-item")[palSel]; if (el) el.scrollIntoView({ block: "nearest" }); }
  $("#search-toggle").addEventListener("click", openPalette);

  /* ===================== INTERACTIONS ================================= */
  function scrollToSection(sel) { const el = $(sel); if (el) el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }); }

  function setupReveal() {
    const sel = ".reveal, .hero-statement, .tool, .termux-cat, .project";
    if (reduceMotion) { $$(sel).forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    $$(sel).forEach((el) => io.observe(el));
  }

  // Dokunmatikte editorial preview/hareket için .touch sınıfı
  function setupTouchStates() {
    $$(".now-row, .project").forEach((el) => {
      el.addEventListener("touchstart", () => el.classList.add("touch"), { passive: true });
      el.addEventListener("touchend", () => setTimeout(() => el.classList.remove("touch"), 400), { passive: true });
    });
  }

  function setupDots() {
    const sections = $$(".section"), nav = $("#dots");
    nav.innerHTML = sections.map((s) => `<button class="dot" data-t="#${s.id}"><span class="dot-label">${esc(s.dataset.index)} ${esc(s.dataset.name)}</span><span class="dot-mark"></span></button>`).join("");
    const dots = $$(".dot", nav);
    dots.forEach((d) => d.addEventListener("click", () => scrollToSection(d.dataset.t)));
    const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { const i = sections.indexOf(en.target); dots.forEach((d, di) => d.classList.toggle("active", di === i)); } }), { threshold: 0.5 });
    sections.forEach((s) => io.observe(s));
  }

  function setupScrollBar() {
    const fill = $("#scrollbar-fill"); let ticking = false;
    function update() {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? (window.scrollY / h) * 100 : 0;
      fill.style.width = Math.min(100, Math.max(0, p)) + "%";
      // Gizli: en alta inince final satırı göster
      if (p > 96 && DATA.easterEggs && !endShown) { showEnd(); }
      ticking = false;
    }
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  // Işık + çok hafif grid parallax (kendini belli etmeyecek kalitede)
  function setupPointerFX() {
    const light = $("#light"), grid = $("#grid");
    if (reduceMotion) { light.style.display = "none"; return; }
    let raf = 0, px = 0, py = 0;
    window.addEventListener("pointermove", (e) => {
      px = e.clientX; py = e.clientY;
      if (!raf) raf = requestAnimationFrame(() => {
        light.style.transform = `translate3d(${px}px, ${py}px, 0)`;
        const gx = (px / window.innerWidth - 0.5) * 10, gy = (py / window.innerHeight - 0.5) * 10;
        grid.style.transform = `translate3d(${gx.toFixed(1)}px, ${gy.toFixed(1)}px, 0)`;
        raf = 0;
      });
    }, { passive: true });
  }

  function setupCoords() {
    const wrap = $("#coords");
    const marks = [[12, 22], [78, 16], [30, 68], [86, 74], [55, 40], [18, 88]];
    wrap.innerHTML = marks.map(([x, y]) =>
      `<span class="mark" style="left:${x}%;top:${y}%">${String(Math.round(x * 6.4)).padStart(3, "0")}:${String(Math.round(y * 4.3)).padStart(3, "0")}</span>`).join("");
  }

  // Hafif ambient nodes (performans dostu)
  function setupAmbient() {
    if (reduceMotion) return;
    const cv = $("#ambient"), ctx = cv.getContext("2d");
    let W, H, DPR, pts = [], raf;
    function count() { return Math.max(14, Math.min(Math.round((innerWidth * innerHeight) / 30000), 46)); }
    function resize() {
      DPR = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
      cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + "px"; cv.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      pts = []; const n = count();
      for (let i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22 });
    }
    const LINK = 130;
    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1; ctx.fillStyle = "rgba(142,162,255,0.5)"; ctx.fillRect(p.x, p.y, 1.3, 1.3); }
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 < LINK * LINK) { ctx.globalAlpha = (1 - Math.sqrt(d2) / LINK) * 0.14; ctx.strokeStyle = "#8ea2ff"; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
      ctx.globalAlpha = 1; raf = requestAnimationFrame(frame);
    }
    resize(); frame();
    addEventListener("resize", resize);
    document.addEventListener("visibilitychange", () => { if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(frame); });
  }

  /* ===================== TOAST / BOOT ================================= */
  let toastTimer;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2200); }

  function boot() {
    const b = $("#boot");
    const go = () => b.classList.add("gone");
    if (reduceMotion) { go(); return; }
    const timer = setTimeout(go, 800);
    // Dokununca anında geç
    const skip = () => { clearTimeout(timer); go(); cleanup(); };
    function cleanup() { b.removeEventListener("pointerdown", skip); }
    b.addEventListener("pointerdown", skip);
  }

  /* ===================== EASTER EGGS ================================== */
  let endShown = false;
  function showEnd() { endShown = true; const el = $("#end-line"); el.textContent = (DATA.easterEggs && DATA.easterEggs.end) || ""; el.classList.add("show"); }

  function setupSecrets() {
    const eggs = DATA.easterEggs || {};

    // (1) Logoya uzun bas
    const brand = $("#brand"); let holdTimer;
    brand.addEventListener("pointerdown", () => { holdTimer = setTimeout(() => { toast(eggs.logo || "system"); $("#hero-name").classList.add("glitch"); setTimeout(() => $("#hero-name").classList.remove("glitch"), 1200); }, 600); });
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => brand.addEventListener(ev, () => clearTimeout(holdTimer)));

    // (2) Avatara 5 kez dokun
    let taps = 0, tapTimer;
    $("#avatar").addEventListener("click", () => { taps++; clearTimeout(tapTimer); tapTimer = setTimeout(() => (taps = 0), 900); if (taps >= 5) { taps = 0; toast(eggs.avatar || "access granted"); $("#hero-name").classList.add("glitch"); setTimeout(() => $("#hero-name").classList.remove("glitch"), 1200); } });

    // (4) Footer'a dokun
    $("#foot").addEventListener("click", () => toast(eggs.footer || ""));

    // (3) "?" + type "arda" + konami + Esc
    let buf = "", konami = [], seq = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown"];
    window.addEventListener("keydown", (e) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) { e.preventDefault(); openPalette(); return; }
      if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") { e.preventDefault(); openPalette(); return; }
      if (e.key === "Escape") { closeOverlay(); closeShare(); closePalette(); }
      if (e.key === "?") { toast(eggs.hint || "?"); return; }
      konami.push(e.key); konami = konami.slice(-4);
      if (konami.join(",") === seq.join(",")) toast(eggs.konami || "unlocked");
      if (e.key.length === 1) { buf = (buf + e.key.toLowerCase()).slice(-8); if (buf.endsWith("arda")) { $("#hero-name").classList.add("glitch"); setTimeout(() => $("#hero-name").classList.remove("glitch"), 1200); toast("welcome back, arda"); } }
    });

    try { console.log("%cARDA.OS", "font:700 22px monospace;color:#8ea2ff"); console.log("%c// curious ones are welcome. try ⌘K or '?'", "color:#74788c;font-family:monospace"); } catch (e) {}
  }

  /* ===================== INIT ========================================= */
  async function init() {
    DATA = await loadData();
    if (!DATA) { $("#boot").innerHTML = '<div class="boot-word">içerik yüklenemedi</div>'; return; }
    renderProfile(); startClock(); renderNow(); renderMusic(); renderTools(); renderTermux(); renderProjects(); renderConnect();
    buildPaletteIndex();
    setupReveal(); setupTouchStates(); setupDots(); setupScrollBar(); setupPointerFX(); setupCoords(); setupAmbient();
    setupContact(); setupSecrets(); boot();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
