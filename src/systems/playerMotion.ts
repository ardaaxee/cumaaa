// A tiny mutable channel the PlayerController writes each frame and the
// first-person body, footstep audio, ambience and blob shadow read. Deliberately
// plain mutable state (no React, no store) so per-frame reads/writes never cause
// a re-render — critical for mobile performance.

export interface PlayerMotion {
  x: number
  z: number
  speed: number // current horizontal speed (m/s)
  bobPhase: number // walk cycle phase
  running: boolean
  moving: boolean
  grounded: boolean
  reachAt: number // performance.now() of the last interaction reach, or 0
}

export const playerMotion: PlayerMotion = {
  x: 0,
  z: 0,
  speed: 0,
  bobPhase: 0,
  running: false,
  moving: false,
  grounded: true,
  reachAt: 0,
}

// Called by interactions that should trigger a short first-person hand reach.
export function triggerReach(): void {
  playerMotion.reachAt = performance.now()
}
