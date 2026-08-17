# ARDA.OS · Digital Space (v2.5)

Instagram profilinden gelen ziyaretçilerin 10-20 saniye keşfetmek isteyeceği
**interaktif kişisel dijital alan**. Linktree değil, portfolio değil — kendi dijital dünyası.

- Mobil-öncelikli (375 / 390 / 412 / 430 px'de kusursuz), Android Chrome + iOS safe-area
- Dark / premium editorial estetik — neon/terminal/matrix klişesi yok
- 7 bölüm: **01 PROFILE · 02 NOW · 03 MUSIC · 04 TOOLBOX · 05 TERMUX · 06 PROJECTS · 07 CONNECT**
- Güçlü açılış (grid + koordinatlar + hareketli ışık, max 0.8s, dokununca geç)
- Gerçek browser verisi: canlı yerel saat, durum
- **NOW**: LISTENING / BUILDING / LEARNING (editorial)
- **DIGITAL TOOLBOX**: TERMUX / LINUX / PYTHON / GIT / AI / WEB — her biri modal açar
- **Termux Lab**: 6 modül, COMMAND / WHAT IT DOES / EXAMPLE / COPY + **localStorage ilerleme** (`X / 24 COMPLETE`)
- **Projeler**: editorial liste + fullscreen detay geçişi
- **Command Palette** (⌘K / Ctrl+K / `/` · mobilde SEARCH butonu) — tüm içerikte arama
- **NOW PLAYING**: sahte veri yok — sadece girilen Spotify bağlantısı
- Copy / Share / QR (gömülü offline QR) + gerçek contact formu
- 5 gizli keşif noktası (easter egg)
- Tüm içerik tek dosyadan: `content/site.json`

---

## Dosya yapısı

```
.
├── app.py                 # Flask backend (sayfa + /api/contact + /api/health)
├── requirements.txt       # Flask
├── index.html             # Tek sayfalık uygulama (SPA kabuğu)
├── content/
│   └── site.json          # TÜM içerik (profile/now/music/tools/termux/projects/connect/easterEggs)
└── static/
    ├── css/style.css
    └── js/
        ├── app.js         # Uygulama mantığı
        ├── data.js        # site.json'un offline fallback kopyası
        └── qrcode.min.js  # Çevrimdışı QR üreticisi (MIT, gömülü)
```

---

## Çalıştırma (yerel)

### Flask ile (contact formu gerçek çalışır)
```bash
pip install -r requirements.txt
python app.py
# http://localhost:8080
```
Gönderilen contact mesajları `content/messages.jsonl` dosyasına yazılır (git'e girmez).

### Sunucusuz (hızlı bakış)
`index.html`'i doğrudan açabilirsin; içerik `static/js/data.js` fallback'inden yüklenir.
Contact formu backend olmadığında otomatik olarak **mailto** ile açılır.

---

## Yayınlama (Instagram linki için)

### Netlify Drop (en hızlı)
1. https://app.netlify.com/drop adresine git.
2. Proje klasörünü sürükleyip bırak.
3. Verilen URL'yi Instagram profilinin link kısmına yapıştır.

> Not: Netlify statik bir hosttur; `index.html`, `static/`, `content/site.json` olduğu gibi
> sunulur. Contact formu bu durumda mailto fallback'i kullanır. Formu gerçek şekilde
> almak istersen Flask'ı bir sunucuda (Render, Railway, VPS) çalıştır.

### GitHub Pages
1. Repoyu GitHub'a gönder.
2. **Settings → Pages → Deploy from a branch → `main` / root**.
3. `https://KULLANICI.github.io/REPO/` adresini kullan.

---

## İçeriği düzenleme

Her şey **`content/site.json`** içindedir. Düzenledikten sonra offline fallback'i
senkron tutmak için:

```bash
python3 - <<'PY'
import json
d=json.load(open('content/site.json'))
open('static/js/data.js','w').write(
 '// OTOMATİK FALLBACK — content/site.json canonical kaynaktır.\n'
 'window.SITE_DATA = '+json.dumps(d,ensure_ascii=False,indent=2)+';\n')
print('data.js güncellendi')
PY
```

Düzenlenebilir bölümler: `profile` (isim, bio, avatar, instagram, build), `now`
(LISTENING/BUILDING/LEARNING), `music.url` (Spotify), `tools` (toolbox kartları),
`termux` (modüller/dersler), `projects`, `connect` (contact + FIND ARDA linkleri),
`easterEggs` (gizli mesajlar).

---

## API

| Method | Yol                 | Açıklama                          |
|--------|---------------------|-----------------------------------|
| GET    | `/`                 | Ana sayfa                         |
| GET    | `/content/site.json`| İçerik verisi                     |
| GET    | `/api/health`       | Sağlık kontrolü                   |
| POST   | `/api/contact`      | Contact formu (name, email, message) |

---

## İpucu

Site içinde birkaç küçük keşfedilebilir detay saklı. Meraklı olan bulur.
