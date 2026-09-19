import { test } from 'node:test'
import assert from 'node:assert/strict'
import { characterFor, normalizeCharacterId, STORY_CHARACTERS } from '../src/config/characters'
import { sanitizeLook } from '../src/network/protocol'
import { profileById } from '../src/config/appearance'

test('every selectable character has a distinct name and a server-approved appearance', () => {
  assert.equal(new Set(STORY_CHARACTERS.map(c => c.name)).size, STORY_CHARACTERS.length)
  for (const character of STORY_CHARACTERS) {
    assert.equal(sanitizeLook(character.id), character.id)
    assert.equal(profileById(character.id)?.id, character.id)
  }
})

test('old appearance IDs migrate without exposing personal character names', () => {
  assert.equal(normalizeCharacterId('cuma'), 'atlas')
  assert.equal(normalizeCharacterId('zeynep'), 'mira')
  assert.equal(characterFor('zeynep').name, 'Mira Soren')
  assert.equal(profileById('zeynep')?.id, 'mira')
})

test('invalid and adversarial IDs always resolve to the default character', () => {
  for (const raw of [undefined, null, {}, [], '__proto__', 'constructor', '<script>', 'Zelda']) {
    assert.equal(normalizeCharacterId(raw), 'atlas')
    assert.equal(sanitizeLook(raw), 'atlas')
  }
})
