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
    if ($("#foot-handle")) $("#foot-handle").textContent = p.handle || "";
    const ig = $("#ig-btn"); ig.href = p.instagram || "#";
    $("#ig-label").textContent = p.igCta || "INSTAGRAM";

    // Hero meta: CURRENTLY = signal[0] (BUILDING ...)
    const sig = DATA.signal || [];
    const building = sig.find((s) => /BUILD/i.test(s.k)) || sig[0];
    if (building) $("#pm-building").textContent = (building.v || "").toUpperCase();

    // Hero ana ifade: hero.statement dizisi -> stacked "BUILD." vb.
    // Zamanlama: BUILD ~0.3s, EXPERIMENT ~0.5s, LEARN ~0.7s
    const h = DATA.hero || {};
    const words = (h.statement && h.statement.length ? h.statement : ["BUILD", "EXPERIMENT", "LEARN"]);
    $("#hero-statement").innerHTML = words.map((w, i) =>
      `<span class="hs-word" style="--wd:${300 + i * 200}ms">${esc(w)}${/[.]$/.test(w) ? "" : "."}</span>`).join("");
    $("#hero-line").textContent = h.line || "";

    // Final screen
    $("#fs-system").textContent = p.system || "ARDA.OS";
    $("#fs-statement").innerHTML = words.map((w) => `<span>${esc(w)}${/[.]$/.test(w) ? "" : "."}</span>`).join("");
    $("#fs-foot").textContent = `© ${p.build || "2026"} ${p.name || "ARDA"}`;
  }

  // Gerçek oturum bilgisi — yalnızca tarayıcıdan okunabilen veriler (sahte metrik yok)
  const SESSION_ID = Math.random().toString(16).slice(2, 6).toUpperCase();
  const SESSION_START = Date.now();
  function timeOnSite() {
    const s = Math.floor((Date.now() - SESSION_START) / 1000);
    return String((s / 60) | 0).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  }
  function renderSession() {
    const el = $("#session-readout"); if (!el) return;
    const device = isTouch ? "MOBILE" : "DESKTOP";
    const vp = `${window.innerWidth}×${window.innerHeight}`;
    const online = navigator.onLine ? "ONLINE" : "OFFLINE";
    const rows = [["SESSION", SESSION_ID], ["DEVICE", device], ["VIEWPORT", vp], ["STATUS", online], ["TIME ON SITE", timeOnSite()]];
    el.innerHTML =
      `<div class="sr-top"><span class="sr-live"></span>LOCAL ONLY</div>` +
      `<div class="sr-grid">` +
      rows.map(([k, v]) => `<div class="sr-row"><span class="sr-k">${k}</span><span class="sr-v">${esc(v)}</span></div>`).join("") +
      `</div>`;
  }
  function setupSession() {
    renderSession();
    let t; window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(renderSession, 200); });
    window.addEventListener("online", renderSession);
    window.addEventListener("offline", renderSession);
    // TIME ON SITE'ı düşük maliyetle güncelle
    setInterval(() => { if (!document.hidden) renderSession(); }, 15000);
  }

  // Gerçek yerel saat (browser verisi) + hero zaman damgası
  function startClock() {
    const el = $("#pm-clock"), ts = $("#eb-ts");
    function tick() {
      const now = new Date();
      const hhmm = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
      el.textContent = hhmm;
      if (ts) {
        const p = (n) => String(n).padStart(2, "0");
        ts.textContent = `${now.getFullYear()}.${p(now.getMonth() + 1)}.${p(now.getDate())} · ${hhmm}`;
      }
    }
    tick();
    // Dakikada birkaç güncelleme yeterli (performans)
    setTimeout(() => { tick(); setInterval(tick, 30000); }, (60 - new Date().getSeconds()) * 1000);
  }

  function renderSignal() {
    const arrow = `<svg class="now-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>`;
    const items = DATA.signal || DATA.now || [];
    $("#signal-list").innerHTML = items.map((n) => {
      const tappable = !!(n.href || n.to);
      const body = `<span class="now-body"><span class="now-v">${esc(n.v)}${tappable ? arrow : ""}</span>${n.sub ? `<span class="now-sub">${esc(n.sub)}</span>` : ""}</span>`;
      const k = `<span class="now-k">${esc(n.k)}</span>`;
      if (n.href) return `<a class="now-row" href="${esc(n.href)}" target="_blank" rel="noopener">${k}${body}</a>`;
      if (n.to) return `<button class="now-row" data-to="${esc(n.to)}">${k}${body}</button>`;
      return `<div class="now-row">${k}${body}</div>`;
    }).join("");
    $$("#signal-list [data-to]").forEach((el) =>
      el.addEventListener("click", () => scrollToSection(el.getAttribute("data-to"))));
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
         <div class="np-sub">${esc(m.note || "çalma listesini aç")}</div>
         <a class="np-open" href="${esc(m.url)}" target="_blank" rel="noopener">${esc(m.cta || "LISTEN ON SPOTIFY →")}</a>`;
    } else {
      box.innerHTML =
        `<div class="np-head">${eq} NOW PLAYING</div>
         <div class="np-empty">${esc(m.note || "Spotify bağlantısı henüz eklenmedi.")}</div>`;
    }
  }

  // DIGITAL DNA — kullanılan alanları birbirine bağlanan hafif bir harita gibi göster
  function renderDNA() {
    const nodes = DATA.toolbox || [];
    $("#dna-nodes").innerHTML = nodes.map((t, i) =>
      `<button class="dna-node" data-i="${i}" style="--d:${i * 55}ms" aria-label="${esc(t.title)}">
        <span class="dna-dot"></span><span class="dna-label">${esc(t.title)}</span>
      </button>`).join("");
    $$("#dna-nodes .dna-node").forEach((el) =>
      el.addEventListener("click", () => {
        el.classList.add("active");
        setTimeout(() => el.classList.remove("active"), 450);
        openTool(DATA.toolbox[+el.dataset.i]);
      }));
    drawDNALines();
  }
  // Çekirdeği (ARDA.OS) düğümlere bağlayan organik eğri dallar — layout sonrası ölçülür
  function drawDNALines() {
    const map = $("#dna-map"), svg = $("#dna-lines"), core = $("#dna-core"); if (!map || !svg || !core) return;
    const r = map.getBoundingClientRect();
    if (r.width < 2) return;
    svg.setAttribute("viewBox", `0 0 ${r.width} ${r.height}`);
    svg.setAttribute("width", r.width); svg.setAttribute("height", r.height);
    const cb = core.getBoundingClientRect();
    const hx = cb.left - r.left + cb.width / 2, hy = cb.bottom - r.top;   // çekirdeğin alt-orta noktası
    let paths = "";
    $$("#dna-nodes .dna-node").forEach((n) => {
      const b = n.getBoundingClientRect();
      const x = b.left - r.left + b.width / 2, y = b.top - r.top;          // düğümün üst-orta noktası
      // Organik his için dikey ağırlıklı kontrol noktası
      const cxp = hx + (x - hx) * 0.35, cyp = (hy + y) / 2;
      paths += `<path d="M ${hx.toFixed(1)} ${hy.toFixed(1)} Q ${cxp.toFixed(1)} ${cyp.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}" pathLength="1" />`;
    });
    svg.innerHTML = paths;
  }

  function termuxTotal() {
    return (DATA.termux.categories || []).reduce((a, c) => a + (c.lessons || []).length, 0);
  }
  function catDone(cat) {
    return (cat.lessons || []).filter((_, i) => doneSet.has(cat.id + ":" + i)).length;
  }
  function updateTermuxProgress() {
    const total = termuxTotal();
    // Yalnızca gerçekten var olan derslerin tamamlanmışını say (localStorage)
    const done = (DATA.termux.categories || []).reduce((a, c) => a + catDone(c), 0);
    const pct = total ? Math.round((done / total) * 100) : 0;
    const p2 = (n) => String(n).padStart(2, "0");
    $("#tp-fill").style.width = pct + "%";
    if ($("#tp-count")) $("#tp-count").textContent = `${p2(done)} / ${p2(total)}`;
    if ($("#tp-pct")) $("#tp-pct").textContent = pct + "%";
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
    // Final CTA
    const cta = $("#connect-cta");
    cta.href = (DATA.profile && DATA.profile.instagram) || "#";
    $("#connect-cta-label").textContent = (DATA.profile && DATA.profile.igCta) || "FOLLOW THE JOURNEY";
    $("#connect-handle").textContent = (DATA.profile && DATA.profile.handle) || "";
    $("#cta-tagline").textContent = c.ctaTagline || "";
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
  let lastFocused = null;   // modal kapanınca geri dönmek için
  function showOverlay(html) {
    lastFocused = document.activeElement;
    overlayInner.innerHTML = html;
    overlay.classList.add("open"); overlay.setAttribute("aria-hidden", "false");
    overlay.scrollTop = 0; document.body.style.overflow = "hidden";
    setTimeout(() => $("#overlay-close").focus(), 60);
  }
  function closeOverlay() {
    if (!overlay.classList.contains("open")) return;
    overlay.classList.remove("open"); overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) { lastFocused.focus(); lastFocused = null; }
  }
  $("#overlay-close").addEventListener("click", closeOverlay);

  function openProject(pr) {
    if (!pr) return;
    const rows = [["STATUS", (pr.status || "").toUpperCase()], ["YEAR", pr.year], ["TYPE", pr.type]]
      .map(([k, v]) => `<div class="detail-row"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`).join("");
    const tags = (pr.tech || []).map((t) => `<span class="tech-tag">${esc(t)}</span>`).join("");
    const link = pr.link
      ? `<a class="detail-link" href="${esc(pr.link)}" target="_blank" rel="noopener">PROJEYİ AÇ →</a>`
      : `<span class="detail-link soon" aria-disabled="true">LINK YAKINDA</span>`;
    // Doğal anlatım: WHAT / WHY / BUILT WITH / WHAT I LEARNED
    const blocks = [
      pr.what ? { h: "WHAT", t: pr.what } : null,
      pr.why ? { h: "WHY", t: pr.why } : null,
    ].filter(Boolean).map((s) => `<div class="tool-section"><h4>${esc(s.h)}</h4><p>${esc(s.t)}</p></div>`).join("");
    const learned = pr.learned
      ? `<div class="tool-section learned"><h4>WHAT I LEARNED</h4><p>${esc(pr.learned)}</p></div>` : "";
    showOverlay(
      `<div class="detail-kicker">PROJECT / ${esc(pr.year)}</div>
       <h2 class="detail-title">${esc(pr.title)}</h2>
       <div class="detail-rows">${rows}</div>
       ${blocks}
       ${tags ? `<div class="tool-section"><h4>BUILT WITH</h4><div class="tech-tags">${tags}</div></div>` : ""}
       ${learned}${link}`);
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

  function moduleProgressHTML(cat) {
    const total = (cat.lessons || []).length, done = catDone(cat);
    const pct = total ? Math.round((done / total) * 100) : 0;
    return `<div class="lab-progress"><div class="lp-bar"><i style="width:${pct}%"></i></div><span class="lp-label">${done} / ${total} COMPLETE</span></div>`;
  }
  function refreshModuleProgress(cat) {
    const total = (cat.lessons || []).length, done = catDone(cat);
    const pct = total ? Math.round((done / total) * 100) : 0;
    const bar = $("#overlay-inner .lp-bar i"), lab = $("#overlay-inner .lp-label");
    if (bar) bar.style.width = pct + "%";
    if (lab) lab.textContent = `${done} / ${total} COMPLETE`;
  }
  function openTermux(cat) {
    if (!cat) return;
    const badgeDone = `<span class="lesson-badge done-badge">✓ COMPLETE</span>`;
    const badgeTodo = `<span class="lesson-badge">TODO</span>`;
    const lessons = (cat.lessons || []).map((ls_, i) => {
      const id = cat.id + ":" + i, done = doneSet.has(id);
      const num = String(i + 1).padStart(2, "0");
      return `<div class="lesson ${done ? "done" : ""}" data-id="${id}">
        <div class="lesson-top"><div><div class="lesson-idx">LESSON ${num}</div><div class="lesson-title">${esc(ls_.title)}</div></div>${done ? badgeDone : badgeTodo}</div>
        <div class="lab-block"><div class="lab-block-h">COMMAND</div><div class="cmd-box"><code class="cmd-text">$ ${esc(ls_.cmd)}</code></div></div>
        <div class="lab-block"><div class="lab-block-h">WHAT IT DOES</div><div class="lab-block-p">${esc(ls_.desc)}</div></div>
        ${ls_.example ? `<div class="lab-block"><div class="lab-block-h">EXAMPLE</div><div class="lab-example">${esc(ls_.example)}</div></div>` : ""}
        <button class="copy-cmd" data-cmd="${esc(ls_.cmd)}" data-id="${id}">COPY COMMAND</button>
      </div>`;
    }).join("");
    showOverlay(
      `<div class="lab-head"><div class="lab-code">${esc(cat.code)} / TERMUX LAB</div><h2 class="lab-title">${esc(cat.title)}</h2><div class="lab-sub">${esc(cat.desc)}</div></div>${moduleProgressHTML(cat)}${lessons}`);

    $$("#overlay-inner .copy-cmd").forEach((b) => {
      b.addEventListener("click", async () => {
        const ok = await copyText(b.getAttribute("data-cmd"));
        if (ok) { b.classList.add("copied"); b.textContent = "COPIED ✓"; setTimeout(() => { b.classList.remove("copied"); b.textContent = "COPY COMMAND"; }, 1300); }
        const id = b.getAttribute("data-id");
        if (!doneSet.has(id)) {
          doneSet.add(id); ls.set(DONE_KEY, [...doneSet]);
          const lesson = b.closest(".lesson");
          lesson.classList.add("done");
          lesson.querySelector(".lesson-badge").outerHTML = badgeDone;
          refreshModuleProgress(cat);
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
  function openShare() {
    shareSheet.classList.add("open"); shareSheet.setAttribute("aria-hidden", "false");
    $("#share-toggle").setAttribute("aria-expanded", "true");
    setTimeout(() => $("#btn-copy").focus(), 60);
  }
  function closeShare() {
    shareSheet.classList.remove("open"); shareSheet.setAttribute("aria-hidden", "true"); $("#qr-wrap").hidden = true;
    $("#share-toggle").setAttribute("aria-expanded", "false");
  }
  $("#share-toggle").addEventListener("click", openShare);
  shareSheet.addEventListener("click", (e) => { if (e.target === shareSheet) closeShare(); });

  // Küçük "COPIED / LINK READY" feedback animasyonu
  function flashFeedback(emId, btnId, text) {
    const em = $("#" + emId), btn = $("#" + btnId);
    if (em) { em.textContent = text; em.classList.add("show"); }
    if (btn) btn.classList.add("flash");
    setTimeout(() => { if (em) { em.classList.remove("show"); em.textContent = ""; } if (btn) btn.classList.remove("flash"); }, 1700);
  }

  async function handleShareAction(kind) {
    if (kind === "copy") {
      const ok = await copyText(shareURL());
      if (ok) flashFeedback("copy-state", "btn-copy", "COPIED");
      else toast("Kopyalanamadı");
    } else if (kind === "share") {
      if (navigator.share) {
        try { await navigator.share({ title: "ARDA.OS", url: shareURL() }); flashFeedback("share-state", "btn-share", "LINK READY"); } catch (e) {}
      } else {
        const ok = await copyText(shareURL());
        if (ok) flashFeedback("share-state", "btn-share", "LINK READY");
        else toast("Paylaşım desteklenmiyor");
      }
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
    (DATA.projects || []).forEach((p, i) => idx.push({ title: p.title, sub: p.type, cat: "PROJECT", cmd: "projects project", run: () => openProject(DATA.projects[i]) }));
    (DATA.termux.categories || []).forEach((c, i) => idx.push({ title: "TERMUX / " + c.title, sub: c.desc, cat: "TERMUX", cmd: "termux", run: () => { scrollToSection("#sec-termux"); setTimeout(() => openTermux(DATA.termux.categories[i]), 300); } }));
    (DATA.toolbox || []).forEach((t, i) => idx.push({ title: t.title, sub: t.blurb || "araç", cat: "TOOL", cmd: "tools tool dna", run: () => openTool(DATA.toolbox[i]) }));
    idx.push({ title: "PROFILE", sub: "kimlik", cat: "SECTION", cmd: "profile", run: () => scrollToSection("#sec-profile") });
    idx.push({ title: "SIGNAL", sub: "şu anki durum", cat: "SECTION", cmd: "signal now", run: () => scrollToSection("#sec-signal") });
    idx.push({ title: "MUSIC", sub: DATA.music.url ? "spotify" : "yakında", cat: "SECTION", cmd: "music", run: () => (DATA.music.url ? window.open(DATA.music.url, "_blank") : scrollToSection("#sec-music")) });
    idx.push({ title: "CONNECT", sub: "iletişim", cat: "SECTION", cmd: "connect contact", run: () => scrollToSection("#sec-connect") });
    idx.push({ title: "COPY LINK", sub: "bağlantıyı kopyala", cat: "ACTION", cmd: "copy search", run: () => { openShare(); handleShareAction("copy"); } });
    idx.push({ title: "SHARE", sub: "paylaş", cat: "ACTION", cmd: "share", run: () => { openShare(); handleShareAction("share"); } });
    idx.push({ title: "QR CODE", sub: "qr kod", cat: "ACTION", cmd: "qr", run: () => { openShare(); handleShareAction("qr"); } });
    paletteIndex = idx;
  }
  const palette = $("#palette"), palInput = $("#palette-input"), palResults = $("#palette-results");
  let paletteReturn = null;
  function openPalette() {
    paletteReturn = document.activeElement;
    palette.classList.add("open"); palette.setAttribute("aria-hidden", "false");
    $("#search-toggle").setAttribute("aria-expanded", "true");
    palInput.value = ""; renderPalette("");
    setTimeout(() => palInput.focus(), 60);
  }
  function closePalette() {
    if (!palette.classList.contains("open")) return;
    palette.classList.remove("open"); palette.setAttribute("aria-hidden", "true"); palInput.blur();
    $("#search-toggle").setAttribute("aria-expanded", "false");
    if (paletteReturn && paletteReturn.focus) { paletteReturn.focus(); paletteReturn = null; }
  }
  function renderPalette(q) {
    q = q.trim().toLowerCase();
    if (q[0] === "/") q = q.slice(1);   // slash komut desteği: /projects, /termux ...
    palFiltered = !q ? paletteIndex : paletteIndex.filter((it) =>
      (it.title + " " + it.cat + " " + (it.sub || "") + " " + (it.cmd || "")).toLowerCase().includes(q));
    palSel = 0;
    palResults.innerHTML = palFiltered.length
      ? palFiltered.map((it, i) =>
        `<div class="pr-item ${i === 0 ? "sel" : ""}" data-i="${i}"><div class="pr-left"><div class="pr-title">${esc(it.title)}</div><div class="pr-sub">${esc(it.sub || "")}</div></div><span class="pr-cat">${esc(it.cat)}</span></div>`).join("")
      : `<div class="pr-empty"><div class="pr-empty-t">NO MATCH</div><div class="pr-empty-s">TRY ANOTHER QUERY</div></div>`;
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

  // DISCOVER: kısa "SCANNING DIGITAL SPACE → SPACE READY" geçişi (≤700ms), tekrar dokununca anında
  let discState = 0, discT1 = 0, discT2 = 0;
  function resetDisc() {
    const btn = $("#search-toggle"), label = btn.querySelector(".disc-label");
    if (label) label.textContent = "DISCOVER";
    btn.classList.remove("scanning"); discState = 0;
  }
  function discover() {
    const btn = $("#search-toggle"), label = btn.querySelector(".disc-label");
    if (discState === 1) { clearTimeout(discT1); clearTimeout(discT2); resetDisc(); openPalette(); return; }
    if (reduceMotion) { openPalette(); return; }
    discState = 1; btn.classList.add("scanning");
    const labelVisible = label && label.offsetParent !== null;
    if (labelVisible) label.textContent = "SCANNING"; else toast("SCANNING DIGITAL SPACE");
    discT1 = setTimeout(() => { if (labelVisible) label.textContent = "SPACE READY"; }, 400);
    discT2 = setTimeout(() => { resetDisc(); openPalette(); }, 660);
  }
  $("#search-toggle").addEventListener("click", discover);

  /* ===================== INTERACTIONS ================================= */
  function scrollToSection(sel) { const el = $(sel); if (el) el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }); }

  function setupReveal() {
    const sel = ".reveal, .hero-statement, .tool, .dna-node, .termux-cat, .project";
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

  // Işık yumuşak takip (lerp) + çok hafif grid parallax + masaüstü ince cursor
  let fxRAF = 0;
  function setupPointerFX() {
    const light = $("#light"), grid = $("#grid");
    if (reduceMotion) { light.style.display = "none"; return; }
    const fine = window.matchMedia("(pointer: fine)").matches;

    // Masaüstünde ince cursor halkası (native cursor gizlenmez)
    let ring = null;
    if (fine) {
      ring = document.createElement("div"); ring.id = "cursor-ring"; ring.setAttribute("aria-hidden", "true");
      document.body.appendChild(ring);
      document.addEventListener("mousedown", () => ring.classList.add("down"));
      document.addEventListener("mouseup", () => ring.classList.remove("down"));
    }

    let tx = window.innerWidth / 2, ty = window.innerHeight / 2;  // hedef
    let lx = tx, ly = ty;                                         // ışık (lerp)
    let rx = tx, ry = ty;                                         // ring (lerp, daha hızlı)
    let active = false;

    function onMove(x, y) { tx = x; ty = y; active = true; if (!fxRAF) loop(); }
    window.addEventListener("pointermove", (e) => onMove(e.clientX, e.clientY), { passive: true });
    window.addEventListener("touchmove", (e) => { const t = e.touches[0]; if (t) onMove(t.clientX, t.clientY); }, { passive: true });

    function loop() {
      lx += (tx - lx) * 0.12; ly += (ty - ly) * 0.12;
      light.style.transform = `translate3d(${lx.toFixed(1)}px, ${ly.toFixed(1)}px, 0)`;
      // Çok ince parallax: maksimum ~5px
      const gx = (lx / window.innerWidth - 0.5) * 5, gy = (ly / window.innerHeight - 0.5) * 5;
      grid.style.transform = `translate3d(${gx.toFixed(1)}px, ${gy.toFixed(1)}px, 0)`;
      if (ring) { rx += (tx - rx) * 0.28; ry += (ty - ry) * 0.28; ring.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`; }
      // Yerleştikçe döngüyü durdur (performans / cleanup)
      if (Math.abs(tx - lx) < 0.4 && Math.abs(ty - ly) < 0.4) { fxRAF = 0; return; }
      fxRAF = requestAnimationFrame(loop);
    }
    // Sekme gizliyken döngüyü durdur
    document.addEventListener("visibilitychange", () => { if (document.hidden && fxRAF) { cancelAnimationFrame(fxRAF); fxRAF = 0; } });

    // Proje preview parallax (yalnızca masaüstü, çok hafif)
    if (fine) {
      $$("#projects-list .project").forEach((el) => {
        const prev = el.querySelector(".p-preview");
        el.addEventListener("pointermove", (e) => {
          const r = el.getBoundingClientRect();
          const dx = (e.clientX - r.left - r.width / 2) / r.width;
          prev.style.transform = `translateY(-50%) translateX(${(dx * 14).toFixed(1)}px)`;
        });
        el.addEventListener("pointerleave", () => { prev.style.transform = "translateY(-50%)"; });
      });
    }
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
    // Kısa açılış: ARDA.OS görünsün, sonra hero kademeli girsin (kullanıcıyı bekletme)
    const timer = setTimeout(go, 340);
    const skip = () => { clearTimeout(timer); go(); b.removeEventListener("pointerdown", skip); };
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

    // (4) Final ekranına dokun
    const footEl = $("#fs-foot") || $("#foot");
    if (footEl) footEl.addEventListener("click", () => toast(eggs.footer || ""));

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
    renderProfile(); startClock(); setupSession(); renderSignal(); renderMusic(); renderDNA(); renderTermux(); renderProjects(); renderConnect();
    buildPaletteIndex();
    setupReveal(); setupTouchStates(); setupDots(); setupScrollBar(); setupPointerFX(); setupCoords(); setupAmbient();
    setupContact(); setupSecrets(); boot();
    // DNA çizgilerini yeniden çiz (yerleşim/resize)
    requestAnimationFrame(drawDNALines);
    let dnaT; window.addEventListener("resize", () => { clearTimeout(dnaT); dnaT = setTimeout(drawDNALines, 200); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
