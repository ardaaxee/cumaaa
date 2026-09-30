// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defaultState, type AppState } from '../src/store/schema';
import { freshCare } from '../src/utils/petCare';
import { PANDA_LIFE_KEY } from '../src/utils/pandaLife';
import PetPage from '../src/pages/PetPage';

let state: AppState;
vi.mock('../src/store/store', () => ({
  useAppState: () => state,
  update: (fn: (s: AppState) => AppState) => { state = fn(state); },
}));
vi.mock('../src/utils/pandaVoice', () => ({
  playPandaVoice: vi.fn(async () => 0),
  unlockPandaVoice: vi.fn(async () => {}),
  stopPandaVoice: vi.fn(),
}));

let root: Root;
let host: HTMLDivElement;
async function click(selector: string) {
  const button = host.querySelector<HTMLButtonElement>(selector);
  expect(button, selector).not.toBeNull();
  await act(() => button!.click());
}
async function advance(ms: number) { await act(() => vi.advanceTimersByTime(ms)); }
async function mount() { await act(() => root.render(createElement(PetPage))); }

beforeEach(async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-09-30T14:00:00Z'));
  localStorage.clear();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  state = defaultState();
  state = { ...state, settings: { ...state.settings, pet: { ...state.settings.pet, care: freshCare() } } };
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await mount();
  await advance(3300);
});
afterEach(async () => {
  await act(() => root.unmount());
  host.remove();
  vi.useRealTimers();
});

describe('Panda evindeki etkileşimler', () => {
  it('ilk karşılama yeni başlayan oyunu yarıda kesmez', async () => {
    await act(() => root.unmount());
    root = createRoot(host);
    await mount();
    await click('.pet-game-actions .play');
    await advance(900);
    expect(host.querySelector('.pet-ball-game-hud')).not.toBeNull();
    expect(host.querySelector('.pet-stage')?.classList.contains('scene-garden')).toBe(true);
  });

  it('hızlı dokunmalarda 10 puanı aşmaz, tek ödül verir, tekrar oynanabilir', async () => {
    await click('.pet-game-actions .play');
    const ball = host.querySelector<HTMLButtonElement>('.pet-tom-ball')!;
    await act(() => { for (let i = 0; i < 15; i++) ball.click(); });
    expect(host.querySelector('.panda-game-result')?.textContent).toContain('10’da 10');
    expect(host.querySelector('.pet-tom-ball')).toBeNull();
    expect(localStorage.getItem('iyikiPanda.ballHigh')).toBe('10');
    expect(JSON.parse(localStorage.getItem(PANDA_LIFE_KEY)!).happiness).toBe(96);
    await click('.panda-game-result button');
    expect(host.querySelector('.pet-ball-game-hud strong')?.textContent).toBe('0/10');
    await click('.pet-room-strip button');
    await advance(6000);
    expect(host.querySelector('.pet-stage')?.classList.contains('scene-living')).toBe(true);
    expect(host.querySelector('.panda-game-result')).toBeNull();
  });

  it('oyundan bakım eylemine geçince oyun tamamen kapanır', async () => {
    await click('.pet-game-actions .play');
    await click('.pet-game-needs button:nth-child(3)');
    await advance(4400);
    expect(host.querySelector('.pet-stage')?.classList.contains('scene-bathroom')).toBe(true);
    expect(host.querySelector('.pet-ball-game-hud')).toBeNull();
    expect(JSON.parse(localStorage.getItem(PANDA_LIFE_KEY)!).cleanliness).toBe(100);
  });

  it('iptal edilen besleme bambu harcamaz; tamamlanan besleme yalnız bir bambu harcar', async () => {
    state = { ...state, testResults: [{ id: 'earned-test' }] as AppState['testResults'] };
    await mount();
    await click('.pet-game-actions .feed');
    await advance(1000);
    await click('.pet-room-strip button');
    await advance(4000);
    expect(state.settings.pet.care!.spentBamboo).toBe(0);
    await click('.pet-game-actions .feed');
    await advance(2300);
    expect(state.settings.pet.care!.spentBamboo).toBe(1);
  });

  it('ses tercihi yeniden açılışta korunur', async () => {
    await click('[aria-label="Panda sesini kapat"]');
    await act(() => root.unmount());
    root = createRoot(host);
    await mount();
    expect(host.querySelector('[aria-label="Panda sesini aç"]')).not.toBeNull();
  });

  it('balkon koltuğu salon yerine balkonda dinlendirir ve çalışma bağlantıları doğrudur', async () => {
    await click('.pet-room-strip button:last-child');
    await advance(900);
    await click('[aria-label="Balkonda dinlen"]');
    await advance(1000);
    expect(host.querySelector('.pet-stage')?.classList.contains('scene-balcony')).toBe(true);
    expect(host.querySelector('.panda-study-links a')?.getAttribute('href')).toBe('#/odak');
    expect(host.querySelector('.panda-inventory a')?.getAttribute('href')).toBe('#/testler');
  });

  it('açık aksesuarı karakterde gösterir ve kilitli aksesuarı takmaz', async () => {
    state = { ...state, studyLog: [{ id: 'study', minutes: 70, day: '2026-09-29', at: '2026-09-29T14:00:00Z', source: 'manuel' }],
      settings: { ...state.settings, pet: { ...state.settings.pet, items: ['kalem', 'tac'] } } };
    await mount();
    expect(host.querySelector('[data-accessory="kalem"]')).not.toBeNull();
    expect(host.querySelector('[data-accessory="tac"]')).toBeNull();
  });
});
