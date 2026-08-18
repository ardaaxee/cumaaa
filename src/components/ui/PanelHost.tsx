import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useRoomStore } from '../../store/useRoomStore'
import { usePlayerStore } from '../../store/usePlayerStore'
import { PanelFrame } from './PanelFrame'
import { PcOs } from '../pc/PcOs'
import { TasksView } from '../pc/views/TasksView'
import { NotesView } from '../pc/views/NotesView'
import { MusicView } from '../pc/views/MusicView'
import { WindowPanel } from '../pc/views/WindowPanel'
import { BedView } from '../pc/views/BedView'
import { SecretView } from '../pc/views/SecretView'
import { AchievementsView } from '../pc/views/AchievementsView'

// Renders whichever panel is active and centrally manages control state:
// movement/look input and pointer lock are suspended while any panel is open,
// and the camera focus animation is released on close.
export function PanelHost() {
  const activePanel = useRoomStore((s) => s.activePanel)
  const setActivePanel = useRoomStore((s) => s.setActivePanel)

  useEffect(() => {
    const player = usePlayerStore.getState()
    if (activePanel) {
      player.setInputEnabled(false)
      player.setMove(0, 0)
      if (document.pointerLockElement) document.exitPointerLock()
    } else {
      player.setInputEnabled(true)
      player.setFocusTarget(null)
    }
  }, [activePanel])

  const close = () => setActivePanel(null)

  return (
    <AnimatePresence>
      {activePanel === 'pc' && <PcOs key="pc" onClose={close} />}

      {activePanel === 'taskboard' && (
        <PanelFrame key="taskboard" title="Task Board" subtitle="Today" onClose={close}>
          <TasksView />
        </PanelFrame>
      )}

      {activePanel === 'archive' && (
        <PanelFrame key="archive" title="ARDA Archive" subtitle="Notes · Ideas · Memories" onClose={close} wide>
          <NotesView categories={['note', 'idea', 'memory']} />
        </PanelFrame>
      )}

      {activePanel === 'music' && (
        <PanelFrame key="music" title="Music" subtitle="Local playlist" onClose={close}>
          <MusicView />
        </PanelFrame>
      )}

      {activePanel === 'window' && (
        <PanelFrame key="window" title="Window" subtitle="Outside" onClose={close}>
          <WindowPanel />
        </PanelFrame>
      )}

      {activePanel === 'bed' && (
        <PanelFrame key="bed" title="Bed" subtitle="Rest" onClose={close}>
          <BedView />
        </PanelFrame>
      )}

      {activePanel === 'achievements' && (
        <PanelFrame key="ach" title="Achievement Wall" subtitle="Progress" onClose={close} wide>
          <AchievementsView />
        </PanelFrame>
      )}

      {activePanel === 'secret' && (
        <PanelFrame key="secret" title="Private Room" subtitle="Hidden" onClose={close} wide>
          <SecretView />
        </PanelFrame>
      )}
    </AnimatePresence>
  )
}
