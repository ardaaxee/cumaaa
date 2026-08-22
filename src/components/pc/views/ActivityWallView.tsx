import { useRoomStore } from '../../../store/useRoomStore'
import type { ActivityKind } from '../../../types'

const ICON: Record<ActivityKind, string> = {
  project: '◆',
  task: '✓',
  note: '✎',
  achievement: '★',
  secret: '⚿',
  ai: '⌁',
}

// Read-only recent-activity panel for the wall board. Uses the existing
// activity log in the store (already recorded on every real action).
export function ActivityWallView() {
  const activity = useRoomStore((s) => s.activity)

  return (
    <div>
      <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
        ARDA Activity
      </div>
      {activity.length === 0 ? (
        <p className="py-8 text-center text-sm text-white/40">
          No activity yet. Create a project, finish a task, or add a note.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {activity.slice(0, 20).map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-3 rounded-lg border border-white/5 bg-ink-800/40 px-3 py-2 text-sm"
            >
              <span className="text-amber-300/80">{ICON[a.kind]}</span>
              <span className="flex-1 text-white/75">{a.text}</span>
              <span className="font-mono text-[10px] text-white/30">
                {new Date(a.at).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
