import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { playerMotion } from '../../systems/playerMotion'
import { usePlayerStore } from '../../store/usePlayerStore'
import { useRoomStore } from '../../store/useRoomStore'
import type { GraphicsQuality } from '../../types'

// First-person presence: a pair of low-poly forearms + hands parented to the
// camera, lit by the real room lights so the player feels embodied. They sway
// gently at idle, swing with walking, swing harder when running, and make a
// short reach on interaction. No weapon-style animation — this is a home, not a
// shooter. Cheap (a handful of boxes) and hidden while a panel/cinematic owns
// the view. LOW tier keeps them but simpler; hands never cast shadows (avoids
// near-camera shadow artefacts — the body's floor shadow is the blob below).
const SKIN = '#d3a67c'
const SLEEVE = '#525863' // dark hoodie — dark but never pure black

export function FirstPersonBody({ quality }: { quality: GraphicsQuality }) {
  const { camera } = useThree()
  const rig = useRef<THREE.Group>(null)
  const inner = useRef<THREE.Group>(null)
  const left = useRef<THREE.Group>(null)
  const right = useRef<THREE.Group>(null)
  const seg = quality === 'low' ? 1 : 2

  useFrame((_, delta) => {
    const g = rig.current
    if (!g) return
    // Ride with the camera (kept in the scene graph so room lights hit it).
    g.position.copy(camera.position)
    g.quaternion.copy(camera.quaternion)

    // Hide while a panel is open or a cinematic focus owns the camera.
    const room = useRoomStore.getState()
    const player = usePlayerStore.getState()
    const hidden = room.activePanel !== null || player.focusTarget !== null || !player.inputEnabled
    g.visible = !hidden
    if (hidden) return

    const t = performance.now() / 1000
    const m = playerMotion
    const walk = Math.min(1, m.speed / 3.1)
    const swing = m.running ? 0.32 : 0.16

    // Reach pulse (0..1..0) for ~420ms after an interaction.
    const since = (performance.now() - m.reachAt) / 420
    const reach = since >= 0 && since <= 1 ? Math.sin(since * Math.PI) : 0

    // Base bob of the inner rig, countering the head-bob a touch.
    if (inner.current) {
      const bob = Math.sin(m.bobPhase) * 0.012 * walk
      const idle = Math.sin(t * 1.4) * 0.004
      inner.current.position.set(0, -0.02 + bob + idle, 0)
    }

    if (left.current && right.current) {
      // Arms swing out of phase as you walk; a gentle idle drift otherwise.
      const phase = m.moving ? m.bobPhase : t * 1.2
      const lSwing = Math.sin(phase) * swing * (m.moving ? 1 : 0.15)
      const rSwing = Math.sin(phase + Math.PI) * swing * (m.moving ? 1 : 0.15)
      left.current.rotation.x = -0.5 + lSwing
      right.current.rotation.x = -0.5 + rSwing - reach * 0.6
      right.current.position.z = -0.5 - reach * 0.12
      right.current.position.y = -0.34 + reach * 0.06
    }
    void delta
  })

  // A normal scene group whose transform is copied from the camera each frame,
  // so it stays in the scene graph (lit by room lights) yet rides with the view.
  return (
    <group ref={rig}>
      <group ref={inner}>
        {/* Left forearm + hand */}
        <group ref={left} position={[-0.2, -0.34, -0.5]} rotation={[-0.5, 0.15, 0.1]}>
          <Arm seg={seg} />
        </group>
        {/* Right forearm + hand */}
        <group ref={right} position={[0.2, -0.34, -0.5]} rotation={[-0.5, -0.15, -0.1]}>
          <Arm seg={seg} mirror />
        </group>
      </group>
    </group>
  )
}

function Arm({ seg, mirror = false }: { seg: number; mirror?: boolean }) {
  const s = mirror ? -1 : 1
  return (
    <group>
      {/* Sleeve / forearm */}
      <mesh position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]} frustumCulled={false}>
        <cylinderGeometry args={[0.045, 0.055, 0.34, 8 * seg]} />
        <meshStandardMaterial color={SLEEVE} roughness={0.85} />
      </mesh>
      {/* Wrist / hand */}
      <mesh position={[0, 0, -0.11]} rotation={[Math.PI / 2, 0, 0]} frustumCulled={false}>
        <cylinderGeometry args={[0.04, 0.045, 0.1, 8 * seg]} />
        <meshStandardMaterial color={SKIN} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.005, -0.19]} frustumCulled={false}>
        <boxGeometry args={[0.075, 0.03, 0.12]} />
        <meshStandardMaterial color={SKIN} roughness={0.7} />
      </mesh>
      {/* Thumb hint */}
      <mesh position={[s * 0.045, 0.004, -0.16]} rotation={[0, 0, s * 0.5]} frustumCulled={false}>
        <boxGeometry args={[0.02, 0.025, 0.055]} />
        <meshStandardMaterial color={SKIN} roughness={0.7} />
      </mesh>
    </group>
  )
}
