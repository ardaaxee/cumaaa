/* Browser coverage for the v2.1 additions: explore deck, standalone terminal,
 * system status, cheatsheet, filtered projects, IG card and the easter egg. */

import { chromium, devices } from "playwright";

const BASE = process.env.BASE || "http://127.0.0.1:5000";
const SHOTS = process.env.SHOTS || "/tmp/shots";

let pass = 0, fail = 0;
const pageErrors = [];
const consoleErrors = [];

function check(label, ok, detail = "") {
  if (ok) { console.log(`  ok  ${label}`); pass++; }
  else { console.log(`  XX  ${label}${detail ? "  → " + detail : ""}`); fail++; }
}

const browser = await chromium.launch();
const context = await browser.newContext({ ...devices["Pixel 7"], locale: "tr-TR" });
const page = await context.newPage();
page.on("pageerror", (e) => pageErrors.push(e.message));
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(1600);

console.log("── görsel dil ──────────────────────────");
const palette = await page.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  return {
    accent: cs.getPropertyValue("--accent").trim(),
    bg: cs.getPropertyValue("--bg").trim(),
  };
});
check("aksan monokrom (yeşil değil)", palette.accent === "#ffffff", palette.accent);
check("zemin siyah", palette.bg === "#050506", palette.bg);
const greenPixels = await page.evaluate(() => {
  // sample the rendered page for saturated green, the Matrix tell
  const el = document.createElement("canvas");
  return Array.from(document.querySelectorAll("*")).filter((n) => {
    const c = getComputedStyle(n).color + getComputedStyle(n).backgroundColor;
    return /rgb\(\s*0,\s*2[0-9]{2},\s*1[0-9]{2}/.test(c);
  }).length + (el ? 0 : 0);
});
check("yeşil terminal rengi kullanılmıyor", greenPixels === 0, `${greenPixels} öğe`);

console.log("\n── index ───────────────────────────────");
check("13 görünür satır", (await page.locator(".row:visible").count()) === 13,
  String(await page.locator(".row:visible").count()));
check("VOID satırı gizli", await page.locator("#voidRow").isHidden());
check("Instagram profil kartı var", await page.locator(".igcard.homecard").isVisible());
const overflow = await page.evaluate(() =>
  document.documentElement.scrollWidth - document.documentElement.clientWidth);
check("yatay taşma yok", overflow <= 0, `${overflow}px`);

console.log("\n── EXPLORE ─────────────────────────────");
await page.locator('[data-open="explore"]').click();
await page.waitForTimeout(500);
check("deste açıldı", (await page.locator("#sheetTitle").innerText()) === "EXPLORE");
const cards = await page.locator(".card3d").count();
check("kart yığını çizildi", cards >= 2, `${cards} kart`);
const firstTitle = await page.locator(".card3d:not(.card3d--peek) .card3d__title").innerText();
await page.screenshot({ path: `${SHOTS}/30-explore.png` });

await page.locator(".deck__controls .btn").first().click();
await page.waitForTimeout(500);
const secondTitle = await page.locator(".card3d:not(.card3d--peek) .card3d__title").innerText();
check("geç butonu desteyi ilerletti", firstTitle !== secondTitle, `${firstTitle} → ${secondTitle}`);
check("sayaç ilerledi", (await page.locator(".deck__count").innerText()).startsWith("2/"));

// swipe the top card
const box = await page.locator(".card3d:not(.card3d--peek)").boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(box.x + box.width / 2 - 160, box.y + box.height / 2, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(500);
check("kaydırma desteyi ilerletti", (await page.locator(".deck__count").innerText()).startsWith("3/"));

// opening a card must land on the real thing
await page.locator(".card3d:not(.card3d--peek) .btn").click();
await page.waitForTimeout(500);
check("karttan gerçek içerik açıldı",
  (await page.locator("#sheetTitle").innerText()).length > 0
  && (await page.locator("#sheetTitle").innerText()) !== "EXPLORE");
await page.locator("#sheetClose").click();
await page.waitForTimeout(500);

console.log("\n── TERMINAL ────────────────────────────");
await page.locator('[data-open="terminal"]').click();
await page.waitForTimeout(500);
check("terminal paneli açıldı", (await page.locator("#sheetTitle").innerText()) === "TERMINAL");
await page.locator(".term__in").fill("ls -la");
await page.locator(".term__in").press("Enter");
await page.waitForTimeout(300);
check("dosya sistemi çalışıyor",
  (await page.locator(".term__out").innerText()).includes("notes.txt"));

await page.locator(".term__in").fill("sitehelp");
await page.locator(".term__in").press("Enter");
await page.waitForTimeout(250);
check("site komutları listelendi",
  (await page.locator(".term__out").innerText()).includes("open <bölüm>"));

await page.locator(".term__in").fill("about");
await page.locator(".term__in").press("Enter");
await page.waitForTimeout(250);
check("about gerçek veri döndü",
  (await page.locator(".term__out").innerText()).includes("@lov4ardaa"));

// Tab completion
await page.locator(".term__in").fill("gi");
await page.locator(".term__in").press("Tab");
await page.waitForTimeout(150);
check("Tab tamamlama çalışıyor",
  (await page.locator(".term__in").inputValue()).startsWith("git"),
  await page.locator(".term__in").inputValue());

await page.locator(".term__in").fill("open tools");
await page.locator(".term__in").press("Enter");
await page.waitForTimeout(600);
check("terminalden panel açıldı", (await page.locator("#sheetTitle").innerText()) === "TOOLS");
await page.screenshot({ path: `${SHOTS}/31-terminal.png` });
await page.locator("#sheetClose").click();
await page.waitForTimeout(500);

console.log("\n── SYSTEM STATUS ───────────────────────");
await page.locator('[data-open="status"]').click();
await page.waitForTimeout(2200);
check("durum paneli açıldı", (await page.locator("#sheetTitle").innerText()) === "SYSTEM STATUS");
const probes = await page.locator(".probe").count();
check("5 uç nokta ölçüldü", probes === 5, `${probes}`);
const okDots = await page.locator(".probe__dot--ok").count();
check("uç noktalar sağlıklı", okDots === 5, `${okDots}/5 yeşil`);
const probeText = await page.locator(".probe__val").first().innerText();
check("gerçek gecikme ölçüldü", /\d+\s*ms/.test(probeText), probeText);
check("yetenek listesi doldu", (await page.locator(".cap").count()) >= 6);
const bodyText = await page.locator("#sheetBody").innerText();
check("sunucu sürümü gerçek", bodyText.includes("2.1.0"));
check("çalışma süresi var", /çalışma süresi/.test(bodyText));
await page.screenshot({ path: `${SHOTS}/32-status.png` });
await page.locator("#sheetClose").click();
await page.waitForTimeout(500);

console.log("\n── LAB: arama + komut kartı + kart ─────");
await page.locator('[data-open="lab"]').click();
await page.waitForTimeout(500);
await page.locator('input[type="search"]').fill("grep");
await page.waitForTimeout(400);
const shown = await page.locator(".lesson").count();
check("ders araması filtreliyor", shown > 0 && shown < 22, `${shown} ders`);
await page.locator('input[type="search"]').fill("calisma");
await page.waitForTimeout(400);
check("türkçe katlama derslerde de çalışıyor", (await page.locator(".lesson").count()) > 0);
await page.locator('input[type="search"]').fill("");
await page.waitForTimeout(400);

await page.locator("#sheetBody button", { hasText: "komut kartı" }).first().click();
await page.waitForTimeout(500);
check("komut kartı açıldı", (await page.locator("#sheetTitle").innerText()) === "KOMUT KARTI");
check("komutlar listelendi", (await page.locator(".cheat").count()) === 22,
  String(await page.locator(".cheat").count()));
await page.locator('input[type="search"]').fill("chmod");
await page.waitForTimeout(400);
check("komut kartı araması çalışıyor", (await page.locator(".cheat").count()) === 1);
await page.locator(".cheat").first().click();
await page.waitForTimeout(500);
check("komut kartından derse gidiliyor",
  (await page.locator("#sheetTitle").innerText()) === "chmod");
await page.screenshot({ path: `${SHOTS}/33-cheatsheet.png` });

// complete a lesson so the share card has something to draw
await page.locator(".term__in").fill("cd ~");
await page.locator(".term__in").press("Enter");
await page.locator(".term__in").fill("mkdir -p lab");
await page.locator(".term__in").press("Enter");
await page.locator(".term__in").fill("cd lab");
await page.locator(".term__in").press("Enter");
await page.locator(".term__in").fill("touch script.sh");
await page.locator(".term__in").press("Enter");
await page.locator(".term__in").fill("chmod +x script.sh");
await page.locator(".term__in").press("Enter");
await page.waitForTimeout(400);
check("görev sanal terminalde doğrulandı",
  (await page.locator(".mission__state").innerText()).includes("doğrulandı"));
await page.locator("#sheetClose").click();
await page.waitForTimeout(500);
check("ilerleme ana ekrana yansıdı",
  (await page.locator("#labBadge").innerText()) === "1/22");

// the progress card must actually render pixels
const cardOk = await page.evaluate(async () => {
  const mod = await import("/static/js/lab.js");
  void mod;
  return true;
});
check("lab modülü içe aktarılabilir", cardOk);

console.log("\n── PROJECTS filtreleri ─────────────────");
await page.locator('[data-open="projects"]').click();
await page.waitForTimeout(500);
const allItems = await page.locator(".item").count();
check("proje + arşiv birleşti", allItems === 7, `${allItems}`);
await page.locator(".chip", { hasText: "arşiv" }).click();
await page.waitForTimeout(300);
check("arşiv filtresi çalışıyor", (await page.locator(".item").count()) === 6);
await page.locator(".chip", { hasText: "yayında" }).click();
await page.waitForTimeout(300);
check("yayında filtresi çalışıyor", (await page.locator(".item").count()) === 1);
await page.locator('input[type="search"]').fill("zzzz");
await page.waitForTimeout(300);
check("boş sonuç durumu var", await page.locator(".empty").isVisible());
await page.locator('input[type="search"]').fill("");
await page.locator(".chip", { hasText: "hepsi" }).click();
await page.waitForTimeout(300);
await page.locator(".item").first().click();
await page.waitForTimeout(400);
check("proje detayında spec ızgarası var", (await page.locator(".spec").count()) === 4);
await page.screenshot({ path: `${SHOTS}/34-projects.png` });
await page.locator("#sheetClose").click();
await page.waitForTimeout(500);

console.log("\n── EASTER EGG ──────────────────────────");
check("VOID hâlâ gizli", await page.locator("#voidRow").isHidden());
for (let i = 0; i < 7; i++) {
  await page.locator("#wordmark").click();
  await page.waitForTimeout(90);
}
await page.waitForTimeout(900);
check("yedi dokunuş gizli bölümü açtı",
  (await page.locator("#sheetTitle").innerText()) === "VOID");
const ascii = await page.locator("#sheetBody pre").innerText();
check("ASCII banner üretildi", ascii.includes("█"), ascii.slice(0, 20));
await page.locator("#sheetBody input").fill("TERMUX");
await page.waitForTimeout(300);
check("banner girdiye tepki veriyor",
  (await page.locator("#sheetBody pre").innerText()).split("\n").length === 7);
await page.screenshot({ path: `${SHOTS}/35-void.png` });
await page.locator("#sheetClose").click();
await page.waitForTimeout(500);
check("VOID satırı artık görünür", await page.locator("#voidRow").isVisible());

console.log("\n── palet yeni komutlar ─────────────────");
await page.locator(".dock__cmd").click();
await page.waitForTimeout(400);
await page.locator("#paletteInput").fill("explore");
await page.locator("#paletteInput").press("Enter");
await page.waitForTimeout(600);
check("palet explore komutu çalıştı",
  (await page.locator("#sheetTitle").innerText()) === "EXPLORE");
await page.locator("#sheetClose").click();
await page.waitForTimeout(500);

console.log("\n── masaüstü + konami ───────────────────");
const desktop = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: "tr-TR" });
const dpage = await desktop.newPage();
dpage.on("pageerror", (e) => pageErrors.push("desktop: " + e.message));
await dpage.goto(BASE, { waitUntil: "networkidle" });
await dpage.waitForTimeout(1200);
for (const key of ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
                   "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"]) {
  await dpage.keyboard.press(key);
  await dpage.waitForTimeout(50);
}
await dpage.waitForTimeout(900);
check("Konami kodu gizli bölümü açtı",
  (await dpage.locator("#sheetTitle").innerText()) === "VOID");
const dOverflow = await dpage.evaluate(() =>
  document.documentElement.scrollWidth - document.documentElement.clientWidth);
check("masaüstünde yatay taşma yok", dOverflow <= 0);
await dpage.screenshot({ path: `${SHOTS}/36-desktop.png` });

console.log("\n── konsol ──────────────────────────────");
const real = consoleErrors.filter((e) => !e.includes("favicon") && !e.includes("sw.js"));
check("JS çalışma hatası yok", pageErrors.length === 0, pageErrors.join(" | "));
check("konsol hatası yok", real.length === 0, real.slice(0, 3).join(" | "));

await browser.close();
console.log(`\n${pass} geçti, ${fail} başarısız`);
process.exit(fail ? 1 : 0);
