import { useMemo } from 'react'
import * as THREE from 'three'
import { useTimeOfDay } from '../../hooks/useClock'
import { skyPalette } from '../../systems/timeSystem'

// A believable exterior seen beyond a window (or balcony). Built local to the
// opening so it is always correctly framed and cheap: two gradient sky planes,
// a receding ground/road, a row of low-poly building silhouettes with warm lit
// windows at dusk/night, a couple of trees and a faint haze band. Everything is
// tinted by the user's real local time-of-day. Local +Z points AWAY from the
// room (outward), so this sits in front of the glass.
//
// `seed` keeps a given window's skyline stable between renders; `w`/`h` size the
// view to the opening. Low quality drops the building/window count.
export function Exterior({
  w,
  h,
  seed = 1,
  detail = 1,
}: {
  w: number
  h: number
  seed?: number
  detail?: number // 0 = minimal (low tier), 1 = full
}) {
  const tod = useTimeOfDay()
  const p = skyPalette(tod)
  const day = tod === 'day'

  // View frustum through the opening is wide, so heavily oversize the backdrop
  // and add side wings so oblique glances (and the open balcony's distant view)
  // never catch the void behind. Oversizing is free for windows: the wall hides
  // everything outside the opening.
  const bw = w + 6
  const bh = h + 7
  const skyY = 1.4 // lift the sky so plenty sits above the opening
  const skyZ = 3.4
  const groundZ0 = 0.4

  const count = detail > 0 ? 14 : 7
  const buildings = useMemo(() => makeSkyline(count, w, seed), [count, w, seed])
  const trees = useMemo(() => makeTrees(detail > 0 ? 3 : 1, w, seed), [detail, w, seed])
  const litWindows = useMemo(() => makeWindows(buildings, seed), [buildings, seed])

  return (
    <group>
      {/* Sky gradient — a bottom hazy band and a top clear band */}
      <mesh position={[0, skyY, skyZ]}>
        <planeGeometry args={[bw, bh]} />
        <meshBasicMaterial color={p.bottom} fog={false} />
      </mesh>
      <mesh position={[0, skyY + bh * 0.22, skyZ - 0.02]}>
        <planeGeometry args={[bw, bh * 0.62]} />
        <meshBasicMaterial color={p.top} fog={false} />
      </mesh>
      {/* Side wings so wide viewing angles still land on sky, not black */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * bw) / 2, skyY, skyZ - 1.4]} rotation={[0, -s * 0.9, 0]}>
          <planeGeometry args={[4, bh]} />
          <meshBasicMaterial color={p.bottom} fog={false} />
        </mesh>
      ))}

      {/* Daylight bloom-through so the opening reads bright by day */}
      {day && (
        <mesh position={[0, h * 0.1, skyZ - 0.05]}>
          <planeGeometry args={[w + 1.2, h + 0.8]} />
          <meshBasicMaterial color="#fff6e2" transparent opacity={0.3} fog={false} />
        </mesh>
      )}

      {/* Stars at night */}
      {p.stars && <Stars count={detail > 0 ? 80 : 36} w={bw} h={bh} z={skyZ - 0.1} />}

      {/* Ground / road receding from the building base toward the wall */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -h / 2 - 0.05, (skyZ + groundZ0) / 2]}>
        <planeGeometry args={[bw + 2, skyZ - groundZ0 + 1]} />
        <meshBasicMaterial color={day ? '#5b5a54' : '#1a1c22'} fog={false} />
      </mesh>
      {/* sidewalk / curb strip nearer the viewer */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -h / 2 - 0.045, groundZ0 + 0.35]}>
        <planeGeometry args={[bw + 2, 0.7]} />
        <meshBasicMaterial color={day ? '#7d7a70' : '#24262c'} fog={false} />
      </mesh>

      {/* Building silhouettes */}
      {buildings.map((b, i) => (
        <mesh key={i} position={[b.x, -h / 2 + b.h / 2 - 0.05, b.z]}>
          <boxGeometry args={[b.w, b.h, 0.4]} />
          <meshBasicMaterial color={fadeToHorizon(day ? '#7c8496' : '#0b0e16', p.bottom, b.far)} fog={false} />
        </mesh>
      ))}

      {/* Warm lit windows at dusk / night */}
      {p.cityLights &&
        litWindows.map((lw, i) => (
          <mesh key={i} position={[lw.x, -h / 2 + lw.y - 0.05, lw.z]}>
            <planeGeometry args={[lw.s, lw.s * 1.3]} />
            <meshBasicMaterial color={lw.warm ? '#ffd38a' : '#cfe0f0'} transparent opacity={0.85} fog={false} />
          </mesh>
        ))}

      {/* Trees (low-poly: trunk + foliage) */}
      {trees.map((tr, i) => (
        <group key={i} position={[tr.x, -h / 2 - 0.05, tr.z]}>
          <mesh position={[0, tr.trunk / 2, 0]}>
            <cylinderGeometry args={[0.05, 0.07, tr.trunk, 6]} />
            <meshBasicMaterial color={day ? '#4a382a' : '#15120e'} fog={false} />
          </mesh>
          <mesh position={[0, tr.trunk + tr.foliage * 0.4, 0]}>
            <coneGeometry args={[tr.foliage * 0.6, tr.foliage, 7]} />
            <meshBasicMaterial color={day ? '#40603a' : '#101a12'} fog={false} />
          </mesh>
        </group>
      ))}

      {/* Street lamp glow at night */}
      {p.cityLights && (
        <group position={[w * 0.32, -h / 2 + 0.9, groundZ0 + 0.5]}>
          <mesh position={[0, 0.55, 0]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshBasicMaterial color="#ffdca0" fog={false} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 1.1, 6]} />
            <meshBasicMaterial color={day ? '#40444c' : '#20232a'} fog={false} />
          </mesh>
        </group>
      )}

      {/* Faint atmospheric haze band along the horizon */}
      <mesh position={[0, -h * 0.12, skyZ - 0.6]}>
        <planeGeometry args={[bw, bh * 0.4]} />
        <meshBasicMaterial color={p.bottom} transparent opacity={0.35} fog={false} />
      </mesh>
    </group>
  )
}

function Stars({ count, w, h, z }: { count: number; w: number; h: number; z: number }) {
  const pts = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * w
      arr[i * 3 + 1] = Math.random() * h * 0.5 + h * 0.05
      arr[i * 3 + 2] = 0
    }
    return arr
  }, [count, w, h])
  return (
    <points position={[0, 0, z]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pts, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#c8d0dc" transparent opacity={0.7} sizeAttenuation fog={false} />
    </points>
  )
}

// --- deterministic generators (seeded so a skyline is stable) ----------------

function rng(seed: number): () => number {
  let s = seed * 9301 + 49297
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

interface Building {
  x: number
  y: number
  z: number
  w: number
  h: number
  far: number
}

function makeSkyline(count: number, viewW: number, seed: number): Building[] {
  const r = rng(seed)
  const out: Building[] = []
  const span = viewW + 3.5
  for (let i = 0; i < count; i++) {
    const far = r() // 0 near .. 1 far
    out.push({
      x: -span / 2 + (i / Math.max(1, count - 1)) * span + (r() - 0.5) * 0.4,
      y: 0,
      z: 1.4 + far * 1.6,
      w: 0.5 + r() * 0.7,
      h: 0.9 + r() * 2.4 * (1 - far * 0.4),
      far,
    })
  }
  return out
}

function makeWindows(buildings: Building[], seed: number): { x: number; y: number; z: number; s: number; warm: boolean }[] {
  const r = rng(seed + 7)
  const out: { x: number; y: number; z: number; s: number; warm: boolean }[] = []
  for (const b of buildings) {
    const cols = Math.max(2, Math.floor(b.w / 0.22))
    const rows = Math.max(2, Math.floor(b.h / 0.35))
    for (let cx = 0; cx < cols; cx++) {
      for (let cy = 0; cy < rows; cy++) {
        if (r() > 0.42) continue // most windows dark
        out.push({
          x: b.x - b.w / 2 + 0.11 + cx * (b.w / cols),
          y: 0.25 + cy * (b.h / rows),
          z: b.z - 0.21,
          s: 0.08,
          warm: r() > 0.25,
        })
      }
    }
  }
  return out
}

function makeTrees(count: number, viewW: number, seed: number): { x: number; z: number; trunk: number; foliage: number }[] {
  const r = rng(seed + 3)
  const out: { x: number; z: number; trunk: number; foliage: number }[] = []
  for (let i = 0; i < count; i++) {
    out.push({
      x: -viewW / 2 + r() * (viewW + 1.5) - 0.5,
      z: 0.8 + r() * 0.6,
      trunk: 0.5 + r() * 0.4,
      foliage: 0.7 + r() * 0.6,
    })
  }
  return out
}

// Blend a base colour toward the horizon colour by `far` for aerial perspective.
function fadeToHorizon(base: string, horizon: string, far: number): THREE.Color {
  const c = new THREE.Color(base)
  c.lerp(new THREE.Color(horizon), far * 0.55)
  return c
}
