import type { LessonSeed } from '../../domain/types';

/**
 * AYT Kimya konu anlatımları (1. bölüm): modern atom teorisi, gazlar, sıvı çözeltiler,
 * tepkimelerde enerji, tepkime hızı, kimyasal denge.
 */
export const lessons: LessonSeed[] = [
  // ---------------------------------------------------------------- Modern Atom Teorisi
  {
    topicId: 'aytkim-modern-atom',
    intro:
      "Bohr modeli hidrojen atomunun spektrumunu güzelce açıkladı ama çok elektronlu atomlarda çuvalladı. Elektronun hem tanecik hem dalga gibi davrandığı ve konumuyla hızının aynı anda kesin bilinemeyeceği (Heisenberg belirsizlik ilkesi) anlaşılınca, elektronu belirli bir yörüngede dönen bir top gibi düşünmekten vazgeçtik. Artık elektronun bulunma olasılığının yüksek olduğu bölgelerden, yani orbitallerden söz ediyoruz.\n\nBu konu AYT’de genellikle elektron dizilimi, kuantum sayıları ve periyodik özellikler üzerinden sorulur. Elektron dizilimini doğru yazabilen biri elementin periyodunu, grubunu, bloğunu, yarı dolu orbital sayısını ve olası yükseltgenme basamaklarını birkaç saniyede çıkarabilir.",
    prerequisites: [
      "Atomun temel tanecikleri (proton, nötron, elektron) ve atom numarası",
      "Periyodik sistemde periyot ve grup kavramları (9. sınıf)",
      "İyon oluşumu: katyon ve anyon",
    ],
    concepts: [
      { term: "Orbital", definition: "Elektronun bulunma olasılığının yüksek olduğu üç boyutlu bölge. Her orbital en fazla 2 zıt spinli elektron alır." },
      { term: "Baş kuantum sayısı (n)", definition: "Enerji düzeyini (katmanı) ve orbitalin büyüklüğünü belirtir; n = 1, 2, 3 … Bir katmanda n² orbital, en fazla 2n² elektron bulunur." },
      { term: "Açısal momentum kuantum sayısı (ℓ)", definition: "Orbitalin türünü (şeklini) belirtir; 0’dan n−1’e kadar değer alır. ℓ = 0 → s, 1 → p, 2 → d, 3 → f." },
      { term: "Manyetik kuantum sayısı (mℓ)", definition: "Orbitalin uzaydaki yönelimini belirtir; −ℓ ile +ℓ arasında tam sayı değerler alır. Bir alt katmanda 2ℓ + 1 orbital vardır." },
      { term: "Spin kuantum sayısı (mₛ)", definition: "Elektronun kendi ekseni etrafındaki dönme yönü; +1/2 veya −1/2 değerini alır." },
      { term: "Aufbau ilkesi", definition: "Elektronlar orbitallere düşük enerjiliden yüksek enerjiliye doğru yerleşir: 1s 2s 2p 3s 3p 4s 3d 4p 5s 4d 5p 6s 4f 5d …" },
      { term: "Hund kuralı", definition: "Eş enerjili orbitallere elektronlar önce birer birer ve aynı spinle yerleşir, sonra eşleşir." },
      { term: "Küresel simetri", definition: "Son alt katmanı yarı dolu (s¹, p³, d⁵) ya da tam dolu (s², p⁶, d¹⁰) olan dizilim; ek kararlılık sağlar." },
    ],
    formulas: [
      { expr: "Katmandaki orbital sayısı = n², en fazla elektron = 2n²", meaning: "n = 3 katmanında 9 orbital ve en fazla 18 elektron bulunur." },
      { expr: "Alt katmandaki orbital sayısı = 2ℓ + 1", meaning: "s: 1, p: 3, d: 5, f: 7 orbital; elektron kapasiteleri 2, 6, 10, 14." },
      { expr: "ℓ = 0, 1, …, n − 1 ;  mℓ = −ℓ … +ℓ", meaning: "Kuantum sayısı setinin geçerli olup olmadığını bu sınırlarla kontrol ederiz." },
      { expr: "Geçiş metali iyonu: önce ns, sonra (n−1)d elektronu kopar", meaning: "₂₆Fe: [Ar]4s²3d⁶ → Fe³⁺: [Ar]3d⁵." },
      { expr: "Cr ve Cu istisnası: [Ar]4s¹3d⁵ ve [Ar]4s¹3d¹⁰", meaning: "Yarı dolu ve tam dolu d alt katmanının kararlılığı nedeniyle 4s’ten bir elektron 3d’ye geçer." },
    ],
    logic:
      "Neden 4s, 3d’den önce dolar? Çünkü çok elektronlu atomlarda orbital enerjisi yalnız n’ye değil ℓ’ye de bağlıdır; n + ℓ değeri küçük olan orbital daha düşük enerjilidir (4s: 4 + 0 = 4, 3d: 3 + 2 = 5). Ama atom iyonlaşırken en dıştaki katmandan (en büyük n) elektron kopar; bu yüzden geçiş metalleri önce 4s elektronlarını verir.\n\nPeriyodik özelliklerin mantığı çekirdek çekimi ile katman sayısının yarışıdır. Periyotta soldan sağa proton sayısı artar ama katman sayısı aynı kalır; etkin çekirdek yükü artar, yarıçap küçülür, iyonlaşma enerjisi genel olarak artar. 2A ve 5A gruplarının 3A ve 6A’dan yüksek iyonlaşma enerjisi, tam dolu s² ve yarı dolu p³ dizilimlerinin kararlılığından gelir. Ardışık iyonlaşma enerjilerinde büyük sıçrama, soy gaz dizilimine ulaşmış bir iç katmandan elektron koparılmaya başlandığını gösterir.",
    examples: [
      {
        level: "kolay",
        problem: "₂₆Fe atomunun ve Fe³⁺ iyonunun elektron dizilimini yazınız; Fe³⁺ iyonundaki yarı dolu orbital sayısını bulunuz.",
        steps: [
          "Aufbau sırasıyla 26 elektron yerleştirilir: 1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶ → [Ar]4s²3d⁶.",
          "İyon oluşurken en dış katman olan 4s’ten 2 elektron, ardından 3d’den 1 elektron kopar: Fe³⁺ = [Ar]3d⁵.",
          "3d⁵ dizilimine Hund kuralı uygulanır: 5 orbitalin her birinde birer elektron vardır.",
        ],
        answer: "Fe: [Ar]4s²3d⁶; Fe³⁺: [Ar]3d⁵ ve 5 yarı dolu orbital (küresel simetrik).",
      },
      {
        level: "orta",
        problem: "Bir X elementinin ardışık iyonlaşma enerjileri (kJ/mol): İE₁ = 738, İE₂ = 1451, İE₃ = 7733, İE₄ = 10540. X’in grubunu ve klorlu bileşiğinin formülünü bulunuz.",
        steps: [
          "Ardışık değerler arasındaki oranlara bakılır: 1451/738 ≈ 2, 7733/1451 ≈ 5,3 → büyük sıçrama 2. ile 3. iyonlaşma arasındadır.",
          "Sıçrama öncesi 2 elektron kolay koparılıyor; değerlik elektron sayısı 2 → X, 2A grubundadır.",
          "X²⁺ iyonu Cl⁻ ile XCl₂ bileşiğini oluşturur.",
        ],
        answer: "2A grubu; bileşik XCl₂.",
      },
      {
        level: "zor",
        problem: "₂₄Cr atomu için (a) elektron dizilimini, (b) yarı dolu orbital sayısını, (c) periyodik sistemdeki yerini, (d) en yüksek yükseltgenme basamağını bulunuz.",
        steps: [
          "Beklenen dizilim [Ar]4s²3d⁴ olsa da yarı dolu d⁵ kararlılığı nedeniyle gerçek dizilim [Ar]4s¹3d⁵ olur.",
          "4s¹ (1 tane) + 3d⁵ (5 tane) → 6 yarı dolu orbital; dizilim küresel simetriktir.",
          "En büyük n = 4 → 4. periyot; son elektron d orbitalinde → d bloğu; 4s + 3d elektron sayısı 1 + 5 = 6 → 6B grubu.",
          "Değerlik elektronlarının tamamı (4s¹3d⁵) verilebildiği için en yüksek yükseltgenme basamağı +6’dır (örneğin CrO₄²⁻).",
        ],
        answer: "[Ar]4s¹3d⁵; 6 yarı dolu orbital; 4. periyot 6B (d bloğu); en yüksek +6.",
      },
    ],
    osymThinking:
      "Sorular çoğunlukla doğrudan \"dizilimi yaz\" demez; bir elementin iyonlaşma enerjisi tablosu, bir iyonun dizilimi ya da kuantum sayısı seti verilir ve bundan grup, blok, bileşik formülü veya yarı dolu orbital sayısı istenir. Geçiş metali iyonlarında 4s’in önce boşaltılması, Cr–Cu istisnaları ve 2A/3A, 5A/6A iyonlaşma enerjisi terslikleri en sık kullanılan tuzaklardır.",
    commonMistakes: [
      "Geçiş metali iyonlarında elektronları önce 3d’den koparmak (Fe³⁺ için [Ar]4s²3d³ yazmak).",
      "Cr ve Cu istisnalarını unutup [Ar]4s²3d⁴ ve [Ar]4s²3d⁹ yazmak.",
      "ℓ değerinin n’ye eşit olabileceğini sanmak (n = 2 için ℓ = 2 geçersizdir).",
      "Periyotta iyonlaşma enerjisinin her zaman düzenli arttığını düşünüp Mg > Al ve P > S tersliklerini atlamak.",
    ],
    tips: [
      "d bloğunda grup numarası = ns + (n−1)d elektron sayısı (3–7 için B grubu 3B–7B; 8, 9, 10 → 8B; 11 → 1B; 12 → 2B).",
      "Ardışık iyonlaşma enerjilerinde oranı 3’ten büyük olan ilk sıçramanın öncesindeki elektron sayısı değerlik elektron sayısıdır.",
      "Küresel simetri sorusunda yalnızca son alt katmana bak: s¹, s², p³, p⁶, d⁵, d¹⁰.",
    ],
    summary: [
      "Orbital, elektronun bulunma olasılığının yüksek olduğu bölgedir; her orbital en fazla 2 elektron alır.",
      "n katmanı n² orbital ve 2n² elektron barındırır; ℓ = 0 … n−1, mℓ = −ℓ … +ℓ.",
      "Dizilim Aufbau, Pauli ve Hund kurallarıyla yazılır; Cr ve Cu istisnadır.",
      "Geçiş metalleri iyonlaşırken önce ns elektronlarını verir.",
      "Periyotta soldan sağa yarıçap azalır, iyonlaşma enerjisi genel olarak artar (2A>3A, 5A>6A istisnaları).",
    ],
  },

  // ---------------------------------------------------------------- Gazlar
  {
    topicId: 'aytkim-gazlar',
    intro:
      "Gazlar kabın tamamını doldurur, kolayca sıkıştırılır ve birbirleriyle her oranda karışır. Bu davranışın arkasında basit bir resim var: tanecikler birbirinden çok uzakta, rastgele ve hızla hareket ediyor. Bu resim sayesinde dört değişkeni (basınç P, hacim V, sıcaklık T, mol sayısı n) tek bir denklemde, PV = nRT’de birleştirebiliyoruz.\n\nAYT’de gazlar konusu hemen her yıl karşına çıkar. Kimi zaman bir musluğun açılmasıyla karışan iki kap, kimi zaman su üstünde toplanan hidrojen, kimi zaman bir cam boruda buluşan iki gaz… Hepsinin ortak noktası, ideal gaz denklemini doğru birimlerle ve doğru durum için kurmaktır.\n\nBu konuda ideal gaz denklemi, kinetik teori, Graham difüzyon yasası, Dalton kısmi basınçlar yasası, su üstünde toplanan gazlar ve gerçek gazların ideallikten sapmasını adım adım göreceğiz. Sıcaklığı her zaman Kelvin’e çevirmeyi ve basınç birimini R ile uyumlu seçmeyi baştan alışkanlık hâline getir.",
    prerequisites: [
      "Mol kavramı ve mol kütlesi hesabı (n = m/M)",
      "Sıcaklık birimleri: T(K) = t(°C) + 273",
      "Basınç birimleri: 1 atm = 76 cmHg = 760 mmHg",
      "Tepkime denklemlerinde mol oranları (stokiyometri)",
    ],
    concepts: [
      { term: "İdeal gaz", definition: "Tanecikleri arasında çekim-itme olmayan ve taneciklerin öz hacmi kap hacmine göre ihmal edilebilen varsayımsal gaz." },
      { term: "Kinetik teori", definition: "Gaz taneciklerinin sürekli, rastgele ve doğrusal hareket ettiğini, çarpışmaların esnek olduğunu ve ortalama kinetik enerjinin yalnızca mutlak sıcaklıkla orantılı olduğunu kabul eden model." },
      { term: "Difüzyon / efüzyon", definition: "Difüzyon, gazın başka bir gaz içinde yayılması; efüzyon, gazın küçük bir delikten boşluğa kaçmasıdır. İkisinin hızı da √(1/M) ile orantılıdır." },
      { term: "Kısmi basınç", definition: "Bir karışımdaki gazın, kabı tek başına doldursaydı yapacağı basınç. Kısmi basınç, gazın mol kesriyle toplam basıncın çarpımıdır." },
      { term: "Buhar basıncı", definition: "Kapalı kapta sıvıyla dengedeki buharın basıncı; yalnızca sıvının cinsine ve sıcaklığa bağlıdır, sıvı miktarına ve kap hacmine bağlı değildir." },
      { term: "Gerçek gaz", definition: "Tanecikler arası çekim kuvvetleri ve öz hacmi olan gaz. Yüksek sıcaklık ve düşük basınçta ideale yaklaşır." },
      { term: "Kritik sıcaklık", definition: "Bir gazın basınç uygulanarak sıvılaştırılabileceği en yüksek sıcaklık. Kritik sıcaklığın altındaki gaza buhar denir." },
    ],
    formulas: [
      { expr: "P·V = n·R·T  (R = 0,082 L·atm/(mol·K) = 22,4/273)", meaning: "İdeal gaz denklemi; P atm, V litre, T kelvin olmalıdır." },
      { expr: "(P₁·V₁)/(n₁·T₁) = (P₂·V₂)/(n₂·T₂)", meaning: "Aynı gazın iki durumu karşılaştırılırken sabit kalan değişkenler sadeleştirilir (Boyle, Charles, Gay-Lussac, Avogadro)." },
      { expr: "d = (P·M)/(R·T)", meaning: "Gaz yoğunluğu; aynı koşulda yoğunluk mol kütlesiyle doğru orantılıdır." },
      { expr: "υ₁/υ₂ = √(M₂/M₁) = √(d₂/d₁)", meaning: "Graham yasası: aynı sıcaklıkta hafif gaz daha hızlı yayılır." },
      { expr: "Ortalama hız ∝ √(T/M) ;  Ortalama Ek ∝ T", meaning: "Aynı sıcaklıkta tüm gazların ortalama kinetik enerjisi eşittir, hızları ise mol kütlesine bağlıdır." },
      { expr: "Pₓ = Xₓ·P_toplam  (Xₓ = nₓ/n_toplam)", meaning: "Dalton kısmi basınçlar yasası; P_toplam = P₁ + P₂ + …" },
      { expr: "P_kuru gaz = P_toplam − P_su buharı", meaning: "Su üstünde toplanan gazın kendi basıncı, toplam basınçtan suyun o sıcaklıktaki buhar basıncı çıkarılarak bulunur." },
    ],
    logic:
      "PV = nRT neden işe yarar? Basınç, tanecik çarpışmalarının kap çeperine uyguladığı kuvvettir. Tanecik sayısı (n) artarsa çarpışma sayısı artar; sıcaklık artarsa tanecikler hem daha sık hem daha şiddetli çarpar; hacim büyürse aynı tanecikler daha seyrek çarpar. Bu üç sezgi birleşince P ∝ nT/V, yani PV = nRT elde edilir.\n\nGraham yasasının mantığı kinetik enerjiden gelir: aynı sıcaklıkta her gazın ortalama kinetik enerjisi (½mυ²) eşittir. Kütlesi büyük olan gazın hızı bu yüzden küçük olmak zorundadır; υ ∝ 1/√M.\n\nDalton yasası ideal gazın doğasından çıkar: tanecikler birbirini etkilemediği için her gaz kabı yalnızmış gibi davranır; kısmi basınçlar toplanır. Su üstünde gaz toplandığında kaba su buharı da girer; ölçtüğümüz basınç gaz + su buharıdır. Gerçek gazlarda ise tanecikler arası çekim çeperdeki çarpışmayı zayıflatır (basınç ideale göre düşer), öz hacim ise serbest hacmi azaltır. Sıcaklık yüksek ve basınç düşükken tanecikler hızlı ve birbirinden uzak olduğu için bu etkiler önemsizleşir; gaz ideale yaklaşır.",
    examples: [
      {
        level: "kolay",
        problem: "0,5 mol ideal gaz 27 °C’de 4,1 L’lik kapta bulunmaktadır. Gazın basıncı kaç atm’dir? (R = 0,082 L·atm/(mol·K))",
        steps: [
          "Sıcaklık Kelvin’e çevrilir: T = 27 + 273 = 300 K.",
          "P = nRT/V = (0,5 · 0,082 · 300) / 4,1 bağıntısı kurulur.",
          "0,5 · 0,082 · 300 = 12,3 → P = 12,3 / 4,1 = 3 atm.",
        ],
        answer: "3 atm",
      },
      {
        level: "orta",
        problem: "90 cm uzunluğundaki bir cam borunun bir ucundan CH₄, diğer ucundan SO₂ gazı aynı anda ve aynı sıcaklıkta gönderiliyor. Gazlar CH₄ ucundan kaç cm uzakta karşılaşır? (C = 12, H = 1, S = 32, O = 16)",
        steps: [
          "Mol kütleleri: CH₄ = 16 g/mol, SO₂ = 64 g/mol.",
          "Graham: υ(CH₄)/υ(SO₂) = √(64/16) = 2. Aynı sürede CH₄ iki kat yol alır.",
          "Toplam yol 90 cm, oran 2 : 1 → CH₄ 60 cm, SO₂ 30 cm yol alır.",
        ],
        answer: "CH₄ ucundan 60 cm uzakta",
      },
      {
        level: "zor",
        problem: "Bir miktar Mg metali yeterince HCl ile tepkimeye sokuluyor: Mg + 2HCl → MgCl₂ + H₂. Oluşan H₂ gazı 27 °C’de su üstünde toplanıyor; toplanan gazın hacmi 2,46 L ve toplam basıncı 787 mmHg ölçülüyor. 27 °C’de suyun buhar basıncı 27 mmHg olduğuna göre tepkimeye giren Mg kaç gramdır? (Mg = 24, R = 0,082)",
        steps: [
          "Kuru H₂ basıncı: 787 − 27 = 760 mmHg = 1 atm.",
          "n(H₂) = PV/RT = (1 · 2,46)/(0,082 · 300) = 2,46/24,6 = 0,1 mol.",
          "Denkleme göre 1 mol Mg’den 1 mol H₂ oluşur → n(Mg) = 0,1 mol.",
          "m(Mg) = 0,1 · 24 = 2,4 g. (Buhar basıncı çıkarılmasaydı yaklaşık 2,49 g bulunurdu; bu yaygın hatadır.)",
        ],
        answer: "2,4 g",
      },
    ],
    osymThinking:
      "Gaz soruları çoğu zaman tek formülle bitmez: musluk açılınca karışan kaplar (her gaz tüm hacme yayılır, P₁V₁ = P₂V₂ ayrı ayrı uygulanır), tepkime sonrası mol değişimi, soğutunca yoğunlaşan su gibi ara adımlar eklenir. Grafik sorularında P–V eğrisi, P–T(K) doğrusu ve V–t(°C) doğrusunun −273’te kesişmesi yorumlatılır. Graham sorularında buluşma noktası, kinetik teori sorularında \"aynı sıcaklıkta ortalama kinetik enerji eşit, hız farklı\" ayrımı ölçülür.",
    commonMistakes: [
      "Sıcaklığı °C ile formüle koymak (27 °C yerine 300 K kullanılmalı).",
      "Su üstünde toplanan gazda su buharı basıncını çıkarmayı unutmak.",
      "Graham yasasında hız oranını mol kütlelerinin karekökü yerine doğrudan mol kütleleri oranı almak ya da oranı ters kurmak.",
      "Aynı sıcaklıktaki farklı gazların ortalama hızlarının da eşit olduğunu sanmak (eşit olan kinetik enerjidir).",
      "Musluk açılınca basınçların ortalamasını almak; doğrusu P_son = (P₁V₁ + P₂V₂)/V_toplam’dır.",
    ],
    tips: [
      "R = 0,082 ile çalışırken 22,4/273 eşitliğini hatırla; 0 °C ve 1 atm’de 1 mol gaz 22,4 L’dir.",
      "Karışım sorularında önce her gazın mol sayısını bul; kısmi basınçlar mol sayılarıyla orantılıdır.",
      "Gerçek gaz sorusunda \"ideale en yakın\" için: küçük ve apolar tanecik (He, H₂), yüksek sıcaklık, düşük basınç.",
      "Aynı kapta (V ve T sabit) basınç yalnızca toplam mol sayısıyla orantılıdır; tepkime sonrası basınç için mol değişimine bak.",
    ],
    summary: [
      "PV = nRT: P (atm), V (L), T (K), R = 0,082.",
      "Aynı sıcaklıkta tüm gazların ortalama kinetik enerjisi eşittir; hız √(T/M) ile orantılıdır.",
      "Graham: υ₁/υ₂ = √(M₂/M₁); hafif gaz daha hızlı yayılır.",
      "Dalton: Pₓ = Xₓ·P_toplam; kısmi basınçların toplamı toplam basınçtır.",
      "Su üstünde toplanan gaz: P_gaz = P_toplam − P_su buharı.",
      "Gerçek gazlar yüksek sıcaklık ve düşük basınçta ideale yaklaşır.",
    ],
  },

  // ---------------------------------------------------------------- Sıvı Çözeltiler
  {
    topicId: 'aytkim-sivi-cozeltiler',
    intro:
      "Çay şekerinin suda kaybolması, kışın yollara tuz serpilmesi, serum şişesinin kan ile aynı derişimde hazırlanması… Hepsi çözeltilerle ilgilidir. Bu konuda önce bir çözeltinin ne kadar derişik olduğunu sayılarla ifade etmeyi (molarite, molalite, kütlece yüzde, ppm), sonra çözünen taneciklerin çözücünün kaynama, donma ve buhar basıncı davranışını nasıl değiştirdiğini (koligatif özellikler) öğreneceğiz.\n\nSon olarak çözünürlüğün sıcaklık ve basınçla nasıl değiştiğini, çözünürlük grafiklerinden çökme miktarının nasıl hesaplandığını göreceğiz.",
    prerequisites: [
      "Mol kavramı ve mol kütlesi",
      "Polar-apolar maddeler ve \"benzer benzeri çözer\" ilkesi",
      "İyonik bileşiklerin suda iyonlarına ayrışması",
    ],
    concepts: [
      { term: "Molarite (M)", definition: "1 litre çözeltide çözünmüş maddenin mol sayısı (mol/L)." },
      { term: "Molalite (m)", definition: "1 kg çözücüde çözünmüş maddenin mol sayısı (mol/kg). Sıcaklıkla değişmez; koligatif hesaplarda kullanılır." },
      { term: "Koligatif özellik", definition: "Çözünenin cinsine değil, çözeltideki çözünmüş tanecik derişimine bağlı özellik: buhar basıncı düşmesi, kaynama noktası yükselmesi, donma noktası alçalması, ozmotik basınç." },
      { term: "Çözünürlük", definition: "Belirli sıcaklık ve basınçta belirli miktar çözücüde çözünebilen en fazla madde miktarı (genellikle g/100 g su)." },
      { term: "Doymuş çözelti", definition: "Verilen koşulda çözebileceği en fazla maddeyi çözmüş çözelti; dipte katı varsa çözünme-çökelme dengesi kurulur." },
    ],
    formulas: [
      { expr: "M = n / V(L)", meaning: "Molarite; n = m/M_A (kütle/mol kütlesi)." },
      { expr: "m = n_çözünen / kg çözücü", meaning: "Molalite." },
      { expr: "M = (10 · d · %) / M_A", meaning: "Kütlece yüzde ve yoğunluğu bilinen çözeltinin molaritesi (d g/mL)." },
      { expr: "M₁·V₁ = M₂·V₂ ;  M_son = (M₁V₁ + M₂V₂)/(V₁ + V₂)", meaning: "Seyreltme ve aynı çözünenli çözeltileri karıştırma." },
      { expr: "ΔT = K · m · i", meaning: "Kaynama noktası yükselmesi (Kk) ve donma noktası alçalması (Kd); i, 1 formül biriminden oluşan tanecik sayısıdır (NaCl için 2, CaCl₂ için 3)." },
      { expr: "ppm = (çözünen kütlesi / çözelti kütlesi) · 10⁶", meaning: "Çok seyreltik çözeltilerde derişim." },
    ],
    logic:
      "Koligatif özellikler neden yalnız tanecik sayısına bağlıdır? Çözücünün yüzeyindeki bazı yerleri çözünen tanecikleri kaplar; buharlaşabilecek çözücü molekülü sayısı azalır ve buhar basıncı düşer. Buhar basıncı düşünce dış basınca ulaşmak için daha yüksek sıcaklık gerekir (kaynama noktası yükselir); donma sırasında düzenli kristal yapının oluşması tanecikler tarafından zorlaştırılır (donma noktası alçalır). Çözünenin kimliği değil, kaç tanecik olduğu önemlidir; bu yüzden 0,1 m CaCl₂ (0,3 m tanecik), 0,1 m NaCl’den (0,2 m tanecik) daha etkilidir.\n\nGazların çözünürlüğü sıcaklık artınca azalır, çünkü çözünme ekzotermiktir ve moleküller sıvıdan kaçmaya yetecek enerjiyi kolay bulur. Basınç artınca gazın çözünürlüğü artar (gazoz şişesi). Katıların çoğunda ise çözünme endotermiktir ve sıcaklık artınca çözünürlük artar.",
    examples: [
      {
        level: "kolay",
        problem: "8 g NaOH suda çözülerek 500 mL çözelti hazırlanıyor. Çözeltinin molaritesi kaçtır? (NaOH = 40 g/mol)",
        steps: [
          "n = 8 / 40 = 0,2 mol.",
          "V = 500 mL = 0,5 L → M = 0,2 / 0,5 = 0,4 M.",
        ],
        answer: "0,4 M",
      },
      {
        level: "orta",
        problem: "0,2 molal NaCl çözeltisinin 1 atm’deki kaynama noktası kaç °C’dir? (Su için Kk = 0,52 °C/m)",
        steps: [
          "NaCl → Na⁺ + Cl⁻ olduğundan i = 2; tanecik molalitesi 0,4 m.",
          "ΔTk = 0,52 · 0,2 · 2 = 0,208 °C.",
          "Kaynama noktası = 100 + 0,208 = 100,208 °C.",
        ],
        answer: "100,208 °C",
      },
      {
        level: "zor",
        problem: "60 °C’de KNO₃’ün çözünürlüğü 110 g/100 g su, 20 °C’de 32 g/100 g sudur. 60 °C’deki 420 g doymuş KNO₃ çözeltisi 20 °C’ye soğutulursa kaç gram KNO₃ çöker?",
        steps: [
          "60 °C’de 210 g doymuş çözeltide 100 g su ve 110 g KNO₃ vardır; 420 g çözelti bunun 2 katıdır: 200 g su, 220 g KNO₃.",
          "20 °C’de 200 g su en fazla 2 · 32 = 64 g KNO₃ çözebilir.",
          "Çöken KNO₃ = 220 − 64 = 156 g.",
        ],
        answer: "156 g",
      },
    ],
    osymThinking:
      "Derişim soruları genellikle iyon derişimi üzerinden gizlenir: 0,1 M Al₂(SO₄)₃ çözeltisinde [SO₄²⁻] = 0,3 M gibi. Koligatif özelliklerde farklı çözeltiler tablo hâlinde verilip kaynama/donma noktası sıralaması istenir; kilit nokta toplam tanecik molalitesidir. Çözünürlük grafiklerinde soğutma ile çökme ve doymuşluk yorumu sıklıkla sorulur.",
    commonMistakes: [
      "Koligatif hesaplarda iyonik bileşikler için i katsayısını unutmak.",
      "Molarite hesabında mL’yi litreye çevirmemek.",
      "Çözünürlük grafiğinde 100 g su yerine 100 g çözelti üzerinden hesap yapmak.",
      "Gazların çözünürlüğünün sıcaklıkla arttığını sanmak.",
    ],
    tips: [
      "Tanecik derişimi = formül derişimi × i; sıralama sorularında her çözelti için bu çarpımı yaz.",
      "Karıştırma sorularında ortak iyonun mollerini topla, toplam hacme böl.",
      "Doymuş çözelti kütlesini (su + çözünen) oranla büyütüp küçült; su kütlesini sabit tut.",
    ],
    summary: [
      "Molarite mol/L, molalite mol/kg çözücüdür.",
      "Koligatif özellikler çözünmüş tanecik sayısına bağlıdır: ΔT = K·m·i.",
      "Çözünen eklenince buhar basıncı ve donma noktası düşer, kaynama noktası yükselir.",
      "Gazların çözünürlüğü sıcaklıkla azalır, basınçla artar.",
      "Soğutmada çöken miktar = başlangıçtaki çözünen − yeni sıcaklıkta çözünebilen.",
    ],
  },

  // ---------------------------------------------------------------- Tepkimelerde Enerji
  {
    topicId: 'aytkim-tepkimelerde-enerji',
    intro:
      "Doğal gaz yandığında ısı açığa çıkar, buz eriyip su olurken ise ortamdan ısı alınır. Kimyasal tepkimelerdeki bu ısı alışverişini sabit basınçta entalpi değişimi (ΔH) ile ifade ederiz. ΔH < 0 ise tepkime ekzotermiktir (ısı verir), ΔH > 0 ise endotermiktir (ısı alır).\n\nBu konuda ΔH’yi üç farklı yoldan hesaplamayı öğreneceğiz: standart oluşum entalpilerinden, bağ enerjilerinden ve Hess yasasıyla tepkimeleri toplayarak. Ayrıca ısının madde miktarıyla orantılı olduğunu kullanarak \"kaç gram yakılırsa kaç kJ ısı çıkar\" sorularını çözeceğiz.",
    prerequisites: [
      "Tepkime denklemlerini denkleştirme",
      "Mol-kütle dönüşümleri",
      "Kimyasal bağ türleri ve bağ kırılmasının enerji gerektirdiği bilgisi",
    ],
    concepts: [
      { term: "Entalpi değişimi (ΔH)", definition: "Sabit basınçta tepkime ısısı; ΔH = H_ürünler − H_girenler." },
      { term: "Standart oluşum entalpisi (ΔH°f)", definition: "25 °C ve 1 atm’de 1 mol bileşiğin en kararlı hâldeki elementlerinden oluşumundaki entalpi değişimi. En kararlı hâldeki elementler için sıfırdır (O₂(g), C(grafit), Br₂(s))." },
      { term: "Bağ enerjisi", definition: "Gaz hâlindeki 1 mol bağı kırmak için gereken enerji; bağ kırılması endotermik, bağ oluşumu ekzotermiktir." },
      { term: "Hess yasası", definition: "Bir tepkimenin ΔH değeri, tepkimenin tek basamakta ya da çok basamakta gerçekleşmesinden bağımsızdır; basamakların ΔH değerleri toplanabilir." },
    ],
    formulas: [
      { expr: "ΔH = Σ ΔH°f(ürünler) − Σ ΔH°f(girenler)", meaning: "Oluşum entalpileri katsayılarla çarpılarak kullanılır." },
      { expr: "ΔH = Σ (kırılan bağ enerjileri) − Σ (oluşan bağ enerjileri)", meaning: "Bağ enerjisiyle hesap; sıralama oluşum entalpisi formülünün tersidir." },
      { expr: "Tepkime ters çevrilirse ΔH işaret değiştirir; n ile çarpılırsa ΔH de n ile çarpılır", meaning: "Hess yasasında tepkimeleri düzenleme kuralları." },
      { expr: "Q = n · |ΔH|", meaning: "Açığa çıkan/alınan ısı madde miktarıyla orantılıdır." },
      { expr: "Q = m · c · ΔT", meaning: "Isının suyu ısıtmakta kullanıldığı sorularda (su için c ≈ 4,2 J/(g·°C))." },
    ],
    logic:
      "Entalpi bir hâl fonksiyonudur: dağın zirvesine hangi yoldan çıkarsan çık, yükseklik farkı aynıdır. Hess yasasının gücü buradan gelir; ölçmesi zor bir tepkimenin ΔH’sini ölçmesi kolay tepkimeleri toplayarak buluruz.\n\nBağ enerjisi yönteminde \"kırılan − oluşan\" yazmamızın nedeni, bağ kırmanın enerji istemesi (+) ve bağ oluşumunun enerji vermesidir (−). Oluşan bağlar kırılanlardan daha güçlüyse tepkime ekzotermik olur.",
    examples: [
      {
        level: "kolay",
        problem: "CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(s) tepkimesinin ΔH değerini bulunuz. (ΔH°f: CH₄ = −75, CO₂ = −394, H₂O(s) = −286 kJ/mol)",
        steps: [
          "Ürünler: −394 + 2·(−286) = −966 kJ; girenler: −75 + 0 = −75 kJ (O₂ elementtir).",
          "ΔH = −966 − (−75) = −891 kJ.",
        ],
        answer: "−891 kJ (ekzotermik)",
      },
      {
        level: "orta",
        problem: "H₂(g) + Cl₂(g) → 2HCl(g) tepkimesinin ΔH değerini bağ enerjilerinden hesaplayınız. (H–H: 436, Cl–Cl: 243, H–Cl: 432 kJ/mol)",
        steps: [
          "Kırılan bağlar: 436 + 243 = 679 kJ.",
          "Oluşan bağlar: 2 · 432 = 864 kJ.",
          "ΔH = 679 − 864 = −185 kJ.",
        ],
        answer: "−185 kJ",
      },
      {
        level: "zor",
        problem: "C(k) + O₂(g) → CO₂(g) ΔH = −394 kJ ve CO(g) + ½O₂(g) → CO₂(g) ΔH = −283 kJ olduğuna göre C(k) + ½O₂(g) → CO(g) tepkimesinin ΔH değeri ve 5,6 g CO oluşurken açığa çıkan ısı kaç kJ’dür? (C = 12, O = 16)",
        steps: [
          "Birinci tepkime aynen, ikinci tepkime ters çevrilir: CO₂ → CO + ½O₂ ΔH = +283 kJ.",
          "Toplanınca CO₂ sadeleşir: C + ½O₂ → CO, ΔH = −394 + 283 = −111 kJ.",
          "5,6 g CO = 5,6/28 = 0,2 mol → Q = 0,2 · 111 = 22,2 kJ.",
        ],
        answer: "ΔH = −111 kJ; 22,2 kJ ısı açığa çıkar.",
      },
    ],
    osymThinking:
      "Sorular çoğu zaman ΔH’yi doğrudan istemez; önce Hess ile ΔH bulunur, sonra verilen kütle için ısı ya da bu ısının ısıttığı su miktarı sorulur. Oluşum entalpisi sorularında elementlerin (ve en kararlı allotropun) sıfır alınması, suyun sıvı/gaz hâlinin farklı ΔH vermesi dikkat tuzağıdır.",
    commonMistakes: [
      "Bağ enerjisi hesabında \"ürünler − girenler\" yazarak işareti ters bulmak.",
      "Oluşum entalpisini katsayılarla çarpmayı unutmak.",
      "Hess yasasında tepkimeyi ters çevirince ΔH’nin işaretini değiştirmemek.",
      "O₃, C(elmas) gibi kararlı olmayan allotropların oluşum entalpisini sıfır almak.",
    ],
    tips: [
      "Hess sorularında hedef tepkimedeki her maddenin hangi verilen tepkimede tek başına bulunduğuna bakarak başla.",
      "ΔH < 0 ise ürünlerin potansiyel enerjisi girenlerden düşüktür; ürünler daha kararlıdır.",
      "Isı-kütle sorularında önce 1 mol için ΔH’yi bul, sonra orantı kur.",
    ],
    summary: [
      "ΔH < 0 ekzotermik, ΔH > 0 endotermik.",
      "ΔH = ΣΔH°f(ürün) − ΣΔH°f(giren); elementlerin ΔH°f değeri sıfırdır.",
      "ΔH = Σ kırılan bağ − Σ oluşan bağ.",
      "Hess: ters çevir → işaret değişir; katla → ΔH katlanır; topla → ΔH’ler toplanır.",
      "Isı madde miktarıyla doğru orantılıdır.",
    ],
  },

  // ---------------------------------------------------------------- Tepkime Hızı
  {
    topicId: 'aytkim-tepkime-hizi',
    intro:
      "Demirin paslanması yıllar sürerken bir havai fişek saniyeler içinde patlar. İkisi de kendiliğinden yürüyen tepkimelerdir ama hızları çok farklıdır. Tepkime hızı, birim zamanda harcanan girenin ya da oluşan ürünün miktarıdır; kimya, bu hızı hangi etkenlerin belirlediğini ve nasıl kontrol edileceğini açıklar.\n\nBu konunun kalbinde çarpışma teorisi vardır: tanecikler tepkime vermek için çarpışmalıdır, ama her çarpışma ürün oluşturmaz. Çarpışma yeterli enerjiyle (aktifleşme enerjisi) ve uygun geometriyle gerçekleşirse etkin çarpışma olur.\n\nAYT’de hız konusu deney tablosundan hız ifadesi bulma, mekanizmada yavaş basamağı belirleme, potansiyel enerji diyagramı yorumlama ve sıcaklık-katalizör etkisini açıklama biçiminde gelir. Bu anlatımın sonunda bir veri tablosuna bakıp tepkime mertebesini ve hız sabitini birkaç satırda bulabileceksin.",
    prerequisites: [
      "Tepkime denklemleri ve mol oranları",
      "Tepkimelerde enerji: ΔH, endotermik-ekzotermik",
      "Gazlarda kinetik teori: sıcaklık ile ortalama kinetik enerji ilişkisi",
      "Derişim (molarite) kavramı",
    ],
    concepts: [
      { term: "Tepkime hızı", definition: "Birim zamanda giren derişimindeki azalma veya ürün derişimindeki artış; birimi genellikle mol/(L·s)." },
      { term: "Etkin çarpışma", definition: "Yeterli enerji (≥ Ea) ve uygun yönelimle gerçekleşip ürün oluşturan çarpışma." },
      { term: "Aktifleşme enerjisi (Ea)", definition: "Tepkimenin gerçekleşmesi için taneciklerin sahip olması gereken en düşük enerji; potansiyel enerji diyagramında giren ile tepe arasındaki fark." },
      { term: "Aktifleşmiş kompleks", definition: "Potansiyel enerji diyagramının tepesinde bulunan, kararsız ve çok kısa ömürlü geçiş yapısı." },
      { term: "Hız sabiti (k)", definition: "Hız ifadesindeki orantı sabiti; sıcaklık ve katalizörle değişir, derişimle değişmez." },
      { term: "Tepkime mertebesi", definition: "Hız ifadesindeki derişim üslerinin toplamı; deneysel olarak bulunur." },
      { term: "Mekanizma", definition: "Net tepkimenin gerçekleştiği basamaklar dizisi; en yavaş basamak tepkime hızını belirler." },
      { term: "Katalizör", definition: "Tepkimeye girip sonunda değişmeden çıkan, Ea’yı düşürerek yeni bir yol sağlayan ve hızı artıran madde; ΔH’yi ve denge sabitini değiştirmez." },
    ],
    formulas: [
      { expr: "aA + bB → cC + dD :  hız = −(1/a)·Δ[A]/Δt = −(1/b)·Δ[B]/Δt = (1/c)·Δ[C]/Δt", meaning: "Harcanma ve oluşma hızları katsayılarla orantılıdır." },
      { expr: "hız = k·[A]ˣ·[B]ʸ", meaning: "Hız ifadesi; x ve y deneyle (veya yavaş basamaktan) bulunur, katı ve sıvılar yazılmaz." },
      { expr: "Mertebe = x + y", meaning: "Toplam tepkime mertebesi." },
      { expr: "k birimi = M^(1−mertebe)·s⁻¹", meaning: "1. mertebe: s⁻¹; 2. mertebe: M⁻¹·s⁻¹; 3. mertebe: M⁻²·s⁻¹." },
      { expr: "ΔH = Ea(ileri) − Ea(geri)", meaning: "Potansiyel enerji diyagramından tepkime ısısı." },
      { expr: "Hacim 1/n katına inerse (gaz): hız n^(mertebe) katına çıkar", meaning: "Tüm gaz derişimleri n katına çıktığı için." },
    ],
    logic:
      "Hız ifadesi neden derişimlerle orantılıdır? Birim hacimdeki tanecik sayısı arttıkça birim zamandaki çarpışma sayısı artar. Tek basamaklı (elementer) bir tepkimede A + B → ürün için çarpışma sayısı [A]·[B] ile orantılıdır; bu yüzden hız = k[A][B] olur. Çok basamaklı tepkimelerde ise darboğaz olan yavaş basamak hızı belirler; net denklemin katsayıları hız ifadesini vermez, bu yüzden hız ifadesi deneyle bulunur.\n\nSıcaklık neden bu kadar etkilidir? Sıcaklık artınca yalnızca çarpışma sayısı biraz artmakla kalmaz; Maxwell-Boltzmann eğrisi sağa kayıp yayvanlaşır ve enerjisi Ea’dan büyük olan tanecik oranı çok artar. Ea değişmez, ama eşiği aşan tanecik sayısı artar; hız sabiti k büyür.\n\nKatalizör ise eşiği aşağı çeker: tepkimeye alternatif, daha düşük aktifleşme enerjili bir yol açar. İleri ve geri tepkimelerin Ea’sını aynı miktarda düşürdüğü için ΔH değişmez ve denge konumu kaymaz; yalnızca dengeye daha çabuk ulaşılır. Temas yüzeyinin artması (toz hâline getirme) heterojen tepkimelerde çarpışabilecek tanecik sayısını artırır.",
    examples: [
      {
        level: "kolay",
        problem: "N₂(g) + 3H₂(g) → 2NH₃(g) tepkimesinde NH₃’ün oluşma hızı 0,4 mol/(L·s) ise H₂’nin ve N₂’nin harcanma hızları nedir?",
        steps: [
          "Hızlar katsayılarla orantılıdır: υ(N₂) : υ(H₂) : υ(NH₃) = 1 : 3 : 2.",
          "υ(H₂) = 0,4 · 3/2 = 0,6 mol/(L·s).",
          "υ(N₂) = 0,4 · 1/2 = 0,2 mol/(L·s).",
        ],
        answer: "H₂: 0,6 mol/(L·s), N₂: 0,2 mol/(L·s)",
      },
      {
        level: "orta",
        problem: "2A(g) + B(g) → C(g) tepkimesi için sabit sıcaklıkta şu veriler elde ediliyor: Deney 1: [A] = 0,1 M, [B] = 0,1 M, hız = 2·10⁻³ M/s; Deney 2: [A] = 0,2 M, [B] = 0,1 M, hız = 8·10⁻³ M/s; Deney 3: [A] = 0,1 M, [B] = 0,2 M, hız = 4·10⁻³ M/s. Hız ifadesini, mertebeyi ve k’yi bulunuz.",
        steps: [
          "Deney 1 → 2: [B] sabit, [A] 2 katı, hız 4 katı → 2ˣ = 4 → x = 2.",
          "Deney 1 → 3: [A] sabit, [B] 2 katı, hız 2 katı → y = 1.",
          "Hız = k[A]²[B]; mertebe 3.",
          "k = 2·10⁻³ / (0,1² · 0,1) = 2·10⁻³ / 10⁻³ = 2 M⁻²·s⁻¹.",
        ],
        answer: "Hız = k[A]²[B]; 3. mertebe; k = 2 M⁻²·s⁻¹",
      },
      {
        level: "zor",
        problem: "NO₂(g) + CO(g) → NO(g) + CO₂(g) tepkimesinin mekanizması: 1) NO₂ + NO₂ → NO₃ + NO (yavaş), 2) NO₃ + CO → NO₂ + CO₂ (hızlı). Hız ifadesini, ara ürünü yazınız; kabın hacmi yarıya indirilirse hız kaç katına çıkar?",
        steps: [
          "Basamaklar toplanınca NO₃ ve bir NO₂ sadeleşir: NO₂ + CO → NO + CO₂ (net tepkime doğrulanır).",
          "Hızı yavaş basamak belirler: hız = k[NO₂]². CO hız ifadesinde yer almaz.",
          "NO₃ birinci basamakta oluşup ikincide harcanır → ara üründür.",
          "Hacim yarıya inince [NO₂] 2 katına çıkar → hız 2² = 4 katına çıkar.",
        ],
        answer: "Hız = k[NO₂]²; ara ürün NO₃; hız 4 katına çıkar.",
      },
    ],
    osymThinking:
      "Hız sorularında net denklem verilip katsayılardan hız ifadesi yazma tuzağı kurulur; oysa hız ifadesi yavaş basamaktan ya da deney tablosundan gelir. Deney tablolarında bir derişim sabit tutulup diğeri değiştirilir; bazen hiçbir satır çifti doğrudan karşılaştırmaya uygun değildir, önce bir üstü bulup sonra diğerini hesaplamak gerekir. Potansiyel enerji diyagramlarında çok basamaklı tepkimede en yüksek Ea’lı basamak ve katalizörün etkisi yorumlatılır. Günlük hayat bağlamlı yeni nesil sorularda (buzdolabı, toz şeker, enzim) hangi faktörün hızı değiştirdiği sorulur.",
    commonMistakes: [
      "Net tepkimenin katsayılarını doğrudan hız ifadesine üs olarak yazmak.",
      "Hız ifadesine katı veya saf sıvıları eklemek.",
      "Sıcaklık artınca aktifleşme enerjisinin düştüğünü sanmak (düşen Ea değil, eşiği aşan tanecik oranı artar).",
      "Katalizörün ΔH’yi ya da denge sabitini değiştirdiğini düşünmek.",
      "Ara ürün ile katalizörü karıştırmak: ara ürün önce oluşur sonra harcanır; katalizör önce harcanır sonra geri oluşur.",
    ],
    tips: [
      "Deney tablosunda \"hız oranı = (derişim oranı)^üs\" eşitliğini kur; 2 kat → 4 kat ise üs 2, 2 kat → aynı ise üs 0.",
      "k’nin birimini mertebeden yazarak çeldiricileri hızla ele.",
      "Potansiyel enerji diyagramında tepe sayısı = basamak sayısı; en yüksek aktifleşme enerjili basamak en yavaştır.",
      "Gaz tepkimelerinde hacmi küçültmek tüm gaz derişimlerini aynı oranda artırır.",
    ],
    summary: [
      "Hız, birim zamandaki derişim değişimidir; harcanma/oluşma hızları katsayılarla orantılıdır.",
      "Tepkime için etkin çarpışma gerekir: yeterli enerji (≥ Ea) + uygun yönelim.",
      "Hız ifadesi deneyle veya yavaş basamaktan bulunur; katı ve sıvılar yazılmaz.",
      "Sıcaklık artışı Ea’yı değiştirmez, eşiği aşan tanecik oranını ve k’yi artırır.",
      "Katalizör Ea’yı düşürür; ΔH ve denge sabiti değişmez.",
      "Derişim ve temas yüzeyi artışı çarpışma sayısını artırarak hızı yükseltir.",
    ],
  },

  // ---------------------------------------------------------------- Kimyasal Denge
  {
    topicId: 'aytkim-kimyasal-denge',
    intro:
      "Kapalı bir kapta N₂O₄ gazını ısıttığında kap kahverengileşmeye başlar (NO₂ oluşur), ama renk belli bir tonda durur. Tepkime bitmiş değildir; N₂O₄ ayrışmaya, NO₂ birleşmeye devam eder. Sadece iki yöndeki hızlar eşitlenmiştir. Buna dinamik denge denir: mikroskobik düzeyde hareket sürer, makroskobik özellikler (renk, basınç, derişim) sabit kalır.\n\nDenge konusunda dengenin sayısal ifadesini (Kc ve Kp), bir karışımın dengeye hangi yönde gideceğini (Q ile K karşılaştırması), dengeye dışarıdan müdahale edildiğinde sistemin nasıl tepki verdiğini (Le Chatelier ilkesi) ve başlangıç-değişim-denge tablosuyla denge hesaplarını öğreneceğiz.\n\nBu konu, asit-baz dengesi ve çözünürlük dengesi konularının da temelidir; burada kazanacağın \"tablo kur, bağıntıya yerleştir\" alışkanlığı oralarda da aynen işe yarar.",
    prerequisites: [
      "Tepkime hızı: ileri ve geri tepkime hızları",
      "Molarite ve ideal gaz denklemi (Kp–Kc dönüşümü için)",
      "Endotermik ve ekzotermik tepkimeler",
      "Stokiyometri: mol oranları",
    ],
    concepts: [
      { term: "Dinamik denge", definition: "Kapalı sistemde ileri ve geri tepkime hızlarının eşit olduğu, derişimlerin sabit kaldığı durum." },
      { term: "Denge sabiti (Kc)", definition: "Dengede ürün derişimlerinin katsayı üslü çarpımının girenlerinkine oranı; yalnızca sıcaklığa bağlıdır." },
      { term: "Kp", definition: "Gaz fazı dengelerinde kısmi basınçlarla yazılan denge sabiti." },
      { term: "Tepkime oranı (Q)", definition: "Denge bağıntısına herhangi bir andaki derişimlerin yazılmasıyla elde edilen değer; K ile karşılaştırılarak tepkimenin yönü bulunur." },
      { term: "Le Chatelier ilkesi", definition: "Dengedeki bir sisteme dış etki uygulanırsa sistem bu etkiyi azaltacak yönde kayar." },
      { term: "Homojen / heterojen denge", definition: "Tüm maddeler aynı fazdaysa homojen, farklı fazlardaysa heterojen denge. Heterojen dengede katı ve saf sıvılar bağıntıya yazılmaz." },
    ],
    formulas: [
      { expr: "aA + bB ⇌ cC + dD :  Kc = [C]ᶜ·[D]ᵈ / ([A]ᵃ·[B]ᵇ)", meaning: "Denge bağıntısı; katı ve saf sıvılar yazılmaz." },
      { expr: "Kp = Kc·(R·T)^Δn ,  Δn = gaz ürün katsayıları − gaz giren katsayıları", meaning: "Δn = 0 ise Kp = Kc." },
      { expr: "Tepkime ters çevrilirse K → 1/K ; n ile çarpılırsa K → Kⁿ", meaning: "Tepkimeyi ½ ile çarpmak K’nin karekökünü almaktır." },
      { expr: "Tepkimeler toplanırsa K_toplam = K₁·K₂", meaning: "Hess yasasının denge karşılığı." },
      { expr: "Q < K → ileri ;  Q > K → geri ;  Q = K → dengede", meaning: "Tepkime oranıyla yön tayini." },
      { expr: "ΔH < 0 ise T↑ → K↓ ;  ΔH > 0 ise T↑ → K↑", meaning: "Denge sabitini değiştiren tek etken sıcaklıktır." },
    ],
    logic:
      "Denge neden kurulur? Başta yalnızca girenler varken ileri hız büyük, geri hız sıfırdır. Girenler azaldıkça ileri hız düşer, ürünler çoğaldıkça geri hız artar; bir noktada ikisi eşitlenir. Elementer bir tepkime için k_ileri[A][B] = k_geri[C] yazılırsa [C]/([A][B]) = k_ileri/k_geri = K çıkar; K’nin sabit olması ve yalnız sıcaklıkla (k’lerle) değişmesi buradan anlaşılır.\n\nLe Chatelier ilkesi aslında Q ile K karşılaştırmasının sözel hâlidir. Dengedeki sisteme giren eklersen Q küçülür (Q < K) ve tepkime ileri kayar. Hacmi küçültürsen tüm gaz derişimleri aynı oranda artar; gaz mol sayısı fazla olan taraf daha çok etkilenir ve sistem mol sayısının az olduğu yöne kayar. Sıcaklık ise farklıdır: sıcaklık K’nin kendisini değiştirir. Isıyı ekzotermik tepkimede ürün, endotermik tepkimede giren gibi düşünürsen yönü kolayca bulursun.\n\nKatalizör ileri ve geri hızları aynı oranda artırdığı için dengeye daha çabuk ulaşılır ama denge konumu ve K değişmez. Soy gaz eklemek sabit hacimde derişimleri değiştirmez, dengeyi etkilemez.",
    examples: [
      {
        level: "kolay",
        problem: "N₂(g) + 3H₂(g) ⇌ 2NH₃(g) tepkimesi için belirli sıcaklıkta Kc = 4’tür. Aynı sıcaklıkta 2NH₃(g) ⇌ N₂(g) + 3H₂(g) ve NH₃(g) ⇌ ½N₂(g) + 3/2H₂(g) tepkimelerinin Kc değerleri nedir?",
        steps: [
          "Tepkime ters çevrildiğinde K’nin tersi alınır: 1/4.",
          "Ters tepkime ½ ile çarpılınca K’nin karekökü alınır: √(1/4) = 1/2.",
        ],
        answer: "1/4 ve 1/2",
      },
      {
        level: "orta",
        problem: "1 L’lik kapta 1 mol H₂ ve 1 mol I₂ gazları H₂(g) + I₂(g) ⇌ 2HI(g) tepkimesine göre dengeye ulaşıyor. Kc = 64 olduğuna göre dengede kaç mol HI vardır?",
        steps: [
          "Tablo: başlangıç H₂ = 1, I₂ = 1, HI = 0; değişim −x, −x, +2x; denge 1 − x, 1 − x, 2x.",
          "Kc = (2x)² / (1 − x)² = 64 → 2x/(1 − x) = 8.",
          "2x = 8 − 8x → 10x = 8 → x = 0,8.",
          "HI = 2x = 1,6 mol.",
        ],
        answer: "1,6 mol HI",
      },
      {
        level: "zor",
        problem: "N₂O₄(g) ⇌ 2NO₂(g) tepkimesi için belirli sıcaklıkta Kc = 0,36’dır. Bu sıcaklıkta 1 L’lik kaba 0,1 mol N₂O₄ ve 0,6 mol NO₂ konuluyor. Tepkime hangi yöne ilerler ve dengede derişimler ne olur?",
        steps: [
          "Q = [NO₂]²/[N₂O₄] = 0,6²/0,1 = 3,6. Q > Kc olduğundan tepkime geri yönde (N₂O₄ oluşumu yönünde) ilerler.",
          "Değişim: NO₂ −2x, N₂O₄ +x → denge: NO₂ = 0,6 − 2x, N₂O₄ = 0,1 + x.",
          "(0,6 − 2x)²/(0,1 + x) = 0,36 denklemi x = 0,15 için sağlanır: (0,3)²/0,25 = 0,09/0,25 = 0,36.",
          "Dengede [NO₂] = 0,3 M, [N₂O₄] = 0,25 M.",
        ],
        answer: "Geri yönde ilerler; [NO₂] = 0,3 M, [N₂O₄] = 0,25 M.",
      },
    ],
    osymThinking:
      "Denge soruları genellikle bir derişim-zaman grafiği ya da başlangıç-denge tablosu üzerine kurulur. Grafikte ani sıçrama madde ekleme/çıkarma veya hacim değişimini, yumuşak değişim ise sıcaklık değişimi ya da dengenin kayması sonucunu gösterir. \"K değişir mi?\" sorusu sıcaklık dışındaki etkilerle çeldirici olarak sorulur. Kp–Kc dönüşümünde Δn’yi yalnızca gazlardan hesaplamak, heterojen dengede katıları bağıntıdan çıkarmak ölçülür.",
    commonMistakes: [
      "Heterojen dengede katı ve saf sıvıları denge bağıntısına yazmak.",
      "Derişim, basınç ya da katalizör değişince K’nin de değiştiğini sanmak.",
      "Kp = Kc(RT)^Δn formülünde Δn’yi tüm maddelerden (katılar dâhil) hesaplamak.",
      "Mol sayılarını derişime çevirmeden (hacme bölmeden) bağıntıya yerleştirmek.",
      "Hacim küçültülünce dengenin her zaman ürünler yönüne kaydığını düşünmek (gaz mol sayısı az olan tarafa kayar).",
    ],
    tips: [
      "Her denge hesabında başlangıç-değişim-denge tablosunu yaz; değişim satırı katsayılarla orantılıdır.",
      "Tam kare çıkan bağıntılarda (H₂ + I₂ ⇌ 2HI gibi) iki tarafın karekökünü alarak ikinci dereceden denklemden kaçın.",
      "Yön sorularında önce Q’yu hesapla; Le Chatelier yorumunu Q-K karşılaştırmasıyla doğrula.",
      "Δn(gaz) = 0 olan tepkimelerde hacim değişimi dengeyi kaydırmaz ve Kp = Kc olur.",
    ],
    summary: [
      "Denge dinamiktir: ileri hız = geri hız, derişimler sabit.",
      "Kc bağıntısında katılar ve saf sıvılar yazılmaz; Kp = Kc(RT)^Δn.",
      "Ters çevir → 1/K; n ile çarp → Kⁿ; topla → K₁·K₂.",
      "Q < K ileri, Q > K geri, Q = K dengede.",
      "Le Chatelier: sistem dış etkiyi azaltacak yöne kayar; K’yi yalnız sıcaklık değiştirir.",
      "Katalizör dengeye ulaşma süresini kısaltır, denge konumunu değiştirmez.",
    ],
  },
];
