import { describe, expect, it } from 'vitest';
import { defaultState, type AppState, type QuestionAttempt } from '../src/store/schema';
import { sanitize } from '../src/store/migrations';
import { feedPet, freshCare, needsMessage, petNeeds, waterPet } from '../src/utils/petCare';

const T0 = new Date('2026-09-29T08:00:00Z');
const hoursLater = (h: number) => new Date(T0.getTime() + h * 3_600_000);

function withAttempts(state: AppState, answered: number, correct: number): AppState {
  const attempts = Array.from({ length: answered }, (_, i) => ({
    id: `a${i}`,
    questionId: `q${i}`,
    topicId: 't',
    subjectId: 'tyt-fizik',
    difficulty: 'kolay',
    answer: 0,
    correct: i < correct,
    timeMs: 0,
    at: T0.toISOString(),
    day: '2026-09-29',
    sessionId: 's',
  })) as QuestionAttempt[];
  return { ...state, attempts };
}

function base(): AppState {
  const s = defaultState();
  return { ...s, settings: { ...s.settings, pet: { ...s.settings.pet, care: freshCare(T0) } } };
}

describe('panda bakımı', () => {
  it('tokluk ve su zamanla azalır, panda acıkır', () => {
    const s = base();
    expect(petNeeds(s, T0)).toMatchObject({ food: 80, water: 80, hungry: false, thirsty: false });
    const later = petNeeds(s, hoursLater(15));
    expect(later.food).toBeCloseTo(30, 0);
    expect(later.water).toBeCloseTo(5, 0);
    expect(later).toMatchObject({ hungry: true, thirsty: true, starving: true });
    expect(petNeeds(s, hoursLater(100))).toMatchObject({ food: 0, water: 0 });
  });

  it('bambu ve su yalnız gerçek çalışmadan kazanılır', () => {
    expect(petNeeds(base(), T0)).toMatchObject({ bamboo: 0, drops: 0 });
    const s = withAttempts(base(), 12, 10);
    expect(petNeeds(s, T0)).toMatchObject({ bamboo: 2, drops: 3 });
  });

  it('beslemek bambu harcar ve tokluğu artırır; bambu yoksa bir şey değişmez', () => {
    const hungry = withAttempts(base(), 12, 10);
    const later = hoursLater(15);
    const fed = feedPet(hungry, later);
    const n = petNeeds(fed, later);
    expect(n.food).toBeCloseTo(55, 0);
    expect(n.bamboo).toBe(1);
    const watered = waterPet(fed, later);
    expect(petNeeds(watered, later).water).toBeCloseTo(35, 0);
    expect(petNeeds(watered, later).drops).toBe(2);
    expect(feedPet(base(), later)).toEqual(base());
  });

  it('tokken besleme yapılmaz', () => {
    const s = withAttempts(base(), 12, 10);
    const full = { ...s, settings: { ...s.settings, pet: { ...s.settings.pet, care: { ...freshCare(T0), food: 100 } } } };
    expect(feedPet(full, T0)).toBe(full);
  });

  it('ekranda yüzde 100 görünen küçük zaman azalması kaynak harcatmaz', () => {
    const s = withAttempts(base(), 12, 10);
    const full = { ...s, settings: { ...s.settings, pet: { ...s.settings.pet, care: { ...freshCare(T0), food: 100, water: 100 } } } };
    const oneMinuteLater = new Date(T0.getTime() + 60_000);
    expect(feedPet(full, oneMinuteLater)).toBe(full);
    expect(waterPet(full, oneMinuteLater)).toBe(full);
  });

  it('ihtiyaç mesajı durumu anlatır', () => {
    const s = base();
    expect(needsMessage('Bambu', petNeeds(s, T0))).toBeNull();
    expect(needsMessage('Bambu', petNeeds(s, hoursLater(15)))).toContain('hem acıktı hem susadı');
  });

  it('bozuk kayıtlar güvenli değerlere döner', () => {
    const raw = JSON.parse(JSON.stringify(base()));
    raw.settings.pet.care = { food: 500, foodAt: 'dün', water: -3, waterAt: T0.toISOString(), spentBamboo: -2, spentWater: 'x' };
    const care = sanitize(raw).settings.pet.care!;
    expect(care).toMatchObject({ food: 100, water: 0, waterAt: T0.toISOString(), spentBamboo: 0, spentWater: 0 });
    expect(Number.isFinite(Date.parse(care.foodAt))).toBe(true);
  });
});
