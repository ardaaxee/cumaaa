import type { Subject } from '../../domain/types';

export const subject: Subject = {
  id: 'tyt-fizik',
  exam: 'TYT',
  name: "TYT Fizik",
  icon: "↗",
  examQuestionCount: 7,
  note: "TYT Fen Bilimleri testinin fizik bölümü; MEB 2018 Fizik 9 ve 10. sınıf programı kapsamındadır.",
  units: [
    {
      id: 'tyt-fizik-u1',
      name: "Fizik Bilimine Giriş",
      topics: [
        {
          id: 'tytfiz-fizik-bilimine-giris',
          name: "Fizik Bilimine Giriş",
          grade: 9,
          subtopics: [
            {
              id: 'tytfiz-fizik-bilimine-giris-s1',
              name: "Fiziğin Doğası ve Alt Dalları",
              outcomes: [
                { id: 'tytfiz-fizik-bilimine-giris-s1-k1', text: "Fizik biliminin önemini ve doğayı anlamadaki rolünü açıklar." },
                { id: 'tytfiz-fizik-bilimine-giris-s1-k2', text: "Fiziğin alt dallarını inceleme alanlarıyla eşleştirir." },
              ],
            },
            {
              id: 'tytfiz-fizik-bilimine-giris-s2',
              name: "Fiziksel Büyüklükler ve Birimler",
              outcomes: [
                { id: 'tytfiz-fizik-bilimine-giris-s2-k1', text: "Fiziksel büyüklükleri temel ve türetilmiş büyüklükler olarak sınıflandırır." },
                { id: 'tytfiz-fizik-bilimine-giris-s2-k2', text: "Skaler ve vektörel büyüklükleri ayırt eder." },
                { id: 'tytfiz-fizik-bilimine-giris-s2-k3', text: "Türetilmiş birimleri SI temel birimleri cinsinden ifade eder." },
              ],
            },
            {
              id: 'tytfiz-fizik-bilimine-giris-s3',
              name: "Bilimsel Yöntem ve Ölçme",
              outcomes: [
                { id: 'tytfiz-fizik-bilimine-giris-s3-k1', text: "Bilimsel yöntemin basamaklarını ve hipotez, teori, yasa kavramlarını açıklar." },
                { id: 'tytfiz-fizik-bilimine-giris-s3-k2', text: "Bir deneyde bağımlı, bağımsız ve kontrol edilen değişkenleri belirler." },
                { id: 'tytfiz-fizik-bilimine-giris-s3-k3', text: "Ölçmenin anlamını ve ölçümlerde hatanın kaçınılmazlığını yorumlar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-fizik-u2',
      name: "Madde ve Özellikleri",
      topics: [
        {
          id: 'tytfiz-madde-ve-ozellikleri',
          name: "Madde ve Özellikleri",
          grade: 9,
          subtopics: [
            {
              id: 'tytfiz-madde-ve-ozellikleri-s1',
              name: "Kütle, Hacim ve Özkütle",
              outcomes: [
                { id: 'tytfiz-madde-ve-ozellikleri-s1-k1', text: "Kütle ve hacim kavramlarını açıklar, hacim ölçme yollarını karşılaştırır." },
                { id: 'tytfiz-madde-ve-ozellikleri-s1-k2', text: "Özkütleyi kütle ve hacim ilişkisiyle hesaplar, kütle-hacim grafiklerini yorumlar." },
                { id: 'tytfiz-madde-ve-ozellikleri-s1-k3', text: "Karışımların özkütlesini hesaplar." },
              ],
            },
            {
              id: 'tytfiz-madde-ve-ozellikleri-s2',
              name: "Dayanıklılık",
              outcomes: [
                { id: 'tytfiz-madde-ve-ozellikleri-s2-k1', text: "Dayanıklılığın kesit alanı/hacim oranına bağlı olduğunu açıklar." },
                { id: 'tytfiz-madde-ve-ozellikleri-s2-k2', text: "Boyut değişiminin dayanıklılığa etkisini canlı ve cansız örneklerle yorumlar." },
              ],
            },
            {
              id: 'tytfiz-madde-ve-ozellikleri-s3',
              name: "Adezyon ve Kohezyon",
              outcomes: [
                { id: 'tytfiz-madde-ve-ozellikleri-s3-k1', text: "Adezyon ve kohezyon kuvvetlerini örneklerle açıklar." },
                { id: 'tytfiz-madde-ve-ozellikleri-s3-k2', text: "Sıvı yüzeyinin kap çeperinde aldığı şekli adezyon-kohezyon ilişkisiyle yorumlar." },
              ],
            },
            {
              id: 'tytfiz-madde-ve-ozellikleri-s4',
              name: "Yüzey Gerilimi ve Kılcallık",
              outcomes: [
                { id: 'tytfiz-madde-ve-ozellikleri-s4-k1', text: "Yüzey gerilimini etkileyen değişkenleri açıklar." },
                { id: 'tytfiz-madde-ve-ozellikleri-s4-k2', text: "Kılcallık olayını tüp çapı ve adezyon-kohezyon ilişkisiyle yorumlar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-fizik-u3',
      name: "Hareket ve Kuvvet",
      topics: [
        {
          id: 'tytfiz-hareket-ve-kuvvet',
          name: "Hareket ve Kuvvet",
          grade: 9,
          subtopics: [
            {
              id: 'tytfiz-hareket-ve-kuvvet-s1',
              name: "Konum, Yer Değiştirme, Sürat ve Hız",
              outcomes: [
                { id: 'tytfiz-hareket-ve-kuvvet-s1-k1', text: "Konum, alınan yol ve yer değiştirme kavramlarını ayırt eder." },
                { id: 'tytfiz-hareket-ve-kuvvet-s1-k2', text: "Ortalama sürat ve ortalama hızı hesaplar." },
              ],
            },
            {
              id: 'tytfiz-hareket-ve-kuvvet-s2',
              name: "Düzgün ve İvmeli Doğrusal Hareket Grafikleri",
              outcomes: [
                { id: 'tytfiz-hareket-ve-kuvvet-s2-k1', text: "Konum-zaman ve hız-zaman grafiklerini yorumlar." },
                { id: 'tytfiz-hareket-ve-kuvvet-s2-k2', text: "Hız-zaman grafiğinin altındaki alandan yer değiştirmeyi, eğiminden ivmeyi hesaplar." },
              ],
            },
            {
              id: 'tytfiz-hareket-ve-kuvvet-s3',
              name: "Newton’un Hareket Yasaları",
              outcomes: [
                { id: 'tytfiz-hareket-ve-kuvvet-s3-k1', text: "Eylemsizlik, dinamiğin temel prensibi ve etki-tepki yasalarını açıklar." },
                { id: 'tytfiz-hareket-ve-kuvvet-s3-k2', text: "Net kuvvet, kütle ve ivme arasındaki ilişkiyi kullanarak problem çözer." },
              ],
            },
            {
              id: 'tytfiz-hareket-ve-kuvvet-s4',
              name: "Sürtünme Kuvveti",
              outcomes: [
                { id: 'tytfiz-hareket-ve-kuvvet-s4-k1', text: "Sürtünme kuvvetini etkileyen değişkenleri açıklar ve sürtünme kuvvetini hesaplar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-fizik-u4',
      name: "Enerji",
      topics: [
        {
          id: 'tytfiz-is-guc-enerji',
          name: "İş, Güç ve Enerji",
          grade: 9,
          subtopics: [
            {
              id: 'tytfiz-is-guc-enerji-s1',
              name: "İş ve Güç",
              outcomes: [
                { id: 'tytfiz-is-guc-enerji-s1-k1', text: "Fiziksel anlamda işi tanımlar ve kuvvet-yol grafiğinden hesaplar." },
                { id: 'tytfiz-is-guc-enerji-s1-k2', text: "Gücü iş ve zaman ilişkisiyle hesaplar." },
              ],
            },
            {
              id: 'tytfiz-is-guc-enerji-s2',
              name: "Mekanik Enerji",
              outcomes: [
                { id: 'tytfiz-is-guc-enerji-s2-k1', text: "Kinetik ve potansiyel enerjiyi etkileyen değişkenleri açıklar ve hesaplar." },
                { id: 'tytfiz-is-guc-enerji-s2-k2', text: "Sürtünmesiz ortamda mekanik enerjinin korunumunu kullanarak problem çözer." },
              ],
            },
            {
              id: 'tytfiz-is-guc-enerji-s3',
              name: "Enerji Dönüşümleri ve Verim",
              outcomes: [
                { id: 'tytfiz-is-guc-enerji-s3-k1', text: "Sürtünmeli ortamda enerjinin bir kısmının ısıya dönüştüğünü açıklar ve hesaplar." },
                { id: 'tytfiz-is-guc-enerji-s3-k2', text: "Verimi yararlı enerji ve harcanan enerji oranıyla hesaplar." },
              ],
            },
            {
              id: 'tytfiz-is-guc-enerji-s4',
              name: "Enerji Kaynakları",
              outcomes: [
                { id: 'tytfiz-is-guc-enerji-s4-k1', text: "Yenilenebilir ve yenilenemez enerji kaynaklarını avantaj ve dezavantajlarıyla karşılaştırır." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-fizik-u5',
      name: "Isı ve Sıcaklık",
      topics: [
        {
          id: 'tytfiz-isi-sicaklik-genlesme',
          name: "Isı, Sıcaklık ve Genleşme",
          grade: 9,
          subtopics: [
            {
              id: 'tytfiz-isi-sicaklik-genlesme-s1',
              name: "Isı, Sıcaklık ve Termometreler",
              outcomes: [
                { id: 'tytfiz-isi-sicaklik-genlesme-s1-k1', text: "Isı, sıcaklık ve iç enerji kavramlarını ayırt eder." },
                { id: 'tytfiz-isi-sicaklik-genlesme-s1-k2', text: "Farklı termometre ölçekleri arasında dönüşüm yapar." },
              ],
            },
            {
              id: 'tytfiz-isi-sicaklik-genlesme-s2',
              name: "Öz Isı, Isı Sığası ve Isıl Denge",
              outcomes: [
                { id: 'tytfiz-isi-sicaklik-genlesme-s2-k1', text: "Q = m·c·ΔT bağıntısını kullanarak ısı alışverişini hesaplar." },
                { id: 'tytfiz-isi-sicaklik-genlesme-s2-k2', text: "Isıl denge durumunda son sıcaklığı hesaplar." },
              ],
            },
            {
              id: 'tytfiz-isi-sicaklik-genlesme-s3',
              name: "Hâl Değişimi",
              outcomes: [
                { id: 'tytfiz-isi-sicaklik-genlesme-s3-k1', text: "Hâl değişimi sırasında sıcaklığın sabit kaldığını açıklar ve erime/buharlaşma ısısını hesaplar." },
                { id: 'tytfiz-isi-sicaklik-genlesme-s3-k2', text: "Sıcaklık-ısı grafiklerini yorumlar." },
              ],
            },
            {
              id: 'tytfiz-isi-sicaklik-genlesme-s4',
              name: "Isı Aktarım Yolları",
              outcomes: [
                { id: 'tytfiz-isi-sicaklik-genlesme-s4-k1', text: "İletim, konveksiyon ve ışıma yollarını günlük hayattan örneklerle açıklar." },
              ],
            },
            {
              id: 'tytfiz-isi-sicaklik-genlesme-s5',
              name: "Genleşme",
              outcomes: [
                { id: 'tytfiz-isi-sicaklik-genlesme-s5-k1', text: "Katılarda boyca, yüzeyce ve hacimce genleşmeyi etkileyen değişkenleri açıklar." },
                { id: 'tytfiz-isi-sicaklik-genlesme-s5-k2', text: "Suyun özel genleşme davranışını ve günlük hayattaki sonuçlarını yorumlar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-fizik-u6',
      name: "Elektrostatik",
      topics: [
        {
          id: 'tytfiz-elektrostatik',
          name: "Elektrostatik",
          grade: 10,
          subtopics: [
            {
              id: 'tytfiz-elektrostatik-s1',
              name: "Elektrik Yükü ve Elektriklenme",
              outcomes: [
                { id: 'tytfiz-elektrostatik-s1-k1', text: "Sürtünme, dokunma ve etki ile elektriklenmeyi açıklar." },
                { id: 'tytfiz-elektrostatik-s1-k2', text: "Özdeş iletken kürelerin dokundurulmasında son yükleri hesaplar." },
              ],
            },
            {
              id: 'tytfiz-elektrostatik-s2',
              name: "İletken, Yalıtkan, Topraklama ve Elektroskop",
              outcomes: [
                { id: 'tytfiz-elektrostatik-s2-k1', text: "Elektroskop yapraklarındaki değişimi yorumlayarak cismin yükü hakkında çıkarım yapar." },
                { id: 'tytfiz-elektrostatik-s2-k2', text: "Topraklama ve sivri uçların günlük hayattaki uygulamalarını açıklar." },
              ],
            },
            {
              id: 'tytfiz-elektrostatik-s3',
              name: "Coulomb Kuvveti",
              outcomes: [
                { id: 'tytfiz-elektrostatik-s3-k1', text: "Yüklü cisimler arasındaki elektriksel kuvveti etkileyen değişkenleri açıklar ve hesaplar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-fizik-u7',
      name: "Elektrik ve Manyetizma",
      topics: [
        {
          id: 'tytfiz-elektrik-akimi',
          name: "Elektrik Akımı ve Devreler",
          grade: 10,
          priority: true,
          subtopics: [
            {
              id: 'tytfiz-elektrik-akimi-s1',
              name: "Elektrik Akımı ve Direnç",
              outcomes: [
                { id: 'tytfiz-elektrik-akimi-s1-k1', text: "Elektrik akımını yük ve zaman ilişkisiyle hesaplar." },
                { id: 'tytfiz-elektrik-akimi-s1-k2', text: "Bir iletkenin direncini etkileyen değişkenleri açıklar." },
              ],
            },
            {
              id: 'tytfiz-elektrik-akimi-s2',
              name: "Ohm Yasası",
              outcomes: [
                { id: 'tytfiz-elektrik-akimi-s2-k1', text: "Gerilim, akım ve direnç arasındaki ilişkiyi kullanarak hesaplama yapar." },
                { id: 'tytfiz-elektrik-akimi-s2-k2', text: "Gerilim-akım grafiklerini yorumlar." },
              ],
            },
            {
              id: 'tytfiz-elektrik-akimi-s3',
              name: "Dirençlerin Seri ve Paralel Bağlanması",
              outcomes: [
                { id: 'tytfiz-elektrik-akimi-s3-k1', text: "Seri ve paralel bağlı dirençlerin eşdeğer direncini hesaplar." },
                { id: 'tytfiz-elektrik-akimi-s3-k2', text: "Karışık devrelerde kol akımlarını ve gerilimleri hesaplar." },
              ],
            },
            {
              id: 'tytfiz-elektrik-akimi-s4',
              name: "Üreteçler",
              outcomes: [
                { id: 'tytfiz-elektrik-akimi-s4-k1', text: "Seri ve paralel bağlı üreteçlerin eşdeğer gerilimini hesaplar." },
                { id: 'tytfiz-elektrik-akimi-s4-k2', text: "İç direnci olan üreteçte uç gerilimini hesaplar." },
              ],
            },
            {
              id: 'tytfiz-elektrik-akimi-s5',
              name: "Elektrik Enerjisi ve Güç",
              outcomes: [
                { id: 'tytfiz-elektrik-akimi-s5-k1', text: "Elektrik enerjisi ve gücünü hesaplar, kilovatsaat birimini kullanır." },
                { id: 'tytfiz-elektrik-akimi-s5-k2', text: "Ev devrelerinde sigorta ve güvenli kullanım koşullarını yorumlar." },
              ],
            },
            {
              id: 'tytfiz-elektrik-akimi-s6',
              name: "Lamba Parlaklığı",
              outcomes: [
                { id: 'tytfiz-elektrik-akimi-s6-k1', text: "Lamba parlaklığını lambanın harcadığı güçle ilişkilendirir." },
                { id: 'tytfiz-elektrik-akimi-s6-k2', text: "Devrede anahtar açma-kapama veya lamba kopması durumunda parlaklık değişimlerini yorumlar." },
              ],
            },
          ],
        },
        {
          id: 'tytfiz-manyetizma-temelleri',
          name: "Mıknatıslar ve Manyetizma Temelleri",
          grade: 10,
          subtopics: [
            {
              id: 'tytfiz-manyetizma-temelleri-s1',
              name: "Mıknatıslar ve Manyetik Alan",
              outcomes: [
                { id: 'tytfiz-manyetizma-temelleri-s1-k1', text: "Mıknatısların kutuplarını ve birbirleriyle etkileşimlerini açıklar." },
                { id: 'tytfiz-manyetizma-temelleri-s1-k2', text: "Manyetik alan çizgilerinin özelliklerini yorumlar." },
              ],
            },
            {
              id: 'tytfiz-manyetizma-temelleri-s2',
              name: "Akım ve Manyetik Alan",
              outcomes: [
                { id: 'tytfiz-manyetizma-temelleri-s2-k1', text: "Akım geçen düz telin çevresinde oluşan manyetik alanın yönünü sağ el kuralıyla bulur." },
                { id: 'tytfiz-manyetizma-temelleri-s2-k2', text: "Manyetik alan şiddetini etkileyen değişkenleri nitel olarak açıklar." },
                { id: 'tytfiz-manyetizma-temelleri-s2-k3', text: "Elektromıknatısı güçlendiren etkenleri açıklar." },
              ],
            },
            {
              id: 'tytfiz-manyetizma-temelleri-s3',
              name: "Pusula ve Dünya’nın Manyetik Alanı",
              outcomes: [
                { id: 'tytfiz-manyetizma-temelleri-s3-k1', text: "Pusulanın çalışma ilkesini ve Dünya’nın manyetik alanını açıklar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-fizik-u8',
      name: "Basınç ve Kaldırma Kuvveti",
      topics: [
        {
          id: 'tytfiz-basinc-kaldirma',
          name: "Basınç ve Kaldırma Kuvveti",
          grade: 10,
          subtopics: [
            {
              id: 'tytfiz-basinc-kaldirma-s1',
              name: "Katı Basıncı",
              outcomes: [
                { id: 'tytfiz-basinc-kaldirma-s1-k1', text: "Katıların basıncını kuvvet ve yüzey alanı ilişkisiyle hesaplar." },
              ],
            },
            {
              id: 'tytfiz-basinc-kaldirma-s2',
              name: "Sıvı Basıncı ve Pascal İlkesi",
              outcomes: [
                { id: 'tytfiz-basinc-kaldirma-s2-k1', text: "Durgun sıvıların basıncını derinlik ve özkütle ile hesaplar." },
                { id: 'tytfiz-basinc-kaldirma-s2-k2', text: "Pascal ilkesini hidrolik sistemlerde uygular." },
              ],
            },
            {
              id: 'tytfiz-basinc-kaldirma-s3',
              name: "Açık Hava Basıncı ve Gaz Basıncı",
              outcomes: [
                { id: 'tytfiz-basinc-kaldirma-s3-k1', text: "Açık hava basıncını etkileyen değişkenleri ve Torricelli deneyini açıklar." },
              ],
            },
            {
              id: 'tytfiz-basinc-kaldirma-s4',
              name: "Kaldırma Kuvveti",
              outcomes: [
                { id: 'tytfiz-basinc-kaldirma-s4-k1', text: "Kaldırma kuvvetini batan hacim ve sıvı özkütlesiyle hesaplar." },
                { id: 'tytfiz-basinc-kaldirma-s4-k2', text: "Yüzme, askıda kalma ve batma koşullarını yorumlar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-fizik-u9',
      name: "Dalgalar",
      topics: [
        {
          id: 'tytfiz-dalgalar',
          name: "Dalgalar",
          grade: 10,
          subtopics: [
            {
              id: 'tytfiz-dalgalar-s1',
              name: "Dalga Kavramları",
              outcomes: [
                { id: 'tytfiz-dalgalar-s1-k1', text: "Enine ve boyuna dalgaları; genlik, dalga boyu, frekans ve periyot kavramlarını açıklar." },
                { id: 'tytfiz-dalgalar-s1-k2', text: "Dalga hızı, frekans ve dalga boyu ilişkisini kullanarak hesaplama yapar." },
              ],
            },
            {
              id: 'tytfiz-dalgalar-s2',
              name: "Yay Dalgaları",
              outcomes: [
                { id: 'tytfiz-dalgalar-s2-k1', text: "Yay dalgalarının hızını etkileyen değişkenleri açıklar." },
                { id: 'tytfiz-dalgalar-s2-k2', text: "Atmaların sabit ve serbest uçtan yansımasını, farklı yaylara geçişini yorumlar." },
              ],
            },
            {
              id: 'tytfiz-dalgalar-s3',
              name: "Su Dalgaları",
              outcomes: [
                { id: 'tytfiz-dalgalar-s3-k1', text: "Su dalgalarının derinlik değişiminde hız ve dalga boyu değişimini yorumlar." },
              ],
            },
            {
              id: 'tytfiz-dalgalar-s4',
              name: "Ses Dalgaları",
              outcomes: [
                { id: 'tytfiz-dalgalar-s4-k1', text: "Sesin yayılma koşullarını, yüksekliğini ve şiddetini açıklar." },
                { id: 'tytfiz-dalgalar-s4-k2', text: "Yankı olayını kullanarak uzaklık hesaplar." },
              ],
            },
            {
              id: 'tytfiz-dalgalar-s5',
              name: "Deprem Dalgaları",
              outcomes: [
                { id: 'tytfiz-dalgalar-s5-k1', text: "P ve S deprem dalgalarının özelliklerini karşılaştırır ve varış farkından uzaklık hesaplar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-fizik-u10',
      name: "Optik",
      topics: [
        {
          id: 'tytfiz-optik',
          name: "Optik",
          grade: 10,
          subtopics: [
            {
              id: 'tytfiz-optik-s1',
              name: "Aydınlanma ve Gölge",
              outcomes: [
                { id: 'tytfiz-optik-s1-k1', text: "Aydınlanma şiddetini ışık şiddeti ve uzaklıkla ilişkilendirir." },
                { id: 'tytfiz-optik-s1-k2', text: "Tam gölge ve yarı gölge oluşumunu açıklar." },
              ],
            },
            {
              id: 'tytfiz-optik-s2',
              name: "Yansıma ve Düzlem Ayna",
              outcomes: [
                { id: 'tytfiz-optik-s2-k1', text: "Yansıma kanunlarını ve düzlem aynada görüntü özelliklerini açıklar." },
                { id: 'tytfiz-optik-s2-k2', text: "Düzlem aynada görme alanı ve boy ilişkilerini hesaplar." },
              ],
            },
            {
              id: 'tytfiz-optik-s3',
              name: "Küresel Aynalar",
              outcomes: [
                { id: 'tytfiz-optik-s3-k1', text: "Çukur ve tümsek aynalarda özel ışınları kullanarak görüntünün yerini ve özelliklerini belirler." },
              ],
            },
            {
              id: 'tytfiz-optik-s4',
              name: "Kırılma ve Mercekler",
              outcomes: [
                { id: 'tytfiz-optik-s4-k1', text: "Işığın kırılmasında hız, frekans ve dalga boyu değişimini açıklar." },
                { id: 'tytfiz-optik-s4-k2', text: "İnce ve kalın kenarlı merceklerin özelliklerini ve göz kusurlarının düzeltilmesini açıklar." },
              ],
            },
            {
              id: 'tytfiz-optik-s5',
              name: "Prizmalar ve Renk",
              outcomes: [
                { id: 'tytfiz-optik-s5-k1', text: "Beyaz ışığın prizmada renklerine ayrılmasını açıklar." },
                { id: 'tytfiz-optik-s5-k2', text: "Cisimlerin farklı renkteki ışıklar altında görünen renklerini yorumlar." },
              ],
            },
          ],
        },
      ],
    },
  ],
};
