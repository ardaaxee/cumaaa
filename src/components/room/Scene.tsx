import { Sparkles } from '@react-three/drei'
import { RoomShell } from './RoomShell'
import { Lighting } from './Lighting'
import { StudioEnvironment } from './StudioEnvironment'
import { ContactAO } from './ContactAO'
import { SecretGate } from './SecretGate'
import { ArdaLab } from '../lab/ArdaLab'
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
import { PlayerController } from '../interaction/PlayerController'
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
      <SecretGate />
      {secretUnlocked && <ArdaLab quality={quality} />}
      <Desk />
      <Chair />
      <Bookcase />
      <Bed />
      <Decor />
      <Details />
      <TaskBoardMesh />
      <WindowView />
      <AchievementWallMesh />

      {/* Floating dust motes catch the light and add depth */}
      {enrich && (
        <Sparkles
          count={quality === 'high' ? 60 : 30}
          scale={[ROOM.width - 1, ROOM.height - 0.6, ROOM.depth - 1]}
          position={[0, ROOM.height / 2, 0]}
          size={1.6}
          speed={0.18}
          opacity={0.35}
          color="#bcd6f0"
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
      <InteractionManager />
      <FirstFrameSignal />
    </>
  )
}
