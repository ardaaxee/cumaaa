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
  {
    "id": "aytfiz-kutle-merkezi-q301",
    "topic": "aytfiz-kutle-merkezi",
    "subtopic": "aytfiz-kutle-merkezi-s2",
    "outcome": "Noktasal cisimlerden oluşan sistemlerin kütle merkezini hesaplar.",
    "difficulty": "kolay",
    "type": "islem",
    "question": "xy düzleminde 2 kg kütleli cisim (0, 0), 2 kg kütleli cisim (4, 0) ve 4 kg kütleli cisim (2, 6) noktasında bulunmaktadır (koordinatlar metre).\n\nBu üç cisimden oluşan sistemin kütle merkezinin koordinatları nedir?",
    "options": [
      "(2, 3)",
      "(2, 2)",
      "(3, 2)",
      "(2, 4)",
      "(1, 3)"
    ],
    "correctAnswer": 0,
    "solution": "x_KM = (2·0 + 2·4 + 4·2) / 8 = 16/8 = 2 m. y_KM = (2·0 + 2·0 + 4·6) / 8 = 24/8 = 3 m. Kütle merkezi (2, 3)’tür.",
    "hint": "Her koordinat için kütle ağırlıklı ortalama al.",
    "commonMistake": "Kütleleri dikkate almadan geometrik ortalama alıp (2, 2) bulmak.",
    "teacherNote": "Kütle merkezinin ağırlıklı ortalama olduğunu iki boyutta uygulama ölçülür."
  },
  {
    "id": "aytfiz-kutle-merkezi-q302",
    "topic": "aytfiz-kutle-merkezi",
    "subtopic": "aytfiz-kutle-merkezi-s1",
    "outcome": "Kütle merkezi ve ağırlık merkezi kavramlarını açıklar.",
    "difficulty": "orta",
    "type": "onculu",
    "question": "Kütle merkezi ve ağırlık merkezi ile ilgili aşağıdaki ifadelerden hangileri doğrudur?",
    "premises": [
      "Düzgün çekim alanında bir cismin kütle merkezi ile ağırlık merkezi çakışır.",
      "Bir cismin kütle merkezi her zaman cismin kendi maddesi üzerindedir.",
      "Çok yüksek bir yapıda ağırlık merkezi, kütle merkezinin biraz altında bulunur."
    ],
    "options": [
      "Yalnız I",
      "Yalnız III",
      "I ve II",
      "I ve III",
      "I, II ve III"
    ],
    "correctAnswer": 3,
    "solution": "I. Çekim alanının düzgün olduğu yerlerde her parçaya etki eden g aynı olduğundan iki nokta çakışır — doğru. II. Halka gibi cisimlerde kütle merkezi cismin dışında (boşlukta) olabilir — yanlış. III. Çok yüksek bir yapıda aşağıdaki parçalara etki eden g daha büyüktür; ağırlık merkezi kütle merkezinin biraz altında kalır — doğru.",
    "hint": "Ağırlık merkezi, ağırlıkların; kütle merkezi kütlelerin ortalama noktasıdır.",
    "commonMistake": "Kütle merkezinin mutlaka cismin maddesi üzerinde olduğunu sanmak.",
    "teacherNote": "İki kavramın ne zaman çakışıp ne zaman ayrıldığını ölçer."
  },
  {
    "id": "aytfiz-kutle-merkezi-q303",
    "topic": "aytfiz-kutle-merkezi",
    "subtopic": "aytfiz-kutle-merkezi-s2",
    "outcome": "Noktasal cisimlerden oluşan sistemlerin kütle merkezini hesaplar.",
    "difficulty": "orta",
    "type": "problem",
    "question": "90 cm uzunluğundaki türdeş ve düzgün kesitli AB çubuğunun B ucundan itibaren 30 cm’lik kısmı katlanarak çubuğun üzerine yapıştırılıyor (katlanan parça çubuğun 30–60 cm arasındaki bölümüyle üst üste gelir).\n\nOluşan cismin kütle merkezi A ucundan kaç cm uzaklıktadır?",
    "options": [
      "30",
      "35",
      "40",
      "45",
      "50"
    ],
    "correctAnswer": 1,
    "solution": "Katlamadan sonra 0–60 cm arasında kalan parça kütlenin 2/3’ü, kütle merkezi 30 cm’de. Katlanan 30 cm’lik parça kütlenin 1/3’ü, 30–60 arasında durduğundan kütle merkezi 45 cm’de. x_KM = (2/3)·30 + (1/3)·45 = 20 + 15 = 35 cm.",
    "hint": "Katlanan parçanın kütlesi değişmez, yalnız konumu değişir.",
    "commonMistake": "Katlamadan sonra cismi 60 cm’lik tek türdeş çubuk sanıp 30 cm demek.",
    "teacherNote": "Parçalı cisimlerde kütle merkezini parça parça hesaplama becerisi ölçülür."
  },
  {
    "id": "aytfiz-kutle-merkezi-q304",
    "topic": "aytfiz-kutle-merkezi",
    "subtopic": "aytfiz-kutle-merkezi-s3",
    "outcome": "Kararlı, kararsız ve nötr dengeyi kütle merkezinin konumuyla ilişkilendirir.",
    "difficulty": "kolay",
    "type": "tablo",
    "question": "Tabloda üç farklı duruma ait açıklamalar verilmiştir.\n\nBu durumlardaki denge türleri sırasıyla aşağıdakilerden hangisidir?",
    "table": {
      "headers": [
        "Durum",
        "Açıklama"
      ],
      "rows": [
        [
          "1",
          "İtildiğinde sallanıp yeniden dik konuma dönen hacıyatmaz oyuncak"
        ],
        [
          "2",
          "Ters çevrilmiş bir kasenin tepesine konmuş bilye"
        ],
        [
          "3",
          "Yatay masa üzerinde yan yatırılmış türdeş silindir"
        ]
      ]
    },
    "options": [
      "Kararsız – Kararlı – Nötr",
      "Kararlı – Nötr – Kararsız",
      "Kararlı – Kararsız – Nötr",
      "Nötr – Kararlı – Kararsız",
      "Kararlı – Kararlı – Nötr"
    ],
    "correctAnswer": 2,
    "solution": "1: Hacıyatmazın ağırlık merkezi alçaktadır; eğildiğinde ağırlık merkezi yükselir ve geri döndürücü tork oluşur → kararlı. 2: Ters kasenin tepesindeki bilye biraz itilince ağırlık merkezi alçalır ve bilye uzaklaşır → kararsız. 3: Yatay masadaki silindir itilince ağırlık merkezi aynı yükseklikte kalır → nötr.",
    "hint": "Cisim biraz itildiğinde ağırlık merkezinin yükselip alçalmasına bak.",
    "commonMistake": "Hacıyatmazı ‘kolayca sallandığı’ için kararsız sanmak.",
    "teacherNote": "Denge türünü ağırlık merkezinin yükseklik değişimiyle ilişkilendirme ölçülür."
  },
  {
    "id": "aytfiz-kutle-merkezi-q305",
    "topic": "aytfiz-kutle-merkezi",
    "subtopic": "aytfiz-kutle-merkezi-s2",
    "outcome": "Noktasal cisimlerden oluşan sistemlerin kütle merkezini hesaplar.",
    "difficulty": "orta",
    "type": "islem",
    "question": "1,2 m uzunluğunda ve 2 kg kütleli türdeş bir çubuğun A ucuna 1 kg, B ucuna 3 kg kütleli küçük cisimler yapıştırılmıştır.\n\nSistemin kütle merkezi A ucundan kaç m uzaklıktadır?",
    "options": [
      "0,6",
      "0,72",
      "0,75",
      "0,9",
      "0,8"
    ],
    "correctAnswer": 4,
    "solution": "Çubuğun kütlesi orta noktasında (0,6 m) toplanmış kabul edilir. x_KM = (1·0 + 2·0,6 + 3·1,2) / (1 + 2 + 3) = (1,2 + 3,6) / 6 = 0,8 m.",
    "hint": "Türdeş çubuğu orta noktasına konmuş noktasal kütle gibi düşün.",
    "commonMistake": "Çubuğun kütlesini ihmal edip (3·1,2)/4 = 0,9 m bulmak.",
    "teacherNote": "Uzamış cisimleri noktasal kütleye indirgeyerek sistem kütle merkezini bulma ölçülür."
  },
  {
    "id": "aytfiz-basit-makineler-q301",
    "topic": "aytfiz-basit-makineler",
    "subtopic": "aytfiz-basit-makineler-s1",
    "outcome": "Kaldıraç türlerini açıklar ve kuvvet kazancını hesaplar.",
    "difficulty": "kolay",
    "type": "onculu",
    "question": "Kaldıraçlarla ilgili aşağıdaki ifadelerden hangileri doğrudur?",
    "premises": [
      "Makas, destek noktası kuvvet ile yük arasında olan bir kaldıraçtır.",
      "Cımbız, kuvvetten kazanç sağlayan bir kaldıraçtır.",
      "El arabasında yük, destek noktası ile uygulanan kuvvet arasındadır."
    ],
    "options": [
      "Yalnız I",
      "Yalnız III",
      "I ve II",
      "I ve III",
      "I, II ve III"
    ],
    "correctAnswer": 3,
    "solution": "I. Makasta destek noktası (vida) kuvvet ile yük arasındadır — birinci sınıf kaldıraç, doğru. II. Cımbızda kuvvet, destek ile yük arasında uygulanır; kuvvet kolu yük kolundan kısadır, kuvvetten kayıp yoldan kazanç vardır — yanlış. III. El arabasında yük, destek (tekerlek) ile kuvvet arasındadır — ikinci sınıf kaldıraç, doğru.",
    "hint": "Destek, yük ve kuvvetin sıralanışına bak; kuvvet kolu ile yük kolunu karşılaştır.",
    "commonMistake": "Her basit makinenin kuvvetten kazanç sağladığını sanmak.",
    "teacherNote": "Kaldıraç türlerini günlük araçlar üzerinden tanıma ölçülür."
  },
  {
    "id": "aytfiz-basit-makineler-q302",
    "topic": "aytfiz-basit-makineler",
    "subtopic": "aytfiz-basit-makineler-s2",
    "outcome": "Sabit makara, hareketli makara ve palanga sistemlerinde kuvvet kazancını hesaplar.",
    "difficulty": "orta",
    "type": "islem",
    "question": "300 N’luk bir yük, her biri 20 N ağırlığında iki hareketli makaradan oluşan bir düzenekle dengelenmektedir. Yük birinci hareketli makaraya asılıdır; bu makarayı taşıyan ipin bir ucu tavana, diğer ucu ikinci hareketli makaraya bağlıdır. İkinci makarayı taşıyan ipin bir ucu tavana bağlı, serbest ucuna F kuvveti düşey olarak uygulanmaktadır.\n\nSürtünmeler önemsiz olduğuna göre F kaç N’dur?",
    "options": [
      "75",
      "80",
      "85",
      "90",
      "160"
    ],
    "correctAnswer": 3,
    "solution": "Birinci makara: iki ip kolu (yük + makara) = 320 N’u taşır → her kol 160 N. İkinci makara: 160 N + kendi ağırlığı 20 N = 180 N’u iki kolla taşır → F = 90 N.",
    "hint": "Her hareketli makarada kendi ağırlığını da ekleyip ikiye böl.",
    "commonMistake": "Makara ağırlıklarını ihmal edip 75 N ya da yalnız ilk makarayı düşünüp 160 N bulmak.",
    "teacherNote": "Art arda bağlı hareketli makaralarda kuvvetin adım adım aktarılması ölçülür."
  },
  {
    "id": "aytfiz-basit-makineler-q303",
    "topic": "aytfiz-basit-makineler",
    "subtopic": "aytfiz-basit-makineler-s3",
    "outcome": "Eğik düzlem, çıkrık ve vidada kuvvet kazancını hesaplar.",
    "difficulty": "yeni-nesil",
    "type": "yeni-nesil",
    "question": "Bir bisikletin pedallarına bağlı ön dişlide 48, arka tekerleğe bağlı dişlide 16 diş vardır. Dişliler zincirle birbirine bağlıdır. Arka tekerleğin yarıçapı 0,35 m’dir.\n\nBisikletli pedalları saniyede 1 tur döndürdüğünde bisikletin kaymadan ilerleme hızı kaç m/s olur? (π = 3)",
    "options": [
      "2,1",
      "4,2",
      "6,3",
      "8,4",
      "12,6"
    ],
    "correctAnswer": 2,
    "solution": "Zincirle bağlı dişlilerde diş sayısı × tur sayısı eşittir: 48 · 1 = 16 · n → arka dişli n = 3 tur/s. Arka tekerlek aynı milde olduğundan o da 3 tur/s döner. v = n · 2πr = 3 · 2 · 3 · 0,35 = 6,3 m/s.",
    "hint": "Zincirle bağlı dişlilerde tur sayısı diş sayısıyla ters orantılıdır.",
    "commonMistake": "Oranı ters kurup arka tekerleği 1/3 tur/s döndürmek (0,7 m/s) ya da çevre yerine yarıçapı kullanmak (2,1 m/s).",
    "teacherNote": "Dişli ve eksen bağlantısını günlük araçta çok adımlı kullanma ölçülür."
  },
  {
    "id": "aytfiz-basit-makineler-q304",
    "topic": "aytfiz-basit-makineler",
    "subtopic": "aytfiz-basit-makineler-s4",
    "outcome": "Basit makinelerde işten kazanç olmadığını açıklar ve verimi hesaplar.",
    "difficulty": "orta",
    "type": "cok-adimli",
    "question": "600 N ağırlığındaki bir koli, 6 m uzunluğunda ve 1,5 m yüksekliğindeki bir rampa boyunca, rampaya paralel 200 N’luk sabit kuvvetle sabit hızla yukarı çıkarılıyor.\n\nBuna göre rampanın verimi ve koliye etki eden sürtünme kuvveti aşağıdakilerden hangisidir?",
    "options": [
      "%75; 50 N",
      "%75; 200 N",
      "%50; 50 N",
      "%80; 40 N",
      "%25; 150 N"
    ],
    "correctAnswer": 0,
    "solution": "Yararlı iş = G·h = 600 · 1,5 = 900 J. Harcanan iş = F·L = 200 · 6 = 1200 J. Verim = 900/1200 = %75. Kaybolan 300 J sürtünmeye gider: f · 6 = 300 → f = 50 N.",
    "hint": "Verim = yararlı iş / harcanan iş; kayıp iş sürtünmenin yaptığı iştir.",
    "commonMistake": "Kayıp enerjiyi doğrudan sürtünme kuvveti sanmak ya da verimi F/G oranından hesaplamak.",
    "teacherNote": "İş ilkesi, verim ve sürtünme ilişkisini birlikte kurma becerisi ölçülür."
  },
  {
    "id": "aytfiz-basit-makineler-q305",
    "topic": "aytfiz-basit-makineler",
    "subtopic": "aytfiz-basit-makineler-s1",
    "outcome": "Kaldıraç türlerini açıklar ve kuvvet kazancını hesaplar.",
    "difficulty": "zor",
    "type": "problem",
    "question": "2 m uzunluğunda, 150 N ağırlığındaki türdeş bir demir çubuk kaldıraç olarak kullanılıyor. Destek noktası çubuğun bir ucundan 0,5 m uzaklıktadır ve bu kısa uca 900 N’luk bir taş yüklenmiştir.\n\nÇubuğun diğer ucuna düşey olarak uygulanması gereken en küçük kuvvet kaç N’dur?",
    "options": [
      "300",
      "250",
      "200",
      "350",
      "275"
    ],
    "correctAnswer": 1,
    "solution": "Destek noktasına göre tork: taşın torku 900 · 0,5 = 450 N·m. Çubuğun ağırlık merkezi ortada, destekten 0,5 m uzakta ve uzun kol tarafındadır; torku 150 · 0,5 = 75 N·m kuvvete yardım eder. Uzun uçtaki kuvvetin kolu 1,5 m: F · 1,5 + 75 = 450 → F = 250 N.",
    "hint": "Çubuğun ağırlığı hangi tarafta kalıyor? Kuvvete mi, yüke mi yardım ediyor?",
    "commonMistake": "Çubuğun ağırlığını ihmal edip 300 N bulmak ya da yük tarafına ekleyip 350 N bulmak.",
    "teacherNote": "Ağırlıklı kaldıraçta çubuk ağırlığının torkunu doğru tarafa yazma ölçülür."
  },
  {
    "id": "aytfiz-elektriksel-kuvvet-alan-q301",
    "topic": "aytfiz-elektriksel-kuvvet-alan",
    "subtopic": "aytfiz-elektriksel-kuvvet-alan-s1",
    "outcome": "Yüklü cisimler arasındaki elektriksel kuvvetin bağlı olduğu değişkenleri açıklar.",
    "difficulty": "orta",
    "type": "islem",
    "question": "Aralarında 90 cm uzaklık bulunan +2 μC ve +8 μC’luk noktasal yükler sabitlenmiştir. Üçüncü bir noktasal yük, bu yükleri birleştiren doğru üzerine konuyor.\n\nÜçüncü yüke etki eden net elektriksel kuvvetin sıfır olması için yük, +2 μC’luk yükten kaç cm uzağa konmalıdır?",
    "options": [
      "20",
      "30",
      "45",
      "60",
      "90"
    ],
    "correctAnswer": 1,
    "solution": "Yükler aynı işaretli olduğundan denge noktası aralarında ve küçük yüke yakındır. k·2/x² = k·8/(90 − x)² → (90 − x)/x = 2 → x = 30 cm. Sonuç, üçüncü yükün işaretinden ve büyüklüğünden bağımsızdır.",
    "hint": "Aynı işaretli yüklerde denge noktası iki yükün arasında, küçük yüke yakındır.",
    "commonMistake": "Uzaklığı yükle doğru orantılı alıp 18 cm ya da karekök almayı unutmak.",
    "teacherNote": "Coulomb kuvvetinin uzaklığın karesiyle ters orantısını denge probleminde ölçer."
  },
  {
    "id": "aytfiz-elektriksel-kuvvet-alan-q302",
    "topic": "aytfiz-elektriksel-kuvvet-alan",
    "subtopic": "aytfiz-elektriksel-kuvvet-alan-s2",
    "outcome": "Noktasal yüklerin oluşturduğu elektrik alanı hesaplar.",
    "difficulty": "zor",
    "type": "islem",
    "question": "xy düzleminde orijinde +3 μC, (0,3 m; 0,3 m) noktasında +4 μC’luk noktasal yükler bulunmaktadır.\n\n(0,3 m; 0) noktasındaki P noktasında oluşan bileşke elektrik alanın büyüklüğü kaç N/C’dur? (k = 9·10⁹ N·m²/C²)",
    "options": [
      "1·10⁵",
      "3·10⁵",
      "4·10⁵",
      "7·10⁵",
      "5·10⁵"
    ],
    "correctAnswer": 4,
    "solution": "P’nin orijindeki yüke uzaklığı 0,3 m: E₁ = 9·10⁹ · 3·10⁻⁶ / 0,09 = 3·10⁵ N/C, +x yönünde. P’nin (0,3; 0,3)’teki yüke uzaklığı 0,3 m: E₂ = 9·10⁹ · 4·10⁻⁶ / 0,09 = 4·10⁵ N/C, pozitif yükten uzaklaşan yönde yani −y yönünde. Birbirine dik iki alanın bileşkesi √(3² + 4²)·10⁵ = 5·10⁵ N/C.",
    "hint": "Her yükün P’de oluşturduğu alanın yönünü ayrı ayrı çiz; alanlar dik mi?",
    "commonMistake": "Alanları skaler gibi toplayıp 7·10⁵ N/C bulmak.",
    "teacherNote": "Elektrik alanın vektörel toplanması ve yön belirleme ölçülür."
  },
  {
    "id": "aytfiz-elektriksel-kuvvet-alan-q303",
    "topic": "aytfiz-elektriksel-kuvvet-alan",
    "subtopic": "aytfiz-elektriksel-kuvvet-alan-s3",
    "outcome": "Elektrik alanda bulunan yüklü cisimlerin dengesini analiz eder.",
    "difficulty": "yeni-nesil",
    "type": "yeni-nesil",
    "question": "Bir öğrenci, yüklü yağ damlası deneyinin bir benzetimini yapıyor. Aralarında 1 cm uzaklık bulunan yatay iki paralel levha arasına 500 V potansiyel farkı uygulandığında, kütlesi 2,4·10⁻¹⁵ kg olan bir damla levhalar arasında asılı kalıyor. Damlanın yükü negatiftir.\n\nBuna göre damladaki fazla elektron sayısı ve pozitif yüklü levhanın konumu aşağıdakilerden hangisidir? (g = 10 m/s²; e = 1,6·10⁻¹⁹ C)",
    "options": [
      "3; alttaki levha",
      "2; üstteki levha",
      "30; üstteki levha",
      "3; üstteki levha",
      "6; alttaki levha"
    ],
    "correctAnswer": 3,
    "solution": "E = V/d = 500 / 0,01 = 5·10⁴ N/C. Denge: qE = mg → q = 2,4·10⁻¹⁵ · 10 / 5·10⁴ = 4,8·10⁻¹⁹ C = 3e. Damla negatif olduğundan elektriksel kuvvetin yukarı olması için alan aşağı yönlü olmalıdır; alan pozitif levhadan negatife yöneldiğinden pozitif levha üsttedir.",
    "hint": "Önce E = V/d, sonra qE = mg. Negatif yüke etki eden kuvvet alana zıttır.",
    "commonMistake": "Negatif yükte kuvvetin alanla aynı yönde olduğunu sanıp pozitif levhayı altta seçmek.",
    "teacherNote": "Düzgün alanda denge, yükün kuantumlu oluşu ve yön analizi birlikte ölçülür."
  },
  {
    "id": "aytfiz-elektriksel-potansiyel-q301",
    "topic": "aytfiz-elektriksel-potansiyel",
    "subtopic": "aytfiz-elektriksel-potansiyel-s1",
    "outcome": "Noktasal yük sistemlerinin elektriksel potansiyel enerjisini hesaplar.",
    "difficulty": "orta",
    "type": "islem",
    "question": "Kenar uzunluğu 30 cm olan bir eşkenar üçgenin köşelerine her biri +1 μC olan üç noktasal yük yerleştirilmiştir.\n\nBu yük sisteminin elektriksel potansiyel enerjisi kaç J’dür? (k = 9·10⁹ N·m²/C²)",
    "options": [
      "0,03",
      "0,06",
      "0,09",
      "0,27",
      "0,9"
    ],
    "correctAnswer": 2,
    "solution": "Üç yük çifti vardır ve her çiftin enerjisi k·q²/r = 9·10⁹ · (10⁻⁶)² / 0,3 = 0,03 J’dür. Toplam U = 3 · 0,03 = 0,09 J.",
    "hint": "Sistem enerjisi, tüm yük çiftlerinin enerjilerinin toplamıdır.",
    "commonMistake": "Yalnız bir çifti hesaplayıp 0,03 J demek ya da çift sayısını 6 alıp iki kez saymak.",
    "teacherNote": "Çok yüklü sistemde potansiyel enerjinin çiftler üzerinden hesaplanması ölçülür."
  },
  {
    "id": "aytfiz-elektriksel-potansiyel-q302",
    "topic": "aytfiz-elektriksel-potansiyel",
    "subtopic": "aytfiz-elektriksel-potansiyel-s3",
    "outcome": "Bir yükü iki nokta arasında taşımak için yapılan işi hesaplar.",
    "difficulty": "zor",
    "type": "cok-adimli",
    "question": "Sabitlenmiş +6 μC’luk noktasal bir yükün yakınındaki +2 μC’luk bir yük, önce sonsuzdan 60 cm uzaklığa, sonra 60 cm uzaklıktan 30 cm uzaklığa sabit hızla getiriliyor.\n\nİkinci aşamada (60 cm’den 30 cm’ye) dış kuvvetin yaptığı iş kaç J’dür? (k = 9·10⁹ N·m²/C²)",
    "options": [
      "0,09",
      "0,18",
      "0,36",
      "0,54",
      "0,72"
    ],
    "correctAnswer": 1,
    "solution": "60 cm’deki potansiyel enerji: k·q₁q₂/r = 9·10⁹ · 12·10⁻¹² / 0,6 = 0,18 J. 30 cm’deki: 0,36 J. İkinci aşamadaki iş = ΔU = 0,36 − 0,18 = 0,18 J. Uzaklık yarıya indiğinde enerji iki katına çıkar ama artış ilk aşamadaki kadardır.",
    "hint": "Sabit hızla taşımada dış kuvvetin işi potansiyel enerji değişimine eşittir.",
    "commonMistake": "Son konumdaki enerjinin tamamını (0,36 J) ikinci aşamanın işi sanmak.",
    "teacherNote": "Potansiyel enerji ile iş arasındaki farkı (değişim) kavramayı ölçer."
  },
  {
    "id": "aytfiz-elektriksel-potansiyel-q303",
    "topic": "aytfiz-elektriksel-potansiyel",
    "subtopic": "aytfiz-elektriksel-potansiyel-s4",
    "outcome": "Paralel levhalar arasındaki düzgün elektrik alanı hesaplar.",
    "difficulty": "yeni-nesil",
    "type": "yeni-nesil",
    "question": "Bir elektron tabancasında birbirine paralel K, L ve M ızgaralarının potansiyelleri sırasıyla 0 V, +400 V ve +150 V’tur. K ızgarasından durgun hâlden çıkan bir elektron L’den geçerek M’ye ulaşıyor.\n\nElektronun M ızgarasına ulaştığındaki kinetik enerjisi kaç eV’dir? (Yer çekimi önemsiz)",
    "options": [
      "150",
      "250",
      "400",
      "550",
      "0"
    ],
    "correctAnswer": 0,
    "solution": "Negatif yüklü elektron potansiyeli yüksek bölgeye doğru hızlanır; kinetik enerjisindeki artış e·(V_son − V_ilk) kadardır: K’den M’ye e·(150 − 0) = 150 eV. Arada L’de 400 eV’ye çıkar, L–M arasında 250 eV kaybeder; sonuç yalnız başlangıç ve bitiş potansiyellerine bağlıdır.",
    "hint": "Elektriksel iş yoldan bağımsızdır; yalnız ilk ve son potansiyele bak.",
    "commonMistake": "L’deki 400 eV’yi ya da L–M farkını (250 eV) cevap sanmak.",
    "teacherNote": "Korunumlu kuvvet alanında işin yoldan bağımsızlığını ve negatif yükün davranışını ölçer."
  },
  {
    "id": "aytfiz-kondansatorler-q301",
    "topic": "aytfiz-kondansatorler",
    "subtopic": "aytfiz-kondansatorler-s1",
    "outcome": "Sığanın bağlı olduğu değişkenleri açıklar.",
    "difficulty": "orta",
    "type": "onculu",
    "question": "Yüklenip üreteçten ayrılmış hava aralıklı paralel levhalı bir kondansatörün levhaları arasındaki boşluk, dielektrik katsayısı 3 olan yalıtkan bir maddeyle tamamen dolduruluyor.\n\nBuna göre aşağıdaki ifadelerden hangileri doğrudur?",
    "premises": [
      "Kondansatörün sığası 3 katına çıkar.",
      "Levhalar arasındaki potansiyel farkı 3 katına çıkar.",
      "Kondansatörde depolanan enerji azalır."
    ],
    "options": [
      "Yalnız I",
      "Yalnız III",
      "I ve II",
      "I ve III",
      "I, II ve III"
    ],
    "correctAnswer": 3,
    "solution": "Üreteçten ayrıldığı için yük Q sabittir. C = ε·A/d olduğundan sığa 3 katına çıkar (I doğru). V = Q/C olduğundan gerilim 1/3’üne iner (II yanlış). Enerji E = Q²/(2C) olduğundan 1/3’üne iner, yani azalır (III doğru).",
    "hint": "Önce neyin sabit kaldığını belirle: üreteçten ayrılmış kondansatörde yük sabittir.",
    "commonMistake": "Gerilimin sabit kaldığını varsayıp enerjinin arttığını düşünmek.",
    "teacherNote": "Sabit yük ve sabit gerilim durumlarını ayırt ederek sığa bağıntılarını kullanma ölçülür."
  },
  {
    "id": "aytfiz-kondansatorler-q302",
    "topic": "aytfiz-kondansatorler",
    "subtopic": "aytfiz-kondansatorler-s2",
    "outcome": "Seri ve paralel bağlı kondansatörlerin eşdeğer sığasını, yüklerini ve gerilimlerini hesaplar.",
    "difficulty": "kolay",
    "type": "islem",
    "question": "2 μF ve 3 μF’lık iki kondansatör seri bağlanıp uçlarına 10 V’luk üreteç bağlanıyor.\n\nKondansatörler tamamen yüklendiğinde 2 μF’lık kondansatörün uçları arasındaki potansiyel farkı kaç V olur?",
    "options": [
      "4",
      "5",
      "6",
      "10",
      "12"
    ],
    "correctAnswer": 2,
    "solution": "Eşdeğer sığa C = (2·3)/(2 + 3) = 1,2 μF. Seri bağlı kondansatörlerin yükleri eşittir: Q = 1,2 · 10 = 12 μC. V₁ = Q/C₁ = 12/2 = 6 V (3 μF’lıkta 4 V).",
    "hint": "Seri bağlamada yükler eşit, gerilimler sığa ile ters orantılı paylaşılır.",
    "commonMistake": "Gerilimi sığayla doğru orantılı paylaştırıp 4 V bulmak.",
    "teacherNote": "Seri kondansatörlerde yük eşitliği ve gerilim paylaşımını ölçer."
  },
  {
    "id": "aytfiz-kondansatorler-q303",
    "topic": "aytfiz-kondansatorler",
    "subtopic": "aytfiz-kondansatorler-s3",
    "outcome": "Kondansatörde depolanan enerjiyi hesaplar.",
    "difficulty": "yeni-nesil",
    "type": "yeni-nesil",
    "question": "Bir fotoğraf makinesinin flaş devresindeki 100 μF’lık kondansatör 300 V’a kadar yükleniyor. Flaş patladığında kondansatör yaklaşık 1 ms içinde tamamen boşalıyor.\n\nBuna göre boşalma süresince flaş lambasına aktarılan ortalama güç yaklaşık kaç W’tır?",
    "options": [
      "450",
      "900",
      "2250",
      "4500",
      "9000"
    ],
    "correctAnswer": 3,
    "solution": "Depolanan enerji E = ½CV² = ½ · 100·10⁻⁶ · 300² = 4,5 J. Ortalama güç P = E/t = 4,5 / 10⁻³ = 4500 W. Kondansatör küçük enerjiyi çok kısa sürede vererek yüksek güç sağlar.",
    "hint": "Önce enerjiyi, sonra enerji/zaman oranını bul.",
    "commonMistake": "½ çarpanını unutup 9000 W bulmak ya da ms’yi s’ye çevirmemek.",
    "teacherNote": "Kondansatör enerjisinin teknolojik kullanımı ve güç kavramı ölçülür."
  },
  {
    "id": "aytfiz-kondansatorler-q304",
    "topic": "aytfiz-kondansatorler",
    "subtopic": "aytfiz-kondansatorler-s2",
    "outcome": "Seri ve paralel bağlı kondansatörlerin eşdeğer sığasını, yüklerini ve gerilimlerini hesaplar.",
    "difficulty": "zor",
    "type": "cok-adimli",
    "question": "2 μF’lık kondansatör 12 V’a, 4 μF’lık kondansatör 3 V’a kadar yüklenip üreteçlerden ayrılıyor. Daha sonra birinin pozitif levhası diğerinin negatif levhasına gelecek biçimde (zıt kutuplar birbirine) paralel bağlanıyor.\n\nDenge kurulduğunda kondansatörlerin ortak gerilimi kaç V olur?",
    "options": [
      "2",
      "3",
      "4",
      "6",
      "9"
    ],
    "correctAnswer": 0,
    "solution": "Yükler: Q₁ = 2 · 12 = 24 μC, Q₂ = 4 · 3 = 12 μC. Zıt kutuplar birleştiğinde yükler kısmen nötrleşir: net yük 24 − 12 = 12 μC. Paralel eşdeğer sığa 6 μF. V = 12/6 = 2 V.",
    "hint": "Zıt kutuplu bağlamada net yük, yüklerin farkıdır.",
    "commonMistake": "Yükleri toplayıp (36/6) 6 V bulmak.",
    "teacherNote": "Yük korunumunu kutup yönelimine dikkat ederek uygulama ölçülür."
  },
  {
    "id": "aytfiz-kondansatorler-q305",
    "topic": "aytfiz-kondansatorler",
    "subtopic": "aytfiz-kondansatorler-s2",
    "outcome": "Seri ve paralel bağlı kondansatörlerin eşdeğer sığasını, yüklerini ve gerilimlerini hesaplar.",
    "difficulty": "orta",
    "type": "problem",
    "question": "12 V’luk iç direnci önemsiz bir üretece 2 Ω ve 4 Ω’luk dirençler seri bağlanmıştır. 5 μF’lık bir kondansatör 4 Ω’luk direncin uçlarına paralel bağlanmıştır.\n\nUzun süre sonra kondansatörde depolanan yük kaç μC olur?",
    "options": [
      "24",
      "40",
      "60",
      "80",
      "20"
    ],
    "correctAnswer": 1,
    "solution": "Kararlı durumda kondansatörden akım geçmez; akım yalnız dirençlerden geçer: I = 12/(2 + 4) = 2 A. 4 Ω’un uçları arasındaki gerilim 2 · 4 = 8 V. Kondansatörün yükü Q = C·V = 5 · 8 = 40 μC.",
    "hint": "Kararlı durumda kondansatörün bulunduğu koldan akım geçmez; gerilimi paralel olduğu elemanınkine eşittir.",
    "commonMistake": "Kondansatöre üretecin tüm gerilimini (12 V) uygulayıp 60 μC bulmak.",
    "teacherNote": "Doğru akım devresinde kondansatörün kararlı durum davranışını ölçer."
  },
  {
    "id": "aytfiz-manyetizma-induksiyon-q301",
    "topic": "aytfiz-manyetizma-induksiyon",
    "subtopic": "aytfiz-manyetizma-induksiyon-s2",
    "outcome": "Manyetik alanda akım geçen tele etki eden kuvveti hesaplar.",
    "difficulty": "zor",
    "type": "cok-adimli",
    "question": "Bir proton ile bir alfa parçacığı aynı kinetik enerjiyle, aynı düzgün manyetik alana alan çizgilerine dik olarak giriyor. (Alfa parçacığının kütlesi protonunkinin 4 katı, yükü 2 katıdır.)\n\nAlfa parçacığının yörünge yarıçapının protonunkine oranı kaçtır?",
    "options": [
      "1/2",
      "1",
      "√2",
      "2",
      "4"
    ],
    "correctAnswer": 1,
    "solution": "qvB = mv²/r → r = mv/(qB) = p/(qB). Kinetik enerji K ise p = √(2mK). r = √(2mK)/(qB). Oran: r_α/r_p = (√(4m)/2e) / (√m/e) = 2/2 = 1.",
    "hint": "Momentumu kinetik enerji cinsinden yaz: p = √(2mK).",
    "commonMistake": "Hızları eşit varsayıp r ∝ m/q’dan 2 bulmak.",
    "teacherNote": "Manyetik alanda yörünge yarıçapını farklı koşullarda karşılaştırma ölçülür."
  },
  {
    "id": "aytfiz-manyetizma-induksiyon-q302",
    "topic": "aytfiz-manyetizma-induksiyon",
    "subtopic": "aytfiz-manyetizma-induksiyon-s3",
    "outcome": "Manyetik akıyı açıklar ve hesaplar.",
    "difficulty": "orta",
    "type": "islem",
    "question": "Kenar uzunluğu 20 cm olan tek sarımlı kare bir iletken çerçevenin direnci 0,5 Ω’dur. Çerçeve düzlemine dik 0,5 T’lık düzgün manyetik alan, 0,1 s içinde düzgün olarak sıfıra iniyor.\n\nBu sürede çerçevede oluşan indüksiyon akımı kaç A’dir?",
    "options": [
      "0,1",
      "0,2",
      "0,4",
      "0,8",
      "1"
    ],
    "correctAnswer": 2,
    "solution": "Alan A = 0,2² = 0,04 m². Akı değişimi ΔΦ = 0,04 · 0,5 = 0,02 Wb. ε = ΔΦ/Δt = 0,02/0,1 = 0,2 V. I = ε/R = 0,2/0,5 = 0,4 A.",
    "hint": "ε = ΔΦ/Δt, sonra Ohm yasası.",
    "commonMistake": "Kenar uzunluğunu alan yerine kullanmak ya da cm’yi m’ye çevirmemek.",
    "teacherNote": "Faraday yasasını akım hesabıyla birleştirme ölçülür."
  },
  {
    "id": "aytfiz-manyetizma-induksiyon-q303",
    "topic": "aytfiz-manyetizma-induksiyon",
    "subtopic": "aytfiz-manyetizma-induksiyon-s4",
    "outcome": "Öz indüksiyon akımını açıklar.",
    "difficulty": "kolay",
    "type": "onculu",
    "question": "Elektrik motorları, üreteçler ve öz indüksiyonla ilgili aşağıdaki ifadelerden hangileri doğrudur?",
    "premises": [
      "Üreteç, mekanik enerjiyi elektrik enerjisine dönüştürür.",
      "Bir bobindeki öz indüksiyon emk’sı, bobinden sabit akım geçerken en büyük değerini alır.",
      "Elektrik motorunda akım geçen bobine etki eden manyetik kuvvetler bobini döndüren tork oluşturur."
    ],
    "options": [
      "Yalnız I",
      "Yalnız III",
      "I ve II",
      "I ve III",
      "I, II ve III"
    ],
    "correctAnswer": 3,
    "solution": "I. Üreteçte bobin mekanik olarak döndürülür, değişen akı ile elektrik enerjisi elde edilir — doğru. II. Öz indüksiyon emk’sı akımın değişimiyle oluşur; akım sabitken sıfırdır — yanlış. III. Motorda manyetik alandaki akım taşıyan bobinin kenarlarına zıt yönlü kuvvetler etki eder ve tork oluşur — doğru.",
    "hint": "Öz indüksiyon için ‘değişim’ şarttır.",
    "commonMistake": "Akım büyükse öz indüksiyonun da büyük olacağını sanmak.",
    "teacherNote": "Motor–üreteç enerji dönüşümlerini ve öz indüksiyon koşulunu ayırt etmeyi ölçer."
  },
  {
    "id": "aytfiz-alternatif-akim-transformator-q301",
    "topic": "aytfiz-alternatif-akim-transformator",
    "subtopic": "aytfiz-alternatif-akim-transformator-s1",
    "outcome": "Alternatif akımın maksimum ve etkin değerlerini ilişkilendirir.",
    "difficulty": "orta",
    "type": "islem",
    "question": "Gerilimi V = 200√2·sin(120πt) volt olan bir alternatif gerilim kaynağına 50 Ω’luk bir direnç bağlanıyor.\n\nDirencin harcadığı ortalama güç kaç W’tır?",
    "options": [
      "400",
      "566",
      "800",
      "1131",
      "1600"
    ],
    "correctAnswer": 2,
    "solution": "Tepe gerilim 200√2 V → etkin gerilim 200 V. Etkin akım 200/50 = 4 A. Ortalama güç P = V_etkin · I_etkin = 200 · 4 = 800 W. (Frekans 60 Hz’dir ama güç hesabında gerekmez.)",
    "hint": "Ortalama güç etkin değerlerle hesaplanır.",
    "commonMistake": "Tepe değerleriyle hesaplayıp 1600 W bulmak.",
    "teacherNote": "Etkin değer kavramını güç hesabında kullanma ölçülür."
  },
  {
    "id": "aytfiz-alternatif-akim-transformator-q302",
    "topic": "aytfiz-alternatif-akim-transformator",
    "subtopic": "aytfiz-alternatif-akim-transformator-s2",
    "outcome": "İndüktif ve kapasitif reaktans ile empedans kavramlarını açıklar.",
    "difficulty": "kolay",
    "type": "onculu",
    "question": "Alternatif akım devresine bağlanan elemanlarla ilgili aşağıdaki ifadelerden hangileri doğrudur?",
    "premises": [
      "Kaynağın frekansı artırılırsa bobinin indüktif reaktansı artar.",
      "Kaynağın frekansı artırılırsa kondansatörün kapasitif reaktansı artar.",
      "Omik bir direncin değeri kaynağın frekansından bağımsızdır."
    ],
    "options": [
      "Yalnız I",
      "Yalnız III",
      "I ve II",
      "I ve III",
      "I, II ve III"
    ],
    "correctAnswer": 3,
    "solution": "I. X_L = 2πfL; frekans artınca indüktif reaktans artar — doğru. II. X_C = 1/(2πfC); frekans artınca kapasitif reaktans azalır — yanlış. III. Omik direncin değeri frekanstan bağımsızdır — doğru.",
    "hint": "X_L frekansla doğru, X_C frekansla ters orantılıdır.",
    "commonMistake": "Bobin ve kondansatörün frekansa tepkisini karıştırmak.",
    "teacherNote": "Reaktans bağıntılarını nitel yorumlama ölçülür."
  },
  {
    "id": "aytfiz-alternatif-akim-transformator-q303",
    "topic": "aytfiz-alternatif-akim-transformator",
    "subtopic": "aytfiz-alternatif-akim-transformator-s2",
    "outcome": "İndüktif ve kapasitif reaktans ile empedans kavramlarını açıklar.",
    "difficulty": "zor",
    "type": "islem",
    "question": "Özindüksiyon katsayısı 0,1 H olan ideal bir bobin, 10 μF’lık bir kondansatör ve 20 Ω’luk bir direnç seri bağlanarak açısal frekansı ayarlanabilen, etkin gerilimi 40 V olan bir kaynağa bağlanıyor.\n\nDevreden geçen etkin akımın en büyük olduğu açısal frekans (rad/s) ve bu akımın değeri (A) aşağıdakilerden hangisidir?",
    "options": [
      "100; 2",
      "1000; 0,5",
      "316; 2",
      "1000; 2",
      "10 000; 2"
    ],
    "correctAnswer": 3,
    "solution": "Akım, empedansın en küçük olduğu rezonans durumunda en büyüktür: X_L = X_C → ω₀ = 1/√(LC) = 1/√(0,1 · 10⁻⁵) = 1/√(10⁻⁶) = 1000 rad/s. Rezonansta Z = R = 20 Ω, I = 40/20 = 2 A.",
    "hint": "Rezonansta X_L = X_C olur ve empedans yalnız dirence eşittir.",
    "commonMistake": "ω₀ = 1/(LC) yazıp karekökü unutmak ya da μF’yi F’ye çevirmemek.",
    "teacherNote": "Seri RLC devresinde rezonans koşulunu ölçer."
  },
  {
    "id": "aytfiz-alternatif-akim-transformator-q304",
    "topic": "aytfiz-alternatif-akim-transformator",
    "subtopic": "aytfiz-alternatif-akim-transformator-s3",
    "outcome": "Transformatörlerde sarım sayısı, gerilim ve akım ilişkisini hesaplar.",
    "difficulty": "orta",
    "type": "problem",
    "question": "İdeal bir transformatörün primer sarım sayısı 1200’dür ve primer 240 V’luk şebekeye bağlıdır. Sekondere bağlanan 60 V–120 W değerli bir lamba normal parlaklıkta yanmaktadır.\n\nSekonderin sarım sayısı ve primerden çekilen akım aşağıdakilerden hangisidir?",
    "options": [
      "300; 2 A",
      "4800; 0,5 A",
      "300; 0,5 A",
      "600; 0,5 A",
      "300; 0,125 A"
    ],
    "correctAnswer": 2,
    "solution": "V_p/V_s = N_p/N_s → 240/60 = 1200/N_s → N_s = 300. İdeal transformatörde giriş gücü çıkış gücüne eşittir: 240 · I_p = 120 → I_p = 0,5 A. (Sekonder akımı 2 A’dir.)",
    "hint": "Gerilim oranı sarım oranına eşittir; ideal transformatörde güç korunur.",
    "commonMistake": "Sekonder akımını (2 A) primer akımı sanmak ya da oranı ters kurmak.",
    "teacherNote": "Transformatörde gerilim–sarım ve güç korunumu ilişkisini ölçer."
  },
  {
    "id": "aytfiz-alternatif-akim-transformator-q305",
    "topic": "aytfiz-alternatif-akim-transformator",
    "subtopic": "aytfiz-alternatif-akim-transformator-s3",
    "outcome": "Transformatörlerde sarım sayısı, gerilim ve akım ilişkisini hesaplar.",
    "difficulty": "yeni-nesil",
    "type": "yeni-nesil",
    "question": "Punta kaynak makinelerinde iki metal levha, içinden çok büyük akım geçirilerek ısıtılıp birbirine kaynatılır. Böyle bir makinenin ideal kabul edilen transformatörünün primeri 220 V’luk şebekeye bağlı ve 440 sarımlı, sekonderi ise yalnızca 2 sarımlıdır. Kaynak sırasında sekonderden 2200 A’lik etkin akım geçmektedir.\n\nBuna göre sekonder gerilimi ve primerden çekilen etkin akım aşağıdakilerden hangisidir?",
    "options": [
      "1 V; 10 A",
      "1 V; 2200 A",
      "48 400 V; 10 A",
      "2 V; 20 A",
      "0,5 V; 5 A"
    ],
    "correctAnswer": 0,
    "solution": "V_s = V_p · N_s/N_p = 220 · 2/440 = 1 V. Güç korunumu: 220 · I_p = 1 · 2200 → I_p = 10 A. Transformatör gerilimi düşürüp akımı artırır; ısı I²R ile orantılı olduğundan büyük akım kaynak noktasında yoğun ısı üretir.",
    "hint": "Düşürücü transformatörde gerilim azalırken akım aynı oranda artar.",
    "commonMistake": "Sarım oranını ters uygulayıp gerilimi büyütmek ya da akımın iki tarafta aynı kaldığını sanmak.",
    "teacherNote": "Transformatör ilkesini teknolojik bir uygulamada yorumlama ölçülür."
  },
  {
    "id": "aytfiz-cembersel-hareket-q301",
    "topic": "aytfiz-cembersel-hareket",
    "subtopic": "aytfiz-cembersel-hareket-s1",
    "outcome": "Düzgün çembersel harekette periyot, frekans, çizgisel hız ve açısal hız arasındaki ilişkileri açıklar.",
    "difficulty": "orta",
    "type": "problem",
    "question": "Bir duvar saatinin yelkovanı 12 cm, akrebi 8 cm uzunluğundadır.\n\nYelkovanın uç noktasının çizgisel süratinin akrebin uç noktasının çizgisel süratine oranı kaçtır?",
    "options": [
      "1,5",
      "8",
      "12",
      "18",
      "24"
    ],
    "correctAnswer": 3,
    "solution": "Yelkovan 1 saatte, akrep 12 saatte bir tur atar: ω_y/ω_a = 12. v = ωr olduğundan v_y/v_a = 12 · (12/8) = 18.",
    "hint": "Önce periyotlardan açısal hız oranını, sonra yarıçap oranını kullan.",
    "commonMistake": "Yalnız periyot oranını (12) ya da yalnız uzunluk oranını (1,5) almak.",
    "teacherNote": "v = ωr bağıntısında iki değişkenin birlikte etkisini ölçer."
  },
  {
    "id": "aytfiz-cembersel-hareket-q302",
    "topic": "aytfiz-cembersel-hareket",
    "subtopic": "aytfiz-cembersel-hareket-s3",
    "outcome": "Virajlı yollarda ve döner platformlarda güvenli hız sınırını hesaplar.",
    "difficulty": "orta",
    "type": "islem",
    "question": "0,5 kg kütleli küçük bir cisim, 0,8 m uzunluğundaki hafif bir ipin ucunda düşey düzlemde çembersel hareket yapmaktadır. Cismin en alt noktadaki sürati 6 m/s’dir.\n\nCisim en alt noktadan geçerken ipteki gerilme kuvveti kaç N’dur? (g = 10 m/s²)",
    "options": [
      "5",
      "17,5",
      "22,5",
      "27,5",
      "32,5"
    ],
    "correctAnswer": 3,
    "solution": "En alt noktada merkez yukarıdadır: T − mg = mv²/r → T = 0,5 · 10 + 0,5 · 36/0,8 = 5 + 22,5 = 27,5 N.",
    "hint": "En alt noktada gerilme hem ağırlığı dengeler hem de merkezcil kuvveti sağlar.",
    "commonMistake": "Ağırlığı çıkarıp 17,5 N bulmak ya da yalnız merkezcil kuvveti (22,5 N) almak.",
    "teacherNote": "Düşey çembersel harekette noktaya göre kuvvet analizi ölçülür."
  },
  {
    "id": "aytfiz-cembersel-hareket-q303",
    "topic": "aytfiz-cembersel-hareket",
    "subtopic": "aytfiz-cembersel-hareket-s2",
    "outcome": "Merkezcil ivme ve merkezcil kuvveti hesaplar.",
    "difficulty": "yeni-nesil",
    "type": "yeni-nesil",
    "question": "Kan örneklerini ayrıştırmak için kullanılan bir santrifüj cihazında, tüplerin dibi dönme ekseninden 12 cm uzaktadır. Cihaz dakikada 3000 devirle dönmektedir.\n\nTüp dibindeki merkezcil ivme, yer çekimi ivmesinin (g = 10 m/s²) yaklaşık kaç katıdır? (π = 3)",
    "options": [
      "108",
      "540",
      "1080",
      "2160",
      "10 800"
    ],
    "correctAnswer": 2,
    "solution": "f = 3000/60 = 50 Hz. a = ω²r = (2πf)²r = (2 · 3 · 50)² · 0,12 = 300² · 0,12 = 10 800 m/s². a/g = 10 800/10 = 1080.",
    "hint": "Devir/dakikayı önce Hz’e, sonra açısal hıza çevir.",
    "commonMistake": "İvmeyi g’ye bölmeyi unutup 10 800 demek ya da 2π’yi atlamak.",
    "teacherNote": "Birim dönüşümü ve merkezcil ivme bağıntısını teknolojik bağlamda ölçer."
  },
  {
    "id": "aytfiz-donme-acisal-momentum-q301",
    "topic": "aytfiz-donme-acisal-momentum",
    "subtopic": "aytfiz-donme-acisal-momentum-s1",
    "outcome": "Eylemsizlik momentinin kütle dağılımına bağlı olduğunu açıklar.",
    "difficulty": "kolay",
    "type": "islem",
    "question": "Kütlesi 4 kg, yarıçapı 0,5 m olan içi dolu türdeş bir disk, merkezinden geçen sabit eksen etrafında 10 rad/s açısal hızla dönmektedir. (Disk için I = ½mr²)\n\nDiskin dönme kinetik enerjisi kaç J’dür?",
    "options": [
      "5",
      "10",
      "25",
      "50",
      "100"
    ],
    "correctAnswer": 2,
    "solution": "I = ½ · 4 · 0,5² = 0,5 kg·m². E = ½Iω² = ½ · 0,5 · 100 = 25 J.",
    "hint": "Önce eylemsizlik momentini hesapla.",
    "commonMistake": "I yerine mr² kullanıp 50 J bulmak.",
    "teacherNote": "Dönme kinetik enerjisi ve eylemsizlik momenti kullanımını ölçer."
  },
  {
    "id": "aytfiz-donme-acisal-momentum-q302",
    "topic": "aytfiz-donme-acisal-momentum",
    "subtopic": "aytfiz-donme-acisal-momentum-s2",
    "outcome": "Kaymadan yuvarlanan cisimlerin toplam kinetik enerjisini hesaplar.",
    "difficulty": "orta",
    "type": "problem",
    "question": "İçi dolu türdeş bir disk (I = ½mr²), 1,2 m yükseklikteki bir eğik düzlemin tepesinden durgun hâlden bırakılıyor ve kaymadan yuvarlanarak aşağı iniyor.\n\nDiskin eğik düzlemin alt ucundaki ötelenme sürati kaç m/s’dir? (g = 10 m/s²)",
    "options": [
      "2",
      "3",
      "4",
      "2√6",
      "6"
    ],
    "correctAnswer": 2,
    "solution": "mgh = ½mv² + ½Iω² = ½mv² + ½ · ½mr² · (v/r)² = ¾mv². v² = 4gh/3 = 4 · 10 · 1,2/3 = 16 → v = 4 m/s.",
    "hint": "Kaymadan yuvarlanmada v = ωr; enerjinin bir kısmı dönmeye gider.",
    "commonMistake": "Dönme enerjisini unutup v = √(2gh) = 2√6 m/s bulmak.",
    "teacherNote": "Dönerek ötelemede enerji paylaşımını ölçer."
  },
  {
    "id": "aytfiz-donme-acisal-momentum-q303",
    "topic": "aytfiz-donme-acisal-momentum",
    "subtopic": "aytfiz-donme-acisal-momentum-s2",
    "outcome": "Kaymadan yuvarlanan cisimlerin toplam kinetik enerjisini hesaplar.",
    "difficulty": "zor",
    "type": "yorum",
    "question": "Yatay zeminde kaymadan yuvarlanan içi dolu türdeş bir disk (I = ½mr²) için dönme kinetik enerjisinin toplam kinetik enerjiye oranı kaçtır?",
    "options": [
      "1/4",
      "1/3",
      "1/2",
      "2/3",
      "3/4"
    ],
    "correctAnswer": 1,
    "solution": "Öteleme enerjisi ½mv². Dönme enerjisi ½ · ½mr² · (v/r)² = ¼mv². Toplam ¾mv². Oran (¼)/(¾) = 1/3.",
    "hint": "Dönme enerjisini v cinsinden yaz ve toplamla karşılaştır.",
    "commonMistake": "Dönme enerjisinin öteleme enerjisine oranını (1/2) sorulan oran sanmak.",
    "teacherNote": "Oran sorularında payda seçimine dikkat ve yuvarlanmada enerji dağılımı ölçülür."
  },
  {
    "id": "aytfiz-donme-acisal-momentum-q304",
    "topic": "aytfiz-donme-acisal-momentum",
    "subtopic": "aytfiz-donme-acisal-momentum-s3",
    "outcome": "Açısal momentumu açıklar ve torkla ilişkilendirir.",
    "difficulty": "orta",
    "type": "onculu",
    "question": "Sürtünmesiz dönebilen bir sandalyede oturan öğrenci, iki elinde dambıllarla kollarını açmış hâlde dönerken kollarını göğsüne çekiyor. Bu sırada sistemin eylemsizlik momenti 6 kg·m²’den 2 kg·m²’ye iniyor.\n\nBuna göre aşağıdaki ifadelerden hangileri doğrudur?",
    "premises": [
      "Öğrencinin açısal hızı 3 katına çıkar.",
      "Sistemin açısal momentumu korunur.",
      "Sistemin dönme kinetik enerjisi değişmez."
    ],
    "options": [
      "Yalnız I",
      "Yalnız II",
      "I ve II",
      "II ve III",
      "I, II ve III"
    ],
    "correctAnswer": 2,
    "solution": "Dış tork olmadığından açısal momentum korunur: I₁ω₁ = I₂ω₂ → ω₂ = 3ω₁ (I ve II doğru). Dönme kinetik enerjisi L²/(2I) olduğundan L sabitken I 3’te 1’e inince enerji 3 katına çıkar; artış, öğrencinin kollarını çekerken yaptığı işten gelir (III yanlış).",
    "hint": "L = Iω sabit; E = L²/(2I).",
    "commonMistake": "Açısal momentum korunuyorsa kinetik enerjinin de korunduğunu sanmak.",
    "teacherNote": "Açısal momentum korunumu ile enerji korunumu arasındaki farkı ölçer."
  },
  {
    "id": "aytfiz-donme-acisal-momentum-q305",
    "topic": "aytfiz-donme-acisal-momentum",
    "subtopic": "aytfiz-donme-acisal-momentum-s3",
    "outcome": "Açısal momentumu açıklar ve torkla ilişkilendirir.",
    "difficulty": "yeni-nesil",
    "type": "yeni-nesil",
    "question": "Bazı iklim modellerine göre kutuplardaki buzulların erimesiyle oluşan su, okyanuslar yoluyla ekvator bölgelerine doğru yayılmaktadır. Dünya’nın dönme eksenine göre açısal momentumunun dış etkilerden bağımsız olarak korunduğu kabul ediliyor.\n\nBu kütle dağılımı değişiminin Dünya’nın dönmesine etkisi için aşağıdakilerden hangisi doğrudur?",
    "options": [
      "Eylemsizlik momenti azalır, gün uzar.",
      "Eylemsizlik momenti artar, gün kısalır.",
      "Eylemsizlik momenti değişmez, gün değişmez.",
      "Eylemsizlik momenti azalır, gün kısalır.",
      "Eylemsizlik momenti artar, gün uzar."
    ],
    "correctAnswer": 4,
    "solution": "Kütle dönme ekseninden (kutuplardan) uzaklaşıp ekvatora yayıldığında I = Σmr² artar. L = Iω korunduğundan ω azalır; bir tam dönüş daha uzun sürer, yani gün (çok küçük bir miktar) uzar.",
    "hint": "Kütle eksenden uzaklaşırsa eylemsizlik momenti ne olur?",
    "commonMistake": "Kütle toplam olarak değişmediği için eylemsizlik momentinin de değişmeyeceğini sanmak.",
    "teacherNote": "Açısal momentum korunumunu gezegen ölçeğinde nitel yorumlama ölçülür."
  },
  {
    "id": "aytfiz-kutle-cekim-kepler-q301",
    "topic": "aytfiz-kutle-cekim-kepler",
    "subtopic": "aytfiz-kutle-cekim-kepler-s1",
    "outcome": "Kütleler arasındaki çekim kuvvetini hesaplar.",
    "difficulty": "orta",
    "type": "islem",
    "question": "Dünya’nın kütlesi Ay’ın kütlesinin yaklaşık 81 katıdır. Dünya ile Ay’ın merkezleri arasındaki uzaklık d’dir.\n\nİki merkezi birleştiren doğru üzerinde, bir uzay aracına Dünya ve Ay’ın uyguladığı çekim kuvvetlerinin eşit büyüklükte olduğu nokta Dünya’nın merkezinden kaç d uzaklıktadır?",
    "options": [
      "0,9d",
      "0,1d",
      "0,81d",
      "0,75d",
      "0,5d"
    ],
    "correctAnswer": 0,
    "solution": "G·M_D·m/x² = G·M_A·m/(d − x)² → (d − x)/x = √(M_A/M_D) = 1/9 → 9(d − x) = x → x = 0,9d.",
    "hint": "Kuvvetleri eşitle ve kütle oranının karekökünü al.",
    "commonMistake": "Karekök almayı unutup 81/82 ≈ 0,99d gibi ya da kütleyle doğrusal orantı kurup yanlış oran bulmak.",
    "teacherNote": "Ters kare yasasında denge noktası bulma becerisi ölçülür."
  },
  {
    "id": "aytfiz-kutle-cekim-kepler-q302",
    "topic": "aytfiz-kutle-cekim-kepler",
    "subtopic": "aytfiz-kutle-cekim-kepler-s2",
    "outcome": "Çekim ivmesinin gezegen yüzeyinden uzaklığa bağlı değişimini açıklar.",
    "difficulty": "zor",
    "type": "yorum",
    "question": "Küresel ve türdeş kabul edilen X gezegeninin yarıçapı Dünya’nın yarıçapının 2 katı, ortalama yoğunluğu ise Dünya’nın ortalama yoğunluğunun yarısıdır.\n\nDünya yüzeyindeki çekim ivmesi g olduğuna göre X gezegeninin yüzeyindeki çekim ivmesi nedir?",
    "options": [
      "g",
      "g/4",
      "g/2",
      "2g",
      "4g"
    ],
    "correctAnswer": 0,
    "solution": "g = GM/R² ve M = ρ·(4/3)πR³ olduğundan g = (4/3)πGρR, yani g ∝ ρ·R. X için ρ/2 ve 2R → g_X = (1/2)(2)·g = g.",
    "hint": "Kütleyi yoğunluk ve yarıçap cinsinden yaz; g’nin ρ ve R’ye bağlılığını bul.",
    "commonMistake": "Kütlenin yalnız 2 katına çıktığını düşünüp g/2 bulmak.",
    "teacherNote": "Çekim ivmesini yoğunluk ve boyut üzerinden yorumlama ölçülür."
  },
  {
    "id": "aytfiz-kutle-cekim-kepler-q303",
    "topic": "aytfiz-kutle-cekim-kepler",
    "subtopic": "aytfiz-kutle-cekim-kepler-s3",
    "outcome": "Kepler yasalarını açıklar ve periyot–yörünge yarıçapı ilişkisini kullanır.",
    "difficulty": "orta",
    "type": "islem",
    "question": "Güneş’in çevresinde dolanan varsayımsal bir cüce gezegenin yörüngesinin büyük yarı ekseni 16 AB’dir (1 AB: Dünya’nın yörüngesinin büyük yarı ekseni).\n\nBu cüce gezegenin Güneş çevresindeki dolanım periyodu kaç Dünya yılıdır?",
    "options": [
      "4",
      "16",
      "32",
      "48",
      "64"
    ],
    "correctAnswer": 4,
    "solution": "Kepler’in üçüncü yasası: T² ∝ a³. Dünya için a = 1 AB, T = 1 yıl. T² = 16³ = 4096 → T = 64 yıl.",
    "hint": "Aynı merkez cisim için T²/a³ oranı sabittir.",
    "commonMistake": "T ∝ a alıp 16 yıl ya da T² ∝ a² gibi yanlış üs kullanmak.",
    "teacherNote": "Kepler’in periyotlar yasasını oran olarak kullanma ölçülür."
  },
  {
    "id": "aytfiz-kutle-cekim-kepler-q304",
    "topic": "aytfiz-kutle-cekim-kepler",
    "subtopic": "aytfiz-kutle-cekim-kepler-s4",
    "outcome": "Uyduların yörünge hızını ve periyodunu hesaplar.",
    "difficulty": "orta",
    "type": "onculu",
    "question": "Yarıçapı R, yüzeyindeki çekim ivmesi g olan havasız bir gezegenin yüzeyine çok yakın çembersel yörüngede dolanan bir uydu için aşağıdaki ifadelerden hangileri doğrudur?",
    "premises": [
      "Uydunun yörünge sürati √(gR)’dir.",
      "Gezegenden kurtulma hızı, bu uydunun yörünge süratinin √2 katıdır.",
      "Uydunun yörünge sürati uydunun kütlesine bağlı değildir."
    ],
    "options": [
      "Yalnız I",
      "Yalnız II",
      "I ve II",
      "II ve III",
      "I, II ve III"
    ],
    "correctAnswer": 4,
    "solution": "I. Merkezcil kuvveti çekim sağlar: mg = mv²/R → v = √(gR) — doğru. II. Kurtulma hızı √(2gR) olup yörünge hızının √2 katıdır — doğru. III. v = √(gR) bağıntısında uydunun kütlesi yoktur; yörünge hızı kütleden bağımsızdır — doğru.",
    "hint": "mg = mv²/R eşitliğinde m sadeleşir; kurtulma için ½mv² = GMm/R.",
    "commonMistake": "Ağır uyduların daha hızlı dolanması gerektiğini sanmak.",
    "teacherNote": "Yörünge hızı ile kurtulma hızı arasındaki ilişkiyi ölçer."
  },
  {
    "id": "aytfiz-kutle-cekim-kepler-q305",
    "topic": "aytfiz-kutle-cekim-kepler",
    "subtopic": "aytfiz-kutle-cekim-kepler-s2",
    "outcome": "Çekim ivmesinin gezegen yüzeyinden uzaklığa bağlı değişimini açıklar.",
    "difficulty": "yeni-nesil",
    "type": "yeni-nesil",
    "question": "Bir bilim kurgu romanında sporcular, kütlesi Dünya’nın 0,1 katı ve yarıçapı Dünya’nın 0,5 katı olan bir gezegende yüksek atlama yarışması yapıyor. Dünya’da ağırlık merkezini en fazla 0,5 m yükseltebilen bir sporcu, bu gezegende aynı ilk hızla sıçrıyor.\n\nSporcu bu gezegende ağırlık merkezini en fazla kaç m yükseltebilir? (Atmosfer etkisi önemsiz)",
    "options": [
      "1,25",
      "1,0",
      "0,8",
      "0,5",
      "0,2"
    ],
    "correctAnswer": 0,
    "solution": "g_X/g = (M_X/M)/(R_X/R)² = 0,1/0,25 = 0,4. Aynı ilk hızla çıkılan yükseklik h = v²/(2g) → h ∝ 1/g. h_X = 0,5/0,4 = 1,25 m.",
    "hint": "Önce gezegenin yüzey çekim ivmesini Dünya’nınkiyle karşılaştır.",
    "commonMistake": "h’yi g ile doğru orantılı alıp 0,2 m bulmak.",
    "teacherNote": "Çekim ivmesinin kütle ve yarıçapa bağlılığını hareket problemiyle birleştirme ölçülür."
  },
  {
    "id": "aytfiz-basit-harmonik-hareket-q301",
    "topic": "aytfiz-basit-harmonik-hareket",
    "subtopic": "aytfiz-basit-harmonik-hareket-s4",
    "outcome": "Basit sarkacın periyodunu etkileyen değişkenleri açıklar ve periyodu hesaplar.",
    "difficulty": "orta",
    "type": "islem",
    "question": "Küçük açılarla salınan bir basit sarkacın periyodu 2 s’dir. Sarkacın ip uzunluğu %44 artırılıyor.\n\nSarkacın yeni periyodu kaç s olur?",
    "options": [
      "2,88",
      "2,4",
      "2,2",
      "2",
      "1,67"
    ],
    "correctAnswer": 1,
    "solution": "T = 2π√(L/g) → T ∝ √L. Yeni uzunluk 1,44L → T′ = 2 · √1,44 = 2 · 1,2 = 2,4 s.",
    "hint": "Periyot ip uzunluğunun kareköküyle orantılıdır.",
    "commonMistake": "Periyodu uzunlukla doğru orantılı alıp 2,88 s bulmak.",
    "teacherNote": "Basit sarkaçta periyodun ip uzunluğuna karekök bağlılığı ölçülür."
  },
  {
    "id": "aytfiz-dalga-mekanigi-q301",
    "topic": "aytfiz-dalga-mekanigi",
    "subtopic": "aytfiz-dalga-mekanigi-s4",
    "outcome": "Kaynak veya gözlemci hareketinde algılanan frekansın değişimini açıklar.",
    "difficulty": "orta",
    "type": "islem",
    "question": "Durgun bir kaynak 680 Hz frekanslı ses yaymaktadır. Bir bisikletli bu kaynağa 20 m/s sabit süratle doğrudan yaklaşıyor.\n\nBisikletlinin duyduğu sesin frekansı kaç Hz’dir? (Sesin havadaki sürati 340 m/s; rüzgâr yok)",
    "options": [
      "600",
      "640",
      "680",
      "700",
      "720"
    ],
    "correctAnswer": 4,
    "solution": "Gözlemci hareketli, kaynak durgun: f′ = f · (v + v_g)/v = 680 · (340 + 20)/340 = 680 · 360/340 = 720 Hz.",
    "hint": "Gözlemci kaynağa yaklaşıyorsa birim zamanda daha çok dalga cephesiyle karşılaşır.",
    "commonMistake": "Uzaklaşma formülünü kullanıp 640 Hz bulmak.",
    "teacherNote": "Doppler olayında gözlemcinin hareketini doğru yorumlama ölçülür."
  },
  {
    "id": "aytfiz-dalga-mekanigi-q302",
    "topic": "aytfiz-dalga-mekanigi",
    "subtopic": "aytfiz-dalga-mekanigi-s3",
    "outcome": "Tek yarıkta kırınım desenini açıklar.",
    "difficulty": "orta",
    "type": "onculu",
    "question": "Güneş ışığı altında sabun köpüklerinde ve su birikintisinin üzerindeki ince yağ tabakasında renkli bantlar gözlenir.\n\nBu olayla ilgili aşağıdaki ifadelerden hangileri doğrudur?",
    "premises": [
      "Renkler, zarın iki yüzeyinden yansıyan ışınların girişimiyle oluşur.",
      "Zarın kalınlığı değiştikçe gözlenen renk de değişir.",
      "Tek renkli ışık kullanılsaydı renkli bantlar yerine aydınlık ve karanlık bantlar gözlenirdi."
    ],
    "options": [
      "Yalnız I",
      "Yalnız II",
      "I ve II",
      "II ve III",
      "I, II ve III"
    ],
    "correctAnswer": 4,
    "solution": "I. Renkler, ince zarın üst ve alt yüzeylerinden yansıyan ışınların girişiminden oluşur — doğru. II. Yol farkı zar kalınlığına bağlı olduğundan kalınlık değiştikçe güçlenen dalga boyu (renk) değişir — doğru. III. Tek renkli ışıkta yalnız o renk güçlenip zayıflayacağından aydınlık–karanlık bantlar gözlenir — doğru.",
    "hint": "İki yüzeyden yansıyan ışınlar arasındaki yol farkını düşün.",
    "commonMistake": "Renklerin kırınımdan ya da prizma gibi dağılmadan oluştuğunu sanmak.",
    "teacherNote": "İnce zarda girişimi günlük gözlemlerle ilişkilendirme ölçülür."
  },
  {
    "id": "aytfiz-em-dalgalar-q301",
    "topic": "aytfiz-em-dalgalar",
    "subtopic": "aytfiz-em-dalgalar-s1",
    "outcome": "Elektromanyetik dalgaların ivmeli yüklerle oluştuğunu açıklar.",
    "difficulty": "kolay",
    "type": "islem",
    "question": "Bir mikrodalga fırın 2,5 GHz frekanslı elektromanyetik dalgalar kullanmaktadır.\n\nBu dalgaların havadaki dalga boyu kaç cm’dir? (c = 3·10⁸ m/s)",
    "options": [
      "12",
      "1,2",
      "0,12",
      "120",
      "7,5"
    ],
    "correctAnswer": 0,
    "solution": "λ = c/f = 3·10⁸ / 2,5·10⁹ = 0,12 m = 12 cm.",
    "hint": "λ = c/f; GHz = 10⁹ Hz.",
    "commonMistake": "Metreyi santimetreye çevirmeyi unutup 0,12 demek.",
    "teacherNote": "Dalga denklemini birim dönüşümüyle birlikte kullanma ölçülür."
  },
  {
    "id": "aytfiz-em-dalgalar-q302",
    "topic": "aytfiz-em-dalgalar",
    "subtopic": "aytfiz-em-dalgalar-s2",
    "outcome": "Elektromanyetik spektrumdaki dalgaları dalga boyu, frekans ve enerjiye göre sıralar.",
    "difficulty": "kolay",
    "type": "bilgi",
    "question": "Aşağıdaki elektromanyetik ışımalardan hangisi atomlardan elektron koparabilecek kadar enerjili fotonlar taşıyan iyonlaştırıcı ışımadır?",
    "options": [
      "Radyo dalgası",
      "Mikrodalga",
      "Kızılötesi ışın",
      "Görünür ışık",
      "Gama ışını"
    ],
    "correctAnswer": 4,
    "solution": "Foton enerjisi E = hf’dir; frekansı çok yüksek olan gama ışınları atomları iyonlaştırabilir. Radyo, mikrodalga, kızılötesi ve görünür ışık fotonları iyonlaştırıcı değildir (mor ötesinin yüksek frekanslı kısmı, X ve gama ışınları iyonlaştırıcıdır).",
    "hint": "Foton enerjisi frekansla artar.",
    "commonMistake": "Mikrodalgaların ısıtma etkisini iyonlaştırma ile karıştırmak.",
    "teacherNote": "Spektrumda enerji sıralamasını sağlık bağlamında yorumlama ölçülür."
  },
  {
    "id": "aytfiz-em-dalgalar-q303",
    "topic": "aytfiz-em-dalgalar",
    "subtopic": "aytfiz-em-dalgalar-s2",
    "outcome": "Elektromanyetik spektrumdaki dalgaları dalga boyu, frekans ve enerjiye göre sıralar.",
    "difficulty": "yeni-nesil",
    "type": "yeni-nesil",
    "question": "Navigasyon uydularından biri, alıcının yaklaşık 20 000 km yukarısında bulunmaktadır. Alıcı, konumunu sinyalin uydudan kendisine ulaşma süresini ölçerek hesaplar.\n\nSinyalin uydudan alıcıya ulaşması yaklaşık kaç milisaniye sürer? (c = 3·10⁸ m/s)",
    "options": [
      "0,67",
      "6,7",
      "15",
      "60",
      "66,7"
    ],
    "correctAnswer": 4,
    "solution": "t = d/c = 2·10⁷ m / 3·10⁸ m/s ≈ 0,0667 s = 66,7 ms. 1 μs’lik zaman hatası bile 300 m konum hatası demektir; bu yüzden uydularda çok hassas saatler kullanılır.",
    "hint": "Mesafeyi metreye çevir; sinyal ışık hızıyla gider.",
    "commonMistake": "km’yi m’ye çevirmeyi unutup ya da sonucu saniye cinsinden bırakıp 0,067 ile karıştırmak.",
    "teacherNote": "EM dalgaların sonlu hızını teknolojik bir sistemde kullanma ölçülür."
  },
  {
    "id": "aytfiz-em-dalgalar-q304",
    "topic": "aytfiz-em-dalgalar",
    "subtopic": "aytfiz-em-dalgalar-s1",
    "outcome": "Elektromanyetik dalgaların ivmeli yüklerle oluştuğunu açıklar.",
    "difficulty": "orta",
    "type": "islem",
    "question": "Boşluktaki dalga boyu 1000 nm olan kızılötesi ışın ile 250 nm olan mor ötesi ışın karşılaştırılıyor.\n\nBu ışınlar için aşağıdakilerden hangisi doğrudur?",
    "options": [
      "Mor ötesi fotonun enerjisi kızılötesininkinin 4 katıdır; boşluktaki hızları eşittir.",
      "Kızılötesi fotonun enerjisi mor ötesininkinin 4 katıdır; hızları eşittir.",
      "Foton enerjileri eşittir; mor ötesinin hızı 4 kat büyüktür.",
      "Mor ötesi fotonun enerjisi 16 kat büyüktür; hızları eşittir.",
      "Mor ötesinin frekansı 4 kat küçüktür; hızları eşittir."
    ],
    "correctAnswer": 0,
    "solution": "Boşlukta tüm EM dalgalar c hızıyla yayılır. E = hc/λ olduğundan enerji dalga boyuyla ters orantılıdır: 1000/250 = 4 → mor ötesi fotonun enerjisi 4 kat büyüktür (frekansı da 4 kat büyüktür).",
    "hint": "E = hc/λ; boşlukta hız herkes için c’dir.",
    "commonMistake": "Dalga boyu büyük olanın enerjisinin de büyük olduğunu sanmak.",
    "teacherNote": "Dalga boyu–frekans–enerji ilişkisini ölçer."
  },
  {
    "id": "aytfiz-em-dalgalar-q305",
    "topic": "aytfiz-em-dalgalar",
    "subtopic": "aytfiz-em-dalgalar-s2",
    "outcome": "Elektromanyetik spektrumdaki dalgaları dalga boyu, frekans ve enerjiye göre sıralar.",
    "difficulty": "orta",
    "type": "yorum",
    "question": "Elektromanyetik ışımaların kullanımıyla ilgili aşağıdaki eşleştirmelerden hangisi yanlıştır?",
    "options": [
      "Röntgen filmi – X ışınlarının kemikte yumuşak dokuya göre daha çok soğurulması",
      "Yazın bronzlaşma – kızılötesi ışınların deride pigment üretimini uyarması",
      "Televizyon uzaktan kumandası – kızılötesi ışın",
      "Hava trafik radarı – mikrodalgaların cisimlerden yansıması",
      "Bazı kanser tedavileri – gama ışınlarının hücrelere zarar vermesi"
    ],
    "correctAnswer": 1,
    "solution": "Deride melanin üretimini uyaran ve bronzlaşma ile güneş yanığına yol açan ışıma mor ötesidir (UV), kızılötesi değildir. Diğer eşleştirmeler doğrudur.",
    "hint": "Güneş kremleri hangi ışımaya karşı koruma sağlar?",
    "commonMistake": "Güneşin ısıttığı hissini veren kızılötesini bronzlaşmanın nedeni sanmak.",
    "teacherNote": "EM spektrumun günlük ve tıbbi uygulamalarını ayırt etme ölçülür."
  },
  {
    "id": "aytfiz-atom-fizigi-radyoaktivite-q301",
    "topic": "aytfiz-atom-fizigi-radyoaktivite",
    "subtopic": "aytfiz-atom-fizigi-radyoaktivite-s2",
    "outcome": "Atomun uyarılma yollarını açıklar.",
    "difficulty": "orta",
    "type": "islem",
    "question": "Hidrojen atomları n = 4 enerji düzeyine uyarılmıştır. Atomlar temel hâle dönerken olası tüm geçişler gerçekleşiyor.\n\nYayımlanan ışıkta en fazla kaç farklı dalga boyu gözlenebilir?",
    "options": [
      "2",
      "3",
      "4",
      "5",
      "6"
    ],
    "correctAnswer": 4,
    "solution": "Olası geçişler: 4→3, 4→2, 4→1, 3→2, 3→1, 2→1. Farklı geçiş sayısı n(n − 1)/2 = 4·3/2 = 6.",
    "hint": "Dört düzey arasındaki farklı ikili seçimleri say.",
    "commonMistake": "Yalnız doğrudan temel hâle inişleri sayıp 3 bulmak.",
    "teacherNote": "Bohr modelinde kesikli spektrum oluşumunu ölçer."
  },
  {
    "id": "aytfiz-atom-fizigi-radyoaktivite-q302",
    "topic": "aytfiz-atom-fizigi-radyoaktivite",
    "subtopic": "aytfiz-atom-fizigi-radyoaktivite-s4",
    "outcome": "Alfa, beta ve gama bozunmalarında çekirdekteki değişimi açıklar.",
    "difficulty": "orta",
    "type": "islem",
    "question": "Tiroit taramasında kullanılan radyoaktif iyot-131’in yarı ömrü yaklaşık 8 gündür.\n\nHastaya verilen iyot-131’in 24 gün sonra bozunmadan kalan miktarı başlangıçtakinin yüzde kaçıdır? (Vücuttan atılma ihmal ediliyor.)",
    "options": [
      "%12,5",
      "%25",
      "%33",
      "%50",
      "%75"
    ],
    "correctAnswer": 0,
    "solution": "24 gün = 3 yarı ömür. Kalan oran (1/2)³ = 1/8 = %12,5.",
    "hint": "Önce kaç yarı ömür geçtiğini bul.",
    "commonMistake": "Doğrusal azalma varsayıp 24/8 = 3 → %100 − 3·%25 = %25 gibi hesaplamak.",
    "teacherNote": "Yarı ömür kavramını sağlık bağlamında ölçer."
  },
  {
    "id": "aytfiz-atom-fizigi-radyoaktivite-q303",
    "topic": "aytfiz-atom-fizigi-radyoaktivite",
    "subtopic": "aytfiz-atom-fizigi-radyoaktivite-s5",
    "outcome": "Fisyon ve füzyon tepkimelerini karşılaştırır.",
    "difficulty": "zor",
    "type": "islem",
    "question": "Döteryum ve trityum çekirdeklerinin birleşerek bir helyum-4 çekirdeği ve bir nötron oluşturduğu füzyon tepkimesinde kütle kaybı 0,0189 u’dur.\n\nBu tepkimede açığa çıkan enerji yaklaşık kaç MeV’dir? (1 u ≈ 931,5 MeV/c²)",
    "options": [
      "17,6",
      "1,76",
      "176",
      "8,8",
      "35,2"
    ],
    "correctAnswer": 0,
    "solution": "E = Δm·c² = 0,0189 · 931,5 MeV ≈ 17,6 MeV.",
    "hint": "Kütle kaybını 931,5 MeV/u ile çarp.",
    "commonMistake": "Ondalık basamağı kaydırıp 1,76 ya da 176 MeV bulmak.",
    "teacherNote": "Kütle–enerji eşdeğerliğini nükleer tepkimede kullanma ölçülür."
  },
  {
    "id": "aytfiz-atom-fizigi-radyoaktivite-q304",
    "topic": "aytfiz-atom-fizigi-radyoaktivite",
    "subtopic": "aytfiz-atom-fizigi-radyoaktivite-s1",
    "outcome": "Thomson, Rutherford ve Bohr atom modellerini karşılaştırır.",
    "difficulty": "kolay",
    "type": "bilgi",
    "question": "Hidrojen atomunun yaydığı ışığın yalnızca belirli dalga boylarından (kesikli çizgilerden) oluşmasını, elektronun belirli enerji düzeylerinde bulunabileceğini öne sürerek ilk açıklayan atom modeli aşağıdakilerden hangisidir?",
    "options": [
      "Demokritos’un atom düşüncesi",
      "Dalton atom modeli",
      "Thomson atom modeli",
      "Rutherford atom modeli",
      "Bohr atom modeli"
    ],
    "correctAnswer": 4,
    "solution": "Bohr, elektronun yalnız belirli yörüngelerde (enerji düzeylerinde) bulunabileceğini ve düzeyler arası geçişlerde belirli enerjili foton yayımlandığını öne sürerek hidrojenin çizgi spektrumunu açıklamıştır. Rutherford modeli çekirdeği keşfetmiş ama spektrumu açıklayamamıştır.",
    "hint": "Kesikli enerji düzeyi fikrini hangi model getirdi?",
    "commonMistake": "Çekirdeği bulan Rutherford modelinin spektrumu da açıkladığını sanmak.",
    "teacherNote": "Atom modellerinin tarihsel gelişimini ve her modelin katkısını ölçer."
  },
  {
    "id": "aytfiz-atom-fizigi-radyoaktivite-q305",
    "topic": "aytfiz-atom-fizigi-radyoaktivite",
    "subtopic": "aytfiz-atom-fizigi-radyoaktivite-s3",
    "outcome": "Büyük patlama teorisini ve evrenin oluşumunu kanıtlarıyla açıklar.",
    "difficulty": "orta",
    "type": "onculu",
    "question": "Büyük Patlama (Big Bang) kuramını destekleyen gözlemsel kanıtlarla ilgili aşağıdakilerden hangileri doğrudur?",
    "premises": [
      "Kozmik mikrodalga arka plan ışımasının varlığı",
      "Uzak galaksilerin ışığında gözlenen kırmızıya kayma",
      "Evrendeki hidrojen ve helyum bolluk oranları"
    ],
    "options": [
      "Yalnız I",
      "Yalnız II",
      "I ve II",
      "II ve III",
      "I, II ve III"
    ],
    "correctAnswer": 4,
    "solution": "I. Evrenin her yönünden gelen, yaklaşık 2,7 K’lik kara cisim ışımasına uyan kozmik mikrodalga arka plan ışıması erken evrenin kalıntısıdır. II. Uzak galaksilerin tayflarındaki kırmızıya kayma evrenin genişlediğini gösterir. III. Evrendeki hidrojen ve helyumun bolluk oranları, erken evrendeki çekirdek sentezinin öngörüleriyle uyumludur. Üçü de kanıttır.",
    "hint": "Genişleme, kalıntı ışıma ve element bollukları: üç temel kanıt.",
    "commonMistake": "Hafif element bolluklarını kanıt olarak tanımamak.",
    "teacherNote": "Bilimsel kuramların gözlemle desteklenmesini ölçer."
  },
  {
    "id": "aytfiz-modern-fizik-teknoloji-q301",
    "topic": "aytfiz-modern-fizik-teknoloji",
    "subtopic": "aytfiz-modern-fizik-teknoloji-s2",
    "outcome": "Yarı iletkenlerin yapısını ve diyot, transistör, LED gibi uygulamalarını açıklar.",
    "difficulty": "orta",
    "type": "onculu",
    "question": "LED’lerle ilgili aşağıdaki ifadelerden hangileri doğrudur?",
    "premises": [
      "Mavi ışık yayan LED’in yarı iletkeninin yasak enerji aralığı, kırmızı ışık yayanınkinden büyüktür.",
      "LED’de ışık, elektronların deşiklerle birleşmesi sırasında yayımlanır.",
      "LED, ters yönde kutuplandığında en parlak ışığını verir."
    ],
    "options": [
      "Yalnız I",
      "Yalnız II",
      "I ve II",
      "II ve III",
      "I, II ve III"
    ],
    "correctAnswer": 2,
    "solution": "I. E = hc/λ; mavi ışığın dalga boyu kısa, foton enerjisi büyüktür; bu nedenle mavi LED’in yasak enerji aralığı daha büyüktür — doğru. II. İleri yönde kutuplanan p-n ekleminde elektronlar deşiklerle birleşirken foton yayımlar — doğru. III. Ters kutuplamada eklemden akım geçmez, LED ışık vermez — yanlış.",
    "hint": "Yayılan fotonun enerjisi yaklaşık yasak enerji aralığına eşittir.",
    "commonMistake": "LED’in her iki kutuplamada da ışık verdiğini sanmak.",
    "teacherNote": "Yarı iletken ışık kaynaklarının çalışma ilkesini ölçer."
  },
  {
    "id": "aytfiz-modern-fizik-teknoloji-q302",
    "topic": "aytfiz-modern-fizik-teknoloji",
    "subtopic": "aytfiz-modern-fizik-teknoloji-s2",
    "outcome": "Yarı iletkenlerin yapısını ve diyot, transistör, LED gibi uygulamalarını açıklar.",
    "difficulty": "yeni-nesil",
    "type": "yeni-nesil",
    "question": "Bir evin çatısına toplam alanı 1,6 m² olan bir güneş paneli kuruluyor. Panelin verimi %20’dir. Panele gün içinde ortalama 1000 W/m² şiddetinde güneş ışığı düştüğü süre 5 saat kabul ediliyor.\n\nPanelin bir günde ürettiği elektrik enerjisi kaç kWh’dir?",
    "options": [
      "0,32",
      "1,6",
      "3,2",
      "8",
      "16"
    ],
    "correctAnswer": 1,
    "solution": "Panele düşen güç 1000 · 1,6 = 1600 W. Elektrik gücü %20 → 320 W. Günlük enerji 320 W · 5 h = 1600 Wh = 1,6 kWh.",
    "hint": "Önce gelen gücü, sonra verimi, en son süreyi kullan.",
    "commonMistake": "Verimi uygulamayıp 8 kWh ya da süreyi unutup 0,32 bulmak.",
    "teacherNote": "Güneş pillerinde verim ve enerji hesabını gerçek bağlamda ölçer."
  },
  {
    "id": "aytfiz-modern-fizik-teknoloji-q303",
    "topic": "aytfiz-modern-fizik-teknoloji",
    "subtopic": "aytfiz-modern-fizik-teknoloji-s3",
    "outcome": "Süper iletkenliğin özelliklerini ve kullanım alanlarını açıklar.",
    "difficulty": "kolay",
    "type": "bilgi",
    "question": "Aşağıdakilerden hangisi lazer ışığının özelliklerinden biri değildir?",
    "options": [
      "Tek renkli (tek dalga boylu) olması",
      "Eş fazlı (uyumlu) olması",
      "Az ıraksayarak dar bir demet hâlinde ilerlemesi",
      "Birçok farklı dalga boyunun karışımından oluşması",
      "Birim alana düşen gücünün yüksek olabilmesi"
    ],
    "correctAnswer": 3,
    "solution": "Lazer ışığı uyarılmış emisyonla üretilir; tek renkli, eş fazlı, yönlü (az ıraksayan) ve yüksek şiddetlidir. Farklı dalga boylarının karışımı olan ışık beyaz ışık gibi sıradan kaynakların özelliğidir.",
    "hint": "‘LASER’ adındaki ‘uyarılmış emisyon’ ne tür fotonlar üretir?",
    "commonMistake": "Lazerin çok parlak olduğu için tüm renkleri içerdiğini sanmak.",
    "teacherNote": "Lazer ışığının temel özelliklerini ölçer."
  },
  {
    "id": "aytfiz-modern-fizik-teknoloji-q304",
    "topic": "aytfiz-modern-fizik-teknoloji",
    "subtopic": "aytfiz-modern-fizik-teknoloji-s1",
    "outcome": "Röntgen, BT, MR, PET ve ultrason gibi görüntüleme tekniklerinin çalışma ilkelerini açıklar.",
    "difficulty": "orta",
    "type": "yorum",
    "question": "Hamile bir kadında bebeğin gelişimi düzenli olarak izlenmek isteniyor. Kullanılacak yöntemin iyonlaştırıcı ışıma içermemesi ve anlık (gerçek zamanlı) görüntü vermesi isteniyor.\n\nBuna göre en uygun görüntüleme yöntemi aşağıdakilerden hangisidir?",
    "options": [
      "Bilgisayarlı tomografi (BT)",
      "Röntgen (X ışını) filmi",
      "Pozitron emisyon tomografisi (PET)",
      "Ultrason",
      "Sintigrafi"
    ],
    "correctAnswer": 3,
    "solution": "Ultrason, yüksek frekanslı ses dalgalarının dokulardan yansımasıyla görüntü oluşturur; iyonlaştırıcı değildir ve gerçek zamanlı görüntü verir. BT ve röntgen X ışını; PET ve sintigrafi radyoaktif madde kullanır.",
    "hint": "Hangi yöntem EM ışıma değil mekanik dalga kullanır?",
    "commonMistake": "BT’nin ayrıntılı görüntü verdiği için her durumda en iyi seçim olduğunu düşünmek.",
    "teacherNote": "Görüntüleme tekniklerini fiziksel ilkelerine göre seçme becerisi ölçülür."
  },
  {
    "id": "aytfiz-modern-fizik-teknoloji-q305",
    "topic": "aytfiz-modern-fizik-teknoloji",
    "subtopic": "aytfiz-modern-fizik-teknoloji-s3",
    "outcome": "Süper iletkenliğin özelliklerini ve kullanım alanlarını açıklar.",
    "difficulty": "zor",
    "type": "problem",
    "question": "Nanoteknolojide malzemelerin yeni özellik kazanmasının bir nedeni yüzey alanının artmasıdır. Kenarı 1 cm olan küp biçimindeki bir malzeme, kenarı 1 μm olan özdeş küplere bölünüyor.\n\nToplam yüzey alanı yaklaşık kaç katına çıkar?",
    "options": [
      "10¹²",
      "10⁸",
      "10⁶",
      "10⁴",
      "10²"
    ],
    "correctAnswer": 3,
    "solution": "Kenar oranı 1 cm / 1 μm = 10⁴. Küp sayısı (10⁴)³ = 10¹². Her küçük küpün alanı büyük küpünkinin (10⁻⁴)² = 10⁻⁸ katı. Toplam alan oranı 10¹² · 10⁻⁸ = 10⁴.",
    "hint": "Parça sayısını ve her parçanın alanını ayrı ayrı bul.",
    "commonMistake": "Parça sayısını (10¹²) alan oranı sanmak.",
    "teacherNote": "Boyut küçüldükçe yüzey/hacim oranının artmasını nicel olarak ölçer."
  },
];
