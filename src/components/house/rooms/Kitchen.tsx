import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCollider } from '../../furniture/useCollider'
import { useOpenable, useAppliance } from '../../../systems/world'
import { LowerCupboard, Drawer, Oven, Hob, Microwave, Kettle, Tap, FRONT } from './KitchenUnits'
import { CeilingLamp, Plant } from '../props'
import { WindowDaylight } from '../Window'
import { Panel } from '../../furniture/Panel'

const CAB = '#aca69a' // carcass, a shade darker than the doors so seams read
const DOOR = '#c3bdaf' // matte door front
const STONE = '#3a3d42' // dark stone counter
const METAL = '#c9ccd0'

// The counter run against the north wall. It stops at x 6.9, short of the
// storage doorway at 7.0. Every span of it is either a working unit or a fixed
// door bay: a bare carcass front reads as one blank slab.
const RUN = { x: 4.3, z: 13.55, w: 5.2, d: 0.6 } // 1.70 .. 6.90
const FRONT_Z = RUN.z + FRONT // world z of the door plane

// Working units sit in VOIDS in the carcass and bring their own liner, so
// opening one shows an interior instead of the outside of a solid block.
const CUPBOARD_X = 2.65 // void 1.99 .. 3.31
const DRAWER_X = 4.3 // void 3.98 .. 4.62
const OVEN_X = 5.7 // void 5.39 .. 6.01

// [centre x, width] — the carcass segments between those voids.
const CARCASS: [number, number][] = [
  [1.845, 0.29], // west end filler
  [3.645, 0.67],
  [5.005, 0.77],
  [6.455, 0.89], // east end
]

// [centre x, width, kind] — the fixed door fronts on those segments.
const FIXED_BAYS: [number, number, 'doors' | 'drawers'][] = [
  [3.645, 0.6, 'doors'],
  [5.005, 0.7, 'drawers'],
  [6.455, 0.82, 'doors'],
]

// Sink cut-out, and the four worktop slabs that go round it. There is no CSG
// here, so a hole in the stone has to be built as the gap between segments —
// otherwise the slab caps the bowl and the tap pours onto a solid surface.
const SINK = { x: 3.0, z: 13.57, w: 0.58, d: 0.44 }
const TOP_Z0 = RUN.z - 0.02 - (RUN.d + 0.06) / 2
const TOP_Z1 = RUN.z - 0.02 + (RUN.d + 0.06) / 2
const TOP_X0 = RUN.x - RUN.w / 2 - 0.05
const TOP_X1 = RUN.x + RUN.w / 2 + 0.05
const span = (a: number, b: number): [number, number] => [(a + b) / 2, b - a]
// [centre x, centre z, width, depth]
const WORKTOP: [number, number, number, number][] = [
  [...span(TOP_X0, SINK.x - SINK.w / 2), ...span(TOP_Z0, TOP_Z1)],
  [...span(SINK.x + SINK.w / 2, TOP_X1), ...span(TOP_Z0, TOP_Z1)],
  [...span(SINK.x - SINK.w / 2, SINK.x + SINK.w / 2), ...span(TOP_Z0, SINK.z - SINK.d / 2)],
  [...span(SINK.x - SINK.w / 2, SINK.x + SINK.w / 2), ...span(SINK.z + SINK.d / 2, TOP_Z1)],
].map(([x, w, z, d]) => [x, z, w, d])

// A fixed door front with a handle: no state, but real joinery rather than a
// seam painted onto a blank panel.
function DoorFront({ x, y, w, h, handleAt }: { x: number; y: number; w: number; h: number; handleAt: number }) {
  const vertical = handleAt !== 0
  return (
    <group>
      <Panel args={[w, h, 0.022]} radius={0.008} position={[x, y, FRONT_Z]}>
        <meshStandardMaterial color={DOOR} roughness={0.58} metalness={0.04} />
      </Panel>
      <mesh
        position={[x + handleAt, y, FRONT_Z - 0.02]}
        rotation={vertical ? [0, 0, 0] : [0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.008, 0.008, vertical ? 0.16 : w * 0.45, 8]} />
        <meshStandardMaterial color="#b0aa9c" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  )
}

function FixedBay({ x, w, kind }: { x: number; w: number; kind: 'doors' | 'drawers' }) {
  if (kind === 'drawers') {
    // A three-drawer stack, deepest at the bottom, as they are built.
    return (
      <group>
        {([[0.74, 0.18], [0.5, 0.26], [0.22, 0.26]] as [number, number][]).map(([y, h], i) => (
          <DoorFront key={i} x={x} y={y} w={w} h={h} handleAt={0} />
        ))}
      </group>
    )
  }
  const half = (w - 0.03) / 2
  return (
    <group>
      {[-1, 1].map((s, i) => (
        <DoorFront key={i} x={x + s * (half + 0.015) / 2} y={0.48} w={half} h={0.72} handleAt={-s * (half / 2 - 0.045)} />
      ))}
    </group>
  )
}

// The hood's two downlights come on with the hob — you run the extractor
// because you are cooking. No separate switch to fake, and no light burning for
// no reason.
function HoodLights() {
  const cooking = useAppliance('kitchen-hob')
  return (
    <group>
      {[-0.2, 0.2].map((x, i) => (
        <mesh key={i} position={[x, 1.482, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.008, 12]} />
          <meshStandardMaterial
            color={cooking ? '#ffe9c4' : '#8e949a'}
            emissive={cooking ? '#ffd79a' : '#000000'}
            emissiveIntensity={cooking ? 1.4 : 0}
            roughness={0.4}
          />
        </mesh>
      ))}
      {cooking && <pointLight position={[0, 1.42, -0.06]} color="#ffe2b4" intensity={0.55} distance={2.4} decay={2} />}
    </group>
  )
}

// The fridge opens for real: the door swings on its hinge, a cold interior
// light comes up, and what is inside is only built while it is open. The open
// state lives in the SHARED world, so if CUMA opens it ZEYNEP sees it standing
// open — and it is still open when either of them comes back.
function Fridge() {
  const open = useOpenable('kitchen-fridge')
  const door = useRef<THREE.Group>(null)
  const swing = useRef(0)

  useFrame((_, delta) => {
    const target = open ? -1.95 : 0 // radians; opens toward the room
    swing.current += (target - swing.current) * Math.min(1, delta * 7)
    if (door.current) door.current.rotation.y = swing.current
  })

  return (
    <group position={[9.0, 0, 12.6]}>
      {/* carcass */}
      <Panel args={[0.78, 2, 0.76]} radius={0.02} position={[0, 1, -0.02]} receiveShadow>
        <meshStandardMaterial color="#c8ccd0" metalness={0.45} roughness={0.4} />
      </Panel>
      {/* interior — only built while the door is open */}
      {open && (
        <group position={[0, 1, 0]}>
          <mesh position={[0, 0, -0.02]}>
            <boxGeometry args={[0.68, 1.84, 0.62]} />
            <meshStandardMaterial color="#e8edf0" roughness={0.55} />
          </mesh>
          {[-0.55, -0.1, 0.36].map((y, i) => (
            <mesh key={i} position={[0, y, 0]}>
              <boxGeometry args={[0.66, 0.02, 0.6]} />
              <meshPhysicalMaterial color="#dfe8ec" transparent opacity={0.5} roughness={0.15} transmission={0.5} thickness={0.02} />
            </mesh>
          ))}
          {/* what is actually in it */}
          <mesh position={[-0.18, -0.44, 0.04]}>
            <cylinderGeometry args={[0.045, 0.045, 0.2, 12]} />
            <meshStandardMaterial color="#8fb6d8" roughness={0.3} />
          </mesh>
          <mesh position={[-0.04, -0.44, 0.04]}>
            <cylinderGeometry args={[0.04, 0.04, 0.18, 12]} />
            <meshStandardMaterial color="#eceae2" roughness={0.5} />
          </mesh>
          <mesh position={[0.16, 0.02, 0.02]}>
            <boxGeometry args={[0.16, 0.1, 0.14]} />
            <meshStandardMaterial color="#c9a04a" roughness={0.6} />
          </mesh>
          {[[-0.2, 0.06], [-0.08, 0.44], [0.12, 0.46]].map(([x, y], i) => (
            <mesh key={i} position={[x, y, -0.06]}>
              <sphereGeometry args={[0.05, 10, 10]} />
              <meshStandardMaterial color={['#b8474a', '#7ba24c', '#d8952f'][i]} roughness={0.65} />
            </mesh>
          ))}
          <pointLight position={[0, 0.3, 0.1]} color="#dff0ff" intensity={0.5} distance={2.2} decay={2} />
        </group>
      )}
      {/* door, hinged on its left edge */}
      <group ref={door} position={[-0.39, 1, 0.34]}>
        <Panel args={[0.78, 1.98, 0.07]} radius={0.02} position={[0.39, 0, 0]} castShadow>
          <meshStandardMaterial color="#d0d3d6" metalness={0.5} roughness={0.35} />
        </Panel>
        <mesh position={[0.72, 0.4, 0.06]}>
          <boxGeometry args={[0.03, 0.5, 0.03]} />
          <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.72, -0.4, 0.06]}>
          <boxGeometry args={[0.03, 0.5, 0.03]} />
          <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </group>
  )
}

// Kitchen — matte cabinets, a stone counter run with sink + cooktop + hood, a
// tall fridge, a small dining set. Neutral working light. Stone/metal/wood.
export function Kitchen() {
  useCollider('kit-counter', [RUN.x, 0, RUN.z], [RUN.w, 0.95, RUN.d + 0.1])
  useCollider('kit-fridge', [9.0, 0, 12.6], [0.8, 2, 0.8])
  useCollider('kit-table', [4.6, 0, 8.6], [1.3, 0.75, 0.9])

  return (
    <group>
      <CeilingLamp position={[5.5, 2.58, 10]} color="#fff2df" intensity={1.3} shade="#e8e6e0" />
      <CeilingLamp position={[4.6, 2.58, 8.6]} color="#fff2df" intensity={0.85} shade="#e8e6e0" />
      {/* Daylight through the east window */}
      <WindowDaylight position={[8.85, 1.6, 8.4]} />

      {/* ---- Counter run along the north wall; fronts face -Z, into the room */}
      {/* carcass, in segments with voids where the working units go */}
      {CARCASS.map(([x, w], i) => (
        <Panel key={i} args={[w, 0.8, RUN.d]} radius={0.012} position={[x, 0.48, RUN.z]} receiveShadow>
          <meshStandardMaterial color={CAB} roughness={0.68} metalness={0.04} />
        </Panel>
      ))}
      {/* toe kick — recessed and dark, so the run sits on the floor instead of
          floating in a pool of its own colour */}
      <mesh position={[RUN.x, 0.04, RUN.z + 0.04]}>
        <boxGeometry args={[RUN.w - 0.04, 0.08, RUN.d - 0.08]} />
        <meshStandardMaterial color="#4e4a44" roughness={0.85} />
      </mesh>
      {/* stone worktop in four slabs around the sink cut-out */}
      {WORKTOP.map(([x, z, w, d], i) => (
        <Panel key={i} args={[w, 0.06, d]} radius={0.012} position={[x, 0.9, z]} receiveShadow>
          <meshStandardMaterial color={STONE} roughness={0.35} metalness={0.1} />
        </Panel>
      ))}
      {/* lighter front edge, to catch the light along the whole run */}
      <mesh position={[RUN.x, 0.9, TOP_Z0 - 0.002]}>
        <boxGeometry args={[RUN.w + 0.1, 0.055, 0.006]} />
        <meshStandardMaterial color="#565a61" roughness={0.28} metalness={0.2} />
      </mesh>
      {FIXED_BAYS.map(([x, w, kind], i) => (
        <FixedBay key={i} x={x} w={w} kind={kind} />
      ))}

      {/* Sink: a real bowl under the hole in the worktop */}
      <group position={[SINK.x, 0, SINK.z]}>
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[SINK.w, 0.22, SINK.d]} />
          <meshStandardMaterial color="#aeb3b8" metalness={0.8} roughness={0.3} side={THREE.BackSide} />
        </mesh>
        {/* stainless rim lining the cut-out */}
        {[-1, 1].map((s, i) => (
          <mesh key={i} position={[s * (SINK.w / 2 - 0.012), 0.92, 0]}>
            <boxGeometry args={[0.024, 0.03, SINK.d]} />
            <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.25} />
          </mesh>
        ))}
        {[-1, 1].map((s, i) => (
          <mesh key={i} position={[0, 0.92, s * (SINK.d / 2 - 0.012)]}>
            <boxGeometry args={[SINK.w, 0.03, 0.024]} />
            <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.25} />
          </mesh>
        ))}
        <mesh position={[0, 0.695, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.012, 12]} />
          <meshStandardMaterial color="#7d838a" metalness={0.8} roughness={0.35} />
        </mesh>
        {/* draining grooves cut into the stone beside the bowl */}
        {[-0.42, -0.5, -0.58].map((x, i) => (
          <mesh key={i} position={[x, 0.932, -0.02]}>
            <boxGeometry args={[0.022, 0.006, 0.34]} />
            <meshStandardMaterial color="#2c2f34" roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* chopping board left out on the worktop */}
      <mesh position={[4.0, 0.945, 13.5]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.3, 0.024, 0.2]} />
        <meshStandardMaterial color="#8a6a4a" roughness={0.7} />
      </mesh>

      {/* Tiled splashback: the wall behind a worktop is never bare plaster, and
          it breaks up the largest flat span in the room. */}
      <group position={[RUN.x, 1.19, 13.965]}>
        <mesh>
          <boxGeometry args={[RUN.w, 0.52, 0.014]} />
          <meshStandardMaterial color="#b9beb9" roughness={0.28} metalness={0.06} />
        </mesh>
        <mesh position={[0, 0, -0.009]}>
          <boxGeometry args={[RUN.w, 0.008, 0.004]} />
          <meshStandardMaterial color="#9aa09a" roughness={0.6} />
        </mesh>
        {Array.from({ length: 17 }).map((_, i) => (
          <mesh key={i} position={[-RUN.w / 2 + (i + 1) * (RUN.w / 18), 0, -0.009]}>
            <boxGeometry args={[0.008, 0.52, 0.004]} />
            <meshStandardMaterial color="#9aa09a" roughness={0.6} />
          </mesh>
        ))}
      </group>

      {/* Extractor hood over the hob: a tapered canopy on a chimney that
          actually reaches the ceiling, with a filter and two downlights. */}
      <group position={[OVEN_X, 0, 13.7]}>
        <mesh position={[0, 1.62, 0]} castShadow>
          <cylinderGeometry args={[0.28, 0.44, 0.22, 4, 1, false, Math.PI / 4]} />
          <meshStandardMaterial color="#b9bcc0" metalness={0.7} roughness={0.32} />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[0.68, 0.03, 0.48]} />
          <meshStandardMaterial color="#40444a" roughness={0.5} metalness={0.4} />
        </mesh>
        {[-0.16, 0, 0.16].map((x, i) => (
          <mesh key={i} position={[x, 1.487, 0]}>
            <boxGeometry args={[0.12, 0.008, 0.4]} />
            <meshStandardMaterial color="#8e949a" metalness={0.65} roughness={0.4} />
          </mesh>
        ))}
        {/* chimney, running all the way up to the 2.7 ceiling */}
        <mesh position={[0, 2.21, 0.07]}>
          <boxGeometry args={[0.3, 0.96, 0.26]} />
          <meshStandardMaterial color="#b9bcc0" metalness={0.7} roughness={0.32} />
        </mesh>
        <HoodLights />
      </group>

      {/* Wall units, backs against the wall rather than floating off it */}
      <Panel args={[2.5, 0.62, 0.34]} radius={0.012} position={[3.0, 1.78, 13.8]}>
        <meshStandardMaterial color={CAB} roughness={0.68} />
      </Panel>
      <mesh position={[3.0, 2.11, 13.79]}>
        <boxGeometry args={[2.56, 0.05, 0.38]} />
        <meshStandardMaterial color="#9a948a" roughness={0.7} />
      </mesh>
      {[2.4, 3.6].map((x, i) => (
        <group key={i}>
          <Panel args={[1.22, 0.58, 0.022]} radius={0.008} position={[x, 1.78, 13.622]}>
            <meshStandardMaterial color={DOOR} roughness={0.58} />
          </Panel>
          <mesh position={[x + (i ? -0.53 : 0.53), 1.62, 13.6]}>
            <cylinderGeometry args={[0.008, 0.008, 0.16, 8]} />
            <meshStandardMaterial color="#b0aa9c" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      ))}
      {/* open shelving beside them, rather than a second identical white box */}
      {[1.5, 1.86].map((y, i) => (
        <mesh key={i} position={[6.4, y, 13.82]} receiveShadow>
          <boxGeometry args={[0.9, 0.035, 0.28]} />
          <meshStandardMaterial color="#6b5540" roughness={0.7} />
        </mesh>
      ))}
      {[-0.28, -0.1, 0.08].map((dx, i) => (
        <mesh key={i} position={[6.4 + dx, 1.565, 13.82]}>
          <cylinderGeometry args={[0.042, 0.038, 0.09, 12]} />
          <meshStandardMaterial color={['#c8c2b4', '#9aa8ae', '#c2a48a'][i]} roughness={0.55} />
        </mesh>
      ))}
      {[-0.24, -0.02, 0.2].map((dx, i) => (
        <mesh key={i} position={[6.4 + dx, 1.948, 13.82]}>
          <cylinderGeometry args={[0.05, 0.05, 0.14, 12]} />
          <meshStandardMaterial color="#8f9a86" roughness={0.4} metalness={0.05} />
        </mesh>
      ))}

      {/* ---- The parts of the kitchen that actually work ------------------- */}
      <LowerCupboard id="kitchen-cupboard" position={[CUPBOARD_X, 0, RUN.z]} />
      <Drawer id="kitchen-drawer" position={[DRAWER_X, 0, RUN.z]} />
      <Oven id="kitchen-oven" position={[OVEN_X, 0, RUN.z]} />
      <Hob id="kitchen-hob" position={[OVEN_X, 0.945, RUN.z - 0.02]} />
      <Microwave id="kitchen-microwave" position={[6.45, 1.11, RUN.z + 0.06]} />
      <Kettle id="kitchen-kettle" position={[2.1, 1.04, RUN.z]} />
      <Tap id="kitchen-tap" position={[SINK.x, 0.93, RUN.z + 0.16]} />

      <Fridge />

      {/* dining set */}
      <group position={[4.6, 0, 8.6]}>
        <Panel args={[1.3, 0.055, 0.85]} radius={0.016} position={[0, 0.72, 0]} receiveShadow>
          <meshStandardMaterial color="#5a4632" roughness={0.5} />
        </Panel>
        {[[-0.55, -0.32], [0.55, -0.32], [-0.55, 0.32], [0.55, 0.32]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.36, z]}>
            <boxGeometry args={[0.06, 0.72, 0.06]} />
            <meshStandardMaterial color="#4a3826" roughness={0.5} />
          </mesh>
        ))}
        {/* two chairs */}
        {[[-0.1, 0.7, 0], [0.2, -0.7, Math.PI]].map(([x, z, ry], i) => (
          <group key={i} position={[x, 0, z]} rotation={[0, ry as number, 0]}>
            <Panel args={[0.42, 0.05, 0.42]} radius={0.014} position={[0, 0.45, 0]}>
              <meshStandardMaterial color="#5a4632" roughness={0.55} />
            </Panel>
            <Panel args={[0.42, 0.5, 0.05]} radius={0.018} position={[0, 0.7, -0.19]} rotation={[0.06, 0, 0]}>
              <meshStandardMaterial color="#5a4632" roughness={0.55} />
            </Panel>
            {[[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].map(([lx, lz], j) => (
              <mesh key={j} position={[lx, 0.22, lz]}>
                <boxGeometry args={[0.04, 0.45, 0.04]} />
                <meshStandardMaterial color="#3a2c1c" roughness={0.6} />
              </mesh>
            ))}
          </group>
        ))}
        {/* plates + fruit bowl on the table */}
        <mesh position={[0, 0.76, 0]}>
          <cylinderGeometry args={[0.16, 0.14, 0.04, 20]} />
          <meshStandardMaterial color="#b9b3a5" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial color="#b5642f" roughness={0.6} />
        </mesh>
      </group>

      <Plant position={[8.8, 0, 7.0]} scale={0.9} />
    </group>
  )
}
