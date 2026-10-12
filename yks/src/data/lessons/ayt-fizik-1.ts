import type { LessonSeed } from '../../domain/types';

export const lessons: LessonSeed[] = [
  // ---------------------------------------------------------------- Vektörler
  {
    topicId: 'aytfiz-vektorler',
    intro:
      "Fizikte bazı büyüklükleri tek bir sayıyla anlatabilirsin: kütle 5 kg, sıcaklık 20 °C, süre 3 s. Bunlara skaler büyüklük denir. Ama “5 N’luk kuvvet uyguladım” dediğinde karşındaki hemen “Hangi yöne?” diye sorar. Kuvvet, hız, ivme, yer değiştirme, momentum gibi büyüklükler ancak büyüklük + doğrultu + yön ile tam tanımlanır; bunlar vektördür.\n\nAYT fiziğinin neredeyse tamamı vektörlerin üzerine kurulur. Newton yasalarında net kuvveti, atışlarda hızın bileşenlerini, momentumda çarpışma sonrası hızları, elektrikte bileşke alanı hep vektör toplamasıyla bulursun. Bu yüzden vektörleri hızlı ve hatasız toplamak, bileşenlere ayırmak sana sınavın geri kalanında ciddi zaman kazandırır.",
    prerequisites: [
      "Dik üçgende sinüs, kosinüs ve Pisagor bağıntısı",
      "Özel üçgenler (3-4-5, 30-60-90, 45-45-90) ve sin37° = 0,6, cos37° = 0,8",
      "Koordinat düzleminde nokta ve doğrultu kavramı",
    ],
    concepts: [
      { term: "Skaler büyüklük", definition: "Yalnızca sayı ve birimle tam olarak ifade edilen büyüklük (kütle, zaman, enerji, iş, sıcaklık, sürat)." },
      { term: "Vektörel büyüklük", definition: "Büyüklük, doğrultu ve yön bilgisi gerektiren büyüklük (kuvvet, hız, ivme, yer değiştirme, momentum, elektrik alan)." },
      { term: "Bileşke vektör", definition: "Birden fazla vektörün yaptığı etkinin aynısını tek başına yapan vektör; vektörlerin toplamıdır." },
      { term: "Eşit vektörler", definition: "Büyüklükleri, doğrultuları ve yönleri aynı olan vektörler; başlangıç noktaları farklı olabilir." },
      { term: "Zıt vektör (−A)", definition: "A ile aynı büyüklük ve doğrultuda, ters yönlü vektör. Çıkarma işlemi A − B = A + (−B) şeklinde yapılır." },
      { term: "Bileşen", definition: "Bir vektörün seçilen eksenler (genellikle x ve y) üzerindeki izdüşümü: Aₓ = A·cosθ, Aᵧ = A·sinθ." },
    ],
    formulas: [
      { expr: "R² = A² + B² + 2·A·B·cosθ", meaning: "Aralarında θ açısı bulunan iki vektörün bileşkesinin büyüklüğü (kosinüs teoremi)." },
      { expr: "|A − B| ≤ R ≤ A + B", meaning: "İki vektörün bileşkesi, zıt yönlüyken en küçük, aynı yönlüyken en büyüktür." },
      { expr: "Aₓ = A·cosθ ,  Aᵧ = A·sinθ", meaning: "x ekseniyle θ açısı yapan vektörün dik bileşenleri." },
      { expr: "R = √(Rₓ² + Rᵧ²) ,  tanα = Rᵧ/Rₓ", meaning: "Bileşenler toplandıktan sonra bileşkenin büyüklüğü ve yönü." },
      { expr: "Eşit büyüklükte iki vektör, aralarındaki açı 120° → R = A", meaning: "Özel durum: 60°’de R = A√3, 90°’de R = A√2, 120°’de R = A." },
    ],
    logic:
      "Vektörlerin toplanmasında büyüklükleri doğrudan toplayamazsın, çünkü her vektör farklı yöne “itiyor” olabilir. 3 birim doğuya ve 4 birim kuzeye yürüyen biri 7 birim değil, 5 birim uzaklaşmıştır. Uç uca ekleme yöntemi tam olarak bu fikri anlatır: ikinci vektöre birincinin bittiği yerden başlarsın; toplam etki, ilk başlangıçtan son uca çizilen oktur.\n\nBileşenlere ayırmanın gücü şuradan gelir: x ve y eksenleri birbirine diktir, bu yüzden x yönündeki etkiler y yönünü hiç etkilemez. Karmaşık açılı vektörleri önce eksenlere izdüşürürsün, sonra her eksende sıradan sayı toplaması yaparsın (işaretlere dikkat ederek). En sonda Pisagor ile iki dik bileşeni tek vektöre çevirirsin. Böylece zor bir geometri problemi, iki basit cebir problemine dönüşür.",
    examples: [
      {
        level: 'kolay',
        problem: "Büyüklükleri 6 N ve 8 N olan iki kuvvet birbirine diktir. Bileşke kuvvetin büyüklüğü nedir? Bu iki kuvvetin açı değiştirildiğinde bileşkesi hangi aralıkta olabilir?",
        steps: [
          "Dik vektörlerde R = √(6² + 8²) = √100 = 10 N.",
          "En küçük bileşke zıt yönlüyken: 8 − 6 = 2 N.",
          "En büyük bileşke aynı yönlüyken: 8 + 6 = 14 N.",
        ],
        answer: "R = 10 N; açı değişirse 2 N ≤ R ≤ 14 N.",
      },
      {
        level: 'orta',
        problem: "Büyüklükleri 10’ar birim olan iki vektör arasındaki açı 120°’dir. Bileşke kaç birimdir?",
        steps: [
          "R² = 10² + 10² + 2·10·10·cos120° = 100 + 100 − 100 = 100.",
          "R = 10 birim. (Eşit büyüklükte, aralarında 120° bulunan iki vektörün bileşkesi her birine eşittir.)",
          "Bileşke, iki vektörün açıortayı doğrultusundadır.",
        ],
        answer: "10 birim",
      },
      {
        level: 'zor',
        problem: "Bir noktaya üç kuvvet etki ediyor: F₁ = 10 N (+x ile 37° yukarı), F₂ = 10 N (−x ile 53° yukarı), F₃ = 14 N (−y yönünde). Bileşke kuvveti bulunuz. (sin37° = 0,6; cos37° = 0,8)",
        steps: [
          "F₁: x = 10·0,8 = 8 N, y = 10·0,6 = 6 N.",
          "F₂: x = −10·cos53° = −6 N, y = 10·sin53° = 8 N.",
          "F₃: x = 0, y = −14 N.",
          "Rₓ = 8 − 6 + 0 = 2 N; Rᵧ = 6 + 8 − 14 = 0.",
          "R = 2 N, +x yönünde.",
        ],
        answer: "2 N, +x yönünde",
      },
    ],
    osymThinking:
      "Vektör soruları çoğu zaman kareli zemin üzerine çizilmiş oklar ya da “bileşke sıfır ise dördüncü vektör nedir?” biçiminde gelir. Ölçülen beceri, uç uca ekleme ve bileşenlere ayırmayı hızlıca yapabilmek; ayrıca büyüklüklerin doğrudan toplanamayacağını fark etmektir. Çeldiriciler genellikle büyüklükleri skaler gibi toplayan ya da çıkarmada yönü ters çevirmeyi unutan öğrenciyi hedefler.",
    commonMistakes: [
      "Vektörlerin büyüklüklerini doğrudan toplamak (3 + 4 = 7 sanmak).",
      "A − B işleminde B’yi ters çevirmeden eklemek.",
      "Açıyı yanlış eksenden ölçüp sin ile cos’u karıştırmak.",
      "Bileşenleri toplarken ters yöndeki bileşenlere eksi işareti vermeyi unutmak.",
    ],
    tips: [
      "Kareli zeminde her vektörü (x, y) kare sayısıyla yaz; sonra sadece sayıları topla.",
      "Kapalı çokgen oluşturan (uç uca eklendiğinde başa dönen) vektörlerin bileşkesi sıfırdır.",
      "37°–53° üçgeninde kenarlar 3-4-5 oranındadır; hesaplamayı hızlandırır.",
    ],
    summary: [
      "Vektör = büyüklük + doğrultu + yön; skaler = yalnız büyüklük.",
      "İki vektörün bileşkesi |A − B| ile A + B arasındadır.",
      "R² = A² + B² + 2AB·cosθ.",
      "Bileşenler: Aₓ = A·cosθ, Aᵧ = A·sinθ; her eksende ayrı topla.",
      "Çıkarma: A − B = A + (−B).",
    ],
  },

  // ---------------------------------------------------------------- Hareket
  {
    topicId: 'aytfiz-hareket',
    intro:
      "Bu konu, hareketi “kim, neye göre, nasıl hızlanıyor?” sorularıyla inceler. Önce bağıl hareketi görürsün: trende oturan yolcu, yanındakine göre durgun ama yere göre saatte 100 km hızla gidiyor. Hareket, gözlemciye göre değişir. Nehirde yüzen biri için de aynı şey geçerli: yüzücünün suya göre hızı ile suyun yere göre hızı vektörel olarak toplanır.\n\nSonra sabit ivmeli harekete geçersin: hızın her saniye aynı miktarda değiştiği hareket. Serbest düşme, düşey atış, yatay atış ve eğik atış aslında aynı fikrin farklı yüzleridir; yatayda ivme yoktur, düşeyde g kadar ivme vardır. Bu iki yönü birbirinden bağımsız çözmeyi öğrendiğinde atış soruları basit bir tabloya dönüşür.",
    prerequisites: [
      "Vektörlerin toplanması ve bileşenlere ayrılması",
      "Konum, yer değiştirme, hız ve ivme tanımları (TYT)",
      "Doğrusal grafiklerde eğim ve alan hesabı",
    ],
    concepts: [
      { term: "Bağıl hız", definition: "Bir cismin başka bir gözlemciye göre hızı: v(A’nın B’ye göre) = vA − vB." },
      { term: "Sabit ivmeli hareket", definition: "İvmenin büyüklüğü ve yönü değişmeyen hareket; hız–zaman grafiği doğrusal olur." },
      { term: "Serbest düşme", definition: "İlk hızsız bırakılan cismin yalnız yer çekimi etkisinde (hava direnci ihmal) g ivmesiyle düşmesi." },
      { term: "Limit hız", definition: "Hava direnci ağırlığa eşitlendiğinde net kuvvet sıfır olur; cisim bu sabit hızla düşer." },
      { term: "Yatay atış", definition: "Yatay hızla fırlatılan cisim; yatayda sabit hızlı, düşeyde serbest düşme hareketi yapar." },
      { term: "Eğik atış", definition: "Yatayla açı yapacak şekilde atılan cisim; tepe noktasında düşey hız sıfır, yatay hız sabittir." },
    ],
    formulas: [
      { expr: "v = v₀ + a·t", meaning: "Sabit ivmeli harekette hızın zamanla değişimi." },
      { expr: "x = v₀·t + ½·a·t²", meaning: "Sabit ivmeli harekette yer değiştirme." },
      { expr: "v² = v₀² + 2·a·x", meaning: "Zamanın bilinmediği durumlarda hız–yol ilişkisi." },
      { expr: "h = ½·g·t² ,  v = g·t", meaning: "Serbest düşmede düşme yüksekliği ve hız." },
      { expr: "t_çıkış = v₀ᵧ/g ,  h_max = v₀ᵧ²/(2g) ,  menzil = vₓ·t_uçuş", meaning: "Eğik atışta çıkış süresi, maksimum yükseklik ve menzil (atış ve iniş aynı seviyede)." },
      { expr: "v(yer) = v(cisim, suya göre) + v(akıntı)", meaning: "Akıntılı ortamda yere göre hız vektörel toplamdır." },
    ],
    logic:
      "Hız–zaman grafiğinin eğimi ivmeyi, altında kalan alan yer değiştirmeyi verir; çünkü ivme “hızın birim zamandaki değişimi”, yer değiştirme de “hız × süre”nin toplamıdır. Bu iki fikri iyi oturtursan grafik sorularını formülsüz çözersin.\n\nAtışlarda yatay ve düşey hareketlerin bağımsız olmasının nedeni, yer çekimi kuvvetinin tamamen düşey olmasıdır; yatayda hiçbir kuvvet olmadığı için (hava direnci yok) yatay hız hiç değişmez. Bu yüzden aynı yükseklikten biri yatay atılan, diğeri serbest bırakılan iki top yere aynı anda düşer. Nehir problemlerinde de karşıya geçiş süresini yalnız akıntıya dik hız belirler; akıntı sadece cismi yana sürükler.",
    examples: [
      {
        level: 'kolay',
        problem: "4 m/s hızla giden bir araç 2 m/s² sabit ivmeyle hızlanıyor. 5 s sonra hızı ve bu sürede aldığı yol nedir?",
        steps: [
          "v = v₀ + a·t = 4 + 2·5 = 14 m/s.",
          "x = v₀·t + ½·a·t² = 4·5 + ½·2·25 = 20 + 25 = 45 m.",
          "Kontrol: ortalama hız (4 + 14)/2 = 9 m/s, 9·5 = 45 m.",
        ],
        answer: "14 m/s ve 45 m",
      },
      {
        level: 'orta',
        problem: "Genişliği 80 m olan nehirde akıntı hızı 3 m/s’dir. Suya göre 4 m/s hızla kıyıya dik yüzen bir yüzücü karşı kıyıya kaç saniyede ulaşır, ne kadar sürüklenir?",
        steps: [
          "Karşıya geçiş süresini yalnız kıyıya dik hız belirler: t = 80/4 = 20 s.",
          "Sürüklenme = akıntı hızı × süre = 3·20 = 60 m.",
          "Yere göre hızı √(4² + 3²) = 5 m/s, aldığı yol 5·20 = 100 m.",
        ],
        answer: "20 s, 60 m sürüklenir",
      },
      {
        level: 'zor',
        problem: "Yerden 50 m/s hızla yatayla 37° açı yapacak şekilde atılan cismin uçuş süresini, maksimum yüksekliğini ve menzilini bulunuz. (sin37° = 0,6)",
        steps: [
          "vₓ = 50·0,8 = 40 m/s; v₀ᵧ = 50·0,6 = 30 m/s.",
          "Çıkış süresi 30/10 = 3 s; uçuş süresi 6 s.",
          "h_max = 30²/(2·10) = 45 m.",
          "Menzil = 40·6 = 240 m.",
        ],
        answer: "6 s, 45 m, 240 m",
      },
    ],
    osymThinking:
      "Bu konudaki sorular çoğunlukla hız–zaman grafiği verip “hangi aralıkta yavaşlıyor, ne zaman yön değiştiriyor, başlangıca en uzak ne zaman?” gibi yorumlar ister. Atışlarda iki cismin çarpışması, aynı anda yere düşme veya tepe noktasındaki hız sorgulanır. Bağıl harekette ise yağmur damlasının araçtaki gözlemciye nasıl göründüğü gibi günlük hayat bağlamları kullanılır. Ölçülen beceri, hareketi bileşenlerine ayırıp her birini ayrı yorumlamaktır.",
    commonMistakes: [
      "Hız–zaman grafiğinde hızın negatif olduğu bölgeyi yavaşlama sanmak; yavaşlama hız ile ivmenin zıt işaretli olmasıdır.",
      "Eğik atışın tepe noktasında hızı sıfır sanmak; yalnız düşey hız sıfırdır, yatay hız vardır.",
      "Nehir problemlerinde karşıya geçiş süresine akıntı hızını katmak.",
      "Yukarı atılan cismin tepe noktasında ivmesini sıfır sanmak; ivme her an g’dir.",
    ],
    tips: [
      "Hız–zaman grafiğinde alanları işaretli topla: eksen üstü +, altı −.",
      "Serbest düşmede ardışık 1’er saniyede alınan yollar 5, 15, 25, 35 m… (1:3:5:7) oranındadır.",
      "Eğik atışta menzil 45°’de en büyüktür; toplamı 90° olan açılar (37°–53°) aynı menzili verir.",
    ],
    summary: [
      "Bağıl hız: v(A/B) = vA − vB.",
      "v = v₀ + at, x = v₀t + ½at², v² = v₀² + 2ax.",
      "v–t grafiğinde eğim = ivme, alan = yer değiştirme.",
      "Atışlarda yatay hareket sabit hızlı, düşey hareket g ivmeli.",
      "Tepe noktasında düşey hız sıfır, yatay hız korunur.",
      "Nehirde geçiş süresi = genişlik / dik hız bileşeni.",
    ],
  },

  // ---------------------------------------------------------------- Newton yasaları
  {
    topicId: 'aytfiz-newton-yasalari',
    intro:
      "Newton’ın üç yasası, “bir cisim neden hareket eder, neden durur, neden hızlanır?” sorularının cevabıdır. Birinci yasa (eylemsizlik) der ki: net kuvvet yoksa cisim durumunu korur; duruyorsa durur, sabit hızla gidiyorsa öyle devam eder. Otobüs aniden fren yaptığında öne savrulman bundandır; vücudun hareketini sürdürmek ister.\n\nİkinci yasa hareketin matematiğidir: F_net = m·a. Net kuvvet ivmeyi belirler, hızı değil. Bu ayrım AYT’de sürekli sınanır: bir cisim sola giderken sağa doğru ivmelenebilir (yavaşlıyordur).\n\nÜçüncü yasa (etki–tepki) ise kuvvetlerin daima çift hâlinde ortaya çıktığını söyler. Sen duvarı itersen duvar da seni aynı büyüklükte iter. Ancak bu iki kuvvet farklı cisimlere etki ettiğinden birbirini yok etmez; bu nokta en çok karıştırılan yerdir.\n\nBu konuda sürtünme, iple bağlı cisimler, eğik düzlem ve asansör problemleri ile Newton yasalarını her tür sisteme uygulamayı öğreneceksin.",
    prerequisites: [
      "Vektörlerin bileşenlere ayrılması",
      "Sabit ivmeli hareket denklemleri",
      "Ağırlık (G = m·g) ve kütle farkı",
      "Serbest cisim diyagramı çizebilme",
    ],
    concepts: [
      { term: "Eylemsizlik", definition: "Cismin hareket durumunu koruma eğilimi; kütle, eylemsizliğin ölçüsüdür." },
      { term: "Net kuvvet", definition: "Cisme etki eden tüm kuvvetlerin vektörel toplamı; ivmenin yönünü belirler." },
      { term: "Etki–tepki kuvvetleri", definition: "İki cismin birbirine uyguladığı eşit büyüklüklü, zıt yönlü kuvvetler; farklı cisimlere etki ettikleri için birbirini dengelemez." },
      { term: "Statik sürtünme", definition: "Cisim hareket etmezken uygulanan kuvvete eşit ve zıt olan, en fazla μₛ·N olabilen sürtünme kuvveti." },
      { term: "Kinetik sürtünme", definition: "Kayan cisme etki eden, hareket yönüne zıt, büyüklüğü μₖ·N olan sürtünme kuvveti; hızdan bağımsızdır." },
      { term: "Normal kuvvet", definition: "Yüzeyin cisme uyguladığı, yüzeye dik tepki kuvveti; her zaman ağırlığa eşit değildir." },
      { term: "Görünür ağırlık", definition: "İvmeli sistemde cismin tartıya uyguladığı kuvvet; yukarı ivmelenirken artar, aşağı ivmelenirken azalır." },
    ],
    formulas: [
      { expr: "F_net = m·a", meaning: "Newton’ın ikinci yasası: net kuvvet, kütle ile ivmenin çarpımıdır." },
      { expr: "f_k = μₖ·N ,  f_s ≤ μₛ·N", meaning: "Kinetik sürtünme sabittir; statik sürtünme en fazla μₛ·N değerine kadar çıkar." },
      { expr: "a = (itici kuvvetler − engelleyici kuvvetler) / toplam kütle", meaning: "Bağlantılı sistemlerde ortak ivme." },
      { expr: "Eğik düzlem: mg·sinθ (paralel) , N = mg·cosθ", meaning: "Eğik düzlemde ağırlığın bileşenleri." },
      { expr: "N = m·(g + a) (yukarı ivme) ,  N = m·(g − a) (aşağı ivme)", meaning: "Asansörde görünür ağırlık." },
      { expr: "Eğik düzlemde kaymaya başlama: tanθ = μₛ", meaning: "Cismin kendiliğinden kaymaya başladığı kritik açı." },
    ],
    logic:
      "Neden F = m·a? Çünkü aynı kuvvet, kütlesi büyük olan cismi daha az hızlandırır: kütle “harekete direnç”tir. Kuvvet iki katına çıkınca ivme iki katına çıkar, kütle iki katına çıkınca ivme yarıya iner. Bu yüzden bağlantılı sistemlerde tüm sistemi tek bir cisim gibi düşünüp “net dış kuvvet / toplam kütle” ile ortak ivmeyi bulursun; ip gerilmeleri iç kuvvettir, sistem içinde birbirini götürür.\n\nİp gerilmesini bulmak için ise sistemi parçalara ayırırsın: tek bir cisme bakınca ip artık dış kuvvettir. Sürtünmede ise önce cismin kayıp kaymadığını kontrol etmelisin. Uygulanan kuvvet μₛ·N’yi aşmıyorsa cisim durur ve statik sürtünme tam olarak uygulanan kuvvete eşittir; bu yüzden “sürtünme = μ·N” formülünü duran cisme körü körüne uygulamak hatalıdır.\n\nAsansörde tartının gösterdiği değer değişir, çünkü tartı sana uygulanan normal kuvveti ölçer. Yukarı ivmelenirken normal kuvvet hem ağırlığı dengeler hem de fazladan m·a kadar kuvvet sağlar.",
    examples: [
      {
        level: 'kolay',
        problem: "Yatay düzlemde duran 4 kg kütleli cisme 30 N’luk yatay kuvvet uygulanıyor. Kinetik sürtünme katsayısı 0,25 ise cismin ivmesi nedir? (g = 10 m/s²)",
        steps: [
          "N = m·g = 40 N; f = 0,25·40 = 10 N.",
          "F_net = 30 − 10 = 20 N.",
          "a = 20/4 = 5 m/s².",
        ],
        answer: "5 m/s²",
      },
      {
        level: 'orta',
        problem: "Sürtünmesiz sabit bir makaranın iki yanına 3 kg ve 2 kg kütleli cisimler asılıyor ve sistem serbest bırakılıyor. Sistemin ivmesi ve ip gerilmesi nedir?",
        steps: [
          "Sistemi hareket ettiren net kuvvet: 30 − 20 = 10 N.",
          "Toplam kütle 5 kg → a = 10/5 = 2 m/s².",
          "2 kg’lık cisim yukarı ivmeleniyor: T − 20 = 2·2 → T = 24 N.",
          "Kontrol: 3 kg’lık cisim için 30 − T = 3·2 → T = 24 N.",
        ],
        answer: "a = 2 m/s², T = 24 N",
      },
      {
        level: 'zor',
        problem: "Eğim açısı 37° olan eğik düzlemdeki 2 kg’lık cisim, düzlemin tepesindeki makaradan geçen iple 3 kg’lık asılı cisme bağlıdır. Eğik düzlemle cisim arasındaki kinetik sürtünme katsayısı 0,25’tir. Sistemin ivmesi ve ip gerilmesi nedir? (sin37° = 0,6; cos37° = 0,8)",
        steps: [
          "Asılı cismin ağırlığı 30 N sistemi hareket ettirir; 2 kg’lık cisim eğik düzlemde yukarı çıkar.",
          "Eğime paralel ağırlık bileşeni: 20·0,6 = 12 N (aşağı). N = 20·0,8 = 16 N; sürtünme 0,25·16 = 4 N (aşağı).",
          "F_net = 30 − 12 − 4 = 14 N; a = 14/5 = 2,8 m/s².",
          "Asılı cisim için: 30 − T = 3·2,8 → T = 21,6 N.",
        ],
        answer: "a = 2,8 m/s², T = 21,6 N",
      },
    ],
    osymThinking:
      "ÖSYM tarzı sorular Newton yasalarını genellikle “bir cisme uygulanan kuvvet arttırılıyor, sürtünme kuvvetinin kuvvete bağlı grafiği nasıldır?” veya “ip kesilirse hangi cisimlerin ivmesi değişir?” gibi yorum sorularıyla ölçer. Sayısal yükü azaltılmış, kavramı ağırlaştırılmış sorular çıkar: bağlantılı sistemde kütlelerden biri değişince ivme ve gerilmenin nasıl değiştiği; asansörde tartı değerinden ivmenin yönü (hızın değil!). Ölçülen beceri doğru serbest cisim diyagramı çizmek ve net kuvvetle ivme yönünü ilişkilendirmektir.",
    commonMistakes: [
      "Net kuvvetin yönünü hızın yönü sanmak; net kuvvet ivmenin yönündedir.",
      "Duran cisme etki eden statik sürtünmeyi her zaman μₛ·N almak.",
      "Etki–tepki kuvvetlerinin birbirini dengelediğini düşünmek.",
      "Eğik düzlemde normal kuvveti mg almak; doğrusu mg·cosθ’dır (ek dik kuvvet yoksa).",
      "Bağlantılı sistemde ip gerilmesini asılı cismin ağırlığına eşit sanmak; sistem ivmeliyse T ağırlıktan küçüktür.",
    ],
    tips: [
      "Önce tüm sistemi tek cisim gibi al (ivme), sonra tek cisme odaklan (ip gerilmesi).",
      "Tartı yukarı ivme gösteriyorsa asansör yukarı hızlanıyor ya da aşağı yavaşlıyor olabilir; ikisini de düşün.",
      "Sürtünme sorularında önce “cisim kayıyor mu?” kontrolü yap: F ≤ μₛ·N ise f = F.",
    ],
    summary: [
      "Net kuvvet yoksa hız sabit (eylemsizlik).",
      "F_net = m·a; net kuvvet ivmenin yönündedir.",
      "Etki–tepki kuvvetleri eşit, zıt ve farklı cisimlere etki eder.",
      "Kinetik sürtünme μₖN; statik sürtünme en fazla μₛN.",
      "Bağlantılı sistemde a = net dış kuvvet / toplam kütle.",
      "Eğik düzlem: mg·sinθ ve mg·cosθ; asansör: N = m(g ± a).",
    ],
  },

  // ---------------------------------------------------------------- İş ve enerji
  {
    topicId: 'aytfiz-is-enerji',
    intro:
      "Enerji, fiziğin “para birimi” gibidir: biçim değiştirir ama kaybolmaz. İş ise enerjinin bir cisimden diğerine ya da bir türden başka türe aktarılma yoludur. Bir kutuyu yerde iterek kaydırdığında yaptığın iş, kutunun hareket enerjisine ve sürtünmeyle ısıya dönüşür.\n\nFizikte iş, günlük dildeki “yorulmak” ile aynı şey değildir. Elinde ağır bir çantayla yatay yolda sabit hızla yürürken çantaya uyguladığın kuvvet (yukarı) ile yer değiştirme (yatay) birbirine dik olduğundan çantaya iş yapmazsın. İş için kuvvetin, yer değiştirme doğrultusunda bir bileşeni olmalıdır.\n\nBu konunun en güçlü aracı enerjinin korunumudur: sürtünme yoksa kinetik ve potansiyel enerjinin toplamı sabittir. Böylece karmaşık yörüngelerde bile ivme hesabı yapmadan hız bulabilirsin. Sürtünme varsa kayıp enerji, sürtünme kuvvetinin yaptığı işe eşittir. İş–enerji teoremi ise tüm bunları tek cümlede toplar: net iş, kinetik enerji değişimine eşittir.",
    prerequisites: [
      "Newton’ın hareket yasaları ve sürtünme kuvveti",
      "Vektörlerin bileşenleri (kuvvetin yol doğrultusundaki bileşeni)",
      "Grafik altında kalan alan hesabı",
    ],
    concepts: [
      { term: "İş (W)", definition: "Kuvvetin, yer değiştirme doğrultusundaki bileşeni ile yer değiştirmenin çarpımı; birimi joule (J)." },
      { term: "Kinetik enerji", definition: "Hareketten dolayı sahip olunan enerji: Eₖ = ½·m·v²." },
      { term: "Çekim potansiyel enerjisi", definition: "Yer çekimi alanındaki konumdan dolayı depolanan enerji: Eₚ = m·g·h (seçilen referansa göre)." },
      { term: "Esneklik potansiyel enerjisi", definition: "Sıkışan ya da uzayan yayda depolanan enerji: Eₚ = ½·k·x²." },
      { term: "Mekanik enerji", definition: "Kinetik ve potansiyel enerjilerin toplamı; sürtünmesiz ortamda korunur." },
      { term: "Güç", definition: "Birim zamanda yapılan iş ya da aktarılan enerji: P = W/t; birimi watt (W)." },
      { term: "Verim", definition: "Yararlı enerjinin (işin) harcanan toplam enerjiye oranı; her zaman %100’den küçüktür." },
    ],
    formulas: [
      { expr: "W = F·x·cosθ", meaning: "θ, kuvvet ile yer değiştirme arasındaki açıdır; θ = 90° ise iş sıfırdır." },
      { expr: "W_net = ΔEₖ = ½m·v_son² − ½m·v_ilk²", meaning: "İş–enerji teoremi." },
      { expr: "Eₚ = m·g·h ,  Eₚ(yay) = ½·k·x²", meaning: "Çekim ve esneklik potansiyel enerjileri." },
      { expr: "Eₖ₁ + Eₚ₁ = Eₖ₂ + Eₚ₂ + |W_sürtünme|", meaning: "Sürtünme varsa kayıp enerji eşitliğin kayıp tarafına eklenir." },
      { expr: "P = W/t = F·v", meaning: "Güç; sabit hızla hareket ettiren kuvvetin gücü F·v’dir." },
      { expr: "Verim = (yararlı iş / harcanan enerji)·100", meaning: "Makinelerde verim yüzdesi." },
      { expr: "W = F–x grafiğinin altındaki alan", meaning: "Değişken kuvvetin yaptığı iş." },
    ],
    logic:
      "Neden iş cosθ ile çarpılır? Çünkü yalnızca hareket doğrultusundaki kuvvet bileşeni cismi hızlandırır ya da yavaşlatır; dik bileşen hıza katkı yapmaz, sadece normal kuvveti değiştirir. Bu yüzden çembersel harekette merkezcil kuvvet hiç iş yapmaz, cismin süratini değiştirmez.\n\nİş–enerji teoremi Newton’ın ikinci yasasından türer: F_net = m·a ve v² = v₀² + 2ax birleştirilirse F_net·x = ½mv² − ½mv₀² olur. Yani net iş, kinetik enerji değişimidir.\n\nKorunumlu kuvvetler (yer çekimi, yay kuvveti) için iş yoldan bağımsızdır; sadece başlangıç ve bitiş konumuna bağlıdır. Bu nedenle bir top sürtünmesiz eğri bir rampadan kayarken hızı yalnızca düştüğü yüksekliğe bağlıdır, rampanın biçimine değil. Sürtünme ise korunumsuzdur; aldığı yol uzadıkça daha çok enerjiyi ısıya çevirir.",
    examples: [
      {
        level: 'kolay',
        problem: "Yatayla 37° açı yapan 20 N’luk bir kuvvet, cismi yatay düzlemde 5 m çekiyor. Kuvvetin yaptığı iş kaç J’dür? (cos37° = 0,8)",
        steps: [
          "Kuvvetin yol doğrultusundaki bileşeni: 20·0,8 = 16 N.",
          "W = 16·5 = 80 J.",
        ],
        answer: "80 J",
      },
      {
        level: 'orta',
        problem: "2 kg kütleli cisim 5 m yükseklikteki sürtünmesiz rampanın tepesinden serbest bırakılıyor; rampanın sonunda sürtünme katsayısı 0,5 olan yatay yola geçiyor. Cisim yatay yolda kaç m gittikten sonra durur?",
        steps: [
          "Rampanın sonunda: m·g·h = ½·m·v² → v² = 2·10·5 = 100 → v = 10 m/s.",
          "Yatay yolda sürtünme işi kinetik enerjiyi sıfırlar: μ·m·g·d = ½·m·v².",
          "d = v²/(2μg) = 100/(2·0,5·10) = 10 m.",
          "Not: sonuç kütleden bağımsızdır.",
        ],
        answer: "10 m",
      },
      {
        level: 'zor',
        problem: "2 kg kütleli cisim 1,8 m yükseklikteki sürtünmesiz rampadan serbest bırakılıyor ve yatay sürtünmesiz yolda yay sabiti 800 N/m olan yaya çarpıyor. Yay en fazla kaç cm sıkışır? Cismin hızı yarıya indiğinde yay ne kadar sıkışmıştır?",
        steps: [
          "Başlangıç enerjisi: m·g·h = 2·10·1,8 = 36 J; yaya çarpma hızı v = √(2·10·1,8) = 6 m/s.",
          "Maksimum sıkışmada tüm enerji yayda: ½·800·x² = 36 → x² = 0,09 → x = 0,3 m = 30 cm.",
          "Hız 3 m/s iken Eₖ = ½·2·9 = 9 J; yayda 36 − 9 = 27 J.",
          "½·800·x² = 27 → x² = 0,0675 → x ≈ 0,26 m (tam olarak x = 0,15√3 m).",
        ],
        answer: "En fazla 30 cm; hız yarıya indiğinde ≈ 26 cm",
      },
    ],
    osymThinking:
      "Enerji soruları çoğunlukla ara hesaplarla gizlenir: soru “hız” sorar ama asıl yapılacak iş enerji dengesini kurmaktır. Farklı biçimli rampalardan bırakılan cisimlerin hızlarını karşılaştırma, sürtünmeli bölgede enerji kaybını oranlama, yay sıkışmasını yükseklikle ilişkilendirme sık kalıplardır. Kuvvet–yol grafiğinden iş ya da güç–zaman grafiğinden enerji bulma gibi alan yorumları ile yeni nesil sorularda asansör motoru, rüzgâr türbini gibi bağlamlarda verim hesabı istenir.",
    commonMistakes: [
      "Kuvvet ile yer değiştirme dik olduğu hâlde iş hesaplamak (ör. taşıyıcının yatay yürürken yaptığı iş).",
      "İş–enerji teoreminde net iş yerine tek bir kuvvetin işini kullanmak.",
      "Yay enerjisinde x yerine yayın toplam boyunu kullanmak; x, denge konumundan uzama/sıkışmadır.",
      "Sürtünmeli yüzeyde kayıp enerjiyi hesaplarken eğik düzlemde normal kuvveti mg almak.",
      "Hız iki katına çıkınca kinetik enerjinin de iki katına çıktığını sanmak; dört katına çıkar.",
    ],
    tips: [
      "Hız sorulduğunda önce “enerjiyle çözülebilir mi?” diye düşün; ivme hesabından çoğu zaman daha hızlıdır.",
      "Sürtünmesiz ortamda hız yalnızca düşülen yüksekliğe bağlıdır: v = √(2gh).",
      "Kaybolan enerji = sürtünme kuvveti × alınan yol (yer değiştirme değil).",
    ],
    summary: [
      "W = F·x·cosθ; dik kuvvet iş yapmaz.",
      "Net iş = kinetik enerji değişimi.",
      "Eₖ = ½mv², Eₚ = mgh, yay: ½kx².",
      "Sürtünmesizde mekanik enerji korunur.",
      "Sürtünmeli ortamda kayıp = f·yol.",
      "Güç P = W/t = F·v; verim < %100.",
    ],
  },

  // ---------------------------------------------------------------- İtme ve momentum
  {
    topicId: 'aytfiz-itme-momentum',
    intro:
      "Aynı hızla gelen bir tenis topunu ve bir bowling topunu durdurmak aynı derecede kolay değildir. Aradaki fark momentumdur: kütle ile hızın çarpımı. Momentum, hareketin “miktarı”dır ve vektördür; yönü hızın yönüyle aynıdır.\n\nBir cismin momentumunu değiştirmek için ona belirli bir süre kuvvet uygulamak gerekir. Kuvvet ile sürenin çarpımına itme denir ve itme, momentum değişimine eşittir. Hava yastıkları, kasklar ve atlama minderleri bu fikre dayanır: momentum değişimi aynı kalır ama süre uzatılarak kişiye etki eden kuvvet küçültülür.\n\nKonunun kalbi momentumun korunumudur. Dış kuvvetin olmadığı (ya da ihmal edilebildiği) bir sistemde toplam momentum değişmez. Çarpışmalarda, patlamalarda, silahın geri tepmesinde, roketlerin itilmesinde hep bu yasa çalışır. Çarpışmalarda kinetik enerji her zaman korunmaz; momentum ise dış kuvvet yoksa her durumda korunur. Bu ayrım AYT’de mutlaka sorulur.",
    prerequisites: [
      "Vektör toplama ve bileşenlere ayırma",
      "Newton’ın ikinci yasası (F = m·a)",
      "Kinetik enerji bağıntısı",
    ],
    concepts: [
      { term: "Çizgisel momentum (p)", definition: "Kütle ile hızın çarpımı: p = m·v; vektörel, birimi kg·m/s." },
      { term: "İtme (I)", definition: "Kuvvet ile etki süresinin çarpımı: I = F·Δt; birimi N·s, momentum değişimine eşittir." },
      { term: "Momentumun korunumu", definition: "Net dış kuvvet sıfır olan sistemde toplam momentum sabit kalır." },
      { term: "Esnek çarpışma", definition: "Hem momentumun hem toplam kinetik enerjinin korunduğu çarpışma." },
      { term: "Esnek olmayan çarpışma", definition: "Momentumun korunduğu fakat kinetik enerjinin bir kısmının ısı, ses, şekil değişikliğine dönüştüğü çarpışma; cisimler yapışırsa kayıp en fazladır." },
      { term: "Patlama", definition: "Başlangıçta tek parça olan sistemin iç kuvvetlerle parçalara ayrılması; toplam momentum korunur, kinetik enerji artar." },
    ],
    formulas: [
      { expr: "p = m·v", meaning: "Çizgisel momentum." },
      { expr: "I = F·Δt = Δp = m·v_son − m·v_ilk", meaning: "İtme–momentum teoremi (vektörel)." },
      { expr: "İtme = F–t grafiğinin altındaki alan", meaning: "Değişken kuvvetin uyguladığı itme." },
      { expr: "m₁v₁ + m₂v₂ = m₁v₁′ + m₂v₂′", meaning: "Çarpışma ve patlamalarda momentumun korunumu." },
      { expr: "Yapışan cisimler: v_ortak = (m₁v₁ + m₂v₂)/(m₁ + m₂)", meaning: "Tamamen esnek olmayan çarpışma." },
      { expr: "Eₖ = p²/(2m)", meaning: "Momentum ile kinetik enerji arasındaki bağıntı." },
    ],
    logic:
      "İtme–momentum teoremi Newton’ın ikinci yasasının başka bir yazılışıdır: F = m·a = m·Δv/Δt, dolayısıyla F·Δt = m·Δv. Aynı momentum değişimini daha uzun sürede gerçekleştirirsen ortalama kuvvet azalır. Bu yüzden yumuşak zemine düşmek daha az acıtır.\n\nMomentumun korunması üçüncü yasadan gelir: çarpışan iki cisim birbirine eşit büyüklükte ve zıt yönlü kuvvetleri aynı süre boyunca uygular. Dolayısıyla birinin kazandığı momentum diğerinin kaybettiği momentuma eşittir; toplam değişmez.\n\nKinetik enerji neden korunmayabilir? Çünkü çarpışma sırasında cisimler şekil değiştirir, ısınır, ses çıkarır; bu iç süreçler momentumu etkilemez (iç kuvvetler çift hâlinde birbirini götürür) ama enerjiyi başka türe çevirir. Momentum vektörel olduğu için iki boyutlu çarpışmalarda x ve y bileşenleri ayrı ayrı korunur.",
    examples: [
      {
        level: 'kolay',
        problem: "0,5 kg kütleli top 20 m/s hızla duvara dik çarpıyor ve 10 m/s hızla geri dönüyor. Temas süresi 0,05 s ise duvarın topa uyguladığı ortalama kuvvet kaç N’dur?",
        steps: [
          "Geliş yönünü + alalım: v_ilk = +20 m/s, v_son = −10 m/s.",
          "Δp = 0,5·(−10 − 20) = −15 kg·m/s; büyüklüğü 15 kg·m/s.",
          "F = Δp/Δt = 15/0,05 = 300 N (geliş yönüne zıt).",
        ],
        answer: "300 N",
      },
      {
        level: 'orta',
        problem: "4 m/s hızla giden 3 kg kütleli araba, duran 1 kg kütleli arabaya çarpıp yapışıyor. Ortak hız ve kinetik enerji kaybı nedir?",
        steps: [
          "Momentum korunumu: 3·4 + 1·0 = 4·v → v = 3 m/s.",
          "Önceki Eₖ = ½·3·16 = 24 J; sonraki Eₖ = ½·4·9 = 18 J.",
          "Kayıp = 24 − 18 = 6 J.",
        ],
        answer: "3 m/s; 6 J kayıp",
      },
      {
        level: 'zor',
        problem: "Durmakta olan 3 kg’lık bir cisim patlayarak eşit kütleli üç parçaya ayrılıyor. Parçalardan biri doğuya 12 m/s, diğeri kuzeye 16 m/s hızla gidiyor. Üçüncü parçanın hızının büyüklüğü ve yönü nedir?",
        steps: [
          "Her parça 1 kg. Başlangıç momentumu sıfır olduğundan son toplam momentum da sıfırdır.",
          "İlk iki parçanın momentumları: (12, 0) ve (0, 16) kg·m/s.",
          "Üçüncü parça: p = (−12, −16) → |p| = √(144 + 256) = 20 kg·m/s.",
          "v = 20/1 = 20 m/s; yönü güneybatı (batıdan güneye doğru, tanα = 16/12).",
        ],
        answer: "20 m/s, güneybatı yönünde",
      },
    ],
    osymThinking:
      "Momentum soruları sıklıkla kuvvet–zaman grafiği (alan = itme) ya da çarpışma öncesi–sonrası hız tablosu ile verilir. “Hangi çarpışma esnektir?”, “Kinetik enerji kaybı en fazla hangisinde?”, “Yapışan cisimlerin ortak hızı ne yönde?” gibi kavramsal karşılaştırmalar yapılır. Yeni nesil sorularda hava yastığı, kask, roket, buz pateni gibi bağlamlarda momentum değişimi ile kuvvetin süreyle ilişkisi sorgulanır. Ölçülen beceri, momentumun vektörel olduğunu ve enerjiden ayrı korunabildiğini fark etmektir.",
    commonMistakes: [
      "Geri sekmede momentum değişimini hızların farkıyla (20 − 10) bulmak; yön değiştiği için hızlar toplanır.",
      "Tüm çarpışmalarda kinetik enerjinin korunduğunu sanmak.",
      "İki boyutlu çarpışmada momentumları skaler olarak toplamak.",
      "Patlamada kinetik enerjinin de sıfır kaldığını düşünmek; momentum sıfırdır, enerji artar.",
    ],
    tips: [
      "Her problemde önce pozitif yönü seç ve işaretleri buna göre yaz.",
      "Eşit kütleli iki cisim esnek ve merkezi çarpışırsa hızlarını değiş tokuş eder.",
      "Aynı momentumdaki cisimlerden kütlesi küçük olanın kinetik enerjisi büyüktür (Eₖ = p²/2m).",
    ],
    summary: [
      "p = m·v, vektördür.",
      "İtme = F·Δt = Δp = F–t grafiği alanı.",
      "Dış kuvvet yoksa toplam momentum korunur.",
      "Esnek çarpışmada kinetik enerji de korunur; esnek olmayanda azalır.",
      "Patlamada toplam momentum korunur, kinetik enerji artar.",
      "İki boyutta x ve y bileşenleri ayrı ayrı korunur.",
    ],
  },

  // ---------------------------------------------------------------- Tork ve denge
  {
    topicId: 'aytfiz-kuvvet-tork-denge',
    intro:
      "Bir kapıyı menteşeye yakın yerden itmeye çalıştın mı? Çok zorlanırsın. Aynı kuvveti kolun ucuna uygularsan kapı kolayca açılır. Kuvvetin döndürme etkisine tork denir ve tork, kuvvetin büyüklüğü kadar dönme eksenine olan dik uzaklığa da bağlıdır.\n\nBir cismin dengede kalması için iki şart vardır: net kuvvet sıfır olmalı (öteleme dengesi) ve herhangi bir noktaya göre net tork sıfır olmalıdır (dönme dengesi). Tahterevalli, vinçler, köprüler ve asılı tabelalar bu iki şartla incelenir.",
    prerequisites: [
      "Vektörlerin bileşenlere ayrılması",
      "Newton’ın birinci yasası (net kuvvet sıfır → denge)",
      "Trigonometrik oranlar",
    ],
    concepts: [
      { term: "Tork (τ)", definition: "Kuvvetin bir noktaya göre döndürme etkisi: τ = F·d (d: kuvvetin etki çizgisinin noktaya dik uzaklığı); vektörel, birimi N·m." },
      { term: "Kuvvet kolu", definition: "Dönme noktasından kuvvetin etki çizgisine olan dik uzaklık." },
      { term: "Öteleme dengesi", definition: "Cisme etki eden kuvvetlerin vektörel toplamının sıfır olması." },
      { term: "Dönme dengesi", definition: "Herhangi bir noktaya göre torkların toplamının sıfır olması." },
      { term: "Lami teoremi", definition: "Kesişen üç kuvvetle dengede olan noktada her kuvvet, diğer ikisi arasındaki açının sinüsüyle orantılıdır." },
    ],
    formulas: [
      { expr: "τ = F·r·sinθ", meaning: "θ, kuvvet ile dönme noktasından kuvvetin uygulandığı noktaya çizilen vektör arasındaki açı." },
      { expr: "ΣF = 0 ve Στ = 0", meaning: "Tam denge şartları." },
      { expr: "F₁/sinα = F₂/sinβ = F₃/sinγ", meaning: "Lami teoremi (α, F₁’in karşısındaki, yani F₂ ile F₃ arasındaki açı)." },
      { expr: "Türdeş çubuğun ağırlığı orta noktasından etki eder", meaning: "Ağırlıklı çubuk sorularında ağırlık merkezde tek kuvvet gibi alınır." },
    ],
    logic:
      "Tork neden dik uzaklıkla ilgili? Çünkü kuvvetin yalnızca dönme yarıçapına dik bileşeni cismi döndürür; yarıçap doğrultusundaki bileşen sadece dönme noktasını iter ya da çeker. Bu yüzden menteşeye doğru itilen kapı hiç açılmaz.\n\nDengede Στ = 0 herhangi bir noktaya göre sağlandığından, en akıllıca seçim bilinmeyen kuvvetlerin geçtiği noktayı dönme noktası seçmektir: o kuvvetin torku sıfır olur ve denklemden düşer. Böylece tek bilinmeyenli denklem elde edersin.",
    examples: [
      {
        level: 'kolay',
        problem: "0,5 m uzunluğundaki anahtarın ucuna 20 N’luk kuvvet (a) anahtara dik, (b) anahtarla 30° açı yapacak şekilde uygulanıyor. Torklar nedir?",
        steps: [
          "(a) τ = 20·0,5 = 10 N·m.",
          "(b) τ = 20·0,5·sin30° = 5 N·m.",
        ],
        answer: "10 N·m ve 5 N·m",
      },
      {
        level: 'orta',
        problem: "4 m uzunluğunda, 40 N ağırlığındaki türdeş çubuk iki ucundan desteklenmiştir. Sol uçtan 1 m uzağa 60 N’luk yük asılıyor. Desteklerin tepki kuvvetleri nedir?",
        steps: [
          "Sol uca göre tork: N_sağ·4 = 40·2 + 60·1 = 140 → N_sağ = 35 N.",
          "Kuvvet dengesi: N_sol + 35 = 100 → N_sol = 65 N.",
        ],
        answer: "Sol 65 N, sağ 35 N",
      },
      {
        level: 'zor',
        problem: "60 N ağırlığındaki lamba, tavana yatayla 37° ve 53° açı yapan iki iple asılıdır. İplerdeki gerilmeler nedir? (sin37° = 0,6)",
        steps: [
          "Yatay denge: T₁·cos37° = T₂·cos53° → 0,8·T₁ = 0,6·T₂ → T₂ = (4/3)·T₁.",
          "Düşey denge: T₁·0,6 + T₂·0,8 = 60 → 0,6T₁ + (16/15)T₁ = 60 → T₁ = 36 N.",
          "T₂ = 48 N. (İpler birbirine dik olduğundan 36² + 48² = 60² kontrolü sağlanır.)",
        ],
        answer: "T₁ = 36 N (37°’lik ip), T₂ = 48 N (53°’lik ip)",
      },
    ],
    osymThinking:
      "Denge soruları genellikle eşit bölmeli çubuk şekliyle ya da ip gerilmelerinin oranı sorularak gelir. Ölçülen beceri, dönme noktasını akıllıca seçip denklemi tek bilinmeyene indirmek ve ağırlığın ağırlık merkezinden etki ettiğini unutmamaktır. Çeldiriciler çoğunlukla çubuğun kendi ağırlığını ihmal eden ya da kuvvet kolu yerine çubuk boyunu kullanan öğrenciye göre hazırlanır.",
    commonMistakes: [
      "Kuvvet kolu olarak dik uzaklık yerine çubuk üzerindeki uzaklığı almak.",
      "Çubuğun kendi ağırlığını hesaba katmamak.",
      "Tork yönlerini (saat yönü / tersi) karıştırıp işaretleri yanlış vermek.",
    ],
    tips: [
      "Bilinmeyen kuvvetin uygulandığı noktayı dönme ekseni seç.",
      "Eğik iplerde önce kuvvetleri bileşenlere ayır; sonra hem kuvvet hem tork dengesini yaz.",
      "Kesişen iki ip birbirine dikse, gerilmeler ve ağırlık bir dik üçgen oluşturur.",
    ],
    summary: [
      "τ = F·d (dik uzaklık) = F·r·sinθ.",
      "Denge: ΣF = 0 ve Στ = 0.",
      "Türdeş çubuğun ağırlığı ortasından etki eder.",
      "Lami: kuvvet / karşı açının sinüsü = sabit.",
    ],
  },

  // ---------------------------------------------------------------- Kütle merkezi
  {
    topicId: 'aytfiz-kutle-merkezi',
    intro:
      "Bir kalemi parmağının ucunda dengelemeye çalıştığında aslında kütle merkezini arıyorsun. Kütle merkezi, bir cismin tüm kütlesinin toplanmış gibi davrandığı noktadır. Düzgün yer çekimi alanında ağırlık merkezi ile kütle merkezi aynı noktadadır.\n\nKütle merkezi, cismin nasıl devrileceğini, nasıl dengede duracağını ve dış kuvvetlerle nasıl hareket edeceğini belirler. Ayrıca sabit bir yerde durması gerekmez; bir halkanın kütle merkezi halkanın boş ortasındadır.",
    prerequisites: [
      "Koordinat düzleminde nokta belirleme",
      "Tork ve denge şartları",
      "Alan ve uzunluk hesapları (türdeş levha ve teller için)",
    ],
    concepts: [
      { term: "Kütle merkezi", definition: "Sistemin kütlesinin ağırlıklı ortalama konumu; dış kuvvetler sanki bu noktaya etki ediyormuş gibi hareket eder." },
      { term: "Ağırlık merkezi", definition: "Cismin ağırlığının etki ettiği nokta; düzgün çekim alanında kütle merkezi ile çakışır." },
      { term: "Türdeş cisim", definition: "Kütlesi hacmine (levhada alanına, telde uzunluğuna) düzgün dağılmış cisim; kütle ölçü ile orantılıdır." },
      { term: "Kararlı denge", definition: "Cisim biraz saptırıldığında kütle merkezi yükselir ve cisim eski konumuna döner." },
      { term: "Kararsız denge", definition: "Cisim biraz saptırıldığında kütle merkezi alçalır ve cisim devrilir." },
      { term: "Nötr (farksız) denge", definition: "Saptırıldığında kütle merkezinin yüksekliği değişmez; cisim yeni konumunda da dengededir (ör. yatay düzlemde küre)." },
    ],
    formulas: [
      { expr: "x_KM = (m₁x₁ + m₂x₂ + …)/(m₁ + m₂ + …)", meaning: "Kütle merkezinin x koordinatı; y için aynı bağıntı kullanılır." },
      { expr: "Türdeş levha: m yerine alan (A), türdeş tel: m yerine uzunluk (L)", meaning: "Kütle, ölçü ile orantılı olduğundan doğrudan alan/uzunluk kullanılabilir." },
      { expr: "Çıkarılan parça: x_KM = (A·x − a·x′)/(A − a)", meaning: "Levhadan parça kesildiğinde kalan kısmın kütle merkezi." },
      { expr: "Devrilmeme şartı: KM’den inen dikme taban içinde kalmalı", meaning: "Eğik düzlemde veya eğilen cisimlerde devrilme kriteri." },
    ],
    logic:
      "Kütle merkezi formülü aslında tork dengesinden gelir: bir çubuğu kütle merkezinden desteklersen, sağdaki ve soldaki ağırlıkların torkları birbirini götürür. m₁x₁ + m₂x₂ = (m₁ + m₂)·x_KM eşitliği tam olarak bu tork dengesinin yazılışıdır.\n\nParça çıkarma yöntemi de aynı mantıktadır: eksik levhayı “tam levha + negatif kütleli parça” gibi düşünürsün. Kütle merkezi her zaman ağır tarafa, çıkarılan parçanın ise ters tarafına kayar.",
    examples: [
      {
        level: 'kolay',
        problem: "x = 0’da 2 kg, x = 5 m’de 3 kg kütleli noktasal cisimler bulunuyor. Kütle merkezi nerededir?",
        steps: [
          "x_KM = (2·0 + 3·5)/(2 + 3) = 15/5.",
          "x_KM = 3 m (ağır cisme daha yakın).",
        ],
        answer: "x = 3 m",
      },
      {
        level: 'orta',
        problem: "1 kg (0, 0), 2 kg (3, 0) ve 3 kg (0, 4) noktalarındadır. Kütle merkezinin koordinatları nedir? (birimler m)",
        steps: [
          "x_KM = (1·0 + 2·3 + 3·0)/6 = 6/6 = 1 m.",
          "y_KM = (1·0 + 2·0 + 3·4)/6 = 12/6 = 2 m.",
        ],
        answer: "(1, 2)",
      },
      {
        level: 'zor',
        problem: "Kenarı 4 cm olan türdeş kare levhanın köşeleri (0,0), (4,0), (4,4), (0,4) noktalarındadır. Sağ üst köşeden kenarı 2 cm olan kare parça kesiliyor. Kalan levhanın kütle merkezi nerededir?",
        steps: [
          "Tam levha: alan 16, KM (2, 2). Kesilen parça: alan 4, KM (3, 3).",
          "x_KM = (16·2 − 4·3)/(16 − 4) = (32 − 12)/12 = 5/3 cm.",
          "Simetri nedeniyle y_KM = 5/3 cm.",
        ],
        answer: "(5/3, 5/3) cm",
      },
    ],
    osymThinking:
      "Kütle merkezi soruları genellikle kareli zemine çizilmiş türdeş levha veya telden oluşan şekillerle gelir ve “parça hangi noktaya taşınırsa KM değişmez?” ya da “kaç parça çıkarılırsa KM şu noktaya gelir?” gibi yorumlar ister. Ölçülen beceri, kütlenin alanla orantılı olduğunu fark edip ağırlıklı ortalamayı hızlıca kurmaktır.",
    commonMistakes: [
      "Kütleleri ağırlıklandırmadan konumların basit ortalamasını almak.",
      "Parça çıkarıldığında KM’nin çıkarılan parçaya doğru kaydığını sanmak (tersine kayar).",
      "Kütle merkezinin her zaman cismin üzerinde olması gerektiğini düşünmek.",
    ],
    tips: [
      "Simetri eksenleri varsa KM mutlaka bu eksen üzerindedir.",
      "Türdeş tellerde her kenarın KM’si orta noktası, kütlesi uzunluğudur.",
      "Kütle merkezi alçaldıkça denge daha kararlı olur.",
    ],
    summary: [
      "x_KM = Σmx / Σm (y için de aynı).",
      "Türdeş cisimde kütle yerine alan ya da uzunluk kullanılır.",
      "Parça çıkarılınca KM ters yöne kayar.",
      "Kararlı, kararsız, nötr denge KM’nin yükselip alçalmasıyla belirlenir.",
    ],
  },

  // ---------------------------------------------------------------- Basit makineler
  {
    topicId: 'aytfiz-basit-makineler',
    intro:
      "Basit makineler, bir işi daha küçük kuvvetle ya da daha uygun yönde yapmamızı sağlayan araçlardır: kaldıraç, makara, palanga, eğik düzlem, çıkrık, vida, dişli ve kasnak. Kapı kolu, el arabası, bayrak direğindeki makara, rampa ve bisiklet dişlileri günlük hayattaki örneklerdir.\n\nEn önemli fikir şudur: basit makineler kuvvetten kazanç sağlar ama işten kazanç sağlamaz. Kuvveti yarıya indirirsen ipi iki kat fazla çekmen gerekir. Sürtünme varsa harcanan iş, elde edilen işten büyük olur ve verim %100’ün altına düşer.",
    prerequisites: [
      "Tork ve denge şartları",
      "İş kavramı (W = F·x)",
      "Çembersel yörüngede çevre hesabı (2πr)",
    ],
    concepts: [
      { term: "Kuvvet kazancı", definition: "Yükün, dengeleyici kuvvete oranı: yük / kuvvet." },
      { term: "Kaldıraç", definition: "Bir destek noktası etrafında dönebilen çubuk; kuvvet kolu yük kolundan uzunsa kuvvetten kazanç sağlar." },
      { term: "Hareketli makara", definition: "Yükle birlikte hareket eden makara; ağırlığı ihmal edilirse yükü taşıyan iki ip kolu nedeniyle kuvveti yarıya indirir." },
      { term: "Palanga", definition: "Sabit ve hareketli makaraların birlikte kullanıldığı sistem; kuvvet kazancı yükü taşıyan ip sayısına eşittir." },
      { term: "Çıkrık", definition: "Farklı yarıçaplı kol ile silindirin aynı eksende dönmesi; kuvvet kazancı R/r’dir." },
      { term: "Verim", definition: "Makineden alınan yararlı işin, makineye verilen işe oranı." },
    ],
    formulas: [
      { expr: "F·(kuvvet kolu) = Yük·(yük kolu)", meaning: "Kaldıraçta denge (tork eşitliği)." },
      { expr: "Palanga: F = (Yük + hareketli makara ağırlıkları) / n", meaning: "n: hareketli kısmı taşıyan ip sayısı." },
      { expr: "Eğik düzlem (sürtünmesiz): F·L = G·h", meaning: "L: eğik düzlem uzunluğu, h: yükseklik." },
      { expr: "Çıkrık: F·R = G·r", meaning: "R: kol yarıçapı, r: silindir yarıçapı." },
      { expr: "Dişli: n₁·r₁ = n₂·r₂ (ya da n₁·diş₁ = n₂·diş₂)", meaning: "Birbirine geçmiş dişlilerde tur sayıları; dönme yönleri zıttır." },
      { expr: "Vida: F·2πR = G·a", meaning: "a: vida adımı; bir tam turda vida bir adım ilerler." },
    ],
    logic:
      "İşten kazanç olmamasının nedeni enerjinin korunumudur. Makine hiç enerji üretmez; sadece aktarır. Kuvveti azalttığında aynı enerjiyi aktarabilmek için yolu uzatmak zorundasın: F·x (verilen) = G·h (alınan). Sürtünme bu aktarımın bir kısmını ısıya çevirir.\n\nKaldıraç ve çıkrık aslında tork dengesidir: küçük kuvvet büyük kolla, büyük yük küçük kolla çarpılınca torklar eşitlenir. Dişlilerde ise birbirine geçen dişlerin çizgisel hızı aynıdır; bu yüzden küçük dişli daha çok tur atar.",
    examples: [
      {
        level: 'kolay',
        problem: "Bir kaldıraçta 300 N’luk yük destek noktasından 0,5 m, kuvvet ise 1,5 m uzaktadır. Dengeleyici kuvvet ve kuvvet kazancı nedir?",
        steps: [
          "F·1,5 = 300·0,5 → F = 100 N.",
          "Kuvvet kazancı = 300/100 = 3.",
        ],
        answer: "100 N; kazanç 3",
      },
      {
        level: 'orta',
        problem: "Hareketli kısmı 4 ip koluyla taşınan bir palangada yük 400 N, hareketli makaraların toplam ağırlığı 40 N’dur. Yükü sabit hızla kaldırmak için gereken kuvvet nedir? Yük 1 m yükselirse ip kaç m çekilir?",
        steps: [
          "F = (400 + 40)/4 = 110 N.",
          "Her ip kolu 1 m kısalmalı: çekilen ip = 4·1 = 4 m.",
        ],
        answer: "110 N; 4 m",
      },
      {
        level: 'zor',
        problem: "Kol yarıçapı 50 cm, silindir yarıçapı 10 cm olan çıkrıkla 500 N’luk kova kuyudan çekiliyor. Çıkrığın verimi %80 ise uygulanması gereken kuvvet nedir? Kova 2 m yükseldiğinde kişinin yaptığı iş kaç J’dür?",
        steps: [
          "Sürtünmesiz ideal kuvvet: F·50 = 500·10 → F = 100 N.",
          "Verim %80 → gerçek kuvvet = 100/0,8 = 125 N.",
          "Yararlı iş = 500·2 = 1000 J; harcanan iş = 1000/0,8 = 1250 J.",
        ],
        answer: "125 N; 1250 J",
      },
    ],
    osymThinking:
      "Basit makine soruları çoğunlukla dişli–kasnak sistemlerinde tur sayısı ve dönme yönü, palangada kuvvet ve ip çekme miktarı, eğik düzlemde verim olarak gelir. Ölçülen beceri, iş ilkesini (işten kazanç yok) ve tork dengesini birlikte kullanmaktır. Çeldiriciler, makara ağırlığını ya da dişlilerin yön değişimini unutan öğrenciyi hedefler.",
    commonMistakes: [
      "Hareketli makaranın ağırlığını hesaba katmamak.",
      "Palangada ip sayısını sayarken sabit makarayı taşıyan ipleri de saymak.",
      "Birbirine geçmiş dişlilerin aynı yönde döndüğünü sanmak; kayışla bağlı kasnaklar (çapraz değilse) aynı yönde döner.",
      "Kuvvet kazancını işten kazanç sanmak.",
    ],
    tips: [
      "Palangada yükü taşıyan ip sayısını, hareketli makaranın altını kesip kesilen ipleri sayarak bul.",
      "Aynı eksendeki kasnaklar aynı tur sayısında döner; birbirine geçmiş dişliler aynı çizgisel hızda döner.",
      "Verimli makinede gereken kuvvet = ideal kuvvet / verim.",
    ],
    summary: [
      "Basit makineler kuvvetten kazandırır, işten kazandırmaz.",
      "Kaldıraç ve çıkrık: tork dengesi.",
      "Palanga: F = toplam yük / taşıyan ip sayısı.",
      "Dişliler: n·r sabit, geçen dişliler zıt yönde döner.",
      "Verim = alınan iş / verilen iş < 1.",
    ],
  },
];
