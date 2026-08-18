import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRoomStore, statusLabel } from '../../../store/useRoomStore'
import type { ProjectStatus } from '../../../types'

const STATUSES: ProjectStatus[] = ['planning', 'active', 'paused', 'done']

const STATUS_COLOR: Record<ProjectStatus, string> = {
  planning: 'text-yellow-300',
  active: 'text-accent-soft',
  paused: 'text-white/50',
  done: 'text-green-400',
}

// Project manager: list + create. Progress bars and status are shown; new
// projects persist and trigger achievements.
export function ProjectsView() {
  const projects = useRoomStore((s) => s.projects)
  const addProject = useRoomStore((s) => s.addProject)
  const removeProject = useRoomStore((s) => s.removeProject)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tech, setTech] = useState('')
  const [status, setStatus] = useState<ProjectStatus>('planning')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    addProject({
      name: name.trim(),
      description: description.trim() || 'No description yet.',
      status,
      progress: status === 'done' ? 100 : status === 'active' ? 25 : 0,
      technologies: tech
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    })
    setName('')
    setDescription('')
    setTech('')
    setStatus('planning')
    setOpen(false)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-soft/80">
          {projects.length} projects
        </div>
        <button className="hud-btn-primary" onClick={() => setOpen((v) => !v)}>
          {open ? 'Cancel' : '+ New project'}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={submit}
            className="mb-5 space-y-2 overflow-hidden rounded-lg border border-white/10 bg-ink-800/50 p-3"
          >
            <input
              className="hud-input"
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
            />
            <textarea
              className="hud-input resize-none"
              placeholder="Description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={240}
            />
            <input
              className="hud-input"
              placeholder="Technologies (comma separated)"
              value={tech}
              onChange={(e) => setTech(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <select
                className="hud-input"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s)}
                  </option>
                ))}
              </select>
              <button type="submit" className="hud-btn-primary whitespace-nowrap">
                Create
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid gap-3 sm:grid-cols-2">
        <AnimatePresence initial={false}>
          {projects.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="group rounded-xl border border-white/10 bg-ink-800/60 p-4"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-white">{p.name}</h3>
                <button
                  onClick={() => removeProject(p.id)}
                  className="text-white/20 opacity-0 transition group-hover:opacity-100 hover:text-red-400"
                  aria-label="Delete project"
                >
                  ✕
                </button>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-white/50">{p.description}</p>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${p.progress}%` }}
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {p.technologies.slice(0, 4).map((t) => (
                  <span
                    key={t}
                    className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/60"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between font-mono text-[10px]">
                <span className={STATUS_COLOR[p.status]}>{statusLabel(p.status)}</span>
                <span className="text-white/30">
                  {new Date(p.createdAt).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
