import type { Subject } from '../../domain/types';

export const subject: Subject = {
  id: 'ayt-geometri',
  exam: 'AYT',
  name: 'AYT Geometri',
  icon: "△",
  examQuestionCount: 10,
  note: "AYT Matematik testinin geometri bölümü.",
  units: [
    {
      id: 'ayt-geometri-u1',
      name: "Üçgenler, Çokgenler ve Üçgende Trigonometri",
      topics: [
        {
          id: 'aytgeo-ucgenler-ileri',
          name: "Üçgenler (İleri Uygulamalar)",
          grade: 9,
          subtopics: [
            {
              id: 'aytgeo-ucgenler-ileri-s1',
              name: "Açıortay Teoremleri",
              outcomes: [
                { id: 'aytgeo-ucgenler-ileri-s1-k1', text: "İç ve dış açıortay teoremlerini açıklar ve kenar oranlarını hesaplar." },
                { id: 'aytgeo-ucgenler-ileri-s1-k2', text: "İç açıortay uzunluğunu kenar uzunlukları yardımıyla hesaplar." },
              ],
            },
            {
              id: 'aytgeo-ucgenler-ileri-s2',
              name: "Kenarortay ve Ağırlık Merkezi",
              outcomes: [
                { id: 'aytgeo-ucgenler-ileri-s2-k1', text: "Kenarortay uzunluğu bağıntısını kullanarak uzunluk hesaplar." },
                { id: 'aytgeo-ucgenler-ileri-s2-k2', text: "Ağırlık merkezinin kenarortayı 2:1 oranında böldüğünü kullanarak problem çözer." },
              ],
            },
            {
              id: 'aytgeo-ucgenler-ileri-s3',
              name: "Benzerlik İleri Uygulamaları",
              outcomes: [
                { id: 'aytgeo-ucgenler-ileri-s3-k1', text: "Benzer üçgenlerde uzunluk, çevre ve alan oranları arasındaki ilişkiyi yorumlar." },
                { id: 'aytgeo-ucgenler-ileri-s3-k2', text: "Paralellik ve Tales teoremiyle oluşan benzerlikleri kullanarak uzunluk hesaplar." },
              ],
            },
            {
              id: 'aytgeo-ucgenler-ileri-s4',
              name: "Üçgende Alan Uygulamaları",
              outcomes: [
                { id: 'aytgeo-ucgenler-ileri-s4-k1', text: "Ortak yükseklikli ve ortak tabanlı üçgenlerde alan oranlarını hesaplar." },
                { id: 'aytgeo-ucgenler-ileri-s4-k2', text: "Heron bağıntısı ve iç teğet çember yarıçapı ile alan hesaplar." },
              ],
            },
          ],
        },
        {
          id: 'aytgeo-cokgenler-dortgenler',
          name: "Çokgenler ve Dörtgenler",
          grade: 10,
          subtopics: [
            {
              id: 'aytgeo-cokgenler-dortgenler-s1',
              name: "Çokgenler",
              outcomes: [
                { id: 'aytgeo-cokgenler-dortgenler-s1-k1', text: "Çokgenlerde iç ve dış açılar toplamını hesaplar." },
                { id: 'aytgeo-cokgenler-dortgenler-s1-k2', text: "Düzgün çokgenlerin açı, köşegen ve alan özelliklerini açıklar." },
              ],
            },
            {
              id: 'aytgeo-cokgenler-dortgenler-s2',
              name: "Paralelkenar, Eşkenar Dörtgen, Dikdörtgen ve Kare",
              outcomes: [
                { id: 'aytgeo-cokgenler-dortgenler-s2-k1', text: "Paralelkenar ailesinin kenar, açı ve köşegen özelliklerini açıklar." },
                { id: 'aytgeo-cokgenler-dortgenler-s2-k2', text: "Paralelkenar ailesindeki dörtgenlerin alanlarını hesaplar." },
              ],
            },
            {
              id: 'aytgeo-cokgenler-dortgenler-s3',
              name: "Yamuk ve Deltoid",
              outcomes: [
                { id: 'aytgeo-cokgenler-dortgenler-s3-k1', text: "Yamukta orta taban ve alan bağıntılarını kullanarak problem çözer." },
                { id: 'aytgeo-cokgenler-dortgenler-s3-k2', text: "Deltoidin köşegen özelliklerini kullanarak alan hesaplar." },
              ],
            },
            {
              id: 'aytgeo-cokgenler-dortgenler-s4',
              name: "Genel Dörtgen",
              outcomes: [
                { id: 'aytgeo-cokgenler-dortgenler-s4-k1', text: "Köşegenleri dik olan dörtgenlerde kenar ve alan bağıntılarını uygular." },
              ],
            },
          ],
        },
        {
          id: 'aytgeo-ucgende-trigonometri',
          name: "Üçgende Trigonometri",
          grade: 11,
          subtopics: [
            {
              id: 'aytgeo-ucgende-trigonometri-s1',
              name: "Sinüs Teoremi",
              outcomes: [
                { id: 'aytgeo-ucgende-trigonometri-s1-k1', text: "Sinüs teoremini açıklar ve çevrel çember yarıçapıyla ilişkilendirir." },
                { id: 'aytgeo-ucgende-trigonometri-s1-k2', text: "Sinüs teoremini kullanarak kenar ve açı hesaplar." },
              ],
            },
            {
              id: 'aytgeo-ucgende-trigonometri-s2',
              name: "Kosinüs Teoremi",
              outcomes: [
                { id: 'aytgeo-ucgende-trigonometri-s2-k1', text: "Kosinüs teoremini kullanarak kenar uzunluğu ve açı ölçüsü hesaplar." },
                { id: 'aytgeo-ucgende-trigonometri-s2-k2', text: "Kenar uzunluklarından üçgenin dar, dik ya da geniş açılı olduğunu yorumlar." },
              ],
            },
            {
              id: 'aytgeo-ucgende-trigonometri-s3',
              name: "Trigonometrik Alan Bağıntısı",
              outcomes: [
                { id: 'aytgeo-ucgende-trigonometri-s3-k1', text: "İki kenarı ve aradaki açısı bilinen üçgenin alanını hesaplar." },
                { id: 'aytgeo-ucgende-trigonometri-s3-k2', text: "Dörtgenin alanını köşegenler ve aralarındaki açı yardımıyla hesaplar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-geometri-u2',
      name: "Çember ve Daire",
      topics: [
        {
          id: 'aytgeo-cember-daire',
          name: "Çember ve Daire",
          grade: 10,
          subtopics: [
            {
              id: 'aytgeo-cember-daire-s1',
              name: "Çemberde Temel Elemanlar ve Açılar",
              outcomes: [
                { id: 'aytgeo-cember-daire-s1-k1', text: "Çemberde merkez, çevre, teğet-kiriş, iç ve dış açıların ölçülerini hesaplar." },
              ],
            },
            {
              id: 'aytgeo-cember-daire-s2',
              name: "Kiriş, Teğet ve Kuvvet",
              outcomes: [
                { id: 'aytgeo-cember-daire-s2-k1', text: "Kirişin merkeze uzaklığı ile ilgili özellikleri kullanır." },
                { id: 'aytgeo-cember-daire-s2-k2', text: "Teğet parçalarının eşitliğini ve noktanın çembere göre kuvvetini kullanarak uzunluk hesaplar." },
              ],
            },
            {
              id: 'aytgeo-cember-daire-s3',
              name: "Kirişler Dörtgeni ve Teğetler Dörtgeni",
              outcomes: [
                { id: 'aytgeo-cember-daire-s3-k1', text: "Kirişler dörtgeninde karşılıklı açıların bütünler olduğunu kullanır." },
                { id: 'aytgeo-cember-daire-s3-k2', text: "Teğetler dörtgeninde karşılıklı kenar toplamlarının eşitliğini kullanır." },
              ],
            },
            {
              id: 'aytgeo-cember-daire-s4',
              name: "Dairenin Çevresi ve Alanı",
              outcomes: [
                { id: 'aytgeo-cember-daire-s4-k1', text: "Çember yayının uzunluğunu ve daire diliminin alanını hesaplar." },
                { id: 'aytgeo-cember-daire-s4-k2', text: "Daire parçası ve halka alanlarını hesaplar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-geometri-u3',
      name: "Analitik Geometri",
      topics: [
        {
          id: 'aytgeo-dogrunun-analitigi',
          name: "Doğrunun Analitik İncelenmesi",
          grade: 11,
          priority: true,
          subtopics: [
            {
              id: 'aytgeo-dogrunun-analitigi-s1',
              name: "İki Nokta Arası Uzaklık ve Bölen Nokta",
              outcomes: [
                { id: 'aytgeo-dogrunun-analitigi-s1-k1', text: "Analitik düzlemde iki nokta arasındaki uzaklığı hesaplar." },
                { id: 'aytgeo-dogrunun-analitigi-s1-k2', text: "Bir doğru parçasını verilen oranda içten ya da dıştan bölen noktanın koordinatlarını hesaplar." },
                { id: 'aytgeo-dogrunun-analitigi-s1-k3', text: "Üçgenin ağırlık merkezinin koordinatlarını hesaplar." },
              ],
            },
            {
              id: 'aytgeo-dogrunun-analitigi-s2',
              name: "Eğim ve Eğim Açısı",
              outcomes: [
                { id: 'aytgeo-dogrunun-analitigi-s2-k1', text: "Doğrunun eğimini eğim açısı ve iki nokta yardımıyla hesaplar." },
                { id: 'aytgeo-dogrunun-analitigi-s2-k2', text: "Üç noktanın doğrusal olma koşulunu eğim yardımıyla yorumlar." },
              ],
            },
            {
              id: 'aytgeo-dogrunun-analitigi-s3',
              name: "Doğru Denkleminin Biçimleri",
              outcomes: [
                { id: 'aytgeo-dogrunun-analitigi-s3-k1', text: "Eğimi ve bir noktası ya da iki noktası verilen doğrunun denklemini yazar." },
                { id: 'aytgeo-dogrunun-analitigi-s3-k2', text: "Eksenleri kestiği noktaları bilinen doğrunun denklemini yazar ve eksenlerle oluşturduğu bölgenin alanını hesaplar." },
              ],
            },
            {
              id: 'aytgeo-dogrunun-analitigi-s4',
              name: "İki Doğrunun Birbirine Göre Durumu",
              outcomes: [
                { id: 'aytgeo-dogrunun-analitigi-s4-k1', text: "İki doğrunun paralel, çakışık, kesişen ya da dik olma koşullarını açıklar." },
                { id: 'aytgeo-dogrunun-analitigi-s4-k2', text: "İki doğrunun kesişim noktasını ve aralarındaki açıyı hesaplar." },
              ],
            },
            {
              id: 'aytgeo-dogrunun-analitigi-s5',
              name: "Noktanın Doğruya ve Paralel Doğruların Birbirine Uzaklığı",
              outcomes: [
                { id: 'aytgeo-dogrunun-analitigi-s5-k1', text: "Bir noktanın bir doğruya olan uzaklığını hesaplar." },
                { id: 'aytgeo-dogrunun-analitigi-s5-k2', text: "Paralel iki doğru arasındaki uzaklığı hesaplar." },
              ],
            },
          ],
        },
        {
          id: 'aytgeo-cemberin-analitigi',
          name: "Çemberin Analitik İncelenmesi",
          grade: 11,
          priority: true,
          subtopics: [
            {
              id: 'aytgeo-cemberin-analitigi-s1',
              name: "Çemberin Standart ve Genel Denklemi",
              outcomes: [
                { id: 'aytgeo-cemberin-analitigi-s1-k1', text: "Merkezi ve yarıçapı verilen çemberin standart denklemini yazar." },
                { id: 'aytgeo-cemberin-analitigi-s1-k2', text: "Genel denklemi verilen çemberin merkezini ve yarıçapını bulur; denklemin çember belirtme koşulunu açıklar." },
              ],
            },
            {
              id: 'aytgeo-cemberin-analitigi-s2',
              name: "Özel Konumlu Çemberler",
              outcomes: [
                { id: 'aytgeo-cemberin-analitigi-s2-k1', text: "Eksenlere teğet olan ya da eksenleri kesen çemberlerin denklemlerini yazar." },
              ],
            },
            {
              id: 'aytgeo-cemberin-analitigi-s3',
              name: "Nokta, Doğru ve Çemberin Birbirine Göre Durumu",
              outcomes: [
                { id: 'aytgeo-cemberin-analitigi-s3-k1', text: "Bir noktanın çembere göre konumunu belirler." },
                { id: 'aytgeo-cemberin-analitigi-s3-k2', text: "Bir doğrunun çembere göre durumunu merkez–doğru uzaklığı ya da diskriminant ile belirler." },
                { id: 'aytgeo-cemberin-analitigi-s3-k3', text: "Doğrunun çemberde ayırdığı kirişin uzunluğunu hesaplar." },
              ],
            },
            {
              id: 'aytgeo-cemberin-analitigi-s4',
              name: "Teğet ve Noktanın Kuvveti",
              outcomes: [
                { id: 'aytgeo-cemberin-analitigi-s4-k1', text: "Çember üzerindeki bir noktadan çizilen teğetin denklemini yazar." },
                { id: 'aytgeo-cemberin-analitigi-s4-k2', text: "Çemberin dışındaki bir noktadan çizilen teğet parçasının uzunluğunu noktanın kuvveti ile hesaplar." },
              ],
            },
            {
              id: 'aytgeo-cemberin-analitigi-s5',
              name: "İki Çemberin Birbirine Göre Durumu",
              outcomes: [
                { id: 'aytgeo-cemberin-analitigi-s5-k1', text: "Merkezler arası uzaklık ve yarıçaplarla iki çemberin birbirine göre durumunu yorumlar." },
              ],
            },
          ],
        },
        {
          id: 'aytgeo-donusumler',
          name: "Analitik Düzlemde Dönüşümler",
          grade: 11,
          subtopics: [
            {
              id: 'aytgeo-donusumler-s1',
              name: "Öteleme",
              outcomes: [
                { id: 'aytgeo-donusumler-s1-k1', text: "Analitik düzlemde nokta ve şekillerin öteleme altındaki görüntülerini bulur." },
              ],
            },
            {
              id: 'aytgeo-donusumler-s2',
              name: "Yansıma",
              outcomes: [
                { id: 'aytgeo-donusumler-s2-k1', text: "Noktanın eksenlere, orijine, y = x ve y = −x doğrularına göre yansımasını bulur." },
                { id: 'aytgeo-donusumler-s2-k2', text: "Noktanın bir noktaya ve genel bir doğruya göre yansımasını hesaplar." },
              ],
            },
            {
              id: 'aytgeo-donusumler-s3',
              name: "Dönme",
              outcomes: [
                { id: 'aytgeo-donusumler-s3-k1', text: "Noktanın orijin etrafında 90°, 180° ve 270° döndürülmesiyle elde edilen görüntüsünü bulur." },
                { id: 'aytgeo-donusumler-s3-k2', text: "Ardışık dönüşümlerin bileşkesini yorumlar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-geometri-u4',
      name: "Katı Cisimler",
      topics: [
        {
          id: 'aytgeo-kati-cisimler',
          name: "Katı Cisimler",
          grade: 12,
          subtopics: [
            {
              id: 'aytgeo-kati-cisimler-s1',
              name: "Prizmalar",
              outcomes: [
                { id: 'aytgeo-kati-cisimler-s1-k1', text: "Dik prizma, küp ve dikdörtgenler prizmasının alan ve hacmini hesaplar." },
                { id: 'aytgeo-kati-cisimler-s1-k2', text: "Prizmada cisim köşegeni ve yüz köşegeni uzunluklarını hesaplar." },
              ],
            },
            {
              id: 'aytgeo-kati-cisimler-s2',
              name: "Piramitler",
              outcomes: [
                { id: 'aytgeo-kati-cisimler-s2-k1', text: "Piramidin yüksekliği, yan yüz yüksekliği ve taban arasındaki ilişkileri kullanarak alan ve hacim hesaplar." },
              ],
            },
            {
              id: 'aytgeo-kati-cisimler-s3',
              name: "Silindir ve Koni",
              outcomes: [
                { id: 'aytgeo-kati-cisimler-s3-k1', text: "Dik dairesel silindirin alan ve hacmini hesaplar." },
                { id: 'aytgeo-kati-cisimler-s3-k2', text: "Dik dairesel koninin ana doğrusu, açınımı, alanı ve hacmi arasındaki ilişkileri kullanır." },
              ],
            },
            {
              id: 'aytgeo-kati-cisimler-s4',
              name: "Küre",
              outcomes: [
                { id: 'aytgeo-kati-cisimler-s4-k1', text: "Kürenin alan ve hacmini hesaplar; küre ile diğer cisimlerin iç içe durumlarını yorumlar." },
              ],
            },
          ],
        },
      ],
    },
  ],
};
