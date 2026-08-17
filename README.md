# ARDA.OS · Digital Profile

Instagram profilinden gelen ziyaretçiler için tasarlanmış **premium kişisel dijital alan**.
"Link-in-bio" klişesi değil; kişisel, karanlık, deneysel bir deneyim.

- Mobil-öncelikli (375 / 390 / 412 / 430 px'de kusursuz), iOS/Android safe-area destekli
- Dark / premium estetik — neon terminal klişesi yok
- Scroll ile ortaya çıkan bölümler (discover), scroll ilerleme göstergesi
- Magnetic butonlar, ışık takibi, clip-path reveal, mikro etkileşimler
- Termux Lab: gerçek bir mini öğrenme arayüzü (komut + açıklama + örnek + kopyala)
- Projeler: dokununca açılan fullscreen detay
- NOW PLAYING: sahte veri yok — sadece senin girdiğin Spotify bilgisi/bağlantısı
- Copy / Share / QR ve gerçek contact formu
- Tüm içerik tek dosyadan yönetilir: `content/site.json`

---

## Dosya yapısı

```
.
├── app.py                 # Flask backend (sayfa + /api/contact + /api/health)
├── requirements.txt       # Flask
├── index.html             # Tek sayfalık uygulama (SPA kabuğu)
├── content/
│   └── site.json          # TÜM içerik burada (canonical) — buradan düzenle
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

Düzenlenebilir alanlar: profil (isim, bio, durum, metadata, avatar), ana bağlantılar,
Spotify (`spotify.url`), Termux modülleri/dersleri, projeler, contact.

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
