import type { Subject } from '../../domain/types';

export const subject: Subject = {
  id: 'tyt-matematik',
  exam: 'TYT',
  name: "TYT Temel Matematik",
  icon: "ƒ",
  examQuestionCount: 30,
  note: "TYT Temel Matematik testi 40 sorudur; yaklaşık 10 soru geometriden gelir.",
  units: [
    {
      id: 'tyt-matematik-u1',
      name: "Sayılar ve Temel Kavramlar",
      topics: [
        {
          id: 'tytmat-temel-kavramlar',
          name: "Temel Kavramlar",
          grade: 9,
          subtopics: [
            {
              id: 'tytmat-temel-kavramlar-s1',
              name: "Sayı Kümeleri",
              outcomes: [
                { id: 'tytmat-temel-kavramlar-s1-k1', text: "Doğal, tam, rasyonel, irrasyonel ve gerçek sayı kümelerini açıklar ve aralarındaki ilişkiyi yorumlar." },
                { id: 'tytmat-temel-kavramlar-s1-k2', text: "Rakam ve sayı kavramlarını ayırt eder." },
              ],
            },
            {
              id: 'tytmat-temel-kavramlar-s2',
              name: "Tek-Çift Sayılar ve İşaret İncelemesi",
              outcomes: [
                { id: 'tytmat-temel-kavramlar-s2-k1', text: "Tek ve çift sayılarla yapılan işlemlerin sonucunun tek ya da çift olduğunu belirler." },
                { id: 'tytmat-temel-kavramlar-s2-k2', text: "Pozitif ve negatif sayılarla yapılan işlemlerin sonucunun işaretini yorumlar." },
              ],
            },
            {
              id: 'tytmat-temel-kavramlar-s3',
              name: "Ardışık Sayılar",
              outcomes: [
                { id: 'tytmat-temel-kavramlar-s3-k1', text: "Ardışık sayıların toplamını ve terim sayısını hesaplar." },
              ],
            },
            {
              id: 'tytmat-temel-kavramlar-s4',
              name: "Asal Sayılar ve Faktöriyel",
              outcomes: [
                { id: 'tytmat-temel-kavramlar-s4-k1', text: "Asal sayıları ve aralarında asal sayıları açıklar." },
                { id: 'tytmat-temel-kavramlar-s4-k2', text: "Faktöriyel kavramını açıklar ve faktöriyelli ifadelerle işlem yapar." },
              ],
            },
            {
              id: 'tytmat-temel-kavramlar-s5',
              name: "İşlem Önceliği",
              outcomes: [
                { id: 'tytmat-temel-kavramlar-s5-k1', text: "Dört işlem, üs ve parantez içeren ifadelerde işlem önceliğine göre hesaplama yapar." },
              ],
            },
          ],
        },
        {
          id: 'tytmat-sayi-basamaklari',
          name: "Sayı Basamakları",
          grade: 9,
          subtopics: [
            {
              id: 'tytmat-sayi-basamaklari-s1',
              name: "Basamak ve Basamak Değeri",
              outcomes: [
                { id: 'tytmat-sayi-basamaklari-s1-k1', text: "Bir sayının rakamlarının basamak değerlerini belirler." },
                { id: 'tytmat-sayi-basamaklari-s1-k2', text: "Rakamları harflerle verilen sayıları çözümlenmiş biçimde yazar." },
              ],
            },
            {
              id: 'tytmat-sayi-basamaklari-s2',
              name: "Çözümleme ile Problem Çözme",
              outcomes: [
                { id: 'tytmat-sayi-basamaklari-s2-k1', text: "Rakamlarının yerleri değiştirilen sayılar arasındaki farkı çözümleme ile hesaplar." },
                { id: 'tytmat-sayi-basamaklari-s2-k2', text: "Rakam koşulları verilen en büyük ve en küçük sayıları belirler." },
              ],
            },
            {
              id: 'tytmat-sayi-basamaklari-s3',
              name: "Taban Aritmetiği",
              outcomes: [
                { id: 'tytmat-sayi-basamaklari-s3-k1', text: "Onluk tabandaki bir sayıyı başka bir tabana ve başka tabandaki sayıyı onluk tabana dönüştürür." },
              ],
            },
          ],
        },
        {
          id: 'tytmat-bolme-bolunebilme',
          name: "Bölme ve Bölünebilme",
          grade: 9,
          subtopics: [
            {
              id: 'tytmat-bolme-bolunebilme-s1',
              name: "Bölme İşlemi ve Kalan",
              outcomes: [
                { id: 'tytmat-bolme-bolunebilme-s1-k1', text: "Bölünen, bölen, bölüm ve kalan arasındaki ilişkiyi kullanarak problem çözer." },
                { id: 'tytmat-bolme-bolunebilme-s1-k2', text: "Kalanın bölenden küçük olması koşulunu kullanarak en büyük ve en küçük değerleri belirler." },
              ],
            },
            {
              id: 'tytmat-bolme-bolunebilme-s2',
              name: "Bölünebilme Kuralları",
              outcomes: [
                { id: 'tytmat-bolme-bolunebilme-s2-k1', text: "2, 3, 4, 5, 8, 9, 10 ve 11 ile bölünebilme kurallarını uygular." },
                { id: 'tytmat-bolme-bolunebilme-s2-k2', text: "Aralarında asal çarpanlara ayırarak 6, 12, 15, 36 gibi sayılarla bölünebilmeyi inceler." },
              ],
            },
            {
              id: 'tytmat-bolme-bolunebilme-s3',
              name: "Asal Çarpanlar ve Bölen Sayısı",
              outcomes: [
                { id: 'tytmat-bolme-bolunebilme-s3-k1', text: "Bir doğal sayıyı asal çarpanlarına ayırır." },
                { id: 'tytmat-bolme-bolunebilme-s3-k2', text: "Bir doğal sayının pozitif bölen sayısını ve bölenlerinin toplamını hesaplar." },
              ],
            },
          ],
        },
        {
          id: 'tytmat-ebob-ekok',
          name: "EBOB ve EKOK",
          grade: 9,
          subtopics: [
            {
              id: 'tytmat-ebob-ekok-s1',
              name: "EBOB ve EKOK Hesabı",
              outcomes: [
                { id: 'tytmat-ebob-ekok-s1-k1', text: "İki veya daha fazla doğal sayının EBOB ve EKOK’unu asal çarpanlarla hesaplar." },
                { id: 'tytmat-ebob-ekok-s1-k2', text: "EBOB(a, b) · EKOK(a, b) = a · b bağıntısını kullanır." },
              ],
            },
            {
              id: 'tytmat-ebob-ekok-s2',
              name: "EBOB Problemleri",
              outcomes: [
                { id: 'tytmat-ebob-ekok-s2-k1', text: "Parçalara ayırma, eş kareler ve ağaç dikme problemlerinde EBOB’u kullanır." },
              ],
            },
            {
              id: 'tytmat-ebob-ekok-s3',
              name: "EKOK Problemleri",
              outcomes: [
                { id: 'tytmat-ebob-ekok-s3-k1', text: "Periyodik olayların yeniden çakışması ve kalan koşullu problemlerde EKOK’u kullanır." },
              ],
            },
          ],
        },
        {
          id: 'tytmat-rasyonel-sayilar',
          name: "Rasyonel Sayılar ve Ondalık Sayılar",
          grade: 9,
          subtopics: [
            {
              id: 'tytmat-rasyonel-sayilar-s1',
              name: "Rasyonel Sayılarla İşlemler",
              outcomes: [
                { id: 'tytmat-rasyonel-sayilar-s1-k1', text: "Rasyonel sayılarla dört işlem yapar ve sıralama yapar." },
                { id: 'tytmat-rasyonel-sayilar-s1-k2', text: "Merdivenli (sürekli) kesirleri sadeleştirir." },
              ],
            },
            {
              id: 'tytmat-rasyonel-sayilar-s2',
              name: "Ondalık Gösterim",
              outcomes: [
                { id: 'tytmat-rasyonel-sayilar-s2-k1', text: "Ondalık sayılarla işlem yapar ve ondalık sayıları kesre dönüştürür." },
                { id: 'tytmat-rasyonel-sayilar-s2-k2', text: "Devirli ondalık sayıları rasyonel sayı biçiminde yazar." },
              ],
            },
            {
              id: 'tytmat-rasyonel-sayilar-s3',
              name: "Kesir Sıralama ve Yorum",
              outcomes: [
                { id: 'tytmat-rasyonel-sayilar-s3-k1', text: "Kesirleri paydaları ya da payları eşitleyerek veya 1’e uzaklıklarına bakarak sıralar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-matematik-u2',
      name: "Eşitsizlikler ve Mutlak Değer",
      topics: [
        {
          id: 'tytmat-basit-esitsizlikler',
          name: "Basit Eşitsizlikler",
          grade: 9,
          subtopics: [
            {
              id: 'tytmat-basit-esitsizlikler-s1',
              name: "Eşitsizliğin Özellikleri",
              outcomes: [
                { id: 'tytmat-basit-esitsizlikler-s1-k1', text: "Eşitsizliklerin toplama, çarpma ve bölme işlemlerine göre özelliklerini açıklar." },
                { id: 'tytmat-basit-esitsizlikler-s1-k2', text: "Negatif sayı ile çarpma ve bölmede eşitsizlik yönünün değiştiğini açıklar." },
              ],
            },
            {
              id: 'tytmat-basit-esitsizlikler-s2',
              name: "Aralık Gösterimi ve Çözüm Kümesi",
              outcomes: [
                { id: 'tytmat-basit-esitsizlikler-s2-k1', text: "Birinci dereceden bir bilinmeyenli eşitsizliklerin çözüm kümesini bulur ve aralık olarak gösterir." },
              ],
            },
            {
              id: 'tytmat-basit-esitsizlikler-s3',
              name: "Değer Aralığı Problemleri",
              outcomes: [
                { id: 'tytmat-basit-esitsizlikler-s3-k1', text: "Değişkenlerin aralıkları verildiğinde toplam, fark ve çarpımın alabileceği değerleri belirler." },
                { id: 'tytmat-basit-esitsizlikler-s3-k2', text: "Tam sayı koşullu eşitsizliklerde en büyük ve en küçük değerleri hesaplar." },
              ],
            },
          ],
        },
        {
          id: 'tytmat-mutlak-deger',
          name: "Mutlak Değer",
          grade: 9,
          subtopics: [
            {
              id: 'tytmat-mutlak-deger-s1',
              name: "Mutlak Değerin Tanımı ve Özellikleri",
              outcomes: [
                { id: 'tytmat-mutlak-deger-s1-k1', text: "Mutlak değeri sayı doğrusunda uzaklık olarak açıklar." },
                { id: 'tytmat-mutlak-deger-s1-k2', text: "Mutlak değerin özelliklerini kullanarak ifadeleri sadeleştirir." },
              ],
            },
            {
              id: 'tytmat-mutlak-deger-s2',
              name: "Mutlak Değerli Denklemler",
              outcomes: [
                { id: 'tytmat-mutlak-deger-s2-k1', text: "Mutlak değer içeren birinci dereceden denklemleri çözer." },
              ],
            },
            {
              id: 'tytmat-mutlak-deger-s3',
              name: "Mutlak Değerli Eşitsizlikler",
              outcomes: [
                { id: 'tytmat-mutlak-deger-s3-k1', text: "|x − a| < b ve |x − a| > b biçimindeki eşitsizlikleri çözer ve yorumlar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-matematik-u3',
      name: "Üslü, Köklü İfadeler ve Çarpanlara Ayırma",
      topics: [
        {
          id: 'tytmat-uslu-sayilar',
          name: "Üslü Sayılar",
          grade: 9,
          subtopics: [
            {
              id: 'tytmat-uslu-sayilar-s1',
              name: "Üs Kavramı ve Özellikleri",
              outcomes: [
                { id: 'tytmat-uslu-sayilar-s1-k1', text: "Tam sayı üslü ifadelerin özelliklerini açıklar." },
                { id: 'tytmat-uslu-sayilar-s1-k2', text: "Negatif tabanlı üslü ifadelerin işaretini belirler." },
              ],
            },
            {
              id: 'tytmat-uslu-sayilar-s2',
              name: "Üslü İfadelerle İşlemler",
              outcomes: [
                { id: 'tytmat-uslu-sayilar-s2-k1', text: "Tabanları veya üsleri eşitleyerek üslü ifadelerle işlem yapar ve sıralar." },
              ],
            },
            {
              id: 'tytmat-uslu-sayilar-s3',
              name: "Üslü Denklemler ve Bilimsel Gösterim",
              outcomes: [
                { id: 'tytmat-uslu-sayilar-s3-k1', text: "Üslü denklemleri çözer." },
                { id: 'tytmat-uslu-sayilar-s3-k2', text: "Çok büyük ve çok küçük sayıları bilimsel gösterimle ifade eder." },
              ],
            },
          ],
        },
        {
          id: 'tytmat-koklu-sayilar',
          name: "Köklü Sayılar",
          grade: 9,
          subtopics: [
            {
              id: 'tytmat-koklu-sayilar-s1',
              name: "Kök Kavramı ve Özellikleri",
              outcomes: [
                { id: 'tytmat-koklu-sayilar-s1-k1', text: "Köklü ifadeleri üslü biçimde yazar ve köklü ifadelerin özelliklerini açıklar." },
                { id: 'tytmat-koklu-sayilar-s1-k2', text: "Çift dereceli köklerin tanımlı olma koşulunu açıklar." },
              ],
            },
            {
              id: 'tytmat-koklu-sayilar-s2',
              name: "Köklü İfadelerle İşlemler",
              outcomes: [
                { id: 'tytmat-koklu-sayilar-s2-k1', text: "Köklü ifadeleri sadeleştirir, toplar ve çarpar." },
                { id: 'tytmat-koklu-sayilar-s2-k2', text: "Köklü sayıları sıralar." },
              ],
            },
            {
              id: 'tytmat-koklu-sayilar-s3',
              name: "Paydayı Rasyonel Yapma",
              outcomes: [
                { id: 'tytmat-koklu-sayilar-s3-k1', text: "Paydada köklü ifade bulunan kesirlerin paydasını eşlenik yardımıyla rasyonel yapar." },
              ],
            },
          ],
        },
        {
          id: 'tytmat-carpanlara-ayirma',
          name: "Çarpanlara Ayırma",
          grade: 10,
          subtopics: [
            {
              id: 'tytmat-carpanlara-ayirma-s1',
              name: "Ortak Çarpan Parantezi ve Gruplandırma",
              outcomes: [
                { id: 'tytmat-carpanlara-ayirma-s1-k1', text: "Ortak çarpan parantezine alma ve gruplandırma yöntemleriyle ifadeleri çarpanlarına ayırır." },
              ],
            },
            {
              id: 'tytmat-carpanlara-ayirma-s2',
              name: "Özdeşlikler",
              outcomes: [
                { id: 'tytmat-carpanlara-ayirma-s2-k1', text: "İki kare farkı, tam kare, iki küp toplamı ve farkı özdeşliklerini kullanır." },
                { id: 'tytmat-carpanlara-ayirma-s2-k2', text: "Özdeşlikleri sayısal işlemleri kolaylaştırmak için kullanır." },
              ],
            },
            {
              id: 'tytmat-carpanlara-ayirma-s3',
              name: "Üç Terimli İfadeler",
              outcomes: [
                { id: 'tytmat-carpanlara-ayirma-s3-k1', text: "ax² + bx + c biçimindeki ifadeleri çarpanlarına ayırır." },
              ],
            },
            {
              id: 'tytmat-carpanlara-ayirma-s4',
              name: "Rasyonel İfadelerin Sadeleştirilmesi",
              outcomes: [
                { id: 'tytmat-carpanlara-ayirma-s4-k1', text: "Rasyonel ifadeleri çarpanlarına ayırarak sadeleştirir." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-matematik-u4',
      name: "Oran-Orantı, Denklemler ve Problemler",
      topics: [
        {
          id: 'tytmat-oran-oranti',
          name: "Oran ve Orantı",
          grade: 9,
          subtopics: [
            {
              id: 'tytmat-oran-oranti-s1',
              name: "Oran ve Orantı Kavramı",
              outcomes: [
                { id: 'tytmat-oran-oranti-s1-k1', text: "Oran ve orantı kavramlarını açıklar ve orantı sabitini kullanır." },
              ],
            },
            {
              id: 'tytmat-oran-oranti-s2',
              name: "Doğru ve Ters Orantı",
              outcomes: [
                { id: 'tytmat-oran-oranti-s2-k1', text: "Doğru ve ters orantılı çokluklar arasındaki ilişkiyi kullanarak problem çözer." },
                { id: 'tytmat-oran-oranti-s2-k2', text: "Birden fazla çokluğa bağlı bileşik orantı problemlerini çözer." },
              ],
            },
            {
              id: 'tytmat-oran-oranti-s3',
              name: "Paylaştırma",
              outcomes: [
                { id: 'tytmat-oran-oranti-s3-k1', text: "Bir çokluğu verilen oranlarda doğru ya da ters orantılı olarak paylaştırır." },
              ],
            },
          ],
        },
        {
          id: 'tytmat-denklem-cozme',
          name: "Birinci Dereceden Denklemler",
          grade: 9,
          subtopics: [
            {
              id: 'tytmat-denklem-cozme-s1',
              name: "Bir Bilinmeyenli Denklemler",
              outcomes: [
                { id: 'tytmat-denklem-cozme-s1-k1', text: "Birinci dereceden bir bilinmeyenli denklemleri çözer." },
              ],
            },
            {
              id: 'tytmat-denklem-cozme-s2',
              name: "İki Bilinmeyenli Denklem Sistemleri",
              outcomes: [
                { id: 'tytmat-denklem-cozme-s2-k1', text: "Birinci dereceden iki bilinmeyenli denklem sistemlerini yok etme ve yerine koyma yöntemleriyle çözer." },
                { id: 'tytmat-denklem-cozme-s2-k2', text: "Denklem sisteminin çözüm kümesinin boş ya da sonsuz elemanlı olma durumlarını yorumlar." },
              ],
            },
            {
              id: 'tytmat-denklem-cozme-s3',
              name: "Denklem Kurma",
              outcomes: [
                { id: 'tytmat-denklem-cozme-s3-k1', text: "Sözel olarak verilen durumları denklem olarak ifade eder." },
              ],
            },
          ],
        },
        {
          id: 'tytmat-problemler',
          name: "Problemler",
          grade: 9,
          subtopics: [
            {
              id: 'tytmat-problemler-s1',
              name: "Sayı, Kesir ve Yaş Problemleri",
              outcomes: [
                { id: 'tytmat-problemler-s1-k1', text: "Sayı ve kesir problemlerini denklem kurarak çözer." },
                { id: 'tytmat-problemler-s1-k2', text: "Yaş problemlerinde yaş farkının değişmediğini kullanarak çözüm yapar." },
              ],
            },
            {
              id: 'tytmat-problemler-s2',
              name: "İşçi ve Havuz Problemleri",
              outcomes: [
                { id: 'tytmat-problemler-s2-k1', text: "Birim zamanda yapılan iş kavramını kullanarak işçi ve havuz problemlerini çözer." },
              ],
            },
            {
              id: 'tytmat-problemler-s3',
              name: "Hız Problemleri",
              outcomes: [
                { id: 'tytmat-problemler-s3-k1', text: "Yol = hız · zaman bağıntısını kullanarak karşılaşma, yetişme ve ortalama hız problemlerini çözer." },
              ],
            },
            {
              id: 'tytmat-problemler-s4',
              name: "Yüzde, Kâr-Zarar ve Faiz Problemleri",
              outcomes: [
                { id: 'tytmat-problemler-s4-k1', text: "Yüzde, kâr-zarar ve indirim problemlerini çözer." },
                { id: 'tytmat-problemler-s4-k2', text: "Basit faiz problemlerini çözer." },
              ],
            },
            {
              id: 'tytmat-problemler-s5',
              name: "Karışım Problemleri",
              outcomes: [
                { id: 'tytmat-problemler-s5-k1', text: "Karışımlarda saf madde miktarını ve yüzde oranını kullanarak problem çözer." },
              ],
            },
            {
              id: 'tytmat-problemler-s6',
              name: "Grafik ve Tablo Problemleri",
              outcomes: [
                { id: 'tytmat-problemler-s6-k1', text: "Grafik ve tablolarla verilen gerçek yaşam durumlarını yorumlayarak problem çözer." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-matematik-u5',
      name: "Kümeler ve Mantık",
      topics: [
        {
          id: 'tytmat-kumeler',
          name: "Kümeler ve Kartezyen Çarpım",
          grade: 9,
          subtopics: [
            {
              id: 'tytmat-kumeler-s1',
              name: "Küme Kavramı ve Alt Kümeler",
              outcomes: [
                { id: 'tytmat-kumeler-s1-k1', text: "Kümeleri liste, ortak özellik ve Venn şeması ile gösterir." },
                { id: 'tytmat-kumeler-s1-k2', text: "Alt küme sayısını hesaplar ve alt küme problemlerini çözer." },
              ],
            },
            {
              id: 'tytmat-kumeler-s2',
              name: "Kümelerle İşlemler",
              outcomes: [
                { id: 'tytmat-kumeler-s2-k1', text: "Birleşim, kesişim, fark ve tümleme işlemlerini yapar ve özelliklerini kullanır." },
                { id: 'tytmat-kumeler-s2-k2', text: "Küme işlemlerini kullanarak gerçek yaşam problemlerini çözer." },
              ],
            },
            {
              id: 'tytmat-kumeler-s3',
              name: "Kartezyen Çarpım",
              outcomes: [
                { id: 'tytmat-kumeler-s3-k1', text: "İki kümenin kartezyen çarpımını bulur ve eleman sayısını hesaplar." },
              ],
            },
          ],
        },
        {
          id: 'tytmat-mantik',
          name: "Mantık",
          grade: 9,
          subtopics: [
            {
              id: 'tytmat-mantik-s1',
              name: "Önerme ve Bileşik Önermeler",
              outcomes: [
                { id: 'tytmat-mantik-s1-k1', text: "Önermeyi, doğruluk değerini ve değilini açıklar." },
                { id: 'tytmat-mantik-s1-k2', text: "Ve, veya, ya da bağlaçlarıyla kurulan bileşik önermelerin doğruluk değerini belirler." },
              ],
            },
            {
              id: 'tytmat-mantik-s2',
              name: "Koşullu ve İki Yönlü Koşullu Önermeler",
              outcomes: [
                { id: 'tytmat-mantik-s2-k1', text: "Koşullu ve iki yönlü koşullu önermelerin doğruluk değerlerini belirler." },
                { id: 'tytmat-mantik-s2-k2', text: "Koşullu önermenin karşıtını, tersini ve karşıt tersini yazar." },
              ],
            },
            {
              id: 'tytmat-mantik-s3',
              name: "Niceleyiciler",
              outcomes: [
                { id: 'tytmat-mantik-s3-k1', text: "Her ve bazı niceleyicileriyle kurulan önermelerin değilini yazar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-matematik-u6',
      name: "Fonksiyonlar ve Polinomlar",
      topics: [
        {
          id: 'tytmat-fonksiyonlar',
          name: "Fonksiyonlar",
          grade: 10,
          subtopics: [
            {
              id: 'tytmat-fonksiyonlar-s1',
              name: "Fonksiyon Kavramı ve Gösterimi",
              outcomes: [
                { id: 'tytmat-fonksiyonlar-s1-k1', text: "Fonksiyon kavramını açıklar; tanım ve görüntü kümesini belirler." },
                { id: 'tytmat-fonksiyonlar-s1-k2', text: "Fonksiyonun grafiğinden değer okur." },
              ],
            },
            {
              id: 'tytmat-fonksiyonlar-s2',
              name: "Fonksiyon Türleri",
              outcomes: [
                { id: 'tytmat-fonksiyonlar-s2-k1', text: "Birebir, örten, sabit, birim ve doğrusal fonksiyonları ayırt eder." },
              ],
            },
            {
              id: 'tytmat-fonksiyonlar-s3',
              name: "Bileşke Fonksiyon",
              outcomes: [
                { id: 'tytmat-fonksiyonlar-s3-k1', text: "İki fonksiyonun bileşkesini bulur ve değerini hesaplar." },
              ],
            },
            {
              id: 'tytmat-fonksiyonlar-s4',
              name: "Ters Fonksiyon",
              outcomes: [
                { id: 'tytmat-fonksiyonlar-s4-k1', text: "Birebir ve örten bir fonksiyonun tersini bulur ve ters fonksiyon özelliklerini kullanır." },
              ],
            },
          ],
        },
        {
          id: 'tytmat-polinomlar',
          name: "Polinomlar",
          grade: 10,
          subtopics: [
            {
              id: 'tytmat-polinomlar-s1',
              name: "Polinom Kavramı",
              outcomes: [
                { id: 'tytmat-polinomlar-s1-k1', text: "Polinomun derecesini, katsayılarını ve sabit terimini belirler." },
                { id: 'tytmat-polinomlar-s1-k2', text: "Katsayılar toplamını ve sabit terimi uygun değer yazarak hesaplar." },
              ],
            },
            {
              id: 'tytmat-polinomlar-s2',
              name: "Polinomlarla İşlemler",
              outcomes: [
                { id: 'tytmat-polinomlar-s2-k1', text: "Polinomlarla toplama, çıkarma ve çarpma işlemleri yapar." },
              ],
            },
            {
              id: 'tytmat-polinomlar-s3',
              name: "Polinom Bölmesi ve Kalan",
              outcomes: [
                { id: 'tytmat-polinomlar-s3-k1', text: "Bir polinomun birinci dereceden bir polinoma bölümünden kalanı hesaplar." },
                { id: 'tytmat-polinomlar-s3-k2', text: "Çarpan ve kök kavramları arasındaki ilişkiyi kullanır." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-matematik-u7',
      name: "Sayma ve Olasılık",
      topics: [
        {
          id: 'tytmat-permutasyon-kombinasyon',
          name: "Permütasyon ve Kombinasyon",
          grade: 10,
          subtopics: [
            {
              id: 'tytmat-permutasyon-kombinasyon-s1',
              name: "Sayma Yöntemleri",
              outcomes: [
                { id: 'tytmat-permutasyon-kombinasyon-s1-k1', text: "Toplama ve çarpma yoluyla sayma prensiplerini kullanır." },
              ],
            },
            {
              id: 'tytmat-permutasyon-kombinasyon-s2',
              name: "Permütasyon",
              outcomes: [
                { id: 'tytmat-permutasyon-kombinasyon-s2-k1', text: "n elemanın r’li permütasyonlarını hesaplar." },
                { id: 'tytmat-permutasyon-kombinasyon-s2-k2', text: "Tekrarlı ve dairesel permütasyon problemlerini çözer." },
              ],
            },
            {
              id: 'tytmat-permutasyon-kombinasyon-s3',
              name: "Kombinasyon",
              outcomes: [
                { id: 'tytmat-permutasyon-kombinasyon-s3-k1', text: "n elemanın r’li kombinasyonlarını hesaplar ve kombinasyon özelliklerini kullanır." },
                { id: 'tytmat-permutasyon-kombinasyon-s3-k2', text: "Seçme ve gruplandırma problemlerini kombinasyonla çözer." },
              ],
            },
            {
              id: 'tytmat-permutasyon-kombinasyon-s4',
              name: "Binom Açılımı",
              outcomes: [
                { id: 'tytmat-permutasyon-kombinasyon-s4-k1', text: "(x + y)ⁿ açılımında katsayıları ve istenen terimi bulur." },
              ],
            },
          ],
        },
        {
          id: 'tytmat-olasilik',
          name: "Olasılık",
          grade: 10,
          subtopics: [
            {
              id: 'tytmat-olasilik-s1',
              name: "Örnek Uzay ve Olay",
              outcomes: [
                { id: 'tytmat-olasilik-s1-k1', text: "Deney, çıktı, örnek uzay ve olay kavramlarını açıklar." },
              ],
            },
            {
              id: 'tytmat-olasilik-s2',
              name: "Olasılık Hesabı",
              outcomes: [
                { id: 'tytmat-olasilik-s2-k1', text: "Eş olasılı örnek uzayda bir olayın olasılığını hesaplar." },
                { id: 'tytmat-olasilik-s2-k2', text: "Tümleyen olayın olasılığını kullanarak problem çözer." },
              ],
            },
            {
              id: 'tytmat-olasilik-s3',
              name: "Bileşik Olaylar",
              outcomes: [
                { id: 'tytmat-olasilik-s3-k1', text: "Bağımsız ve bağımlı olayların olasılıklarını hesaplar." },
                { id: 'tytmat-olasilik-s3-k2', text: "Ayrık olmayan olaylarda birleşim olasılığını hesaplar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-matematik-u8',
      name: "Veri ve İstatistik",
      topics: [
        {
          id: 'tytmat-veri-istatistik',
          name: "Veri, İstatistik ve Grafikler",
          grade: 9,
          subtopics: [
            {
              id: 'tytmat-veri-istatistik-s1',
              name: "Merkezi Eğilim Ölçüleri",
              outcomes: [
                { id: 'tytmat-veri-istatistik-s1-k1', text: "Aritmetik ortalama, ortanca ve tepe değeri hesaplar ve yorumlar." },
              ],
            },
            {
              id: 'tytmat-veri-istatistik-s2',
              name: "Yayılım Ölçüleri",
              outcomes: [
                { id: 'tytmat-veri-istatistik-s2-k1', text: "Açıklık, alt çeyrek, üst çeyrek ve çeyrekler açıklığını hesaplar." },
                { id: 'tytmat-veri-istatistik-s2-k2', text: "Standart sapmayı hesaplar ve veri gruplarının yayılımını karşılaştırır." },
              ],
            },
            {
              id: 'tytmat-veri-istatistik-s3',
              name: "Grafikler",
              outcomes: [
                { id: 'tytmat-veri-istatistik-s3-k1', text: "Sütun, daire, çizgi grafiği ve histogramı oluşturur ve yorumlar." },
                { id: 'tytmat-veri-istatistik-s3-k2', text: "Daire grafiğinde merkez açı ile veri miktarı arasındaki ilişkiyi kullanır." },
              ],
            },
          ],
        },
      ],
    },
  ],
};
