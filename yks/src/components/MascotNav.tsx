import { useEffect, useId, useRef, useState } from 'react';
import { Icon, type IconName } from './Icon';
import { sectionOf } from './Layout';
import { href, useRoute } from '../hooks/useRoute';
import { usePetNeeds } from '../hooks/usePetNeeds';
import { useSelector } from '../store/store';

/** Oturan, tam gövdeli yavru panda. */
/** Panda aksesuarları (seviye ile açılır). Baş/gövde koordinatları PandaBody'ye göredir. */
function PandaItems({ items, layer }: { items: string[]; layer: 'back' | 'front' }) {
  const has = (i: string) => items.includes(i);
  if (layer === 'back') {
    return has('kulaklik') ? <path d="M17 26 Q17 4 40 4 Q63 4 63 26" stroke="#5b3fa0" strokeWidth="3.5" fill="none" strokeLinecap="round" /> : null;
  }
  return (
    <>
      {has('atki') && (
        <g>
          <path d="M22 45 Q40 52 58 45 L58 50 Q40 57 22 50 Z" fill="#e8674f" />
          <path d="M50 49 l3 13 l6 -2 l-4 -12 z" fill="#d85641" />
          <path d="M28 47 v5 M34 48.5 v5 M40 49 v5 M46 48.5 v5" stroke="#f6b0a3" strokeWidth="1.2" />
        </g>
      )}
      {has('papyon') && !has('atki') && (
        <g>
          <path d="M40 47 l-8 -4 v8 z M40 47 l8 -4 v8 z" fill="#f06a9b" />
          <circle cx="40" cy="47" r="2.2" fill="#d44f82" />
        </g>
      )}
      {has('gozluk') && (
        <g stroke="#3a2a55" strokeWidth="1.6" fill="rgba(200,230,255,.25)">
          <circle cx="30" cy="28" r="7.5" />
          <circle cx="50" cy="28" r="7.5" />
          <path d="M37.5 28 h5" fill="none" />
        </g>
      )}
      {has('kulaklik') && (
        <g fill="#7c5cd6">
          <rect x="12" y="22" width="8" height="13" rx="4" />
          <rect x="60" y="22" width="8" height="13" rx="4" />
        </g>
      )}
      {has('cicek') && !has('kep') && !has('tac') && (
        <g>
          {[20, 30, 40, 50, 60].map((x, i) => (
            <g key={x} transform={`translate(${x} ${i % 2 ? 9 : 11})`}>
              <circle r="3.4" fill={['#f7a1c4', '#ffd166', '#a0d8ef', '#f7a1c4', '#b8e0a8'][i]} />
              <circle r="1.3" fill="#fff6d5" />
            </g>
          ))}
        </g>
      )}
      {has('kep') && !has('tac') && (
        <g>
          <path d="M40 2 L64 11 L40 20 L16 11 Z" fill="#2f2830" />
          <rect x="30" y="13" width="20" height="6" fill="#2f2830" />
          <path d="M62 11 v10" stroke="#ffd166" strokeWidth="1.6" />
          <circle cx="62" cy="22" r="1.8" fill="#ffd166" />
        </g>
      )}
      {has('tac') && (
        <g>
          <path d="M26 14 L28 2 L34 9 L40 0 L46 9 L52 2 L54 14 Z" fill="#ffc53d" stroke="#e0a100" strokeWidth="1" />
          <circle cx="40" cy="7" r="1.8" fill="#f06a9b" />
        </g>
      )}
      {has('kalem') && (
        <g transform="rotate(-35 64 60)">
          <rect x="61" y="44" width="5" height="22" rx="1" fill="#ffc53d" />
          <path d="M61 66 L63.5 71 L66 66 Z" fill="#f3d2a2" />
          <rect x="61" y="42" width="5" height="3" fill="#f06a9b" />
        </g>
      )}
    </>
  );
}

export function PandaBody({
  size = 64,
  waving = false,
  items = [],
  sleepy = false,
  sad = false,
  holding = null,
}: {
  size?: number;
  waving?: boolean;
  items?: string[];
  sleepy?: boolean;
  /** Aç/susuz: ağzı aşağı kıvrık, gözünde yaş. */
  sad?: boolean;
  /** Elinde bambu ya da su şişesi (beslerken). */
  holding?: 'bambu' | 'su' | null;
}) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden="true" className="panda-body">
      <PandaItems items={items} layer="back" />
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
      {sleepy ? (
        <path d="M27 29 q3 2.5 6 0 M47 29 q3 2.5 6 0" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      ) : (
        <>
          <circle cx="31" cy="28" r="2.4" fill="#fff" />
          <circle cx="49" cy="28" r="2.4" fill="#fff" />
        </>
      )}
      <ellipse cx="40" cy="36" rx="3.4" ry="2.4" fill="#2f2830" />
      <path
        d={holding ? 'M36.5 40 Q40 45 43.5 40 Z' : sad ? 'M36 42 Q40 39 44 42' : sleepy ? 'M37 41 Q40 42 43 41' : 'M36 40 Q40 43 44 40'}
        stroke="#2f2830"
        strokeWidth="1.6"
        fill={holding ? '#e27a95' : 'none'}
        strokeLinecap="round"
        className={holding ? 'panda-chew' : undefined}
      />
      {sad && !sleepy && <path d="M52 33 q1.6 3 0 4.4 q-1.6-1.4 0-4.4z" fill="#8cc8f0" className="panda-tear" />}
      {holding === 'bambu' && (
        <g className="panda-hold">
          <rect x="54" y="30" width="4.5" height="30" rx="2" fill="#7cc36b" transform="rotate(-18 56 45)" />
          <path d="M53 38 h6 M53.5 48 h6" stroke="#4f9a45" strokeWidth="1.2" transform="rotate(-18 56 45)" />
          <path d="M60 30 q7-5 11-2 q-6 3-11 2z" fill="#8fd47c" />
        </g>
      )}
      {holding === 'su' && (
        <g className="panda-hold">
          <rect x="54" y="38" width="10" height="17" rx="3" fill="#bfe6fb" stroke="#6bb6e4" strokeWidth="1.2" />
          <rect x="56.5" y="34" width="5" height="5" rx="1" fill="#6bb6e4" />
          <rect x="55.5" y="45" width="8" height="9" rx="2" fill="#7fc8f2" />
        </g>
      )}
      <ellipse cx="24" cy="37" rx="4" ry="2.4" fill="#f7c6d3" opacity=".8" />
      <ellipse cx="56" cy="37" rx="4" ry="2.4" fill="#f7c6d3" opacity=".8" />
      <PandaItems items={items} layer="front" />
      {sleepy && (
        <text x="62" y="14" fontSize="9" fontWeight="700" fill="#7c5cd6">
          z<tspan fontSize="7" dy="-4">z</tspan>
        </text>
      )}
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

export function FoxFace({ size = 34 }: { size?: number }) {
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

export function BearFace({ size = 34 }: { size?: number }) {
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


interface MenuItem {
  path: string;
  label: string;
  icon: IconName;
  emoji: string;
}

/** Panda menüsünün ilk seviyesi: yalnız en sık kullanılanlar. */
export const MENU_MAIN: MenuItem[] = [
  { path: '/', label: 'Ana Sayfa', icon: 'home', emoji: '🏠' },
  { path: '/dersler', label: 'Dersler', icon: 'book', emoji: '📚' },
  { path: '/calis', label: 'Ders Çalış', icon: 'pen', emoji: '✏️' },
  { path: '/testler', label: 'Testler', icon: 'check', emoji: '✅' },
  { path: '/plan', label: 'Planım', icon: 'calendar', emoji: '📅' },
  { path: '/tekrar', label: 'Genel Tekrar', icon: 'repeat', emoji: '🔁' },
  { path: '/ogretmen', label: 'Cuma Öğretmen', icon: 'teacher', emoji: '🧠' },
];

/** "Diğer" altındakiler. */
export const MENU_MORE: MenuItem[] = [
  { path: '/yanlislar', label: 'Yanlışlarım', icon: 'alert', emoji: '❗' },
  { path: '/defterim', label: 'Defterim', icon: 'pen', emoji: '📓' },
  { path: '/denemeler', label: 'Denemeler', icon: 'trophy', emoji: '🏁' },
  { path: '/kartlar', label: 'Bilgi Kartları', icon: 'cards', emoji: '🃏' },
  { path: '/formuller', label: 'Formüller', icon: 'formula', emoji: '📐' },
  { path: '/gelisim', label: 'Gelişimim', icon: 'chart', emoji: '📈' },
  { path: '/karne', label: 'Haftalık Karne', icon: 'chart', emoji: '🗓️' },
  { path: '/rozetler', label: 'Rozetler', icon: 'trophy', emoji: '🏅' },
  { path: '/kaynaklar', label: 'Kaynaklar', icon: 'link', emoji: '🔗' },
  { path: '/cikmis', label: 'ÖSYM', icon: 'archive', emoji: '🗂️' },
  { path: '/kaydedilenler', label: 'Kaydedilenler', icon: 'star', emoji: '⭐' },
  { path: '/pandam', label: 'Panda', icon: 'sparkle', emoji: '🐼' },
  { path: '/ayarlar', label: 'Ayarlar', icon: 'settings', emoji: '⚙️' },
];

type PandaPhase = 'sit' | 'standing' | 'walking' | 'pulling' | 'stood' | 'releasing' | 'returning' | 'sitting';

/** Animasyon süreleri (ms): kalk → yürü → ipi çek → menü; kapanınca ipi bırak → geri yürü → otur. */
export const PANDA_TIMING = { stand: 220, walk: 900, pull: 380, release: 220, back: 820, sit: 220 };

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Alt gezinme: tam genişlikte bar yok; her hayvan kendi küçük platformunda yüzer.
 * 🐰 TYT test merkezi · 🦊 AYT test merkezi · 🐼 menü · 🐱 denemeler · 🐻 defter.
 * Pandaya basınca: ayağa kalkar, küçük adımlarla sağ üste yürür, ipi çeker ve menü açılır;
 * kapanınca ipi bırakır, geri yürür ve yerine oturur.
 */
export function MascotNav() {
  const route = useRoute();
  const [phase, setPhase] = useState<PandaPhase>('sit');
  const [more, setMore] = useState(false);
  const panelId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const pandaBtnRef = useRef<HTMLButtonElement>(null);
  const timers = useRef<number[]>([]);
  const section = sectionOf(route.path);
  const petItems = useSelector((s) => s.settings.pet.items);
  const teacherName = useSelector((s) => s.settings.teacherName);
  const needs = usePetNeeds();
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
    setMore(false);
    if (prefersReducedMotion()) return setPhase('stood');
    const t = PANDA_TIMING;
    setPhase('standing');
    later(() => setPhase('walking'), t.stand);
    later(() => setPhase('pulling'), t.stand + t.walk);
    later(() => setPhase('stood'), t.stand + t.walk + t.pull);
  };
  const closeMenu = () => {
    if (phase !== 'stood') return;
    const done = () => {
      setPhase('sit');
      pandaBtnRef.current?.focus({ preventScroll: true });
    };
    if (prefersReducedMotion()) return done();
    const t = PANDA_TIMING;
    setPhase('releasing');
    later(() => setPhase('returning'), t.release);
    later(() => setPhase('sitting'), t.release + t.back);
    later(done, t.release + t.back + t.sit);
  };

  // Sayfa değişince menü kapansın.
  useEffect(() => {
    if (phase === 'stood') closeMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.path]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeMenu();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuOpen]);

  const travelling = phase !== 'sit' && phase !== 'stood';
  const away = phase !== 'sit';
  const cord = phase === 'walking' || phase === 'pulling' || phase === 'stood' || phase === 'releasing';
  const items = more ? MENU_MORE : MENU_MAIN;

  return (
    <>
      {menuOpen && <div className="mascot-backdrop" onClick={closeMenu} aria-hidden="true" />}

      {travelling && (
        <div className={`walker walker-${phase}`} aria-hidden="true">
          <div className="walker-body">
            <PandaBody size={62} waving={phase === 'pulling'} />
          </div>
        </div>
      )}
      {cord && (
        <span className={`blind-cord${phase === 'pulling' || phase === 'stood' ? ' pulled' : ''}`} aria-hidden="true">
          <span className="blind-knob" />
        </span>
      )}

      <div className={`mascot-menu-panel${menuOpen ? ' open' : ''}`} id={panelId} role="dialog" aria-modal="true" aria-label="Ana menü" hidden={!menuOpen}>
        <div className="menu-head">
          <div className="menu-panda">
            <PandaBody size={54} waving />
          </div>
          <div className="grow">
            <b>{more ? 'Diğer' : 'Nereye gidelim?'}</b>
            <div className="tiny muted">{more ? 'Tüm araçlar' : 'Panda seni götürsün ♡'}</div>
          </div>
          {more && (
            <button type="button" className="icon-btn" aria-label="Ana menüye dön" onClick={() => setMore(false)}>
              <Icon name="left" />
            </button>
          )}
          <button ref={closeBtnRef} type="button" className="icon-btn" aria-label="Menüyü kapat" onClick={closeMenu}>
            <Icon name="close" />
          </button>
        </div>
        <nav className="mascot-menu-list" aria-label={more ? 'Diğer sayfalar' : 'Ana sayfalar'}>
          {items.map((m) => (
            <a key={m.path} href={`#${m.path}`} aria-current={section === m.path ? 'page' : undefined} onClick={closeMenu}>
              <span className="menu-emoji" aria-hidden="true">
                {m.emoji}
              </span>
              <span className="grow">{m.path === '/ogretmen' ? `${teacherName} Öğretmen` : m.label}</span>
              <Icon name="right" size={16} />
            </a>
          ))}
          {!more && (
            <button type="button" className="menu-more" onClick={() => setMore(true)} aria-expanded={more}>
              <span className="menu-emoji" aria-hidden="true">
                ✨
              </span>
              <span className="grow">Diğer</span>
              <Icon name="right" size={16} />
            </button>
          )}
        </nav>
      </div>

      <nav className="mascot-dock" aria-label="Hızlı gezinme">
        <a href={href('/testler', { sinav: 'TYT' })} className="dock-item" data-testid="dock-tyt" aria-label="TYT test merkezi" data-active={onTests && exam !== 'AYT'}>
          <span className="dock-animal hop">
            <RabbitFace />
          </span>
          <span className="dock-label">TYT</span>
        </a>
        <a href={href('/testler', { sinav: 'AYT' })} className="dock-item" data-testid="dock-ayt" aria-label="AYT test merkezi" data-active={onTests && exam === 'AYT'}>
          <span className="dock-animal hop">
            <FoxFace />
          </span>
          <span className="dock-label">AYT</span>
        </a>
        <button
          ref={pandaBtnRef}
          type="button"
          data-testid="dock-panda"
          className={`dock-item dock-panda${away ? ' away' : ''}`}
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          aria-controls={panelId}
          aria-label={menuOpen ? 'Ana menüyü kapat' : `Ana menüyü aç${needs.hungry ? ', panda acıktı' : ''}${needs.thirsty ? ', panda susadı' : ''}`}
          onClick={() => (phase === 'sit' ? openMenu() : phase === 'stood' ? closeMenu() : undefined)}
        >
          <span className="dock-panda-seat">
            <PandaBody size={64} items={petItems} sad={needs.hungry || needs.thirsty} />
          </span>
          {(needs.hungry || needs.thirsty) && (
            <span className="dock-need" aria-hidden="true">
              {needs.hungry ? '🎋' : ''}
              {needs.thirsty ? '💧' : ''}
            </span>
          )}
          <span className="dock-label">Menü</span>
        </button>
        <a href="#/denemeler" className="dock-item" data-testid="dock-deneme" aria-label="Denemeler" data-active={section === '/denemeler'}>
          <span className="dock-animal hop">
            <CatFace />
          </span>
          <span className="dock-label">Deneme</span>
        </a>
        <a href="#/defterim" className="dock-item" data-testid="dock-defter" aria-label="Defterim" data-active={section === '/defterim'}>
          <span className="dock-animal hop">
            <BearFace />
          </span>
          <span className="dock-label">Defter</span>
        </a>
      </nav>
    </>
  );
}
