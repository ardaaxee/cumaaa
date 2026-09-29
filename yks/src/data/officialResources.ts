export interface OfficialResource {
  title: string;
  org: 'ÖSYM' | 'MEB' | 'EBA';
  desc: string;
  url: string;
}

/** Resmî kaynaklar. İçerik kopyalanmaz; yalnız bağlantı verilir. */
export const OFFICIAL_RESOURCES: OfficialResource[] = [
  { title: 'ÖSYM YKS sayfası', org: 'ÖSYM', desc: 'Duyurular, kılavuzlar ve sınav takvimi.', url: 'https://www.osym.gov.tr/SinavGrubu/Menu/323' },
  { title: 'ÖSYM soru kitapçıkları ve cevap anahtarları', org: 'ÖSYM', desc: 'Geçmiş yıllara ait resmî TYT/AYT/YDT kitapçıkları.', url: osymBookletUrl(2025) },
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
  url: string;
  /** Resmî sayfa taşınırsa: ÖSYM sitesinde aynı yılın kitapçıklarını arayan yedek bağlantı. */
  searchUrl: string;
}

/**
 * ÖSYM'nin yeni sitesindeki yıl sayfası (ör. /2025yks-tyt-ayt-ve-ydt-temel-soru-kitapciklari-ve-cevap-anahtarlari).
 * Eski "TR,8797/…html" adresi yeni sitede 404 veriyordu.
 */
export function osymBookletUrl(year: number): string {
  return `https://www.osym.gov.tr/${year}yks-tyt-ayt-ve-ydt-temel-soru-kitapciklari-ve-cevap-anahtarlari`;
}

export function osymSearchUrl(year: number, exam: 'TYT' | 'AYT'): string {
  const q = `site:osym.gov.tr ${year}-YKS ${exam} temel soru kitapçığı cevap anahtarı`;
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

/** Resmî YKS sayfası: tüm yıllar ve duyurular. */
export const OSYM_YKS_PAGE = 'https://www.osym.gov.tr/SinavGrubu/Menu/323';

/** ÖSYM çıkmış sorular bölümü için yıl/sınav listesi. Sorular kopyalanmaz; resmî bağlantı açılır. */
export const EXAM_ARCHIVE: ExamArchiveEntry[] = [2026, 2025, 2024, 2023, 2022].flatMap((year) =>
  (['TYT', 'AYT'] as const).map((exam) => ({ year, exam, url: osymBookletUrl(year), searchUrl: osymSearchUrl(year, exam) })),
);
