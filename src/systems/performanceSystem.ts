// Adaptive quality: watches frame time and suggests moving a tier DOWN when the
// device is sustainably struggling, or UP when it has proven it can hold a high
// frame rate with headroom. Everything is measured over multi-second windows, so
// a single stuttery frame (GC, texture upload, a panel opening) can never move
// the tier. The upgrade bar is deliberately stricter and slower than the
// downgrade bar so the tier settles instead of oscillating.

export type PerfVerdict = 'steady' | 'downgrade' | 'upgrade'

export class FpsMonitor {
  private frames = 0
  private accum = 0
  private slowWindows = 0
  private fastWindows = 0
  private readonly windowSec = 2
  private readonly lowFpsThreshold = 32
  private readonly highFpsThreshold = 57 // near-vsync, i.e. real headroom
  private readonly windowsBeforeDowngrade = 3 // ~6 s of sustained slowness
  private readonly windowsBeforeUpgrade = 6 // ~12 s of sustained headroom

  reset(): void {
    this.frames = 0
    this.accum = 0
    this.slowWindows = 0
    this.fastWindows = 0
  }

  // Call every frame with delta seconds. Returns a verdict once a sustained
  // trend is confirmed (and then resets that trend).
  sample(delta: number): PerfVerdict {
    this.frames += 1
    this.accum += delta
    if (this.accum < this.windowSec) return 'steady'

    const fps = this.frames / this.accum
    this.frames = 0
    this.accum = 0

    if (fps < this.lowFpsThreshold) {
      this.slowWindows += 1
      this.fastWindows = 0
    } else if (fps >= this.highFpsThreshold) {
      this.fastWindows += 1
      this.slowWindows = 0
    } else {
      // Comfortable middle: not struggling, but no headroom to spend either.
      this.slowWindows = 0
      this.fastWindows = 0
    }

    if (this.slowWindows >= this.windowsBeforeDowngrade) {
      this.slowWindows = 0
      return 'downgrade'
    }
    if (this.fastWindows >= this.windowsBeforeUpgrade) {
      this.fastWindows = 0
      return 'upgrade'
    }
    return 'steady'
  }
}
