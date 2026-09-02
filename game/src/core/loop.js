import { PERFORMANCE } from './settings.js';

/**
 * The single requestAnimationFrame driver for the whole game.
 *
 * No other module is allowed to call requestAnimationFrame. Systems register an
 * update callback and are invoked in registration order with a clamped delta.
 */
export function createLoop() {
  const systems = [];
  let rafId = null;
  let lastTime = 0;
  let running = false;

  const frame = (now) => {
    rafId = requestAnimationFrame(frame);
    // Clamped so a stalled tab cannot advance the world by a whole second in
    // one step. The cost is that very low frame rates run in slow motion.
    const dt = Math.min((now - lastTime) / 1000, PERFORMANCE.MAX_DELTA);
    lastTime = now;
    if (dt <= 0) return;

    for (let i = 0; i < systems.length; i += 1) {
      systems[i](dt);
    }
  };

  return {
    /** @param {(dt:number) => void} fn */
    add(fn) {
      systems.push(fn);
      return () => {
        const index = systems.indexOf(fn);
        if (index !== -1) systems.splice(index, 1);
      };
    },
    start() {
      if (running) return;
      running = true;
      lastTime = performance.now();
      rafId = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    },
  };
}
