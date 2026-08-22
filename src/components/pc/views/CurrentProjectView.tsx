import { useRoomStore, statusLabel } from '../../../store/useRoomStore'
import { resolveCurrentProject } from '../../../systems/memorySystem'

// The desk card's info panel: shows the current project and lets ARDA pick which
// project is "current". Reads/writes the existing projects store only.
export function CurrentProjectView() {
  const projects = useRoomStore((s) => s.projects)
  const currentProjectId = useRoomStore((s) => s.currentProjectId)
  const setCurrentProject = useRoomStore((s) => s.setCurrentProject)
  const current = resolveCurrentProject(projects, currentProjectId)

  if (!current) {
    return <p className="py-8 text-center text-sm text-white/50">No projects yet. Create one in ARDA OS → Projects.</p>
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-ink-800/60 p-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">Current project</div>
        <h3 className="mt-1 text-2xl font-semibold text-white">{current.name}</h3>
        <p className="mt-1 text-sm text-white/55">{current.description}</p>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-amber-400/80" style={{ width: `${current.progress}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-white/50">
          <span>{statusLabel(current.status)}</span>
          <span>{current.progress}%</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {current.technologies.map((t) => (
            <span key={t} className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/60">
              {t}
            </span>
          ))}
        </div>
        <div className="mt-3 font-mono text-[10px] text-white/30">
          Started {new Date(current.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div>
        <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">Set current</div>
        <div className="grid gap-2 sm:grid-cols-2">
          {projects.map((p) => {
            const isCurrent = p.id === current.id
            return (
              <button
                key={p.id}
                onClick={() => setCurrentProject(p.id)}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                  isCurrent
                    ? 'border-amber-400/40 bg-amber-400/10 text-white'
                    : 'border-white/10 bg-ink-800/50 text-white/70 hover:text-white'
                }`}
              >
                <span className="truncate">{p.name}</span>
                <span className="ml-2 font-mono text-[10px] text-white/40">{p.progress}%</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
