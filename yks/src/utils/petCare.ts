import type { AppState, PetCare } from '../store/schema';

/**
 * Pandanın yemek ve su ihtiyacı. Bambu ve su yalnız gerçek çalışmayla kazanılır
 * (sayaç tutulmaz; kazanılan miktar çalışma verisinden hesaplanır, harcanan miktar saklanır).
 * Tokluk ve susuzluk zamanla azalır; Zeynep çalıştıkça panda beslenir.
 */
export const FOOD_PER_HOUR = 100 / 30; // tam tokluk ~30 saatte biter
export const WATER_PER_HOUR = 100 / 20; // su ~20 saatte biter
export const SATISFIED_AT = 99.5; // yüzde 100 gösterilen ihtiyaç kaynak harcamaz
export const FOOD_PER_BAMBOO = 25;
export const WATER_PER_DROP = 30;
export const HUNGRY_BELOW = 35;
export const STARVING_BELOW = 12;

const HOUR = 3_600_000;

export function freshCare(now: Date = new Date()): PetCare {
  const iso = now.toISOString();
  return { food: 80, foodAt: iso, water: 80, waterAt: iso, spentBamboo: 0, spentWater: 0 };
}

function decayed(value: number, at: string, perHour: number, now: Date): number {
  const t = Date.parse(at);
  const hours = Number.isFinite(t) ? Math.max(0, (now.getTime() - t) / HOUR) : 0;
  return Math.max(0, Math.min(100, value - hours * perHour));
}

export interface PetNeeds {
  food: number;
  water: number;
  bamboo: number;
  drops: number;
  earnedBamboo: number;
  earnedDrops: number;
  hungry: boolean;
  thirsty: boolean;
  starving: boolean;
}

/** Çalışmadan kazanılan toplam bambu ve su damlası. */
export function earned(state: AppState): { bamboo: number; drops: number } {
  const answered = state.attempts.filter((a) => a.answer != null);
  const correct = answered.filter((a) => a.correct).length;
  const minutes = state.studyLog.reduce((n, s) => n + s.minutes, 0);
  const cardViews = Object.values(state.cards).reduce((n, c) => n + c.seen, 0);
  const topics = Object.values(state.topicProgress).filter((p) => p.status === 'tamamlandi').length;
  return {
    bamboo: Math.floor(correct / 5) + state.testResults.length + topics * 2,
    drops: Math.floor(answered.length / 4) + Math.floor(minutes / 15) + Math.floor(cardViews / 10),
  };
}

export function petNeeds(state: AppState, now: Date = new Date()): PetNeeds {
  const care = state.settings.pet.care ?? freshCare(now);
  const food = decayed(care.food, care.foodAt, FOOD_PER_HOUR, now);
  const water = decayed(care.water, care.waterAt, WATER_PER_HOUR, now);
  const e = earned(state);
  return {
    food,
    water,
    bamboo: Math.max(0, e.bamboo - care.spentBamboo),
    drops: Math.max(0, e.drops - care.spentWater),
    earnedBamboo: e.bamboo,
    earnedDrops: e.drops,
    hungry: food < HUNGRY_BELOW,
    thirsty: water < HUNGRY_BELOW,
    starving: food < STARVING_BELOW || water < STARVING_BELOW,
  };
}

function withCare(state: AppState, care: PetCare): AppState {
  return { ...state, settings: { ...state.settings, pet: { ...state.settings.pet, care } } };
}

/** Bir bambu yedirir. Bambu yoksa ya da panda tokken durum değişmez. */
export function feedPet(state: AppState, now: Date = new Date()): AppState {
  const n = petNeeds(state, now);
  if (n.bamboo < 1 || n.food >= SATISFIED_AT) return state;
  const care = state.settings.pet.care ?? freshCare(now);
  return withCare(state, { ...care, food: Math.min(100, n.food + FOOD_PER_BAMBOO), foodAt: now.toISOString(), spentBamboo: care.spentBamboo + 1 });
}

/** Bir damla su içirir. */
export function waterPet(state: AppState, now: Date = new Date()): AppState {
  const n = petNeeds(state, now);
  if (n.drops < 1 || n.water >= SATISFIED_AT) return state;
  const care = state.settings.pet.care ?? freshCare(now);
  return withCare(state, { ...care, water: Math.min(100, n.water + WATER_PER_DROP), waterAt: now.toISOString(), spentWater: care.spentWater + 1 });
}

/** Pandanın o anki ihtiyacını anlatan kısa cümle (bildirim ve Cuma'nın konuşması için). */
export function needsMessage(name: string, n: PetNeeds): string | null {
  if (n.hungry && n.thirsty) return `${name}: beslenme ve su ihtiyacı var. Bakım bölümünden kontrol edebilirsin.`;
  if (n.hungry) return `${name}: beslenme zamanı. ${n.bamboo > 0 ? 'Mevcut bambularını bakım bölümünde kullanabilirsin.' : 'Doğru cevaplarla bambu kazanabilirsin.'}`;
  if (n.thirsty) return `${name}: su ihtiyacı var. ${n.drops > 0 ? 'Mevcut suyunu bakım bölümünde kullanabilirsin.' : 'Soru çözerek su kazanabilirsin.'}`;
  return null;
}
