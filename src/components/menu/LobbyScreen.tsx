import { useEffect, useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { useMultiplayerStore } from '../../store/useMultiplayerStore'
import { MenuShell, MenuButton } from './MenuShell'
import { Sfx } from '../../systems/audioSystem'

// Where the two people meet before entering the house: who is here, who is
// ready, and the code to share. Only the host starts, and only when everyone
// present is ready — the server enforces both, this screen just reflects it.
export function LobbyScreen() {
  const home = useMultiplayerStore((s) => s.home)
  const lobby = useMultiplayerStore((s) => s.lobby)
  const playerId = useMultiplayerStore((s) => s.playerId)
  const phase = useMultiplayerStore((s) => s.phase)
  const setReady = useMultiplayerStore((s) => s.setReady)
  const startHome = useMultiplayerStore((s) => s.startHome)
  const leaveHome = useMultiplayerStore((s) => s.leaveHome)
  const setStage = useAppStore((s) => s.setStage)
  const openMenu = useAppStore((s) => s.openMenu)

  const [copied, setCopied] = useState(false)

  const me = lobby.find((p) => p.id === playerId)
  const isHost = !!home && home.hostId === playerId
  const everyoneReady = lobby.length > 0 && lobby.every((p) => p.ready)
  const alone = lobby.length < 2

  // The host flipping `started` is what moves BOTH clients into the house.
  useEffect(() => {
    if (home?.started) setStage('playing')
  }, [home?.started, setStage])

  const connectionNote =
    phase === 'reconnecting' ? 'Connection lost — reconnecting…' : phase === 'open' ? null : 'Connecting…'

  return (
    <MenuShell title={home?.name ?? 'HOME LOBBY'} subtitle="Everyone ready, then the host starts.">
      <div className="space-y-5">
        {/* Share code */}
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">Home code</div>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex-1 rounded-lg border border-accent/25 bg-accent/[0.08] px-3 py-2 text-center font-mono text-2xl tracking-[0.4em] text-accent-soft">
              {home?.code ?? '······'}
            </div>
            <button
              className="rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 font-mono text-[11px] text-white/70 transition hover:bg-white/[0.09]"
              onClick={() => {
                if (!home) return
                navigator.clipboard?.writeText(home.code).then(
                  () => {
                    setCopied(true)
                    window.setTimeout(() => setCopied(false), 1500)
                  },
                  () => {},
                )
              }}
            >
              {copied ? '✓' : 'COPY'}
            </button>
          </div>
        </div>

        {/* Roster */}
        <div className="space-y-2">
          {lobby.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5"
            >
              <div className="min-w-0">
                <div className="truncate font-mono text-[13px] text-white/85">
                  {p.name}
                  {p.id === playerId && <span className="ml-2 text-[10px] text-white/35">you</span>}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-white/35">
                  {p.role === 'host' ? 'host' : 'guest'} · <span className="text-green-300/80">● online</span>
                </div>
              </div>
              <div
                className={`font-mono text-[11px] uppercase tracking-widest ${
                  p.ready ? 'text-green-300' : 'text-white/30'
                }`}
              >
                {p.ready ? 'ready' : 'not ready'}
              </div>
            </div>
          ))}
          {alone && (
            <div className="rounded-lg border border-dashed border-white/12 px-3 py-2.5 font-mono text-[11px] text-white/35">
              Waiting for your partner to join with the code…
            </div>
          )}
        </div>

        {connectionNote && <p className="font-mono text-[11px] text-amber-300/80">{connectionNote}</p>}

        <div className="space-y-2">
          <MenuButton
            variant={me?.ready ? 'secondary' : 'primary'}
            onClick={() => {
              Sfx.click()
              setReady(!me?.ready)
            }}
          >
            {me?.ready ? 'NOT READY' : 'READY'}
          </MenuButton>

          {isHost && (
            <MenuButton
              variant="primary"
              disabled={!everyoneReady}
              title={everyoneReady ? undefined : 'Everyone in the lobby must be ready first.'}
              onClick={() => {
                Sfx.click()
                startHome()
              }}
            >
              START HOME
              {!everyoneReady && <span className="ml-2 text-[11px] text-white/35">waiting for ready</span>}
            </MenuButton>
          )}
          {!isHost && (
            <p className="px-1 font-mono text-[11px] text-white/35">The host starts the home when everyone is ready.</p>
          )}

          <MenuButton
            variant="quiet"
            onClick={() => {
              Sfx.close()
              leaveHome()
              openMenu('main')
            }}
          >
            Leave home
          </MenuButton>
        </div>
      </div>
    </MenuShell>
  )
}
