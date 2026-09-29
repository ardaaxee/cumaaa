import { Icon, type IconName } from '../components/Icon';
import { PageHeader } from '../components/Layout';

const GROUPS: { title: string; items: { path: string; label: string; desc: string; icon: IconName }[] }[] = [
  {
    title: 'Çalışma araçları',
    items: [
      { path: '/koc', label: 'Akıllı Koç', desc: 'Seviye tespiti, adaptif test ve kişisel 7 günlük plan', icon: 'target' },
      { path: '/odak', label: 'Odak Modu', desc: '25/50/90 dakikalık gerçek çalışma sayacı', icon: 'timer' },
      { path: '/ogretmen', label: 'Öğretmen', desc: 'Konu anlatımı, ipucu ve mini quiz', icon: 'teacher' },
      { path: '/tekrar', label: 'Genel tekrar', desc: 'Aralıklı tekrar takvimi', icon: 'repeat' },
      { path: '/kartlar', label: 'Bilgi kartları', desc: 'Kavram ve formül ezberi', icon: 'cards' },
      { path: '/formuller', label: 'Formül defteri', desc: 'Önemli formüller tek yerde', icon: 'formula' },
      { path: '/defterim', label: 'Defterim', desc: 'Not, formül ve çizim alanı', icon: 'sparkle' },
      { path: '/kaydedilenler', label: 'Kaydettiğim sorular', desc: 'Sonra dönmek istediğin sorular', icon: 'star' },
    ],
  },
  {
    title: 'Takip ve analiz',
    items: [
      { path: '/yanlislar', label: 'Yanlışlarım', desc: 'Yanlış ve boş bıraktığın sorular', icon: 'alert' },
      { path: '/denemeler', label: 'Denemeler', desc: 'TYT / AYT deneme takibi', icon: 'trophy' },
      { path: '/gelisim', label: 'Gelişimim', desc: 'İstatistik ve performans grafikleri', icon: 'chart' },
      { path: '/karne', label: 'Haftalık karne', desc: 'Haftalık çalışma ve net özeti', icon: 'chart' },
      { path: '/rozetler', label: 'Rozetlerim', desc: 'Çalışma başarıların ve serilerin', icon: 'trophy' },
    ],
  },
  {
    title: 'Kaynaklar ve ayarlar',
    items: [
      { path: '/cikmis', label: 'ÖSYM çıkmış sorular', desc: 'Yıl bazlı resmî bağlantılar', icon: 'archive' },
      { path: '/kaynaklar', label: 'Kaynaklar', desc: 'Resmî kaynaklar ve çalışma içerikleri', icon: 'link' },
      { path: '/pandam', label: 'Panda arkadaşım', desc: 'Seviye, bakım ve aksesuarlar', icon: 'sparkle' },
      { path: '/canli', label: 'Cuma ♡ Zeynep Canlı', desc: 'İzinli canlı ekran paylaşımı ve mesajlaşma', icon: 'link' },
      { path: '/ayarlar', label: 'Ayarlar', desc: 'Profil, görünüm, bulut ve yedek', icon: 'settings' },
    ],
  },
];

export default function MorePage() {
  return (
    <>
      <PageHeader title="Tüm araçlar" sub="İhtiyacın olan her şey tek ve düzenli bir yerde." />
      <div className="tools-groups">
        {GROUPS.map((group) => (
          <section className="tools-group" key={group.title} aria-label={group.title}>
            <div className="tools-group-head">
              <h2>{group.title}</h2>
            </div>
            <div className="tools-grid">
              {group.items.map((it) => (
                <a className="tool-card" key={it.path} href={`#${it.path}`}>
                  <span className="tool-card-icon" aria-hidden="true">
                    <Icon name={it.icon} />
                  </span>
                  <span className="tool-card-copy">
                    <b>{it.label}</b>
                    <span>{it.desc}</span>
                  </span>
                  <Icon name="right" />
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
