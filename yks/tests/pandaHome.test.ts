import { describe, expect, it } from 'vitest';
import { advanceBallGame, BALL_GOAL, idleBallGame, startBallGame } from '../src/utils/pandaBallGame';
import { restorePandaLife } from '../src/utils/pandaLife';

describe('Panda top oyunu', () => {
  it('yalnız başlayan oyunda sayar ve onuncu vuruşta bir kez biter', () => {
    expect(advanceBallGame(idleBallGame())).toEqual(idleBallGame());
    let game = startBallGame();
    for (let i = 0; i < BALL_GOAL; i++) game = advanceBallGame(game);
    expect(game).toEqual({ phase: 'completed', score: 10 });
    expect(advanceBallGame(game)).toBe(game);
  });

  it('iptal edilen oyunu geç gelen bir vuruş yeniden başlatmaz', () => {
    const cancelled = idleBallGame();
    expect(advanceBallGame(cancelled)).toBe(cancelled);
    expect(startBallGame()).toEqual({ phase: 'playing', score: 0 });
  });
});

describe('Panda yaşam kaydı', () => {
  const now = 1_800_000_000_000;
  it('eski kayıt ve ses tercihini korur, geçen zamanı yalnızca bir kez uygular', () => {
    const saved = { cleanliness: 80, energy: 70, happiness: 90, room: 'balcony', lastSeen: now - 3_600_000, voiceOn: false };
    const restored = restorePandaLife(saved, now);
    expect(restored).toMatchObject({ cleanliness: 79.25, energy: 68.85, happiness: 89.55, room: 'balcony', voiceOn: false });
    expect(restorePandaLife({ ...restored, lastSeen: now }, now)).toEqual({ ...restored, lastSeen: now });
  });

  it('bozuk kayıtlar NaN üretmez ve gelecekteki zaman değerleri bozulmaya yol açmaz', () => {
    const life = restorePandaLife({ cleanliness: 'x', energy: null, happiness: Infinity, room: 'missing', lastSeen: now + 5000 }, now);
    expect(life).toEqual({ cleanliness: 82, energy: 76, happiness: 84, room: 'living', voiceOn: true, lastSeen: now });
    expect(restorePandaLife(null, now)).toEqual(life);
  });
});
