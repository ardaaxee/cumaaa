# persona

Kurgusal bir Instagram karakteri için **tam içerik paketi** üreten araç:
tutarlı fotoğraf promptları, karakterin kendi ağzından açıklamalar, reels
senaryoları, hikâye planları ve yayın takvimi.

Varsayılan karakter: **Beyza** (@beyza.saha.notu) — 27 yaşında deniz
biyoloğu, İstanbul ↔ Datça arası gidip gelen bir doktora öğrencisi.
Tamamen kurgusal.

```bash
python3 -m persona generate
# → cikti/ klasörü: profil, 24 gönderi, 8 reels, 14 gün hikâye, takvim
```

Bağımlılık yok — çekirdek üretim sadece standart kütüphane kullanır.

## Kurulum

Depoyu klonlayıp doğrudan `python3 -m persona` ile çalıştırabilirsin.
Sistem geneline `persona` komutu olarak kurmak istersen:

```bash
pip install -e .           # çekirdek
pip install -e ".[llm]"    # + Claude ile yeniden yazım
persona generate
```

Örnek çıktı olarak deponun kökündeki [`profil.md`](profil.md) dosyasına
bakabilirsin — biyografi, profil fotoğrafı promptu ve karakter referans
sayfası orada.

---

## Neden tutarlı görsel çıkıyor

Yüz tutarlılığı bu tür hesapların en zor kısmı. Araç üç kaldıraç kullanır:

1. **Sabit "anchor" metni.** Karakterin yüzü ve vücudu her promptta kelimesi
   kelimesine aynı cümleyle tarif edilir (`visual.anchor`). Değişen sadece
   sahne, kıyafet, ışık.
2. **Sabit seed.** Tüm promptlara aynı seed düşülür.
3. **Referans sayfası.** `profil.md` içinde 4 adet karakter referans karesi
   promptu var. Önce onları üret, birini seç ve görsel aracına referans
   görsel olarak ver (Midjourney `--cref`, Flux/SDXL IP-Adapter, Nano Banana
   referans görseli). Asıl tutarlılık buradan gelir.

Ayrıca kıyafet, mekân ve kamera seçimi **içerik sütununa bağlıdır** —
laboratuvar karesine can yeleği, mutfak karesine dalış maskesi gelmez.

Karede ikinci bir kişi varsa (`companions`) onun görünümü de aynı yöntemle
sabitlenir ve `profil.md` ona da ayrı bir referans sayfası üretir.

## Karaktere hayat veren şey: hikâye yayları

`arcs` alanı aylara yayılan devam eden hikâyeleri tutar — tıkanan tez
bölümü, takip edilen 12 numaralı fok, ev arkadaşının ilk sergisi. Tek tek
gönderiler değil bunlar hesabı canlı gösterir; `profil.md` içinde adım adım
listelenir, takvimi doldururken her yayın bir sonraki adımını sıraya koyarsın.

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

### Görselleri gerçekten üret (isteğe bağlı)

```bash
export REPLICATE_API_TOKEN=...
python3 -m persona images --provider replicate --limit 5
# veya
export OPENAI_API_KEY=...
python3 -m persona images --provider openai
```

Görseller `cikti/gorseller/` altına düşer. **Not:** en iyi sonuç için önce
referans karesini üretip aracın referans görsel özelliğini kullan; bu komut
saf metinden üretir.

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

### Tek prompt

```bash
python3 -m persona prompt "vapur güvertesinde çay içerken" --kind story
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
