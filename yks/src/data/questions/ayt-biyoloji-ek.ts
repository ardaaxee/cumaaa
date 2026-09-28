import type { QuestionSeed } from '../../domain/types';

/**
 * AYT Biyoloji ek soru bankası: soru sayısı 10’un altında kalan konular için
 * özgün pratik sorular. Kimlikler çakışmayı önlemek için q1NN biçimindedir.
 */

const DUY = "aytbio-duyu-organlari";
const DHS = "aytbio-destek-hareket";
const URE = "aytbio-ureme-embriyonik";

export const questions: QuestionSeed[] = [
  // =====================================================================
  // DUYU ORGANLARI
  // =====================================================================
  {
    id: `${DUY}-q101`,
    topic: DUY,
    subtopic: `${DUY}-s3`,
    outcome: "Koku, tat ve deri duyularının algılanmasını açıklar.",
    difficulty: "orta",
    type: "onculu",
    question: "İnsanda deri duyusu ile ilgili aşağıdaki ifadelerden hangileri doğrudur?",
    premises: [
      "Ağrı, serbest sinir uçları tarafından algılanır.",
      "Parmak uçlarında birim alandaki dokunma reseptörü sayısı sırt derisindekinden fazladır.",
      "Basınç reseptörleri, derinin en dış tabakası olan epidermiste yer alır.",
    ],
    options: ["Yalnız I", "I ve II", "I ve III", "II ve III", "I, II ve III"],
    correctAnswer: 1,
    solution:
      "Ağrı reseptörleri dallanmış serbest sinir uçlarıdır (I doğru). Parmak uçları gibi hassas bölgelerde dokunma reseptörleri yoğundur; bu nedenle iki noktayı ayırt etme eşiği parmakta sırta göre çok daha düşüktür (II doğru). Derin basıncı algılayan reseptörler (Pacini cisimcikleri) dermisin derin kısmında ve deri altında bulunur; epidermiste yer almaz (III yanlış).",
    hint: "Reseptörün derideki derinliği, algıladığı uyarının türüyle ilişkilidir.",
    commonMistake: "Tüm reseptörlerin derinin yüzeyinde, epidermiste bulunduğunu düşünmek.",
    teacherNote: "Deri reseptörlerinin türü, yeri ve yoğunluğu ile duyarlılık arasındaki ilişkiyi ölçer.",
  },
  {
    id: `${DUY}-q102`,
    topic: DUY,
    subtopic: `${DUY}-s2`,
    outcome: "Kulağın yapısını, işitme ve dengenin sağlanmasını açıklar.",
    difficulty: "orta",
    type: "yorum",
    question:
      "Bir hasta, başını hızla sağa sola çevirdiğinde ya da kendi etrafında döndüğünde baş dönmesi ve dengesizlik yaşadığını söylüyor. Yapılan testlerde işitmesinin tamamen normal olduğu, kulak zarı ve orta kulak kemikçiklerinde sorun bulunmadığı belirleniyor.\n\nBu hastada sorunun kaynağı en büyük olasılıkla aşağıdaki yapılardan hangisidir?",
    options: ["Korti organı", "Östaki borusu", "Salyangoz (koklea)", "Yarım daire kanalları", "Kulak kepçesi"],
    correctAnswer: 3,
    solution:
      "Başın dönme hareketleri iç kulaktaki yarım daire kanallarının içindeki sıvının hareketiyle algılanır. Hastada yalnızca dönme hareketleriyle ortaya çıkan denge sorunu vardır ve işitme normaldir. Korti organı ve salyangoz işitmeden sorumludur; Östaki borusu orta kulak basıncını dengeler; kulak kepçesi sesi toplar. Bu nedenle en olası kaynak yarım daire kanallarıdır.",
    hint: "İç kulakta işitme ve denge görevleri farklı yapılara aittir.",
    commonMistake: "Denge ile ilgili her sorunu Östaki borusuna bağlamak.",
    teacherNote: "İç kulakta işitme ve denge yapılarının görev ayrımını vaka üzerinden ölçer.",
  },
  {
    id: `${DUY}-q103`,
    topic: DUY,
    subtopic: `${DUY}-s1`,
    outcome: "Gözün yapısını ve görmenin gerçekleşmesini açıklar.",
    difficulty: "zor",
    type: "onculu",
    question:
      "Sağlıklı bir göz, uzaktaki bir dağa bakarken bakışını elindeki kitabın satırlarına çeviriyor ve ortam aydınlık kalıyor.\n\nBu uyum sırasında gözde aşağıdakilerden hangileri gerçekleşir?",
    premises: [
      "Siliyer kaslar kasılır.",
      "Göz merceği incelir ve yassılaşır.",
      "Göz bebeği (pupil) daralır.",
    ],
    options: ["Yalnız I", "Yalnız II", "I ve III", "II ve III", "I, II ve III"],
    correctAnswer: 2,
    solution:
      "Yakına bakarken ışığın retinada odaklanması için merceğin kırıcılığı artmalıdır. Siliyer kaslar kasılır (I doğru), mercek askı bağları gevşer ve esnek mercek kalınlaşıp daha küre biçimli olur (II yanlış). Yakına bakma refleksinde göz bebeği de daralarak alan derinliğini artırır (III doğru).",
    hint: "Yakındaki cismin görüntüsünü retinaya düşürmek için merceğin daha mı fazla, daha mı az kırması gerekir?",
    commonMistake: "Siliyer kas kasılınca merceğin gerilip inceldiğini sanmak.",
    teacherNote: "Uyum (akomodasyon) mekanizmasında kas–bağ–mercek ilişkisinin kurulmasını ölçer.",
  },

  // =====================================================================
  // DESTEK VE HAREKET SİSTEMİ
  // =====================================================================
  {
    id: `${DHS}-q101`,
    topic: DHS,
    subtopic: `${DHS}-s1`,
    outcome: "Kemiğin uzama ve kalınlaşma yoluyla büyümesini açıklar.",
    difficulty: "orta",
    type: "yorum",
    question:
      "12 yaşındaki bir çocuğun el bileği röntgeninde uzun kemiklerin uç kısımları ile gövdesi arasında ince, açık renkli bir bant görülüyor. Doktor, bu bandın varlığının çocuğun boy uzamasının henüz tamamlanmadığını gösterdiğini söylüyor.\n\nRöntgende görülen bu yapı ve görevi aşağıdakilerin hangisinde doğru verilmiştir?",
    options: [
      "Epifiz plağı (büyüme kıkırdağı); kıkırdak hücrelerinin bölünüp zamanla kemikleşmesiyle kemiğin boyca uzamasını sağlar.",
      "Periost (kemik zarı); kemiğin boyca uzamasını sağlar.",
      "Kemik iliği; kemiğin enine kalınlaşmasını sağlar.",
      "Eklem kıkırdağı; kemiğin boyca uzamasını sağlar.",
      "Havers kanalı; kemikte kan hücresi üretimini sağlar.",
    ],
    correctAnswer: 0,
    solution:
      "Uzun kemiklerin baş (epifiz) ve gövde (diyafiz) kısımları arasındaki büyüme kıkırdağı (epifiz plağı) röntgende açık renkli bir bant olarak görülür. Buradaki kıkırdak hücreleri bölünür ve gövde tarafında zamanla kemik dokuya dönüşür; böylece kemik boyca uzar. Ergenlik sonunda plak tamamen kemikleşir ve boy uzaması durur. Periost kemiğin enine kalınlaşmasından, kırmızı kemik iliği kan hücresi üretiminden sorumludur; Havers kanalları damar ve sinirleri taşır.",
    hint: "Boyca uzama ile enine kalınlaşmanın kaynaklandığı yapılar farklıdır.",
    commonMistake: "Kemiğin her yönde büyümesini periosta bağlamak.",
    teacherNote: "Kemiğin uzama ve kalınlaşma mekanizmalarını ayırt etmeyi klinik bir bağlamda ölçer.",
  },
  {
    id: `${DHS}-q102`,
    topic: DHS,
    subtopic: `${DHS}-s3`,
    outcome: "Düz, kalp ve iskelet kasını yapı ve işleyiş bakımından karşılaştırır.",
    difficulty: "kolay",
    type: "onculu",
    question: "Bir öğrenci su bardağını masadan ağzına götürmek için dirseğini büküyor.\n\nBu hareketle ilgili aşağıdaki ifadelerden hangileri doğrudur?",
    premises: [
      "Kolun ön yüzündeki pazı (biseps) kası kasılır.",
      "Kolun arka yüzündeki arka kol (triseps) kası gevşer.",
      "Kaslar kemiklere tendonlar aracılığıyla bağlandığından kasılan kas kemiği çeker.",
    ],
    options: ["Yalnız I", "I ve II", "I ve III", "II ve III", "I, II ve III"],
    correctAnswer: 4,
    solution:
      "İskelet kasları çalışırken yalnızca çekebilir, itemez; bu nedenle eklemler karşıt (antagonist) kas çiftleriyle hareket ettirilir. Dirsek bükülürken pazı kası kasılır (I doğru), karşıtı olan arka kol kası gevşer (II doğru). Kas ile kemik arasındaki bağlantıyı tendonlar sağlar; kasılan kas tendon aracılığıyla kemiği çeker (III doğru).",
    hint: "Kaslar itemez; bir eklemi iki yöne hareket ettirmek için iki kas gerekir.",
    commonMistake: "Tendon ile eklem bağlarını (ligament) karıştırmak ya da iki kasın aynı anda kasıldığını sanmak.",
    teacherNote: "Antagonist kas çalışmasını ve kas–kemik bağlantısını ölçer.",
  },
  {
    id: `${DHS}-q103`,
    topic: DHS,
    subtopic: `${DHS}-s4`,
    outcome: "Destek ve hareket sistemi rahatsızlıklarını ve korunma yollarını açıklar.",
    difficulty: "kolay",
    type: "bilgi",
    question:
      "Kemik yoğunluğunun azalması ve kemiklerin kolay kırılır hâle gelmesiyle ortaya çıkan kemik erimesi (osteoporoz) hastalığından korunma ile ilgili aşağıdaki davranışlardan hangisi riski azaltmaya yönelik değildir?",
    options: [
      "Kalsiyumdan zengin besinler tüketmek",
      "Uygun saatlerde güneş ışığından yararlanarak D vitamini sentezini desteklemek",
      "Yürüyüş gibi kemiklere yük bindiren düzenli egzersizler yapmak",
      "Uzun süre hareketsiz bir yaşam sürmek",
      "Sigara ve aşırı alkol tüketiminden kaçınmak",
    ],
    correctAnswer: 3,
    solution:
      "Kalsiyum kemiğin yapı taşıdır; D vitamini kalsiyumun bağırsaktan emilimini artırır; yük bindiren egzersizler kemik yapımını uyarır; sigara ve aşırı alkol kemik kaybını hızlandırır. Hareketsiz yaşam ise kemik yıkımını artırıp yoğunluğu düşürür; riski azaltmaz, artırır.",
    hint: "Kemik, kullanıldıkça ve yük aldıkça güçlenen canlı bir dokudur.",
    commonMistake: "Kemiklerin dinlendirildikçe korunacağını düşünmek.",
    teacherNote: "Kemik sağlığını etkileyen yaşam biçimi faktörlerini ölçer.",
  },

  // =====================================================================
  // ÜREME SİSTEMİ VE EMBRİYONİK GELİŞİM
  // =====================================================================
  {
    id: `${URE}-q101`,
    topic: URE,
    subtopic: `${URE}-s1`,
    outcome: "Erkek üreme sisteminin yapısını ve hormonal düzenlenmesini açıklar.",
    difficulty: "zor",
    type: "tablo",
    question:
      "Tabloda erkek üreme sisteminin düzenlenmesinde rol oynayan bazı hormonlar, etki ettikleri yerler ve etkileri verilmiştir.\n\nTablodaki satırlardan hangisinde verilen bilgi yanlıştır?",
    table: {
      headers: ["Satır", "Hormon", "Etki ettiği yer", "Etkisi"],
      rows: [
        ["1", "FSH", "Sertoli hücreleri", "Sperm oluşumunu destekler."],
        ["2", "LH", "Leydig (ara) hücreleri", "Testosteron salgılanmasını uyarır."],
        ["3", "Testosteron", "Hipotalamus ve ön hipofiz", "Yüksek düzeyde GnRH ve LH salgısını baskılar."],
        ["4", "İnhibin", "Ön hipofiz", "FSH salgısını artırır."],
        ["5", "Testosteron", "Çeşitli vücut dokuları", "İkincil eşey özelliklerinin gelişmesini sağlar."],
      ],
    },
    options: ["1", "2", "3", "4", "5"],
    correctAnswer: 3,
    solution:
      "FSH Sertoli hücrelerini uyararak sperm oluşumunu destekler; LH Leydig hücrelerinden testosteron salgılatır; testosteron hem ikincil eşey özelliklerini oluşturur hem de yüksek düzeyde hipotalamus ve hipofiz üzerine negatif geri bildirim yapar. İnhibin, Sertoli hücrelerinden salgılanır ve ön hipofizden FSH salgısını baskılar; artırmaz. Bu nedenle 4. satır yanlıştır.",
    hint: "Hormonal düzenlemede geri bildirimin yönüne dikkat et: hedef hormonu artıran mı, baskılayan mı?",
    commonMistake: "FSH ile LH’nin hedef hücrelerini karıştırmak.",
    teacherNote: "Erkek üreme sisteminde hipotalamus–hipofiz–testis ekseni ve negatif geri bildirimi ölçer.",
  },
  {
    id: `${URE}-q102`,
    topic: URE,
    subtopic: `${URE}-s3`,
    outcome: "Embriyonik zarların ve plasentanın görevlerini açıklar.",
    difficulty: "orta",
    type: "bilgi",
    question:
      "Kuş yumurtasında gelişen embriyonun protein metabolizması sonucu oluşan ürik asidi depolayan ve aynı zamanda koryonla birlikte gaz alışverişine katılan embriyonik zar aşağıdakilerden hangisidir?",
    options: ["Amniyon", "Koryon", "Allantoyis", "Vitellus (besin) kesesi", "Plasenta"],
    correctAnswer: 2,
    solution:
      "Kuş ve sürüngen yumurtasında allantoyis, embriyonun boşaltım atığı olan ürik asidi depolar; koryonla kaynaşarak gaz alışverişini de sağlar. Amniyon embriyoyu sıvı içinde tutarak darbelere ve kurumaya karşı korur; vitellus kesesi besin (vitellüs) içerir; koryon en dıştaki zardır. Plasenta kuşlarda bulunmaz.",
    hint: "Kapalı bir yumurtada atıklar dışarı atılamaz; bir zarın içinde depolanması gerekir.",
    commonMistake: "Allantoyis ile amniyonun görevlerini karıştırmak ya da kuşlarda plasenta olduğunu düşünmek.",
    teacherNote: "Embriyonik zarların görevlerini kara yaşamına uyum bağlamında ölçer.",
  },
  {
    id: `${URE}-q103`,
    topic: URE,
    subtopic: `${URE}-s2`,
    outcome: "Menstrual döngüde hormon ve yapı değişimlerini yorumlar.",
    difficulty: "yeni-nesil",
    type: "yeni-nesil",
    question:
      "Doğum kontrol haplarının birçoğu sentetik östrojen ve progesteron içerir. Hap düzenli kullanıldığında kandaki bu hormonların düzeyi döngü boyunca yüksek kalır ve yumurtlama (ovulasyon) gerçekleşmez.\n\nBu etkinin en uygun açıklaması aşağıdakilerden hangisidir?",
    options: [
      "Yüksek östrojen ve progesteron düzeyi, negatif geri bildirimle hipotalamus ve hipofizi baskılayarak FSH ve LH salgısını düşürür; folikül olgunlaşmaz ve LH artışı oluşmaz.",
      "Östrojen ve progesteron, yumurtalıktaki tüm folikülleri doğrudan yok eder.",
      "Yüksek progesteron, FSH ve LH salgısını artırarak folikülleri erken olgunlaştırır.",
      "Hormonlar rahim duvarını tamamen ortadan kaldırarak yumurtlamayı engeller.",
      "Östrojen ve progesteron, oksitosin salgısını artırarak yumurtalıkları kasılmaya zorlar.",
    ],
    correctAnswer: 0,
    solution:
      "Normal döngüde ovulasyonu tetikleyen, döngü ortasındaki ani LH artışıdır. Kanda sürekli yüksek östrojen ve progesteron bulunması hipotalamustan GnRH, hipofizden FSH ve LH salgısını negatif geri bildirimle baskılar. FSH düşük olduğu için folikül olgunlaşmaz, LH artışı oluşmadığı için yumurtlama gerçekleşmez. Bu durum gebelikte korpus luteum ve plasentanın salgıladığı hormonların yumurtlamayı durdurmasıyla benzerdir.",
    hint: "Gebelikte yeni yumurtlamanın neden olmadığını hatırla.",
    commonMistake: "Döngü ortasındaki östrojen artışının oluşturduğu pozitif geri bildirimi, sürekli yüksek hormon düzeyiyle karıştırmak.",
    teacherNote: "Menstrual döngüdeki geri bildirim mekanizmalarını güncel bir uygulamaya aktarmayı ölçer.",
  },
];
