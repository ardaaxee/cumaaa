import { motion, useReducedMotion } from 'framer-motion'
import { usePlayerStore } from '../../store/usePlayerStore'

// The front door. Unlike MenuShell — a centred card, right for sub-screens —
// the stage is full-bleed: the live house keeps the right of the frame and the
// controls sit in a rail on the left, over a gradient that fades to nothing
// before it reaches the room. The world is the hero; the menu is a margin.
export function MenuStage({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  const still = useReducedMotion()
  const isTouch = usePlayerStore((s) => s.isTouch)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: still ? 0 : 0.3 }}
      className="pointer-events-auto absolute inset-0 z-50"
    >
      {/* The ground the rail sits on: near-opaque at the left edge, gone by 78%. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(100deg, rgba(7,9,13,0.96) 0%, rgba(7,9,13,0.93) 26%, rgba(7,9,13,0.66) 46%, rgba(7,9,13,0.10) 64%, rgba(7,9,13,0) 78%)',
        }}
      />

      <div
        className={`absolute inset-y-0 left-0 flex flex-col ${
          isTouch ? 'w-[min(94vw,330px)] px-5 py-4' : 'w-[min(92vw,440px)] px-10 py-9'
        }`}
      >
        <Rail delay={still ? 0 : 0.04}>
          <header className={isTouch ? 'mb-3' : 'mb-7'}>
            {eyebrow && (
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.42em] text-accent/70">{eyebrow}</div>
            )}
            <h1
              className={`font-mono font-bold leading-[0.95] tracking-[0.1em] text-white ${
                isTouch ? 'text-2xl' : 'text-4xl'
              }`}
              style={{ textWrap: 'balance' }}
            >
              {title}
            </h1>
            {/* A hairline that stops short — the accent's only job up here, so
                the title keeps the weight. */}
            <div className="mt-3 h-px w-16 bg-gradient-to-r from-accent/80 to-transparent" />
            {subtitle && (
              <p className={`mt-3 leading-relaxed text-white/45 ${isTouch ? 'text-[12px]' : 'text-[13px]'}`}>
                {subtitle}
              </p>
            )}
          </header>
        </Rail>

        <div className="scroll-thin min-h-0 flex-1 overflow-y-auto pr-1">{children}</div>

        {footer && <div className={isTouch ? 'pt-2' : 'pt-6'}>{footer}</div>}
      </div>
    </motion.div>
  )
}

// One entrance, staggered down the rail — the only motion on the screen.
export function Rail({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const still = useReducedMotion()
  return (
    <motion.div
      initial={still ? false : { opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: still ? 0 : 0.42, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

// The two ways into a shared house get real estate: a title, a line of plain
// language, and a glyph. Everything else on the stage is a single line.
export function StageAction({
  glyph,
  title,
  note,
  onClick,
  primary = false,
}: {
  glyph: string
  title: string
  note: string
  onClick: () => void
  primary?: boolean
}) {
  const isTouch = usePlayerStore((s) => s.isTouch)
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl border text-left transition ${
        isTouch ? 'px-3 py-2.5' : 'px-4 py-3.5'
      } ${
        primary
          ? 'border-accent/40 bg-accent/[0.10] hover:border-accent/70 hover:bg-accent/[0.17]'
          : 'border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.07]'
      } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/70`}
    >
      <span
        className={`font-mono leading-none ${isTouch ? 'text-base' : 'text-lg'} ${
          primary ? 'text-accent-soft' : 'text-white/40 group-hover:text-white/70'
        }`}
        aria-hidden="true"
      >
        {glyph}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block font-mono font-bold tracking-[0.14em] ${isTouch ? 'text-[12px]' : 'text-[13px]'} ${
            primary ? 'text-white' : 'text-white/85'
          }`}
        >
          {title}
        </span>
        <span className={`mt-0.5 block truncate text-white/40 ${isTouch ? 'text-[10px]' : 'text-[11px]'}`}>
          {note}
        </span>
      </span>
    </button>
  )
}

// Everything that is not a way into the house: one quiet line each.
export function StageLine({
  label,
  onClick,
  tone = 'normal',
}: {
  label: string
  onClick: () => void
  tone?: 'normal' | 'quiet'
}) {
  const isTouch = usePlayerStore((s) => s.isTouch)
  return (
    <button
      type="button"
      onClick={onClick}
      // Never wrap: a two-line item in the handset's two-column grid pushed the
      // row below it off the bottom of the rail.
      className={`w-full truncate whitespace-nowrap rounded-lg text-left font-mono uppercase transition hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/70 ${
        isTouch ? 'px-1.5 py-1.5 text-[10px] tracking-[0.14em]' : 'px-2 py-2 text-[11px] tracking-[0.2em]'
      } ${tone === 'quiet' ? 'text-white/30 hover:text-white/60' : 'text-white/55 hover:text-white'}`}
    >
      {label}
    </button>
  )
}
