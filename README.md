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
  js/lab.js         LAB ekranları
  js/tools.js       10 araç
  js/playground.js  4 deney
  js/panels.js      Projeler, notlar, arşiv, iletişim, paylaşım
  js/palette.js     Komut merkezi
  sw.js             Çevrimdışı önbellek
tools/make_assets.py  og.png ve ikonları üretir
```

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
- Göstermelik terminal — LAB'deki terminal gerçek bir dosya sistemini değiştirir
- Emüle edilemeyen şeyin emüle ediliyormuş gibi gösterilmesi
  (`python`, `node`, ağ komutları açıkça "burada çalışmaz" der)
- Framework, web fontu, CDN, takip kodu, dış istek

Araçların tamamı ziyaretçinin cihazında çalışır; tek istisna QR üretimi,
o da bu sitenin kendi `/api/qr` endpointini kullanır.

## Lisans

Bkz. `LICENSE`.
