import type { LessonSeed } from '../../domain/types';

export const lessons: LessonSeed[] = [
  {
    topicId: 'tytfel-felsefeye-giris',
    intro:
      "Felsefe kelimesi Yunanca “philo” (sevgi) ve “sophia” (bilgelik) sözcüklerinden gelir; “bilgelik sevgisi” demektir. Filozof, her şeyi bildiğini iddia eden değil, bilgiyi seven ve arayan kişidir. Felsefe; varlık, bilgi, değer, insan ve toplum gibi konularda akla dayalı, eleştirel ve sistemli düşünme etkinliğidir.\n\nTYT’de bu konu genellikle bir paragraf verilip “felsefi düşüncenin hangi özelliği vurgulanmaktadır?” ya da “aşağıdakilerden hangisi felsefi bir sorudur?” şeklinde sorulur. İlk filozofların arkhe arayışı ve argüman türleri (tümdengelim, tümevarım, analoji) de sık karşına çıkar.",
    prerequisites: [
      "Bilim, din ve sanatın genel olarak neyle uğraştığını bilmek",
      "Bir paragrafta ana düşünceyi bulabilmek",
      "Genel ve özel yargı arasındaki farkı sezebilmek",
    ],
    concepts: [
      { term: "Refleksiflik", definition: "Düşüncenin kendi üzerine dönmesi; filozofun kendi kavramlarını, varsayımlarını ve akıl yürütmelerini de sorgulaması." },
      { term: "Arkhe", definition: "İlk Çağ filozoflarının evrenin kendisinden oluştuğu ilk madde ya da ilke için kullandığı kavram." },
      { term: "Kavram", definition: "Nesnelerin ortak özelliklerini zihinde temsil eden genel düşünce birimi (ör. “adalet”, “insan”)." },
      { term: "Önerme", definition: "Doğru ya da yanlış olabilen, yargı bildiren cümle." },
      { term: "Argüman", definition: "Öncüllerden bir sonuca ulaşmak için kurulan akıl yürütme dizisi." },
      { term: "Tümdengelim", definition: "Genel bir yargıdan özel bir sonuca ulaşan, öncüller doğruysa sonucu zorunlu olarak doğru olan akıl yürütme." },
      { term: "Tümevarım", definition: "Tek tek gözlemlerden genel bir sonuca ulaşan akıl yürütme; sonucu olasılıklıdır." },
      { term: "Analoji", definition: "İki şey arasındaki benzerlikten hareketle birinde bulunan özelliğin ötekinde de bulunduğu sonucuna varan akıl yürütme." },
    ],
    formulas: [
      { expr: "Thales — Arkhe sudur.", meaning: "İlk filozof kabul edilir; evreni doğaüstü değil doğal bir ilkeyle açıklamaya çalışmıştır." },
      { expr: "Anaksimandros — Arkhe apeirondur (sınırsız, belirsiz).", meaning: "İlk maddenin gözle görülen belirli bir madde olamayacağını savunmuştur." },
      { expr: "Anaksimenes — Arkhe havadır.", meaning: "Havanın yoğunlaşıp seyrelmesiyle diğer maddelerin oluştuğunu düşünmüştür." },
      { expr: "Herakleitos — Arkhe ateştir; her şey akar.", meaning: "Evrenin sürekli değişim içinde olduğunu ve bu değişimi logosun yönettiğini savunmuştur." },
      { expr: "Pythagoras — Arkhe sayıdır.", meaning: "Evrendeki düzen ve uyumun sayısal oranlarla açıklanabileceğini ileri sürmüştür." },
      { expr: "Empedokles — Dört unsur (su, hava, toprak, ateş)", meaning: "Sevgi ve nefret güçleriyle bu dört unsurun birleşip ayrıldığını savunmuştur." },
      { expr: "Demokritos — Arkhe atomdur.", meaning: "Evrenin bölünemeyen parçacıklardan ve boşluktan oluştuğunu savunmuştur." },
      { expr: "Sokrates — “Bildiğim tek şey, hiçbir şey bilmediğimdir.”", meaning: "Bilgisizliğini kabul etmeyi gerçek bilgiye giden yolun başlangıcı sayar." },
    ],
    logic:
      "Felsefe, kesin cevaplardan çok sorulara değer verir; çünkü felsefi sorular (Adalet nedir? Bilgi mümkün müdür?) deneyle bir kez ve herkes için çözülemez. Bu yüzden felsefede aynı sorulara farklı dönemlerde farklı cevaplar verilir; bu durum felsefenin eksikliği değil, doğasıdır.\n\nBilim olguları deney ve gözlemle inceler, sonuçları nesnel ve sınanabilirdir. Din inanca ve vahye dayanır; temel ilkeleri sorgulamaya kapalıdır. Sanat duygu ve sezgiyle, estetik bir ürün ortaya koyar. Felsefe ise akla ve eleştiriye dayanır; bilimin, dinin ve sanatın temel kavramlarını da sorgulayabilir. Argümanlarda ise tümdengelimin sonucu zorunlu, tümevarım ve analojinin sonucu ise olasılıklıdır.",
    examples: [
      {
        level: 'kolay',
        problem: "“Suyun kaldırma kuvveti nasıl hesaplanır?” ve “İnsan özgür müdür?” sorularından hangisi felsefidir?",
        steps: [
          "İlk soru deney ve ölçümle kesin olarak cevaplanabilir; fiziğin konusudur.",
          "İkinci soru deneyle çözülemez, akıl yürütmeyle tartışılır ve farklı cevaplara açıktır.",
        ],
        answer: "“İnsan özgür müdür?” sorusu felsefidir.",
      },
      {
        level: 'orta',
        problem: "“Bütün canlılar hücrelerden oluşur. Mantar bir canlıdır. O hâlde mantar hücrelerden oluşur.” argümanının türünü ve yapısını belirle.",
        steps: [
          "Birinci ve ikinci cümle öncüllerdir; üçüncü cümle sonuçtur.",
          "Genel bir yargıdan (bütün canlılar) özel bir duruma (mantar) geçilmiştir.",
          "Öncüller doğruysa sonuç zorunlu olarak doğrudur.",
        ],
        answer: "Tümdengelimli bir argümandır.",
      },
      {
        level: 'zor',
        problem: "“Filozof, dünyayı açıklarken kendi kullandığı ‘neden’ ve ‘bilgi’ kavramlarını da sorgular.” ifadesi felsefenin hangi özelliğini gösterir; bilimden farkı nedir?",
        steps: [
          "Düşüncenin kendi kavramlarını sorgulaması refleksifliktir.",
          "Bilim insanı ‘neden’ kavramını kullanır ama genellikle onu sorgulamaz; bunu bilim felsefesi yapar.",
        ],
        answer: "Refleksiflik; felsefe, bilimin kullandığı temel kavramları da sorgulayabilir.",
      },
    ],
    osymThinking:
      "Soru çoğu zaman bir paragraf verir ve “parçada felsefi düşüncenin hangi özelliği vurgulanmaktadır?” diye sorar. Anahtar kelimeleri yakala: “kendi düşüncesi üzerine düşünme” refleksif, “tutarlı bir bütün” sistemli, “hazır kabulleri sorgulama” eleştirel, “akla dayanma” rasyonel. Felsefi soru sorularında deneyle kesin cevaplanabilen soruları (bilimsel) ve bilgi yoklayan soruları (tarih, coğrafya) ele.",
    commonMistakes: [
      "Felsefenin kesin ve herkesçe kabul edilen sonuçlara ulaştığını düşünmek.",
      "Apeironu Pythagoras’a, sayıyı Anaksimandros’a vermek; eşleştirmeleri karıştırmak.",
      "Tümevarımın sonucunu da tümdengelim gibi zorunlu doğru sanmak.",
      "Her soru cümlesini felsefi soru sanmak; olgusal, ölçülebilir sorular felsefi değildir.",
    ],
    tips: [
      "Arkhe listesini kısaltmayla hatırla: Thales su, Anaksimenes hava, Herakleitos ateş, Anaksimandros apeiron, Pythagoras sayı, Demokritos atom.",
      "Genelden özele = tümdengelim; özelden genele = tümevarım; benzerlikten sonuca = analoji.",
      "“Felsefe öğrenilmez, felsefe yapmak öğrenilir.” sözü Kant’a aittir ve felsefenin bir etkinlik olduğunu vurgular.",
    ],
    summary: [
      "Felsefe = bilgelik sevgisi; akla dayalı, eleştirel, sistemli, refleksif düşünme.",
      "Felsefi sorular deneyle kesin olarak çözülemez, tartışmaya açıktır.",
      "Bilim olgusal ve deneysel, din inanca dayalı, sanat duygu ve sezgiye dayalıdır.",
      "İlk filozoflar arkheyi aradı: su, hava, ateş, apeiron, sayı, atom.",
      "Tümdengelim zorunlu, tümevarım ve analoji olasılıklı sonuç verir.",
    ],
  },
  {
    topicId: 'tytfel-bilgi-felsefesi',
    intro:
      "Bilgi felsefesi (epistemoloji), bilginin ne olduğunu, doğru bilginin mümkün olup olmadığını, bilginin kaynağını ve sınırlarını araştırır. Bilen özne (süje), bilinen nesne (obje) ve ikisi arasındaki ilişki bu alanın temelidir.\n\nTYT’de en çok “Bilginin kaynağı nedir?” sorusuna verilen cevaplar sorulur: Akıl diyen rasyonalistler, deney diyen empiristler, ikisini birleştiren Kant, sezgi diyen Bergson ve işe yararlığı ölçü alan pragmatistler. Paragraftaki görüşün hangi akıma ait olduğunu bulmak bu konunun en sık soru kalıbıdır.",
    prerequisites: [
      "Felsefi düşüncenin özelliklerini bilmek",
      "Akıl, duyu ve sezgi kavramlarını ayırt edebilmek",
      "Önerme ve doğruluk kavramlarını tanımak",
    ],
    concepts: [
      { term: "Süje (özne)", definition: "Bilme etkinliğini gerçekleştiren, bilen varlık." },
      { term: "Obje (nesne)", definition: "Bilgisi edinilen, bilinen şey." },
      { term: "Doğruluk", definition: "Bilginin konusu olan şeyle uyuşması ya da bir önermenin belirli ölçütlere göre doğru kabul edilmesi." },
      { term: "Şüphecilik (septisizm)", definition: "Kesin ve doğru bilgiye ulaşılamayacağını ya da bu konuda yargıdan kaçınılması gerektiğini savunan tutum." },
      { term: "Rasyonalizm (akılcılık)", definition: "Doğru bilginin kaynağının akıl olduğunu, aklın doğuştan ilkeler taşıdığını savunan görüş." },
      { term: "Empirizm (deneycilik)", definition: "Bütün bilgilerin deneyden, duyu verilerinden geldiğini savunan görüş." },
      { term: "Kritisizm (eleştiricilik)", definition: "Kant’ın, bilginin akıl ile deneyin birlikte çalışmasıyla oluştuğunu savunan görüşü." },
    ],
    formulas: [
      { expr: "Protagoras — “İnsan her şeyin ölçüsüdür.”", meaning: "Bilgi kişiye göre değişir; herkes için geçerli, mutlak bilgi yoktur (görecelik)." },
      { expr: "Gorgias — “Hiçbir şey yoktur; olsa bile bilinemez; bilinse bile başkasına aktarılamaz.”", meaning: "Varlığı ve bilginin imkânını reddeden aşırı şüpheci (nihilist) tutum." },
      { expr: "Descartes — “Düşünüyorum, öyleyse varım.”", meaning: "Yöntemsel şüpheyle şüphe edilemeyecek ilk kesin bilgiye ulaşır; açık ve seçik olan doğrudur." },
      { expr: "Locke — Zihin boş bir levhadır (tabula rasa).", meaning: "Doğuştan bilgi yoktur; bütün bilgiler deneyle kazanılır." },
      { expr: "Berkeley — “Var olmak algılanmaktır.”", meaning: "Nesneler ancak algılandıkları sürece vardır; bilgi algıya dayanır." },
      { expr: "Kant — “Kavramsız algılar kör, algısız kavramlar boştur.”", meaning: "Bilgi, duyu verileri ile aklın kategorilerinin birleşmesiyle oluşur." },
      { expr: "Bergson — Gerçek, sezgiyle kavranır.", meaning: "Akıl parçalar; hayatın akışını ve özünü ancak sezgi kavrayabilir." },
      { expr: "William James — Doğru olan, işe yarayandır.", meaning: "Pragmatizm: bilginin değeri pratik hayattaki sonuçlarıyla ölçülür." },
    ],
    logic:
      "Bilginin kaynağı tartışmasının nedeni, duyularımızın bazen yanılmasıdır: Suya batırılmış kalem kırık görünür. Rasyonalistler bu yüzden kesin bilgiyi aklın doğuştan ilkelerinde arar; matematik bunun örneğidir. Empiristler ise aklın içine önce deneyle bir şey girmedikçe onun boş kalacağını söyler.\n\nKant iki yaklaşımı birleştirir: Deney bilginin malzemesini verir, akıl bu malzemeyi kategorileriyle düzenler. Bu nedenle Kant’a göre biz şeyleri kendinde oldukları gibi değil, bize göründükleri gibi (fenomen) bilebiliriz.",
    examples: [
      {
        level: 'kolay',
        problem: "“Üçgenin iç açılarının toplamının 180° olduğunu bilmek için yüzlerce üçgen ölçmeye gerek yoktur; akıl bunu kendi ilkeleriyle kavrar.” Bu görüş hangi akıma aittir?",
        steps: [
          "Bilginin deney olmadan, aklın ilkeleriyle elde edildiği vurgulanıyor.",
          "Bilginin kaynağını akıl olarak gören akım rasyonalizmdir.",
        ],
        answer: "Rasyonalizm.",
      },
      {
        level: 'orta',
        problem: "Bir düşünür, bilginin malzemesini duyuların sağladığını ama bu malzemenin zihnin zaman, mekân ve nedensellik gibi kalıplarıyla düzenlendiğini söylüyor. Bu düşünür kimdir?",
        steps: [
          "Hem duyuların hem aklın katkısı vurgulanıyor; tek kaynak kabul edilmiyor.",
          "Bu sentez Kant’ın kritisizmidir.",
        ],
        answer: "Kant (kritisizm).",
      },
    ],
    osymThinking:
      "Sorular genellikle özgün bir paragraf verip “bu parçada savunulan görüş aşağıdakilerden hangisidir?” ya da “parçadaki düşünceyi savunan filozof kimdir?” diye sorar. İpucu kelimeler belirleyicidir: “doğuştan, apaçık, akıl” rasyonalizm; “boş levha, deneyim, duyu” empirizm; “kategori, algı ile kavram birlikte” Kant; “sezgi, iç görü” Bergson; “sonuç, işe yarama” pragmatizm.",
    commonMistakes: [
      "Descartes’ın şüphesini (yöntemsel, bilgiye ulaşmak için) Pyrrhon’un şüpheciliğiyle karıştırmak.",
      "Locke’u rasyonalist sanmak; Locke doğuştan ideaları reddeden bir empiristtir.",
      "Kant’ı yalnızca akılcı ya da yalnızca deneyci saymak.",
      "Pragmatizmdeki “işe yarama” ölçütünü tutarlılık ölçütüyle karıştırmak.",
    ],
    tips: [
      "Doğruluk ölçütleri: uygunluk (gerçekle örtüşme), tutarlılık (önceki doğrularla çelişmeme), fayda (işe yarama), apaçıklık (Descartes).",
      "“Algılanmak” gördüğünde Berkeley’i, “boş levha” gördüğünde Locke’u hatırla.",
    ],
    summary: [
      "Bilgi felsefesi bilginin imkânını, kaynağını, sınırlarını ve doğruluğunu inceler.",
      "Şüpheciler kesin bilgiyi reddeder; dogmatikler bilginin mümkün olduğunu savunur.",
      "Kaynak: akıl (rasyonalizm), deney (empirizm), ikisi birlikte (Kant), sezgi (Bergson).",
      "Doğruluk ölçütleri: uygunluk, tutarlılık, fayda, apaçıklık.",
    ],
  },
  {
    topicId: 'tytfel-varlik-felsefesi',
    intro:
      "Varlık felsefesi (ontoloji), var olanı var olan olarak inceler: Varlık gerçekten var mıdır, varsa neyden oluşur, değişen mi değişmeyen mi? Bu sorular bilimden önce gelen, en genel sorulardır.\n\nTYT’de bu konuda en çok idealizm–materyalizm–düalizm ayrımı ve Herakleitos ile Parmenides’in değişim tartışması sorulur. Ayrıca Farabi ve İbn Sina’nın “zorunlu varlık – mümkün varlık” ayrımı da bilinmesi gereken önemli bir noktadır.",
    prerequisites: [
      "İlk filozofların arkhe arayışını bilmek",
      "Madde ve düşünce (zihin) kavramlarını ayırt edebilmek",
    ],
    concepts: [
      { term: "Ontoloji", definition: "Varlığı, var olanın ne olduğunu ve varlığın temel niteliklerini inceleyen felsefe dalı." },
      { term: "Töz", definition: "Var olmak için kendinden başka bir şeye ihtiyaç duymayan, değişen niteliklerin altında kalıcı olan şey." },
      { term: "Oluş", definition: "Varlığın sürekli değişim ve dönüşüm içinde olması." },
      { term: "İdea", definition: "Platon’a göre duyular dünyasının üstünde bulunan, değişmez, ezelî ve kusursuz asıl gerçeklik." },
      { term: "Nihilizm", definition: "Varlığın gerçekte var olmadığını ya da hiçbir şeyin var olmadığını savunan görüş." },
    ],
    formulas: [
      { expr: "Herakleitos — “Aynı ırmakta iki kez yıkanılmaz.”", meaning: "Varlık sürekli değişir; kalıcı olan yalnızca değişimi yöneten logostur." },
      { expr: "Parmenides — “Varlık vardır, yokluk yoktur.”", meaning: "Varlık doğmamış, yok olmayan, değişmeyen bir bütündür; değişim duyuların yanılgısıdır." },
      { expr: "Platon — Asıl varlık idealardır.", meaning: "İdealist görüş: duyusal nesneler ideaların gölgeleri, kopyalarıdır." },
      { expr: "Demokritos — Varlık atomlar ve boşluktan oluşur.", meaning: "Materyalist görüş: her şey maddi parçacıkların birleşip ayrılmasıdır." },
      { expr: "Descartes — Düşünen töz ve yer kaplayan töz", meaning: "Düalist görüş: varlık ruh (düşünce) ve madde (uzam) olmak üzere iki tözden oluşur." },
      { expr: "Hegel — Varlık mutlak ruhun (tinin) kendini açmasıdır.", meaning: "İdealist görüş: gerçeklik diyalektik bir süreçle gelişen ruhtur." },
      { expr: "Farabi ve İbn Sina — Zorunlu varlık / mümkün varlık", meaning: "Varlığı kendinden olan Tanrı zorunlu varlıktır; diğer varlıklar varlığını ondan alan mümkün varlıklardır." },
    ],
    logic:
      "Varlığın ne olduğu sorusuna verilen cevaplar, neyin daha “gerçek” sayıldığına göre ayrışır. İdealist için asıl gerçek düşünce ya da idealardır; madde bunun bir görüntüsüdür. Materyalist için asıl gerçek maddedir; düşünce bile maddenin bir ürünüdür. Düalist ise ikisini de birbirine indirgenemeyen ayrı gerçeklikler sayar.\n\nDeğişim sorusunda Herakleitos duyulara güvenerek her şeyin aktığını, Parmenides ise akla güvenerek yokluğun düşünülemeyeceğini, bu yüzden değişimin olamayacağını söyler. Böylece ontoloji tartışması, bilgi felsefesindeki akıl–duyu tartışmasıyla da bağlantılıdır.",
    examples: [
      {
        level: 'kolay',
        problem: "“Evrende var olan her şey maddedir; ruh ve düşünce de maddi süreçlerin ürünüdür.” Bu görüş hangi yaklaşıma aittir?",
        steps: [
          "Tek bir ilke (madde) kabul ediliyor.",
          "Düşünce maddeye indirgeniyor; bu materyalizmdir.",
        ],
        answer: "Materyalizm.",
      },
      {
        level: 'orta',
        problem: "Bir filozof, tahta masanın çürüyüp yok olabileceğini ama “masa ideasının” hiç değişmeden var olduğunu söylüyor. Bu filozof kimdir ve görüşü nedir?",
        steps: [
          "Değişmez, kusursuz bir asıl gerçeklik (idea) ile değişen duyusal nesne ayrılıyor.",
          "Bu ayrım Platon’un idealar kuramıdır.",
        ],
        answer: "Platon; idealizm.",
      },
    ],
    osymThinking:
      "Sorular genellikle bir filozofun görüşünü kaynak göstermeden paragraf hâlinde verir ve hangi yaklaşıma ait olduğunu sorar. “Parçacık, madde” materyalizm; “idea, zihin, ruh” idealizm; “iki töz” düalizm; “her şey akar” Herakleitos; “değişim yanılsamadır” Parmenides demektir. Karşılaştırmalı paragraflarda iki görüşün hangi soruda ayrıştığını bulmak istenir.",
    commonMistakes: [
      "Herakleitos ile Parmenides’in görüşlerini ters eşleştirmek.",
      "Platon’u materyalist, Demokritos’u idealist sanmak.",
      "Düalizmi “iki farklı Tanrı” inancı gibi dinî bir kavram sanmak; burada iki ayrı töz kastedilir.",
    ],
    tips: [
      "Değişimi savunan = Herakleitos (ateş, logos); değişmezliği savunan = Parmenides (varlık vardır).",
      "Zorunlu varlık kavramı Farabi ve İbn Sina’da Tanrı’yı ifade eder.",
    ],
    summary: [
      "Ontoloji varlığın var olup olmadığını, ne olduğunu ve nasıl olduğunu sorar.",
      "İdealizm düşünceyi, materyalizm maddeyi, düalizm ikisini birden asıl varlık sayar.",
      "Herakleitos değişimi, Parmenides değişmezliği savunur.",
      "Farabi ve İbn Sina varlığı zorunlu ve mümkün olarak ikiye ayırır.",
    ],
  },
  {
    topicId: 'tytfel-ahlak-felsefesi',
    intro:
      "Ahlak felsefesi (etik), insan davranışlarını iyi–kötü, doğru–yanlış açısından inceler ve bu değerlendirmelerin dayanağını sorgular. “İyi nedir?”, “Evrensel bir ahlak yasası var mıdır?”, “İnsan özgür müdür?” soruları bu alanın merkezindedir.\n\nTYT’de bu konu çoğunlukla bir durum ya da paragraf verip hangi ahlak anlayışının (hazcılık, faydacılık, ödev ahlakı, erdem etiği) savunulduğunu sorar. Kant’ın ödev ahlakı ile Mill’in faydacılığı arasındaki fark özellikle önemlidir.",
    prerequisites: [
      "Felsefi düşüncenin özelliklerini bilmek",
      "Niyet ile sonuç kavramlarını ayırt edebilmek",
    ],
    concepts: [
      { term: "Ahlak", definition: "Belli bir toplumda bireylerin uyması beklenen davranış kuralları ve değerler bütünü." },
      { term: "Etik", definition: "Ahlakı felsefi açıdan inceleyen, ahlaki yargıların temelini sorgulayan felsefe dalı." },
      { term: "Erdem", definition: "İyiyi istikrarlı biçimde yapmayı sağlayan, alışkanlıkla kazanılan karakter özelliği." },
      { term: "Ödev", definition: "Ahlak yasasına saygıdan dolayı, çıkar gözetmeden yapılması gereken eylem." },
      { term: "Vicdan", definition: "İnsanın kendi davranışlarını ahlaki açıdan değerlendiren iç yargı gücü." },
      { term: "Sorumluluk", definition: "Kişinin özgür iradesiyle yaptığı eylemlerin sonuçlarını üstlenmesi." },
    ],
    formulas: [
      { expr: "Aristippos — En yüksek iyi, anlık bedensel hazdır.", meaning: "Bencil hazcılık (hedonizm)." },
      { expr: "Epikuros — Mutluluk, acıdan kurtulmuş ruh dinginliğidir (ataraksia).", meaning: "Ölçülü, ruhsal hazları öne çıkaran hazcılık." },
      { expr: "J. S. Mill / Bentham — En çok sayıda insanın en büyük mutluluğu", meaning: "Faydacılık: eylemin değeri sonuçlarına ve toplumsal faydaya göre belirlenir." },
      { expr: "Kant — “Öyle davran ki eyleminin ilkesi evrensel bir yasa olabilsin.”", meaning: "Ödev ahlakı: eylemin değeri sonucuna değil, iyi niyete ve ödeve uygunluğuna bağlıdır." },
      { expr: "Aristoteles — Erdem, iki aşırılığın ortasıdır.", meaning: "Erdem etiği: mutluluk (eudaimonia) erdemli yaşamla ve orta yolla elde edilir." },
      { expr: "Protagoras — Ahlak görecelidir.", meaning: "Evrensel bir ahlak yasası yoktur; iyi ve kötü kişiye göre değişir." },
      { expr: "Sartre — “İnsan özgürlüğe mahkûmdur.”", meaning: "İnsan, seçimleriyle kendini yaratır; eylemlerinden tamamen sorumludur." },
    ],
    logic:
      "Ahlak tartışmalarındaki temel ayrım, eylemi neye göre değerlendirdiğimizdir. Faydacılar sonuca bakar: Bir eylem ne kadar çok insanı mutlu ediyorsa o kadar iyidir. Kant ise niyete ve ilkeye bakar: Yalan söylemek iyi sonuç verse bile, herkes yalan söylese güven ortadan kalkacağından yalan evrenselleştirilemez ve yanlıştır.\n\nEvrensel ahlak yasası tartışması da benzer bir mantık taşır: Akla dayanan ilkeler herkes için geçerliyse ahlak evrenseldir; ahlak toplumdan topluma, kişiden kişiye değişiyorsa göreceli olur.",
    examples: [
      {
        level: 'kolay',
        problem: "“Bir eylem, sonucu ne olursa olsun, yalnızca ahlak yasasına saygıdan dolayı yapılmışsa ahlakidir.” Bu görüş kime aittir?",
        steps: [
          "Sonuç değil, niyet ve ödev vurgulanıyor.",
          "Ödev ahlakının temsilcisi Kant’tır.",
        ],
        answer: "Kant.",
      },
      {
        level: 'orta',
        problem: "Bir belediye, sınırlı bütçesini az kişinin kullandığı bir park yerine binlerce kişinin yararlanacağı bir hastaneye ayırıyor ve “en çok kişiye en büyük yararı” gerekçesini gösteriyor. Bu karar hangi etik anlayışa uygundur?",
        steps: [
          "Karar sonuçlara ve toplumsal faydaya göre veriliyor.",
          "En çok sayıda insanın en büyük mutluluğu ilkesi faydacılığa aittir.",
        ],
        answer: "Faydacılık (utilitarizm).",
      },
    ],
    osymThinking:
      "Ahlak sorularında öğrenciye çoğu zaman bir günlük yaşam durumu verilir ve kişinin gerekçesinden etik yaklaşımı bulması istenir. Gerekçede “sonuç, yarar, mutluluk” varsa faydacılık; “ödev, ilke, niyet” varsa Kant; “alışkanlık, karakter, orta yol” varsa erdem etiği; “kişisel zevk” varsa hazcılık düşün.",
    commonMistakes: [
      "Epikuros’u bedensel hazları sınırsızca savunan biri sanmak; o ölçülü ve ruhsal dinginliği öne çıkarır.",
      "Faydacılığı bireysel bencillik sanmak; faydacılık toplumsal faydayı esas alır.",
      "Kant’ın ahlakının sonuçlara dayandığını düşünmek.",
      "Sartre’ı determinist sanmak; o insan özgürlüğünü savunur.",
    ],
    tips: [
      "Sonuç → faydacılık; niyet/ödev → Kant; karakter/erdem → Aristoteles.",
      "“Ahlak yasası evrenseldir” diyenler: Platon, Kant, Farabi; “göreceli” diyenler: Sofistler (Protagoras).",
    ],
    summary: [
      "Etik, ahlaki yargıların temelini sorgular.",
      "Hazcılık hazzı, faydacılık toplumsal yararı, Kant ödevi, Aristoteles erdemi esas alır.",
      "Evrensel ahlak yasası tartışmasında Kant evrenselci, Sofistler göreceli tutumdadır.",
      "Özgürlük tartışmasında determinizm belirlenmişliği, Sartre özgürlüğü savunur.",
    ],
  },
  {
    topicId: 'tytfel-sanat-felsefesi',
    intro:
      "Sanat felsefesi (estetik), güzelin ne olduğunu, sanat eserinin özelliklerini ve sanatın insan hayatındaki yerini sorgular. “Estetik” terimini bağımsız bir felsefe dalı için ilk kullanan düşünür Baumgarten’dir.\n\nTYT’de sanat felsefesi genellikle bir paragraf üzerinden sorulur: Sanat taklit midir, yaratma mıdır, oyun mudur, duyguların aktarılması mıdır? Ya da güzellik nesnenin özelliği midir, bakan kişinin beğenisine mi bağlıdır?",
    prerequisites: [
      "Felsefenin sanatla ilişkisini bilmek",
      "Nesnel ve öznel kavramlarını ayırt edebilmek",
    ],
    concepts: [
      { term: "Estetik", definition: "Güzeli, sanatı ve estetik yaşantıyı inceleyen felsefe dalı." },
      { term: "Estetik yargı", definition: "Bir nesne ya da eser hakkında verilen “güzel, çirkin, yüce” gibi değer yargısı." },
      { term: "Mimesis (taklit)", definition: "Sanatın doğayı ya da gerçekliği taklit ettiği görüşü." },
      { term: "Katharsis", definition: "Aristoteles’e göre trajedinin izleyicide uyandırdığı acıma ve korku yoluyla ruhu arındırması." },
      { term: "Sanat eseri", definition: "Sanatçının yaratıcılığıyla ortaya konan, özgün ve estetik değer taşıyan ürün." },
    ],
    formulas: [
      { expr: "Platon — Sanat, taklidin taklididir.", meaning: "Duyusal nesneler ideaların kopyasıdır; sanat eseri de bu kopyaların kopyasıdır." },
      { expr: "Aristoteles — Sanat taklittir; trajedi katharsis sağlar.", meaning: "Taklit insanın doğasında vardır; sanat eğitici ve arındırıcıdır." },
      { expr: "Kant — Güzel, çıkar gözetmeksizin hoşa gidendir.", meaning: "Güzellik yargısı öznel olmakla birlikte herkes için geçerlilik iddiası taşır." },
      { expr: "Hegel — Sanat, mutlak ruhun (tinin) duyusal görünüşüdür.", meaning: "Sanat, tinin kendini duyusal bir biçimde ifade etmesidir." },
      { expr: "Schiller — Sanat oyundur.", meaning: "Sanat, insanın hiçbir çıkar gözetmeden özgürce yaptığı oyun etkinliğidir." },
      { expr: "Tolstoy — Sanat, duyguların aktarılmasıdır (iletişim).", meaning: "Sanatçı yaşadığı duyguyu esere aktarır; izleyici de aynı duyguyu yaşar." },
      { expr: "Croce — Sanat, sezgi ve ifadedir.", meaning: "Sanat eseri sanatçının iç sezgisinin dışa vurumudur." },
    ],
    logic:
      "Güzellik tartışmasında iki temel tutum vardır: Güzelliği nesnel sayanlar (oran, uyum, simetri gibi) onun nesnenin kendisinde olduğunu düşünür. Öznel sayanlar ise aynı esere farklı insanların farklı tepkiler vermesinden hareketle güzelliğin bakanın beğenisine bağlı olduğunu söyler. Kant arada bir yer tutar: Güzellik yargısı kişinin duygusuna dayanır ama herkesin de onaylaması beklenir.\n\nSanatın ne olduğu sorusunda ise her filozof sanatın farklı bir işlevini öne çıkarır: taklit, yaratma, oyun, iletişim ya da ifade.",
    examples: [
      {
        level: 'kolay',
        problem: "“Sanatçı, kendi yaşadığı hüznü esere öyle yansıtmalı ki okuyan da aynı hüznü hissetsin.” Bu görüş hangi düşünürün sanat anlayışına uygundur?",
        steps: [
          "Duygunun sanatçıdan izleyiciye aktarılması vurgulanıyor.",
          "Sanatı duygu aktarımı (iletişim) olarak gören düşünür Tolstoy’dur.",
        ],
        answer: "Tolstoy.",
      },
      {
        level: 'orta',
        problem: "Platon ve Aristoteles sanatı “taklit” olarak görür. Ancak ikisinin sanata bakışı nasıl ayrışır?",
        steps: [
          "Platon’a göre sanat, idealardan iki kat uzak bir kopyadır; bu yüzden hakikatten uzaklaştırır.",
          "Aristoteles’e göre taklit öğretici ve doğaldır; trajedi izleyiciyi arındırır (katharsis).",
        ],
        answer: "Platon sanatı olumsuzlar; Aristoteles sanata olumlu, eğitici bir değer yükler.",
      },
    ],
    osymThinking:
      "Sorular çoğu zaman sanat eseri, sergi ya da izleyici deneyimi üzerine özgün bir paragraf verir ve savunulan görüşü sorar. “Kopya, doğayı yansıtma” taklit; “özgün, yeni” yaratma; “çıkar gözetmeyen, özgür” oyun; “duygu aktarma” iletişim; “bakana göre değişir” öznel güzellik demektir.",
    commonMistakes: [
      "Platon ile Aristoteles’in taklit görüşlerini aynı değerlendirmek.",
      "Kant’ın güzellik anlayışını tamamen göreceli sanmak.",
      "Estetik terimini Platon’a ya da Aristoteles’e vermek; bağımsız dal olarak Baumgarten kullanmıştır.",
    ],
    tips: [
      "Katharsis = Aristoteles; taklidin taklidi = Platon; oyun = Schiller; iletişim = Tolstoy.",
      "Paragrafta “değişmeyen oranlar” geçiyorsa nesnel, “bakan göz” geçiyorsa öznel güzellik ara.",
    ],
    summary: [
      "Estetik, güzeli ve sanatı inceleyen felsefe dalıdır (Baumgarten).",
      "Güzellik nesnel mi öznel mi tartışması temel sorudur.",
      "Sanat: taklit (Platon, Aristoteles), oyun (Schiller), iletişim (Tolstoy), ifade (Croce).",
      "Kant: Güzel, çıkar gözetmeksizin hoşa gidendir.",
    ],
  },
  {
    topicId: 'tytfel-din-felsefesi',
    intro:
      "Din felsefesi, dinin temel iddialarını (Tanrı’nın varlığı, ruhun ölümsüzlüğü, kötülük problemi, vahiy) akıl yoluyla inceler. Belirli bir dini savunmak ya da reddetmek amacı taşımaz; dinî inançların akılla temellendirilip temellendirilemeyeceğini sorgular.\n\nTYT’de bu konuda en çok Tanrı anlayışları (teizm, deizm, panteizm, ateizm, agnostisizm, fideizm) ile Tanrı’nın varlığına ilişkin kanıtlar sorulur. Paragraftaki görüşü doğru akımla eşleştirmek temel beceridir.",
    prerequisites: [
      "Felsefe ile din arasındaki farkları bilmek",
      "Tümdengelimli akıl yürütmeyi tanımak",
    ],
    concepts: [
      { term: "Teizm", definition: "Tanrı’nın evreni yarattığını, onu yönettiğini ve vahiy yoluyla insanlarla iletişim kurduğunu kabul eden görüş." },
      { term: "Deizm", definition: "Tanrı’nın evreni yarattığını ama ona müdahale etmediğini savunan; vahyi ve peygamberliği kabul etmeyen görüş." },
      { term: "Panteizm", definition: "Tanrı ile evreni özdeş sayan görüş (Spinoza)." },
      { term: "Ateizm", definition: "Tanrı’nın varlığını reddeden görüş." },
      { term: "Agnostisizm", definition: "Tanrı’nın varlığı ya da yokluğu hakkında kesin bilgiye ulaşılamayacağını savunan görüş." },
      { term: "Fideizm", definition: "Dinî inancın akla değil imana dayandığını, akılla temellendirilemeyeceğini savunan görüş." },
    ],
    formulas: [
      { expr: "Anselmus — Ontolojik kanıt", meaning: "Tanrı “kendisinden daha büyüğü düşünülemeyen varlık”tır; böyle bir varlık yalnız zihinde kalamaz, gerçekte de vardır." },
      { expr: "Descartes — Ontolojik kanıt", meaning: "Zihnimizdeki kusursuz varlık fikri, kusurlu bir varlıktan gelemez; kaynağı Tanrı’dır." },
      { expr: "Aristoteles — İlk hareket ettirici", meaning: "Kozmolojik yaklaşım: Her hareketin bir nedeni vardır; zincir sonsuza gidemeyeceğine göre kendisi hareket etmeyen bir ilk hareket ettirici vardır." },
      { expr: "Thomas Aquinas / İbn Sina — Kozmolojik kanıt", meaning: "Evrendeki varlıklar varlığını başkasından alır; bunların varlığı, varlığı zorunlu bir ilk nedene dayanır." },
      { expr: "Teleolojik (düzen) kanıt", meaning: "Evrendeki düzen ve amaçlılık, bilinçli bir düzenleyicinin varlığını gösterir." },
      { expr: "Kant — Ahlak kanıtı", meaning: "Ahlak yasasının anlam kazanması için Tanrı’nın varlığı pratik aklın bir gereği (postulatı) olarak kabul edilmelidir." },
      { expr: "Spinoza — “Tanrı ya da doğa”", meaning: "Panteizm: Tanrı ve doğa tek ve aynı tözdür." },
      { expr: "Kierkegaard — İman sıçraması", meaning: "Fideizm: İnanç akılla değil, kişinin iç teslimiyetiyle kazanılır." },
    ],
    logic:
      "Tanrı kanıtları hareket noktalarına göre ayrılır: Ontolojik kanıt yalnızca Tanrı kavramından yola çıkar, deneye başvurmaz (a priori). Kozmolojik kanıt evrenin var olmasından ve nedensellikten, teleolojik kanıt evrendeki düzenden (a posteriori), ahlak kanıtı ise insandaki ahlak bilincinden hareket eder.\n\nTanrı anlayışlarında ise iki soru belirleyicidir: Tanrı var mı? Varsa evrene ve insana müdahale eder mi? Teist her ikisine “evet”, deist yalnızca birincisine “evet” der; ateist ilkine “hayır” der; agnostik ise “bilinemez” der.",
    examples: [
      {
        level: 'kolay',
        problem: "“Tanrı dünyayı bir saatçi gibi kurmuş, sonra kendi yasalarına bırakmıştır.” Bu görüş hangi Tanrı anlayışına aittir?",
        steps: [
          "Tanrı’nın yarattığı kabul ediliyor.",
          "Yarattıktan sonra müdahale etmediği söyleniyor; bu deizmdir.",
        ],
        answer: "Deizm.",
      },
      {
        level: 'orta',
        problem: "“Bir göz, bir kanat ya da gezegenlerin yörüngesindeki uyum tesadüfle açıklanamaz; bu düzen bir düzenleyiciyi gerektirir.” Bu hangi kanıttır?",
        steps: [
          "Evrendeki düzen ve amaçlılıktan yola çıkılıyor.",
          "Düzenden düzenleyiciye ulaşan kanıt teleolojik kanıttır.",
        ],
        answer: "Teleolojik (düzen) kanıtı.",
      },
    ],
    osymThinking:
      "Sorularda Tanrı anlayışı çoğunlukla tanım verilmeden, bir kişinin ifadesiyle anlatılır. “Yarattı ama karışmaz” deizm, “Tanrı evrenin kendisidir” panteizm, “bilemeyiz” agnostisizm, “akılla değil imanla” fideizm demektir. Kanıt sorularında hareket noktasına bak: kavram → ontolojik, neden → kozmolojik, düzen → teleolojik, vicdan/ahlak → ahlak kanıtı.",
    commonMistakes: [
      "Agnostisizmi ateizmle karıştırmak; agnostik reddetmez, bilinemeyeceğini söyler.",
      "Deizmin vahyi ve peygamberliği kabul ettiğini sanmak.",
      "Ontolojik kanıtın evrendeki düzene dayandığını düşünmek.",
    ],
    tips: [
      "“Tanrı = doğa” gördüğünde hemen Spinoza ve panteizm aklına gelsin.",
      "Kant, Tanrı’nın varlığının kuramsal akılla kanıtlanamayacağını, ancak ahlak açısından kabul edilmesi gerektiğini söyler.",
    ],
    summary: [
      "Din felsefesi dinin temel iddialarını akılla inceler.",
      "Kanıtlar: ontolojik (kavram), kozmolojik (neden), teleolojik (düzen), ahlak.",
      "Teizm, deizm, panteizm, ateizm, agnostisizm ve fideizm temel Tanrı anlayışlarıdır.",
    ],
  },
  {
    topicId: 'tytfel-siyaset-felsefesi',
    intro:
      "Siyaset felsefesi; devletin kaynağını, iktidarın meşruiyetini, bireyin hak ve özgürlüklerini, adaletin nasıl sağlanacağını ve ideal bir yönetimin nasıl olması gerektiğini sorgular.\n\nTYT’de toplum sözleşmesi kuramcıları (Hobbes, Locke, Rousseau) ile ütopyalar (Platon, Farabi, More, Campanella, Bacon) en sık sorulan konulardır. Paragraftaki görüşten filozofu bulmak ve kavramları (iktidar, meşruiyet) doğru kullanmak beklenir.",
    prerequisites: [
      "Hak, özgürlük ve adalet kavramlarını genel olarak bilmek",
      "Ahlak felsefesindeki evrensel ahlak tartışmasını hatırlamak",
    ],
    concepts: [
      { term: "Devlet", definition: "Belli bir toprak üzerinde yaşayan insan topluluğunun egemenlik sahibi siyasi örgütlenmesi." },
      { term: "İktidar", definition: "Başkalarının davranışlarını etkileme, yönlendirme ve gerektiğinde zorla yaptırma gücü." },
      { term: "Meşruiyet", definition: "Bir iktidarın yönetilenler tarafından haklı, hukuka ve değerlere uygun kabul edilmesi." },
      { term: "Egemenlik", definition: "Devletin kendi ülkesi üzerindeki en üstün ve bağımsız yönetme yetkisi." },
      { term: "Toplum sözleşmesi", definition: "Devletin, insanların doğa durumundan çıkmak için kendi aralarında yaptıkları bir anlaşmayla kurulduğu görüşü." },
    ],
    formulas: [
      { expr: "Hobbes — Doğa durumu herkesin herkese karşı savaşıdır.", meaning: "İnsanlar güvenlik için haklarını mutlak bir egemene (Leviathan) devreder." },
      { expr: "Locke — Yaşam, özgürlük ve mülkiyet doğal haklardır.", meaning: "Devlet bu hakları korumak için kurulur; hakları çiğneyen yönetime direnilebilir." },
      { expr: "Rousseau — “İnsan özgür doğar ama her yerde zincire vurulmuştur.”", meaning: "Meşru yönetim, genel iradeye dayanan yönetimdir." },
      { expr: "Platon — Devlet", meaning: "İdeal devleti filozoflar yönetmelidir (filozof kral)." },
      { expr: "Farabi — El-Medinetü’l-Fazıla", meaning: "Erdemli toplum; amacı insanları mutluluğa ulaştırmaktır." },
      { expr: "Thomas More — Ütopya; Campanella — Güneş Ülkesi; F. Bacon — Yeni Atlantis", meaning: "İdeal toplum düzenini tasarlayan ütopyalar." },
      { expr: "Machiavelli — Hükümdar (Prens)", meaning: "Siyasette belirleyici olan ahlak değil, devletin gücü ve devamlılığıdır." },
      { expr: "Montesquieu — Kuvvetler ayrılığı", meaning: "Yasama, yürütme ve yargı birbirinden ayrılarak özgürlük korunur." },
    ],
    logic:
      "Toplum sözleşmesi kuramcıları, devletten önceki “doğa durumunu” farklı tasarladıkları için farklı devlet modellerine ulaşır. Hobbes doğa durumunu korkunç bir savaş hâli olarak gördüğünden güçlü ve mutlak bir egemen ister. Locke doğa durumunda da doğal hakların var olduğunu düşündüğünden sınırlı ve hakları koruyan bir yönetim önerir. Rousseau ise özgürlüğün ancak herkesin ortak iyiyi isteyen genel iradesine dayalı bir düzende korunacağını savunur.\n\nMeşruiyet tartışması da buradan doğar: Güce sahip olmak, yönetmeye hakkı olmak anlamına gelmez; iktidar ancak yönetilenlerin onayına ve hukuka dayandığında meşrudur.",
    examples: [
      {
        level: 'kolay',
        problem: "“Yönetim, halkın yaşam, özgürlük ve mülkiyet haklarını çiğnerse halk ona karşı direnme hakkına sahiptir.” Bu görüş kime aittir?",
        steps: [
          "Doğal haklar üçlüsü (yaşam, özgürlük, mülkiyet) veriliyor.",
          "Direnme hakkını savunan toplum sözleşmesi kuramcısı Locke’tur.",
        ],
        answer: "John Locke.",
      },
      {
        level: 'orta',
        problem: "Hobbes ve Locke’un doğa durumu anlayışları, önerdikleri devlet modelini nasıl etkiler?",
        steps: [
          "Hobbes: doğa durumu savaş hâlidir; düzen için mutlak güç gerekir.",
          "Locke: doğa durumunda da doğal haklar vardır; devlet bu hakları korumakla sınırlıdır.",
        ],
        answer: "Hobbes mutlak, Locke sınırlı (liberal) bir devlet önerir.",
      },
    ],
    osymThinking:
      "Sorular genellikle bir düşünürün görüşünü adını vermeden anlatır; anahtar ifadeleri yakalamak gerekir: “herkesin herkese savaşı, mutlak egemen” Hobbes; “doğal haklar, direnme hakkı” Locke; “genel irade” Rousseau; “filozof kral” Platon; “erdemli şehir” Farabi. Kavram sorularında iktidar ile meşruiyetin farkı sık sınanır.",
    commonMistakes: [
      "Leviathan’ı Locke’a ya da Bacon’a vermek; Leviathan Hobbes’un eseridir.",
      "Güce sahip olmayı meşruiyetle eş tutmak.",
      "Rousseau’nun genel iradesini çoğunluğun anlık isteğiyle karıştırmak.",
    ],
    tips: [
      "Ütopyaları eşleştir: Platon – Devlet, Farabi – Erdemli Şehir, More – Ütopya, Campanella – Güneş Ülkesi, Bacon – Yeni Atlantis.",
      "Hobbes mutlak, Locke sınırlı, Rousseau genel iradeye dayalı yönetim ister.",
    ],
    summary: [
      "Siyaset felsefesi devlet, iktidar, meşruiyet, hak ve adaleti sorgular.",
      "Toplum sözleşmesi: Hobbes (mutlak egemen), Locke (doğal haklar), Rousseau (genel irade).",
      "İdeal düzen arayışı ütopyalarla ifade edilmiştir.",
      "Meşruiyet, iktidarın yönetilenlerce haklı kabul edilmesidir.",
    ],
  },
  {
    topicId: 'tytfel-bilim-felsefesi',
    intro:
      "Bilim felsefesi bilimin ne olduğunu, bilimsel yöntemin geçerliliğini, bilimsel kuramların nasıl sınandığını ve bilimin nasıl ilerlediğini sorgular. Bilim insanı doğayı incelerken bilim felsefecisi bilimin kendisini inceler.\n\nTYT’de Popper’ın yanlışlanabilirlik ilkesi, Kuhn’un paradigma kavramı, Bacon’ın idolleri ve “ürün olarak bilim – etkinlik olarak bilim” ayrımı sık sorulur.",
    prerequisites: [
      "Tümevarım ve tümdengelim kavramlarını bilmek",
      "Hipotez, deney, kuram ve yasa kavramlarını tanımak",
    ],
    concepts: [
      { term: "Hipotez", definition: "Bir olayı açıklamak için ileri sürülen, sınanması gereken geçici açıklama." },
      { term: "Yanlışlanabilirlik", definition: "Popper’a göre bir kuramın bilimsel sayılması için onu yanlışlayabilecek bir gözlemin düşünülebilir olması." },
      { term: "Paradigma", definition: "Kuhn’a göre belli bir dönemde bilim topluluğunun paylaştığı kuram, yöntem, değer ve inançlar bütünü." },
      { term: "Doğrulanabilirlik", definition: "Viyana Çevresi’ne göre bir önermenin anlamlı ve bilimsel olması için deneyle doğrulanabilir olması." },
      { term: "Tümevarım sorunu", definition: "Sınırlı gözlemden genel bir yasaya geçişin mantıksal olarak kesinlik sağlamaması sorunu (Hume)." },
    ],
    formulas: [
      { expr: "Francis Bacon — Tümevarım ve idoller", meaning: "Bilgi gözlem ve deneyden tümevarımla elde edilir; zihni yanıltan kabile, mağara, çarşı ve tiyatro idollerinden arınılmalıdır." },
      { expr: "Descartes — Tümdengelim ve yöntemsel kuşku", meaning: "Kesin bilgiye apaçık ilkelerden tümdengelimle ulaşılır." },
      { expr: "Hume — Tümevarım sorunu", meaning: "Geçmişte hep böyle olmuş olması, gelecekte de böyle olacağını mantıksal olarak garanti etmez." },
      { expr: "Viyana Çevresi — Doğrulanabilirlik ilkesi", meaning: "Ürün olarak bilim: bilim, doğrulanabilir önermelerden oluşan mantıksal bir sistemdir." },
      { expr: "Karl Popper — Yanlışlanabilirlik", meaning: "Bilimsel kuramlar kesin olarak doğrulanamaz ama yanlışlanabilir olmalıdır." },
      { expr: "Thomas Kuhn — Paradigma ve bilimsel devrim", meaning: "Etkinlik olarak bilim: bilim normal bilim, bunalım ve devrimle paradigma değiştirerek ilerler." },
      { expr: "Feyerabend — “Her şey gider.”", meaning: "Bilimde tek ve evrensel bir yöntem yoktur (yöntem karşıtlığı)." },
    ],
    logic:
      "Bilim felsefesindeki temel ayrım bilimi nasıl gördüğümüzle ilgilidir. “Ürün olarak bilim” anlayışı (mantıkçı pozitivistler) bilimi, doğrulanmış önermelerden oluşan mantıksal bir sistem olarak görür; bilim insanının kim olduğu, hangi toplumda yaşadığı önemli değildir. “Etkinlik olarak bilim” anlayışı (Kuhn) ise bilimi, belli bir tarihsel ve toplumsal ortamda bilim topluluğunun yürüttüğü bir faaliyet olarak ele alır.\n\nPopper’ın itirazı tümevarım sorunundan doğar: Bin beyaz kuğu görmek “bütün kuğular beyazdır” önermesini kanıtlamaz, ama tek bir siyah kuğu onu yanlışlar. Bu yüzden bilimsel bir kuram, yanlışlanma riskini göze almalıdır.",
    examples: [
      {
        level: 'kolay',
        problem: "“Bir kuram, hangi gözlem gelirse gelsin kendini doğru sayıyorsa bilimsel değildir.” Bu görüş kime aittir?",
        steps: [
          "Yanlışlanamayan kuramın bilimsel olmadığı söyleniyor.",
          "Yanlışlanabilirlik ölçütü Popper’a aittir.",
        ],
        answer: "Karl Popper.",
      },
      {
        level: 'orta',
        problem: "Güneş merkezli sistemin, Dünya merkezli sistemin yerini alması Kuhn’un kavramlarıyla nasıl açıklanır?",
        steps: [
          "Dünya merkezli model uzun süre kabul gören paradigmaydı (normal bilim).",
          "Açıklanamayan gözlemler birikince bunalım doğdu.",
          "Yeni model kabul görünce paradigma değişti; bu bir bilimsel devrimdir.",
        ],
        answer: "Paradigma değişimi (bilimsel devrim).",
      },
    ],
    osymThinking:
      "Sorular genellikle bilim tarihinden ya da günlük hayattan bir örnek verip hangi bilim anlayışına uygun olduğunu sorar. “Yanlışlanabilir, çürütülebilir” Popper; “paradigma, devrim, bilim topluluğu” Kuhn; “doğrulanabilir, anlamlı önerme” Viyana Çevresi; “idoller, önyargılar” Bacon demektir. Ürün–etkinlik ayrımında toplumsal ve tarihsel bağlamın vurgulanıp vurgulanmadığına bak.",
    commonMistakes: [
      "Popper’ın doğrulanabilirliği savunduğunu sanmak; o yanlışlanabilirliği savunur.",
      "Kuhn’un bilimin birikimli ve düz bir çizgide ilerlediğini söylediğini düşünmek.",
      "Bacon’ın idollerini karıştırmak; dilden kaynaklanan yanılgılar çarşı (pazar yeri) idolleridir.",
    ],
    tips: [
      "Bacon’ın idolleri: kabile (insan doğası), mağara (kişisel), çarşı (dil), tiyatro (geleneksel öğretiler).",
      "Ürün olarak bilim = Viyana Çevresi; etkinlik olarak bilim = Kuhn.",
    ],
    summary: [
      "Bilim felsefesi bilimin yöntemini, değerini ve ilerleyişini sorgular.",
      "Hume tümevarımın kesinlik sağlamadığını gösterir.",
      "Popper yanlışlanabilirlik, Viyana Çevresi doğrulanabilirlik ölçütünü savunur.",
      "Kuhn bilimin paradigma değişimleriyle ilerlediğini söyler.",
    ],
  },
];
