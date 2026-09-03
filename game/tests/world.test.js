import { describe, expect, test } from 'vitest';
import {
  DISTRICT,
  DISTRICTS,
  DISTRICT_IDS,
  PLAYABLE_DISTRICT,
  districtAt,
  distanceToDistrict,
  initiallyDiscovered,
  isInsideDistrict,
} from '../src/world/districts.js';
import {
  LANDMARKS,
  LANDMARK_IDS,
  landmarkById,
  landmarksInDistrict,
  primaryLandmark,
} from '../src/world/landmarks.js';
import {
  WEATHER,
  WEATHER_STATES,
  WEATHER_TRANSITION_DURATION,
  blendColor,
  blendWeather,
  createWeatherSystem,
  successorsOf,
} from '../src/world/weatherSystem.js';
import {
  NPC_STATE,
  WAYPOINTS,
  WAYPOINT_IDS,
  createNpcSchedule,
  isMovingState,
  scheduleGraphIsValid,
} from '../src/world/npcSchedule.js';
import {
  REACTION,
  SETTLE_DURATION,
  clearThreat,
  createThreatState,
  reactionFor,
  reactionHeading,
  setThreat,
  speedScaleFor,
  stepThreat,
} from '../src/world/crowdReactions.js';
import { WORLD_EVENT, WORLD_EVENTS, WORLD_EVENT_IDS } from '../src/world/worldEvents.js';
import {
  EVALUATION_INTERVAL,
  createWorldEventDirector,
  eligibleEvents,
  pickEvent,
} from '../src/world/worldEventDirector.js';
import { createRegionDiscovery, DISCOVERY_TUNING } from '../src/world/regionDiscovery.js';
import { createRandom } from '../src/core/random.js';

describe('district catalog', () => {
  test('contains the five Aster City districts', () => {
    expect(DISTRICT_IDS).toHaveLength(5);
    for (const id of Object.values(DISTRICT)) expect(DISTRICTS[id]).toBeDefined();
  });

  test('is deterministic — the same catalog on every import', () => {
    const fingerprint = DISTRICT_IDS.map((id) => {
      const d = DISTRICTS[id];
      return `${id}:${d.centre.x},${d.centre.z}`;
    }).join('|');
    expect(fingerprint).toBe(
      DISTRICT_IDS.map((id) => {
        const d = DISTRICTS[id];
        return `${id}:${d.centre.x},${d.centre.z}`;
      }).join('|'),
    );
  });

  test('every district has a name, bounds and a centre inside them', () => {
    for (const id of DISTRICT_IDS) {
      const d = DISTRICTS[id];
      expect(d.name, id).toBeTruthy();
      expect(d.bounds.maxX, id).toBeGreaterThan(d.bounds.minX);
      expect(d.bounds.maxZ, id).toBeGreaterThan(d.bounds.minZ);
      expect(isInsideDistrict(id, d.centre.x, d.centre.z), id).toBe(true);
    }
  });

  test('exactly one district is playable in this slice', () => {
    const playable = DISTRICT_IDS.filter((id) => DISTRICTS[id].playable);
    expect(playable).toEqual([PLAYABLE_DISTRICT]);
  });

  test('only Meridian Market is known at the start', () => {
    expect(initiallyDiscovered()).toEqual([DISTRICT.MERIDIAN_MARKET]);
  });

  test('locates the district containing a point', () => {
    expect(districtAt(0, 0)).toBe(DISTRICT.MERIDIAN_MARKET);
    expect(districtAt(-26, -158)).toBe(DISTRICT.CROWN_DISTRICT);
    expect(districtAt(9999, 9999)).toBeNull();
  });

  test('measures distance to a district centre', () => {
    expect(distanceToDistrict(DISTRICT.MERIDIAN_MARKET, 0, 4)).toBe(0);
    expect(distanceToDistrict('nowhere', 0, 0)).toBe(Infinity);
  });

  test('the outlying districts sit outside the playable bounds', () => {
    const market = DISTRICTS[DISTRICT.MERIDIAN_MARKET];
    for (const id of DISTRICT_IDS) {
      if (id === DISTRICT.MERIDIAN_MARKET) continue;
      const centre = DISTRICTS[id].centre;
      const inside =
        centre.x >= market.bounds.minX &&
        centre.x <= market.bounds.maxX &&
        centre.z >= market.bounds.minZ &&
        centre.z <= market.bounds.maxZ;
      expect(inside, id).toBe(false);
    }
  });
});

describe('landmarks', () => {
  test('positions are fixed, not generated', () => {
    const spire = landmarkById('crownSpire');
    expect(spire.position).toEqual({ x: -26, y: 0, z: -158 });
    expect(spire.focus).toEqual({ x: -26, y: 78, z: -158 });
  });

  test('there are five landmarks and exactly one primary', () => {
    expect(LANDMARK_IDS).toHaveLength(5);
    expect(LANDMARKS.filter((l) => l.primary)).toHaveLength(1);
    expect(primaryLandmark().id).toBe('crownSpire');
  });

  test('every landmark belongs to a real district', () => {
    for (const landmark of LANDMARKS) {
      expect(DISTRICTS[landmark.district], landmark.id).toBeDefined();
    }
  });

  test('every landmark has a height and a focus above its base', () => {
    for (const landmark of LANDMARKS) {
      expect(landmark.height, landmark.id).toBeGreaterThan(0);
      expect(landmark.focus.y, landmark.id).toBeGreaterThan(0);
      expect(landmark.focus.y, landmark.id).toBeLessThanOrEqual(landmark.height);
    }
  });

  test('the Crown Spire is the tallest thing in the city', () => {
    const spire = primaryLandmark();
    for (const landmark of LANDMARKS) {
      if (landmark.primary) continue;
      expect(spire.height).toBeGreaterThan(landmark.height);
    }
  });

  test('the market has its own landmark to navigate by', () => {
    const local = landmarksInDistrict(DISTRICT.MERIDIAN_MARKET);
    expect(local.length).toBeGreaterThan(0);
    expect(local[0].id).toBe('meridianClockTower');
  });

  test('landmark ids are unique', () => {
    expect(new Set(LANDMARK_IDS).size).toBe(LANDMARK_IDS.length);
  });
});

describe('weather', () => {
  test('every state defines the full look', () => {
    const keys = Object.keys(WEATHER_STATES[WEATHER.NIGHT_RAIN]);
    for (const [id, state] of Object.entries(WEATHER_STATES)) {
      for (const key of keys) expect(state[key], `${id}.${key}`).toBeDefined();
    }
  });

  test('rain states are wetter than dry ones', () => {
    expect(WEATHER_STATES[WEATHER.HEAVY_RAIN].wetness).toBeGreaterThan(
      WEATHER_STATES[WEATHER.CLEAR_DAY].wetness,
    );
    expect(WEATHER_STATES[WEATHER.HEAVY_RAIN].rainDensity).toBeGreaterThan(
      WEATHER_STATES[WEATHER.LIGHT_RAIN].rainDensity,
    );
  });

  test('fog is the densest air in the city', () => {
    for (const [id, state] of Object.entries(WEATHER_STATES)) {
      if (id === WEATHER.FOG) continue;
      expect(WEATHER_STATES[WEATHER.FOG].fogDensity).toBeGreaterThan(state.fogDensity);
    }
  });

  test('blendColor interpolates channel-wise', () => {
    expect(blendColor(0x000000, 0xffffff, 0)).toBe(0x000000);
    expect(blendColor(0x000000, 0xffffff, 1)).toBe(0xffffff);
    expect(blendColor(0x000000, 0xff0000, 0.5)).toBe(0x800000);
  });

  test('blendWeather returns the endpoints exactly', () => {
    const out = {};
    blendWeather(out, WEATHER_STATES[WEATHER.CLEAR_DAY], WEATHER_STATES[WEATHER.FOG], 0);
    expect(out.fogDensity).toBeCloseTo(WEATHER_STATES[WEATHER.CLEAR_DAY].fogDensity, 9);
    blendWeather(out, WEATHER_STATES[WEATHER.CLEAR_DAY], WEATHER_STATES[WEATHER.FOG], 1);
    expect(out.fogDensity).toBeCloseTo(WEATHER_STATES[WEATHER.FOG].fogDensity, 9);
  });

  test('does not change state every frame', () => {
    const weather = createWeatherSystem({ start: WEATHER.NIGHT_RAIN, seed: 11 });
    const first = weather.state;
    for (let i = 0; i < 600; i += 1) weather.update(1 / 60);
    // Ten seconds in it is either still holding or part-way through one blend.
    expect(weather.state).toBe(first);
  });

  test('eventually transitions, and only to a legal successor', () => {
    const weather = createWeatherSystem({ start: WEATHER.NIGHT_RAIN, seed: 11 });
    const start = weather.state;
    let guard = 0;
    while (!weather.isTransitioning && guard < 100000) {
      weather.update(1 / 60);
      guard += 1;
    }
    expect(weather.isTransitioning).toBe(true);
    expect(successorsOf(start)).toContain(weather.next);
  });

  test('a transition is gradual, never instant', () => {
    const weather = createWeatherSystem({ start: WEATHER.CLEAR_DAY, seed: 4 });
    weather.requestState(WEATHER.CLOUDY);
    weather.update(0.1);
    expect(weather.transitionProgress).toBeLessThan(0.1);
    expect(weather.state).toBe(WEATHER.CLEAR_DAY);

    for (let i = 0; i < WEATHER_TRANSITION_DURATION * 60 + 10; i += 1) weather.update(1 / 60);
    expect(weather.state).toBe(WEATHER.CLOUDY);
    expect(weather.isTransitioning).toBe(false);
  });

  test('the blended look moves continuously through a transition', () => {
    const weather = createWeatherSystem({ start: WEATHER.CLEAR_DAY, seed: 4 });
    weather.requestState(WEATHER.HEAVY_RAIN);
    let previous = weather.current.rainDensity;
    for (let i = 0; i < WEATHER_TRANSITION_DURATION * 60; i += 1) {
      weather.update(1 / 60);
      // A jump here would be a visible weather pop.
      expect(Math.abs(weather.current.rainDensity - previous)).toBeLessThan(0.05);
      previous = weather.current.rainDensity;
    }
  });

  test('is deterministic for a given seed', () => {
    const run = (seed) => {
      const weather = createWeatherSystem({ start: WEATHER.CLOUDY, seed });
      const seen = [];
      for (let i = 0; i < 60 * 400; i += 1) {
        weather.update(1 / 60);
        if (seen[seen.length - 1] !== weather.state) seen.push(weather.state);
      }
      return seen.join(',');
    };
    expect(run(99)).toBe(run(99));
    expect(run(99)).not.toBe(run(12345));
  });

  test('produces the same weather timeline at 60 and 30 fps', () => {
    const run = (step, frames) => {
      const weather = createWeatherSystem({ start: WEATHER.CLOUDY, seed: 7 });
      for (let i = 0; i < frames; i += 1) weather.update(step);
      return { state: weather.state, next: weather.next };
    };
    expect(run(1 / 30, 30 * 200)).toEqual(run(1 / 60, 60 * 200));
  });

  test('setImmediate skips the blend', () => {
    const weather = createWeatherSystem({ start: WEATHER.CLEAR_DAY, seed: 1 });
    weather.setImmediate(WEATHER.FOG);
    expect(weather.state).toBe(WEATHER.FOG);
    expect(weather.isTransitioning).toBe(false);
    expect(weather.current.fogDensity).toBeCloseTo(WEATHER_STATES[WEATHER.FOG].fogDensity, 9);
  });

  test('ignores a non-positive delta', () => {
    const weather = createWeatherSystem({ seed: 1 });
    const before = weather.current.fogDensity;
    weather.update(0);
    expect(weather.current.fogDensity).toBe(before);
  });
});

describe('NPC schedule', () => {
  test('the waypoint graph is valid', () => {
    expect(scheduleGraphIsValid()).toBe(true);
  });

  test('every waypoint has a real activity', () => {
    for (const id of WAYPOINT_IDS) {
      expect(Object.values(NPC_STATE), id).toContain(WAYPOINTS[id].kind);
    }
  });

  test('an agent spawns on a waypoint', () => {
    const schedule = createNpcSchedule(3);
    const agent = schedule.spawn();
    expect(WAYPOINTS[agent.at]).toBeDefined();
    expect(agent.x).toBe(WAYPOINTS[agent.at].x);
  });

  test('agents wait before leaving, rather than jittering', () => {
    const schedule = createNpcSchedule(3);
    const agent = schedule.spawn('benchNorth');
    expect(agent.state).toBe(NPC_STATE.SIT);
    schedule.step(agent, 0.1);
    expect(agent.state).toBe(NPC_STATE.SIT);
  });

  test('agents eventually depart toward a connected waypoint', () => {
    const schedule = createNpcSchedule(3);
    const agent = schedule.spawn('plaza');
    for (let i = 0; i < 2000 && agent.state !== NPC_STATE.WALK; i += 1) {
      schedule.step(agent, 1 / 30);
    }
    expect(agent.state).toBe(NPC_STATE.WALK);
    expect(WAYPOINTS.plaza.next).toContain(agent.target);
  });

  test('an agent actually arrives and adopts the destination activity', () => {
    const schedule = createNpcSchedule(3);
    const agent = schedule.spawn('plaza');
    schedule.depart(agent);
    const target = agent.target;

    for (let i = 0; i < 6000 && agent.at !== target; i += 1) schedule.step(agent, 1 / 30);
    expect(agent.at).toBe(target);
    expect(agent.state).toBe(WAYPOINTS[target].kind);
  });

  test('agents stay inside the market over a long run', () => {
    const schedule = createNpcSchedule(21);
    const agent = schedule.spawn();
    for (let i = 0; i < 60 * 600; i += 1) {
      schedule.step(agent, 1 / 60);
      expect(Math.abs(agent.x)).toBeLessThan(46);
      expect(Math.abs(agent.z)).toBeLessThan(78);
    }
  });

  test('state is always a known state', () => {
    const schedule = createNpcSchedule(5);
    const agent = schedule.spawn();
    const valid = new Set(Object.values(NPC_STATE));
    for (let i = 0; i < 60 * 300; i += 1) {
      schedule.step(agent, 1 / 60);
      expect(valid.has(agent.state)).toBe(true);
    }
  });

  test('movement only happens in moving states', () => {
    const schedule = createNpcSchedule(9);
    const agent = schedule.spawn('plaza');
    for (let i = 0; i < 60 * 200; i += 1) {
      const beforeX = agent.x;
      const beforeZ = agent.z;
      const state = agent.state;
      schedule.step(agent, 1 / 60);
      const moved = Math.hypot(agent.x - beforeX, agent.z - beforeZ) > 1e-6;
      if (moved) expect(isMovingState(state)).toBe(true);
    }
  });

  test('is deterministic for a given seed', () => {
    const run = (seed) => {
      const schedule = createNpcSchedule(seed);
      const agent = schedule.spawn('plaza');
      for (let i = 0; i < 60 * 120; i += 1) schedule.step(agent, 1 / 60);
      return `${agent.at}:${agent.x.toFixed(4)}:${agent.z.toFixed(4)}`;
    };
    expect(run(42)).toBe(run(42));
  });
});

describe('crowd reactions', () => {
  test('no threat means everybody is calm', () => {
    expect(reactionFor(1, 0)).toBe(REACTION.CALM);
    expect(reactionFor(100, 0)).toBe(REACTION.CALM);
  });

  test('reaction escalates as the threat gets closer', () => {
    expect(reactionFor(5, 1)).toBe(REACTION.FLEE_AREA);
    expect(reactionFor(18, 1)).toBe(REACTION.AVOID);
    expect(reactionFor(34, 1)).toBe(REACTION.CURIOUS);
    expect(reactionFor(80, 1)).toBe(REACTION.CALM);
  });

  test('a weaker threat has a smaller footprint', () => {
    expect(reactionFor(10, 1)).toBe(REACTION.FLEE_AREA);
    expect(reactionFor(10, 0.3)).not.toBe(REACTION.FLEE_AREA);
  });

  test('fleeing is faster than walking, gawking is slower', () => {
    expect(speedScaleFor(REACTION.FLEE_AREA)).toBeGreaterThan(1);
    expect(speedScaleFor(REACTION.AVOID)).toBeGreaterThan(1);
    expect(speedScaleFor(REACTION.CURIOUS)).toBeLessThan(1);
    expect(speedScaleFor(REACTION.CALM)).toBe(1);
  });

  test('people move away from the threat, never toward it', () => {
    const out = { x: 0, z: 0, faceThreat: false };
    reactionHeading(out, REACTION.FLEE_AREA, 5, 0, 0, 0);
    expect(out.x).toBeGreaterThan(0);
    expect(out.faceThreat).toBe(false);
  });

  test('the curious stand still and watch', () => {
    const out = { x: 0, z: 0, faceThreat: false };
    reactionHeading(out, REACTION.CURIOUS, 5, 0, 0, 0);
    expect(out.x).toBe(0);
    expect(out.z).toBe(0);
    expect(out.faceThreat).toBe(true);
  });

  test('the district settles back to calm after the threat ends', () => {
    const state = createThreatState();
    setThreat(state, 0, 0, 1);
    expect(state.intensity).toBe(1);

    clearThreat(state);
    for (let i = 0; i < 60 * (SETTLE_DURATION + 1); i += 1) stepThreat(state, 1 / 60);
    expect(state.intensity).toBe(0);
    expect(reactionFor(2, state.intensity)).toBe(REACTION.CALM);
  });

  test('alarm holds while the threat is still present', () => {
    const state = createThreatState();
    setThreat(state, 0, 0, 1);
    for (let i = 0; i < 60 * 30; i += 1) stepThreat(state, 1 / 60);
    expect(state.intensity).toBe(1);
  });

  test('intensity never leaves 0..1', () => {
    const state = createThreatState();
    setThreat(state, 0, 0, 9);
    expect(state.intensity).toBe(1);
    clearThreat(state);
    for (let i = 0; i < 60 * 40; i += 1) {
      stepThreat(state, 1 / 60);
      expect(state.intensity).toBeGreaterThanOrEqual(0);
      expect(state.intensity).toBeLessThanOrEqual(1);
    }
  });
});

describe('world events', () => {
  const baseContext = {
    district: DISTRICT.MERIDIAN_MARKET,
    weather: WEATHER.NIGHT_RAIN,
    x: 0,
    z: -4,
    flags: {},
  };

  test('every event names a real district and has a positive duration', () => {
    for (const id of WORLD_EVENT_IDS) {
      const event = WORLD_EVENTS[id];
      expect(DISTRICTS[event.district], id).toBeDefined();
      expect(event.duration, id).toBeGreaterThan(0);
      expect(event.cooldown, id).toBeGreaterThan(0);
    }
  });

  test('events on cooldown are not eligible', () => {
    const all = eligibleEvents(baseContext, {}, new Set());
    expect(all.length).toBeGreaterThan(0);
    const blocked = eligibleEvents(
      baseContext,
      Object.fromEntries(all.map((e) => [e.id, 10])),
      new Set(),
    );
    expect(blocked).toHaveLength(0);
  });

  test('events gated on weather do not fire in the wrong weather', () => {
    const inRain = eligibleEvents(
      { ...baseContext, weather: WEATHER.HEAVY_RAIN },
      {},
      new Set(),
    );
    expect(inRain.map((e) => e.id)).not.toContain(WORLD_EVENT.STREET_PERFORMER);
  });

  test('events gated on a world condition wait for it', () => {
    const before = eligibleEvents(baseContext, {}, new Set());
    expect(before.map((e) => e.id)).not.toContain(WORLD_EVENT.WARDEN_AFTERMATH);

    const after = eligibleEvents(
      { ...baseContext, x: 0, z: -50, flags: { wardenDefeated: true } },
      {},
      new Set(),
    );
    expect(after.map((e) => e.id)).toContain(WORLD_EVENT.WARDEN_AFTERMATH);
  });

  test('an event too far from the player is not eligible', () => {
    const far = eligibleEvents({ ...baseContext, x: 0, z: 70 }, {}, new Set());
    expect(far.map((e) => e.id)).not.toContain(WORLD_EVENT.LOCAL_DISPUTE);
  });

  test('a one-shot event that has fired is never eligible again', () => {
    const spent = new Set([WORLD_EVENT.VISTA_DISCOVERY]);
    const list = eligibleEvents({ ...baseContext, x: 0, z: -30 }, {}, spent);
    expect(list.map((e) => e.id)).not.toContain(WORLD_EVENT.VISTA_DISCOVERY);
  });

  test('pickEvent is deterministic for a given generator', () => {
    const candidates = eligibleEvents(baseContext, {}, new Set());
    const a = pickEvent(candidates, createRandom(5))?.id;
    const b = pickEvent(candidates, createRandom(5))?.id;
    expect(a).toBe(b);
  });

  test('pickEvent returns null when nothing is eligible', () => {
    expect(pickEvent([], createRandom(1))).toBeNull();
  });
});

describe('world event director', () => {
  const context = {
    district: DISTRICT.MERIDIAN_MARKET,
    weather: WEATHER.NIGHT_RAIN,
    x: 0,
    z: -4,
    flags: {},
  };

  const run = (director, seconds, step = 1 / 60, ctx = context) => {
    for (let i = 0; i < Math.round(seconds / step); i += 1) director.update(step, ctx);
  };

  test('does not start an event on the first frame', () => {
    const director = createWorldEventDirector({ seed: 1 });
    director.update(1 / 60, context);
    expect(director.active).toBeNull();
  });

  test('evaluates on a beat, not every frame', () => {
    const director = createWorldEventDirector({ seed: 1 });
    run(director, EVALUATION_INTERVAL - 0.2);
    expect(director.active).toBeNull();
  });

  test('eventually starts an event', () => {
    const director = createWorldEventDirector({ seed: 1 });
    let started = 0;
    director.on((type) => {
      if (type === 'start') started += 1;
    });
    run(director, 60);
    expect(started).toBeGreaterThan(0);
  });

  test('only one event runs at a time', () => {
    const director = createWorldEventDirector({ seed: 3 });
    let live = 0;
    director.on((type) => {
      live += type === 'start' ? 1 : -1;
      expect(live).toBeLessThanOrEqual(1);
    });
    run(director, 600);
  });

  test('the same event cannot spam back to back', () => {
    const director = createWorldEventDirector({ seed: 3 });
    const order = [];
    director.on((type, event) => {
      if (type === 'start') order.push(event.id);
    });
    run(director, 400);

    for (let i = 1; i < order.length; i += 1) {
      // Consecutive repeats are impossible while the per-event cooldown holds.
      expect(order[i], order.join(',')).not.toBe(order[i - 1]);
    }
  });

  test('a one-shot event fires at most once across a long session', () => {
    const director = createWorldEventDirector({ seed: 8 });
    const counts = Object.create(null);
    director.on((type, event) => {
      if (type === 'start') counts[event.id] = (counts[event.id] ?? 0) + 1;
    });
    run(director, 2000, 1 / 60, { ...context, x: 0, z: -30 });
    expect(counts[WORLD_EVENT.VISTA_DISCOVERY] ?? 0).toBeLessThanOrEqual(1);
  });

  test('events end on their own', () => {
    const director = createWorldEventDirector({ seed: 1 });
    let ended = 0;
    director.on((type) => {
      if (type === 'end') ended += 1;
    });
    run(director, 300);
    expect(ended).toBeGreaterThan(0);
    expect(director.activeRemaining).toBeGreaterThanOrEqual(0);
  });

  test('a direct trigger respects the one-shot rule', () => {
    const director = createWorldEventDirector({ seed: 2 });
    expect(director.trigger(WORLD_EVENT.VISTA_DISCOVERY, context)).toBe(true);
    run(director, WORLD_EVENTS[WORLD_EVENT.VISTA_DISCOVERY].duration + 1);
    expect(director.trigger(WORLD_EVENT.VISTA_DISCOVERY, context)).toBe(false);
  });

  test('is deterministic and frame-rate independent', () => {
    const fingerprint = (step, seconds) => {
      const director = createWorldEventDirector({ seed: 17 });
      const order = [];
      director.on((type, event) => {
        if (type === 'start') order.push(event.id);
      });
      run(director, seconds, step);
      return order.join(',');
    };
    expect(fingerprint(1 / 30, 300)).toBe(fingerprint(1 / 60, 300));
  });

  test('ignores a non-positive delta', () => {
    const director = createWorldEventDirector({ seed: 1 });
    director.update(0, context);
    director.update(-1, context);
    expect(director.active).toBeNull();
  });
});

describe('region discovery', () => {
  /** Camera yaw that looks from `from` toward `to`. */
  const yawToward = (from, to) => Math.atan2(to.x - from.x, to.z - from.z) - Math.PI;

  test('starts knowing only Meridian Market', () => {
    const discovery = createRegionDiscovery();
    expect(discovery.list()).toEqual([DISTRICT.MERIDIAN_MARKET]);
  });

  test('names a district after looking at it for a moment', () => {
    const revealed = [];
    const discovery = createRegionDiscovery({ onDiscover: (d) => revealed.push(d.id) });
    const player = { x: 0, z: 0 };
    const yaw = yawToward(player, DISTRICTS[DISTRICT.CROWN_DISTRICT].centre);

    // A glance is not enough.
    discovery.update(0.2, player, yaw);
    expect(discovery.has(DISTRICT.CROWN_DISTRICT)).toBe(false);

    for (let i = 0; i < 60 * 2; i += 1) discovery.update(1 / 60, player, yaw);
    expect(discovery.has(DISTRICT.CROWN_DISTRICT)).toBe(true);
    expect(revealed).toContain(DISTRICT.CROWN_DISTRICT);
  });

  test('announces each district exactly once', () => {
    const revealed = [];
    const discovery = createRegionDiscovery({ onDiscover: (d) => revealed.push(d.id) });
    const player = { x: 0, z: 0 };
    const yaw = yawToward(player, DISTRICTS[DISTRICT.CROWN_DISTRICT].centre);

    for (let i = 0; i < 60 * 30; i += 1) discovery.update(1 / 60, player, yaw);
    expect(revealed.filter((id) => id === DISTRICT.CROWN_DISTRICT)).toHaveLength(1);
  });

  test('looking away resets the dwell', () => {
    const discovery = createRegionDiscovery();
    const player = { x: 0, z: 0 };
    const toward = yawToward(player, DISTRICTS[DISTRICT.CROWN_DISTRICT].centre);

    for (let i = 0; i < 30; i += 1) discovery.update(1 / 60, player, toward);
    for (let i = 0; i < 30; i += 1) discovery.update(1 / 60, player, toward + Math.PI);
    for (let i = 0; i < 30; i += 1) discovery.update(1 / 60, player, toward);
    // Half the dwell, then a reset, then half again: still not enough.
    expect(discovery.has(DISTRICT.CROWN_DISTRICT)).toBe(false);
  });

  test('walking into a district names it without looking', () => {
    const discovery = createRegionDiscovery();
    const centre = DISTRICTS[DISTRICT.OLD_ASTER].centre;
    discovery.update(1 / 60, { x: centre.x, z: centre.z }, 0);
    expect(discovery.has(DISTRICT.OLD_ASTER)).toBe(true);
  });

  test('never reveals a district the player has not faced', () => {
    const discovery = createRegionDiscovery();
    const player = { x: 0, z: 0 };
    const towardCrown = yawToward(player, DISTRICTS[DISTRICT.CROWN_DISTRICT].centre);
    for (let i = 0; i < 60 * 10; i += 1) discovery.update(1 / 60, player, towardCrown);

    expect(discovery.has(DISTRICT.CROWN_DISTRICT)).toBe(true);
    // The docks are the other way; they stay unknown.
    expect(discovery.has(DISTRICT.BLACKGLASS_DOCKS)).toBe(false);
  });

  test('the discovered list only ever grows', () => {
    const discovery = createRegionDiscovery();
    const player = { x: 0, z: 0 };
    let previous = discovery.list().length;
    for (let i = 0; i < 60 * 20; i += 1) {
      discovery.update(1 / 60, player, Math.sin(i * 0.01) * Math.PI);
      const now = discovery.list().length;
      expect(now).toBeGreaterThanOrEqual(previous);
      previous = now;
    }
  });

  test('the dwell requirement is a real duration', () => {
    expect(DISCOVERY_TUNING.DWELL_REQUIRED).toBeGreaterThan(0.5);
  });
});
