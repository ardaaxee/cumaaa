import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { update, useAppState } from '../store/store';
import { usePetNeeds } from '../hooks/usePetNeeds';
import { feedPet, waterPet } from '../utils/petCare';
import { petStatus } from '../utils/pet';
import { dashboard } from '../utils/stats';
import { dayKey } from '../utils/date';
import { toast } from '../components/ui';

type RoomId = 'living' | 'kitchen' | 'study' | 'bedroom' | 'balcony';

const ROOMS: { id: RoomId; icon: string; label: string }[] = [
  { id: 'living', icon: '🛋️', label: 'Salon' },
  { id: 'kitchen', icon: '🍽️', label: 'Mutfak' },
  { id: 'study', icon: '📚', label: 'Çalışma' },
  { id: 'bedroom', icon: '🛏️', label: 'Yatak' },
  { id: 'balcony', icon: '🌇', label: 'Balkon' },
];

const ROOM_COPY: Record<RoomId, string> = {
  living: 'Sıcak salon · birlikte dinlenme',
  kitchen: 'Mutfak · bambu ve su zamanı',
  study: 'Çalışma odası · beraber odak',
  bedroom: 'Yatak odası · dinlenme zamanı',
  balcony: 'Balkon · kısa nefes molası',
};

function progressEvent(progress: number): { room: RoomId; text: string } | null {
  if (progress >= 100) return { room: 'living', text: 'Bugünkü hedef tamamlandı! Panda kutlama modunda 🎉' };
  if (progress >= 75) return { room: 'balcony', text: 'Hedefin %75’i bitti. Kısa balkon molası 🌇' };
  if (progress >= 50) return { room: 'study', text: 'Yarıladın! Panda çalışma masasına geldi 📚' };
  if (progress >= 25) return { room: 'kitchen', text: 'İlk çeyrek tamam. Küçük bir enerji molası ☕' };
  return null;
}

function PandaCharacter({ celebrating, petting }: { celebrating: boolean; petting: boolean }) {
  return (
    <div className={`p3dv2-panda${celebrating ? ' is-celebrating' : ''}${petting ? ' is-petting' : ''}`} aria-label="Panda">
      <span className="p3dv2-shadow" />
      <span className="p3dv2-panda-ear left" />
      <span className="p3dv2-panda-ear right" />
      <div className="p3dv2-panda-head">
        <span className="p3dv2-panda-patch left"><i /></span>
        <span className="p3dv2-panda-patch right"><i /></span>
        <span className="p3dv2-panda-nose" />
        <span className="p3dv2-panda-mouth" />
        <span className="p3dv2-panda-blush left" />
        <span className="p3dv2-panda-blush right" />
      </div>
      <span className="p3dv2-panda-arm left" />
      <span className="p3dv2-panda-arm right" />
      <div className="p3dv2-panda-body"><span className="p3dv2-belly" /></div>
      <span className="p3dv2-panda-foot left" />
      <span className="p3dv2-panda-foot right" />
      {celebrating && <span className="p3dv2-party">✦ ♡ ✨</span>}
    </div>
  );
}

function ZeynepCharacter() {
  return (
    <div className="p3dv2-zeynep" aria-label="Zeynep">
      <span className="p3dv2-z-shadow" />
      <div className="p3dv2-z-hair-back" />
      <div className="p3dv2-z-head">
        <span className="p3dv2-z-fringe" />
        <span className="p3dv2-z-eye left" />
        <span className="p3dv2-z-eye right" />
        <span className="p3dv2-z-mouth" />
        <span className="p3dv2-z-blush left" />
        <span className="p3dv2-z-blush right" />
      </div>
      <span className="p3dv2-z-arm left" />
      <span className="p3dv2-z-arm right" />
      <div className="p3dv2-z-body"><span>♡</span></div>
      <span className="p3dv2-z-leg left" />
      <span className="p3dv2-z-leg right" />
      <span className="p3dv2-z-shoe left" />
      <span className="p3dv2-z-shoe right" />
    </div>
  );
}

function LivingRoom({ onRelax }: { onRelax: () => void }) {
  return (
    <>
      <div className="p3dv2-window p3dv2-window-day"><span className="sky-sun" /><span className="sky-cloud one" /><span className="sky-cloud two" /></div>
      <div className="p3dv2-art"><span>♡</span></div>
      <div className="p3dv2-tv"><span>YKS</span><i>çalışma molası</i></div>
      <button className="p3dv2-sofa" type="button" onClick={onRelax} aria-label="Koltukta dinlen">
        <span className="cushion one" /><span className="cushion two" /><span className="sofa-leg one" /><span className="sofa-leg two" />
      </button>
      <div className="p3dv2-rug living" />
      <div className="p3dv2-coffee-table"><span>☕</span><i /></div>
      <div className="p3dv2-floor-plant">🪴</div>
      <div className="p3dv2-lamp"><i /><span /></div>
    </>
  );
}

function KitchenRoom({ onFeed, onWater }: { onFeed: () => void; onWater: () => void }) {
  return (
    <>
      <div className="p3dv2-kitchen-upper"><i /><i /><i /></div>
      <div className="p3dv2-kitchen-counter">
        <span className="sink">◡</span><span className="stove">● ●</span>
      </div>
      <div className="p3dv2-fridge"><span>♡</span><i /></div>
      <button className="p3dv2-dining-table" type="button" onClick={onFeed} aria-label="Panda bambu yesin">
        <span>🎋</span><i className="plate" />
      </button>
      <button className="p3dv2-water-bowl" type="button" onClick={onWater} aria-label="Panda su içsin">💧</button>
      <div className="p3dv2-chair one" /><div className="p3dv2-chair two" />
      <div className="p3dv2-kitchen-plant">🌿</div>
    </>
  );
}

function StudyRoom({ onStudy }: { onStudy: () => void }) {
  return (
    <>
      <div className="p3dv2-study-window"><span>☁</span></div>
      <div className="p3dv2-study-board"><b>BUGÜN</b><span>✓ konu</span><span>✓ soru</span><span>♡ devam</span></div>
      <div className="p3dv2-bookshelf"><span>📕</span><span>📘</span><span>📗</span><span>📓</span><i /><i /></div>
      <button className="p3dv2-study-desk" type="button" onClick={onStudy} aria-label="Birlikte çalış">
        <div className="p3dv2-monitor"><b>İYİ Kİ</b><span>YKS</span></div>
        <span className="books">📚</span><span className="cup">☕</span>
      </button>
      <div className="p3dv2-desk-chair" />
      <div className="p3dv2-study-rug" />
      <div className="p3dv2-desk-lamp"><span /></div>
    </>
  );
}

function BedroomRoom({ onSleep }: { onSleep: () => void }) {
  return (
    <>
      <div className="p3dv2-window p3dv2-window-night"><span>☾</span><i /><i /></div>
      <div className="p3dv2-bedroom-art">♡</div>
      <button className="p3dv2-bed" type="button" onClick={onSleep} aria-label="Dinlen">
        <span className="headboard" /><span className="pillow one" /><span className="pillow two" /><span className="blanket" />
      </button>
      <div className="p3dv2-nightstand"><span>☾</span></div>
      <div className="p3dv2-bedroom-rug" />
      <div className="p3dv2-wardrobe"><i /><i /><span>♡</span></div>
    </>
  );
}

function BalconyRoom({ onRelax }: { onRelax: () => void }) {
  return (
    <>
      <div className="p3dv2-city"><i /><i /><i /><i /><i /><span /></div>
      <div className="p3dv2-sunset-orb" />
      <div className="p3dv2-balcony-rail"><i /><i /><i /><i /><i /><b /></div>
      <button className="p3dv2-balcony-seat" type="button" onClick={onRelax} aria-label="Balkonda dinlen"><span>☕</span></button>
      <div className="p3dv2-balcony-table"><span>📖</span></div>
      <div className="p3dv2-balcony-plants">🪴 🌿</div>
      <div className="p3dv2-string-lights"><i /><i /><i /><i /><i /></div>
    </>
  );
}

export default function Panda3DPage() {
  const state = useAppState();
  const needs = usePetNeeds();
  const pet = useMemo(() => petStatus(state), [state]);
  const today = dayKey();
  const stats = useMemo(() => dashboard(state, today), [state, today]);
  const [room, setRoom] = useState<RoomId>('living');
  const [message, setMessage] = useState('Eve hoş geldin. Panda seni bekliyordu ♡');
  const [yaw, setYaw] = useState(0);
  const [cameraY, setCameraY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [celebrating, setCelebrating] = useState(false);
  const [petting, setPetting] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const stageRef = useRef<HTMLElement>(null);
  const dragRef = useRef<{ x: number; y: number; yaw: number; cameraY: number } | null>(null);
  const timerRef = useRef<number | null>(null);

  const qProgress = state.profile.dailyQuestionGoal > 0 ? Math.min(1, stats.todayQuestions / state.profile.dailyQuestionGoal) : 1;
  const mProgress = state.profile.dailyStudyMinutes > 0 ? Math.min(1, stats.todayMinutes / state.profile.dailyStudyMinutes) : 1;
  const progress = Math.round(((qProgress + mProgress) / 2) * 100);

  const clearTimer = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  useEffect(() => () => clearTimer(), []);
  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const enterRoom = (next: RoomId, text?: string) => {
    setRoom(next);
    setYaw(0);
    setCameraY(0);
    setZoom(1);
    setMessage(text ?? ROOM_COPY[next]);
    try { navigator.vibrate?.(18); } catch { /* noop */ }
  };

  useEffect(() => {
    const event = progressEvent(progress);
    if (!event) return;
    const mark = progress >= 100 ? 100 : progress >= 75 ? 75 : progress >= 50 ? 50 : 25;
    const key = `iyiki-panda3d-v2-progress-${today}-${mark}`;
    try {
      if (localStorage.getItem(key) === '1') return;
      localStorage.setItem(key, '1');
    } catch { /* yine göster */ }
    enterRoom(event.room, event.text);
    if (progress >= 100) {
      setCelebrating(true);
      clearTimer();
      timerRef.current = window.setTimeout(() => setCelebrating(false), 4800);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, today]);

  const feed = () => {
    if (needs.bamboo < 1) return toast('Bambu yok. 5 doğru cevapla 1 bambu kazanabilirsin.');
    if (needs.food >= 99) return toast('Panda zaten tok ♡');
    update((s) => feedPet(s));
    enterRoom('kitchen', 'Bambu zamanı! Panda afiyetle yiyor 🎋');
    setPetting(true);
    clearTimer();
    timerRef.current = window.setTimeout(() => setPetting(false), 1500);
  };

  const water = () => {
    if (needs.drops < 1) return toast('Su damlası yok. Soru çözerek su kazanabilirsin.');
    if (needs.water >= 99) return toast('Panda şu an susamıyor ♡');
    update((s) => waterPet(s));
    enterRoom('kitchen', 'Panda suyunu içti. Şimdi çok daha iyi 💧');
  };

  const petPanda = () => {
    setMessage('Panda başını sana doğru eğdi 🐼♡');
    setPetting(true);
    clearTimer();
    timerRef.current = window.setTimeout(() => setPetting(false), 1500);
    try { navigator.vibrate?.([24, 28, 24]); } catch { /* noop */ }
  };

  const onStudy = () => {
    enterRoom('study', 'Panda masaya geçti. Birlikte odaklanmaya hazırsınız 📚');
    window.setTimeout(() => { window.location.hash = '#/odak'; }, 650);
  };

  const onRelax = () => setMessage(room === 'balcony' ? 'Biraz hava almak iyi geldi 🌇♡' : 'Panda koltuğa kurulup seninle dinleniyor ☕');
  const onSleep = () => {
    setMessage('Işıklar kısıldı. Panda biraz dinleniyor 🌙');
    setPetting(false);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('button,a')) return;
    dragRef.current = { x: e.clientX, y: e.clientY, yaw, cameraY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    const d = dragRef.current;
    if (!d) return;
    setYaw(Math.max(-10, Math.min(10, d.yaw + (e.clientX - d.x) * 0.035)));
    setCameraY(Math.max(-18, Math.min(18, d.cameraY + (e.clientY - d.y) * 0.08)));
  };
  const onPointerUp = () => { dragRef.current = null; };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await stageRef.current?.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      toast('Tam ekran bu tarayıcıda kullanılamıyor.');
    }
  };

  const sceneStyle = {
    '--p3dv2-yaw': `${yaw}deg`,
    '--p3dv2-y': `${cameraY}px`,
    '--p3dv2-zoom': String(zoom),
  } as CSSProperties;

  return (
    <div className="p3dv2-page">
      <section
        ref={stageRef}
        className={`p3dv2-stage room-${room}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="p3dv2-gamebar">
          <a href="#/" className="p3dv2-round-btn" aria-label="Ana sayfa">←</a>
          <div className="p3dv2-title">
            <b>Panda Evi 3D</b>
            <span>{ROOMS.find((r) => r.id === room)?.icon} {ROOMS.find((r) => r.id === room)?.label}</span>
          </div>
          <div className="p3dv2-top-actions">
            <a href="#/pandam-klasik" className="p3dv2-mini-btn">2D</a>
            <button type="button" className="p3dv2-round-btn" onClick={() => void toggleFullscreen()} aria-label="Tam ekran">{fullscreen ? '↙' : '⛶'}</button>
          </div>
        </div>

        <div className="p3dv2-hud">
          <div className="p3dv2-profile">
            <span className="online-dot" />
            <div><b>{state.settings.pet.name}</b><small>Sv. {pet.level} · {pet.mood === 'coskulu' ? 'coşkulu' : pet.mood === 'mutlu' ? 'mutlu' : 'uykulu'}</small></div>
          </div>
          <div className="p3dv2-needs">
            <span><i>🎋</i><b>{Math.round(needs.food)}%</b></span>
            <span><i>💧</i><b>{Math.round(needs.water)}%</b></span>
            <span><i>⚡</i><b>{progress}%</b></span>
          </div>
        </div>

        <div className="p3dv2-scene-camera" style={sceneStyle}>
          <div className="p3dv2-room">
            <div className="p3dv2-back-wall" />
            <div className="p3dv2-left-wall" />
            <div className="p3dv2-right-wall" />
            <div className="p3dv2-floor"><span /><span /><span /><span /><span /><span /><span /><span /></div>

            {room === 'living' && <LivingRoom onRelax={onRelax} />}
            {room === 'kitchen' && <KitchenRoom onFeed={feed} onWater={water} />}
            {room === 'study' && <StudyRoom onStudy={onStudy} />}
            {room === 'bedroom' && <BedroomRoom onSleep={onSleep} />}
            {room === 'balcony' && <BalconyRoom onRelax={onRelax} />}

            <button className="p3dv2-panda-button" type="button" onClick={petPanda} aria-label="Pandayı sev">
              <PandaCharacter celebrating={celebrating} petting={petting} />
            </button>
            <div className="p3dv2-zeynep-anchor"><ZeynepCharacter /></div>
          </div>
        </div>

        <div className="p3dv2-dialogue" aria-live="polite">
          <span className="speaker">🐼</span>
          <div><b>{state.settings.pet.name}</b><p>{message}</p></div>
        </div>

        <div className="p3dv2-camera-tools" aria-label="Kamera">
          <button type="button" onClick={() => setZoom((z) => Math.max(.88, +(z - .06).toFixed(2)))}>−</button>
          <button type="button" onClick={() => { setYaw(0); setCameraY(0); setZoom(1); }}>◎</button>
          <button type="button" onClick={() => setZoom((z) => Math.min(1.16, +(z + .06).toFixed(2)))}>＋</button>
        </div>

        <div className="p3dv2-actions">
          <button type="button" onClick={petPanda}><span>♡</span><b>Sev</b></button>
          <button type="button" onClick={feed}><span>🎋</span><b>Besle</b></button>
          <button type="button" onClick={water}><span>💧</span><b>Su</b></button>
          <button type="button" onClick={onStudy}><span>📚</span><b>Odak</b></button>
        </div>

        <nav className="p3dv2-room-nav" aria-label="Odalar">
          {ROOMS.map((item) => (
            <button key={item.id} type="button" className={room === item.id ? 'active' : ''} onClick={() => enterRoom(item.id)} aria-pressed={room === item.id}>
              <span>{item.icon}</span><b>{item.label}</b>
            </button>
          ))}
        </nav>
      </section>

      <section className="p3dv2-day-strip">
        <div><span>Bugün</span><b>{stats.todayQuestions} soru</b></div>
        <div><span>Çalışma</span><b>{stats.todayMinutes} dk</b></div>
        <div><span>XP</span><b>+{pet.todayXp}</b></div>
        <div><span>Hedef</span><b>%{progress}</b></div>
      </section>
    </div>
  );
}
