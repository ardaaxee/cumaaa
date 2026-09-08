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
    mapRegions: root.querySelector('#mapRegions'),
    regionReveal: root.querySelector('#regionReveal'),
    regionName: root.querySelector('#regionName'),
    mapButton: root.querySelector('#map'),
    cineButton: root.querySelector('#cine'),
    modeLabel: root.querySelector('#cameraMode'),
    frame: root.querySelector('#captureFrame'),
    closeMap: root.querySelector('#closeMap'),
    clearWaypoint: root.querySelector('#clearWaypoint'),
    waypoint: root.querySelector('#waypoint'),
    waypointArrow: root.querySelector('#waypointArrow'),
    waypointName: root.querySelector('#waypointName'),
    waypointDistance: root.querySelector('#waypointDistance'),
  };

  const listeners = [];
  const timers = new Set();
  const handlers = { onToggleMap: null, onToggleCapture: null, onSelectWaypoint: null, onClearWaypoint: null };

  let messageTimer = null;
  let mapOpen = false;
  let captureMode = false;
  let currentRegion = null;
  let waypointTarget = null;
  const regionItems = new Map();
  const markRegion = (item, id) => {
    const current = id === currentRegion;
    item.classList.toggle('current', current);
    if (current) item.setAttribute('aria-current', 'location');
    else item.removeAttribute('aria-current');
  };

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
    elements.mapButton?.setAttribute('aria-expanded', String(mapOpen));
    handlers.onToggleMap?.(mapOpen);
    if (mapOpen) elements.closeMap?.focus();
    else elements.mapButton?.focus();
  };

  const toggleCapture = () => {
    captureMode = !captureMode;
    elements.frame?.classList.toggle('active', captureMode);
    document.body.classList.toggle('capture', captureMode);
    handlers.onToggleCapture?.(captureMode);
    hud.say(captureMode ? '9:16 CAPTURE' : 'GAMEPLAY CAMERA');
  };

  on(elements.mapButton, 'click', toggleMap);
  on(elements.closeMap, 'click', () => { if (mapOpen) toggleMap(); });
  on(elements.clearWaypoint, 'click', () => handlers.onClearWaypoint?.());
  // Delegate clicks: rebuilding the discovery list never accumulates listeners.
  on(elements.mapRegions, 'click', (event) => {
    const button = event.target.closest?.('button[data-region]');
    if (!button || !elements.mapRegions.contains(button)) return;
    if (handlers.onSelectWaypoint?.(button.dataset.region)) toggleMap();
  });
  on(elements.cineButton, 'click', toggleCapture);
  on(window, 'keydown', (event) => {
    if (event.repeat || event.target?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target?.tagName)) return;
    if (event.code === 'Escape' && mapOpen) toggleMap();
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
    set onSelectWaypoint(fn) { handlers.onSelectWaypoint = fn; },
    set onClearWaypoint(fn) { handlers.onClearWaypoint = fn; },

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

    /**
     * Names a district the player has just found. Deliberately small: two lines
     * that fade in and out, never a banner across the screen.
     */
    revealRegion(district) {
      const panel = elements.regionReveal;
      if (!panel || !elements.regionName) return;
      elements.regionName.textContent = district.name;
      panel.classList.remove('hidden');
      later(() => panel.classList.add('show'), 30);
      later(() => panel.classList.remove('show'), 3200);
      later(() => panel.classList.add('hidden'), 4000);
    },

    /**
     * Rebuilds the map from the districts the player has actually seen. The map
     * never lists somewhere they have not found.
     */
    setDiscoveredRegions(districts) {
      const list = elements.mapRegions;
      if (!list) return;
      list.textContent = '';
      regionItems.clear();
      for (const district of districts) {
        const item = document.createElement('li');
        const name = document.createElement('b');
        name.textContent = district.name;
        const subtitle = document.createElement('small');
        subtitle.textContent = district.subtitle;
        item.appendChild(name);
        item.appendChild(subtitle);
        const status = document.createElement('small');
        status.textContent = district.walkable ? 'OPEN FOR EXPLORATION' : 'DISTANT LANDMARK';
        item.appendChild(status);
        if (district.walkable) {
          const button = document.createElement('button');
          button.type = 'button';
          button.dataset.region = district.id;
          button.textContent = 'HEDEF SEÇ';
          button.setAttribute('aria-label', `${district.name} hedefini seç`);
          button.setAttribute('aria-pressed', String(waypointTarget === district.id));
          item.appendChild(button);
        }
        regionItems.set(district.id, item);
        markRegion(item, district.id);
        list.appendChild(item);
      }
    },

    setCurrentRegion(id) {
      if (id === currentRegion) return;
      currentRegion = id;
      for (const [regionId, item] of regionItems) markRegion(item, regionId);
    },

    setWaypointTarget(id) {
      waypointTarget = id;
      elements.clearWaypoint?.classList.toggle('hidden', !id);
      for (const [regionId, item] of regionItems) {
        item.querySelector('button')?.setAttribute('aria-pressed', String(regionId === id));
      }
    },

    setWaypoint(guidance) {
      elements.waypoint?.classList.toggle('hidden', !guidance);
      if (!guidance) return;
      if (elements.waypointName) elements.waypointName.textContent = guidance.name;
      if (elements.waypointDistance) elements.waypointDistance.textContent = `${Math.round(guidance.distance)} m · KUŞ UÇUŞU`;
      if (elements.waypointArrow) elements.waypointArrow.style.transform = `rotate(${guidance.angle}rad)`;
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
