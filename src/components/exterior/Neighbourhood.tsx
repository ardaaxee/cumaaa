import { useMemo } from 'react'
import { Instance, Instances } from '@react-three/drei'
import { useTimeOfDay } from '../../hooks/useClock'
import { useWeather } from '../../systems/weatherSystem'
import { isHighTier } from '../../utils/device'
import { seeded, jitter } from '../../systems/imperfections'
import type { GraphicsQuality } from '../../types'

// The street the flat looks out over.
//
// The single most "3D demo" thing about the old view was that the balcony
// looked onto flat grey boxes standing on nothing. The fix that matters is not
// more boxes — it is GROUND. Real geometry at a real height below you, with a
// road, kerbs, pavements and things standing on them, is what makes a balcony
// read as the third floor of a building rather than a platform in a void.
//
// Everything here is procedural, instanced where it repeats, and placed on the
// west side of the flat (where the balcony and the living/kitchen windows look)
// so nothing is built where it can never be seen.

export const STREET_Y = -9 // the flat is an upper floor; the street is below

const ROAD = { x0: -36, x1: -18 }
const NEAR_WALK = { x0: -18, x1: -13.8 }
const FAR_WALK = { x0: -39.5, x1: -36 }
const Z0 = -14
const Z1 = 40

interface Placed {
  x: number
  z: number
  /** A stable 0..1 draw for per-item variation (colour, size, angle). */
  v: number
  rand: () => number
}

// Deterministic placement along a strip: evenly spaced, then nudged, so street
// furniture never lines up like fence posts but also never re-shuffles.
function scatter(key: string, count: number, xa: number, xb: number, za: number, zb: number): Placed[] {
  const out: Placed[] = []
  for (let i = 0; i < count; i++) {
    const rand = seeded(`${key}${i}`)
    const v = rand()
    out.push({
      x: xa + (xb - xa) * v,
      z: za + ((zb - za) * (i + 0.5)) / count + jitter(rand, 1.6),
      v,
      rand,
    })
  }
  return out
}

export function Neighbourhood({ quality }: { quality: GraphicsQuality }) {
  const tod = useTimeOfDay()
  const weather = useWeather()
  const detail = isHighTier(quality) ? 2 : quality === 'medium' ? 1 : 0
  const night = tod === 'night'
  const dusk = tod === 'sunset' || night

  // Wet asphalt after rain: darker and much glossier. Cheap — a material
  // change, not a second surface.
  const wet = weather === 'rain'
  const asphalt = wet ? '#26282c' : '#3a3d42'
  const asphaltRough = wet ? 0.28 : 0.86
  const walkColor = wet ? '#6e6f6c' : '#86867f'

  const lamps = useMemo(() => scatter('lamp', detail > 0 ? 6 : 4, -16.4, -16.4, Z0 + 6, Z1 - 6), [detail])
  const trees = useMemo(() => scatter('tree', detail > 0 ? 7 : 4, -15.4, -14.6, Z0 + 3, Z1 - 3), [detail])
  const cars = useMemo(() => scatter('car', detail > 0 ? 6 : 3, -19.6, -19.2, Z0 + 8, Z1 - 8), [detail])
  const bins = useMemo(() => scatter('bin', 2, -17.2, -16.8, 4, 22), [])

  return (
    <group>
      {/* ---- Ground ------------------------------------------------------ */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(ROAD.x0 + ROAD.x1) / 2, STREET_Y, (Z0 + Z1) / 2]} receiveShadow>
        <planeGeometry args={[ROAD.x1 - ROAD.x0, Z1 - Z0]} />
        <meshStandardMaterial color={asphalt} roughness={asphaltRough} metalness={0.05} />
      </mesh>
      {/* lane markings */}
      {Array.from({ length: detail > 0 ? 14 : 8 }).map((_, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[(ROAD.x0 + ROAD.x1) / 2, STREET_Y + 0.01, Z0 + 3 + ((Z1 - Z0 - 6) * i) / (detail > 0 ? 14 : 8)]}
        >
          <planeGeometry args={[0.16, 1.8]} />
          <meshStandardMaterial color="#b9b39a" roughness={0.9} />
        </mesh>
      ))}

      {[NEAR_WALK, FAR_WALK].map((w, i) => (
        <group key={i}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(w.x0 + w.x1) / 2, STREET_Y + 0.14, (Z0 + Z1) / 2]} receiveShadow>
            <planeGeometry args={[w.x1 - w.x0, Z1 - Z0]} />
            <meshStandardMaterial color={walkColor} roughness={wet ? 0.5 : 0.95} />
          </mesh>
          {/* kerb face onto the road */}
          <mesh position={[i === 0 ? w.x0 + 0.06 : w.x1 - 0.06, STREET_Y + 0.07, (Z0 + Z1) / 2]}>
            <boxGeometry args={[0.12, 0.14, Z1 - Z0]} />
            <meshStandardMaterial color="#9a998e" roughness={0.92} />
          </mesh>
        </group>
      ))}

      {/* ---- Our own building, seen from outside -------------------------- */}
      {/* Everything BELOW our floor: the storeys we are standing on top of.
          Looking down over the balcony rail has to land on a facade that drops
          away to the pavement — that, more than any prop, is what says "third
          floor" instead of "platform". */}
      <mesh position={[0.5, (STREET_Y + 0.01) / 2, 12.5] as [number, number, number]} receiveShadow>
        <boxGeometry args={[27.6, Math.abs(STREET_Y) + 0.02, 43]} />
        <meshStandardMaterial color="#8d8377" roughness={0.93} />
      </mesh>
      {/* The balcony's own underside slab, projecting past the facade */}
      <mesh position={[-11.7, -0.16, 10]} receiveShadow>
        <boxGeometry args={[3.6, 0.3, 7.2]} />
        <meshStandardMaterial color="#948a7d" roughness={0.9} />
      </mesh>
      {/* floor bands, so the wall reads as storeys rather than one slab */}
      {[-6.4, -3.2].map((y, i) => (
        <mesh key={i} position={[-13.35, y, 12.5]}>
          <boxGeometry args={[0.2, 0.16, 43]} />
          <meshStandardMaterial color="#7b7266" roughness={0.9} />
        </mesh>
      ))}
      {/* the balconies of the flats below ours */}
      {[-6.2, -3.0].map((y, i) => (
        <group key={i} position={[-12.2, y, 10]}>
          <mesh receiveShadow>
            <boxGeometry args={[2.6, 0.22, 6.4]} />
            <meshStandardMaterial color="#948a7d" roughness={0.9} />
          </mesh>
          <mesh position={[-1.25, 0.55, 0]}>
            <boxGeometry args={[0.07, 1.0, 6.4]} />
            <meshStandardMaterial color="#5c5f63" metalness={0.5} roughness={0.5} />
          </mesh>
        </group>
      ))}
      {/* windows on the storeys below ours */}
      <Instances limit={40} range={detail > 0 ? 40 : 18}>
        <boxGeometry args={[0.1, 1.15, 0.95]} />
        {/* Per-instance colour carries lit vs dark; this is just the base. */}
        <meshStandardMaterial
          emissive={night ? '#ffc98a' : '#000000'}
          emissiveIntensity={night ? 0.85 : 0}
          roughness={0.35}
          metalness={0.1}
        />
        {[-7.4, -4.2].flatMap((y, yi) =>
          Array.from({ length: detail > 0 ? 12 : 6 }).map((__, zi) => {
            const lit = night && seeded(`ourwin${yi}${zi}`)() > 0.45
            return (
              <Instance
                key={`${yi}-${zi}`}
                position={[-13.28, y, -4 + zi * 3.4]}
                color={lit ? '#ffd9a0' : night ? '#1b2026' : '#2b3138'}
              />
            )
          }),
        )}
      </Instances>

      {/* ---- The block across the road ------------------------------------ */}
      <OppositeBlock night={night} detail={detail} />

      {/* ---- Street furniture --------------------------------------------- */}
      {trees.map((t, i) => (
        <Tree key={i} x={t.x} z={t.z} v={t.v} detail={detail} />
      ))}
      {lamps.map((l, i) => (
        <StreetLamp key={i} x={l.x} z={l.z} lit={dusk} />
      ))}
      {cars.map((c, i) => (
        <Car key={i} x={c.x} z={c.z} v={c.v} rand={c.rand} night={night} />
      ))}
      {bins.map((bn, i) => (
        <group key={i} position={[bn.x, STREET_Y + 0.14, bn.z]}>
          <mesh position={[0, 0.55, 0]} castShadow>
            <boxGeometry args={[1.1, 1.1, 0.8]} />
            <meshStandardMaterial color={i ? '#3f5a45' : '#4a4a52'} roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.13, 0]}>
            <boxGeometry args={[1.14, 0.08, 0.84]} />
            <meshStandardMaterial color="#2c2c32" roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// A slab opposite with a window grid and its own balconies. One instanced mesh
// for the windows keeps this to a handful of draw calls.
function OppositeBlock({ night, detail }: { night: boolean; detail: number }) {
  const cols = detail > 0 ? 11 : 7
  const rows = detail > 0 ? 7 : 5
  return (
    <group>
      <mesh position={[-44, STREET_Y + 8.5, 12]} receiveShadow>
        <boxGeometry args={[9, 17, 46]} />
        <meshStandardMaterial color="#9a938a" roughness={0.94} />
      </mesh>
      {/* a second, further block so the skyline has depth */}
      <mesh position={[-56, STREET_Y + 13, -8]}>
        <boxGeometry args={[10, 26, 26]} />
        <meshStandardMaterial color="#8e8a84" roughness={0.95} />
      </mesh>

      <Instances limit={120} range={cols * rows}>
        <boxGeometry args={[0.12, 1.3, 1.05]} />
        <meshStandardMaterial roughness={0.3} metalness={0.15} emissiveIntensity={night ? 0.9 : 0} />
        {Array.from({ length: rows }).flatMap((_, ri) =>
          Array.from({ length: cols }).map((__, ci) => {
            const lit = night && seeded(`opp${ri}${ci}`)() > 0.42
            return (
              <Instance
                key={`${ri}-${ci}`}
                position={[-39.4, STREET_Y + 3.2 + ri * 2.6, -9 + ci * 3.9]}
                color={lit ? '#ffd39a' : night ? '#191d23' : '#39414a'}
              />
            )
          }),
        )}
      </Instances>

      {/* their balconies — slabs with a rail, on alternating bays */}
      {Array.from({ length: detail > 0 ? 6 : 3 }).map((_, i) => {
        const z = -6 + i * 7.4
        const y = STREET_Y + 5.8 + (i % 3) * 2.6
        return (
          <group key={i} position={[-38.9, y, z]}>
            <mesh>
              <boxGeometry args={[1.5, 0.16, 3]} />
              <meshStandardMaterial color="#a49c92" roughness={0.9} />
            </mesh>
            <mesh position={[0.7, 0.5, 0]}>
              <boxGeometry args={[0.06, 0.95, 3]} />
              <meshStandardMaterial color="#5c5f63" metalness={0.5} roughness={0.5} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function Tree({ x, z, v, detail }: { x: number; z: number; v: number; detail: number }) {
  const h = 3.4 + v * 1.8
  const tiers = detail > 0 ? 3 : 2
  return (
    <group position={[x, STREET_Y + 0.14, z]}>
      {/* a tree pit in the pavement, so it isn't growing out of concrete */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[1.1, 1.1]} />
        <meshStandardMaterial color="#4a4034" roughness={0.98} />
      </mesh>
      <mesh position={[0, h * 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.14, h * 0.64, 6]} />
        <meshStandardMaterial color="#4e3d2c" roughness={0.95} />
      </mesh>
      {Array.from({ length: tiers }).map((_, i) => (
        <mesh key={i} position={[0, h * (0.62 + i * 0.2), 0]} castShadow>
          <coneGeometry args={[1.35 - i * 0.32, 1.5 - i * 0.24, detail > 0 ? 8 : 6]} />
          <meshStandardMaterial color={i === 0 ? '#3f5c35' : '#47663b'} roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

function StreetLamp({ x, z, lit }: { x: number; z: number; lit: boolean }) {
  return (
    <group position={[x, STREET_Y + 0.14, z]}>
      <mesh position={[0, 2.4, 0]}>
        <cylinderGeometry args={[0.07, 0.1, 4.8, 8]} />
        <meshStandardMaterial color="#4b4e52" metalness={0.5} roughness={0.55} />
      </mesh>
      {/* arm reaching over the road */}
      <mesh position={[-0.55, 4.7, 0]} rotation={[0, 0, Math.PI / 2.2]}>
        <cylinderGeometry args={[0.05, 0.05, 1.3, 8]} />
        <meshStandardMaterial color="#4b4e52" metalness={0.5} roughness={0.55} />
      </mesh>
      <mesh position={[-1.05, 4.86, 0]}>
        <boxGeometry args={[0.7, 0.14, 0.3]} />
        <meshStandardMaterial
          color="#5a5d61"
          emissive={lit ? '#ffdba6' : '#000000'}
          emissiveIntensity={lit ? 1.4 : 0}
          roughness={0.5}
        />
      </mesh>
      {lit && <pointLight position={[-1.05, 4.6, 0]} color="#ffd39a" intensity={1.6} distance={13} decay={1.6} />}
    </group>
  )
}

function Car({ x, z, v, rand, night }: { x: number; z: number; v: number; rand: () => number; night: boolean }) {
  const body = ['#8e939a', '#3d4650', '#7a3b38', '#2f3336', '#b3b6b8'][Math.floor(v * 5) % 5]
  return (
    <group position={[x, STREET_Y + 0.14, z]} rotation={[0, jitter(rand, 0.05), 0]}>
      <mesh position={[0, 0.52, 0]} castShadow>
        <boxGeometry args={[1.82, 0.62, 4.2]} />
        <meshStandardMaterial color={body} metalness={0.55} roughness={0.42} />
      </mesh>
      {/* cabin, set back and narrower so it isn't a plain brick */}
      <mesh position={[0, 1.0, -0.15]} castShadow>
        <boxGeometry args={[1.6, 0.56, 2.1]} />
        <meshStandardMaterial color={body} metalness={0.5} roughness={0.45} />
      </mesh>
      <mesh position={[0, 1.02, -0.16]}>
        <boxGeometry args={[1.63, 0.4, 2.0]} />
        <meshStandardMaterial color="#1d2228" metalness={0.4} roughness={0.2} />
      </mesh>
      {[-0.72, 0.72].map((sx) =>
        [-1.45, 1.45].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[sx, 0.3, sz]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 10]} />
            <meshStandardMaterial color="#1a1c1f" roughness={0.9} />
          </mesh>
        )),
      )}
      {/* tail lights catch the eye at night without becoming neon */}
      {[-0.6, 0.6].map((sx) => (
        <mesh key={sx} position={[sx, 0.62, 2.11]}>
          <boxGeometry args={[0.34, 0.14, 0.04]} />
          <meshStandardMaterial
            color="#7a2b2b"
            emissive={night ? '#8a2020' : '#000000'}
            emissiveIntensity={night ? 0.7 : 0}
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  )
}
