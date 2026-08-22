import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRoomStore, selectCompletedTaskCount } from '../../../store/useRoomStore'

// Task manager: add / complete / delete. Backed by the persisted store, so the
// wall-mounted board in the room updates in sync.
export function TasksView() {
  const tasks = useRoomStore((s) => s.tasks)
  const addTask = useRoomStore((s) => s.addTask)
  const toggleTask = useRoomStore((s) => s.toggleTask)
  const removeTask = useRoomStore((s) => s.removeTask)
  const done = useRoomStore(selectCompletedTaskCount)
  const [value, setValue] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    addTask(value)
    setValue('')
  }

  const open = tasks.filter((t) => !t.done)
  const complete = tasks.filter((t) => t.done)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-soft/80">
          Today
        </div>
        <div className="font-mono text-[11px] text-white/40">
          {done} done · {open.length} open
        </div>
      </div>

      <form onSubmit={submit} className="mb-5 flex gap-2">
        <input
          className="hud-input"
          placeholder="Add a task…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={120}
        />
        <button type="submit" className="hud-btn-primary whitespace-nowrap">
          Add
        </button>
      </form>

      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {open.map((t) => (
            <motion.li
              key={t.id}
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8, height: 0 }}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-ink-800/60 px-3 py-2"
            >
              <button
                onClick={() => toggleTask(t.id)}
                className="h-5 w-5 flex-shrink-0 rounded border border-white/25 hover:border-accent"
                aria-label="Complete task"
              />
              <span className="flex-1 text-sm text-white/90">{t.title}</span>
              <button
                onClick={() => removeTask(t.id)}
                className="text-white/30 hover:text-red-400"
                aria-label="Delete task"
              >
                ✕
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {complete.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
            Completed
          </div>
          <ul className="space-y-1.5">
            {complete.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm text-white/40"
              >
                <button
                  onClick={() => toggleTask(t.id)}
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border border-accent/60 bg-accent/20 text-[11px] text-accent-soft"
                  aria-label="Reopen task"
                >
                  ✓
                </button>
                <span className="flex-1 line-through">{t.title}</span>
                <button
                  onClick={() => removeTask(t.id)}
                  className="text-white/20 hover:text-red-400"
                  aria-label="Delete task"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
