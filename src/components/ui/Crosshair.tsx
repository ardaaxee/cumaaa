import { useInteractionStore } from '../../systems/interactionSystem'

// A minimal reticle at screen centre. Grows/brightens when an interactable is
// in focus.
export function Crosshair() {
  const focused = useInteractionStore((s) => s.focus !== null)
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
      <div
        className={`rounded-full border transition-all duration-200 ${
          focused
            ? 'h-4 w-4 border-accent shadow-glow'
            : 'h-1.5 w-1.5 border-white/50'
        }`}
      />
    </div>
  )
}
