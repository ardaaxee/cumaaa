import { motion } from 'framer-motion'

// Shared chrome for every menu screen: a calm, dimmed backdrop over the live 3D
// house with one centred card. Deliberately plain — this should read like a
// home app, not a game launcher.
export function MenuShell({
  title,
  subtitle,
  onBack,
  children,
  wide = false,
}: {
  title: string
  subtitle?: string
  onBack?: () => void
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-ink-950/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className={`hud-panel max-h-[88vh] w-[min(94vw,${wide ? '640px' : '420px'})] overflow-y-auto p-6`}
        style={{ width: `min(94vw, ${wide ? 640 : 420}px)` }}
      >
        <header className="mb-5">
          {onBack && (
            <button
              className="mb-3 font-mono text-[11px] uppercase tracking-widest text-white/40 transition hover:text-white/80"
              onClick={onBack}
            >
              ‹ Back
            </button>
          )}
          <h1 className="font-mono text-lg font-bold tracking-[0.2em] text-white">{title}</h1>
          {subtitle && <p className="mt-1 text-[13px] leading-relaxed text-white/50">{subtitle}</p>}
        </header>
        {children}
      </motion.div>
    </motion.div>
  )
}

// The one button style the menu uses, so primary/secondary stay consistent.
export function MenuButton({
  children,
  onClick,
  variant = 'secondary',
  disabled = false,
  title,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'quiet'
  disabled?: boolean
  title?: string
}) {
  const styles =
    variant === 'primary'
      ? 'border-accent/45 bg-accent/15 text-accent-soft hover:bg-accent/25'
      : variant === 'quiet'
        ? 'border-transparent bg-transparent text-white/45 hover:text-white/80'
        : 'border-white/12 bg-white/[0.04] text-white/80 hover:bg-white/[0.09]'
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`w-full rounded-xl border px-4 py-3 text-left font-mono text-[13px] tracking-wide transition disabled:cursor-not-allowed disabled:opacity-35 ${styles}`}
    >
      {children}
    </button>
  )
}

export function MenuField({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">{label}</span>
      <div className="mt-1">{children}</div>
      {hint && <p className="mt-1 text-[11px] leading-relaxed text-white/35">{hint}</p>}
    </label>
  )
}

export const inputClass =
  'w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-accent/50'
