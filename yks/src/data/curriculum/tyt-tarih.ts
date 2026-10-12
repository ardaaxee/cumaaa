import type { Subject } from '../../domain/types';

export const subject: Subject = {
  id: 'tyt-tarih',
  exam: 'TYT',
  name: 'TYT Tarih',
  icon: "⌛",
  examQuestionCount: 5,
  note: "TYT Sosyal Bilimler testinin tarih bölümü. MEB 2018 Tarih 9–10–11 ve T.C. İnkılap Tarihi ve Atatürkçülük (12) programlarının mantığıyla düzenlenmiştir.",
  units: [
    {
      id: 'tyt-tarih-u1',
      name: "Tarih ve Zaman, İnsanlığın İlk Dönemleri",
      topics: [
        {
          id: 'tyttar-tarih-bilimi',
          name: "Tarih Bilimi ve Zaman",
          grade: 9,
          subtopics: [
            {
              id: 'tyttar-tarih-bilimi-s1',
              name: "Tarihin Konusu ve Yöntemi",
              outcomes: [
                { id: 'tyttar-tarih-bilimi-s1-k1', text: "Tarih biliminin konusunu ve diğer bilimlerden ayrılan yönlerini açıklar." },
                { id: 'tyttar-tarih-bilimi-s1-k2', text: "Tarihî olayların yer ve zaman belirtilerek, neden-sonuç ilişkisi içinde incelendiğini yorumlar." },
              ],
            },
            {
              id: 'tyttar-tarih-bilimi-s2',
              name: "Tarihî Kaynaklar ve Yardımcı Bilimler",
              outcomes: [
                { id: 'tyttar-tarih-bilimi-s2-k1', text: "Birinci ve ikinci el kaynakları ayırt eder." },
                { id: 'tyttar-tarih-bilimi-s2-k2', text: "Tarihe yardımcı bilimlerin tarih araştırmalarına katkısını açıklar." },
              ],
            },
            {
              id: 'tyttar-tarih-bilimi-s3',
              name: "Zaman, Takvim ve Çağlar",
              outcomes: [
                { id: 'tyttar-tarih-bilimi-s3-k1', text: "Farklı toplumların kullandığı takvimleri ve bunların ortaya çıkış nedenlerini açıklar." },
                { id: 'tyttar-tarih-bilimi-s3-k2', text: "Tarihin çağlara ayrılmasında kullanılan ölçütleri yorumlar." },
              ],
            },
            {
              id: 'tyttar-tarih-bilimi-s4',
              name: "Tarih Öncesi Devirler",
              outcomes: [
                { id: 'tyttar-tarih-bilimi-s4-k1', text: "Taş ve maden devirlerinde insan yaşamındaki değişimleri açıklar." },
                { id: 'tyttar-tarih-bilimi-s4-k2', text: "Anadolu’daki önemli tarih öncesi yerleşim yerlerinin özelliklerini tanır." },
              ],
            },
          ],
        },
        {
          id: 'tyttar-ilk-uygarliklar',
          name: "İlk ve Orta Çağlarda Uygarlıklar",
          grade: 9,
          subtopics: [
            {
              id: 'tyttar-ilk-uygarliklar-s1',
              name: "Mezopotamya ve Mısır Uygarlıkları",
              outcomes: [
                { id: 'tyttar-ilk-uygarliklar-s1-k1', text: "Mezopotamya ve Mısır uygarlıklarının insanlığa katkılarını açıklar." },
                { id: 'tyttar-ilk-uygarliklar-s1-k2', text: "Coğrafi koşulların uygarlıkların gelişimine etkisini yorumlar." },
              ],
            },
            {
              id: 'tyttar-ilk-uygarliklar-s2',
              name: "Anadolu Uygarlıkları",
              outcomes: [
                { id: 'tyttar-ilk-uygarliklar-s2-k1', text: "Hitit, Frig, Lidya, Urartu ve İyon uygarlıklarının siyasi, sosyal ve kültürel özelliklerini açıklar." },
                { id: 'tyttar-ilk-uygarliklar-s2-k2', text: "Anadolu’nun farklı uygarlıklara ev sahipliği yapmasının nedenlerini yorumlar." },
              ],
            },
            {
              id: 'tyttar-ilk-uygarliklar-s3',
              name: "Ege, Akdeniz ve Doğu Uygarlıkları",
              outcomes: [
                { id: 'tyttar-ilk-uygarliklar-s3-k1', text: "Fenike, Yunan, Roma, Pers, Çin ve Hint uygarlıklarının belirgin özelliklerini açıklar." },
                { id: 'tyttar-ilk-uygarliklar-s3-k2', text: "İlk Çağ’da yazı, hukuk ve yönetim alanındaki gelişmelerin önemini değerlendirir." },
              ],
            },
          ],
        },
        {
          id: 'tyttar-ilk-turk-devletleri',
          name: "İlk ve Orta Çağlarda Türk Dünyası",
          grade: 9,
          subtopics: [
            {
              id: 'tyttar-ilk-turk-devletleri-s1',
              name: "Türklerin Anayurdu ve Göçler",
              outcomes: [
                { id: 'tyttar-ilk-turk-devletleri-s1-k1', text: "Orta Asya’dan yapılan Türk göçlerinin nedenlerini ve sonuçlarını açıklar." },
                { id: 'tyttar-ilk-turk-devletleri-s1-k2', text: "Bozkır kültürünün yaşam biçimine etkisini yorumlar." },
              ],
            },
            {
              id: 'tyttar-ilk-turk-devletleri-s2',
              name: "Asya Hun, Kök Türk ve Uygur Devletleri",
              outcomes: [
                { id: 'tyttar-ilk-turk-devletleri-s2-k1', text: "İlk Türk devletlerinin siyasi gelişimini ve kültürel özelliklerini açıklar." },
                { id: 'tyttar-ilk-turk-devletleri-s2-k2', text: "Orhun Yazıtlarının Türk tarihi açısından önemini değerlendirir." },
              ],
            },
            {
              id: 'tyttar-ilk-turk-devletleri-s3',
              name: "Avrupa’daki Türk Toplulukları",
              outcomes: [
                { id: 'tyttar-ilk-turk-devletleri-s3-k1', text: "Kavimler Göçü’nün Avrupa tarihine etkilerini açıklar." },
                { id: 'tyttar-ilk-turk-devletleri-s3-k2', text: "Avrupa Hunları, Avarlar, Hazarlar ve Bulgarların özelliklerini tanır." },
              ],
            },
            {
              id: 'tyttar-ilk-turk-devletleri-s4',
              name: "Türklerde Devlet, Toplum ve Ekonomi",
              outcomes: [
                { id: 'tyttar-ilk-turk-devletleri-s4-k1', text: "Kut, töre, kurultay ve ikili teşkilat kavramlarını açıklar." },
                { id: 'tyttar-ilk-turk-devletleri-s4-k2', text: "İlk Türk devletlerinde ekonomik hayatın temel özelliklerini yorumlar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-tarih-u2',
      name: "İslam Medeniyeti ve Türk-İslam Devletleri",
      topics: [
        {
          id: 'tyttar-islam-tarihi',
          name: "İslam Medeniyetinin Doğuşu",
          grade: 9,
          subtopics: [
            {
              id: 'tyttar-islam-tarihi-s1',
              name: "İslamiyet Öncesi Arabistan ve Hz. Muhammed Dönemi",
              outcomes: [
                { id: 'tyttar-islam-tarihi-s1-k1', text: "İslamiyet öncesi Arap Yarımadası’nın siyasi, sosyal ve ekonomik durumunu açıklar." },
                { id: 'tyttar-islam-tarihi-s1-k2', text: "Hicretin ve Medine döneminin İslam devletinin oluşumuna etkisini yorumlar." },
              ],
            },
            {
              id: 'tyttar-islam-tarihi-s2',
              name: "Dört Halife Dönemi",
              outcomes: [
                { id: 'tyttar-islam-tarihi-s2-k1', text: "Dört Halife döneminde yapılan fetihleri ve düzenlemeleri açıklar." },
                { id: 'tyttar-islam-tarihi-s2-k2', text: "Halifelik seçim usullerini ve iç karışıklıkların nedenlerini yorumlar." },
              ],
            },
            {
              id: 'tyttar-islam-tarihi-s3',
              name: "Emeviler ve Abbasiler",
              outcomes: [
                { id: 'tyttar-islam-tarihi-s3-k1', text: "Emevilerin yönetim anlayışını ve Arap milliyetçiliği politikasının sonuçlarını açıklar." },
                { id: 'tyttar-islam-tarihi-s3-k2', text: "Abbasiler döneminde Türklerin İslam dünyasındaki etkinliğinin artışını yorumlar." },
              ],
            },
          ],
        },
        {
          id: 'tyttar-turk-islam-devletleri',
          name: "Türklerin İslamiyet’i Kabulü ve İlk Türk-İslam Devletleri",
          grade: 9,
          subtopics: [
            {
              id: 'tyttar-turk-islam-devletleri-s1',
              name: "Türklerin İslamiyet’i Kabulü",
              outcomes: [
                { id: 'tyttar-turk-islam-devletleri-s1-k1', text: "Talas Savaşı’nın Türklerin İslamiyet’e geçiş sürecine etkisini açıklar." },
                { id: 'tyttar-turk-islam-devletleri-s1-k2', text: "Türklerin İslamiyet’i kabul etmesini kolaylaştıran etkenleri yorumlar." },
              ],
            },
            {
              id: 'tyttar-turk-islam-devletleri-s2',
              name: "Karahanlılar ve Gazneliler",
              outcomes: [
                { id: 'tyttar-turk-islam-devletleri-s2-k1', text: "Karahanlı ve Gazneli devletlerinin siyasi ve kültürel özelliklerini açıklar." },
                { id: 'tyttar-turk-islam-devletleri-s2-k2', text: "Karahanlı döneminde yazılan eserlerin Türk kültürüne katkısını değerlendirir." },
              ],
            },
            {
              id: 'tyttar-turk-islam-devletleri-s3',
              name: "Büyük Selçuklu Devleti",
              outcomes: [
                { id: 'tyttar-turk-islam-devletleri-s3-k1', text: "Büyük Selçuklu Devleti’nin kuruluş ve yükselişini dönüm noktası savaşlarla açıklar." },
                { id: 'tyttar-turk-islam-devletleri-s3-k2', text: "Malazgirt Savaşı’nın Türk ve dünya tarihi açısından sonuçlarını yorumlar." },
              ],
            },
            {
              id: 'tyttar-turk-islam-devletleri-s4',
              name: "Türk-İslam Devletlerinde Kültür ve Medeniyet",
              outcomes: [
                { id: 'tyttar-turk-islam-devletleri-s4-k1', text: "İkta sistemi, atabeylik ve Nizamiye medreselerinin işlevini açıklar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-tarih-u3',
      name: "Selçuklu Türkiyesi ve Osmanlı Devleti’nin Yükselişi",
      topics: [
        {
          id: 'tyttar-turkiye-selcuklu',
          name: "Yerleşme ve Devletleşme Sürecinde Selçuklu Türkiyesi",
          grade: 10,
          subtopics: [
            {
              id: 'tyttar-turkiye-selcuklu-s1',
              name: "Anadolu’nun Yurt Edinilmesi ve İlk Beylikler",
              outcomes: [
                { id: 'tyttar-turkiye-selcuklu-s1-k1', text: "Malazgirt sonrası kurulan ilk Türk beyliklerinin Anadolu’nun Türkleşmesine katkısını açıklar." },
              ],
            },
            {
              id: 'tyttar-turkiye-selcuklu-s2',
              name: "Türkiye Selçuklu Devleti’nin Siyasi Tarihi",
              outcomes: [
                { id: 'tyttar-turkiye-selcuklu-s2-k1', text: "Haçlı Seferleri ve Miryokefalon Savaşı’nın Anadolu’ya etkilerini açıklar." },
                { id: 'tyttar-turkiye-selcuklu-s2-k2', text: "Kösedağ Savaşı’nın Anadolu’nun siyasi yapısına etkisini yorumlar." },
              ],
            },
            {
              id: 'tyttar-turkiye-selcuklu-s3',
              name: "Selçuklu Türkiyesi’nde Ekonomi ve Kültür",
              outcomes: [
                { id: 'tyttar-turkiye-selcuklu-s3-k1', text: "Kervansaraylar, ahilik ve transit ticaretin ekonomik hayattaki yerini açıklar." },
                { id: 'tyttar-turkiye-selcuklu-s3-k2', text: "Selçuklu döneminde Anadolu’da oluşan dinî ve kültürel hayatı yorumlar." },
              ],
            },
          ],
        },
        {
          id: 'tyttar-osmanli-kurulus-yukselme',
          name: "Beylikten Devlete ve Dünya Gücü Osmanlı",
          grade: 10,
          subtopics: [
            {
              id: 'tyttar-osmanli-kurulus-yukselme-s1',
              name: "Kuruluş ve Balkanlara Geçiş",
              outcomes: [
                { id: 'tyttar-osmanli-kurulus-yukselme-s1-k1', text: "Osmanlı Beyliği’nin kısa sürede devletleşmesinin nedenlerini açıklar." },
                { id: 'tyttar-osmanli-kurulus-yukselme-s1-k2', text: "Osmanlıların Rumeli’deki iskân ve fetih politikasını yorumlar." },
              ],
            },
            {
              id: 'tyttar-osmanli-kurulus-yukselme-s2',
              name: "Fetret Devri ve Yeniden Toparlanma",
              outcomes: [
                { id: 'tyttar-osmanli-kurulus-yukselme-s2-k1', text: "Ankara Savaşı ve Fetret Devri’nin Osmanlı siyasetine etkilerini açıklar." },
              ],
            },
            {
              id: 'tyttar-osmanli-kurulus-yukselme-s3',
              name: "İstanbul’un Fethi ve Cihan Devleti",
              outcomes: [
                { id: 'tyttar-osmanli-kurulus-yukselme-s3-k1', text: "İstanbul’un fethinin nedenlerini ve sonuçlarını değerlendirir." },
                { id: 'tyttar-osmanli-kurulus-yukselme-s3-k2', text: "Yavuz ve Kanuni dönemlerindeki gelişmelerin Osmanlı’yı dünya gücü hâline getirmesini açıklar." },
              ],
            },
          ],
        },
        {
          id: 'tyttar-osmanli-kultur-medeniyet',
          name: "Osmanlı Kültür ve Medeniyeti",
          grade: 10,
          subtopics: [
            {
              id: 'tyttar-osmanli-kultur-medeniyet-s1',
              name: "Merkez ve Taşra Teşkilatı",
              outcomes: [
                { id: 'tyttar-osmanli-kultur-medeniyet-s1-k1', text: "Divan-ı Hümayun’un yapısını ve üyelerinin görevlerini açıklar." },
                { id: 'tyttar-osmanli-kultur-medeniyet-s1-k2', text: "Veraset sisteminde yapılan değişikliklerin nedenlerini yorumlar." },
              ],
            },
            {
              id: 'tyttar-osmanli-kultur-medeniyet-s2',
              name: "Ordu, Toprak ve Ekonomi",
              outcomes: [
                { id: 'tyttar-osmanli-kultur-medeniyet-s2-k1', text: "Tımar sisteminin askerî, ekonomik ve sosyal işlevlerini açıklar." },
                { id: 'tyttar-osmanli-kultur-medeniyet-s2-k2', text: "Devşirme sistemi ve Kapıkulu ocaklarının merkezî otoriteye katkısını yorumlar." },
              ],
            },
            {
              id: 'tyttar-osmanli-kultur-medeniyet-s3',
              name: "Toplum, Hukuk, Bilim ve Sanat",
              outcomes: [
                { id: 'tyttar-osmanli-kultur-medeniyet-s3-k1', text: "Millet sistemi, lonca ve vakıf kurumlarının toplumsal işlevini açıklar." },
                { id: 'tyttar-osmanli-kultur-medeniyet-s3-k2', text: "Osmanlı bilim, sanat ve mimarisinin önemli temsilcilerini tanır." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-tarih-u4',
      name: "Değişen Dünya Dengeleri Karşısında Osmanlı",
      topics: [
        {
          id: 'tyttar-osmanli-degisim-donemi',
          name: "Değişim Çağında Osmanlı (XVII–XVIII. Yüzyıl)",
          grade: 11,
          subtopics: [
            {
              id: 'tyttar-osmanli-degisim-donemi-s1',
              name: "Avrupa’daki Dönüşüm",
              outcomes: [
                { id: 'tyttar-osmanli-degisim-donemi-s1-k1', text: "Coğrafi Keşifler, Rönesans, Reform ve Aydınlanma’nın Avrupa’ya etkilerini açıklar." },
              ],
            },
            {
              id: 'tyttar-osmanli-degisim-donemi-s2',
              name: "XVII. Yüzyılda Osmanlı Siyaseti",
              outcomes: [
                { id: 'tyttar-osmanli-degisim-donemi-s2-k1', text: "Zitvatorok, Kasr-ı Şirin ve Karlofça antlaşmalarının Osmanlı açısından önemini değerlendirir." },
                { id: 'tyttar-osmanli-degisim-donemi-s2-k2', text: "XVII. yüzyılda yapılan ıslahatların niteliğini yorumlar." },
              ],
            },
            {
              id: 'tyttar-osmanli-degisim-donemi-s3',
              name: "XVIII. Yüzyılda Osmanlı: Denge Politikası ve Islahatlar",
              outcomes: [
                { id: 'tyttar-osmanli-degisim-donemi-s3-k1', text: "Lale Devri ve III. Selim dönemi ıslahatlarının özelliklerini açıklar." },
                { id: 'tyttar-osmanli-degisim-donemi-s3-k2', text: "Küçük Kaynarca Antlaşması’nın Osmanlı-Rus ilişkilerine etkisini yorumlar." },
              ],
            },
          ],
        },
        {
          id: 'tyttar-osmanli-en-uzun-yuzyil',
          name: "En Uzun Yüzyıl (XIX. Yüzyıl)",
          grade: 11,
          subtopics: [
            {
              id: 'tyttar-osmanli-en-uzun-yuzyil-s1',
              name: "Fransız İhtilali, Milliyetçilik ve Ayrılıkçı İsyanlar",
              outcomes: [
                { id: 'tyttar-osmanli-en-uzun-yuzyil-s1-k1', text: "Milliyetçilik akımının Osmanlı Devleti’ndeki ayrılıkçı hareketlere etkisini açıklar." },
              ],
            },
            {
              id: 'tyttar-osmanli-en-uzun-yuzyil-s2',
              name: "II. Mahmud Dönemi Yenilikleri",
              outcomes: [
                { id: 'tyttar-osmanli-en-uzun-yuzyil-s2-k1', text: "Sened-i İttifak ve Yeniçeri Ocağı’nın kaldırılmasının önemini değerlendirir." },
              ],
            },
            {
              id: 'tyttar-osmanli-en-uzun-yuzyil-s3',
              name: "Tanzimat, Islahat ve Meşrutiyet",
              outcomes: [
                { id: 'tyttar-osmanli-en-uzun-yuzyil-s3-k1', text: "Tanzimat ve Islahat fermanlarının hukuki ve toplumsal sonuçlarını açıklar." },
                { id: 'tyttar-osmanli-en-uzun-yuzyil-s3-k2', text: "Kanun-i Esasi ve Meşrutiyet yönetiminin demokratikleşme sürecindeki yerini yorumlar." },
              ],
            },
            {
              id: 'tyttar-osmanli-en-uzun-yuzyil-s4',
              name: "Diplomasi, Ekonomi ve Fikir Akımları",
              outcomes: [
                { id: 'tyttar-osmanli-en-uzun-yuzyil-s4-k1', text: "Balta Limanı Antlaşması, dış borçlar ve Duyun-u Umumiye’nin ekonomiye etkilerini açıklar." },
                { id: 'tyttar-osmanli-en-uzun-yuzyil-s4-k2', text: "Osmanlıcılık, İslamcılık, Türkçülük ve Batıcılık akımlarını karşılaştırır." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-tarih-u5',
      name: "XX. Yüzyıl Başlarında Osmanlı ve Millî Mücadele",
      topics: [
        {
          id: 'tyttar-yirminci-yuzyil-baslari',
          name: "XX. Yüzyıl Başlarında Osmanlı Devleti ve Dünya",
          grade: 12,
          subtopics: [
            {
              id: 'tyttar-yirminci-yuzyil-baslari-s1',
              name: "Trablusgarp ve Balkan Savaşları",
              outcomes: [
                { id: 'tyttar-yirminci-yuzyil-baslari-s1-k1', text: "Trablusgarp ve Balkan Savaşlarının nedenlerini ve sonuçlarını açıklar." },
              ],
            },
            {
              id: 'tyttar-yirminci-yuzyil-baslari-s2',
              name: "I. Dünya Savaşı’nın Nedenleri ve Blokları",
              outcomes: [
                { id: 'tyttar-yirminci-yuzyil-baslari-s2-k1', text: "I. Dünya Savaşı’nın siyasi, ekonomik ve askerî nedenlerini açıklar." },
              ],
            },
            {
              id: 'tyttar-yirminci-yuzyil-baslari-s3',
              name: "Osmanlı Cepheleri ve Savaşın Sonu",
              outcomes: [
                { id: 'tyttar-yirminci-yuzyil-baslari-s3-k1', text: "Osmanlı Devleti’nin savaştığı cepheleri ve Çanakkale Cephesi’nin önemini değerlendirir." },
                { id: 'tyttar-yirminci-yuzyil-baslari-s3-k2', text: "Savaş sonunda imzalanan antlaşmaları ve gizli antlaşmaların amaçlarını yorumlar." },
              ],
            },
          ],
        },
        {
          id: 'tyttar-milli-mucadele',
          name: "Millî Mücadele",
          grade: 12,
          subtopics: [
            {
              id: 'tyttar-milli-mucadele-s1',
              name: "Mondros ve İşgallere Tepkiler",
              outcomes: [
                { id: 'tyttar-milli-mucadele-s1-k1', text: "Mondros Ateşkes Antlaşması’nın ağır maddelerini ve işgallere karşı oluşan tepkileri açıklar." },
              ],
            },
            {
              id: 'tyttar-milli-mucadele-s2',
              name: "Hazırlık Dönemi: Genelgeler ve Kongreler",
              outcomes: [
                { id: 'tyttar-milli-mucadele-s2-k1', text: "Amasya Genelgesi, Erzurum ve Sivas kongrelerinde alınan kararları karşılaştırır." },
                { id: 'tyttar-milli-mucadele-s2-k2', text: "Misak-ı Millî’nin ve TBMM’nin açılmasının önemini değerlendirir." },
              ],
            },
            {
              id: 'tyttar-milli-mucadele-s3',
              name: "Cepheler ve Savaşlar",
              outcomes: [
                { id: 'tyttar-milli-mucadele-s3-k1', text: "Doğu, Güney ve Batı cephelerindeki gelişmeleri ve sonuçlarını açıklar." },
                { id: 'tyttar-milli-mucadele-s3-k2', text: "Sakarya Meydan Muharebesi ve Büyük Taarruz’un siyasi sonuçlarını yorumlar." },
              ],
            },
            {
              id: 'tyttar-milli-mucadele-s4',
              name: "Mudanya ve Lozan",
              outcomes: [
                { id: 'tyttar-milli-mucadele-s4-k1', text: "Mudanya Ateşkesi ve Lozan Barış Antlaşması’nın sonuçlarını Sevr ile karşılaştırır." },
              ],
            },
          ],
        },
        {
          id: 'tyttar-ataturk-ilke-inkilaplar',
          name: "Atatürk İlke ve İnkılapları",
          grade: 12,
          subtopics: [
            {
              id: 'tyttar-ataturk-ilke-inkilaplar-s1',
              name: "Siyasi Alanda İnkılaplar",
              outcomes: [
                { id: 'tyttar-ataturk-ilke-inkilaplar-s1-k1', text: "Saltanatın kaldırılması, Cumhuriyet’in ilanı ve halifeliğin kaldırılmasının önemini açıklar." },
                { id: 'tyttar-ataturk-ilke-inkilaplar-s1-k2', text: "Çok partili hayata geçiş denemelerini yorumlar." },
              ],
            },
            {
              id: 'tyttar-ataturk-ilke-inkilaplar-s2',
              name: "Hukuk, Eğitim ve Kültür Alanında İnkılaplar",
              outcomes: [
                { id: 'tyttar-ataturk-ilke-inkilaplar-s2-k1', text: "Türk Medeni Kanunu, Tevhid-i Tedrisat ve Harf İnkılabı’nın toplumsal etkilerini açıklar." },
              ],
            },
            {
              id: 'tyttar-ataturk-ilke-inkilaplar-s3',
              name: "Toplumsal Hayat ve Ekonomi",
              outcomes: [
                { id: 'tyttar-ataturk-ilke-inkilaplar-s3-k1', text: "Toplumsal hayatı düzenleyen inkılapları ve ekonomi politikalarını açıklar." },
              ],
            },
            {
              id: 'tyttar-ataturk-ilke-inkilaplar-s4',
              name: "Atatürk İlkeleri",
              outcomes: [
                { id: 'tyttar-ataturk-ilke-inkilaplar-s4-k1', text: "Atatürk ilkelerini inkılaplarla ilişkilendirerek yorumlar." },
              ],
            },
          ],
        },
      ],
    },
  ],
};
