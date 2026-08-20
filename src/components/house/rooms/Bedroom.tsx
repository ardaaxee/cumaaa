import { useMemo } from 'react'
import { MeshReflectorMaterial } from '@react-three/drei'
import { useCollider } from '../../furniture/useCollider'
import { fabric } from '../../../utils/textures'
import { useRoomStore } from '../../../store/useRoomStore'
import { CeilingLamp, Rug, FramedArt } from '../props'
import { WindowDaylight } from '../Window'

// Bedroom — a made-but-slept-in double bed, nightstands with warm lamps, a
// wardrobe with clothes, a dresser + mirror. Cloth + wood, soft warm light.
export function Bedroom() {
  const duvet = useMemo(() => fabric('#8a6f8a', 'bd_duvet'), [])
  const sheet = useMemo(() => fabric('#c4bcae', 'bd_sheet'), [])
  const pillow = useMemo(() => fabric('#d4ccbe', 'bd_pillow'), [])
  const clothes = useMemo(() => fabric('#5a6b7a', 'bd_clothes'), [])
  const quality = useRoomStore((s) => s.settings.quality)

  const bx = -2.25
  const bedZ = 20.9

  useCollider('bed2', [bx, 0, bedZ], [1.7, 0.6, 2.1])
  useCollider('bed2-wardrobe', [-5.6, 0, 16.5], [0.7, 2, 1.8])
  useCollider('bed2-dresser', [-4.6, 0, 14.5], [1.3, 1, 0.5])

  return (
    <group>
      <CeilingLamp position={[bx, 2.78, 18]} intensity={0.85} />
      {/* Morning daylight through the west window */}
      <WindowDaylight position={[-5.35, 1.65, 19.5]} />
      <Rug position={[bx, 0.02, 19.2]} size={[2.6, 2.0]} color="#5a4f42" />

      {/* Double bed against the north wall */}
      <group position={[bx, 0, bedZ]}>
        <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.7, 0.28, 2.1]} />
          <meshStandardMaterial color="#4a3826" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[1.62, 0.18, 2.0]} />
          <meshStandardMaterial color="#c4bcae" map={sheet.map} normalMap={sheet.normalMap} roughness={0.9} />
        </mesh>
        <mesh position={[0.03, 0.5, 0.35]} rotation={[0, 0.03, 0]} castShadow>
          <boxGeometry args={[1.64, 0.14, 1.3]} />
          <meshStandardMaterial color="#8a6f8a" map={duvet.map} normalMap={duvet.normalMap} roughness={0.92} />
        </mesh>
        <mesh position={[0.03, 0.55, -0.52]} rotation={[0.12, 0.02, 0]} castShadow>
          <boxGeometry args={[1.64, 0.1, 0.34]} />
          <meshStandardMaterial color="#7a6180" map={duvet.map} normalMap={duvet.normalMap} roughness={0.92} />
        </mesh>
        {[-0.38, 0.38].map((x, i) => (
          <mesh key={i} position={[x, 0.56, -0.82]} rotation={[0, i ? -0.1 : 0.12, i ? -0.03 : 0.04]} castShadow>
            <boxGeometry args={[0.62, 0.14, 0.4]} />
            <meshStandardMaterial color="#d4ccbe" map={pillow.map} normalMap={pillow.normalMap} roughness={0.95} />
          </mesh>
        ))}
        <mesh position={[0, 0.72, -1.02]} castShadow>
          <boxGeometry args={[1.7, 0.9, 0.1]} />
          <meshStandardMaterial color="#3c2c1c" roughness={0.75} />
        </mesh>
      </group>

      {/* Nightstands + warm lamps */}
      {[-1.15, 1.15].map((dx, i) => (
        <group key={i} position={[bx + dx, 0, bedZ - 0.85]}>
          <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.42, 0.56, 0.4]} />
            <meshStandardMaterial color="#4a3826" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.66, 0]}>
            <cylinderGeometry args={[0.09, 0.11, 0.16, 12]} />
            <meshStandardMaterial color="#d8cdba" emissive="#ffdcae" emissiveIntensity={0.5} roughness={0.7} />
          </mesh>
          <pointLight position={[0, 0.7, 0]} color="#ffcf9a" intensity={0.28} distance={3} decay={2} />
          {i === 0 && (
            <mesh position={[0, 0.58, 0.1]} rotation={[-Math.PI / 2, 0, 0.2]}>
              <boxGeometry args={[0.14, 0.18, 0.02]} />
              <meshStandardMaterial color="#c9bfa6" roughness={0.9} />
            </mesh>
          )}
        </group>
      ))}

      {/* Wardrobe (west wall), one door ajar showing clothes */}
      <group position={[-5.6, 0, 16.5]}>
        <mesh position={[0, 1, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.6, 2, 1.8]} />
          <meshStandardMaterial color="#5a4632" roughness={0.6} />
        </mesh>
        {/* interior (revealed) */}
        <mesh position={[0.28, 1, 0]}>
          <boxGeometry args={[0.02, 1.9, 1.7]} />
          <meshStandardMaterial color="#2a2018" roughness={0.9} />
        </mesh>
        {/* clothes on a rail */}
        {[-0.6, -0.35, -0.1, 0.15, 0.4, 0.6].map((z, i) => (
          <mesh key={i} position={[0.25, 1.15, z]} castShadow>
            <boxGeometry args={[0.12, 0.7, 0.16]} />
            <meshStandardMaterial color={['#5a6b7a', '#7a5f48', '#4a4a52', '#6e3a30'][i % 4]} map={clothes.map} normalMap={clothes.normalMap} roughness={0.95} />
          </mesh>
        ))}
        {/* ajar door */}
        <group position={[0.3, 0, -0.9]} rotation={[0, 0.6, 0]}>
          <mesh position={[0, 1, 0.45]} castShadow>
            <boxGeometry args={[0.04, 1.94, 0.86]} />
            <meshStandardMaterial color="#5a4632" roughness={0.6} />
          </mesh>
        </group>
        {/* closed door */}
        <mesh position={[-0.31, 1, 0.45]} castShadow>
          <boxGeometry args={[0.04, 1.94, 0.86]} />
          <meshStandardMaterial color="#54402e" roughness={0.6} />
        </mesh>
      </group>

      {/* Dresser + mirror on the south wall */}
      <group position={[-4.6, 0, 14.35]}>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.3, 1.0, 0.46]} />
          <meshStandardMaterial color="#4a3826" roughness={0.6} />
        </mesh>
        {[0.25, 0.55, 0.85].map((y, i) => (
          <mesh key={i} position={[0, y, 0.24]}>
            <boxGeometry args={[1.2, 0.02, 0.02]} />
            <meshStandardMaterial color="#3a2c1c" roughness={0.6} />
          </mesh>
        ))}
        {/* wall mirror above — a real reflection on HIGH, a simple polished
            plane on MEDIUM/LOW to keep mobile fast */}
        <mesh position={[0, 1.7, 0.02]}>
          <boxGeometry args={[0.66, 0.9, 0.04]} />
          <meshStandardMaterial color="#2a241c" roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.7, 0.041]}>
          <planeGeometry args={[0.56, 0.8]} />
          {quality === 'high' ? (
            <MeshReflectorMaterial
              mirror={1}
              resolution={256}
              mixBlur={1}
              mixStrength={1.1}
              blur={[120, 60]}
              roughness={0.12}
              metalness={0.55}
              color="#aab4bb"
            />
          ) : (
            <meshStandardMaterial color="#8fa0a8" metalness={0.9} roughness={0.08} envMapIntensity={1} />
          )}
        </mesh>
        {/* small perfume/box on top */}
        <mesh position={[0.4, 1.06, 0]} castShadow>
          <boxGeometry args={[0.1, 0.14, 0.08]} />
          <meshStandardMaterial color="#b7a98e" roughness={0.4} />
        </mesh>
      </group>

      {/* Laundry basket + a jumper tossed on the floor */}
      <group position={[0.9, 0, 20.8]}>
        <mesh position={[0, 0.24, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.18, 0.48, 14]} />
          <meshStandardMaterial color="#9a8a6a" roughness={0.9} />
        </mesh>
        <mesh position={[0.05, 0.5, 0]}>
          <boxGeometry args={[0.2, 0.1, 0.2]} />
          <meshStandardMaterial color="#7a5f48" map={clothes.map} roughness={0.95} />
        </mesh>
      </group>

      <FramedArt position={[bx + 1.4, 1.8, 21.85]} rotation={[0, Math.PI, 0]} w={0.5} h={0.6} tone={['#6b6f74', '#2e2a24', '#c9a06a']} />
    </group>
  )
}
