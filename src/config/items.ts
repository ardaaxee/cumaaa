// The things in the home that can be picked up, carried, filled, cooked, eaten
// and put down again.
//
// One definition per kind of object. A definition is not an instance: the two
// glasses on the shelf are two WorldItems (each with its own uid and fill
// level) that both point at the `glass` definition here. Instances live in the
// shared room state so they sync and survive a rejoin; definitions are static
// and shipped with the client.
//
// `model` names the mesh in the world-model registry and `icon` the drawing in
// the UI registry. They are deliberately the same key: the icon is a 2D version
// of the same object, drawn from the same silhouette, never a generic box.

export type ItemCategory = 'tableware' | 'cookware' | 'food' | 'drink' | 'personal' | 'household'

// How the hand holds it. This picks the grip transform on the wrist AND the
// arm pose, so a mug is carried differently from a book.
export type HoldPose =
  | 'grip' // fist round a handle or shaft — pan, kettle, bottle
  | 'pinch' // finger and thumb — fork, spoon, key
  | 'cup' // curled hand round a vessel — glass, mug
  | 'flat' // carried level on the palm — plate, tray
  | 'twoHand' // both hands, in front — pot, box

// What pressing E does while it is in your hand.
export type ItemInteraction = 'none' | 'drink' | 'eat' | 'read' | 'use' | 'phone'

// What a vessel can be filled with. Vessels with `capacity` can hold one of
// these at a time.
export type Fluid = 'water' | 'tea' | 'coffee'

export interface ItemDef {
  id: string
  name: string
  category: ItemCategory
  /** kg — carried weight is capped, so a pot costs more than a fork. */
  weight: number
  stackable: boolean
  /** Can it do anything at all in the hand? */
  usable: boolean
  holdPose: HoldPose
  icon: string // key into the icon registry (src/components/items/icons.tsx)
  model: string // key into the world-model registry (src/components/items/models.tsx)
  interaction: ItemInteraction
  /** Vessels: can be filled at the tap and drunk from. */
  capacity?: number
  /** Cookware: can go on the hob and hold a cooking state. */
  cookware?: boolean
  /** Food: what eating it gives back (kept simple — a needs system is later). */
  edible?: boolean
}

const DEFS: ItemDef[] = [
  // ---- Tableware ----------------------------------------------------------
  {
    id: 'glass', name: 'Bardak', category: 'tableware', weight: 0.25, stackable: false,
    usable: true, holdPose: 'cup', icon: 'glass', model: 'glass', interaction: 'drink', capacity: 0.3,
  },
  {
    id: 'mug', name: 'Kupa', category: 'tableware', weight: 0.32, stackable: false,
    usable: true, holdPose: 'cup', icon: 'mug', model: 'mug', interaction: 'drink', capacity: 0.25,
  },
  {
    id: 'plate', name: 'Tabak', category: 'tableware', weight: 0.4, stackable: true,
    usable: false, holdPose: 'flat', icon: 'plate', model: 'plate', interaction: 'none',
  },
  {
    id: 'fork', name: 'Çatal', category: 'tableware', weight: 0.05, stackable: true,
    usable: false, holdPose: 'pinch', icon: 'fork', model: 'fork', interaction: 'none',
  },
  {
    id: 'spoon', name: 'Kaşık', category: 'tableware', weight: 0.05, stackable: true,
    usable: false, holdPose: 'pinch', icon: 'spoon', model: 'spoon', interaction: 'none',
  },
  {
    id: 'knife', name: 'Bıçak', category: 'tableware', weight: 0.07, stackable: true,
    usable: false, holdPose: 'pinch', icon: 'knife', model: 'knife', interaction: 'none',
  },

  // ---- Cookware -----------------------------------------------------------
  {
    id: 'pot', name: 'Tencere', category: 'cookware', weight: 1.4, stackable: false,
    usable: false, holdPose: 'twoHand', icon: 'pot', model: 'pot', interaction: 'none',
    capacity: 2, cookware: true,
  },
  {
    id: 'pan', name: 'Tava', category: 'cookware', weight: 1.0, stackable: false,
    usable: false, holdPose: 'grip', icon: 'pan', model: 'pan', interaction: 'none', cookware: true,
  },
  {
    id: 'kettle', name: 'Kettle', category: 'cookware', weight: 0.9, stackable: false,
    usable: false, holdPose: 'grip', icon: 'kettle', model: 'kettle', interaction: 'none',
    capacity: 1.2,
  },

  // ---- Drink --------------------------------------------------------------
  {
    id: 'bottle', name: 'Su şişesi', category: 'drink', weight: 0.6, stackable: false,
    usable: true, holdPose: 'grip', icon: 'bottle', model: 'bottle', interaction: 'drink', capacity: 0.5,
  },
  {
    id: 'milk', name: 'Süt', category: 'drink', weight: 1.0, stackable: false,
    usable: true, holdPose: 'grip', icon: 'milk', model: 'milk', interaction: 'drink', capacity: 1,
  },

  // ---- Food ---------------------------------------------------------------
  {
    id: 'tomato', name: 'Domates', category: 'food', weight: 0.12, stackable: true,
    usable: true, holdPose: 'cup', icon: 'tomato', model: 'tomato', interaction: 'eat', edible: true,
  },
  {
    id: 'apple', name: 'Elma', category: 'food', weight: 0.15, stackable: true,
    usable: true, holdPose: 'cup', icon: 'apple', model: 'apple', interaction: 'eat', edible: true,
  },
  {
    id: 'bread', name: 'Ekmek', category: 'food', weight: 0.35, stackable: false,
    usable: true, holdPose: 'grip', icon: 'bread', model: 'bread', interaction: 'eat', edible: true,
  },
  {
    id: 'cheese', name: 'Peynir', category: 'food', weight: 0.25, stackable: true,
    usable: true, holdPose: 'flat', icon: 'cheese', model: 'cheese', interaction: 'eat', edible: true,
  },
  {
    id: 'egg', name: 'Yumurta', category: 'food', weight: 0.06, stackable: true,
    usable: false, holdPose: 'pinch', icon: 'egg', model: 'egg', interaction: 'none', edible: true,
  },

  // ---- Personal / household ----------------------------------------------
  {
    id: 'book', name: 'Kitap', category: 'personal', weight: 0.4, stackable: false,
    usable: true, holdPose: 'flat', icon: 'book', model: 'book', interaction: 'read',
  },
  {
    id: 'phone', name: 'Telefon', category: 'personal', weight: 0.18, stackable: false,
    usable: true, holdPose: 'pinch', icon: 'phone', model: 'phone', interaction: 'phone',
  },
  {
    id: 'remote', name: 'Kumanda', category: 'household', weight: 0.12, stackable: false,
    usable: true, holdPose: 'grip', icon: 'remote', model: 'remote', interaction: 'use',
  },
  {
    id: 'keys', name: 'Anahtar', category: 'personal', weight: 0.05, stackable: false,
    usable: false, holdPose: 'pinch', icon: 'keys', model: 'keys', interaction: 'none',
  },
  {
    id: 'towel', name: 'Havlu', category: 'household', weight: 0.3, stackable: true,
    usable: false, holdPose: 'flat', icon: 'towel', model: 'towel', interaction: 'none',
  },
]

const BY_ID = new Map(DEFS.map((d) => [d.id, d]))

export const ITEM_DEFS = DEFS
export const ITEM_IDS = DEFS.map((d) => d.id)

export function itemDef(id: string): ItemDef | undefined {
  return BY_ID.get(id)
}

/** A definition is required in most call sites; fall back rather than crash. */
export function itemDefOr(id: string): ItemDef {
  return BY_ID.get(id) ?? DEFS[0]
}

export function isItemId(v: unknown): v is string {
  return typeof v === 'string' && BY_ID.has(v)
}

// The protocol's reducer needs to know which definitions are vessels and which
// are food. It cannot import this file (it must stay loadable by the Node
// server with no client deps), so the rules are handed to it instead.
export const ITEM_RULES = {
  capacity: (defId: string) => BY_ID.get(defId)?.capacity,
  isEdible: (defId: string) => BY_ID.get(defId)?.edible === true,
}

/** How full a vessel reads as, 0..1, for drawing the liquid inside it. */
export function fillRatio(def: ItemDef, fill: number | undefined): number {
  if (!def.capacity || !fill) return 0
  return Math.max(0, Math.min(1, fill / def.capacity))
}
