import { useEffect, useId, useRef, useState } from 'react';
import { Icon, type IconName } from './Icon';
import { sectionOf } from './Layout';
import { href, useRoute } from '../hooks/useRoute';

/**
 * Karakter tabanlı gezinme: panda ana menüyü açar (ayağa kalkıp sağ üste "yürür"),
 * tavşan Testler'e, kedi Denemeler'e götürür. Klasik alt sekme çubuğu yoktur.
 * Tüm hareketler CSS transform/opacity ile, ~350ms — prefers-reduced-motion'a uyar.
 */

interface MenuItem {
  path: string;
  label: string;
  icon: IconName;
}

const MENU: MenuItem[] = [
  { path: '/', label: 'Ana Sayfa', icon: 'home' },
  { path: '/dersler', label: 'Dersler', icon: 'book' },
  { path: '/plan', label: 'Planım', icon: 'calendar' },
  { path: '/defterim', label: 'Defterim', icon: 'sparkle' },
  { path: '/tekrar', label: 'Genel Tekrar', icon: 'repeat' },
  { path: '/ogretmen', label: 'Konu Asistanı', icon: 'teacher' },
  { path: '/yanlislar', label: 'Yanlışlarım', icon: 'alert' },
  { path: '/odak', label: 'Odak', icon: 'timer' },
  { path: '/gelisim', label: 'Gelişimim', icon: 'chart' },
  { path: '/kaynaklar', label: 'Kaynaklar', icon: 'link' },
  { path: '/cikmis', label: 'ÖSYM Çıkmış Sorular', icon: 'archive' },
  { path: '/ayarlar', label: 'Ayarlar', icon: 'settings' },
];

function PandaFace() {
  return (
    <svg viewBox="0 0 64 64" width="40" height="40" aria-hidden="true">
      <ellipse cx="16" cy="14" rx="9" ry="9" fill="#3a3238" />
      <ellipse cx="48" cy="14" rx="9" ry="9" fill="#3a3238" />
      <circle cx="32" cy="34" r="26" fill="#fbfbfa" />
      <ellipse cx="20" cy="34" rx="8" ry="9" fill="#2f2830" />
      <ellipse cx="44" cy="34" rx="8" ry="9" fill="#2f2830" />
      <circle cx="21" cy="35" r="2.6" fill="#fff" />
      <circle cx="45" cy="35" r="2.6" fill="#fff" />
      <ellipse cx="32" cy="42" rx="4.5" ry="3.5" fill="#2f2830" />
      <path d="M26 48 Q32 52 38 48" stroke="#2f2830" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function RabbitFace() {
  return (
    <svg viewBox="0 0 64 64" width="30" height="30" aria-hidden="true">
      <ellipse cx="21" cy="10" rx="6" ry="16" fill="#fff" stroke="#e7d9ee" strokeWidth="2" />
      <ellipse cx="43" cy="10" rx="6" ry="16" fill="#fff" stroke="#e7d9ee" strokeWidth="2" />
      <ellipse cx="21" cy="12" rx="2.6" ry="9" fill="#f3c9d6" />
      <ellipse cx="43" cy="12" rx="2.6" ry="9" fill="#f3c9d6" />
      <circle cx="32" cy="38" r="22" fill="#ffffff" stroke="#e7d9ee" strokeWidth="2" />
      <circle cx="24" cy="36" r="2.4" fill="#3a3238" />
      <circle cx="40" cy="36" r="2.4" fill="#3a3238" />
      <ellipse cx="32" cy="43" rx="3" ry="2.2" fill="#f0a3ba" />
      <path d="M27 47 Q32 51 37 47" stroke="#3a3238" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function FoxFace() {
  return (
    <svg viewBox="0 0 64 64" width="30" height="30" aria-hidden="true">
      <path d="M12 8 L26 24 L8 26 Z" fill="#e8783a" />
      <path d="M52 8 L38 24 L56 26 Z" fill="#e8783a" />
      <path d="M15 12 L24 22 L12 22 Z" fill="#fff" />
      <path d="M49 12 L40 22 L52 22 Z" fill="#fff" />
      <circle cx="32" cy="36" r="22" fill="#ef8a45" />
      <path d="M20 40 Q32 52 44 40 Q40 52 32 54 Q24 52 20 40 Z" fill="#fff" />
      <circle cx="24" cy="34" r="2.4" fill="#3a3238" />
      <circle cx="40" cy="34" r="2.4" fill="#3a3238" />
      <path d="M32 39 l-3 3 h6 z" fill="#3a3238" />
    </svg>
  );
}

export function CatFace() {
  return (
    <svg viewBox="0 0 64 64" width="30" height="30" aria-hidden="true">
      <path d="M14 10 L24 26 L10 28 Z" fill="#f3a24a" />
      <path d="M50 10 L40 26 L54 28 Z" fill="#f3a24a" />
      <circle cx="32" cy="36" r="22" fill="#f8b768" />
      <circle cx="24" cy="34" r="2.4" fill="#3a3238" />
      <circle cx="40" cy="34" r="2.4" fill="#3a3238" />
      <path d="M32 40 l-2.5 2.5 h5 z" fill="#3a3238" />
      <path d="M27 45 Q32 48 37 45" stroke="#3a3238" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M6 36 H16 M6 42 H16 M48 36 H58 M48 42 H58" stroke="#c97a2c" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

type PandaPhase = 'sit' | 'walking' | 'stood' | 'returning';

const WALK_MS = 900;
const RETURN_MS = 700;

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export function MascotNav() {
  const route = useRoute();
  const [phase, setPhase] = useState<PandaPhase>('sit');
  const panelId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const pandaBtnRef = useRef<HTMLButtonElement>(null);
  const section = sectionOf(route.path);
  const menuOpen = phase === 'stood';

  useEffect(() => {
    if (menuOpen) closeBtnRef.current?.focus();
  }, [menuOpen]);

  const openMenu = () => {
    if (phase !== 'sit') return;
    if (prefersReducedMotion()) return setPhase('stood');
    setPhase('walking');
    setTimeout(() => setPhase('stood'), WALK_MS);
  };
  const closeMenu = () => {
    if (phase !== 'stood') return;
    if (prefersReducedMotion()) {
      setPhase('sit');
      pandaBtnRef.current?.focus();
      return;
    }
    setPhase('returning');
    setTimeout(() => {
      setPhase('sit');
      pandaBtnRef.current?.focus();
    }, RETURN_MS);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeMenu();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuOpen]);

  const pandaClass = phase === 'walking' || phase === 'stood' ? ' walking' : phase === 'returning' ? ' returning' : '';

  return (
    <>
      {menuOpen && <div className="mascot-backdrop" onClick={closeMenu} aria-hidden="true" />}
      {(phase === 'walking' || phase === 'stood') && <span className="mascot-pull-tab" aria-hidden="true" />}

      <div className={`mascot-menu-panel${menuOpen ? ' open' : ''}`} id={panelId} role="dialog" aria-modal="true" aria-label="Ana menü" hidden={!menuOpen}>
        <div className="row between mb-8">
          <b>Menü ♡</b>
          <button ref={closeBtnRef} type="button" className="icon-btn" aria-label="Menüyü kapat" onClick={closeMenu}>
            <Icon name="close" />
          </button>
        </div>
        <nav className="mascot-menu-list">
          {MENU.map((m) => (
            <a key={m.path} href={`#${m.path}`} aria-current={section === m.path ? 'page' : undefined} onClick={closeMenu}>
              <Icon name={m.icon} />
              {m.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="mascot-dock" aria-hidden={false}>
        <a href={href('/testler', { sinav: 'TYT' })} className="mascot-btn mascot-rabbit" aria-label="TYT testleri" data-active={section === '/testler' || section === '/test'}>
          <RabbitFace />
        </a>
        <a href={href('/testler', { sinav: 'AYT' })} className="mascot-btn mascot-fox" aria-label="AYT testleri" data-active={section === '/testler' || section === '/test'}>
          <FoxFace />
        </a>
        <button
          ref={pandaBtnRef}
          type="button"
          className={`mascot-btn mascot-panda${pandaClass}`}
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          aria-controls={panelId}
          aria-label={menuOpen ? 'Ana menüyü kapat' : 'Ana menüyü aç'}
          onClick={() => (phase === 'sit' ? openMenu() : phase === 'stood' ? closeMenu() : undefined)}
        >
          <PandaFace />
        </button>
        <a href="#/denemeler" className="mascot-btn mascot-cat" aria-label="Denemeler" data-active={section === '/denemeler'}>
          <CatFace />
        </a>
      </div>
    </>
  );
}
