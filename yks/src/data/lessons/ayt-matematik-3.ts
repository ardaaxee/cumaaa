import type { LessonSeed } from '../../domain/types';

export const lessons: LessonSeed[] = [
  // ------------------------------------------------------------------
  // TÜREV
  // ------------------------------------------------------------------
  {
    topicId: "aytmat-turev",
    intro:
      "Türev, bir niceliğin başka bir niceliğe göre “anlık” ne hızla değiştiğini ölçen araçtır. Bir aracın ortalama hızını bulmak kolaydır: alınan yolu geçen süreye bölersin. Peki tam 3. saniyedeki hız nedir? İşte bu sorunun cevabı türevdir: ortalama değişim hızının, zaman aralığı sıfıra yaklaşırken ulaştığı limit.\n\nGeometrik olarak türev, fonksiyon grafiğinin bir noktadaki teğet doğrusunun eğimidir. Eğri üzerinde iki nokta alıp kiriş çizdiğini düşün; ikinci noktayı birinciye doğru kaydırdıkça kiriş, teğete dönüşür. Kirişin eğimi (f(x+h) − f(x))/h iken teğetin eğimi bu ifadenin h → 0 limitidir.\n\nAYT’de türev konusu iki katmanda sorulur: birincisi kuralları hatasız uygulamak (çarpım, bölüm, zincir kuralı; trigonometrik, üstel ve logaritmik fonksiyonların türevleri), ikincisi türevin anlamını kullanmak (türev tanımı içeren limitler, parçalı fonksiyonlarda türevlenebilirlik, teğet eğimi). Bu anlatımda önce kuralları mantığıyla kuracak, sonra ÖSYM’nin sevdiği tuzakları tek tek ele alacağız.",
    prerequisites: [
      "Limit ve süreklilik: soldan-sağdan limit, bir noktada süreklilik şartı",
      "Fonksiyonlarda bileşke işlemi f(g(x)) ve ters fonksiyon",
      "Üstel ve logaritmik fonksiyonlar: eˣ, ln x, logₐx özellikleri",
      "Trigonometrik fonksiyonlar, özel açıların değerleri ve sin2x = 2sinx·cosx gibi temel özdeşlikler",
      "Doğru denklemi: eğim ve bir noktası bilinen doğru y − y₁ = m(x − x₁)",
    ],
    concepts: [
      {
        term: "Türev (tanım)",
        definition:
          "f′(a) = lim(h→0) [f(a+h) − f(a)]/h limiti varsa ve bir gerçek sayıysa f, x = a’da türevlenebilirdir ve bu limit f′(a)’dır.",
      },
      {
        term: "Sağdan ve soldan türev",
        definition:
          "h → 0⁺ ve h → 0⁻ için alınan tek yönlü limitlerdir. Bir noktada türev olması için ikisinin de var olup eşit olması gerekir.",
      },
      {
        term: "Türevlenebilirlik–süreklilik ilişkisi",
        definition:
          "Bir noktada türevlenebilen fonksiyon orada süreklidir. Tersi doğru değildir: |x| fonksiyonu x = 0’da süreklidir ama türevlenemez (köşe noktası).",
      },
      {
        term: "Teğet eğimi",
        definition:
          "y = f(x) eğrisine (a, f(a)) noktasında çizilen teğetin eğimi f′(a)’dır; teğet denklemi y − f(a) = f′(a)(x − a) olur.",
      },
      {
        term: "Zincir kuralı",
        definition:
          "İç içe (bileşke) fonksiyonun türevi: dıştakinin türevi içteki yerinde bırakılarak alınır ve içtekinin türeviyle çarpılır: (f∘g)′(x) = f′(g(x))·g′(x).",
      },
      {
        term: "Yüksek mertebeden türev",
        definition:
          "Türevin türevine ikinci türev f″(x) denir; işlem sürdürülerek f‴(x), f⁽⁴⁾(x) … elde edilir.",
      },
      {
        term: "Ters fonksiyonun türevi",
        definition:
          "f birebir, türevlenebilir ve f(a) = b, f′(a) ≠ 0 ise (f⁻¹)′(b) = 1/f′(a) olur.",
      },
    ],
    formulas: [
      { expr: "f′(a) = lim(h→0) [f(a+h) − f(a)]/h", meaning: "Türevin tanımı; türev içeren limit sorularının anahtarıdır." },
      { expr: "lim(h→0) [f(a+mh) − f(a+nh)]/h = (m − n)·f′(a)", meaning: "Tanım kalıbının genelleştirilmiş hâli; payda h olduğunda katsayılar farkı çarpan olarak çıkar." },
      { expr: "(xⁿ)′ = n·xⁿ⁻¹ ;  (c)′ = 0", meaning: "Kuvvet kuralı; sabitin türevi sıfırdır." },
      { expr: "(f·g)′ = f′·g + f·g′", meaning: "Çarpım kuralı." },
      { expr: "(f/g)′ = (f′·g − f·g′)/g²", meaning: "Bölüm kuralı (g ≠ 0)." },
      { expr: "[f(g(x))]′ = f′(g(x))·g′(x)", meaning: "Zincir kuralı; [u(x)]ⁿ için n·uⁿ⁻¹·u′." },
      { expr: "(sin u)′ = u′·cos u ;  (cos u)′ = −u′·sin u ;  (tan u)′ = u′·(1 + tan²u)", meaning: "Trigonometrik türevler (zincir kuralıyla)." },
      { expr: "(eᵘ)′ = u′·eᵘ ;  (aᵘ)′ = u′·aᵘ·ln a", meaning: "Üstel fonksiyonların türevi." },
      { expr: "(ln u)′ = u′/u ;  (logₐu)′ = u′/(u·ln a)", meaning: "Logaritmik fonksiyonların türevi (u > 0)." },
      { expr: "(f⁻¹)′(f(a)) = 1/f′(a)", meaning: "Ters fonksiyonun türevi." },
    ],
    logic:
      "Neden (xⁿ)′ = n·xⁿ⁻¹? Örneğin f(x) = x² için [(x+h)² − x²]/h = (2xh + h²)/h = 2x + h olur; h → 0 iken 2x kalır. Genel n için (x+h)ⁿ açılımında h’nin birinci kuvvetli terimi n·xⁿ⁻¹·h’dir; h’ye bölüp limit alınca yalnız bu terim hayatta kalır, h² ve üstü terimler sıfıra gider.\n\nZincir kuralı neden çarpımdır? Türev bir “oran”dır. y, u’ya bağlı; u da x’e bağlıysa x bir miktar değişince u, u′ katı kadar; u değişince de y, dy/du katı kadar değişir. Oranlar ardışık olarak çarpılır: dy/dx = (dy/du)·(du/dx). Bu yüzden sin(3x)’in türevinde dış fonksiyonun türevi cos(3x), iç fonksiyonun türevi 3 çarpan olarak gelir. Zinciri unutmak, AYT’de en çok puan kaybettiren hatadır.\n\nParçalı fonksiyonda türevlenebilirlik için iki şart vardır: önce süreklilik (parçalar birleşme noktasında aynı değeri vermeli), sonra sol ve sağ türevlerin eşitliği (grafikte köşe olmamalı). Süreklilik sağlanmadan sol-sağ türev eşitliğine bakmak anlamsızdır; çünkü türev yoksa bile formüller eşit çıkabilir. |f(x)| tipindeki fonksiyonlarda ise f’nin işaret değiştirdiği tek katlı köklerde genellikle köşe oluşur ve türev yoktur.",
    examples: [
      {
        level: "kolay",
        problem: "f(x) = (2x − 1)⁴ + 3x² − 5 olduğuna göre f′(1) kaçtır?",
        steps: [
          "(2x − 1)⁴ için zincir kuralı: 4·(2x − 1)³·(2x − 1)′ = 4·(2x − 1)³·2 = 8(2x − 1)³.",
          "3x² terimi 6x olur, −5 sabitinin türevi 0’dır.",
          "f′(x) = 8(2x − 1)³ + 6x.",
          "x = 1 için: 8·1³ + 6 = 14.",
        ],
        answer: "f′(1) = 14",
      },
      {
        level: "orta",
        problem: "f(x) = eˢⁱⁿˣ · cos x olduğuna göre f′(0) kaçtır?",
        steps: [
          "Çarpım kuralı: f′(x) = (eˢⁱⁿˣ)′·cos x + eˢⁱⁿˣ·(cos x)′.",
          "(eˢⁱⁿˣ)′ = cos x · eˢⁱⁿˣ (üstteki fonksiyonun türeviyle çarpılır).",
          "f′(x) = cos²x·eˢⁱⁿˣ − sin x·eˢⁱⁿˣ.",
          "x = 0: cos0 = 1, sin0 = 0, e⁰ = 1 → f′(0) = 1·1 − 0 = 1.",
        ],
        answer: "f′(0) = 1",
      },
      {
        level: "zor",
        problem:
          "f(x) = { ax² + bx + 1, x < 1 ; 5x − 2, x ≥ 1 } fonksiyonu her x gerçek sayısında türevlenebilir olduğuna göre a·b kaçtır?",
        steps: [
          "Süreklilik: x = 1’de iki parça eşit olmalı → a + b + 1 = 5·1 − 2 = 3 → a + b = 2.",
          "Sol türev: (ax² + bx + 1)′ = 2ax + b → x = 1’de 2a + b. Sağ türev: (5x − 2)′ = 5.",
          "Türevlenebilirlik: 2a + b = 5.",
          "İki denklemi taraf tarafa çıkar: (2a + b) − (a + b) = 5 − 2 → a = 3, b = −1.",
          "a·b = 3·(−1) = −3.",
        ],
        answer: "a·b = −3",
      },
    ],
    osymThinking:
      "ÖSYM türevi nadiren “şu fonksiyonun türevini al” diye sorar. Türev genellikle bir limitin içine gizlenir (lim(h→0)[f(2+3h) − f(2−h)]/h gibi), bir bileşke içinde verilir (f(2x−1) = x³ + x ise f′(3) nedir?) ya da tablo hâlinde f, g, f′, g′ değerleri verilerek zincir kuralı ölçülür. Parçalı fonksiyonlarda iki bilinmeyen verilip “türevlenebilirse” denir; bu da süreklilik + türev eşitliği olmak üzere iki denklem demektir. Soruyu okurken “hangi değer nerede hesaplanacak” sorusunu sor: f′(g(2)) ile f′(2) çok farklıdır.",
    commonMistakes: [
      "Zincir kuralını unutmak: (x² + 1)³’ün türevini 3(x² + 1)² yazıp 2x ile çarpmamak.",
      "f(2x − 1) = x³ + x verildiğinde türev alırken sol taraftaki iç türevi (2) unutmak ve f′(3)’ü doğrudan 3x² + 1 sanmak.",
      "Parçalı fonksiyonda süreklilik kontrolü yapmadan yalnız sol-sağ türevleri eşitlemek.",
      "Tablolu bileşke sorularında f′(g(a)) yerine f′(a) değerini okumak.",
      "(ln u)′ = 1/u yazıp u′ çarpanını, logₐu türevinde ln a paydasını unutmak.",
      "(f⁻¹)′(b) hesaplarken f′(b) almak; oysa önce f(a) = b olan a bulunur ve 1/f′(a) hesaplanır.",
    ],
    tips: [
      "Türev içeren limitlerde payda h ise, pay içindeki katsayıların farkı çarpan olur: [f(a+mh) − f(a+nh)]/h → (m − n)f′(a).",
      "Bileşke tablo sorularında önce içteki değeri hesapla (g(2) = ?), sonra dıştaki türevi o noktada oku.",
      "Parçalı fonksiyon + “türevlenebilir” ifadesi = iki denklem: süreklilik ve türev eşitliği.",
      "|f(x)| sorularında f’nin tek katlı köklerine dikkat: grafik orada kırılır, türev yoktur.",
      "sin²(u) gibi ifadelerde türev 2·sin u·cos u·u′ = u′·sin(2u) diye kısaltılabilir; hesap hızlanır.",
    ],
    summary: [
      "Türev, anlık değişim hızı ve teğetin eğimidir: f′(a) = lim(h→0)[f(a+h) − f(a)]/h.",
      "Temel kurallar: kuvvet, çarpım, bölüm; bileşkede her zaman zincir kuralı (iç türevle çarp).",
      "(sin u)′ = u′cos u, (eᵘ)′ = u′eᵘ, (ln u)′ = u′/u, (logₐu)′ = u′/(u·ln a).",
      "Türevlenebilir ⇒ sürekli; tersi her zaman doğru değil (köşe noktaları).",
      "Parçalı fonksiyonda türevlenebilirlik: süreklilik + sol türev = sağ türev.",
      "Teğet denklemi: y − f(a) = f′(a)(x − a); ters fonksiyon türevi (f⁻¹)′(f(a)) = 1/f′(a).",
    ],
  },

  // ------------------------------------------------------------------
  // TÜREV UYGULAMALARI
  // ------------------------------------------------------------------
  {
    topicId: "aytmat-turev-uygulamalari",
    intro:
      "Türevi hesaplamayı öğrendikten sonra asıl güç, türevin bize fonksiyon hakkında ne söylediğini okumaktır. Bir fonksiyonun grafiğini hiç çizmeden nerede yükseldiğini, nerede alçaldığını, en yüksek ve en düşük değerlerini, eğrinin nerede “kıvrım yönünü” değiştirdiğini türev işaretinden anlayabiliriz.\n\nBu konu AYT matematiğin en çok soru getiren bölümlerinden biridir. Artan-azalan aralıklar, yerel ekstremumlar, ikinci türev ile konkavlık ve büküm noktaları, f ile f′ grafikleri arasındaki ilişki, teğet ve normal denklemleri ve gerçek hayat optimizasyon problemleri (en az malzeme, en büyük hacim, en kısa uzaklık) bu başlığın altında toplanır.\n\nÇalışırken şu cümleyi aklında tut: “f′’nin işareti f’nin yönünü, f″’nin işareti f’nin eğilme biçimini söyler.” Soruların neredeyse tamamı bu iki okumanın doğru yapılmasına dayanır. Özellikle yeni nesil sorularda grafiği verilen fonksiyonun f mi yoksa f′ mi olduğunu ayırt etmek, sorunun yarısını çözmek demektir.",
    prerequisites: [
      "Türev alma kuralları ve zincir kuralı",
      "Polinomlarda işaret tablosu, çift/tek katlı kök kavramı",
      "Doğru denklemi, dik doğruların eğimleri çarpımı −1",
      "Kapalı aralıkta sürekli fonksiyonun en büyük ve en küçük değer alması fikri",
    ],
    concepts: [
      {
        term: "Artan / azalan fonksiyon",
        definition:
          "Bir aralıkta f′(x) > 0 ise f o aralıkta artan, f′(x) < 0 ise azalandır. f′ bir aralıkta sıfır olmadıkça tek tek noktalarda sıfır olması artanlığı bozmaz (örn. x³).",
      },
      {
        term: "Kritik nokta",
        definition:
          "Tanım kümesinde f′(x) = 0 olan ya da f′’nin tanımsız olduğu noktalar. Yerel ekstremumlar yalnız bu noktalarda (ve kapalı aralığın uçlarında) aranır.",
      },
      {
        term: "Yerel maksimum / minimum",
        definition:
          "f′ bir noktada işaret değiştirirse ekstremum oluşur: + → − ise yerel maksimum, − → + ise yerel minimum. İşaret değişmiyorsa (çift katlı kök) ekstremum yoktur.",
      },
      {
        term: "Konkavlık (içbükeylik)",
        definition:
          "f″ > 0 olan aralıkta eğri yukarı doğru bükülür (konveks, “gülen yüz”); f″ < 0 ise aşağı doğru bükülür (konkav, “somurtan yüz”).",
      },
      {
        term: "Büküm (dönüm) noktası",
        definition:
          "Eğrinin bükülme yönünün değiştiği noktadır; f″ burada işaret değiştirir. f″(a) = 0 olması tek başına yetmez.",
      },
      {
        term: "Mutlak (global) ekstremum",
        definition:
          "Kapalı [a, b] aralığında sürekli fonksiyonun alabileceği en büyük/en küçük değerdir; kritik noktalardaki ve uç noktalardaki değerler karşılaştırılarak bulunur.",
      },
      {
        term: "Normal doğrusu",
        definition:
          "Eğriye değme noktasında teğete dik olan doğrudur. Teğet eğimi m ise normal eğimi −1/m’dir.",
      },
    ],
    formulas: [
      { expr: "f′(x) > 0 ⇒ f artan ;  f′(x) < 0 ⇒ f azalan", meaning: "Monotonluk testi." },
      { expr: "f′(a) = 0 ve f″(a) < 0 ⇒ yerel maksimum ;  f″(a) > 0 ⇒ yerel minimum", meaning: "İkinci türev testi (f″(a) = 0 ise test sonuç vermez, işaret tablosuna dön)." },
      { expr: "f″ işaret değiştiriyorsa büküm noktası", meaning: "Büküm noktasında f″ = 0 (ya da tanımsız) ve işaret değişimi gerekir." },
      { expr: "Teğet: y − f(a) = f′(a)(x − a)", meaning: "(a, f(a)) noktasındaki teğet doğrusu." },
      { expr: "Normal: y − f(a) = −(1/f′(a))(x − a)", meaning: "Teğete dik doğru (f′(a) ≠ 0)." },
      { expr: "Kübik f(x) = ax³ + bx² + cx + d için büküm apsisi x = −b/(3a)", meaning: "f″ = 6ax + 2b = 0’dan gelir; kübiğin simetri merkezidir." },
      { expr: "Mutlak ekstremum = max/min{ f(a), f(b), f(kritik noktalar) }", meaning: "Kapalı aralıkta aday listesi yöntemi." },
    ],
    logic:
      "Türev, teğetin eğimidir. Eğim pozitifse eğri o noktada “yokuş yukarı” gider, negatifse “yokuş aşağı”. Bu yüzden f′’nin işareti f’nin artıp azalmasını belirler. Bir tepe noktasına çıkarken eğim pozitif, tepeden inerken negatiftir; tam tepede teğet yataydır (f′ = 0). İşte yerel maksimumun “+ → −” işaret değişimi olmasının sebebi budur.\n\nAncak f′ = 0 olan her nokta tepe ya da çukur değildir. f(x) = x³ fonksiyonunda x = 0’da f′ = 0 ama eğim hem solda hem sağda pozitiftir; grafik bir an yataylaşıp yükselmeye devam eder. Bu durum f′’nin çift katlı kökünde görülür. Bu nedenle ekstremum sorularında denklemi çözmek yetmez; işaret tablosu yapılır.\n\nİkinci türev, eğimin nasıl değiştiğini anlatır. f″ > 0 ise eğim artıyordur: eğri gittikçe dikleşerek yukarı kıvrılır. f″ < 0 ise eğim azalır ve eğri aşağı kıvrılır. Büküm noktası eğimin en büyük ya da en küçük olduğu yerdir; yani f′’nin ekstremum noktasıdır. Bu bağlantı f–f′–f″ grafik sorularının temelidir: f′ grafiğinin tepe/çukur noktaları, f’nin büküm noktalarıdır.\n\nOptimizasyon problemlerinde amaç, niceliği tek değişkenli bir fonksiyon olarak yazmaktır. Kısıt (tel uzunluğu, hacim, yüzey) bir değişkeni diğerine bağlar; türevi sıfırlayıp kritik noktayı buluruz ve tanım aralığında gerçekten maksimum/minimum olduğunu kontrol ederiz.",
    examples: [
      {
        level: "kolay",
        problem: "f(x) = x³ − 12x + 3 fonksiyonunun yerel maksimum değeri kaçtır?",
        steps: [
          "f′(x) = 3x² − 12 = 3(x − 2)(x + 2); kritik noktalar x = −2 ve x = 2.",
          "İşaret: x < −2 için f′ > 0, −2 < x < 2 için f′ < 0, x > 2 için f′ > 0.",
          "x = −2’de işaret + → − olduğundan yerel maksimum vardır.",
          "f(−2) = −8 + 24 + 3 = 19.",
        ],
        answer: "Yerel maksimum değeri 19",
      },
      {
        level: "orta",
        problem: "y = x² − 3x eğrisine x = 2 noktasında çizilen normal doğrusunun denklemi nedir?",
        steps: [
          "Değme noktası: f(2) = 4 − 6 = −2 → (2, −2).",
          "Teğet eğimi: f′(x) = 2x − 3 → f′(2) = 1.",
          "Normal eğimi: −1/1 = −1.",
          "Normal: y + 2 = −1·(x − 2) → y = −x.",
        ],
        answer: "y = −x",
      },
      {
        level: "zor",
        problem:
          "Hacmi 8π cm³ olan üstü açık dik silindir biçimli bir kap yapılacaktır. Kullanılan malzemenin (taban + yan yüzey) en az olması için taban yarıçapı kaç cm olmalıdır?",
        steps: [
          "Hacim kısıtı: πr²h = 8π → h = 8/r².",
          "Yüzey alanı (üstü açık): A(r) = πr² + 2πrh = πr² + 2πr·(8/r²) = πr² + 16π/r.",
          "A′(r) = 2πr − 16π/r² = 0 → 2πr³ = 16π → r³ = 8 → r = 2.",
          "A″(r) = 2π + 32π/r³ > 0 olduğundan r = 2’de minimum vardır.",
          "Bu durumda h = 8/4 = 2 = r: üstü açık silindirde en ekonomik kap, yüksekliği yarıçapına eşit olandır.",
        ],
        answer: "r = 2 cm (h = 2 cm)",
      },
    ],
    osymThinking:
      "ÖSYM bu konuda çoğunlukla grafiği verilen fonksiyonun türü üzerinden tuzak kurar: grafik f′’ye aitken öğrenci onu f sanıp tepe noktalarını ekstremum olarak işaretler. Doğrusu: f′ grafiğinin x eksenini kestiği (işaret değiştirdiği) yerler f’nin ekstremumları, f′ grafiğinin tepe/çukur noktaları f’nin büküm noktalarıdır. Ayrıca x eksenine teğet olan (çift katlı) köklerde ekstremum olmadığını, kapalı aralıkta uç noktaların da aday olduğunu ölçer. Optimizasyon problemleri ise günlük bir bağlamla (bahçe, kutu, tank, uzaklık) verilir; önemli olan fonksiyonu doğru kurmaktır.",
    commonMistakes: [
      "f′(a) = 0 olan her noktayı ekstremum saymak; çift katlı köklerde işaret değişmez, ekstremum yoktur.",
      "f′ grafiği verilen soruda grafiğin tepe noktalarını f’nin maksimumu sanmak.",
      "f″(a) = 0 olan her noktayı büküm noktası kabul etmek (örn. x⁴ için x = 0 büküm değildir).",
      "Kapalı aralıkta mutlak maksimumu ararken uç noktalardaki değerleri kontrol etmemek.",
      "Normal doğrusunun eğimini −m yerine 1/m ya da −1/m yerine m almak.",
      "Optimizasyonda ekstremum “noktasını” (x değerini) istenen “değer” (alan, hacim) ile karıştırmak.",
    ],
    tips: [
      "Grafik sorusunda ilk iş: “Bu grafik f mi, f′ mi, f″ mi?” sorusunu yanıtlamak.",
      "Kübik fonksiyonda büküm apsisi −b/(3a)’dır; iki ekstremum apsisinin ortalamasıdır.",
      "Kenarı duvar olan dikdörtgen bahçe probleminde en büyük alan, duvara paralel kenar diğerinin 2 katı olduğunda elde edilir.",
      "Kare kartondan köşe kesip kutu yapma probleminde (kenar a) en büyük hacim x = a/6 kesildiğinde oluşur.",
      "Uzaklık minimizasyonunda karekökle uğraşma: uzaklığın karesini minimize et, aynı noktayı verir.",
    ],
    summary: [
      "f′ > 0 artan, f′ < 0 azalan; ekstremum için f′ işaret değiştirmeli (+→− max, −→+ min).",
      "f″ > 0 yukarı bükük, f″ < 0 aşağı bükük; büküm noktasında f″ işaret değiştirir.",
      "Kapalı aralıkta mutlak ekstremum: kritik noktalar + uç noktalar karşılaştırılır.",
      "Teğet eğimi f′(a), normal eğimi −1/f′(a).",
      "f′ grafiğinin kökleri f’nin ekstremumları, f′’nin tepe/çukurları f’nin büküm noktalarıdır.",
      "Optimizasyon: kısıtla tek değişkene indir, türevi sıfırla, maksimum/minimum olduğunu doğrula.",
    ],
  },

  // ------------------------------------------------------------------
  // İNTEGRAL
  // ------------------------------------------------------------------
  {
    topicId: "aytmat-integral",
    intro:
      "İntegral, türevin ters yönde okunmasıyla başlar. Türevi 2x olan fonksiyon hangisidir? x², ama x² + 5 ya da x² − 7 de olabilir. İşte bu “türevi bilinen fonksiyonu bulma” işlemine belirsiz integral denir ve cevabın sonuna mutlaka bir +c sabiti eklenir.\n\nİntegralin ikinci yüzü toplamadır. Bir aracın her andaki hızını biliyorsak, küçük zaman aralıklarında alınan yolları toplayarak toplam yolu bulabiliriz. Aralıkları küçülttükçe bu toplam (Riemann toplamı) gerçek değere yaklaşır; limitine belirli integral denir ve ∫ₐᵇ f(x)dx ile gösterilir.\n\nBu iki yüzü birleştiren köprü Analizin Temel Teoremi’dir: belirli integrali hesaplamak için sonsuz toplama gerek yoktur; ilkel fonksiyon F bulunur ve F(b) − F(a) hesaplanır. AYT’de integral soruları; kuralları doğru kullanma, değişken değiştirme, belirli integralin özellikleri, mutlak değerli ve parçalı fonksiyonların integrali, Riemann toplamı–integral dönüşümü ve üst sınırı değişken olan integralin türevi etrafında şekillenir.",
    prerequisites: [
      "Türev alma kuralları (integral, türevin tersidir)",
      "Zincir kuralı (değişken değiştirme yönteminin temeli)",
      "Toplam sembolü Σ ve temel toplam formülleri",
      "Mutlak değer ve parçalı fonksiyonlarda işaret incelemesi",
      "eˣ, ln x ve trigonometrik fonksiyonların türevleri",
    ],
    concepts: [
      {
        term: "İlkel fonksiyon (antitürev)",
        definition: "F′(x) = f(x) olan her F fonksiyonuna f’nin bir ilkeli denir. Bir fonksiyonun ilkelleri birbirinden yalnız sabit farkla ayrılır.",
      },
      {
        term: "Belirsiz integral",
        definition: "∫f(x)dx = F(x) + c; f’nin tüm ilkellerinin ailesidir. c integral sabitidir.",
      },
      {
        term: "Riemann toplamı",
        definition:
          "[a, b] aralığı n parçaya bölünür, her parçada bir noktadaki fonksiyon değeri parça genişliğiyle çarpılıp toplanır: Σ f(xₖ)·Δx. Sol uç, sağ uç veya orta nokta seçilebilir.",
      },
      {
        term: "Belirli integral",
        definition: "Riemann toplamlarının n → ∞ (Δx → 0) iken limitidir; sonuç bir sayıdır, +c içermez.",
      },
      {
        term: "Analizin Temel Teoremi",
        definition:
          "f, [a, b]’de sürekli ve F′ = f ise ∫ₐᵇ f(x)dx = F(b) − F(a). Ayrıca G(x) = ∫ₐˣ f(t)dt ise G′(x) = f(x).",
      },
      {
        term: "Değişken değiştirme",
        definition:
          "İntegralde bir ifade u ile, onun türevi du ile değiştirilerek integral basitleştirilir. Belirli integralde sınırlar da u’ya göre yeniden yazılır.",
      },
    ],
    formulas: [
      { expr: "∫xⁿ dx = xⁿ⁺¹/(n+1) + c  (n ≠ −1)", meaning: "Kuvvet kuralı." },
      { expr: "∫(1/x) dx = ln|x| + c", meaning: "n = −1 özel durumu." },
      { expr: "∫eˣ dx = eˣ + c ;  ∫aˣ dx = aˣ/ln a + c", meaning: "Üstel fonksiyonların integrali." },
      { expr: "∫sin x dx = −cos x + c ;  ∫cos x dx = sin x + c", meaning: "Trigonometrik integraller (işaretlere dikkat)." },
      { expr: "∫f(ax + b) dx = F(ax + b)/a + c", meaning: "İç fonksiyon doğrusal ise katsayıya bölünür." },
      { expr: "∫[f(x)]ⁿ·f′(x) dx = [f(x)]ⁿ⁺¹/(n+1) + c", meaning: "Değişken değiştirmenin en sık kalıbı (u = f(x))." },
      { expr: "∫ₐᵇ f(x)dx = F(b) − F(a)", meaning: "Analizin Temel Teoremi." },
      { expr: "∫(a→b) f = −∫(b→a) f ;  ∫(a→a) f = 0 ;  ∫(a→b) f + ∫(b→c) f = ∫(a→c) f", meaning: "Sınır özellikleri: sınırlar yer değiştirince işaret değişir, ardışık aralıklar birleştirilebilir." },
      { expr: "d/dx ∫(a→g(x)) f(t)dt = f(g(x))·g′(x)", meaning: "Üst sınırı değişken olan integralin türevi (zincir kuralıyla)." },
      { expr: "lim(n→∞) Σₖ₌₁ⁿ f(a + k·(b−a)/n)·(b−a)/n = ∫ₐᵇ f(x)dx", meaning: "Riemann toplamı–belirli integral dönüşümü." },
    ],
    logic:
      "İntegral neden türevin tersidir? Bir eğrinin altında, a’dan x’e kadar olan alanı A(x) diye düşün. x’i çok küçük bir h kadar artırırsak alana yaklaşık f(x)·h genişliğinde ince bir şerit eklenir: A(x+h) − A(x) ≈ f(x)·h. Her iki tarafı h’ye bölüp h → 0 limiti alınca A′(x) = f(x) çıkar. Yani alan fonksiyonunun türevi, eğrinin kendisidir. Bu gözlem Analizin Temel Teoremi’nin kalbidir ve belirli integrali F(b) − F(a) ile hesaplayabilmemizi sağlar.\n\nBelirsiz integralde +c neden var? Sabitin türevi sıfır olduğundan türev alırken sabit “kaybolur”; geri giderken hangi sabitin olduğunu bilemeyiz. Bu yüzden ek bir koşul (f(1) = 4 gibi) verildiğinde c belirlenir. Belirli integralde ise F(b) − F(a) farkında c’ler birbirini götürür.\n\nDeğişken değiştirme, zincir kuralının tersidir. [f(g(x))]′ = f′(g(x))·g′(x) olduğundan, integrand içinde bir fonksiyon ve onun türevi çarpım hâlinde görülüyorsa (2x ile x² + 1 gibi) u = g(x) dönüşümü integrali basit bir kuvvet integraline indirir.\n\nRiemann toplamı ise integralin “toplama” anlamını korur: sol uç toplamı artan fonksiyonda gerçek değerin altında, sağ uç toplamı üstünde kalır; parça sayısı arttıkça ikisi de gerçek integrale yaklaşır.",
    examples: [
      {
        level: "kolay",
        problem: "∫(6x² − 4x + 3) dx ifadesini hesaplayınız.",
        steps: [
          "Terim terim integral alınır: ∫6x² dx = 6·x³/3 = 2x³.",
          "∫(−4x) dx = −4·x²/2 = −2x²; ∫3 dx = 3x.",
          "Sonuç: 2x³ − 2x² + 3x + c.",
        ],
        answer: "2x³ − 2x² + 3x + c",
      },
      {
        level: "orta",
        problem: "∫(0→π/2) sin x · cos²x dx integralinin değeri kaçtır?",
        steps: [
          "u = cos x seçelim; du = −sin x dx → sin x dx = −du.",
          "Sınırlar: x = 0 → u = 1; x = π/2 → u = 0.",
          "İntegral: ∫₁⁰ u²·(−du) = ∫₀¹ u² du.",
          "∫₀¹ u² du = [u³/3]₀¹ = 1/3.",
        ],
        answer: "1/3",
      },
      {
        level: "zor",
        problem: "F(x) = ∫(2→x³) (t² − 1)/(t + 1) dt olduğuna göre F′(2) kaçtır?",
        steps: [
          "Üst sınır x³ olduğundan: F′(x) = f(x³)·(x³)′ = [(x⁶ − 1)/(x³ + 1)]·3x².",
          "Sadeleştirme: (x⁶ − 1)/(x³ + 1) = (x³ − 1)(x³ + 1)/(x³ + 1) = x³ − 1.",
          "F′(x) = (x³ − 1)·3x².",
          "x = 2: (8 − 1)·3·4 = 7·12 = 84.",
        ],
        answer: "F′(2) = 84",
      },
    ],
    osymThinking:
      "ÖSYM integrali çoğu zaman doğrudan hesaplatmaz; özellikleri kullandırır. Örneğin ∫₁⁵ f ve ∫₃⁵ f verilip ∫₁³ (2f(x) + 1)dx istenir: burada hem aralık parçalama hem de sabitin integralinin aralık uzunluğu kadar olduğu ölçülür. Üst sınırı değişken olan integralin türevinde zincir kuralı, Riemann toplamı sorularında ise Σ ifadesinden Δx’i ve fonksiyonu tanıyıp integrale çevirme becerisi ölçülür. Mutlak değerli integralde kök noktasından bölmeyen öğrenci çeldiricilere düşer.",
    commonMistakes: [
      "Belirsiz integralde +c sabitini unutmak ya da f(1) = 4 gibi koşulla c’yi belirlememek.",
      "∫sin x dx = cos x yazmak (doğrusu −cos x).",
      "Değişken değiştirmede belirli integralin sınırlarını u’ya göre güncellememek.",
      "∫ₐᵇ k dx = k değil k·(b − a) olduğunu unutmak.",
      "∫f·g dx = ∫f dx · ∫g dx sanmak; çarpımın integrali integraller çarpımı değildir.",
      "Mutlak değerli integrali kök noktasından ayırmadan tek parça hesaplamak.",
      "Üst sınırı x² olan integralin türevinde iç türev (2x) çarpanını unutmak.",
    ],
    tips: [
      "İntegrand içinde “bir ifade ve onun türevi” görüyorsan (2x ve x² + 1, 1/x ve ln x) hemen u dönüşümü yap.",
      "Tek fonksiyonun simetrik aralıktaki integrali sıfırdır: ∫₋ₐᵃ x³ dx = 0.",
      "Riemann limitinde Δx = (b − a)/n’yi ve xₖ = a + k·Δx’i tanı; kalanı f(xₖ)’dır.",
      "Sonucunu kontrol etmek için bulduğun ilkelin türevini al; integrand geri gelmeli.",
    ],
    summary: [
      "Belirsiz integral: türevi f olan fonksiyonlar ailesi, F(x) + c.",
      "Temel kurallar: ∫xⁿ = xⁿ⁺¹/(n+1), ∫1/x = ln|x|, ∫eˣ = eˣ, ∫sin = −cos, ∫cos = sin.",
      "Değişken değiştirme zincir kuralının tersidir; belirli integralde sınırlar da değişir.",
      "Belirli integral = Riemann toplamlarının limiti = F(b) − F(a).",
      "Özellikler: aralık birleştirme, sınır değiştirince işaret değişimi, ∫ₐᵃ f = 0.",
      "d/dx ∫(a→g(x)) f(t)dt = f(g(x))·g′(x).",
    ],
  },

  // ------------------------------------------------------------------
  // İNTEGRAL UYGULAMALARI
  // ------------------------------------------------------------------
  {
    topicId: "aytmat-integral-uygulamalari",
    intro:
      "Belirli integral bir sayıdır; ama bu sayı her zaman “alan” değildir. Grafik x ekseninin altına indiğinde integral negatif katkı verir. Bu yüzden integralin iki okuması vardır: işaretli alan (∫f) ve gerçek geometrik alan (∫|f|). Bu ayrımı kavramak, integral uygulamalarının anahtarıdır.\n\nBu konuda eğri ile x ekseni arasındaki alanı, iki eğri arasındaki alanı, grafikte bölge alanları verildiğinde çeşitli integrallerin değerini ve hız–zaman grafiklerinden yer değiştirme ile toplam yolu hesaplamayı öğreneceğiz. İki eğri arası alanda her zaman “üstteki eksi alttaki” fonksiyonun integrali alınır; eğriler kesişip yer değiştiriyorsa bölgeler ayrı ayrı hesaplanır.\n\nYeni nesil sorularda integral genellikle bir hikâyenin içine gizlenir: bir tanka dolan su miktarı, bir aracın aldığı yol, bir popülasyonun toplam artışı… Hepsinde ortak fikir aynıdır: değişim hızının integrali, toplam değişimi verir.",
    prerequisites: [
      "Belirsiz ve belirli integral kuralları, Analizin Temel Teoremi",
      "Fonksiyon grafikleri: parabol, kübik, kök, üstel fonksiyon çizimi",
      "Denklem çözme (eğrilerin kesişim noktaları)",
      "Mutlak değer ve işaret tablosu",
    ],
    concepts: [
      {
        term: "İşaretli alan",
        definition:
          "∫ₐᵇ f(x)dx değeri; x ekseni üstündeki alanlar pozitif, altındakiler negatif sayılarak toplanır.",
      },
      {
        term: "Geometrik (gerçek) alan",
        definition:
          "Eğri ile x ekseni arasındaki bölgenin alanı her zaman pozitiftir: A = ∫ₐᵇ |f(x)|dx. Kök noktalarından bölünerek hesaplanır.",
      },
      {
        term: "İki eğri arası alan",
        definition:
          "[a, b]’de f(x) ≥ g(x) ise iki eğri arasındaki alan ∫ₐᵇ [f(x) − g(x)]dx’tir. Sınırlar genellikle kesişim noktalarıdır.",
      },
      {
        term: "Yer değiştirme",
        definition:
          "Hız fonksiyonunun belirli integrali: ∫v(t)dt. Geri gitmeler negatif katkı verir; son konum − ilk konum farkıdır.",
      },
      {
        term: "Toplam yol",
        definition: "Hızın mutlak değerinin integrali: ∫|v(t)|dt. Yön ne olursa olsun katedilen mesafe toplanır.",
      },
      {
        term: "Birikim fonksiyonu",
        definition:
          "F(x) = ∫ₐˣ f(t)dt; a’dan x’e kadar biriken işaretli alan. F′ = f olduğundan f’nin işareti F’nin artıp azalmasını belirler.",
      },
    ],
    formulas: [
      { expr: "A = ∫ₐᵇ |f(x)| dx", meaning: "Eğri ile x ekseni arasındaki gerçek alan." },
      { expr: "A = ∫ₐᵇ [üst(x) − alt(x)] dx", meaning: "İki eğri arasındaki alan." },
      { expr: "A = ∫(c→d) [sağ(y) − sol(y)] dy", meaning: "Y eksenine göre dilimleme (eğriler x = g(y) biçiminde verilince)." },
      { expr: "Yer değiştirme = ∫ v(t) dt ;  Toplam yol = ∫ |v(t)| dt", meaning: "Hız–yol ilişkisi." },
      { expr: "∫ₐᵇ r(t) dt = toplam değişim", meaning: "Değişim hızının integrali birikmiş miktarı verir (debi, üretim hızı vb.)." },
      { expr: "y = x² ile y = k arası alan = (4/3)·k^(3/2)", meaning: "Parabol–yatay doğru arası alan; parabolik bölge, çevreleyen dikdörtgenin 2/3’üdür." },
      { expr: "y = a(x − x₁)(x − x₂) ile x ekseni arası alan = |a|·(x₂ − x₁)³/6", meaning: "Parabol ile kesişim noktaları arasındaki alan için hızlı formül." },
    ],
    logic:
      "Belirli integral, ince dikdörtgen şeritlerin toplamıdır; her şeridin “yüksekliği” f(x)’tir. f(x) negatif olduğunda şeridin yüksekliği negatif sayılır ve toplamdan düşer. Bu yüzden ∫f, geometrik alanı değil, üstteki alanlardan alttakilerin çıkarılmış hâlini verir. Gerçek alan istendiğinde, f’nin işaret değiştirdiği noktalardan bölüp her parçanın mutlak değerini alırız.\n\nİki eğri arasındaki alanda şeridin yüksekliği “üst eğri − alt eğri” farkıdır. Bu fark her zaman pozitif olduğundan x ekseninin altında ya da üstünde olmak önemli değildir; yalnızca hangi eğrinin üstte kaldığı önemlidir. Eğriler aralık içinde kesişip yer değiştiriyorsa her bölgede üst-alt rolleri değişir ve bölgeler ayrı ayrı hesaplanır. Aksi takdirde pozitif ve negatif parçalar birbirini götürür, sonuç yanlış (hatta 0) çıkar.\n\nHız–zaman grafiğinde de aynı mantık vardır: hız negatifken araç geri gider. İşaretli integral net yer değiştirmeyi, mutlak değerli integral ise kilometre sayacının gösterdiği toplam yolu verir. Genel ilke: “bir niceliğin değişim hızının integrali, o niceliğin toplam değişimidir.”",
    examples: [
      {
        level: "kolay",
        problem: "y = 4 − x² eğrisi ile x ekseni arasında kalan bölgenin alanı kaç birimkaredir?",
        steps: [
          "Kesişim: 4 − x² = 0 → x = −2 ve x = 2; bu aralıkta eğri x ekseninin üstündedir.",
          "A = ∫₋₂² (4 − x²) dx = [4x − x³/3]₋₂².",
          "= (8 − 8/3) − (−8 + 8/3) = 16 − 16/3 = 32/3.",
        ],
        answer: "32/3 birimkare",
      },
      {
        level: "orta",
        problem: "y = x³ eğrisi, x = −1, x = 2 doğruları ve x ekseni arasında kalan bölgelerin toplam alanı kaçtır?",
        steps: [
          "x³, [−1, 0]’da negatif, [0, 2]’de pozitiftir; x = 0’dan bölünür.",
          "∫₋₁⁰ x³ dx = [x⁴/4]₋₁⁰ = 0 − 1/4 = −1/4 → alan 1/4.",
          "∫₀² x³ dx = 16/4 = 4.",
          "Toplam alan = 1/4 + 4 = 17/4 (işaretli integral 15/4 olurdu; bu bir çeldiricidir).",
        ],
        answer: "17/4 birimkare",
      },
      {
        level: "zor",
        problem: "y = x² − 2x ve y = x eğrileri arasında kalan kapalı bölgenin alanı kaçtır?",
        steps: [
          "Kesişim: x² − 2x = x → x² − 3x = 0 → x = 0 ve x = 3.",
          "Arada bir nokta dene: x = 1 için doğru 1, parabol −1 → doğru üstte.",
          "A = ∫₀³ [x − (x² − 2x)] dx = ∫₀³ (3x − x²) dx.",
          "= [3x²/2 − x³/3]₀³ = 27/2 − 9 = 9/2.",
          "Kontrol: fark 3x − x² = −(x − 0)(x − 3) parabolü için |a|(x₂ − x₁)³/6 = 27/6 = 9/2.",
        ],
        answer: "9/2 birimkare",
      },
    ],
    osymThinking:
      "ÖSYM bu konuda çoğunlukla grafik verip bölgelerin alanlarını söyler (A₁, A₂, A₃ gibi) ve ∫f, ∫|f| ya da bunların kombinasyonunu sorar. Ölçülen beceri, işaretli alan ile gerçek alanı ayırt etmektir. Hız–zaman sorularında “yer değiştirme” ile “alınan toplam yol” farkı; simetrik bölgelerde ise integralin 0 çıkıp alanın 0 olmadığı tuzağı sık kullanılır. Kesişim noktalarını bulmak ve hangi eğrinin üstte olduğunu belirlemek her sorunun ilk adımıdır.",
    commonMistakes: [
      "Alan sorusunda x ekseni altındaki kısmı negatif bırakıp işaretli integrali alan sanmak.",
      "İki eğri arasında “alt − üst” yazıp negatif sonuç elde etmek ya da mutlak değer almayı unutmak.",
      "Eğrilerin aralık içinde yer değiştirdiğini fark etmeyip tek integral yazmak (simetrik bölgelerde sonuç 0 çıkar).",
      "Hız sorularında toplam yol yerine yer değiştirmeyi (ya da tersini) hesaplamak.",
      "Kesişim noktalarından yalnız birini bulup integral sınırlarını yanlış kurmak.",
    ],
    tips: [
      "Önce kaba bir çizim yap: kesişim noktaları ve hangi eğrinin üstte olduğu, sorunun yarısıdır.",
      "Parabol ile doğru arası alan için |a|(x₂ − x₁)³/6 formülü hesabı hızlandırır.",
      "∫(f + |f|) = 2·(üstteki alanların toplamı); ∫(f − |f|) = −2·(alttaki alanların toplamı).",
      "Hız tablosu verilip parçalı doğrusal hız söyleniyorsa alanı yamuk ve üçgenlerle bul.",
    ],
    summary: [
      "∫f işaretli alan, ∫|f| gerçek alandır; kök noktalarından bölünür.",
      "İki eğri arası alan: ∫(üst − alt); eğriler yer değiştiriyorsa bölgeleri ayır.",
      "Yer değiştirme = ∫v dt, toplam yol = ∫|v| dt.",
      "Değişim hızının integrali toplam değişimi verir (su, üretim, nüfus).",
      "F(x) = ∫ₐˣ f(t)dt için F′ = f: f pozitifken F artar, f işaret değiştirince F ekstremum yapar.",
      "Parabol–doğru arası alan için |a|(x₂ − x₁)³/6 kısa yolunu kullan.",
    ],
  },
];
