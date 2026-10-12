import type { Subject } from '../../domain/types';

export const subject: Subject = {
  id: 'tyt-cografya',
  exam: 'TYT',
  name: 'TYT Coğrafya',
  icon: "◎",
  examQuestionCount: 5,
  note: "TYT Sosyal Bilimler testinin coğrafya bölümü. MEB 2018 Coğrafya 9 ve 10. sınıf öğretim programlarının mantığıyla düzenlenmiştir.",
  units: [
    {
      id: 'tyt-cografya-u1',
      name: "Doğal Sistemler: Dünya, Harita ve İklim",
      topics: [
        {
          id: 'tytcog-doga-ve-insan',
          name: "Doğa ve İnsan",
          grade: 9,
          subtopics: [
            {
              id: 'tytcog-doga-ve-insan-s1',
              name: "Coğrafyanın Konusu ve Bölümleri",
              outcomes: [
                { id: 'tytcog-doga-ve-insan-s1-k1', text: "Coğrafyanın konusunu ve fiziki, beşerî ve ekonomik coğrafya gibi bölümlerini açıklar." },
                { id: 'tytcog-doga-ve-insan-s1-k2', text: "Coğrafyanın gelişiminde önemli bilim insanlarının katkılarını tanır." },
              ],
            },
            {
              id: 'tytcog-doga-ve-insan-s2',
              name: "Coğrafi İlkeler",
              outcomes: [
                { id: 'tytcog-doga-ve-insan-s2-k1', text: "Dağılış, bağlantı (ilişki) ve nedensellik ilkelerini örneklerle açıklar." },
              ],
            },
            {
              id: 'tytcog-doga-ve-insan-s3',
              name: "Doğal Sistemler ve İnsan Etkileşimi",
              outcomes: [
                { id: 'tytcog-doga-ve-insan-s3-k1', text: "Atmosfer, hidrosfer, litosfer ve biyosferin birbirleriyle etkileşimini açıklar." },
                { id: 'tytcog-doga-ve-insan-s3-k2', text: "İnsan ile doğal ortam arasındaki karşılıklı etkileşimi örneklerle yorumlar." },
              ],
            },
          ],
        },
        {
          id: 'tytcog-dunyanin-sekli-hareketleri',
          name: "Dünya’nın Şekli ve Hareketleri",
          grade: 9,
          subtopics: [
            {
              id: 'tytcog-dunyanin-sekli-hareketleri-s1',
              name: "Dünya’nın Şekli ve Sonuçları",
              outcomes: [
                { id: 'tytcog-dunyanin-sekli-hareketleri-s1-k1', text: "Dünya’nın şeklinin geliş açısı, sıcaklık ve çizgisel hız üzerindeki sonuçlarını açıklar." },
              ],
            },
            {
              id: 'tytcog-dunyanin-sekli-hareketleri-s2',
              name: "Coğrafi Konum: Enlem ve Boylam",
              outcomes: [
                { id: 'tytcog-dunyanin-sekli-hareketleri-s2-k1', text: "Paralel ve meridyenlerin özelliklerini açıklar." },
                { id: 'tytcog-dunyanin-sekli-hareketleri-s2-k2', text: "Boylam farkından yararlanarak yerel saat farkını hesaplar." },
                { id: 'tytcog-dunyanin-sekli-hareketleri-s2-k3', text: "Mutlak konum ile göreceli konum arasındaki farkı açıklar." },
              ],
            },
            {
              id: 'tytcog-dunyanin-sekli-hareketleri-s3',
              name: "Günlük Hareket ve Sonuçları",
              outcomes: [
                { id: 'tytcog-dunyanin-sekli-hareketleri-s3-k1', text: "Dünya’nın günlük hareketinin sonuçlarını açıklar." },
              ],
            },
            {
              id: 'tytcog-dunyanin-sekli-hareketleri-s4',
              name: "Yıllık Hareket ve Mevsimler",
              outcomes: [
                { id: 'tytcog-dunyanin-sekli-hareketleri-s4-k1', text: "Eksen eğikliği ve yıllık hareketin mevsimleri oluşturmasını açıklar." },
                { id: 'tytcog-dunyanin-sekli-hareketleri-s4-k2', text: "21 Mart, 21 Haziran, 23 Eylül ve 21 Aralık tarihlerinde Güneş ışınlarının geliş durumunu yorumlar." },
              ],
            },
          ],
        },
        {
          id: 'tytcog-harita-bilgisi',
          name: "Harita Bilgisi",
          grade: 9,
          subtopics: [
            {
              id: 'tytcog-harita-bilgisi-s1',
              name: "Harita ve Harita Unsurları",
              outcomes: [
                { id: 'tytcog-harita-bilgisi-s1-k1', text: "Haritanın temel unsurlarını ve projeksiyon türlerinin özelliklerini açıklar." },
              ],
            },
            {
              id: 'tytcog-harita-bilgisi-s2',
              name: "Ölçek",
              outcomes: [
                { id: 'tytcog-harita-bilgisi-s2-k1', text: "Kesir ve çizgi ölçekten yararlanarak harita uzunluğu ile gerçek uzunluk arasında hesaplama yapar." },
                { id: 'tytcog-harita-bilgisi-s2-k2', text: "Büyük ve küçük ölçekli haritaların özelliklerini karşılaştırır." },
              ],
            },
            {
              id: 'tytcog-harita-bilgisi-s3',
              name: "Yer Şekillerinin Haritada Gösterilmesi",
              outcomes: [
                { id: 'tytcog-harita-bilgisi-s3-k1', text: "İzohips haritalarında yükselti, eğim ve yer şekillerini yorumlar." },
                { id: 'tytcog-harita-bilgisi-s3-k2', text: "Renklendirme ve profil yöntemlerini açıklar." },
              ],
            },
          ],
        },
        {
          id: 'tytcog-iklim-bilgisi',
          name: "İklim Bilgisi",
          grade: 9,
          subtopics: [
            {
              id: 'tytcog-iklim-bilgisi-s1',
              name: "Atmosfer ve Sıcaklık",
              outcomes: [
                { id: 'tytcog-iklim-bilgisi-s1-k1', text: "Atmosferin katmanlarını ve özelliklerini açıklar." },
                { id: 'tytcog-iklim-bilgisi-s1-k2', text: "Sıcaklığın dağılışını etkileyen faktörleri açıklar ve yükseltiye bağlı sıcaklık değişimini hesaplar." },
              ],
            },
            {
              id: 'tytcog-iklim-bilgisi-s2',
              name: "Basınç ve Rüzgârlar",
              outcomes: [
                { id: 'tytcog-iklim-bilgisi-s2-k1', text: "Basınç merkezlerinin oluşumunu ve rüzgârların esiş yönünü açıklar." },
              ],
            },
            {
              id: 'tytcog-iklim-bilgisi-s3',
              name: "Nem ve Yağış",
              outcomes: [
                { id: 'tytcog-iklim-bilgisi-s3-k1', text: "Mutlak, maksimum ve bağıl nem kavramlarını açıklar." },
                { id: 'tytcog-iklim-bilgisi-s3-k2', text: "Yağış türlerini oluşum koşullarıyla açıklar." },
              ],
            },
            {
              id: 'tytcog-iklim-bilgisi-s4',
              name: "İklim Tipleri ve Türkiye’nin İklimi",
              outcomes: [
                { id: 'tytcog-iklim-bilgisi-s4-k1', text: "Sıcaklık ve yağış verilerinden iklim tipini belirler." },
                { id: 'tytcog-iklim-bilgisi-s4-k2', text: "Türkiye’de görülen iklim tiplerini ve dağılışını yorumlar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-cografya-u2',
      name: "Doğal Sistemler: Yer Şekilleri, Su, Toprak ve Bitki",
      topics: [
        {
          id: 'tytcog-yer-sekilleri',
          name: "Yerin Yapısı ve Yer Şekilleri",
          grade: 10,
          subtopics: [
            {
              id: 'tytcog-yer-sekilleri-s1',
              name: "Yerin Yapısı ve Jeolojik Zamanlar",
              outcomes: [
                { id: 'tytcog-yer-sekilleri-s1-k1', text: "Yerin iç yapısını ve jeolojik zamanlarda meydana gelen önemli olayları açıklar." },
              ],
            },
            {
              id: 'tytcog-yer-sekilleri-s2',
              name: "İç Kuvvetler",
              outcomes: [
                { id: 'tytcog-yer-sekilleri-s2-k1', text: "Orojenez, epirojenez, volkanizma ve depremlerin yer şekillerine etkisini açıklar." },
              ],
            },
            {
              id: 'tytcog-yer-sekilleri-s3',
              name: "Kayaçlar",
              outcomes: [
                { id: 'tytcog-yer-sekilleri-s3-k1', text: "Kayaçları oluşumlarına göre sınıflandırır." },
              ],
            },
            {
              id: 'tytcog-yer-sekilleri-s4',
              name: "Dış Kuvvetler ve Oluşturdukları Şekiller",
              outcomes: [
                { id: 'tytcog-yer-sekilleri-s4-k1', text: "Akarsu, rüzgâr, buzul, dalga ve karstik aşındırma-biriktirme şekillerini açıklar." },
                { id: 'tytcog-yer-sekilleri-s4-k2', text: "Dış kuvvetlerin etkinliğini iklim koşullarıyla ilişkilendirir." },
              ],
            },
          ],
        },
        {
          id: 'tytcog-su-toprak-bitki',
          name: "Su, Toprak ve Bitki Varlığı",
          grade: 10,
          subtopics: [
            {
              id: 'tytcog-su-toprak-bitki-s1',
              name: "Su Kaynakları: Okyanus, Akarsu, Göl ve Yer Altı Suları",
              outcomes: [
                { id: 'tytcog-su-toprak-bitki-s1-k1', text: "Akarsu rejimini etkileyen faktörleri açıklar." },
                { id: 'tytcog-su-toprak-bitki-s1-k2', text: "Gölleri oluşumlarına göre sınıflandırır." },
              ],
            },
            {
              id: 'tytcog-su-toprak-bitki-s2',
              name: "Topraklar",
              outcomes: [
                { id: 'tytcog-su-toprak-bitki-s2-k1', text: "Toprak oluşumunu etkileyen faktörleri ve toprak türlerini açıklar." },
              ],
            },
            {
              id: 'tytcog-su-toprak-bitki-s3',
              name: "Bitki Örtüsü",
              outcomes: [
                { id: 'tytcog-su-toprak-bitki-s3-k1', text: "Bitki örtüsünün iklimle ilişkisini ve dünyadaki dağılışını açıklar." },
                { id: 'tytcog-su-toprak-bitki-s3-k2', text: "Türkiye’deki bitki örtüsü tiplerini dağılışlarıyla yorumlar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-cografya-u3',
      name: "Beşerî Sistemler",
      topics: [
        {
          id: 'tytcog-nufus',
          name: "Nüfus",
          grade: 10,
          subtopics: [
            {
              id: 'tytcog-nufus-s1',
              name: "Nüfusun Dağılışı ve Yoğunluk",
              outcomes: [
                { id: 'tytcog-nufus-s1-k1', text: "Nüfusun dağılışını etkileyen doğal ve beşerî faktörleri açıklar." },
                { id: 'tytcog-nufus-s1-k2', text: "Aritmetik, fizyolojik ve tarımsal nüfus yoğunluğunu hesaplar ve yorumlar." },
              ],
            },
            {
              id: 'tytcog-nufus-s2',
              name: "Nüfus Artışı ve Nüfus Piramitleri",
              outcomes: [
                { id: 'tytcog-nufus-s2-k1', text: "Doğal nüfus artışını hesaplar ve etkileyen faktörleri açıklar." },
                { id: 'tytcog-nufus-s2-k2', text: "Nüfus piramitlerinden ülkelerin gelişmişlik düzeyi hakkında çıkarım yapar." },
              ],
            },
            {
              id: 'tytcog-nufus-s3',
              name: "Nüfus Politikaları ve Türkiye’de Nüfus",
              outcomes: [
                { id: 'tytcog-nufus-s3-k1', text: "Nüfus politikalarını ve Türkiye’de nüfusun gelişimini yorumlar." },
              ],
            },
          ],
        },
        {
          id: 'tytcog-goc',
          name: "Göç",
          grade: 10,
          subtopics: [
            {
              id: 'tytcog-goc-s1',
              name: "Göçün Nedenleri ve Türleri",
              outcomes: [
                { id: 'tytcog-goc-s1-k1', text: "Göçü nedenlerine ve sürelerine göre sınıflandırır." },
                { id: 'tytcog-goc-s1-k2', text: "İtici ve çekici faktörleri örneklerle açıklar." },
              ],
            },
            {
              id: 'tytcog-goc-s2',
              name: "Göçün Sonuçları",
              outcomes: [
                { id: 'tytcog-goc-s2-k1', text: "Göçün göç veren ve göç alan yerlere etkilerini karşılaştırır." },
              ],
            },
            {
              id: 'tytcog-goc-s3',
              name: "Türkiye’de Göç",
              outcomes: [
                { id: 'tytcog-goc-s3-k1', text: "Türkiye’de iç ve dış göçlerin nedenlerini ve sonuçlarını yorumlar." },
              ],
            },
          ],
        },
        {
          id: 'tytcog-yerlesme',
          name: "Yerleşme",
          grade: 10,
          subtopics: [
            {
              id: 'tytcog-yerlesme-s1',
              name: "Yerleşmeyi Etkileyen Faktörler",
              outcomes: [
                { id: 'tytcog-yerlesme-s1-k1', text: "Yerleşmelerin kuruluş yerini etkileyen doğal ve beşerî faktörleri açıklar." },
              ],
            },
            {
              id: 'tytcog-yerlesme-s2',
              name: "Kır ve Şehir Yerleşmeleri",
              outcomes: [
                { id: 'tytcog-yerlesme-s2-k1', text: "Kırsal yerleşme tiplerini ve dokularını açıklar." },
                { id: 'tytcog-yerlesme-s2-k2', text: "Şehirleri fonksiyonlarına göre sınıflandırır." },
              ],
            },
          ],
        },
        {
          id: 'tytcog-ekonomik-faaliyetler',
          name: "Ekonomik Faaliyetler",
          grade: 10,
          subtopics: [
            {
              id: 'tytcog-ekonomik-faaliyetler-s1',
              name: "Ekonomik Faaliyetlerin Sınıflandırılması",
              outcomes: [
                { id: 'tytcog-ekonomik-faaliyetler-s1-k1', text: "Ekonomik faaliyetleri birincil, ikincil ve üçüncül faaliyetler olarak sınıflandırır." },
                { id: 'tytcog-ekonomik-faaliyetler-s1-k2', text: "Ekonomik faaliyetlerin dağılışının doğal koşullarla ilişkisini yorumlar." },
              ],
            },
            {
              id: 'tytcog-ekonomik-faaliyetler-s2',
              name: "Gelişmişlik ve Sektörel Dağılım",
              outcomes: [
                { id: 'tytcog-ekonomik-faaliyetler-s2-k1', text: "Çalışan nüfusun sektörlere dağılımından ülkelerin gelişmişlik düzeyi hakkında çıkarım yapar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-cografya-u4',
      name: "Küresel Ortam: Bölgeler ve Ülkeler",
      topics: [
        {
          id: 'tytcog-bolgeler-ulasim',
          name: "Bölgeler ve Ulaşım",
          grade: 10,
          subtopics: [
            {
              id: 'tytcog-bolgeler-ulasim-s1',
              name: "Bölge Kavramı ve Bölge Türleri",
              outcomes: [
                { id: 'tytcog-bolgeler-ulasim-s1-k1', text: "Bölge kavramını ve farklı ölçütlere göre belirlenen bölge türlerini açıklar." },
              ],
            },
            {
              id: 'tytcog-bolgeler-ulasim-s2',
              name: "Kıtalar, Okyanuslar ve Ülkeler",
              outcomes: [
                { id: 'tytcog-bolgeler-ulasim-s2-k1', text: "Kıtaların ve okyanusların konum ve özelliklerini açıklar." },
              ],
            },
            {
              id: 'tytcog-bolgeler-ulasim-s3',
              name: "Ulaşım Sistemleri",
              outcomes: [
                { id: 'tytcog-bolgeler-ulasim-s3-k1', text: "Ulaşım türlerinin gelişimini etkileyen doğal ve beşerî faktörleri açıklar." },
                { id: 'tytcog-bolgeler-ulasim-s3-k2', text: "Önemli su yolları ve boğazların küresel ulaşımdaki yerini yorumlar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-cografya-u5',
      name: "Çevre ve Toplum",
      topics: [
        {
          id: 'tytcog-dogal-afetler',
          name: "Doğal Afetler",
          grade: 10,
          subtopics: [
            {
              id: 'tytcog-dogal-afetler-s1',
              name: "Afet Türleri ve Oluşum Nedenleri",
              outcomes: [
                { id: 'tytcog-dogal-afetler-s1-k1', text: "Doğal afetleri oluşum nedenlerine göre sınıflandırır." },
                { id: 'tytcog-dogal-afetler-s1-k2', text: "Deprem, heyelan, sel, çığ ve kuraklığın oluşumunu ve dağılışını açıklar." },
              ],
            },
            {
              id: 'tytcog-dogal-afetler-s2',
              name: "Türkiye’de Doğal Afetler ve Korunma",
              outcomes: [
                { id: 'tytcog-dogal-afetler-s2-k1', text: "Türkiye’de doğal afetlerin dağılışını yorumlar." },
                { id: 'tytcog-dogal-afetler-s2-k2', text: "Afetlerin zararlarını azaltmaya yönelik önlemleri açıklar." },
              ],
            },
          ],
        },
        {
          id: 'tytcog-cevre-ve-toplum',
          name: "Çevre ve Toplum",
          grade: 10,
          subtopics: [
            {
              id: 'tytcog-cevre-ve-toplum-s1',
              name: "İnsanın Çevreye Etkileri",
              outcomes: [
                { id: 'tytcog-cevre-ve-toplum-s1-k1', text: "İnsan faaliyetlerinin doğal ortam üzerindeki etkilerini örneklerle açıklar." },
              ],
            },
            {
              id: 'tytcog-cevre-ve-toplum-s2',
              name: "Çevre Sorunları ve Sürdürülebilirlik",
              outcomes: [
                { id: 'tytcog-cevre-ve-toplum-s2-k1', text: "Hava, su ve toprak kirliliğinin nedenlerini ve sonuçlarını açıklar." },
                { id: 'tytcog-cevre-ve-toplum-s2-k2', text: "Yenilenebilir enerji ve sürdürülebilir kalkınma kavramlarını yorumlar." },
              ],
            },
          ],
        },
      ],
    },
  ],
};
