import { useMemo, useState } from 'react';
import { PageHeader } from '../components/Layout';
import { PandaBody } from '../components/MascotNav';
import { ProgressBar, toast } from '../components/ui';
import { updateSettings } from '../store/actions';
import { update, useAppState } from '../store/store';
import { PET_ITEMS, petStatus } from '../utils/pet';

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
          <PandaBody size={190} items={pet.items} sleepy={p.mood === 'uykulu'} waving={p.mood !== 'uykulu'} />
        </div>
        <div className="pet-info">
          <div className="row between nowrap">
            <h2 style={{ margin: 0 }}>{pet.name}</h2>
            <span className="badge brand">Seviye {p.level}</span>
          </div>
          <p className="small muted" style={{ margin: '6px 0 10px' }}>
            {p.moodText}
          </p>
          <ProgressBar value={pct} label="Seviye ilerlemesi" />
          <div className="tiny muted mt-8">
            {p.xp} XP · sonraki seviyeye {Math.max(0, p.nextLevelXp - p.xp)} XP
            {next ? ` · Seviye ${next.level}’de ${next.icon} ${next.label} açılır` : ' · tüm aksesuarlar açık!'}
          </div>
        </div>
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
