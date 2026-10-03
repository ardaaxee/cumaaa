import type { QuestionSeed } from '../../domain/types';

/** Özgün AYT fizik paketi: işlem, yorum, grafik ve deney mantığı ağırlıklı. */
export const questions: QuestionSeed[] = [
  {
    "id": "aytfiz-hareket-q31",
    "topic": "aytfiz-hareket",
    "subtopic": "aytfiz-hareket-s2",
    "outcome": "Sabit ivmeli harekette hız ve yer değiştirmeyi birlikte hesaplar.",
    "difficulty": "orta",
    "type": "cok-adimli",
    "question": "Bir araç 6 m/s ilk hızla doğrusal yolda hareket ederken 3 m/s² sabit ivmeyle 4 saniye hızlanıyor. Daha sonra 2 saniye boyunca ulaştığı hızla sabit gidiyor.\n\nAracın toplam 6 saniyedeki yer değiştirmesi kaç metredir?",
    "options": [
      "72",
      "84",
      "96",
      "108",
      "120"
    ],
    "correctAnswer": 1,
    "solution": "İlk 4 saniye: x1 = 6·4 + 1/2·3·4² = 48 m.\n4. saniye sonunda v = 6+3·4 = 18 m/s.\nSon 2 saniye: x2 = 18·2 = 36 m.\nToplam = 84 m.",
    "hint": "Hızlanma sonundaki hızı ikinci zaman aralığında sabit hız olarak kullan.",
    "commonMistake": "Tüm 6 saniyeyi ivmeli kabul etmek.",
    "teacherNote": "Parçalı hareketi doğru modele ayırmayı ölçer."
  },
  {
    "id": "aytfiz-hareket-q32",
    "topic": "aytfiz-hareket",
    "subtopic": "aytfiz-hareket-s4",
    "outcome": "Eğik atışta bileşenleri kullanarak menzil ve maksimum yüksekliği hesaplar.",
    "difficulty": "zor",
    "type": "islem",
    "question": "Bir cisim yerden 25 m/s hızla yatayla 53° açı yaparak atılıyor. sin53° = 0,8, cos53° = 0,6 ve g = 10 m/s² alınırsa cismin menzili ve maksimum yüksekliği sırasıyla kaçtır?",
    "options": [
      "40 m ve 20 m",
      "60 m ve 20 m",
      "60 m ve 25 m",
      "75 m ve 20 m",
      "75 m ve 25 m"
    ],
    "correctAnswer": 1,
    "solution": "vx = 15 m/s, vy = 20 m/s.\nUçuş süresi T = 2vy/g = 4 s.\nMenzil = 15·4 = 60 m.\nMaksimum yükseklik = 20²/(2·10) = 20 m.",
    "hint": "İlk hızı yatay ve düşey bileşenlerine ayır.",
    "commonMistake": "25 m/s hızın tamamını yatay veya düşey hız olarak kullanmak.",
    "teacherNote": "Eğik atışta iki bağımsız hareketi tek soruda birleştirir."
  },
  {
    "id": "aytfiz-newton-yasalari-q31",
    "topic": "aytfiz-newton-yasalari",
    "subtopic": "aytfiz-newton-yasalari-s3",
    "outcome": "İple bağlı cisim sistemlerinde ivme ve ip gerilmesini hesaplar.",
    "difficulty": "orta",
    "type": "islem",
    "question": "Sürtünmesiz yatay masadaki 3 kg kütleli cisim, ideal makara üzerinden sarkan 2 kg kütleli cisme hafif iple bağlıdır. g = 10 m/s² olduğuna göre sistemin ivmesi ve ip gerilmesi kaçtır?",
    "options": [
      "2 m/s² ve 6 N",
      "4 m/s² ve 12 N",
      "4 m/s² ve 20 N",
      "5 m/s² ve 15 N",
      "6 m/s² ve 18 N"
    ],
    "correctAnswer": 1,
    "solution": "Sistemi hareket ettiren dış kuvvet 2·10 = 20 N, toplam kütle 5 kg’dır. a = 20/5 = 4 m/s². Masadaki 3 kg cisim için T = ma = 3·4 = 12 N.",
    "hint": "Önce iki cismi tek sistem kabul ederek ivmeyi bul.",
    "commonMistake": "Sarkan cismin ağırlığını ip gerilmesi sanmak.",
    "teacherNote": "Sistem yaklaşımı ve tek cisim denklemini art arda kullandırır."
  },
  {
    "id": "aytfiz-newton-yasalari-q32",
    "topic": "aytfiz-newton-yasalari",
    "subtopic": "aytfiz-newton-yasalari-s5",
    "outcome": "İvmeli sistemlerde görünür ağırlığı yorumlar.",
    "difficulty": "zor",
    "type": "yorum",
    "question": "50 kg kütleli bir öğrenci asansörde tartıya çıkıyor ve tartı 400 N gösteriyor. g = 10 m/s².\n\nBu anda asansörün hareketiyle ilgili hangisi kesin olarak söylenebilir?",
    "options": [
      "Aşağı doğru 2 m/s² ivmelenmektedir.",
      "Yukarı doğru 2 m/s² ivmelenmektedir.",
      "Aşağı doğru 2 m/s hızla hareket etmektedir.",
      "Yukarı doğru sabit hızla hareket etmektedir.",
      "Aşağı doğru hareket etmektedir."
    ],
    "correctAnswer": 0,
    "solution": "mg = 500 N, N = 400 N. Yukarı pozitif: N−mg = ma ⇒ 400−500 = 50a ⇒ a = −2 m/s². İvme aşağı yönlüdür; hızın yönü kesin değildir.",
    "hint": "Tartının gösterdiği değer normal kuvvettir; hareket yönünü değil ivmeyi belirleyebilirsin.",
    "commonMistake": "İvme aşağı olduğu için asansörün kesinlikle aşağı hareket ettiğini söylemek.",
    "teacherNote": "Hız ile ivme yönünü ayırt etmeyi ölçer."
  },
  {
    "id": "aytfiz-is-enerji-q31",
    "topic": "aytfiz-is-enerji",
    "subtopic": "aytfiz-is-enerji-s3",
    "outcome": "Esneklik potansiyel enerjisini kinetik enerjiye dönüştürür.",
    "difficulty": "orta",
    "type": "islem",
    "question": "Yatay sürtünmesiz düzlemde 200 N/m yay sabitli bir yay 20 cm sıkıştırılıyor ve 2 kg kütleli cisim yaydan serbest bırakılıyor. Yay doğal boyuna geldiğinde cismin hızı kaç m/s olur?",
    "options": [
      "1",
      "2",
      "2√2",
      "4",
      "5"
    ],
    "correctAnswer": 1,
    "solution": "Eyay = 1/2·200·(0,20)² = 4 J.\n1/2·2·v² = 4 ⇒ v = 2 m/s.",
    "hint": "Sürtünme yoksa yay enerjisi tamamen kinetik enerjiye dönüşür.",
    "commonMistake": "20 cm’yi 20 m gibi kullanmak.",
    "teacherNote": "Birim dönüşümü ve enerji korunumu birlikte ölçülür."
  },
  {
    "id": "aytfiz-is-enerji-q32",
    "topic": "aytfiz-is-enerji",
    "subtopic": "aytfiz-is-enerji-s4",
    "outcome": "Sürtünmeli ortamda mekanik enerji kaybını hesaplar.",
    "difficulty": "zor",
    "type": "cok-adimli",
    "question": "5 kg kütleli bir cisim 5 m yüksekliğindeki sürtünmesiz rampadan serbest bırakılıyor. Rampa sonunda 10 m uzunluğunda yatay pürüzlü bölgeye giriyor. Yatay bölgedeki sürtünme katsayısı 0,20 ve g = 10 m/s²’dir.\n\nCisim pürüzlü bölgenin sonunda yaklaşık kaç m/s hızla hareket eder?",
    "options": [
      "4",
      "6",
      "8",
      "10",
      "12"
    ],
    "correctAnswer": 2,
    "solution": "Rampa sonunda enerji mgh = 5·10·5 = 250 J.\nYatayda sürtünme f = 0,2·5·10 = 10 N, kayıp enerji 10·10 = 100 J.\nSon kinetik enerji 150 J: 1/2·5·v² = 150 ⇒ v² = 60 ⇒ v ≈ 7,75 m/s ≈ 8 m/s.",
    "hint": "Önce rampadan gelen enerjiyi, sonra sürtünmenin yaptığı işi hesapla.",
    "commonMistake": "Sürtünmeyi rampada da varmış gibi hesaba katmak.",
    "teacherNote": "Enerji kaybını çok adımlı işlemle ölçer."
  },
  {
    "id": "aytfiz-elektriksel-kuvvet-alan-q31",
    "topic": "aytfiz-elektriksel-kuvvet-alan",
    "subtopic": "aytfiz-elektriksel-kuvvet-alan-s1",
    "outcome": "Coulomb yasasını kullanarak kuvvet oranı hesaplar.",
    "difficulty": "orta",
    "type": "islem",
    "question": "Aralarındaki uzaklık d olan +q ve +2q yükleri birbirini F kuvvetiyle itiyor. +2q yükü +6q yapılır ve uzaklık 2d’ye çıkarılırsa yeni elektriksel kuvvet kaç F olur?",
    "options": [
      "1/2 F",
      "3/4 F",
      "F",
      "3/2 F",
      "3F"
    ],
    "correctAnswer": 1,
    "solution": "F ∝ q1q2/r². Yeni/eski oranı = (6/2)/(2²) = 3/4.",
    "hint": "Yük çarpanı doğrusal, uzaklık çarpanı karesel etki eder.",
    "commonMistake": "Uzaklığın karesini unutmak.",
    "teacherNote": "Oran kurarak hızlı Coulomb hesabını ölçer."
  },
  {
    "id": "aytfiz-elektriksel-kuvvet-alan-q32",
    "topic": "aytfiz-elektriksel-kuvvet-alan",
    "subtopic": "aytfiz-elektriksel-kuvvet-alan-s2",
    "outcome": "Elektrik alanın yönünü yorumlar.",
    "difficulty": "zor",
    "type": "yorum",
    "question": "Aynı doğrultuda bulunan +Q ve −Q noktasal yüklerinin tam orta noktasındaki elektrik alan için hangisi doğrudur?",
    "options": [
      "Sıfırdır.",
      "+Q’dan −Q’ya doğrudur ve sıfır değildir.",
      "−Q’dan +Q’ya doğrudur ve sıfır değildir.",
      "Yalnız +Q yükünün alanına eşittir.",
      "Yalnız −Q yükünün alanına eşittir."
    ],
    "correctAnswer": 1,
    "solution": "Orta noktada +Q’nun alanı pozitif yükten dışarı, −Q’nun alanı negatif yüke doğru yönelir. İkisi de +Q’dan −Q’ya doğrudur ve toplanır.",
    "hint": "Elektrik alan pozitif yükten çıkar, negatif yüke girer.",
    "commonMistake": "Yükler eşit büyüklükte olduğu için alanların birbirini götürdüğünü düşünmek.",
    "teacherNote": "Vektörel alan yönünü kavramsal olarak ölçer."
  },
  {
    "id": "aytfiz-elektriksel-potansiyel-q31",
    "topic": "aytfiz-elektriksel-potansiyel",
    "subtopic": "aytfiz-elektriksel-potansiyel-s2",
    "outcome": "Noktasal yüklerin oluşturduğu elektriksel potansiyeli hesaplar.",
    "difficulty": "orta",
    "type": "islem",
    "question": "Bir P noktasına uzaklıkları sırasıyla r ve 2r olan +2q ve −q yüklerinin P noktasında oluşturduğu toplam elektriksel potansiyel nedir?",
    "options": [
      "0",
      "kq/2r",
      "kq/r",
      "3kq/2r",
      "2kq/r"
    ],
    "correctAnswer": 3,
    "solution": "V = k·2q/r + k·(−q)/(2r) = 2kq/r − kq/(2r) = 3kq/(2r).",
    "hint": "Potansiyelde yön yoktur; işaretli değerleri skaler topla.",
    "commonMistake": "Elektrik alan gibi vektörel toplamaya çalışmak.",
    "teacherNote": "Skaler potansiyel toplamını ölçer."
  },
  {
    "id": "aytfiz-cembersel-hareket-q31",
    "topic": "aytfiz-cembersel-hareket",
    "subtopic": "aytfiz-cembersel-hareket-s2",
    "outcome": "Merkezcil kuvveti hesaplar.",
    "difficulty": "orta",
    "type": "islem",
    "question": "0,5 kg kütleli bir cisim 2 m yarıçaplı çember üzerinde 6 m/s sabit süratle hareket ediyor. Cisme etki eden merkezcil kuvvet kaç newtondur?",
    "options": [
      "4,5",
      "6",
      "9",
      "12",
      "18"
    ],
    "correctAnswer": 2,
    "solution": "Düzgün çembersel harekette gerekli merkezcil kuvvet F = mv²/r bağıntısıyla bulunur. m = 0,5 kg, v = 6 m/s ve r = 2 m olduğundan F = 0,5·6²/2 = 0,5·36/2 = 18/2 = 9 N olur. Kuvvetin yönü her an çemberin merkezine doğrudur.",
    "hint": "Merkezcil kuvvet için mv²/r bağıntısını kullan.",
    "commonMistake": "r yerine r² kullanmak.",
    "teacherNote": "Temel merkezcil kuvvet hesabını ölçer."
  },
  {
    "id": "aytfiz-cembersel-hareket-q32",
    "topic": "aytfiz-cembersel-hareket",
    "subtopic": "aytfiz-cembersel-hareket-s3",
    "outcome": "Virajlı yolda güvenli hız sınırını yorumlar.",
    "difficulty": "zor",
    "type": "yorum",
    "question": "Yatay ve eğimsiz bir virajda merkezcil kuvveti statik sürtünme sağlıyor. Yağmurda statik sürtünme katsayısı yarıya düşerse aynı virajda kaymadan dönülebilecek en büyük hız nasıl değişir?",
    "options": [
      "Yarıya iner.",
      "1/√2 katına iner.",
      "Değişmez.",
      "√2 katına çıkar.",
      "İki katına çıkar."
    ],
    "correctAnswer": 1,
    "solution": "Sınır durumda μmg = mv²/r ⇒ vmax = √(μgr). μ yarıya düşerse hız 1/√2 katına iner.",
    "hint": "Maksimum hız sürtünme katsayısının kareköküyle orantılıdır.",
    "commonMistake": "Hızın μ ile doğrusal orantılı olduğunu düşünmek.",
    "teacherNote": "Formülden oran yorumlamayı ölçer."
  },
  {
    "id": "aytfiz-basit-harmonik-hareket-q31",
    "topic": "aytfiz-basit-harmonik-hareket",
    "subtopic": "aytfiz-basit-harmonik-hareket-s3",
    "outcome": "Yay sarkacının periyodunu hesaplar.",
    "difficulty": "orta",
    "type": "islem",
    "question": "2 kg kütleli bir cisim 200 N/m yay sabitli yatay bir yaya bağlanarak basit harmonik hareket yapıyor. Sistemin periyodu kaç saniyedir? (π = 3 alınız.)",
    "options": [
      "0,3",
      "0,6",
      "1,2",
      "3",
      "6"
    ],
    "correctAnswer": 1,
    "solution": "T = 2π√(m/k) = 6·√(2/200) = 6·0,1 = 0,6 s.",
    "hint": "Yay sarkacında T = 2π√(m/k).",
    "commonMistake": "k/m oranını karekök içine almak.",
    "teacherNote": "Periyot bağıntısının doğru kullanımını ölçer."
  },
  {
    "id": "aytfiz-dalga-mekanigi-q31",
    "topic": "aytfiz-dalga-mekanigi",
    "subtopic": "aytfiz-dalga-mekanigi-s2",
    "outcome": "Young çift yarık deneyinde saçak genişliğini hesaplar.",
    "difficulty": "orta",
    "type": "islem",
    "question": "Dalga boyu 600 nm olan tek renkli ışıkla yapılan çift yarık deneyinde ekran yarıklardan 2 m uzakta, yarıklar arası uzaklık 0,5 mm’dir. Saçak genişliği kaç mm’dir?",
    "options": [
      "1,2",
      "2,0",
      "2,4",
      "3,0",
      "4,8"
    ],
    "correctAnswer": 2,
    "solution": "Δy = λL/d = (600·10⁻⁹·2)/(0,5·10⁻³) = 2,4·10⁻³ m = 2,4 mm.",
    "hint": "Tüm uzunlukları metre cinsine çevir.",
    "commonMistake": "nm ve mm dönüşümlerini karıştırmak.",
    "teacherNote": "Birim dönüşümü ağırlıklı girişim hesabını ölçer."
  },
  {
    "id": "aytfiz-dalga-mekanigi-q32",
    "topic": "aytfiz-dalga-mekanigi",
    "subtopic": "aytfiz-dalga-mekanigi-s4",
    "outcome": "Doppler olayında algılanan frekans değişimini yorumlar.",
    "difficulty": "zor",
    "type": "yorum",
    "question": "Durgun bir gözlemciye doğru sabit hızla yaklaşan siren kaynağı, gözlemciyi geçip aynı hızla uzaklaşmaya devam ediyor. Ortam ve kaynak frekansı değişmediğine göre gözlemcinin algıladığı ses için hangisi doğrudur?",
    "options": [
      "Yaklaşırken frekans daha düşük, geçince daha yüksek olur.",
      "Yaklaşırken ve uzaklaşırken frekans aynıdır.",
      "Yaklaşırken frekans daha yüksek, uzaklaşırken daha düşük olur.",
      "Yalnız şiddet değişir, frekans değişmez.",
      "Kaynak gözlemciyi geçtiği anda ses hızı değişir."
    ],
    "correctAnswer": 2,
    "solution": "Kaynak yaklaşırken dalga cepheleri sıkışır ve algılanan frekans yükselir. Uzaklaşırken cepheler seyrekleşir ve algılanan frekans düşer. Ortamdaki ses hızı değişmez.",
    "hint": "Kaynak yaklaşırken gözlemci tarafındaki dalga boyu küçülür.",
    "commonMistake": "Kaynağın kendi frekansı değişmediği için gözlenen frekansın da değişmeyeceğini düşünmek.",
    "teacherNote": "Doppler olayını nitel olarak yorumlatır."
  },
  {
    "id": "aytfiz-itme-momentum-q31",
    "topic": "aytfiz-itme-momentum",
    "subtopic": "aytfiz-itme-momentum-s1",
    "outcome": "Kuvvet-zaman grafiğinden itmeyi hesaplar.",
    "difficulty": "zor",
    "type": "grafik",
    "question": "Başlangıçta durgun 2 kg kütleli bir cisme etki eden net kuvvet 0–4 s arasında 0’dan 12 N’a doğrusal artıyor, 4–6 s arasında 12 N sabit kalıyor. Cismin 6. saniye sonundaki hızı kaç m/s’dir?",
    "options": [
      "12",
      "18",
      "24",
      "30",
      "36"
    ],
    "correctAnswer": 2,
    "solution": "İtme F–t grafiğinin alanıdır. Üçgen alanı 12·4/2 = 24 N·s, dikdörtgen alanı 12·2 = 24 N·s. Toplam Δp = 48 N·s. 2v = 48 ⇒ v = 24 m/s.",
    "hint": "Kuvvet-zaman alanı momentum değişimini verir.",
    "commonMistake": "Son kuvveti 6 saniyenin tamamında sabit kabul etmek.",
    "teacherNote": "Grafik alanı ve momentum ilişkisini birleştirir."
  },
  {
    "id": "aytfiz-kuvvet-tork-denge-q31",
    "topic": "aytfiz-kuvvet-tork-denge",
    "subtopic": "aytfiz-kuvvet-tork-denge-s1",
    "outcome": "Tork dengesini kullanarak kuvvet hesabı yapar.",
    "difficulty": "orta",
    "type": "islem",
    "question": "Ağırlığı ihmal edilen 4 m uzunluğundaki yatay çubuk ortasından desteklenmiştir. Sol uca 30 N aşağı yönlü kuvvet uygulanıyor. Dengenin sağlanması için desteğin sağ tarafında destekten 1 m uzaklığa aşağı yönlü kaç N kuvvet uygulanmalıdır?",
    "options": [
      "30",
      "45",
      "60",
      "90",
      "120"
    ],
    "correctAnswer": 2,
    "solution": "Sol moment kolu 2 m: τsol = 30·2 = 60 N·m. Sağda F·1 = 60 ⇒ F = 60 N.",
    "hint": "Denge için zıt yönlü torkların büyüklükleri eşit olmalıdır.",
    "commonMistake": "Kuvvetleri eşit almak ve moment kolunu göz ardı etmek.",
    "teacherNote": "Torkta kuvvet ve moment kolunu birlikte ölçer."
  }
];
