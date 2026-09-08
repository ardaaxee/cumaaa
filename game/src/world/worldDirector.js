import * as THREE from 'three';
import { damp } from '../core/mathx.js';
import { WEATHER, createWeatherSystem } from './weatherSystem.js';
import { createThreatState, clearThreat, setThreat, stepThreat } from './crowdReactions.js';
import { createWorldEventDirector } from './worldEventDirector.js';
import { WORLD_EVENT } from './worldEvents.js';
import { createRegionDiscovery } from './regionDiscovery.js';
import { createExplorationSave } from './explorationSave.js';
import { createWaypointTracker } from './waypoint.js';
import { createWorldAudio } from './worldAudio.js';
import { DISTRICTS, districtAt, PLAYABLE_DISTRICT } from './districts.js';

/**
 * The living world, in one place.
 *
 * Owns the weather, the crowd's mood, world events, region discovery and the
 * ambience mix, and applies the weather to everything that has to look like it.
 * Systems are updated here rather than in `main.js` so the world has one budget
 * and one order.
 *
 * The world runs on real time, not gameplay time: the rain does not slow down
 * because the player landed a perfect parry.
 */

/** Distant systems are stepped on a beat rather than every frame. */
const SLOW_INTERVAL = 0.25;

export function createWorldDirector({
  scene,
  city,
  skyline,
  rain,
  crowd,
  npcs,
  cityMotion,
  wetSurfaces,
  audio,
  hud,
}) {
  const weather = createWeatherSystem({ start: WEATHER.NIGHT_RAIN, seed: 0x5e0a17 });
  const threat = createThreatState();
  const events = createWorldEventDirector({ seed: 0x77c17e });
  const worldAudio = createWorldAudio(audio);

  const explorationSave = createExplorationSave();
  const waypoint = createWaypointTracker();
  const discovery = createRegionDiscovery({
    restored: explorationSave.load(),
    onDiscover: (district) => {
      explorationSave.save(discovery.list());
      hud?.revealRegion?.(district);
      hud?.setDiscoveredRegions?.(discovery.list().map((id) => DISTRICTS[id]));
    },
  });
  if (hud) {
    hud.onSelectWaypoint = (id) => {
      const selected = waypoint.select(id, discovery.list());
      if (selected) hud.setWaypointTarget?.(id);
      return selected;
    };
    hud.onClearWaypoint = () => {
      waypoint.clear();
      hud.setWaypointTarget?.(null);
      hud.setWaypoint?.(null);
    };
  }

  // Reused every frame; the world allocates nothing on the hot path.
  const fogColor = new THREE.Color();
  const skyColor = new THREE.Color();
  const audioFlags = { transitRunning: false, eventCrowd: false };
  const eventContext = {
    district: PLAYABLE_DISTRICT,
    weather: WEATHER.NIGHT_RAIN,
    x: 0,
    z: 0,
    flags: { wardenDefeated: false },
  };
  const playerPoint = { x: 0, y: 0, z: 0 };

  let slowAccrued = 0;
  /** Extra rain layered on by the rain-surge event. */
  let rainBoost = 0;
  let crowdEventTimer = 0;

  const listeners = [];
  const emit = (type, payload) => {
    for (let i = 0; i < listeners.length; i += 1) listeners[i](type, payload);
  };

  events.on((type, event) => {
    if (type === 'start') onEventStart(event);
    if (type === 'end') onEventEnd(event);
    emit(type === 'start' ? 'eventStart' : 'eventEnd', event);
  });

  function onEventStart(event) {
    switch (event.id) {
      case WORLD_EVENT.TRANSIT_ARRIVAL:
        cityMotion?.scheduleTransit();
        audio?.play('heavyMove');
        break;
      case WORLD_EVENT.RAIN_SURGE:
        rainBoost = 0.45;
        break;
      case WORLD_EVENT.MARKET_GATHERING:
      case WORLD_EVENT.STREET_PERFORMER:
      case WORLD_EVENT.LOCAL_DISPUTE:
        crowdEventTimer = event.duration;
        break;
      case WORLD_EVENT.DISTANT_ANNOUNCEMENT:
        audio?.play('anticipation');
        break;
      case WORLD_EVENT.VISTA_DISCOVERY:
        // Seeing the spire clear the rooftops names the district it stands in.
        discovery.discover('crownDistrict');
        break;
      default:
        break;
    }
    hud?.say?.(event.label, 2600);
  }

  function onEventEnd(event) {
    if (event.id === WORLD_EVENT.RAIN_SURGE) rainBoost = 0;
  }

  /** Pushes the blended weather onto everything that shows it. */
  function applyWeather(dt) {
    const w = weather.current;

    if (scene.fog) {
      fogColor.setHex(w.fogColor);
      scene.fog.color.copy(fogColor);
      scene.fog.density = damp(scene.fog.density, w.fogDensity, 2.5, dt);
    }
    skyColor.setHex(w.skyColor);
    scene.background?.lerp?.(skyColor, Math.min(1, dt * 2.5));

    city?.setLighting?.(w.ambient, w.keyLight, w.windowLight);

    const rainDensity = Math.min(1, w.rainDensity + rainBoost);
    rain?.setIntensity?.(rainDensity);
    crowd?.setRainWeight?.(rainDensity);
    npcs?.setRainWeight?.(rainDensity);
    wetSurfaces?.setWetness?.(w.wetness);
    cityMotion?.setVisibility?.(w.skylineFade);
  }

  return {
    weather,
    events,
    discovery,
    threat,

    on(listener) {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index !== -1) listeners.splice(index, 1);
      };
    },

    /** The Warden is active at this point; the district should react. */
    reportThreat(x, z, strength = 1) {
      setThreat(threat, x, z, strength);
    },
    clearThreat() {
      clearThreat(threat);
    },
    /** Unlocks the aftermath event. */
    setWardenDefeated(value) {
      eventContext.flags.wardenDefeated = value;
    },

    /** Used by the hero moment to ask for the sky it needs. */
    requestWeather(state) {
      return weather.requestState(state);
    },

    get currentWeather() {
      return weather.current;
    },
    get weatherState() {
      return weather.state;
    },
    get discoveredRegions() {
      return discovery.list();
    },

    /**
     * @param {number} dt   real seconds; the world ignores hit-stop
     * @param {object} player the locomotion state
     * @param {number} cameraYaw for region discovery
     */
    update(dt, player, cameraYaw) {
      if (!(dt > 0)) return;

      weather.update(dt);
      applyWeather(dt);
      stepThreat(threat, dt);

      playerPoint.x = player.position.x;
      playerPoint.y = player.position.y;
      playerPoint.z = player.position.z;

      // Per-frame systems.
      npcs?.update(dt, player.position, threat);
      crowd?.update(dt, player.position.x, player.position.z, threat);
      cityMotion?.update(dt);
      wetSurfaces?.update(dt);

      if (crowdEventTimer > 0) crowdEventTimer = Math.max(0, crowdEventTimer - dt);

      // Beat systems: nothing here needs a decision every frame.
      slowAccrued += dt;
      if (slowAccrued >= SLOW_INTERVAL) {
        const step = slowAccrued;
        slowAccrued = 0;

        eventContext.district = districtAt(player.position.x, player.position.z) ?? PLAYABLE_DISTRICT;
        eventContext.weather = weather.state;
        eventContext.x = player.position.x;
        eventContext.z = player.position.z;
        events.update(step, eventContext);

        discovery.update(step, player.position, cameraYaw);
        hud?.setCurrentRegion?.(districtAt(player.position.x, player.position.z));
        const guidance = waypoint.update(player.position, cameraYaw);
        if (guidance?.arrived) {
          hud?.say?.(`${guidance.name} · VARILDI`, 2400);
          hud?.setWaypointTarget?.(null);
        }
        hud?.setWaypoint?.(guidance?.arrived ? null : guidance);

        audioFlags.transitRunning = cityMotion?.isTransitRunning ?? false;
        audioFlags.eventCrowd = crowdEventTimer > 0;
        worldAudio.update(step, playerPoint, { ...weather.current, state: weather.state }, audioFlags);
      }
    },

    dispose() {
      if (hud) {
        hud.onSelectWaypoint = null;
        hud.onClearWaypoint = null;
      }
      worldAudio.silence();
      listeners.length = 0;
    },
  };
}

export const WORLD_TUNING = { SLOW_INTERVAL };
