import { useState } from 'react'
import { useAuthStore } from '../../auth/useAuthStore'
import { useAppStore } from '../../store/useAppStore'
import { MenuShell, MenuButton, MenuField, inputClass } from './MenuShell'
import { Sfx } from '../../systems/audioSystem'

// Sign in / create account. What this screen offers is driven entirely by the
// provider's capabilities, so a button never appears for something that cannot
// work — and when the local demo provider is active, the screen says so plainly
// instead of implying a real account exists somewhere.
export function AuthScreen({ mode }: { mode: 'signin' | 'register' }) {
  const caps = useAuthStore((s) => s.capabilities)
  const status = useAuthStore((s) => s.status)
  const error = useAuthStore((s) => s.error)
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle)
  const signInWithPassword = useAuthStore((s) => s.signInWithPassword)
  const registerWithPassword = useAuthStore((s) => s.registerWithPassword)
  const continueAsGuest = useAuthStore((s) => s.continueAsGuest)
  const setScreen = useAppStore((s) => s.setScreen)

  const [registering, setRegistering] = useState(mode === 'register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const busy = status === 'signing-in'

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    Sfx.click()
    if (registering) registerWithPassword({ email, password, displayName })
    else signInWithPassword({ email, password })
  }

  return (
    <MenuShell
      title={registering ? 'CREATE ACCOUNT' : 'SIGN IN'}
      subtitle={registering ? 'Your name is what your partner sees in the home.' : 'Welcome back.'}
      onBack={() => setScreen('main')}
    >
      {caps.demo && (
        <div className="mb-4 rounded-lg border border-amber-400/25 bg-amber-400/[0.07] p-3">
          <div className="font-mono text-[10px] uppercase tracking-widest text-amber-300/90">Demo authentication</div>
          <p className="mt-1 text-[12px] leading-relaxed text-white/60">
            No authentication server is configured, so nothing here is verified and{' '}
            <strong className="font-semibold text-white/80">no password is stored</strong>. Your identity is kept on
            this device only. Set <code className="text-white/70">VITE_AUTH_PROVIDER_URL</code> for real accounts.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <MenuButton
          variant="secondary"
          disabled={!caps.google || busy}
          title={caps.google ? undefined : caps.reason ?? undefined}
          onClick={() => {
            Sfx.click()
            signInWithGoogle()
          }}
        >
          Continue with Google
          {!caps.google && <span className="ml-2 text-[11px] text-white/35">unavailable</span>}
        </MenuButton>
        {!caps.google && caps.reason && (
          <p className="px-1 text-[11px] leading-relaxed text-white/35">{caps.reason}</p>
        )}
      </div>

      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/25">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form className="space-y-3" onSubmit={submit}>
        {registering && (
          <MenuField label="Display name">
            <input
              className={inputClass}
              value={displayName}
              maxLength={16}
              placeholder="CUMA"
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </MenuField>
        )}
        <MenuField label="Email">
          <input
            className={inputClass}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </MenuField>
        <MenuField label="Password" hint={caps.demo ? 'Not stored and not checked in demo mode.' : undefined}>
          <input
            className={inputClass}
            type="password"
            autoComplete={registering ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </MenuField>

        {error && <p className="text-[12px] leading-relaxed text-red-300/85">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl border border-accent/45 bg-accent/15 px-4 py-3 font-mono text-[13px] tracking-wide text-accent-soft transition hover:bg-accent/25 disabled:opacity-40"
        >
          {busy ? 'Working…' : registering ? 'CREATE ACCOUNT' : 'SIGN IN'}
        </button>
      </form>

      <div className="mt-4 space-y-2">
        <MenuButton variant="quiet" onClick={() => setRegistering((r) => !r)}>
          {registering ? 'I already have an account' : 'Create a new account'}
        </MenuButton>
        <MenuButton
          variant="quiet"
          disabled={busy}
          onClick={() => {
            Sfx.click()
            continueAsGuest(displayName || 'CUMA')
          }}
        >
          Continue as guest
        </MenuButton>
      </div>
    </MenuShell>
  )
}
