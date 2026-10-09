import type { LessonSeed } from '../../domain/types';

export const lessons: LessonSeed[] = [
  // ---------------------------------------------------------------- Sözcükte Anlam
  {
    topicId: 'tyttr-sozcukte-anlam',
    intro:
      "Bir sözcüğün sözlükteki anlamı ile cümledeki anlamı her zaman aynı değildir. \"Ağır\" sözcüğü \"ağır bir çanta\"da tartıyla ölçülen bir özelliği anlatırken \"ağır bir söz\"de kırıcılığı anlatır. TYT’de sözcükte anlam soruları, sözcüğü bağlamından koparmadan okumayı ölçer.\n\nBu konuda gerçek, yan, mecaz ve terim anlamı; eş, zıt ve eş sesli sözcükleri; deyim, atasözü ve temel söz sanatlarını öğreneceksin. Amaç ezber değil, cümlenin içinde sözcüğün hangi görevle kullanıldığını fark edebilmektir.",
    prerequisites: [
      "Cümle kavramı ve cümlede sözcüklerin bir araya gelişi",
      "Somut (duyularla algılanan) ve soyut (zihinde tasarlanan) kavramları ayırabilme",
      "Temel sözcük türleri (isim, sıfat, fiil) hakkında genel fikir",
    ],
    concepts: [
      { term: "Gerçek (temel) anlam", definition: "Sözcüğün akla gelen ilk ve en yaygın anlamı. Örnek: \"Kapının kolu kırıldı.\" cümlesinde \"kol\" değil, \"kırılmak\" gerçek anlamdadır; \"Kolunu masaya dayadı.\" cümlesinde \"kol\" gerçek anlamdadır." },
      { term: "Yan anlam", definition: "Gerçek anlamla ilgisi koparılmadan, benzerlik yoluyla kazanılan yeni anlam. Örnek: \"kapının kolu\", \"masanın ayağı\"." },
      { term: "Mecaz anlam", definition: "Sözcüğün gerçek anlamından tamamen uzaklaşarak kazandığı anlam. Örnek: \"Bu adam çok soğuk.\" (samimiyetsiz)." },
      { term: "Terim anlam", definition: "Bir bilim, sanat ya da meslek dalına özgü anlam. Örnek: matematikte \"kök\", müzikte \"perde\"." },
      { term: "Eş sesli (sesteş) sözcük", definition: "Yazılışı ve okunuşu aynı, anlamları arasında ilgi bulunmayan sözcükler. Örnek: \"yüz\" (sayı) – \"yüz\" (surat) – \"yüz-\" (yüzmek)." },
      { term: "Deyim", definition: "Genellikle gerçek anlamından farklı bir anlam taşıyan, kalıplaşmış söz grubu; hüküm bildirmez. Örnek: \"etekleri zil çalmak\"." },
      { term: "Ad aktarması (mecaz-ı mürsel)", definition: "Benzetme amacı gütmeden bir sözü, ilgili olduğu başka bir söz yerine kullanma. Örnek: \"Bütün salon ayağa kalktı.\" (salondakiler)." },
    ],
    formulas: [
      { expr: "Yan anlam = gerçek anlamla bağ + benzetme", meaning: "Sözcük hâlâ somut bir nesneyi karşılıyor ve gerçek anlamdaki görev ya da biçim benzerliği sürüyorsa yan anlamdır (dağın eteği, çaydanlığın ağzı)." },
      { expr: "Mecaz anlam = gerçek anlamdan kopuş", meaning: "Sözcük somuttan soyuta geçmişse ya da ilgisiz bir kavrama aktarılmışsa mecazdır (tatlı dil, kırık gönül)." },
      { expr: "Deyim ≠ hüküm; atasözü = hüküm", meaning: "Atasözü genel geçer bir öğüt ya da yargı bildirir; deyim yalnızca bir durumu kalıplaşmış biçimde karşılar." },
      { expr: "Dolaylama = tek sözcük yerine açıklayıcı söz", meaning: "\"Türkiye\" yerine \"Ay yıldızlı bayrağın ülkesi\" demek gibi." },
    ],
    logic:
      "Dil sınırlı sayıda sözcükle sınırsız sayıda kavramı anlatmak zorundadır. Bu yüzden sözcükler zamanla yeni anlamlar yüklenir: önce benzerlik yoluyla yan anlam doğar (insanın ağzı → şişenin ağzı), sonra soyut kavramlara taşınır (tatlı elma → tatlı söz). Bu yüzden sözcüğün anlamını belirleyen şey sözlük değil, cümledir.\n\nSınavda bir sözcüğün hangi anlamda kullanıldığını sorarken, aslında \"bağlamı okuyabiliyor musun?\" sorusu sorulur. Sözcüğü cümleden çıkarıp yerine eş anlamlısını koymak en güvenli testtir.",
    examples: [
      {
        level: 'kolay',
        problem: "\"Dağın eteğinde küçük bir köy vardı.\" cümlesinde \"etek\" sözcüğü hangi anlamda kullanılmıştır?",
        steps: [
          "\"Etek\"in gerçek anlamı giysinin belden aşağısını örten parçasıdır.",
          "Dağın alt kısmı, bir eteğin bedenin alt kısmını örtmesine benzetilmiştir; sözcük yine somut bir yeri karşılar.",
          "Gerçek anlamla benzerlik bağı sürdüğü için bu yan anlamdır.",
        ],
        answer: "Yan anlam",
      },
      {
        level: 'orta',
        problem: "\"Yıllardır aynı masada çalışan iki meslektaş arasında buzlar sonunda eridi.\" cümlesindeki \"buzlar erimek\" sözü neyi anlatır?",
        steps: [
          "Buz gerçek anlamda donmuş sudur; cümlede su ya da sıcaklık söz konusu değildir.",
          "İki kişi arasındaki soğukluk, mesafe anlatılmaktadır; bu soyut bir durumdur.",
          "Soğukluğun ortadan kalkması, samimiyetin başlamasıdır; söz mecaz anlamlıdır.",
        ],
        answer: "Aradaki soğukluğun, mesafenin ortadan kalkması",
      },
      {
        level: 'zor',
        problem: "\"Bütün mahalle düğüne koştu.\" cümlesindeki söz sanatı nedir?",
        steps: [
          "\"Mahalle\" bir yerdir; bir yer koşamaz.",
          "Kastedilen mahallede oturan insanlardır; yer söylenip içindekiler kastedilmiştir.",
          "Benzetme amacı yoktur, iç-dış (yer-insan) ilgisiyle ad aktarılmıştır: ad aktarması.",
        ],
        answer: "Ad aktarması (mecaz-ı mürsel)",
      },
    ],
    osymThinking:
      "Sorular çoğu zaman beş cümlede altı çizili sözcükleri verir ve \"hangisi mecaz anlamda kullanılmıştır\" ya da \"hangisi ötekilerden farklı anlamdadır\" diye sorar. Çeldiriciler yan anlam ile mecaz anlamı karıştırmaya dayanır. Deyim sorularında ise deyimin cümleye verdiği anlamın, açıklamada doğru karşılanıp karşılanmadığı ölçülür.",
    commonMistakes: [
      "Yan anlamı mecaz anlam sanmak (\"masanın ayağı\" mecaz değil, yan anlamdır).",
      "Sözcüğü cümleden bağımsız, sözlük anlamıyla değerlendirmek.",
      "Deyim ile atasözünü karıştırmak; hüküm bildiren kalıbın atasözü olduğunu unutmak.",
      "Eş sesli sözcüklerle çok anlamlı sözcükleri aynı sanmak.",
    ],
    tips: [
      "Altı çizili sözcüğün yerine bir eş anlamlısını koy; cümle anlamı bozulmuyorsa doğru anlamı buldun.",
      "Somut bir nesne başka bir somut nesnenin parçasına ad oluyorsa büyük olasılıkla yan anlamdır.",
      "Deyim sorularında önce deyimin anlamını kendi cümlenle söyle, sonra seçeneklere bak.",
    ],
    summary: [
      "Gerçek anlam: ilk akla gelen anlam; yan anlam: benzerlikle kazanılan, bağı kopmamış anlam.",
      "Mecaz anlam: gerçek anlamdan kopmuş, çoğu zaman soyuta aktarılmış anlam.",
      "Terim: belli bir alana özgü anlam.",
      "Deyim hüküm bildirmez; atasözü genel bir yargı ya da öğüt bildirir.",
      "Anlamı belirleyen bağlamdır; sözcüğü cümle içinde oku.",
    ],
  },

  // ---------------------------------------------------------------- Cümlede Anlam
  {
    topicId: 'tyttr-cumlede-anlam',
    intro:
      "Cümlede anlam soruları, bir yargının içindeki ilişkileri ve yazarın tutumunu çözmeni ister. \"Yağmur yağdığı için maç ertelendi.\" cümlesinde bir neden-sonuç ilişkisi vardır; \"Bu film bence yılın en etkileyici yapımı.\" cümlesinde ise kişisel bir değerlendirme.\n\nBu konuda neden-sonuç, amaç-sonuç, koşul-sonuç ilişkilerini; nesnel-öznel yargıyı; varsayım, öneri, eleştiri, karşılaştırma gibi anlatım özelliklerini ve cümle tamamlama becerisini çalışacaksın. TYT’de her yıl birkaç soru doğrudan bu beceriyi ölçer, paragraf soruları da büyük ölçüde bu temele dayanır.",
    prerequisites: [
      "Sözcükte anlam (gerçek-mecaz ayrımı)",
      "Yüklem ve temel cümle yapısını tanıma",
      "Bağlaç ve edatların (ama, çünkü, için, -se) anlama katkısını fark edebilme",
    ],
    concepts: [
      { term: "Neden-sonuç", definition: "Bir eylemin, gerçekleşmiş başka bir durumun sonucu olarak ortaya çıkması. İşaretleri: -dığı için, -den, çünkü, bu yüzden. Örnek: \"Yol buzlandığından otobüs gecikti.\"" },
      { term: "Amaç-sonuç", definition: "Eylemin, henüz gerçekleşmemiş bir hedefe ulaşmak için yapılması. İşaretleri: için, diye, -mek üzere, -sın diye. Örnek: \"Sınavı kazanmak için her gün çalışıyor.\"" },
      { term: "Koşul-sonuç", definition: "Bir yargının gerçekleşmesinin başka bir şarta bağlanması. İşaretleri: -se, -dikçe, -mezse, -dığı takdirde. Örnek: \"Erken çıkarsan trene yetişirsin.\"" },
      { term: "Nesnel yargı", definition: "Doğruluğu kanıtlanabilen, kişiden kişiye değişmeyen yargı. Örnek: \"Kitap on iki bölümden oluşuyor.\"" },
      { term: "Öznel yargı", definition: "Kişisel görüş, duygu ya da beğeni içeren, doğruluğu kanıtlanamayan yargı. Örnek: \"Kitabın en sıkıcı bölümü sonuncusu.\"" },
      { term: "Varsayım", definition: "Bir durumu gerçekmiş gibi kabul edip ondan yola çıkarak yargıya varma. Örnek: \"Diyelim ki bütün kaynaklar tükendi, o zaman…\"" },
      { term: "Ön yargı", definition: "Bir şey hakkında deneyimlemeden, peşin olarak varılan yargı. Örnek: \"Bu yazarın yeni kitabını okumadım ama kesinlikle kötüdür.\"" },
    ],
    formulas: [
      { expr: "Neden-sonuç: sebep geçmişte/gerçek → sonuç", meaning: "Önce gerçekleşmiş bir durum vardır; \"niçin?\" sorusuna gerçek bir olayla cevap verilir." },
      { expr: "Amaç-sonuç: hedef henüz yok → eylem", meaning: "\"Ne için?\" sorusuna henüz gerçekleşmemiş bir hedefle cevap verilir. \"için\"in önündeki sözü kontrol et: gerçekleşmişse neden, gerçekleşmemişse amaç." },
      { expr: "Koşul: -se / -dikçe / -mezse", meaning: "Yargı, bir şartın gerçekleşmesine bağlıdır." },
      { expr: "Nesnel = kanıtlanabilir; öznel = tartışılabilir", meaning: "\"Güzel, sıkıcı, en iyi, etkileyici\" gibi değerlendirme sözcükleri genellikle öznelliğin işaretidir." },
      { expr: "Kesinlik ≠ olasılık", meaning: "\"-ebilir, muhtemelen, belki, sanırım\" olasılık bildirir; \"kesinlikle, mutlaka\" kesinlik bildirir." },
    ],
    logic:
      "Bir cümlede bağlaçlar ve ekler, yargılar arasındaki mantıksal köprüleri kurar. \"İçin\" ekinin hem neden hem amaç bildirebilmesi, sınavın en sevdiği tuzaktır: \"Hastalandığı için gelmedi.\" (hastalık gerçekleşmiş → neden), \"Hastalanmamak için aşı oldu.\" (hastalanmamak hedef → amaç).\n\nNesnel-öznel ayrımı da benzer bir mantıkla çalışır: Yargı ölçülebilir, sayılabilir, gözlenebilir bir gerçeğe dayanıyorsa nesnel; kişinin beğenisine, duygusuna, yorumuna dayanıyorsa özneldir. Cümleyi \"Herkes bunu doğrulayabilir mi?\" diye sorgulamak çoğu zaman yeterlidir.",
    examples: [
      {
        level: 'kolay',
        problem: "\"Sabah erken kalkmak için alarmı üç kez kurdu.\" cümlesindeki anlam ilişkisi nedir?",
        steps: [
          "\"Erken kalkmak\" henüz gerçekleşmemiş bir durumdur.",
          "Alarm kurma eylemi bu hedefe ulaşmak için yapılmıştır.",
          "Hedef bildiren \"için\" amaç-sonuç ilişkisi kurar.",
        ],
        answer: "Amaç-sonuç",
      },
      {
        level: 'orta',
        problem: "\"Yazarın son romanı, önceki kitaplarından daha az sayfadan oluşuyor ama daha yoğun bir anlatıma sahip.\" cümlesinde hangi yargılar nesnel, hangileri özneldir?",
        steps: [
          "\"Daha az sayfadan oluşuyor\" sayfa sayılarak kanıtlanabilir: nesnel.",
          "\"Daha yoğun bir anlatıma sahip\" okurdan okura değişebilecek bir değerlendirmedir: öznel.",
          "Cümle karşılaştırma içerir ve nesnel ile öznel yargıyı bir arada barındırır.",
        ],
        answer: "Sayfa sayısıyla ilgili yargı nesnel, anlatımın yoğunluğuyla ilgili yargı özneldir.",
      },
      {
        level: 'zor',
        problem: "\"Bir şehrin kimliği, yalnızca binalarında değil, o binaların arasında yaşanan hayatta da aranmalıdır.\" cümlesinden hangi yargı çıkarılabilir?",
        steps: [
          "\"Yalnızca … değil, … da\" kalıbı iki unsuru birlikte önemli sayar; binaları dışlamaz.",
          "\"Aranmalıdır\" gereklilik bildirir; yazar bir öneri/görüş ortaya koymaktadır.",
          "Buna göre çıkarılabilecek yargı: Şehrin kimliğini anlamak için mimarinin yanında insanların yaşayışına da bakılmalıdır.",
          "\"Binalar önemsizdir\" yargısı çıkarılamaz; bu, kalıbın anlamını ters okumaktır.",
        ],
        answer: "Şehir kimliği hem yapılarda hem de oradaki yaşayışta aranmalıdır.",
      },
    ],
    osymThinking:
      "Sorular genellikle beş cümle verip \"hangisinde neden-sonuç ilişkisi vardır\" ya da \"hangisinde öznel bir yargı yoktur\" diye sorar. \"Yok\" ve \"değildir\" kökü dikkatten kaçırılmaya çok açıktır. Cümle yorumunda çeldiriciler; cümlede geçmeyen genellemeler, \"yalnızca\" gibi kısıtlamalar ya da yazarın yargısının tersini içerir.",
    commonMistakes: [
      "\"İçin\" gördüğü her cümleyi amaç-sonuç saymak; önündeki durumun gerçekleşip gerçekleşmediğine bakmamak.",
      "Sayısal ifade içeren her cümleyi nesnel saymak; \"çok az, fazlasıyla\" gibi değerlendirmeleri gözden kaçırmak.",
      "Cümlede olmayan bir genellemeyi (\"herkes, her zaman\") seçeneğe taşımak.",
      "Soru kökündeki olumsuzluğu (\"yoktur\", \"değildir\") atlamak.",
    ],
    tips: [
      "Amaç mı neden mi karar veremediğinde \"için\" yerine \"-dığından\" koy: anlam bozulmuyorsa neden-sonuçtur.",
      "Öznellik için değerlendirme sıfatlarını (güzel, gereksiz, başarılı, sıkıcı) işaretle.",
      "Cümle tamamlama sorularında boşluğun önündeki ve arkasındaki bağlaca (ama, çünkü, bu yüzden) göre düşünce yönünü belirle.",
    ],
    summary: [
      "Neden-sonuç: gerçekleşmiş sebep; amaç-sonuç: ulaşılmak istenen hedef.",
      "Koşul-sonuç: -se, -dikçe, -mezse gibi şart yapıları.",
      "Nesnel: kanıtlanabilir; öznel: kişisel değerlendirme.",
      "Olasılık (-ebilir, belki) ile kesinlik (mutlaka) farklı yargılardır.",
      "Soru kökündeki olumsuzluğu mutlaka işaretle.",
    ],
  },

  // ---------------------------------------------------------------- Paragraf
  {
    topicId: 'tyttr-paragraf',
    intro:
      "TYT Türkçe testinin en büyük bölümü paragraf sorularıdır; 40 sorunun yarıdan fazlası doğrudan ya da dolaylı olarak paragraf okumaya dayanır. Bu yüzden paragraf, Türkçe netini belirleyen asıl konudur. İyi haber şu: Paragraf soruları ezber istemez, bir okuma yöntemi ister ve bu yöntem düzenli çalışmayla hızla gelişir.\n\nParagraf, tek bir ana düşünce etrafında birleşen cümleler topluluğudur. Her paragrafın bir konusu (neden söz ettiği), bir ana düşüncesi (o konu hakkında asıl söylemek istediği) ve bu ana düşünceyi destekleyen yardımcı düşünceleri vardır. Yazar bu düşünceleri belli bir anlatım biçimiyle (açıklama, tartışma, öyküleme, betimleme) ve belli düşünceyi geliştirme yollarıyla (tanım, örnek, karşılaştırma, tanık gösterme, sayısal veri, benzetme) sunar.\n\nSınavda paragraf soruları dört ana gruba ayrılır: ana düşünce/konu/başlık soruları, yardımcı düşünce ve çıkarım soruları, paragrafın yapısıyla ilgili sorular (akışı bozan cümle, sıralama, ikiye bölme, boşluk tamamlama) ve anlatım biçimi/düşünceyi geliştirme yolu soruları. Her grup farklı bir okuma stratejisi ister.\n\nBu anlatımda her soru tipi için nereden başlayacağını, hangi cümleye daha çok ağırlık vereceğini ve çeldiricileri nasıl eleyeceğini adım adım göreceksin. Zaman yönetimi de bu konunun parçasıdır: 40 soruyu yaklaşık 40–45 dakikada bitirebilmek için paragraf başına ortalama bir dakika hedeflemelisin.",
    prerequisites: [
      "Cümlede anlam: neden-sonuç, amaç-sonuç, nesnel-öznel yargı ayrımı",
      "Sözcükte anlam: mecaz ve yan anlamları bağlam içinde çözme",
      "Bağlaçların (ama, ancak, oysa, çünkü, bu yüzden, kısacası) düşünce yönünü nasıl değiştirdiğini bilme",
      "Genel-özel yargı ayrımı",
    ],
    concepts: [
      { term: "Konu", definition: "Paragrafta üzerinde durulan, \"Ne hakkında?\" sorusunun cevabı olan genel mesele. Örnek: \"şehirlerde ağaçlandırma\"." },
      { term: "Ana düşünce (ana fikir)", definition: "Yazarın konu hakkında okura asıl iletmek istediği mesaj; \"Yazar ne demek istiyor?\" sorusunun cevabı. Örnek: \"Şehirlerde ağaçlandırma, estetikten önce bir sağlık meselesidir.\"" },
      { term: "Yardımcı düşünce", definition: "Ana düşünceyi açıklayan, destekleyen, örnekleyen ayrıntılar. Paragrafta birden fazla bulunur." },
      { term: "Giriş – gelişme – sonuç", definition: "Giriş cümlesi konuyu açar ve kendinden önceki bir cümleye bağlı olmamalıdır; gelişme cümleleri düşünceyi açar; sonuç cümlesi toparlar ve çoğu zaman ana düşünceyi taşır." },
      { term: "Açıklayıcı anlatım", definition: "Okura bilgi vermeyi amaçlar; öğretici, nesnel ağırlıklıdır, okuru ikna etmeye çalışmaz." },
      { term: "Tartışmacı anlatım", definition: "Bir görüşü savunur, karşıt görüşü çürütmeye çalışır; okuru ikna etmeyi amaçlar. \"Kimileri … diyor, oysa …\" yapısı tipiktir." },
      { term: "Öyküleyici anlatım", definition: "Olay, kişi, zaman ve mekân unsurlarıyla bir olayı anlatır; hareket ve zaman akışı öndedir." },
      { term: "Betimleyici anlatım", definition: "Bir varlığı ya da yeri, duyulara (görme, işitme, koku…) seslenerek okurun gözünde canlandırır; resim çizer gibi anlatır." },
      { term: "Düşünceyi geliştirme yolları", definition: "Tanımlama, örnekleme, karşılaştırma, tanık gösterme (alıntı), sayısal verilerden yararlanma ve benzetme gibi yöntemler." },
    ],
    formulas: [
      { expr: "Ana düşünce çoğunlukla ilk ya da son cümlededir", meaning: "Tümdengelimli paragrafta ana düşünce başta, tümevarımlı paragrafta sonda yer alır. Önce bu iki cümleyi oku, sonra seçeneklerle karşılaştır." },
      { expr: "ama / ancak / oysa / fakat → sonrası önemlidir", meaning: "Karşıtlık bağlacından sonra gelen düşünce genellikle yazarın asıl görüşüdür; öncesi çoğu zaman yaygın ya da karşı görüştür." },
      { expr: "kısacası / demek ki / öyleyse / bu yüzden → sonuç cümlesi", meaning: "Bu sözlerle başlayan cümle toparlayıcıdır ve ana düşünceye en yakın cümledir." },
      { expr: "Ana düşünce = konu + yazarın yargısı", meaning: "Seçenek yalnızca konuyu adlandırıyorsa eksiktir; ana düşünce konuya ilişkin bir yargı içermelidir." },
      { expr: "Doğru seçenek ⊂ paragraf", meaning: "Çıkarım sorularında seçenekteki her unsur paragrafta dayanağa sahip olmalıdır. Paragrafta olmayan tek bir sözcük bile (\"her zaman\", \"yalnızca\") seçeneği yanlış yapabilir." },
      { expr: "Giriş cümlesi ≠ bağlayıcı başlangıç", meaning: "\"Bu, bununla birlikte, ayrıca, çünkü, oysa, bu nedenle\" ile başlayan cümle paragrafın ilk cümlesi olamaz; kendinden önce bir cümleye muhtaçtır." },
      { expr: "Akışı bozan cümle = konu aynı, bakış açısı farklı", meaning: "Akışı bozan cümle çoğunlukla aynı konudan söz eder ama paragrafın odaklandığı yönden sapar. Sadece anahtar sözcüğe bakmak yanıltır." },
      { expr: "İkiye bölme = konu/yön değişimi", meaning: "İkinci paragraf, yeni bir yön, karşıt görüş ya da farklı bir alt konu başlattığı cümleden başlar." },
    ],
    logic:
      "Paragraf yazarı, okuru bir sonuca götürmek ister. Bu yüzden bütün cümleler tek bir merkeze, ana düşünceye hizmet eder. Yardımcı düşünceler o merkezin etrafında döner; biri merkezden koparsa \"akışı bozan cümle\" olur. Bu mantığı kavradığında paragraf soruları birer yapboza dönüşür: Merkezi bul, parçaların merkeze nasıl bağlandığını gör.\n\nAna düşünceyi bulurken genellikle ilk ve son cümle belirleyicidir; çünkü yazar ya düşüncesini baştan söyleyip örneklerle destekler (tümdengelim) ya da örneklerden başlayıp sonuca ulaşır (tümevarım). Ancak \"ama, oysa, ne var ki\" gibi karşıtlık bağlaçları düşüncenin yönünü değiştirir; bağlaçtan sonraki kısım, yazarın asıl görüşüdür.\n\nÇıkarım sorularında sınav, okuru ikiye ayırır: Paragrafta yazanı okuyanlar ve paragrafa kendi bildiğini ekleyenler. Doğru seçenek her zaman paragraftan kanıtlanabilir. Genel kültürün, kişisel görüşün ya da \"mantıklı görünen\" bir yargının paragrafta dayanağı yoksa o seçenek yanlıştır.\n\nAnlatım biçimi sorularında yazarın amacına bak: Bilgi veriyorsa açıklayıcı, ikna etmeye çalışıyorsa tartışmacı, olay anlatıyorsa öyküleyici, resim çiziyorsa betimleyici. Düşünceyi geliştirme yollarında ise yazarın \"nasıl\" desteklediğine bak: bir uzmanın sözünü aktarıyorsa tanık gösterme, sayı ve oran veriyorsa sayısal veri, iki şeyin benzer ya da farklı yönlerini ortaya koyuyorsa karşılaştırma.",
    examples: [
      {
        level: 'kolay',
        problem:
          "\"Bir kitabı ikinci kez okuduğumuzda, ilk okumada gözümüzden kaçan pek çok ayrıntıyı fark ederiz. İlk okumada olay örgüsünün merakı bizi hızlandırır; sonun ne olacağını bildiğimizde ise dile, karakterlerin iç dünyasına, küçük sahnelere dikkat kesiliriz. Bu yüzden bazı kitaplar asıl değerini ikinci okumada gösterir.\" Bu paragrafın ana düşüncesi nedir?",
        steps: [
          "Konu: bir kitabı yeniden okumak.",
          "Son cümle \"Bu yüzden\" ile başlıyor; toparlayıcı cümledir.",
          "Ana düşünce: Yeniden okuma, ilk okumada kaçan ayrıntıları fark ettirerek kitabın değerini ortaya çıkarır.",
          "\"İlk okuma gereksizdir\" gibi bir yargı paragrafta yoktur; bu tür seçenekler elenir.",
        ],
        answer: "Bazı kitapların değeri, ayrıntıların fark edildiği ikinci okumada ortaya çıkar.",
      },
      {
        level: 'orta',
        problem:
          "(I) Kentlerde bisiklet yolları son yıllarda hızla artıyor. (II) Bu yollar hem trafiği rahatlatıyor hem de hava kirliliğini azaltıyor. (III) Bisiklet, ilk olarak on dokuzuncu yüzyılda Avrupa’da yaygınlaştı. (IV) Üstelik düzenli bisiklet kullanan kişilerin sağlığı da olumlu etkileniyor. (V) Bu nedenle yerel yönetimlerin bu yatırımları sürdürmesi gerekiyor. Numaralanmış cümlelerden hangisi düşüncenin akışını bozmaktadır?",
        steps: [
          "Paragrafın odağı: kentlerdeki bisiklet yollarının yararları ve sürdürülmesi gerekliliği.",
          "II ve IV yararları sayıyor; \"Üstelik\" IV’ü II’ye bağlıyor.",
          "V, \"Bu nedenle\" ile yararlardan sonuç çıkarıyor.",
          "III bisikletten söz ediyor ama bisikletin tarihine geçiyor; konu aynı, yön farklı.",
        ],
        answer: "III",
      },
      {
        level: 'zor',
        problem:
          "\"Birçok kişi, yapay ışıkların yalnızca gökyüzü gözlemcilerini ilgilendirdiğini düşünür. Oysa gece boyunca aydınlatılan kıyılar, yumurtadan çıkan deniz kaplumbağası yavrularını denize değil, kente yöneltir. Göç eden kuşlar parlak binaların çevresinde yönünü şaşırır. Karanlık, doğa için bir eksiklik değil, bir ihtiyaçtır.\" Bu paragrafta hangi anlatım biçimi ve düşünceyi geliştirme yolu ağır basmaktadır?",
        steps: [
          "İlk cümle yaygın bir görüşü veriyor; \"Oysa\" ile bu görüşe karşı çıkılıyor: tartışmacı anlatım işareti.",
          "Kaplumbağa yavruları ve göçmen kuşlar yazarın görüşünü destekleyen somut durumlardır: örnekleme.",
          "Son cümle yazarın savunduğu yargıdır: karanlık bir ihtiyaçtır.",
          "Sayı, oran ya da bir uzmanın sözü yoktur; sayısal veri ve tanık gösterme elenir.",
        ],
        answer: "Tartışmacı anlatım; örneklemeden yararlanılmıştır.",
      },
    ],
    osymThinking:
      "Paragraf soruları okumayı değil, doğru okumayı ölçer. Ana düşünce sorularında çeldiriciler çoğu zaman paragrafta geçen ama yardımcı düşünce düzeyinde kalan doğru bilgilerdir; yani \"doğru ama ana düşünce değil\" seçenekler en tehlikeli olanlardır. Çıkarım sorularında paragrafta olmayan bir genelleme ya da kısıtlama eklenir. Yapı sorularında akışı bozan cümle, paragrafla aynı anahtar sözcüğü taşıyarak gizlenir. \"Değinilmemiştir\", \"çıkarılamaz\" gibi olumsuz kökler, seçenekleri tek tek paragrafta arama gerektirir; bu sorularda paragrafı önceden okuyup her seçenek için ilgili cümleyi işaretlemek zaman kazandırır.",
    commonMistakes: [
      "Doğru bir yardımcı düşünceyi ana düşünce sanmak; seçenek doğru ama kapsamı dar olabilir.",
      "Paragrafa kişisel bilgi ya da görüş eklemek; \"mantıklı\" ama metinde dayanağı olmayan seçeneği işaretlemek.",
      "\"Ama, oysa\" gibi bağlaçlardan önceki karşı görüşü yazarın görüşü sanmak.",
      "Akışı bozan cümleyi yalnızca anahtar sözcüğe bakarak aramak; aynı sözcüğü taşıyan cümlenin yönü farklı olabilir.",
      "Soru kökünü okumadan paragrafa dalmak; \"değinilmemiştir\" sorusunda değinileni işaretlemek.",
      "Anlatım biçiminde \"betimleme\" ile \"öyküleme\"yi karıştırmak: Betimlemede zaman akmaz, görüntü verilir; öykülemede olay ilerler.",
    ],
    tips: [
      "Önce soru kökünü oku; ne aradığını bilerek paragrafa gir.",
      "Ana düşünce sorusunda ilk ve son cümleyi, karşıtlık bağlacından sonraki kısmı işaretle.",
      "Sıralama sorularında önce giriş olamayacak cümleleri (bağlaçla, zamirle başlayanları) ele; sonra seçeneklerden yola çıkarak dene.",
      "Boşluk doldurma sorularında boşluktan önceki ve sonraki cümleyi oku; boşluk ikisine de bağlanmalıdır.",
      "Takıldığın paragraf sorusunu işaretle, geç; testin sonuna dön. Bir soruya üç dakika vermek iki soruyu kaybettirir.",
      "Her gün düzenli olarak 20–30 paragraf sorusu çöz; hız ve dikkat ancak düzenli pratikle gelişir.",
    ],
    summary: [
      "Konu: ne hakkında; ana düşünce: konu hakkında yazarın asıl yargısı.",
      "Ana düşünce çoğunlukla ilk ya da son cümlede; karşıtlık bağlacından sonrası kritiktir.",
      "Çıkarım sorularında her seçenek paragrafta dayanak bulmalıdır.",
      "Giriş cümlesi bağlaç ya da zamirle başlamaz; akışı bozan cümle konuda kalıp yönden sapar.",
      "Anlatım biçimleri: açıklayıcı, tartışmacı, öyküleyici, betimleyici.",
      "Düşünceyi geliştirme yolları: tanım, örnek, karşılaştırma, tanık gösterme, sayısal veri, benzetme.",
      "Önce soru kökünü oku; paragraf başına yaklaşık bir dakika hedefle.",
    ],
  },

  // ---------------------------------------------------------------- Ses Bilgisi
  {
    topicId: 'tyttr-ses-bilgisi',
    intro:
      "Türkçe, ekler eklenirken seslerin birbirine uyum sağladığı, kurallı bir dildir. \"Kitap\" sözcüğüne \"-ı\" eklendiğinde \"kitabı\" olur; \"ağız\" sözcüğüne \"-ı\" eklendiğinde \"ağzı\" olur. Bu değişimlerin her biri bir ses olayıdır.\n\nBu konuda Türkçenin sekiz ünlüsünü, büyük ve küçük ünlü uyumunu, ünlü düşmesi, ünlü daralması, ünsüz yumuşaması, ünsüz benzeşmesi gibi ses olaylarını öğreneceksin. TYT’de genellikle bir cümlede ya da parçada belli bir ses olayının bulunup bulunmadığı sorulur.",
    prerequisites: [
      "Türkçe alfabedeki ünlü ve ünsüz harfleri tanıma",
      "Kök ve ek kavramlarını genel olarak bilme",
    ],
    concepts: [
      { term: "Büyük ünlü uyumu", definition: "Türkçe sözcüklerde kalın ünlüden (a, ı, o, u) sonra kalın, ince ünlüden (e, i, ö, ü) sonra ince ünlü gelmesi. Örnek: \"kapılar\", \"evlerimiz\"." },
      { term: "Küçük ünlü uyumu", definition: "Düz ünlüden (a, e, ı, i) sonra düz; yuvarlak ünlüden (o, ö, u, ü) sonra düz-geniş (a, e) ya da dar-yuvarlak (u, ü) ünlü gelmesi. Örnek: \"okullu\", \"gözlük\"." },
      { term: "Ünlü düşmesi", definition: "İkinci hecesinde dar ünlü bulunan bazı sözcüklere ünlüyle başlayan ek geldiğinde bu dar ünlünün düşmesi. Örnek: ağız → ağzı, burun → burnu, oğul → oğlu." },
      { term: "Ünlü daralması", definition: "\"a, e\" ile biten fiillere \"-yor\" eki geldiğinde bu ünlülerin \"ı, i, u, ü\"ye dönüşmesi. Örnek: bekle- → bekliyor, ara- → arıyor." },
      { term: "Ünsüz yumuşaması", definition: "Sonu \"p, ç, t, k\" ile biten sözcüklere ünlüyle başlayan ek geldiğinde bu seslerin \"b, c, d, ğ/g\"ye dönüşmesi. Örnek: kitap → kitabı, ağaç → ağacı, renk → rengi." },
      { term: "Ünsüz benzeşmesi (sertleşme)", definition: "Sert ünsüzle (f, s, t, k, ç, ş, h, p) biten sözcüğe \"c, d, g\" ile başlayan ek geldiğinde bu seslerin \"ç, t, k\"ye dönüşmesi. Örnek: kitap-da → kitapta, iş-ci → işçi." },
      { term: "Kaynaştırma ünsüzü", definition: "Ünlüyle biten sözcüğe ünlüyle başlayan ek geldiğinde araya giren \"y, ş, s, n\" sesleri. Örnek: kapı-y-ı, iki-şer, oda-s-ı, bahçe-n-in." },
    ],
    formulas: [
      { expr: "Sert ünsüzler: f, s, t, k, ç, ş, h, p (\"FıSTıKÇı ŞaHaP\")", meaning: "Bu seslerle biten sözcüklere gelen c, d, g ile başlayan ekler sertleşir." },
      { expr: "Yumuşama: p→b, ç→c, t→d, k→ğ/g + ünlüyle başlayan ek", meaning: "Tek heceli sözcüklerin çoğunda yumuşama olmaz (top → topu, saç → saçı; ama kap → kabı, dip → dibi gibi istisnalar vardır)." },
      { expr: "Ünlü daralması yalnızca \"-yor\" ekiyle olur", meaning: "\"Başlıyor, izliyor\" gibi. \"Diyor, yiyor\" da daralmadır. Başka eklerle yazımda daralma yoktur (başlayan, başlayacak)." },
      { expr: "Ünlü türemesi / ünsüz türemesi", meaning: "Ünlü türemesi: sıcak → sıcacık, dar → daracık. Ünsüz türemesi: Arapça kökenli bazı sözcüklerde ünsüz ikizleşir: his → hissi, af → affetmek." },
    ],
    logic:
      "Ses olaylarının temelinde söyleyiş kolaylığı yatar. İki sert ünsüz yan yana geldiğinde ya da bir ünsüz iki ünlü arasına düştüğünde, ağız en az çabayla söyleyebileceği sese kayar: \"kitap-ı\" yerine \"kitabı\" demek daha akıcıdır; \"iş-ci\" yerine \"işçi\" demek daha kolaydır. Uyum kuralları da aynı mantıkla çalışır: Dil, bir sözcük içinde ünlülerin aynı bölgede (kalın/ince) kalmasını tercih eder.\n\nBu yüzden bir ses olayını ararken sözcüğü yüksek sesle ekleriyle söyle ve kök ile ekli biçimi karşılaştır; hangi sesin değiştiğini, düştüğünü ya da türediğini doğrudan görebilirsin.",
    examples: [
      {
        level: 'kolay',
        problem: "\"Çocuk, ağzındaki sakızı çıkarıp kâğıda sardı.\" cümlesinde ünlü düşmesine uğramış sözcük hangisidir?",
        steps: [
          "\"Ağzındaki\" sözcüğünün kökü \"ağız\"dır.",
          "\"Ağız\" + \"-ı\" iyelik eki → \"ağzı\": ikinci hecedeki \"ı\" düşmüştür.",
          "\"Kâğıda\"da ise \"t → d\" yumuşaması vardır; ünlü düşmesi değildir.",
        ],
        answer: "ağzındaki",
      },
      {
        level: 'orta',
        problem: "\"Sokaktaki ağacın dalları rüzgârda sallanıyordu.\" cümlesinde hangi ses olayları vardır?",
        steps: [
          "\"Sokak-da → sokakta\": \"k\" sert ünsüzünden sonra \"d → t\": ünsüz benzeşmesi.",
          "\"Ağaç-ın → ağacın\": \"ç → c\": ünsüz yumuşaması.",
          "\"Rüzgâr-da\": \"r\" sert değildir, benzeşme yoktur.",
          "\"Sallan-ıyor\": \"sallan-\" fiili \"n\" ile bitiyor; \"a/e\" ile bitmediği için ünlü daralması yoktur, \"ı\" yardımcı ünlüdür.",
        ],
        answer: "Ünsüz benzeşmesi ve ünsüz yumuşaması",
      },
    ],
    osymThinking:
      "Sorular genellikle bir cümle ya da kısa parça verip \"aşağıdaki ses olaylarından hangisi yoktur\" diye sorar. Bu tür sorularda her ses olayını ayrı ayrı parçada aramak gerekir. Çeldiriciler, yardımcı ünlüyle ünlü daralmasını, kök hâlinde zaten yumuşak olan sözcükleri yumuşamayla karıştırmaya dayanır.",
    commonMistakes: [
      "\"-yor\" eki alan her fiilde daralma olduğunu sanmak; fiilin \"a/e\" ile bitip bitmediğine bakmamak (gel-iyor’da daralma yoktur).",
      "Kökü zaten \"b, c, d, g\" ile biten sözcüklerde yumuşama aramak.",
      "Özel adlarda yumuşamanın yazıya yansıtıldığını sanmak (Zonguldak’a yazılır, okunuşta yumuşama olsa da).",
      "Kaynaştırma ünsüzünü ek sanmak.",
    ],
    tips: [
      "Sözcüğün kökünü yaz, ekli hâliyle alt alta koy; farkı gözünle gör.",
      "\"FıSTıKÇı ŞaHaP\" kısaltmasını ezberle; benzeşme sorularının anahtarıdır.",
      "Yumuşamada p, ç, t, k seslerinin \"ünlüyle başlayan ek\" aldığını kontrol et.",
    ],
    summary: [
      "Büyük ünlü uyumu: kalın-ince; küçük ünlü uyumu: düz-yuvarlak.",
      "Ünlü düşmesi: ağız → ağzı; ünlü daralması: bekle → bekliyor.",
      "Yumuşama: p, ç, t, k → b, c, d, ğ/g (ünlüyle başlayan ek gelince).",
      "Benzeşme: sert ünsüzden sonra c, d, g → ç, t, k.",
      "Kaynaştırma ünsüzleri: y, ş, s, n.",
    ],
  },

  // ---------------------------------------------------------------- Yazım Kuralları
  {
    topicId: 'tyttr-yazim-kurallari',
    intro:
      "Yazım kuralları, bir dili yazıya geçirirken herkesin aynı biçimde yazmasını sağlayan ortak ölçülerdir. Türkçede bu kurallar Türk Dil Kurumunun Yazım Kılavuzu’na dayanır. TYT’de genellikle bir parçada yazım yanlışı yapılmış sözcük sorulur.\n\nEn çok soru gelen alanlar şunlardır: büyük harflerin kullanımı, \"de/da\" bağlacı ile \"-de/-da\" ekinin ayrımı, \"ki\" bağlacı ile \"-ki\" ekinin ayrımı, \"mi\" soru ekinin yazımı, sayıların yazımı ve birleşik sözcükler. Bu anlatımda, emin olarak uygulayabileceğin temel kuralları örneklerle öğreneceksin.",
    prerequisites: [
      "Sözcük türleri hakkında genel bilgi (bağlaç, ek, özel ad)",
      "Kök ve ek kavramı",
      "Kesme işaretinin temel işlevi",
    ],
    concepts: [
      { term: "Bağlaç olan \"de/da\"", definition: "\"Dahi, bile, ayrıca\" anlamı katar, ayrı yazılır ve çıkarıldığında cümle bozulmaz. Asla \"te/ta\" olmaz. Örnek: \"Ben de geleceğim.\"" },
      { term: "Bulunma hâli eki \"-de/-da, -te/-ta\"", definition: "Yer, zaman bildirir; sözcüğe bitişik yazılır, sert ünsüzden sonra \"-te/-ta\" olur. Örnek: \"Evde, sokakta\"." },
      { term: "Bağlaç olan \"ki\"", definition: "Ayrı yazılır; cümleleri bağlar. Örnek: \"Duydum ki gidiyormuşsun.\" Kalıplaşmış bazı sözcüklerde bitişik yazılır: belki, çünkü, oysaki, sanki, mademki, halbuki, meğerki." },
      { term: "Aitlik eki \"-ki\"", definition: "Bitişik yazılır; \"-deki\" ya da zaman bildiren sözcüklerde \"-ki\" biçiminde görülür. Örnek: \"Evdeki, yarınki, seninki\"." },
      { term: "Soru eki \"mi\"", definition: "Her zaman ayrı yazılır, kendinden sonraki ekler ona bitişir. Örnek: \"Geldin mi?\", \"Gelecek misiniz?\"" },
      { term: "Özel adlara gelen ekler", definition: "Özel adlara getirilen çekim ekleri kesme işaretiyle ayrılır: Ankara’ya, Ayşe’nin. Yapım eki alan özel adlarda kesme kullanılmaz: Ankaralı, Türkçe." },
    ],
    formulas: [
      { expr: "Bağlaç \"de\" testi: çıkar → cümle bozulmuyorsa ayrı yaz", meaning: "\"Kardeşim de geldi.\" → \"Kardeşim geldi.\" anlamlıdır, ayrı yazılır. \"Evde kaldı.\" → \"Ev kaldı.\" bozulur, bitişik yazılır." },
      { expr: "Bağlaç \"ki\" ayrı; \"-ki\" (sıfat yapan/aitlik) bitişik", meaning: "\"-ki\" ekini \"-deki\" biçimine çevirerek veya \"ait olan\" anlamıyla test et." },
      { expr: "Sayılar ayrı yazılır: on beş, yüz yirmi üç", meaning: "Para ile ilgili işlemlerde (çek, senet) sayılar bitişik yazılabilir; normal metinde ayrı yazılır." },
      { expr: "Sıra sayıları: 5. ya da 5’inci", meaning: "Rakamla yazılan sıra sayısında nokta veya kesme ile ek kullanılır; ikisi birlikte kullanılmaz (5.’inci yanlıştır)." },
      { expr: "Gün ve ay adları belirli tarih bildirince büyük harfle", meaning: "\"29 Ekim 1923 Pazartesi\" gibi. Belirli bir tarih bildirmiyorsa küçük yazılır: \"Her ekim ayında…\"." },
      { expr: "Yön adları özel ada dâhil olunca büyük harfle", meaning: "\"Doğu Anadolu\" büyük; \"Şehrin doğusunda\" küçük yazılır." },
    ],
    logic:
      "Yazım kurallarının çoğu, anlam karışıklığını önlemek için vardır. \"Sende mi?\" ile \"Sen de mi?\" arasındaki fark, bağlaçla ekin yazımda ayrılmasından gelir: Birincisi \"senin yanında mı\", ikincisi \"sen bile mi\" anlamındadır. Aynı biçimde kesme işareti, özel adın nerede bittiğini gösterir.\n\nBu mantıkla bir sözcüğü değerlendirirken \"bu yazım hangi anlamı taşıyor?\" diye sor. Bağlaçlar ayrı yazılarak cümledeki bağımsızlıklarını; ekler bitişik yazılarak sözcüğe bağlılıklarını gösterir.",
    examples: [
      {
        level: 'kolay',
        problem: "\"Arkadaşımda bu kitabı okumuş.\" cümlesinde yazım yanlışı var mıdır?",
        steps: [
          "\"da\"yı çıkar: \"Arkadaşım bu kitabı okumuş.\" Cümle anlamlıdır.",
          "Anlam \"arkadaşım bile, arkadaşım dahi\" şeklindedir; bu bağlaçtır.",
          "Bağlaç ayrı yazılmalıdır: \"Arkadaşım da bu kitabı okumuş.\"",
        ],
        answer: "Evet; \"Arkadaşım da\" biçiminde yazılmalıdır.",
      },
      {
        level: 'orta',
        problem: "\"Geçen haftaki toplantıda, belki de yılın en önemli kararı alındı ki herkes bunu bekliyordu.\" cümlesindeki \"ki\" ve \"-ki\"lerin yazımını değerlendiriniz.",
        steps: [
          "\"Haftaki\": zamana ait olanı bildiren \"-ki\" ekidir; bitişik yazılır: doğru.",
          "\"Belki\": kalıplaşmış, bitişik yazılan sözcüklerdendir: doğru.",
          "\"… alındı ki herkes…\": iki yargıyı bağlayan bağlaçtır; ayrı yazılır: doğru.",
        ],
        answer: "Hepsi doğru yazılmıştır.",
      },
    ],
    osymThinking:
      "Sorular genellikle numaralanmış ya da altı çizili sözcükler içeren bir parça verir ve \"hangisinin yazımı yanlıştır\" diye sorar. Yanlış yapılan sözcük, çoğunlukla doğru yazılmış benzer bir örnekle aynı parçada bulunur (ör. \"evde\" ile \"sen de\"). Kuralı bilmek kadar her sözcüğü tek tek kontrol etme disiplini de ölçülür.",
    commonMistakes: [
      "Bağlaç olan \"de\"yi \"te\" biçiminde yazmak (\"Ben te\" yanlış).",
      "\"mi\" soru ekini bitişik yazmak (\"gelecekmi\" yanlış).",
      "Yapım eki alan özel adlara kesme koymak (\"Ankara’lı\" yanlış, \"Ankaralı\" doğru).",
      "Belirli tarih bildirmeyen ay ve gün adlarını büyük harfle başlatmak.",
    ],
    tips: [
      "\"de\" ve \"ki\" için çıkarma testini alışkanlık hâline getir.",
      "\"mi\"yi gördüğün yerde ayrılıp ayrılmadığını otomatik kontrol et.",
      "Özel ad + ek gördüğünde ekin çekim eki mi yapım eki mi olduğunu sor.",
    ],
    summary: [
      "Bağlaç \"de/da\" ve \"ki\" ayrı; ek olan \"-de/-da\" ve \"-ki\" bitişik yazılır.",
      "\"mi\" soru eki her zaman ayrı yazılır.",
      "Özel adlara gelen çekim ekleri kesmeyle ayrılır; yapım eklerinde kesme kullanılmaz.",
      "Sayılar ayrı yazılır; belirli tarihteki ay/gün adları büyük harfle başlar.",
    ],
  },

  // ---------------------------------------------------------------- Noktalama
  {
    topicId: 'tyttr-noktalama',
    intro:
      "Noktalama işaretleri yazının trafik işaretleridir: Nerede durulacağını, nerede kısa bir nefes alınacağını, hangi sözün aktarıldığını, hangi cümlenin soru ya da ünlem olduğunu gösterirler. Yanlış yerde kullanılan bir virgül cümlenin anlamını değiştirebilir.\n\nTYT’de noktalama soruları çoğunlukla bir parçada numaralanmış yerlere hangi işaretlerin getirileceğini ya da hangi işaretin yanlış kullanıldığını sorar. Bu konuda en sık kullanılan işaretlerin görevlerini, birbirinin yerine kullanılıp kullanılamayacağını öğreneceksin.",
    prerequisites: [
      "Cümle ve yüklem kavramı",
      "Sıralı ve bağlı cümle ayrımına genel bakış",
      "Özel ad ve ek kavramı",
    ],
    concepts: [
      { term: "Virgül (,)", definition: "Eş görevli sözcükleri ve sıralı cümleleri ayırır; hitaplardan sonra, ara sözleri ayırmak için ve cümlede özneyi belirtmek için kullanılır." },
      { term: "Noktalı virgül (;)", definition: "Virgüllerle ayrılmış tür ya da takımları birbirinden ayırır; ögeleri arasında virgül bulunan sıralı cümleleri ayırır." },
      { term: "İki nokta (:)", definition: "Kendisinden sonra örnek verilecek ya da açıklama yapılacak cümlenin sonuna konur; aktarılacak sözden önce kullanılır." },
      { term: "Üç nokta (…)", definition: "Tamamlanmamış cümlelerin sonuna, söylenmek istenmeyen sözlerin yerine ve alıntıda atlanan kısımları belirtmek için konur." },
      { term: "Tırnak işareti (\" \")", definition: "Başka birinden aktarılan sözleri, özellikle belirtilmek istenen sözleri ve eser adlarını (yazı içinde) göstermek için kullanılır." },
      { term: "Yay ayraç ( )", definition: "Cümlenin anlamıyla doğrudan ilgili olmayan, açıklama niteliğindeki sözleri; tiyatro eserlerinde hareketleri; bilgi eksikliğini ya da kuşkuyu belirten soru-ünlem işaretini içine alır." },
    ],
    formulas: [
      { expr: "Ara söz: virgül–virgül ya da kısa çizgi–kısa çizgi", meaning: "\"Annem, yıllarca öğretmenlik yapmış biri olarak, bu konuda çok bilgili.\"" },
      { expr: "Açıklama ve örnek öncesi: iki nokta", meaning: "\"Çantasından üç şey çıkardı: defter, kalem ve silgi.\"" },
      { expr: "Ögeleri virgülle ayrılmış sıralı cümleler arası: noktalı virgül", meaning: "\"Sabah erken kalktık, kahvaltı yaptık; öğleden sonra da yola çıktık.\"" },
      { expr: "Soru eki \"mi\" varsa soru işareti; ama soru anlamı yoksa konmaz", meaning: "\"Güzel mi güzel bir gün.\" cümlesinde soru anlamı olmadığı için soru işareti konmaz." },
      { expr: "Özel adlara gelen çekim ekleri: kesme işareti", meaning: "\"İzmir’e, Yunus Emre’nin\" gibi." },
      { expr: "Kuşku ya da alay: (?) ve (!)", meaning: "Bilinmeyen ya da kuşkulu bilgi (?) ile, alay ya da küçümseme (!) ile ayraç içinde gösterilir." },
    ],
    logic:
      "Noktalama işaretleri konuşmadaki ses tonunu, duraklamayı ve vurguyu yazıya taşır. Konuşurken bir sıralamayı sayarken kısa kısa durursun (virgül), bir açıklamaya geçmeden önce \"şöyle ki\" der gibi beklersin (iki nokta), bir cümleyi yarıda bırakırsın (üç nokta). Bu yüzden bir işareti seçerken cümleyi sesli oku ve konuşmada nasıl bir durak olacağını düşün.\n\nAyrıca her işaretin kendine özgü, başka işaretle karşılanamayan görevleri vardır; sınav çoğu zaman bu özel görevleri sorar.",
    examples: [
      {
        level: 'kolay',
        problem: "\"Bahçede üç tür ağaç vardı ( ) elma, armut ve ceviz.\" cümlesinde ayraçla gösterilen yere hangi işaret gelmelidir?",
        steps: [
          "Ayraçtan önce \"üç tür ağaç\" deniyor; sonrasında bu türler sayılıyor.",
          "Sonraki kısım öncekini açıklıyor, örneklendiriyor.",
          "Açıklama ve örnekten önce iki nokta kullanılır.",
        ],
        answer: "İki nokta (:)",
      },
      {
        level: 'orta',
        problem: "\"Kitaplar, defterler, kalemler( ) hepsi masanın üzerine dağılmıştı.\" cümlesinde ayraçla gösterilen yere hangi işaret gelmelidir?",
        steps: [
          "Virgülle sıralanan ögeler \"hepsi\" sözcüğüyle toparlanıyor.",
          "Toparlayıcı sözden önce sıralanan ögelerden sonra kısa bir durak gerekir.",
          "Burada ögeler toparlayıcı sözle sürdürüldüğü için virgül uygundur.",
        ],
        answer: "Virgül (,)",
      },
    ],
    osymThinking:
      "Sorular çoğunlukla bir cümlede numaralanmış yerlere gelmesi gereken işaretleri seçeneklerde sıralı olarak verir. Bu tür sorularda en emin olduğun yerden başlayıp seçenekleri elemek gerekir. Çeldiriciler, virgül ile noktalı virgülün, iki nokta ile virgülün birbirinin yerine kullanılabildiği sanısına dayanır.",
    commonMistakes: [
      "Ögeleri arasında virgül bulunan sıralı cümleleri virgülle ayırmak (noktalı virgül gerekir).",
      "Soru eki taşıyan ama soru anlamı olmayan cümlelere soru işareti koymak.",
      "Açıklamadan önce virgül kullanmak (iki nokta gerekir).",
      "Yapım eki alan özel adlara kesme işareti koymak.",
    ],
    tips: [
      "Numaralı yer sorularında önce kesin bildiğin tek bir yeri çöz, seçenekleri o yere göre ele.",
      "Cümleyi sesli oku; durak uzunluğu işareti seçmene yardım eder.",
      "Noktalı virgül için \"virgüllü grupları ayırma\" işlevini akılda tut.",
    ],
    summary: [
      "Virgül: sıralama, ara söz, hitap, özneyi belirtme.",
      "Noktalı virgül: virgülle ayrılmış grupları ya da virgüllü sıralı cümleleri ayırır.",
      "İki nokta: açıklama, örnek ve aktarılan sözden önce.",
      "Üç nokta: yarım kalan cümle, söylenmeyen söz, atlanan alıntı.",
      "Tırnak: aktarılan söz; ayraç: açıklama ve kuşku/alay işaretleri.",
    ],
  },

  // ---------------------------------------------------------------- Sözcük Yapısı
  {
    topicId: 'tyttr-sozcuk-yapisi',
    intro:
      "Türkçe eklemeli bir dildir: Sözcüğün köküne ekler eklenerek hem yeni sözcükler türetilir hem de sözcüğün cümledeki görevi belirlenir. \"Göz\" kökünden \"gözlük\", \"gözlükçü\", \"gözlükçüler\" gibi sözcükler oluşur.\n\nBu konuda kök ve gövdeyi bulmayı, yapım eki ile çekim ekini ayırmayı ve sözcükleri yapılarına göre basit, türemiş ve birleşik olarak sınıflandırmayı öğreneceksin. Bu bilgiler sözcük türleri ve fiilimsi konularının da temelidir.",
    prerequisites: [
      "İsim ve fiil kavramlarına genel bakış",
      "Ses bilgisi: ünlü uyumları ve ses olayları",
    ],
    concepts: [
      { term: "Kök", definition: "Sözcüğün anlamlı en küçük, parçalanamayan bölümü. İsim kökü (göz, taş) ya da fiil kökü (gel-, yaz-) olabilir." },
      { term: "Gövde", definition: "Köke yapım eki getirilerek oluşturulan yeni sözcük. Örnek: göz → gözlük, yaz- → yazar." },
      { term: "Yapım eki", definition: "Sözcüğün anlamını ya da türünü değiştirerek yeni sözcük türeten ek. Örnek: -lik, -ci, -la-, -gı." },
      { term: "Çekim eki", definition: "Sözcüğün anlamını değiştirmeden cümledeki görevini belirleyen ek: çoğul, iyelik, hâl, kip ve kişi ekleri. Örnek: evler, evim, evde, geldim." },
      { term: "Basit sözcük", definition: "Yapım eki almamış sözcük; çekim eki alabilir. Örnek: kitaplar, geldi." },
      { term: "Türemiş sözcük", definition: "Köküne en az bir yapım eki almış sözcük. Örnek: bilgi, yolcu, sulamak." },
      { term: "Birleşik sözcük", definition: "İki ya da daha fazla sözcüğün birleşerek yeni bir anlam kazanmasıyla oluşan sözcük. Örnek: hanımeli, kahverengi, çıkagelmek." },
    ],
    formulas: [
      { expr: "Kök + yapım eki = gövde", meaning: "Yapım eki almış her sözcük gövdedir; gövdeye yine yapım eki gelebilir (göz-lük-çü)." },
      { expr: "Sıra: yapım ekleri → çekim ekleri", meaning: "Yapım ekleri köke yakın, çekim ekleri sona yakın yer alır: göz-lük-çü-ler-imiz." },
      { expr: "Çekim eki sözcüğü türemiş yapmaz", meaning: "\"Evlerimizde\" basittir; yalnızca çekim eki almıştır." },
      { expr: "Fiil kökü testi: sonuna \"-mak/-mek\" getir", meaning: "Anlamlı bir fiil oluşuyorsa kök fiildir: \"sev-mek\". \"Göz-mek\" olmadığı için \"göz\" isim köküdür." },
    ],
    logic:
      "Bir sözcüğü parçalara ayırırken sondan başa doğru ekleri tek tek atarsın. Attığın ek sözcüğün anlamını değiştirmiyorsa çekim ekidir; anlamı ya da türü değiştiriyorsa yapım ekidir. Örneğin \"yolcular\"dan \"-lar\"ı atınca yine \"yolcu\" kalır, anlam aynıdır: çekim eki. \"Yolcu\"dan \"-cu\"yu atınca \"yol\" kalır; artık yolculuk yapan kişi değil, bir yer söz konusudur: yapım eki.\n\nBu yöntem aynı zamanda kökün türünü belirlemeyi de sağlar ve sözcük türleri, fiilimsiler gibi konularda sık kullanılır.",
    examples: [
      {
        level: 'kolay',
        problem: "\"Balıkçılar\" sözcüğünü yapısına göre inceleyiniz.",
        steps: [
          "Sondan başla: \"-lar\" çoğul çekim ekidir.",
          "\"Balıkçı\": \"-çı\" isimden isim yapım ekidir (balık → balıkçı).",
          "Kök: \"balık\" (isim kökü). Yapım eki aldığı için sözcük türemiştir.",
        ],
        answer: "balık (kök) + -çı (yapım) + -lar (çekim); türemiş sözcük",
      },
      {
        level: 'orta',
        problem: "\"Sulamak, gözlem, bilgisayar\" sözcüklerini yapı bakımından sınıflandırınız.",
        steps: [
          "\"Sulamak\": su (isim) + -la- (isimden fiil yapım eki) + -mak: türemiş.",
          "\"Gözlem\": gözle- + -m (fiilden isim yapım eki); gözle- de göz + -le-den türemiştir: türemiş.",
          "\"Bilgisayar\": \"bilgi\" ve \"sayar\" birleşerek yeni bir nesneyi karşılar: birleşik.",
        ],
        answer: "Sulamak ve gözlem türemiş; bilgisayar birleşik",
      },
    ],
    osymThinking:
      "Sorular genellikle bir cümledeki altı çizili sözcüklerden hangisinin yapıca ötekilerden farklı olduğunu ya da hangisinin kökünün fiil olduğunu sorar. Çeldiriciler, çekim eki almış basit sözcükleri türemiş gibi gösterir ya da ses olayına uğramış kökü gizler (ağzı → ağız).",
    commonMistakes: [
      "Çok ek almış sözcüğü otomatik olarak türemiş saymak; çekim ekleri sözcüğü türemiş yapmaz.",
      "Ses olayı geçirmiş kökleri tanıyamamak (\"kitabı\" → kitap).",
      "Hem isim hem fiil kökü olabilen sözcüklerde (\"boya\", \"göç\", \"tat\") cümledeki kullanıma bakmamak.",
    ],
    tips: [
      "Sondan başa ekleri at, her adımda anlamın değişip değişmediğini kontrol et.",
      "Kök türü için \"-mak/-mek\" testini kullan.",
    ],
    summary: [
      "Kök: parçalanamayan anlamlı birim; gövde: yapım eki almış kök.",
      "Yapım eki anlamı/türü değiştirir; çekim eki görevi belirler.",
      "Basit: yapım eki yok; türemiş: yapım eki var; birleşik: iki sözcükten yeni anlam.",
    ],
  },

  // ---------------------------------------------------------------- Sözcük Türleri
  {
    topicId: 'tyttr-sozcuk-turleri',
    intro:
      "Bir sözcüğün türü, cümledeki görevine göre belirlenir. \"Güzel\" sözcüğü \"güzel bir gün\"de sıfat, \"Güzeli herkes sever.\"de isim, \"Güzel konuştu.\"da zarftır. Bu yüzden sözcük türleri sorularında ezber değil, cümle içi çözümleme gerekir.\n\nBu konuda isim, sıfat, zamir, zarf, edat, bağlaç ve ünlemleri; sıfatlaşma, adlaşma gibi tür değişimlerini öğreneceksin. TYT’de genellikle altı çizili sözcüklerin türü ya da aynı sözcüğün farklı cümlelerdeki türü sorulur.",
    prerequisites: [
      "Sözcükte yapı: kök, ek, gövde",
      "Cümlede yüklem ve temel ögeleri tanıma",
    ],
    concepts: [
      { term: "İsim (ad)", definition: "Varlıkları, kavramları karşılayan sözcük. Özel-cins, somut-soyut, tekil-çoğul-topluluk olarak sınıflandırılır." },
      { term: "Sıfat (ön ad)", definition: "İsmin önüne gelerek onu niteleyen ya da belirten sözcük. Niteleme sıfatı (kırmızı elma), belirtme sıfatı: işaret (bu ev), sayı (üç kişi), belgisiz (bazı insanlar), soru (hangi kitap)." },
      { term: "Zamir (adıl)", definition: "İsmin yerini tutan sözcük: kişi (ben, sen), dönüşlülük (kendi), işaret (bu, şu, o), belgisiz (biri, hepsi), soru (kim, ne)." },
      { term: "Zarf (belirteç)", definition: "Fiilleri, fiilimsileri, sıfatları ya da başka zarfları niteleyen sözcük: zaman (dün), yer-yön (içeri), durum (hızlı), miktar (çok), soru (nasıl)." },
      { term: "Edat (ilgeç)", definition: "Tek başına anlamı olmayan, başka sözcüklerle birlikte anlam ilişkisi kuran sözcük: gibi, için, ile, kadar, göre, sadece." },
      { term: "Bağlaç", definition: "Eş görevli sözcükleri ya da cümleleri bağlayan sözcük: ve, ama, çünkü, ya da, hem…hem." },
      { term: "Ünlem", definition: "Sevinç, korku, şaşkınlık gibi duyguları ya da seslenmeyi anlatan sözcük: ah, eyvah, hey." },
    ],
    formulas: [
      { expr: "İsmin önünde + niteliyor = sıfat; ismin yerini tutuyor = zamir", meaning: "\"Bu kitap güzel.\" → bu: sıfat. \"Bu güzel.\" → bu: zamir." },
      { expr: "Sıfat + isim düşerse → sıfat adlaşır", meaning: "\"Yaşlılara yer verin.\" → yaşlı (insanlar): isim." },
      { expr: "Fiili niteliyor = zarf", meaning: "\"Hızlı koştu.\" → hızlı: durum zarfı. \"Hızlı araba\" → hızlı: sıfat." },
      { expr: "Çıkarınca cümle anlamı kısmen bozulmuyor + bağlıyor = bağlaç", meaning: "Bağlaçlar cümleyi bağlar; edatlar ise önündeki sözcükle anlam ilişkisi kurar ve çıkarılınca cümle bozulur." },
      { expr: "\"-ca, -ce\" ile türeyen sözcükler çoğunlukla zarf", meaning: "\"Sessizce çıktı.\" → durum zarfı." },
    ],
    logic:
      "Sözcük türleri birer etiket değil, görev tanımıdır. Aynı sözcük farklı bir görevde farklı türe geçer. \"Dün\" sözcüğü \"Dün geldi.\"de fiili zamanca belirttiği için zarf, \"Dünü unut.\"ta ismin görevini üstlendiği için isimdir. Bu yüzden türü belirlerken her zaman \"Bu sözcük cümlede neyi niteliyor, neyin yerini tutuyor, neyi bağlıyor?\" sorusunu sormalısın.\n\nEdat ile bağlaç en sık karıştırılan türlerdir. Bağlaç iki eş görevli unsuru birbirine bağlar; edat ise tek bir sözcükle birlikte anlam kurar. \"Ali ile Veli geldi.\" (ve anlamı: bağlaç) ile \"Ali, otobüs ile geldi.\" (araç anlamı: edat) farkı bu mantığa dayanır.",
    examples: [
      {
        level: 'kolay',
        problem: "\"Bu yıl çok kitap okudum.\" cümlesindeki \"bu\" ve \"çok\" sözcüklerinin türü nedir?",
        steps: [
          "\"Bu yıl\": \"bu\" \"yıl\" ismini işaret yoluyla belirtiyor: işaret sıfatı.",
          "\"Çok kitap\": \"çok\" \"kitap\" isminin miktarını belirtiyor: belgisiz sıfat.",
          "Her iki sözcük de ismin önünde onu belirttiği için sıfattır.",
        ],
        answer: "İkisi de belirtme sıfatı (işaret sıfatı ve belgisiz sıfat)",
      },
      {
        level: 'orta',
        problem: "\"Arkadaşı ile sinemaya gitti.\" ve \"Kalemi ile yazdı.\" cümlelerindeki \"ile\"lerin türünü belirleyiniz.",
        steps: [
          "Birinci cümlede \"ile\"yi \"ve\" yapınca anlam bozulur mu? \"Arkadaşı ve (o) sinemaya gitti\" anlamı taşır; ancak burada \"birlikte\" anlamı öndedir ve yüklem tekildir: edat.",
          "İkinci cümlede \"ile\" araç bildiriyor: \"kalemle yazdı\": edat.",
          "\"İle\" yalnızca iki eş görevli sözü \"ve\" anlamında bağladığında bağlaçtır (\"Annemle babam geldiler.\").",
        ],
        answer: "Her iki cümlede de edat",
      },
    ],
    osymThinking:
      "Sorular genellikle aynı sözcüğü farklı cümlelerde kullanıp hangisinde farklı türde olduğunu sorar ya da altı çizili sözcüklerden hangisinin zarf/sıfat/zamir olduğunu sorar. Çeldiriciler sıfat-zamir ve sıfat-zarf karışıklığından, edat-bağlaç ayrımından üretilir.",
    commonMistakes: [
      "Sözcüğü cümleden bağımsız tanımlamak; \"güzel\"i her yerde sıfat saymak.",
      "İşaret sıfatı ile işaret zamirini ayıramamak; sonrasında isim olup olmadığına bakmamak.",
      "Sıfat ile durum zarfını karıştırmak; niteledği sözcüğün isim mi fiil mi olduğuna bakmamak.",
      "\"De\" bağlacını edat sanmak.",
    ],
    tips: [
      "Önce sözcüğün yanındaki sözcüğe bak: isim varsa sıfat olabilir, fiil varsa zarf olabilir.",
      "Zamirde sözcüğü bir isimle değiştir; cümle bozulmuyorsa zamirdir.",
      "Edat-bağlaç ayrımında \"ve\" testini kullan.",
    ],
    summary: [
      "Tür, cümledeki göreve göre belirlenir.",
      "Sıfat ismi niteler/belirtir; zamir ismin yerini tutar.",
      "Zarf fiili, sıfatı ya da zarfı niteler.",
      "Edat tek sözcükle anlam kurar; bağlaç eş görevli unsurları bağlar.",
      "Sıfatlaşma, adlaşma ve zarflaşma sık sorulan tür geçişleridir.",
    ],
  },

  // ---------------------------------------------------------------- Fiiller
  {
    topicId: 'tyttr-fiiller',
    intro:
      "Fiiller iş, oluş ya da hareket bildiren sözcüklerdir ve Türkçe cümlenin kalbinde yer alır. Bu konu dört alt başlıktan oluşur: fiilde kip ve kişi, ek fiil, fiilimsiler ve fiil çatısı.\n\nKip, fiilin zamanını ya da dilek anlamını gösterir; kişi eki eylemi kimin yaptığını belirtir. Ek fiil, isimleri yüklem yapar ve birleşik zamanlı fiiller oluşturur. Fiilimsiler, fiilden türeyip isim, sıfat ya da zarf görevi üstlenen sözcüklerdir. Fiil çatısı ise fiilin nesne ve özneyle ilişkisini inceler. TYT’de bu dört alandan dönüşümlü olarak soru gelir.",
    prerequisites: [
      "Sözcükte yapı: kök, yapım ve çekim ekleri",
      "Sözcük türleri: isim, sıfat, zarf",
      "Cümlenin ögeleri: özne ve nesne",
    ],
    concepts: [
      { term: "Haber (bildirme) kipleri", definition: "Eylemin zamanını bildirir: görülen geçmiş (-dı), öğrenilen geçmiş (-mış), şimdiki zaman (-yor), gelecek zaman (-ecek), geniş zaman (-r)." },
      { term: "Dilek kipleri", definition: "Eylemi bir dilek, istek, gereklilik ya da şart olarak bildirir: istek (-e), gereklilik (-meli), dilek-şart (-se), emir." },
      { term: "Ek fiil", definition: "İsim soylu sözcükleri yüklem yapan (öğrenciyim, evdeydi) ve basit zamanlı fiillerden birleşik zamanlı fiil oluşturan (geliyordu, gelmişti) ek eylem: -dı, -mış, -sa, -dır." },
      { term: "İsim-fiil", definition: "Fiillere -ma, -ış, -mak ekleri getirilerek yapılan, isim görevinde kullanılan fiilimsi. Örnek: \"Okumayı sever.\"" },
      { term: "Sıfat-fiil", definition: "Fiillere -an, -ası, -mez, -ar, -dik, -ecek, -miş eklerinin getirilmesiyle oluşan, sıfat görevindeki fiilimsi. Örnek: \"koşan çocuk\"." },
      { term: "Zarf-fiil", definition: "Fiillere -ip, -erek, -ince, -dıkça, -meden, -e…-e gibi ekler getirilerek yapılan, zarf görevindeki fiilimsi. Örnek: \"Gülerek anlattı.\"" },
      { term: "Geçişli / geçişsiz fiil", definition: "Nesne alabilen fiil geçişli (\"neyi?\" sorusuna cevap verir: okumak), alamayan geçişsizdir (uyumak)." },
      { term: "Etken / edilgen fiil", definition: "Öznesi belli olan fiil etken (\"Ali camı kırdı.\"), öznesi belli olmayıp eylemden etkilenen sözün sözde özne olduğu fiil edilgendir (\"Cam kırıldı.\")." },
    ],
    formulas: [
      { expr: "Kip kayması: bir kipin başka kip anlamında kullanılması", meaning: "\"Yarın okula gidiyorum.\" → şimdiki zaman kipiyle gelecek zaman anlatılır." },
      { expr: "Fiilimsi ≠ yüklem (çekimli değildir)", meaning: "Fiilimsiler kip ve kişi eki almaz, cümlede yan cümlecik kurar. \"Gelen misafir\" çekimsiz, \"Misafir geldi.\" çekimlidir." },
      { expr: "Edilgen: -l-, -n- (+ öznesi belirsiz)", meaning: "\"Kapı açıldı.\" Kim açtı belli değil. -l-/-n- eki alıp özne kendi üzerine yapıyorsa dönüşlüdür (\"Yıkandı.\" kendini yıkadı)." },
      { expr: "İşteş: -ş- (karşılıklı ya da birlikte)", meaning: "\"Bakıştılar\" (karşılıklı), \"Kuşlar ötüştü\" (birlikte)." },
      { expr: "Ek fiil dört biçim: -dı (hikâye), -mış (rivayet), -sa (şart), -dır (geniş zaman)", meaning: "\"Hastaydı, hastaymış, hastaysa, hastadır.\"" },
    ],
    logic:
      "Fiil sorularında temel soru şudur: \"Bu sözcük çekimli mi, çekimsiz mi?\" Çekimli fiil kip ve kişi eki alarak bir yargı bildirir; cümlenin yüklemi olur. Çekimsiz fiil (fiilimsi) ise yargı bildirmez, bir başka sözcüğe isim, sıfat ya da zarf olarak hizmet eder. Bu ayrım yapıldığında fiilimsiler ve cümle türleri konuları kolaylaşır.\n\nÇatıda ise fiilin nesneyle ilişkisini ve özneyle ilişkisini ayrı ayrı değerlendirirsin: \"Neyi/kimi?\" sorusuna cevap veriyor mu (geçişlilik), eylemi yapan belli mi (etken-edilgen), eylem kendine mi dönüyor (dönüşlü), karşılıklı mı yapılıyor (işteş)? Sınav çoğu zaman edilgen ile dönüşlüyü karıştırmaya dayanır; iki çatı da aynı ekleri alabilir, fark anlamdadır.",
    examples: [
      {
        level: 'kolay',
        problem: "\"Kitabı bitirince bana haber verir misin?\" cümlesindeki fiilimsiyi ve türünü bulunuz.",
        steps: [
          "\"Bitirince\": \"bitir-\" fiiline \"-ince\" eki gelmiştir.",
          "Çekimli değildir, yargı bildirmez; \"ne zaman haber verir?\" sorusuna cevap verir.",
          "\"-ince\" zarf-fiil ekidir.",
        ],
        answer: "bitirince: zarf-fiil",
      },
      {
        level: 'orta',
        problem: "\"Eski köprü geçen yıl onarıldı.\" cümlesindeki yüklemin çatısını belirleyiniz.",
        steps: [
          "Yüklem: \"onarıldı\" (onar- + -ıl- + -dı).",
          "Kim onardı belli değil; \"köprü\" eylemi yapmıyor, eylemden etkileniyor: sözde özne.",
          "Özneye göre edilgen; edilgen fiiller nesne almaz, geçişsizdir.",
        ],
        answer: "Edilgen çatılı, geçişsiz",
      },
      {
        level: 'zor',
        problem: "\"Çocukken bu parkta saatlerce oynardık.\" cümlesindeki yüklemin zaman özelliği nedir?",
        steps: [
          "Yüklem: \"oynardık\" = oyna- + -r (geniş zaman) + -dı (ek fiil, hikâye) + -k (kişi).",
          "Basit zamana ek fiilin hikâye (-dı) biçimi eklenmiştir: birleşik zaman.",
          "Geniş zamanın hikâyesi, geçmişte alışkanlık hâline gelmiş eylemleri anlatır.",
        ],
        answer: "Geniş zamanın hikâyesi (birleşik zamanlı fiil)",
      },
    ],
    osymThinking:
      "Fiilimsi sorularında çeldiriciler, fiilimsi ekleriyle aynı biçimdeki çekim eklerinden gelir: \"-mış\" hem öğrenilen geçmiş kipi hem sıfat-fiil eki olabilir. Çatı sorularında edilgen-dönüşlü karışıklığı, kip sorularında kip kayması sorulur. Ek fiil sorularında isim soylu yüklemler ve birleşik zamanlar ölçülür.",
    commonMistakes: [
      "\"-mış\"ı her yerde öğrenilen geçmiş zaman sanmak (\"pişmiş yemek\"te sıfat-fiildir).",
      "Kalıcı isim olmuş fiilimsileri fiilimsi saymak (\"dondurma, çakmak, yazı\").",
      "Edilgen ile dönüşlüyü karıştırmak; \"-n-\" eki gördüğü her fiili dönüşlü saymak.",
      "Ek fiilin olumsuzunun \"değil\" ile yapıldığını unutmak.",
    ],
    tips: [
      "Fiilimsi olup olmadığını anlamak için sözcüğün kip-kişi eki taşıyıp taşımadığına bak.",
      "Edilgenlik için \"… tarafından\" sözünü eklemeyi dene; anlamlıysa edilgendir.",
      "Birleşik zamanda önce basit kipi, sonra ek fiil biçimini ayır.",
    ],
    summary: [
      "Haber kipleri zamanı, dilek kipleri isteği/şartı/gerekliliği bildirir.",
      "Ek fiil isimleri yüklem yapar ve birleşik zaman kurar.",
      "Fiilimsiler: isim-fiil, sıfat-fiil, zarf-fiil; çekimsizdir.",
      "Çatı: nesneye göre geçişli-geçişsiz; özneye göre etken, edilgen, dönüşlü, işteş.",
      "Kip kayması: bir kipin başka kipin anlamını üstlenmesi.",
    ],
  },

  // ---------------------------------------------------------------- Cümlenin Ögeleri
  {
    topicId: 'tyttr-cumlenin-ogeleri',
    intro:
      "Cümlenin ögeleri; yüklem, özne, nesne, dolaylı tümleç ve zarf tümlecidir. Öge bulmak, cümleye doğru soruları sırayla sormaktır. Önce yüklem bulunur, sonra bütün sorular yükleme yöneltilir.\n\nBu konuda gizli özneyi, belirtili ve belirtisiz nesneyi, dolaylı tümleç ile zarf tümlecini ayırt etmeyi öğreneceksin. Öge çözümlemesi anlatım bozukluğu konusunun da temelini oluşturur: Öge eksikliği ve özne-yüklem uyumsuzluğu bu bilgiyle anlaşılır.",
    prerequisites: [
      "Sözcük türleri (özellikle isim, zarf ve fiilimsi)",
      "Hâl ekleri: -ı, -e, -de, -den",
    ],
    concepts: [
      { term: "Yüklem", definition: "Cümlede yargı bildiren, çekimli fiil ya da ek fiil almış isim olan temel öge." },
      { term: "Özne", definition: "Yüklemin bildirdiği işi yapan ya da oluş içinde bulunan öge; \"kim/ne + yüklem?\" sorusuyla bulunur. Kişi ekinden anlaşılan özne gizli öznedir." },
      { term: "Belirtili nesne", definition: "Yüklemin etkilediği, belirtme hâl eki (-ı) alan öge; \"neyi/kimi?\" sorusuyla bulunur." },
      { term: "Belirtisiz nesne", definition: "Hâl eki almamış nesne; \"ne?\" sorusuyla bulunur. Örnek: \"Kitap okudu.\"" },
      { term: "Dolaylı tümleç", definition: "Yönelme (-e), bulunma (-de) ya da ayrılma (-den) hâl eki alan ve \"nereye, nerede, nereden, kime, kimde, kimden\" sorularına cevap veren öge." },
      { term: "Zarf tümleci", definition: "Yüklemi zaman, durum, miktar, yön, neden, araç gibi yönlerden tamamlayan öge; \"ne zaman, nasıl, ne kadar, niçin\" sorularına cevap verir." },
    ],
    formulas: [
      { expr: "1. Yüklemi bul → 2. \"kim/ne?\" → 3. \"neyi/ne?\" → 4. \"nereye/nerede/nereden?\" → 5. \"nasıl/ne zaman/niçin?\"", meaning: "Soruları hep yükleme yönelt; yüklemi sormadan soru sorma." },
      { expr: "Söz öbeği bölünmez", meaning: "\"Annemin aldığı kitabı\" tek bir nesnedir; tamlama ve fiilimsi grupları tek öge sayılır." },
      { expr: "Edilgen yüklem → sözde özne", meaning: "\"Cam kırıldı.\" → cam: sözde özne; edilgen yüklemli cümlede nesne bulunmaz." },
      { expr: "-e/-de/-den eki alan + \"nereye/nerede/nereden\" = dolaylı tümleç", meaning: "Ancak \"sabahleyin, akşama doğru\" gibi zaman bildiren gruplar zarf tümlecidir." },
    ],
    logic:
      "Yüklem, cümlenin çekirdeğidir: Bütün ögeler, yüklemin bildirdiği yargıyı tamamlamak için vardır. Bu yüzden her ögeyi \"yükleme sorulan soru\" ile buluruz. Soruyu yüklemsiz sormak (\"ne?\" diye tek başına sormak) karışıklığa yol açar; örneğin \"kitap\" hem özne hem nesne olabilir, hangisi olduğunu yüklemle kurulan soru belirler.\n\nSöz öbekleri de bir bütün olarak soruya cevap verir: \"Dün gece aldığım haber beni çok sevindirdi.\" cümlesinde \"dün gece aldığım haber\" tek bir öznedir; \"dün gece\" ayrı bir zarf tümleci değildir, çünkü yükleme değil, \"aldığım\" sıfat-fiiline bağlıdır.",
    examples: [
      {
        level: 'kolay',
        problem: "\"Öğretmen, sınav kâğıtlarını öğrencilere dağıttı.\" cümlesinin ögelerini bulunuz.",
        steps: [
          "Yüklem: \"dağıttı\".",
          "\"Dağıtan kim?\" → \"Öğretmen\": özne.",
          "\"Neyi dağıttı?\" → \"sınav kâğıtlarını\": belirtili nesne.",
          "\"Kime dağıttı?\" → \"öğrencilere\": dolaylı tümleç.",
        ],
        answer: "Özne + belirtili nesne + dolaylı tümleç + yüklem",
      },
      {
        level: 'orta',
        problem: "\"Yıllardır görmediği arkadaşını istasyonda heyecanla bekledi.\" cümlesinin ögelerini sırasıyla bulunuz.",
        steps: [
          "Yüklem: \"bekledi\". Özne kişi ekinden anlaşılıyor: gizli özne (o).",
          "\"Kimi bekledi?\" → \"yıllardır görmediği arkadaşını\": belirtili nesne (söz öbeği bölünmez).",
          "\"Nerede bekledi?\" → \"istasyonda\": dolaylı tümleç.",
          "\"Nasıl bekledi?\" → \"heyecanla\": zarf tümleci.",
        ],
        answer: "Belirtili nesne + dolaylı tümleç + zarf tümleci + yüklem (özne gizli)",
      },
    ],
    osymThinking:
      "Sorular genellikle bir cümlenin öge dizilişini seçeneklerde verir ya da hangi cümlede belli bir ögenin bulunmadığını sorar. Çeldiriciler, söz öbeklerini bölmeye ve \"-de/-den\" ekli zaman bildiren sözleri dolaylı tümleç sanmaya dayanır. Özne sorularında gizli özne ile sözde özne ayrımı da sık kullanılır.",
    commonMistakes: [
      "Tamlamaları ya da fiilimsi gruplarını bölerek iki ayrı öge saymak.",
      "Belirtisiz nesneyi özneyle karıştırmak (\"Çocuklar top oynuyor.\" → top: belirtisiz nesne).",
      "Zaman bildiren \"-de\" ekli sözü dolaylı tümleç sanmak (\"Sabahleyin, akşamüstü\" zarf tümlecidir).",
      "Soruyu yüklemsiz sormak.",
    ],
    tips: [
      "Soruyu her zaman yüklemle birlikte sor: \"Kim bekledi?\", \"Neyi bekledi?\"",
      "Cümle dışı unsurlar (hitap, ünlem, bağlaç) öge sayılmaz.",
    ],
    summary: [
      "Önce yüklem, sonra özne, nesne, dolaylı tümleç ve zarf tümleci.",
      "Söz öbekleri bölünmez, tek öge sayılır.",
      "Belirtili nesne -ı eki alır; belirtisiz nesne ek almaz.",
      "Edilgen yüklemde sözde özne vardır, nesne yoktur.",
    ],
  },

  // ---------------------------------------------------------------- Cümle Türleri
  {
    topicId: 'tyttr-cumle-turleri',
    intro:
      "Cümleler dört ölçüte göre sınıflandırılır: yüklemin türüne göre (isim–fiil cümlesi), yüklemin yerine göre (kurallı–devrik), anlamına göre (olumlu–olumsuz, soru, ünlem) ve yapısına göre (basit, birleşik, sıralı, bağlı). Bir cümle bu dört ölçütün her birinden bir özellik taşır.\n\nTYT’de en çok sorulan ayrımlar; birleşik cümle ile basit cümlenin ayrımı, anlamca olumlu–yapıca olumsuz cümleler ve isim–fiil cümlesi ayrımıdır.",
    prerequisites: [
      "Cümlenin ögeleri, özellikle yüklem",
      "Fiiller: fiilimsi ve ek fiil",
    ],
    concepts: [
      { term: "Fiil cümlesi / isim cümlesi", definition: "Yüklemi çekimli fiil olan cümle fiil cümlesi (\"Eve geldi.\"), yüklemi ek fiil almış isim soylu sözcük olan cümle isim cümlesidir (\"Hava soğuktu.\")." },
      { term: "Kurallı / devrik cümle", definition: "Yüklemi sonda olan cümle kurallı, yüklemi sonda olmayan cümle devriktir. Yüklemi olmayan cümle eksiltili cümledir." },
      { term: "Basit cümle", definition: "Tek yargı bildiren, içinde fiilimsi ya da iç içe cümle bulunmayan cümle." },
      { term: "Birleşik cümle", definition: "Bir temel cümle ile ona bağlı yan cümlecik(ler)den oluşan cümle: fiilimsili, şartlı, iç içe, ki’li birleşik cümle." },
      { term: "Sıralı cümle", definition: "Birbirine virgül ya da noktalı virgülle bağlanmış, bağımsız yargılardan oluşan cümle." },
      { term: "Bağlı cümle", definition: "Bağımsız yargıların bağlaçla birbirine bağlandığı cümle." },
    ],
    formulas: [
      { expr: "Fiilimsi varsa → birleşik cümle", meaning: "\"Okulu bitirince iş aradı.\" → \"bitirince\" zarf-fiili yan cümlecik kurar." },
      { expr: "-se şart eki ile kurulan yan cümle → şartlı birleşik", meaning: "\"Çalışırsan kazanırsın.\"" },
      { expr: "Anlamca olumsuzluk ≠ yapıca olumsuzluk", meaning: "\"Gelmez değil.\" yapıca olumsuz, anlamca olumludur. \"Ne geldi ne aradı.\" yapıca olumlu, anlamca olumsuzdur." },
      { expr: "Soru eki soru anlamı katmayabilir", meaning: "\"Güzel mi güzel!\" soru cümlesi değildir; pekiştirme anlamı taşır." },
    ],
    logic:
      "Cümle türlerini belirlemede anahtar, yargı sayısını ve yargılar arasındaki bağlılık ilişkisini görmektir. Birleşik cümlede yan cümle tek başına ayakta duramaz; temel cümleye bağımlıdır. Sıralı ve bağlı cümlelerde ise her yargı kendi başına bir cümle olabilir; yalnızca yan yana getirilmiştir.\n\nAnlam ve yapı ayrımında ise görünüşe değil, iletilen yargıya bakılır. \"Ne … ne …\" bağlacı olumsuz ek taşımadığı hâlde yargıyı olumsuzlar; \"-mez değil\" yapısı iki olumsuzluğu birleştirerek olumlu anlam kurar.",
    examples: [
      {
        level: 'kolay',
        problem: "\"Pencereyi açınca içeri serin bir rüzgâr doldu.\" cümlesini yapısına göre sınıflandırınız.",
        steps: [
          "Yüklem: \"doldu\" → temel cümle.",
          "\"Açınca\" zarf-fiildir; \"pencereyi açınca\" yan cümlecik oluşturur.",
          "Fiilimsi içerdiği için birleşik cümledir.",
        ],
        answer: "Birleşik (fiilimsili) cümle",
      },
      {
        level: 'orta',
        problem: "\"Onun bu işi başaramayacağını düşünmüyorum.\" cümlesi anlamca olumlu mudur?",
        steps: [
          "Yüklem \"düşünmüyorum\" yapıca olumsuzdur.",
          "\"Başaramayacağını\" da olumsuzluk taşır.",
          "\"Başaramayacağını düşünmüyorum\" = \"başaracağını düşünüyorum\" anlamı taşır.",
        ],
        answer: "Anlamca olumludur; yapıca olumsuzdur.",
      },
    ],
    osymThinking:
      "Sorular bir cümlenin dört özelliğini seçeneklerde bir arada verir ve hangisinin yanlış olduğunu ya da hangi cümlenin belli özellikleri taşıdığını sorar. Çeldiriciler; fiilimsiyi gözden kaçırıp birleşik cümleyi basit saydırmaya, yapıca olumsuzluğu anlamca olumsuz saydırmaya ve ek fiilli yüklemleri fiil cümlesi saydırmaya dayanır.",
    commonMistakes: [
      "Yüklemi \"-dı\" ek fiili alan isim cümlesini fiil cümlesi sanmak (\"Hava güzeldi.\" isim cümlesidir).",
      "Fiilimsi içeren cümleyi basit cümle saymak.",
      "\"Ne … ne\" bağlaçlı cümleyi anlamca olumlu saymak.",
    ],
    tips: [
      "Yüklemin son sözcüğüne bak: kökü fiilse fiil cümlesi, isimse isim cümlesi.",
      "Yapı sorularında önce fiilimsi ve \"-se\" eki ara.",
    ],
    summary: [
      "Yüklemin türüne göre: isim ve fiil cümlesi.",
      "Yüklemin yerine göre: kurallı, devrik, eksiltili.",
      "Anlamına göre: olumlu, olumsuz, soru, ünlem.",
      "Yapısına göre: basit, birleşik, sıralı, bağlı.",
    ],
  },

  // ---------------------------------------------------------------- Anlatım Bozukluğu
  {
    topicId: 'tyttr-anlatim-bozuklugu',
    intro:
      "Anlatım bozukluğu, bir cümlenin açık, anlaşılır ve dil bilgisi kurallarına uygun olmamasıdır. Bozukluk iki kaynaktan doğar: anlamdan ya da yapıdan. \"Tahminen yaklaşık yüz kişi geldi.\" cümlesinde aynı anlamı taşıyan iki sözcük gereksiz yere kullanılmıştır; \"Bu kararı hem destekliyor hem de karşı çıkıyorum.\" cümlesinde ise \"destekliyor\" ile \"karşı çıkıyorum\" aynı nesneyi farklı hâl ekleriyle istediği için yapı bozulmuştur.\n\nBu konuda gereksiz sözcük, yanlış anlamda sözcük kullanımı, mantık ve sıralama hatası, özne-yüklem uyumsuzluğu, öge eksikliği ve ek hatası gibi bozuklukları tanıyıp düzeltmeyi öğreneceksin.",
    prerequisites: [
      "Cümlenin ögeleri",
      "Sözcükte anlam ve cümlede anlam",
      "Fiil çatısı ve sözcük türleri",
    ],
    concepts: [
      { term: "Gereksiz sözcük", definition: "Anlamı başka bir sözcükte zaten bulunan sözün kullanılması. Örnek: \"Geri iade etti.\" (iade = geri verme)." },
      { term: "Sözcüğün yanlış anlamda kullanılması", definition: "Sözcüğün bağlama uymayan anlamda kullanılması. Örnek: \"Bu ilaç ağrıyı tamamen giderdi, çok etkin bir yöntem.\" gibi yerlerde \"etkili/etkin\" karışıklığı." },
      { term: "Mantık hatası", definition: "Cümlede birbiriyle çelişen ya da akla aykırı yargılar bulunması. Örnek: \"Kesinlikle gelebilir.\" (kesinlik ile olasılık çelişir)." },
      { term: "Özne-yüklem uyumsuzluğu", definition: "Öznenin kişi ya da sayı bakımından yüklemle uyuşmaması; ya da ortak yüklemin öznelerden birine uymaması." },
      { term: "Öge eksikliği", definition: "Ortak kullanılan bir ögenin cümlelerden birine uymaması; genellikle nesne ya da dolaylı tümleç eksikliği. Örnek: \"Sorunlarını dinledi ve yardım etti.\" (\"sorunlarına yardım etti\" olmaz; \"ona\" eksik)." },
      { term: "Çatı uyuşmazlığı", definition: "Bağlaçla birleşen yüklemlerden birinin etken, ötekinin edilgen olması. Örnek: \"Ekip toplandı ve kararlar alındı.\" gibi yapılar bu açıdan dikkatle incelenir." },
    ],
    formulas: [
      { expr: "Aynı anlam ikiye katlanıyorsa → gereksiz sözcük", meaning: "\"Yaklaşık … kadar\", \"en son … sonunda\", \"karşılıklı … birbirine\", \"tahminen … yaklaşık\"." },
      { expr: "Ortak öge + farklı hâl eki isteyen yüklemler → öge/ek eksikliği", meaning: "\"Bu kararı hem destekliyor hem de karşı çıkıyorum.\" → \"Bu karara hem destek veriyor hem de karşı çıkıyorum.\" gibi düzeltilir." },
      { expr: "Kesinlik + olasılık birlikte → mantık hatası", meaning: "\"Mutlaka … olabilir\", \"kesinlikle … belki\"." },
      { expr: "Sıfat ya da zarfın yeri → anlam belirsizliği", meaning: "\"Genç öğretmenin kızı\": genç olan öğretmen mi, kız mı? Virgül ya da sözcük yeri anlamı netleştirir." },
      { expr: "Tamlama eksikliği → iyelik/ilgi eki kontrolü", meaning: "\"Okulun bahçe ve sınıfları\" gibi yapılarda \"okulun bahçesi ve sınıfları\" denmelidir." },
    ],
    logic:
      "Anlatım bozukluğu sorularının arkasında iki basit ilke vardır: Her söz bir işe yarar ve her öge bütün yüklemlere uymalıdır. Birincisi anlamsal bozuklukları (gereksiz sözcük, mantık hatası, yanlış anlamda sözcük) yakalamayı; ikincisi yapısal bozuklukları (öge eksikliği, özne-yüklem uyumsuzluğu, ek hatası, çatı uyuşmazlığı) yakalamayı sağlar.\n\nYapısal bozukluklarda en işe yarar yöntem ortak ögeyi her yüklemle ayrı ayrı okumaktır. \"Öğrencilere ders anlattı ve sorular sordu\" cümlesinde \"öğrencilere anlattı\" ve \"öğrencilere sordu\" ikisi de uyduğu için bozukluk yoktur. Ancak \"Arkadaşlarını çok sever ve güvenir.\" cümlesinde \"arkadaşlarını güvenir\" olmadığı için \"arkadaşlarına\" dolaylı tümleci eksiktir.\n\nAnlamsal bozukluklarda ise her sözcüğü çıkarıp \"anlam değişti mi?\" diye sor. Çıkardığın sözcük anlamı hiç değiştirmiyorsa gereksizdir. İki yargı birbirini dışlıyorsa mantık hatasıdır.",
    examples: [
      {
        level: 'kolay',
        problem: "\"Toplantıya yaklaşık elli kadar kişi katıldı.\" cümlesindeki bozukluğu bulunuz.",
        steps: [
          "\"Yaklaşık\" kesin olmayan bir sayı bildirir.",
          "\"Kadar\" da aynı yaklaşıklık anlamını taşır.",
          "Aynı anlam iki kez verildiği için biri gereksizdir.",
        ],
        answer: "Gereksiz sözcük: \"yaklaşık\" ya da \"kadar\" çıkarılmalıdır.",
      },
      {
        level: 'orta',
        problem: "\"Komşumuz bahçesine her yıl özen gösterir ve yeni çiçekler diker.\" cümlesinde bozukluk var mıdır?",
        steps: [
          "Ortak ögeleri her yüklemle ayrı oku: \"Komşumuz bahçesine özen gösterir.\" uygun.",
          "\"Komşumuz bahçesine yeni çiçekler diker.\" → \"bahçesine diker\" de anlamlıdır (nereye?).",
          "Her iki yüklem de ortak ögeye uyduğundan bozukluk yoktur.",
        ],
        answer: "Bozukluk yoktur.",
      },
      {
        level: 'zor',
        problem: "\"Yeni kütüphane hem öğrencilerin hem de mahalle sakinlerinin ihtiyacını karşılayacak ve büyük ilgi göreceği düşünülüyor.\" cümlesini düzeltiniz.",
        steps: [
          "İki yargı \"ve\" ile bağlanmış: \"Kütüphane ihtiyacı karşılayacak\" ve \"(kütüphanenin) büyük ilgi göreceği düşünülüyor\".",
          "İkinci yargı \"göreceği düşünülüyor\" biçiminde bir yan cümle olarak kurulmuş; ilk yüklem ise çekimli bir yüklemdir. Yapılar birbirine denk değildir.",
          "Ayrıca \"göreceği\" sıfat-fiili, özne olarak \"kütüphanenin\" ilgi hâlini ister; ortak özne \"kütüphane\" bu ekle uyuşmaz.",
          "Düzeltme: \"Yeni kütüphanenin hem öğrencilerin hem de mahalle sakinlerinin ihtiyacını karşılayacağı ve büyük ilgi göreceği düşünülüyor.\"",
        ],
        answer: "Yapı bozukluğu (özne-yüklem ve yan cümle uyuşmazlığı); iki yargı aynı yapıyla kurulmalıdır.",
      },
    ],
    osymThinking:
      "Sorular genellikle beş cümle verip \"hangisinde anlatım bozukluğu vardır\" ya da bir cümledeki bozukluğun kaynağını sorar. Bazı sorularda numaralanmış cümlelerden hangisinin bozuk olduğu ya da bozukluğun hangi sözcüğün çıkarılmasıyla/değiştirilmesiyle giderileceği sorulur. Çeldiriciler, bozuk görünen ama doğru olan cümlelerdir; özellikle ortak ögesi iki yükleme de uyan cümleler öğrenciyi yanıltır.",
    commonMistakes: [
      "Ortak ögeyi yüklemlerle tek tek okumadan cümleyi doğru ya da yanlış sanmak.",
      "Uzun ya da karmaşık görünen cümleyi otomatik olarak bozuk saymak.",
      "Eş anlamlı iki sözcüğün bir arada kullanıldığını fark etmemek (\"geri iade\", \"ileri sürmek öne\").",
      "Özneleri farklı sayıda olan sıralı cümlelerde yüklem uyumunu kontrol etmemek.",
      "Anlam belirsizliği yaratan virgül eksikliğini gözden kaçırmak.",
    ],
    tips: [
      "Ortak ögeyi her yüklemle ayrı ayrı oku; uymayan birleşimi bul.",
      "Her sözcüğü çıkarıp anlamın değişip değişmediğini test et.",
      "Kesinlik ve olasılık sözlerinin aynı cümlede bulunup bulunmadığına bak.",
    ],
    summary: [
      "Anlamsal bozukluklar: gereksiz sözcük, yanlış anlamda sözcük, mantık ve sıralama hatası, anlam belirsizliği.",
      "Yapısal bozukluklar: özne-yüklem uyumsuzluğu, öge eksikliği, ek eksikliği/yanlışlığı, çatı uyuşmazlığı.",
      "Ortak öge her yükleme uymalıdır.",
      "Çıkardığında anlamı değiştirmeyen sözcük gereksizdir.",
    ],
  },
];
