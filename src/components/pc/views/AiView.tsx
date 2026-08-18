import { useRef, useState } from 'react'
import { askAi, aiIsProxyBacked } from '../../../systems/aiSystem'
import { useRoomStore } from '../../../store/useRoomStore'
import { uid } from '../../../utils/uid'

interface Msg {
  id: string
  role: 'user' | 'ai'
  text: string
}

// ARDA AI chat. Works fully offline via the local engine; if a backend proxy
// is configured it's used transparently. No API key ever touches the frontend.
export function AiView() {
  const unlock = useRoomStore((s) => s.unlockAchievement)
  const pushActivity = useRoomStore((s) => s.pushActivity)
  const [messages, setMessages] = useState<Msg[]>([
    { id: uid(), role: 'ai', text: 'ARDA AI online. What do you want to do?' },
  ])
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = value.trim()
    if (!text || busy) return
    setValue('')
    setBusy(true)
    const userMsg: Msg = { id: uid(), role: 'user', text }
    setMessages((m) => [...m, userMsg])
    unlock('ai-chat')
    pushActivity('ai', 'Talked to ARDA AI')

    const reply = await askAi(text)
    setMessages((m) => [...m, { id: uid(), role: 'ai', text: reply.text }])
    setBusy(false)
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
    })
  }

  return (
    <div className="flex h-[60vh] flex-col">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-soft/80">
          ARDA AI
        </div>
        <span className="font-mono text-[10px] text-white/30">
          {aiIsProxyBacked ? 'proxy connected' : 'offline mode'}
        </span>
      </div>

      <div ref={listRef} className="scroll-thin flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
              m.role === 'user'
                ? 'ml-auto border border-accent/30 bg-accent/10 text-white'
                : 'border border-white/10 bg-ink-800/70 text-white/85'
            }`}
          >
            <p className="whitespace-pre-wrap">{m.text}</p>
          </div>
        ))}
        {busy && (
          <div className="max-w-[85%] rounded-xl border border-white/10 bg-ink-800/70 px-3 py-2 text-sm text-white/50">
            <span className="animate-pulseSoft">ARDA AI is thinking…</span>
          </div>
        )}
      </div>

      <form onSubmit={send} className="mt-3 flex gap-2">
        <input
          className="hud-input"
          placeholder="Ask about your tasks, projects, notes…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={300}
        />
        <button type="submit" className="hud-btn-primary" disabled={busy}>
          Send
        </button>
      </form>
    </div>
  )
}
