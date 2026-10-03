import type { LessonSeed } from '../../domain/types';

export const lessons: LessonSeed[] = [
  // ---------------------------------------------------------------------------
  // SOLUNUM SİSTEMİ (öncelikli)
  // ---------------------------------------------------------------------------
  {
    topicId: "aytbio-solunum-sistemi",
    intro:
      "Hücrelerimiz ATP üretmek için sürekli oksijene ihtiyaç duyar ve oksijenli solunumun artığı olan karbondioksiti dışarı atmak zorundadır. Solunum sistemi, bu iki gazın dış ortam ile kan arasında değiştirilmesini sağlayan organ sistemidir. Yani hücresel solunum mitokondride gerçekleşir, solunum sistemi ise bu sürecin hammaddesini getirip artığını götüren bir lojistik ağ gibi çalışır.\n\nSistem iki bölümde düşünülür: havayı ileten kısım (burun, yutak, gırtlak, soluk borusu, bronşlar, bronşiyoller) ve gaz değişiminin yapıldığı kısım (alveoller). İletim yolu havayı ısıtır, nemlendirir ve temizler; alveollerde ise tek katlı yassı epitel ile kılcal damarlar arasında difüzyonla gaz alışverişi olur.\n\nYKS’de bu konu çoğunlukla soluk alıp verme mekanizması (diyafram ve kaburgalar arası kaslar, basınç–hacim ilişkisi), gazların kanda taşınması (hemoglobin, bikarbonat), kısmi basınç farklarına göre difüzyon yönü ve solunumun sinirsel düzenlenmesi üzerinden sorulur. Grafik ve tablo yorumlama sorularında oksihemoglobin eğrisi ve akciğer hacimleri sık karşına çıkar.",
    prerequisites: [
      "Difüzyonun yüksek derişimden (kısmi basınçtan) düşük derişime ATP harcanmadan gerçekleştiğini bilmek",
      "Oksijenli solunumda O₂ kullanılıp CO₂ ve su üretildiğini bilmek",
      "Epitel doku çeşitlerini (tek katlı yassı, silli epitel) tanımak",
      "Dolaşım sisteminde akciğer (küçük) ve vücut (büyük) dolaşımını ayırt etmek",
      "Enzimlerin (karbonik anhidraz gibi) tepkimeleri hızlandırdığını bilmek",
    ],
    concepts: [
      { term: "Alveol", definition: "Bronşiyollerin ucundaki, tek katlı yassı epitelden oluşan, etrafı kılcallarla sarılı hava kesecikleri. Gaz değişimi burada difüzyonla olur; toplam yüzey alanı çok geniştir." },
      { term: "Epiglot (gırtlak kapağı)", definition: "Yutkunma sırasında gırtlağın girişini kapatarak besinin soluk borusuna kaçmasını engelleyen kıkırdak kapak." },
      { term: "Soluk borusu (trake)", definition: "C şeklindeki kıkırdak halkalarla desteklenen, iç yüzeyi mukus salgılayan silli epitelle örtülü hava yolu. Halkalar borunun kapanmasını önler; siller mukusla tutulan tozu yutağa doğru taşır." },
      { term: "Diyafram", definition: "Göğüs boşluğunu karın boşluğundan ayıran kubbe şeklindeki çizgili kas. Kasıldığında düzleşip aşağı iner, göğüs hacmini artırır." },
      { term: "Hemoglobin", definition: "Alyuvarlarda bulunan, demir içeren taşıma proteini. Oksijenin büyük kısmını (yaklaşık %98) oksihemoglobin olarak taşır; CO₂’nin bir kısmını da karbaminohemoglobin olarak taşır." },
      { term: "Karbonik anhidraz", definition: "Alyuvarlarda CO₂ + H₂O ⇌ H₂CO₃ tepkimesini hızlandıran enzim. Bu sayede CO₂’nin çoğu bikarbonat iyonu olarak plazmada taşınır." },
      { term: "Bohr etkisi", definition: "Ortamda CO₂ ve H⁺ artıp pH düştüğünde hemoglobinin O₂’ye ilgisinin azalması; oksihemoglobin eğrisi sağa kayar ve dokulara daha fazla O₂ bırakılır." },
      { term: "Vital kapasite", definition: "Derin bir soluk alıştan sonra verilebilecek en fazla hava hacmi: soluk hacmi + soluk alma yedek hacmi + soluk verme yedek hacmi. Artık hava bu değere dâhil değildir." },
      { term: "Solunum merkezi", definition: "Soğanilik (omurilik soğanı) ve pons’ta bulunan, soluk alıp vermenin ritmini ve derinliğini ayarlayan merkezler. En güçlü uyaran kandaki CO₂ (dolayısıyla H⁺) artışıdır." },
    ],
    formulas: [
      { expr: "Soluk alma: diyafram + dış kaburgalar arası kaslar kasılır → göğüs hacmi ↑ → akciğer içi basınç < atmosfer basıncı → hava içeri", meaning: "İnspirasyon aktif bir olaydır; basınç farkı havanın yönünü belirler." },
      { expr: "Soluk verme (normal): kaslar gevşer → göğüs hacmi ↓ → akciğer içi basınç > atmosfer basıncı → hava dışarı", meaning: "Sakin soluk verme pasiftir; zorlu soluk vermede iç kaburgalar arası ve karın kasları kasılır." },
      { expr: "CO₂ + H₂O ⇌ H₂CO₃ ⇌ H⁺ + HCO₃⁻ (karbonik anhidraz)", meaning: "Dokuda tepkime sağa, akciğerde sola kayar. CO₂’nin yaklaşık %70’i HCO₃⁻, %20–23’ü karbaminohemoglobin, %7’si plazmada çözünmüş olarak taşınır." },
      { expr: "Hb + 4O₂ ⇌ Hb(O₂)₄", meaning: "Yüksek PO₂’de (akciğer) oksihemoglobin oluşur, düşük PO₂’de (doku) O₂ serbest kalır." },
      { expr: "Vital kapasite = SH + SAYH + SVYH ; Toplam akciğer kapasitesi = Vital kapasite + Artık hava", meaning: "SH: soluk hacmi, SAYH: soluk alma yedek hacmi, SVYH: soluk verme yedek hacmi. Artık hava spirometreyle ölçülemez." },
      { expr: "Difüzyon yönü: yüksek kısmi basınç → düşük kısmi basınç", meaning: "Akciğerde O₂ alveolden kana, CO₂ kandan alveole; dokuda O₂ kandan hücreye, CO₂ hücreden kana geçer." },
    ],
    logic:
      "Neden alveoller bu kadar çok ve küçük? Difüzyon hızı yüzey alanıyla doğru, mesafeyle ters orantılıdır. Milyonlarca alveol yüzeyi büyütür; tek katlı yassı epitel ve kılcal duvarı mesafeyi en aza indirir. Alveol yüzeyinin nemli olması da gazların önce suda çözünüp sonra zardan geçmesini sağlar.\n\nHava neden içeri girer? Akciğerlerde kas yoktur; akciğer göğüs kafesini pasif olarak takip eder. Diyafram ve dış kaburgalar arası kaslar kasılınca göğüs boşluğu genişler, basınç düşer ve hava basınç farkı nedeniyle içeri dolar. Yani ‘hava çekildiği için göğüs genişler’ değil, ‘göğüs genişlediği için hava girer’.\n\nNeden CO₂ solunumu en çok etkiler? Kandaki CO₂ arttığında karbonik asit oluşur ve pH düşer. Soğanilikteki kemoreseptörler bu değişime çok duyarlıdır; soluk alıp verme hızlanır ve derinleşir, fazla CO₂ atılır ve pH normale döner. Aynı asitlik hemoglobinin O₂ bırakmasını da kolaylaştırır (Bohr etkisi); böylece çok çalışan doku hem daha çok CO₂ üretir hem de daha çok O₂ alır. Sistem kendi kendini dengeleyen bir geri bildirim düzenidir.",
    examples: [
      {
        level: "kolay",
        problem: "Soluk alma sırasında diyafram, göğüs boşluğu hacmi ve akciğer içi basınç nasıl değişir?",
        steps: [
          "Soluk almada diyafram kasılır, kubbe şeklinden düzleşerek aşağı iner.",
          "Dış kaburgalar arası kaslar kasılır, kaburgalar yukarı ve dışa doğru hareket eder.",
          "Göğüs boşluğu hacmi artar; Boyle ilkesine göre akciğer içi basınç düşer.",
          "Basınç atmosfer basıncının altına indiği için hava akciğerlere dolar.",
        ],
        answer: "Diyafram kasılıp düzleşir, göğüs hacmi artar, akciğer içi basınç atmosfer basıncının altına düşer.",
      },
      {
        level: "orta",
        problem: "Bir bireyde soluk hacmi 500 mL, soluk alma yedek hacmi 3000 mL, soluk verme yedek hacmi 1100 mL ve artık hava 1200 mL’dir. Vital kapasite ve toplam akciğer kapasitesi kaç mL’dir?",
        steps: [
          "Vital kapasite = soluk hacmi + soluk alma yedek hacmi + soluk verme yedek hacmi.",
          "Vital kapasite = 500 + 3000 + 1100 = 4600 mL.",
          "Toplam akciğer kapasitesi = vital kapasite + artık hava = 4600 + 1200 = 5800 mL.",
        ],
        answer: "Vital kapasite 4600 mL, toplam akciğer kapasitesi 5800 mL.",
      },
      {
        level: "zor",
        problem: "Yoğun egzersiz yapan bir kas dokusunda CO₂ derişimi artar ve sıcaklık yükselir. Bu durum oksihemoglobinden O₂ ayrılmasını ve solunum hızını nasıl etkiler?",
        steps: [
          "Kas hücrelerinde oksijenli solunum hızlanır, CO₂ üretimi artar.",
          "CO₂ alyuvarlarda karbonik anhidraz etkisiyle karbonik aside dönüşür, H⁺ artar, pH düşer.",
          "pH düşüşü ve sıcaklık artışı hemoglobinin O₂’ye ilgisini azaltır; eğri sağa kayar (Bohr etkisi), dokuya daha fazla O₂ verilir.",
          "Kandaki CO₂/H⁺ artışını soğanilikteki kemoreseptörler algılar; solunum merkezi soluk alıp verme hızını ve derinliğini artırır.",
        ],
        answer: "Oksihemoglobinden O₂ ayrılması kolaylaşır (dokuya daha çok O₂ verilir) ve solunum hızı ile derinliği artar.",
      },
    ],
    osymThinking:
      "Sorular genellikle doğrudan ‘alveol nedir’ diye sormaz; bir dağcı, dalgıç, sigara içen birey ya da egzersiz yapan sporcu senaryosu verir ve değişen tek bir değişkenin (PO₂, pH, CO₂) zincirleme sonuçlarını ister. Öncüllü sorularda soluk alma ile soluk vermenin kas hareketleri karıştırılarak çeldirici üretilir. Grafik sorularında oksihemoglobin eğrisinin sağa/sola kayması ve spirometre hacimleri okunur; ölçülen beceri basınç farkı – difüzyon yönü – geri bildirim ilişkisini kurabilmektir.",
    commonMistakes: [
      "Soluk vermede diyaframın kasıldığını düşünmek; sakin soluk vermede diyafram gevşer ve kubbeleşir.",
      "Gaz değişiminin bronşiyollerde olduğunu sanmak; gaz değişimi yalnızca alveol ile kılcal arasında olur.",
      "CO₂’nin çoğunun hemoglobinle taşındığını söylemek; büyük kısmı plazmada bikarbonat iyonu olarak taşınır.",
      "Yüksek rakımda havadaki O₂ yüzdesinin azaldığını düşünmek; yüzde (%21) hemen hemen aynıdır, düşen atmosfer basıncı ve dolayısıyla O₂’nin kısmi basıncıdır.",
      "Artık havayı vital kapasiteye eklemek; vital kapasite artık havayı içermez.",
      "Gaz alışverişinin aktif taşımayla yapıldığını düşünmek; alveol ve dokudaki gaz değişimi pasif difüzyondur.",
    ],
    tips: [
      "‘Kasılma = hacim artışı = basınç düşüşü = hava girer’ zincirini tek cümle olarak ezberle.",
      "Bohr etkisi için ‘Asit, ısı, CO₂ artarsa hemoglobin O₂’yi bırakır’ kuralını kullan.",
      "Kısmi basınç tablosu verilen soruda her ortam çifti için yalnızca ‘hangisi daha yüksek?’ diye bak; ok o yönde çizilir.",
      "Solunumu düzenleyen en güçlü uyaranın O₂ azlığı değil CO₂ fazlalığı olduğunu unutma.",
    ],
    summary: [
      "İletim bölgesi havayı ısıtır, nemlendirir, temizler; gaz değişimi yalnız alveollerde olur.",
      "Soluk alma aktiftir (diyafram + dış kaburgalar arası kaslar kasılır); sakin soluk verme pasiftir.",
      "O₂ büyük oranda oksihemoglobin olarak, CO₂ büyük oranda HCO₃⁻ olarak taşınır.",
      "Gazlar kısmi basınç farkına göre pasif difüzyonla hareket eder.",
      "pH düşüşü, CO₂ ve sıcaklık artışı hemoglobinin O₂ bırakmasını kolaylaştırır (Bohr etkisi).",
      "Solunum merkezi soğanilik ve pons’tadır; en güçlü uyaran kandaki CO₂/H⁺ artışıdır.",
      "Vital kapasite = SH + SAYH + SVYH; artık hava buna dâhil değildir.",
    ],
  },

  // ---------------------------------------------------------------------------
  // ÜRİNER SİSTEM (öncelikli)
  // ---------------------------------------------------------------------------
  {
    topicId: "aytbio-uriner-sistem",
    intro:
      "Metabolizma sonucunda oluşan azotlu atıklar (özellikle üre), fazla su, tuzlar ve bazı ilaç kalıntıları kanda birikirse hücrelerin iç ortamı bozulur. Üriner sistem; böbrekler, üreterler, idrar kesesi ve üretradan oluşur ve bu atıkları idrar hâlinde uzaklaştırırken vücudun su, tuz ve asit–baz dengesini de ayarlar. Bu nedenle böbrekler yalnızca bir ‘süzgeç’ değil, iç ortamı sabit tutan (homeostazi) bir denetim organıdır.\n\nBöbreğin yapısal ve görevsel birimi nefrondur. Her böbrekte yaklaşık bir milyon nefron bulunur. Nefronda üç temel olay gerçekleşir: süzülme (glomerulustan Bowman kapsülüne), geri emilim (tüplerden kana) ve salgılama (kandan tüplere). İdrar, bu üç olayın ortak sonucudur.\n\nYKS’de sorular çoğunlukla kan plazması – süzüntü – idrar karşılaştırma tabloları, glikozun geri emilim sınırı grafikleri, ADH ve aldosteron hormonlarının etkisi ve diyaliz gibi günlük hayat senaryoları üzerinden gelir. Hangi olayın nefronun hangi kısmında gerçekleştiğini bilmek ve madde derişimlerindeki değişimi yorumlamak başarıyı belirler.",
    prerequisites: [
      "Difüzyon, osmoz ve aktif taşıma arasındaki farkları bilmek",
      "Protein ve amino asit yıkımında amonyak oluştuğunu ve karaciğerde üreye dönüştürüldüğünü bilmek",
      "Kan basıncı ve kılcal damar yapısını bilmek",
      "Hormonların hedef hücrelere kanla taşındığını ve geri bildirimle düzenlendiğini bilmek",
    ],
    concepts: [
      { term: "Nefron", definition: "Böbreğin süzme, geri emme ve salgılama yapan en küçük birimi: Bowman kapsülü, proksimal tüp, Henle kulpu, distal tüp; nefronlar toplama kanallarına açılır." },
      { term: "Glomerulus", definition: "Bowman kapsülü içinde yer alan kılcal damar yumağı. Kan basıncının etkisiyle plazmadaki küçük moleküller kapsüle süzülür; kan hücreleri ve büyük proteinler normalde süzülmez." },
      { term: "Süzüntü (filtrat)", definition: "Bowman kapsülüne geçen sıvı. Protein ve kan hücreleri dışında bileşimi kan plazmasına benzer: su, glikoz, amino asit, tuzlar, üre içerir." },
      { term: "Geri emilim", definition: "Süzüntüdeki yararlı maddelerin tüplerden kılcallara geri alınması. Glikoz ve amino asitlerin tamamına yakını proksimal tüpte aktif taşımayla geri emilir; su osmozla geri emilir." },
      { term: "Salgılama (tübüler sekresyon)", definition: "Kılcallardaki bazı maddelerin (H⁺, K⁺, NH₄⁺, bazı ilaçlar) tüp hücrelerince aktif olarak süzüntüye aktarılması. Kan pH’sının düzenlenmesinde önemlidir." },
      { term: "ADH (antidiüretik hormon)", definition: "Hipotalamusta üretilip hipofiz arka lobundan salınan hormon. Distal tüp ve toplama kanalının suya geçirgenliğini artırır; idrar az ve yoğun olur." },
      { term: "Aldosteron", definition: "Böbreküstü bezi kabuğundan salgılanır. Distal tüp ve toplama kanalında Na⁺ geri emilimini ve K⁺ atılımını artırır; Na⁺ ile birlikte su da geri emildiği için kan hacmi artar." },
      { term: "Böbrek eşik değeri", definition: "Geri emilim taşıyıcılarının doyduğu kan derişimi. Glikoz bu değeri aşarsa fazlası geri emilemez ve idrarda görülür." },
    ],
    formulas: [
      { expr: "Böbrek atardamarı → glomerulus → Bowman kapsülü → proksimal tüp → Henle kulpu → distal tüp → toplama kanalı → böbrek havuzcuğu → üreter → idrar kesesi → üretra", meaning: "Süzüntünün ve idrarın izlediği yol; sıralama soruları buradan çıkar." },
      { expr: "Atılan madde miktarı = süzülen + salgılanan − geri emilen", meaning: "Bir maddenin idrardaki miktarını belirleyen temel denge." },
      { expr: "Su kaybı / tuz fazlası → kan osmotik basıncı ↑ → ADH ↑ → su geri emilimi ↑ → az ve yoğun idrar", meaning: "Fazla su alındığında tersi olur: ADH ↓, bol ve seyreltik idrar." },
      { expr: "Kan hacmi/basıncı ↓ → renin ↑ → anjiyotensin → aldosteron ↑ → Na⁺ (ve su) geri emilimi ↑", meaning: "Renin–anjiyotensin–aldosteron sistemi kan basıncını yükseltir." },
      { expr: "Glomerulus: süzülme | Proksimal tüp: glikoz, amino asit, suyun çoğu geri emilir | Henle: medullada tuz derişimi oluşturur | Distal tüp & toplama kanalı: hormonla ince ayar", meaning: "Nefronun bölge–görev eşleştirmesi." },
      { expr: "NH₃ (karaciğer) + CO₂ → üre ; üre böbrekte süzülür, yalnızca kısmen geri emilir", meaning: "Üre böbrekte üretilmez, karaciğerde üretilir; böbrek onu atar." },
    ],
    logic:
      "Neden önce her şey süzülüp sonra yararlılar geri alınıyor? Böbrek, hangi maddenin gereksiz olduğunu tek tek tanımak yerine, küçük moleküllerin hepsini süzer ve vücudun ihtiyacı olanları seçerek geri alır. Bu sayede daha önce hiç karşılaşılmamış bir zararlı madde bile, taşıyıcısı olmadığı için idrarla atılır. Günde yaklaşık 180 L süzüntü oluşur ama bunun %99’u geri emilir; idrar yaklaşık 1,5 L’dir.\n\nNeden proksimal tüp hücreleri mikrovillus ve mitokondri bakımından zengindir? Glikoz, amino asit ve Na⁺’un geri emilimi enerji harcayan aktif taşımadır; mikrovilluslar yüzeyi, mitokondriler ATP üretimini artırır. Taşıyıcı proteinlerin sayısı sınırlı olduğu için, kan şekeri eşik değeri aştığında taşıyıcılar doyar ve glikoz idrara geçer; şeker hastalığında idrarda glikoz görülmesinin nedeni budur.\n\nNeden hormonla ayar son bölümlerde yapılıyor? Proksimal tüpteki geri emilim büyük ölçüde sabittir. Vücudun o anki su ve tuz ihtiyacına göre ince ayar distal tüp ve toplama kanalında ADH ve aldosteron ile yapılır. Böylece böbrek, susuz kalınca suyu saklar, fazla su içilince fazlasını atar; iç ortam sabit kalır.",
    examples: [
      {
        level: "kolay",
        problem: "Sağlıklı bir bireyin kan plazmasında ve süzüntüsünde bulunduğu hâlde idrarında bulunmayan madde aşağıdakilerden hangisi olabilir: üre, glikoz, protein, Na⁺?",
        steps: [
          "Protein plazmada bulunur ama glomerulustan süzülmez; süzüntüde yoktur.",
          "Üre ve Na⁺ hem süzüntüde hem idrarda bulunur.",
          "Glikoz süzülür ama sağlıklı bireyde tamamı proksimal tüpte geri emilir; idrarda bulunmaz.",
        ],
        answer: "Glikoz.",
      },
      {
        level: "orta",
        problem: "Sıcak bir günde çok terleyen ve su içmeyen bir bireyde idrar miktarı ve yoğunluğu nasıl değişir? Hormonal mekanizmayla açıklayınız.",
        steps: [
          "Terleme ile su kaybedilir; kan plazmasının osmotik basıncı yükselir.",
          "Hipotalamustaki osmoreseptörler bunu algılar; hipofiz arka lobundan ADH salgısı artar.",
          "ADH, distal tüp ve toplama kanalının suya geçirgenliğini artırır; daha fazla su geri emilir.",
          "Sonuçta idrar miktarı azalır, yoğunluğu artar.",
        ],
        answer: "İdrar miktarı azalır ve yoğunluğu artar; nedeni ADH salgısının artmasıdır.",
      },
      {
        level: "zor",
        problem: "Bir maddenin süzülme hızı 100 mg/dk, idrarla atılma hızı 150 mg/dk bulunmuştur. Bu madde için geri emilim ve salgılama hakkında ne söylenebilir?",
        steps: [
          "Atılan = süzülen + salgılanan − geri emilen bağıntısını yaz.",
          "150 = 100 + salgılanan − geri emilen ⇒ salgılanan − geri emilen = 50 mg/dk.",
          "Atılan miktar süzülenden fazla olduğuna göre, madde tüplere salgılanmaktadır ve salgılanan miktar geri emilenden en az 50 mg/dk fazladır.",
          "Hiç geri emilim yoksa salgılama 50 mg/dk’dir; geri emilim varsa salgılama daha da fazladır.",
        ],
        answer: "Madde kandan tüplere salgılanmaktadır; net salgılama 50 mg/dk’dir.",
      },
    ],
    osymThinking:
      "ÖSYM tarzı sorularda nefron genellikle doğrudan sorulmaz; plazma–süzüntü–idrar derişim tablosu verilir ve maddenin kimliği ya da nefronda başına geleni bulunur. Glikoz yükleme grafiğinde ‘eşik’ ve ‘taşıyıcı doygunluğu’ yorumlanır. Diyaliz, şeker hastalığı, aşırı terleme gibi senaryolarda ADH/aldosteron etkisi ve difüzyon yönü muhakemesi ölçülür. Çeldiriciler çoğunlukla ‘üre böbrekte üretilir’, ‘protein süzülür’ gibi kavram yanılgılarından kurulur.",
    commonMistakes: [
      "Ürenin böbrekte üretildiğini düşünmek; üre karaciğerde üretilir, böbrek yalnızca atar.",
      "Proteinlerin ve kan hücrelerinin normalde süzüldüğünü sanmak; idrarda protein görülmesi glomerulus hasarına işaret eder.",
      "ADH’nin böbreküstü bezinden salgılandığını söylemek; ADH hipotalamusta üretilip hipofiz arka lobundan salınır, aldosteron böbreküstü kabuğundan salgılanır.",
      "Geri emilimin yalnızca osmozla olduğunu düşünmek; glikoz, amino asit ve Na⁺ aktif taşımayla geri emilir, su bunları osmozla izler.",
      "Salgılama (sekresyon) ile süzülmeyi karıştırmak; salgılama tüp hücrelerinin enerji harcayarak kandan tüpe madde aktarmasıdır.",
    ],
    tips: [
      "Tablo sorusunda: ‘plazmada var, süzüntüde yok’ = protein; ‘süzüntüde var, idrarda yok’ = glikoz/amino asit; ‘idrarda çok yoğun’ = üre.",
      "ADH ‘su’, aldosteron ‘tuz (Na⁺)’ hormonudur; ikisi de sonuçta su geri emilimini artırır.",
      "Mitokondri/mikrovillus bolluğu gördüğün her yerde aktif taşıma ve yüzey artışı düşün.",
      "‘Atılan = süzülen + salgılanan − geri emilen’ bağıntısı sayısal soruların anahtarıdır.",
    ],
    summary: [
      "Üriner sistem: böbrek → üreter → idrar kesesi → üretra.",
      "Nefronda süzülme, geri emilim ve salgılama olur; idrar üçünün sonucudur.",
      "Protein ve kan hücreleri süzülmez; glikoz ve amino asitler süzülür ama tamamı geri emilir.",
      "Glikoz geri emilimi taşıyıcı sayısıyla sınırlıdır; eşik aşılırsa idrarda glikoz görülür.",
      "ADH su geri emilimini, aldosteron Na⁺ geri emilimini artırır.",
      "Üre karaciğerde üretilir, böbrekte atılır; böbrek pH ve kan basıncını da düzenler.",
    ],
  },

  // ---------------------------------------------------------------------------
  // ÜREME SİSTEMİ VE EMBRİYONİK GELİŞİM
  // ---------------------------------------------------------------------------
  {
    topicId: "aytbio-ureme-embriyonik",
    intro:
      "İnsanda üreme eşeyli olur: erkekte testislerde sperm, dişide ovaryumlarda yumurta mayoz bölünmeyle oluşur. Üreme sistemleri hem bu gametleri üretir hem de testosteron, östrojen ve progesteron gibi eşey hormonlarını salgılar. Bu hormonlar hipotalamus ve hipofizden gelen FSH ile LH tarafından denetlenir.\n\nDöllenme genellikle yumurta kanalının (fallop tüpü) üst kısmında olur. Oluşan zigot mitozla bölünerek morula ve blastosist evrelerinden geçer, rahim duvarına tutunur (implantasyon) ve gastrula evresinde ektoderm, mezoderm, endoderm tabakaları oluşur. Bu tabakalardan doku ve organlar gelişir; embriyo plasenta aracılığıyla anneden beslenir.",
    prerequisites: [
      "Mayoz bölünme ve kromozom sayısının yarıya inmesini bilmek",
      "Mitoz bölünme ile hücre sayısının arttığını bilmek",
      "Hormonların geri bildirimle düzenlendiğini bilmek",
    ],
    concepts: [
      { term: "Seminifer tüpçük", definition: "Testislerde spermlerin mayozla üretildiği kıvrımlı tüpler. İçlerindeki Sertoli hücreleri gelişen spermleri besler; tüpçükler arasındaki Leydig (ara) hücreleri testosteron salgılar." },
      { term: "Epididimis", definition: "Testisin üzerindeki kanal; spermler burada olgunlaşır, hareket yeteneği kazanır ve depolanır." },
      { term: "Folikül ve korpus luteum", definition: "Folikül, ovaryumda oositi çevreleyen ve östrojen salgılayan yapıdır. Ovulasyondan sonra geride kalan folikül korpus luteuma (sarı cisim) dönüşür ve progesteron ile östrojen salgılar." },
      { term: "Ovulasyon", definition: "LH’deki ani yükselişin etkisiyle olgun folikülün yırtılıp sekonder oositi yumurta kanalına bırakması; 28 günlük döngüde yaklaşık 14. gün." },
      { term: "İmplantasyon", definition: "Blastosistin döllenmeden yaklaşık bir hafta sonra rahim iç duvarına (endometriyum) tutunması." },
      { term: "Germ tabakaları", definition: "Gastrulada oluşan ektoderm, mezoderm ve endoderm. Ektoderm: epidermis, sinir sistemi; mezoderm: kas, kemik, dolaşım, boşaltım, üreme organları; endoderm: sindirim ve solunum kanalı epiteli, karaciğer, pankreas." },
      { term: "Plasenta", definition: "Koryon ve rahim dokusundan oluşan yapı. Anne ve embriyo kanı karışmadan madde alışverişi sağlar; hCG, progesteron ve östrojen salgılar." },
    ],
    formulas: [
      { expr: "Hipotalamus (GnRH) → hipofiz ön lob (FSH, LH) → gonadlar", meaning: "Eşey hormonlarının üst düzey denetimi." },
      { expr: "Erkek: FSH → sperm üretimi (Sertoli) ; LH → testosteron (Leydig)", meaning: "Erkekte hipofiz hormonlarının hedefleri." },
      { expr: "Dişi döngü: FSH → folikül gelişimi + östrojen ↑ → LH piki → ovulasyon → korpus luteum → progesteron ↑", meaning: "Döllenme olmazsa korpus luteum geriler, progesteron düşer, menstruasyon başlar." },
      { expr: "Zigot → segmentasyon → morula → blastula (blastosist) → implantasyon → gastrula → nörula → organogenez", meaning: "Erken embriyonik gelişim sırası." },
      { expr: "Döllenme varsa: embriyo (koryon) hCG salgılar → korpus luteum korunur → progesteron yüksek kalır", meaning: "Gebelik testleri idrarda hCG arar." },
    ],
    logic:
      "Progesteron neden bu kadar önemlidir? Progesteron rahim iç duvarını kalın ve damarlı tutar; embriyonun tutunabileceği ortamı hazırlar. Döllenme olmazsa korpus luteum yaklaşık iki hafta sonra geriler, progesteron düşer ve kalınlaşmış duvar yıkılarak menstruasyon kanaması olur. Döllenme olursa embriyonun salgıladığı hCG korpus luteumu yaşatır; plasenta gelişince hormon üretimini plasenta üstlenir.\n\nSegmentasyon evresinde neden embriyo büyümez? Bu evrede hücreler bölünmeler arasında büyümeye fırsat bulamaz; hücre sayısı artar ama hücreler küçülür ve toplam hacim yaklaşık aynı kalır. Gerçek büyüme beslenmenin başladığı implantasyon ve sonrasında olur.",
    examples: [
      {
        level: "kolay",
        problem: "Bir erkekte Leydig hücreleri tahrip olursa doğrudan hangi hormonun salgısı azalır?",
        steps: [
          "Leydig (ara) hücreleri seminifer tüpçükler arasındadır.",
          "Bu hücreler LH’nin etkisiyle testosteron salgılar.",
        ],
        answer: "Testosteron.",
      },
      {
        level: "orta",
        problem: "Bir kadında döngünün 20. gününde kan progesteron düzeyi yüksek ve 26. günde hâlâ yükselmeye devam ediyor. Bu durum en iyi nasıl açıklanır?",
        steps: [
          "Ovulasyondan sonra korpus luteum progesteron salgılar.",
          "Döllenme yoksa korpus luteum geriler ve 24–28. günlerde progesteron düşer.",
          "Progesteronun yüksek kalması korpus luteumun korunduğunu, bunun da embriyodan gelen hCG ile olduğunu gösterir.",
        ],
        answer: "Döllenme ve implantasyon gerçekleşmiş olabilir; hCG korpus luteumu korumaktadır.",
      },
    ],
    osymThinking:
      "Sorular hormon–gün tablosu ya da grafik üzerinden döngünün hangi evresinde olunduğunu buldurur; tek bir hormonun bloke edilmesiyle hangi olayın gerçekleşmeyeceği sorulur. Germ tabakası–organ eşleştirmesinde sinir sistemi (ektoderm) ve boşaltım/dolaşım (mezoderm) gibi karışan eşleşmeler çeldirici olarak kullanılır.",
    commonMistakes: [
      "Döllenmenin rahimde gerçekleştiğini düşünmek; döllenme genellikle yumurta kanalında olur.",
      "Sinir sisteminin mezodermden geliştiğini sanmak; sinir sistemi ektodermden gelişir.",
      "Plasentada anne ve embriyo kanının karıştığını düşünmek; madde alışverişi kan karışmadan olur.",
      "Testosteronun Sertoli hücrelerinden salgılandığını sanmak; testosteron Leydig hücrelerinden salgılanır.",
    ],
    tips: [
      "‘LH piki → ovulasyon → korpus luteum → progesteron’ dörtlüsünü sırasıyla hatırla.",
      "Ektoderm = ‘dış’: deri ve sinir; endoderm = ‘iç’: sindirim ve solunum kanalı iç yüzeyi; gerisi mezoderm.",
      "Gebelik testi sorusunda anahtar kelime hCG’dir.",
    ],
    summary: [
      "Sperm seminifer tüpçüklerde, yumurta ovaryumda mayozla oluşur.",
      "FSH gamet gelişimini, LH ovulasyonu ve testosteron salgısını uyarır.",
      "Korpus luteum progesteron salgılar; döllenme olmazsa geriler ve menstruasyon başlar.",
      "Zigot → morula → blastosist → implantasyon → gastrula (üç germ tabakası).",
      "Plasenta madde alışverişini kan karışmadan sağlar ve hormon salgılar.",
    ],
  },

  // ---------------------------------------------------------------------------
  // KOMÜNİTE VE POPÜLASYON EKOLOJİSİ
  // ---------------------------------------------------------------------------
  {
    topicId: "aytbio-komunite-populasyon",
    intro:
      "Aynı türden, aynı zamanda ve aynı bölgede yaşayan bireylerin oluşturduğu topluluğa popülasyon, belirli bir alanda yaşayan farklı tür popülasyonlarının tamamına komünite denir. Popülasyon ekolojisi bir türün birey sayısının nasıl değiştiğini (büyüme, yoğunluk, dağılım, yaş yapısı), komünite ekolojisi ise türler arasındaki ilişkileri (rekabet, av–avcı, simbiyoz) ve komünitenin zaman içindeki değişimini (süksesyon) inceler.\n\nBu konu YKS’de genellikle grafik ve deney yorumlama ile gelir: S ve J büyüme eğrileri, iki türün aynı ve ayrı ortamlardaki büyümesi, yakala–işaretle–bırak yöntemiyle birey sayısı tahmini ve yaş piramitleri sık kullanılan araçlardır.",
    prerequisites: [
      "Ekosistem, habitat, niş kavramlarını bilmek",
      "Besin zinciri ve üretici–tüketici ilişkisini bilmek",
      "Grafik okumada artış hızı ile miktar farkını ayırt edebilmek",
    ],
    concepts: [
      { term: "Popülasyon yoğunluğu", definition: "Birim alan ya da hacimdeki birey sayısı. Doğum ve göç (içeri) ile artar, ölüm ve göç (dışarı) ile azalır." },
      { term: "Taşıma kapasitesi", definition: "Bir ortamın kaynaklarının uzun süre destekleyebileceği en fazla birey sayısı. Lojistik (S) büyümede popülasyon bu değer çevresinde dengelenir." },
      { term: "Çevre direnci", definition: "Besin, alan, su gibi kaynakların sınırlılığı, hastalık ve avcılar gibi popülasyon büyümesini sınırlayan etkenlerin tümü." },
      { term: "Mutualizm", definition: "İki türün de yarar sağladığı (+,+) simbiyotik ilişki. Örnek: liken (alg + mantar), baklagil kökü ile Rhizobium bakterisi." },
      { term: "Kommensalizm", definition: "Bir türün yarar sağlayıp diğerinin etkilenmediği (+,0) ilişki." },
      { term: "Parazitlik", definition: "Bir türün diğerinden yarar sağlarken ona zarar verdiği (+,−) ilişki; parazit genellikle konağını hemen öldürmez." },
      { term: "Süksesyon", definition: "Bir alandaki komünitenin zaman içinde düzenli olarak değişmesi. Birincil süksesyon toprak bulunmayan alanda (öncü tür liken), ikincil süksesyon toprağın korunduğu bozulmuş alanda başlar." },
    ],
    formulas: [
      { expr: "Popülasyon değişimi = (doğum + göçle gelen) − (ölüm + göçle giden)", meaning: "Popülasyon büyüklüğünü belirleyen dört etken." },
      { expr: "N ≈ (M · C) / R", meaning: "Yakala–işaretle–bırak: M ilk yakalanıp işaretlenen, C ikinci yakalanan toplam, R ikinci yakalamadaki işaretli birey sayısı." },
      { expr: "J eğrisi: sınırsız kaynak → üstel büyüme ; S eğrisi: çevre direnci → taşıma kapasitesinde denge", meaning: "Büyüme eğrilerinin karşılaştırması." },
      { expr: "Rekabetçi dışlama: aynı nişi paylaşan iki tür aynı ortamda uzun süre birlikte yaşayamaz", meaning: "Rekabette güçlü olan tür diğerini yok eder ya da diğeri nişini değiştirir." },
    ],
    logic:
      "Neden popülasyonlar sonsuza kadar üstel büyümez? Başlangıçta kaynak bol olduğu için her birey üremeye katkı verir ve sayı katlanarak artar. Birey sayısı arttıkça besin, alan ve su azalır, atıklar ve hastalıklar artar; bu çevre direnci doğum oranını düşürüp ölüm oranını yükseltir. Doğum ve ölüm oranı eşitlendiğinde popülasyon taşıma kapasitesi çevresinde dalgalanır. Av–avcı ilişkisinde de benzer bir geri bildirim vardır: av artınca avcı artar, avcı artınca av azalır, sonra avcı da azalır.",
    examples: [
      {
        level: "kolay",
        problem: "Bir göldeki balık popülasyonundan 80 balık yakalanıp işaretlenerek bırakılıyor. Bir hafta sonra yakalanan 60 balıktan 12’si işaretli. Göldeki balık sayısı yaklaşık kaçtır?",
        steps: [
          "N ≈ (M · C) / R bağıntısını kullan: M = 80, C = 60, R = 12.",
          "N ≈ (80 · 60) / 12 = 4800 / 12 = 400.",
        ],
        answer: "Yaklaşık 400 balık.",
      },
      {
        level: "orta",
        problem: "Aynı besinle beslenen iki Paramecium türü ayrı kaplarda ayrı ayrı büyütüldüğünde ikisi de S eğrisi gösteriyor; aynı kapta birlikte büyütüldüğünde bir tür birkaç gün sonra yok oluyor. Bu sonuç nasıl açıklanır?",
        steps: [
          "Ayrı kaplarda iki tür de kendi taşıma kapasitesine ulaşabiliyor; yani ortam her birini tek başına destekliyor.",
          "Birlikte yetiştirildiklerinde aynı kaynağı kullandıkları için türler arası rekabet oluşuyor.",
          "Kaynağı daha etkin kullanan tür diğerini ortamdan uzaklaştırıyor; bu rekabetçi dışlamadır.",
        ],
        answer: "Aynı nişi paylaşan iki tür arasında rekabetçi dışlama gerçekleşmiştir.",
      },
    ],
    osymThinking:
      "Sorularda genellikle bir büyüme grafiği ya da tablo verilir ve ‘büyüme hızının en yüksek olduğu dönem’, ‘çevre direncinin arttığı dönem’ ya da ‘taşıma kapasitesi’ sorulur. Birlikte ve ayrı yetiştirme deneylerinde ilişki türünü (rekabet, mutualizm, parazitlik) sonuçtan çıkarman istenir. Yaş piramidi ile popülasyonun geleceği yorumlanır.",
    commonMistakes: [
      "Birey sayısının en çok olduğu dönemi büyüme hızının en yüksek olduğu dönem sanmak; S eğrisinde hız eğrinin orta kısmında en yüksektir.",
      "Kommensalizm ile mutualizmi karıştırmak; kommensalizmde bir taraf etkilenmez.",
      "Birincil süksesyonun yangın sonrası başladığını düşünmek; yangın sonrası toprak kaldığı için ikincil süksesyon olur.",
      "Yakala–işaretle–bırak formülünde işaretli sayıyı paya yazmak.",
    ],
    tips: [
      "İlişkiyi bulmak için ‘birlikteyken her tür için ne değişti?’ sorusunu sor: artış (+), azalma (−), değişmez (0).",
      "S eğrisinde düzleşme başladıysa çevre direnci baskın hâle gelmiştir.",
      "Geniş tabanlı yaş piramidi büyüyen, dar tabanlı piramit küçülen popülasyonu gösterir.",
    ],
    summary: [
      "Popülasyon = aynı tür; komünite = farklı türlerin tümü.",
      "Popülasyon doğum ve göçle artar, ölüm ve göçle azalır.",
      "Sınırsız kaynakta J, çevre direncinde S eğrisi görülür; S taşıma kapasitesinde dengelenir.",
      "Mutualizm (+,+), kommensalizm (+,0), parazitlik (+,−), rekabet (−,−).",
      "Birincil süksesyon kayada liken ile, ikincil süksesyon toprağı olan bozulmuş alanda başlar.",
    ],
  },

  // ---------------------------------------------------------------------------
  // CANLILAR VE ÇEVRE
  // ---------------------------------------------------------------------------
  {
    topicId: "aytbio-canlilar-ve-cevre",
    intro:
      "Her canlı, çevresindeki cansız (ışık, sıcaklık, su, mineraller) ve canlı (diğer organizmalar) etmenlerle sürekli etkileşim içindedir. Ekosistemde enerji güneşten üreticilere, oradan tüketicilere tek yönlü akarken; karbon, azot ve su gibi maddeler döngüler hâlinde tekrar tekrar kullanılır.\n\nCanlılar yaşadıkları ortama yapısal, fizyolojik ve davranışsal adaptasyonlarla uyum sağlar. İnsan etkinlikleri ise sera gazı artışı, ötrofikasyon ve biyolojik birikim gibi sorunlarla bu dengeyi bozabilir. Bu konu, canlıların çevreyle ilişkisini bir bütün olarak yorumlamayı amaçlar.",
    prerequisites: [
      "Fotosentez ve hücresel solunum denklemlerini bilmek",
      "Üretici, tüketici ve ayrıştırıcı kavramlarını bilmek",
      "Besin zinciri ve besin ağı kavramlarını bilmek",
    ],
    concepts: [
      { term: "Enerji akışı", definition: "Enerjinin güneşten üreticilere ve basamak basamak tüketicilere tek yönlü aktarımı. Her basamakta enerjinin büyük kısmı ısı olarak kaybolur; bir üst basamağa ortalama %10 aktarılır." },
      { term: "Biyolojik birikim", definition: "DDT, cıva gibi vücuttan atılamayan maddelerin besin zinciri boyunca her basamakta derişiminin artması; en yüksek derişim son tüketicilerde görülür." },
      { term: "Azot döngüsü", definition: "Atmosfer azotunun azot bağlayan bakterilerce amonyağa, nitrifikasyon bakterilerince nitrite ve nitrata dönüştürülmesi, bitkilerce kullanılması ve denitrifikasyon bakterileriyle tekrar N₂ olarak atmosfere dönmesi." },
      { term: "Ötrofikasyon", definition: "Göllere gübre, deterjan gibi kaynaklarla aşırı azot ve fosfat girmesiyle alg ve su bitkilerinin aşırı çoğalması; ölen organizmaların ayrışması sırasında çözünmüş O₂’nin azalması." },
      { term: "Adaptasyon", definition: "Canlının yaşadığı ortamda hayatta kalma ve üreme şansını artıran kalıtsal özellik. Örnek: çöl bitkilerinde yaprağın dikene dönüşmesi, kalın kütikula." },
    ],
    formulas: [
      { expr: "Üst basamağa aktarılan enerji ≈ alt basamak enerjisi × 1/10", meaning: "Enerji piramidi hesabı (%10 kuralı)." },
      { expr: "Enerji: tek yönlü akar ; Madde: döngüsel dolaşır", meaning: "Ekosistemin iki temel ilkesi." },
      { expr: "N₂ → (azot bağlama) NH₃/NH₄⁺ → (nitrifikasyon) NO₂⁻ → NO₃⁻ → bitki ; NO₃⁻ → (denitrifikasyon) N₂", meaning: "Azot döngüsünün temel adımları." },
      { expr: "Fosil yakıt yakma + ormansızlaşma → atmosfer CO₂ ↑ → sera etkisi ↑ → küresel ısınma", meaning: "Karbon döngüsündeki insan kaynaklı bozulma." },
    ],
    logic:
      "Enerji neden döngü yapamaz? Her canlı aldığı enerjinin çoğunu yaşamsal faaliyetlerde kullanır ve ısı olarak çevreye verir; ısı enerjisi üreticiler tarafından tekrar besine dönüştürülemez. Bu yüzden ekosistem sürekli güneş enerjisine muhtaçtır. Maddeler ise ayrıştırıcılar sayesinde inorganik hâle geçip üreticilerce yeniden kullanılabildiği için döngü yapar. Biyolojik birikimde tersi olur: enerji basamaklar boyunca azalırken, vücuttan atılamayan kirletici her basamakta daha fazla besinle alındığı için derişimi artar.",
    examples: [
      {
        level: "kolay",
        problem: "Üreticilerin bağladığı enerji 50 000 kJ ise ikincil tüketicilere ulaşan enerji yaklaşık kaç kJ’dir?",
        steps: [
          "Birincil tüketiciler: 50 000 × 1/10 = 5000 kJ.",
          "İkincil tüketiciler: 5000 × 1/10 = 500 kJ.",
        ],
        answer: "Yaklaşık 500 kJ.",
      },
      {
        level: "orta",
        problem: "Tarım arazilerinden gelen gübreli suların karıştığı bir gölde neden balık ölümleri görülür?",
        steps: [
          "Gübredeki nitrat ve fosfat alglerin aşırı çoğalmasına yol açar.",
          "Su yüzeyini kaplayan algler ışığın derine ulaşmasını engeller; derindeki bitkiler ölür.",
          "Ölen organizmaları ayrıştıran bakteriler oksijenli solunumla çok fazla O₂ tüketir.",
          "Sudaki çözünmüş O₂ azalır, balıklar ölür.",
        ],
        answer: "Ötrofikasyon sonucu çözünmüş oksijen azaldığı için.",
      },
    ],
    osymThinking:
      "Bu konudaki sorular çoğunlukla bir besin zinciri, derişim tablosu ya da çevre sorunu haberi üzerinden kurulur. Enerji piramidi ile biyolojik birikim piramidinin ters yönde değiştiğini fark etmen, döngülerde hangi canlı grubunun hangi adımı yaptığını ayırt etmen ve sebep–sonuç zinciri kurman beklenir.",
    commonMistakes: [
      "Enerjinin de madde gibi döngü yaptığını düşünmek.",
      "Nitrifikasyon ile denitrifikasyon bakterilerinin görevlerini karıştırmak.",
      "Biyolojik birikimde en yüksek derişimin üreticilerde olduğunu sanmak.",
      "Ötrofikasyonda oksijeni algin kendisinin tükettiğini sanıp ayrıştırıcıların rolünü atlamak.",
    ],
    tips: [
      "Piramitte yukarı çıktıkça enerji ve biyokütle azalır, kalıcı kirletici derişimi artar.",
      "Azot döngüsünde ‘bağlama → nitrifikasyon → özümleme → amonifikasyon → denitrifikasyon’ sırasını çiz.",
      "Adaptasyon sorularında özelliğin hangi çevresel soruna (su kaybı, soğuk, avcı) çözüm olduğunu bul.",
    ],
    summary: [
      "Enerji tek yönlü akar, her basamakta yaklaşık %90’ı kaybolur.",
      "Maddeler (C, N, su) ayrıştırıcılar sayesinde döngü yapar.",
      "Kalıcı kirleticiler besin zincirinde birikir; en yüksek derişim son tüketicidedir.",
      "Ötrofikasyon çözünmüş oksijeni azaltarak su canlılarını öldürür.",
      "Adaptasyonlar canlının çevresinde hayatta kalma ve üreme şansını artırır.",
    ],
  },
];
