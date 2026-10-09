import type { Subject } from '../../domain/types';

/**
 * AYT Biyoloji müfredatı — MEB 2018 Biyoloji Dersi Öğretim Programı (11–12. sınıf) mantığıyla.
 * Kazanım metinleri program üslubunda yazılmıştır; resmî kazanım kodu içermez.
 */
export const subject: Subject = {
  id: 'ayt-biyoloji',
  exam: 'AYT',
  name: 'Biyoloji',
  icon: '♧',
  examQuestionCount: 13,
  note: 'AYT Fen Bilimleri testinde yer alır; 11. ve 12. sınıf biyoloji programını kapsar. TYT biyoloji konuları (hücre, kalıtım, ekosistem) ön bilgi olarak gerekir.',
  units: [
    {
      id: 'ayt-biyoloji-u1',
      name: 'İnsan Fizyolojisi',
      topics: [
        {
          id: 'aytbio-sinir-sistemi',
          name: 'Sinir Sistemi',
          grade: 11,
          priority: true,
          subtopics: [
            {
              id: 'aytbio-sinir-sistemi-s1',
              name: 'Nöronun Yapısı ve Çeşitleri',
              outcomes: [
                { id: 'aytbio-sinir-sistemi-s1-k1', text: 'Nöronun yapısını (dendrit, hücre gövdesi, akson, miyelin kılıf, Ranvier boğumu) açıklar.' },
                { id: 'aytbio-sinir-sistemi-s1-k2', text: 'Duyu, ara ve motor nöronları görev ve konumlarına göre karşılaştırır.' },
              ],
            },
            {
              id: 'aytbio-sinir-sistemi-s2',
              name: 'Impuls Oluşumu ve İletimi',
              outcomes: [
                { id: 'aytbio-sinir-sistemi-s2-k1', text: 'Dinlenme potansiyeli, depolarizasyon ve repolarizasyon olaylarını iyon hareketleriyle açıklar.' },
                { id: 'aytbio-sinir-sistemi-s2-k2', text: 'Ketleme eşiği ve “ya hep ya hiç” kuralını yorumlar.' },
                { id: 'aytbio-sinir-sistemi-s2-k3', text: 'Miyelinli ve miyelinsiz nöronlarda impuls iletim hızını karşılaştırır.' },
              ],
            },
            {
              id: 'aytbio-sinir-sistemi-s3',
              name: 'Sinaps ve Nörotransmitterler',
              outcomes: [
                { id: 'aytbio-sinir-sistemi-s3-k1', text: 'Sinapsta impulsun kimyasal yolla tek yönlü iletimini açıklar.' },
                { id: 'aytbio-sinir-sistemi-s3-k2', text: 'Nörotransmitterlerin uyarıcı ve baskılayıcı etkilerini örneklerle açıklar.' },
              ],
            },
            {
              id: 'aytbio-sinir-sistemi-s4',
              name: 'Merkezi Sinir Sistemi',
              outcomes: [
                { id: 'aytbio-sinir-sistemi-s4-k1', text: 'Beynin bölümlerini (ön, orta, arka beyin) ve görevlerini açıklar.' },
                { id: 'aytbio-sinir-sistemi-s4-k2', text: 'Omuriliğin yapısını ve refleks yayını açıklar.' },
              ],
            },
            {
              id: 'aytbio-sinir-sistemi-s5',
              name: 'Çevresel Sinir Sistemi',
              outcomes: [
                { id: 'aytbio-sinir-sistemi-s5-k1', text: 'Somatik ve otonom sinir sistemini karşılaştırır.' },
                { id: 'aytbio-sinir-sistemi-s5-k2', text: 'Sempatik ve parasempatik sistemin organlar üzerindeki zıt etkilerini açıklar.' },
              ],
            },
            {
              id: 'aytbio-sinir-sistemi-s6',
              name: 'Sinir Sistemi Rahatsızlıkları ve Sağlığı',
              outcomes: [
                { id: 'aytbio-sinir-sistemi-s6-k1', text: 'Sinir sistemi rahatsızlıklarına (multipl skleroz, Alzheimer, Parkinson, epilepsi) örnek verir.' },
              ],
            },
          ],
        },
        {
          id: 'aytbio-endokrin-sistem',
          name: 'Endokrin Sistem ve Hormonlar',
          grade: 11,
          priority: true,
          subtopics: [
            {
              id: 'aytbio-endokrin-sistem-s1',
              name: 'Hormonların Genel Özellikleri',
              outcomes: [
                { id: 'aytbio-endokrin-sistem-s1-k1', text: 'Hormonların genel özelliklerini ve etki mekanizmalarını açıklar.' },
                { id: 'aytbio-endokrin-sistem-s1-k2', text: 'Endokrin ve sinirsel düzenlemeyi karşılaştırır.' },
              ],
            },
            {
              id: 'aytbio-endokrin-sistem-s2',
              name: 'Hipotalamus ve Hipofiz',
              outcomes: [
                { id: 'aytbio-endokrin-sistem-s2-k1', text: 'Hipotalamus–hipofiz ilişkisini ve hipofiz hormonlarının etkilerini açıklar.' },
              ],
            },
            {
              id: 'aytbio-endokrin-sistem-s3',
              name: 'Tiroit, Paratiroit ve Böbrek Üstü Bezleri',
              outcomes: [
                { id: 'aytbio-endokrin-sistem-s3-k1', text: 'Tiroit ve paratiroit hormonlarının kan kalsiyumu ve metabolizma üzerindeki etkilerini açıklar.' },
                { id: 'aytbio-endokrin-sistem-s3-k2', text: 'Böbrek üstü bezi kabuk ve öz bölgesi hormonlarının etkilerini açıklar.' },
              ],
            },
            {
              id: 'aytbio-endokrin-sistem-s4',
              name: 'Pankreas, Eşeysel Bezler ve Diğer Bezler',
              outcomes: [
                { id: 'aytbio-endokrin-sistem-s4-k1', text: 'İnsülin ve glukagonun kan şekerini düzenlemesini açıklar.' },
                { id: 'aytbio-endokrin-sistem-s4-k2', text: 'Eşeysel bezler, epifiz ve timüs hormonlarının görevlerini açıklar.' },
              ],
            },
            {
              id: 'aytbio-endokrin-sistem-s5',
              name: 'Geri Bildirim ve Homeostazi',
              outcomes: [
                { id: 'aytbio-endokrin-sistem-s5-k1', text: 'Hormonların salgılanmasında negatif ve pozitif geri bildirimi örneklerle yorumlar.' },
                { id: 'aytbio-endokrin-sistem-s5-k2', text: 'Hormon fazlalığı ve eksikliğinde görülen rahatsızlıkları açıklar.' },
              ],
            },
          ],
        },
        {
          id: 'aytbio-duyu-organlari',
          name: 'Duyu Organları',
          grade: 11,
          subtopics: [
            {
              id: 'aytbio-duyu-organlari-s1',
              name: 'Göz ve Görme',
              outcomes: [
                { id: 'aytbio-duyu-organlari-s1-k1', text: 'Gözün yapısını ve görmenin gerçekleşmesini açıklar.' },
                { id: 'aytbio-duyu-organlari-s1-k2', text: 'Göz kusurlarını (miyopi, hipermetropi, astigmatizm) ve düzeltilme yollarını açıklar.' },
              ],
            },
            {
              id: 'aytbio-duyu-organlari-s2',
              name: 'Kulak, İşitme ve Denge',
              outcomes: [
                { id: 'aytbio-duyu-organlari-s2-k1', text: 'Kulağın yapısını, işitme ve dengenin sağlanmasını açıklar.' },
              ],
            },
            {
              id: 'aytbio-duyu-organlari-s3',
              name: 'Burun, Dil ve Deri',
              outcomes: [
                { id: 'aytbio-duyu-organlari-s3-k1', text: 'Koku, tat ve deri duyularının algılanmasını açıklar.' },
                { id: 'aytbio-duyu-organlari-s3-k2', text: 'Duyu organlarının sağlığını korumak için alınması gereken önlemleri açıklar.' },
              ],
            },
          ],
        },
        {
          id: 'aytbio-destek-hareket',
          name: 'Destek ve Hareket Sistemi',
          grade: 11,
          subtopics: [
            {
              id: 'aytbio-destek-hareket-s1',
              name: 'Kıkırdak ve Kemik Doku',
              outcomes: [
                { id: 'aytbio-destek-hareket-s1-k1', text: 'Kıkırdak ve kemik dokunun yapısını ve çeşitlerini açıklar.' },
                { id: 'aytbio-destek-hareket-s1-k2', text: 'Kemiğin uzama ve kalınlaşma yoluyla büyümesini açıklar.' },
              ],
            },
            {
              id: 'aytbio-destek-hareket-s2',
              name: 'Eklemler',
              outcomes: [
                { id: 'aytbio-destek-hareket-s2-k1', text: 'Oynamaz, yarı oynar ve oynar eklemleri örneklerle karşılaştırır.' },
              ],
            },
            {
              id: 'aytbio-destek-hareket-s3',
              name: 'Kas Doku ve Kas Kasılması',
              outcomes: [
                { id: 'aytbio-destek-hareket-s3-k1', text: 'Düz, kalp ve iskelet kasını yapı ve işleyiş bakımından karşılaştırır.' },
                { id: 'aytbio-destek-hareket-s3-k2', text: 'Kayan iplikler modeline göre kas kasılmasını açıklar.' },
                { id: 'aytbio-destek-hareket-s3-k3', text: 'Kasılma için gerekli enerjinin sağlanma yollarını açıklar.' },
              ],
            },
            {
              id: 'aytbio-destek-hareket-s4',
              name: 'Destek ve Hareket Sistemi Sağlığı',
              outcomes: [
                { id: 'aytbio-destek-hareket-s4-k1', text: 'Destek ve hareket sistemi rahatsızlıklarını ve korunma yollarını açıklar.' },
              ],
            },
          ],
        },
        {
          id: 'aytbio-sindirim',
          name: 'Sindirim Sistemi',
          grade: 11,
          priority: true,
          subtopics: [
            {
              id: 'aytbio-sindirim-s1',
              name: 'Sindirim Kanalı ve Mekanik Sindirim',
              outcomes: [
                { id: 'aytbio-sindirim-s1-k1', text: 'Sindirim kanalını oluşturan yapıları ve görevlerini açıklar.' },
                { id: 'aytbio-sindirim-s1-k2', text: 'Mekanik ve kimyasal sindirimi karşılaştırır.' },
              ],
            },
            {
              id: 'aytbio-sindirim-s2',
              name: 'Karbonhidrat, Protein ve Yağların Kimyasal Sindirimi',
              outcomes: [
                { id: 'aytbio-sindirim-s2-k1', text: 'Besinlerin sindirim kanalının bölümlerindeki kimyasal sindirimini enzimleriyle açıklar.' },
                { id: 'aytbio-sindirim-s2-k2', text: 'Sindirim enzimlerinin çalışma ortamlarını (pH, yer) yorumlar.' },
              ],
            },
            {
              id: 'aytbio-sindirim-s3',
              name: 'Yardımcı Organlar: Karaciğer ve Pankreas',
              outcomes: [
                { id: 'aytbio-sindirim-s3-k1', text: 'Karaciğer, safra ve pankreasın sindirimdeki görevlerini açıklar.' },
              ],
            },
            {
              id: 'aytbio-sindirim-s4',
              name: 'Emilim',
              outcomes: [
                { id: 'aytbio-sindirim-s4-k1', text: 'İnce bağırsakta besinlerin emilimini ve taşınma yollarını açıklar.' },
                { id: 'aytbio-sindirim-s4-k2', text: 'Kalın bağırsağın emilim ve dışkı oluşumundaki görevini açıklar.' },
              ],
            },
            {
              id: 'aytbio-sindirim-s5',
              name: 'Sindirimin Düzenlenmesi ve Sağlık',
              outcomes: [
                { id: 'aytbio-sindirim-s5-k1', text: 'Sindirimin sinirsel ve hormonal düzenlenmesini açıklar.' },
                { id: 'aytbio-sindirim-s5-k2', text: 'Sindirim sistemi rahatsızlıklarını ve sağlıklı beslenmenin önemini açıklar.' },
              ],
            },
          ],
        },
        {
          id: 'aytbio-dolasim-bagisiklik',
          name: 'Dolaşım Sistemi ve Bağışıklık',
          grade: 11,
          priority: true,
          subtopics: [
            {
              id: 'aytbio-dolasim-bagisiklik-s1',
              name: 'Kalbin Yapısı ve Çalışması',
              outcomes: [
                { id: 'aytbio-dolasim-bagisiklik-s1-k1', text: 'Kalbin yapısını, kapakçıklarını ve kalp döngüsünü açıklar.' },
                { id: 'aytbio-dolasim-bagisiklik-s1-k2', text: 'Kalpte uyartı iletim sistemini (SA düğüm, AV düğüm, His demeti, Purkinje lifleri) açıklar.' },
              ],
            },
            {
              id: 'aytbio-dolasim-bagisiklik-s2',
              name: 'Kan Damarları ve Kan Dolaşımı',
              outcomes: [
                { id: 'aytbio-dolasim-bagisiklik-s2-k1', text: 'Atardamar, toplardamar ve kılcal damarları yapı ve görev bakımından karşılaştırır.' },
                { id: 'aytbio-dolasim-bagisiklik-s2-k2', text: 'Büyük ve küçük kan dolaşımını açıklar.' },
                { id: 'aytbio-dolasim-bagisiklik-s2-k3', text: 'Kılcallarda madde alışverişini kan basıncı ve osmotik basınç ilişkisiyle yorumlar.' },
              ],
            },
            {
              id: 'aytbio-dolasim-bagisiklik-s3',
              name: 'Kan ve Kan Grupları',
              outcomes: [
                { id: 'aytbio-dolasim-bagisiklik-s3-k1', text: 'Kanın bileşenlerini ve görevlerini açıklar.' },
                { id: 'aytbio-dolasim-bagisiklik-s3-k2', text: 'Kanın pıhtılaşma mekanizmasını açıklar.' },
                { id: 'aytbio-dolasim-bagisiklik-s3-k3', text: 'ABO ve Rh kan grubu sistemlerini kan nakli açısından yorumlar.' },
              ],
            },
            {
              id: 'aytbio-dolasim-bagisiklik-s4',
              name: 'Lenf Dolaşımı',
              outcomes: [
                { id: 'aytbio-dolasim-bagisiklik-s4-k1', text: 'Lenf dolaşımının yapısını ve görevlerini açıklar.' },
              ],
            },
            {
              id: 'aytbio-dolasim-bagisiklik-s5',
              name: 'Vücudun Savunma Mekanizmaları',
              outcomes: [
                { id: 'aytbio-dolasim-bagisiklik-s5-k1', text: 'Doğal (spesifik olmayan) ve kazanılmış (spesifik) savunmayı karşılaştırır.' },
                { id: 'aytbio-dolasim-bagisiklik-s5-k2', text: 'Hümoral ve hücresel bağışıklıkta B ve T lenfositlerinin görevlerini açıklar.' },
                { id: 'aytbio-dolasim-bagisiklik-s5-k3', text: 'Aktif ve pasif bağışıklığı aşı ve serum örnekleriyle karşılaştırır.' },
              ],
            },
          ],
        },
        {
          id: 'aytbio-solunum-sistemi',
          name: 'Solunum Sistemi',
          grade: 11,
          priority: true,
          subtopics: [
            {
              id: 'aytbio-solunum-sistemi-s1',
              name: 'Solunum Sisteminin Yapısı',
              outcomes: [
                { id: 'aytbio-solunum-sistemi-s1-k1', text: 'Solunum yollarını ve akciğerlerin yapısını açıklar.' },
              ],
            },
            {
              id: 'aytbio-solunum-sistemi-s2',
              name: 'Soluk Alma ve Verme Mekanizması',
              outcomes: [
                { id: 'aytbio-solunum-sistemi-s2-k1', text: 'Soluk alma ve vermede diyafram ve kaburgalar arası kasların etkisini basınç–hacim ilişkisiyle açıklar.' },
                { id: 'aytbio-solunum-sistemi-s2-k2', text: 'Solunumun sinirsel ve kimyasal düzenlenmesini açıklar.' },
              ],
            },
            {
              id: 'aytbio-solunum-sistemi-s3',
              name: 'Alveol ve Dokularda Gaz Değişimi',
              outcomes: [
                { id: 'aytbio-solunum-sistemi-s3-k1', text: 'Alveol ve doku kılcallarında gaz değişimini kısmi basınç farkıyla açıklar.' },
              ],
            },
            {
              id: 'aytbio-solunum-sistemi-s4',
              name: 'Kanda Gazların Taşınması',
              outcomes: [
                { id: 'aytbio-solunum-sistemi-s4-k1', text: 'Oksijen ve karbondioksitin kanda taşınma yollarını açıklar.' },
                { id: 'aytbio-solunum-sistemi-s4-k2', text: 'Hemoglobinin oksijene bağlanmasını etkileyen faktörleri yorumlar.' },
              ],
            },
            {
              id: 'aytbio-solunum-sistemi-s5',
              name: 'Solunum Sistemi Sağlığı',
              outcomes: [
                { id: 'aytbio-solunum-sistemi-s5-k1', text: 'Solunum sistemi rahatsızlıklarını ve korunma yollarını açıklar.' },
              ],
            },
          ],
        },
        {
          id: 'aytbio-uriner-sistem',
          name: 'Üriner Sistem',
          grade: 11,
          priority: true,
          subtopics: [
            {
              id: 'aytbio-uriner-sistem-s1',
              name: 'Üriner Sistemin Yapısı',
              outcomes: [
                { id: 'aytbio-uriner-sistem-s1-k1', text: 'Böbreğin ve nefronun yapısını açıklar.' },
              ],
            },
            {
              id: 'aytbio-uriner-sistem-s2',
              name: 'İdrar Oluşumu',
              outcomes: [
                { id: 'aytbio-uriner-sistem-s2-k1', text: 'Süzülme, geri emilim ve salgılama evrelerini açıklar.' },
                { id: 'aytbio-uriner-sistem-s2-k2', text: 'Kan plazması, süzüntü ve idrarın bileşimini karşılaştırır.' },
              ],
            },
            {
              id: 'aytbio-uriner-sistem-s3',
              name: 'Böbreklerin Homeostazideki Rolü',
              outcomes: [
                { id: 'aytbio-uriner-sistem-s3-k1', text: 'ADH ve aldosteronun su–tuz dengesini düzenlemesini açıklar.' },
                { id: 'aytbio-uriner-sistem-s3-k2', text: 'Böbreklerin kan pH’ı ve basıncının düzenlenmesindeki rolünü açıklar.' },
              ],
            },
            {
              id: 'aytbio-uriner-sistem-s4',
              name: 'Üriner Sistem Sağlığı',
              outcomes: [
                { id: 'aytbio-uriner-sistem-s4-k1', text: 'Üriner sistem rahatsızlıklarını, diyaliz ve organ naklini açıklar.' },
              ],
            },
          ],
        },
        {
          id: 'aytbio-ureme-embriyonik',
          name: 'Üreme Sistemi ve Embriyonik Gelişim',
          grade: 11,
          subtopics: [
            {
              id: 'aytbio-ureme-embriyonik-s1',
              name: 'Erkek Üreme Sistemi',
              outcomes: [
                { id: 'aytbio-ureme-embriyonik-s1-k1', text: 'Erkek üreme sisteminin yapısını ve hormonal düzenlenmesini açıklar.' },
              ],
            },
            {
              id: 'aytbio-ureme-embriyonik-s2',
              name: 'Dişi Üreme Sistemi ve Menstrual Döngü',
              outcomes: [
                { id: 'aytbio-ureme-embriyonik-s2-k1', text: 'Dişi üreme sisteminin yapısını açıklar.' },
                { id: 'aytbio-ureme-embriyonik-s2-k2', text: 'Menstrual döngüde hormon ve yapı değişimlerini yorumlar.' },
              ],
            },
            {
              id: 'aytbio-ureme-embriyonik-s3',
              name: 'Döllenme ve Embriyonik Gelişim',
              outcomes: [
                { id: 'aytbio-ureme-embriyonik-s3-k1', text: 'Döllenme, bölünme, blastula, gastrula ve organogenez evrelerini açıklar.' },
                { id: 'aytbio-ureme-embriyonik-s3-k2', text: 'Embriyonik zarların ve plasentanın görevlerini açıklar.' },
              ],
            },
            {
              id: 'aytbio-ureme-embriyonik-s4',
              name: 'Doğum, Büyüme ve Üreme Sağlığı',
              outcomes: [
                { id: 'aytbio-ureme-embriyonik-s4-k1', text: 'Doğum sonrası gelişimi ve üreme sistemi sağlığını açıklar.' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-biyoloji-u2',
      name: 'Komünite ve Popülasyon Ekolojisi',
      topics: [
        {
          id: 'aytbio-komunite-populasyon',
          name: 'Komünite ve Popülasyon Ekolojisi',
          grade: 11,
          subtopics: [
            {
              id: 'aytbio-komunite-populasyon-s1',
              name: 'Komünite Yapısı ve Tür İlişkileri',
              outcomes: [
                { id: 'aytbio-komunite-populasyon-s1-k1', text: 'Komünitenin yapısını etkileyen faktörleri açıklar.' },
                { id: 'aytbio-komunite-populasyon-s1-k2', text: 'Türler arası ilişkileri (rekabet, av–avcı, simbiyoz) örneklerle açıklar.' },
              ],
            },
            {
              id: 'aytbio-komunite-populasyon-s2',
              name: 'Ekolojik Süksesyon',
              outcomes: [
                { id: 'aytbio-komunite-populasyon-s2-k1', text: 'Birincil ve ikincil süksesyonu karşılaştırır.' },
              ],
            },
            {
              id: 'aytbio-komunite-populasyon-s3',
              name: 'Popülasyon Dinamiği',
              outcomes: [
                { id: 'aytbio-komunite-populasyon-s3-k1', text: 'Popülasyon büyüklüğünü, yoğunluğunu ve dağılışını etkileyen faktörleri açıklar.' },
                { id: 'aytbio-komunite-populasyon-s3-k2', text: 'Üstel (J) ve lojistik (S) büyüme eğrilerini taşıma kapasitesiyle yorumlar.' },
                { id: 'aytbio-komunite-populasyon-s3-k3', text: 'Yaş piramitlerini popülasyonun geleceği açısından yorumlar.' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-biyoloji-u3',
      name: 'Genden Proteine',
      topics: [
        {
          id: 'aytbio-genden-proteine',
          name: 'Nükleik Asitler, Genetik Şifre ve Protein Sentezi',
          grade: 12,
          priority: true,
          subtopics: [
            {
              id: 'aytbio-genden-proteine-s1',
              name: 'Nükleik Asitlerin Keşfi ve Yapısı',
              outcomes: [
                { id: 'aytbio-genden-proteine-s1-k1', text: 'DNA’nın kalıtım materyali olduğunu gösteren çalışmaları açıklar.' },
                { id: 'aytbio-genden-proteine-s1-k2', text: 'DNA ve RNA’yı yapı ve görev bakımından karşılaştırır.' },
              ],
            },
            {
              id: 'aytbio-genden-proteine-s2',
              name: 'DNA’nın Kendini Eşlemesi',
              outcomes: [
                { id: 'aytbio-genden-proteine-s2-k1', text: 'DNA’nın yarı korunumlu eşlenmesini ve görev alan enzimleri açıklar.' },
                { id: 'aytbio-genden-proteine-s2-k2', text: 'Nükleotit ve bağ sayılarıyla ilgili hesaplamalar yapar.' },
              ],
            },
            {
              id: 'aytbio-genden-proteine-s3',
              name: 'Genetik Şifre',
              outcomes: [
                { id: 'aytbio-genden-proteine-s3-k1', text: 'Genetik şifrenin (kodon) özelliklerini açıklar.' },
              ],
            },
            {
              id: 'aytbio-genden-proteine-s4',
              name: 'Transkripsiyon ve Translasyon',
              outcomes: [
                { id: 'aytbio-genden-proteine-s4-k1', text: 'Transkripsiyon ile mRNA, tRNA ve rRNA sentezini açıklar.' },
                { id: 'aytbio-genden-proteine-s4-k2', text: 'Ribozomda translasyonun başlama, uzama ve bitiş evrelerini açıklar.' },
                { id: 'aytbio-genden-proteine-s4-k3', text: 'Protein sentezine ilişkin sayısal ilişkileri hesaplar.' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-biyoloji-u4',
      name: 'Canlılarda Enerji Dönüşümleri',
      topics: [
        {
          id: 'aytbio-fotosentez',
          name: 'Fotosentez',
          grade: 12,
          priority: true,
          subtopics: [
            {
              id: 'aytbio-fotosentez-s1',
              name: 'Canlılık ve Enerji, ATP',
              outcomes: [
                { id: 'aytbio-fotosentez-s1-k1', text: 'ATP’nin yapısını ve üretim yollarını (substrat düzeyinde, oksidatif, fotofosforilasyon) açıklar.' },
              ],
            },
            {
              id: 'aytbio-fotosentez-s2',
              name: 'Kloroplast ve Fotosentetik Pigmentler',
              outcomes: [
                { id: 'aytbio-fotosentez-s2-k1', text: 'Kloroplastın yapısını ve pigmentlerin ışığı soğurmasını açıklar.' },
              ],
            },
            {
              id: 'aytbio-fotosentez-s3',
              name: 'Işığa Bağımlı Reaksiyonlar',
              outcomes: [
                { id: 'aytbio-fotosentez-s3-k1', text: 'Devirli ve devirsiz fotofosforilasyonu açıklar.' },
                { id: 'aytbio-fotosentez-s3-k2', text: 'Suyun fotolizi ve oksijenin kaynağını açıklar.' },
              ],
            },
            {
              id: 'aytbio-fotosentez-s4',
              name: 'Işıktan Bağımsız Reaksiyonlar (Calvin Döngüsü)',
              outcomes: [
                { id: 'aytbio-fotosentez-s4-k1', text: 'Calvin döngüsünde CO₂ tutulması, indirgenme ve RuBP yenilenmesini açıklar.' },
              ],
            },
            {
              id: 'aytbio-fotosentez-s5',
              name: 'Fotosentez Hızını Etkileyen Faktörler',
              outcomes: [
                { id: 'aytbio-fotosentez-s5-k1', text: 'Işık şiddeti, CO₂ miktarı, sıcaklık gibi faktörlerin fotosentez hızına etkisini grafiklerle yorumlar.' },
                { id: 'aytbio-fotosentez-s5-k2', text: 'Fotosentezle ilgili deney düzeneklerini yorumlar.' },
              ],
            },
          ],
        },
        {
          id: 'aytbio-hucresel-solunum',
          name: 'Kemosentez ve Hücresel Solunum',
          grade: 12,
          priority: true,
          subtopics: [
            {
              id: 'aytbio-hucresel-solunum-s1',
              name: 'Kemosentez',
              outcomes: [
                { id: 'aytbio-hucresel-solunum-s1-k1', text: 'Kemosentezin gerçekleşmesini ve ekosistemdeki önemini açıklar.' },
              ],
            },
            {
              id: 'aytbio-hucresel-solunum-s2',
              name: 'Glikoliz ve Oksijensiz Solunum (Fermantasyon)',
              outcomes: [
                { id: 'aytbio-hucresel-solunum-s2-k1', text: 'Glikoliz evresini açıklar.' },
                { id: 'aytbio-hucresel-solunum-s2-k2', text: 'Etil alkol ve laktik asit fermantasyonunu karşılaştırır.' },
              ],
            },
            {
              id: 'aytbio-hucresel-solunum-s3',
              name: 'Oksijenli Solunum',
              outcomes: [
                { id: 'aytbio-hucresel-solunum-s3-k1', text: 'Krebs döngüsü ve elektron taşıma sistemini açıklar.' },
                { id: 'aytbio-hucresel-solunum-s3-k2', text: 'Oksijenli solunumda enerji verimini hesaplar ve yorumlar.' },
              ],
            },
            {
              id: 'aytbio-hucresel-solunum-s4',
              name: 'Fotosentez ve Solunumun Karşılaştırılması',
              outcomes: [
                { id: 'aytbio-hucresel-solunum-s4-k1', text: 'Fotosentez, kemosentez ve hücresel solunum arasındaki ilişkiyi yorumlar.' },
                { id: 'aytbio-hucresel-solunum-s4-k2', text: 'Solunumla ilgili deney düzeneklerini yorumlar.' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-biyoloji-u5',
      name: 'Bitki Biyolojisi',
      topics: [
        {
          id: 'aytbio-bitki-biyolojisi',
          name: 'Bitki Biyolojisi',
          grade: 12,
          priority: true,
          subtopics: [
            {
              id: 'aytbio-bitki-biyolojisi-s1',
              name: 'Bitkilerin Yapısı: Doku ve Organlar',
              outcomes: [
                { id: 'aytbio-bitki-biyolojisi-s1-k1', text: 'Bitkisel dokuları (meristem, koruyucu, temel, iletim) açıklar.' },
                { id: 'aytbio-bitki-biyolojisi-s1-k2', text: 'Kök, gövde ve yaprağın yapısını ve görevlerini açıklar.' },
              ],
            },
            {
              id: 'aytbio-bitki-biyolojisi-s2',
              name: 'Bitkilerde Madde Taşınması',
              outcomes: [
                { id: 'aytbio-bitki-biyolojisi-s2-k1', text: 'Kökte su ve mineral alımını açıklar.' },
                { id: 'aytbio-bitki-biyolojisi-s2-k2', text: 'Ksilemde su taşınmasını (kök basıncı, kohezyon–gerilim) ve floemde besin taşınmasını açıklar.' },
                { id: 'aytbio-bitki-biyolojisi-s2-k3', text: 'Stomaların açılıp kapanmasını ve terlemeyi etkileyen faktörleri yorumlar.' },
              ],
            },
            {
              id: 'aytbio-bitki-biyolojisi-s3',
              name: 'Bitki Hormonları ve Hareketleri',
              outcomes: [
                { id: 'aytbio-bitki-biyolojisi-s3-k1', text: 'Bitki hormonlarının büyüme ve gelişmedeki etkilerini açıklar.' },
                { id: 'aytbio-bitki-biyolojisi-s3-k2', text: 'Tropizma ve nasti hareketlerini örneklerle karşılaştırır.' },
              ],
            },
            {
              id: 'aytbio-bitki-biyolojisi-s4',
              name: 'Bitkilerde Eşeyli Üreme',
              outcomes: [
                { id: 'aytbio-bitki-biyolojisi-s4-k1', text: 'Çiçeğin yapısını, tozlaşma ve çift döllenmeyi açıklar.' },
                { id: 'aytbio-bitki-biyolojisi-s4-k2', text: 'Tohum ve meyve oluşumunu, tohumun çimlenmesini açıklar.' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-biyoloji-u6',
      name: 'Canlılar ve Çevre',
      topics: [
        {
          id: 'aytbio-canlilar-ve-cevre',
          name: 'Canlılar ve Çevre',
          grade: 12,
          subtopics: [
            {
              id: 'aytbio-canlilar-ve-cevre-s1',
              name: 'Canlılar ve Çevre Etkileşimi',
              outcomes: [
                { id: 'aytbio-canlilar-ve-cevre-s1-k1', text: 'Canlıların çevreyle etkileşimini ve adaptasyonlarını örneklerle açıklar.' },
              ],
            },
            {
              id: 'aytbio-canlilar-ve-cevre-s2',
              name: 'Güncel Çevre Sorunları',
              outcomes: [
                { id: 'aytbio-canlilar-ve-cevre-s2-k1', text: 'Küresel iklim değişikliği, biyolojik birikim ve habitat kaybı gibi çevre sorunlarının canlılara etkisini yorumlar.' },
              ],
            },
            {
              id: 'aytbio-canlilar-ve-cevre-s3',
              name: 'Sürdürülebilirlik ve Biyoçeşitliliğin Korunması',
              outcomes: [
                { id: 'aytbio-canlilar-ve-cevre-s3-k1', text: 'Doğal kaynakların sürdürülebilir kullanımına yönelik çözüm önerilerini değerlendirir.' },
                { id: 'aytbio-canlilar-ve-cevre-s3-k2', text: 'Biyoçeşitliliğin korunmasının önemini açıklar.' },
              ],
            },
          ],
        },
      ],
    },
  ],
};
