// Lightweight procedural audio using the Web Audio API. No external asset
// files are shipped, so nothing to 404 on. Sounds are synthesized on demand.
//
// AUTOPLAY SAFETY: the AudioContext is created lazily and only ever resumed
// from inside a user gesture (see `unlock`). Nothing plays before that.

let ctx: AudioContext | null = null
let masterGain: GainNode | null = null
let reverbWet: GainNode | null = null // wet return for room acoustics
let convolver: ConvolverNode | null = null
let unlocked = false
let enabled = true
// The master fader lives here rather than only on the gain node: preferences are
// restored during hydration, long before a user gesture creates the context, so
// the value has to survive until there is a node to put it on.
let masterVolume = 0.5

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
    masterGain.gain.value = masterVolume
    masterGain.connect(ctx.destination)
    // A small, cheap reverb bus (synthetic impulse) for per-room acoustics.
    convolver = ctx.createConvolver()
    convolver.buffer = makeImpulse(ctx, 0.5, 2.2)
    reverbWet = ctx.createGain()
    reverbWet.gain.value = 0.12 // room-dependent, updated by setReverbWet
    convolver.connect(reverbWet)
    reverbWet.connect(masterGain)
  } catch {
    ctx = null
  }
  return ctx
}

// A short decaying-noise impulse response — enough to suggest a room, not a hall.
function makeImpulse(c: AudioContext, seconds: number, decay: number): AudioBuffer {
  const len = Math.floor(c.sampleRate * seconds)
  const buf = c.createBuffer(2, len, c.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch)
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay)
    }
  }
  return buf
}

// Room acoustics: how much of the reverb bus is heard (0 = dead, ~0.35 = tiled).
export function setReverbWet(amount: number): void {
  if (reverbWet && ctx) reverbWet.gain.setTargetAtTime(Math.max(0, Math.min(0.6, amount)), ctx.currentTime, 0.4)
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
  masterVolume = clamp01(value)
  if (masterGain) masterGain.gain.value = masterVolume
}

// Per-bus trims sitting under the master fader. SFX is applied at the moment a
// blip is made; ambient scales the looped bed, whose base level is still chosen
// by the time of day.
let sfxTrim = 0.8
let ambientTrim = 0.6
let ambientBase = 0.04

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v))
}

export function setSfxVolume(value: number): void {
  sfxTrim = clamp01(value)
}

export function setAmbientVolume(value: number): void {
  ambientTrim = clamp01(value)
  if (ambientGain && ctx) ambientGain.gain.setTargetAtTime(ambientBase * ambientTrim, ctx.currentTime, 0.4)
}

export interface AudioSettings {
  soundEnabled: boolean
  volume: number
  sfxVolume: number
  ambientVolume: number
}

// One entry point for restoring the whole set. Hydration and a data reset both
// need every fader applied, and applying them one call site at a time is how
// the two drift apart.
export function applyAudioSettings(s: AudioSettings): void {
  setAudioEnabled(s.soundEnabled)
  setMasterVolume(s.volume)
  setSfxVolume(s.sfxVolume)
  setAmbientVolume(s.ambientVolume)
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
  g.gain.linearRampToValueAtTime(gain * sfxTrim, c.currentTime + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration)
  osc.connect(g)
  g.connect(masterGain)
  osc.start()
  osc.stop(c.currentTime + duration + 0.02)
}

// A short filtered noise burst — the body of a realistic footstep. A little of
// it is also sent to the reverb bus so rooms with hard surfaces ring slightly.
function noiseStep(freq: number, q: number, dur: number, gain: number, type: BiquadFilterType, wetSend: number): void {
  if (!enabled || !unlocked) return
  const c = ensureContext()
  if (!c || !masterGain) return
  const len = Math.floor(c.sampleRate * dur)
  const buf = c.createBuffer(1, len, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const src = c.createBufferSource()
  src.buffer = buf
  const filter = c.createBiquadFilter()
  filter.type = type
  filter.frequency.value = freq
  filter.Q.value = q
  const g = c.createGain()
  g.gain.setValueAtTime(gain * sfxTrim, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur)
  src.connect(filter)
  filter.connect(g)
  g.connect(masterGain)
  if (convolver && wetSend > 0) {
    const wg = c.createGain()
    wg.gain.value = wetSend
    g.connect(wg)
    wg.connect(convolver)
  }
  src.start()
  src.stop(c.currentTime + dur + 0.02)
}

// Per-surface footstep character. Very low volume, randomised so no two steps
// sound identical; running steps are a touch louder and brighter.
type Surface = 'wood' | 'carpet' | 'tile' | 'balcony'
function footstepFor(surface: Surface, running: boolean): void {
  const r = 0.85 + Math.random() * 0.3 // per-step variation
  const rv = running ? 1.25 : 1
  switch (surface) {
    case 'carpet':
      noiseStep(360 * r, 0.7, 0.06, 0.03 * rv, 'lowpass', 0.02)
      break
    case 'tile':
      noiseStep(2200 * r, 1.4, 0.05, 0.045 * rv, 'bandpass', 0.28)
      blip(150 * r, 0.04, 'sine', 0.02 * rv)
      break
    case 'balcony':
      noiseStep(520 * r, 1.1, 0.09, 0.05 * rv, 'bandpass', 0.18)
      blip(90 * r, 0.08, 'sine', 0.035 * rv)
      break
    default: // wood
      noiseStep(900 * r, 1.0, 0.06, 0.04 * rv, 'bandpass', 0.1)
      blip(80 * r, 0.06, 'sine', 0.035 * rv)
  }
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
  // Surface-aware footstep (defaults keep older callers working).
  footstep: (surface: Surface = 'wood', running = false) => footstepFor(surface, running),
}

// --- Ambient environment bed --------------------------------------------------
// A barely-there loop of filtered noise (distant city / air), started once and
// then nudged by time of day. Never obviously a loop; just keeps the room alive.
let ambientSource: AudioBufferSourceNode | null = null
let ambientGain: GainNode | null = null
let ambientFilter: BiquadFilterNode | null = null

export function startAmbient(): void {
  if (!enabled || !unlocked || ambientSource) return
  const c = ensureContext()
  if (!c || !masterGain) return
  // ~3s of brown-ish noise, looped.
  const len = Math.floor(c.sampleRate * 3)
  const buf = c.createBuffer(1, len, c.sampleRate)
  const data = buf.getChannelData(0)
  let last = 0
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1
    last = (last + 0.02 * white) / 1.02
    data[i] = last * 3.5
  }
  const src = c.createBufferSource()
  src.buffer = buf
  src.loop = true
  const filter = c.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 480
  const g = c.createGain()
  g.gain.value = 0.0
  src.connect(filter)
  filter.connect(g)
  g.connect(masterGain)
  src.start()
  ambientSource = src
  ambientGain = g
  ambientFilter = filter
}

// Set the ambient character for the time of day (kept very quiet throughout).
export function setAmbientLevel(tod: 'day' | 'sunset' | 'night'): void {
  if (!ambientGain || !ambientFilter || !ctx) return
  ambientBase = tod === 'day' ? 0.05 : tod === 'sunset' ? 0.04 : 0.028
  const cutoff = tod === 'night' ? 360 : tod === 'sunset' ? 440 : 560
  ambientGain.gain.setTargetAtTime(ambientBase * ambientTrim, ctx.currentTime, 1.2)
  ambientFilter.frequency.setTargetAtTime(cutoff, ctx.currentTime, 1.2)
}
