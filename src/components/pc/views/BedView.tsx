import { useRoomStore } from '../../../store/useRoomStore'

// The bed panel: a calm summary + reassurance that progress is saved locally.
export function BedView() {
  const profile = useRoomStore((s) => s.profile)
  const tasks = useRoomStore((s) => s.tasks)
  const open = tasks.filter((t) => !t.done).length

  return (
    <div className="text-center">
      <div className="text-4xl">🛌</div>
      <h3 className="mt-3 text-lg font-semibold text-white">Rest, {profile.name}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-white/60">
        {open === 0
          ? 'Your task board is clear. Nothing left for today.'
          : `You still have ${open} open task${open === 1 ? '' : 's'} on the board.`}
      </p>
      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-accent-soft/60">
        Progress auto-saved locally
      </p>
      {profile.currentGoal && (
        <div className="mx-auto mt-6 max-w-sm rounded-xl border border-white/10 bg-ink-800/60 p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            Current goal
          </div>
          <div className="mt-1 text-sm text-white/80">{profile.currentGoal}</div>
        </div>
      )}
    </div>
  )
}
