import * as THREE from 'three'
import { surface, type Paint, type PbrSurface } from './pipeline'

// The house's material library.
//
// Everything in here is a real PBR set — albedo, a normal map derived from a
// painted height field, and a roughness map — at whatever resolution the tier
// allows. What makes a material read as itself is almost never its colour: it
// is how ROUGH it is and how that roughness varies. Brushed steel is
// unidirectional scratches; a quartz worktop is a hard polish with mineral
// flecks under it; wet asphalt shines in the ruts and stays matte on the crown.
//
// Painters follow the pipeline's contract: resolution-independent, drawing in a
// 512-unit design space scaled by `s`, taking every random decision from the
// seeded generator so an upgrade is the same material at more detail.

const grey = (v: number) => `rgb(${v},${v},${v})`

function flat(p: Paint, hex: string): void {
  p.ctx.fillStyle = hex
  p.ctx.fillRect(0, 0, p.size, p.size)
}

// ---- Wood ------------------------------------------------------------------

/** Cabinet-grade timber: cathedral grain, rays, the occasional knot, open pores. */
export function wood(hex: string, key: string, satin = 0.55): PbrSurface {
  return surface({
    key: `wood:${key}`,
    cls: 'standard',
    repeat: 2,
    grain: 9,
    normalStrength: 1.4,
    albedo: (p) => {
      const { ctx, size, s, rnd } = p
      flat(p, hex)
      for (let i = 0; i < 150; i++) {
        const y = rnd() * size
        ctx.strokeStyle = rnd() > 0.45
          ? `rgba(28,18,10,${0.04 + rnd() * 0.1})`
          : `rgba(255,236,206,${0.03 + rnd() * 0.06})`
        ctx.lineWidth = (0.5 + rnd() * 2.2) * s
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.bezierCurveTo(size * 0.3, y + (rnd() - 0.5) * 26 * s, size * 0.7, y + (rnd() - 0.5) * 26 * s, size, y + (rnd() - 0.5) * 12 * s)
        ctx.stroke()
      }
      if (rnd() > 0.55) {
        const kx = rnd() * size
        const ky = rnd() * size
        const rr = (7 + rnd() * 7) * s
        const g = ctx.createRadialGradient(kx, ky, s, kx, ky, rr)
        g.addColorStop(0, 'rgba(34,20,10,0.6)')
        g.addColorStop(1, 'rgba(34,20,10,0)')
        ctx.fillStyle = g
        ctx.fillRect(kx - rr * 2, ky - rr * 2, rr * 4, rr * 4)
      }
      // FINE: the open pores of an oak or an ash, one pixel wide.
      if (size >= 1024) {
        ctx.lineWidth = 1
        for (let i = 0; i < Math.round(1400 * s * s); i++) {
          const x = rnd() * size
          const y = rnd() * size
          ctx.strokeStyle = `rgba(24,14,8,${0.05 + rnd() * 0.1})`
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x + (3 + rnd() * 16) * s, y + (rnd() - 0.5) * 2 * s)
          ctx.stroke()
        }
      }
    },
    height: (p) => {
      const { ctx, size, s, rnd } = p
      flat(p, grey(128))
      for (let i = 0; i < 220; i++) {
        const y = rnd() * size
        ctx.strokeStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'
        ctx.lineWidth = (0.6 + rnd() * 1.6) * s
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.bezierCurveTo(size * 0.3, y + (rnd() - 0.5) * 20 * s, size * 0.7, y + (rnd() - 0.5) * 20 * s, size, y)
        ctx.stroke()
      }
    },
    roughness: (p) => {
      // Satin lacquer, unevenly applied. Perfectly even varnish reads as plastic.
      const { ctx, size, s, rnd } = p
      flat(p, grey(Math.round(255 * satin)))
      for (let i = 0; i < Math.round(120 * s * s); i++) {
        const r = (20 + rnd() * 70) * s
        const x = rnd() * size
        const y = rnd() * size
        const g = ctx.createRadialGradient(x, y, 0, x, y, r)
        const v = rnd() > 0.5 ? '255,255,255' : '0,0,0'
        g.addColorStop(0, `rgba(${v},0.09)`)
        g.addColorStop(1, `rgba(${v},0)`)
        ctx.fillStyle = g
        ctx.fillRect(x - r, y - r, r * 2, r * 2)
      }
    },
  })
}

// ---- Painted board ---------------------------------------------------------

export function painted(hex: string, key: string, sheen = 0.62): PbrSurface {
  return surface({
    key: `painted:${key}`,
    cls: 'detail',
    repeat: 1,
    grain: 4,
    normalStrength: 0.35,
    albedo: (p) => {
      const { ctx, size, s, rnd } = p
      flat(p, hex)
      // Spray finish: slight orange peel, and a little dust.
      for (let i = 0; i < Math.round(900 * s * s); i++) {
        ctx.fillStyle = `rgba(${rnd() > 0.5 ? '255,255,255' : '0,0,0'},${0.012 + rnd() * 0.02})`
        ctx.beginPath()
        ctx.arc(rnd() * size, rnd() * size, (1 + rnd() * 3) * s, 0, Math.PI * 2)
        ctx.fill()
      }
    },
    height: (p) => {
      const { ctx, size, s, rnd } = p
      flat(p, grey(128))
      for (let i = 0; i < Math.round(700 * s * s); i++) {
        ctx.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
        ctx.beginPath()
        ctx.arc(rnd() * size, rnd() * size, (1.5 + rnd() * 4) * s, 0, Math.PI * 2)
        ctx.fill()
      }
    },
    roughness: (p) => flat(p, grey(Math.round(255 * sheen))),
  })
}

// ---- Metal -----------------------------------------------------------------

/** Brushed stainless: fine unidirectional scratches, and that is the whole look. */
export function brushedSteel(): PbrSurface {
  return surface({
    key: 'brushedSteel',
    cls: 'standard',
    repeat: 1,
    normalize: null,
    grain: 5,
    normalStrength: 0.9,
    albedo: (p) => {
      const { ctx, size, s, rnd } = p
      flat(p, '#b9bcc0')
      for (let i = 0; i < Math.round(2200 * s); i++) {
        const y = rnd() * size
        ctx.strokeStyle = rnd() > 0.5 ? `rgba(255,255,255,${rnd() * 0.1})` : `rgba(40,44,50,${rnd() * 0.12})`
        ctx.lineWidth = Math.max(0.5, rnd() * 1.6 * s)
        ctx.beginPath()
        ctx.moveTo(rnd() * size - size * 0.3, y)
        ctx.lineTo(rnd() * size + size * 0.3, y + (rnd() - 0.5) * 1.5 * s)
        ctx.stroke()
      }
    },
    height: (p) => {
      const { ctx, size, s, rnd } = p
      flat(p, grey(128))
      for (let i = 0; i < Math.round(2600 * s); i++) {
        const y = rnd() * size
        ctx.strokeStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.16)'
        ctx.lineWidth = Math.max(0.5, rnd() * 1.4 * s)
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(size, y + (rnd() - 0.5) * 2 * s)
        ctx.stroke()
      }
    },
    roughness: (p) => {
      const { ctx, size, s, rnd } = p
      flat(p, grey(74))
      for (let i = 0; i < Math.round(900 * s); i++) {
        const y = rnd() * size
        ctx.strokeStyle = `rgba(255,255,255,${0.05 + rnd() * 0.12})`
        ctx.lineWidth = Math.max(0.5, rnd() * 2 * s)
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(size, y)
        ctx.stroke()
      }
    },
  })
}

// ---- Stone -----------------------------------------------------------------

/** Engineered quartz: a hard polish with mineral flecks and faint veining. */
export function quartz(hex = '#d9d6cf'): PbrSurface {
  return surface({
    key: `quartz:${hex}`,
    cls: 'standard',
    repeat: 2,
    grain: 5,
    normalStrength: 0.4,
    albedo: (p) => {
      const { ctx, size, s, rnd } = p
      flat(p, hex)
      for (let i = 0; i < 7; i++) {
        ctx.strokeStyle = `rgba(120,118,112,${0.05 + rnd() * 0.07})`
        ctx.lineWidth = (1 + rnd() * 5) * s
        ctx.beginPath()
        let x = rnd() * size
        let y = -10
        ctx.moveTo(x, y)
        while (y < size) {
          x += (rnd() - 0.5) * 60 * s
          y += (20 + rnd() * 50) * s
          ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
      for (let i = 0; i < Math.round(5200 * s * s); i++) {
        ctx.fillStyle = rnd() > 0.6 ? `rgba(255,255,255,${0.1 + rnd() * 0.25})` : `rgba(70,68,64,${0.06 + rnd() * 0.18})`
        ctx.beginPath()
        ctx.arc(rnd() * size, rnd() * size, (0.6 + rnd() * 2.2) * s, 0, Math.PI * 2)
        ctx.fill()
      }
    },
    height: (p) => {
      const { ctx, size, s, rnd } = p
      flat(p, grey(128))
      for (let i = 0; i < Math.round(2600 * s * s); i++) {
        ctx.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
        ctx.beginPath()
        ctx.arc(rnd() * size, rnd() * size, (0.8 + rnd() * 2) * s, 0, Math.PI * 2)
        ctx.fill()
      }
    },
    roughness: (p) => flat(p, grey(40)),
  })
}

// ---- Concrete and asphalt --------------------------------------------------

export function concrete(hex = '#8d8b87'): PbrSurface {
  return surface({
    key: `concrete:${hex}`,
    cls: 'standard',
    repeat: 4,
    grain: 12,
    normalStrength: 1.1,
    albedo: (p) => {
      const { ctx, size, s, rnd } = p
      flat(p, hex)
      for (let i = 0; i < 42; i++) {
        const x = rnd() * size
        const y = rnd() * size
        const r = (30 + rnd() * 110) * s
        const g = ctx.createRadialGradient(x, y, s, x, y, r)
        const v = rnd() > 0.5 ? '255,255,250' : '40,38,36'
        g.addColorStop(0, `rgba(${v},${0.02 + rnd() * 0.05})`)
        g.addColorStop(1, `rgba(${v},0)`)
        ctx.fillStyle = g
        ctx.fillRect(x - r, y - r, r * 2, r * 2)
      }
      for (let i = 0; i < Math.round(700 * s * s); i++) {
        ctx.fillStyle = `rgba(50,48,46,${0.1 + rnd() * 0.28})`
        ctx.beginPath()
        ctx.arc(rnd() * size, rnd() * size, (0.7 + rnd() * 2.4) * s, 0, Math.PI * 2)
        ctx.fill()
      }
    },
    height: (p) => {
      const { ctx, size, s, rnd } = p
      flat(p, grey(140))
      for (let i = 0; i < Math.round(900 * s * s); i++) {
        ctx.fillStyle = `rgba(0,0,0,${0.15 + rnd() * 0.3})`
        ctx.beginPath()
        ctx.arc(rnd() * size, rnd() * size, (0.8 + rnd() * 2.6) * s, 0, Math.PI * 2)
        ctx.fill()
      }
    },
    roughness: (p) => flat(p, grey(232)),
  })
}

/** Road surface. `wet` darkens and polishes it, the way rain does. */
export function asphalt(wet = 0): PbrSurface {
  return surface({
    key: `asphalt:${wet.toFixed(2)}`,
    cls: 'standard',
    repeat: 8,
    grain: 16,
    normalStrength: 1.6,
    albedo: (p) => {
      const { ctx, size, s, rnd } = p
      flat(p, wet > 0.5 ? '#232427' : '#3a3b3e')
      for (let i = 0; i < Math.round(4200 * s * s); i++) {
        ctx.fillStyle = rnd() > 0.7 ? `rgba(150,148,144,${0.1 + rnd() * 0.3})` : `rgba(20,20,22,${0.1 + rnd() * 0.3})`
        ctx.beginPath()
        ctx.arc(rnd() * size, rnd() * size, (0.8 + rnd() * 3) * s, 0, Math.PI * 2)
        ctx.fill()
      }
    },
    height: (p) => {
      const { ctx, size, s, rnd } = p
      flat(p, grey(150))
      for (let i = 0; i < Math.round(3200 * s * s); i++) {
        ctx.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)'
        ctx.beginPath()
        ctx.arc(rnd() * size, rnd() * size, (1 + rnd() * 3.4) * s, 0, Math.PI * 2)
        ctx.fill()
      }
    },
    roughness: (p) => {
      // Wet asphalt is not uniformly wet: the ruts hold water and shine, the
      // crown between them stays matte. That contrast IS the look of rain.
      const { ctx, size, s, rnd } = p
      flat(p, grey(Math.round(238 - wet * 150)))
      if (wet > 0.05) {
        for (let i = 0; i < Math.round(90 * s * s); i++) {
          const x = rnd() * size
          const y = rnd() * size
          const r = (25 + rnd() * 90) * s
          const g = ctx.createRadialGradient(x, y, 0, x, y, r)
          g.addColorStop(0, `rgba(0,0,0,${0.3 * wet})`)
          g.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = g
          ctx.fillRect(x - r, y - r, r * 2, r * 2)
        }
      }
    },
  })
}

// ---- Brick -----------------------------------------------------------------

export function brick(hex = '#8d5c4a', mortar = '#b9b2a6'): PbrSurface {
  return surface({
    key: `brick:${hex}`,
    cls: 'standard',
    repeat: 6,
    grain: 9,
    normalStrength: 2.4,
    albedo: (p) => {
      const { ctx, size, s, rnd } = p
      flat(p, mortar)
      const rows = 8
      const h = size / rows
      const w = h * 2.4
      for (let r = 0; r < rows; r++) {
        const offset = (r % 2) * w * 0.5
        for (let x = -w; x < size + w; x += w) {
          ctx.fillStyle = shift(hex, 22 - rnd() * 44)
          ctx.fillRect(x + offset + 1.5 * s, r * h + 1.5 * s, w - 3 * s, h - 3 * s)
          if (size >= 1024) {
            for (let k = 0; k < 40; k++) {
              ctx.fillStyle = `rgba(${rnd() > 0.5 ? '255,240,230' : '40,26,20'},${0.03 + rnd() * 0.07})`
              ctx.beginPath()
              ctx.arc(x + offset + rnd() * w, r * h + rnd() * h, (0.6 + rnd() * 2) * s, 0, Math.PI * 2)
              ctx.fill()
            }
          }
        }
      }
    },
    height: (p) => {
      const { ctx, size, s } = p
      flat(p, '#000')
      const rows = 8
      const h = size / rows
      const w = h * 2.4
      ctx.fillStyle = grey(190)
      for (let r = 0; r < rows; r++) {
        const offset = (r % 2) * w * 0.5
        for (let x = -w; x < size + w; x += w) ctx.fillRect(x + offset + 1.5 * s, r * h + 1.5 * s, w - 3 * s, h - 3 * s)
      }
    },
    roughness: (p) => flat(p, grey(238)),
  })
}

function shift(hex: string, delta: number): string {
  const n = parseInt(hex.slice(1), 16)
  const c = (sh: number) => Math.max(0, Math.min(255, ((n >> sh) & 255) + delta))
  return `rgb(${c(16)},${c(8)},${c(0)})`
}

// ---- Ready-made material prop bags -----------------------------------------
//
// Call sites want a MATERIAL, not a texture set. These carry the metalness and
// roughness that belong to the substance rather than being guessed per object.

export interface MatProps {
  color: string
  map?: THREE.Texture
  normalMap?: THREE.Texture
  roughnessMap?: THREE.Texture
  roughness: number
  metalness: number
}

const bag = (s: PbrSurface, color: string, metalness: number): MatProps => ({
  color,
  map: s.map,
  normalMap: s.normalMap,
  roughnessMap: s.roughnessMap,
  roughness: 1,
  metalness,
})

export const M = {
  wood: (hex: string, key: string, satin = 0.55) => bag(wood(hex, key, satin), hex, 0.02),
  painted: (hex: string, key: string, sheen = 0.62) => bag(painted(hex, key, sheen), hex, 0.02),
  steel: () => bag(brushedSteel(), '#c3c6ca', 0.92),
  quartz: (hex = '#d9d6cf') => bag(quartz(hex), hex, 0.04),
  concrete: (hex = '#8d8b87') => bag(concrete(hex), hex, 0.01),
  asphalt: (wet = 0) => bag(asphalt(wet), wet > 0.5 ? '#26272a' : '#3d3e41', 0.03),
  brick: (hex = '#8d5c4a') => bag(brick(hex), hex, 0.01),
}
