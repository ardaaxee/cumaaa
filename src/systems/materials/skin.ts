import * as THREE from 'three'
import type { AvatarProfile } from '../../config/appearance'
import { RIG } from '../../components/characters/looks'
import { surface, type Paint, type PbrSurface } from './pipeline'

// Skin, as a real PBR material set.
//
// The previous skin was one flat colour plus per-vertex tinting plus a small
// emissive term to stop faces going black under overhead lights. Vertex colours
// can only vary as fast as the mesh does — a few hundred vertices across a
// face — so they give broad regions and nothing else, and emissive skin is a
// lie that flattens every form it is supposed to rescue. Both are gone.
//
// In their place: albedo, normal and roughness maps painted in the head's own
// UV space, at whatever resolution the tier allows. That buys the three things
// vertex colours cannot — pores, fine wrinkles, and a roughness that changes
// across the face (an oily T-zone against matte cheeks is most of what reads as
// skin rather than as painted clay).
//
// ---- The UV space ----------------------------------------------------------
// The head is a displaced sphere, so it carries spherical UVs. This module maps
// anatomical DIRECTIONS to those UVs with the same convention three.js uses to
// build the sphere, which means the paint lands on the right part of the face
// for any profile — a longer face or a wider jaw moves the geometry and the
// landmarks together, instead of sliding the texture off the features.

/** Direction (in the head's local frame) → the sphere's UV. */
export function dirToUv(x: number, y: number, z: number): [number, number] {
  const len = Math.hypot(x, y, z) || 1
  let phi = Math.atan2(z / len, -x / len)
  if (phi < 0) phi += Math.PI * 2
  const theta = Math.acos(Math.max(-1, Math.min(1, y / len)))
  return [phi / (Math.PI * 2), 1 - theta / Math.PI]
}

/**
 * Re-project a feature's UVs into the HEAD's texture space.
 *
 * The nose, the lips, the ears and the eyelids are separate meshes with their
 * own UV layouts. Left alone, each would sample the whole face squeezed onto
 * itself — a nose wearing a picture of a face. Projecting them from the head's
 * centre instead makes them sample the part of the skin texture they actually
 * occupy, so the tone, the pores and the roughness carry across the join with
 * nothing to give it away.
 *
 * `offset` is where the mesh sits in the head's frame.
 */
export function projectHeadUv(geo: THREE.BufferGeometry, offset: THREE.Vector3): THREE.BufferGeometry {
  const pos = geo.attributes.position as THREE.BufferAttribute
  const out = new Float32Array(pos.count * 2)
  // A reference U from the centroid: features that straddle the texture seam
  // (the ears do) must all wrap to the SAME side of it or the triangles
  // between them stretch right across the map.
  let cx = 0
  let cy = 0
  let cz = 0
  for (let i = 0; i < pos.count; i++) {
    cx += pos.getX(i)
    cy += pos.getY(i)
    cz += pos.getZ(i)
  }
  const [refU] = dirToUv(cx / pos.count + offset.x, cy / pos.count + offset.y, cz / pos.count + offset.z)
  for (let i = 0; i < pos.count; i++) {
    let [u, v] = dirToUv(pos.getX(i) + offset.x, pos.getY(i) + offset.y, pos.getZ(i) + offset.z)
    u += Math.round(refU - u)
    out[i * 2] = u
    out[i * 2 + 1] = v
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(out, 2))
  return geo
}

interface Uv { u: number; v: number }

const uv = (x: number, y: number, z: number): Uv => {
  const [u, v] = dirToUv(x, y, z)
  return { u, v }
}

/**
 * The landmarks, as directions in the same normalised frame `geometry/head.ts`
 * uses for its displacement fields. Keeping the two lists in the same frame is
 * what keeps the paint on the anatomy.
 */
function landmarks(p: AvatarProfile) {
  // The SAME frame geometry/head.ts places its displacement fields in, so a
  // landmark in one file means the same point on the face in the other. Getting
  // this even slightly wrong slides the paint off the features.
  const B: [number, number, number] = [0.7, 0.96 * p.face.length, 0.88]
  const at = (x: number, y: number, z: number) => uv(x * B[0], y * B[1], z * B[2])
  // The mouth's width is a profile value in METRES, so convert it into the
  // field frame rather than guessing a number that then disagrees with the
  // geometry — which is what made the painted lips a third too narrow.
  const cornerX = p.lips.width / (RIG.headRadius * B[0])
  return {
    forehead: at(0, 0.62, 0.75),
    templeL: at(-0.86, 0.42, 0.34),
    templeR: at(0.86, 0.42, 0.34),
    glabella: at(0, 0.28, 0.96),
    eyeL: at(-0.4, 0.06, 0.88),
    eyeR: at(0.4, 0.06, 0.88),
    cheekL: at(-0.62, -0.16, 0.72),
    cheekR: at(0.62, -0.16, 0.72),
    noseTip: at(0, -0.26, 1.05),
    noseWingL: at(-0.19, -0.36, 0.95),
    noseWingR: at(0.19, -0.36, 0.95),
    lipUpper: at(0, -0.435, 1.0),
    lipLower: at(0, -0.585, 0.99),
    mouth: at(0, -0.5, 1.0),
    cornerL: at(-cornerX, -0.5, 0.86),
    cornerR: at(cornerX, -0.5, 0.86),
    chin: at(0, -0.9, 0.7),
    jawL: at(-0.66, -0.72, 0.4),
    jawR: at(0.66, -0.72, 0.4),
    earL: at(-0.95, -0.05, -0.12),
    earR: at(0.95, -0.05, -0.12),
    nape: at(0, -0.7, -0.8),
    crown: at(0, 1, 0),
  }
}

type Landmarks = ReturnType<typeof landmarks>

/**
 * The vermilion.
 *
 * The lips are part of the head's surface now — two rolls with a crease between
 * them, put there by displacement fields. What makes them READ as lips is the
 * colour boundary, and a boundary that sharp belongs in a texture, not in
 * geometry. This paints it: the cupid's bow across the top, the mouth line, the
 * fuller lower lip, and the vertical lip creases that catch light.
 */
function lipPath(p: Paint, L: Landmarks, upper: boolean, grow = 0): Path2D {
  const { size } = p
  const x0 = L.cornerL.u * size
  const x1 = L.cornerR.u * size
  const yTop = (1 - L.lipUpper.v) * size
  const yMid = (1 - L.mouth.v) * size
  const yBot = (1 - L.lipLower.v) * size
  const path = new Path2D()
  const mid = (x0 + x1) / 2
  const g = grow * size
  if (upper) {
    path.moveTo(x0 - g * 0.4, yMid)
    // Cupid's bow: two peaks with a dip between them.
    path.bezierCurveTo(x0 + (mid - x0) * 0.35, yTop - g, mid - (mid - x0) * 0.42, yTop - g, mid - (mid - x0) * 0.18, yTop + (yMid - yTop) * 0.2 - g)
    path.bezierCurveTo(mid, yTop + (yMid - yTop) * 0.34 - g, mid, yTop + (yMid - yTop) * 0.34 - g, mid + (x1 - mid) * 0.18, yTop + (yMid - yTop) * 0.2 - g)
    path.bezierCurveTo(mid + (x1 - mid) * 0.42, yTop - g, x1 - (x1 - mid) * 0.35, yTop - g, x1 + g * 0.4, yMid)
    path.bezierCurveTo(mid + (x1 - mid) * 0.5, yMid + g * 0.3, mid - (mid - x0) * 0.5, yMid + g * 0.3, x0 - g * 0.4, yMid)
  } else {
    path.moveTo(x0 - g * 0.4, yMid)
    path.bezierCurveTo(mid - (mid - x0) * 0.5, yMid - g * 0.3, mid + (x1 - mid) * 0.5, yMid - g * 0.3, x1 + g * 0.4, yMid)
    path.bezierCurveTo(x1 - (x1 - mid) * 0.28, yBot + g, mid + (x1 - mid) * 0.5, yBot + g * 1.2, mid, yBot + g * 1.2)
    path.bezierCurveTo(mid - (mid - x0) * 0.5, yBot + g * 1.2, x0 + (mid - x0) * 0.28, yBot + g, x0 - g * 0.4, yMid)
  }
  path.closePath()
  return path
}

function paintLips(p: Paint, profile: AvatarProfile, L: Landmarks, mode: 'albedo' | 'height' | 'rough'): void {
  const { ctx, size, rnd } = p
  const lp = profile.lips
  const upper = lipPath(p, L, true)
  const lower = lipPath(p, L, false)
  if (mode === 'albedo') {
    // A soft bleed just outside the vermilion, then the vermilion itself.
    ctx.save()
    ctx.filter = 'blur(' + Math.max(1, size / 220) + 'px)'
    ctx.fillStyle = rgba(mix(lp.color, profile.skin.base, 0.55), 0.7)
    ctx.fill(lipPath(p, L, true, 0.006))
    ctx.fill(lipPath(p, L, false, 0.006))
    ctx.restore()
    // Lips are darker and redder than the skin round them; painting them at
    // the profile colour alone leaves them almost invisible on a warm face.
    ctx.fillStyle = mix(lp.color, '#8d4a42', 0.18)
    ctx.fill(upper)
    ctx.fill(lower)
    // The upper lip sits in the lower one's shadow; the lower one catches light.
    ctx.save()
    ctx.clip(upper)
    ctx.fillStyle = rgba(mix(lp.color, '#5a2f2b', 0.55), 0.22)
    ctx.fillRect(0, 0, size, size)
    ctx.restore()
    ctx.save()
    ctx.clip(lower)
    const gl = ctx.createLinearGradient(0, (1 - L.mouth.v) * size, 0, (1 - L.lipLower.v) * size)
    gl.addColorStop(0, 'rgba(80,40,38,0.2)')
    gl.addColorStop(0.55, 'rgba(255,228,214,0.16)')
    gl.addColorStop(1, 'rgba(60,26,26,0.18)')
    ctx.fillStyle = gl
    ctx.fillRect(0, 0, size, size)
    ctx.restore()
    // The mouth line itself.
    ctx.strokeStyle = rgba(mix(lp.color, '#2a1211', 0.75), 0.85)
    ctx.lineWidth = Math.max(1, size / 380)
    ctx.beginPath()
    ctx.moveTo(L.cornerL.u * size, (1 - L.mouth.v) * size)
    ctx.bezierCurveTo(
      ((L.cornerL.u + L.mouth.u) / 2) * size, (1 - L.mouth.v) * size - size * 0.003,
      ((L.cornerR.u + L.mouth.u) / 2) * size, (1 - L.mouth.v) * size - size * 0.003,
      L.cornerR.u * size, (1 - L.mouth.v) * size,
    )
    ctx.stroke()
    return
  }
  // Lip creases, as relief, running across the vermilion.
  if (mode === 'height') {
    for (const path of [upper, lower]) {
      ctx.save()
      ctx.clip(path)
      const x0 = L.cornerL.u * size
      const x1 = L.cornerR.u * size
      for (let i = 0; i < Math.round(90 * (size / 2048)) + 30; i++) {
        const x = x0 + rnd() * (x1 - x0)
        const y = (1 - L.mouth.v) * size + (rnd() - 0.5) * size * 0.05
        ctx.strokeStyle = rnd() > 0.5 ? 'rgba(0,0,0,0.11)' : 'rgba(255,255,255,0.09)'
        ctx.lineWidth = Math.max(0.8, size / 1400)
        ctx.beginPath()
        ctx.moveTo(x, y - size * 0.02)
        ctx.lineTo(x + (rnd() - 0.5) * size * 0.004, y + size * 0.02)
        ctx.stroke()
      }
      ctx.restore()
    }
    return
  }
  // Lips are smooth and slightly wet.
  ctx.fillStyle = grey(70)
  ctx.fill(upper)
  ctx.fillStyle = grey(58)
  ctx.fill(lower)
}

/** Draw something at a UV, repeating across the u seam so it never cuts off. */
function atUv(p: Paint, l: Uv, draw: (x: number, y: number) => void): void {
  const x = l.u * p.size
  const y = (1 - l.v) * p.size
  draw(x, y)
  if (l.u < 0.25) draw(x + p.size, y)
  if (l.u > 0.75) draw(x - p.size, y)
}

function blob(p: Paint, l: Uv, rx: number, ry: number, color: string, alpha: number): void {
  const { ctx, size } = p
  atUv(p, l, (x, y) => {
    const r = Math.max(rx, ry) * size
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, rgba(color, alpha))
    g.addColorStop(0.55, rgba(color, alpha * 0.45))
    g.addColorStop(1, rgba(color, 0))
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(1, ry / rx)
    ctx.translate(-x, -y)
    ctx.fillStyle = g
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
    ctx.restore()
  })
}

function rgba(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

function mix(hex: string, other: string, t: number): string {
  const c = new THREE.Color(hex).lerp(new THREE.Color(other), t)
  return `#${c.getHexString()}`
}

const grey = (v: number) => `rgb(${v},${v},${v})`

// ---- Pores and fine relief -------------------------------------------------

/**
 * Pore density is not uniform: the nose and the inner cheeks are coarse, the
 * eyelids and the lips almost poreless, the forehead in between. Painting them
 * evenly is what makes procedural skin look like sandpaper.
 */
function poreDensity(u: number, v: number, L: Landmarks): number {
  const d = (l: Uv) => Math.hypot(shortestU(u, l.u), v - l.v)
  const near = (l: Uv, r: number) => Math.max(0, 1 - d(l) / r)
  let k = 0.35
  k += near(L.noseTip, 0.06) * 1.5
  k += near(L.noseWingL, 0.05) * 1.2 + near(L.noseWingR, 0.05) * 1.2
  k += near(L.cheekL, 0.09) * 0.8 + near(L.cheekR, 0.09) * 0.8
  k += near(L.forehead, 0.13) * 0.5
  k -= near(L.eyeL, 0.05) * 0.9 + near(L.eyeR, 0.05) * 0.9
  k -= near(L.mouth, 0.05) * 0.8
  return Math.max(0, k)
}

function shortestU(a: number, b: number): number {
  let d = a - b
  while (d > 0.5) d -= 1
  while (d < -0.5) d += 1
  return d
}

// ---- The three maps --------------------------------------------------------

function paintAlbedo(p: Paint, profile: AvatarProfile): void {
  const { ctx, size, rnd } = p
  const sk = profile.skin
  const L = landmarks(profile)
  ctx.fillStyle = sk.base
  ctx.fillRect(0, 0, size, size)

  // Broad tonal map. Skin is never one value: the forehead and the bridge run
  // lighter and yellower, the mid-face redder, the jaw and neck cooler.
  blob(p, L.forehead, 0.15, 0.11, mix(sk.base, '#f4e0c4', 0.55), 0.4)
  blob(p, L.glabella, 0.07, 0.06, mix(sk.base, '#f0dcc0', 0.4), 0.3)
  blob(p, L.cheekL, 0.11, 0.09, sk.blush, 0.34)
  blob(p, L.cheekR, 0.11, 0.09, sk.blush, 0.34)
  blob(p, L.noseTip, 0.055, 0.05, sk.blush, 0.42)
  blob(p, L.noseWingL, 0.035, 0.03, mix(sk.blush, '#8f4a42', 0.35), 0.32)
  blob(p, L.noseWingR, 0.035, 0.03, mix(sk.blush, '#8f4a42', 0.35), 0.32)
  blob(p, L.mouth, 0.075, 0.05, mix(sk.blush, '#a35f58', 0.4), 0.22)
  // Under-eye: thin skin over bone, cooler and darker. Its absence is why
  // procedural faces look like masks.
  blob(p, { u: L.eyeL.u, v: L.eyeL.v - 0.035 }, 0.05, 0.028, '#8a6a72', 0.3)
  blob(p, { u: L.eyeR.u, v: L.eyeR.v - 0.035 }, 0.05, 0.028, '#8a6a72', 0.3)
  // Temples: the vein colour that shows through there on everyone.
  blob(p, L.templeL, 0.07, 0.09, '#7d8398', 0.16)
  blob(p, L.templeR, 0.07, 0.09, '#7d8398', 0.16)
  // Ears run hot — they are thin and full of blood.
  blob(p, L.earL, 0.055, 0.06, mix(sk.blush, '#c05a4e', 0.45), 0.4)
  blob(p, L.earR, 0.055, 0.06, mix(sk.blush, '#c05a4e', 0.45), 0.4)
  blob(p, L.chin, 0.07, 0.055, mix(sk.base, sk.shade, 0.5), 0.16)
  blob(p, L.jawL, 0.1, 0.08, sk.shade, 0.2)
  blob(p, L.jawR, 0.1, 0.08, sk.shade, 0.2)
  blob(p, L.nape, 0.16, 0.12, sk.shade, 0.32)
  blob(p, L.crown, 0.3, 0.14, mix(sk.base, sk.shade, 0.3), 0.2)

  // Beard shadow, where there is one. This is the colour under the shell, so
  // the shell reads as hair growing out of skin rather than as a decal.
  if (profile.facialHair !== 'none') {
    // Stubble is a HAZE, not a stain. Painting it strongly turned the whole
    // lower face into a dark blotch and swallowed the mouth.
    const strength = profile.facialHair === 'beard' ? 0.34 : 0.17
    blob(p, L.chin, 0.115, 0.095, '#4a3a30', strength)
    blob(p, L.jawL, 0.135, 0.095, '#4a3a30', strength * 0.85)
    blob(p, L.jawR, 0.135, 0.095, '#4a3a30', strength * 0.85)
    blob(p, { u: L.mouth.u, v: L.mouth.v + 0.042 }, 0.062, 0.022, '#4a3a30', strength * 0.8)
  }

  paintLips(p, profile, L, 'albedo')

  // Freckles and small marks. Sparse, only where sun reaches.
  const marks = Math.round(46 * (size / 1024))
  for (let i = 0; i < marks; i++) {
    const u = 0.13 + rnd() * 0.24
    const v = 0.3 + rnd() * 0.36
    const k = poreDensity(u, v, L)
    if (k < 0.5 || rnd() > 0.5) continue
    ctx.fillStyle = rgba(mix(sk.shade, '#6d4a34', 0.6), 0.1 + rnd() * 0.18)
    ctx.beginPath()
    ctx.arc(u * size, (1 - v) * size, (0.8 + rnd() * 2.2) * (size / 1024), 0, Math.PI * 2)
    ctx.fill()
  }

  // FINE: pores, as colour as well as relief. Only worth drawing once there
  // are pixels to hold them.
  if (size >= 1024) {
    const n = Math.round(26000 * (size / 2048))
    for (let i = 0; i < n; i++) {
      const u = rnd()
      const v = rnd()
      const k = poreDensity(u, v, L)
      if (k <= 0 || rnd() > k * 0.5) continue
      ctx.fillStyle = rgba(sk.shade, 0.06 + rnd() * 0.1)
      ctx.beginPath()
      ctx.arc(u * size, (1 - v) * size, (0.5 + rnd() * 0.9) * (size / 2048), 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function paintHeight(p: Paint, profile: AvatarProfile): void {
  const { ctx, size, rnd } = p
  const L = landmarks(profile)
  ctx.fillStyle = grey(128)
  ctx.fillRect(0, 0, size, size)

  const line = (a: Uv, b: Uv, width: number, depth: number) => {
    ctx.strokeStyle = `rgba(0,0,0,${depth})`
    ctx.lineWidth = width * size
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(a.u * size, (1 - a.v) * size)
    ctx.quadraticCurveTo(
      ((a.u + b.u) / 2) * size,
      (1 - (a.v + b.v) / 2 - 0.012) * size,
      b.u * size,
      (1 - b.v) * size,
    )
    ctx.stroke()
  }

  // Expression lines, at the depth they have on a relaxed face — present, but
  // not carved.
  line({ u: L.forehead.u - 0.06, v: L.forehead.v - 0.01 }, { u: L.forehead.u + 0.06, v: L.forehead.v - 0.01 }, 0.004, 0.16)
  line({ u: L.forehead.u - 0.055, v: L.forehead.v - 0.032 }, { u: L.forehead.u + 0.055, v: L.forehead.v - 0.032 }, 0.0035, 0.13)
  // Crow's feet.
  for (const [e, s] of [[L.eyeL, -1], [L.eyeR, 1]] as const) {
    for (let i = 0; i < 3; i++) {
      const a = { u: e.u + s * 0.028, v: e.v + 0.004 - i * 0.007 }
      const b = { u: e.u + s * 0.05, v: e.v + 0.012 - i * 0.012 }
      line(a, b, 0.0022, 0.11)
    }
  }
  // Nasolabial folds.
  line(L.noseWingL, { u: L.mouth.u - 0.038, v: L.mouth.v - 0.028 }, 0.005, 0.18)
  line(L.noseWingR, { u: L.mouth.u + 0.038, v: L.mouth.v - 0.028 }, 0.005, 0.18)

  // Pores as relief. This is what the normal map is actually for.
  if (size >= 512) {
    const n = Math.round(34000 * (size / 2048))
    for (let i = 0; i < n; i++) {
      const u = rnd()
      const v = rnd()
      const k = poreDensity(u, v, L)
      if (k <= 0 || rnd() > k * 0.55) continue
      const r = (0.6 + rnd() * 1.1) * (size / 2048)
      ctx.fillStyle = `rgba(0,0,0,${0.18 + rnd() * 0.2})`
      ctx.beginPath()
      ctx.arc(u * size, (1 - v) * size, r, 0, Math.PI * 2)
      ctx.fill()
      // Each pore sits in a slightly raised ring — that is what catches light.
      ctx.strokeStyle = `rgba(255,255,255,${0.08 + rnd() * 0.1})`
      ctx.lineWidth = Math.max(0.5, r * 0.5)
      ctx.beginPath()
      ctx.arc(u * size, (1 - v) * size, r * 1.7, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  paintLips(p, profile, L, 'height')

  // Beard stubble relief.
  if (profile.facialHair !== 'none') {
    const n = Math.round(9000 * (size / 2048)) * (profile.facialHair === 'beard' ? 2 : 1)
    for (let i = 0; i < n; i++) {
      const u = rnd()
      const v = rnd()
      const near = Math.max(
        1 - Math.hypot(shortestU(u, L.chin.u), v - L.chin.v) / 0.12,
        1 - Math.hypot(shortestU(u, L.jawL.u), v - L.jawL.v) / 0.12,
        1 - Math.hypot(shortestU(u, L.jawR.u), v - L.jawR.v) / 0.12,
      )
      if (near <= 0 || rnd() > near) continue
      ctx.fillStyle = `rgba(255,255,255,${0.2 + rnd() * 0.25})`
      ctx.beginPath()
      ctx.arc(u * size, (1 - v) * size, (0.8 + rnd()) * (size / 2048), 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function paintRoughness(p: Paint, profile: AvatarProfile): void {
  const { ctx, size, rnd } = p
  const L = landmarks(profile)
  // Baseline: skin is fairly matte.
  ctx.fillStyle = grey(196)
  ctx.fillRect(0, 0, size, size)
  // The T-zone is oilier, so it is SMOOTHER — a darker value here.
  blob(p, L.forehead, 0.14, 0.1, '#3c3c3c', 0.5)
  blob(p, L.glabella, 0.06, 0.05, '#333333', 0.55)
  blob(p, L.noseTip, 0.055, 0.05, '#2a2a2a', 0.75)
  blob(p, L.noseWingL, 0.035, 0.03, '#333333', 0.6)
  blob(p, L.noseWingR, 0.035, 0.03, '#333333', 0.6)
  // Eyelids and the skin right under the eye are smooth too.
  blob(p, L.eyeL, 0.04, 0.03, '#4a4a4a', 0.5)
  blob(p, L.eyeR, 0.04, 0.03, '#4a4a4a', 0.5)
  paintLips(p, profile, L, 'rough')
  // Cheeks and the jaw stay matte; the beard area is the roughest thing on a
  // face.
  if (profile.facialHair !== 'none') {
    blob(p, L.chin, 0.11, 0.09, '#ffffff', 0.6)
    blob(p, L.jawL, 0.13, 0.09, '#ffffff', 0.5)
    blob(p, L.jawR, 0.13, 0.09, '#ffffff', 0.5)
  }
  // Break up the remaining flatness so highlights are never a clean oval.
  for (let i = 0; i < Math.round(300 * (size / 1024)); i++) {
    const r = (6 + rnd() * 26) * (size / 1024)
    const x = rnd() * size
    const y = rnd() * size
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    const v = rnd() > 0.5 ? '255,255,255' : '0,0,0'
    g.addColorStop(0, `rgba(${v},0.05)`)
    g.addColorStop(1, `rgba(${v},0)`)
    ctx.fillStyle = g
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }
}

// ---- Public -----------------------------------------------------------------

export function skinSurface(profile: AvatarProfile): PbrSurface {
  return surface({
    key: `skin:${profile.id}`,
    cls: 'hero',
    repeat: 1,
    normalize: null, // the albedo IS the skin colour; do not rebalance it
    normalStrength: 1.5,
    albedo: (p) => paintAlbedo(p, profile),
    height: (p) => paintHeight(p, profile),
    roughness: (p) => paintRoughness(p, profile),
  })
}

/**
 * Material props for skin.
 *
 * No emissive term. The old one existed because the house lights are all
 * overhead and downward-facing surfaces went black; the fix for that is light
 * (HouseLighting now carries a real bounce fill), not a face that glows.
 */
export function skinMaterial(profile: AvatarProfile, detail: boolean, shade = false) {
  const s = skinSurface(profile)
  return {
    color: shade ? profile.skin.shade : '#ffffff',
    map: s.map,
    normalMap: detail ? s.normalMap : undefined,
    normalScale: new THREE.Vector2(detail ? 0.55 : 0.3, detail ? 0.55 : 0.3),
    roughnessMap: s.roughnessMap,
    roughness: 1,
    metalness: 0,
  }
}

/**
 * A tiling pore/knuckle-crease detail set for the parts that are NOT the head:
 * hands, neck, forearms. Those have their own UV layouts, and a face texture
 * stretched over a hand is worse than no texture, so this is its own small
 * surface — pores and a roughness break-up, nothing anatomical.
 */
export function skinDetailSurface(): PbrSurface {
  return surface({
    key: 'skinDetail',
    cls: 'detail',
    repeat: 3,
    normalize: null,
    normalStrength: 1.8,
    albedo: (p) => {
      p.ctx.fillStyle = '#ffffff'
      p.ctx.fillRect(0, 0, p.size, p.size)
    },
    height: (p) => {
      const { ctx, size, rnd } = p
      ctx.fillStyle = grey(128)
      ctx.fillRect(0, 0, size, size)
      const n = Math.round(9000 * (size / 1024))
      for (let i = 0; i < n; i++) {
        const x = rnd() * size
        const y = rnd() * size
        const r = (0.6 + rnd() * 1.2) * (size / 1024)
        ctx.fillStyle = `rgba(0,0,0,${0.16 + rnd() * 0.2})`
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
        ctx.strokeStyle = `rgba(255,255,255,${0.07 + rnd() * 0.09})`
        ctx.lineWidth = Math.max(0.5, r * 0.5)
        ctx.beginPath(); ctx.arc(x, y, r * 1.8, 0, Math.PI * 2); ctx.stroke()
      }
      // Fine creases, the way skin folds over anything that bends.
      for (let i = 0; i < Math.round(180 * (size / 1024)); i++) {
        const x = rnd() * size
        const y = rnd() * size
        ctx.strokeStyle = `rgba(0,0,0,${0.1 + rnd() * 0.14})`
        ctx.lineWidth = (0.8 + rnd()) * (size / 1024)
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.quadraticCurveTo(x + (rnd() - 0.5) * 30, y + (rnd() - 0.5) * 30, x + (rnd() - 0.5) * 60, y + (rnd() - 0.5) * 60)
        ctx.stroke()
      }
    },
    roughness: (p) => {
      const { ctx, size, rnd } = p
      ctx.fillStyle = grey(186)
      ctx.fillRect(0, 0, size, size)
      for (let i = 0; i < Math.round(220 * (size / 1024)); i++) {
        const r = (8 + rnd() * 40) * (size / 1024)
        const x = rnd() * size
        const y = rnd() * size
        const g = ctx.createRadialGradient(x, y, 0, x, y, r)
        const v = rnd() > 0.5 ? '255,255,255' : '0,0,0'
        g.addColorStop(0, `rgba(${v},0.1)`)
        g.addColorStop(1, `rgba(${v},0)`)
        ctx.fillStyle = g
        ctx.fillRect(x - r, y - r, r * 2, r * 2)
      }
    },
  })
}

/** Material props for skin away from the face. */
export function bodySkinMaterial(profile: AvatarProfile, detail: boolean, shade = false) {
  const s = skinDetailSurface()
  return {
    color: shade ? profile.skin.shade : profile.skin.base,
    normalMap: detail ? s.normalMap : undefined,
    normalScale: new THREE.Vector2(0.45, 0.45),
    roughnessMap: detail ? s.roughnessMap : undefined,
    roughness: detail ? 1 : 0.68,
    metalness: 0,
  }
}
