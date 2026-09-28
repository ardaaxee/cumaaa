import type { QuestionSeed } from '../../domain/types';

/** ayt-fizik: ek özgün pratik sorular (3. set). ÖSYM sorusu değildir. */
export const questions: QuestionSeed[] = [
  {
    "id": "aytfiz-vektorler-q301",
    "topic": "aytfiz-vektorler",
    "subtopic": "aytfiz-vektorler-s1",
    "outcome": "Vektörlerin özelliklerini (büyüklük, doğrultu, yön) açıklar.",
    "difficulty": "kolay",
    "type": "onculu",
    "question": "Fiziksel büyüklüklerle ilgili aşağıdaki ifadelerden hangileri doğrudur?",
    "premises": [
      "İş skaler bir büyüklüktür.",
      "Momentum, hız ile aynı yönlü vektörel bir büyüklüktür.",
      "Elektrik akımının yönü olduğu için akım vektörel bir büyüklüktür."
    ],
    "options": [
      "Yalnız I",
      "Yalnız II",
      "I ve II",
      "II ve III",
      "I, II ve III"
    ],
    "correctAnswer": 2,
    "solution": "I. İş, kuvvet ile yer değiştirmenin skaler çarpımıdır; yönü yoktur, skalerdir — doğru. II. Momentum, kütle (skaler) ile hızın (vektör) çarpımıdır; hız ile aynı yönlü bir vektördür — doğru. III. Elektrik akımının bir akış yönü tanımlansa da akımlar vektörel toplama kuralına uymaz (düğüm noktasında cebirsel toplanır); akım skaler kabul edilir — yanlış. Doğru cevap I ve II’dir.",
    "hint": "Bir büyüklüğün vektör olması için yalnız yönünün olması yetmez; vektörel toplama kuralına da uymalıdır.",
    "commonMistake": "‘Yönü var, o hâlde vektördür’ diyerek elektrik akımını vektör sanmak.",
    "teacherNote": "Skaler–vektör ayrımını ezber değil tanım üzerinden yapmayı ölçer; akım en sık tuzak örnektir."
  },
  {
    "id": "aytfiz-vektorler-q302",
    "topic": "aytfiz-vektorler",
    "subtopic": "aytfiz-vektorler-s2",
    "outcome": "İki ve daha fazla vektörün bileşkesini uç uca ekleme ve paralelkenar yöntemleriyle bulur.",
    "difficulty": "orta",
    "type": "islem",
    "question": "Dik koordinat sisteminde A⃗ = (3, 4) ve B⃗ = (−1, 2) vektörleri veriliyor.\n\nBuna göre 2A⃗ − B⃗ vektörünün büyüklüğü kaç birimdir?",
    "options": [
      "√37",
      "√53",
      "√65",
      "√85",
      "√101"
    ],
    "correctAnswer": 3,
    "solution": "2A⃗ = (6, 8). 2A⃗ − B⃗ = (6 − (−1), 8 − 2) = (7, 6). Büyüklük = √(7² + 6²) = √(49 + 36) = √85 birimdir.",
    "hint": "Önce 2A⃗’yı bileşen bileşen bul, sonra B⃗’nin bileşenlerini çıkar.",
    "commonMistake": "−B⃗ yazarken x bileşeninin işaretini değiştirmeyi unutup (5, 6) bulmak (√61) ya da toplamak.",
    "teacherNote": "Bileşenlerle vektör işlemi, özellikle çıkarmada işaret dikkati ölçülür."
  },
  {
    "id": "aytfiz-vektorler-q303",
    "topic": "aytfiz-vektorler",
    "subtopic": "aytfiz-vektorler-s3",
    "outcome": "Bir vektörü dik bileşenlerine ayırır.",
    "difficulty": "orta",
    "type": "islem",
    "question": "Aynı noktaya etki eden iki kuvvetten F₁ = 10 N, +x ekseniyle 37° açı yapacak şekilde birinci bölgeye; F₂ = 10 N ise −x ekseniyle 53° açı yapacak şekilde ikinci bölgeye yönelmiştir.\n\nBu iki kuvvetin bileşkesinin büyüklüğü kaç N’dur? (sin37° = 0,6; cos37° = 0,8)",
    "options": [
      "10",
      "10√2",
      "14",
      "20",
      "2√2"
    ],
    "correctAnswer": 1,
    "solution": "F₁ = (10·cos37°, 10·sin37°) = (8, 6) N. F₂, −x ile 53° yaptığından F₂ = (−10·cos53°, 10·sin53°) = (−6, 8) N. Bileşke R⃗ = (2, 14) N; |R⃗| = √(4 + 196) = √200 = 10√2 N.",
    "hint": "Her kuvveti x ve y bileşenlerine ayır; ikinci kuvvetin x bileşeni negatiftir.",
    "commonMistake": "F₂’nin x bileşenini pozitif alıp (14, 14) bulmak ya da yalnız y bileşenlerini (14 N) cevap sanmak.",
    "teacherNote": "Bileşenlere ayırma ve bölge (işaret) takibi ölçülür; 37°–53° üçgeni YKS’nin temel aracıdır."
  },
  {
    "id": "aytfiz-vektorler-q304",
    "topic": "aytfiz-vektorler",
    "subtopic": "aytfiz-vektorler-s2",
    "outcome": "İki ve daha fazla vektörün bileşkesini uç uca ekleme ve paralelkenar yöntemleriyle bulur.",
    "difficulty": "zor",
    "type": "cok-adimli",
    "question": "Büyüklükleri eşit olan A⃗ ve B⃗ vektörleri için |A⃗| = |B⃗| = 6 birim ve |A⃗ + B⃗| = 6 birimdir.\n\nBuna göre |A⃗ − B⃗| kaç birimdir?",
    "options": [
      "0",
      "3",
      "6",
      "6√2",
      "6√3"
    ],
    "correctAnswer": 4,
    "solution": "|A⃗ + B⃗|² + |A⃗ − B⃗|² = 2(|A⃗|² + |B⃗|²) paralelkenar özdeşliğinden 36 + |A⃗ − B⃗|² = 2(36 + 36) = 144 → |A⃗ − B⃗|² = 108 → |A⃗ − B⃗| = 6√3. (Aynı sonuç: eşit iki vektörün toplamı bir vektöre eşitse aralarındaki açı 120°’dir; fark vektörü 2·6·sin60° = 6√3 olur.)",
    "hint": "Toplam ve fark vektörleri paralelkenarın iki köşegenidir.",
    "commonMistake": "Toplam 6 olduğu için farkın da 6 olacağını düşünmek ya da açıyı 60° sanıp 6 bulmak.",
    "teacherNote": "Vektörler arasındaki açıyı dolaylı bilgiden bulma ve köşegen ilişkisini kullanma becerisi ölçülür."
  },
  {
    "id": "aytfiz-vektorler-q305",
    "topic": "aytfiz-vektorler",
    "subtopic": "aytfiz-vektorler-s3",
    "outcome": "Bir vektörü dik bileşenlerine ayırır.",
    "difficulty": "yeni-nesil",
    "type": "yeni-nesil",
    "question": "Bir tırmanış halkası, aynı düzlemde üç halatla çekilmekte ve dengede durmaktadır. Halatlardan ikisinin uyguladığı kuvvetlerin bileşenleri F⃗₁ = (5, 7) N ve F⃗₂ = (−8, −3) N’dur.\n\nBuna göre üçüncü halatın uyguladığı F⃗₃ kuvvetinin büyüklüğü ve yönü aşağıdakilerden hangisidir? (sin53° = 0,8; cos53° = 0,6)",
    "options": [
      "7 N; −y yönünde",
      "5 N; +x ekseniyle 37° aşağı",
      "5 N; +x ekseniyle 53° aşağı",
      "5 N; −x ekseniyle 53° yukarı",
      "√137 N; +x ekseniyle 45° aşağı"
    ],
    "correctAnswer": 2,
    "solution": "Denge için F⃗₁ + F⃗₂ + F⃗₃ = 0. F⃗₁ + F⃗₂ = (−3, 4) N olduğundan F⃗₃ = (3, −4) N. Büyüklük √(9 + 16) = 5 N. tanθ = 4/3 olduğundan F⃗₃, +x ekseniyle 53° açı yaparak aşağı (dördüncü bölgeye) yönelir.",
    "hint": "Dengede üç kuvvetin toplamı sıfırdır; F⃗₃ = −(F⃗₁ + F⃗₂).",
    "commonMistake": "F⃗₁ + F⃗₂’yi F⃗₃ sanıp yönü ters bulmak ya da tanθ = 4/3 olan açıyı 37° almak.",
    "teacherNote": "Denge koşulunu bileşenlerle uygulama ve açıyı bileşen oranından çıkarma ölçülür."
  },
  {
    "id": "aytfiz-hareket-q301",
    "topic": "aytfiz-hareket",
    "subtopic": "aytfiz-hareket-s1",
    "outcome": "Sabit hızlı iki cismin hareketini birbirine göre yorumlar.",
    "difficulty": "orta",
    "type": "problem",
    "question": "Paralel iki rayda aynı yönde hareket eden trenlerden 100 m uzunluğundaki A treni 72 km/h, 150 m uzunluğundaki B treni 54 km/h sabit hızla gitmektedir. A treninin ön ucu, B treninin arka ucuna yetiştiği anda sollama başlıyor.\n\nA treninin B trenini tamamen geçmesi (A’nın arka ucunun B’nin ön ucunu geçmesi) kaç saniye sürer?",
    "options": [
      "7",
      "10",
      "20",
      "25",
      "50"
    ],
    "correctAnswer": 4,
    "solution": "A’nın B’ye göre bağıl hızı: 72 − 54 = 18 km/h = 5 m/s. Tamamen geçmek için A, B’ye göre iki trenin boyları toplamı kadar (100 + 150 = 250 m) yol almalıdır. t = 250 / 5 = 50 s.",
    "hint": "B’yi duruyor kabul et; A’nın B’ye göre hızı ve B’ye göre alması gereken yolu bul.",
    "commonMistake": "Hızları toplayıp (126 km/h) zıt yön gibi hesaplamak (≈7 s) ya da yalnız bir trenin boyunu almak.",
    "teacherNote": "Bağıl hız ve bağıl yol kavramını birlikte kullanma ölçülür."
  },
  {
    "id": "aytfiz-hareket-q302",
    "topic": "aytfiz-hareket",
    "subtopic": "aytfiz-hareket-s2",
    "outcome": "Sabit ivmeli hareket denklemlerini kullanarak hesaplamalar yapar.",
    "difficulty": "yeni-nesil",
    "type": "yeni-nesil",
    "question": "Bir sürücü eğitiminde ‘durma mesafesi = tepki mesafesi + fren mesafesi’ olarak anlatılıyor. 20 m/s hızla giden bir otomobilin sürücüsü yoldaki engeli görüyor; tepki süresi 0,5 s’dir ve bu sürede araç hızını korur. Ardından frene basılır ve araç 5 m/s² büyüklüğünde sabit ivmeyle yavaşlayarak durur.\n\nBuna göre otomobilin durma mesafesi kaç metredir?",
    "options": [
      "10",
      "30",
      "40",
      "45",
      "50"
    ],
    "correctAnswer": 4,
    "solution": "Tepki mesafesi: 20 · 0,5 = 10 m. Fren mesafesi: v² = 2ax → 400 = 2 · 5 · x → x = 40 m. Durma mesafesi = 10 + 40 = 50 m.",
    "hint": "Hareketi iki evreye ayır: sabit hızlı evre ve düzgün yavaşlayan evre.",
    "commonMistake": "Tepki mesafesini atlayıp yalnız fren mesafesini (40 m) yazmak.",
    "teacherNote": "Gerçek yaşam bağlamında çok evreli hareketi modelleme becerisi ölçülür."
  },
  {
    "id": "aytfiz-hareket-q303",
    "topic": "aytfiz-hareket",
    "subtopic": "aytfiz-hareket-s3",
    "outcome": "Serbest düşme hareketini ve limit hızı açıklar.",
    "difficulty": "zor",
    "type": "cok-adimli",
    "question": "45 m yükseklikteki bir noktadan K topu serbest bırakıldığı anda, bu noktanın tam altındaki yerden L topu 30 m/s hızla düşey yukarı atılıyor.\n\nİki top karşılaştığında yerden yükseklikleri kaç metredir? (g = 10 m/s²; hava direnci önemsiz)",
    "options": [
      "11,25",
      "22,5",
      "30",
      "33,75",
      "40"
    ],
    "correctAnswer": 3,
    "solution": "İki top da aynı g ivmesine sahip olduğundan birbirlerine göre ivmeleri sıfırdır; bağıl hız 30 m/s sabittir. Karşılaşma süresi t = 45 / 30 = 1,5 s. K’nin düştüğü yol: ½ · 10 · 1,5² = 11,25 m. Karşılaşma yüksekliği 45 − 11,25 = 33,75 m.",
    "hint": "İki topun birbirine göre hareketi düzgün doğrusal harekettir.",
    "commonMistake": "K’nin düştüğü yolu (11,25 m) karşılaşma yüksekliği sanmak.",
    "teacherNote": "Serbest düşme ile düşey atışı bağıl hareket bakışıyla birleştirme ölçülür."
  },
  {
    "id": "aytfiz-hareket-q304",
    "topic": "aytfiz-hareket",
    "subtopic": "aytfiz-hareket-s4",
    "outcome": "Yatay atış hareketini bileşenlerine ayırarak analiz eder.",
    "difficulty": "zor",
    "type": "problem",
    "question": "Yerden 20 m yükseklikteki bir binanın çatısından bir top, yatayla yukarı doğru 37° açı yapacak şekilde 25 m/s hızla atılıyor.\n\nTop yere çarptığında, binanın atış yapılan duvarından yatayda kaç m uzaktadır? (g = 10 m/s²; sin37° = 0,6; cos37° = 0,8; hava direnci önemsiz)",
    "options": [
      "60",
      "80",
      "48",
      "100",
      "120"
    ],
    "correctAnswer": 1,
    "solution": "vₓ = 25 · 0,8 = 20 m/s, v_y = 25 · 0,6 = 15 m/s. Düşeyde (yukarı +): −20 = 15t − 5t² → t² − 3t − 4 = 0 → t = 4 s. Yatay uzaklık x = 20 · 4 = 80 m.",
    "hint": "Düşey konum denklemini atış noktasına göre yaz; yer −20 m’dedir.",
    "commonMistake": "Yalnız tepe noktasına çıkış süresini (1,5 s) ya da düz zemin menzilini (60 m) kullanmak.",
    "teacherNote": "Eğik atışta yükseklik farkını hesaba katıp ikinci dereceden denklem kurma ölçülür."
  },
  {
    "id": "aytfiz-newton-yasalari-q301",
    "topic": "aytfiz-newton-yasalari",
    "subtopic": "aytfiz-newton-yasalari-s4",
    "outcome": "Eğik düzlemde kuvvetleri bileşenlerine ayırarak hareketi analiz eder.",
    "difficulty": "orta",
    "type": "islem",
    "question": "Eğim açısı 37° olan eğik düzlemin üzerine konan bir blok, durgun hâlden aşağı doğru kaymaya başlıyor. Blok ile düzlem arasındaki kinetik sürtünme katsayısı 0,5’tir.\n\nBloğun 4. saniyenin sonundaki hızı kaç m/s’dir? (g = 10 m/s²; sin37° = 0,6; cos37° = 0,8)",
    "options": [
      "8",
      "12",
      "16",
      "20",
      "24"
    ],
    "correctAnswer": 0,
    "solution": "Düzleme paralel net kuvvet: mg·sin37° − μ·mg·cos37°. İvme a = g(sin37° − μcos37°) = 10(0,6 − 0,5 · 0,8) = 2 m/s². v = a·t = 2 · 4 = 8 m/s.",
    "hint": "Kütle sadeleşir; ivme yalnız g, açı ve μ’ye bağlıdır.",
    "commonMistake": "Sürtünmeyi unutup a = 6 m/s² alarak 24 m/s bulmak ya da sürtünmeyi mg ile hesaplamak.",
    "teacherNote": "Eğik düzlemde kuvvet bileşenlerini ve sürtünmenin normal kuvvete bağlılığını ölçer."
  },
  {
    "id": "aytfiz-newton-yasalari-q302",
    "topic": "aytfiz-newton-yasalari",
    "subtopic": "aytfiz-newton-yasalari-s3",
    "outcome": "İple bağlı cisim sistemlerinde ivme ve ip gerilmesini hesaplar.",
    "difficulty": "yeni-nesil",
    "type": "yeni-nesil",
    "question": "Sürtünmesi önemsiz düz bir rayda lokomotif, birbirine iplerle bağlı her biri 2000 kg kütleli üç özdeş vagonu çekmektedir. Lokomotifin 1. vagona uyguladığı çekme kuvveti 12 000 N’dur. Vagon sırası lokomotiften itibaren 1, 2, 3’tür.\n\nBuna göre 1. ve 2. vagonlar arasındaki bağlantıda oluşan gerilme kuvveti kaç N’dur?",
    "options": [
      "2000",
      "4000",
      "6000",
      "8000",
      "12 000"
    ],
    "correctAnswer": 3,
    "solution": "Üç vagonun ivmesi a = 12 000 / 6000 = 2 m/s². 1–2 bağlantısı, arkasındaki 2. ve 3. vagonu (4000 kg) çeker: T = 4000 · 2 = 8000 N. (2–3 bağlantısındaki gerilme 4000 N’dur.)",
    "hint": "Bir bağlantının gerilmesi, o bağlantının arkasında kalan toplam kütleyi hızlandırır.",
    "commonMistake": "Yalnız bir vagonun kütlesini kullanıp 4000 N bulmak.",
    "teacherNote": "Bağlantılı sistemlerde sistemin ve alt sistemin ayrı ayrı incelenmesini ölçer."
  },
  {
    "id": "aytfiz-is-enerji-q301",
    "topic": "aytfiz-is-enerji",
    "subtopic": "aytfiz-is-enerji-s1",
    "outcome": "Kuvvetin yaptığı işi hesaplar; kuvvet–yol grafiğinden işi bulur.",
    "difficulty": "yeni-nesil",
    "type": "yeni-nesil",
    "question": "Bisikleti ile birlikte kütlesi 80 kg olan bir sporcu, eğiminin sinüsü 0,05 olan düz bir yokuşu 5 m/s sabit hızla tırmanmaktadır. Hareket boyunca bisiklete toplam 20 N’luk direnç (sürtünme + hava) kuvveti etki etmektedir.\n\nSporcunun pedala aktardığı ortalama güç kaç W’tır? (g = 10 m/s²)",
    "options": [
      "100",
      "200",
      "250",
      "300",
      "400"
    ],
    "correctAnswer": 3,
    "solution": "Sabit hızda itici kuvvet, ağırlığın yokuş boyunca bileşeni ile dirence eşittir: F = mg·sinθ + f = 80 · 10 · 0,05 + 20 = 40 + 20 = 60 N. Güç P = F·v = 60 · 5 = 300 W.",
    "hint": "Sabit hız → net kuvvet sıfır; P = F·v.",
    "commonMistake": "Direnç kuvvetini unutup 200 W bulmak ya da ağırlığın tamamını (800 N) kullanmak.",
    "teacherNote": "Güç kavramını kuvvet–hız çarpımıyla gerçek bağlamda kullanma ölçülür."
  },
  {
    "id": "aytfiz-is-enerji-q302",
    "topic": "aytfiz-is-enerji",
    "subtopic": "aytfiz-is-enerji-s4",
    "outcome": "Mekanik enerjinin korunumunu kullanarak hız ve yükseklik hesaplar.",
    "difficulty": "zor",
    "type": "cok-adimli",
    "question": "2 kg kütleli bir blok, 3 m yükseklikteki sürtünmesiz bir rampanın tepesinden durgun hâlden bırakılıyor. Rampanın bittiği yerden sonra 2 m uzunluğunda, kinetik sürtünme katsayısı 0,5 olan yatay pürüzlü bir bölge, onun ardından sürtünmesiz yatay yolda yay sabiti 500 N/m olan bir yay bulunmaktadır.\n\nBlok yayı en fazla kaç cm sıkıştırır? (g = 10 m/s²)",
    "options": [
      "40",
      "49",
      "60",
      "80",
      "100"
    ],
    "correctAnswer": 0,
    "solution": "Başlangıç enerjisi mgh = 2 · 10 · 3 = 60 J. Pürüzlü bölgede kaybedilen enerji μmgd = 0,5 · 2 · 10 · 2 = 20 J. Yaya ulaşan kinetik enerji 40 J. ½kx² = 40 → x² = 80/500 = 0,16 → x = 0,4 m = 40 cm.",
    "hint": "Enerji muhasebesi yap: potansiyel → (sürtünme kaybı) → yay enerjisi.",
    "commonMistake": "Sürtünme kaybını ihmal edip x = √0,24 ≈ 0,49 m (49 cm) bulmak ya da ½kx² yerine kx² yazmak.",
    "teacherNote": "Enerji korunumunu sürtünmeli bölge ile birlikte, çok aşamalı kullanma becerisi ölçülür."
  },
  {
    "id": "aytfiz-itme-momentum-q301",
    "topic": "aytfiz-itme-momentum",
    "subtopic": "aytfiz-itme-momentum-s1",
    "outcome": "İtme ve çizgisel momentum kavramlarını açıklar.",
    "difficulty": "orta",
    "type": "grafik",
    "question": "Sürtünmesiz yatay düzlemde +x yönünde 5 m/s hızla giden 4 kg kütleli bir cisme, +x yönünde etki eden kuvvetin zamana bağlı grafiği şöyledir: kuvvet 0–2 s arasında 0’dan 40 N’a doğrusal artıyor, 2–4 s arasında 40 N’dan 0’a doğrusal azalıyor.\n\nBuna göre cismin 4. saniyedeki hızı kaç m/s’dir?",
    "options": [
      "20",
      "25",
      "30",
      "45",
      "85"
    ],
    "correctAnswer": 1,
    "solution": "İtme, kuvvet–zaman grafiğinin altındaki alandır: üçgen alanı = ½ · 4 · 40 = 80 N·s. Δp = 80 kg·m/s → Δv = 80 / 4 = 20 m/s. Son hız 5 + 20 = 25 m/s.",
    "hint": "F–t grafiğinin altındaki alan momentum değişimine eşittir.",
    "commonMistake": "İlk hızı eklemeyi unutup 20 m/s demek ya da alanı dikdörtgen gibi (40·4 = 160 N·s) hesaplayıp 45 m/s bulmak.",
    "teacherNote": "Grafik okuma ve itme–momentum teoremini birleştirme ölçülür."
  },
  {
    "id": "aytfiz-itme-momentum-q302",
    "topic": "aytfiz-itme-momentum",
    "subtopic": "aytfiz-itme-momentum-s3",
    "outcome": "Esnek ve esnek olmayan çarpışmaları momentum ve enerji açısından karşılaştırır.",
    "difficulty": "zor",
    "type": "problem",
    "question": "Sürtünmesiz yatay düzlemde 4 m/s hızla giden 1 kg kütleli K cismi, durmakta olan 3 kg kütleli L cismine merkezî ve esnek olarak çarpıyor.\n\nÇarpışmadan sonra K ve L cisimlerinin hızları için aşağıdakilerden hangisi doğrudur?",
    "options": [
      "K durur; L 4/3 m/s ile ilerler",
      "K 2 m/s ile geri döner; L 2 m/s ile ilerler",
      "K ve L birlikte 1 m/s ile ilerler",
      "K 1 m/s ile ilerler; L 1 m/s ile ilerler",
      "K 4 m/s ile geri döner; L durur"
    ],
    "correctAnswer": 1,
    "solution": "Esnek merkezî çarpışmada: v_K′ = (m_K − m_L)/(m_K + m_L) · v = (1 − 3)/4 · 4 = −2 m/s (geri); v_L′ = 2m_K/(m_K + m_L) · v = 2/4 · 4 = 2 m/s. Kontrol: momentum 4 = −2 + 6 ✓; kinetik enerji 8 J = 2 J + 6 J ✓.",
    "hint": "Hem momentumu hem kinetik enerjiyi korumak zorundasın.",
    "commonMistake": "Tamamen esnek olmayan çarpışma gibi ortak hız (1 m/s) bulmak.",
    "teacherNote": "Esnek çarpışmada iki korunumu birlikte kullanma ve sonuçları doğrulama ölçülür."
  },
  {
    "id": "aytfiz-kuvvet-tork-denge-q301",
    "topic": "aytfiz-kuvvet-tork-denge",
    "subtopic": "aytfiz-kuvvet-tork-denge-s1",
    "outcome": "Torkun tanımını yapar ve büyüklüğünü hesaplar.",
    "difficulty": "kolay",
    "type": "islem",
    "question": "Bir kapı, menteşesinden 0,8 m uzaklıktaki koldan kapı yüzeyine dik 30 N’luk kuvvetle açılabilmektedir.\n\nAynı torku menteşeden 0,2 m uzaklıktaki bir noktadan, kapı yüzeyine dik kuvvetle elde etmek için kaç N’luk kuvvet gerekir?",
    "options": [
      "7,5",
      "30",
      "60",
      "90",
      "120"
    ],
    "correctAnswer": 4,
    "solution": "Tork τ = F·d = 30 · 0,8 = 24 N·m. Aynı tork için F′ · 0,2 = 24 → F′ = 120 N. Kuvvet kolu 4 kat kısaldığı için kuvvet 4 kat artar.",
    "hint": "τ = F · d (d: dönme eksenine dik uzaklık).",
    "commonMistake": "Uzaklıkla kuvveti doğru orantılı sanıp 7,5 N ya da farkla hesaplayıp başka değer bulmak.",
    "teacherNote": "Torkun kuvvet koluna bağlılığını günlük bir örnekle ölçer."
  },
  {
    "id": "aytfiz-kuvvet-tork-denge-q302",
    "topic": "aytfiz-kuvvet-tork-denge",
    "subtopic": "aytfiz-kuvvet-tork-denge-s2",
    "outcome": "Cisimlerin öteleme ve dönme dengesi şartlarını açıklar.",
    "difficulty": "orta",
    "type": "onculu",
    "question": "Katı bir cismin dengesiyle ilgili aşağıdaki ifadelerden hangileri doğrudur?",
    "premises": [
      "Bir cisme etki eden net kuvvet sıfırsa net tork da kesinlikle sıfırdır.",
      "Bir kuvvet çiftinin torku, torkun hesaplandığı noktaya bağlı değildir.",
      "Dengedeki bir cisimde net tork, seçilen her noktaya göre sıfırdır."
    ],
    "options": [
      "Yalnız I",
      "Yalnız II",
      "I ve II",
      "II ve III",
      "I, II ve III"
    ],
    "correctAnswer": 3,
    "solution": "I. Kuvvet çiftinde net kuvvet sıfırdır ama net tork sıfır değildir; cisim döner. Yanlış. II. Kuvvet çiftinin torku F·d’dir ve seçilen noktadan bağımsızdır. Doğru. III. Dengedeki bir cisimde net kuvvet sıfır olduğundan net tork herhangi bir noktaya göre sıfırdır. Doğru.",
    "hint": "Kuvvet çiftini düşün: eşit, zıt, farklı doğrultulu iki kuvvet.",
    "commonMistake": "Net kuvvet sıfır ise cismin mutlaka dengede olduğunu sanmak.",
    "teacherNote": "Öteleme ve dönme dengesinin ayrı iki koşul olduğunu kavramayı ölçer."
  },
  {
    "id": "aytfiz-kuvvet-tork-denge-q303",
    "topic": "aytfiz-kuvvet-tork-denge",
    "subtopic": "aytfiz-kuvvet-tork-denge-s3",
    "outcome": "Ağırlıklı çubukların dengesiyle ilgili hesaplamalar yapar.",
    "difficulty": "zor",
    "type": "problem",
    "question": "3 m uzunluğunda ve 60 N ağırlığındaki türdeş AB çubuğu, A ucundan ve A’dan 2 m uzaklıktaki O noktasından iki destek üzerine yatay olarak konmuştur.\n\nÇubuğun devrilmeden yatay kalabilmesi için B ucuna asılabilecek yükün ağırlığı en fazla kaç N olabilir?",
    "options": [
      "30",
      "40",
      "45",
      "60",
      "90"
    ],
    "correctAnswer": 0,
    "solution": "Yük arttıkça A desteğinin tepkisi azalır; devrilme sınırında N_A = 0 olur. O noktasına göre tork: çubuğun ağırlığı O’nun A tarafında 0,5 m uzakta (orta nokta A’dan 1,5 m), yük ise B tarafında 1 m uzaktadır. 60 · 0,5 = W · 1 → W = 30 N.",
    "hint": "Devrilme anında uzaktaki desteğin tepki kuvveti sıfırdır.",
    "commonMistake": "Torku A ucuna göre alıp iki bilinmeyenle kalmak ya da ağırlık merkezini yanlış yere koymak.",
    "teacherNote": "Devrilme sınırını tepki kuvvetinin sıfırlanmasıyla ifade etme becerisi ölçülür."
  },
  {
    "id": "aytfiz-kuvvet-tork-denge-q304",
    "topic": "aytfiz-kuvvet-tork-denge",
    "subtopic": "aytfiz-kuvvet-tork-denge-s2",
    "outcome": "Cisimlerin öteleme ve dönme dengesi şartlarını açıklar.",
    "difficulty": "orta",
    "type": "islem",
    "question": "60 N ağırlığındaki bir lamba, tavana bağlı iki iple asılıdır ve dengededir. İplerden biri yatayla 37°, diğeri yatayla 53° açı yapmaktadır (iki ip lambanın farklı yanlarındadır).\n\nYatayla 53° açı yapan ipteki gerilme kuvveti kaç N’dur? (sin37° = 0,6; cos37° = 0,8)",
    "options": [
      "30",
      "36",
      "48",
      "60",
      "80"
    ],
    "correctAnswer": 2,
    "solution": "Yatay denge: T₁·cos37° = T₂·cos53° → 0,8T₁ = 0,6T₂ → T₂ = 4T₁/3. Düşey denge: T₁·sin37° + T₂·sin53° = 60 → 0,6T₁ + 0,8 · 4T₁/3 = 60 → T₁ = 36 N, T₂ = 48 N. (İpler arası açı 90° olduğundan T₂ = 60·cos37° = 48 N da yazılabilir.)",
    "hint": "Yatay ve düşey bileşenler için ayrı denge denklemleri yaz.",
    "commonMistake": "Dik ipteki gerilmenin daha küçük olduğunu sanıp 36 N seçmek.",
    "teacherNote": "Kesişen kuvvetlerde denge ve daha dik ipin daha çok yük taşıdığı sezgisi ölçülür."
  },
  {
    "id": "aytfiz-kuvvet-tork-denge-q305",
    "topic": "aytfiz-kuvvet-tork-denge",
    "subtopic": "aytfiz-kuvvet-tork-denge-s3",
    "outcome": "Ağırlıklı çubukların dengesiyle ilgili hesaplamalar yapar.",
    "difficulty": "yeni-nesil",
    "type": "yeni-nesil",
    "question": "Bir kule vincinin yatay kolu kule üzerindeki O noktasından desteklidir. Kolun bir tarafında O’dan 5 m uzakta 20 000 N’luk karşı ağırlık bulunur. Diğer tarafta kolun kendi ağırlığı (4000 N) O’dan 5 m uzakta etki eder ve bu tarafta yük arabası kol boyunca hareket edebilir.\n\n8000 N’luk bir yük kaldırılırken O noktasına göre net torkun sıfır olması için yük arabası O’dan kaç m uzakta olmalıdır?",
    "options": [
      "10",
      "12,5",
      "15",
      "17,5",
      "20"
    ],
    "correctAnswer": 0,
    "solution": "O’ya göre torklar: karşı ağırlık 20 000 · 5 = 100 000 N·m (bir yönde). Diğer yönde kolun ağırlığı 4000 · 5 = 20 000 N·m ve yük 8000 · x. Denge: 100 000 = 20 000 + 8000x → x = 10 m.",
    "hint": "Karşı ağırlığın torku, kolun ağırlığının ve yükün torklarının toplamını dengeler.",
    "commonMistake": "Kolun kendi ağırlığını ihmal edip 12,5 m bulmak.",
    "teacherNote": "Tork dengesini gerçek bir mühendislik sistemine uygulama becerisi ölçülür."
  },
];
