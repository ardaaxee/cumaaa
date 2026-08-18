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
    const shade = 26 + Math.floor(Math.random() * 18)
    base.ctx.fillStyle = `rgb(${shade + 24},${shade + 12},${shade})`
    base.ctx.fillRect(x, 0, plankW, size)
    // grain streaks
    for (let s = 0; s < 40; s++) {
      const gy = Math.random() * size
      base.ctx.strokeStyle = `rgba(${shade + 40},${shade + 20},${shade + 6},${0.05 + Math.random() * 0.08})`
      base.ctx.lineWidth = 0.5 + Math.random()
      base.ctx.beginPath()
      base.ctx.moveTo(x, gy)
      base.ctx.bezierCurveTo(x + plankW * 0.3, gy + (Math.random() - 0.5) * 8, x + plankW * 0.7, gy + (Math.random() - 0.5) * 8, x + plankW, gy)
      base.ctx.stroke()
    }
    // plank gap
    base.ctx.fillStyle = 'rgba(0,0,0,0.55)'
    base.ctx.fillRect(x, 0, 2, size)
  }
  noise(base.ctx, size, 14)

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
  if (!base || !h) return fallback('#161b24')
  base.ctx.fillStyle = '#181d27'
  base.ctx.fillRect(0, 0, size, size)
  noise(base.ctx, size, 10)
  // faint vignette per tile for depth
  const g = base.ctx.createRadialGradient(size / 2, size / 2, size * 0.2, size / 2, size / 2, size * 0.7)
  g.addColorStop(0, 'rgba(255,255,255,0.02)')
  g.addColorStop(1, 'rgba(0,0,0,0.10)')
  base.ctx.fillStyle = g
  base.ctx.fillRect(0, 0, size, size)

  h.ctx.fillStyle = '#808080'
  h.ctx.fillRect(0, 0, size, size)
  noise(h.ctx, size, 60)

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
  if (!base || !h) return fallback('#16202b')
  base.ctx.fillStyle = '#131c26'
  base.ctx.fillRect(0, 0, size, size)
  // woven cross-hatch
  for (let i = 0; i < size; i += 4) {
    base.ctx.strokeStyle = 'rgba(255,255,255,0.03)'
    base.ctx.beginPath()
    base.ctx.moveTo(i, 0)
    base.ctx.lineTo(i, size)
    base.ctx.stroke()
    base.ctx.beginPath()
    base.ctx.moveTo(0, i)
    base.ctx.lineTo(size, i)
    base.ctx.stroke()
  }
  // border accent
  base.ctx.strokeStyle = 'rgba(57,212,230,0.25)'
  base.ctx.lineWidth = 6
  base.ctx.strokeRect(12, 12, size - 24, size - 24)
  noise(base.ctx, size, 12)

  h.ctx.fillStyle = '#808080'
  h.ctx.fillRect(0, 0, size, size)
  noise(h.ctx, size, 70)
  cache.rugMap = finalize(base.c, 1)
  const nrm = heightToNormal(h.c, 1.2)
  if (nrm) cache.rugNrm = nrm
  return { map: cache.rugMap, normalMap: cache.rugNrm }
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

function fallback(color: string): { map: THREE.Texture } {
  // Empty texture; caller still has its material color as a visual fallback.
  void color
  return { map: new THREE.Texture() }
}

// Dispose everything (used on hard resets if ever needed).
export function disposeTextures() {
  Object.values(cache).forEach((t) => t.dispose())
}
