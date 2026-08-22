import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { LAB, LAB_CX, LAB_CZ } from '../../config/labLayout'
import { shadowsEnabled } from '../../utils/device'
import type { GraphicsQuality } from '../../types'

// Cool, technical lighting for ARDA LAB — cyan key + subtle moving accents,
// distinctly colder than the main room. Shadow use scales with quality.
export function LabLighting({ quality }: { quality: GraphicsQuality }) {
  const roam = useRef<THREE.PointLight>(null)
  const castShadows = shadowsEnabled(quality)

  useFrame((s) => {
    if (roam.current) {
      const t = s.clock.elapsedTime * 0.4
      roam.current.position.x = LAB_CX + Math.sin(t) * 2.5
      roam.current.position.z = LAB_CZ + Math.cos(t * 0.8) * 2.5
    }
  })

  return (
    <group>
      <ambientLight color="#6a6f78" intensity={0.38} />
      <hemisphereLight color="#41474f" groundColor="#08090c" intensity={0.3} />

      {/* Neutral-cool key light over the centre (the holograms provide the glow) */}
      <spotLight
        position={[LAB_CX, LAB.height - 0.2, LAB_CZ]}
        angle={0.9}
        penumbra={0.7}
        intensity={1.0}
        color="#cdd6de"
        distance={12}
        castShadow={castShadows}
        shadow-mapSize-width={castShadows ? 1024 : 512}
        shadow-mapSize-height={castShadows ? 1024 : 512}
      />
      {/* Slowly roaming accent light */}
      <pointLight ref={roam} position={[LAB_CX, 1.6, LAB_CZ]} intensity={0.5} color="#39d4e6" distance={6} />
      {/* Warm counter-accent from the terminals */}
      <pointLight position={[LAB_CX, 1.2, LAB.maxZ - 1]} intensity={0.35} color="#ff9d5c" distance={7} />
      {/* Fill from the front (achievement) wall */}
      <pointLight position={[LAB_CX, 1.6, LAB.minZ + 1]} intensity={0.3} color="#5fe0ef" distance={7} />
    </group>
  )
}
