import type { Achievement, ActivityEntry, Project } from '../types'

// Deterministic derivations that turn the LIVE store data into the physical
// "memory objects" placed around the room. Nothing here is persisted on its own
// — the room is rebuilt from projects/tasks/notes/achievements every load, so
// the stores stay the single source of truth (create → object appears, delete →
// object disappears, no duplication).

export const RECENT_PROJECT_LIMIT = 5

// Newest projects live on the shelf; older ones roll into an "archive box".
export function recentProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => b.createdAt - a.createdAt).slice(0, RECENT_PROJECT_LIMIT)
}

export function archivedProjectCount(projects: Project[]): number {
  return Math.max(0, projects.length - RECENT_PROJECT_LIMIT)
}

// The desk's "current project": the explicitly chosen one, else the most
// advanced active project, else the newest project.
export function resolveCurrentProject(
  projects: Project[],
  currentProjectId: string | null,
): Project | null {
  const explicit = currentProjectId ? projects.find((p) => p.id === currentProjectId) : undefined
  if (explicit) return explicit
  const active = projects.filter((p) => p.status === 'active').sort((a, b) => b.progress - a.progress)
  return active[0] ?? projects[0] ?? null
}

export function unlockedAchievements(achievements: Achievement[]): Achievement[] {
  return achievements.filter((a) => a.unlocked)
}

// 0 = none, 1 = a few, 2 = half, 3 = most/all — drives how many desk trophies show.
export function trophyTier(achievements: Achievement[]): 0 | 1 | 2 | 3 {
  const total = achievements.length || 1
  const ratio = unlockedAchievements(achievements).length / total
  if (ratio <= 0) return 0
  if (ratio < 0.34) return 1
  if (ratio < 0.7) return 2
  return 3
}

// The ARDA ROOM milestone: the project literally named "ARDA ROOM" reaching
// 100% / done. Unlocks the special desk trophy.
export function ardaRoomComplete(projects: Project[]): boolean {
  return projects.some(
    (p) => /arda room/i.test(p.name) && (p.progress >= 100 || p.status === 'done'),
  )
}

export function recentActivity(activity: ActivityEntry[], n = 4): ActivityEntry[] {
  return activity.slice(0, n)
}

// A quiet "room level" (0..5) used only to reason about how furnished the room
// is — never shown to the user as an RPG stat.
export function roomLevel(input: {
  projects: Project[]
  achievements: Achievement[]
  activity: ActivityEntry[]
  hasCurrent: boolean
}): number {
  let lvl = 0
  if (input.projects.length > 0) lvl = 1
  if (unlockedAchievements(input.achievements).length > 0) lvl = 2
  if (input.hasCurrent) lvl = 3
  if (input.activity.length > 0) lvl = 4
  if (ardaRoomComplete(input.projects)) lvl = 5
  return lvl
}
