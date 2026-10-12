import type { QuestionSeed } from '../../domain/types';

/**
 * AYT Kimya ek soru bankası: soru sayısı 10’un altında kalan konular için
 * özgün pratik sorular. Kimlikler çakışmayı önlemek için q1NN biçimindedir.
 */

const MA = "aytkim-modern-atom";
const SC = "aytkim-sivi-cozeltiler";
const TE = "aytkim-tepkimelerde-enerji";
const CD = "aytkim-cozunurluk-dengesi";
const KG = "aytkim-karbon-kimyasina-giris";
const EN = "aytkim-enerji-kaynaklari";

export const questions: QuestionSeed[] = [
  // =====================================================================
  // MODERN ATOM TEORİSİ
  // =====================================================================
  {
    id: `${MA}-q101`,
    topic: MA,
    subtopic: `${MA}-s5`,
    outcome: "Atom yarıçapı, iyonlaşma enerjisi, elektron ilgisi ve elektronegatifliğin periyodik değişimini açıklar.",
    difficulty: "orta",
    type: "yorum",
    question:
      "₁₆S²⁻, ₁₇Cl⁻, ₁₈Ar, ₁₉K⁺ ve ₂₀Ca²⁺ taneciklerinin hepsi aynı elektron dizilimine sahiptir.\n\nBu taneciklerden hangisinin yarıçapı en büyüktür?",
    options: ["S²⁻", "Cl⁻", "Ar", "K⁺", "Ca²⁺"],
    correctAnswer: 0,
    solution:
      "Taneciklerin hepsinde 18 elektron vardır (izoelektronik). Elektron sayısı sabitken proton sayısı azaldıkça çekirdeğin elektron başına uyguladığı çekim azalır ve yarıçap büyür. En az protonlu tanecik S²⁻ (16 proton) olduğundan yarıçapı en büyüktür. Sıralama: S²⁻ > Cl⁻ > Ar > K⁺ > Ca²⁺.",
    hint: "Elektron sayıları eşitse belirleyici olan proton sayısıdır.",
    commonMistake: "Periyot sayısı büyük olan K ve Ca’nın iyonlarının da büyük olacağını düşünüp K⁺ ya da Ca²⁺’yı seçmek.",
    teacherNote: "İzoelektronik taneciklerde çap karşılaştırmasının proton/elektron oranıyla yapıldığını ölçer.",
  },
  {
    id: `${MA}-q102`,
    topic: MA,
    subtopic: `${MA}-s4`,
    outcome: "Elektron diziliminden elementin periyodik sistemdeki yerini (periyot, grup, blok) belirler.",
    difficulty: "zor",
    type: "onculu",
    question: "Temel hâldeki ₂₅Mn atomu ve iyonları ile ilgili aşağıdaki ifadelerden hangileri doğrudur?",
    premises: [
      "Mn, periyodik sistemin 4. periyot 7B (7. grup) elementidir.",
      "Temel hâldeki Mn atomunda 5 tane eşleşmemiş elektron vardır.",
      "Mn²⁺ iyonunun elektron dizilimi [Ar] 4s² 3d³ şeklindedir.",
    ],
    options: ["Yalnız I", "Yalnız II", "I ve II", "II ve III", "I, II ve III"],
    correctAnswer: 2,
    solution:
      "₂₅Mn: [Ar] 4s² 3d⁵. En yüksek baş kuantum sayısı 4 olduğundan 4. periyottadır; değerlik elektronları 4s² 3d⁵ toplamı 7 olduğundan 7B (7. grup) elementidir (I doğru). 3d⁵ yarı doludur, beş orbitalde birer elektron bulunur: 5 eşleşmemiş elektron (II doğru). Geçiş metalleri iyonlaşırken önce en dış katmandaki 4s elektronlarını verir: Mn²⁺ = [Ar] 3d⁵ (III yanlış).",
    hint: "Katyon oluşurken elektronlar en yüksek n değerli katmandan koparılır.",
    commonMistake: "İyon oluşurken elektronları son yazılan 3d orbitalinden koparmak.",
    teacherNote: "d-blok elementlerinde periyot/grup belirleme ve iyon dizilimi yazma becerisini birlikte ölçer.",
  },

  // =====================================================================
  // SIVI ÇÖZELTİLER VE ÇÖZÜNÜRLÜK
  // =====================================================================
  {
    id: `${SC}-q101`,
    topic: SC,
    subtopic: `${SC}-s2`,
    outcome: "Çözelti seyreltme, deriştirme ve karıştırma hesaplamalarını yapar.",
    difficulty: "orta",
    type: "cok-adimli",
    question:
      "Kütlece %20’lik 200 g şeker çözeltisi ile kütlece %40’lık 300 g şeker çözeltisi karıştırılıyor. Oluşan karışımdan, şeker çökmeden 100 g su buharlaştırılıyor.\n\nSon çözeltinin kütlece şeker yüzdesi kaçtır?",
    options: ["30", "32", "36", "40", "45"],
    correctAnswer: 3,
    solution:
      "Şeker kütleleri: 200 · 0,20 = 40 g ve 300 · 0,40 = 120 g; toplam 160 g. Karışım kütlesi 500 g’dır (yüzde 32). 100 g su buharlaşınca çözelti kütlesi 400 g olur, şeker kütlesi değişmez. Kütlece yüzde = 160/400 · 100 = %40.",
    hint: "Önce toplam çözünen kütlesini bul; buharlaşmada yalnızca çözücü kütlesi azalır.",
    commonMistake: "Buharlaştırma adımını atlayıp %32’de kalmak ya da yüzdelerin ortalamasını (%30) almak.",
    teacherNote: "Karıştırma ve deriştirme işlemlerinde çözünen kütlesinin korunduğu fikrini ölçer.",
  },
  {
    id: `${SC}-q102`,
    topic: SC,
    subtopic: `${SC}-s3`,
    outcome: "Çözünen tanecik derişimi ile koligatif özellikler arasındaki ilişkiyi hesaplamalarla yorumlar.",
    difficulty: "orta",
    type: "islem",
    question:
      "0,05 mol Al(NO₃)₃ katısı 250 g suda çözülüyor. Tuzun tamamen iyonlaştığı kabul edilirse çözeltinin 1 atm’deki donma noktası kaç °C olur? (Su için donma noktası alçalma sabiti Kd = 1,86 °C·kg/mol)",
    options: ["−0,372", "−1,488", "−1,116", "−0,744", "−1,860"],
    correctAnswer: 1,
    solution:
      "Molalite = 0,05 mol / 0,250 kg = 0,2 m. Al(NO₃)₃ → Al³⁺ + 3NO₃⁻ olduğundan 1 formül birimi 4 tanecik verir; tanecik molalitesi 0,2 · 4 = 0,8 m. ΔTd = 1,86 · 0,8 = 1,488 °C. Donma noktası 0 − 1,488 = −1,488 °C.",
    hint: "Koligatif özellikler çözünen türüne değil, toplam tanecik molalitesine bağlıdır.",
    commonMistake: "İyonlaşmayı hesaba katmayıp −0,372 °C bulmak ya da nitrat iyonlarını tek tanecik sayıp −0,744 °C bulmak.",
    teacherNote: "Molalite hesabı ile iyonlaşma katsayısının (i) birlikte kullanılmasını ölçer.",
  },

  // =====================================================================
  // KİMYASAL TEPKİMELERDE ENERJİ
  // =====================================================================
  {
    id: `${TE}-q101`,
    topic: TE,
    subtopic: `${TE}-s3`,
    outcome: "Bağ enerjilerini kullanarak tepkime entalpisini hesaplar.",
    difficulty: "orta",
    type: "tablo",
    question:
      "H₂(g) + Cl₂(g) → 2HCl(g)\n\nTabloda verilen ortalama bağ enerjilerine göre yukarıdaki tepkimeyle 7,3 g HCl gazı oluşurken açığa çıkan ısı kaç kJ’dür? (HCl = 36,5 g/mol)",
    table: {
      caption: "Ortalama bağ enerjileri",
      headers: ["Bağ", "Bağ enerjisi (kJ/mol)"],
      rows: [
        ["H–H", "436"],
        ["Cl–Cl", "243"],
        ["H–Cl", "432"],
      ],
    },
    options: ["9,25", "18,5", "37", "92,5", "185"],
    correctAnswer: 1,
    solution:
      "ΔH = Σ(kırılan bağlar) − Σ(oluşan bağlar) = (436 + 243) − 2 · 432 = 679 − 864 = −185 kJ. Bu değer 2 mol HCl oluşumu içindir. 7,3 g HCl = 7,3/36,5 = 0,2 mol. Açığa çıkan ısı = 0,2 · 185 / 2 = 18,5 kJ.",
    hint: "Hesapladığın ΔH’nin kaç mol HCl’ye karşılık geldiğini denkleme bakarak belirle.",
    commonMistake: "−185 kJ’ü 1 mol HCl için sanıp 37 kJ bulmak ya da oluşan bağ sayısını 1 almak.",
    teacherNote: "Bağ enerjisinden ΔH hesabını ve ısının madde miktarıyla orantısını birlikte ölçer.",
  },
  {
    id: `${TE}-q102`,
    topic: TE,
    subtopic: `${TE}-s4`,
    outcome: "Tepkime ısılarının toplanabilirliğini (Hess yasası) kullanarak entalpi hesaplamaları yapar.",
    difficulty: "orta",
    type: "islem",
    question:
      "N₂(g) + O₂(g) → 2NO(g)  ΔH = +180 kJ\n2NO(g) + O₂(g) → 2NO₂(g)  ΔH = −114 kJ\n\nBuna göre ½N₂(g) + O₂(g) → NO₂(g) tepkimesinin ΔH değeri kaç kJ’dür?",
    options: ["+66", "−33", "+147", "−147", "+33"],
    correctAnswer: 4,
    solution:
      "İki tepkime toplanırsa: N₂(g) + 2O₂(g) → 2NO₂(g), ΔH = +180 + (−114) = +66 kJ. İstenen tepkime bunun yarısıdır: ΔH = +66/2 = +33 kJ.",
    hint: "Ara ürün NO’yu yok edecek biçimde tepkimeleri topla, sonra katsayıları istenen tepkimeye uydur.",
    commonMistake: "Toplamı ikiye bölmeyi unutup +66 kJ işaretlemek.",
    teacherNote: "Hess yasasında tepkimelerin toplanması ve katsayıyla ΔH’nin orantılı değişmesini ölçer.",
  },

  // =====================================================================
  // ÇÖZÜNÜRLÜK DENGESİ
  // =====================================================================
  {
    id: `${CD}-q101`,
    topic: CD,
    subtopic: `${CD}-s1`,
    outcome: "Çözünürlük ile çözünürlük çarpımı arasındaki dönüşümleri hesaplar.",
    difficulty: "kolay",
    type: "islem",
    question:
      "Belirli bir sıcaklıkta CaF₂ katısının çözünürlük çarpımı Kçç = 3,2×10⁻¹¹’dir. Aynı sıcaklıkta CaF₂’nin saf sudaki molar çözünürlüğü kaç mol/L’dir?",
    options: ["4×10⁻⁴", "1×10⁻⁴", "2×10⁻⁴", "8×10⁻⁴", "5,6×10⁻⁶"],
    correctAnswer: 2,
    solution:
      "CaF₂(k) ⇌ Ca²⁺(suda) + 2F⁻(suda). Çözünürlük s ise [Ca²⁺] = s, [F⁻] = 2s. Kçç = s · (2s)² = 4s³ = 3,2×10⁻¹¹ ⇒ s³ = 8×10⁻¹² ⇒ s = 2×10⁻⁴ mol/L.",
    hint: "Kçç ifadesinde her iyonun derişimi katsayısı kadar üs alır; önce s cinsinden yaz.",
    commonMistake: "Kçç = s² sanıp karekök almak (≈5,6×10⁻⁶) ya da F⁻ derişimini 2s yerine s almak.",
    teacherNote: "AB₂ tipi tuzlarda Kçç = 4s³ bağıntısının kurulmasını ölçer.",
  },
  {
    id: `${CD}-q102`,
    topic: CD,
    subtopic: `${CD}-s4`,
    outcome: "Sıcaklık, ortak iyon ve pH değişiminin çözünürlük dengesine etkisini yorumlar.",
    difficulty: "orta",
    type: "islem",
    question:
      "25 °C’de Mg(OH)₂ için Kçç = 1×10⁻¹¹’dir. Aynı sıcaklıkta pH değeri 12’de sabit tutulan bir tampon çözeltide Mg(OH)₂’nin molar çözünürlüğü kaç mol/L’dir?",
    options: ["1×10⁻⁷", "1×10⁻⁹", "1×10⁻⁵", "1×10⁻¹¹", "1,4×10⁻⁴"],
    correctAnswer: 0,
    solution:
      "pH = 12 ⇒ pOH = 2 ⇒ [OH⁻] = 1×10⁻² M (tampon olduğu için sabit). Mg(OH)₂ ⇌ Mg²⁺ + 2OH⁻ ; Kçç = [Mg²⁺][OH⁻]² ⇒ s = 1×10⁻¹¹ / (10⁻²)² = 1×10⁻¹¹ / 10⁻⁴ = 1×10⁻⁷ mol/L.",
    hint: "pH’tan [OH⁻]’yi bul; bu derişim ortak iyon gibi davranır ve sabittir.",
    commonMistake: "[OH⁻]’nin karesini almayı unutup 1×10⁻⁹ bulmak ya da ortamın etkisini yok sayıp saf sudaki çözünürlüğü (≈1,4×10⁻⁴) vermek.",
    teacherNote: "pH’ın bazik hidroksitlerin çözünürlüğünü ortak iyon etkisiyle nasıl düşürdüğünü ölçer.",
  },
  {
    id: `${CD}-q103`,
    topic: CD,
    subtopic: `${CD}-s2`,
    outcome: "Ortak iyonun çözünürlüğe etkisini açıklar ve ortak iyonlu ortamda çözünürlüğü hesaplar.",
    difficulty: "orta",
    type: "onculu",
    question:
      "Dibinde katısı bulunan doygun AgCl çözeltisine aynı sıcaklıkta bir miktar katı NaCl ekleniyor ve NaCl tamamen çözünüyor.\n\nYeni denge kurulduğunda ilk duruma göre aşağıdaki ifadelerden hangileri doğrudur?",
    premises: [
      "Kaptaki katı AgCl kütlesi artar.",
      "AgCl’nin çözünürlük çarpımı (Kçç) değişmez.",
      "Çözeltideki Ag⁺ iyonu derişimi artar.",
    ],
    options: ["Yalnız I", "Yalnız II", "Yalnız III", "I ve II", "I, II ve III"],
    correctAnswer: 3,
    solution:
      "NaCl ortama ortak iyon (Cl⁻) ekler. AgCl(k) ⇌ Ag⁺ + Cl⁻ dengesi Le Chatelier ilkesine göre sola kayar; Ag⁺ iyonlarının bir kısmı AgCl olarak çöker, katı kütlesi artar (I doğru) ve [Ag⁺] azalır (III yanlış). Kçç yalnızca sıcaklığa bağlıdır; sıcaklık sabit olduğundan değişmez (II doğru).",
    hint: "Kçç’yi değiştiren tek etken sıcaklıktır; iyon derişimleri ise dengenin kaydığı yöne göre değişir.",
    commonMistake: "Ortak iyon eklenince Kçç’nin de küçüldüğünü düşünmek.",
    teacherNote: "Ortak iyon etkisinde çözünürlük ile Kçç kavramlarının ayrımını ölçer.",
  },
  {
    id: `${CD}-q104`,
    topic: CD,
    subtopic: `${CD}-s3`,
    outcome: "İyon çarpımını Kçç ile karşılaştırarak çökelme olup olmayacağını belirler.",
    difficulty: "zor",
    type: "cok-adimli",
    question:
      "Belirli bir sıcaklıkta PbCl₂ için Kçç = 1,6×10⁻⁵’tir. Aynı sıcaklıkta 0,02 M Pb(NO₃)₂ çözeltisi ile 0,04 M NaCl çözeltisinden eşit hacimler karıştırılıyor.\n\nKarışım için hesaplanan iyon çarpımı (Qİ) ve çökelme durumu hangi seçenekte doğru verilmiştir?",
    options: [
      "Qİ = 3,2×10⁻⁵; çökelme olur.",
      "Qİ = 2×10⁻⁴; çökelme olur.",
      "Qİ = 1,6×10⁻⁵; çözelti tam doygundur.",
      "Qİ = 8×10⁻⁶; çökelme olmaz.",
      "Qİ = 4×10⁻⁶; çökelme olmaz.",
    ],
    correctAnswer: 4,
    solution:
      "Eşit hacimler karıştırıldığından her derişim yarıya iner: [Pb²⁺] = 0,01 M, [Cl⁻] = 0,02 M. Qİ = [Pb²⁺][Cl⁻]² = 0,01 · (0,02)² = 4×10⁻⁶. Qİ < Kçç (1,6×10⁻⁵) olduğundan çözelti doymamıştır ve çökelme olmaz.",
    hint: "Karıştırmada hacim iki katına çıkar; iyon çarpımını seyrelmiş derişimlerle hesapla.",
    commonMistake: "Seyrelmeyi hesaba katmayıp 3,2×10⁻⁵ bulmak ya da Cl⁻ derişiminin karesini almayı unutmak.",
    teacherNote: "Karıştırmada seyrelme, Qİ yazımı ve Kçç ile karşılaştırma adımlarını birlikte ölçer.",
  },

  // =====================================================================
  // KARBON KİMYASINA GİRİŞ
  // =====================================================================
  {
    id: `${KG}-q101`,
    topic: KG,
    subtopic: `${KG}-s1`,
    outcome: "Organik ve anorganik bileşikleri ayırt eder; karbonun allotroplarını (elmas, grafit, fulleren, grafen, nanotüp) karşılaştırır.",
    difficulty: "orta",
    type: "onculu",
    question: "Karbonun allotropları ile ilgili aşağıdaki ifadelerden hangileri doğrudur?",
    premises: [
      "Grafen, sp² hibritleşmesi yapmış karbon atomlarından oluşan, tek atom kalınlığında iki boyutlu bir yapıdır.",
      "Fulleren (C₆₀) molekülündeki karbon atomlarının tamamı sp³ hibritleşmesi yapmıştır.",
      "Karbon nanotüp, bir grafen tabakasının silindir biçiminde kıvrılmış hâli olarak düşünülebilir.",
    ],
    options: ["Yalnız I", "I ve III", "Yalnız III", "II ve III", "I, II ve III"],
    correctAnswer: 1,
    solution:
      "Grafen, grafitin tek bir katmanıdır; her C atomu sp² hibritli olup üç komşu C’ye bağlıdır (I doğru). Fullerende her C atomu üç komşu C’ye bağlıdır ve yaklaşık sp² hibritleşmesi gösterir; yapı beşgen ve altıgen halkalardan oluşan kafes şeklindedir (II yanlış). Nanotüpler, grafen tabakasının silindir şeklinde kıvrılmasıyla oluşmuş yapılar olarak modellenir (III doğru).",
    hint: "Her karbon atomunun kaç komşu karbona bağlı olduğunu düşün; dört bağ sp³’e, üç bağ sp²’ye karşılık gelir.",
    commonMistake: "Fullerenin küresel (üç boyutlu) olmasından dolayı elmas gibi sp³ hibritli olduğunu sanmak.",
    teacherNote: "Karbon allotroplarının yapı–hibritleşme ilişkisini ölçer.",
  },
  {
    id: `${KG}-q102`,
    topic: KG,
    subtopic: `${KG}-s3`,
    outcome: "Karbon atomunun sp³, sp² ve sp hibritleşmesini ve oluşan molekül geometrisini açıklar.",
    difficulty: "zor",
    type: "yorum",
    question: "Aşağıdaki moleküllerden hangisinde hem sp hem de sp² hibritleşmesi yapmış karbon atomu bulunur?",
    options: ["CH₃–C≡CH", "CH₂=CH₂", "CH₂=C=CH₂", "CH₃–CH=CH₂", "CH₃–CH₃"],
    correctAnswer: 2,
    solution:
      "Bir karbonun hibritleşmesi bağlı olduğu atom sayısına (σ bağı sayısına) göre belirlenir: 4 σ → sp³, 3 σ → sp², 2 σ → sp. CH₂=C=CH₂ (propadien) molekülünde uçtaki karbonlar 3 atoma bağlıdır (sp²), ortadaki karbon iki çift bağ yaptığından yalnızca 2 atoma bağlıdır (sp). Propinde sp ve sp³, etende yalnız sp², propende sp² ve sp³, etanda yalnız sp³ vardır.",
    hint: "Her karbon için σ bağı sayısını say; iki çift bağ yapan karbon da iki üçlü bağdaki karbon gibi davranır.",
    commonMistake: "Yalnızca üçlü bağın sp hibritine yol açtığını düşünüp iki çift bağ yapan karbonu gözden kaçırmak.",
    teacherNote: "Hibritleşmeyi bağ türünden değil, σ bağı sayısından belirleme becerisini ölçer.",
  },
  {
    id: `${KG}-q103`,
    topic: KG,
    subtopic: `${KG}-s2`,
    outcome: "Element analizi verilerinden organik bileşiklerin basit ve molekül formülünü hesaplar.",
    difficulty: "zor",
    type: "cok-adimli",
    question:
      "C, H ve N elementlerinden oluşan 0,9 g organik bir bileşik tamamen yakıldığında 1,76 g CO₂ ve 1,26 g H₂O oluşuyor. Bileşiğin mol kütlesi 45 g/mol’dür.\n\nBuna göre bileşiğin molekül formülü aşağıdakilerden hangisidir? (H = 1, C = 12, N = 14, O = 16)",
    options: ["CH₅N", "C₂H₅N", "C₃H₉N", "C₂H₇N", "C₂H₆N₂"],
    correctAnswer: 3,
    solution:
      "C: 1,76/44 = 0,04 mol ⇒ 0,48 g. H: 1,26/18 = 0,07 mol H₂O ⇒ 0,14 mol H ⇒ 0,14 g. N kütlesi = 0,9 − 0,48 − 0,14 = 0,28 g ⇒ 0,02 mol. Mol oranı C : H : N = 0,04 : 0,14 : 0,02 = 2 : 7 : 1 ⇒ basit formül C₂H₇N (2·12 + 7 + 14 = 45). Mol kütlesi 45 olduğundan molekül formülü C₂H₇N’dir.",
    hint: "Azot kütlesini, toplam kütleden C ve H kütlelerini çıkararak bul.",
    commonMistake: "H₂O’daki H mol sayısını 2 ile çarpmayı unutup C₂H₃,₅N gibi bir oranla CH₅N’ye yönelmek.",
    teacherNote: "Yanma analizinden kütle korunumu ile üçüncü elementin bulunmasını ve formül türetmeyi ölçer.",
  },
  {
    id: `${KG}-q104`,
    topic: KG,
    subtopic: `${KG}-s4`,
    outcome: "VSEPR ve değerlik bağ teorisiyle basit moleküllerin geometrisini ve polarlığını yorumlar.",
    difficulty: "orta",
    type: "onculu",
    question: "Aşağıdaki moleküllerden hangileri polardır? (₁H, ₆C, ₇N, ₁₇Cl)",
    premises: ["CH₃Cl", "CCl₄", "HCN"],
    options: ["I ve III", "Yalnız I", "Yalnız II", "II ve III", "I, II ve III"],
    correctAnswer: 0,
    solution:
      "CH₃Cl: C merkezli dörtyüzlü geometri vardır ancak bağlı atomlar farklı (3 H, 1 Cl) olduğundan bağ dipolleri birbirini sıfırlamaz; polardır. CCl₄: Dört özdeş C–Cl bağı düzgün dörtyüzlü yönlendiğinden dipoller birbirini sıfırlar; apolardır. HCN: Doğrusal olsa da iki uçtaki atomlar farklı (H ve N) ve C≡N bağı güçlü polar olduğundan net dipol vardır; polardır.",
    hint: "Geometri simetrik olsa bile merkeze bağlı atomlar farklıysa net dipol oluşabilir.",
    commonMistake: "Doğrusal her molekülü CO₂ gibi apolar sanıp HCN’yi apolar saymak.",
    teacherNote: "Molekül polarlığının hem geometriye hem bağlı atomların türüne bağlı olduğunu ölçer.",
  },

  // =====================================================================
  // ENERJİ KAYNAKLARI VE BİLİMSEL GELİŞMELER
  // =====================================================================
  {
    id: `${EN}-q101`,
    topic: EN,
    subtopic: `${EN}-s2`,
    outcome: "Güneş, rüzgâr, jeotermal, hidrojen ve nükleer enerji kaynaklarını avantaj ve dezavantajlarıyla karşılaştırır.",
    difficulty: "kolay",
    type: "onculu",
    question: "Günümüzde elektrik üretiminde kullanılan nükleer santrallerle ilgili aşağıdaki ifadelerden hangileri doğrudur?",
    premises: [
      "Enerji, uranyum gibi ağır çekirdeklerin bölünmesiyle (fisyon) elde edilir.",
      "Santral çalışırken yakıtın yanmasından kaynaklanan CO₂ salımı olmaz.",
      "Oluşan radyoaktif atıklar birkaç hafta içinde radyoaktifliğini tamamen kaybettiğinden depolama sorunu yoktur.",
    ],
    options: ["Yalnız I", "Yalnız II", "II ve III", "I, II ve III", "I ve II"],
    correctAnswer: 4,
    solution:
      "Ticari nükleer santraller fisyon tepkimesiyle çalışır (I doğru). Enerji kimyasal yanmayla değil çekirdek tepkimesiyle üretildiğinden çalışma sırasında yanma kaynaklı CO₂ salımı yoktur (II doğru). Kullanılmış yakıttaki bazı izotopların yarı ömürleri çok uzundur; atıklar binlerce yıl güvenli depolama gerektirir (III yanlış).",
    hint: "Nükleer enerjinin en tartışmalı yönü, atıkların ne kadar süre tehlikeli kaldığıdır.",
    commonMistake: "Fisyon ile füzyonu karıştırmak ya da atık sorununu küçümsemek.",
    teacherNote: "Nükleer enerjinin avantaj ve dezavantajlarını bilimsel olarak değerlendirmeyi ölçer.",
  },
  {
    id: `${EN}-q102`,
    topic: EN,
    subtopic: `${EN}-s4`,
    outcome: "Nanoteknolojinin kimyadaki uygulama alanlarını açıklar.",
    difficulty: "orta",
    type: "bilgi",
    question: "Nanoteknoloji ve nanomalzemelerle ilgili aşağıdaki ifadelerden hangisi yanlıştır?",
    options: [
      "Nanoteknoloji, yaklaşık 1–100 nanometre (1 nm = 10⁻⁹ m) boyutundaki yapıların tasarımı ve kullanımıyla ilgilenir.",
      "Tanecik boyutu küçüldükçe yüzey alanı/hacim oranı arttığından nano boyutlu katalizörlerin etkinliği artabilir.",
      "Bir maddenin nano boyuttaki fiziksel ve kimyasal özellikleri her zaman makro boyuttaki özellikleriyle aynıdır.",
      "Gümüş nanotanecikler antibakteriyel özellikleri nedeniyle bazı tekstil ve tıbbi ürünlerde kullanılır.",
      "Lotus yaprağından esinlenen su itici nano kaplamalar kendi kendini temizleyen yüzeylerin üretiminde kullanılır.",
    ],
    correctAnswer: 2,
    solution:
      "Nano boyutta atomların büyük bölümü yüzeyde bulunduğundan erime noktası, renk, iletkenlik ve tepkime yatkınlığı gibi özellikler makro boyuttakinden farklı olabilir; örneğin altın nanotanecik çözeltileri kırmızı renkli görünebilir. Bu nedenle C seçeneği yanlıştır. Diğer ifadeler nanoteknolojinin tanımı ve uygulamalarıyla uyumludur.",
    hint: "Nanoteknolojiyi önemli kılan şey, boyut küçüldüğünde ortaya çıkan yeni özelliklerdir.",
    commonMistake: "Madde aynı olduğu için özelliklerinin boyuttan bağımsız olduğunu düşünmek.",
    teacherNote: "Boyut–özellik ilişkisini ve nanoteknolojinin temel uygulamalarını ölçer.",
  },
  {
    id: `${EN}-q103`,
    topic: EN,
    subtopic: `${EN}-s2`,
    outcome: "Güneş, rüzgâr, jeotermal, hidrojen ve nükleer enerji kaynaklarını avantaj ve dezavantajlarıyla karşılaştırır.",
    difficulty: "orta",
    type: "problem",
    question:
      "2H₂(g) + O₂(g) → 2H₂O(s)  ΔH = −572 kJ\n\nHidrojenle çalışan bir aracın belirli bir yolculuk için 143 000 kJ enerjiye ihtiyacı vardır. Bu enerjinin tamamı yukarıdaki tepkimeden karşılanırsa kaç kg H₂ harcanır? (H = 1)",
    options: ["0,5", "1", "2", "4", "0,25"],
    correctAnswer: 1,
    solution:
      "Denkleme göre 2 mol H₂ yandığında 572 kJ, yani 1 mol H₂ başına 286 kJ açığa çıkar. Gereken H₂ = 143 000 / 286 = 500 mol. Kütle = 500 · 2 g = 1000 g = 1 kg.",
    hint: "ΔH’nin denklemdeki 2 mol H₂’ye ait olduğuna dikkat et.",
    commonMistake: "572 kJ’ü 1 mol H₂’ye ait sanıp 0,5 kg bulmak ya da H₂’nin mol kütlesini 1 alıp yine 0,5 kg bulmak.",
    teacherNote: "Yakıt olarak hidrojenin enerji hesabında stokiyometri ve tepkime ısısı orantısını ölçer.",
  },
  {
    id: `${EN}-q104`,
    topic: EN,
    subtopic: `${EN}-s3`,
    outcome: "Sürdürülebilir yaşam ve kalkınma açısından enerji kaynaklarının kullanımını değerlendirir.",
    difficulty: "yeni-nesil",
    type: "yeni-nesil",
    question:
      "Bir enerji raporunda, şeker pancarı ve mısırdan elde edilen biyoetanolün “karbon nötre yakın” bir yakıt olduğu belirtiliyor. Aynı raporda benzinin ise atmosferdeki CO₂ miktarını net olarak artırdığı vurgulanıyor.\n\nBiyoetanolün bu şekilde nitelendirilmesinin en uygun açıklaması aşağıdakilerden hangisidir?",
    options: [
      "Yanmasıyla açığa çıkan CO₂’nin, hammaddesi olan bitkiler büyürken fotosentezle atmosferden aldığı CO₂’ye yaklaşık eşit olması",
      "Etanolün yanması sonucunda hiç CO₂ oluşmaması",
      "Etanolün molekülünde karbon atomu bulunmaması",
      "Etanolün yanma ısısının benzininkinden daha yüksek olması",
      "Biyoetanol üretiminde hiçbir tarım alanına ve enerjiye ihtiyaç duyulmaması",
    ],
    correctAnswer: 0,
    solution:
      "C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O tepkimesiyle etanol de CO₂ üretir (B ve C yanlış). Ancak bu karbon, kısa süre önce bitkiler tarafından fotosentezle atmosferden alınmıştır; bu nedenle döngü kısa sürede kapanır ve net katkı küçüktür. Fosil yakıtlardaki karbon ise milyonlarca yıldır yer altında depolanmış karbondur. Etanolün kütle başına yanma ısısı benzininkinden düşüktür (D yanlış); üretimi tarım alanı ve enerji gerektirir (E yanlış), bu yüzden “tam” değil “yaklaşık” nötr denir.",
    hint: "Açığa çıkan karbonun kısa süre önce nereden geldiğini düşün.",
    commonMistake: "“Karbon nötr” ifadesini yanmada hiç CO₂ oluşmaması olarak yorumlamak.",
    teacherNote: "Karbon döngüsü üzerinden yenilenebilir yakıtların sürdürülebilirliğini değerlendirmeyi ölçer.",
  },
];
