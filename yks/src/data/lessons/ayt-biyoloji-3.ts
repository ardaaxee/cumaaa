import type { LessonSeed } from '../../domain/types';

export const lessons: LessonSeed[] = [
  // ---------------------------------------------------------------------------
  // GENDEN PROTEİNE
  // ---------------------------------------------------------------------------
  {
    topicId: "aytbio-genden-proteine",
    intro:
      "Bir hücrenin ne yapacağına, hangi enzimi üreteceğine, hangi hormona yanıt vereceğine karar veren bilgi DNA’da saklıdır. Ama DNA kendi başına iş yapmaz; bilgi önce RNA’ya kopyalanır (transkripsiyon), sonra ribozomda proteine çevrilir (translasyon). Bu “DNA → RNA → protein” akışına moleküler biyolojinin merkezi dogması denir ve AYT biyolojinin en çok soru üreten zincirlerinden biridir.\n\nKonuyu üç katmanda düşünmek işini kolaylaştırır: Birincisi yapı (nükleotit, baz eşleşmesi, hidrojen bağı, Chargaff kuralları). İkincisi kopyalama (DNA’nın yarı korunumlu eşlenmesi, helikaz, DNA polimeraz, ligaz). Üçüncüsü ifade (genetik şifre, kodon–antikodon, transkripsiyon ve translasyon).\n\nSorular genellikle bir DNA dizisi verip mRNA’yı, amino asit dizisini ya da bir mutasyonun sonucunu sorar; bazen de nükleotit, hidrojen bağı, peptit bağı sayısı hesaplatır. Mantığı kavrarsan ezber yükü çok azalır: her şey “tamamlayıcı baz eşleşmesi” ve “üçlü okuma” fikrine dayanır.",
    prerequisites: [
      "Nükleotidin yapısı: fosfat + beş karbonlu şeker + organik baz",
      "Protein, amino asit ve peptit bağı kavramları (dehidrasyon sentezi)",
      "Hücre yapısı: çekirdek, ribozom, mitokondri, kloroplast",
      "Enzimlerin substrata özgü çalışması",
    ],
    concepts: [
      { term: "Nükleotit", definition: "Nükleik asitlerin yapı birimi; bir fosfat, bir pentoz şeker (DNA’da deoksiriboz, RNA’da riboz) ve bir organik bazdan oluşur." },
      { term: "Tamamlayıcı baz eşleşmesi", definition: "DNA’da A ile T (2 hidrojen bağı), G ile C (3 hidrojen bağı) eşleşir; RNA’da T yerine U bulunur ve A–U eşleşir." },
      { term: "Yarı korunumlu eşlenme", definition: "DNA eşlendiğinde her yeni molekül bir eski (kalıp) ve bir yeni zincirden oluşur; Meselson–Stahl deneyi ile gösterilmiştir." },
      { term: "Gen", definition: "Belirli bir polipeptidi ya da işlevsel RNA’yı şifreleyen DNA bölgesi." },
      { term: "Kodon", definition: "mRNA üzerinde bir amino asidi ya da bitiş sinyalini belirleyen ardışık üç nükleotit. 64 kodonun 61’i amino asit, 3’ü (UAA, UAG, UGA) bitiş kodonudur; AUG başlangıç kodonudur ve metiyonin şifreler." },
      { term: "Antikodon", definition: "tRNA üzerinde, mRNA kodonuna tamamlayıcı olan üç nükleotitlik dizi." },
      { term: "Transkripsiyon", definition: "RNA polimerazın DNA’nın kalıp zincirini kullanarak RNA sentezlemesi; ökaryotlarda çekirdekte gerçekleşir." },
      { term: "Translasyon", definition: "Ribozomda mRNA’daki kodon dizisine göre amino asitlerin peptit bağlarıyla birleştirilmesi." },
      { term: "Mutasyon", definition: "DNA’nın nükleotit dizisinde kalıtsal değişiklik. Nokta mutasyonu (baz değişimi) sessiz, yanlış anlamlı ya da anlamsız olabilir; ekleme/eksilme okuma çerçevesini kaydırabilir." },
    ],
    formulas: [
      { expr: "Çift zincirli DNA’da: A = T ve G = C → A + G = T + C", meaning: "Pürin sayısı pirimidin sayısına eşittir (Chargaff kuralı). (A+T)/(G+C) oranı ise türe özgüdür ve 1 olmak zorunda değildir." },
      { expr: "Hidrojen bağı sayısı = 2·(A–T çifti) + 3·(G–C çifti)", meaning: "G–C oranı yüksek DNA daha fazla hidrojen bağı içerir ve ayrılması için daha çok enerji gerekir." },
      { expr: "n amino asitlik polipeptit → en az 3n nükleotit (kodlayan) + 3 (bitiş kodonu)", meaning: "Bitiş kodonu amino asit şifrelemez ama mRNA’da yer alır." },
      { expr: "Peptit bağı sayısı = amino asit sayısı − 1", meaning: "Doğrusal bir polipeptitte her yeni amino asit bir peptit bağıyla eklenir; her bağda 1 su açığa çıkar." },
      { expr: "Olası kodon sayısı = (baz çeşidi)^(kodondaki nükleotit sayısı) = 4³ = 64", meaning: "İkili kodon olsaydı 4² = 16 kodon, 20 amino asit için yetmezdi; bu yüzden şifre üçlüdür." },
      { expr: "Meselson–Stahl: n eşlenme sonra 2ⁿ molekülün 2’si hibrit (¹⁵N–¹⁴N), geri kalanı hafif", meaning: "Eski iki zincir hiç kaybolmaz; yalnızca giderek artan yeni moleküllere dağılır." },
    ],
    logic:
      "Neden A yalnızca T ile eşleşir? Çünkü pürinler (A, G) iki halkalı, pirimidinler (T, C, U) tek halkalıdır. Sarmalın çapı sabit kalsın diye her basamakta bir pürin bir pirimidinle eşleşmek zorundadır; hidrojen bağı verici ve alıcı grupların yerleşimi de A–T ve G–C eşleşmesini seçer. Bu tek kural; replikasyonu, transkripsiyonu, kodon–antikodon eşleşmesini ve Chargaff oranlarını açıklar.\n\nNeden şifre üçlü? Dört baz ile 20 amino asidi ayırt etmek gerekiyor. 4¹ = 4 ve 4² = 16 yetmez, 4³ = 64 yeter ve artar. Artan kodonlar bazı amino asitlerin birden fazla kodonla şifrelenmesini (dejenerasyon) sağlar; bu da bazı nokta mutasyonlarının sessiz kalmasını açıklar.\n\nNeden bir nükleotit eksilmesi, bir baz değişiminden daha yıkıcıdır? Ribozom mRNA’yı başlangıç kodonundan itibaren üçer üçer, boşluk bırakmadan ve çakıştırmadan okur. Bir nükleotit eklenir ya da çıkarılırsa o noktadan sonraki bütün kodonlar değişir (çerçeve kayması). Oysa tek baz değişimi yalnızca bir kodonu etkiler. Ardışık üç nükleotidin eksilmesi ise çerçeveyi bozmaz; sadece bir amino asit eksik olur.\n\nDNA polimeraz yalnızca 5′→3′ yönünde zincir uzatabildiği ve bir başlangıç ucuna (primer) ihtiyaç duyduğu için, zıt yönlü zincirlerden biri kesintisiz, diğeri Okazaki parçaları hâlinde sentezlenir; parçaları ligaz birleştirir.",
    examples: [
      {
        level: "kolay",
        problem: "Bir DNA zincirinin dizisi 5′-ATG CGT-3′ ise tamamlayıcı zincirin dizisi nedir?",
        steps: [
          "Her bazın eşini yaz: A→T, T→A, G→C, C→G.",
          "ATG CGT → TAC GCA.",
          "Zincirler zıt yönlüdür (antiparalel): tamamlayıcı zincir 3′ ucundan başlar.",
        ],
        answer: "3′-TAC GCA-5′",
      },
      {
        level: "orta",
        problem: "Çift zincirli bir DNA molekülünde 1000 nükleotit vardır ve bunların %30’u guanindir. Moleküldeki adenin sayısını ve hidrojen bağı sayısını bulunuz.",
        steps: [
          "G = %30 → C = %30 → G + C = %60, A + T = %40 → A = T = %20.",
          "G = C = 300, A = T = 200.",
          "A–T çifti 200 → 200·2 = 400 hidrojen bağı; G–C çifti 300 → 300·3 = 900 hidrojen bağı.",
          "Toplam 400 + 900 = 1300.",
        ],
        answer: "Adenin 200; hidrojen bağı 1300",
      },
      {
        level: "zor",
        problem: "Bir genin kalıp zinciri 3′-TAC CAT GGA ACT-5′ şeklindedir. Kalıp zincirde soldan beşinci nükleotit (A) eksilirse oluşacak polipeptidin amino asit sayısı nasıl değişir? (AUG: Met, GUA: Val, CCU: Pro, UGA: bitiş, GAC: Asp, CUU: Leu)",
        steps: [
          "Normal mRNA: kalıbın tamamlayıcısı → 5′-AUG GUA CCU UGA-3′ → Met–Val–Pro, sonra bitiş. 3 amino asit.",
          "Beşinci nükleotit (A) eksilince kalıp 3′-TAC CTG GAA CT…-5′ olur.",
          "Yeni mRNA: 5′-AUG GAC CUU GA…-3′; okuma çerçevesi kaydığı için ikinci kodondan itibaren tüm kodonlar değişir.",
          "Bitiş kodonu (UGA) artık aynı yerde okunmaz; polipeptit, sonraki bitiş kodonuna kadar farklı ve farklı uzunlukta sentezlenir.",
        ],
        answer: "Çerçeve kayması olur; ikinci amino asitten itibaren dizi değişir ve bitiş kodonunun yeri kaydığı için polipeptidin uzunluğu da değişebilir.",
      },
    ],
    osymThinking:
      "Sorular çoğu zaman “kalıp zincir” ile “anlamlı (kodlayan) zincir” ayrımını gizler: mRNA, kalıp zincirin tamamlayıcısı ve kodlayan zincirle aynı dizidedir (T yerine U). Ayrıca bitiş kodonunun amino asit şifrelemediği, tRNA antikodonunun kalıp DNA ile aynı harfleri taşıdığı (U yerine T), Chargaff kuralının yalnızca çift zincirli DNA’da geçerli olduğu gibi ayrıntılarla dikkat ölçülür. Öncüllü sorularda “her zaman”, “kesinlikle” gibi ifadeler, sessiz mutasyon gibi istisnalarla çürütülür.",
    commonMistakes: [
      "Kalıp DNA’yı mRNA gibi okumak; önce tamamlayıcıya çevirmeyi unutmak.",
      "Bitiş kodonunu bir amino asit gibi saymak ya da mRNA nükleotit hesabında hiç eklememek.",
      "(A+T)/(G+C) oranının da her DNA’da 1 olduğunu sanmak; 1 olan A/T ve G/C’dir.",
      "Tek baz değişiminin okuma çerçevesini kaydırdığını düşünmek.",
      "Chargaff kurallarını tek zincirli RNA ya da tek bir DNA zinciri için uygulamak.",
      "DNA polimerazın 3′→5′ yönünde sentez yaptığını sanmak; yeni zincir daima 5′→3′ uzar.",
    ],
    tips: [
      "Dizi sorularında önce yönleri (5′/3′) yaz, sonra harf harf eşle; hızlı okumak en çok burada hata yaptırır.",
      "tRNA antikodonu = kalıp DNA üçlüsü (U↔T değişimiyle). Kodon = kodlayan DNA üçlüsü (T↔U değişimiyle).",
      "Mutasyon sorusunda önce “çerçeve kayıyor mu?” diye sor: 3’ün katı olmayan ekleme/eksilme → kayma.",
      "Meselson–Stahl’da hibrit molekül sayısı kaç eşlenme olursa olsun 2’dir; oranı 2/2ⁿ ile bul.",
    ],
    summary: [
      "DNA: deoksiriboz + A, T, G, C; RNA: riboz + A, U, G, C. A–T 2, G–C 3 hidrojen bağı.",
      "Çift zincirli DNA’da A = T, G = C, pürin = pirimidin; (A+T)/(G+C) türe özgüdür.",
      "Replikasyon yarı korunumludur; helikaz açar, primaz primer yapar, DNA polimeraz 5′→3′ uzatır, ligaz birleştirir.",
      "Transkripsiyon: RNA polimeraz, kalıp zincirden mRNA yapar (ökaryotta çekirdekte).",
      "Translasyon: ribozomda kodon–antikodon eşleşmesiyle amino asitler peptit bağıyla bağlanır.",
      "Genetik şifre üçlüdür, dejeneredir, (neredeyse) evrenseldir; AUG başlangıç, UAA-UAG-UGA bitiş.",
      "Baz değişimi tek kodonu etkiler (sessiz/yanlış anlamlı/anlamsız); 3’ün katı olmayan ekleme-eksilme çerçeveyi kaydırır.",
    ],
  },

  // ---------------------------------------------------------------------------
  // FOTOSENTEZ
  // ---------------------------------------------------------------------------
  {
    topicId: "aytbio-fotosentez",
    intro:
      "Fotosentez, ışık enerjisinin glikozun kimyasal bağlarına aktarılmasıdır. Bitkiler, algler ve siyanobakteriler bu sayede kendi besinlerini üretir; dünyadaki besin zincirlerinin çoğu ve atmosferdeki oksijenin büyük kısmı bu olaya dayanır.\n\nÖkaryotlarda fotosentez kloroplastta iki evrede gerçekleşir. Işığa bağımlı reaksiyonlar tilakoid zarında olur: klorofil ışığı soğurur, su parçalanır (fotoliz), O₂ açığa çıkar, ATP ve NADPH üretilir. Işıktan bağımsız reaksiyonlar (Calvin döngüsü) stromada olur: CO₂, bu ATP ve NADPH kullanılarak organik maddeye (PGAL, ardından glikoz) dönüştürülür.\n\nAYT’de bu konu çoğunlukla grafik ve deney yorumu olarak gelir: ışık şiddeti, CO₂ derişimi, sıcaklık ve ışığın dalga boyunun fotosentez hızına etkisi; kabarcık sayma, indikatör renk değişimi ve işaretli atom deneyleri. Kemosentez ise “ışık yerine kimyasal enerji ile organik madde üretimi” olarak fotosentezle karşılaştırılır.",
    prerequisites: [
      "Kloroplastın yapısı: dış-iç zar, tilakoid, grana, stroma",
      "ATP’nin enerji taşıyıcı rolü ve NADP⁺/NADPH’nin elektron taşıyıcılığı",
      "Enzimlerin sıcaklık ve pH’dan etkilenmesi",
      "Deneyde bağımlı, bağımsız ve kontrol değişkeni kavramları",
    ],
    concepts: [
      { term: "Klorofil", definition: "Tilakoid zarındaki fotosentetik pigment; en çok mavi-mor ve kırmızı ışığı soğurur, yeşil ışığı büyük ölçüde yansıtır. Yapısında magnezyum bulunur." },
      { term: "Fotoliz", definition: "Işığa bağımlı evrede suyun parçalanması; elektronlar klorofile, H⁺ iyonları NADP⁺’nin indirgenmesine gider, O₂ atmosfere verilir." },
      { term: "Fotofosforilasyon", definition: "Işık enerjisiyle tilakoid zarında ADP’ye fosfat eklenerek ATP üretilmesi (ETS ve ATP sentaz aracılığıyla)." },
      { term: "Calvin döngüsü", definition: "Stromada CO₂’nin 5 karbonlu RuBP’ye bağlanması, oluşan PGA’nın ATP ve NADPH ile PGAL’ye indirgenmesi ve RuBP’nin yeniden oluşturulması döngüsü." },
      { term: "Sınırlayıcı faktör", definition: "Fotosentez hızını o anda en çok kısıtlayan etken; diğer etkenler artırılsa bile hız, bu etken artırılmadıkça yükselmez." },
      { term: "Kemosentez", definition: "Bazı bakterilerin (ör. nitrifikasyon, kükürt ve demir bakterileri) inorganik maddeleri oksitleyerek elde ettiği enerjiyle CO₂’den organik madde üretmesi; ışık ve klorofil gerekmez." },
      { term: "Aksiyon spektrumu", definition: "Farklı dalga boylarındaki ışıkta fotosentez hızını gösteren eğri; mavi ve kırmızı bölgelerde tepe yapar." },
    ],
    formulas: [
      { expr: "6CO₂ + 12H₂O + ışık → C₆H₁₂O₆ + 6O₂ + 6H₂O", meaning: "Genel denklem. Açığa çıkan O₂’nin tamamı sudan gelir; CO₂’nin oksijeni glikoza ve oluşan suya geçer." },
      { expr: "Işığa bağımlı evre: H₂O + ADP + Pi + NADP⁺ → O₂ + ATP + NADPH", meaning: "Tilakoid zarında gerçekleşir; ürünler Calvin döngüsünün enerji ve elektron kaynağıdır." },
      { expr: "Calvin: RuBP (5C) + CO₂ → 2 PGA (3C) → (ATP, NADPH) → 2 PGAL", meaning: "Karbon tutma, indirgenme, RuBP’nin yenilenmesi basamaklarıdır." },
      { expr: "1 glikoz için Calvin: 6 CO₂, 18 ATP, 12 NADPH", meaning: "6 tur döngü gerekir; ATP’nin bir kısmı RuBP’nin yenilenmesinde harcanır." },
      { expr: "Net (gözlenen) fotosentez = gerçek fotosentez − solunum", meaning: "Ölçülen O₂ çıkışı ya da CO₂ tüketimi, aynı anda süren solunum nedeniyle gerçek hızdan düşüktür." },
      { expr: "Nitrosomonas: NH₃ → NO₂⁻ ; Nitrobacter: NO₂⁻ → NO₃⁻ (+ enerji)", meaning: "Kemosentetik nitrifikasyon bakterileri bu oksidasyonların enerjisini CO₂ özümlemesinde kullanır." },
    ],
    logic:
      "Fotosentezi bir fabrika gibi düşün: tilakoid zarı enerji santrali, stroma üretim bandıdır. Santral (ışığa bağımlı evre) ışığı kullanarak ATP ve NADPH adlı “şarjlı pilleri” üretir; bant (Calvin) bu pilleri harcayarak CO₂’yi şekere çevirir. Bu yüzden ışık kesilirse bant da kısa süre sonra durur; CO₂ kesilirse santral bir süre çalışsa da piller boşalamadığı için yavaşlar.\n\nNeden O₂ sudan gelir? Çünkü ışık enerjisiyle uyarılan klorofil elektron kaybeder ve bu açığı suyun parçalanmasından gelen elektronlarla kapatır; geriye kalan oksijen atomları O₂ olarak serbest kalır. İşaretli oksijen (¹⁸O) deneyleri bunu doğrular.\n\nNeden sınırlayıcı faktör önemli? Hız, zincirin en yavaş halkasına bağlıdır. Düşük ışıkta ışık şiddetini artırmak hızı artırır; ama bir noktadan sonra enzimler ya da CO₂ yetersiz kalır ve eğri düzleşir. Bu noktadan sonra hızı artırmanın yolu, o anda kısıtlayan etkeni (çoğu zaman CO₂ ya da sıcaklık) artırmaktır. Sıcaklık, enzimatik olan Calvin döngüsünü daha çok etkiler; optimumun üstünde enzimlerin yapısı bozulduğu için hız hızla düşer.\n\nKemosentez neden önemli? Işığın ulaşmadığı ortamlarda (ör. toprak, derin deniz bacaları) üretici canlılar olarak besin zincirini başlatır; nitrifikasyon bakterileri ayrıca azot döngüsünde bitkilerin kullanabileceği nitratı oluşturur.",
    examples: [
      {
        level: "kolay",
        problem: "Işığa bağımlı reaksiyonların ürünlerinden hangileri Calvin döngüsünde kullanılır?",
        steps: [
          "Işığa bağımlı evrenin ürünleri: O₂, ATP, NADPH.",
          "O₂ atmosfere ya da hücresel solunuma gider; Calvin’de kullanılmaz.",
          "ATP enerji, NADPH ise elektron/hidrojen kaynağı olarak PGA’nın PGAL’ye indirgenmesinde kullanılır.",
        ],
        answer: "ATP ve NADPH",
      },
      {
        level: "orta",
        problem: "Bir bitki 30 °C ve düşük CO₂ ortamında bulunuyor. Işık şiddeti arttıkça fotosentez hızı önce artıp belli bir değerde sabitleniyor. Hızı daha da artırmak için ne yapılmalıdır?",
        steps: [
          "Eğrinin düzleşmesi, ışığın artık sınırlayıcı olmadığını gösterir.",
          "Sıcaklık (30 °C) çoğu bitki için optimuma yakındır.",
          "Ortam CO₂’ce fakir olduğundan sınırlayıcı faktör CO₂’dir.",
          "CO₂ derişimi artırılırsa hız yeni, daha yüksek bir değerde sabitlenir.",
        ],
        answer: "Ortamın CO₂ derişimi artırılmalıdır.",
      },
      {
        level: "zor",
        problem: "Işıkta fotosentez yapan bir alg kültüründe ışık aniden kapatılıyor. Kısa süre içinde RuBP ve PGA miktarları nasıl değişir?",
        steps: [
          "Işık kesilince ATP ve NADPH üretimi durur.",
          "PGA’nın PGAL’ye indirgenmesi ATP ve NADPH gerektirdiği için yavaşlar; PGA birikir.",
          "RuBP’nin yeniden oluşumu da ATP gerektirdiği için durur; fakat mevcut RuBP bir süre CO₂ ile birleşmeye devam eder.",
          "Sonuç: RuBP azalır, PGA artar.",
        ],
        answer: "RuBP azalır, PGA artar.",
      },
    ],
    osymThinking:
      "Bu konuda sorular çoğu zaman bir deney düzeneği (su bitkisi + lamba mesafesi, indikatörlü tüpler, prizmayla ayrılmış ışık) ya da bir hız grafiği verir ve “hangi sonuca ulaşılabilir?” diye sorar. Ölçülen şeyin net fotosentez olduğunu, kontrol grubunun neyi dışladığını ve eğrinin düz kısmında hangi etkenin sınırlayıcı olduğunu fark etmek beklenir. Öncüllü sorularda fotosentez–kemosentez–solunum karşılaştırmasında “ortak özellik” tuzağı kurulur.",
    commonMistakes: [
      "Açığa çıkan O₂’nin CO₂’den geldiğini sanmak.",
      "Işıktan bağımsız reaksiyonların karanlıkta gerçekleştiğini ya da ışıktan hiç etkilenmediğini düşünmek; ATP ve NADPH tükenince durur.",
      "Grafiğin düz bölümünde ışık şiddetini artırmanın hâlâ işe yarayacağını sanmak.",
      "Yeşil ışığın hiç soğurulmadığını söylemek; az soğurulur ve fotosentez düşük hızda sürer.",
      "Kemosentetik canlıların klorofil taşıdığını ya da O₂ ürettiğini düşünmek.",
      "Bitkilerin ışıkta solunum yapmadığını sanmak; solunum gece gündüz sürer.",
    ],
    tips: [
      "“Işıkta mavi, karanlıkta sarı” (bromtimol mavisi): CO₂ azalırsa çözelti bazikleşir → mavi; CO₂ artarsa asitleşir → sarı.",
      "Grafik sorusunda önce eğrinin yükselen kısmındaki etkeni, sonra düz kısımdaki sınırlayıcıyı ayır.",
      "Işık kesilince: PGA ↑, RuBP ↓. CO₂ kesilince: RuBP ↑, PGA ↓. Bu ikisi simetriktir.",
      "Kemosentez = fotosentezin ışıksız kuzeni: aynı sonuç (CO₂’den organik madde), farklı enerji kaynağı.",
    ],
    summary: [
      "Fotosentez kloroplastta: ışığa bağımlı evre tilakoidde, Calvin döngüsü stromada.",
      "Işığa bağımlı evre: fotoliz, O₂ (sudan), ATP ve NADPH üretimi.",
      "Calvin: CO₂ + RuBP → PGA → (ATP, NADPH) → PGAL → glikoz; RuBP yenilenir.",
      "Hızı ışık şiddeti, CO₂, sıcaklık, dalga boyu, su ve mineraller etkiler; en kısıtlayıcı etken hızı belirler.",
      "Mavi ve kırmızı ışıkta hız yüksek, yeşilde düşüktür.",
      "Ölçülen hız net fotosentezdir: gerçek fotosentez − solunum.",
      "Kemosentez: inorganik madde oksidasyonunun enerjisiyle CO₂’den organik madde; ışık ve klorofil yok.",
    ],
  },

  // ---------------------------------------------------------------------------
  // HÜCRESEL SOLUNUM
  // ---------------------------------------------------------------------------
  {
    topicId: "aytbio-hucresel-solunum",
    intro:
      "Hücreler besinlerdeki kimyasal enerjiyi doğrudan kullanamaz; bu enerjiyi önce ATP’ye aktarmaları gerekir. Bu aktarımın adı hücresel solunumdur. Yakıt genellikle glikozdur ve glikoz adım adım, enzimlerle yıkılır; böylece enerji ısı olarak bir anda kaybolmaz, parça parça ATP’ye bağlanır.\n\nOksijenli solunum dört basamakta düşünülür: glikoliz (sitoplazma), pirüvatın asetil CoA’ya dönüşmesi, Krebs döngüsü (mitokondri matriksi) ve elektron taşıma sistemi (ETS, mitokondri iç zarı). ATP’nin büyük kısmı ETS’de, O₂’nin son elektron alıcısı olduğu oksidatif fosforilasyonla üretilir.\n\nOksijen yoksa hücre ya fermantasyona (etil alkol ya da laktik asit) ya da bazı bakterilerde oksijensiz solunuma yönelir. Fermantasyonda yalnızca glikolizin 2 ATP’si kazanılır. AYT soruları bu basamakların yerini, ürünlerini, ATP hesabını ve deney/grafik yorumunu (maya, çimlenen tohum, egzersiz yapan kas) ölçer.",
    prerequisites: [
      "ATP’nin yapısı ve ADP + Pi ⇄ ATP dönüşümü",
      "Mitokondrinin yapısı: dış zar, iç zar (kristalar), matriks",
      "NAD⁺/NADH ve FAD/FADH₂’nin elektron taşıyıcı rolü",
      "Fotosentezin genel denklemi (solunumla karşılaştırma için)",
    ],
    concepts: [
      { term: "Glikoliz", definition: "Sitoplazmada glikozun (6C) iki pirüvata (3C) yıkılması; 2 ATP harcanıp 4 ATP üretilir (net 2 ATP), 2 NADH oluşur. O₂ gerektirmez." },
      { term: "Substrat düzeyinde fosforilasyon", definition: "Fosfat grubunun bir substrattan doğrudan ADP’ye aktarılması; glikoliz ve Krebs döngüsünde görülür." },
      { term: "Krebs döngüsü", definition: "Mitokondri matriksinde asetil CoA’nın tamamen CO₂’ye yükseltgendiği döngü; her turda 3 NADH, 1 FADH₂, 1 ATP ve 2 CO₂ oluşur." },
      { term: "Elektron taşıma sistemi (ETS)", definition: "Mitokondri iç zarındaki proteinler zinciri; NADH ve FADH₂’nin elektronlarını O₂’ye aktarırken H⁺ gradyanı kurar, ATP sentaz bu gradyanla ATP üretir (oksidatif fosforilasyon)." },
      { term: "Fermantasyon", definition: "O₂ yokken pirüvatın (ya da türevinin) organik bir son elektron alıcısı olarak indirgenmesi; NAD⁺ yenilenir, glikoliz sürer, yalnızca 2 ATP kazanılır." },
      { term: "Oksijensiz solunum", definition: "Bazı bakterilerde ETS’nin kullanıldığı fakat son elektron alıcısının O₂ yerine nitrat, sülfat gibi inorganik bir madde olduğu solunum." },
      { term: "Kemosentez", definition: "Bazı bakterilerin inorganik maddeleri oksitleyerek kazandığı enerjiyle CO₂’den organik madde sentezlemesi; bu organik maddeler daha sonra solunumda kullanılabilir." },
    ],
    formulas: [
      { expr: "C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + enerji (ATP + ısı)", meaning: "Oksijenli solunumun genel denklemi; fotosentez denkleminin tersine benzer." },
      { expr: "Glikoliz: glikoz → 2 pirüvat + 2 NADH + net 2 ATP", meaning: "Tüm solunum türlerinin ortak başlangıcıdır." },
      { expr: "2 pirüvat → 2 asetil CoA + 2 CO₂ + 2 NADH", meaning: "Mitokondride gerçekleşir; Krebs’e giriş basamağıdır." },
      { expr: "Krebs (2 tur): 6 NADH + 2 FADH₂ + 2 ATP + 4 CO₂", meaning: "Bir glikoz iki asetil CoA verdiği için döngü iki kez döner." },
      { expr: "ATP hesabı (1 NADH = 3, 1 FADH₂ = 2 ATP kabulüyle): 10·3 + 2·2 = 34 (ETS) + 2 + 2 = 38", meaning: "Ders kitaplarında kullanılan en yüksek teorik değer; kabul değişirse sonuç da değişir, soruda verilen kabulü kullan." },
      { expr: "Etil alkol fermantasyonu: glikoz → 2 etanol + 2 CO₂ + 2 ATP", meaning: "Maya ve bazı bakterilerde; hamurun kabarması, alkollü içecek üretimi." },
      { expr: "Laktik asit fermantasyonu: glikoz → 2 laktik asit + 2 ATP", meaning: "CO₂ çıkmaz; yoğurt yapımı ve O₂’si yetersiz kalan kas hücreleri." },
    ],
    logic:
      "Glikozu tek hamlede yakmak, bir kütüğü bir anda ateşe vermeye benzer: enerji ısı olarak kaçar. Hücre bunun yerine glikozu küçük basamaklarla yükseltgenir ve açığa çıkan elektronları NAD⁺ ve FAD’ye yükler. Bu taşıyıcılar elektronları ETS’ye götürür; elektronlar zincir boyunca enerji kaybederek sonunda O₂’ye aktarılır ve su oluşur. Kaybedilen enerji, iç zarın iki yanında H⁺ farkı oluşturmak için kullanılır; H⁺ iyonları ATP sentazdan geri akarken ATP üretilir.\n\nNeden O₂ olmayınca Krebs ve ETS durur? Çünkü ETS’nin sonunda elektronu alacak kimse yoktur; NADH birikir, NAD⁺ tükenir ve NAD⁺’ye ihtiyaç duyan Krebs de durur. Glikolizin sürmesi de NAD⁺’ye bağlıdır. Fermantasyonun tek “amacı” pirüvatı (ya da asetaldehiti) indirgeyerek NAD⁺’yi geri kazanmaktır; bu sayede glikoliz devam eder ve hücre en azından 2 ATP üretir.\n\nNeden fermantasyonun ürünleri hâlâ enerji içerir? Etanol ve laktik asit tam yükseltgenmemiş organik moleküllerdir; glikozun enerjisinin büyük kısmı bu ürünlerde kalır. Bu yüzden aynı ATP için fermantasyon çok daha fazla glikoz harcar.\n\nKemosentez ve fotosentez organik madde üretir, solunum ise bu organik maddeyi yıkarak ATP üretir. Yani üretici canlılar da solunum yapar; üretim ile yıkım birbirinin alternatifi değil, tamamlayıcısıdır.",
    examples: [
      {
        level: "kolay",
        problem: "Etil alkol ve laktik asit fermantasyonunun ortak ve farklı yönlerini belirtiniz.",
        steps: [
          "Ortak: ikisi de glikoliz ile başlar, sitoplazmada olur, net 2 ATP verir, NAD⁺’yi yeniler, O₂ kullanmaz.",
          "Fark: etil alkol fermantasyonunda CO₂ çıkar ve ürün etanoldür; laktik asitte CO₂ çıkmaz, ürün laktik asittir.",
        ],
        answer: "Ortak: glikoliz, 2 ATP, NAD⁺ yenilenmesi. Fark: CO₂ yalnızca etil alkol fermantasyonunda çıkar.",
      },
      {
        level: "orta",
        problem: "1 NADH = 3 ATP ve 1 FADH₂ = 2 ATP kabul edilirse, bir glikozun oksijenli solunumunda Krebs döngüsü ile ilgili taşıyıcılardan ETS’de kaç ATP üretilir?",
        steps: [
          "Krebs 2 tur döner: 6 NADH ve 2 FADH₂ oluşur.",
          "6 · 3 = 18 ATP; 2 · 2 = 4 ATP.",
          "Toplam 18 + 4 = 22 ATP (Krebs’in kendi substrat düzeyindeki 2 ATP’si bu sayıya dahil değildir).",
        ],
        answer: "22 ATP",
      },
      {
        level: "zor",
        problem: "Bir maya kültürü oksijenli ortamda 1 mol glikozdan net 38 mol ATP elde ediyor. Aynı miktar ATP’yi oksijensiz ortamda üretebilmesi için kaç mol glikoz harcaması ve kaç mol CO₂ açığa çıkarması gerekir?",
        steps: [
          "Fermantasyonda 1 glikozdan net 2 ATP elde edilir.",
          "38 / 2 = 19 mol glikoz gerekir.",
          "Etil alkol fermantasyonunda her glikozdan 2 CO₂ çıkar → 19 · 2 = 38 mol CO₂.",
          "Karşılaştırma: oksijenli solunumda 1 mol glikozdan 6 mol CO₂ çıkar; fermantasyonda aynı ATP için daha fazla glikoz ve daha fazla CO₂ söz konusudur.",
        ],
        answer: "19 mol glikoz, 38 mol CO₂",
      },
    ],
    osymThinking:
      "Sorular sıklıkla bir deney düzeneği (KOH’lu şişede çimlenen tohum, kapalı kapta maya) ya da zaman–miktar grafiği verir; O₂ bittiğinde hangi yola geçildiğini, CO₂’nin hangi basamakta çıktığını, ATP’nin hangi yolla (substrat düzeyi/oksidatif) üretildiğini yorumlatır. ATP hesabında soru mutlaka bir kabul verir; bu kabulü kullanmak gerekir. Siyanür gibi ETS engelleyicileriyle zincirleme etki (NADH birikmesi → Krebs’in durması) sorgulanır.",
    commonMistakes: [
      "Glikolizin mitokondride gerçekleştiğini sanmak.",
      "Laktik asit fermantasyonunda da CO₂ çıktığını düşünmek.",
      "Fermantasyonda ETS’nin çalıştığını sanmak; ETS yalnızca oksijenli ve oksijensiz solunumda vardır.",
      "O₂’nin Krebs döngüsünde doğrudan kullanıldığını düşünmek; O₂ yalnızca ETS’nin sonunda kullanılır.",
      "ATP hesabında bitiş sayısını ezbere yazıp sorunun verdiği NADH/FADH₂ kabulünü görmezden gelmek.",
      "Bitkilerin yalnızca geceleri solunum yaptığını sanmak.",
    ],
    tips: [
      "CO₂ nerede çıkar? Glikolizde çıkmaz; pirüvat → asetil CoA’da 2, Krebs’te 4. Toplam 6.",
      "O₂ nerede kullanılır? Sadece ETS’nin son basamağında; su oluşur.",
      "“O₂ bitti ama CO₂ artmaya devam ediyor” → etil alkol fermantasyonu; “O₂ bitti, CO₂ sabit, laktat arttı” → laktik asit fermantasyonu.",
      "Siyanür / O₂ yokluğu → ETS durur → NADH birikir → Krebs durur → yalnızca glikoliz + fermantasyon.",
    ],
    summary: [
      "Oksijenli solunum: glikoliz (sitoplazma) → asetil CoA → Krebs (matriks) → ETS (iç zar).",
      "Glikoliz net 2 ATP + 2 NADH; Krebs (2 tur) 2 ATP + 6 NADH + 2 FADH₂ + 4 CO₂.",
      "ATP’nin çoğu ETS’de oksidatif fosforilasyonla üretilir; son elektron alıcısı O₂’dir ve su oluşur.",
      "Fermantasyon: O₂ yok, ETS yok, NAD⁺ yenilenir, net 2 ATP; etil alkol (CO₂ var) ve laktik asit (CO₂ yok).",
      "Oksijensiz solunum: ETS var, son elektron alıcısı nitrat/sülfat gibi inorganik madde.",
      "Kemosentez ve fotosentez organik madde üretir; solunum bu maddeyi yıkarak ATP üretir.",
    ],
  },

  // ---------------------------------------------------------------------------
  // BİTKİ BİYOLOJİSİ
  // ---------------------------------------------------------------------------
  {
    topicId: "aytbio-bitki-biyolojisi",
    intro:
      "Bitkiler yer değiştiremez; bu yüzden büyüme, taşıma ve çevreye tepki verme sorunlarını hayvanlardan çok farklı yollarla çözer. Bir ağacın tepesine onlarca metre su çıkması, yaprakta üretilen şekerin köke ya da meyveye gitmesi, gövdenin ışığa doğru eğilmesi ve bir çiçeğin tohuma dönüşmesi bu konunun ana başlıklarıdır.\n\nÖnce yapıyı öğreniriz: kök, gövde, yaprak ve bunları oluşturan dokular (meristem, parankima, koruyucu, destek ve iletim dokuları). Sonra taşınıma geçeriz: su ve mineraller ksilemle kökten yaprağa (kök basıncı, kapilarite, kohezyon-gerilim); organik maddeler floemle kaynaktan havuza (basınç akış) taşınır.\n\nArdından bitkinin “haberleşmesi”ni, yani hormonları (oksin, gibberellin, sitokinin, absisik asit, etilen) ve tepkileri (tropizma, nasti) inceleriz. Son olarak eşeysiz (vejetatif) üreme ile çiçek, tozlaşma, çift döllenme, tohum ve meyve oluşumunu öğreniriz. AYT’de bu konu deney yorumu ve kavram ayrımı açısından zengindir.",
    prerequisites: [
      "Hücre çeperi, koful ve turgor basıncı kavramları",
      "Osmoz, difüzyon ve aktif taşıma",
      "Mitoz, mayoz ve kromozom sayısı (n, 2n)",
      "Fotosentez ve terlemenin (transpirasyon) genel tanımı",
    ],
    concepts: [
      { term: "Meristem", definition: "Sürekli bölünebilen hücrelerden oluşan doku. Kök ve gövde ucundaki apikal meristem boyuna büyümeyi, kambiyum ve mantar kambiyumu (lateral meristem) enine büyümeyi sağlar." },
      { term: "Ksilem", definition: "Su ve mineralleri kökten yapraklara tek yönlü taşıyan iletim dokusu; iletken elemanları (trake, trakeid) olgunlukta ölü hücrelerdir." },
      { term: "Floem", definition: "Organik maddeleri kaynaktan havuza taşıyan iletim dokusu; kalburlu boru hücreleri canlıdır ama olgunlukta çekirdeksizdir, arkadaş hücreler onları destekler. Taşınım yönü ihtiyaca göre değişebilir." },
      { term: "Kohezyon-gerilim teorisi", definition: "Yapraktaki terleme ksilemde negatif basınç (gerilim) oluşturur; su molekülleri arasındaki kohezyon ve çeperlere adezyon sayesinde su sütunu kopmadan yukarı çekilir." },
      { term: "Kök basıncı", definition: "Kökte aktif mineral alımının oluşturduğu osmotik farkla suyun ksileme itilmesi; gutasyon bunun kanıtıdır." },
      { term: "Basınç akış hipotezi", definition: "Kaynakta şeker aktif taşımayla floeme yüklenir, su osmozla girer ve basınç artar; havuzda şeker boşaltılır, basınç düşer; sıvı yüksek basınçtan düşük basınca akar." },
      { term: "Tropizma", definition: "Uyarının yönüne bağlı büyüme hareketi (fototropizma, gravitropizma, tigmotropizma, hidrotropizma, kemotropizma)." },
      { term: "Nasti", definition: "Uyarının yönünden bağımsız, genellikle turgor değişimiyle olan hareket (ör. küstüm otunun dokunmayla yapraklarını kapatması, lale çiçeğinin sıcaklığa göre açılıp kapanması)." },
      { term: "Çift döllenme", definition: "Kapalı tohumlularda bir sperm yumurtayı döller (zigot, 2n), diğeri iki kutup çekirdeğiyle birleşir (endosperm, 3n)." },
    ],
    formulas: [
      { expr: "Terleme ↑ → ksilemde gerilim ↑ → su taşınımı ↑", meaning: "Sıcak, rüzgârlı, kuru hava ve açık stomalar terlemeyi, dolayısıyla su yükselişini artırır." },
      { expr: "Bekçi hücresine K⁺ girişi → su girişi → turgor ↑ → stoma açılır", meaning: "Işık stomaları açar; absisik asit (ABA) K⁺ çıkışını sağlayarak stomaları kapatır." },
      { expr: "Kaynak (yüksek basınç) → floem → havuz (düşük basınç)", meaning: "Yaz: yaprak kaynak, kök/meyve havuz. İlkbahar: kökteki depo kaynak, tomurcuk havuz." },
      { expr: "Oksin → gölge tarafta birikir → o taraf daha çok uzar → gövde ışığa eğilir", meaning: "Fototropizmanın hormonal açıklaması; gövdede oksin hücre uzamasını uyarır." },
      { expr: "Sperm + yumurta → zigot (2n) ; sperm + 2 kutup çekirdeği → endosperm (3n)", meaning: "Çift döllenme; zigot embriyoya, endosperm besin dokusuna dönüşür." },
      { expr: "Tohum taslağı → tohum ; ovaryum (yumurtalık) → meyve", meaning: "Döllenmeden sonra çiçek yapılarının dönüşümü." },
    ],
    logic:
      "Bir ağacın tepesine suyu pompa değil, güneş taşır. Güneş enerjisiyle yapraktaki su buharlaşır (terleme); stomadan kaybedilen her su molekülü, arkasındaki moleküle kohezyonla bağlı olduğu için bir sonrakini çeker. Böylece köke kadar uzanan kesintisiz bir su sütunu yukarı doğru çekilir. Bu mekanizma enerji harcamaz ama su sütunu kopmamalıdır; ksilem hücrelerinin ölü ve içi boş, çeperlerinin sağlam (lignin) olması bu yüzden avantajdır. Kök basıncı ise gece ya da terlemenin düşük olduğu nemli koşullarda devreye girer; gutasyon bunun görünür sonucudur.\n\nFloemde durum farklıdır: taşınan madde şekerdir ve taşınım canlı hücrelerde, enerji harcanarak yapılan yükleme–boşaltma sayesinde olur. Şekerin nereye gideceğini organın “ihtiyacı” belirler; bu yüzden aynı organ bir mevsimde kaynak, başka bir mevsimde havuz olabilir.\n\nHormonlar tek başına değil, dengeyle çalışır. Oksin tepe tomurcuğundan aşağı taşınarak yan tomurcukları baskılar (tepe baskınlığı); tepe kesilince yan dallar gelişir. Sitokinin bu baskıya karşı çalışır. Gibberellin tohumdaki dormansiyi kırar, ABA ise dormansiyi sürdürür ve kuraklıkta stomaları kapatır. Etilen gaz olduğu için bir meyveden diğerine geçerek olgunlaşmayı hızlandırır.\n\nÜremede çift döllenmenin mantığı ekonomidir: endosperm yalnızca döllenme gerçekleşirse oluşur, böylece bitki besin dokusunu boşa üretmez.",
    examples: [
      {
        level: "kolay",
        problem: "Küstüm otunun dokunulunca yapraklarını kapatması tropizma mı, nasti midir? Neden?",
        steps: [
          "Hareketin yönü dokunmanın geldiği yöne bağlı değildir.",
          "Hareket büyümeyle değil, yaprak tabanındaki hücrelerin turgor kaybıyla hızla gerçekleşir.",
          "Yönden bağımsız, turgor değişimine dayalı hareket nastidir (sismonasti).",
        ],
        answer: "Nastidir (sismonasti).",
      },
      {
        level: "orta",
        problem: "Bir bitkinin gövdesinden halka şeklinde kabuk (floem dâhil) soyulursa kısa ve uzun vadede ne olur?",
        steps: [
          "Floem kesildiği için yapraklardan köke organik madde gidemez; kesiğin üstünde şeker birikir ve şişkinlik oluşur.",
          "Ksilem sağlam olduğundan su ve mineraller bir süre yapraklara taşınmaya devam eder; bitki hemen solmaz.",
          "Kökler depo besinlerini tüketince enerji yetersizliğinden ölür, su alımı durur ve bitki zamanla kurur.",
        ],
        answer: "Kısa vadede kesik üstünde şişkinlik, bitki canlı; uzun vadede kök ölür, bitki kurur.",
      },
      {
        level: "zor",
        problem: "Bir fasulye bitkisinin tepe tomurcuğu kesiliyor ve kesik yüzeye oksin içeren lanolin macunu sürülüyor. Başka bir bitkiye ise oksinsiz lanolin sürülüyor. Yan tomurcuklarda ne gözlenir, bu deneyde kontrol grubunun işlevi nedir?",
        steps: [
          "Oksinsiz lanolin sürülen bitkide tepeden gelen oksin kesildiği için yan tomurcuklar gelişir.",
          "Oksinli lanolin sürülen bitkide oksin yine aşağıya taşınır ve yan tomurcukları baskılar; yan dallar gelişmez.",
          "Oksinsiz lanolin, macunun kendisinin etkili olmadığını gösteren kontrol grubudur; tek değişken oksindir.",
        ],
        answer: "Oksinli grupta yan tomurcuklar baskılanır, oksinsiz grupta gelişir; tepe baskınlığının oksinle sağlandığı sonucuna varılır.",
      },
    ],
    osymThinking:
      "Sorular dokuların ölü/canlı olması, ksilem ve floemde taşınım yönü, terlemeyi etkileyen koşullar, hormon–etki eşleştirmeleri ve tropizma/nasti ayrımı üzerinden kurulur. Deney sorularında (koleoptil ucu, agar bloğu, bilezik soyma, tepe tomurcuğu kesme) kontrol grubunun neyi dışladığını ve tek değişkenin ne olduğunu bulmak beklenir. Mevsime göre kaynak–havuz değişimi ve çift döllenmede kromozom sayıları dikkat tuzağı olarak kullanılır.",
    commonMistakes: [
      "Ksilemin canlı hücrelerden oluştuğunu ya da floemin tek yönlü taşıdığını sanmak.",
      "Kohezyon-gerilim mekanizmasının ATP harcadığını düşünmek; enerjiyi güneş sağlar.",
      "Fototropizmada oksinin ışık alan tarafta biriktiğini söylemek; gölge tarafta birikir.",
      "Absisik asidin stomaları açtığını sanmak; kapatır.",
      "Endospermin 2n olduğunu düşünmek; kapalı tohumlularda 3n’dir.",
      "Tropizma ile nastiyi yalnızca hızla ayırmak; asıl ölçüt uyarının yönüne bağlı olup olmamasıdır.",
    ],
    tips: [
      "“Ölü taşır su, canlı taşır şeker”: ksilem ölü, floem canlı iletken hücrelerden oluşur.",
      "Hormon kısaltması: Oksin uzatır, Gibberellin çimlendirir-uzatır, Sitokinin böler-gençleştirir, ABA durdurur-kapatır, Etilen olgunlaştırır.",
      "Kaynak–havuz sorusunda “şekeri kim üretiyor ya da depodan kim veriyor?” diye sor; o kaynaktır.",
      "Çift döllenmede iki sperm var: biri yumurtaya (2n), biri kutup çekirdeklerine (3n).",
    ],
    summary: [
      "Meristem büyümeyi sağlar: apikal boyuna, kambiyum enine büyüme.",
      "Ksilem: ölü, su-mineral, kökten yaprağa tek yön; floem: canlı, organik madde, kaynaktan havuza.",
      "Su yükselişi: kohezyon-gerilim (asıl), kök basıncı ve kapilarite (yardımcı).",
      "Stoma: K⁺ girişi → turgor ↑ → açılma; ABA → kapanma.",
      "Hormonlar: oksin, gibberellin, sitokinin (büyütücü); ABA, etilen (durdurucu/olgunlaştırıcı).",
      "Tropizma yönlü büyüme hareketidir; nasti yönden bağımsız, çoğu zaman turgor hareketidir.",
      "Kapalı tohumlularda çift döllenme: zigot 2n, endosperm 3n; tohum taslağı → tohum, ovaryum → meyve.",
    ],
  },
];
