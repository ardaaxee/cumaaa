import { useRoomStore, statusLabel } from '../../../store/useRoomStore'
import { recentProjects, archivedProjectCount } from '../../../systems/memorySystem'

// Read-only "project history" memory panel for the archive shelf. Derives
// entirely from the projects store (newest on the shelf, older archived).
export function ProjectArchiveView() {
  const projects = useRoomStore((s) => s.projects)
  const shelf = recentProjects(projects)
  const archived = archivedProjectCount(projects)
  const older = [...projects].sort((a, b) => b.createdAt - a.createdAt).slice(shelf.length)

  return (
    <div className="space-y-6">
      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
        {projects.length} project{projects.length === 1 ? '' : 's'} · {shelf.length} on the shelf
        {archived > 0 ? ` · ${archived} archived` : ''}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {shelf.map((p) => (
          <div key={p.id} className="rounded-xl border border-white/10 bg-ink-800/60 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">{p.name}</h3>
              <span className="font-mono text-[10px] text-white/40">{new Date(p.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-amber-400/70" style={{ width: `${p.progress}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-white/45">
              <span>{statusLabel(p.status)}</span>
              <span>{p.progress}%</span>
            </div>
          </div>
        ))}
      </div>

      {older.length > 0 && (
        <div>
          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">Archived</div>
          <ul className="space-y-1.5">
            {older.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-ink-800/40 px-3 py-1.5 text-sm text-white/60"
              >
                <span className="truncate">{p.name}</span>
                <span className="font-mono text-[10px] text-white/30">
                  {statusLabel(p.status)} · {p.progress}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
