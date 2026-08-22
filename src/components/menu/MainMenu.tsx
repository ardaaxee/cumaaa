import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import { useAuthStore } from '../../auth/useAuthStore'
import { useMultiplayerStore } from '../../store/useMultiplayerStore'
import { usePlayerStore } from '../../store/usePlayerStore'
import { useRoomStore } from '../../store/useRoomStore'
import { MenuShell } from './MenuShell'
import { MenuStage, Rail, StageAction, StageLine } from './MenuStage'
import { AuthScreen } from './AuthScreen'
import { ProfileScreen } from './ProfileScreen'
import { CreateHomeScreen, JoinHomeScreen } from './HomeScreens'
import { SettingsView } from '../pc/views/SettingsView'
import { Sfx } from '../../systems/audioSystem'

// The application's front door. Everything here sits over the live 3D house,
// so the world is already warm by the time PLAY is pressed.
export function MainMenu() {
  const screen = useAppStore((s) => s.screen)
  const setScreen = useAppStore((s) => s.setScreen)
  const setStage = useAppStore((s) => s.setStage)
  const openAuth = useAppStore((s) => s.openAuth)
  const authMode = useAppStore((s) => s.authMode)

  const status = useAuthStore((s) => s.status)
  const user = useAuthStore((s) => s.user)
  const restore = useAuthStore((s) => s.restore)
  const signOut = useAuthStore((s) => s.signOut)

  const roomId = useMultiplayerStore((s) => s.roomId)
  const leaveHome = useMultiplayerStore((s) => s.leaveHome)

  // Pick up an existing session once on mount.
  useEffect(() => {
    if (status === 'unknown') restore()
  }, [status, restore])

  // Signing in successfully is what closes the auth screen — otherwise the
  // player is left staring at the form they just completed.
  useEffect(() => {
    if (status === 'signed-in' && useAppStore.getState().screen === 'auth') setScreen('main')
  }, [status, setScreen])

  // The player's identity is the source of truth for their in-world name.
  useEffect(() => {
    if (!user) return
    const room = useRoomStore.getState()
    if (room.profile.name !== user.displayName) {
      room.setProfile({ name: user.displayName, username: user.username })
    }
  }, [user])

  const signedIn = status === 'signed-in' && !!user
  const isTouch = usePlayerStore((s) => s.isTouch)

  const handleSignOut = () => {
    Sfx.close()
    if (roomId) leaveHome()
    signOut()
  }

  if (screen === 'auth') return <AuthScreen mode={authMode} />
  if (screen === 'profile') return <ProfileScreen />
  if (screen === 'create') return <CreateHomeScreen />
  if (screen === 'join') return <JoinHomeScreen />

  if (screen === 'settings') {
    return (
      <MenuShell title="SETTINGS" onBack={() => setScreen('main')} wide>
        <SettingsView />
      </MenuShell>
    )
  }

  if (screen === 'howto') {
    return (
      <MenuShell title="HOW TO PLAY" onBack={() => setScreen('main')}>
        <div className="space-y-4 text-[13px] leading-relaxed text-white/60">
          <Section title="Move">
            <p>
              <Key>W A S D</Key> to walk, <Key>SHIFT</Key> to run, <Key>SPACE</Key> to jump. Move the mouse to look
              around. On a phone: left thumb drives the joystick, right side of the screen looks.
            </p>
          </Section>
          <Section title="Interact">
            <p>
              Walk up to something and press <Key>E</Key> or click. Doors, lights, the TV, chairs and the desk all
              respond. On touch, an <Key>E</Key> button appears when something is in reach.
            </p>
          </Section>
          <Section title="Together">
            <p>
              Open a home, share the 6-character code, and your partner joins the same house. Lights, doors, the TV and
              the film you are watching stay in sync. Press <Key>ENTER</Key> to chat.
            </p>
          </Section>
          <Section title="Your things">
            <p>The desk computer holds your projects, tasks and notes. Those stay on your own device.</p>
          </Section>
        </div>
      </MenuShell>
    )
  }

  // ---- main ----
  // The house is built for two, so the two ways into a shared one lead and get
  // the space. Playing alone is real and stays available, but it is the quiet
  // line underneath rather than the headline the menu used to open with.
  const inHome = !!roomId

  return (
    <AnimatePresence mode="wait">
      <MenuStage
        key="main"
        eyebrow={signedIn ? 'A HOME FOR TWO' : 'WELCOME'}
        title="CUMA HOME"
        subtitle={
          signedIn
            ? isTouch
              ? 'Share a code and walk the same rooms together.'
              : 'Open a home and share the code, or enter the code you were given. Lights, doors, the film — everything stays in sync.'
            : 'A house you and one other person walk around together, in the same rooms at the same time.'
        }
        footer={signedIn ? <Footer name={user!.displayName} onSignOut={handleSignOut} /> : undefined}
      >
        {signedIn ? (
          <div className="space-y-4">
            <Rail delay={0.1}>
              <div className="space-y-2">
                <StageAction
                  glyph="⌂"
                  title="OPEN A HOME"
                  note="Start a house and get a code to share"
                  primary
                  onClick={() => {
                    Sfx.click()
                    setScreen('create')
                  }}
                />
                <StageAction
                  glyph="⇥"
                  title="JOIN A HOME"
                  note="Enter the 6-character code you were given"
                  onClick={() => {
                    Sfx.click()
                    setScreen('join')
                  }}
                />
              </div>
            </Rail>

            <Rail delay={0.16}>
              {/* Two columns on a handset: four stacked lines ran past the
                  bottom of a 400px-tall landscape screen. */}
              <div className={`border-t border-white/[0.07] pt-2 ${isTouch ? 'grid grid-cols-2 gap-x-2' : ''}`}>
                <StageLine
                  label={inHome ? '↩  Back inside' : isTouch ? '◇  Alone' : '◇  Walk it alone'}
                  onClick={() => {
                    Sfx.click()
                    setStage('playing')
                  }}
                />
                <StageLine label="◉  Profile" onClick={() => { Sfx.click(); setScreen('profile') }} />
                <StageLine label="⚙  Settings" onClick={() => { Sfx.click(); setScreen('settings') }} />
                <StageLine
                  label={isTouch ? '?  Help' : '?  How to play'}
                  onClick={() => { Sfx.click(); setScreen('howto') }}
                />
              </div>
            </Rail>
          </div>
        ) : (
          <Rail delay={0.1}>
            <div className="space-y-2">
              <StageAction
                glyph="→"
                title="SIGN IN"
                note="Pick up where you left off"
                primary
                onClick={() => {
                  Sfx.click()
                  openAuth('signin')
                }}
              />
              <StageAction
                glyph="+"
                title="CREATE ACCOUNT"
                note="Your name is how your partner finds you"
                onClick={() => {
                  Sfx.click()
                  openAuth('register')
                }}
              />
              <div className="border-t border-white/[0.07] pt-2">
                <StageLine label="⚙  Settings" onClick={() => { Sfx.click(); setScreen('settings') }} />
                <StageLine label="?  How to play" onClick={() => { Sfx.click(); setScreen('howto') }} />
              </div>
            </div>
          </Rail>
        )}
      </MenuStage>
    </AnimatePresence>
  )
}

function Footer({ name, onSignOut }: { name: string; onSignOut: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] pt-3">
      <div className="min-w-0">
        <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/25">Signed in</div>
        <div className="truncate font-mono text-[12px] text-white/70">{name}</div>
      </div>
      <button
        className="shrink-0 rounded-lg px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 transition hover:bg-white/[0.06] hover:text-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/70"
        onClick={onSignOut}
      >
        Log out
      </button>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-1 font-mono text-[10px] uppercase tracking-widest text-white/40">{title}</h2>
      {children}
    </div>
  )
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-white/15 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[11px] text-white/75">
      {children}
    </kbd>
  )
}
