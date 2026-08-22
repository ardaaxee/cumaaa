import { useMultiplayerStore } from '../../store/useMultiplayerStore'
import { RemotePlayer } from './RemotePlayer'
import type { GraphicsQuality } from '../../types'

// Renders one interpolated avatar per connected peer (everyone but you). Cheap
// when you're alone — the roster is empty. Player transforms come from the
// mutable peerStates map, so this only re-renders when someone joins/leaves.
export function RemotePlayers({ quality }: { quality: GraphicsQuality }) {
  const peers = useMultiplayerStore((s) => s.peers)
  return (
    <>
      {peers.map((p) => (
        <RemotePlayer key={p.id} id={p.id} name={p.name} look={p.look} quality={quality} />
      ))}
    </>
  )
}
