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
const chair = ANCHORS.chair.pos
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
  {
    info: { id: 'chairSit', kind: 'chairSit', label: 'Desk Chair', prompt: 'Sit' },
    position: [chair[0], 0.9, chair[2]],
    radius: 1.5,
  },
  // Synced world toggles (shared with a co-op partner)
  {
    info: { id: 'doorToggle', kind: 'doorToggle', label: 'Door', prompt: 'Open / close' },
    position: [0, 1.4, 6],
    radius: 1.7,
  },
  {
    info: { id: 'lightToggle', kind: 'lightToggle', label: 'Living Light', prompt: 'Toggle light' },
    position: [-2.0, 1.3, 8.4],
    radius: 1.6,
  },
  // Living-room curtain — closing it cuts the daylight coming in.
  {
    info: { id: 'livingCurtain', kind: 'curtainToggle', label: 'Curtain', prompt: 'Open / close' },
    position: [-7.5, 1.5, 6.5],
    radius: 1.8,
  },

  // ---- Daily life -------------------------------------------------------
  // Generic openables and appliances. The id is the shared-world key, so these
  // are entries in a list rather than new code paths.
  {
    info: { id: 'kitchen-fridge', kind: 'openable', label: 'Fridge', prompt: 'Open fridge' },
    position: [9.0, 1.2, 12.1],
    radius: 1.8,
  },
  // The working kitchen. Each of these moves real geometry and syncs.
  {
    info: { id: 'kitchen-cupboard', kind: 'openable', label: 'Cupboard', prompt: 'Open cupboard' },
    position: [2.65, 0.6, 13.2],
    radius: 1.5,
  },
  {
    info: { id: 'kitchen-drawer', kind: 'openable', label: 'Drawer', prompt: 'Open drawer' },
    position: [4.3, 0.7, 13.2],
    radius: 1.4,
  },
  {
    info: { id: 'kitchen-oven', kind: 'openable', label: 'Oven', prompt: 'Open oven' },
    position: [5.7, 0.45, 13.2],
    radius: 1.5,
  },
  {
    info: { id: 'kitchen-microwave', kind: 'openable', label: 'Microwave', prompt: 'Open microwave' },
    position: [6.45, 1.11, 13.3],
    radius: 1.4,
  },
  {
    info: { id: 'kitchen-oven-heat', kind: 'appliance', label: 'Oven heat', prompt: 'Turn oven on / off' },
    position: [5.7, 0.79, 13.16],
    radius: 1.3,
  },
  {
    info: { id: 'kitchen-hob', kind: 'appliance', label: 'Hob', prompt: 'Turn hob on / off' },
    position: [5.7, 0.95, 13.3],
    radius: 1.4,
  },
  {
    info: { id: 'kitchen-kettle', kind: 'appliance', label: 'Kettle', prompt: 'Switch kettle on / off' },
    position: [2.1, 1.04, 13.3],
    radius: 1.4,
  },
  {
    info: { id: 'kitchen-tap', kind: 'appliance', label: 'Tap', prompt: 'Turn tap on / off' },
    position: [3.0, 0.95, 13.25],
    radius: 1.4,
  },
  {
    info: { id: 'laundry-washer', kind: 'openable', label: 'Washing machine', prompt: 'Open door' },
    position: [11.4, 0.6, 25.9],
    radius: 1.6,
  },
  {
    info: { id: 'bd2-wardrobe', kind: 'openable', label: 'Wardrobe', prompt: 'Open wardrobe' },
    position: [-11.0, 1.2, 22.2],
    radius: 1.7,
  },
  {
    info: { id: 'bd3-wardrobe', kind: 'openable', label: 'Wardrobe', prompt: 'Open wardrobe' },
    position: [-0.95, 1.2, 29.4],
    radius: 1.7,
  },
  {
    info: { id: 'bd4-wardrobe', kind: 'openable', label: 'Wardrobe', prompt: 'Open wardrobe' },
    position: [0.95, 1.2, 29.4],
    radius: 1.7,
  },

  // Living-room TV — opens the shared Movie Night panel.
  {
    info: { id: 'movieNight', kind: 'movieNight', label: 'TV', prompt: 'Watch together' },
    position: [-5.75, 1.35, 6.9],
    radius: 2.2,
  },
  // Two sofa seats so CUMA and ZEYNEP can sit side by side for movie night.
  {
    info: { id: 'sofaLeft', kind: 'sofaSit', label: 'Sofa', prompt: 'Sit (left)' },
    position: [-6.45, 0.6, 12.9],
    radius: 1.2,
  },
  {
    info: { id: 'sofaRight', kind: 'sofaSit', label: 'Sofa', prompt: 'Sit (right)' },
    position: [-5.05, 0.6, 12.9],
    radius: 1.2,
  },
  // Shared snacks on the coffee table.
  {
    info: { id: 'popcorn', kind: 'snackTake', label: 'Popcorn', prompt: 'Take' },
    position: [-6.1, 0.5, 10.5],
    radius: 1.1,
  },
  {
    info: { id: 'chips', kind: 'snackTake', label: 'Chips', prompt: 'Take' },
    position: [-5.75, 0.5, 10.7],
    radius: 1.1,
  },
  {
    info: { id: 'drink', kind: 'snackTake', label: 'Drink', prompt: 'Take' },
    position: [-5.4, 0.5, 10.5],
    radius: 1.1,
  },
]

// Seated poses for the two sofa seats, keyed by interactable id. Facing the TV
// (south, yaw 0). Used by the sit interaction — each player sits locally.
export const SOFA_SEATS: Record<string, { x: number; z: number; yaw: number }> = {
  sofaLeft: { x: -6.45, z: 12.75, yaw: 0 },
  sofaRight: { x: -5.05, z: 12.75, yaw: 0 },
}
