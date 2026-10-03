import type { Subject } from '../../domain/types';

export const subject: Subject = {
  id: 'tyt-biyoloji',
  exam: 'TYT',
  name: "TYT Biyoloji",
  icon: "♧",
  examQuestionCount: 6,
  note: "TYT Fen Bilimleri testinin biyoloji bölümü; MEB 2018 Biyoloji 9–10 programı kapsamındadır.",
  units: [
    {
      id: 'tyt-biyoloji-u1',
      name: "Yaşam Bilimi Biyoloji",
      topics: [
        {
          id: 'tytbio-canlilarin-ortak-ozellikleri',
          name: "Canlıların Ortak Özellikleri",
          grade: 9,
          subtopics: [
            {
              id: 'tytbio-canlilarin-ortak-ozellikleri-s1',
              name: "Biyoloji ve Bilimsel Yöntem",
              outcomes: [
                { id: 'tytbio-canlilarin-ortak-ozellikleri-s1-k1', text: "Bilimsel yöntemin basamaklarını (gözlem, problem, hipotez, deney, sonuç) açıklar." },
                { id: 'tytbio-canlilarin-ortak-ozellikleri-s1-k2', text: "Kontrollü deneyde bağımsız, bağımlı ve kontrol edilen değişkenleri ayırt eder." },
              ],
            },
            {
              id: 'tytbio-canlilarin-ortak-ozellikleri-s2',
              name: "Canlıların Ortak Özellikleri",
              outcomes: [
                { id: 'tytbio-canlilarin-ortak-ozellikleri-s2-k1', text: "Canlıların ortak özelliklerini (hücresel yapı, beslenme, solunum, boşaltım, metabolizma, homeostazi, uyarılara tepki, büyüme, üreme, hareket, adaptasyon) açıklar." },
                { id: 'tytbio-canlilarin-ortak-ozellikleri-s2-k2', text: "Metabolizma, anabolizma ve katabolizma kavramlarını örneklerle ilişkilendirir." },
                { id: 'tytbio-canlilarin-ortak-ozellikleri-s2-k3', text: "Büyüme ile gelişme arasındaki farkı yorumlar." },
              ],
            },
            {
              id: 'tytbio-canlilarin-ortak-ozellikleri-s3',
              name: "Canlılığın Organizasyon Düzeyleri ve Virüsler",
              outcomes: [
                { id: 'tytbio-canlilarin-ortak-ozellikleri-s3-k1', text: "Canlılığın hücreden biyosfere kadar organizasyon düzeylerini sıralar." },
                { id: 'tytbio-canlilarin-ortak-ozellikleri-s3-k2', text: "Virüslerin canlılık özelliklerini taşıyıp taşımadığını tartışır." },
              ],
            },
          ],
        },
        {
          id: 'tytbio-temel-bilesenler',
          name: "Canlıların Temel Bileşenleri",
          grade: 9,
          subtopics: [
            {
              id: 'tytbio-temel-bilesenler-s1',
              name: "İnorganik Bileşikler: Su, Mineraller, Asit-Baz",
              outcomes: [
                { id: 'tytbio-temel-bilesenler-s1-k1', text: "Suyun canlılar için önemini fiziksel ve kimyasal özellikleriyle açıklar." },
                { id: 'tytbio-temel-bilesenler-s1-k2', text: "Minerallerin ve pH dengesinin canlılardaki görevlerini örneklendirir." },
              ],
            },
            {
              id: 'tytbio-temel-bilesenler-s2',
              name: "Karbonhidratlar ve Lipitler",
              outcomes: [
                { id: 'tytbio-temel-bilesenler-s2-k1', text: "Karbonhidratları monosakkarit, disakkarit ve polisakkarit olarak sınıflandırır, görevlerini açıklar." },
                { id: 'tytbio-temel-bilesenler-s2-k2', text: "Dehidrasyon sentezi ve hidrolizde su ve bağ sayısı ilişkisini hesaplar." },
                { id: 'tytbio-temel-bilesenler-s2-k3', text: "Lipitlerin (yağ, fosfolipit, steroit) yapı ve görevlerini açıklar." },
              ],
            },
            {
              id: 'tytbio-temel-bilesenler-s3',
              name: "Proteinler ve Enzimler",
              outcomes: [
                { id: 'tytbio-temel-bilesenler-s3-k1', text: "Proteinlerin yapısını, çeşitliliğini ve görevlerini açıklar." },
                { id: 'tytbio-temel-bilesenler-s3-k2', text: "Enzimlerin yapısını, çalışma mekanizmasını ve etki eden faktörleri deney sonuçlarıyla yorumlar." },
              ],
            },
            {
              id: 'tytbio-temel-bilesenler-s4',
              name: "Vitaminler",
              outcomes: [
                { id: 'tytbio-temel-bilesenler-s4-k1', text: "Suda ve yağda çözünen vitaminleri karşılaştırır, eksikliklerinde görülen durumları örneklendirir." },
              ],
            },
            {
              id: 'tytbio-temel-bilesenler-s5',
              name: "Nükleik Asitler ve ATP",
              outcomes: [
                { id: 'tytbio-temel-bilesenler-s5-k1', text: "DNA ve RNA’nın yapısını karşılaştırır, nükleotit sayılarıyla ilgili hesaplamalar yapar." },
                { id: 'tytbio-temel-bilesenler-s5-k2', text: "ATP’nin yapısını ve canlılar için önemini açıklar." },
              ],
            },
          ],
        },
        {
          id: 'tytbio-hucre',
          name: "Hücre",
          grade: 9,
          subtopics: [
            {
              id: 'tytbio-hucre-s1',
              name: "Hücre Teorisi ve Hücre Tipleri",
              outcomes: [
                { id: 'tytbio-hucre-s1-k1', text: "Hücre teorisinin gelişimini ve temel ilkelerini açıklar." },
                { id: 'tytbio-hucre-s1-k2', text: "Prokaryot ve ökaryot hücreleri yapısal özellikleriyle karşılaştırır." },
              ],
            },
            {
              id: 'tytbio-hucre-s2',
              name: "Hücre Zarı ve Madde Geçişleri",
              outcomes: [
                { id: 'tytbio-hucre-s2-k1', text: "Hücre zarının akıcı mozaik modelini açıklar." },
                { id: 'tytbio-hucre-s2-k2', text: "Difüzyon, osmoz, aktif taşıma, endositoz ve ekzositozu karşılaştırır." },
                { id: 'tytbio-hucre-s2-k3', text: "Hücrelerin farklı yoğunluktaki ortamlarda gösterdiği değişimleri deney sonuçlarıyla yorumlar." },
              ],
            },
            {
              id: 'tytbio-hucre-s3',
              name: "Sitoplazma ve Organeller",
              outcomes: [
                { id: 'tytbio-hucre-s3-k1', text: "Organellerin yapı ve görevlerini açıklar." },
                { id: 'tytbio-hucre-s3-k2', text: "Bitki ve hayvan hücrelerini organel içeriği bakımından karşılaştırır." },
              ],
            },
            {
              id: 'tytbio-hucre-s4',
              name: "Çekirdek",
              outcomes: [
                { id: 'tytbio-hucre-s4-k1', text: "Çekirdeğin yapısını (zar, çekirdekçik, kromatin) ve hücre yönetimindeki rolünü açıklar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-biyoloji-u2',
      name: "Canlılar Dünyası",
      topics: [
        {
          id: 'tytbio-siniflandirma',
          name: "Canlıların Sınıflandırılması",
          grade: 9,
          subtopics: [
            {
              id: 'tytbio-siniflandirma-s1',
              name: "Sınıflandırmanın İlkeleri",
              outcomes: [
                { id: 'tytbio-siniflandirma-s1-k1', text: "Doğal ve yapay sınıflandırmayı karşılaştırır." },
                { id: 'tytbio-siniflandirma-s1-k2', text: "Sınıflandırma kategorilerini sıralar ve kategoriler arasındaki ilişkiyi yorumlar." },
                { id: 'tytbio-siniflandirma-s1-k3', text: "İkili adlandırma kurallarını açıklar ve tür kavramını tanımlar." },
              ],
            },
            {
              id: 'tytbio-siniflandirma-s2',
              name: "Bakteriler ve Arkeler",
              outcomes: [
                { id: 'tytbio-siniflandirma-s2-k1', text: "Bakteri ve arkelerin genel özelliklerini ve önemini açıklar." },
              ],
            },
            {
              id: 'tytbio-siniflandirma-s3',
              name: "Protistler ve Mantarlar",
              outcomes: [
                { id: 'tytbio-siniflandirma-s3-k1', text: "Protistlerin ve mantarların genel özelliklerini ve ekolojik önemini açıklar." },
              ],
            },
            {
              id: 'tytbio-siniflandirma-s4',
              name: "Bitkiler ve Hayvanlar",
              outcomes: [
                { id: 'tytbio-siniflandirma-s4-k1', text: "Bitkileri damarlı-damarsız, tohumlu-tohumsuz olarak gruplandırır." },
                { id: 'tytbio-siniflandirma-s4-k2', text: "Omurgasız ve omurgalı hayvanların ayırt edici özelliklerini açıklar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-biyoloji-u3',
      name: "Hücre Bölünmeleri ve Kalıtım",
      topics: [
        {
          id: 'tytbio-hucre-bolunmeleri',
          name: "Hücre Bölünmeleri ve Üreme",
          grade: 10,
          subtopics: [
            {
              id: 'tytbio-hucre-bolunmeleri-s1',
              name: "Hücre Döngüsü ve Mitoz",
              outcomes: [
                { id: 'tytbio-hucre-bolunmeleri-s1-k1', text: "Hücre döngüsünün evrelerini ve interfazda gerçekleşen olayları açıklar." },
                { id: 'tytbio-hucre-bolunmeleri-s1-k2', text: "Mitozun evrelerini ve bitki-hayvan hücresi sitokinezi farkını açıklar." },
                { id: 'tytbio-hucre-bolunmeleri-s1-k3', text: "Bölünme sürecinde DNA ve kromozom miktarındaki değişimleri grafik üzerinde yorumlar." },
              ],
            },
            {
              id: 'tytbio-hucre-bolunmeleri-s2',
              name: "Eşeysiz Üreme",
              outcomes: [
                { id: 'tytbio-hucre-bolunmeleri-s2-k1', text: "Eşeysiz üreme çeşitlerini (bölünme, tomurcuklanma, sporla üreme, rejenerasyon, vejetatif üreme, partenogenez) örneklendirir." },
              ],
            },
            {
              id: 'tytbio-hucre-bolunmeleri-s3',
              name: "Mayoz",
              outcomes: [
                { id: 'tytbio-hucre-bolunmeleri-s3-k1', text: "Mayozun evrelerini ve kalıtsal çeşitliliğe katkısını (krossing over, bağımsız dağılım) açıklar." },
                { id: 'tytbio-hucre-bolunmeleri-s3-k2', text: "Mitoz ve mayozu karşılaştırır." },
              ],
            },
            {
              id: 'tytbio-hucre-bolunmeleri-s4',
              name: "Eşeyli Üreme",
              outcomes: [
                { id: 'tytbio-hucre-bolunmeleri-s4-k1', text: "Eşeyli üremenin temel olaylarını (gametogenez, döllenme) açıklar ve eşeysiz üremeyle karşılaştırır." },
              ],
            },
          ],
        },
        {
          id: 'tytbio-kalitim',
          name: "Kalıtımın Genel İlkeleri",
          grade: 10,
          subtopics: [
            {
              id: 'tytbio-kalitim-s1',
              name: "Mendel İlkeleri ve Temel Kavramlar",
              outcomes: [
                { id: 'tytbio-kalitim-s1-k1', text: "Gen, alel, genotip, fenotip, homozigot ve heterozigot kavramlarını açıklar." },
                { id: 'tytbio-kalitim-s1-k2', text: "Mendel’in çalışmalarını ve ilkelerini açıklar." },
              ],
            },
            {
              id: 'tytbio-kalitim-s2',
              name: "Çaprazlamalar ve Olasılık",
              outcomes: [
                { id: 'tytbio-kalitim-s2-k1', text: "Monohibrit ve dihibrit çaprazlamalarda genotip ve fenotip oranlarını hesaplar." },
                { id: 'tytbio-kalitim-s2-k2', text: "Kontrol çaprazlamasıyla bireyin genotipini belirler." },
              ],
            },
            {
              id: 'tytbio-kalitim-s3',
              name: "Eş Baskınlık, Çok Alellik ve Kan Grupları",
              outcomes: [
                { id: 'tytbio-kalitim-s3-k1', text: "Eksik baskınlık ve eş baskınlık durumlarında fenotip oranlarını yorumlar." },
                { id: 'tytbio-kalitim-s3-k2', text: "ABO ve Rh kan gruplarının kalıtımıyla ilgili olasılık hesaplar." },
              ],
            },
            {
              id: 'tytbio-kalitim-s4',
              name: "Eşeye Bağlı Kalıtım ve Soy Ağacı",
              outcomes: [
                { id: 'tytbio-kalitim-s4-k1', text: "X ve Y kromozomuna bağlı kalıtımı örneklerle (renk körlüğü, hemofili) açıklar." },
                { id: 'tytbio-kalitim-s4-k2', text: "Soy ağacı analiziyle özelliğin kalıtım şeklini ve bireylerin genotiplerini belirler." },
              ],
            },
            {
              id: 'tytbio-kalitim-s5',
              name: "Genetik Varyasyon",
              outcomes: [
                { id: 'tytbio-kalitim-s5-k1', text: "Genetik varyasyonun kaynaklarını (mutasyon, krossing over, bağımsız dağılım, döllenme) açıklar." },
                { id: 'tytbio-kalitim-s5-k2', text: "Modifikasyon ile mutasyonu ayırt eder." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-biyoloji-u4',
      name: "Ekosistem Ekolojisi ve Güncel Çevre Sorunları",
      topics: [
        {
          id: 'tytbio-ekosistem',
          name: "Ekosistem Ekolojisi",
          grade: 10,
          subtopics: [
            {
              id: 'tytbio-ekosistem-s1',
              name: "Ekosistemin Bileşenleri",
              outcomes: [
                { id: 'tytbio-ekosistem-s1-k1', text: "Ekosistemin canlı ve cansız bileşenlerini ve aralarındaki ilişkileri açıklar." },
                { id: 'tytbio-ekosistem-s1-k2', text: "Üretici, tüketici ve ayrıştırıcıların ekosistemdeki rollerini açıklar." },
              ],
            },
            {
              id: 'tytbio-ekosistem-s2',
              name: "Besin Zinciri, Besin Ağı ve Enerji Akışı",
              outcomes: [
                { id: 'tytbio-ekosistem-s2-k1', text: "Besin zinciri ve besin ağında enerji akışını ve %10 kuralını yorumlar." },
                { id: 'tytbio-ekosistem-s2-k2', text: "Enerji, biyokütle ve birey sayısı piramitlerini yorumlar; biyolojik birikimi açıklar." },
              ],
            },
            {
              id: 'tytbio-ekosistem-s3',
              name: "Madde Döngüleri",
              outcomes: [
                { id: 'tytbio-ekosistem-s3-k1', text: "Su, karbon ve oksijen döngülerini açıklar." },
                { id: 'tytbio-ekosistem-s3-k2', text: "Azot döngüsünde görev alan canlıları ve gerçekleşen olayları açıklar." },
              ],
            },
          ],
        },
        {
          id: 'tytbio-cevre-sorunlari',
          name: "Güncel Çevre Sorunları ve Doğal Kaynaklar",
          grade: 10,
          subtopics: [
            {
              id: 'tytbio-cevre-sorunlari-s1',
              name: "Kirlilik Türleri",
              outcomes: [
                { id: 'tytbio-cevre-sorunlari-s1-k1', text: "Hava, su, toprak, ışık, gürültü ve radyoaktif kirliliğin nedenlerini ve sonuçlarını açıklar." },
              ],
            },
            {
              id: 'tytbio-cevre-sorunlari-s2',
              name: "Küresel Çevre Sorunları",
              outcomes: [
                { id: 'tytbio-cevre-sorunlari-s2-k1', text: "Küresel iklim değişikliği, asit yağmurları, ozon tabakasının incelmesi ve ötrofikasyonun nedenlerini ve etkilerini yorumlar." },
                { id: 'tytbio-cevre-sorunlari-s2-k2', text: "Biyolojik çeşitliliğin azalmasının nedenlerini ve sonuçlarını açıklar." },
              ],
            },
            {
              id: 'tytbio-cevre-sorunlari-s3',
              name: "Doğal Kaynaklar ve Sürdürülebilirlik",
              outcomes: [
                { id: 'tytbio-cevre-sorunlari-s3-k1', text: "Yenilenebilir ve yenilenemez kaynakların sürdürülebilir kullanımına yönelik çözüm önerileri geliştirir." },
                { id: 'tytbio-cevre-sorunlari-s3-k2', text: "Ekolojik ayak izi ve biyolojik çeşitliliğin korunması kavramlarını açıklar." },
              ],
            },
          ],
        },
      ],
    },
  ],
};
