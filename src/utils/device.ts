import type { GraphicsQuality } from '../types'

// Touch / mobile detection. Kept intentionally simple and defensive so a
// missing browser API never throws.
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return (
    'ontouchstart' in window ||
    (navigator.maxTouchPoints ?? 0) > 0 ||
    // Coarse pointer usually means touch-first hardware.
    window.matchMedia?.('(pointer: coarse)').matches === true
  )
}

// Tier helpers — use these instead of `quality === 'high'` so ULTRA always
// inherits every HIGH feature rather than silently falling back to the
// medium/low branch of a ternary.
export function isHighTier(quality: GraphicsQuality): boolean {
  return quality === 'high' || quality === 'ultra'
}
export function isUltra(quality: GraphicsQuality): boolean {
  return quality === 'ultra'
}

// Rank used by the adaptive-quality watchdog to step up/down.
export const QUALITY_ORDER: GraphicsQuality[] = ['low', 'medium', 'high', 'ultra']

// Pick a sensible *starting* graphics tier. We deliberately start conservative
// (never ULTRA) and let the adaptive watchdog promote a device that proves it
// can hold a high frame rate — mobile is not automatically LOW.
export function detectQuality(): GraphicsQuality {
  if (typeof navigator === 'undefined') return 'medium'
  const cores = navigator.hardwareConcurrency ?? 4
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4
  const touch = isTouchDevice()

  if (touch) {
    if (cores <= 4 || mem <= 3) return 'low'
    return 'medium'
  }
  if (cores <= 4 || mem <= 4) return 'medium'
  return 'high'
}

// Device-pixel-ratio ceiling per quality tier. High DPR on phones murders FPS.
export function dprRange(quality: GraphicsQuality, touch: boolean): [number, number] {
  if (touch) {
    if (quality === 'low') return [0.6, 1]
    if (quality === 'medium') return [0.8, 1.3]
    if (quality === 'high') return [1, 1.6]
    return [1, 2] // ultra
  }
  if (quality === 'low') return [0.8, 1.2]
  if (quality === 'medium') return [1, 1.6]
  if (quality === 'high') return [1, 2]
  return [1, 2.5] // ultra
}

export function shadowsEnabled(quality: GraphicsQuality): boolean {
  return quality !== 'low'
}

export function shadowMapSize(quality: GraphicsQuality): number {
  if (quality === 'ultra') return 4096
  if (quality === 'high') return 2048
  if (quality === 'medium') return 1024
  return 512
}
