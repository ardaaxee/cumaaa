// OTOMATİK FALLBACK — content/site.json canonical kaynaktır.
// Sunucu (fetch) çalışmadığında (ör. file:// ile açılışta) bu kullanılır.
window.SITE_DATA = {
  "profile": {
    "name": "ARDA",
    "system": "ARDA.OS",
    "handle": "@arda",
    "kicker": "DIGITAL SPACE",
    "tagline": "BUILD / EXPERIMENT / LEARN",
    "avatarInitials": "AR",
    "avatarImage": "",
    "bio": "Termux, Python ve web ile küçük deneyler. Burası bir link listesi değil — kendi dijital alanım.",
    "build": "2026",
    "instagram": "https://instagram.com/"
  },
  "now": [
    {
      "k": "LISTENING",
      "v": "Spotify",
      "href": ""
    },
    {
      "k": "BUILDING",
      "v": "ARDA.OS",
      "href": ""
    },
    {
      "k": "LEARNING",
      "v": "Termux / Linux",
      "href": ""
    }
  ],
  "music": {
    "url": "",
    "note": "Spotify bağlantısı ekle: content/site.json → music.url"
  },
  "tools": [
    {
      "id": "termux",
      "code": "01",
      "title": "TERMUX",
      "blurb": "Android'de tam terminal ortamı.",
      "action": "termux-lab"
    },
    {
      "id": "linux",
      "code": "02",
      "title": "LINUX",
      "blurb": "Dosya, süreç ve izinlerin mantığı.",
      "sections": [
        {
          "h": "NE İŞE YARAR",
          "t": "Termux'un altında çalışan sistem. Dosya, süreç ve izinleri anlamak her şeyin temeli."
        },
        {
          "h": "BAŞLA",
          "t": "ls, cd, pwd, chmod, ps komutlarıyla gez. Önce gör, sonra değiştir."
        }
      ],
      "links": [
        {
          "label": "TERMUX LAB → FILE SYSTEM",
          "action": "termux-lab"
        }
      ]
    },
    {
      "id": "python",
      "code": "03",
      "title": "PYTHON",
      "blurb": "Otomasyon ve küçük araçlar.",
      "sections": [
        {
          "h": "NEDEN",
          "t": "Script, otomasyon ve hızlı prototip için ideal ilk dil."
        },
        {
          "h": "İLK ADIM",
          "t": "pkg install python → python dosya.py. Sonra pip ile kütüphane ekle."
        }
      ],
      "links": [
        {
          "label": "TERMUX LAB → PYTHON",
          "action": "termux-lab"
        }
      ]
    },
    {
      "id": "git",
      "code": "04",
      "title": "GIT",
      "blurb": "Sürüm kontrolü ve iş akışı.",
      "sections": [
        {
          "h": "FİKİR",
          "t": "Her değişiklik bir anlık görüntü. Geri dönebilmek özgürlüktür."
        },
        {
          "h": "AKIŞ",
          "t": "init → add → commit → push. Küçük ve sık commit at."
        }
      ],
      "links": [
        {
          "label": "TERMUX LAB → GIT",
          "action": "termux-lab"
        }
      ]
    },
    {
      "id": "ai",
      "code": "05",
      "title": "AI",
      "blurb": "Modeli araç gibi kullanmak.",
      "sections": [
        {
          "h": "YAKLAŞIM",
          "t": "Prompt'u net yaz, bağlam ver, çıktıyı her zaman doğrula. Model bir asistan, karar senin."
        },
        {
          "h": "PRATİK",
          "t": "Tekrarlayan işleri otomatikleştir; öğrenmeyi hızlandır, yerine koyma."
        }
      ]
    },
    {
      "id": "web",
      "code": "06",
      "title": "WEB",
      "blurb": "Sağlam temel, sonra framework.",
      "sections": [
        {
          "h": "TEMEL",
          "t": "HTML/CSS/JS üçlüsünü gerçekten öğren. Framework bunun üstüne gelir."
        },
        {
          "h": "İLKE",
          "t": "Önce erişilebilirlik ve performans; sonra süsleme."
        }
      ]
    }
  ],
  "termux": {
    "intro": "Telefondan komut satırı öğrenmek için sade, pratik bir alan. Bir modül seç, komutu kopyala, dene. İlerlemen kaydedilir.",
    "categories": [
      {
        "id": "basics",
        "code": "01",
        "title": "BASICS",
        "desc": "İlk adımlar ve temel gezinme.",
        "lessons": [
          {
            "title": "Bulunduğun dizin",
            "cmd": "pwd",
            "desc": "Şu an hangi klasördesin gösterir.",
            "example": "/data/data/com.termux/files/home"
          },
          {
            "title": "İçeriği listele",
            "cmd": "ls -la",
            "desc": "Gizli dosyalar dahil her şeyi listeler.",
            "example": "ls -la ~/storage"
          },
          {
            "title": "Ekranı temizle",
            "cmd": "clear",
            "desc": "Terminal ekranını temizler.",
            "example": "clear"
          },
          {
            "title": "Depolama izni",
            "cmd": "termux-setup-storage",
            "desc": "Telefon depolamasına erişim izni verir.",
            "example": "termux-setup-storage"
          }
        ]
      },
      {
        "id": "fs",
        "code": "02",
        "title": "FILE SYSTEM",
        "desc": "Dosya ve klasörlerle çalışmak.",
        "lessons": [
          {
            "title": "Klasör oluştur",
            "cmd": "mkdir lab",
            "desc": "'lab' adında yeni klasör açar.",
            "example": "mkdir -p projeler/2026"
          },
          {
            "title": "Dosya oluştur",
            "cmd": "touch not.txt",
            "desc": "Boş bir dosya oluşturur.",
            "example": "touch app.py"
          },
          {
            "title": "Taşı / yeniden adlandır",
            "cmd": "mv not.txt notlar.txt",
            "desc": "Dosyayı taşır ya da adını değiştirir.",
            "example": "mv app.py src/app.py"
          },
          {
            "title": "Sil",
            "cmd": "rm dosya.txt",
            "desc": "Dosyayı siler. Dikkatli kullan.",
            "example": "rm -r eski_klasor"
          }
        ]
      },
      {
        "id": "pkg",
        "code": "03",
        "title": "PACKAGES",
        "desc": "Paket kurulumu ve güncelleme.",
        "lessons": [
          {
            "title": "Listeyi güncelle",
            "cmd": "pkg update",
            "desc": "Depoları günceller.",
            "example": "pkg update && pkg upgrade"
          },
          {
            "title": "Paket kur",
            "cmd": "pkg install python",
            "desc": "İstediğin aracı kurar.",
            "example": "pkg install git nano"
          },
          {
            "title": "Paket ara",
            "cmd": "pkg search node",
            "desc": "Kurulabilir paketleri arar.",
            "example": "pkg search ffmpeg"
          },
          {
            "title": "Kaldır",
            "cmd": "pkg uninstall python",
            "desc": "Bir paketi kaldırır.",
            "example": "pkg uninstall nano"
          }
        ]
      },
      {
        "id": "python",
        "code": "04",
        "title": "PYTHON",
        "desc": "Python çalıştırma ve paketler.",
        "lessons": [
          {
            "title": "Sürümü gör",
            "cmd": "python --version",
            "desc": "Kurulu Python sürümünü gösterir.",
            "example": "python3 --version"
          },
          {
            "title": "Script çalıştır",
            "cmd": "python app.py",
            "desc": "Bir Python dosyasını çalıştırır.",
            "example": "python -m http.server 8000"
          },
          {
            "title": "pip ile kur",
            "cmd": "pip install requests",
            "desc": "Python kütüphanesi kurar.",
            "example": "pip install rich"
          },
          {
            "title": "Etkileşimli kabuk",
            "cmd": "python",
            "desc": "REPL açar; çıkmak için exit().",
            "example": ">>> print('selam')"
          }
        ]
      },
      {
        "id": "git",
        "code": "05",
        "title": "GIT",
        "desc": "Sürüm kontrolünün temelleri.",
        "lessons": [
          {
            "title": "Repo başlat",
            "cmd": "git init",
            "desc": "Yeni bir git deposu oluşturur.",
            "example": "git init"
          },
          {
            "title": "Değişiklikleri ekle",
            "cmd": "git add .",
            "desc": "Tüm değişiklikleri hazırlar.",
            "example": "git add app.py"
          },
          {
            "title": "Commit",
            "cmd": "git commit -m \"ilk commit\"",
            "desc": "Değişiklikleri kaydeder.",
            "example": "git commit -m \"fix: bug\""
          },
          {
            "title": "Gönder",
            "cmd": "git push origin main",
            "desc": "Uzak depoya gönderir.",
            "example": "git push -u origin main"
          }
        ]
      },
      {
        "id": "net",
        "code": "06",
        "title": "NETWORKING",
        "desc": "Ağ ve indirme araçları.",
        "lessons": [
          {
            "title": "Bağlantı testi",
            "cmd": "ping -c 4 github.com",
            "desc": "Bir sunucuya erişimi test eder.",
            "example": "ping -c 4 1.1.1.1"
          },
          {
            "title": "İndir",
            "cmd": "curl -O https://ornek.com/dosya.zip",
            "desc": "Bir dosyayı indirir.",
            "example": "curl -L -o site.html https://ornek.com"
          },
          {
            "title": "Yerel sunucu",
            "cmd": "python -m http.server 8080",
            "desc": "Bulunduğun klasörü sunar.",
            "example": "python -m http.server 8080"
          },
          {
            "title": "IP adresini gör",
            "cmd": "ifconfig",
            "desc": "Ağ arayüzlerini listeler.",
            "example": "ip addr"
          }
        ]
      }
    ]
  },
  "projects": [
    {
      "id": "arda-os",
      "num": "01",
      "title": "ARDA.OS",
      "status": "live",
      "year": "2026",
      "type": "Digital Profile",
      "description": "Instagram profilinin doğal devamı olan kişisel dijital alan. Link listesi değil; keşfedilen bir deneyim.",
      "tech": [
        "HTML",
        "CSS",
        "JS",
        "Flask"
      ],
      "link": ""
    },
    {
      "id": "termux-lab",
      "num": "02",
      "title": "TERMUX LAB",
      "status": "wip",
      "year": "2026",
      "type": "Learning Tool",
      "description": "Telefondan komut satırı öğrenmek için sade, ilerleme takipli bir referans arayüzü.",
      "tech": [
        "JS",
        "UX",
        "localStorage"
      ],
      "link": ""
    },
    {
      "id": "signal",
      "num": "03",
      "title": "SIGNAL",
      "status": "concept",
      "year": "2026",
      "type": "Experiment",
      "description": "Generatif görseller ve mikro etkileşimler üzerine sürekli değişen bir çalışma alanı.",
      "tech": [
        "Canvas",
        "WebGL"
      ],
      "link": ""
    }
  ],
  "connect": {
    "intro": "Bir fikir, iş ya da sadece merhaba.",
    "email": "acarcuma25@gmail.com",
    "links": [
      {
        "id": "instagram",
        "label": "INSTAGRAM",
        "meta": "profil",
        "href": "https://instagram.com/",
        "external": true
      },
      {
        "id": "spotify",
        "label": "SPOTIFY",
        "meta": "müzik",
        "href": "",
        "external": true
      }
    ]
  },
  "easterEggs": {
    "logo": "system :: ARDA.OS kernel awake",
    "avatar": "access granted",
    "hint": "ipucu: 'arda' yaz · logoya uzun bas · en alta in",
    "footer": "künyeyi okudun. saygı.",
    "end": "// end of transmission — keşfettiğin için teşekkürler.",
    "konami": "cheat mode :: unlocked"
  }
};
