import type { LessonSeed } from '../../domain/types';

export const lessons: LessonSeed[] = [
  {
    topicId: 'tytfiz-fizik-bilimine-giris',
    intro:
      "Fizik, madde ile enerji arasındaki etkileşimi inceleyen, doğadaki olayları ölçüp modelleyerek açıklamaya çalışan bir bilimdir. Telefonundaki ekranın ışık yaymasından köprülerin taşıyabileceği yüke kadar pek çok şeyin arkasında fizik vardır.\n\nBu konuda fiziğin alt dallarını, fiziksel büyüklükleri (temel-türetilmiş, skaler-vektörel), birim sistemini ve bilimsel yöntemi öğreneceksin. TYT’de genellikle bir soru bu konudan gelir ve çoğunlukla kavram ayrımını ölçer.",
    prerequisites: [
      "Ondalık sayılar ve 10’un kuvvetleriyle işlem yapabilmek",
      "Basit birim dönüşümleri (cm–m, g–kg, dakika–saniye)",
    ],
    concepts: [
      { term: "Temel büyüklük", definition: "Başka büyüklükler cinsinden tanımlanamayan büyüklük. SI’da yedi tanedir: uzunluk, kütle, zaman, elektrik akımı, sıcaklık, madde miktarı, ışık şiddeti." },
      { term: "Türetilmiş büyüklük", definition: "Temel büyüklüklerden elde edilen büyüklük; örneğin hız, kuvvet, enerji, basınç, özkütle." },
      { term: "Skaler büyüklük", definition: "Yalnızca büyüklük (sayı + birim) ile ifade edilen büyüklük: kütle, zaman, sürat, enerji, sıcaklık." },
      { term: "Vektörel büyüklük", definition: "Büyüklüğünün yanında yönü de olan büyüklük: yer değiştirme, hız, ivme, kuvvet, ağırlık." },
      { term: "Hipotez", definition: "Bir probleme yönelik, deneyle sınanabilir geçici çözüm önerisi." },
      { term: "Bağımsız değişken", definition: "Deneyde araştırmacının bilerek değiştirdiği değişken; bağımlı değişken ise bu değişime bağlı olarak ölçülen değişkendir." },
    ],
    formulas: [
      { expr: "1 N = 1 kg·m/s²", meaning: "Kuvvet birimi, F = m·a bağıntısından temel birimlerle yazılır." },
      { expr: "1 J = 1 N·m = 1 kg·m²/s²", meaning: "Enerji ve iş birimi." },
      { expr: "1 W = 1 J/s = 1 kg·m²/s³", meaning: "Güç birimi." },
      { expr: "1 Pa = 1 N/m²", meaning: "Basınç birimi." },
    ],
    logic:
      "Fizikte her şey ölçmeye dayanır; ölçmek ise bir büyüklüğü aynı cinsten, birim olarak seçilmiş bir büyüklükle karşılaştırmaktır. Bu yüzden herkesin aynı birimi kullanması (SI) gerekir.\n\nTüretilmiş birimleri ezberlemek yerine tanım bağıntısından yola çıkarsan hata yapmazsın: iş = kuvvet × yol olduğu için J = N·m, N da kg·m/s² olduğundan J = kg·m²/s² olur. Skaler-vektörel ayrımında ise sorman gereken tek soru şudur: “Bu büyüklüğün bir yönü var mı?”",
    examples: [
      {
        level: 'kolay',
        problem: "Basınç biriminin (Pa) SI temel birimleri cinsinden karşılığını bulunuz.",
        steps: [
          "P = F/A olduğundan Pa = N/m².",
          "N = kg·m/s² yazılır: Pa = (kg·m/s²)/m².",
          "Sadeleştirilir: Pa = kg/(m·s²).",
        ],
        answer: "kg/(m·s²)",
      },
      {
        level: 'orta',
        problem: "Bir öğrenci, farklı uzunlukta iplere aynı kütleyi bağlayıp sarkacın bir salınım süresini ölçüyor. Değişkenleri belirleyiniz.",
        steps: [
          "Öğrencinin bilerek değiştirdiği şey ip uzunluğudur: bağımsız değişken.",
          "Ölçülen sonuç salınım süresidir (periyot): bağımlı değişken.",
          "Kütle, ortam ve bırakma açısı sabit tutulur: kontrol edilen değişkenler.",
        ],
        answer: "Bağımsız: ip uzunluğu; bağımlı: periyot; kontrol: kütle, açı, ortam.",
      },
    ],
    osymThinking:
      "Bu konudaki sorular genellikle kavram eşleştirmesi üzerinden gelir: bir teknoloji örneği verilir ve ilgili alt dal sorulur ya da bir liste verilip vektörel/türetilmiş olanlar istenir. Deney tasarımı verilip bağımlı-bağımsız değişkeni bulman beklenebilir. Tuzak genellikle sürat-hız, kütle-ağırlık gibi benzer adlı büyüklüklerdedir.",
    commonMistakes: [
      "Kütleyi vektörel, ağırlığı skaler sanmak (tam tersi doğrudur).",
      "Sıcaklığı türetilmiş büyüklük sanmak; sıcaklık temel büyüklüktür.",
      "Hipotezi kanıtlanmış bilgi, teoriyi ‘tahmin’ gibi görmek.",
      "Hassas aletle ölçüm hatasının tamamen yok edilebileceğini düşünmek.",
    ],
    tips: [
      "Yedi temel büyüklüğü “uzunluk-kütle-zaman-akım-sıcaklık-madde miktarı-ışık şiddeti” sırasıyla ezberle; gerisi türetilmiştir.",
      "Birim sorularında tanım bağıntısını yaz, birimleri yerine koy ve sadeleştir.",
    ],
    summary: [
      "SI’da 7 temel büyüklük vardır; diğerleri türetilmiştir.",
      "Yönü olan büyüklük vektöreldir: hız, ivme, kuvvet, yer değiştirme, ağırlık.",
      "Bilimsel araştırma gözlem, soru, hipotez ve sınama arasında ilerler. Yasa düzenliliği betimler, teori açıklama sunar; teori kanıtlanınca yasaya dönüşmez.",
      "Her ölçümde hata vardır; hassas aletle azaltılır ama sıfırlanamaz.",
    ],
  },
  {
    topicId: 'tytfiz-madde-ve-ozellikleri',
    intro:
      "Aynı büyüklükteki bir tahta küp ile demir küpü eline aldığında demirin daha ağır geldiğini hissedersin; çünkü demirin birim hacmindeki kütlesi, yani özkütlesi daha büyüktür. Özkütle maddeler için ayırt edici bir özelliktir.\n\nBu konu özkütle hesaplarının yanında dayanıklılık, adezyon-kohezyon, yüzey gerilimi ve kılcallık gibi günlük hayatta sürekli karşılaştığın olayları da kapsar. Karınca kendi ağırlığının kat kat fazlasını taşırken filin bunu yapamaması, peçetenin suyu çekmesi ya da su örümceğinin suda yürümesi bu konunun örnekleridir.",
    prerequisites: [
      "Oran-orantı ve kesirlerle işlem",
      "Küp ve dikdörtgenler prizmasının alan ve hacim formülleri",
      "Birim dönüşümü: 1 g/cm³ = 1000 kg/m³",
    ],
    concepts: [
      { term: "Özkütle (d)", definition: "Birim hacimdeki madde miktarı; aynı sıcaklık ve basınçta saf maddeler için ayırt edicidir." },
      { term: "Dayanıklılık", definition: "Bir yapının kendi ağırlığı altında ezilmeye karşı direnci; kesit alanı/hacim oranıyla orantılıdır." },
      { term: "Kohezyon", definition: "Aynı cins moleküller arasındaki çekim kuvveti." },
      { term: "Adezyon", definition: "Farklı cins moleküller arasındaki çekim kuvveti (örneğin su ile cam arasında)." },
      { term: "Yüzey gerilimi", definition: "Sıvı yüzeyindeki moleküllerin içe doğru çekilmesiyle yüzeyin gergin bir zar gibi davranması." },
      { term: "Kılcallık", definition: "Sıvının ince borularda adezyon-kohezyon farkı nedeniyle yükselmesi veya alçalması." },
    ],
    formulas: [
      { expr: "d = m/V", meaning: "Özkütle, kütlenin hacme oranıdır." },
      { expr: "d_karışım = (m₁ + m₂)/(V₁ + V₂)", meaning: "Hacim kaybı olmayan karışımın özkütlesi toplam kütle bölü toplam hacimdir." },
      { expr: "Eşit hacim: d = (d₁ + d₂)/2 ; Eşit kütle: d = 2·d₁·d₂/(d₁ + d₂)", meaning: "İki sıvının özel karışım durumları." },
      { expr: "Dayanıklılık ∝ Kesit alanı / Hacim ; küpte ∝ 1/a", meaning: "Boyut büyüdükçe dayanıklılık azalır." },
    ],
    logic:
      "Bir cismin tüm boyutları k katına çıkarsa kesit alanı k², hacmi (dolayısıyla ağırlığı) k³ katına çıkar. Ağırlık, onu taşıyan kesitten daha hızlı büyüdüğü için oran 1/k katına düşer; büyük cisimler kendi ağırlıklarına göre daha az dayanıklıdır.\n\nKılcallıkta adezyon kohezyondan büyükse sıvı çepere tutunup yükselir (su-cam), küçükse sıvı alçalır (cıva-cam). Tüp inceldikçe tutunma yüzeyinin taşınacak sıvıya oranı arttığı için etki daha belirgindir.",
    examples: [
      {
        level: 'kolay',
        problem: "Hacmi 40 cm³ olan bir cismin kütlesi 108 g’dır. Özkütlesi nedir?",
        steps: ["d = m/V = 108/40", "d = 2,7 g/cm³ (alüminyumun özkütlesine eşittir)."],
        answer: "2,7 g/cm³",
      },
      {
        level: 'orta',
        problem: "Özkütlesi 1 g/cm³ olan sıvıdan 100 cm³ ile özkütlesi 1,6 g/cm³ olan sıvıdan 50 cm³ karıştırılıyor. Karışımın özkütlesi nedir?",
        steps: ["Kütleler: 100·1 = 100 g ve 50·1,6 = 80 g.", "Toplam kütle 180 g, toplam hacim 150 cm³.", "d = 180/150 = 1,2 g/cm³."],
        answer: "1,2 g/cm³",
      },
      {
        level: 'zor',
        problem: "Aynı maddeden yapılmış kenarları 1 cm ve 4 cm olan iki küpün dayanıklılıkları oranı nedir?",
        steps: ["Küpte dayanıklılık ∝ a²/a³ = 1/a.", "D₁/D₂ = (1/1)/(1/4) = 4."],
        answer: "4",
      },
    ],
    osymThinking:
      "Özkütle soruları çoğunlukla kütle-hacim grafiği veya tablo ile verilir; grafiğin eğimi özkütledir. Karışım sorularında hacimlerin mi kütlelerin mi eşit olduğuna dikkat etmen ölçülür. Adezyon-kohezyon ve yüzey gerilimi soruları günlük hayat örnekleri (deterjan, su örümceği, kılcal boru, peçete) üzerinden öncüllü biçimde gelir.",
    commonMistakes: [
      "Karışım özkütlesini doğrudan özkütlelerin ortalaması olarak almak (bu yalnız eşit hacimlerde doğrudur).",
      "Özkütlenin cismin miktarına bağlı olduğunu sanmak; kütle artınca hacim de artar, oran sabittir.",
      "Deterjanın yüzey gerilimini artırdığını düşünmek; azaltır.",
      "Tüp genişledikçe kılcal yükselmenin arttığını sanmak; azalır.",
    ],
    tips: [
      "Kütle-hacim grafiğinde daha dik doğru, daha büyük özkütle demektir.",
      "Karışımda önce her sıvının kütlesini bul; özkütleyi en son hesapla.",
      "Boyut k katına çıkınca: alan k², hacim k³, dayanıklılık 1/k.",
    ],
    summary: [
      "d = m/V; saf maddeler için ayırt edici özelliktir.",
      "Karışım özkütlesi toplam kütle/toplam hacimdir ve iki özkütle arasında kalır.",
      "Dayanıklılık kesit alanı/hacim ile orantılıdır; büyüdükçe azalır.",
      "Adezyon > kohezyon ise sıvı çepere tutunur ve kılcal boruda yükselir.",
      "Sıcaklık artınca veya deterjan eklenince yüzey gerilimi azalır.",
    ],
  },
  {
    topicId: 'tytfiz-hareket-ve-kuvvet',
    intro:
      "Hareket, bir cismin konumunun zamanla değişmesidir. Bir otobüs yolculuğunda gideceğin yere ne kadar sürede varacağını tahmin ederken aslında ortalama sürat hesabı yaparsın. Fizikte ise alınan yol ile yer değiştirmeyi, sürat ile hızı dikkatle ayırırız.\n\nKuvvet kısmında Newton’un üç yasasını öğrenirsin: cisimler üzerlerine net kuvvet etki etmedikçe hareket durumlarını korur, net kuvvet ivme kazandırır ve her etkiye eşit, zıt bir tepki vardır. TYT’de grafik yorumlama ve F = m·a uygulamaları çok sık sorulur.",
    prerequisites: [
      "Doğrusal grafik okuma, eğim ve alan hesabı",
      "Vektörlerde yön kavramı (pozitif-negatif yön)",
      "Birim dönüşümü: km/h ↔ m/s",
    ],
    concepts: [
      { term: "Yer değiştirme", definition: "İlk konumdan son konuma çizilen yönlü doğru parçası; vektöreldir." },
      { term: "Alınan yol", definition: "Hareket boyunca izlenen yörüngenin toplam uzunluğu; skalerdir." },
      { term: "Ortalama hız", definition: "Yer değiştirmenin geçen süreye oranı." },
      { term: "İvme", definition: "Birim zamandaki hız değişimi; hız-zaman grafiğinin eğimidir." },
      { term: "Eylemsizlik", definition: "Cismin hareket durumunu koruma eğilimi; kütle ile ölçülür." },
      { term: "Sürtünme kuvveti", definition: "Temas eden yüzeyler arasında harekete veya hareket eğilimine zıt yönde oluşan kuvvet." },
    ],
    formulas: [
      { expr: "v_ort = Δx/Δt ; sürat_ort = alınan yol/Δt", meaning: "Ortalama hız ve ortalama sürat." },
      { expr: "a = Δv/Δt", meaning: "İvme." },
      { expr: "F_net = m·a", meaning: "Newton’un ikinci yasası." },
      { expr: "f_s = k·N", meaning: "Kinetik sürtünme kuvveti; N yüzeyin tepki kuvvetidir (yatay düzlemde N = m·g)." },
      { expr: "Δx = hız-zaman grafiği altındaki alan", meaning: "Yer değiştirme grafik alanından bulunur." },
    ],
    logic:
      "Konum-zaman grafiğinin eğimi hızı, hız-zaman grafiğinin eğimi ivmeyi, altındaki alan ise yer değiştirmeyi verir; çünkü eğim ‘birim zamandaki değişim’, alan ise ‘çarpım’ anlamı taşır.\n\nNet kuvvet sıfırsa ivme sıfırdır; bu, cismin durduğu anlamına gelmez, sabit hızla da gidiyor olabilir. Etki-tepki kuvvetleri ise farklı cisimlere etki ettiği için birbirini dengelemez.",
    examples: [
      {
        level: 'kolay',
        problem: "Bir araç 30 dakikada 45 km yol alıyor. Ortalama sürati kaç km/h’tir?",
        steps: ["Süre 0,5 h.", "Sürat = 45/0,5 = 90 km/h."],
        answer: "90 km/h",
      },
      {
        level: 'orta',
        problem: "5 kg kütleli cisim yatay düzlemde 40 N’luk yatay kuvvetle çekiliyor. Sürtünme katsayısı 0,4 ise ivme nedir? (g = 10 m/s²)",
        steps: ["N = m·g = 50 N; f_s = 0,4·50 = 20 N.", "F_net = 40 − 20 = 20 N.", "a = 20/5 = 4 m/s²."],
        answer: "4 m/s²",
      },
      {
        level: 'zor',
        problem: "Duruştan harekete geçen bir araç 5 s boyunca düzgün hızlanarak 10 m/s’ye ulaşıyor, sonra 5 s sabit hızla gidiyor. Toplam yer değiştirme ve ortalama hız nedir?",
        steps: ["İlk 5 s: üçgen alanı = (5·10)/2 = 25 m.", "Sonraki 5 s: dikdörtgen alanı = 5·10 = 50 m.", "Toplam 75 m; ortalama hız 75/10 = 7,5 m/s."],
        answer: "75 m; 7,5 m/s",
      },
    ],
    osymThinking:
      "Sorular çoğunlukla grafik üzerinden gelir: konum-zaman grafiğinde yön değişimi, hız-zaman grafiğinde alan ve eğim sorulur. Ortalama hız ile ortalama sürat aynı soruda birlikte istenerek dikkat ölçülür. Newton yasalarında etki-tepki çiftlerini dengelenmiş kuvvetlerle karıştırıp karıştırmadığın sınanır.",
    commonMistakes: [
      "Ortalama hızı hızların aritmetik ortalaması sanmak.",
      "Net kuvvet sıfırsa cismin kesinlikle durduğunu düşünmek.",
      "Sürtünme kuvvetini uygulanan kuvvetle aynı yönde almak.",
      "Etki-tepki kuvvetlerinin aynı cisme etki ettiğini düşünmek.",
    ],
    tips: [
      "Ortalama hız/sürat sorularında önce toplam yol ve toplam süreyi ayrı ayrı bul.",
      "Bağlı cisim sistemlerinde önce tüm sistemi tek cisim gibi alıp ivmeyi bul, sonra tek cisme ayır.",
    ],
    summary: [
      "Yer değiştirme ve hız vektörel; yol ve sürat skalerdir.",
      "x-t eğimi hız, v-t eğimi ivme, v-t alanı yer değiştirmedir.",
      "F_net = m·a; net kuvvet sıfırsa hız sabittir.",
      "Sürtünme harekete zıttır: f = k·N.",
    ],
  },
  {
    topicId: 'tytfiz-is-guc-enerji',
    intro:
      "Günlük dilde çok yorulduğumuz her şeye ‘iş’ deriz; fizikte ise iş yalnızca kuvvet uygulanan cisim kuvvet doğrultusunda yer değiştirdiğinde yapılır. Duvarı saatlerce itsen de duvar yerinden oynamıyorsa fiziksel anlamda iş yapmış olmazsın.\n\nEnerji iş yapabilme yeteneğidir; kinetik, potansiyel, ısı, elektrik gibi biçimlere dönüşür ama yoktan var edilemez. Güç ise işin ne kadar hızlı yapıldığını gösterir. TYT’de enerji korunumu, kuvvet-yol grafiği ve verim soruları sık görülür.",
    prerequisites: [
      "Newton’un hareket yasaları ve ağırlık (G = m·g)",
      "Grafik altındaki alanı hesaplama",
    ],
    concepts: [
      { term: "İş (W)", definition: "Kuvvet ile kuvvet doğrultusundaki yer değiştirmenin çarpımı; skalerdir, birimi joule." },
      { term: "Güç (P)", definition: "Birim zamanda yapılan iş veya aktarılan enerji; birimi watt." },
      { term: "Kinetik enerji", definition: "Hareketten dolayı sahip olunan enerji: ½·m·v²." },
      { term: "Çekim potansiyel enerjisi", definition: "Yüksekliğe bağlı enerji: m·g·h." },
      { term: "Verim", definition: "Yararlı enerjinin harcanan toplam enerjiye oranı." },
    ],
    formulas: [
      { expr: "W = F·x·cosθ", meaning: "Kuvvetin hareket doğrultusundaki bileşeninin yaptığı iş." },
      { expr: "E_k = ½·m·v² ; E_p = m·g·h", meaning: "Kinetik ve potansiyel enerji." },
      { expr: "P = W/t", meaning: "Güç." },
      { expr: "E_ilk = E_son + W_sürtünme", meaning: "Sürtünmeli ortamda kaybolan mekanik enerji ısıya dönüşür." },
      { expr: "Verim = (yararlı enerji / harcanan enerji)·100", meaning: "Yüzde verim." },
    ],
    logic:
      "Enerji korunur; sürtünmesiz ortamda cisim alçaldıkça kaybettiği potansiyel enerji kadar kinetik enerji kazanır. Sürtünme varsa aradaki fark ısıya dönüşür, yani enerji yok olmaz, işe yaramayan biçime geçer.\n\nKuvvet-yol grafiğinde alan kuvvet × yol olduğundan işi verir. Hareket doğrultusuna dik kuvvetler (ör. yatay harekette ağırlık) iş yapmaz.",
    examples: [
      {
        level: 'kolay',
        problem: "2 kg kütleli cisim 5 m yükseğe sabit hızla çıkarılıyor. Yapılan iş kaç J’dir? (g = 10 m/s²)",
        steps: ["Sabit hızda uygulanan kuvvet ağırlığa eşittir: 20 N.", "W = 20·5 = 100 J."],
        answer: "100 J",
      },
      {
        level: 'orta',
        problem: "Sürtünmesiz bir rampanın 20 m yüksekliğinden serbest bırakılan cismin rampanın dibindeki hızı kaç m/s’dir?",
        steps: ["m·g·h = ½·m·v² → v² = 2·g·h.", "v² = 2·10·20 = 400.", "v = 20 m/s."],
        answer: "20 m/s",
      },
    ],
    osymThinking:
      "Sorular genellikle bir enerji dönüşüm sürecini (rampa, asansör, hidroelektrik santral) anlatır ve hangi noktada hangi enerjinin ne kadar olduğunu sorar. Kuvvet-yol grafiğinde alanı hesaplama ve verim tablosunu yorumlama becerisi ölçülür. İşin sıfır olduğu durumlar (dik kuvvet, yer değiştirmesiz kuvvet) tuzak olarak kullanılır.",
    commonMistakes: [
      "Yatay yolda ağırlığın iş yaptığını sanmak.",
      "Kuvvetin tamamını çarpmak; eğik kuvvette yalnızca hareket doğrultusundaki bileşen iş yapar.",
      "Sürtünmeli ortamda mekanik enerjinin korunduğunu varsaymak.",
      "Güç ile enerjiyi karıştırmak; güç enerjinin zamana oranıdır.",
    ],
    tips: [
      "Enerji sorularında ilk ve son durum tablosu yap: E_p, E_k ve ısı sütunları.",
      "Kuvvet-yol grafiğinde alan iştir; hız-zaman grafiğiyle karıştırma.",
    ],
    summary: [
      "W = F·x (kuvvet doğrultusunda); birim J.",
      "E_k = ½mv², E_p = mgh; sürtünmesizde toplam korunur.",
      "Sürtünmeyle kaybolan mekanik enerji ısıya dönüşür.",
      "P = W/t; verim = yararlı/harcanan.",
    ],
  },
  {
    topicId: 'tytfiz-isi-sicaklik-genlesme',
    intro:
      "Sıcak bir çay bardağını tuttuğunda elin ısınır; çünkü sıcaklığı yüksek olan çaydan eline enerji aktarılır. Bu aktarılan enerjiye ısı, maddenin taneciklerinin ortalama hareket enerjisinin göstergesine ise sıcaklık denir. İkisi aynı şey değildir.\n\nBu konuda ısı alışverişini, ısıl dengeyi, hâl değişimini, termometre ölçeklerini ve genleşmeyi öğreneceksin. Demiryolu raylarındaki boşluklar, köprülerdeki dilatasyon aralıkları ve donmuş gölün altında yaşayan balıklar bu konunun günlük hayattaki karşılıklarıdır.",
    prerequisites: [
      "Oran-orantı ve doğrusal denklem çözümü",
      "Madde ve özkütle kavramı",
    ],
    concepts: [
      { term: "Sıcaklık", definition: "Taneciklerin ortalama kinetik enerjisinin ölçüsü; termometreyle ölçülür, enerji değildir." },
      { term: "Isı", definition: "Sıcaklık farkı nedeniyle aktarılan enerji; kalorimetre kabıyla ölçülür." },
      { term: "Öz ısı (c)", definition: "1 g maddenin sıcaklığını 1 °C artırmak için gereken ısı; ayırt edicidir." },
      { term: "Erime ısısı (L)", definition: "Erime sıcaklığındaki 1 g katıyı tamamen sıvı hâle getirmek için gereken ısı." },
      { term: "Genleşme katsayısı (α)", definition: "Birim uzunluktaki maddenin sıcaklık 1 °C arttığında uzama miktarı; ayırt edicidir." },
    ],
    formulas: [
      { expr: "Q = m·c·ΔT", meaning: "Hâl değiştirmeden sıcaklık değişimi için gereken ısı." },
      { expr: "Q = m·L", meaning: "Hâl değişimi sırasında alınan/verilen ısı (sıcaklık sabit)." },
      { expr: "Σ Q_alınan = Σ Q_verilen", meaning: "Isıl denge (dışarıya ısı kaybı yoksa)." },
      { expr: "ΔL = L₀·α·ΔT", meaning: "Boyca genleşme." },
      { expr: "(X − X_donma)/(X_kaynama − X_donma) = C/100", meaning: "Termometreler arası dönüşüm." },
    ],
    logic:
      "Hâl değişimi sırasında verilen enerji tanecikler arasındaki bağları koparmak için kullanılır; ortalama kinetik enerji değişmediği için sıcaklık sabit kalır. Bu yüzden sıcaklık-ısı grafiğinde yatay bölgeler hâl değişimini gösterir.\n\nSu 0–4 °C aralığında ısıtılınca büzülür, +4 °C’de en yoğun hâldedir. Göllerde soğuyan yüzey suyu 4 °C’ye kadar dibe çöker, daha soğuk su ve buz üstte kalır; buz yalıtkan olduğu için dipteki su donmaz.",
    examples: [
      {
        level: 'kolay',
        problem: "500 g suyun sıcaklığını 20 °C’den 60 °C’ye çıkarmak için kaç kalori gerekir? (c_su = 1 cal/g°C)",
        steps: ["ΔT = 40 °C.", "Q = 500·1·40 = 20 000 cal."],
        answer: "20 000 cal",
      },
      {
        level: 'orta',
        problem: "200 g 70 °C’lik su ile 300 g 20 °C’lik su karıştırılıyor. Denge sıcaklığı nedir?",
        steps: ["Aynı madde olduğu için c sadeleşir: 200·(70 − T) = 300·(T − 20).", "14 000 − 200T = 300T − 6 000.", "500T = 20 000 → T = 40 °C."],
        answer: "40 °C",
      },
    ],
    osymThinking:
      "Sıcaklık-ısı grafiklerinde eğimin kütle × öz ısı ile ters orantılı olduğu, yatay bölgenin hâl değişimi olduğu sorulur. Genleşme soruları tablo veya bimetal şerit deneyi olarak gelir. Isı-sıcaklık kavram karmaşası öncüllerle sınanır; suyun özel genleşmesi günlük hayat bağlamında yeni nesil soru olarak karşına çıkabilir.",
    commonMistakes: [
      "Isı ile sıcaklığı aynı kavram sanmak.",
      "Hâl değişimi sırasında sıcaklığın arttığını düşünmek.",
      "Denge sıcaklığını her zaman iki sıcaklığın ortalaması almak (yalnız eşit ısı sığalarında doğru).",
      "Bimetal şeridin, genleşme katsayısı büyük olan metal tarafına büküldüğünü sanmak.",
    ],
    tips: [
      "Bimetal ısıtılınca katsayısı büyük olan metal dış tarafta (dış bükey) kalır.",
      "Denge sıcaklığı her zaman iki başlangıç sıcaklığı arasındadır; seçenekleri buna göre ele.",
    ],
    summary: [
      "Isı enerjidir, sıcaklık ortalama kinetik enerjinin göstergesidir.",
      "Q = mcΔT; hâl değişiminde Q = mL ve sıcaklık sabittir.",
      "Isıl dengede alınan ısı = verilen ısı.",
      "ΔL = L₀αΔT; su en yoğun hâline +4 °C’de ulaşır.",
    ],
  },
  {
    topicId: 'tytfiz-elektrostatik',
    intro:
      "Kazağını çıkarırken duyduğun çıtırtı ya da tarağın küçük kâğıt parçalarını çekmesi, durgun elektrik yükleriyle ilgilidir. Maddeler normalde eşit sayıda proton ve elektron içerdiği için nötrdür; elektron alan cisim negatif, elektron veren cisim pozitif yüklenir.\n\nElektrostatikte cisimlerin yüklenme yollarını (sürtünme, dokunma, etki), elektroskopu, topraklamayı ve yüklü cisimler arasındaki Coulomb kuvvetini öğrenirsin. Yük hareketinin yalnızca elektronlarla gerçekleştiğini unutma; protonlar çekirdekte kalır.",
    prerequisites: [
      "Atomun yapısı: proton, nötron, elektron",
      "Ters kare orantı ve üslü sayılar",
    ],
    concepts: [
      { term: "Yükün korunumu", definition: "Yalıtılmış bir sistemde toplam elektrik yükü sabittir." },
      { term: "Sürtünmeyle elektriklenme", definition: "Farklı cins iki yalıtkan sürtününce elektron aktarılır; cisimler zıt işaretli, eşit miktarda yüklenir." },
      { term: "Dokunmayla elektriklenme", definition: "İletkenler dokununca yük, sığalarıyla orantılı paylaşılır; özdeş kürelerde toplam yük eşit bölünür." },
      { term: "Etkiyle elektriklenme", definition: "Yüklü bir cisim yaklaştırılınca iletkende yük ayrışması olur; topraklanmadıkça net yük değişmez." },
      { term: "Elektroskop", definition: "Bir cismin yüklü olup olmadığını ve yükün cinsini anlamaya yarayan araç." },
    ],
    formulas: [
      { expr: "F = k·q₁·q₂/d² ; k = 9·10⁹ N·m²/C²", meaning: "Coulomb yasası: kuvvet yüklerin çarpımıyla doğru, uzaklığın karesiyle ters orantılıdır." },
      { expr: "Özdeş küreler: q_son = (q₁ + q₂ + …)/n", meaning: "Dokundurulan özdeş iletkenler toplam yükü eşit paylaşır." },
    ],
    logic:
      "Coulomb kuvveti uzaklığın karesiyle ters orantılıdır; çünkü yükün etkisi uzayda küre yüzeyine yayılır ve küre yüzeyi yarıçapın karesiyle büyür. Uzaklık 2 katına çıkınca kuvvet 1/4’e iner.\n\nİletkenlerde yükler birbirini ittiği için dış yüzeye ve özellikle sivri uçlara toplanır. Paratonerlerin sivri uçlu olması ve yıldırımın yüksek noktalara düşmesi bununla açıklanır.",
    examples: [
      {
        level: 'kolay',
        problem: "Özdeş K (+6q) ve L (−2q) küreleri dokundurulup ayrılıyor. Son yükleri nedir?",
        steps: ["Toplam yük: +6q − 2q = +4q.", "Özdeş olduklarından eşit paylaşılır: her biri +2q."],
        answer: "+2q, +2q",
      },
      {
        level: 'orta',
        problem: "Aralarında d uzaklığı olan q ve 3q yükleri arasındaki kuvvet F’dir. Uzaklık 3d yapılırsa kuvvet ne olur?",
        steps: ["F ∝ 1/d².", "Uzaklık 3 katına çıkınca kuvvet 1/9 katına iner: F/9."],
        answer: "F/9",
      },
    ],
    osymThinking:
      "Özdeş kürelerin sırayla dokundurulması, elektroskop yapraklarının açılıp kapanmasından yük cinsinin çıkarımı ve Coulomb kuvvetinde oran soruları en çok karşına çıkacak kalıplardır. Elektroskop sorularında ‘kesinlikle’ ve ‘olabilir’ ayrımı ölçülür; nötr cismin de çekim yapabildiği unutturulmaya çalışılır.",
    commonMistakes: [
      "Pozitif yüklenmeyi proton kazanmak sanmak; aslında elektron kaybedilir.",
      "Nötr cismin yüklü cisim tarafından çekilemeyeceğini düşünmek.",
      "Uzaklık değişiminde kuvvetin karesel değiştiğini unutmak.",
    ],
    tips: [
      "Sıralı dokundurmada her adımdan sonra yükleri tabloya yaz.",
      "Elektroskop yaprakları daha çok açılıyorsa cisim kesinlikle aynı işaretlidir; kapanıyorsa zıt işaretli ya da nötr olabilir.",
    ],
    summary: [
      "Yük aktarımı elektronlarla olur; toplam yük korunur.",
      "Sürtünme: zıt işaret; dokunma: aynı işaret (özdeşte eşit pay); etki: yük ayrışması.",
      "F = kq₁q₂/d².",
      "Yükler iletkenin dış yüzeyinde ve sivri uçlarda toplanır.",
    ],
  },
  {
    topicId: 'tytfiz-elektrik-akimi',
    intro:
      "Evdeki prizden telefon şarjına, sokak lambalarından elektrikli araçlara kadar her yerde elektrik akımı kullanıyoruz. Elektrik akımı, iletken bir telin kesitinden birim zamanda geçen yük miktarıdır. Metal tellerde bu yükü taşıyan elektronlardır; ancak akımın yönü geleneksel olarak pozitif yüklerin hareket yönü, yani üretecin + kutbundan − kutbuna doğru dış devrede kabul edilir.\n\nAkımın oluşması için bir potansiyel farkı (gerilim) gerekir; üreteç bu farkı sağlayan pompa gibi düşünülebilir. Telin akıma gösterdiği zorluk ise dirençtir. Gerilim, akım ve direnç arasındaki ilişki Ohm yasasıyla kurulur: V = I·R. Bu tek bağıntı, devre sorularının neredeyse tamamının anahtarıdır.\n\nBu konuda dirençlerin seri ve paralel bağlanmasını, üreteçlerin bağlanmasını ve iç direnci, elektrik enerjisi ile gücünü ve lambaların parlaklığını ayrıntılı işleyeceğiz. TYT’de fizik sorularının en az biri neredeyse her yıl bu konudan gelir; özellikle lamba parlaklığı ve anahtar açma-kapama soruları hem kavramı hem dikkati ölçer.\n\nKonuya hâkim olmanın yolu ezber değil, akımın devrede nasıl dağıldığını ‘görmek’tir. Seri bağlı elemanlardan aynı akım geçer; paralel bağlı elemanların uçları arasındaki gerilim aynıdır. Bu iki cümleyi kavradığında en karışık devre bile basit parçalara ayrılır.",
    prerequisites: [
      "Elektrik yükü ve yük birimi coulomb (elektrostatik)",
      "Kesirlerle işlem ve oran-orantı",
      "Enerji ve güç kavramları (J, W)",
      "Birim dönüşümleri: dakika-saniye, W-kW, J-kWh",
    ],
    concepts: [
      { term: "Elektrik akımı (I)", definition: "İletkenin kesitinden birim zamanda geçen yük miktarı; birimi amper (A = C/s). Ampermetre devreye seri bağlanarak ölçülür." },
      { term: "Potansiyel farkı / gerilim (V)", definition: "Birim yük başına aktarılan enerji; birimi volt (V = J/C). Voltmetre ölçülecek elemana paralel bağlanır." },
      { term: "Direnç (R)", definition: "İletkenin akıma karşı gösterdiği zorluk; birimi ohm (Ω). Telin uzunluğu, kesit alanı, cinsi (özdirenç) ve sıcaklığına bağlıdır." },
      { term: "Özdirenç (ρ)", definition: "Maddenin cinsine özgü, 1 m uzunluk ve 1 m² kesitli iletkenin direnci; ayırt edici özelliktir." },
      { term: "Seri bağlama", definition: "Elemanların uç uca eklenmesi; hepsinden aynı akım geçer, gerilimler toplanır." },
      { term: "Paralel bağlama", definition: "Elemanların aynı iki nokta arasına bağlanması; uçlarındaki gerilim aynıdır, ana akım kollara bölünür." },
      { term: "Elektromotor kuvveti (ε)", definition: "Üretecin birim yüke kazandırdığı enerji; devre açıkken üretecin uçları arasındaki gerilimdir." },
      { term: "İç direnç (r)", definition: "Üretecin kendi içindeki direnç; akım geçerken üreteç içinde gerilim düşmesine yol açar." },
      { term: "Elektriksel güç (P)", definition: "Birim zamanda harcanan elektrik enerjisi; birimi watt. Lambanın parlaklığı harcadığı güçle orantılıdır." },
      { term: "Kısa devre", definition: "Bir elemanın uçlarının dirençsiz bir iletkenle birleştirilmesi; akım dirençsiz yolu seçer ve eleman devre dışı kalır." },
    ],
    formulas: [
      { expr: "I = q/t", meaning: "Akım, geçen yükün süreye oranıdır (1 A = 1 C/s)." },
      { expr: "R = ρ·L/A", meaning: "Direnç uzunlukla doğru, kesit alanıyla ters orantılıdır." },
      { expr: "V = I·R", meaning: "Ohm yasası; gerilim-akım grafiğinin eğimi dirpermanence değil, dirençtir." },
      { expr: "Seri: R_eş = R₁ + R₂ + …", meaning: "Seri bağlı dirençlerin eşdeğeri toplamdır; eşdeğer en büyük dirençten büyüktür." },
      { expr: "Paralel: 1/R_eş = 1/R₁ + 1/R₂ + … ; iki direnç için R_eş = R₁·R₂/(R₁ + R₂)", meaning: "Paralel eşdeğer en küçük dirençten küçüktür; n özdeş R için R/n." },
      { expr: "V_uç = ε − I·r ; I = ε_eş/(R_eş + r_eş)", meaning: "İç dirençli üreteçte uç gerilimi ve devre akımı." },
      { expr: "Seri üreteç: ε_eş = ε₁ + ε₂ (ters bağlıysa fark) ; paralel özdeş üreteç: ε_eş = ε", meaning: "Üreteçlerin bağlanması; paralel bağlama gerilimi artırmaz, kullanım ömrünü uzatır." },
      { expr: "P = V·I = I²·R = V²/R", meaning: "Elektriksel güç; seri devrede I²R, paralel devrede V²/R kullanmak kolaylık sağlar." },
      { expr: "E = P·t ; 1 kWh = 3,6·10⁶ J", meaning: "Harcanan elektrik enerjisi; faturalar kWh ile hesaplanır." },
    ],
    logic:
      "Neden seri bağlı elemanlardan aynı akım geçer? Çünkü tek bir yol vardır; yük yolda birikemez, bir noktaya birim zamanda ne kadar yük giriyorsa o kadar çıkar (yükün korunumu). Paralel kollarda ise her kolun iki ucu aynı iki noktaya bağlıdır; bu yüzden her kolun uçları arasındaki potansiyel farkı aynıdır. Ana akım kollara, dirençlerle ters orantılı olarak bölünür: daha kolay yol daha fazla akım taşır.\n\nDirenç neden uzunlukla artar, kesitle azalır? Elektronlar uzun telde daha fazla çarpışma yaşar; kesit genişledikçe ise yan yana daha çok yol açılır, tıpkı çok şeritli otoyolun daha fazla araç geçirmesi gibi. Tel çekilip inceltildiğinde hacim sabit kaldığı için uzunluk k katına çıkarken kesit 1/k katına iner; direnç k² katına çıkar.\n\nLamba parlaklığı neden güce bağlıdır? Lamba, elektrik enerjisini ışık ve ısıya dönüştürür; birim zamanda ne kadar enerji dönüştürürse o kadar parlak yanar. Seri bağlı lambalarda akım ortak olduğundan P = I²R ile büyük dirençli lamba daha parlaktır. Paralel lambalarda gerilim ortak olduğundan P = V²/R ile küçük dirençli lamba daha parlaktır. Devrede bir kol koptuğunda eşdeğer direnç artar, ana akım azalır; bu değişim her lambayı farklı etkiler, bu yüzden her durumda baştan hesaplamak en güvenli yoldur.\n\nÜretecin iç direnci neden önemlidir? Akım geçerken iç dirençte I·r kadar gerilim ‘harcanır’; dış devreye ulaşan uç gerilimi ε’dan küçük olur. Akım büyüdükçe bu kayıp artar; eski pillerin yük altında zayıf kalmasının nedeni iç dirençlerinin büyümesidir.",
    examples: [
      {
        level: 'kolay',
        problem: "Bir iletkenin kesitinden 4 dakikada 480 C yük geçiyor. İletkenin direnci 6 Ω ise uçları arasındaki gerilim kaç volttur?",
        steps: [
          "Süreyi saniyeye çevir: 4 dk = 240 s.",
          "I = q/t = 480/240 = 2 A.",
          "V = I·R = 2·6 = 12 V.",
        ],
        answer: "12 V",
      },
      {
        level: 'orta',
        problem: "3 Ω ve 6 Ω’luk dirençler paralel bağlanıp bu gruba 4 Ω’luk direnç seri bağlanıyor. Devre iç direnci önemsiz 18 V’luk üretece bağlanırsa 3 Ω’luk dirençten geçen akım kaç A olur?",
        steps: [
          "Paralel grup: (3·6)/(3 + 6) = 2 Ω.",
          "Eşdeğer: 2 + 4 = 6 Ω; ana akım I = 18/6 = 3 A.",
          "Paralel grubun gerilimi: 3·2 = 6 V.",
          "3 Ω’dan geçen akım: 6/3 = 2 A (6 Ω’dan 1 A geçer, toplam 3 A tutar).",
        ],
        answer: "2 A",
      },
      {
        level: 'zor',
        problem: "Özdeş K, L, M lambalarından L ve M paralel bağlanmış, bu gruba K seri bağlanmış ve devre sabit gerilimli bir üretece bağlanmıştır. M lambası koparsa K ve L’nin parlaklıkları nasıl değişir?",
        steps: [
          "Her lambanın direnci R olsun, üreteç gerilimi V. Başta R_eş = R + R/2 = 3R/2, ana akım I = 2V/(3R).",
          "Başta P_K = I²R = 4V²/(9R); L’den I/2 geçer: P_L = V²/(9R).",
          "M kopunca devre K ve L seri: R_eş = 2R, akım V/(2R).",
          "Yeni güçler: P_K = P_L = V²/(4R).",
          "K: 4/9 ≈ 0,44’ten 0,25’e düşer → söner gibi azalır; L: 1/9 ≈ 0,11’den 0,25’e çıkar → artar.",
        ],
        answer: "K’nin parlaklığı azalır, L’nin parlaklığı artar.",
      },
    ],
    osymThinking:
      "Bu konudaki sorular üç ana kalıpta gizlenir. Birincisi, devre şeması kelimelerle anlatılır ve bir koldaki akım ya da gerilim istenir; burada eşdeğer direnç → ana akım → kol gerilimi → kol akımı sırasını izleyebilmen ölçülür. İkincisi, anahtar açma-kapama veya lamba kopması ile parlaklık değişimi sorulur; sezgiyle değil, önce ve sonra ayrı ayrı güç hesabı yaparak çözülür. Üçüncüsü, gerilim-akım grafiği veya ev aletleri tablosu verilerek günlük hayata aktarılmış yeni nesil sorulardır: fatura, sigorta, güç hesabı. Çeldiricilerde sıklıkla seri-paralel formüllerin karıştırılması, dakikanın saniyeye çevrilmemesi ve P = I²R yerine P = V²/R’nin yanlış bağlamda kullanılması hedeflenir.",
    commonMistakes: [
      "Paralel bağlı dirençlerin eşdeğerini toplayarak bulmak (seri formülünü kullanmak).",
      "Ampermetreyi paralel, voltmetreyi seri bağlanması gereken araç sanmak.",
      "Seri bağlı lambalarda küçük dirençli lambanın daha parlak yanacağını düşünmek; seri devrede büyük direnç daha parlaktır.",
      "Bir kol koptuğunda diğer tüm lambaların parlaklığının arttığını varsaymak.",
      "Elektrik enerjisini hesaplarken W ile kW’ı ya da saat ile saniyeyi karıştırmak.",
      "Direncin gerilim artınca arttığını sanmak; omik iletkende direnç V ve I’dan bağımsızdır, V/I oranı sabittir.",
    ],
    tips: [
      "Karışık devrede her zaman sırayla ilerle: eşdeğer direnç → ana akım → paralel grubun gerilimi → kol akımları.",
      "İki paralel dirençte akım dirençlerle ters orantılı bölünür: 6 Ω ve 3 Ω’a toplam 3 A gelirse 1 A ve 2 A olur.",
      "Etiketinde 220 V – 100 W yazan lambanın direnci R = V²/P = 484 Ω’dur; etiketten direnç bul, sonra devreye yerleştir.",
      "Lamba parlaklığı sorularında önce ve sonra için güç tablosu yap; oranları karşılaştır.",
      "Ev devresinde tüm aletler paraleldir; toplam akım aletlerin akımlarının toplamıdır ve sigorta sınırını geçmemelidir.",
    ],
    summary: [
      "I = q/t, V = I·R, R = ρL/A.",
      "Seride akım ortak, gerilim bölünür: R_eş = R₁ + R₂.",
      "Paralelde gerilim ortak, akım bölünür: 1/R_eş = 1/R₁ + 1/R₂.",
      "Uç gerilimi V = ε − I·r; ters bağlı üreteçler birbirini zayıflatır.",
      "P = VI = I²R = V²/R; E = P·t, 1 kWh = 3,6·10⁶ J.",
      "Parlaklık güçle orantılıdır: seride büyük R, paralelde küçük R daha parlaktır.",
      "Kopma/anahtar sorularında önce-sonra durumlarını ayrı ayrı hesapla.",
    ],
  },
  {
    topicId: 'tytfiz-manyetizma-temelleri',
    intro:
      "Buzdolabı süsleri, hoparlörler, elektrik motorları ve MR cihazları mıknatıs ya da manyetik alan kullanır. Her mıknatısın N (kuzey) ve S (güney) olmak üzere iki kutbu vardır; aynı kutuplar birbirini iter, zıt kutuplar çeker. Bir mıknatısı ne kadar küçük parçaya bölersen böl, her parça yine iki kutuplu olur.\n\n1820’de Oersted, akım geçen bir telin yakınındaki pusula iğnesinin saptığını gözlemledi. Böylece elektrik akımının manyetik alan oluşturduğu anlaşıldı. Bu konuda mıknatısları, akımın manyetik etkisini ve Dünya’nın manyetik alanını nitel olarak inceleyeceksin.",
    prerequisites: [
      "Elektrik akımı ve akım yönü kavramı",
      "Vektörlerde yön ve sayfa düzlemine dik yönlerin gösterimi",
    ],
    concepts: [
      { term: "Manyetik alan", definition: "Mıknatısın veya akımın çevresinde manyetik kuvvetin etkili olduğu bölge; vektöreldir." },
      { term: "Manyetik alan çizgileri", definition: "Mıknatıs dışında N’den S’ye yönelen, birbirini kesmeyen kapalı çizgiler; sık olduğu yerde alan güçlüdür." },
      { term: "Sağ el kuralı", definition: "Başparmak akım yönünü gösterirken kıvrılan dört parmak telin çevresindeki manyetik alan yönünü gösterir." },
      { term: "Elektromıknatıs", definition: "İçinden akım geçen, genellikle demir çekirdekli bobin; akım kesilince mıknatıslık büyük ölçüde kaybolur." },
      { term: "Pusula", definition: "Serbestçe dönebilen küçük mıknatıs iğne; N ucu bulunduğu yerdeki manyetik alan yönünü gösterir." },
    ],
    formulas: [
      { expr: "B ∝ I/d (nitel)", meaning: "Düz tel çevresindeki alan şiddeti akımla artar, telden uzaklaştıkça azalır." },
      { expr: "Elektromıknatıs gücü: sarım sayısı ↑, akım ↑, demir çekirdek → alan ↑", meaning: "Bobinin manyetik alanını artıran etkenler." },
    ],
    logic:
      "Pusulanın N ucu coğrafi kuzeyi gösterir; zıt kutuplar çekiştiğine göre coğrafi kuzey yakınında Dünya’nın manyetik güney (S) kutbu bulunmalıdır. Manyetik kutuplar coğrafi kutuplarla tam çakışmaz; aradaki açıya sapma açısı denir.\n\nAkım geçen telin çevresindeki alan çizgileri tele dik düzlemde teli çevreleyen çemberlerdir. Akımın yönü değişirse alanın yönü de değişir; akım artarsa alan güçlenir.",
    examples: [
      {
        level: 'kolay',
        problem: "Bir çubuk mıknatıs ortasından ikiye kırılırsa her parçada kaç kutup olur?",
        steps: ["Mıknatıslık atomik düzeydeki küçük mıknatısların dizilişinden gelir.", "Kırılma yeni uçlarda zıt kutuplar oluşturur; her parçada N ve S bulunur."],
        answer: "Her parçada iki kutup (N ve S)",
      },
      {
        level: 'orta',
        problem: "Sayfa düzleminde yatay duran bir telden sağa doğru akım geçiyor. Telin üst tarafındaki noktada alan yönü nedir?",
        steps: ["Sağ el başparmağı sağa doğru tutulur.", "Parmaklar telin üstünde sayfadan dışarı, altında sayfadan içeri doğru kıvrılır."],
        answer: "Sayfa düzleminden dışarı doğru",
      },
    ],
    osymThinking:
      "Sorular genellikle Oersted deneyi gibi bir deney düzeneği anlatıp çıkarılabilecek sonuçları sorar ya da hurda vinci, zil, hoparlör gibi teknolojik uygulamalar üzerinden elektromıknatısı güçlendiren etkenleri öncüllerle ölçer. Sağ el kuralında sayfa düzlemine dik yönlerin doğru bulunması ve Dünya’nın manyetik kutuplarının coğrafi kutuplarla ters olması tipik tuzaklardır.",
    commonMistakes: [
      "Dünya’nın coğrafi kuzey kutbunda manyetik N kutbu olduğunu sanmak.",
      "Alan çizgilerinin mıknatıs dışında S’den N’ye gittiğini düşünmek.",
      "Akım yönü değişince alan şiddetinin değiştiğini sanmak; yalnız yönü değişir.",
      "Tahta gibi manyetik olmayan çekirdeğin elektromıknatısı güçlendireceğini düşünmek.",
    ],
    tips: [
      "Sağ el kuralını her soruda elini gerçekten kullanarak uygula.",
      "Pusula iğnesinin N ucu alan çizgisi yönünü gösterir; çizgileri takip ederek iğne yönünü bul.",
    ],
    summary: [
      "Aynı kutuplar iter, zıt kutuplar çeker; kutuplar ayrı ayrı bulunmaz.",
      "Alan çizgileri dışarıda N → S yönündedir.",
      "Akım geçen tel çevresinde manyetik alan oluşur; yönü sağ el kuralıyla bulunur.",
      "Coğrafi kuzey yakınında manyetik S kutbu vardır.",
    ],
  },
  {
    topicId: 'tytfiz-basinc-kaldirma',
    intro:
      "Karda botla yürürken batarsın ama kayakla batmazsın; çünkü aynı ağırlık daha geniş alana yayıldığında basınç azalır. Basınç, birim yüzeye dik olarak etki eden kuvvettir.\n\nSıvılar ve gazlar da bulundukları kabın çeperlerine ve içlerindeki cisimlere basınç uygular. Derine daldıkça kulaklarının ağrıması sıvı basıncını, dağa çıktıkça yemeklerin geç pişmesi açık hava basıncını gösterir. Konunun ikinci yarısında gemilerin nasıl yüzdüğünü açıklayan kaldırma kuvvetini öğreneceksin.",
    prerequisites: [
      "Özkütle (d = m/V) ve ağırlık (G = m·g)",
      "Alan ve hacim hesabı, cm²–m² dönüşümü",
    ],
    concepts: [
      { term: "Basınç (P)", definition: "Birim yüzeye dik etki eden kuvvet; birimi pascal (N/m²)." },
      { term: "Sıvı basıncı", definition: "Durgun sıvının bir noktada uyguladığı basınç; derinlik ve sıvı özkütlesine bağlıdır, kabın şekline bağlı değildir." },
      { term: "Pascal ilkesi", definition: "Kapalı kaptaki sıvıya uygulanan basınç, sıvının her noktasına aynen iletilir." },
      { term: "Açık hava basıncı", definition: "Atmosferin ağırlığından kaynaklanan basınç; deniz seviyesinde yaklaşık 76 cmHg’dir, yükseklikle azalır." },
      { term: "Kaldırma kuvveti", definition: "Sıvıya batan cisme, yer değiştirdiği sıvının ağırlığına eşit, yukarı yönlü kuvvet." },
    ],
    formulas: [
      { expr: "P = F/A", meaning: "Katı basıncı." },
      { expr: "P = h·d·g", meaning: "Sıvı basıncı (h: derinlik)." },
      { expr: "F₁/A₁ = F₂/A₂", meaning: "Hidrolik sistemde Pascal ilkesi." },
      { expr: "F_k = V_batan·d_sıvı·g", meaning: "Arşimet ilkesi." },
      { expr: "Yüzen cisimde: V_batan/V = d_cisim/d_sıvı", meaning: "Yüzen cisimde kaldırma kuvveti ağırlığa eşittir." },
    ],
    logic:
      "Sıvı basıncı üstteki sıvı sütununun ağırlığından kaynaklanır; bu yüzden yalnız derinliğe ve özkütleye bağlıdır, kabın genişliğine bağlı değildir.\n\nKaldırma kuvvetinin nedeni, cismin alt yüzeyinin üst yüzeyinden daha derinde olmasıdır; alttan gelen basınç kuvveti üstten gelenden büyüktür. Cisim yüzüyorsa kaldırma kuvveti ağırlığa eşittir; sıvı değişse bile yüzdüğü sürece kaldırma kuvveti değişmez, yalnız batan hacim değişir.",
    examples: [
      {
        level: 'kolay',
        problem: "Özkütlesi 1000 kg/m³ olan suyun 5 m derinliğindeki sıvı basıncı kaç Pa’dır? (g = 10 m/s²)",
        steps: ["P = h·d·g = 5·1000·10.", "P = 50 000 Pa."],
        answer: "50 000 Pa",
      },
      {
        level: 'orta',
        problem: "Hacmi 500 cm³, özkütlesi 0,8 g/cm³ olan tahta suda yüzüyor. Batan hacmi kaç cm³’tür?",
        steps: ["V_batan/V = d_cisim/d_su = 0,8/1.", "V_batan = 0,8·500 = 400 cm³."],
        answer: "400 cm³",
      },
    ],
    osymThinking:
      "Sorular sıklıkla dinamometre ile ölçüm deneyi (havada ve suda okunan değerler), hidrolik kaldıraç, gemi-denizaltı veya balon gibi günlük hayat bağlamlarında gelir. Kaldırma kuvvetinin batan hacme bağlı olduğunu, derinliğe bağlı olmadığını bilmen; yüzen cisimde sıvı değişince kaldırma kuvveti değil batan hacmin değiştiğini fark etmen ölçülür.",
    commonMistakes: [
      "Sıvı basıncının kabın şekline veya sıvının toplam miktarına bağlı olduğunu sanmak.",
      "Tamamen batmış cismin daha derine indikçe daha fazla kaldırma kuvveti aldığını düşünmek.",
      "Yüzen cisimde kaldırma kuvvetini cismin tüm hacmiyle hesaplamak.",
      "cm² ve m² dönüşümünde 100 ile 10 000’i karıştırmak.",
    ],
    tips: [
      "Dinamometre sorularında: havadaki değer − sıvıdaki değer = kaldırma kuvveti.",
      "Katı cisimde en büyük basınç en küçük yüzey üzerinde durduğunda oluşur.",
    ],
    summary: [
      "P = F/A; sıvıda P = hdg.",
      "Pascal: kapalı sıvıda basınç her yöne aynen iletilir.",
      "Açık hava basıncı yükseklikle azalır; kaynama noktası düşer.",
      "F_k = V_batan·d_sıvı·g; yüzen cisimde F_k = G.",
    ],
  },
  {
    topicId: 'tytfiz-dalgalar',
    intro:
      "Bir ipi sallayarak oluşturduğun kıvrımlar, göle atılan taşın çevresinde yayılan halkalar, konuştuğunda havada ilerleyen ses ve depremde yeri sarsan titreşimler birer dalgadır. Dalga, maddeyi taşımadan enerji taşıyan titreşimdir.\n\nBu konuda dalgaların genlik, dalga boyu, frekans ve hız gibi özelliklerini; yay, su, ses ve deprem dalgalarının davranışlarını öğreneceksin. En önemli kural şudur: dalganın frekansı kaynağa, hızı ortama bağlıdır.",
    prerequisites: [
      "Hız = yol/zaman bağıntısı",
      "Periyot ve frekans arasındaki ters ilişki",
    ],
    concepts: [
      { term: "Enine dalga", definition: "Ortam taneciklerinin titreşim doğrultusu dalganın yayılma doğrultusuna dik olan dalga (yay dalgası, S dalgası)." },
      { term: "Boyuna dalga", definition: "Titreşim doğrultusu yayılma doğrultusuna paralel olan dalga (ses, P dalgası)." },
      { term: "Dalga boyu (λ)", definition: "Ardışık iki tepe veya iki çukur arasındaki uzaklık." },
      { term: "Frekans (f)", definition: "Birim zamanda üretilen dalga sayısı; kaynağa bağlıdır, ortam değişse de değişmez." },
      { term: "Yankı", definition: "Sesin bir engelden yansıyıp kaynağa geri dönmesiyle ikinci kez duyulması." },
    ],
    formulas: [
      { expr: "v = λ·f = λ/T", meaning: "Dalga hızı, dalga boyu ve frekansın çarpımıdır." },
      { expr: "f = 1/T", meaning: "Frekans ve periyot ters orantılıdır." },
      { expr: "Yankı: 2x = v·t", meaning: "Ses engele gidip döndüğü için yol iki katıdır." },
      { expr: "Deprem: x/v_S − x/v_P = Δt", meaning: "P ve S dalgalarının varış farkından merkez uzaklığı." },
    ],
    logic:
      "Frekans kaynağın titreşim hızıdır; ortam değişince kaynak değişmediği için frekans da değişmez. Ortam değişince hız değişir, bu yüzden v = λf gereği dalga boyu hızla aynı oranda değişir.\n\nSabit uçtan yansıyan atma ters döner, serbest uçtan yansıyan atma düz yansır. İnce yaydan kalın yaya geçişte kalın yay sabit uca benzer davranır: yansıyan atma ters, iletilen atma düzdür.",
    examples: [
      {
        level: 'kolay',
        problem: "Frekansı 10 Hz, dalga boyu 0,5 m olan dalganın hızı nedir?",
        steps: ["v = λ·f.", "v = 0,5·10 = 5 m/s."],
        answer: "5 m/s",
      },
      {
        level: 'orta',
        problem: "Derin sudan sığ suya geçen dalganın hızı 30 cm/s’den 18 cm/s’ye düşüyor. Derin sudaki dalga boyu 6 cm ise sığ sudaki dalga boyu nedir?",
        steps: ["Frekans değişmez: f = 30/6 = 5 Hz.", "λ_sığ = 18/5 = 3,6 cm."],
        answer: "3,6 cm",
      },
    ],
    osymThinking:
      "Sorular ortam değişiminde hangi niceliğin değişip hangisinin sabit kaldığını ölçer; frekansın sabit kaldığını bilmek çoğu sorunun kilididir. Deprem dalgaları ve yankı gibi günlük hayat bağlamlarıyla yeni nesil sorular kurulur; ‘ses yüksekliği’ ve ‘ses şiddeti’ gibi terimlerin karıştırılması tuzak olarak kullanılır.",
    commonMistakes: [
      "Frekans artınca aynı ortamdaki dalga hızının arttığını sanmak; dalga boyu azalır, hız sabit kalır.",
      "Yankı hesabında sesin gidiş-dönüş yolunu unutmak.",
      "Ses yüksekliğini (frekans) ses şiddetiyle (genlik) karıştırmak.",
      "Sesin boşlukta yayılabildiğini düşünmek.",
    ],
    tips: [
      "Ortam değişince önce ‘frekans sabit’ yaz, sonra v ve λ’yı aynı oranda değiştir.",
      "S dalgası enine olduğundan sıvılarda yayılamaz; P dalgası her ortamda yayılır ve daha hızlıdır.",
    ],
    summary: [
      "Dalga enerji taşır, madde taşımaz.",
      "v = λf; frekans kaynağa, hız ortama bağlıdır.",
      "Sabit uçtan yansıma ters, serbest uçtan düz.",
      "Ses boyuna mekanik dalgadır; boşlukta yayılmaz.",
      "P dalgası boyuna ve hızlı, S dalgası enine ve yavaştır.",
    ],
  },
  {
    topicId: 'tytfiz-optik',
    intro:
      "Görebilmemizin nedeni cisimlerden gözümüze ulaşan ışıktır. Işık homojen ortamda doğrusal yolla yayılır; gölgeler, tutulmalar ve karanlık odadaki görüntüler bunun sonucudur.\n\nOptik konusunda aydınlanma ve gölgeden başlayıp düzlem ve küresel aynalara, ışığın kırılmasına, merceklere, prizmalara ve renklere kadar geniş bir alanı inceleyeceksin. TYT’de genellikle ayna ve mercek özellikleri, kırılmada değişen nicelikler ve renk soruları sorulur.",
    prerequisites: [
      "Açı ölçme ve doğrusal çizim",
      "Dalgalarda hız, frekans ve dalga boyu ilişkisi",
    ],
    concepts: [
      { term: "Aydınlanma şiddeti (E)", definition: "Birim yüzeye düşen ışık akısı; birimi lüks. Kaynağın ışık şiddetiyle doğru, uzaklığın karesiyle ters orantılıdır." },
      { term: "Tam gölge / yarı gölge", definition: "Hiç ışık almayan bölge tam gölge; kaynağın yalnız bir kısmından ışık alan bölge yarı gölgedir." },
      { term: "Yansıma kanunu", definition: "Gelme açısı yansıma açısına eşittir; gelen ışın, normal ve yansıyan ışın aynı düzlemdedir." },
      { term: "Odak noktası (F)", definition: "Asal eksene paralel gelen ışınların ayna veya mercekten sonra toplandığı (ya da uzantılarının kesiştiği) nokta." },
      { term: "Kırılma", definition: "Işığın bir ortamdan diğerine geçerken hızının değişmesi nedeniyle doğrultusunun değişmesi." },
      { term: "Renk", definition: "Işığın frekansına bağlı algı; cisim yansıttığı ışığın rengiyle görünür." },
    ],
    formulas: [
      { expr: "E = I/d²", meaning: "Işık dik geliyorsa aydınlanma şiddeti." },
      { expr: "Düzlem aynada tam boy görmek için ayna boyu ≥ h/2", meaning: "Kişinin kendini baştan ayağa görmesi için gereken en küçük ayna boyu." },
      { expr: "Görüntü sayısı n = 360°/α − 1", meaning: "Aralarında α açısı olan iki düzlem aynada (360/α çift tam sayıysa)." },
      { expr: "Az yoğundan çok yoğuna: v ↓, λ ↓, f sabit, ışın normale yaklaşır", meaning: "Kırılmada değişen nicelikler." },
    ],
    logic:
      "Işığın bir ortamdan diğerine geçerken frekansı kaynağa bağlı olduğundan değişmez; hız azalırsa dalga boyu da azalır ve ışın normale yaklaşır. Prizmada farklı renklerin kırılma miktarı farklıdır; mor en çok, kırmızı en az kırılır, beyaz ışık renklerine ayrılır.\n\nCisimler üzerine düşen ışıktan bazı renkleri yansıtır, diğerlerini soğurur. Kırmızı bir elma yalnız kırmızıyı yansıttığı için yeşil ışık altında yansıtacak ışık bulamaz ve siyah görünür.",
    examples: [
      {
        level: 'kolay',
        problem: "Boyu 1,70 m olan biri kendini düzlem aynada tam olarak görmek için en az kaç cm boyunda ayna kullanmalıdır?",
        steps: ["Gereken ayna boyu kişi boyunun yarısıdır.", "170/2 = 85 cm."],
        answer: "85 cm",
      },
      {
        level: 'orta',
        problem: "Işık şiddeti 90 cd olan noktasal kaynak ekrana 3 m uzaklıktadır. Ekrandaki aydınlanma şiddeti kaç lükstür?",
        steps: ["E = I/d² = 90/3².", "E = 90/9 = 10 lüks."],
        answer: "10 lüks",
      },
    ],
    osymThinking:
      "Sorular görüntü özelliklerini (gerçek-sanal, düz-ters, büyük-küçük) cisim konumuna göre sorar, kırılmada hangi niceliklerin değiştiğini öncüllerle ölçer, renk sorularında ise cismin hangi ışığı yansıttığını düşünmeni ister. Göz kusurları ve mercek eşleştirmeleri günlük hayat bağlamında yeni nesil soru olarak gelir.",
    commonMistakes: [
      "Kırılmada ışığın frekansının değiştiğini sanmak.",
      "Tümsek aynanın gerçek görüntü oluşturabileceğini düşünmek; tümsek ayna her zaman düz, küçük, sanal görüntü verir.",
      "Miyopide ince kenarlı mercek kullanıldığını sanmak; miyopi kalın kenarlı (ıraksak) mercekle düzeltilir.",
      "Prizmada en çok kırılan rengin kırmızı olduğunu düşünmek; mor en çok kırılır.",
    ],
    tips: [
      "Çukur ayna ve ince kenarlı mercek toplayıcıdır; tümsek ayna ve kalın kenarlı mercek dağıtıcıdır.",
      "Renk sorularında ‘cisim hangi rengi yansıtıyor, ışıkta o renk var mı?’ diye sor.",
    ],
    summary: [
      "E = I/d²; noktasal kaynakla yalnız tam gölge oluşur.",
      "Düzlem ayna: düz, sanal, cisimle eşit boy; tam boy için h/2 ayna yeter.",
      "Çukur ayna gerçek ve sanal görüntü verebilir; tümsek ayna yalnız sanal ve küçük görüntü verir.",
      "Kırılmada f sabit, v ve λ birlikte değişir.",
      "Mor en çok, kırmızı en az kırılır; cisim yansıttığı ışığın renginde görünür.",
    ],
  },
];
