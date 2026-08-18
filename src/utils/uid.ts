// Small collision-resistant id generator (no external dependency).
export function uid(): string {
  const rand = Math.random().toString(36).slice(2, 8)
  const time = Date.now().toString(36).slice(-4)
  return `${time}${rand}`
}
