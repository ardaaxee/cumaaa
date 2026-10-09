import type { Subject } from '../../domain/types';

export const subject: Subject = {
  id: 'tyt-turkce',
  exam: 'TYT',
  name: "TYT Türkçe",
  icon: "✎",
  examQuestionCount: 40,
  note: "TYT Türkçe testi ağırlıklı olarak sözcük, cümle ve paragraf düzeyinde anlam sorularından; ayrıca ses, yazım, noktalama ve dil bilgisi sorularından oluşur.",
  units: [
    {
      id: 'tyt-turkce-u1',
      name: "Anlam Bilgisi",
      topics: [
        {
          id: 'tyttr-sozcukte-anlam',
          name: "Sözcükte Anlam",
          grade: 9,
          subtopics: [
            {
              id: 'tyttr-sozcukte-anlam-s1',
              name: "Gerçek, Yan, Mecaz ve Terim Anlam",
              outcomes: [
                { id: 'tyttr-sozcukte-anlam-s1-k1', text: "Sözcüklerin gerçek, yan, mecaz ve terim anlamlarını bağlam içinde ayırt eder." },
                { id: 'tyttr-sozcukte-anlam-s1-k2', text: "Somut ve soyut anlamlı sözcükleri ayırt eder." },
              ],
            },
            {
              id: 'tyttr-sozcukte-anlam-s2',
              name: "Sözcükler Arası Anlam İlişkileri",
              outcomes: [
                { id: 'tyttr-sozcukte-anlam-s2-k1', text: "Eş anlamlı, zıt anlamlı ve eş sesli sözcükleri belirler." },
                { id: 'tyttr-sozcukte-anlam-s2-k2', text: "Genel-özel ve nitel-nicel anlam ilişkilerini açıklar." },
              ],
            },
            {
              id: 'tyttr-sozcukte-anlam-s3',
              name: "Söz Sanatları, Deyimler ve Atasözleri",
              outcomes: [
                { id: 'tyttr-sozcukte-anlam-s3-k1', text: "Deyim ve atasözlerinin anlamını bağlama göre yorumlar." },
                { id: 'tyttr-sozcukte-anlam-s3-k2', text: "Ad aktarması, dolaylama, kişileştirme ve benzetme gibi söz sanatlarını tanır." },
              ],
            },
          ],
        },
        {
          id: 'tyttr-cumlede-anlam',
          name: "Cümlede Anlam",
          grade: 9,
          subtopics: [
            {
              id: 'tyttr-cumlede-anlam-s1',
              name: "Cümle Yorumlama",
              outcomes: [
                { id: 'tyttr-cumlede-anlam-s1-k1', text: "Cümlede asıl anlatılmak isteneni belirler." },
                { id: 'tyttr-cumlede-anlam-s1-k2', text: "Cümleden çıkarılabilecek ve çıkarılamayacak yargıları ayırt eder." },
              ],
            },
            {
              id: 'tyttr-cumlede-anlam-s2',
              name: "Anlam İlişkileri (Neden-Sonuç, Amaç-Sonuç, Koşul-Sonuç)",
              outcomes: [
                { id: 'tyttr-cumlede-anlam-s2-k1', text: "Cümlelerdeki neden-sonuç, amaç-sonuç ve koşul-sonuç ilişkilerini ayırt eder." },
                { id: 'tyttr-cumlede-anlam-s2-k2', text: "Karşılaştırma, benzetme ve örnekleme içeren cümleleri belirler." },
              ],
            },
            {
              id: 'tyttr-cumlede-anlam-s3',
              name: "Nesnel-Öznel Anlatım ve Anlatım Özellikleri",
              outcomes: [
                { id: 'tyttr-cumlede-anlam-s3-k1', text: "Nesnel ve öznel yargıları ayırt eder." },
                { id: 'tyttr-cumlede-anlam-s3-k2', text: "Varsayım, olasılık, öneri, eleştiri, tanım, ön yargı gibi anlatım özelliklerini tanır." },
              ],
            },
            {
              id: 'tyttr-cumlede-anlam-s4',
              name: "Cümle Tamamlama ve Kurma",
              outcomes: [
                { id: 'tyttr-cumlede-anlam-s4-k1', text: "Anlam bütünlüğünü gözeterek cümleyi uygun sözle tamamlar." },
              ],
            },
          ],
        },
        {
          id: 'tyttr-paragraf',
          name: "Paragraf",
          grade: 10,
          subtopics: [
            {
              id: 'tyttr-paragraf-s1',
              name: "Ana Düşünce ve Konu",
              outcomes: [
                { id: 'tyttr-paragraf-s1-k1', text: "Paragrafın konusunu ve ana düşüncesini belirler." },
                { id: 'tyttr-paragraf-s1-k2', text: "Paragrafın başlığını ve amacını yorumlar." },
              ],
            },
            {
              id: 'tyttr-paragraf-s2',
              name: "Yardımcı Düşünceler",
              outcomes: [
                { id: 'tyttr-paragraf-s2-k1', text: "Paragrafta değinilen ve değinilmeyen yardımcı düşünceleri belirler." },
                { id: 'tyttr-paragraf-s2-k2', text: "Paragraftan çıkarılabilecek yargıları metne dayanarak değerlendirir." },
              ],
            },
            {
              id: 'tyttr-paragraf-s3',
              name: "Paragrafın Yapısı",
              outcomes: [
                { id: 'tyttr-paragraf-s3-k1', text: "Paragrafın giriş, gelişme ve sonuç bölümlerini belirler." },
                { id: 'tyttr-paragraf-s3-k2', text: "Akışı bozan cümleyi bulur, cümleleri anlamlı bir sıraya koyar ve paragrafı ikiye böler." },
                { id: 'tyttr-paragraf-s3-k3', text: "Paragrafı anlam bütünlüğüne uygun bir cümleyle tamamlar." },
              ],
            },
            {
              id: 'tyttr-paragraf-s4',
              name: "Anlatım Biçimleri ve Düşünceyi Geliştirme Yolları",
              outcomes: [
                { id: 'tyttr-paragraf-s4-k1', text: "Açıklayıcı, tartışmacı, öyküleyici ve betimleyici anlatım biçimlerini ayırt eder." },
                { id: 'tyttr-paragraf-s4-k2', text: "Tanımlama, örnekleme, karşılaştırma, tanık gösterme, sayısal verilerden yararlanma ve benzetme yollarını belirler." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-turkce-u2',
      name: "Ses ve Yazım",
      topics: [
        {
          id: 'tyttr-ses-bilgisi',
          name: "Ses Bilgisi",
          grade: 9,
          subtopics: [
            {
              id: 'tyttr-ses-bilgisi-s1',
              name: "Ünlüler ve Ünlü Uyumları",
              outcomes: [
                { id: 'tyttr-ses-bilgisi-s1-k1', text: "Ünlüleri özelliklerine göre sınıflandırır." },
                { id: 'tyttr-ses-bilgisi-s1-k2', text: "Büyük ve küçük ünlü uyumuna uyan ve uymayan sözcükleri belirler." },
              ],
            },
            {
              id: 'tyttr-ses-bilgisi-s2',
              name: "Ünlülerle İlgili Ses Olayları",
              outcomes: [
                { id: 'tyttr-ses-bilgisi-s2-k1', text: "Ünlü düşmesi, ünlü daralması ve ünlü türemesini örnekler üzerinde açıklar." },
              ],
            },
            {
              id: 'tyttr-ses-bilgisi-s3',
              name: "Ünsüzlerle İlgili Ses Olayları",
              outcomes: [
                { id: 'tyttr-ses-bilgisi-s3-k1', text: "Ünsüz benzeşmesi (sertleşme) ve ünsüz yumuşamasını ayırt eder." },
                { id: 'tyttr-ses-bilgisi-s3-k2', text: "Ünsüz düşmesi, ünsüz türemesi ve kaynaştırma ünsüzlerini belirler." },
              ],
            },
          ],
        },
        {
          id: 'tyttr-yazim-kurallari',
          name: "Yazım Kuralları",
          grade: 9,
          subtopics: [
            {
              id: 'tyttr-yazim-kurallari-s1',
              name: "Büyük Harflerin Kullanımı",
              outcomes: [
                { id: 'tyttr-yazim-kurallari-s1-k1', text: "Büyük harflerin kullanıldığı yerleri Yazım Kılavuzu’na göre uygular." },
              ],
            },
            {
              id: 'tyttr-yazim-kurallari-s2',
              name: "Birleşik Sözcüklerin ve Sayıların Yazımı",
              outcomes: [
                { id: 'tyttr-yazim-kurallari-s2-k1', text: "Birleşik sözcüklerin bitişik ya da ayrı yazımını kurallara göre belirler." },
                { id: 'tyttr-yazim-kurallari-s2-k2', text: "Sayıların, tarihlerin ve kısaltmaların yazımını kurallara göre uygular." },
              ],
            },
            {
              id: 'tyttr-yazim-kurallari-s3',
              name: "Bağlaç, Ek ve Kesme İşaretiyle İlgili Yazım",
              outcomes: [
                { id: 'tyttr-yazim-kurallari-s3-k1', text: "\"de\", \"ki\" ve \"mi\" gibi sözcük ve eklerin yazımını ayırt eder." },
                { id: 'tyttr-yazim-kurallari-s3-k2', text: "Özel adlara getirilen eklerin kesme işaretiyle ayrılmasını kurallara göre uygular." },
              ],
            },
          ],
        },
        {
          id: 'tyttr-noktalama',
          name: "Noktalama İşaretleri",
          grade: 9,
          subtopics: [
            {
              id: 'tyttr-noktalama-s1',
              name: "Nokta, Virgül ve Noktalı Virgül",
              outcomes: [
                { id: 'tyttr-noktalama-s1-k1', text: "Nokta, virgül ve noktalı virgülün kullanıldığı yerleri açıklar." },
              ],
            },
            {
              id: 'tyttr-noktalama-s2',
              name: "İki Nokta, Üç Nokta, Soru ve Ünlem İşareti",
              outcomes: [
                { id: 'tyttr-noktalama-s2-k1', text: "İki nokta, üç nokta, soru ve ünlem işaretinin işlevlerini örnekler üzerinde gösterir." },
              ],
            },
            {
              id: 'tyttr-noktalama-s3',
              name: "Tırnak, Kesme, Kısa Çizgi, Yay Ayraç",
              outcomes: [
                { id: 'tyttr-noktalama-s3-k1', text: "Tırnak işareti, kesme işareti, kısa çizgi ve ayraçların kullanım yerlerini belirler." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-turkce-u3',
      name: "Dil Bilgisi",
      topics: [
        {
          id: 'tyttr-sozcuk-yapisi',
          name: "Sözcükte Yapı (Kök ve Ekler)",
          grade: 9,
          subtopics: [
            {
              id: 'tyttr-sozcuk-yapisi-s1',
              name: "Kök ve Gövde",
              outcomes: [
                { id: 'tyttr-sozcuk-yapisi-s1-k1', text: "Sözcüklerin kökünü ve gövdesini belirler; isim ve fiil köklerini ayırt eder." },
              ],
            },
            {
              id: 'tyttr-sozcuk-yapisi-s2',
              name: "Yapım ve Çekim Ekleri",
              outcomes: [
                { id: 'tyttr-sozcuk-yapisi-s2-k1', text: "Yapım eklerini ve çekim eklerini işlevlerine göre ayırt eder." },
                { id: 'tyttr-sozcuk-yapisi-s2-k2', text: "İsimden isim, isimden fiil, fiilden isim ve fiilden fiil yapım eklerini örneklerle açıklar." },
              ],
            },
            {
              id: 'tyttr-sozcuk-yapisi-s3',
              name: "Yapı Bakımından Sözcükler",
              outcomes: [
                { id: 'tyttr-sozcuk-yapisi-s3-k1', text: "Basit, türemiş ve birleşik sözcükleri ayırt eder." },
              ],
            },
          ],
        },
        {
          id: 'tyttr-sozcuk-turleri',
          name: "Sözcük Türleri",
          grade: 10,
          subtopics: [
            {
              id: 'tyttr-sozcuk-turleri-s1',
              name: "İsim ve Sıfat",
              outcomes: [
                { id: 'tyttr-sozcuk-turleri-s1-k1', text: "İsimleri varlıklara verilişine, sayılarına ve niteliklerine göre sınıflandırır." },
                { id: 'tyttr-sozcuk-turleri-s1-k2', text: "Niteleme ve belirtme sıfatlarını ayırt eder; sıfatlaşmayı ve adlaşmayı açıklar." },
              ],
            },
            {
              id: 'tyttr-sozcuk-turleri-s2',
              name: "Zamir",
              outcomes: [
                { id: 'tyttr-sozcuk-turleri-s2-k1', text: "Kişi, dönüşlülük, işaret, belgisiz ve soru zamirlerini ayırt eder." },
              ],
            },
            {
              id: 'tyttr-sozcuk-turleri-s3',
              name: "Zarf",
              outcomes: [
                { id: 'tyttr-sozcuk-turleri-s3-k1', text: "Zaman, yer-yön, durum, miktar ve soru zarflarını belirler." },
              ],
            },
            {
              id: 'tyttr-sozcuk-turleri-s4',
              name: "Edat, Bağlaç ve Ünlem",
              outcomes: [
                { id: 'tyttr-sozcuk-turleri-s4-k1', text: "Edat, bağlaç ve ünlemlerin cümledeki işlevlerini açıklar." },
                { id: 'tyttr-sozcuk-turleri-s4-k2', text: "Aynı sözcüğün cümledeki görevine göre farklı türde kullanılabileceğini fark eder." },
              ],
            },
          ],
        },
        {
          id: 'tyttr-fiiller',
          name: "Fiiller",
          grade: 10,
          subtopics: [
            {
              id: 'tyttr-fiiller-s1',
              name: "Fiilde Kip ve Kişi",
              outcomes: [
                { id: 'tyttr-fiiller-s1-k1', text: "Haber ve dilek kiplerini ayırt eder; kip kaymasını açıklar." },
                { id: 'tyttr-fiiller-s1-k2', text: "Basit ve birleşik zamanlı fiilleri belirler." },
              ],
            },
            {
              id: 'tyttr-fiiller-s2',
              name: "Ek Fiil",
              outcomes: [
                { id: 'tyttr-fiiller-s2-k1', text: "Ek fiilin isim soylu sözcükleri yüklem yapma ve birleşik zaman oluşturma işlevlerini açıklar." },
              ],
            },
            {
              id: 'tyttr-fiiller-s3',
              name: "Fiilimsiler",
              outcomes: [
                { id: 'tyttr-fiiller-s3-k1', text: "İsim-fiil, sıfat-fiil ve zarf-fiilleri ayırt eder." },
              ],
            },
            {
              id: 'tyttr-fiiller-s4',
              name: "Fiil Çatısı",
              outcomes: [
                { id: 'tyttr-fiiller-s4-k1', text: "Fiilleri nesne alıp almamalarına göre (geçişli-geçişsiz) sınıflandırır." },
                { id: 'tyttr-fiiller-s4-k2', text: "Fiilleri öznelerine göre (etken, edilgen, dönüşlü, işteş) sınıflandırır." },
              ],
            },
          ],
        },
        {
          id: 'tyttr-cumlenin-ogeleri',
          name: "Cümlenin Ögeleri",
          grade: 10,
          subtopics: [
            {
              id: 'tyttr-cumlenin-ogeleri-s1',
              name: "Yüklem ve Özne",
              outcomes: [
                { id: 'tyttr-cumlenin-ogeleri-s1-k1', text: "Cümlede yüklemi ve özneyi belirler; gizli özneyi fark eder." },
              ],
            },
            {
              id: 'tyttr-cumlenin-ogeleri-s2',
              name: "Nesne ve Tümleçler",
              outcomes: [
                { id: 'tyttr-cumlenin-ogeleri-s2-k1', text: "Belirtili ve belirtisiz nesneyi ayırt eder." },
                { id: 'tyttr-cumlenin-ogeleri-s2-k2', text: "Dolaylı tümleç ve zarf tümlecini belirler." },
              ],
            },
            {
              id: 'tyttr-cumlenin-ogeleri-s3',
              name: "Öge Dizilişi ve Cümle Dışı Unsurlar",
              outcomes: [
                { id: 'tyttr-cumlenin-ogeleri-s3-k1', text: "Cümlenin ögelerini sırasıyla belirler; cümle dışı unsurları ayırt eder." },
              ],
            },
          ],
        },
        {
          id: 'tyttr-cumle-turleri',
          name: "Cümle Türleri",
          grade: 10,
          subtopics: [
            {
              id: 'tyttr-cumle-turleri-s1',
              name: "Yüklemin Türüne ve Yerine Göre Cümleler",
              outcomes: [
                { id: 'tyttr-cumle-turleri-s1-k1', text: "İsim ve fiil cümlelerini ayırt eder." },
                { id: 'tyttr-cumle-turleri-s1-k2', text: "Kurallı ve devrik cümleleri belirler." },
              ],
            },
            {
              id: 'tyttr-cumle-turleri-s2',
              name: "Anlamına Göre Cümleler",
              outcomes: [
                { id: 'tyttr-cumle-turleri-s2-k1', text: "Olumlu, olumsuz, soru ve ünlem cümlelerini ayırt eder." },
              ],
            },
            {
              id: 'tyttr-cumle-turleri-s3',
              name: "Yapısına Göre Cümleler",
              outcomes: [
                { id: 'tyttr-cumle-turleri-s3-k1', text: "Basit, birleşik, sıralı ve bağlı cümleleri ayırt eder." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-turkce-u4',
      name: "Anlatım",
      topics: [
        {
          id: 'tyttr-anlatim-bozuklugu',
          name: "Anlatım Bozuklukları",
          grade: 11,
          subtopics: [
            {
              id: 'tyttr-anlatim-bozuklugu-s1',
              name: "Anlamsal Bozukluklar",
              outcomes: [
                { id: 'tyttr-anlatim-bozuklugu-s1-k1', text: "Gereksiz sözcük kullanımından kaynaklanan anlatım bozukluklarını belirler." },
                { id: 'tyttr-anlatim-bozuklugu-s1-k2', text: "Sözcüğün yanlış anlamda kullanılmasından, mantık ve sıralama hatalarından kaynaklanan bozuklukları belirler." },
              ],
            },
            {
              id: 'tyttr-anlatim-bozuklugu-s2',
              name: "Yapısal (Dil Bilgisel) Bozukluklar",
              outcomes: [
                { id: 'tyttr-anlatim-bozuklugu-s2-k1', text: "Özne-yüklem uyumsuzluğunu ve öge eksikliğini belirler." },
                { id: 'tyttr-anlatim-bozuklugu-s2-k2', text: "Ek eksikliği, ek yanlışlığı ve çatı uyuşmazlığından kaynaklanan bozuklukları düzeltir." },
              ],
            },
          ],
        },
      ],
    },
  ],
};
