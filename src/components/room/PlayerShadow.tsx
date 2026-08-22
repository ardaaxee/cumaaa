import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { aoBlob } from '../../utils/textures'
import { playerMotion } from '../../systems/playerMotion'
import type { GraphicsQuality } from '../../types'
import { isHighTier } from '../../utils/device'

// A soft contact shadow that follows the player, so you feel physically present
// in the room (you see it under you when you look down). It shrinks/fades a
// little when you jump and never flickers — it's a static blob, not a real
// shadow map. Opacity scales with the quality tier.
export function PlayerShadow({ quality }: { quality: GraphicsQuality }) {
  const tex = useMemo(() => aoBlob(), [])
  const ref = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.MeshBasicMaterial>(null)
  const base = isHighTier(quality) ? 0.42 : quality === 'medium' ? 0.32 : 0.2

  useFrame(() => {
    const mesh = ref.current
    if (!mesh) return
    mesh.position.x = playerMotion.x
    mesh.position.z = playerMotion.z
    // Feet are ~1.6 m below the eye; the blob sits just above the floor.
    const lift = playerMotion.grounded ? 0 : 0.25
    const scale = 1 - lift * 0.5
    mesh.scale.setScalar(scale)
    if (matRef.current) matRef.current.opacity = base * (1 - lift)
  })

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
      <planeGeometry args={[0.95, 0.95]} />
      <meshBasicMaterial ref={matRef} map={tex} transparent opacity={base} depthWrite={false} color="#000000" />
    </mesh>
  )
}
