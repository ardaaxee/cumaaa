import type { Subject } from '../../domain/types';

export const subject: Subject = {
  id: 'tyt-geometri',
  exam: 'TYT',
  name: "TYT Geometri",
  icon: "△",
  examQuestionCount: 10,
  note: "TYT Temel Matematik testinin geometri bölümü.",
  units: [
    {
      id: 'tyt-geometri-u1',
      name: "Doğruda ve Üçgende Açılar",
      topics: [
        {
          id: 'tytgeo-dogruda-acilar',
          name: "Doğruda Açılar",
          grade: 9,
          subtopics: [
            {
              id: 'tytgeo-dogruda-acilar-s1',
              name: "Açı Kavramı ve Açı Çeşitleri",
              outcomes: [
                { id: 'tytgeo-dogruda-acilar-s1-k1', text: "Açıyı, açının ölçüsünü ve açı çeşitlerini (dar, dik, geniş, doğru açı) açıklar." },
                { id: 'tytgeo-dogruda-acilar-s1-k2', text: "Tümler, bütünler, komşu ve ters açıların özelliklerini kullanarak açı ölçüsü hesaplar." },
              ],
            },
            {
              id: 'tytgeo-dogruda-acilar-s2',
              name: "Paralel İki Doğrunun Bir Kesenle Yaptığı Açılar",
              outcomes: [
                { id: 'tytgeo-dogruda-acilar-s2-k1', text: "Yöndeş, iç ters, dış ters ve karşı durumlu açıların özelliklerini açıklar." },
                { id: 'tytgeo-dogruda-acilar-s2-k2', text: "Paralel doğrular ve kesenle oluşan açıları kullanarak bilinmeyen açıyı hesaplar." },
              ],
            },
            {
              id: 'tytgeo-dogruda-acilar-s3',
              name: "Paralel Doğrular Arasında Kırık Çizgiler",
              outcomes: [
                { id: 'tytgeo-dogruda-acilar-s3-k1', text: "Paralel doğrular arasındaki kırık çizgilerde açı bağıntılarını (zigzag kuralı) kullanarak açı hesaplar." },
              ],
            },
          ],
        },
        {
          id: 'tytgeo-ucgende-acilar',
          name: "Üçgende Açılar",
          grade: 9,
          subtopics: [
            {
              id: 'tytgeo-ucgende-acilar-s1',
              name: "İç ve Dış Açılar",
              outcomes: [
                { id: 'tytgeo-ucgende-acilar-s1-k1', text: "Üçgenin iç açıları toplamının 180° olduğunu gösterir ve açı hesaplar." },
                { id: 'tytgeo-ucgende-acilar-s1-k2', text: "Bir dış açının kendisine komşu olmayan iki iç açının toplamına eşit olduğunu kullanır." },
              ],
            },
            {
              id: 'tytgeo-ucgende-acilar-s2',
              name: "Açıortaylar Arasındaki Açılar",
              outcomes: [
                { id: 'tytgeo-ucgende-acilar-s2-k1', text: "İç ve dış açıortayların oluşturduğu açıları üçgenin açıları cinsinden hesaplar." },
              ],
            },
            {
              id: 'tytgeo-ucgende-acilar-s3',
              name: "Birleşik Şekillerde Açı Uygulamaları",
              outcomes: [
                { id: 'tytgeo-ucgende-acilar-s3-k1', text: "Birleşik şekillerde (içbükey dörtgen, katlama, kesişen üçgenler) açı bağıntılarını kullanarak açı hesaplar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-geometri-u2',
      name: "Üçgenler",
      topics: [
        {
          id: 'tytgeo-ozel-ucgenler',
          name: "Özel Üçgenler",
          grade: 9,
          subtopics: [
            {
              id: 'tytgeo-ozel-ucgenler-s1',
              name: "Dik Üçgen ve Pisagor Bağıntısı",
              outcomes: [
                { id: 'tytgeo-ozel-ucgenler-s1-k1', text: "Pisagor bağıntısını açıklar ve dik üçgende kenar uzunluğu hesaplar." },
                { id: 'tytgeo-ozel-ucgenler-s1-k2', text: "Pisagor üçlülerini (3-4-5, 5-12-13, 8-15-17, 7-24-25) tanır ve kullanır." },
              ],
            },
            {
              id: 'tytgeo-ozel-ucgenler-s2',
              name: "Özel Dik Üçgenler",
              outcomes: [
                { id: 'tytgeo-ozel-ucgenler-s2-k1', text: "30°-60°-90° ve 45°-45°-90° üçgenlerinde kenar oranlarını kullanarak uzunluk hesaplar." },
              ],
            },
            {
              id: 'tytgeo-ozel-ucgenler-s3',
              name: "Dik Üçgende Öklid Bağıntıları ve Kenarortay",
              outcomes: [
                { id: 'tytgeo-ozel-ucgenler-s3-k1', text: "Hipotenüse ait yükseklikle ilgili Öklid bağıntılarını kullanarak uzunluk hesaplar." },
                { id: 'tytgeo-ozel-ucgenler-s3-k2', text: "Dik üçgende hipotenüse ait kenarortayın hipotenüsün yarısına eşit olduğunu kullanır." },
              ],
            },
            {
              id: 'tytgeo-ozel-ucgenler-s4',
              name: "İkizkenar ve Eşkenar Üçgen",
              outcomes: [
                { id: 'tytgeo-ozel-ucgenler-s4-k1', text: "İkizkenar üçgende tabana ait yükseklik, kenarortay ve açıortayın çakıştığını kullanır." },
                { id: 'tytgeo-ozel-ucgenler-s4-k2', text: "Eşkenar üçgende yükseklik ve alan bağıntılarını kullanarak hesaplama yapar." },
              ],
            },
          ],
        },
        {
          id: 'tytgeo-ucgende-aci-kenar',
          name: "Üçgende Açı-Kenar Bağıntıları",
          grade: 9,
          subtopics: [
            {
              id: 'tytgeo-ucgende-aci-kenar-s1',
              name: "Açı-Kenar İlişkisi",
              outcomes: [
                { id: 'tytgeo-ucgende-aci-kenar-s1-k1', text: "Üçgende büyük açı karşısında büyük kenar bulunduğunu kullanarak kenarları ve açıları sıralar." },
              ],
            },
            {
              id: 'tytgeo-ucgende-aci-kenar-s2',
              name: "Üçgen Eşitsizliği",
              outcomes: [
                { id: 'tytgeo-ucgende-aci-kenar-s2-k1', text: "Üçgen eşitsizliğini kullanarak bir kenarın alabileceği değer aralığını belirler." },
                { id: 'tytgeo-ucgende-aci-kenar-s2-k2', text: "Birden fazla koşulu birlikte kullanarak kenar uzunluğunun alabileceği tam sayı değerlerini bulur." },
              ],
            },
            {
              id: 'tytgeo-ucgende-aci-kenar-s3',
              name: "Dar, Dik ve Geniş Açılı Üçgende Kenarlar",
              outcomes: [
                { id: 'tytgeo-ucgende-aci-kenar-s3-k1', text: "Bir açının dar, dik veya geniş olmasına göre karşısındaki kenarın karesini diğer iki kenarın kareleri toplamıyla karşılaştırır." },
              ],
            },
          ],
        },
        {
          id: 'tytgeo-ucgende-benzerlik',
          name: "Üçgende Benzerlik",
          grade: 9,
          subtopics: [
            {
              id: 'tytgeo-ucgende-benzerlik-s1',
              name: "Eşlik ve Benzerlik Kavramı",
              outcomes: [
                { id: 'tytgeo-ucgende-benzerlik-s1-k1', text: "Üçgenlerde eşlik ve benzerlik şartlarını (AA, KAK, KKK) açıklar." },
              ],
            },
            {
              id: 'tytgeo-ucgende-benzerlik-s2',
              name: "Temel Benzerlik ve Tales Teoremi",
              outcomes: [
                { id: 'tytgeo-ucgende-benzerlik-s2-k1', text: "Bir kenara paralel çizilen doğruyla oluşan benzer üçgenlerde uzunluk hesaplar." },
                { id: 'tytgeo-ucgende-benzerlik-s2-k2', text: "Tales teoremini kullanarak paralel doğruların kestiği doğru parçalarının oranını hesaplar." },
              ],
            },
            {
              id: 'tytgeo-ucgende-benzerlik-s3',
              name: "Kelebek Benzerliği ve Dik Üçgende Benzerlik",
              outcomes: [
                { id: 'tytgeo-ucgende-benzerlik-s3-k1', text: "Kelebek benzerliğini ve dik üçgende oluşan benzerlikleri kullanarak problem çözer." },
              ],
            },
            {
              id: 'tytgeo-ucgende-benzerlik-s4',
              name: "Benzerlik Oranı ve Uygulamalar",
              outcomes: [
                { id: 'tytgeo-ucgende-benzerlik-s4-k1', text: "Benzer üçgenlerde çevreler oranının benzerlik oranına, alanlar oranının benzerlik oranının karesine eşit olduğunu kullanır." },
                { id: 'tytgeo-ucgende-benzerlik-s4-k2', text: "Benzerliği gerçek hayat problemlerinde (gölge, ölçek, yükseklik) kullanır." },
              ],
            },
          ],
        },
        {
          id: 'tytgeo-ucgende-alan',
          name: "Üçgende Alan",
          grade: 9,
          subtopics: [
            {
              id: 'tytgeo-ucgende-alan-s1',
              name: "Temel Alan Bağıntıları",
              outcomes: [
                { id: 'tytgeo-ucgende-alan-s1-k1', text: "Taban ve bu tabana ait yüksekliği kullanarak üçgenin alanını hesaplar." },
                { id: 'tytgeo-ucgende-alan-s1-k2', text: "Dik üçgende ve eşkenar üçgende alan bağıntılarını kullanır." },
              ],
            },
            {
              id: 'tytgeo-ucgende-alan-s2',
              name: "Alan Oranları",
              outcomes: [
                { id: 'tytgeo-ucgende-alan-s2-k1', text: "Yükseklikleri ortak olan üçgenlerin alanları oranının tabanları oranına eşit olduğunu kullanır." },
                { id: 'tytgeo-ucgende-alan-s2-k2', text: "Kenarortayların ve ağırlık merkezinin üçgeni eş alanlı parçalara ayırdığını kullanır." },
              ],
            },
            {
              id: 'tytgeo-ucgende-alan-s3',
              name: "Birleşik Şekillerde Alan",
              outcomes: [
                { id: 'tytgeo-ucgende-alan-s3-k1', text: "Birleşik şekillerin alanlarını parçalara ayırarak veya çıkarma yoluyla hesaplar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-geometri-u3',
      name: "Çokgenler ve Dörtgenler",
      topics: [
        {
          id: 'tytgeo-cokgenler',
          name: "Çokgenler",
          grade: 10,
          subtopics: [
            {
              id: 'tytgeo-cokgenler-s1',
              name: "Çokgenin Temel Elemanları ve Köşegenler",
              outcomes: [
                { id: 'tytgeo-cokgenler-s1-k1', text: "Çokgenin kenar, köşe, köşegen ve açı kavramlarını açıklar." },
                { id: 'tytgeo-cokgenler-s1-k2', text: "n kenarlı çokgenin bir köşesinden çizilebilen ve toplam köşegen sayısını hesaplar." },
              ],
            },
            {
              id: 'tytgeo-cokgenler-s2',
              name: "Çokgende İç ve Dış Açılar",
              outcomes: [
                { id: 'tytgeo-cokgenler-s2-k1', text: "Çokgenin iç açıları toplamını (n − 2)·180° bağıntısıyla hesaplar." },
                { id: 'tytgeo-cokgenler-s2-k2', text: "Dışbükey çokgenin dış açıları toplamının 360° olduğunu kullanır." },
              ],
            },
            {
              id: 'tytgeo-cokgenler-s3',
              name: "Düzgün Çokgenler",
              outcomes: [
                { id: 'tytgeo-cokgenler-s3-k1', text: "Düzgün çokgenin bir iç ve bir dış açısını hesaplar." },
                { id: 'tytgeo-cokgenler-s3-k2', text: "Düzgün altıgeni eşkenar üçgenlere ayırarak alan ve uzunluk hesaplar." },
              ],
            },
          ],
        },
        {
          id: 'tytgeo-dortgenler',
          name: "Dörtgenler",
          grade: 10,
          subtopics: [
            {
              id: 'tytgeo-dortgenler-s1',
              name: "Dörtgenin Genel Özellikleri",
              outcomes: [
                { id: 'tytgeo-dortgenler-s1-k1', text: "Dörtgenin iç açıları toplamını ve köşegenleri dik kesişen dörtgenin alan bağıntısını kullanır." },
              ],
            },
            {
              id: 'tytgeo-dortgenler-s2',
              name: "Yamuk",
              outcomes: [
                { id: 'tytgeo-dortgenler-s2-k1', text: "Yamukta orta taban ve alan bağıntılarını kullanır." },
                { id: 'tytgeo-dortgenler-s2-k2', text: "İkizkenar ve dik yamuğun özelliklerini kullanarak uzunluk hesaplar." },
              ],
            },
            {
              id: 'tytgeo-dortgenler-s3',
              name: "Paralelkenar ve Eşkenar Dörtgen",
              outcomes: [
                { id: 'tytgeo-dortgenler-s3-k1', text: "Paralelkenarın açı, kenar ve köşegen özelliklerini kullanır." },
                { id: 'tytgeo-dortgenler-s3-k2', text: "Eşkenar dörtgenin köşegenlerinin birbirini dik ortaladığını kullanarak kenar ve alan hesaplar." },
              ],
            },
            {
              id: 'tytgeo-dortgenler-s4',
              name: "Dikdörtgen ve Kare",
              outcomes: [
                { id: 'tytgeo-dortgenler-s4-k1', text: "Dikdörtgen ve karenin çevre, alan ve köşegen bağıntılarını kullanır." },
              ],
            },
            {
              id: 'tytgeo-dortgenler-s5',
              name: "Deltoid",
              outcomes: [
                { id: 'tytgeo-dortgenler-s5-k1', text: "Deltoidin simetri ve köşegen özelliklerini kullanarak uzunluk ve alan hesaplar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-geometri-u4',
      name: "Çember ve Daire",
      topics: [
        {
          id: 'tytgeo-cember-daire',
          name: "Çember ve Daire",
          grade: 10,
          subtopics: [
            {
              id: 'tytgeo-cember-daire-s1',
              name: "Çemberin Temel Elemanları",
              outcomes: [
                { id: 'tytgeo-cember-daire-s1-k1', text: "Çemberde yarıçap, çap, kiriş, teğet ve kesen kavramlarını açıklar." },
                { id: 'tytgeo-cember-daire-s1-k2', text: "Merkezden kirişe inilen dikmenin kirişi ortaladığını kullanarak uzunluk hesaplar." },
                { id: 'tytgeo-cember-daire-s1-k3', text: "Teğetin, değme noktasındaki yarıçapa dik olduğunu kullanır." },
              ],
            },
            {
              id: 'tytgeo-cember-daire-s2',
              name: "Çemberde Açılar",
              outcomes: [
                { id: 'tytgeo-cember-daire-s2-k1', text: "Merkez açı ve çevre açının ölçülerini gördükleri yayla ilişkilendirir." },
              ],
            },
            {
              id: 'tytgeo-cember-daire-s3',
              name: "Çemberin Uzunluğu ve Dairenin Alanı",
              outcomes: [
                { id: 'tytgeo-cember-daire-s3-k1', text: "Çemberin çevresini ve yay uzunluğunu hesaplar." },
                { id: 'tytgeo-cember-daire-s3-k2', text: "Dairenin ve daire diliminin alanını hesaplar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-geometri-u5',
      name: "Analitik Geometri",
      topics: [
        {
          id: 'tytgeo-analitik-geometri',
          name: "Noktanın ve Doğrunun Analitik İncelenmesi",
          grade: 10,
          subtopics: [
            {
              id: 'tytgeo-analitik-geometri-s1',
              name: "Koordinat Düzlemi ve Nokta",
              outcomes: [
                { id: 'tytgeo-analitik-geometri-s1-k1', text: "Noktanın koordinatlarını ve bulunduğu bölgeyi belirler." },
              ],
            },
            {
              id: 'tytgeo-analitik-geometri-s2',
              name: "İki Nokta Arası Uzaklık ve Orta Nokta",
              outcomes: [
                { id: 'tytgeo-analitik-geometri-s2-k1', text: "İki nokta arasındaki uzaklığı hesaplar." },
                { id: 'tytgeo-analitik-geometri-s2-k2', text: "Bir doğru parçasının orta noktasının koordinatlarını hesaplar." },
              ],
            },
            {
              id: 'tytgeo-analitik-geometri-s3',
              name: "Doğrunun Eğimi ve Denklemi",
              outcomes: [
                { id: 'tytgeo-analitik-geometri-s3-k1', text: "İki noktası verilen doğrunun eğimini hesaplar ve eğim açısıyla ilişkilendirir." },
                { id: 'tytgeo-analitik-geometri-s3-k2', text: "Eğimi ve bir noktası verilen doğrunun denklemini yazar." },
                { id: 'tytgeo-analitik-geometri-s3-k3', text: "Paralel ve dik doğruların eğimleri arasındaki ilişkiyi kullanır." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-geometri-u6',
      name: "Katı Cisimler",
      topics: [
        {
          id: 'tytgeo-kati-cisimler',
          name: "Katı Cisimler",
          grade: 10,
          subtopics: [
            {
              id: 'tytgeo-kati-cisimler-s1',
              name: "Dik Prizmalar ve Küp",
              outcomes: [
                { id: 'tytgeo-kati-cisimler-s1-k1', text: "Dik prizma ve küpün yüzey alanını ve hacmini hesaplar." },
                { id: 'tytgeo-kati-cisimler-s1-k2', text: "Küp ve dikdörtgenler prizmasında cisim köşegeninin uzunluğunu hesaplar." },
              ],
            },
            {
              id: 'tytgeo-kati-cisimler-s2',
              name: "Silindir",
              outcomes: [
                { id: 'tytgeo-kati-cisimler-s2-k1', text: "Dik dairesel silindirin yanal alanını, yüzey alanını ve hacmini hesaplar." },
              ],
            },
            {
              id: 'tytgeo-kati-cisimler-s3',
              name: "Piramit ve Koni",
              outcomes: [
                { id: 'tytgeo-kati-cisimler-s3-k1', text: "Kare dik piramidin ve dik dairesel koninin yüzey alanını ve hacmini hesaplar." },
              ],
            },
            {
              id: 'tytgeo-kati-cisimler-s4',
              name: "Küre",
              outcomes: [
                { id: 'tytgeo-kati-cisimler-s4-k1', text: "Kürenin yüzey alanını ve hacmini hesaplar." },
              ],
            },
          ],
        },
      ],
    },
  ],
};
