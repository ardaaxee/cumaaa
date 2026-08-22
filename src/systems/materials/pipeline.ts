import * as THREE from 'three'
import type { GraphicsQuality } from '../../types'

// The texture pipeline.
//
// A "master" here is not a file on disk — there are no image assets in this
// project — it is a RESOLUTION-INDEPENDENT painter. The same painter draws the
// same surface at 512 or at 4096; every length inside it is expressed relative
// to the size it is handed, and every random decision comes from a seeded
// generator keyed to the surface. That is what makes an upgrade an upgrade:
// re-running the painter at 4096 produces the SAME wood, with the same knots in
// the same places, at four times the detail — not a different plank.
//
// Runtime resolution is chosen per device tier, never by the painter. And it is
// reached by STREAMING: every surface is rendered immediately at a cheap boot
// resolution so the frame is never blocked, then re-rendered in the background,
// in time-sliced bands, and swapped into the same THREE.Texture handle. Nothing
// downstream ever sees the swap.
//
// Honest note on "4K": 4096×4096 RGBA is 67 MB per map before mipmaps. Four
// maps on one surface is a quarter of a gigabyte. So the ladder below is capped
// by a real memory budget, derived maps run at half the albedo's resolution
// (standard practice — normals and roughness carry far less high-frequency
// information than colour), and `textureStats()` reports what was actually
// allocated rather than what was asked for.

export type TexClass = 'hero' | 'standard' | 'detail'

export interface Paint {
  ctx: CanvasRenderingContext2D
  /** Edge length of the canvas being painted. */
  size: number
  /** Scale from the 512-unit design space this project's painters are written in. */
  s: number
  /** Deterministic RNG: the same surface always paints the same way. */
  rnd(): number
}

type Painter = (p: Paint) => void

export interface SurfaceSpec {
  key: string
  /** How much resolution this surface deserves. Hero gets the full ladder. */
  cls?: TexClass
  repeat?: number
  albedo: Painter
  /** Greyscale height field. The tangent-space normal map is derived from it. */
  height?: Painter
  normalStrength?: number
  /** Greyscale roughness map; white = rough. */
  roughness?: Painter
  /** Greyscale ambient occlusion; white = unoccluded. */
  ao?: Painter
  /** Monochrome grain added to the albedo after painting, in 0-255 units. */
  grain?: number
  /** Mean-luminance target for the albedo, or null to leave it alone. */
  normalize?: number | null
  /** Colour maps are sRGB; masks and data maps are linear. */
  anisotropy?: number
}

export interface PbrSurface {
  map: THREE.Texture
  normalMap?: THREE.Texture
  roughnessMap?: THREE.Texture
  aoMap?: THREE.Texture
  repeat: number
  /** The resolution currently resident, for reporting. */
  resolution(): number
}

// ---- The ladder ------------------------------------------------------------

const LADDER: Record<GraphicsQuality, number> = {
  low: 512,
  medium: 1024,
  high: 2048,
  ultra: 4096,
}
const STEP: Record<TexClass, number> = { hero: 0, standard: 1, detail: 2 }
const MIN_RES = 256
const BOOT_RES = 512
/** Derived maps run at half the albedo — they carry much less detail. */
const DERIVED_DIV = 2
/** Above this the pipeline stops raising targets and reports the cap. */
const MEMORY_BUDGET_MB = 320
/** How long one background slice may hold the main thread. */
const SLICE_MS = 6

let tier: GraphicsQuality = 'medium'
let allocatedBytes = 0
let cappedByBudget = false

function targetFor(cls: TexClass): number {
  const raw = LADDER[tier] >> STEP[cls]
  return Math.max(MIN_RES, Math.min(4096, raw))
}

function bytesOf(size: number): number {
  // RGBA plus the mip chain, which adds a third.
  return size * size * 4 * 1.34
}

// ---- Deterministic noise ---------------------------------------------------

function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeCanvas(size: number): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  return c
}

// ---- Row-banded passes -----------------------------------------------------
//
// The per-pixel work is where a 4096 map actually costs something: 16.7 million
// pixels, four reads each for the normal derivation. Doing that in one call is
// a quarter-second stall. These passes therefore work in row bands and report
// how far they got, so the scheduler can stop mid-map and come back.

function grainBand(d: Uint8ClampedArray, size: number, y0: number, y1: number, amount: number, rnd: () => number) {
  const end = Math.min(y1, size) * size * 4
  for (let i = y0 * size * 4; i < end; i += 4) {
    const n = (rnd() - 0.5) * amount
    d[i] += n
    d[i + 1] += n
    d[i + 2] += n
  }
}

function normalBand(
  src: Uint8ClampedArray,
  dst: Uint8ClampedArray,
  size: number,
  y0: number,
  y1: number,
  strength: number,
) {
  const at = (x: number, y: number) => {
    const xi = (x + size) % size
    const yi = (y + size) % size
    return src[(yi * size + xi) * 4] / 255
  }
  const yEnd = Math.min(y1, size)
  for (let y = y0; y < yEnd; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (at(x - 1, y) - at(x + 1, y)) * strength
      const dy = (at(x, y - 1) - at(x, y + 1)) * strength
      const len = Math.hypot(dx, dy, 1)
      const i = (y * size + x) * 4
      dst[i] = ((dx / len) * 0.5 + 0.5) * 255
      dst[i + 1] = ((dy / len) * 0.5 + 0.5) * 255
      dst[i + 2] = (1 / len) * 255
      dst[i + 3] = 255
    }
  }
}

function normalizeAlbedo(img: ImageData, target: number): void {
  const d = img.data
  let sum = 0
  for (let i = 0; i < d.length; i += 4) sum += d[i] * 0.2126 + d[i + 1] * 0.7152 + d[i + 2] * 0.0722
  const mean = sum / (d.length / 4) / 255
  if (mean <= 0.001) return
  const gain = Math.min(target / mean, 4)
  if (Math.abs(gain - 1) < 0.01) return
  for (let i = 0; i < d.length; i += 4) {
    d[i] = Math.min(255, d[i] * gain)
    d[i + 1] = Math.min(255, d[i + 1] * gain)
    d[i + 2] = Math.min(255, d[i + 2] * gain)
  }
}

// ---- One map's build, as a resumable job -----------------------------------

type MapKind = 'albedo' | 'normal' | 'roughness' | 'ao'

interface MapJob {
  step(): boolean // true when finished
}

function buildMapJob(
  spec: SurfaceSpec,
  kind: MapKind,
  size: number,
  install: (canvas: HTMLCanvasElement) => void,
): MapJob | null {
  const painter =
    kind === 'albedo' ? spec.albedo : kind === 'normal' ? spec.height : kind === 'roughness' ? spec.roughness : spec.ao
  if (!painter) return null
  const canvas = makeCanvas(size)
  if (!canvas) return null
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  const rnd = mulberry32(hash(spec.key + ':' + kind + ':seed'))
  let phase: 'paint' | 'grain' | 'derive' | 'done' = 'paint'
  let row = 0
  let img: ImageData | null = null
  let out: ImageData | null = null
  // ~64k pixels per slice keeps each band well inside the frame budget even on
  // a software renderer.
  const band = Math.max(8, Math.round(65536 / size))

  return {
    step(): boolean {
      switch (phase) {
        case 'paint': {
          painter({ ctx, size, s: size / 512, rnd })
          if (kind === 'albedo' && spec.grain) {
            img = ctx.getImageData(0, 0, size, size)
            phase = 'grain'
            row = 0
          } else if (kind === 'normal') {
            img = ctx.getImageData(0, 0, size, size)
            out = ctx.createImageData(size, size)
            phase = 'derive'
            row = 0
          } else {
            phase = 'done'
          }
          return false
        }
        case 'grain': {
          if (!img) { phase = 'done'; return false }
          grainBand(img.data, size, row, row + band, spec.grain ?? 0, rnd)
          row += band
          if (row < size) return false
          if (spec.normalize !== null) normalizeAlbedo(img, spec.normalize ?? 0.93)
          ctx.putImageData(img, 0, 0)
          phase = 'done'
          return false
        }
        case 'derive': {
          if (!img || !out) { phase = 'done'; return false }
          normalBand(img.data, out.data, size, row, row + band, spec.normalStrength ?? 1.2)
          row += band
          if (row < size) return false
          ctx.putImageData(out, 0, 0)
          phase = 'done'
          return false
        }
        case 'done':
          install(canvas)
          return true
      }
    },
  }
}

// ---- Scheduler -------------------------------------------------------------

const queue: MapJob[] = []
let pumping = false

function schedule(fn: () => void): void {
  const w = globalThis as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void }
  if (typeof w.requestIdleCallback === 'function') w.requestIdleCallback(fn, { timeout: 500 })
  else setTimeout(fn, 16)
}

function pump(): void {
  if (pumping) return
  pumping = true
  const tick = () => {
    const t0 = performance.now()
    while (queue.length && performance.now() - t0 < SLICE_MS) {
      if (queue[0].step()) queue.shift()
    }
    if (queue.length) schedule(tick)
    else pumping = false
  }
  schedule(tick)
}

// ---- Cache and public API --------------------------------------------------

interface Entry {
  spec: SurfaceSpec
  surface: PbrSurface
  size: number
  /** Size currently being built in the background, if any. */
  building: number
  textures: Partial<Record<MapKind, THREE.Texture>>
}

const entries = new Map<string, Entry>()

function newTexture(canvas: HTMLCanvasElement, kind: MapKind, spec: SurfaceSpec): THREE.Texture {
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  const r = spec.repeat ?? 1
  tex.repeat.set(r, r)
  tex.anisotropy = spec.anisotropy ?? 8
  if (kind === 'albedo') tex.colorSpace = THREE.SRGBColorSpace
  allocatedBytes += bytesOf(canvas.width)
  return tex
}

function swapImage(tex: THREE.Texture, canvas: HTMLCanvasElement): void {
  const old = tex.image as HTMLCanvasElement | undefined
  if (old?.width) allocatedBytes -= bytesOf(old.width)
  allocatedBytes += bytesOf(canvas.width)
  tex.image = canvas
  tex.needsUpdate = true
}

function build(entry: Entry, size: number, background: boolean): void {
  const kinds: MapKind[] = ['albedo', 'normal', 'roughness', 'ao']
  for (const kind of kinds) {
    const res = kind === 'albedo' ? size : Math.max(MIN_RES, size / DERIVED_DIV)
    const job = buildMapJob(entry.spec, kind, res, (canvas) => {
      const existing = entry.textures[kind]
      if (existing) swapImage(existing, canvas)
      else entry.textures[kind] = newTexture(canvas, kind, entry.spec)
      if (kind === 'albedo') entry.size = size
    })
    if (!job) continue
    if (background) queue.push(job)
    else while (!job.step()) { /* synchronous boot render */ }
  }
  if (background) {
    entry.building = size
    pump()
  }
}

/**
 * Get (or create) a surface. Returns immediately with real textures at a boot
 * resolution, and streams the tier's resolution in behind the scenes.
 */
export function surface(spec: SurfaceSpec): PbrSurface {
  const existing = entries.get(spec.key)
  if (existing) return existing.surface

  const cls = spec.cls ?? 'standard'
  const target = targetFor(cls)
  const boot = Math.min(BOOT_RES, target)

  const entry: Entry = {
    spec,
    size: 0,
    building: 0,
    textures: {},
    surface: {
      get map() { return entry.textures.albedo as THREE.Texture },
      get normalMap() { return entry.textures.normal },
      get roughnessMap() { return entry.textures.roughness },
      get aoMap() { return entry.textures.ao },
      repeat: spec.repeat ?? 1,
      resolution: () => entry.size,
    } as PbrSurface,
  }
  entries.set(spec.key, entry)

  build(entry, boot, false)
  if (target > boot) {
    if (allocatedBytes + bytesOf(target) * 2 > MEMORY_BUDGET_MB * 1024 * 1024) cappedByBudget = true
    else build(entry, target, true)
  }
  return entry.surface
}

/**
 * Point every surface at a new tier. Raising re-renders in the background;
 * lowering does too, and frees the difference when the smaller map lands.
 */
export function setTextureTier(q: GraphicsQuality): void {
  if (q === tier) return
  tier = q
  cappedByBudget = false
  queue.length = 0
  for (const entry of entries.values()) {
    const want = targetFor(entry.spec.cls ?? 'standard')
    if (want === entry.size || want === entry.building) continue
    if (want > entry.size && allocatedBytes + bytesOf(want) * 2 > MEMORY_BUDGET_MB * 1024 * 1024) {
      cappedByBudget = true
      continue
    }
    build(entry, want, true)
  }
}

export function textureTier(): GraphicsQuality {
  return tier
}

/** What was actually allocated — for honest performance reporting. */
export function textureStats(): {
  surfaces: number
  megabytes: number
  pending: number
  cappedByBudget: boolean
  resolutions: Record<string, number>
} {
  const resolutions: Record<string, number> = {}
  for (const [key, e] of entries) resolutions[key] = e.size
  return {
    surfaces: entries.size,
    megabytes: Math.round((allocatedBytes / (1024 * 1024)) * 10) / 10,
    pending: queue.length,
    cappedByBudget,
    resolutions,
  }
}

export function disposeSurfaces(): void {
  queue.length = 0
  for (const e of entries.values()) Object.values(e.textures).forEach((t) => t?.dispose())
  entries.clear()
  allocatedBytes = 0
}

/**
 * `aoMap` samples the SECOND uv set. Geometry built here only has one, so
 * point the second at it — otherwise the AO map silently does nothing.
 */
export function withAoUv(geo: THREE.BufferGeometry): THREE.BufferGeometry {
  if (!geo.attributes.uv1 && geo.attributes.uv) geo.setAttribute('uv1', geo.attributes.uv)
  return geo
}
