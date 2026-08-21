import * as THREE from 'three'
import type { GlassesSpec } from '../../config/appearance'

// Real spectacles: two rims, two lenses, a bridge across the nose, hinges, and
// arms that run back to the ears and hook down behind them.
//
// Mounted inside the HEAD group, so they move with the head because they are
// attached to it — there is nothing to keep in sync. They sit proud of the face
// on nose pads rather than being pushed into the cheeks.
export function Glasses({ spec, detail }: { spec: GlassesSpec; detail: boolean }) {
  const r = spec.lensRadius
  const t = spec.thickness
  // Where the lenses sit: just in front of the eyes, level with them.
  const z = 0.106
  const y = 0.008
  const x = 0.0325

  const frameMat = (
    <meshStandardMaterial color={spec.frame} metalness={0.72} roughness={0.32} />
  )

  return (
    <group>
      {([-1, 1] as const).map((s) => (
        <group key={s} position={[s * x, y, z]}>
          {/* rim */}
          <mesh rotation={[0, 0, 0]}>
            {spec.shape === 'round' ? (
              <torusGeometry args={[r, t, detail ? 8 : 5, detail ? 28 : 16]} />
            ) : (
              <torusGeometry args={[r, t, detail ? 8 : 5, 4]} />
            )}
            {frameMat}
          </mesh>
          {/* lens — nearly clear, but it catches the light and it refracts a
              little, which is what makes glasses read as glass */}
          <mesh position={[0, 0, -0.001]}>
            <circleGeometry args={[r - t * 0.4, detail ? 28 : 14]} />
            <meshPhysicalMaterial
              color={spec.lens}
              transparent
              opacity={spec.lensOpacity}
              roughness={0.03}
              metalness={0}
              clearcoat={1}
              clearcoatRoughness={0.02}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          {/* nose pad, on the inner side */}
          <mesh position={[s * -r * 0.72, -r * 0.34, -0.008]} rotation={[0, 0, s * 0.5]} scale={[1, 1.6, 0.6]}>
            <sphereGeometry args={[0.0035, 6, 6]} />
            <meshStandardMaterial color={spec.frame} roughness={0.5} metalness={0.3} />
          </mesh>
          {/* hinge at the outer edge */}
          <mesh position={[s * r * 0.98, 0, -0.002]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[t * 1.7, t * 1.7, 0.006, 6]} />
            {frameMat}
          </mesh>
        </group>
      ))}

      {/* Bridge across the nose */}
      <mesh position={[0, y + r * 0.28, z - 0.004]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
        <torusGeometry args={[0.014, t, 5, detail ? 14 : 8, Math.PI]} />
        {frameMat}
      </mesh>

      {/* Arms: back along the temple, then a hook down behind the ear */}
      {([-1, 1] as const).map((s) => (
        <group key={s}>
          <mesh position={[s * (x + r * 0.96), y - 0.004, z - 0.055]} rotation={[0.06, s * 0.26, 0]}>
            <boxGeometry args={[t * 1.6, t * 2.6, 0.108]} />
            {frameMat}
          </mesh>
          <mesh position={[s * 0.074, y - 0.012, 0.0]} rotation={[0.1, s * 0.4, 0]}>
            <boxGeometry args={[t * 1.6, t * 2.6, 0.085]} />
            {frameMat}
          </mesh>
          {/* the bit that hooks down behind the ear */}
          <mesh position={[s * 0.076, -0.02, -0.036]} rotation={[0.55, s * 0.2, 0]}>
            <capsuleGeometry args={[t * 1.5, 0.022, 2, 5]} />
            {frameMat}
          </mesh>
        </group>
      ))}
    </group>
  )
}
