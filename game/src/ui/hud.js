/**
 * HUD wiring. Owns every DOM listener it creates and hands back a dispose so
 * nothing leaks when the session is torn down.
 */
export function createHud(root = document) {
  const elements = {
    objective: root.querySelector('#objective'),
    message: root.querySelector('#msg'),
    bossPanel: root.querySelector('#boss'),
    bossHp: root.querySelector('#hp'),
    bossPhase: root.querySelector('#phase'),
    mapPanel: root.querySelector('#mapPanel'),
    mapButton: root.querySelector('#map'),
    cineButton: root.querySelector('#cine'),
    modeLabel: root.querySelector('#cameraMode'),
    frame: root.querySelector('#captureFrame'),
  };

  const listeners = [];
  let messageTimer = null;
  const handlers = { onToggleMap: null, onToggleCapture: null };

  const on = (target, type, handler) => {
    if (!target) return;
    target.addEventListener(type, handler);
    listeners.push(() => target.removeEventListener(type, handler));
  };

  let mapOpen = false;
  let captureMode = false;

  const toggleMap = () => {
    mapOpen = !mapOpen;
    elements.mapPanel?.classList.toggle('hidden', !mapOpen);
    handlers.onToggleMap?.(mapOpen);
  };

  const toggleCapture = () => {
    captureMode = !captureMode;
    elements.frame?.classList.toggle('active', captureMode);
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

    showBoss(visible) {
      elements.bossPanel?.classList.toggle('hidden', !visible);
    },

    setBossHp(percent) {
      if (elements.bossHp) elements.bossHp.style.width = `${percent}%`;
    },

    setBossPhase(phase) {
      if (elements.bossPhase) elements.bossPhase.textContent = String(phase);
    },

    dispose() {
      clearTimeout(messageTimer);
      for (const off of listeners) off();
      listeners.length = 0;
    },
  };

  return hud;
}
