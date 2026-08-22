import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useMultiplayerStore } from '../../store/useMultiplayerStore'
import { usePlayerStore } from '../../store/usePlayerStore'
import { MOVIE_CATALOG } from '../../systems/movieCatalog'
import { getMovieVideo } from '../../systems/movieVideo'
import { useMovie, setMovieMedia, playMovie, pauseMovie, setMovieMode } from '../../systems/world'
import { Sfx } from '../../systems/audioSystem'

// Warm, cinematic "Watch Together" panel. It only reads/writes the SHARED movie
// state (synced to your partner) — it never affects either player's movement.
// Movement is locked while it's open, then restored on close.
export function MovieNightPanel() {
  const movie = useMovie()
  const setMoviePanel = useMultiplayerStore((s) => s.setMoviePanel)

  useEffect(() => {
    usePlayerStore.getState().setInputEnabled(false)
    return () => usePlayerStore.getState().setInputEnabled(true)
  }, [])

  const close = () => {
    Sfx.close()
    setMoviePanel(false)
  }

  const onPlay = () => {
    Sfx.click()
    setMovieMode(true)
    playMovie(getMovieVideo().currentTime || movie.time || 0)
  }
  const onPause = () => {
    Sfx.click()
    pauseMovie(getMovieVideo().currentTime || movie.time || 0)
  }
  const onEnd = () => {
    Sfx.close()
    pauseMovie(0)
    setMovieMode(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="pointer-events-auto absolute left-1/2 top-1/2 z-40 w-[min(94vw,440px)] -translate-x-1/2 -translate-y-1/2"
    >
      <div className="space-y-4 rounded-2xl border border-[#3b2f24]/80 bg-[#161210]/95 p-5 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="font-mono text-sm font-bold tracking-[0.3em] text-[#e8dcc6]">🎬 MOVIE NIGHT</div>
          <button className="text-white/40 hover:text-white" onClick={close} aria-label="Close">
            ✕
          </button>
        </div>

        <div>
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[#b7a684]/70">Select video</div>
          <div className="space-y-1.5">
            {MOVIE_CATALOG.map((m) => {
              const active = movie.media === m.id
              return (
                <button
                  key={m.id}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                    active ? 'border-[#c9a06a]/60 bg-[#c9a06a]/15 text-[#f0e6d2]' : 'border-white/10 bg-black/20 text-white/70 hover:border-white/20'
                  }`}
                  onClick={() => {
                    Sfx.click()
                    setMovieMedia(m.id)
                  }}
                >
                  <span>{m.title}</span>
                  {active && <span className="font-mono text-[10px] text-[#c9a06a]">SELECTED</span>}
                </button>
              )
            })}
          </div>
          <p className="mt-2 font-mono text-[10px] leading-relaxed text-white/30">
            No file? The TV shows a cinematic placeholder — drop clips in public/media/.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {movie.playing ? (
            <button className="rounded-lg border border-[#c9a06a]/40 bg-[#c9a06a]/15 py-2.5 font-mono text-xs tracking-wider text-[#f0e6d2]" onClick={onPause}>
              ⏸ PAUSE
            </button>
          ) : (
            <button
              className="rounded-lg border border-[#c9a06a]/40 bg-[#c9a06a]/15 py-2.5 font-mono text-xs tracking-wider text-[#f0e6d2] disabled:opacity-40"
              onClick={onPlay}
              disabled={!movie.media}
            >
              ▶ PLAY
            </button>
          )}
          <button className="rounded-lg border border-white/12 bg-black/20 py-2.5 font-mono text-xs tracking-wider text-white/70" onClick={onEnd}>
            ■ END
          </button>
          <button className="rounded-lg border border-white/12 bg-black/20 py-2.5 font-mono text-xs tracking-wider text-white/70" onClick={close}>
            EXIT
          </button>
        </div>

        <div className="font-mono text-[10px] text-white/35">
          Synced with your partner · {movie.media ? (movie.playing ? 'playing' : 'paused') : 'idle'}
        </div>
      </div>
    </motion.div>
  )
}
