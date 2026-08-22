import { useMemo, useRef, useState } from 'react'
import { useRoomStore, selectCompletedTaskCount } from '../../../store/useRoomStore'

interface Line {
  id: number
  text: string
  kind: 'in' | 'out' | 'err'
}

// A SAFE, simulated terminal — it only reads the ARDA ROOM data store. It has
// no access to a real shell, filesystem or network. Commands map to store data.
export function TerminalView() {
  const store = useRoomStore
  const [lines, setLines] = useState<Line[]>(() => [
    { id: 0, text: 'ARDA LAB terminal v1.0 — type `help`', kind: 'out' },
  ])
  const [value, setValue] = useState('')
  const idRef = useRef(1)
  const bodyRef = useRef<HTMLDivElement>(null)

  const push = (text: string, kind: Line['kind']) => {
    setLines((l) => [...l, { id: idRef.current++, text, kind }])
    requestAnimationFrame(() => bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight }))
  }

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase()
    if (!cmd) return
    push(`$ ${raw}`, 'in')
    const s = store.getState()
    switch (cmd.split(' ')[0]) {
      case 'help':
        push('commands: projects · tasks · status · stats · whoami · achievements · clear · help', 'out')
        break
      case 'projects':
        if (s.projects.length === 0) push('no projects', 'out')
        s.projects.forEach((p) => push(`  ${p.name.padEnd(18)} ${String(p.progress).padStart(3)}%  ${p.status}`, 'out'))
        break
      case 'tasks': {
        const open = s.tasks.filter((t) => !t.done)
        if (open.length === 0) push('all tasks complete', 'out')
        open.forEach((t) => push(`  [ ] ${t.title}`, 'out'))
        break
      }
      case 'status':
        push(`projects: ${s.projects.length}  ·  active: ${s.projects.filter((p) => p.status === 'active').length}`, 'out')
        push(`tasks: ${selectCompletedTaskCount(s)} done / ${s.tasks.length} total`, 'out')
        push(`notes: ${s.notes.length}  ·  secret: ${s.secretUnlocked ? 'unlocked' : 'locked'}`, 'out')
        break
      case 'stats': {
        const avg = s.projects.length ? Math.round(s.projects.reduce((a, p) => a + p.progress, 0) / s.projects.length) : 0
        push(`avg project progress: ${avg}%`, 'out')
        push(`achievements: ${s.achievements.filter((a) => a.unlocked).length}/${s.achievements.length}`, 'out')
        break
      }
      case 'achievements':
        s.achievements.forEach((a) => push(`  ${a.unlocked ? '★' : '☆'} ${a.title}`, 'out'))
        break
      case 'whoami':
        push(`${s.profile.name} (@${s.profile.username}) — ${s.profile.about}`, 'out')
        break
      case 'clear':
        setLines([])
        break
      default:
        push(`command not found: ${cmd}. try \`help\``, 'err')
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    run(value)
    setValue('')
  }

  const hint = useMemo(() => 'projects · tasks · status · stats · help', [])

  return (
    <div className="flex h-[58vh] flex-col">
      <div
        ref={bodyRef}
        className="scroll-thin flex-1 overflow-y-auto rounded-lg border border-white/10 bg-black/60 p-3 font-mono text-[13px] leading-relaxed"
      >
        {lines.map((l) => (
          <div
            key={l.id}
            className={
              l.kind === 'in' ? 'text-accent-soft' : l.kind === 'err' ? 'text-red-400' : 'text-white/75'
            }
          >
            {l.text}
          </div>
        ))}
      </div>
      <form onSubmit={onSubmit} className="mt-3 flex items-center gap-2">
        <span className="font-mono text-accent">$</span>
        <input
          autoFocus
          className="hud-input font-mono"
          placeholder={hint}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          spellCheck={false}
        />
      </form>
    </div>
  )
}
