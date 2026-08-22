import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRoomStore } from '../../store/useRoomStore'
import { unlockAudio, Sfx } from '../../systems/audioSystem'

// Cinematic intro overlay. Shows the title, then hands control to the user.
// A gesture (Enter/Skip) is required anyway to satisfy audio autoplay policy.
export function Intro() {
  const finishIntro = useRoomStore((s) => s.finishIntro)
  const soundEnabled = useRoomStore((s) => s.settings.soundEnabled)
  const [showEnter, setShowEnter] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setShowEnter(true), 2200)
    return () => window.clearTimeout(id)
  }, [])

  const enter = () => {
    if (soundEnabled) {
      unlockAudio()
      Sfx.success()
    }
    finishIntro()
  }

  return (
    <motion.div
      className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black px-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <button
        onClick={enter}
        className="absolute right-4 top-4 font-mono text-xs tracking-widest text-white/40 hover:text-white/80"
      >
        SKIP →
      </button>

      <motion.h1
        className="font-mono text-4xl font-bold tracking-[0.4em] text-white sm:text-6xl"
        initial={{ opacity: 0, y: 16, letterSpacing: '0.1em' }}
        animate={{ opacity: 1, y: 0, letterSpacing: '0.4em' }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
      >
        ARDA ROOM
      </motion.h1>

      <motion.p
        className="mt-4 font-mono text-xs tracking-[0.5em] text-accent-soft/80 sm:text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1.2 }}
      >
        PERSONAL DIGITAL SPACE
      </motion.p>

      <motion.div
        className="mt-14 h-[1px] w-40 bg-gradient-to-r from-transparent via-accent to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
      />

      {showEnter && (
        <motion.button
          onClick={enter}
          className="mt-12 rounded-full border border-accent/50 bg-accent/10 px-8 py-3 font-mono text-sm tracking-[0.3em] text-accent-soft hover:bg-accent/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          ENTER
        </motion.button>
      )}
    </motion.div>
  )
}
