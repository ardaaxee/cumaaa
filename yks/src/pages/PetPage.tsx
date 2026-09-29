import { useEffect, useMemo, useRef, useState } from 'react';
import { PageHeader } from '../components/Layout';
import { PandaBody } from '../components/MascotNav';
import { Icon } from '../components/Icon';
import { ProgressBar, toast } from '../components/ui';
import { updateSettings } from '../store/actions';
import { update, useAppState } from '../store/store';
import { PET_ITEMS, petStatus } from '../utils/pet';
import { usePetNeeds } from '../hooks/usePetNeeds';
import { FOOD_PER_BAMBOO, WATER_PER_DROP, feedPet, needsMessage, waterPet } from '../utils/petCare';
import { PetNotifyToggle } from '../hooks/usePetAlerts';
import { dashboard } from '../utils/stats';
import { dayKey } from '../utils/date';

const EARN_RULES = [
  ['🎋 1 bambu', '5 doğru cevap'],
  ['🎋 1 bambu', 'bitirdiğin her test'],
  ['🎋 2 bambu', 'tamamladığın her konu'],
  ['💧 1 damla', '4 cevaplanan soru'],
  ['💧 1 damla', '15 dk çalışma'],
  ['💧 1 damla', '10 bilgi kartı tekrarı'],
];

const HOUSE_UPGRADES = [
  { level: 1, icon: '🏠', label: 'Salon + mutfak' },
  { level: 2, icon: '📚', label: 'Çalışma odası' },
  { level: 3, icon: '🛁', label: 'Banyo detayları' },
  { level: 4, icon: '🛏️', label: 'Yatak odası' },
  { level: 6, icon: '🌿', label: 'Bahçe alanı' },
  { level: 8, icon: '🌙', label: 'Gece aydınlatması' },
  { level: 10, icon: '🏆', label: 'Başarı duvarı' },
];

type HouseRoom = 'living' | 'kitchen' | 'bedroom' | 'bathroom' | 'study' | 'garden';
type HouseActivity =
  | 'idle'
  | 'walking'
  | 'waiting'
  | 'eating'
  | 'drinking'
  | 'sleeping'
  | 'bathing'
  | 'playing'
  | 'studying'
  | 'relaxing';

type ZeynepActivity = 'idle' | 'walking' | 'cooking' | 'serving';

const ROOM_INFO: Record<HouseRoom, { icon: string; label: string; desc: string }> = {
  living: { icon: '🛋️', label: 'Salon', desc: 'Dinlenme, TV ve oyun alanı' },
  kitchen: { icon: '🍽️', label: 'Mutfak', desc: 'Zeynep burada yemek hazırlıyor' },
  bedroom: { icon: '🛏️', label: 'Yatak odası', desc: 'Uyku ve gece rutini' },
  bathroom: { icon: '🛁', label: 'Banyo', desc: 'Temizlik ve bakım' },
  study: { icon: '📚', label: 'Çalışma odası', desc: 'Ders ve odak köşesi' },
  garden: { icon: '🌿', label: 'Bahçe', desc: 'Oyun, yürüyüş ve hava alma' },
};

function Meter({ label, value, kind }: { label: string; value: number; kind: 'food' | 'water' }) {
  const v = Math.round(value);
  return (
    <div className={'need-meter ' + kind + (v < 35 ? ' low' : '')}>
      <div className="row between nowrap small">
        <b>{label}</b>
        <span>%{v}</span>
      </div>
      <div className="need-bar" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={v}>
        <span style={{ width: v + '%' }} />
      </div>
    </div>
  );
}

const XP_RULES = [
  ['Cevapladığın her soru', '+2 XP'],
  ['Her doğru cevap', '+1 XP'],
  ['Her çalışma dakikası', '+1 XP'],
  ['Her bilgi kartı tekrarı', '+1 XP'],
  ['Bitirdiğin her test', '+5 XP'],
  ['Tamamladığın her konu', '+20 XP'],
  ['Kaydettiğin her deneme', '+30 XP'],
];

function activityText(activity: HouseActivity, room: HouseRoom, name: string): string {
  if (activity === 'walking') return name + ' ' + ROOM_INFO[room].label.toLowerCase() + ' tarafına yürüyor…';
  if (activity === 'waiting') return name + ' mutfakta Zeynep’i bekliyor 🍽️';
  if (activity === 'eating') return name + ' mutfak masasında yemeğini yiyor 🎋';
  if (activity === 'drinking') return name + ' mutfakta suyunu içiyor 💧';
  if (activity === 'sleeping') return name + ' yatağına kıvrıldı. Tatlı rüyalar 🌙';
  if (activity === 'bathing') return name + ' banyoda köpüklü bakım yapıyor 🫧';
  if (activity === 'playing') return name + ' bahçede oynuyor ve temiz hava alıyor 🌿';
  if (activity === 'studying') return name + ' çalışma odasında seninle ders çalışıyor 📚';
  if (activity === 'relaxing') return name + ' salonda koltuğa kuruldu 🛋️';
  return name + ' şu an ' + ROOM_INFO[room].label.toLowerCase() + 'da.';
}

export default function PetPage() {
  const state = useAppState();
  const pet = state.settings.pet;
  const p = useMemo(() => petStatus(state), [state]);
  const needs = usePetNeeds();
  const [holding, setHolding] = useState<'bambu' | 'su' | null>(null);
  const [room, setRoom] = useState<HouseRoom>('living');
  const [activity, setActivity] = useState<HouseActivity>('idle');
  const [zeynepRoom, setZeynepRoom] = useState<HouseRoom>('living');
  const [zeynepActivity, setZeynepActivity] = useState<ZeynepActivity>('idle');
  const [roomMode, setRoomMode] = useState<'day' | 'night'>(() => {
    const h = new Date().getHours();
    return h >= 19 || h < 7 ? 'night' : 'day';
  });
  const [hearts, setHearts] = useState(0);
  const [cleanliness, setCleanliness] = useState(82);
  const [energy, setEnergy] = useState(76);
  const [happiness, setHappiness] = useState(84);
  const [sceneMessage, setSceneMessage] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  const sad = needs.hungry || needs.thirsty;
  const need = needsMessage(pet.name, needs);

  const clearTimers = () => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  };

  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  };

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    if (activity !== 'idle') return;
    const choices: HouseRoom[] = ['living', 'kitchen', 'study', 'garden'];
    const id = window.setInterval(() => {
      const next = choices[Math.floor(Math.random() * choices.length)];
      setActivity('walking');
      setRoom(next);
      const done = window.setTimeout(() => setActivity('idle'), 1100);
      timers.current.push(done);
    }, 14000);
    return () => window.clearInterval(id);
  }, [activity]);

  const moveTo = (nextRoom: HouseRoom, nextActivity: HouseActivity = 'idle', message?: string) => {
    clearTimers();
    setHolding(null);
    setActivity('walking');
    setRoom(nextRoom);
    setSceneMessage(message ?? null);
    later(() => {
      setActivity(nextActivity);
      if (nextActivity === 'idle') setSceneMessage(null);
    }, 1050);
  };

  const kitchenGive = (kind: 'bambu' | 'su') => {
    const full = kind === 'bambu' ? needs.food >= 100 : needs.water >= 100;
    const have = kind === 'bambu' ? needs.bamboo : needs.drops;
    if (full) return toast(kind === 'bambu' ? pet.name + ' şu an tok ♡' : pet.name + ' şu an susamamış ♡');
    if (have < 1) {
      return toast(kind === 'bambu' ? 'Bambun kalmadı. 5 doğru cevap = 1 bambu 🎋' : 'Suyun kalmadı. 4 soru çöz = 1 damla su 💧');
    }

    clearTimers();
    setActivity('walking');
    setRoom('kitchen');
    setZeynepActivity('walking');
    setZeynepRoom('kitchen');
    setSceneMessage('Zeynep mutfağa gidiyor. ' + pet.name + ' da onu takip ediyor…');

    later(() => {
      setActivity('waiting');
      setZeynepActivity('cooking');
      setSceneMessage(kind === 'bambu' ? 'Zeynep bambuyu hazırlıyor 🎋' : 'Zeynep su kabını hazırlıyor 💧');
    }, 1050);

    later(() => {
      update((s) => (kind === 'bambu' ? feedPet(s) : waterPet(s)));
      setHolding(kind);
      setActivity(kind === 'bambu' ? 'eating' : 'drinking');
      setZeynepActivity('serving');
      setSceneMessage(kind === 'bambu' ? 'Zeynep yemeği verdi. Afiyet olsun ♡' : 'Zeynep suyunu verdi. Ohh, ferahladı ♡');
      setHappiness((v) => Math.min(100, v + 5));
    }, 2300);

    later(() => {
      setHolding(null);
      setActivity('idle');
      setZeynepActivity('idle');
      setSceneMessage(null);
      toast(kind === 'bambu' ? 'Zeynep mutfakta yemeğini verdi 🎋' : 'Zeynep mutfakta suyunu verdi 💧');
    }, 5200);
  };

  const bath = () => {
    clearTimers();
    setActivity('walking');
    setRoom('bathroom');
    setSceneMessage(pet.name + ' banyoya gidiyor…');
    later(() => {
      setActivity('bathing');
      setSceneMessage('Ilık su, köpükler ve hızlı bir bakım 🫧');
    }, 1050);
    later(() => {
      setCleanliness(100);
      setHappiness((v) => Math.min(100, v + 4));
      setActivity('idle');
      setSceneMessage(pet.name + ' tertemiz oldu ✨');
      toast(pet.name + ' banyosunu yaptı 🫧');
    }, 5200);
    later(() => setSceneMessage(null), 7000);
  };

  const sleep = () => {
    if (activity === 'sleeping') {
      clearTimers();
      setActivity('idle');
      setEnergy((v) => Math.max(v, 88));
      setSceneMessage('Günaydın! ' + pet.name + ' uyandı ☀️');
      later(() => setSceneMessage(null), 2200);
      return;
    }
    clearTimers();
    setActivity('walking');
    setRoom('bedroom');
    setSceneMessage(pet.name + ' yatak odasına gidiyor…');
    later(() => {
      setActivity('sleeping');
      setRoomMode('night');
      setSceneMessage('Işıklar kısıldı. ' + pet.name + ' uyuyor 🌙');
    }, 1100);
    later(() => setEnergy(100), 5200);
  };

  const garden = () => {
    moveTo('garden', 'playing', 'Bahçe zamanı! Biraz koşup hava alsın 🌿');
    later(() => {
      setHappiness(100);
      setEnergy((v) => Math.max(35, v - 4));
      setActivity('idle');
      setSceneMessage(null);
    }, 6200);
  };

  const studyTogether = () => {
    moveTo('study', 'studying', 'Çalışma odasına geçiyoruz. Panda da masasına oturacak 📚');
    later(() => setHappiness((v) => Math.min(100, v + 2)), 3000);
    later(() => {
      setActivity('idle');
      setSceneMessage(null);
    }, 6500);
  };

  const relax = () => {
    moveTo('living', 'relaxing', 'Salonda kısa bir mola zamanı 🛋️');
    later(() => setEnergy((v) => Math.min(100, v + 5)), 3000);
    later(() => {
      setActivity('idle');
      setSceneMessage(null);
    }, 5600);
  };

  const petPanda = () => {
    setHearts((v) => v + 1);
    setHappiness((v) => Math.min(100, v + 3));
    toast(pet.name + ' çok mutlu oldu ♡');
  };

  const [name, setName] = useState(pet.name);
  const nextItem = PET_ITEMS.find((i) => i.level > p.level);
  const nextUpgrade = HOUSE_UPGRADES.find((i) => i.level > p.level);
  const pct = ((p.xp - p.levelStartXp) / Math.max(1, p.nextLevelXp - p.levelStartXp)) * 100;
  const unlocked = HOUSE_UPGRADES.filter((i) => i.level <= p.level).length;
  const housePct = (unlocked / HOUSE_UPGRADES.length) * 100;
  const roomMessage = sceneMessage || activityText(activity, room, pet.name) || need || p.moodText;

  const today = dayKey();
  const d = dashboard(state, today);
  const doneTasks = state.tasks.filter((t) => t.date === today && t.done).length;
  const questQuestions = Math.max(10, Math.min(30, Math.round(state.profile.dailyQuestionGoal * 0.35)));
  const questMinutes = Math.max(20, Math.min(60, Math.round(state.profile.dailyStudyMinutes * 0.25)));
  const quests = [
    { icon: '⚡', label: questQuestions + ' soru çöz', current: Math.min(questQuestions, d.todayQuestions), target: questQuestions, done: d.todayQuestions >= questQuestions, reward: '+ çalışma XP' },
    { icon: '⏱️', label: questMinutes + ' dk odaklan', current: Math.min(questMinutes, d.todayMinutes), target: questMinutes, done: d.todayMinutes >= questMinutes, reward: '+ ev enerjisi' },
    { icon: '✓', label: '1 plan görevi bitir', current: Math.min(1, doneTasks), target: 1, done: doneTasks >= 1, reward: '+ seri desteği' },
  ];
  const questDone = quests.filter((q) => q.done).length;

  const toggle = (id: string) =>
    update((s) => {
      const items = s.settings.pet.items.includes(id) ? s.settings.pet.items.filter((x) => x !== id) : [...s.settings.pet.items, id];
      return updateSettings(s, { pet: { ...s.settings.pet, items } });
    });

  return (
    <>
      <PageHeader
        title={pet.name + '’nın evi'}
        sub="Salon · mutfak · yatak odası · banyo · çalışma odası · bahçe"
        actions={
          <button type="button" className="btn small" onClick={() => setRoomMode((m) => (m === 'day' ? 'night' : 'day'))}>
            {roomMode === 'day' ? '🌙 Gece' : '☀️ Gündüz'}
          </button>
        }
      />

      <section className={'panda-home ' + roomMode + ' mood-' + p.mood} aria-label={pet.name + ' yaşayan panda evi'}>
        <div className="panda-home-head">
          <div>
            <div className="eyebrow">Canlı ev</div>
            <h2>{ROOM_INFO[room].icon} {ROOM_INFO[room].label}</h2>
            <p>{ROOM_INFO[room].desc}</p>
          </div>
          <div className="home-status-pills">
            <span>🎋 %{Math.round(needs.food)}</span>
            <span>💧 %{Math.round(needs.water)}</span>
            <span>✨ %{cleanliness}</span>
            <span>⚡ %{energy}</span>
            <span>♡ %{happiness}</span>
          </div>
        </div>

        <div className="home-scene">
          <button className="house-room living" type="button" onClick={() => moveTo('living', 'relaxing')}>
            <span className="house-room-label">🛋️ Salon</span>
            <span className="furniture couch">▰</span>
            <span className="furniture tv">▣</span>
            <span className="furniture rug" />
            <span className="furniture plant">🪴</span>
          </button>

          <button className="house-room kitchen" type="button" onClick={() => moveTo('kitchen')}>
            <span className="house-room-label">🍽️ Mutfak</span>
            <span className="furniture fridge">▥</span>
            <span className="furniture counter">▰▰</span>
            <span className="furniture table">◯</span>
            <span className="furniture bowl">🥣</span>
          </button>

          <button className="house-room bedroom" type="button" onClick={sleep}>
            <span className="house-room-label">🛏️ Yatak odası</span>
            <span className="furniture bed">▰</span>
            <span className="furniture pillow">♡</span>
            <span className="furniture wardrobe">▥</span>
            <span className="furniture bedside">☾</span>
          </button>

          <button className="house-room study" type="button" onClick={studyTogether}>
            <span className="house-room-label">📚 Çalışma odası</span>
            <span className="furniture desk">▰</span>
            <span className="furniture books">📚</span>
            <span className="furniture chair">⌑</span>
            <span className="furniture board">✓ 25 soru</span>
          </button>

          <button className="house-room bathroom" type="button" onClick={bath}>
            <span className="house-room-label">🛁 Banyo</span>
            <span className="furniture tub">▰</span>
            <span className="furniture bubbles">🫧</span>
            <span className="furniture sink">◒</span>
            <span className="furniture mirror">◯</span>
          </button>

          <button className="house-room garden" type="button" onClick={garden}>
            <span className="house-room-label">🌿 Bahçe</span>
            <span className="furniture tree">🌳</span>
            <span className="furniture flowers">🌷 🌼</span>
            <span className="furniture bench">▰</span>
            <span className="furniture path" />
          </button>

          <div className="house-hall" aria-hidden="true">
            <span>⌂</span>
          </div>

          <button type="button" className={'house-panda room-' + room + ' activity-' + activity} onClick={petPanda} aria-label={pet.name + ' pandayı sev'}>
            <PandaBody
              size={128}
              items={pet.items}
              sleepy={activity === 'sleeping'}
              waving={!sad && activity !== 'sleeping' && activity !== 'bathing'}
              sad={!holding && sad}
              holding={holding}
            />
            {hearts > 0 && <span key={hearts} className="house-heart" aria-hidden="true">♡</span>}
            {activity === 'sleeping' && <span className="sleep-z">Z z</span>}
            {activity === 'bathing' && <span className="bath-foam">🫧</span>}
          </button>

          <div className={'house-zeynep room-' + zeynepRoom + ' z-' + zeynepActivity} aria-label="Zeynep">
            <span className="zeynep-avatar" aria-hidden="true">👩🏻</span>
            <b>Zeynep</b>
            {zeynepActivity === 'cooking' && <span className="zeynep-action">🍳</span>}
            {zeynepActivity === 'serving' && <span className="zeynep-action">🍽️</span>}
          </div>

          <div className="house-message" aria-live="polite">
            <b>{pet.name}</b>
            <span>{roomMessage}</span>
          </div>
        </div>

        <div className="house-room-nav" aria-label="Ev odaları">
          {(Object.keys(ROOM_INFO) as HouseRoom[]).map((id) => (
            <button key={id} type="button" className={room === id ? 'active' : ''} onClick={() => moveTo(id)}>
              <span>{ROOM_INFO[id].icon}</span>
              <b>{ROOM_INFO[id].label}</b>
            </button>
          ))}
        </div>

        <div className="house-actions" aria-label="Panda günlük yaşam eylemleri">
          <button type="button" className="house-action food" onClick={() => kitchenGive('bambu')}>
            <span>🍳</span><b>Zeynep yemek versin</b><small>Mutfağa gider · 🎋 {needs.bamboo}</small>
          </button>
          <button type="button" className="house-action water" onClick={() => kitchenGive('su')}>
            <span>💧</span><b>Su içir</b><small>Mutfağa gider · {needs.drops} damla</small>
          </button>
          <button type="button" className="house-action" onClick={sleep}>
            <span>🛏️</span><b>{activity === 'sleeping' ? 'Uyandır' : 'Uyut'}</b><small>Yatak odası</small>
          </button>
          <button type="button" className="house-action" onClick={bath}>
            <span>🛁</span><b>Banyo yaptır</b><small>Temizlik %{cleanliness}</small>
          </button>
          <button type="button" className="house-action" onClick={garden}>
            <span>🌿</span><b>Bahçeye çıkar</b><small>Oynasın · yürüsün</small>
          </button>
          <button type="button" className="house-action" onClick={studyTogether}>
            <span>📚</span><b>Birlikte çalış</b><small>Çalışma odası</small>
          </button>
          <button type="button" className="house-action" onClick={relax}>
            <span>🛋️</span><b>Salonda dinlen</b><small>Kısa mola</small>
          </button>
        </div>

        <div className="room-hud">
          <div className="room-level">
            <span>Seviye</span>
            <b>{p.level}</b>
          </div>
          <div className="room-hud-main">
            <div className="row between nowrap">
              <span className="tiny muted">Ev gelişimi</span>
              <b className="small">{unlocked}/{HOUSE_UPGRADES.length}</b>
            </div>
            <ProgressBar value={housePct} label="Ev gelişimi" />
          </div>
          <div className="room-hud-resources">
            <span>🎋 {needs.bamboo}</span>
            <span>💧 {needs.drops}</span>
          </div>
        </div>
      </section>

      <section className="card section panda-quest-card" aria-labelledby="quest-h">
        <div className="card-head">
          <div>
            <div className="eyebrow">Günlük görevler</div>
            <h2 id="quest-h">{pet.name} ile bugünün mini görevleri</h2>
          </div>
          <span className={'badge ' + (questDone === quests.length ? 'ok' : 'brand')}>{questDone}/{quests.length}</span>
        </div>
        <div className="panda-quests">
          {quests.map((q) => (
            <div className={'panda-quest ' + (q.done ? 'done' : '')} key={q.label}>
              <span className="panda-quest-icon" aria-hidden="true">{q.done ? '✓' : q.icon}</span>
              <span className="grow">
                <b>{q.label}</b>
                <small>{q.reward}</small>
                <ProgressBar value={(q.current / Math.max(1, q.target)) * 100} label={q.label} />
              </span>
              <span className="tiny muted">{q.current}/{q.target}</span>
            </div>
          ))}
        </div>
        {questDone === quests.length ? (
          <div className="panda-quest-complete">🎉 Bugünün görevleri tamamlandı. {pet.name} çok mutlu!</div>
        ) : (
          <a className="btn small primary mt-12" href="#/koc">Akıllı Koç ile devam et</a>
        )}
      </section>

      <section className="pet-dashboard section">
        <div className="card pet-care-card">
          <div className="card-head">
            <div>
              <div className="eyebrow">Bakım</div>
              <h2>Günlük ihtiyaçları</h2>
            </div>
            <span className={'badge ' + (sad ? 'warn' : 'ok')}>{sad ? 'İlgilenmen gerekiyor' : 'Keyfi yerinde'}</span>
          </div>
          <Meter label="Tokluk 🎋" value={needs.food} kind="food" />
          <Meter label="Su 💧" value={needs.water} kind="water" />
          <div className="life-meter-grid">
            <div><span>Temizlik</span><b>%{cleanliness}</b></div>
            <div><span>Enerji</span><b>%{energy}</b></div>
            <div><span>Mutluluk</span><b>%{happiness}</b></div>
          </div>
          <div className="pet-actions">
            <button type="button" className="btn primary" onClick={() => kitchenGive('bambu')}>🍳 Zeynep yemek versin</button>
            <button type="button" className="btn" onClick={bath}>🛁 Banyo</button>
            <button type="button" className="btn ghost" onClick={petPanda}>♡ Sev</button>
          </div>
        </div>

        <div className="card pet-growth-card">
          <div className="card-head">
            <div>
              <div className="eyebrow">Gelişim</div>
              <h2>Seviye {p.level}</h2>
            </div>
            <span className="badge brand">{p.todayXp} XP bugün</span>
          </div>
          <ProgressBar value={pct} label="Seviye ilerlemesi" />
          <p className="small muted">{p.xp} XP · sonraki seviyeye {Math.max(0, p.nextLevelXp - p.xp)} XP</p>
          <div className="pet-next-unlock">
            <span className="pet-next-icon">{nextUpgrade?.icon ?? '✨'}</span>
            <div className="grow">
              <b>{nextUpgrade ? 'Sıradaki ev geliştirmesi' : 'Ev tamamen gelişti'}</b>
              <span>{nextUpgrade ? 'Seviye ' + nextUpgrade.level + ': ' + nextUpgrade.label : 'Tüm ev geliştirmeleri açık.'}</span>
            </div>
          </div>
          {nextItem && <div className="tiny muted mt-8">Aksesuar: Seviye {nextItem.level}’de {nextItem.icon} {nextItem.label} açılır.</div>}
        </div>
      </section>

      <section className="card section" aria-labelledby="room-h">
        <div className="card-head">
          <div>
            <div className="eyebrow">Ev gelişimi</div>
            <h2 id="room-h">Açılan alanlar ve geliştirmeler</h2>
          </div>
          <span className="badge brand">%{Math.round(housePct)}</span>
        </div>
        <div className="room-unlocks">
          {HOUSE_UPGRADES.map((item) => {
            const open = item.level <= p.level;
            return (
              <div key={item.label} className={'room-unlock ' + (open ? 'open' : 'locked')}>
                <span aria-hidden="true">{open ? item.icon : '🔒'}</span>
                <b>{item.label}</b>
                <small>{open ? 'Aktif' : 'Seviye ' + item.level}</small>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card section" aria-labelledby="items-h">
        <div className="card-head">
          <div>
            <div className="eyebrow">Gardırop</div>
            <h2 id="items-h">Pandanı giydir</h2>
          </div>
          <span className="tiny muted">Birden fazla aksesuar takabilirsin</span>
        </div>
        <div className="pet-items">
          {PET_ITEMS.map((i) => {
            const open = i.level <= p.level;
            const on = pet.items.includes(i.id);
            return (
              <button
                key={i.id}
                type="button"
                className={'pet-item' + (on ? ' on' : '') + (open ? '' : ' locked')}
                aria-pressed={on}
                disabled={!open}
                onClick={() => toggle(i.id)}
              >
                <span className="pet-item-icon" aria-hidden="true">{open ? i.icon : '🔒'}</span>
                <b>{i.label}</b>
                <span className="tiny muted">{open ? (on ? 'Takılı' : 'Tak') : 'Seviye ' + i.level}</span>
              </button>
            );
          })}
        </div>
      </section>

      <details className="card section pet-details">
        <summary>
          <span>
            <b>Bakım ve XP kuralları</b>
            <small>Bambu, su ve seviye sistemi nasıl çalışıyor?</small>
          </span>
          <Icon name="right" />
        </summary>
        <div className="pet-rule-grid">
          <section aria-labelledby="care-h">
            <h3 id="care-h">Yemek ve su</h3>
            <ul className="list">
              {EARN_RULES.map(([k, v]) => (
                <li key={k + v} className="list-item">
                  <b className="small">{k}</b>
                  <span className="grow small">{v}</span>
                </li>
              ))}
            </ul>
            <p className="tiny muted mt-8">
              Bir bambu tokluğu %{FOOD_PER_BAMBOO}, bir damla su %{WATER_PER_DROP} artırır. Tokluk yaklaşık 30 saatte, su 20 saatte azalır.
            </p>
            <PetNotifyToggle />
          </section>

          <section aria-labelledby="xp-h">
            <h3 id="xp-h">XP kazanma</h3>
            <ul className="list">
              {XP_RULES.map(([k, v]) => (
                <li key={k} className="list-item">
                  <span className="grow small">{k}</span>
                  <b className="small">{v}</b>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </details>

      <section className="card section pet-name-card" aria-labelledby="name-h">
        <div>
          <div className="eyebrow">Kimlik</div>
          <h2 id="name-h">Pandanın adını değiştir</h2>
          <p className="small muted">Bu isim evde, ana sayfada ve bakım bildirimlerinde görünür.</p>
        </div>
        <form
          className="chat-form"
          onSubmit={(e) => {
            e.preventDefault();
            const n = name.trim().slice(0, 20);
            if (!n) return;
            update((s) => updateSettings(s, { pet: { ...s.settings.pet, name: n } }));
            toast('Pandanın yeni adı: ' + n + ' ♡');
          }}
        >
          <input className="input" value={name} maxLength={20} onChange={(e) => setName(e.target.value)} aria-label="Panda adı" />
          <button type="submit" className="btn primary">Kaydet</button>
        </form>
      </section>
    </>
  );
}
