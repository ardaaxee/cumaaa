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
| — | **HERO** | ARDA.OS · BUILD. EXPERIMENT. LEARN. · manifesto · canlı LOCAL TIME / ONLINE / VIEWPORT · DISCOVER + INSTAGRAM |
| 01 | **WHAT I DO** | AI / AUTOMATION / WEB / TERMUX / EXPERIMENTS — dokununca açılır |
| 02 | **TERMUX LAB** | 5 modül · 18 ders · komut + açıklama + örnek + kopyala · ilerleme sayacı |
| 03 | **PROJECTS** | Büyük kartlar → tam ekran detay geçişi |
| 04 | **NOW** | CURRENTLY BUILDING / LEARNING / EXPLORING |
| 05 | **DIGITAL TOOLBOX** | 8 teknoloji, dokununca açıklama açılır |
| 06 | **SESSION** | Gerçek tarayıcı oturumu — sahte sayaç yok |
| 07 | **CONSOLE** | Site içi komutlar — sistem erişimi yok |
| 08 | **CONNECT** | FOLLOW THE JOURNEY + COPY LINK / SHARE / QR / CONTACT |

Ayrıca: açılış geçişi, DISCOVER scan geçişi, komut paleti (⌘K / `/` / mobil düğme),
scroll progress, DISCOVER navigasyonu, keşfedilebilir detaylar, footer.

## İçeriği değiştirme

Metinlerin neredeyse tamamı **`static/js/data.js`** içinde. Kod bilmeden
düzenlenebilir — tırnak içindeki yazıyı değiştir, kaydet, sayfayı yenile.

- `IDENTITY` — isim, manifesto, Instagram
- `WHAT_I_DO` — beş alan, açıklama ve etiketler
- `LAB` — Termux Lab modülleri ve dersleri
- `NOW` — şu an ne yaptığın
- `TOOLBOX` — kullandığın teknolojiler
- `DISCOVER` — alt navigasyon sırası
- `EGGS` — keşfedilebilir detayların metinleri

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
static/js/modal.js     Sheet modal (contact / QR)
static/js/detail.js    Tam ekran proje detayı
static/js/sections.js  What I do / projects / now / toolbox
static/js/lab.js       Termux Lab + ilerleme
static/js/session.js   Yerel oturum paneli
static/js/palette.js   Komut paleti + arama indeksi
static/js/console.js   Güvenli site konsolu
static/js/connect.js   Copy / Share / QR / Contact
static/js/egg.js       Keşfedilebilir detaylar
static/sw.js           Çevrimdışı önbellek
tools/make_assets.py   og.png + ikonlar
tools/test_site.mjs    154 tarayıcı testi (Playwright)
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

SESSION ve hero göstergeleri API'siz ama uydurma değil: bağlantı `navigator.onLine`,
saat gerçek saat, viewport gerçek ekran, cihaz türü gerçek medya sorgusu.
Ziyaretçi sayacı yoktur ve eklenmeyecektir.

## Test

```bash
python3 tools/make_assets.py    # og.png + ikonlar
node tools/test_site.mjs        # 154 tarayıcı testi (sunucu açık olmalı)
```

375 / 390 / 412 / 430 px genişlikte taşma, üst üste binme, 10.5px altı yazı ve
44px altı dokunma hedefi kontrol edilir.

## Lisans

Bkz. `LICENSE`.
