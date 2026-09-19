// Shared by client and server. No rendering or browser dependencies.
export const STORY_CHARACTERS = [
  { id: 'atlas', name: 'Atlas Varen', role: 'Restoration specialist',
    description: 'Reads the traces left in abandoned rooms. Patient, practical, and determined to uncover what happened.' },
  { id: 'mira', name: 'Mira Soren', role: 'Sound archivist',
    description: 'Follows lost recordings and notices what others miss. Curious, observant, and unwilling to leave a mystery unsolved.' },
] as const

export type CharacterId = typeof STORY_CHARACTERS[number]['id']
export const DEFAULT_CHARACTER: CharacterId = 'atlas'

export function normalizeCharacterId(raw: unknown): CharacterId {
  // Read old saves and messages; new sessions only emit canonical IDs.
  if (raw === 'mira' || raw === 'zeynep') return 'mira'
  return DEFAULT_CHARACTER
}

export function characterFor(raw: unknown) {
  const id = normalizeCharacterId(raw)
  return STORY_CHARACTERS.find(character => character.id === id)!
}
