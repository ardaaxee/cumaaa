# Hesap ağı

Üç ayrı Instagram hesabı, tek bir kurgusal evren. Her hesabı kendi
karakteri yönetiyor; aynı olay üç hesapta üç farklı ağızdan anlatılıyor.

> Hepsi kurgusaldır ve içerikleri yapay zekâ ile üretilir.

## Hesaplar

| Hesap | Kim | Nerede | Ne paylaşır |
|---|---|---|---|
| @beyza.saha.notu | Beyza, 27 | İstanbul | Saha günlüğü, Portre & ayna, Laboratuvar, İstanbul günlük |
| @elif.maketdefteri | Elif, 29 | İstanbul | Maket & atölye, Sergi süreci, Ofis & iş, Ev & Beyza |
| @sinan.dipnot | Sinan, 31 | Datça | Dalış, Ekipman & güvenlik, Tekne & hava, Saha ekibi |

## Kim kimin karesinde çıkıyor

Bir kişi başka bir hesabın karesine giriyorsa, o hesabın karakter
dosyasında `companions` altında **birebir aynı** görünüm tarifiyle
kayıtlı olmalı. Yüz tutarlılığı buna bağlı.

| Hesap | Karede çıkan | Hangi sütunlarda |
|---|---|---|
| @beyza.saha.notu | Elif | Ev & Elif |
| @beyza.saha.notu | Sinan | Ekip & arkadaşlar |
| @elif.maketdefteri | Beyza | Sergi süreci, Ev & Beyza |
| @elif.maketdefteri | Sinan | — (tanımlı sütun yok) |
| @sinan.dipnot | Beyza | Saha ekibi |
| @sinan.dipnot | Elif | — (tanımlı sütun yok) |

## Ortak hikâye yayları

Aynı olay birden çok hesapta geçiyor. Bunları **aynı hafta içinde**
yayınla; sırası önemli, çünkü takipçi ikisini de görüyor.

### Elif'in ilk sergisi

**Beyza tarafından:**
1. Elif üç haftadır aynı maketi kesiyor, evin yarısı karton
2. Sergi başvurusu kabul ediliyor, tarih altı hafta sonra
3. Son hafta ikisi de sabahlıyor, mutfak masası atölyeye dönüşüyor
4. Açılış gecesi, Beyza kareye ilk kez düzgün giyinmiş giriyor
5. Sergiden sonra ev sessizleşiyor, ikisi de bunu tuhaf buluyor

**Elif tarafından:**
1. Üç haftadır aynı maket, evin yarısı karton
2. Başvuru kabul ediliyor, tarih altı hafta sonra
3. Son hafta iki kişi de sabahlıyor, mutfak masası atölyeye dönüyor
4. Açılış gecesi — Beyza ilk kez düzgün giyinip geliyor
5. Sergiden sonra ev sessizleşiyor, ikisi de bunu tuhaf buluyor

### Kış saha kampanyası

**Beyza tarafından:**
1. Kış ölçümü için fon başvurusu, sonuç belirsiz
2. Fon çıkmıyor; ekip kendi imkânlarıyla üç günlük mini kampanya planlıyor
3. Fırtına yüzünden iki gün teknede beklemek
4. Tek günde beklenenden fazla veri, kampanya kurtuluyor

**Sinan tarafından:**
1. Fon çıkmıyor, ekip kendi imkânlarıyla üç günlük mini kampanya planlıyor
2. İki gün fırtına, teknede bekleme
3. Üçüncü gün su durgun, tek günde beklenenden fazla veri
4. Ekipman envanteri baştan çıkarılıyor

## Çapraz paylaşım kuralları

1. **Aynı olay, farklı kadraj.** İki hesap aynı anı paylaşacaksa aynı
   fotoğrafı kullanma — biri geniş açı, diğeri yakın plan olsun.
2. **Aynı gün değil, ertesi gün.** Olayı önce olayın 'sahibi' paylaşır,
   diğer hesap ertesi gün kendi açısından değinir.
3. **Etiketleme tek yönlü başlar.** Misafir olan hesap ev sahibini
   etiketler; ev sahibi hikâyede yeniden paylaşır.
4. **Ses karışmasın.** Herkes kendi üslubuyla yazar; aynı cümle iki
   hesapta geçmez.
5. **Herkes her şeyi bilmez.** Bir hesabın anlatmadığı detayı diğeri
   bilmiyormuş gibi davranır. Boşluk bırakmak inandırıcılığı artırır.

## Örnek: bir olay, üç hesap

| Gün | Hesap | İçerik |
|---|---|---|
| 1 | @sinan.dipnot | Dalış brifingi, ekipman karesi. Olayın sahibi. |
| 1 | @beyza.saha.notu | Aynı günün su altı ölçümü, kendi defterinden. |
| 2 | @beyza.saha.notu | Hikâyede dünkü brifingi yeniden paylaşır, etiketler. |
| 3 | @elif.maketdefteri | İstanbul'dan: 'o denizde, ben kartondayım' karesi. |

## Profil fotoğrafları ve kullanıcı adları

| Hesap | Profil fotoğrafı | Öne çıkanlar |
|---|---|---|
| @beyza.saha.notu | `beyza/profil.md` içindeki prompt | saha, lab, datça, ev, 12 numara, okuduklarım, temizlik |
| @elif.maketdefteri | `elif/profil.md` içindeki prompt | maket, sergi, ofis, ev, malzeme, datça |
| @sinan.dipnot | `sinan/profil.md` içindeki prompt | dalış, ekipman, tekne, ekip, güvenlik, datça |

## Kurulum sırası

1. Her karakterin `identity/` klasöründeki 4 kimlik karesini üret.
2. Her kişi için bir referans görsel seç ve sabitle.
3. İki kişili karelerde **iki referans görseli birden** ver.
4. Profil fotoğraflarını üret, hesapları aç.
5. `takvim.md` sırasını takip et; ortak yayları aynı hafta yayınla.
