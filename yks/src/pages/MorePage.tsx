import { Icon, type IconName } from '../components/Icon';
import { PageHeader } from '../components/Layout';

const ITEMS: { path: string; label: string; desc: string; icon: IconName }[] = [
  { path: '/ogretmen', label: 'Öğretmen', desc: 'Konu anlatımı, ipucu ve mini quiz', icon: 'teacher' },
  { path: '/yanlislar', label: 'Yanlışlarım', desc: 'Yanlış ve boş bıraktığın sorular', icon: 'alert' },
  { path: '/tekrar', label: 'Tekrarlar', desc: 'Aralıklı tekrar takvimi', icon: 'repeat' },
  { path: '/denemeler', label: 'Denemeler', desc: 'TYT / AYT deneme takibi', icon: 'trophy' },
  { path: '/odak', label: 'Odak', desc: 'Pomodoro çalışma sayacı', icon: 'timer' },
  { path: '/gelisim', label: 'Gelişimim', desc: 'İstatistik ve grafikler', icon: 'chart' },
  { path: '/kaynaklar', label: 'Kaynaklar', desc: 'Resmî kaynaklar ve videoların', icon: 'link' },
  { path: '/cikmis', label: 'ÖSYM Çıkmış Sorular', desc: 'Yıl bazlı resmî bağlantılar', icon: 'archive' },
  { path: '/ayarlar', label: 'Ayarlar', desc: 'Profil, pomodoro, öğretmen, yedek', icon: 'settings' },
];

export default function MorePage() {
  return (
    <>
      <PageHeader title="Daha Fazla" />
      <ul className="list card">
        {ITEMS.map((it) => (
          <li key={it.path}>
            <a className="link-row" href={`#${it.path}`}>
              <Icon name={it.icon} />
              <span className="grow">
                <b>{it.label}</b>
                <span className="tiny muted" style={{ display: 'block' }}>
                  {it.desc}
                </span>
              </span>
              <Icon name="right" />
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
