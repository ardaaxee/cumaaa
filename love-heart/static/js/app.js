/* =========================================================
   Sevgiliye özel tek kalpli site
   - Arka planda hafif parçacıklar (tek canvas, düşük maliyet)
   - Kalbe dokununca güçlü kalp atışı + yukarı süzülen küçük kalpler
   Harici kütüphane yok.
   ========================================================= */

(function () {
  "use strict";

  var heartEl = document.getElementById("heart");
  var hintEl = document.getElementById("hint");
  var canvas = document.getElementById("fx");

  if (!heartEl) return; // Sayfa beklenmedik şekilde eksikse sessizce çık.

  var reduceMotion = false;
  try {
    reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {
    reduceMotion = false;
  }

  /* -------------------------------------------------------
     Kalbe dokunma: güçlü atış animasyonu
     ------------------------------------------------------- */

  var lastHit = 0;

  function pulseHeart() {
    heartEl.classList.remove("is-hit");
    // Reflow: animasyonun baştan çalışmasını sağlar.
    void heartEl.offsetWidth;
    heartEl.classList.add("is-hit");
  }

  heartEl.addEventListener("animationend", function (ev) {
    if (ev.animationName === "bigbeat") {
      heartEl.classList.remove("is-hit");
    }
  });

  function onHit() {
    var now = Date.now();
    if (now - lastHit < 120) return; // Çift tetiklemeyi engelle
    lastHit = now;

    if (!reduceMotion) pulseHeart();

    if (hintEl && !hintEl.classList.contains("is-hidden")) {
      hintEl.classList.add("is-hidden");
    }

    burst();
  }

  // Dokunmatikte anında tepki için pointerdown, klavye için click.
  if (window.PointerEvent) {
    heartEl.addEventListener("pointerdown", onHit);
    heartEl.addEventListener("click", function (ev) {
      if (ev.detail === 0) onHit(); // Enter / Space ile geldiyse
    });
  } else {
    heartEl.addEventListener("touchstart", onHit, { passive: true });
    heartEl.addEventListener("click", onHit);
  }

  /* -------------------------------------------------------
     Canvas motoru
     ------------------------------------------------------- */

  var ctx = null;
  try {
    ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
  } catch (e) {
    ctx = null;
  }

  // Canvas desteklenmiyorsa site yine de çalışsın (kalp + yazı yeterli).
  if (!ctx) return;

  var W = 0;
  var H = 0;
  var dpr = 1;
  var isSmall = false;
  var dust = [];
  var hearts = [];
  var MAX_HEARTS = 110;
  var pointerX = 0;
  var pointerY = 0;
  var targetPX = 0;
  var targetPY = 0;
  var running = false;
  var rafId = 0;
  var lastTime = 0;

  var accent = readVar("--heart-1", "#ff3d73");
  var accentSoft = readVar("--heart-2", "#ff9dbb");
  var accentRGB = hexToRgb(accent) || { r: 255, g: 61, b: 115 };
  var accentSoftRGB = hexToRgb(accentSoft) || { r: 255, g: 157, b: 187 };

  function readVar(name, fallback) {
    try {
      var v = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
      return v || fallback;
    } catch (e) {
      return fallback;
    }
  }

  function hexToRgb(hex) {
    if (typeof hex !== "string") return null;
    var m = hex.trim().replace("#", "");
    if (m.length === 3) {
      m = m[0] + m[0] + m[1] + m[1] + m[2] + m[2];
    }
    if (!/^[0-9a-fA-F]{6}$/.test(m)) return null;
    return {
      r: parseInt(m.slice(0, 2), 16),
      g: parseInt(m.slice(2, 4), 16),
      b: parseInt(m.slice(4, 6), 16)
    };
  }

  // Küçük kalp şeklini bir kez oluştur (merkezi 0,0 — genişliği ~1 birim).
  var heartPath = null;
  if (typeof Path2D !== "undefined") {
    heartPath = new Path2D();
    heartPath.moveTo(0, 0.32);
    heartPath.bezierCurveTo(-0.62, -0.06, -0.5, -0.52, -0.24, -0.52);
    heartPath.bezierCurveTo(-0.09, -0.52, -0.02, -0.4, 0, -0.31);
    heartPath.bezierCurveTo(0.02, -0.4, 0.09, -0.52, 0.24, -0.52);
    heartPath.bezierCurveTo(0.5, -0.52, 0.62, -0.06, 0, 0.32);
    heartPath.closePath();
  }

  function resize() {
    var w = window.innerWidth || document.documentElement.clientWidth || 360;
    var h = window.innerHeight || document.documentElement.clientHeight || 640;

    W = w;
    H = h;
    isSmall = Math.min(w, h) < 620;

    // Düşük cihazlarda gereksiz piksel işlemesin diye DPR sınırlı.
    dpr = Math.min(window.devicePixelRatio || 1, isSmall ? 2 : 1.75);

    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    buildDust();
  }

  function buildDust() {
    // Mobilde belirgin şekilde daha az parçacık.
    var target = Math.round((W * H) / (isSmall ? 30000 : 24000));
    target = Math.max(10, Math.min(target, isSmall ? 20 : 40));

    if (dust.length > target) {
      dust.length = target;
      return;
    }
    while (dust.length < target) {
      dust.push(newDust(true));
    }
  }

  function newDust(anywhere) {
    return {
      x: Math.random() * W,
      y: anywhere ? Math.random() * H : H + 10,
      r: 0.7 + Math.random() * 1.8,
      speed: 6 + Math.random() * 16, // px / saniye
      drift: (Math.random() - 0.5) * 8,
      phase: Math.random() * Math.PI * 2,
      twinkle: 0.5 + Math.random() * 1.2,
      depth: 0.25 + Math.random() * 0.75,
      alpha: 0.18 + Math.random() * 0.42
    };
  }

  function spawnHeart(cx, cy, angle, power) {
    if (hearts.length >= MAX_HEARTS) return;
    var speed = (46 + Math.random() * 78) * power;
    hearts.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed * 0.85,
      vy: Math.sin(angle) * speed * 0.62 - (26 + Math.random() * 34),
      size: (isSmall ? 12 : 15) + Math.random() * (isSmall ? 16 : 22),
      rot: (Math.random() - 0.5) * 0.9,
      vrot: (Math.random() - 0.5) * 1.7,
      life: 0,
      ttl: 1.5 + Math.random() * 1.2,
      wobble: Math.random() * Math.PI * 2,
      soft: Math.random() < 0.45
    });
  }

  function burst() {
    var rect = heartEl.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    // Kalpler buyuk kalbin kenarindan cikiyormus gibi gorunsun.
    var radius = rect.width * 0.46;

    var count = isSmall ? 14 : 22;
    if (reduceMotion) count = 6;

    for (var i = 0; i < count; i++) {
      var angle = (Math.PI * 2 * i) / count + Math.random() * 0.45;
      var r = radius * (0.82 + Math.random() * 0.5);
      spawnHeart(
        cx + Math.cos(angle) * r,
        cy + Math.sin(angle) * r * 0.9,
        angle,
        reduceMotion ? 0.5 : 1
      );
    }
    start();
  }

  function step(time) {
    rafId = 0;
    if (!lastTime) lastTime = time;
    // Sekme arka plandayken oluşan büyük sıçramaları sınırla.
    var dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;

    // Pointer etkisini yumuşat.
    pointerX += (targetPX - pointerX) * Math.min(1, dt * 3);
    pointerY += (targetPY - pointerY) * Math.min(1, dt * 3);

    ctx.clearRect(0, 0, W, H);

    // --- Arka plan parçacıkları ---
    var dustDt = reduceMotion ? 0 : dt; // hareket azaltmada parçacıklar sabit
    var i, p;
    for (i = 0; i < dust.length; i++) {
      p = dust[i];
      p.y -= p.speed * dustDt;
      p.phase += dustDt * p.twinkle;
      p.x += Math.sin(p.phase) * p.drift * dustDt;

      if (p.y < -12) {
        dust[i] = newDust(false);
        continue;
      }
      if (p.x < -12) p.x = W + 10;
      if (p.x > W + 12) p.x = -10;

      var a = p.alpha * (0.62 + 0.38 * Math.sin(p.phase * 1.7));
      var px = p.x + pointerX * p.depth * 14;
      var py = p.y + pointerY * p.depth * 10;

      ctx.beginPath();
      ctx.fillStyle =
        "rgba(" +
        accentSoftRGB.r +
        "," +
        accentSoftRGB.g +
        "," +
        accentSoftRGB.b +
        "," +
        a.toFixed(3) +
        ")";
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Yayılan küçük kalpler ---
    for (i = hearts.length - 1; i >= 0; i--) {
      var h = hearts[i];
      h.life += dt;
      if (h.life >= h.ttl) {
        hearts.splice(i, 1);
        continue;
      }

      var t = h.life / h.ttl;
      h.wobble += dt * 2.4;
      h.vy -= 26 * dt; // yukarı doğru süzülme
      h.vx *= 1 - Math.min(1, dt * 1.5);
      h.x += (h.vx + Math.sin(h.wobble) * 14) * dt;
      h.y += h.vy * dt;
      h.rot += h.vrot * dt;

      // Doğuşta hızlı büyüsün, sonda yavaşça sönsün.
      var grow = t < 0.14 ? t / 0.14 : 1;
      var fade = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
      var alpha = Math.max(0, Math.min(1, fade)) * 0.92;
      var c = h.soft ? accentSoftRGB : accentRGB;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(h.x, h.y);
      ctx.rotate(h.rot);
      ctx.scale(h.size * grow, h.size * grow);
      ctx.fillStyle = "rgb(" + c.r + "," + c.g + "," + c.b + ")";
      if (heartPath) {
        ctx.fill(heartPath);
      } else {
        // Path2D yoksa basit daire ile devam et.
        ctx.beginPath();
        ctx.arc(0, 0, 0.32, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Hareket azaltma tercihinde döngü sürekli çalışmasın:
    // yalnızca yayılan kalpler varken canlan, bitince dur.
    if (reduceMotion && hearts.length === 0) {
      running = false;
      return;
    }

    if (running) {
      rafId = window.requestAnimationFrame(step);
    }
  }

  function start() {
    if (running) return;
    running = true;
    lastTime = 0;
    rafId = window.requestAnimationFrame(step);
  }

  function stop() {
    running = false;
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  /* -------------------------------------------------------
     Olaylar
     ------------------------------------------------------- */

  var resizeTimer = 0;
  window.addEventListener(
    "resize",
    function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 180);
    },
    { passive: true }
  );

  window.addEventListener(
    "orientationchange",
    function () {
      window.setTimeout(resize, 260);
    },
    { passive: true }
  );

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stop();
    } else if (!reduceMotion || hearts.length) {
      start();
    }
  });

  if (!reduceMotion) {
    window.addEventListener(
      "pointermove",
      function (ev) {
        targetPX = (ev.clientX / W) * 2 - 1;
        targetPY = (ev.clientY / H) * 2 - 1;
      },
      { passive: true }
    );
  }

  /* -------------------------------------------------------
     Başlat
     ------------------------------------------------------- */

  resize();

  if (reduceMotion) {
    // Hareket azaltma tercihi: parçacıklar sabit dursun, tek kare çiz.
    running = false;
    lastTime = 0;
    step(0);
  } else {
    start();
  }

  // İlk dokunuş olmasa da ipucu bir süre sonra sakinleşsin.
  if (hintEl) {
    window.setTimeout(function () {
      if (!hintEl.classList.contains("is-hidden")) {
        hintEl.style.opacity = "0.45";
      }
    }, 14000);
  }
})();
