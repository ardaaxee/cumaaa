import { createRandom } from '../core/random.js';

/**
 * What Meridian Market's residents are actually doing.
 *
 * A destination graph, not a random walk: an NPC leaves a doorway, walks to the
 * street, crosses to the market, pauses, shops, and heads back. Pure numbers, so
 * a whole day of the district can be simulated in a test.
 */

export const NPC_STATE = {
  WALK: 'WALK',
  WAIT: 'WAIT',
  LOOK: 'LOOK',
  TALK: 'TALK',
  SIT: 'SIT',
  SHOP: 'SHOP',
  CROSS_STREET: 'CROSS_STREET',
  ENTER_AREA: 'ENTER_AREA',
  EXIT_AREA: 'EXIT_AREA',
};

/** States in which the NPC is travelling rather than standing still. */
const MOVING_STATES = new Set([NPC_STATE.WALK, NPC_STATE.CROSS_STREET, NPC_STATE.EXIT_AREA]);
export const isMovingState = (state) => MOVING_STATES.has(state);

/**
 * The market's waypoints.
 *
 * `kind` says what an NPC does on arrival, and `next` lists where it may go.
 * The graph is deliberately small and hand-placed: this is a market street, not
 * a navmesh.
 */
export const WAYPOINTS = {
  homeWest: {
    id: 'homeWest',
    x: -11.5,
    z: 26,
    kind: NPC_STATE.ENTER_AREA,
    next: ['streetWest', 'stallsWest'],
  },
  homeEast: {
    id: 'homeEast',
    x: 11.5,
    z: 14,
    kind: NPC_STATE.ENTER_AREA,
    next: ['streetEast', 'stallsEast'],
  },
  streetWest: {
    id: 'streetWest',
    x: -5.5,
    z: 18,
    kind: NPC_STATE.WALK,
    next: ['plaza', 'stallsWest', 'crossingSouth'],
  },
  streetEast: {
    id: 'streetEast',
    x: 5.5,
    z: 10,
    kind: NPC_STATE.WALK,
    next: ['plaza', 'stallsEast', 'crossingSouth'],
  },
  stallsWest: {
    id: 'stallsWest',
    x: -7.2,
    z: 2,
    kind: NPC_STATE.SHOP,
    next: ['plaza', 'streetWest', 'benchNorth'],
  },
  stallsEast: {
    id: 'stallsEast',
    x: 7.2,
    z: -6,
    kind: NPC_STATE.SHOP,
    next: ['plaza', 'streetEast', 'transitMouth'],
  },
  plaza: {
    id: 'plaza',
    x: 0,
    z: -4,
    kind: NPC_STATE.LOOK,
    next: ['stallsWest', 'stallsEast', 'benchNorth', 'transitMouth', 'crossingNorth'],
  },
  benchNorth: {
    id: 'benchNorth',
    x: -4.6,
    z: -16,
    kind: NPC_STATE.SIT,
    next: ['plaza', 'crossingNorth'],
  },
  transitMouth: {
    id: 'transitMouth',
    x: 6.4,
    z: -24,
    kind: NPC_STATE.EXIT_AREA,
    next: ['plaza', 'crossingNorth'],
  },
  crossingNorth: {
    id: 'crossingNorth',
    x: 0,
    z: -30,
    kind: NPC_STATE.CROSS_STREET,
    next: ['plaza', 'transitMouth', 'benchNorth'],
  },
  crossingSouth: {
    id: 'crossingSouth',
    x: 0,
    z: 22,
    kind: NPC_STATE.CROSS_STREET,
    next: ['homeWest', 'homeEast', 'streetWest', 'streetEast'],
  },
};

export const WAYPOINT_IDS = Object.keys(WAYPOINTS);

/** How long an NPC lingers once it arrives, per activity. */
const DWELL = {
  [NPC_STATE.WALK]: [0.2, 0.8],
  [NPC_STATE.WAIT]: [1.5, 4.0],
  [NPC_STATE.LOOK]: [1.8, 4.5],
  [NPC_STATE.TALK]: [3.0, 7.0],
  [NPC_STATE.SIT]: [5.0, 12.0],
  [NPC_STATE.SHOP]: [3.5, 9.0],
  [NPC_STATE.CROSS_STREET]: [0.3, 1.0],
  [NPC_STATE.ENTER_AREA]: [2.0, 6.0],
  [NPC_STATE.EXIT_AREA]: [2.5, 7.0],
};

const WALK_SPEED = [0.75, 1.45];

export function createNpcSchedule(seed = 0x1d2e3f) {
  const random = createRandom(seed);

  /** Creates one agent parked at a starting waypoint. */
  function spawn(startId = null) {
    const id = startId ?? WAYPOINT_IDS[Math.floor(random() * WAYPOINT_IDS.length) % WAYPOINT_IDS.length];
    const waypoint = WAYPOINTS[id];
    return {
      x: waypoint.x,
      z: waypoint.z,
      facing: random() * Math.PI * 2,
      speed: WALK_SPEED[0] + random() * (WALK_SPEED[1] - WALK_SPEED[0]),
      at: id,
      target: id,
      state: waypoint.kind,
      timer: 0,
      dwell: dwellFor(waypoint.kind),
      /** Set by the reaction system; overrides the schedule while non-null. */
      override: null,
      phase: random() * Math.PI * 2,
    };
  }

  function dwellFor(kind) {
    const range = DWELL[kind] ?? DWELL[NPC_STATE.WAIT];
    return range[0] + random() * (range[1] - range[0]);
  }

  /** Picks the next destination from the graph, never the one just left. */
  function chooseNext(agent) {
    const options = WAYPOINTS[agent.at]?.next ?? [];
    if (options.length === 0) return agent.at;
    if (options.length === 1) return options[0];
    const index = Math.floor(random() * options.length) % options.length;
    return options[index];
  }

  /** Sends an agent walking toward a new destination. */
  function depart(agent) {
    agent.target = chooseNext(agent);
    agent.state = NPC_STATE.WALK;
    agent.timer = 0;
    agent.dwell = 0;
  }

  /**
   * Advances one agent. `dt` is world time; agents far from the player are
   * stepped with a larger `dt` less often, which is what makes the LOD cheap.
   */
  function step(agent, dt) {
    if (!(dt > 0)) return agent;
    agent.timer += dt;

    if (isMovingState(agent.state) && agent.target !== agent.at) {
      const destination = WAYPOINTS[agent.target];
      const dx = destination.x - agent.x;
      const dz = destination.z - agent.z;
      const distance = Math.hypot(dx, dz);

      if (distance <= 0.25) {
        agent.x = destination.x;
        agent.z = destination.z;
        agent.at = agent.target;
        agent.state = destination.kind;
        agent.timer = 0;
        agent.dwell = dwellFor(destination.kind);
        return agent;
      }

      const step = Math.min(distance, agent.speed * dt) / distance;
      agent.x += dx * step;
      agent.z += dz * step;
      agent.facing = Math.atan2(dx, dz);
      agent.phase += agent.speed * dt * 3.4;
      return agent;
    }

    // Standing at a waypoint: leave once the dwell is up.
    if (agent.timer >= agent.dwell) depart(agent);
    return agent;
  }

  return { spawn, step, depart, dwellFor };
}

/** Every waypoint a graph edge points at must exist. Used by the tests. */
export function scheduleGraphIsValid() {
  for (const id of WAYPOINT_IDS) {
    const waypoint = WAYPOINTS[id];
    if (!Array.isArray(waypoint.next) || waypoint.next.length === 0) return false;
    for (const target of waypoint.next) {
      if (!WAYPOINTS[target]) return false;
      if (target === id) return false;
    }
  }
  return true;
}
