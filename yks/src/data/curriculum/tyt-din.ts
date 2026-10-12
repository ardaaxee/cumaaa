import type { Subject } from '../../domain/types';

export const subject: Subject = {
  id: 'tyt-din',
  exam: 'TYT',
  name: "TYT Din Kültürü ve Ahlak Bilgisi",
  icon: "☾",
  examQuestionCount: 5,
  note: "Din Kültürü dersinden muaf olan adaylar bu 5 soru yerine ilave felsefe sorularını cevaplar; ilave felsefe için TYT Felsefe konularını çalışabilirsin.",
  units: [
    {
      id: 'tyt-din-u1',
      name: "Bilgi, İnanç ve Din",
      topics: [
        {
          id: 'tytdin-bilgi-ve-inanc',
          name: "Bilgi ve İnanç",
          grade: 9,
          subtopics: [
            {
              id: 'tytdin-bilgi-ve-inanc-s1',
              name: "İslam Düşüncesinde Bilginin Kaynakları",
              outcomes: [
                { id: 'tytdin-bilgi-ve-inanc-s1-k1', text: "İslam düşüncesinde bilginin kaynaklarını (duyular, akıl, doğru haber) açıklar." },
              ],
            },
            {
              id: 'tytdin-bilgi-ve-inanc-s2',
              name: "İnanç ve İman",
              outcomes: [
                { id: 'tytdin-bilgi-ve-inanc-s2-k1', text: "İnanç ve iman kavramlarını açıklar." },
                { id: 'tytdin-bilgi-ve-inanc-s2-k2', text: "Taklidi ve tahkiki iman arasındaki farkı yorumlar." },
              ],
            },
            {
              id: 'tytdin-bilgi-ve-inanc-s3',
              name: "İslam’ın İnanç Esasları ve Allah’ın Sıfatları",
              outcomes: [
                { id: 'tytdin-bilgi-ve-inanc-s3-k1', text: "İslam’ın inanç esaslarını açıklar." },
                { id: 'tytdin-bilgi-ve-inanc-s3-k2', text: "Allah’ın zati ve subuti sıfatlarını ayırt eder." },
              ],
            },
            {
              id: 'tytdin-bilgi-ve-inanc-s4',
              name: "İnançla İlgili Farklı Yaklaşımlar",
              outcomes: [
                { id: 'tytdin-bilgi-ve-inanc-s4-k1', text: "Deizm, ateizm, agnostisizm ve panteizm gibi inançla ilgili farklı yaklaşımları açıklar." },
              ],
            },
          ],
        },
        {
          id: 'tytdin-din-ve-islam',
          name: "Din ve İslam",
          grade: 9,
          subtopics: [
            {
              id: 'tytdin-din-ve-islam-s1',
              name: "Din Kavramı ve Dinin Temel Unsurları",
              outcomes: [
                { id: 'tytdin-din-ve-islam-s1-k1', text: "Din kavramını ve dinin temel unsurlarını açıklar." },
                { id: 'tytdin-din-ve-islam-s1-k2', text: "Din ile kültür arasındaki ilişkiyi yorumlar." },
              ],
            },
            {
              id: 'tytdin-din-ve-islam-s2',
              name: "İslam’ın Anlamı ve Temel Kaynakları",
              outcomes: [
                { id: 'tytdin-din-ve-islam-s2-k1', text: "İslam kelimesinin anlamını ve İslam’ın temel kaynaklarını açıklar." },
              ],
            },
            {
              id: 'tytdin-din-ve-islam-s3',
              name: "İslam’ın Temel Amaçları",
              outcomes: [
                { id: 'tytdin-din-ve-islam-s3-k1', text: "İslam’ın korunmasını amaçladığı temel değerleri (din, can, akıl, nesil, mal) açıklar." },
              ],
            },
            {
              id: 'tytdin-din-ve-islam-s4',
              name: "Din ve Sorumluluk",
              outcomes: [
                { id: 'tytdin-din-ve-islam-s4-k1', text: "Dinî sorumluluğun şartlarını açıklar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-din-u2',
      name: "İbadet ve Ahlak",
      topics: [
        {
          id: 'tytdin-islam-ve-ibadet',
          name: "İslam ve İbadet",
          grade: 9,
          subtopics: [
            {
              id: 'tytdin-islam-ve-ibadet-s1',
              name: "İbadet Kavramı, Çeşitleri ve Dinî Hükümler",
              outcomes: [
                { id: 'tytdin-islam-ve-ibadet-s1-k1', text: "İbadet kavramını ve ibadetlerin çeşitlerini açıklar." },
                { id: 'tytdin-islam-ve-ibadet-s1-k2', text: "Dinî hükümleri (farz, vacip, sünnet, mubah, mekruh, haram) ayırt eder." },
              ],
            },
            {
              id: 'tytdin-islam-ve-ibadet-s2',
              name: "Temizlik ve Namaz",
              outcomes: [
                { id: 'tytdin-islam-ve-ibadet-s2-k1', text: "Abdest, gusül ve teyemmümün anlamını ve önemini açıklar." },
                { id: 'tytdin-islam-ve-ibadet-s2-k2', text: "Namazın farzlarını ve önemini açıklar." },
              ],
            },
            {
              id: 'tytdin-islam-ve-ibadet-s3',
              name: "Oruç, Zekât, Hac ve Kurban",
              outcomes: [
                { id: 'tytdin-islam-ve-ibadet-s3-k1', text: "Oruç, zekât, hac ve kurban ibadetlerinin temel özelliklerini açıklar." },
              ],
            },
            {
              id: 'tytdin-islam-ve-ibadet-s4',
              name: "İbadetlerin Bireye ve Topluma Katkıları",
              outcomes: [
                { id: 'tytdin-islam-ve-ibadet-s4-k1', text: "İbadetlerin bireysel ve toplumsal faydalarını yorumlar." },
              ],
            },
          ],
        },
        {
          id: 'tytdin-ahlak-ve-degerler',
          name: "Ahlak ve Değerler",
          grade: 9,
          subtopics: [
            {
              id: 'tytdin-ahlak-ve-degerler-s1',
              name: "Ahlak Kavramı",
              outcomes: [
                { id: 'tytdin-ahlak-ve-degerler-s1-k1', text: "Ahlak kavramını ve ahlakın dinle ilişkisini açıklar." },
              ],
            },
            {
              id: 'tytdin-ahlak-ve-degerler-s2',
              name: "Temel Ahlaki Değerler",
              outcomes: [
                { id: 'tytdin-ahlak-ve-degerler-s2-k1', text: "Adalet, doğruluk, emanet, merhamet, sabır ve tevazu gibi değerleri örneklerle açıklar." },
              ],
            },
            {
              id: 'tytdin-ahlak-ve-degerler-s3',
              name: "Gençlik, Sorumluluk ve Kötü Alışkanlıklar",
              outcomes: [
                { id: 'tytdin-ahlak-ve-degerler-s3-k1', text: "Gençlerin ahlaki sorumluluklarını ve kötü alışkanlıklardan korunma yollarını yorumlar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-din-u3',
      name: "Hz. Muhammed ve İslam Düşüncesi",
      topics: [
        {
          id: 'tytdin-hz-muhammed',
          name: "Hz. Muhammed",
          grade: 10,
          subtopics: [
            {
              id: 'tytdin-hz-muhammed-s1',
              name: "Peygamberlik Öncesi Hayatı ve Mekke Dönemi",
              outcomes: [
                { id: 'tytdin-hz-muhammed-s1-k1', text: "Hz. Muhammed’in peygamberlik öncesi hayatını ve Mekke dönemini açıklar." },
              ],
            },
            {
              id: 'tytdin-hz-muhammed-s2',
              name: "Hicret ve Medine Dönemi",
              outcomes: [
                { id: 'tytdin-hz-muhammed-s2-k1', text: "Hicret ve Medine dönemindeki önemli olayları kronolojik sırayla açıklar." },
              ],
            },
            {
              id: 'tytdin-hz-muhammed-s3',
              name: "Peygamberlerin Özellikleri ve Hz. Muhammed’in Görevleri",
              outcomes: [
                { id: 'tytdin-hz-muhammed-s3-k1', text: "Peygamberlerin ortak özelliklerini açıklar." },
                { id: 'tytdin-hz-muhammed-s3-k2', text: "Hz. Muhammed’in tebliğ, açıklama ve örnek olma görevlerini yorumlar." },
              ],
            },
          ],
        },
        {
          id: 'tytdin-islam-dusuncesinde-yorumlar',
          name: "İslam Düşüncesinde Yorumlar",
          grade: 10,
          subtopics: [
            {
              id: 'tytdin-islam-dusuncesinde-yorumlar-s1',
              name: "Yorum Farklılıklarının Sebepleri",
              outcomes: [
                { id: 'tytdin-islam-dusuncesinde-yorumlar-s1-k1', text: "Din anlayışındaki yorum farklılıklarının sebeplerini açıklar." },
              ],
            },
            {
              id: 'tytdin-islam-dusuncesinde-yorumlar-s2',
              name: "İtikadi ve Siyasi Yorumlar",
              outcomes: [
                { id: 'tytdin-islam-dusuncesinde-yorumlar-s2-k1', text: "Maturidilik, Eş’arilik, Mutezile, Şia ve Haricilik gibi yorumların temel özelliklerini açıklar." },
              ],
            },
            {
              id: 'tytdin-islam-dusuncesinde-yorumlar-s3',
              name: "Fıkhi Yorumlar",
              outcomes: [
                { id: 'tytdin-islam-dusuncesinde-yorumlar-s3-k1', text: "Fıkhi mezhepleri ve kurucularını eşleştirir." },
              ],
            },
            {
              id: 'tytdin-islam-dusuncesinde-yorumlar-s4',
              name: "Tasavvufi Yorumlar",
              outcomes: [
                { id: 'tytdin-islam-dusuncesinde-yorumlar-s4-k1', text: "Tasavvufi yorumları ve bu yorumların temsilcilerini açıklar." },
                { id: 'tytdin-islam-dusuncesinde-yorumlar-s4-k2', text: "Alevilik-Bektaşilik geleneğinin temel kavramlarını açıklar." },
              ],
            },
          ],
        },
      ],
    },
  ],
};
