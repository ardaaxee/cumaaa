/* ARDA.OS — content layer.
 *
 * Everything readable on the site lives here. Logic never writes to this file;
 * modules only read from it. Change the strings, save, reload.
 */

export const IDENTITY = {
  name: "ARDA.OS",
  role: "DIGITAL IDENTITY / 2026",
  handle: "@lov4ardaa",
  instagram: "https://www.instagram.com/lov4ardaa/",
  github: "https://github.com/ardaaxee",

  /* The three-word statement under the wordmark. */
  statement: ["BUILD.", "EXPERIMENT.", "LEARN."],

  /* Short personal manifesto, two lines. */
  manifesto: [
    "Bir telefonun içine sığan bir geliştirme ortamı kurdum.",
    "Öğrendiğim her şeyi burada bir sisteme dönüştürüyorum.",
  ],
};

/* --- WHAT I DO ------------------------------------------------------------ */

export const WHAT_I_DO = [
  {
    id: "ai", label: "AI", index: "01",
    line: "Modelleri günlük işlere bağlarım",
    body: "Dil modellerini tek başına bir oyuncak olarak değil, bir akışın " +
          "parçası olarak kullanıyorum: girdiyi hazırla, modele sor, çıktıyı " +
          "doğrula, bir yere yaz. İlginç olan model değil, bağlandığı boru hattı.",
    points: [
      "İstem tasarımı ve çıktı doğrulama",
      "Model çıktısını dosyaya, API'ye veya bota bağlama",
      "Tekrar eden işleri modele devretme",
    ],
    tags: ["Python", "API", "Prompt"],
  },
  {
    id: "automation", label: "AUTOMATION", index: "02",
    line: "İki kez yaptığım işi bir daha yapmam",
    body: "Bir işi elle ikinci kez yapıyorsam, üçüncüsü için betik yazarım. " +
          "Otomasyon benim için zamandan tasarruf değil; hatayı ortadan " +
          "kaldırmak. İnsan yorulur, betik yorulmaz.",
    points: [
      "Zamanlanmış görevler ve arka plan işleri",
      "Dosya işleme, yeniden adlandırma, toplu dönüştürme",
      "Bildirim ve raporlama akışları",
    ],
    tags: ["Bash", "Python", "cron"],
  },
  {
    id: "web", label: "WEB", index: "03",
    line: "Arayüzü de sunucuyu da kendim yazarım",
    body: "Bu sitenin tamamı dahil: arayüz tarafında framework kullanmadan " +
          "vanilla JavaScript, sunucu tarafında Flask. Kütüphane eklemeden " +
          "önce kendim yazabilir miyim diye sorarım. Genelde yazabiliyorum.",
    points: [
      "Flask ile API ve sunucu tarafı",
      "Framework'süz arayüz, sıfır dış bağımlılık",
      "Mobil öncelikli tasarım ve erişilebilirlik",
    ],
    tags: ["Flask", "JavaScript", "CSS"],
  },
  {
    id: "termux", label: "TERMUX", index: "04",
    line: "Bilgisayarım cebimde",
    body: "Geliştirme ortamım bir telefon. Termux üzerinde Linux kullanıcı " +
          "alanı, Python, Git ve bir web sunucusu çalışıyor. Kısıt gibi " +
          "görünen şey aslında disiplin: hafif yazmak zorundasın.",
    points: [
      "Android üzerinde tam Linux araç zinciri",
      "Telefonda çalışan yerel web sunucusu",
      "Git ile sürüm kontrolü ve dağıtım",
    ],
    tags: ["Linux", "Termux", "Git"],
  },
  {
    id: "experiments", label: "EXPERIMENTS", index: "05",
    line: "Bazen sadece merak ettiğim için",
    body: "Bir işe yaraması gerekmeyen şeyler: canvas denemeleri, ses sentezi, " +
          "hücresel otomatlar, tipografi oyunları. En çok buradan öğreniyorum, " +
          "çünkü burada başarısız olmanın maliyeti sıfır.",
    points: [
      "Canvas ve animasyon denemeleri",
      "Web Audio ile ses üretimi",
      "Algoritma görselleştirmeleri",
    ],
    tags: ["Canvas", "WebAudio"],
  },
];

/* --- TERMUX LAB ----------------------------------------------------------- */
/* Reading-and-reference only. Nothing here runs on the visitor's device and
   nothing destructive is taught as a shortcut. */

export const LAB = {
  title: "TERMUX LAB",
  subtitle: "Sıfırdan başlayan bir komut satırı yolu.",
  note: "Burada saldırı, izinsiz erişim veya tehlikeli işlem içeriği yok. " +
        "Komutlar burada çalıştırılmaz — okunur, kopyalanır, kendi cihazında denenir.",
  modules: [
    {
      id: "basics", index: "01", label: "TERMINAL BASICS",
      level: "BAŞLANGIÇ",
      line: "Neredesin, ne var, nasıl gezersin",
      lessons: [
        {
          id: "pwd", command: "pwd",
          desc: "Bulunduğun dizinin tam yolunu yazdırır. Kaybolduğunda ilk yazacağın komut.",
          example: "$ pwd\n/data/data/com.termux/files/home",
          note: "Termux'un ev dizini normal Linux'taki /home/kullanıcı değildir.",
        },
        {
          id: "ls", command: "ls -la",
          desc: "Dizin içeriğini listeler. -l uzun format, -a gizli dosyalar dahil.",
          example: "$ ls -la\ndrwx------  4 u0_a336 4096 Aug 15 12:04 .\n-rw-------  1 u0_a336   28 Aug 15 12:04 notes.txt",
          note: "Nokta ile başlayan dosyalar gizlidir; -a olmadan görünmezler.",
        },
        {
          id: "cd", command: "cd",
          desc: "Çalışma dizinini değiştirir. .. üst dizin, ~ ev dizini, - önceki dizin.",
          example: "$ cd projects\n$ cd ..\n$ cd ~",
          note: "Argümansız cd seni her zaman ev dizinine döndürür.",
        },
        {
          id: "clear", command: "clear",
          desc: "Ekranı temizler. Geçmişi silmez, sadece görüntüyü tazeler.",
          example: "$ clear",
          note: "Ctrl+L aynı işi yapar ve daha hızlıdır.",
        },
      ],
    },
    {
      id: "files", index: "02", label: "FILES",
      level: "BAŞLANGIÇ",
      line: "Oluştur, kopyala, taşı, sil",
      lessons: [
        {
          id: "mkdir", command: "mkdir -p",
          desc: "Dizin oluşturur. -p ile iç içe dizinleri tek komutta açar.",
          example: "$ mkdir lab\n$ mkdir -p site/static/css",
          note: "-p ayrıca dizin zaten varsa hata vermez; betiklerde bu yüzden tercih edilir.",
        },
        {
          id: "touch", command: "touch",
          desc: "Boş dosya oluşturur ya da var olanın zaman damgasını günceller.",
          example: "$ touch notes.txt",
          note: "İçeriğe dokunmaz. Yazmak için echo veya bir editör gerekir.",
        },
        {
          id: "cat", command: "cat",
          desc: "Dosya içeriğini ekrana basar. -n satırları numaralandırır.",
          example: "$ cat notes.txt\n$ cat -n notes.txt",
          note: "Uzun dosyalarda ekranı doldurur; head veya tail daha uygundur.",
        },
        {
          id: "cp", command: "cp -r",
          desc: "Kopyalar. Dizinler için -r zorunludur.",
          example: "$ cp notes.txt notes.bak\n$ cp -r site site-yedek",
          note: "Hedefte aynı isim varsa sormadan üzerine yazar. -i bunu sorar hale getirir.",
        },
        {
          id: "mv", command: "mv",
          desc: "Taşır ya da yeniden adlandırır. Linux'ta ayrı bir rename komutu yoktur.",
          example: "$ mv notes.txt gunluk.txt\n$ mv gunluk.txt arsiv/",
          note: "Hedef var olan bir dizinse içine taşır, değilse yeniden adlandırır.",
        },
        {
          id: "rm", command: "rm",
          desc: "Siler. Terminalde silinen dosya çöp kutusuna gitmez, geri alınamaz.",
          example: "$ rm yedek.txt\n$ rm -r eski-klasor",
          note: "Silmeden önce aynı ifadeyi ls ile çalıştır. ls ne gösteriyorsa rm onu siler.",
          warn: true,
        },
      ],
    },
    {
      id: "packages", index: "03", label: "PACKAGE MANAGEMENT",
      level: "ORTA",
      line: "Termux'u kullanılabilir hale getiren komut",
      lessons: [
        {
          id: "pkg-update", command: "pkg update",
          desc: "Paket listesini tazeler. Yeni kuruluma başlarken ilk adım.",
          example: "$ pkg update",
          note: "Liste eski kalırsa kurulumlar beklenmedik şekilde başarısız olur.",
        },
        {
          id: "pkg-install", command: "pkg install",
          desc: "Resmi depodan paket kurar.",
          example: "$ pkg install python\n$ pkg install git nodejs",
          note: "İnternetten bulduğun rastgele kurulum betiklerini çalıştırma; depodan kur.",
        },
        {
          id: "pkg-search", command: "pkg search",
          desc: "Depoda paket arar. Adını tam bilmediğinde işe yarar.",
          example: "$ pkg search node\n$ pkg list-installed",
          note: "pkg arka planda apt kullanır; Termux'ta pkg tercih edilir.",
        },
      ],
    },
    {
      id: "python", index: "04", label: "PYTHON",
      level: "ORTA",
      line: "Telefonda otomasyon ve sunucu",
      lessons: [
        {
          id: "python", command: "python",
          desc: "Python yorumlayıcısını çalıştırır: betik dosyası veya etkileşimli kabuk.",
          example: "$ python --version\n$ python app.py\n$ python -m http.server 8000",
          note: "-m ile kurulu bir modülü doğrudan çalıştırırsın; http.server tek komutta sunucu açar.",
        },
        {
          id: "pip", command: "pip install",
          desc: "Python kütüphanesi kurar. pkg'den ayrıdır: pkg sistem, pip Python paketleri.",
          example: "$ pip install flask\n$ pip list",
          note: "Proje başına sanal ortam kullanmak karışıklığı önler.",
        },
      ],
    },
    {
      id: "git", index: "05", label: "GIT",
      level: "İLERİ",
      line: "Geri dönebileceğin tek nokta",
      lessons: [
        {
          id: "git-init", command: "git init",
          desc: "Bulunduğun klasörü bir git deposuna çevirir.",
          example: "$ git init\n$ git status",
          note: "git status takıldığın her an bakacağın ilk komuttur.",
        },
        {
          id: "git-add", command: "git add",
          desc: "Değişiklikleri hazırlık alanına alır.",
          example: "$ git add .\n$ git add README.md",
          note: "Akış üç adımlıdır: çalışma alanı → hazırlık alanı → depo.",
        },
        {
          id: "git-commit", command: "git commit -m",
          desc: "Hazırlanan değişiklikleri bir mesajla kaydeder.",
          example: '$ git commit -m "qr üretimini bağımlılıksız yap"\n$ git log --oneline',
          note: "Mesaj ne yaptığını anlatmalı. \"güncelleme\" altı ay sonra hiçbir şey ifade etmez.",
        },
      ],
    },
  ],
};

/* --- NOW ------------------------------------------------------------------ */

export const NOW = {
  updated: "2026-08-15",
  blocks: [
    {
      key: "CURRENTLY BUILDING",
      items: [
        { title: "ARDA.OS", line: "Bu sitenin kendisi — tasarım ve arka uç" },
        { title: "Otomasyon seti", line: "Termux üzerinde çalışan arka plan işleri" },
      ],
    },
    {
      key: "CURRENTLY LEARNING",
      items: [
        { title: "TERMUX / LINUX", line: "Süreç yönetimi, izinler, kabuk betikleri" },
        { title: "Sistem tasarımı", line: "API mimarisi ve veri modelleme" },
      ],
    },
    {
      key: "CURRENTLY EXPLORING",
      items: [
        { title: "AI / AUTOMATION", line: "Model çıktısını doğrulama yöntemleri" },
        { title: "Canvas", line: "Performanslı animasyon ve görselleştirme" },
      ],
    },
  ],
};

/* --- DIGITAL TOOLBOX ------------------------------------------------------ */

export const TOOLBOX = [
  { name: "Python", kind: "LANG", use: "Otomasyon, API, veri işleme",
    body: "Ana dilim. Bir işi hızlı çözmem gerektiğinde önce Python açarım — " +
          "standart kütüphanesi tek başına çoğu işi bitiriyor." },
  { name: "JavaScript", kind: "LANG", use: "Arayüz, etkileşim, canvas",
    body: "Tarayıcıda framework kullanmadan yazıyorum. Bu sitedeki her " +
          "etkileşim vanilla JS ile yazıldı." },
  { name: "HTML", kind: "MARKUP", use: "Yapı ve anlam",
    body: "Doğru etiket, yarısı bitmiş erişilebilirlik demek. Div yığmak yerine " +
          "anlamlı yapı kurmayı tercih ediyorum." },
  { name: "CSS", kind: "STYLE", use: "Tasarım sistemi, animasyon",
    body: "Değişkenlerle kurulmuş bir tasarım sistemi, tek tek stil yazmaktan " +
          "her zaman daha sürdürülebilir." },
  { name: "Linux", kind: "OS", use: "Komut satırı, süreç yönetimi",
    body: "Her şeyin üzerine kurulduğu katman. Dosya sistemi ve izinleri " +
          "anlamak, geri kalan her şeyi kolaylaştırıyor." },
  { name: "Termux", kind: "ENV", use: "Android üzerinde geliştirme",
    body: "Geliştirme ortamım. Telefonda tam bir Linux araç zinciri, Python, " +
          "Git ve çalışan bir web sunucusu." },
  { name: "Git", kind: "TOOL", use: "Sürüm kontrolü ve dağıtım",
    body: "Bir şeyi bozduğumda geri dönebileceğim tek nokta. Her anlamlı " +
          "değişiklikten sonra commit atmayı alışkanlık haline getirdim." },
  { name: "AI", kind: "TOOL", use: "Model entegrasyonu ve istem",
    body: "Modeli bir akışın parçası olarak kullanıyorum. Çıktıyı doğrulamadan " +
          "hiçbir yere yazmam." },
];

/* --- DISCOVER ------------------------------------------------------------- */

export const DISCOVER = [
  { id: "hero", label: "IDENTITY" },
  { id: "whatido", label: "WHAT I DO" },
  { id: "lab", label: "TERMUX LAB" },
  { id: "projects", label: "PROJECTS" },
  { id: "now", label: "NOW" },
  { id: "toolbox", label: "TOOLBOX" },
  { id: "session", label: "SESSION" },
  { id: "console", label: "CONSOLE" },
  { id: "connect", label: "CONNECT" },
];

/* --- easter eggs ---------------------------------------------------------- */

export const EGGS = {
  /* Typed into the console. */
  commands: {
    "sudo": "Termux'ta sudo yoktur ve gerekmez. Kendi sanal alanında zaten sensin.",
    "whoisarda": "Bu sitenin ilk adı buydu. Geçmişi git log'da duruyor.",
    "42": "Doğru soruyu bulman lazım.",
  },
  /* Tapping the wordmark. */
  tapCount: 6,
  tapMessage: "SYSTEM: kalıcı bir şey aramıyorsun, sadece meraklısın. İyi.",
  /* Konami. */
  konamiMessage: "SYSTEM: eski okul. Konsola 'whoisarda' yaz.",
};
