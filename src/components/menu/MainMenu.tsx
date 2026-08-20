import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import { useAuthStore } from '../../auth/useAuthStore'
import { useMultiplayerStore } from '../../store/useMultiplayerStore'
import { useRoomStore } from '../../store/useRoomStore'
import { MenuShell, MenuButton } from './MenuShell'
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
  return (
    <AnimatePresence mode="wait">
      <MenuShell
        key="main"
        title="CUMA HOME"
        subtitle={signedIn ? `Signed in as ${user!.displayName}` : 'A home for two, online.'}
      >
        <div className="space-y-2">
          {signedIn ? (
            <>
              <MenuButton
                variant="primary"
                onClick={() => {
                  Sfx.click()
                  setStage('playing')
                }}
              >
                PLAY <span className="ml-2 text-[11px] text-white/40">on your own</span>
              </MenuButton>
              <MenuButton onClick={() => { Sfx.click(); setScreen('create') }}>CREATE HOME</MenuButton>
              <MenuButton onClick={() => { Sfx.click(); setScreen('join') }}>JOIN HOME</MenuButton>
              <MenuButton onClick={() => { Sfx.click(); setScreen('profile') }}>PROFILE</MenuButton>
              <MenuButton onClick={() => { Sfx.click(); setScreen('settings') }}>SETTINGS</MenuButton>
              <MenuButton onClick={() => { Sfx.click(); setScreen('howto') }}>HOW TO PLAY</MenuButton>
              <MenuButton
                variant="quiet"
                onClick={() => {
                  Sfx.close()
                  if (roomId) leaveHome()
                  signOut()
                }}
              >
                LOG OUT
              </MenuButton>
            </>
          ) : (
            <>
              <MenuButton variant="primary" onClick={() => { Sfx.click(); openAuth('signin') }}>
                SIGN IN
              </MenuButton>
              <MenuButton onClick={() => { Sfx.click(); openAuth('register') }}>CREATE ACCOUNT</MenuButton>
              <MenuButton onClick={() => { Sfx.click(); setScreen('settings') }}>SETTINGS</MenuButton>
              <MenuButton onClick={() => { Sfx.click(); setScreen('howto') }}>HOW TO PLAY</MenuButton>
            </>
          )}
        </div>
      </MenuShell>
    </AnimatePresence>
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
