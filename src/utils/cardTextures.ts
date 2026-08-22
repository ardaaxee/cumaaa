import * as THREE from 'three'
import type { Project } from '../types'

// Canvas textures for the physical memory objects. Deliberately matte and
// print-like — cream card stock, ink, engraved metal — to match the room's
// photographic style. No glow, no neon.

function make(w: number, h: number): { c: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return { c, ctx: c.getContext('2d')! }
}

function tex(c: HTMLCanvasElement): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function paperGrain(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 10
    d[i] += n
    d[i + 1] += n
    d[i + 2] += n
  }
  ctx.putImageData(img, 0, 0)
}

const STATUS_LABEL: Record<string, string> = {
  planning: 'PLANNING',
  active: 'IN PROGRESS',
  paused: 'PAUSED',
  done: 'COMPLETE',
}

// A printed project index card (cream stock, ink, a subtle progress bar).
export function projectCardTexture(p: Project): THREE.CanvasTexture {
  const { c, ctx } = make(320, 200)
  ctx.fillStyle = '#e9e1cf'
  ctx.fillRect(0, 0, 320, 200)
  paperGrain(ctx, 320, 200)
  // top rule
  ctx.strokeStyle = 'rgba(60,50,36,0.5)'
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(20, 46); ctx.lineTo(300, 46); ctx.stroke()
  ctx.fillStyle = '#2a2318'
  ctx.font = 'bold 26px Inter, sans-serif'
  ctx.fillText(clip(p.name, 18), 20, 36)
  ctx.fillStyle = '#5a4a34'
  ctx.font = '15px "JetBrains Mono", monospace'
  ctx.fillText(STATUS_LABEL[p.status] ?? p.status, 20, 74)
  ctx.fillStyle = 'rgba(70,58,40,0.8)'
  ctx.font = '13px Inter, sans-serif'
  ctx.fillText(clip(p.technologies.join(' · ') || '—', 34), 20, 100)
  // printed progress bar
  ctx.fillStyle = 'rgba(60,50,36,0.18)'
  roundRect(ctx, 20, 128, 280, 14, 7); ctx.fill()
  ctx.fillStyle = '#7a5a34'
  roundRect(ctx, 20, 128, (280 * p.progress) / 100, 14, 7); ctx.fill()
  ctx.fillStyle = '#2a2318'
  ctx.font = 'bold 16px "JetBrains Mono", monospace'
  ctx.fillText(`${p.progress}%`, 20, 170)
  ctx.fillStyle = 'rgba(70,58,40,0.7)'
  ctx.font = '12px "JetBrains Mono", monospace'
  ctx.textAlign = 'right'
  ctx.fillText(new Date(p.createdAt).toLocaleDateString(), 300, 170)
  ctx.textAlign = 'left'
  return tex(c)
}

// A small pinned-paper note list (e.g. the activity board).
export function paperListTexture(title: string, lines: string[]): THREE.CanvasTexture {
  const { c, ctx } = make(340, 300)
  ctx.fillStyle = '#efe8d7'
  ctx.fillRect(0, 0, 340, 300)
  paperGrain(ctx, 340, 300)
  ctx.fillStyle = '#3a3020'
  ctx.font = 'bold 22px "JetBrains Mono", monospace'
  ctx.fillText(title, 22, 40)
  ctx.strokeStyle = 'rgba(60,50,36,0.4)'
  ctx.beginPath(); ctx.moveTo(22, 52); ctx.lineTo(318, 52); ctx.stroke()
  ctx.font = '16px Inter, sans-serif'
  lines.slice(0, 8).forEach((ln, i) => {
    ctx.fillStyle = 'rgba(50,40,28,0.9)'
    ctx.fillText('· ' + clip(ln, 34), 22, 86 + i * 28)
  })
  if (lines.length === 0) {
    ctx.fillStyle = 'rgba(50,40,28,0.5)'
    ctx.fillText('nothing yet', 22, 90)
  }
  return tex(c)
}

// Engraved brushed-metal name/desk plate.
export function platePlateTexture(text: string): THREE.CanvasTexture {
  const { c, ctx } = make(256, 72)
  // brushed metal
  ctx.fillStyle = '#6d7176'
  ctx.fillRect(0, 0, 256, 72)
  for (let i = 0; i < 256; i += 2) {
    ctx.strokeStyle = i % 4 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 72); ctx.stroke()
  }
  // engraved text (dark, with a light top edge)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = 'bold 34px "JetBrains Mono", monospace'
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.fillText(text, 128, 38)
  ctx.fillStyle = '#222426'
  ctx.fillText(text, 128, 36)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  return tex(c)
}

function clip(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}
