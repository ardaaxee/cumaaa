import type { LessonSeed } from '../../domain/types';

export const lessons: LessonSeed[] = [
  {
    topicId: "aytfiz-basit-harmonik-hareket",
    intro:
      "Bir yayın ucuna bağlı cismi biraz çekip bıraktığında ileri geri gidip gelir; ipe bağlı bir taşı hafifçe yana çekip bıraktığında da aynı şeyi görürsün. Bu hareketlerin ortak noktası, cismi her an denge noktasına doğru geri çağıran bir kuvvetin olması ve bu kuvvetin cismin denge noktasından uzaklığıyla doğru orantılı olmasıdır. İşte bu özel salınım hareketine basit harmonik hareket (BHH) diyoruz.\n\nBHH’nin en güzel yanı, düzgün çembersel hareketin bir çap üzerindeki izdüşümü olmasıdır. Çember üzerinde sabit açısal hızla dönen bir noktanın gölgesini düşün: gölge bir uçtan diğerine gidip gelir, uçlarda durur, ortada en hızlıdır. Konum, hız ve ivme bağıntılarının hepsi bu resimden çıkar.\n\nYKS’de bu konu genellikle yay sarkacı ve basit sarkaç üzerinden sorulur. Periyodun neye bağlı olduğunu (kütle, yay sabiti, ip uzunluğu, çekim ivmesi) ve neye bağlı olmadığını (genlik) çok iyi bilmen gerekir. Bunun yanında denge noktası ile uç noktalar arasında hız, ivme, kuvvet ve enerjinin nasıl değiştiği grafik ve öncüllü sorularda sıkça karşına çıkar.",
    prerequisites: [
      "Düzgün çembersel hareket: açısal hız ω = 2π/T, çizgisel hız v = ωr, merkezcil ivme a = ω²r",
      "Hooke yasası: F = k·x ve yayda depolanan esneklik potansiyel enerjisi ½kx²",
      "Newton’un ikinci yasası (F = m·a) ve mekanik enerjinin korunumu",
      "Trigonometrik oranlar (sin, cos) ve dik üçgende Pisagor bağıntısı",
    ],
    concepts: [
      { term: "Basit harmonik hareket", definition: "Geri çağırıcı kuvvetin denge noktasından uzaklıkla doğru orantılı ve daima denge noktasına yönelik olduğu (F = −kx) periyodik salınım hareketi." },
      { term: "Denge noktası", definition: "Cisme etki eden net kuvvetin sıfır olduğu nokta. BHH’de hız ve kinetik enerji burada en büyük, ivme sıfırdır." },
      { term: "Genlik (A)", definition: "Cismin denge noktasından en fazla uzaklaştığı mesafe. Uç noktalarda hız sıfır, ivme ve geri çağırıcı kuvvet en büyüktür." },
      { term: "Periyot (T) ve frekans (f)", definition: "Bir tam salınım için geçen süre periyot, birim zamandaki salınım sayısı frekanstır; f = 1/T." },
      { term: "Uzanım (x)", definition: "Cismin herhangi bir andaki denge noktasına göre konumu (yer değiştirmesi). −A ≤ x ≤ +A aralığında değişir." },
      { term: "Yay sarkacı", definition: "Yaya bağlı kütleden oluşan salınıcı. Periyodu yalnızca kütle ve yay sabitine bağlıdır; bulunduğu yerin çekim ivmesinden bağımsızdır." },
      { term: "Basit sarkaç", definition: "Hafif ve esnemez ipe bağlı noktasal kütle. Küçük açılarla (yaklaşık 10°’den küçük) salındığında BHH yapar; periyodu ip uzunluğu ve çekim ivmesine bağlıdır." },
    ],
    formulas: [
      { expr: "F = −k·x  ve  a = −ω²·x", meaning: "Geri çağırıcı kuvvet ve ivme uzanımla doğru orantılı, yönü uzanıma zıttır." },
      { expr: "x = A·cos(ωt)  (ya da A·sin(ωt))", meaning: "Konumun zamanla değişimi; başlangıç koşuluna göre sin veya cos kullanılır." },
      { expr: "v = ω·√(A² − x²),  v_max = ω·A", meaning: "Herhangi bir konumdaki hız büyüklüğü; en büyük hız denge noktasındadır." },
      { expr: "a_max = ω²·A", meaning: "En büyük ivme uç noktalarda oluşur." },
      { expr: "T = 2π·√(m/k)", meaning: "Yay sarkacının periyodu; genlikten ve g’den bağımsızdır." },
      { expr: "T = 2π·√(L/g)", meaning: "Basit sarkacın periyodu (küçük açılar için); kütleden ve genlikten bağımsızdır." },
      { expr: "E = ½kA² = ½m·v_max² = ½kx² + ½mv²", meaning: "Toplam mekanik enerji sabittir; potansiyel ve kinetik enerji birbirine dönüşür." },
      { expr: "Seri: 1/k_eş = 1/k₁ + 1/k₂ ;  Paralel: k_eş = k₁ + k₂", meaning: "Yayların birleştirilmesiyle eşdeğer yay sabiti; periyotta k yerine k_eş yazılır." },
    ],
    logic:
      "Neden periyot genliğe bağlı değil? Genliği iki katına çıkardığında cisim iki kat yol alır ama geri çağırıcı kuvvet de uzanımla orantılı olduğu için her noktada ivmesi de iki kat olur. Daha uzun yol, daha büyük hızla gidilir; sonuçta bir tam salınımın süresi değişmez. BHH’yi özel yapan şey tam da bu orantılılıktır.\n\nYay sarkacında periyot neden √(m/k)? Kütle büyüdükçe cisim hızlanmaya direnir (eylemsizlik), yani yavaşlar ve periyot artar; yay sertleştikçe geri çağırıcı kuvvet artar, cisim daha çabuk geri döner ve periyot azalır. Yer çekimi burada yalnızca denge noktasını kaydırır, salınımın hızını belirlemez. Bu yüzden yay sarkacı Ay’da da Dünya’daki periyotla salınır.\n\nBasit sarkaçta ise geri çağırıcı kuvvet ağırlığın ipe dik bileşenidir: mg·sinθ. Kütle hem kuvvette hem eylemsizlikte bulunduğu için sadeleşir; geriye L ve g kalır. Bu nedenle ivmeli asansörde, farklı gezegende veya sıvı içinde (kaldırma kuvveti etkin g’yi değiştirir) basit sarkacın periyodu değişir. Enerji açısından bakarsak, uç noktada enerjinin tamamı potansiyel, denge noktasında tamamı kinetiktir; aradaki her konumda toplam sabittir.",
    examples: [
      {
        level: "kolay",
        problem: "Kütlesi 1 kg olan cisim, yay sabiti 100 N/m olan yaya bağlanarak 0,2 m genlikle salındırılıyor. Cismin en büyük hızı ve periyodu nedir? (π = 3)",
        steps: [
          "Açısal frekans: ω = √(k/m) = √(100/1) = 10 rad/s.",
          "En büyük hız denge noktasındadır: v_max = ωA = 10·0,2 = 2 m/s.",
          "Periyot: T = 2π/ω = 2·3/10 = 0,6 s.",
        ],
        answer: "v_max = 2 m/s, T = 0,6 s",
      },
      {
        level: "orta",
        problem: "Bir basit sarkacın Dünya’daki periyodu 2 s’dir. Aynı sarkaç, çekim ivmesi Dünya’nınkinin 1/4’ü olan bir gezegene götürülürse periyodu kaç s olur? Aynı soruyu bir yay sarkacı için cevaplayınız.",
        steps: [
          "Basit sarkaç: T ∝ √(1/g). g dörtte birine inerse T, √4 = 2 katına çıkar.",
          "Yeni periyot: 2·2 = 4 s.",
          "Yay sarkacının periyodu T = 2π√(m/k) g’ye bağlı olmadığı için değişmez.",
        ],
        answer: "Basit sarkaç 4 s; yay sarkacının periyodu değişmez.",
      },
      {
        level: "zor",
        problem: "Yay sabiti 400 N/m olan yaya bağlı 1 kg’lık cisim 0,1 m genlikle yatay sürtünmesiz düzlemde BHH yapıyor. Cismin kinetik enerjisinin potansiyel enerjisine eşit olduğu konumdaki hızı kaç m/s’dir?",
        steps: [
          "Toplam enerji: E = ½kA² = ½·400·0,01 = 2 J.",
          "Ek = Ep ise her biri E/2 = 1 J olur.",
          "½kx² = 1 → x² = 2/400 = 0,005 → x = A/√2 ≈ 0,071 m.",
          "½mv² = 1 → v² = 2 → v = √2 ≈ 1,41 m/s.",
          "Kontrol: v_max = ωA = 20·0,1 = 2 m/s; v = v_max/√2 = √2 m/s, tutarlı.",
        ],
        answer: "v = √2 m/s (≈ 1,41 m/s)",
      },
    ],
    osymThinking:
      "Sorular genellikle periyodun neye bağlı olduğunu ölçer: soru metnine gereksiz bilgi (genlik, kütle, gezegen) koyup öğrencinin bunları periyoda katıp katmadığına bakılır. İvmeli asansör, sıvı ortam ya da başka gezegen senaryoları basit sarkacın etkin g’sini değiştirir, yay sarkacını etkilemez. Grafik sorularında x–t, v–t, a–t grafiklerinin faz ilişkisi ve a–x grafiğinin eğiminden ω² bulunması istenir. Enerji sorularında ise x = A/2 gibi özel konumlarda Ek/E oranı sorulur.",
    commonMistakes: [
      "Genlik artınca periyodun da arttığını sanmak (BHH’de periyot genlikten bağımsızdır).",
      "Yay sarkacının periyodunun g’ye bağlı olduğunu düşünmek; Ay’da yay sarkacının periyodu değişmez.",
      "Basit sarkacın periyoduna kütleyi katmak.",
      "Denge noktasında ivmenin de en büyük olduğunu sanmak; denge noktasında hız en büyük, ivme sıfırdır.",
      "x = A/2 konumunda kinetik enerjinin toplam enerjinin yarısı olduğunu sanmak; doğrusu 3/4’üdür.",
      "Seri bağlı yaylarda eşdeğer yay sabitini toplama ile bulmak (seride eşdeğer k küçülür).",
    ],
    tips: [
      "Periyot sorusunda önce ‘hangi sarkaç?’ diye sor: yay sarkacı → m ve k; basit sarkaç → L ve g.",
      "Düşey yay sarkacında dengedeki uzama Δx ise mg = kΔx olduğundan T = 2π√(Δx/g) yazabilirsin.",
      "Asansör yukarı yönde a ivmesiyle ivmeleniyorsa g_etkin = g + a, aşağı yönde ivmeleniyorsa g_etkin = g − a.",
      "Enerji oranları: x = A/2’de Ep = E/4, Ek = 3E/4; Ek = Ep olduğu konum x = A/√2.",
    ],
    summary: [
      "BHH’de F = −kx ve a = −ω²x: kuvvet ve ivme daima denge noktasına yöneliktir.",
      "Denge noktası: v en büyük (ωA), a = 0. Uç noktalar: v = 0, a en büyük (ω²A).",
      "Yay sarkacı: T = 2π√(m/k), g’den ve genlikten bağımsız.",
      "Basit sarkaç: T = 2π√(L/g), kütleden ve (küçük açılarda) genlikten bağımsız.",
      "Toplam enerji E = ½kA² sabittir; Ep ve Ek birbirine dönüşür.",
      "İvmeli asansör ve başka gezegenler yalnız basit sarkacın periyodunu değiştirir.",
    ],
  },
  {
    topicId: "aytfiz-dalga-mekanigi",
    intro:
      "Dalgalar yalnızca yansıyıp kırılmaz; bir engelin kenarından dolanabilir ve birbirleriyle üst üste binerek güçlenip zayıflayabilir. Bu iki davranışa kırınım ve girişim diyoruz. Işığın dalga olduğunu kesin olarak gösteren de bu olaylardır: Thomas Young’ın çift yarık deneyi, ışığın parçacık modeliyle açıklanamayan aydınlık–karanlık saçaklar üretmiştir.\n\nKonuya dalga leğeninde su dalgalarıyla başlarız çünkü orada her şeyi gözle görebiliriz. Dar bir aralıktan geçen dalga çembersel olarak yayılır (kırınım), iki noktasal kaynaktan çıkan dalgalar ise katar (güçlendirici) ve düğüm (söndürücü) çizgileri oluşturur (girişim). Aynı mantık ışıkta çift yarık ve tek yarık deneylerine taşınır.\n\nKonunun son parçası Doppler olayıdır: kaynak ile gözlemci birbirine yaklaşırken algılanan frekans artar, uzaklaşırken azalır. Ambulans sireninden galaksilerin kırmızıya kaymasına, trafik radarlarından tıbbi ultrasona kadar pek çok uygulama bu olaya dayanır. YKS’de hem hesap hem yorum sorusu olarak karşına çıkar.",
    prerequisites: [
      "Dalga denklemi: v = λ·f ve periyot–frekans ilişkisi",
      "Su dalgalarında derinlik–hız ilişkisi ve dalga leğeni düzeneği",
      "Işığın kırılması ve kırıcılık indisi: ortamda λ_ortam = λ_boşluk/n",
      "Üst üste binme (süperpozisyon) ilkesi: tepe + tepe güçlenir, tepe + çukur söner",
    ],
    concepts: [
      { term: "Kırınım", definition: "Dalganın bir engelin kenarından ya da dar bir aralıktan geçerken doğrusal yayılmadan sapıp engelin arkasına dolanması. Aralık genişliği dalga boyuna yaklaştıkça (w ≤ λ) belirginleşir." },
      { term: "Girişim", definition: "Aynı fazda ve aynı frekanslı (eş fazlı) iki dalganın üst üste binerek bazı noktalarda güçlendirici, bazı noktalarda söndürücü etki oluşturması." },
      { term: "Katar (dalgalı) çizgi", definition: "Yol farkının dalga boyunun tam katı olduğu noktaların oluşturduğu, en büyük genlikli titreşimlerin gözlendiği çizgi; ışıkta aydınlık saçak." },
      { term: "Düğüm çizgisi", definition: "Yol farkının yarım dalga boyunun tek katı olduğu, dalgaların birbirini söndürdüğü çizgi; ışıkta karanlık saçak." },
      { term: "Saçak genişliği (Δx)", definition: "Çift yarık deneyinde ardışık iki aydınlık (ya da iki karanlık) saçak arasındaki uzaklık." },
      { term: "Merkezi aydınlık saçak", definition: "Çift yarıkta yol farkının sıfır olduğu orta aydınlık; tek yarıkta ise genişliği diğer saçakların iki katı olan en parlak orta bölge." },
      { term: "Doppler olayı", definition: "Kaynak ile gözlemci arasında bağıl hareket olduğunda gözlemcinin algıladığı frekansın kaynağın yaydığı frekanstan farklı olması." },
    ],
    formulas: [
      { expr: "Katar: |PK − PL| = n·λ  (n = 0, 1, 2 …)", meaning: "n. katar (aydınlık) çizgisindeki noktanın kaynaklara uzaklıkları farkı." },
      { expr: "Düğüm: |PK − PL| = (n − ½)·λ  (n = 1, 2 …)", meaning: "n. düğüm (karanlık) çizgisi için yol farkı." },
      { expr: "Δx = λ·L/d", meaning: "Çift yarıkta saçak genişliği; L yarık–perde uzaklığı, d yarıklar arası uzaklık." },
      { expr: "x_n(aydınlık) = n·Δx ;  x_n(karanlık) = (n − ½)·Δx", meaning: "Merkezden n. aydınlık ve n. karanlık saçağa uzaklık (çift yarık)." },
      { expr: "Tek yarık: merkezi aydınlık genişliği = 2·λ·L/w", meaning: "w yarık genişliği; yan saçakların genişliği λL/w’dir." },
      { expr: "Ortamda: Δx_ortam = Δx_hava / n", meaning: "Düzenek kırıcılık indisi n olan sıvıya daldırılırsa dalga boyu ve saçak genişliği n kat küçülür." },
      { expr: "f′ = f·(v ± v_g)/(v ∓ v_k)", meaning: "Ses için Doppler: pay ve paydadaki işaretler yaklaşma durumunda frekansı artıracak şekilde seçilir (v ses hızı, v_g gözlemci, v_k kaynak hızı)." },
      { expr: "Δλ/λ ≈ v/c  (v ≪ c)", meaning: "Işıkta Doppler kayması; uzaklaşan kaynakta dalga boyu artar (kırmızıya kayma)." },
    ],
    logic:
      "Girişimde her şey yol farkına bağlıdır. İki kaynak aynı fazda titreşiyorsa, bir noktaya varan dalgaların yolları arasındaki fark tam dalga boyu kadarsa tepe tepeyle buluşur ve genlik büyür; yarım dalga boyunun tek katı kadarsa tepe çukurla buluşur ve dalgalar birbirini söndürür. Katar ve düğüm çizgilerinin sırası da bu yüzden n·λ ve (n − ½)·λ ile verilir.\n\nÇift yarıkta saçak genişliğinin Δx = λL/d olması sezgiseldir: perde uzaklaştıkça (L büyüdükçe) saçaklar açılır, yarıklar birbirine yaklaştıkça (d küçüldükçe) açı farkları büyür ve saçaklar genişler, dalga boyu büyüdükçe aynı yol farkı için daha uzun mesafe gerekir. Kırmızı ışık mora göre, havadaki düzenek sudakine göre daha geniş saçak verir.\n\nDoppler olayında kaynak hareket ettiğinde dalga tepeleri hareket yönünde sıkışır, arkada seyrekleşir. Önde dalga boyu kısalır, gözlemciye birim zamanda daha çok tepe ulaşır, frekans artar. Önemli olan kaynağın yaydığı frekansın değişmediği, yalnızca algılanan frekans ve dalga boyunun değiştiğidir. Dalganın ortamdaki hızı ise yalnızca ortama bağlıdır.",
    examples: [
      {
        level: "kolay",
        problem: "Dalga leğeninde aynı fazda çalışan K ve L kaynaklarının oluşturduğu dalgaların boyu 2 cm’dir. P noktasının kaynaklara uzaklıkları PK = 9 cm, PL = 14 cm ise P hangi çizgi üzerindedir?",
        steps: [
          "Yol farkı: |14 − 9| = 5 cm.",
          "5 cm = 2,5·λ = (3 − ½)·λ.",
          "Yol farkı yarım dalga boyunun tek katı olduğundan P bir düğüm çizgisindedir; n = 3.",
        ],
        answer: "3. düğüm çizgisi",
      },
      {
        level: "orta",
        problem: "Çift yarık deneyinde λ = 500 nm, d = 0,5 mm ve L = 2 m’dir. Merkezi aydınlık saçak ile 2. karanlık saçak arasındaki uzaklık kaç mm’dir?",
        steps: [
          "Δx = λL/d = (5·10⁻⁷·2)/(5·10⁻⁴) = 2·10⁻³ m = 2 mm.",
          "n. karanlık saçak: x = (n − ½)·Δx.",
          "2. karanlık için x = 1,5·2 = 3 mm.",
        ],
        answer: "3 mm",
      },
      {
        level: "zor",
        problem: "Frekansı 510 Hz olan siren çalan bir ambulans, duran bir gözlemciye 30 m/s hızla yaklaşıp sonra aynı hızla uzaklaşıyor. Ses hızı 340 m/s’dir. Gözlemcinin yaklaşma ve uzaklaşma sırasında duyduğu frekanslar arasındaki fark yaklaşık kaç Hz’dir?",
        steps: [
          "Yaklaşırken: f₁ = f·v/(v − v_k) = 510·340/310 ≈ 559,4 Hz.",
          "Uzaklaşırken: f₂ = f·v/(v + v_k) = 510·340/370 ≈ 468,6 Hz.",
          "Fark: 559,4 − 468,6 ≈ 90,8 Hz.",
          "Kaynağın yaydığı frekans (510 Hz) hiç değişmemiştir; değişen yalnızca algılanan frekanstır.",
        ],
        answer: "≈ 91 Hz",
      },
    ],
    osymThinking:
      "Soru çoğu zaman saçak genişliğini doğrudan sormaz; ‘merkezden 3. karanlık saçağa uzaklık’, ‘2. aydınlık ile 3. karanlık arası’ ya da ‘düzenek suya daldırılırsa’ gibi ek adımlar ister. Öncüllü sorularda d, L, λ ve ortam değişikliklerinin saçak genişliğine etkisi karıştırılarak verilir. Dalga leğeni sorularında yol farkından çizgi numarası bulunur. Doppler sorularında ise kaynağın frekansının değiştiği yanılgısı ve ‘dalga hızı değişir’ tuzağı ölçülür.",
    commonMistakes: [
      "n. karanlık saçağın uzaklığını n·Δx sanmak; doğrusu (n − ½)·Δx’tir.",
      "Düzenek suya daldırıldığında saçakların genişlediğini düşünmek; dalga boyu küçüldüğü için daralır.",
      "Tek yarıkta yarık genişliği artınca merkezi saçağın genişlediğini sanmak; ters orantılıdır, daralır.",
      "Doppler olayında kaynağın yaydığı frekansın değiştiğini ya da ses hızının değiştiğini söylemek.",
      "Düğüm çizgilerini numaralarken n·λ kullanmak; düğümde yol farkı (n − ½)·λ’dir.",
      "Kırınımın aralık dalga boyundan çok büyükken belirgin olduğunu sanmak.",
    ],
    tips: [
      "Saçak sorusunda önce Δx’i bul, sonra aydınlık için n·Δx, karanlık için (n − ½)·Δx yaz.",
      "Aynı taraftaki iki saçak arası: uzaklıkları çıkar; zıt taraftaki iki saçak arası: uzaklıkları topla.",
      "Kırmızı → uzun λ → geniş saçak; mor → kısa λ → dar saçak.",
      "Doppler: ‘yaklaşma = yüksek frekans, kısa dalga boyu’; ‘uzaklaşma = düşük frekans, uzun dalga boyu (kırmızıya kayma)’.",
    ],
    summary: [
      "Kırınım, aralık dalga boyuna yaklaştıkça belirginleşir (w ≤ λ).",
      "Katar: yol farkı nλ; düğüm: yol farkı (n − ½)λ.",
      "Çift yarık: Δx = λL/d; aydınlık n·Δx, karanlık (n − ½)·Δx.",
      "Tek yarık: merkezi aydınlık 2λL/w genişliğinde, yan saçakların iki katı.",
      "Sıvı içinde λ ve saçak genişliği n kat küçülür.",
      "Doppler: yaklaşmada algılanan frekans artar, uzaklaşmada azalır; kaynak frekansı değişmez.",
    ],
  },
  {
    topicId: "aytfiz-em-dalgalar",
    intro:
      "Elektromanyetik dalgalar, birbirine ve yayılma doğrultusuna dik olarak titreşen elektrik ve manyetik alanlardan oluşur. Ses gibi mekanik dalgaların aksine yayılmak için maddesel ortama ihtiyaç duymazlar; Güneş ışığı boşluktan geçerek bize ulaşır. Boşluktaki hızları, frekansları ne olursa olsun c = 3·10⁸ m/s’dir.\n\nRadyo dalgalarından gama ışınlarına kadar uzanan bu aileye elektromanyetik spektrum denir. Frekans arttıkça dalga boyu kısalır, foton enerjisi artar ve ışımanın madde ile etkileşimi değişir. YKS’de spektrumun sıralaması, dalgaların üretilme yolları ve günlük hayattaki kullanım alanları sıkça sorulur.",
    prerequisites: [
      "Dalga denklemi v = λ·f",
      "Elektrik alan ve manyetik alan kavramları; değişen manyetik alanın elektrik alan oluşturması (indüksiyon)",
      "Işığın yansıma ve kırılması",
    ],
    concepts: [
      { term: "Elektromanyetik dalga", definition: "İvmeli hareket eden yüklerin oluşturduğu, elektrik ve manyetik alan titreşimlerinden oluşan enine dalga. Boşlukta c hızıyla yayılır." },
      { term: "Elektromanyetik spektrum", definition: "EM dalgaların frekansa göre sıralanışı: radyo, mikrodalga, kızılötesi, görünür ışık, morötesi, X ışınları, gama ışınları (frekans artan yönde)." },
      { term: "İyonlaştırıcı ışıma", definition: "Atomdan elektron koparabilecek kadar yüksek foton enerjisine sahip ışıma; yüksek enerjili morötesi, X ve gama ışınları." },
      { term: "Enine dalga", definition: "Titreşim doğrultusu yayılma doğrultusuna dik olan dalga; EM dalgalar enine olduğu için kutuplanabilir." },
    ],
    formulas: [
      { expr: "c = λ·f = 3·10⁸ m/s", meaning: "Boşlukta tüm EM dalgalar için geçerlidir; frekans ile dalga boyu ters orantılıdır." },
      { expr: "E = h·f = h·c/λ", meaning: "EM dalganın bir fotonunun enerjisi; frekansla doğru orantılıdır." },
      { expr: "E_alan = c·B_alan", meaning: "Elektrik ve manyetik alan genlikleri arasındaki ilişki." },
      { expr: "d = c·t/2", meaning: "Radar ve yankı ölçümlerinde gidiş–dönüş süresinden uzaklık hesabı." },
    ],
    logic:
      "Maxwell’e göre değişen bir elektrik alan manyetik alan, değişen bir manyetik alan da elektrik alan oluşturur. Bu iki alan birbirini besleyerek uzayda ilerler; bu yüzden EM dalgalar ortama ihtiyaç duymaz. Durgun ya da sabit hızlı bir yük dalga yaymaz, çünkü alanlar zamanla değişmez; ivmeli yük ise dalga yayar. Anten içindeki elektronların ileri geri salınımı radyo dalgalarını, atomlardaki elektron geçişleri görünür ve morötesi ışığı, çekirdek geçişleri gama ışınlarını, hızlı elektronların ani yavaşlaması X ışınlarını üretir. Frekans arttıkça foton enerjisi artar; bu yüzden gama ve X ışınları dokuya zarar verirken radyo dalgaları vermez.",
    examples: [
      {
        level: "kolay",
        problem: "Frekansı 150 MHz olan bir radyo dalgasının boşluktaki dalga boyu kaç m’dir?",
        steps: [
          "λ = c/f = 3·10⁸ / 1,5·10⁸.",
          "λ = 2 m.",
        ],
        answer: "2 m",
      },
      {
        level: "orta",
        problem: "Bir radar sinyali bir uçağa çarpıp 4·10⁻⁴ s sonra radara geri dönüyor. Uçağın radara uzaklığı kaç km’dir?",
        steps: [
          "Sinyal gidip geri döndüğü için toplam yol 2d’dir: 2d = c·t.",
          "d = 3·10⁸·4·10⁻⁴/2 = 6·10⁴ m.",
          "d = 60 km.",
        ],
        answer: "60 km",
      },
    ],
    osymThinking:
      "Sorular spektrum sıralamasını doğrudan sormak yerine kullanım alanları, üretim yolları ya da frekans–dalga boyu değerleri üzerinden gizler. Öncüllü sorularda ‘tüm EM dalgalar boşlukta aynı hızla yayılır’ doğru, ‘sabit hızlı yük EM dalga yayar’ yanlış gibi kavramsal ayrımlar ölçülür. Hesap sorularında c = λf ve radar süresinde ikiye bölme adımı test edilir.",
    commonMistakes: [
      "Frekansı büyük olan EM dalganın boşlukta daha hızlı yayıldığını sanmak.",
      "Radar ya da yankı hesabında süreyi ikiye bölmeyi unutmak.",
      "Radyo dalgalarını ses dalgası sanmak; radyo dalgaları EM dalgadır, ses mekanik dalgadır.",
      "Mikrodalga ile kızılötesinin yerini spektrumda karıştırmak.",
    ],
    tips: [
      "Sıralama cümlesi: ‘Radyo Mikro Kızıl Görür, Mor X Gamayla’ (frekans artar, dalga boyu azalır).",
      "Birimlere dikkat: MHz = 10⁶ Hz, GHz = 10⁹ Hz, nm = 10⁻⁹ m.",
      "Boşlukta iki EM dalganın dalga boyu oranı, frekans oranının tersidir.",
    ],
    summary: [
      "EM dalgalar enine dalgadır, ortam gerektirmez, boşlukta hızları c’dir.",
      "İvmeli yükler EM dalga yayar; sabit hızlı yükler yaymaz.",
      "Spektrum (frekans artan): radyo < mikrodalga < kızılötesi < görünür < morötesi < X < gama.",
      "Foton enerjisi E = hf; yüksek frekanslı ışımalar iyonlaştırıcıdır.",
    ],
  },
  {
    topicId: "aytfiz-atom-fizigi-radyoaktivite",
    intro:
      "Atomun yapısına dair fikirlerimiz deneylerle adım adım değişti. Thomson atomu pozitif bir küre içine gömülü elektronlar olarak düşündü. Rutherford’un altın levha deneyinde alfa parçacıklarının çok küçük bir kısmının geri saçılması, pozitif yükün ve kütlenin küçük bir çekirdekte toplandığını gösterdi. Bohr ise elektronların yalnızca belirli enerji düzeylerinde bulunabildiğini ve düzeyler arası geçişlerde belirli enerjili fotonlar yayıldığını öne sürerek hidrojenin çizgi spektrumunu açıkladı.\n\nÇekirdeğe indiğimizde bazı çekirdeklerin kararsız olduğunu ve alfa, beta ya da gama ışıması yaparak bozunduğunu görürüz. Bozunma rastgeledir ama çok sayıda çekirdek için yarı ömür ile düzenli biçimde tanımlanır. Fisyon ve füzyon tepkimelerinde ise kütle açığı enerjiye dönüşür; nükleer santraller ve yıldızlar bu enerjiyle çalışır.",
    prerequisites: [
      "Atomun temel yapısı: proton, nötron, elektron; atom ve kütle numarası",
      "Foton enerjisi E = hf = hc/λ ve eV birimi (1 eV = 1,6·10⁻¹⁹ J)",
      "Üslü sayılar ve 2’nin kuvvetleri",
    ],
    concepts: [
      { term: "Bohr atom modeli", definition: "Elektron çekirdek etrafında yalnızca belirli (kuantumlu) enerji düzeylerindeki yörüngelerde bulunur; bu yörüngelerde ışıma yapmaz, düzeyler arası geçişte enerji farkı kadar foton salar ya da soğurur." },
      { term: "Uyarılma", definition: "Atomun temel hâlden daha yüksek bir enerji düzeyine geçmesi. Fotonla uyarılmada foton enerjisi düzey farkına tam eşit olmalıdır; elektronla uyarılmada elektronun enerjisi düzey farkına eşit ya da büyük olmalıdır." },
      { term: "Çizgi spektrumu", definition: "Gazların yaydığı ya da soğurduğu belirli dalga boylarından oluşan spektrum. Her element için karakteristiktir (parmak izi)." },
      { term: "İyonlaşma enerjisi", definition: "Temel hâldeki elektronu atomdan tamamen koparmak için gereken en küçük enerji; hidrojen için 13,6 eV." },
      { term: "Yarı ömür", definition: "Radyoaktif bir örnekteki çekirdeklerin yarısının bozunması için geçen süre; sıcaklık, basınç ve kimyasal bağdan bağımsızdır." },
      { term: "Alfa, beta, gama bozunması", definition: "Alfa: çekirdek ⁴₂He salar (A − 4, Z − 2). Beta eksi: nötron protona dönüşür, elektron salınır (A sabit, Z + 1). Gama: uyarılmış çekirdek foton salar (A ve Z değişmez)." },
      { term: "Fisyon ve füzyon", definition: "Fisyon: ağır çekirdeğin daha hafif çekirdeklere bölünmesi (nükleer santral). Füzyon: hafif çekirdeklerin birleşerek daha ağır çekirdek oluşturması (Güneş). İkisinde de kütle açığı enerjiye dönüşür." },
    ],
    formulas: [
      { expr: "E_n = −13,6/n² eV", meaning: "Hidrojen atomunun n. enerji düzeyinin enerjisi." },
      { expr: "E_foton = E_üst − E_alt = hc/λ", meaning: "Düzeyler arası geçişte yayılan veya soğurulan fotonun enerjisi." },
      { expr: "Farklı çizgi sayısı = n(n − 1)/2", meaning: "n. düzeye uyarılmış atomların temel hâle dönerken yayabileceği farklı foton sayısı." },
      { expr: "N = N₀·(1/2)^(t/T½)", meaning: "t süre sonunda bozunmadan kalan çekirdek sayısı (ya da kütle, aktivite)." },
      { expr: "E = Δm·c²  (1 u ↔ 931,5 MeV)", meaning: "Kütle açığının enerji karşılığı." },
    ],
    logic:
      "Bohr modelinde enerji düzeyleri kesikli olduğu için atom her enerjiyi alamaz. Foton ‘ya hep ya hiç’ soğurulur: enerjisi iki düzey farkına tam eşit değilse atom onu soğurmaz. Elektron ise çarpışmada enerjisinin bir kısmını bırakıp kalanıyla yoluna devam edebilir; bu yüzden elektronla uyarılmada enerjinin düzey farkından büyük olması yeterlidir. Uyarılan atom kararsızdır ve kısa sürede daha alt düzeylere inerek fotonlar yayar; her geçişin enerjisi farklı olduğundan spektrumda ayrı çizgiler görülür.\n\nRadyoaktif bozunma istatistikseldir: tek bir çekirdeğin ne zaman bozunacağı bilinemez, ama her yarı ömürde kalan miktar yarıya iner. Alfa bozunmasında kütle numarası 4, atom numarası 2 azalır; beta eksi bozunmasında bir nötron protona dönüştüğü için atom numarası 1 artar. Bu sayım kurallarıyla bozunma serileri çözülür.",
    examples: [
      {
        level: "kolay",
        problem: "Yarı ömrü 3 gün olan radyoaktif bir maddenin 64 g’ı 12 gün sonra kaç g kalır?",
        steps: [
          "Geçen yarı ömür sayısı: 12/3 = 4.",
          "Kalan: 64·(1/2)⁴ = 64/16 = 4 g.",
        ],
        answer: "4 g",
      },
      {
        level: "orta",
        problem: "Hidrojen atomunda elektron n = 4 düzeyinden n = 2 düzeyine geçiyor. Yayılan fotonun enerjisi kaç eV’dir?",
        steps: [
          "E₄ = −13,6/16 = −0,85 eV, E₂ = −13,6/4 = −3,4 eV.",
          "E_foton = E₄ − E₂ = −0,85 − (−3,4) = 2,55 eV.",
          "Bu foton görünür bölgededir (Balmer serisi, mavi-yeşil çizgi).",
        ],
        answer: "2,55 eV",
      },
      {
        level: "zor",
        problem: "²³²₉₀Th çekirdeği bir dizi bozunma sonucunda ²⁰⁸₈₂Pb çekirdeğine dönüşüyor. Kaç alfa ve kaç beta eksi bozunması olmuştur?",
        steps: [
          "Kütle numarası yalnız alfa ile değişir: (232 − 208)/4 = 6 alfa.",
          "6 alfa, atom numarasını 12 azaltır: 90 − 12 = 78.",
          "Son atom numarası 82 olmalı: 82 − 78 = 4 beta eksi bozunması.",
        ],
        answer: "6 alfa, 4 beta eksi",
      },
    ],
    osymThinking:
      "Enerji düzeyi soruları genellikle bir tablo ya da diyagramla verilir ve ‘foton mu elektron mu gönderildi?’ ayrımı asıl ölçülen beceridir. Bozunma sorularında önce alfa sayısı kütle numarasından, sonra beta sayısı atom numarasından bulunur. Yarı ömür soruları grafik (N–t) ile verilip grafikten yarı ömrü okumak, sonra ileri bir zamana taşımak istenir. Fisyon–füzyon öncüllerinde kütle açığı ve örnek uygulamalar karıştırılır.",
    commonMistakes: [
      "Fotonun, enerjisi düzey farkından büyükse de soğurulabileceğini sanmak (iyonlaşma dışında tam eşitlik gerekir).",
      "Beta eksi bozunmasında atom numarasının azaldığını düşünmek; bir artar.",
      "Yarı ömrü, maddenin tamamen bitme süresinin yarısı sanmak.",
      "Yarı ömrün sıcaklık veya basınçla değiştiğini düşünmek.",
    ],
    tips: [
      "Bozunma serisinde her zaman önce alfa sayısını bul (A farkı / 4), sonra beta sayısını Z dengesinden çıkar.",
      "Elektronla bombardımanda: elektron enerjisinden küçük ya da eşit olan tüm düzey farklarına uyarılma mümkündür.",
      "Yarı ömür sorularında 2’nin kuvvetleri tablosunu ezbere bil: 2, 4, 8, 16, 32, 64, 128.",
    ],
    summary: [
      "Thomson → Rutherford (çekirdek) → Bohr (kesikli enerji düzeyleri) → modern atom modeli.",
      "Geçişte yayılan foton enerjisi = düzey farkı; hidrojen için E_n = −13,6/n² eV.",
      "Alfa: A − 4, Z − 2; beta eksi: Z + 1; gama: değişmez.",
      "Kalan miktar N = N₀·(1/2)^(t/T½); yarı ömür dış koşullardan bağımsızdır.",
      "Fisyon (bölünme, santral) ve füzyon (birleşme, Güneş) kütle açığından enerji üretir.",
    ],
  },
  {
    topicId: "aytfiz-modern-fizik",
    intro:
      "19. yüzyılın sonunda fizikçiler, Newton mekaniği ve Maxwell’in elektromanyetizmasıyla neredeyse her şeyin açıklandığını düşünüyordu. Ama birkaç ‘küçük’ problem çözülemiyordu: ışık hızının her gözlemci için aynı ölçülmesi, sıcak cisimlerin yaydığı ışımanın dağılımı ve metal yüzeye düşen ışığın elektron koparması. Bu problemleri çözmek için iki yeni fizik doğdu: görelilik ve kuantum.\n\nEinstein’ın özel görelilik kuramı, yüksek hızlarda zamanın yavaş aktığını (zaman genişlemesi), boyların kısaldığını (boy kısalması) ve kütle ile enerjinin eşdeğer olduğunu (E = mc²) gösterdi. Kuantum tarafında Planck enerjinin paketler hâlinde yayıldığını, Einstein ışığın foton adı verilen paketlerden oluştuğunu, Compton fotonların momentum taşıdığını, de Broglie ise maddenin de dalga özelliği gösterdiğini ortaya koydu.\n\nYKS’de bu konu çok sevilir çünkü hem kavramsal hem hesaplı sorulara uygundur. Fotoelektrik olayda eşik frekansı, bağlanma enerjisi ve durdurma gerilimi; görelilikte γ çarpanı; de Broglie dalga boyunda momentum ilişkisi mutlaka iyi öğrenilmelidir.",
    prerequisites: [
      "Dalga denklemi (c = λf) ve elektromanyetik spektrum",
      "Kinetik enerji ve momentum: Ek = ½mv², p = mv, Ek = p²/2m",
      "Elektrik potansiyel enerji: yükün potansiyel farkında kazandığı enerji qV (eV birimi)",
      "Enerji ve momentum korunumu, çarpışmalar",
    ],
    concepts: [
      { term: "Özel göreliliğin postulatları", definition: "1) Fizik yasaları tüm eylemsiz gözlem çerçevelerinde aynıdır. 2) Işığın boşluktaki hızı, kaynağın ve gözlemcinin hareketinden bağımsız olarak tüm eylemsiz gözlemciler için c’dir." },
      { term: "Zaman genişlemesi ve öz zaman", definition: "Olaya göre durgun gözlemcinin ölçtüğü süre öz zamandır (t₀). Olaya göre hareketli gözlemci daha uzun süre ölçer: t = γ·t₀." },
      { term: "Boy kısalması ve öz uzunluk", definition: "Cisme göre durgun gözlemcinin ölçtüğü uzunluk öz uzunluktur (L₀). Hareket doğrultusundaki uzunluk hareketli gözlemciye kısa görünür: L = L₀/γ." },
      { term: "Kara cisim ışıması", definition: "Üzerine düşen tüm ışımayı soğuran ideal cismin sıcaklığına bağlı olarak yaydığı ışıma. Sıcaklık artınca toplam ışıma artar ve tepe dalga boyu kısa dalga boylarına kayar (Wien). Planck bu dağılımı enerjinin hf paketleri hâlinde yayıldığını varsayarak açıkladı." },
      { term: "Fotoelektrik olay", definition: "Yeterince yüksek frekanslı ışık metal yüzeye düştüğünde yüzeyden elektron sökülmesi. Eşik frekansının altında şiddet ne kadar büyük olursa olsun elektron sökülmez." },
      { term: "Bağlanma enerjisi (iş fonksiyonu, E₀)", definition: "Metal yüzeyden bir elektronu koparmak için gereken en küçük enerji; E₀ = h·f₀." },
      { term: "Compton olayı", definition: "X ışını fotonunun serbest (ya da zayıf bağlı) elektronla esnek çarpışması; saçılan fotonun enerjisi azalır, dalga boyu artar. Enerji ve momentum korunur; fotonun momentum taşıdığını gösterir." },
      { term: "de Broglie dalga boyu", definition: "Momentumu p olan her parçacığa λ = h/p dalga boyunda bir madde dalgası eşlik eder. Elektron kırınımı deneyleriyle doğrulanmıştır." },
    ],
    formulas: [
      { expr: "γ = 1/√(1 − v²/c²)", meaning: "Lorentz çarpanı; v = 0,6c için γ = 1,25; v = 0,8c için γ = 5/3." },
      { expr: "t = γ·t₀ ;  L = L₀/γ", meaning: "Zaman genişlemesi ve boy kısalması." },
      { expr: "E₀ = mc² ;  E = γmc² ;  Ek = (γ − 1)mc²", meaning: "Durgun kütle enerjisi, toplam enerji ve göreli kinetik enerji." },
      { expr: "E = h·f = h·c/λ", meaning: "Foton enerjisi (Planck–Einstein)." },
      { expr: "Ek_max = h·f − E₀ = h·(f − f₀)", meaning: "Einstein’ın fotoelektrik denklemi; Ek–f grafiğinin eğimi h’dir." },
      { expr: "e·V_k = Ek_max", meaning: "Kesme (durdurma) gerilimi; en hızlı fotoelektronu durduran gerilim." },
      { expr: "p = h/λ ;  λ = h/(m·v) = h/√(2m·Ek)", meaning: "Foton momentumu ve de Broglie dalga boyu." },
      { expr: "λ_max·T = sabit", meaning: "Wien kayma yasası: sıcaklık arttıkça tepe dalga boyu azalır." },
    ],
    logic:
      "Işık hızı herkes için aynıysa, farklı hızlardaki gözlemcilerin aynı ışık atımının aldığı yolu farklı görmesi ancak zaman ve uzunluk ölçümlerinin farklı olmasıyla mümkündür. Hareketli bir saatin içindeki ışık, yerdeki gözlemciye eğik (daha uzun) bir yol izliyor gibi görünür; ışık hızı sabit olduğundan bu yolu almak için daha uzun süre gerekir. İşte zaman genişlemesi budur ve boy kısalması da onun doğal sonucudur. Günlük hızlarda γ ≈ 1 olduğundan bu etkileri fark etmeyiz.\n\nFotoelektrik olayda dalga modeli, şiddetli ışığın her frekansta elektron koparması gerektiğini söyler; deney ise eşik frekansının altında hiç elektron çıkmadığını gösterir. Einstein’ın çözümü: ışık hf enerjili fotonlardan oluşur ve bir foton enerjisini tek bir elektrona bütünüyle verir. Foton enerjisi bağlanma enerjisinden küçükse, kaç foton gelirse gelsin elektron kopmaz. Şiddet foton sayısını artırır, dolayısıyla sökülen elektron sayısını (akımı) artırır ama tek bir elektronun enerjisini değiştirmez. Frekans ise her fotonun enerjisini, dolayısıyla elektronların en büyük kinetik enerjisini ve kesme gerilimini belirler.\n\nCompton olayı fotonun bir bilardo topu gibi momentum aktardığını gösterir; de Broglie ise tersini sorar: dalga parçacık gibi davranıyorsa parçacık da dalga gibi davranamaz mı? Kütlesi büyük ya da hızlı cisimlerde λ = h/p çok küçük olduğundan dalga özelliği gözlenmez; elektron gibi hafif parçacıklarda ise kristallerde kırınım gözlenir.",
    examples: [
      {
        level: "kolay",
        problem: "Dalga boyu 330 nm olan bir fotonun enerjisi kaç J’dür? (h = 6,6·10⁻³⁴ J·s, c = 3·10⁸ m/s)",
        steps: [
          "E = hc/λ = (6,6·10⁻³⁴·3·10⁸)/(3,3·10⁻⁷).",
          "Pay: 1,98·10⁻²⁵ J·m; bölüm: 1,98·10⁻²⁵/3,3·10⁻⁷ = 6·10⁻¹⁹ J.",
        ],
        answer: "6·10⁻¹⁹ J (= 3,75 eV)",
      },
      {
        level: "orta",
        problem: "Bağlanma enerjisi 2,3 eV olan bir metale enerjisi 4,1 eV olan fotonlar düşürülüyor. Sökülen elektronların en büyük kinetik enerjisi ve kesme gerilimi nedir? Işık şiddeti iki katına çıkarılırsa bu değerler nasıl değişir?",
        steps: [
          "Ek_max = hf − E₀ = 4,1 − 2,3 = 1,8 eV.",
          "eV_k = Ek_max → V_k = 1,8 V.",
          "Şiddet artınca yalnızca foton sayısı artar: sökülen elektron sayısı ve doyma akımı artar, Ek_max ve V_k değişmez.",
        ],
        answer: "Ek_max = 1,8 eV, V_k = 1,8 V; şiddet artınca değişmez.",
      },
      {
        level: "zor",
        problem: "Bir uzay aracı Dünya’ya göre 0,8c hızla gidiyor. Araçtaki astronot, aracın içindeki bir lambanın 12 s yanık kaldığını ölçüyor. Dünya’daki gözlemci bu süreyi kaç s ölçer ve bu sürede araç Dünya’ya göre kaç m yol alır?",
        steps: [
          "Lamba astronota göre durgundur; 12 s öz zamandır (t₀).",
          "γ = 1/√(1 − 0,64) = 1/0,6 = 5/3.",
          "t = γt₀ = (5/3)·12 = 20 s.",
          "Dünya’ya göre yol: x = v·t = 0,8·3·10⁸·20 = 4,8·10⁹ m.",
        ],
        answer: "20 s; 4,8·10⁹ m",
      },
    ],
    osymThinking:
      "Fotoelektrik sorularında ışık şiddeti ile frekansın etkileri karıştırılır: ‘şiddet artarsa kesme gerilimi artar’ gibi yanlış öncüller sık kullanılır. Ek–f grafiğinde eğimin h olduğu, grafiğin f eksenini kestiği yerin eşik frekansı olduğu, farklı metallerin doğrularının paralel olduğu sorulur. Görelilikte hangi sürenin öz zaman olduğunu belirlemek asıl ölçülen beceridir. de Broglie sorularında ‘aynı kinetik enerji’ ile ‘aynı hız’ durumları ayrılır.",
    commonMistakes: [
      "Işık şiddetini artırmanın fotoelektronların kinetik enerjisini artırdığını sanmak.",
      "Eşik frekansının altındaki ışıkla, şiddet çok artırılırsa elektron sökülebileceğini düşünmek.",
      "Öz zamanı yanlış gözlemciye atamak; öz zaman olayla aynı yerde bulunan (olaya göre durgun) gözlemcinin ölçtüğüdür.",
      "Boy kısalmasının harekete dik doğrultudaki boyutları da etkilediğini sanmak.",
      "Compton olayında saçılan fotonun dalga boyunun azaldığını düşünmek; artar.",
      "de Broglie dalga boyunda, aynı kinetik enerjide λ’nın kütleyle ters orantılı olduğunu sanmak; √m ile ters orantılıdır.",
    ],
    tips: [
      "hc ≈ 1240 eV·nm ezberle: λ nm cinsindense E(eV) ≈ 1240/λ (h = 6,6·10⁻³⁴ ile 1237,5).",
      "γ değerleri: 0,6c → 1,25; 0,8c → 5/3; 0,5c → 2/√3 ≈ 1,15.",
      "Fotoelektrikte ‘frekans → enerji (Ek, V_k)’, ‘şiddet → sayı (akım)’ eşleştirmesini hiç bozma.",
      "Aynı Ek’li iki parçacık için λ₁/λ₂ = √(m₂/m₁); aynı hızlı iki parçacık için λ₁/λ₂ = m₂/m₁.",
    ],
    summary: [
      "Işık hızı tüm eylemsiz gözlemciler için c’dir; t = γt₀, L = L₀/γ.",
      "Kara cisim: T artınca toplam ışıma artar, λ_max kısalır; Planck enerji kuantumu hf.",
      "Fotoelektrik: Ek_max = hf − E₀; eşik altı frekansta elektron yok; şiddet yalnızca akımı artırır.",
      "Kesme gerilimi eV_k = Ek_max; Ek–f grafiğinin eğimi h, f eksenini kestiği yer f₀.",
      "Compton: foton momentum taşır; saçılan fotonun dalga boyu artar.",
      "de Broglie: λ = h/p; madde de dalga özelliği gösterir.",
    ],
  },
  {
    topicId: "aytfiz-modern-fizik-teknoloji",
    intro:
      "Modern fiziğin kuramları laboratuvarda kalmadı; bugün kullandığımız pek çok teknoloji doğrudan kuantum fiziğine ve atom fiziğine dayanıyor. Lazer, uyarılmış emisyon ilkesiyle tek renkli ve eş fazlı ışık üretir. Güneş pilleri fotovoltaik olayla ışığı elektriğe dönüştürür. LED’ler yarı iletkenlerdeki enerji aralığına göre belirli renkte ışık yayar.\n\nTıpta röntgen ve bilgisayarlı tomografi X ışınlarını, PET pozitron–elektron yok olmasından çıkan gama fotonlarını, MR ise güçlü manyetik alan ve radyo dalgalarını kullanır. Süper iletkenler sıfır dirençleri sayesinde güçlü mıknatıslarda ve manyetik kaldırmalı trenlerde kullanılır. YKS’de bu konu, teknolojiyi dayandığı fiziksel ilkeyle eşleştirme biçiminde sorulur.",
    prerequisites: [
      "Fotoelektrik olay ve foton enerjisi E = hf",
      "Bohr atom modeli, uyarılma ve ışıma",
      "Elektromanyetik spektrum ve iletken–yalıtkan–yarı iletken kavramları",
    ],
    concepts: [
      { term: "Lazer", definition: "Uyarılmış emisyonla ışığın güçlendirilmesi. Lazer ışığı tek renkli (monokromatik), eş fazlı (koherent), paralel ve yüksek şiddetlidir. Nüfus terslenmesi gerekir." },
      { term: "Fotovoltaik olay (güneş pili)", definition: "Yarı iletken p-n ekleminde soğurulan fotonların elektron–boşluk çiftleri oluşturması ve eklemdeki elektrik alanın bunları ayırarak gerilim üretmesi." },
      { term: "LED", definition: "Yarı iletken eklemde elektron–boşluk birleşmesiyle, yasak enerji aralığına eşit enerjili fotonlar yayan diyot. Aralık büyüdükçe yayılan ışığın dalga boyu kısalır." },
      { term: "Süper iletkenlik", definition: "Bazı maddelerin kritik sıcaklığın altında elektrik direncinin sıfır olması ve manyetik alanı dışlaması (Meissner etkisi)." },
      { term: "Tıbbi görüntüleme", definition: "Röntgen/BT: X ışınları; PET: pozitron yok olmasından çıkan gama ışınları; MR: güçlü manyetik alan ve radyo dalgaları (iyonlaştırıcı ışıma kullanmaz); ultrason: yüksek frekanslı ses dalgaları." },
    ],
    formulas: [
      { expr: "E_foton = E_g = hc/λ", meaning: "LED’in yaydığı fotonun enerjisi yaklaşık yasak enerji aralığına eşittir." },
      { expr: "Verim = P_elektrik / P_ışık", meaning: "Güneş pilinin ışık gücünü elektrik gücüne dönüştürme oranı." },
      { expr: "Foton sayısı/s = P/(hf)", meaning: "Gücü P olan tek renkli kaynağın saniyede yaydığı foton sayısı." },
    ],
    logic:
      "Uyarılmış bir atoma, tam geçiş enerjisine sahip bir foton çarptığında atom aynı enerjide, aynı fazda ve aynı yönde ikinci bir foton salar. Ortamdaki atomların çoğu uyarılmış durumdaysa (nüfus terslenmesi) bu süreç çığ gibi büyür ve aynalar arasında güçlenen lazer ışını oluşur; bu yüzden lazer tek renkli ve eş fazlıdır. Yarı iletkenlerde ise enerji düzeyleri bantlar hâlindedir; iletim ve değerlik bantları arasındaki boşluk (E_g) LED’in rengini ve güneş pilinin hangi fotonları kullanabileceğini belirler. Enerjisi E_g’den küçük fotonlar güneş pilinde elektrik üretmez; bu, fotoelektrik olaydaki eşik frekansının teknolojideki karşılığıdır.",
    examples: [
      {
        level: "kolay",
        problem: "Yasak enerji aralığı 3,3 eV olan bir LED’in yaydığı ışığın dalga boyu yaklaşık kaç nm’dir? (h = 6,6·10⁻³⁴ J·s, c = 3·10⁸ m/s, 1 eV = 1,6·10⁻¹⁹ J)",
        steps: [
          "E = 3,3·1,6·10⁻¹⁹ = 5,28·10⁻¹⁹ J.",
          "λ = hc/E = 1,98·10⁻²⁵/5,28·10⁻¹⁹ = 3,75·10⁻⁷ m = 375 nm.",
          "Bu değer morötesi sınırına yakındır.",
        ],
        answer: "≈ 375 nm",
      },
      {
        level: "orta",
        problem: "Gücü 6,6 mW olan bir lazer, dalga boyu 600 nm olan ışık yayıyor. Lazer saniyede kaç foton yayar?",
        steps: [
          "Bir fotonun enerjisi: E = hc/λ = 1,98·10⁻²⁵/6·10⁻⁷ = 3,3·10⁻¹⁹ J.",
          "Foton sayısı/s = P/E = 6,6·10⁻³/3,3·10⁻¹⁹ = 2·10¹⁶.",
        ],
        answer: "2·10¹⁶ foton/s",
      },
    ],
    osymThinking:
      "Bu konudaki sorular genellikle bir teknolojinin hangi fiziksel ilkeye dayandığını eşleştirme ya da öncüllü yapıda sorar. MR’nin iyonlaştırıcı ışıma kullanmadığı, lazer ışığının eş fazlı olduğu, güneş pilinin fotovoltaik olaya dayandığı gibi bilgiler, benzer kavramlarla (fotoelektrik, kendiliğinden emisyon, X ışını) karıştırılarak verilir. Sayısal sorularda foton enerjisi ve foton sayısı hesaplanır.",
    commonMistakes: [
      "Lazeri kendiliğinden emisyona dayandırmak; lazer uyarılmış emisyona dayanır.",
      "MR’nin X ışını kullandığını sanmak; MR manyetik alan ve radyo dalgalarıyla çalışır.",
      "LED’in rengini akım şiddetinin belirlediğini düşünmek; rengi yarı iletkenin enerji aralığı belirler.",
      "Süper iletkenlerin her sıcaklıkta sıfır dirence sahip olduğunu sanmak.",
    ],
    tips: [
      "Tıbbi cihazlarda ‘iyonlaştırıcı mı?’ sorusunu sor: Röntgen, BT, PET evet; MR ve ultrason hayır.",
      "LED: E_g büyük → mavi/mor; E_g küçük → kırmızı/kızılötesi.",
      "Lazerin dört özelliği: tek renkli, eş fazlı, paralel (az ıraksak), yoğun.",
    ],
    summary: [
      "Lazer: uyarılmış emisyon; tek renkli, eş fazlı, paralel ışık.",
      "Güneş pili: p-n ekleminde fotovoltaik olay; E_g’den küçük enerjili fotonlar elektrik üretmez.",
      "LED: yayılan fotonun enerjisi ≈ yasak enerji aralığı.",
      "Röntgen/BT: X ışını; PET: gama; MR: manyetik alan + radyo dalgası.",
      "Süper iletken: kritik sıcaklık altında sıfır direnç ve Meissner etkisi.",
    ],
  },
];
