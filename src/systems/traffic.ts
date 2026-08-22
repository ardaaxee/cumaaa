// Traffic.
//
// A street with parked cars on it is a car park. What makes it read as a road is
// that things USE it — and using it is not just translation: a car brakes when
// the one in front is close, indicates before it turns, and its wheels turn at
// the speed it is actually travelling rather than at a rate someone picked.
//
// The model is deliberately one-dimensional: each vehicle has a distance along a
// lane, and the lane says where that is in the world. That is enough for a
// street seen from a balcony, it costs almost nothing, and it is the same shape
// an NPC pathing system will want later — which is why a lane is described as
// points rather than as a straight line.

export interface Lane {
  id: string
  /** Centre-line, in world XZ. Cars run from the first point to the last. */
  points: [number, number][]
  /** Ground height. */
  y: number
  /** Metres per second at a free run. */
  speed: number
}

export interface TrafficCar {
  lane: string
  /** Distance along the lane, metres. */
  s: number
  /** Current speed, m/s. */
  v: number
  /** Accumulated wheel rotation, radians. */
  spin: number
  steer: number
  brake: number
  indicator: -1 | 0 | 1
  style: number
}

export interface LaneState {
  lane: Lane
  length: number
  /** Cumulative distance to each point, so a position lookup is a short scan. */
  cum: number[]
}

export function prepareLane(lane: Lane): LaneState {
  const cum = [0]
  for (let i = 1; i < lane.points.length; i++) {
    const a = lane.points[i - 1]
    const b = lane.points[i]
    cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]))
  }
  return { lane, length: cum[cum.length - 1], cum }
}

export interface Placed {
  x: number
  z: number
  /** Heading, radians, such that the car's +Z nose runs along the lane. */
  yaw: number
  /** How sharply the lane turns just ahead — what the steering follows. */
  curve: number
}

export function laneAt(state: LaneState, s: number): Placed {
  const { lane, cum, length } = state
  const d = ((s % length) + length) % length
  let i = 1
  while (i < cum.length - 1 && cum[i] < d) i++
  const a = lane.points[i - 1]
  const b = lane.points[i]
  const seg = cum[i] - cum[i - 1] || 1
  const t = (d - cum[i - 1]) / seg
  const x = a[0] + (b[0] - a[0]) * t
  const z = a[1] + (b[1] - a[1]) * t
  const yaw = Math.atan2(b[0] - a[0], b[1] - a[1])
  // Curvature from the heading change into the NEXT segment, so a car starts to
  // steer and to indicate BEFORE the corner rather than snapping through it.
  let curve = 0
  const j = Math.min(cum.length - 1, i + 1)
  if (j > i) {
    const c = lane.points[j]
    const nextYaw = Math.atan2(c[0] - b[0], c[1] - b[1])
    let dy = nextYaw - yaw
    while (dy > Math.PI) dy -= Math.PI * 2
    while (dy < -Math.PI) dy += Math.PI * 2
    const ahead = cum[i] - d
    curve = ahead < 12 ? dy * (1 - ahead / 12) : 0
  }
  return { x, z, yaw, curve }
}

const WHEEL_R = 0.32
/** How close a car will get to the one in front before it lifts off. */
const GAP = 7.5

/**
 * Advance every car by one frame.
 *
 * Cars on the same lane SEE each other: the one behind measures the gap and
 * brakes for it. That single rule is the difference between traffic and a
 * carousel of independent objects passing through one another.
 */
export function stepTraffic(cars: TrafficCar[], lanes: Map<string, LaneState>, delta: number): void {
  const dt = Math.min(delta, 0.05)
  for (const car of cars) {
    const st = lanes.get(car.lane)
    if (!st) continue
    let gap = Infinity
    for (const other of cars) {
      if (other === car || other.lane !== car.lane) continue
      let d = other.s - car.s
      if (d < 0) d += st.length
      if (d < gap) gap = d
    }
    const here = laneAt(st, car.s)
    // Slow for the corner as well as for the car in front.
    const cornerLimit = st.lane.speed * (1 - Math.min(0.55, Math.abs(here.curve) * 0.9))
    const want = gap < GAP ? Math.max(0, st.lane.speed * (gap / GAP - 0.15)) : cornerLimit
    const accel = want > car.v ? 2.2 : 5.5
    const dv = Math.max(-accel * dt, Math.min(accel * dt, want - car.v))
    car.v += dv
    car.brake = dv < -0.02 ? Math.min(1, -dv * 12) : Math.max(0, car.brake - dt * 3)
    car.s += car.v * dt
    car.spin += (car.v * dt) / WHEEL_R
    car.steer += (here.curve * 0.9 - car.steer) * Math.min(1, dt * 6)
    car.indicator = Math.abs(here.curve) > 0.06 ? (here.curve > 0 ? 1 : -1) : 0
  }
}

export function newTraffic(lane: string, count: number, length: number, seedBase = 0): TrafficCar[] {
  const out: TrafficCar[] = []
  for (let i = 0; i < count; i++) {
    out.push({
      lane,
      s: (length * i) / count,
      v: 0,
      spin: 0,
      steer: 0,
      brake: 0,
      indicator: 0,
      style: (seedBase + i * 37) % 5,
    })
  }
  return out
}
