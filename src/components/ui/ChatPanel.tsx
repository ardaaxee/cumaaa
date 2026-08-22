import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useMultiplayerStore } from '../../store/useMultiplayerStore'
import { QUICK_MESSAGES, CHAT_MAX_LEN } from '../../network/protocol'
import { Sfx } from '../../systems/audioSystem'

function clockOf(at: number): string {
  const d = new Date(at)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// Real-time messaging between the two people in a home. Text goes over the same
// WebSocket as everything else; the server stamps and re-sanitises it, so what
// renders here has already been through validation on both ends.
export function ChatPanel({ onClose }: { onClose: () => void }) {
  const chat = useMultiplayerStore((s) => s.chat)
  const playerId = useMultiplayerStore((s) => s.playerId)
  const inHome = useMultiplayerStore((s) => s.roomId !== null)
  const peers = useMultiplayerStore((s) => s.peers)
  const sendChat = useMultiplayerStore((s) => s.sendChat)

  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Stick to the newest message.
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [chat.length])

  // Typing must not drive the player: release the pointer lock and hand the
  // keyboard to the input. Movement itself is parked by the HUD off `chatOpen`
  // rather than here — tying it to unmount would leave the player frozen if the
  // exit animation stalls (e.g. the tab is backgrounded mid-message).
  useEffect(() => {
    document.exitPointerLock?.()
    inputRef.current?.focus()
  }, [])

  const submit = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    sendChat(trimmed)
    Sfx.click()
    setDraft('')
    inputRef.current?.focus()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="pointer-events-auto absolute bottom-4 right-4 z-40 w-[min(92vw,340px)]"
    >
      <div className="hud-panel flex h-[min(60vh,420px)] flex-col p-4">
        <div className="flex items-center justify-between pb-2">
          <div className="font-mono text-xs font-bold tracking-[0.25em] text-white">CHAT</div>
          <button className="text-white/50 hover:text-white" onClick={onClose} aria-label="Close chat">
            ✕
          </button>
        </div>

        <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto pr-1">
          {!inHome && (
            <div className="font-mono text-[11px] leading-relaxed text-white/40">
              Open a home in CO-OP to message your partner.
            </div>
          )}
          {inHome && chat.length === 0 && (
            <div className="font-mono text-[11px] leading-relaxed text-white/40">
              {peers.length ? 'Say something.' : 'Waiting for your partner to join…'}
            </div>
          )}
          {chat.map((m) => {
            const own = m.from === playerId
            return (
              <div key={m.id} className={own ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-1.5 ${
                    own ? 'bg-accent/15 text-accent-soft' : 'bg-white/10 text-white/85'
                  }`}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">{m.name}</span>
                    <span className="font-mono text-[9px] text-white/25">{clockOf(m.at)}</span>
                  </div>
                  <div className="whitespace-pre-wrap break-words text-[13px] leading-snug">{m.text}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* One-tap phrases — the things you actually say while walking around */}
        <div className="flex flex-wrap gap-1 pt-2">
          {QUICK_MESSAGES.map((q) => (
            <button
              key={q}
              disabled={!inHome}
              className="rounded-full border border-white/12 bg-white/5 px-2.5 py-1 text-[11px] text-white/70 transition hover:bg-white/10 disabled:opacity-30"
              onClick={() => submit(q)}
            >
              {q}
            </button>
          ))}
        </div>

        <form
          className="flex gap-2 pt-2"
          onSubmit={(e) => {
            e.preventDefault()
            submit(draft)
          }}
        >
          <input
            ref={inputRef}
            className="min-w-0 flex-1 rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-accent/50 disabled:opacity-40"
            placeholder={inHome ? 'Message…' : 'Not in a home'}
            value={draft}
            disabled={!inHome}
            maxLength={CHAT_MAX_LEN}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button className="hud-btn !px-3 !py-2 text-[11px]" disabled={!inHome} type="submit">
            SEND
          </button>
        </form>
      </div>
    </motion.div>
  )
}
