import { useEffect, useRef, useState } from 'react'
import { unlockAudio } from '../../../systems/audioSystem'

interface Track {
  name: string
  url: string
}

// Local music player. The user adds their own audio files (kept as in-memory
// object URLs for the session). Playback only ever starts from a click, so
// autoplay policy is respected. No external streaming dependency.
export function MusicView() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.7)

  // Revoke object URLs on unmount to avoid leaks.
  useEffect(() => {
    return () => {
      tracks.forEach((t) => URL.revokeObjectURL(t.url))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const next = files.map((f) => ({ name: f.name.replace(/\.[^.]+$/, ''), url: URL.createObjectURL(f) }))
    setTracks((prev) => [...prev, ...next])
    e.target.value = ''
  }

  const play = (index: number) => {
    unlockAudio()
    setCurrent(index)
    const el = audioRef.current
    if (!el) return
    el.src = tracks[index].url
    void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }

  const toggle = () => {
    const el = audioRef.current
    if (!el || tracks.length === 0) return
    unlockAudio()
    if (playing) {
      el.pause()
      setPlaying(false)
    } else {
      if (!el.src) el.src = tracks[current].url
      void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    }
  }

  const step = (dir: 1 | -1) => {
    if (tracks.length === 0) return
    const next = (current + dir + tracks.length) % tracks.length
    play(next)
  }

  return (
    <div>
      <audio
        ref={audioRef}
        onEnded={() => step(1)}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      />

      <div className="mb-5 rounded-xl border border-white/10 bg-ink-800/60 p-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
          Now playing
        </div>
        <div className="mt-1 truncate text-lg font-medium text-white">
          {tracks[current]?.name ?? 'Nothing yet'}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button className="hud-btn !px-3" onClick={() => step(-1)} aria-label="Previous">
            ⏮
          </button>
          <button className="hud-btn-primary !px-4 text-lg" onClick={toggle} aria-label="Play/Pause">
            {playing ? '⏸' : '▶'}
          </button>
          <button className="hud-btn !px-3" onClick={() => step(1)} aria-label="Next">
            ⏭
          </button>
          <div className="ml-2 flex-1">
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-accent"
              aria-label="Volume"
            />
          </div>
        </div>
      </div>

      <label className="hud-btn-primary mb-4 inline-block cursor-pointer">
        + Add audio files
        <input type="file" accept="audio/*" multiple className="hidden" onChange={onFiles} />
      </label>

      {tracks.length === 0 ? (
        <p className="text-sm text-white/40">
          Add your own audio files to build a playlist. They stay in your browser for this session
          only.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {tracks.map((t, i) => (
            <li key={t.url}>
              <button
                onClick={() => play(i)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                  i === current
                    ? 'border border-accent/40 bg-accent/10 text-accent-soft'
                    : 'border border-white/10 bg-ink-800/50 text-white/70 hover:text-white'
                }`}
              >
                <span className="font-mono text-xs text-white/30">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1 truncate">{t.name}</span>
                {i === current && playing && <span className="text-accent">♪</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
