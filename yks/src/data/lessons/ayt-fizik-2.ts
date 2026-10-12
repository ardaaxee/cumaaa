import type { LessonSeed } from '../../domain/types';

export const lessons: LessonSeed[] = [
  {
    topicId: "aytfiz-elektriksel-kuvvet-alan",
    intro:
      "Elektrik yüklü iki cisim birbirine dokunmadan kuvvet uygular: aynı işaretli yükler iter, zıt işaretli yükler çeker. Bu etkileşimin büyüklüğünü Coulomb yasası verir ve kütle çekim yasasına çok benzer; tek fark yüklerin işaretinin kuvvetin yönünü belirlemesidir.\n\nAYT’de bu konu iki katmanda sorulur. İlk katman kuvvettir: iki ya da üç noktasal yük arasındaki kuvvetleri bulup vektörel olarak toplarsın. İkinci katman elektrik alandır: bir yükün çevresindeki uzaya kazandırdığı özelliktir ve oraya konan +1 C’luk deneme yüküne etki eden kuvvet olarak tanımlanır.\n\nAlan kavramı sayesinde soruyu \"hangi yük kime ne kadar kuvvet uygular\" yerine \"bu noktada alan ne kadar ve hangi yönde\" diye düşünebilirsin. Düzgün elektrik alanda ise yüklü parçacık sabit kuvvet, dolayısıyla sabit ivme kazanır; bu da hareketi TYT’den bildiğin kinematiğe (yatay atış benzeri) dönüştürür.",
    prerequisites: [
      "Vektörlerin toplanması, bileşenlere ayırma ve paralelkenar kuralı",
      "Newton’un ikinci yasası (F = m·a) ve sabit ivmeli hareket denklemleri",
      "Yük, iletken–yalıtkan ve dokunma ile elektriklenme (TYT elektrostatik)",
      "Bilimsel gösterim ve üslü sayılarla işlem (μC = 10⁻⁶ C)",
    ],
    concepts: [
      { term: "Noktasal yük", definition: "Boyutları, aralarındaki uzaklığın yanında ihmal edilebilen yüklü cisim." },
      { term: "Coulomb kuvveti", definition: "İki noktasal yük arasındaki elektriksel kuvvet; yüklerin çarpımıyla doğru, uzaklığın karesiyle ters orantılıdır." },
      { term: "Elektrik alan (E)", definition: "Bir noktaya konan birim pozitif yüke etki eden elektriksel kuvvet; vektörel büyüklüktür, birimi N/C (ya da V/m)." },
      { term: "Alan çizgileri", definition: "Pozitif yükten çıkıp negatif yüke giren, teğeti alan yönünü, sıklığı alan şiddetini gösteren hayalî çizgiler; birbirini kesmez." },
      { term: "Düzgün elektrik alan", definition: "Her noktada büyüklüğü ve yönü aynı olan alan; birbirine paralel, eşit aralıklı çizgilerle gösterilir (ör. yüklü paralel levhalar arası)." },
      { term: "Bileşke alan", definition: "Birden çok yükün bir noktada oluşturduğu alanların vektörel toplamı (üst üste binme ilkesi)." },
    ],
    formulas: [
      { expr: "F = k·q₁·q₂ / d²", meaning: "Coulomb yasası; k = 9·10⁹ N·m²/C². Yükler mutlak değerle konur, yön işaretten belirlenir." },
      { expr: "E = k·q / d²", meaning: "Noktasal yükün d uzaklıkta oluşturduğu alanın büyüklüğü; + yükte dışa, − yükte içe doğrudur." },
      { expr: "F = q·E", meaning: "Alan içindeki yüke etki eden kuvvet; + yükte E ile aynı, − yükte zıt yönde." },
      { expr: "a = q·E / m", meaning: "Düzgün alanda yüklü parçacığın sabit ivmesi." },
      { expr: "E_bileşke = E₁ + E₂ + … (vektörel)", meaning: "Üst üste binme: her yükün alanı ayrı bulunur, sonra vektörel toplanır." },
      { expr: "Eşit iki alan arası açı 60° ise E_R = √3·E; 120° ise E_R = E", meaning: "Eşkenar üçgen sorularında sık kullanılan kısayol." },
    ],
    logic:
      "Kuvvetin uzaklığın karesiyle azalması geometrik bir sonuçtur: yükün etkisi her yöne eşit yayılır ve d uzaklıktaki küre yüzeyinin alanı 4πd² ile büyür. Aynı \"etki\" iki kat uzakta dört kat büyük yüzeye dağıldığı için şiddet dörtte birine düşer.\n\nAlan kavramı, kuvveti deneme yükünden bağımsız hâle getirir. E = F/q tanımında q ne olursa olsun oran aynı kalır; bu yüzden alan yalnızca kaynağa ve konuma bağlıdır. Yükü değiştirince kuvvet değişir ama alan değişmez.\n\nBileşke alanın sıfır olduğu noktayı ararken mantık şudur: iki alanın hem eşit büyüklükte hem zıt yönde olması gerekir. Aynı işaretli yüklerde zıt yön ancak iki yükün arasında, zıt işaretlilerde ise dışarıda ve küçük yüke yakın tarafta sağlanır.",
    examples: [
      {
        level: "kolay",
        problem: "+3 μC ve +12 μC’luk iki noktasal yük arasındaki uzaklık 30 cm’dir. Aralarındaki kuvvetin büyüklüğü ve türü nedir?",
        steps: [
          "d = 0,3 m, d² = 0,09 m².",
          "F = 9·10⁹ · 3·10⁻⁶ · 12·10⁻⁶ / 0,09 = 3,6 N.",
          "Yükler aynı işaretli olduğundan kuvvet iticidir.",
        ],
        answer: "3,6 N, itme",
      },
      {
        level: "orta",
        problem: "60 cm arayla duran +4 μC ve −2 μC’luk yüklerin tam orta noktasındaki bileşke alan nedir?",
        steps: [
          "Orta noktanın her yüke uzaklığı 0,3 m.",
          "E₁ = 9·10⁹·4·10⁻⁶/0,09 = 4·10⁵ N/C, + yükten dışa, yani − yüke doğru.",
          "E₂ = 9·10⁹·2·10⁻⁶/0,09 = 2·10⁵ N/C, − yüke doğru.",
          "İki alan aynı yönde olduğundan toplanır: E = 6·10⁵ N/C, −2 μC’luk yüke doğru.",
        ],
        answer: "6·10⁵ N/C, negatif yüke doğru",
      },
      {
        level: "zor",
        problem: "x = 0’da +1 μC, x = 3 m’de −4 μC yük vardır. Bileşke elektrik alanın sıfır olduğu nokta neresidir?",
        steps: [
          "Zıt işaretli yüklerde alanlar arada aynı yönlüdür; sıfır noktası dışarıda, küçük yüke yakın tarafta (x < 0) olmalı.",
          "Noktanın +1 μC’a uzaklığı d olsun: k·1/d² = k·4/(d + 3)².",
          "Karekök: d + 3 = 2d ⇒ d = 3 m.",
          "Nokta x = −3 m’dedir.",
        ],
        answer: "x = −3 m",
      },
    ],
    osymThinking:
      "Sorular genellikle yükleri bir doğru ya da üçgen üzerine dizer ve senden alanların yönlerini tek tek çizmeni bekler. Asıl ölçülen, işaretten yön çıkarabilmen ve simetriyi fark edip bileşenleri sadeleştirebilmendir. Oran sorularında sayısal değer verilmez; \"yük 2 katına, uzaklık 3 katına çıkarsa\" gibi ifadelerle orantısal düşünme ölçülür. Düzgün alan sorularında konu yatay atışa bağlanır.",
    commonMistakes: [
      "Uzaklığın karesini almayı unutmak ya da cm’yi m’ye çevirmemek.",
      "Negatif yükün alanını dışa doğru çizmek; negatif yükte alan yüke doğrudur.",
      "Alanları vektörel değil cebirsel toplamak (farklı doğrultudaki alanları doğrudan toplamak).",
      "Zıt işaretli yüklerde alanın sıfır olduğu noktayı iki yükün arasında aramak.",
      "Dokunan özdeş kürelerde yük paylaşımında işareti hesaba katmamak.",
    ],
    tips: [
      "Önce yönleri çiz, sonra büyüklükleri hesapla; büyüklükleri k·q/d² ‘birimi’ cinsinden yazmak hesabı kısaltır.",
      "Alanın sıfır olduğu nokta her zaman küçük yüke daha yakındır.",
      "Düzgün alanda yüklü parçacık için a = qE/m bul; gerisi yatay atış ya da sabit ivmeli hareket.",
    ],
    summary: [
      "F = k·q₁q₂/d²: aynı işaret iter, zıt işaret çeker.",
      "E = kq/d²; + yükte dışa, − yükte içe doğru.",
      "Bileşke alan vektörel toplamla bulunur.",
      "Alan çizgileri + yükten çıkar, − yüke girer, kesişmez; sıklık şiddeti gösterir.",
      "Düzgün alanda F = qE sabit, a = qE/m sabittir.",
      "Alanın sıfır olduğu nokta küçük yüke yakındır.",
    ],
  },
  {
    topicId: "aytfiz-elektriksel-potansiyel",
    intro:
      "Elektriksel potansiyel, elektrik alanı enerji diliyle anlatmanın yoludur. Bir noktanın potansiyeli, birim pozitif yükü sonsuzdan o noktaya getirmek için yapılması gereken iştir. Potansiyel skaler olduğu için yön derdi yoktur; işaretli toplarsın, o kadar.\n\nBu konunun AYT’deki gücü şuradan gelir: kuvvet ve alanla çözmesi zor olan birçok hareket sorusu, enerji korunumu ile iki satırda biter. Yük bir potansiyel farkından geçtiğinde kazandığı ya da kaybettiği kinetik enerji q·ΔV kadardır.\n\nPotansiyel enerji ise iki yükün \"birlikte\" sahip olduğu enerjidir. Eş potansiyel yüzeyler üzerinde yük gezdirmek iş gerektirmez. Paralel levhalar arasında alan düzgün olduğu için V = E·d ilişkisi, levha sorularının anahtarıdır.",
    prerequisites: [
      "Coulomb kuvveti ve elektrik alan (E = kq/d²)",
      "İş ve enerji kavramı, iş–kinetik enerji teoremi",
      "Mekanik enerji korunumu",
      "Skaler ve vektörel büyüklük farkı",
    ],
    concepts: [
      { term: "Elektriksel potansiyel (V)", definition: "Birim pozitif yükü sonsuzdan o noktaya sabit hızla getirmek için gereken iş; skalerdir, birimi volt (J/C)." },
      { term: "Potansiyel farkı (gerilim)", definition: "İki nokta arasındaki potansiyel farkı; birim yük başına yapılan iş." },
      { term: "Elektriksel potansiyel enerji (U)", definition: "Yük sisteminin konumundan dolayı depoladığı enerji; U = k·q₁q₂/d, işaretlidir." },
      { term: "Eş potansiyel yüzey", definition: "Her noktası aynı potansiyelde olan yüzey; alan çizgilerine her yerde diktir, üzerinde yük taşınırken elektriksel iş sıfırdır." },
      { term: "Elektronvolt (eV)", definition: "Bir elektron yükünün 1 V’luk potansiyel farkından geçerken kazandığı enerji; 1 eV = 1,6·10⁻¹⁹ J." },
      { term: "Paralel levhalar", definition: "Zıt yüklü iki levha arasında düzgün alan oluşur; alan yüksek potansiyelli levhadan alçak potansiyelliye yönelir." },
    ],
    formulas: [
      { expr: "V = k·q / d", meaning: "Noktasal yükün potansiyeli; q işaretiyle konur." },
      { expr: "V_toplam = V₁ + V₂ + …", meaning: "Potansiyeller skaler olarak (işaretleriyle) toplanır." },
      { expr: "U = k·q₁·q₂ / d", meaning: "İki yüklü sistemin potansiyel enerjisi; zıt işaretlilerde negatiftir." },
      { expr: "W_alan(A→B) = q·(V_A − V_B)", meaning: "Elektriksel kuvvetin yaptığı iş; yola bağlı değildir. Dış kuvvetin işi bunun eksi işaretlisidir (hız sabitse)." },
      { expr: "V = E·d", meaning: "Düzgün alanda (paralel levhalar) potansiyel farkı ile alan arasındaki ilişki." },
      { expr: "ΔE_k = q·ΔV", meaning: "Yalnız elektriksel kuvvet etkisindeki yükün kinetik enerji değişimi." },
    ],
    logic:
      "Elektriksel kuvvet korunumlu bir kuvvettir; yaptığı iş yalnız başlangıç ve bitiş noktalarına bağlıdır. Bu yüzden her noktaya bir \"enerji etiketi\" (potansiyel) atayabiliriz. Yükün izlediği yol ne kadar karmaşık olursa olsun iş = q × (ilk potansiyel − son potansiyel) olur.\n\nPozitif yük, kendi hâline bırakılırsa yüksek potansiyelden alçak potansiyele gider; tıpkı topun yüksekten alçağa yuvarlanması gibi. Negatif yük ise tersine alçaktan yükseğe gider. Alan çizgileri de her zaman potansiyelin azaldığı yönü gösterir.\n\nEş potansiyel yüzeyin alan çizgisine dik olmasının nedeni basittir: yüzey boyunca potansiyel değişmiyorsa alanın o doğrultuda bileşeni olamaz; olsaydı yük o yönde itilir ve iş yapılırdı.",
    examples: [
      {
        level: "kolay",
        problem: "+3 μC’luk noktasal yükten 90 cm uzaktaki noktanın potansiyeli kaç volttur?",
        steps: [
          "V = k·q/d = 9·10⁹ · 3·10⁻⁶ / 0,9.",
          "V = 27·10³ / 0,9 = 3·10⁴ V.",
        ],
        answer: "3·10⁴ V",
      },
      {
        level: "orta",
        problem: "Aralarındaki uzaklık 4 cm olan paralel levhalar 120 V’luk üretece bağlanmıştır. Levhalar arasındaki +2 μC’luk yüke etki eden kuvvet nedir?",
        steps: [
          "E = V/d = 120/0,04 = 3000 V/m.",
          "F = q·E = 2·10⁻⁶ · 3000 = 6·10⁻³ N.",
          "Kuvvet alan yönündedir, yani + levhadan − levhaya doğru.",
        ],
        answer: "6·10⁻³ N",
      },
      {
        level: "zor",
        problem: "+4 μC yüklü bir parçacık 1,2·10⁻³ J kinetik enerjiyle, aralarında 400 V bulunan ve 8 cm aralıklı levhalardan alçak potansiyelli olanın deliğinden girerek yüksek potansiyelli levhaya doğru ilerliyor. Parçacık en fazla kaç cm ilerleyebilir? (Yer çekimi ihmal)",
        steps: [
          "Karşı levhaya ulaşmak için gereken enerji q·V = 4·10⁻⁶·400 = 1,6·10⁻³ J; eldeki 1,2·10⁻³ J yetmez.",
          "Düzgün alanda potansiyel doğrusal değiştiği için x kadar ilerlemede kayıp q·E·x = q·(V/d)·x.",
          "1,2·10⁻³ = 1,6·10⁻³ · x/8 ⇒ x = 6 cm.",
        ],
        answer: "6 cm",
      },
    ],
    osymThinking:
      "ÖSYM tarzı sorularda potansiyel ile alan sık sık karşılaştırılır: bir noktada alan sıfır olduğu hâlde potansiyel sıfır olmayabilir (ya da tersi). Yol üzerinden iş sorularında karmaşık bir yörünge çizilir ama cevap yalnızca uç noktaların potansiyeline bağlıdır. Levha sorularında V = E·d ile ΔE_k = qΔV birleştirilir; parçacığın levhaya ulaşıp ulaşmadığını enerjiyle sorgulamak gerekir.",
    commonMistakes: [
      "Potansiyeli vektör gibi toplamak ya da negatif yükün işaretini atmak.",
      "Alanın sıfır olduğu yerde potansiyelin de sıfır olduğunu sanmak.",
      "Alanın yaptığı iş ile dış kuvvetin yaptığı işin işaretlerini karıştırmak.",
      "V = E·d’de d’yi levhalar arası tüm uzaklık yerine yükün aldığı yol olarak kullanmak gerektiğinde bunu atlamak.",
      "eV ile J arasında dönüşümü unutmak.",
    ],
    tips: [
      "İş sorusunda yolu bırak, yalnızca ilk ve son noktanın potansiyeline bak.",
      "Aynı potansiyel farkından geçen yüklerde kinetik enerji q ile orantılıdır; hız ise √(q/m) ile.",
      "Alan çizgisi yönünde gidildikçe potansiyel azalır.",
    ],
    summary: [
      "V = kq/d, skalerdir; işaretiyle toplanır.",
      "U = kq₁q₂/d; zıt yüklerde negatif.",
      "W_alan = q(V_ilk − V_son), yoldan bağımsız.",
      "Eş potansiyel yüzeyler alan çizgilerine diktir, üzerinde iş sıfırdır.",
      "Paralel levhalarda E = V/d düzgündür.",
      "ΔE_k = qΔV: hızlandırma ve durdurma soruları enerjiyle çözülür.",
    ],
  },
  {
    topicId: "aytfiz-kondansatorler",
    intro:
      "Kondansatör (sığaç), iki iletken levha arasında yük ve enerji depolayan devre elemanıdır. Üretece bağlandığında levhalardan biri +Q, diğeri −Q yükle yüklenir. Depolanan yükün gerilime oranı sığadır ve yalnızca kondansatörün geometrisine ve araya konan yalıtkana bağlıdır.\n\nAYT’de kondansatör soruları üç başlıkta gelir: sığanın geometriye bağlılığı, seri–paralel bağlama ve üreteçle bağlantı kesildiğinde ya da kesilmediğinde nelerin değiştiği.",
    prerequisites: [
      "Elektriksel potansiyel ve V = E·d",
      "Seri ve paralel devrelerde gerilim–akım paylaşımı",
      "Enerji kavramı ve grafik altındaki alan yorumu",
    ],
    concepts: [
      { term: "Sığa (C)", definition: "Kondansatörün birim gerilim başına depoladığı yük; C = Q/V, birimi farad (F)." },
      { term: "Dielektrik", definition: "Levhalar arasına konan yalıtkan; sığayı dielektrik sabiti (κ) katı kadar artırır." },
      { term: "Seri bağlama", definition: "Kondansatörler üzerindeki yükler eşit, gerilimler sığayla ters orantılı paylaşılır." },
      { term: "Paralel bağlama", definition: "Kondansatörlerin gerilimleri eşit, yükleri sığayla doğru orantılıdır." },
      { term: "Depolanan enerji", definition: "Yüklemek için yapılan işin levhalar arasındaki alanda saklanan kısmı; Q–V grafiğinin altındaki alan." },
    ],
    formulas: [
      { expr: "C = Q / V", meaning: "Sığanın tanımı." },
      { expr: "C = κ·ε₀·A / d", meaning: "Paralel levhalı kondansatörün sığası; levha alanıyla doğru, aralıkla ters orantılı." },
      { expr: "1/C_eş = 1/C₁ + 1/C₂ + …", meaning: "Seri bağlamada eşdeğer sığa." },
      { expr: "C_eş = C₁ + C₂ + …", meaning: "Paralel bağlamada eşdeğer sığa." },
      { expr: "E_enerji = ½·Q·V = ½·C·V² = Q²/(2C)", meaning: "Kondansatörde depolanan enerji." },
    ],
    logic:
      "Sığa geometrik bir özelliktir: levha alanı büyüdükçe aynı gerilimde daha çok yük yerleşir, levhalar yaklaştıkça zıt yükler birbirini daha güçlü çeker ve daha çok yük tutulabilir. Dielektrik, içindeki kutuplanma sayesinde levhalar arasındaki alanı zayıflatır; aynı yük için gerilim düşer, yani sığa artar.\n\nÜreteç bağlıyken V sabittir; üreteçten ayrılmışsa Q sabittir. Bütün \"ne değişir\" soruları bu iki sabitten biriyle başlar. Enerji ½QV’dir, QV değil; çünkü yükleme boyunca gerilim 0’dan V’ye doğrusal artar ve ortalama gerilim V/2’dir.",
    examples: [
      {
        level: "kolay",
        problem: "4 μF’lık kondansatör 12 V’a bağlanıyor. Yükü ve enerjisi nedir?",
        steps: ["Q = C·V = 4·10⁻⁶ · 12 = 48 μC.", "E = ½CV² = ½·4·10⁻⁶·144 = 2,88·10⁻⁴ J."],
        answer: "48 μC; 2,88·10⁻⁴ J",
      },
      {
        level: "orta",
        problem: "3 μF ve 6 μF seri bağlanıp bu kola 4 μF paralel ekleniyor; sistem 12 V’a bağlanıyor. 3 μF’lık kondansatörün yükü nedir?",
        steps: [
          "Seri kol: 1/C = 1/3 + 1/6 ⇒ C = 2 μF.",
          "Seri kolun gerilimi 12 V (paralel olduğu için) ⇒ Q = 2·12 = 24 μC.",
          "Seride yükler eşit olduğundan 3 μF’ın yükü 24 μC.",
        ],
        answer: "24 μC",
      },
    ],
    osymThinking:
      "Sorular çoğunlukla \"üreteçten ayrılmış kondansatörün levhaları uzaklaştırılıyor\" ya da \"üreteç bağlıyken araya yalıtkan konuyor\" kalıbındadır. Ölçülen, neyin sabit kaldığını doğru belirleyip Q, V, C, E ve enerjinin değişimini zincirleme bulabilmendir. Q–V grafiği verilip eğimden sığa, alandan enerji istenebilir.",
    commonMistakes: [
      "Seri ve paralel bağlama formüllerini dirençlerle aynı sanmak (kondansatörde tersidir).",
      "Üreteçten ayrılmış kondansatörde gerilimi sabit kabul etmek.",
      "Enerjiyi ½CV² yerine CV² ile hesaplamak.",
      "μF ve μC ön eklerini hesaba katmamak.",
    ],
    tips: [
      "İlk soru: üreteç bağlı mı? Bağlıysa V, değilse Q sabittir.",
      "Levhalar arası alan E = V/d; Q sabitken d değişirse E değişmez.",
    ],
    summary: [
      "C = Q/V = κε₀A/d.",
      "Seri: yükler eşit; paralel: gerilimler eşit.",
      "Enerji = ½QV = ½CV².",
      "Üreteç bağlı → V sabit; ayrılmış → Q sabit.",
    ],
  },
  {
    topicId: "aytfiz-manyetizma-induksiyon",
    intro:
      "Hareket eden yükler, yani akımlar, çevrelerinde manyetik alan oluşturur. Düz bir telin alanı teli saran çemberler şeklindedir; halka biçimindeki telde alan halkanın merkezinde yoğunlaşır; akım makarasında (bobin) ise içeride çubuk mıknatısınkine benzer düzgün bir alan oluşur.\n\nManyetik alan bu kez de hareketli yüklere kuvvet uygular. Alan içinde hareket eden yüke F = qvB, akım taşıyan tele F = BIL kadar kuvvet etki eder. Bu kuvvet hıza dik olduğu için yüklü parçacığı çembersel yörüngeye sokar; elektrik motorlarının dönme sebebi de budur.\n\nKonunun ikinci yarısı indüksiyondur: bir halkadan geçen manyetik akı değiştiğinde halkada gerilim (emk) oluşur. Faraday bu gerilimin akının değişim hızına eşit olduğunu, Lenz ise oluşan akımın değişime karşı koyacak yönde olduğunu gösterir. Jeneratörler, transformatörler ve indüksiyonlu ocaklar bu ilke ile çalışır.",
    prerequisites: [
      "Elektrik akımı, Ohm yasası ve elektriksel güç",
      "Vektörel çarpım mantığı ve sağ el kuralı",
      "Çembersel hareket: merkezcil kuvvet F = mv²/r",
      "Mıknatısların kutupları ve manyetik alan çizgileri (TYT)",
    ],
    concepts: [
      { term: "Manyetik alan (B)", definition: "Hareketli yüklere kuvvet uygulayan alan; birimi tesla (T)." },
      { term: "Akım makarası (bobin)", definition: "Sıkıca sarılmış çok sarımlı tel; içinde eksen boyunca düzgün manyetik alan oluşur." },
      { term: "Lorentz (manyetik) kuvveti", definition: "Alanda hareket eden yüke etki eden kuvvet; hem hıza hem alana diktir, iş yapmaz." },
      { term: "Manyetik akı (Φ)", definition: "Bir yüzeyden geçen alan çizgisi miktarı; Φ = B·A·cosθ, birimi weber (Wb)." },
      { term: "Faraday yasası", definition: "Akı değişiminin oluşturduğu indüksiyon emk’sı akının değişim hızıyla orantılıdır." },
      { term: "Lenz kuralı", definition: "İndüksiyon akımı, kendisini oluşturan akı değişimine karşı koyacak yönde oluşur." },
      { term: "Hareketsel emk", definition: "Manyetik alanda hareket eden iletken çubuğun uçları arasında oluşan gerilim; ε = B·L·v." },
    ],
    formulas: [
      { expr: "B = 2k·I / d  (k = 10⁻⁷ T·m/A)", meaning: "Sonsuz uzun düz telin d uzaklıkta oluşturduğu alan." },
      { expr: "B = 2πk·I / r", meaning: "Çembersel halkanın merkezindeki alan (N sarım için N ile çarpılır)." },
      { expr: "B = 4πk·N·I / ℓ", meaning: "Akım makarasının içindeki alan; N sarım sayısı, ℓ makara boyu." },
      { expr: "F = q·v·B·sinθ", meaning: "Alandaki yüklü parçacığa etki eden kuvvet; θ, v ile B arasındaki açı." },
      { expr: "F = B·I·L·sinθ", meaning: "Akım taşıyan tele etki eden kuvvet." },
      { expr: "r = m·v / (q·B)", meaning: "Alana dik giren parçacığın çembersel yörünge yarıçapı." },
      { expr: "ε = −N·ΔΦ/Δt", meaning: "Faraday–Lenz: indüksiyon emk’sı; eksi işaret Lenz kuralını gösterir." },
      { expr: "ε = B·L·v", meaning: "Hareketsel emk (çubuk, alana ve hıza dik)." },
    ],
    logic:
      "Manyetik kuvvetin hıza dik olması her şeyi açıklar: kuvvet hızın yönünü değiştirir ama büyüklüğünü değiştiremez, bu yüzden iş yapmaz ve kinetik enerji sabit kalır. Parçacık düzgün çembersel hareket yapar; merkezcil kuvveti qvB sağlar ve qvB = mv²/r’den yarıçap çıkar.\n\nİndüksiyonda doğa değişime direnir. Bir halkaya mıknatıs yaklaştırırsan içindeki akı artar; halkada oluşan akım, artışı azaltacak yönde yeni bir alan üretir ve mıknatısı iter. Eğer akım tersine oluşsaydı mıknatısı çeker, akı daha çok artar, akım daha çok büyür ve bedava enerji elde edilirdi; bu enerji korunumunu bozardı. Lenz kuralı enerji korunumunun indüksiyondaki ifadesidir.\n\nHareketsel emk’da çubuktaki serbest yükler çubukla birlikte v hızıyla hareket eder ve qvB kuvvetiyle çubuğun bir ucuna itilir. Uçlarda biriken yükün elektrik alanı bu kuvveti dengelediğinde qE = qvB, E = vB ve ε = E·L = BLv olur.",
    examples: [
      {
        level: "kolay",
        problem: "10 A akım taşıyan uzun düz telden 5 cm uzaktaki manyetik alan nedir?",
        steps: ["B = 2k·I/d = 2·10⁻⁷·10/0,05.", "B = 4·10⁻⁵ T."],
        answer: "4·10⁻⁵ T",
      },
      {
        level: "orta",
        problem: "Alanı 0,05 m² olan 100 sarımlı bobinin yüzey normali ile 0,4 T’lık alan arasında 60° vardır. Alan 0,2 s’de düzgün biçimde sıfıra inerse ortalama emk ne olur?",
        steps: [
          "Φ = B·A·cos60° = 0,4·0,05·0,5 = 0,01 Wb.",
          "ΔΦ = 0,01 Wb (sıfıra iniyor).",
          "ε = N·ΔΦ/Δt = 100·0,01/0,2 = 5 V.",
        ],
        answer: "5 V",
      },
      {
        level: "zor",
        problem: "0,6 T’lık düzgün alana dik raylar üzerinde, 0,5 m boyundaki çubuk 4 m/s sabit hızla çekiliyor. Devrenin toplam direnci 3 Ω’dur. Çubuğu sabit hızda tutmak için gereken dış kuvvet nedir?",
        steps: [
          "ε = B·L·v = 0,6·0,5·4 = 1,2 V.",
          "I = ε/R = 1,2/3 = 0,4 A.",
          "Çubuğa etki eden manyetik kuvvet F = B·I·L = 0,6·0,4·0,5 = 0,12 N, harekete ters (Lenz).",
          "Sabit hız için dış kuvvet de 0,12 N olmalı. Kontrol: güç F·v = 0,48 W = ε·I.",
        ],
        answer: "0,12 N",
      },
    ],
    osymThinking:
      "Sorular yön bulma üzerine kuruludur: aynı ya da zıt yönlü akım taşıyan tellerin ortasındaki alan, telin kuvvet yönü, indüksiyon akımının yönü. Sayısal kısım genellikle orantıdır. Akı–zaman grafiği verilip emk’nın hangi aralıkta büyük olduğu sorulur; burada grafiğin eğimini okumak gerekir, akının kendisini değil. Hareketsel emk soruları Ohm yasası ve BIL kuvvetiyle birleştirilerek çok adımlı hâle getirilir.",
    commonMistakes: [
      "emk’yı akının büyüklüğüne bağlamak; emk akının değişim hızına bağlıdır, akı sabitse emk sıfırdır.",
      "Zıt yönlü akım taşıyan tellerin arasında alanları çıkarmak (arada aynı yönlüdür, toplanır).",
      "Negatif yüklü parçacıkta sağ el kuralından bulunan yönü ters çevirmeyi unutmak.",
      "Manyetik kuvvetin parçacığı hızlandırdığını düşünmek; kuvvet iş yapmaz.",
      "Akı hesabında açıyı yüzeyle alan arasında alıp cos yerine sin kullanmamak (açı normal ile ölçülür).",
    ],
    tips: [
      "Aynı yönlü akımlar birbirini çeker, zıt yönlüler iter.",
      "Lenz için sor: akı artıyor mu azalıyor mu? İndüksiyon alanı artışa zıt, azalışa aynı yönde olur.",
      "Φ–t grafiğinde emk ∝ eğim; eğimin işareti değişirse akımın yönü değişir.",
    ],
    summary: [
      "Düz tel: B = 2kI/d; halka: B = 2πkI/r; makara: B = 4πkNI/ℓ.",
      "F = qvB sinθ ve F = BIL sinθ; kuvvet hıza/tele ve alana diktir.",
      "Alana dik giren parçacık r = mv/(qB) yarıçaplı çember çizer.",
      "Φ = BA cosθ; ε = N·ΔΦ/Δt.",
      "Lenz: indüksiyon akımı değişime karşı koyar.",
      "Hareketsel emk: ε = BLv.",
    ],
  },
  {
    topicId: "aytfiz-alternatif-akim-transformator",
    intro:
      "Evlerdeki prizlerden gelen elektrik alternatif akımdır: gerilim zamanla sinüs biçiminde değişir ve Türkiye’de saniyede 50 kez yön değiştiren bir döngü tamamlar (50 Hz). Alternatif akımın en büyük avantajı transformatörle geriliminin kolayca yükseltilip alçaltılabilmesidir.\n\nBu konuda etkin (efektif) değer kavramını, transformatörün sarım oranı ile gerilim ve akımın nasıl değiştiğini, uzak mesafeye enerji iletiminde neden yüksek gerilim kullanıldığını öğreneceksin.",
    prerequisites: [
      "Faraday–Lenz yasası ve manyetik akı",
      "Ohm yasası ve elektriksel güç (P = V·I = I²R)",
      "Sinüs fonksiyonu ve periyot–frekans ilişkisi",
    ],
    concepts: [
      { term: "Alternatif akım (AC)", definition: "Yönü ve büyüklüğü periyodik olarak değişen akım; V = V_max·sin(ωt)." },
      { term: "Etkin değer", definition: "Aynı dirençte aynı ısıyı üreten doğru akım değeri; V_etkin = V_max/√2." },
      { term: "Transformatör", definition: "Ortak demir çekirdeğe sarılmış iki bobinden oluşan, AC gerilimi değiştiren araç; DC ile çalışmaz." },
      { term: "Sarım oranı", definition: "Sekonder ve primer sarım sayılarının oranı; gerilim bu oranla değişir." },
      { term: "İndüktif ve kapasitif reaktans", definition: "Bobinin (X_L = 2πfL) ve kondansatörün (X_C = 1/(2πfC)) AC’ye gösterdiği zorluk; frekansla X_L artar, X_C azalır." },
    ],
    formulas: [
      { expr: "V_etkin = V_max / √2,  I_etkin = I_max / √2", meaning: "Etkin değerler." },
      { expr: "ω = 2πf", meaning: "Açısal frekans ile frekans ilişkisi." },
      { expr: "V_s / V_p = N_s / N_p", meaning: "Transformatörde gerilim sarım sayısıyla doğru orantılı." },
      { expr: "V_p·I_p = V_s·I_s (ideal)", meaning: "İdeal transformatörde güç korunur; akım sarım sayısıyla ters orantılıdır." },
      { expr: "Verim = P_s / P_p", meaning: "Gerçek transformatörde çıkış gücünün giriş gücüne oranı." },
      { expr: "P_kayıp = I²·R_hat", meaning: "İletim hattındaki ısı kaybı." },
    ],
    logic:
      "Transformatör indüksiyonla çalışır: primerdeki değişen akım çekirdekte değişen akı oluşturur, bu akı sekonderin her sarımında aynı emk’yı doğurur. Bu yüzden toplam gerilim sarım sayısıyla orantılıdır. DC’de akı değişmediği için sekonderde gerilim oluşmaz.\n\nİletim hatlarında belirli bir güç P = V·I ile taşınır. Gerilimi 10 kat artırırsan akım 10 kat azalır ve I²R kaybı 100 kat azalır. Santrallerin yanında yükseltici, şehirlerde alçaltıcı transformatör bulunmasının nedeni budur.",
    examples: [
      {
        level: "kolay",
        problem: "Tepe değeri 311 V olan şebeke geriliminin etkin değeri yaklaşık kaçtır?",
        steps: ["V_etkin = V_max/√2 = 311/1,414.", "V_etkin ≈ 220 V."],
        answer: "≈ 220 V",
      },
      {
        level: "orta",
        problem: "Primeri 500, sekonderi 25 sarımlı ideal transformatörün primeri 220 V’a bağlı; sekonderden 2 A çekiliyor. Primer akımı nedir?",
        steps: [
          "V_s = 220·25/500 = 11 V.",
          "Güç korunumu: 220·I_p = 11·2 ⇒ I_p = 0,1 A.",
        ],
        answer: "0,1 A",
      },
    ],
    osymThinking:
      "Sorular transformatörü günlük hayattan bir cihazla (şarj adaptörü, kaynak makinesi, enerji nakil hattı) sunar. Sarım oranı, güç korunumu ve verim birlikte kullanılır. Yüksek gerilimle iletim sorularında kayıpların akımın karesiyle değiştiğini fark etmek ölçülür.",
    commonMistakes: [
      "Akımın da gerilim gibi sarım sayısıyla doğru orantılı olduğunu sanmak.",
      "Yükseltici transformatörün gücü de artırdığını düşünmek.",
      "Tepe değer ile etkin değeri karıştırmak.",
      "Kaybın akımla doğrusal azaldığını sanmak (karesiyle azalır).",
    ],
    tips: [
      "Önce gerilimi sarım oranıyla, sonra akımı güç eşitliğiyle bul.",
      "Verim varsa: P_p = P_s / verim.",
    ],
    summary: [
      "V_etkin = V_max/√2; Türkiye’de 220 V, 50 Hz.",
      "V_s/V_p = N_s/N_p; ideal durumda V_pI_p = V_sI_s.",
      "Transformatör yalnız AC ile çalışır.",
      "Yüksek gerilimle iletim I²R kaybını azaltır.",
    ],
  },
  {
    topicId: "aytfiz-cembersel-hareket",
    intro:
      "Bir cisim sabit büyüklükte hızla çember çizerken bile ivmelidir, çünkü hızın yönü sürekli değişir. Bu ivme her an merkeze doğrudur ve merkezcil ivme adını alır. Newton’un ikinci yasasına göre bu ivmeyi sağlayan bir net kuvvet olmalıdır: merkezcil kuvvet.\n\nÖnemli nokta şu: merkezcil kuvvet ayrı bir kuvvet türü değildir. İp gerilmesi, sürtünme, normal kuvvet, kütle çekimi ya da bunların bileşkesi merkezcil kuvvet görevini üstlenir. Her soruda \"merkeze doğru olan net kuvvet hangisi?\" diye sorman gerekir.\n\nAYT’de çembersel hareket; yatay düzlemde ip ya da sürtünme ile dönen cisimler, düşey düzlemde dönen cisimler (tepe ve dip noktası), virajlar ve eğimli virajlar, konik sarkaç ve kasnak–kayış sistemleri üzerinden sorulur.",
    prerequisites: [
      "Newton’un hareket yasaları ve serbest cisim diyagramı",
      "Sürtünme kuvveti (f = μ·N)",
      "Mekanik enerji korunumu",
      "Trigonometri: sin, cos, tan (37°–53° üçgeni)",
    ],
    concepts: [
      { term: "Periyot (T)", definition: "Bir tam turun süresi; birimi saniye." },
      { term: "Frekans (f)", definition: "Birim zamandaki tur sayısı; f = 1/T, birimi Hz." },
      { term: "Açısal hız (ω)", definition: "Birim zamanda taranan açı; ω = 2π/T, birimi rad/s." },
      { term: "Çizgisel hız (v)", definition: "Çembere teğet hız; v = ω·r." },
      { term: "Merkezcil ivme", definition: "Hızın yön değişiminden doğan, merkeze yönelik ivme; a = v²/r = ω²r." },
      { term: "Merkezcil kuvvet", definition: "Merkeze doğru olan net kuvvet; F = m·v²/r. Ayrı bir kuvvet değil, var olan kuvvetlerin bileşkesidir." },
      { term: "Eğimli viraj", definition: "Yol yüzeyinin yatayla θ açısı yapması; normal kuvvetin yatay bileşeni merkezcil kuvvete katkı verir." },
    ],
    formulas: [
      { expr: "f = 1/T,  ω = 2π/T = 2πf", meaning: "Periyot, frekans ve açısal hız ilişkisi." },
      { expr: "v = ω·r = 2πr/T", meaning: "Çizgisel hız." },
      { expr: "a_m = v²/r = ω²·r", meaning: "Merkezcil ivme." },
      { expr: "F_m = m·v²/r = m·ω²·r", meaning: "Merkezcil kuvvet." },
      { expr: "v_max = √(μ·g·r)", meaning: "Yatay virajda kaymadan dönülebilecek en büyük hız." },
      { expr: "tanθ = v²/(r·g)", meaning: "Sürtünmesiz eğimli virajın ideal hızı; konik sarkaçta da aynı ilişki geçerlidir." },
      { expr: "v_tepe,min = √(g·r)", meaning: "Düşey çemberde ipe bağlı cismin tepe noktasındaki en küçük hızı." },
    ],
    logic:
      "Çembersel harekette hızın büyüklüğü sabit olabilir ama yönü değişir; hız bir vektör olduğundan bu bir değişimdir ve ivme gerektirir. Kısa bir Δt’de hız vektörü merkeze doğru küçük bir Δv kazanır; bu yüzden ivme merkeze yöneliktir. Merkezcil kuvvet hıza dik olduğu için iş yapmaz; kinetik enerji değişmez.\n\nDüşey çemberin tepesinde ağırlık ve ip gerilmesi ikisi de merkeze (aşağı) doğrudur: T + mg = mv²/r. İp gevşememesi için T ≥ 0 olmalı, yani v ≥ √(gr). Dipte ise ağırlık merkezden dışarı doğru, gerilme merkeze doğrudur: T − mg = mv²/r; bu yüzden gerilme en çok dipte olur.\n\nYatay virajda araçları yolda tutan statik sürtünmedir. Sürtünmenin en büyük değeri μmg olduğundan, mv²/r ≤ μmg şartı v_max = √(μgr) sonucunu verir; kütleden bağımsızdır. Eğimli virajda ise normal kuvvet eğilir ve yatay bileşeni N·sinθ merkezcil kuvveti sağlar; düşey bileşen N·cosθ ağırlığı dengeler.",
    examples: [
      {
        level: "kolay",
        problem: "Dakikada 120 tur atan bir cismin frekansı, periyodu ve açısal hızı nedir?",
        steps: ["f = 120/60 = 2 Hz.", "T = 1/f = 0,5 s.", "ω = 2πf = 4π rad/s."],
        answer: "f = 2 Hz, T = 0,5 s, ω = 4π rad/s",
      },
      {
        level: "orta",
        problem: "Yarıçapı 50 m olan yatay virajda lastik–yol statik sürtünme katsayısı 0,8’dir. Araç en fazla kaç km/h ile kaymadan dönebilir?",
        steps: [
          "Merkezcil kuvveti sürtünme sağlar: mv²/r ≤ μmg.",
          "v_max = √(μgr) = √(0,8·10·50) = √400 = 20 m/s.",
          "20 m/s · 3,6 = 72 km/h.",
        ],
        answer: "72 km/h",
      },
      {
        level: "zor",
        problem: "0,2 kg’lık cisim 0,9 m’lik ipin ucunda düşey düzlemde dönüyor. Tepe noktasındaki hızı mümkün olan en küçük değerde ise dip noktadaki ip gerilmesi kaç N’dur?",
        steps: [
          "Tepede en küçük hız: v_t² = g·r = 9 ⇒ v_t = 3 m/s.",
          "Enerji korunumu (yükseklik farkı 2r = 1,8 m): v_d² = v_t² + 2g·2r = 9 + 36 = 45.",
          "Dipte: T − mg = mv_d²/r ⇒ T = 0,2·(10 + 45/0,9) = 0,2·60 = 12 N.",
          "Genel sonuç: bu durumda dip gerilmesi 6mg’dir.",
        ],
        answer: "12 N",
      },
    ],
    osymThinking:
      "Sorular merkezcil kuvvetin kaynağını bulmanı ister: ip mi, sürtünme mi, normal kuvvet mi, bileşke mi? Yolcunun kendini ağır ya da hafif hissetmesi (normal kuvvet yorumu), tümsek ve çukurda araç, dönme dolap gibi günlük bağlamlar sık kullanılır. Grafik sorularında F–v² ya da F–ω² doğrusu verilir ve eğimden kütle veya yarıçap çıkarılır. Kasnak sorularında aynı kayışa bağlı kasnakların çizgisel hızlarının, aynı mile bağlıların açısal hızlarının eşit olduğunu bilmek ölçülür.",
    commonMistakes: [
      "Merkezcil kuvveti serbest cisim diyagramına ayrı bir kuvvet olarak eklemek.",
      "Düzgün çembersel harekette hız vektörünün sabit olduğunu söylemek (yalnız büyüklüğü sabittir).",
      "Düşey çemberin tepesinde ağırlığı merkezden dışa doğru almak.",
      "km/h ile m/s dönüşümünü unutmak (÷3,6).",
      "Kayışla bağlı kasnaklarda açısal hızların eşit olduğunu sanmak.",
    ],
    tips: [
      "Her soruda önce merkezi belirle, sonra merkeze doğru kuvvetleri + , dışa doğru olanları − yaz: ΣF_merkez = mv²/r.",
      "Yatay virajda ve eğimli virajda sonuç kütleden bağımsızdır.",
      "Tümsek tepesinde N = m(g − v²/r); araç v = √(gr)’de yoldan kopar.",
    ],
    summary: [
      "f = 1/T, ω = 2πf, v = ωr.",
      "a = v²/r = ω²r, daima merkeze doğru.",
      "Merkezcil kuvvet var olan kuvvetlerin merkez yönündeki bileşkesidir.",
      "Düşey çember: tepede T + mg, dipte T − mg = mv²/r.",
      "Yatay viraj: v_max = √(μgr); eğimli viraj: tanθ = v²/(rg).",
      "Kayışla bağlı kasnaklarda v, aynı mildekilerde ω eşittir.",
    ],
  },
  {
    topicId: "aytfiz-donme-acisal-momentum",
    intro:
      "Bir tekerlek yolda yuvarlanırken hem ilerler (öteleme) hem de kendi ekseni etrafında döner. Bu yüzden kinetik enerjisi iki parçalıdır: öteleme ve dönme kinetik enerjisi. Dönmeye karşı gösterilen direnç eylemsizlik momenti (dönme eylemsizliği) ile ölçülür ve yalnızca kütleye değil, kütlenin eksene göre nasıl dağıldığına da bağlıdır.\n\nAçısal momentum, dönme hareketinin momentumudur. Net dış tork sıfırsa korunur; buz patencisinin kollarını kapatınca hızlanması bunun en bilinen örneğidir.",
    prerequisites: [
      "Tork (moment) kavramı",
      "Çizgisel momentum ve korunumu",
      "Çembersel hareket: ω, v = ωr",
      "Mekanik enerji korunumu",
    ],
    concepts: [
      { term: "Eylemsizlik momenti (I)", definition: "Cismin dönmeye karşı direnci; kütle eksenden uzakta toplandıkça büyür (halka: mr², disk: ½mr², küre: ⅖mr²)." },
      { term: "Dönme kinetik enerjisi", definition: "Dönen cismin enerjisi; E = ½·I·ω²." },
      { term: "Kaymadan yuvarlanma", definition: "v = ω·r koşulunun sağlandığı hareket; temas noktasının anlık hızı sıfırdır." },
      { term: "Açısal momentum (L)", definition: "L = I·ω (noktasal cisim için L = m·v·r); vektöreldir." },
      { term: "Açısal momentumun korunumu", definition: "Net dış tork sıfırsa I·ω sabit kalır." },
    ],
    formulas: [
      { expr: "E_dönme = ½·I·ω²", meaning: "Dönme kinetik enerjisi." },
      { expr: "E_toplam = ½mv² + ½Iω²", meaning: "Yuvarlanan cismin toplam kinetik enerjisi." },
      { expr: "L = I·ω = m·v·r", meaning: "Açısal momentum." },
      { expr: "τ = I·α = ΔL/Δt", meaning: "Dönme için Newton’un ikinci yasası." },
      { expr: "I₁·ω₁ = I₂·ω₂", meaning: "Net dış tork sıfırken açısal momentum korunumu." },
    ],
    logic:
      "Yuvarlanan cisimde potansiyel enerji hem ötelemeye hem dönmeye paylaşılır. Eylemsizlik momenti büyük olan cisim (halka) enerjinin daha büyük kısmını dönmeye ayırır ve daha yavaş ilerler. Bu yüzden aynı eğik düzlemden bırakılan küre diskten, disk halkadan önce aşağı ulaşır; kütle ve yarıçaptan bağımsız olarak.\n\nAçısal momentum korunurken I küçülürse ω büyür. Kinetik enerji ½Iω² = L²/(2I) olduğundan I azalınca enerji artar; bu enerjiyi patencinin kollarını çekerken yaptığı iş sağlar.",
    examples: [
      {
        level: "kolay",
        problem: "2 kg’lık bir disk 2 m/s hızla kaymadan yuvarlanıyor. Toplam kinetik enerjisi nedir?",
        steps: [
          "Öteleme: ½·2·4 = 4 J.",
          "Dönme: ½·(½mr²)·(v/r)² = ¼mv² = 2 J.",
          "Toplam 6 J.",
        ],
        answer: "6 J",
      },
      {
        level: "orta",
        problem: "Eylemsizlik momenti 4 kg·m² olan patenci 2 rad/s ile dönerken kollarını kapatıp I’yı 1,6 kg·m²’ye düşürüyor. Yeni açısal hızı nedir?",
        steps: ["I₁ω₁ = I₂ω₂ ⇒ 4·2 = 1,6·ω₂.", "ω₂ = 5 rad/s."],
        answer: "5 rad/s",
      },
    ],
    osymThinking:
      "Sorular yarış kurgusuyla gelir: aynı eğik düzlemden bırakılan halka, disk ve küreden hangisi önce varır? Açısal momentum korunumu ise patenci, dönen sandalye, yıldızın çökmesi gibi bağlamlarla sorulur. Kinetik enerjinin korunmadığını fark etmek ayırt edici noktadır.",
    commonMistakes: [
      "Yuvarlanan cisimde dönme enerjisini unutup v = √(2gh) kullanmak.",
      "Açısal momentum korunurken kinetik enerjinin de korunduğunu sanmak.",
      "Eylemsizlik momentinin yalnız kütleye bağlı olduğunu düşünmek.",
    ],
    tips: [
      "Yuvarlanma: mgh = ½mv²(1 + I/(mr²)). Disk için v² = 4gh/3, halka için v² = gh.",
      "Yarış sorularında I/(mr²) küçük olan kazanır.",
    ],
    summary: [
      "E = ½mv² + ½Iω²; kaymadan yuvarlanmada v = ωr.",
      "L = Iω; net dış tork sıfırsa korunur.",
      "I azalınca ω artar, kinetik enerji artar.",
      "Yarış sıralaması: küre > disk > halka.",
    ],
  },
  {
    topicId: "aytfiz-kutle-cekim-kepler",
    intro:
      "Evrendeki her iki kütle birbirini çeker. Newton’un evrensel kütle çekim yasası bu kuvvetin kütlelerin çarpımıyla doğru, uzaklığın karesiyle ters orantılı olduğunu söyler. Aynı yasa hem elmanın düşmesini hem Ay’ın Dünya etrafında dolanmasını açıklar.\n\nKepler ise Newton’dan önce gözlem verilerinden gezegen hareketinin üç yasasını çıkarmıştı: yörüngeler elipstir, gezegen eşit sürelerde eşit alanlar tarar ve periyodun karesi yörünge yarıçapının küpüyle orantılıdır.",
    prerequisites: [
      "Çembersel hareket ve merkezcil kuvvet",
      "Ağırlık ve yer çekimi ivmesi",
      "Üslü ve köklü ifadelerle oran işlemleri",
    ],
    concepts: [
      { term: "Evrensel çekim sabiti (G)", definition: "G ≈ 6,67·10⁻¹¹ N·m²/kg²; kütle çekim kuvvetinin ölçeğini belirler." },
      { term: "Çekim alanı (g)", definition: "Birim kütleye etki eden kütle çekim kuvveti; g = GM/r²." },
      { term: "Kepler’in 1. yasası", definition: "Gezegenler, Güneş odaklarından birinde olacak şekilde elips yörüngelerde dolanır." },
      { term: "Kepler’in 2. yasası", definition: "Güneş–gezegen doğrusu eşit sürelerde eşit alanlar tarar; gezegen Güneş’e yakınken daha hızlıdır." },
      { term: "Kepler’in 3. yasası", definition: "Aynı yıldızın gezegenleri için T²/r³ oranı sabittir." },
    ],
    formulas: [
      { expr: "F = G·m₁·m₂ / r²", meaning: "Evrensel kütle çekim yasası." },
      { expr: "g = G·M / R²", meaning: "Gezegen yüzeyindeki çekim ivmesi." },
      { expr: "g_h = g·R² / (R + h)²", meaning: "Yüzeyden h yükseklikteki çekim ivmesi." },
      { expr: "v = √(G·M / r)", meaning: "Çembersel yörüngedeki uydunun hızı; kütlesinden bağımsız." },
      { expr: "T² / r³ = 4π² / (G·M) = sabit", meaning: "Kepler’in üçüncü yasası (Newton biçimi)." },
    ],
    logic:
      "Uydunun yörüngede kalmasının nedeni kütle çekiminin merkezcil kuvvet görevi görmesidir: GMm/r² = mv²/r. Bu eşitlikten uydunun kütlesi sadeleşir; bu yüzden aynı yörüngedeki bütün uydular aynı hızla döner. Yörünge büyüdükçe hız azalır, yol uzar ve periyot r^(3/2) ile artar.\n\nKepler’in ikinci yasası açısal momentumun korunumudur: Güneş’in uyguladığı kuvvet merkeze yönelik olduğundan tork sıfırdır, dolayısıyla m·v·r sabit kalır ve yakınken v büyür.",
    examples: [
      {
        level: "kolay",
        problem: "Kütlesi Dünya’nın 2 katı, yarıçapı 2 katı olan gezegende g kaçtır? (g_Dünya = 10 m/s²)",
        steps: ["g ∝ M/R² ⇒ g′ = 10·2/4.", "g′ = 5 m/s²."],
        answer: "5 m/s²",
      },
      {
        level: "orta",
        problem: "Güneş’e ortalama uzaklığı 4 AU olan gezegenin periyodu kaç yıldır?",
        steps: ["T² ∝ r³: T² = 4³ = 64 (Dünya için T = 1 yıl, r = 1 AU).", "T = 8 yıl."],
        answer: "8 yıl",
      },
    ],
    osymThinking:
      "Sorular oran üzerine kuruludur: kütle ve yarıçap katları verilir, g, ağırlık, yörünge hızı ya da periyot oranı istenir. Kepler yasaları öncüllü sorularda kavramsal olarak sınanır; özellikle eşit alanlar yasasının hız değişimi anlamına geldiği ve T²/r³ oranının yalnız merkezdeki kütleye bağlı olduğu ölçülür. Uzay istasyonundaki ağırlıksızlığın çekimin yokluğundan değil serbest düşmeden kaynaklandığı sık sorulan bir yanılgıdır.",
    commonMistakes: [
      "Uydunun yörünge hızının uydunun kütlesine bağlı olduğunu sanmak.",
      "Uzay istasyonunda kütle çekiminin sıfır olduğunu düşünmek.",
      "h yüksekliği yerine merkezden uzaklığı (R + h) kullanmayı unutmak.",
      "T²/r³ oranını farklı yıldızların gezegenleri arasında kullanmak.",
    ],
    tips: [
      "Oran sorularında sabitleri at: g ∝ M/R², v ∝ √(M/r), T ∝ √(r³/M).",
      "Yörünge yarıçapı 4 katına çıkarsa hız yarıya iner, periyot 8 katına çıkar.",
    ],
    summary: [
      "F = Gm₁m₂/r²; g = GM/R².",
      "Yörüngede çekim = merkezcil kuvvet; v = √(GM/r).",
      "Kepler: elips yörünge, eşit alanlar, T² ∝ r³.",
      "Ağırlıksızlık hissi serbest düşmedendir.",
    ],
  },
];
