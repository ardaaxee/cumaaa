import type { LessonSeed } from '../../domain/types';

export const lessons: LessonSeed[] = [
  // ------------------------------------------------------------------
  // ASİT-BAZ DENGESİ (öncelikli)
  // ------------------------------------------------------------------
  {
    topicId: "aytkim-asit-baz-dengesi",
    intro:
      "Asit-baz dengesi, AYT kimyada neredeyse her yıl soru gelen ve hesap ile yorumu bir arada isteyen bir konudur. TYT’de asitleri ve bazları özellikleriyle tanımıştın; burada işin nicel tarafına geçiyoruz: Bir çözeltinin ne kadar asidik olduğunu pH ile ölçecek, zayıf asitlerin neden “yarım yamalak” iyonlaştığını denge sabitiyle açıklayacaksın.\n\nKonunun kalbi suyun kendi kendine iyonlaşmasıdır. Saf suda bile çok az miktarda H₃O⁺ ve OH⁻ iyonu bulunur ve 25 °C’de bunların derişimleri çarpımı hep 1×10⁻¹⁴’tür. Bu tek bağıntı sayesinde [H⁺] bilinirse [OH⁻], pH bilinirse pOH hemen bulunur.\n\nDaha sonra kuvvetli ve zayıf asit/bazları ayıracak, Ka ve Kb ile zayıf olanların pH’ını hesaplayacaksın. Tuzların suda neden asidik ya da bazik davrandığını (hidroliz), pH’ı dirençli çözeltileri (tampon) ve titrasyon eğrilerini okumayı öğrendiğinde bu ünitenin tüm soru tiplerini çözebilecek duruma gelirsin.",
    prerequisites: [
      "Arrhenius ve Brønsted-Lowry asit-baz tanımları",
      "Mol, molarite (M = n/V) ve seyreltme hesapları",
      "Kimyasal denge ve denge sabiti (Kc) ifadesi, Le Chatelier ilkesi",
      "Logaritma temel kuralları (log 10ⁿ = n, log 2 ≈ 0,3, log 5 ≈ 0,7)",
    ],
    concepts: [
      { term: "Suyun iyonlaşma sabiti (Ksu)", definition: "H₂O ⇌ H⁺ + OH⁻ dengesinin sabitidir: Ksu = [H⁺][OH⁻]. 25 °C’de 1×10⁻¹⁴’tür; iyonlaşma endotermik olduğundan sıcaklık artınca büyür." },
      { term: "pH ve pOH", definition: "pH = −log[H⁺], pOH = −log[OH⁻]. 25 °C’de pH + pOH = 14. pH 1 birim azalırsa [H⁺] 10 kat artar." },
      { term: "Kuvvetli asit / baz", definition: "Suda tamamen iyonlaşan asit veya bazdır (HCl, HBr, HI, HNO₃, H₂SO₄ (1. basamak); NaOH, KOH, Ba(OH)₂). Derişimden doğrudan [H⁺] ya da [OH⁻] bulunur." },
      { term: "Zayıf asit / baz ve Ka, Kb", definition: "Kısmen iyonlaşan türlerdir (CH₃COOH, HF, NH₃). HA ⇌ H⁺ + A⁻ için Ka = [H⁺][A⁻]/[HA]; Ka büyüdükçe asit kuvvetlenir." },
      { term: "Konjuge asit-baz çifti", definition: "Bir proton farkıyla birbirine dönüşen türlerdir (CH₃COOH / CH₃COO⁻). Aynı çift için Ka·Kb = Ksu’dur; asit ne kadar kuvvetliyse konjuge bazı o kadar zayıftır." },
      { term: "Hidroliz", definition: "Zayıf asit ya da zayıf bazdan gelen iyonun su ile tepkimeye girmesidir. CH₃COO⁻ OH⁻ oluşturup ortamı bazik, NH₄⁺ H₃O⁺ oluşturup ortamı asidik yapar." },
      { term: "Tampon çözelti", definition: "Zayıf asit ile konjuge bazını (ya da zayıf baz ile konjuge asidini) birlikte içeren, az miktarda asit veya baz eklendiğinde pH’ı çok az değişen çözeltidir." },
      { term: "Eşdeğerlik noktası", definition: "Titrasyonda eklenen asidin H⁺ molü ile bazın OH⁻ molünün eşit olduğu noktadır. Kuvvetli-kuvvetli titrasyonda pH = 7, zayıf asit-kuvvetli baz titrasyonunda pH > 7’dir." },
    ],
    formulas: [
      { expr: "Ksu = [H⁺]·[OH⁻] = 1×10⁻¹⁴ (25 °C)", meaning: "Sulu çözeltide iki iyon derişimi birbirine bağlıdır; biri artarsa diğeri azalır." },
      { expr: "pH = −log[H⁺] ; pOH = −log[OH⁻] ; pH + pOH = 14", meaning: "Derişimden pH’a ve pH’tan pOH’a geçiş bağıntılarıdır (25 °C)." },
      { expr: "Zayıf asit: [H⁺] ≈ √(Ka·Ca)", meaning: "İyonlaşma %5’ten azsa başlangıç derişimi değişmemiş kabul edilerek kullanılır. Zayıf baz için [OH⁻] ≈ √(Kb·Cb)." },
      { expr: "% iyonlaşma = ([H⁺]/Ca)·100", meaning: "Zayıf asidin ne kadarının iyonlaştığını gösterir; seyreltme bu yüzdeyi artırır." },
      { expr: "Ka · Kb = Ksu", meaning: "Konjuge çiftlerde biri bilinirse diğeri hesaplanır; hidroliz sorularının anahtarıdır." },
      { expr: "Tampon: [H⁺] = Ka · (n asit / n konjuge baz)", meaning: "Mol oranı 1 ise [H⁺] = Ka, yani pH = pKa olur (yarı eşdeğerlik noktası)." },
      { expr: "Nötrleşme: n(H⁺) = n(OH⁻) ⇒ Mₐ·Vₐ·(tesir değerliği) = M_b·V_b·(tesir değerliği)", meaning: "Titrasyonda eşdeğerlik noktasını ve bilinmeyen derişimi bulmak için kullanılır." },
    ],
    logic:
      "Neden pH + pOH = 14? Çünkü su hiçbir zaman ortadan kalkmaz; her sulu çözeltide H₂O ⇌ H⁺ + OH⁻ dengesi vardır ve bu dengenin sabiti 25 °C’de 10⁻¹⁴’tür. Asit ekleyince [H⁺] artar, Le Chatelier gereği denge sola kayar ve [OH⁻] azalır; ama çarpım sabit kalır. Her iki tarafın −log’unu alınca pH + pOH = 14 çıkar.\n\nZayıf asitlerde neden karekök alıyoruz? HA ⇌ H⁺ + A⁻ dengesinde oluşan H⁺ ve A⁻ eşit miktardadır (x). Ka = x²/(Ca − x) olur; x çok küçük olduğu için paydadaki x ihmal edilir ve x = √(Ka·Ca) bulunur. Seyreltince Ca küçülür, [H⁺] azalır ama iyonlaşma yüzdesi artar; çünkü denge, tanecik sayısını artıran yöne (iyonlara) kayar.\n\nTamponun sırrı iki “sünger” taşımasıdır: Asit eklenirse konjuge baz (A⁻) H⁺’ları yakalar, baz eklenirse zayıf asit (HA) OH⁻’ları nötrler. Böylece [HA]/[A⁻] oranı çok az değişir ve pH neredeyse sabit kalır. Hidroliz ise bu mantığın tuz hâlidir: Zayıf asidin anyonu proton yakalamaya isteklidir, sudan H⁺ alır ve geride OH⁻ bırakır.",
    examples: [
      {
        level: "kolay",
        problem: "25 °C’de 0,001 M HNO₃ çözeltisinin pH ve pOH değerlerini bulunuz.",
        steps: [
          "HNO₃ kuvvetli asittir, tamamen iyonlaşır: [H⁺] = 1×10⁻³ M.",
          "pH = −log(10⁻³) = 3.",
          "pOH = 14 − 3 = 11.",
        ],
        answer: "pH = 3, pOH = 11",
      },
      {
        level: "orta",
        problem: "25 °C’de 0,1 M HA zayıf asidinin Ka değeri 1×10⁻⁵’tir. Çözeltinin pH’ını ve iyonlaşma yüzdesini bulunuz.",
        steps: [
          "HA ⇌ H⁺ + A⁻ ; Ka = x²/(0,1 − x) ≈ x²/0,1.",
          "x² = 1×10⁻⁵ · 0,1 = 1×10⁻⁶ ⇒ x = [H⁺] = 1×10⁻³ M.",
          "pH = 3.",
          "% iyonlaşma = (10⁻³/0,1)·100 = %1 (<%5, yaklaşım geçerli).",
        ],
        answer: "pH = 3, iyonlaşma %1",
      },
      {
        level: "zor",
        problem: "0,2 mol CH₃COOH içeren 1 L çözeltiye 0,1 mol katı NaOH ekleniyor (hacim değişmiyor). Ka = 1×10⁻⁵ ise oluşan çözeltinin pH’ı nedir? Bu çözeltiye az miktarda HCl eklenirse ne olur?",
        steps: [
          "CH₃COOH + OH⁻ → CH₃COO⁻ + H₂O ; 0,1 mol OH⁻ 0,1 mol asidi harcar.",
          "Kalan: 0,1 mol CH₃COOH ve oluşan 0,1 mol CH₃COO⁻ ⇒ ortam tampondur.",
          "[H⁺] = Ka · (0,1/0,1) = 1×10⁻⁵ ⇒ pH = 5 (pH = pKa).",
          "Eklenen HCl’nin H⁺’larını CH₃COO⁻ yakalar ve CH₃COOH’a dönüştürür; oran az değiştiği için pH çok az düşer.",
        ],
        answer: "pH = 5; tampon olduğu için pH belirgin değişmez.",
      },
    ],
    osymThinking:
      "Sorular genelde “bu kaç?” diye doğrudan sormaz; iki çözeltiyi karıştırır, bir tuzun hidrolizini sezdirir ya da titrasyon eğrisini sözel verir. Önce ortamda hangi türün fazla kaldığını (kuvvetli asit, kuvvetli baz, tampon ya da yalnız tuz) belirlemek sorunun yarısıdır. Eşit derişimli kuvvetli ve zayıf asit karşılaştırmaları, eşit pH’lı çözeltilerin nötrleşme kapasitesi ve eşdeğerlik noktasındaki pH, ölçülen asıl kavramsal becerilerdir.",
    commonMistakes: [
      "Zayıf asitte [H⁺]’ı başlangıç derişimine eşit almak (0,1 M CH₃COOH için pH = 1 demek).",
      "Ba(OH)₂ gibi iki OH⁻ veren bazda [OH⁻]’ı derişimin iki katı almamak.",
      "Karıştırma sorularında toplam hacmi hesaba katmayıp mol farkını tek bir çözeltinin hacmine bölmek.",
      "Nötrleşme noktasını her zaman pH = 7 sanmak; zayıf asit-kuvvetli baz titrasyonunda eşdeğerlik noktası baziktir.",
      "Sıcaklık artınca saf suyun pH’ı 7’nin altına düştüğü için suyun asidik olduğunu düşünmek; [H⁺] = [OH⁻] olduğu sürece su nötrdür.",
    ],
    tips: [
      "Karışım sorularında önce mol tablosu kur: H⁺ molü, OH⁻ molü, fazla kalan, toplam hacim — sonra pH.",
      "“Yarı eşdeğerlik noktası” ya da “asit ile tuzu eşit mol” ifadesini gördüğün anda pH = pKa yaz.",
      "Tuzun asitliğini bulmak için tuzu oluşturan asidi ve bazı bul: kuvvetli olan kazanır; ikisi de kuvvetliyse nötr.",
      "log 2 = 0,3 ve log 5 = 0,7 ezber olsun; 0,05 M → pH 1,3, 0,02 M OH⁻ → pOH 1,7 gibi değerler sık çıkar.",
    ],
    summary: [
      "25 °C’de [H⁺][OH⁻] = 10⁻¹⁴ ve pH + pOH = 14; sıcaklık artınca Ksu büyür, nötr pH 7’nin altına iner.",
      "Kuvvetli asit/baz tam iyonlaşır; zayıflarda [H⁺] ≈ √(Ka·C), [OH⁻] ≈ √(Kb·C).",
      "Konjuge çiftte Ka·Kb = Ksu; kuvvetli asidin konjuge bazı zayıftır.",
      "Zayıf asit anyonu bazik, zayıf baz katyonu asidik hidroliz yapar; kuvvetli asit-kuvvetli baz tuzu nötrdür.",
      "Tampon = zayıf asit + konjuge baz; eşit molde pH = pKa.",
      "Titrasyon eğrisinde dik sıçrama eşdeğerlik noktasıdır; zayıf asit titrasyonunda bu nokta pH > 7’dedir.",
    ],
  },

  // ------------------------------------------------------------------
  // ÇÖZÜNÜRLÜK DENGESİ
  // ------------------------------------------------------------------
  {
    topicId: "aytkim-cozunurluk-dengesi",
    intro:
      "“Suda çözünmez” dediğimiz AgCl, BaSO₄ gibi tuzlar aslında çok az da olsa çözünür. Doygun çözeltide katı tuz ile iyonları arasında dinamik bir denge kurulur ve bu dengenin sabitine çözünürlük çarpımı (Kçç) denir.\n\nBu konuda Kçç’den molar çözünürlüğü, çözünürlükten Kçç’yi hesaplayacak; ortak iyonun, sıcaklığın ve karıştırmanın çökelme üzerindeki etkisini yorumlayacaksın. Hesaplar kısa ama formül tipine (AB, AB₂, A₂B) dikkat etmek şarttır.",
    prerequisites: [
      "Kimyasal denge ve Le Chatelier ilkesi",
      "Molarite ve karıştırma hesapları",
      "İyonik bileşiklerin formülleri ve suda iyonlaşma denklemleri",
    ],
    concepts: [
      { term: "Çözünürlük çarpımı (Kçç)", definition: "Az çözünen iyonik katının doygun çözeltisindeki iyon derişimlerinin, katsayıları üs olarak yazılmış çarpımıdır. Katı ifadeye yazılmaz." },
      { term: "Molar çözünürlük (s)", definition: "Doygun çözeltide 1 L’de çözünebilen tuzun mol sayısıdır. AgCl için Kçç = s², PbI₂ için Kçç = 4s³." },
      { term: "İyon çarpımı (Q)", definition: "Herhangi bir anda iyon derişimleriyle Kçç ifadesi gibi hesaplanan değerdir. Q > Kçç ise çökelme olur, Q = Kçç doygun, Q < Kçç doymamış." },
      { term: "Ortak iyon etkisi", definition: "Çözeltide tuzun iyonlarından biri önceden bulunursa denge katı yönüne kayar ve çözünürlük azalır; Kçç değişmez." },
      { term: "Sıcaklık etkisi", definition: "Çözünmesi endotermik olan tuzlarda sıcaklık artışı Kçç’yi ve çözünürlüğü artırır. Kçç yalnız sıcaklıkla değişir." },
    ],
    formulas: [
      { expr: "AₓBᵧ(k) ⇌ xAʸ⁺ + yBˣ⁻ ; Kçç = [Aʸ⁺]ˣ·[Bˣ⁻]ʸ", meaning: "Genel çözünürlük çarpımı ifadesi." },
      { expr: "AB tipi: Kçç = s² ; AB₂ veya A₂B tipi: Kçç = 4s³ ; AB₃ tipi: Kçç = 27s⁴", meaning: "Saf suda molar çözünürlükten Kçç’ye geçiş." },
      { expr: "Ortak iyonlu ortamda (AB, [B⁻] = c): s ≈ Kçç / c", meaning: "Ortak iyon derişimi çok büyük olduğu için s ihmal edilir." },
      { expr: "Q > Kçç ⇒ çökelme ; Q ≤ Kçç ⇒ çökelme yok", meaning: "Karıştırmadan sonra yeni derişimlerle (toplam hacim) Q hesaplanır." },
    ],
    logic:
      "Kçç ifadesine katının yazılmamasının sebebi, katının derişiminin (yoğunluk/mol kütlesi) sabit olması ve miktarı ne olursa olsun dengeyi değiştirmemesidir. Ortak iyon eklendiğinde ürün tarafı artar; Le Chatelier gereği denge katı oluşumu yönüne kayar ve daha az tuz çözünür. Farklı formül tipindeki tuzların çözünürlüğü Kçç değerlerine bakarak karşılaştırılamaz; çünkü Kçç = s² ile Kçç = 4s³ farklı üslerle s’ye bağlıdır. Bu yüzden karşılaştırma her zaman s hesaplanarak yapılır.",
    examples: [
      {
        level: "kolay",
        problem: "Belirli bir sıcaklıkta PbI₂’nin molar çözünürlüğü 1×10⁻³ mol/L’dir. Kçç değeri nedir?",
        steps: [
          "PbI₂(k) ⇌ Pb²⁺ + 2I⁻ ; [Pb²⁺] = s, [I⁻] = 2s.",
          "Kçç = s·(2s)² = 4s³ = 4·(10⁻³)³ = 4×10⁻⁹.",
        ],
        answer: "Kçç = 4×10⁻⁹",
      },
      {
        level: "orta",
        problem: "AgCl için Kçç = 1×10⁻¹⁰’dur. AgCl’nin saf sudaki ve 0,01 M NaCl çözeltisindeki molar çözünürlüklerini karşılaştırınız.",
        steps: [
          "Saf suda s² = 10⁻¹⁰ ⇒ s = 10⁻⁵ M.",
          "0,01 M NaCl’de [Cl⁻] ≈ 10⁻² ⇒ s = 10⁻¹⁰/10⁻² = 10⁻⁸ M.",
          "Ortak iyon çözünürlüğü 1000 kat azaltmıştır.",
        ],
        answer: "Saf suda 10⁻⁵ M, NaCl’de 10⁻⁸ M",
      },
      {
        level: "zor",
        problem: "Eşit hacimde 2×10⁻⁴ M AgNO₃ ve 2×10⁻⁴ M NaCl çözeltileri karıştırılıyor. AgCl için Kçç = 1×10⁻¹⁰ ise çökelme olur mu?",
        steps: [
          "Hacim iki katına çıktığı için derişimler yarıya iner: [Ag⁺] = [Cl⁻] = 1×10⁻⁴ M.",
          "Q = (10⁻⁴)(10⁻⁴) = 10⁻⁸.",
          "Q (10⁻⁸) > Kçç (10⁻¹⁰) ⇒ AgCl çöker.",
        ],
        answer: "Evet, çökelme olur.",
      },
    ],
    osymThinking:
      "Sorular çoğunlukla formül tipi farklı iki tuzu Kçç’leriyle verip “hangisi daha çok çözünür?” diye sorar; burada Kçç’ye bakıp cevap veren öğrenci yanılır. Ayrıca karıştırma sonrası seyrelmeyi unutturacak şekilde kurgulanmış Q-Kçç soruları ve ortak iyon ile sıcaklığın Kçç’ye etkisini ayırt ettiren öncüllü sorular sık görülür.",
    commonMistakes: [
      "Farklı formül tipindeki tuzların çözünürlüğünü doğrudan Kçç büyüklüğüne göre sıralamak.",
      "PbI₂ gibi tuzlarda [I⁻] = 2s yerine s almak ya da (2s)²’deki kareyi unutmak.",
      "Ortak iyonun Kçç’yi azalttığını sanmak; ortak iyon çözünürlüğü azaltır, Kçç yalnız sıcaklıkla değişir.",
      "Karıştırma sorularında toplam hacmi hesaba katmadan Q hesaplamak.",
    ],
    tips: [
      "Önce dengeyi yaz, iyonların altına s, 2s, 3s koy; Kçç ifadesi kendiliğinden çıkar.",
      "Karşılaştırma sorusunda her tuz için s’yi ayrı hesapla; tip aynıysa Kçç sıralaması yeterlidir.",
      "Doygun hidroksit çözeltisinde [OH⁻]’dan pOH’a, oradan pH’a geçilebileceğini unutma.",
    ],
    summary: [
      "Kçç, doygun çözeltideki iyon derişimlerinin üslü çarpımıdır; katı yazılmaz.",
      "AB: Kçç = s², AB₂/A₂B: Kçç = 4s³.",
      "Q > Kçç çökelme, Q < Kçç doymamış.",
      "Ortak iyon çözünürlüğü azaltır; Kçç’yi yalnız sıcaklık değiştirir.",
      "Farklı tiplerde çözünürlük karşılaştırması s ile yapılır.",
    ],
  },

  // ------------------------------------------------------------------
  // ELEKTROKİMYA (öncelikli)
  // ------------------------------------------------------------------
  {
    topicId: "aytkim-elektrokimya",
    intro:
      "Telefonundaki pil, arabadaki akü, paslanan demir ve gümüş kaplanmış bir kaşık… Hepsinin arkasında aynı olay var: elektron alışverişi. Elektrokimya, kimyasal tepkimelerle elektrik enerjisi arasındaki dönüşümü inceler ve AYT’de hem hesap hem yorum sorusu üretmeye çok elverişlidir.\n\nKonuya yükseltgenme-indirgenme (redoks) kavramlarıyla başlayacağız: Elektron veren tür yükseltgenir, alan indirgenir. Ardından standart indirgenme potansiyelleri tablosunu okuyarak hangi metalin hangi çözeltiyle tepkime verdiğini, bir galvanik hücrede anot ve katodun hangisi olduğunu ve pil potansiyelini bulacaksın.\n\nİkinci büyük bölüm elektrolizdir: Bu kez dışarıdan elektrik vererek kendiliğinden olmayan bir tepkimeyi zorla yürütürüz. Faraday yasalarıyla, geçen yük miktarından ne kadar madde toplandığını hesaplayacaksın. Son olarak korozyonu ve metalleri korozyondan koruma yollarını elektrokimya diliyle açıklayacağız.",
    prerequisites: [
      "Yükseltgenme basamaklarının (değerliklerin) bulunması",
      "Mol kavramı ve mol-kütle dönüşümleri",
      "Metallerin aktiflik kavramı ve iyonik bileşiklerin formülleri",
      "Kimyasal denge ve Le Chatelier ilkesi (Nernst mantığı için)",
    ],
    concepts: [
      { term: "Yükseltgenme / indirgenme", definition: "Elektron verme yükseltgenmedir (yükseltgenme basamağı artar); elektron alma indirgenmedir (basamak azalır). İkisi her zaman birlikte gerçekleşir." },
      { term: "Yükseltgen / indirgen", definition: "Kendisi indirgenerek karşısındakini yükseltgeyen tür yükseltgendir; kendisi yükseltgenen tür indirgendir." },
      { term: "Standart indirgenme potansiyeli (E°)", definition: "1 M, 1 atm ve 25 °C’de bir yarı hücrenin standart hidrojen elektroduna göre elektron alma eğilimidir. E° büyükse tür kolay indirgenir." },
      { term: "Galvanik (volta) hücre", definition: "Kendiliğinden gerçekleşen redoks tepkimesinden elektrik enerjisi üreten düzenektir. Anot (−) yükseltgenmenin, katot (+) indirgenmenin olduğu elektrottur." },
      { term: "Tuz köprüsü", definition: "İki yarı hücreyi iyonik olarak bağlayıp yük dengesini sağlar; anyonlar anoda, katyonlar katoda doğru göç eder." },
      { term: "Elektroliz", definition: "Dışarıdan elektrik akımı uygulayarak istemsiz redoks tepkimesinin gerçekleştirilmesidir. Katot (−) indirgenme, anot (+) yükseltgenme elektrotudur." },
      { term: "Faraday sabiti", definition: "1 mol elektronun yüküdür: 1 F ≈ 96500 C. Elektrolizde toplanan madde miktarı geçen yükle doğru orantılıdır." },
      { term: "Korozyon ve katodik koruma", definition: "Metalin çevresiyle redoks tepkimesine girip aşınmasıdır. Demire daha aktif bir metal (Mg, Zn) bağlanırsa o metal anot olup aşınır ve demiri korur (kurban anot)." },
    ],
    formulas: [
      { expr: "E°pil = E°katot − E°anot (indirgenme potansiyelleriyle)", meaning: "Pil potansiyeli; pozitifse tepkime kendiliğindendir. Yarı tepkime katsayılarla çarpılsa da E° değişmez." },
      { expr: "E°pil = E°yük(anot) + E°ind(katot)", meaning: "Anodun yükseltgenme potansiyeli ile katodun indirgenme potansiyelinin toplamı; yukarıdakiyle aynı sonucu verir." },
      { expr: "Q = I · t", meaning: "Geçen yük (C) = akım (A) × süre (s)." },
      { expr: "n(e⁻) = Q / 96500", meaning: "Geçen elektronun mol sayısı." },
      { expr: "n(madde) = n(e⁻) / (iyonun yükü)", meaning: "Mⁿ⁺ + ne⁻ → M olduğundan 1 mol metal için n mol elektron gerekir." },
      { expr: "Seri bağlı kaplarda: n(e⁻) her kapta aynıdır", meaning: "Faraday’ın 2. yasası: Aynı yük farklı kaplarda eşdeğer miktarda madde toplar." },
      { expr: "Nernst mantığı: E = E° − (0,059/n)·log Q", meaning: "Ürün derişimi artarsa ya da girenin derişimi azalırsa pil potansiyeli düşer; dengede E = 0 olur." },
    ],
    logic:
      "Neden E° değerleri katsayıyla çarpılmaz? Çünkü potansiyel, bir elektron başına düşen enerjidir (volt = joule/coulomb). 1 mol yerine 2 mol Ag⁺ indirgemek toplam enerjiyi artırır ama elektron başına enerjiyi değiştirmez. Bu yüzden Ag⁺ + e⁻ → Ag yarı tepkimesini 2 ile çarptığında E° hâlâ +0,80 V’tur.\n\nGalvanik hücrede elektronlar neden anottan katoda akar? İndirgenme potansiyeli küçük olan metal elektronlarını daha kolay verir; potansiyeli büyük olan iyon ise elektronları daha çok ister. Elektronlar dış devreden “istenen” tarafa, yani katoda akar. Anot çözünerek kütle kaybeder, katotta metal biriktiği için kütle artar. Tepkime ilerledikçe katot çözeltisindeki iyonlar azalır, anot çözeltisindeki iyonlar artar; Le Chatelier gereği tepkimenin itici gücü düşer ve sonunda dengeye ulaşıldığında pil potansiyeli sıfır olur. Nernst eşitliği bu nitel mantığın matematiksel ifadesidir.\n\nElektrolizde ise dış kaynak elektronları zorla katoda pompalar. Sulu çözeltilerde suyun da yarışa katıldığını unutma: Na⁺, K⁺, Mg²⁺ gibi aktif metal iyonları yerine su indirgenir ve H₂ çıkar; F⁻, NO₃⁻, SO₄²⁻ gibi iyonlar yerine su yükseltgenip O₂ verir. Faraday yasaları ise basit bir sayma işidir: Her Cu²⁺ için iki elektron, her Ag⁺ için bir elektron gerekir.",
    examples: [
      {
        level: "kolay",
        problem: "Zn²⁺/Zn için E° = −0,76 V, Cu²⁺/Cu için E° = +0,34 V’tur. Zn-Cu galvanik hücresinde anot, katot ve standart pil potansiyelini bulunuz.",
        steps: [
          "İndirgenme potansiyeli büyük olan Cu²⁺ indirgenir ⇒ katot Cu.",
          "Zn yükseltgenir ⇒ anot Zn.",
          "E°pil = 0,34 − (−0,76) = 1,10 V.",
        ],
        answer: "Anot Zn, katot Cu, E° = 1,10 V",
      },
      {
        level: "orta",
        problem: "CuSO₄ çözeltisinden 2 A’lik akım 9650 saniye geçiriliyor. Katotta toplanan bakır kaç gramdır? (Cu = 64 g/mol)",
        steps: [
          "Q = I·t = 2 · 9650 = 19300 C.",
          "n(e⁻) = 19300/96500 = 0,2 mol.",
          "Cu²⁺ + 2e⁻ → Cu ⇒ n(Cu) = 0,2/2 = 0,1 mol.",
          "m = 0,1 · 64 = 6,4 g.",
        ],
        answer: "6,4 g Cu",
      },
      {
        level: "zor",
        problem: "AgNO₃ ve CuSO₄ çözeltileri içeren iki elektroliz kabı seri bağlanıyor. Birinci kabın katodunda 10,8 g Ag toplandığında ikinci kabın katodunda kaç g Cu toplanır ve bu süre 0,5 A akımla kaç saniyedir? (Ag = 108, Cu = 64)",
        steps: [
          "n(Ag) = 10,8/108 = 0,1 mol ; Ag⁺ + e⁻ → Ag ⇒ n(e⁻) = 0,1 mol.",
          "Seri bağlı kaplardan aynı yük geçer ⇒ Cu için n(e⁻) = 0,1 mol ⇒ n(Cu) = 0,05 mol.",
          "m(Cu) = 0,05 · 64 = 3,2 g.",
          "Q = 0,1 · 96500 = 9650 C ; t = Q/I = 9650/0,5 = 19300 s.",
        ],
        answer: "3,2 g Cu; 19300 s",
      },
    ],
    osymThinking:
      "Elektrokimya soruları çoğunlukla bir potansiyel tablosu verip metal-çözelti uyumunu, bir kabın hangi çözeltiyi saklayabileceğini ya da en yüksek potansiyelli pili sordurur. Pil sorularında elektron akış yönü, tuz köprüsündeki iyon göçü ve elektrot kütlelerindeki değişim öncüllere gizlenir. Elektrolizde seri kaplar, farklı yüklü iyonlar ve kaplama süreleri; Nernst tarafında ise derişim değişiminin potansiyeli nasıl etkilediği nitel olarak ölçülür.",
    commonMistakes: [
      "Yarı tepkime 2 ile çarpıldığında E° değerini de 2 ile çarpmak.",
      "Galvanik hücrede katodu (−), anodu (+) sanmak; galvanikte anot (−), elektrolizde anot (+)’dır.",
      "Faraday hesabında iyonun yükünü (Cu²⁺ için 2) hesaba katmamak.",
      "Sulu NaCl elektrolizinde katotta Na toplandığını düşünmek; katotta H₂ çıkar.",
      "Tuz köprüsünde anyonların katoda gittiğini sanmak.",
    ],
    tips: [
      "“Anot–oksidasyon” ikisi de sesli harfle başlar; “katot–redüksiyon” ikisi de sessiz harfle.",
      "Bir metal bir çözeltiyle tepkime verir mi sorusunda: metal iyonunun E°’u çözeltideki iyonun E°’undan küçükse tepkime olur.",
      "Seri bağlı kaplarda önce elektron molünü bul; her kabı bu ortak sayı üzerinden çöz.",
      "Pil potansiyelini artırmak için katot iyon derişimini artır ya da anot iyon derişimini azalt.",
    ],
    summary: [
      "Yükseltgenme elektron verme, indirgenme elektron almadır; yükseltgen indirgenir.",
      "E°pil = E°katot − E°anot; katsayı çarpımı E°’u değiştirmez.",
      "Galvanikte anot (−) aşınır, katot (+) kütle kazanır; elektronlar dış devrede anottan katoda akar.",
      "Tepkime ilerledikçe pil potansiyeli azalır, dengede sıfır olur (Nernst mantığı).",
      "Elektrolizde Q = I·t, n(e⁻) = Q/96500, n(metal) = n(e⁻)/yük.",
      "Sulu çözeltide aktif metal iyonları yerine su indirgenir (H₂), oksijenli anyonlar yerine su yükseltgenir (O₂).",
      "Korozyondan korumada demirden daha aktif metal kurban anot olarak kullanılır.",
    ],
  },

  // ------------------------------------------------------------------
  // KARBON KİMYASINA GİRİŞ
  // ------------------------------------------------------------------
  {
    topicId: "aytkim-karbon-kimyasina-giris",
    intro:
      "Organik kimyanın temel taşı karbondur. Karbon dört bağ yapabilir, kendi atomlarıyla uzun zincirler ve halkalar kurabilir; bu yüzden milyonlarca farklı bileşik oluşturur. Bu konuda karbonun allotroplarını (elmas, grafit, fulleren, grafen, nanotüp), hibritleşme türlerini ve molekül geometrisini, ayrıca yakma analiziyle basit ve molekül formülü bulmayı öğreneceksin.\n\nBuradaki kavramlar organik bileşikler konusunun alfabesidir: Bir bağın sigma mı pi mi olduğunu, bir karbonun sp³ mü sp² mi olduğunu bilmeden alken ve alkinlerin davranışını anlamak mümkün değildir.",
    prerequisites: [
      "Lewis yapıları ve kovalent bağ",
      "Mol kavramı, kütle korunumu ve yüzde bileşim",
      "Atomun elektron dizilimi (değerlik elektronları)",
    ],
    concepts: [
      { term: "Allotrop", definition: "Aynı elementin farklı kristal ya da molekül yapısındaki şekilleridir. Karbonun allotropları: elmas (sp³, iletken değil, çok sert), grafit (sp², katmanlı, elektriği iletir), fulleren (C₆₀), grafen ve karbon nanotüp." },
      { term: "Hibritleşme", definition: "Atom orbitallerinin karışarak eş enerjili yeni orbitaller oluşturmasıdır. Dört tekli bağ yapan C sp³ (109,5°), bir çift bağ yapan C sp² (120°), bir üçlü bağ ya da iki çift bağ yapan C sp (180°)." },
      { term: "Sigma (σ) ve pi (π) bağı", definition: "İki atom arasındaki ilk bağ her zaman σ’dır; çift bağda 1σ + 1π, üçlü bağda 1σ + 2π vardır. π bağı daha zayıf ve tepkimeye daha yatkındır." },
      { term: "Basit (empirik) formül", definition: "Bileşikteki atomların en küçük tam sayılı oranını gösteren formüldür (CH₂O)." },
      { term: "Molekül formülü", definition: "Moleküldeki gerçek atom sayılarını gösterir; basit formülün n katıdır (C₂H₄O₂ = 2 × CH₂O)." },
    ],
    formulas: [
      { expr: "n(C) = n(CO₂) ; n(H) = 2·n(H₂O)", meaning: "Yakma analizinde karbon CO₂’ye, hidrojen H₂O’ya geçer." },
      { expr: "m(O) = m(bileşik) − m(C) − m(H)", meaning: "Bileşikteki oksijen kütlesi farktan bulunur." },
      { expr: "n = Molekül kütlesi / Basit formül kütlesi", meaning: "Molekül formülü = (basit formül)ₙ." },
      { expr: "Hibrit = σ bağı sayısı + ortaklanmamış çift sayısı → 4: sp³, 3: sp², 2: sp", meaning: "Merkez atomun hibritleşmesini bulmanın pratik yolu." },
    ],
    logic:
      "Karbonun temel hâlinde yalnız iki eşleşmemiş elektronu vardır, ama dört bağ yapar. Bunun açıklaması bir 2s elektronunun 2p’ye uyarılması ve orbitallerin hibritleşmesidir. Kaç orbital karışırsa o kadar eş hibrit orbital oluşur; hibrit orbitaller σ bağı yapar, karışmayan p orbitalleri yan yana örtüşüp π bağı yapar. Bu yüzden çift bağlı karbon sp² (bir p orbitali boşta, π için), üçlü bağlı karbon sp’dir (iki p orbitali boşta).",
    examples: [
      {
        level: "kolay",
        problem: "CH₂=CH–C≡CH molekülündeki σ ve π bağ sayılarını bulunuz.",
        steps: [
          "C–H bağları: 2 + 1 + 1 = 4 σ.",
          "C=C: 1σ + 1π ; C–C: 1σ ; C≡C: 1σ + 2π.",
          "Toplam σ = 4 + 1 + 1 + 1 = 7, π = 1 + 2 = 3.",
        ],
        answer: "7 σ, 3 π",
      },
      {
        level: "orta",
        problem: "C, H ve O içeren 3,0 g bileşik yakıldığında 4,4 g CO₂ ve 1,8 g H₂O oluşuyor. Molekül kütlesi 60 g/mol ise molekül formülü nedir? (C = 12, H = 1, O = 16)",
        steps: [
          "n(C) = 4,4/44 = 0,1 mol ⇒ 1,2 g C.",
          "n(H) = 2·(1,8/18) = 0,2 mol ⇒ 0,2 g H.",
          "m(O) = 3,0 − 1,2 − 0,2 = 1,6 g ⇒ 0,1 mol O.",
          "C : H : O = 0,1 : 0,2 : 0,1 = 1 : 2 : 1 ⇒ basit formül CH₂O (30 g/mol).",
          "n = 60/30 = 2 ⇒ C₂H₄O₂.",
        ],
        answer: "C₂H₄O₂",
      },
    ],
    osymThinking:
      "Sorular genellikle bir molekülün yapı formülünü verip farklı karbonlardaki hibritleşmeyi, σ/π sayısını ve bağ açılarını tek soruda karşılaştırır. Allotroplarda elmas-grafit farkı (iletkenlik, sertlik, hibritleşme) öncüllere gizlenir. Yakma analizinde oksijenin farktan bulunması ve basit formülden molekül formülüne geçiş çok adımlı işlem olarak sorulur.",
    commonMistakes: [
      "C–H bağlarını σ sayısına eklemeyi unutmak.",
      "Grafitin elektriği iletmediğini sanmak; grafitteki serbest π elektronları iletkenliği sağlar.",
      "Yakma analizinde H molünü H₂O molüne eşit almak (2 katı olmalı).",
      "Bileşikte oksijen olduğu hâlde oksijeni farktan hesaplamayı atlamak.",
    ],
    tips: [
      "Her çift bağda bir, her üçlü bağda iki π bağı say; geri kalan tüm bağlar σ’dır.",
      "Karbonun hibritini bulmak için bağlı olduğu atom sayısına bak: 4 atom sp³, 3 atom sp², 2 atom sp.",
    ],
    summary: [
      "Karbon dört bağ yapar; elmas sp³, grafit sp² allotroptur.",
      "Tekli bağ σ, çift bağ σ+π, üçlü bağ σ+2π.",
      "sp³: 109,5° düzgün dörtyüzlü, sp²: 120° düzlem üçgen, sp: 180° doğrusal.",
      "Yakma analizi: C → CO₂, H → H₂O, O farktan; molekül formülü = (basit formül)ₙ.",
    ],
  },

  // ------------------------------------------------------------------
  // ORGANİK BİLEŞİKLER (öncelikli)
  // ------------------------------------------------------------------
  {
    topicId: "aytkim-organik-bilesikler",
    intro:
      "Organik bileşikler AYT kimyanın en geniş ve soru çıkma olasılığı en yüksek konularından biridir. İlk bakışta ezber yükü ağır görünür ama arkasındaki mantık basittir: Karbon iskeleti ne kadar uzun, hangi bağları içeriyor ve üzerinde hangi fonksiyonel grup var? Bu üç soruya cevap verebildiğinde bileşiğin adını, fiziksel özelliklerini ve hangi tepkimeyi vereceğini tahmin edebilirsin.\n\nÖnce hidrokarbonları göreceğiz: Tekli bağlı alkanlar (CₙH₂ₙ₊₂), çift bağlı alkenler (CₙH₂ₙ), üçlü bağlı alkinler (CₙH₂ₙ₋₂) ve kararlı halkalı yapısıyla benzen gibi aromatikler. Ardından hidrokarbon iskeletine takılan fonksiyonel grupları tanıyacaksın: alkol (–OH), eter (–O–), aldehit (–CHO), keton (–CO–), karboksilik asit (–COOH), ester (–COO–) ve amin (–NH₂).\n\nSon olarak IUPAC adlandırmasını, aynı formüle sahip farklı yapıları (izomeri) ve katılma, yer değiştirme, yükseltgenme, esterleşme, yanma gibi temel tepkime türlerini öğreneceksin.",
    prerequisites: [
      "Karbonun hibritleşmesi, σ ve π bağları",
      "Molekül arası etkileşimler (hidrojen bağı, dipol-dipol, London kuvvetleri)",
      "Mol kavramı ve kimyasal tepkime denkleştirme",
      "Asit-baz ve yükseltgenme-indirgenme kavramları",
    ],
    concepts: [
      { term: "Alkan", definition: "Yalnız tekli C–C bağı içeren doymuş hidrokarbonlardır (CₙH₂ₙ₊₂). Tepkimeye yatkın değildir; ışık varlığında halojenlerle yer değiştirme (sübstitüsyon) tepkimesi verir." },
      { term: "Alken ve alkin", definition: "Alkenler bir C=C (CₙH₂ₙ), alkinler bir C≡C (CₙH₂ₙ₋₂) içerir. π bağı nedeniyle H₂, X₂, HX ve H₂O katılma tepkimeleri verir; HX katılmasında H, H’si fazla olan karbona gider (Markovnikov)." },
      { term: "Aromatik bileşik", definition: "Benzen (C₆H₆) gibi delokalize π elektronlu halkalı yapılardır. Kararlı olduğu için katılma yerine yer değiştirme tepkimesi verir." },
      { term: "Fonksiyonel grup", definition: "Bileşiğin kimyasal özelliklerini belirleyen atom grubudur: –OH (alkol), –O– (eter), –CHO (aldehit), >C=O (keton), –COOH (karboksilik asit), –COO– (ester), –NH₂ (amin)." },
      { term: "Yapı (konstitüsyon) izomerisi", definition: "Aynı molekül formülüne sahip ama atomların bağlanma sırası farklı bileşiklerdir. Zincir, konum ve fonksiyonel grup izomerisi (etanol – dimetil eter) örnekleridir." },
      { term: "Geometrik (cis-trans) izomeri", definition: "Çift bağlı karbonların her birinde iki farklı grup bulunduğunda ortaya çıkar (2-büten). Aynı taraftaki gruplar cis, zıt taraftakiler trans’tır." },
      { term: "Alkollerin sınıfı", definition: "–OH’ın bağlı olduğu karbona bağlı karbon sayısına göre primer (1°), sekonder (2°), tersiyer (3°) alkoller vardır. 1° alkol aldehite ve sonra karboksilik aside, 2° alkol ketona yükseltgenir; 3° alkol yükseltgenmez." },
      { term: "Esterleşme", definition: "Karboksilik asit ile alkolün asit katalizörlüğünde su açığa çıkararak ester oluşturmasıdır (kondenzasyon). Esterler meyvelerin kokularından sorumludur." },
    ],
    formulas: [
      { expr: "Alkan CₙH₂ₙ₊₂ ; Alken / sikloalkan CₙH₂ₙ ; Alkin / alkadien CₙH₂ₙ₋₂", meaning: "Genel formüller; aynı genel formül farklı sınıfları kapsayabilir (izomeri)." },
      { expr: "Doymamışlık derecesi = (2C + 2 − H)/2", meaning: "Halka + π bağı sayısını verir; C₄H₆ için 2 (bir üçlü bağ ya da iki çift bağ)." },
      { expr: "CₙH₂ₙ₊₂ + (3n+1)/2 O₂ → n CO₂ + (n+1) H₂O", meaning: "Alkanların tam yanma denklemi; mol oranlarından formül bulunur." },
      { expr: "R–COOH + R′–OH ⇌ R–COO–R′ + H₂O", meaning: "Esterleşme; ester adı “alkil alkanoat” biçiminde okunur (alkolden gelen kısım önce)." },
      { expr: "1° alkol → aldehit → karboksilik asit ; 2° alkol → keton", meaning: "Yükseltgenme sırası; 3° alkol ve keton kolay yükseltgenmez." },
      { expr: "Adlandırma: en uzun zincir → dallara en küçük numara → dallar alfabetik (etil < metil)", meaning: "IUPAC adlandırmasının temel adımları." },
    ],
    logic:
      "Neden alkenler katılma, benzen yer değiştirme tepkimesi verir? Alkendeki π bağı zayıftır; kırılıp iki yeni σ bağına dönüşmesi enerjice avantajlıdır. Benzende ise π elektronları halka boyunca yayılmıştır (delokalizasyon) ve bu ekstra kararlılık sağlar. Katılma olursa bu kararlılık kaybolur; bu yüzden benzen halkayı koruyan yer değiştirme yolunu seçer.\n\nKaynama noktası farklarının arkasında molekül arası kuvvetler vardır. Etanol ile dimetil eter aynı formüle (C₂H₆O) sahiptir; ama etanolde O’ya bağlı H bulunduğu için moleküller arası hidrojen bağı kurulur ve etanol 78 °C’de, dimetil eter ise yaklaşık −24 °C’de kaynar. Karboksilik asitler hem hidrojen bağı yapar hem de dimer oluşturur; bu yüzden benzer kütleli alkollerden de yüksek kaynar. Alkanlarda zincir uzadıkça London kuvvetleri artar, dallanma ise yüzey alanını azaltıp kaynama noktasını düşürür.\n\nAlkol yükseltgenmesinde kural, –OH’ın bağlı olduğu karbon üzerindeki H sayısına bağlıdır: Yükseltgenme o karbondan bir H koparır. 1° alkolde iki H olduğu için iki basamak (aldehit, sonra asit), 2° alkolde bir H olduğu için tek basamak (keton) ilerler; 3° alkolde H olmadığından tepkime olmaz.",
    examples: [
      {
        level: "kolay",
        problem: "CH₃–CH₂–CH₂–OH ve CH₃–CH(OH)–CH₃ bileşiklerinin adlarını ve yükseltgenme ürünlerini yazınız.",
        steps: [
          "Birincisi 1-propanol (1° alkol); yükseltgenince propanal, sonra propanoik asit oluşur.",
          "İkincisi 2-propanol (2° alkol); yükseltgenince propanon (aseton) oluşur.",
        ],
        answer: "1-propanol → propanal → propanoik asit; 2-propanol → propanon",
      },
      {
        level: "orta",
        problem: "CH₃–CH(CH₃)–CH(C₂H₅)–CH₂–CH₃ bileşiğini IUPAC kurallarına göre adlandırınız.",
        steps: [
          "En uzun zincir 5 karbonludur (pentan); etil kolu zincirin bir ucu olarak da seçilebilir ama zincir yine 5 karbon kalır.",
          "Numaralama dallara en küçük numarayı verecek uçtan: metil C-2’de, etil C-3’te.",
          "Dallar alfabetik sırayla yazılır: etil, metil’den önce gelir.",
          "Ad: 3-etil-2-metilpentan.",
        ],
        answer: "3-etil-2-metilpentan",
      },
      {
        level: "zor",
        problem: "0,1 mol X hidrokarbonu 0,2 mol Br₂ ile tamamen doyuruluyor. Aynı miktar X yakıldığında 0,4 mol CO₂ oluşuyor. X’in formülü ve olası yapıları nelerdir?",
        steps: [
          "CO₂ molü / X molü = 0,4/0,1 = 4 ⇒ X’te 4 C vardır.",
          "Br₂ molü / X molü = 2 ⇒ molekülde 2 π bağı vardır (bir üçlü bağ ya da iki çift bağ).",
          "4 karbonlu, 2 π bağlı açık zincirli hidrokarbon: C₄H₆ (CₙH₂ₙ₋₂).",
          "Olası yapılar: 1-bütin, 2-bütin, 1,3-bütadien (ve 1,2-bütadien).",
        ],
        answer: "C₄H₆ (ör. 1-bütin, 2-bütin, 1,3-bütadien)",
      },
    ],
    osymThinking:
      "Organik sorular çoğu zaman bir yapı formülü ya da tepkime zinciri verip ara ürünleri sordurur: “X alkolü yükseltgenince Y, Y de Z’ye dönüşüyor” gibi. Genel formülün birden fazla sınıfa ait olabileceği (C₃H₆: propen veya siklopropan; C₂H₆O: alkol veya eter) izomeri tuzakları, kaynama noktası tablolarıyla hidrojen bağı yorumu, adlandırmada en uzun zincir ve alfabetik sıra hataları ölçülen başlıca becerilerdir. Yanma ve katılma tepkimelerinin mol oranlarından formül bulma da sık gelen çok adımlı soru tipidir.",
    commonMistakes: [
      "En uzun zinciri düz yazılmış kısım sanmak; dal olarak yazılmış etil grubunun zinciri uzatabileceğini gözden kaçırmak.",
      "Dalları alfabetik yerine numara sırasına göre yazmak (2-metil-3-etil… yanlıştır).",
      "Ketonların da aldehitler gibi kolayca yükseltgendiğini ya da 3° alkollerin keton verdiğini sanmak.",
      "Benzenin katılma tepkimesi verdiğini düşünmek; benzen genellikle yer değiştirme tepkimesi verir.",
      "Her çift bağlı bileşiğin cis-trans izomerisi gösterdiğini sanmak; çift bağın her iki karbonunda da iki farklı grup olmalıdır.",
      "Ester adında alkol ve asit kısımlarını ters okumak (CH₃COOC₂H₅ = etil etanoat, “etanoil etil” değil).",
    ],
    tips: [
      "Formül verildiğinde önce doymamışlık derecesini hesapla; kaç π bağı ya da halka olduğunu hemen görürsün.",
      "Esteri adlandırırken –COO–’nun O tarafındaki grup “alkil”, C=O tarafındaki grup “-oat” olur.",
      "Kaynama noktası sıralamasında: karboksilik asit > alkol > aldehit/keton > eter ≈ alkan (benzer kütlelerde).",
      "HX katılmasında “zengin daha zenginleşir”: H, zaten çok H’si olan karbona bağlanır.",
    ],
    summary: [
      "Alkan CₙH₂ₙ₊₂ (yer değiştirme), alken CₙH₂ₙ ve alkin CₙH₂ₙ₋₂ (katılma), benzen yer değiştirme verir.",
      "Fonksiyonel gruplar: –OH alkol, –O– eter, –CHO aldehit, –CO– keton, –COOH asit, –COO– ester, –NH₂ amin.",
      "Adlandırma: en uzun zincir, en küçük numaralar, alfabetik dallar.",
      "İzomeri: zincir, konum, fonksiyonel grup ve cis-trans; aynı formül farklı özellik.",
      "1° alkol → aldehit → asit; 2° alkol → keton; 3° alkol yükseltgenmez.",
      "Asit + alkol → ester + su; esterler meyve kokularından sorumludur.",
      "Hidrojen bağı yapan bileşikler (alkol, asit, 1°/2° amin) benzer kütleli bileşiklerden yüksek kaynar.",
    ],
  },

  // ------------------------------------------------------------------
  // ENERJİ KAYNAKLARI
  // ------------------------------------------------------------------
  {
    topicId: "aytkim-enerji-kaynaklari",
    intro:
      "Kimyanın günlük hayata en doğrudan dokunduğu yer enerjidir. Bu konuda fosil yakıtların (kömür, petrol, doğal gaz) oluşumunu ve kullanımını, petrolün rafinerilerde fraksiyonlu damıtma ile ayrılmasını, yanma tepkimelerinin çevreye etkilerini ve alternatif enerji kaynaklarını (güneş, rüzgâr, hidroelektrik, jeotermal, biyokütle, nükleer, hidrojen) inceleyeceksin.\n\nAmaç ezber listeler değil; bir yakıtın birim kütle başına verdiği enerjiyi, ürettiği CO₂ miktarını ve yenilenebilir olup olmadığını kimya bilgisiyle değerlendirmektir. Hidrojen yakıt pili de elektrokimyayla bu konuyu birleştiren önemli bir örnektir.",
    prerequisites: [
      "Yanma tepkimeleri ve tepkime entalpisi",
      "Mol-kütle hesapları",
      "Galvanik hücrede anot ve katot kavramları",
    ],
    concepts: [
      { term: "Fosil yakıt", definition: "Milyonlarca yıl önce yaşamış canlıların kalıntılarından oluşan kömür, petrol ve doğal gazdır. Yenilenemez kaynaklardır; yandıklarında CO₂ ve kükürtlü yakıtlarda SO₂ açığa çıkar." },
      { term: "Kömürleşme", definition: "Bitki kalıntılarının basınç ve ısı etkisiyle karbon oranının artmasıdır: turba < linyit < taşkömürü < antrasit. Karbon oranı arttıkça ısıl değer genellikle artar." },
      { term: "Fraksiyonlu (ayrımsal) damıtma", definition: "Ham petrolün kaynama noktası farkından yararlanarak LPG, benzin, nafta, gazyağı, motorin ve fuel-oil gibi kesimlere ayrılmasıdır. Kısa zincirli, düşük kaynama noktalı kesimler kolonun üstünden alınır." },
      { term: "Yenilenebilir enerji", definition: "Doğada kendini yenileyen ya da tükenmeyen kaynaklardan elde edilen enerjidir: güneş, rüzgâr, hidroelektrik, jeotermal, biyokütle, dalga. Nükleer enerji yenilenebilir değildir." },
      { term: "Hidrojen yakıt pili", definition: "H₂’nin anotta yükseltgenip O₂’nin katotta indirgendiği, yanma enerjisini doğrudan elektriğe çeviren galvanik hücredir; tek ürün sudur." },
    ],
    formulas: [
      { expr: "CH₄ + 2O₂ → CO₂ + 2H₂O", meaning: "Doğal gazın (metan) tam yanması." },
      { expr: "Yakıt pili: Anot 2H₂ → 4H⁺ + 4e⁻ ; Katot O₂ + 4H⁺ + 4e⁻ → 2H₂O", meaning: "Asidik ortamlı hidrojen yakıt pilinin yarı tepkimeleri; net tepkime 2H₂ + O₂ → 2H₂O." },
      { expr: "Isıl değer (kJ/g) = yanma ısısı (kJ/mol) / mol kütlesi (g/mol)", meaning: "Yakıtların birim kütle başına verdiği enerjiyi karşılaştırmak için kullanılır." },
    ],
    logic:
      "Hidrojen neden “temiz yakıt” sayılır? Çünkü yanma ürünü yalnız sudur, CO₂ oluşmaz. Ayrıca molar kütlesi çok küçük olduğundan gram başına verdiği enerji (yaklaşık 143 kJ/g) tüm karbonlu yakıtlardan fazladır. Ancak hidrojen doğada serbest hâlde bulunmaz; üretimi enerji ister. Bu enerji fosil yakıttan gelirse çevre avantajı azalır, güneş-rüzgâr gibi kaynaklardan gelirse gerçekten temiz bir döngü kurulur. Fosil yakıtlar içinde doğal gaz, H/C oranı yüksek olduğu için aynı enerjiyi kömüre göre çok daha az CO₂ salarak verir.",
    examples: [
      {
        level: "kolay",
        problem: "CH₄’ün molar yanma ısısı 890 kJ, H₂’nin 286 kJ’dir. Hangi yakıt gram başına daha fazla enerji verir? (C = 12, H = 1)",
        steps: [
          "CH₄: 890/16 ≈ 55,6 kJ/g.",
          "H₂: 286/2 = 143 kJ/g.",
          "H₂ gram başına yaklaşık 2,6 kat fazla enerji verir.",
        ],
        answer: "H₂ (≈143 kJ/g)",
      },
      {
        level: "orta",
        problem: "1000 kJ enerji elde etmek için metan (890 kJ/mol) ve grafit (C, 393,5 kJ/mol) yakılıyor. Hangisi daha az CO₂ üretir?",
        steps: [
          "Metan: 1000/890 ≈ 1,12 mol CH₄ ⇒ 1,12 mol CO₂.",
          "Grafit: 1000/393,5 ≈ 2,54 mol C ⇒ 2,54 mol CO₂.",
          "Metan aynı enerji için yarıdan daha az CO₂ üretir.",
        ],
        answer: "Metan",
      },
    ],
    osymThinking:
      "Bu konudaki sorular genelde güncel bir bağlamla (iklim değişikliği, yakıt pilli araçlar, biyogaz) kurulur ve yenilenebilir-yenilenemez ayrımını, yakıtların ısıl değerlerini ve CO₂ salımını tablo verisiyle karşılaştırtır. Yakıt pilinde anot-katot tepkimeleri ile elektrokimya bilgisi, fraksiyonlu damıtmada ise kaynama noktası-zincir uzunluğu ilişkisi yoklanır.",
    commonMistakes: [
      "Nükleer enerjiyi yenilenebilir saymak (uranyum rezervleri sınırlıdır).",
      "Molar yanma ısısı büyük olan yakıtın gram başına da daha fazla enerji verdiğini sanmak.",
      "Yakıt pilinde O₂’nin anotta tepkimeye girdiğini düşünmek; O₂ katotta indirgenir.",
      "Fraksiyonlu damıtmada ağır kesimlerin kolonun üstünden alındığını sanmak.",
    ],
    tips: [
      "Yakıt karşılaştırmasında her zaman aynı birime (kJ/g ya da mol CO₂/kJ) indir.",
      "Yakıt pili de bir galvanik hücredir: yakıt (H₂) anotta, oksijen katotta.",
    ],
    summary: [
      "Fosil yakıtlar yenilenemez; kömürde karbon oranı turba < linyit < taşkömürü < antrasit.",
      "Petrol fraksiyonlu damıtmayla kaynama noktasına göre ayrılır; hafif kesimler üstten alınır.",
      "H₂ gram başına en çok enerji veren ve CO₂ üretmeyen yakıttır; yakıt pilinde ürün sudur.",
      "Güneş, rüzgâr, hidroelektrik, jeotermal, biyokütle yenilenebilir; nükleer değildir.",
    ],
  },
];
