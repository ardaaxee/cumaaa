import { useMemo, useRef, useState } from 'react';
import { PageHeader } from '../components/Layout';
import { PandaBody } from '../components/MascotNav';
import { ProgressBar, toast } from '../components/ui';
import { updateSettings } from '../store/actions';
import { update, useAppState } from '../store/store';
import { PET_ITEMS, petStatus } from '../utils/pet';
import { usePetNeeds } from '../hooks/usePetNeeds';
import { FOOD_PER_BAMBOO, WATER_PER_DROP, feedPet, needsMessage, waterPet } from '../utils/petCare';
import { PetNotifyToggle } from '../hooks/usePetAlerts';

const EARN_RULES = [
  ['🎋 1 bambu', '5 doğru cevap'],
  ['🎋 1 bambu', 'bitirdiğin her test'],
  ['🎋 2 bambu', 'tamamladığın her konu'],
  ['💧 1 damla', '4 cevaplanan soru'],
  ['💧 1 damla', '15 dk çalışma'],
  ['💧 1 damla', '10 bilgi kartı tekrarı'],
];

function Meter({ label, value, kind }: { label: string; value: number; kind: 'food' | 'water' }) {
  const v = Math.round(value);
  return (
    <div className={`need-meter ${kind}${v < 35 ? ' low' : ''}`}>
      <div className="row between nowrap small">
        <b>{label}</b>
        <span>%{v}</span>
      </div>
      <div className="need-bar" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={v}>
        <span style={{ width: `${v}%` }} />
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

export default function PetPage() {
  const state = useAppState();
  const pet = state.settings.pet;
  const p = useMemo(() => petStatus(state), [state]);
  const needs = usePetNeeds();
  const [holding, setHolding] = useState<'bambu' | 'su' | null>(null);
  const holdTimer = useRef(0);
  const sad = needs.hungry || needs.thirsty;
  const need = needsMessage(pet.name, needs);

  const give = (kind: 'bambu' | 'su') => {
    const full = kind === 'bambu' ? needs.food >= 100 : needs.water >= 100;
    const have = kind === 'bambu' ? needs.bamboo : needs.drops;
    if (full) return toast(kind === 'bambu' ? `${pet.name} şu an tok ♡` : `${pet.name} şu an susamamış ♡`);
    if (have < 1) return toast(kind === 'bambu' ? 'Bambun kalmadı. 5 doğru cevap = 1 bambu 🎋' : 'Suyun kalmadı. 4 soru çöz = 1 damla 💧');
    update((s) => (kind === 'bambu' ? feedPet(s) : waterPet(s)));
    setHolding(kind);
    clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(() => setHolding(null), 2200);
    toast(kind === 'bambu' ? `Nam nam! ${pet.name} bambuyu çok sevdi 🎋` : `Glu glu! ${pet.name} suyunu içti 💧`);
  };
  const [name, setName] = useState(pet.name);
  const next = PET_ITEMS.find((i) => i.level > p.level);
  const pct = ((p.xp - p.levelStartXp) / Math.max(1, p.nextLevelXp - p.levelStartXp)) * 100;

  const toggle = (id: string) =>
    update((s) => {
      const items = s.settings.pet.items.includes(id) ? s.settings.pet.items.filter((x) => x !== id) : [...s.settings.pet.items, id];
      return updateSettings(s, { pet: { ...s.settings.pet, items } });
    });

  return (
    <>
      <PageHeader title="Panda arkadaşım" sub="Sen çalıştıkça büyür ♡" />

      <section className={`card pet-stage mood-${p.mood}`} aria-label="Panda">
        <div className={`pet-big${p.mood === 'coskulu' ? ' dance' : ''}`}>
          <PandaBody size={190} items={pet.items} sleepy={!holding && !sad && p.mood === 'uykulu'} waving={!holding && !sad && p.mood !== 'uykulu'} sad={!holding && sad} holding={holding} />
        </div>
        <div className="pet-info">
          <div className="row between nowrap">
            <h2 style={{ margin: 0 }}>{pet.name}</h2>
            <span className="badge brand">Seviye {p.level}</span>
          </div>
          <p className="small muted" style={{ margin: '6px 0 10px' }}>
            {holding ? (holding === 'bambu' ? 'Nam nam nam… 🎋' : 'Glu glu glu… 💧') : need ?? p.moodText}
          </p>
          <Meter label="Tokluk 🎋" value={needs.food} kind="food" />
          <Meter label="Su 💧" value={needs.water} kind="water" />
          <div className="row mt-12 pet-actions">
            <button type="button" className="btn primary" onClick={() => give('bambu')}>
              🎋 Bambu ver <span className="badge">{needs.bamboo}</span>
            </button>
            <button type="button" className="btn" onClick={() => give('su')}>
              💧 Su ver <span className="badge">{needs.drops}</span>
            </button>
          </div>
          <div className="mt-12" />
          <ProgressBar value={pct} label="Seviye ilerlemesi" />
          <div className="tiny muted mt-8">
            {p.xp} XP · sonraki seviyeye {Math.max(0, p.nextLevelXp - p.xp)} XP
            {next ? ` · Seviye ${next.level}’de ${next.icon} ${next.label} açılır` : ' · tüm aksesuarlar açık!'}
          </div>
        </div>
      </section>

      <section className="card section" aria-labelledby="care-h">
        <h2 id="care-h" className="mb-8">
          Yemek ve su nasıl kazanılır?
        </h2>
        <ul className="list">
          {EARN_RULES.map(([k, v]) => (
            <li key={k + v} className="list-item">
              <b className="small" style={{ minWidth: 92 }}>{k}</b>
              <span className="grow small">{v}</span>
            </li>
          ))}
        </ul>
        <p className="tiny muted mt-8">
          Bir bambu tokluğu %{FOOD_PER_BAMBOO}, bir damla su %{WATER_PER_DROP} artırır. Tokluk yaklaşık 30 saatte, su 20 saatte biter; yani {pet.name} her gün biraz çalışmanı bekler ♡ Toplam kazandığın: {needs.earnedBamboo} bambu, {needs.earnedDrops} damla.
        </p>
        <PetNotifyToggle />
      </section>

      <section className="card section" aria-labelledby="items-h">
        <h2 id="items-h" className="mb-8">
          Aksesuarlar
        </h2>
        <div className="pet-items">
          {PET_ITEMS.map((i) => {
            const open = i.level <= p.level;
            const on = pet.items.includes(i.id);
            return (
              <button
                key={i.id}
                type="button"
                className={`pet-item${on ? ' on' : ''}${open ? '' : ' locked'}`}
                aria-pressed={on}
                disabled={!open}
                onClick={() => toggle(i.id)}
              >
                <span className="pet-item-icon" aria-hidden="true">
                  {open ? i.icon : '🔒'}
                </span>
                <b>{i.label}</b>
                <span className="tiny muted">{open ? (on ? 'Takılı' : 'Tak') : `Seviye ${i.level}`}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cards section">
        <section className="card" aria-labelledby="xp-h">
          <h2 id="xp-h" className="mb-8">
            XP nasıl kazanılır?
          </h2>
          <ul className="list">
            {XP_RULES.map(([k, v]) => (
              <li key={k} className="list-item">
                <span className="grow small">{k}</span>
                <b className="small">{v}</b>
              </li>
            ))}
          </ul>
          <p className="tiny muted mt-8">XP yalnız gerçek çalışmandan hesaplanır. Bugün kazandığın: {p.todayXp} XP.</p>
        </section>
        <section className="card" aria-labelledby="name-h">
          <h2 id="name-h" className="mb-8">
            Adını değiştir
          </h2>
          <form
            className="chat-form"
            onSubmit={(e) => {
              e.preventDefault();
              const n = name.trim().slice(0, 20);
              if (!n) return;
              update((s) => updateSettings(s, { pet: { ...s.settings.pet, name: n } }));
              toast(`Pandanın yeni adı: ${n} ♡`);
            }}
          >
            <input className="input" value={name} maxLength={20} onChange={(e) => setName(e.target.value)} aria-label="Panda adı" />
            <button type="submit" className="btn primary">
              Kaydet
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
