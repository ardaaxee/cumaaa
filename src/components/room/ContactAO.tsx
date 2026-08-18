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

  const blobs: { p: [number, number, number]; s: [number, number] }[] = [
    { p: [dx, 0.02, dz + 0.1], s: [4.2, 1.8] }, // desk
    { p: [dx + 1.85, 0.02, dz], s: [1.4, 1.6] }, // pc tower
    { p: [bx, 0.02, bz], s: [2.4, 3.0] }, // bed
    { p: [kx, 0.02, kz], s: [1.3, 1.3] }, // chair
    { p: [cx, 0.02, cz], s: [1.4, 3.2] }, // bookcase
    { p: [px, 0.02, pz], s: [1.0, 1.0] }, // plant
  ]

  return (
    <group>
      {blobs.map((b, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={b.p}>
          <planeGeometry args={b.s} />
          <meshBasicMaterial
            map={tex}
            transparent
            opacity={0.7}
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
