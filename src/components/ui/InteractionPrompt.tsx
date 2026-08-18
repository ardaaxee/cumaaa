import { AnimatePresence, motion } from 'framer-motion'
import { useInteractionStore } from '../../systems/interactionSystem'
import { usePlayerStore } from '../../store/usePlayerStore'

// Shows the focused object's name + how to interact. Wording adapts to input.
export function InteractionPrompt() {
  const focus = useInteractionStore((s) => s.focus)
  const isTouch = usePlayerStore((s) => s.isTouch)

  return (
    <div className="pointer-events-none absolute left-1/2 top-[58%] z-10 -translate-x-1/2">
      <AnimatePresence>
        {focus && (
          <motion.div
            key={focus.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18 }}
            className="hud-panel px-4 py-2 text-center"
          >
            <div className="text-sm font-semibold text-white">{focus.label}</div>
            <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-accent-soft">
              {isTouch ? `Tap ⊙ — ${focus.prompt}` : `[E] / Click — ${focus.prompt}`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
