import type { LessonSeed } from '../../domain/types';

export const lessons: LessonSeed[] = [
  {
    topicId: 'tytdin-bilgi-ve-inanc',
    intro:
      "İnsan, çevresini ve kendisini tanımak için bilgiye ihtiyaç duyar. İslam düşüncesinde bilginin kaynakları genel olarak sağlam duyular, akıl ve doğru haber (haber-i sadık) olarak sayılır. Doğru haber; birbirini doğrulayan çok sayıda kişinin aktardığı mütevatir haber ile peygamberin vahye dayanan haberini kapsar.\n\nİnanç (iman), sözlükte “güvenmek, tasdik etmek” anlamına gelir. İslam’da iman; Allah’a, meleklere, kitaplara, peygamberlere, ahiret gününe ve kadere inanmayı içerir. TYT’de bu konuda bilginin kaynakları, iman esasları, Allah’ın sıfatları ve inançla ilgili farklı yaklaşımlar sorulur.",
    prerequisites: [
      "Bilgi ve inanç kavramlarını günlük hayattaki anlamlarıyla bilmek",
      "Akıl ve duyu kavramlarını ayırt edebilmek",
      "Temel dinî kavramlara (vahiy, peygamber) aşina olmak",
    ],
    concepts: [
      { term: "İman", definition: "Hz. Muhammed’in Allah’tan getirdiği temel esasları kalp ile tasdik etmek ve bunu dil ile ikrar etmek." },
      { term: "Taklidi iman", definition: "Araştırmadan, aileden ve çevreden gördüğü şekliyle benimsenen iman." },
      { term: "Tahkiki iman", definition: "Araştırarak, düşünerek ve delillere dayanarak benimsenen iman." },
      { term: "Tevhid", definition: "Allah’ın bir ve tek olduğuna, O’nun zatında, sıfatlarında ve fiillerinde ortağı bulunmadığına inanmak." },
      { term: "Zati sıfatlar", definition: "Yalnız Allah’a ait olan sıfatlar: vücut, kıdem, beka, vahdaniyet, muhalefetün lil-havadis, kıyam bi-nefsihi." },
      { term: "Subuti sıfatlar", definition: "Allah’ın yetkinliğini ifade eden sıfatlar: hayat, ilim, semi, basar, irade, kudret, kelam, tekvin." },
    ],
    formulas: [
      { expr: "Bilginin kaynakları: sağlam duyular + akıl + doğru haber", meaning: "İslam düşüncesinde bilgi bu üç yolla elde edilir." },
      { expr: "Doğru haber = mütevatir haber + peygamber haberi", meaning: "Yalan üzerinde birleşmeleri düşünülemeyecek topluluğun haberi ile vahye dayanan haber." },
      { expr: "İman esasları (6): Allah, melekler, kitaplar, peygamberler, ahiret, kader", meaning: "Bir Müslümanın inanması gereken temel esaslar." },
      { expr: "Deizm", meaning: "Allah’ın yarattığını kabul edip vahyi, peygamberliği ve evrene müdahaleyi reddeden görüş." },
      { expr: "Agnostisizm", meaning: "Allah’ın varlığı ya da yokluğu hakkında kesin bilgiye ulaşılamayacağını savunan görüş." },
      { expr: "Reenkarnasyon", meaning: "Ruhun ölümden sonra başka bir bedende yeniden doğduğu inancı; İslam’ın ahiret inancıyla bağdaşmaz." },
    ],
    logic:
      "İslam düşüncesinde duyular, akıl ve doğru haber birbirini tamamlar. Duyularla fiziksel dünyayı, akılla soyut ilişkileri ve çıkarımları, doğru haberle ise kendi deneyimimizin ulaşamadığı bilgileri öğreniriz. Görmediğimiz bir şehrin varlığını pek çok farklı ve güvenilir kaynaktan duymamız buna örnektir.\n\nKur’an’da insanlar sık sık düşünmeye, akıl etmeye ve evrendeki düzeni incelemeye çağrılır. Bu nedenle taklidi iman geçerli sayılmakla birlikte, araştırarak ve delillere dayanarak ulaşılan tahkiki iman daha sağlam kabul edilir.",
    examples: [
      {
        level: 'kolay',
        problem: "Bir kişi, bir mağazada satılan elmanın ekşi olduğunu tadına bakarak anlıyor. Bu bilgiyi hangi kaynakla edinmiştir?",
        steps: [
          "Bilgi tatma duyusu yoluyla elde edilmiştir.",
          "Duyular bilginin kaynaklarından biridir.",
        ],
        answer: "Sağlam duyular.",
      },
      {
        level: 'orta',
        problem: "“Kıdem” ve “ilim” sıfatlarından hangisi zati, hangisi subuti sıfattır?",
        steps: [
          "Kıdem, Allah’ın varlığının başlangıcı olmaması demektir ve yalnız O’na aittir; zati sıfattır.",
          "İlim, Allah’ın her şeyi bilmesidir; subuti sıfatlardandır.",
        ],
        answer: "Kıdem zati, ilim subuti sıfattır.",
      },
    ],
    osymThinking:
      "Sorular genellikle günlük hayattan kısa durumlar verip hangi bilgi kaynağının kullanıldığını ya da hangi iman türünün anlatıldığını sorar. Sıfat sorularında zati–subuti ayrımı, yaklaşım sorularında ise deizm, ateizm, agnostisizm ve panteizm tanımlarının karıştırılıp karıştırılmadığı ölçülür. Tanımdaki anahtar ifadeye odaklan.",
    commonMistakes: [
      "Agnostisizmi Allah’ın varlığını reddetmek (ateizm) sanmak.",
      "Kudret ve irade gibi subuti sıfatları zati sıfat sanmak.",
      "Mütevatir haberi tek bir kişinin anlattığı haber sanmak.",
    ],
    tips: [
      "Zati sıfatları “Vücut, Kıdem, Beka, Vahdaniyet, Muhalefet, Kıyam” sırasıyla ezberle; geri kalan sekizi subutidir.",
      "Tahkik = araştırma; taklit = başkasına uyma.",
    ],
    summary: [
      "Bilginin kaynakları: sağlam duyular, akıl, doğru haber.",
      "İman altı esastan oluşur.",
      "Taklidi iman aktarılarak, tahkiki iman araştırılarak benimsenir.",
      "Allah’ın sıfatları zati ve subuti olarak ikiye ayrılır.",
    ],
  },
  {
    topicId: 'tytdin-din-ve-islam',
    intro:
      "Din, genel olarak kutsal kabul edilen bir varlığa inanmayı, bu inancın gerektirdiği ibadetleri ve ahlaki ilkeleri içeren bir sistemdir. Hemen her dinde inanç, ibadet ve ahlak temel unsurlar olarak bulunur.\n\n“İslam” kelimesi Arapçada “barış, esenlik ve teslimiyet” anlamlarıyla ilişkili bir kökten gelir. İslam’ın temel kaynakları Kur’an-ı Kerim ve Hz. Muhammed’in sünnetidir. TYT’de dinin unsurları, İslam’ın temel amaçları, din ile kültür ilişkisi ve dinî sorumluluğun şartları sorulur.",
    prerequisites: [
      "İnanç ve iman kavramlarını bilmek",
      "Kültür kavramının anlamını bilmek",
    ],
    concepts: [
      { term: "Din", definition: "Kutsal kabul edilen bir varlığa inanmayı, ibadetleri ve ahlaki ilkeleri içeren inanç sistemi." },
      { term: "Sünnet", definition: "Hz. Muhammed’in söz, fiil ve onaylarından oluşan, Kur’an’dan sonra İslam’ın ikinci temel kaynağı." },
      { term: "Mükellef", definition: "Dinî emir ve yasaklardan sorumlu olan; akıllı, ergenlik çağına ulaşmış ve kendisine din tebliğ edilmiş kişi." },
      { term: "Zaruriyat (temel değerler)", definition: "İslam’ın korunmasını amaçladığı beş temel değer: din, can, akıl, nesil, mal." },
    ],
    formulas: [
      { expr: "Dinin temel unsurları: inanç + ibadet + ahlak", meaning: "Dinlerin çoğunda bu üç unsur birlikte bulunur." },
      { expr: "İslam’ın temel kaynakları: Kur’an + sünnet", meaning: "Sünnet, Kur’an’ı açıklar ve uygulamaya dönüştürür." },
      { expr: "Korunan beş değer: din, can, akıl, nesil, mal", meaning: "İslam’ın hükümleri bu değerleri korumayı amaçlar." },
      { expr: "Sorumluluğun şartları: akıl + ergenlik + tebliğ", meaning: "Bu şartlara sahip olmayan kişi dinî emirlerden sorumlu tutulmaz." },
    ],
    logic:
      "Dinî sorumluluk için akıl ve ergenlik şartı aranır; çünkü sorumluluk ancak neyin doğru neyin yanlış olduğunu ayırt edebilen kişiye yüklenebilir. Kur’an’da da Allah’ın hiç kimseye gücünün yetmeyeceği bir yük yüklemediği vurgulanır.\n\nDin ile kültür iç içedir: Dinin temel esasları (iman, ibadetlerin özü) her yerde aynıdır; ancak bu esasların yaşanış biçimi, toplumların gelenekleriyle birleşerek farklı renkler kazanır. Bayramlardaki yemekler ya da ilahilerin ezgileri bu kültürel çeşitliliğin örnekleridir.",
    examples: [
      {
        level: 'kolay',
        problem: "İçki ve uyuşturucunun yasaklanması, İslam’ın korumayı amaçladığı hangi temel değerle en doğrudan ilgilidir?",
        steps: [
          "İçki ve uyuşturucu öncelikle insanın muhakeme yeteneğine zarar verir.",
          "Bu yasak aklın korunmasına yöneliktir.",
        ],
        answer: "Aklın korunması.",
      },
      {
        level: 'orta',
        problem: "Kur’an’da namaz emredilmiş, ancak nasıl kılınacağı ayrıntılı anlatılmamıştır. Müslümanlar namazın kılınış şeklini hangi kaynaktan öğrenmiştir?",
        steps: [
          "Kur’an birçok ibadeti ana hatlarıyla emreder.",
          "Hz. Muhammed namazı bizzat kılarak göstermiş; bu uygulama sünnettir.",
        ],
        answer: "Sünnetten.",
      },
    ],
    osymThinking:
      "Bu konudaki sorular genellikle bir hüküm ya da durum verip İslam’ın hangi temel değeri korumayı amaçladığını, ya da bir uygulamanın din mi kültür mü kaynaklı olduğunu sorar. Sünnetin Kur’an’la ilişkisini soran paragraflarda “açıklama, ayrıntılandırma, uygulama” kavramlarına dikkat et.",
    commonMistakes: [
      "Kültürel gelenekleri (bayram yemekleri, kıyafetler) dinin temel esasları sanmak.",
      "Sünneti Kur’an’dan bağımsız, onunla çelişebilen bir kaynak sanmak.",
      "Zenginlik gibi durumları dinî sorumluluğun genel şartı sanmak.",
    ],
    tips: [
      "Beş temel değeri “din–can–akıl–nesil–mal” sırasıyla hatırla.",
      "Sorumluluk üçlüsü: akıl, bülûğ (ergenlik), tebliğ.",
    ],
    summary: [
      "Dinin temel unsurları inanç, ibadet ve ahlaktır.",
      "İslam; barış, esenlik ve teslimiyet anlamlarıyla ilişkilidir.",
      "Temel kaynaklar Kur’an ve sünnettir.",
      "İslam din, can, akıl, nesil ve malı korumayı amaçlar.",
    ],
  },
  {
    topicId: 'tytdin-islam-ve-ibadet',
    intro:
      "İbadet, Allah’a saygı ve bağlılığı ifade etmek amacıyla O’nun emirlerine uygun olarak yapılan davranışlardır. İbadetler yapılış biçimlerine göre bedenle (namaz, oruç), malla (zekât, sadaka) ve hem malla hem bedenle (hac) yapılanlar olarak gruplandırılır.\n\nTYT’de bu konuda ibadet çeşitleri, dinî hükümler (farz, vacip, sünnet, mubah, mekruh, haram), abdest ve namazın farzları, zekâtın oranı, haccın farzları ve ibadetlerin bireye ve topluma katkıları sorulur.",
    prerequisites: [
      "İslam’ın temel kaynaklarını bilmek",
      "Dinî sorumluluğun şartlarını bilmek",
    ],
    concepts: [
      { term: "Farz", definition: "Yapılması kesin delille emredilen, yapılması zorunlu olan davranış." },
      { term: "Vacip", definition: "Hanefi mezhebine göre yapılması gerekli olan, delili farz kadar kesin olmayan davranış (ör. kurban, vitir namazı)." },
      { term: "Sünnet", definition: "Hz. Muhammed’in yapılmasını tavsiye ettiği ya da kendisinin yaptığı davranışlar." },
      { term: "Mubah", definition: "Yapılıp yapılmaması serbest bırakılan davranış." },
      { term: "Mekruh", definition: "Dinin hoş görmediği, yapılmaması istenen ancak haram kadar kesin yasaklanmamış davranış." },
      { term: "Haram", definition: "Kesin delille yasaklanmış, yapılması günah olan davranış." },
    ],
    formulas: [
      { expr: "Abdestin farzları (Hanefi, 4)", meaning: "Yüzü yıkamak, kolları dirseklerle birlikte yıkamak, başın dörtte birini meshetmek, ayakları topuklarla birlikte yıkamak." },
      { expr: "Namazın farzları (Hanefi, 12)", meaning: "Dışındakiler: hadesten ve necasetten taharet, setr-i avret, istikbal-i kıble, vakit, niyet. İçindekiler: iftitah tekbiri, kıyam, kıraat, rükû, secde, ka’de-i ahire." },
      { expr: "Zekât oranı = 1/40 (%2,5)", meaning: "Nisap miktarı mala sahip olup üzerinden bir kameri yıl geçen kişi para ve ticaret mallarının kırkta birini verir." },
      { expr: "Haccın farzları: ihram, Arafat vakfesi, ziyaret tavafı", meaning: "Hac, gücü yeten Müslümana ömründe bir kez farzdır." },
      { expr: "Hac = mal + beden", meaning: "Hem mali hem bedeni güç gerektiren ibadettir." },
    ],
    logic:
      "İbadetlerin bir kısmı bedenle, bir kısmı malla yapılır; çünkü insanın hem bedeni hem malı Allah’ın bir emaneti kabul edilir. Zekâtla varlıklı kişi malının bir kısmını ihtiyaç sahibiyle paylaşır; böylece toplumda dayanışma güçlenir ve servet belli ellerde birikmez.\n\nCemaatle namaz ve hac gibi ibadetler ise farklı statüdeki insanları aynı safta buluşturarak eşitlik ve kardeşlik bilincini güçlendirir. Bu nedenle ibadetlerin yalnızca bireysel değil, toplumsal faydaları da vardır.",
    examples: [
      {
        level: 'kolay',
        problem: "Namaz, oruç, zekât ve hac ibadetlerini yapılış biçimlerine göre grupla.",
        steps: [
          "Namaz ve oruç bedenle yapılır.",
          "Zekât malla yapılır.",
          "Hac hem malla hem bedenle yapılır.",
        ],
        answer: "Beden: namaz, oruç; mal: zekât; mal ve beden: hac.",
      },
      {
        level: 'orta',
        problem: "Ticaret malları 40.000 TL değerinde olan ve nisap şartlarını taşıyan bir tüccar ne kadar zekât vermelidir?",
        steps: [
          "Zekât oranı kırkta birdir (1/40).",
          "40.000 / 40 = 1.000 TL.",
        ],
        answer: "1.000 TL.",
      },
    ],
    osymThinking:
      "Sorular çoğunlukla bir ibadetin özelliklerini ya da bir dinî hükmün tanımını sorar; bazen de ibadetlerin toplumsal faydalarını anlatan bir paragraftan ortak sonuç çıkarılması istenir. Hüküm sorularında farz–vacip, mekruh–haram ayrımına; ibadet sorularında malla–bedenle yapılma ayrımına dikkat et.",
    commonMistakes: [
      "Mekruhu haram ile aynı saymak.",
      "Ağza ve burna su vermeyi Hanefi mezhebinde abdestin farzı sanmak (abdestte sünnettir, gusülde farzdır).",
      "Zekât oranını %10 ya da %5 sanmak; para ve ticaret mallarında oran %2,5’tir.",
      "Veda tavafını ya da sa’yi haccın farzı sanmak.",
    ],
    tips: [
      "Abdestin dört farzı: yüz, kollar, baş (dörtte bir mesh), ayaklar.",
      "Haccın farzları üç tanedir: ihram, Arafat, ziyaret tavafı.",
    ],
    summary: [
      "İbadetler bedenle, malla ya da her ikisiyle yapılır.",
      "Dinî hükümler: farz, vacip, sünnet, mubah, mekruh, haram.",
      "Zekât oranı kırkta birdir; hac ömürde bir kez farzdır.",
      "İbadetler bireye huzur, topluma dayanışma ve eşitlik bilinci kazandırır.",
    ],
  },
  {
    topicId: 'tytdin-ahlak-ve-degerler',
    intro:
      "Ahlak kelimesi, “huy, karakter, mizaç” anlamlarına gelen “hulk” kelimesinin çoğuludur. Ahlak, insanın iyi ve kötü davranışlarını belirleyen ilke ve değerler bütünüdür. İslam’da ahlak, imanın ve ibadetin doğal bir sonucu olarak görülür; Kur’an’da Hz. Muhammed’in yüce bir ahlak üzere olduğu bildirilir (Kalem suresi, 4. ayet).\n\nTYT’de bu konuda temel ahlaki değerler (adalet, doğruluk, emanet, merhamet, sabır, tevazu), ahlakı zedeleyen davranışlar (gıybet, suizan, yalan) ve gençlerin sorumlulukları sorulur.",
    prerequisites: [
      "Din ve ibadet kavramlarını bilmek",
      "Değer kavramını genel anlamıyla bilmek",
    ],
    concepts: [
      { term: "Ahlak", definition: "İnsanın iyi ve kötü davranışlarını yönlendiren ilke ve değerler bütünü; kelime olarak “huylar” demektir." },
      { term: "Emanet", definition: "Kişiye teslim edilen mal, sır ya da görevi korumak ve zamanı gelince hakkıyla yerine getirmek." },
      { term: "Tevazu", definition: "Alçakgönüllülük; kişinin kendini başkalarından üstün görmemesi." },
      { term: "Gıybet", definition: "Bir kimsenin arkasından, duyduğunda hoşlanmayacağı şekilde konuşmak." },
      { term: "Suizan", definition: "İnsanlar hakkında delilsiz yere kötü düşünmek." },
    ],
    formulas: [
      { expr: "Kalem suresi, 4. ayet", meaning: "Hz. Muhammed’in yüce bir ahlak üzere olduğu bildirilir." },
      { expr: "Hucurat suresi, 12. ayet", meaning: "Zannın çoğundan kaçınmak, birbirinin kusurunu araştırmamak ve gıybet etmemek öğütlenir." },
      { expr: "Hucurat suresi, 13. ayet", meaning: "İnsanlar bir erkek ve bir dişiden yaratılmıştır; üstünlük soyla değil takvayla (Allah’a saygıyla sakınma) ölçülür." },
      { expr: "Doğruluk (sıdk)", meaning: "Sözde, işte ve davranışta dürüst olmak; ticarette kusuru gizlememek." },
    ],
    logic:
      "İslam’da ahlak ile iman arasında sıkı bir bağ kurulur: İnanan kişinin bu inancı davranışlarına yansımalıdır. Bu yüzden ibadetlerin de ahlaki bir amacı vardır; örneğin namazın insanı kötülüklerden alıkoyması, orucun sabrı ve iradeyi güçlendirmesi hedeflenir.\n\nGıybet ve suizan gibi davranışlar toplumdaki güveni zedeler; bu nedenle Kur’an’da açıkça yasaklanmıştır. Adalet, doğruluk ve emanet gibi değerler ise sağlıklı bir toplumun temelidir.",
    examples: [
      {
        level: 'kolay',
        problem: "Arkadaşının kendisine anlattığı bir sırrı kimseye söylemeyen öğrenci hangi değeri gözetmiştir?",
        steps: [
          "Sır, kişiye güvenilerek teslim edilmiştir.",
          "Sırrı korumak emanete riayettir.",
        ],
        answer: "Emanet.",
      },
      {
        level: 'orta',
        problem: "Hucurat suresi 13. ayetinde üstünlüğün takvaya bağlanması, ırkçılıkla ilgili nasıl bir sonuç doğurur?",
        steps: [
          "Ayet, bütün insanların aynı kökenden geldiğini bildirir.",
          "Üstünlük ölçütü soy değil takva olduğundan soy ve ırk üstünlüğü iddiası ayetle bağdaşmaz.",
        ],
        answer: "Irk ve soya dayalı üstünlük iddiaları reddedilir.",
      },
    ],
    osymThinking:
      "Sorular genellikle kısa bir olay anlatıp hangi ahlaki değerin öne çıktığını sorar ya da bir ayetin anlamını verip hangi davranışın teşvik edildiğini veya yasaklandığını sorar. “Ulaşılamaz” ifadeli sorularda ayette olmayan, aşırı genellenmiş ya da ayetin mesajıyla çelişen seçeneği ara.",
    commonMistakes: [
      "Gıybet ile iftirayı karıştırmak; gıybet doğru olan bir kusuru arkadan konuşmaktır, iftira ise olmayan bir şeyi isnat etmektir.",
      "Tevazuyu kendini değersiz görmek sanmak.",
      "Ahlakı ibadetten bağımsız, dinle ilgisiz bir alan sanmak.",
    ],
    tips: [
      "Olayda “güvenilerek bırakılan” bir şey varsa emanet, “kusuru söyleme” varsa doğruluk düşün.",
      "Hucurat 12 → gıybet ve suizan; Hucurat 13 → eşitlik ve takva.",
    ],
    summary: [
      "Ahlak, “hulk” kelimesinin çoğuludur; huylar anlamına gelir.",
      "Temel değerler: adalet, doğruluk, emanet, merhamet, sabır, tevazu.",
      "Gıybet ve suizan toplumsal güveni zedeler.",
      "Gençler, sağlıklı arkadaşlıklar ve verimli uğraşlarla kötü alışkanlıklardan korunabilir.",
    ],
  },
  {
    topicId: 'tytdin-hz-muhammed',
    intro:
      "Hz. Muhammed 571 yılında Mekke’de doğdu. Babası Abdullah o doğmadan önce, annesi Âmine ise altı yaşındayken vefat etti; önce dedesi Abdülmuttalib, sonra amcası Ebu Talib onu himaye etti. Dürüstlüğü nedeniyle gençliğinde “Muhammedü’l-Emin” (güvenilir Muhammed) olarak anıldı. Kırk yaşında (610) Hira Mağarası’nda ilk vahyi aldı.\n\nTYT’de Hz. Muhammed’in hayatındaki önemli olaylar ve bunların sırası, peygamberlerin ortak özellikleri (sıdk, emanet, fetanet, tebliğ, ismet) ve Hz. Muhammed’in görevleri (tebliğ, açıklama, örnek olma) sorulur.",
    prerequisites: [
      "Vahiy ve peygamber kavramlarını bilmek",
      "Hicri takvimin Hicret’le başladığını bilmek",
    ],
    concepts: [
      { term: "Sıdk", definition: "Peygamberlerin doğru sözlü olması." },
      { term: "Emanet", definition: "Peygamberlerin güvenilir olması." },
      { term: "Fetanet", definition: "Peygamberlerin akıllı, zeki ve uyanık olması." },
      { term: "Tebliğ", definition: "Peygamberlerin Allah’tan aldıkları mesajı eksiksiz ve değiştirmeden insanlara ulaştırması." },
      { term: "İsmet", definition: "Peygamberlerin günah işlemekten korunmuş olması." },
      { term: "Üsve-i hasene", definition: "Güzel örnek; Hz. Muhammed’in inananlar için örnek alınacak kişi olması." },
    ],
    formulas: [
      { expr: "571 Doğum (Mekke)", meaning: "Fil Olayı’nın yaşandığı yıl olarak bilinir." },
      { expr: "610 İlk vahiy (Hira Mağarası, 40 yaş)", meaning: "Alak suresinin ilk ayetleriyle peygamberlik başladı." },
      { expr: "615 Habeşistan’a hicret", meaning: "Baskılardan kaçan bir grup Müslüman Habeşistan’a göç etti." },
      { expr: "622 Hicret (Medine)", meaning: "Hicri takvimin başlangıcı; Medine dönemi başladı." },
      { expr: "624 Bedir – 625 Uhud – 627 Hendek", meaning: "Medine döneminin önemli savaşları." },
      { expr: "628 Hudeybiye Antlaşması – 630 Mekke’nin Fethi", meaning: "Antlaşma, Müslümanların taraf olarak tanınmasını sağladı; iki yıl sonra Mekke fethedildi." },
      { expr: "632 Veda Haccı ve vefat", meaning: "Veda Hutbesi’nde temel insan hakları vurgulandı; aynı yıl vefat etti." },
    ],
    logic:
      "Hz. Muhammed’in Mekke dönemi daha çok tevhid, ahiret ve ahlak ilkelerinin öğretildiği, baskıların yaşandığı bir dönemdir. Medine dönemi ise Müslümanların bir topluluk olarak örgütlendiği; mescidin inşa edildiği, muhacir ile ensar arasında kardeşlik kurulduğu ve Medine’deki farklı topluluklarla sözleşme yapıldığı dönemdir.\n\nKur’an’da Hz. Muhammed’in inananlar için güzel bir örnek olduğu bildirilir (Ahzab suresi, 21. ayet). Bu nedenle onun görevi yalnızca vahyi iletmek değil, onu açıklamak ve bizzat yaşayarak göstermektir.",
    examples: [
      {
        level: 'kolay',
        problem: "Hicret, Bedir Savaşı ve Mekke’nin Fethi olaylarını kronolojik olarak sırala.",
        steps: [
          "Hicret 622, Bedir 624, Mekke’nin Fethi 630 yılındadır.",
          "Sıralama küçükten büyüğe yapılır.",
        ],
        answer: "Hicret → Bedir → Mekke’nin Fethi.",
      },
      {
        level: 'orta',
        problem: "Hz. Muhammed’in Medine’de muhacirler ile ensar arasında kardeşlik kurmasının amacı nedir?",
        steps: [
          "Muhacirler Mekke’de mallarını bırakarak gelmişti.",
          "Kardeşlik bağıyla dayanışma ve toplumsal birlik sağlanmak istendi.",
        ],
        answer: "Yardımlaşma ve toplumsal birliği sağlamak.",
      },
    ],
    osymThinking:
      "Sorularda olayların kronolojik sıralanması, Mekke ve Medine dönemlerinin ayırt edilmesi ve peygamber sıfatlarının tanımlarla eşleştirilmesi sık görülür. Bir ayet anlamı verilip Hz. Muhammed’in hangi yönünün vurgulandığı da sorulabilir; “örnek” kelimesi üsve-i hasene, “iletmek” kelimesi tebliğ demektir.",
    commonMistakes: [
      "Bedir Savaşı’nı Mekke dönemine yerleştirmek.",
      "Habeşistan’a hicret ile Medine’ye Hicret’i karıştırmak.",
      "Fetanet ile ismeti karıştırmak.",
    ],
    tips: [
      "Tarih sırası: 571 doğum, 610 vahiy, 622 Hicret, 624 Bedir, 625 Uhud, 627 Hendek, 628 Hudeybiye, 630 Fetih, 632 vefat.",
      "Peygamber sıfatları: sıdk, emanet, fetanet, tebliğ, ismet.",
    ],
    summary: [
      "Hz. Muhammed 571’de Mekke’de doğdu, 610’da ilk vahyi aldı.",
      "622 Hicret ile Medine dönemi başladı.",
      "Peygamberlerin ortak sıfatları: sıdk, emanet, fetanet, tebliğ, ismet.",
      "Görevleri: tebliğ, açıklama ve örnek olma.",
    ],
  },
  {
    topicId: 'tytdin-islam-dusuncesinde-yorumlar',
    intro:
      "İslam dininin temel kaynakları Kur’an ve sünnettir. Ancak bu kaynakların anlaşılmasında, farklı dönem ve bölgelerde yaşayan Müslümanlar ve âlimler farklı yorumlar geliştirmiştir. Bu yorumlar zamanla itikadi (inançla ilgili), siyasi, fıkhi (ibadet ve hukuk) ve tasavvufi (manevi hayat) alanlarda düşünce ekollerine, yani mezheplere ve yollara dönüşmüştür.\n\nTYT’de yorum farklılıklarının sebepleri, mezheplerin kurucuları ve temel özellikleri, tasavvufi yorumlar ile Alevilik-Bektaşilik geleneğinin kavramları sorulur.",
    prerequisites: [
      "İslam’ın temel kaynaklarını bilmek",
      "Sünnetin Kur’an’la ilişkisini bilmek",
    ],
    concepts: [
      { term: "Mezhep", definition: "Sözlükte “gidilen yol”; dinin yorumlanmasında belli usullere dayanan düşünce ekolü." },
      { term: "İçtihat", definition: "Âlimin, dinî bir hükmü kaynaklardan çıkarmak için bütün gücünü harcaması." },
      { term: "Maturidilik", definition: "Ebu Mansur el-Maturidi’nin görüşleri etrafında oluşan, akla önem veren ve Türkler arasında yaygın olan itikadi mezhep." },
      { term: "Eş’arilik", definition: "Ebu’l-Hasan el-Eş’ari’nin görüşleri etrafında oluşan itikadi mezhep." },
      { term: "Musahiplik", definition: "Alevilik-Bektaşilik geleneğinde iki ailenin ömür boyu kardeşlik bağı kurup birbirinden sorumlu olması." },
      { term: "Cem", definition: "Alevilik-Bektaşilik geleneğinde topluca yapılan, semah ve deyişlerin yer aldığı ibadet toplantısı." },
    ],
    formulas: [
      { expr: "Hanefilik – Ebu Hanife", meaning: "Türkiye’de en yaygın fıkhi mezhep." },
      { expr: "Malikilik – İmam Malik; Şafiilik – İmam Şafii; Hanbelilik – Ahmed b. Hanbel", meaning: "Diğer Sünni fıkhi mezhepler." },
      { expr: "Caferilik – Cafer es-Sadık", meaning: "Şia’nın fıkhi yorumu." },
      { expr: "Maturidilik (Semerkant) – Eş’arilik (Basra/Bağdat)", meaning: "Ehl-i sünnetin iki itikadi mezhebi." },
      { expr: "Yesevilik – Ahmed Yesevi; Mevlevilik – Mevlana; Kadirilik – Abdülkadir Geylani", meaning: "Tasavvufi yorumlar ve temsilcileri." },
      { expr: "Nakşibendilik – Bahaeddin Nakşibend; Alevilik-Bektaşilik – Hacı Bektaş Veli", meaning: "Tasavvufi yorumlar ve temsilcileri." },
    ],
    logic:
      "Yorum farklılıkları kaynakların çeşitli anlamlara açık olmasından doğar: Kur’an’daki bazı kelimeler birden fazla anlama gelebilir; hadisler farklı bölgelerdeki âlimlere farklı yollarla ulaşmış ya da farklı değerlendirilmiştir. Ayrıca farklı coğrafya ve kültürlerde karşılaşılan yeni sorunlar da yeni içtihatları gerekli kılmıştır.\n\nBu farklılıklar dinin özünü değil, anlaşılma ve uygulanma biçimini ilgilendirir. Bütün mezhepler Kur’an ve sünneti temel kaynak kabul etmekte birleşir; farklılıklar bir zenginlik olarak görülür.",
    examples: [
      {
        level: 'kolay',
        problem: "Hanefilik, Şafiilik ve Maturidilik mezheplerini alanlarına göre sınıflandır.",
        steps: [
          "Hanefilik ve Şafiilik ibadet ve hukukla ilgilidir; fıkhi mezheptir.",
          "Maturidilik inanç esaslarıyla ilgilidir; itikadi mezheptir.",
        ],
        answer: "Hanefilik ve Şafiilik fıkhi, Maturidilik itikadidir.",
      },
      {
        level: 'orta',
        problem: "Mevlevilik ve Yesevilik tasavvufi yorumlarının temsilcilerini belirt.",
        steps: [
          "Mevlevilik, Mevlana Celaleddin Rumi’nin görüşleri etrafında oluşmuştur.",
          "Yesevilik, Ahmed Yesevi’nin öğretisine dayanır.",
        ],
        answer: "Mevlevilik – Mevlana; Yesevilik – Ahmed Yesevi.",
      },
    ],
    osymThinking:
      "Sorular çoğunlukla mezhep–kurucu ya da tasavvufi yol–temsilci eşleştirmesi ister. Paragraf sorularında ise yorum farklılıklarının sebepleri verilip hangisinin sebep olduğu ya da parçadan hangi sonucun çıkarılamayacağı sorulur. “Çıkarılamaz” sorularında mezheplerin yeni bir din kurduğu gibi aşırı ve yanlış genellemeleri ele.",
    commonMistakes: [
      "Maturidiliği fıkhi mezhep sanmak; itikadi mezheptir.",
      "Mevleviliğin temsilcisini Hacı Bektaş Veli sanmak.",
      "Yorum farklılıklarını dinin temel esaslarının farklı olmasına bağlamak.",
    ],
    tips: [
      "İtikadi = inanç (Maturidi, Eş’ari); fıkhi = ibadet ve hukuk (Hanefi, Maliki, Şafii, Hanbeli, Caferi).",
      "Alevilik-Bektaşilik kavramları: cem, semah, musahiplik, dört kapı kırk makam.",
    ],
    summary: [
      "Yorum farklılıkları; dil, hadislerin ulaşması, kültür ve yeni sorunlardan doğar.",
      "İtikadi, siyasi, fıkhi ve tasavvufi yorumlar vardır.",
      "Bütün mezhepler Kur’an ve sünneti temel kaynak kabul eder.",
    ],
  },
];
