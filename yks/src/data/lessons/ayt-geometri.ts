import type { LessonSeed } from '../../domain/types';

export const lessons: LessonSeed[] = [
  {
    topicId: 'aytgeo-ucgenler-ileri',
    intro:
      "TYT’de üçgenlerin temel özelliklerini gördün; AYT’de ise aynı araçlar daha kalabalık şekillerde, birbirine bağlı olarak karşına çıkar. Açıortay, kenarortay, benzerlik ve alan oranları bir soruda birlikte kullanılır.\n\nBu konunun anahtarı, şekilde hangi yardımcı elemanın hangi oranı ürettiğini hızlıca görmektir: açıortay kenarları oranlar, kenarortay alanı ikiye böler, paralel doğru benzerlik kurar, ortak yükseklik alanları tabanlarla orantılı yapar.",
    prerequisites: [
      "Üçgende açı ve kenar bağıntıları",
      "Pisagor teoremi ve özel dik üçgenler",
      "Üçgenin alanı (taban · yükseklik / 2)",
      "Oran-orantı",
    ],
    concepts: [
      { term: "İç açıortay", definition: "Bir iç açıyı iki eş parçaya bölen ve karşı kenara uzanan doğru parçası." },
      { term: "Dış açıortay", definition: "Bir dış açıyı iki eş parçaya bölen doğru; karşı kenarın uzantısını keser." },
      { term: "Kenarortay", definition: "Bir köşeyi karşı kenarın orta noktasına birleştiren doğru parçası." },
      { term: "Ağırlık merkezi (G)", definition: "Kenarortayların kesim noktası; her kenarortayı köşeden itibaren 2:1 oranında böler." },
      { term: "Benzerlik oranı (k)", definition: "Benzer iki üçgende karşılıklı kenarların oranı; alanlar oranı k² olur." },
    ],
    formulas: [
      { expr: "İç açıortay: |BD| / |DC| = |AB| / |AC|", meaning: "A’dan çizilen iç açıortay karşı kenarı komşu kenarlar oranında böler." },
      { expr: "|AD|² = |AB|·|AC| − |BD|·|DC|", meaning: "İç açıortay uzunluğu bağıntısı." },
      { expr: "Dış açıortay: |EB| / |EC| = |AB| / |AC|", meaning: "E, BC doğrusunun uzantısında; oran yine komşu kenarlar oranıdır." },
      { expr: "Vₐ² = (2b² + 2c² − a²) / 4", meaning: "a kenarına ait kenarortay uzunluğu." },
      { expr: "A = √(u(u−a)(u−b)(u−c)),  A = r·u,  A = a·b·c / (4R)", meaning: "Heron bağıntısı; u yarı çevre, r iç teğet, R çevrel çember yarıçapı." },
      { expr: "A₁ / A₂ = k²", meaning: "Benzer üçgenlerde alanlar oranı benzerlik oranının karesidir." },
    ],
    logic:
      "Açıortay neden kenarları oranlar? Açıortay üzerindeki her nokta açının kollarına eşit uzaklıktadır. Bu yüzden ABD ve ADC üçgenlerinin D’den AB ve AC’ye yükseklikleri eşittir; alanlar oranı hem |AB|/|AC| hem de (ortak yükseklik A’dan BC’ye olduğu için) |BD|/|DC| olur.\n\nKenarortay alanı ikiye böler çünkü iki üçgenin tabanları eşit, yükseklikleri ortaktır. Benzerlikte her uzunluk k katına çıkarken alan iki boyutlu olduğu için k² katına çıkar; bu fark sorularda en çok tuzak kurulan noktadır.",
    examples: [
      {
        level: 'kolay',
        problem: "ABC üçgeninde |AB| = 6, |AC| = 9, |BC| = 10 ve [AD] iç açıortaydır (D ∈ [BC]). |BD| kaçtır?",
        steps: [
          "İç açıortay teoremi: |BD| / |DC| = 6 / 9 = 2 / 3.",
          "|BD| = 2k, |DC| = 3k ⇒ 5k = 10 ⇒ k = 2.",
          "|BD| = 4.",
        ],
        answer: "4",
      },
      {
        level: 'orta',
        problem: "Aynı üçgende |AD| uzunluğu kaçtır?",
        steps: [
          "|BD| = 4, |DC| = 6 bulunmuştu.",
          "|AD|² = |AB|·|AC| − |BD|·|DC| = 54 − 24 = 30.",
          "|AD| = √30.",
        ],
        answer: "√30",
      },
      {
        level: 'zor',
        problem: "ABC üçgeninin alanı 60 br²’dir. D ∈ [BC], |BD| : |DC| = 2 : 3 ve E, [AD]’nin orta noktasıdır. A(BEC) kaç br²’dir?",
        steps: [
          "A(ABD) = 60 · 2/5 = 24, A(ADC) = 60 · 3/5 = 36.",
          "E, [AD]’nin orta noktası: BE, ABD’de kenarortaydır ⇒ A(BED) = 12; CE, ADC’de kenarortaydır ⇒ A(EDC) = 18.",
          "A(BEC) = 12 + 18 = 30.",
        ],
        answer: "30",
      },
    ],
    osymThinking:
      "Sorular genelde birden çok yardımcı elemanı aynı şekle yerleştirir: bir açıortay ve bir paralel doğru, ya da bir kenarortay ve bir alan oranı. Ölçülen beceri, şekli parçalara ayırıp her parçada hangi oranın geçerli olduğunu görmektir. Alan–uzunluk oranı karıştırma tuzağı çok sık kurulur.",
    commonMistakes: [
      "İç açıortay oranını ters yazmak (|BD| / |DC| = |AC| / |AB| sanmak).",
      "Benzerlikte alan oranını k yerine k² almayı unutmak.",
      "Ağırlık merkezinin kenarortayı köşeden itibaren 2:1 böldüğünü tersine kullanmak.",
      "Dış açıortayın kestiği noktayı [BC] üzerinde sanmak.",
    ],
    tips: [
      "Ortak yükseklik gördüğün anda alan oranını taban oranına çevir.",
      "Kenar uzunlukları 13-14-15 gibi Heron’a uygunsa önce alanı bul; r ve R ondan gelir.",
      "Kenarortay uzunluğu için 2b² + 2c² − a² kalıbını ezberle; kenarortay teoremidir.",
    ],
    summary: [
      "İç ve dış açıortay karşı kenarı komşu kenarlar oranında böler.",
      "Kenarortay alanı ikiye böler; G kenarortayı 2:1 böler.",
      "Benzerlikte uzunluk k, alan k² oranındadır.",
      "Heron, A = r·u ve A = abc/(4R) birlikte kullanılır.",
    ],
  },
  {
    topicId: 'aytgeo-cokgenler-dortgenler',
    intro:
      "Çokgenler ve dörtgenler konusu, açı toplamlarıyla başlar ve paralelkenar ailesi, yamuk, deltoid gibi özel dörtgenlerin alan hesaplarıyla devam eder. AYT’de bu şekiller genellikle üçgenlere bölünerek çözülür.\n\nHer dörtgenin 'kimlik kartını' bilmek (kenarlar, köşegenler, açılar hakkında ne söylenebiliyor) soruları hızlandırır.",
    prerequisites: [
      "Üçgende açı toplamı ve alan",
      "Paralel doğrularda açı özellikleri",
      "Benzerlik ve Pisagor teoremi",
    ],
    concepts: [
      { term: "Düzgün çokgen", definition: "Tüm kenarları ve tüm iç açıları eş olan çokgen." },
      { term: "Paralelkenar", definition: "Karşılıklı kenarları paralel dörtgen; köşegenleri birbirini ortalar." },
      { term: "Eşkenar dörtgen", definition: "Tüm kenarları eş paralelkenar; köşegenleri dik kesişir ve açıortaydır." },
      { term: "Yamuk", definition: "En az iki kenarı paralel dörtgen; paralel kenarlara taban denir." },
      { term: "Deltoid", definition: "İki çift komşu kenarı eş dörtgen; köşegenleri diktir." },
    ],
    formulas: [
      { expr: "İç açılar toplamı = (n − 2)·180°", meaning: "n kenarlı çokgen için." },
      { expr: "Dış açılar toplamı = 360°", meaning: "Her dış bükey çokgende sabittir." },
      { expr: "Köşegen sayısı = n(n − 3)/2", meaning: "n kenarlı çokgenin köşegen sayısı." },
      { expr: "A(yamuk) = (a + c)/2 · h", meaning: "Orta taban · yükseklik." },
      { expr: "A = e·f/2 (köşegenleri dik)", meaning: "Eşkenar dörtgen, deltoid, kare için geçerli." },
      { expr: "Köşegenleri dik dörtgende: a² + c² = b² + d²", meaning: "Karşılıklı kenarların kareleri toplamı eşittir." },
    ],
    logic:
      "(n − 2)·180° formülü, bir köşeden çizilen köşegenlerin çokgeni n − 2 üçgene ayırmasından gelir. Paralelkenarda bir köşegen şekli iki eş üçgene böler; bu yüzden alan oranı sorularında paralelkenar önce üçgenlere indirgenir. Yamukta köşegenlerin kesim noktası, tabanların oranında benzer iki üçgen oluşturur; yan üçgenlerin alanları ise her zaman eşittir.",
    examples: [
      {
        level: 'kolay',
        problem: "Bir iç açısı, bir dış açısının 4 katı olan düzgün çokgenin kenar sayısı kaçtır?",
        steps: [
          "İç + dış = 180° ⇒ 5·dış = 180° ⇒ dış = 36°.",
          "n = 360° / 36° = 10.",
        ],
        answer: "10",
      },
      {
        level: 'orta',
        problem: "ABCD yamuğunda AB ∥ DC, |AB| = 12, |DC| = 4, yükseklik 8’dir. Köşegenler E’de kesişiyor. A(AED) kaçtır?",
        steps: [
          "EDC ~ EBA, benzerlik oranı 4 : 12 = 1 : 3.",
          "E’nin DC’ye uzaklığı 2, AB’ye uzaklığı 6 ⇒ A(EDC) = 4, A(EAB) = 36.",
          "Toplam alan (12 + 4)/2 · 8 = 64 ⇒ yan üçgenler: (64 − 40)/2 = 12.",
        ],
        answer: "12",
      },
    ],
    osymThinking:
      "Dörtgen soruları çoğunlukla bir köşegen veya bir orta nokta çizilerek üçgen alan oranlarına dönüştürülür. ÖSYM tarzı sorularda özel dörtgenin hangi özelliğinin kullanılacağı açıkça söylenmez; öğrencinin şeklin kimliğinden bunu çıkarması beklenir.",
    commonMistakes: [
      "Köşegen sayısını n(n − 1)/2 ile karıştırmak.",
      "Her paralelkenarın köşegenlerinin dik olduğunu sanmak.",
      "Yamukta yan üçgenlerin eşit alanlı olduğunu kullanmamak.",
    ],
    tips: [
      "Düzgün çokgen sorusunda önce dış açıyı bul: 360°/n.",
      "Paralelkenarda bir kenarın orta noktası verilirse köşegenle oluşan kesişim 1:2 oranı üretir.",
    ],
    summary: [
      "İç açılar (n − 2)·180°, dış açılar 360°.",
      "Köşegenleri dik dörtgenin alanı e·f/2.",
      "Yamukta köşegenler tabanlar oranında benzer üçgenler oluşturur.",
    ],
  },
  {
    topicId: 'aytgeo-ucgende-trigonometri',
    intro:
      "Dik olmayan bir üçgende kenar ve açıları ilişkilendirmek için sinüs ve kosinüs teoremlerini kullanırız. Bu teoremler, Pisagor’un her üçgene genellenmiş hâlidir.\n\nİki kenar ve aradaki açı biliniyorsa kosinüs; bir kenar ve karşısındaki açı çifti biliniyorsa sinüs teoremi uygundur. Alan için de 'iki kenar çarpı aradaki açının sinüsü bölü iki' kalıbı çok işe yarar.",
    prerequisites: [
      "Özel açıların (30°, 45°, 60°, 120°, 150°) trigonometrik değerleri",
      "Birim çember ve sin(180° − x) = sin x bağıntısı",
      "Pisagor teoremi",
    ],
    concepts: [
      { term: "Sinüs teoremi", definition: "Bir üçgende her kenarın karşı açısının sinüsüne oranı sabittir ve 2R’ye eşittir." },
      { term: "Kosinüs teoremi", definition: "Bir kenarın karesi, diğer iki kenarın kareleri toplamından bu kenarlar ile aradaki açının kosinüsünün iki katı çarpımının çıkarılmasıyla bulunur." },
      { term: "Çevrel çember yarıçapı (R)", definition: "Üçgenin üç köşesinden geçen çemberin yarıçapı." },
      { term: "Geniş açılı üçgen", definition: "En uzun kenarın karesi diğer iki kenarın kareleri toplamından büyükse en büyük açı geniştir." },
    ],
    formulas: [
      { expr: "a / sin A = b / sin B = c / sin C = 2R", meaning: "Sinüs teoremi." },
      { expr: "a² = b² + c² − 2bc·cos A", meaning: "Kosinüs teoremi." },
      { expr: "cos A = (b² + c² − a²) / (2bc)", meaning: "Üç kenardan açı bulma." },
      { expr: "A(ABC) = ½·b·c·sin A", meaning: "Trigonometrik alan bağıntısı." },
      { expr: "A(dörtgen) = ½·e·f·sin α", meaning: "e, f köşegenler; α aralarındaki açı." },
    ],
    logic:
      "Kosinüs teoreminde A = 90° alırsan cos A = 0 olur ve Pisagor’a dönersin; yani teorem, açının 90°’dan sapmasının kenara etkisini −2bc·cos A terimiyle düzeltir. Açı genişse cos A negatif olur ve karşı kenar uzar. Alan formülünde b·sin A, c kenarına göre değil b kenarının c’ye dik bileşeni, yani yüksekliktir.",
    examples: [
      {
        level: 'kolay',
        problem: "ABC üçgeninde b = 5, c = 8, m(A) = 60° ise a kaçtır?",
        steps: [
          "a² = 25 + 64 − 2·5·8·½ = 89 − 40 = 49.",
          "a = 7.",
        ],
        answer: "7",
      },
      {
        level: 'orta',
        problem: "Kenarları 5, 7 ve 9 olan üçgenin en büyük açısının kosinüsü kaçtır?",
        steps: [
          "En büyük açı en uzun kenar (9) karşısındadır.",
          "cos θ = (25 + 49 − 81)/(2·5·7) = −7/70 = −1/10.",
          "Kosinüs negatif ⇒ üçgen geniş açılıdır.",
        ],
        answer: "−1/10",
      },
    ],
    osymThinking:
      "Sorularda üçgen çoğunlukla gerçek hayat bağlamına (iki geminin rotası, arazi sınırı) gizlenir; aradaki açı 120° gibi geniş bir açı olduğunda cos değerinin işaretine dikkat edip etmediğin ölçülür. Sinüs teoremi sorularında 2R bağlantısı sıkça ikinci adım olarak istenir.",
    commonMistakes: [
      "cos 120° = −½ yerine +½ almak.",
      "Sinüs teoreminde sonucu R değil 2R olarak bırakmak.",
      "Alan formülünde aradaki olmayan bir açıyı kullanmak.",
    ],
    tips: [
      "sin 150° = sin 30° = ½; geniş açının sinüsü pozitiftir.",
      "Üç kenar verilince önce en büyük açının kosinüsüne bakarak üçgenin türünü belirle.",
    ],
    summary: [
      "a/sin A = 2R.",
      "a² = b² + c² − 2bc·cos A.",
      "Alan = ½·b·c·sin A; dörtgende ½·e·f·sin α.",
    ],
  },
  {
    topicId: 'aytgeo-cember-daire',
    intro:
      "Çember ve daire konusu, çember üzerindeki açılar, kiriş ve teğet özellikleri, kirişler/teğetler dörtgeni ile daire alanı-yay uzunluğu hesaplarından oluşur. Soruların büyük kısmı 'hangi açı hangi yayı görüyor' sorusuna doğru cevap vermekle çözülür.\n\nTeğet her zaman değme noktasındaki yarıçapa diktir; bu tek bilgi pek çok soruda dik üçgen kurmanı sağlar.",
    prerequisites: [
      "Üçgende açı ve Pisagor",
      "Benzerlik",
      "π ile işlem",
    ],
    concepts: [
      { term: "Merkez açı", definition: "Köşesi merkezde olan açı; gördüğü yayın ölçüsüne eşittir." },
      { term: "Çevre açı", definition: "Köşesi çember üzerinde olan açı; gördüğü yayın yarısıdır." },
      { term: "Noktanın kuvveti", definition: "Bir noktadan çembere çizilen kesenlerde |PA|·|PB| çarpımı sabittir; teğet için |PT|²." },
      { term: "Kirişler dörtgeni", definition: "Köşeleri aynı çember üzerinde olan dörtgen; karşılıklı açıları bütünlerdir." },
      { term: "Teğetler dörtgeni", definition: "Kenarları aynı çembere teğet olan dörtgen; karşılıklı kenar toplamları eşittir." },
    ],
    formulas: [
      { expr: "Çevre açı = yay / 2", meaning: "Aynı yayı gören çevre açılar eşittir." },
      { expr: "Dış açı = (büyük yay − küçük yay) / 2", meaning: "Çemberin dışındaki noktadan çizilen iki kesen veya teğet için." },
      { expr: "|PA|·|PB| = |PC|·|PD| = |PT|²", meaning: "Noktanın çembere göre kuvveti." },
      { expr: "Yay uzunluğu = 2πr·α/360°", meaning: "α merkez açılı yay." },
      { expr: "Dilim alanı = πr²·α/360°", meaning: "α merkez açılı daire dilimi." },
    ],
    logic:
      "Çevre açının yayın yarısı olması, merkezden geçen yardımcı yarıçaplarla oluşan ikizkenar üçgenlerden gelir: dış açı iki taban açısının toplamıdır. Kuvvet bağıntısı ise benzer üçgenlerden çıkar: PAC ve PDB üçgenleri aynı yayları gören açılar sayesinde benzerdir.",
    examples: [
      {
        level: 'kolay',
        problem: "Çemberin dışındaki P noktasından çizilen kesen çemberi A ve B’de kesiyor; |PA| = 4, |AB| = 5. P’den çizilen teğet parçası kaçtır?",
        steps: [
          "|PB| = 4 + 5 = 9.",
          "|PT|² = |PA|·|PB| = 36 ⇒ |PT| = 6.",
        ],
        answer: "6",
      },
      {
        level: 'orta',
        problem: "Yarıçapı 6 olan dairede merkez açısı 120° olan dilimin çevresi kaçtır?",
        steps: [
          "Yay = 2π·6·120/360 = 4π.",
          "Çevre = iki yarıçap + yay = 12 + 4π.",
        ],
        answer: "12 + 4π",
      },
    ],
    osymThinking:
      "Çember sorularında önemli bilgi çoğu zaman bir 'teğet' kelimesinde saklıdır: teğet görülünce yarıçap çizilip dik açı işaretlenmelidir. Dilim çevresi sorularında yarıçapları eklemeyi unutma tuzağı, kuvvet sorularında ise |AB| ile |PB|’yi karıştırma tuzağı kurulur.",
    commonMistakes: [
      "Kuvvette |PA|·|AB| çarpmak (doğrusu |PA|·|PB|).",
      "Dilim çevresinde iki yarıçapı eklememek.",
      "Çevre açıyı yayın kendisine eşit almak.",
    ],
    tips: [
      "Çap gören çevre açı 90°’dir.",
      "Eş merkezli çemberlerde küçük çembere teğet olan büyük kirişin yarısı ile halka alanı π·(yarı kiriş)² olur.",
    ],
    summary: [
      "Merkez açı = yay, çevre açı = yay/2.",
      "Teğet ⟂ yarıçap; dış noktadan teğet parçaları eşit.",
      "|PA|·|PB| = |PT|².",
      "Kirişler dörtgeninde karşı açılar toplamı 180°, teğetler dörtgeninde karşı kenar toplamları eşit.",
    ],
  },
  {
    topicId: 'aytgeo-dogrunun-analitigi',
    intro:
      "Doğrunun analitiği, geometriyi cebirle konuşturduğumuz konudur: bir doğru artık bir çizgi değil, ax + by + c = 0 biçiminde bir denklemdir. Bu sayede uzaklıkları, açıları, paralellik ve dikliği hesapla kontrol edebiliriz.\n\nKonunun kalbi eğimdir. Eğim, doğrunun x ekseniyle yaptığı açının tanjantıdır ve 'x bir birim artınca y ne kadar değişir' sorusunun cevabıdır. Paralel doğruların eğimleri eşit, dik doğruların eğimleri çarpımı −1’dir.\n\nİkinci büyük araç uzaklık formülleridir: iki nokta arası uzaklık, noktanın doğruya uzaklığı ve paralel iki doğru arası uzaklık. Bunlara bir doğru parçasını belli oranda bölen noktanın koordinatları eklenince AYT’de sorulan hemen her soruyu çözebilecek hâle gelirsin.\n\nAYT’de bu konu hem tek başına hem de çember analitiği ve dönüşümlerle birlikte sorulur; burada sağlam olmak sonraki konuları da kolaylaştırır.",
    prerequisites: [
      "Koordinat düzlemi ve nokta gösterimi",
      "Birinci dereceden denklemler ve denklem sistemleri",
      "Pisagor teoremi",
      "Temel trigonometri (tan 45°, tan 135° vb.)",
    ],
    concepts: [
      { term: "Eğim (m)", definition: "Doğrunun x ekseninin pozitif yönüyle yaptığı açının (eğim açısı α) tanjantı: m = tan α." },
      { term: "Eğim açısı", definition: "Doğrunun x ekseninin pozitif yönüyle pozitif (saat yönünün tersi) yönde yaptığı açı; 0° ≤ α < 180°." },
      { term: "Eksen kesişimleri", definition: "Doğrunun x eksenini kestiği nokta (y = 0) ve y eksenini kestiği nokta (x = 0)." },
      { term: "Paralel doğrular", definition: "Eğimleri eşit, y-kesişimleri farklı doğrular; ortak noktaları yoktur." },
      { term: "Dik doğrular", definition: "Eğimleri çarpımı −1 olan (ya da biri yatay, diğeri düşey olan) doğrular." },
      { term: "Bölen nokta", definition: "Bir doğru parçasını verilen oranda içten ya da dıştan bölen, doğru üzerindeki nokta." },
      { term: "Orta dikme", definition: "Doğru parçasının orta noktasından geçen ve ona dik olan doğru; üzerindeki her nokta uç noktalara eşit uzaklıktadır." },
    ],
    formulas: [
      { expr: "|AB| = √((x₂ − x₁)² + (y₂ − y₁)²)", meaning: "İki nokta arasındaki uzaklık." },
      { expr: "m = (y₂ − y₁) / (x₂ − x₁) = tan α", meaning: "İki noktadan geçen doğrunun eğimi." },
      { expr: "y − y₁ = m(x − x₁)", meaning: "Eğimi m olan ve (x₁, y₁)’den geçen doğru." },
      { expr: "x/a + y/b = 1", meaning: "x eksenini (a, 0), y eksenini (0, b) noktasında kesen doğru." },
      { expr: "ax + by + c = 0 ⇒ m = −a/b", meaning: "Genel denklemden eğim." },
      { expr: "d₁ ∥ d₂ ⇔ m₁ = m₂;  d₁ ⟂ d₂ ⇔ m₁·m₂ = −1", meaning: "Paralellik ve diklik koşulları." },
      { expr: "a₁/a₂ = b₁/b₂ ≠ c₁/c₂ (paralel),  a₁/a₂ = b₁/b₂ = c₁/c₂ (çakışık)", meaning: "Genel denklemle paralellik–çakışıklık ayrımı." },
      { expr: "d = |a·x₀ + b·y₀ + c| / √(a² + b²)", meaning: "P(x₀, y₀) noktasının ax + by + c = 0 doğrusuna uzaklığı." },
      { expr: "d = |c₁ − c₂| / √(a² + b²)", meaning: "ax + by + c₁ = 0 ve ax + by + c₂ = 0 paralel doğruları arası uzaklık (a, b katsayıları aynı yapılmalı)." },
      { expr: "C = ((n·x₁ + m·x₂)/(m + n), (n·y₁ + m·y₂)/(m + n))", meaning: "|AC| : |CB| = m : n oranında içten bölen nokta." },
      { expr: "G = ((x₁ + x₂ + x₃)/3, (y₁ + y₂ + y₃)/3)", meaning: "Üçgenin ağırlık merkezi." },
    ],
    logic:
      "Eğim neden iki noktanın farklarının oranı? Doğru üzerinde iki nokta seçip dik üçgen kurarsan düşey kenar Δy, yatay kenar Δx olur; eğim açısının tanjantı karşı bölü komşu, yani Δy/Δx’tir. Doğru olduğu için hangi iki noktayı seçersen seç bu oran değişmez (benzer üçgenler).\n\nDik doğruların eğim çarpımının −1 olması da buradan gelir: bir doğruyu 90° döndürdüğünde (Δx, Δy) yön vektörü (−Δy, Δx) olur, yeni eğim −Δx/Δy = −1/m’dir.\n\nNoktanın doğruya uzaklığı formülünde pay |ax₀ + by₀ + c|, noktayı denkleme yazınca çıkan 'sapma'dır; doğru üzerindeki noktalarda bu sıfırdır. √(a² + b²) ile bölmek, (a, b) normal vektörünü birim uzunluğa getirir. Paralel doğrular arası uzaklıkta c’leri çıkarabilmek için x ve y katsayılarının aynı olması şarttır; aksi hâlde normal vektörler farklı ölçekte kalır.\n\nBölen nokta formülü aslında ağırlıklı ortalamadır: C, B’ye yakınsa B’nin ağırlığı büyük olur. Oran m : n ise A’nın katsayısı n, B’nin katsayısı m’dir (çapraz!).",
    examples: [
      {
        level: 'kolay',
        problem: "A(1, 2) ve B(4, 8) noktalarından geçen doğrunun denklemini bulunuz.",
        steps: [
          "Eğim: m = (8 − 2)/(4 − 1) = 6/3 = 2.",
          "Nokta-eğim biçimi: y − 2 = 2(x − 1).",
          "Düzenlersek y = 2x (doğru orijinden geçer).",
        ],
        answer: "y = 2x",
      },
      {
        level: 'orta',
        problem: "P(3, −1) noktasının 3x + 4y − 10 = 0 doğrusuna uzaklığını ve bu doğru ile 6x + 8y + 5 = 0 doğrusu arasındaki uzaklığı bulunuz.",
        steps: [
          "d(P) = |3·3 + 4·(−1) − 10| / √(9 + 16) = |−5| / 5 = 1.",
          "İkinci doğruyu 2’ye bölelim: 3x + 4y + 5/2 = 0. Katsayılar artık aynı.",
          "Paralel doğrular arası uzaklık = |−10 − 5/2| / 5 = (25/2)/5 = 5/2.",
        ],
        answer: "1 ve 5/2",
      },
      {
        level: 'zor',
        problem: "A(1, 2), B(7, 5) ve C ∈ [AB] olmak üzere |AC| : |CB| = 2 : 1’dir. C’den geçen ve AB’ye dik olan doğrunun eksenlerle oluşturduğu üçgenin alanı kaç br²’dir?",
        steps: [
          "C = A + (2/3)(B − A) = (1 + 4, 2 + 2) = (5, 4).",
          "AB’nin eğimi (5 − 2)/(7 − 1) = 1/2 ⇒ dik doğrunun eğimi −2.",
          "Doğru: y − 4 = −2(x − 5) ⇒ y = −2x + 14.",
          "Eksen kesişimleri: x = 7 ve y = 14.",
          "Alan = 7 · 14 / 2 = 49.",
        ],
        answer: "49",
      },
    ],
    osymThinking:
      "AYT’de doğru soruları nadiren 'eğimi bulun' diye sorulur. Genellikle bir şekil (üçgen, dörtgen, harita, yol) koordinat düzlemine yerleştirilir ve öğrencinin hangi formülün gerektiğini seçmesi beklenir: en kısa yol → noktanın doğruya uzaklığı, eşit uzaklık → orta dikme, oran → bölen nokta. Paralellik sorularında çakışık durumun elenmesi, uzaklık sorularında katsayıların eşitlenmesi en sık kurulan tuzaklardır.",
    commonMistakes: [
      "Paralel doğrular arası uzaklıkta katsayıları eşitlemeden c’leri çıkarmak.",
      "Genel denklemden eğimi −b/a veya a/b olarak okumak (doğrusu −a/b).",
      "Paralellik koşulunda çakışık durumu (c’lerin de orantılı olması) elememek.",
      "Bölen noktada ağırlıkları ters yazmak: |AC| : |CB| = m : n ise A’nın katsayısı n’dir.",
      "Noktanın doğruya uzaklığında mutlak değeri ya da işareti yanlış işlemek.",
    ],
    tips: [
      "Eşit uzaklık gördüğünde orta dikmeyi düşün; bazen doğrudan |PA|² = |PB|² yazmak daha hızlıdır.",
      "Eksenlerle alan sorularında x/a + y/b = 1 biçimine geç; alan |a·b|/2.",
      "Dıştan bölmede noktanın hangi uçtan öteye düştüğünü önce çiz, sonra vektörle ilerle.",
      "Dik doğrunun denklemini yazarken ax + by + c = 0’ın dikmesi bx − ay + k = 0 biçimindedir.",
    ],
    summary: [
      "Eğim m = Δy/Δx = tan α; genel denklemde m = −a/b.",
      "Paralel: m₁ = m₂ (c’ler orantısız); dik: m₁·m₂ = −1.",
      "Noktanın doğruya uzaklığı |ax₀ + by₀ + c|/√(a² + b²).",
      "Paralel doğrular arası uzaklık |c₁ − c₂|/√(a² + b²) (katsayılar eşitlenmiş olmalı).",
      "Bölen nokta ağırlıklı ortalamadır; ağırlıklar çapraz yazılır.",
      "x/a + y/b = 1 eksen kesişimli biçimdir.",
    ],
  },
  {
    topicId: 'aytgeo-cemberin-analitigi',
    intro:
      "Çemberin analitiği, 'bir noktaya sabit uzaklıktaki noktalar kümesi' tanımını denkleme dökmektir. Merkezi M(a, b), yarıçapı r olan çember üzerindeki her P(x, y) noktası için |PM| = r olduğundan (x − a)² + (y − b)² = r² standart denklemi elde edilir.\n\nBu denklemi açtığında x² + y² + Dx + Ey + F = 0 genel denklemine ulaşırsın. Genel denklemden merkezi ve yarıçapı bulmak için tam kareye tamamlama yaparsın; merkez (−D/2, −E/2) olur.\n\nKonunun ikinci yarısı 'çember ile başka şeylerin ilişkisi'dir: bir nokta çemberin içinde mi, dışında mı; bir doğru çemberi kesiyor mu, teğet mi; dışarıdaki bir noktadan çizilen teğet ne uzunlukta? Bu soruların hepsi merkez ile uzaklık karşılaştırmasına ya da noktanın kuvvetine dayanır.\n\nDoğrunun analitiğindeki uzaklık formüllerini burada sürekli kullanacaksın; iki konu birlikte çalışılmalıdır.",
    prerequisites: [
      "İki nokta arası uzaklık",
      "Noktanın doğruya uzaklığı formülü",
      "Tam kareye tamamlama",
      "İkinci dereceden denklemde diskriminant",
    ],
    concepts: [
      { term: "Standart denklem", definition: "(x − a)² + (y − b)² = r²; merkez M(a, b), yarıçap r." },
      { term: "Genel denklem", definition: "x² + y² + Dx + Ey + F = 0; x² ve y² katsayıları eşit ve xy terimi yoktur." },
      { term: "Noktanın kuvveti", definition: "P(x₀, y₀) için K = x₀² + y₀² + Dx₀ + Ey₀ + F; K < 0 içte, K = 0 üzerinde, K > 0 dışta." },
      { term: "Teğet doğru", definition: "Çemberle tek ortak noktası olan doğru; merkeze uzaklığı yarıçapa eşittir." },
      { term: "Kiriş", definition: "Çemberin iki noktasını birleştiren doğru parçası; merkezden kirişe inen dikme kirişi ortalar." },
      { term: "Teğet parçası", definition: "Dış noktadan değme noktasına kadar olan uzunluk; karesi noktanın kuvvetine eşittir." },
    ],
    formulas: [
      { expr: "(x − a)² + (y − b)² = r²", meaning: "Standart denklem." },
      { expr: "x² + y² + Dx + Ey + F = 0 ⇒ M(−D/2, −E/2),  r² = (D² + E² − 4F)/4", meaning: "Genel denklemden merkez ve yarıçap." },
      { expr: "D² + E² − 4F > 0", meaning: "Genel denklemin gerçek bir çember belirtme koşulu." },
      { expr: "d(M, doğru) < r: iki noktada keser;  = r: teğet;  > r: kesmez", meaning: "Doğru–çember durumu." },
      { expr: "Kiriş uzunluğu = 2√(r² − d²)", meaning: "d: merkezin kirişi taşıyan doğruya uzaklığı." },
      { expr: "|PT|² = x₀² + y₀² + Dx₀ + Ey₀ + F = |PM|² − r²", meaning: "Dış noktadan çizilen teğet parçası (kuvvet)." },
      { expr: "(x₀ − a)(x − a) + (y₀ − b)(y − b) = r²", meaning: "Çember üzerindeki T(x₀, y₀) noktasındaki teğet doğru." },
      { expr: "|MN| = r₁ + r₂ dıştan teğet;  |MN| = |r₁ − r₂| içten teğet", meaning: "İki çemberin durumu (merkezler arası uzaklık ile)." },
    ],
    logic:
      "Standart denklem, iki nokta arası uzaklık formülünün karesidir; bu yüzden 'çember sorusu' aslında 'uzaklık sorusu'dur. Genel denklemde tam kareye tamamlarken x² + Dx = (x + D/2)² − D²/4 yazılır; sağ tarafa geçen sabitler r²’yi oluşturur. Bu toplam pozitif değilse gerçek bir çember yoktur (sıfırsa yalnız bir nokta).\n\nDoğru–çember durumunda, doğruyu çembere yerleştirip diskriminantla da karar verebilirsin; ama merkezin doğruya uzaklığını yarıçapla karşılaştırmak çok daha hızlıdır. Kiriş uzunluğundaki 2√(r² − d²), merkez, kirişin orta noktası ve kirişin ucu arasındaki dik üçgenden gelir.\n\nTeğet parçası için MTP dik üçgeninde |PT|² = |PM|² − r² olur. |PM|²’yi açtığında tam olarak P’yi genel denkleme yazmak çıkar; kuvvet kavramı buradan doğar.",
    examples: [
      {
        level: 'kolay',
        problem: "x² + y² − 6x + 4y − 12 = 0 çemberinin merkezini ve yarıçapını bulunuz.",
        steps: [
          "x² − 6x = (x − 3)² − 9;  y² + 4y = (y + 2)² − 4.",
          "(x − 3)² + (y + 2)² = 12 + 9 + 4 = 25.",
          "Merkez M(3, −2), r = 5.",
        ],
        answer: "M(3, −2), r = 5",
      },
      {
        level: 'orta',
        problem: "3x + 4y + k = 0 doğrusu (x − 1)² + (y − 2)² = 25 çemberine teğet ise k’nin alabileceği değerleri bulunuz.",
        steps: [
          "Teğet ⇔ merkez ile doğru arası uzaklık = r.",
          "|3·1 + 4·2 + k| / 5 = 5 ⇒ |11 + k| = 25.",
          "11 + k = 25 ⇒ k = 14 ya da 11 + k = −25 ⇒ k = −36.",
        ],
        answer: "k = 14 veya k = −36",
      },
      {
        level: 'zor',
        problem: "x² + y² − 4x + 2y − 4 = 0 çemberi veriliyor. P(7, 1) noktasından çembere çizilen teğet parçasının uzunluğunu ve y = x doğrusunun çemberde ayırdığı kirişin uzunluğunu bulunuz.",
        steps: [
          "Kuvvet: 49 + 1 − 28 + 2 − 4 = 20 > 0 ⇒ P dışarıda, |PT| = √20 = 2√5.",
          "Tam kare: (x − 2)² + (y + 1)² = 9 ⇒ M(2, −1), r = 3.",
          "M’nin x − y = 0 doğrusuna uzaklığı |2 − (−1)|/√2 = 3/√2.",
          "Kiriş = 2√(9 − 9/2) = 2√(9/2) = 3√2.",
        ],
        answer: "|PT| = 2√5, kiriş = 3√2",
      },
    ],
    osymThinking:
      "Çember soruları çoğunlukla genel denklemle verilir ki öğrenci önce merkez ve yarıçapı çıkarsın; bu adımı atlamak işaret hatasına yol açar. Teğetlik, 'tek ortak nokta', 'en kısa uzaklık', 'kapsama alanı' gibi ifadelerle gizlenir. Yeni nesil sorularda çember bir baz istasyonu, sulama alanı veya radar menzili olarak karşına çıkabilir; aslında sorulan kiriş uzunluğu ya da merkez–doğru uzaklığıdır.",
    commonMistakes: [
      "Genel denklemde merkezi (D/2, E/2) almak; doğrusu (−D/2, −E/2).",
      "Denklemin sağ tarafındaki r² değerini yarıçap sanmak (r² = 16 iken r = 16 demek).",
      "Teğetlik koşulunda mutlak değerin iki durumunu da yazmamak.",
      "Kiriş uzunluğunda yarı kirişi bulup iki ile çarpmayı unutmak.",
      "Genel denklemin çember olma koşulunu (D² + E² − 4F > 0) kontrol etmemek.",
    ],
    tips: [
      "Noktanın konumu için kuvveti hesapla: işaret, iç/dış bilgisini verir; değer ise teğet uzunluğunun karesidir.",
      "Eksenlere teğet çemberde merkezin koordinatlarının mutlak değeri yarıçaptır: iki eksene teğetse |a| = |b| = r.",
      "Teğet denklemi için yarıçap vektörünü normal vektör olarak kullan: MT = (p, q) ise teğet p(x − x₀) + q(y − y₀) = 0.",
      "Orijinden geçen çemberin genel denkleminde sabit terim F = 0’dır.",
    ],
    summary: [
      "(x − a)² + (y − b)² = r²; genel denklemde M(−D/2, −E/2).",
      "Çember olma koşulu: D² + E² − 4F > 0.",
      "Doğru–çember: merkezin doğruya uzaklığını r ile karşılaştır.",
      "Kiriş = 2√(r² − d²).",
      "Teğet parçası² = noktanın kuvveti = |PM|² − r².",
      "İki çember: merkezler arası uzaklığı r₁ + r₂ ve |r₁ − r₂| ile karşılaştır.",
    ],
  },
  {
    topicId: 'aytgeo-donusumler',
    intro:
      "Dönüşümler, bir şekli analitik düzlemde kaydırmak (öteleme), aynadaki görüntüsünü almak (yansıma) ya da bir nokta etrafında çevirmek (dönme) demektir. Bu dönüşümler şeklin boyutunu ve biçimini değiştirmez; yalnızca konumunu ve yönünü değiştirir.\n\nAYT’de genellikle bir noktanın ya da çember, doğru gibi basit bir şeklin ardışık dönüşümler sonundaki görüntüsü sorulur.",
    prerequisites: [
      "Koordinat düzlemi",
      "Doğrunun eğimi ve diklik koşulu",
      "Orta nokta formülü",
    ],
    concepts: [
      { term: "Öteleme", definition: "Her noktayı aynı (a, b) vektörü kadar kaydıran dönüşüm: (x, y) → (x + a, y + b)." },
      { term: "Yansıma (simetri)", definition: "Noktayı bir doğruya ya da noktaya göre aynadaki konumuna taşıyan dönüşüm; simetri ekseni/merkezi orta noktadadır." },
      { term: "Dönme", definition: "Noktayı bir merkez etrafında belirli bir açı kadar çeviren dönüşüm; pozitif yön saat yönünün tersidir." },
      { term: "İzometri", definition: "Uzaklıkları koruyan dönüşüm; öteleme, yansıma ve dönme izometridir." },
    ],
    formulas: [
      { expr: "x eksenine göre: (x, y) → (x, −y);  y eksenine göre: (x, y) → (−x, y)", meaning: "Eksenlere göre yansıma." },
      { expr: "Orijine göre: (x, y) → (−x, −y)", meaning: "Orijin etrafında 180° dönme ile aynıdır." },
      { expr: "y = x’e göre: (x, y) → (y, x);  y = −x’e göre: (x, y) → (−y, −x)", meaning: "Açıortay doğrularına göre yansıma." },
      { expr: "M(a, b)’ye göre: (x, y) → (2a − x, 2b − y)", meaning: "Noktaya göre yansıma; M orta noktadır." },
      { expr: "Orijin etrafında +90°: (x, y) → (−y, x);  +270°: (x, y) → (y, −x)", meaning: "Pozitif yönde dönme." },
    ],
    logic:
      "Bir noktanın bir doğruya göre yansıması iki şartı sağlar: nokta ile görüntüsünü birleştiren doğru simetri doğrusuna diktir ve orta noktası simetri doğrusunun üzerindedir. Genel doğruya göre yansıma bu iki şarttan kurulan denklem sistemiyle bulunur. Dönmede 90° dönme, (x, y) vektörünü (−y, x) vektörüne çevirir; çünkü iki vektörün iç çarpımı sıfırdır ve uzunlukları eşittir.",
    examples: [
      {
        level: 'kolay',
        problem: "A(−1, 4) noktasının M(2, 1) noktasına göre yansıması nedir?",
        steps: [
          "A′ = (2·2 − (−1), 2·1 − 4).",
          "A′ = (5, −2).",
        ],
        answer: "(5, −2)",
      },
      {
        level: 'orta',
        problem: "A(−1, 3) noktasının 2x − y − 5 = 0 doğrusuna göre yansımasını bulunuz.",
        steps: [
          "Doğrunun normal vektörü (2, −1); A’yı doğruya yazınca 2(−1) − 3 − 5 = −10.",
          "t = −10/(2² + 1²) = −2; ayak noktası H = A − t·(2, −1) = (−1 + 4, 3 − 2) = (3, 1).",
          "A′ = 2H − A = (7, −1).",
          "Kontrol: AA′ orta noktası (3, 1) doğru üzerinde, AA′ ∥ (2, −1).",
        ],
        answer: "(7, −1)",
      },
    ],
    osymThinking:
      "Sorular genellikle iki ya da üç dönüşümü art arda uygular; sıranın önemli olduğu ve her adımda önceki sonucun kullanıldığı ölçülür. Çember veya doğru dönüştürülürken yalnızca merkezin (ya da iki noktanın) dönüştürülmesinin yeterli olduğunu görmen beklenir.",
    commonMistakes: [
      "90° ve 270° dönme formüllerini karıştırmak.",
      "y = −x’e göre yansımada işaretleri yanlış yazmak.",
      "Ardışık dönüşümlerde sırayı değiştirmek.",
    ],
    tips: [
      "Çemberin dönüşümünde yarıçap değişmez; yalnız merkezi dönüştür.",
      "Doğrunun eksene göre yansımasında x ↦ −x veya y ↦ −y yerine koyman yeterli.",
    ],
    summary: [
      "Öteleme: (x + a, y + b).",
      "Yansıma: eksenler, orijin, y = ±x ve noktaya göre kalıplar.",
      "Dönme +90°: (−y, x); 180°: (−x, −y); 270°: (y, −x).",
    ],
  },
  {
    topicId: 'aytgeo-kati-cisimler',
    intro:
      "Katı cisimler konusu prizma, piramit, silindir, koni ve kürenin alan ve hacim hesaplarını kapsar. Uzayda düşünmek zor görünse de soruların çoğu cismin içinde uygun bir dik üçgen bulmaya indirgenir.\n\nPrizma ve silindir 'taban alanı çarpı yükseklik', piramit ve koni bunun üçte biri, küre ise kendine özgü formüllerle hesaplanır.",
    prerequisites: [
      "Düzlem şekillerin alanları",
      "Pisagor teoremi",
      "Benzerlik oranı ve k³ hacim oranı",
    ],
    concepts: [
      { term: "Dik prizma", definition: "Yan yüzleri tabana dik olan ve eş tabanları paralel düzlemlerde bulunan cisim." },
      { term: "Piramit", definition: "Bir çokgen taban ile tabanın dışındaki bir tepe noktasının birleştirilmesiyle oluşan cisim." },
      { term: "Ana doğru (l)", definition: "Dik dairesel konide tepeden taban çemberine çizilen doğru parçası; l² = r² + h²." },
      { term: "Küre", definition: "Uzayda bir noktaya eşit uzaklıktaki noktaların oluşturduğu yüzey ve iç bölgesi." },
    ],
    formulas: [
      { expr: "V(prizma) = A(taban)·h", meaning: "Silindir için de geçerlidir: πr²h." },
      { expr: "V(piramit) = A(taban)·h / 3", meaning: "Koni için: πr²h/3." },
      { expr: "Cisim köşegeni = √(a² + b² + c²)", meaning: "Dikdörtgenler prizmasında." },
      { expr: "Koninin yanal alanı = π·r·l;  açınım açısı = 360°·r / l", meaning: "Koni açınımı." },
      { expr: "A(küre) = 4πr²;  V(küre) = 4πr³/3", meaning: "Kürenin alanı ve hacmi." },
    ],
    logic:
      "Piramidin hacminin prizmanın üçte biri olması, bir küpün merkezde birleşen altı eş piramide bölünmesiyle görülebilir. Koninin açınımında yanal yüzey yarıçapı l olan bir daire dilimidir; dilimin yay uzunluğu taban çevresi 2πr’ye eşit olduğundan açı 360°·r/l çıkar. Benzer cisimlerde uzunluk oranı k ise hacim oranı k³’tür.",
    examples: [
      {
        level: 'kolay',
        problem: "Boyutları 3, 4 ve 12 olan dikdörtgenler prizmasının cisim köşegeni kaçtır?",
        steps: [
          "√(9 + 16 + 144) = √169.",
          "= 13.",
        ],
        answer: "13",
      },
      {
        level: 'orta',
        problem: "Taban kenarı 6, yan yüz yüksekliği 5 olan kare dik piramidin hacmi kaçtır?",
        steps: [
          "Tepeden tabana inen yükseklik, yan yüz yüksekliği ve taban kenarının yarısı (3) dik üçgen oluşturur: h = √(25 − 9) = 4.",
          "V = 36 · 4 / 3 = 48.",
        ],
        answer: "48",
      },
    ],
    osymThinking:
      "Katı cisim sorularında cisim genellikle bir kap, depo veya ambalaj olarak verilir ve taşan su, dolum yüksekliği gibi hacim korunumu fikriyle sorulur. Yan yüz yüksekliği ile cisim yüksekliğini karıştırma tuzağı ve k³ hacim oranı en çok ölçülen noktalardır.",
    commonMistakes: [
      "Piramit hacminde yan yüz yüksekliğini cisim yüksekliği yerine kullanmak.",
      "Koninin toplam alanında taban alanını eklememek.",
      "Benzer cisimlerde hacim oranını k² almak.",
    ],
    tips: [
      "Suya batan cismin hacmi, suyun yükselme hacmine eşittir.",
      "Küpün köşeleri kürenin üzerindeyse kürenin çapı küpün cisim köşegenidir (a√3).",
    ],
    summary: [
      "Prizma/silindir: taban · yükseklik; piramit/koni: üçte biri.",
      "Koni: l² = r² + h², yanal alan πrl.",
      "Küre: 4πr² ve 4πr³/3.",
    ],
  },
];
