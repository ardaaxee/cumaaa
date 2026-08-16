# ARDA · Kod Sanatı 🎨

Tek dosyalık, tamamen çevrimdışı çalışan interaktif bir "kod sanatı" web sayfası.
Fare veya dokunmatik ile etkileşen, birbirine ışıltılı çizgilerle bağlanan canlı bir
parçacık ağı (constellation) + kendi kendine yazılan tipografik karşılama içerir.

- 🟢 **Tek dosya:** Sadece `index.html`. Harici kütüphane, CDN veya internet **gerekmez**.
- 🌙 Karanlık, sanatsal tema.
- 🖱️ İnteraktif: hareket ettir, dokun, tıkla — ağ tepki verir.
- 📱 Mobil uyumlu ve dokunmatik destekli.
- ⚡ 60 FPS hedefi: parçacık yoğunluğu ekran boyutuna göre otomatik ayarlanır.

---

## 🚀 Nasıl Açılır (Yerel)

Kurulum yok. `index.html` dosyasına çift tıklayın; varsayılan tarayıcınızda açılır.
Alternatif olarak dosyayı bir tarayıcı sekmesine sürükleyip bırakabilirsiniz.

> Not: Tamamen çevrimdışı çalışır, internet bağlantısı olmadan da açılır.

---

## 🌐 Nasıl Yayınlanır (Instagram linki için)

Instagram profilinizdeki **bağlantı (link)** bölümüne koyabileceğiniz bir URL elde etmek
için iki kolay yol:

### Yöntem 1 — Netlify Drop (en hızlı, 1 dakika)

1. https://app.netlify.com/drop adresine gidin.
2. İçinde `index.html` bulunan klasörü sayfaya **sürükleyip bırakın**.
   (Sadece `index.html`'i de sürükleyebilirsiniz.)
3. Netlify size anında bir URL verir (ör. `https://parlak-isim-123.netlify.app`).
4. Bu URL'yi Instagram profilinizin link kısmına yapıştırın. Bitti! ✅

> İsterseniz ücretsiz Netlify hesabı açıp site adını (subdomain) özelleştirebilirsiniz.

### Yöntem 2 — GitHub Pages (kalıcı, ücretsiz)

1. GitHub'da bir repo oluşturun (ör. `kod-sanati`) ve `index.html` dosyasını yükleyin.
2. Repo sayfasında **Settings → Pages** bölümüne gidin.
3. **Source** olarak `Deploy from a branch` seçin.
4. Branch olarak `main` (ve klasör `/root`) seçip **Save** deyin.
5. Birkaç dakika sonra siteniz şu adreste yayında olur:
   `https://KULLANICI-ADINIZ.github.io/kod-sanati/`
6. Bu URL'yi Instagram profilinizin link kısmına yapıştırın. ✅

---

## ✏️ Kişiselleştirme

`index.html` içinde kolayca değiştirebileceğiniz yerler:

| Ne | Nerede | Nasıl |
|----|--------|-------|
| İsim | `<h1 class="name">ARDA</h1>` | Metni değiştirin |
| Rozet | `<div class="badge">@arda</div>` | Kullanıcı adınızı yazın |
| Karşılama | JS'te `const message = "MERHABA, BEN";` | Yazılan metni değiştirin |
| Renkler | CSS `:root` içindeki `--c1 / --c2 / --c3` | Aksan renklerini değiştirin |
| Yoğunluk | JS `targetCount()` fonksiyonu | Parçacık sayısını ayarlayın |

---

## 🛠️ Teknik Notlar

- Saf HTML + CSS + JavaScript (Canvas 2D). Derleme adımı yok.
- Retina ekranlar için `devicePixelRatio` üst sınırı 2 ile netlik/performans dengesi.
- `prefers-reduced-motion` tercihine saygı duyar (animasyonları sakinleştirir).
- Ekran alanına göre parçacık sayısı ve bağlantı mesafesi dinamik hesaplanır.

Keyifli kullanımlar! ✨
