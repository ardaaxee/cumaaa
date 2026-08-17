/* ===========================================================================
   ARDA.OS — frontend logic
   İçerik content/site.json'dan yüklenir (fetch), olmazsa window.SITE_DATA
   fallback'i kullanılır. Tüm metinler oradan yönetilir — burada hardcode yok.
   =========================================================================== */
(function () {
  "use strict";

  // Küçük yardımcılar
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let DATA = null;

  /* -----------------------------------------------------------------------
     1) İÇERİĞİ YÜKLE
     ----------------------------------------------------------------------- */
  async function loadData() {
    try {
      const res = await fetch("content/site.json", { cache: "no-store" });
      if (res.ok) return await res.json();
    } catch (e) { /* sunucu yok / file:// — fallback'e düş */ }
    return window.SITE_DATA || null;
  }

  /* -----------------------------------------------------------------------
     2) RENDER — bölümleri doldur
     ----------------------------------------------------------------------- */
  function renderProfile() {
    const p = DATA.profile || {};
    // Avatar (görsel varsa arka plan, yoksa baş harfler)
    const av = $("#avatar");
    if (p.avatarImage) av.style.backgroundImage = `url("${p.avatarImage}")`;
    else av.textContent = p.avatarInitials || (p.name || "A").slice(0, 2).toUpperCase();

    const name = p.name || "ARDA";
    const hn = $("#hero-name");
    hn.textContent = name; hn.setAttribute("data-t", name);
    $("#hero-label").textContent = p.label || "DIGITAL PROFILE / 2026";
    $("#brand-sub").textContent = p.label || "DIGITAL PROFILE / 2026";
    $("#foot-handle").textContent = p.handle || "";

    // Durum göstergesi
    const online = (p.status || "online").toLowerCase() === "online";
    $("#status-row").innerHTML =
      `<span class="status-dot" style="${online ? "" : "background:#c0863b;animation:none"}"></span>` +
      `<span>${esc((p.status || "online").toUpperCase())}</span>` +
      `<span class="status-note">· ${esc(p.statusNote || "")}</span>`;

    $("#bio").textContent = p.bio || "";

    // Metadata çipleri
    $("#meta-grid").innerHTML = (p.metadata || [])
      .map((m) => `<span class="meta-chip">${esc(m.k)}<b>${esc(m.v)}</b></span>`).join("");
  }

  function renderLinks() {
    const arrow = `<svg class="link-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>`;
    $("#links").innerHTML = (DATA.links || []).map((l) => {
      const attrs = l.href
        ? `href="${esc(l.href)}"${l.external ? ' target="_blank" rel="noopener"' : ""}`
        : `href="#" data-action="${esc(l.action || "")}"`;
      return `<a class="link magnetic" ${attrs} data-id="${esc(l.id)}">
        <span class="link-main">
          <span class="link-title">${esc(l.title)}</span>
          <span class="link-meta">${esc(l.meta || "")}</span>
        </span>${arrow}</a>`;
    }).join("");

    // Link aksiyonları (overlay / scroll)
    $$("#links .link").forEach((el) => {
      el.addEventListener("click", (e) => {
        const act = el.getAttribute("data-action");
        if (!act) return;                     // Harici href — bırak gitsin
        e.preventDefault();
        if (act === "termux") scrollToSection("#sec-termux");
        else if (act === "projects") scrollToSection("#sec-projects");
        else if (act === "spotify") scrollToSection("#sec-music");
        else if (act === "contact") scrollToSection("#sec-connect");
      });
    });
  }

  function renderMusic() {
    const s = DATA.spotify || {};
    const box = $("#now-playing");
    const eq = `<span class="np-eq"><i></i><i></i><i></i><i></i></span>`;
    if (s.url) {
      // Sadece kullanıcının girdiği bilgi gösterilir — sahte veri yok
      const track = s.track ? esc(s.track) : "Spotify";
      const artist = s.artist ? esc(s.artist) : "profili aç";
      box.innerHTML =
        `<div class="np-head">${eq} NOW PLAYING</div>
         <div class="np-body">
           <div class="np-cover">♪</div>
           <div class="np-info"><div class="np-track">${track}</div><div class="np-artist">${artist}</div></div>
         </div>
         <a class="np-open" href="${esc(s.url)}" target="_blank" rel="noopener">SPOTIFY'DA AÇ →</a>`;
    } else {
      box.innerHTML =
        `<div class="np-head">${eq} NOW PLAYING</div>
         <div class="np-empty">${esc(s.note || "Spotify bağlantısı henüz eklenmedi.")}</div>`;
    }
  }

  function renderProjects() {
    $("#projects-grid").innerHTML = (DATA.projects || []).map((pr, i) =>
      `<article class="project-block" data-i="${i}" style="transition-delay:${i * 60}ms">
        <div class="pb-top">
          <span class="pb-year">${esc(pr.year)}</span>
          <span class="pb-status" data-s="${esc((pr.status || "").toLowerCase())}">${esc((pr.status || "").toUpperCase())}</span>
        </div>
        <div class="pb-title">${esc(pr.title)}</div>
        <div class="pb-type">${esc(pr.type)}</div>
      </article>`).join("");

    $$("#projects-grid .project-block").forEach((el) => {
      el.addEventListener("click", () => openProject(DATA.projects[+el.dataset.i]));
    });
  }

  function renderTermux() {
    const t = DATA.termux || {};
    $("#termux-intro").textContent = t.intro || "";
    $("#termux-grid").innerHTML = (t.categories || []).map((c, i) =>
      `<button class="termux-cat" data-i="${i}" style="transition-delay:${i * 50}ms">
        <div><span class="tc-code">${esc(c.code)}</span><div class="tc-title">${esc(c.title)}</div></div>
        <div class="tc-desc">${esc(c.desc)}</div>
      </button>`).join("");

    $$("#termux-grid .termux-cat").forEach((el) => {
      el.addEventListener("click", () => openTermux(DATA.termux.categories[+el.dataset.i]));
    });
  }

  function renderLab() {
    const space = (DATA.links || []).find((l) => l.id === "space") || {};
    $("#lab-card").innerHTML =
      `<h3>DIGITAL SPACE</h3>
       <p>Deneyler, generatif görseller ve yarım kalmış fikirler. Sürekli değişen bir alan.</p>
       <a class="lab-link" href="${esc(space.href || "#")}" ${space.href ? 'target="_blank" rel="noopener"' : ""}>KEŞFET →</a>`;
  }

  function renderConnect() {
    const c = DATA.contact || {};
    $("#contact-intro").textContent = c.intro || "";
    $("#share-row").innerHTML =
      `<button class="share-btn" data-s="copy">KOPYALA</button>
       <button class="share-btn" data-s="share">PAYLAŞ</button>
       <button class="share-btn" data-s="qr">QR</button>`;
    $$("#share-row .share-btn").forEach((b) =>
      b.addEventListener("click", () => { openShare(); handleShareAction(b.dataset.s); }));
  }

  /* -----------------------------------------------------------------------
     3) OVERLAY — proje detayı & termux lab (fullscreen page transition)
     ----------------------------------------------------------------------- */
  const overlay = $("#overlay");
  const overlayInner = $("#overlay-inner");

  function showOverlay(html) {
    overlayInner.innerHTML = html;
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    overlay.scrollTop = 0;
    document.body.style.overflow = "hidden";
  }
  function closeOverlay() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  $("#overlay-close").addEventListener("click", closeOverlay);

  function openProject(pr) {
    if (!pr) return;
    const rows = [
      ["STATUS", (pr.status || "").toUpperCase()],
      ["YEAR", pr.year],
      ["TYPE", pr.type],
    ].map(([k, v]) => `<div class="detail-row"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`).join("");
    const tags = (pr.tech || []).map((t) => `<span class="tech-tag">${esc(t)}</span>`).join("");
    const link = pr.link
      ? `<a class="detail-link" href="${esc(pr.link)}" target="_blank" rel="noopener">PROJEYİ AÇ →</a>`
      : "";
    showOverlay(
      `<div class="detail-kicker">PROJECT / ${esc(pr.year)}</div>
       <h2 class="detail-title">${esc(pr.title)}</h2>
       <div class="detail-rows">${rows}</div>
       <div class="detail-desc">${esc(pr.description)}</div>
       ${tags ? `<div class="tech-tags">${tags}</div>` : ""}
       ${link}`);
  }

  function openTermux(cat) {
    if (!cat) return;
    const copyIcon = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"/></svg>`;
    const lessons = (cat.lessons || []).map((ls) =>
      `<div class="lesson">
        <div class="lesson-title">${esc(ls.title)}</div>
        <div class="lesson-desc">${esc(ls.desc)}</div>
        <div class="cmd-box">
          <code class="cmd-text">${esc(ls.cmd)}</code>
          <button class="copy-btn" data-cmd="${esc(ls.cmd)}" aria-label="Kopyala">${copyIcon}</button>
        </div>
        ${ls.example ? `<div class="lesson-example"><b>örnek:</b> ${esc(ls.example)}</div>` : ""}
      </div>`).join("");
    showOverlay(
      `<div class="lab-head">
         <div class="lab-code">${esc(cat.code)} / TERMUX LAB</div>
         <h2 class="lab-title">${esc(cat.title)}</h2>
         <div class="lab-sub">${esc(cat.desc)}</div>
       </div>${lessons}`);

    // COPY butonları
    $$("#overlay-inner .copy-btn").forEach((b) => {
      b.addEventListener("click", async () => {
        const ok = await copyText(b.getAttribute("data-cmd"));
        if (ok) { b.classList.add("copied"); setTimeout(() => b.classList.remove("copied"), 1200); }
      });
    });
  }

  /* -----------------------------------------------------------------------
     4) KOPYALAMA yardımcısı (clipboard + fallback)
     ----------------------------------------------------------------------- */
  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) { /* fallback'e düş */ }
    try {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (e) { return false; }
  }

  /* -----------------------------------------------------------------------
     5) PAYLAŞ (copy / share / QR)
     ----------------------------------------------------------------------- */
  const shareSheet = $("#share-sheet");
  const shareURL = () => window.location.href.split("#")[0];

  function openShare() {
    shareSheet.classList.add("open");
    shareSheet.setAttribute("aria-hidden", "false");
  }
  function closeShare() {
    shareSheet.classList.remove("open");
    shareSheet.setAttribute("aria-hidden", "true");
    $("#qr-wrap").hidden = true;
  }
  $("#share-toggle").addEventListener("click", openShare);
  shareSheet.addEventListener("click", (e) => { if (e.target === shareSheet) closeShare(); });

  async function handleShareAction(kind) {
    if (kind === "copy") {
      const ok = await copyText(shareURL());
      $("#copy-state").textContent = ok ? "kopyalandı" : "hata";
      toast(ok ? "Bağlantı kopyalandı" : "Kopyalanamadı");
      setTimeout(() => ($("#copy-state").textContent = ""), 1600);
    } else if (kind === "share") {
      if (navigator.share) {
        try { await navigator.share({ title: "ARDA", url: shareURL() }); } catch (e) {}
      } else {
        const ok = await copyText(shareURL());
        toast(ok ? "Paylaşım desteklenmiyor — bağlantı kopyalandı" : "Paylaşım desteklenmiyor");
      }
    } else if (kind === "qr") {
      buildQR();
    }
  }
  $("#btn-copy").addEventListener("click", () => handleShareAction("copy"));
  $("#btn-share").addEventListener("click", () => handleShareAction("share"));
  $("#btn-qr").addEventListener("click", () => handleShareAction("qr"));

  let qrBuilt = false;
  function buildQR() {
    const wrap = $("#qr-wrap");
    wrap.hidden = false;
    $("#qr-url").textContent = shareURL();
    if (qrBuilt) return;
    try {
      // eslint-disable-next-line no-undef
      new QRCode($("#qr-box"), {
        text: shareURL(), width: 176, height: 176,
        colorDark: "#000000", colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M,
      });
      qrBuilt = true;
    } catch (e) {
      $("#qr-box").textContent = "QR oluşturulamadı";
    }
  }

  /* -----------------------------------------------------------------------
     6) CONTACT FORMU — gerçek gönderim (Flask), yoksa mailto fallback
     ----------------------------------------------------------------------- */
  function setupContact() {
    const form = $("#contact-form");
    const statusEl = $("#form-status");
    const btn = $("#c-submit");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      statusEl.className = "form-status";
      statusEl.textContent = "";

      const payload = {
        name: $("#c-name").value.trim(),
        email: $("#c-email").value.trim(),
        message: $("#c-message").value.trim(),
        website: $("#hp-website").value.trim(),   // honeypot
      };

      // İstemci tarafı hızlı doğrulama
      let bad = false;
      [["c-name", payload.name.length > 0], ["c-email", /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)], ["c-message", payload.message.length >= 2]]
        .forEach(([id, ok]) => { $("#" + id).closest(".field").classList.toggle("invalid", !ok); if (!ok) bad = true; });
      if (bad) { statusEl.className = "form-status err"; statusEl.textContent = "Lütfen alanları kontrol et."; return; }

      btn.disabled = true; btn.textContent = "GÖNDERİLİYOR...";
      try {
        const res = await fetch("api/contact", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.ok) {
          statusEl.className = "form-status ok";
          statusEl.textContent = "Mesaj alındı. Teşekkürler.";
          form.reset();
        } else {
          throw new Error("server");
        }
      } catch (err) {
        // Backend yoksa (statik hosting) mailto fallback
        const c = DATA.contact || {};
        if (c.email) {
          const subject = encodeURIComponent("ARDA.OS — mesaj");
          const body = encodeURIComponent(`${payload.message}\n\n— ${payload.name} (${payload.email})`);
          window.location.href = `mailto:${c.email}?subject=${subject}&body=${body}`;
          statusEl.className = "form-status ok";
          statusEl.textContent = "E-posta uygulaması açılıyor...";
        } else {
          statusEl.className = "form-status err";
          statusEl.textContent = "Gönderilemedi. Daha sonra tekrar dene.";
        }
      } finally {
        btn.disabled = false; btn.textContent = "GÖNDER";
      }
    });
  }

  /* -----------------------------------------------------------------------
     7) ETKİLEŞİM — reveal, scroll progress, dots, magnetic, light
     ----------------------------------------------------------------------- */
  function scrollToSection(sel) {
    const el = $(sel); if (el) el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  function setupReveal() {
    if (reduceMotion) { $$(".reveal, .project-block, .termux-cat").forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    $$(".reveal, .project-block, .termux-cat").forEach((el, i) => {
      el.style.setProperty("--d", (i % 5) * 60 + "ms");
      io.observe(el);
    });
  }

  function setupDots() {
    const sections = $$(".section");
    const nav = $("#dots");
    nav.innerHTML = sections.map((s) =>
      `<button class="dot" data-t="#${s.id}"><span class="dot-label">${esc(s.dataset.index)} ${esc(s.dataset.name)}</span><span class="dot-mark"></span></button>`).join("");
    const dots = $$(".dot", nav);
    dots.forEach((d) => d.addEventListener("click", () => scrollToSection(d.dataset.t)));

    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          const i = sections.indexOf(en.target);
          dots.forEach((d, di) => d.classList.toggle("active", di === i));
        }
      });
    }, { threshold: 0.5 });
    sections.forEach((s) => io.observe(s));
  }

  function setupScrollBar() {
    const fill = $("#scrollbar-fill");
    let ticking = false;
    function update() {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? (window.scrollY / h) * 100 : 0;
      fill.style.width = Math.min(100, Math.max(0, p)) + "%";
      ticking = false;
    }
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  // Magnetic butonlar + ışık takibi (sadece pointer olan cihazlarda güçlü)
  function setupMagnetic() {
    const light = $("#light");
    if (!reduceMotion) {
      window.addEventListener("pointermove", (e) => {
        light.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }, { passive: true });
    } else { light.style.display = "none"; }

    if (isTouch) return;   // Dokunmatikte magnetic devre dışı (yanlış tetiklenmesin)
    $$(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const mx = (e.clientX - r.left - r.width / 2) * 0.18;
        const my = (e.clientY - r.top - r.height / 2) * 0.28;
        el.style.setProperty("--mx", mx.toFixed(1) + "px");
        el.style.setProperty("--my", my.toFixed(1) + "px");
        el.style.setProperty("--lx", (e.clientX - r.left) + "px");
        el.style.setProperty("--ly", (e.clientY - r.top) + "px");
      });
      el.addEventListener("pointerleave", () => {
        el.style.setProperty("--mx", "0px"); el.style.setProperty("--my", "0px");
      });
    });
  }

  // Dokunmatik için link parıltısı
  function setupTouchGlow() {
    $$(".magnetic").forEach((el) => {
      el.addEventListener("touchstart", () => el.classList.add("touch"), { passive: true });
      el.addEventListener("touchend", () => setTimeout(() => el.classList.remove("touch"), 250), { passive: true });
    });
  }

  /* -----------------------------------------------------------------------
     8) AMBIENT PARÇACIK ARKA PLANI (eski özellikten korundu, çok hafif)
     ----------------------------------------------------------------------- */
  function setupAmbient() {
    if (reduceMotion) return;
    const cv = $("#ambient"); const ctx = cv.getContext("2d");
    let W, H, DPR, pts = [], raf;
    const pointer = { x: -999, y: -999 };

    function count() {
      const n = Math.round((window.innerWidth * window.innerHeight) / 26000);
      return Math.max(18, Math.min(n, 60));
    }
    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * DPR; cv.height = H * DPR;
      cv.style.width = W + "px"; cv.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const want = count();
      pts.length = 0;
      for (let i = 0; i < want; i++) pts.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      });
    }
    const LINK = 120;
    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.fillStyle = "rgba(142,162,255,0.55)";
        ctx.fillRect(p.x, p.y, 1.4, 1.4);
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            ctx.globalAlpha = (1 - Math.sqrt(d2) / LINK) * 0.18;
            ctx.strokeStyle = "#8ea2ff"; ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    resize(); frame();
    window.addEventListener("resize", resize);
    // Sekme gizliyken durdur (performans)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else { raf = requestAnimationFrame(frame); }
    });
  }

  /* -----------------------------------------------------------------------
     9) TOAST + BOOT + GİZLİ DETAYLAR
     ----------------------------------------------------------------------- */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  function boot() {
    const b = $("#boot");
    if (reduceMotion) { b.classList.add("gone"); return; }
    setTimeout(() => b.classList.add("gone"), 900);
  }

  // Gizli detaylar (kullanıcıya açıkça söylenmez)
  function setupSecrets() {
    // (a) Avatara 5 kez dokun → gizli sistem mesajı + isim parıltısı
    let taps = 0, tapTimer;
    $("#avatar").addEventListener("click", () => {
      taps++; clearTimeout(tapTimer);
      tapTimer = setTimeout(() => (taps = 0), 900);
      if (taps >= 5) {
        taps = 0;
        $("#hero-name").classList.add("glitch");
        setTimeout(() => $("#hero-name").classList.remove("glitch"), 1300);
        toast("system :: access granted");
      }
    });

    // (b) Klavyede "?" → küçük ipucu
    // (c) "arda" yaz → isimde parıltı + mesaj
    let buf = "";
    window.addEventListener("keydown", (e) => {
      if (e.key === "?") { toast("try: type 'arda' · tap avatar ×5"); return; }
      buf = (buf + (e.key.length === 1 ? e.key.toLowerCase() : "")).slice(-8);
      if (buf.endsWith("arda")) {
        $("#hero-name").classList.add("glitch");
        setTimeout(() => $("#hero-name").classList.remove("glitch"), 1300);
        toast("welcome back, arda");
      }
      if (buf.endsWith("boot")) toast("ARDA.OS // uptime: " + Math.round(performance.now() / 1000) + "s");
      if (e.key === "Escape") { closeOverlay(); closeShare(); }
    });

    // (d) Konsol imzası
    try {
      console.log("%cARDA.OS", "font:700 22px monospace;color:#8ea2ff");
      console.log("%c// you found the console. curious ones are welcome.", "color:#74788c;font-family:monospace");
    } catch (e) {}
  }

  /* -----------------------------------------------------------------------
     10) BAŞLAT
     ----------------------------------------------------------------------- */
  async function init() {
    DATA = await loadData();
    if (!DATA) { $("#boot").innerHTML = '<div class="boot-line">içerik yüklenemedi</div>'; return; }

    renderProfile();
    renderLinks();
    renderMusic();
    renderProjects();
    renderTermux();
    renderLab();
    renderConnect();

    setupReveal();
    setupDots();
    setupScrollBar();
    setupMagnetic();
    setupTouchGlow();
    setupContact();
    setupAmbient();
    setupSecrets();
    boot();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
