import type { QuestionSeed } from '../../domain/types';

/** Özgün TYT fizik paketi: çok adımlı işlem, grafik ve yorum ağırlıklı. */
export const questions: QuestionSeed[] = [
  {
    "id": "tytfiz-hareket-ve-kuvvet-q31",
    "topic": "tytfiz-hareket-ve-kuvvet",
    "subtopic": "tytfiz-hareket-ve-kuvvet-s2",
    "outcome": "Hız-zaman grafiğinin altındaki alandan yer değiştirmeyi hesaplar.",
    "difficulty": "orta",
    "type": "grafik",
    "question": "Doğrusal yolda hareket eden bir aracın hız-zaman grafiği şu şekilde tanımlanıyor:\n• 0–4 s arasında hızı 2 m/s’den 10 m/s’ye doğrusal artıyor.\n• 4–8 s arasında 10 m/s sabit hızla gidiyor.\n• 8–10 s arasında hızı doğrusal olarak 0’a düşüyor.\n\nAracın 0–10 s aralığındaki yer değiştirmesi kaç metredir?",
    "options": [
      "64",
      "70",
      "74",
      "78",
      "84"
    ],
    "correctAnswer": 2,
    "solution": "Yer değiştirme v–t grafiğinin alanıdır.\n0–4 s: (2+10)·4/2 = 24 m.\n4–8 s: 10·4 = 40 m.\n8–10 s: 10·2/2 = 10 m.\nToplam = 24+40+10 = 74 m.",
    "hint": "Her zaman aralığının v–t grafiği altında bıraktığı alanı ayrı hesapla.",
    "commonMistake": "Hızların aritmetik ortalamasını tüm 10 saniyeye uygulamak.",
    "teacherNote": "Grafik okuma ile alan hesabını aynı soruda ölçer."
  },
  {
    "id": "tytfiz-hareket-ve-kuvvet-q32",
    "topic": "tytfiz-hareket-ve-kuvvet",
    "subtopic": "tytfiz-hareket-ve-kuvvet-s4",
    "outcome": "Sürtünmeli yatay düzlemde net kuvvet ve ivmeyi hesaplar.",
    "difficulty": "orta",
    "type": "islem",
    "question": "4 kg kütleli bir cisim yatay düzlemde 18 N büyüklüğünde yatay kuvvetle çekiliyor. Cisim ile zemin arasındaki kinetik sürtünme katsayısı 0,25’tir. g = 10 m/s² olduğuna göre cismin ivmesi kaç m/s² olur?",
    "options": [
      "1",
      "2",
      "2,5",
      "3",
      "4,5"
    ],
    "correctAnswer": 1,
    "solution": "N = mg = 40 N.\nSürtünme f = μN = 0,25·40 = 10 N.\nNet kuvvet = 18−10 = 8 N.\na = 8/4 = 2 m/s².",
    "hint": "Önce sürtünmeyi bul; uygulanan kuvvetin tamamı ivme oluşturmaz.",
    "commonMistake": "18/4 yapıp sürtünmeyi yok saymak.",
    "teacherNote": "Net kuvvet kurma alışkanlığını ölçer."
  },
  {
    "id": "tytfiz-hareket-ve-kuvvet-q33",
    "topic": "tytfiz-hareket-ve-kuvvet",
    "subtopic": "tytfiz-hareket-ve-kuvvet-s3",
    "outcome": "Net kuvvetin yönü ile ivmenin yönünü ilişkilendirir.",
    "difficulty": "zor",
    "type": "yorum",
    "question": "Düz bir yolda doğu yönünde hareket eden bir otomobile bir anda batı yönünde sabit net kuvvet etki etmeye başlıyor. Kuvvet etkidiği ilk anda otomobilin hızı hâlâ doğu yönündedir.\n\nBu anda otomobil için hangisi kesinlikle doğrudur?",
    "options": [
      "Batı yönünde hareket etmektedir.",
      "Doğu yönünde hızlanmaktadır.",
      "Batı yönünde ivmelenmektedir.",
      "Hızı sıfırdır.",
      "Konumu değişmez."
    ],
    "correctAnswer": 2,
    "solution": "İvmenin yönünü net kuvvet belirler. Net kuvvet batı yönünde olduğundan ivme batı yönündedir. Hız ilk anda hâlâ doğu yönünde olabilir; araç önce yavaşlar.",
    "hint": "Hızın yönü ile ivmenin yönü aynı olmak zorunda değildir.",
    "commonMistake": "Kuvvet batıya olduğu için aracın anında batıya hareket ettiğini düşünmek.",
    "teacherNote": "Kuvvet–ivme–hız yönlerini ayırt etmeyi ölçer."
  },
  {
    "id": "tytfiz-is-guc-enerji-q31",
    "topic": "tytfiz-is-guc-enerji",
    "subtopic": "tytfiz-is-guc-enerji-s2",
    "outcome": "İş-enerji ilişkisini kullanarak son hızı hesaplar.",
    "difficulty": "orta",
    "type": "islem",
    "question": "2 kg kütleli bir cisim yatay doğrultuda 4 m/s hızla hareket ederken cisme hareket yönünde net 48 J iş yapılıyor. Cismin son hızı kaç m/s olur?",
    "options": [
      "6",
      "7",
      "8",
      "10",
      "12"
    ],
    "correctAnswer": 2,
    "solution": "Ki = 1/2·2·4² = 16 J.\nNet iş kinetik enerji değişimidir: Kf = 16+48 = 64 J.\n1/2·2·v² = 64 ⇒ v = 8 m/s.",
    "hint": "Net iş doğrudan kinetik enerji değişimine eşittir.",
    "commonMistake": "48 J’ü doğrudan hız artışı gibi yorumlamak.",
    "teacherNote": "İş-enerji teoremini sayı hesabıyla pekiştirir."
  },
  {
    "id": "tytfiz-is-guc-enerji-q32",
    "topic": "tytfiz-is-guc-enerji",
    "subtopic": "tytfiz-is-guc-enerji-s1",
    "outcome": "Güç ve verim ilişkisini kullanır.",
    "difficulty": "orta",
    "type": "cok-adimli",
    "question": "50 kg kütleli bir yük, bir motor tarafından 10 saniyede 6 m yukarı çıkarılıyor. Sistemin verimi %75’tir. g = 10 m/s² olduğuna göre motorun şebekeden çektiği ortalama güç kaç wattır?",
    "options": [
      "300",
      "350",
      "400",
      "450",
      "500"
    ],
    "correctAnswer": 2,
    "solution": "Yararlı iş = 50·10·6 = 3000 J.\nYararlı güç = 3000/10 = 300 W.\n0,75 = 300/Pgiriş ⇒ Pgiriş = 400 W.",
    "hint": "Önce yükü kaldırmaya giden yararlı gücü bul, sonra verimi kullan.",
    "commonMistake": "%75 verimde giriş gücünü 300·0,75 almak.",
    "teacherNote": "Güç ve verimi aynı işlem zincirinde ölçer."
  },
  {
    "id": "tytfiz-elektrik-akimi-q31",
    "topic": "tytfiz-elektrik-akimi",
    "subtopic": "tytfiz-elektrik-akimi-s3",
    "outcome": "Paralel bağlı dirençlerde eşdeğer direnç, akım ve gücü hesaplar.",
    "difficulty": "orta",
    "type": "islem",
    "question": "6 Ω ve 3 Ω dirençler paralel bağlanıp 12 V ideal üretece bağlanıyor. Devrenin üreteçten çektiği toplam akım ve toplam güç sırasıyla kaçtır?",
    "options": [
      "2 A ve 24 W",
      "4 A ve 48 W",
      "6 A ve 72 W",
      "8 A ve 96 W",
      "9 A ve 108 W"
    ],
    "correctAnswer": 2,
    "solution": "1/R = 1/6 + 1/3 = 1/2 ⇒ R = 2 Ω.\nI = 12/2 = 6 A.\nP = VI = 12·6 = 72 W.",
    "hint": "Önce paralel eşdeğer direnci bul.",
    "commonMistake": "Dirençleri seriymiş gibi 9 Ω toplamak.",
    "teacherNote": "Eşdeğer dirençten güç hesabına giden zinciri ölçer."
  },
  {
    "id": "tytfiz-elektrik-akimi-q32",
    "topic": "tytfiz-elektrik-akimi",
    "subtopic": "tytfiz-elektrik-akimi-s6",
    "outcome": "Lamba parlaklığını harcanan güçle ilişkilendirir.",
    "difficulty": "zor",
    "type": "yorum",
    "question": "Özdeş K ve L lambaları ideal bir üretece önce seri, sonra paralel bağlanıyor. Üretecin gerilimi iki durumda da aynıdır.\n\nParalel bağlantıya geçildiğinde bir lambanın parlaklığı ve devrenin toplam gücü nasıl değişir?",
    "options": [
      "Parlaklık azalır, toplam güç azalır.",
      "Parlaklık değişmez, toplam güç artar.",
      "Parlaklık artar, toplam güç artar.",
      "Parlaklık artar, toplam güç değişmez.",
      "Parlaklık azalır, toplam güç artar."
    ],
    "correctAnswer": 2,
    "solution": "Seride her lamba yaklaşık V/2 gerilim alır; paralelde her lamba V gerilimine bağlanır. P = V²/R olduğundan her lambanın gücü artar. Eşdeğer direnç de 2R’den R/2’ye düştüğü için toplam güç artar.",
    "hint": "Parlaklığı lambanın harcadığı güç belirler.",
    "commonMistake": "Paralelde akım bölündüğü için lambaların daha sönük yanacağını düşünmek.",
    "teacherNote": "Devre topolojisini nitel olarak yorumlatır."
  },
  {
    "id": "tytfiz-basinc-kaldirma-q31",
    "topic": "tytfiz-basinc-kaldirma",
    "subtopic": "tytfiz-basinc-kaldirma-s2",
    "outcome": "Pascal ilkesini hidrolik sistemlerde uygular.",
    "difficulty": "orta",
    "type": "islem",
    "question": "Bir hidrolik düzende küçük pistonun alanı 20 cm², büyük pistonun alanı 300 cm²’dir. Küçük pistona 150 N kuvvet uygulanıyor. Pistonlar aynı seviyede ve sıvı ideal olduğuna göre büyük pistonda oluşan kuvvet kaç newtondur?",
    "options": [
      "750",
      "1500",
      "1800",
      "2250",
      "3000"
    ],
    "correctAnswer": 3,
    "solution": "F1/A1 = F2/A2.\n150/20 = F2/300 ⇒ F2 = 2250 N.",
    "hint": "Basınç iki pistonda aynıdır.",
    "commonMistake": "Alan oranını ters kullanmak.",
    "teacherNote": "Alan–kuvvet oranını işlemle ölçer."
  },
  {
    "id": "tytfiz-basinc-kaldirma-q32",
    "topic": "tytfiz-basinc-kaldirma",
    "subtopic": "tytfiz-basinc-kaldirma-s4",
    "outcome": "Yüzen cismin batan hacmi ile özkütle ilişkisini yorumlar.",
    "difficulty": "zor",
    "type": "yorum",
    "question": "Özkütlesi 0,8 g/cm³ olan homojen bir cisim su üzerinde yüzüyor. Cisim, özkütlesi sudan daha büyük başka bir sıvıya bırakılıyor ve yine yüzüyor.\n\nYeni sıvıda cismin batan hacminin toplam hacmine oranı için ne söylenebilir?",
    "options": [
      "0,8’den büyüktür.",
      "0,8’e eşittir.",
      "0,8’den küçüktür.",
      "Her durumda 1’dir.",
      "Sıvının miktarına bağlıdır."
    ],
    "correctAnswer": 2,
    "solution": "Yüzen cisim için Vbatan/Vtoplam = ρcisim/ρsıvı. Yeni sıvının özkütlesi sudan büyük olduğundan payda büyür ve oran 0,8’den küçük olur.",
    "hint": "Yüzen cisimde kaldırma kuvveti ağırlığa eşittir.",
    "commonMistake": "Daha yoğun sıvıda cismin daha çok batacağını düşünmek.",
    "teacherNote": "Kaldırma kuvvetini fiziksel yorumla kullandırır."
  },
  {
    "id": "tytfiz-optik-q31",
    "topic": "tytfiz-optik",
    "subtopic": "tytfiz-optik-s2",
    "outcome": "Düzlem aynada görüntünün konumunu yorumlar.",
    "difficulty": "orta",
    "type": "yorum",
    "question": "Bir öğrenci sabit duran düzlem aynaya dik doğrultuda 3 m/s hızla yaklaşıyor. Öğrencinin görüntüsü öğrenciye göre kaç m/s hızla yaklaşır?",
    "options": [
      "1,5",
      "3",
      "4,5",
      "6",
      "9"
    ],
    "correctAnswer": 3,
    "solution": "Cisim aynaya 3 m/s yaklaşırken görüntü de aynanın arkasından aynaya 3 m/s yaklaşır. Cisim-görüntü arası uzaklık saniyede 6 m azalır.",
    "hint": "Aynaya göre hem cisim hem görüntü 3 m/s hızla birbirine yaklaşır.",
    "commonMistake": "Görüntünün sabit olduğunu düşünerek 3 m/s demek.",
    "teacherNote": "Düzlem aynada görüntü hareketini bağıl hızla birleştirir."
  },
  {
    "id": "tytfiz-optik-q32",
    "topic": "tytfiz-optik",
    "subtopic": "tytfiz-optik-s4",
    "outcome": "Kırılmada hız, frekans ve dalga boyu değişimini yorumlar.",
    "difficulty": "zor",
    "type": "yorum",
    "question": "Tek renkli bir ışık ışını havadan cama geçiyor. Camdaki ışık hızı havadakinden küçüktür.\n\nBu geçişte ışığın frekansı f, dalga boyu λ ve hızı v için hangisi doğrudur?",
    "options": [
      "f azalır, λ azalır, v azalır.",
      "f değişmez, λ azalır, v azalır.",
      "f değişmez, λ artar, v azalır.",
      "f artar, λ azalır, v değişmez.",
      "f azalır, λ değişmez, v azalır."
    ],
    "correctAnswer": 1,
    "solution": "Frekansı kaynak belirler ve ortam geçişinde değişmez. v = fλ olduğundan hız azalırken f sabitse dalga boyu da azalır.",
    "hint": "Sınır geçişinde değişmeyen büyüklük frekanstır.",
    "commonMistake": "Hız azalınca frekansın da azalacağını düşünmek.",
    "teacherNote": "Kırılmanın temel niceliklerini yorumlatır."
  }
];
