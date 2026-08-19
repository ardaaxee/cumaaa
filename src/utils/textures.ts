import * as THREE from 'three'

// Procedural PBR textures generated on a <canvas> at runtime — no external
// image assets, so nothing to 404 on and no licenses to track. Each texture is
// built once and cached. A generated normal map gives real micro-surface
// response to lighting, which is most of what sells "PBR" here.

type Cache = Record<string, THREE.Texture>
const cache: Cache = {}

function canvas(size: number): { c: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null {
  if (typeof document === 'undefined') return null
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')
  if (!ctx) return null
  return { c, ctx }
}

// Value-noise helper (cheap, deterministic-ish) for grain.
function noise(ctx: CanvasRenderingContext2D, size: number, alpha: number, mono = true) {
  const img = ctx.getImageData(0, 0, size, size)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * alpha
    if (mono) {
      d[i] += n
      d[i + 1] += n
      d[i + 2] += n
    } else {
      d[i] += n
      d[i + 1] += (Math.random() - 0.5) * alpha
      d[i + 2] += (Math.random() - 0.5) * alpha
    }
  }
  ctx.putImageData(img, 0, 0)
}

// Convert a grayscale height canvas into a tangent-space normal map texture.
function heightToNormal(height: HTMLCanvasElement, strength: number): THREE.Texture | null {
  const size = height.width
  const hctx = height.getContext('2d')
  if (!hctx) return null
  const src = hctx.getImageData(0, 0, size, size).data
  const out = canvas(size)
  if (!out) return null
  const img = out.ctx.createImageData(size, size)
  const d = img.data
  const at = (x: number, y: number) => {
    const xi = (x + size) % size
    const yi = (y + size) % size
    return src[(yi * size + xi) * 4] / 255
  }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (at(x - 1, y) - at(x + 1, y)) * strength
      const dy = (at(x, y - 1) - at(x, y + 1)) * strength
      const nz = 1
      const len = Math.hypot(dx, dy, nz)
      const i = (y * size + x) * 4
      d[i] = ((dx / len) * 0.5 + 0.5) * 255
      d[i + 1] = ((dy / len) * 0.5 + 0.5) * 255
      d[i + 2] = (nz / len) * 255
      d[i + 3] = 255
    }
  }
  out.ctx.putImageData(img, 0, 0)
  const tex = new THREE.CanvasTexture(out.c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

function finalize(c: HTMLCanvasElement, repeat: number, srgb = true): THREE.Texture {
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(repeat, repeat)
  tex.anisotropy = 4
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export interface Surface {
  map: THREE.Texture
  normalMap?: THREE.Texture
  roughnessMap?: THREE.Texture
}

// ---- Wood floor -----------------------------------------------------------
export function woodFloor(): Surface {
  if (cache.woodMap) return { map: cache.woodMap, normalMap: cache.woodNrm, roughnessMap: cache.woodRgh }
  const size = 512
  const base = canvas(size)
  const h = canvas(size)
  if (!base || !h) return fallback('#3a2c1f')

  const plankW = size / 6
  for (let p = 0; p < 6; p++) {
    const x = p * plankW
    // Warm oak tones with per-plank variation.
    const r = 78 + Math.floor(Math.random() * 26)
    const g = 56 + Math.floor(Math.random() * 20)
    const b = 38 + Math.floor(Math.random() * 14)
    base.ctx.fillStyle = `rgb(${r},${g},${b})`
    base.ctx.fillRect(x, 0, plankW, size)
    // grain streaks
    for (let s = 0; s < 46; s++) {
      const gy = Math.random() * size
      base.ctx.strokeStyle = `rgba(${r - 24},${g - 18},${b - 12},${0.06 + Math.random() * 0.1})`
      base.ctx.lineWidth = 0.5 + Math.random()
      base.ctx.beginPath()
      base.ctx.moveTo(x, gy)
      base.ctx.bezierCurveTo(x + plankW * 0.3, gy + (Math.random() - 0.5) * 8, x + plankW * 0.7, gy + (Math.random() - 0.5) * 8, x + plankW, gy)
      base.ctx.stroke()
    }
    // occasional darker knot
    if (Math.random() > 0.5) {
      const ky = Math.random() * size
      const kx = x + plankW * (0.3 + Math.random() * 0.4)
      const grd = base.ctx.createRadialGradient(kx, ky, 1, kx, ky, 6 + Math.random() * 5)
      grd.addColorStop(0, 'rgba(30,18,10,0.55)')
      grd.addColorStop(1, 'rgba(30,18,10,0)')
      base.ctx.fillStyle = grd
      base.ctx.beginPath()
      base.ctx.arc(kx, ky, 10, 0, Math.PI * 2)
      base.ctx.fill()
    }
    // plank gap
    base.ctx.fillStyle = 'rgba(0,0,0,0.5)'
    base.ctx.fillRect(x, 0, 2, size)
  }
  // fine scuffs / scratches (wear)
  for (let s = 0; s < 40; s++) {
    base.ctx.strokeStyle = `rgba(255,240,220,${0.02 + Math.random() * 0.04})`
    base.ctx.lineWidth = 0.5
    const sx = Math.random() * size
    const sy = Math.random() * size
    base.ctx.beginPath()
    base.ctx.moveTo(sx, sy)
    base.ctx.lineTo(sx + (Math.random() - 0.5) * 40, sy + (Math.random() - 0.5) * 6)
    base.ctx.stroke()
  }
  noise(base.ctx, size, 12)

  // height map: gaps are low, grain slightly raised
  h.ctx.fillStyle = '#808080'
  h.ctx.fillRect(0, 0, size, size)
  for (let p = 0; p < 6; p++) {
    h.ctx.fillStyle = '#000'
    h.ctx.fillRect(p * plankW, 0, 2, size)
  }
  noise(h.ctx, size, 40)

  cache.woodMap = finalize(base.c, 3)
  const nrm = heightToNormal(h.c, 2.2)
  if (nrm) {
    nrm.repeat.set(3, 3)
    cache.woodNrm = nrm
  }
  return { map: cache.woodMap, normalMap: cache.woodNrm }
}

// ---- Plaster / painted wall ----------------------------------------------
export function wall(): Surface {
  if (cache.wallMap) return { map: cache.wallMap, normalMap: cache.wallNrm }
  const size = 512
  const base = canvas(size)
  const h = canvas(size)
  if (!base || !h) return fallback('#4a443a')
  // Warm greige painted plaster with subtle blotchy tone variation.
  base.ctx.fillStyle = '#6a6153'
  base.ctx.fillRect(0, 0, size, size)
  for (let i = 0; i < 60; i++) {
    const bx = Math.random() * size
    const by = Math.random() * size
    const rr = 30 + Math.random() * 90
    const g2 = base.ctx.createRadialGradient(bx, by, 1, bx, by, rr)
    const tint = Math.random() > 0.5 ? '255,248,235' : '40,34,26'
    g2.addColorStop(0, `rgba(${tint},${0.015 + Math.random() * 0.03})`)
    g2.addColorStop(1, `rgba(${tint},0)`)
    base.ctx.fillStyle = g2
    base.ctx.beginPath()
    base.ctx.arc(bx, by, rr, 0, Math.PI * 2)
    base.ctx.fill()
  }
  noise(base.ctx, size, 8)

  h.ctx.fillStyle = '#808080'
  h.ctx.fillRect(0, 0, size, size)
  noise(h.ctx, size, 55)

  cache.wallMap = finalize(base.c, 4)
  const nrm = heightToNormal(h.c, 0.8)
  if (nrm) {
    nrm.repeat.set(4, 4)
    cache.wallNrm = nrm
  }
  return { map: cache.wallMap, normalMap: cache.wallNrm }
}

// ---- Fabric rug -----------------------------------------------------------
export function rug(): Surface {
  if (cache.rugMap) return { map: cache.rugMap, normalMap: cache.rugNrm }
  const size = 256
  const base = canvas(size)
  const h = canvas(size)
  if (!base || !h) return fallback('#6b5d4a')
  // Warm wool rug with a woven weave and a woven border (no neon).
  base.ctx.fillStyle = '#6b5d4a'
  base.ctx.fillRect(0, 0, size, size)
  for (let i = 0; i < size; i += 3) {
    base.ctx.strokeStyle = i % 6 === 0 ? 'rgba(0,0,0,0.05)' : 'rgba(255,240,220,0.04)'
    base.ctx.beginPath(); base.ctx.moveTo(i, 0); base.ctx.lineTo(i, size); base.ctx.stroke()
    base.ctx.beginPath(); base.ctx.moveTo(0, i); base.ctx.lineTo(size, i); base.ctx.stroke()
  }
  base.ctx.strokeStyle = 'rgba(40,32,24,0.4)'
  base.ctx.lineWidth = 8
  base.ctx.strokeRect(14, 14, size - 28, size - 28)
  base.ctx.strokeStyle = 'rgba(150,120,90,0.3)'
  base.ctx.lineWidth = 3
  base.ctx.strokeRect(22, 22, size - 44, size - 44)
  noise(base.ctx, size, 14)

  h.ctx.fillStyle = '#808080'
  h.ctx.fillRect(0, 0, size, size)
  // weave bumps
  for (let y = 0; y < size; y += 3) for (let x = 0; x < size; x += 3) {
    h.ctx.fillStyle = (x + y) % 6 === 0 ? '#aaa' : '#555'
    h.ctx.fillRect(x, y, 2, 2)
  }
  noise(h.ctx, size, 40)
  cache.rugMap = finalize(base.c, 1)
  const nrm = heightToNormal(h.c, 1.4)
  if (nrm) cache.rugNrm = nrm
  return { map: cache.rugMap, normalMap: cache.rugNrm }
}

// ---- Generic cloth (bed / chair / curtain) --------------------------------
export function fabric(hex: string, key: string): Surface {
  const mk = key + 'Map'
  const nk = key + 'Nrm'
  if (cache[mk]) return { map: cache[mk], normalMap: cache[nk] }
  const size = 256
  const base = canvas(size)
  const h = canvas(size)
  if (!base || !h) return fallback(hex)
  base.ctx.fillStyle = hex
  base.ctx.fillRect(0, 0, size, size)
  // subtle woven threads
  for (let i = 0; i < size; i += 2) {
    base.ctx.strokeStyle = i % 4 === 0 ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.035)'
    base.ctx.beginPath(); base.ctx.moveTo(i, 0); base.ctx.lineTo(i, size); base.ctx.stroke()
  }
  for (let i = 0; i < size; i += 2) {
    base.ctx.strokeStyle = i % 4 === 0 ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.025)'
    base.ctx.beginPath(); base.ctx.moveTo(0, i); base.ctx.lineTo(size, i); base.ctx.stroke()
  }
  noise(base.ctx, size, 10)

  h.ctx.fillStyle = '#808080'
  h.ctx.fillRect(0, 0, size, size)
  for (let y = 0; y < size; y += 2) for (let x = 0; x < size; x += 2) {
    h.ctx.fillStyle = (x + y) % 4 === 0 ? '#9a9a9a' : '#606060'
    h.ctx.fillRect(x, y, 1, 1)
  }
  noise(h.ctx, size, 30)
  cache[mk] = finalize(base.c, 2)
  const nrm = heightToNormal(h.c, 0.9)
  if (nrm) { nrm.repeat.set(2, 2); cache[nk] = nrm }
  return { map: cache[mk], normalMap: cache[nk] }
}

// ---- Lab tech grid floor --------------------------------------------------
export function labGrid(): Surface {
  if (cache.gridMap) return { map: cache.gridMap, normalMap: cache.gridNrm }
  const size = 256
  const base = canvas(size)
  const h = canvas(size)
  if (!base || !h) return fallback('#0a1016')
  base.ctx.fillStyle = '#0a1218'
  base.ctx.fillRect(0, 0, size, size)
  // brushed sheen
  noise(base.ctx, size, 8)
  // grid lines
  base.ctx.strokeStyle = 'rgba(57,212,230,0.5)'
  base.ctx.lineWidth = 2
  base.ctx.strokeRect(2, 2, size - 4, size - 4)
  base.ctx.lineWidth = 1
  base.ctx.strokeStyle = 'rgba(57,212,230,0.18)'
  for (let i = 32; i < size; i += 32) {
    base.ctx.beginPath()
    base.ctx.moveTo(i, 0)
    base.ctx.lineTo(i, size)
    base.ctx.stroke()
    base.ctx.beginPath()
    base.ctx.moveTo(0, i)
    base.ctx.lineTo(size, i)
    base.ctx.stroke()
  }
  // corner nodes
  base.ctx.fillStyle = 'rgba(95,224,239,0.55)'
  ;[0, size].forEach((x) =>
    [0, size].forEach((y) => {
      base.ctx.beginPath()
      base.ctx.arc(x, y, 4, 0, Math.PI * 2)
      base.ctx.fill()
    }),
  )

  h.ctx.fillStyle = '#808080'
  h.ctx.fillRect(0, 0, size, size)
  h.ctx.fillStyle = '#000'
  for (let i = 0; i < size; i += 32) {
    h.ctx.fillRect(i, 0, 2, size)
    h.ctx.fillRect(0, i, size, 2)
  }
  cache.gridMap = finalize(base.c, 1)
  const nrm = heightToNormal(h.c, 0.6)
  if (nrm) cache.gridNrm = nrm
  return { map: cache.gridMap, normalMap: cache.gridNrm }
}

// ---- Ceramic tile (kitchen / bathroom) ------------------------------------
export function tile(hex = '#cdc7bd', groutHex = '#8f887c'): Surface {
  const key = 'tile_' + hex
  if (cache[key + 'Map']) return { map: cache[key + 'Map'], normalMap: cache[key + 'Nrm'] }
  const size = 256
  const base = canvas(size)
  const h = canvas(size)
  if (!base || !h) return fallback(hex)
  base.ctx.fillStyle = groutHex
  base.ctx.fillRect(0, 0, size, size)
  const n = 4 // tiles per axis
  const cell = size / n
  const gap = 4
  for (let ty = 0; ty < n; ty++) {
    for (let tx = 0; tx < n; tx++) {
      const shade = 8 - Math.floor(Math.random() * 16)
      base.ctx.fillStyle = shift(hex, shade)
      base.ctx.fillRect(tx * cell + gap / 2, ty * cell + gap / 2, cell - gap, cell - gap)
    }
  }
  noise(base.ctx, size, 6)

  h.ctx.fillStyle = '#000'
  h.ctx.fillRect(0, 0, size, size)
  for (let ty = 0; ty < n; ty++)
    for (let tx = 0; tx < n; tx++) {
      h.ctx.fillStyle = '#b0b0b0'
      h.ctx.fillRect(tx * cell + gap / 2, ty * cell + gap / 2, cell - gap, cell - gap)
    }
  cache[key + 'Map'] = finalize(base.c, 3)
  const nrm = heightToNormal(h.c, 1.6)
  if (nrm) {
    nrm.repeat.set(3, 3)
    cache[key + 'Nrm'] = nrm
  }
  return { map: cache[key + 'Map'], normalMap: cache[key + 'Nrm'] }
}

function shift(hex: string, delta: number): string {
  const n = parseInt(hex.slice(1), 16)
  const r = clampByte(((n >> 16) & 255) + delta)
  const g = clampByte(((n >> 8) & 255) + delta)
  const b = clampByte((n & 255) + delta)
  return `rgb(${r},${g},${b})`
}
function clampByte(v: number): number {
  return Math.max(0, Math.min(255, v))
}

// ---- Soft contact-AO blob (fakes ambient occlusion under furniture) -------
export function aoBlob(): THREE.Texture {
  if (cache.aoBlob) return cache.aoBlob
  const size = 128
  const out = canvas(size)
  if (!out) return new THREE.Texture()
  const { ctx } = out
  const g = ctx.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(0,0,0,0.55)')
  g.addColorStop(0.6, 'rgba(0,0,0,0.28)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(out.c)
  cache.aoBlob = tex
  return tex
}

function fallback(color: string): { map: THREE.Texture } {
  // Empty texture; caller still has its material color as a visual fallback.
  void color
  return { map: new THREE.Texture() }
}

// Dispose everything (used on hard resets if ever needed).
export function disposeTextures() {
  Object.values(cache).forEach((t) => t.dispose())
}
