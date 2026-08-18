import { motion } from 'framer-motion'
import { useBootStore } from '../../store/useBootStore'

const STEPS = [
  { at: 45, label: 'Loading systems…' },
  { at: 75, label: 'Loading room…' },
  { at: 100, label: 'Loading memories…' },
]

// Real-progress loading screen driven by boot milestones (see useBootStore).
export function LoadingScreen() {
  const hydrated = useBootStore((s) => s.hydrated)
  const contextReady = useBootStore((s) => s.contextReady)
  const firstFrame = useBootStore((s) => s.firstFrame)

  let progress = 10
  if (hydrated) progress = 45
  if (contextReady) progress = 75
  if (firstFrame) progress = 100

  const blocks = Math.round((progress / 100) * 10)

  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-ink-950 px-6 text-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-2 font-mono text-2xl font-bold tracking-[0.35em] text-white">
        ARDA ROOM
      </div>
      <div className="mb-8 font-mono text-[11px] tracking-[0.3em] text-accent-soft/70">
        INITIALIZING DIGITAL SPACE…
      </div>

      <div className="font-mono text-sm text-accent-soft">
        [{'█'.repeat(blocks)}
        <span className="text-white/20">{'░'.repeat(10 - blocks)}</span>] {progress}%
      </div>

      <ul className="mt-6 space-y-1 font-mono text-xs text-white/40">
        {STEPS.map((s) => (
          <li key={s.at} className={progress >= s.at ? 'text-accent-soft/80' : ''}>
            {progress >= s.at ? '✓ ' : '· '}
            {s.label}
          </li>
        ))}
      </ul>
    </motion.div>
  )
}
