import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { itemDefOr, fillRatio } from '../../config/items'
import { HOB_SPOT, type WorldItem } from '../../network/protocol'

// The world models. One per item definition, built from primitives but built as
// the object actually is — a mug has a handle, a fork has tines, a pot has a rim
// and two lugs. Nothing here is a labelled cube.
//
// CONVENTION: every model is authored with its ORIGIN AT THE BASE and the front
// facing -Z, so putting one on a shelf is just `position = slotPosition(...)`
// with no per-item fudge factor.

interface ModelProps {
  item: WorldItem
  seg: number
}

const GLASS = { color: '#cdd8dd', roughness: 0.08, metalness: 0.02, transparent: true, opacity: 0.34 }
const STEEL = { color: '#c2c7cc', roughness: 0.28, metalness: 0.8 }
const DARK_STEEL = { color: '#4a4d52', roughness: 0.4, metalness: 0.6 }

function fluidColor(fluid: string | undefined): string {
  switch (fluid) {
    case 'milk': return '#f2efe6'
    case 'tea': return '#a2612c'
    case 'coffee': return '#4a2c1c'
    default: return '#a9cfe0'
  }
}

// Rising steam off something on the heat. Only drawn while it is actually on a
// hob and has started to cook, so it is a readout of the cooking state rather
// than decoration bolted to a pan.
function Steam({ item, y }: { item: WorldItem; y: number }) {
  const g = useRef<THREE.Group>(null)
  const t = useRef(0)
  const cooking = item.loc.at === 'spot' && item.loc.id === HOB_SPOT && (item.cooked ?? 0) > 0.04
  useFrame((_, delta) => {
    t.current += delta
    const grp = g.current
    if (!grp) return
    grp.children.forEach((c, i) => {
      const p = (t.current * 0.3 + i * 0.34) % 1
      c.position.y = y + p * 0.3
      c.scale.setScalar(0.4 + p * 1.5)
      const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial
      m.opacity = 0.2 * (1 - p)
    })
  })
  if (!cooking) return null
  return (
    <group ref={g}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, y, 0]}>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshStandardMaterial color="#e8eef2" transparent opacity={0.18} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

// A vessel's contents: a short cylinder whose height follows the fill level.
function Liquid({ r, h, y, fluid, seg }: { r: number; h: number; y: number; fluid?: string; seg: number }) {
  if (h <= 0.001) return null
  return (
    <mesh position={[0, y + h / 2, 0]}>
      <cylinderGeometry args={[r, r * 0.96, h, seg]} />
      <meshStandardMaterial color={fluidColor(fluid)} roughness={0.18} metalness={0.02} />
    </mesh>
  )
}

// ---- Tableware --------------------------------------------------------------

function Glass({ item, seg }: ModelProps) {
  const f = fillRatio(itemDefOr(item.def), item.fill)
  return (
    <group>
      {/* wall, open at the top: BackSide inner face + FrontSide outer */}
      <mesh position={[0, 0.055, 0]}>
        <cylinderGeometry args={[0.036, 0.028, 0.11, seg, 1, true]} />
        <meshPhysicalMaterial {...GLASS} side={THREE.DoubleSide} transmission={0.6} thickness={0.004} />
      </mesh>
      <mesh position={[0, 0.004, 0]}>
        <cylinderGeometry args={[0.028, 0.028, 0.008, seg]} />
        <meshPhysicalMaterial {...GLASS} transmission={0.5} thickness={0.006} />
      </mesh>
      <Liquid r={0.031} h={0.095 * f} y={0.009} fluid={item.fluid} seg={seg} />
    </group>
  )
}

function Mug({ item, seg }: ModelProps) {
  const f = fillRatio(itemDefOr(item.def), item.fill)
  return (
    <group>
      <mesh position={[0, 0.048, 0]}>
        <cylinderGeometry args={[0.041, 0.038, 0.096, seg, 1, true]} />
        <meshStandardMaterial color="#e2ded2" roughness={0.32} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.006, 0]}>
        <cylinderGeometry args={[0.038, 0.036, 0.012, seg]} />
        <meshStandardMaterial color="#e2ded2" roughness={0.32} />
      </mesh>
      {/* handle */}
      <mesh position={[0.047, 0.05, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.026, 0.006, 6, 14, Math.PI * 1.15]} />
        <meshStandardMaterial color="#e2ded2" roughness={0.32} />
      </mesh>
      <Liquid r={0.036} h={0.082 * f} y={0.013} fluid={item.fluid} seg={seg} />
    </group>
  )
}

function Plate({ seg }: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.006, 0]}>
        <cylinderGeometry args={[0.105, 0.062, 0.012, seg * 2]} />
        <meshStandardMaterial color="#dcd7cb" roughness={0.28} />
      </mesh>
      {/* raised rim, so it is a plate and not a disc */}
      <mesh position={[0, 0.014, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1, 0.007, 5, seg * 2]} />
        <meshStandardMaterial color="#dcd7cb" roughness={0.28} />
      </mesh>
    </group>
  )
}

// Fork / spoon / knife share a handle; only the head differs.
function Cutlery({ kind, seg }: { kind: 'fork' | 'spoon' | 'knife'; seg: number }) {
  return (
    <group rotation={[Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
      <mesh position={[0, -0.045, 0]}>
        <boxGeometry args={[0.011, 0.09, 0.005]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      {kind === 'fork' && (
        <group position={[0, 0.022, 0]}>
          <mesh position={[0, -0.014, 0]}>
            <boxGeometry args={[0.019, 0.02, 0.004]} />
            <meshStandardMaterial {...STEEL} />
          </mesh>
          {[-0.007, 0, 0.007].map((x, i) => (
            <mesh key={i} position={[x, 0.008, 0]}>
              <boxGeometry args={[0.0035, 0.03, 0.004]} />
              <meshStandardMaterial {...STEEL} />
            </mesh>
          ))}
        </group>
      )}
      {kind === 'spoon' && (
        <mesh position={[0, 0.026, 0]} scale={[1, 1.45, 0.42]}>
          <sphereGeometry args={[0.014, seg, seg]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
      )}
      {kind === 'knife' && (
        <mesh position={[0, 0.026, 0]}>
          <boxGeometry args={[0.014, 0.062, 0.0025]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
      )}
    </group>
  )
}

// ---- Cookware ---------------------------------------------------------------

function Pot({ item, seg }: ModelProps) {
  const f = fillRatio(itemDefOr(item.def), item.fill)
  const cooked = item.cooked ?? 0
  return (
    <group>
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.098, 0.09, 0.14, seg, 1, true]} />
        <meshStandardMaterial {...DARK_STEEL} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.006, 0]}>
        <cylinderGeometry args={[0.09, 0.086, 0.012, seg]} />
        <meshStandardMaterial {...DARK_STEEL} />
      </mesh>
      {/* rolled rim */}
      <mesh position={[0, 0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.097, 0.005, 5, seg]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      {/* two lug handles */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.115, 0.115, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.022, 0.006, 5, 10, Math.PI]} />
          <meshStandardMaterial color="#26282c" roughness={0.7} />
        </mesh>
      ))}
      {f > 0 && (
        <mesh position={[0, 0.02 + (0.11 * f) / 2, 0]}>
          <cylinderGeometry args={[0.088, 0.084, 0.11 * f, seg]} />
          <meshStandardMaterial
            color={cooked > 1.3 ? '#3a2a1e' : cooked > 0.6 ? '#c07a3a' : fluidColor(item.fluid)}
            roughness={0.3}
          />
        </mesh>
      )}
      <Steam item={item} y={0.16} />
    </group>
  )
}

function Pan({ item, seg }: ModelProps) {
  const cooked = item.cooked ?? 0
  return (
    <group>
      <mesh position={[0, 0.026, 0]}>
        <cylinderGeometry args={[0.105, 0.088, 0.048, seg, 1, true]} />
        <meshStandardMaterial color="#2e3034" roughness={0.45} metalness={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.005, 0]}>
        <cylinderGeometry args={[0.088, 0.086, 0.01, seg]} />
        <meshStandardMaterial color="#212327" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* handle, angled up as a real pan handle is */}
      <mesh position={[0, 0.05, 0.16]} rotation={[1.35, 0, 0]}>
        <boxGeometry args={[0.024, 0.018, 0.16]} />
        <meshStandardMaterial color="#24262a" roughness={0.72} />
      </mesh>
      {cooked > 0.15 && (
        <mesh position={[0, 0.016, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.014, seg]} />
          <meshStandardMaterial color={cooked > 1.3 ? '#2c1f16' : cooked > 0.6 ? '#b56a34' : '#d8b48a'} roughness={0.55} />
        </mesh>
      )}
      <Steam item={item} y={0.06} />
    </group>
  )
}

function KettleModel({ item, seg }: ModelProps) {
  const f = fillRatio(itemDefOr(item.def), item.fill)
  return (
    <group>
      <mesh position={[0, 0.115, 0]}>
        <cylinderGeometry args={[0.075, 0.085, 0.22, seg]} />
        <meshStandardMaterial color="#2a2d33" metalness={0.45} roughness={0.4} />
      </mesh>
      <mesh position={[0.08, 0.175, 0]} rotation={[0, 0, -0.6]}>
        <cylinderGeometry args={[0.018, 0.026, 0.12, 10]} />
        <meshStandardMaterial color="#2a2d33" metalness={0.45} roughness={0.4} />
      </mesh>
      <mesh position={[-0.1, 0.135, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.06, 0.011, 6, 14, Math.PI]} />
        <meshStandardMaterial color="#1e2126" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.007, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.015, seg]} />
        <meshStandardMaterial color="#3a3d42" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* water-level window down one side */}
      <mesh position={[0.06, 0.11, 0.05]}>
        <boxGeometry args={[0.012, 0.14, 0.02]} />
        <meshPhysicalMaterial color="#8fa4ad" roughness={0.1} transmission={0.6} thickness={0.01} transparent opacity={0.7} />
      </mesh>
      {f > 0 && (
        <mesh position={[0.06, 0.045 + (0.13 * f) / 2, 0.05]}>
          <boxGeometry args={[0.009, 0.13 * f, 0.016]} />
          <meshStandardMaterial color={fluidColor(item.fluid)} roughness={0.2} />
        </mesh>
      )}
    </group>
  )
}

// ---- Drink ------------------------------------------------------------------

function Bottle({ item, seg }: ModelProps) {
  const f = fillRatio(itemDefOr(item.def), item.fill)
  return (
    <group>
      <mesh position={[0, 0.075, 0]}>
        <cylinderGeometry args={[0.034, 0.036, 0.15, seg]} />
        <meshPhysicalMaterial color="#cfe0e6" roughness={0.12} transmission={0.65} thickness={0.01} transparent opacity={0.5} />
      </mesh>
      {/* shoulder taper into the neck */}
      <mesh position={[0, 0.166, 0]}>
        <cylinderGeometry args={[0.014, 0.034, 0.034, seg]} />
        <meshPhysicalMaterial color="#cfe0e6" roughness={0.12} transmission={0.65} thickness={0.01} transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, 0.194, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 0.024, seg]} />
        <meshPhysicalMaterial color="#cfe0e6" roughness={0.12} transmission={0.6} thickness={0.01} transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, 0.213, 0]}>
        <cylinderGeometry args={[0.017, 0.017, 0.018, seg]} />
        <meshStandardMaterial color="#3f7fb2" roughness={0.45} />
      </mesh>
      {f > 0 && (
        <mesh position={[0, 0.006 + (0.14 * f) / 2, 0]}>
          <cylinderGeometry args={[0.031, 0.033, 0.14 * f, seg]} />
          <meshStandardMaterial color={fluidColor(item.fluid)} roughness={0.18} />
        </mesh>
      )}
      {/* label band */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.0355, 0.0365, 0.05, seg, 1, true]} />
        <meshStandardMaterial color="#4d8fc0" roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// A gable-top carton, which is what milk actually comes in.
function Milk() {
  return (
    <group>
      <mesh position={[0, 0.085, 0]}>
        <boxGeometry args={[0.07, 0.17, 0.07]} />
        <meshStandardMaterial color="#eceff2" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.196, 0]} rotation={[0, Math.PI / 4, 0]}>
        <cylinderGeometry args={[0.001, 0.05, 0.052, 4]} />
        <meshStandardMaterial color="#eceff2" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.085, 0.0355]}>
        <boxGeometry args={[0.056, 0.09, 0.002]} />
        <meshStandardMaterial color="#2f6fb0" roughness={0.7} />
      </mesh>
    </group>
  )
}

// ---- Food -------------------------------------------------------------------

function Tomato({ seg }: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.036, 0]} scale={[1, 0.86, 1]}>
        <sphereGeometry args={[0.04, seg, seg]} />
        <meshStandardMaterial color="#b8342a" roughness={0.34} />
      </mesh>
      {/* calyx */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[Math.cos((i / 5) * Math.PI * 2) * 0.014, 0.07, Math.sin((i / 5) * Math.PI * 2) * 0.014]} rotation={[0.5, (i / 5) * Math.PI * 2, 0]}>
          <boxGeometry args={[0.012, 0.004, 0.022]} />
          <meshStandardMaterial color="#3f7333" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function Apple({ seg }: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.04, 0]} scale={[1, 1.05, 1]}>
        <sphereGeometry args={[0.039, seg, seg]} />
        <meshStandardMaterial color="#a8382c" roughness={0.36} />
      </mesh>
      <mesh position={[0, 0.084, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.003, 0.004, 0.024, 6]} />
        <meshStandardMaterial color="#4a3524" roughness={0.85} />
      </mesh>
      <mesh position={[0.016, 0.09, 0]} rotation={[0, 0.4, 0.5]} scale={[1, 0.25, 0.55]}>
        <sphereGeometry args={[0.018, 6, 6]} />
        <meshStandardMaterial color="#4f7d38" roughness={0.8} />
      </mesh>
    </group>
  )
}

function Bread({ seg }: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.045, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.72]}>
        <capsuleGeometry args={[0.045, 0.13, 2, seg]} />
        <meshStandardMaterial color="#c08c4e" roughness={0.88} />
      </mesh>
      {/* scoring across the top */}
      {[-0.045, 0, 0.045].map((x, i) => (
        <mesh key={i} position={[x, 0.083, 0]} rotation={[0, 0, 0.35]}>
          <boxGeometry args={[0.008, 0.006, 0.05]} />
          <meshStandardMaterial color="#8f6132" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

// A wedge — a triangular prism, cut from a round.
function Cheese() {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.lineTo(0.11, 0.045)
  shape.lineTo(0.11, -0.045)
  shape.lineTo(0, 0)
  return (
    <group position={[-0.05, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <extrudeGeometry args={[shape, { depth: 0.05, bevelEnabled: false }]} />
        <meshStandardMaterial color="#e3c163" roughness={0.62} />
      </mesh>
    </group>
  )
}

function Egg({ seg }: ModelProps) {
  return (
    <mesh position={[0, 0.026, 0]} scale={[1, 1.35, 1]} rotation={[0.25, 0, 0]}>
      <sphereGeometry args={[0.021, seg, seg]} />
      <meshStandardMaterial color="#e8dcc4" roughness={0.65} />
    </mesh>
  )
}

// ---- Personal / household ---------------------------------------------------

function Book() {
  return (
    <group>
      <mesh position={[0, 0.014, 0]}>
        <boxGeometry args={[0.135, 0.028, 0.19]} />
        <meshStandardMaterial color="#7a4a3a" roughness={0.72} />
      </mesh>
      {/* page block, inset so the cover overhangs it */}
      <mesh position={[0.004, 0.014, 0]}>
        <boxGeometry args={[0.128, 0.022, 0.183]} />
        <meshStandardMaterial color="#e6e0d0" roughness={0.9} />
      </mesh>
      {/* spine */}
      <mesh position={[-0.066, 0.014, 0]}>
        <boxGeometry args={[0.008, 0.03, 0.192]} />
        <meshStandardMaterial color="#663c2e" roughness={0.7} />
      </mesh>
    </group>
  )
}

function Phone({ item }: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.005, 0]}>
        <boxGeometry args={[0.071, 0.009, 0.146]} />
        <meshStandardMaterial color="#1b1d21" roughness={0.35} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.0102, 0]}>
        <boxGeometry args={[0.064, 0.001, 0.136]} />
        <meshStandardMaterial
          color="#101318"
          emissive={item.loc.at === 'hand' ? '#3f5f7a' : '#000000'}
          emissiveIntensity={item.loc.at === 'hand' ? 0.7 : 0}
          roughness={0.2}
        />
      </mesh>
    </group>
  )
}

function Remote() {
  return (
    <group>
      <mesh position={[0, 0.011, 0]}>
        <boxGeometry args={[0.044, 0.022, 0.155]} />
        <meshStandardMaterial color="#232529" roughness={0.6} />
      </mesh>
      {[0.05, 0.02, -0.01, -0.04].map((z, i) => (
        <mesh key={i} position={[0, 0.023, z]}>
          <boxGeometry args={[0.03, 0.003, 0.012]} />
          <meshStandardMaterial color={i === 0 ? '#b8433a' : '#4a4d52'} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

function Keys({ seg }: ModelProps) {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
      <mesh>
        <torusGeometry args={[0.018, 0.0022, 5, seg]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      {[-0.25, 0.25].map((a, i) => (
        <group key={i} rotation={[0, 0, a]}>
          <mesh position={[0, -0.038, 0]}>
            <boxGeometry args={[0.007, 0.042, 0.0016]} />
            <meshStandardMaterial color="#b39b5e" roughness={0.4} metalness={0.7} />
          </mesh>
          <mesh position={[0.005, -0.054, 0]}>
            <boxGeometry args={[0.005, 0.008, 0.0016]} />
            <meshStandardMaterial color="#b39b5e" roughness={0.4} metalness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Towel() {
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.011 + i * 0.019, i * 0.002]} rotation={[0, i * 0.03, 0]}>
          <boxGeometry args={[0.15, 0.019, 0.1]} />
          <meshStandardMaterial color={['#c8d2d6', '#c2ccd0', '#cdd6da'][i]} roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

// ---- Registry ---------------------------------------------------------------

const MODELS: Record<string, (p: ModelProps) => JSX.Element> = {
  glass: Glass,
  mug: Mug,
  plate: Plate,
  fork: (p) => <Cutlery kind="fork" seg={p.seg} />,
  spoon: (p) => <Cutlery kind="spoon" seg={p.seg} />,
  knife: (p) => <Cutlery kind="knife" seg={p.seg} />,
  pot: Pot,
  pan: Pan,
  kettle: KettleModel,
  bottle: Bottle,
  milk: () => <Milk />,
  tomato: Tomato,
  apple: Apple,
  bread: Bread,
  cheese: () => <Cheese />,
  egg: Egg,
  book: () => <Book />,
  phone: Phone,
  remote: () => <Remote />,
  keys: Keys,
  towel: () => <Towel />,
}

/**
 * Draw one item. Unknown definitions render NOTHING rather than a stand-in box:
 * a missing model should be an obvious hole to fix, not a cube pretending to be
 * a kettle.
 */
export function ItemModel({ item, seg = 12 }: { item: WorldItem; seg?: number }) {
  const def = itemDefOr(item.def)
  const Comp = MODELS[def.model]
  if (!Comp) return null
  return <Comp item={item} seg={seg} />
}

export function hasModel(defId: string): boolean {
  return !!MODELS[itemDefOr(defId).model]
}
