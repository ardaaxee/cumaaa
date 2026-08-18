// Adaptive quality: watches frame time and, if the device is consistently
// struggling, signals a one-way downgrade suggestion. Kept conservative so it
// never oscillates — it only ever suggests going *down* a tier.

export class FpsMonitor {
  private frames = 0
  private accum = 0
  private slowWindows = 0
  private readonly windowSec = 2
  private readonly lowFpsThreshold = 32
  private readonly windowsBeforeDowngrade = 3

  reset(): void {
    this.frames = 0
    this.accum = 0
    this.slowWindows = 0
  }

  // Call every frame with delta seconds. Returns true when a downgrade is
  // recommended (only fires once per crossing).
  sample(delta: number): boolean {
    this.frames += 1
    this.accum += delta
    if (this.accum < this.windowSec) return false

    const fps = this.frames / this.accum
    this.frames = 0
    this.accum = 0

    if (fps < this.lowFpsThreshold) {
      this.slowWindows += 1
    } else {
      this.slowWindows = 0
    }

    if (this.slowWindows >= this.windowsBeforeDowngrade) {
      this.slowWindows = 0
      return true
    }
    return false
  }
}
