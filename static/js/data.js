/* ARDA.OS — düzenlenebilir içerik.
 *
 * Sitedeki metinlerin neredeyse tamamı bu dosyadan gelir. Kod bilmeden
 * değiştirebilirsin: tırnak içindeki yazıları değiştir, kaydet, sayfayı yenile.
 */

export const IDENTITY = {
  name: "ARDA.OS",
  role: "DIGITAL IDENTITY / 2026",
  handle: "@lov4ardaa",
  instagram: "https://www.instagram.com/lov4ardaa/",
  github: "https://github.com/ardaaxee",
  manifesto: [
    "Merak ediyorum.",
    "Sistemler kuruyorum.",
    "Fikirleri gerçeğe dönüştürüyorum.",
  ],
  intro: "Android üzerinde geliştiriyorum. Kurduğum her sistem burada.",
};

/* --- 3. WHAT I DO --------------------------------------------------------- */

export const WHAT_I_DO = [
  {
    id: "ai",
    label: "AI",
    index: "01",
    line: "Modelleri günlük işlere bağlarım",
    body: "Dil modellerini tek başına bir oyuncak olarak değil, bir akışın parçası " +
          "olarak kullanıyorum: girdiyi hazırla, modele sor, çıktıyı doğrula, bir " +
          "yere yaz. İlginç olan model değil, modelin bağlandığı boru hattı.",
    points: [
      "İstem tasarımı ve çıktı doğrulama",
      "Model çıktısını dosyaya, API'ye veya bota bağlama",
      "Tekrar eden işleri modele devretme",
    ],
    tags: ["Python", "API", "Prompt", "Automation"],
  },
  {
    id: "automation",
    label: "AUTOMATION",
    index: "02",
    line: "İki kez yaptığım işi bir daha yapmam",
    body: "Bir işi elle ikinci kez yapıyorsam, üçüncüsü için betik yazarım. " +
          "Otomasyon benim için zamandan tasarruf değil; hatayı ortadan " +
          "kaldırmak. İnsan yorulur, betik yorulmaz.",
    points: [
      "Zamanlanmış görevler ve arka plan işleri",
      "Dosya işleme, yeniden adlandırma, toplu dönüştürme",
      "Bildirim ve raporlama akışları",
    ],
    tags: ["Bash", "Python", "cron", "Termux"],
  },
  {
    id: "web",
    label: "WEB",
    index: "03",
    line: "Arayüzü de sunucuyu da kendim yazarım",
    body: "Bu sitenin tamamı dahil: arayüz tarafında framework kullanmadan " +
          "vanilla JavaScript, sunucu tarafında Flask. Kütüphane eklemeden önce " +
          "kendim yazabilir miyim diye sorarım. Genelde yazabiliyorum.",
    points: [
      "Flask ile API ve sunucu tarafı",
      "Framework'süz arayüz, sıfır dış bağımlılık",
      "Mobil öncelikli tasarım ve erişilebilirlik",
    ],
    tags: ["Flask", "JavaScript", "CSS", "SQLite"],
  },
  {
    id: "termux",
    label: "TERMUX",
    index: "04",
    line: "Bilgisayarım cebimde",
    body: "Geliştirme ortamım bir telefon. Termux üzerinde Linux kullanıcı alanı, " +
          "Python, Git ve bir web sunucusu çalışıyor. Kısıt gibi görünen şey " +
          "aslında disiplin: hafif yazmak zorundasın.",
    points: [
      "Android üzerinde tam Linux araç zinciri",
      "Telefonda çalışan yerel web sunucusu",
      "Git ile sürüm kontrolü ve dağıtım",
    ],
    tags: ["Linux", "Termux", "Git", "SSH"],
  },
  {
    id: "experiments",
    label: "EXPERIMENTS",
    index: "05",
    line: "Bazen sadece merak ettiğim için",
    body: "Bir işe yaraması gerekmeyen şeyler: canvas denemeleri, ses sentezi, " +
          "hücresel otomatlar, tipografi oyunları. En çok buradan öğreniyorum, " +
          "çünkü burada başarısız olmanın maliyeti sıfır.",
    points: [
      "Canvas ve animasyon denemeleri",
      "Web Audio ile ses üretimi",
      "Algoritma görselleştirmeleri",
    ],
    tags: ["Canvas", "WebAudio", "Algoritma"],
  },
];

/* --- 4. TERMUX LAB -------------------------------------------------------- */

export const LAB = {
  title: "TERMUX LAB",
  subtitle: "Android üzerinde kurduğum sistemler.",
  note: "Burada saldırı veya izinsiz erişim içeriği yok. Kendi cihazımda " +
        "kurduğum, güvenli ve yasal sistemler.",
  categories: [
    {
      id: "ai-tools",
      cmd: "$ AI TOOLS",
      line: "Telefonda çalışan model boru hatları",
      body: "Model çağrılarını betiklere gömüp çıktıyı işleyen küçük araçlar. " +
            "Ağır iş sunucuda, tetikleyici ve işleme telefonda.",
      items: [
        "İstemleri dosyadan okuyup toplu çalıştıran betik",
        "Model çıktısını JSON'a ayrıştırıp doğrulayan katman",
        "Sonuçları yerel veritabanına yazan kayıt akışı",
      ],
    },
    {
      id: "automation",
      cmd: "$ AUTOMATION",
      line: "Arka planda dönen işler",
      body: "Zamanlanmış görevler, dosya izleyiciler ve bildirim akışları. " +
            "Telefon şarjdayken çalışan sessiz işçiler.",
      items: [
        "Zamanlanmış yedekleme ve arşivleme görevleri",
        "İndirilenler klasörünü düzenleyen dosya izleyici",
        "Bir iş bittiğinde bildirim gönderen kanca",
      ],
    },
    {
      id: "web-servers",
      cmd: "$ WEB SERVERS",
      line: "Cebimde çalışan sunucular",
      body: "Flask uygulamaları ve statik sunucular. Yerel ağda test, dışarı " +
            "açmadan önce sertleştirme. Bu site de burada doğdu.",
      items: [
        "Flask geliştirme sunucusu ve yerel ağ testi",
        "Statik dosya sunumu ve önbellek başlıkları",
        "Ortam değişkenleriyle yapılandırma yönetimi",
      ],
    },
    {
      id: "linux",
      cmd: "$ LINUX",
      line: "Komut satırının temeli",
      body: "Dosya sistemi, izinler, borular ve yönlendirme. Her şeyin üzerine " +
            "kurulduğu katman — ve en çok zaman ayırmaya değen kısım.",
      items: [
        "Dizin gezinme, arama ve filtreleme",
        "İzinler, sahiplik ve çalıştırılabilir betikler",
        "Borular ve yönlendirme ile araç zincirleme",
      ],
      reference: true,
    },
    {
      id: "experiments",
      cmd: "$ EXPERIMENTS",
      line: "Çalışıp çalışmayacağı belli olmayanlar",
      body: "Yarım kalmış fikirler, tek seferlik denemeler, ölçüm araçları. " +
            "Çoğu bir yere varmıyor; varanlar PROJECTS'e geçiyor.",
      items: [
        "Cihaz üzerinde performans ölçümü",
        "Terminal tabanlı görselleştirme denemeleri",
        "Küçük veri kazıma ve ayrıştırma araçları",
      ],
    },
  ],
};

/* --- 6. NOW --------------------------------------------------------------- */

export const NOW = {
  updated: "2026-08-15",
  building: [
    "ARDA.OS — bu sitenin kendisi",
    "Termux üzerinde çalışan otomasyon araç seti",
  ],
  learning: [
    "Sistem tasarımı ve API mimarisi",
    "Canvas ile performanslı animasyon",
  ],
  exploring: [
    "Model çıktılarını doğrulama yöntemleri",
    "Tipografi odaklı arayüz tasarımı",
  ],
};

/* --- 7. DIGITAL TOOLBOX --------------------------------------------------- */

export const TOOLBOX = [
  { name: "Python",     kind: "lang",  use: "Otomasyon, API, veri işleme",     since: "ana dil" },
  { name: "JavaScript", kind: "lang",  use: "Arayüz, etkileşim, canvas",       since: "ana dil" },
  { name: "HTML",       kind: "markup", use: "Yapı ve anlam",                  since: "temel" },
  { name: "CSS",        kind: "style", use: "Tasarım sistemi, animasyon",      since: "temel" },
  { name: "Linux",      kind: "os",    use: "Komut satırı, süreç yönetimi",    since: "günlük" },
  { name: "Termux",     kind: "env",   use: "Android üzerinde geliştirme",     since: "günlük" },
  { name: "Git",        kind: "tool",  use: "Sürüm kontrolü ve dağıtım",       since: "günlük" },
  { name: "AI",         kind: "tool",  use: "Model entegrasyonu ve istem",     since: "aktif" },
];

/* --- 10. DISCOVER --------------------------------------------------------- */

export const DISCOVER = [
  { id: "hero",     label: "IDENTITY" },
  { id: "status",   label: "STATUS" },
  { id: "whatido",  label: "WHAT I DO" },
  { id: "lab",      label: "TERMUX LAB" },
  { id: "projects", label: "PROJECTS" },
  { id: "now",      label: "NOW" },
  { id: "toolbox",  label: "TOOLBOX" },
  { id: "console",  label: "CONSOLE" },
  { id: "connect",  label: "CONNECT" },
];
