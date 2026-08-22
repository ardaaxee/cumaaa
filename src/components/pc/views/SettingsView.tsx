import { useRoomStore } from '../../../store/useRoomStore'
import { usePlayerStore } from '../../../store/usePlayerStore'
import { setAudioEnabled, setMasterVolume, setSfxVolume, setAmbientVolume } from '../../../systems/audioSystem'
import { isTouchDevice } from '../../../utils/device'
import type { GraphicsQuality } from '../../../types'

type QualityMode = GraphicsQuality | 'auto'
const QUALITY_MODES: QualityMode[] = ['auto', 'low', 'medium', 'high', 'ultra']

// Tiers a phone/tablet is unlikely to sustain. Choosing one is allowed — the
// app just says plainly what to expect rather than silently overriding it.
function warnsAbout(mode: QualityMode): boolean {
  return isTouchDevice() && (mode === 'ultra' || mode === 'high')
}

// Settings: graphics, sound, sensitivity, and a data reset.
export function SettingsView() {
  const settings = useRoomStore((s) => s.settings)
  const setSettings = useRoomStore((s) => s.setSettings)
  const resetAll = useRoomStore((s) => s.resetAll)
  const isTouch = usePlayerStore((s) => s.isTouch)

  return (
    <div className="space-y-6">
      {/* Graphics */}
      <Section title="Graphics">
        <div className="flex flex-wrap gap-2">
          {QUALITY_MODES.map((q) => (
            <button
              key={q}
              onClick={() =>
                setSettings(
                  q === 'auto'
                    ? { qualityMode: 'auto' }
                    : { qualityMode: q, quality: q, bloom: q !== 'low' && settings.bloom },
                )
              }
              className={`min-w-[68px] flex-1 rounded-lg border px-3 py-2 text-sm uppercase transition ${
                settings.qualityMode === q
                  ? 'border-accent/50 bg-accent/15 text-accent-soft'
                  : 'border-white/10 bg-ink-800/60 text-white/60 hover:text-white'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
        <p className="text-xs text-white/40">
          {settings.qualityMode === 'auto'
            ? `Auto — currently running at ${settings.quality.toUpperCase()}, adjusted to keep the frame rate steady.`
            : `Locked to ${settings.qualityMode.toUpperCase()}. Auto adjustment is off.`}
        </p>
        {warnsAbout(settings.qualityMode) && (
          <p className="rounded-lg border border-amber-400/25 bg-amber-400/[0.07] px-3 py-2 text-xs text-amber-200/90">
            Your device may reduce performance.
          </p>
        )}
        <Toggle
          label="Bloom & post-processing"
          checked={settings.bloom}
          disabled={settings.quality === 'low'}
          onChange={(v) => setSettings({ bloom: v })}
        />
      </Section>

      {/* Sound */}
      <Section title="Sound">
        <Toggle
          label="Sound effects"
          checked={settings.soundEnabled}
          onChange={(v) => {
            setSettings({ soundEnabled: v })
            setAudioEnabled(v)
          }}
        />
        <Slider
          label={`Master volume · ${Math.round(settings.volume * 100)}%`}
          value={settings.volume}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => {
            setSettings({ volume: v })
            setMasterVolume(v)
          }}
        />
        <Slider
          label={`Effects · ${Math.round(settings.sfxVolume * 100)}%`}
          value={settings.sfxVolume}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => {
            setSettings({ sfxVolume: v })
            setSfxVolume(v)
          }}
        />
        <Slider
          label={`Ambience · ${Math.round(settings.ambientVolume * 100)}%`}
          value={settings.ambientVolume}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => {
            setSettings({ ambientVolume: v })
            setAmbientVolume(v)
          }}
        />
      </Section>

      {/* Sensitivity */}
      <Section title="Controls">
        <Slider
          label={`Mouse sensitivity · ${settings.sensitivity.toFixed(1)}×`}
          value={settings.sensitivity}
          min={0.2}
          max={2.5}
          step={0.1}
          onChange={(v) => setSettings({ sensitivity: v })}
        />
        <Slider
          label={`Touch sensitivity · ${settings.touchSensitivity.toFixed(1)}×`}
          value={settings.touchSensitivity}
          min={0.2}
          max={2.5}
          step={0.1}
          onChange={(v) => setSettings({ touchSensitivity: v })}
        />
        <p className="text-xs text-white/40">
          Detected input: {isTouch ? 'touch' : 'keyboard & mouse'}.
        </p>
        <p className="text-xs text-white/40">
          Desktop: WASD to move, mouse to look, Shift to run, Space to jump, E or click to interact.
          Mobile: left joystick to move, drag the right side to look, RUN / JUMP buttons, and E to
          interact.
        </p>
      </Section>

      {/* Interface */}
      <Section title="Interface">
        <Toggle
          label="Show player names"
          checked={settings.showPlayerNames}
          onChange={(v) => setSettings({ showPlayerNames: v })}
        />
        <Toggle
          label="Show mini map"
          checked={settings.showMiniMap}
          onChange={(v) => setSettings({ showMiniMap: v })}
        />
        <Toggle
          label="Chat notifications"
          checked={settings.chatNotifications}
          onChange={(v) => setSettings({ chatNotifications: v })}
        />
        <Toggle
          label="Reduced motion"
          checked={settings.reducedMotion}
          onChange={(v) => setSettings({ reducedMotion: v })}
        />
        <p className="text-xs text-white/40">
          Reduced motion removes the walking head-bob and the camera lean while running.
        </p>
      </Section>

      {/* Data */}
      <Section title="Data">
        <button
          onClick={() => {
            if (confirm('Reset all data? This cannot be undone.')) resetAll()
          }}
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500/20"
        >
          Reset all data
        </button>
        <p className="text-xs text-white/40">
          Everything is stored locally in your browser (localStorage). Nothing is sent to a server.
        </p>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-accent-soft/80">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Toggle({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string
  checked: boolean
  disabled?: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-ink-800/60 px-3 py-2 text-sm text-white/80 disabled:opacity-40"
    >
      <span>{label}</span>
      <span
        className={`relative h-5 w-9 rounded-full transition ${
          checked ? 'bg-accent/60' : 'bg-white/15'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
            checked ? 'left-4' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-white/60">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-accent"
      />
    </label>
  )
}
