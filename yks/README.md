# İyi ki • YKS 3.1.0

TYT ve AYT Sayısal için telefon ve bilgisayarda çalışan kişisel çalışma uygulaması.

## Kullanım

Profilini oluştur; üniversite ve bölüm hedefini, günlük soru/süre hedeflerini ve çalışma saatini belirle. Konu anlatımı, çözümlü soru bankası, süreli denemeler, yanlış analizi, tekrarlar, kişisel plan, Pomodoro ve dijital defter aynı uygulamadadır. Çalışma kayıtları cihazında tutulur; bulut eşitleme isteğe bağlıdır.

Android: Chrome menüsü → Uygulamayı yükle / Ana ekrana ekle. iPhone: Safari → Paylaş → Ana Ekrana Ekle. İlk kullanımda uygulamayı internet bağlantısıyla açık tut; Ayarlar’da çevrimdışı hazırlığın tamamlandığını görebilirsin. AI ve ortak çalışma bağlantıları internet gerektirir.

Yedek: Ayarlar → Veriyi dışa aktar. Bu dosya profilini, ilerlemeni, planını ve defter çizimlerini içerir. İçe aktarma onay ister; depolama hatasında mevcut defter korunur. Bozuk kayıtlar yeni profille ezilmez; kurtarma ekranından ham kayıt indirilebilir.

## Geliştirme ve doğrulama

Node 22.18+ veya 24 kullan.

```sh
npm ci
npm run dev
npm run verify
```

Tarayıcı testi için Chrome veya Chromium gerekir; farklı bir konumdaysa `CHROMIUM_PATH` ayarla. Testler AI sağlık kontrolünü yerel fixture ile doğrular; canlı AI sağlayıcısının çalışması ayrı bir dış hizmet kontrolüdür.

`npm run test:release` harici paket indirmeden kayıt/geri yükleme, soru bankası bütünlüğü, bağlantı ayrıştırma, hedef sınırları ve service worker güncellemesini kontrol eder.

`npm run build` çıktısı `dist/` dizinine yazılır. `dist/` içeriğini mevcut GitHub Pages `yks/` dizinine yerleştir. Hash yönlendirme sayesinde sunucuda ek URL yönlendirmesi gerekmez. AI sunucusu için depodaki `render.yaml` ve `server/` kullanılır; API anahtarları yalnız sunucu ortam değişkenlerinde tutulur.

## 3.1.0 değişiklikleri

- Güncelleme bildirimi; aktif test, odak oturumu ve çizim sırasında zorunlu yenileme kaldırıldı.
- Atomik çizim işlemleri, yedek yükleme onayı, hata halinde geri alma ve kayıt kurtarma ekranı.
- Süresi dolan sınavda cevap kilidi; eşzamanlı test başlatmanın mevcut testi ezmesi önlendi.
- Hedeflerin geçerli aralıkta tutulması; hatalı paylaşılan bağlantıların uygulamayı çökertmesi önlendi.
- Soru bankası kontrolleri, mobil ve masaüstü tarayıcı kabul testleri, çevrimdışı paket kontrolü ve CI çıktıları.

Veri şeması güncel kaynaktaki v4 olarak korunur. `iyikiYks.state.v3` depolama anahtarı değiştirilmez; v3/v4 yedekler desteklenir.
