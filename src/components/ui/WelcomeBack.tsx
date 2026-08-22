import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { useRoomStore } from '../../store/useRoomStore'

// "WELCOME BACK, ARDA" flash shown when returning after a long absence.
export function WelcomeBack() {
  const welcomeBack = useRoomStore((s) => s.welcomeBack)
  const dismiss = useRoomStore((s) => s.dismissWelcome)
  const name = useRoomStore((s) => s.profile.name)

  useEffect(() => {
    if (!welcomeBack) return
    const id = window.setTimeout(dismiss, 4000)
    return () => window.clearTimeout(id)
  }, [welcomeBack, dismiss])

  return (
    <AnimatePresence>
      {welcomeBack && (
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-1/3 z-30 flex flex-col items-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <div className="font-mono text-[11px] tracking-[0.4em] text-accent-soft/70">
            WELCOME BACK
          </div>
          <div className="mt-1 font-mono text-3xl font-bold tracking-[0.2em] text-white">
            {name}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
