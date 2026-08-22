import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRoomStore } from '../../store/useRoomStore'
import { useClock } from '../../hooks/useClock'
import { Sfx } from '../../systems/audioSystem'
import { ProfileView } from './views/ProfileView'
import { ProjectsView } from './views/ProjectsView'
import { TasksView } from './views/TasksView'
import { NotesView } from './views/NotesView'
import { AiView } from './views/AiView'
import { AchievementsView } from './views/AchievementsView'
import { StatsView } from './views/StatsView'
import { SettingsView } from './views/SettingsView'

type Tab = 'profile' | 'projects' | 'tasks' | 'archive' | 'ai' | 'achievements' | 'stats' | 'settings'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'profile', label: 'Profile', icon: '◐' },
  { id: 'projects', label: 'Projects', icon: '◆' },
  { id: 'tasks', label: 'Tasks', icon: '✓' },
  { id: 'archive', label: 'Archive', icon: '✎' },
  { id: 'ai', label: 'AI', icon: '⌁' },
  { id: 'achievements', label: 'Achievements', icon: '★' },
  { id: 'stats', label: 'Stats', icon: '▦' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
]

// Full ARDA OS desktop: sidebar navigation + content views. Rendered when the
// player enters the workstation.
export function PcOs({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('profile')
  const name = useRoomStore((s) => s.profile.name)
  const { time } = useClock()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        Sfx.close()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center p-2 sm:p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="hud-panel relative flex h-[92vh] w-full max-w-6xl overflow-hidden"
      >
        {/* Sidebar */}
        <aside className="flex w-16 flex-col border-r border-white/10 bg-ink-950/60 py-3 sm:w-52 sm:px-3">
          <div className="mb-4 px-1 text-center sm:px-2 sm:text-left">
            <div className="font-mono text-sm font-bold tracking-[0.2em] text-white">
              ARDA<span className="text-accent"> OS</span>
            </div>
            <div className="hidden font-mono text-[10px] text-white/30 sm:block">v1.0 · {name}</div>
          </div>
          <nav className="flex flex-1 flex-col gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  Sfx.click()
                  setTab(t.id)
                }}
                className={`os-tab justify-center sm:justify-start ${tab === t.id ? 'os-tab-active' : ''}`}
              >
                <span className="text-base">{t.icon}</span>
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </nav>
          <div className="hidden px-2 pt-3 font-mono text-[10px] text-white/25 sm:block">{time}</div>
        </aside>

        {/* Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex items-center justify-between border-b border-white/10 px-5 py-3">
            <h2 className="text-base font-semibold capitalize text-white">
              {TABS.find((t) => t.id === tab)?.label}
            </h2>
            <button className="hud-btn !px-2.5 !py-1 text-xs" onClick={onClose}>
              ✕ EXIT
            </button>
          </header>
          <div className="scroll-thin flex-1 overflow-y-auto p-5">
            {tab === 'profile' && <ProfileView />}
            {tab === 'projects' && <ProjectsView />}
            {tab === 'tasks' && <TasksView />}
            {tab === 'archive' && <NotesView categories={['note', 'idea', 'memory']} />}
            {tab === 'ai' && <AiView />}
            {tab === 'achievements' && <AchievementsView />}
            {tab === 'stats' && <StatsView />}
            {tab === 'settings' && <SettingsView />}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
