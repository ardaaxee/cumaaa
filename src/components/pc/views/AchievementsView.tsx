import { useRoomStore } from '../../../store/useRoomStore'

// Achievement gallery, fed by real progress in the store.
export function AchievementsView() {
  const achievements = useRoomStore((s) => s.achievements)
  const unlocked = achievements.filter((a) => a.unlocked).length

  return (
    <div>
      <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-accent-soft/80">
        {unlocked} / {achievements.length} unlocked
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {achievements.map((a) => (
          <div
            key={a.id}
            className={`flex items-center gap-3 rounded-xl border p-3 ${
              a.unlocked
                ? 'border-accent/40 bg-accent/10'
                : 'border-white/10 bg-ink-800/50 opacity-60'
            }`}
          >
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg ${
                a.unlocked ? 'bg-accent/25 text-accent-soft shadow-glow' : 'bg-white/5 text-white/30'
              }`}
            >
              {a.unlocked ? '★' : '☆'}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-white">{a.title}</div>
              <div className="truncate text-xs text-white/50">{a.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
