import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { HouseRoomShell } from './HouseRoomShell'
import { HouseLighting } from './HouseLighting'
import { roomById } from '../../config/houseLayout'
import { useWorldFlag, WORLD_FLAGS } from '../../systems/world'
import { woodFloor, wall as wallTex, tile } from '../../utils/textures'
import { Door } from './props'
import { Hallway } from './rooms/Hallway'
import { LivingRoom } from './rooms/Living'
import { Kitchen } from './rooms/Kitchen'
import { Bedroom } from './rooms/Bedroom'
import { Bathroom } from './rooms/Bathroom'
import { Storage } from './rooms/Storage'
import { Balcony } from './rooms/Balcony'
import type { GraphicsQuality } from '../../types'

// Distance-cull a room's furniture + lights (walls stay so occlusion is right).
function RoomGroup({
  center,
  radius,
  children,
}: {
  center: [number, number]
  radius: number
  children: React.ReactNode
}) {
  const ref = useRef<THREE.Group>(null)
  const frame = useRef(0)
  useFrame(({ camera }) => {
    if (frame.current++ % 12 !== 0) return
    const d = Math.hypot(camera.position.x - center[0], camera.position.z - center[1])
    if (ref.current) ref.current.visible = d < radius
  })
  return <group ref={ref}>{children}</group>
}

// The whole apartment attached to the study (which stays as-is). Shells are
// always rendered (cheap boxes, correct occlusion); furniture + lights are
// distance-culled for performance.
export function House({ quality }: { quality: GraphicsQuality }) {
  const wood = useMemo(() => woodFloor(), [])
  const plaster = useMemo(() => wallTex(), [])
  const floorTile = useMemo(() => tile('#cdc7bd'), [])
  const bathTile = useMemo(() => tile('#dce0de'), [])
  const cull = quality === 'low' ? 11 : 15
  const winDetail = quality === 'low' ? 0 : 1
  const mainDoorOpen = useWorldFlag(WORLD_FLAGS.mainDoor)

  const woodFloorMat = { color: '#3a2c1e', map: wood.map, normalMap: wood.normalMap, roughness: 0.78, metalness: 0.06 }
  const plasterWallMat = { color: '#4a443a', map: plaster.map, normalMap: plaster.normalMap, roughness: 0.92, metalness: 0.03 }

  return (
    <group>
      {/* Directional daylight for the apartment (soft PCF shadows on HIGH) */}
      <HouseLighting quality={quality} />

      {/* ---- Shells (always rendered) ---- */}
      <HouseRoomShell room={roomById('hallway')} floor={woodFloorMat} wall={plasterWallMat} />
      <HouseRoomShell room={roomById('living')} floor={woodFloorMat} wall={{ ...plasterWallMat, color: '#514a3f' }} windowDetail={winDetail} />
      <HouseRoomShell
        room={roomById('kitchen')}
        floor={{ color: '#cdc7bd', map: floorTile.map, normalMap: floorTile.normalMap, roughness: 0.55, metalness: 0.05 }}
        wall={{ ...plasterWallMat, color: '#565044' }}
        windowDetail={winDetail}
      />
      <HouseRoomShell room={roomById('bedroom')} floor={woodFloorMat} wall={{ ...plasterWallMat, color: '#4f463c' }} ceilingColor="#2a251f" windowDetail={winDetail} />
      <HouseRoomShell
        room={roomById('bathroom')}
        floor={{ color: '#dce0de', map: bathTile.map, normalMap: bathTile.normalMap, roughness: 0.4, metalness: 0.05 }}
        wall={{ color: '#c7ccca', map: bathTile.map, normalMap: bathTile.normalMap, roughness: 0.45, metalness: 0.05 }}
        ceilingColor="#e6e8e6"
        skirting="#b6bbb9"
        windowDetail={winDetail}
      />
      <HouseRoomShell
        room={roomById('storage')}
        floor={{ color: '#5a5650', roughness: 0.95, metalness: 0.02 }}
        wall={{ color: '#4a463e', roughness: 0.98 }}
        ceilingColor="#28241e"
        skirting="#5a544a"
      />

      {/* Decorative door leaves in the main doorways */}
      <Door position={[0, 0, 6]} rotation={[0, 0, 0]} width={1.2} height={2.25} open={mainDoorOpen ? 0.75 : 0.02} />
      <Door position={[-1.5, 0, 8.6]} rotation={[0, Math.PI / 2, 0]} open={0.6} />
      <Door position={[1.5, 0, 8.6]} rotation={[0, -Math.PI / 2, 0]} open={0.6} />
      <Door position={[-0.6, 0, 14]} rotation={[0, Math.PI, 0]} open={0.5} />

      {/* ---- Furniture + lights (distance-culled) ---- */}
      <RoomGroup center={[0, 10]} radius={cull}><Hallway /></RoomGroup>
      <RoomGroup center={[-5.75, 10]} radius={cull}><LivingRoom /></RoomGroup>
      <RoomGroup center={[5.5, 10]} radius={cull}><Kitchen /></RoomGroup>
      <RoomGroup center={[-2.25, 18]} radius={cull}><Bedroom /></RoomGroup>
      <RoomGroup center={[3.5, 16.5]} radius={cull}><Bathroom /></RoomGroup>
      <RoomGroup center={[7.75, 15.5]} radius={cull}><Storage /></RoomGroup>
      <RoomGroup center={[-11.3, 10]} radius={cull}><Balcony /></RoomGroup>
    </group>
  )
}
