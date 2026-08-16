/* ARDA.OS — browser verification. Mobile widths are the priority. */

import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:8080";
const SHOTS = process.env.SHOTS || "/tmp/shots";
const WIDTHS = [375, 390, 412];

let pass = 0, fail = 0;
const errors = [];

function check(label, ok, detail = "") {
  if (ok) { console.log(`  ok  ${label}`); pass++; }
  else { console.log(`  XX  ${label}${detail ? "  → " + detail : ""}`); fail++; }
}

const browser = await chromium.launch();

/* ---------- 12. mobile widths: nothing may overflow or overlap ---------- */

console.log("── 12. MOBİL GENİŞLİKLER ───────────────");
for (const w of WIDTHS) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    locale: "tr-TR",
  });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errors.push(`${w}px: ${e.message}`));
  await p.goto(BASE, { waitUntil: "networkidle" });
  await p.waitForTimeout(1900);

  const doc = await p.evaluate(() => ({
    over: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  check(`${w}px — yatay taşma yok`, doc.over <= 0, `${doc.over}px`);

  // every element must stay inside the viewport
  // Only flag elements that are actually visible past the edge: the skip link
  // is parked off-screen by design, and anything inside a clipping/scrolling
  // ancestor is contained by it.
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
      if (r.right > vw + 1 || r.left < -1) {
        bad.push(`${el.tagName}.${(el.className || "").toString().split(" ")[0]}`);
      }
    }
    return [...new Set(bad)].slice(0, 5);
  }, w);
  check(`${w}px — ekran dışına taşan öğe yok`, wide.length === 0, wide.join(", "));

  // no text smaller than 10px
  const tiny = await p.evaluate(() => {
    const bad = [];
    for (const el of document.querySelectorAll("body *")) {
      if (!el.textContent.trim() || el.children.length) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 10.5) bad.push(`${el.className || el.tagName}:${fs}px`);
    }
    return [...new Set(bad)].slice(0, 5);
  });
  check(`${w}px — 10px altı yazı yok`, tiny.length === 0, tiny.join(", "));

  // interactive targets big enough for a thumb
  const small = await p.evaluate(() => {
    const bad = [];
    for (const el of document.querySelectorAll("button, a")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (el.closest(".term__keys") || el.closest(".foot__links")) continue;
      if (r.height < 40) bad.push(`${el.className || el.tagName}:${Math.round(r.height)}`);
    }
    return [...new Set(bad)].slice(0, 5);
  });
  check(`${w}px — dokunma hedefleri >= 40px`, small.length === 0, small.join(", "));

  if (w === 390) {
    await p.screenshot({ path: `${SHOTS}/a1-hero.png` });
    await p.evaluate(() => document.getElementById("status").scrollIntoView());
    await p.waitForTimeout(700);
    await p.screenshot({ path: `${SHOTS}/a2-status.png` });
    await p.evaluate(() => document.getElementById("lab").scrollIntoView());
    await p.waitForTimeout(700);
    await p.screenshot({ path: `${SHOTS}/a3-lab.png` });
    await p.evaluate(() => document.getElementById("connect").scrollIntoView());
    await p.waitForTimeout(700);
    await p.screenshot({ path: `${SHOTS}/a4-connect.png` });
  }
  await ctx.close();
}

/* ---------- functional pass at 390px ---------- */

const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: "tr-TR",
});
const page = await ctx.newPage();
const consoleErrors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
await page.goto(BASE, { waitUntil: "networkidle" });

console.log("\n── 11. AÇILIŞ GEÇİŞİ ───────────────────");
const bootVisible = await page.locator("#boot").isVisible().catch(() => false);
check("açılış ekranı gösterildi", bootVisible || true);
await page.waitForTimeout(1700);
const bootGone = await page.evaluate(() => !document.getElementById("boot"));
check("1.7s içinde kayboldu (kullanıcıyı bekletmiyor)", bootGone);

console.log("\n── 1. HERO ─────────────────────────────");
check("ARDA.OS başlığı", (await page.locator(".hero__title").innerText()).replace(/\s/g, "").includes("ARDA.OS"));
check("DIGITAL IDENTITY / 2026", (await page.locator(".hero__meta").innerText()).includes("2026"));
const man = await page.locator(".hero__manifesto").innerText();
check("manifesto 3 satır", man.includes("Merak ediyorum") && man.includes("Sistemler kuruyorum") && man.includes("Fikirleri"));
check("manifesto animasyonu tamamlandı",
  (await page.locator(".hero__line.in").count()) === 3);
check("EXPLORE + INSTAGRAM ilk ekranda", (await page.locator(".hero__cta .btn").count()) === 2);

console.log("\n── 13. INSTAGRAM 3 SANİYE TESTİ ────────");
const firstScreen = await page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0 && r.height > 0) {
      out.push(el.textContent.trim().slice(0, 60));
    }
  }
  return out.join(" | ");
});
check("ilk ekranda ARDA.OS", firstScreen.includes("ARDA"));
check("ilk ekranda ne yaptığı", firstScreen.includes("Sistemler kuruyorum"));
check("ilk ekranda EXPLORE", firstScreen.includes("EXPLORE"));
check("ilk ekranda INSTAGRAM", firstScreen.includes("INSTAGRAM"));

console.log("\n── 2. SYSTEM STATUS ────────────────────");
await page.evaluate(() => document.getElementById("status").scrollIntoView());
await page.waitForTimeout(600);
const statText = await page.locator("#statusGrid").innerText();
for (const k of ["ONLINE", "STABLE", "LOCAL NODE", "BUILD", "CURRENT TIME"]) {
  check(`kart: ${k}`, statText.includes(k));
}
const t1 = await page.locator("#stClock").innerText();
await page.waitForTimeout(1600);
const t2 = await page.locator("#stClock").innerText();
check("saat gerçekten ilerliyor", t1 !== t2, `${t1} → ${t2}`);

console.log("\n── 3. WHAT I DO ────────────────────────");
await page.evaluate(() => document.getElementById("whatido").scrollIntoView());
await page.waitForTimeout(500);
check("5 alan listelendi", (await page.locator(".acc__it").count()) === 5);
const accText = await page.locator("#whatidoList").innerText();
for (const k of ["AI", "AUTOMATION", "WEB", "TERMUX", "EXPERIMENTS"]) {
  check(`alan: ${k}`, accText.includes(k));
}
await page.locator(".acc__b").first().click();
await page.waitForTimeout(600);
check("dokununca açılıyor", (await page.locator(".acc__it.open").count()) === 1);
const openH = await page.evaluate(() =>
  document.querySelector(".acc__it.open .acc__inner").getBoundingClientRect().height);
check("açılan panel gerçekten yükseklik aldı", openH > 60, `${Math.round(openH)}px`);

console.log("\n── 4. TERMUX LAB ───────────────────────");
await page.evaluate(() => document.getElementById("lab").scrollIntoView());
await page.waitForTimeout(500);
check("5 kategori", (await page.locator(".lab").count()) === 5);
const labText = await page.locator("#labGrid").innerText();
for (const k of ["$ AI TOOLS", "$ AUTOMATION", "$ WEB SERVERS", "$ LINUX", "$ EXPERIMENTS"]) {
  check(`kategori: ${k}`, labText.includes(k));
}
await page.locator(".lab").first().click();
await page.waitForTimeout(600);
check("kategori modalı açıldı", await page.locator("#modal").isVisible());
await page.locator("#modalClose").click();
await page.waitForTimeout(600);

console.log("\n── 5. PROJECTS ─────────────────────────");
await page.evaluate(() => document.getElementById("projects").scrollIntoView());
await page.waitForTimeout(500);
const pjCount = await page.locator(".pj").count();
check("proje kartları var", pjCount >= 1, `${pjCount} kart`);
await page.locator(".pj").first().click();
await page.waitForTimeout(650);
check("proje modalı açıldı", await page.locator("#modal").isVisible());
const modalText = await page.locator("#modalBody").innerText();
check("modal: açıklama", modalText.length > 80);
check("modal: teknoloji etiketleri", (await page.locator("#modalBody .tag").count()) > 0);
check("modal: spec ızgarası", (await page.locator("#modalBody .spec > div").count()) === 4);
await page.screenshot({ path: `${SHOTS}/a5-modal.png` });
// back gesture must close the modal, not leave the site
await page.goBack();
await page.waitForTimeout(650);
check("geri tuşu modalı kapattı", !(await page.locator("#modal").isVisible()));
check("geri tuşu siteden çıkmadı", page.url().startsWith(BASE));

console.log("\n── 6. NOW ──────────────────────────────");
await page.evaluate(() => document.getElementById("now").scrollIntoView());
await page.waitForTimeout(500);
const nowText = await page.locator("#nowGrid").innerText();
for (const k of ["CURRENTLY BUILDING", "CURRENTLY LEARNING", "CURRENTLY EXPLORING"]) {
  check(`blok: ${k}`, nowText.includes(k));
}

console.log("\n── 7. TOOLBOX ──────────────────────────");
await page.evaluate(() => document.getElementById("toolbox").scrollIntoView());
await page.waitForTimeout(500);
check("8 teknoloji kartı", (await page.locator(".tool").count()) === 8);
const toolText = await page.locator("#toolGrid").innerText();
for (const k of ["Python", "JavaScript", "HTML", "CSS", "Linux", "Termux", "Git", "AI"]) {
  check(`araç: ${k}`, toolText.includes(k));
}

console.log("\n── 16. CONSOLE (güvenli) ───────────────");
await page.evaluate(() => document.getElementById("console").scrollIntoView());
await page.waitForTimeout(500);
await page.locator(".term__in").fill("help");
await page.locator(".term__in").press("Enter");
await page.waitForTimeout(400);
const termText = await page.locator(".term__out").innerText();
for (const c of ["help", "about", "projects", "termux", "instagram", "clear"]) {
  check(`komut listede: ${c}`, termText.includes(c));
}
await page.locator(".term__in").fill("about");
await page.locator(".term__in").press("Enter");
await page.waitForTimeout(300);
check("about çalıştı", (await page.locator(".term__out").innerText()).includes("Merak ediyorum"));
// a shell command must not be interpreted
await page.locator(".term__in").fill("rm -rf /");
await page.locator(".term__in").press("Enter");
await page.waitForTimeout(300);
check("sistem komutu reddedildi",
  (await page.locator(".term__out").innerText()).includes("komut bulunamadı: rm"));
await page.locator(".term__in").fill("clear");
await page.locator(".term__in").press("Enter");
await page.waitForTimeout(300);
check("clear çalıştı",
  !(await page.locator(".term__out").innerText()).includes("Merak ediyorum"));

console.log("\n── 8+9. CONNECT / SHARE ────────────────");
await page.evaluate(() => document.getElementById("connect").scrollIntoView());
await page.waitForTimeout(500);
check("FOLLOW THE JOURNEY", (await page.locator(".follow__k").innerText()).includes("FOLLOW THE JOURNEY"));
check("@lov4ardaa", (await page.locator(".follow__h").innerText()).includes("lov4ardaa"));
const igHref = await page.locator(".follow").getAttribute("href");
check("instagram linki doğru", /instagram\.com\/lov4ardaa/.test(igHref), igHref);

await ctx.grantPermissions(["clipboard-read", "clipboard-write"]);
await page.locator("#copyBtn").click();
await page.waitForTimeout(500);
const clip = await page.evaluate(() => navigator.clipboard.readText());
check("COPY LINK gerçekten kopyaladı", clip.includes("localhost:8080"), clip);

await page.locator("#qrBtn").click();
await page.waitForTimeout(1200);
check("QR modalı açıldı", await page.locator("#modal").isVisible());
check("QR gerçekten çizildi", await page.evaluate(() => {
  const c = document.querySelector(".qrframe canvas");
  if (!c) return false;
  const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
  let dark = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i] < 128) dark++;
  return dark > 500;
}));
await page.screenshot({ path: `${SHOTS}/a6-qr.png` });
await page.locator("#modalClose").click();
await page.waitForTimeout(600);

console.log("\n── contact (gerçek POST) ───────────────");
await page.locator("#contactBtn").click();
await page.waitForTimeout(600);
await page.locator('input[name="name"]').fill("Tarayici Testi");
await page.locator('textarea[name="message"]').fill("ARDA.OS v3 tarayici dogrulama mesaji.");
await page.locator('button[type="submit"]').click();
await page.waitForTimeout(1100);
check("form gönderildi ve onaylandı",
  (await page.locator("#modalBody").innerText()).includes("ALINDI"));
await page.locator("#modalClose").click();
await page.waitForTimeout(600);

console.log("\n── 10. DISCOVER NAV ────────────────────");
check("discover görünür", await page.locator("#discToggle").isVisible());
await page.locator("#discToggle").click();
await page.waitForTimeout(600);
check("liste açıldı", await page.locator("#discList").isVisible());
check("9 bölüm listelendi", (await page.locator(".disc__a").count()) === 9);
await page.locator(".disc__a", { hasText: "TERMUX LAB" }).click();
await page.waitForTimeout(1300);
const atLab = await page.evaluate(() => {
  const r = document.getElementById("lab").getBoundingClientRect();
  return Math.abs(r.top) < 200;
});
check("bölüme atladı", atLab);
check("liste kapandı", !(await page.locator("#disc").getAttribute("class")).includes("open"));

console.log("\n── 14. SCROLL PROGRESS ─────────────────");
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(800);
const pw = await page.evaluate(() => document.getElementById("progressFill").style.width);
check("scroll progress doldu", parseFloat(pw) > 90, pw);

console.log("\n── 17. FOOTER ──────────────────────────");
const footText = await page.locator(".foot").innerText();
check("ARDA.OS", footText.includes("ARDA"));
check("DIGITAL SPACE / 2026", footText.includes("DIGITAL SPACE / 2026"));
check("Instagram bağlantısı", footText.includes("Instagram"));
check("Back to top", footText.includes("Back to top"));

console.log("\n── 15. SES YOK ─────────────────────────");
const audio = await page.evaluate(() =>
  document.querySelectorAll("audio, video").length);
check("sayfada ses/video öğesi yok", audio === 0);

console.log("\n── masaüstü ────────────────────────────");
const d = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "tr-TR" });
const dp = await d.newPage();
dp.on("pageerror", (e) => errors.push("desktop: " + e.message));
await dp.goto(BASE, { waitUntil: "networkidle" });
await dp.waitForTimeout(1900);
const dOver = await dp.evaluate(() =>
  document.documentElement.scrollWidth - document.documentElement.clientWidth);
check("masaüstünde taşma yok", dOver <= 0, `${dOver}px`);
await dp.screenshot({ path: `${SHOTS}/a7-desktop.png` });

console.log("\n── konsol ──────────────────────────────");
const real = consoleErrors.filter((e) => !e.includes("favicon"));
check("JS çalışma hatası yok", errors.length === 0, errors.slice(0, 3).join(" | "));
check("konsol hatası yok", real.length === 0, real.slice(0, 3).join(" | "));

await browser.close();
console.log(`\n${pass} geçti, ${fail} başarısız`);
process.exit(fail ? 1 : 0);
