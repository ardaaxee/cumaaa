import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { PageHeader } from '../components/Layout';
import { ProgressBar, toast } from '../components/ui';
import { update, useAppState } from '../store/store';
import { usePetNeeds } from '../hooks/usePetNeeds';
import { feedPet, waterPet } from '../utils/petCare';
import { petStatus } from '../utils/pet';
import { dashboard } from '../utils/stats';
import { dayKey } from '../utils/date';

type RoomId = 'living' | 'kitchen' | 'study' | 'bedroom' | 'balcony';

const ROOMS: { id: RoomId; icon: string; label: string; subtitle: string }[] = [
  { id: 'living', icon: '🛋️', label: 'Salon', subtitle: 'Dinlenme' },
  { id: 'kitchen', icon: '🍽️', label: 'Mutfak', subtitle: 'Yemek' },
  { id: 'study', icon: '📚', label: 'Çalışma', subtitle: 'Odak' },
  { id: 'bedroom', icon: '🛏️', label: 'Yatak', subtitle: 'Uyku' },
  { id: 'balcony', icon: '🌇', label: 'Balkon', subtitle: 'Mola' },
];

const ROOM_VIEW: Record<RoomId, { yaw: number; tilt: number; zoom: number; px: number; pz: number; zx: number; zz: number }> = {
  living: { yaw: -18, tilt: 58, zoom: 1.02, px: -116, pz: 55, zx: -62, zz: 28 },
  kitchen: { yaw: 24, tilt: 58, zoom: 1.03, px: 112, pz: 20, zx: 70, zz: 44 },
  study: { yaw: 1, tilt: 60, zoom: 1.08, px: -12, pz: -105, zx: 48, zz: -92 },
  bedroom: { yaw: -12, tilt: 56, zoom: 1.04, px: -30, pz: 128, zx: 52, zz: 118 },
  balcony: { yaw: 31, tilt: 55, zoom: 1.00, px: 134, pz: 128, zx: 88, zz: 112 },
};

function roomEvent(progress: number): { room: RoomId; message: string } | null {
  if (progress >= 100) return { room: 'living', message: 'Günlük hedef tamamlandı! Evde kutlama zamanı 🎉' };
  if (progress >= 75) return { room: 'balcony', message: 'Hedefin %75’i tamam. Balkonda kısa bir nefes molası 🌇' };
  if (progress >= 50) return { room: 'study', message: 'Yarıladın! Panda da çalışma masasına geldi 📚' };
  if (progress >= 25) return { room: 'kitchen', message: 'İlk çeyrek tamam. Küçük bir enerji molası ☕' };
  return null;
}

function Panda3D({ celebration, petting }: { celebration: boolean; petting: boolean }) {
  return (
    <div className={`p3d-panda${celebration ? ' celebrating' : ''}${petting ? ' petting' : ''}`} aria-label="3D panda">
      <div className="p3d-panda-shadow" />
      <div className="p3d-panda-body" />
      <div className="p3d-panda-leg left" />
      <div className="p3d-panda-leg right" />
      <div className="p3d-panda-arm left" />
      <div className="p3d-panda-arm right" />
      <div className="p3d-panda-head">
        <span className="p3d-ear left" />
        <span className="p3d-ear right" />
        <span className="p3d-eye-patch left"><i /></span>
        <span className="p3d-eye-patch right"><i /></span>
        <span className="p3d-nose" />
        <span className="p3d-mouth" />
      </div>
      {celebration && <div className="p3d-confetti">✦ ♡ ✨</div>}
    </div>
  );
}

function Zeynep3D() {
  return (
    <div className="p3d-zeynep" aria-label="Zeynep 3D karakter">
      <div className="p3d-z-shadow" />
      <div className="p3d-z-head">
        <span className="p3d-z-hair" />
        <span className="p3d-z-eye left" />
        <span className="p3d-z-eye right" />
        <span className="p3d-z-smile" />
      </div>
      <div className="p3d-z-body"><span>♡</span></div>
      <div className="p3d-z-leg left" />
      <div className="p3d-z-leg right" />
    </div>
  );
}

function HouseDiorama({
  room,
  yaw,
  tilt,
  zoom,
  celebration,
  petting,
}: {
  room: RoomId;
  yaw: number;
  tilt: number;
  zoom: number;
  celebration: boolean;
  petting: boolean;
}) {
  const view = ROOM_VIEW[room];
  return (
    <div className="p3d-world-wrap">
      <div
        className="p3d-world"
        style={{
          '--p3d-yaw': `${yaw}deg`,
          '--p3d-tilt': `${tilt}deg`,
          '--p3d-zoom': String(zoom),
        } as CSSProperties}
      >
        <div className="p3d-floor">
          <div className="p3d-floor-lines" />

          <section className="p3d-room p3d-living">
            <div className="p3d-wall back"><div className="p3d-window"><span>☁️</span></div><div className="p3d-tv">YKS ♡</div></div>
            <div className="p3d-wall left" />
            <div className="p3d-sofa"><i /><i /><b /></div>
            <div className="p3d-rug" />
            <div className="p3d-table"><span>☕</span></div>
            <div className="p3d-plant">🪴</div>
          </section>

          <section className="p3d-room p3d-kitchen">
            <div className="p3d-wall back"><div className="p3d-cabinets"><i /><i /><i /></div></div>
            <div className="p3d-fridge">♡</div>
            <div className="p3d-counter"><span>🥣</span></div>
            <div className="p3d-kitchen-table"><span>🍓</span></div>
          </section>

          <section className="p3d-room p3d-study">
            <div className="p3d-wall back">
              <div className="p3d-board"><b>BUGÜN</b><span>✓ konu</span><span>✓ soru</span></div>
              <div className="p3d-shelf">📕 📘<br/>📗 📓</div>
            </div>
            <div className="p3d-desk"><div className="p3d-laptop">YKS</div><span>📚</span></div>
            <div className="p3d-chair" />
            <div className="p3d-study-lamp">💡</div>
          </section>

          <section className="p3d-room p3d-bedroom">
            <div className="p3d-wall back"><div className="p3d-moon-window">☾</div></div>
            <div className="p3d-bed"><i className="pillow"/><i className="blanket"/></div>
            <div className="p3d-nightstand">♡</div>
            <div className="p3d-bedroom-rug" />
          </section>

          <section className="p3d-room p3d-balcony">
            <div className="p3d-balcony-floor" />
            <div className="p3d-rail"><i/><i/><i/><i/><i/><b/></div>
            <div className="p3d-balcony-seat">🌿</div>
            <div className="p3d-balcony-plant">🪴</div>
            <div className="p3d-sunset">☀</div>
          </section>

          <div
            className="p3d-character-anchor panda"
            style={{ transform: `translate3d(${view.px}px,-34px,${view.pz}px)` }}
          >
            <Panda3D celebration={celebration} petting={petting} />
          </div>
          <div
            className="p3d-character-anchor zeynep"
            style={{ transform: `translate3d(${view.zx}px,-32px,${view.zz}px)` }}
          >
            <Zeynep3D />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Panda3DPage() {
  const state = useAppState();
  const needs = usePetNeeds();
  const pet = useMemo(() => petStatus(state), [state]);
  const today = dayKey();
  const stats = useMemo(() => dashboard(state, today), [state, today]);
  const [room, setRoom] = useState<RoomId>('living');
  const [yaw, setYaw] = useState(ROOM_VIEW.living.yaw);
  const [tilt, setTilt] = useState(ROOM_VIEW.living.tilt);
  const [zoom, setZoom] = useState(ROOM_VIEW.living.zoom);
  const [sceneMessage, setSceneMessage] = useState('3D eve hoş geldin ♡');
  const [fullscreen, setFullscreen] = useState(false);
  const [celebration, setCelebration] = useState(false);
  const [petting, setPetting] = useState(false);
  const dragRef = useRef<{ x: number; y: number; yaw: number; tilt: number } | null>(null);
  const stageRef = useRef<HTMLElement>(null);
  const timerRef = useRef<number | null>(null);

  const qProgress = state.profile.dailyQuestionGoal > 0 ? Math.min(1, stats.todayQuestions / state.profile.dailyQuestionGoal) : 1;
  const mProgress = state.profile.dailyStudyMinutes > 0 ? Math.min(1, stats.todayMinutes / state.profile.dailyStudyMinutes) : 1;
  const dailyProgress = Math.round(((qProgress + mProgress) / 2) * 100);

  const clearAnim = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  useEffect(() => () => clearAnim(), []);

  useEffect(() => {
    const onFullscreen = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreen);
    return () => document.removeEventListener('fullscreenchange', onFullscreen);
  }, []);

  const go = (id: RoomId, message?: string) => {
    setRoom(id);
    const v = ROOM_VIEW[id];
    setYaw(v.yaw);
    setTilt(v.tilt);
    setZoom(v.zoom);
    const info = ROOMS.find((r) => r.id === id)!;
    setSceneMessage(message ?? `${info.icon} ${info.label} · ${info.subtitle}`);
  };

  useEffect(() => {
    const event = roomEvent(dailyProgress);
    if (!event) return;
    const mark = dailyProgress >= 100 ? 100 : dailyProgress >= 75 ? 75 : dailyProgress >= 50 ? 50 : 25;
    const key = `iyiki-panda3d-progress-${today}-${mark}`;
    try {
      if (localStorage.getItem(key) === '1') return;
      localStorage.setItem(key, '1');
    } catch { /* olay yine gösterilir */ }
    go(event.room, event.message);
    if (dailyProgress >= 100) {
      setCelebration(true);
      clearAnim();
      timerRef.current = window.setTimeout(() => setCelebration(false), 4200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyProgress, today]);

  const onPointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('button,a')) return;
    dragRef.current = { x: e.clientX, y: e.clientY, yaw, tilt };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    const d = dragRef.current;
    if (!d) return;
    setYaw(Math.max(-55, Math.min(55, d.yaw + (e.clientX - d.x) * 0.16)));
    setTilt(Math.max(42, Math.min(70, d.tilt - (e.clientY - d.y) * 0.09)));
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const feed = () => {
    if (needs.bamboo < 1) return toast('Bambu yok. 5 doğru cevapla 1 bambu kazanabilirsin.');
    if (needs.food >= 99) return toast('Panda zaten tok ♡');
    update((s) => feedPet(s));
    go('kitchen', 'Panda bambusunu afiyetle yiyor 🎋');
    setPetting(true);
    clearAnim();
    timerRef.current = window.setTimeout(() => setPetting(false), 1400);
  };

  const water = () => {
    if (needs.drops < 1) return toast('Su damlası yok. Soru çözerek kazanabilirsin.');
    if (needs.water >= 99) return toast('Panda şu an susamıyor ♡');
    update((s) => waterPet(s));
    go('kitchen', 'Panda suyunu içti 💧');
  };

  const petPanda = () => {
    setSceneMessage('Panda seni görünce mutlu oldu 🐼♡');
    setPetting(true);
    clearAnim();
    timerRef.current = window.setTimeout(() => setPetting(false), 1450);
    try { navigator.vibrate?.(35); } catch { /* noop */ }
  };

  const toggleFullscreen = async () => {
    const el = stageRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) await el.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      toast('Tam ekran bu tarayıcıda kullanılamıyor.');
    }
  };

  return (
    <div className="panda3d-page">
      <PageHeader
        title="Panda Evi 3D"
        sub="Yaşayan 3D çalışma evi · dokun ve döndür"
        actions={<a className="btn small ghost" href="#/pandam-klasik">2D klasik</a>}
      />

      <section
        className="panda3d-stage p3d-self-contained"
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="panda3d-top-hud">
          <div className="panda3d-status">
            <span className="panda3d-live-dot" />
            <div>
              <b>{state.settings.pet.name} · Sv. {pet.level}</b>
              <small>{sceneMessage}</small>
            </div>
          </div>
          <button className="panda3d-icon-btn" type="button" onClick={() => void toggleFullscreen()} aria-label="Tam ekran">
            {fullscreen ? '↙' : '⛶'}
          </button>
        </div>

        <div className="p3d-sky" aria-hidden="true"><span className="sun">☀</span><i className="cloud one">☁</i><i className="cloud two">☁</i></div>
        <HouseDiorama room={room} yaw={yaw} tilt={tilt} zoom={zoom} celebration={celebration} petting={petting} />

        <div className="p3d-zoom-control">
          <button type="button" onClick={() => setZoom((z) => Math.max(.82, z - .08))} aria-label="Uzaklaş">−</button>
          <button type="button" onClick={() => { const v = ROOM_VIEW[room]; setYaw(v.yaw); setTilt(v.tilt); setZoom(v.zoom); }} aria-label="Kamerayı sıfırla">◎</button>
          <button type="button" onClick={() => setZoom((z) => Math.min(1.3, z + .08))} aria-label="Yakınlaş">＋</button>
        </div>

        <div className="panda3d-roombar" role="navigation" aria-label="3D ev odaları">
          {ROOMS.map((item) => (
            <button key={item.id} type="button" className={room === item.id ? 'active' : ''} onClick={() => go(item.id)} aria-pressed={room === item.id}>
              <span>{item.icon}</span>
              <b>{item.label}</b>
            </button>
          ))}
        </div>
      </section>

      <section className="panda3d-dashboard section">
        <div className="card panda3d-needs">
          <div className="row between nowrap">
            <div>
              <div className="eyebrow">Panda durumu</div>
              <h2>{state.settings.pet.name} bugün nasıl?</h2>
            </div>
            <span className="badge brand">{pet.mood === 'coskulu' ? '🎉 Coşkulu' : pet.mood === 'mutlu' ? '♡ Mutlu' : '🌙 Uykulu'}</span>
          </div>

          <div className="panda3d-meter">
            <div className="row between nowrap"><span>🎋 Tokluk</span><b>%{Math.round(needs.food)}</b></div>
            <ProgressBar value={needs.food} label="Panda tokluk" />
          </div>
          <div className="panda3d-meter">
            <div className="row between nowrap"><span>💧 Su</span><b>%{Math.round(needs.water)}</b></div>
            <ProgressBar value={needs.water} label="Panda su" />
          </div>

          <div className="panda3d-action-grid">
            <button type="button" className="btn primary" onClick={feed}>🎋 Besle <small>{needs.bamboo}</small></button>
            <button type="button" className="btn" onClick={water}>💧 Su ver <small>{needs.drops}</small></button>
            <button type="button" className="btn" onClick={petPanda}>♡ Sev</button>
            <button type="button" className="btn" onClick={() => go('study', 'Panda seninle çalışma masasına geldi 📚')}>📚 Birlikte çalış</button>
          </div>
        </div>

        <div className="card panda3d-progress-card">
          <div className="eyebrow">Ev bugün seninle yaşıyor</div>
          <div className="panda3d-progress-number">%{dailyProgress}</div>
          <h2>Günlük çalışma ilerlemesi</h2>
          <ProgressBar value={dailyProgress} label="Günlük çalışma ilerlemesi" />
          <div className="panda3d-milestones">
            <div className={dailyProgress >= 25 ? 'done' : ''}><span>25</span><small>☕ Mutfak molası</small></div>
            <div className={dailyProgress >= 50 ? 'done' : ''}><span>50</span><small>📚 Birlikte çalışma</small></div>
            <div className={dailyProgress >= 75 ? 'done' : ''}><span>75</span><small>🌇 Balkon molası</small></div>
            <div className={dailyProgress >= 100 ? 'done' : ''}><span>100</span><small>🎉 Kutlama</small></div>
          </div>
          <p className="tiny muted">{stats.todayQuestions} soru · {stats.todayMinutes} dk çalışma · bugün {pet.todayXp} XP</p>
        </div>
      </section>
    </div>
  );
}
