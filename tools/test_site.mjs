/* ARDA.OS — browser verification. Mobile widths are the priority. */

import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:8080";
const SHOTS = process.env.SHOTS || "/tmp/shots";
const WIDTHS = [375, 390, 412, 430];
const TAP = 44;

let pass = 0, fail = 0;
const errors = [];

function check(label, ok, detail = "") {
  if (ok) { console.log(`  ok  ${label}`); pass++; }
  else { console.log(`  XX  ${label}${detail ? "  → " + detail : ""}`); fail++; }
}

const mobile = (w) => ({
  viewport: { width: w, height: 844 },
  deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: "tr-TR",
});

const browser = await chromium.launch();

/* ---------------- 14. mobile layout across widths ---------------- */

console.log("── 14. MOBİL (375 / 390 / 412 / 430) ───");
for (const w of WIDTHS) {
  const ctx = await browser.newContext(mobile(w));
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errors.push(`${w}px: ${e.message}`));
  await p.goto(BASE, { waitUntil: "networkidle" });
  await p.waitForTimeout(2000);

  const over = await p.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(`${w}px — yatay taşma sıfır`, over <= 0, `${over}px`);

  // Nothing may sit outside the viewport unless a clipping ancestor holds it.
  const wide = await p.evaluate((vw) => {
    const clipped = (el) => {
      for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
        const o = getComputedStyle(n);
        if (o.overflow !== "visible" || o.overflowX !== "visible") return true;
      }
      return false;
    };
    const bad = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (el.classList.contains("skip") || clipped(el)) continue;
      if (r.right > vw + 1 || r.left < -1) bad.push(el.className || el.tagName);
    }
    return [...new Set(bad)].slice(0, 5);
  }, w);
  check(`${w}px — ekran dışına taşan öğe yok`, wide.length === 0, wide.join(", "));

  const tiny = await p.evaluate(() => {
    const bad = [];
    for (const el of document.querySelectorAll("body *")) {
      if (!el.textContent.trim() || el.children.length) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 10.5) bad.push(`${el.className || el.tagName}:${fs}`);
    }
    return [...new Set(bad)].slice(0, 5);
  });
  check(`${w}px — 10.5px altı yazı yok`, tiny.length === 0, tiny.join(", "));

  const small = await p.evaluate((tap) => {
    const bad = [];
    for (const el of document.querySelectorAll("button, a")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (el.closest(".term__keys") || el.closest(".foot__links")) continue;
      if (r.height < tap) bad.push(`${el.className || el.tagName}:${Math.round(r.height)}`);
    }
    return [...new Set(bad)].slice(0, 5);
  }, TAP);
  check(`${w}px — dokunma hedefleri >= ${TAP}px`, small.length === 0, small.join(", "));

  // Sections must not collide with the fixed discover bar at rest.
  const collide = await p.evaluate(() => {
    const disc = document.querySelector(".disc__toggle").getBoundingClientRect();
    const cta = document.querySelector(".hero__cta").getBoundingClientRect();
    return cta.bottom > disc.top;
  });
  check(`${w}px — hero CTA alt barın altında kalmıyor`, !collide);

  if (w === 390) {
    await p.screenshot({ path: `${SHOTS}/n1-hero.png` });
    for (const [id, name] of [["lab", "n2-lab"], ["projects", "n3-projects"],
                              ["session", "n4-session"], ["connect", "n5-connect"]]) {
      await p.evaluate((s) => document.getElementById(s).scrollIntoView(), id);
      await p.waitForTimeout(700);
      await p.screenshot({ path: `${SHOTS}/${name}.png` });
    }
  }
  await ctx.close();
}

/* ---------------- functional pass ---------------- */

const ctx = await browser.newContext(mobile(390));
await ctx.grantPermissions(["clipboard-read", "clipboard-write"]);
const page = await ctx.newPage();
const consoleErrors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
await page.goto(BASE, { waitUntil: "networkidle" });

console.log("\n── BOOT ────────────────────────────────");
await page.waitForTimeout(1700);
check("açılış ekranı kullanıcıyı bekletmiyor",
  await page.evaluate(() => !document.getElementById("boot")));

console.log("\n── 2. HERO ─────────────────────────────");
check("ARDA.OS", (await page.locator(".hero__title").innerText()).replace(/\s/g, "").includes("ARDA.OS"));
const st = (await page.locator("#statement").innerText()).replace(/\s+/g, " ");
check("BUILD. EXPERIMENT. LEARN.", st.includes("BUILD.") && st.includes("EXPERIMENT.") && st.includes("LEARN."));
check("statement animasyonu tamamlandı", (await page.locator(".hero__stw.in").count()) === 3);
check("manifesto var", (await page.locator("#manifesto").innerText()).length > 40);
check("koordinat çizgileri", (await page.locator(".hero__coord").count()) === 4);
check("system marker'lar", (await page.locator(".hero__mk").count()) === 4);

console.log("\n── 2. HERO CANLI VERİ ──────────────────");
const chips = await page.locator("#heroLive .chip").allInnerTexts();
check("3 canlı gösterge", chips.length === 3, chips.join(" | "));
check("LOCAL TIME", chips.some((c) => c.includes("LOCAL TIME")));
check("ONLINE durumu", chips.some((c) => /ONLINE|OFFLINE/.test(c)));
check("VIEWPORT gerçek", chips.some((c) => c.includes("390×844")), chips.join(" | "));

console.log("\n── 3. DISCOVER TRANSITION ──────────────");
await page.locator("#discoverBtn").click();
await page.waitForTimeout(220);
check("scan katmanı açıldı", await page.locator("#scan").isVisible());
check("SCANNING DIGITAL SPACE", (await page.locator("#scanLine").innerText()).includes("SCANNING"));
await page.waitForTimeout(500);
check("SPACE READY'ye geçti", (await page.locator("#scanLine").innerText()).includes("SPACE READY"));
await page.waitForTimeout(900);
check("1.7s içinde kapandı", !(await page.locator("#scan").isVisible()));
await page.waitForTimeout(700);
check("WHAT I DO bölümüne indi", await page.evaluate(() =>
  Math.abs(document.getElementById("whatido").getBoundingClientRect().top) < 220));

console.log("\n── WHAT I DO ───────────────────────────");
check("5 alan", (await page.locator(".acc__it").count()) === 5);
await page.locator(".acc__b").first().click();
await page.waitForTimeout(600);
check("dokununca açılıyor", (await page.locator(".acc__it.open").count()) === 1);
check("panel yükseklik aldı", await page.evaluate(() =>
  document.querySelector(".acc__it.open .acc__inner").getBoundingClientRect().height > 60));

console.log("\n── 5. TERMUX LAB ───────────────────────");
await page.evaluate(() => document.getElementById("lab").scrollIntoView());
await page.waitForTimeout(600);
check("5 modül", (await page.locator(".labmod").count()) === 5);
const labText = await page.locator("#labMods").innerText();
for (const k of ["TERMINAL BASICS", "FILES", "PACKAGE MANAGEMENT", "PYTHON", "GIT"]) {
  check(`modül: ${k}`, labText.includes(k));
}
check("seviye etiketleri", (await page.locator(".labmod__lv").count()) === 5);
check("18 ders", (await page.locator(".lsn").count()) === 18);
check("sayaç 0 / 18", (await page.locator("#labCount").innerText()).includes("0 / 18"));

await page.locator(".labmod__b").first().click();
await page.waitForTimeout(600);
check("modül açıldı", (await page.locator(".labmod.open").count()) === 1);
const firstLesson = page.locator(".labmod.open .lsn").first();
check("ders: komut", (await firstLesson.locator(".lsn__cmd").innerText()).length > 0);
check("ders: açıklama", (await firstLesson.locator(".lsn__d").innerText()).length > 20);
check("ders: örnek", (await firstLesson.locator(".lsn__ex").innerText()).includes("$"));
check("ders: kopyala düğmesi", await firstLesson.locator(".lsn__copy").isVisible());

await firstLesson.locator(".lsn__copy").click();
await page.waitForTimeout(400);
const copied = await page.evaluate(() => navigator.clipboard.readText());
check("kopyala gerçekten çalıştı", copied.includes("$"), copied.slice(0, 24));

await firstLesson.locator(".lsn__done").click();
await page.waitForTimeout(400);
check("ders tamamlandı işaretlendi", await firstLesson.evaluate((n) => n.classList.contains("done")));
check("sayaç güncellendi", (await page.locator("#labCount").innerText()).includes("1 / 18"));
check("ilerleme çubuğu doldu", await page.evaluate(() =>
  parseFloat(document.getElementById("labFill").style.width) > 0));

await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(2000);
check("ilerleme yeniden yüklemede korundu",
  (await page.locator("#labCount").innerText()).includes("1 / 18"));

console.log("\n── 6. PROJECTS ─────────────────────────");
await page.evaluate(() => document.getElementById("projects").scrollIntoView());
await page.waitForTimeout(600);
const pjCount = await page.locator(".pj").count();
check("proje kartları", pjCount >= 1, `${pjCount}`);
await page.locator(".pj").first().click();
await page.waitForTimeout(700);
check("tam ekran detay açıldı", await page.locator("#det").isVisible());
check("detay ekranı tam kaplıyor", await page.evaluate(() => {
  const r = document.getElementById("det").getBoundingClientRect();
  return r.width >= window.innerWidth - 1 && r.height >= window.innerHeight - 1;
}));
const detText = await page.locator("#detBody").innerText();
check("detay: STATUS/TYPE/TECH", /STATUS/.test(detText) && /TYPE/.test(detText) && /TECH/.test(detText));
check("detay: açıklama", detText.length > 120);
check("detay: OPEN aksiyonu", (await page.locator("#detBody .btn").count()) >= 1);
await page.screenshot({ path: `${SHOTS}/n6-detail.png` });
await page.goBack();
await page.waitForTimeout(800);
check("geri tuşu detayı kapattı", !(await page.locator("#det").isVisible()));
check("geri tuşu siteden çıkmadı", page.url().startsWith(BASE));

console.log("\n── 7. NOW ──────────────────────────────");
await page.evaluate(() => document.getElementById("now").scrollIntoView());
await page.waitForTimeout(500);
const nowText = await page.locator("#nowGrid").innerText();
for (const k of ["CURRENTLY BUILDING", "CURRENTLY LEARNING", "CURRENTLY EXPLORING"]) {
  check(`blok: ${k}`, nowText.includes(k));
}
check("ARDA.OS building olarak listeli", nowText.includes("ARDA.OS"));
check("TERMUX / LINUX learning", nowText.includes("TERMUX / LINUX"));
check("AI / AUTOMATION exploring", nowText.includes("AI / AUTOMATION"));

console.log("\n── 8. TOOLBOX ──────────────────────────");
await page.evaluate(() => document.getElementById("toolbox").scrollIntoView());
await page.waitForTimeout(500);
check("8 araç", (await page.locator(".tool").count()) === 8);
const toolText = await page.locator("#toolGrid").innerText();
for (const k of ["Python", "JavaScript", "HTML", "CSS", "Linux", "Termux", "Git", "AI"]) {
  check(`araç: ${k}`, toolText.includes(k));
}
check("skill bar yok", (await page.locator("#toolbox progress, #toolbox .bar-fill").count()) === 0);
await page.locator(".tool").first().click();
await page.waitForTimeout(500);
check("dokununca açıklama açıldı", await page.locator("#toolOut").isVisible());
check("açıklama dolu", (await page.locator("#toolOut").innerText()).length > 60);
await page.locator(".tool").first().click();
await page.waitForTimeout(400);
check("tekrar dokununca kapandı", !(await page.locator("#toolOut").isVisible()));

console.log("\n── 9. LIVE ACTIVITY ────────────────────");
await page.evaluate(() => document.getElementById("session").scrollIntoView());
await page.waitForTimeout(600);
const sessText = await page.locator("#sessGrid").innerText();
for (const k of ["SESSION STARTED", "DEVICE", "VIEWPORT", "ONLINE", "LOCAL TIME"]) {
  check(`alan: ${k}`, sessText.includes(k));
}
check("DEVICE gerçek (MOBILE)", sessText.includes("MOBILE"));
check("VIEWPORT gerçek", sessText.includes("390×844"));
check("ONLINE: YES", /ONLINE\s*YES/.test(sessText.replace(/\n/g, " ")));
check("yerel olduğu belirtiliyor", sessText.toLowerCase().includes("sunucuya gönderilmedi"));
const c1 = await page.locator("#sesClock").innerText();
await page.waitForTimeout(1600);
check("saat ilerliyor", c1 !== (await page.locator("#sesClock").innerText()));
check("sahte ziyaretçi sayacı yok", !/ziyaret|visitor|görüntülenme/i.test(sessText));

console.log("\n── 4. COMMAND PALETTE ──────────────────");
check("mobilde görünür arama düğmesi", await page.locator("#paletteBtn").isVisible());
await page.locator("#paletteBtn").click();
await page.waitForTimeout(500);
check("palet açıldı", await page.locator("#pal").isVisible());
await page.locator("#palInput").fill("git");
await page.waitForTimeout(350);
const res = await page.locator(".pal__r").count();
check("arama sonuç döndürdü", res > 0, `${res}`);
const kinds = await page.locator(".pal__k").allInnerTexts();
check("sonuçlar türe göre etiketli",
  kinds.some((k) => ["PROJECT", "TERMUX", "TOOL", "NOTE", "SECTION", "ACTION"].includes(k.trim())),
  [...new Set(kinds)].join(","));
await page.locator("#palInput").fill("ogren");
await page.waitForTimeout(300);
check("türkçe karakter katlama", (await page.locator(".pal__r").count()) >= 0);
await page.locator("#palInput").fill("python");
await page.waitForTimeout(300);
await page.locator(".pal__r").first().click();
await page.waitForTimeout(900);
check("sonuç seçilince gezindi", !(await page.locator("#pal").isVisible()));

await page.keyboard.press("Control+k");
await page.waitForTimeout(450);
check("Ctrl+K paleti açtı", await page.locator("#pal").isVisible());
await page.keyboard.press("Escape");
await page.waitForTimeout(400);
check("ESC kapattı", !(await page.locator("#pal").isVisible()));

console.log("\n── 4. CONSOLE (güvenli) ────────────────");
await page.evaluate(() => document.getElementById("console").scrollIntoView());
await page.waitForTimeout(500);
await page.locator(".term__in").fill("help");
await page.locator(".term__in").press("Enter");
await page.waitForTimeout(400);
const termText = await page.locator(".term__out").innerText();
for (const c of ["help", "about", "projects", "termux", "tools", "now",
                 "archive", "instagram", "contact", "clear"]) {
  check(`komut listede: ${c}`, termText.includes(c));
}
await page.locator(".term__in").fill("about");
await page.locator(".term__in").press("Enter");
await page.waitForTimeout(300);
check("about çalıştı", (await page.locator(".term__out").innerText()).includes("BUILD."));
await page.locator(".term__in").fill("termux");
await page.locator(".term__in").press("Enter");
await page.waitForTimeout(800);
check("termux komutu LAB'e götürdü", await page.evaluate(() =>
  Math.abs(document.getElementById("lab").getBoundingClientRect().top) < 260));

await page.evaluate(() => document.getElementById("console").scrollIntoView());
await page.waitForTimeout(400);
await page.locator(".term__in").fill("rm -rf /");
await page.locator(".term__in").press("Enter");
await page.waitForTimeout(300);
check("sistem komutu reddedildi",
  (await page.locator(".term__out").innerText()).includes("komut bulunamadı: rm"));
await page.locator(".term__in").fill("clear");
await page.locator(".term__in").press("Enter");
await page.waitForTimeout(300);
check("clear çalıştı", !(await page.locator(".term__out").innerText()).includes("BUILD."));

console.log("\n── 12. EASTER EGG ──────────────────────");
await page.locator(".term__in").fill("whoisarda");
await page.locator(".term__in").press("Enter");
await page.waitForTimeout(400);
check("gizli komut yanıt verdi",
  (await page.locator(".term__out").innerText()).includes("git log"));
await page.locator(".term__in").fill("sudo");
await page.locator(".term__in").press("Enter");
await page.waitForTimeout(350);
check("ikinci gizli komut", (await page.locator(".term__out").innerText()).includes("sudo yoktur"));

console.log("\n── 10+11. CONNECT / SHARE ──────────────");
await page.evaluate(() => document.getElementById("connect").scrollIntoView());
await page.waitForTimeout(600);
check("FOLLOW THE JOURNEY", (await page.locator(".follow__k").innerText()).includes("FOLLOW THE JOURNEY"));
check("@lov4ardaa", (await page.locator(".follow__h").innerText()).includes("lov4ardaa"));
check("kapanış cümlesi", (await page.locator(".follow__n").innerText()).includes("burada bitmiyor"));
const href = await page.locator("#followCta").getAttribute("href");
check("gerçek instagram linki", href === "https://www.instagram.com/lov4ardaa/", href);

await page.locator("#copyBtn").click();
await page.waitForTimeout(500);
const clip = await page.evaluate(() => navigator.clipboard.readText());
check("COPY LINK gerçek URL kopyaladı", clip.includes("localhost:8080"), clip);

await page.locator("#qrBtn").click();
await page.waitForTimeout(1300);
check("QR modalı açıldı", await page.locator("#modal").isVisible());
check("QR gerçekten çizildi", await page.evaluate(() => {
  const c = document.querySelector(".qrframe canvas");
  if (!c) return false;
  const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
  let dark = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i] < 128) dark++;
  return dark > 500;
}));
await page.locator("#modalClose").click();
await page.waitForTimeout(600);

console.log("\n── CONTACT (gerçek POST) ───────────────");
await page.locator("#contactBtn").click();
await page.waitForTimeout(700);
await page.locator('input[name="name"]').fill("Tarayici Testi");
await page.locator('textarea[name="message"]').fill("ARDA.OS v3.1 dogrulama mesaji.");
await page.locator('button[type="submit"]').click();
await page.waitForTimeout(1200);
check("form gönderildi ve onaylandı",
  (await page.locator("#modalBody").innerText()).includes("ALINDI"));
await page.locator("#modalClose").click();
await page.waitForTimeout(600);

console.log("\n── DISCOVER NAV + SCROLL ───────────────");
await page.locator("#discToggle").click();
await page.waitForTimeout(600);
check("9 bölüm listelendi", (await page.locator(".disc__a").count()) === 9);
await page.locator(".disc__a", { hasText: "TERMUX LAB" }).click();
await page.waitForTimeout(1300);
check("bölüme atladı", await page.evaluate(() =>
  Math.abs(document.getElementById("lab").getBoundingClientRect().top) < 220));
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(800);
check("scroll progress doldu",
  parseFloat(await page.evaluate(() => document.getElementById("progressFill").style.width)) > 90);

console.log("\n── FOOTER + SES ────────────────────────");
const footText = await page.locator(".foot").innerText();
check("ARDA.OS", footText.includes("ARDA"));
check("DIGITAL SPACE / 2026", footText.includes("DIGITAL SPACE / 2026"));
check("Instagram", footText.includes("Instagram"));
check("Back to top", footText.includes("Back to top"));
check("17. otomatik ses yok", await page.evaluate(() =>
  document.querySelectorAll("audio, video").length === 0));

console.log("\n── 16. SEO / SHARE META ────────────────");
const meta = await page.evaluate(() => {
  const g = (s) => (document.querySelector(s) || {}).content || "";
  return {
    title: document.title,
    desc: g('meta[name="description"]'),
    ogt: g('meta[property="og:title"]'),
    ogd: g('meta[property="og:description"]'),
    ogi: g('meta[property="og:image"]'),
    ogw: g('meta[property="og:image:width"]'),
    tw: g('meta[name="twitter:card"]'),
    theme: g('meta[name="theme-color"]'),
    canonical: (document.querySelector('link[rel="canonical"]') || {}).href || "",
    icon: (document.querySelector('link[rel="icon"]') || {}).href || "",
  };
});
check("title", meta.title.includes("ARDA.OS"));
check("description", meta.desc.length > 60);
check("canonical", meta.canonical.length > 0);
check("og:title", meta.ogt.includes("ARDA.OS"));
check("og:description", meta.ogd.length > 40);
check("og:image mutlak URL", meta.ogi.startsWith("http"));
check("og:image boyutu", meta.ogw === "1200");
check("twitter:card", meta.tw === "summary_large_image");
check("theme-color", meta.theme === "#000000");
check("favicon", meta.icon.includes("favicon"));
const ogRes = await page.request.get(meta.ogi);
check("og görseli gerçekten var", ogRes.status() === 200, String(ogRes.status()));

console.log("\n── 13. REDUCED MOTION ──────────────────");
const rm = await browser.newContext({ ...mobile(390), reducedMotion: "reduce" });
const rp = await rm.newPage();
rp.on("pageerror", (e) => errors.push("reduced: " + e.message));
await rp.goto(BASE, { waitUntil: "networkidle" });
await rp.waitForTimeout(1200);
check("reduced motion: boot beklemiyor", await rp.evaluate(() => !document.getElementById("boot")));
check("reduced motion: içerik görünür", await rp.evaluate(() => {
  const el = document.querySelector(".hero__stw span");
  return getComputedStyle(el).transform === "none" || el.getBoundingClientRect().height > 0;
}));
const rmOver = await rp.evaluate(() =>
  document.documentElement.scrollWidth - document.documentElement.clientWidth);
check("reduced motion: taşma yok", rmOver <= 0);
await rm.close();

console.log("\n── MASAÜSTÜ ────────────────────────────");
const d = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "tr-TR" });
const dp = await d.newPage();
dp.on("pageerror", (e) => errors.push("desktop: " + e.message));
await dp.goto(BASE, { waitUntil: "networkidle" });
await dp.waitForTimeout(2000);
check("masaüstünde taşma yok", await dp.evaluate(() =>
  document.documentElement.scrollWidth - document.documentElement.clientWidth) <= 0);
await dp.keyboard.press("/");
await dp.waitForTimeout(450);
check('"/" kısayolu paleti açtı', await dp.locator("#pal").isVisible());
await dp.screenshot({ path: `${SHOTS}/n7-desktop.png` });

console.log("\n── KONSOL ──────────────────────────────");
const real = consoleErrors.filter((e) => !e.includes("favicon"));
check("JS çalışma hatası yok", errors.length === 0, errors.slice(0, 3).join(" | "));
check("konsol hatası yok", real.length === 0, real.slice(0, 3).join(" | "));

await browser.close();
console.log(`\n${pass} geçti, ${fail} başarısız`);
process.exit(fail ? 1 : 0);
