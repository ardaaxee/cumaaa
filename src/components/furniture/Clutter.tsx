import { useMemo } from 'react'
import { ANCHORS, HALF_D } from '../../config/roomLayout'
import { fabric } from '../../utils/textures'

// Small lived-in details that make the room feel used rather than staged:
// a hoodie on the chair, a wastebasket with crumpled paper, desk books and a
// notebook, a charger brick with a coiled cable, and slippers by the bed. All
// are lightweight procedural props and carry no colliders.
export function Clutter() {
  const [dx, , dz] = ANCHORS.desk.pos
  const [cx, , cz] = ANCHORS.chair.pos
  const [bx, , bz] = ANCHORS.bed.pos
  const hoodie = useMemo(() => fabric('#3a4657', 'hoodie'), [])
  const throwCloth = useMemo(() => fabric('#7a5a4a', 'throw'), [])

  return (
    <group>
      {/* Hoodie slung over the chair back */}
      <group position={[cx - 0.02, 0.98, cz + 0.28]} rotation={[0.15, 0.2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.42, 0.12]} />
          <meshStandardMaterial color="#3a4657" map={hoodie.map} normalMap={hoodie.normalMap} roughness={0.95} />
        </mesh>
        {/* dangling sleeve */}
        <mesh position={[-0.26, -0.28, 0.02]} rotation={[0.1, 0, 0.3]} castShadow>
          <boxGeometry args={[0.12, 0.4, 0.1]} />
          <meshStandardMaterial color="#333f4e" map={hoodie.map} normalMap={hoodie.normalMap} roughness={0.95} />
        </mesh>
      </group>

      {/* Wastebasket + crumpled paper near the desk */}
      <group position={[dx + 1.25, 0, dz + 0.55]}>
        <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.15, 0.12, 0.32, 16]} />
          <meshStandardMaterial color="#2a2d33" metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh position={[0.02, 0.3, 0.02]}>
          <dodecahedronGeometry args={[0.06, 0]} />
          <meshStandardMaterial color="#e8e2d4" roughness={0.95} />
        </mesh>
        <mesh position={[0.28, 0.05, 0.12]}>
          <dodecahedronGeometry args={[0.05, 0]} />
          <meshStandardMaterial color="#ded7c6" roughness={0.95} />
        </mesh>
      </group>

      {/* Desk: a small stack of books, a notebook and a pen */}
      <group position={[dx - 0.95, 0.81, dz + 0.12]}>
        <mesh castShadow rotation={[0, 0.1, 0]}>
          <boxGeometry args={[0.22, 0.03, 0.3]} />
          <meshStandardMaterial color="#6e3a30" roughness={0.8} />
        </mesh>
        <mesh position={[0.01, 0.035, 0]} castShadow rotation={[0, -0.06, 0]}>
          <boxGeometry args={[0.21, 0.03, 0.29]} />
          <meshStandardMaterial color="#3a4a5c" roughness={0.8} />
        </mesh>
        <mesh position={[-0.01, 0.07, 0.01]} castShadow rotation={[0, 0.04, 0]}>
          <boxGeometry args={[0.2, 0.025, 0.28]} />
          <meshStandardMaterial color="#4a5a3c" roughness={0.8} />
        </mesh>
      </group>
      <group position={[dx + 0.62, 0.79, dz + 0.26]} rotation={[0, -0.25, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.2, 0.015, 0.27]} />
          <meshStandardMaterial color="#c9bfa6" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.012, 0.02]} rotation={[0, 0, 0.02]}>
          <boxGeometry args={[0.14, 0.004, 0.005]} />
          <meshStandardMaterial color="#1a1a1e" roughness={0.4} metalness={0.3} />
        </mesh>
      </group>

      {/* Charger brick + coiled cable on the floor behind the desk */}
      <group position={[dx - 1.1, 0.05, dz + 0.55]}>
        <mesh castShadow>
          <boxGeometry args={[0.12, 0.06, 0.16]} />
          <meshStandardMaterial color="#e8e6e0" roughness={0.6} />
        </mesh>
        <mesh position={[0.14, -0.02, 0.06]} rotation={[Math.PI / 2, 0, 0.5]}>
          <torusGeometry args={[0.09, 0.012, 6, 20]} />
          <meshStandardMaterial color="#111" roughness={0.8} />
        </mesh>
      </group>

      {/* Slippers by the bed */}
      {[-0.09, 0.09].map((ox, i) => (
        <group key={i} position={[bx - 1.05 + ox, 0.03, bz + 0.6]} rotation={[0, 0.3 * (i ? -1 : 1), 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.11, 0.05, 0.26]} />
            <meshStandardMaterial color="#4a4038" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.04, -0.07]}>
            <boxGeometry args={[0.11, 0.06, 0.1]} />
            <meshStandardMaterial color="#564a40" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* A throw blanket draped off the foot of the bed */}
      <mesh position={[bx - 0.1, 0.4, bz + 0.95]} rotation={[0.35, 0.05, 0]} castShadow>
        <boxGeometry args={[1.0, 0.5, 0.08]} />
        <meshStandardMaterial color="#7a5a4a" map={throwCloth.map} normalMap={throwCloth.normalMap} roughness={0.95} />
      </mesh>

      {/* A couple of books left on the floor by the bookcase */}
      <group position={[ANCHORS.bookcase.pos[0] - 0.7, 0.03, HALF_D - 3.6]} rotation={[0, 0.4, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.24, 0.04, 0.32]} />
          <meshStandardMaterial color="#7a6a46" roughness={0.8} />
        </mesh>
        <mesh position={[0.05, 0.045, 0.03]} rotation={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.22, 0.035, 0.3]} />
          <meshStandardMaterial color="#5a4560" roughness={0.8} />
        </mesh>
      </group>
    </group>
  )
}
