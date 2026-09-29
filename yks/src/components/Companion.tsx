import { useEffect, useMemo, useRef, useState } from 'react';
import { AssistantCharacter, type AssistantMood } from './AssistantCharacter';
import { useRoute } from '../hooks/useRoute';
import { useSpeaker } from '../hooks/useVoice';
import { companionLines, pickLine } from '../services/companion';
import { updateSettings } from '../store/actions';
import { getState, update, useSelector } from '../store/store';

const HIDDEN_SECTIONS = new Set(['test', 'ogretmen', 'ortak', 'calis']);
const MUTE_KEY = 'iyikiYks.cumaSessiz';
const WALK_MS = 2600;
const BUBBLE_MS = 8000;
const ROAM_MS = 40_000;

/** Ortadaki panda düğmesinin önüne geçmemek için yalnız iki yanda dolaşır (% cinsinden sol konum). */
function spot(seed: number): number {
  return seed % 2 ? 3 + ((seed * 7) % 26) : 56 + ((seed * 11) % 20);
}

function mutedToday(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === new Date().toDateString();
  } catch {
    return false;
  }
}

/**
 * Sitede dolaşan Cuma: alt şeridin arkasından belinden yukarısı görünür, sağa sola yürür,
 * bulunduğu sayfaya göre sevgilisine bir şeyler söyler. Dokununca konuşma balonu açılır.
 * İçeriği kapatmamak için yalnız karakterin kendisi dokunulabilir; test çözerken görünmez.
 */
export function Companion() {
  const route = useRoute();
  const enabled = useSelector((s) => s.settings.companion);
  const name = useSelector((s) => s.settings.teacherName);
  const section = route.segments[0] ?? '';
  const inNotebookEditor = section === 'defterim' && route.segments.length > 1;
  const hidden = !enabled || HIDDEN_SECTIONS.has(section) || inNotebookEditor;

  const [x, setX] = useState(12); // yüzde (soldan)
  const [walking, setWalking] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const [mood, setMood] = useState<AssistantMood>('happy');
  const seed = useRef(Math.floor(Math.random() * 1000));
  const timers = useRef<number[]>([]);
  const speaker = useSpeaker();

  const lines = useMemo(() => companionLines(route.path, getState()), [route.path]);

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  };

  const say = (text: string, holdMs = BUBBLE_MS) => {
    setBubble(text);
    setMood('talking');
    later(() => setMood('idle'), Math.min(4500, 1200 + text.length * 40));
    later(() => {
      setBubble((b) => (b === text ? null : b));
      setMenu(false);
    }, holdMs);
  };

  const walkTo = (target: number, then?: () => void) => {
    setWalking(true);
    setMood('idle');
    setX(target);
    later(() => {
      setWalking(false);
      then?.();
    }, WALK_MS);
  };

  // Sayfa değişince: yeni bir yere yürü ve o sayfaya uygun bir şey söyle.
  useEffect(() => {
    if (hidden) return;
    clearTimers();
    setMenu(false);
    seed.current += 1;
    walkTo(spot(seed.current), () => {
      if (!mutedToday()) say(lines[0]);
    });
    const iv = window.setInterval(() => {
      seed.current += 1;
      walkTo(spot(seed.current), () => {
        if (!mutedToday() && seed.current % 3 === 0) say(pickLine(lines, seed.current));
      });
    }, ROAM_MS);
    return () => {
      clearInterval(iv);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.path, hidden]);

  if (hidden) return null;

  const onTap = () => {
    clearTimers();
    seed.current += 1;
    const text = pickLine(lines, seed.current);
    setMenu(true);
    say(text, 12_000);
    let voice = true;
    try {
      voice = localStorage.getItem('iyikiYks.asistanSes') !== '0';
    } catch {
      /* varsayılan: sesli */
    }
    speaker.speak(text, voice);
  };

  const mute = () => {
    try {
      localStorage.setItem(MUTE_KEY, new Date().toDateString());
    } catch {
      /* yok say */
    }
    setBubble(null);
    setMenu(false);
    speaker.stop();
  };

  const right = x > 40;

  return (
    <div className={`companion${walking ? ' walking' : ''}`} style={{ left: `${x}%` }}>
      {bubble && (
        <div className={`companion-bubble${right ? ' right' : ''}`} role="status" aria-live="polite">
          <b className="tiny">{name}</b>
          <div>{bubble}</div>
          {menu && (
            <div className="companion-actions">
              <a className="btn small primary" href="#/ogretmen" onClick={() => speaker.stop()}>
                Konuşalım ♡
              </a>
              <button type="button" className="btn small ghost" onClick={mute}>
                Bugün sessiz ol
              </button>
            </div>
          )}
        </div>
      )}
      <button type="button" className="companion-body" onClick={onTap} aria-label={`${name} ile konuş`}>
        <AssistantCharacter mood={speaker.speaking ? 'talking' : mood} size={84} desk={false} />
      </button>
    </div>
  );
}

/** Ayarlar'da Cuma'nın dolaşmasını aç/kapa. */
export function CompanionToggle() {
  const enabled = useSelector((s) => s.settings.companion);
  const name = useSelector((s) => s.settings.teacherName);
  return (
    <label className="row nowrap mt-12" style={{ gap: 8 }}>
      <input type="checkbox" checked={enabled} onChange={(e) => update((s) => updateSettings(s, { companion: e.target.checked }))} />
      <span className="small">{name} sayfalarda dolaşsın ve konuşsun</span>
    </label>
  );
}
