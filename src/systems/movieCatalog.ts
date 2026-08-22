// The Movie Night catalog. No copyrighted video is bundled — entries point at
// local files under public/media/. If a file is missing, the TV shows a
// cinematic placeholder instead of failing. Drop your own .mp4s in and add them
// here (or replace these ids). Kept tiny and offline-friendly.

export interface MovieEntry {
  id: string
  title: string
  src: string // relative to the site root (public/)
}

export const MOVIE_CATALOG: MovieEntry[] = [
  { id: 'demo-1', title: 'Evening In', src: '/media/demo-1.mp4' },
  { id: 'demo-2', title: 'City Lights', src: '/media/demo-2.mp4' },
  { id: 'demo-3', title: 'Slow Sunday', src: '/media/demo-3.mp4' },
]

export function movieById(id: string | null): MovieEntry | null {
  if (!id) return null
  return MOVIE_CATALOG.find((m) => m.id === id) ?? null
}
