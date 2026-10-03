import type { Subject } from '../../domain/types';

export const subject: Subject = {
  id: 'tyt-kimya',
  exam: 'TYT',
  name: "Kimya",
  icon: "⚗",
  examQuestionCount: 7,
  note: "TYT Fen Bilimleri testinin kimya bölümü; MEB 2018 Kimya 9 ve 10. sınıf programlarını kapsar.",
  units: [
    {
      id: 'tyt-kimya-u1',
      name: "Kimya Bilimi",
      topics: [
        {
          id: 'tytkim-kimya-bilimi',
          name: "Kimya Bilimi",
          grade: 9,
          subtopics: [
            {
              id: 'tytkim-kimya-bilimi-s1',
              name: "Simyadan Kimyaya",
              outcomes: [
                { id: 'tytkim-kimya-bilimi-s1-k1', text: "Simyadan kimyaya geçiş sürecini ve bu süreçte katkı sağlayan bilim insanlarını açıklar." },
                { id: 'tytkim-kimya-bilimi-s1-k2', text: "Kimyanın bir bilim olarak deneye ve ölçüme dayandığını açıklar." },
              ],
            },
            {
              id: 'tytkim-kimya-bilimi-s2',
              name: "Kimya Disiplinleri ve Kimyacıların Çalışma Alanları",
              outcomes: [
                { id: 'tytkim-kimya-bilimi-s2-k1', text: "Kimyanın alt disiplinlerini ve kimyacıların çalışma alanlarını örneklerle açıklar." },
              ],
            },
            {
              id: 'tytkim-kimya-bilimi-s3',
              name: "Kimyanın Sembolik Dili",
              outcomes: [
                { id: 'tytkim-kimya-bilimi-s3-k1', text: "Yaygın elementlerin sembollerini ve bazı bileşiklerin formüllerini adlarıyla eşleştirir." },
                { id: 'tytkim-kimya-bilimi-s3-k2', text: "Element, bileşik, atom ve molekül kavramlarını sembolik gösterimle ilişkilendirir." },
              ],
            },
            {
              id: 'tytkim-kimya-bilimi-s4',
              name: "Kimya Uygulamalarında İş Sağlığı ve Güvenliği",
              outcomes: [
                { id: 'tytkim-kimya-bilimi-s4-k1', text: "Kimya laboratuvarında kullanılan güvenlik uyarı işaretlerinin anlamlarını açıklar." },
                { id: 'tytkim-kimya-bilimi-s4-k2', text: "Bazı zararlı maddelerin (Hg, Pb, Cd, As vb.) insan sağlığı ve çevre üzerindeki etkilerini açıklar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-kimya-u2',
      name: "Atom ve Periyodik Sistem",
      topics: [
        {
          id: 'tytkim-atom-periyodik',
          name: "Atom ve Periyodik Sistem",
          grade: 9,
          subtopics: [
            {
              id: 'tytkim-atom-periyodik-s1',
              name: "Atom Modelleri",
              outcomes: [
                { id: 'tytkim-atom-periyodik-s1-k1', text: "Dalton, Thomson, Rutherford ve Bohr atom modellerini karşılaştırarak açıklar." },
                { id: 'tytkim-atom-periyodik-s1-k2', text: "Bohr modelinin açıklayabildiği ve açıklayamadığı olguları yorumlar." },
              ],
            },
            {
              id: 'tytkim-atom-periyodik-s2',
              name: "Atomun Yapısı",
              outcomes: [
                { id: 'tytkim-atom-periyodik-s2-k1', text: "Atomu oluşturan temel taneciklerin özelliklerini açıklar." },
                { id: 'tytkim-atom-periyodik-s2-k2', text: "Atom numarası, kütle numarası, izotop, izoton, izobar ve izoelektronik kavramlarını kullanarak tanecik sayılarını hesaplar." },
              ],
            },
            {
              id: 'tytkim-atom-periyodik-s3',
              name: "Periyodik Sistem",
              outcomes: [
                { id: 'tytkim-atom-periyodik-s3-k1', text: "Elementlerin katman elektron dağılımından yararlanarak periyodik sistemdeki yerini belirler." },
                { id: 'tytkim-atom-periyodik-s3-k2', text: "Elementleri metal, ametal, yarı metal ve soy gaz olarak sınıflandırır." },
              ],
            },
            {
              id: 'tytkim-atom-periyodik-s4',
              name: "Periyodik Özellikler",
              outcomes: [
                { id: 'tytkim-atom-periyodik-s4-k1', text: "Atom yarıçapı, iyonlaşma enerjisi, elektron ilgisi ve elektronegatifliğin periyodik sistemdeki değişimini açıklar." },
                { id: 'tytkim-atom-periyodik-s4-k2', text: "Ardışık iyonlaşma enerjisi verilerinden elementin grubunu yorumlar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-kimya-u3',
      name: "Kimyasal Türler Arası Etkileşimler",
      topics: [
        {
          id: 'tytkim-etkilesimler',
          name: "Kimyasal Türler Arası Etkileşimler",
          grade: 9,
          subtopics: [
            {
              id: 'tytkim-etkilesimler-s1',
              name: "Güçlü ve Zayıf Etkileşimler",
              outcomes: [
                { id: 'tytkim-etkilesimler-s1-k1', text: "Kimyasal türleri (atom, molekül, iyon) ayırt eder ve etkileşimleri bağlanma enerjisine göre güçlü ve zayıf olarak sınıflandırır." },
              ],
            },
            {
              id: 'tytkim-etkilesimler-s2',
              name: "İyonik Bağ",
              outcomes: [
                { id: 'tytkim-etkilesimler-s2-k1', text: "İyonik bağın oluşumunu elektron alışverişiyle açıklar ve Lewis gösterimiyle ifade eder." },
                { id: 'tytkim-etkilesimler-s2-k2', text: "İyonik bileşiklerin formüllerini yazar ve adlandırır." },
              ],
            },
            {
              id: 'tytkim-etkilesimler-s3',
              name: "Kovalent Bağ",
              outcomes: [
                { id: 'tytkim-etkilesimler-s3-k1', text: "Kovalent bağın oluşumunu elektron ortaklaşmasıyla açıklar; polar ve apolar bağı ayırt eder." },
                { id: 'tytkim-etkilesimler-s3-k2', text: "Molekül polarlığını bağ polarlığı ve molekül geometrisiyle ilişkilendirir; kovalent bileşikleri adlandırır." },
              ],
            },
            {
              id: 'tytkim-etkilesimler-s4',
              name: "Metalik Bağ",
              outcomes: [
                { id: 'tytkim-etkilesimler-s4-k1', text: "Metalik bağın oluşumunu elektron denizi modeliyle açıklar ve metallerin özellikleriyle ilişkilendirir." },
              ],
            },
            {
              id: 'tytkim-etkilesimler-s5',
              name: "Zayıf Etkileşimler",
              outcomes: [
                { id: 'tytkim-etkilesimler-s5-k1', text: "Van der Waals etkileşimlerini (dipol-dipol, iyon-dipol, London) ve hidrojen bağını açıklar." },
                { id: 'tytkim-etkilesimler-s5-k2', text: "Zayıf etkileşimlerin kaynama noktası ve çözünme üzerindeki etkisini yorumlar." },
              ],
            },
            {
              id: 'tytkim-etkilesimler-s6',
              name: "Fiziksel ve Kimyasal Değişimler",
              outcomes: [
                { id: 'tytkim-etkilesimler-s6-k1', text: "Fiziksel ve kimyasal değişimleri kopan ve oluşan bağlar ile enerji değişimi üzerinden ayırt eder." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-kimya-u4',
      name: "Maddenin Halleri",
      topics: [
        {
          id: 'tytkim-maddenin-halleri',
          name: "Maddenin Halleri",
          grade: 9,
          subtopics: [
            {
              id: 'tytkim-maddenin-halleri-s1',
              name: "Maddenin Fiziksel Halleri",
              outcomes: [
                { id: 'tytkim-maddenin-halleri-s1-k1', text: "Maddenin katı, sıvı, gaz ve plazma hallerini tanecikler arası etkileşim ve düzen açısından karşılaştırır." },
              ],
            },
            {
              id: 'tytkim-maddenin-halleri-s2',
              name: "Katılar",
              outcomes: [
                { id: 'tytkim-maddenin-halleri-s2-k1', text: "Katıları kristal ve amorf olarak sınıflandırır; kristal katı türlerine örnek verir." },
              ],
            },
            {
              id: 'tytkim-maddenin-halleri-s3',
              name: "Sıvılar",
              outcomes: [
                { id: 'tytkim-maddenin-halleri-s3-k1', text: "Buharlaşma, buhar basıncı ve kaynama kavramlarını açıklar; kaynama noktasının dış basınçla ilişkisini yorumlar." },
                { id: 'tytkim-maddenin-halleri-s3-k2', text: "Viskozitenin sıcaklık ve moleküller arası etkileşimle ilişkisini açıklar." },
              ],
            },
            {
              id: 'tytkim-maddenin-halleri-s4',
              name: "Gazlar",
              outcomes: [
                { id: 'tytkim-maddenin-halleri-s4-k1', text: "Gazların genel özelliklerini ve basınç, hacim, sıcaklık, miktar arasındaki ilişkileri nitel olarak açıklar." },
                { id: 'tytkim-maddenin-halleri-s4-k2', text: "Gaz ve buhar kavramlarını kritik sıcaklık üzerinden ayırt eder." },
              ],
            },
            {
              id: 'tytkim-maddenin-halleri-s5',
              name: "Hal Değişimleri",
              outcomes: [
                { id: 'tytkim-maddenin-halleri-s5-k1', text: "Isıtma-soğutma eğrilerini yorumlar; hal değişimlerinde sıcaklığın sabit kalmasını açıklar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-kimya-u5',
      name: "Doğa ve Kimya",
      topics: [
        {
          id: 'tytkim-doga-ve-kimya',
          name: "Doğa ve Kimya",
          grade: 9,
          subtopics: [
            {
              id: 'tytkim-doga-ve-kimya-s1',
              name: "Su ve Hayat",
              outcomes: [
                { id: 'tytkim-doga-ve-kimya-s1-k1', text: "Suyun canlılar için önemini ve su kaynaklarının korunmasını açıklar." },
                { id: 'tytkim-doga-ve-kimya-s1-k2', text: "Suyun sertliğini, sert suyun etkilerini ve yumuşatma yöntemlerini açıklar." },
              ],
            },
            {
              id: 'tytkim-doga-ve-kimya-s2',
              name: "Çevre Kimyası",
              outcomes: [
                { id: 'tytkim-doga-ve-kimya-s2-k1', text: "Hava, su ve toprak kirliliğine yol açan kimyasal kirleticileri ve etkilerini açıklar." },
                { id: 'tytkim-doga-ve-kimya-s2-k2', text: "Asit yağmurları, küresel ısınma ve ozon tabakasının incelmesinin kimyasal nedenlerini yorumlar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-kimya-u6',
      name: "Kimyanın Temel Kanunları ve Kimyasal Hesaplamalar",
      topics: [
        {
          id: 'tytkim-temel-kanunlar',
          name: "Kimyanın Temel Kanunları",
          grade: 10,
          subtopics: [
            {
              id: 'tytkim-temel-kanunlar-s1',
              name: "Kütlenin Korunumu Kanunu",
              outcomes: [
                { id: 'tytkim-temel-kanunlar-s1-k1', text: "Kimyasal tepkimelerde toplam kütlenin korunduğunu açıklar ve hesaplamalarda kullanır." },
              ],
            },
            {
              id: 'tytkim-temel-kanunlar-s2',
              name: "Sabit Oranlar Kanunu",
              outcomes: [
                { id: 'tytkim-temel-kanunlar-s2-k1', text: "Bir bileşikteki elementlerin kütlece birleşme oranının sabit olduğunu açıklar." },
                { id: 'tytkim-temel-kanunlar-s2-k2', text: "Birleşme oranından artan madde ve oluşan bileşik kütlesini hesaplar." },
              ],
            },
            {
              id: 'tytkim-temel-kanunlar-s3',
              name: "Katlı Oranlar Kanunu",
              outcomes: [
                { id: 'tytkim-temel-kanunlar-s3-k1', text: "Aynı elementlerden oluşan farklı bileşiklerde katlı oranı hesaplar ve yorumlar." },
              ],
            },
            {
              id: 'tytkim-temel-kanunlar-s4',
              name: "Birleşen Hacim Oranları",
              outcomes: [
                { id: 'tytkim-temel-kanunlar-s4-k1', text: "Aynı koşullardaki gazların tepkimeye girerken belirli hacim oranlarında birleştiğini açıklar." },
              ],
            },
          ],
        },
        {
          id: 'tytkim-mol-kavrami',
          name: "Mol Kavramı",
          grade: 10,
          subtopics: [
            {
              id: 'tytkim-mol-kavrami-s1',
              name: "Mol ve Avogadro Sayısı",
              outcomes: [
                { id: 'tytkim-mol-kavrami-s1-k1', text: "Mol kavramını Avogadro sayısı ile ilişkilendirerek tanecik sayısını hesaplar." },
              ],
            },
            {
              id: 'tytkim-mol-kavrami-s2',
              name: "Mol Kütlesi",
              outcomes: [
                { id: 'tytkim-mol-kavrami-s2-k1', text: "Atom kütlesi, bağıl atom kütlesi ve mol kütlesi kavramlarını açıklar; bileşiklerin mol kütlesini hesaplar." },
              ],
            },
            {
              id: 'tytkim-mol-kavrami-s3',
              name: "Mol–Kütle–Hacim–Tanecik İlişkisi",
              outcomes: [
                { id: 'tytkim-mol-kavrami-s3-k1', text: "Mol sayısı, kütle, normal koşullardaki gaz hacmi ve tanecik sayısı arasında dönüşüm yapar." },
                { id: 'tytkim-mol-kavrami-s3-k2', text: "Bileşikteki atom mollerini ve kütlece yüzde bileşimi hesaplar." },
              ],
            },
          ],
        },
        {
          id: 'tytkim-kimyasal-tepkimeler',
          name: "Kimyasal Tepkimeler ve Hesaplamalar",
          grade: 10,
          subtopics: [
            {
              id: 'tytkim-kimyasal-tepkimeler-s1',
              name: "Tepkime Denklemleri ve Denkleştirme",
              outcomes: [
                { id: 'tytkim-kimyasal-tepkimeler-s1-k1', text: "Kimyasal tepkime denklemlerini atom korunumuna göre denkleştirir." },
              ],
            },
            {
              id: 'tytkim-kimyasal-tepkimeler-s2',
              name: "Tepkime Türleri",
              outcomes: [
                { id: 'tytkim-kimyasal-tepkimeler-s2-k1', text: "Yanma, sentez, analiz, asit-baz (nötralleşme), çözünme-çökelme tepkimelerini örneklerle ayırt eder." },
              ],
            },
            {
              id: 'tytkim-kimyasal-tepkimeler-s3',
              name: "Tepkimelerde Hesaplamalar",
              outcomes: [
                { id: 'tytkim-kimyasal-tepkimeler-s3-k1', text: "Denkleştirilmiş tepkime denklemini kullanarak mol, kütle ve hacim hesaplamaları yapar." },
              ],
            },
            {
              id: 'tytkim-kimyasal-tepkimeler-s4',
              name: "Sınırlayıcı Bileşen ve Verim",
              outcomes: [
                { id: 'tytkim-kimyasal-tepkimeler-s4-k1', text: "Sınırlayıcı bileşeni belirleyerek oluşan ürün ve artan madde miktarını hesaplar." },
                { id: 'tytkim-kimyasal-tepkimeler-s4-k2', text: "Tepkime verimini hesaplar ve yorumlar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-kimya-u7',
      name: "Karışımlar",
      topics: [
        {
          id: 'tytkim-karisimlar',
          name: "Karışımlar",
          grade: 10,
          subtopics: [
            {
              id: 'tytkim-karisimlar-s1',
              name: "Homojen ve Heterojen Karışımlar",
              outcomes: [
                { id: 'tytkim-karisimlar-s1-k1', text: "Karışımları homojen ve heterojen olarak sınıflandırır; çözelti, süspansiyon, emülsiyon, aerosol ve kolloidleri ayırt eder." },
                { id: 'tytkim-karisimlar-s1-k2', text: "Çözünme sürecini tanecikler arası etkileşimlerle açıklar." },
              ],
            },
            {
              id: 'tytkim-karisimlar-s2',
              name: "Derişim Birimleri",
              outcomes: [
                { id: 'tytkim-karisimlar-s2-k1', text: "Kütlece yüzde, hacimce yüzde ve ppm derişimlerini hesaplar." },
                { id: 'tytkim-karisimlar-s2-k2', text: "Çözeltilerin karıştırılması, seyreltilmesi ve derişikleştirilmesinde derişim hesabı yapar." },
              ],
            },
            {
              id: 'tytkim-karisimlar-s3',
              name: "Koligatif Özellikler",
              outcomes: [
                { id: 'tytkim-karisimlar-s3-k1', text: "Çözeltilerin donma noktası alçalması ve kaynama noktası yükselmesini tanecik derişimiyle ilişkilendirir." },
              ],
            },
            {
              id: 'tytkim-karisimlar-s4',
              name: "Ayırma ve Saflaştırma Teknikleri",
              outcomes: [
                { id: 'tytkim-karisimlar-s4-k1', text: "Karışımları ayırma yöntemlerini (süzme, ayırma hunisi, damıtma, kristallendirme, özütleme vb.) bileşenlerin ayırt edici özelliklerine göre seçer." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-kimya-u8',
      name: "Asitler, Bazlar ve Tuzlar",
      topics: [
        {
          id: 'tytkim-asit-baz-tuz',
          name: "Asitler, Bazlar ve Tuzlar",
          grade: 10,
          subtopics: [
            {
              id: 'tytkim-asit-baz-tuz-s1',
              name: "Asitler ve Bazlar",
              outcomes: [
                { id: 'tytkim-asit-baz-tuz-s1-k1', text: "Asit ve bazları Arrhenius tanımıyla açıklar ve özelliklerini karşılaştırır." },
                { id: 'tytkim-asit-baz-tuz-s1-k2', text: "pH kavramını açıklar ve çözeltileri asidik, bazik, nötr olarak sınıflandırır." },
              ],
            },
            {
              id: 'tytkim-asit-baz-tuz-s2',
              name: "Asit ve Bazların Tepkimeleri",
              outcomes: [
                { id: 'tytkim-asit-baz-tuz-s2-k1', text: "Nötralleşme tepkimelerini ve tuz oluşumunu açıklar; mol hesabı yapar." },
                { id: 'tytkim-asit-baz-tuz-s2-k2', text: "Asit ve bazların metallerle tepkimelerini, amfoter metalleri ve soy metalleri örneklerle açıklar." },
              ],
            },
            {
              id: 'tytkim-asit-baz-tuz-s3',
              name: "Hayatımızdaki Asitler, Bazlar ve Tuzlar",
              outcomes: [
                { id: 'tytkim-asit-baz-tuz-s3-k1', text: "Günlük hayatta karşılaşılan asit, baz ve tuzların kullanım alanlarını ve güvenli kullanımını açıklar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-kimya-u9',
      name: "Kimya Her Yerde",
      topics: [
        {
          id: 'tytkim-kimya-her-yerde',
          name: "Kimya Her Yerde",
          grade: 10,
          subtopics: [
            {
              id: 'tytkim-kimya-her-yerde-s1',
              name: "Yaygın Günlük Hayat Kimyasalları",
              outcomes: [
                { id: 'tytkim-kimya-her-yerde-s1-k1', text: "Sabun ve deterjanların temizleme mekanizmasını ve farklarını açıklar." },
                { id: 'tytkim-kimya-her-yerde-s1-k2', text: "Çamaşır suyu, tuz ruhu gibi temizlik maddelerinin güvenli kullanımını açıklar." },
              ],
            },
            {
              id: 'tytkim-kimya-her-yerde-s2',
              name: "Polimerler",
              outcomes: [
                { id: 'tytkim-kimya-her-yerde-s2-k1', text: "Polimer, monomer ve polimerleşme kavramlarını açıklar; yaygın polimerlere örnek verir." },
                { id: 'tytkim-kimya-her-yerde-s2-k2', text: "Plastiklerin geri dönüşümünün önemini açıklar." },
              ],
            },
            {
              id: 'tytkim-kimya-her-yerde-s3',
              name: "Kozmetik Malzemeler ve İlaçlar",
              outcomes: [
                { id: 'tytkim-kimya-her-yerde-s3-k1', text: "Kozmetik ürünlerin ve ilaçların bilinçli kullanımını ve olası zararlarını açıklar." },
              ],
            },
            {
              id: 'tytkim-kimya-her-yerde-s4',
              name: "Gıdalar",
              outcomes: [
                { id: 'tytkim-kimya-her-yerde-s4-k1', text: "Gıdaların bozulma nedenlerini ve koruma yöntemlerini kimyasal açıdan açıklar." },
              ],
            },
          ],
        },
      ],
    },
  ],
};
