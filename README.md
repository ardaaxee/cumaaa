# whoisarda

[@lov4ardaa](https://instagram.com/lov4ardaa) — Instagram bio linki olarak çalışan,
mobil öncelikli kişisel platform.

Portfolyo değil: Instagram'dan gelen kişiye ilk dokunuşta çalışan bir şey vermek,
sonra Instagram'a geri döndürmek üzerine kurulu bir öğrenme + araç ürünü.

## Çalıştırma

```bash
pip install -r requirements.txt
python app.py
# http://127.0.0.1:5000
```

Termux'ta telefondan test ederken başka bir cihazdan da açmak istersen:

```bash
HOST=0.0.0.0 python app.py
```

Sadece kendi güvendiğin ağda yap — ayrıntı için sitedeki
"127.0.0.1 ile 0.0.0.0 arasındaki fark" notu.

## Ortam değişkenleri

Hepsi isteğe bağlı; hiçbiri yoksa site tam çalışır.

| Değişken | İşlevi |
|---|---|
| `SECRET_KEY` | IP karma tuzu. Üretimde mutlaka ayarla. |
| `PORT` / `HOST` | Sunucu adresi (varsayılan `127.0.0.1:5000`) |
| `DEBUG` | Doluysa Flask hata ayıklama modu |
| `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` | İletişim mesajlarını Telegram'a bildirir |
| `ADMIN_TOKEN` | `/api/messages` okumasını açar. Ayarlanmazsa endpoint 404 döner. |

Gelen mesajları okumak:

```bash
ADMIN_TOKEN=birseyler python app.py
curl "localhost:5000/api/messages?token=birseyler"
```

## API

| Endpoint | Açıklama |
|---|---|
| `GET /api/status` | Sürüm, gerçek çalışma süresi, içerik sayıları |
| `POST /api/contact` | İletişim formu — doğrulama, honeypot, saatlik hız sınırı, SQLite |
| `GET /api/qr` | QR üretimi. `format=svg` (varsayılan) veya `format=json` |
| `GET /api/commands` | Komut merkezinin komut kaydı |
| `GET /api/content` | Tüm içerik + arama indeksi |
| `GET /api/note/<id>` | Tek not |
| `GET /api/messages` | Kayıtlı mesajlar (`ADMIN_TOKEN` gerekir) |
| `GET /api/health` | Sağlık kontrolü |

## Yapı

```
app.py              Flask uygulaması — tüm endpointler
qrgen.py            Bağımlılıksız QR kodlayıcı (ISO/IEC 18004, byte modu)
content/
  site.json         Profil, projeler, arşiv, notlar, drops
  lab.json          Termux LAB müfredatı — 22 ders
templates/
  index.html        Tek sayfalık kabuk (sunucuda render edilir, SEO için)
static/
  style.css         Tasarım sistemi + tüm bileşenler
  app.js            Giriş noktası
  js/core.js        DOM, depolama, pano, toast
  js/ui.js          Panel/sheet sistemi + geçmiş entegrasyonu
  js/vfs.js         Sanal dosya sistemi + komut yorumlayıcısı
  js/term.js        Paylaşılan terminal bileşeni
  js/lab.js         LAB, komut kartı, ilerleme kartı
  js/terminal.js    Tam ekran interaktif terminal
  js/explore.js     EXPLORE keşif destesi
  js/status.js      Canlı tanılama paneli
  js/tools.js       10 araç
  js/playground.js  4 deney
  js/panels.js      Projeler, notlar, arşiv, iletişim, paylaşım
  js/palette.js     Komut merkezi
  js/egg.js         Gizli bölüm
  sw.js             Çevrimdışı önbellek
tools/make_assets.py  og.png ve ikonları üretir
tools/test_lab.mjs    LAB müfredatı testleri (node)
tools/test_browser.mjs / test_v21.mjs   Tarayıcı testleri (Playwright)
```

## Bölümler

| Bölüm | Ne yapar |
|---|---|
| **EXPLORE** | Sitedeki 48 içeriğin tamamını kaydırılabilir kart destesinde sunar |
| **TERMUX LAB** | 22 ders, 4 track, sanal terminalde doğrulanan görevler |
| **TERMINAL** | Tam ekran yorumlayıcı — borular, yönlendirme, git, pkg, `open` ile site gezinme |
| **TOOLS** | 10 araç, hepsi cihazda çalışır |
| **PROJECTS** | Proje + arşiv tek filtrelenebilir yüzeyde |
| **PLAYGROUND** | 4 interaktif deney |
| **NOTES / ARCHIVE** | Teknik yazılar ve eski depolar |
| **COMMAND** | Bulanık arama + 22 gerçek komut |
| **SYSTEM STATUS** | Canlı ölçüm: uç nokta gecikmeleri, cihaz, tarayıcı yetenekleri |
| **VOID** | Gizli bölüm — üç ayrı yoldan açılır |

## Testler

```bash
python3 tools/make_assets.py     # og.png + ikonlar
node tools/test_lab.mjs          # 36 müfredat testi
node tools/test_browser.mjs      # 43 tarayıcı testi
node tools/test_v21.mjs          # 50 tarayıcı testi
```

Tarayıcı testleri için Playwright ve çalışan bir sunucu gerekir.

## İçeriği güncelleme

Kod değiştirmeden `content/` altındaki JSON dosyalarını düzenlemen yeterli —
sunucu dosya değişince içeriği yeniden okur.

- **Yeni proje**: `content/site.json` → `projects` dizisine ekle
- **Yeni not**: `notes` dizisine ekle
- **Yeni güncelleme duyurusu**: `drops` dizisinin başına ekle
- **Yeni ders**: `content/lab.json` → ilgili track'in `lessons` dizisine ekle

`archive` girdilerindeki açıklamalar depo adlarından türetildi;
kendi kelimelerinle güncellemen iyi olur.

## Tasarım kuralları

Bu depoda bilinçli olarak **yok**:

- Sahte sayaç, sahte sistem durumu, sahte "online kullanıcı"
  (SYSTEM STATUS'taki her değer istek anında ölçülür)
- Göstermelik terminal — LAB'deki terminal gerçek bir dosya sistemini değiştirir
- Emüle edilemeyen şeyin emüle ediliyormuş gibi gösterilmesi
  (`python`, `node`, ağ komutları açıkça "burada çalışmaz" der)
- Framework, web fontu, CDN, takip kodu, dış istek
- Klişe Matrix/yeşil terminal estetiği — vurgu renkle değil ışıkla taşınır;
  tek doygun renkler anlamsaldır (amber uyarır, kırmızı hata verir)

Araçların tamamı ziyaretçinin cihazında çalışır; tek istisna QR üretimi,
o da bu sitenin kendi `/api/qr` endpointini kullanır.

## Lisans

Bkz. `LICENSE`.
