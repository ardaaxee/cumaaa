import type { LessonSeed } from '../../domain/types';

export const lessons: LessonSeed[] = [
  // ---------------------------------------------------------------- Sinir sistemi
  {
    topicId: 'aytbio-sinir-sistemi',
    intro:
      "Elini sıcak bir tencereye değdirdiğinde, daha “sıcak!” diye düşünmeden elini çekersin. Bu kısa an içinde duyu nöronu uyarıyı omuriliğe taşır, ara nöron bunu motor nörona aktarır ve kol kasın kasılır. Sinir sistemi, vücudun hızlı haberleşme ağıdır: uyarıyı alır, değerlendirir ve saniyenin binde biri düzeyinde tepki üretir.\n\nBu konuda önce sinir sisteminin temel birimi olan nöronu, sonra impulsun bir nöron boyunca nasıl elektriksel olarak ilerlediğini (dinlenme potansiyeli, depolarizasyon, repolarizasyon) öğreneceğiz. Ardından impulsun bir nörondan diğerine sinapslarda kimyasal yolla nasıl aktarıldığını göreceğiz.\n\nSon olarak merkezi sinir sistemini (beyin ve omurilik) ve çevresel sinir sistemini (somatik ve otonom) inceleyeceğiz. AYT’de bu konu hem ezber bilgi hem de grafik (zar potansiyeli–zaman) ve deney yorumu şeklinde sık sorulur; mantığı oturtursan ezberin yarısı kendiliğinden gelir.",
    prerequisites: [
      "Hücre zarından madde geçişi: difüzyon, kolaylaştırılmış difüzyon ve aktif taşıma",
      "Na⁺–K⁺ pompasının ATP harcayarak iyonları derişim farkına karşı taşıması",
      "Ekzositoz ile hücre dışına madde salınması",
      "Doku çeşitleri (sinir dokusu, kas dokusu)",
    ],
    concepts: [
      { term: "Nöron", definition: "Sinir sisteminin yapı ve görev birimi; dendrit, hücre gövdesi ve aksondan oluşur. Olgun nöronlar genellikle bölünmez." },
      { term: "Dinlenme potansiyeli", definition: "Uyarılmamış nöronda zarın iç yüzeyinin dışa göre yaklaşık −70 mV negatif olması. Na⁺–K⁺ pompası ve zarın K⁺’a daha geçirgen olmasıyla korunur." },
      { term: "Depolarizasyon", definition: "Eşik değerde uyarılan zarda Na⁺ kanallarının açılıp Na⁺’un hücre içine difüzyonla girmesi; zar içi pozitifleşir (yaklaşık +30/+40 mV)." },
      { term: "Repolarizasyon", definition: "Na⁺ kanallarının kapanıp K⁺ kanallarının açılması ve K⁺’un hücre dışına çıkmasıyla zar içinin tekrar negatifleşmesi." },
      { term: "Eşik değer ve ya hep ya hiç kuralı", definition: "Impuls oluşturabilen en düşük uyarı şiddeti eşik değerdir. Eşik altı uyarı impuls oluşturmaz; eşik ve üzeri uyarılar aynı büyüklükte impuls oluşturur." },
      { term: "Sinaps", definition: "Bir nöronun akson ucu ile başka bir nöron, kas veya bez hücresi arasındaki bağlantı bölgesi. İletim nörotransmitterlerle kimyasal ve tek yönlüdür." },
      { term: "Miyelin kılıf", definition: "Aksonu saran yalıtkan yapı (çevresel sinir sisteminde Schwann hücreleri oluşturur). Impuls Ranvier boğumlarından atlayarak ilerler, iletim hızlanır." },
      { term: "Otonom sinir sistemi", definition: "İç organları istem dışı yöneten sistem; sempatik (stres, “savaş ya da kaç”) ve parasempatik (dinlenme, “sindir ve dinlen”) bölümlerden oluşur." },
    ],
    formulas: [
      { expr: "Dinlenme: Na⁺ dışarıda fazla, K⁺ içeride fazla → zar içi ≈ −70 mV", meaning: "Na⁺–K⁺ pompası her döngüde 3 Na⁺’u dışarı, 2 K⁺’u içeri taşır (ATP harcanır)." },
      { expr: "Depolarizasyon = Na⁺ içeri (difüzyon); Repolarizasyon = K⁺ dışarı (difüzyon)", meaning: "Impuls sırasında iyonlar kanallardan difüzyonla hareket eder; ATP harcanmaz. İyon dağılımını eski hâline getiren pompa ATP harcar." },
      { expr: "Uyarı < eşik → impuls yok; Uyarı ≥ eşik → aynı büyüklükte impuls", meaning: "Ya hep ya hiç kuralı. Güçlü uyarının farkı impuls büyüklüğüyle değil, impuls frekansı ve uyarılan nöron sayısıyla anlaşılır." },
      { expr: "İletim hızı: miyelinli > miyelinsiz; kalın akson > ince akson", meaning: "Miyelin sıçramalı iletim sağlar; çap arttıkça iç direnç azalır." },
      { expr: "Refleks yayı: Reseptör → duyu nöronu → ara nöron (omurilik) → motor nöron → efektör", meaning: "Omurilik refleksinde beyin karar sürecine katılmaz; bilgi daha sonra beyne iletilir." },
      { expr: "Sempatik: kalp atışı ↑, bronş genişler, göz bebeği büyür, sindirim ↓ | Parasempatik: tersi", meaning: "İki sistem çoğu organda zıt (antagonist) çalışır." },
    ],
    logic:
      "Neden impuls oluşurken ATP harcanmaz da sonrasında harcanır? Çünkü impuls, Na⁺–K⁺ pompasının önceden kurduğu iyon derişim farkının “harcanmasıdır”. Kanallar açılınca Na⁺ çok olduğu dış ortamdan içeri, K⁺ çok olduğu iç ortamdan dışarı kendiliğinden (difüzyonla) akar. Bu bir barajın kapağını açmaya benzer. Barajı yeniden doldurmak ise enerji ister: pompa ATP harcayarak iyonları eski yerlerine taşır. Bu yüzden oksijensiz kalan ya da ATP üretemeyen nöron bir süre impuls iletse de sonunda iletemez hâle gelir.\n\nSinapsta iletimin tek yönlü olmasının nedeni yapısaldır: nörotransmitter keseleri yalnızca akson ucunda, reseptörler ise yalnızca sonraki hücrenin zarındadır. Nöron boyunca impuls deneysel olarak ortadan uyarılırsa iki yöne de gidebilir; fakat sinapsı yalnız akson ucu → dendrit/gövde yönünde geçebilir.\n\nMiyelin neden hızlandırır? Miyelinli bölgelerde iyon geçişi olmaz; depolarizasyon yalnızca Ranvier boğumlarında gerçekleşir. Impuls boğumdan boğuma atlar, zarın her noktasını tek tek uyarmak gerekmez. Multipl sklerozda (MS) miyelin hasar gördüğü için iletim yavaşlar ve bozulur.",
    examples: [
      {
        level: "kolay",
        problem: "Bir nöronda impuls oluşurken zar içinin −70 mV’tan +30 mV’a çıkmasını sağlayan olay nedir?",
        steps: [
          "Zar içinin pozitifleşmesi, içeriye pozitif yük girdiğini gösterir.",
          "Dinlenme hâlinde Na⁺ derişimi dışarıda yüksektir; Na⁺ kanalları açılınca Na⁺ difüzyonla içeri girer.",
          "Bu evreye depolarizasyon denir.",
        ],
        answer: "Na⁺ iyonlarının difüzyonla hücre içine girmesi (depolarizasyon).",
      },
      {
        level: "orta",
        problem: "Bir öğrenci aynı nörona sırasıyla eşik değerin yarısı, eşik değer ve eşik değerin iki katı şiddette uyarı veriyor. Oluşan impulsların büyüklüğünü karşılaştırınız.",
        steps: [
          "Eşik altı uyarı (yarısı) impuls oluşturmaz.",
          "Eşik değer ve üzerindeki uyarılar ya hep ya hiç kuralına göre aynı büyüklükte impuls oluşturur.",
          "Yani ikinci ve üçüncü uyarının oluşturduğu impulsların genliği eşittir; güçlü uyarı ancak impuls sıklığını artırabilir.",
        ],
        answer: "1. uyarı: impuls yok; 2. ve 3. uyarı: eşit büyüklükte impuls.",
      },
      {
        level: "zor",
        problem: "Bir nöron, Na⁺–K⁺ pompasını durduran bir zehirle muamele ediliyor. Kısa süre içinde ve uzun süre sonunda impuls iletimi nasıl etkilenir?",
        steps: [
          "Pompa durunca var olan Na⁺ ve K⁺ derişim farkları hemen yok olmaz.",
          "Impuls, kanallardan difüzyonla gerçekleştiği için nöron kısa sürede birkaç impuls daha iletebilir.",
          "Her impulsta bir miktar Na⁺ içeri, K⁺ dışarı geçer; pompa bunları geri taşıyamadığından derişim farkı giderek azalır.",
          "Sonunda dinlenme potansiyeli korunamaz ve nöron impuls iletemez.",
        ],
        answer: "Kısa sürede iletim sürer; uzun sürede iyon dengesi bozulduğu için iletim durur.",
      },
    ],
    osymThinking:
      "Sorular genellikle zar potansiyeli–zaman grafiği üzerinden gelir: grafiğin hangi bölümünde Na⁺ kanallarının açık olduğunu, hangisinde K⁺’un çıktığını, ATP’nin nerede harcandığını sorar. Ayrıca “ya hep ya hiç” kuralını farklı şiddette uyarılarla deney şeklinde gizler; refleks yayında hasar gören nöronun hangisi olduğunu (duyu kaybı mı, hareket kaybı mı) yorumlatır. Otonom sistemde sempatik–parasempatik etkiler tablo ile karşılaştırılır.",
    commonMistakes: [
      "Depolarizasyon ve repolarizasyon sırasında iyonların aktif taşımayla hareket ettiğini sanmak; bu evrelerde iyonlar kanallardan difüzyonla geçer.",
      "Güçlü uyarının daha büyük impuls oluşturduğunu düşünmek (ya hep ya hiç kuralı).",
      "Sinapsta iletimin iki yönlü olabileceğini sanmak; sinaps iletimi tek yönlüdür.",
      "Refleksin beyinde işlendiğini düşünmek; omurilik refleksinde karar merkezi omuriliktir.",
      "Sempatik sistemin her organı uyardığını sanmak; sindirim kanalı hareketlerini yavaşlatır.",
    ],
    tips: [
      "“Na içeri → pozitif; K dışarı → negatif” cümlesini grafik yorumlarken ezber cümlen yap.",
      "Refleks yayı sorularında “duyu var mı, hareket var mı?” sorusunu ayrı ayrı cevapla: duyu nöronu hasarında ikisi de yoktur; motor nöron hasarında his vardır, hareket yoktur.",
      "Beyinciğin denge ve kas koordinasyonu, soğanilik (omurilik soğanı) ise yaşamsal refleksler (solunum, kalp atışı) merkezidir; ikisini karıştırma.",
    ],
    summary: [
      "Nöron: dendrit (alır) → gövde → akson (iletir); duyu, ara ve motor nöron çeşitleri vardır.",
      "Dinlenmede zar içi −70 mV; Na⁺ dışarıda, K⁺ içeride fazladır; pompa ATP harcar.",
      "Depolarizasyonda Na⁺ girer, repolarizasyonda K⁺ çıkar; eşik altı uyarı impuls oluşturmaz.",
      "Miyelin ve kalın akson iletimi hızlandırır; sinaps iletimi kimyasal ve tek yönlüdür.",
      "Merkezi sinir sistemi beyin + omurilik; refleks merkezi omuriliktir.",
      "Otonom sistemde sempatik ve parasempatik bölümler organlarda zıt etkilidir.",
    ],
  },

  // ---------------------------------------------------------------- Endokrin sistem
  {
    topicId: 'aytbio-endokrin-sistem',
    intro:
      "Sınav sabahı kalbinin hızlı çarpması, uzun süre yemek yemediğinde kan şekerinin yine de belli bir düzeyde kalması, ergenlikte vücudun değişmesi… Bunların hepsinin arkasında hormonlar vardır. Hormonlar iç salgı bezlerinden doğrudan kana verilen, kanla taşınan ve yalnızca kendilerine özgü reseptörü taşıyan hedef hücrelerde etki gösteren kimyasal habercilerdir.\n\nSinir sistemi bir telefon hattı gibi hızlı ve kısa süreli çalışırken, endokrin sistem mektup gibidir: daha yavaş ulaşır ama etkisi uzun sürer ve geniş alanı kapsar. İki sistem birbirinden bağımsız değildir; hipotalamus, sinir sistemiyle endokrin sistemi bağlayan köprüdür.\n\nBu konuda hipotalamus–hipofiz ekseni, tiroit, paratiroit, böbrek üstü bezleri, pankreas, eşeysel bezler, epifiz ve timüs gibi bezlerin hormonlarını; en önemlisi de vücudun dengesini koruyan geri bildirim mekanizmalarını öğreneceğiz. AYT’de hormon soruları çoğunlukla bir hormonun artması ya da azalması durumunda neler olacağını yorumlatır.",
    prerequisites: [
      "Hücre zarındaki reseptör proteinler ve hücreler arası iletişim",
      "Protein ve lipit (steroit) moleküllerinin genel özellikleri",
      "Sinir sisteminin genel işleyişi ve hipotalamusun konumu",
      "Homeostazi kavramı",
    ],
    concepts: [
      { term: "Hormon", definition: "Endokrin bezlerden kana salgılanan, hedef hücrelerdeki özgül reseptörlere bağlanarak etki eden düzenleyici molekül." },
      { term: "Hedef hücre", definition: "Hormona özgü reseptör taşıyan hücre. Hormon kanla tüm vücuda gitse de yalnızca hedef hücrelerde etki eder." },
      { term: "Negatif geri bildirim", definition: "Bir hormonun etkisiyle oluşan sonucun, o hormonun salgısını azaltması. Homeostazinin temel mekanizmasıdır (ör. tiroksin ↑ → TSH ↓)." },
      { term: "Pozitif geri bildirim", definition: "Sonucun, salgıyı daha da artırması. Doğumda oksitosin ve adet döngüsünde ovulasyon öncesi LH artışı örnektir." },
      { term: "Antagonist hormonlar", definition: "Aynı olayı zıt yönde etkileyen hormonlar: insülin–glukagon (kan şekeri), kalsitonin–parathormon (kan kalsiyumu)." },
      { term: "Hipotalamus", definition: "Ara beyinde yer alır; salgılatıcı ve engelleyici hormonlarla ön hipofizi denetler; ADH ve oksitosini üretip arka hipofizde depolatır." },
      { term: "Steroit hormon", definition: "Kolesterolden türeyen, lipitte çözünen hormon (östrojen, testosteron, kortizol, aldosteron). Zardan geçip hücre içindeki reseptöre bağlanır." },
    ],
    formulas: [
      { expr: "Kan şekeri ↑ → İnsülin ↑ → glikoz hücreye girer, karaciğerde glikojen yapılır → kan şekeri ↓", meaning: "İnsülin kan şekerini düşüren tek hormondur (pankreas β hücreleri)." },
      { expr: "Kan şekeri ↓ → Glukagon ↑ → glikojen yıkılır → kan şekeri ↑", meaning: "Glukagon (pankreas α hücreleri), adrenalin ve kortizol kan şekerini yükseltir." },
      { expr: "Kan Ca²⁺ ↑ → Kalsitonin (tiroit) | Kan Ca²⁺ ↓ → Parathormon (paratiroit)", meaning: "Kalsitonin Ca²⁺’u kemiğe depolatır; parathormon kemikten kana geçişi ve bağırsaktan emilimi artırır." },
      { expr: "Hipotalamus (TRH) → Ön hipofiz (TSH) → Tiroit (T₃/T₄) ⟲ negatif geri bildirim", meaning: "Tiroksin arttığında hipotalamus ve hipofizi baskılar; iyot eksikliğinde tiroksin yapılamaz, TSH artar ve guatr oluşur." },
      { expr: "ADH ↑ → böbrekte su geri emilimi ↑ → idrar az ve yoğun", meaning: "Vücut susuz kaldığında ADH artar; ADH eksikliğinde çok miktarda seyreltik idrar (şekersiz diyabet) görülür." },
      { expr: "Aldosteron ↑ → Na⁺ geri emilimi ↑ (K⁺ atılımı ↑) → kan hacmi ve basıncı ↑", meaning: "Böbrek üstü kabuğu hormonudur; su–tuz dengesini düzenler." },
    ],
    logic:
      "Hormonlar kanla vücudun her yerine taşındığı hâlde neden yalnız belirli hücreleri etkiler? Çünkü etki, hormonun kendisinde değil reseptör–hormon eşleşmesindedir. Reseptörü olmayan hücre hormonu “duymaz”. Aynı hormonun farklı dokularda farklı etki göstermesi de farklı reseptör ve hücre içi yanıtlardan kaynaklanır.\n\nVücut dengeyi neden çoğunlukla negatif geri bildirimle korur? Evdeki termostatı düşün: oda ısınınca kombi kapanır, soğuyunca açılır. Negatif geri bildirim sonucu başlangıç noktasına çeker; bu yüzden kararlıdır. Pozitif geri bildirim ise sonucu büyütür, bu yüzden yalnızca bir olayı hızla tamamlamak gerektiğinde kullanılır: doğumda rahim kasılması oksitosini, oksitosin de kasılmayı artırır; bebek doğunca döngü kırılır.\n\nHipotalamus–hipofiz ekseninin mantığı da basamaklıdır: hipotalamus küçük miktarda salgılatıcı hormon verir, ön hipofiz bunu çoğaltarak uyarıcı hormon (TSH, ACTH, FSH, LH) salgılar, hedef bez de son hormonu üretir. Son hormon yukarı basamakları baskılar. Bu yüzden bir soru “iyot eksikliğinde TSH ne olur?” diye sorarsa: tiroksin azalır → baskı kalkar → TSH artar.",
    examples: [
      {
        level: "kolay",
        problem: "Yemekten yaklaşık bir saat sonra kanda hangi hormonun miktarı artar, bu hormonun karaciğere etkisi nedir?",
        steps: [
          "Yemekten sonra bağırsaktan emilen glikozla kan şekeri yükselir.",
          "Pankreasın β hücreleri insülin salgılar.",
          "İnsülin karaciğer ve kas hücrelerinde glikozdan glikojen sentezini artırır.",
        ],
        answer: "İnsülin artar; karaciğerde glikojen depolanmasını sağlar.",
      },
      {
        level: "orta",
        problem: "Tiroit bezi ameliyatla alınmış bir bireyde TSH ve TRH düzeyleri nasıl değişir?",
        steps: [
          "Tiroit alınınca T₃/T₄ (tiroksin) üretilemez.",
          "Tiroksin normalde hipotalamus ve ön hipofizi negatif geri bildirimle baskılar.",
          "Baskı kalktığı için hipotalamus daha çok TRH, ön hipofiz daha çok TSH salgılar.",
        ],
        answer: "TRH ve TSH düzeyleri artar (dışarıdan hormon takviyesi yapılmazsa).",
      },
      {
        level: "zor",
        problem: "Bir hastada kan kalsiyumu düşük, kemik yoğunluğu normalden yüksek ve kas kramplarına eğilim var. Hangi bezde işlev azlığı düşünülür? Neden?",
        steps: [
          "Kan Ca²⁺’u düşükken kemikte kalsiyum birikmesi, kemikten kana Ca²⁺ geçişini sağlayan hormonun yetersiz olduğunu gösterir.",
          "Bu hormon parathormondur ve paratiroit bezlerinden salgılanır.",
          "Düşük Ca²⁺ sinir–kas uyarılabilirliğini artırır; kramp ve kasılmalar (tetani) görülür.",
          "Kalsitonin fazlalığı da benzer yönde etki eder; fakat seçenek olarak paratiroit işlev azlığı klasik tablodur.",
        ],
        answer: "Paratiroit bezinin az çalışması (parathormon eksikliği).",
      },
    ],
    osymThinking:
      "Sorular genellikle bir bezin çıkarılması, bir hormonun enjekte edilmesi ya da bir besin/element eksikliği senaryosu kurarak zincirleme etki sorar (iyot eksikliği → tiroksin ↓ → TSH ↑ → guatr). Grafiklerde kan şekeri ile insülin–glukagon eğrileri ters yönlü verilir. Öncüllü sorularda hormonların antagonist çiftleri, hedef organları ve sinirsel düzenlemeyle farkları karıştırılarak çeldirici hazırlanır.",
    commonMistakes: [
      "Hormonun kanla yalnızca hedef organa gittiğini sanmak; hormon tüm vücuda taşınır, yalnız hedef hücrede etki eder.",
      "ADH ve oksitosinin arka hipofizde üretildiğini düşünmek; hipotalamusta üretilip arka hipofizde depolanır ve oradan salgılanır.",
      "İyot eksikliğinde TSH’nin azaldığını sanmak; tiroksin azaldığı için TSH artar.",
      "Şekersiz diyabeti (ADH eksikliği) şeker hastalığıyla (insülin eksikliği/etkisizliği) karıştırmak.",
      "Adrenalinin yalnız sinir sisteminin nörotransmitteri olduğunu sanmak; böbrek üstü özü tarafından hormon olarak da salgılanır.",
    ],
    tips: [
      "Antagonist çiftleri kartla ezberle: insülin–glukagon, kalsitonin–parathormon.",
      "“Bez çıkarıldı / az çalışıyor” sorularında önce son hormonu, sonra geri bildirimle üst basamakları düşün.",
      "Kan şekerini yükselten birçok hormon (glukagon, adrenalin, kortizol, büyüme hormonu) varken düşüren tek hormon insülindir.",
    ],
    summary: [
      "Hormonlar kana salgılanır, hedef hücredeki reseptöre bağlanarak yavaş ama uzun süreli etki gösterir.",
      "Hipotalamus ön hipofizi salgılatıcı hormonlarla yönetir; ADH ve oksitosini üretir.",
      "İnsülin kan şekerini düşürür; glukagon yükseltir. Kalsitonin Ca²⁺’u düşürür; parathormon yükseltir.",
      "Böbrek üstü kabuğu: kortizol, aldosteron; öz bölgesi: adrenalin, noradrenalin.",
      "Homeostazi çoğunlukla negatif geri bildirimle korunur; doğum ve ovulasyon pozitif geri bildirim örnekleridir.",
      "İyot eksikliği → tiroksin ↓ → TSH ↑ → guatr.",
    ],
  },

  // ---------------------------------------------------------------- Duyu organları
  {
    topicId: 'aytbio-duyu-organlari',
    intro:
      "Duyu organları, çevreden gelen ışık, ses, kimyasal madde, basınç ve sıcaklık gibi uyarıları alan reseptörleri taşır. Reseptörler bu uyarıları impulsa dönüştürür; ancak “görme”, “duyma” ya da “tat alma” algısı beyin kabuğundaki ilgili merkezde oluşur. Yani göz görür gibi düşünsek de aslında gören beyindir.\n\nBu konuda göz, kulak, burun, dil ve deriyi; her birinde uyarının nasıl algılandığını ve sık görülen kusurları öğreneceğiz.",
    prerequisites: [
      "Nöronun yapısı ve impuls iletimi",
      "Beyin kabuğundaki (serebrum) lobların genel görevleri",
      "Merceklerde ışığın kırılması (ince ve kalın kenarlı mercek)",
    ],
    concepts: [
      { term: "Retina", definition: "Gözün en iç tabakası; ışığa duyarlı çubuk (loş ışık, siyah–beyaz) ve koni (parlak ışık, renk) hücrelerini içerir." },
      { term: "Sarı benek", definition: "Koni hücrelerinin en yoğun olduğu, görüntünün en net algılandığı retina bölgesi." },
      { term: "Kör nokta", definition: "Görme sinirinin gözden çıktığı, reseptör bulunmayan retina bölgesi; buraya düşen görüntü algılanmaz." },
      { term: "Uyum (akomodasyon)", definition: "Kirpiksi cisim kaslarının göz merceğinin kalınlığını değiştirerek yakın ve uzak cisimlerin netleştirilmesi." },
      { term: "Korti organı", definition: "İç kulakta salyangozda bulunan, ses titreşimlerini algılayan tüylü reseptör hücreleri içeren yapı." },
      { term: "Yarım daire kanalları", definition: "İç kulakta dönme hareketlerini ve dengeyi algılayan, sıvı dolu kanallar." },
    ],
    formulas: [
      { expr: "Miyop: görüntü retinanın önüne düşer → ince kenarlı (ıraksak) mercek", meaning: "Göz küresi uzun ya da mercek fazla kırıcıdır; uzağı net göremez." },
      { expr: "Hipermetrop: görüntü retinanın arkasına düşer → kalın kenarlı (yakınsak) mercek", meaning: "Göz küresi kısadır; yakını net göremez." },
      { expr: "Ses: kulak zarı → çekiç → örs → üzengi → oval pencere → salyangoz sıvısı → Korti organı → işitme siniri", meaning: "İşitme yolu sırası; algı beyin kabuğunun şakak lobunda oluşur." },
    ],
    logic:
      "Işık ya da ses bir “bilgi” değil, bir enerji biçimidir. Reseptör hücreler bu enerjiyi zar potansiyeli değişimine, yani impulsa çevirir. Her reseptör kendine özgü uyarıya duyarlıdır; bu yüzden gözden giden impuls şakak lobuna değil görme merkezine (art kafa lobu) gider ve orada görüntü olarak yorumlanır. Denge ve işitme aynı organda (iç kulak) bulunmasına rağmen farklı reseptörlerle algılanır; bu da kulak iltihaplarında hem işitme hem denge sorunlarının görülmesini açıklar.",
    examples: [
      {
        level: "kolay",
        problem: "Karanlık bir odaya girdikten bir süre sonra çevredeki eşyaların renklerini ayırt edemeyip yalnızca şekillerini görmemizin nedeni nedir?",
        steps: [
          "Loş ışıkta renk algılayan koni hücreleri yeterince uyarılamaz.",
          "Loş ışığa duyarlı çubuk hücreler ise siyah–beyaz görüntü sağlar.",
        ],
        answer: "Loş ışıkta çubuk hücreler çalışır; koni hücreler uyarılmadığı için renk ayırt edilemez.",
      },
      {
        level: "orta",
        problem: "Orta kulaktaki kemikçikleri kireçlenerek hareketsiz kalmış bir kişide hangi duyu nasıl etkilenir?",
        steps: [
          "Kemikçikler kulak zarındaki titreşimi iç kulağa iletir ve güçlendirir.",
          "Hareketsiz kemikçikler titreşimi iletemez; salyangoza ulaşan ses azalır.",
          "Denge reseptörleri iç kulakta olduğundan denge doğrudan etkilenmez.",
        ],
        answer: "İletim tipi işitme kaybı görülür; denge etkilenmez.",
      },
    ],
    osymThinking:
      "Sorular çoğunlukla yapı–görev eşleştirmesi ve kusur–düzeltme ilişkisi üzerinden gelir. Bir yapının hasar görmesi durumunda hangi algının etkileneceği (işitme mi, denge mi; renk mi, loş görme mi) sorulur. Göz kusurlarında görüntünün retinaya göre konumu ve kullanılacak mercek tipi karıştırılarak çeldirici hazırlanır.",
    commonMistakes: [
      "Miyopide kalın kenarlı mercek kullanıldığını sanmak; miyopi ince kenarlı (ıraksak) mercekle düzeltilir.",
      "Görme ve işitme algısının göz ve kulakta oluştuğunu düşünmek; algı beyin kabuğunda oluşur.",
      "Kör noktayı sarı benekle karıştırmak; sarı benekte görüntü en net, kör noktada hiç algılanmaz.",
      "Östaki borusunun işitme reseptörü içerdiğini sanmak; görevi orta kulakla dış ortam arasındaki basıncı dengelemektir.",
    ],
    tips: [
      "“Miyop – uzağı göremez – ince kenar” üçlüsünü birlikte ezberle.",
      "Koni = renk ve netlik (gündüz), çubuk = loş ışık; A vitamini eksikliği çubuk işlevini bozar (gece körlüğü).",
      "İç kulak = işitme (salyangoz) + denge (yarım daire kanalları, dehliz).",
    ],
    summary: [
      "Reseptörler uyarıyı impulsa çevirir; algı beyin kabuğunda oluşur.",
      "Retinada koniler renk, çubuklar loş ışık görmesini sağlar; kör noktada reseptör yoktur.",
      "Miyopi ince kenarlı, hipermetropi kalın kenarlı mercekle düzeltilir.",
      "İç kulak işitme ve dengeden sorumludur; orta kulak kemikçikleri titreşimi iletir.",
      "Koku ve tat kimyasal reseptörlerle, dokunma–sıcaklık–ağrı deri reseptörleriyle algılanır.",
    ],
  },

  // ---------------------------------------------------------------- Destek ve hareket
  {
    topicId: 'aytbio-destek-hareket',
    intro:
      "Merdiven çıkarken kemiklerin vücuduna destek olur, eklemlerin bükülür, kasların kasılıp gevşeyerek bu kemikleri hareket ettirir. Destek ve hareket sistemi kemik, kıkırdak, eklem ve kaslardan oluşur. Kemikler aynı zamanda kan hücresi üretir (kırmızı kemik iliği) ve kalsiyum–fosfor deposudur.\n\nBu konuda kemik ve kıkırdak dokunun yapısını, eklem çeşitlerini, üç kas tipini ve özellikle iskelet kasının kayan iplikler modeline göre nasıl kasıldığını öğreneceğiz.",
    prerequisites: [
      "Bağ dokusu ve kas dokusunun genel özellikleri",
      "ATP’nin yapısı ve hücresel solunumla üretimi",
      "Sinir–kas kavşağında impuls iletimi",
    ],
    concepts: [
      { term: "Sarkomer", definition: "İki Z çizgisi arasındaki bölge; iskelet kasının kasılma birimidir." },
      { term: "Aktin ve miyozin", definition: "Kas lifindeki ince (aktin) ve kalın (miyozin) protein iplikler. Kasılmada iplikler kısalmaz, birbiri üzerinde kayar." },
      { term: "Epifiz plağı (büyüme kıkırdağı)", definition: "Uzun kemiklerde kemiğin boyca uzamasını sağlayan kıkırdak bölge; ergenlik sonrası kemikleşir." },
      { term: "Periost (kemik zarı)", definition: "Kemiği saran zar; kemiğin enine büyümesini ve kırık onarımını sağlar." },
      { term: "Oynar eklem", definition: "Kemik uçlarının kıkırdakla kaplı olduğu, eklem sıvısı içeren hareketli eklem (diz, dirsek, omuz)." },
      { term: "Kas yorgunluğu", definition: "Yoğun çalışmada oksijen yetersiz kalınca laktik asit fermantasyonu artar ve kasta laktik asit birikir." },
    ],
    formulas: [
      { expr: "Kasılmada: I bandı ↓, H bandı ↓, sarkomer ↓; A bandı değişmez", meaning: "A bandı miyozin boyudur; miyozin kısalmadığı için A bandı sabit kalır." },
      { expr: "Kasılma: impuls → Ca²⁺ sarkoplazmik retikulumdan salınır → miyozin başı aktine bağlanır → ATP ile kayma", meaning: "Gevşemede Ca²⁺ ATP harcanarak geri pompalanır." },
      { expr: "ATP kaynakları: kreatin fosfat → oksijensiz solunum → oksijenli solunum", meaning: "Kısa ve ani çabada kreatin fosfat, uzun süreli çabada oksijenli solunum ön plandadır." },
    ],
    logic:
      "Kas kasılırken ipliklerin boyu değişmez; aktinler miyozinlerin üzerinde sarkomerin ortasına doğru kayar. Bu nedenle sadece aktin ile miyozinin örtüşmediği bölgeler (I ve H bantları) daralır, miyozinin tamamını içeren A bandı değişmez. Kasılmayı başlatan Ca²⁺ iyonlarıdır; hem kasılma (miyozin başının hareketi) hem de gevşeme (Ca²⁺’un geri pompalanması) ATP ister. Bu yüzden ölümden sonra ATP tükenince miyozin aktinden ayrılamaz ve kaslar sertleşir (ölüm katılığı).",
    examples: [
      {
        level: "kolay",
        problem: "İskelet kası kasıldığında sarkomerdeki A bandı, I bandı ve H bandının boyları nasıl değişir?",
        steps: [
          "Kasılmada aktin iplikler miyozin üzerinde sarkomerin ortasına kayar.",
          "Örtüşmeyen bölgeler olan I ve H bantları kısalır; A bandı miyozin boyuna eşit olduğundan değişmez.",
        ],
        answer: "A bandı değişmez; I ve H bantları kısalır.",
      },
      {
        level: "orta",
        problem: "Bir çocuğun uzun kemiklerindeki epifiz plakları erken kemikleşirse ne olur?",
        steps: [
          "Kemiğin boyca uzaması epifiz plağındaki kıkırdağın çoğalıp kemikleşmesiyle olur.",
          "Plak erken kemikleşirse uzama durur; enine büyüme (periost) sürse de boy uzaması gerçekleşmez.",
        ],
        answer: "Kemiğin boyca uzaması erken durur; kişi olması gerekenden kısa boylu kalır.",
      },
    ],
    osymThinking:
      "Sorular sarkomer şeması ve bant uzunluklarının kasılma sırasında nasıl değiştiğini sorar. Kas tiplerini (düz, kalp, iskelet) çekirdek sayısı, çizgili olup olmaması ve istemli olup olmama bakımından tabloyla karşılaştırır. Enerji kaynakları, egzersiz süresi–kaynak grafikleriyle yorumlatılır.",
    commonMistakes: [
      "Kasılmada aktin ve miyozin ipliklerinin kısaldığını sanmak; iplikler kısalmaz, kayar.",
      "Kasılmada A bandının da kısaldığını düşünmek.",
      "Kalp kasının istemli olduğunu düşünmek; kalp kası çizgili ama istemsizdir.",
      "Gevşemenin enerji gerektirmediğini sanmak; Ca²⁺’un geri pompalanması ve miyozinin ayrılması ATP ister.",
    ],
    tips: [
      "“A bandı Aynı kalır” diye hatırla.",
      "Kas tipleri: iskelet = çizgili + istemli + çok çekirdekli; kalp = çizgili + istemsiz + tek/iki çekirdekli; düz = çizgisiz + istemsiz + tek çekirdekli.",
    ],
    summary: [
      "Kemik destek, koruma, kan hücresi üretimi ve mineral depolama görevi yapar.",
      "Boyca uzama epifiz plağında, enine büyüme periostta gerçekleşir.",
      "Eklemler oynamaz, yarı oynar ve oynar olarak üçe ayrılır.",
      "Kasılmada aktin miyozin üzerinde kayar; I ve H bantları kısalır, A bandı değişmez.",
      "Kasılma ve gevşeme ATP ister; Ca²⁺ kasılmayı başlatır.",
    ],
  },

  // ---------------------------------------------------------------- Sindirim
  {
    topicId: 'aytbio-sindirim',
    intro:
      "Yediğin bir dilim peynirli ekmek, hücrelerinin kullanabileceği hâle gelmeden önce uzun bir yolculuk yapar. Ekmekteki nişasta, peynirdeki protein ve yağ, hücre zarından geçemeyecek kadar büyük moleküllerdir. Sindirim sistemi bu büyük molekülleri önce mekanik olarak parçalar, sonra enzimlerle hidroliz ederek monomerlerine (glikoz, amino asit, yağ asidi ve gliserol) ayırır.\n\nKimyasal sindirim ağızda karbonhidratlarla başlar, midede proteinlerle devam eder ve ince bağırsakta tamamlanır. İnce bağırsak aynı zamanda emilimin büyük kısmının gerçekleştiği yerdir; bunu kıvrımlar, villuslar ve mikrovilluslarla genişleyen yüzeyine borçludur.\n\nKaraciğerin ürettiği safra ve pankreas özsuyu sindirimin kilit yardımcılarıdır. Bu konuda hangi besinin nerede, hangi enzimle, hangi pH’ta sindirildiğini; emilimin nasıl olduğunu ve sindirimin sinirsel–hormonal olarak nasıl düzenlendiğini öğreneceğiz. AYT’de bu konu özellikle deney tüpü, grafik ve tablo sorularına çok uygundur.",
    prerequisites: [
      "Karbonhidrat, protein ve yağların yapısı; dehidrasyon ve hidroliz",
      "Enzimlerin özellikleri: özgüllük, pH ve sıcaklık etkisi",
      "Difüzyon, kolaylaştırılmış difüzyon, aktif taşıma",
      "Hormon ve otonom sinir sisteminin genel işleyişi",
    ],
    concepts: [
      { term: "Mekanik sindirim", definition: "Besinlerin çiğneme, mide ve bağırsak hareketleri ve safranın yağları emülsiyonlaştırmasıyla küçük parçalara ayrılması. Kimyasal bağ kırılmaz, enzim kullanılmaz." },
      { term: "Kimyasal sindirim", definition: "Büyük moleküllerin enzimler aracılığıyla su kullanılarak (hidroliz) yapı birimlerine ayrılması." },
      { term: "Pepsinojen–pepsin", definition: "Mide bezlerinden etkisiz pepsinojen olarak salgılanır; HCl ile aktif pepsine dönüşür ve proteinleri polipeptitlere parçalar." },
      { term: "Safra", definition: "Karaciğerde üretilip safra kesesinde depolanan, enzim içermeyen salgı. Yağları emülsiyonlaştırır (mekanik sindirim) ve ortamı bazikleştirmeye yardım eder." },
      { term: "Villus", definition: "İnce bağırsak iç yüzeyindeki parmak şeklindeki çıkıntılar; içlerinde kan kılcalları ve lenf kılcalı (lakteal) bulunur, emilim yüzeyini artırır." },
      { term: "Tripsinojen–tripsin", definition: "Pankreastan etkisiz olarak salgılanır; ince bağırsakta enterokinaz ile aktifleşir, proteinleri parçalar." },
      { term: "Sekretin ve gastrin", definition: "Gastrin mide öz suyu salgısını artırır; sekretin ince bağırsaktan salgılanır ve pankreasın bikarbonatlı salgısını uyarır." },
    ],
    formulas: [
      { expr: "Nişasta → (tükürük/pankreas amilazı) → maltoz → (maltaz) → glikoz", meaning: "Karbonhidrat sindirimi ağızda başlar, ince bağırsakta tamamlanır; midede karbonhidrat sindirilmez." },
      { expr: "Protein → (pepsin, midede) → polipeptit → (tripsin, kimotripsin, peptidazlar) → amino asit", meaning: "Protein sindirimi midede başlar, ince bağırsakta tamamlanır." },
      { expr: "Yağ → (safra: emülsiyon) → küçük damlacık → (lipaz) → yağ asidi + gliserol (monogliserit)", meaning: "Yağların kimyasal sindirimi yalnızca ince bağırsakta ve pankreas lipazıyla etkin biçimde olur." },
      { expr: "Glikoz, amino asit → kan kılcalı → kapı toplardamarı → karaciğer", meaning: "Suda çözünen besinler önce karaciğere gider." },
      { expr: "Yağ asidi + gliserol → villusta yeniden yağ (şilomikron) → lenf kılcalı → lenf → kan", meaning: "Yağlar ve yağda çözünen vitaminler (A, D, E, K) büyük oranda lenf yoluyla taşınır." },
      { expr: "Ağız pH ≈ 7 | Mide pH ≈ 2 | İnce bağırsak pH ≈ 8", meaning: "Her enzim kendi ortam pH’ında en iyi çalışır; pepsin asidik, tripsin bazik ortamda etkindir." },
    ],
    logic:
      "Neden sindirim gerekir? Çünkü hücre zarı büyük polimerlerin geçmesine izin vermez; ayrıca her canlının proteinleri kendine özgüdür. Yediğimiz proteini doğrudan kullanamayız; önce amino asitlerine ayırıp kendi proteinlerimizi yaparız. Sindirim bu yüzden hidrolizdir: her bağ kırılırken bir molekül su harcanır.\n\nNeden bazı enzimler etkisiz (zimojen) olarak salgılanır? Pepsin ve tripsin protein sindiren enzimlerdir; eğer salgılandıkları hücrede aktif olsalardı hücrenin kendi proteinlerini sindirirlerdi. Bu yüzden pepsinojen mide boşluğunda HCl ile, tripsinojen bağırsak boşluğunda enterokinazla aktifleşir. Mide duvarını ise mukus korur.\n\nİnce bağırsak neden hem sindirimin hem emilimin merkezidir? Mideden gelen asidik besin lapası sekretin salgısını tetikler; pankreas bikarbonat salgılayarak ortamı bazikleştirir ve pankreas enzimleri çalışmaya başlar. Safra yağ damlalarını küçülterek lipazın etki yüzeyini artırır. Sindirilen monomerler, kıvrım–villus–mikrovillus sayesinde çok geniş bir yüzeyden emilir. Kalın bağırsakta ise enzimle sindirim olmaz; su, mineral ve bakterilerin ürettiği bazı vitaminler (K, bazı B vitaminleri) emilir.",
    examples: [
      {
        level: "kolay",
        problem: "Midede hangi besin grubunun kimyasal sindirimi başlar ve bu sindirimde görev alan enzim nasıl aktifleşir?",
        steps: [
          "Midede kimyasal sindirimi başlayan besin grubu proteinlerdir.",
          "Mide bezleri pepsinojen salgılar.",
          "Pepsinojen, mide öz suyundaki HCl ile aktif pepsine dönüşür.",
        ],
        answer: "Proteinler; pepsinojen HCl ile pepsine dönüşür.",
      },
      {
        level: "orta",
        problem: "Safra kesesi alınmış bir hastaya neden az yağlı beslenmesi önerilir?",
        steps: [
          "Safra karaciğerde üretilir, kesede depolanır ve yağlı besin geldiğinde yoğun biçimde bağırsağa verilir.",
          "Kese alınınca safra sürekli ve az miktarda akar; yağlı öğünde yeterli safra bir anda sağlanamaz.",
          "Emülsiyon yetersiz olunca lipazın etki yüzeyi azalır, yağ sindirimi ve emilimi yavaşlar.",
        ],
        answer: "Yağların emülsiyonu (mekanik sindirimi) yetersiz kalacağı için yağ sindirimi zorlaşır.",
      },
      {
        level: "zor",
        problem: "Üç deney tüpüne eşit miktarda haşlanmış yumurta akı konuyor. 1. tüpe pepsin + HCl (pH 2), 2. tüpe pepsin + NaHCO₃ (pH 8), 3. tüpe tripsin + NaHCO₃ (pH 8) ekleniyor; tüpler 37 °C’de bekletiliyor. Hangi tüplerde protein sindirimi gözlenir?",
        steps: [
          "Pepsin asidik ortamda (pH ≈ 2) etkindir: 1. tüpte sindirim olur.",
          "Pepsin bazik ortamda çalışmaz: 2. tüpte sindirim gözlenmez.",
          "Tripsin bazik ortamda (pH ≈ 8) etkindir: 3. tüpte sindirim olur.",
          "Sıcaklık vücut sıcaklığında olduğu için tek değişken pH ve enzim türüdür.",
        ],
        answer: "1. ve 3. tüplerde sindirim gözlenir; 2. tüpte gözlenmez.",
      },
    ],
    osymThinking:
      "ÖSYM tarzı sorular sindirimi çoğunlukla deney tüpleriyle (enzim + pH + sıcaklık değişkenleri), sindirim kanalı boyunca besin miktarının değiştiği grafiklerle ya da bir organın/enzimin işlevsiz kalması senaryosuyla sorar. “Hangi besin nerede ilk kez kimyasal sindirime uğrar, nerede tamamlanır?” sorusunu grafikle gizler: grafikte miktarı ağızda azalmaya başlayan besin nişasta, midede azalmaya başlayan protein, yalnızca ince bağırsakta azalan yağdır.",
    commonMistakes: [
      "Safranın enzim içerdiğini sanmak; safra enzim içermez, yağları emülsiyonlaştırır (mekanik sindirim).",
      "Midede karbonhidrat ve yağ sindirildiğini düşünmek; midede kimyasal sindirim büyük oranda proteinlerle sınırlıdır.",
      "Yağların emildikten sonra doğrudan kana ve karaciğere gittiğini sanmak; büyük kısmı lenf yoluyla taşınır.",
      "Kalın bağırsakta enzimatik sindirim yapıldığını sanmak; kalın bağırsakta su ve mineral emilimi olur.",
      "Pepsinin her pH’ta çalıştığını düşünmek; bazik ortamda etkisizdir.",
    ],
    tips: [
      "Grafik sorusunda “ilk azalan yer” besinin kimyasal sindiriminin başladığı yeri gösterir: nişasta → ağız, protein → mide, yağ → ince bağırsak.",
      "“Enzim etkisiz salgılanıyorsa protein sindiren enzimdir” diye düşün: pepsinojen, tripsinojen.",
      "Emilim yolu: suda çözünen → kan → karaciğer; yağda çözünen → lenf.",
    ],
    summary: [
      "Sindirim mekanik (bağ kırılmaz) ve kimyasal (enzimle hidroliz) olarak iki türlüdür.",
      "Karbonhidrat ağızda, protein midede, yağ ince bağırsakta kimyasal sindirime başlar; hepsi ince bağırsakta tamamlanır.",
      "Safra enzim içermez, yağları emülsiyonlaştırır; pankreas özsuyu üç besin grubunun enzimlerini içerir.",
      "Pepsin asidik, tripsin bazik ortamda çalışır; protein sindiren enzimler etkisiz salgılanır.",
      "Emilim ince bağırsakta villuslarla olur; yağlar lenfe, diğer monomerler kana geçer.",
      "Gastrin mide salgısını, sekretin pankreasın bikarbonat salgısını uyarır.",
    ],
  },

  // ---------------------------------------------------------------- Dolaşım ve bağışıklık
  {
    topicId: 'aytbio-dolasim-bagisiklik',
    intro:
      "Vücudundaki yaklaşık 5 litre kan, bir dakika içinde bütün vücudu dolaşıp kalbe geri döner. Dolaşım sistemi; kalp, damarlar ve kandan oluşan, oksijeni, besinleri, hormonları ve atıkları taşıyan bir ulaşım ağıdır. İnsanda kalp dört odacıklıdır ve temiz–kirli kan birbirine karışmaz; bu, sıcakkanlı olmanın getirdiği yüksek enerji ihtiyacını karşılamayı kolaylaştırır.\n\nKanın bir diğer görevi savunmadır. Deri ve mukus gibi engelleri aşan mikroplar, önce hücrelerin yeme (fagositoz) ve iltihap tepkisiyle karşılanır; bu savunma herkeste doğuştan vardır ve özgül değildir. Ardından lenfositler devreye girer: B lenfositler antikor üretir, T lenfositler enfekte hücreleri yok eder. Bu kazanılmış savunma özgüldür ve bellek hücreleri sayesinde ikinci karşılaşmada çok daha hızlıdır. Aşıların çalışma mantığı da budur.\n\nBu konuda kalbin çalışmasını, büyük–küçük kan dolaşımını, kılcallarda madde alışverişini, kan gruplarını, lenf sistemini ve bağışıklığı öğreneceğiz.",
    prerequisites: [
      "Difüzyon ve osmoz; basınç farkıyla madde hareketi",
      "Protein yapısı (antikorlar ve antijenler)",
      "Hücresel solunum ve oksijen ihtiyacı",
      "Solunum sisteminde gaz değişiminin temel mantığı",
    ],
    concepts: [
      { term: "Büyük kan dolaşımı", definition: "Sol karıncık → aort → vücut dokuları → üst/alt ana toplardamar → sağ kulakçık. Dokulara oksijen verir." },
      { term: "Küçük kan dolaşımı", definition: "Sağ karıncık → akciğer atardamarı (kirli kan) → akciğer → akciğer toplardamarı (temiz kan) → sol kulakçık." },
      { term: "SA düğüm", definition: "Sağ kulakçık duvarında, kalbin kendi uyarısını üreten ‘doğal pil’ (pacemaker). Kalp sinir bağlantısı kesilse de çalışmayı sürdürür; otonom sistem yalnızca hızı ayarlar." },
      { term: "Antijen ve antikor", definition: "Antijen bağışıklık tepkisini başlatan yabancı moleküldür; antikor B lenfositten gelişen plazma hücrelerince üretilen, antijene özgül olarak bağlanan proteindir." },
      { term: "Hümoral bağışıklık", definition: "B lenfositlerin plazma hücrelerine dönüşerek antikor üretmesiyle sağlanan savunma; özellikle vücut sıvılarındaki bakteri ve toksinlere karşıdır." },
      { term: "Hücresel bağışıklık", definition: "Sitotoksik T lenfositlerin virüsle enfekte, kanserli ya da nakledilen yabancı hücreleri doğrudan yok etmesi. Yardımcı T hücreleri hem B hem T yanıtını uyarır." },
      { term: "Aktif ve pasif bağışıklık", definition: "Aktif: vücut antikoru kendi üretir (hastalık geçirme, aşı), kalıcıdır. Pasif: hazır antikor alınır (serum, anne sütü, plasenta), hızlı ama geçicidir." },
      { term: "Lenf dolaşımı", definition: "Doku sıvısı fazlasını ve emilen yağları toplayıp köprücük altı toplardamarından kana veren tek yönlü sistem. Lenf düğümleri savunmaya katılır." },
    ],
    formulas: [
      { expr: "Kılcalın atardamar ucunda: kan basıncı > osmotik basınç → sıvı dokuya çıkar", meaning: "Su, glikoz, O₂ gibi küçük moleküller dokuya geçer; proteinler kanda kalır." },
      { expr: "Kılcalın toplardamar ucunda: osmotik basınç > kan basıncı → sıvı kana döner", meaning: "Geri dönmeyen fazla sıvı lenf kılcalına geçer; lenf yolu tıkanırsa ödem oluşur." },
      { expr: "Kan akış hızı: aort > toplardamarlar > kılcallar | Kan basıncı: aort > kılcal > toplardamar", meaning: "Kılcallarda toplam kesit alanı en büyük olduğu için akış en yavaştır; bu madde alışverişine zaman tanır." },
      { expr: "A grubunda: A antijeni + anti-B | B: B antijeni + anti-A | AB: A ve B antijeni, antikor yok | 0: antijen yok, anti-A + anti-B", meaning: "Nakilde vericinin antijeni ile alıcının antikoru eşleşmemelidir: 0 genel verici, AB genel alıcı (az miktarda)." },
      { expr: "Rh uyuşmazlığı: anne Rh⁻, bebek Rh⁺ → ikinci Rh⁺ gebelikte risk", meaning: "İlk doğumda anne anti-Rh antikoru üretmeye başlar; sonraki Rh⁺ bebeğin alyuvarları yıkılabilir. Doğum sonrası anti-Rh serumu ile önlenir." },
      { expr: "İkincil yanıt: bellek hücreleri → daha hızlı, daha güçlü, daha uzun süreli antikor üretimi", meaning: "Aşının koruyuculuğu bellek hücrelerine dayanır." },
    ],
    logic:
      "Kalp neden dört odacıklı ve neden iki ayrı dolaşım var? Akciğerlerden geçen kanın basıncı düşer; eğer kan akciğerden doğrudan vücuda gitseydi dokulara yeterli basınçla ulaşamazdı. İnsan kalbi kanı iki kez pompalar: sağ taraf akciğerlere düşük basınçla, sol taraf tüm vücuda yüksek basınçla. Bu yüzden sol karıncık duvarı en kalın odacıktır. Kapakçıklar kanın tek yönde akmasını sağlar.\n\nKılcallarda madde alışverişi iki basıncın yarışıdır: kan basıncı sıvıyı dışarı iter, plazma proteinlerinin oluşturduğu osmotik basınç sıvıyı içeri çeker. Kılcalın başında kan basıncı yüksek olduğu için sıvı dokuya geçer, sonunda kan basıncı düştüğü için sıvı geri döner. Kan proteinleri azalırsa (ör. karaciğer hastalığı, ağır protein eksikliği) osmotik basınç düşer ve dokularda sıvı birikir.\n\nBağışıklıkta aşının mantığı, gerçek hastalığı geçirmeden bellek hücresi kazandırmaktır. Zayıflatılmış ya da öldürülmüş mikrop veya onun antijeni verildiğinde birincil yanıt oluşur ve bellek hücreleri kalır. Gerçek mikropla karşılaşınca ikincil yanıt çok hızlı ve güçlü olduğu için hastalık gelişmez. Serum ise hazır antikor içerir; hızlı koruma sağlar ama bellek oluşturmadığı için geçicidir. Bu yüzden yılan sokması ya da tetanos şüphesinde serum; çocukluk hastalıklarından korunmada aşı kullanılır.",
    examples: [
      {
        level: "kolay",
        problem: "Akciğer atardamarı ile akciğer toplardamarında taşınan kanın özelliği nedir?",
        steps: [
          "Akciğer atardamarı sağ karıncıktan çıkar; vücuttan dönen kirli (O₂’ce fakir) kanı akciğere taşır.",
          "Akciğer toplardamarı akciğerden gelen temiz (O₂’ce zengin) kanı sol kulakçığa getirir.",
          "Atardamar/toplardamar ayrımı kanın temizliğine değil, kalpten çıkıp çıkmadığına göre yapılır.",
        ],
        answer: "Akciğer atardamarı kirli kan, akciğer toplardamarı temiz kan taşır.",
      },
      {
        level: "orta",
        problem: "Kan grubu A Rh⁻ olan bir hastaya hangi kan grubundan kan verilebilir: AB Rh⁺, A Rh⁺, 0 Rh⁻, B Rh⁻?",
        steps: [
          "Alıcının plazmasında anti-B vardır; vericinin alyuvarlarında B antijeni olmamalıdır: AB ve B elenir.",
          "Alıcı Rh⁻ olduğundan Rh⁺ kan (Rh antijeni) verilmemelidir: A Rh⁺ elenir.",
          "0 Rh⁻ alyuvarlarında A, B ve Rh antijeni yoktur; verilebilir.",
        ],
        answer: "0 Rh⁻ (aynı gruptan A Rh⁻ de verilebilir).",
      },
      {
        level: "zor",
        problem: "Bir bireye aynı antijen 1. günde ve 40. günde enjekte ediliyor. Kandaki antikor miktarının zamanla değişimi nasıl olur? İkinci yanıtın farkının nedeni nedir?",
        steps: [
          "İlk enjeksiyonda B lenfositler antijeni tanıyıp çoğalır ve plazma hücrelerine dönüşür; antikor birkaç günlük gecikmeyle ve düşük düzeyde artar, sonra azalır.",
          "Bu birincil yanıtta bellek B hücreleri de oluşur.",
          "40. gündeki ikinci enjeksiyonda bellek hücreleri antijeni hemen tanır; antikor çok kısa sürede, çok daha yüksek düzeye çıkar ve uzun süre yüksek kalır.",
          "Fark, bellek hücrelerinin varlığından kaynaklanır; aşıların temel ilkesi budur.",
        ],
        answer: "İkincil yanıt daha hızlı, daha güçlü ve daha uzun sürelidir; nedeni bellek hücreleridir.",
      },
    ],
    osymThinking:
      "Sorular kalp–damar şemasındaki kan yolunu (hangi damarda temiz kan, hangi odacık en kalın), kılcallarda basınç grafiklerini ve kan grubu uyumu tablolarını yorumlatır. Bağışıklıkta antikor miktarı–zaman grafiği ile birincil/ikincil yanıt, aşı–serum karşılaştırması ve bağışıklık hücrelerinin görevleri öncüllü biçimde sorulur. Çeldiriciler genellikle ‘atardamar = temiz kan’ ve ‘serum kalıcı bağışıklık sağlar’ gibi yanılgılardan üretilir.",
    commonMistakes: [
      "Atardamarların her zaman temiz kan taşıdığını düşünmek; akciğer atardamarı kirli kan taşır.",
      "Serumun aktif ve kalıcı bağışıklık sağladığını sanmak; serum pasif ve geçicidir.",
      "0 grubu kişinin her gruptan kan alabileceğini sanmak; 0 grubu yalnızca 0 grubundan kan alabilir.",
      "Kan akış hızının en yavaş aortta olduğunu düşünmek; en yavaş akış kılcallardadır.",
      "Kalbin kasılma uyarısının beyinden geldiğini sanmak; uyarı SA düğümde oluşur, otonom sinirler yalnız hızı değiştirir.",
    ],
    tips: [
      "Kan nakli sorusunda sadece iki şeye bak: vericinin alyuvar antijeni ↔ alıcının plazma antikoru; Rh⁻ alıcıya Rh⁺ verme.",
      "‘Atar = kalpten atar, toplar = kalbe toplar’ diye ayır; temiz–kirli ayrımını kullanma.",
      "Aşı = antijen (aktif, bellek var); serum = antikor (pasif, bellek yok).",
    ],
    summary: [
      "İnsan kalbi dört odacıklıdır; temiz ve kirli kan karışmaz, sol karıncık duvarı en kalındır.",
      "Büyük dolaşım sol karıncıkta başlar, sağ kulakçıkta biter; küçük dolaşım sağ karıncıkta başlar, sol kulakçıkta biter.",
      "Kalp uyarısı SA düğümde oluşur: SA → AV → His demeti → Purkinje lifleri.",
      "Kılcallarda kan basıncı sıvıyı dışarı, osmotik basınç içeri çeker; fazla sıvı lenfe geçer.",
      "ABO ve Rh sisteminde vericinin antijeni alıcının antikoruyla eşleşmemelidir.",
      "Doğal savunma özgül değildir; kazanılmış savunma B (antikor) ve T (hücresel) lenfositlerle özgüldür ve bellek içerir.",
      "Aşı aktif ve kalıcı, serum pasif ve geçici bağışıklık sağlar.",
    ],
  },
];
