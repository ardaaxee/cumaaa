import type { ReactNode } from 'react';
import { useRoute } from '../hooks/useRoute';
import { update, useSelector } from '../store/store';
import { Icon, type IconName } from './Icon';
import { MascotNav } from './MascotNav';

interface NavItem {
  path: string;
  label: string;
  icon: IconName;
}

export const NAV_ALL: NavItem[] = [
  { path: '/', label: 'Ana Sayfa', icon: 'home' },
  { path: '/dersler', label: 'Dersler', icon: 'book' },
  { path: '/testler', label: 'Testler', icon: 'check' },
  { path: '/denemeler', label: 'Denemeler', icon: 'trophy' },
  { path: '/defterim', label: 'Defterim', icon: 'sparkle' },
  { path: '/plan', label: 'Planım', icon: 'calendar' },
  { path: '/tekrar', label: 'Genel Tekrar', icon: 'repeat' },
  { path: '/ogretmen', label: 'Konu Asistanı', icon: 'teacher' },
  { path: '/yanlislar', label: 'Yanlışlarım', icon: 'alert' },
  { path: '/gelisim', label: 'Gelişimim', icon: 'chart' },
  { path: '/odak', label: 'Odak (Pomodoro)', icon: 'timer' },
  { path: '/kaynaklar', label: 'Kaynaklar', icon: 'link' },
  { path: '/cikmis', label: 'ÖSYM Çıkmış Sorular', icon: 'archive' },
  { path: '/ayarlar', label: 'Ayarlar', icon: 'settings' },
];

export function sectionOf(path: string): string {
  const first = '/' + (path.split('/').filter(Boolean)[0] ?? '');
  if (first === '/') return '/';
  if (['/dersler', '/ders', '/konu'].includes(first)) return '/dersler';
  if (['/testler', '/test', '/sonuc'].includes(first)) return '/testler';
  return first;
}

export function Layout({ children }: { children: ReactNode }) {
  const route = useRoute();
  const section = sectionOf(route.path);
  return (
    <div className="shell">
      <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>
        İçeriğe geç
      </a>
      <aside className="sidebar" aria-label="Ana menü">
        <div className="brand">
          İyi ki <span className="heart" aria-hidden="true">♡</span>
        </div>
        <div className="tiny muted">YKS Çalışma Odası · TYT + AYT Sayısal</div>
        <nav>
          {NAV_ALL.map((n) => (
            <a key={n.path} href={`#${n.path}`} aria-current={section === n.path ? 'page' : undefined}>
              <Icon name={n.icon} />
              {n.label}
            </a>
          ))}
        </nav>
        <div className="sidebar-foot">ÖSYM ile bağlantılı değildir. Pratik sorular özgündür.</div>
      </aside>
      <main id="main" className="main" tabIndex={-1}>
        {children}
      </main>
      <MascotNav />
    </div>
  );
}

export function ThemeToggle() {
  const theme = useSelector((s) => s.settings.theme);
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
  return (
    <button
      type="button"
      className="icon-btn"
      aria-label={isDark ? 'Açık temaya geç' : 'Koyu temaya geç'}
      onClick={() => update((s) => ({ ...s, settings: { ...s.settings, theme: isDark ? 'light' : 'dark' } }))}
    >
      <Icon name={isDark ? 'sun' : 'moon'} />
    </button>
  );
}

export function PageHeader({ title, sub, actions, back }: { title: string; sub?: ReactNode; actions?: ReactNode; back?: string }) {
  return (
    <header className="topbar">
      <div className="row nowrap grow">
        {back && (
          <a className="icon-btn" href={back} aria-label="Geri">
            <Icon name="left" />
          </a>
        )}
        <div className="topbar-title">
          <h1>{title}</h1>
          {sub && <div className="topbar-sub">{sub}</div>}
        </div>
      </div>
      <div className="topbar-actions">
        {actions}
        <ThemeToggle />
      </div>
    </header>
  );
}
