/* End-to-end check in a real mobile-sized Chromium.
 * Run with the server up:  NODE_PATH=$(npm root -g) node tools/test_browser.mjs */

import { chromium, devices } from "playwright";

const BASE = process.env.BASE || "http://127.0.0.1:5000";
const SHOTS = process.env.SHOTS || "/tmp/shots";

let pass = 0, fail = 0;
const consoleErrors = [];
const pageErrors = [];

function check(label, condition, detail = "") {
  if (condition) { console.log(`  ok  ${label}`); pass++; }
  else { console.log(`  XX  ${label}${detail ? "  → " + detail : ""}`); fail++; }
}

const browser = await chromium.launch();
const context = await browser.newContext({
  ...devices["Pixel 7"],
  locale: "tr-TR",
});
const page = await context.newPage();

page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => pageErrors.push(err.message));

console.log("── yükleme ─────────────────────────────");
const response = await page.goto(BASE, { waitUntil: "networkidle" });
check("sayfa 200 döndü", response.status() === 200);
check("başlık doğru", (await page.title()).includes("ARDA"));
check("wordmark görünür", await page.locator("#wordmark").isVisible());
check("index 10 satır", (await page.locator(".row").count()) === 10);
check("dock görünür", await page.locator(".dock__cmd").isVisible());
check("CTA görünür", (await page.locator(".outro__line").innerText()).includes("THE STORY DOESN'T"));

// mobile layout: nothing may overflow horizontally
const overflow = await page.evaluate(() =>
  document.documentElement.scrollWidth - document.documentElement.clientWidth);
check("yatay taşma yok", overflow <= 0, `taşma ${overflow}px`);

// Touch targets. WCAG 2.5.8 exempts links inline in a sentence (the colophon)
// and the terminal quick-key strip, which is a scrolling keyboard accessory.
const small = await page.evaluate(() => {
  const bad = [];
  for (const el of document.querySelectorAll("button, a")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    if (el.closest(".termkeys") || el.closest(".colophon")) continue;
    if (r.height < 40) bad.push(`${el.className || el.tagName}:${Math.round(r.height)}px`);
  }
  return bad;
});
check("dokunma hedefleri >=40px", small.length === 0, small.slice(0, 4).join(", "));

await page.screenshot({ path: `${SHOTS}/01-home.png`, fullPage: false });

console.log("\n── LAB ─────────────────────────────────");
await page.locator('[data-open="lab"]').click();
await page.waitForTimeout(450);
check("sheet açıldı", await page.locator("#sheet").isVisible());
check("başlık LAB", (await page.locator("#sheetTitle").innerText()) === "LAB");
check("4 track listelendi", (await page.locator(".track").count()) === 4);
check("22 ders listelendi", (await page.locator(".lesson").count()) === 22);
await page.screenshot({ path: `${SHOTS}/02-lab.png` });

// open the first lesson
await page.locator(".lesson").first().click();
await page.waitForTimeout(400);
check("ders açıldı (pwd)", (await page.locator("#sheetTitle").innerText()) === "pwd");
check("anatomi tokenleri var", (await page.locator(".tok").count()) > 0);
check("sanal terminal var", await page.locator(".term__in").isVisible());
check("sanal ortam rozeti", (await page.locator(".term__badge").innerText()).toLowerCase().includes("sanal"));

// anatomy interaction
await page.locator(".tok").first().click();
await page.waitForTimeout(150);
check("token açıklaması geldi",
  (await page.locator(".tok__desc").innerText()).includes("print working directory"));

// run the mission for real
await page.locator(".term__in").fill("pwd");
await page.locator(".term__in").press("Enter");
await page.waitForTimeout(300);
const termText = await page.locator(".term__out").innerText();
check("terminal çıktı verdi", termText.includes("/data/data/com.termux/files/home"));
check("görev doğrulandı", (await page.locator(".mission__state").innerText()).includes("doğrulandı"));
await page.screenshot({ path: `${SHOTS}/03-lesson.png` });

// a command that must NOT pretend to work
await page.locator(".term__in").fill("python app.py");
await page.locator(".term__in").press("Enter");
await page.waitForTimeout(250);
check("python sahte çıktı üretmiyor",
  (await page.locator(".term__out").innerText()).includes("çalıştırılmaz"));

// filesystem actually mutates
await page.locator(".term__in").fill("mkdir testklasor");
await page.locator(".term__in").press("Enter");
await page.locator(".term__in").fill("ls");
await page.locator(".term__in").press("Enter");
await page.waitForTimeout(250);
check("dosya sistemi gerçekten değişti",
  (await page.locator(".term__out").innerText()).includes("testklasor"));

// progress persisted to the home screen
await page.locator("#sheetClose").click();
await page.waitForTimeout(450);
check("sheet kapandı", !(await page.locator("#sheet").isVisible()));
check("ilerleme ana ekrana yansıdı",
  (await page.locator("#labBadge").innerText()) === "1/22");

console.log("\n── TOOLS ───────────────────────────────");
await page.locator('[data-open="tools"]').click();
await page.waitForTimeout(400);
check("10 araç listelendi", (await page.locator(".tile").count()) === 10);

await page.locator(".tile", { hasText: "Base64" }).click();
await page.waitForTimeout(300);
await page.locator("textarea").fill("merhaba dünya");
await page.locator("button", { hasText: "kodla" }).first().click();
await page.waitForTimeout(200);
const b64 = await page.locator(".out").innerText();
check("base64 kodladı", b64 === "bWVyaGFiYSBkw7xueWE=", b64);

await page.locator("#sheetBack").click();
await page.waitForTimeout(350);
await page.locator(".tile", { hasText: "QR Generator" }).click();
await page.waitForTimeout(900);
check("QR canvas çizildi", await page.evaluate(() => {
  const c = document.querySelector(".qr__frame canvas");
  if (!c) return false;
  const ctx = c.getContext("2d");
  const data = ctx.getImageData(0, 0, c.width, c.height).data;
  let dark = 0;
  for (let i = 0; i < data.length; i += 4) if (data[i] < 128) dark++;
  return dark > 500;
}));
await page.screenshot({ path: `${SHOTS}/04-qr.png` });

await page.locator("#sheetBack").click();
await page.waitForTimeout(300);
await page.locator(".tile", { hasText: "JSON" }).click();
await page.waitForTimeout(300);
await page.locator("textarea").fill('{"a":1,"b":[1,2]}');
await page.locator("button", { hasText: "biçimlendir" }).click();
await page.waitForTimeout(200);
check("JSON biçimlendirdi", (await page.locator(".out").innerText()).includes('"a": 1'));

await page.locator("#sheetClose").click();
await page.waitForTimeout(400);

console.log("\n── PLAYGROUND ──────────────────────────");
await page.locator('[data-open="playground"]').click();
await page.waitForTimeout(350);
await page.locator(".tile", { hasText: "Life" }).click();
await page.waitForTimeout(900);
check("Life canvas çiziyor", await page.evaluate(() => {
  const c = document.querySelector(".stage canvas");
  if (!c) return false;
  const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 0) return true;
  return false;
}));
await page.screenshot({ path: `${SHOTS}/05-life.png` });
await page.locator("#sheetClose").click();
await page.waitForTimeout(400);

console.log("\n── COMMAND CENTER ──────────────────────");
await page.locator(".dock__cmd").click();
await page.waitForTimeout(350);
check("palet açıldı", await page.locator("#palette").isVisible());
await page.locator("#paletteInput").fill("grep");
await page.waitForTimeout(300);
const results = await page.locator(".res").count();
check("arama sonuç döndürdü", results > 0, `${results} sonuç`);
check("grep dersi bulundu",
  (await page.locator(".res").first().innerText()).toLowerCase().includes("grep"));
await page.screenshot({ path: `${SHOTS}/06-palette.png` });

// Turkish folding: "ogren" should find "öğren"
await page.locator("#paletteInput").fill("ogren");
await page.waitForTimeout(250);
check("türkçe karakter katlama çalışıyor", (await page.locator(".res").count()) > 0);

// a real command
await page.locator("#paletteInput").fill("status");
await page.locator("#paletteInput").press("Enter");
await page.waitForTimeout(700);
check("status komutu gerçek veri getirdi",
  (await page.locator("#paletteLog").innerText()).includes("whoisarda"));

await page.locator("#paletteInput").fill("tools");
await page.locator("#paletteInput").press("Enter");
await page.waitForTimeout(500);
check("nav komutu paneli açtı", (await page.locator("#sheetTitle").innerText()) === "TOOLS");

console.log("\n── GERİ TUŞU / GEÇMİŞ ──────────────────");
await page.locator(".tile").first().click();
await page.waitForTimeout(350);
const deepTitle = await page.locator("#sheetTitle").innerText();
await page.goBack();
await page.waitForTimeout(400);
check("geri tuşu bir seviye çıktı",
  (await page.locator("#sheetTitle").innerText()) === "TOOLS" && deepTitle !== "TOOLS");
await page.goBack();
await page.waitForTimeout(450);
check("geri tuşu sheet'i kapattı", !(await page.locator("#sheet").isVisible()));

console.log("\n── CONTACT ─────────────────────────────");
await page.locator('[data-open="contact"]').click();
await page.waitForTimeout(350);
await page.locator('input[name="name"]').fill("Tarayici Testi");
await page.locator('textarea[name="message"]').fill("Bu mesaj gercek bir tarayicidan gonderildi.");
await page.locator('button[type="submit"]').click();
await page.waitForTimeout(900);
check("form gönderildi ve onay geldi",
  (await page.locator("#sheetBody").innerText()).includes("Mesaj alındı"));
await page.screenshot({ path: `${SHOTS}/07-contact.png` });
await page.locator("#sheetClose").click();
await page.waitForTimeout(400);

console.log("\n── DEEP LINK ───────────────────────────");
await page.goto(`${BASE}/lab`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
check("/lab doğrudan LAB panelini açtı",
  (await page.locator("#sheetTitle").innerText()) === "LAB");
check("ilerleme localStorage'dan geri geldi",
  (await page.locator("#labBadge").innerText()) === "1/22");

console.log("\n── DESKTOP ─────────────────────────────");
const desktop = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: "tr-TR" });
const dpage = await desktop.newPage();
dpage.on("pageerror", (err) => pageErrors.push("desktop: " + err.message));
await dpage.goto(BASE, { waitUntil: "networkidle" });
const dOverflow = await dpage.evaluate(() =>
  document.documentElement.scrollWidth - document.documentElement.clientWidth);
check("masaüstünde yatay taşma yok", dOverflow <= 0);
await dpage.keyboard.press("Control+k");
await dpage.waitForTimeout(350);
check("Ctrl+K paleti açtı", await dpage.locator("#palette").isVisible());
await dpage.screenshot({ path: `${SHOTS}/08-desktop.png` });

console.log("\n── KONSOL ──────────────────────────────");
const realErrors = consoleErrors.filter((e) => !e.includes("favicon") && !e.includes("sw.js"));
check("JS çalışma hatası yok", pageErrors.length === 0, pageErrors.join(" | "));
check("konsol hatası yok", realErrors.length === 0, realErrors.slice(0, 3).join(" | "));

await browser.close();
console.log(`\n${pass} geçti, ${fail} başarısız`);
process.exit(fail ? 1 : 0);
