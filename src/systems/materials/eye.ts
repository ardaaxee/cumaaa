import * as THREE from 'three'
import { surface, type Paint, type PbrSurface } from './pipeline'

// Eyes.
//
// An iris is not a coloured disc. It is a radial weave of fibres running from
// the pupil out to a dark ring at the edge, with a raised collarette about a
// third of the way out, irregular crypts either side of it, and a pupil whose
// edge is soft. Nearly all of what makes an eye read as an eye at conversational
// distance is that structure and the dark limbal ring around it — not the hue.
//
// These are painted in the POLAR space the iris dome already has: the dome is a
// spherical cap, so its U runs round the iris and its V runs from the pupil at
// the centre out to the limbus. That means a plain rectangular canvas maps to
// the iris with no distortion to fight — vertical lines in the texture are
// radial fibres in the eye.

const PUPIL_EDGE = 0.36 // fraction of the way out where the pupil ends
const COLLARETTE = 0.5
const LIMBUS = 0.9

function lerpHex(a: string, b: string, t: number): string {
  return `#${new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString()}`
}

function paintIris(p: Paint, iris: string): void {
  const { ctx, size, rnd } = p
  const deep = lerpHex(iris, '#0a0704', 0.45)
  const bright = lerpHex(iris, '#d8b98a', 0.42)

  // Base gradient: darker at the pupil, opening out toward the rim.
  const g = ctx.createLinearGradient(0, 0, 0, size)
  g.addColorStop(0, deep)
  g.addColorStop(COLLARETTE, bright)
  g.addColorStop(0.78, iris)
  g.addColorStop(1, deep)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)

  // Fibres: hundreds of fine radial strands of varying length and brightness.
  // In this space they are vertical lines, and they wrap at the edges for free.
  const strands = Math.round(520 * (size / 1024))
  for (let i = 0; i < strands; i++) {
    const x = rnd() * size
    const from = (PUPIL_EDGE + rnd() * 0.12) * size
    const to = (0.66 + rnd() * 0.28) * size
    const light = rnd() > 0.45
    ctx.strokeStyle = light
      ? `rgba(255,240,215,${0.05 + rnd() * 0.16})`
      : `rgba(18,12,8,${0.06 + rnd() * 0.2})`
    ctx.lineWidth = (0.7 + rnd() * 1.8) * (size / 1024)
    ctx.beginPath()
    ctx.moveTo(x, from)
    // A slight lean, so the weave is not a comb.
    ctx.quadraticCurveTo(x + (rnd() - 0.5) * 12, (from + to) / 2, x + (rnd() - 0.5) * 20, to)
    ctx.stroke()
  }

  // The collarette: the raised ridge where the pupillary zone hands over to the
  // ciliary zone. Irregular, never a circle.
  ctx.lineWidth = 3 * (size / 1024)
  ctx.beginPath()
  for (let x = 0; x <= size; x += size / 64) {
    const y = (COLLARETTE + Math.sin(x * 0.07) * 0.012 + (rnd() - 0.5) * 0.016) * size
    if (x === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.strokeStyle = 'rgba(255,236,205,0.22)'
  ctx.stroke()

  // Crypts: the dark pits either side of the collarette.
  for (let i = 0; i < Math.round(34 * (size / 1024)); i++) {
    const x = rnd() * size
    const y = (0.4 + rnd() * 0.3) * size
    ctx.fillStyle = `rgba(12,8,5,${0.14 + rnd() * 0.24})`
    ctx.beginPath()
    ctx.ellipse(x, y, (6 + rnd() * 16) * (size / 1024), (10 + rnd() * 30) * (size / 1024), 0, 0, Math.PI * 2)
    ctx.fill()
  }

  // The pupil. Solid, with a soft edge — a hard one reads as a printed dot.
  const pg = ctx.createLinearGradient(0, 0, 0, PUPIL_EDGE * size * 1.14)
  pg.addColorStop(0, '#000000')
  pg.addColorStop(0.86, '#000000')
  pg.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = pg
  ctx.fillRect(0, 0, size, PUPIL_EDGE * size * 1.14)

  // The limbal ring: a dark band right at the edge of the iris. This is the
  // single most valuable feature at a distance.
  const lg = ctx.createLinearGradient(0, LIMBUS * size, 0, size)
  lg.addColorStop(0, 'rgba(26,20,18,0)')
  lg.addColorStop(0.55, 'rgba(26,20,18,0.6)')
  lg.addColorStop(1, 'rgba(14,11,12,0.92)')
  ctx.fillStyle = lg
  ctx.fillRect(0, LIMBUS * size, size, size * (1 - LIMBUS))
}

export function irisSurface(iris: string): PbrSurface {
  return surface({
    key: `iris:${iris}`,
    cls: 'standard',
    repeat: 1,
    normalize: null,
    normalStrength: 1.4,
    albedo: (p) => paintIris(p, iris),
    height: (p) => {
      const { ctx, size, rnd } = p
      ctx.fillStyle = 'rgb(128,128,128)'
      ctx.fillRect(0, 0, size, size)
      // The collarette stands proud; the crypts are pits. That relief is what
      // gives an iris depth when the light moves across it.
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'
      ctx.lineWidth = 5 * (size / 1024)
      ctx.beginPath()
      for (let x = 0; x <= size; x += size / 64) {
        const y = (COLLARETTE + Math.sin(x * 0.07) * 0.012) * size
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      for (let i = 0; i < Math.round(300 * (size / 1024)); i++) {
        const x = rnd() * size
        const y = (PUPIL_EDGE + rnd() * 0.55) * size
        ctx.strokeStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)'
        ctx.lineWidth = (0.8 + rnd() * 2) * (size / 1024)
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + (rnd() - 0.5) * 8, y + (10 + rnd() * 60) * (size / 1024))
        ctx.stroke()
      }
    },
    roughness: (p) => {
      // The iris sits behind the cornea, so it is glassy rather than matte.
      const g = p.ctx.createLinearGradient(0, 0, 0, p.size)
      g.addColorStop(0, 'rgb(40,40,40)')
      g.addColorStop(1, 'rgb(90,90,90)')
      p.ctx.fillStyle = g
      p.ctx.fillRect(0, 0, p.size, p.size)
    },
  })
}

// ---- Sclera ----------------------------------------------------------------

/**
 * The white of the eye, in the eyeball sphere's own UVs: U runs round the ball
 * with the front of the eye at 0.25, V from the top pole down.
 *
 * A sclera is never white. It is warm and slightly grey, shaded toward both
 * corners where the lids and the socket occlude it, and carries fine vessels
 * that run in from the corners and stop short of the iris.
 */
export function scleraSurface(): PbrSurface {
  return surface({
    key: 'sclera',
    cls: 'detail',
    repeat: 1,
    normalize: null,
    normalStrength: 0.5,
    albedo: (p) => {
      const { ctx, size, rnd } = p
      ctx.fillStyle = '#f2ece4'
      ctx.fillRect(0, 0, size, size)
      const front = 0.25 * size
      // Corner shading, either side of the visible front.
      for (const dir of [-1, 1]) {
        const x = front + dir * 0.11 * size
        const g = ctx.createRadialGradient(x, size * 0.5, 0, x, size * 0.5, size * 0.16)
        g.addColorStop(0, 'rgba(150,132,120,0.42)')
        g.addColorStop(1, 'rgba(150,132,120,0)')
        ctx.fillStyle = g
        ctx.fillRect(x - size * 0.16, 0, size * 0.32, size)
      }
      // A warm cast low on the ball, where it always sits in shadow.
      const low = ctx.createLinearGradient(0, size * 0.5, 0, size)
      low.addColorStop(0, 'rgba(214,190,150,0)')
      low.addColorStop(1, 'rgba(214,190,150,0.34)')
      ctx.fillStyle = low
      ctx.fillRect(0, size * 0.5, size, size * 0.5)
      // Vessels: in from the corners, branching, thinning, stopping short of
      // where the iris will sit.
      for (let i = 0; i < Math.round(90 * (size / 1024)); i++) {
        const dir = rnd() > 0.5 ? 1 : -1
        let x = front + dir * (0.1 + rnd() * 0.09) * size
        let y = size * (0.3 + rnd() * 0.4)
        ctx.strokeStyle = `rgba(${168 + rnd() * 40},${40 + rnd() * 30},${38 + rnd() * 24},${0.1 + rnd() * 0.24})`
        ctx.lineWidth = (0.6 + rnd() * 1.6) * (size / 1024)
        ctx.beginPath()
        ctx.moveTo(x, y)
        const steps = 3 + Math.floor(rnd() * 4)
        for (let k = 0; k < steps; k++) {
          x -= dir * (0.012 + rnd() * 0.016) * size
          y += (rnd() - 0.5) * 0.05 * size
          ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
    },
    roughness: (p) => {
      p.ctx.fillStyle = 'rgb(60,60,60)'
      p.ctx.fillRect(0, 0, p.size, p.size)
    },
  })
}
