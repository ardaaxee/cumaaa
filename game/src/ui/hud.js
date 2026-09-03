/**
 * HUD wiring. Owns every DOM listener it creates and hands back a dispose so
 * nothing leaks when the session is torn down.
 *
 * Deliberately minimal: the Warden gets a name, a health bar, a posture bar and
 * a phase number, and the player gets one thin vitals bar. Nothing else.
 */

/** Posture below this fraction flares the bar white as a break warning. */
const POSTURE_CRITICAL = 0.25;

export function createHud(root = document) {
  const elements = {
    objective: root.querySelector('#objective'),
    message: root.querySelector('#msg'),
    bossPanel: root.querySelector('#boss'),
    bossHp: root.querySelector('#hp'),
    bossPosture: root.querySelector('#posture'),
    bossPostureBar: root.querySelector('.meter.posture'),
    bossPhase: root.querySelector('#phase'),
    nameCard: root.querySelector('#nameCard'),
    playerVitals: root.querySelector('#playerVitals'),
    playerHealth: root.querySelector('#playerHealth'),
    damageFlash: root.querySelector('#damageFlash'),
    mapPanel: root.querySelector('#mapPanel'),
    mapButton: root.querySelector('#map'),
    cineButton: root.querySelector('#cine'),
    modeLabel: root.querySelector('#cameraMode'),
    frame: root.querySelector('#captureFrame'),
  };

  const listeners = [];
  const timers = new Set();
  const handlers = { onToggleMap: null, onToggleCapture: null };

  let messageTimer = null;
  let mapOpen = false;
  let captureMode = false;

  const on = (target, type, handler) => {
    if (!target) return;
    target.addEventListener(type, handler);
    listeners.push(() => target.removeEventListener(type, handler));
  };

  /** Tracked so a teardown mid-animation cannot leave a timer running. */
  const later = (fn, delay) => {
    const id = setTimeout(() => {
      timers.delete(id);
      fn();
    }, delay);
    timers.add(id);
    return id;
  };

  const toggleMap = () => {
    mapOpen = !mapOpen;
    elements.mapPanel?.classList.toggle('hidden', !mapOpen);
    handlers.onToggleMap?.(mapOpen);
  };

  const toggleCapture = () => {
    captureMode = !captureMode;
    elements.frame?.classList.toggle('active', captureMode);
    document.body.classList.toggle('capture', captureMode);
    handlers.onToggleCapture?.(captureMode);
    hud.say(captureMode ? '9:16 CAPTURE' : 'GAMEPLAY CAMERA');
  };

  on(elements.mapButton, 'click', toggleMap);
  on(elements.cineButton, 'click', toggleCapture);
  on(window, 'keydown', (event) => {
    if (event.code === 'KeyM') toggleMap();
    if (event.code === 'KeyC') toggleCapture();
  });

  const hud = {
    get isMapOpen() {
      return mapOpen;
    },
    get isCaptureMode() {
      return captureMode;
    },
    set onToggleMap(fn) {
      handlers.onToggleMap = fn;
    },
    set onToggleCapture(fn) {
      handlers.onToggleCapture = fn;
    },

    say(text, duration = 1400) {
      if (!elements.message) return;
      elements.message.textContent = text;
      clearTimeout(messageTimer);
      messageTimer = setTimeout(() => {
        elements.message.textContent = '';
      }, duration);
    },

    setObjective(text) {
      if (elements.objective) elements.objective.textContent = text;
    },

    setCameraMode(label) {
      if (elements.modeLabel) elements.modeLabel.textContent = label;
    },

    /** The Warden's title card, shown once during the reveal. */
    showNameCard(duration = 2600) {
      const card = elements.nameCard;
      if (!card) return;
      card.classList.remove('hidden');
      // A frame's delay so the transition actually runs from the hidden state.
      later(() => card.classList.add('show'), 30);
      later(() => card.classList.remove('show'), duration);
      later(() => card.classList.add('hidden'), duration + 800);
    },

    showBoss(visible) {
      elements.bossPanel?.classList.toggle('hidden', !visible);
      elements.playerVitals?.classList.toggle('hidden', !visible);
    },

    setBossHp(percent) {
      if (elements.bossHp) elements.bossHp.style.width = `${Math.max(0, percent)}%`;
    },

    setBossPosture(percent) {
      const clamped = Math.max(0, Math.min(100, percent));
      if (elements.bossPosture) elements.bossPosture.style.width = `${clamped}%`;
      elements.bossPostureBar?.classList.toggle(
        'critical',
        clamped > 0 && clamped <= POSTURE_CRITICAL * 100,
      );
    },

    setBossPhase(phase) {
      if (elements.bossPhase) elements.bossPhase.textContent = String(phase);
    },

    setPlayerHealth(percent) {
      if (elements.playerHealth) {
        elements.playerHealth.style.width = `${Math.max(0, Math.min(100, percent))}%`;
      }
    },

    /** A brief red edge vignette; the only feedback for taking a hit. */
    flashDamage() {
      const flash = elements.damageFlash;
      if (!flash) return;
      flash.classList.add('active');
      later(() => flash.classList.remove('active'), 90);
    },

    dispose() {
      clearTimeout(messageTimer);
      for (const id of timers) clearTimeout(id);
      timers.clear();
      document.body.classList.remove('capture');
      for (const off of listeners) off();
      listeners.length = 0;
    },
  };

  return hud;
}
