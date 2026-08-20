import { Sparkles } from '@react-three/drei'
import { RoomShell } from './RoomShell'
import { Lighting } from './Lighting'
import { StudioEnvironment } from './StudioEnvironment'
import { ContactAO } from './ContactAO'
import { SecretGate } from './SecretGate'
import { ArdaLab } from '../lab/ArdaLab'
import { House } from '../house/House'
import { useRoomStore } from '../../store/useRoomStore'
import { TaskBoardMesh } from './TaskBoardMesh'
import { WindowView } from './WindowView'
import { AchievementWallMesh } from './AchievementWallMesh'
import { Desk } from '../furniture/Desk'
import { Chair } from '../furniture/Chair'
import { Bookcase } from '../furniture/Bookcase'
import { Bed } from '../furniture/Bed'
import { Decor } from '../furniture/Decor'
import { Details } from '../furniture/Details'
import { Clutter } from '../furniture/Clutter'
import { MemoryObjects } from './MemoryObjects'
import { PlayerController } from '../interaction/PlayerController'
import { FirstPersonBody } from './FirstPersonBody'
import { PlayerShadow } from './PlayerShadow'
import { RemotePlayers } from '../multiplayer/RemotePlayers'
import { NetworkBridge } from '../multiplayer/NetworkBridge'
import { InteractionManager } from '../interaction/InteractionManager'
import { FirstFrameSignal } from './FirstFrameSignal'
import { InteractableTrigger } from '../interaction/InteractableTrigger'
import { INTERACTABLES } from '../../config/interactables'
import { ROOM } from '../../config/roomLayout'
import type { GraphicsQuality } from '../../types'

// Assembles the entire 3D world plus the control + interaction systems.
export function Scene({ quality }: { quality: GraphicsQuality }) {
  // IBL reflections and floating dust are immersion touches reserved for
  // medium/high so low-end devices stay fast.
  const enrich = quality !== 'low'
  // The lab is only built once the secret has been discovered (persisted).
  const secretUnlocked = useRoomStore((s) => s.secretUnlocked)

  return (
    <>
      <Lighting quality={quality} />
      {enrich && <StudioEnvironment />}

      <RoomShell quality={quality} />
      <ContactAO />
      <House quality={quality} />
      <SecretGate />
      {secretUnlocked && <ArdaLab quality={quality} />}
      <Desk />
      <Chair />
      <Bookcase />
      <Bed />
      <Decor />
      <Details />
      <Clutter />
      <MemoryObjects quality={quality} />
      <TaskBoardMesh />
      <WindowView />
      <AchievementWallMesh />

      {/* Faint dust motes — barely-there, only really seen in the light shafts */}
      {enrich && (
        <Sparkles
          count={quality === 'high' ? 40 : 22}
          scale={[ROOM.width - 1.5, ROOM.height - 0.8, ROOM.depth - 1.5]}
          position={[0, ROOM.height / 2, 0]}
          size={0.7}
          speed={0.1}
          opacity={0.12}
          color="#d8cbb2"
        />
      )}

      {INTERACTABLES.map((it) => (
        <InteractableTrigger
          key={it.info.id}
          info={it.info}
          position={it.position}
          radius={it.radius}
        />
      ))}

      <PlayerController />
      <FirstPersonBody quality={quality} />
      <PlayerShadow quality={quality} />
      <RemotePlayers quality={quality} />
      <NetworkBridge />
      <InteractionManager />
      <FirstFrameSignal />
    </>
  )
}
