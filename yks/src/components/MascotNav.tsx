import { useEffect, useId, useRef, useState } from 'react';
import { Icon, type IconName } from './Icon';
import { sectionOf } from './Layout';
import { href, useRoute } from '../hooks/useRoute';

/**
 * Karakter tabanlı gezinme. Alt şeritte oturan hayvanlar:
 * tavşan = TYT, tilki = AYT, panda = ana menü, kedi = Denemeler, ayıcık = Defterim.
 * Pandaya basınca ayağa kalkar, sağ üste yürür, perde tutamacını çeker ve menü aşağı iner;
 * kapatınca geri yürüyüp yerine oturur. Hareketler prefers-reduced-motion'a uyar.
 */

interface MenuItem {
  path: string;
  label: string;
  icon: IconName;
  tint: string;
}

const MENU: MenuItem[] = [
  { path: '/', label: 'Ana Sayfa', icon: 'home', tint: '#efe6fb' },
  { path: '/dersler', label: 'Dersler', icon: 'book', tint: '#e3effd' },
  { path: '/testler', label: 'Testler', icon: 'check', tint: '#e5f5ec' },
  { path: '/denemeler', label: 'Denemeler', icon: 'trophy', tint: '#fdeedd' },
  { path: '/defterim', label: 'Defterim', icon: 'sparkle', tint: '#fde6ec' },
  { path: '/plan', label: 'Planım', icon: 'calendar', tint: '#e2f4f3' },
  { path: '/tekrar', label: 'Genel Tekrar', icon: 'repeat', tint: '#fff3cf' },
  { path: '/ogretmen', label: 'Konu Asistanı', icon: 'teacher', tint: '#ece8f3' },
  { path: '/yanlislar', label: 'Yanlışlarım', icon: 'alert', tint: '#fde4e1' },
  { path: '/odak', label: 'Odak', icon: 'timer', tint: '#e6f0dc' },
  { path: '/gelisim', label: 'Gelişimim', icon: 'chart', tint: '#e3effd' },
  { path: '/kaynaklar', label: 'Kaynaklar', icon: 'link', tint: '#f1ebe1' },
  { path: '/cikmis', label: 'ÖSYM Çıkmış', icon: 'archive', tint: '#efe6fb' },
  { path: '/ayarlar', label: 'Ayarlar', icon: 'settings', tint: '#eeeae4' },
];

/** Oturan, tam gövdeli yavru panda. */
export function PandaBody({ size = 64, waving = false }: { size?: number; waving?: boolean }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden="true" className="panda-body">
      <ellipse cx="40" cy="76" rx="24" ry="3.5" fill="rgba(60,40,20,.12)" />
      {/* gövde */}
      <ellipse cx="40" cy="58" rx="21" ry="17" fill="#fbfbfa" stroke="#e8e2da" strokeWidth="1.2" />
      {/* ayaklar */}
      <ellipse cx="27" cy="72" rx="8" ry="5.5" fill="#2f2830" />
      <ellipse cx="53" cy="72" rx="8" ry="5.5" fill="#2f2830" />
      <circle cx="27" cy="72" r="2.2" fill="#f3c9d6" />
      <circle cx="53" cy="72" r="2.2" fill="#f3c9d6" />
      {/* kollar */}
      <ellipse cx="21" cy="56" rx="6" ry="10" fill="#2f2830" transform="rotate(20 21 56)" />
      <g className={waving ? 'panda-wave' : undefined} style={{ transformOrigin: '59px 50px' }}>
        <ellipse cx="59" cy="56" rx="6" ry="10" fill="#2f2830" transform="rotate(-20 59 56)" />
      </g>
      {/* kulaklar */}
      <circle cx="22" cy="12" r="8" fill="#2f2830" />
      <circle cx="58" cy="12" r="8" fill="#2f2830" />
      {/* baş */}
      <ellipse cx="40" cy="28" rx="23" ry="20" fill="#fffefc" stroke="#e8e2da" strokeWidth="1.2" />
      <ellipse cx="30" cy="28" rx="6.5" ry="7.5" fill="#2f2830" transform="rotate(-15 30 28)" />
      <ellipse cx="50" cy="28" rx="6.5" ry="7.5" fill="#2f2830" transform="rotate(15 50 28)" />
      <circle cx="31" cy="28" r="2.4" fill="#fff" />
      <circle cx="49" cy="28" r="2.4" fill="#fff" />
      <ellipse cx="40" cy="36" rx="3.4" ry="2.4" fill="#2f2830" />
      <path d="M36 40 Q40 43 44 40" stroke="#2f2830" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <ellipse cx="24" cy="37" rx="4" ry="2.4" fill="#f7c6d3" opacity=".8" />
      <ellipse cx="56" cy="37" rx="4" ry="2.4" fill="#f7c6d3" opacity=".8" />
    </svg>
  );
}

export function RabbitFace({ size = 34 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <ellipse cx="22" cy="12" rx="6" ry="15" fill="#fff" stroke="#e2d3ea" strokeWidth="2" />
      <ellipse cx="42" cy="12" rx="6" ry="15" fill="#fff" stroke="#e2d3ea" strokeWidth="2" />
      <ellipse cx="22" cy="13" rx="2.6" ry="9" fill="#f3c9d6" />
      <ellipse cx="42" cy="13" rx="2.6" ry="9" fill="#f3c9d6" />
      <circle cx="32" cy="40" r="20" fill="#ffffff" stroke="#e2d3ea" strokeWidth="2" />
      <circle cx="25" cy="38" r="2.4" fill="#3a3238" />
      <circle cx="39" cy="38" r="2.4" fill="#3a3238" />
      <ellipse cx="20" cy="45" rx="3.4" ry="2" fill="#f7c6d3" />
      <ellipse cx="44" cy="45" rx="3.4" ry="2" fill="#f7c6d3" />
      <ellipse cx="32" cy="44" rx="2.6" ry="2" fill="#f0a3ba" />
      <path d="M28 48 Q32 51 36 48" stroke="#3a3238" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function FoxFace({ size = 34 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <path d="M12 10 L26 26 L9 28 Z" fill="#e8783a" />
      <path d="M52 10 L38 26 L55 28 Z" fill="#e8783a" />
      <path d="M15 14 L23 23 L12 24 Z" fill="#fff4ea" />
      <path d="M49 14 L41 23 L52 24 Z" fill="#fff4ea" />
      <circle cx="32" cy="38" r="21" fill="#ef8a45" />
      <path d="M13 40 Q32 60 51 40 Q46 56 32 58 Q18 56 13 40 Z" fill="#fff8f1" />
      <circle cx="24" cy="36" r="2.4" fill="#3a3238" />
      <circle cx="40" cy="36" r="2.4" fill="#3a3238" />
      <path d="M32 42 l-3 3 h6 z" fill="#3a3238" />
    </svg>
  );
}

export function CatFace({ size = 34 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <path d="M13 12 L25 27 L10 30 Z" fill="#f3a24a" />
      <path d="M51 12 L39 27 L54 30 Z" fill="#f3a24a" />
      <path d="M16 17 L22 25 L14 26 Z" fill="#f7c6d3" />
      <path d="M48 17 L42 25 L50 26 Z" fill="#f7c6d3" />
      <circle cx="32" cy="38" r="21" fill="#f8b768" />
      <path d="M26 20 Q32 24 38 20" stroke="#e39238" strokeWidth="2" fill="none" />
      <circle cx="24" cy="36" r="2.4" fill="#3a3238" />
      <circle cx="40" cy="36" r="2.4" fill="#3a3238" />
      <path d="M32 42 l-2.5 2.5 h5 z" fill="#3a3238" />
      <path d="M27 47 Q32 50 37 47" stroke="#3a3238" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M5 38 H16 M6 44 H16 M48 38 H59 M48 44 H58" stroke="#c97a2c" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function BearFace({ size = 34 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <circle cx="15" cy="18" r="9" fill="#b98760" />
      <circle cx="49" cy="18" r="9" fill="#b98760" />
      <circle cx="15" cy="18" r="4.5" fill="#f1cda9" />
      <circle cx="49" cy="18" r="4.5" fill="#f1cda9" />
      <circle cx="32" cy="37" r="21" fill="#c99670" />
      <ellipse cx="32" cy="44" rx="10" ry="8" fill="#f3dcc2" />
      <circle cx="24" cy="34" r="2.4" fill="#3a3238" />
      <circle cx="40" cy="34" r="2.4" fill="#3a3238" />
      <ellipse cx="32" cy="41" rx="3.2" ry="2.3" fill="#3a3238" />
      <path d="M29 46 Q32 49 35 46" stroke="#3a3238" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

type PandaPhase = 'sit' | 'walking' | 'pulling' | 'stood' | 'returning';

const WALK_MS = 900;
const PULL_MS = 380;
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
  const timers = useRef<number[]>([]);
  const section = sectionOf(route.path);
  const menuOpen = phase === 'stood';
  const exam = route.query.get('sinav');
  const onTests = section === '/testler';

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), []);

  useEffect(() => {
    if (menuOpen) closeBtnRef.current?.focus();
  }, [menuOpen]);

  const openMenu = () => {
    if (phase !== 'sit') return;
    if (prefersReducedMotion()) return setPhase('stood');
    setPhase('walking');
    later(() => setPhase('pulling'), WALK_MS);
    later(() => setPhase('stood'), WALK_MS + PULL_MS);
  };
  const closeMenu = () => {
    if (phase !== 'stood') return;
    const done = () => {
      setPhase('sit');
      pandaBtnRef.current?.focus({ preventScroll: true });
    };
    if (prefersReducedMotion()) return done();
    setPhase('returning');
    later(done, RETURN_MS);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeMenu();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuOpen]);

  // Menü açıkken sayfa kaymasın.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const away = phase !== 'sit';

  return (
    <>
      {menuOpen && <div className="mascot-backdrop" onClick={closeMenu} aria-hidden="true" />}

      {/* Yürüyen panda: dock'tan sağ üste gider, tutamacı çeker. */}
      {(phase === 'walking' || phase === 'pulling' || phase === 'returning') && (
        <div className={`walker walker-${phase}`} aria-hidden="true">
          <PandaBody size={62} waving={phase === 'pulling'} />
        </div>
      )}
      {(phase === 'walking' || phase === 'pulling') && (
        <span className={`blind-cord${phase === 'pulling' ? ' pulled' : ''}`} aria-hidden="true">
          <span className="blind-knob" />
        </span>
      )}

      <div className={`mascot-menu-panel${menuOpen ? ' open' : ''}`} id={panelId} role="dialog" aria-modal="true" aria-label="Ana menü" hidden={!menuOpen}>
        <div className="menu-head">
          <div className="menu-panda">
            <PandaBody size={54} waving />
          </div>
          <div className="grow">
            <b>Nereye gidelim?</b>
            <div className="tiny muted">Panda seni götürsün ♡</div>
          </div>
          <button ref={closeBtnRef} type="button" className="icon-btn" aria-label="Menüyü kapat" onClick={closeMenu}>
            <Icon name="close" />
          </button>
        </div>
        <nav className="mascot-menu-grid">
          {MENU.map((m) => (
            <a
              key={m.path}
              href={`#${m.path}`}
              aria-current={section === m.path ? 'page' : undefined}
              style={{ ['--tint' as string]: m.tint }}
              onClick={closeMenu}
            >
              <span className="tile-icon">
                <Icon name={m.icon} size={22} />
              </span>
              <span>{m.label}</span>
            </a>
          ))}
        </nav>
        <span className="blind-handle" aria-hidden="true" />
      </div>

      <nav className="mascot-dock" aria-label="Hızlı gezinme">
        <a href={href('/testler', { sinav: 'TYT' })} className="dock-item" aria-label="TYT testleri" data-active={onTests && exam !== 'AYT'}>
          <span className="dock-animal hop">
            <RabbitFace />
          </span>
          <span className="dock-label">TYT</span>
        </a>
        <a href={href('/testler', { sinav: 'AYT' })} className="dock-item" aria-label="AYT testleri" data-active={onTests && exam === 'AYT'}>
          <span className="dock-animal hop">
            <FoxFace />
          </span>
          <span className="dock-label">AYT</span>
        </a>
        <button
          ref={pandaBtnRef}
          type="button"
          className={`dock-item dock-panda${away ? ' away' : ''}`}
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          aria-controls={panelId}
          aria-label={menuOpen ? 'Ana menüyü kapat' : 'Ana menüyü aç'}
          onClick={() => (phase === 'sit' ? openMenu() : phase === 'stood' ? closeMenu() : undefined)}
        >
          <span className="dock-panda-seat">
            <PandaBody size={58} />
          </span>
          <span className="dock-label">Menü</span>
        </button>
        <a href="#/denemeler" className="dock-item" aria-label="Denemeler" data-active={section === '/denemeler'}>
          <span className="dock-animal hop">
            <CatFace />
          </span>
          <span className="dock-label">Deneme</span>
        </a>
        <a href="#/defterim" className="dock-item" aria-label="Defterim" data-active={section === '/defterim'}>
          <span className="dock-animal hop">
            <BearFace />
          </span>
          <span className="dock-label">Defter</span>
        </a>
      </nav>
    </>
  );
}
