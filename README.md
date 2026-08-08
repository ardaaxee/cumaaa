# persona

Kurgusal bir Instagram karakteri için **tam içerik paketi** üreten araç:
tutarlı fotoğraf promptları, karakterin kendi ağzından açıklamalar, reels
senaryoları, hikâye planları ve yayın takvimi.

Varsayılan karakter: **Beyza** (@beyza.gunluk) — 25 yaşında, İstanbul'da
evden çalışan bir grafik tasarımcı. Günlük hayat içeriği: masa, ev, kahve,
kitap, sokak, deniz. **Solo karakter:** her karede yalnızca o var.

```bash
python3 -m persona generate --character persona/characters/beyza.json \
  --out cikti-ag/beyza --posts 30 --reels 20 --stories 30
```

Bağımlılık yok — çekirdek üretim sadece standart kütüphane kullanır.

## Solo karakter garantisi

`beyza.json` içinde `"solo": true`. Bu bir tercih değil, kodla zorlanan bir
garanti:

- Her prompta **tek-kişi kuralı** ekleniyor ("karede tam olarak 1 yetişkin
  kadın; başka insan, çocuk, hayvan yok").
- Companion (ikinci kişi) enjeksiyonu tamamen kapanıyor.
- Her promptun sonuna İngilizce negatif kural düşüyor: `multiple people,
  another person, male, man, child, animal, cat, dog, ...`
- `tests/test_beyza_solo.py` üretilen **bütün** promptları tarıyor: 256
  promptun 256'sında kural var, hiçbirinde ikinci kişi ya da erkek geçmiyor.

Çok kişili karakterler (arşivdeki Elif ve Sinan) eski davranışı sürdürüyor.

---

## İki ayrı prompt: biri sana, biri modele

`generate` her kare için **iki** prompt yazar:

| Dosya | Dil | Kime |
|---|---|---|
| `tum-promptlar.txt` | Türkçe | sana — okuman, düzenlemen için |
| `render-promptlari-en.txt` | İngilizce | modele — `images` bunu gönderir |
| `kimlik-promptlari-en.txt` | İngilizce | 4 kimlik karesi |

Adlar üç dosyada da birebir aynı, yani `BEYZA-POST-007`'yi Türkçesinden
okuyup İngilizcesinde bulabilirsin.

Bu ayrım şart, çünkü:

1. **FLUX'un metin kodlayıcısı (T5) İngilizce.** Türkçe prompt zayıf
   koşullama veriyor ve yüz/cinsiyet tutmuyor.
2. **FLUX'ta `negative_prompt` girdisi yok.** Negatif listeyi promptun
   sonuna eklemek onu *pozitif* koşullamaya çevirir: içinde "male, man,
   child" geçen bir prompt erkek üretir. `render.py` kısıtları olumlu
   cümlelerle kuruyor — "exactly one adult woman", "the rest of the frame
   is just the room itself".

## Neden tutarlı görsel çıkıyor

Yüz tutarlılığı bu tür hesapların en zor kısmı. Araç dört kaldıraç kullanır:

1. **Kimlik promptu kimlikle başlıyor.** İlk cümle kim, kaç yaşında, hangi
   cinsiyet ve karede kaç kişi olduğunu söyler. Modeller promptun başına
   sonundan daha çok uyuyor.
2. **Sabit "anchor" metni.** Yüz ve vücut her promptta kelimesi kelimesine
   aynı cümleyle tarif edilir (`visual.anchor_en`). Değişen sadece sahne,
   kıyafet, ışık, kamera açısı ve poz.
3. **Sabit seed.** Tüm promptlara aynı seed düşülür.
4. **Gerçekten gönderilen referans görsel.** Önce 4 kimlik karesi üretilir,
   sonra ilki her içerik karesine referans olarak **istek gövdesinde**
   gider. Alan adı modelin şemasından okunur (`render.MODEL_CAPS`):
   Kontext `input_image`, 1.1-pro `image_prompt`, flux-dev `image`. Yanlış
   ad sessizce yok sayılır ve her karede farklı bir yüz çıkar — bu yüzden
   tahmin edilmiyor.

Varsayılan modeller:

| Aşama | Model | Neden |
|---|---|---|
| Kimlik kareleri | `flux-1.1-pro` | ortada referans yok, saf metinden üretim |
| İçerik kareleri | `flux-kontext-pro` | verilen kişiyi koruyarak yeni sahne kurar |

`flux-1.1-pro`'nun `image_prompt`'u Redux'tur: stil ve kompozisyon aktarır,
**yüzü kilitlemez**. Tutarlılık için içerik tarafında Kontext kullanılıyor.

Ayrıca kıyafet, mekân ve kamera seçimi **içerik sütununa bağlıdır** — masa
karesine yağmurluk, sokak karesine ev terliği gelmez. Türkçe ve İngilizce
seçim aynı indeksten yapılır, ikisi ayrışmaz.

Çok kişili karakterlerde (arşivdekiler) karedeki ikinci kişi de aynı
yöntemle sabitlenir ve `profil.md` ona ayrı bir referans sayfası üretir.
Beyza solo olduğu için bu yol onda tamamen kapalı.

## Karaktere hayat veren şey: hikâye yayları

`arcs` alanı aylara yayılan devam eden hikâyeleri tutar — Beyza'da kendi
yazı tipini çizmesi, evi yavaş yavaş toplaması, deniz kenarına kaçış planı.
Tek tek gönderiler değil bunlar hesabı canlı gösterir; `profil.md` içinde
adım adım listelenir, takvimi doldururken her yayın bir sonraki adımını
sıraya koyarsın.

---

## Kullanım

### Paket üret

```bash
python3 -m persona generate \
  --out cikti \
  --posts 24 --reels 8 --stories 14 \
  --cadence 2 --start 2026-09-01
```

| Bayrak | Ne yapar |
|---|---|
| `--character` | Kendi karakter JSON'un |
| `--posts / --reels / --stories` | Adetler |
| `--cadence` | Gönderiler arası gün sayısı |
| `--start` | Takvim başlangıcı (`YYYY-AA-GG`) |
| `--seed` | Aynı tohum → aynı çıktı |
| `--llm` | Açıklamaları Claude ile yeniden yaz |

### Açıklamaları Claude ile yaz (isteğe bağlı)

Şablon üretici zaten çalışıyor, ama metinleri "elle yazılmış" hissettirmek
için:

```bash
pip install anthropic
export ANTHROPIC_API_KEY=...        # ya da: ant auth login
python3 -m persona generate --llm --effort medium
```

`claude-opus-5` kullanır, karakterin ses tarifini sistem promptuna koyar ve
yapılandırılmış çıktı ile açıklama + ilk yorum döndürür.

### API'siz aynı sonuç: hazır açıklamalar

Kimlik bilgin yoksa ya da açıklamaları elle yazmak istiyorsan, `--llm`'in
ürettiğiyle aynı biçimde bir JSON verebilirsin:

```bash
python3 -m persona generate --seed 7 --captions ornek-aciklamalar.json
```

```json
{
  "posts": [{ "index": 1, "caption": "...", "first_comment": "#..." }],
  "reels": [{ "index": 1, "caption": "..." }]
}
```

`ornek-aciklamalar/arsiv/` klasöründe arşivlenen karakterlerin elle yazılmış
açıklamaları duruyor (her biri 30 gönderi + 10 reels, hikâye yaylarını
sırayla ilerletir). Kendi dosyanı yazarken biçim örneği olarak bakabilirsin.

**Açıklamalar gönderiye `index` ile bağlanır.** Tohumu, gönderi sayısını ya
da sahne havuzlarını değiştirirsen sahne sırası kayar ve açıklamalar yanlış
karelere düşer. Bu parametreleri sabit tut, ya da `--llm` kullan — o her
seferinde sahneye bakarak yazar.

### Görselleri gerçekten üret (isteğe bağlı)

```bash
export REPLICATE_API_TOKEN=...

python3 -m persona images --out cikti --dry-run      # ne üretilecek, kaç tane
python3 -m persona images --out cikti --identity-only # önce 4 kimlik karesi
# kareleri gözden geçir, beğenmediğini sil ve tekrar çalıştır, sonra:
python3 -m persona images --out cikti
```

Sıra önemli ve komut bunu **zorunlu tutuyor**: kimlik kareleri
(`gorseller/identity/`) tamamlanmadan içerik üretimi başlamaz — eksikse
komut ne yapman gerektiğini yazıp durur. Referans olmadan 260 promptdan 260
farklı yüz çıkar; mimarinin tamamı bunun üzerine kurulu.

| Bayrak | Ne yapar |
|---|---|
| `--dry-run` | Üretmeden listeler; kaç kare, hangileri |
| `--identity-only` | Sadece kimlik karelerini üretir |
| `--skip-identity` | Kimlik karelerini atlar |
| `--reference PATH` | Otomatik seçim yerine bu kareyi referans alır |
| `--reference-param AD` | Referans alanının adını elle ver (şema değişirse) |
| `--limit N` | Sadece ilk N içerik karesi |
| `--overwrite` | Var olanları yeniden üretir |

Var olan dosyalar atlanır, yani komut yarıda kesilirse kaldığı yerden devam
eder. Referans görseli şu an sadece `replicate` sağlayıcısı destekliyor;
`openai` ile yüzler kayar ve komut bunu uyarı olarak söyler.

### Kendi karakterini yap

```bash
python3 -m persona new-character karakterler/benim.json
# JSON'u düzenle
python3 -m persona generate --character karakterler/benim.json
```

Düzenlemeye değer alanlar: `visual.anchor` (yüz tarifi), `voice` (ton ve
üslup), `pillars` (içerik sütunları — her biri kendi sahneleri, kancaları,
somut detayları ve kıyafet/mekân listesiyle).

Açıklamalar sütunların `hooks` listesinden kurulur ve tekrar etmemeye
çalışır; bir sütundaki kanca sayısı o sütundan üretilebilecek özgün açılış
cümlesi sayısını sınırlar. Varsayılan karakterle 24 gönderi neredeyse
tamamen özgün çıkar, 40 gönderide birkaç tekrar olur — ya `hooks` listesini
uzat ya da `--llm` ile çalıştır.

### Kimlik referans kareleri (`identity_reference` modu)

Yüzü sabitleyen kareler normal içerikten ayrı bir moddan üretilir. Bu modda
karede **tam olarak bir kişi** vardır: yan karakter yok, hayvan yok, arka
planda insan ya da hayvan yok, fon boş.

```bash
python3 -m persona identity                       # ekrana bas
python3 -m persona identity --out cikti/identity  # dosyaya yaz
python3 -m persona identity --out cikti/identity --companions  # varsa ikinci kişiler için de
```

Dört poz üretir: önden portre, profil, 3/4 açı, tam boy. Beyza'da her
promptun sonuna şu kural birebir eklenir:

```
ONLY ONE PERSON. No animals, no cat, no dog, no other people,
no secondary characters, no background people, no background animals,
no male, no man, no child.
```

Bu mod `build_prompt`'u bilerek kullanmaz — o fonksiyon sütuna bağlı olarak
ikinci kişi satırı ekleyebiliyor, dolayısıyla "tek kişi" oradan geçseydi
garanti değil parametreye bağlı bir umut olurdu. Ayarları karakter
dosyasındaki `visual.identity_reference` bloğundan değiştirebilirsin.

Solo olmayan karakterlerde kısıtlama **yalnızca bu moda özeldir**: normal
gönderi, reels ve hikâye promptları etkilenmez, yan karakterli sütunlar
ikinci kişiyi eklemeye devam eder. Beyza'da ise `"solo": true` sayesinde
aynı garanti bütün promptlara yayılır.
`tests/test_identity_reference.py` iki yönü de doğrular.

### Tek prompt

```bash
python3 -m persona prompt "vapur güvertesinde çay içerken" --kind story
```

### Üç hesabı birden: `network`

```bash
python3 -m persona network --out cikti-ag --full
```

`persona/characters/` altındaki her karakter için ayrı bir paket
(`cikti-ag/beyza/`) ve hepsini bağlayan `hesap-agi.md` üretir: kim kimin
karesinde çıkıyor, hangi hikâye yayı kaç hesapta geçiyor, aynı olay hangi
sırayla paylaşılır. Varsayılan kurulumda tek karakter (Beyza) var; arşivdeki
karakterleri de katmak istersen `--characters` ile yollarını ver.

**Yüz kayması riski buradadır.** Bir kişi kendi dosyasında `visual.anchor`,
başkasının dosyasında `companions[ad]` olarak geçer. İkisi ayrışırsa aynı
karakter hesaplar arasında farklı bir yüze döner ve bu sessizce olur. Komut
her çalıştığında kontrol eder, `tests/test_network.py` de doğrular.

### Testler

```bash
python3 -m unittest discover -s tests -v
```

---

## Çıktı yapısı

```
cikti/
├── README.md              nereden başlanır
├── profil.md              bio, profil fotoğrafı, KARAKTER REFERANS SAYFASI
├── karakter.json          kullanılan karakter dosyası
├── takvim.md / .csv       yayın takvimi
├── tum-promptlar.txt      tüm görsel promptlar tek dosyada
├── gorseller/             üretilen görseller (images komutu doldurur)
│   ├── identity/          BEYZA-IDENTITY-01..04.jpg  ← önce bunlar
│   ├── profile/           BEYZA-PROFILE-01.jpg
│   ├── posts/             BEYZA-POST-001.jpg …
│   ├── reels/             BEYZA-REEL-001.jpg …
│   └── stories/           BEYZA-STORY-001.jpg …
├── posts/NN-slug/
│   ├── gorsel.txt         (karusel ise gorsel-1.txt, gorsel-2.txt…)
│   ├── aciklama.txt
│   ├── ilk-yorum.txt      hashtag'ler (açıklamayı temiz tutmak için)
│   ├── alt-metin.txt
│   └── meta.json
├── reels/NN-slug/
│   ├── senaryo.md         çekim listesi + her plan için görsel promptu
│   └── aciklama.txt       dış ses metni, ekran yazıları, ses notu
└── stories/gun-NN.md      günlük hikâye kareleri + sticker önerileri
```

---

## Mimari

| Dosya | Sorumluluk |
|---|---|
| `persona/models.py` | Veri modelleri (`Character`, `Post`, `Reel`, …) |
| `persona/characters/*.json` | Karakter tanımları — asıl "içerik" burada |
| `persona/visual.py` | Görsel prompt kurucu, anchor + sütun bağlamı |
| `persona/voice.py` | Karakterin sesiyle metin (tekrarsız seçim) |
| `persona/content.py` | Gönderi / reels / hikâye / takvim planlama |
| `persona/export.py` | Diske yazma |
| `persona/llm.py` | İsteğe bağlı Claude ile yeniden yazım |
| `persona/images.py` | İsteğe bağlı görsel üretimi (Replicate / OpenAI) |
| `persona/cli.py` | Komut satırı |

---

## Uyarı

Bu hesap **kurgusal** bir karaktere ait ve öyle sunulmalı:

- Instagram, gerçekçi yapay zekâ içeriğinin etiketlenmesini istiyor —
  paylaşırken "Yapay zekâ ile üretildi" işaretini kullan.
- Biyografideki kurgusal karakter açıklamasını silme (varsayılan olarak
  ekli geliyor).
- Gerçek bir kişiye benzeyen yüz üretme; karakteri gerçek bir insanmış gibi
  sunma, gerçek kişi taklidi yapma.
- Sponsorlu içerik, bağış toplama veya ürün satışı gibi durumlarda kurgusal
  olduğunu ayrıca belirtmen gerekir.
