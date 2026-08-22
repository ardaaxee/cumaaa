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
import { ProjectsView } from '../pc/views/ProjectsView'
import { AiView } from '../pc/views/AiView'
import { StatsView } from '../pc/views/StatsView'
import { TerminalView } from '../pc/views/TerminalView'
import { FutureProjectsView } from '../pc/views/FutureProjectsView'
import { CurrentProjectView } from '../pc/views/CurrentProjectView'
import { ProjectArchiveView } from '../pc/views/ProjectArchiveView'
import { ActivityWallView } from '../pc/views/ActivityWallView'

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

      {/* ---- Memory objects (personalization) ---- */}
      {activePanel === 'currentProject' && (
        <PanelFrame key="curProj" title="Current Project" subtitle="On the desk" onClose={close}>
          <CurrentProjectView />
        </PanelFrame>
      )}

      {activePanel === 'projectArchive' && (
        <PanelFrame key="projArch" title="Project Archive" subtitle="Project history" onClose={close} wide>
          <ProjectArchiveView />
        </PanelFrame>
      )}

      {activePanel === 'activityWall' && (
        <PanelFrame key="activity" title="ARDA Activity" subtitle="Recent" onClose={close}>
          <ActivityWallView />
        </PanelFrame>
      )}

      {/* ---- ARDA LAB stations ---- */}
      {activePanel === 'labHologram' && (
        <PanelFrame key="labHologram" title="Project Hologram" subtitle="ARDA LAB" onClose={close} wide>
          <ProjectsView />
        </PanelFrame>
      )}

      {activePanel === 'labTerminal' && (
        <PanelFrame key="labTerminal" title="Code Terminal" subtitle="ARDA LAB · simulated" onClose={close} wide>
          <TerminalView />
        </PanelFrame>
      )}

      {activePanel === 'labAi' && (
        <PanelFrame key="labAi" title="ARDA AI Terminal" subtitle="ARDA LAB" onClose={close} wide>
          <AiView />
        </PanelFrame>
      )}

      {activePanel === 'labCore' && (
        <PanelFrame key="labCore" title="Project Core" subtitle="ARDA LAB · live stats" onClose={close} wide>
          <StatsView />
        </PanelFrame>
      )}

      {activePanel === 'labIdeas' && (
        <PanelFrame key="labIdeas" title="Idea Wall" subtitle="ARDA LAB · ideas & private" onClose={close} wide>
          <NotesView categories={['idea', 'private']} />
        </PanelFrame>
      )}

      {activePanel === 'labAchievements' && (
        <PanelFrame key="labAchievements" title="Achievement Core" subtitle="ARDA LAB" onClose={close} wide>
          <AchievementsView />
        </PanelFrame>
      )}

      {activePanel === 'labFuture' && (
        <PanelFrame key="labFuture" title="Future Projects" subtitle="ARDA LAB · roadmap" onClose={close} wide>
          <FutureProjectsView />
        </PanelFrame>
      )}
    </AnimatePresence>
  )
}
