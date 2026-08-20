// Auth contracts. Deliberately transport-agnostic: the app only ever talks to
// an AuthProvider, so swapping the demo provider for a real backend later is a
// configuration change, not a rewrite.

export type AuthMethod = 'google' | 'password' | 'guest'

export interface AuthUser {
  id: string
  displayName: string
  username: string
  email: string | null
  avatar: string | null // emoji or data URI — never a remote URL we can't reach
  method: AuthMethod
  createdAt: number
}

export interface Session {
  user: AuthUser
  // Present only for a real backend. Kept in memory (and sessionStorage) — never
  // in localStorage, so it cannot outlive the tab or leak into a shared device.
  accessToken: string | null
  expiresAt: number | null
}

// What the configured provider can actually do. The UI reads this instead of
// guessing, so a button is never shown for something that would fail.
export interface AuthCapabilities {
  google: boolean
  password: boolean
  guest: boolean
  // True when sign-in is satisfied locally with no server verifying anything.
  // The UI MUST surface this to the user rather than implying a real account.
  demo: boolean
  reason: string | null // why google/password are unavailable, if they are
}

export type AuthErrorCode =
  | 'NOT_CONFIGURED'
  | 'INVALID_CREDENTIALS'
  | 'NETWORK'
  | 'CANCELLED'
  | 'INVALID_INPUT'

export class AuthError extends Error {
  code: AuthErrorCode
  constructor(code: AuthErrorCode, message: string) {
    super(message)
    this.code = code
    this.name = 'AuthError'
  }
}

export interface PasswordCredentials {
  email: string
  password: string
  displayName?: string // only used when registering
}

export interface AuthProvider {
  readonly id: string
  capabilities(): AuthCapabilities
  /** Restore a session from storage on boot, or null. */
  restore(): Promise<Session | null>
  signInWithGoogle(): Promise<Session>
  signInWithPassword(creds: PasswordCredentials): Promise<Session>
  registerWithPassword(creds: PasswordCredentials): Promise<Session>
  signInAsGuest(displayName: string): Promise<Session>
  signOut(): Promise<void>
  /** Push profile edits (display name / avatar) to wherever they live. */
  updateProfile(patch: Partial<Pick<AuthUser, 'displayName' | 'avatar'>>): Promise<AuthUser>
}

// ---- shared validation (used by every provider) ---------------------------

export const DISPLAY_NAME_MAX = 16

export function validDisplayName(raw: string): string | null {
  const cleaned = raw.replace(/[^\p{L}\p{N} _\-.]/gu, '').trim().slice(0, DISPLAY_NAME_MAX)
  return cleaned.length >= 2 ? cleaned : null
}

export function validEmail(raw: string): string | null {
  const e = raw.trim().toLowerCase()
  if (e.length > 120) return null
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null
}

// Length only. Strength rules belong to the server that actually stores it —
// this check exists so the UI can fail fast, not to imply local security.
export function validPassword(raw: string): boolean {
  return typeof raw === 'string' && raw.length >= 8 && raw.length <= 200
}

export function usernameFrom(displayName: string, email: string | null): string {
  const base = (email ? email.split('@')[0] : displayName).toLowerCase()
  return base.replace(/[^a-z0-9_.-]/g, '').slice(0, 20) || 'player'
}
