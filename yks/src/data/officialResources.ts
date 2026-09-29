export interface OfficialResource {
  title: string;
  org: 'ÖSYM' | 'MEB' | 'EBA';
  desc: string;
  url: string;
}

/** Resmî kaynaklar. İçerik kopyalanmaz; yalnız bağlantı verilir. */
export const OFFICIAL_RESOURCES: OfficialResource[] = [
  { title: 'ÖSYM YKS sayfası', org: 'ÖSYM', desc: 'Duyurular, kılavuzlar ve sınav takvimi.', url: 'https://www.osym.gov.tr/SinavGrubu/Menu/323' },
  { title: '2026 ÖSYM YKS soru kitapçıkları', org: 'ÖSYM', desc: '2026 TYT/AYT/YDT resmî kitapçık ve cevap anahtarları.', url: osymBookletUrl(2026) },
  { title: 'MEB Öğretim Programları', org: 'MEB', desc: 'Talim ve Terbiye Kurulu program arşivi.', url: 'https://mufredat.meb.gov.tr/Programlar.aspx' },
  { title: '2018 Matematik 9–12 Programı', org: 'MEB', desc: '2026–2027’de 12. sınıf için önceki program referansı.', url: 'https://mufredat.meb.gov.tr/Dosyalar/201821102727101-OGM%20MATEMAT%C4%B0K%20PRG%2020.01.2018.pdf' },
  { title: '2018 Fizik 9–12 Programı', org: 'MEB', desc: 'Ünite ve kazanım referansı.', url: 'https://mufredat.meb.gov.tr/Dosyalar/201812103112910-orta%C3%B6%C4%9Fretim_fizik_son.pdf' },
  { title: '2018 Kimya 9–12 Programı', org: 'MEB', desc: 'Ünite ve kazanım referansı.', url: 'https://mufredat.meb.gov.tr/Dosyalar/201812102955190-19.01.2018%20Kimya%20Dersi%20%C3%96%C4%9Fretim%20Program%C4%B1.pdf' },
  { title: '2018 Biyoloji 9–12 Programı', org: 'MEB', desc: 'Ünite ve kazanım referansı.', url: 'https://mufredat.meb.gov.tr/Dosyalar/20182215535566-Biyoloji%20d%C3%B6p.pdf' },
  { title: 'EBA', org: 'EBA', desc: 'Millî Eğitim Bakanlığı eğitim bilişim ağı; ders videoları ve kaynaklar.', url: 'https://www.eba.gov.tr' },
  { title: '2026–2027 12. sınıf uygulama notu', org: 'MEB', desc: '12. sınıfta önceki öğretim programlarının sürdüğünü açıklayan OGM duyurusu.', url: 'https://ogm.meb.gov.tr/www/2026-2027-egitim-ogretim-yili-turkiye-yuzyili-maarif-modeli-taslak-cerceve-planlar-yayimlandi/icerik/2633/tr' },
];

export interface ExamArchiveEntry {
  year: number;
  exam: 'TYT' | 'AYT';
  /** ÖSYM'nin doğrudan PDF kitapçığı. Mobilde ara sayfa yerine bunu açıyoruz. */
  pdfUrl: string;
  /** ÖSYM'nin ilgili yıl kitapçık/cevap anahtarı sayfası. */
  pageUrl: string;
}

const BOOKLET_PDFS: Record<number, Record<'TYT' | 'AYT', string>> = {
  2026: {
    TYT: 'https://dokuman.osym.gov.tr/pdfdokuman/2026/YKS/TSK/yks_tyt_2026_kitapcik_d350.pdf',
    AYT: 'https://dokuman.osym.gov.tr/pdfdokuman/2026/YKS/TSK/yks_ayt_2026_kitapcik_kt12.pdf',
  },
  2025: {
    TYT: 'https://dokuman.osym.gov.tr/pdfdokuman/2025/YKS/TSK/yks_tyt_2025_kitapcik_d250.pdf',
    AYT: 'https://dokuman.osym.gov.tr/pdfdokuman/2025/YKS/TSK/yks_ayt_2025_kitapcik_st12.pdf',
  },
  2024: {
    TYT: 'https://dokuman.osym.gov.tr/pdfdokuman/2024/YKS/TSK/yks_tyt_2024_kitapcik_T24kt.pdf',
    AYT: 'https://dokuman.osym.gov.tr/pdfdokuman/2024/YKS/TSK/yks_ayt_2024_kitapcik_ts85k.pdf',
  },
  2023: {
    TYT: 'https://dokuman.osym.gov.tr/pdfdokuman/2023/YKS/TSK/yks_tyt_2023_kitapcik_T23ky.pdf',
    AYT: 'https://dokuman.osym.gov.tr/pdfdokuman/2023/YKS/TSK/yks_ayt_2023_kitapcik_g5A2H.pdf',
  },
  2022: {
    TYT: 'https://dokuman.osym.gov.tr/pdfdokuman/2022/YKS/TSK/yks_2022_tyt.pdf',
    AYT: 'https://dokuman.osym.gov.tr/pdfdokuman/2022/YKS/TSK/yks_2022_ayt.pdf',
  },
};

/**
 * ÖSYM'nin yıl sayfası.
 * PDF bağlantıları ayrı tutulur; Android/PWA'da sayfa içindeki yeni-sekme davranışına güvenmeyiz.
 */
export function osymBookletUrl(year: number): string {
  return \`https://www.osym.gov.tr/\${year}yks-tyt-ayt-ve-ydt-temel-soru-kitapciklari-ve-cevap-anahtarlari\`;
}

export function osymBookletPdfUrl(year: number, exam: 'TYT' | 'AYT'): string | undefined {
  return BOOKLET_PDFS[year]?.[exam];
}

/** Resmî YKS sayfası: tüm yıllar ve duyurular. */
export const OSYM_YKS_PAGE = 'https://www.osym.gov.tr/SinavGrubu/Menu/323';

/**
 * Çıkmış sorular uygulama içine kopyalanmaz. Kullanıcı doğrudan ÖSYM'nin
 * dokuman.osym.gov.tr alanındaki resmî PDF'ine gider.
 */
export const EXAM_ARCHIVE: ExamArchiveEntry[] = Object.keys(BOOKLET_PDFS)
  .map(Number)
  .sort((a, b) => b - a)
  .flatMap((year) =>
    (['TYT', 'AYT'] as const).map((exam) => ({
      year,
      exam,
      pdfUrl: BOOKLET_PDFS[year][exam],
      pageUrl: osymBookletUrl(year),
    })),
  );
