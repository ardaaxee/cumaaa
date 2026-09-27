import { useState } from 'react';
import { EXAM_ARCHIVE } from '../data/officialResources';
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
        <ul className="list">
          {entries.map((e) => (
            <li key={`${e.year}-${e.exam}`} className="list-item">
              <span className="grow">
                <b>
                  {e.year} {e.exam}
                </b>
                <span className="tiny muted" style={{ display: 'block' }}>
                  Soru kitapçıkları ve cevap anahtarları
                </span>
              </span>
              <SourceBadge type="osym-resmi" />
              <a className="btn small primary" href={e.url} target="_blank" rel="noopener noreferrer">
                Resmî ÖSYM Kaynağı <Icon name="external" />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
