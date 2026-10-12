import type { Subject } from '../../domain/types';

export const subject: Subject = {
  id: 'ayt-fizik',
  exam: 'AYT',
  name: 'Fizik',
  icon: "↗",
  examQuestionCount: 14,
  note: "MEB 2018 Fizik 11–12. sınıf öğretim programı mantığıyla düzenlenmiştir. Aksi belirtilmedikçe g = 10 m/s² alınır.",
  units: [
    {
      id: 'ayt-fizik-u1',
      name: "Kuvvet ve Hareket",
      topics: [
        {
          id: 'aytfiz-vektorler',
          name: "Vektörler",
          grade: 11,
          subtopics: [
            {
              id: 'aytfiz-vektorler-s1',
              name: "Vektörel ve skaler büyüklükler",
              outcomes: [
                { id: 'aytfiz-vektorler-s1-k1', text: "Vektörlerin özelliklerini (büyüklük, doğrultu, yön) açıklar." },
                { id: 'aytfiz-vektorler-s1-k2', text: "Fiziksel büyüklükleri skaler ve vektörel olarak sınıflandırır." },
              ],
            },
            {
              id: 'aytfiz-vektorler-s2',
              name: "Vektörlerin toplanması ve çıkarılması",
              outcomes: [
                { id: 'aytfiz-vektorler-s2-k1', text: "İki ve daha fazla vektörün bileşkesini uç uca ekleme ve paralelkenar yöntemleriyle bulur." },
                { id: 'aytfiz-vektorler-s2-k2', text: "İki vektörün bileşkesinin alabileceği değer aralığını belirler." },
                { id: 'aytfiz-vektorler-s2-k3', text: "Vektörlerde çıkarma işlemini yapar ve sonucu yorumlar." },
              ],
            },
            {
              id: 'aytfiz-vektorler-s3',
              name: "Vektörlerin bileşenlerine ayrılması",
              outcomes: [
                { id: 'aytfiz-vektorler-s3-k1', text: "Bir vektörü dik bileşenlerine ayırır." },
                { id: 'aytfiz-vektorler-s3-k2', text: "Bileşenler yöntemiyle bileşke vektörü hesaplar." },
              ],
            },
          ],
        },
        {
          id: 'aytfiz-hareket',
          name: "Bağıl Hareket, Sabit İvmeli Hareket ve Atışlar",
          grade: 11,
          subtopics: [
            {
              id: 'aytfiz-hareket-s1',
              name: "Bağıl hareket",
              outcomes: [
                { id: 'aytfiz-hareket-s1-k1', text: "Sabit hızlı iki cismin hareketini birbirine göre yorumlar." },
                { id: 'aytfiz-hareket-s1-k2', text: "Akıntılı ortamda hareket eden cisimlerin hareketini analiz eder." },
              ],
            },
            {
              id: 'aytfiz-hareket-s2',
              name: "Bir boyutta sabit ivmeli hareket",
              outcomes: [
                { id: 'aytfiz-hareket-s2-k1', text: "Sabit ivmeli hareket denklemlerini kullanarak hesaplamalar yapar." },
                { id: 'aytfiz-hareket-s2-k2', text: "Konum–zaman, hız–zaman ve ivme–zaman grafiklerini birbirine dönüştürür ve yorumlar." },
              ],
            },
            {
              id: 'aytfiz-hareket-s3',
              name: "Serbest düşme ve düşey atış",
              outcomes: [
                { id: 'aytfiz-hareket-s3-k1', text: "Serbest düşme hareketini ve limit hızı açıklar." },
                { id: 'aytfiz-hareket-s3-k2', text: "Düşey doğrultuda atılan cisimlerin hareketini analiz eder." },
              ],
            },
            {
              id: 'aytfiz-hareket-s4',
              name: "Yatay ve eğik atış",
              outcomes: [
                { id: 'aytfiz-hareket-s4-k1', text: "Yatay atış hareketini bileşenlerine ayırarak analiz eder." },
                { id: 'aytfiz-hareket-s4-k2', text: "Eğik atışta menzil, maksimum yükseklik ve uçuş süresini hesaplar." },
              ],
            },
          ],
        },
        {
          id: 'aytfiz-newton-yasalari',
          name: "Newton’ın Hareket Yasaları",
          grade: 11,
          priority: true,
          subtopics: [
            {
              id: 'aytfiz-newton-yasalari-s1',
              name: "Eylemsizlik, dinamiğin temel prensibi, etki–tepki",
              outcomes: [
                { id: 'aytfiz-newton-yasalari-s1-k1', text: "Newton’ın hareket yasalarını açıklar." },
                { id: 'aytfiz-newton-yasalari-s1-k2', text: "Net kuvvet, kütle ve ivme arasındaki ilişkiyi hesaplamalarda kullanır." },
              ],
            },
            {
              id: 'aytfiz-newton-yasalari-s2',
              name: "Sürtünme kuvveti",
              outcomes: [
                { id: 'aytfiz-newton-yasalari-s2-k1', text: "Statik ve kinetik sürtünme kuvvetlerini karşılaştırır." },
                { id: 'aytfiz-newton-yasalari-s2-k2', text: "Sürtünmeli yüzeylerde cisimlerin hareketini analiz eder." },
              ],
            },
            {
              id: 'aytfiz-newton-yasalari-s3',
              name: "Bağlantılı cisimler ve makara sistemleri",
              outcomes: [
                { id: 'aytfiz-newton-yasalari-s3-k1', text: "İple bağlı cisim sistemlerinde ivme ve ip gerilmesini hesaplar." },
              ],
            },
            {
              id: 'aytfiz-newton-yasalari-s4',
              name: "Eğik düzlemde hareket",
              outcomes: [
                { id: 'aytfiz-newton-yasalari-s4-k1', text: "Eğik düzlemde kuvvetleri bileşenlerine ayırarak hareketi analiz eder." },
              ],
            },
            {
              id: 'aytfiz-newton-yasalari-s5',
              name: "İvmeli sistemler ve görünür ağırlık",
              outcomes: [
                { id: 'aytfiz-newton-yasalari-s5-k1', text: "Asansör gibi ivmeli sistemlerde görünür ağırlığı hesaplar." },
              ],
            },
          ],
        },
        {
          id: 'aytfiz-is-enerji',
          name: "İş, Enerji ve Enerjinin Korunumu",
          grade: 11,
          priority: true,
          subtopics: [
            {
              id: 'aytfiz-is-enerji-s1',
              name: "İş ve güç",
              outcomes: [
                { id: 'aytfiz-is-enerji-s1-k1', text: "Kuvvetin yaptığı işi hesaplar; kuvvet–yol grafiğinden işi bulur." },
                { id: 'aytfiz-is-enerji-s1-k2', text: "Güç ve verim kavramlarını açıklar ve hesaplar." },
              ],
            },
            {
              id: 'aytfiz-is-enerji-s2',
              name: "Kinetik enerji ve iş–enerji teoremi",
              outcomes: [
                { id: 'aytfiz-is-enerji-s2-k1', text: "Net işin kinetik enerji değişimine eşit olduğunu açıklar ve hesaplamalarda kullanır." },
              ],
            },
            {
              id: 'aytfiz-is-enerji-s3',
              name: "Çekim ve esneklik potansiyel enerjisi",
              outcomes: [
                { id: 'aytfiz-is-enerji-s3-k1', text: "Çekim potansiyel enerjisini hesaplar." },
                { id: 'aytfiz-is-enerji-s3-k2', text: "Esneklik potansiyel enerjisini yay sabiti ve sıkışma miktarıyla ilişkilendirir." },
              ],
            },
            {
              id: 'aytfiz-is-enerji-s4',
              name: "Mekanik enerjinin korunumu ve sürtünme",
              outcomes: [
                { id: 'aytfiz-is-enerji-s4-k1', text: "Mekanik enerjinin korunumunu kullanarak hız ve yükseklik hesaplar." },
                { id: 'aytfiz-is-enerji-s4-k2', text: "Sürtünmeli ortamda mekanik enerji kaybını hesaplar." },
              ],
            },
          ],
        },
        {
          id: 'aytfiz-itme-momentum',
          name: "İtme ve Çizgisel Momentum",
          grade: 11,
          priority: true,
          subtopics: [
            {
              id: 'aytfiz-itme-momentum-s1',
              name: "İtme ve momentum değişimi",
              outcomes: [
                { id: 'aytfiz-itme-momentum-s1-k1', text: "İtme ve çizgisel momentum kavramlarını açıklar." },
                { id: 'aytfiz-itme-momentum-s1-k2', text: "Kuvvet–zaman grafiğinden itmeyi bulur ve momentum değişimiyle ilişkilendirir." },
              ],
            },
            {
              id: 'aytfiz-itme-momentum-s2',
              name: "Momentumun korunumu",
              outcomes: [
                { id: 'aytfiz-itme-momentum-s2-k1', text: "Momentumun korunumunu patlama ve geri tepme olaylarına uygular." },
              ],
            },
            {
              id: 'aytfiz-itme-momentum-s3',
              name: "Çarpışmalar",
              outcomes: [
                { id: 'aytfiz-itme-momentum-s3-k1', text: "Esnek ve esnek olmayan çarpışmaları momentum ve enerji açısından karşılaştırır." },
                { id: 'aytfiz-itme-momentum-s3-k2', text: "İki boyutta çarpışma problemlerini vektörel olarak çözer." },
              ],
            },
          ],
        },
        {
          id: 'aytfiz-kuvvet-tork-denge',
          name: "Tork ve Denge",
          grade: 11,
          subtopics: [
            {
              id: 'aytfiz-kuvvet-tork-denge-s1',
              name: "Tork",
              outcomes: [
                { id: 'aytfiz-kuvvet-tork-denge-s1-k1', text: "Torkun tanımını yapar ve büyüklüğünü hesaplar." },
                { id: 'aytfiz-kuvvet-tork-denge-s1-k2', text: "Torkun yönünü sağ el kuralıyla belirler." },
              ],
            },
            {
              id: 'aytfiz-kuvvet-tork-denge-s2',
              name: "Denge şartları ve kesişen kuvvetler",
              outcomes: [
                { id: 'aytfiz-kuvvet-tork-denge-s2-k1', text: "Cisimlerin öteleme ve dönme dengesi şartlarını açıklar." },
                { id: 'aytfiz-kuvvet-tork-denge-s2-k2', text: "Kesişen üç kuvvetin dengesini (Lami teoremi) analiz eder." },
              ],
            },
            {
              id: 'aytfiz-kuvvet-tork-denge-s3',
              name: "Çubukların dengesi",
              outcomes: [
                { id: 'aytfiz-kuvvet-tork-denge-s3-k1', text: "Ağırlıklı çubukların dengesiyle ilgili hesaplamalar yapar." },
              ],
            },
          ],
        },
        {
          id: 'aytfiz-kutle-merkezi',
          name: "Kütle Merkezi ve Ağırlık Merkezi",
          grade: 11,
          subtopics: [
            {
              id: 'aytfiz-kutle-merkezi-s1',
              name: "Kütle merkezi ve ağırlık merkezi kavramları",
              outcomes: [
                { id: 'aytfiz-kutle-merkezi-s1-k1', text: "Kütle merkezi ve ağırlık merkezi kavramlarını açıklar." },
              ],
            },
            {
              id: 'aytfiz-kutle-merkezi-s2',
              name: "Kütle merkezinin hesaplanması",
              outcomes: [
                { id: 'aytfiz-kutle-merkezi-s2-k1', text: "Noktasal cisimlerden oluşan sistemlerin kütle merkezini hesaplar." },
                { id: 'aytfiz-kutle-merkezi-s2-k2', text: "Türdeş levha ve tellerde parça ekleme/çıkarma yöntemiyle kütle merkezini bulur." },
              ],
            },
            {
              id: 'aytfiz-kutle-merkezi-s3',
              name: "Denge türleri",
              outcomes: [
                { id: 'aytfiz-kutle-merkezi-s3-k1', text: "Kararlı, kararsız ve nötr dengeyi kütle merkezinin konumuyla ilişkilendirir." },
              ],
            },
          ],
        },
        {
          id: 'aytfiz-basit-makineler',
          name: "Basit Makineler",
          grade: 11,
          subtopics: [
            {
              id: 'aytfiz-basit-makineler-s1',
              name: "Kaldıraçlar",
              outcomes: [
                { id: 'aytfiz-basit-makineler-s1-k1', text: "Kaldıraç türlerini açıklar ve kuvvet kazancını hesaplar." },
              ],
            },
            {
              id: 'aytfiz-basit-makineler-s2',
              name: "Makaralar ve palangalar",
              outcomes: [
                { id: 'aytfiz-basit-makineler-s2-k1', text: "Sabit makara, hareketli makara ve palanga sistemlerinde kuvvet kazancını hesaplar." },
              ],
            },
            {
              id: 'aytfiz-basit-makineler-s3',
              name: "Eğik düzlem, çıkrık, vida, dişli ve kasnaklar",
              outcomes: [
                { id: 'aytfiz-basit-makineler-s3-k1', text: "Eğik düzlem, çıkrık ve vidada kuvvet kazancını hesaplar." },
                { id: 'aytfiz-basit-makineler-s3-k2', text: "Dişli ve kasnak sistemlerinde dönme sayısı ve dönme yönü ilişkisini belirler." },
              ],
            },
            {
              id: 'aytfiz-basit-makineler-s4',
              name: "İş ilkesi ve verim",
              outcomes: [
                { id: 'aytfiz-basit-makineler-s4-k1', text: "Basit makinelerde işten kazanç olmadığını açıklar ve verimi hesaplar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-fizik-u2',
      name: "Elektrik ve Manyetizma",
      topics: [
        {
          id: 'aytfiz-elektriksel-kuvvet-alan',
          name: "Elektriksel Kuvvet ve Elektrik Alan",
          grade: 11,
          priority: true,
          subtopics: [
            {
              id: 'aytfiz-elektriksel-kuvvet-alan-s1',
              name: "Coulomb yasası",
              outcomes: [
                { id: 'aytfiz-elektriksel-kuvvet-alan-s1-k1', text: "Yüklü cisimler arasındaki elektriksel kuvvetin bağlı olduğu değişkenleri açıklar." },
                { id: 'aytfiz-elektriksel-kuvvet-alan-s1-k2', text: "Birden fazla noktasal yükün bir yüke uyguladığı bileşke kuvveti hesaplar." },
              ],
            },
            {
              id: 'aytfiz-elektriksel-kuvvet-alan-s2',
              name: "Elektrik alan ve alan çizgileri",
              outcomes: [
                { id: 'aytfiz-elektriksel-kuvvet-alan-s2-k1', text: "Noktasal yüklerin oluşturduğu elektrik alanı hesaplar." },
                { id: 'aytfiz-elektriksel-kuvvet-alan-s2-k2', text: "Elektrik alan çizgilerini yorumlar." },
              ],
            },
            {
              id: 'aytfiz-elektriksel-kuvvet-alan-s3',
              name: "Elektrik alanda yüklü cisimlerin dengesi",
              outcomes: [
                { id: 'aytfiz-elektriksel-kuvvet-alan-s3-k1', text: "Elektrik alanda bulunan yüklü cisimlerin dengesini analiz eder." },
              ],
            },
          ],
        },
        {
          id: 'aytfiz-elektriksel-potansiyel',
          name: "Elektriksel Potansiyel, İş ve Düzgün Elektrik Alan",
          grade: 11,
          priority: true,
          subtopics: [
            {
              id: 'aytfiz-elektriksel-potansiyel-s1',
              name: "Elektriksel potansiyel enerji",
              outcomes: [
                { id: 'aytfiz-elektriksel-potansiyel-s1-k1', text: "Noktasal yük sistemlerinin elektriksel potansiyel enerjisini hesaplar." },
              ],
            },
            {
              id: 'aytfiz-elektriksel-potansiyel-s2',
              name: "Elektriksel potansiyel ve potansiyel farkı",
              outcomes: [
                { id: 'aytfiz-elektriksel-potansiyel-s2-k1', text: "Noktasal yüklerin bir noktada oluşturduğu potansiyeli hesaplar." },
                { id: 'aytfiz-elektriksel-potansiyel-s2-k2', text: "Eş potansiyel yüzeyleri açıklar." },
              ],
            },
            {
              id: 'aytfiz-elektriksel-potansiyel-s3',
              name: "Elektriksel iş",
              outcomes: [
                { id: 'aytfiz-elektriksel-potansiyel-s3-k1', text: "Bir yükü iki nokta arasında taşımak için yapılan işi hesaplar." },
              ],
            },
            {
              id: 'aytfiz-elektriksel-potansiyel-s4',
              name: "Düzgün elektrik alan ve yüklü parçacıkların hareketi",
              outcomes: [
                { id: 'aytfiz-elektriksel-potansiyel-s4-k1', text: "Paralel levhalar arasındaki düzgün elektrik alanı hesaplar." },
                { id: 'aytfiz-elektriksel-potansiyel-s4-k2', text: "Düzgün elektrik alanda yüklü parçacıkların hareketini analiz eder." },
              ],
            },
          ],
        },
        {
          id: 'aytfiz-kondansatorler',
          name: "Sığa ve Kondansatörler",
          grade: 11,
          subtopics: [
            {
              id: 'aytfiz-kondansatorler-s1',
              name: "Sığa ve sığayı etkileyen değişkenler",
              outcomes: [
                { id: 'aytfiz-kondansatorler-s1-k1', text: "Sığanın bağlı olduğu değişkenleri açıklar." },
                { id: 'aytfiz-kondansatorler-s1-k2', text: "Yüklü kondansatörde levha aralığı veya yalıtkan değiştiğinde yük, gerilim ve alanın nasıl değiştiğini yorumlar." },
              ],
            },
            {
              id: 'aytfiz-kondansatorler-s2',
              name: "Kondansatörlerin bağlanması",
              outcomes: [
                { id: 'aytfiz-kondansatorler-s2-k1', text: "Seri ve paralel bağlı kondansatörlerin eşdeğer sığasını, yüklerini ve gerilimlerini hesaplar." },
              ],
            },
            {
              id: 'aytfiz-kondansatorler-s3',
              name: "Kondansatörde depolanan enerji",
              outcomes: [
                { id: 'aytfiz-kondansatorler-s3-k1', text: "Kondansatörde depolanan enerjiyi hesaplar." },
              ],
            },
          ],
        },
        {
          id: 'aytfiz-manyetizma-induksiyon',
          name: "Manyetizma ve Elektromanyetik İndüklenme",
          grade: 11,
          priority: true,
          subtopics: [
            {
              id: 'aytfiz-manyetizma-induksiyon-s1',
              name: "Akım geçen tellerin oluşturduğu manyetik alan",
              outcomes: [
                { id: 'aytfiz-manyetizma-induksiyon-s1-k1', text: "Düz tel, çembersel tel ve akım makarasının oluşturduğu manyetik alanı hesaplar." },
              ],
            },
            {
              id: 'aytfiz-manyetizma-induksiyon-s2',
              name: "Manyetik kuvvet",
              outcomes: [
                { id: 'aytfiz-manyetizma-induksiyon-s2-k1', text: "Manyetik alanda akım geçen tele etki eden kuvveti hesaplar." },
                { id: 'aytfiz-manyetizma-induksiyon-s2-k2', text: "Manyetik alanda hareket eden yüklü parçacığa etki eden kuvveti ve parçacığın hareketini açıklar." },
              ],
            },
            {
              id: 'aytfiz-manyetizma-induksiyon-s3',
              name: "Manyetik akı ve indüksiyon",
              outcomes: [
                { id: 'aytfiz-manyetizma-induksiyon-s3-k1', text: "Manyetik akıyı açıklar ve hesaplar." },
                { id: 'aytfiz-manyetizma-induksiyon-s3-k2', text: "Faraday ve Lenz yasalarını kullanarak indüksiyon emk’sını ve akımın yönünü belirler." },
              ],
            },
            {
              id: 'aytfiz-manyetizma-induksiyon-s4',
              name: "Öz indüksiyon, elektrik motoru ve üreteç",
              outcomes: [
                { id: 'aytfiz-manyetizma-induksiyon-s4-k1', text: "Öz indüksiyon akımını açıklar." },
                { id: 'aytfiz-manyetizma-induksiyon-s4-k2', text: "Elektrik motoru ve üretecin çalışma ilkesini açıklar." },
              ],
            },
          ],
        },
        {
          id: 'aytfiz-alternatif-akim-transformator',
          name: "Alternatif Akım ve Transformatörler",
          grade: 11,
          subtopics: [
            {
              id: 'aytfiz-alternatif-akim-transformator-s1',
              name: "Alternatif akım ve etkin değer",
              outcomes: [
                { id: 'aytfiz-alternatif-akim-transformator-s1-k1', text: "Alternatif akımın maksimum ve etkin değerlerini ilişkilendirir." },
              ],
            },
            {
              id: 'aytfiz-alternatif-akim-transformator-s2',
              name: "Alternatif akım devrelerinde direnç, bobin ve kondansatör",
              outcomes: [
                { id: 'aytfiz-alternatif-akim-transformator-s2-k1', text: "İndüktif ve kapasitif reaktans ile empedans kavramlarını açıklar." },
                { id: 'aytfiz-alternatif-akim-transformator-s2-k2', text: "Seri RLC devresinde rezonans durumunu yorumlar." },
              ],
            },
            {
              id: 'aytfiz-alternatif-akim-transformator-s3',
              name: "Transformatörler",
              outcomes: [
                { id: 'aytfiz-alternatif-akim-transformator-s3-k1', text: "Transformatörlerde sarım sayısı, gerilim ve akım ilişkisini hesaplar." },
                { id: 'aytfiz-alternatif-akim-transformator-s3-k2', text: "Elektrik enerjisinin iletiminde transformatörlerin rolünü açıklar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-fizik-u3',
      name: "Çembersel Hareket",
      topics: [
        {
          id: 'aytfiz-cembersel-hareket',
          name: "Düzgün Çembersel Hareket",
          grade: 12,
          priority: true,
          subtopics: [
            {
              id: 'aytfiz-cembersel-hareket-s1',
              name: "Periyot, frekans, çizgisel ve açısal hız",
              outcomes: [
                { id: 'aytfiz-cembersel-hareket-s1-k1', text: "Düzgün çembersel harekette periyot, frekans, çizgisel hız ve açısal hız arasındaki ilişkileri açıklar." },
              ],
            },
            {
              id: 'aytfiz-cembersel-hareket-s2',
              name: "Merkezcil ivme ve merkezcil kuvvet",
              outcomes: [
                { id: 'aytfiz-cembersel-hareket-s2-k1', text: "Merkezcil ivme ve merkezcil kuvveti hesaplar." },
                { id: 'aytfiz-cembersel-hareket-s2-k2', text: "Merkezcil kuvveti sağlayan fiziksel kuvvetleri belirler." },
              ],
            },
            {
              id: 'aytfiz-cembersel-hareket-s3',
              name: "Yatay ve düşey düzlemde çembersel hareket",
              outcomes: [
                { id: 'aytfiz-cembersel-hareket-s3-k1', text: "Virajlı yollarda ve döner platformlarda güvenli hız sınırını hesaplar." },
                { id: 'aytfiz-cembersel-hareket-s3-k2', text: "Düşey düzlemde çembersel harekette ip gerilmesini ve tepe noktası için minimum hızı hesaplar." },
              ],
            },
          ],
        },
        {
          id: 'aytfiz-donme-acisal-momentum',
          name: "Dönerek Öteleme ve Açısal Momentum",
          grade: 12,
          subtopics: [
            {
              id: 'aytfiz-donme-acisal-momentum-s1',
              name: "Eylemsizlik momenti ve dönme kinetik enerjisi",
              outcomes: [
                { id: 'aytfiz-donme-acisal-momentum-s1-k1', text: "Eylemsizlik momentinin kütle dağılımına bağlı olduğunu açıklar." },
                { id: 'aytfiz-donme-acisal-momentum-s1-k2', text: "Dönme kinetik enerjisini hesaplar." },
              ],
            },
            {
              id: 'aytfiz-donme-acisal-momentum-s2',
              name: "Dönerek öteleme hareketi",
              outcomes: [
                { id: 'aytfiz-donme-acisal-momentum-s2-k1', text: "Kaymadan yuvarlanan cisimlerin toplam kinetik enerjisini hesaplar." },
              ],
            },
            {
              id: 'aytfiz-donme-acisal-momentum-s3',
              name: "Açısal momentum ve korunumu",
              outcomes: [
                { id: 'aytfiz-donme-acisal-momentum-s3-k1', text: "Açısal momentumu açıklar ve torkla ilişkilendirir." },
                { id: 'aytfiz-donme-acisal-momentum-s3-k2', text: "Açısal momentumun korunumunu günlük hayat örnekleriyle açıklar." },
              ],
            },
          ],
        },
        {
          id: 'aytfiz-kutle-cekim-kepler',
          name: "Kütle Çekim ve Kepler Yasaları",
          grade: 12,
          subtopics: [
            {
              id: 'aytfiz-kutle-cekim-kepler-s1',
              name: "Newton’ın genel çekim yasası",
              outcomes: [
                { id: 'aytfiz-kutle-cekim-kepler-s1-k1', text: "Kütleler arasındaki çekim kuvvetini hesaplar." },
              ],
            },
            {
              id: 'aytfiz-kutle-cekim-kepler-s2',
              name: "Çekim alanı ve çekim ivmesinin değişimi",
              outcomes: [
                { id: 'aytfiz-kutle-cekim-kepler-s2-k1', text: "Çekim ivmesinin gezegen yüzeyinden uzaklığa bağlı değişimini açıklar." },
              ],
            },
            {
              id: 'aytfiz-kutle-cekim-kepler-s3',
              name: "Kepler yasaları",
              outcomes: [
                { id: 'aytfiz-kutle-cekim-kepler-s3-k1', text: "Kepler yasalarını açıklar ve periyot–yörünge yarıçapı ilişkisini kullanır." },
              ],
            },
            {
              id: 'aytfiz-kutle-cekim-kepler-s4',
              name: "Uydu hareketi ve kurtulma hızı",
              outcomes: [
                { id: 'aytfiz-kutle-cekim-kepler-s4-k1', text: "Uyduların yörünge hızını ve periyodunu hesaplar." },
                { id: 'aytfiz-kutle-cekim-kepler-s4-k2', text: "Kurtulma hızı kavramını açıklar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-fizik-u4',
      name: "Basit Harmonik Hareket",
      topics: [
        {
          id: 'aytfiz-basit-harmonik-hareket',
          name: "Basit Harmonik Hareket",
          grade: 12,
          priority: true,
          subtopics: [
            {
              id: 'aytfiz-basit-harmonik-hareket-s1',
              name: "Basit harmonik hareketin temel kavramları",
              outcomes: [
                { id: 'aytfiz-basit-harmonik-hareket-s1-k1', text: "Basit harmonik hareketi düzgün çembersel hareketin izdüşümü olarak açıklar." },
                { id: 'aytfiz-basit-harmonik-hareket-s1-k2', text: "Uzanım, genlik, periyot ve frekans kavramlarını açıklar." },
              ],
            },
            {
              id: 'aytfiz-basit-harmonik-hareket-s2',
              name: "Hız, ivme ve geri çağırıcı kuvvet",
              outcomes: [
                { id: 'aytfiz-basit-harmonik-hareket-s2-k1', text: "Hız, ivme ve geri çağırıcı kuvvetin uzanıma bağlı değişimini yorumlar." },
              ],
            },
            {
              id: 'aytfiz-basit-harmonik-hareket-s3',
              name: "Yay sarkacı",
              outcomes: [
                { id: 'aytfiz-basit-harmonik-hareket-s3-k1', text: "Yay sarkacının periyodunu etkileyen değişkenleri açıklar ve periyodu hesaplar." },
              ],
            },
            {
              id: 'aytfiz-basit-harmonik-hareket-s4',
              name: "Basit sarkaç",
              outcomes: [
                { id: 'aytfiz-basit-harmonik-hareket-s4-k1', text: "Basit sarkacın periyodunu etkileyen değişkenleri açıklar ve periyodu hesaplar." },
                { id: 'aytfiz-basit-harmonik-hareket-s4-k2', text: "İvmeli ortamlarda sarkacın periyodunun nasıl değiştiğini yorumlar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-fizik-u5',
      name: "Dalga Mekaniği",
      topics: [
        {
          id: 'aytfiz-dalga-mekanigi',
          name: "Dalgalarda Kırınım, Girişim ve Doppler Olayı",
          grade: 12,
          priority: true,
          subtopics: [
            {
              id: 'aytfiz-dalga-mekanigi-s1',
              name: "Su dalgalarında kırınım ve girişim",
              outcomes: [
                { id: 'aytfiz-dalga-mekanigi-s1-k1', text: "Su dalgalarında kırınımın yarık genişliği ve dalga boyuna bağlılığını açıklar." },
                { id: 'aytfiz-dalga-mekanigi-s1-k2', text: "İki noktasal kaynağın oluşturduğu girişim deseninde dalga katarlarını yorumlar." },
              ],
            },
            {
              id: 'aytfiz-dalga-mekanigi-s2',
              name: "Işıkta çift yarık girişimi",
              outcomes: [
                { id: 'aytfiz-dalga-mekanigi-s2-k1', text: "Young çift yarık deneyinde saçak genişliğini etkileyen değişkenleri açıklar ve hesaplar." },
              ],
            },
            {
              id: 'aytfiz-dalga-mekanigi-s3',
              name: "Tek yarıkta kırınım ve ince zarda girişim",
              outcomes: [
                { id: 'aytfiz-dalga-mekanigi-s3-k1', text: "Tek yarıkta kırınım desenini açıklar." },
                { id: 'aytfiz-dalga-mekanigi-s3-k2', text: "İnce zarlarda girişim olayını günlük hayat örnekleriyle açıklar." },
              ],
            },
            {
              id: 'aytfiz-dalga-mekanigi-s4',
              name: "Doppler olayı",
              outcomes: [
                { id: 'aytfiz-dalga-mekanigi-s4-k1', text: "Kaynak veya gözlemci hareketinde algılanan frekansın değişimini açıklar." },
              ],
            },
          ],
        },
        {
          id: 'aytfiz-em-dalgalar',
          name: "Elektromanyetik Dalgalar",
          grade: 12,
          subtopics: [
            {
              id: 'aytfiz-em-dalgalar-s1',
              name: "Elektromanyetik dalgaların oluşumu ve özellikleri",
              outcomes: [
                { id: 'aytfiz-em-dalgalar-s1-k1', text: "Elektromanyetik dalgaların ivmeli yüklerle oluştuğunu açıklar." },
                { id: 'aytfiz-em-dalgalar-s1-k2', text: "Elektromanyetik dalgaların ortak özelliklerini açıklar." },
              ],
            },
            {
              id: 'aytfiz-em-dalgalar-s2',
              name: "Elektromanyetik spektrum ve kullanım alanları",
              outcomes: [
                { id: 'aytfiz-em-dalgalar-s2-k1', text: "Elektromanyetik spektrumdaki dalgaları dalga boyu, frekans ve enerjiye göre sıralar." },
                { id: 'aytfiz-em-dalgalar-s2-k2', text: "Elektromanyetik dalgaların kullanım alanlarına örnekler verir." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-fizik-u6',
      name: "Atom Fiziğine Giriş ve Radyoaktivite",
      topics: [
        {
          id: 'aytfiz-atom-fizigi-radyoaktivite',
          name: "Atom Modelleri, Büyük Patlama ve Radyoaktivite",
          grade: 12,
          subtopics: [
            {
              id: 'aytfiz-atom-fizigi-radyoaktivite-s1',
              name: "Atom modelleri",
              outcomes: [
                { id: 'aytfiz-atom-fizigi-radyoaktivite-s1-k1', text: "Thomson, Rutherford ve Bohr atom modellerini karşılaştırır." },
              ],
            },
            {
              id: 'aytfiz-atom-fizigi-radyoaktivite-s2',
              name: "Bohr modeli, uyarılma ve atom spektrumları",
              outcomes: [
                { id: 'aytfiz-atom-fizigi-radyoaktivite-s2-k1', text: "Atomun uyarılma yollarını açıklar." },
                { id: 'aytfiz-atom-fizigi-radyoaktivite-s2-k2', text: "Enerji seviyeleri arasındaki geçişlerde yayımlanan fotonun enerjisini hesaplar." },
              ],
            },
            {
              id: 'aytfiz-atom-fizigi-radyoaktivite-s3',
              name: "Büyük patlama ve atom altı parçacıklar",
              outcomes: [
                { id: 'aytfiz-atom-fizigi-radyoaktivite-s3-k1', text: "Büyük patlama teorisini ve evrenin oluşumunu kanıtlarıyla açıklar." },
                { id: 'aytfiz-atom-fizigi-radyoaktivite-s3-k2', text: "Temel parçacıkları (kuark, lepton) ve karşıt maddeyi açıklar." },
              ],
            },
            {
              id: 'aytfiz-atom-fizigi-radyoaktivite-s4',
              name: "Radyoaktivite ve yarı ömür",
              outcomes: [
                { id: 'aytfiz-atom-fizigi-radyoaktivite-s4-k1', text: "Alfa, beta ve gama bozunmalarında çekirdekteki değişimi açıklar." },
                { id: 'aytfiz-atom-fizigi-radyoaktivite-s4-k2', text: "Yarı ömür kavramını kullanarak kalan madde miktarını hesaplar." },
              ],
            },
            {
              id: 'aytfiz-atom-fizigi-radyoaktivite-s5',
              name: "Fisyon ve füzyon",
              outcomes: [
                { id: 'aytfiz-atom-fizigi-radyoaktivite-s5-k1', text: "Fisyon ve füzyon tepkimelerini karşılaştırır." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-fizik-u7',
      name: "Modern Fizik",
      topics: [
        {
          id: 'aytfiz-modern-fizik',
          name: "Özel Görelilik ve Kuantum Fiziğine Giriş",
          grade: 12,
          priority: true,
          subtopics: [
            {
              id: 'aytfiz-modern-fizik-s1',
              name: "Özel görelilik",
              outcomes: [
                { id: 'aytfiz-modern-fizik-s1-k1', text: "Özel göreliliğin postulatlarını açıklar." },
                { id: 'aytfiz-modern-fizik-s1-k2', text: "Zaman genişlemesi ve boy kısalmasını nitel ve nicel olarak yorumlar." },
              ],
            },
            {
              id: 'aytfiz-modern-fizik-s2',
              name: "Kara cisim ışıması ve kuantum",
              outcomes: [
                { id: 'aytfiz-modern-fizik-s2-k1', text: "Kara cisim ışımasını ve Planck’ın kuantum hipotezini açıklar." },
              ],
            },
            {
              id: 'aytfiz-modern-fizik-s3',
              name: "Fotoelektrik olay",
              outcomes: [
                { id: 'aytfiz-modern-fizik-s3-k1', text: "Fotoelektrik olayı açıklar ve eşik enerjisi, kesme gerilimi, kinetik enerji ilişkisini hesaplar." },
                { id: 'aytfiz-modern-fizik-s3-k2', text: "Fotoelektrik deney grafiklerini yorumlar." },
              ],
            },
            {
              id: 'aytfiz-modern-fizik-s4',
              name: "Compton saçılması ve de Broglie dalga boyu",
              outcomes: [
                { id: 'aytfiz-modern-fizik-s4-k1', text: "Compton saçılmasını ışığın tanecik modeliyle açıklar." },
                { id: 'aytfiz-modern-fizik-s4-k2', text: "Madde dalgalarını ve de Broglie dalga boyunu hesaplar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ayt-fizik-u8',
      name: "Modern Fiziğin Teknolojideki Uygulamaları",
      topics: [
        {
          id: 'aytfiz-modern-fizik-teknoloji',
          name: "Modern Fiziğin Teknolojideki Uygulamaları",
          grade: 12,
          subtopics: [
            {
              id: 'aytfiz-modern-fizik-teknoloji-s1',
              name: "Görüntüleme teknolojileri",
              outcomes: [
                { id: 'aytfiz-modern-fizik-teknoloji-s1-k1', text: "Röntgen, BT, MR, PET ve ultrason gibi görüntüleme tekniklerinin çalışma ilkelerini açıklar." },
              ],
            },
            {
              id: 'aytfiz-modern-fizik-teknoloji-s2',
              name: "Yarı iletkenler, LED ve güneş pilleri",
              outcomes: [
                { id: 'aytfiz-modern-fizik-teknoloji-s2-k1', text: "Yarı iletkenlerin yapısını ve diyot, transistör, LED gibi uygulamalarını açıklar." },
                { id: 'aytfiz-modern-fizik-teknoloji-s2-k2', text: "Güneş pillerinin çalışma ilkesini açıklar." },
              ],
            },
            {
              id: 'aytfiz-modern-fizik-teknoloji-s3',
              name: "Süper iletkenler, nanoteknoloji ve laser",
              outcomes: [
                { id: 'aytfiz-modern-fizik-teknoloji-s3-k1', text: "Süper iletkenliğin özelliklerini ve kullanım alanlarını açıklar." },
                { id: 'aytfiz-modern-fizik-teknoloji-s3-k2', text: "Nanoteknoloji ve laser ışınlarının özelliklerini ve kullanım alanlarını açıklar." },
              ],
            },
          ],
        },
      ],
    },
  ],
};
