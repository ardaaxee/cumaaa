import { useState } from 'react'
import { useAuthStore } from '../../auth/useAuthStore'
import { useAppStore } from '../../store/useAppStore'
import { useMultiplayerStore } from '../../store/useMultiplayerStore'
import { useRoomStore } from '../../store/useRoomStore'
import { usePlayerStore } from '../../store/usePlayerStore'
import { MenuShell, MenuButton, MenuField, inputClass } from './MenuShell'
import { Sfx } from '../../systems/audioSystem'

const AVATARS = ['🙂', '🧑', '👩', '🧔', '👧', '🐈', '🌿', '☕']

function ago(ts: number): string {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000))
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`
  return `${Math.floor(s / 86400)} d ago`
}

// The player's identity as the rest of the app sees it: display name and avatar
// come from auth, presence comes from the network layer, and preferences are
// read back from the stores that actually own them.
export function ProfileScreen() {
  const user = useAuthStore((s) => s.user)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const error = useAuthStore((s) => s.error)
  const setScreen = useAppStore((s) => s.setScreen)

  const phase = useMultiplayerStore((s) => s.phase)
  const home = useMultiplayerStore((s) => s.home)
  const quality = useRoomStore((s) => s.settings.quality)
  const isTouch = usePlayerStore((s) => s.isTouch)

  const [name, setName] = useState(user?.displayName ?? '')
  const [saved, setSaved] = useState(false)

  const online = phase === 'open'
  const presence = online ? 'ONLINE' : phase === 'reconnecting' ? 'RECONNECTING' : 'OFFLINE'

  const save = () => {
    Sfx.click()
    updateProfile({ displayName: name })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1600)
  }

  return (
    <MenuShell title="PROFILE" onBack={() => setScreen('main')}>
      {!user ? (
        <p className="text-[13px] text-white/50">Sign in to set up a profile.</p>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.05] text-2xl">
              {user.avatar ?? '🙂'}
            </div>
            <div className="min-w-0">
              <div className="truncate font-mono text-base text-white">{user.displayName}</div>
              <div className="truncate font-mono text-[11px] text-white/40">@{user.username}</div>
            </div>
          </div>

          <MenuField label="Display name" hint="This is the name your partner sees in the home and in chat.">
            <input className={inputClass} value={name} maxLength={16} onChange={(e) => setName(e.target.value)} />
          </MenuField>

          <MenuField label="Avatar">
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  onClick={() => updateProfile({ avatar: a })}
                  className={`h-10 w-10 rounded-xl border text-lg transition ${
                    user.avatar === a
                      ? 'border-accent/50 bg-accent/15'
                      : 'border-white/12 bg-white/[0.04] hover:bg-white/[0.09]'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </MenuField>

          {error && <p className="text-[12px] text-red-300/85">{error}</p>}
          <MenuButton variant="primary" onClick={save}>
            {saved ? 'Saved ✓' : 'Save profile'}
          </MenuButton>

          <dl className="space-y-1.5 border-t border-white/10 pt-4 font-mono text-[11px]">
            <Row label="Status" value={<span className={online ? 'text-green-300' : 'text-white/50'}>● {presence}</span>} />
            <Row label="Account" value={user.method === 'guest' ? 'Guest (this device)' : user.email ?? user.method} />
            <Row label="Member since" value={ago(user.createdAt)} />
            <Row label="Home" value={home ? `${home.name} · ${home.code}` : 'Not in a home'} />
            <Row label="Graphics" value={quality.toUpperCase()} />
            <Row label="Controls" value={isTouch ? 'Touch (joystick + look)' : 'Keyboard + mouse'} />
          </dl>
        </div>
      )}
    </MenuShell>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="uppercase tracking-widest text-white/35">{label}</dt>
      <dd className="truncate text-right text-white/70">{value}</dd>
    </div>
  )
}
