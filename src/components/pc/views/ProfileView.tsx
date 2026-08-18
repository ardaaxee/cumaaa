import { useRoomStore } from '../../../store/useRoomStore'
import type { ActivityKind } from '../../../types'

const ACTIVITY_ICON: Record<ActivityKind, string> = {
  project: '◆',
  task: '✓',
  note: '✎',
  achievement: '★',
  secret: '⚿',
  ai: '⌁',
}

// ARDA profile: editable identity fields, a snapshot, and a live activity feed.
export function ProfileView() {
  const profile = useRoomStore((s) => s.profile)
  const setProfile = useRoomStore((s) => s.setProfile)
  const projects = useRoomStore((s) => s.projects)
  const achievements = useRoomStore((s) => s.achievements)
  const activity = useRoomStore((s) => s.activity)

  const unlocked = achievements.filter((a) => a.unlocked).length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/40 bg-accent/10 text-2xl font-bold text-accent-soft">
          {profile.name.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <div className="text-xl font-semibold text-white">{profile.name}</div>
          <div className="font-mono text-xs text-white/40">@{profile.username}</div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name" value={profile.name} onChange={(v) => setProfile({ name: v })} />
        <Field
          label="Username"
          value={profile.username}
          onChange={(v) => setProfile({ username: v.replace(/\s+/g, '') })}
        />
        <Field
          label="About"
          value={profile.about}
          onChange={(v) => setProfile({ about: v })}
          full
        />
        <Field
          label="Favorite project"
          value={profile.favoriteProject}
          onChange={(v) => setProfile({ favoriteProject: v })}
        />
        <Field
          label="Current goal"
          value={profile.currentGoal}
          onChange={(v) => setProfile({ currentGoal: v })}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Projects" value={projects.length} />
        <Stat label="Achievements" value={`${unlocked}/${achievements.length}`} />
        <Stat label="Goal" value={profile.currentGoal ? '1' : '0'} sub={profile.currentGoal} />
      </div>

      <div>
        <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-accent-soft/80">
          Activity
        </h3>
        {activity.length === 0 ? (
          <p className="text-sm text-white/40">No activity yet. Start creating.</p>
        ) : (
          <ul className="space-y-1.5">
            {activity.slice(0, 12).map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-3 rounded-lg border border-white/5 bg-ink-800/40 px-3 py-1.5 text-sm"
              >
                <span className="text-accent-soft">{ACTIVITY_ICON[a.kind]}</span>
                <span className="flex-1 text-white/70">{a.text}</span>
                <span className="font-mono text-[10px] text-white/30">
                  {new Date(a.at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  full,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  full?: boolean
}) {
  return (
    <label className={`block ${full ? 'sm:col-span-2' : ''}`}>
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
        {label}
      </span>
      <input
        className="hud-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={80}
      />
    </label>
  )
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-ink-800/60 p-3 text-center">
      <div className="text-lg font-semibold text-accent-soft">{value}</div>
      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">{label}</div>
      {sub && <div className="mt-1 truncate text-[10px] text-white/30">{sub}</div>}
    </div>
  )
}
