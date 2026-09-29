type PandaVoiceIntent = 'greet' | 'talk' | 'happy' | 'hungry' | 'sleepy' | 'eat' | 'drink' | 'bath' | 'play';

let ctx: AudioContext | null = null;
let unlocked = false;
let activeNodes: AudioScheduledSourceNode[] = [];

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!ctx) ctx = new Ctx();
  return ctx;
}

function stopActive() {
  for (const node of activeNodes) {
    try { node.stop(); } catch { /* already stopped */ }
  }
  activeNodes = [];
}

export async function unlockPandaVoice(): Promise<void> {
  const c = getContext();
  if (!c) return;
  try {
    if (c.state === 'suspended') await c.resume();
    unlocked = c.state === 'running';
  } catch {
    unlocked = false;
  }
}

function hashText(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

function intentProfile(intent: PandaVoiceIntent) {
  switch (intent) {
    case 'greet': return { base: 390, spread: 115, rate: 1.06, count: 6, wave: 'triangle' as OscillatorType };
    case 'happy': return { base: 430, spread: 140, rate: 1.12, count: 5, wave: 'sine' as OscillatorType };
    case 'hungry': return { base: 205, spread: 45, rate: .9, count: 4, wave: 'triangle' as OscillatorType };
    case 'sleepy': return { base: 165, spread: 28, rate: .74, count: 3, wave: 'sine' as OscillatorType };
    case 'eat': return { base: 265, spread: 55, rate: .92, count: 3, wave: 'triangle' as OscillatorType };
    case 'drink': return { base: 315, spread: 65, rate: .96, count: 3, wave: 'sine' as OscillatorType };
    case 'bath': return { base: 355, spread: 90, rate: 1.0, count: 4, wave: 'sine' as OscillatorType };
    case 'play': return { base: 455, spread: 150, rate: 1.18, count: 6, wave: 'triangle' as OscillatorType };
    default: return { base: 320, spread: 105, rate: 1.0, count: 7, wave: 'triangle' as OscillatorType };
  }
}

function scheduleSyllable(
  c: AudioContext,
  when: number,
  freq: number,
  duration: number,
  wave: OscillatorType,
  brightness: number,
) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  const filter = c.createBiquadFilter();

  osc.type = wave;
  osc.frequency.setValueAtTime(freq, when);
  osc.frequency.exponentialRampToValueAtTime(Math.max(90, freq * (1 + brightness)), when + duration * .72);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1250 + freq * .8, when);
  filter.Q.setValueAtTime(.7, when);

  gain.gain.setValueAtTime(.0001, when);
  gain.gain.exponentialRampToValueAtTime(.07, when + .025);
  gain.gain.exponentialRampToValueAtTime(.0001, when + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);

  osc.start(when);
  osc.stop(when + duration + .03);
  activeNodes.push(osc);
}

function scheduleBreathyPop(c: AudioContext, when: number, strength = .018) {
  const length = Math.max(1, Math.floor(c.sampleRate * .055));
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    const env = 1 - i / length;
    data[i] = (Math.random() * 2 - 1) * env;
  }

  const src = c.createBufferSource();
  const gain = c.createGain();
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 780;
  filter.Q.value = 1.2;
  gain.gain.value = strength;
  src.buffer = buffer;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  src.start(when);
  activeNodes.push(src);
}

/**
 * Panda'nın tamamen uygulamaya özel, insan konuşmasına benzemeyen "karakter dili".
 * TTS, kayıtlı insan sesi veya yapay zekâ ses servisi kullanmaz.
 */
export async function playPandaVoice(
  text: string,
  intent: PandaVoiceIntent = 'talk',
  enabled = true,
): Promise<number> {
  if (!enabled) return 0;

  const c = getContext();
  if (!c) return 0;

  try {
    if (c.state === 'suspended') await c.resume();
  } catch {
    return 0;
  }

  if (c.state !== 'running') return 0;
  unlocked = true;
  stopActive();

  const profile = intentProfile(intent);
  const hash = hashText(text);
  const extra = Math.min(6, Math.floor(text.length / 24));
  const count = Math.max(2, profile.count + extra);
  const start = c.currentTime + .025;
  const step = .115 / profile.rate;

  for (let i = 0; i < count; i += 1) {
    const bits = (hash >> ((i % 6) * 4)) & 0xf;
    const direction = i % 2 === 0 ? 1 : -1;
    const jitter = (bits / 15 - .5) * profile.spread;
    const melodic = direction * (i % 3) * 18;
    const freq = Math.max(120, profile.base + jitter + melodic);
    const duration = (.075 + (bits % 4) * .012) / profile.rate;
    const when = start + i * step;
    scheduleSyllable(c, when, freq, duration, profile.wave, i % 2 === 0 ? .08 : -.05);
    if (i % 3 === 1) scheduleBreathyPop(c, when + duration * .45, .012);
  }

  return Math.round((count * step + .16) * 1000);
}

export function pandaVoiceIsUnlocked(): boolean {
  return unlocked;
}
