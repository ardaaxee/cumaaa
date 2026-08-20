// Shared domain types for CUMA ROOM.

export type ProjectStatus = 'planning' | 'active' | 'paused' | 'done'

export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  progress: number // 0..100
  technologies: string[]
  createdAt: number
}

export interface Task {
  id: string
  title: string
  done: boolean
  createdAt: number
  completedAt?: number
}

export type NoteCategory = 'note' | 'idea' | 'memory' | 'private'

export interface Note {
  id: string
  title: string
  body: string
  category: NoteCategory
  createdAt: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  unlocked: boolean
  unlockedAt?: number
}

export type GraphicsQuality = 'low' | 'medium' | 'high' | 'ultra'

export interface Settings {
  quality: GraphicsQuality
  sensitivity: number // 0.2 .. 2.5
  soundEnabled: boolean
  volume: number // 0..1
  bloom: boolean
}

export interface Profile {
  name: string
  username: string
  about: string
  favoriteProject: string
  currentGoal: string
}

export type ActivityKind =
  | 'project'
  | 'task'
  | 'note'
  | 'achievement'
  | 'secret'
  | 'ai'

export interface ActivityEntry {
  id: string
  kind: ActivityKind
  text: string
  at: number
}

export type TimeOfDay = 'day' | 'sunset' | 'night'

export interface PersistedState {
  projects: Project[]
  tasks: Task[]
  notes: Note[]
  achievements: Achievement[]
  settings: Settings
  profile: Profile
  introDone: boolean
  lastVisit: number
}

// A world-space interactable descriptor used by the interaction system.
export type InteractableKind =
  | 'pc'
  | 'taskboard'
  | 'archive'
  | 'music'
  | 'window'
  | 'bed'
  | 'secret'
  | 'achievements'
  | 'door'
  | 'chairSit'
  // Synced world toggles (co-op)
  | 'doorToggle'
  | 'lightToggle'
  | 'tvToggle'
  // Movie night / social (co-op)
  | 'sofaSit'
  | 'snackTake'
  | 'movieNight'
  // Personalization / memory objects in the main room
  | 'currentProject'
  | 'projectArchive'
  | 'activityWall'
  // ARDA LAB stations (the hidden second room)
  | 'labHologram'
  | 'labTerminal'
  | 'labAi'
  | 'labCore'
  | 'labIdeas'
  | 'labAchievements'
  | 'labFuture'
  | 'labExit'

export interface InteractableInfo {
  id: string
  kind: InteractableKind
  label: string
  prompt: string
}
