// Lightweight procedural audio using the Web Audio API. No external asset
// files are shipped, so nothing to 404 on. Sounds are synthesized on demand.
//
// AUTOPLAY SAFETY: the AudioContext is created lazily and only ever resumed
// from inside a user gesture (see `unlock`). Nothing plays before that.

let ctx: AudioContext | null = null
let masterGain: GainNode | null = null
let unlocked = false
let enabled = true

function ensureContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (ctx) return ctx
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
    masterGain = ctx.createGain()
    masterGain.gain.value = 0.5
    masterGain.connect(ctx.destination)
  } catch {
    ctx = null
  }
  return ctx
}

// Must be called from a user gesture handler (click/tap/keydown).
export function unlockAudio(): void {
  const c = ensureContext()
  if (!c) return
  if (c.state === 'suspended') void c.resume()
  unlocked = true
}

export function setAudioEnabled(value: boolean): void {
  enabled = value
}

export function setMasterVolume(value: number): void {
  if (masterGain) masterGain.gain.value = Math.max(0, Math.min(1, value))
}

function blip(freq: number, duration: number, type: OscillatorType, gain: number): void {
  if (!enabled || !unlocked) return
  const c = ensureContext()
  if (!c || !masterGain) return
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(0, c.currentTime)
  g.gain.linearRampToValueAtTime(gain, c.currentTime + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration)
  osc.connect(g)
  g.connect(masterGain)
  osc.start()
  osc.stop(c.currentTime + duration + 0.02)
}

// Named UI/interaction cues used across the app.
export const Sfx = {
  click: () => blip(520, 0.08, 'triangle', 0.18),
  hover: () => blip(760, 0.05, 'sine', 0.08),
  open: () => {
    blip(440, 0.12, 'sine', 0.15)
    setTimeout(() => blip(660, 0.12, 'sine', 0.12), 60)
  },
  close: () => blip(300, 0.1, 'sine', 0.12),
  success: () => {
    blip(660, 0.1, 'sine', 0.16)
    setTimeout(() => blip(880, 0.14, 'sine', 0.16), 90)
    setTimeout(() => blip(1180, 0.18, 'sine', 0.14), 190)
  },
  door: () => blip(180, 0.4, 'sawtooth', 0.1),
  key: () => blip(1400 + Math.random() * 200, 0.03, 'square', 0.04),
}
