# Günlük YouTube Otomasyonu

Google Drive'daki bir klasöre video atarsınız, sistem **her gün otomatik olarak
sıradaki videoyu YouTube kanalınıza yükler**. GitHub Actions üzerinde çalışır,
sunucuya veya bilgisayarınızın açık olmasına gerek yoktur.

```
Drive klasörü  ──►  GitHub Actions (her gün 09:00)  ──►  YouTube kanalınız
   video.mp4              indir → yükle → kaydet            yayında
```

---

## ⚠️ Önce bunu okuyun: YouTube'un API doğrulama kuralı

YouTube, **doğrulanmamış (audit edilmemiş) API projelerinden yüklenen videoları
zorla `private` yapar** — kodda `public` yazsanız bile. Bu YouTube'un
politikasıdır, bu projenin sınırı değildir.

Yani:

| Durum | Sonuç |
|---|---|
| Projeniz denetimden geçmemiş | Videolar **private** yüklenir, sadece siz görürsünüz. YouTube Studio'dan elle "Herkese açık" yapabilirsiniz. |
| Projeniz denetimden geçmiş | Videolar doğrudan **herkese açık** yayınlanır. |

Denetim başvurusu ücretsizdir ve [YouTube API Services Audit
formundan](https://support.google.com/youtube/contact/yt_api_form) yapılır;
Google'ın dönüşü genelde birkaç hafta sürer.

**Pratik öneri:** kuruluma hemen başlayın. Denetim onayı gelene kadar videolar
private yüklenecek — otomasyon yine her gün çalışır, siz sadece Studio'dan tek
tıkla yayına alırsınız. Onay geldiğinde hiçbir şeyi değiştirmenize gerek kalmaz.

---

## Kurulum (tek seferlik, ~20 dakika)

### 1. Google Cloud projesi ve API'ler

1. [Google Cloud Console](https://console.cloud.google.com/)'a girin, yeni bir proje oluşturun.
2. **API'ler ve Hizmetler → Kitaplık** bölümünden şu ikisini etkinleştirin:
   - `YouTube Data API v3`
   - `Google Drive API`

### 2. OAuth izin ekranı

1. **API'ler ve Hizmetler → OAuth izin ekranı**
2. Kullanıcı türü: **Harici (External)**
3. Uygulama adı, destek e-postası ve geliştirici e-postasını doldurun.
4. Kapsamlar (scopes) adımını boş geçebilirsiniz — yetkileri script isteyecek.
5. **Yayınlama durumunu "Üretim" (In production) yapın.**

> **Bu adımı atlamayın.** Uygulama "Test" durumunda kalırsa Google'ın verdiği
> refresh token **7 günde bir geçersiz olur** ve otomasyon durur. "Üretim"
> durumunda token süresiz geçerlidir. ("Doğrulanmamış uygulama" uyarısı
> görebilirsiniz; kendi hesabınız için "Gelişmiş → Devam et" diyebilirsiniz.)

### 3. OAuth istemcisi oluşturun

1. **API'ler ve Hizmetler → Kimlik Bilgileri → Kimlik bilgisi oluştur → OAuth istemci kimliği**
2. Uygulama türü: **Masaüstü uygulaması**
3. Oluşan istemciyi indirin, dosyayı `client_secret.json` adıyla bu reponun kökünde saklayın.

### 4. Refresh token üretin (kendi bilgisayarınızda)

```bash
git clone <bu-repo>
cd cumaaa
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

python scripts/get_refresh_token.py --client-secrets client_secret.json
```

Tarayıcı açılır, **videoların yükleneceği YouTube kanalının sahibi olan Google
hesabıyla** giriş yapıp izin verirsiniz. Script ekrana üç değer yazdırır.

> Videoyu yükleme sonrası Drive'da "bitti" klasörüne taşımak istiyorsanız
> `--drive-access full` ekleyin (daha geniş Drive yetkisi ister).

> `client_secret.json` dosyasını **repoya eklemeyin** — `.gitignore` bunu zaten
> engelliyor.

### 5. Drive klasörünü hazırlayın

1. Google Drive'da bir klasör açın (ör. "YouTube Kuyruk").
2. Klasörü açtığınızda adres çubuğundaki `.../folders/` sonrası kısım klasör ID'sidir:
   `https://drive.google.com/drive/folders/`**`1AbCdEfGhIjKlMnOp`**
3. Videolarınızı bu klasöre atın.

### 6. GitHub secret'larını ekleyin

Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret adı | Değer |
|---|---|
| `GOOGLE_CLIENT_ID` | script'in yazdırdığı değer |
| `GOOGLE_CLIENT_SECRET` | script'in yazdırdığı değer |
| `GOOGLE_REFRESH_TOKEN` | script'in yazdırdığı değer |
| `DRIVE_FOLDER_ID` | 5. adımdaki klasör ID'si |
| `DRIVE_DONE_FOLDER_ID` | (opsiyonel) yüklenenlerin taşınacağı klasör ID'si |

### 7. `main` dalına alın

**Zamanlanmış iş akışları GitHub'da yalnızca varsayılan dalda (`main`) çalışır.**
Bu dal `main`'e birleştirilene kadar günlük tetikleme çalışmaz.

### 8. Deneme çalıştırması

Repo → **Actions → "Günlük YouTube yüklemesi" → Run workflow**, `dry_run`
kutusunu işaretleyip çalıştırın. Hiçbir şey yüklenmez; sırada hangi videonun
olduğunu ve hangi başlıkla yükleneceğini gösterir. Sonuç, çalıştırma özetinde
görünür.

Her şey doğruysa `dry_run` işaretini kaldırıp gerçek bir yükleme deneyin.

---

## Günlük kullanım

Kurulumdan sonra tek yapmanız gereken **Drive klasörüne video atmak.**
Her gün Türkiye saatiyle 09:00'da sıradaki video yüklenir.

Kaç günlük içeriğiniz kaldığını görmek için: klasördeki video sayısı eksi
`state/uploaded.json` içindeki kayıt sayısı. Klasör boşalırsa otomasyon hata
vermez, "sırada yeni video yok" deyip geçer.

### Video başına başlık/açıklama vermek

Varsayılan olarak başlık dosya adından üretilir (`2026-08-07_ilk-video.mp4` →
"ilk video"). Özelleştirmek için videonun **yanına aynı adla** bir dosya koyun:

**`video.txt`** — ilk satır başlık, kalanı açıklama:

```
Bugünün Videosu: 5 Pratik İpucu

Bu videoda şunları anlatıyorum...
#ipucu #vlog
```

**`video.json`** — daha fazla kontrol:

```json
{
  "title": "Bugünün Videosu",
  "description": "Açıklama metni",
  "tags": ["vlog", "ipucu"],
  "privacy_status": "unlisted",
  "category_id": "27"
}
```

**`video.jpg`** — özel küçük resim (kanalınızın doğrulanmış olması gerekir;
değilse bu adım sessizce atlanır, video yine yüklenir).

### Ayarlar

`config.yaml` dosyasından değiştirebilirsiniz:

| Ayar | Anlamı | Varsayılan |
|---|---|---|
| `upload.videos_per_run` | Çalıştırma başına video sayısı | `1` |
| `upload.privacy_status` | `public` / `unlisted` / `private` | `public` |
| `upload.category_id` | YouTube kategorisi (22 = People & Blogs) | `"22"` |
| `upload.default_tags` | Her videoya eklenecek etiketler | `[]` |
| `upload.title_template` | `{name}` ve `{date}` kullanabilir | `"{name}"` |
| `drive.order` | Sıra: `created_time` / `modified_time` / `name` | `created_time` |

**Saati değiştirmek:** `.github/workflows/daily-upload.yml` içindeki cron
ifadesi **UTC**'dir. Türkiye saati = UTC + 3, yani `0 6 * * *` = 09:00.
Akşam 20:00 için `0 17 * * *` yazın.

---

## Yerel çalıştırma / geliştirme

```bash
source .venv/bin/activate
pip install -r requirements-dev.txt

export GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... GOOGLE_REFRESH_TOKEN=...
export DRIVE_FOLDER_ID=...
export PYTHONPATH=src

python -m youtube_daily.main --dry-run     # sırada ne var, göster
python -m youtube_daily.main               # sıradaki 1 videoyu yükle
python -m youtube_daily.main --count 3     # 3 video yükle
python -m youtube_daily.main --verbose     # ayrıntılı günlük

python -m pytest                           # testler
```

### Proje yapısı

| Dosya | İşi |
|---|---|
| `src/youtube_daily/main.py` | Akışı yürütür: listele → indir → yükle → kaydet |
| `src/youtube_daily/drive.py` | Drive: klasör listeleme, indirme, taşıma |
| `src/youtube_daily/youtube.py` | YouTube: parçalı yükleme, küçük resim |
| `src/youtube_daily/metadata.py` | Başlık/açıklama/etiket üretimi ve YouTube sınırları |
| `src/youtube_daily/state.py` | `state/uploaded.json` — hangi video yüklendi |
| `src/youtube_daily/retry.py` | Geçici hatalarda üstel geri çekilmeli tekrar deneme |
| `src/youtube_daily/config.py` | `config.yaml` + ortam değişkeni okuma |
| `scripts/get_refresh_token.py` | Tek seferlik OAuth token üretimi |

### Aynı video iki kez yüklenir mi?

Hayır. Her başarılı yüklemeden hemen sonra Drive dosya ID'si
`state/uploaded.json` dosyasına yazılır ve bu dosya repoya geri işlenir. Ayrıca
iş akışında `concurrency` grubu var, iki çalıştırma aynı anda çakışamaz.

Bir videoyu **kasten yeniden** yüklemek isterseniz ilgili satırı
`state/uploaded.json` içinden silin.

---

## Sorun giderme

| Belirti | Sebep / çözüm |
|---|---|
| `invalid_grant` hatası | Refresh token geçersiz olmuş. En sık sebebi OAuth ekranının "Test" durumunda kalması (7 günlük ömür). Ekranı "Üretim" yapıp 4. adımı tekrarlayın. |
| Video private yüklendi | YouTube API denetimi tamamlanmamış. Yukarıdaki uyarı bölümüne bakın. |
| `youtubeSignupRequired` | Giriş yaptığınız Google hesabına bağlı YouTube kanalı yok. |
| `quotaExceeded` | Günlük API kotası doldu (1 yükleme = 1600 birim, günlük kota 10.000). Ertesi gün kendiliğinden düzelir. |
| "Sırada yeni video yok" | Drive klasörü boş ya da tüm videolar yüklenmiş. Yeni video ekleyin. |
| Küçük resim ayarlanamadı | Kanalın doğrulanmış olması gerekir. Video yine yüklenir, bu adım atlanır. |
| İş akışı hiç tetiklenmiyor | Dal `main`'e birleştirilmemiş olabilir (7. adım). Ayrıca 60 gün hiç aktivite olmayan repolarda GitHub zamanlamayı durdurur. |

Bir çalıştırmanın ne yaptığını görmek için: **Actions → ilgili çalıştırma →**
adım günlükleri ve sayfanın altındaki özet tablosu.
