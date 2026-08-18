import { ANCHORS } from './roomLayout'
import type { InteractableInfo } from '../types'

// Declarative list of interactive objects with their trigger positions and
// activation radii. InteractionManager maps each kind to a panel/action.
export interface InteractableDef {
  info: InteractableInfo
  position: [number, number, number]
  radius: number
}

const monitor = ANCHORS.monitor.pos
const taskboard = ANCHORS.taskboard.pos
const bookcase = ANCHORS.bookcase.pos
const secret = ANCHORS.secret.pos
const speaker = ANCHORS.speaker.pos
const win = ANCHORS.window.pos
const bed = ANCHORS.bed.pos
const ach = ANCHORS.achievements.pos

export const INTERACTABLES: InteractableDef[] = [
  {
    info: { id: 'pc', kind: 'pc', label: 'Workstation', prompt: 'Enter ARDA OS' },
    position: [monitor[0], monitor[1], monitor[2]],
    radius: 2.6,
  },
  {
    info: { id: 'taskboard', kind: 'taskboard', label: 'Task Board', prompt: 'Open tasks' },
    position: [taskboard[0] + 0.5, taskboard[1], taskboard[2]],
    radius: 2.4,
  },
  {
    info: { id: 'archive', kind: 'archive', label: 'Archive', prompt: 'Open archive' },
    position: [bookcase[0] - 0.6, 1.4, bookcase[2]],
    radius: 2.4,
  },
  {
    info: { id: 'secret', kind: 'secret', label: 'Odd Book', prompt: 'Push the book' },
    position: [bookcase[0] - 0.35, secret[1], secret[2]],
    radius: 1.5,
  },
  {
    info: { id: 'music', kind: 'music', label: 'Speaker', prompt: 'Open music' },
    position: [speaker[0], speaker[1], speaker[2]],
    radius: 1.8,
  },
  {
    info: { id: 'window', kind: 'window', label: 'Window', prompt: 'Look outside' },
    position: [win[0], win[1], win[2] + 0.5],
    radius: 2.4,
  },
  {
    info: { id: 'bed', kind: 'bed', label: 'Bed', prompt: 'Rest' },
    position: [bed[0], 0.6, bed[2]],
    radius: 2.2,
  },
  {
    info: { id: 'achievements', kind: 'achievements', label: 'Achievements', prompt: 'View wall' },
    position: [ach[0] + 0.5, ach[1], ach[2]],
    radius: 2.4,
  },
]
