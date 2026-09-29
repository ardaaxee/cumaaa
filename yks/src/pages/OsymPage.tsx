import { useState } from 'react';
import { EXAM_ARCHIVE, OSYM_YKS_PAGE } from '../data/officialResources';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/Layout';
import { Segmented, SourceBadge } from '../components/ui';

export default function OsymPage() {
  const years = [...new Set(EXAM_ARCHIVE.map((e) => e.year))].sort((a, b) => b - a);
  const [year, setYear] = useState<string>(String(years[0]));
  const entries = EXAM_ARCHIVE.filter((e) => String(e.year) === year);

  return (
    <>
      <PageHeader title="ÖSYM Çıkmış Sorular" sub="Yıl bazlı resmî kaynak bağlantıları" />
      <div className="notice">
        <Icon name="alert" />
        <div>
          Bu bölümde soru metni <b>kopyalanmaz</b>. Her yıl için resmî ÖSYM kitapçık ve cevap anahtarı sayfasına yönlendirilirsin. Uygulama ÖSYM’ye bağlı değildir.
        </div>
      </div>

      <div className="section">
        <Segmented label="Yıl" value={year} onChange={setYear} options={years.map((y) => ({ value: String(y), label: String(y) }))} />
      </div>

      <section className="card section" aria-label={`${year} sınavları`}>
        <div className="osym-grid">
          {entries.map((e) => (
            <article key={`${e.year}-${e.exam}`} className="osym-card">
              <div className="row between nowrap">
                <h3 style={{ margin: 0 }}>
                  {e.year} {e.exam}
                </h3>
                <SourceBadge type="osym-resmi" />
              </div>
              <p className="small muted" style={{ margin: '6px 0 12px' }}>
                Soru kitapçıkları ve cevap anahtarları ÖSYM’nin resmî sayfasında.
              </p>
              <a className="btn primary block" href={e.url} target="_blank" rel="noopener noreferrer">
                Resmî ÖSYM sayfasını aç <Icon name="external" />
              </a>
              <a className="btn ghost small block mt-8" href={e.searchUrl} target="_blank" rel="noopener noreferrer">
                Sayfa açılmazsa ÖSYM’de ara <Icon name="external" />
              </a>
            </article>
          ))}
        </div>
      </section>

      <p className="tiny muted section">
        Aynı sayfada TYT ve AYT kitapçıkları birlikte yer alır. Tüm yıllar ve duyurular için{' '}
        <a href={OSYM_YKS_PAGE} target="_blank" rel="noopener noreferrer">
          ÖSYM YKS sayfası
        </a>
        .
      </p>
    </>
  );
}
