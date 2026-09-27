import type { Subject } from '../../domain/types';

/**
 * AYT Kimya müfredatı — MEB 2018 Kimya Dersi Öğretim Programı (11. ve 12. sınıf)
 * ünite mantığıyla düzenlenmiştir. Kimlikler içerik rehberindeki kurala göredir;
 * resmî MEB kazanım kodu kullanılmaz.
 */
export const subject: Subject = {
  id: 'ayt-kimya',
  exam: 'AYT',
  name: 'Kimya',
  icon: '⚗',
  examQuestionCount: 13,
  note: 'MEB 2018 Kimya 11–12 programı mantığıyla düzenlenmiştir. 9–10. sınıf konuları (atom, periyodik sistem, mol, tepkimeler, karışımlar, asit-baz-tuz) ön bilgi olarak varsayılır.',
  units: [
    {
      id: 'ayt-kimya-u1',
      name: 'Modern Atom Teorisi',
      topics: [
        {
          id: 'aytkim-modern-atom',
          name: 'Modern Atom Teorisi',
          grade: 11,
          subtopics: [
            {
              id: 'aytkim-modern-atom-s1',
              name: 'Atomun Kuantum Modeli',
              outcomes: [
                { id: 'aytkim-modern-atom-s1-k1', text: 'Bohr atom modelinin sınırlılıklarını ve elektron bulutu kavramını açıklar.' },
                { id: 'aytkim-modern-atom-s1-k2', text: 'Orbital kavramını yörünge kavramından ayırt ederek açıklar.' },
              ],
            },
            {
              id: 'aytkim-modern-atom-s2',
              name: 'Kuantum Sayıları ve Orbitaller',
              outcomes: [
                { id: 'aytkim-modern-atom-s2-k1', text: 'Baş, açısal momentum, manyetik ve spin kuantum sayılarının anlamını açıklar.' },
                { id: 'aytkim-modern-atom-s2-k2', text: 's, p, d orbitallerinin şekil, sayı ve elektron kapasitelerini karşılaştırır.' },
              ],
            },
            {
              id: 'aytkim-modern-atom-s3',
              name: 'Elektron Dizilimi',
              outcomes: [
                { id: 'aytkim-modern-atom-s3-k1', text: 'Aufbau ilkesi, Pauli ilkesi ve Hund kuralına göre atom ve iyonların elektron dizilimini yazar.' },
                { id: 'aytkim-modern-atom-s3-k2', text: 'Küresel simetri, yarı dolu ve tam dolu orbitallerin kararlılığa etkisini yorumlar.' },
              ],
            },
            {
              id: 'aytkim-modern-atom-s4',
              name: 'Periyodik Sistem ve Elektron Dizilimi',
              outcomes: [
                { id: 'aytkim-modern-atom-s4-k1', text: 'Elektron diziliminden elementin periyodik sistemdeki yerini (periyot, grup, blok) belirler.' },
              ],
            },
            {
              id: 'aytkim-modern-atom-s5',
              name: 'Periyodik Özellikler',
              outcomes: [
                { id: 'aytkim-modern-atom-s5-k1', text: 'Atom yarıçapı, iyonlaşma enerjisi, elektron ilgisi ve elektronegatifliğin periyodik değişimini açıklar.' },
                { id: 'aytkim-modern-atom-s5-k2', text: 'Ardışık iyonlaşma enerjisi verilerinden elementin değerlik elektron sayısını ve grubunu yorumlar.' },
              ],
            },
            {
              id: 'aytkim-modern-atom-s6',
              name: 'Yükseltgenme Basamakları',
              outcomes: [
                { id: 'aytkim-modern-atom-s6-k1', text: 'Elementlerin elektron dizilimi ile alabileceği yükseltgenme basamakları arasındaki ilişkiyi açıklar.' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-kimya-u2',
      name: 'Gazlar',
      topics: [
        {
          id: 'aytkim-gazlar',
          name: 'Gazlar',
          grade: 11,
          priority: true,
          subtopics: [
            {
              id: 'aytkim-gazlar-s1',
              name: 'Gazların Özellikleri ve Gaz Yasaları',
              outcomes: [
                { id: 'aytkim-gazlar-s1-k1', text: 'Gazların basınç, hacim, sıcaklık ve miktar özelliklerini birimleriyle açıklar.' },
                { id: 'aytkim-gazlar-s1-k2', text: 'Boyle, Charles, Gay-Lussac ve Avogadro yasalarını grafiklerle yorumlar.' },
              ],
            },
            {
              id: 'aytkim-gazlar-s2',
              name: 'İdeal Gaz Denklemi',
              outcomes: [
                { id: 'aytkim-gazlar-s2-k1', text: 'İdeal gaz denklemini kullanarak gazların basınç, hacim, sıcaklık ve mol sayısıyla ilgili hesaplamalar yapar.' },
                { id: 'aytkim-gazlar-s2-k2', text: 'Gazların yoğunluğu ve mol kütlesi arasındaki ilişkiyi hesaplamalarla açıklar.' },
              ],
            },
            {
              id: 'aytkim-gazlar-s3',
              name: 'Kinetik Teori ve Graham Difüzyon Yasası',
              outcomes: [
                { id: 'aytkim-gazlar-s3-k1', text: 'Gazların kinetik teorisinin temel varsayımlarını açıklar.' },
                { id: 'aytkim-gazlar-s3-k2', text: 'Gazların difüzyon ve efüzyon hızlarını Graham yasasıyla hesaplar.' },
              ],
            },
            {
              id: 'aytkim-gazlar-s4',
              name: 'Gaz Karışımları ve Kısmi Basınç',
              outcomes: [
                { id: 'aytkim-gazlar-s4-k1', text: 'Dalton kısmi basınçlar yasasını kullanarak gaz karışımlarıyla ilgili hesaplamalar yapar.' },
                { id: 'aytkim-gazlar-s4-k2', text: 'Su üzerinde toplanan gazların kuru gaz basıncını buhar basıncını dikkate alarak hesaplar.' },
              ],
            },
            {
              id: 'aytkim-gazlar-s5',
              name: 'Gerçek Gazlar',
              outcomes: [
                { id: 'aytkim-gazlar-s5-k1', text: 'Gerçek gazların ideallikten sapma nedenlerini ve ideale yaklaştığı koşulları açıklar.' },
                { id: 'aytkim-gazlar-s5-k2', text: 'Gaz ile buhar, kritik sıcaklık ve Joule-Thomson olayı kavramlarını açıklar.' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-kimya-u3',
      name: 'Sıvı Çözeltiler ve Çözünürlük',
      topics: [
        {
          id: 'aytkim-sivi-cozeltiler',
          name: 'Sıvı Çözeltiler ve Çözünürlük',
          grade: 11,
          subtopics: [
            {
              id: 'aytkim-sivi-cozeltiler-s1',
              name: 'Çözünme Süreci',
              outcomes: [
                { id: 'aytkim-sivi-cozeltiler-s1-k1', text: 'Çözünme sürecini tanecikler arası etkileşimler açısından açıklar.' },
              ],
            },
            {
              id: 'aytkim-sivi-cozeltiler-s2',
              name: 'Derişim Birimleri',
              outcomes: [
                { id: 'aytkim-sivi-cozeltiler-s2-k1', text: 'Kütlece yüzde, hacimce yüzde, ppm, molarite ve molalite ile ilgili hesaplamalar yapar.' },
                { id: 'aytkim-sivi-cozeltiler-s2-k2', text: 'Çözelti seyreltme, deriştirme ve karıştırma hesaplamalarını yapar.' },
              ],
            },
            {
              id: 'aytkim-sivi-cozeltiler-s3',
              name: 'Koligatif Özellikler',
              outcomes: [
                { id: 'aytkim-sivi-cozeltiler-s3-k1', text: 'Buhar basıncı düşmesi, kaynama noktası yükselmesi, donma noktası alçalması ve ozmotik basıncı açıklar.' },
                { id: 'aytkim-sivi-cozeltiler-s3-k2', text: 'Çözünen tanecik derişimi ile koligatif özellikler arasındaki ilişkiyi hesaplamalarla yorumlar.' },
              ],
            },
            {
              id: 'aytkim-sivi-cozeltiler-s4',
              name: 'Çözünürlük ve Etkileyen Faktörler',
              outcomes: [
                { id: 'aytkim-sivi-cozeltiler-s4-k1', text: 'Doymuş, doymamış ve aşırı doymuş çözeltileri çözünürlük kavramıyla ilişkilendirir.' },
                { id: 'aytkim-sivi-cozeltiler-s4-k2', text: 'Sıcaklık, basınç ve ortak iyonun çözünürlüğe etkisini çözünürlük grafikleriyle yorumlar.' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-kimya-u4',
      name: 'Kimyasal Tepkimelerde Enerji',
      topics: [
        {
          id: 'aytkim-tepkimelerde-enerji',
          name: 'Kimyasal Tepkimelerde Enerji',
          grade: 11,
          subtopics: [
            {
              id: 'aytkim-tepkimelerde-enerji-s1',
              name: 'Tepkimelerde Isı Değişimi',
              outcomes: [
                { id: 'aytkim-tepkimelerde-enerji-s1-k1', text: 'Endotermik ve ekzotermik tepkimeleri entalpi değişimi ve potansiyel enerji diyagramlarıyla açıklar.' },
              ],
            },
            {
              id: 'aytkim-tepkimelerde-enerji-s2',
              name: 'Oluşum Entalpileri',
              outcomes: [
                { id: 'aytkim-tepkimelerde-enerji-s2-k1', text: 'Standart oluşum entalpilerini kullanarak tepkime entalpisini hesaplar.' },
              ],
            },
            {
              id: 'aytkim-tepkimelerde-enerji-s3',
              name: 'Bağ Enerjileri',
              outcomes: [
                { id: 'aytkim-tepkimelerde-enerji-s3-k1', text: 'Bağ enerjilerini kullanarak tepkime entalpisini hesaplar.' },
              ],
            },
            {
              id: 'aytkim-tepkimelerde-enerji-s4',
              name: 'Hess Yasası',
              outcomes: [
                { id: 'aytkim-tepkimelerde-enerji-s4-k1', text: 'Tepkime ısılarının toplanabilirliğini (Hess yasası) kullanarak entalpi hesaplamaları yapar.' },
                { id: 'aytkim-tepkimelerde-enerji-s4-k2', text: 'Tepkime ısısı ile madde miktarı arasındaki orantıyı hesaplamalarda kullanır.' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-kimya-u5',
      name: 'Kimyasal Tepkimelerde Hız',
      topics: [
        {
          id: 'aytkim-tepkime-hizi',
          name: 'Kimyasal Tepkimelerde Hız',
          grade: 11,
          priority: true,
          subtopics: [
            {
              id: 'aytkim-tepkime-hizi-s1',
              name: 'Tepkime Hızı ve Ölçülmesi',
              outcomes: [
                { id: 'aytkim-tepkime-hizi-s1-k1', text: 'Tepkime hızını madde miktarlarındaki değişimle ifade eder ve ölçülebilir özellikleri açıklar.' },
                { id: 'aytkim-tepkime-hizi-s1-k2', text: 'Harcanma ve oluşma hızları arasındaki ilişkiyi katsayılarla hesaplar.' },
              ],
            },
            {
              id: 'aytkim-tepkime-hizi-s2',
              name: 'Çarpışma Teorisi ve Aktifleşme Enerjisi',
              outcomes: [
                { id: 'aytkim-tepkime-hizi-s2-k1', text: 'Etkin çarpışma, aktifleşme enerjisi ve aktifleşmiş kompleks kavramlarını açıklar.' },
                { id: 'aytkim-tepkime-hizi-s2-k2', text: 'Potansiyel enerji diyagramlarından ileri ve geri aktifleşme enerjilerini ve ΔH değerini yorumlar.' },
              ],
            },
            {
              id: 'aytkim-tepkime-hizi-s3',
              name: 'Hız İfadesi ve Tepkime Mertebesi',
              outcomes: [
                { id: 'aytkim-tepkime-hizi-s3-k1', text: 'Deney verilerinden hız ifadesini, tepkime mertebesini ve hız sabitinin birimini belirler.' },
              ],
            },
            {
              id: 'aytkim-tepkime-hizi-s4',
              name: 'Tepkime Mekanizması',
              outcomes: [
                { id: 'aytkim-tepkime-hizi-s4-k1', text: 'Çok basamaklı tepkimelerde hızı belirleyen basamağı, ara ürünü ve katalizörü belirler.' },
              ],
            },
            {
              id: 'aytkim-tepkime-hizi-s5',
              name: 'Tepkime Hızını Etkileyen Faktörler',
              outcomes: [
                { id: 'aytkim-tepkime-hizi-s5-k1', text: 'Madde cinsi, derişim, sıcaklık, temas yüzeyi ve katalizörün tepkime hızına etkisini açıklar.' },
                { id: 'aytkim-tepkime-hizi-s5-k2', text: 'Sıcaklık ve katalizörün etkisini enerji dağılım (Maxwell-Boltzmann) eğrileriyle yorumlar.' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-kimya-u6',
      name: 'Kimyasal Tepkimelerde Denge',
      topics: [
        {
          id: 'aytkim-kimyasal-denge',
          name: 'Kimyasal Denge',
          grade: 11,
          priority: true,
          subtopics: [
            {
              id: 'aytkim-kimyasal-denge-s1',
              name: 'Fiziksel ve Kimyasal Denge',
              outcomes: [
                { id: 'aytkim-kimyasal-denge-s1-k1', text: 'Dinamik denge kavramını ve dengenin kurulma koşullarını açıklar.' },
              ],
            },
            {
              id: 'aytkim-kimyasal-denge-s2',
              name: 'Denge Sabiti (Kc ve Kp)',
              outcomes: [
                { id: 'aytkim-kimyasal-denge-s2-k1', text: 'Denge bağıntısını yazar; Kc ve Kp değerlerini hesaplar ve birbirine dönüştürür.' },
                { id: 'aytkim-kimyasal-denge-s2-k2', text: 'Tepkime ters çevrildiğinde, katsayılar değiştiğinde veya tepkimeler toplandığında denge sabitinin değişimini hesaplar.' },
              ],
            },
            {
              id: 'aytkim-kimyasal-denge-s3',
              name: 'Tepkime Oranı (Q) ile Yön Tayini',
              outcomes: [
                { id: 'aytkim-kimyasal-denge-s3-k1', text: 'Tepkime oranını denge sabitiyle karşılaştırarak sistemin dengeye hangi yönde ilerleyeceğini belirler.' },
              ],
            },
            {
              id: 'aytkim-kimyasal-denge-s4',
              name: 'Dengeyi Etkileyen Faktörler (Le Chatelier)',
              outcomes: [
                { id: 'aytkim-kimyasal-denge-s4-k1', text: 'Derişim, basınç-hacim ve sıcaklık değişimlerinin dengeye etkisini Le Chatelier ilkesiyle açıklar.' },
                { id: 'aytkim-kimyasal-denge-s4-k2', text: 'Denge sabitinin yalnızca sıcaklıkla değiştiğini ve katalizörün dengeyi kaydırmadığını açıklar.' },
              ],
            },
            {
              id: 'aytkim-kimyasal-denge-s5',
              name: 'Denge Hesaplamaları',
              outcomes: [
                { id: 'aytkim-kimyasal-denge-s5-k1', text: 'Başlangıç, değişim ve denge miktarlarını kullanarak denge derişimlerini ve denge sabitini hesaplar.' },
              ],
            },
          ],
        },
        {
          id: 'aytkim-asit-baz-dengesi',
          name: 'Asit-Baz Dengesi',
          grade: 11,
          priority: true,
          subtopics: [
            {
              id: 'aytkim-asit-baz-dengesi-s1',
              name: 'Asit-Baz Tanımları ve Suyun İyonlaşması',
              outcomes: [
                { id: 'aytkim-asit-baz-dengesi-s1-k1', text: 'Arrhenius ve Brønsted-Lowry asit-baz tanımlarını ve konjuge asit-baz çiftlerini açıklar.' },
                { id: 'aytkim-asit-baz-dengesi-s1-k2', text: 'Suyun iyonlaşma dengesini ve Ksu değerinin sıcaklıkla değişimini açıklar.' },
              ],
            },
            {
              id: 'aytkim-asit-baz-dengesi-s2',
              name: 'pH ve pOH',
              outcomes: [
                { id: 'aytkim-asit-baz-dengesi-s2-k1', text: 'Kuvvetli asit ve baz çözeltilerinin pH ve pOH değerlerini hesaplar.' },
              ],
            },
            {
              id: 'aytkim-asit-baz-dengesi-s3',
              name: 'Zayıf Asit ve Bazlarda Denge',
              outcomes: [
                { id: 'aytkim-asit-baz-dengesi-s3-k1', text: 'Ka ve Kb değerlerini kullanarak zayıf asit ve baz çözeltilerinin pH değerini ve iyonlaşma yüzdesini hesaplar.' },
                { id: 'aytkim-asit-baz-dengesi-s3-k2', text: 'Konjuge asit-baz çiftlerinde Ka·Kb = Ksu bağıntısını kullanır.' },
              ],
            },
            {
              id: 'aytkim-asit-baz-dengesi-s4',
              name: 'Nötrleşme, Hidroliz ve Tampon Çözeltiler',
              outcomes: [
                { id: 'aytkim-asit-baz-dengesi-s4-k1', text: 'Tuz çözeltilerinin hidrolizini ve asitlik-bazlık özelliğini açıklar.' },
                { id: 'aytkim-asit-baz-dengesi-s4-k2', text: 'Tampon çözeltilerin oluşumunu ve işlevini açıklar.' },
              ],
            },
            {
              id: 'aytkim-asit-baz-dengesi-s5',
              name: 'Titrasyon',
              outcomes: [
                { id: 'aytkim-asit-baz-dengesi-s5-k1', text: 'Titrasyon eğrilerini yorumlar; eşdeğerlik noktası ve indikatör seçimini açıklar.' },
                { id: 'aytkim-asit-baz-dengesi-s5-k2', text: 'Titrasyon verilerinden bilinmeyen derişimi hesaplar.' },
              ],
            },
          ],
        },
        {
          id: 'aytkim-cozunurluk-dengesi',
          name: 'Çözünürlük Dengesi',
          grade: 11,
          subtopics: [
            {
              id: 'aytkim-cozunurluk-dengesi-s1',
              name: 'Çözünürlük Çarpımı (Kçç)',
              outcomes: [
                { id: 'aytkim-cozunurluk-dengesi-s1-k1', text: 'Az çözünen iyonik katıların çözünürlük dengesini ve çözünürlük çarpımı bağıntısını yazar.' },
                { id: 'aytkim-cozunurluk-dengesi-s1-k2', text: 'Çözünürlük ile çözünürlük çarpımı arasındaki dönüşümleri hesaplar.' },
              ],
            },
            {
              id: 'aytkim-cozunurluk-dengesi-s2',
              name: 'Ortak İyon Etkisi',
              outcomes: [
                { id: 'aytkim-cozunurluk-dengesi-s2-k1', text: 'Ortak iyonun çözünürlüğe etkisini açıklar ve ortak iyonlu ortamda çözünürlüğü hesaplar.' },
              ],
            },
            {
              id: 'aytkim-cozunurluk-dengesi-s3',
              name: 'Çökelme Koşulu',
              outcomes: [
                { id: 'aytkim-cozunurluk-dengesi-s3-k1', text: 'İyon çarpımını Kçç ile karşılaştırarak çökelme olup olmayacağını belirler.' },
              ],
            },
            {
              id: 'aytkim-cozunurluk-dengesi-s4',
              name: 'Çözünürlüğü Etkileyen Faktörler',
              outcomes: [
                { id: 'aytkim-cozunurluk-dengesi-s4-k1', text: 'Sıcaklık, ortak iyon ve pH değişiminin çözünürlük dengesine etkisini yorumlar.' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-kimya-u7',
      name: 'Kimya ve Elektrik',
      topics: [
        {
          id: 'aytkim-elektrokimya',
          name: 'Kimya ve Elektrik (Elektrokimya)',
          grade: 12,
          priority: true,
          subtopics: [
            {
              id: 'aytkim-elektrokimya-s1',
              name: 'İndirgenme-Yükseltgenme Tepkimeleri',
              outcomes: [
                { id: 'aytkim-elektrokimya-s1-k1', text: 'Redoks tepkimelerinde yükseltgenen, indirgenen, yükseltgen ve indirgen maddeleri belirler.' },
                { id: 'aytkim-elektrokimya-s1-k2', text: 'Redoks tepkimelerini elektron alışverişine göre denkleştirir.' },
              ],
            },
            {
              id: 'aytkim-elektrokimya-s2',
              name: 'Elektrotlar ve Elektrot Potansiyelleri',
              outcomes: [
                { id: 'aytkim-elektrokimya-s2-k1', text: 'Standart hidrojen elektrodunu ve standart indirgenme potansiyellerini açıklar.' },
                { id: 'aytkim-elektrokimya-s2-k2', text: 'Elektrot potansiyellerinden metallerin aktifliğini ve istemli tepkimeleri belirler.' },
              ],
            },
            {
              id: 'aytkim-elektrokimya-s3',
              name: 'Galvanik (Elektrokimyasal) Piller',
              outcomes: [
                { id: 'aytkim-elektrokimya-s3-k1', text: 'Galvanik pillerde anot, katot, tuz köprüsü ve elektron akış yönünü açıklar.' },
                { id: 'aytkim-elektrokimya-s3-k2', text: 'Standart pil potansiyelini hesaplar ve derişim, sıcaklık değişiminin pil potansiyeline etkisini yorumlar.' },
              ],
            },
            {
              id: 'aytkim-elektrokimya-s4',
              name: 'Elektroliz',
              outcomes: [
                { id: 'aytkim-elektrokimya-s4-k1', text: 'Erimiş tuz ve sulu çözelti elektrolizinde elektrotlarda oluşan ürünleri belirler.' },
                { id: 'aytkim-elektrokimya-s4-k2', text: 'Faraday yasalarıyla elektrolizde açığa çıkan madde miktarını hesaplar.' },
              ],
            },
            {
              id: 'aytkim-elektrokimya-s5',
              name: 'Korozyon ve Korunma',
              outcomes: [
                { id: 'aytkim-elektrokimya-s5-k1', text: 'Korozyonun elektrokimyasal temelini ve korozyondan korunma yöntemlerini (kurban elektrot, kaplama) açıklar.' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-kimya-u8',
      name: 'Karbon Kimyasına Giriş',
      topics: [
        {
          id: 'aytkim-karbon-kimyasina-giris',
          name: 'Karbon Kimyasına Giriş',
          grade: 12,
          subtopics: [
            {
              id: 'aytkim-karbon-kimyasina-giris-s1',
              name: 'Anorganik ve Organik Bileşikler',
              outcomes: [
                { id: 'aytkim-karbon-kimyasina-giris-s1-k1', text: 'Organik ve anorganik bileşikleri ayırt eder; karbonun allotroplarını (elmas, grafit, fulleren, grafen, nanotüp) karşılaştırır.' },
              ],
            },
            {
              id: 'aytkim-karbon-kimyasina-giris-s2',
              name: 'Basit ve Molekül Formül',
              outcomes: [
                { id: 'aytkim-karbon-kimyasina-giris-s2-k1', text: 'Element analizi verilerinden organik bileşiklerin basit ve molekül formülünü hesaplar.' },
              ],
            },
            {
              id: 'aytkim-karbon-kimyasina-giris-s3',
              name: 'Hibritleşme ve Molekül Geometrisi',
              outcomes: [
                { id: 'aytkim-karbon-kimyasina-giris-s3-k1', text: 'Karbon atomunun sp³, sp² ve sp hibritleşmesini ve oluşan molekül geometrisini açıklar.' },
                { id: 'aytkim-karbon-kimyasina-giris-s3-k2', text: 'Organik moleküllerdeki sigma (σ) ve pi (π) bağlarını belirler.' },
              ],
            },
            {
              id: 'aytkim-karbon-kimyasina-giris-s4',
              name: 'Değerlik Bağ Teorisi ve Molekül Polarlığı',
              outcomes: [
                { id: 'aytkim-karbon-kimyasina-giris-s4-k1', text: 'VSEPR ve değerlik bağ teorisiyle basit moleküllerin geometrisini ve polarlığını yorumlar.' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-kimya-u9',
      name: 'Organik Bileşikler',
      topics: [
        {
          id: 'aytkim-organik-bilesikler',
          name: 'Organik Bileşikler',
          grade: 12,
          priority: true,
          subtopics: [
            {
              id: 'aytkim-organik-bilesikler-s1',
              name: 'Hidrokarbonlar',
              outcomes: [
                { id: 'aytkim-organik-bilesikler-s1-k1', text: 'Alkan, alken, alkin ve aromatik hidrokarbonları adlandırır, genel formüllerini ve özelliklerini açıklar.' },
                { id: 'aytkim-organik-bilesikler-s1-k2', text: 'Hidrokarbonların yanma, katılma ve yer değiştirme tepkimelerini açıklar.' },
              ],
            },
            {
              id: 'aytkim-organik-bilesikler-s2',
              name: 'İzomerlik',
              outcomes: [
                { id: 'aytkim-organik-bilesikler-s2-k1', text: 'Yapı izomerliğini ve cis-trans (geometrik) izomerliğini örneklerle açıklar.' },
              ],
            },
            {
              id: 'aytkim-organik-bilesikler-s3',
              name: 'Alkoller ve Eterler',
              outcomes: [
                { id: 'aytkim-organik-bilesikler-s3-k1', text: 'Alkolleri sınıflandırır, adlandırır ve yükseltgenme tepkimelerini açıklar.' },
                { id: 'aytkim-organik-bilesikler-s3-k2', text: 'Eterlerin yapısını ve alkollerle izomerliğini açıklar.' },
              ],
            },
            {
              id: 'aytkim-organik-bilesikler-s4',
              name: 'Karbonil Bileşikleri (Aldehit ve Ketonlar)',
              outcomes: [
                { id: 'aytkim-organik-bilesikler-s4-k1', text: 'Aldehit ve ketonların yapısını, adlandırılmasını ve ayırt edilme tepkimelerini (Tollens, Fehling) açıklar.' },
              ],
            },
            {
              id: 'aytkim-organik-bilesikler-s5',
              name: 'Karboksilik Asitler ve Esterler',
              outcomes: [
                { id: 'aytkim-organik-bilesikler-s5-k1', text: 'Karboksilik asitlerin özelliklerini ve esterleşme tepkimesini açıklar.' },
                { id: 'aytkim-organik-bilesikler-s5-k2', text: 'Esterlerin hidrolizini ve sabunlaşma tepkimesini açıklar.' },
              ],
            },
            {
              id: 'aytkim-organik-bilesikler-s6',
              name: 'Fonksiyonel Grupların Fiziksel Özellikleri',
              outcomes: [
                { id: 'aytkim-organik-bilesikler-s6-k1', text: 'Fonksiyonel grupların kaynama noktası ve sudaki çözünürlüğe etkisini moleküller arası etkileşimlerle yorumlar.' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-kimya-u10',
      name: 'Enerji Kaynakları ve Bilimsel Gelişmeler',
      topics: [
        {
          id: 'aytkim-enerji-kaynaklari',
          name: 'Enerji Kaynakları ve Bilimsel Gelişmeler',
          grade: 12,
          subtopics: [
            {
              id: 'aytkim-enerji-kaynaklari-s1',
              name: 'Fosil Yakıtlar',
              outcomes: [
                { id: 'aytkim-enerji-kaynaklari-s1-k1', text: 'Kömür, petrol ve doğal gazın oluşumunu, kullanımını ve çevresel etkilerini açıklar.' },
              ],
            },
            {
              id: 'aytkim-enerji-kaynaklari-s2',
              name: 'Alternatif Enerji Kaynakları',
              outcomes: [
                { id: 'aytkim-enerji-kaynaklari-s2-k1', text: 'Güneş, rüzgâr, jeotermal, hidrojen ve nükleer enerji kaynaklarını avantaj ve dezavantajlarıyla karşılaştırır.' },
              ],
            },
            {
              id: 'aytkim-enerji-kaynaklari-s3',
              name: 'Sürdürülebilirlik',
              outcomes: [
                { id: 'aytkim-enerji-kaynaklari-s3-k1', text: 'Sürdürülebilir yaşam ve kalkınma açısından enerji kaynaklarının kullanımını değerlendirir.' },
              ],
            },
            {
              id: 'aytkim-enerji-kaynaklari-s4',
              name: 'Nanoteknoloji',
              outcomes: [
                { id: 'aytkim-enerji-kaynaklari-s4-k1', text: 'Nanoteknolojinin kimyadaki uygulama alanlarını açıklar.' },
              ],
            },
          ],
        },
      ],
    },
  ],
};
