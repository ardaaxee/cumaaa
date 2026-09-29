import type { ReactNode } from 'react';
import { useRoute } from '../hooks/useRoute';
import { update, useSelector } from '../store/store';
import { Icon, type IconName } from './Icon';
import { MascotNav } from './MascotNav';
import { Companion } from './Companion';

interface NavItem {
  path: string;
  label: string;
  icon: IconName;
}

export const NAV_ALL: NavItem[] = [
  { path: '/', label: 'Ana Sayfa', icon: 'home' },
  { path: '/koc', label: 'Akıllı Koç', icon: 'target' },
  { path: '/dersler', label: 'Konu anlatımı', icon: 'book' },
  { path: '/testler', label: 'Soru bankası', icon: 'check' },
  { path: '/calis', label: 'Adım adım çalış', icon: 'play' },
  { path: '/odak', label: 'Odak Modu', icon: 'timer' },
  { path: '/denemeler', label: 'Denemeler', icon: 'trophy' },
  { path: '/defterim', label: 'Defterim', icon: 'sparkle' },
  { path: '/plan', label: 'Planım', icon: 'calendar' },
  { path: '/tekrar', label: 'Genel Tekrar', icon: 'repeat' },
  { path: '/kartlar', label: 'Bilgi Kartları', icon: 'cards' },
  { path: '/formuller', label: 'Formül Defteri', icon: 'formula' },
  { path: '/rozetler', label: 'Rozetlerim', icon: 'trophy' },
  { path: '/pandam', label: 'Panda arkadaşım', icon: 'sparkle' },
  { path: '/kaydedilenler', label: 'Kaydettiğim sorular', icon: 'star' },
  { path: '/karne', label: 'Haftalık karne', icon: 'chart' },
  { path: '/ogretmen', label: 'Cuma ♡', icon: 'teacher' },
  { path: '/yanlislar', label: 'Yanlışlarım', icon: 'alert' },
  { path: '/gelisim', label: 'Gelişimim', icon: 'chart' },
  { path: '/kaynaklar', label: 'Kaynaklar', icon: 'link' },
  { path: '/cikmis', label: 'ÖSYM Çıkmış Sorular', icon: 'archive' },
  { path: '/ayarlar', label: 'Ayarlar', icon: 'settings' },
  { path: '/daha', label: 'Daha Fazla', icon: 'more' },
];

const SIDEBAR_GROUPS: { label: string; paths: string[] }[] = [
  { label: 'Çalış', paths: ['/', '/koc', '/dersler', '/testler', '/denemeler', '/plan'] },
  { label: 'Takip', paths: ['/tekrar', '/yanlislar', '/gelisim'] },
  { label: 'Kişisel', paths: ['/ogretmen', '/pandam', '/defterim', '/daha'] },
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
  const teacherName = useSelector((s) => s.settings.teacherName);
  // Test ve Panda Evi tam ekran deneyimdir; global alt şerit gizlenir.
  const petMode = route.path === '/pandam';
  const focusMode = route.path === '/test' || petMode;
  return (
    <div className={`shell${focusMode ? ' no-dock' : ''}${petMode ? ' pet-shell' : ''}`}>
      <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>
        İçeriğe geç
      </a>
      <aside className="sidebar" aria-label="Ana menü">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">♡</div>
          <div>
            <div className="brand">İyi ki • YKS</div>
            <div className="tiny muted">TYT + AYT Sayısal çalışma alanı</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {SIDEBAR_GROUPS.map((group) => (
            <div className="sidebar-group" key={group.label}>
              <div className="sidebar-group-label">{group.label}</div>
              {group.paths.map((path) => {
                const n = NAV_ALL.find((item) => item.path === path);
                if (!n) return null;
                return (
                  <a key={n.path} href={`#${n.path}`} aria-current={section === n.path ? 'page' : undefined}>
                    <Icon name={n.icon} />
                    <span>{n.path === '/ogretmen' ? `${teacherName} ♡` : n.label}</span>
                  </a>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-foot">
          <span className="sidebar-foot-dot" aria-hidden="true" />
          Kişisel çalışma verilerin cihazında saklanır.
        </div>
      </aside>
      <main id="main" className="main" tabIndex={-1}>
        {children}
      </main>
      {!focusMode && <MascotNav />}
      <Companion />
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
