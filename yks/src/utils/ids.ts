let counter = 0;

/** Çakışmayan, sıralanabilir kimlik üretir. */
export function uid(prefix = 'id'): string {
  counter = (counter + 1) % 1_000_000;
  const rand = Math.random().toString(36).slice(2, 7);
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${rand}`;
}

export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;

export function optionLetter(index: number | null | undefined): string {
  if (index == null || index < 0) return '—';
  return OPTION_LETTERS[index] ?? '—';
}
