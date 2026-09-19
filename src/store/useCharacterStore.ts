import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_CHARACTER, normalizeCharacterId, type CharacterId } from '../config/characters'

interface CharacterState {
  characterId: CharacterId
  selectCharacter: (id: CharacterId) => void
}

// A device's character choice is independent of account names and host/guest roles.
export const useCharacterStore = create<CharacterState>()(persist(
  (set) => ({
    characterId: DEFAULT_CHARACTER,
    selectCharacter: (id) => set({ characterId: normalizeCharacterId(id) }),
  }),
  {
    name: 'room-character-v1',
    partialize: state => ({ characterId: state.characterId }),
    merge: (persisted, current) => ({
      ...current,
      characterId: normalizeCharacterId((persisted as Partial<CharacterState> | null)?.characterId),
    }),
  },
))
