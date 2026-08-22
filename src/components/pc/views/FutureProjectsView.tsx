import { useRoomStore } from '../../../store/useRoomStore'

// Future-projects roadmap. Slots unlock from REAL milestones (project count and
// unlocked achievements) — no fake progress bars. This mirrors the 3D
// future-projects bay in the lab.
export function FutureProjectsView() {
  const projects = useRoomStore((s) => s.projects)
  const achievements = useRoomStore((s) => s.achievements)
  const planning = projects.filter((p) => p.status === 'planning')
  const unlocked = achievements.filter((a) => a.unlocked).length

  const slots = [
    {
      name: 'PROJECT 01',
      unlocked: projects.length >= 4,
      req: 'Reach 4 projects',
      have: `${projects.length}/4 projects`,
    },
    {
      name: 'PROJECT 02',
      unlocked: unlocked >= 3,
      req: 'Unlock 3 achievements',
      have: `${unlocked}/3 achievements`,
    },
    {
      name: 'PROJECT 03',
      unlocked: unlocked >= 5,
      req: 'Unlock 5 achievements',
      have: `${unlocked}/5 achievements`,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent-soft/80">
          Future Projects
        </div>
        <p className="mt-2 text-sm text-white/60">
          Reserved slots that unlock as you hit real milestones. Nothing here is faked — the
          conditions read your live project and achievement data.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {slots.map((s) => (
          <div
            key={s.name}
            className={`rounded-xl border p-4 ${
              s.unlocked ? 'border-accent/40 bg-accent/10' : 'border-white/10 bg-ink-800/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-white">{s.name}</span>
              <span className={`text-xs ${s.unlocked ? 'text-green-400' : 'text-white/40'}`}>
                {s.unlocked ? '● UNLOCKED' : '🔒 LOCKED'}
              </span>
            </div>
            <div className="mt-3 text-xs text-white/50">{s.req}</div>
            <div className="mt-1 font-mono text-[11px] text-accent-soft/70">{s.have}</div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-accent-soft/80">
          In planning
        </h3>
        {planning.length === 0 ? (
          <p className="text-sm text-white/40">
            No planning-stage projects. Mark a project “planning” in ARDA OS to stage it here.
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {planning.map((p) => (
              <li key={p.id} className="rounded-lg border border-white/10 bg-ink-800/60 px-3 py-2 text-sm text-white/80">
                {p.name}
                <span className="ml-2 font-mono text-[10px] text-white/30">{p.progress}%</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
