import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRoomStore } from '../../store/useRoomStore'
import { Sfx } from '../../systems/audioSystem'

// Transient bottom-centre notification for achievements, saves, etc.
export function Toast() {
  const toast = useRoomStore((s) => s.toast)
  const clearToast = useRoomStore((s) => s.clearToast)

  useEffect(() => {
    if (!toast) return
    if (toast.tone === 'success') Sfx.success()
    else Sfx.click()
    const id = window.setTimeout(clearToast, 3200)
    return () => window.clearTimeout(id)
  }, [toast, clearToast])

  return (
    <div className="pointer-events-none absolute bottom-24 left-1/2 z-30 -translate-x-1/2">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            className={`hud-panel px-4 py-2 text-sm font-medium ${
              toast.tone === 'success' ? 'text-accent-soft' : 'text-white/90'
            }`}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
