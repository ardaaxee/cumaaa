import { useMemo } from 'react'
import { MeshReflectorMaterial } from '@react-three/drei'
import { useCollider } from '../../furniture/useCollider'
import { fabric } from '../../../utils/textures'
import { useRoomStore } from '../../../store/useRoomStore'
import { CeilingLamp, Rug, FramedArt } from '../props'
import { WindowDaylight } from '../Window'
import { Panel } from '../../furniture/Panel'
import { seeded, jitter, shadeVary } from '../../../systems/imperfections'

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
      <CeilingLamp position={[bx, 2.78, 18]} intensity={1.3} />
      {/* Morning daylight through the west window */}
      <WindowDaylight position={[-5.35, 1.65, 19.5]} />
      <Rug position={[bx, 0.02, 19.2]} size={[2.6, 2.0]} color="#5a4f42" />

      {/* Double bed — real layers: frame, mattress, fitted sheet, a duvet with
          folds, and pillows each at their own angle. Mattress top ~0.55 m. */}
      <group position={[bx, 0, bedZ]}>
        {/* frame / divan base, slightly inset so the mattress overhangs */}
        <Panel args={[1.66, 0.26, 2.06]} radius={0.02} position={[0, 0.21, 0]} receiveShadow>
          <meshStandardMaterial color="#4a3826" roughness={0.7} />
        </Panel>
        {/* mattress */}
        <Panel args={[1.72, 0.22, 2.1]} radius={0.05} position={[0, 0.45, 0]}>
          <meshStandardMaterial color="#cfc8bb" map={sheet.map} normalMap={sheet.normalMap} roughness={0.92} />
        </Panel>
        {/* fitted sheet over the mattress top */}
        <Panel args={[1.7, 0.05, 2.06]} radius={0.02} position={[0, 0.57, 0]}>
          <meshStandardMaterial color="#c4bcae" map={sheet.map} normalMap={sheet.normalMap} roughness={0.9} />
        </Panel>
        {/* duvet: three soft, slightly offset folds instead of one slab */}
        {[
          { z: 0.62, w: 1.66, h: 0.15, rx: 0.02, s: 'dv0' },
          { z: 0.06, w: 1.68, h: 0.17, rx: -0.02, s: 'dv1' },
          { z: -0.44, w: 1.66, h: 0.14, rx: 0.05, s: 'dv2' },
        ].map((d) => {
          const r = seeded(d.s)
          return (
            <Panel
              key={d.s}
              args={[d.w, d.h, 0.52]}
              radius={0.06}
              position={[0.02 + jitter(r, 0.02), 0.66 + jitter(r, 0.012), d.z + jitter(r, 0.02)]}
              rotation={[d.rx, jitter(r, 0.02), jitter(r, 0.012)]}
            >
              <meshStandardMaterial color={shadeVary('#8a6f8a', r, 0.06)} map={duvet.map} normalMap={duvet.normalMap} roughness={0.93} />
            </Panel>
          )
        })}
        {/* turned-back top edge of the duvet */}
        <Panel args={[1.66, 0.09, 0.3]} radius={0.04} position={[0.02, 0.71, -0.72]} rotation={[0.22, 0.01, 0]}>
          <meshStandardMaterial color="#9d86a0" map={duvet.map} normalMap={duvet.normalMap} roughness={0.93} />
        </Panel>
        {/* pillows, each settled at its own angle */}
        {[-0.4, 0.4].map((x, i) => {
          const r = seeded(`pil${i}`)
          return (
            <Panel
              key={i}
              args={[0.66, 0.16, 0.42]}
              radius={0.07}
              position={[x + jitter(r, 0.02), 0.68, -0.83 + jitter(r, 0.03)]}
              rotation={[jitter(r, 0.06), i ? -0.12 : 0.14, i ? -0.04 : 0.05]}
            >
              <meshStandardMaterial color={shadeVary('#d4ccbe', r, 0.04)} map={pillow.map} normalMap={pillow.normalMap} roughness={0.95} />
            </Panel>
          )
        })}
        {/* upholstered headboard */}
        <Panel args={[1.78, 0.92, 0.12]} radius={0.045} position={[0, 0.78, -1.05]}>
          <meshStandardMaterial color="#4a3f34" map={pillow.map} normalMap={pillow.normalMap} roughness={0.9} />
        </Panel>
        {/* slippers by the bed */}
        {[-0.16, 0.06].map((dx, i) => {
          const r = seeded(`slip${i}`)
          return (
            <Panel key={i} args={[0.11, 0.05, 0.26]} radius={0.025} position={[0.95 + dx, 0.03, 0.7 + jitter(r, 0.08)]} rotation={[0, 0.3 + jitter(r, 0.35), 0]}>
              <meshStandardMaterial color="#6b5f52" roughness={0.95} />
            </Panel>
          )
        })}
      </group>

      {/* Nightstands + warm lamps */}
      {[-1.15, 1.15].map((dx, i) => (
        <group key={i} position={[bx + dx, 0, bedZ - 0.85]}>
          <Panel args={[0.42, 0.52, 0.4]} radius={0.014} position={[0, 0.3, 0]} receiveShadow>
            <meshStandardMaterial color="#5a4632" roughness={0.7} />
          </Panel>
          {/* drawer front + small handle */}
          <Panel args={[0.36, 0.18, 0.02]} radius={0.008} position={[0, 0.34, 0.205]}>
            <meshStandardMaterial color="#63503a" roughness={0.6} />
          </Panel>
          <mesh position={[0, 0.34, 0.222]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.008, 0.008, 0.12, 8]} />
            <meshStandardMaterial color="#b8ae96" metalness={0.75} roughness={0.32} />
          </mesh>
          {/* feet */}
          {[-0.15, 0.15].map((fx, k) => (
            <mesh key={k} position={[fx, 0.03, 0.14]} castShadow>
              <cylinderGeometry args={[0.02, 0.016, 0.06, 8]} />
              <meshStandardMaterial color="#3a2c1c" roughness={0.6} />
            </mesh>
          ))}
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
        <Panel args={[0.6, 2, 1.8]} radius={0.016} position={[0, 1, 0]} receiveShadow>
          <meshStandardMaterial color="#5a4632" roughness={0.6} />
        </Panel>
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
        <Panel args={[1.3, 1.0, 0.46]} radius={0.016} position={[0, 0.5, 0]} receiveShadow>
          <meshStandardMaterial color="#5a4632" roughness={0.6} />
        </Panel>
        {/* three real drawer fronts with handles */}
        {[0.22, 0.52, 0.82].map((y, i) => (
          <group key={i}>
            <Panel args={[1.2, 0.26, 0.025]} radius={0.009} position={[0, y, 0.243]}>
              <meshStandardMaterial color="#63503a" roughness={0.58} />
            </Panel>
            <mesh position={[0, y, 0.262]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.009, 0.009, 0.26, 8]} />
              <meshStandardMaterial color="#b8ae96" metalness={0.75} roughness={0.32} />
            </mesh>
          </group>
        ))}
        {/* folded clothes stacked on top */}
        {[0, 1].map((i) => {
          const r = seeded(`fold${i}`)
          return (
            <Panel key={i} args={[0.28, 0.05, 0.22]} radius={0.018} position={[-0.34 + jitter(r, 0.02), 1.03 + i * 0.055, jitter(r, 0.02)]} rotation={[0, jitter(r, 0.12), 0]}>
              <meshStandardMaterial color={i ? '#7a8590' : '#8d7f6e'} map={clothes.map} normalMap={clothes.normalMap} roughness={0.95} />
            </Panel>
          )
        })}
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
