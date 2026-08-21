import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Panel } from '../../furniture/Panel'
import { useSwing } from '../../furniture/useSwing'
import { useOpenable, useAppliance } from '../../../systems/world'

const CAB_DOOR = '#c3bdaf'
const CARCASS_IN = '#a49e93'
const METAL = '#c9ccd0'
const HANDLE = '#b0aa9c'

// The working parts of the kitchen. Everything here is driven by the SHARED
// world state, so a cupboard CUMA leaves open is open for ZEYNEP, and stays
// open when either of them comes back.
//
// Contents are only built while the thing is open: a cupboard's worth of pans
// is geometry nobody can see the rest of the time.
//
// GEOMETRY CONVENTION — the counter run stands against the north wall (z = 14)
// with the room to the SOUTH of it, so every unit's FRONT is its local -Z face
// and everything opens toward -Z. Get this backwards and the door fronts end up
// behind the carcass: the run reads as one blank slab and opening a cupboard
// shows nothing.
export const FRONT = -0.3 // local z of a base unit's door plane
const BODY_Y = 0.48 // centre height of the carcass (0.08 .. 0.88)
const BODY_H = 0.8
const BODY_D = 0.56

// The liner that makes a unit a box you can see into. The run's carcass is
// built with a VOID at each working unit precisely so this is what is behind
// the door instead of the outside of a solid block.
function Liner({ w, color = CARCASS_IN }: { w: number; color?: string }) {
  return (
    <mesh position={[0, BODY_Y, 0.02]}>
      <boxGeometry args={[w, BODY_H, BODY_D]} />
      <meshStandardMaterial color={color} roughness={0.85} side={THREE.BackSide} />
    </mesh>
  )
}

// ---- Lower cupboard, doors hinged at their outer edges ---------------------
export function LowerCupboard({ id, position }: { id: string; position: [number, number, number] }) {
  const open = useOpenable(id)
  const left = useSwing(id, 1.75, 'rotY')
  const right = useSwing(id, -1.75, 'rotY')

  return (
    <group position={position}>
      <Liner w={1.32} />
      {open && (
        <group>
          <mesh position={[0, 0.46, 0.02]}>
            <boxGeometry args={[1.28, 0.02, 0.5]} />
            <meshStandardMaterial color="#b3ada2" roughness={0.7} />
          </mesh>
          {/* a stacked pan and a pot — what is actually in a base unit */}
          <group position={[-0.32, 0.53, 0.02]}>
            <mesh>
              <cylinderGeometry args={[0.15, 0.13, 0.11, 18]} />
              <meshStandardMaterial color="#4a4d52" metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh position={[0, -0.01, -0.24]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.18, 8]} />
              <meshStandardMaterial color="#2b2d31" roughness={0.6} />
            </mesh>
          </group>
          <mesh position={[0.3, 0.19, 0.02]}>
            <cylinderGeometry args={[0.17, 0.16, 0.16, 18]} />
            <meshStandardMaterial color="#5a5d62" metalness={0.55} roughness={0.45} />
          </mesh>
          <mesh position={[0.3, 0.29, 0.02]}>
            <cylinderGeometry args={[0.165, 0.165, 0.015, 18]} />
            <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.3} />
          </mesh>
          {/* washing-up bottle and a cloth, because this is the sink base */}
          <mesh position={[-0.05, 0.6, 0.02]}>
            <cylinderGeometry args={[0.038, 0.045, 0.2, 12]} />
            <meshStandardMaterial color="#5f9c7a" roughness={0.4} />
          </mesh>
        </group>
      )}
      {/* doors: hinged at the outer edge of each leaf, swinging into the room */}
      <group ref={left} position={[-0.65, BODY_Y, FRONT]}>
        <Panel args={[0.62, 0.72, 0.022]} radius={0.008} position={[0.33, 0, 0]} castShadow>
          <meshStandardMaterial color={CAB_DOOR} roughness={0.58} metalness={0.04} />
        </Panel>
        <mesh position={[0.58, 0, -0.02]}>
          <cylinderGeometry args={[0.008, 0.008, 0.16, 8]} />
          <meshStandardMaterial color={HANDLE} metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
      <group ref={right} position={[0.65, BODY_Y, FRONT]}>
        <Panel args={[0.62, 0.72, 0.022]} radius={0.008} position={[-0.33, 0, 0]} castShadow>
          <meshStandardMaterial color={CAB_DOOR} roughness={0.58} metalness={0.04} />
        </Panel>
        <mesh position={[-0.58, 0, -0.02]}>
          <cylinderGeometry args={[0.008, 0.008, 0.16, 8]} />
          <meshStandardMaterial color={HANDLE} metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </group>
  )
}

// ---- Cutlery drawer over a cupboard door, slides out ------------------------
export function Drawer({ id, position }: { id: string; position: [number, number, number] }) {
  const open = useOpenable(id)
  const slide = useSwing(id, -0.42, 'slideZ', 8)

  return (
    <group position={position}>
      <Liner w={0.64} />
      {/* the drawer itself rides in the void; the liner stays put */}
      <group ref={slide} position={[0, 0.7, 0]}>
        <mesh position={[0, 0, -0.06]}>
          <boxGeometry args={[0.58, 0.16, 0.44]} />
          <meshStandardMaterial color="#b3ada2" roughness={0.8} side={THREE.BackSide} />
        </mesh>
        {open && (
          <group position={[0, -0.03, -0.06]}>
            {/* a cutlery tray with knives, forks and spoons in their slots */}
            <mesh>
              <boxGeometry args={[0.52, 0.03, 0.38]} />
              <meshStandardMaterial color="#8d8578" roughness={0.9} />
            </mesh>
            {[-0.17, -0.06, 0.06, 0.17].map((x, i) => (
              <group key={i}>
                {[0, 1, 2].map((j) => (
                  <mesh key={j} position={[x + (j - 1) * 0.012, 0.03, -0.03 + j * 0.01]} rotation={[0, 0.04 * j, 0]}>
                    <boxGeometry args={[0.014, 0.008, 0.16]} />
                    <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.28} />
                  </mesh>
                ))}
              </group>
            ))}
          </group>
        )}
        {/* front */}
        <Panel args={[0.62, 0.2, 0.022]} radius={0.008} position={[0, 0, FRONT + 0.01]} castShadow>
          <meshStandardMaterial color={CAB_DOOR} roughness={0.58} metalness={0.04} />
        </Panel>
        <mesh position={[0, 0, FRONT - 0.015]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.008, 0.008, 0.3, 8]} />
          <meshStandardMaterial color={HANDLE} metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
      {/* fixed door below the drawer, so the bay is not half-open carcass */}
      <Panel args={[0.62, 0.48, 0.022]} radius={0.008} position={[0, 0.34, FRONT]}>
        <meshStandardMaterial color={CAB_DOOR} roughness={0.58} metalness={0.04} />
      </Panel>
      <mesh position={[0, 0.52, FRONT - 0.02]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.008, 0.008, 0.28, 8]} />
        <meshStandardMaterial color={HANDLE} metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  )
}

// ---- Oven: the door drops forward on a hinge at its base --------------------
export function Oven({ id, position }: { id: string; position: [number, number, number] }) {
  const open = useOpenable(id)
  const door = useSwing(id, -1.5, 'rotX')

  return (
    <group position={position}>
      {/* enamel cavity, set back behind the door plane */}
      <mesh position={[0, 0.38, 0]}>
        <boxGeometry args={[0.6, 0.6, 0.54]} />
        <meshStandardMaterial color="#2a2c30" roughness={0.6} side={THREE.BackSide} />
      </mesh>
      {/* solid block behind the control fascia, so nothing shows through */}
      <mesh position={[0, 0.78, 0.02]}>
        <boxGeometry args={[0.62, 0.2, 0.56]} />
        <meshStandardMaterial color="#3a3d42" roughness={0.6} />
      </mesh>
      {open && (
        <group position={[0, 0.38, 0]}>
          {/* two wire shelves: bars running front-to-back in a rail frame */}
          {[-0.16, 0.1].map((y, i) => (
            <group key={i} position={[0, y, 0]}>
              {Array.from({ length: 7 }).map((_, j) => (
                <mesh key={j} position={[-0.24 + j * 0.08, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.005, 0.005, 0.48, 6]} />
                  <meshStandardMaterial color="#9aa0a6" metalness={0.7} roughness={0.4} />
                </mesh>
              ))}
              {[-0.23, 0.23].map((z, k) => (
                <mesh key={k} position={[0, 0, z]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.007, 0.007, 0.54, 6]} />
                  <meshStandardMaterial color="#9aa0a6" metalness={0.7} roughness={0.4} />
                </mesh>
              ))}
            </group>
          ))}
          <pointLight position={[0, 0.18, -0.1]} color="#ffc98a" intensity={0.45} distance={1.6} decay={2} />
        </group>
      )}
      {/* door, hinged along its bottom edge, dropping forward into the room */}
      <group ref={door} position={[0, 0.09, FRONT]}>
        <Panel args={[0.6, 0.62, 0.05]} radius={0.012} position={[0, 0.31, 0]} castShadow>
          <meshStandardMaterial color="#3a3d42" metalness={0.5} roughness={0.35} />
        </Panel>
        {/* glass window */}
        <mesh position={[0, 0.32, -0.028]}>
          <boxGeometry args={[0.44, 0.36, 0.01]} />
          <meshPhysicalMaterial color="#20242a" transparent opacity={0.62} roughness={0.15} transmission={0.35} thickness={0.02} />
        </mesh>
        <mesh position={[0, 0.58, -0.05]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.014, 0.014, 0.54, 10]} />
          <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.28} />
        </mesh>
      </group>
      {/* fixed control fascia above the door, with real knobs */}
      <Panel args={[0.6, 0.15, 0.03]} radius={0.008} position={[0, 0.79, FRONT]}>
        <meshStandardMaterial color="#33363b" metalness={0.4} roughness={0.4} />
      </Panel>
      {[-0.22, -0.075, 0.075, 0.22].map((x, i) => (
        <mesh key={i} position={[x, 0.79, FRONT - 0.03]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.024, 0.03, 12]} />
          <meshStandardMaterial color="#1b1d21" metalness={0.4} roughness={0.45} />
        </mesh>
      ))}
    </group>
  )
}

// ---- Microwave, standing on the worktop -------------------------------------
export function Microwave({ id, position }: { id: string; position: [number, number, number] }) {
  const open = useOpenable(id)
  const door = useSwing(id, 2.1, 'rotY')

  return (
    <group position={position}>
      <mesh position={[0, 0, 0.02]} castShadow>
        <boxGeometry args={[0.5, 0.28, 0.34]} />
        <meshStandardMaterial color="#1e2024" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* control strip on the front face, to the right of the door */}
      <mesh position={[0.19, 0, -0.155]}>
        <boxGeometry args={[0.1, 0.24, 0.01]} />
        <meshStandardMaterial color="#33363b" roughness={0.5} />
      </mesh>
      {open && (
        <group position={[-0.06, 0, 0.02]}>
          <mesh>
            <boxGeometry args={[0.34, 0.24, 0.3]} />
            <meshStandardMaterial color="#c9ccd0" roughness={0.5} side={THREE.BackSide} />
          </mesh>
          <mesh position={[0, -0.11, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.01, 20]} />
            <meshPhysicalMaterial color="#dfe5e8" roughness={0.15} transmission={0.4} thickness={0.02} />
          </mesh>
          <pointLight position={[0, 0.05, -0.06]} color="#ffe9c4" intensity={0.3} distance={1.1} decay={2} />
        </group>
      )}
      <group ref={door} position={[-0.25, 0, -0.15]}>
        <mesh position={[0.19, 0, 0]}>
          <boxGeometry args={[0.38, 0.26, 0.02]} />
          <meshStandardMaterial color="#26292e" roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh position={[0.18, 0, -0.012]}>
          <boxGeometry args={[0.28, 0.18, 0.008]} />
          <meshPhysicalMaterial color="#1b1f24" transparent opacity={0.6} roughness={0.2} transmission={0.3} thickness={0.02} />
        </mesh>
      </group>
    </group>
  )
}

// ---- Kettle: switch on and it lights up and steams --------------------------
export function Kettle({ id, position }: { id: string; position: [number, number, number] }) {
  const on = useAppliance(id)
  const steam = useRef<THREE.Group>(null)
  const t = useRef(0)

  useFrame((_, delta) => {
    t.current += delta
    const g = steam.current
    if (!g) return
    g.visible = on
    if (!on) return
    // A slow, rising wisp rather than a particle system.
    g.children.forEach((c, i) => {
      const p = (t.current * 0.32 + i * 0.33) % 1
      c.position.y = 0.12 + p * 0.34
      c.scale.setScalar(0.5 + p * 1.4)
      const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial
      m.opacity = 0.24 * (1 - p)
    })
  })

  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.075, 0.085, 0.22, 16]} />
        <meshStandardMaterial color="#2a2d33" metalness={0.45} roughness={0.4} />
      </mesh>
      {/* spout + handle, so it is a kettle and not a can */}
      <mesh position={[0.08, 0.06, 0]} rotation={[0, 0, -0.6]}>
        <cylinderGeometry args={[0.018, 0.026, 0.12, 10]} />
        <meshStandardMaterial color="#2a2d33" metalness={0.45} roughness={0.4} />
      </mesh>
      <mesh position={[-0.1, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.06, 0.011, 6, 14, Math.PI]} />
        <meshStandardMaterial color="#1e2126" roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.115, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.02, 16]} />
        <meshStandardMaterial color="#3a3d42" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* the switch light: the whole point of turning it on */}
      <mesh position={[-0.03, -0.06, -0.07]}>
        <boxGeometry args={[0.03, 0.02, 0.012]} />
        <meshStandardMaterial
          color={on ? '#ff9c6a' : '#4a4d52'}
          emissive={on ? '#ff7a3a' : '#000000'}
          emissiveIntensity={on ? 1.1 : 0}
          roughness={0.4}
        />
      </mesh>
      <group ref={steam} visible={false}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0.08, 0.14, 0]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color="#e8eef2" transparent opacity={0.2} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// ---- Hob: burners glow when it is on ---------------------------------------
export function Hob({ id, position }: { id: string; position: [number, number, number] }) {
  const on = useAppliance(id)
  return (
    <group position={position}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.62, 0.02, 0.5]} />
        <meshStandardMaterial color="#15161a" roughness={0.4} metalness={0.3} />
      </mesh>
      {[-0.13, 0.13].map((z) =>
        [-0.14, 0.14].map((x) => (
          <group key={`${x}-${z}`} position={[x, 0.011, z]}>
            <mesh>
              <torusGeometry args={[0.07, 0.008, 6, 16]} />
              <meshStandardMaterial color="#2a2a2e" roughness={0.5} />
            </mesh>
            {/* the ring itself glows, not the whole hob */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.052, 0.078, 20]} />
              <meshStandardMaterial
                color={on ? '#c8502a' : '#1b1c20'}
                emissive={on ? '#e0511f' : '#000000'}
                emissiveIntensity={on ? 1.3 : 0}
                roughness={0.6}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )),
      )}
      {on && <pointLight position={[0, 0.08, 0]} color="#ff8a4a" intensity={0.35} distance={1.4} decay={2} />}
    </group>
  )
}

// ---- Tap: a real stream while it runs --------------------------------------
export function Tap({ id, position }: { id: string; position: [number, number, number] }) {
  const on = useAppliance(id)
  const water = useRef<THREE.Mesh>(null)
  const t = useRef(0)

  useFrame((_, delta) => {
    t.current += delta
    const m = water.current
    if (!m) return
    m.visible = on
    if (!on) return
    // Wobble the stream very slightly, so it reads as moving water rather than
    // a glass rod standing in the sink.
    m.scale.x = 1 + Math.sin(t.current * 22) * 0.06
    m.scale.z = 1 + Math.cos(t.current * 19) * 0.06
  })

  return (
    <group position={position}>
      {/* base flange where it meets the worktop */}
      <mesh position={[0, 0.01, 0.06]}>
        <cylinderGeometry args={[0.035, 0.038, 0.03, 14]} />
        <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.28} />
      </mesh>
      {/* riser, then a gooseneck arching forward over the bowl */}
      <mesh position={[0, 0.11, 0.06]}>
        <cylinderGeometry args={[0.018, 0.021, 0.2, 12]} />
        <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.22} />
      </mesh>
      <mesh position={[0, 0.21, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.06, 0.018, 8, 18, Math.PI]} />
        <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.22} />
      </mesh>
      {/* spout tip, pointing down into the bowl */}
      <mesh position={[0, 0.185, -0.06]}>
        <cylinderGeometry args={[0.014, 0.017, 0.06, 10]} />
        <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.22} />
      </mesh>
      {/* mixer lever — it actually lifts when the tap is running */}
      <mesh position={[0.02, 0.2, 0.09]} rotation={[on ? -0.6 : 0, 0, 0.35]}>
        <cylinderGeometry args={[0.009, 0.009, 0.09, 8]} />
        <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh ref={water} position={[0, 0.0, -0.06]} visible={false}>
        <cylinderGeometry args={[0.008, 0.012, 0.32, 8]} />
        <meshPhysicalMaterial color="#cfe4ee" transparent opacity={0.42} roughness={0.06} transmission={0.8} thickness={0.02} />
      </mesh>
    </group>
  )
}
