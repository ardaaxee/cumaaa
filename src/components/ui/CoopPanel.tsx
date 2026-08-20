import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMultiplayerStore } from '../../store/useMultiplayerStore'
import { Sfx } from '../../systems/audioSystem'

// Create / Join a shared ARDA HOME. Minimal, non-neon, and optional — the game
// runs single-player until you open a home here. ARDA OS and all personal data
// stay local; only presence + world toggles are shared.
export function CoopPanel({ onClose }: { onClose: () => void }) {
  const phase = useMultiplayerStore((s) => s.phase)
  const roomId = useMultiplayerStore((s) => s.roomId)
  const role = useMultiplayerStore((s) => s.role)
  const peers = useMultiplayerStore((s) => s.peers)
  const lastError = useMultiplayerStore((s) => s.lastError)
  const createHome = useMultiplayerStore((s) => s.createHome)
  const joinHome = useMultiplayerStore((s) => s.joinHome)
  const leaveHome = useMultiplayerStore((s) => s.leaveHome)

  const [mode, setMode] = useState<'menu' | 'join'>('menu')
  const [name, setName] = useState('CUMA')
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)

  const connected = phase === 'open' && !!roomId
  const errorText =
    lastError === 'HOME_NOT_FOUND'
      ? 'HOME NOT FOUND'
      : lastError === 'ROOM_FULL'
        ? 'HOME IS FULL'
        : lastError === 'BAD_REQUEST'
          ? 'INVALID CODE'
          : phase === 'reconnecting'
            ? 'CONNECTION LOST — RECONNECTING…'
            : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="pointer-events-auto absolute left-1/2 top-1/2 z-40 w-[min(92vw,380px)] -translate-x-1/2 -translate-y-1/2"
    >
      <div className="hud-panel space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div className="font-mono text-sm font-bold tracking-[0.25em] text-white">ARDA HOME · CO-OP</div>
          <button className="text-white/50 hover:text-white" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {!connected && (
          <>
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">Display name</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-accent/50"
                value={name}
                maxLength={16}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            {mode === 'menu' ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="hud-btn !py-3"
                  onClick={() => {
                    Sfx.click()
                    createHome(name)
                  }}
                >
                  CREATE HOME
                </button>
                <button
                  className="hud-btn !py-3"
                  onClick={() => {
                    Sfx.click()
                    setMode('join')
                  }}
                >
                  JOIN HOME
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-center font-mono text-lg uppercase tracking-[0.4em] text-white outline-none focus:border-accent/50"
                  placeholder="CODE"
                  value={code}
                  maxLength={6}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                />
                <div className="grid grid-cols-2 gap-2">
                  <button className="hud-btn !py-2.5" onClick={() => setMode('menu')}>
                    BACK
                  </button>
                  <button
                    className="hud-btn !py-2.5"
                    onClick={() => {
                      Sfx.click()
                      joinHome(code, name)
                    }}
                  >
                    CONNECT
                  </button>
                </div>
              </div>
            )}

            {(phase === 'connecting' || (phase === 'reconnecting' && !roomId)) && (
              <div className="font-mono text-[11px] text-white/50">Connecting…</div>
            )}
            {errorText && <div className="font-mono text-[11px] text-red-300/80">{errorText}</div>}
          </>
        )}

        {connected && (
          <div className="space-y-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">Your home code</div>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex-1 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-center font-mono text-2xl tracking-[0.4em] text-accent-soft">
                  {roomId}
                </div>
                <button
                  className="hud-btn !px-3 !py-2"
                  onClick={() => {
                    navigator.clipboard?.writeText(roomId!).then(
                      () => {
                        setCopied(true)
                        setTimeout(() => setCopied(false), 1500)
                      },
                      () => {},
                    )
                  }}
                >
                  {copied ? '✓' : 'COPY'}
                </button>
              </div>
            </div>
            <div className="font-mono text-[11px] text-white/50">
              You are <span className="text-white/80">{role?.toUpperCase()}</span> ·{' '}
              {peers.length ? `${peers.length} partner in home` : 'waiting for partner…'}
            </div>
            {peers.map((p) => (
              <div key={p.id} className="font-mono text-[11px] text-white/60">
                ● {p.name} <span className="text-white/30">({p.role})</span>
              </div>
            ))}
            <button
              className="hud-btn w-full !py-2.5"
              onClick={() => {
                Sfx.close()
                leaveHome()
                setMode('menu')
              }}
            >
              LEAVE HOME
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
