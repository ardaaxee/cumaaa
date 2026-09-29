import { useState } from 'react';
import { EXAM_ARCHIVE, OSYM_YKS_PAGE } from '../data/officialResources';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/Layout';
import { Segmented, SourceBadge, toast } from '../components/ui';

async function copyLink(url: string) {
  try {
    await navigator.clipboard.writeText(url);
    toast('Resmî ÖSYM PDF bağlantısı kopyalandı.');
  } catch {
    toast('Bağlantı kopyalanamadı. “PDF’yi aç” düğmesini kullan.', 4500);
  }
}

export default function OsymPage() {
  const years = [...new Set(EXAM_ARCHIVE.map((e) => e.year))].sort((a, b) => b - a);
  const [year, setYear] = useState<string>(String(years[0]));
  const entries = EXAM_ARCHIVE.filter((e) => String(e.year) === year);

  return (
    <>
      <PageHeader title="ÖSYM Çıkmış Sorular" sub="TYT ve AYT resmî soru kitapçıkları · doğrudan PDF" />

      <div className="notice osym-notice">
        <Icon name="alert" />
        <div>
          <b>Mobil açılma sorunu düzeltildi.</b> Artık ara ÖSYM sayfası yerine doğrudan
          <b> dokuman.osym.gov.tr</b> üzerindeki resmî PDF kitapçığı açılır. Sorular uygulamaya kopyalanmaz.
        </div>
      </div>

      <div className="section">
        <Segmented label="Yıl" value={year} onChange={setYear} options={years.map((y) => ({ value: String(y), label: String(y) }))} />
      </div>

      <section className="osym-booklet-grid section" aria-label={year + ' ÖSYM kitapçıkları'}>
        {entries.map((e) => (
          <article key={e.year + '-' + e.exam} className={'card osym-booklet-card ' + e.exam.toLowerCase()}>
            <div className="osym-booklet-top">
              <div>
                <div className="eyebrow">Resmî ÖSYM kitapçığı</div>
                <h2>{e.year} {e.exam}</h2>
                <p>{e.exam === 'TYT' ? 'Temel Yeterlilik Testi' : 'Alan Yeterlilik Testleri'} ve cevap anahtarı</p>
              </div>
              <SourceBadge type="osym-resmi" />
            </div>

            <div className="osym-booklet-actions">
              <a className="btn primary" href={e.pdfUrl}>
                <Icon name="book" /> PDF’yi aç
              </a>
              <a className="btn" href={e.pageUrl}>
                <Icon name="external" /> ÖSYM sayfası
              </a>
              <button type="button" className="btn ghost" onClick={() => void copyLink(e.pdfUrl)}>
                <Icon name="link" /> Bağlantıyı kopyala
              </button>
            </div>

            <div className="osym-mobile-help">
              PDF düğmesine dokunduğunda telefonun PDF görüntüleyicisi açılır. Açılmazsa bağlantıyı kopyalayıp Chrome’a yapıştırabilirsin.
            </div>
          </article>
        ))}
      </section>

      <section className="card section osym-info-card" aria-labelledby="osym-info-h">
        <div>
          <div className="eyebrow">Kaynak doğrulama</div>
          <h2 id="osym-info-h">Yalnız resmî ÖSYM bağlantıları</h2>
          <p className="small muted">
            Buradaki TYT ve AYT düğmeleri ÖSYM’nin resmî doküman alanına gider. Uygulamadaki özgün soru bankasıyla çıkmış ÖSYM soruları birbirine karıştırılmaz.
          </p>
        </div>
        <a className="btn" href={OSYM_YKS_PAGE}>
          Tüm ÖSYM YKS sayfası <Icon name="external" />
        </a>
      </section>
    </>
  );
}
