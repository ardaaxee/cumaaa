# InstaFlow

Instagram içerik üretimini, planlamasını, yayınlanmasını ve istatistik
toplamasını otomatikleştiren, Termux/Android üzerinde çalışacak biçimde
tasarlanmış bir sistem.

Tüm Instagram işlemleri **Meta'nın resmî Graph API'si** üzerinden yapılır.

---

## İçindekiler

1. [Ne yapar, ne yapmaz](#1-ne-yapar-ne-yapmaz)
2. [Kurulum](#2-kurulum)
3. [Termux kurulumu](#3-termux-kurulumu)
4. [Meta Developer hesabı ve API kurulumu](#4-meta-developer-hesabı-ve-api-kurulumu)
5. [Instagram hesabını bağlama](#5-instagram-hesabını-bağlama)
6. [Gerekli izinler](#6-gerekli-izinler)
7. [Uygulamayı çalıştırma](#7-uygulamayı-çalıştırma)
8. [Dashboard kullanımı](#8-dashboard-kullanımı)
9. [İçerik planlama](#9-i̇çerik-planlama)
10. [Medya: en önemli kısıt](#10-medya-en-önemli-kısıt)
11. [AI kurulumu](#11-ai-kurulumu)
12. [Analytics](#12-analytics)
13. [CLI komutları](#13-cli-komutları)
14. [JSON API](#14-json-api)
15. [Yedekleme](#15-yedekleme)
16. [Testler](#16-testler)
17. [Sorun giderme](#17-sorun-giderme)
18. [Güvenlik](#18-güvenlik)
19. [API limitleri](#19-api-limitleri)
20. [Mimari](#20-mimari)

---

## 1. Ne yapar, ne yapmaz

### Yapar

- İçerik taslakları oluşturur, düzenler, arşivler.
- İçerikleri belirli bir tarih ve saate planlar; zamanı gelince **resmî API
  ile** yayınlar.
- Görsel, Reels, carousel ve hikâye yayınlar.
- Yayınlanan gönderilerin istatistiklerini çeker ve saklar.
- AI ile açıklama, başlık, hashtag, içerik fikri ve haftalık plan üretir
  (üretilenler **her zaman taslak** olarak kaydedilir, otomatik yayınlanmaz).
- Mobil uyumlu bir web paneli ve tam bir CLI sunar.

### Bilinçli olarak yapmaz

Bunlar eksik özellik değil, tasarım kararıdır:

- **Kullanıcı adı/parola ile giriş yapmaz.** Parola istemez, saklamaz.
- **Çerez/oturum taşımaz**, tarayıcı oturumu taklit etmez.
- **Web arayüzünü scrape etmez**, Instagram web sitesini otomatikleştirmez.
- **CAPTCHA, rate-limit veya platform güvenliklerini aşmaya çalışmaz.**
- **Takipçi botu, otomatik takip/takipten çıkma, toplu DM, yorum spamı veya
  sahte etkileşim üretmez.**

Bir özellik resmî API ile mümkün değilse, sistem bunu uydurmak yerine açıkça
söyler: *"Bu özellik mevcut API izinleriyle desteklenmiyor."*

---

## 2. Kurulum

### Gereksinimler

- Python 3.10+ (Termux'ta **3.13 önerilir**, bkz. bölüm [3](#3-termux-kurulumu))
- ~60 MB disk (bağımlılıklar dâhil)
- İnternet bağlantısı

### Tek komutla kurulum

```bash
cd instaflow
bash install.sh
```

`install.sh` şunları yapar:

1. Python ve pip sürümünü kontrol eder.
2. `.venv/` sanal ortamını oluşturur.
3. `requirements.txt` bağımlılıklarını kurar.
4. `.env.example` dosyasını `.env` olarak kopyalar (varsa dokunmaz).
5. Çalışma dizinlerini ve veritabanını hazırlar.
6. `python run.py doctor` ile eksikleri listeler.

**Kurulum betiği hiçbir API anahtarı üretmez veya tahmin etmez.** Gizli
değerleri `.env` dosyasına siz girersiniz.

### Elle kurulum

```bash
cd instaflow

python3 -m venv .venv
source .venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt

cp .env.example .env
chmod 600 .env
nano .env               # değerleri girin

python run.py init      # veritabanını oluştur
python run.py status    # durumu gör
```

---

## 3. Termux kurulumu

InstaFlow, **proot/Ubuntu gerektirmeden** doğrudan Termux'un kendi Python'ı
ile çalışacak biçimde yazıldı. Bağımlılıkların 37'sinden 33'ü saf Python'dur.

### Önce bilinmesi gereken: Termux'ta wheel meselesi

Android **Bionic libc** kullanır. PyPI'daki hazır wheel'ler ise `manylinux`
(glibc) veya `musllinux` (musl) içindir — **hiçbiri Termux'ta çalışmaz**. Bu
yüzden derlenmiş uzantısı olan paketleri pip kaynak koddan derlemek zorunda
kalır.

InstaFlow'un bağımlılıklarında durum şöyledir:

| Paket | Durum Termux'ta |
|-------|-----------------|
| 33 paket (fastapi, starlette, uvicorn, httpx, typer, rich, apscheduler, pydantic-settings …) | Saf Python — sorunsuz |
| **SQLAlchemy** | `py3-none-any` wheel'i var, otomatik saf Python'a düşer — sorunsuz |
| **MarkupSafe**, **greenlet** | C uzantısı — `clang` ile derlenir, hızlı |
| **pydantic-core** | **Rust/PyO3 — tek gerçek engel** |

`pydantic-core`'un **hiçbir sürümünün** Android wheel'i yoktur (PyPI'da
yalnızca manylinux/musllinux vardır). Yani pydantic sürümünü düşürmek bu
sorunu çözmez; çözüm derlemek ya da Termux/topluluk deposundan kurmaktır.

### Kurulum

```bash
pkg update && pkg upgrade
pkg install python python-pip git clang binutils

# Depoyu alın
git clone <depo-adresi>
cd cumaaa/instaflow

bash install.sh
```

`install.sh` Termux'u kendi algılar ve `ANDROID_API_LEVEL` değişkenini
cihazınızdan okuyup ayarlar — PyO3'ün
`"Failed to determine Android API level"` hatası bu yüzden oluşur ve böylece
önlenir.

### pydantic-core kurulamazsa

`install.sh` başarısız olursa size seçenekleri listeler. Sırayla:

**1) Termux'un kendi deposu** — varsa en temiz yol:

```bash
pkg install python-pydantic
```

**2) Kaynaktan derleme** — Rust gerekir, telefonda 10–20 dakika sürer ve
bol RAM ister:

```bash
pkg install rust binutils
export ANDROID_API_LEVEL=$(getprop ro.build.version.sdk)
pip install -r requirements.txt
```

**3) Hazır topluluk wheel'i** — Python **3.13 ve altı** için derlenmiş
wheel'ler vardır (Python 3.14 için **henüz yoktur**):

```bash
INSTAFLOW_EXTRA_INDEX_URL=https://eutalix.github.io/android-pydantic-core/ \
  bash install.sh
```

> Bu **üçüncü taraf** bir depodur, Meta/PyPI/InstaFlow ile ilgisi yoktur.
> Bu yüzden otomatik olarak eklenmez; eklemek sizin kararınızdır. Ne
> kurduğunuzu bilerek kullanın.

**4) Telefonda derlemek istemiyorsanız** InstaFlow'u bir PC veya sunucuda
çalıştırıp panele telefon tarayıcısından bağlanın.

`greenlet` derlenemezse: SQLAlchemy onu yalnızca **async** kullanım için
ister, InstaFlow ise tamamen senkron çalışır. `pkg install clang` sonrası
tekrar deneyin.

### Python sürümü: 3.13 mü, 3.14 mü?

| Sürüm | Termux'ta durum |
|-------|-----------------|
| **3.13 (önerilen)** | Hazır topluluk wheel'i mevcut → pydantic-core derlemeden kurulur |
| 3.12 ve altı | Çalışır; topluluk wheel'i 3.9'a kadar mevcut |
| 3.14 | Çalışır, ama pydantic-core'u **kaynaktan derlemeniz** gerekir |

Kod tarafında InstaFlow Python 3.10+ ile çalışır ve 3.14 ile bir sorunu
yoktur; mesele yalnızca hazır wheel bulunabilirliğidir. Termux'un Python
sürümünü zorla değiştirmeyin — `pkg install python` sistem genelinde
sürümü değiştirir ve başka araçlarınızı kırabilir. 3.14'te kalıp bir kez
derlemek de tamamen geçerli bir tercihtir.

### Telefon uykuya geçince durmasın

Termux'un arka planda öldürülmesini engellemek için:

```bash
pkg install termux-services
termux-wake-lock
```

`termux-wake-lock` çalışırken Android, Termux'u uyutmaz. Bitirince
`termux-wake-unlock`.

### Arka planda çalıştırma

```bash
./scripts/start.sh --daemon    # arka planda başlat
./scripts/stop.sh              # durdur
```

Loglar: `logs/server.log` (sunucu) ve `logs/app.log` (uygulama).

### Termux kapanıp açıldığında

Termux kapandığında süreç de kapanır. Yeniden başlatmak için:

```bash
cd ~/cumaaa/instaflow
./scripts/start.sh --daemon
```

Bunu otomatikleştirmek isterseniz Termux'un boot eklentisini kullanın:

```bash
# Termux:Boot uygulamasını F-Droid'den kurun, sonra:
mkdir -p ~/.termux/boot
cat > ~/.termux/boot/instaflow <<'EOF'
#!/data/data/com.termux/files/usr/bin/sh
termux-wake-lock
cd ~/cumaaa/instaflow
./scripts/start.sh --daemon
EOF
chmod +x ~/.termux/boot/instaflow
```

### Telefondan panele erişim

Varsayılan olarak sunucu yalnızca `127.0.0.1` üzerinde dinler. Telefonun
tarayıcısından `http://127.0.0.1:8000/dashboard` adresine girin.

Aynı ağdaki başka bir cihazdan erişmek **önerilmez**: panelde giriş ekranı
yoktur, dolayısıyla `HOST=0.0.0.0` yaptığınızda ağdaki herkes içeriklerinizi
görebilir ve hesabınızdan gönderi yayınlayabilir. Ayrıntı için
[Güvenlik](#18-güvenlik) bölümüne bakın.

---

## 4. Meta Developer hesabı ve API kurulumu

Instagram içerik yayınlamak için bir Meta uygulaması gerekir.

### 4.1. Hesap türünü hazırlayın

Instagram hesabınız **Professional** (Business veya Creator) olmalıdır.
Kişisel hesaplar Content Publishing API'yi kullanamaz.

Instagram uygulaması → Ayarlar → Hesap türü ve araçlar → Profesyonel hesaba geç.

### 4.2. Meta uygulaması oluşturun

1. <https://developers.facebook.com> adresine gidin, geliştirici hesabı açın.
2. **My Apps → Create App** ile yeni bir uygulama oluşturun.
3. Uygulamaya Instagram ürününü ekleyin.

Bundan sonrası seçtiğiniz **giriş kipine** göre değişir:

### Kip A — Instagram Login (önerilen, daha basit)

`INSTAGRAM_LOGIN_MODE=instagram`

- Facebook sayfası **gerekmez**.
- Çağrılar `graph.instagram.com` adresine gider.
- Uygulamada "Instagram API setup with Instagram login" akışını seçin.
- **Instagram app ID** ve **Instagram app secret** değerlerini alın; bunları
  `.env` içinde `META_APP_ID` ve `META_APP_SECRET` olarak kullanın.

### Kip B — Facebook Login

`INSTAGRAM_LOGIN_MODE=facebook`

- Instagram hesabınız bir **Facebook sayfasına bağlı** olmalıdır.
- Çağrılar `graph.facebook.com` adresine gider.
- Uygulamaya "Facebook Login for Business" ürününü ekleyin.
- **App ID** ve **App Secret** değerlerini `.env` içine yazın.

### 4.3. Yönlendirme adresini kaydedin

Uygulama ayarlarında **Valid OAuth Redirect URI** listesine, `.env`
içindeki `OAUTH_REDIRECT_URI` ile **birebir aynı** adresi ekleyin:

```
http://localhost:8000/oauth/callback
```

> Meta çoğu durumda HTTPS ister. Yerel geliştirmede `localhost` genellikle
> kabul edilir; edilmezse bir tünel (ör. `ssh -R`, Cloudflare Tunnel)
> kurup HTTPS adresini hem `.env` içine hem Meta paneline yazın.

### 4.4. .env dosyasını doldurun

```bash
INSTAGRAM_LOGIN_MODE=instagram
INSTAGRAM_API_VERSION=v25.0
META_APP_ID=<uygulama kimliğiniz>
META_APP_SECRET=<uygulama sırrınız>
OAUTH_REDIRECT_URI=http://localhost:8000/oauth/callback
SECRET_KEY=<python -c "import secrets; print(secrets.token_urlsafe(32))">
```

> **API sürümü hakkında:** Meta, Graph API'yi düzenli olarak sürümler ve her
> sürümü yaklaşık iki yıl sonra kapatır. Ağustos 2026 itibarıyla en yeni
> sürüm **v26.0**'dır; varsayılan olarak daha oturmuş bir sürüm kullanılır.
> Sürüm `.env` üzerinden değiştirilebilir; kodda hiçbir yere gömülmemiştir.
> Meta'nın davranışı bu belgede anlatılandan farklıysa, güncel olan Meta'nın
> belgeleridir — yapılandırmayı ona göre ayarlayın.

---

## 5. Instagram hesabını bağlama

### Yol 1 — Panel üzerinden OAuth (önerilen)

```bash
python run.py start
```

Tarayıcıdan `http://127.0.0.1:8000/settings` → **"Instagram hesabı bağla"**.

Akış şöyle işler:

1. Meta'nın yetkilendirme sayfasına yönlendirilirsiniz.
2. İzinleri onaylarsınız.
3. Uygulamaya bir yetkilendirme kodu ile dönersiniz.
4. InstaFlow bu kodu önce kısa ömürlü, sonra **60 günlük uzun ömürlü**
   token'a çevirir ve veritabanına yazar.

Token hiçbir zaman ekranda gösterilmez; ayarlar sayfasında yalnızca
maskelenmiş hâli (`ABCD…WXYZ`) görünür.

### Yol 2 — Token'ı elle girme

Zaten uzun ömürlü bir token'ınız varsa:

```bash
# .env
INSTAGRAM_ACCESS_TOKEN=<uzun ömürlü token>
INSTAGRAM_USER_ID=<Instagram Professional hesap kimliği>
```

Doğrulayın:

```bash
python run.py instagram-test
```

### Token yenileme

Uzun ömürlü token 60 gün geçerlidir ve **kendiliğinden yenilenmez**.
InstaFlow her gün token bitişini kontrol eder ve son 10 güne girildiğinde
otomatik yeniler (`instagram` kipinde).

`facebook` kipinde kullanıcı token'ı bu şekilde yenilenemez; süresi dolmadan
yeniden yetkilendirme yapmanız gerekir. Sistem bunu size açıkça söyler.

---

## 6. Gerekli izinler

### Instagram Login kipi

| İzin | Ne için |
|------|---------|
| `instagram_business_basic` | Hesap bilgilerini okumak |
| `instagram_business_content_publish` | Gönderi yayınlamak |
| `instagram_business_manage_insights` | İstatistik okumak |

> Meta, 27 Ocak 2025'te eski `business_*` kapsam adlarını kaldırdı. Yukarıdaki
> adlar güncel olanlardır.

### Facebook Login kipi

| İzin | Ne için |
|------|---------|
| `instagram_basic` | Hesap bilgilerini okumak |
| `instagram_content_publish` | Gönderi yayınlamak |
| `instagram_manage_insights` | İstatistik okumak |
| `pages_show_list` | Bağlı sayfaları listelemek |
| `pages_read_engagement` | Sayfa–Instagram bağını okumak |
| `business_management` | İş hesabı erişimi |

İzin listesi `.env` içindeki `INSTAGRAM_SCOPES` / `FACEBOOK_SCOPES` ile
değiştirilebilir.

**Geliştirme kipinde** uygulamanız yalnızca uygulamaya eklenmiş test
kullanıcılarıyla çalışır. Başkalarının kullanması için Meta'dan **App
Review** almanız gerekir.

---

## 7. Uygulamayı çalıştırma

```bash
source .venv/bin/activate

python run.py start                 # ön planda
python run.py start --no-scheduler  # scheduler'sız (sadece panel)
python run.py stop                  # durdur
python run.py status                # durum
```

Termux için:

```bash
./scripts/start.sh            # ön planda
./scripts/start.sh --daemon   # arka planda
./scripts/stop.sh
```

Panel: <http://127.0.0.1:8000/dashboard>

Web sunucusu ve scheduler **aynı süreçte** çalışır — Termux'ta ikinci bir
süreç açmamak için bilinçli bir tercih. Ayırmak isterseniz:

```bash
RUN_SCHEDULER=0 python run.py start   # sadece panel
```

---

## 8. Dashboard kullanımı

| Sayfa | İçerik |
|-------|--------|
| `/dashboard` | Bağlantı durumu, bugün/yarın/bu hafta planı, sayaçlar, son gönderiler, son hatalar |
| `/content` | İçerik listesi, yeni içerik formu, AI üretimi, düzenleme, silme, anında yayın |
| `/calendar` | 30 günlük takvim, planlama ve plan iptali |
| `/analytics` | Toplam ve gönderi bazında metrikler, elle eşitleme |
| `/settings` | Bağlantı durumu, yapılandırma özeti, hangi `.env` değerlerinin tanımlı olduğu |

Arayüz mobil öncelikli tasarlandı: alt sekme çubuğu, tek sütun düzen, harici
font/CDN yok (çevrimdışı da düzgün görünür), koyu tema desteği.

---

## 9. İçerik planlama

### Panelden

1. `/content` sayfasından içerik oluşturun (taslak olarak kaydedilir).
2. `/calendar` sayfasında içeriği ve tarih/saati seçin, **Planla** deyin.
3. Scheduler her dakika kontrol eder; zamanı gelince yayınlar.

### CLI'dan

```bash
python run.py content-add "Sabah kahvesi" \
  --caption "Günün ilk demlemesi" \
  --hashtags "#kahve #sabah" \
  --media-url "https://ornek.com/kahve.jpg"

python run.py content-list
python run.py schedule 1 "2026-08-20 18:00"
python run.py cancel 1
python run.py publish 1          # hemen yayınla
```

Tarihler **yerel saat** olarak girilir (`.env` içindeki `TIMEZONE`).
Veritabanında her şey UTC saklanır, böylece yaz saati geçişlerinde
planlar kaymaz.

### Aynı gönderi iki kez yayınlanmaz

Üç katmanlı koruma vardır:

1. **Durum kilidi** — içerik tek bir `UPDATE ... WHERE status IN (...)` ile
   `publishing` durumuna geçirilir; ikinci çağrı 0 satır günceller ve atlanır.
2. **Benzersiz kısıt** — `published_posts` tablosunda hem `content_id` hem
   `ig_media_id` benzersizdir.
3. **Ön kontrol** — akışın başında zaten yayınlanmış içerik aranır.

Ayrıca planlama sırasında `idempotency_key` (içerik + dakika) üretilir; aynı
içerik için ikinci bir bekleyen plan oluşturulamaz.

İki scheduler aynı anda çalışsa bile durum kilidi SQLite'ın yazma kilidi
sayesinde yalnızca birine geçer: ikinci `UPDATE` 0 satır etkiler ve o süreç
işi atlar.

### Durum makinesi

```
draft ──┬──> scheduled ──┬──> publishing ──┬──> published   (uç durum)
        │                │                 └──> failed ──┐
        └────────────────┴──> publishing                 │
                     ▲                                   │
                     └───────────────────────────────────┘
                          (yeniden planlanabilir)
```

Geçişler kod tarafından doğrulanır: `published` uç durumdur, oradan geri
dönülemez ve bir içerik yayın akışını atlayarak `published` yapılamaz.
Geçersiz bir geçiş denemesi hata verir, sessizce geçmez.

### Yarıda kalan yayınlar

Termux kapanır ya da Android süreci öldürürse içerik `publishing` durumunda
kalabilir. Bu durumdaki içerikler hem uygulama açılışında hem her yayın
turunda kontrol edilir (`STALE_LOCK_MINUTES`, varsayılan 30 dakika):

- Instagram'da gönderi oluşmuşsa (`published_posts` kaydı varsa) içerik
  `published` yapılır — mükerrer yayın olmaz.
- Oluşmamışsa plan yeniden `pending` yapılır ve bir sonraki turda denenir.

### Başarısız yayınlar

Bir yayın başarısız olursa hata `logs/app.log` ve `logs` tablosuna yazılır.
İçerik `PUBLISH_MAX_ATTEMPTS` (varsayılan 3) kez denenir; hak bitince
`failed` durumuna geçer ve panelde hata mesajıyla görünür.

Yapılandırma hataları (ör. medya adresi yok) tekrar denenmez — her denemede
aynı sonucu vereceği için doğrudan `failed` yapılır.

---

## 10. Medya: en önemli kısıt

> **Instagram Content Publishing API, medyayı yalnızca herkese açık bir
> URL'den kendisi indirir. Uygulamadan doğrudan ikili dosya yüklenemez.**

Bu Meta'nın kısıtıdır, InstaFlow'un eksiği değildir. Pratikte iki seçeneğiniz
var:

**Seçenek 1 — Medyayı bir yerde barındırın (en basit).**
Görseli/videoyu herhangi bir yere yükleyin ve HTTPS adresini içeriğin
`media_url` alanına girin.

**Seçenek 2 — InstaFlow'u dışarıya açın.**
`.env` içinde `PUBLIC_BASE_URL` tanımlayın:

```bash
PUBLIC_BASE_URL=https://benim-tunelim.example
```

Bu tanımlıyken yüklediğiniz yerel dosyalar
`https://benim-tunelim.example/media/drafts/dosya.jpg` adresinden servis
edilir ve Meta oradan indirir.

`PUBLIC_BASE_URL` yoksa ve içerikte `media_url` de yoksa, yayın denemesi
şu mesajla başarısız olur ve içerik `failed` durumuna geçer (sonsuz yeniden
deneme yapılmaz):

> Instagram Content Publishing API medyayı yalnızca herkese açık bir URL'den
> indirir; yerel dosya doğrudan yüklenemez.

### `/media` ucu ne servis eder, ne servis etmez

Bu uç kimlik doğrulaması **istemez** — Meta'nın sunucuları anonim indirir,
istese çalışmazdı. Bu yüzden erişim yüzeyi bilinçli olarak dardır:

| Kural | Davranış |
|-------|----------|
| Adres biçimi | Yalnızca `/media/<alt-dizin>/<dosya>` |
| İzinli alt dizinler | `drafts`, `scheduled`, `published`, `failed` — başkası 404 |
| İzinli uzantılar | Yalnızca `ALLOWED_IMAGE_EXTENSIONS` + `ALLOWED_VIDEO_EXTENSIONS` |
| Content-Type | Uzantıdan sabit eşleme ile belirlenir, tahmin edilmez |
| Dizin listeleme | Yok — `/media/` ve `/media/drafts/` 404 döner |
| `../` ve kodlanmış varyantları | Yol `content/` içine sabitlenir, dışarısı 404 |
| Medya dışı dosyalar | Dizine düşmüş bir not, yedek veya veritabanı dosyası servis edilmez |

Tüm ret durumları aynı 404'ü döndürür; dosyanın var olup olmadığı belli
edilmez.

### Medya doğrulama

Yüklenen her dosya diske yazılmadan **önce** kontrol edilir:

- Uzantı beyaz listede mi (`.jpg`, `.jpeg` / `.mp4`, `.mov`)
- Dosyanın **gerçek içeriği** uzantısıyla uyuşuyor mu (magic byte kontrolü —
  `.jpg` uzantılı bir betik dosyası geçemez)
- MIME türü tutarlı mı
- Boyut sınırı aşılmış mı
- Dosya adı güvenli mi (Türkçe karakterler ASCII'ye indirgenir, yol
  bileşenleri atılır, path traversal engellenir)

> Meta'nın görsel yayın belgeleri **JPEG** ister; PNG genellikle reddedilir.
> Bu yüzden varsayılan uzantı listesinde PNG yoktur. Gerekirse
> `ALLOWED_IMAGE_EXTENSIONS` ile genişletebilirsiniz.

---

## 11. AI kurulumu

AI tamamen isteğe bağlıdır. Anahtar yoksa sistem **çökmez** — kural tabanlı
yerel üreticiye düşer ve size hangi kaynaktan üretildiğini söyler.

```
AIProvider
├── OpenAIProvider     — OpenAI ve OpenAI uyumlu yerel sunucular
├── AnthropicProvider  — Anthropic Messages API
└── LocalProvider      — ağ gerektirmeyen şablon üreticisi
```

### Yapılandırma

```bash
# .env
AI_PROVIDER=openai            # openai | anthropic | local | none

OPENAI_API_KEY=<anahtarınız>
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1   # yerel sunucu için değiştirin

# ya da
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=<anahtarınız>
ANTHROPIC_MODEL=claude-opus-5
```

### Özellikler

```bash
python run.py generate-caption "yeni teknoloji setup videom"
python run.py generate-caption "..." --variants 3     # varyasyonlar
python run.py generate-caption "..." --save           # taslak olarak kaydet
python run.py generate-hashtags "kahve demleme" --count 20
python run.py generate-ideas "kahve hesabı" --count 7 --save
python run.py generate-calendar "kahve hesabı" --days 7
```

Panelden: `/content` → **AI ile üret**.

**Üretilen hiçbir içerik otomatik yayınlanmaz.** Her zaman taslak olarak
kaydedilir; yayın kararı sizindir.

### Geri düşme (fallback)

AI servisi hata verirse, ağ kopuksa veya yanıt ayrıştırılamazsa sistem
sessizce yerel üreticiye düşer ve bunu bildirir:

```
Kaynak: local / rule-based (yerel üreticiye düşüldü)
```

---

## 12. Analytics

```bash
python run.py analytics --sync    # API'den çek ve göster
python run.py analytics           # kayıtlı veriyi göster
```

Panelden: `/analytics` → **Şimdi çek**. Ayrıca her gün otomatik çekilir
(`ANALYTICS_SYNC_HOUR`, UTC).

### Metrikler hakkında önemli not

Meta metrik setini sık değiştiriyor:

- **21 Nisan 2025'ten itibaren** `impressions`, `plays` ve `video_views`
  metrikleri **tüm API sürümlerinde** kaldırıldı; yerlerine tek bir `views`
  metriği geldi.
- Ocak 2025'te `profile_views`, `website_clicks`, `phone_call_clicks` gibi
  zaman serisi metrikleri kaldırıldı.

Bu yüzden istenen metrik listesi koda gömülmez, `.env` üzerinden yönetilir:

```bash
MEDIA_INSIGHT_METRICS=reach,likes,comments,saved,shares,views,total_interactions
ACCOUNT_INSIGHT_METRICS=reach,follower_count,views
```

Toplu istek reddedilirse metrikler tek tek denenir; böylece bir metriğin
desteklenmemesi diğerlerini götürmez.

**API'den alınamayan hiçbir veri uydurulmaz.** Desteklenmeyen metrikler
"desteklenmiyor" olarak raporlanır ve tabloda `—` görünür; sıfır yazılmaz,
çünkü "veri yok" ile "değer sıfır" farklı şeylerdir.

---

## 13. CLI komutları

| Komut | Ne yapar |
|-------|----------|
| `python run.py start` | Sunucu + scheduler başlatır |
| `python run.py stop` | Çalışan süreci durdurur |
| `python run.py status` | Sistem durumunu gösterir |
| `python run.py dashboard` | Sunucuyu başlatır ve panel adresini yazar |
| `python run.py instagram-test` | Bağlantıyı canlı olarak dener |
| `python run.py content-list` | İçerikleri listeler |
| `python run.py content-add "Başlık"` | Taslak içerik ekler |
| `python run.py schedule <id> "2026-08-20 18:00"` | İçeriği planlar |
| `python run.py cancel <id>` | Planı iptal eder |
| `python run.py publish <id>` | İçeriği hemen yayınlar |
| `python run.py publish-due` | Zamanı gelenleri işler |
| `python run.py generate-caption "..."` | Açıklama üretir |
| `python run.py generate-hashtags "..."` | Hashtag önerir |
| `python run.py generate-ideas "..."` | İçerik fikirleri üretir |
| `python run.py generate-calendar "..."` | Haftalık plan üretir |
| `python run.py analytics [--sync]` | İstatistikleri gösterir |
| `python run.py backup` | Yedek alır |
| `python run.py prune-logs` | Eski log kayıtlarını siler |
| `python run.py init` | Dizinleri ve veritabanını hazırlar |
| `python run.py doctor` | Kurulumu kontrol eder, eksikleri listeler |

Her komutun ayrıntısı için: `python run.py <komut> --help`

---

## 14. JSON API

Panelin kullandığı uçlar dışarıdan da çağrılabilir. Tüm yanıtlar aynı zarfı
kullanır:

```json
{ "success": true, "data": { }, "error": null, "meta": { } }
```

| Uç | Yöntem | Açıklama |
|----|--------|----------|
| `/api/status` | GET | Sistem durumu |
| `/api/config` | GET | Gizli olmayan yapılandırma özeti |
| `/api/content` | GET, POST | İçerik listesi / oluşturma |
| `/api/content/{id}` | GET, PATCH, DELETE | Tek içerik |
| `/api/content/{id}/schedule` | POST | Planla |
| `/api/content/{id}/cancel` | POST | Planı iptal et |
| `/api/content/{id}/publish` | POST | Hemen yayınla |
| `/api/analytics` | GET | Kayıtlı istatistikler |
| `/api/analytics/sync` | POST | API'den çek |
| `/api/ai/caption`, `/variants`, `/hashtags`, `/ideas`, `/calendar` | POST | AI üretimi |

Hiçbir uç token, parola veya API anahtarı döndürmez. `/api/config` yalnızca
hangi değerlerin **tanımlı olduğunu** bildirir, değerlerini değil.

> API dokümantasyonu (`/docs`) yalnızca `DEBUG=true` iken açıktır.

---

## 15. Yedekleme

```bash
python run.py backup                      # data/backups altına
python run.py backup --output-dir ~/storage/downloads
./scripts/backup.sh ~/storage/downloads   # Termux
```

Yedek `.tar.gz` içinde veritabanını (WAL yan dosyalarıyla birlikte) ve
`content/` dizinini taşır. Varsayılan olarak son 7 yedek saklanır.

Termux'ta telefon hafızasına yazmak için önce `termux-setup-storage`.

---

## 16. Testler

```bash
pip install -r requirements-dev.txt
python -m pytest
```

258 test, %90 kod kapsamı. Kapsanan alanlar:

- Yapılandırma ve veritabanı şeması/kısıtları
- Medya doğrulama (uzantı, magic byte, boyut, path traversal)
- Instagram istemcisi: başarı, 401/403, 429, 5xx, ağ hatası, yeniden deneme
  disiplini
- Yayın akışı: görsel, Reels, carousel, hikâye container parametreleri
- **Mükerrer yayın koruması**
- Scheduler: iş kaydı, tetikleyiciler, hata dayanıklılığı
- AI provider geri düşme (fallback)
- OAuth: `state` doğrulaması, tekrar saldırısı, hata yolları
- Web: CSRF (form ve API), XSS kaçışı, güvenlik başlıkları, gizli değer sızıntısı
- Güvenlik regresyonları: çapraz kaynaklı yazma, `/media` erişim yüzeyi,
  path traversal, durum makinesi, yarıda kalan yayın kurtarma, akış hâlinde
  yükleme sınırı, token maskeleme

**Testler gerçek bir Instagram hesabına hiçbir istek göndermez.** Tüm HTTP
çağrıları `httpx.MockTransport` ile karşılanır ve gerçek kimlik bilgileri
test ortamında bilinçli olarak silinir.

---

## 17. Sorun giderme

### "Instagram API credentials yapılandırılmamış."

`.env` içinde `INSTAGRAM_ACCESS_TOKEN` ve `INSTAGRAM_USER_ID` yok. Panelden
OAuth ile bağlanın veya değerleri elle girin.

### "Erişim token'ının süresi dolmuş."

Uzun ömürlü token 60 gün geçerlidir. `instagram` kipinde sistem otomatik
yeniler; yenileyemediyse `/settings` → **Instagram hesabı bağla** ile
yeniden yetkilendirin.

### "Instagram Content Publishing API medyayı yalnızca herkese açık bir URL'den indirir"

Bölüm [10](#10-medya-en-önemli-kısıt). Ya `media_url` girin ya
`PUBLIC_BASE_URL` tanımlayın.

### "Instagram medyayı işleyemedi"

Meta medyayı indirdi ama kabul etmedi. Sık nedenler:

- Görsel JPEG değil (PNG genelde reddedilir)
- En-boy oranı sınırların dışında (görsellerde 4:5 – 1.91:1)
- Video codec/format uyumsuz (H.264 + AAC, MP4/MOV)
- URL herkese açık değil (kimlik doğrulaması istiyor)

### "Instagram istek kotası aşıldı"

Bekleyin. Sistem 429'da **saldırgan yeniden deneme yapmaz**: en fazla
`RATE_LIMIT_MAX_RETRIES` kez, uzun bekleme ile dener. Meta `Retry-After`
verirse ona uyar.

### "Bu işlem için gerekli izin verilmemiş"

Meta uygulamanızda ilgili izin onaylanmamış. Bölüm [6](#6-gerekli-izinler).
Geliştirme kipinde uygulamaya test kullanıcısı olarak eklenmiş olmanız
gerekir.

### "state uyuşmuyor"

OAuth akışı yarıda kalmış veya çerez silinmiş. `/settings` sayfasından
akışı baştan başlatın.

### Scheduler çalışmıyor

```bash
python run.py status          # "Sunucu: çalışıyor" görmelisiniz
tail -f logs/app.log
```

`RUN_SCHEDULER=0` ile başlatılmış olabilir.

### "Failed to determine Android API level"

pydantic-core Rust ile derlenirken PyO3 hedef Android API seviyesini
bulamıyor. `install.sh` bunu kendiliğinden ayarlar; elle kuruyorsanız:

```bash
export ANDROID_API_LEVEL=$(getprop ro.build.version.sdk)
pip install -r requirements.txt
```

### Termux'ta paket kurulamıyor / derleme çok uzun sürüyor

Bölüm [3](#3-termux-kurulumu) → "pydantic-core kurulamazsa". Özetle:
`pkg install python-pydantic` deneyin, olmazsa `pkg install rust binutils`
ile derleyin, ya da Python 3.13 + hazır topluluk wheel deposunu kullanın.

### Saatler yanlış

`.env` içindeki `TIMEZONE` değerini kontrol edin (ör. `Europe/Istanbul`).
Termux'ta saat dilimi veritabanı eksikse `pkg install tzdata`. Zaman dilimi
bulunamazsa sistem UTC'ye düşer ve bunu loglar.

### Disk doldu

```bash
python run.py prune-logs --days 7
rm -f logs/app.log.*
```

---

## 18. Güvenlik

### Gizli değerler

- `.env` dosyası `.gitignore` içindedir ve asla depoya girmez.
- Token'lar yalnızca sunucu tarafında tutulur; hiçbir şablona, JSON yanıtına
  veya log satırına yazılmaz.
- Ayarlar sayfası yalnızca "tanımlı / eksik" bilgisini gösterir.
- Hesap token'ı arayüzde yalnızca maskeli görünür (`ABCD…WXYZ`).

Bir anahtar sızdıysa: Meta panelinden **App Secret'ı sıfırlayın**, token'ları
geçersiz kılın ve yeniden yetkilendirin.

### Uygulanan korumalar

| Alan | Nasıl |
|------|-------|
| SQL injection | Yalnızca parametreli SQLAlchemy sorguları; hiçbir yerde dize birleştirmeyle SQL kurulmaz |
| XSS | Jinja2 otomatik kaçış açık, `\|safe` kullanılmaz — AI çıktısı da aynı yoldan geçer |
| CSRF (form) | Durum değiştiren her form imzalı, oturuma bağlı, süreli token taşır |
| CSRF (API) | Durum değiştiren her istekte `Origin` başlığı varsa aynı kaynak olmak zorundadır; çapraz kaynaklı yazma 403 döner |
| OAuth CSRF | `state` parametresi üretilir, oturumda saklanır, tek kullanımlıktır |
| Path traversal | Tüm dosya yolları `content/` altına sabitlenir (`resolve_within`) |
| Arbitrary file access | `/media` yalnızca bilinen alt dizinlerden, yalnızca izinli uzantıları servis eder |
| Dosya yükleme | Uzantı + magic byte + MIME + boyut kontrolü; dosya parça parça yazılır, sınır aşılırsa yazma durur ve yarım dosya silinir |
| Secret sızıntısı | Token'lar yalnızca sunucuda; log ve hata metinlerinde `access_token`/`client_secret` değerleri maskelenir |
| Clickjacking | `X-Frame-Options: DENY`, CSP `frame-ancestors 'none'` |
| MIME sniffing | `X-Content-Type-Options: nosniff` |
| Dış kaynak | Sıkı CSP; harici script/stil/font yok |
| Debug sızıntısı | `/docs` ve `/openapi.json` yalnızca `DEBUG=true` iken açık; hata sayfaları yığın izi göstermez |

### Çapraz kaynak koruması ve curl

Tarayıcı, çapraz kaynaklı bir `POST` isteğinde `Origin` başlığını gönderir
ama özel başlık ekleyemez. InstaFlow bu yüzden: `Origin` **varsa** aynı
kaynak olmak zorundadır, **yoksa** (curl, CLI, betik) istek geçer. Yani
kötü niyetli bir web sayfası sizin adınıza gönderi yayınlayamaz, ama
kendi betikleriniz çalışmaya devam eder.

### Panelde giriş ekranı yok — `HOST` ayarını değiştirmeyin

InstaFlow tek kullanıcılık, **yerel** bir araç olarak tasarlandı ve
varsayılan olarak yalnızca `127.0.0.1` üzerinde dinler. Panelde kullanıcı
adı/parola ekranı **yoktur**.

`HOST=0.0.0.0` yaparsanız aynı ağdaki **herkes**:

- içeriklerinizi ve istatistiklerinizi görüntüleyebilir,
- içerik oluşturup silebilir,
- hesabınızdan gönderi yayınlayabilir.

Bunu yalnızca güvendiğiniz bir ağda ve tercihen kimlik doğrulamalı bir ters
vekil (reverse proxy) arkasında yapın. `python run.py doctor` bu ayarı
tespit ederse uyarır ve sunucu açılışta loga uyarı yazar.

---

## 19. API limitleri

| Limit | Değer |
|-------|-------|
| Content Publishing | 24 saatte 50 gönderi (Meta kotası) |
| Carousel | 2–10 öğe |
| Açıklama | 2200 karakter |
| Hashtag | Gönderi başına 30 |
| Uzun ömürlü token | 60 gün |
| Medya container | 24 saat sonra geçersiz |

InstaFlow ayrıca **yerel bir güvenlik sınırı** uygular
(`DAILY_PUBLISH_GUARD`, varsayılan 25): son 24 saatte bu sayıya ulaşıldıysa
yayın durur. Meta'nın kotasını zorlamak yerine önce burada durulur.

Kalan kotayı Meta'nın `content_publishing_limit` ucundan okuyabilirsiniz.

---

## 20. Mimari

```
instaflow/
├── app/
│   ├── main.py              FastAPI uygulaması, güvenlik başlıkları, yaşam döngüsü
│   ├── config.py            Merkezi yapılandırma (pydantic-settings)
│   ├── database.py          SQLite bağlantısı, oturum yönetimi
│   ├── models.py            SQLAlchemy modelleri
│   ├── schemas.py           Pydantic şemaları, API zarfı
│   ├── security.py          Dosya adı temizleme, yol sınırlama, CSRF
│   ├── errors.py            Hata tipleri
│   ├── timeutils.py         UTC ↔ yerel saat dönüşümleri
│   ├── logging_setup.py     Dosya + veritabanı loglama
│   ├── templating.py        Jinja2 ortamı ve filtreler
│   ├── routes_web.py        HTML sayfaları ve formlar
│   ├── routes_api.py        JSON API
│   ├── routes_media.py      Medya servis ucu (izin listeli, dar yüzey)
│   ├── routes_oauth.py      OAuth bağlantı akışı
│   │
│   ├── instagram/           Graph API katmanı
│   │   ├── auth.py          OAuth, token değişimi/yenileme/denetimi
│   │   ├── client.py        HTTP istemcisi, hata haritası, geri çekilme
│   │   ├── media.py         Medya doğrulama ve depolama
│   │   ├── publishing.py    Container oluşturma → yoklama → yayınlama
│   │   └── insights.py      İstatistik okuma
│   │
│   ├── ai/                  İçerik üretimi
│   │   ├── providers.py     AIProvider + OpenAI/Anthropic/Local
│   │   ├── runner.py        Çağrı, ayrıştırma, geri düşme
│   │   ├── prompts.py       İstem şablonları
│   │   ├── captions.py      Açıklama, başlık, Reels metni
│   │   ├── hashtags.py      Hashtag önerisi
│   │   └── content.py       Fikir ve haftalık plan
│   │
│   ├── scheduler/jobs.py    Yayın, istatistik ve token işleri
│   ├── services/            İş mantığı (içerik, yayın, istatistik, hesap)
│   ├── templates/           Jinja2 şablonları
│   └── static/style.css     Mobil öncelikli stil
│
├── content/                 drafts / scheduled / published / failed
├── data/                    instaflow.db, yedekler, PID
├── logs/                    app.log, server.log
├── scripts/                 start.sh, stop.sh, backup.sh
├── tests/                   258 test
├── install.sh
├── run.py                   CLI
└── .env.example
```

### Katman kuralları

- Web ve CLI katmanları yalnızca `services/` çağırır.
- `services/` veritabanı ve `instagram/` katmanını birleştirir.
- `instagram/` yalnızca HTTP bilir, veritabanı bilmez.
- Yapılandırma tek yerden (`config.py`) okunur; hiçbir modül `os.environ`
  okumaz.
- Tüm zaman damgaları veritabanında UTC'dir; dönüşüm tek yerde
  (`timeutils.py`) yapılır.

---

## Lisans

Bu proje deponun kök dizinindeki lisansa tabidir.
