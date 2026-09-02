import { HERO_MOMENT } from '../core/settings.js';
import { heroMomentSequence } from '../camera/sequences.js';

/**
 * The Aster City hero moment trigger.
 *
 * Fires once, when Cuma walks into the Meridian Market crossroads. It plays a
 * camera sequence and nothing else — the player keeps walking throughout, which
 * is the whole point: no cut, no lock, no black frame.
 */
export function createHeroMomentTrigger(director, spireFocus, { onStart, onEnd } = {}) {
  let fired = false;
  let armed = false;
  let armTimer = 0;

  return {
    get hasFired() {
      return fired;
    },

    /** Re-arms the trigger so the shot can be re-recorded without a reload. */
    reset() {
      fired = false;
      armed = false;
      armTimer = 0;
    },

    play() {
      fired = true;
      onStart?.();
      director.play(heroMomentSequence(spireFocus), {
        retainControl: true,
        onComplete: () => onEnd?.(),
      });
    },

    update(dt, position) {
      if (fired || director.isPlaying) return;

      // Give the opening cinematic room to finish before arming.
      if (!armed) {
        armTimer += dt;
        if (armTimer < 1.5) return;
        armed = true;
      }

      const dx = position.x - HERO_MOMENT.TRIGGER_POSITION.x;
      const dz = position.z - HERO_MOMENT.TRIGGER_POSITION.z;
      if (dx * dx + dz * dz <= HERO_MOMENT.TRIGGER_RADIUS * HERO_MOMENT.TRIGGER_RADIUS) {
        this.play();
      }
    },
  };
}
