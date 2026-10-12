# Birlikte Canlı (İyi ki YKS içindeki Android ekran paylaşımı)

Bu klasör ayrı bir uygulama değil: **İyi ki YKS** uygulamasına (`yks-play`, paket `io.github.ardaaxee.iyikiyks`)
`:live` modülü olarak girer. Android tarayıcıları ve uygulamanın web görünümü telefon ekranını paylaşamadığı için
(getDisplayMedia yok), web'deki Canlı sayfasında **Ekranımı paylaş** düğmesi bu modülün ekranını açar:

```
intent://join?room=<ODA>&share=1#Intent;scheme=ykslive;package=io.github.ardaaxee.iyikiyks;S.browser_fallback_url=<APK>;end
```

- Oda kodu dolu gelir, Android'in ekran kaydı izni hemen sorulur; paylaşım bir ön plan hizmetiyle (bildirim görünür)
  sürer, ekran kilitlense de durmaz. Karşı tarafın ekranı ve mesajlar da bu ekranda görünür.
- Web sayfası odadan çıkar ve "devredildi" kaydı tutar; böylece aynı telefon odaya ikinci kez girmez.
- Protokol web ile aynıdır: Supabase Realtime yayın kanalı `yks-live:<SHA-256(oda) ilk 32>`, AES-256-GCM
  (PBKDF2-SHA256, 120 000 tur, AAD = olay adı), WebRTC perfect negotiation (Android tarafı nazik eş sayılır).
- Doğrudan WebRTC 8 sn içinde kurulamazsa ekran ~1 kare/sn şifreli JPEG olarak aynı kanaldan gider
  (`RelayFrameEncoder`, web'de `yks/src/utils/liveRelay.ts`).
- İsteğe bağlı TURN: `TURN_URL`, `TURN_USERNAME`, `TURN_PASSWORD` Gradle özellikleri / Actions secrets.

## Test

- `yks-play`: `gradle :live:testDebugUnitTest`
- Gerçek ağda uçtan uca: `.github/workflows/yks-live-e2e.yml` — emülatördeki uygulama ↔ tarayıcı iki yönde ve
  yedek yolla (`scripts/emulator-live-test.sh`).

## Dağıtım

İmzalı APK: <https://ardaaxee.github.io/cumaaa/indir/iyiki-yks.apk>. Play Console'da uygulama ön plan hizmeti
türü olarak **mediaProjection** beyan edilmelidir (ekran paylaşımı, kullanıcı başlatır, bildirim görünür).
