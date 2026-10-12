import type { Subject } from '../../domain/types';

export const subject: Subject = {
  id: 'tyt-felsefe',
  exam: 'TYT',
  name: "TYT Felsefe",
  icon: "◇",
  examQuestionCount: 5,
  note: "TYT Sosyal Bilimler testinin felsefe bölümü. MEB 2018 Felsefe (10. sınıf) öğretim programının mantığıyla düzenlenmiştir.",
  units: [
    {
      id: 'tyt-felsefe-u1',
      name: "Felsefeyi Tanıma ve Felsefe ile Düşünme",
      topics: [
        {
          id: 'tytfel-felsefeye-giris',
          name: "Felsefeye Giriş ve Felsefi Düşünme",
          grade: 10,
          subtopics: [
            {
              id: 'tytfel-felsefeye-giris-s1',
              name: "Felsefenin Anlamı ve Felsefi Düşüncenin Özellikleri",
              outcomes: [
                { id: 'tytfel-felsefeye-giris-s1-k1', text: "Felsefenin anlamını ve felsefi düşüncenin özelliklerini açıklar." },
                { id: 'tytfel-felsefeye-giris-s1-k2', text: "Felsefi soruların özelliklerini örneklerle açıklar." },
              ],
            },
            {
              id: 'tytfel-felsefeye-giris-s2',
              name: "Felsefenin Bilim, Din ve Sanatla İlişkisi",
              outcomes: [
                { id: 'tytfel-felsefeye-giris-s2-k1', text: "Felsefenin bilim, din ve sanatla ilişkisini karşılaştırır." },
              ],
            },
            {
              id: 'tytfel-felsefeye-giris-s3',
              name: "İlk Filozoflar ve Arkhe Sorunu",
              outcomes: [
                { id: 'tytfel-felsefeye-giris-s3-k1', text: "İlk Çağ filozoflarının arkhe (ilk ilke) hakkındaki görüşlerini açıklar." },
              ],
            },
            {
              id: 'tytfel-felsefeye-giris-s4',
              name: "Felsefi Düşünme ve Argüman",
              outcomes: [
                { id: 'tytfel-felsefeye-giris-s4-k1', text: "Kavram, önerme, argüman ve akıl yürütme türlerini ayırt eder." },
                { id: 'tytfel-felsefeye-giris-s4-k2', text: "Bir argümanın öncüllerini ve sonucunu belirler." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-felsefe-u2',
      name: "Bilgi ve Varlık",
      topics: [
        {
          id: 'tytfel-bilgi-felsefesi',
          name: "Bilgi Felsefesi",
          grade: 10,
          subtopics: [
            {
              id: 'tytfel-bilgi-felsefesi-s1',
              name: "Bilgi Felsefesinin Temel Kavramları",
              outcomes: [
                { id: 'tytfel-bilgi-felsefesi-s1-k1', text: "Bilgi felsefesinin temel kavramlarını (süje, obje, doğruluk, gerçeklik) açıklar." },
                { id: 'tytfel-bilgi-felsefesi-s1-k2', text: "Bilgi türlerini karşılaştırır." },
              ],
            },
            {
              id: 'tytfel-bilgi-felsefesi-s2',
              name: "Doğru Bilginin İmkânı",
              outcomes: [
                { id: 'tytfel-bilgi-felsefesi-s2-k1', text: "Doğru bilginin mümkün olup olmadığına ilişkin şüpheci ve dogmatik yaklaşımları karşılaştırır." },
              ],
            },
            {
              id: 'tytfel-bilgi-felsefesi-s3',
              name: "Bilginin Kaynağı",
              outcomes: [
                { id: 'tytfel-bilgi-felsefesi-s3-k1', text: "Bilginin kaynağına ilişkin rasyonalist, empirist, kritisist, sezgici ve diğer yaklaşımları açıklar." },
                { id: 'tytfel-bilgi-felsefesi-s3-k2', text: "Filozofların bilgi anlayışlarını görüşleriyle eşleştirir." },
              ],
            },
            {
              id: 'tytfel-bilgi-felsefesi-s4',
              name: "Doğruluk Ölçütleri",
              outcomes: [
                { id: 'tytfel-bilgi-felsefesi-s4-k1', text: "Doğruluk ölçütlerine ilişkin farklı yaklaşımları örneklerle açıklar." },
              ],
            },
          ],
        },
        {
          id: 'tytfel-varlik-felsefesi',
          name: "Varlık Felsefesi",
          grade: 10,
          subtopics: [
            {
              id: 'tytfel-varlik-felsefesi-s1',
              name: "Varlık Felsefesinin Temel Kavramları",
              outcomes: [
                { id: 'tytfel-varlik-felsefesi-s1-k1', text: "Varlık felsefesinin temel kavramlarını (varlık, oluş, töz, idea, madde) açıklar." },
              ],
            },
            {
              id: 'tytfel-varlik-felsefesi-s2',
              name: "Varlığın Var Olup Olmadığı",
              outcomes: [
                { id: 'tytfel-varlik-felsefesi-s2-k1', text: "Varlığın var olup olmadığına ilişkin nihilist ve realist yaklaşımları karşılaştırır." },
              ],
            },
            {
              id: 'tytfel-varlik-felsefesi-s3',
              name: "Varlığın Ne Olduğu ve Değişim Sorunu",
              outcomes: [
                { id: 'tytfel-varlik-felsefesi-s3-k1', text: "Varlığın ne olduğuna ilişkin idealist, materyalist, düalist ve diğer yaklaşımları açıklar." },
                { id: 'tytfel-varlik-felsefesi-s3-k2', text: "Varlığın değişen ya da değişmeyen olduğuna ilişkin görüşleri karşılaştırır." },
              ],
            },
            {
              id: 'tytfel-varlik-felsefesi-s4',
              name: "İslam Düşüncesinde Varlık",
              outcomes: [
                { id: 'tytfel-varlik-felsefesi-s4-k1', text: "Farabi ve İbn Sina’nın varlık anlayışlarını açıklar." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-felsefe-u3',
      name: "Değerler Felsefesi: Ahlak, Sanat ve Din",
      topics: [
        {
          id: 'tytfel-ahlak-felsefesi',
          name: "Ahlak Felsefesi",
          grade: 10,
          subtopics: [
            {
              id: 'tytfel-ahlak-felsefesi-s1',
              name: "Ahlak Felsefesinin Temel Kavramları",
              outcomes: [
                { id: 'tytfel-ahlak-felsefesi-s1-k1', text: "Ahlak felsefesinin temel kavramlarını (iyi, kötü, özgürlük, sorumluluk, erdem, vicdan) açıklar." },
              ],
            },
            {
              id: 'tytfel-ahlak-felsefesi-s2',
              name: "Evrensel Ahlak Yasası",
              outcomes: [
                { id: 'tytfel-ahlak-felsefesi-s2-k1', text: "Evrensel bir ahlak yasasının olup olmadığına ilişkin farklı görüşleri karşılaştırır." },
              ],
            },
            {
              id: 'tytfel-ahlak-felsefesi-s3',
              name: "Ahlaki Eylemin Amacı",
              outcomes: [
                { id: 'tytfel-ahlak-felsefesi-s3-k1', text: "Ahlaki eylemin amacına ilişkin hazcı, faydacı, erdem ve ödev etiği yaklaşımlarını açıklar." },
              ],
            },
            {
              id: 'tytfel-ahlak-felsefesi-s4',
              name: "Özgürlük ve Sorumluluk",
              outcomes: [
                { id: 'tytfel-ahlak-felsefesi-s4-k1', text: "İnsanın özgürlüğüne ilişkin determinist ve indeterminist görüşleri karşılaştırır." },
              ],
            },
          ],
        },
        {
          id: 'tytfel-sanat-felsefesi',
          name: "Sanat Felsefesi",
          grade: 10,
          subtopics: [
            {
              id: 'tytfel-sanat-felsefesi-s1',
              name: "Sanat Felsefesinin Temel Kavramları",
              outcomes: [
                { id: 'tytfel-sanat-felsefesi-s1-k1', text: "Sanat felsefesinin temel kavramlarını (estetik, güzel, estetik yargı, sanat eseri) açıklar." },
              ],
            },
            {
              id: 'tytfel-sanat-felsefesi-s2',
              name: "Güzelin Doğası",
              outcomes: [
                { id: 'tytfel-sanat-felsefesi-s2-k1', text: "Güzelliğin nesnel mi öznel mi olduğuna ilişkin görüşleri karşılaştırır." },
              ],
            },
            {
              id: 'tytfel-sanat-felsefesi-s3',
              name: "Sanatın Ne Olduğu",
              outcomes: [
                { id: 'tytfel-sanat-felsefesi-s3-k1', text: "Sanata ilişkin taklit, yaratma, oyun, iletişim ve ifade görüşlerini açıklar." },
              ],
            },
          ],
        },
        {
          id: 'tytfel-din-felsefesi',
          name: "Din Felsefesi",
          grade: 10,
          subtopics: [
            {
              id: 'tytfel-din-felsefesi-s1',
              name: "Din Felsefesinin Konusu ve Temel Kavramları",
              outcomes: [
                { id: 'tytfel-din-felsefesi-s1-k1', text: "Din felsefesinin konusunu ve temel kavramlarını açıklar." },
              ],
            },
            {
              id: 'tytfel-din-felsefesi-s2',
              name: "Tanrı’nın Varlığına İlişkin Kanıtlar",
              outcomes: [
                { id: 'tytfel-din-felsefesi-s2-k1', text: "Tanrı’nın varlığına ilişkin ontolojik, kozmolojik, teleolojik ve ahlak kanıtlarını açıklar." },
              ],
            },
            {
              id: 'tytfel-din-felsefesi-s3',
              name: "Tanrı Anlayışları",
              outcomes: [
                { id: 'tytfel-din-felsefesi-s3-k1', text: "Teizm, deizm, panteizm, ateizm, agnostisizm ve fideizm yaklaşımlarını karşılaştırır." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tyt-felsefe-u4',
      name: "Siyaset ve Bilim Felsefesi",
      topics: [
        {
          id: 'tytfel-siyaset-felsefesi',
          name: "Siyaset Felsefesi",
          grade: 10,
          subtopics: [
            {
              id: 'tytfel-siyaset-felsefesi-s1',
              name: "Siyaset Felsefesinin Temel Kavramları",
              outcomes: [
                { id: 'tytfel-siyaset-felsefesi-s1-k1', text: "Siyaset felsefesinin temel kavramlarını (devlet, iktidar, meşruiyet, egemenlik, hak, adalet) açıklar." },
              ],
            },
            {
              id: 'tytfel-siyaset-felsefesi-s2',
              name: "Devletin Kaynağı ve Meşruiyeti",
              outcomes: [
                { id: 'tytfel-siyaset-felsefesi-s2-k1', text: "Toplum sözleşmesi görüşlerini (Hobbes, Locke, Rousseau) karşılaştırır." },
              ],
            },
            {
              id: 'tytfel-siyaset-felsefesi-s3',
              name: "İdeal Devlet Düzeni",
              outcomes: [
                { id: 'tytfel-siyaset-felsefesi-s3-k1', text: "İdeal devlet düzenine ilişkin ütopyaları ve görüşleri açıklar." },
              ],
            },
          ],
        },
        {
          id: 'tytfel-bilim-felsefesi',
          name: "Bilim Felsefesi",
          grade: 10,
          subtopics: [
            {
              id: 'tytfel-bilim-felsefesi-s1',
              name: "Bilim Felsefesinin Konusu",
              outcomes: [
                { id: 'tytfel-bilim-felsefesi-s1-k1', text: "Bilim felsefesinin konusunu ve bilimin özelliklerini açıklar." },
              ],
            },
            {
              id: 'tytfel-bilim-felsefesi-s2',
              name: "Bilimsel Yöntem ve Tümevarım Sorunu",
              outcomes: [
                { id: 'tytfel-bilim-felsefesi-s2-k1', text: "Bilimsel yöntemin aşamalarını ve tümevarım sorununu açıklar." },
              ],
            },
            {
              id: 'tytfel-bilim-felsefesi-s3',
              name: "Bilim Anlayışları",
              outcomes: [
                { id: 'tytfel-bilim-felsefesi-s3-k1', text: "Ürün olarak bilim ve etkinlik olarak bilim anlayışlarını karşılaştırır." },
                { id: 'tytfel-bilim-felsefesi-s3-k2', text: "Bacon, Popper, Kuhn ve Viyana Çevresi’nin bilim anlayışlarını açıklar." },
              ],
            },
          ],
        },
      ],
    },
  ],
};
