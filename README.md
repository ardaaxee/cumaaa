# ARDA.OS

[@lov4ardaa](https://www.instagram.com/lov4ardaa/) — DIGITAL IDENTITY / 2026

> Merak ediyorum.
> Sistemler kuruyorum.
> Fikirleri gerçeğe dönüştürüyorum.

Instagram biyografisinden gelen ziyaretçi için tasarlanmış, mobil öncelikli
kişisel dijital kimlik sitesi. Siyah, editorial + cyber interface.

## Çalıştırma

```bash
pip install -r requirements.txt
python app.py
# http://localhost:8080
```

Telefondan başka bir cihazla test etmek için:

```bash
HOST=0.0.0.0 PORT=8080 python app.py
```

Sadece güvendiğin ağda yap.

## Ortam değişkenleri

Hepsi isteğe bağlı.

| Değişken | İşlevi |
|---|---|
| `PORT` / `HOST` | Sunucu adresi (varsayılan `127.0.0.1:8080`) |
| `SECRET_KEY` | IP karma tuzu — üretimde mutlaka ayarla |
| `DEBUG` | Doluysa Flask hata ayıklama modu |
| `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` | İletişim mesajlarını Telegram'a bildirir |
| `ADMIN_TOKEN` | `/api/messages` okumasını açar; ayarlanmazsa 404 |

## Bölümler

| # | Bölüm | İçerik |
|---|---|---|
| 01 | **HERO** | ARDA.OS, manifesto, EXPLORE + INSTAGRAM |
| 02 | **SYSTEM STATUS** | ONLINE · SYSTEM · LOCAL NODE · BUILD · CURRENT TIME · VIEWPORT |
| 03 | **WHAT I DO** | AI / AUTOMATION / WEB / TERMUX / EXPERIMENTS — dokununca açılır |
| 04 | **TERMUX LAB** | `$ AI TOOLS` `$ AUTOMATION` `$ WEB SERVERS` `$ LINUX` `$ EXPERIMENTS` |
| 05 | **PROJECTS** | Büyük interaktif kartlar → modal (ne / neden / teknoloji / EXPLORE) |
| 06 | **NOW** | CURRENTLY BUILDING / LEARNING / EXPLORING |
| 07 | **DIGITAL TOOLBOX** | Python, JavaScript, HTML, CSS, Linux, Termux, Git, AI |
| 08 | **CONSOLE** | Site içi komutlar — sistem erişimi yok |
| 09 | **CONNECT** | FOLLOW THE JOURNEY + COPY LINK / SHARE / QR / CONTACT |

Ayrıca: açılış geçişi, scroll progress, DISCOVER navigasyonu, footer.

## İçeriği değiştirme

Metinlerin neredeyse tamamı **`static/js/data.js`** içinde. Kod bilmeden
düzenlenebilir — tırnak içindeki yazıyı değiştir, kaydet, sayfayı yenile.

- `IDENTITY` — isim, manifesto, Instagram
- `WHAT_I_DO` — beş alan, açıklama ve etiketler
- `LAB` — Termux LAB kategorileri
- `NOW` — şu an ne yaptığın
- `TOOLBOX` — kullandığın teknolojiler
- `DISCOVER` — alt navigasyon sırası

Projeler sunucu tarafında: **`content/site.json`** → `projects` / `archive`.

## API

Mevcut uç noktalar korundu.

| Endpoint | Açıklama |
|---|---|
| `GET /api/status` | Sürüm, gerçek çalışma süresi, içerik sayıları |
| `POST /api/contact` | İletişim formu — doğrulama, honeypot, saatlik hız sınırı, SQLite |
| `GET /api/qr` | QR üretimi. `format=svg` (varsayılan) veya `format=json` |
| `GET /api/commands` | Komut kaydı |
| `GET /api/content` | Tüm içerik + arama indeksi |
| `GET /api/note/<id>` | Tek not |
| `GET /api/messages` | Kayıtlı mesajlar (`ADMIN_TOKEN` gerekir) |
| `GET /api/health` | Sağlık kontrolü |

## Yapı

```
app.py                 Flask — tüm endpointler + cache fingerprint
qrgen.py               Bağımlılıksız QR kodlayıcı (ISO/IEC 18004)
content/site.json      Projeler, arşiv, notlar
content/lab.json       Komut referansı ($ LINUX modalında kullanılır)
templates/index.html   Tek sayfalık kabuk
static/style.css       Tasarım sistemi + tüm bileşenler
static/app.js          Açılış, scroll, reveal, magnetic, discover
static/js/data.js      DÜZENLENEBİLİR İÇERİK
static/js/core.js      DOM, depolama, pano, toast
static/js/modal.js     Modal + geri tuşu entegrasyonu
static/js/sections.js  Bölüm render'ları
static/js/console.js   Güvenli site konsolu
static/js/connect.js   Copy / Share / QR / Contact
static/sw.js           Çevrimdışı önbellek
tools/make_assets.py   og.png + ikonlar
tools/test_site.mjs    93 tarayıcı testi (Playwright)
```

## Cache

Eski tasarımın tarayıcıda takılı kalmaması için:

- HTML `no-cache, must-revalidate` ile döner
- CSS/JS URL'leri dosya mtime'ından türeyen bir parmak izi taşır
  (`?v=3.0.0-...`) ve parmak izli istekler `immutable` olarak önbelleklenir
- Service worker sürümü `arda-os-v3` — eski önbellek otomatik silinir

## Tasarım kuralları

Bilinçli olarak **yok**: matrix efekti, yeşil terminal yağmuru, otomatik ses,
sahte sayaç, framework, web fontu, CDN, takip kodu, dış istek.

Konsol bir kabuk değil: dosya sistemi, yorumlayıcı ve cihaz erişimi yoktur —
her komut elle yazılmış, sadece sayfada gezinen bir fonksiyondur.

SYSTEM STATUS değerleri API'siz ama uydurma değil: bağlantı `navigator.onLine`,
saat gerçek saat, LOCAL NODE gerçek saat diliminden, VIEWPORT gerçek ekrandan.

## Test

```bash
python3 tools/make_assets.py    # og.png + ikonlar
node tools/test_site.mjs        # 93 tarayıcı testi (sunucu açık olmalı)
```

375 / 390 / 412 px genişlikte taşma, üst üste binme, 10.5px altı yazı ve
40px altı dokunma hedefi kontrol edilir.

## Lisans

Bkz. `LICENSE`.
