import { create } from 'zustand'
import { authProvider, AuthError, type AuthCapabilities, type AuthUser, type PasswordCredentials } from './index'

export type AuthStatus = 'unknown' | 'signed-out' | 'signing-in' | 'signed-in'

interface AuthState {
  status: AuthStatus
  user: AuthUser | null
  error: string | null
  capabilities: AuthCapabilities

  restore: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithPassword: (creds: PasswordCredentials) => Promise<void>
  registerWithPassword: (creds: PasswordCredentials) => Promise<void>
  continueAsGuest: (displayName: string) => Promise<void>
  updateProfile: (patch: Partial<Pick<AuthUser, 'displayName' | 'avatar'>>) => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

function message(e: unknown): string {
  if (e instanceof AuthError) return e.message
  return 'Something went wrong signing in.'
}

export const useAuthStore = create<AuthState>((set) => {
  // Every entry point funnels through here so status/error handling can't drift
  // between the five sign-in paths.
  const run = async (fn: () => Promise<AuthUser>) => {
    set({ status: 'signing-in', error: null })
    try {
      const user = await fn()
      set({ status: 'signed-in', user, error: null })
    } catch (e) {
      set({ status: 'signed-out', user: null, error: message(e) })
    }
  }

  return {
    status: 'unknown',
    user: null,
    error: null,
    capabilities: authProvider().capabilities(),

    restore: async () => {
      try {
        const session = await authProvider().restore()
        if (session) set({ status: 'signed-in', user: session.user })
        else set({ status: 'signed-out' })
      } catch {
        set({ status: 'signed-out' })
      }
    },
    signInWithGoogle: () => run(async () => (await authProvider().signInWithGoogle()).user),
    signInWithPassword: (creds) => run(async () => (await authProvider().signInWithPassword(creds)).user),
    registerWithPassword: (creds) => run(async () => (await authProvider().registerWithPassword(creds)).user),
    continueAsGuest: (displayName) => run(async () => (await authProvider().signInAsGuest(displayName)).user),

    updateProfile: async (patch) => {
      try {
        const user = await authProvider().updateProfile(patch)
        set({ user, error: null })
      } catch (e) {
        set({ error: message(e) })
      }
    },
    signOut: async () => {
      await authProvider().signOut()
      set({ status: 'signed-out', user: null, error: null })
    },
    clearError: () => set({ error: null }),
  }
})
