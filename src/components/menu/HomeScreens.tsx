import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { useAuthStore } from '../../auth/useAuthStore'
import { useMultiplayerStore } from '../../store/useMultiplayerStore'
import { HOME_NAME_MAX, ROOM_CODE_LEN } from '../../network/protocol'
import { MenuShell, MenuButton, MenuField, inputClass } from './MenuShell'
import { Sfx } from '../../systems/audioSystem'

function useDisplayName(): string {
  const user = useAuthStore((s) => s.user)
  return user?.displayName ?? 'CUMA'
}

// Opening a new home: name it, then the server hands back the code to share.
export function CreateHomeScreen() {
  const setScreen = useAppStore((s) => s.setScreen)
  const createHome = useMultiplayerStore((s) => s.createHome)
  const phase = useMultiplayerStore((s) => s.phase)
  const name = useDisplayName()
  const [homeName, setHomeName] = useState('')

  const connecting = phase === 'connecting'

  return (
    <MenuShell
      title="CREATE HOME"
      subtitle="Opens a private home and gives you a code to share with one other person."
      onBack={() => setScreen('main')}
    >
      <div className="space-y-4">
        <MenuField label="Home name" hint="Just a label — you and your partner see it in the lobby.">
          <input
            className={inputClass}
            value={homeName}
            maxLength={HOME_NAME_MAX}
            placeholder="Our place"
            onChange={(e) => setHomeName(e.target.value)}
          />
        </MenuField>

        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 font-mono text-[11px] text-white/50">
          Joining as <span className="text-white/80">{name}</span> · host
          <div className="mt-1 text-white/35">Private: only someone with the code can join. Max 2 people.</div>
        </div>

        <MenuButton
          variant="primary"
          disabled={connecting}
          onClick={() => {
            Sfx.click()
            createHome(name, homeName || `${name}'s home`)
          }}
        >
          {connecting ? 'Opening…' : 'OPEN HOME'}
        </MenuButton>
      </div>
    </MenuShell>
  )
}

// Joining someone else's home with their 6-character code.
export function JoinHomeScreen() {
  const setScreen = useAppStore((s) => s.setScreen)
  const joinHome = useMultiplayerStore((s) => s.joinHome)
  const phase = useMultiplayerStore((s) => s.phase)
  const lastError = useMultiplayerStore((s) => s.lastError)
  const name = useDisplayName()
  const [code, setCode] = useState('')

  const connecting = phase === 'connecting'
  const errorText =
    lastError === 'HOME_NOT_FOUND'
      ? 'No home with that code. Check it and try again.'
      : lastError === 'ROOM_FULL'
        ? 'That home already has two people in it.'
        : lastError === 'BAD_REQUEST'
          ? 'That code is not valid.'
          : null

  return (
    <MenuShell title="JOIN HOME" subtitle="Enter the 6-character code you were given." onBack={() => setScreen('main')}>
      <div className="space-y-4">
        <MenuField label="Home code">
          <input
            className={`${inputClass} text-center font-mono text-xl uppercase tracking-[0.5em]`}
            value={code}
            maxLength={ROOM_CODE_LEN}
            placeholder="ABC123"
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
        </MenuField>

        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 font-mono text-[11px] text-white/50">
          Joining as <span className="text-white/80">{name}</span>
        </div>

        {errorText && <p className="text-[12px] leading-relaxed text-red-300/85">{errorText}</p>}

        <MenuButton
          variant="primary"
          disabled={connecting || code.length !== ROOM_CODE_LEN}
          onClick={() => {
            Sfx.click()
            joinHome(code, name)
          }}
        >
          {connecting ? 'Connecting…' : 'JOIN'}
        </MenuButton>
      </div>
    </MenuShell>
  )
}
