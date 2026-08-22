import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { registerCollider, unregisterCollider } from '../../systems/collisionSystem'
import { LAB, CORRIDOR, DOOR, LAB_CX, LAB_CZ, LAB_W, LAB_D } from '../../config/labLayout'
import { labGrid, wall as wallTex } from '../../utils/textures'

// The physical shell of ARDA LAB: a short corridor from the doorway into a
// larger lab room, with floor, ceiling, walls and matching colliders. The lab
// deliberately reads as a colder, more technical space than the main room.
export function LabShell() {
  const grid = useMemo(() => labGrid(), [])
  const panel = useMemo(() => wallTex(), [])

  useEffect(() => {
    const t = LAB.wall
    // Corridor side walls
    registerCollider('cor-wall-a', [(CORRIDOR.xStart + CORRIDOR.xEnd) / 2, 0, DOOR.zCenter - DOOR.halfWidth - 0.05], [CORRIDOR.xEnd - CORRIDOR.xStart, CORRIDOR.height, t])
    registerCollider('cor-wall-b', [(CORRIDOR.xStart + CORRIDOR.xEnd) / 2, 0, DOOR.zCenter + DOOR.halfWidth + 0.05], [CORRIDOR.xEnd - CORRIDOR.xStart, CORRIDOR.height, t])

    // Lab left wall (x = minX), split around the corridor opening
    const frontLen = DOOR.zCenter - DOOR.halfWidth - LAB.minZ
    const backLen = LAB.maxZ - (DOOR.zCenter + DOOR.halfWidth)
    registerCollider('lab-left-a', [LAB.minX, 0, LAB.minZ + frontLen / 2], [t, LAB.height, frontLen])
    registerCollider('lab-left-b', [LAB.minX, 0, LAB.maxZ - backLen / 2], [t, LAB.height, backLen])

    registerCollider('lab-right', [LAB.maxX, 0, LAB_CZ], [t, LAB.height, LAB_D])
    registerCollider('lab-front', [LAB_CX, 0, LAB.minZ], [LAB_W, LAB.height, t])
    registerCollider('lab-back', [LAB_CX, 0, LAB.maxZ], [LAB_W, LAB.height, t])

    return () => {
      ;['cor-wall-a', 'cor-wall-b', 'lab-left-a', 'lab-left-b', 'lab-right', 'lab-front', 'lab-back'].forEach(
        unregisterCollider,
      )
    }
  }, [])

  const wallMat = (
    <meshStandardMaterial
      color="#0d141c"
      map={panel.map}
      normalMap={panel.normalMap}
      roughness={0.55}
      metalness={0.45}
      envMapIntensity={0.7}
    />
  )

  return (
    <group>
      {/* ---- Corridor ---- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(CORRIDOR.xStart + CORRIDOR.xEnd) / 2, 0.01, DOOR.zCenter]} receiveShadow>
        <planeGeometry args={[CORRIDOR.xEnd - CORRIDOR.xStart, DOOR.halfWidth * 2]} />
        <meshStandardMaterial color="#0a1218" map={grid.map} normalMap={grid.normalMap} roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[(CORRIDOR.xStart + CORRIDOR.xEnd) / 2, CORRIDOR.height, DOOR.zCenter]}>
        <planeGeometry args={[CORRIDOR.xEnd - CORRIDOR.xStart, DOOR.halfWidth * 2]} />
        <meshStandardMaterial color="#0a0e14" roughness={0.9} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(CORRIDOR.xStart + CORRIDOR.xEnd) / 2, CORRIDOR.height / 2, DOOR.zCenter + s * (DOOR.halfWidth + 0.02)]} receiveShadow>
          <boxGeometry args={[CORRIDOR.xEnd - CORRIDOR.xStart, CORRIDOR.height, LAB.wall]} />
          {wallMat}
        </mesh>
      ))}
      {/* Corridor light strips */}
      {[-1, 1].map((s) => (
        <mesh key={`cs${s}`} position={[(CORRIDOR.xStart + CORRIDOR.xEnd) / 2, CORRIDOR.height - 0.2, DOOR.zCenter + s * DOOR.halfWidth]}>
          <boxGeometry args={[CORRIDOR.xEnd - CORRIDOR.xStart - 0.2, 0.04, 0.03]} />
          <meshStandardMaterial color="#0a2230" emissive="#39d4e6" emissiveIntensity={0.7} toneMapped={false} />
        </mesh>
      ))}

      {/* ---- Lab floor & ceiling ---- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[LAB_CX, 0, LAB_CZ]} receiveShadow>
        <planeGeometry args={[LAB_W, LAB_D]} />
        <meshStandardMaterial color="#0a1016" map={grid.map} normalMap={grid.normalMap} roughness={0.45} metalness={0.5} envMapIntensity={0.8} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[LAB_CX, LAB.height, LAB_CZ]}>
        <planeGeometry args={[LAB_W, LAB_D]} />
        <meshStandardMaterial color="#080b11" roughness={0.9} />
      </mesh>
      {/* Ceiling light beams */}
      {[-2, 0, 2].map((dz) => (
        <mesh key={dz} position={[LAB_CX, LAB.height - 0.05, LAB_CZ + dz]}>
          <boxGeometry args={[LAB_W - 1.5, 0.05, 0.12]} />
          <meshStandardMaterial color="#0a2230" emissive="#39d4e6" emissiveIntensity={0.5} toneMapped={false} />
        </mesh>
      ))}

      {/* ---- Lab walls ---- */}
      {/* left (split around corridor) */}
      {(() => {
        const frontLen = DOOR.zCenter - DOOR.halfWidth - LAB.minZ
        const backLen = LAB.maxZ - (DOOR.zCenter + DOOR.halfWidth)
        return (
          <>
            <mesh position={[LAB.minX, LAB.height / 2, LAB.minZ + frontLen / 2]} receiveShadow>
              <boxGeometry args={[LAB.wall, LAB.height, frontLen]} />
              {wallMat}
            </mesh>
            <mesh position={[LAB.minX, LAB.height / 2, LAB.maxZ - backLen / 2]} receiveShadow>
              <boxGeometry args={[LAB.wall, LAB.height, backLen]} />
              {wallMat}
            </mesh>
          </>
        )
      })()}
      <mesh position={[LAB.maxX, LAB.height / 2, LAB_CZ]} receiveShadow>
        <boxGeometry args={[LAB.wall, LAB.height, LAB_D]} />
        {wallMat}
      </mesh>
      <mesh position={[LAB_CX, LAB.height / 2, LAB.minZ]} receiveShadow>
        <boxGeometry args={[LAB_W, LAB.height, LAB.wall]} />
        {wallMat}
      </mesh>
      <mesh position={[LAB_CX, LAB.height / 2, LAB.maxZ]} receiveShadow>
        <boxGeometry args={[LAB_W, LAB.height, LAB.wall]} />
        {wallMat}
      </mesh>

      {/* Wall trim strips (cool glow around the base) */}
      {(
        [
          { p: [LAB_CX, 0.05, LAB.minZ + 0.06] as const, s: [LAB_W, 0.08, 0.03] as const },
          { p: [LAB_CX, 0.05, LAB.maxZ - 0.06] as const, s: [LAB_W, 0.08, 0.03] as const },
          { p: [LAB.maxX - 0.06, 0.05, LAB_CZ] as const, s: [0.03, 0.08, LAB_D] as const },
        ] as const
      ).map((tr, i) => (
        <mesh key={i} position={tr.p as [number, number, number]}>
          <boxGeometry args={tr.s as [number, number, number]} />
          <meshStandardMaterial color="#0a2230" emissive="#39d4e6" emissiveIntensity={0.4} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

// A reusable holographic material (additive, flickering) for lab elements.
export function makeHoloMaterial(color = '#39d4e6'): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  })
}
