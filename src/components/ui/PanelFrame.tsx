import { useEffect, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useRoomStore } from '../../store/useRoomStore'
import { Sfx } from '../../systems/audioSystem'

interface Props {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}

// Reusable modal shell for room-object panels. Handles Esc to close, backdrop,
// and consistent futuristic framing. Focus-trapped enough for keyboard use.
export function PanelFrame({ title, subtitle, onClose, children, wide }: Props) {
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

  const name = useRoomStore((s) => s.profile.name)

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-6">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => {
          Sfx.close()
          onClose()
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className={`hud-panel relative flex max-h-[92vh] w-full flex-col overflow-hidden ${
          wide ? 'max-w-5xl' : 'max-w-2xl'
        }`}
      >
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <div>
            <h2 className="text-base font-semibold tracking-wide text-white">{title}</h2>
            {subtitle && (
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-accent-soft/70">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 sm:block">
              {name}
            </span>
            <button
              className="hud-btn !px-2.5 !py-1 text-xs"
              onClick={() => {
                Sfx.close()
                onClose()
              }}
              aria-label="Close panel"
            >
              ✕ ESC
            </button>
          </div>
        </header>
        <div className="scroll-thin flex-1 overflow-y-auto p-5">{children}</div>
      </motion.div>
    </div>
  )
}
