import { surface, type Paint, type PbrSurface } from './pipeline'

// Hair cards.
//
// Hair was tubes: one solid, opaque, rounded ribbon per lock. A tube has a
// silhouette, and a silhouette is exactly what hair does not have — the edge of
// a real clump is hundreds of individual strands fading out, which is why tube
// hair reads as a moulded plastic wig no matter how the locks are routed.
//
// The way this is solved in every real-time renderer is a CARD: a thin strip of
// geometry carrying a texture of many fine strands with an alpha channel. The
// strip has no visible edge because its edge is transparent. That is what this
// paints — an atlas of one clump, roots opaque at the top, strands separating,
// bending and ending at different heights toward the tip.
//
// It is alpha-TESTED rather than alpha-blended: blended hair needs back-to-front
// sorting that no amount of care makes reliable when a head turns, and the
// tested version costs nothing and never sorts wrong.

function paintCard(p: Paint, base: string, tips: string, wave: number, alphaOnly: boolean): void {
  const { ctx, size, rnd } = p
  ctx.clearRect(0, 0, size, size)

  // Dense enough that the card is mostly covered near the root. Sparse cards
  // plus an alpha TEST plus mipmapping is how hair disappears at a distance:
  // the averaged alpha falls under the threshold and every fragment is thrown
  // away. Coverage is the fix, not a lower threshold alone.
  const strands = Math.round(320 * (size / 1024))
  for (let i = 0; i < strands; i++) {
    // Strands are dense in the middle of the card and thin out at both edges,
    // so two cards laid side by side blend instead of showing a join.
    const edge = rnd()
    const x = (0.5 + (edge - 0.5) * Math.pow(rnd(), 0.55)) * size
    // Every strand ends somewhere different — a clump that ends on one line is
    // a paintbrush.
    const end = (0.55 + Math.pow(rnd(), 0.6) * 0.48) * size
    const drift = (rnd() - 0.5) * size * (0.05 + wave * 0.12)
    const shade = rnd()
    ctx.strokeStyle = alphaOnly
      ? `rgba(255,255,255,${0.55 + rnd() * 0.45})`
      : mixHex(base, tips, Math.min(1, shade * 1.3)) + alphaHex(0.6 + rnd() * 0.4)
    ctx.lineWidth = (1.8 + rnd() * 4.2) * (size / 1024)
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.bezierCurveTo(
      x + drift * 0.3, end * 0.35,
      x + drift * 0.9, end * 0.7,
      x + drift, end,
    )
    ctx.stroke()
  }

  // The roots: solid for the first few percent, so a card's top edge never
  // shows as a cut line where it meets the scalp.
  const g = ctx.createLinearGradient(0, 0, 0, size * 0.22)
  g.addColorStop(0, alphaOnly ? 'rgba(255,255,255,1)' : base + 'ff')
  g.addColorStop(1, alphaOnly ? 'rgba(255,255,255,0)' : base + '00')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size * 0.22)

  // A few strands that leave the clump entirely.
  const fly = Math.round(9 * (size / 1024)) + 4
  for (let i = 0; i < fly; i++) {
    const x = rnd() * size
    ctx.strokeStyle = alphaOnly ? 'rgba(255,255,255,0.75)' : mixHex(base, tips, 0.8) + alphaHex(0.75)
    ctx.lineWidth = Math.max(0.8, size / 1400)
    ctx.beginPath()
    ctx.moveTo(x, rnd() * size * 0.3)
    ctx.bezierCurveTo(
      x + (rnd() - 0.5) * size * 0.3, size * 0.3,
      x + (rnd() - 0.5) * size * 0.5, size * 0.6,
      x + (rnd() - 0.5) * size * 0.6, (0.5 + rnd() * 0.5) * size,
    )
    ctx.stroke()
  }
}

function mixHex(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const ch = (sh: number) => {
    const va = (pa >> sh) & 255
    const vb = (pb >> sh) & 255
    return Math.round(va + (vb - va) * t)
  }
  const hex = (v: number) => v.toString(16).padStart(2, '0')
  return `#${hex(ch(16))}${hex(ch(8))}${hex(ch(0))}`
}

function alphaHex(a: number): string {
  return Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0')
}

export function hairCardSurface(base: string, tips: string, wave: number): PbrSurface {
  const key = `hairCard:${base}:${tips}:${wave.toFixed(2)}`
  return surface({
    key,
    cls: 'standard',
    repeat: 1,
    normalize: null,
    normalStrength: 1.1,
    albedo: (p) => paintCard(p, base, tips, wave, false),
    // The height field is the same strands in white on black, so the normal map
    // gives each one its own round highlight — which is where hair's sheen
    // comes from.
    height: (p) => {
      p.ctx.fillStyle = '#000'
      p.ctx.fillRect(0, 0, p.size, p.size)
      paintCard(p, '#ffffff', '#ffffff', wave, true)
    },
    roughness: (p) => {
      // Hair is glossy along the strand and matte across it; a flat value would
      // lose the band of sheen that runs round a head.
      const g = p.ctx.createLinearGradient(0, 0, 0, p.size)
      g.addColorStop(0, 'rgb(150,150,150)')
      g.addColorStop(0.35, 'rgb(96,96,96)')
      g.addColorStop(1, 'rgb(178,178,178)')
      p.ctx.fillStyle = g
      p.ctx.fillRect(0, 0, p.size, p.size)
    },
  })
}
