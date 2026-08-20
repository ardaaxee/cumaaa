import { useMemo } from 'react'
import * as THREE from 'three'
import { aoBlob } from '../../utils/textures'
import { ANCHORS } from '../../config/roomLayout'

// Cheap fake ambient occlusion: soft dark blobs on the floor beneath large
// furniture. Reads as grounded contact shadow without the cost of real SSAO —
// which our Three version can't take. Blobs sit just above the floor.
export function ContactAO() {
  const tex = useMemo(() => aoBlob(), [])
  const [dx, , dz] = ANCHORS.desk.pos
  const [bx, , bz] = ANCHORS.bed.pos
  const [kx, , kz] = ANCHORS.chair.pos
  const [cx, , cz] = ANCHORS.bookcase.pos
  const [px, , pz] = ANCHORS.plant.pos

  const blobs: { p: [number, number, number]; s: [number, number]; o: number }[] = [
    { p: [dx, 0.02, dz + 0.15], s: [3.9, 1.7], o: 0.34 }, // desk
    { p: [dx + 1.85, 0.02, dz], s: [1.2, 1.5], o: 0.38 }, // pc tower
    { p: [bx, 0.02, bz], s: [2.2, 2.9], o: 0.34 }, // bed
    { p: [bx + 0.95, 0.02, bz - 0.9], s: [0.9, 0.9], o: 0.3 }, // nightstand
    { p: [kx, 0.02, kz], s: [1.15, 1.15], o: 0.34 }, // chair
    { p: [cx - 0.1, 0.02, cz], s: [1.3, 3.0], o: 0.34 }, // bookcase
    { p: [px, 0.02, pz], s: [0.95, 0.95], o: 0.3 }, // plant
  ]

  return (
    <group>
      {blobs.map((b, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={b.p}>
          <planeGeometry args={b.s} />
          <meshBasicMaterial
            map={tex}
            transparent
            opacity={b.o}
            depthWrite={false}
            blending={THREE.MultiplyBlending}
            polygonOffset
            polygonOffsetFactor={-2}
          />
        </mesh>
      ))}
    </group>
  )
}
