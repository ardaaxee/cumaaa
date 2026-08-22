// Deterministic pseudo-random helpers for "lived-in" imperfection — small
// offsets in rotation/position/scale/shade so furniture and props don't look
// laser-perfect, WITHOUT the room re-shuffling on every reload. Always seed with
// a stable string per object.

export function seeded(seed: string): () => number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h += 0x6d2b79f5
    let t = h
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// A small signed jitter in [-amount, amount] from a seeded generator.
export function jitter(rand: () => number, amount: number): number {
  return (rand() * 2 - 1) * amount
}

// Nudge a hex colour's lightness a touch (deterministically) for subtle variation.
export function shadeVary(hex: string, rand: () => number, amount = 0.06): string {
  const n = parseInt(hex.slice(1), 16)
  const f = 1 + (rand() * 2 - 1) * amount
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  const r = clamp(((n >> 16) & 255) * f)
  const g = clamp(((n >> 8) & 255) * f)
  const b = clamp((n & 255) * f)
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
}
