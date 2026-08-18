import { NotesView } from './NotesView'
import { useRoomStore } from '../../../store/useRoomStore'

// The private room content. Reached only through the hidden bookcase panel.
// Holds private notes and a space for future projects / ideas.
export function SecretView() {
  const projects = useRoomStore((s) => s.projects)
  const planning = projects.filter((p) => p.status === 'planning')

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent-soft/80">
          ARDA Private Room
        </div>
        <p className="mt-2 text-sm text-white/60">
          A hidden space behind the bookcase. Only you get here. Keep private notes and half-formed
          ideas out of sight.
        </p>
      </div>

      <div>
        <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-accent-soft/80">
          Future Projects
        </h3>
        {planning.length === 0 ? (
          <p className="text-sm text-white/40">
            Projects marked “planning” show up here. Create one from ARDA OS → Projects.
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {planning.map((p) => (
              <li
                key={p.id}
                className="rounded-lg border border-white/10 bg-ink-800/60 px-3 py-2 text-sm text-white/80"
              >
                {p.name}
                <span className="ml-2 font-mono text-[10px] text-white/30">{p.progress}%</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-accent-soft/80">
          Private Notes & Ideas
        </h3>
        <NotesView
          categories={['private']}
          emptyHint="No private notes yet. Only you can see these."
        />
      </div>
    </div>
  )
}
