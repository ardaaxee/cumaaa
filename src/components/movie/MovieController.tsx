import { useEffect, useRef } from 'react'
import { useMovie } from '../../systems/world'
import { movieById } from '../../systems/movieCatalog'
import { getMovieVideo, tryPlay } from '../../systems/movieVideo'
import { expectedMovieTime } from '../../network/protocol'
import { useMultiplayerStore } from '../../store/useMultiplayerStore'

// Keeps the shared <video> element in sync with the room's movie state. This is
// the ONLY driver of the element: it sets the source, plays/pauses, and gently
// corrects drift so both clients stay together — without streaming video frames
// over the network (only the tiny movie state is synced).
export function MovieController() {
  const movie = useMovie()
  const loadedFor = useRef<string | null>(null)

  // Source changes.
  useEffect(() => {
    const el = getMovieVideo()
    const entry = movieById(movie.media)
    const src = entry?.src ?? ''
    if (loadedFor.current !== src) {
      loadedFor.current = src
      if (src) {
        el.src = src
        el.load()
      } else {
        el.removeAttribute('src')
        el.load()
      }
    }
  }, [movie.media])

  // Play / pause + coarse seek to the expected position.
  useEffect(() => {
    const el = getMovieVideo()
    if (!movie.media) return
    const target = expectedMovieTime(movie)
    if (Number.isFinite(target) && Math.abs(el.currentTime - target) > 0.6) {
      try {
        el.currentTime = target
      } catch {
        /* not seekable yet */
      }
    }
    if (movie.playing) tryPlay(el)
    else el.pause()
  }, [movie.playing, movie.time, movie.updatedAt, movie.media])

  // Slow drift-correction loop while playing (no per-frame work).
  useEffect(() => {
    if (!movie.playing || !movie.media) return
    const id = window.setInterval(() => {
      const el = getMovieVideo()
      const target = expectedMovieTime(useMultiplayerStore.getState().world.movie)
      if (Number.isFinite(target) && el.duration && Math.abs(el.currentTime - target) > 0.8) {
        try {
          el.currentTime = target
        } catch {
          /* ignore */
        }
      }
    }, 3000)
    return () => window.clearInterval(id)
  }, [movie.playing, movie.media])

  return null
}
