# ❤️ Sevgiliye Özel Kalp Sitesi

Ekranın tam ortasında atan tek bir büyük kalp. Kalbe dokununca kalp güçlüce atar
ve çevresinden küçük kalpler yayılıp yukarı süzülür. Başka hiçbir şey yok:
menü yok, galeri yok, müzik yok, veritabanı yok.

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

- Tek büyük SVG kalp: sürekli "lub-dub" kalp atışı, yumuşak glow ve gölge
- Dokununca: güçlü atış + çevreye yayılıp yukarı süzülen ve solan küçük kalpler
- Arka planda çok hafif, yavaş hareket eden parçacıklar (tek `<canvas>`)
- Koyu, romantik gradient arka plan
- Mobil öncelikli: 360px'den masaüstüne kadar taşma yok, kalp her zaman ortada
- Harici kütüphane, font veya CDN yok — her şey kendi sunucusundan gelir
- `prefers-reduced-motion` desteği (animasyon istemeyen kullanıcılar için)
- Sekme arka plana alınınca animasyon durur (pil dostu)
- Metin `config.json` üzerinden değiştirilir
- Takip kodu, analytics, çerez, form, kişisel veri toplama **yok**

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
gunicorn app:app
```

> **Not:** `127.0.0.1` yalnızca senin bilgisayarında çalışır. Sevgiline
> göndereceğin link için aşağıdaki [deployment](#ücretsiz-deployment-render)
> adımlarını uygula.

Aynı Wi-Fi ağındaki telefonunda denemek istersen `python3 app.py` çalışırken
bilgisayarının yerel IP'sini kullan: `http://192.168.x.x:5000`

---

## Kişiselleştirme (config.json)

Tek dosya: `love-heart/config.json`

```json
{
  "message": "Seni seviyorum ❤️",
  "hint": "Kalbe dokun ❤️",
  "page_title": "Seni seviyorum ❤️",
  "heart_color": "#ff3d73",
  "secondary_color": "#ff9dbb",
  "background_color": "#120912"
}
```

| Alan | Ne işe yarar |
|------|--------------|
| `message` | Kalbin altındaki ana yazı |
| `hint` | Kalbin altındaki küçük ipucu; ilk dokunuşta kaybolur |
| `page_title` | Tarayıcı sekmesinde ve link paylaşınca görünen başlık |
| `heart_color` | Kalbin ana rengi |
| `secondary_color` | Kalbin açık tonu (üst parlaklık ve yayılan küçük kalpler) |
| `background_color` | Arka planın koyu rengi (gradient bundan türetilir) |

Değiştirip kaydettikten sonra sayfayı yenilemen yeterli — sunucuyu yeniden
başlatmana gerek yok. (Deploy ettiysen değişikliği GitHub'a push et, hosting
otomatik günceller.)

Bir alanı silsen, dosyayı bozsan, hatta tamamen silsen bile site çökmez;
varsayılan değerlerle açılmaya devam eder. Renk alanına geçersiz bir değer
yazarsan o alan sessizce varsayılana döner.

**Emoji ekleme:** Yazıya doğrudan ❤️ 🥰 ✨ gibi emojiler yazabilirsin.

---

## GitHub'a Yükleme

1. GitHub'da yeni bir repo aç (isim önemli değil, örn. `love-heart`).
   Repo **public** olabilir; site zaten sadece linki bilenler tarafından açılır
   ve arama motorlarına kapalıdır (`noindex`).
2. Terminalde:

```bash
cd love-heart
git init
git add .
git commit -m "Sevgilime özel kalp sitesi"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADIN/REPO_ADIN.git
git push -u origin main
```

`.gitignore` hazır: `.venv`, `__pycache__`, `.env` gibi dosyalar GitHub'a
gitmez. Bu projede hiçbir API key veya şifre yok.

---

## Ücretsiz Deployment (Render)

Flask için en kolay ücretsiz seçenek **Render**. Kredi kartı istemez ve
otomatik olarak HTTPS verir.

1. <https://render.com> adresine gir, **GitHub ile giriş yap**.
2. **New → Web Service** de.
3. Az önce push ettiğin repoyu seç, **Connect**.
4. Ayarları şöyle doldur:

   | Ayar | Değer |
   |------|-------|
   | Name | `benim-romantik-sitem` (link bu isimden oluşur) |
   | Language / Runtime | `Python 3` |
   | Root Directory | `love-heart` (proje repo kökündeyse boş bırak) |
   | Build Command | `pip install -r requirements.txt` |
   | Start Command | `gunicorn app:app --bind 0.0.0.0:$PORT` |
   | Instance Type | `Free` |

5. **Create Web Service** de ve 2–3 dakika bekle.
6. Log ekranında `Your service is live 🎉` yazınca hazır.

> Repo kökünde hazır bir `render.yaml` var. Render'da
> **New → Blueprint** seçip repoyu bağlarsan yukarıdaki ayarlar otomatik gelir.

**Alternatifler:** Railway, Fly.io, PythonAnywhere ve Koyeb de aynı projeyi
çalıştırır — hepsinde başlangıç komutu `gunicorn app:app` olur.

### Ücretsiz plan hakkında bilinmesi gereken tek şey

Render'ın ücretsiz planında site ~15 dakika ziyaretçi almazsa uykuya geçer.
Sevgilin linke tıkladığında **ilk açılış 30–50 saniye sürebilir**, sonrası
anında açılır. Bunu istemiyorsan linki göndermeden hemen önce sen bir kez aç,
site uyanmış olsun.

---

## Public Link Alma ve Gönderme

Deploy bitince Render sayfanın en üstünde linkin görünür:

```
https://benim-romantik-sitem.onrender.com
```

- Bu link **HTTPS**'tir, tarayıcıda güvenli bağlantı görünür.
- Linki WhatsApp / Instagram / mesaj ile gönder.
- Karşı tarafın **hiçbir şey kurmasına gerek yok**: Python yok, Termux yok,
  uygulama yok. Telefonda linke tıklar, site açılır.
- Göndermeden önce linki kendi telefonunda bir kez açıp test et.

---

## Sorun Giderme

**Deploy başarısız oldu / "ModuleNotFoundError: No module named 'app'"**
Root Directory ayarını `love-heart` yaptığından emin ol (`app.py` orada).

**"Application failed to respond" / port hatası**
Start Command tam olarak şu olmalı:
`gunicorn app:app --bind 0.0.0.0:$PORT`

**Site açılıyor ama yazı eski**
Değişikliği GitHub'a push ettin mi? Render son commit'i deploy eder.
Tarayıcıda sayfayı sert yenile (mobilde sekmeyi kapatıp tekrar aç).

**Kalp görünmüyor / sayfa bomboş**
Tarayıcıyı güncelle. Site Chrome, Safari, Firefox ve Samsung Internet'in
güncel sürümlerinde çalışır.

**Türkçe karakterler bozuk görünüyor**
`config.json` dosyasını **UTF-8** olarak kaydet (Not Defteri'nde
"Farklı Kaydet → Kodlama: UTF-8").

**Animasyon telefonda takılıyor**
Telefonda "pil tasarrufu" modu açıksa tarayıcı animasyonları kısar; kapatıp
dene. Ayrıca telefonun ayarlarında "hareketi azalt" açıksa site bunu bilerek
sade moda geçer.

**İlk açılış çok yavaş**
Ücretsiz plan uyku modu (yukarıya bak). Normaldir.

---

Sevgiyle hazırlandı. ❤️
