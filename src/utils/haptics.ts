// Very light haptic feedback for touch UI, where the device supports it.
// Deliberately tiny — never buzz on continuous input like joystick drags.
export function haptic(ms: number): void {
  try {
    navigator.vibrate?.(ms)
  } catch {
    /* unsupported — silently ignore */
  }
}
