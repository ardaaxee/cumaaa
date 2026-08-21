import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Achievement,
  ActivityEntry,
  ActivityKind,
  GraphicsQuality,
  InteractableInfo,
  InteractableKind,
  Note,
  NoteCategory,
  Profile,
  Project,
  ProjectStatus,
  Settings,
  Task,
} from '../types'
import { uid } from '../utils/uid'
import { detectQuality } from '../utils/device'

const STORAGE_KEY = 'cuma-room-v1'

// --- Achievement catalogue -------------------------------------------------

const ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  { id: 'first-project', title: 'First Project', description: 'Create your first project.' },
  { id: 'first-task', title: 'First Task', description: 'Add your first task to the board.' },
  { id: 'ten-tasks', title: '10 Tasks', description: 'Complete 10 tasks.' },
  { id: 'first-note', title: 'First Note', description: 'Write your first archive note.' },
  { id: 'secret', title: 'Room Builder', description: 'Discover the hidden private room.' },
  { id: 'ai-chat', title: 'Signal Sent', description: 'Talk to ARDA AI.' },
  { id: 'project-master', title: 'Project Master', description: 'Have 5 or more projects.' },
  { id: 'explorer', title: 'Explorer', description: 'Interact with every object in the room.' },
]

function seedAchievements(): Achievement[] {
  return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: false }))
}

// --- Default seed content --------------------------------------------------

function seedProjects(): Project[] {
  const now = Date.now()
  return [
    {
      id: uid(),
      name: 'ARDA ROOM',
      description: 'The interactive 3D personal digital space you are standing in.',
      status: 'active',
      progress: 72,
      technologies: ['React', 'Three.js', 'TypeScript'],
      createdAt: now - 1000 * 60 * 60 * 24 * 6,
    },
    {
      id: uid(),
      name: 'Instagram Site',
      description: 'A content-driven site for a personal brand.',
      status: 'planning',
      progress: 15,
      technologies: ['Next.js', 'Tailwind'],
      createdAt: now - 1000 * 60 * 60 * 24 * 3,
    },
    {
      id: uid(),
      name: 'Android Project',
      description: 'A native companion app.',
      status: 'paused',
      progress: 40,
      technologies: ['Kotlin', 'Jetpack Compose'],
      createdAt: now - 1000 * 60 * 60 * 24 * 12,
    },
    {
      id: uid(),
      name: 'AI Project',
      description: 'Experiments with local and hosted models.',
      status: 'active',
      progress: 55,
      technologies: ['Python', 'FastAPI'],
      createdAt: now - 1000 * 60 * 60 * 24 * 1,
    },
    {
      id: uid(),
      name: 'Web Projects',
      description: 'A collection of smaller experiments and client work.',
      status: 'active',
      progress: 30,
      technologies: ['React', 'Vite'],
      createdAt: now - 1000 * 60 * 60 * 24 * 8,
    },
  ]
}

function seedTasks(): Task[] {
  const now = Date.now()
  return [
    { id: uid(), title: 'Develop ARDA ROOM', done: false, createdAt: now },
    { id: uid(), title: 'Create a new project', done: false, createdAt: now },
    { id: uid(), title: 'Finish the design pass', done: true, createdAt: now - 5000, completedAt: now - 4000 },
  ]
}

function seedNotes(): Note[] {
  return [
    {
      id: uid(),
      title: 'Welcome',
      body: 'This archive keeps notes, ideas and memories. Everything is stored locally.',
      category: 'note',
      createdAt: Date.now(),
    },
  ]
}

const DEFAULT_SETTINGS: Settings = {
  qualityMode: 'auto',
  quality: 'medium',
  sensitivity: 1,
  touchSensitivity: 1,
  soundEnabled: true,
  volume: 0.5,
  sfxVolume: 0.8,
  ambientVolume: 0.6,
  bloom: true,
  showPlayerNames: true,
  showMiniMap: true,
  chatNotifications: true,
  reducedMotion: false,
}

const DEFAULT_PROFILE: Profile = {
  name: 'CUMA',
  username: 'cuma',
  about: 'Building things in a small digital room.',
  favoriteProject: 'ARDA ROOM',
  currentGoal: 'Ship something real.',
}

// --- Store shape -----------------------------------------------------------

interface RoomState {
  // persisted
  projects: Project[]
  tasks: Task[]
  notes: Note[]
  achievements: Achievement[]
  settings: Settings
  profile: Profile
  introDone: boolean
  lastVisit: number
  secretUnlocked: boolean
  activity: ActivityEntry[]
  visited: InteractableKind[]
  currentProjectId: string | null

  // ephemeral (not persisted)
  hydrated: boolean
  activePanel: InteractableInfo['kind'] | null
  focusInteractable: InteractableInfo | null
  toast: { id: string; text: string; tone: 'info' | 'success' } | null
  welcomeBack: boolean

  // actions
  markHydrated: () => void
  setActivePanel: (kind: InteractableInfo['kind'] | null) => void
  setFocus: (info: InteractableInfo | null) => void
  pushToast: (text: string, tone?: 'info' | 'success') => void
  clearToast: () => void
  dismissWelcome: () => void

  addProject: (input: Omit<Project, 'id' | 'createdAt'>) => void
  updateProject: (id: string, patch: Partial<Project>) => void
  removeProject: (id: string) => void
  setCurrentProject: (id: string | null) => void

  addTask: (title: string) => void
  toggleTask: (id: string) => void
  removeTask: (id: string) => void

  addNote: (input: { title: string; body: string; category: NoteCategory }) => void
  removeNote: (id: string) => void

  unlockAchievement: (id: string) => void
  unlockSecret: () => void
  pushActivity: (kind: ActivityKind, text: string) => void
  markVisited: (kind: InteractableKind) => void

  setSettings: (patch: Partial<Settings>) => void
  setProfile: (patch: Partial<Profile>) => void
  finishIntro: () => void
  resetAll: () => void
}

export const useRoomStore = create<RoomState>()(
  persist(
    (set, get) => ({
      projects: seedProjects(),
      tasks: seedTasks(),
      notes: seedNotes(),
      achievements: seedAchievements(),
      settings: DEFAULT_SETTINGS,
      profile: DEFAULT_PROFILE,
      introDone: false,
      lastVisit: Date.now(),
      secretUnlocked: false,
      activity: [],
      visited: [],
      currentProjectId: null,

      hydrated: false,
      activePanel: null,
      focusInteractable: null,
      toast: null,
      welcomeBack: false,

      markHydrated: () => set({ hydrated: true }),
      setActivePanel: (kind) => set({ activePanel: kind }),
      setFocus: (info) => set({ focusInteractable: info }),
      pushToast: (text, tone = 'info') => set({ toast: { id: uid(), text, tone } }),
      clearToast: () => set({ toast: null }),
      dismissWelcome: () => set({ welcomeBack: false }),

      addProject: (input) => {
        const project: Project = { ...input, id: uid(), createdAt: Date.now() }
        set((s) => ({ projects: [project, ...s.projects] }))
        get().unlockAchievement('first-project')
        if (get().projects.length >= 5) get().unlockAchievement('project-master')
        get().pushActivity('project', `Created project “${project.name}”`)
        get().pushToast(`Project added: ${project.name}`, 'success')
      },
      updateProject: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      removeProject: (id) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          currentProjectId: s.currentProjectId === id ? null : s.currentProjectId,
        })),
      setCurrentProject: (id) => {
        set({ currentProjectId: id })
        const p = get().projects.find((x) => x.id === id)
        if (p) get().pushToast(`Current project: ${p.name}`)
      },

      addTask: (title) => {
        const trimmed = title.trim()
        if (!trimmed) return
        const task: Task = { id: uid(), title: trimmed, done: false, createdAt: Date.now() }
        set((s) => ({ tasks: [...s.tasks, task] }))
        get().unlockAchievement('first-task')
        get().pushActivity('task', `Added task “${trimmed}”`)
      },
      toggleTask: (id) => {
        const before = get().tasks.find((t) => t.id === id)
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, done: !t.done, completedAt: !t.done ? Date.now() : undefined }
              : t,
          ),
        }))
        if (before && !before.done) {
          get().pushActivity('task', `Completed task “${before.title}”`)
        }
        const completed = get().tasks.filter((t) => t.done).length
        if (completed >= 10) get().unlockAchievement('ten-tasks')
      },
      removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      addNote: (input) => {
        const note: Note = {
          id: uid(),
          title: input.title.trim() || 'Untitled',
          body: input.body.trim(),
          category: input.category,
          createdAt: Date.now(),
        }
        set((s) => ({ notes: [note, ...s.notes] }))
        get().unlockAchievement('first-note')
        get().pushActivity('note', `Added note “${note.title}”`)
      },
      removeNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      unlockAchievement: (id) => {
        const existing = get().achievements.find((a) => a.id === id)
        if (!existing || existing.unlocked) return
        set((s) => ({
          achievements: s.achievements.map((a) =>
            a.id === id ? { ...a, unlocked: true, unlockedAt: Date.now() } : a,
          ),
        }))
        get().pushActivity('achievement', `Unlocked “${existing.title}”`)
        get().pushToast(`Achievement unlocked: ${existing.title}`, 'success')
      },
      unlockSecret: () => {
        if (get().secretUnlocked) return
        set({ secretUnlocked: true })
        get().pushActivity('secret', 'Discovered the private room')
        get().unlockAchievement('secret')
      },
      pushActivity: (kind, text) =>
        set((s) => ({
          activity: [{ id: uid(), kind, text, at: Date.now() }, ...s.activity].slice(0, 40),
        })),
      markVisited: (kind) => {
        if (get().visited.includes(kind)) return
        const next = [...get().visited, kind]
        set({ visited: next })
        // Explorer: interacted with every core object in the room.
        const required: InteractableKind[] = [
          'pc',
          'taskboard',
          'archive',
          'music',
          'window',
          'bed',
          'achievements',
        ]
        if (required.every((k) => next.includes(k))) {
          get().unlockAchievement('explorer')
        }
      },

      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      setProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
      finishIntro: () => set({ introDone: true }),

      resetAll: () =>
        set({
          projects: seedProjects(),
          tasks: seedTasks(),
          notes: seedNotes(),
          achievements: seedAchievements(),
          settings: { ...DEFAULT_SETTINGS, quality: detectQuality() },
          profile: DEFAULT_PROFILE,
          introDone: false,
          secretUnlocked: false,
          activity: [],
          visited: [],
          currentProjectId: null,
          activePanel: null,
          toast: null,
        }),
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      // v1 saves predate the extra settings (quality mode, split volumes, HUD
      // toggles). Persisted objects REPLACE the defaults wholesale, so a save
      // from v1 would otherwise arrive with those keys missing entirely.
      migrate: (persisted, from) => {
        const state = persisted as Partial<RoomState> | undefined
        if (!state) return persisted as RoomState
        if (from < 2) {
          const old = (state.settings ?? {}) as Partial<Settings>
          state.settings = {
            ...DEFAULT_SETTINGS,
            ...old,
            // Someone who had picked a tier keeps it as an explicit choice
            // rather than being silently switched to AUTO.
            qualityMode: old.quality ?? DEFAULT_SETTINGS.qualityMode,
          }
        }
        return state as RoomState
      },
      partialize: (s) => ({
        projects: s.projects,
        tasks: s.tasks,
        notes: s.notes,
        achievements: s.achievements,
        settings: s.settings,
        profile: s.profile,
        introDone: s.introDone,
        lastVisit: s.lastVisit,
        secretUnlocked: s.secretUnlocked,
        activity: s.activity,
        visited: s.visited,
        currentProjectId: s.currentProjectId,
      }),
      onRehydrateStorage: () => (state) => {
        // Runs after persisted state is merged in.
        if (!state) return
        const now = Date.now()
        const away = now - (state.lastVisit || now)
        // "Welcome back" if away for more than 12 hours.
        const showWelcome = state.introDone && away > 1000 * 60 * 60 * 12
        state.welcomeBack = showWelcome
        state.lastVisit = now
        // First-run devices get an auto quality tier.
        if (!localStorage.getItem(STORAGE_KEY + '-quality-init')) {
          state.settings = { ...state.settings, quality: detectQuality() as GraphicsQuality }
          localStorage.setItem(STORAGE_KEY + '-quality-init', '1')
        }
        state.settings = { ...DEFAULT_SETTINGS, ...state.settings }
        state.markHydrated()
      },
    },
  ),
)

// Convenience selectors -----------------------------------------------------

export const selectCompletedTaskCount = (s: RoomState) =>
  s.tasks.filter((t) => t.done).length

export function statusLabel(status: ProjectStatus): string {
  switch (status) {
    case 'planning':
      return 'Planning'
    case 'active':
      return 'Active'
    case 'paused':
      return 'Paused'
    case 'done':
      return 'Done'
  }
}
