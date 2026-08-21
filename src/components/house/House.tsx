import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { HouseRoomShell } from './HouseRoomShell'
import { HouseLighting } from './HouseLighting'
import { SkyDome } from './SkyDome'
import { Rain } from '../weather/Rain'
import { Neighbourhood } from '../exterior/Neighbourhood'
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
import { GuestBedroom } from './rooms/GuestBedroom'
import { Bathroom2, Laundry, Corridor } from './rooms/NorthWing'
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

  const woodFloorMat = { color: '#5a4632', map: wood.map, normalMap: wood.normalMap, roughness: 0.76, metalness: 0.05 }
  const plasterWallMat = { color: '#7a7264', map: plaster.map, normalMap: plaster.normalMap, roughness: 0.94, metalness: 0.02 }

  return (
    <group>
      {/* Directional daylight for the apartment (soft PCF shadows on HIGH) */}
      <HouseLighting quality={quality} />
      <SkyDome />
      <Rain quality={quality} />
      <Neighbourhood quality={quality} />

      {/* ---- Shells (always rendered) ---- */}
      <HouseRoomShell room={roomById('hallway')} floor={woodFloorMat} wall={plasterWallMat} />
      <HouseRoomShell room={roomById('living')} floor={woodFloorMat} wall={{ ...plasterWallMat, color: '#817868' }} windowDetail={winDetail} />
      <HouseRoomShell
        room={roomById('kitchen')}
        floor={{ color: '#cdc7bd', map: floorTile.map, normalMap: floorTile.normalMap, roughness: 0.55, metalness: 0.05 }}
        wall={{ ...plasterWallMat, color: '#867c6c' }}
        windowDetail={winDetail}
      />
      <HouseRoomShell room={roomById('bedroom')} floor={woodFloorMat} wall={{ ...plasterWallMat, color: '#7c7365' }} ceilingColor="#3a352d" windowDetail={winDetail} />
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

      {/* ---- North (sleeping) wing: corridor, 3 bedrooms, bathroom, laundry ---- */}
      <HouseRoomShell room={roomById('corridor')} floor={woodFloorMat} wall={{ ...plasterWallMat, color: '#8d8477' }} ceilingColor="#4a453c" />
      <HouseRoomShell room={roomById('bedroom2')} floor={woodFloorMat} wall={{ ...plasterWallMat, color: '#7a7263' }} windowDetail={winDetail} />
      <HouseRoomShell room={roomById('bedroom3')} floor={woodFloorMat} wall={{ ...plasterWallMat, color: '#807768' }} windowDetail={winDetail} />
      <HouseRoomShell room={roomById('bedroom4')} floor={woodFloorMat} wall={{ ...plasterWallMat, color: '#7b7264' }} windowDetail={winDetail} />
      <HouseRoomShell
        room={roomById('bathroom2')}
        floor={{ color: '#dce0de', map: bathTile.map, normalMap: bathTile.normalMap, roughness: 0.4, metalness: 0.05 }}
        wall={{ color: '#c7ccca', map: bathTile.map, normalMap: bathTile.normalMap, roughness: 0.45, metalness: 0.05 }}
        ceilingColor="#e6e8e6"
        skirting="#b6bbb9"
        windowDetail={winDetail}
      />
      <HouseRoomShell
        room={roomById('laundry')}
        floor={{ color: '#cdc7bd', map: floorTile.map, normalMap: floorTile.normalMap, roughness: 0.55, metalness: 0.05 }}
        wall={{ ...plasterWallMat, color: '#b4aea2' }}
        ceilingColor="#d8dad6"
        skirting="#b0aca4"
      />

      {/* Decorative door leaves in the main doorways */}
      <Door position={[0, 0, 6]} rotation={[0, 0, 0]} width={1.2} height={2.25} open={mainDoorOpen ? 0.75 : 0.02} />
      <Door position={[-1.5, 0, 8.6]} rotation={[0, Math.PI / 2, 0]} open={0.6} />
      <Door position={[1.5, 0, 8.6]} rotation={[0, -Math.PI / 2, 0]} open={0.6} />
      <Door position={[-0.6, 0, 14]} rotation={[0, Math.PI, 0]} open={0.5} />
      {/* North-wing doors */}
      <Door position={[0.4, 0, 22]} rotation={[0, Math.PI, 0]} open={0.55} />
      <Door position={[-6, 0, 23.5]} rotation={[0, Math.PI / 2, 0]} open={0.6} />
      <Door position={[-3, 0, 25]} rotation={[0, 0, 0]} open={0.5} />
      <Door position={[3, 0, 25]} rotation={[0, 0, 0]} open={0.45} />
      <Door position={[10, 0, 23.5]} rotation={[0, -Math.PI / 2, 0]} open={0.5} />
      <Door position={[12, 0, 25.5]} rotation={[0, 0, 0]} width={1.0} open={0.4} />

      {/* ---- Furniture + lights (distance-culled) ---- */}
      <RoomGroup center={[0, 10]} radius={cull}><Hallway /></RoomGroup>
      <RoomGroup center={[-5.75, 10]} radius={cull}><LivingRoom /></RoomGroup>
      <RoomGroup center={[5.5, 10]} radius={cull}><Kitchen /></RoomGroup>
      <RoomGroup center={[-2.25, 18]} radius={cull}><Bedroom /></RoomGroup>
      <RoomGroup center={[3.5, 16.5]} radius={cull}><Bathroom /></RoomGroup>
      <RoomGroup center={[7.75, 15.5]} radius={cull}><Storage /></RoomGroup>
      <RoomGroup center={[-11.3, 10]} radius={cull}><Balcony /></RoomGroup>

      {/* North wing furniture (distance-culled like the rest) */}
      <RoomGroup center={[2, 23.5]} radius={cull}><Corridor /></RoomGroup>
      {/* Bedroom 2: door east, window west — bed backs onto the north wall, the
          wardrobe takes the windowless south end of the west wall. */}
      <RoomGroup center={[-9, 24.5]} radius={cull}>
        <GuestBedroom
          id="bd2"
          room={roomById('bedroom2')}
          daylight={[-11.7, 1.65, 24.5]}
          double
          bed={{ pos: [-9, 26.8], rotY: Math.PI }}
          wardrobe={{ pos: [-11.55, 22.2], rotY: 0 }}
          art={{ pos: [-9, 1.75, 21.16], rotY: 0 }}
          style={{ duvet: '#6b7f8a', accent: '#8a7f6a', wood: '#5a4632' }}
        />
      </RoomGroup>
      {/* Bedroom 3: door south, window north — bed backs onto the west wall so
          the window stays clear, wardrobe against the east wall. */}
      <RoomGroup center={[-3, 28]} radius={cull}>
        <GuestBedroom
          id="bd3"
          room={roomById('bedroom3')}
          daylight={[-3, 1.65, 30.7]}
          bed={{ pos: [-4.82, 28.2], rotY: Math.PI / 2 }}
          wardrobe={{ pos: [-0.45, 29.4], rotY: Math.PI }}
          art={{ pos: [-5.0, 1.75, 25.16], rotY: 0 }}
          style={{ duvet: '#7f8a6b', accent: '#9a8f7a', wood: '#63503a' }}
        />
      </RoomGroup>
      {/* Bedroom 4: mirror of bedroom 3 — bed against the east wall. */}
      <RoomGroup center={[3, 28]} radius={cull}>
        <GuestBedroom
          id="bd4"
          room={roomById('bedroom4')}
          daylight={[3, 1.65, 30.7]}
          bed={{ pos: [4.82, 28.2], rotY: -Math.PI / 2 }}
          wardrobe={{ pos: [0.45, 29.4], rotY: 0 }}
          art={{ pos: [5.0, 1.75, 25.16], rotY: 0 }}
          style={{ duvet: '#8a6b7f', accent: '#7a8a9a', wood: '#54402e' }}
        />
      </RoomGroup>
      <RoomGroup center={[12, 23.2]} radius={cull}><Bathroom2 /></RoomGroup>
      <RoomGroup center={[12, 27.2]} radius={cull}><Laundry /></RoomGroup>
    </group>
  )
}
