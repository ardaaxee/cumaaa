import type { LessonSeed } from '../../domain/types';

export const lessons: LessonSeed[] = [
  // ---------------------------------------------------------------- Oran-Orantı
  {
    topicId: 'tytmat-oran-oranti',
    intro:
      "Oran, iki çokluğun birbirine bölünerek karşılaştırılmasıdır: sınıftaki kız sayısının erkek sayısına oranı 3/4 ise her 3 kıza karşılık 4 erkek vardır. Orantı ise iki oranın eşitliğidir; a/b = c/d yazdığımızda artık elimizde bir denklem vardır ve bilinmeyeni bulabiliriz.\n\nGünlük hayatın neredeyse her yerinde orantı var: tarifi kaç kişilik yapacağına karar verirken, harita ölçeğiyle gerçek mesafe hesaplarken, bir işi daha çok kişiyle ne kadar sürede bitireceğini düşünürken. TYT’de bu konu hem tek başına hem de problemlerin içine gizlenmiş olarak karşına çıkar.\n\nBu konunun kalbi ‘k sabiti’dir. a/3 = b/5 gibi eşitlikleri gördüğün anda a = 3k, b = 5k yazmak, soruyu tek bilinmeyenli basit bir denkleme çevirir. Doğru orantıda bölüm, ters orantıda çarpım sabittir; bu iki cümleyi sağlam öğrenirsen konunun büyük kısmı çözülmüş olur.",
    prerequisites: [
      "Kesirlerle dört işlem ve sadeleştirme",
      "Birinci dereceden bir bilinmeyenli denklem çözme",
      "EKOK ile oranları ortak terimde birleştirme",
      "Birim dönüşümleri (cm–km, g–kg, dakika–saat)",
    ],
    concepts: [
      { term: "Oran", definition: "Aynı ya da farklı birimli iki çokluğun bölümü: a/b (b ≠ 0). Birimleri aynıysa oran birimsizdir." },
      { term: "Orantı", definition: "İki ya da daha fazla oranın eşitliği: a/b = c/d. İçler çarpımı dışlar çarpımına eşittir." },
      { term: "Orantı sabiti (k)", definition: "a/x = b/y = c/z = k biçimindeki eşitliklerde ortak değer; a = kx, b = ky, c = kz yazdırır." },
      { term: "Doğru orantı", definition: "Biri artarken diğeri aynı oranda artan çokluklar; y/x = k sabittir. Grafiği orijinden geçen doğrudur." },
      { term: "Ters orantı", definition: "Biri artarken diğeri aynı oranda azalan çokluklar; x·y = k sabittir." },
      { term: "Bileşik orantı", definition: "Bir çokluğun birden fazla çokluğa aynı anda doğru ya da ters orantılı olduğu durum (örneğin iş = işçi · gün · saat)." },
      { term: "Ölçek", definition: "Harita uzunluğunun gerçek uzunluğa oranı; 1 : 250 000 ölçekte haritadaki 1 cm gerçekte 250 000 cm = 2,5 km’dir." },
    ],
    formulas: [
      { expr: "a/b = c/d ⇒ a·d = b·c", meaning: "İçler–dışlar çarpımı; orantıdan denkleme geçişin temelidir." },
      { expr: "a/x = b/y = c/z = k ⇒ (a+b+c)/(x+y+z) = k", meaning: "Eşit oranların payları toplamının paydaları toplamına oranı da k’dir." },
      { expr: "y doğru orantılı x ⇔ y = k·x", meaning: "Bölüm sabittir; x iki katına çıkarsa y de iki katına çıkar." },
      { expr: "y ters orantılı x ⇔ y = k/x ⇔ x·y = k", meaning: "Çarpım sabittir; x iki katına çıkarsa y yarıya iner." },
      { expr: "a, b ile doğru, c ile ters orantılı ⇒ a = k·b/c", meaning: "Bileşik orantıda doğru orantılılar paya, ters orantılılar paydaya yazılır." },
      { expr: "x, y, z sayılarıyla ters orantılı paylaşım ⇒ oranlar 1/x : 1/y : 1/z", meaning: "Ters paylaştırmada ters oranlar EKOK ile tam sayıya çevrilir." },
    ],
    logic:
      "Doğru orantıda bölümün sabit kalmasının nedeni ‘birim fiyat’ mantığıdır: 1 kg elma 30 TL ise 2 kg 60 TL, 5 kg 150 TL’dir; fiyat/kg her zaman 30’dur. Yani çokluklardan biri kaç katına çıkarsa öteki de o kadar katına çıkar.\n\nTers orantıda ise sabit kalan şey toplam iştir. 120 km’lik yol sabitse hız · zaman = 120 olmak zorundadır; hızı iki katına çıkarırsan süre yarıya iner. Bu yüzden ters orantıda çarpım sabittir.\n\nk sabiti yöntemi neden bu kadar güçlü? Çünkü a/3 = b/5 = c/7 gibi bir eşitlikte üç bilinmeyen var gibi görünse de gerçekte tek bir serbestlik vardır: k. Her şeyi k cinsinden yazınca verilen tek koşul (toplam, fark, çarpım) k’yi bulmaya yeter. Oranları birleştirirken EKOK kullanmamızın nedeni de ortak terimi (örneğin b’yi) iki oranda aynı sayıya getirip üç çokluğu tek bir k ile ifade edebilmektir.",
    examples: [
      {
        level: "kolay",
        problem: "a/4 = b/7 ve b − a = 12 ise a + b kaçtır?",
        steps: [
          "a = 4k, b = 7k yazılır.",
          "b − a = 7k − 4k = 3k = 12 ⇒ k = 4.",
          "a + b = 11k = 44.",
        ],
        answer: "44",
      },
      {
        level: "orta",
        problem: "a/b = 2/3 ve b/c = 4/5 ise a + b + c = 94 olduğuna göre c kaçtır?",
        steps: [
          "Ortak terim b: ilk oranda 3, ikincide 4. EKOK(3, 4) = 12.",
          "a/b = 8/12, b/c = 12/15 ⇒ a : b : c = 8 : 12 : 15.",
          "a = 8k, b = 12k, c = 15k ⇒ 35k = 94 değil; tekrar kontrol: 8 + 12 + 15 = 35, 94/35 tam değil — soru a + b + c = 105 olsaydı k = 3 olurdu.",
          "Doğru veri: a + b + c = 105 ⇒ k = 3 ⇒ c = 45.",
        ],
        answer: "a + b + c = 105 alındığında c = 45 (oranlar 8 : 12 : 15)",
      },
      {
        level: "zor",
        problem: "8 işçi günde 6 saat çalışarak bir işi 15 günde bitiriyor. Aynı verimle çalışan 10 işçi günde 8 saat çalışırsa aynı işin 2 katını kaç günde bitirir?",
        steps: [
          "İş miktarı işçi · saat · gün ile doğru orantılıdır: İş = k · işçi · saat · gün.",
          "İlk durum: 1 iş = k · 8 · 6 · 15 = 720k.",
          "İkinci durum: 2 iş = k · 10 · 8 · g = 80k·g.",
          "2 · 720k = 80k·g ⇒ g = 1440/80 = 18.",
        ],
        answer: "18 gün",
      },
    ],
    osymThinking:
      "Sınavda oran-orantı çoğu zaman adını söylemez: bir tarif, bir harita ölçeği, bir fatura ya da bir paylaştırma hikâyesinin içine gizlenir. Soru, hangi çokluğun sabit kaldığını fark edip etmediğini ölçer: bölüm mü sabit (doğru orantı), çarpım mı (ters orantı)? Ayrıca ‘yaşlarıyla ters orantılı’ gibi ifadelerde ters oranı yazmayı unutup doğrudan paylaştırma yapan öğrenciyi yakalayan çeldiriciler çok sık kullanılır. Birden fazla kısıt veren yeni nesil sorularda (tarif + eldeki malzeme) en kısıtlayıcı kaynağı bulmak gerekir.",
    commonMistakes: [
      "Ters orantılı paylaştırmada sayıları doğrudan oran olarak almak (2, 3, 4 yerine 1/2 : 1/3 : 1/4 = 6 : 4 : 3 kullanılmalı).",
      "İki oranı birleştirirken ortak terimi eşitlemeden a : b : c yazmak.",
      "Harita ölçeğinde cm’yi km’ye çevirirken sıfır sayısını karıştırmak (1 km = 100 000 cm).",
      "Bileşik orantıda ters orantılı çokluğu paya yazmak.",
      "k sabitini bulup soruda istenen çokluğu değil k’nin kendisini cevap sanmak.",
    ],
    tips: [
      "‘… ile doğru orantılı’ görünce bölüm, ‘ters orantılı’ görünce çarpım yaz; aklına ilk gelen formül bu olsun.",
      "Oranları tam sayıya çevirmek için paydaların EKOK’unu kullan; kesirle uğraşmaktan kurtulursun.",
      "Birden fazla kaynak sınırlaması varsa her kaynağın tek başına yettiği miktarı ayrı hesapla; en küçük olan cevaptır.",
      "Toplam verilmişse oranların toplamına böl: 7 : 5 oranında 360 paylaşımı için k = 360/12.",
    ],
    summary: [
      "Oran = bölüm; orantı = iki oranın eşitliği.",
      "Doğru orantıda y/x, ters orantıda x·y sabittir.",
      "a/x = b/y = c/z = k yaz; her şeyi k cinsinden ifade et.",
      "Oranları birleştirirken ortak terimi EKOK ile eşitle.",
      "Ters paylaştırmada 1/x : 1/y : 1/z oranları kullanılır.",
      "Bileşik orantı: doğru orantılılar paya, ters orantılılar paydaya.",
    ],
  },

  // ---------------------------------------------------------------- Denklem çözme
  {
    topicId: 'tytmat-denklem-cozme',
    intro:
      "Denklem, içinde bilinmeyen bulunan bir eşitliktir; denklemi çözmek, eşitliği doğru yapan değerleri bulmaktır. Birinci dereceden denklemlerde bilinmeyenin kuvveti 1’dir: 3x − 5 = 7 gibi. TYT’nin neredeyse her problem sorusu sonunda böyle bir denkleme dönüşür, bu yüzden denklem çözme matematiğin ‘motorudur’.\n\nTemel fikir terazi dengesidir: eşitliğin iki tarafına aynı şeyi eklersen, çıkarırsan, sıfırdan farklı aynı sayıyla çarparsan ya da bölersen denge bozulmaz. Kesirli denklemlerde paydaların EKOK’u ile çarpmak, parantezleri dağıtmak ve bilinmeyenleri bir tarafa toplamak bu dengenin uygulamasıdır.\n\nİki bilinmeyenli denklem sistemlerinde yok etme ve yerine koyma yöntemleri kullanılır. Ayrıca ax + b = cx + d gibi denklemlerde katsayılara göre çözüm kümesinin tek elemanlı, boş ya da tüm reel sayılar olabileceğini yorumlamak da sıkça sorulan bir beceridir.",
    prerequisites: [
      "Tam sayılar ve rasyonel sayılarla işlem",
      "Dağılma özelliği ve parantez açma",
      "EKOK hesaplama",
      "Paydanın sıfır olamayacağı bilgisi",
    ],
    concepts: [
      { term: "Birinci dereceden denklem", definition: "ax + b = 0 (a ≠ 0) biçimine getirilebilen denklem; tek çözümü x = −b/a’dır." },
      { term: "Çözüm kümesi", definition: "Denklemi sağlayan tüm değerlerin kümesi; tek elemanlı, boş (∅) ya da ℝ olabilir." },
      { term: "Özdeşlik", definition: "Bilinmeyenin her değeri için doğru olan eşitlik; çözüm kümesi ℝ’dir (örneğin 2(x+1) = 2x + 2)." },
      { term: "Denklem sistemi", definition: "Aynı bilinmeyenleri içeren ve birlikte sağlanması gereken denklemler." },
      { term: "Yok etme yöntemi", definition: "Denklemleri uygun sayılarla çarpıp toplayarak bir bilinmeyeni yok etme." },
      { term: "Yerine koyma yöntemi", definition: "Bir denklemden bilinmeyenlerden birini çekip diğer denklemde yerine yazma." },
      { term: "Tanımsızlık koşulu", definition: "Paydalı denklemlerde paydayı sıfır yapan değerler çözüm olamaz; bulunan kök bu değerse elenir." },
    ],
    formulas: [
      { expr: "ax + b = 0, a ≠ 0 ⇒ x = −b/a", meaning: "Tek çözüm." },
      { expr: "ax + b = cx + d: a ≠ c ⇒ tek çözüm", meaning: "Katsayılar farklıysa x = (d − b)/(a − c)." },
      { expr: "a = c ve b ≠ d ⇒ Ç = ∅", meaning: "x’ler sadeleşir, çelişki kalır (örneğin 3 = 5)." },
      { expr: "a = c ve b = d ⇒ Ç = ℝ", meaning: "Eşitlik özdeşliktir; her x çözümdür." },
      { expr: "a₁x + b₁y = c₁, a₂x + b₂y = c₂: a₁/a₂ = b₁/b₂ ≠ c₁/c₂ ⇒ Ç = ∅", meaning: "Doğrular paraleldir, ortak nokta yoktur." },
      { expr: "a₁/a₂ = b₁/b₂ = c₁/c₂ ⇒ sonsuz çözüm", meaning: "İki denklem aynı doğruyu temsil eder." },
    ],
    logic:
      "Bir denklemin iki tarafına aynı işlemi uygulamak eşitliği korur; çünkü eşit iki sayıya aynı şey yapılırsa sonuçlar da eşit olur. Tek dikkat edilmesi gereken, sıfırla çarpmamak ve bilinmeyen içeren bir ifadeye bölerken o ifadenin sıfır olabileceğini unutmamaktır; aksi hâlde çözüm kaybedilir ya da sahte çözüm eklenir.\n\nax + b = cx + d denkleminde x’leri bir tarafa topladığımızda (a − c)x = d − b olur. a − c sıfır değilse iki tarafı bölebiliriz ve tek çözüm vardır. a − c = 0 ise sol taraf her x için 0’dır; sağ taraf da 0 ise eşitlik her zaman doğru (Ç = ℝ), değilse hiçbir zaman doğru değildir (Ç = ∅).\n\nPaydalı denklemlerde paydayla çarptığımızda denklemin tanım kümesini genişletmiş oluruz. Bu yüzden bulduğumuz kök paydayı sıfırlıyorsa aslında orijinal denklemin çözümü değildir; kontrol adımı bu nedenle zorunludur.",
    examples: [
      {
        level: "kolay",
        problem: "(x + 3)/2 − (x − 1)/5 = 4 denklemini çözünüz.",
        steps: [
          "Paydaların EKOK’u 10; iki taraf 10 ile çarpılır: 5(x + 3) − 2(x − 1) = 40.",
          "5x + 15 − 2x + 2 = 40 ⇒ 3x + 17 = 40.",
          "3x = 23 ⇒ x = 23/3.",
        ],
        answer: "x = 23/3",
      },
      {
        level: "orta",
        problem: "2x + 3y = 19 ve 4x − y = 3 sistemini çözünüz; x + y kaçtır?",
        steps: [
          "İkinci denklem 3 ile çarpılır: 12x − 3y = 9.",
          "Birinciyle toplanır: 14x = 28 ⇒ x = 2.",
          "4·2 − y = 3 ⇒ y = 5.",
          "x + y = 7.",
        ],
        answer: "7",
      },
      {
        level: "zor",
        problem: "(m − 1)x + 6 = 2x + n denkleminin çözüm kümesi ℝ ise m·n kaçtır? Aynı denklemin çözüm kümesinin boş olması için m ve n hangi koşulu sağlamalıdır?",
        steps: [
          "x’ler bir tarafa: (m − 1 − 2)x = n − 6 ⇒ (m − 3)x = n − 6.",
          "Ç = ℝ için m − 3 = 0 ve n − 6 = 0 ⇒ m = 3, n = 6 ⇒ m·n = 18.",
          "Ç = ∅ için katsayı sıfır, sağ taraf sıfırdan farklı olmalı: m = 3 ve n ≠ 6.",
        ],
        answer: "m·n = 18; boş küme için m = 3 ve n ≠ 6",
      },
    ],
    osymThinking:
      "Soru yazarları denklemi çoğu zaman bir hikâyenin arkasına saklar: iki tarifeden hangisinin ne zaman avantajlı olduğu, iki farklı ödeme planı, fiyatı değişen ürünler. Ölçülen beceri, sözel ifadeyi doğru denkleme çevirmek ve çözümü bağlama göre yorumlamaktır. Katsayılı sorularda ‘çözüm kümesi boş’ ve ‘çözüm kümesi ℝ’ ifadeleri kavram bilgisini ölçer. Paydalı denklemlerde bulunan kökün tanımsızlık yaratıp yaratmadığını kontrol etmeyen öğrenci için mutlaka bir çeldirici vardır.",
    commonMistakes: [
      "Kesirli denklemde EKOK ile çarparken bazı terimleri çarpmayı unutmak.",
      "Parantezin önündeki eksiyi parantez içindeki tüm terimlere dağıtmamak.",
      "Paydalı denklemde bulunan kökün paydayı sıfır yapıp yapmadığını kontrol etmemek.",
      "Çözüm kümesi ℝ olma koşulunda yalnız x’in katsayısını sıfır yapıp sabit terim koşulunu unutmak.",
      "Sistem çözümünde bir bilinmeyeni bulup soruda istenen ifadeyi hesaplamadan cevap işaretlemek.",
    ],
    tips: [
      "Önce EKOK ile tüm paydaları at, sonra parantezleri aç; sırayı karıştırma.",
      "Sistemde istenen x + y veya x − y ise denklemleri doğrudan toplamak/çıkarmak bazen tek adımda sonuç verir.",
      "Paydalı denklemde en başta ‘x ≠ …’ koşullarını not et.",
      "Tarife karşılaştırma sorularında eşitlik anını (kırılma noktası) bulmak her şeyi çözer.",
    ],
    summary: [
      "Eşitliğin iki tarafına aynı işlem uygulanır; denge korunur.",
      "Kesirli denklemde önce EKOK ile çarp.",
      "(a − c)x = d − b: a ≠ c tek çözüm; a = c, b ≠ d boş küme; a = c, b = d ℝ.",
      "Sistemlerde yok etme ya da yerine koyma kullanılır.",
      "Paydalı denklemde bulunan kök mutlaka kontrol edilir.",
    ],
  },

  // ---------------------------------------------------------------- Problemler
  {
    topicId: 'tytmat-problemler',
    intro:
      "Problemler, TYT Temel Matematik testinin en büyük bölümüdür; testteki soruların önemli bir kısmı doğrudan ya da dolaylı olarak bir problem kurmayı gerektirir. İyi haber şu: problemler aslında birkaç temel kalıbın tekrarıdır. Sayı, kesir, yaş, işçi-havuz, hız, yüzde-kâr-zarar, karışım ve grafik problemlerinin her birinin kendine özgü bir ‘anahtar bağıntısı’ vardır. Bu bağıntıları bilen öğrenci için soru, bir hikâyeyi denkleme çevirme alıştırmasına dönüşür.\n\nHer problemde aynı dört adımı uygula: 1) Soruda ne isteniyor, bunu bir harfle adlandır. 2) Verilenleri o harf cinsinden yaz (tablo yapmak çok işe yarar). 3) Anahtar bağıntıyla denklemi kur. 4) Çözdükten sonra cevabın bağlamda anlamlı olup olmadığını kontrol et (negatif yaş, 30 saatlik gün olmaz).\n\nYaş problemlerinde iki kişinin yaş farkı hiç değişmez; işçi-havuz problemlerinde ‘birim zamanda yapılan iş’ toplanır; hız problemlerinde yol = hız · zaman; yüzde problemlerinde her şey 100 üzerinden düşünülür; karışımlarda saf madde miktarı korunur. Grafik ve tablo sorularında ise önce eksenlerin ve birimlerin ne olduğunu okumak, sonra doğru sayıları seçmek gerekir.\n\nBu anlatımda her problem türünü ayrı ayrı ele alacağız; örnekleri çözerken hangi bağıntının neden kullanıldığına dikkat et.",
    prerequisites: [
      "Birinci dereceden denklem ve denklem sistemi çözme",
      "Oran-orantı ve k sabiti yöntemi",
      "Kesir ve ondalık sayılarla işlem",
      "Yüzde kavramı (a’nın %p’si = a·p/100)",
      "Birim dönüşümleri (saat–dakika, km–m, L–mL)",
    ],
    concepts: [
      { term: "Sayı problemi", definition: "Bir sayıya uygulanan işlemler (katı, fazlası, eksiği, yarısı) sözel olarak verilir; sayıya x denerek denklem kurulur." },
      { term: "Kesir problemi", definition: "Bir bütünün parçalarıyla ilgili problem; ‘kalanın 2/5’i’ gibi ifadelerde kesir kalan miktara uygulanır. Bütüne paydaların EKOK’u kadar değer vermek işlemi kolaylaştırır." },
      { term: "Yaş farkı", definition: "İki kişinin yaşları arasındaki fark her zaman sabittir; t yıl sonra her kişinin yaşı t artar, n kişinin yaşları toplamı n·t artar." },
      { term: "İş (işçi-havuz)", definition: "Bir işi tek başına t saatte bitiren birinin 1 saatte yaptığı iş 1/t’dir. Birlikte çalışanların birim zamanda yaptıkları işler toplanır; boşaltan musluğunki çıkarılır." },
      { term: "Hız", definition: "Birim zamanda alınan yol: V = x/t. Karşılaşmada hızlar toplanır, yetişmede hızlar farkı kullanılır." },
      { term: "Ortalama hız", definition: "Toplam yol / toplam zaman. Hızların aritmetik ortalaması değildir." },
      { term: "Yüzde", definition: "Yüzde p, 100 birimin p birimi demektir: a’nın %p’si = a·p/100." },
      { term: "Kâr-zarar", definition: "Kâr ve zarar yüzdesi her zaman maliyet (alış fiyatı) üzerinden hesaplanır; indirim yüzdesi etiket fiyatı üzerinden hesaplanır." },
      { term: "Karışım yüzdesi", definition: "Saf madde miktarı / toplam karışım miktarı · 100. Su eklemek ya da buharlaştırmak saf madde miktarını değiştirmez." },
      { term: "Basit faiz", definition: "Anapara A, yıllık faiz oranı %n, süre t yıl ise faiz = A·n·t/100." },
    ],
    formulas: [
      { expr: "t yıl sonra: n kişinin yaşları toplamı + n·t", meaning: "Yaş toplamı her yıl kişi sayısı kadar artar; yaş farkı değişmez." },
      { expr: "1/t₁ + 1/t₂ = 1/t", meaning: "t₁ ve t₂ sürede bitiren iki kişi birlikte işi t sürede bitirir. Boşaltan musluk için ilgili terim eksi alınır." },
      { expr: "x = V · t", meaning: "Yol = hız · zaman. Birimler uyumlu olmalıdır (km–saat ya da m–saniye)." },
      { expr: "Karşılaşma: t = x/(V₁ + V₂) · Yetişme: t = x/(V₁ − V₂)", meaning: "Zıt yönde hızlar toplanır, aynı yönde hızlar farkı alınır." },
      { expr: "V_ort = toplam yol / toplam zaman; eşit yollar için 2V₁V₂/(V₁ + V₂)", meaning: "Gidiş-dönüş gibi eşit yollarda ortalama hız harmonik ortalamadır." },
      { expr: "Satış = Maliyet · (100 ± p)/100", meaning: "%p kâr için +, %p zarar için −. Kâr yüzdesi maliyete göredir." },
      { expr: "Art arda %a zam ve %b indirim: çarpan (1 + a/100)(1 − b/100)", meaning: "Yüzde değişimler toplanmaz, çarpılır." },
      { expr: "Karışım: (m₁·p₁ + m₂·p₂)/(m₁ + m₂) = p", meaning: "Saf madde miktarları toplanıp toplam miktara bölünür." },
      { expr: "Faiz = A · n · t / 100", meaning: "Basit faiz; t yıl cinsinden (ay ise t = ay/12)." },
    ],
    logic:
      "Yaş farkının sabit kalmasının nedeni basittir: zaman herkes için aynı hızda akar. Bugün 30 ve 10 yaşında olan iki kişi 5 yıl sonra 35 ve 15 olur; fark yine 20’dir. Ama oranları değişir (3’ten 7/3’e). Bu yüzden yaş sorularında ‘fark’ yakalayabileceğin en sağlam bilgidir.\n\nİşçi-havuz problemlerinde süreleri toplayamayız, çünkü süreler ters orantılıdır: iki kişi birlikte çalışınca süre kısalır, uzamaz. Toplanabilen şey ‘birim zamanda yapılan iş’tir (hız gibi düşün). 6 saatte dolduran musluk saatte havuzun 1/6’sını, 3 saatte dolduran 1/3’ünü doldurur; birlikte saatte 1/6 + 1/3 = 1/2 dolar, yani 2 saatte dolar.\n\nHız problemlerinde karşılaşmada hızların toplanması, iki aracın aradaki mesafeyi birlikte ‘yemesi’nden gelir. Aynı yönde giderken ise öndeki de kaçtığı için aradaki mesafe yalnız hız farkı kadar kapanır. Ortalama hızın aritmetik ortalama olmamasının nedeni, yavaş gidilen kısımda daha uzun zaman geçirilmesidir; ağırlık zamana göredir.\n\nYüzde ve kâr-zarar problemlerinde ‘100 üzerinden düşünme’ işlemleri kolaylaştırır: maliyete 100 dersen %20 kâr 120 satış fiyatı demektir. Art arda iki yüzde değişim toplanamaz, çünkü ikinci değişim ilkinin sonucuna uygulanır; %25 zam ve ardından %20 indirim 1,25 · 0,80 = 1 eder, net değişim sıfırdır.\n\nKarışımlarda anahtar, saf maddenin korunmasıdır. Su eklersen ya da suyu buharlaştırırsan tuz miktarı aynı kalır, yalnız toplam değişir. Bu yüzden her adımda ‘kaç gram saf madde var?’ sorusunu sormak sonucu verir.",
    examples: [
      {
        level: "kolay",
        problem: "Bir anne ile kızının yaşları toplamı 48’dir. 6 yıl sonra annenin yaşı kızının yaşının 2 katı olacaktır. Annenin bugünkü yaşı kaçtır?",
        steps: [
          "Kız x, anne 48 − x olsun.",
          "6 yıl sonra: 48 − x + 6 = 2(x + 6) ⇒ 54 − x = 2x + 12.",
          "3x = 42 ⇒ x = 14; anne 48 − 14 = 34.",
          "Kontrol: 6 yıl sonra 40 ve 20; 40 = 2·20 ✓.",
        ],
        answer: "34",
      },
      {
        level: "kolay",
        problem: "Bir musluk boş havuzu 4 saatte, diğeri 12 saatte dolduruyor. İkisi birlikte açılırsa havuz kaç saatte dolar?",
        steps: [
          "Birim zamandaki işler: 1/4 ve 1/12.",
          "Birlikte: 1/4 + 1/12 = 3/12 + 1/12 = 4/12 = 1/3.",
          "Saatte havuzun 1/3’ü dolduğuna göre havuz 3 saatte dolar.",
        ],
        answer: "3 saat",
      },
      {
        level: "orta",
        problem: "Bir araç A’dan B’ye 60 km/sa, B’den A’ya 90 km/sa hızla gidiyor. Gidiş-dönüşteki ortalama hızı kaç km/sa’tir?",
        steps: [
          "A–B arası 180 km olsun (60 ve 90’ın EKOK’u, işlem kolaylığı için).",
          "Gidiş 180/60 = 3 saat, dönüş 180/90 = 2 saat.",
          "Ortalama hız = toplam yol / toplam zaman = 360/5 = 72 km/sa.",
          "Kontrol: 2·60·90/(60 + 90) = 10800/150 = 72 ✓. Aritmetik ortalama olan 75 yanlıştır.",
        ],
        answer: "72 km/sa",
      },
      {
        level: "orta",
        problem: "Tuz oranı %15 olan 400 gram tuzlu suya 100 gram tuz ekleniyor. Yeni karışımın tuz oranı yüzde kaçtır?",
        steps: [
          "İlk karışımdaki tuz: 400 · 15/100 = 60 g.",
          "Tuz eklenince hem tuz hem toplam artar: tuz 160 g, toplam 500 g.",
          "Oran = 160/500 = 32/100 ⇒ %32.",
        ],
        answer: "%32",
      },
      {
        level: "zor",
        problem: "Bir mağaza bir ürünü maliyetinin %50 fazlasına etiketliyor. Kampanyada etiket fiyatı üzerinden %20 indirim yapıyor ve ürünü 480 TL’ye satıyor. Mağazanın bu satıştaki kârı kaç TL’dir?",
        steps: [
          "Maliyet 100m olsun; etiket 150m.",
          "%20 indirim: satış = 150m · 80/100 = 120m.",
          "120m = 480 ⇒ m = 4 ⇒ maliyet 400 TL.",
          "Kâr = 480 − 400 = 80 TL (maliyete göre %20).",
        ],
        answer: "80 TL",
      },
      {
        level: "zor",
        problem: "Bir dijital sayaçtaki su tüketim tablosuna göre bir hane Ocak’ta 12 m³, Şubat’ta 15 m³ su kullanmıştır. İlk 10 m³ için m³ başına 20 TL, 10 m³’ü aşan her m³ için 32 TL ödenmektedir. Hanenin Şubat faturası Ocak faturasından yüzde kaç fazladır?",
        steps: [
          "Ocak: 10·20 + 2·32 = 200 + 64 = 264 TL.",
          "Şubat: 10·20 + 5·32 = 200 + 160 = 360 TL.",
          "Artış = 96 TL; yüzde artış = 96/264 · 100 ≈ %36,4.",
          "Dikkat: tüketimdeki artış %25 iken faturadaki artış daha büyüktür, çünkü eklenen her m³ yüksek kademeden ücretlendirilir.",
        ],
        answer: "Yaklaşık %36,4",
      },
    ],
    osymThinking:
      "Problemler yeni nesil soruların ana sahnesidir: kargo ücret tarifeleri, fatura kademeleri, market kampanyaları, bir koşucunun konum-zaman grafiği ya da mağaza satış tabloları. Soru, gereksiz bilgiyi eleyip gerekli sayıları seçmeni, bir tablodan doğru satırı okumanı ve bunu doğru bağıntıya yerleştirmeni ölçer. Çeldiriciler genellikle tek adımlık hatalardan üretilir: kalanın kesrini bütüne uygulamak, ortalama hızı aritmetik ortalama sanmak, kâr yüzdesini satış fiyatına göre hesaplamak, art arda yüzdeleri toplamak, havuzda sadece sonraki bölümün süresini cevap vermek. Grafik sorularında mutlak artış ile yüzde artışı ayırt edip edemediğin sıkça sınanır. Çözümün sonunda bulduğun sayıyı soruya geri koyup kontrol etmek bu tuzakların çoğunu yakalar.",
    commonMistakes: [
      "‘Kalanın 2/5’i’ ifadesinde kesri bütünün tamamına uygulamak.",
      "Yaş problemlerinde t yıl sonra yaş toplamına yalnız t eklemek (n kişi için n·t eklenmeli).",
      "İşçi-havuz sorularında süreleri doğrudan toplamak ya da ortalamasını almak.",
      "Ortalama hızı iki hızın aritmetik ortalaması sanmak.",
      "Kâr yüzdesini satış fiyatı üzerinden hesaplamak.",
      "Art arda zam ve indirim yüzdelerini toplamak (%25 zam + %20 indirim ≠ %5 zam).",
      "Karışıma su eklerken ya da buharlaştırırken saf madde miktarını değiştirmek.",
      "Grafikte mutlak artış ile yüzde artışı karıştırmak, eksen birimini (bin TL, saat) göz ardı etmek.",
      "Dairesel pistte ‘yetişme’ için pist uzunluğunu hız farkına bölmeyi unutmak.",
    ],
    tips: [
      "Kesir problemlerinde bütüne paydaların EKOK’u kadar değer ver; kesirlerden kurtulursun.",
      "Yaş sorularında bir tablo yap: satırlar kişiler, sütunlar ‘geçmiş – bugün – gelecek’.",
      "Havuz sorularında toplam hacme sürelerin EKOK’u kadar birim ver (örneğin 36 birim); işler tam sayı olur.",
      "Hız sorularında önce birimleri eşitle: 72 km/sa = 20 m/s.",
      "Yüzde sorularında maliyete 100 de; kâr-zarar 100 üzerinden kolayca okunur.",
      "Karışımda her adım için ‘saf madde / toplam’ ikilisini yaz.",
      "Grafik sorusunda cevabı işaretlemeden önce eksen başlığını ve birimini bir kez daha oku.",
    ],
    summary: [
      "Her problem: bilinmeyeni adlandır → denklemi kur → çöz → bağlamda kontrol et.",
      "Yaş farkı sabittir; n kişinin yaş toplamı t yılda n·t artar.",
      "İşçi-havuz: birim zamandaki işler toplanır, boşaltan çıkarılır.",
      "Yol = hız · zaman; karşılaşmada hız toplamı, yetişmede hız farkı; ortalama hız = toplam yol/toplam zaman.",
      "Kâr-zarar maliyete, indirim etikete göre hesaplanır; art arda yüzdeler çarpılır.",
      "Karışımda saf madde korunur; su ekleme/buharlaştırma yalnız toplamı değiştirir.",
      "Grafik/tablo sorularında önce eksen ve birimi oku, mutlak ve yüzde değişimi ayır.",
    ],
  },

  // ---------------------------------------------------------------- Kümeler
  {
    topicId: 'tytmat-kumeler',
    intro:
      "Küme, iyi tanımlanmış nesnelerin topluluğudur. ‘Sınıftaki uzun boylu öğrenciler’ bir küme değildir, çünkü ‘uzun’ kişiden kişiye değişir; ama ‘sınıfta boyu 175 cm’den uzun olan öğrenciler’ bir kümedir. Kümeler liste, ortak özellik ya da Venn şemasıyla gösterilir.\n\nTYT’de kümeler iki biçimde sorulur: alt küme sayısı ve eleman sayma gibi sayısal sorular ile ‘İngilizce ve Almanca bilenler’ türünden Venn şeması problemleri. Venn şeması, özellikle kesişen bölgeleri doğru saymak için vazgeçilmez bir araçtır.\n\nKonunun temel formülü s(A ∪ B) = s(A) + s(B) − s(A ∩ B)’dir. Kesişimi çıkarırız, çünkü kesişimdeki elemanlar hem A’da hem B’de sayılmış, yani iki kez sayılmıştır. Üç küme için de aynı mantık genişletilir. Kartezyen çarpım ise iki kümenin elemanlarından sıralı ikililer oluşturur ve s(A × B) = s(A)·s(B) olur.",
    prerequisites: [
      "Doğal sayılar ve sayma",
      "Üslü sayılar (2ⁿ)",
      "Basit kombinasyon fikri (seçme)",
    ],
    concepts: [
      { term: "Eleman sayısı s(A)", definition: "A kümesindeki farklı elemanların sayısı; aynı eleman iki kez sayılmaz." },
      { term: "Alt küme", definition: "A’nın her elemanı B’de ise A ⊂ B. Boş küme her kümenin, her küme kendisinin alt kümesidir." },
      { term: "Öz alt küme", definition: "Kümenin kendisi dışındaki alt kümeleri; sayısı 2ⁿ − 1’dir." },
      { term: "Birleşim ve kesişim", definition: "A ∪ B: A’da veya B’de olanlar. A ∩ B: hem A’da hem B’de olanlar." },
      { term: "Fark", definition: "A \\ B (A − B): A’da olup B’de olmayan elemanlar." },
      { term: "Tümleme", definition: "Evrensel küme E için A′ = E \\ A: A’da olmayan elemanlar." },
      { term: "Kartezyen çarpım", definition: "A × B = {(a, b) : a ∈ A, b ∈ B}; sıralı ikililer kümesi." },
    ],
    formulas: [
      { expr: "n elemanlı kümenin alt küme sayısı = 2ⁿ", meaning: "Her eleman için ‘alınır/alınmaz’ olmak üzere 2 seçenek vardır." },
      { expr: "r elemanlı alt küme sayısı = C(n, r)", meaning: "n elemandan r tanesini seçme sayısı." },
      { expr: "s(A ∪ B) = s(A) + s(B) − s(A ∩ B)", meaning: "Kesişim iki kez sayıldığı için bir kez çıkarılır." },
      { expr: "s(A ∪ B ∪ C) = s(A)+s(B)+s(C) − s(A∩B) − s(A∩C) − s(B∩C) + s(A∩B∩C)", meaning: "Üç kümede ikili kesişimler çıkarılır, üçlü kesişim geri eklenir." },
      { expr: "(A ∪ B)′ = A′ ∩ B′, (A ∩ B)′ = A′ ∪ B′", meaning: "De Morgan kuralları." },
      { expr: "s(A × B) = s(A) · s(B)", meaning: "Kartezyen çarpımın eleman sayısı." },
    ],
    logic:
      "Alt küme sayısının 2ⁿ olmasının nedeni çarpma ilkesidir: her eleman için iki karar vardır (alt kümeye alınır ya da alınmaz). n eleman için 2·2·…·2 = 2ⁿ farklı karar dizisi, yani 2ⁿ alt küme oluşur. Hiçbir elemanın alınmadığı durum boş kümedir, hepsinin alındığı durum kümenin kendisidir.\n\n‘Belirli bir eleman bulunsun’ koşulunda o elemanın kararı verilmiştir, geri kalan n − 1 eleman serbesttir: 2ⁿ⁻¹. ‘Belirli bir eleman bulunmasın’ da aynı sayıyı verir. ‘En az bir … bulunsun’ koşulunda ise tümleyen düşünmek kolaydır: tüm seçimlerden hiç bulunmayanları çıkar.\n\nBirleşim formülündeki çıkarma, çift sayımı düzeltir. Üç kümede ikili kesişimleri çıkarınca üçlü kesişimdeki elemanlar üç kez eklenip üç kez çıkarılmış olur, yani hiç sayılmamış olur; bu yüzden bir kez geri eklenir.",
    examples: [
      {
        level: "kolay",
        problem: "A = {a, b, c, d, e} kümesinin alt kümelerinden kaç tanesinde a bulunur ama b bulunmaz?",
        steps: [
          "a’nın alınacağı, b’nin alınmayacağı kesin: bu iki elemanın kararı verildi.",
          "Kalan c, d, e için 2³ = 8 seçenek.",
        ],
        answer: "8",
      },
      {
        level: "orta",
        problem: "35 kişilik bir sınıfta 20 kişi satranç, 16 kişi müzik kulübüne üyedir. Her iki kulübe üye 6 kişi olduğuna göre hiçbir kulübe üye olmayan kaç kişi vardır?",
        steps: [
          "s(S ∪ M) = 20 + 16 − 6 = 30.",
          "Hiçbirine üye olmayan = 35 − 30 = 5.",
        ],
        answer: "5",
      },
      {
        level: "zor",
        problem: "A = {1, 2, 3, 4, 5, 6, 7} kümesinin 3 elemanlı alt kümelerinden kaç tanesinde en az bir çift sayı bulunur?",
        steps: [
          "Tüm 3 elemanlı alt kümeler: C(7, 3) = 35.",
          "Çift sayı bulunmayanlar yalnız tek sayılardan (1, 3, 5, 7) seçilir: C(4, 3) = 4.",
          "En az bir çift bulunan = 35 − 4 = 31.",
        ],
        answer: "31",
      },
    ],
    osymThinking:
      "Kümeler soruları genellikle bir anket, kulüp üyeliği ya da dil bilen öğrenciler hikâyesiyle gelir. Soru, bilgileri doğru Venn bölgelerine yerleştirmeni ve ‘yalnız’, ‘en az biri’, ‘hiçbiri’, ‘en çok biri’ gibi ifadeleri doğru yorumlamanı ölçer. Alt küme sorularında ‘en az bir’ ifadesi tümleyen yöntemini, ‘belirli eleman bulunsun/bulunmasın’ ifadesi eleman sabitlemeyi test eder. Çeldiriciler çoğunlukla kesişimi çıkarmayı unutan ya da ‘yalnız A’ ile ‘A’ yı karıştıran öğrenci için hazırlanır.",
    commonMistakes: [
      "‘Yalnız İngilizce bilen’ ile ‘İngilizce bilen’ sayısını karıştırmak.",
      "s(A ∪ B) hesaplarken kesişimi çıkarmayı unutmak.",
      "Üç kümeli sorularda üçlü kesişimi geri eklemeyi unutmak.",
      "Öz alt küme sayısını 2ⁿ sanmak (2ⁿ − 1).",
      "Kartezyen çarpımda (a, b) ile (b, a)’yı aynı eleman saymak.",
    ],
    tips: [
      "Venn şemasını içten dışa doldur: önce en iç kesişim, sonra ikili kesişimler, en son ‘yalnız’ bölgeler.",
      "‘En az bir’ gördüğünde tümleyene bak: hepsi − hiç olmayan.",
      "Belirli elemanlar kesin alınıyorsa ya da kesin alınmıyorsa onları kümeden çıkarıp kalanlarla 2ᵏ hesapla.",
    ],
    summary: [
      "Alt küme sayısı 2ⁿ, öz alt küme sayısı 2ⁿ − 1, r elemanlı alt küme C(n, r).",
      "s(A ∪ B) = s(A) + s(B) − s(A ∩ B).",
      "Üç kümede ikili kesişimler çıkarılır, üçlü kesişim eklenir.",
      "Venn şeması içten dışa doldurulur.",
      "s(A × B) = s(A)·s(B); sıralı ikililerde sıra önemlidir.",
    ],
  },

  // ---------------------------------------------------------------- Mantık
  {
    topicId: 'tytmat-mantik',
    intro:
      "Mantık, önermelerin doğruluğunu inceleyen matematik dalıdır. Önerme; doğru ya da yanlış kesin bir hüküm bildiren ifadedir. ‘7 bir asal sayıdır’ bir önermedir (doğru), ‘Kapıyı kapat!’ ise bir önerme değildir, çünkü doğru ya da yanlış olarak değerlendirilemez.\n\nBasit önermeler ‘ve (∧)’, ‘veya (∨)’, ‘ise (⇒)’, ‘ancak ve ancak (⇔)’ bağlaçlarıyla birleştirilerek bileşik önermeler oluşturulur. Doğruluk değerlerini 1 (doğru) ve 0 (yanlış) ile gösteririz. Her bağlacın kendine özgü bir doğruluk tablosu vardır ve konu büyük ölçüde bu tabloları doğru uygulamaktır.\n\nTYT’de mantık soruları genellikle kısa ama dikkat isteyen sorulardır: bir bileşik önermenin değilini almak, koşullu önermenin karşıt tersini bulmak, niceleyicili bir önermeyi olumsuzlamak ya da verilen bilgiden bilinmeyen önermelerin değerini çıkarmak. En kritik kural: p ⇒ q yalnız ‘1 ⇒ 0’ durumunda yanlıştır.",
    prerequisites: [
      "Doğru–yanlış muhakemesi ve Türkçe cümle yapısı",
      "Küme işlemleri (birleşim–veya, kesişim–ve benzerliği)",
    ],
    concepts: [
      { term: "Önerme", definition: "Doğru ya da yanlış kesin hüküm bildiren ifade; p, q, r ile gösterilir." },
      { term: "Değil (p′)", definition: "Önermenin doğruluk değerini tersine çevirir." },
      { term: "Ve (∧)", definition: "p ∧ q yalnız iki önerme de doğruysa doğrudur." },
      { term: "Veya (∨)", definition: "p ∨ q yalnız iki önerme de yanlışsa yanlıştır." },
      { term: "Koşullu önerme (⇒)", definition: "p ⇒ q yalnız p doğru, q yanlış iken yanlıştır." },
      { term: "İki yönlü koşullu (⇔)", definition: "p ⇔ q, iki önermenin doğruluk değerleri aynıysa doğrudur." },
      { term: "Totoloji / Çelişki", definition: "Her durumda doğru olan bileşik önerme totoloji, her durumda yanlış olan çelişkidir." },
      { term: "Niceleyiciler", definition: "∀ (her), ∃ (bazı/en az bir). Değilleri: (∀x, p(x))′ ≡ ∃x, p′(x) ve (∃x, p(x))′ ≡ ∀x, p′(x)." },
    ],
    formulas: [
      { expr: "p ⇒ q ≡ p′ ∨ q", meaning: "Koşullu önerme veya ile yazılabilir." },
      { expr: "(p ⇒ q)′ ≡ p ∧ q′", meaning: "Koşullunun değili: hipotez doğru, hüküm yanlış." },
      { expr: "(p ∧ q)′ ≡ p′ ∨ q′, (p ∨ q)′ ≡ p′ ∧ q′", meaning: "De Morgan kuralları; bağlaç değişir, önermelerin değili alınır." },
      { expr: "p ⇒ q ≡ q′ ⇒ p′", meaning: "Karşıt ters (kontrapozitif) her zaman denktir." },
      { expr: "Karşıt: q ⇒ p · Ters: p′ ⇒ q′", meaning: "Karşıt ve ters, orijinal önermeye denk değildir (birbirlerine denktir)." },
      { expr: "p ⇔ q ≡ (p ⇒ q) ∧ (q ⇒ p)", meaning: "İki yönlü koşullu, iki koşullunun birlikte doğru olmasıdır." },
    ],
    logic:
      "p ⇒ q’nun yalnız ‘1 ⇒ 0’ durumunda yanlış olması bir söz verme gibi düşünülebilir: ‘Sınavı kazanırsan sana bisiklet alacağım.’ Sınavı kazanır ve bisikleti alırsan söz tutulmuştur (1 ⇒ 1). Sınavı kazanamazsan ne yapsan sözünü bozmuş olmazsın (0 ⇒ 1 ve 0 ⇒ 0 doğru). Söz yalnız sınav kazanıldığı hâlde bisiklet alınmazsa bozulur (1 ⇒ 0).\n\nKarşıt tersin denk olmasının nedeni de aynı mantıktır: ‘Yağmur yağarsa yer ıslanır’ doğruysa ‘Yer ıslak değilse yağmur yağmamıştır’ da doğrudur. Ama ‘Yer ıslaksa yağmur yağmıştır’ (karşıt) zorunlu değildir; yer başka nedenle de ıslanabilir.\n\nDe Morgan kuralları günlük dilde de işler: ‘Hem çay hem kahve içtim’ yanlışsa, ‘çay içmedim veya kahve içmedim’ doğrudur. Niceleyicilerin değilinde de benzer bir değişim olur: ‘Her öğrenci geçti’ yanlışsa ‘En az bir öğrenci geçemedi’ doğrudur.",
    examples: [
      {
        level: "kolay",
        problem: "p ≡ 1, q ≡ 0 iken (p ∨ q) ⇒ q′ önermesinin doğruluk değeri nedir?",
        steps: [
          "p ∨ q = 1 ∨ 0 = 1.",
          "q′ = 1.",
          "1 ⇒ 1 = 1.",
        ],
        answer: "1 (doğru)",
      },
      {
        level: "orta",
        problem: "(p ∧ q′) ⇒ r önermesi yanlış olduğuna göre p, q, r’nin doğruluk değerleri nedir?",
        steps: [
          "Koşullu önerme yalnız 1 ⇒ 0 durumunda yanlıştır.",
          "Hüküm r ≡ 0, hipotez p ∧ q′ ≡ 1.",
          "p ∧ q′ ≡ 1 ⇒ p ≡ 1 ve q′ ≡ 1 ⇒ q ≡ 0.",
        ],
        answer: "p ≡ 1, q ≡ 0, r ≡ 0",
      },
      {
        level: "zor",
        problem: "‘Her x reel sayısı için x² + 1 > 2x’ önermesinin değilini yazınız ve doğruluk değerini belirleyiniz.",
        steps: [
          "Değil: ∃x ∈ ℝ, x² + 1 ≤ 2x.",
          "x² − 2x + 1 = (x − 1)² ≤ 0 olmalı; bu yalnız x = 1 için sağlanır.",
          "Böyle bir x var olduğundan değil önermesi doğrudur; orijinal önerme yanlıştır.",
        ],
        answer: "∃x ∈ ℝ, x² + 1 ≤ 2x (doğru, x = 1)",
      },
    ],
    osymThinking:
      "Mantık soruları genellikle kısa ama tuzaklıdır. Bir bileşik önermenin değeri verilip bilinmeyen önermelerin değerleri istenir; burada ‘yanlış olan koşullu önerme’ ya da ‘doğru olan ve bağlaçlı önerme’ gibi tek olasılıklı durumları yakalamak kilittir. Günlük dilde verilmiş koşullu cümlelerin karşıt tersini seçtiren sorularda karşıt ve ters, çeldirici olarak mutlaka yer alır. Niceleyicili önermelerde hem niceleyiciyi hem de eşitsizliği birlikte değiştirmeyi unutan öğrenci hedef alınır.",
    commonMistakes: [
      "0 ⇒ 0 ve 0 ⇒ 1 durumlarını yanlış sanmak.",
      "Karşıt (q ⇒ p) ya da tersi (p′ ⇒ q′) orijinal koşulluya denk saymak.",
      "De Morgan uygularken bağlacı değiştirmeyi unutmak.",
      "Niceleyicinin değilinde yalnız ∀’yı ∃’ye çevirip önermenin kendisini olumsuzlamamak (> yerine ≤ yazılmalı).",
      "‘>’ ifadesinin değilini ‘<’ yazmak (doğrusu ‘≤’).",
    ],
    tips: [
      "Değeri verilen bileşik önermede tek olasılıklı durumu ara: ⇒ yanlış, ∧ doğru, ∨ yanlış.",
      "Koşullu önerme gördüğünde hemen p′ ∨ q biçimine çevir; sadeleştirme kolaylaşır.",
      "Totoloji kontrolünde ‘yanlış yapabilir miyim?’ diye sor: ⇒ için hipotezi 1, hükmü 0 yapmaya çalış.",
    ],
    summary: [
      "∧: ikisi de 1 ise 1; ∨: ikisi de 0 ise 0.",
      "p ⇒ q yalnız 1 ⇒ 0 durumunda yanlış; p ⇒ q ≡ p′ ∨ q.",
      "p ⇔ q, değerler aynıysa doğru.",
      "Karşıt ters denktir; karşıt ve ters denk değildir.",
      "De Morgan ve niceleyici değilinde hem bağlaç/niceleyici hem önerme değişir.",
    ],
  },

  // ---------------------------------------------------------------- Fonksiyonlar
  {
    topicId: 'tytmat-fonksiyonlar',
    intro:
      "Fonksiyon, bir kümenin her elemanını başka bir kümenin yalnız bir elemanına eşleyen kuraldır. Bir otomatı düşün: bir düğmeye basınca hep aynı ürün gelir; bir düğmeye basınca bazen çay bazen kahve geliyorsa o otomat bir fonksiyon değildir. Tanım kümesindeki her elemanın bir ve yalnız bir görüntüsü olmalıdır.\n\nTYT’de fonksiyonlar genellikle f(x) = 2x + 1 gibi kurallarla, tablolarla ya da grafiklerle verilir. Senden f(3) gibi değerleri bulman, iki fonksiyonun bileşkesini hesaplaman, ters fonksiyonu kullanman ya da parçalı tanımlanmış bir fonksiyonu (kargo ücreti, taksi tarifesi) yorumlaman istenir.\n\nKonunun en çok kullanılan fikirleri şunlardır: f(□) yazıldığında parantez içine ne konursa x’in yerine o konur; (f∘g)(x) = f(g(x)) içten dışa hesaplanır; f⁻¹(a) = b ise f(b) = a’dır. Bu üç cümle soruların büyük kısmını çözer.",
    prerequisites: [
      "Cebirsel ifadelerde değer yerine koyma",
      "Birinci dereceden denklem çözme",
      "Koordinat düzleminde nokta okuma",
    ],
    concepts: [
      { term: "Fonksiyon", definition: "A’dan B’ye bir bağıntıda A’nın her elemanı B’nin yalnız bir elemanıyla eşleniyorsa bu bağıntı fonksiyondur." },
      { term: "Tanım ve görüntü kümesi", definition: "Tanım kümesi A’dır; görüntü kümesi f(A), yani eşlenen değerlerin kümesidir (değer kümesinin alt kümesi)." },
      { term: "Birebir fonksiyon", definition: "Farklı elemanların görüntüleri farklıdır: x₁ ≠ x₂ ⇒ f(x₁) ≠ f(x₂)." },
      { term: "Örten fonksiyon", definition: "Değer kümesinde açıkta eleman kalmaz; görüntü kümesi değer kümesine eşittir." },
      { term: "Doğrusal fonksiyon", definition: "f(x) = ax + b biçimindeki fonksiyon; grafiği bir doğrudur." },
      { term: "Bileşke fonksiyon", definition: "(f∘g)(x) = f(g(x)); önce g, sonra f uygulanır." },
      { term: "Ters fonksiyon", definition: "Birebir ve örten f için f⁻¹, eşlemeyi tersine çevirir: f(a) = b ⇔ f⁻¹(b) = a." },
      { term: "Parçalı fonksiyon", definition: "Tanım kümesinin farklı aralıklarında farklı kurallarla tanımlanan fonksiyon." },
    ],
    formulas: [
      { expr: "s(A) = m, s(B) = n ⇒ A’dan B’ye fonksiyon sayısı nᵐ", meaning: "A’nın her elemanı için n seçenek." },
      { expr: "Birebir fonksiyon sayısı (m ≤ n) = n·(n−1)·…·(n−m+1)", meaning: "Görüntüler farklı olacağı için seçenekler azalır." },
      { expr: "(f∘g)(x) = f(g(x)), genelde f∘g ≠ g∘f", meaning: "Bileşke içten dışa hesaplanır ve değişme özelliği yoktur." },
      { expr: "f(a) = b ⇔ f⁻¹(b) = a", meaning: "Ters fonksiyonun tanımı." },
      { expr: "f(x) = ax + b ⇒ f⁻¹(x) = (x − b)/a", meaning: "Doğrusal fonksiyonun tersi: işlemler ters sırada tersine çevrilir." },
      { expr: "f(x) = (ax + b)/(cx + d) ⇒ f⁻¹(x) = (−dx + b)/(cx − a)", meaning: "a ile d’nin yeri ve işareti değişir." },
    ],
    logic:
      "Fonksiyonun ‘her elemanın tek görüntüsü’ şartı, bir girdiye karşı çıktının belirsiz olmaması içindir. Grafik üzerinde bu, düşey doğru testiyle kontrol edilir: herhangi bir düşey doğru grafiği birden fazla noktada kesiyorsa aynı x’e iki y karşılık gelmiştir.\n\nBileşkenin içten dışa hesaplanması işlemlerin doğal sırasıdır: (f∘g)(2) için önce g(2)’yi buluruz, çıkan sonucu f’ye veririz. Bir ürünü önce paketleyip sonra kargolamak ile önce kargolayıp sonra paketlemek aynı şey değildir; bu yüzden bileşkede sıra önemlidir.\n\nTers fonksiyonun var olması için fonksiyonun birebir ve örten olması gerekir. Birebir değilse iki farklı girdi aynı çıktıyı verir ve geri dönerken hangisine döneceğimizi bilemeyiz. f⁻¹(a) değerini bulmak için çoğu zaman ters fonksiyonu açıkça yazmaya gerek yoktur: f(x) = a denklemini çözmek yeter.",
    examples: [
      {
        level: "kolay",
        problem: "f(x) = 3x − 4 ise f(2) + f(−1) kaçtır?",
        steps: [
          "f(2) = 6 − 4 = 2.",
          "f(−1) = −3 − 4 = −7.",
          "Toplam = 2 + (−7) = −5.",
        ],
        answer: "−5",
      },
      {
        level: "orta",
        problem: "f(x + 1) = 2x + 5 ise f(x) fonksiyonunu ve f(4) değerini bulunuz.",
        steps: [
          "x + 1 = t dersek x = t − 1.",
          "f(t) = 2(t − 1) + 5 = 2t + 3 ⇒ f(x) = 2x + 3.",
          "f(4) = 11. (Kısa yol: x + 1 = 4 ⇒ x = 3 ⇒ f(4) = 2·3 + 5 = 11.)",
        ],
        answer: "f(x) = 2x + 3, f(4) = 11",
      },
      {
        level: "zor",
        problem: "f(x) = (2x + 1)/(x − 3) ve g(x) = x + 2 ise (f⁻¹∘g)(3) kaçtır?",
        steps: [
          "g(3) = 5; istenen f⁻¹(5).",
          "f(x) = 5 ⇒ (2x + 1)/(x − 3) = 5 ⇒ 2x + 1 = 5x − 15.",
          "3x = 16 ⇒ x = 16/3.",
        ],
        answer: "16/3",
      },
    ],
    osymThinking:
      "Yeni nesil fonksiyon soruları çoğunlukla gerçek bir kural anlatır: kargo ücretinin ağırlığa göre değişmesi, taksimetre, kademeli fatura. Bunlar parçalı fonksiyondur ve soru, doğru aralığı seçip seçemediğini ölçer. Bileşke ve ters fonksiyon sorularında ise işlem sırası ve f⁻¹(a) = b ⇔ f(b) = a dönüşümü sınanır. Çeldiriciler; f∘g ile g∘f’yi karıştıran, f⁻¹(x)’i 1/f(x) sanan ya da f(x+1) ifadesinde yerine koymayı yanlış yapan öğrenciye göre hazırlanır.",
    commonMistakes: [
      "f⁻¹(x) ile 1/f(x)’i karıştırmak.",
      "(f∘g)(x) hesaplarken önce f’yi uygulamak.",
      "f(2x − 1) verilip f(3) istendiğinde x = 3 yazmak (2x − 1 = 3 çözülmeli).",
      "Parçalı fonksiyonda sınır değerinin hangi parçaya ait olduğuna (≤ ya da <) bakmamak.",
      "Birebir fonksiyon sayısında seçeneklerin azaldığını unutmak.",
    ],
    tips: [
      "f(□) içindeki ifadeyi istenen değere eşitle; fonksiyonu açıkça bulmana gerek kalmaz.",
      "f⁻¹(a) isteniyorsa f(x) = a denklemini çöz.",
      "Parçalı fonksiyonlarda önce sayının hangi aralıkta olduğunu işaretle, sonra kuralı uygula.",
    ],
    summary: [
      "Fonksiyonda tanım kümesindeki her elemanın tek görüntüsü vardır.",
      "Birebir: farklı girdiler farklı çıktılar; örten: değer kümesinde boşta eleman yok.",
      "(f∘g)(x) = f(g(x)); içten dışa hesaplanır.",
      "f(a) = b ⇔ f⁻¹(b) = a.",
      "Parçalı fonksiyonda önce aralık belirlenir.",
    ],
  },

  // ---------------------------------------------------------------- Polinomlar
  {
    topicId: 'tytmat-polinomlar',
    intro:
      "Polinom, değişkenin yalnız doğal sayı kuvvetlerinin katsayılarla çarpılıp toplanmasıyla oluşan ifadedir: P(x) = 2x³ − 5x + 7 bir polinomdur, ama x⁻¹ ya da √x içeren ifadeler polinom değildir. En büyük kuvvet polinomun derecesi, o terimin katsayısı baş katsayı, x içermeyen terim de sabit terimdir.\n\nTYT’de polinom soruları çoğunlukla ‘akıllı değer verme’ üzerine kuruludur. P(1) katsayılar toplamını, P(0) sabit terimi verir. P(x)’in x − a ile bölümünden kalan da P(a)’dır. Yani uzun uzun bölme yapmak yerine doğru sayıyı x’in yerine yazmak çoğu soruyu çözer.\n\nBu konu, çarpanlara ayırma ve denklemlerle sıkı bağlantılıdır: P(a) = 0 ise x − a, P(x)’in bir çarpanıdır ve a, P(x) = 0 denkleminin köküdür.",
    prerequisites: [
      "Üslü ifadelerle işlem",
      "Değer yerine koyma ve denklem çözme",
      "Çarpanlara ayırma temel özdeşlikleri",
    ],
    concepts: [
      { term: "Polinom", definition: "P(x) = aₙxⁿ + … + a₁x + a₀ biçiminde, üsleri doğal sayı olan ifade." },
      { term: "Derece", definition: "Sıfırdan farklı katsayılı en büyük kuvvet; der[P(x)] ile gösterilir." },
      { term: "Baş katsayı", definition: "En büyük dereceli terimin katsayısı." },
      { term: "Sabit terim", definition: "x içermeyen terim; P(0)’a eşittir." },
      { term: "Katsayılar toplamı", definition: "Tüm katsayıların toplamı; P(1)’e eşittir." },
      { term: "Kalan", definition: "P(x) = B(x)·Q(x) + K(x) eşitliğinde K(x); derecesi bölenin derecesinden küçüktür." },
      { term: "Kök / çarpan", definition: "P(a) = 0 ise a köktür ve x − a, P(x)’in çarpanıdır." },
    ],
    formulas: [
      { expr: "P(1) = katsayılar toplamı, P(0) = sabit terim", meaning: "Akıllı değer verme." },
      { expr: "P(x)’in x − a ile bölümünden kalan = P(a)", meaning: "Kalan teoremi; bölme yapmadan kalan bulunur." },
      { expr: "P(x)’in ax + b ile bölümünden kalan = P(−b/a)", meaning: "Böleni sıfır yapan değer yazılır." },
      { expr: "P(x) = B(x)·Q(x) + K(x), der K < der B", meaning: "Bölme algoritması; ikinci dereceden bölende kalan ax + b biçimindedir." },
      { expr: "der[P·Q] = der P + der Q, der[P(xᵏ)] = k·der P", meaning: "Çarpımda dereceler toplanır; x yerine xᵏ yazılınca derece k katına çıkar." },
      { expr: "der[P + Q] ≤ max(der P, der Q)", meaning: "Dereceler farklıysa büyük olana eşittir; eşitse baş terimler sadeleşebilir." },
    ],
    logic:
      "Kalan teoreminin nedeni bölme eşitliğinin kendisidir: P(x) = (x − a)·Q(x) + K. Burada kalan bir sabittir, çünkü bölen birinci derecedendir. x = a yazınca (x − a) çarpanı sıfır olur ve geriye P(a) = K kalır. Yani kalan, böleni sıfır yapan değerde polinomun aldığı değerdir.\n\nBölen ikinci dereceden, örneğin (x − 1)(x + 2) ise kalan en fazla birinci dereceden olabilir: K(x) = mx + n. Bu durumda x = 1 ve x = −2 yazarak iki denklem elde ederiz ve m ile n’yi buluruz.\n\nP(1)’in katsayılar toplamı olmasının nedeni 1’in her kuvvetinin 1 olmasıdır; her terim yalnız katsayısına dönüşür. P(0)’da ise x içeren tüm terimler sıfırlanır ve yalnız sabit terim kalır.",
    examples: [
      {
        level: "kolay",
        problem: "P(x) = 3x⁴ − 2x² + 5x − 1 polinomunun katsayılar toplamı ile sabit teriminin toplamı kaçtır?",
        steps: [
          "Katsayılar toplamı P(1) = 3 − 2 + 5 − 1 = 5.",
          "Sabit terim P(0) = −1.",
          "Toplam = 5 + (−1) = 4.",
        ],
        answer: "4",
      },
      {
        level: "orta",
        problem: "P(x) = x³ + ax² − 4x + 6 polinomu x + 2 ile tam bölünüyorsa a kaçtır?",
        steps: [
          "Tam bölünme ⇒ kalan 0 ⇒ P(−2) = 0.",
          "P(−2) = −8 + 4a + 8 + 6 = 4a + 6 = 0.",
          "a = −3/2.",
        ],
        answer: "−3/2",
      },
      {
        level: "zor",
        problem: "P(x) polinomunun x − 2 ile bölümünden kalan 7, x + 1 ile bölümünden kalan 1’dir. P(x)’in (x − 2)(x + 1) ile bölümünden kalan nedir?",
        steps: [
          "Kalan K(x) = mx + n; P(2) = 7 ve P(−1) = 1.",
          "2m + n = 7, −m + n = 1.",
          "Çıkarınca 3m = 6 ⇒ m = 2, n = 3.",
        ],
        answer: "2x + 3",
      },
    ],
    osymThinking:
      "Polinom soruları uzun bölme yapmayı değil, doğru değeri yerine koymayı ödüllendirir. Soru; P(x + 1), P(2x − 1) gibi kaydırılmış ifadelerle gizlenir ve senden sabit terim, katsayılar toplamı ya da kalan istenir. Çözümün anahtarı, istenen değeri veren x’i bulmaktır. Derece sorularında P(x²), P(x)·Q(x) gibi ifadeler öncüllerle verilir. Çeldiriciler; P(x + 1)’in sabit terimini P(1) sanan ya da kalan için böleni sıfır yapan değerin işaretini ters alan öğrenciye yöneliktir.",
    commonMistakes: [
      "x − a ile bölümden kalan için P(−a) hesaplamak.",
      "P(x + 2)’nin sabit terimi ile P(x)’in sabit terimini karıştırmak.",
      "der[P(x²)]’yi der P + 2 sanmak (2·der P olmalı).",
      "İkinci dereceden bölende kalanı sabit sanmak.",
      "Polinom olmayan ifadeleri (negatif ya da kesirli üs) polinom saymak.",
    ],
    tips: [
      "Kalan istenince böleni sıfıra eşitle, bulunan x’i polinoma yaz.",
      "P(ax + b) verilip P(k) isteniyorsa ax + b = k denklemini çöz.",
      "İkinci dereceden bölen için kalanı mx + n yazıp iki kökü tek tek yerine koy.",
    ],
    summary: [
      "Derece en büyük üstür; üsler doğal sayı olmalıdır.",
      "P(1) katsayılar toplamı, P(0) sabit terim.",
      "x − a ile bölümden kalan P(a).",
      "P(a) = 0 ⇔ x − a çarpandır.",
      "der(P·Q) = der P + der Q; der P(xᵏ) = k·der P.",
    ],
  },

  // ---------------------------------------------------------------- Permütasyon-Kombinasyon
  {
    topicId: 'tytmat-permutasyon-kombinasyon',
    intro:
      "Sayma, ‘kaç farklı yol var?’ sorusunu tek tek listelemeden cevaplama sanatıdır. Temeli iki ilkeye dayanır: ya o ya bu seçilecekse seçenekler toplanır (toplama ilkesi), hem o hem bu art arda yapılacaksa seçenekler çarpılır (çarpma ilkesi).\n\nPermütasyon, sıralamadır: seçilen nesnelerin sırası önemlidir. Bir yarışta ilk üç dereceyi belirlemek, bir şifre oluşturmak, kişileri sıraya dizmek permütasyondur. Kombinasyon ise seçmedir: sıra önemli değildir. Bir takım için 4 kişi seçmek, bir menüden 3 yemek seçmek kombinasyondur.\n\nTYT’de sorular genellikle kısıtlı sayma üzerinedir: ‘belirli kişiler yan yana olsun’, ‘rakamları farklı çift sayı’, ‘iki kişi aynı grupta olmasın’. Kısıtlı durumları önce yerleştirmek ve ‘istenmeyen durumu tümden çıkarmak’ en güçlü iki stratejidir.",
    prerequisites: [
      "Faktöriyel kavramı",
      "Çarpma ve toplama ilkeleri",
      "Sayı basamakları (rakam–sayı farkı)",
    ],
    concepts: [
      { term: "Faktöriyel", definition: "n! = n·(n − 1)·…·2·1; 0! = 1." },
      { term: "Permütasyon", definition: "n farklı nesneden r tanesinin sıralanması: P(n, r) = n!/(n − r)!." },
      { term: "Kombinasyon", definition: "n farklı nesneden sıra gözetmeksizin r tanesinin seçilmesi: C(n, r) = n!/(r!(n − r)!)." },
      { term: "Tekrarlı permütasyon", definition: "Özdeş nesneler varken sıralama: n!/(n₁!·n₂!·…)." },
      { term: "Dairesel permütasyon", definition: "n farklı nesnenin daire etrafına sıralanması: (n − 1)!." },
      { term: "Binom açılımı", definition: "(x + y)ⁿ açılımında katsayılar C(n, 0), C(n, 1), …, C(n, n)’dir; n + 1 terim vardır." },
    ],
    formulas: [
      { expr: "P(n, r) = n!/(n − r)!", meaning: "Sıralı seçim." },
      { expr: "C(n, r) = n!/(r!·(n − r)!)", meaning: "Sırasız seçim; C(n, r) = C(n, n − r)." },
      { expr: "Tekrarlı: n!/(n₁!·n₂!·…·nₖ!)", meaning: "Özdeş nesnelerin kendi arasındaki yer değiştirmeleri yeni dizilim oluşturmaz." },
      { expr: "Dairesel: (n − 1)!", meaning: "Döndürmeler aynı dizilim sayılır; bir kişi sabitlenir." },
      { expr: "Yan yana olma: (grup tek nesne) · grup içi sıralama", meaning: "Yan yana olacaklar bir blok sayılır, blok içi kendi arasında sıralanır." },
      { expr: "Genel terim: C(n, r)·xⁿ⁻ʳ·yʳ", meaning: "(x + y)ⁿ açılımında (r + 1). terim." },
    ],
    logic:
      "Permütasyon ile kombinasyon arasındaki ilişki şudur: n kişiden 3 kişilik bir kurul seçersek (kombinasyon) ve sonra bu 3 kişiyi başkan–yardımcı–sekreter olarak sıralarsak (3! yol), sıralı seçimin tamamını elde ederiz. Yani P(n, 3) = C(n, 3)·3!. Kombinasyon, permütasyonun sıra sayısına bölünmüş hâlidir.\n\nDairesel sıralamada (n − 1)! olmasının nedeni, masayı döndürdüğümüzde herkesin sağındaki ve solundaki kişinin değişmemesidir; bu yüzden bir kişiyi sabitleyip kalanları sıralarız.\n\nTekrarlı permütasyonda bölmenin nedeni, özdeş harflerin yer değiştirmesinin yeni bir kelime oluşturmamasıdır. ANKARA’daki üç A kendi arasında 3! biçimde yer değiştirse de kelime değişmez; bu yüzden 6!’i 3!’e böleriz.\n\n‘En az’ ya da ‘olmasın’ içeren sorularda tümleyen yöntemi hata riskini azaltır: tüm durumlardan istenmeyen durumları çıkarmak, parçalara bölüp toplamaktan daha güvenlidir.",
    examples: [
      {
        level: "kolay",
        problem: "5 kişi bir sıraya kaç farklı biçimde oturabilir? Belirli 2 kişi yan yana olmak şartıyla kaç farklı biçimde oturabilir?",
        steps: [
          "Kısıtsız: 5! = 120.",
          "Yan yana olacak 2 kişiyi tek blok say: 4 nesne ⇒ 4! = 24.",
          "Blok içinde 2! = 2 sıralama ⇒ 24·2 = 48.",
        ],
        answer: "120 ve 48",
      },
      {
        level: "orta",
        problem: "{1, 2, 3, 4, 5, 6} rakamlarıyla rakamları farklı üç basamaklı kaç tek sayı yazılabilir?",
        steps: [
          "Önce kısıtlı basamak: birler basamağı tek olmalı ⇒ 3 seçenek (1, 3, 5).",
          "Yüzler basamağı: kalan 5 rakamdan biri ⇒ 5 seçenek (0 yok, sorun yok).",
          "Onlar basamağı: kalan 4 rakam ⇒ 4 seçenek.",
          "3·5·4 = 60.",
        ],
        answer: "60",
      },
      {
        level: "zor",
        problem: "5 kız ve 4 erkek arasından en az 2 kızın bulunduğu 4 kişilik bir grup kaç farklı biçimde seçilebilir?",
        steps: [
          "Tüm seçimler: C(9, 4) = 126.",
          "İstenmeyen: 0 kız → C(4, 4) = 1; 1 kız → C(5, 1)·C(4, 3) = 20.",
          "126 − 1 − 20 = 105.",
        ],
        answer: "105",
      },
    ],
    osymThinking:
      "Sayma soruları genellikle bir şifre, plaka, menü seçimi, oturma düzeni ya da takım oluşturma bağlamında gelir. Soru, ‘sıra önemli mi?’ sorusunu doğru cevaplayıp cevaplayamadığını ve kısıtları doğru sırayla yerleştirip yerleştiremediğini ölçer. Rakam sorularında 0’ın başa gelememesi, harf sorularında tekrar eden harfler, masa sorularında dairesellik gizli tuzaklardır. Çeldiriciler genellikle kısıtı unutarak, ya da sıra önemli değilken permütasyon kullanarak elde edilen sayılardır.",
    commonMistakes: [
      "Seçim sorusunda (sıra önemsiz) permütasyon kullanmak.",
      "Rakam sorularında 0’ın en başa gelemeyeceğini unutmak.",
      "Yan yana olma koşulunda blok içi sıralamayı (k!) unutmak.",
      "Tekrar eden harfleri olan kelimelerde özdeşlerin faktöriyeline bölmemek.",
      "Doğrusal noktalar varken üçgen sayısından doğrusal üçlüleri çıkarmamak.",
    ],
    tips: [
      "Önce en kısıtlı yeri doldur (birler basamağı, baş harf, özel kişi).",
      "‘En az bir’ ya da ‘… olmasın’ görünce tümleyen yöntemini dene.",
      "Rakam sorularında 0 kısıtlı basamağa düşüyorsa durumu ‘0 var/0 yok’ diye ikiye ayır.",
    ],
    summary: [
      "Ya o ya bu: topla; hem o hem bu: çarp.",
      "Sıra önemliyse permütasyon, değilse kombinasyon.",
      "Tekrarlı permütasyonda özdeşlerin faktöriyeline böl.",
      "Dairesel sıralama (n − 1)!.",
      "Kısıtlıyı önce yerleştir; ‘en az’ için tümleyeni kullan.",
    ],
  },

  // ---------------------------------------------------------------- Olasılık
  {
    topicId: 'tytmat-olasilik',
    intro:
      "Olasılık, bir olayın gerçekleşme şansını 0 ile 1 arasında bir sayıyla ifade eder. 0 imkânsız olayı, 1 kesin olayı gösterir. Bir zarın 7 gelmesi imkânsızdır (0), 7’den küçük gelmesi kesindir (1), çift gelmesi ise 3/6 = 1/2 olasılıklıdır.\n\nEş olasılıklı bir deneyde olasılık, istenen durum sayısının tüm durum sayısına oranıdır. Bu yüzden olasılık, sayma bilgisine (permütasyon–kombinasyon) dayanır: önce örnek uzayı doğru saymak, sonra istenen olayın elemanlarını saymak gerekir.\n\nTYT’de olasılık soruları zar, para, torbadan top çekme, sınıftan öğrenci seçme ve tablo okuma bağlamlarında gelir. ‘En az bir’ içeren sorularda tümleyen olay, ‘ve’ ile bağlanan bağımsız olaylarda çarpma, ‘veya’ ile bağlanan olaylarda toplama (kesişimi çıkararak) kullanılır.",
    prerequisites: [
      "Permütasyon ve kombinasyon ile sayma",
      "Kesirlerle işlem",
      "Kümeler ve birleşim formülü",
    ],
    concepts: [
      { term: "Deney ve çıktı", definition: "Sonucu önceden kesin bilinemeyen işlem deneydir; her olası sonuç bir çıktıdır." },
      { term: "Örnek uzay (E)", definition: "Deneyin tüm çıktılarının kümesi. İki zar için s(E) = 36." },
      { term: "Olay", definition: "Örnek uzayın herhangi bir alt kümesi." },
      { term: "Tümleyen olay (A′)", definition: "A’nın gerçekleşmemesi; P(A′) = 1 − P(A)." },
      { term: "Ayrık olaylar", definition: "Aynı anda gerçekleşemeyen olaylar; A ∩ B = ∅." },
      { term: "Bağımsız olaylar", definition: "Birinin gerçekleşmesi diğerinin olasılığını etkilemeyen olaylar; P(A ∩ B) = P(A)·P(B)." },
      { term: "Koşullu olasılık", definition: "B gerçekleştiği bilindiğinde A’nın olasılığı: P(A | B) = P(A ∩ B)/P(B)." },
    ],
    formulas: [
      { expr: "P(A) = s(A)/s(E)", meaning: "Eş olasılıklı örnek uzayda olasılık." },
      { expr: "0 ≤ P(A) ≤ 1, P(A′) = 1 − P(A)", meaning: "Olasılık sınırları ve tümleyen." },
      { expr: "P(A ∪ B) = P(A) + P(B) − P(A ∩ B)", meaning: "Veya bağlacı; ayrık olaylarda kesişim 0’dır." },
      { expr: "Bağımsız: P(A ∩ B) = P(A)·P(B)", meaning: "Art arda bağımsız deneylerde olasılıklar çarpılır." },
      { expr: "P(A | B) = s(A ∩ B)/s(B)", meaning: "Koşullu olasılıkta örnek uzay B’ye daralır." },
      { expr: "P(en az bir) = 1 − P(hiç)", meaning: "En az bir sorularında tümleyen kullanılır." },
    ],
    logic:
      "Olasılığın ‘istenen/tüm’ olmasının dayanağı, her çıktının eşit şanslı olmasıdır. Hileli bir zarda bu oran geçersizdir; bu yüzden soruda ‘hilesiz’, ‘özdeş’, ‘rastgele’ kelimeleri önemlidir.\n\nBağımsız olaylarda olasılıkların çarpılması, çarpma ilkesinin olasılıktaki karşılığıdır: bir paranın 2 sonucu, bir zarın 6 sonucu varsa birlikte 12 eşit şanslı sonuç vardır ve ‘yazı ve 6’ bunlardan biridir: 1/2 · 1/6 = 1/12.\n\nGeri koymadan çekişlerde olaylar bağımsız değildir: ilk çekilen top torbadaki sayıyı değiştirir. Bu durumda ya ardışık olasılıklar (4/10 · 6/9) ya da kombinasyon (seçim sayısı / tüm seçimler) kullanılır; iki yol aynı sonucu verir. ‘Farklı renk’ gibi sıradan bağımsız olaylarda sıralı yöntemle çalışıyorsan iki sırayı (KM ve MK) da eklemeyi unutmamalısın.\n\nKoşullu olasılıkta verilen bilgi örnek uzayı daraltır: ‘seçilen öğrencinin gözlüklü olduğu biliniyor’ dendiğinde artık yalnız gözlüklüler arasında sayma yaparız.",
    examples: [
      {
        level: "kolay",
        problem: "Hilesiz bir zar iki kez atılıyor. Zarların üst yüzlerindeki sayıların toplamının 9 olma olasılığı kaçtır?",
        steps: [
          "s(E) = 6·6 = 36.",
          "Toplam 9: (3,6), (4,5), (5,4), (6,3) ⇒ 4 durum.",
          "P = 4/36 = 1/9.",
        ],
        answer: "1/9",
      },
      {
        level: "orta",
        problem: "Bir torbada 3 kırmızı, 5 beyaz top vardır. Geri konmadan art arda iki top çekiliyor. İkisinin de beyaz olma olasılığı kaçtır?",
        steps: [
          "İlk top beyaz: 5/8.",
          "İkinci top beyaz (bir beyaz eksildi): 4/7.",
          "P = 5/8 · 4/7 = 20/56 = 5/14. (Kontrol: C(5,2)/C(8,2) = 10/28 = 5/14.)",
        ],
        answer: "5/14",
      },
      {
        level: "zor",
        problem: "Bir öğrencinin matematik sınavını geçme olasılığı 0,8, fizik sınavını geçme olasılığı 0,6’dır ve olaylar bağımsızdır. Öğrencinin sınavlardan yalnız birini geçme olasılığı kaçtır?",
        steps: [
          "Yalnız matematik: 0,8 · 0,4 = 0,32.",
          "Yalnız fizik: 0,2 · 0,6 = 0,12.",
          "Toplam: 0,32 + 0,12 = 0,44.",
        ],
        answer: "0,44",
      },
    ],
    osymThinking:
      "Olasılık soruları tablo ya da günlük hayat bağlamıyla sunulur: bir anket tablosundan rastgele seçilen kişinin özelliği, hava durumu tahminleri, bir oyunun kazanma şansı. Soru, örnek uzayı doğru belirleyip belirlemediğini ve ‘geri koyarak/koymadan’, ‘en az bir’, ‘… olduğu bilindiğine göre’ ifadelerini doğru yorumlayıp yorumlamadığını ölçer. Koşullu olasılık sorularında paydaya tüm örnek uzayı yazan öğrenci, geri koymadan çekişte geri koyarak hesap yapan öğrenci ve ‘farklı renk’ için yalnız bir sırayı sayan öğrenci için çeldiriciler hazırlanır.",
    commonMistakes: [
      "Koşullu olasılıkta paydaya tüm örnek uzayın eleman sayısını yazmak.",
      "Geri koymadan çekişte ikinci çekişin olasılığını değiştirmemek.",
      "‘Farklı renk’ olasılığında KM ve MK sıralarından yalnız birini hesaplamak.",
      "‘En az bir’ sorularında tüm durumları tek tek toplamaya çalışıp bazılarını unutmak.",
      "Ayrık olmayan olaylarda olasılıkları kesişimi çıkarmadan toplamak.",
    ],
    tips: [
      "‘En az bir’ gördüğünde önce 1 − P(hiç) dene.",
      "Koşullu olasılıkta ‘bilindiğine göre’den sonra gelen ifade yeni örnek uzaydır.",
      "Geri koymadan çekişte kombinasyon yöntemi sıra hatasını ortadan kaldırır.",
    ],
    summary: [
      "P(A) = istenen/tüm; 0 ≤ P ≤ 1.",
      "P(A′) = 1 − P(A); en az bir için tümleyen.",
      "P(A ∪ B) = P(A) + P(B) − P(A ∩ B).",
      "Bağımsız olaylarda çarp; geri koymadan çekişte olasılıklar değişir.",
      "Koşullu olasılıkta örnek uzay daralır.",
    ],
  },

  // ---------------------------------------------------------------- Veri-İstatistik
  {
    topicId: 'tytmat-veri-istatistik',
    intro:
      "İstatistik, verileri toplama, düzenleme, özetleme ve yorumlama bilimidir. Bir sınıfın sınav notları, bir şehrin aylık sıcaklıkları, bir ailenin harcamaları gibi veri grupları tek tek incelenmek yerine birkaç sayı ve bir grafikle özetlenir.\n\nMerkezi eğilim ölçüleri (aritmetik ortalama, ortanca/medyan, tepe değer/mod) verinin ‘ortasını’, yayılım ölçüleri (açıklık, çeyrekler açıklığı, standart sapma) ise verilerin ne kadar dağınık olduğunu gösterir. İki sınıfın ortalaması aynı olabilir ama birinde notlar birbirine yakınken diğerinde çok dağınık olabilir; bu farkı standart sapma yakalar.\n\nTYT’de bu konu çoğunlukla grafik ve tablo okuma ile birleştirilir: sütun grafiği, çizgi grafiği, daire grafiği ya da frekans tablosu verilir ve ortalama, medyan, yüzde ya da açı hesabı istenir. Grafiği doğru okumak, hesabın kendisi kadar önemlidir.",
    prerequisites: [
      "Dört işlem ve ortalama kavramı",
      "Yüzde ve oran-orantı",
      "Karekök hesaplama",
    ],
    concepts: [
      { term: "Aritmetik ortalama", definition: "Veriler toplamının veri sayısına bölümü." },
      { term: "Ortanca (medyan)", definition: "Veriler küçükten büyüğe sıralandığında tam ortadaki değer; veri sayısı çiftse ortadaki iki değerin ortalaması." },
      { term: "Tepe değer (mod)", definition: "Veri grubunda en çok tekrar eden değer; hiç olmayabilir ya da birden fazla olabilir." },
      { term: "Açıklık (ranj)", definition: "En büyük değer − en küçük değer." },
      { term: "Çeyrekler", definition: "Sıralı verinin alt yarısının ortancası alt çeyrek (Q₁), üst yarısının ortancası üst çeyrek (Q₃); çeyrekler açıklığı Q₃ − Q₁." },
      { term: "Standart sapma", definition: "Verilerin ortalamadan ne kadar uzaklaştığının ölçüsü; MEB programında s = √(Σ(xᵢ − x̄)²/(n − 1)) ile hesaplanır." },
      { term: "Daire grafiği", definition: "Bütünü 360°’lik daire olarak gösterir; her dilimin merkez açısı, o dilimin bütüne oranıyla orantılıdır." },
    ],
    formulas: [
      { expr: "x̄ = (x₁ + x₂ + … + xₙ)/n", meaning: "Aritmetik ortalama; toplam = ortalama · n." },
      { expr: "Merkez açı = (dilim miktarı / toplam) · 360°", meaning: "Daire grafiğinde açı ile miktar doğru orantılıdır." },
      { expr: "s = √( Σ(xᵢ − x̄)² / (n − 1) )", meaning: "Standart sapma; büyükse veriler dağınıktır." },
      { expr: "Her veri a ile çarpılıp b eklenirse: yeni ortalama a·x̄ + b, yeni s = |a|·s", meaning: "Toplama yayılımı değiştirmez, çarpma değiştirir." },
      { expr: "Açıklık = en büyük − en küçük", meaning: "En basit yayılım ölçüsü; uç değerlerden çok etkilenir." },
    ],
    logic:
      "Ortalama tüm verileri kullanır, bu yüzden uç değerlerden çok etkilenir: 5 kişinin maaşı 20 bin TL iken biri 200 bin TL kazanıyorsa ortalama yükselir ama tipik bir kişiyi temsil etmez. Ortanca ise sıralamanın ortasına baktığı için uç değerlerden etkilenmez; bu yüzden gelir dağılımı gibi çarpık verilerde ortanca daha iyi bir özettir.\n\nHer veriye aynı sayıyı eklemek tüm grubu kaydırır ama veriler arasındaki mesafeleri değiştirmez; bu yüzden ortalama değişir, standart sapma değişmez. Her veriyi 3 ile çarpmak ise aradaki mesafeleri de 3 katına çıkarır; standart sapma da 3 katına çıkar.\n\nDaire grafiğinde açıların miktarla orantılı olması, dairenin tamamının (360°) bütünü temsil etmesinden gelir. Bir dilim bütünün 1/4’ü ise açısı 90° olur. Bu sayede açılar üzerinden oran-orantı kurulabilir; toplamı bilmeden bile iki dilimin oranı açılarının oranına eşittir.",
    examples: [
      {
        level: "kolay",
        problem: "3, 8, 5, 8, 11, 7 verilerinin ortalaması, ortancası ve tepe değeri nedir?",
        steps: [
          "Toplam = 42, n = 6 ⇒ ortalama 7.",
          "Sıralı: 3, 5, 7, 8, 8, 11 ⇒ ortanca (7 + 8)/2 = 7,5.",
          "En çok tekrar eden 8 ⇒ tepe değer 8.",
        ],
        answer: "Ortalama 7, ortanca 7,5, tepe değer 8",
      },
      {
        level: "orta",
        problem: "Bir daire grafiğinde bir ailenin aylık 30 000 TL’lik bütçesinden kiraya ayrılan pay 108°’lik dilimle gösterilmiştir. Kiraya kaç TL harcanmaktadır?",
        steps: [
          "Kira payı = 108/360 = 3/10.",
          "30 000 · 3/10 = 9 000 TL.",
        ],
        answer: "9 000 TL",
      },
      {
        level: "zor",
        problem: "Bir veri grubunun ortalaması 12, standart sapması 3’tür. Her veri 2 ile çarpılıp 5 çıkarılırsa yeni ortalama ve standart sapma ne olur?",
        steps: [
          "Yeni ortalama = 2·12 − 5 = 19.",
          "Çıkarma yayılımı değiştirmez; çarpma standart sapmayı 2 katına çıkarır.",
          "Yeni standart sapma = 2·3 = 6.",
        ],
        answer: "Ortalama 19, standart sapma 6",
      },
    ],
    osymThinking:
      "Bu konu yeni nesil soruların favorisidir: deneme netleri, market satışları, hava sıcaklıkları, aile bütçesi. Veriler çoğu zaman bir grafikle ya da tabloyla verilir ve soru önce doğru okumayı, sonra doğru ölçüyü seçmeyi ölçer. Eksik bir veriyi ortalamadan bulup ardından medyanı sormak, daire grafiğinde açıdan miktara geçmek, verilere uygulanan dönüşümün ortalama ve standart sapmayı nasıl etkilediğini sormak tipik kurgulardır. Çeldiriciler; medyanı sıralamadan bulan, toplama işleminin standart sapmayı değiştirdiğini sanan ya da açıyı 100 üzerinden yorumlayan öğrenci için hazırlanır.",
    commonMistakes: [
      "Ortancayı verileri sıralamadan ortadaki değer olarak almak.",
      "Çift sayıda veride ortancayı tek bir değer sanmak.",
      "Her veriye sabit eklemenin standart sapmayı değiştirdiğini düşünmek.",
      "Daire grafiğinde açıyı yüzde gibi okumak (90° = %90 değil, %25’tir).",
      "Frekans tablosunda değerleri frekanslarıyla çarpmadan ortalama almak.",
    ],
    tips: [
      "Ortalama verildiyse hemen toplamı bul: toplam = ortalama · n.",
      "Frekans tablosunda birikimli frekansla ortancanın hangi değere düştüğünü bul.",
      "Daire grafiğinde toplam bilinmese bile iki dilimin oranı açılarının oranıdır.",
    ],
    summary: [
      "Ortalama = toplam / n; uç değerlerden etkilenir.",
      "Ortanca sıralı verinin ortası; uç değerlerden etkilenmez.",
      "Tepe değer en çok tekrar eden değerdir.",
      "Açıklık ve standart sapma yayılımı ölçer; sabit eklemek yayılımı değiştirmez.",
      "Daire grafiğinde açı ∝ miktar; tümü 360°.",
    ],
  },
];
