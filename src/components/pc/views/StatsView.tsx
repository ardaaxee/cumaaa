import { useRoomStore, selectCompletedTaskCount } from '../../../store/useRoomStore'

// Aggregate stats derived live from the store.
export function StatsView() {
  const projects = useRoomStore((s) => s.projects)
  const tasks = useRoomStore((s) => s.tasks)
  const notes = useRoomStore((s) => s.notes)
  const achievements = useRoomStore((s) => s.achievements)
  const done = useRoomStore(selectCompletedTaskCount)

  const activeProjects = projects.filter((p) => p.status === 'active').length
  const avgProgress =
    projects.length === 0
      ? 0
      : Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
  const unlocked = achievements.filter((a) => a.unlocked).length

  const stats = [
    { label: 'Projects', value: projects.length, sub: `${activeProjects} active` },
    { label: 'Tasks done', value: done, sub: `${tasks.length - done} open` },
    { label: 'Notes', value: notes.length, sub: 'in archive' },
    { label: 'Achievements', value: `${unlocked}/${achievements.length}`, sub: 'unlocked' },
    { label: 'Avg progress', value: `${avgProgress}%`, sub: 'across projects' },
    { label: 'Total tasks', value: tasks.length, sub: 'all time' },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border border-white/10 bg-ink-800/60 p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            {s.label}
          </div>
          <div className="mt-2 text-2xl font-semibold text-accent-soft">{s.value}</div>
          <div className="mt-1 text-xs text-white/40">{s.sub}</div>
        </div>
      ))}
    </div>
  )
}
