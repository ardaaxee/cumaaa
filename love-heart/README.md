# ❤ Tek Kalp

Koyu bir ekranın tam ortasında tek bir büyük SVG kalp. Sürekli gerçekçi
"lub-dub" ritminde atar; dokununca bir kez güçlüce atar. Ekranda başka
hiçbir şey yoktur: yazı yok, buton yok, menü yok, parçacık yok.

Sen siteyi internete yüklersin, sana bir **https://...** linki verilir, o linki
sevgiline gönderirsin. Karşı taraf hiçbir şey kurmadan telefonunun
tarayıcısında açar.

---

## İçindekiler

- [Özellikler](#özellikler)
- [Kurulum](#kurulum)
- [Lokal Çalıştırma](#lokal-çalıştırma)
- [Kişiselleştirme (config.json)](#kişiselleştirme-configjson)
- [GitHub'a Yükleme](#githuba-yükleme)
- [Ücretsiz Deployment (Render)](#ücretsiz-deployment-render)
- [Public Link Alma ve Gönderme](#public-link-alma-ve-gönderme)
- [Sorun Giderme](#sorun-giderme)

---

## Özellikler

- Tek büyük SVG kalp — kırmızı/pembe gradient, arkasında yumuşak glow ve gölge
- Sürekli lub-dub kalp atışı (CSS animasyonu, GPU dostu `transform`)
- Dokununca tek seferlik güçlü atış; başka hiçbir efekt veya element yok
- Sayfada görünen tek şey kalptir: metin, buton, menü, canvas, parçacık yok
- Mobil öncelikli: kalp telefonda ~220–280px, masaüstünde ~320–400px
- Yatay/dikey gereksiz kaydırma yok, kalp hiçbir ekranda taşmaz
- Harici kütüphane, font, CDN veya analytics yok — her şey kendi sunucundan gelir
- `prefers-reduced-motion` desteği
- Metin/emoji bağımlılığı yok; kalp SVG ile çizilir (encoding sorunu olmaz)
- Çerez, form, kişisel veri toplama **yok**

---

## Kurulum

Bilgisayarında Python 3.9+ olmalı. Terminalde:

```bash
git clone https://github.com/KULLANICI_ADIN/REPO_ADIN.git
cd REPO_ADIN/love-heart

python3 -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate

pip install -r requirements.txt
```

---

## Lokal Çalıştırma

```bash
python3 app.py
```

Tarayıcıda aç: <http://127.0.0.1:5000>

Production/deploy komutu (hosting bunu kendi çalıştırır):

```bash
gunicorn app:app --bind 0.0.0.0:$PORT
```

> **Not:** `127.0.0.1` yalnızca senin bilgisayarında çalışır. Sevgiline
> göndereceğin link için [deployment](#ücretsiz-deployment-render) adımlarını
> uygula.

Aynı Wi-Fi ağındaki telefonunda denemek istersen `python3 app.py` çalışırken
bilgisayarının yerel IP'sini kullan: `http://192.168.x.x:5000`

---

## Kişiselleştirme (config.json)

Tek dosya: `love-heart/config.json`

```json
{
  "heart_color": "#ff2e63",
  "secondary_color": "#ff9dbb",
  "background_color": "#120912",
  "page_title": "❤"
}
```

| Alan | Ne işe yarar |
|------|--------------|
| `heart_color` | Kalbin ana rengi |
| `secondary_color` | Kalbin açık tonu (üstteki parlaklık) |
| `background_color` | Arka planın koyu rengi (gradient ve glow bundan türetilir) |
| `page_title` | Yalnızca tarayıcı sekmesinin başlığı; sayfada görünmez |

Kaydettikten sonra sayfayı yenilemen yeterli — sunucuyu yeniden başlatmana
gerek yok. (Deploy ettiysen değişikliği GitHub'a push et, hosting otomatik
günceller.)

Dosyayı bozsan, bir alanı silsen, hatta `config.json`'u tamamen silsen bile
site çökmez; varsayılan renklerle açılır. Renk alanına geçersiz bir değer
yazarsan o alan sessizce varsayılana döner.

Örnek alternatif paletler:

```json
{ "heart_color": "#e63946", "secondary_color": "#ffb3ba", "background_color": "#0d0a0f" }
{ "heart_color": "#ff5f9e", "secondary_color": "#ffd1e8", "background_color": "#160a1c" }
```

---

## GitHub'a Yükleme

1. GitHub'da yeni bir repo aç (örn. `love-heart`). Public olabilir; site
   arama motorlarına kapalıdır (`noindex`).
2. Terminalde:

```bash
cd love-heart
git init
git add .
git commit -m "Tek kalp sitesi"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADIN/REPO_ADIN.git
git push -u origin main
```

`.gitignore` hazır: `.venv`, `__pycache__`, `.env` gibi dosyalar GitHub'a
gitmez. Bu projede hiçbir API key veya şifre yok.

---

## Ücretsiz Deployment (Render)

Flask için en kolay ücretsiz seçenek **Render**. Kredi kartı istemez ve
otomatik HTTPS verir.

1. <https://render.com> adresine gir, **GitHub ile giriş yap**.
2. **New → Web Service** de.
3. Az önce push ettiğin repoyu seç, **Connect**.
4. Ayarlar:

   | Ayar | Değer |
   |------|-------|
   | Name | `benim-kalbim` (link bu isimden oluşur) |
   | Language / Runtime | `Python 3` |
   | Root Directory | `love-heart` (proje repo kökündeyse boş bırak) |
   | Build Command | `pip install -r requirements.txt` |
   | Start Command | `gunicorn app:app --bind 0.0.0.0:$PORT` |
   | Instance Type | `Free` |

5. **Create Web Service** de, 2–3 dakika bekle.
6. Logda `Your service is live` yazınca hazır.

> Repo kökünde hazır bir `render.yaml` var. Render'da **New → Blueprint**
> seçip repoyu bağlarsan bu ayarlar otomatik gelir.

**Alternatifler:** Railway, Fly.io, Koyeb, PythonAnywhere — hepsinde başlangıç
komutu `gunicorn app:app` olur.

### Ücretsiz plan hakkında tek bilinmesi gereken

Render'ın ücretsiz planında site ~15 dakika ziyaretçi almazsa uykuya geçer.
İlk açılış 30–50 saniye sürebilir, sonrası anında açılır. Linki göndermeden
hemen önce sen bir kez açarsan site uyanmış olur.

---

## Public Link Alma ve Gönderme

Deploy bitince Render sayfanın üstünde linkin görünür:

```
https://benim-kalbim.onrender.com
```

- Link **HTTPS**'tir, tarayıcıda güvenli bağlantı görünür.
- WhatsApp / Instagram / mesaj ile gönder.
- Karşı tarafın hiçbir şey kurmasına gerek yok: Python yok, Termux yok,
  uygulama yok. Telefonda linke tıklar, kalp açılır.

---

## Sorun Giderme

**Deploy başarısız / "ModuleNotFoundError: No module named 'app'"**
Root Directory ayarını `love-heart` yap (`app.py` orada).

**"Application failed to respond"**
Start Command tam olarak: `gunicorn app:app --bind 0.0.0.0:$PORT`

**Renk değişikliği görünmüyor**
Değişikliği GitHub'a push ettin mi? Tarayıcıda sayfayı sert yenile.

**Kalp görünmüyor / sayfa boş**
Tarayıcıyı güncelle. Site Chrome, Safari, Firefox ve Samsung Internet'in
güncel sürümlerinde çalışır.

**Kalp atmıyor**
Telefonun ayarlarında "hareketi azalt / animasyonları kapat" açıksa site
bunu bilerek dikkate alır ve kalp sabit durur; dokununca yine atar.

**İlk açılış çok yavaş**
Ücretsiz plan uyku modu (yukarıya bak). Normaldir.

---

Sevgiyle hazırlandı.
