import * as THREE from 'three'
import { surface, type Paint, type PbrSurface } from '../systems/materials/pipeline'

// Surface painters.
//
// Every function here describes a material ONCE, at no particular resolution,
// and hands it to the pipeline (systems/materials/pipeline.ts) which decides
// how many pixels the current device deserves and streams them in. A painter
// therefore never mentions a texture size: it works in a 512-unit design space
// and multiplies by `s`.
//
// Each painter also has a FINE pass gated on resolution. That is what makes a
// higher tier worth having: at 512 a plank has its grain and its knots, at 4096
// it also has the hairline pore lines and the fine scratches that only exist if
// there are pixels to put them in. Turning the same drawing up to 4096 without
// adding detail would be an upscale, not a master.

export type Surface = PbrSurface

const grey = (v: number) => `rgb(${v},${v},${v})`

function flat(p: Paint, hex: string): void {
  p.ctx.fillStyle = hex
  p.ctx.fillRect(0, 0, p.size, p.size)
}

// ---- Wood floor -----------------------------------------------------------

const PLANKS = 6

export function woodFloor(): Surface {
  return surface({
    key: 'woodFloor',
    cls: 'standard',
    repeat: 3,
    grain: 12,
    normalStrength: 2.2,
    albedo: (p) => {
      const { ctx, size, s, rnd } = p
      const plankW = size / PLANKS
      for (let i = 0; i < PLANKS; i++) {
        const x = i * plankW
        const r = 78 + Math.floor(rnd() * 26)
        const g = 56 + Math.floor(rnd() * 20)
        const b = 38 + Math.floor(rnd() * 14)
        ctx.fillStyle = `rgb(${r},${g},${b})`
        ctx.fillRect(x, 0, plankW, size)
        // Cathedral grain: long bowed streaks running the length of the plank.
        for (let k = 0; k < 46; k++) {
          const gy = rnd() * size
          ctx.strokeStyle = `rgba(${r - 24},${g - 18},${b - 12},${0.06 + rnd() * 0.1})`
          ctx.lineWidth = (0.5 + rnd()) * s
          ctx.beginPath()
          ctx.moveTo(x, gy)
          ctx.bezierCurveTo(
            x + plankW * 0.3, gy + (rnd() - 0.5) * 8 * s,
            x + plankW * 0.7, gy + (rnd() - 0.5) * 8 * s,
            x + plankW, gy,
          )
          ctx.stroke()
        }
        if (rnd() > 0.5) {
          const ky = rnd() * size
          const kx = x + plankW * (0.3 + rnd() * 0.4)
          const rr = (6 + rnd() * 5) * s
          const gr = ctx.createRadialGradient(kx, ky, s, kx, ky, rr)
          gr.addColorStop(0, 'rgba(30,18,10,0.55)')
          gr.addColorStop(1, 'rgba(30,18,10,0)')
          ctx.fillStyle = gr
          ctx.beginPath()
          ctx.arc(kx, ky, rr * 1.6, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.fillStyle = 'rgba(0,0,0,0.5)'
        ctx.fillRect(x, 0, 2 * s, size)
      }
      // Scuffs from being walked on.
      for (let k = 0; k < 40; k++) {
        ctx.strokeStyle = `rgba(255,240,220,${0.02 + rnd() * 0.04})`
        ctx.lineWidth = 0.5 * s
        const sx = rnd() * size
        const sy = rnd() * size
        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.lineTo(sx + (rnd() - 0.5) * 40 * s, sy + (rnd() - 0.5) * 6 * s)
        ctx.stroke()
      }
      // FINE: open pores, one pixel wide. Only visible once there are pixels.
      if (size >= 1024) {
        ctx.lineWidth = 1
        for (let k = 0; k < 900 * s; k++) {
          const px = rnd() * size
          const py = rnd() * size
          ctx.strokeStyle = `rgba(24,14,8,${0.05 + rnd() * 0.09})`
          ctx.beginPath()
          ctx.moveTo(px, py)
          ctx.lineTo(px + (rnd() - 0.5) * 3 * s, py + (2 + rnd() * 14) * s)
          ctx.stroke()
        }
      }
    },
    height: (p) => {
      const { ctx, size, s, rnd } = p
      flat(p, grey(128))
      const plankW = size / PLANKS
      ctx.fillStyle = '#000'
      for (let i = 0; i < PLANKS; i++) ctx.fillRect(i * plankW, 0, 2 * s, size)
      // Grain sits slightly proud, so raking light picks it out.
      for (let k = 0; k < 200; k++) {
        ctx.strokeStyle = `rgba(255,255,255,${0.05 + rnd() * 0.06})`
        ctx.lineWidth = (0.6 + rnd() * 1.2) * s
        const gy = rnd() * size
        const x = Math.floor(rnd() * PLANKS) * plankW
        ctx.beginPath()
        ctx.moveTo(x, gy)
        ctx.bezierCurveTo(x + plankW * 0.3, gy + (rnd() - 0.5) * 6 * s, x + plankW * 0.7, gy + (rnd() - 0.5) * 6 * s, x + plankW, gy)
        ctx.stroke()
      }
    },
    roughness: (p) => {
      // Varnish is not uniform: the traffic lanes are polished smoother.
      const { ctx, size, s, rnd } = p
      flat(p, grey(190))
      for (let k = 0; k < 26; k++) {
        const cx = rnd() * size
        const cy = rnd() * size
        const rr = (40 + rnd() * 90) * s
        const g = ctx.createRadialGradient(cx, cy, s, cx, cy, rr)
        g.addColorStop(0, 'rgba(120,120,120,0.5)')
        g.addColorStop(1, 'rgba(120,120,120,0)')
        ctx.fillStyle = g
        ctx.fillRect(cx - rr, cy - rr, rr * 2, rr * 2)
      }
    },
  })
}

// ---- Plaster / painted wall ----------------------------------------------

export function wall(): Surface {
  return surface({
    key: 'wall',
    cls: 'standard',
    repeat: 4,
    grain: 8,
    normalStrength: 0.8,
    albedo: (p) => {
      const { ctx, size, s, rnd } = p
      flat(p, '#6a6153')
      for (let i = 0; i < 60; i++) {
        const bx = rnd() * size
        const by = rnd() * size
        const rr = (30 + rnd() * 90) * s
        const g = ctx.createRadialGradient(bx, by, s, bx, by, rr)
        const tint = rnd() > 0.5 ? '255,248,235' : '40,34,26'
        g.addColorStop(0, `rgba(${tint},${0.015 + rnd() * 0.03})`)
        g.addColorStop(1, `rgba(${tint},0)`)
        ctx.fillStyle = g
        ctx.fillRect(bx - rr, by - rr, rr * 2, rr * 2)
      }
      // FINE: roller stipple — the reason a painted wall is never a flat fill.
      if (size >= 1024) {
        for (let k = 0; k < 2600 * s; k++) {
          const px = rnd() * size
          const py = rnd() * size
          ctx.fillStyle = `rgba(${rnd() > 0.5 ? '255,250,240' : '52,46,38'},${0.03 + rnd() * 0.05})`
          ctx.beginPath()
          ctx.arc(px, py, (0.6 + rnd() * 1.4) * s, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    },
    height: (p) => {
      const { ctx, size, s, rnd } = p
      flat(p, grey(128))
      for (let k = 0; k < 1400; k++) {
        const px = rnd() * size
        const py = rnd() * size
        ctx.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.16)'
        ctx.beginPath()
        ctx.arc(px, py, (1 + rnd() * 2.4) * s, 0, Math.PI * 2)
        ctx.fill()
      }
    },
    roughness: (p) => flat(p, grey(224)),
  })
}

// ---- Fabric rug -----------------------------------------------------------

export function rug(): Surface {
  return surface({
    key: 'rug',
    cls: 'standard',
    repeat: 1,
    grain: 14,
    normalStrength: 1.4,
    albedo: (p) => {
      const { ctx, size, s, rnd } = p
      flat(p, '#6b5d4a')
      const pitch = 3 * s
      for (let i = 0; i < size; i += pitch) {
        ctx.strokeStyle = i % (pitch * 2) < pitch ? 'rgba(0,0,0,0.05)' : 'rgba(255,240,220,0.04)'
        ctx.lineWidth = s
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke()
      }
      ctx.strokeStyle = 'rgba(40,32,24,0.4)'
      ctx.lineWidth = 8 * s
      ctx.strokeRect(14 * s, 14 * s, size - 28 * s, size - 28 * s)
      ctx.strokeStyle = 'rgba(150,120,90,0.3)'
      ctx.lineWidth = 3 * s
      ctx.strokeRect(22 * s, 22 * s, size - 44 * s, size - 44 * s)
      // FINE: individual pile tufts catching the light.
      if (size >= 1024) {
        for (let k = 0; k < 4000 * s; k++) {
          const px = rnd() * size
          const py = rnd() * size
          ctx.strokeStyle = `rgba(${rnd() > 0.5 ? '196,176,148' : '52,44,34'},${0.06 + rnd() * 0.1})`
          ctx.lineWidth = s
          ctx.beginPath()
          ctx.moveTo(px, py)
          ctx.lineTo(px + (rnd() - 0.5) * 4 * s, py + (rnd() - 0.5) * 4 * s)
          ctx.stroke()
        }
      }
    },
    height: (p) => {
      const { ctx, size, s } = p
      flat(p, grey(128))
      const pitch = Math.max(2, Math.round(3 * s))
      for (let y = 0; y < size; y += pitch)
        for (let x = 0; x < size; x += pitch) {
          ctx.fillStyle = (x + y) % (pitch * 2) === 0 ? grey(170) : grey(85)
          ctx.fillRect(x, y, pitch - 1, pitch - 1)
        }
    },
    roughness: (p) => flat(p, grey(242)),
  })
}

// ---- Generic cloth (bed / chair / curtain) --------------------------------

export type FabricKind = 'knit' | 'jersey' | 'denim' | 'cotton' | 'linen' | 'leather'

/**
 * A woven cloth. `kind` changes the weave itself — a denim twill runs on the
 * diagonal, a knit is looped, a jersey is fine and flat — so two garments in
 * the same colour still read as different materials.
 */
export function fabric(hex: string, key: string, kind: FabricKind = 'cotton'): Surface {
  return surface({
    key: `fabric:${key}:${kind}`,
    cls: 'detail',
    repeat: 2,
    grain: kind === 'leather' ? 6 : 10,
    normalStrength: kind === 'denim' ? 1.3 : kind === 'knit' ? 1.5 : 0.9,
    albedo: (p) => {
      flat(p, hex)
      weave(p, kind, false)
    },
    height: (p) => {
      flat(p, grey(128))
      weave(p, kind, true)
    },
    roughness: (p) =>
      flat(p, grey(kind === 'leather' ? 150 : kind === 'denim' ? 236 : kind === 'knit' ? 244 : 228)),
  })
}

function weave(p: Paint, kind: FabricKind, height: boolean): void {
  const { ctx, size, s, rnd } = p
  const dark = height ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.05)'
  const light = height ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.035)'
  if (kind === 'leather') {
    // Grain cells rather than threads.
    for (let k = 0; k < 1800 * s; k++) {
      const px = rnd() * size
      const py = rnd() * size
      ctx.strokeStyle = rnd() > 0.5 ? dark : light
      ctx.lineWidth = s
      ctx.beginPath()
      ctx.arc(px, py, (1.5 + rnd() * 4) * s, rnd() * 6.28, rnd() * 6.28 + 2)
      ctx.stroke()
    }
    return
  }
  if (kind === 'denim') {
    // 3/1 twill: the wales run on the diagonal, which is why denim reads as
    // denim rather than as any other blue cloth.
    const pitch = 4 * s
    ctx.lineWidth = 1.6 * s
    for (let i = -size; i < size * 2; i += pitch) {
      ctx.strokeStyle = dark
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + size, size); ctx.stroke()
      ctx.strokeStyle = light
      ctx.beginPath(); ctx.moveTo(i + pitch * 0.45, 0); ctx.lineTo(i + pitch * 0.45 + size, size); ctx.stroke()
    }
    return
  }
  if (kind === 'knit') {
    // Loops in staggered rows.
    const pitch = 8 * s
    ctx.lineWidth = 1.8 * s
    for (let y = 0; y < size + pitch; y += pitch) {
      for (let x = 0; x < size + pitch; x += pitch) {
        const ox = (Math.round(y / pitch) % 2) * pitch * 0.5
        ctx.strokeStyle = light
        ctx.beginPath()
        ctx.arc(x + ox, y, pitch * 0.32, Math.PI * 0.15, Math.PI * 0.85)
        ctx.stroke()
        ctx.strokeStyle = dark
        ctx.beginPath()
        ctx.arc(x + ox, y + pitch * 0.4, pitch * 0.32, Math.PI * 1.15, Math.PI * 1.85)
        ctx.stroke()
      }
    }
    return
  }
  // Plain weave: warp and weft, jersey finer than cotton.
  const pitch = (kind === 'linen' ? 3 : 2) * s
  ctx.lineWidth = s
  for (let i = 0; i < size; i += pitch) {
    ctx.strokeStyle = i % (pitch * 2) < pitch ? dark : light
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke()
  }
  for (let i = 0; i < size; i += pitch) {
    ctx.strokeStyle = i % (pitch * 2) < pitch ? dark : light
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke()
  }
  if (kind === 'linen' && size >= 1024) {
    // Slubs: the thick spots in a linen yarn.
    for (let k = 0; k < 600 * s; k++) {
      const px = rnd() * size
      const py = rnd() * size
      ctx.strokeStyle = rnd() > 0.5 ? dark : light
      ctx.lineWidth = 2 * s
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + (4 + rnd() * 10) * s, py); ctx.stroke()
    }
  }
}

// ---- Lab tech grid floor --------------------------------------------------

export function labGrid(): Surface {
  return surface({
    key: 'labGrid',
    cls: 'detail',
    repeat: 1,
    normalize: null, // deliberately dark; normalising would bleach it
    grain: 8,
    normalStrength: 0.6,
    albedo: (p) => {
      const { ctx, size, s } = p
      flat(p, '#0a1218')
      ctx.strokeStyle = 'rgba(57,212,230,0.5)'
      ctx.lineWidth = 2 * s
      ctx.strokeRect(2 * s, 2 * s, size - 4 * s, size - 4 * s)
      ctx.lineWidth = s
      ctx.strokeStyle = 'rgba(57,212,230,0.18)'
      const cell = size / 8
      for (let i = cell; i < size; i += cell) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke()
      }
      ctx.fillStyle = 'rgba(95,224,239,0.55)'
      for (const x of [0, size])
        for (const y of [0, size]) {
          ctx.beginPath(); ctx.arc(x, y, 4 * s, 0, Math.PI * 2); ctx.fill()
        }
    },
    height: (p) => {
      const { ctx, size, s } = p
      flat(p, grey(128))
      ctx.fillStyle = '#000'
      const cell = size / 8
      for (let i = 0; i < size; i += cell) {
        ctx.fillRect(i, 0, 2 * s, size)
        ctx.fillRect(0, i, size, 2 * s)
      }
    },
  })
}

// ---- Ceramic tile (kitchen / bathroom) ------------------------------------

export function tile(hex = '#cdc7bd', groutHex = '#8f887c'): Surface {
  return surface({
    key: `tile:${hex}:${groutHex}`,
    cls: 'standard',
    repeat: 3,
    grain: 6,
    normalStrength: 1.6,
    albedo: (p) => {
      const { ctx, size, s, rnd } = p
      flat(p, groutHex)
      const n = 4
      const cell = size / n
      const gap = 4 * s
      for (let ty = 0; ty < n; ty++)
        for (let tx = 0; tx < n; tx++) {
          const shade = 8 - Math.floor(rnd() * 16)
          ctx.fillStyle = shift(hex, shade)
          ctx.fillRect(tx * cell + gap / 2, ty * cell + gap / 2, cell - gap, cell - gap)
          // FINE: the glaze is not perfectly even; it pools at the edges.
          if (size >= 1024) {
            const g = ctx.createLinearGradient(tx * cell, ty * cell, tx * cell + cell, ty * cell + cell)
            g.addColorStop(0, 'rgba(255,255,255,0.05)')
            g.addColorStop(0.5, 'rgba(255,255,255,0)')
            g.addColorStop(1, 'rgba(0,0,0,0.045)')
            ctx.fillStyle = g
            ctx.fillRect(tx * cell + gap / 2, ty * cell + gap / 2, cell - gap, cell - gap)
          }
        }
    },
    height: (p) => {
      const { ctx, size, s } = p
      flat(p, '#000')
      const n = 4
      const cell = size / n
      const gap = 4 * s
      ctx.fillStyle = grey(176)
      for (let ty = 0; ty < n; ty++)
        for (let tx = 0; tx < n; tx++)
          ctx.fillRect(tx * cell + gap / 2, ty * cell + gap / 2, cell - gap, cell - gap)
    },
    roughness: (p) => {
      // Glazed tile is smooth; the grout between it is not. That contrast is
      // most of what says "ceramic".
      const { ctx, size, s } = p
      flat(p, grey(235))
      const n = 4
      const cell = size / n
      const gap = 4 * s
      ctx.fillStyle = grey(48)
      for (let ty = 0; ty < n; ty++)
        for (let tx = 0; tx < n; tx++)
          ctx.fillRect(tx * cell + gap / 2, ty * cell + gap / 2, cell - gap, cell - gap)
    },
  })
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

let aoBlobTex: THREE.Texture | null = null

export function aoBlob(): THREE.Texture {
  if (aoBlobTex) return aoBlobTex
  if (typeof document === 'undefined') return new THREE.Texture()
  const size = 128
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  if (!ctx) return new THREE.Texture()
  const g = ctx.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(0,0,0,0.55)')
  g.addColorStop(0.6, 'rgba(0,0,0,0.28)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  aoBlobTex = new THREE.CanvasTexture(c)
  return aoBlobTex
}

export { disposeSurfaces as disposeTextures } from '../systems/materials/pipeline'
