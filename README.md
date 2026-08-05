# Instagram Growth OS

Instagram Business/Creator hesabına **resmi Meta Graph API** üzerinden bağlanır,
bağlantıyı doğrular ve hesap denetimi çıkarır.

Scraping, otomatik takip/beğeni, parola ile giriş veya oturum taklidi **yoktur**.
Yalnızca Meta'nın belgelenmiş API'si kullanılır.

## Gereksinimler

Graph API yalnızca şu koşullarda hesap verisi verir:

| Koşul | Neden |
|---|---|
| Hesap **Business** veya **Creator** tipinde | Kişisel hesaplar API'ye kapalıdır |
| Hesap bir **Facebook Sayfası**'na bağlı | Graph API erişimi sayfa üzerinden verilir |
| Bir **Meta uygulaması** ve erişim token'ı | Kimlik doğrulama için zorunlu |

## Kurulum

```bash
pip install -r requirements.txt
cp .env.example .env
```

### Token alma

1. <https://developers.facebook.com/apps> → **Create App** → tip: *Business*.
2. Uygulamaya **Instagram Graph API** ürününü ekleyin.
3. **Graph API Explorer**'da uygulamanızı seçip şu izinleri isteyin:
   - `instagram_basic` — profil ve gönderi verisi
   - `instagram_manage_insights` — erişim/kaydetme/paylaşım metrikleri
   - `pages_show_list`, `pages_read_engagement` — sayfa→IG bağlantısı
4. Üretilen kısa ömürlü token'ı **uzun ömürlüye** çevirin (~60 gün):

   ```
   GET https://graph.facebook.com/v21.0/oauth/access_token
       ?grant_type=fb_exchange_token
       &client_id=<APP_ID>
       &client_secret=<APP_SECRET>
       &fb_exchange_token=<KISA_OMURLU_TOKEN>
   ```

5. Sonucu `.env` içinde `IG_ACCESS_TOKEN=` satırına yazın.

> `.env` dosyası `.gitignore`'dadır. Token'ı asla depoya, ekran görüntüsüne
> veya sohbete yapıştırmayın — token hesabınıza erişim demektir.

## Kullanım

```bash
# Token, izinler ve bağlı hesap doğrulanır
PYTHONPATH=src python -m growth_os connect

# Profil + son 30 gönderi analizi
PYTHONPATH=src python -m growth_os audit

# Daha geniş örneklem, makine-okunur çıktı
PYTHONPATH=src python -m growth_os audit --limit 60 --json > rapor.json
```

`connect` çıktısındaki `IG_USER_ID` değerini `.env`'e eklerseniz sonraki
çalıştırmalar keşif isteklerini atlar (daha hızlı, daha az API kotası).

## Denetim neyi ölçer

| Metrik | Hesaplama |
|---|---|
| Etkileşim oranı | ortalama (beğeni + yorum) ÷ takipçi × 100 |
| Medyan beğeni/yorum | ortalamayı bozan viral gönderilere karşı dayanıklı |
| İçerik karması | REELS / IMAGE / CAROUSEL dağılımı |
| Haftalık sıklık | gönderi sayısı ÷ (ilk–son gönderi aralığı) |
| En iyi gönderiler | toplam etkileşime göre sıralı ilk 5 |
| Profil sağlığı | bio uzunluğu, link varlığı, yayın boşluğu |

Veri yoksa alan `veri yok` olarak raporlanır — tahmin veya sektör ortalaması
üretilmez.

## Testler

```bash
python -m unittest discover -s tests
```

Testler ağ isteği yapmaz; Graph API yanıtları sahte istemciyle taklit edilir.

## Bilinen sınırlar

- **Bu araç ağ erişimi olan bir ortamda çalıştırılmalıdır.** Claude Code web
  oturumunun ağ politikası `graph.facebook.com`'a CONNECT isteğini 403 ile
  reddediyor; komutları kendi makinenizde çalıştırın veya ortamın ağ
  politikasında bu alan adına izin verin.
- **Metrik adları Graph API sürümüne göre değişir.** Örneğin `impressions`
  yeni sürümlerde kaldırıldı. İçgörü isteği hata verirse rapor bunu uyarı
  olarak gösterir; `IG_API_VERSION` değerini değiştirerek doğrulayın.
- **Etkileşim oranı takipçi tabanlıdır.** Erişim tabanlı oran daha doğrudur
  ancak gönderi başına `reach` metriği `instagram_manage_insights` ister.
- **Kota:** Graph API saatlik istek limiti uygular. `--limit` değerini
  gereksiz büyütmeyin; 429 durumunda istemci üstel geri çekilmeyle bekler.
- Token ~60 günde dolar. `connect` komutu kalan süreyi ve 7 günden azsa
  uyarıyı gösterir.

## Proje yapısı

```
src/growth_os/
  config.py   # ortam değişkeni yükleme, ayar doğrulama
  client.py   # Graph API istemcisi: yeniden deneme, sayfalama, token maskeleme
  audit.py    # türetilmiş metrikler ve rapor biçimlendirme
  cli.py      # connect / audit komutları
tests/
  test_audit.py
```
