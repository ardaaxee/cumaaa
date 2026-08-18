import { useRoomStore } from '../store/useRoomStore'

// ARDA AI — works fully offline with a deterministic fallback engine that
// answers from the user's own room data. If a backend proxy URL is configured
// (VITE_AI_PROXY_URL), requests are POSTed there instead. The frontend NEVER
// embeds a provider API key — the proxy is the only network target.

const PROXY_URL = import.meta.env.VITE_AI_PROXY_URL as string | undefined

export interface AiReply {
  text: string
  source: 'proxy' | 'local'
}

export async function askAi(prompt: string): Promise<AiReply> {
  const clean = prompt.trim()
  if (!clean) return { text: 'Ask me anything about your room, tasks or projects.', source: 'local' }

  if (PROXY_URL) {
    try {
      const res = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: clean }),
      })
      if (res.ok) {
        const data = (await res.json()) as { text?: string; reply?: string }
        const text = data.text ?? data.reply
        if (text) return { text, source: 'proxy' }
      }
    } catch {
      // Fall through to the local engine on any network error.
    }
  }

  return { text: localAnswer(clean), source: 'local' }
}

// A small rule-based assistant grounded in the store's live data.
function localAnswer(prompt: string): string {
  const q = prompt.toLowerCase()
  const s = useRoomStore.getState()

  if (/(merhaba|selam|hello|hi|hey)\b/.test(q)) {
    return `Hi ${s.profile.name}. I'm ARDA AI. Ask me about your tasks, projects, notes or achievements.`
  }

  if (q.includes('task') || q.includes('görev') || q.includes('todo')) {
    const open = s.tasks.filter((t) => !t.done)
    const done = s.tasks.filter((t) => t.done)
    if (open.length === 0) return `All ${done.length} tasks are done. Clean board — add a new one from the task board.`
    const list = open.slice(0, 5).map((t) => `• ${t.title}`).join('\n')
    return `You have ${open.length} open task(s):\n${list}${open.length > 5 ? '\n…' : ''}`
  }

  if (q.includes('project') || q.includes('proje')) {
    const list = s.projects
      .slice(0, 5)
      .map((p) => `• ${p.name} — ${p.progress}% (${p.status})`)
      .join('\n')
    return `You have ${s.projects.length} project(s):\n${list}`
  }

  if (q.includes('note') || q.includes('not')) {
    return `Your archive holds ${s.notes.length} note(s). Open the bookcase archive to read or add more.`
  }

  if (q.includes('achievement') || q.includes('rozet') || q.includes('başarı')) {
    const unlocked = s.achievements.filter((a) => a.unlocked).length
    return `Achievements: ${unlocked}/${s.achievements.length} unlocked. Keep exploring the room to find the rest.`
  }

  if (q.includes('secret') || q.includes('gizli') || q.includes('private')) {
    return `There is a hidden room. Look closely at the bookcase for a panel that doesn't belong — click it.`
  }

  if (q.includes('time') || q.includes('saat') || q.includes('clock')) {
    const d = new Date()
    return `Local time is ${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}. The window outside follows your real clock.`
  }

  if (q.includes('help') || q.includes('yardım') || q.includes('what can you')) {
    return 'I can summarise your tasks, projects, notes and achievements, tell the time, and hint at secrets. Try: "show my tasks".'
  }

  // Generic reflective fallback.
  return `Noted: "${prompt}". I'm running in offline mode, so I answer from your room data. Ask about tasks, projects, notes, achievements or the time.`
}

export const aiIsProxyBacked = Boolean(PROXY_URL)
