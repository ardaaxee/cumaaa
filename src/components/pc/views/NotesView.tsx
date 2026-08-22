import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRoomStore } from '../../../store/useRoomStore'
import type { NoteCategory } from '../../../types'

const LABELS: Record<NoteCategory, string> = {
  note: 'Note',
  idea: 'Idea',
  memory: 'Memory',
  private: 'Private',
}

interface Props {
  categories: NoteCategory[] // which categories this view manages
  emptyHint?: string
}

// Reusable note archive. The public archive passes note/idea/memory; the
// private room passes only 'private', keeping the two stores separate in the UI
// even though they share persistence.
export function NotesView({ categories, emptyHint }: Props) {
  const notes = useRoomStore((s) => s.notes)
  const addNote = useRoomStore((s) => s.addNote)
  const removeNote = useRoomStore((s) => s.removeNote)

  const [filter, setFilter] = useState<NoteCategory | 'all'>('all')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState<NoteCategory>(categories[0])

  const visible = useMemo(
    () =>
      notes.filter(
        (n) => categories.includes(n.category) && (filter === 'all' || n.category === filter),
      ),
    [notes, categories, filter],
  )

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() && !body.trim()) return
    addNote({ title, body, category })
    setTitle('')
    setBody('')
  }

  return (
    <div>
      <form onSubmit={submit} className="mb-5 space-y-2 rounded-lg border border-white/10 bg-ink-800/50 p-3">
        <input
          className="hud-input"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
        />
        <textarea
          className="hud-input resize-none"
          placeholder="Write something to remember…"
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={800}
        />
        <div className="flex items-center gap-2">
          {categories.length > 1 && (
            <select
              className="hud-input"
              value={category}
              onChange={(e) => setCategory(e.target.value as NoteCategory)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {LABELS[c]}
                </option>
              ))}
            </select>
          )}
          <button type="submit" className="hud-btn-primary whitespace-nowrap">
            Save note
          </button>
        </div>
      </form>

      {categories.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
            All
          </FilterChip>
          {categories.map((c) => (
            <FilterChip key={c} active={filter === c} onClick={() => setFilter(c)}>
              {LABELS[c]}
            </FilterChip>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-white/40">
          {emptyHint ?? 'No notes yet. Write your first one above.'}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {visible.map((n) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="group rounded-xl border border-white/10 bg-ink-800/60 p-4"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-white">{n.title}</h3>
                  <button
                    onClick={() => removeNote(n.id)}
                    className="text-white/20 opacity-0 transition group-hover:opacity-100 hover:text-red-400"
                    aria-label="Delete note"
                  >
                    ✕
                  </button>
                </div>
                {n.body && <p className="mt-1 whitespace-pre-wrap text-xs text-white/55">{n.body}</p>}
                <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-white/30">
                  <span className="text-accent-soft/70">{LABELS[n.category]}</span>
                  <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs transition ${
        active
          ? 'border-accent/50 bg-accent/15 text-accent-soft'
          : 'border-white/10 bg-white/5 text-white/50 hover:text-white/80'
      }`}
    >
      {children}
    </button>
  )
}
