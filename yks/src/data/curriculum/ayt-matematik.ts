import type { Subject } from '../../domain/types';

/**
 * AYT Matematik müfredatı — MEB 2018 Ortaöğretim Matematik (9–12) programı
 * mantığıyla ünite/konu/alt konu/kazanım olarak düzenlenmiştir.
 * Geometri konuları ayrı derste (ayt-geometri) yer alır.
 */
export const subject: Subject = {
  id: 'ayt-matematik',
  exam: 'AYT',
  name: 'AYT Matematik',
  icon: "ƒ",
  examQuestionCount: 30,
  note: "AYT Matematik testi 40 sorudur; yaklaşık 10 soru geometriden gelir (AYT Geometri dersine bakın).",
  units: [
    {
      id: 'ayt-matematik-u1',
      name: "Fonksiyonlar",
      topics: [
        {
          id: 'aytmat-fonksiyonlar',
          name: "Fonksiyonlar",
          grade: 11,
          priority: true,
          subtopics: [
            {
              id: 'aytmat-fonksiyonlar-s1',
              name: "Fonksiyon Kavramı, Tanım ve Görüntü Kümesi",
              outcomes: [
                { id: 'aytmat-fonksiyonlar-s1-k1', text: "Fonksiyon kavramını açıklar; bir bağıntının fonksiyon olup olmadığını belirler." },
                { id: 'aytmat-fonksiyonlar-s1-k2', text: "Fonksiyonun en geniş tanım kümesini ve görüntü kümesini bulur." },
              ],
            },
            {
              id: 'aytmat-fonksiyonlar-s2',
              name: "Fonksiyon Çeşitleri ve Özellikleri",
              outcomes: [
                { id: 'aytmat-fonksiyonlar-s2-k1', text: "Birebir, örten, içine, sabit, birim ve doğrusal fonksiyonları ayırt eder." },
                { id: 'aytmat-fonksiyonlar-s2-k2', text: "Tek ve çift fonksiyonları cebirsel ve grafiksel olarak yorumlar." },
                { id: 'aytmat-fonksiyonlar-s2-k3', text: "Parçalı tanımlı fonksiyonlarda değer hesaplar." },
              ],
            },
            {
              id: 'aytmat-fonksiyonlar-s3',
              name: "Fonksiyonlarda Bileşke İşlemi",
              outcomes: [
                { id: 'aytmat-fonksiyonlar-s3-k1', text: "İki fonksiyonun bileşkesini oluşturur ve bileşke işleminin özelliklerini açıklar." },
                { id: 'aytmat-fonksiyonlar-s3-k2', text: "Bileşke içindeki bilinmeyen fonksiyonu bulur." },
              ],
            },
            {
              id: 'aytmat-fonksiyonlar-s4',
              name: "Ters Fonksiyon",
              outcomes: [
                { id: 'aytmat-fonksiyonlar-s4-k1', text: "Bir fonksiyonun tersinin var olma koşulunu açıklar ve ters fonksiyonu bulur." },
                { id: 'aytmat-fonksiyonlar-s4-k2', text: "Bileşke ve ters fonksiyon özelliklerini birlikte kullanarak değer hesaplar." },
              ],
            },
            {
              id: 'aytmat-fonksiyonlar-s5',
              name: "Fonksiyon Grafikleri ve Dönüşümler",
              outcomes: [
                { id: 'aytmat-fonksiyonlar-s5-k1', text: "Fonksiyon grafiğinden tanım, görüntü, artanlık-azalanlık ve işaret bilgisini yorumlar." },
                { id: 'aytmat-fonksiyonlar-s5-k2', text: "y = f(x − a) + b, y = −f(x), y = f(−x), y = |f(x)| dönüşümlerinin grafiğe etkisini açıklar." },
                { id: 'aytmat-fonksiyonlar-s5-k3', text: "Ortalama değişim hızını hesaplar ve yorumlar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-matematik-u2',
      name: "Polinomlar",
      topics: [
        {
          id: 'aytmat-polinomlar',
          name: "Polinomlar",
          grade: 10,
          priority: true,
          subtopics: [
            {
              id: 'aytmat-polinomlar-s1',
              name: "Polinom Kavramı ve Temel Kavramlar",
              outcomes: [
                { id: 'aytmat-polinomlar-s1-k1', text: "Bir ifadenin polinom olup olmadığını belirler; derece, baş katsayı ve sabit terimi bulur." },
                { id: 'aytmat-polinomlar-s1-k2', text: "Katsayılar toplamını ve sabit terimi P(1) ve P(0) ile hesaplar." },
              ],
            },
            {
              id: 'aytmat-polinomlar-s2',
              name: "Polinomlarda İşlemler",
              outcomes: [
                { id: 'aytmat-polinomlar-s2-k1', text: "Polinomlarda toplama, çıkarma ve çarpma işlemleri yapar; sonucun derecesini belirler." },
                { id: 'aytmat-polinomlar-s2-k2', text: "Polinom eşitliğini kullanarak bilinmeyen katsayıları bulur." },
              ],
            },
            {
              id: 'aytmat-polinomlar-s3',
              name: "Polinomlarda Bölme ve Kalan Teoremi",
              outcomes: [
                { id: 'aytmat-polinomlar-s3-k1', text: "Polinom bölmesi yapar; bölüm ve kalanı belirler." },
                { id: 'aytmat-polinomlar-s3-k2', text: "Kalan teoremini kullanarak birinci ve ikinci dereceden bölenlere göre kalanı bulur." },
              ],
            },
            {
              id: 'aytmat-polinomlar-s4',
              name: "Çarpanlara Ayırma ve Polinomun Kökleri",
              outcomes: [
                { id: 'aytmat-polinomlar-s4-k1', text: "Çarpan teoremini kullanarak polinomun çarpanlarını ve köklerini bulur." },
                { id: 'aytmat-polinomlar-s4-k2', text: "Kökler ile katsayılar arasındaki ilişkileri kullanır." },
              ],
            },
            {
              id: 'aytmat-polinomlar-s5',
              name: "Rasyonel İfadeler",
              outcomes: [
                { id: 'aytmat-polinomlar-s5-k1', text: "Rasyonel ifadeleri sadeleştirir ve rasyonel ifadelerle işlem yapar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-matematik-u3',
      name: "İkinci Dereceden Denklemler ve Karmaşık Sayılar",
      topics: [
        {
          id: 'aytmat-ikinci-derece-denklemler',
          name: "İkinci Dereceden Denklemler",
          grade: 10,
          subtopics: [
            {
              id: 'aytmat-ikinci-derece-denklemler-s1',
              name: "Denklemin Çözümü ve Diskriminant",
              outcomes: [
                { id: 'aytmat-ikinci-derece-denklemler-s1-k1', text: "İkinci dereceden bir bilinmeyenli denklemleri çarpanlara ayırarak ve diskriminant yardımıyla çözer." },
                { id: 'aytmat-ikinci-derece-denklemler-s1-k2', text: "Diskriminantın işaretine göre köklerin durumunu yorumlar." },
              ],
            },
            {
              id: 'aytmat-ikinci-derece-denklemler-s2',
              name: "Kökler ile Katsayılar Arasındaki Bağıntılar",
              outcomes: [
                { id: 'aytmat-ikinci-derece-denklemler-s2-k1', text: "Kökler toplamı ve çarpımını kullanarak köklerin simetrik ifadelerini hesaplar." },
                { id: 'aytmat-ikinci-derece-denklemler-s2-k2', text: "Kökleri verilen ikinci dereceden denklemi oluşturur." },
              ],
            },
            {
              id: 'aytmat-ikinci-derece-denklemler-s3',
              name: "İkinci Dereceye İndirgenebilen Denklemler",
              outcomes: [
                { id: 'aytmat-ikinci-derece-denklemler-s3-k1', text: "Değişken değiştirme yöntemiyle ikinci dereceye indirgenebilen denklemleri çözer." },
              ],
            },
          ],
        },
        {
          id: 'aytmat-karmasik-sayilar',
          name: "Karmaşık Sayılar",
          grade: 10,
          subtopics: [
            {
              id: 'aytmat-karmasik-sayilar-s1',
              name: "Karmaşık Sayı Kavramı ve i’nin Kuvvetleri",
              outcomes: [
                { id: 'aytmat-karmasik-sayilar-s1-k1', text: "Karmaşık sayıyı, reel ve sanal kısmını açıklar; i’nin kuvvetlerini hesaplar." },
              ],
            },
            {
              id: 'aytmat-karmasik-sayilar-s2',
              name: "Karmaşık Sayılarda İşlemler ve Eşlenik",
              outcomes: [
                { id: 'aytmat-karmasik-sayilar-s2-k1', text: "Karmaşık sayılarla dört işlem yapar; eşleniği kullanarak bölme yapar." },
                { id: 'aytmat-karmasik-sayilar-s2-k2', text: "İki karmaşık sayının eşitliğini kullanarak bilinmeyenleri bulur." },
              ],
            },
            {
              id: 'aytmat-karmasik-sayilar-s3',
              name: "Karmaşık Kökler ve Karmaşık Düzlem",
              outcomes: [
                { id: 'aytmat-karmasik-sayilar-s3-k1', text: "Diskriminantı negatif olan ikinci dereceden denklemlerin karmaşık köklerini bulur." },
                { id: 'aytmat-karmasik-sayilar-s3-k2', text: "Karmaşık sayının mutlak değerini (modülünü) hesaplar ve düzlemde gösterir." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-matematik-u4',
      name: "İkinci Dereceden Fonksiyonlar ve Eşitsizlikler",
      topics: [
        {
          id: 'aytmat-parabol',
          name: "İkinci Dereceden Fonksiyonlar ve Parabol",
          grade: 11,
          subtopics: [
            {
              id: 'aytmat-parabol-s1',
              name: "Parabolün Tepe Noktası ve Simetri Ekseni",
              outcomes: [
                { id: 'aytmat-parabol-s1-k1', text: "İkinci dereceden fonksiyonun tepe noktasını ve simetri eksenini bulur." },
                { id: 'aytmat-parabol-s1-k2', text: "İkinci dereceden fonksiyonun en büyük ya da en küçük değerini hesaplar." },
              ],
            },
            {
              id: 'aytmat-parabol-s2',
              name: "Parabol Grafiği ve Eksenlerle Kesişim",
              outcomes: [
                { id: 'aytmat-parabol-s2-k1', text: "Katsayıların işaretlerini parabol grafiğinden yorumlar." },
                { id: 'aytmat-parabol-s2-k2', text: "Verilen bilgilerden parabolün denklemini yazar." },
              ],
            },
            {
              id: 'aytmat-parabol-s3',
              name: "Parabol ile Doğrunun Durumu ve Modelleme",
              outcomes: [
                { id: 'aytmat-parabol-s3-k1', text: "Bir parabol ile bir doğrunun birbirine göre durumunu diskriminantla belirler." },
                { id: 'aytmat-parabol-s3-k2', text: "İkinci dereceden fonksiyonlarla gerçek hayat problemlerini modeller." },
              ],
            },
          ],
        },
        {
          id: 'aytmat-esitsizlikler',
          name: "Eşitsizlikler",
          grade: 11,
          subtopics: [
            {
              id: 'aytmat-esitsizlikler-s1',
              name: "İkinci Dereceden Eşitsizlikler ve İşaret Tablosu",
              outcomes: [
                { id: 'aytmat-esitsizlikler-s1-k1', text: "İkinci dereceden bir fonksiyonun işaretini inceler ve eşitsizliklerin çözüm kümesini bulur." },
              ],
            },
            {
              id: 'aytmat-esitsizlikler-s2',
              name: "Çarpım ve Bölüm Biçimindeki Eşitsizlikler",
              outcomes: [
                { id: 'aytmat-esitsizlikler-s2-k1', text: "Çarpım ve bölüm biçimindeki eşitsizlikleri işaret tablosuyla çözer; çift katlı kökleri yorumlar." },
              ],
            },
            {
              id: 'aytmat-esitsizlikler-s3',
              name: "Eşitsizlik Sistemleri ve Köklerin İşareti",
              outcomes: [
                { id: 'aytmat-esitsizlikler-s3-k1', text: "İkinci dereceden eşitsizlik sistemlerinin çözüm kümesini bulur." },
                { id: 'aytmat-esitsizlikler-s3-k2', text: "Her x için sağlanma ve köklerin işaretine ilişkin koşulları diskriminant, toplam ve çarpımla belirler." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-matematik-u5',
      name: "Trigonometri",
      topics: [
        {
          id: 'aytmat-trigonometri',
          name: "Trigonometri",
          grade: 11,
          priority: true,
          subtopics: [
            {
              id: 'aytmat-trigonometri-s1',
              name: "Yönlü Açılar, Birim Çember ve Trigonometrik Oranlar",
              outcomes: [
                { id: 'aytmat-trigonometri-s1-k1', text: "Derece ve radyan ölçü birimlerini birbirine dönüştürür; esas ölçüyü bulur." },
                { id: 'aytmat-trigonometri-s1-k2', text: "Birim çember yardımıyla trigonometrik fonksiyonları tanımlar ve bölgelere göre işaretlerini belirler." },
              ],
            },
            {
              id: 'aytmat-trigonometri-s2',
              name: "Dönüşüm (İndirgeme) Formülleri ve Temel Özdeşlikler",
              outcomes: [
                { id: 'aytmat-trigonometri-s2-k1', text: "Herhangi bir açının trigonometrik değerini dar açıya indirgeyerek hesaplar." },
                { id: 'aytmat-trigonometri-s2-k2', text: "sin²x + cos²x = 1 ve tanx·cotx = 1 özdeşliklerini kullanarak ifadeleri sadeleştirir." },
              ],
            },
            {
              id: 'aytmat-trigonometri-s3',
              name: "Kosinüs ve Sinüs Teoremleri",
              outcomes: [
                { id: 'aytmat-trigonometri-s3-k1', text: "Kosinüs ve sinüs teoremlerini kullanarak üçgende kenar ve açı hesaplar." },
              ],
            },
            {
              id: 'aytmat-trigonometri-s4',
              name: "Toplam-Fark ve İki Kat Açı Formülleri",
              outcomes: [
                { id: 'aytmat-trigonometri-s4-k1', text: "Toplam ve fark formüllerini kullanarak trigonometrik değer hesaplar." },
                { id: 'aytmat-trigonometri-s4-k2', text: "İki kat açı formüllerini kullanarak ifadeleri sadeleştirir." },
              ],
            },
            {
              id: 'aytmat-trigonometri-s5',
              name: "Trigonometrik Fonksiyonların Grafikleri ve Periyot",
              outcomes: [
                { id: 'aytmat-trigonometri-s5-k1', text: "Trigonometrik fonksiyonların periyodunu, en büyük ve en küçük değerlerini bulur." },
                { id: 'aytmat-trigonometri-s5-k2', text: "Trigonometrik fonksiyonların grafiklerini ve ters trigonometrik fonksiyonları yorumlar." },
              ],
            },
            {
              id: 'aytmat-trigonometri-s6',
              name: "Trigonometrik Denklemler",
              outcomes: [
                { id: 'aytmat-trigonometri-s6-k1', text: "Trigonometrik denklemlerin çözüm kümesini bulur; belirli aralıktaki kökleri sayar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-matematik-u6',
      name: "Üstel ve Logaritmik Fonksiyonlar",
      topics: [
        {
          id: 'aytmat-ustel-fonksiyon',
          name: "Üstel Fonksiyon",
          grade: 12,
          subtopics: [
            {
              id: 'aytmat-ustel-fonksiyon-s1',
              name: "Üstel Fonksiyon ve Grafiği",
              outcomes: [
                { id: 'aytmat-ustel-fonksiyon-s1-k1', text: "Üstel fonksiyonu tanımlar; tabanın 1’den büyük ya da küçük olmasına göre grafiğini yorumlar." },
              ],
            },
            {
              id: 'aytmat-ustel-fonksiyon-s2',
              name: "Üstel Denklemler ve Eşitsizlikler",
              outcomes: [
                { id: 'aytmat-ustel-fonksiyon-s2-k1', text: "Üstel denklemleri tabanları eşitleyerek ya da değişken değiştirerek çözer." },
                { id: 'aytmat-ustel-fonksiyon-s2-k2', text: "Üstel eşitsizliklerin çözüm kümesini tabana göre yön belirleyerek bulur." },
              ],
            },
            {
              id: 'aytmat-ustel-fonksiyon-s3',
              name: "Üstel Büyüme ve Azalma Modelleri",
              outcomes: [
                { id: 'aytmat-ustel-fonksiyon-s3-k1', text: "Nüfus artışı, bileşik faiz ve radyoaktif bozunma gibi durumları üstel fonksiyonlarla modeller." },
              ],
            },
          ],
        },
        {
          id: 'aytmat-logaritma',
          name: "Logaritma Fonksiyonu",
          grade: 12,
          priority: true,
          subtopics: [
            {
              id: 'aytmat-logaritma-s1',
              name: "Logaritmanın Tanımı ve Tanımlılık Koşulları",
              outcomes: [
                { id: 'aytmat-logaritma-s1-k1', text: "Logaritma fonksiyonunu üstel fonksiyonun tersi olarak tanımlar." },
                { id: 'aytmat-logaritma-s1-k2', text: "Logaritmik ifadenin tanımlı olması için taban ve argüman koşullarını belirler." },
              ],
            },
            {
              id: 'aytmat-logaritma-s2',
              name: "Logaritmanın Özellikleri",
              outcomes: [
                { id: 'aytmat-logaritma-s2-k1', text: "Çarpım, bölüm ve kuvvet özelliklerini kullanarak logaritmik ifadeleri hesaplar." },
                { id: 'aytmat-logaritma-s2-k2', text: "Taban değiştirme kuralını kullanarak ifadeleri verilen logaritmalar cinsinden yazar." },
              ],
            },
            {
              id: 'aytmat-logaritma-s3',
              name: "Onluk ve Doğal Logaritma",
              outcomes: [
                { id: 'aytmat-logaritma-s3-k1', text: "Onluk ve doğal logaritmayı açıklar; bir sayının basamak sayısını logaritmayla belirler." },
              ],
            },
            {
              id: 'aytmat-logaritma-s4',
              name: "Logaritmik Denklemler ve Eşitsizlikler",
              outcomes: [
                { id: 'aytmat-logaritma-s4-k1', text: "Logaritmik denklemleri tanım koşullarını gözeterek çözer." },
                { id: 'aytmat-logaritma-s4-k2', text: "Logaritmik eşitsizliklerin çözüm kümesini tabana göre yön belirleyerek bulur." },
              ],
            },
            {
              id: 'aytmat-logaritma-s5',
              name: "Logaritma Fonksiyonunun Grafiği ve Modelleme",
              outcomes: [
                { id: 'aytmat-logaritma-s5-k1', text: "Logaritma fonksiyonunun grafiğini çizer ve üstel fonksiyonla simetrisini yorumlar." },
                { id: 'aytmat-logaritma-s5-k2', text: "Gerçek hayat durumlarını (pH, deprem büyüklüğü, faiz) logaritma ile modeller." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-matematik-u7',
      name: "Diziler",
      topics: [
        {
          id: 'aytmat-diziler',
          name: "Diziler",
          grade: 12,
          priority: true,
          subtopics: [
            {
              id: 'aytmat-diziler-s1',
              name: "Dizi Kavramı ve Genel Terim",
              outcomes: [
                { id: 'aytmat-diziler-s1-k1', text: "Dizi kavramını açıklar; genel terimi verilen dizinin terimlerini bulur." },
                { id: 'aytmat-diziler-s1-k2', text: "Sonlu ve sabit dizileri, dizilerin eşitliğini açıklar." },
              ],
            },
            {
              id: 'aytmat-diziler-s2',
              name: "Özyinelemeli (Rekürsif) Diziler",
              outcomes: [
                { id: 'aytmat-diziler-s2-k1', text: "Özyinelemeli olarak tanımlanan dizilerin terimlerini bulur." },
              ],
            },
            {
              id: 'aytmat-diziler-s3',
              name: "Aritmetik Dizi",
              outcomes: [
                { id: 'aytmat-diziler-s3-k1', text: "Aritmetik dizinin genel terimini ve ortak farkını bulur." },
                { id: 'aytmat-diziler-s3-k2', text: "Aritmetik dizinin ilk n terim toplamını hesaplar." },
              ],
            },
            {
              id: 'aytmat-diziler-s4',
              name: "Geometrik Dizi",
              outcomes: [
                { id: 'aytmat-diziler-s4-k1', text: "Geometrik dizinin genel terimini ve ortak çarpanını bulur." },
                { id: 'aytmat-diziler-s4-k2', text: "Geometrik dizinin ilk n terim toplamını hesaplar." },
              ],
            },
            {
              id: 'aytmat-diziler-s5',
              name: "Toplam Sembolü ve Dizi Problemleri",
              outcomes: [
                { id: 'aytmat-diziler-s5-k1', text: "Toplam (Σ) sembolünün özelliklerini kullanarak toplamları hesaplar." },
                { id: 'aytmat-diziler-s5-k2', text: "Gerçek hayat durumlarını aritmetik ve geometrik dizilerle modeller." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-matematik-u8',
      name: "Sayma ve Olasılık",
      topics: [
        {
          id: 'aytmat-permutasyon-kombinasyon-binom',
          name: "Permütasyon, Kombinasyon ve Binom",
          grade: 10,
          subtopics: [
            {
              id: 'aytmat-permutasyon-kombinasyon-binom-s1',
              name: "Sayma Yöntemleri ve Faktöriyel",
              outcomes: [
                { id: 'aytmat-permutasyon-kombinasyon-binom-s1-k1', text: "Toplama ve çarpma yoluyla sayma yöntemlerini kullanır; faktöriyel kavramını açıklar." },
              ],
            },
            {
              id: 'aytmat-permutasyon-kombinasyon-binom-s2',
              name: "Permütasyon",
              outcomes: [
                { id: 'aytmat-permutasyon-kombinasyon-binom-s2-k1', text: "n elemanlı bir kümenin r’li permütasyonlarının sayısını hesaplar." },
                { id: 'aytmat-permutasyon-kombinasyon-binom-s2-k2', text: "Tekrarlı ve dairesel permütasyon problemlerini çözer." },
              ],
            },
            {
              id: 'aytmat-permutasyon-kombinasyon-binom-s3',
              name: "Kombinasyon",
              outcomes: [
                { id: 'aytmat-permutasyon-kombinasyon-binom-s3-k1', text: "n elemanlı bir kümenin r’li kombinasyonlarının sayısını hesaplar ve özelliklerini kullanır." },
                { id: 'aytmat-permutasyon-kombinasyon-binom-s3-k2', text: "Seçme ve gruplama problemlerini kombinasyonla çözer." },
              ],
            },
            {
              id: 'aytmat-permutasyon-kombinasyon-binom-s4',
              name: "Pascal Üçgeni ve Binom Açılımı",
              outcomes: [
                { id: 'aytmat-permutasyon-kombinasyon-binom-s4-k1', text: "Pascal üçgenini oluşturur; binom açılımında istenen terimi ve katsayılar toplamını bulur." },
              ],
            },
          ],
        },
        {
          id: 'aytmat-olasilik',
          name: "Olasılık",
          grade: 10,
          subtopics: [
            {
              id: 'aytmat-olasilik-s1',
              name: "Örnek Uzay, Olay ve Olasılık",
              outcomes: [
                { id: 'aytmat-olasilik-s1-k1', text: "Deney, örnek uzay ve olay kavramlarını açıklar; eş olumlu örnek uzayda olasılık hesaplar." },
              ],
            },
            {
              id: 'aytmat-olasilik-s2',
              name: "Olasılık Kuralları ve Bileşik Olaylar",
              outcomes: [
                { id: 'aytmat-olasilik-s2-k1', text: "Ayrık olmayan olaylar ve tümleyen olay için olasılık kurallarını kullanır." },
                { id: 'aytmat-olasilik-s2-k2', text: "Bağımsız ve bağımlı olayların olasılıklarını hesaplar." },
              ],
            },
            {
              id: 'aytmat-olasilik-s3',
              name: "Koşullu Olasılık",
              outcomes: [
                { id: 'aytmat-olasilik-s3-k1', text: "Koşullu olasılığı açıklar ve hesaplar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-matematik-u9',
      name: "Limit ve Süreklilik",
      topics: [
        {
          id: 'aytmat-limit',
          name: "Limit",
          grade: 12,
          priority: true,
          subtopics: [
            {
              id: 'aytmat-limit-s1',
              name: "Limit Kavramı, Sağdan ve Soldan Limit",
              outcomes: [
                { id: 'aytmat-limit-s1-k1', text: "Bir fonksiyonun bir noktadaki limitini sağdan ve soldan limitlerle açıklar." },
                { id: 'aytmat-limit-s1-k2', text: "Grafiği verilen fonksiyonun limitini yorumlar." },
              ],
            },
            {
              id: 'aytmat-limit-s2',
              name: "Limit Özellikleri ve Parçalı Fonksiyonlar",
              outcomes: [
                { id: 'aytmat-limit-s2-k1', text: "Limit özelliklerini kullanarak limit hesaplar." },
                { id: 'aytmat-limit-s2-k2', text: "Parçalı, mutlak değer ve tam değer içeren fonksiyonların limitini hesaplar." },
              ],
            },
            {
              id: 'aytmat-limit-s3',
              name: "Belirsizlik Durumları",
              outcomes: [
                { id: 'aytmat-limit-s3-k1', text: "0/0 ve ∞/∞ belirsizliklerini çarpanlara ayırma ve eşlenikle çarpma yoluyla giderir." },
              ],
            },
            {
              id: 'aytmat-limit-s4',
              name: "Sonsuzda Limit ve Trigonometrik Limitler",
              outcomes: [
                { id: 'aytmat-limit-s4-k1', text: "Sonsuzdaki limitleri ve sonsuz limitleri hesaplar." },
                { id: 'aytmat-limit-s4-k2', text: "Trigonometrik fonksiyonların limitlerini hesaplar." },
              ],
            },
          ],
        },
        {
          id: 'aytmat-sureklilik',
          name: "Süreklilik",
          grade: 12,
          priority: true,
          subtopics: [
            {
              id: 'aytmat-sureklilik-s1',
              name: "Bir Noktada Süreklilik",
              outcomes: [
                { id: 'aytmat-sureklilik-s1-k1', text: "Bir fonksiyonun bir noktada sürekli olma koşullarını açıklar." },
                { id: 'aytmat-sureklilik-s1-k2', text: "Parçalı fonksiyonları sürekli yapan parametre değerlerini bulur." },
              ],
            },
            {
              id: 'aytmat-sureklilik-s2',
              name: "Süreksizlik Noktaları ve Aralıkta Süreklilik",
              outcomes: [
                { id: 'aytmat-sureklilik-s2-k1', text: "Bir fonksiyonun süreksiz olduğu noktaları belirler." },
                { id: 'aytmat-sureklilik-s2-k2', text: "Sürekli fonksiyonların özelliklerini ve ara değer özelliğini yorumlar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-matematik-u10',
      name: "Türev",
      topics: [
        {
          id: 'aytmat-turev',
          name: "Türev",
          grade: 12,
          priority: true,
          subtopics: [
            {
              id: 'aytmat-turev-s1',
              name: "Türev Kavramı ve Anlık Değişim Oranı",
              outcomes: [
                { id: 'aytmat-turev-s1-k1', text: "Türevi anlık değişim oranı ve teğet eğimi olarak açıklar." },
                { id: 'aytmat-turev-s1-k2', text: "Bir fonksiyonun bir noktada türevli olma koşulunu sağdan ve soldan türevle belirler." },
              ],
            },
            {
              id: 'aytmat-turev-s2',
              name: "Türev Alma Kuralları",
              outcomes: [
                { id: 'aytmat-turev-s2-k1', text: "Toplam, fark, çarpım ve bölüm kurallarını kullanarak türev alır." },
                { id: 'aytmat-turev-s2-k2', text: "Bileşke fonksiyonun türevini zincir kuralıyla hesaplar." },
              ],
            },
            {
              id: 'aytmat-turev-s3',
              name: "Özel Fonksiyonların Türevi",
              outcomes: [
                { id: 'aytmat-turev-s3-k1', text: "Trigonometrik, üstel ve logaritmik fonksiyonların türevlerini hesaplar." },
                { id: 'aytmat-turev-s3-k2', text: "Mutlak değer ve parçalı fonksiyonların türevini hesaplar." },
              ],
            },
            {
              id: 'aytmat-turev-s4',
              name: "Ardışık Türevler ve Türevle Limit",
              outcomes: [
                { id: 'aytmat-turev-s4-k1', text: "İkinci ve daha yüksek mertebeden türevleri hesaplar." },
              ],
            },
          ],
        },
        {
          id: 'aytmat-turev-uygulamalari',
          name: "Türevin Uygulamaları",
          grade: 12,
          priority: true,
          subtopics: [
            {
              id: 'aytmat-turev-uygulamalari-s1',
              name: "Teğet ve Normal Doğrusu",
              outcomes: [
                { id: 'aytmat-turev-uygulamalari-s1-k1', text: "Bir eğriye verilen noktadaki teğet ve normal doğrusunun denklemini yazar." },
              ],
            },
            {
              id: 'aytmat-turev-uygulamalari-s2',
              name: "Artan-Azalan Fonksiyonlar",
              outcomes: [
                { id: 'aytmat-turev-uygulamalari-s2-k1', text: "Türevin işaretinden fonksiyonun artan ve azalan olduğu aralıkları belirler." },
              ],
            },
            {
              id: 'aytmat-turev-uygulamalari-s3',
              name: "Ekstremum Noktaları",
              outcomes: [
                { id: 'aytmat-turev-uygulamalari-s3-k1', text: "Yerel ve mutlak ekstremum noktalarını birinci türev testiyle bulur." },
                { id: 'aytmat-turev-uygulamalari-s3-k2', text: "Kapalı aralıkta fonksiyonun en büyük ve en küçük değerini bulur." },
              ],
            },
            {
              id: 'aytmat-turev-uygulamalari-s4',
              name: "İkinci Türev, Konkavlık ve Büküm Noktası",
              outcomes: [
                { id: 'aytmat-turev-uygulamalari-s4-k1', text: "İkinci türevin işaretinden konkavlığı ve büküm noktalarını belirler." },
              ],
            },
            {
              id: 'aytmat-turev-uygulamalari-s5',
              name: "Optimizasyon ve Grafik Yorumu",
              outcomes: [
                { id: 'aytmat-turev-uygulamalari-s5-k1', text: "Maksimum-minimum problemlerini türev yardımıyla çözer." },
                { id: 'aytmat-turev-uygulamalari-s5-k2', text: "f, f′ ve f″ grafikleri arasındaki ilişkileri yorumlar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-matematik-u11',
      name: "İntegral",
      topics: [
        {
          id: 'aytmat-integral',
          name: "İntegral",
          grade: 12,
          priority: true,
          subtopics: [
            {
              id: 'aytmat-integral-s1',
              name: "Belirsiz İntegral ve Temel Kurallar",
              outcomes: [
                { id: 'aytmat-integral-s1-k1', text: "Belirsiz integral kavramını türevle ilişkilendirerek açıklar ve temel integral kurallarını kullanır." },
              ],
            },
            {
              id: 'aytmat-integral-s2',
              name: "Değişken Değiştirme Yöntemi",
              outcomes: [
                { id: 'aytmat-integral-s2-k1', text: "Değişken değiştirme yöntemiyle belirsiz ve belirli integral hesaplar." },
              ],
            },
            {
              id: 'aytmat-integral-s3',
              name: "Riemann Toplamı ve Belirli İntegral",
              outcomes: [
                { id: 'aytmat-integral-s3-k1', text: "Bir eğri altındaki alanı Riemann toplamıyla yaklaşık olarak hesaplar." },
                { id: 'aytmat-integral-s3-k2', text: "Belirli integralin özelliklerini ve integral hesabın temel teoremini kullanır." },
              ],
            },
            {
              id: 'aytmat-integral-s4',
              name: "Parçalı ve Mutlak Değerli Fonksiyonların İntegrali",
              outcomes: [
                { id: 'aytmat-integral-s4-k1', text: "Parçalı tanımlı ve mutlak değer içeren fonksiyonların belirli integralini hesaplar." },
              ],
            },
          ],
        },
        {
          id: 'aytmat-integral-uygulamalari',
          name: "İntegralin Uygulamaları",
          grade: 12,
          priority: true,
          subtopics: [
            {
              id: 'aytmat-integral-uygulamalari-s1',
              name: "Eğri ile Eksen Arasındaki Alan",
              outcomes: [
                { id: 'aytmat-integral-uygulamalari-s1-k1', text: "Bir eğri ile x ekseni ya da y ekseni arasında kalan alanı belirli integralle hesaplar." },
              ],
            },
            {
              id: 'aytmat-integral-uygulamalari-s2',
              name: "İki Eğri Arasındaki Alan",
              outcomes: [
                { id: 'aytmat-integral-uygulamalari-s2-k1', text: "İki eğri arasında kalan bölgenin alanını hesaplar." },
              ],
            },
            {
              id: 'aytmat-integral-uygulamalari-s3',
              name: "Grafik Yorumlama ve Birikim Fonksiyonu",
              outcomes: [
                { id: 'aytmat-integral-uygulamalari-s3-k1', text: "Grafiği verilen fonksiyonun belirli integralini alanlar yardımıyla yorumlar." },
                { id: 'aytmat-integral-uygulamalari-s3-k2', text: "Değişim hızından toplam değişimi hesaplayarak gerçek hayat problemlerini çözer." },
              ],
            },
          ],
        },
      ],
    },
  ],
};
