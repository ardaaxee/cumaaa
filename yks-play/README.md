# İyi ki YKS — Google Play uygulaması

Yayındaki web uygulamasını (https://ardaaxee.github.io/cumaaa/yks/) Android'de tam ekran açan
**Trusted Web Activity** paketi. Web sürümü güncellendiğinde uygulama da otomatik güncel içeriği gösterir;
Play'e yeni sürüm yüklemek yalnız uygulama kabuğu (simge, ad, renkler) değişirse gerekir.

- Paket adı: `io.github.ardaaxee.iyikiyks`
- Alan adı doğrulaması: https://ardaaxee.github.io/.well-known/assetlinks.json
- Derleme: `.github/workflows/yks-play.yml` (Actions → "YKS Google Play paketi" → Run workflow)

## İmza

İmza anahtarı depoda **değildir**. İki yol:

1. Actions secrets'a ekle → iş akışı doğrudan imzalı `.aab` + `.apk` üretir:
   - `YKS_UPLOAD_KEYSTORE_BASE64` = `base64 -w0 iyiki-yks-upload.jks` çıktısı
   - `YKS_UPLOAD_KEYSTORE_PASSWORD` = anahtar parolası
2. Secrets yoksa iş akışı imzasız `.aab` üretir; JDK ile imzalanır:
   ```bash
   jarsigner -keystore iyiki-yks-upload.jks -signedjar iyiki-yks.aab app-release.aab upload
   ```

## Play App Signing sonrası

Play Console → Kurulum → Uygulama bütünlüğü → **Uygulama imzalama anahtarı sertifikası** altındaki SHA-256
parmak izini `ardaaxee.github.io` deposundaki `.well-known/assetlinks.json` dosyasına ekle
(yoksa uygulama Play'den indirildiğinde üstte adres çubuğu görünür).
