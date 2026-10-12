import type { LessonSeed } from '../../domain/types';

export const lessons: LessonSeed[] = [
  // ---------------------------------------------------------------- DİZİLER
  {
    topicId: "aytmat-diziler",
    intro:
      "Diziler, sayıların belirli bir kurala göre sıraya dizilmesidir; ama matematikte bu sıralama aslında bir fonksiyondur. Tanım kümesi pozitif doğal sayılar (1, 2, 3, …) olan her fonksiyona dizi denir. Yani a₁ birinci terim, a₂ ikinci terim, aₙ de n’inci terimdir ve “n yerine ne yazarsam o terimi bulurum” mantığıyla çalışır.\n\nAYT’de dizilerin kalbi iki özel dizidir: aritmetik dizi (her adımda aynı sayı eklenir) ve geometrik dizi (her adımda aynı sayıyla çarpılır). Bu iki dizinin genel terimini, terimler arasındaki ilişkileri ve ilk n terim toplamını çok iyi bilmek gerekir. Bunlara Σ (toplam) sembolü ve özyinelemeli (rekürsif) tanımlar eşlik eder.\n\nSoruların büyük kısmı formülü ezbere uygulamaktan çok “terimler arasındaki mesafeyi” görmeyi ister: a₃ ile a₇ arasında 4 adım vardır, bu yüzden a₇ − a₃ = 4d’dir. Bu bakış açısını kazanırsan uzun sistem kurmadan birkaç satırda çözersin.\n\nSon olarak gerçek hayat problemleri (her gün biraz daha fazla koşan sporcu, her sıçrayışta yüksekliği azalan top, her saat ikiye katlanan bakteri) dizilerin en sevilen yeni nesil kılığıdır. Problemi okurken önce “sabit fark mı var, sabit oran mı?” diye sormak doğru modeli seçmenin anahtarıdır.",
    prerequisites: [
      "Fonksiyon kavramı, tanım kümesi ve f(n) değeri hesaplama",
      "Üslü ifadeler ve üslü denklemler (2ⁿ = 256 gibi)",
      "Doğrusal denklem sistemleri çözme",
      "Ardışık sayıların toplamı: 1 + 2 + … + n = n(n+1)/2",
    ],
    concepts: [
      { term: "Dizi", definition: "Tanım kümesi pozitif doğal sayılar kümesi olan fonksiyon. (aₙ) biçiminde gösterilir; aₙ genel terimdir." },
      { term: "Genel terim", definition: "Dizinin n’inci terimini n cinsinden veren kural. Örneğin aₙ = 3n − 1 ise a₁₀ = 29’dur." },
      { term: "Özyinelemeli (rekürsif) dizi", definition: "Her terimin kendinden önceki terim(ler) cinsinden tanımlandığı dizi. Örn: a₁ = 2, aₙ₊₁ = aₙ + 2n. Başlangıç terimi mutlaka verilmelidir." },
      { term: "Aritmetik dizi", definition: "Ardışık iki terim arasındaki fark sabit olan dizi: aₙ₊₁ − aₙ = d (ortak fark). Grafiği bir doğru üzerindeki noktalardır." },
      { term: "Geometrik dizi", definition: "Ardışık iki terimin oranı sabit olan dizi: aₙ₊₁ / aₙ = r (ortak çarpan), r ≠ 0. Grafiği üstel bir eğri üzerindeki noktalardır." },
      { term: "Sabit dizi", definition: "Bütün terimleri birbirine eşit olan dizi; hem d = 0 olan aritmetik hem r = 1 olan geometrik dizidir." },
      { term: "Σ (toplam sembolü)", definition: "Σₖ₌₁ⁿ aₖ ifadesi a₁ + a₂ + … + aₙ toplamını kısaca gösterir. k sayaç, alt ve üst değerler sınırlardır." },
      { term: "Aritmetik / geometrik orta", definition: "a, b, c aritmetik dizi ise b = (a + c)/2; geometrik dizi ise b² = a·c olur. Ortadaki terim uçların ortalamasıdır." },
    ],
    formulas: [
      { expr: "aₙ = a₁ + (n − 1)·d", meaning: "Aritmetik dizinin genel terimi." },
      { expr: "aₙ − aₘ = (n − m)·d", meaning: "Aritmetik dizide iki terimin farkı, aradaki adım sayısı çarpı ortak farktır." },
      { expr: "Sₙ = n·(a₁ + aₙ)/2 = n·[2a₁ + (n − 1)d]/2", meaning: "Aritmetik dizinin ilk n terim toplamı: terim sayısı × (ilk + son)/2." },
      { expr: "aₙ = a₁·rⁿ⁻¹", meaning: "Geometrik dizinin genel terimi." },
      { expr: "aₙ / aₘ = rⁿ⁻ᵐ", meaning: "Geometrik dizide iki terimin oranı, aradaki adım sayısı kadar r’nin kuvvetidir." },
      { expr: "Sₙ = a₁·(rⁿ − 1)/(r − 1), r ≠ 1", meaning: "Geometrik dizinin ilk n terim toplamı." },
      { expr: "aₙ = Sₙ − Sₙ₋₁ (n ≥ 2), a₁ = S₁", meaning: "Toplam formülünden genel terime geçiş." },
      { expr: "Σₖ₌₁ⁿ k = n(n+1)/2 ;  Σₖ₌₁ⁿ k² = n(n+1)(2n+1)/6 ;  Σₖ₌₁ⁿ c = n·c", meaning: "Σ ile en sık kullanılan hazır toplamlar." },
      { expr: "Σ(aₖ ± bₖ) = Σaₖ ± Σbₖ ;  Σ c·aₖ = c·Σaₖ", meaning: "Σ toplama ve sabitle çarpma üzerinde dağılır; ama çarpım üzerinde dağılmaz." },
      { expr: "m + n = p + q ⇒ aₘ + aₙ = aₚ + a_q (aritmetik), aₘ·aₙ = aₚ·a_q (geometrik)", meaning: "İndis toplamları eşitse terim toplamları (aritmetik) ya da terim çarpımları (geometrik) eşittir." },
    ],
    logic:
      "Aritmetik dizide her adımda aynı d eklendiği için a₁’den aₙ’ye gitmek (n − 1) adım, yani (n − 1)d kadar artış demektir. Bu yüzden formül aₙ = a₁ + (n − 1)d’dir; “n” değil “n − 1” çarpılır çünkü a₁ zaten ilk basamaktır. Toplam formülünün arkasında Gauss’un fikri vardır: ilk ve son terim, ikinci ve sondan ikinci terim … hepsi aynı toplamı verir. n terimde bu eşleştirme n/2 çift oluşturur; bu yüzden Sₙ = n(a₁ + aₙ)/2 olur.\n\nGeometrik dizide ise her adımda r ile çarptığımız için a₁’den aₙ’ye (n − 1) çarpma yapılır: aₙ = a₁·rⁿ⁻¹. Toplam formülü için Sₙ’yi r ile çarpıp Sₙ’den çıkarırsak aradaki bütün terimler sadeleşir, geriye a₁rⁿ − a₁ kalır: (r − 1)Sₙ = a₁(rⁿ − 1). İşte formül buradan gelir.\n\nSₙ − Sₙ₋₁ = aₙ bağıntısı da mantıklıdır: ilk n terimin toplamından ilk n − 1 terimin toplamını çıkarırsan geriye sadece n’inci terim kalır. Σ sembolü ise yalnızca bir kısaltmadır; toplamanın değişme ve birleşme özellikleri sayesinde Σ(aₖ + bₖ) ayrılabilir, fakat (a₁b₁ + a₂b₂) ≠ (a₁ + a₂)(b₁ + b₂) olduğu için çarpım ayrılamaz.",
    examples: [
      {
        level: "kolay",
        problem: "Bir aritmetik dizide a₄ = 10 ve a₉ = 25’tir. a₂₀ kaçtır?",
        steps: [
          "a₉ − a₄ = (9 − 4)d ⇒ 25 − 10 = 5d ⇒ d = 3.",
          "a₂₀ − a₉ = (20 − 9)d = 11·3 = 33.",
          "a₂₀ = 25 + 33 = 58.",
        ],
        answer: "58",
      },
      {
        level: "orta",
        problem: "Pozitif terimli bir geometrik dizide a₂ = 12 ve a₄ = 48’dir. İlk 6 terimin toplamı kaçtır?",
        steps: [
          "a₄ / a₂ = r² = 48/12 = 4 ⇒ terimler pozitif olduğu için r = 2.",
          "a₁ = a₂ / r = 12/2 = 6.",
          "S₆ = a₁(r⁶ − 1)/(r − 1) = 6·(64 − 1)/1 = 378.",
        ],
        answer: "378",
      },
      {
        level: "zor",
        problem: "Bir (aₙ) dizisinin ilk n terim toplamı Sₙ = 2n² − n’dir. Buna göre Σₖ₌₁¹⁰ a₂ₖ toplamı kaçtır?",
        steps: [
          "a₁ = S₁ = 1. n ≥ 2 için aₙ = Sₙ − Sₙ₋₁ = (2n² − n) − (2(n−1)² − (n−1)) = 4n − 3. n = 1 için de 1 verdiği için aₙ = 4n − 3 her n için geçerlidir.",
          "a₂ₖ = 4(2k) − 3 = 8k − 3.",
          "Σₖ₌₁¹⁰ (8k − 3) = 8·Σk − 3·10 = 8·55 − 30 = 410.",
        ],
        answer: "410",
      },
    ],
    osymThinking:
      "Sınavda dizi soruları çoğu zaman formülün doğrudan sorulmasıyla değil, bilgi saklanarak gelir: a₁ ve d verilmez, onların yerine iki terim ya da iki toplam verilir; “a₃ + a₉ = 20 ise S₁₁ kaçtır?” gibi sorular a₁ ve d’yi bulmadan, indis toplamı özelliğiyle çözülmek üzere tasarlanır. Yeni nesil sorularda ise “her gün 0,5 km fazla”, “her sıçrayışta yüksekliğin 3/4’ü” gibi ifadeler dizinin türünü gizler. Ölçülen beceri modeli seçmek, terim sayısını doğru saymak ve toplamla terimi karıştırmamaktır. Grafik ya da tablo sorularında (n, aₙ) noktalarının bir doğru üzerinde olması aritmetik diziyi, oranların sabit olması geometrik diziyi ele verir.",
    commonMistakes: [
      "Genel terimde (n − 1) yerine n kullanmak: aₙ = a₁ + n·d yazmak bir adım fazla ilerletir.",
      "Toplamı (Sₙ) sorulduğunda son terimi (aₙ) vermek ya da tam tersini yapmak.",
      "Sₙ − Sₙ₋₁ formülünü n = 1 için kontrol etmeden bütün dizi için geçerli saymak.",
      "r² = 4 gibi durumda r = −2 olasılığını unutmak ya da “pozitif terimli” bilgisini kullanmamak.",
      "Σ sembolünde terim sayısını yanlış saymak: Σₖ₌₃¹² toplamında 12 − 3 + 1 = 10 terim vardır, 9 değil.",
      "Σ(aₖ·bₖ) = (Σaₖ)(Σbₖ) sanmak.",
    ],
    tips: [
      "İki terim verilince önce “aralarında kaç adım var?” diye sor; d veya r doğrudan çıkar.",
      "Aritmetik dizide Sₙ, tek sayıda terim varsa n × (ortanca terim) olarak hesaplanabilir: S₁₁ = 11·a₆.",
      "Top sıçrama problemlerinde ilk düşüş bir kez, sonraki her yükseklik iki kez (çıkış + iniş) sayılır.",
      "Kesirli terimlerin toplamında 1/(k(k+1)) = 1/k − 1/(k+1) gibi ayırarak “teleskopik” sadeleşme ara.",
    ],
    summary: [
      "Dizi, tanım kümesi pozitif doğal sayılar olan fonksiyondur; aₙ genel terimdir.",
      "Aritmetik: aₙ = a₁ + (n−1)d, Sₙ = n(a₁ + aₙ)/2.",
      "Geometrik: aₙ = a₁·rⁿ⁻¹, Sₙ = a₁(rⁿ − 1)/(r − 1).",
      "aₙ = Sₙ − Sₙ₋₁; a₁ = S₁ ayrıca kontrol edilir.",
      "İndis toplamları eşitse: aritmetikte terim toplamları, geometrikte terim çarpımları eşittir.",
      "Σ toplama ve sabit çarpana dağılır, çarpıma dağılmaz; terim sayısı = üst − alt + 1.",
      "Gerçek hayat problemi: sabit artış → aritmetik, sabit oran → geometrik.",
    ],
  },

  // ---------------------------------------------------------------- PERMÜTASYON-KOMBİNASYON-BİNOM
  {
    topicId: "aytmat-permutasyon-kombinasyon-binom",
    intro:
      "Sayma konusu “kaç farklı şekilde?” sorusunu listeleme yapmadan cevaplamayı öğretir. Temel araç çarpma kuralıdır: bir iş art arda yapılan adımlardan oluşuyorsa her adımdaki seçenek sayıları çarpılır; birbirini dışlayan durumlar varsa sayılar toplanır.\n\nPermütasyon sıralamanın önemli olduğu, kombinasyon ise yalnızca seçimin önemli olduğu durumlardır. “Başkan ve yardımcısı seçmek” sıralıdır (permütasyon), “iki kişilik komisyon seçmek” sırasızdır (kombinasyon). Binom açılımı ise (x + y)ⁿ ifadesinin açılımındaki katsayıların aslında kombinasyon sayıları olduğunu gösterir.",
    prerequisites: [
      "Faktöriyel: n! = n·(n−1)·…·1, 0! = 1",
      "Toplama ve çarpma yoluyla sayma",
      "Üslü ifadeler ve çok terimlilerde çarpma",
    ],
    concepts: [
      { term: "Permütasyon", definition: "n farklı nesneden r tanesinin sıralı dizilişi. Sayısı P(n, r) = n!/(n − r)!." },
      { term: "Tekrarlı permütasyon", definition: "Aynı türden nesneler içeren dizilişler; özdeş nesnelerin kendi aralarındaki yer değiştirmeleri yeni diziliş oluşturmaz." },
      { term: "Dairesel permütasyon", definition: "n farklı nesnenin bir daire etrafında dizilişi: (n − 1)! Çünkü dönmeyle elde edilen dizilişler aynı sayılır." },
      { term: "Kombinasyon", definition: "n farklı nesneden sırası önemsiz r tanesinin seçimi. C(n, r) = n!/(r!(n − r)!)." },
      { term: "Binom açılımı", definition: "(x + y)ⁿ = Σₖ₌₀ⁿ C(n, k)·xⁿ⁻ᵏ·yᵏ; n + 1 terim vardır, katsayılar Pascal üçgeninin n’inci satırıdır." },
    ],
    formulas: [
      { expr: "P(n, r) = n!/(n − r)!", meaning: "Sıralı seçim sayısı." },
      { expr: "n!/(n₁!·n₂!·…·nₖ!)", meaning: "n₁, n₂, … tanesi özdeş olan n nesnenin dizilişi." },
      { expr: "(n − 1)!", meaning: "n farklı nesnenin dairesel dizilişi." },
      { expr: "C(n, r) = C(n, n − r) ; C(n, a) = C(n, b) ⇒ a = b ya da a + b = n", meaning: "Kombinasyonun simetri özelliği." },
      { expr: "Genel terim: Tₖ₊₁ = C(n, k)·xⁿ⁻ᵏ·yᵏ", meaning: "(x + y)ⁿ açılımında baştan (k + 1)’inci terim." },
      { expr: "Katsayılar toplamı = ifadede x = 1 (tüm değişkenler 1) yazılarak bulunur; sabit terim x = 0 yazılarak bulunur", meaning: "Açılım yapmadan katsayı bilgisi elde etme." },
    ],
    logic:
      "Kombinasyon ile permütasyon arasındaki bağ şöyledir: n kişiden r kişi seçip sonra bu r kişiyi sıraya koyarsak sıralı seçimi elde ederiz, yani P(n, r) = C(n, r)·r!. Seçilen r kişi kendi aralarında r! farklı şekilde sıralandığından, sırayı yok saymak için r!’e böleriz. Binom açılımında katsayının C(n, k) olmasının nedeni de budur: (x + y)ⁿ çarpımında n parantezin k tanesinden y, kalanlardan x seçilir; bu seçimin C(n, k) yolu vardır.",
    examples: [
      {
        level: "kolay",
        problem: "7 kişilik bir sınıftan bir başkan, bir başkan yardımcısı ve bir sekreter kaç farklı şekilde seçilebilir?",
        steps: [
          "Görevler farklı olduğu için sıra önemlidir: permütasyon.",
          "P(7, 3) = 7·6·5 = 210.",
        ],
        answer: "210",
      },
      {
        level: "orta",
        problem: "(x² + 2/x)⁶ açılımında x³’lü terimin katsayısı kaçtır?",
        steps: [
          "Genel terim: C(6, k)·(x²)⁶⁻ᵏ·(2/x)ᵏ = C(6, k)·2ᵏ·x¹²⁻³ᵏ.",
          "12 − 3k = 3 ⇒ k = 3.",
          "Katsayı: C(6, 3)·2³ = 20·8 = 160.",
        ],
        answer: "160",
      },
      {
        level: "zor",
        problem: "4 matematik ve 3 fizik kitabı bir rafa, aynı dersin kitapları yan yana olacak şekilde kaç farklı biçimde dizilir? (Kitaplar farklıdır.)",
        steps: [
          "Matematik ve fizik bloklarını birer nesne say: 2 blok 2! şekilde dizilir.",
          "Matematik kitapları kendi içinde 4!, fizik kitapları 3! şekilde dizilir.",
          "Toplam: 2!·4!·3! = 2·24·6 = 288.",
        ],
        answer: "288",
      },
    ],
    osymThinking:
      "Sorular genellikle “en az”, “en çok”, “yan yana”, “yan yana olmamak” gibi kısıtlarla gelir. Ölçülen beceri, sıranın önemli olup olmadığını fark etmek ve durumları eksiksiz ama çift saymadan ayırmaktır. “En az bir” gibi ifadelerde tümleyenden saymak, “yan yana” ifadelerinde bloklama yapmak ve binomda genel terimi yazıp üssü eşitlemek standart stratejilerdir.",
    commonMistakes: [
      "Sıranın önemsiz olduğu seçimde permütasyon kullanmak (ya da tersi).",
      "“En az 2 kız” gibi durumlarda önce 2 kız seçip kalanları rastgele seçerek çift saymak.",
      "Dairesel dizilişte n! kullanmak.",
      "Binom açılımında terimin katsayısına işaret (−) ve sabit çarpan kuvvetlerini dahil etmemek.",
    ],
    tips: [
      "“Yan yana” → blok yap; “yan yana olmasın” → toplamdan yan yana olanları çıkar ya da boşluk yöntemi kullan.",
      "Katsayılar toplamı için değişkenlere 1 yaz; sabit terim için genel terimde x’in üssünü 0’a eşitle.",
      "Izgara (kısa yol) problemlerinde toplam adımdan yukarı adımları seç: C(sağ + yukarı, yukarı).",
    ],
    summary: [
      "Sıra önemli → permütasyon, sıra önemsiz → kombinasyon.",
      "Özdeş nesneler varsa n!’i özdeşlerin faktöriyellerine böl; daire için (n − 1)!.",
      "C(n, r) = C(n, n − r).",
      "(x + y)ⁿ genel terimi C(n, k)xⁿ⁻ᵏyᵏ; katsayılar toplamı değişkenlere 1 yazarak bulunur.",
    ],
  },

  // ---------------------------------------------------------------- OLASILIK
  {
    topicId: "aytmat-olasilik",
    intro:
      "Olasılık, bir olayın gerçekleşme şansını 0 ile 1 arasında bir sayıyla ifade eder. Eş olumlu örnek uzayda (her sonucun şansının eşit olduğu durumlarda) olasılık, istenen durum sayısının tüm durum sayısına oranıdır. Bu yüzden olasılık soruları çoğu zaman gizli bir sayma sorusudur.\n\nAYT’de klasik olasılığın yanında tümleyen olay, birleşim kuralı, bağımsız olaylar ve koşullu olasılık sorulur. Koşullu olasılıkta örnek uzay küçülür: “seçilen öğrencinin gözlüklü olduğu biliniyorsa” dendiği anda artık yalnızca gözlüklüler arasında sayma yaparız.",
    prerequisites: [
      "Permütasyon ve kombinasyon ile sayma",
      "Kümeler: birleşim, kesişim, tümleyen",
      "Kesirlerle işlem",
    ],
    concepts: [
      { term: "Örnek uzay (E)", definition: "Bir deneyin tüm olası sonuçlarının kümesi." },
      { term: "Olay", definition: "Örnek uzayın herhangi bir alt kümesi. Boş küme imkânsız olay, E kesin olaydır." },
      { term: "Ayrık olaylar", definition: "Aynı anda gerçekleşemeyen olaylar: A ∩ B = ∅." },
      { term: "Bağımsız olaylar", definition: "Birinin gerçekleşmesi diğerinin olasılığını değiştirmiyorsa: P(A ∩ B) = P(A)·P(B)." },
      { term: "Koşullu olasılık", definition: "B’nin gerçekleştiği bilindiğinde A’nın olasılığı: P(A | B) = P(A ∩ B)/P(B)." },
    ],
    formulas: [
      { expr: "P(A) = s(A)/s(E)", meaning: "Eş olumlu örnek uzayda olasılık." },
      { expr: "P(A′) = 1 − P(A)", meaning: "Tümleyen olay; “en az bir” sorularında çok kullanılır." },
      { expr: "P(A ∪ B) = P(A) + P(B) − P(A ∩ B)", meaning: "Birleşim kuralı; ayrık olaylarda kesişim 0’dır." },
      { expr: "P(A ∩ B) = P(A)·P(B)", meaning: "Yalnızca bağımsız olaylar için." },
      { expr: "P(A | B) = P(A ∩ B)/P(B)", meaning: "Koşullu olasılık." },
    ],
    logic:
      "Olasılık bir oran olduğu için 0 ≤ P(A) ≤ 1’dir ve bir olay ile tümleyeninin olasılıkları toplamı 1’dir. Birleşim kuralında kesişimi çıkarmamızın nedeni, A ve B’nin ortak sonuçlarının iki kez sayılmasıdır. Koşullu olasılıkta bilgi, örnek uzayı daraltır: artık yalnızca B’nin sonuçları “tüm durum”dur; bu yüzden paydada P(B) vardır. Ayrık ve bağımsız kavramları sık karıştırılır: olasılıkları pozitif iki ayrık olay asla bağımsız olamaz, çünkü biri olursa diğeri kesinlikle olmaz.",
    examples: [
      {
        level: "kolay",
        problem: "İki zar atıldığında üst yüzlerdeki sayıların toplamının 10 olma olasılığı kaçtır?",
        steps: [
          "Örnek uzay 6·6 = 36 elemanlıdır.",
          "Toplamı 10 olanlar: (4,6), (5,5), (6,4) ⇒ 3 durum.",
          "P = 3/36 = 1/12.",
        ],
        answer: "1/12",
      },
      {
        level: "orta",
        problem: "Bir torbada 3 kırmızı ve 5 beyaz top vardır. Geri atılmadan art arda iki top çekiliyor. İkinci topun kırmızı olma olasılığı kaçtır?",
        steps: [
          "İlki kırmızı, ikincisi kırmızı: (3/8)·(2/7) = 6/56.",
          "İlki beyaz, ikincisi kırmızı: (5/8)·(3/7) = 15/56.",
          "Toplam: 21/56 = 3/8 (simetri nedeniyle ilk çekilişle aynıdır).",
        ],
        answer: "3/8",
      },
    ],
    osymThinking:
      "Sorular genellikle tablo, ağaç diyagramı ya da iki aşamalı deney (önce zar, sonra torba) biçiminde gelir. Ölçülen beceri, örnek uzayı doğru belirlemek ve “biliniyorsa / olduğuna göre” ifadesini koşullu olasılık olarak okumaktır. “En az bir” gördüğünde tümleyene geçmek çoğu zaman işlemi kısaltır.",
    commonMistakes: [
      "Koşullu olasılıkta paydayı tüm örnek uzay almak.",
      "Ayrık olayları bağımsız sanmak.",
      "Geri koymadan çekilişte ikinci çekilişin olasılığını değiştirmemek.",
      "“En az bir” durumunu tek tek toplarken bazı durumları unutmak.",
    ],
    tips: [
      "“Olduğuna göre / biliniyorsa” → payda koşul olan olaydır.",
      "İki aşamalı deneylerde ağaç diyagramı çiz; dal olasılıklarını çarp, sonuçları topla.",
      "“En az bir” → 1 − (hiç olmaması).",
    ],
    summary: [
      "P(A) = istenen / tüm; 0 ≤ P(A) ≤ 1.",
      "P(A′) = 1 − P(A); P(A ∪ B) = P(A) + P(B) − P(A ∩ B).",
      "Bağımsızlık: P(A ∩ B) = P(A)P(B); ayrıklık: P(A ∩ B) = 0.",
      "P(A | B) = P(A ∩ B)/P(B): örnek uzay B’ye daralır.",
    ],
  },

  // ---------------------------------------------------------------- LİMİT
  {
    topicId: "aytmat-limit",
    intro:
      "Limit, “x bir sayıya yaklaşırken f(x) hangi değere yaklaşıyor?” sorusunun cevabıdır. Önemli olan x’in o sayıya eşit olması değil, ona yaklaşmasıdır. Bu yüzden fonksiyon o noktada tanımsız olsa bile limit var olabilir; tersine, fonksiyon tanımlı olsa bile limit olmayabilir.\n\nBir noktada limitin var olması için soldan limit (x, a’ya küçük değerlerle yaklaşırken) ile sağdan limit (büyük değerlerle yaklaşırken) aynı gerçek sayıya eşit olmalıdır. Parçalı fonksiyonlarda, mutlak değerli ifadelerde ve grafik sorularında bu iki yönü ayrı ayrı incelemek zorunludur.\n\nHesaplamada ilk adım her zaman x yerine a’yı yazmaktır. Bir sayı çıkıyorsa iş biter. 0/0, ∞/∞, ∞ − ∞ gibi belirsizlikler çıkarsa çarpanlara ayırma, eşlenikle çarpma, en büyük dereceli terim parantezine alma gibi yöntemlerle ifade sadeleştirilir. Trigonometrik limitlerde ise lim(x→0) sin x / x = 1 temel taşıdır.\n\nLimit konusu türev ve integralin temelidir; süreklilik ve türev tanımının tamamı limit üzerine kuruludur. Bu yüzden burada kazanacağın cebirsel beceriler AYT’nin geri kalanında sürekli işine yarayacaktır.",
    prerequisites: [
      "Çarpanlara ayırma (iki kare farkı, üç terimli ifadeler, küp farkı)",
      "Köklü ifadelerde eşlenikle çarpma",
      "Mutlak değer ve parçalı fonksiyon tanımı",
      "Trigonometrik oranlar ve temel özdeşlikler (1 − cos 2x = 2sin²x)",
      "Fonksiyon grafiği okuma (açık/kapalı nokta)",
    ],
    concepts: [
      { term: "Soldan limit", definition: "x, a’ya a’dan küçük değerlerle yaklaşırken f(x)’in yaklaştığı değer: lim(x→a⁻) f(x)." },
      { term: "Sağdan limit", definition: "x, a’ya a’dan büyük değerlerle yaklaşırken f(x)’in yaklaştığı değer: lim(x→a⁺) f(x)." },
      { term: "Limitin varlığı", definition: "lim(x→a) f(x) = L ⇔ soldan ve sağdan limitler var ve ikisi de L’ye eşittir (L gerçek sayı)." },
      { term: "Belirsizlik", definition: "Doğrudan yerine koymada çıkan 0/0, ∞/∞, ∞ − ∞, 0·∞ gibi sonucu önceden belli olmayan ifadeler; cebirsel dönüşümle giderilir." },
      { term: "Sonsuzda limit", definition: "x → +∞ veya x → −∞ iken f(x)’in yaklaştığı değer; rasyonel fonksiyonlarda en büyük dereceli terimler belirler." },
      { term: "Sonsuz limit", definition: "x → a iken f(x)’in sınırsız büyümesi/küçülmesi: lim f(x) = ±∞. Bu durumda limit bir gerçek sayı değildir, yani “limit yoktur” (düşey asimptot)." },
      { term: "Uç noktada limit", definition: "Tanım aralığının uç noktasında yalnızca bir yönden yaklaşılabildiği için limit, o tek yönlü limite eşittir." },
    ],
    formulas: [
      { expr: "lim(x→a) f(x) = L ⇔ lim(x→a⁻) f(x) = lim(x→a⁺) f(x) = L", meaning: "Limitin var olma şartı." },
      { expr: "lim[f ± g] = lim f ± lim g ; lim[f·g] = lim f · lim g ; lim f/g = lim f / lim g (lim g ≠ 0)", meaning: "Limitler var olduğunda dört işlem özellikleri." },
      { expr: "0/0 → çarpanlara ayır ya da eşlenikle çarp, ortak çarpanı sadeleştir", meaning: "(x − a) çarpanı pay ve paydada gizlidir." },
      { expr: "lim(x→±∞) (aₙxⁿ + …)/(bₘxᵐ + …) : n < m ⇒ 0 ; n = m ⇒ aₙ/bₘ ; n > m ⇒ ±∞", meaning: "Sonsuzda rasyonel fonksiyon limiti derecelere bağlıdır." },
      { expr: "lim(x→∞) [√(ax² + bx + c) − √a·x] = b/(2√a)", meaning: "∞ − ∞ belirsizliğinde eşlenikle çarpmanın kısa sonucu (a > 0)." },
      { expr: "√(x²) = |x| ⇒ x → −∞ iken √(x²) = −x", meaning: "Eksi sonsuzda kök dışına çıkarırken işaret değişir." },
      { expr: "lim(x→0) sin(ax)/(bx) = a/b ; lim(x→0) tan(ax)/(bx) = a/b ; lim(x→0) sin(ax)/tan(bx) = a/b", meaning: "Temel trigonometrik limitler (x radyan)." },
      { expr: "lim(x→0) (1 − cos(ax))/x² = a²/2", meaning: "1 − cos ax = 2sin²(ax/2) dönüşümünden gelir." },
    ],
    logic:
      "Limitte x, a’ya “eşit olmadan” yaklaşır. Bu yüzden (x² − 4)/(x − 2) ifadesinde x ≠ 2 olduğu sürece x − 2 ≠ 0’dır ve sadeleştirme yapmak serbesttir: ifade x + 2’ye eşittir, x → 2 iken 4’e yaklaşır. 0/0 çıkması aslında pay ve paydada ortak bir (x − a) çarpanı olduğunun işaretidir; o çarpanı bulup sadeleştirmek belirsizliği yok eder.\n\n∞/∞ durumunda x çok büyüdükçe en büyük dereceli terim diğerlerini ezer: 3x² − 5x + 1 ifadesinde x = 10⁶ iken 3x² terimi yanında −5x önemsizdir. Bu yüzden oran, baş katsayıların oranına gider. ∞ − ∞ durumunda iki büyük sayının farkı ne olursa olabilir; eşlenikle çarparak farkı bir kesre çevirir, sonra ∞/∞ kuralını uygularız.\n\nTrigonometrik limitlerin temeli, birim çemberde küçük açılarda yay uzunluğu x ile sin x’in neredeyse eşit olmasıdır; bu nedenle x → 0 iken sin x / x → 1’dir. Bu yalnızca x radyan cinsinden olduğunda doğrudur.\n\nSağdan ve soldan limitin ayrı incelenmesinin nedeni, bazı fonksiyonların bir noktanın iki tarafında farklı kurallarla tanımlanmasıdır (parçalı ve mutlak değerli fonksiyonlar). İki taraf farklı değerlere gidiyorsa “tek bir yaklaşılan değer” yoktur; limit yoktur.",
    examples: [
      {
        level: "kolay",
        problem: "lim(x→3) (x² − 9)/(x² − 3x) değeri kaçtır?",
        steps: [
          "x = 3 yazınca 0/0 belirsizliği çıkar.",
          "Pay (x − 3)(x + 3), payda x(x − 3) olarak çarpanlarına ayrılır.",
          "Sadeleştirince (x + 3)/x; x = 3 için 6/3 = 2.",
        ],
        answer: "2",
      },
      {
        level: "orta",
        problem: "lim(x→−∞) (√(9x² + 1) + x)/(2x − 5) değeri kaçtır?",
        steps: [
          "x → −∞ olduğundan √(9x²) = |3x| = −3x olur; √(9x² + 1) ≈ −3x.",
          "Pay ≈ −3x + x = −2x, payda ≈ 2x.",
          "Limit = −2x/2x = −1.",
        ],
        answer: "−1",
      },
      {
        level: "zor",
        problem: "lim(x→1) (x² + ax + b)/(x² − 1) = 2 olduğuna göre a·b çarpımı kaçtır?",
        steps: [
          "Payda x → 1 iken 0’a gider; limit sonlu olduğundan pay da 0’a gitmelidir: 1 + a + b = 0 ⇒ b = −1 − a.",
          "Pay (x − 1)(x + c) biçimindedir; x = 1 kökü olduğundan x² + ax − 1 − a = (x − 1)(x + 1 + a).",
          "Sadeleştirince (x + 1 + a)/(x + 1); x = 1 için (2 + a)/2 = 2 ⇒ a = 2, b = −3.",
          "a·b = 2·(−3) = −6.",
        ],
        answer: "−6",
      },
    ],
    osymThinking:
      "Limit soruları çoğu zaman grafik üzerinden gelir: açık ve kapalı noktalar, parçalı çizgiler verilir ve soldan-sağdan limit, fonksiyon değeri ve bileşke limit birlikte sorulur. Burada ölçülen, “limit fonksiyon değerine bakmaz” fikrinin kavranmasıdır. Cebirsel sorularda ise genellikle parametre gizlenir: “limit sonlu bir değer ise” ifadesi, paydanın sıfır olduğu yerde payın da sıfır olması gerektiğini anlatan bir ipucudur. Sonsuzda limit sorularında √(x²) = |x| tuzağı ve x → −∞ işaret değişimi sık kullanılır. Gerçek hayat sorularında “uzun vadede”, “zaman ilerledikçe” ifadeleri x → ∞ limitine işaret eder.",
    commonMistakes: [
      "Limit ile fonksiyon değerini karıştırmak: f(a) tanımsız diye limitin olmadığını, ya da f(a) var diye limitin f(a) olduğunu sanmak.",
      "0/0 çıkınca “limit 0’dır” ya da “limit yoktur” demek; oysa 0/0 bir belirsizliktir, cevap değildir.",
      "x → −∞ iken √(x²)’yi x olarak dışarı almak (doğrusu −x).",
      "∞ − ∞’u 0 kabul etmek.",
      "Trigonometrik limitte sin 5x / tan 2x için 5·2 veya 2/5 yazmak; doğrusu 5/2.",
      "Mutlak değerli ifadede sağdan ve soldan limitleri ayrı incelememek.",
    ],
    tips: [
      "Her zaman önce doğrudan yerine koy; belirsizlik yoksa zaten bitti.",
      "“Limit sonlu ve payda → 0” ise pay da → 0 olmak zorundadır; bu size bir denklem verir.",
      "∞/∞’da yalnız en büyük dereceli terimlere bak, fakat köklü ifadelerde √(x²) = |x| işaretini unutma.",
      "Bileşke limitte (lim f(g(x))) iç fonksiyonun hangi değere HANGİ YÖNDEN yaklaştığını yaz, sonra dış fonksiyonda o yönde limite bak.",
    ],
    summary: [
      "Limit var ⇔ soldan limit = sağdan limit (gerçek sayı).",
      "Limit, fonksiyonun o noktadaki değerinden bağımsızdır.",
      "0/0 → çarpanlara ayır ya da eşlenikle çarp.",
      "∞/∞ → baş katsayılar ve derece karşılaştırması; ∞ − ∞ → eşlenik.",
      "x → −∞ iken √(x²) = −x.",
      "lim(x→0) sin(ax)/(bx) = a/b, (1 − cos ax)/x² → a²/2.",
      "Grafikte: açık nokta limiti, kapalı nokta fonksiyon değerini gösterir.",
    ],
  },

  // ---------------------------------------------------------------- SÜREKLİLİK
  {
    topicId: "aytmat-sureklilik",
    intro:
      "Süreklilik, kabaca bir fonksiyonun grafiğini kalemi kâğıttan kaldırmadan çizebilmektir. Ama sınavda bu sezgi yetmez; bir noktada sürekliliğin kesin tanımını bilmek gerekir: f, x = a’da sürekli ise f(a) tanımlıdır, lim(x→a) f(x) vardır ve bu limit f(a)’ya eşittir.\n\nBu üç şarttan biri bile bozulursa fonksiyon o noktada süreksizdir. Süreksizliğin türü de hangi şartın bozulduğuna göre adlandırılır: limit var ama fonksiyon değeri farklı ya da tanımsızsa kaldırılabilir süreksizlik, sağdan ve soldan limitler farklı sonlu değerlerse sıçramalı süreksizlik, limit sonsuza gidiyorsa sonsuz süreksizlik vardır.\n\nAYT’de süreklilik en çok parçalı fonksiyonlarda karşımıza çıkar: “f gerçek sayılarda sürekli ise a kaçtır?” sorusu aslında “parçaların birleştiği noktada soldan limit = sağdan limit = fonksiyon değeri” denklemini kurmanı ister. Grafik sorularında ise açık ve kapalı noktaları, boşlukları ve sıçramaları okuyarak süreksizlik noktalarını saymak gerekir.\n\nPolinomlar, sinüs ve kosinüs her yerde; rasyonel fonksiyonlar paydayı sıfır yapmayan her noktada süreklidir. Sürekli fonksiyonların toplamı, farkı, çarpımı ve (payda sıfırdan farklıyken) bölümü de süreklidir.",
    prerequisites: [
      "Sağdan ve soldan limit hesaplama",
      "Parçalı ve mutlak değerli fonksiyonlar",
      "0/0 belirsizliğini giderme",
      "İkinci dereceden denklemde diskriminant (Δ < 0 ⇒ gerçek kök yok)",
    ],
    concepts: [
      { term: "Bir noktada süreklilik", definition: "f(a) tanımlı, lim(x→a) f(x) mevcut ve lim(x→a) f(x) = f(a) ise f, x = a’da süreklidir." },
      { term: "Kaldırılabilir süreksizlik", definition: "Limit vardır ama f(a) tanımsızdır ya da limitten farklıdır. f(a) değeri limite eşit olacak şekilde yeniden tanımlanırsa süreksizlik kalkar." },
      { term: "Sıçramalı süreksizlik", definition: "Sağdan ve soldan limitler var fakat farklıdır; grafikte bir basamak/sıçrama görülür." },
      { term: "Sonsuz süreksizlik", definition: "Sağdan veya soldan limitlerden en az biri ±∞’dur; grafikte düşey asimptot vardır." },
      { term: "Soldan / sağdan süreklilik", definition: "lim(x→a⁻) f(x) = f(a) ise soldan, lim(x→a⁺) f(x) = f(a) ise sağdan süreklidir. İkisi birden sağlanırsa f, a’da süreklidir." },
      { term: "Aralıkta süreklilik", definition: "f, (a, b) aralığının her noktasında sürekli ise bu aralıkta süreklidir; [a, b]’de uçlarda tek yönlü süreklilik yeterlidir." },
      { term: "Ara değer özelliği", definition: "f, [a, b]’de sürekli ve f(a)·f(b) < 0 ise (a, b) aralığında f(c) = 0 olacak en az bir c vardır." },
    ],
    formulas: [
      { expr: "f, a’da sürekli ⇔ lim(x→a⁻) f(x) = lim(x→a⁺) f(x) = f(a)", meaning: "Süreklilik şartının pratik (üç eşitlik) hâli." },
      { expr: "Parçalı fonksiyon: sol parçanın a’daki değeri = sağ parçanın a’daki değeri = f(a)", meaning: "Birleşme noktasında süreklilik denklemi." },
      { expr: "Polinom, sin x, cos x, aˣ ⇒ ℝ’de sürekli", meaning: "Temel sürekli fonksiyonlar." },
      { expr: "p(x)/q(x) rasyonel fonksiyonu q(x) = 0 olan noktalarda süreksizdir", meaning: "Payda kökleri (sadeleşse bile) süreksizlik noktasıdır; sadeleşiyorsa kaldırılabilir türdendir." },
      { expr: "f, g sürekli ⇒ f ± g, f·g, c·f sürekli; g(a) ≠ 0 ise f/g sürekli; f∘g sürekli", meaning: "Sürekli fonksiyonlarla işlem." },
      { expr: "1/(x² + bx + c) ℝ’de sürekli ⇔ Δ = b² − 4c < 0", meaning: "Paydanın hiç sıfır olmaması şartı." },
    ],
    logic:
      "Süreklilik tanımındaki üç şart birbirini tamamlar. f(a) tanımlı olmalıdır, çünkü grafikte o noktada bir nokta olmalıdır. Limit var olmalıdır, çünkü grafiğin iki tarafı aynı yüksekliğe “ulaşmalıdır”; aksi hâlde kalemi kaldırıp başka bir yükseklikten devam etmemiz gerekir (sıçrama). Son olarak limit f(a)’ya eşit olmalıdır; iki taraf aynı yere ulaşıyor ama nokta başka bir yerde işaretlenmişse, çizim sırasında o tek noktaya gidip gelmek için yine kalemi kaldırırız (boşluk/delik).\n\nParçalı fonksiyonlarda her parça genellikle kendi aralığında süreklidir (polinom, doğru vb.), bu yüzden sürekliliği bozabilecek tek yer parçaların birleştiği noktalardır. Soldan limiti sol parçaya, sağdan limiti sağ parçaya a’yı yazarak buluruz; eşitlik kurmak parametreyi verir.\n\nRasyonel ifadede payda sıfır olan nokta tanım kümesinde olmadığı için orada f(a) yoktur, dolayısıyla fonksiyon süreksizdir. İfade sadeleşiyorsa (ortak çarpan varsa) limit vardır ve süreksizlik kaldırılabilir; sadeleşmiyorsa limit sonsuzdur. Sadeleştirip “artık sürekli” demek en sık yapılan hatadır: sadeleşmiş ifade başka bir fonksiyondur.\n\nSürekliliğin türevle ilişkisi de önemlidir: türevli olan fonksiyon süreklidir, ama sürekli olan fonksiyon türevli olmayabilir (|x| fonksiyonu x = 0’da sürekli ama köşeli olduğu için türevsizdir).",
    examples: [
      {
        level: "kolay",
        problem: "f(x) = 3x − k (x < 2) ve f(x) = x² + 1 (x ≥ 2) biçiminde tanımlı f fonksiyonu x = 2’de sürekli ise k kaçtır?",
        steps: [
          "Soldan limit: 3·2 − k = 6 − k.",
          "Sağdan limit ve f(2): 2² + 1 = 5.",
          "6 − k = 5 ⇒ k = 1.",
        ],
        answer: "1",
      },
      {
        level: "orta",
        problem: "f(x) = (x² − 4x + 3)/(x² − 1) fonksiyonunun süreksiz olduğu noktaları ve süreksizlik türlerini belirleyiniz.",
        steps: [
          "Payda x² − 1 = 0 ⇒ x = 1 ve x = −1 noktalarında f tanımsızdır, dolayısıyla süreksizdir.",
          "Sadeleştirme: (x − 1)(x − 3)/((x − 1)(x + 1)) = (x − 3)/(x + 1), x ≠ 1.",
          "x → 1 iken limit (1 − 3)/2 = −1 vardır ⇒ x = 1’de kaldırılabilir süreksizlik.",
          "x → −1 iken payda → 0, pay → −4 ⇒ limit ±∞ ⇒ x = −1’de sonsuz süreksizlik.",
        ],
        answer: "x = 1 kaldırılabilir, x = −1 sonsuz süreksizlik",
      },
      {
        level: "zor",
        problem: "f(x) = ax + b (x < 1), f(x) = x² + 2 (1 ≤ x ≤ 3), f(x) = 2bx − a (x > 3) fonksiyonu ℝ’de sürekli ise a + b kaçtır?",
        steps: [
          "Parçalar kendi aralıklarında polinom olduğu için yalnız x = 1 ve x = 3 incelenir.",
          "x = 1: a + b = 1 + 2 = 3.",
          "x = 3: 6b − a = 9 + 2 = 11.",
          "Taraf tarafa toplarsak 7b = 14 ⇒ b = 2, a = 1. a + b = 3.",
        ],
        answer: "3",
      },
    ],
    osymThinking:
      "Süreklilik soruları genellikle üç kalıpta gelir: (1) parçalı fonksiyonda parametre bulma, (2) grafikte süreksizlik noktalarını sayma ya da türünü belirleme, (3) “aşağıdakilerden hangileri kesinlikle doğrudur” biçiminde kavramsal öncüller. Grafik sorularında köşe noktaları çeldirici olarak kullanılır: köşe noktası süreksizlik değildir (türevsizliktir). İki süreksiz fonksiyonun toplamının sürekli olabileceği, ya da limitin var olup fonksiyonun yine de süreksiz olabileceği gibi ince noktalar yeni nesil soruların sevdiği temalardır. Gerçek hayatta ücret tarifeleri ve basamaklı ücretler sıçramalı süreksizliği modellemek için sık kullanılır.",
    commonMistakes: [
      "Rasyonel ifadeyi sadeleştirip sadeleşen çarpanın kökünü süreksizlik noktası olarak saymamak.",
      "Grafikteki köşe noktasını süreksizlik sanmak.",
      "Limit var diye fonksiyonun sürekli olduğunu düşünmek; f(a)’nın limite eşit olup olmadığını kontrol etmemek.",
      "Parçalı fonksiyonda eşitliğin hangi parçada olduğuna (≤ ya da <) bakmadan f(a)’yı yanlış parçadan hesaplamak.",
      "“Sürekli ⇒ türevli” sanmak.",
    ],
    tips: [
      "Parçalı fonksiyonda yalnız birleşme noktalarını incele; her birleşme noktası bir denklem verir.",
      "Grafikte: iki uç aynı yükseklikte ve nokta da orada ⇒ sürekli; açık uç ile kapalı nokta farklı yükseklikte ⇒ süreksiz.",
      "“ℝ’de sürekli” rasyonel fonksiyon ⇒ payda hiç sıfır olmamalı ⇒ Δ < 0.",
      "Toplam/çarpım fonksiyonunun sürekliliğini sorarken sağdan ve soldan limitleri ayrı ayrı topla/çarp.",
    ],
    summary: [
      "Süreklilik: f(a) tanımlı, limit var, limit = f(a).",
      "Kaldırılabilir: limit var ama ≠ f(a) veya f(a) yok.",
      "Sıçramalı: sağ ve sol limit farklı; sonsuz: limit ±∞.",
      "Parçalı fonksiyonda birleşme noktasında sol değer = sağ değer = f(a).",
      "Rasyonel fonksiyon paydanın kökünde (sadeleşse bile) süreksizdir.",
      "Köşe noktası süreklidir ama türevsizdir.",
    ],
  },
];
