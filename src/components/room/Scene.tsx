import { RoomShell } from './RoomShell'
import { Lighting } from './Lighting'
import { TaskBoardMesh } from './TaskBoardMesh'
import { WindowView } from './WindowView'
import { AchievementWallMesh } from './AchievementWallMesh'
import { Desk } from '../furniture/Desk'
import { Chair } from '../furniture/Chair'
import { Bookcase } from '../furniture/Bookcase'
import { Bed } from '../furniture/Bed'
import { Decor } from '../furniture/Decor'
import { PlayerController } from '../interaction/PlayerController'
import { InteractionManager } from '../interaction/InteractionManager'
import { FirstFrameSignal } from './FirstFrameSignal'
import { InteractableTrigger } from '../interaction/InteractableTrigger'
import { INTERACTABLES } from '../../config/interactables'
import type { GraphicsQuality } from '../../types'

// Assembles the entire 3D world plus the control + interaction systems.
export function Scene({ quality }: { quality: GraphicsQuality }) {
  return (
    <>
      <Lighting quality={quality} />

      <RoomShell />
      <Desk />
      <Chair />
      <Bookcase />
      <Bed />
      <Decor />
      <TaskBoardMesh />
      <WindowView />
      <AchievementWallMesh />

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
