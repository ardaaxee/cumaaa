/**
 * The single owner of Web Audio in CUMA WORLD.
 *
 * One AudioContext for the whole session, created lazily on the first user
 * gesture because browsers refuse to start one before that. Every sound is
 * synthesised — there are no audio assets yet — but each event has its own
 * voice rather than one beep at different pitches: the Warden's wind-up, its
 * weight, an impact, a parry and a perfect parry have to be distinguishable
 * with the screen turned off.
 */

/** Cap on simultaneous voices so a burst of hits cannot flood the graph. */
const MAX_VOICES = 12;

export function createAudioManager() {
  let context = null;
  let master = null;
  let unlocked = false;
  let voices = 0;
  let muted = false;
  const listeners = [];

  function ensureContext() {
    if (context) return context;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    try {
      context = new Ctor();
      master = context.createGain();
      master.gain.value = 0.42;
      master.connect(context.destination);
    } catch {
      // Audio is a nicety; a device that refuses it still plays the game.
      context = null;
    }
    return context;
  }

  function unlock() {
    const ctx = ensureContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    unlocked = true;
  }

  // The first gesture of any kind starts audio.
  for (const type of ['pointerdown', 'keydown', 'touchstart']) {
    const handler = () => unlock();
    window.addEventListener(type, handler, { passive: true });
    listeners.push(() => window.removeEventListener(type, handler));
  }

  /** Claims a voice slot, released when the node stops. */
  function claimVoice(durationSeconds) {
    if (voices >= MAX_VOICES) return false;
    voices += 1;
    setTimeout(() => {
      voices -= 1;
    }, Math.ceil(durationSeconds * 1000) + 60);
    return true;
  }

  function ready(duration) {
    if (muted || !unlocked) return null;
    const ctx = ensureContext();
    if (!ctx || ctx.state !== 'running') return null;
    if (!claimVoice(duration)) return null;
    return ctx;
  }

  /** A short burst of filtered noise; the backbone of the impact sounds. */
  function noiseBurst(ctx, { duration, gain, frequency, q = 1, type = 'bandpass' }) {
    const frames = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i += 1) {
      // Shaped noise: the decay is baked into the buffer so one envelope does.
      data[i] = (Math.random() * 2 - 1) * (1 - i / frames) ** 2;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = q;

    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(gain, ctx.currentTime);
    envelope.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    source.connect(filter).connect(envelope).connect(master);
    source.start();
    source.stop(ctx.currentTime + duration);
  }

  /** A pitched tone with its own envelope. */
  function tone(ctx, { type = 'sine', from, to, duration, gain, delay = 0, detune = 0 }) {
    const start = ctx.currentTime + delay;
    const oscillator = ctx.createOscillator();
    oscillator.type = type;
    oscillator.detune.value = detune;
    oscillator.frequency.setValueAtTime(from, start);
    if (to !== from) {
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, to), start + duration);
    }

    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(gain, start + Math.min(0.02, duration * 0.2));
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(envelope).connect(master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  /**
   * Each cue is its own voice, not a transposition of a shared one.
   */
  const cues = {
    /** Rising, tense, unmistakably "something is coming". */
    anticipation(ctx) {
      tone(ctx, { type: 'sawtooth', from: 74, to: 168, duration: 0.5, gain: 0.1 });
      noiseBurst(ctx, { duration: 0.5, gain: 0.05, frequency: 900, q: 0.7, type: 'highpass' });
    },

    /** The Warden's mass shifting: low, slow, felt more than heard. */
    heavyMove(ctx) {
      tone(ctx, { type: 'sine', from: 96, to: 38, duration: 0.62, gain: 0.24 });
      noiseBurst(ctx, { duration: 0.36, gain: 0.12, frequency: 180, q: 0.6, type: 'lowpass' });
    },

    /** A blunt landed hit. */
    impact(ctx) {
      noiseBurst(ctx, { duration: 0.2, gain: 0.3, frequency: 420, q: 0.8 });
      tone(ctx, { type: 'triangle', from: 160, to: 58, duration: 0.2, gain: 0.22 });
    },

    /** Bright, metallic, glassy — a blade turned aside. */
    parry(ctx) {
      tone(ctx, { type: 'square', from: 880, to: 720, duration: 0.13, gain: 0.09 });
      noiseBurst(ctx, { duration: 0.16, gain: 0.16, frequency: 3200, q: 6 });
    },

    /** The same family as a parry, but bigger, cleaner and with a tail. */
    perfectParry(ctx) {
      tone(ctx, { type: 'square', from: 1180, to: 980, duration: 0.16, gain: 0.11 });
      tone(ctx, { type: 'sine', from: 1760, to: 1560, duration: 0.44, gain: 0.09, delay: 0.02 });
      tone(ctx, { type: 'sine', from: 2640, to: 2340, duration: 0.5, gain: 0.05, delay: 0.05 });
      noiseBurst(ctx, { duration: 0.3, gain: 0.2, frequency: 4200, q: 9 });
    },

    /** Glass losing its composure: a descending cluster. */
    postureBreak(ctx) {
      tone(ctx, { type: 'triangle', from: 640, to: 120, duration: 0.62, gain: 0.16 });
      tone(ctx, { type: 'triangle', from: 810, to: 150, duration: 0.7, gain: 0.1, detune: 18 });
      noiseBurst(ctx, { duration: 0.55, gain: 0.2, frequency: 1800, q: 2 });
    },

    /** A low swell as the Warden changes gear. */
    phase(ctx) {
      tone(ctx, { type: 'sawtooth', from: 46, to: 120, duration: 1.0, gain: 0.14 });
      tone(ctx, { type: 'sine', from: 184, to: 240, duration: 0.9, gain: 0.06, delay: 0.1 });
    },

    /** The player's own swing connecting. */
    playerHit(ctx) {
      noiseBurst(ctx, { duration: 0.13, gain: 0.18, frequency: 1400, q: 2 });
      tone(ctx, { type: 'triangle', from: 300, to: 150, duration: 0.12, gain: 0.12 });
    },

    /** A dodge: cloth and air, no pitch. */
    dodge(ctx) {
      noiseBurst(ctx, { duration: 0.2, gain: 0.09, frequency: 1100, q: 0.9, type: 'highpass' });
    },
  };

  /** Rough durations, used only for voice accounting. */
  const CUE_DURATION = {
    anticipation: 0.5,
    heavyMove: 0.62,
    impact: 0.2,
    parry: 0.16,
    perfectParry: 0.5,
    postureBreak: 0.7,
    phase: 1.0,
    playerHit: 0.13,
    dodge: 0.2,
  };

  // --- Ambience layers ----------------------------------------------------
  /**
   * Continuous beds rather than one-shots: rain, city hum, distant traffic and
   * so on all run at once and are cross-faded by gain, so moving through the
   * city never cuts one sound off and starts another.
   */
  const layers = new Map();

  /** A looping noise bed, shaped by a filter. */
  function buildNoiseLayer(ctx, { frequency, q, type, seconds = 4 }) {
    const frames = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < frames; i += 1) {
      // Slightly correlated noise: less hissy than white, cheaper than pink.
      const white = Math.random() * 2 - 1;
      last = last * 0.72 + white * 0.28;
      data[i] = last;
    }
    // Taper the seam so the loop point is inaudible.
    const fade = Math.floor(ctx.sampleRate * 0.05);
    for (let i = 0; i < fade; i += 1) {
      const k = i / fade;
      data[i] *= k;
      data[frames - 1 - i] *= k;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = q;

    const gain = ctx.createGain();
    gain.gain.value = 0;

    source.connect(filter).connect(gain).connect(master);
    source.start();
    return { source, gain };
  }

  /** A looping tonal bed, for the city's low hum. */
  function buildToneLayer(ctx, { frequency, detune = 0, type = 'sawtooth', lowpass = 220 }) {
    const oscillator = ctx.createOscillator();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    oscillator.detune.value = detune;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass;

    const gain = ctx.createGain();
    gain.gain.value = 0;

    oscillator.connect(filter).connect(gain).connect(master);
    oscillator.start();
    return { source: oscillator, gain };
  }

  /** Each ambience layer has its own voice, not one bed at different volumes. */
  const LAYER_BUILDERS = {
    rain: (ctx) => buildNoiseLayer(ctx, { frequency: 2600, q: 0.5, type: 'highpass' }),
    cityHum: (ctx) => buildToneLayer(ctx, { frequency: 54, lowpass: 150 }),
    distantTraffic: (ctx) => buildNoiseLayer(ctx, { frequency: 340, q: 0.7, type: 'lowpass' }),
    marketCrowd: (ctx) => buildNoiseLayer(ctx, { frequency: 900, q: 1.4, type: 'bandpass' }),
    transit: (ctx) => buildNoiseLayer(ctx, { frequency: 190, q: 2.2, type: 'bandpass' }),
    wind: (ctx) => buildNoiseLayer(ctx, { frequency: 620, q: 0.35, type: 'lowpass' }),
    indoorMuffle: (ctx) => buildNoiseLayer(ctx, { frequency: 260, q: 0.5, type: 'lowpass' }),
  };

  /** Peak gain per layer, so one bed cannot drown the rest. */
  const LAYER_CEILING = {
    rain: 0.2,
    cityHum: 0.1,
    distantTraffic: 0.11,
    marketCrowd: 0.1,
    transit: 0.14,
    wind: 0.09,
    indoorMuffle: 0.12,
  };

  return {
    /** Starts audio; safe to call repeatedly. */
    unlock,

    /**
     * Sets a continuous ambience layer's level, cross-fading rather than
     * cutting. `weight` is 0..1 against that layer's own ceiling.
     */
    setLayer(name, weight, fadeSeconds = 1.2) {
      const builder = LAYER_BUILDERS[name];
      if (!builder || muted || !unlocked) return;
      const ctx = ensureContext();
      if (!ctx || ctx.state !== 'running') return;

      let layer = layers.get(name);
      if (!layer) {
        try {
          layer = builder(ctx);
          layers.set(name, layer);
        } catch {
          return;
        }
      }

      const target = Math.max(0, Math.min(1, weight)) * (LAYER_CEILING[name] ?? 0.1);
      try {
        layer.gain.gain.cancelScheduledValues(ctx.currentTime);
        layer.gain.gain.setValueAtTime(layer.gain.gain.value, ctx.currentTime);
        layer.gain.gain.linearRampToValueAtTime(target, ctx.currentTime + fadeSeconds);
      } catch {
        // A scheduling failure must never break the frame.
      }
    },

    /** Layer names this manager knows how to build. */
    get layerNames() {
      return Object.keys(LAYER_BUILDERS);
    },

    play(name) {
      const cue = cues[name];
      if (!cue) return;
      const ctx = ready(CUE_DURATION[name] ?? 0.3);
      if (!ctx) return;
      try {
        cue(ctx);
      } catch {
        // A failed voice must never break the frame.
      }
    },

    setMuted(value) {
      muted = value;
    },

    get isRunning() {
      return context !== null && context.state === 'running';
    },

    dispose() {
      for (const off of listeners) off();
      listeners.length = 0;
      for (const layer of layers.values()) {
        try {
          layer.source.stop();
        } catch {
          // Already stopped.
        }
      }
      layers.clear();
      if (context) {
        context.close().catch(() => {});
        context = null;
      }
    },
  };
}
