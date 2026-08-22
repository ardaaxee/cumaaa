import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRoomStore } from '../../store/useRoomStore'
import { LAB_ANCHORS } from '../../config/labLayout'
import { useCollider } from '../furniture/useCollider'

// A glowing energy core whose brightness, scale and spin reflect the user's
// real progress: average project progress, completed tasks and unlocked
// achievements all feed a single 0..1 "energy" level.
export function ProjectCore() {
  const projects = useRoomStore((s) => s.projects)
  const tasks = useRoomStore((s) => s.tasks)
  const achievements = useRoomStore((s) => s.achievements)
  const [x, , z] = LAB_ANCHORS.core
  useCollider('lab-core-base', [x, 0, z], [0.9, 1, 0.9])

  const avgProgress = projects.length
    ? projects.reduce((s, p) => s + p.progress, 0) / projects.length / 100
    : 0
  const doneTasks = Math.min(1, tasks.filter((t) => t.done).length / 12)
  const achRatio = achievements.length ? achievements.filter((a) => a.unlocked).length / achievements.length : 0
  const energy = Math.max(0.12, avgProgress * 0.4 + doneTasks * 0.3 + achRatio * 0.3)

  const core = useRef<THREE.Mesh>(null)
  const coreMat = useRef<THREE.MeshStandardMaterial>(null)
  const ring1 = useRef<THREE.Mesh>(null)
  const ring2 = useRef<THREE.Mesh>(null)
  const light = useRef<THREE.PointLight>(null)

  useFrame((s, delta) => {
    const t = s.clock.elapsedTime
    const pulse = 1 + Math.sin(t * 2) * 0.06 * energy
    if (core.current) {
      core.current.rotation.y += delta * (0.3 + energy)
      core.current.rotation.x += delta * 0.15
      core.current.scale.setScalar((0.6 + energy * 0.5) * pulse)
    }
    if (coreMat.current) coreMat.current.emissiveIntensity = 0.6 + energy * 1.4 + Math.sin(t * 4) * 0.1
    if (ring1.current) ring1.current.rotation.z += delta * 0.6
    if (ring2.current) ring2.current.rotation.x += delta * 0.5
    if (light.current) light.current.intensity = 0.4 + energy * 1.2
  })

  return (
    <group position={[x, 0, z]}>
      {/* Pedestal */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.5, 0.7, 20]} />
        <meshStandardMaterial color="#12181f" metalness={0.75} roughness={0.3} envMapIntensity={1} />
      </mesh>
      <mesh position={[0, 0.71, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.34, 24]} />
        <meshStandardMaterial color="#0a2230" emissive="#39d4e6" emissiveIntensity={0.6} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Energy core */}
      <mesh ref={core} position={[0, 1.25, 0]}>
        <icosahedronGeometry args={[0.3, 1]} />
        <meshStandardMaterial
          ref={coreMat}
          color="#0e3a44"
          emissive="#39d4e6"
          emissiveIntensity={1}
          metalness={0.3}
          roughness={0.2}
          toneMapped={false}
        />
      </mesh>
      {/* Orbiting rings */}
      <mesh ref={ring1} position={[0, 1.25, 0]}>
        <torusGeometry args={[0.45, 0.012, 8, 40]} />
        <meshBasicMaterial color="#5fe0ef" transparent opacity={0.6} toneMapped={false} />
      </mesh>
      <mesh ref={ring2} position={[0, 1.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.01, 8, 40]} />
        <meshBasicMaterial color="#39d4e6" transparent opacity={0.4} toneMapped={false} />
      </mesh>

      <pointLight ref={light} position={[0, 1.25, 0]} color="#39d4e6" distance={4} intensity={0.6} />
    </group>
  )
}
