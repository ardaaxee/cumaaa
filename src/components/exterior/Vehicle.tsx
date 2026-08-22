import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { buildSweep, type Slice } from '../characters/geometry/body'

// A car.
//
// The one this replaces was two boxes and four cylinders: a brick with a smaller
// brick on top. A car's whole read comes from its SECTION — a body widest at the
// wheel arches that tucks in above and below them, a roof narrower than the
// sills, a raked screen — and from the parts a box cannot have: arches the
// wheels sit inside, a glasshouse with pillars, mirrors, shut lines, and lights
// that are separate lenses rather than painted rectangles.
//
// Built along Z (nose at +Z), sitting on the ground at y = 0.

export interface VehicleRig {
  /** Wheel roll, radians. */
  setWheelSpin(a: number): void
  /** Front-wheel steering, radians. */
  setSteer(a: number): void
  /** 0..1 brake lamps. */
  setBrake(v: number): void
  /** -1 left, 0 none, +1 right. */
  setIndicator(dir: -1 | 0 | 1, on: boolean): void
  setHeadlights(on: boolean): void
}

export interface VehicleStyle {
  body: string
  /** Estate, hatch and van differ in where the roof ends, not in colour. */
  kind: 'hatch' | 'saloon' | 'estate' | 'van'
}

const LEN = 4.3
const WID = 1.82
const WHEEL_R = 0.32

function bodySlices(kind: VehicleStyle['kind']): Slice[] {
  const tail = kind === 'estate' || kind === 'van' ? 1 : 0.86
  return [
    { y: -LEN / 2, w: WID * 0.42, d: 0.3, cz: 0.44, flat: 0.1 },
    { y: -LEN / 2 + 0.16, w: WID * 0.48, d: 0.38, cz: 0.46 * tail, flat: 0.1 },
    { y: -1.3, w: WID * 0.5, d: 0.42, cz: 0.48 * tail, flat: 0.05 },
    { y: -1.05, w: WID * 0.52, d: 0.42, cz: 0.48, flat: 0 },
    { y: -0.2, w: WID * 0.5, d: 0.44, cz: 0.5, flat: 0 },
    { y: 1.05, w: WID * 0.52, d: 0.42, cz: 0.47, flat: 0 },
    { y: 1.5, w: WID * 0.48, d: 0.36, cz: 0.44, flat: 0.1 },
    { y: LEN / 2 - 0.12, w: WID * 0.42, d: 0.28, cz: 0.4, flat: 0.15 },
    { y: LEN / 2, w: WID * 0.34, d: 0.2, cz: 0.36, flat: 0.2 },
  ]
}

/** The glasshouse: narrower than the body, raked at both ends. */
function roofSlices(kind: VehicleStyle['kind']): Slice[] {
  const backZ = kind === 'van' ? -1.9 : kind === 'estate' ? -1.7 : kind === 'saloon' ? -1.15 : -1.3
  return [
    { y: backZ, w: WID * 0.4, d: 0.02, cz: 0.86, flat: 0.2 },
    { y: backZ + 0.35, w: WID * 0.43, d: 0.2, cz: 0.96, flat: 0.15 },
    { y: -0.1, w: WID * 0.44, d: 0.24, cz: 1.0, flat: 0.1 },
    { y: 0.5, w: WID * 0.43, d: 0.22, cz: 0.98, flat: 0.1 },
    { y: 1.02, w: WID * 0.38, d: 0.06, cz: 0.86, flat: 0.2 },
  ]
}

export const Vehicle = forwardRef<VehicleRig, { style: VehicleStyle; detail: boolean }>(
  function Vehicle({ style, detail }, ref) {
    const wheels = useRef<THREE.Group[]>([])
    const steerGroups = useRef<THREE.Group[]>([])
    const brake = useRef<THREE.MeshStandardMaterial[]>([])
    const indicator = useRef<THREE.MeshStandardMaterial[]>([])
    const head = useRef<THREE.MeshStandardMaterial[]>([])

    useImperativeHandle(ref, () => ({
      setWheelSpin(a) { wheels.current.forEach((w) => { if (w) w.rotation.x = a }) },
      setSteer(a) { steerGroups.current.forEach((g) => { if (g) g.rotation.y = a }) },
      setBrake(v) { brake.current.forEach((m) => { if (m) m.emissiveIntensity = 0.25 + v * 2.2 }) },
      setIndicator(dir, on) {
        indicator.current.forEach((m, i) => {
          if (!m) return
          const side = i % 2 === 0 ? -1 : 1
          m.emissiveIntensity = on && dir === side ? 3 : 0
        })
      },
      setHeadlights(on) { head.current.forEach((m) => { if (m) m.emissiveIntensity = on ? 2.4 : 0 }) },
    }))

    const geom = useMemo(() => {
      const radial = detail ? 16 : 10
      // The sweep runs along its own Y with the section's `cz` as its centre.
      // Standing it up needs rotateX(-PI/2), which maps (x,y,z) -> (x, z, -y):
      // the section's cz becomes HEIGHT and the sweep axis becomes -Z. Rotating
      // the other way puts the car underground and upside down, which is what it
      // was doing. Negating the slice Y first puts the nose back at +Z.
      const flip = (ss: Slice[]) => ss.map((sl) => ({ ...sl, y: -sl.y }))
      const body = buildSweep(flip(bodySlices(style.kind)), radial, true, true)
      body.rotateX(-Math.PI / 2)
      const roof = buildSweep(flip(roofSlices(style.kind)), radial, true, true)
      roof.rotateX(-Math.PI / 2)
      return { body, roof }
    }, [style.kind, detail])
    useEffect(() => () => { geom.body.dispose(); geom.roof.dispose() }, [geom])

    const paint = { color: style.body, metalness: 0.55, roughness: 0.32 }
    const wheelPos: [number, number, number][] = [
      [-WID * 0.46, WHEEL_R, 1.28],
      [WID * 0.46, WHEEL_R, 1.28],
      [-WID * 0.46, WHEEL_R, -1.28],
      [WID * 0.46, WHEEL_R, -1.28],
    ]

    return (
      <group>
        <mesh geometry={geom.body} castShadow receiveShadow>
          <meshStandardMaterial {...paint} />
        </mesh>
        <mesh geometry={geom.roof} castShadow>
          <meshStandardMaterial {...paint} />
        </mesh>
        {/* Glass, inset from the pillars so the car has a cabin rather than a
            painted stripe. */}
        <mesh position={[0, 1.06, -0.1]} scale={[0.94, 0.86, 0.92]}>
          <boxGeometry args={[WID * 0.82, 0.42, 2.1]} />
          <meshPhysicalMaterial
            color="#141a20"
            metalness={0.2}
            roughness={0.08}
            transparent
            opacity={0.66}
            clearcoat={1}
            clearcoatRoughness={0.04}
          />
        </mesh>

        {/* Wheels in arches. The steering group turns; the wheel inside it
            rolls — so a car that is turning does both. */}
        {wheelPos.map((p, i) => {
          const front = p[2] > 0
          return (
            <group key={i} position={p} ref={(g) => { if (g && front) steerGroups.current[i] = g }}>
              <group ref={(g) => { if (g) wheels.current[i] = g }}>
                <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                  <cylinderGeometry args={[WHEEL_R, WHEEL_R, 0.22, detail ? 18 : 10]} />
                  <meshStandardMaterial color="#17181b" roughness={0.94} metalness={0.02} />
                </mesh>
                <mesh rotation={[0, 0, Math.PI / 2]} position={[p[0] > 0 ? 0.06 : -0.06, 0, 0]}>
                  <cylinderGeometry args={[WHEEL_R * 0.6, WHEEL_R * 0.6, 0.12, detail ? 12 : 8]} />
                  <meshStandardMaterial color="#9aa0a6" metalness={0.85} roughness={0.3} />
                </mesh>
                {/* Spokes: without something ASYMMETRIC on the wheel, a rolling
                    tyre and a stationary one look identical. */}
                {detail &&
                  [0, 1, 2, 3, 4].map((k) => (
                    <mesh
                      key={k}
                      position={[
                        p[0] > 0 ? 0.1 : -0.1,
                        Math.cos((k / 5) * 6.28) * WHEEL_R * 0.36,
                        Math.sin((k / 5) * 6.28) * WHEEL_R * 0.36,
                      ]}
                      rotation={[0, 0, Math.PI / 2]}
                    >
                      <boxGeometry args={[0.02, 0.05, WHEEL_R * 0.4]} />
                      <meshStandardMaterial color="#8a9096" metalness={0.8} roughness={0.35} />
                    </mesh>
                  ))}
              </group>
            </group>
          )
        })}

        {/* Lights: real lenses, each an emissive the traffic system drives. */}
        {[-1, 1].map((s) => (
          <mesh key={`h${s}`} position={[s * WID * 0.35, 0.62, LEN / 2 - 0.06]} rotation={[0.1, 0, 0]}>
            <boxGeometry args={[0.3, 0.13, 0.06]} />
            <meshStandardMaterial
              ref={(m) => { if (m) head.current.push(m) }}
              color="#e8eef2"
              emissive="#fff2d0"
              emissiveIntensity={0}
              roughness={0.12}
              metalness={0.1}
            />
          </mesh>
        ))}
        {[-1, 1].map((s) => (
          <mesh key={`t${s}`} position={[s * WID * 0.36, 0.68, -LEN / 2 + 0.05]}>
            <boxGeometry args={[0.3, 0.15, 0.05]} />
            <meshStandardMaterial
              ref={(m) => { if (m) brake.current.push(m) }}
              color="#8b2723"
              emissive="#ff2a1c"
              emissiveIntensity={0.25}
              roughness={0.3}
            />
          </mesh>
        ))}
        {[-1, 1].map((s) => (
          <mesh key={`i${s}`} position={[s * WID * 0.46, 0.62, LEN / 2 - 0.28]}>
            <boxGeometry args={[0.06, 0.1, 0.16]} />
            <meshStandardMaterial
              ref={(m) => { if (m) indicator.current.push(m) }}
              color="#a2681d"
              emissive="#ffa022"
              emissiveIntensity={0}
              roughness={0.3}
            />
          </mesh>
        ))}

        {/* Mirrors and shut lines — small, and the first things missing from a
            box with wheels. */}
        {detail &&
          [-1, 1].map((s) => (
            <mesh key={`m${s}`} position={[s * WID * 0.5, 1.0, 0.62]} rotation={[0, 0, s * 0.3]}>
              <boxGeometry args={[0.16, 0.09, 0.06]} />
              <meshStandardMaterial {...paint} />
            </mesh>
          ))}
        {detail &&
          [-1, 1].map((s) =>
            [-0.35, 0.85].map((z) => (
              <mesh key={`d${s}${z}`} position={[s * WID * 0.505, 0.72, z]}>
                <boxGeometry args={[0.01, 0.5, 0.012]} />
                <meshStandardMaterial color="#101215" roughness={0.9} />
              </mesh>
            )),
          )}
      </group>
    )
  },
)
