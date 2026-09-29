import { useMemo, useRef, useState } from 'react';
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

const ROOM_UNLOCKS = [
  { level: 1, icon: '🪴', label: 'Bambu köşesi' },
  { level: 2, icon: '📚', label: 'Çalışma masası' },
  { level: 4, icon: '🛋️', label: 'Okuma köşesi' },
  { level: 6, icon: '🧸', label: 'Oyuncak rafı' },
  { level: 8, icon: '🌙', label: 'Gece lambası' },
  { level: 10, icon: '🏆', label: 'Başarı rafı' },
];

type RoomActivity = 'idle' | 'study' | 'rest' | 'window' | 'play' | 'snack';

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

function activityText(activity: RoomActivity, name: string): string {
  if (activity === 'study') return name + ' masasını hazırladı. Birlikte kısa bir çalışma yapalım 📚';
  if (activity === 'rest') return name + ' biraz dinleniyor. Molalar da planın bir parçası 😴';
  if (activity === 'window') return name + ' pencereden dışarı bakıyor. Küçük bir nefes molası 🌤️';
  if (activity === 'play') return name + ' oyuncak köşesinde keyfi yerinde 🧸';
  if (activity === 'snack') return name + ' bambu köşesine geçti 🎋';
  return '';
}

export default function PetPage() {
  const state = useAppState();
  const pet = state.settings.pet;
  const p = useMemo(() => petStatus(state), [state]);
  const needs = usePetNeeds();
  const [holding, setHolding] = useState<'bambu' | 'su' | null>(null);
  const [activity, setActivity] = useState<RoomActivity>('idle');
  const [roomMode, setRoomMode] = useState<'day' | 'night'>(() => {
    const h = new Date().getHours();
    return h >= 19 || h < 7 ? 'night' : 'day';
  });
  const [hearts, setHearts] = useState(0);
  const holdTimer = useRef(0);
  const activityTimer = useRef(0);
  const sad = needs.hungry || needs.thirsty;
  const need = needsMessage(pet.name, needs);

  const give = (kind: 'bambu' | 'su') => {
    const full = kind === 'bambu' ? needs.food >= 100 : needs.water >= 100;
    const have = kind === 'bambu' ? needs.bamboo : needs.drops;
    if (full) return toast(kind === 'bambu' ? pet.name + ' şu an tok ♡' : pet.name + ' şu an susamamış ♡');
    if (have < 1) return toast(kind === 'bambu' ? 'Bambun kalmadı. 5 doğru cevap = 1 bambu 🎋' : 'Suyun kalmadı. 4 soru çöz = 1 damla su 💧');
    update((s) => (kind === 'bambu' ? feedPet(s) : waterPet(s)));
    setHolding(kind);
    setActivity('snack');
    clearTimeout(holdTimer.current);
    clearTimeout(activityTimer.current);
    holdTimer.current = window.setTimeout(() => setHolding(null), 2200);
    activityTimer.current = window.setTimeout(() => setActivity('idle'), 2800);
    toast(kind === 'bambu' ? 'Nam nam! ' + pet.name + ' bambuyu çok sevdi 🎋' : 'Glu glu! ' + pet.name + ' suyunu içti 💧');
  };

  const react = (nextActivity: RoomActivity) => {
    setActivity(nextActivity);
    clearTimeout(activityTimer.current);
    activityTimer.current = window.setTimeout(() => setActivity('idle'), 4200);
  };

  const petPanda = () => {
    setHearts((v) => v + 1);
    react('play');
    toast(pet.name + ' çok mutlu oldu ♡');
  };

  const [name, setName] = useState(pet.name);
  const nextItem = PET_ITEMS.find((i) => i.level > p.level);
  const nextRoom = ROOM_UNLOCKS.find((i) => i.level > p.level);
  const pct = ((p.xp - p.levelStartXp) / Math.max(1, p.nextLevelXp - p.levelStartXp)) * 100;
  const roomUnlocked = ROOM_UNLOCKS.filter((i) => i.level <= p.level).length;
  const roomPct = (roomUnlocked / ROOM_UNLOCKS.length) * 100;
  const roomMessage = activityText(activity, pet.name) || need || p.moodText;
  const today = dayKey();
  const d = dashboard(state, today);
  const doneTasks = state.tasks.filter((t) => t.date === today && t.done).length;
  const questQuestions = Math.max(10, Math.min(30, Math.round(state.profile.dailyQuestionGoal * 0.35)));
  const questMinutes = Math.max(20, Math.min(60, Math.round(state.profile.dailyStudyMinutes * 0.25)));
  const quests = [
    { icon: '⚡', label: questQuestions + ' soru çöz', current: Math.min(questQuestions, d.todayQuestions), target: questQuestions, done: d.todayQuestions >= questQuestions, reward: '+ çalışma XP' },
    { icon: '⏱️', label: questMinutes + ' dk odaklan', current: Math.min(questMinutes, d.todayMinutes), target: questMinutes, done: d.todayMinutes >= questMinutes, reward: '+ oda enerjisi' },
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
        title={pet.name + '’nın odası'}
        sub="Çalıştıkça oda büyür, yeni eşyalar açılır ve panda seninle gelişir ♡"
        actions={
          <button type="button" className="btn small" onClick={() => setRoomMode((m) => (m === 'day' ? 'night' : 'day'))}>
            {roomMode === 'day' ? '🌙 Gece' : '☀️ Gündüz'}
          </button>
        }
      />

      <section className={'panda-room ' + roomMode + ' mood-' + p.mood} aria-label={pet.name + ' panda odası'}>
        <div className="room-wall">
          <div className="room-window" aria-hidden="true">
            <div className="room-sky">
              <span className="room-sunmoon">{roomMode === 'day' ? '☀' : '☾'}</span>
              <span className="room-cloud cloud-a">☁</span>
              <span className="room-cloud cloud-b">☁</span>
            </div>
            <div className="room-window-frame" />
          </div>

          <button type="button" className="room-hotspot window-hotspot" onClick={() => react('window')} aria-label="Pencereye git">
            <span>🌤️</span>
            <small>Pencere</small>
          </button>

          <div className={'room-lamp' + (p.level >= 8 ? ' unlocked' : ' locked')} aria-hidden="true">
            <span className="lamp-shade">✦</span>
            <span className="lamp-stand" />
          </div>

          <div className={'room-shelf' + (p.level >= 6 ? ' unlocked' : ' locked')} aria-hidden="true">
            <span>📕</span><span>📘</span><span>🧸</span>
          </div>

          <div className={'room-trophy' + (p.level >= 10 ? ' unlocked' : ' locked')} aria-hidden="true">🏆</div>

          <div className={'room-desk' + (p.level >= 2 ? ' unlocked' : ' locked')}>
            <span className="desk-top" />
            <span className="desk-leg leg-left" />
            <span className="desk-leg leg-right" />
            <span className="desk-books">📚</span>
            <span className="desk-mug">☕</span>
          </div>

          <button
            type="button"
            className={'room-hotspot desk-hotspot' + (p.level >= 2 ? '' : ' locked')}
            disabled={p.level < 2}
            onClick={() => react('study')}
            aria-label={p.level >= 2 ? 'Çalışma masasına git' : 'Çalışma masası seviye 2’de açılır'}
          >
            <span>📚</span>
            <small>{p.level >= 2 ? 'Çalış' : 'Sv. 2'}</small>
          </button>

          <div className={'room-sofa' + (p.level >= 4 ? ' unlocked' : ' locked')} aria-hidden="true">
            <span className="sofa-back" />
            <span className="sofa-seat" />
            <span className="sofa-pillow">♡</span>
          </div>

          <button
            type="button"
            className={'room-hotspot rest-hotspot' + (p.level >= 4 ? '' : ' locked')}
            disabled={p.level < 4}
            onClick={() => react('rest')}
            aria-label={p.level >= 4 ? 'Okuma köşesinde dinlen' : 'Okuma köşesi seviye 4’te açılır'}
          >
            <span>🛋️</span>
            <small>{p.level >= 4 ? 'Dinlen' : 'Sv. 4'}</small>
          </button>

          <div className="room-plant" aria-hidden="true">
            <span className="plant-leaves">🎋</span>
            <span className="plant-pot" />
          </div>

          <button type="button" className="room-hotspot snack-hotspot" onClick={() => react('snack')} aria-label="Bambu köşesine git">
            <span>🎋</span>
            <small>Bambu</small>
          </button>

          <div className="room-rug" aria-hidden="true" />

          <button type="button" className="room-panda-zone" onClick={petPanda} aria-label={pet.name + ' pandayı sev'}>
            <span className={'room-panda ' + (activity !== 'idle' ? 'activity-' + activity : '') + (p.mood === 'coskulu' ? ' celebrate' : '')}>
              <PandaBody
                size={210}
                items={pet.items}
                sleepy={!holding && !sad && (activity === 'rest' || p.mood === 'uykulu')}
                waving={!holding && !sad && activity !== 'rest'}
                sad={!holding && sad}
                holding={holding}
              />
              {hearts > 0 && <span key={hearts} className="room-heart" aria-hidden="true">♡</span>}
            </span>
          </button>

          <div className="room-bubble" aria-live="polite">
            <b>{pet.name}</b>
            <span>{roomMessage}</span>
          </div>

          <div className="room-floor" aria-hidden="true" />
        </div>

        <div className="room-hud">
          <div className="room-level">
            <span>Seviye</span>
            <b>{p.level}</b>
          </div>
          <div className="room-hud-main">
            <div className="row between nowrap">
              <span className="tiny muted">Oda gelişimi</span>
              <b className="small">{roomUnlocked}/{ROOM_UNLOCKS.length}</b>
            </div>
            <ProgressBar value={roomPct} label="Oda gelişimi" />
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
              <h2>Enerjisini yüksek tut</h2>
            </div>
            <span className={'badge ' + (sad ? 'warn' : 'ok')}>{sad ? 'İlgilenmen gerekiyor' : 'Keyfi yerinde'}</span>
          </div>
          <Meter label="Tokluk 🎋" value={needs.food} kind="food" />
          <Meter label="Su 💧" value={needs.water} kind="water" />
          <div className="pet-actions">
            <button type="button" className="btn primary" onClick={() => give('bambu')}>
              🎋 Bambu ver <span className="badge">{needs.bamboo}</span>
            </button>
            <button type="button" className="btn" onClick={() => give('su')}>
              💧 Su ver <span className="badge">{needs.drops}</span>
            </button>
            <button type="button" className="btn ghost" onClick={petPanda}>
              ♡ Sev
            </button>
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
          <p className="small muted">
            {p.xp} XP · sonraki seviyeye {Math.max(0, p.nextLevelXp - p.xp)} XP
          </p>
          <div className="pet-next-unlock">
            <span className="pet-next-icon">{nextRoom?.icon ?? '✨'}</span>
            <div className="grow">
              <b>{nextRoom ? 'Sıradaki oda açılımı' : 'Oda tamamlandı'}</b>
              <span>{nextRoom ? 'Seviye ' + nextRoom.level + ': ' + nextRoom.label : 'Tüm oda bölümleri açık.'}</span>
            </div>
          </div>
          {nextItem && <div className="tiny muted mt-8">Aksesuar: Seviye {nextItem.level}’de {nextItem.icon} {nextItem.label} açılır.</div>}
        </div>
      </section>

      <section className="card section" aria-labelledby="room-h">
        <div className="card-head">
          <div>
            <div className="eyebrow">Oda koleksiyonu</div>
            <h2 id="room-h">Açılan eşyalar</h2>
          </div>
          <span className="badge brand">%{Math.round(roomPct)}</span>
        </div>
        <div className="room-unlocks">
          {ROOM_UNLOCKS.map((item) => {
            const open = item.level <= p.level;
            return (
              <div key={item.label} className={'room-unlock ' + (open ? 'open' : 'locked')}>
                <span aria-hidden="true">{open ? item.icon : '🔒'}</span>
                <b>{item.label}</b>
                <small>{open ? 'Odada' : 'Seviye ' + item.level}</small>
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
          <p className="small muted">Bu isim odada, ana sayfada ve bakım bildirimlerinde görünür.</p>
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
